'use client'

import { useEffect, useState, useRef } from 'react'

// ── 타입 ─────────────────────────────────────────────────────────────────────

type AgentStatus = 'idle' | 'running' | 'completed' | 'error'
type CycleStatus = 'idle' | 'running' | 'completed' | 'error'

interface AgentState {
  status:        AgentStatus
  currentAction: string
  startedAt:     string | null
  completedAt:   string | null
  toolCalls:     number
  logs:          string[]
}

interface StatusData {
  lastUpdated: string
  cycleNumber: number
  cycleStatus: CycleStatus
  currentStep: number
  totalSteps:  number
  stepName:    string
  gameTitle:   string
  gameId:      string
  gameGenre:   string[]
  agents: {
    analyst:    AgentState
    planner:    AgentState
    coder:      AgentState
    reviewer:   AgentState
    postmortem: AgentState
    deployer:   AgentState
  }
  recentLogs: string[]
}

// ── 에이전트 메타데이터 ────────────────────────────────────────────────────────

const AGENTS: { id: keyof StatusData['agents']; label: string; role: string; step: number }[] = [
  { id: 'analyst',    label: '분석가',    role: 'Data Analyst',    step: 1 },
  { id: 'planner',    label: '플래너',    role: 'Game Planner',    step: 2 },
  { id: 'coder',      label: '코더',      role: 'Full-stack Dev',  step: 3 },
  { id: 'reviewer',   label: '리뷰어',    role: 'QA Reviewer',     step: 4 },
  { id: 'postmortem', label: '포스트모템', role: 'Tech Writer',     step: 5 },
  { id: 'deployer',   label: '배포 담당', role: 'DevOps Engineer', step: 6 },
]

const STEP_NAMES = ['트렌드 분석', '게임 기획', '코딩 + 디자인', '코드 리뷰 + 테스트', '포스트모템 작성', '레지스트리 등록 + 배포']

// ── 상태 색상 ─────────────────────────────────────────────────────────────────

function statusColor(status: AgentStatus | CycleStatus) {
  switch (status) {
    case 'running':   return 'text-green-400'
    case 'completed': return 'text-cyan-400'
    case 'error':     return 'text-red-400'
    default:          return 'text-zinc-500'
  }
}

function statusBg(status: AgentStatus | CycleStatus) {
  switch (status) {
    case 'running':   return 'bg-green-400/10 border-green-400/30'
    case 'completed': return 'bg-cyan-400/10 border-cyan-400/30'
    case 'error':     return 'bg-red-400/10 border-red-400/30'
    default:          return 'bg-zinc-800/50 border-zinc-700/40'
  }
}

function statusLabel(status: AgentStatus | CycleStatus) {
  switch (status) {
    case 'running':   return 'RUNNING'
    case 'completed': return 'COMPLETED'
    case 'error':     return 'ERROR'
    default:          return 'IDLE'
  }
}

// ── 경과 시간 ─────────────────────────────────────────────────────────────────

function elapsed(startedAt: string | null): string {
  if (!startedAt) return ''
  const ms = Date.now() - new Date(startedAt).getTime()
  const s  = Math.floor(ms / 1000)
  if (s < 60)  return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60)  return `${m}m ${s % 60}s`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

// ── 에이전트 카드 ─────────────────────────────────────────────────────────────

