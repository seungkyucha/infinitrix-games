/**
 * Gemini 3.1 Flash Image API — PNG Asset Generator
 *
 * Design pipeline:
 * 1. Generate base character first
 * 2. Use base as reference for pose variations (idle, attack, etc.)
 * 3. Validate each generated image
 * 4. All prompts in English for better Gemini output
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
  size: string
  ref?: string  // reference asset id (e.g. "player" for "player-attack")
  frames?: number  // for sprite sheets — number of animation frames
}

export interface ArtDirection {
  artStyle: string
  colorPalette: string
  mood: string
  reference: string
  assets: AssetDef[]
}

// ═══════════════════════════════════════════════════════════
// Asset requirements YAML parser
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// Image generation with reference image support
// ═══════════════════════════════════════════════════════════

interface GenResult {
  ok: boolean
  bytes: number
  filePath: string
}

/** Generate image — optionally with a reference image attached */
async function generateImage(
  prompt: string,
  filePath: string,
  name: string,
  referenceImagePath?: string,
): Promise<GenResult> {
  try {
    const ai = getClient()
    const dir = dirname(filePath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    console.log(`  🎨 [Gemini] Generating: ${name}${referenceImagePath ? ' (with reference)' : ''}...`)

    // Build contents — text only or text + reference image
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = []

    if (referenceImagePath && existsSync(referenceImagePath)) {
      const imgData = readFileSync(referenceImagePath).toString('base64')
      const ext = referenceImagePath.endsWith('.png') ? 'image/png' : 'image/jpeg'
      parts.push({ inlineData: { mimeType: ext, data: imgData } })
      parts.push({ text: prompt })
    } else {
      parts.push({ text: prompt })
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts }],
      config: { responseModalities: ['Text', 'Image'] },
    })

    if (response.candidates && response.candidates[0]) {
      for (const part of response.candidates[0].content?.parts || []) {
        if (part.inlineData) {
          const buf = Buffer.from(part.inlineData.data!, 'base64')

          // Validation: minimum file size check
          if (buf.length < 5000) {
            console.log(`  ⚠️ [Gemini] ${name}: Image too small (${buf.length}B), likely invalid. Retrying...`)
            return { ok: false, bytes: 0, filePath }
          }

          writeFileSync(filePath, buf)
          console.log(`  ✅ [Gemini] ${name}: ${(buf.length / 1024).toFixed(0)}KB saved`)
          return { ok: true, bytes: buf.length, filePath }
        }
      }
    }

    console.log(`  ⚠️ [Gemini] ${name}: No image in response`)
    return { ok: false, bytes: 0, filePath }
  } catch (err) {
    console.error(`  ❌ [Gemini] ${name}: ${(err as Error).message?.slice(0, 200)}`)
    return { ok: false, bytes: 0, filePath }
  }
}

// ═══════════════════════════════════════════════════════════
// Prompt builder — all prompts in English
// ═══════════════════════════════════════════════════════════

