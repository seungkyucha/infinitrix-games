/**
 * Gemini 3.1 Flash Image API — PNG 에셋 생성기
 * 플래너가 정의한 에셋 목록을 기반으로 동적 생성
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
  size: string // "512x512"
}

export interface ArtDirection {
  artStyle: string
  colorPalette: string
  mood: string
  reference: string
  assets: AssetDef[]
}

/**
 * 기획서에서 에셋 요구사항 YAML 블록 파싱
 */
export function parseAssetRequirements(specContent: string): ArtDirection | null {
  // Extract yaml block between ```yaml and ```
  const yamlMatch = specContent.match(/```yaml\s*\n#\s*asset-requirements\s*\n([\s\S]*?)```/)
  if (!yamlMatch) return null

  const yaml = yamlMatch[1]

  // Parse simple YAML fields
  const get = (key: string) => {
    const m = yaml.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, 'm'))
    return m?.[1]?.trim() ?? ''
  }

  const artStyle = get('art-style')
  const colorPalette = get('color-palette')
  const mood = get('mood')
  const reference = get('reference')

  // Parse assets list
  const assets: AssetDef[] = []
  const assetBlocks = yaml.split(/\n\s*-\s+id:\s*/).slice(1)
  for (const block of assetBlocks) {
    const idMatch = block.match(/^(\S+)/)
    const descMatch = block.match(/desc:\s*"([^"]+)"/)
    const sizeMatch = block.match(/size:\s*"?(\d+x\d+)"?/)
    if (idMatch) {
      assets.push({
        id: idMatch[1].trim(),
        desc: descMatch?.[1]?.trim() ?? idMatch[1].trim(),
        size: sizeMatch?.[1]?.trim() ?? '512x512',
      })
    }
  }

  if (assets.length === 0) return null
  return { artStyle, colorPalette, mood, reference, assets }
}

/**
 * 단일 PNG 이미지 생성
 */
async function generateImage(prompt: string, filePath: string, name: string): Promise<boolean> {
  try {
    const ai = getClient()
    const dir = dirname(filePath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    console.log(`  🎨 [Gemini] Generating: ${name}...`)

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseModalities: ['Text', 'Image'] },
    })

    if (response.candidates && response.candidates[0]) {
      for (const part of response.candidates[0].content?.parts || []) {
        if (part.inlineData) {
          const buf = Buffer.from(part.inlineData.data!, 'base64')
          writeFileSync(filePath, buf)
          console.log(`  ✅ [Gemini] Saved: ${name} (${(buf.length / 1024).toFixed(1)}KB)`)
          return true
        }
      }
    }

    console.log(`  ⚠️ [Gemini] No image in response for ${name}`)
    return false
  } catch (err) {
    console.error(`  ❌ [Gemini] Failed ${name}:`, (err as Error).message)
    return false
  }
}

/**
 * 프롬프트 빌더 — 에셋 정의 + 아트 디렉션을 정밀한 Gemini 프롬프트로 변환
 *
 * 핵심 원칙:
 * - 정확히 1개의 대상만 렌더링 (시트/여러 개 금지)
 * - 배경 투명/불투명 명확 지정
 * - 게임 엔진에서 바로 사용 가능한 구도
 * - 에셋 간 일관된 아트 스타일
 */
