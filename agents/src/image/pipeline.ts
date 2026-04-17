/**
 * Provider-neutral asset generation pipeline.
 *
 * Flow:
 *   parseAssetRequirements → buildPrompt (per asset) → provider.generate
 *                          → [chromakey if provider lacks native transparency]
 *                          → validate PNG → manifest.json
 *
 * Phase 1 renders base assets; phase 2 renders variations that reference a
 * previously-generated base image for character-consistency.
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'
import type { ArtDirection, AssetDef, ImageProvider } from './types.js'
import { parseAssetRequirements } from './parser.js'
import { buildPrompt, buildThumbnailCompositePrompt } from './prompts.js'
import { removeGreenBackground } from './chromakey.js'
import { verifyGeneratedAsset } from './verify.js'

interface GenResult {
  ok: boolean
  bytes: number
  filePath: string
}

async function generateOneImage(
  provider: ImageProvider,
  prompt: string,
  filePath: string,
  name: string,
  width: number,
  height: number,
  referenceImagePath: string | undefined,
  needsTransparency: boolean,
): Promise<GenResult> {
  const dir = dirname(filePath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const withRef = referenceImagePath && existsSync(referenceImagePath)
  const referenceImages = withRef ? [readFileSync(referenceImagePath!)] : undefined

  const tag = `[${provider.name}]`
  console.log(`  🎨 ${tag} Generating: ${name}${withRef ? ' (with reference)' : ''}...`)

  const result = await provider.generate({
    prompt,
    width,
    height,
    referenceImages,
    transparent: needsTransparency && provider.supportsNativeTransparency,
  })

  if (!result.ok || !result.pngBuffer) {
    console.log(`  ⚠️ ${tag} ${name}: ${result.error ?? 'unknown error'}`)
    return { ok: false, bytes: 0, filePath }
  }

  writeFileSync(filePath, result.pngBuffer)

  // Chromakey fallback only when provider can't do native transparency
  if (needsTransparency && !provider.supportsNativeTransparency) {
    try {
      await removeGreenBackground(filePath)
      const finalSize = readFileSync(filePath).length
      console.log(`  ✅ ${tag} ${name}: ${(finalSize / 1024).toFixed(0)}KB (transparent via chromakey)`)
      return { ok: true, bytes: finalSize, filePath }
    } catch {
      console.log(`  ⚠️ ${tag} ${name}: Chromakey failed, keeping original`)
    }
  }

  console.log(`  ✅ ${tag} ${name}: ${(result.pngBuffer.length / 1024).toFixed(0)}KB saved`)
  return { ok: true, bytes: result.pngBuffer.length, filePath }
}

function validateAsset(filePath: string, name: string): boolean {
  if (!existsSync(filePath)) {
    console.log(`  ❌ [Validate] ${name}: File not found`)
    return false
  }
  const buf = readFileSync(filePath)
  if (buf.length < 5000) {
    console.log(`  ❌ [Validate] ${name}: Too small (${buf.length}B) — likely corrupted`)
    return false
  }
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) {
    if (buf[0] !== 0xFF || buf[1] !== 0xD8) {
      console.log(`  ❌ [Validate] ${name}: Not a valid PNG/JPEG file`)
      return false
    }
  }
  console.log(`  ✓ [Validate] ${name}: OK (${(buf.length / 1024).toFixed(0)}KB)`)
  return true
}

export async function generateGameAssets(
  provider: ImageProvider,
  gameId: string,
  gameTitle: string,
  genre: string,
  specContent: string,
  assetsDir: string,
): Promise<{ generated: string[]; failed: string[] }> {
  const art = parseAssetRequirements(specContent)

  if (!art || art.assets.length === 0) {
    console.log(`  ⚠️ [${provider.name}] No asset-requirements in spec — using defaults`)
    const defaultArt: ArtDirection = {
      artStyle: `${genre} game, polished indie quality`,
      colorPalette: '', mood: 'atmospheric', reference: 'Steam indie quality',
      assets: [
        { id: 'player', desc: `Main player character for ${gameTitle}`, size: '512x512' },
        { id: 'enemy', desc: `Basic enemy for ${gameTitle}`, size: '512x512' },
        { id: 'bg-far', desc: 'Distant background — sky and horizon', size: '1920x1080' },
        { id: 'bg-mid', desc: 'Mid-ground — terrain silhouettes', size: '1920x1080' },
        { id: 'item-powerup', desc: 'Power-up collectible', size: '256x256' },
        { id: 'effect-hit', desc: 'Hit impact VFX', size: '512x512' },
        { id: 'ui-hp', desc: 'Health icon', size: '128x128' },
        { id: 'ui-score', desc: 'Score/currency icon', size: '128x128' },
        { id: 'thumbnail', desc: `Cover art with "${gameTitle}" title and main character`, size: '800x600' },
      ],
    }
    return runPipeline(provider, gameId, gameTitle, genre, defaultArt, assetsDir)
  }

  console.log(`  📋 [${provider.name}] Found ${art.assets.length} assets (style: ${art.artStyle})`)
  return runPipeline(provider, gameId, gameTitle, genre, art, assetsDir)
}

async function runPipeline(
  provider: ImageProvider,
  gameId: string,
  gameTitle: string,
  genre: string,
  art: ArtDirection,
  assetsDir: string,
): Promise<{ generated: string[]; failed: string[] }> {
  const generated: string[] = []
  const failed: string[] = []

  if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true })

  const baseAssets = art.assets.filter(a => !a.ref)
  const variationAssets = art.assets.filter(a => !!a.ref)

  const CONCURRENCY = 3
  const useChromaKey = !provider.supportsNativeTransparency

  async function verifyOk(filePath: string, w: number, h: number, transparent: boolean): Promise<boolean> {
    try {
      const v = await verifyGeneratedAsset(filePath, w, h, transparent)
      if (!v.ok) console.log(`  🔍 [Verify] ${filePath.split(/[\\/]/).pop()}: ${v.reasons.join('; ')}`)
      return v.ok
    } catch { return true }  // verification errors must not block the pipeline
  }

  async function generateOne(asset: AssetDef, refPath?: string) {
    const filePath = `${assetsDir}/${asset.id}.png`
    const hasRef = refPath ? existsSync(refPath) : false
    const built = buildPrompt({
      asset, art, gameTitle, genre,
      hasReference: hasRef && provider.supportsReferenceImages,
      useChromaKey,
    })
    const [w, h] = asset.size.split('x').map(Number)

    const result = await generateOneImage(
      provider, built.prompt, filePath, asset.id, w, h,
      hasRef && provider.supportsReferenceImages ? refPath : undefined,
      built.transparent,
    )

    if (result.ok && validateAsset(filePath, asset.id) && await verifyOk(filePath, w, h, built.transparent)) {
      generated.push(asset.id)
      return
    }

    console.log(`  🔄 [${provider.name}] Retrying ${asset.id} (verification/format failed)...`)
    await new Promise(r => setTimeout(r, 1000))
    const retry = await generateOneImage(
      provider, built.prompt, filePath, `${asset.id} (retry)`, w, h,
      hasRef && provider.supportsReferenceImages ? refPath : undefined,
      built.transparent,
    )
    if (retry.ok && validateAsset(filePath, asset.id) && await verifyOk(filePath, w, h, built.transparent)) {
      generated.push(asset.id)
    } else {
      failed.push(asset.id)
    }
  }

  async function generateBatch(assets: AssetDef[], getRef?: (a: AssetDef) => string | undefined) {
    for (let i = 0; i < assets.length; i += CONCURRENCY) {
      const batch = assets.slice(i, i + CONCURRENCY)
      await Promise.all(batch.map(a => generateOne(a, getRef?.(a))))
      if (i + CONCURRENCY < assets.length) await new Promise(r => setTimeout(r, 300))
    }
  }

  console.log(`  📦 Phase 1: ${baseAssets.length} base assets (${CONCURRENCY} parallel)`)
  await generateBatch(baseAssets)

  if (variationAssets.length > 0) {
    console.log(`  📦 Phase 2: ${variationAssets.length} variation assets (${CONCURRENCY} parallel)`)
    await generateBatch(variationAssets, (a) => `${assetsDir}/${a.ref}.png`)
  }

  const manifest = {
    gameId,
    generatedBy: provider.modelTag,
    provider: provider.name,
    artDirection: { style: art.artStyle, palette: art.colorPalette, mood: art.mood, reference: art.reference },
    format: 'png',
    assets: Object.fromEntries(
      art.assets.map(a => [
        a.id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
        { file: `${a.id}.png`, size: a.size, desc: a.desc, ref: a.ref || undefined },
      ])
    ),
  }
  writeFileSync(`${assetsDir}/manifest.json`, JSON.stringify(manifest, null, 2))
  console.log(`  📋 manifest.json saved (${generated.length}/${art.assets.length} generated)`)

  return { generated, failed }
}

/**
 * Compose a thumbnail.png by feeding existing game assets as references
 * into the active provider. Requires `supportsReferenceImages`.
 */
