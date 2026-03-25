/**
 * Gemini 3.1 Flash Image API — PNG 에셋 생성기
 * 디자이너 에이전트가 게임 에셋을 PNG로 생성할 때 사용
 */
import { GoogleGenAI } from '@google/genai'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'

const MODEL = 'gemini-2.0-flash-preview-image-generation'

let client: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  if (!client) {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY not set')
    client = new GoogleGenAI({ apiKey: key })
  }
  return client
}

export interface AssetSpec {
  name: string        // e.g. 'player', 'enemy', 'bg-layer1'
  prompt: string      // 이미지 생성 프롬프트
  filePath: string    // 저장 경로 e.g. 'public/games/my-game/assets/player.png'
}

/**
 * Gemini로 PNG 이미지 생성 후 파일 저장
 */
export async function generateImage(spec: AssetSpec): Promise<boolean> {
  try {
    const ai = getClient()
    const dir = dirname(spec.filePath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    console.log(`  🎨 [Gemini] Generating: ${spec.name}...`)

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{
        role: 'user',
        parts: [{ text: spec.prompt }],
      }],
      config: {
        responseModalities: ['Text', 'Image'],
      },
    })

    // Extract image from response
    if (response.candidates && response.candidates[0]) {
      for (const part of response.candidates[0].content?.parts || []) {
        if (part.inlineData) {
          const buf = Buffer.from(part.inlineData.data!, 'base64')
          writeFileSync(spec.filePath, buf)
          console.log(`  ✅ [Gemini] Saved: ${spec.filePath} (${(buf.length / 1024).toFixed(1)}KB)`)
          return true
        }
      }
    }

    console.log(`  ⚠️ [Gemini] No image in response for ${spec.name}`)
    return false
  } catch (err) {
    console.error(`  ❌ [Gemini] Failed ${spec.name}:`, (err as Error).message)
    return false
  }
}

/**
 * 게임 에셋 일괄 생성
 */
