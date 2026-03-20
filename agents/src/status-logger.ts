import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import Redis from 'ioredis'

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

let _redis: Redis | null = null

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null
  if (_redis) return _redis
  try {
    _redis = new Redis(process.env.REDIS_URL, {
      connectTimeout: 5000,
      lazyConnect:    true,
      maxRetriesPerRequest: 2,
    })
    _redis.on('error', () => { /* suppress */ })
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

  switch (agentId) {
    case 'analyst':
      if (toolName === 'WebSearch') return query ? `"${query.slice(0, 28)}" 검색 중` : '웹 검색 중'
      if (toolName === 'WebFetch')  return url ? `${new URL(url).hostname} 분석 중` : '웹 페이지 분석 중'
      if (toolName === 'Read')      return '플랫폼 현황 분석 중'
      if (toolName === 'Write')     return '분석 보고서 작성 중'
      return '트렌드 분석 중'

    case 'planner':
      if (toolName === 'WebSearch') return query ? `"${query.slice(0, 28)}" 레퍼런스 검색 중` : '레퍼런스 게임 조사 중'
      if (toolName === 'Read')      return '분석 보고서 검토 중'
      if (toolName === 'Write')     return '게임 기획서 작성 중'
      return '게임 기획 중'

    case 'designer':
      if (filePath.includes('player'))    return '플레이어 캐릭터 SVG 제작 중'
      if (filePath.includes('enemy'))     return '적 캐릭터 SVG 제작 중'
      if (filePath.includes('bg-layer'))  return '배경 이미지 제작 중'
      if (filePath.includes('thumbnail')) return '썸네일 이미지 제작 중'
      if (filePath.includes('powerup'))   return '아이템 에셋 제작 중'
      if (filePath.includes('effect'))    return '이펙트 에셋 제작 중'
      if (filePath.includes('ui-'))       return 'UI 아이콘 제작 중'
      if (filePath.includes('manifest'))  return '에셋 목록 정리 중'
      if (toolName === 'Read')            return '기획서 확인 중'
      return '그래픽 에셋 제작 중'

    case 'coder':
      if (toolName === 'Read')  return filePath.includes('manifest') ? '에셋 목록 확인 중' : '기획서 및 에셋 확인 중'
      if (toolName === 'Write') return filePath.includes('index.html') ? '게임 메인 코드 작성 중' : '게임 코드 작성 중'
      if (toolName === 'Edit')  return '게임 코드 수정 중'
      if (toolName === 'Bash')  return '게임 동작 테스트 중'
      return '게임 구현 중'

    case 'reviewer':
      if (toolName === 'Read')  return '게임 코드 리뷰 중'
      if (toolName === 'Write') return '리뷰 보고서 작성 중'
      if (toolName === 'Bash')  {
        if (cmd.includes('puppeteer') || cmd.includes('node')) return '브라우저에서 게임 테스트 중'
        return '자동화 테스트 실행 중'
      }
      return '코드 품질 검토 중'

    case 'postmortem':
      if (toolName === 'Read')  return '리뷰 결과 분석 중'
      if (toolName === 'Write') return filePath.includes('wisdom') ? '플랫폼 지혜 업데이트 중' : '포스트모템 문서 작성 중'
      return '사이클 총정리 중'

    case 'deployer':
      if (toolName === 'Read')  return '게임 정보 확인 중'
      if (toolName === 'Write') return '게임 레지스트리 등록 중'
      if (toolName === 'Bash')  {
        if (cmd.includes('git add') || cmd.includes('git commit')) return '변경사항 커밋 중'
        if (cmd.includes('git push')) return 'GitHub에 배포 중'
        return '배포 작업 중'
      }
      return '배포 진행 중'

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
