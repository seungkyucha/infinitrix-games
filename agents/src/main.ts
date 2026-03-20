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
  const interval = 30 * 60 * 1000 // 30분

  console.log('🎮 InfiniTriX Agent Team 시작')
  console.log(`📁 프로젝트 루트: ${PROJECT_ROOT}`)
  console.log(`🔄 모드: ${isOnce ? '단일 사이클' : `자동 반복 (${interval / 60000}분 간격)`}\n`)

  // ANTHROPIC_API_KEY 확인
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.')
    console.error('   .env 파일을 생성하거나 환경변수를 설정하세요.')
    process.exit(1)
  }

  async function runOneCycle() {
    const cycleNum = getCurrentCycle()
    try {
      const state = await runDevelopmentCycle(cycleNum)
      saveCycleNumber(cycleNum)
      console.log(`📈 총 완료 사이클: ${cycleNum}`)
      return state
    } catch (err) {
      console.error(`❌ 사이클 #${cycleNum} 실패:`, err)
      return null
    }
  }

  if (isOnce) {
    // 단일 실행
    await runOneCycle()
    process.exit(0)
  } else {
    // 무한 반복
    while (true) {
      await runOneCycle()
      console.log(`\n⏳ 다음 사이클까지 ${interval / 60000}분 대기...\n`)
      await new Promise(r => setTimeout(r, interval))
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