function buildPrompt(asset: AssetDef, art: ArtDirection, gameTitle: string, genre: string): string {
  const [w, h] = asset.size.split('x').map(Number)

  // 에셋 유형 분류
  const isBackground = asset.id.startsWith('bg-') || asset.id.includes('background') || asset.id.includes('ground')
  const isEffect = asset.id.startsWith('effect-') || asset.id.includes('particle') || asset.id.includes('explosion')
  const isUI = asset.id.startsWith('ui-') || asset.id.includes('icon') || asset.id.includes('button')
  const isThumbnail = asset.id === 'thumbnail'
  const isTile = asset.id.includes('tile') || asset.id.includes('platform') || asset.id.includes('block')
  const isItem = asset.id.includes('item-') || asset.id.includes('powerup') || asset.id.includes('coin') ||
                 asset.id.includes('gem') || asset.id.includes('potion') || asset.id.includes('weapon') ||
                 asset.id.includes('spell') || asset.id.includes('card')
  const isBoss = asset.id.includes('boss')
  const isCharacter = !isBackground && !isEffect && !isUI && !isThumbnail && !isTile && !isItem &&
    (asset.id.includes('player') || asset.id.includes('enemy') || asset.id.includes('npc') ||
     asset.id.includes('character') || asset.id.includes('hero') || asset.id.includes('mob') || isBoss)

  // 공통 아트 디렉션
  const STYLE = art.artStyle || 'stylized digital art, hand-painted feel'
  const PALETTE = art.colorPalette || 'rich, intentional, limited but vibrant'
  const MOOD = art.mood || 'dramatic and atmospheric'
  const REF = art.reference || 'Hollow Knight, Dead Cells, Celeste'

  const QUALITY = `[ART DIRECTION]
Style: ${STYLE}
Color palette: ${PALETTE}
Mood: ${MOOD}
Reference games: ${REF}
Quality level: Professional Steam indie game / polished mobile game (NOT flat vector, NOT clipart, NOT stock art, NOT generic AI look)`

  // ═══════════════════════════════════════
  // 캐릭터 (플레이어, 적, NPC, 보스)
  // ═══════════════════════════════════════
  if (isCharacter) {
    const facing = asset.desc.match(/facing\s+(left|right|front|back)/i)?.[1] || 'front'
    const pose = asset.desc.match(/pose:\s*([^,.]+)/i)?.[1] || 'idle standing'
    return `[TASK] Generate a SINGLE game character sprite for use in an HTML5 Canvas game.
[GAME] "${gameTitle}" (${genre})
${QUALITY}

[SUBJECT] ${asset.desc}

[CRITICAL RULES]
- Render exactly ONE character. No sprite sheet, no multiple poses, no variations.
- Single idle/standing pose (${pose}), facing ${facing}.
- Character must be CENTERED in the frame with consistent padding (15% margin on all sides).
- Background: solid pure black (#000000). The game engine will use drawImage() to composite this onto the game scene.
  → Do NOT use transparency/alpha. Use solid black background instead.
  → The coder will treat black as the "empty" area.
- No ground, no shadow on floor, no environment — character floats on black void.

[RENDERING]
- ${isBoss ? 'BOSS character — larger, more imposing, more detailed than regular enemies. Dramatic aura/glow effects.' : ''}
- Rich shading: key light (top-left), fill light (subtle), rim light (edge highlight).
- Visible texture details: fabric weave, metal scratches, skin pores, armor rivets.
- Character silhouette must be instantly recognizable even at 64x64 display size.
- ${w >= 512 ? 'High detail: face expression, finger details, clothing folds, material reflections.' : 'Clean readable shapes, bold outlines, clear color areas.'}

[OUTPUT] ${w}x${h} pixels. Single character. Black background. No text, no UI, no borders, no watermarks.`
  }

  // ═══════════════════════════════════════
  // 배경 레이어
  // ═══════════════════════════════════════
  if (isBackground) {
    const layer = asset.id.includes('far') || asset.id.includes('layer1') ? 'FAR (sky/horizon)' :
                  asset.id.includes('mid') || asset.id.includes('layer2') ? 'MID (terrain silhouettes)' :
                  asset.id.includes('near') || asset.id.includes('ground') ? 'NEAR (ground/platform)' : 'GENERAL'
    return `[TASK] Generate a game background layer for parallax scrolling in an HTML5 Canvas game.
[GAME] "${gameTitle}" (${genre})
${QUALITY}

[SUBJECT] ${asset.desc}
[LAYER TYPE] ${layer}

[CRITICAL RULES]
- This is a BACKGROUND LAYER, not a complete scene. It will be composited with other layers.
- NO characters, NO enemies, NO items, NO UI elements, NO text anywhere in the image.
- ${layer.includes('FAR') ? 'Atmospheric, hazy, desaturated. Sky gradients, distant mountains/structures, clouds, stars. Softest layer.' : ''}
- ${layer.includes('MID') ? 'Medium detail silhouettes: buildings, trees, rock formations. Slightly transparent areas for layering. Darker than far layer.' : ''}
- ${layer.includes('NEAR') ? 'Highest detail ground elements: platforms, terrain texture, foliage. This layer is closest to the player.' : ''}
- Background: fully painted, NO transparent areas. The image fills the entire canvas.
- Suitable for horizontal scrolling (consider left-right continuity for tiling).

[RENDERING]
- Painterly digital art style with visible brushwork.
- Atmospheric perspective: farther = more haze, less saturation.
- Color temperature shift: warm horizon → cool upper sky (for far layer).
- Rich environmental storytelling through small details.

[OUTPUT] ${w}x${h} pixels. Full-bleed background layer. No characters, no text, no UI.`
  }

  // ═══════════════════════════════════════
  // VFX 이펙트
  // ═══════════════════════════════════════
  if (isEffect) {
    return `[TASK] Generate a game visual effect (VFX) for an HTML5 Canvas game.
[GAME] "${gameTitle}" (${genre})
${QUALITY}

[SUBJECT] ${asset.desc}

[CRITICAL RULES]
- Render exactly ONE effect instance, CENTERED in frame.
- Background: solid pure black (#000000). The game engine will composite this using additive blending or alpha.
  → Bright parts = visible effect. Black = invisible in game.
  → Design the effect knowing that black areas will become transparent in the game.
- Effect should be RADIAL/CENTERED — emanating from the center outward.
- No characters, no environment, no text.

[RENDERING]
- HDR-style bloom: pure white/yellow core → themed color mid → fading edges.
- Energy tendrils, speed lines, spark particles scattered outward.
- Multiple concentric layers: shockwave ring, inner flash, outer particle scatter.
- ${asset.id.includes('hit') ? 'Impact/hit effect: short burst, directional energy lines, debris particles.' : ''}
- ${asset.id.includes('explosion') ? 'Explosion: large radial burst, fire/smoke layering, flying debris.' : ''}
- ${asset.id.includes('heal') ? 'Healing: upward-floating particles, soft green/white glow, gentle sparkles.' : ''}
- ${asset.id.includes('dash') ? 'Dash/speed: horizontal motion blur, afterimage trail, wind lines.' : ''}

[OUTPUT] ${w}x${h} pixels. Single centered effect. Black background. No text, no characters.`
  }

  // ═══════════════════════════════════════
  // UI 아이콘
  // ═══════════════════════════════════════
  if (isUI) {
    return `[TASK] Generate a game UI icon for an HTML5 Canvas game HUD.
[GAME] "${gameTitle}" (${genre})
${QUALITY}

[SUBJECT] ${asset.desc}

[CRITICAL RULES]
- Render exactly ONE icon, CENTERED with consistent padding (20% margin).
- Background: solid pure black (#000000). The game engine will drawImage() this onto the HUD.
- Icon must be INSTANTLY READABLE at small display sizes (32x32 to 64x64 on screen).
- Bold, clear shapes. High contrast. No fine detail that disappears at small size.
- No text, no numbers, no labels — just the pure icon graphic.

[RENDERING]
- Premium mobile game quality: glossy surface, specular highlights, subtle 3D depth.
- ${asset.id.includes('hp') || asset.id.includes('heart') || asset.id.includes('health') ?
    'Health icon: rich red/crimson, heart or shield shape, inner glow, glass-like specular.' : ''}
- ${asset.id.includes('score') || asset.id.includes('coin') || asset.id.includes('star') || asset.id.includes('gem') ?
    'Currency/score icon: gold/amber metallic sheen, faceted gem or embossed coin, bright specular dot.' : ''}
- ${asset.id.includes('mana') || asset.id.includes('energy') || asset.id.includes('mp') ?
    'Mana/energy icon: blue/purple crystal or orb, internal glow, magical sparkle.' : ''}
- Drop shadow below icon for floating appearance.
- Material should match game theme (crystal, metal, organic, magical).

[OUTPUT] ${w}x${h} pixels. Single icon. Black background. No text, no numbers, no frames.`
  }

  // ═══════════════════════════════════════
  // 썸네일 / 키 아트
  // ═══════════════════════════════════════
  if (isThumbnail) {
    return `[TASK] Generate game store cover art / marketing thumbnail for a game platform.
[GAME] "${gameTitle}" (${genre})
${QUALITY}

[SUBJECT] ${asset.desc}

[CRITICAL RULES]
- This is the game's MARKETING IMAGE — the first thing players see on the platform.
- Must include the game title "${gameTitle}" rendered in stylish, genre-appropriate typography.
  → Title text must be LARGE, READABLE, and integrated into the composition (not slapped on).
  → Use drop shadow, glow, metallic, or emboss effect on the title text.
- Must show the main character + at least one key gameplay element (enemies, environment, items).
- Background is a COMPLETE scene (not transparent, not black void).

[COMPOSITION]
- Rule of thirds. Main character at 30-40% of frame, slightly off-center.
- Dynamic angle or action pose — movement, drama, tension.
- Clear visual hierarchy: Title → Character → Background.
- High contrast, saturated accent colors to catch attention in a grid of thumbnails.
- Professional color grading like movie poster / Steam capsule art.

[OUTPUT] ${w}x${h} pixels. Landscape orientation. Full scene with title text. Marketing quality.`
  }

  // ═══════════════════════════════════════
  // 타일 / 플랫폼
  // ═══════════════════════════════════════
  if (isTile) {
    return `[TASK] Generate a game tile/platform asset for an HTML5 Canvas game.
[GAME] "${gameTitle}" (${genre})
${QUALITY}

[SUBJECT] ${asset.desc}

[CRITICAL RULES]
- Render a SEAMLESS TILEABLE texture/platform piece.
- Background: solid pure black (#000000) around the tile shape.
- The tile edges should be designed for tiling — left edge matches right, top matches bottom where applicable.
- Single tile piece, not a grid of tiles.

[RENDERING]
- Visible material texture: stone cracks, wood grain, metal rivets, crystal facets.
- Subtle lighting consistent with game's light direction (top-left).
- Edge details: worn corners, moss growth, damage marks for environmental storytelling.

[OUTPUT] ${w}x${h} pixels. Single tileable piece. Black background outside the tile shape.`
  }

  // ═══════════════════════════════════════
  // 아이템 / 수집물
  // ═══════════════════════════════════════
  if (isItem) {
    return `[TASK] Generate a game collectible/item sprite for an HTML5 Canvas game.
[GAME] "${gameTitle}" (${genre})
${QUALITY}

[SUBJECT] ${asset.desc}

[CRITICAL RULES]
- Render exactly ONE item, CENTERED in frame with padding (20% margin).
- Background: solid pure black (#000000). The game engine composites this onto the game world.
- Item must look DESIRABLE — players should WANT to collect it.
- Recognizable at small display sizes (32x32 to 64x64 on screen).
- No character hands/arms holding the item. Item floats alone.

[RENDERING]
- Luminous/glossy surface with internal glow or magical aura.
- Fresnel rim lighting around edges.
- ${asset.id.includes('weapon') || asset.id.includes('sword') || asset.id.includes('staff') ?
    'Weapon: metallic blade with reflection, magical glow on edge, ornate handle details.' : ''}
- ${asset.id.includes('potion') || asset.id.includes('flask') ?
    'Potion: glass bottle with liquid refraction, glowing contents, cork detail.' : ''}
- ${asset.id.includes('card') ?
    'Card: ornate border, centered symbol/illustration, slight 3D tilt with perspective.' : ''}
- ${asset.id.includes('coin') || asset.id.includes('gem') ?
    'Treasure: metallic sheen or crystal facets, bright specular highlight, slight rotation implied.' : ''}
- Subtle sparkle/particle effects around the item suggesting value/power.

[OUTPUT] ${w}x${h} pixels. Single item. Black background. No text, no UI, no hands.`
  }

  // ═══════════════════════════════════════
  // 기타 (분류되지 않은 에셋)
  // ═══════════════════════════════════════
  return `[TASK] Generate a game asset for an HTML5 Canvas game.
[GAME] "${gameTitle}" (${genre})
${QUALITY}

[SUBJECT] ${asset.desc}

[CRITICAL RULES]
- Render exactly ONE object/element, CENTERED in frame.
- Background: solid pure black (#000000). Game engine composites via drawImage().
- Must be game-ready: clean edges, consistent lighting, readable at display size.
- No text, no UI elements, no watermarks.

[RENDERING]
- Consistent with the game's overall art direction and color palette.
- Professional quality texturing, shading, and lighting.
- Clear silhouette recognizable even when scaled down.

[OUTPUT] ${w}x${h} pixels. Single asset. Black background. No text, no UI.`
}

