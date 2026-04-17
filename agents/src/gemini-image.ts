/**
 * Back-compat shim.
 *
 * The image generation stack moved to ./image/ with provider abstraction
 * (Gemini, OpenAI, future…). This file re-exports the same API so any
 * stragglers that still import from './gemini-image.js' keep working.
 * New code should import from './image/index.js' directly.
 */
export {
  parseAssetRequirements,
  generateGameAssets,
  generateThumbnailFromAssets,
  getImageProvider,
  isImageGenerationAvailable,
} from './image/index.js'
export type { ArtDirection, AssetDef, ImageProvider } from './image/index.js'