function buildPrompt(
  asset: AssetDef,
  art: ArtDirection,
  gameTitle: string,
  genre: string,
  hasReference: boolean,
): string {
  const [w, h] = asset.size.split('x').map(Number)

  const isBackground = asset.id.startsWith('bg-') || asset.id.includes('background')
  const isEffect = asset.id.startsWith('effect-')
  const isUI = asset.id.startsWith('ui-')
  const isThumbnail = asset.id === 'thumbnail'
  const isTile = asset.id.includes('tile') || asset.id.includes('platform') || asset.id.includes('block')
  const isItem = asset.id.includes('item-') || asset.id.includes('powerup') || asset.id.includes('coin') ||
                 asset.id.includes('gem') || asset.id.includes('potion') || asset.id.includes('weapon')
  const isBoss = asset.id.includes('boss')

  // New asset type detections — sprite sheets, particles, tileable textures
  const isSpriteSheet = asset.id.includes('sheet') || asset.id.includes('anim') ||
                        asset.id.includes('frames') || asset.id.includes('sequence') || !!asset.frames
  const isParticle = asset.id.includes('particle') || asset.id.includes('spark') ||
                     asset.id.includes('glow') || asset.id.includes('trail')
  const isTexture = asset.id.includes('texture') || asset.id.includes('pattern') ||
                    asset.id.includes('tileable')

  // Match-3 specialized asset types
  const isGemSheet = isSpriteSheet && (asset.id.includes('gem') || asset.id.includes('jewel'))
  const isMatchEffect = asset.id.includes('match') && (asset.id.includes('effect') || asset.id.includes('explosion') || asset.id.includes('sequence'))
  const isComboPopup = asset.id.includes('combo') || (asset.id.includes('popup') && asset.id.includes('number'))
  const isBoardDecor = asset.id.includes('board') || asset.id.includes('frame-decor') || asset.id.includes('decoration')

  const isCharacter = !isBackground && !isEffect && !isUI && !isThumbnail && !isTile && !isItem &&
    !isSpriteSheet && !isParticle && !isTexture && !isComboPopup && !isBoardDecor &&
    (asset.id.includes('player') || asset.id.includes('enemy') || asset.id.includes('npc') ||
     asset.id.includes('character') || asset.id.includes('hero') || asset.id.includes('mob') || isBoss)
  const isVariation = !!asset.ref

  const STYLE = art.artStyle || 'stylized digital art'
  const PALETTE = art.colorPalette || 'rich, vibrant'
  const MOOD = art.mood || 'dramatic, atmospheric'
  const REF = art.reference || 'Hollow Knight, Dead Cells, Celeste'

  const ART_DIR = `[ART DIRECTION — STRICTLY FOLLOW]
Visual style: ${STYLE}
Color palette: ${PALETTE}
Mood/atmosphere: ${MOOD}
Reference games: ${REF}
Quality target: Professional Steam indie game / polished mobile game.
AVOID: flat vector art, generic clipart, stock imagery, AI-slop look.`

  // ─── Variation from reference image ───
  if (isVariation && hasReference) {
    return `[TASK] Create a VARIATION of the attached reference character image.

${ART_DIR}

[REFERENCE IMAGE ATTACHED] The attached image shows the base character design.
Keep the EXACT SAME character: same outfit, same colors, same proportions, same art style.

[VARIATION REQUESTED] ${asset.desc}

[STRICT RULES]
- SAME character as the reference — do NOT redesign or change the character's appearance.
- Change ONLY the pose/action as described above.
- Maintain identical color palette, shading style, and detail level.
- Output: ${w}x${h} pixels.
- Background: solid pure black (#000000). NO transparency.
- Exactly 1 character, centered, with 15% padding margin.
- NO text, NO UI, NO borders, NO watermarks.`
  }

  // ─── Sprite Sheet (multi-frame animation strip) ───
  if (isSpriteSheet) {
    const frameCount = asset.frames || 4
    const frameW = Math.round(w / frameCount)
    const frameH = h

    if (isGemSheet) {
      return `[TASK] Create a gem/jewel shimmer animation sprite sheet for "${gameTitle}" (${genre}).

${ART_DIR}

[GEM DESCRIPTION] ${asset.desc}

[SPRITE SHEET FORMAT]
- ${frameCount} frames arranged HORIZONTALLY in a single image strip.
- Total image size: ${w}x${h} pixels.
- Each frame: ${frameW}x${frameH} pixels.
- Frames show a SHIMMER/SPARKLE animation cycle: light reflection moves across the gem surface.
- Frame 1: base gem, subtle glow.
- Frame 2-${frameCount - 1}: light highlight sweeps across facets, intensifying.
- Frame ${frameCount}: peak sparkle, then cycles back.

[STRICT RULES]
- ALL ${frameCount} frames must show the SAME gem from the SAME angle — only the light/sparkle changes.
- Clear frame boundaries — each frame occupies exactly ${frameW}x${frameH} of the strip.
- Gem must be CENTERED within each frame with consistent padding.
- Background: solid pure black (#000000). NO transparency.
- Rich faceted crystal with visible refraction, specular highlights, and internal glow.
- The gem must look DESIRABLE — premium, polished, luminous.
- Output: ${w}x${h} pixels. NO text, NO UI, NO watermarks.`
    }

    if (isMatchEffect) {
      return `[TASK] Create a match/explosion effect animation sequence for "${gameTitle}" (${genre}).

${ART_DIR}

[EFFECT DESCRIPTION] ${asset.desc}

[SPRITE SHEET FORMAT]
- ${frameCount} frames arranged HORIZONTALLY in a single image strip.
- Total image size: ${w}x${h} pixels.
- Each frame: ${frameW}x${frameH} pixels.
- Frames show an EXPLOSION sequence from start to finish.
- Frame 1: initial flash/spark, small and bright.
- Frame 2: expanding ring of energy and particles.
- Frame 3: full explosion with scattered debris and bright core.
- Frame ${frameCount}: dissipating particles, fading edges.

[STRICT RULES]
- Clear frame boundaries — each frame occupies exactly ${frameW}x${frameH}.
- Effect must be CENTERED within each frame.
- Background: solid pure black (#000000). Bright parts = visible (additive blending in game).
- HDR-style bloom: pure white core → themed color → fading edges.
- Progressive size increase across frames: small spark → large burst → fade.
- Output: ${w}x${h} pixels. NO text, NO characters.`
    }

    return `[TASK] Create an animation sprite sheet for "${gameTitle}" (${genre}).

${ART_DIR}

[ANIMATION DESCRIPTION] ${asset.desc}

[SPRITE SHEET FORMAT]
- ${frameCount} frames arranged HORIZONTALLY in a single image strip.
- Total image size: ${w}x${h} pixels.
- Each frame: ${frameW}x${frameH} pixels.
- Frames should show a smooth animation cycle (e.g., idle breathing, walking, floating).

[STRICT RULES]
- ALL ${frameCount} frames must show the SAME object/character — only pose/state changes between frames.
- Clear frame boundaries — each frame occupies exactly ${frameW}x${frameH} of the strip.
- Object/character must be CENTERED within each frame with consistent positioning.
- Consistent art style, colors, proportions, and lighting across ALL frames.
- Background: solid pure black (#000000). NO transparency.
- Rich detail: visible textures, shading, highlights consistent across all frames.
- Silhouette must be recognizable even at small display size.
- Output: ${w}x${h} pixels. NO text, NO UI, NO watermarks.`
  }

  // ─── Particle Effect Texture ───
  if (isParticle) {
    return `[TASK] Create a particle effect texture for "${gameTitle}" (${genre}).

${ART_DIR}

[PARTICLE DESCRIPTION] ${asset.desc}

[STRICT RULES]
- EXACTLY 1 particle texture, CENTERED in frame.
- Background: solid pure black (#000000).
  In-game, black areas become invisible (additive blending). Design accordingly.
- The particle should be a SMALL, SOFT element: a glowing dot, spark, ember, snowflake, or light mote.
- Radial gradient from bright center to transparent/black edges.
- Alpha falloff: crisp bright core (20% of radius) → soft glow (50%) → fading edge (100%).
- Must look good when rendered at very small sizes (8-32 pixels) and when many are on screen at once.
- Circular or near-circular shape for versatile rotation.
- Rich color: saturated core with desaturated edges, subtle color shift from center to edge.
- Output: ${w}x${h} pixels. NO text, NO borders, NO watermarks.
- HIGH DETAIL even at small size — this texture will be rendered hundreds of times per frame.`
  }

  // ─── Tileable Texture ───
  if (isTexture) {
    return `[TASK] Create a seamlessly tileable texture for "${gameTitle}" (${genre}).

${ART_DIR}

[TEXTURE DESCRIPTION] ${asset.desc}

[STRICT RULES]
- SEAMLESSLY TILEABLE: left edge matches right edge, top edge matches bottom edge PERFECTLY.
- When placed in a 3x3 grid of copies, NO visible seams at any boundary.
- Consistent detail density across the entire surface — no focal point or center bias.
- Visible material properties: surface roughness, subtle color variation, fine detail.
- Lighting must be NEUTRAL/AMBIENT — no strong directional shadows that break tiling.
- Output: ${w}x${h} pixels. Fills the ENTIRE canvas, NO black borders.
- NO characters, NO items, NO text, NO watermarks.
- Professional game texture quality — suitable for ground, walls, or surfaces.`
  }

  // ─── Match-3 Combo Popup ───
  if (isComboPopup) {
    return `[TASK] Create combo/score popup text graphics for "${gameTitle}" (${genre}).

${ART_DIR}

[POPUP DESCRIPTION] ${asset.desc}

[STRICT RULES]
- Stylized number/text graphic for in-game score popups.
- Background: solid pure black (#000000).
- Bold, impactful typography with effects: metallic sheen, glow, 3D extrusion, or emboss.
- Must be INSTANTLY READABLE even at small sizes and during fast gameplay.
- Dynamic feel: slight perspective, motion lines, or energy aura around the text.
- Color coding for escalation: warm gold for base, hotter colors for higher combos.
- Output: ${w}x${h} pixels. NO additional UI, NO frames.`
  }

  // ─── Board Decoration / Frame ───
  if (isBoardDecor) {
    return `[TASK] Create a decorative board frame/border element for "${gameTitle}" (${genre}).

${ART_DIR}

[DECORATION DESCRIPTION] ${asset.desc}

[STRICT RULES]
- Ornamental frame, border, or decorative element for the game board.
- Background: solid pure black (#000000).
- Rich material detail: carved wood, gilded metal, crystal-encrusted, magical runes, etc.
- Symmetrical or repeatable design suitable for framing a rectangular game area.
- Premium craftsmanship feel — like a high-end jewelry box or magical artifact border.
- Consistent lighting (top-left), depth through highlights and shadows.
- Output: ${w}x${h} pixels. NO text, NO characters, NO watermarks.`
  }

  // ─── Character (base or standalone) ───
  if (isCharacter) {
    return `[TASK] Create a game character sprite for "${gameTitle}" (${genre}).

${ART_DIR}

[CHARACTER DESCRIPTION] ${asset.desc}

[STRICT RULES]
- Render EXACTLY 1 character. NOT a sprite sheet. NOT multiple characters. NOT multiple poses.
- Single pose: idle/standing, facing front or 3/4 view.
- Character centered in frame with 15% padding on all sides.
- Background: solid pure black (#000000). NO transparency, NO gradients, NO environment.
- The game engine uses drawImage() — black areas are treated as empty space.
${isBoss ? '- BOSS character: 2x more imposing, dramatic aura/glow, complex armor/details.' : ''}
- Rich shading: key light (top-left 45°), fill light (subtle right), rim light (back edge).
- Visible material textures: fabric weave, metal reflections, skin detail, armor rivets.
- Silhouette must be recognizable even at 64x64 pixels.
- Output: ${w}x${h} pixels.
- NO text, NO UI elements, NO borders, NO watermarks, NO ground shadow.`
  }

  // ─── Background ───
  if (isBackground) {
    const layer = asset.id.includes('far') || asset.id.includes('layer1') ? 'FAR (distant sky/horizon)' :
                  asset.id.includes('mid') || asset.id.includes('layer2') ? 'MID (terrain silhouettes)' :
                  asset.id.includes('near') || asset.id.includes('ground') ? 'NEAR (ground/platforms)' : 'GENERAL'
    return `[TASK] Create a game background layer for "${gameTitle}" (${genre}).

${ART_DIR}

[LAYER TYPE] ${layer}
[DESCRIPTION] ${asset.desc}

[STRICT RULES]
- This is a BACKGROUND LAYER for parallax scrolling. NOT a complete scene.
- FILL the entire ${w}x${h} canvas. NO transparent areas. NO black void.
- NO characters, NO enemies, NO items, NO UI, NO text anywhere.
${layer.includes('FAR') ? '- Atmospheric, hazy, desaturated. Sky gradients, distant mountains, clouds, stars.' : ''}
${layer.includes('MID') ? '- Medium-detail silhouettes: buildings, trees, rocks. Darker than far layer.' : ''}
${layer.includes('NEAR') ? '- High-detail ground elements: platforms, foliage, terrain texture.' : ''}
- Painterly digital art with visible brushwork and atmospheric perspective.
- Consider horizontal tiling (left-right edge continuity).
- Output: ${w}x${h} pixels.`
  }

  // ─── Effect/VFX ───
  if (isEffect) {
    return `[TASK] Create a game visual effect (VFX) for "${gameTitle}" (${genre}).

${ART_DIR}

[EFFECT DESCRIPTION] ${asset.desc}

[STRICT RULES]
- EXACTLY 1 effect instance, CENTERED in the frame.
- Background: solid pure black (#000000).
  In-game, black areas become invisible (additive blending). Design accordingly:
  bright parts = visible effect, black = transparent in game.
- Radial/centered emanation from the center outward.
- Multiple concentric layers: core flash → energy ring → outer particle scatter.
- HDR-style bloom: pure white center → themed color mid → fading edges.
${asset.id.includes('hit') ? '- IMPACT effect: short burst, directional speed lines, debris particles.' : ''}
${asset.id.includes('explosion') ? '- EXPLOSION: large radial burst, fire/smoke layers, flying debris.' : ''}
${asset.id.includes('heal') ? '- HEALING: upward-floating particles, soft green/white glow, gentle sparkles.' : ''}
${asset.id.includes('dash') ? '- DASH/SPEED: horizontal motion blur, afterimage trail, wind lines.' : ''}
- Output: ${w}x${h} pixels. NO text, NO characters.`
  }

  // ─── UI Icon ───
  if (isUI) {
    return `[TASK] Create a game UI icon for "${gameTitle}" (${genre}).

${ART_DIR}

[ICON DESCRIPTION] ${asset.desc}

[STRICT RULES]
- EXACTLY 1 icon, CENTERED with 20% padding margin.
- Background: solid pure black (#000000). NO transparency.
- Must be INSTANTLY READABLE at 32x32 pixel display size — bold, high-contrast shapes.
- Premium mobile game quality: glossy surface, specular highlight, 3D depth feel.
${asset.id.includes('hp') || asset.id.includes('heart') || asset.id.includes('health') ?
  '- HEALTH icon: rich red/crimson heart or shield, glass-like specular, inner glow.' : ''}
${asset.id.includes('score') || asset.id.includes('coin') || asset.id.includes('star') ?
  '- SCORE/CURRENCY icon: gold metallic coin or faceted gem, bright specular dot.' : ''}
${asset.id.includes('mana') || asset.id.includes('energy') ?
  '- MANA/ENERGY icon: blue/purple crystal orb, magical sparkle, internal glow.' : ''}
- Drop shadow for floating appearance. Material matches game theme.
- Output: ${w}x${h} pixels. NO text, NO numbers, NO frames.`
  }

  // ─── Thumbnail / Key Art ───
  if (isThumbnail) {
    return `[TASK] Create game store cover art / marketing thumbnail for "${gameTitle}" (${genre}).

${ART_DIR}

[THUMBNAIL DESCRIPTION] ${asset.desc}

[STRICT RULES]
- This is the game's MARKETING IMAGE shown on the platform. First impression matters.
- MUST include game title "${gameTitle}" in stylish, genre-appropriate typography.
  Title must be LARGE, READABLE, integrated into composition (not overlaid).
  Use effects on title: drop shadow, glow, metallic sheen, or emboss.
- Show main character (30-40% of frame) + key gameplay elements + atmospheric background.
- COMPLETE scene — NOT transparent, NOT black void. Full environment.
- Dynamic composition: rule of thirds, action pose, movement/drama.
- High contrast, saturated accent colors for thumbnail grid visibility.
- Professional color grading: movie poster / Steam capsule art quality.
- Output: ${w}x${h} pixels. Landscape orientation.`
  }

  // ─── Item / Collectible ───
  if (isItem) {
    return `[TASK] Create a game item/collectible sprite for "${gameTitle}" (${genre}).

${ART_DIR}

[ITEM DESCRIPTION] ${asset.desc}

[STRICT RULES]
- EXACTLY 1 item, CENTERED with 20% padding.
- Background: solid pure black (#000000). NO transparency.
- Item must look DESIRABLE — players should want to collect it.
- Readable at 32x32 display size.
- NO character hands holding the item — item floats alone.
- Luminous surface with internal glow or magical aura. Fresnel rim lighting.
- Subtle sparkle/particle effects suggesting value or power.
- Output: ${w}x${h} pixels. NO text, NO UI, NO hands.`
  }

  // ─── Tile / Platform ───
  if (isTile) {
    return `[TASK] Create a game tile/platform piece for "${gameTitle}" (${genre}).

${ART_DIR}

[TILE DESCRIPTION] ${asset.desc}

[STRICT RULES]
- SEAMLESS TILEABLE texture/platform piece.
- Background: solid pure black (#000000) around the tile shape.
- Edges designed for tiling — left matches right, top matches bottom.
- Visible material texture: stone cracks, wood grain, metal rivets, crystal facets.
- Consistent lighting direction (top-left).
- Output: ${w}x${h} pixels. Single tile.`
  }

  // ─── Generic fallback ───
  return `[TASK] Create a game asset for "${gameTitle}" (${genre}).

${ART_DIR}

[ASSET DESCRIPTION] ${asset.desc}

[STRICT RULES]
- EXACTLY 1 object/element, CENTERED in frame.
- Background: solid pure black (#000000). NO transparency.
- Game-ready: clean edges, consistent lighting, readable at display size.
- Output: ${w}x${h} pixels. NO text, NO UI, NO watermarks.`
}

