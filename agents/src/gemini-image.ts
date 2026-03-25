/**
 * Gemini 3.1 Flash Image API — PNG 에셋 생성기
 * 플래너가 정의한 에셋 목록을 기반으로 동적 생성
 */
import { GoogleGenAI } from '@google/genai'
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'

const MODEL = 'gemini-3.1-flash-image-preview'

let client: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  if (!client) {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY not set')
    client = new GoogleGenAI({ apiKey: key })
  }
  return client
}

export interface AssetDef {
  id: string
  desc: string
  size: string // "512x512"
}

export interface ArtDirection {
  artStyle: string
  colorPalette: string
  mood: string
  reference: string
  assets: AssetDef[]
}

/**
 * 기획서에서 에셋 요구사항 YAML 블록 파싱
 */
export function parseAssetRequirements(specContent: string): ArtDirection | null {
  // Extract yaml block between ```yaml and ```
  const yamlMatch = specContent.match(/```yaml\s*\n#\s*asset-requirements\s*\n([\s\S]*?)```/)
  if (!yamlMatch) return null

  const yaml = yamlMatch[1]

  // Parse simple YAML fields
  const get = (key: string) => {
    const m = yaml.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, 'm'))
    return m?.[1]?.trim() ?? ''
  }

  const artStyle = get('art-style')
  const colorPalette = get('color-palette')
  const mood = get('mood')
  const reference = get('reference')

  // Parse assets list
  const assets: AssetDef[] = []
  const assetBlocks = yaml.split(/\n\s*-\s+id:\s*/).slice(1)
  for (const block of assetBlocks) {
    const idMatch = block.match(/^(\S+)/)
    const descMatch = block.match(/desc:\s*"([^"]+)"/)
    const sizeMatch = block.match(/size:\s*"?(\d+x\d+)"?/)
    if (idMatch) {
      assets.push({
        id: idMatch[1].trim(),
        desc: descMatch?.[1]?.trim() ?? idMatch[1].trim(),
        size: sizeMatch?.[1]?.trim() ?? '512x512',
      })
    }
  }

  if (assets.length === 0) return null
  return { artStyle, colorPalette, mood, reference, assets }
}

/**
 * 단일 PNG 이미지 생성
 */
async function generateImage(prompt: string, filePath: string, name: string): Promise<boolean> {
  try {
    const ai = getClient()
    const dir = dirname(filePath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    console.log(`  🎨 [Gemini] Generating: ${name}...`)

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseModalities: ['Text', 'Image'] },
    })

    if (response.candidates && response.candidates[0]) {
      for (const part of response.candidates[0].content?.parts || []) {
        if (part.inlineData) {
          const buf = Buffer.from(part.inlineData.data!, 'base64')
          writeFileSync(filePath, buf)
          console.log(`  ✅ [Gemini] Saved: ${name} (${(buf.length / 1024).toFixed(1)}KB)`)
          return true
        }
      }
    }

    console.log(`  ⚠️ [Gemini] No image in response for ${name}`)
    return false
  } catch (err) {
    console.error(`  ❌ [Gemini] Failed ${name}:`, (err as Error).message)
    return false
  }
}

/**
 * 프롬프트 빌더 — 에셋 정의 + 아트 디렉션을 Gemini 프롬프트로 변환
 */
function buildPrompt(asset: AssetDef, art: ArtDirection, gameTitle: string, genre: string): string {
  const [w, h] = asset.size.split('x').map(Number)
  const isBackground = asset.id.startsWith('bg-') || asset.id.includes('background')
  const isEffect = asset.id.startsWith('effect-')
  const isUI = asset.id.startsWith('ui-')
  const isThumbnail = asset.id === 'thumbnail'
  const isCharacter = asset.id.includes('player') || asset.id.includes('enemy') ||
                      asset.id.includes('boss') || asset.id.includes('npc') ||
                      asset.id.includes('character')

  const qualityDirective = `QUALITY STANDARD: Professional Steam indie game / polished mobile game level.
Art style: ${art.artStyle || 'stylized digital art, hand-painted feel'}.
Color palette: ${art.colorPalette || 'rich and intentional, limited but vibrant'}.
Mood: ${art.mood || 'dramatic and atmospheric'}.
Reference: ${art.reference || 'Hollow Knight, Dead Cells, Celeste quality level'}.
Lighting: Dramatic rim lighting, ambient occlusion, professional color grading.
Detail: Texture visible — fabric, metal, wood, magical glow, atmospheric haze.
NOT flat vector, NOT clipart, NOT stock photo, NOT AI-slop generic look.`

  if (isThumbnail) {
    return `Professional game store key art / thumbnail for "${gameTitle}" (${genre}).
${qualityDirective}
Subject: ${asset.desc}
Composition: Dynamic scene with rule-of-thirds. Main character prominent.
Typography: Game title "${gameTitle}" in stylish, genre-appropriate lettering — integrated into composition.
Technical: ${w}x${h} pixels. Landscape. Marketing-quality.
Must include: game title text, main character, atmospheric game scene.`
  }

  if (isBackground) {
    return `Professional game background layer for "${gameTitle}" (${genre}).
${qualityDirective}
Layer description: ${asset.desc}
Rendering: Painterly style, atmospheric perspective, volumetric lighting.
Composition: Parallax-scrolling ready. Rich environmental storytelling.
Technical: ${w}x${h} pixels. No characters, no text, no UI.`
  }

  if (isEffect) {
    return `Professional game VFX/effect for "${gameTitle}" (${genre}).
${qualityDirective}
Effect: ${asset.desc}
Rendering: HDR bloom, energy tendrils, particle scatter. Bright core fading outward.
Technical: ${w}x${h} pixels, centered, on solid dark (#0a0a1a) background.
Do NOT include: text, characters, UI.`
  }

  if (isUI) {
    return `Professional game UI icon for "${gameTitle}" (${genre}).
${qualityDirective}
Icon: ${asset.desc}
Rendering: Glossy 3D-rendered look, specular highlight, subtle glow, drop shadow.
Technical: ${w}x${h} pixels, centered, on solid dark (#0a0a1a) background.
Premium mobile game UI quality. Do NOT include: text, numbers, frames.`
  }

  if (isCharacter) {
    return `Professional game character/entity sprite for "${gameTitle}" (${genre}).
${qualityDirective}
Character: ${asset.desc}
Design: Distinctive silhouette, personality visible through pose and proportions.
Rendering: Rich shading with multiple light sources (key, fill, rim). Semi-realistic or stylized.
Details: Costume, accessories, implied motion, expressive features.
Technical: ${w}x${h} pixels, centered, on solid dark (#0a0a1a) background.
Do NOT include: text, UI, borders, multiple characters.`
  }

  // Generic item/object
  return `Professional game asset for "${gameTitle}" (${genre}).
${qualityDirective}
Asset: ${asset.desc}
Rendering: Polished, game-ready quality. Consistent with overall art direction.
Technical: ${w}x${h} pixels, centered, on solid dark (#0a0a1a) background.
Do NOT include: text, UI elements.`
}

