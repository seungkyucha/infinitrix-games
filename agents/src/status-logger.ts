import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname   = dirname(fileURLToPath(import.meta.url))
const LOGS_DIR    = resolve(__dirname, '..', '..', 'logs')
const STATUS_FILE = resolve(LOGS_DIR, 'agent-status.json')

// Vercel HTTP Push 설정
const VERCEL_URL   = process.env.VERCEL_APP_URL   // e.g. https://infinitrix-games.vercel.app
const WRITE_SECRET = process.env.STATUS_WRITE_SECRET

export type AgentId     = 'analyst' | 'planner' | 'designer' | 'coder' | 'reviewer' | 'postmortem' | 'deployer'
export type AgentStatus = 'idle' | 'running' | 'completed' | 'error'
export type CycleStatus = 'idle' | 'running' | 'completed' | 'error'

export interface AgentState {
  status:          AgentStatus
  currentAction:   string
  currentActionEn: string
  startedAt:       string | null
  completedAt:     string | null
  toolCalls:       number
  logs:            string[]
  logsEn:          string[]
}

export interface StatusData {
  lastUpdated:    string
  cycleNumber:    number
  cycleStatus:    CycleStatus
  currentStep:    number
  totalSteps:     7
  stepName:       string
  stepNameEn:     string
  gameTitle:      string
  gameId:         string
  gameGenre:      string[]
  agents:         Record<AgentId, AgentState>
  recentLogs:     string[]
  recentLogsEn:   string[]
}

// ── Vercel Blob HTTP Push (fire-and-forget) ──────────────────────────────────

function pushToVercel(data: StatusData): void {
  if (!VERCEL_URL || !WRITE_SECRET) return
  const body = JSON.stringify(data)
  fetch(`${VERCEL_URL}/api/agent-status`, {
    method:  'POST',
    headers: { 'content-type': 'application/json', 'x-write-secret': WRITE_SECRET },
    body,
  }).catch(() => { /* fire-and-forget */ })
}

// ── 기본값 ─────────────────────────────────────────────────────────────────

function defaultAgent(): AgentState {
  return { status: 'idle', currentAction: '', currentActionEn: '', startedAt: null, completedAt: null, toolCalls: 0, logs: [], logsEn: [] }
}

export function defaultStatus(): StatusData {
  return {
    lastUpdated: new Date().toISOString(),
    cycleNumber: 0,
    cycleStatus: 'idle',
    currentStep: 0,
    totalSteps:  7,
    stepName:    '',
    gameTitle:   '',
    gameId:      '',
    gameGenre:   [],
    agents: {
      analyst:    defaultAgent(),
      planner:    defaultAgent(),
      designer:   defaultAgent(),
      coder:      defaultAgent(),
      reviewer:   defaultAgent(),
      postmortem: defaultAgent(),
      deployer:   defaultAgent(),
    },
    recentLogs: [],
    stepNameEn: '',
    recentLogsEn: [],
  }
}

// ── 파일 I/O ────────────────────────────────────────────────────────────────

function read(): StatusData {
  try {
    if (existsSync(STATUS_FILE)) return JSON.parse(readFileSync(STATUS_FILE, 'utf-8'))
  } catch {}
  return defaultStatus()
}

function write(data: StatusData): void {
  if (!existsSync(LOGS_DIR)) mkdirSync(LOGS_DIR, { recursive: true })
  data.lastUpdated = new Date().toISOString()
  writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  pushToVercel(data)
}

