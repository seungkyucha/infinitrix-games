/**
 * YAML asset-requirements parser.
 *
 * Planner embeds an ```yaml # asset-requirements``` block inside the spec
 * markdown. This extracts and normalizes it to ArtDirection. Provider-neutral.
 */
import type { ArtDirection, AssetDef } from './types.js'

export function parseAssetRequirements(specContent: string): ArtDirection | null {
  const yamlMatch = specContent.match(/```yaml\s*\n#\s*asset-requirements\s*\n([\s\S]*?)```/)
  if (!yamlMatch) return null
  const yaml = yamlMatch[1]
  const get = (key: string) => {
    const m = yaml.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, 'm'))
    return m?.[1]?.trim() ?? ''
  }
  const artStyle = get('art-style')
  const colorPalette = get('color-palette')
  const mood = get('mood')
  const reference = get('reference')
  const assets: AssetDef[] = []
  const assetBlocks = yaml.split(/\n\s*-\s+id:\s*/).slice(1)
  for (const block of assetBlocks) {
    const idMatch = block.match(/^(\S+)/)
    const descMatch = block.match(/desc:\s*"([^"]+)"/)
    const sizeMatch = block.match(/size:\s*"?(\d+x\d+)"?/)
    const refMatch = block.match(/ref:\s*"?(\S+)"?/)
    const framesMatch = block.match(/frames:\s*(\d+)/)
    if (idMatch) {
      assets.push({
        id: idMatch[1].trim(),
        desc: descMatch?.[1]?.trim() ?? idMatch[1].trim(),
        size: sizeMatch?.[1]?.trim() ?? '512x512',
        ref: refMatch?.[1]?.trim(),
        frames: framesMatch ? parseInt(framesMatch[1], 10) : undefined,
      })
    }
  }
  if (assets.length === 0) return null
  return { artStyle, colorPalette, mood, reference, assets }
}
