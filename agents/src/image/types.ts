/**
 * Provider-agnostic image generation types.
 *
 * Each ImageProvider adapts a specific backend (Gemini, OpenAI, etc.) behind
 * a uniform interface. The pipeline (prompts, parser, chromakey, orchestration)
 * is provider-neutral and picks a provider via the factory in ./index.ts.
 */

export interface AssetDef {
  id: string
  desc: string
  size: string
  ref?: string       // reference asset id (e.g. "player" for "player-attack")
  frames?: number    // sprite-sheet frame count
}

export interface ArtDirection {
  artStyle: string
  colorPalette: string
  mood: string
  reference: string
  assets: AssetDef[]
}

export interface ImageGenerateInput {
  prompt: string
  width: number
  height: number
  /** Reference images as raw PNG/JPEG buffers (image-to-image / character consistency). */
  referenceImages?: Buffer[]
  /** True if the caller wants a transparent-background PNG in the final file. */
  transparent?: boolean
}

export interface ImageGenerateResult {
  ok: boolean
  /** Raw image bytes in the provider's native format (PNG preferred). */
  pngBuffer?: Buffer
  error?: string
}

export interface ImageProvider {
  /** Short identifier e.g. "gemini", "openai". Stored in manifests. */
  readonly name: string
  /** Full model tag stored in manifest.generatedBy. */
  readonly modelTag: string
  /** True if the provider can consume `referenceImages` for variations. */
  readonly supportsReferenceImages: boolean
  /**
   * True if the provider can output transparent-background PNGs natively.
   * When false, the pipeline falls back to green chromakey + post-processing.
   */
  readonly supportsNativeTransparency: boolean
  /** True if the provider's env/credentials are configured. */
  isAvailable(): boolean
  /** Generate a single image. Must return PNG bytes when `ok`. */
  generate(input: ImageGenerateInput): Promise<ImageGenerateResult>
}
