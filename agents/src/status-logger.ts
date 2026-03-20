import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOGS_DIR   = resolve(__dirname, '..', '..', 'logs')
const STATUS_FILE = resolve(LOGS_DIR, 'agent-status.json')

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
  a.status       = 'completed'
  a.completedAt  = new Date().toISOString()
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

/** 툴 사용 기록 (hook에서 호출) */
export function logTool(agentId: AgentId, toolName: string, detail: string): void {
  const data = read()
  const a    = data.agents[agentId]
  const action = `${toolName}: ${detail.slice(0, 80)}`
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
