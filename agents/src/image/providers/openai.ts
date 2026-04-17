/**
 * OpenAI image provider — gpt-image-1.
 *
 * Supports native transparent-background PNGs (`background: "transparent"`)
 * and image-to-image via the `/v1/images/edits` endpoint.
 *
 * Size constraint: gpt-image-1 only emits 1024x1024, 1024x1536, or 1536x1024.
 * We pick the closest aspect ratio to the requested w×h and resize with sharp.
 */
import OpenAI from 'openai'
import sharp from 'sharp'
import { toFile } from 'openai/uploads'
import type { ImageProvider, ImageGenerateInput, ImageGenerateResult } from '../types.js'

const MODEL = 'gpt-image-1'
const QUALITY: 'low' | 'medium' | 'high' = (process.env.OPENAI_IMAGE_QUALITY as 'low' | 'medium' | 'high') || 'medium'

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (!client) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY not set')
    client = new OpenAI({ apiKey: key })
  }
  return client
}

type SupportedSize = '1024x1024' | '1024x1536' | '1536x1024'

/** Pick the supported size whose aspect ratio best matches w×h. */
function pickSize(w: number, h: number): SupportedSize {
  const target = w / h
  const candidates: Array<{ size: SupportedSize; ratio: number }> = [
    { size: '1024x1024', ratio: 1 },
    { size: '1536x1024', ratio: 1536 / 1024 },
    { size: '1024x1536', ratio: 1024 / 1536 },
  ]
  let best = candidates[0]
  let bestDiff = Math.abs(Math.log(target / best.ratio))
  for (const c of candidates.slice(1)) {
    const diff = Math.abs(Math.log(target / c.ratio))
    if (diff < bestDiff) { best = c; bestDiff = diff }
  }
  return best.size
}

/** Resize (and if needed, pad) to exactly target w×h, keeping PNG + alpha. */
async function fitToTargetSize(buf: Buffer, targetW: number, targetH: number): Promise<Buffer> {
  return await sharp(buf)
    .resize(targetW, targetH, { fit: 'fill' })
    .png()
    .toBuffer()
}

export const openaiProvider: ImageProvider = {
  name: 'openai',
  modelTag: MODEL,
  supportsReferenceImages: true,
  supportsNativeTransparency: true,

  isAvailable() {
    return !!process.env.OPENAI_API_KEY
  },

  async generate(input: ImageGenerateInput): Promise<ImageGenerateResult> {
    try {
      const ai = getClient()
      const size = pickSize(input.width, input.height)
      const background: 'transparent' | 'opaque' = input.transparent ? 'transparent' : 'opaque'

      let b64: string | undefined

      if (input.referenceImages && input.referenceImages.length > 0) {
        // Image-to-image: /v1/images/edits with one or more reference images
        const refs = await Promise.all(
          input.referenceImages.map((b, i) => toFile(b, `ref-${i}.png`, { type: 'image/png' })),
        )
        const resp = await ai.images.edit({
          model: MODEL,
          image: refs.length === 1 ? refs[0] : refs,
          prompt: input.prompt,
          size,
          background,
          quality: QUALITY,
        })
        b64 = resp.data?.[0]?.b64_json
      } else {
        const resp = await ai.images.generate({
          model: MODEL,
          prompt: input.prompt,
          size,
          background,
          quality: QUALITY,
          output_format: 'png',
        })
        b64 = resp.data?.[0]?.b64_json
      }

      if (!b64) return { ok: false, error: 'no image in response' }

      let buf: Buffer = Buffer.from(b64, 'base64')
      if (buf.length < 5000) return { ok: false, error: `image too small (${buf.length}B)` }

      // Resize from supported size → requested size
      const [sw, sh] = size.split('x').map(Number)
      if (sw !== input.width || sh !== input.height) {
        buf = Buffer.from(await fitToTargetSize(buf, input.width, input.height))
      }

      return { ok: true, pngBuffer: buf }
    } catch (err) {
      return { ok: false, error: (err as Error).message?.slice(0, 200) }
    }
  },
}
