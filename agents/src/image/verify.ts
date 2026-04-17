/**
 * Lightweight asset verification (no external API calls).
 *
 * After each image is generated we sanity-check it with sharp:
 *  - dimensions roughly match request
 *  - not ~100% transparent (generation failure)
 *  - not ~100% single color (generation failure / all-chromakey leak)
 *  - has enough entropy (not a blank fill)
 *
 * Provider-native vision verification can be plugged in later via a separate
 * module; keeping this file API-free keeps the per-cycle cost predictable.
 */
import { readFileSync } from 'fs'
import sharp from 'sharp'

export interface AssetVerifyResult {
  ok: boolean
  reasons: string[]
  stats: {
    width: number
    height: number
    alphaMean: number      // 0..1  — 0 = fully transparent, 1 = fully opaque
    stdev: number          // luminance stdev (higher = more detail)
    dominantRatio: number  // fraction of pixels sharing top bucket
  }
}

/** Verify a single generated asset. Non-fatal — caller decides what to do. */
export async function verifyGeneratedAsset(
  filePath: string,
  expectedW: number,
  expectedH: number,
  wantsTransparency: boolean,
): Promise<AssetVerifyResult> {
  const reasons: string[] = []
  const img = sharp(readFileSync(filePath))
  const meta = await img.metadata()
  const width = meta.width ?? 0
  const height = meta.height ?? 0

  if (Math.abs(width - expectedW) / expectedW > 0.1 ||
      Math.abs(height - expectedH) / expectedH > 0.1) {
    reasons.push(`size mismatch: got ${width}x${height}, expected ${expectedW}x${expectedH}`)
  }

  const { data, info } = await img.raw().ensureAlpha().toBuffer({ resolveWithObject: true })
  const channels = info.channels
  const pixelCount = info.width * info.height

  let alphaSum = 0
  let lumaSum = 0
  let lumaSqSum = 0
  const buckets = new Map<number, number>()
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const a = channels >= 4 ? data[i + 3] : 255
    alphaSum += a / 255
    const luma = 0.299 * r + 0.587 * g + 0.114 * b
    lumaSum += luma
    lumaSqSum += luma * luma
    // coarse bucket: 5-bit per channel
    const bucket = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1)
  }

  const alphaMean = alphaSum / pixelCount
  const lumaMean = lumaSum / pixelCount
  const variance = Math.max(0, lumaSqSum / pixelCount - lumaMean * lumaMean)
  const stdev = Math.sqrt(variance)

  let top = 0
  for (const v of buckets.values()) if (v > top) top = v
  const dominantRatio = top / pixelCount

  if (wantsTransparency) {
    if (alphaMean > 0.99) reasons.push('expected transparent background but image is ~fully opaque (chromakey may have failed)')
    if (alphaMean < 0.02) reasons.push('image is ~fully transparent (generation failed)')
  } else {
    if (alphaMean < 0.5) reasons.push('background image has too much transparency')
  }

  if (stdev < 8) reasons.push(`image is nearly flat (stdev=${stdev.toFixed(1)}) — likely blank`)
  if (dominantRatio > 0.85) reasons.push(`image is dominated by a single color (${(dominantRatio * 100).toFixed(0)}%)`)

  return {
    ok: reasons.length === 0,
    reasons,
    stats: { width, height, alphaMean, stdev, dominantRatio },
  }
}