/**
 * 기획서 기반 게임 에셋 일괄 생성
 */
export async function generateGameAssets(
  gameId: string,
  gameTitle: string,
  genre: string,
  specContent: string,
  assetsDir: string,
): Promise<{ generated: string[]; failed: string[] }> {
  const generated: string[] = []
  const failed: string[] = []

  // 기획서에서 에셋 요구사항 파싱
  const art = parseAssetRequirements(specContent)

  if (!art || art.assets.length === 0) {
    console.log(`  ⚠️ [Gemini] 기획서에 에셋 요구사항(asset-requirements) 없음 — 기본 에셋 생성`)
    // 기본 에셋 폴백
    const defaultArt: ArtDirection = {
      artStyle: `${genre} game, polished indie quality`,
      colorPalette: '',
      mood: 'atmospheric and engaging',
      reference: 'Steam indie game quality',
      assets: [
        { id: 'player', desc: `Main player character for ${gameTitle}`, size: '512x512' },
        { id: 'enemy', desc: `Basic enemy for ${gameTitle}`, size: '512x512' },
        { id: 'bg-far', desc: 'Distant background — sky and horizon', size: '1920x1080' },
        { id: 'bg-mid', desc: 'Mid-ground background — terrain silhouettes', size: '1920x1080' },
        { id: 'item-powerup', desc: 'Power-up collectible item', size: '256x256' },
        { id: 'effect-hit', desc: 'Hit/impact visual effect', size: '512x512' },
        { id: 'ui-hp', desc: 'Health indicator icon', size: '128x128' },
        { id: 'ui-score', desc: 'Score/currency icon', size: '128x128' },
        { id: 'thumbnail', desc: `Game cover art with title "${gameTitle}" and main character`, size: '800x600' },
      ],
    }
    return generateFromArtDirection(gameId, gameTitle, genre, defaultArt, assetsDir)
  }

  console.log(`  📋 [Gemini] 기획서 에셋 ${art.assets.length}개 발견 (style: ${art.artStyle})`)
  return generateFromArtDirection(gameId, gameTitle, genre, art, assetsDir)
}

