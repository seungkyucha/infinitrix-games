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

  const assets: AssetSpec[] = [
    {
      name: 'player',
      filePath: `${assetsDir}/player.png`,
      prompt: `Game character sprite for "${gameTitle}" (${genre} game).
Style: ${style}. Top-down or side view.
Requirements: Single character on transparent/dark background, centered, 256x256 pixels,
clean edges, game-ready sprite, vibrant colors, detailed but readable at small sizes.
Do NOT include any text or UI elements.`,
    },
    {
      name: 'enemy',
      filePath: `${assetsDir}/enemy.png`,
      prompt: `Enemy character sprite for "${gameTitle}" (${genre} game).
Style: ${style}. Threatening but stylish design.
Requirements: Single enemy on transparent/dark background, centered, 256x256 pixels,
contrasting colors from player character, menacing appearance, game-ready sprite.
Do NOT include any text or UI elements.`,
    },
    {
      name: 'bg-layer1',
      filePath: `${assetsDir}/bg-layer1.png`,
      prompt: `Game background far layer for "${gameTitle}" (${genre} game).
Style: ${style}. This is the distant background layer.
Requirements: 1280x720 pixels, atmospheric background, suitable for parallax scrolling,
muted/darker tones, sky/horizon/distant landscape, seamless horizontally if possible.
Do NOT include any text, UI elements, or foreground objects.`,
    },
    {
      name: 'bg-layer2',
      filePath: `${assetsDir}/bg-layer2.png`,
      prompt: `Game background near layer for "${gameTitle}" (${genre} game).
Style: ${style}. This is the mid-ground layer.
Requirements: 1280x720 pixels, mid-distance elements (buildings, trees, rocks),
slightly transparent areas for layering, darker than the game area.
Do NOT include any text, UI elements, or characters.`,
    },
    {
      name: 'powerup',
      filePath: `${assetsDir}/powerup.png`,
      prompt: `Power-up item icon for "${gameTitle}" (${genre} game).
Style: ${style}. Glowing collectible item.
Requirements: 128x128 pixels, centered on dark background, shiny/glowing effect,
immediately recognizable as a beneficial pickup, vibrant colors.
Do NOT include any text.`,
    },
    {
      name: 'effect-hit',
      filePath: `${assetsDir}/effect-hit.png`,
      prompt: `Hit/explosion effect for "${gameTitle}" (${genre} game).
Style: ${style}. Impact or explosion visual.
Requirements: 256x256 pixels, radial burst/explosion, bright center fading outward,
transparent/dark edges, particle-like scatter, energetic and dynamic.
Do NOT include any text.`,
    },
    {
      name: 'ui-heart',
      filePath: `${assetsDir}/ui-heart.png`,
      prompt: `Health/heart UI icon for "${gameTitle}" (${genre} game).
Style: ${style}. Game HUD element.
Requirements: 64x64 pixels, clean icon on dark/transparent background,
glossy/3D feel, easily readable at small size, vibrant red or theme-matching color.
Do NOT include any text.`,
    },
    {
      name: 'ui-star',
      filePath: `${assetsDir}/ui-star.png`,
      prompt: `Score/star/coin UI icon for "${gameTitle}" (${genre} game).
Style: ${style}. Collectible/score indicator.
Requirements: 64x64 pixels, clean icon on dark/transparent background,
shiny gold/yellow, desirable look, easily readable at small size.
Do NOT include any text.`,
    },
    {
      name: 'thumbnail',
      filePath: `${assetsDir}/thumbnail.png`,
      prompt: `Game thumbnail/poster for "${gameTitle}" (${genre} game).
Style: ${style}. This is the game's cover art shown in the platform.
Requirements: 400x300 pixels, dramatic composition showing the game's core scene,
include the main character and key game elements, vibrant and eye-catching,
professional game marketing quality. The title "${gameTitle}" should be
prominently displayed in stylish lettering.`,
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