function ts(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

function addLog(data: StatusData, msg: string, msgEn?: string): void {
  data.recentLogs   = [`${ts()} ${msg}`, ...data.recentLogs].slice(0, 60)
  data.recentLogsEn = [`${ts()} ${msgEn ?? msg}`, ...(data.recentLogsEn ?? [])].slice(0, 60)
}

// ── 공개 API ────────────────────────────────────────────────────────────────

/** 사이클 시작 — 전체 상태 초기화 */
export function startCycle(cycleNumber: number): void {
  const data = defaultStatus()
  data.cycleNumber = cycleNumber
  data.cycleStatus = 'running'
  addLog(data, `[CYCLE] #${cycleNumber} 시작`, `[CYCLE] #${cycleNumber} Started`)
  write(data)
}

/** 사이클 정상 완료 */
export function completeCycle(gameTitle: string, gameId: string): void {
  const data = read()
  data.cycleStatus = 'completed'
  data.gameTitle   = gameTitle || data.gameTitle
  data.gameId      = gameId   || data.gameId
  addLog(data, `[CYCLE] 완료 — ${gameTitle} (${gameId})`, `[CYCLE] Completed — ${gameTitle} (${gameId})`)
  write(data)
}

/** 사이클 오류 종료 */
export function failCycle(error: string): void {
  const data = read()
  data.cycleStatus = 'error'
  addLog(data, `[ERROR] ${error.slice(0, 120)}`, `[ERROR] ${error.slice(0, 120)}`)
  write(data)
}

/** 에이전트 단계 시작 */
export function startAgent(agentId: AgentId, step: number, stepName: string, stepNameEn?: string): void {
  const data = read()
  data.currentStep = step
  data.stepName    = stepName
  data.stepNameEn  = stepNameEn ?? stepName
  data.agents[agentId] = {
    status: 'running',
    currentAction: '작업 준비 중...',
    currentActionEn: 'Preparing...',
    startedAt: new Date().toISOString(),
    completedAt: null,
    toolCalls: 0,
    logs: [],
    logsEn: [],
  }
  addLog(data, `[${agentId.toUpperCase()}] 시작 (${step}/7 ${stepName})`, `[${agentId.toUpperCase()}] Started (${step}/7 ${stepNameEn ?? stepName})`)
  write(data)
}

/** 에이전트 단계 완료 */
export function completeAgent(agentId: AgentId): void {
  const data = read()
  const a = data.agents[agentId]
  a.status          = 'completed'
  a.completedAt     = new Date().toISOString()
  a.currentAction   = '✓ 완료'
  a.currentActionEn = '✓ Completed'
  addLog(data, `[${agentId.toUpperCase()}] 완료 (${a.toolCalls}회 툴 사용)`, `[${agentId.toUpperCase()}] Completed (${a.toolCalls} tool calls)`)
  write(data)
}

/** 에이전트 오류 */
export function failAgent(agentId: AgentId, error: string): void {
  const data = read()
  data.agents[agentId].status          = 'error'
  data.agents[agentId].currentAction   = `오류: ${error.slice(0, 100)}`
  data.agents[agentId].currentActionEn = `Error: ${error.slice(0, 100)}`
  addLog(data, `[${agentId.toUpperCase()}] 오류: ${error.slice(0, 100)}`, `[${agentId.toUpperCase()}] Error: ${error.slice(0, 100)}`)
  write(data)
}

// ── 사람이 읽기 쉬운 액션 설명 ───────────────────────────────────────────────

function humanizeAction(agentId: AgentId, toolName: string, detail: string): string {
  let inp: Record<string, string> = {}
  try { inp = JSON.parse(detail) } catch {}

  const filePath  = (inp['file_path'] ?? inp['path'] ?? '').replace(/\\/g, '/')
  const query     = inp['query'] ?? inp['search_query'] ?? inp['pattern'] ?? ''
  const cmd       = inp['command'] ?? ''
  const url       = inp['url'] ?? ''
  const content   = inp['content'] ?? inp['new_string'] ?? ''
  const fname     = filePath.split('/').pop() ?? ''

  /** content에서 키워드 기반 컨텍스트 추출 */
  function detectContext(text: string): string {
    const t = text.toLowerCase()
    if (t.match(/gameloop|game.?loop|requestanimation/))     return '게임 루프 (메인 업데이트 사이클)'
    if (t.match(/collision|충돌|hitbox|intersect/))           return '충돌 감지 시스템'
    if (t.match(/touchstart|touchmove|touchend|touch.?event/)) return '모바일 터치 입력 처리'
    if (t.match(/joystick|가상.?패드|virtual.?pad/))          return '가상 조이스틱 UI'
    if (t.match(/keydown|keyup|keyboard|키보드/))             return '키보드 입력 처리'
    if (t.match(/mouse|click|pointer/))                      return '마우스/포인터 입력 처리'
    if (t.match(/canvas|ctx\.|drawimage|fillrect/))          return 'Canvas 렌더링 시스템'
    if (t.match(/particle|파티클|effect|이펙트/))              return '파티클/이펙트 시스템'
    if (t.match(/score|점수|combo|콤보/))                     return '스코어/콤보 시스템'
    if (t.match(/level|wave|스테이지|웨이브|난이도/))           return '레벨/웨이브 진행 시스템'
    if (t.match(/spawn|생성|enemy.?pool|적.?생성/))           return '적/오브젝트 스폰 시스템'
    if (t.match(/powerup|파워업|buff|아이템/))                return '파워업/아이템 시스템'
    if (t.match(/audio|sound|bgm|효과음/))                   return '사운드/오디오 시스템'
    if (t.match(/preload|loadimage|fetch.*svg|에셋.?로드/))   return '에셋 프리로딩'
    if (t.match(/ui|hud|health|hp|생명|체력/))               return 'UI/HUD 표시 시스템'
    if (t.match(/gameover|game.?over|게임.?오버|restart/))    return '게임오버/재시작 처리'
    if (t.match(/menu|메뉴|title.?screen|시작.?화면/))        return '메뉴/타이틀 화면'
    if (t.match(/animation|animate|tween|애니메이션/))        return '애니메이션 시스템'
    if (t.match(/physics|gravity|중력|velocity|가속/))        return '물리/이동 시스템'
    if (t.match(/path|경로|grid|타일|map|맵/))               return '맵/타일 시스템'
    if (t.match(/tower|타워|building|건물|설치/))             return '타워/건물 배치 시스템'
    if (t.match(/viewport|meta.*viewport|resize/))           return '뷰포트/반응형 설정'
    return ''
  }

  switch (agentId) {

    // ── 분석가 ──────────────────────────────────────────────────────────────
    case 'analyst': {
      if (toolName === 'WebSearch') {
        if (!query) return '모바일 게임 트렌드 검색 중'
        const q = query.slice(0, 40)
        return `웹 검색: "${q}"`
      }
      if (toolName === 'WebFetch') {
        try {
          const host = new URL(url).hostname.replace('www.', '')
          return `${host} 페이지 분석 중`
        } catch { return '트렌드 데이터 페이지 분석 중' }
      }
      if (toolName === 'Read') {
        if (filePath.includes('registry'))  return '기존 게임 목록 검토 — 중복 장르 확인 중'
        if (filePath.includes('wisdom'))    return '누적 플랫폼 지혜 검토 — 피해야 할 패턴 확인 중'
        if (filePath.includes('postmortem')) return '이전 사이클 회고 분석 — 실패 원인 파악 중'
        if (filePath.includes('report'))    return '이전 분석 보고서 참고 중'
        return `파일 분석 중 (${fname})`
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        if (filePath.includes('report'))    return '트렌드 분석 보고서 작성 — 추천 장르/메카닉 정리 중'
        return '시장 조사 결과 문서화 중'
      }
      if (toolName === 'Grep' || toolName === 'Glob') return '기존 게임 데이터 검색 중'
      return '모바일 게임 시장 트렌드 분석 중'
    }

    // ── 플래너 ──────────────────────────────────────────────────────────────
    case 'planner': {
      if (toolName === 'WebSearch') {
        const q = query.slice(0, 40)
        return q ? `레퍼런스 검색: "${q}"` : '레퍼런스 게임 조사 중'
      }
      if (toolName === 'WebFetch') {
        try {
          const host = new URL(url).hostname.replace('www.', '')
          return `${host} — 레퍼런스 게임 분석 중`
        } catch { return '레퍼런스 게임 페이지 분석 중' }
      }
      if (toolName === 'Read') {
        if (filePath.includes('report'))    return '트렌드 분석 보고서 숙독 — 추천 장르 확인 중'
        if (filePath.includes('spec'))      return `기존 기획서 참고 중 (${fname})`
        if (filePath.includes('wisdom'))    return '플랫폼 지혜 검토 — 성공/실패 패턴 확인 중'
        if (filePath.includes('registry'))  return '기존 게임 목록 확인 — 차별화 포인트 도출 중'
        if (filePath.includes('postmortem')) return '이전 회고 확인 — 개선 요청사항 반영 중'
        return `참고 문서 확인 중 (${fname})`
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        if (filePath.includes('spec')) {
          const ctx = detectContext(content)
          if (ctx) return `기획서 작성 중 — ${ctx} 설계`
          // content 키워드로 어떤 섹션을 쓰고 있는지
          const c = content.toLowerCase()
          if (c.match(/조작|control|input|터치/))    return '기획서 작성 중 — 조작법/입력 설계'
          if (c.match(/rule|규칙|mechanic|메카닉/))  return '기획서 작성 중 — 핵심 게임 규칙 정의'
          if (c.match(/visual|시각|color|팔레트/))   return '기획서 작성 중 — 비주얼 스타일 정의'
          if (c.match(/level|stage|난이도|밸런스/))   return '기획서 작성 중 — 레벨/난이도 밸런스 설계'
          if (c.match(/ui|hud|interface|화면/))      return '기획서 작성 중 — UI/화면 레이아웃 설계'
          if (c.match(/score|점수|reward|보상/))     return '기획서 작성 중 — 점수/보상 시스템 설계'
          return '게임 기획서(GDD) 작성 중'
        }
        return '게임 상세 기획서 작성 중'
      }
      return '게임 컨셉 및 메카닉 기획 중'
    }

    // ── 디자이너 ────────────────────────────────────────────────────────────
    case 'designer': {
      if (toolName === 'Read') {
        if (filePath.includes('spec'))     return '기획서 확인 — 캐릭터/배경/UI 사양 파악 중'
        if (filePath.includes('manifest')) return '에셋 목록 검토 — 제작 완료 현황 확인 중'
        return `디자인 참고 문서 확인 중 (${fname})`
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        // SVG 내용에서 어떤 요소를 그리는지 추출
        const svgCtx = content.match(/gradient|circle|rect|path|polygon|text|filter|ellipse/)
        const shapeHint = svgCtx ? ` — ${svgCtx[0]} 요소 렌더링` : ''

        if (filePath.includes('thumbnail'))   return `플랫폼 썸네일 제작 중${shapeHint}`
        if (filePath.includes('player'))      return `플레이어 캐릭터 디자인 중${shapeHint}`
        if (filePath.includes('enemy'))       return `적 캐릭터 디자인 중${shapeHint}`
        if (filePath.includes('boss'))        return `보스 캐릭터 제작 중${shapeHint}`
        if (filePath.includes('bg-layer'))    return `배경 레이어 제작 중 (${fname})${shapeHint}`
        if (filePath.includes('powerup'))     return `파워업 아이템 아이콘 제작 중${shapeHint}`
        if (filePath.includes('effect'))      return `이펙트 SVG 제작 중 (${fname})${shapeHint}`
        if (filePath.includes('ui-heart'))    return '체력(하트) UI 아이콘 제작 중'
        if (filePath.includes('ui-star'))     return '별/점수 UI 아이콘 제작 중'
        if (filePath.includes('ui-'))         return `UI 컴포넌트 제작 중 (${fname})`
        if (filePath.includes('tile'))        return `타일맵 에셋 제작 중 (${fname})`
        if (filePath.includes('obstacle'))    return `장애물 오브젝트 제작 중 (${fname})`
        if (filePath.includes('manifest'))    return '에셋 매니페스트 작성 — 전체 파일 목록 정리 중'
        if (filePath.endsWith('.svg'))        return `SVG 에셋 제작 중 (${fname})${shapeHint}`
        return `그래픽 에셋 제작 중 (${fname})`
      }
      if (toolName === 'Bash') {
        if (cmd.includes('ls') || cmd.includes('dir'))   return '에셋 디렉토리 구조 확인 중'
        if (cmd.includes('mkdir'))                        return '에셋 폴더 구조 생성 중'
        return '에셋 파일 관리 작업 중'
      }
      return '게임 비주얼 에셋 디자인 중'
    }

    // ── 코더 ────────────────────────────────────────────────────────────────
    case 'coder': {
      if (toolName === 'Read') {
        if (filePath.includes('manifest'))   return '에셋 매니페스트 확인 — 사용 가능 리소스 파악 중'
        if (filePath.includes('spec'))       return '게임 기획서 정독 — 구현 사양 확인 중'
        if (filePath.includes('review'))     return '리뷰 피드백 확인 — 수정 필요 항목 파악 중'
        if (filePath.endsWith('.html'))      return `게임 코드 분석 중 (${fname})`
        if (filePath.endsWith('.svg'))       return `SVG 에셋 구조 확인 중 (${fname})`
        return `참고 파일 확인 중 (${fname})`
      }
      if (toolName === 'Write') {
        if (filePath.includes('index.html')) {
          const ctx = detectContext(content)
          return ctx ? `게임 코드 작성 중 — ${ctx}` : '게임 메인 HTML5 파일 작성 중'
        }
        if (filePath.endsWith('.js'))  return `JS 모듈 작성 중 (${fname})`
        if (filePath.endsWith('.css')) return `스타일시트 작성 중 (${fname})`
        return `게임 파일 작성 중 (${fname})`
      }
      if (toolName === 'Edit') {
        if (filePath.includes('index.html')) {
          const ctx = detectContext(content)
          return ctx ? `코드 수정 중 — ${ctx}` : '게임 코드 수정 중'
        }
        if (filePath.endsWith('.js'))  return `JS 모듈 수정 중 (${fname})`
        return `코드 수정 중 (${fname})`
      }
      if (toolName === 'Bash') {
        if (cmd.includes('puppeteer') || cmd.includes('node'))  return '게임 동작 자동화 테스트 실행 중'
        if (cmd.includes('ls') || cmd.includes('dir'))          return '게임 파일 구조 확인 중'
        if (cmd.includes('mkdir'))                              return '게임 디렉토리 구조 생성 중'
        return '게임 빌드/환경 설정 중'
      }
      if (toolName === 'Grep') return `코드 패턴 검색 중: "${query.slice(0, 30)}"`
      if (toolName === 'Glob') return `파일 검색 중: ${query.slice(0, 30)}`
      return '게임 로직 구현 중'
    }

    // ── 리뷰어 ──────────────────────────────────────────────────────────────
    case 'reviewer': {
      if (toolName === 'Read') {
        if (filePath.includes('index.html')) return '게임 소스코드 정밀 리뷰 중 — 로직/성능/보안 검증'
        if (filePath.endsWith('.js'))        return `JS 코드 품질 검토 중 (${fname})`
        if (filePath.includes('spec'))       return '기획서 대비 구현 완성도 검증 — 누락 기능 확인 중'
        if (filePath.includes('manifest'))   return 'SVG 에셋 누락 여부 체크 중'
        if (filePath.includes('review'))     return '이전 리뷰 피드백 확인 — 수정 여부 재검증 중'
        if (filePath.endsWith('.svg'))       return `에셋 파일 검증 중 (${fname})`
        return `파일 리뷰 중 (${fname})`
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        if (filePath.includes('review')) {
          const c = content.toLowerCase()
          if (c.match(/approved/i))        return '리뷰 보고서 작성 중 — 판정: APPROVED'
          if (c.match(/needs_major_fix/i)) return '리뷰 보고서 작성 중 — 판정: NEEDS_MAJOR_FIX'
          if (c.match(/needs_minor_fix/i)) return '리뷰 보고서 작성 중 — 판정: NEEDS_MINOR_FIX'
          if (c.match(/touch|터치|모바일|mobile/)) return '리뷰 보고서 작성 중 — 모바일 대응 검사 결과 정리'
          if (c.match(/bug|버그|error|오류/))      return '리뷰 보고서 작성 중 — 버그/오류 목록 정리'
          if (c.match(/performance|성능|memory|메모리/)) return '리뷰 보고서 작성 중 — 성능 이슈 정리'
          return '코드 리뷰 보고서 작성 중'
        }
        return 'QA 결과 보고서 문서화 중'
      }
      if (toolName === 'Bash') {
        if (cmd.includes('puppeteer'))   return '헤드리스 브라우저로 게임 자동 실행 테스트 중'
        if (cmd.includes('node'))        return '게임 로직 유닛 테스트 실행 중'
        if (cmd.includes('grep') || cmd.includes('findstr')) {
          if (cmd.match(/touch|mobile/i))  return '모바일 터치 이벤트 구현 여부 검사 중'
          if (cmd.match(/viewport/i))      return '모바일 뷰포트 설정 검사 중'
          return `잠재적 버그 패턴 탐색 중`
        }
        return '자동화 테스트 실행 중'
      }
      if (toolName === 'Grep') {
        const q = query.slice(0, 30)
        if (query.match(/touch/i))     return `모바일 터치 이벤트 검색: "${q}"`
        if (query.match(/viewport/i))  return `뷰포트 메타태그 검색: "${q}"`
        if (query.match(/overflow|scroll/i)) return `스크롤 방지 코드 검색: "${q}"`
        return `코드 패턴 검색: "${q}"`
      }
      return '게임 코드 품질 및 버그 검토 중'
    }

    // ── 포스트모템 ──────────────────────────────────────────────────────────
    case 'postmortem': {
      if (toolName === 'Read') {
        if (filePath.includes('review'))     return '리뷰 보고서 분석 — 지적 사항 정리 중'
        if (filePath.includes('spec'))       return '기획서 vs 결과물 비교 — 달성도 평가 중'
        if (filePath.includes('wisdom'))     return '누적 플랫폼 지혜 확인 — 기존 패턴 대비 분석 중'
        if (filePath.includes('postmortem')) return '이전 회고와 비교 — 반복되는 문제 패턴 확인 중'
        if (filePath.includes('report'))     return '트렌드 분석 결과 회고 반영 중'
        if (filePath.includes('index.html')) return '실제 구현된 게임 코드 확인 중'
        return `산출물 검토 중 (${fname})`
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        if (filePath.includes('wisdom')) {
          const c = content.toLowerCase()
          if (c.match(/피해야|avoid|🚫/))  return '플랫폼 지혜 갱신 — "피해야 할 패턴" 업데이트 중'
          if (c.match(/검증|success|✅/))   return '플랫폼 지혜 갱신 — "검증된 성공 패턴" 업데이트 중'
          if (c.match(/기술|개선|🛠/))      return '플랫폼 지혜 갱신 — "기술 개선 누적" 업데이트 중'
          if (c.match(/우선순위|🎯|다음/))  return '플랫폼 지혜 갱신 — "다음 사이클 우선순위" 작성 중'
          return '플랫폼 지혜 업데이트 — 학습 인사이트 축적 중'
        }
        if (filePath.includes('postmortem')) {
          const c = content.toLowerCase()
          if (c.match(/잘된|good|성과/))     return '포스트모템 작성 — 잘된 점 정리 중'
          if (c.match(/아쉬|improve|문제/))  return '포스트모템 작성 — 아쉬운 점/개선점 정리 중'
          if (c.match(/다음|next|제안/))     return '포스트모템 작성 — 다음 사이클 제안 정리 중'
          return '개발 회고(포스트모템) 문서 작성 중'
        }
        return '사이클 결산 문서 작성 중'
      }
      return '사이클 전체 회고 및 인사이트 정리 중'
    }

    // ── 배포 담당 ────────────────────────────────────────────────────────────
    case 'deployer': {
      if (toolName === 'Read') {
        if (filePath.includes('spec'))       return '게임 메타데이터 추출 중 — 제목/장르/설명 확인'
        if (filePath.includes('registry'))   return '게임 레지스트리 현황 파악 중'
        if (filePath.includes('index.html')) return '게임 파일 최종 확인 중'
        if (filePath.includes('manifest'))   return '에셋 완성 여부 최종 점검 중'
        return `배포 전 파일 검토 중 (${fname})`
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        if (filePath.includes('registry'))   return '게임 레지스트리 등록 — 신규 게임 카탈로그 추가 중'
        return '배포 설정 파일 작성 중'
      }
      if (toolName === 'Bash') {
        if (cmd.includes('git status'))       return 'Git 상태 확인 — 변경 파일 목록 점검 중'
        if (cmd.includes('git add'))          return '배포할 파일 스테이징 중 (git add)'
        if (cmd.includes('git commit'))       return '커밋 생성 중 — 배포 이력 기록'
        if (cmd.includes('git push'))         return '🚀 GitHub 푸시 중 — Vercel 자동 배포 트리거!'
        if (cmd.includes('git log'))          return 'Git 히스토리 확인 중'
        if (cmd.includes('vercel'))           return 'Vercel CLI로 수동 배포 실행 중'
        return '배포 스크립트 실행 중'
      }
      return '게임 배포 진행 중'
    }

    default:
      return `${toolName} 실행 중`
  }
}

// ── English human-readable action descriptions ──────────────────────────────

function humanizeActionEn(agentId: AgentId, toolName: string, detail: string): string {
  let inp: Record<string, string> = {}
  try { inp = JSON.parse(detail) } catch {}

  const filePath  = (inp['file_path'] ?? inp['path'] ?? '').replace(/\\/g, '/')
  const query     = inp['query'] ?? inp['search_query'] ?? inp['pattern'] ?? ''
  const cmd       = inp['command'] ?? ''
  const url       = inp['url'] ?? ''
  const content   = inp['content'] ?? inp['new_string'] ?? ''
  const fname     = filePath.split('/').pop() ?? ''

  /** Extract keyword-based context from content */
  function detectContextEn(text: string): string {
    const t = text.toLowerCase()
    if (t.match(/gameloop|game.?loop|requestanimation/))     return 'game loop (main update cycle)'
    if (t.match(/collision|충돌|hitbox|intersect/))           return 'collision detection system'
    if (t.match(/touchstart|touchmove|touchend|touch.?event/)) return 'mobile touch input handling'
    if (t.match(/joystick|가상.?패드|virtual.?pad/))          return 'virtual joystick UI'
    if (t.match(/keydown|keyup|keyboard|키보드/))             return 'keyboard input handling'
    if (t.match(/mouse|click|pointer/))                      return 'mouse/pointer input handling'
    if (t.match(/canvas|ctx\.|drawimage|fillrect/))          return 'Canvas rendering system'
    if (t.match(/particle|파티클|effect|이펙트/))              return 'particle/effects system'
    if (t.match(/score|점수|combo|콤보/))                     return 'score/combo system'
    if (t.match(/level|wave|스테이지|웨이브|난이도/))           return 'level/wave progression system'
    if (t.match(/spawn|생성|enemy.?pool|적.?생성/))           return 'enemy/object spawn system'
    if (t.match(/powerup|파워업|buff|아이템/))                return 'power-up/item system'
    if (t.match(/audio|sound|bgm|효과음/))                   return 'sound/audio system'
    if (t.match(/preload|loadimage|fetch.*svg|에셋.?로드/))   return 'asset preloading'
    if (t.match(/ui|hud|health|hp|생명|체력/))               return 'UI/HUD display system'
    if (t.match(/gameover|game.?over|게임.?오버|restart/))    return 'game over/restart handling'
    if (t.match(/menu|메뉴|title.?screen|시작.?화면/))        return 'menu/title screen'
    if (t.match(/animation|animate|tween|애니메이션/))        return 'animation system'
    if (t.match(/physics|gravity|중력|velocity|가속/))        return 'physics/movement system'
    if (t.match(/path|경로|grid|타일|map|맵/))               return 'map/tile system'
    if (t.match(/tower|타워|building|건물|설치/))             return 'tower/building placement system'
    if (t.match(/viewport|meta.*viewport|resize/))           return 'viewport/responsive setup'
    return ''
  }

  switch (agentId) {

    // ── Analyst ──────────────────────────────────────────────────────────────
    case 'analyst': {
      if (toolName === 'WebSearch') {
        if (!query) return 'Searching mobile game trends'
        const q = query.slice(0, 40)
        return `Web search: "${q}"`
      }
      if (toolName === 'WebFetch') {
        try {
          const host = new URL(url).hostname.replace('www.', '')
          return `Analyzing ${host} page`
        } catch { return 'Analyzing trend data page' }
      }
      if (toolName === 'Read') {
        if (filePath.includes('registry'))  return 'Reviewing game list — checking genre overlap'
        if (filePath.includes('wisdom'))    return 'Reviewing platform wisdom — checking patterns to avoid'
        if (filePath.includes('postmortem')) return 'Analyzing previous cycle retrospective — identifying failure causes'
        if (filePath.includes('report'))    return 'Referencing previous analysis report'
        return `Analyzing file (${fname})`
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        if (filePath.includes('report'))    return 'Writing trend analysis report — organizing recommended genres/mechanics'
        return 'Documenting market research results'
      }
      if (toolName === 'Grep' || toolName === 'Glob') return 'Searching existing game data'
      return 'Analyzing mobile game market trends'
    }

    // ── Planner ──────────────────────────────────────────────────────────────
    case 'planner': {
      if (toolName === 'WebSearch') {
        const q = query.slice(0, 40)
        return q ? `Reference search: "${q}"` : 'Researching reference games'
      }
      if (toolName === 'WebFetch') {
        try {
          const host = new URL(url).hostname.replace('www.', '')
          return `${host} — analyzing reference game`
        } catch { return 'Analyzing reference game page' }
      }
      if (toolName === 'Read') {
        if (filePath.includes('report'))    return 'Reading trend analysis report — checking recommended genres'
        if (filePath.includes('spec'))      return `Referencing existing spec (${fname})`
        if (filePath.includes('wisdom'))    return 'Reviewing platform wisdom — checking success/failure patterns'
        if (filePath.includes('registry'))  return 'Checking existing game list — deriving differentiation points'
        if (filePath.includes('postmortem')) return 'Reviewing previous retrospective — incorporating improvement requests'
        return `Checking reference document (${fname})`
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        if (filePath.includes('spec')) {
          const ctx = detectContextEn(content)
          if (ctx) return `Writing spec — designing ${ctx}`
          // Detect which section is being written based on content keywords
          const c = content.toLowerCase()
          if (c.match(/조작|control|input|터치/))    return 'Writing spec — designing controls/input'
          if (c.match(/rule|규칙|mechanic|메카닉/))  return 'Writing spec — defining core game rules'
          if (c.match(/visual|시각|color|팔레트/))   return 'Writing spec — defining visual style'
          if (c.match(/level|stage|난이도|밸런스/))   return 'Writing spec — designing level/difficulty balance'
          if (c.match(/ui|hud|interface|화면/))      return 'Writing spec — designing UI/screen layout'
          if (c.match(/score|점수|reward|보상/))     return 'Writing spec — designing score/reward system'
          return 'Writing game design document (GDD)'
        }
        return 'Writing detailed game spec'
      }
      return 'Planning game concept and mechanics'
    }

    // ── Designer ────────────────────────────────────────────────────────────
    case 'designer': {
      if (toolName === 'Read') {
        if (filePath.includes('spec'))     return 'Checking spec — identifying character/background/UI requirements'
        if (filePath.includes('manifest')) return 'Reviewing asset list — checking completion status'
        return `Checking design reference document (${fname})`
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        // Extract which SVG element is being drawn
        const svgCtx = content.match(/gradient|circle|rect|path|polygon|text|filter|ellipse/)
        const shapeHint = svgCtx ? ` — rendering ${svgCtx[0]} element` : ''

        if (filePath.includes('thumbnail'))   return `Creating platform thumbnail${shapeHint}`
        if (filePath.includes('player'))      return `Designing player character${shapeHint}`
        if (filePath.includes('enemy'))       return `Designing enemy character${shapeHint}`
        if (filePath.includes('boss'))        return `Creating boss character${shapeHint}`
        if (filePath.includes('bg-layer'))    return `Creating background layer (${fname})${shapeHint}`
        if (filePath.includes('powerup'))     return `Creating power-up item icon${shapeHint}`
        if (filePath.includes('effect'))      return `Creating effect SVG (${fname})${shapeHint}`
        if (filePath.includes('ui-heart'))    return 'Creating health (heart) UI icon'
        if (filePath.includes('ui-star'))     return 'Creating star/score UI icon'
        if (filePath.includes('ui-'))         return `Creating UI component (${fname})`
        if (filePath.includes('tile'))        return `Creating tilemap asset (${fname})`
        if (filePath.includes('obstacle'))    return `Creating obstacle object (${fname})`
        if (filePath.includes('manifest'))    return 'Writing asset manifest — organizing full file list'
        if (filePath.endsWith('.svg'))        return `Creating SVG asset (${fname})${shapeHint}`
        return `Creating graphic asset (${fname})`
      }
      if (toolName === 'Bash') {
        if (cmd.includes('ls') || cmd.includes('dir'))   return 'Checking asset directory structure'
        if (cmd.includes('mkdir'))                        return 'Creating asset folder structure'
        return 'Managing asset files'
      }
      return 'Designing game visual assets'
    }

    // ── Coder ────────────────────────────────────────────────────────────────
    case 'coder': {
      if (toolName === 'Read') {
        if (filePath.includes('manifest'))   return 'Checking asset manifest — identifying available resources'
        if (filePath.includes('spec'))       return 'Reading game spec — checking implementation requirements'
        if (filePath.includes('review'))     return 'Checking review feedback — identifying items to fix'
        if (filePath.endsWith('.html'))      return `Analyzing game code (${fname})`
        if (filePath.endsWith('.svg'))       return `Checking SVG asset structure (${fname})`
        return `Checking reference file (${fname})`
      }
      if (toolName === 'Write') {
        if (filePath.includes('index.html')) {
          const ctx = detectContextEn(content)
          return ctx ? `Writing game code — ${ctx}` : 'Writing main HTML5 game file'
        }
        if (filePath.endsWith('.js'))  return `Writing JS module (${fname})`
        if (filePath.endsWith('.css')) return `Writing stylesheet (${fname})`
        return `Writing game file (${fname})`
      }
      if (toolName === 'Edit') {
        if (filePath.includes('index.html')) {
          const ctx = detectContextEn(content)
          return ctx ? `Editing code — ${ctx}` : 'Editing game code'
        }
        if (filePath.endsWith('.js'))  return `Editing JS module (${fname})`
        return `Editing code (${fname})`
      }
      if (toolName === 'Bash') {
        if (cmd.includes('puppeteer') || cmd.includes('node'))  return 'Running automated game test'
        if (cmd.includes('ls') || cmd.includes('dir'))          return 'Checking game file structure'
        if (cmd.includes('mkdir'))                              return 'Creating game directory structure'
        return 'Configuring game build/environment'
      }
      if (toolName === 'Grep') return `Searching code pattern: "${query.slice(0, 30)}"`
      if (toolName === 'Glob') return `Searching files: ${query.slice(0, 30)}`
      return 'Implementing game logic'
    }

    // ── Reviewer ──────────────────────────────────────────────────────────────
    case 'reviewer': {
      if (toolName === 'Read') {
        if (filePath.includes('index.html')) return 'Reviewing game source code — verifying logic/performance/security'
        if (filePath.endsWith('.js'))        return `Reviewing JS code quality (${fname})`
        if (filePath.includes('spec'))       return 'Verifying implementation completeness against spec — checking missing features'
        if (filePath.includes('manifest'))   return 'Checking for missing SVG assets'
        if (filePath.includes('review'))     return 'Checking previous review feedback — re-verifying fixes'
        if (filePath.endsWith('.svg'))       return `Validating asset file (${fname})`
        return `Reviewing file (${fname})`
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        if (filePath.includes('review')) {
          const c = content.toLowerCase()
          if (c.match(/approved/i))        return 'Writing review report — verdict: APPROVED'
          if (c.match(/needs_major_fix/i)) return 'Writing review report — verdict: NEEDS_MAJOR_FIX'
          if (c.match(/needs_minor_fix/i)) return 'Writing review report — verdict: NEEDS_MINOR_FIX'
          if (c.match(/touch|터치|모바일|mobile/)) return 'Writing review report — mobile compatibility results'
          if (c.match(/bug|버그|error|오류/))      return 'Writing review report — bug/error list'
          if (c.match(/performance|성능|memory|메모리/)) return 'Writing review report — performance issues'
          return 'Writing code review report'
        }
        return 'Documenting QA results report'
      }
      if (toolName === 'Bash') {
        if (cmd.includes('puppeteer'))   return 'Running headless browser automated game test'
        if (cmd.includes('node'))        return 'Running game logic unit test'
        if (cmd.includes('grep') || cmd.includes('findstr')) {
          if (cmd.match(/touch|mobile/i))  return 'Checking mobile touch event implementation'
          if (cmd.match(/viewport/i))      return 'Checking mobile viewport settings'
          return `Scanning for potential bug patterns`
        }
        return 'Running automated tests'
      }
      if (toolName === 'Grep') {
        const q = query.slice(0, 30)
        if (query.match(/touch/i))     return `Searching mobile touch events: "${q}"`
        if (query.match(/viewport/i))  return `Searching viewport meta tag: "${q}"`
        if (query.match(/overflow|scroll/i)) return `Searching scroll prevention code: "${q}"`
        return `Searching code pattern: "${q}"`
      }
      return 'Reviewing game code quality and bugs'
    }

    // ── Postmortem ──────────────────────────────────────────────────────────
    case 'postmortem': {
      if (toolName === 'Read') {
        if (filePath.includes('review'))     return 'Analyzing review report — organizing flagged issues'
        if (filePath.includes('spec'))       return 'Comparing spec vs deliverable — evaluating achievement level'
        if (filePath.includes('wisdom'))     return 'Checking accumulated platform wisdom — analyzing against existing patterns'
        if (filePath.includes('postmortem')) return 'Comparing with previous retrospective — identifying recurring issues'
        if (filePath.includes('report'))     return 'Incorporating trend analysis results into retrospective'
        if (filePath.includes('index.html')) return 'Reviewing actual implemented game code'
        return `Reviewing deliverable (${fname})`
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        if (filePath.includes('wisdom')) {
          const c = content.toLowerCase()
          if (c.match(/피해야|avoid|🚫/))  return 'Updating platform wisdom — "patterns to avoid" section'
          if (c.match(/검증|success|✅/))   return 'Updating platform wisdom — "proven success patterns" section'
          if (c.match(/기술|개선|🛠/))      return 'Updating platform wisdom — "accumulated technical improvements" section'
          if (c.match(/우선순위|🎯|다음/))  return 'Updating platform wisdom — "next cycle priorities" section'
          return 'Updating platform wisdom — accumulating learning insights'
        }
        if (filePath.includes('postmortem')) {
          const c = content.toLowerCase()
          if (c.match(/잘된|good|성과/))     return 'Writing postmortem — summarizing what went well'
          if (c.match(/아쉬|improve|문제/))  return 'Writing postmortem — summarizing areas for improvement'
          if (c.match(/다음|next|제안/))     return 'Writing postmortem — summarizing next cycle suggestions'
          return 'Writing development retrospective (postmortem) document'
        }
        return 'Writing cycle wrap-up document'
      }
      return 'Conducting full cycle retrospective and organizing insights'
    }

    // ── Deployer ────────────────────────────────────────────────────────────
    case 'deployer': {
      if (toolName === 'Read') {
        if (filePath.includes('spec'))       return 'Extracting game metadata — checking title/genre/description'
        if (filePath.includes('registry'))   return 'Checking game registry status'
        if (filePath.includes('index.html')) return 'Final verification of game file'
        if (filePath.includes('manifest'))   return 'Final check on asset completion'
        return `Reviewing file before deployment (${fname})`
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        if (filePath.includes('registry'))   return 'Registering to game registry — adding new game to catalog'
        return 'Writing deployment configuration file'
      }
      if (toolName === 'Bash') {
        if (cmd.includes('git status'))       return 'Checking Git status — reviewing changed files'
        if (cmd.includes('git add'))          return 'Staging files for deployment (git add)'
        if (cmd.includes('git commit'))       return 'Creating commit — recording deployment history'
        if (cmd.includes('git push'))         return 'Pushing to GitHub — triggering Vercel auto-deploy!'
        if (cmd.includes('git log'))          return 'Checking Git history'
        if (cmd.includes('vercel'))           return 'Running manual deployment via Vercel CLI'
        return 'Running deployment script'
      }
      return 'Deploying game'
    }

    default:
      return `Running ${toolName}`
  }
}

/** 툴 사용 기록 (hook에서 호출) */
export function logTool(agentId: AgentId, toolName: string, detail: string): void {
  const data     = read()
  const a        = data.agents[agentId]
  const action   = humanizeAction(agentId, toolName, detail)
  const actionEn = humanizeActionEn(agentId, toolName, detail)
  a.toolCalls      += 1
  a.currentAction   = action
  a.currentActionEn = actionEn
  a.logs   = [action,   ...a.logs].slice(0, 20)
  a.logsEn = [actionEn, ...(a.logsEn ?? [])].slice(0, 20)
  addLog(data, `[${agentId.toUpperCase()}] ${action}`, `[${agentId.toUpperCase()}] ${actionEn}`)
  write(data)
}

/** 게임 정보 업데이트 (플래너가 spec 작성 후) */
export function setGameInfo(gameTitle: string, gameId: string, gameGenre: string[]): void {
  const data  = read()
  data.gameTitle = gameTitle
  data.gameId    = gameId
  data.gameGenre = gameGenre
  write(data)
}
