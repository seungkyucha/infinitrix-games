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
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')

// ── 이전 사이클 피드백 컨텍스트 로더 ──────────────────────────────────────────

/** 누적 플랫폼 지혜 파일 읽기 (없으면 빈 문자열) */
function loadPlatformWisdom(): string {
  const path = `${PROJECT_ROOT}/docs/meta/platform-wisdom.md`
  if (!existsSync(path)) return ''
  try { return readFileSync(path, 'utf-8').slice(0, 4000) } catch { return '' }
}

/** 직전 사이클의 포스트모템 읽기 */
function loadLastPostmortem(cycleNumber: number): string {
  if (cycleNumber <= 1) return ''
  const path = `${PROJECT_ROOT}/docs/post-mortem/cycle-${cycleNumber - 1}-postmortem.md`
  if (!existsSync(path)) return ''
  try { return readFileSync(path, 'utf-8').slice(0, 3000) } catch { return '' }
}

/** 분석가·플래너에게 전달할 누적 피드백 블록 생성 */
function buildFeedbackBlock(cycleNumber: number): string {
  const wisdom    = loadPlatformWisdom()
  const postmortem = loadLastPostmortem(cycleNumber)
  if (!wisdom && !postmortem) return ''

  const parts: string[] = [
    '\n---',
    '## 📚 이전 사이클 학습 컨텍스트 (반드시 참고할 것)',
  ]
  if (wisdom) {
    parts.push('\n### 누적 플랫폼 지혜 (platform-wisdom.md)\n' + wisdom)
  }
  if (postmortem) {
    parts.push(`\n### 직전 사이클 포스트모템 (cycle-${cycleNumber - 1})\n` + postmortem)
  }
  parts.push(
    '\n> 위 내용을 바탕으로, 이전에 잘 된 점은 이어받고 지적된 문제는 반드시 개선하라.',
    '---\n',
  )
  return parts.join('\n')
}

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
  ensureDir(`${PROJECT_ROOT}/docs/meta`)
  ensureDir(`${PROJECT_ROOT}/public/games`)
  ensureDir(`${PROJECT_ROOT}/logs`)

  startCycle(cycleNumber)

  // 이전 사이클 피드백 컨텍스트 (사이클 2부터 적용)
  const feedbackBlock = buildFeedbackBlock(cycleNumber)
  if (feedbackBlock) {
    console.log(`  📚 이전 사이클 학습 컨텍스트 로드됨 (cycle #${cycleNumber - 1})`)
  }

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
    console.log(`\n📊 [1/7] 분석가 — 플랫폼 현황 및 트렌드 분석`)
    state.status = 'analysis'
    startAgent('analyst', 1, '트렌드 분석')
    await runAgent('analyst', `
      현재 플랫폼(public/games/game-registry.json)을 분석하고,
      HTML5 게임 트렌드를 검색하여 다음 제작 게임을 추천해줘.
      결과를 docs/analytics/cycle-${cycleNumber}-report.md에 저장해줘.
      ${feedbackBlock}
      ⚠️ 이전 사이클에서 지적된 장르 편중·구현 문제가 있다면 반드시 다른 방향을 선택할 것.
    `)
    completeAgent('analyst')

    // ── 2단계: 기획 ──────────────────────────────────────────
    console.log(`\n📋 [2/7] 플래너 — 게임 기획서 작성`)
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
      ${feedbackBlock}
      ⚠️ 이전 포스트모템의 "다음 사이클 제안"과 "아쉬웠던 점"을 기획서에 명시적으로 반영할 것.
    `)
    completeAgent('planner')

    // ── 3단계: 그래픽 에셋 제작 ──────────────────────────────
    console.log(`\n🎨 [3/7] 디자이너 — SVG 그래픽 에셋 제작`)
    state.status = 'designing'
    startAgent('designer', 3, '그래픽 에셋 제작')
    await runAgent('designer', `
      docs/game-specs/cycle-${cycleNumber}-spec.md를 읽고,
      기획서의 game-id 폴더 안에 그래픽 에셋을 제작해줘.
      public/games/[game-id]/assets/ 폴더에 다음 파일들을 생성할 것:
      - player.svg, enemy.svg
      - bg-layer1.svg, bg-layer2.svg
      - ui-heart.svg, ui-star.svg
      - powerup.svg, effect-hit.svg
      - thumbnail.svg (플랫폼 썸네일, viewBox="0 0 400 300")
      - manifest.json (에셋 목록)
      기획서의 game-id를 정확히 읽어 폴더명으로 사용할 것.
      ${feedbackBlock}
    `)
    completeAgent('designer')

    // ── 4단계: 게임 코딩 ─────────────────────────────────────
    console.log(`\n💻 [4/7] 코더 — HTML5 게임 구현 (디자이너 에셋 활용)`)
    state.status = 'coding'
    startAgent('coder', 4, '게임 코딩')
    await runAgent('coder', `
      docs/game-specs/cycle-${cycleNumber}-spec.md와
      public/games/[game-id]/assets/manifest.json을 읽고,
      public/games/[game-id]/index.html을 작성해줘.
      디자이너가 만든 SVG 에셋을 preloadAssets()로 로드하여 Canvas 렌더링에 활용할 것.
      기획서의 game-id를 정확히 읽어 폴더명으로 사용할 것.
      ${feedbackBlock}
      ⚠️ 이전 사이클 리뷰에서 지적된 코드 품질 문제(메모리 누수, 터치 이벤트 누락 등)를 반드시 해결할 것.
    `)
    completeAgent('coder')

    // ── 5단계: 리뷰 + 테스트 ─────────────────────────────────
    console.log(`\n🔍 [5/7] 리뷰어 — 코드 검토 & 브라우저 테스트`)
    state.status = 'reviewing'
    startAgent('reviewer', 5, '코드 리뷰 + 테스트')
    const reviewResult = await runAgent('reviewer', `
      docs/game-specs/cycle-${cycleNumber}-spec.md에서 game-id를 확인하고,
      public/games/[game-id]/index.html을 코드 리뷰 및 브라우저 테스트해줘.
      에셋 로딩(assets/manifest.json, SVG 파일들) 여부도 확인할 것.
      결과를 docs/reviews/cycle-${cycleNumber}-review.md에 저장해줘.
      최종 판정을 APPROVED / NEEDS_MINOR_FIX / NEEDS_MAJOR_FIX 중 하나로 명시해줘.
    `)
    completeAgent('reviewer')

    // NEEDS_MAJOR_FIX인 경우 코더가 재작업
    if (reviewResult.output.includes('NEEDS_MAJOR_FIX')) {
      console.log(`\n🔧 [리뷰 피드백] 코더 재작업 시작...`)
      startAgent('coder', 4, '코딩 재작업 (피드백 반영)')
      await runAgent('coder', `
        docs/reviews/cycle-${cycleNumber}-review.md의 리뷰 피드백을 반영하여
        public/games/[game-id]/index.html을 수정해줘.
        기획서(docs/game-specs/cycle-${cycleNumber}-spec.md)의 game-id를 먼저 확인할 것.
      `)
      completeAgent('coder')
    }

    // ── 6단계: 포스트모템 ──────────────────────────────────────
    console.log(`\n📝 [6/7] 포스트모템 — 사이클 총정리 + 플랫폼 지혜 갱신`)
    state.status = 'reviewing'
    startAgent('postmortem', 6, '포스트모템 작성')
    await runAgent('postmortem', `
      사이클 #${cycleNumber}의 포스트모템을 작성하고, 플랫폼 지혜 파일을 갱신해줘.

      작업 1 — 포스트모템 작성:
      - docs/game-specs/cycle-${cycleNumber}-spec.md 읽기
      - docs/reviews/cycle-${cycleNumber}-review.md 읽기
      - docs/post-mortem/cycle-${cycleNumber}-postmortem.md 에 저장
      - YAML front-matter에 cycle: ${cycleNumber} 포함할 것

      작업 2 — 플랫폼 지혜 갱신:
      - docs/meta/platform-wisdom.md 읽기 (없으면 새로 생성)
      - 이번 사이클에서 얻은 새로운 인사이트를 추가 (기존 내용 유지)
      - 반복되는 문제 패턴, 검증된 성공 패턴, 다음 우선순위를 갱신
      - 아래 형식을 유지할 것:

      # InfiniTriX 플랫폼 지혜 (누적 학습)
      _마지막 갱신: 사이클 #${cycleNumber}_

      ## 피해야 할 패턴 🚫
      [각 항목에 사이클 번호 표시. 기존 항목 유지, 새 항목 추가]

      ## 검증된 성공 패턴 ✅
      [각 항목에 사이클 번호 표시. 기존 항목 유지, 새 항목 추가]

      ## 기술 개선 누적 🛠️
      [리뷰에서 반복 지적된 코드 품질 이슈. 기존 항목 유지, 새 항목 추가]

      ## 장르별 노하우 🎮
      [장르: 해당 사이클 번호와 배운 점. 기존 항목 유지, 새 항목 추가]

      ## 다음 사이클 우선순위 🎯
      [이전 항목 삭제 후 이번 사이클 기준으로 새로 작성]
    `)
    completeAgent('postmortem')

    // ── 7단계: 배포 ──────────────────────────────────────────
    console.log(`\n🚢 [7/7] 배포 담당 — 레지스트리 등록 & GitHub Push`)
    state.status = 'deploying'
    startAgent('deployer', 7, '레지스트리 등록 + 배포')
    await runAgent('deployer', `
      docs/game-specs/cycle-${cycleNumber}-spec.md를 읽어 게임 정보를 확인하고:
      1. public/games/game-registry.json에 새 게임을 추가해줘
         ⚠️ thumbnail 경로는 반드시 "/games/[game-id]/assets/thumbnail.svg" 형식으로 등록할 것
         (assets/ 폴더 포함 — 빠뜨리면 썸네일이 표시되지 않음)
      2. 아래 git 명령을 실행해줘:
         git add public/games/ docs/game-specs/ docs/reviews/ docs/post-mortem/ docs/analytics/ docs/meta/
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
