/**
 * Prompt builder — provider-neutral.
 *
 * Produces an English prompt from an AssetDef + ArtDirection. The caller passes
 * `useChromaKey`: when true we instruct the model to paint a solid #00FF00
 * background (post-processed via chromakey.ts); when false we ask for a
 * genuinely transparent background (e.g. OpenAI gpt-image-1 native alpha).
 */
import type { ArtDirection, AssetDef } from './types.js'

export interface BuiltPrompt {
  prompt: string
  /** True if this asset type needs a transparent final PNG. */
  transparent: boolean
}

export interface BuildPromptOptions {
  asset: AssetDef
  art: ArtDirection
  gameTitle: string
  genre: string
  hasReference: boolean
  /** When true, prompt asks for #00FF00 chromakey; otherwise asks for native transparency. */
  useChromaKey: boolean
}

export function buildPrompt(opts: BuildPromptOptions): BuiltPrompt {
  const { asset, art, gameTitle, genre, hasReference, useChromaKey } = opts
  const [w, h] = asset.size.split('x').map(Number)

  const isBackground = asset.id.startsWith('bg-') || asset.id.includes('background')
  const isEffect = asset.id.startsWith('effect-')
  const isUI = asset.id.startsWith('ui-')
  const isThumbnail = asset.id === 'thumbnail'
  const isTile = asset.id.includes('tile') || asset.id.includes('platform') || asset.id.includes('block')
  const isItem = asset.id.includes('item-') || asset.id.includes('powerup') || asset.id.includes('coin') ||
                 asset.id.includes('gem') || asset.id.includes('potion') || asset.id.includes('weapon')
  const isBoss = asset.id.includes('boss')

  const isSpriteSheet = asset.id.includes('sheet') || asset.id.includes('anim') ||
                        asset.id.includes('frames') || asset.id.includes('sequence') || !!asset.frames
  const isParticle = asset.id.includes('particle') || asset.id.includes('spark') ||
                     asset.id.includes('glow') || asset.id.includes('trail')
  const isTexture = asset.id.includes('texture') || asset.id.includes('pattern') ||
                    asset.id.includes('tileable')

  const isGemSheet = isSpriteSheet && (asset.id.includes('gem') || asset.id.includes('jewel'))
  const isMatchEffect = asset.id.includes('match') && (asset.id.includes('effect') || asset.id.includes('explosion') || asset.id.includes('sequence'))
  const isComboPopup = asset.id.includes('combo') || (asset.id.includes('popup') && asset.id.includes('number'))
  const isBoardDecor = asset.id.includes('board') || asset.id.includes('frame-decor') || asset.id.includes('decoration')

  const isCharacter = !isBackground && !isEffect && !isUI && !isThumbnail && !isTile && !isItem &&
    !isSpriteSheet && !isParticle && !isTexture && !isComboPopup && !isBoardDecor &&
    (asset.id.includes('player') || asset.id.includes('enemy') || asset.id.includes('npc') ||
     asset.id.includes('character') || asset.id.includes('hero') || asset.id.includes('mob') || isBoss)
  const isVariation = !!asset.ref

  const needsTransparent = !isBackground && !isThumbnail && !isTexture
  const BG = !needsTransparent
    ? ''
    : useChromaKey
      ? 'Background: solid bright green (#00FF00) chromakey. The green will be removed in post-processing to create transparency. Use PURE #00FF00 green, not dark green or yellow-green.'
      : 'Background: fully transparent (alpha=0). The subject must sit on a completely empty background — no color fill, no gradient, no chromakey, just transparent.'

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
    return { prompt: `[TASK] Create a VARIATION of the attached reference character image.

${ART_DIR}

[REFERENCE IMAGE ATTACHED] The attached image shows the base character design.
Keep the EXACT SAME character: same outfit, same colors, same proportions, same art style.

[VARIATION REQUESTED] ${asset.desc}

[STRICT RULES]
- SAME character as the reference — do NOT redesign or change the character's appearance.
- Change ONLY the pose/action as described above.
- Maintain identical color palette, shading style, and detail level.
- Output: ${w}x${h} pixels.
- ${BG}
- Exactly 1 character, centered, with 15% padding margin.
- Output: EXACTLY ${w}x${h} pixels — same size as the reference image.
- NO text, NO UI, NO borders, NO watermarks.`, transparent: needsTransparent }
  }

  // ─── Sprite Sheet ───
  if (isSpriteSheet) {
    const frameCount = asset.frames || 4
    const frameW = Math.round(w / frameCount)
    const frameH = h
    const framePositions = Array.from({length: frameCount}, (_, i) => `Frame ${i+1}: x=${i * frameW}~${(i+1) * frameW - 1}`).join(', ')

    if (isGemSheet) {
      return { prompt: `[TASK] Create a gem/jewel shimmer animation sprite sheet for "${gameTitle}" (${genre}).

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
- Clear frame boundaries — each frame occupies EXACTLY ${frameW}x${frameH} pixels.
- Frame pixel positions: ${framePositions}.
- Gem must be CENTERED within each frame with consistent padding.
- ${BG}
- Rich faceted crystal with visible refraction, specular highlights, and internal glow.
- The gem must look DESIRABLE — premium, polished, luminous.
- Output: ${w}x${h} pixels. NO text, NO UI, NO watermarks.`, transparent: needsTransparent }
    }

    if (isMatchEffect) {
      return { prompt: `[TASK] Create a match/explosion effect animation sequence for "${gameTitle}" (${genre}).

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
- ${BG}
- In-game, green/black areas become invisible. Bright parts = visible effect.
- HDR-style bloom: pure white core → themed color → fading edges.
- Progressive size increase across frames: small spark → large burst → fade.
- Output: EXACTLY ${w}x${h} pixels. Displayed at 64-256px in-game as overlay effect.
- Effect core should be at exact center (${w}/2, ${h}/2) of the image.
- NO text, NO characters.`, transparent: needsTransparent }
    }

    return { prompt: `[TASK] Create an animation sprite sheet for "${gameTitle}" (${genre}).

${ART_DIR}

[ANIMATION DESCRIPTION] ${asset.desc}

[SPRITE SHEET FORMAT]
- ${frameCount} frames arranged HORIZONTALLY in a single image strip.
- Total image size: ${w}x${h} pixels.
- Each frame: ${frameW}x${frameH} pixels.
- Frames should show a smooth animation cycle (e.g., idle breathing, walking, floating).

[STRICT RULES]
- ALL ${frameCount} frames must show the SAME object/character — only pose/state changes between frames.
- Clear frame boundaries — each frame occupies EXACTLY ${frameW}x${frameH} pixels.
- Frame pixel positions: ${framePositions}.
- Object/character must be CENTERED within each frame with consistent positioning.
- Consistent art style, colors, proportions, and lighting across ALL frames.
- ${BG}
- Rich detail: visible textures, shading, highlights consistent across all frames.
- Silhouette must be recognizable even at small display size.
- Output: ${w}x${h} pixels. NO text, NO UI, NO watermarks.`, transparent: needsTransparent }
  }

  // ─── Particle ───
  if (isParticle) {
    return { prompt: `[TASK] Create a particle effect texture for "${gameTitle}" (${genre}).

${ART_DIR}

[PARTICLE DESCRIPTION] ${asset.desc}

[STRICT RULES]
- EXACTLY 1 particle texture, CENTERED in frame.
- ${BG}
  In-game, black areas become invisible (additive blending). Design accordingly.
- The particle should be a SMALL, SOFT element: a glowing dot, spark, ember, snowflake, or light mote.
- Radial gradient from bright center to transparent/black edges.
- Alpha falloff: crisp bright core (20% of radius) → soft glow (50%) → fading edge (100%).
- Must look good when rendered at very small sizes (8-32 pixels) and when many are on screen at once.
- Circular or near-circular shape for versatile rotation.
- Rich color: saturated core with desaturated edges, subtle color shift from center to edge.
- Output: ${w}x${h} pixels. NO text, NO borders, NO watermarks.
- HIGH DETAIL even at small size — this texture will be rendered hundreds of times per frame.
- Output: EXACTLY ${w}x${h} pixels. Displayed at 4-32px in-game. The ENTIRE canvas must be used.`, transparent: needsTransparent }
  }

  // ─── Tileable Texture ───
  if (isTexture) {
    return { prompt: `[TASK] Create a seamlessly tileable texture for "${gameTitle}" (${genre}).

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
- Professional game texture quality — suitable for ground, walls, or surfaces.`, transparent: needsTransparent }
  }

  // ─── Combo Popup ───
  if (isComboPopup) {
    return { prompt: `[TASK] Create combo/score popup text graphics for "${gameTitle}" (${genre}).

${ART_DIR}

[POPUP DESCRIPTION] ${asset.desc}

[STRICT RULES]
- Stylized number/text graphic for in-game score popups.
- ${BG}
- Bold, impactful typography with effects: metallic sheen, glow, 3D extrusion, or emboss.
- Must be INSTANTLY READABLE even at small sizes and during fast gameplay.
- Dynamic feel: slight perspective, motion lines, or energy aura around the text.
- Color coding for escalation: warm gold for base, hotter colors for higher combos.
- Output: ${w}x${h} pixels. NO additional UI, NO frames.`, transparent: needsTransparent }
  }

  // ─── Board Decoration ───
  if (isBoardDecor) {
    return { prompt: `[TASK] Create a decorative board frame/border element for "${gameTitle}" (${genre}).

${ART_DIR}

[DECORATION DESCRIPTION] ${asset.desc}

[STRICT RULES]
- Ornamental frame, border, or decorative element for the game board.
- ${BG}
- Rich material detail: carved wood, gilded metal, crystal-encrusted, magical runes, etc.
- Symmetrical or repeatable design suitable for framing a rectangular game area.
- Premium craftsmanship feel — like a high-end jewelry box or magical artifact border.
- Consistent lighting (top-left), depth through highlights and shadows.
- Output: ${w}x${h} pixels. NO text, NO characters, NO watermarks.`, transparent: needsTransparent }
  }

  // ─── Character ───
  if (isCharacter) {
    return { prompt: `[TASK] Create a game character sprite for "${gameTitle}" (${genre}).

${ART_DIR}

[CHARACTER DESCRIPTION] ${asset.desc}

[STRICT RULES]
- Render EXACTLY 1 character. NOT a sprite sheet. NOT multiple characters. NOT multiple poses.
- Single pose: idle/standing, facing front or 3/4 view.
- Character centered in frame with 15% padding on all sides.
- ${BG}
- NO gradients, NO environment.
- The game engine uses drawImage() — black areas are treated as empty space.
${isBoss ? '- BOSS character: 2x more imposing, dramatic aura/glow, complex armor/details.' : ''}
- Rich shading: key light (top-left 45°), fill light (subtle right), rim light (back edge).
- Visible material textures: fabric weave, metal reflections, skin detail, armor rivets.
- Silhouette must be recognizable even at 64x64 pixels.
- Output: EXACTLY ${w}x${h} pixels. The game displays this at 64-128px on screen via drawImage().
- Subject must occupy 70-85% of the frame (not tiny in a huge canvas, not cropped at edges).
- NO text, NO UI elements, NO borders, NO watermarks, NO ground shadow.`, transparent: needsTransparent }
  }

  // ─── Background ───
  if (isBackground) {
    const layer = asset.id.includes('far') || asset.id.includes('layer1') ? 'FAR (distant sky/horizon)' :
                  asset.id.includes('mid') || asset.id.includes('layer2') ? 'MID (terrain silhouettes)' :
                  asset.id.includes('near') || asset.id.includes('ground') ? 'NEAR (ground/platforms)' : 'GENERAL'
    return { prompt: `[TASK] Create a game background layer for "${gameTitle}" (${genre}).

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
- Output: EXACTLY ${w}x${h} pixels. Used as full-screen background via drawImage(0, 0, canvasW, canvasH).
- The ENTIRE ${w}x${h} canvas must be painted — no black borders, no empty areas.`, transparent: needsTransparent }
  }

  // ─── Effect ───
  if (isEffect) {
    return { prompt: `[TASK] Create a game visual effect (VFX) for "${gameTitle}" (${genre}).

${ART_DIR}

[EFFECT DESCRIPTION] ${asset.desc}

[STRICT RULES]
- EXACTLY 1 effect instance, CENTERED in the frame.
- ${BG}
  In-game, black areas become invisible (additive blending). Design accordingly:
  bright parts = visible effect, black = transparent in game.
- Radial/centered emanation from the center outward.
- Multiple concentric layers: core flash → energy ring → outer particle scatter.
- HDR-style bloom: pure white center → themed color mid → fading edges.
${asset.id.includes('hit') ? '- IMPACT effect: short burst, directional speed lines, debris particles.' : ''}
${asset.id.includes('explosion') ? '- EXPLOSION: large radial burst, fire/smoke layers, flying debris.' : ''}
${asset.id.includes('heal') ? '- HEALING: upward-floating particles, soft green/white glow, gentle sparkles.' : ''}
${asset.id.includes('dash') ? '- DASH/SPEED: horizontal motion blur, afterimage trail, wind lines.' : ''}
- Output: EXACTLY ${w}x${h} pixels. Displayed at 64-256px in-game as overlay effect.
- Effect core should be at exact center (${w}/2, ${h}/2) of the image.
- NO text, NO characters.`, transparent: needsTransparent }
  }

  // ─── UI Icon ───
  if (isUI) {
    return { prompt: `[TASK] Create a game UI icon for "${gameTitle}" (${genre}).

${ART_DIR}

[ICON DESCRIPTION] ${asset.desc}

[STRICT RULES]
- EXACTLY 1 icon, CENTERED with 20% padding margin.
- ${BG}
- Must be INSTANTLY READABLE at 32x32 pixel display size — bold, high-contrast shapes.
- Premium mobile game quality: glossy surface, specular highlight, 3D depth feel.
${asset.id.includes('hp') || asset.id.includes('heart') || asset.id.includes('health') ?
  '- HEALTH icon: rich red/crimson heart or shield, glass-like specular, inner glow.' : ''}
${asset.id.includes('score') || asset.id.includes('coin') || asset.id.includes('star') ?
  '- SCORE/CURRENCY icon: gold metallic coin or faceted gem, bright specular dot.' : ''}
${asset.id.includes('mana') || asset.id.includes('energy') ?
  '- MANA/ENERGY icon: blue/purple crystal orb, magical sparkle, internal glow.' : ''}
- Drop shadow for floating appearance. Material matches game theme.
- Output: EXACTLY ${w}x${h} pixels. Displayed at 32-48px in-game as HUD element.
- Icon must occupy 70-90% of the frame, perfectly centered.
- NO text, NO numbers, NO frames.`, transparent: needsTransparent }
  }

  // ─── Thumbnail ───
  if (isThumbnail) {
    return { prompt: `[TASK] Create game store cover art / marketing thumbnail for "${gameTitle}" (${genre}).

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
- Output: EXACTLY ${w}x${h} pixels. Landscape orientation.
- This is displayed as-is in the game platform — pixel-perfect composition required.`, transparent: needsTransparent }
  }

  // ─── Item ───
  if (isItem) {
    return { prompt: `[TASK] Create a game item/collectible sprite for "${gameTitle}" (${genre}).

${ART_DIR}

[ITEM DESCRIPTION] ${asset.desc}

[STRICT RULES]
- EXACTLY 1 item, CENTERED with 20% padding.
- ${BG}
- Item must look DESIRABLE — players should want to collect it.
- Readable at 32x32 display size.
- NO character hands holding the item — item floats alone.
- Luminous surface with internal glow or magical aura. Fresnel rim lighting.
- Subtle sparkle/particle effects suggesting value or power.
- Output: EXACTLY ${w}x${h} pixels. Displayed at 32-64px in-game via drawImage().
- Subject must occupy 60-80% of the frame, well-centered.
- NO text, NO UI, NO hands.`, transparent: needsTransparent }
  }

  // ─── Tile / Platform ───
  if (isTile) {
    return { prompt: `[TASK] Create a game tile/platform piece for "${gameTitle}" (${genre}).

${ART_DIR}

[TILE DESCRIPTION] ${asset.desc}

[STRICT RULES]
- SEAMLESS TILEABLE texture/platform piece.
- ${BG}
- Edges designed for tiling — left matches right, top matches bottom.
- Visible material texture: stone cracks, wood grain, metal rivets, crystal facets.
- Consistent lighting direction (top-left).
- Output: EXACTLY ${w}x${h} pixels. Tiled in-game using drawImage() in a grid pattern.
- Every pixel of the ${w}x${h} canvas must be part of the tile — no wasted space.`, transparent: needsTransparent }
  }

  // ─── Generic fallback ───
  return { prompt: `[TASK] Create a game asset for "${gameTitle}" (${genre}).

${ART_DIR}

[ASSET DESCRIPTION] ${asset.desc}

[STRICT RULES]
- EXACTLY 1 object/element, CENTERED in frame.
- ${BG}
- Game-ready: clean edges, consistent lighting, readable at display size.
- Output: EXACTLY ${w}x${h} pixels. The game engine uses this at this exact resolution.
- Subject must be well-centered and occupy 60-85% of the canvas.
- NO text, NO UI, NO watermarks.`, transparent: needsTransparent }
}

/** Prompt for the thumbnail-from-assets compositor path. */
export function buildThumbnailCompositePrompt(gameTitle: string, genre: string): string {
  return `[TASK] Create a game store thumbnail/poster using the attached game assets as reference.

[GAME] "${gameTitle}" (${genre})

[ATTACHED IMAGES] These are actual in-game character and background assets. Use them as the basis for the thumbnail composition.

[REQUIREMENTS]
- Create a marketing-quality game poster/thumbnail at EXACTLY 800x600 pixels.
- Use the characters and visual style from the attached images — do NOT redesign them.
- Compose a dramatic scene: character in action pose, atmospheric background from the game.
- Add the game title "${gameTitle}" in large, stylish, genre-appropriate typography.
  Title must be READABLE and integrated into the composition.
- Professional color grading, dramatic lighting, depth of field.
- Quality level: Steam indie game capsule art / mobile game store banner.
- Landscape orientation. Full scene — NOT transparent, NOT black void.
- NO watermarks, NO borders.`
}
