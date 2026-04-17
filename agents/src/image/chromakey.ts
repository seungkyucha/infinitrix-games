/**
 * Green chromakey → transparent PNG.
 *
 * Used for providers that cannot emit native transparent backgrounds.
 * Prompt instructs the model to paint #00FF00; this routine converts green
 * pixels to alpha=0 with edge feathering.
 */
import { readFileSync } from 'fs'
import { renameSync } from 'fs'
import sharp from 'sharp'

/** In-place replace `filePath` with a transparent-background version. */
export async function removeGreenBackground(filePath: string): Promise<boolean> {
  const { data, info } = await sharp(filePath)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  const pixels = new Uint8Array(data)

  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]

    // RGB → HSV
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const delta = max - min
    const v = max / 255
    const s = max === 0 ? 0 : delta / max

    let h = 0
    if (delta > 0) {
      if (max === g) h = 60 * (((b - r) / delta) + 2)
      else if (max === r) h = 60 * (((g - b) / delta) % 6)
      else h = 60 * (((r - g) / delta) + 4)
      if (h < 0) h += 360
    }

    const isGreen = h >= 80 && h <= 160 && s > 0.35 && v > 0.25

    if (isGreen) {
      pixels[i + 3] = 0
    } else if (h >= 60 && h <= 180 && s > 0.2 && v > 0.2) {
      const greenness = Math.min(1, Math.max(0, (s - 0.2) / 0.3 * (1 - Math.abs(h - 120) / 60)))
      pixels[i + 3] = Math.round(255 * (1 - greenness * 0.8))
    }
  }

  await sharp(Buffer.from(pixels), { raw: { width, height, channels } })
    .png()
    .toFile(filePath + '.tmp')

  renameSync(filePath + '.tmp', filePath)
  return true
}