/**
 * 기획서 기반 게임 에셋 일괄 생성
 */
export async function generateGameAssets(
  gameId: string,
  gameTitle: string,
  genre: string,
  specContent: string,
  assetsDir: string,
): Promise<{ generated: string[]; failed: string[] }> {
  const generated: string[] = []
  const failed: string[] = []

  // 기획서에서 에셋 요구사항 파싱
  const art = parseAssetRequirements(specContent)

  if (!art || art.assets.length === 0) {
    console.log(`  ⚠️ [Gemini] 기획서에 에셋 요구사항(asset-requirements) 없음 — 기본 에셋 생성`)
    // 기본 에셋 폴백
    const defaultArt: ArtDirection = {
      artStyle: `${genre} game, polished indie quality`,
      colorPalette: '',
      mood: 'atmospheric and engaging',
      reference: 'Steam indie game quality',
      assets: [
        { id: 'player', desc: `Main player character for ${gameTitle}`, size: '512x512' },
        { id: 'enemy', desc: `Basic enemy for ${gameTitle}`, size: '512x512' },
        { id: 'bg-far', desc: 'Distant background — sky and horizon', size: '1920x1080' },
        { id: 'bg-mid', desc: 'Mid-ground background — terrain silhouettes', size: '1920x1080' },
        { id: 'item-powerup', desc: 'Power-up collectible item', size: '256x256' },
        { id: 'effect-hit', desc: 'Hit/impact visual effect', size: '512x512' },
        { id: 'ui-hp', desc: 'Health indicator icon', size: '128x128' },
        { id: 'ui-score', desc: 'Score/currency icon', size: '128x128' },
        { id: 'thumbnail', desc: `Game cover art with title "${gameTitle}" and main character`, size: '800x600' },
      ],
    }
    return generateFromArtDirection(gameId, gameTitle, genre, defaultArt, assetsDir)
  }

  console.log(`  📋 [Gemini] 기획서 에셋 ${art.assets.length}개 발견 (style: ${art.artStyle})`)
  return generateFromArtDirection(gameId, gameTitle, genre, art, assetsDir)
}

async function generateFromArtDirection(
  gameId: string,
  gameTitle: string,
  genre: string,
  art: ArtDirection,
  assetsDir: string,
): Promise<{ generated: string[]; failed: string[] }> {
  const generated: string[] = []
  const failed: string[] = []

  if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true })

  for (const asset of art.assets) {
    const filePath = `${assetsDir}/${asset.id}.png`
    const prompt = buildPrompt(asset, art, gameTitle, genre)
    const ok = await generateImage(prompt, filePath, asset.id)
    if (ok) generated.push(asset.id)
    else failed.push(asset.id)
    // Rate limit
    await new Promise(r => setTimeout(r, 600))
  }

  // manifest.json 생성
  const manifest = {
    gameId,
    generatedBy: 'gemini-flash-image',
    artDirection: {
      style: art.artStyle,
      palette: art.colorPalette,
      mood: art.mood,
      reference: art.reference,
    },
    format: 'png',
    assets: Object.fromEntries(
      art.assets.map(a => [
        a.id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
        { file: `${a.id}.png`, size: a.size, desc: a.desc },
      ])
    ),
  }
  writeFileSync(`${assetsDir}/manifest.json`, JSON.stringify(manifest, null, 2))
  console.log(`  📋 manifest.json saved (${art.assets.length} assets)`)

  return { generated, failed }
}
