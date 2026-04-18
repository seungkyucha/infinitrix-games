#!/usr/bin/env node
/**
 * InfiniTriX 에이전트 팀 메인 엔트리포인트
 *
 * 사용법:
 *   npm run start        # 무한 사이클 모드 (2시간 간격)
 *   npm run cycle        # 단일 사이클 실행 후 종료
 *
 * 인증: Claude Code CLI 구독 사용 (API 키 불필요)
 *   → claude login 으로 인증 필요
 */

import { runDevelopmentCycle } from './cycle.js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { acquireLock, installLockHandlers, LOCK_FILE } from './lock.js'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')

// .env 파일 수동 로드 (dotenv 의존 없이)
const ENV_FILE = resolve(__dirname, '..', '.env')
if (existsSync(ENV_FILE)) {
  for (const line of readFileSync(ENV_FILE, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}
const CYCLE_LOG    = `${PROJECT_ROOT}/logs/cycle-counter.json`

// Rate Limit / 사용량 초과 에러 감지 패턴
const USAGE_ERROR_PATTERNS = [
  /rate.?limit/i,
  /too many requests/i,
  /429/,
  /quota/i,
  /capacity/i,
  /overloaded/i,
  /usage.?limit/i,
  /daily.?limit/i,
  /exceeded/i,
  /credit/i,
  /billing/i,
  /insufficient/i,
  /CLIConnectionError/i,
  /out of (extra )?usage/i,        // Claude Code CLI: "You're out of extra usage"
  /extra usage/i,
  /resets?\s+\d?\d\s*(am|pm)/i,    // "resets 1am (Asia/Seoul)"
]

export function isUsageError(err: unknown): boolean {
  const msg = String(err)
  return USAGE_ERROR_PATTERNS.some(p => p.test(msg))
}

/**
 * Parse "resets 1am (Asia/Seoul)" style hints and return ms-until-reset.
 * Returns null if no parseable hint found.
 */
export function parseResetWaitMs(err: unknown): number | null {
  const msg = String(err)
  const m = msg.match(/resets?\s+(\d?\d)\s*(am|pm)(?:\s*\(([^)]+)\))?/i)
  if (!m) return null
  const hour12 = parseInt(m[1], 10)
  const ampm = m[2].toLowerCase()
  const hour24 = ampm === 'pm' ? (hour12 === 12 ? 12 : hour12 + 12) : (hour12 === 12 ? 0 : hour12)
  const now = new Date()
  const target = new Date(now)
  target.setHours(hour24, 5, 0, 0)  // 5-min buffer after reset
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1)
  return target.getTime() - now.getTime()
}

/** Claude Code CLI 설치 및 인증 상태 확인 */
function checkClaudeCLI(): boolean {
  try {
    const version = execSync('claude --version', { encoding: 'utf-8', timeout: 5000 }).trim()
    console.log(`✅ Claude Code CLI: ${version}`)
    return true
  } catch {
    return false
  }
}

/** 현재 사이클 번호 읽기 */
function getCurrentCycle(): number {
  if (!existsSync(CYCLE_LOG)) return 1
  try {
    const data = JSON.parse(readFileSync(CYCLE_LOG, 'utf-8'))
    return (data.lastCycle ?? 0) + 1
  } catch {
    return 1
  }
}

/** 사이클 번호 저장 */
function saveCycleNumber(n: number) {
  mkdirSync(`${PROJECT_ROOT}/logs`, { recursive: true })
  writeFileSync(CYCLE_LOG, JSON.stringify({ lastCycle: n, updatedAt: new Date().toISOString() }))
}

// SDK 내부에서 USAGE_LIMIT 이후 비동기 cleanup이 던지는 rejection을 붙잡아
// 프로세스 전체가 exit 1로 crash 하는 것을 방지한다. 실제 흐름은 runAgent →
// runOneCycle 의 try/catch 가 처리하므로 여기서는 로깅만.
process.on('unhandledRejection', (reason: unknown) => {
  const msg = String(reason)
  if (/out of (extra )?usage|rate.?limit|resets?\s+\d|Claude Code returned an error/i.test(msg)) {
    console.error(`[unhandledRejection → swallowed usage/CLI error] ${msg.slice(0, 200)}`)
  } else {
    console.error(`[unhandledRejection]`, reason)
  }
})
process.on('uncaughtException', (err: Error) => {
  const msg = String(err)
  if (/out of (extra )?usage|rate.?limit|resets?\s+\d|Claude Code returned an error/i.test(msg)) {
    console.error(`[uncaughtException → swallowed usage/CLI error] ${msg.slice(0, 200)}`)
  } else {
    console.error(`[uncaughtException]`, err)
    // 비-usage 에러는 기존대로 즉시 종료
    process.exit(1)
  }
})

