import { query } from '@anthropic-ai/claude-agent-sdk'
import { agentRoles } from './team.js'
import type { AgentResult, CycleState } from './types.js'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, mkdirSync, existsSync } from 'fs'

// 프로젝트 루트 (agents/ 의 부모)
const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')

/** 단일 에이전트를 실행하고 결과를 반환 */
async function runAgent(role: string, prompt: string): Promise<AgentResult> {
  const roleDef = agentRoles[role]
  if (!roleDef) throw new Error(`Unknown agent role: ${role}`)

  console.log(`  → [${role.toUpperCase()}] 작업 시작...`)

  let output = ''
  let success = false

  try {
    for await (const msg of query({
      prompt,
      options: {
        cwd:            PROJECT_ROOT,
        allowedTools:   roleDef.tools as string[],
        mcpServers:     roleDef.mcpServers ?? {},
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        model:          'claude-opus-4-6',
        maxTurns:       40,
        systemPrompt:   roleDef.prompt,
      },
    })) {
      if ('result' in msg) {
        output  = msg.result
        success = msg.stop_reason === 'end_turn'
      }
    }
  } catch (err) {
    return { agent: role, success: false, output: '', error: String(err) }
  }

  console.log(`  ✓ [${role.toUpperCase()}] 완료`)
  return { agent: role, success, output }
}

/** 디렉토리 생성 (없으면) */
function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true })
}

/**
 * 완전한 게임 개발 사이클 실행
 * 분석 → 기획 → 개발 → 디자인 → 리뷰 → 테스트 → 배포
 */
export async function runDevelopmentCycle(cycleNumber: number): Promise<CycleState> {
  const startedAt = new Date().toISOString()
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`🚀 개발 사이클 #${cycleNumber} 시작  (${startedAt})`)
  console.log(`${'═'.repeat(60)}\n`)

  // 문서 폴더 생성
  ensureDir(`${PROJECT_ROOT}/docs/analytics`)
  ensureDir(`${PROJECT_ROOT}/docs/game-specs`)
  ensureDir(`${PROJECT_ROOT}/docs/reviews`)
  ensureDir(`${PROJECT_ROOT}/docs/test-reports`)
  ensureDir(`${PROJECT_ROOT}/logs`)

  const state: CycleState = {
    cycleNumber,
    gameId:    '',
    gameTitle: '',
    gameGenre: [],
    difficulty: 'medium',
    status:    'analysis',
    startedAt,
  }

  // ── 1단계: 분석 ─────────────────────────────────────────
  console.log(`\n📊 [1/7] 분석가 — 플랫폼 현황 및 트렌드 분석`)
  state.status = 'analysis'
  await runAgent('analyst', `
    현재 플랫폼(public/games/game-registry.json)을 분석하고,
    HTML5 게임 트렌드를 검색하여 다음 제작 게임을 추천해줘.
    결과를 docs/analytics/cycle-${cycleNumber}-report.md에 저장해줘.
  `)

  // ── 2단계: 기획 ─────────────────────────────────────────
  console.log(`\n📋 [2/7] 플래너 — 게임 기획서 작성`)
  state.status = 'planning'
  await runAgent('planner', `
    docs/analytics/cycle-${cycleNumber}-report.md를 읽고,
    제작할 게임의 상세 기획서를 docs/game-specs/cycle-${cycleNumber}-spec.md에 저장해줘.
    기획서 맨 위에 반드시 YAML front-matter 형식으로:
    ---
    game-id: [영문-소문자-하이픈]
    title: [한국어 제목]
    genre: [장르]
    difficulty: [easy/medium/hard]
    ---
    형태로 메타데이터를 포함해줘.
  `)

  // ── 3단계: 코딩 ─────────────────────────────────────────
  console.log(`\n💻 [3/7] 코더 — HTML5 게임 구현`)
  state.status = 'coding'
  await runAgent('coder', `
    docs/game-specs/cycle-${cycleNumber}-spec.md를 읽고,
    기획서에 정의된 game-id 폴더(public/games/[game-id]/)에
    index.html 게임 파일을 작성해줘.
    모든 게임 코드는 index.html 하나에 완성해줘.
  `)

  // ── 4단계: 디자인 ────────────────────────────────────────
  console.log(`\n🎨 [4/7] 디자이너 — 썸네일 SVG 제작`)
  state.status = 'designing'
  await runAgent('designer', `
    docs/game-specs/cycle-${cycleNumber}-spec.md를 읽고,
    public/games/[game-id]/thumbnail.svg 파일을 생성해줘.
    게임의 핵심 요소를 표현하는 네온 스타일 SVG를 만들어줘.
  `)

  // ── 5단계: 리뷰 ─────────────────────────────────────────
  console.log(`\n🔍 [5/7] 리뷰어 — 코드 검토`)
  state.status = 'reviewing'
  const reviewResult = await runAgent('reviewer', `
    docs/game-specs/cycle-${cycleNumber}-spec.md에서 game-id를 확인하고,
    public/games/[game-id]/index.html을 검토해줘.
    결과를 docs/reviews/cycle-${cycleNumber}-review.md에 저장해줘.
    최종 판정을 APPROVED / NEEDS_MINOR_FIX / NEEDS_MAJOR_FIX 중 하나로 명시해줘.
  `)

  // NEEDS_MAJOR_FIX인 경우 코더가 재작업
  if (reviewResult.output.includes('NEEDS_MAJOR_FIX')) {
    console.log(`\n🔧 [리뷰 피드백] 코더 재작업 시작...`)
    await runAgent('coder', `
      docs/reviews/cycle-${cycleNumber}-review.md의 리뷰 피드백을 반영하여
      public/games/[game-id]/index.html을 수정해줘.
    `)
  }

  // ── 6단계: 테스트 ────────────────────────────────────────
  console.log(`\n🧪 [6/7] 테스터 — 게임 검증`)
  state.status = 'testing'
  await runAgent('tester', `
    docs/game-specs/cycle-${cycleNumber}-spec.md에서 game-id를 확인하고,
    public/games/[game-id]/index.html을 분석하여
    기능 테스트 및 재미 평가를 수행해줘.
    결과를 docs/test-reports/cycle-${cycleNumber}-test.md에 저장해줘.
    최종 판정을 PASS / FAIL로 명시해줘.
  `)

  // ── 7단계: 배포 ─────────────────────────────────────────
  console.log(`\n🚢 [7/7] 배포 담당 — 레지스트리 등록 & GitHub Push`)
  state.status = 'deploying'
  await runAgent('deployer', `
    docs/game-specs/cycle-${cycleNumber}-spec.md를 읽어 게임 정보를 확인하고:
    1. public/games/game-registry.json에 새 게임을 추가해줘
    2. git add . && git commit -m "feat: add game from cycle #${cycleNumber}" && git push 를 실행해줘
  `)

  // 사이클 완료
  state.status    = 'completed'
  state.completedAt = new Date().toISOString()

  // 요약 로그 저장
  const summary = `# 사이클 #${cycleNumber} 완료
- 시작: ${state.startedAt}
- 완료: ${state.completedAt}
- 상태: ${state.status}
`
  writeFileSync(`${PROJECT_ROOT}/logs/cycle-${cycleNumber}-summary.md`, summary)

  console.log(`\n✅ 사이클 #${cycleNumber} 완료!\n`)
  return state
}
