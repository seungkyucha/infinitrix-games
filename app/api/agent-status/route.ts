import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import Redis from 'ioredis'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

const STATUS_FILE = join(process.cwd(), 'logs', 'agent-status.json')
const REDIS_KEY   = 'infinitrix:agent-status'

const BLANK_AGENT = { status: 'idle', currentAction: '', startedAt: null, completedAt: null, toolCalls: 0, logs: [] }

const IDLE_STATE = {
  lastUpdated: new Date().toISOString(),
  cycleNumber: 0,
  cycleStatus: 'idle',
  currentStep: 0,
  totalSteps:  7,
  stepName:    '',
  gameTitle:   '',
  gameId:      '',
  gameGenre:   [],
  agents: {
    analyst:    BLANK_AGENT,
    planner:    BLANK_AGENT,
    designer:   BLANK_AGENT,
    coder:      BLANK_AGENT,
    reviewer:   BLANK_AGENT,
    postmortem: BLANK_AGENT,
    deployer:   BLANK_AGENT,
  },
  recentLogs: [],
}

async function readFromRedis(): Promise<object | null> {
  const url = process.env.REDIS_URL
  if (!url) return null
  return new Promise((resolve) => {
    const timer = setTimeout(() => { resolve(null) }, 4000)
    const redis = new Redis(url, {
      connectTimeout: 3000,
      commandTimeout: 2000,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
      lazyConnect: false,
      retryStrategy: () => null,
    })
    // 반드시 error 핸들러 등록 — 없으면 uncaught exception
    redis.on('error', (err: Error) => {
      console.error('[redis-error]', err.message)
      clearTimeout(timer)
      redis.disconnect()
      resolve(null)
    })
    redis.once('ready', async () => {
      try {
        const json = await redis.get(REDIS_KEY)
        clearTimeout(timer)
        redis.disconnect()
        resolve(json ? JSON.parse(json) : null)
      } catch {
        clearTimeout(timer)
        redis.disconnect()
        resolve(null)
      }
    })
  })
}

export async function GET() {
  try {
    // 1. Redis에서 먼저 읽기
    const redisData = await readFromRedis()
    if (redisData) return NextResponse.json(redisData)

    // 2. 로컬 파일 폴백 (개발 환경)
    if (existsSync(STATUS_FILE)) {
      const data = JSON.parse(readFileSync(STATUS_FILE, 'utf-8'))
      return NextResponse.json(data)
    }
  } catch {}

  return NextResponse.json(IDLE_STATE)
}
