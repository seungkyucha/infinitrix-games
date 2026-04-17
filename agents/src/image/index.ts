/**
 * Image generation facade.
 *
 * `IMAGE_PROVIDER=openai|gemini` selects the backend at runtime.
 * When unset we auto-pick the first provider whose API key is configured,
 * preferring OpenAI (native transparency, newer model).
 *
 * The exported functions keep the same signatures the cycle previously used,
 * so callers do not have to care which provider is active.
 */
import type { ImageProvider } from './types.js'
import { geminiProvider } from './providers/gemini.js'
import { openaiProvider } from './providers/openai.js'
import {
  generateGameAssets as pipelineGenerateGameAssets,
  generateThumbnailFromAssets as pipelineGenerateThumbnailFromAssets,
} from './pipeline.js'

export { parseAssetRequirements } from './parser.js'
export type { ArtDirection, AssetDef, ImageProvider } from './types.js'

const REGISTRY: Record<string, ImageProvider> = {
  gemini: geminiProvider,
  openai: openaiProvider,
}

/** Priority order when `IMAGE_PROVIDER` is unset. */
const AUTO_ORDER: ReadonlyArray<keyof typeof REGISTRY> = ['openai', 'gemini']

let cached: ImageProvider | null = null

/**
 * Returns the configured image provider, or null if none is available.
 * Memoized after first call.
 */
export function getImageProvider(): ImageProvider | null {
  if (cached) return cached

  const requested = (process.env.IMAGE_PROVIDER || '').toLowerCase().trim()
  if (requested) {
    const p = REGISTRY[requested]
    if (!p) {
      console.warn(`  ⚠️ [image] Unknown IMAGE_PROVIDER="${requested}". Known: ${Object.keys(REGISTRY).join(', ')}`)
      return null
    }
    if (!p.isAvailable()) {
      console.warn(`  ⚠️ [image] IMAGE_PROVIDER="${requested}" selected but its credentials are not set`)
      return null
    }
    cached = p
    console.log(`  🎨 [image] Using provider: ${p.name} (${p.modelTag})`)
    return p
  }

  for (const key of AUTO_ORDER) {
    const p = REGISTRY[key]
    if (p.isAvailable()) {
      cached = p
      console.log(`  🎨 [image] Auto-selected provider: ${p.name} (${p.modelTag})`)
      return p
    }
  }
  return null
}

/** True if any image provider is available. */
export function isImageGenerationAvailable(): boolean {
  return getImageProvider() !== null
}

export async function generateGameAssets(
  gameId: string,
  gameTitle: string,
  genre: string,
  specContent: string,
  assetsDir: string,
): Promise<{ generated: string[]; failed: string[] }> {
  const provider = getImageProvider()
  if (!provider) {
    console.log(`  ⚠️ [image] No provider available — skipping`)
    return { generated: [], failed: [] }
  }
  return pipelineGenerateGameAssets(provider, gameId, gameTitle, genre, specContent, assetsDir)
}

export async function generateThumbnailFromAssets(
  gameId: string,
  gameTitle: string,
  genre: string,
  assetsDir: string,
): Promise<boolean> {
  const provider = getImageProvider()
  if (!provider) return false
  return pipelineGenerateThumbnailFromAssets(provider, gameId, gameTitle, genre, assetsDir)
}