export async function generateGameAssets(
  gameId: string,
  gameTitle: string,
  genre: string,
  style: string,
  assetsDir: string,
): Promise<{ generated: string[]; failed: string[] }> {
  const generated: string[] = []
  const failed: string[] = []

  // 공통 품질 지시문
  const Q = `QUALITY STANDARD: This must look like a professional Steam indie game or polished mobile game (Hollow Knight, Dead Cells, Celeste, Hades, Monument Valley level).
Art direction: Rich hand-painted or stylized digital art. NOT flat vector, NOT clipart, NOT stock photo.
Lighting: Dramatic rim lighting, ambient occlusion, subsurface scattering where appropriate.
Color: Professional color grading with intentional palette — limited but rich, with clear warm/cool contrast.
Detail: Texture details visible — fabric folds, metal scratches, wood grain, magical glow, atmospheric haze.
Consistency: All assets must share the same art style, lighting direction (top-left), and color palette.`

  const assets: AssetSpec[] = [
    {
      name: 'player',
      filePath: `${assetsDir}/player.png`,
      prompt: `Professional game character sprite for "${gameTitle}" (${genre}).
${Q}
Style: ${style}.
Character design: Distinctive silhouette recognizable at any size. Personality visible through pose and proportions.
Rendering: Semi-realistic or stylized digital painting. Rich shading with 3+ light sources (key, fill, rim).
Details: Costume accessories, weapon/tool if relevant, subtle animation-ready pose (slightly dynamic, not stiff T-pose).
Technical: Single character, centered, on solid dark (#0a0a1a) background. 512x512 pixels.
Hair/cloth physics implied through flowing shapes. Eyes/face should convey character personality.
Reference quality: Hollow Knight character detail level, Dead Cells sprite richness.
Do NOT include: text, UI, watermarks, borders, multiple characters.`,
    },
    {
      name: 'enemy',
      filePath: `${assetsDir}/enemy.png`,
      prompt: `Professional game enemy/antagonist sprite for "${gameTitle}" (${genre}).
${Q}
Style: ${style}.
Design: Immediately threatening but aesthetically pleasing. Clear visual language that says "danger".
Color: Contrasting palette from hero — if hero is cool-toned, enemy is warm. Red/orange/purple threat accents.
Rendering: Same art quality as player sprite. Dramatic shadows, glowing weak points or eyes.
Details: Armor/carapace texture, battle damage, energy effects, menacing posture.
Technical: Single enemy, centered, on solid dark (#0a0a1a) background. 512x512 pixels.
Reference quality: Hades enemy design, Slay the Spire monster quality.
Do NOT include: text, UI, watermarks, borders, multiple characters.`,
    },
    {
      name: 'bg-layer1',
      filePath: `${assetsDir}/bg-layer1.png`,
      prompt: `Professional game background (far/sky layer) for "${gameTitle}" (${genre}).
${Q}
Style: ${style}. This is the DISTANT background — sky, horizon, far mountains/structures.
Composition: Epic sense of scale and depth. Atmospheric perspective (distant = hazier, less saturated).
Rendering: Painterly style with visible brushwork. Volumetric clouds/fog, god rays, aurora, or starfield.
Color: Rich gradient sky. Subtle color temperature shift from horizon (warm) to zenith (cool).
Mood: Sets the emotional tone of the entire game — mysterious, epic, serene, or ominous depending on genre.
Technical: 1920x1080 pixels. Horizontal seamless tiling preferred. No foreground objects.
Reference quality: Ori and the Blind Forest backgrounds, Celeste environment art.
Do NOT include: text, UI, characters, foreground objects, ground-level details.`,
    },
    {
      name: 'bg-layer2',
      filePath: `${assetsDir}/bg-layer2.png`,
      prompt: `Professional game background (mid-ground layer) for "${gameTitle}" (${genre}).
${Q}
Style: ${style}. This is the MIDDLE layer — silhouetted structures, trees, terrain between player and sky.
Composition: Parallax-ready. Elements should create depth when scrolling at different speed from bg-layer1.
Rendering: Darker silhouettes with subtle internal detail. Edge lighting from background layer.
Details: Architecture/vegetation silhouettes with fine edge detail. Occasional glowing windows, fireflies, crystals.
Color: Darker than bg-layer1, uses desaturated versions of the main palette. Some areas semi-transparent.
Technical: 1920x1080 pixels. Lower 30% should have content, upper can be sparse/transparent.
Reference quality: Dead Cells parallax layers, Hollow Knight environment depth.
Do NOT include: text, UI, characters, HUD elements.`,
    },
    {
      name: 'powerup',
      filePath: `${assetsDir}/powerup.png`,
      prompt: `Professional game power-up/collectible item for "${gameTitle}" (${genre}).
${Q}
Style: ${style}. A collectible item that players WANT to grab.
Design: Immediately readable as "beneficial pickup". Orb, crystal, potion, rune, or genre-appropriate form.
Rendering: Glossy/luminous surface with internal glow. Fresnel rim lighting. Subtle particle sparkle effect.
Color: Bright, saturated accent color that pops against dark game backgrounds. Golden/cyan/emerald glow.
Details: Internal swirling energy, faceted crystal reflections, or magical rune markings.
Technical: Single item, centered, on solid dark (#0a0a1a) background. 256x256 pixels.
Reference quality: Hades boon pickup quality, Hollow Knight charm detail.
Do NOT include: text, hands, characters.`,
    },
    {
      name: 'effect-hit',
      filePath: `${assetsDir}/effect-hit.png`,
      prompt: `Professional game impact/hit VFX for "${gameTitle}" (${genre}).
${Q}
Style: ${style}. A dramatic hit/explosion/impact visual effect.
Design: Radial energy burst with directional force lines. Layered: core flash → energy ring → outer particles.
Rendering: HDR-style bloom at center (pure white core). Energy tendrils and spark trails.
Color: Hot center (white→yellow) transitioning to themed color (orange/blue/purple) at edges.
Details: Speed lines, scattered debris particles, shockwave ring, chromatic aberration edge.
Technical: Centered explosion, on solid dark (#0a0a1a) background. 512x512 pixels.
Reference quality: Dead Cells hit effects, Hades attack impact quality.
Do NOT include: text, characters, UI.`,
    },
    {
      name: 'ui-heart',
      filePath: `${assetsDir}/ui-heart.png`,
      prompt: `Professional game health/HP icon for "${gameTitle}" (${genre}).
${Q}
Style: ${style}. A health indicator icon for the game HUD.
Design: Heart, shield, or genre-appropriate health symbol. Polished 3D-rendered look.
Rendering: Glossy surface with specular highlight. Subtle inner glow. Drop shadow.
Material: Crystal heart, armored shield, magical orb, or organic life force — match game theme.
Color: Rich red/crimson with highlight and shadow. Or theme-matching if not heart-shaped.
Technical: Single icon, centered, on solid dark (#0a0a1a) background. 128x128 pixels.
Reference quality: Hollow Knight mask shard quality, mobile game premium UI.
Do NOT include: text, numbers, bars.`,
    },
    {
      name: 'ui-star',
      filePath: `${assetsDir}/ui-star.png`,
      prompt: `Professional game score/currency icon for "${gameTitle}" (${genre}).
${Q}
Style: ${style}. A score/currency/collectible counter icon for HUD.
Design: Coin, gem, star, soul, or genre-appropriate currency. Premium mobile game quality.
Rendering: Metallic or crystalline surface. Specular highlights, subtle rotation-implied shading.
Material: Gold coin with embossed design, faceted gemstone, magical essence orb — match game theme.
Color: Rich gold/amber with bright specular. Or gem colors (sapphire, emerald, ruby) for fantasy.
Technical: Single icon, centered, on solid dark (#0a0a1a) background. 128x128 pixels.
Reference quality: Clash Royale gem quality, Monument Valley collectible detail.
Do NOT include: text, numbers, UI frames.`,
    },
    {
      name: 'thumbnail',
      filePath: `${assetsDir}/thumbnail.png`,
      prompt: `Professional game store thumbnail/key art for "${gameTitle}" (${genre}).
${Q}
Style: ${style}. This is the game's MARKETING IMAGE — the first thing players see.
Composition: Dynamic action scene or dramatic hero pose. Rule of thirds. Clear focal point.
Content: Main character prominent (30-40% of frame), key game mechanic visible, atmospheric background.
Typography: Game title "${gameTitle}" in stylish, genre-appropriate lettering — large, readable, with effects
(glow, shadow, metallic, emboss). Title should be integrated into the composition, not slapped on.
Mood: Exciting, intriguing — makes you want to click and play immediately.
Color: High contrast, saturated key colors. Professional color grading like movie poster.
Technical: 800x600 pixels. Landscape orientation. Marketing-quality composition.
Reference quality: Steam indie game capsule art (Hades, Celeste, Slay the Spire cover quality).
Must include: game title text, main character, game atmosphere.`,
    },
  ]

  for (const asset of assets) {
    const ok = await generateImage(asset)
    if (ok) generated.push(asset.name)
    else failed.push(asset.name)
    // Rate limit: 500ms between requests
    await new Promise(r => setTimeout(r, 500))
  }

  // Generate manifest.json
  const manifest = {
    gameId,
    generatedBy: 'gemini-3.1-flash-image',
    format: 'png',
    assets: Object.fromEntries(
      assets.map(a => [
        a.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
        { file: `${a.name}.png`, desc: a.name }
      ])
    ),
  }
  writeFileSync(`${assetsDir}/manifest.json`, JSON.stringify(manifest, null, 2))
  console.log(`  📋 manifest.json saved`)

  return { generated, failed }
}
