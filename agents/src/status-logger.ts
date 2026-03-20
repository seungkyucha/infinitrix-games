import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import Redis, { type Redis as RedisClient } from 'ioredis'

const __dirname  = dirname(fileURLToPath(import.meta.url))
const LOGS_DIR   = resolve(__dirname, '..', '..', 'logs')
const STATUS_FILE = resolve(LOGS_DIR, 'agent-status.json')
const REDIS_KEY  = 'infinitrix:agent-status'

export type AgentId     = 'analyst' | 'planner' | 'designer' | 'coder' | 'reviewer' | 'postmortem' | 'deployer'
export type AgentStatus = 'idle' | 'running' | 'completed' | 'error'
export type CycleStatus = 'idle' | 'running' | 'completed' | 'error'

export interface AgentState {
  status:        AgentStatus
  currentAction: string
  startedAt:     string | null
  completedAt:   string | null
  toolCalls:     number
  logs:          string[]
}

export interface StatusData {
  lastUpdated:  string
  cycleNumber:  number
  cycleStatus:  CycleStatus
  currentStep:  number
  totalSteps:   7
  stepName:     string
  gameTitle:    string
  gameId:       string
  gameGenre:    string[]
  agents:       Record<AgentId, AgentState>
  recentLogs:   string[]
}

// ── Redis 클라이언트 (싱글톤) ─────────────────────────────────────────────────

let _redis: RedisClient | null = null

function getRedis(): RedisClient | null {
  if (!process.env.REDIS_URL) return null
  if (_redis) return _redis
  try {
    _redis = new (Redis as unknown as new (...a: unknown[]) => RedisClient)(process.env.REDIS_URL, {
      connectTimeout: 5000,
      lazyConnect:    true,
      maxRetriesPerRequest: 2,
    })
    _redis!.on('error', () => { /* suppress */ })
    return _redis
  } catch {
    return null
  }
}

/** Redis에 상태를 비동기로 저장 (fire-and-forget) */
function pushToRedis(data: StatusData): void {
  const redis = getRedis()
  if (!redis) return
  const json = JSON.stringify(data)
  redis.set(REDIS_KEY, json).catch(() => {})
}

// ── 기본값 ─────────────────────────────────────────────────────────────────

function defaultAgent(): AgentState {
  return { status: 'idle', currentAction: '', startedAt: null, completedAt: null, toolCalls: 0, logs: [] }
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
  pushToRedis(data)
}

