/**
 * Real gameplay screenshot → thumbnail.png
 *
 * Serves public/ via a short-lived local HTTP server so absolute paths like
 * /engine/ix-engine.js and /games/<id>/assets/* resolve correctly. Puppeteer
 * loads the game, walks past TITLE, lets it render a few frames, and captures
 * a screenshot at 800×600.
 *
 * This is the canonical thumbnail source — no vector/SVG, no text-prompt cover.
 */
import puppeteer from 'puppeteer'
import http from 'http'
import { createReadStream, existsSync, mkdirSync, unlinkSync, statSync, writeFileSync } from 'fs'
import { dirname, resolve as resolvePath, extname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolvePath(__dirname, '..', '..')
const PUBLIC_ROOT = resolvePath(PROJECT_ROOT, 'public')

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.txt': 'text/plain; charset=utf-8',
}

function createStaticServer(rootDir: string): Promise<{ port: number; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0])
        const safePath = urlPath.replace(/\.\.+/g, '').replace(/^\/+/, '')
        let filePath = join(rootDir, safePath)
        if (existsSync(filePath) && statSync(filePath).isDirectory()) {
          filePath = join(filePath, 'index.html')
        }
        if (!existsSync(filePath)) {
          res.writeHead(404); res.end('not found'); return
        }
        const mime = MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
        res.writeHead(200, { 'content-type': mime, 'cache-control': 'no-store' })
        createReadStream(filePath).pipe(res)
      } catch (err) {
        res.writeHead(500); res.end(String(err))
      }
    })
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      resolve({
        port,
        close: () => new Promise<void>((r) => server.close(() => r())),
      })
    })
  })
}

export interface ScreenshotOptions {
  gameId: string
  outputPath?: string
  width?: number
  height?: number
  warmupMs?: number
  timeoutMs?: number
  /** Bytes — if final screenshot is smaller, treat as blank/broken. Default 15KB. */
  minSizeBytes?: number
}

export interface ScreenshotResult {
  /** True if the screenshot is a plausible gameplay frame (size threshold + no runtime errors). */
  ok: boolean
  /** Path of saved file (PNG), or undefined if capture itself failed. */
  path?: string
  /** Screenshot size in bytes. */
  sizeBytes: number
  /** Captured pageerror / console.error messages during load + warmup. */
  pageErrors: string[]
  /** Non-fatal reason strings — e.g. "size below threshold", "3 page errors". */
  warnings: string[]
}

/**
 * Captures a gameplay screenshot and reports runtime health signals.
 * A "broken" result (ok=false) signals cycle.ts to halt deploy and force a coder fix.
 */