async function main() {
  const isOnce   = process.argv.includes('--once')
  const interval = 4 * 60 * 60 * 1000 // 4시간

  // ── 단일 인스턴스 락 (PID 파일) ──
  // 같은 체크포인트·로그·git 트리에서 두 개의 사이클이 동시에 돌면 상태가 깨진다.
  // 기존 프로세스가 살아있으면 새 실행을 거부. stale PID면 청소 후 takeover.
  const lock = acquireLock()
  if (!lock.acquired) {
    console.error(`❌ ${lock.reason}`)
    console.error(`   락 파일: ${LOCK_FILE}`)
    console.error(`   기존 인스턴스를 먼저 중지하세요:`)
    console.error(`     Windows:  taskkill /PID ${lock.existingPid} /F`)
    console.error(`     Unix:     kill ${lock.existingPid}`)
    console.error(`   체크포인트(logs/checkpoint.json)가 있으면 재실행 시 이어서 진행됩니다.`)
    process.exit(3)  // distinct from 1 (error) / 2 (usage-limit)
  }
  installLockHandlers()
  console.log(`🔒 단일 인스턴스 락 획득 (PID ${process.pid})`)

  console.log('🎮 InfiniTriX Agent Team 시작')
  console.log(`📁 프로젝트 루트: ${PROJECT_ROOT}`)
  console.log(`🔄 모드: ${isOnce ? '단일 사이클' : `자동 반복 (${interval / 60000}분 간격)`}`)
  console.log(`🔑 인증: Claude Code 구독 (API 키 불필요)\n`)
  console.log(`💡 이전 사이클이 토큰 한도나 크래시로 중단됐을 경우 logs/checkpoint.json 으로 자동 재개됩니다.\n`)

  // Claude Code CLI 확인
  if (!checkClaudeCLI()) {
    console.error('❌ Claude Code CLI가 설치되지 않았거나 PATH에 없습니다.')
    console.error('   설치: npm install -g @anthropic-ai/claude-code')
    console.error('   인증: claude login')
    process.exit(1)
  }

  // API 키가 환경에 있으면 경고 (구독 모드 방해할 수 있음)
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('⚠️ ANTHROPIC_API_KEY가 감지됨 — API 키 대신 구독을 사용하려면 환경변수를 제거하세요.')
    console.log('   현재는 API 키가 우선 사용됩니다.\n')
  }

  /** 사이클 실행 — 성공 시 true, 사용량 초과 시 'usage_error', 기타 실패 시 false */
  async function runOneCycle(): Promise<true | false | 'usage_error'> {
    const cycleNum = getCurrentCycle()
    try {
      const state = await runDevelopmentCycle(cycleNum)

      // 사이클이 너무 빨리 끝났으면 (2분 미만) 실패로 간주
      const elapsed = state.completedAt
        ? new Date(state.completedAt).getTime() - new Date(state.startedAt).getTime()
        : 0
      if (elapsed > 0 && elapsed < 2 * 60 * 1000) {
        console.error(`⚠️ 사이클 #${cycleNum}이 ${Math.round(elapsed / 1000)}초 만에 종료 — 비정상 (사용량 한도 의심)`)
        return 'usage_error'
      }

      saveCycleNumber(cycleNum)
      console.log(`📈 총 완료 사이클: ${cycleNum}`)
      return true
    } catch (err) {
      console.error(`❌ 사이클 #${cycleNum} 실패:`, err)

      if (isUsageError(err)) {
        console.error(`💳 사용량/Rate Limit 에러 감지 — 사이클 번호 유지 (재시도 예정)`)
        return 'usage_error'
      }

      // 일반 에러: 사이클 번호를 저장하여 다음 번호로 넘어감
      saveCycleNumber(cycleNum)
      return false
    }
  }

  if (isOnce) {
    const result = await runOneCycle()
    // exit codes:
    //   0 = success
    //   1 = generic error (cycle advances)
    //   2 = usage_error (cycle number NOT advanced, checkpoint preserved)
    //       → wrapper script should wait and re-run same cycle to resume
    const code = result === true ? 0 : result === 'usage_error' ? 2 : 1
    if (code === 2) {
      console.log('\n💳 토큰 한도 — 프로세스 종료 (exit 2). 체크포인트가 보존되어 다음 실행 시 자동 재개됩니다.')
    }
    process.exit(code)
  } else {
    // 무한 반복 + 사용량 초과 시 점진적 대기 (Claude 토큰은 보통 5시간 단위 리프레시)
    let retryCount = 0
    const MAX_WAIT = 5 * 60 * 60 * 1000 // 최대 5시간 (Claude 토큰 리프레시 주기)

    while (true) {
      const result = await runOneCycle()

      if (result === 'usage_error') {
        retryCount++
        // Prefer explicit reset hint ("resets 1am (Asia/Seoul)") if the error mentioned one
        const lastErrFile = resolve(PROJECT_ROOT, 'logs', 'last-usage-error.txt')
        let waitMs: number
        try {
          const lastErr = readFileSync(lastErrFile, 'utf-8')
          const parsed = parseResetWaitMs(lastErr)
          waitMs = parsed && parsed < 7 * 60 * 60 * 1000 ? parsed : Math.min(15 * 60 * 1000 * Math.pow(2, retryCount - 1), MAX_WAIT)
          if (parsed) console.log(`\n🕐 에러 메시지의 reset 시각 파싱 성공`)
        } catch {
          waitMs = Math.min(15 * 60 * 1000 * Math.pow(2, retryCount - 1), MAX_WAIT)
        }
        const waitMin = Math.round(waitMs / 60000)
        console.log(`\n💤 토큰 한도 — ${waitMin}분 후 재시도 (${retryCount}회차). 체크포인트 유지 — 완료 phase는 건너뜁니다.\n`)
        await new Promise(r => setTimeout(r, waitMs))
        continue
      }

      // 성공 또는 일반 에러: 리트라이 카운터 초기화
      retryCount = 0

      console.log(`\n⏳ 다음 사이클까지 ${interval / 60000}분 대기...\n`)
      await new Promise(r => setTimeout(r, interval))
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
