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
import { generateGameAssets, generateThumbnailFromAssets } from './gemini-image.js'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')

// ── 이전 사이클 피드백 컨텍스트 로더 ──────────────────────────────────────────

/** 에이전트별 누적 지혜 로드 (한국어만, 최대 2000자) */
function loadAgentWisdom(agentId: string): string {
  const path = `${PROJECT_ROOT}/docs/meta/wisdom-${agentId}.md`
  if (!existsSync(path)) return ''
  try { return readFileSync(path, 'utf-8').slice(0, 2000) } catch { return '' }
}

/** 에이전트별 지혜 갱신 프롬프트 블록 생성 (한국어만 참조/갱신) */
function agentWisdomBlock(agentId: string, cycleNumber: number): string {
  const wisdom = loadAgentWisdom(agentId)
  const wisdomFile = `docs/meta/wisdom-${agentId}.md`

  return `
---
## 📚 에이전트 누적 지혜 (${agentId})

${wisdom ? `### 기존 지혜 (참고)\n${wisdom}` : '(아직 지혜 없음)'}

### ⚠️ 작업 완료 후 반드시 수행:
${wisdomFile}을 읽고 이번 사이클에서 배운 점을 반영해줘.
⚠️ 영문(.en.md)은 생성/갱신하지 마세요 — 한국어 파일만 관리.
⚠️ 컴팩트 정리: 파일이 150줄을 넘으면 아래 규칙으로 압축할 것:
  - 3사이클 이상 반복되지 않은 단발성 이슈는 삭제
  - "OBSOLETE" 표시된 항목은 삭제
  - 유사 항목을 하나로 병합 (예: "[Cycle 5,8,12] 같은 문제" 형태)
  - "다음 사이클 적용 사항"은 최신 3개만 유지
  - 전체 파일을 100줄 이내로 유지
형식:
# ${agentId} 누적 지혜
_마지막 갱신: 사이클 #${cycleNumber}_

## 반복되는 실수 🚫
[사이클 번호와 함께 — 최대 10개]

## 검증된 성공 패턴 ✅
[사이클 번호와 함께 — 최대 10개]

## 다음 사이클 적용 사항 🎯
[최대 3개]
---
`
}

/** 누적 플랫폼 지혜 파일 읽기 (한국어만, 최대 2000자) */
function loadPlatformWisdom(): string {
  const path = `${PROJECT_ROOT}/docs/meta/platform-wisdom.md`
  if (!existsSync(path)) return ''
  try { return readFileSync(path, 'utf-8').slice(0, 2000) } catch { return '' }
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
        maxTurns:       80,
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

  // ── 매치3 집중 모드 (사이클 44~53) ──────────────────────────
  const MATCH3_START = 44
  const MATCH3_END   = 53
  const isMatch3Mode = cycleNumber >= MATCH3_START && cycleNumber <= MATCH3_END
  const match3Round  = isMatch3Mode ? cycleNumber - MATCH3_START + 1 : 0
  const match3Directive = isMatch3Mode ? `
═══════════════════════════════════════════════════════════
⚠️ 매치3 집중 모드 (${match3Round}/10 라운드)
═══════════════════════════════════════════════════════════

이번 싸이클은 **매치3 퍼즐 게임**만 제작합니다.
목표: 로얄 매치(Royal Match) 급 프리미엄 매치3 게임

### 라운드별 진화 방향:
${match3Round <= 3 ? `[초기 ${match3Round}/3] 핵심 매치3 메카닉 완성
- 3매치/4매치/5매치 + L/T자 매칭 시스템
- 보석 스왑 애니메이션 (트윈 보간, 바운스 이징)
- 매칭 → 제거 → 낙하 → 연쇄 반응 (cascade) 루프
- 기본 보석 5~6색 + 스페셜 보석 (줄 파괴, 폭탄, 무지개)
- 화려한 매칭 이펙트: 파티클 폭발, 빛줄기, 화면 쉐이크
- 콤보 카운터 + 점수 팝업 애니메이션`
: match3Round <= 6 ? `[중기 ${match3Round - 3}/3] 레벨/목표 시스템 + 비주얼 향상
- 다양한 레벨 목표: 점수 달성, 특정 보석 N개 제거, 장애물 파괴, 젤리 제거
- 장애물 시스템: 얼음(1~3겹), 체인, 나무 상자, 독 퍼짐
- 부스터/파워업: 망치, 셔플, 추가 턴, 색상 폭탄
- 레벨 맵 (10~20 레벨)
- 로얄 매치급 비주얼: 보석 반짝임, 스페셜 생성 연출, 레벨 클리어 축하 애니메이션
- 매칭 시 보석별 고유 파티클 색상/패턴`
: `[후기 ${match3Round - 6}/4] 프리미엄 완성 + 메타 시스템
- 완성된 매치3 + 이전 라운드 최고 코드 기반으로 발전
- 스토리/테마 (왕국 건설, 정원 꾸미기, 탐험 등)
- 스타 수집 → 건설/장식 메타 게임
- 일일 챌린지 / 이벤트 레벨 시스템
- 난이도 동적 조절 (DDA) — 연속 실패 시 쉬워짐
- 프리미엄급 UI: 부드러운 전환, 리치 애니메이션, 주스(juice) 이펙트 극대화
- 사운드 디자인: 매칭 음, 콤보 음, 스페셜 생성 음, 레벨 클리어 팡파레`}

### 이전 매치3 게임 개선:
- 이전 라운드 게임의 코드를 반드시 참고하여 문제점 개선
- 같은 실수 반복 금지 — 이전 리뷰의 지적 사항 반영
- 매 라운드마다 비주얼 퀄리티와 게임성이 눈에 띄게 향상되어야 함

### 에셋 특별 요구사항:
- 보석(gem) 에셋: 6색 이상, 각각 고유한 형태 + 빛 반사 + 내부 광택
- 스페셜 보석: 줄 파괴(가로/세로 화살표), 폭탄(3x3), 무지개(전색 제거)
- 이펙트: 매칭 폭발, 콤보 텍스트 팝업, 줄 파괴 레이저, 폭탄 충격파
- 배경: 판타지 왕국/정원/성 등 로얄 매치 분위기
- UI: 레벨 목표 패널, 부스터 버튼, 턴 수 표시, 점수바

### 아트 스타일:
- 로얄 매치/캔디 크러시 급 — 밝고 화려한 3D 느낌의 2D 보석
- 부드러운 그라디언트, 글로시 반사, 보석 내부 빛 산란
- 배경은 따뜻한 판타지 동화 스타일
═══════════════════════════════════════════════════════════
` : ''
  if (isMatch3Mode) {
    console.log(`  💎 매치3 집중 모드 (${match3Round}/10 라운드)`)
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
    startAgent('analyst', 1, '트렌드 분석', 'Trend Analysis')
    await runAgent('analyst', `
      현재 플랫폼(public/games/game-registry.json)을 분석하고,
      HTML5 게임 트렌드를 검색하여 다음 제작 게임을 추천해줘.
      결과를 docs/analytics/cycle-${cycleNumber}-report.md에 저장해줘.
      ⚠️ 영문(.en.md) 버전은 생성하지 마세요 — 한국어만 작성
      ${match3Directive}
      ${growthDirective}
      ${feedbackBlock}
      ${isMatch3Mode ? '⚠️ 이번 싸이클은 매치3 퍼즐 게임만 분석/추천하세요. 다른 장르는 추천하지 마세요.' : '⚠️ 이전 사이클에서 지적된 장르 편중·구현 문제가 있다면 반드시 다른 방향을 선택할 것.'}
      ${agentWisdomBlock('analyst', cycleNumber)}
    `)
    completeAgent('analyst')

    // ── 2단계: 기획 ──────────────────────────────────────────
    console.log(`\n📋 [2/7] 플래너 — 게임 기획서 작성`)
    state.status = 'planning'
    startAgent('planner', 2, '게임 기획', 'Game Design')
    await runAgent('planner', `
      docs/analytics/cycle-${cycleNumber}-report.md를 읽고,
      제작할 게임의 상세 기획서를 docs/game-specs/cycle-${cycleNumber}-spec.md에 저장해줘.
      ⚠️ 영문(.en.md) 버전은 생성하지 마세요 — 한국어만 작성
      기획서 맨 위에 반드시 YAML front-matter 형식으로:
      ---
      game-id: [영문-소문자-하이픈]
      title: [한국어 제목]
      genre: [장르]
      difficulty: [easy/medium/hard]
      ---
      형태로 메타데이터를 포함해줘.
      ${match3Directive}
      ${growthDirective}
      ${feedbackBlock}
      ${isMatch3Mode ? '⚠️ 반드시 매치3 퍼즐 게임을 기획하세요. 다른 장르는 기획하지 마세요. 이전 매치3 게임의 리뷰를 참고하여 개선하세요.' : '⚠️ 이전 포스트모템의 "다음 사이클 제안"과 "아쉬웠던 점"을 기획서에 명시적으로 반영할 것.'}
      ${agentWisdomBlock('planner', cycleNumber)}
    `)
    completeAgent('planner')

    // ── 3단계: 그래픽 에셋 제작 (Gemini PNG + Claude 아트 디렉션) ──
    console.log(`\n🎨 [3/7] 디자이너 — Gemini PNG 에셋 생성`)
    state.status = 'designing'
    startAgent('designer', 3, '그래픽 에셋 제작 (Gemini PNG)', 'Graphic Assets (Gemini PNG)')

    // 3-A: 기획서에서 게임 정보 + 에셋 요구사항 추출
    const specPath = `${PROJECT_ROOT}/docs/game-specs/cycle-${cycleNumber}-spec.md`
    let gameId = '', gameTitle = '', genre = '', specContent = ''
    if (existsSync(specPath)) {
      specContent = readFileSync(specPath, 'utf-8')
      const idMatch    = specContent.match(/game-id:\s*(.+)/)
      const titleMatch = specContent.match(/title:\s*(.+)/)
      const genreMatch = specContent.match(/genre:\s*(.+)/)
      gameId    = idMatch?.[1]?.trim() ?? ''
      gameTitle = titleMatch?.[1]?.trim() ?? ''
      genre     = genreMatch?.[1]?.trim() ?? ''
    }

    if (gameId) {
      const assetsDir = `${PROJECT_ROOT}/public/games/${gameId}/assets`

      // 3-B: Gemini로 PNG 에셋 생성 (기획서의 asset-requirements 기반)
      if (process.env.GEMINI_API_KEY) {
        console.log(`  🎨 Gemini PNG 생성 시작 (game: ${gameId})`)
        try {
          const result = await generateGameAssets(gameId, gameTitle, genre, specContent, assetsDir)
          console.log(`  ✅ Gemini 생성 완료: ${result.generated.length}개 성공, ${result.failed.length}개 실패`)
          if (result.failed.length > 0) {
            console.log(`  ⚠️ 실패 에셋: ${result.failed.join(', ')}`)
          }
        } catch (err) {
          console.error(`  ❌ Gemini 에셋 생성 실패:`, err)
        }
      } else {
        console.log(`  ⚠️ GEMINI_API_KEY 없음 — Claude 디자이너로 SVG 폴백`)
      }

      // 3-C: Claude 디자이너로 보완 (누락 에셋 SVG 생성 + 아트 디렉션)
      await runAgent('designer', `
        docs/game-specs/cycle-${cycleNumber}-spec.md를 읽고,
        public/games/${gameId}/assets/ 폴더를 확인해줘.

        ⚠️ Gemini API가 PNG 에셋을 이미 생성했을 수 있습니다.
        먼저 assets/ 폴더에 어떤 파일이 있는지 확인(ls)한 후:

        1. PNG 파일이 있으면 → manifest.json만 갱신 (PNG 에셋 포함)
        2. 누락된 에셋이 있으면 → SVG로 보완 생성
        3. thumbnail.png가 없으면 → thumbnail.svg를 반드시 생성
           (width="400" height="300" viewBox="0 0 400 300")

        manifest.json 형식:
        {
          "gameId": "${gameId}",
          "format": "png",
          "assets": {
            "player":    { "file": "player.png 또는 player.svg", "desc": "..." },
            "enemy":     { "file": "enemy.png 또는 enemy.svg", "desc": "..." },
            ...
          }
        }

        ${agentWisdomBlock('designer', cycleNumber)}
      `)
    } else {
      // gameId를 못 읽으면 기존 방식으로 폴백
      await runAgent('designer', `
        docs/game-specs/cycle-${cycleNumber}-spec.md를 읽고 에셋을 제작해줘.
        ${agentWisdomBlock('designer', cycleNumber)}
      `)
    }
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

      ⚠️⚠️⚠️ 필수 구현 체크리스트 (하나라도 빠지면 리뷰 FAIL):

      1. 게임 시작: 타이틀 화면 → SPACE/클릭/탭으로 시작 → 상태 초기화
      2. 키보드 조작: keydown/keyup으로 이동(WASD/화살표) + 액션(Space 등) 실제 동작
      3. 모바일 조작: touchstart/touchmove/touchend + 화면에 가상 조이스틱/버튼 렌더링
         → 터치 입력이 실제 플레이어 이동/액션으로 연결될 것
         → 터치만으로 시작/플레이/재시작 모든 흐름이 가능할 것
      4. 게임 오버: 명확한 종료 조건 + 게임 오버 화면 + 최고점수 localStorage 저장
      5. 재시작: R키/탭으로 모든 상태(점수, 적, 위치) 완전 초기화 후 재시작
      6. Canvas: devicePixelRatio 대응 + resize 이벤트 + 전체 화면 맞춤
      7. 외부 의존 제거: Google Fonts 같은 외부 CDN 사용 금지. 시스템 폰트만 사용.
         → font-family: 'Segoe UI', system-ui, -apple-system, sans-serif
      ${agentWisdomBlock('coder', cycleNumber)}
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

        ═══════════════════════════════════════════════════
        🎮 게임 플레이 완전성 검증 (가장 중요 — 반드시 통과해야 APPROVED)
        ═══════════════════════════════════════════════════

        아래 항목을 코드에서 직접 확인하고, 각 항목별 PASS/FAIL을 명시할 것.
        하나라도 FAIL이면 NEEDS_MAJOR_FIX 판정.

        📌 1. 게임 시작 흐름
        - 타이틀/시작 화면이 존재하는가?
        - SPACE 키 또는 클릭/탭으로 게임이 시작되는가?
        - 시작 시 게임 상태(점수, 위치, 체력 등)가 올바르게 초기화되는가?

        📌 2. 입력(조작) 시스템 — 데스크톱
        - keydown/keyup 이벤트 리스너가 등록되어 있는가?
        - 이동 키(WASD 또는 화살표)가 실제로 플레이어를 움직이는가?
          → 키 입력 → 상태 변경 → 렌더링까지 코드 흐름을 추적할 것
        - 공격/액션 키(Space, Z 등)가 실제로 동작하는가?
        - 일시정지(P/ESC)가 게임 루프를 정지시키는가?

        📌 3. 입력(조작) 시스템 — 모바일
        - touchstart/touchmove/touchend 이벤트가 등록되어 있는가?
        - 가상 조이스틱 또는 터치 버튼이 화면에 렌더링되는가?
        - 터치 입력이 실제로 게임 로직에 연결되는가?
          → 터치 좌표 → 조이스틱 방향 → 플레이어 이동까지 추적
        - 터치 타겟이 44px 이상인가?
        - touch-action: none, overflow: hidden 등 스크롤 방지가 되어 있는가?

        📌 4. 게임 루프 & 로직
        - requestAnimationFrame 기반 게임 루프가 있는가?
        - delta time(dt)을 계산하여 프레임 독립적 업데이트를 하는가?
        - 충돌 감지가 올바르게 구현되어 있는가? (거리 계산, hitbox 등)
        - 점수가 실제로 증가하는 코드 경로가 있는가?
        - 난이도 변화가 실제로 적용되는가? (웨이브/레벨/속도 증가 등)

        📌 5. 게임 오버 & 재시작
        - 게임 오버 조건이 명확히 구현되어 있는가? (HP 0, 시간 초과 등)
        - 게임 오버 화면이 표시되는가?
        - 최고 점수가 localStorage에 저장/로드되는가?
        - R키 또는 탭으로 재시작 시 모든 상태가 완전히 초기화되는가?
          → 점수, 적, 플레이어 위치, 타이머 등 모두 리셋 확인
        - 재시작 후 게임이 정상적으로 다시 진행되는가?

        📌 6. 화면 렌더링
        - canvas 크기가 window.innerWidth/Height에 맞게 설정되는가?
        - devicePixelRatio가 적용되어 선명하게 렌더링되는가?
        - resize 이벤트에서 canvas가 재조정되는가?
        - 배경, 캐릭터, UI 요소가 모두 렌더링되는가?
          → 시작 화면, 게임 중, 게임 오버 각 상태에서 확인

        📌 7. 외부 의존성 안전성
        - Google Fonts 등 외부 CDN이 로드 실패해도 게임이 동작하는가?
          → font-family에 시스템 폰트 폴백이 있는가?
        - 에셋(SVG) 로드 실패 시 Canvas 폴백 드로잉이 있는가?

        ═══════════════════════════════════════════════════
        📱 모바일 조작 대응 검사
        ═══════════════════════════════════════════════════
        - 모바일 뷰포트 meta 태그 (width=device-width, user-scalable=no)
        - 키보드 입력 없이 게임의 모든 기능(시작, 플레이, 재시작)이 가능한지
        - 가상 조이스틱/버튼이 게임 화면을 가리지 않는 위치에 배치되는지

        ═══════════════════════════════════════════════════
        🚫 📌 8. 진행 불가능(Stuck) 상태 검증 — CRITICAL
        ═══════════════════════════════════════════════════
        모든 화면/상태에서 "진행 불가능" 상태가 없는지 코드 흐름을 추적하여 검증.
        하나라도 FAIL이면 NEEDS_MAJOR_FIX.

        8-1. TITLE 화면:
        - ACTIVE_SYSTEMS에서 input이 활성(true)인가?
        - ACTIVE_SYSTEMS에서 tween이 활성(true)인가? (beginTransition 사용 시 필수)
        - Space/Enter/클릭/터치 모두 → 다음 상태 전환 코드가 존재하는가?
        - 상태 전환 함수(beginTransition/setState)가 실제로 state를 변경하는가?

        8-2. 레벨 선택/메뉴:
        - 터치/클릭으로 선택 가능한 코드 경로 존재하는가?
        - 키보드(화살표+Enter)로도 선택 가능한가?
        - 뒤로 가기(ESC) 코드가 있는가?

        8-3. 게임 플레이 데드락:
        - 매치3: 가능한 이동이 0개일 때 자동 셔플 또는 리필 로직이 있는가?
        - 웨이브 게임: 모든 적 처치 후 다음 웨이브 트리거가 있는가?
        - 타이머 게임: 시간 초과 시 게임오버 전환이 있는가?
        - 무한 대기 상태가 발생할 수 있는 코드 경로가 없는가?

        8-4. 게임 오버/결과:
        - R키 + 터치/클릭 모두로 재시작 코드가 있는가?
        - 재시작 시 score=0, level=1, enemies=[], timer 리셋 등 완전 초기화 확인
        - 재시작 후 게임이 실제로 정상 진행되는 코드 흐름 확인

        8-5. 레벨 클리어/업그레이드:
        - 클리어 후 다음 화면 진행 코드가 있는가?
        - 선택지가 있으면 터치+키보드 모두 동작하는가?
        - 타임아웃 시 자동 진행 또는 기본 선택 코드가 있는가?

        8-6. 일시정지/모달:
        - ESC 또는 터치로 닫기 가능한가?
        - 닫힌 후 게임이 정상 재개되는가?

        ═══════════════════════════════════════════════════

        ⚠️ 판정 기준 (엄격 적용):
        - APPROVED: 📌 1~8 모두 PASS + 모바일 조작 가능
        - NEEDS_MINOR_FIX: 핵심 플레이는 되지만 일부 미흡 (UI 깨짐 등)
        - NEEDS_MAJOR_FIX: 📌 1~5 또는 📌 8 중 하나라도 FAIL

        결과를 docs/reviews/cycle-${cycleNumber}-review.md에 저장해줘.
        ⚠️ 영문(.en.md) 버전은 생성하지 마세요 — 한국어만 작성
        최종 판정을 APPROVED / NEEDS_MINOR_FIX / NEEDS_MAJOR_FIX 중 하나로 명시해줘.
        YAML front-matter에 verdict: [판정] 을 반드시 포함할 것.
        ${agentWisdomBlock('reviewer', cycleNumber)}
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

    // ── 5.5단계: 플래너·디자이너 재검토 → 코더 개선 → 2차 리뷰 ──
    console.log(`\n🔄 [5.5/7] 플래너·디자이너 재검토 + 코더 개선 + 2차 리뷰`)

    // 플래너 재검토: 기획서 대비 구현 점검
    startAgent('planner', 5, '기획 적합성 재검토', 'Design Conformance Review')
    const plannerReview = await runAgent('planner', `
      docs/game-specs/cycle-${cycleNumber}-spec.md(기획서)와
      public/games/[game-id]/index.html(구현 결과)을 비교하여 개선 사항을 정리해줘.
      기획서의 game-id를 먼저 확인할 것.

      검토 항목:
      1. 기획서에 명시된 게임 규칙이 모두 구현되었는가?
      2. 조작 방법이 기획서와 일치하는가? (키 매핑, 터치 조작)
      3. 난이도 시스템이 기획대로 동작하는가?
      4. 점수/보상 시스템이 기획서와 일치하는가?
      5. 시각 스타일이 기획서의 컨셉에 부합하는가?
      6. 누락된 기능이나 기획과 다르게 구현된 부분

      개선 사항을 구체적으로 나열해줘 (코더가 바로 수정할 수 있도록).
      결과를 텍스트로 출력해줘 (파일 저장 불필요).
    `)
    completeAgent('planner')

    // 디자이너 재검토: 비주얼 품질 점검
    startAgent('designer', 5, '비주얼 품질 재검토', 'Visual Quality Review')
    const designerReview = await runAgent('designer', `
      public/games/[game-id]/index.html과
      public/games/[game-id]/assets/ 폴더의 에셋을 검토해줘.
      기획서(docs/game-specs/cycle-${cycleNumber}-spec.md)의 game-id를 먼저 확인할 것.

      검토 항목:
      1. 에셋이 게임에서 올바르게 사용되고 있는가? (preloadAssets + drawImage)
      2. Canvas 폴백 드로잉이 에셋 없이도 식별 가능한가?
      3. UI 요소(HUD, 버튼, 메뉴)의 시각적 완성도
      4. 파티클/이펙트의 시각적 퀄리티
      5. 색상 팔레트의 일관성
      6. 시작 화면, 게임 화면, 게임 오버 화면의 비주얼 완성도
      7. 모바일에서 가상 조이스틱/버튼의 시각적 명확성

      개선 사항을 구체적으로 나열해줘.
      결과를 텍스트로 출력해줘 (파일 저장 불필요).
    `)
    completeAgent('designer')

    // 코더 개선: 플래너+디자이너 피드백 반영
    const hasFeedback = (plannerReview.output + designerReview.output).length > 100
    if (hasFeedback) {
      console.log(`\n🔧 [5.5/7] 코더 — 플래너·디자이너 피드백 반영`)
      startAgent('coder', 5, '기획·비주얼 피드백 반영', 'Planner+Designer Feedback')
      await runAgent('coder', `
        아래 피드백을 반영하여 public/games/[game-id]/index.html을 수정해줘.
        기획서(docs/game-specs/cycle-${cycleNumber}-spec.md)의 game-id를 먼저 확인할 것.

        ═══ 플래너 피드백 ═══
        ${plannerReview.output.slice(0, 2000)}

        ═══ 디자이너 피드백 ═══
        ${designerReview.output.slice(0, 2000)}

        ⚠️ 모든 피드백을 빠짐없이 반영할 것.
        ⚠️ 기존에 동작하던 기능을 깨뜨리지 말 것.
      `)
      completeAgent('coder')

      // 2차 리뷰 (최대 3회 반복)
      const MAX_REVIEW2_ROUNDS = 3
      for (let round2 = 1; round2 <= MAX_REVIEW2_ROUNDS; round2++) {
        const isRetry2 = round2 > 1
        console.log(`\n🔍 [5.5/7] 2차 리뷰 (${round2}/${MAX_REVIEW2_ROUNDS}회차)`)
        startAgent('reviewer', 5, `2차 리뷰 (${round2}회차)`, `2nd Review (round ${round2})`)
        const review2Result = await runAgent('reviewer', `
          docs/game-specs/cycle-${cycleNumber}-spec.md에서 game-id를 확인하고,
          public/games/[game-id]/index.html을 재검토해줘.

          ${isRetry2 ? `⚠️ 이번은 2차 리뷰 ${round2}회차입니다. 이전 지적 사항이 수정되었는지 중점 검증.` : ''}

          이것은 플래너·디자이너 피드백 반영 후 2차 리뷰입니다.
          1차 리뷰와 동일한 기준(📌 1~7)으로 검증하되,
          특히 다음을 중점 확인:
          - 플래너 피드백 반영 여부 (기획 적합성)
          - 디자이너 피드백 반영 여부 (비주얼 품질)
          - 기존 기능이 깨지지 않았는지 (회귀 테스트)

          결과를 docs/reviews/cycle-${cycleNumber}-review.md에 덮어쓰기 저장.
          ⚠️ 영문 버전도 갱신: docs/reviews/cycle-${cycleNumber}-review.en.md
          최종 판정: APPROVED / NEEDS_MINOR_FIX / NEEDS_MAJOR_FIX
          YAML front-matter에 verdict 포함.
        `)
        completeAgent('reviewer')

        const needsFix2 = review2Result.output.includes('NEEDS_MAJOR_FIX')
          || review2Result.output.includes('NEEDS_MINOR_FIX')

        if (!needsFix2) {
          console.log(`  ✅ 2차 리뷰 통과 (${round2}회차)`)
          break
        }

        if (round2 === MAX_REVIEW2_ROUNDS) {
          console.log(`  ⚠️ 2차 리뷰 최대 횟수(${MAX_REVIEW2_ROUNDS}회) 도달`)
          break
        }

        // 코더 재수정
        console.log(`\n🔧 [2차 피드백] 코더 재작업 (${round2}회차)`)
        startAgent('coder', 5, `2차 재작업 (${round2}회차)`, `2nd Rework (round ${round2})`)
        await runAgent('coder', `
          docs/reviews/cycle-${cycleNumber}-review.md의 2차 리뷰 피드백을 반영하여
          public/games/[game-id]/index.html을 수정해줘.
          기획서(docs/game-specs/cycle-${cycleNumber}-spec.md)의 game-id를 먼저 확인할 것.
          ⚠️ 지적된 모든 항목을 수정하되 기존 기능을 깨뜨리지 말 것.
        `)
        completeAgent('coder')
      }
    } else {
      console.log(`  ✅ 플래너·디자이너 피드백 없음 — 2차 리뷰 생략`)
    }

    // ── 6단계: 포스트모템 ──────────────────────────────────────
    console.log(`\n📝 [6/7] 포스트모템 — 사이클 총정리 + 플랫폼 지혜 갱신`)
    state.status = 'reviewing'
    startAgent('postmortem', 6, '포스트모템 작성', 'Postmortem')
    await runAgent('postmortem', `
      사이클 #${cycleNumber}의 포스트모템을 작성하고, 플랫폼 지혜 파일을 갱신해줘.

      작업 1 — 포스트모템 작성 (한국어만):
      - docs/game-specs/cycle-${cycleNumber}-spec.md 읽기
      - docs/reviews/cycle-${cycleNumber}-review.md 읽기
      - docs/post-mortem/cycle-${cycleNumber}-postmortem.md 에 저장
      - YAML front-matter에 cycle: ${cycleNumber} 포함
      - ⚠️ 영문(.en.md) 버전은 생성하지 마세요 — 한국어만 작성

      작업 2 — 플랫폼 지혜 갱신 (한국어만, 컴팩트 유지):
      - docs/meta/platform-wisdom.md 읽기 (없으면 새로 생성)
      - ⚠️ 영문(.en.md) 버전은 생성/갱신하지 마세요
      - 이번 사이클 인사이트 추가 + 파일 크기 정리
      - 아래 형식 + ⚠️ 컴팩트 규칙을 따를 것:

      # InfiniTriX 플랫폼 지혜 (누적 학습)
      _마지막 갱신: 사이클 #${cycleNumber}_

      ## 피해야 할 패턴 🚫 (최대 10개)
      ## 검증된 성공 패턴 ✅ (최대 10개)
      ## 기술 개선 누적 🛠️ (최대 10개)
      ## 장르별 노하우 🎮 (최대 10개)
      ## 다음 사이클 우선순위 🎯 (최대 3개)

      ⚠️ 컴팩트 규칙 (반드시 적용):
      - 전체 파일 150줄 이내 유지
      - "OBSOLETE" 표시 항목은 삭제
      - 3사이클 이상 재발하지 않은 단발성 이슈는 삭제
      - 유사 항목 병합 (예: "[Cycle 5,8,12] 동일 문제" 형태)
      - 각 섹션 최대 10개 항목 (넘으면 가장 오래된 것부터 삭제)
      - "다음 사이클 우선순위"는 이전 것 삭제 후 최신 3개만
    `)
    completeAgent('postmortem')

    // ── 7단계: 배포 ──────────────────────────────────────────
    console.log(`\n🚢 [7/7] 배포 담당 — 레지스트리 등록 & GitHub Push`)
    state.status = 'deploying'
    startAgent('deployer', 7, '레지스트리 등록 + 배포', 'Registry + Deploy')
    await runAgent('deployer', `
      docs/game-specs/cycle-${cycleNumber}-spec.md를 읽어 게임 정보를 확인하고:

      1. public/games/game-registry.json에 새 게임을 추가해줘
         ⚠️ thumbnail 경로: assets 폴더에서 ls 명령으로 확인 후:
         - thumbnail.png 있으면 → "/games/[game-id]/assets/thumbnail.png" (PNG 우선!)
         - thumbnail.png 없으면 → "/games/[game-id]/assets/thumbnail.svg"
         반드시 실제 파일 존재 여부를 확인하고 경로를 등록할 것
         ⚠️ addedAt은 반드시 new Date().toISOString() 으로 현재 시각을 사용할 것!
         (임의 시간 입력 금지 — 최신순 정렬에 영향)

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
      const specMeta: Record<string,string> = {}
      for (const m of specRaw.matchAll(/^(\w[\w-]*):\s*(.+)$/gm)) { specMeta[m[1]] = m[2].trim() }

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

        // 3. 썸네일 파일 확인 (PNG 우선, SVG 폴백)
        const thumbPng = `${PROJECT_ROOT}/public/games/${gameId}/assets/thumbnail.png`
        const thumbSvg = `${PROJECT_ROOT}/public/games/${gameId}/assets/thumbnail.svg`
        if (!existsSync(thumbPng)) {
          // PNG 썸네일이 없으면 에셋 기반으로 Gemini 생성 시도
          if (process.env.GEMINI_API_KEY) {
            console.log(`  🖼️ [검증] thumbnail.png 없음 — 에셋 기반 생성 시도`)
            try {
              const ok = await generateThumbnailFromAssets(
                gameId, specMeta['title'] ?? gameId, specMeta['genre'] ?? '',
                `${PROJECT_ROOT}/public/games/${gameId}/assets`
              )
              if (!ok && !existsSync(thumbSvg)) {
                verifyErrors.push(`썸네일 파일 없음 (PNG 생성 실패, SVG도 없음)`)
              }
            } catch {
              if (!existsSync(thumbSvg)) {
                verifyErrors.push(`썸네일 파일 없음`)
              }
            }
          } else if (!existsSync(thumbSvg)) {
            verifyErrors.push(`썸네일 파일 없음`)
          }
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
        - 썸네일 파일이 없으면:
          → public/games/[game-id]/assets/ 폴더 생성 (mkdir -p)
          → thumbnail.svg 생성 (width="400" height="300" viewBox="0 0 400 300")
          → 게임의 장르와 제목에 맞는 매력적인 SVG 이미지 제작
        - i18n 필드가 누락되면 8개 언어(en,ja,zh-CN,zh-TW,es,fr,de,pt)로 추가
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
