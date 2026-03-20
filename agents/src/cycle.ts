import { query } from '@anthropic-ai/claude-agent-sdk'
import { agentRoles } from './team.js'
import type { AgentResult, CycleState } from './types.js'
import {
  startCycle, completeCycle, failCycle,
  startAgent, completeAgent, failAgent,
  logTool, setGameInfo,
  type AgentId,
} from './status-logger.js'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, mkdirSync, existsSync } from 'fs'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')

/** 단일 에이전트를 실행하고 결과를 반환 */
async function runAgent(agentId: AgentId, prompt: string): Promise<AgentResult> {
  const roleDef = agentRoles[agentId]
  if (!roleDef) throw new Error(`Unknown agent role: ${agentId}`)

  console.log(`  → [${agentId.toUpperCase()}] 작업 시작...`)

  let output  = ''
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

        hooks: {
          PostToolUse: [{
            matcher: '.*',
            hooks: [async (input: Record<string, unknown>) => {
              const toolName  = String(input['tool_name'] ?? 'tool')
              const toolInput = input['tool_input']
              const detail    = typeof toolInput === 'object'
                ? JSON.stringify(toolInput).slice(0, 80)
                : String(toolInput ?? '').slice(0, 80)
              logTool(agentId, toolName, detail)
              return {}
            }],
          }],
        },
      },
    })) {
      if ('result' in msg) {
        output  = msg.result
        success = msg.stop_reason === 'end_turn'
      }
    }
  } catch (err) {
    failAgent(agentId, String(err))
    return { agent: agentId, success: false, output: '', error: String(err) }
  }

  console.log(`  ✓ [${agentId.toUpperCase()}] 완료`)
  return { agent: agentId, success, output }
}

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true })
}

/**
 * 완전한 게임 개발 사이클 실행
 * 분석 → 기획 → 코딩+디자인 → 리뷰+테스트 → 포스트모템 → 배포
 */