function ts(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

function addLog(data: StatusData, msg: string): void {
  data.recentLogs = [`${ts()} ${msg}`, ...data.recentLogs].slice(0, 60)
}

// ── 공개 API ────────────────────────────────────────────────────────────────

/** 사이클 시작 — 전체 상태 초기화 */
export function startCycle(cycleNumber: number): void {
  const data = defaultStatus()
  data.cycleNumber = cycleNumber
  data.cycleStatus = 'running'
  addLog(data, `[CYCLE] #${cycleNumber} 시작`)
  write(data)
}

/** 사이클 정상 완료 */
export function completeCycle(gameTitle: string, gameId: string): void {
  const data = read()
  data.cycleStatus = 'completed'
  data.gameTitle   = gameTitle || data.gameTitle
  data.gameId      = gameId   || data.gameId
  addLog(data, `[CYCLE] 완료 — ${gameTitle} (${gameId})`)
  write(data)
}

/** 사이클 오류 종료 */
export function failCycle(error: string): void {
  const data = read()
  data.cycleStatus = 'error'
  addLog(data, `[ERROR] ${error.slice(0, 120)}`)
  write(data)
}

/** 에이전트 단계 시작 */
export function startAgent(agentId: AgentId, step: number, stepName: string): void {
  const data = read()
  data.currentStep = step
  data.stepName    = stepName
  data.agents[agentId] = {
    status: 'running',
    currentAction: '작업 준비 중...',
    startedAt:     new Date().toISOString(),
    completedAt:   null,
    toolCalls:     0,
    logs:          [],
  }
  addLog(data, `[${agentId.toUpperCase()}] 시작 (${step}/7 ${stepName})`)
  write(data)
}

/** 에이전트 단계 완료 */
export function completeAgent(agentId: AgentId): void {
  const data = read()
  const a = data.agents[agentId]
  a.status        = 'completed'
  a.completedAt   = new Date().toISOString()
  a.currentAction = '✓ 완료'
  addLog(data, `[${agentId.toUpperCase()}] 완료 (${a.toolCalls}회 툴 사용)`)
  write(data)
}

/** 에이전트 오류 */
export function failAgent(agentId: AgentId, error: string): void {
  const data = read()
  data.agents[agentId].status        = 'error'
  data.agents[agentId].currentAction = `오류: ${error.slice(0, 100)}`
  addLog(data, `[${agentId.toUpperCase()}] 오류: ${error.slice(0, 100)}`)
  write(data)
}

// ── 사람이 읽기 쉬운 액션 설명 ───────────────────────────────────────────────

function humanizeAction(agentId: AgentId, toolName: string, detail: string): string {
  let inp: Record<string, string> = {}
  try { inp = JSON.parse(detail) } catch {}

  const filePath = inp['file_path'] ?? inp['path'] ?? ''
  const query    = inp['query'] ?? inp['search_query'] ?? ''
  const cmd      = inp['command'] ?? ''
  const url      = inp['url'] ?? ''
  const fname    = filePath.split('/').pop() ?? ''

  switch (agentId) {

    // ── 분석가 ──────────────────────────────────────────────────────────────
    case 'analyst': {
      if (toolName === 'WebSearch') {
        if (!query) return '모바일 게임 트렌드 검색 중'
        const q = query.slice(0, 35)
        if (query.match(/trend|트렌드|인기/i))      return `"${q}" — 최신 트렌드 조사 중`
        if (query.match(/casual|캐주얼|puzzle|퍼즐/i)) return `"${q}" — 캐주얼 장르 시장 분석 중`
        if (query.match(/idle|방치|clicker/i))        return `"${q}" — 방치형 게임 수요 분석 중`
        if (query.match(/hyper|하이퍼|action|액션/i)) return `"${q}" — 하이퍼캐주얼 동향 파악 중`
        if (query.match(/revenue|매출|monetize/i))    return `"${q}" — 수익 모델 조사 중`
        return `"${q}" — 게임 시장 데이터 수집 중`
      }
      if (toolName === 'WebFetch') {
        try {
          const host = new URL(url).hostname.replace('www.', '')
          if (host.includes('sensor') || host.includes('appannie')) return `${host} — 앱 순위 데이터 수집 중`
          if (host.includes('reddit'))   return `${host} — 유저 반응 및 리뷰 분석 중`
          if (host.includes('youtube'))  return `${host} — 게임플레이 영상 트렌드 분석 중`
          if (host.includes('steam'))    return `${host} — PC 게임 판매 동향 파악 중`
          return `${host} — 시장 데이터 크롤링 중`
        } catch { return '트렌드 데이터 페이지 분석 중' }
      }
      if (toolName === 'Read') {
        if (filePath.includes('registry'))  return '기존 게임 목록 검토 — 중복 장르 확인 중'
        if (filePath.includes('wisdom'))    return '과거 사이클 인사이트 검토 중'
        if (filePath.includes('postmortem')) return '이전 개발 회고 분석 중'
        return '플랫폼 현황 및 기존 데이터 분석 중'
      }
      if (toolName === 'Write') {
        if (filePath.includes('analysis'))  return '트렌드 분석 보고서 작성 중'
        return '시장 조사 결과 문서화 중'
      }
      return '모바일 게임 시장 트렌드 분석 중'
    }

    // ── 플래너 ──────────────────────────────────────────────────────────────
    case 'planner': {
      if (toolName === 'WebSearch') {
        if (!query) return '레퍼런스 게임 조사 중'
        const q = query.slice(0, 35)
        if (query.match(/mechanic|메카닉|gameplay/i)) return `"${q}" — 핵심 게임플레이 메카닉 리서치 중`
        if (query.match(/ui|ux|interface|인터페이스/i)) return `"${q}" — UI/UX 레퍼런스 수집 중`
        if (query.match(/level|레벨|stage|스테이지/i)) return `"${q}" — 레벨 디자인 패턴 조사 중`
        if (query.match(/score|점수|rank|랭킹/i))      return `"${q}" — 스코어 시스템 레퍼런스 분석 중`
        if (query.match(/tutorial|튜토리얼|onboard/i)) return `"${q}" — 튜토리얼 흐름 사례 조사 중`
        return `"${q}" — 게임 기획 레퍼런스 수집 중`
      }
      if (toolName === 'WebFetch') {
        try {
          const host = new URL(url).hostname.replace('www.', '')
          if (host.includes('itch.io'))  return `${host} — 인디 게임 기획 분석 중`
          if (host.includes('poki'))     return `${host} — 브라우저 게임 UX 분석 중`
          if (host.includes('github'))   return `${host} — 오픈소스 게임 구조 참고 중`
          return `${host} — 레퍼런스 게임 분석 중`
        } catch { return '레퍼런스 게임 페이지 분석 중' }
      }
      if (toolName === 'Read') {
        if (filePath.includes('analysis'))  return '트렌드 분석 보고서 숙독 중'
        if (filePath.includes('spec'))      return '기존 게임 스펙 참고 중'
        if (filePath.includes('wisdom'))    return '플랫폼 개발 인사이트 검토 중'
        if (filePath.includes('registry'))  return '기존 게임 목록 확인 — 차별화 포인트 도출 중'
        return '분석 보고서 검토 중'
      }
      if (toolName === 'Write') {
        if (filePath.includes('spec'))   return '게임 기획서(GDD) 작성 중 — 핵심 메카닉 정의'
        if (filePath.includes('brief'))  return '개발 브리프 문서 작성 중'
        return '게임 상세 기획서 작성 중'
      }
      if (toolName === 'Edit') return '게임 기획서 내용 보완 중'
      return '게임 컨셉 및 메카닉 기획 중'
    }

    // ── 디자이너 ────────────────────────────────────────────────────────────
    case 'designer': {
      if (toolName === 'Read') {
        if (filePath.includes('spec'))     return '게임 기획서 확인 — 에셋 요구사항 파악 중'
        if (filePath.includes('manifest')) return '에셋 목록 검토 중'
        return '기획서 및 디자인 가이드 확인 중'
      }
      if (toolName === 'Write' || toolName === 'Edit') {
        if (filePath.includes('thumbnail'))   return `썸네일 이미지 SVG 제작 중 (${fname})`
        if (filePath.includes('player'))      return `플레이어 캐릭터 SVG 디자인 중 (${fname})`
        if (filePath.includes('enemy'))       return `적 캐릭터 SVG 디자인 중 (${fname})`
        if (filePath.includes('boss'))        return `보스 캐릭터 SVG 제작 중 (${fname})`
        if (filePath.includes('bg-layer'))    return `배경 레이어 SVG 제작 중 (${fname})`
        if (filePath.includes('background'))  return `배경 이미지 디자인 중 (${fname})`
        if (filePath.includes('powerup'))     return `파워업 아이템 SVG 제작 중 (${fname})`
        if (filePath.includes('coin') || filePath.includes('gem')) return `코인/보석 아이콘 제작 중 (${fname})`
        if (filePath.includes('effect'))      return `파티클 이펙트 SVG 제작 중 (${fname})`
        if (filePath.includes('explosion'))   return `폭발 이펙트 SVG 제작 중 (${fname})`
        if (filePath.includes('ui-button'))   return `UI 버튼 에셋 제작 중 (${fname})`
        if (filePath.includes('ui-icon'))     return `UI 아이콘 에셋 제작 중 (${fname})`
        if (filePath.includes('ui-'))         return `UI 컴포넌트 SVG 제작 중 (${fname})`
        if (filePath.includes('font'))        return `게임 폰트 에셋 제작 중`
        if (filePath.includes('tile'))        return `타일맵 에셋 제작 중 (${fname})`
        if (filePath.includes('obstacle'))    return `장애물 오브젝트 SVG 제작 중 (${fname})`
        if (filePath.includes('platform'))    return `발판/플랫폼 에셋 디자인 중 (${fname})`
        if (filePath.includes('manifest'))    return '에셋 매니페스트 작성 — 전체 목록 정리 중'
        if (filePath.endsWith('.svg'))        return `SVG 에셋 제작 중 (${fname})`
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
        if (filePath.includes('review'))     return '코드 리뷰 피드백 반영 준비 중'
        if (filePath.endsWith('.html'))      return `기존 게임 코드 분석 중 (${fname})`
        if (filePath.endsWith('.js'))        return `JS 코드 검토 중 (${fname})`
        return '기획서 및 에셋 명세 확인 중'
      }
      if (toolName === 'Write') {
        if (filePath.includes('index.html')) return '게임 메인 HTML5 파일 작성 중 — 엔진 구조 설계'
        if (filePath.endsWith('.js'))        return `게임 로직 JS 모듈 작성 중 (${fname})`
        if (filePath.endsWith('.css'))       return `게임 스타일시트 작성 중 (${fname})`
        if (filePath.includes('readme'))     return '게임 README 문서 작성 중'
        return `게임 파일 작성 중 (${fname})`
      }
      if (toolName === 'Edit') {
        if (filePath.includes('index.html')) return '게임 HTML 코드 수정 중 — 버그 수정 또는 기능 추가'
        if (filePath.endsWith('.js'))        return `게임 로직 수정 중 (${fname})`
        return `게임 코드 디버깅 및 수정 중 (${fname})`
      }
      if (toolName === 'Bash') {
        if (cmd.includes('python') || cmd.includes('puppeteer') || cmd.includes('node')) return '게임 동작 자동화 테스트 실행 중'
        if (cmd.includes('ls') || cmd.includes('dir'))   return '게임 파일 구조 확인 중'
        if (cmd.includes('cat') || cmd.includes('type')) return '게임 코드 내용 검토 중'
        if (cmd.includes('mkdir'))                       return '게임 디렉토리 구조 생성 중'
        if (cmd.includes('cp') || cmd.includes('copy'))  return '에셋 파일 복사 배치 중'
        return '게임 빌드 및 환경 설정 중'
      }
      return '게임 로직 구현 중'
    }

    // ── 리뷰어 ──────────────────────────────────────────────────────────────
    case 'reviewer': {
      if (toolName === 'Read') {
        if (filePath.includes('index.html')) return '게임 메인 코드 정밀 리뷰 중 — 로직 검증'
        if (filePath.endsWith('.js'))        return `JS 모듈 코드 품질 검토 중 (${fname})`
        if (filePath.includes('spec'))       return '기획서 대비 구현 완성도 검증 중'
        if (filePath.includes('manifest'))   return '에셋 누락 여부 체크 중'
        return '게임 소스코드 전체 리뷰 중'
      }
      if (toolName === 'Write') {
        if (filePath.includes('review'))     return '코드 리뷰 보고서 작성 중 — 이슈 및 개선점 정리'
        return 'QA 결과 보고서 문서화 중'
      }
      if (toolName === 'Edit') return '리뷰 보고서 내용 보완 중'
      if (toolName === 'Bash') {
        if (cmd.includes('puppeteer'))          return '헤드리스 브라우저로 게임 자동 실행 테스트 중'
        if (cmd.includes('node'))               return '게임 로직 유닛 테스트 실행 중'
        if (cmd.includes('python'))             return '자동화 QA 스크립트 실행 중'
        if (cmd.includes('ls') || cmd.includes('dir'))  return '게임 파일 구성 검사 중'
        if (cmd.includes('cat') || cmd.includes('type')) return '코드 가독성 및 구조 점검 중'
        if (cmd.includes('grep') || cmd.includes('findstr')) return '잠재적 버그 패턴 탐색 중'
        return '자동화 테스트 실행 중'
      }
      return '게임 코드 품질 및 버그 검토 중'
    }

    // ── 포스트모템 ──────────────────────────────────────────────────────────
    case 'postmortem': {
      if (toolName === 'Read') {
        if (filePath.includes('review'))     return '리뷰어 QA 보고서 분석 중'
        if (filePath.includes('spec'))       return '원본 기획서와 결과물 비교 분석 중'
        if (filePath.includes('wisdom'))     return '누적 플랫폼 지혜 데이터 검토 중'
        if (filePath.includes('postmortem')) return '이전 회고 내용과 패턴 비교 중'
        if (filePath.includes('analysis'))   return '트렌드 분석 결과 회고 반영 중'
        return '이번 사이클 산출물 종합 검토 중'
      }
      if (toolName === 'Write') {
        if (filePath.includes('wisdom'))     return '플랫폼 지혜 업데이트 — 학습 인사이트 축적 중'
        if (filePath.includes('postmortem')) return '개발 회고(포스트모템) 문서 작성 중'
        return '사이클 결산 문서 작성 중'
      }
      if (toolName === 'Edit') {
        if (filePath.includes('wisdom'))     return '플랫폼 지혜 내용 갱신 중'
        return '회고 문서 내용 보완 중'
      }
      return '사이클 전체 회고 및 인사이트 정리 중'
    }

    // ── 배포 담당 ────────────────────────────────────────────────────────────
    case 'deployer': {
      if (toolName === 'Read') {
        if (filePath.includes('spec'))       return '게임 메타데이터 확인 — 제목/장르/설명 추출 중'
        if (filePath.includes('registry'))   return '게임 레지스트리 현황 파악 중'
        if (filePath.includes('index.html')) return '게임 파일 최종 확인 중'
        if (filePath.includes('manifest'))   return '에셋 완성 여부 최종 점검 중'
        return '배포 전 게임 정보 검토 중'
      }
      if (toolName === 'Write') {
        if (filePath.includes('registry'))   return '게임 레지스트리 등록 — 플랫폼 카탈로그 업데이트 중'
        return '배포 설정 파일 작성 중'
      }
      if (toolName === 'Edit') {
        if (filePath.includes('registry'))   return '게임 레지스트리 정보 수정 중'
        return '배포 메타데이터 수정 중'
      }
      if (toolName === 'Bash') {
        if (cmd.includes('git status'))                      return 'Git 변경사항 상태 확인 중'
        if (cmd.includes('git add'))                         return '배포할 파일 스테이징 중 (git add)'
        if (cmd.includes('git commit'))                      return '변경사항 커밋 생성 중 — 커밋 메시지 작성'
        if (cmd.includes('git push'))                        return 'GitHub에 푸시 중 — Vercel 자동 배포 트리거'
        if (cmd.includes('git log') || cmd.includes('git diff')) return 'Git 히스토리 및 변경 내역 확인 중'
        if (cmd.includes('ls') || cmd.includes('dir'))       return '배포 대상 파일 목록 최종 확인 중'
        if (cmd.includes('vercel'))                          return 'Vercel CLI로 수동 배포 실행 중'
        if (cmd.includes('npm') || cmd.includes('node'))     return '배포 전 빌드 검증 중'
        return '배포 스크립트 실행 중'
      }
      return '게임 배포 진행 중'
    }

    default:
      return `${toolName} 실행 중`
  }
}

/** 툴 사용 기록 (hook에서 호출) */
export function logTool(agentId: AgentId, toolName: string, detail: string): void {
  const data   = read()
  const a      = data.agents[agentId]
  const action = humanizeAction(agentId, toolName, detail)
  a.toolCalls    += 1
  a.currentAction = action
  a.logs = [action, ...a.logs].slice(0, 20)
  addLog(data, `[${agentId.toUpperCase()}] ${action}`)
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
