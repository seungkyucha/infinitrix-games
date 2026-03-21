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

const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')
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
]

function isUsageError(err: unknown): boolean {
  const msg = String(err)
  return USAGE_ERROR_PATTERNS.some(p => p.test(msg))
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

async function main() {
  const isOnce   = process.argv.includes('--once')
  const interval = 2 * 60 * 60 * 1000 // 2시간

  console.log('🎮 InfiniTriX Agent Team 시작')
  console.log(`📁 프로젝트 루트: ${PROJECT_ROOT}`)
  console.log(`🔄 모드: ${isOnce ? '단일 사이클' : `자동 반복 (${interval / 60000}분 간격)`}`)
  console.log(`🔑 인증: Claude Code 구독 (API 키 불필요)\n`)

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
    process.exit(result === true ? 0 : 1)
  } else {
    // 무한 반복 + 사용량 초과 시 점진적 대기
    let retryCount = 0
    const MAX_WAIT = 60 * 60 * 1000 // 최대 1시간

    while (true) {
      const result = await runOneCycle()

      if (result === 'usage_error') {
        retryCount++
        // 점진적 대기: 5분 → 10분 → 20분 → 40분 → 60분 (최대)
        const waitMs = Math.min(5 * 60 * 1000 * Math.pow(2, retryCount - 1), MAX_WAIT)
        const waitMin = Math.round(waitMs / 60000)
        console.log(`\n💤 사용량 한도 — ${waitMin}분 후 재시도 (${retryCount}회차)...\n`)
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
