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

/** 사이클 번호에 따른 성장 지시문 — 게임 품질을 점진적으로 향상 */
function buildGrowthDirective(cycleNumber: number): string {
  const n = cycleNumber

  // 기본 품질 기대치 (누적 성장)
  const complexity = n <= 5 ? '기본' : n <= 10 ? '중급' : n <= 20 ? '고급' : '프리미엄'
  const minCodeLines = Math.min(500 + n * 80, 5000)

  const parts: string[] = [
    `\n## 🚀 사이클 #${n} 성장 목표 (이전 사이클보다 반드시 발전할 것)`,
    `현재 플랫폼 성숙도: **${complexity}** 단계 (${n}번째 사이클)`,
    '',
  ]

  // ── 게임성 (Gameplay) ──
  parts.push('### 🎮 게임성')
  if (n <= 5) {
    parts.push('- 핵심 메카닉 1개를 확실히 재미있게 구현')
    parts.push('- 최소 3단계 난이도 변화 (쉬움→보통→어려움)')
    parts.push('- 점수 시스템 + 게임오버 조건')
  } else if (n <= 10) {
    parts.push('- 핵심 메카닉 + 보조 메카닉 1~2개 (파워업, 콤보 등)')
    parts.push('- 최소 5단계 이상 난이도 곡선 (웨이브/레벨)')
    parts.push('- 점수 보드 + 최고 기록 저장 (localStorage)')
    parts.push('- 튜토리얼 또는 첫 플레이 가이드')
  } else if (n <= 20) {
    parts.push('- 복합 메카닉 (예: 자원관리+전투, 빌드+디펜스)')
    parts.push('- 10단계 이상 레벨/웨이브 + 보스전 또는 특수 스테이지')
    parts.push('- 업그레이드/성장 시스템 (런 중 또는 영구 업그레이드)')
    parts.push('- 다양한 적/장애물 타입 (최소 5종)')
    parts.push('- 업적/도전과제 시스템')
  } else {
    parts.push('- 깊은 전략적 선택지가 있는 복합 시스템')
    parts.push('- 15단계+ 레벨 + 보스전 + 히든 스테이지')
    parts.push('- 영구 진행 시스템 (언락, 업그레이드 트리)')
    parts.push('- 리플레이 가치: 랜덤 생성, 다중 전략 경로')
    parts.push('- 스토리/내러티브 요소')
  }

  // ── 그래픽 (Visual) ──
  parts.push('\n### 🎨 그래픽')
  if (n <= 5) {
    parts.push('- 깔끔한 SVG 에셋 + 일관된 컬러 팔레트')
    parts.push('- 기본 애니메이션 (이동, 페이드)')
    parts.push('- Canvas 해상도: 800×600 이상')
    parts.push('- SVG viewBox: 각 에셋 최소 100×100 단위')
  } else if (n <= 10) {
    parts.push('- 세밀한 SVG 디테일 (그라데이션, 그림자, 하이라이트)')
    parts.push('- 파티클 이펙트 (폭발, 스파크, 먼지)')
    parts.push('- 화면 전환 애니메이션')
    parts.push('- 배경 패럴랙스 스크롤링')
    parts.push('- Canvas 해상도: 1024×768 이상, devicePixelRatio 대응 (레티나 선명도)')
    parts.push('- SVG viewBox: 각 에셋 200×200 이상, 세밀한 path 디테일')
    parts.push('- 캐릭터 SVG: 관절/파츠 분리 구조 (머리, 몸통, 팔다리)')
  } else if (n <= 20) {
    parts.push('- 풍부한 SVG 아트 (캐릭터 표정/포즈 변화, 환경 디테일)')
    parts.push('- 다중 파티클 시스템 (타격, 이동 궤적, 환경 효과)')
    parts.push('- 화면 흔들림(screen shake), 슬로우모션 연출')
    parts.push('- 다이나믹 라이팅/글로우 효과')
    parts.push('- UI 애니메이션 (숫자 카운트업, 바운스, 슬라이드)')
    parts.push('- Canvas 해상도: 전체 화면 대응 (window.innerWidth/Height), devicePixelRatio 필수')
    parts.push('- SVG viewBox: 각 에셋 300×300 이상, filter/gradient 적극 활용')
    parts.push('- 캐릭터 SVG: 다중 프레임/포즈 (idle, walk, attack, hit, death)')
    parts.push('- 배경 SVG: 3~4 레이어 (far, mid, near, foreground)')
    parts.push('- 적 SVG: 타입별 고유 디자인 (최소 5종), 보스 전용 대형 에셋')
  } else {
    parts.push('- 프리미엄급 비주얼 (캐릭터 애니메이션 시퀀스, 보스 등장 연출)')
    parts.push('- 날씨/시간대 변화 효과')
    parts.push('- 카메라 줌/팬 연출')
    parts.push('- 배경 인터랙티브 요소')
    parts.push('- Canvas 해상도: 풀스크린 + devicePixelRatio + 동적 리사이즈')
    parts.push('- SVG viewBox: 각 에셋 400×400 이상, 복합 filter 체인 (blur+glow+shadow)')
    parts.push('- 캐릭터: 스프라이트 시트급 다중 포즈 (8방향 이동, 스킬 시전)')
    parts.push('- 보스 에셋: 전용 등장 컷신용 대형 SVG (600×400+)')
    parts.push('- 환경 에셋: 파괴 가능 오브젝트, 인터랙티브 배경 요소')
  }

  // ── 분량 (Content Volume) ──
  parts.push('\n### 📏 분량')
  parts.push(`- 코드 최소 ${minCodeLines}줄 이상`)
  if (n <= 5) {
    parts.push('- 에셋 8~10개, 각 SVG 평균 2~5KB')
  } else if (n <= 10) {
    parts.push('- 에셋 12~15개 (적/아이템 변형 포함), 각 SVG 평균 5~10KB')
    parts.push('- 사운드 이펙트 시뮬레이션 (Web Audio API 비프음)')
    parts.push('- 썸네일 SVG: 디테일한 게임 장면 묘사 (10KB+)')
  } else if (n <= 20) {
    parts.push('- 에셋 15~20개 (캐릭터 변형, 환경 변형 포함), 각 SVG 평균 8~15KB')
    parts.push('- Web Audio API 기반 BGM + 효과음 (최소 5종 효과음)')
    parts.push('- 썸네일 SVG: 게임 하이라이트 장면 + 캐릭터 + UI 요소 포함 (15KB+)')
  } else {
    parts.push('- 에셋 20~25개 (캐릭터 포즈별, 보스 전용, 환경 변형), 각 SVG 10~20KB')
    parts.push('- Web Audio API: BGM 루프 + 상황별 효과음 8종+')
    parts.push('- 다국어 지원 (한국어 기본, 영어 UI)')
    parts.push('- 썸네일 SVG: 시네마틱 구도의 대표 장면 (20KB+)')
  }

  parts.push('')
  parts.push(`> ⚠️ 이 게임은 플랫폼의 ${n}번째 작품입니다. 이전 ${n-1}개 게임보다 확실히 발전된 품질을 보여줘야 합니다.`)
  parts.push('')

  return parts.join('\n')
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
                ? JSON.stringify(toolInput).slice(0, 500)
                : String(toolInput ?? '').slice(0, 500)
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

  // 사이클 번호 기반 성장 지시문
  const growthDirective = buildGrowthDirective(cycleNumber)
  console.log(`  📈 성장 목표: ${cycleNumber <= 5 ? '기본' : cycleNumber <= 10 ? '중급' : cycleNumber <= 20 ? '고급' : '프리미엄'} 단계`)

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
    startAgent('analyst', 1, '트렌드 분석', 'Trend Analysis')
    await runAgent('analyst', `
      현재 플랫폼(public/games/game-registry.json)을 분석하고,
      HTML5 게임 트렌드를 검색하여 다음 제작 게임을 추천해줘.
      결과를 docs/analytics/cycle-${cycleNumber}-report.md에 저장해줘.
      ⚠️ 영문 버전도 반드시 생성: docs/analytics/cycle-${cycleNumber}-report.en.md (같은 내용을 영어로 작성)
      ${growthDirective}
      ${feedbackBlock}
      ⚠️ 이전 사이클에서 지적된 장르 편중·구현 문제가 있다면 반드시 다른 방향을 선택할 것.
    `)
    completeAgent('analyst')

    // ── 2단계: 기획 ──────────────────────────────────────────
    console.log(`\n📋 [2/7] 플래너 — 게임 기획서 작성`)
    state.status = 'planning'
    startAgent('planner', 2, '게임 기획', 'Game Design')
    await runAgent('planner', `
      docs/analytics/cycle-${cycleNumber}-report.md를 읽고,
      제작할 게임의 상세 기획서를 docs/game-specs/cycle-${cycleNumber}-spec.md에 저장해줘.
      ⚠️ 영문 버전도 반드시 생성: docs/game-specs/cycle-${cycleNumber}-spec.en.md (같은 내용을 영어로 작성)
      기획서 맨 위에 반드시 YAML front-matter 형식으로:
      ---
      game-id: [영문-소문자-하이픈]
      title: [한국어 제목]
      genre: [장르]
      difficulty: [easy/medium/hard]
      ---
      형태로 메타데이터를 포함해줘.
      ${growthDirective}
      ${feedbackBlock}
      ⚠️ 이전 포스트모템의 "다음 사이클 제안"과 "아쉬웠던 점"을 기획서에 명시적으로 반영할 것.
    `)
    completeAgent('planner')

    // ── 3단계: 그래픽 에셋 제작 ──────────────────────────────
    console.log(`\n🎨 [3/7] 디자이너 — SVG 그래픽 에셋 제작`)
    state.status = 'designing'
    startAgent('designer', 3, '그래픽 에셋 제작', 'Graphic Asset Creation')
    await runAgent('designer', `
      docs/game-specs/cycle-${cycleNumber}-spec.md를 읽고,
      기획서의 game-id 폴더 안에 그래픽 에셋을 제작해줘.
      public/games/[game-id]/assets/ 폴더에 다음 파일들을 생성할 것:
      - player.svg, enemy.svg
      - bg-layer1.svg, bg-layer2.svg
      - ui-heart.svg, ui-star.svg
      - powerup.svg, effect-hit.svg
      - thumbnail.svg (플랫폼 썸네일, 반드시 width="400" height="300" viewBox="0 0 400 300" 포함)
      - manifest.json (에셋 목록)
      기획서의 game-id를 정확히 읽어 폴더명으로 사용할 것.
      ${growthDirective}
      ${feedbackBlock}
    `)
    completeAgent('designer')

    // ── 4단계: 게임 코딩 ─────────────────────────────────────
    console.log(`\n💻 [4/7] 코더 — HTML5 게임 구현 (디자이너 에셋 활용)`)
    state.status = 'coding'
    startAgent('coder', 4, '게임 코딩', 'Game Coding')
    await runAgent('coder', `
      docs/game-specs/cycle-${cycleNumber}-spec.md와
      public/games/[game-id]/assets/manifest.json을 읽고,
      public/games/[game-id]/index.html을 작성해줘.
      디자이너가 만든 SVG 에셋을 preloadAssets()로 로드하여 Canvas 렌더링에 활용할 것.
      기획서의 game-id를 정확히 읽어 폴더명으로 사용할 것.
      ${growthDirective}
      ${feedbackBlock}
      ⚠️ 이전 사이클 리뷰에서 지적된 코드 품질 문제(메모리 누수, 터치 이벤트 누락 등)를 반드시 해결할 것.
    `)
    completeAgent('coder')

    // ── 5단계: 리뷰 + 테스트 (최대 3회 반복) ──────────────────
    const MAX_REVIEW_ROUNDS = 3
    for (let round = 1; round <= MAX_REVIEW_ROUNDS; round++) {
      const isRetry = round > 1
      console.log(`\n🔍 [5/7] 리뷰어 — 코드 검토 & 브라우저 테스트 (${round}/${MAX_REVIEW_ROUNDS}회차)`)
      state.status = 'reviewing'
      startAgent('reviewer', 5, `코드 리뷰 + 테스트 (${round}회차)`, `Code Review + Test (round ${round})`)
      const reviewResult = await runAgent('reviewer', `
        docs/game-specs/cycle-${cycleNumber}-spec.md에서 game-id를 확인하고,
        public/games/[game-id]/index.html을 코드 리뷰 및 브라우저 테스트해줘.
        에셋 로딩(assets/manifest.json, SVG 파일들) 여부도 확인할 것.
        ${isRetry ? `⚠️ 이번은 ${round}회차 재리뷰입니다. 이전 리뷰(docs/reviews/cycle-${cycleNumber}-review.md)에서 지적한 사항이 실제로 수정되었는지 중점 검증해줘.` : ''}

        📱 모바일 조작 대응 검사 항목 (반드시 확인):
        - 터치 이벤트(touchstart/touchmove/touchend) 등록 여부
        - 가상 조이스틱 또는 터치 버튼 UI 존재 여부
        - 터치 영역이 44px 이상인지 (탭 타겟 사이즈)
        - 모바일 뷰포트 meta 태그 설정 여부
        - 가로/세로 스크롤 방지 (touch-action, overflow 처리)
        - 키보드 입력 없이 게임 플레이가 가능한지 여부

        결과를 docs/reviews/cycle-${cycleNumber}-review.md에 저장해줘.
        ⚠️ 영문 버전도 반드시 생성: docs/reviews/cycle-${cycleNumber}-review.en.md (같은 내용을 영어로 작성)
        최종 판정을 APPROVED / NEEDS_MINOR_FIX / NEEDS_MAJOR_FIX 중 하나로 명시해줘.
        YAML front-matter에 verdict: [판정] 을 반드시 포함할 것.
      `)
      completeAgent('reviewer')

      // APPROVED이면 루프 종료
      const needsFix = reviewResult.output.includes('NEEDS_MAJOR_FIX')
        || reviewResult.output.includes('NEEDS_MINOR_FIX')

      if (!needsFix) {
        console.log(`  ✅ 리뷰 통과 (${round}회차)`)
        break
      }

      // 마지막 회차면 더 이상 재작업하지 않음
      if (round === MAX_REVIEW_ROUNDS) {
        console.log(`  ⚠️ 최대 리뷰 횟수(${MAX_REVIEW_ROUNDS}회) 도달 — 현재 상태로 진행`)
        break
      }

      // 코더 재작업
      console.log(`\n🔧 [리뷰 피드백] 코더 재작업 시작... (${round}회차 피드백)`)
      startAgent('coder', 4, `코딩 재작업 (${round}회차 피드백 반영)`, `Code Rework (round ${round} feedback)`)
      await runAgent('coder', `
        docs/reviews/cycle-${cycleNumber}-review.md의 리뷰 피드백을 반영하여
        public/games/[game-id]/index.html을 수정해줘.
        기획서(docs/game-specs/cycle-${cycleNumber}-spec.md)의 game-id를 먼저 확인할 것.
        ${feedbackBlock}
        ⚠️ 리뷰에서 지적된 모든 항목(특히 모바일 터치 조작 대응)을 빠짐없이 수정할 것.
      `)
      completeAgent('coder')
    }

    // ── 6단계: 포스트모템 ──────────────────────────────────────
    console.log(`\n📝 [6/7] 포스트모템 — 사이클 총정리 + 플랫폼 지혜 갱신`)
    state.status = 'reviewing'
    startAgent('postmortem', 6, '포스트모템 작성', 'Postmortem')
    await runAgent('postmortem', `
      사이클 #${cycleNumber}의 포스트모템을 작성하고, 플랫폼 지혜 파일을 갱신해줘.

      작업 1 — 포스트모템 작성:
      - docs/game-specs/cycle-${cycleNumber}-spec.md 읽기
      - docs/reviews/cycle-${cycleNumber}-review.md 읽기
      - docs/post-mortem/cycle-${cycleNumber}-postmortem.md 에 저장
      - ⚠️ 영문 버전도 반드시 생성: docs/post-mortem/cycle-${cycleNumber}-postmortem.en.md
      - YAML front-matter에 cycle: ${cycleNumber} 포함할 것

      작업 2 — 플랫폼 지혜 갱신 (한국어 + 영어):
      - docs/meta/platform-wisdom.md 읽기 (없으면 새로 생성)
      - ⚠️ 영문 버전도 반드시 생성/갱신: docs/meta/platform-wisdom.en.md
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
    startAgent('deployer', 7, '레지스트리 등록 + 배포', 'Registry + Deploy')
    await runAgent('deployer', `
      docs/game-specs/cycle-${cycleNumber}-spec.md를 읽어 게임 정보를 확인하고:

      1. public/games/game-registry.json에 새 게임을 추가해줘
         ⚠️ thumbnail 경로는 반드시 "/games/[game-id]/assets/thumbnail.svg" 형식으로 등록할 것
         (assets/ 폴더 포함 — 빠뜨리면 썸네일이 표시되지 않음)

      2. ⚠️ 반드시 "i18n" 필드를 포함하여 다국어 메타데이터를 추가해줘!
         i18n 필드에 en, ja, zh-CN, zh-TW, es, fr, de, pt 8개 언어로
         title, description, tags, controls를 번역해서 넣을 것.
         예시 구조:
         "i18n": {
           "en": { "title": "Game Title", "description": "...", "tags": [...], "controls": [...] },
           "ja": { "title": "ゲームタイトル", "description": "...", "tags": [...], "controls": [...] },
           "zh-CN": { "title": "游戏标题", ... },
           "zh-TW": { "title": "遊戲標題", ... },
           "es": { "title": "Título del juego", ... },
           "fr": { "title": "Titre du jeu", ... },
           "de": { "title": "Spieltitel", ... },
           "pt": { "title": "Título do jogo", ... }
         }
         기본(ko) 데이터는 최상위 필드에 그대로 유지.
         번역은 자연스러운 현지 표현을 사용할 것.

      3. 아래 git 명령을 실행해줘:
         git add public/games/ docs/game-specs/ docs/reviews/ docs/post-mortem/ docs/analytics/ docs/meta/
         git commit -m "feat: add game from cycle #${cycleNumber}"
         git push origin main
    `)
    completeAgent('deployer')

    // ── 배포 검증 ────────────────────────────────────────────
    console.log(`\n🔍 [검증] 배포 결과 확인 중...`)
    const verifyErrors: string[] = []

    // 1. game-registry.json 검증
    try {
      const regPath = `${PROJECT_ROOT}/public/games/game-registry.json`
      const reg = JSON.parse(readFileSync(regPath, 'utf-8'))
      const specRaw = readFileSync(`${PROJECT_ROOT}/docs/game-specs/cycle-${cycleNumber}-spec.md`, 'utf-8')
      const gameIdMatch = specRaw.match(/game-id:\s*(.+)/)
      const gameId = gameIdMatch?.[1]?.trim() ?? ''

      if (gameId) {
        const game = reg.games.find((g: { id: string }) => g.id === gameId)
        if (!game) {
          verifyErrors.push(`게임 "${gameId}"이 registry에 없음`)
        } else {
          // i18n 필드 확인
          if (!game.i18n || Object.keys(game.i18n).length < 8) {
            verifyErrors.push(`게임 "${gameId}"의 i18n 필드 누락 또는 불완전 (${Object.keys(game.i18n ?? {}).length}/8)`)
          }
          // thumbnail 경로 확인
          if (!game.thumbnail?.includes('/assets/thumbnail.svg')) {
            verifyErrors.push(`게임 "${gameId}"의 thumbnail 경로 이상: ${game.thumbnail}`)
          }
        }

        // 2. 게임 파일 존재 확인
        const htmlPath = `${PROJECT_ROOT}/public/games/${gameId}/index.html`
        if (!existsSync(htmlPath)) {
          verifyErrors.push(`게임 HTML 파일 없음: ${htmlPath}`)
        } else {
          const htmlSize = readFileSync(htmlPath, 'utf-8').length
          if (htmlSize < 1000) {
            verifyErrors.push(`게임 HTML 파일이 너무 작음 (${htmlSize} bytes)`)
          }
        }

        // 3. 썸네일 파일 확인
        const thumbPath = `${PROJECT_ROOT}/public/games/${gameId}/assets/thumbnail.svg`
        if (!existsSync(thumbPath)) {
          verifyErrors.push(`썸네일 파일 없음: ${thumbPath}`)
        }

        // 4. totalGames 일치 확인
        if (reg.totalGames !== reg.games.length) {
          verifyErrors.push(`totalGames(${reg.totalGames}) != 실제 게임 수(${reg.games.length})`)
        }
      }
    } catch (e) {
      verifyErrors.push(`registry 검증 실패: ${e}`)
    }

    // 5. 문서 파일 확인
    const docChecks = [
      `docs/game-specs/cycle-${cycleNumber}-spec.md`,
      `docs/reviews/cycle-${cycleNumber}-review.md`,
      `docs/post-mortem/cycle-${cycleNumber}-postmortem.md`,
    ]
    for (const doc of docChecks) {
      if (!existsSync(`${PROJECT_ROOT}/${doc}`)) {
        verifyErrors.push(`문서 누락: ${doc}`)
      }
    }

    // 6. git push 상태 확인
    try {
      const { execSync } = await import('child_process')
      const gitStatus = execSync('git status --porcelain public/games/ docs/', { cwd: PROJECT_ROOT, encoding: 'utf-8' }).trim()
      if (gitStatus) {
        verifyErrors.push(`커밋되지 않은 파일 존재:\n${gitStatus}`)
      }
    } catch {}

    if (verifyErrors.length > 0) {
      console.log(`\n⚠️ [검증] ${verifyErrors.length}개 문제 발견:`)
      verifyErrors.forEach(e => console.log(`  ❌ ${e}`))
      console.log(`\n🔧 [검증] 자동 수정 시도 중...`)

      // 자동 수정 에이전트 실행
      startAgent('deployer', 7, '배포 검증 수정', 'Deploy Verification Fix')
      await runAgent('deployer', `
        배포 검증에서 다음 문제가 발견되었습니다. 수정해줘:

        ${verifyErrors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

        수정 방법:
        - registry에 게임이 없으면 추가 (i18n 8개 언어 포함)
        - totalGames 불일치면 수정
        - 커밋되지 않은 파일이 있으면:
          git add public/games/ docs/
          git commit -m "fix: deploy verification for cycle #${cycleNumber}"
          git push origin main
      `)
      completeAgent('deployer')
      console.log(`  ✅ [검증] 수정 완료`)
    } else {
      console.log(`  ✅ [검증] 모든 항목 통과`)
    }

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
