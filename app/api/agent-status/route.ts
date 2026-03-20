import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync }  from 'fs'
import { join }                      from 'path'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

const STATUS_FILE  = join(process.cwd(), 'logs', 'agent-status.json')
const WRITE_SECRET = process.env.STATUS_WRITE_SECRET

const BLANK_AGENT = { status: 'idle', currentAction: '', startedAt: null, completedAt: null, toolCalls: 0, logs: [] }

function idleState() {
  return {
    lastUpdated: new Date().toISOString(),
    cycleNumber: 0, cycleStatus: 'idle',
    currentStep: 0, totalSteps: 7,
    stepName: '', gameTitle: '', gameId: '', gameGenre: [],
    agents: {
      analyst: BLANK_AGENT, planner: BLANK_AGENT, designer: BLANK_AGENT,
      coder:   BLANK_AGENT, reviewer: BLANK_AGENT,
      postmortem: BLANK_AGENT, deployer: BLANK_AGENT,
    },
    recentLogs: [],
  }
}

// ── GET: 에이전트 상태 읽기 ──────────────────────────────────────────────────

export async function GET() {
  // 1. Vercel Blob에서 읽기 (private 스토어)
  try {
    const { list, get } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: 'agent-status.json', limit: 1 })
    if (blobs.length > 0) {
      const result = await get(blobs[0].url, { access: 'private', useCache: false })
      if (result) {
        const data = await new Response(result.stream).json()
        return NextResponse.json(data)
      }
    }
  } catch (e) {
    console.error('[blob-read-error]', e instanceof Error ? e.message : e)
  }

  // 2. 로컬 파일 폴백 (개발 환경)
  try {
    if (existsSync(STATUS_FILE)) {
      return NextResponse.json(JSON.parse(readFileSync(STATUS_FILE, 'utf-8')))
    }
  } catch {}

  return NextResponse.json(idleState())
}

// ── POST: 에이전트 → Vercel Blob 업로드 ─────────────────────────────────────

export async function POST(req: NextRequest) {
  // 시크릿 검증
  const auth = req.headers.get('x-write-secret')
  if (!WRITE_SECRET || auth !== WRITE_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.text()

    // private 스토어에 덮어쓰기 (addRandomSuffix: false)
    const { put } = await import('@vercel/blob')
    const blob = await put('agent-status.json', body, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    })

    return NextResponse.json({ ok: true, url: blob.url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[blob-write-error]', msg)
    return NextResponse.json({ error: 'blob write failed', detail: msg }, { status: 500 })
  }
}