async function generateFromArtDirection(
  gameId: string,
  gameTitle: string,
  genre: string,
  art: ArtDirection,
  assetsDir: string,
): Promise<{ generated: string[]; failed: string[] }> {
  const generated: string[] = []
  const failed: string[] = []

  if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true })

  for (const asset of art.assets) {
    const filePath = `${assetsDir}/${asset.id}.png`
    const prompt = buildPrompt(asset, art, gameTitle, genre)
    const ok = await generateImage(prompt, filePath, asset.id)
    if (ok) generated.push(asset.id)
    else failed.push(asset.id)
    // Rate limit
    await new Promise(r => setTimeout(r, 600))
  }

  // manifest.json 생성
  const manifest = {
    gameId,
    generatedBy: 'gemini-flash-image',
    artDirection: {
      style: art.artStyle,
      palette: art.colorPalette,
      mood: art.mood,
      reference: art.reference,
    },
    format: 'png',
    assets: Object.fromEntries(
      art.assets.map(a => [
        a.id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
        { file: `${a.id}.png`, size: a.size, desc: a.desc },
      ])
    ),
  }
  writeFileSync(`${assetsDir}/manifest.json`, JSON.stringify(manifest, null, 2))
  console.log(`  📋 manifest.json saved (${art.assets.length} assets)`)

  return { generated, failed }
}