export async function runDevelopmentCycle(cycleNumber: number): Promise<CycleState> {
  const startedAt = new Date().toISOString()
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`🚀 개발 사이클 #${cycleNumber} 시작  (${startedAt})`)
  console.log(`${'═'.repeat(60)}\n`)

  ensureDir(`${PROJECT_ROOT}/docs/analytics`)
  ensureDir(`${PROJECT_ROOT}/docs/game-specs`)
  ensureDir(`${PROJECT_ROOT}/docs/reviews`)
  ensureDir(`${PROJECT_ROOT}/docs/post-mortem`)
  ensureDir(`${PROJECT_ROOT}/logs`)

  startCycle(cycleNumber)

  const state: CycleState = {
    cycleNumber,
    gameId:     '',
    gameTitle:  '',
    gameGenre:  [],
    difficulty: 'medium',
    status:     'analysis',
    startedAt,
  }

  try {
    // ── 1단계: 분석 ──────────────────────────────────────────
    console.log(`\n📊 [1/6] 분석가 — 플랫폼 현황 및 트렌드 분석`)
    state.status = 'analysis'
    startAgent('analyst', 1, '트렌드 분석')
    await runAgent('analyst', `
      현재 플랫폼(public/games/game-registry.json)을 분석하고,
      HTML5 게임 트렌드를 검색하여 다음 제작 게임을 추천해줘.
      결과를 docs/analytics/cycle-${cycleNumber}-report.md에 저장해줘.
    `)
    completeAgent('analyst')

    // ── 2단계: 기획 ──────────────────────────────────────────
    console.log(`\n📋 [2/6] 플래너 — 게임 기획서 작성`)
    state.status = 'planning'
    startAgent('planner', 2, '게임 기획')
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
    completeAgent('planner')

    // ── 3단계: 코딩 + 디자인 ─────────────────────────────────
    console.log(`\n💻 [3/6] 코더 — HTML5 게임 구현 + 썸네일 제작`)
    state.status = 'coding'
    startAgent('coder', 3, '코딩 + 디자인')
    await runAgent('coder', `
      docs/game-specs/cycle-${cycleNumber}-spec.md를 읽고 다음 두 파일을 작성해줘:
      1. public/games/[game-id]/index.html — 완전한 HTML5 게임 (단일 파일)
      2. public/games/[game-id]/thumbnail.svg — 네온 스타일 썸네일 SVG
      기획서의 game-id를 정확히 읽어 폴더명으로 사용할 것.
    `)
    completeAgent('coder')

    // ── 4단계: 리뷰 + 테스트 ─────────────────────────────────
    console.log(`\n🔍 [4/6] 리뷰어 — 코드 검토 & 브라우저 테스트`)
    state.status = 'reviewing'
    startAgent('reviewer', 4, '코드 리뷰 + 테스트')
    const reviewResult = await runAgent('reviewer', `
      docs/game-specs/cycle-${cycleNumber}-spec.md에서 game-id를 확인하고,
      public/games/[game-id]/index.html을 코드 리뷰 및 브라우저 테스트해줘.
      결과를 docs/reviews/cycle-${cycleNumber}-review.md에 저장해줘.
      최종 판정을 APPROVED / NEEDS_MINOR_FIX / NEEDS_MAJOR_FIX 중 하나로 명시해줘.
    `)
    completeAgent('reviewer')

    // NEEDS_MAJOR_FIX인 경우 코더가 재작업
    if (reviewResult.output.includes('NEEDS_MAJOR_FIX')) {
      console.log(`\n🔧 [리뷰 피드백] 코더 재작업 시작...`)
      startAgent('coder', 3, '코딩 재작업 (피드백 반영)')
      await runAgent('coder', `
        docs/reviews/cycle-${cycleNumber}-review.md의 리뷰 피드백을 반영하여
        public/games/[game-id]/index.html을 수정해줘.
        기획서(docs/game-specs/cycle-${cycleNumber}-spec.md)의 game-id를 먼저 확인할 것.
      `)
      completeAgent('coder')
    }

    // ── 5단계: 포스트모템 ──────────────────────────────────────
    console.log(`\n📝 [5/6] 포스트모템 — 사이클 총정리 문서 작성`)
    state.status = 'reviewing'
    startAgent('postmortem', 5, '포스트모템 작성')
    await runAgent('postmortem', `
      사이클 #${cycleNumber}의 포스트모템을 작성해줘.
      - docs/game-specs/cycle-${cycleNumber}-spec.md 읽기
      - docs/reviews/cycle-${cycleNumber}-review.md 읽기
      - docs/post-mortem/cycle-${cycleNumber}-postmortem.md 에 저장
      YAML front-matter에 cycle: ${cycleNumber} 포함할 것.
    `)
    completeAgent('postmortem')

    // ── 6단계: 배포 ──────────────────────────────────────────
    console.log(`\n🚢 [6/6] 배포 담당 — 레지스트리 등록 & GitHub Push`)
    state.status = 'deploying'
    startAgent('deployer', 6, '레지스트리 등록 + 배포')
    await runAgent('deployer', `
      docs/game-specs/cycle-${cycleNumber}-spec.md를 읽어 게임 정보를 확인하고:
      1. public/games/game-registry.json에 새 게임을 추가해줘
      2. 아래 git 명령을 실행해줘:
         git add public/games/ docs/game-specs/ docs/reviews/ docs/post-mortem/
         git commit -m "feat: add game from cycle #${cycleNumber}"
         git push origin main
    `)
    completeAgent('deployer')

    // 사이클 완료
    state.status      = 'completed'
    state.completedAt = new Date().toISOString()
    completeCycle(state.gameTitle, state.gameId)

  } catch (err) {
    state.status = 'failed'
    state.error  = String(err)
    failCycle(String(err))
    console.error(`\n❌ 사이클 오류:`, err)
  }

  const summary = `# 사이클 #${cycleNumber} 완료\n- 시작: ${state.startedAt}\n- 완료: ${state.completedAt}\n- 상태: ${state.status}\n`
  writeFileSync(`${PROJECT_ROOT}/logs/cycle-${cycleNumber}-summary.md`, summary)

  console.log(`\n✅ 사이클 #${cycleNumber} 완료!\n`)
  return state
}
