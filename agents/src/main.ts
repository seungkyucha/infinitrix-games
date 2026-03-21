#!/usr/bin/env node
/**
 * InfiniTriX 에이전트 팀 메인 엔트리포인트
 *
 * 사용법:
 *   npm run start        # 무한 사이클 모드 (30분 간격)
 *   npm run cycle        # 단일 사이클 실행 후 종료
 */

import { runDevelopmentCycle } from './cycle.js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')
const CYCLE_LOG    = `${PROJECT_ROOT}/logs/cycle-counter.json`

// 토큰/Rate Limit 관련 에러 감지 패턴
const TOKEN_ERROR_PATTERNS = [
  /rate.?limit/i,
  /too many requests/i,
  /429/,
  /token/i,
  /quota/i,
  /capacity/i,
  /overloaded/i,
  /credit/i,
  /billing/i,
  /insufficient/i,
]

function isTokenError(err: unknown): boolean {
  const msg = String(err)
  return TOKEN_ERROR_PATTERNS.some(p => p.test(msg))
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
  console.log(`🔄 모드: ${isOnce ? '단일 사이클' : `자동 반복 (${interval / 60000}분 간격)`}\n`)

  // ANTHROPIC_API_KEY 확인
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.')
    console.error('   .env 파일을 생성하거나 환경변수를 설정하세요.')
    process.exit(1)
  }

  /** 사이클 실행 — 성공 시 true, 토큰 부족 시 'token_error', 기타 실패 시 false */
  async function runOneCycle(): Promise<true | false | 'token_error'> {
    const cycleNum = getCurrentCycle()
    try {
      const state = await runDevelopmentCycle(cycleNum)

      // 사이클이 너무 빨리 끝났으면 (2분 미만) 실패로 간주
      const elapsed = state.completedAt
        ? new Date(state.completedAt).getTime() - new Date(state.startedAt).getTime()
        : 0
      if (elapsed > 0 && elapsed < 2 * 60 * 1000) {
        console.error(`⚠️ 사이클 #${cycleNum}이 ${Math.round(elapsed / 1000)}초 만에 종료 — 비정상 (토큰 부족 의심)`)
        // 사이클 번호를 저장하지 않음 — 다음 실행에서 같은 번호로 재시도
        return 'token_error'
      }

      saveCycleNumber(cycleNum)
      console.log(`📈 총 완료 사이클: ${cycleNum}`)
      return true
    } catch (err) {
      console.error(`❌ 사이클 #${cycleNum} 실패:`, err)

      if (isTokenError(err)) {
        console.error(`💳 토큰/Rate Limit 에러 감지 — 사이클 번호 유지 (재시도 예정)`)
        return 'token_error'
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
    // 무한 반복 + 토큰 부족 시 점진적 대기
    let tokenRetryCount = 0
    const MAX_TOKEN_WAIT = 60 * 60 * 1000 // 최대 1시간

    while (true) {
      const result = await runOneCycle()

      if (result === 'token_error') {
        tokenRetryCount++
        // 점진적 대기: 5분 → 10분 → 20분 → 40분 → 60분 (최대)
        const waitMs = Math.min(5 * 60 * 1000 * Math.pow(2, tokenRetryCount - 1), MAX_TOKEN_WAIT)
        const waitMin = Math.round(waitMs / 60000)
        console.log(`\n💤 토큰 부족 — ${waitMin}분 후 재시도 (${tokenRetryCount}회차)...\n`)
        await new Promise(r => setTimeout(r, waitMs))
        continue
      }

      // 성공 또는 일반 에러: 리트라이 카운터 초기화
      tokenRetryCount = 0

      console.log(`\n⏳ 다음 사이클까지 ${interval / 60000}분 대기...\n`)
      await new Promise(r => setTimeout(r, interval))
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