function AgentCard({ agent, data, now }: {
  agent: typeof AGENTS[0]
  data:  AgentState
  now:   number
}) {
  return (
    <div className={`rounded-lg border p-4 flex flex-col gap-3 transition-all duration-500 ${statusBg(data.status)}`}>
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500">STEP {agent.step}</span>
            {data.status === 'running' && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            )}
          </div>
          <h3 className="font-bold text-white mt-0.5">{agent.label}</h3>
          <p className="text-xs text-zinc-500 font-mono">{agent.role}</p>
        </div>
        <div className="text-right">
          <span className={`text-xs font-mono font-semibold tracking-widest ${statusColor(data.status)}`}>
            {statusLabel(data.status)}
          </span>
          {data.startedAt && data.status === 'running' && (
            <p className="text-xs text-zinc-500 mt-0.5 font-mono">{elapsed(data.startedAt)}</p>
          )}
          {data.toolCalls > 0 && (
            <p className="text-xs text-zinc-600 mt-0.5 font-mono">{data.toolCalls} calls</p>
          )}
        </div>
      </div>

      {/* 현재 작업 */}
      <div className="min-h-[2rem]">
        {data.currentAction ? (
          <p className="text-xs text-zinc-300 font-mono leading-relaxed break-all line-clamp-2">
            {data.currentAction}
          </p>
        ) : (
          <p className="text-xs text-zinc-600 font-mono italic">대기 중...</p>
        )}
      </div>

      {/* 미니 로그 */}
      {data.logs.length > 0 && (
        <div className="space-y-0.5 border-t border-white/5 pt-2">
          {data.logs.slice(0, 4).map((log, i) => (
            <p
              key={i}
              className="text-[10px] font-mono leading-relaxed break-all"
              style={{ color: i === 0 ? '#a1a1aa' : `rgba(161,161,170,${0.4 - i * 0.08})` }}
            >
              › {log}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData]       = useState<StatusData | null>(null)
  const [tick, setTick]       = useState(0)
  const [live, setLive]       = useState(false)
  const logRef                = useRef<HTMLDivElement>(null)
  const now                   = Date.now()

  // 2초마다 폴링
  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch('/api/agent-status', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled) {
          setData(json)
          setLive(true)
        }
      } catch {
        if (!cancelled) setLive(false)
      }
    }

    poll()
    const id = setInterval(() => {
      poll()
      setTick(t => t + 1)
    }, 2000)

    return () => { cancelled = true; clearInterval(id) }
  }, [])

  // 로그 자동 스크롤
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [data?.recentLogs.length])

  // 로딩
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-sm animate-pulse">
          연결 중...
        </div>
      </div>
    )
  }

  const isRunning = data.cycleStatus === 'running'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── 헤더 ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">에이전트 현황판</h1>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${live ? 'bg-green-400 animate-pulse' : 'bg-zinc-600'}`} />
              <span className={`text-xs font-mono ${live ? 'text-green-400' : 'text-zinc-500'}`}>
                {live ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
          <p className="text-sm text-zinc-500 mt-1 font-mono">
            Agent Activity Monitor · 2초마다 자동 갱신
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-600 font-mono">
            마지막 업데이트
          </p>
          <p className="text-xs text-zinc-400 font-mono">
            {new Date(data.lastUpdated).toLocaleTimeString('ko-KR')}
          </p>
        </div>
      </div>

      {/* ── 사이클 상태 배너 ──────────────────────────────────────── */}
      <div className={`rounded-xl border p-5 ${statusBg(data.cycleStatus)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {data.cycleStatus === 'idle' ? (
              <span className="text-2xl">💤</span>
            ) : data.cycleStatus === 'running' ? (
              <span className="text-2xl animate-spin-slow">⚙️</span>
            ) : data.cycleStatus === 'completed' ? (
              <span className="text-2xl">✅</span>
            ) : (
              <span className="text-2xl">❌</span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold tracking-widest ${statusColor(data.cycleStatus)}`}>
                  {statusLabel(data.cycleStatus)}
                </span>
                {data.cycleNumber > 0 && (
                  <span className="text-xs text-zinc-500 font-mono">· CYCLE #{data.cycleNumber}</span>
                )}
              </div>
              {data.cycleStatus === 'idle' ? (
                <p className="text-white font-semibold mt-0.5">에이전트 대기 중</p>
              ) : (
                <p className="text-white font-semibold mt-0.5">
                  {data.gameTitle || '게임 제목 분석 중...'}
                  {data.gameId && (
                    <span className="text-zinc-400 font-normal text-sm ml-2">({data.gameId})</span>
                  )}
                </p>
              )}
            </div>
          </div>
          {data.cycleStatus === 'running' && (
            <div className="text-right">
              <p className="text-xs text-zinc-500 font-mono">현재 단계</p>
              <p className="text-sm text-white font-mono font-semibold">
                {data.currentStep}/{data.totalSteps} — {data.stepName}
              </p>
            </div>
          )}
          {data.gameGenre.length > 0 && (
            <div className="flex gap-1.5">
              {data.gameGenre.map(g => (
                <span key={g} className="text-xs px-2 py-0.5 rounded-sm bg-accent-purple/20 text-purple-300 font-mono border border-purple-500/20">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 단계 진행 바 */}
        <div className="flex gap-1">
          {STEP_NAMES.map((name, i) => {
            const stepNum   = i + 1
            const isDone    = data.currentStep > stepNum
            const isCurrent = data.currentStep === stepNum && isRunning
            const isPending = data.currentStep < stepNum
            return (
              <div key={i} className="flex-1 min-w-0">
                <div
                  className={`h-1 rounded-full transition-all duration-700 ${
                    isDone    ? 'bg-cyan-400' :
                    isCurrent ? 'bg-green-400 animate-pulse' :
                    'bg-zinc-700'
                  }`}
                />
                <p className={`text-[10px] font-mono mt-1 truncate ${
                  isDone ? 'text-cyan-500' : isCurrent ? 'text-green-400' : 'text-zinc-600'
                }`}>
                  {stepNum}. {name}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 에이전트 카드 그리드 ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENTS.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            data={data.agents[agent.id]}
            now={now}
          />
        ))}
      </div>

      {/* ── 라이브 로그 스트림 ────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span className="text-xs font-mono text-zinc-400 font-semibold tracking-wider">
              LIVE LOG
            </span>
          </div>
          <span className="text-xs font-mono text-zinc-600">
            {data.recentLogs.length} entries
          </span>
        </div>
        <div
          ref={logRef}
          className="h-64 overflow-y-auto p-4 space-y-1 font-mono text-xs"
        >
          {data.recentLogs.length === 0 ? (
            <p className="text-zinc-600 italic">로그가 없습니다. 에이전트가 실행되면 여기에 표시됩니다.</p>
          ) : (
            data.recentLogs.map((log, i) => {
              const isAgent   = /\[(?:ANALYST|PLANNER|CODER|REVIEWER|DEPLOYER)\]/.test(log)
              const isCycle   = /\[CYCLE\]/.test(log)
              const isError   = /\[ERROR\]/.test(log)
              const timestamp = log.slice(0, 19)
              const message   = log.slice(20)
              return (
                <div key={i} className="flex gap-3 leading-relaxed">
                  <span className="text-zinc-600 shrink-0">{timestamp}</span>
                  <span className={
                    isError  ? 'text-red-400' :
                    isCycle  ? 'text-yellow-400' :
                    isAgent  ? 'text-zinc-200' :
                    'text-zinc-500'
                  }>
                    {message}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── 사용 안내 ─────────────────────────────────────────────── */}
      {data.cycleStatus === 'idle' && (
        <div className="rounded-xl border border-zinc-800 p-5 bg-zinc-900/40">
          <h3 className="text-sm font-semibold text-zinc-300 mb-2">에이전트 실행 방법</h3>
          <div className="font-mono text-xs text-zinc-500 space-y-1">
            <p><span className="text-zinc-400">$</span> cd agents</p>
            <p><span className="text-zinc-400">$</span> npm run cycle    <span className="text-zinc-600"># 단일 사이클 실행</span></p>
            <p><span className="text-zinc-400">$</span> npm run start    <span className="text-zinc-600"># 무한 루프 (30분 간격)</span></p>
          </div>
        </div>
      )}
    </div>
  )
}