// ═══════════════════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════════════════

function validateAsset(filePath: string, name: string, expectedSize: string): boolean {
  if (!existsSync(filePath)) {
    console.log(`  ❌ [Validate] ${name}: File not found`)
    return false
  }
  const buf = readFileSync(filePath)
  if (buf.length < 5000) {
    console.log(`  ❌ [Validate] ${name}: Too small (${buf.length}B) — likely corrupted`)
    return false
  }
  // Check PNG header
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) {
    // Check JPEG header
    if (buf[0] !== 0xFF || buf[1] !== 0xD8) {
      console.log(`  ❌ [Validate] ${name}: Not a valid PNG/JPEG file`)
      return false
    }
  }
  console.log(`  ✓ [Validate] ${name}: OK (${(buf.length / 1024).toFixed(0)}KB)`)
  return true
}

// ═══════════════════════════════════════════════════════════
// Main pipeline
// ═══════════════════════════════════════════════════════════

export async function generateGameAssets(
  gameId: string,
  gameTitle: string,
  genre: string,
  specContent: string,
  assetsDir: string,
): Promise<{ generated: string[]; failed: string[] }> {
  const generated: string[] = []
  const failed: string[] = []

  const art = parseAssetRequirements(specContent)

  if (!art || art.assets.length === 0) {
    console.log(`  ⚠️ [Gemini] No asset-requirements in spec — using defaults`)
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
    return runPipeline(gameId, gameTitle, genre, defaultArt, assetsDir)
  }

  console.log(`  📋 [Gemini] Found ${art.assets.length} assets (style: ${art.artStyle})`)
  return runPipeline(gameId, gameTitle, genre, art, assetsDir)
}

