/**
 * Gemini image provider — gemini-3.1-flash-image-preview.
 *
 * Cannot emit native transparent backgrounds, so the pipeline pairs this with
 * chromakey post-processing (green #00FF00 → alpha=0).
 */
import { GoogleGenAI } from '@google/genai'
import type { ImageProvider, ImageGenerateInput, ImageGenerateResult } from '../types.js'

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

export const geminiProvider: ImageProvider = {
  name: 'gemini',
  modelTag: MODEL,
  supportsReferenceImages: true,
  supportsNativeTransparency: false,

  isAvailable() {
    return !!process.env.GEMINI_API_KEY
  },

  async generate(input: ImageGenerateInput): Promise<ImageGenerateResult> {
    try {
      const ai = getClient()
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = []

      if (input.referenceImages && input.referenceImages.length > 0) {
        for (const buf of input.referenceImages) {
          parts.push({ inlineData: { mimeType: 'image/png', data: buf.toString('base64') } })
        }
      }
      parts.push({ text: input.prompt })

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts }],
        config: { responseModalities: ['Text', 'Image'] },
      })

      if (response.candidates && response.candidates[0]) {
        for (const part of response.candidates[0].content?.parts || []) {
          if (part.inlineData) {
            const buf = Buffer.from(part.inlineData.data!, 'base64')
            if (buf.length < 5000) {
              return { ok: false, error: `image too small (${buf.length}B)` }
            }
            return { ok: true, pngBuffer: buf }
          }
        }
      }
      return { ok: false, error: 'no image in response' }
    } catch (err) {
      return { ok: false, error: (err as Error).message?.slice(0, 200) }
    }
  },
}