export async function generateThumbnailFromAssets(
  provider: ImageProvider,
  gameId: string,
  gameTitle: string,
  genre: string,
  assetsDir: string,
): Promise<boolean> {
  const thumbPath = `${assetsDir}/thumbnail.png`

  if (!provider.supportsReferenceImages) {
    console.log(`  ⚠️ [Thumbnail] Provider ${provider.name} does not support reference images`)
    return false
  }

  const candidates = ['player', 'bg-far', 'bg-mid', 'bg-layer1', 'bg-layer2', 'enemy', 'hero']
  const refBuffers: Buffer[] = []

  for (const name of candidates) {
    const png = `${assetsDir}/${name}.png`
    if (existsSync(png) && refBuffers.length < 3) {
      refBuffers.push(readFileSync(png))
    }
  }

  if (refBuffers.length === 0) {
    console.log(`  ⚠️ [Thumbnail] No reference assets found for ${gameId}`)
    return false
  }

  console.log(`  🖼️ [Thumbnail] Generating from ${refBuffers.length} game assets via ${provider.name}...`)

  const result = await provider.generate({
    prompt: buildThumbnailCompositePrompt(gameTitle, genre),
    width: 800,
    height: 600,
    referenceImages: refBuffers,
    transparent: false,
  })

  if (!result.ok || !result.pngBuffer) {
    console.log(`  ⚠️ [Thumbnail] ${result.error ?? 'no image'}`)
    return false
  }

  const dir = dirname(thumbPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(thumbPath, result.pngBuffer)
  console.log(`  ✅ [Thumbnail] ${(result.pngBuffer.length / 1024).toFixed(0)}KB saved (from game assets)`)
  return true
}