async function runPipeline(
  gameId: string,
  gameTitle: string,
  genre: string,
  art: ArtDirection,
  assetsDir: string,
): Promise<{ generated: string[]; failed: string[] }> {
  const generated: string[] = []
  const failed: string[] = []

  if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true })

  // Phase 1: Generate base assets (no reference needed)
  const baseAssets = art.assets.filter(a => !a.ref)
  const variationAssets = art.assets.filter(a => !!a.ref)

  console.log(`  📦 Phase 1: ${baseAssets.length} base assets`)
  for (const asset of baseAssets) {
    const filePath = `${assetsDir}/${asset.id}.png`
    const prompt = buildPrompt(asset, art, gameTitle, genre, false)
    const result = await generateImage(prompt, filePath, asset.id)

    if (result.ok && validateAsset(filePath, asset.id, asset.size)) {
      generated.push(asset.id)
    } else {
      // Retry once
      console.log(`  🔄 [Gemini] Retrying ${asset.id}...`)
      await new Promise(r => setTimeout(r, 1000))
      const retry = await generateImage(prompt, filePath, `${asset.id} (retry)`)
      if (retry.ok && validateAsset(filePath, asset.id, asset.size)) {
        generated.push(asset.id)
      } else {
        failed.push(asset.id)
      }
    }
    await new Promise(r => setTimeout(r, 600))
  }

  // Phase 2: Generate variations using base as reference
  if (variationAssets.length > 0) {
    console.log(`  📦 Phase 2: ${variationAssets.length} variation assets (with reference)`)
    for (const asset of variationAssets) {
      const filePath = `${assetsDir}/${asset.id}.png`
      const refPath = `${assetsDir}/${asset.ref}.png`
      const hasRef = existsSync(refPath)
      const prompt = buildPrompt(asset, art, gameTitle, genre, hasRef)
      const result = await generateImage(prompt, filePath, asset.id, hasRef ? refPath : undefined)

      if (result.ok && validateAsset(filePath, asset.id, asset.size)) {
        generated.push(asset.id)
      } else {
        failed.push(asset.id)
      }
      await new Promise(r => setTimeout(r, 600))
    }
  }

  // Write manifest
  const manifest = {
    gameId,
    generatedBy: 'gemini-3.1-flash-image-preview',
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
