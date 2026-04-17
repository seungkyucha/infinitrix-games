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
import { generateGameAssets, generateThumbnailFromAssets, isImageGenerationAvailable, getImageProvider } from './image/index.js'
import {
  loadCheckpoint, initCheckpoint, markPhaseDone, hasPhaseDone, clearCheckpoint,
  type CycleCheckpoint, type PhaseName,
} from './checkpoint.js'

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

  // ── 스팀 인디 장르 로테이션 ─────────────────────────────────
  // 목표: 매 사이클마다 다른 장르/아트 스타일을 시도, 폭넓은 포트폴리오 구축.
  // 분석가·플래너는 이 목록 안에서만 선택하도록 강제된다.
  const STEAM_INDIE_GENRES = [
    { id: 'roguelike',        name: '로그라이크',       desc: '매 런마다 랜덤 생성되는 던전, 영구 죽음, 메타 업그레이드 (Hades/Dead Cells 계열)' },
    { id: 'survivor-like',    name: '서바이벌 슈터',   desc: '자동 공격, 웨이브 누적, 빌드 조합 (Vampire Survivors/Brotato 계열)' },
    { id: 'deckbuilder',      name: '덱빌더 로그라이크', desc: '카드 선택, 덱 구축, 턴제 전투 (Slay the Spire/Balatro 계열)' },
    { id: 'metroidvania',     name: '메트로배니아',    desc: '탐험, 능력 획득, 맵 언락 (Hollow Knight/Ori 계열)' },
    { id: 'bullet-hell',      name: '탄막 슈터',        desc: '빽빽한 탄막 회피, 패턴 암기, 보스 러시 (Touhou/Enter the Gungeon 계열)' },
    { id: 'puzzle-platformer', name: '퍼즐 플랫포머',   desc: '물리 기반 퍼즐, 기믹 상호작용 (Celeste/Limbo 계열)' },
    { id: 'auto-battler',     name: '오토 배틀러',      desc: '유닛 배치, 자동 전투, 시너지 (Teamfight Tactics/Super Auto Pets 계열)' },
    { id: 'tower-defense',    name: '타워 디펜스',      desc: '경로 방어, 타워 배치·업그레이드 (Bloons TD/Kingdom Rush 계열)' },
    { id: 'incremental',      name: '인크리멘털/클리커', desc: '자동 생산, 업그레이드 트리, 프리스티지 (Cookie Clicker/NGU Idle 계열)' },
    { id: 'match3',           name: '매치3 퍼즐',       desc: '보석 스왑, 콤보, 스페셜 젬 (Royal Match/Candy Crush 계열)' },
    { id: 'boomer-shooter',   name: '부머 슈터',        desc: '빠른 FPS, 시크릿, 아레나 전투 (DOOM/Quake 계열의 2.5D)' },
  ] as const

  // 10개 고정 아트 스타일 — 플래너가 하나를 골라 모든 에셋에 강제 적용
  const ART_STYLES = [
    { id: 'pixel-art-16bit',  name: '16-bit 픽셀아트',   cue: 'Crisp 16-bit pixel art, limited palette, dithering, retro SNES/Genesis feel. Sharp pixels, no anti-aliasing.' },
    { id: 'pixel-art-32bit',  name: '32-bit 픽셀아트',   cue: 'Detailed 32-bit pixel art, rich palette, soft shading, late-90s arcade / PS1 sprite era.' },
    { id: 'low-poly-3d',      name: '로우폴리 3D',       cue: 'Low-poly 3D render style: flat-shaded polygons, geometric forms, PS1/N64 era look, visible triangulation.' },
    { id: 'hand-drawn-2d',    name: '핸드드로우 2D',     cue: 'Hand-drawn 2D art: visible ink lines, watercolor-like fills, slight paper texture (Hollow Knight / Cuphead feel).' },
    { id: 'painterly-2d',     name: '페인터리 2D',        cue: 'Painterly digital 2D illustration: visible brushstrokes, rich atmospheric lighting (Ori / Gris feel).' },
    { id: 'flat-vector',      name: '플랫 벡터',          cue: 'Flat vector art: clean geometric shapes, bold outlines, limited gradients, modern mobile-game look.' },
    { id: 'cel-shaded',       name: '셀 셰이드 3D',      cue: 'Cel-shaded 3D: bold outlines, flat color zones, anime/comic book shading (Jet Set Radio / Borderlands feel).' },
    { id: 'neon-synthwave',   name: '네온 신스웨이브',   cue: 'Neon synthwave aesthetic: magenta/cyan glows, grid floors, CRT scanlines, retro-futuristic 80s vibe.' },
    { id: 'dark-gothic',      name: '다크 고딕',          cue: 'Dark gothic illustration: muted palette, heavy blacks, dramatic rim lighting, Bloodborne/Darkest Dungeon feel.' },
    { id: 'minimalist-geom',  name: '미니멀 기하',        cue: 'Minimalist geometric style: pure shapes, 2-3 color palette, negative space, Thomas Was Alone / Geometry Wars feel.' },
  ] as const

  const rotationIdx = (cycleNumber - 1) % STEAM_INDIE_GENRES.length
  const styleIdx = (cycleNumber - 1) % ART_STYLES.length
  const suggestedGenre = STEAM_INDIE_GENRES[rotationIdx]
  const suggestedStyle = ART_STYLES[styleIdx]

  const genreListStr = STEAM_INDIE_GENRES.map(g => `  - ${g.id}: ${g.name} — ${g.desc}`).join('\n')
  const styleListStr = ART_STYLES.map(s => `  - ${s.id}: ${s.name} — ${s.cue}`).join('\n')

  const indieDirective = `
═══════════════════════════════════════════════════════════
🎮 스팀 인디 장르 도전 — 다양성 + 완성도 우선
═══════════════════════════════════════════════════════════

**이번 사이클 추천 장르**: ${suggestedGenre.id} (${suggestedGenre.name})
  ${suggestedGenre.desc}

**이번 사이클 추천 아트 스타일**: ${suggestedStyle.id} (${suggestedStyle.name})
  ${suggestedStyle.cue}

### 장르 선택 규칙 (분석가·플래너):
- 아래 11개 스팀 인디 장르 중 하나만 선택할 것:
${genreListStr}
- **최근 3사이클에 제작한 장르는 피하기** — 포트폴리오 다양성 확보
- 추천과 다른 장르를 선택해도 되지만, 위 목록 외 장르는 금지
- 플래너는 기획서 YAML front-matter의 \`genre\` 필드에 **장르 id** 를 정확히 기입

### 아트 스타일 선택 규칙 (플래너):
- 아래 10개 스타일 중 하나만 선택할 것:
${styleListStr}
- 플래너는 기획서 YAML front-matter에 \`art-style\` 필드를 추가하고 **스타일 id**를 기입
- asset-requirements YAML 블록의 \`art-style\` 필드도 **동일한 id + 전체 cue 문장**으로 채울 것
- **모든 에셋은 이 스타일을 엄격히 따라야 함** — 스타일 혼재 절대 금지
- 예: \`pixel-art-16bit\`을 선택했다면 썸네일/배경/캐릭터/UI 모두 16-bit 픽셀아트

### 스팀 인디 수준 완성도 체크리스트:
- **핵심 루프가 재미있어야 함** — 처음 30초 안에 "한 판 더"를 유도
- **시작~플레이~게임오버~재시작** 전 구간 버그 없어야 함
- **UI 버튼 3방식 동작**: 마우스 / 터치 / 키보드 단축키 전부
- **에셋 일관성**: 캐릭터 기본/공격/피격 등 변형은 반드시 동일 인물로 보여야 함 (ref 이미지 필수)
- **아트 스타일 일관성**: 한 게임 안에 섞이지 말 것
═══════════════════════════════════════════════════════════
`
  console.log(`  🎮 추천 장르: ${suggestedGenre.name} / 아트: ${suggestedStyle.name}`)

  const state: CycleState = {
    cycleNumber,
    gameId:     '',
    gameTitle:  '',
    gameGenre:  [],
    difficulty: 'medium',
    status:     'analysis',
    startedAt,
  }

  // ── Checkpoint: mid-cycle resume after token exhaustion ──
  const existingCp = loadCheckpoint(cycleNumber)
  const checkpoint: CycleCheckpoint = initCheckpoint(cycleNumber, existingCp)
  if (existingCp) {
    console.log(`  🔖 [Checkpoint] 사이클 #${cycleNumber} 재개 (resume #${checkpoint.resumedCount}) — 완료 phase: [${existingCp.completedPhases.join(', ') || 'none'}]`)
  }
  const phaseDone = (p: PhaseName) => hasPhaseDone(checkpoint, p)
  const phaseMark = (p: PhaseName) => markPhaseDone(checkpoint, p)

  try {
    // ── 1단계: 분석 ──────────────────────────────────────────
    if (!phaseDone('analysis')) {
    console.log(`\n📊 [1/7] 분석가 — 플랫폼 현황 및 트렌드 분석`)
    state.status = 'analysis'
    startAgent('analyst', 1, '트렌드 분석', 'Trend Analysis')
    await runAgent('analyst', `
      현재 플랫폼(public/games/game-registry.json)을 분석하고,
      HTML5 게임 트렌드를 검색하여 다음 제작 게임을 추천해줘.
      결과를 docs/analytics/cycle-${cycleNumber}-report.md에 저장해줘.
      ⚠️ 영문(.en.md) 버전은 생성하지 마세요 — 한국어만 작성
      ${indieDirective}
      ${growthDirective}
      ${feedbackBlock}
      ⚠️ 이번 사이클은 스팀 인디 장르 목록 중 하나만 추천하세요. 최근 3사이클 제작 장르와 겹치지 않도록 game-registry.json 확인 후 선택.
      ${agentWisdomBlock('analyst', cycleNumber)}
    `)
    completeAgent('analyst')
    phaseMark('analysis')
    } else console.log(`\n⏭️ [1/7] 분석 — 체크포인트로 건너뜀`)

    // ── 2단계: 기획 ──────────────────────────────────────────
    if (!phaseDone('planning')) {
    console.log(`\n📋 [2/7] 플래너 — 게임 기획서 작성`)
    state.status = 'planning'
    startAgent('planner', 2, '게임 기획', 'Game Design')
    await runAgent('planner', `
      docs/analytics/cycle-${cycleNumber}-report.md를 읽고,
      제작할 게임의 상세 기획서를 docs/game-specs/cycle-${cycleNumber}-spec.md에 저장해줘.
      ⚠️ 영문(.en.md) 버전은 생성하지 마세요 — 한국어만 작성

      기획서 맨 위 YAML front-matter (반드시 아래 필드 모두 채울 것):
      ---
      game-id: [영문-소문자-하이픈]
      title: [한국어 제목]
      genre: [스팀 인디 장르 목록 중 id 하나]
      art-style: [ART_STYLES 목록 중 id 하나]
      difficulty: [easy/medium/hard]
      ---

      asset-requirements YAML 블록의 art-style 필드는 선택한 스타일의 **전체 cue 문장**으로 채울 것.
      (예: art-style: "Crisp 16-bit pixel art, limited palette, dithering, retro SNES/Genesis feel. Sharp pixels, no anti-aliasing.")

      ${indieDirective}
      ${growthDirective}
      ${feedbackBlock}
      ⚠️ 이전 포스트모템의 "다음 사이클 제안"과 "아쉬웠던 점"을 기획서에 명시적으로 반영할 것.
      ⚠️ 캐릭터 에셋이 여러 포즈(idle, attack, hurt 등)가 있다면 base 캐릭터를 먼저 정의하고 나머지는 반드시 ref 로 base를 참조할 것.
      ${agentWisdomBlock('planner', cycleNumber)}
    `)
    completeAgent('planner')
    phaseMark('planning')
    } else console.log(`\n⏭️ [2/7] 기획 — 체크포인트로 건너뜀`)

    // ── 3단계: 그래픽 에셋 제작 (Gemini PNG + Claude 아트 디렉션) ──
    // 3-A: 기획서에서 게임 정보 추출 — 항상 수행 (resume 시에도 필요)
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
      state.gameId = gameId
      state.gameTitle = gameTitle
      state.gameGenre = genre ? [genre] : []
    }

    if (!phaseDone('designing')) {
    console.log(`\n🎨 [3/7] 디자이너 — Gemini PNG 에셋 생성`)
    state.status = 'designing'
    startAgent('designer', 3, '그래픽 에셋 제작 (Gemini PNG)', 'Graphic Assets (Gemini PNG)')

    if (gameId) {
      const assetsDir = `${PROJECT_ROOT}/public/games/${gameId}/assets`

      // 3-B: 활성 provider(OpenAI / Gemini)로 PNG 에셋 생성
      if (isImageGenerationAvailable()) {
        const providerName = getImageProvider()?.name ?? 'image'
        console.log(`  🎨 PNG 생성 시작 via ${providerName} (game: ${gameId})`)
        try {
          const result = await generateGameAssets(gameId, gameTitle, genre, specContent, assetsDir)
          console.log(`  ✅ ${providerName} 생성 완료: ${result.generated.length}개 성공, ${result.failed.length}개 실패`)
          if (result.failed.length > 0) {
            console.log(`  ⚠️ 실패 에셋: ${result.failed.join(', ')}`)
          }
        } catch (err) {
          console.error(`  ❌ ${providerName} 에셋 생성 실패:`, err)
        }
      } else {
        console.log(`  ⚠️ 이미지 provider 없음 (OPENAI_API_KEY / GEMINI_API_KEY 미설정) — Claude 디자이너로 SVG 폴백`)
      }

      // 3-C: 디자이너 — 생성된 에셋 검증 + 누락 SVG 보완 + 일관성 체크
      await runAgent('designer', `
        📎 사용 가능한 스킬: asset-consistency (에셋 일관성 감사 절차).
           반드시 호출하여 체크리스트를 따를 것.

        docs/game-specs/cycle-${cycleNumber}-spec.md를 읽고,
        public/games/${gameId}/assets/ 폴더를 확인해줘.

        ⚠️ 이미지 provider(OpenAI/Gemini)가 PNG 에셋을 이미 생성했을 수 있습니다.

        ═══════════════════════════════════════════════════
        🎨 에셋 검증 체크리스트 (스팀 인디 수준)
        ═══════════════════════════════════════════════════

        1. ls로 assets/ 폴더 확인 — 실제 존재하는 파일 목록 파악
        2. **아트 스타일 일관성** (중요):
           - 기획서의 art-style을 읽고, 모든 PNG가 그 스타일을 따르는지 육안 검증
           - 스타일 혼재(픽셀아트 + 사실적 페인팅 등) 발견 시 리젠 필요 항목 보고
        3. **캐릭터 일관성**:
           - player / player-attack / player-hurt 등 같은 캐릭터 변형이 실제 같은 인물로 보이는가?
           - 색상, 실루엣, 의상이 동일한가?
           - 불일치 시 ref 재사용해서 리젠 필요한 에셋 리스트업
        4. **UI 의도대로 나왔는가**:
           - UI 아이콘이 의도한 주제를 표현하는가? (hp=빨간하트/방패 등)
           - 작은 크기(32px)에서도 식별 가능한가?
           - 텍스트가 포함된 에셋(썸네일 등)의 텍스트가 읽히는가?
        5. **누락 에셋 보완**:
           - 없는 에셋은 SVG로 보완 생성 (스타일 일치시킬 것)
           - thumbnail.png가 없으면 thumbnail.svg 생성 (400x300 viewBox)
        6. **manifest.json 갱신**:
           - 실제 존재하는 파일만 등록
           - format 필드는 주 포맷(png/svg) 기록
           - 각 에셋에 desc 포함

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
    phaseMark('designing')
    } else console.log(`\n⏭️ [3/7] 디자이너 — 체크포인트로 건너뜀`)

    // ── 4단계: 게임 코딩 ─────────────────────────────────────
    if (!phaseDone('coding')) {
    console.log(`\n💻 [4/7] 코더 — HTML5 게임 구현 (디자이너 에셋 활용)`)
    state.status = 'coding'
    startAgent('coder', 4, '게임 코딩', 'Game Coding')
    await runAgent('coder', `
      📎 사용 가능한 스킬: game-template (새 HTML 작성 시 이 템플릿 구조로 시작)

      docs/game-specs/cycle-${cycleNumber}-spec.md와
      public/games/[game-id]/assets/manifest.json을 읽고,
      public/games/[game-id]/index.html을 작성해줘.
      기획서의 game-id를 정확히 읽어 폴더명으로 사용할 것.
      ${growthDirective}
      ${feedbackBlock}

      ═══════════════════════════════════════════════════════════
      🛠️ IX Engine 필수 활용 (절대 지키지 않으면 NEEDS_MAJOR_FIX)
      ═══════════════════════════════════════════════════════════

      게임은 다음 IX Engine 모듈을 반드시 활용할 것. 재구현 금지.

      1. **GameFlow** — 표준 라이프사이클 (BOOT→TITLE→PLAY→GAMEOVER):
         \`\`\`
         IX.Scene.bind({ tween, particles });
         IX.GameFlow.init({
           titleText: '[게임 제목]',
           play: {
             enter: () => { /* 상태 초기화 + 버튼 생성 */ },
             update: (dt, input) => { /* 게임 로직 */ },
             render: (ctx, w, h) => { /* 렌더 */ },
           },
           onReset: () => { /* 모든 게임 변수 완전 초기화 */ },
         });
         IX.GameFlow.start();
         // 게임 오버 시: IX.GameFlow.gameOver({ score });
         \`\`\`
         ⛔ 자체 상태 머신(setState, TRANSITION_TABLE 등) 금지. 무조건 Scene 사용.

      2. **Button** — 모든 버튼은 반드시 IX.Button 사용:
         \`\`\`
         new IX.Button({
           x, y, w: 200, h: 60, text: '시작',
           key: ['Space', 'Enter'],  // 키보드 단축키 (필수 지정)
           onClick: () => IX.Scene.transition('PLAY'),
         });
         \`\`\`
         ⛔ 자체 hit-test + onclick 조합 금지. 모든 버튼 키보드 대응 강제.

      3. **Scene** — timer/listener는 반드시 Scene 스코프에 등록:
         \`\`\`
         IX.Scene.setTimeout(fn, ms);       // 전환 시 자동 clear
         IX.Scene.setInterval(fn, ms);      // 전환 시 자동 clear
         IX.Scene.on(window, 'resize', fn); // 전환 시 자동 remove
         \`\`\`
         ⛔ 맨 setTimeout/setInterval/addEventListener 금지. 누수 원인.

      4. **Input** — IX.Input 인스턴스 사용. 직접 이벤트 리스너 금지:
         - input.jp(code), input.held(code), input.confirm()
         - input.mouseX/Y, input.tapped, input.tapX/Y (게임 좌표로 자동 변환됨)
         - ⛔ 좌표에 dpr 곱하기 등 추가 변환 절대 금지

      5. **AssetLoader** — 타임아웃/폴백 보장:
         \`\`\`
         const loader = new IX.AssetLoader();
         const res = await loader.load({ player: 'assets/player.png', ... }, { timeoutMs: 10000 });
         // res.failed 리스트 확인, draw()는 자동으로 폴백 컬러 박스 렌더
         \`\`\`

      6. **Layout/MathUtil/Sound/Tween/Particles/Sprite/Save** — 모두 재사용 (재구현 금지)

      ═══════════════════════════════════════════════════════════
      ✅ 필수 구현 체크리스트
      ═══════════════════════════════════════════════════════════
      1. 시작 흐름: GameFlow.start() → TITLE에서 Space/Enter/Tap → PLAY 전환
      2. 모든 버튼 3방식 동작: 마우스 / 터치 / 키보드 단축키 (IX.Button.keys 필수)
      3. 재시작 완벽: onReset에서 **모든** 전역 변수 초기화 (점수·적·타이머·플래그 빠짐없이)
      4. GAMEOVER → RESTART 키(R/Space/Enter)로 재진입 시 정상 동작
      5. Canvas: Engine 내장 resize/dpr 사용. 직접 resize 금지
      6. 외부 CDN 금지: 시스템 폰트만 사용
      7. 에셋 로드 실패 시 폴백 렌더로 진행 (무한 로딩 금지)
      8. **아트 스타일 존중**: manifest.json의 art-style을 읽고, Canvas 배경/UI 컬러도 그 스타일과 맞출 것

      ═══════════════════════════════════════════════════════════
      🔄 공통 엔진 승격 의무 (Engine Promotion)
      ═══════════════════════════════════════════════════════════
      게임 작성 중 다음을 발견하면 **해당 코드를 public/engine/ix-engine.js 또는 engine/genres/[genre].js로 이동하고** 게임에서는 엔진을 호출하는 방식으로 바꿀 것:
      - 2개 이상 게임에서 반복되는 헬퍼 함수
      - 장르 공통 메커니즘 (예: 오토 배틀러의 레인 배치, 로그라이크의 던전 생성)
      - 범용 UI 위젯 (대화 상자, 인벤토리 그리드, HP바 레이어 등)
      작업 보고서 맨 끝에 "엔진 승격 내역: [없음 또는 이동한 함수/모듈 목록]" 을 반드시 기록할 것.

      ${agentWisdomBlock('coder', cycleNumber)}
    `)
    completeAgent('coder')
    phaseMark('coding')
    } else console.log(`\n⏭️ [4/7] 코더 — 체크포인트로 건너뜀`)

    // ── 5단계: 리뷰 + 테스트 (최대 3회 반복) ──────────────────
    if (!phaseDone('review_1st')) {
    const MAX_REVIEW_ROUNDS = 3
    for (let round = 1; round <= MAX_REVIEW_ROUNDS; round++) {
      const isRetry = round > 1
      console.log(`\n🔍 [5/7] 리뷰어 — 코드 검토 & 브라우저 테스트 (${round}/${MAX_REVIEW_ROUNDS}회차)`)
      state.status = 'reviewing'
      startAgent('reviewer', 5, `코드 리뷰 + 테스트 (${round}회차)`, `Code Review + Test (round ${round})`)
      const reviewResult = await runAgent('reviewer', `
        📎 사용 가능한 스킬: button-audit (버튼 3방식 동작 감사), restart-verify (재시작 누수 검증), asset-consistency (에셋 일관성).
           각 스킬을 해당 검증 항목 수행 시 반드시 활용할 것.

        docs/game-specs/cycle-${cycleNumber}-spec.md에서 game-id를 확인하고,
        public/games/[game-id]/index.html을 코드 리뷰 및 브라우저 테스트해줘.
        에셋 로딩(assets/manifest.json 및 에셋 파일들) 여부도 확인할 것.
        ${isRetry ? `⚠️ 이번은 ${round}회차 재리뷰입니다. 이전 리뷰(docs/reviews/cycle-${cycleNumber}-review.md)에서 지적한 사항이 실제로 수정되었는지 중점 검증해줘.` : ''}

        ═══════════════════════════════════════════════════
        🎮 스팀 인디 수준 완성도 검증
        ═══════════════════════════════════════════════════
        아래 항목별 PASS/FAIL 을 명시. 하나라도 FAIL이면 NEEDS_MAJOR_FIX.

        📌 A. IX Engine 준수
        A-1. IX.GameFlow / IX.Scene / IX.Button 사용하는가?
             ⛔ 자체 state machine / 자체 hit-test 버튼 발견 시 FAIL.
        A-2. setTimeout/setInterval/addEventListener를 직접 쓰지 않고
             IX.Scene.setTimeout / setInterval / on 을 쓰는가?
        A-3. manifest.json의 art-style 값을 실제로 Canvas 렌더(배경색·UI톤)에 반영하는가?

        📌 B. 버튼 3방식 동작 (가장 중요)
        - 모든 IX.Button 인스턴스를 grep으로 찾아 리스트업
        - 각 버튼마다:
          B-1. 마우스 클릭 가능한 위치에 렌더되는가? (hitTest 영역)
          B-2. 터치 가능한 크기인가? (min 44px)
          B-3. 키보드 단축키(key) 가 지정되어 있는가?
          B-4. onClick 콜백이 실제로 state를 바꾸는가?
        ⛔ 위 4개 중 하나라도 빠진 버튼이 있으면 NEEDS_MAJOR_FIX.

        📌 C. 재시작 3회 연속 검증 (가장 중요)
        - onReset 콜백이 다음을 **전부** 초기화하는지 grep으로 확인:
          C-1. 모든 전역 게임 변수 (점수·HP·시간·레벨·웨이브·콤보·플래그)
          C-2. 모든 배열/맵 (적 목록·투사체·파티클·퀘스트 목록)
          C-3. 트윈/파티클(Scene.cleanup에서 자동)
        - 시뮬레이션: TITLE → PLAY → GAMEOVER → PLAY → GAMEOVER → PLAY (3회)
          가 변수 누수 없이 반복 가능한 코드 흐름인가?
        - onReset에 누락된 변수가 하나라도 있으면 FAIL.

        📌 D. 스팀 인디 수준 플레이 완성도
        D-1. 핵심 루프(입력→상태변화→피드백)가 30초 내에 재미 전달?
        D-2. 승리/패배 조건 명확?
        D-3. 점수/진행도 시각 피드백 있는가?
        D-4. 사운드 이펙트 연결됨? (IX.Sound.sfx)
        D-5. 파티클/트윈 연출 있음?

        📌 E. 스크린 전환 + Stuck 방어
        E-1. BOOT에서 에셋 로드 10초 타임아웃 시 TITLE로 자동 진행되는가?
        E-2. StateGuard 가 기본 활성화(GameFlow.init)되어 있는가?
        E-3. TITLE/GAMEOVER에서 어떤 입력이든 PLAY로 전환 가능?
        E-4. PLAY 중 정상 입력으로 GAMEOVER 도달 가능?

        📌 F. 입력 시스템
        F-1. IX.Input 을 그대로 사용. 자체 touch/mouse 이벤트 리스너 없음.
        F-2. 게임 좌표 변환은 engine 내장(mouseX/Y, tapX/Y)만 사용.

        📌 G. 에셋 일관성
        G-1. manifest.json 의 art-style 확인 — 썸네일·캐릭터·UI가 한 스타일인가?
        G-2. 캐릭터 변형(attack/hurt 등)이 base와 같은 인물로 보이는가?

        ═══════════════════════════════════════════════════
        판정 기준:
        - APPROVED: A~G 모두 PASS
        - NEEDS_MINOR_FIX: 핵심(A/B/C/E) PASS + D/F/G 중 일부 미흡
        - NEEDS_MAJOR_FIX: A/B/C/E 중 하나라도 FAIL

        결과를 docs/reviews/cycle-${cycleNumber}-review.md에 저장해줘.
        ⚠️ 영문(.en.md) 버전은 생성하지 마세요 — 한국어만 작성
        YAML front-matter에 verdict: [판정] 과 버튼별 PASS/FAIL 리스트를 반드시 포함.
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
    phaseMark('review_1st')
    } else console.log(`\n⏭️ [5/7] 1차 리뷰 — 체크포인트로 건너뜀`)

    // ── 5.5단계: 플래너·디자이너 재검토 → 코더 개선 → 2차 리뷰 ──
    if (!phaseDone('review_2nd')) {
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
    phaseMark('review_2nd')
    } else console.log(`\n⏭️ [5.5/7] 2차 리뷰 — 체크포인트로 건너뜀`)

    // ── 5.8단계: 엔진 승격 ──────────────────────────────────────
    if (!phaseDone('engine_promote')) {
    // 방금 만든 게임 코드를 읽고, 다른 게임에서도 재사용할 만한 공통 패턴을
    // public/engine/ix-engine.js 또는 engine/genres/[genre].js 로 이동시키는 단계.
    console.log(`\n🔧 [5.8/7] 엔진 승격 — 재사용 가능한 코드를 공통 엔진으로 이동`)
    startAgent('coder', 5, '엔진 승격 스윕', 'Engine Promotion Sweep')
    await runAgent('coder', `
      📎 사용 가능한 스킬: engine-promote (승격 절차 표준).
         이 스킬의 6단계 절차를 그대로 따라 실행할 것.

      작업 목적: 방금 완성된 게임의 중복 가능한 로직을 공통 엔진으로 이동하여,
      다음 사이클 이후 모든 게임이 이 기능을 공유하게 만드는 것.

      단계:
      1. 기획서(docs/game-specs/cycle-${cycleNumber}-spec.md)에서 game-id 확인
      2. public/games/[game-id]/index.html 의 <script> 본문 읽기
      3. public/engine/ix-engine.js 및 public/engine/genres/*.js 현재 상태 읽기
      4. 아래 기준 중 하나라도 해당하는 함수/객체를 **승격 후보**로 식별:
         - 이름이 일반적이고 다른 장르에서도 쓰일 수 있는 헬퍼 (예: easeOutBack, lerp2, rectCollideCircle)
         - 현재 장르에 특화되지만 장르 모듈에 없던 패턴 (예: 로그라이크의 상자 루트 테이블)
         - 게임 상태 외부에 상태를 갖지 않는 순수 함수
      5. 후보 중 **실제로 가치가 명확한 것만** (확신이 없으면 승격하지 말 것):
         - 범용이면 → public/engine/ix-engine.js 의 알맞은 객체(UI, MathUtil, Layout 등)에 메서드 추가
         - 장르 특화면 → public/engine/genres/<장르id>.js 에 추가 (없으면 새 파일 생성하고 IX.Genre.<이름>에 등록)
      6. 게임 index.html 에서는 승격된 함수 호출을 IX 또는 IX.Genre 경로로 바꿀 것
      7. 작업 후 보고:
         - docs/engine-notes/cycle-${cycleNumber}-promotion.md 파일에 승격 내역 기록
         - 형식: ## 승격 / ## 보류(이유) / ## 향후 후보
         - 승격 없으면 "이번 사이클 승격 없음. 이유: [...]" 라고 짧게.

      ⚠️ 엔진 구조 변경은 하위 호환을 깨지 말 것. 새 메서드 추가만 허용.
      ⚠️ 불확실한 승격은 docs/engine-notes에 "향후 후보"로만 기록하고 이동하지 말 것.
      ⚠️ 엔진 파일 수정 후 node -e "require(...)" 같은 것으로 파싱 가능 여부 최종 확인.
    `)
    completeAgent('coder')
    phaseMark('engine_promote')
    } else console.log(`\n⏭️ [5.8/7] 엔진 승격 — 체크포인트로 건너뜀`)

    // ── 6단계: 포스트모템 ──────────────────────────────────────
    if (!phaseDone('postmortem')) {
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
    phaseMark('postmortem')
    } else console.log(`\n⏭️ [6/7] 포스트모템 — 체크포인트로 건너뜀`)

    // ── 6.5단계: Self-Evolution (메트릭 수집 + Evolver + Apply + Dashboard) ──
    // 매 사이클마다 4-discipline 메트릭 수집 → Evolver가 제안 → LOW+MEDIUM 자동 적용
    if (!phaseDone('self_evolution') && process.env.EVOLVER_ENABLED !== '0') {
      console.log(`\n🧠 [6.5/7] Self-Evolution — 메트릭 수집 + 자가진화`)
      try {
        const { collectCycleMetrics, saveCycleMetrics } = await import('./metrics.js')
        const { runEvolver } = await import('./evolver.js')
        const { applyProposals } = await import('./apply-proposal.js')
        const { saveDashboard } = await import('./dashboard.js')

        const durationMin = Math.round((Date.now() - new Date(startedAt).getTime()) / 60000)

        // Extract review2Rounds & planner rework count loosely — these default to 1
        const metrics = collectCycleMetrics({
          cycle: cycleNumber,
          gameId: state.gameId,
          durationMin,
          assetStats: { requested: 0, generated: 0, failed: 0, verifyFailed: 0 },
          plannerReworkCount: 1,
          deployVerifyPass: null,
        })
        saveCycleMetrics(metrics)
        console.log(`  📊 Metrics: overall=${metrics.overallScore.toFixed(1)} | P=${metrics.disciplines.planning.score.toFixed(0)} D=${metrics.disciplines.development.score.toFixed(0)} A=${metrics.disciplines.art.score.toFixed(0)} Q=${metrics.disciplines.qa.score.toFixed(0)} | weakest=${metrics.weakestDiscipline}`)

        // Regenerate dashboard (cheap)
        saveDashboard()

        // Run evolver every N cycles (default 1 = every cycle).
        const period = parseInt(process.env.EVOLVER_PERIOD ?? '1', 10)
        if (cycleNumber >= period && cycleNumber % period === 0) {
          console.log(`  🧬 [Evolver] 발동 (사이클 ${cycleNumber}, 주기 ${period})`)
          const produced = await runEvolver(cycleNumber)
          if (produced) {
            const proposalPath = `${PROJECT_ROOT}/docs/evolution/proposal-cycle-${cycleNumber}.md`
            const applyResult = await applyProposals(proposalPath, cycleNumber)
            console.log(`  🔧 [Apply] 적용 ${applyResult.applied.length} / 보류 ${applyResult.deferred.length} / 실패 ${applyResult.failed.length}`)
          }
          // Dashboard를 evolver 이후 한 번 더 (proposal 통계 반영)
          saveDashboard()
        } else {
          const remaining = period - (cycleNumber % period)
          console.log(`  ⏳ Evolver 대기 — ${remaining} 사이클 후 발동`)
        }
      } catch (err) {
        console.error(`  ⚠️ Self-Evolution 실패 (비치명):`, (err as Error).message)
      }
      phaseMark('self_evolution')
    } else if (phaseDone('self_evolution')) {
      console.log(`\n⏭️ [6.5/7] Self-Evolution — 체크포인트로 건너뜀`)
    }

    // ── 7단계: 배포 ──────────────────────────────────────────
    if (!phaseDone('deploy')) {
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
          // PNG 썸네일이 없으면 에셋 기반으로 활성 provider로 생성 시도
          if (isImageGenerationAvailable()) {
            console.log(`  🖼️ [검증] thumbnail.png 없음 — 에셋 기반 생성 시도 (${getImageProvider()?.name})`)
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
    phaseMark('deploy')
    } else console.log(`\n⏭️ [7/7] 배포 — 체크포인트로 건너뜀`)

    // 사이클 완료 — checkpoint 삭제
    clearCheckpoint(cycleNumber)
    state.status      = 'completed'
    state.completedAt = new Date().toISOString()
    completeCycle(state.gameTitle, state.gameId)

  } catch (err) {
    state.status = 'failed'
    state.error  = String(err)
    failCycle(String(err))
    console.error(`\n❌ 사이클 오류:`, err)
    console.error(`  🔖 체크포인트 유지 — 다음 실행 시 완료된 phase 건너뛰고 재개: [${checkpoint.completedPhases.join(', ')}]`)
  }

  const summary = `# 사이클 #${cycleNumber} 완료\n- 시작: ${state.startedAt}\n- 완료: ${state.completedAt}\n- 상태: ${state.status}\n`
  writeFileSync(`${PROJECT_ROOT}/logs/cycle-${cycleNumber}-summary.md`, summary)

  console.log(`\n✅ 사이클 #${cycleNumber} 완료!\n`)
  return state
}