export async function captureGameplayScreenshot(opts: ScreenshotOptions): Promise<ScreenshotResult> {
  const {
    gameId,
    outputPath = resolvePath(PUBLIC_ROOT, 'games', gameId, 'assets', 'thumbnail.png'),
    width = 800,
    height = 600,
    warmupMs = 3500,
    timeoutMs = 30000,
    minSizeBytes = 15000,
  } = opts

  const result: ScreenshotResult = { ok: false, sizeBytes: 0, pageErrors: [], warnings: [] }

  const gamePath = resolvePath(PUBLIC_ROOT, 'games', gameId, 'index.html')
  if (!existsSync(gamePath)) {
    console.log(`  ⚠️ [Screenshot] game index not found: ${gamePath}`)
    result.warnings.push('game index missing')
    return result
  }

  const server = await createStaticServer(PUBLIC_ROOT)
  const url = `http://127.0.0.1:${server.port}/games/${gameId}/index.html`
  console.log(`  📸 [Screenshot] serving ${PUBLIC_ROOT} on :${server.port} — loading ${url.slice(-60)}`)

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=${width},${height}`],
      timeout: timeoutMs,
    })
    const page = await browser.newPage()
    await page.setViewport({ width, height })

    page.on('pageerror', (e) => result.pageErrors.push(String(e).slice(0, 300)))
    page.on('console', (msg) => {
      const t = msg.type()
      if (t === 'error') {
        const text = msg.text()
        // Filter out harmless 404s for optional assets — keep code-level errors only.
        if (!/Failed to load resource.*404/.test(text)) {
          result.pageErrors.push(`console.error: ${text.slice(0, 200)}`)
        }
      }
    })

    await page.goto(url, { waitUntil: 'networkidle0', timeout: timeoutMs }).catch(() => {})

    // Title → Space/Click to enter PLAY
    await new Promise((r) => setTimeout(r, 1500))
    await page.keyboard.press('Space').catch(() => {})
    await new Promise((r) => setTimeout(r, 250))
    await page.mouse.click(width / 2, height / 2).catch(() => {})

    // Gameplay warmup
    await new Promise((r) => setTimeout(r, warmupMs))

    // Input burst so the scene has action/movement, not a frozen spawn pose
    const burst = ['KeyD', 'KeyD', 'Space', 'KeyS', 'KeyA'] as const
    for (const key of burst) {
      await page.keyboard.press(key as import('puppeteer').KeyInput).catch(() => {})
      await new Promise((r) => setTimeout(r, 140))
    }
    await new Promise((r) => setTimeout(r, 500))

    if (!existsSync(dirname(outputPath))) mkdirSync(dirname(outputPath), { recursive: true })
    const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width, height } })
    writeFileSync(outputPath, buf)
    result.path = outputPath
    result.sizeBytes = buf.length

    if (result.pageErrors.length > 0) {
      result.warnings.push(`${result.pageErrors.length} runtime error(s)`)
    }
    if (buf.length < minSizeBytes) {
      result.warnings.push(`screenshot ${(buf.length / 1024).toFixed(1)}KB < ${(minSizeBytes / 1024).toFixed(0)}KB threshold (likely blank)`)
    }

    result.ok = result.pageErrors.length === 0 && buf.length >= minSizeBytes

    const tag = result.ok ? '✅' : '❌'
    console.log(`  ${tag} [Screenshot] ${outputPath.split(/[\\/]/).slice(-3).join('/')} saved (${(buf.length / 1024).toFixed(0)}KB, ok=${result.ok})`)
    if (result.pageErrors.length > 0) {
      console.log(`  💥 [Screenshot] runtime error: ${result.pageErrors[0]}`)
    }
    return result
  } catch (err) {
    console.log(`  ❌ [Screenshot] ${(err as Error).message.slice(0, 200)}`)
    result.warnings.push((err as Error).message.slice(0, 200))
    return result
  } finally {
    if (browser) await browser.close().catch(() => {})
    await server.close().catch(() => {})
  }
}

/** Delete the vector fallback so registry cannot accidentally point to SVG. */
export function removeVectorThumbnail(gameId: string): void {
  const svgPath = resolvePath(PUBLIC_ROOT, 'games', gameId, 'assets', 'thumbnail.svg')
  if (existsSync(svgPath)) {
    try { unlinkSync(svgPath); console.log(`  🗑️ [Screenshot] removed stale thumbnail.svg`) } catch {}
  }
}

/**
 * Delete every *.svg file under the game's assets/ directory.
 * Vector graphics are banned platform-wide — only PNG (from OpenAI/Gemini) + runtime
 * screenshots are allowed. AssetLoader falls back to colored boxes when a PNG is missing.
 */
export function purgeAllSvg(gameId: string): number {
  const dir = resolvePath(PUBLIC_ROOT, 'games', gameId, 'assets')
  if (!existsSync(dir)) return 0
  const { readdirSync, statSync } = require('fs') as typeof import('fs')
  let removed = 0
  function walk(d: string) {
    for (const name of readdirSync(d)) {
      const p = resolvePath(d, name)
      try {
        if (statSync(p).isDirectory()) walk(p)
        else if (name.toLowerCase().endsWith('.svg')) { unlinkSync(p); removed++ }
      } catch {}
    }
  }
  walk(dir)
  return removed
}
