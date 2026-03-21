'use client'

import { useEffect, useState, useRef } from 'react'
import { useTranslations } from '@/lib/i18n-client'

type AgentStatus = 'idle' | 'running' | 'completed' | 'error'
type CycleStatus = 'idle' | 'running' | 'completed' | 'error'

interface AgentState {
  status:          AgentStatus
  currentAction:   string
  currentActionEn?: string
  startedAt:       string | null
  completedAt:     string | null
  toolCalls:       number
  logs:            string[]
  logsEn?:         string[]
}

interface StatusData {
  lastUpdated:    string
  cycleNumber:    number
  cycleStatus:    CycleStatus
  currentStep:    number
  totalSteps:     number
  stepName:       string
  stepNameEn?:    string
  gameTitle:      string
  gameId:         string
  gameGenre:      string[]
  agents: {
    analyst:    AgentState
    planner:    AgentState
    designer:   AgentState
    coder:      AgentState
    reviewer:   AgentState
    postmortem: AgentState
    deployer:   AgentState
  }
  recentLogs:     string[]
  recentLogsEn?:  string[]
}

const AGENT_IDS: (keyof StatusData['agents'])[] = [
  'analyst', 'planner', 'designer', 'coder', 'reviewer', 'postmortem', 'deployer',
]

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

function elapsed(startedAt: string | null): string {
  if (!startedAt) return ''
  const ms = Date.now() - new Date(startedAt).getTime()
  const s  = Math.floor(ms / 1000)
  if (s < 60)  return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60)  return `${m}m ${s % 60}s`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

function AgentCard({ agentId, label, role, step, data }: {
  agentId: string; label: string; role: string; step: number; data: AgentState
}) {
  const { t, locale } = useTranslations()
  const useEn = locale !== 'ko'
  const action = (useEn ? data.currentActionEn : null) || data.currentAction
  const logs = (useEn ? data.logsEn : null) ?? data.logs
  return (
    <div className={`rounded-lg border p-4 flex flex-col gap-3 transition-all duration-500 ${statusBg(data.status)}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500">STEP {step}</span>
            {data.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
          </div>
          <h3 className="font-bold text-white mt-0.5">{label}</h3>
          <p className="text-xs text-zinc-500 font-mono">{role}</p>
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
      <div className="min-h-[2rem]">
        {action ? (
          <p className="text-xs text-zinc-300 font-mono leading-relaxed break-all line-clamp-2">{action}</p>
        ) : (
          <p className="text-xs text-zinc-600 font-mono italic">{t.dashboard.waiting}</p>
        )}
      </div>
      {logs.length > 0 && (
        <div className="space-y-0.5 border-t border-white/5 pt-2">
          {logs.slice(0, 4).map((log, i) => (
            <p key={i} className="text-[10px] font-mono leading-relaxed break-all"
               style={{ color: i === 0 ? '#a1a1aa' : `rgba(161,161,170,${0.4 - i * 0.08})` }}>
              › {log}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData]       = useState<StatusData | null>(null)
  const [tick, setTick]       = useState(0)
  const [live, setLive]       = useState(false)
  const logRef                = useRef<HTMLDivElement>(null)
  const { t, locale }        = useTranslations()

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
        const res = await fetch('/api/agent-status', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled) { setData(json); setLive(true) }
      } catch { if (!cancelled) setLive(false) }
    }
    poll()
    const id = setInterval(() => { poll(); setTick(t => t + 1) }, 2000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [data?.recentLogs.length])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-sm animate-pulse">{t.dashboard.connecting}</div>
      </div>
    )
  }

  const isRunning = data.cycleStatus === 'running'
  const useEn = locale !== 'ko'
  const agentLabels = t.dashboard.agents
  const displayStepName = (useEn ? data.stepNameEn : null) || data.stepName
  const displayLogs = (useEn ? data.recentLogsEn : null) ?? data.recentLogs
  const ROLES = ['Data Analyst', 'Game Planner', 'Art Director', 'Full-stack Dev', 'QA Reviewer', 'Tech Writer', 'DevOps Engineer']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{t.dashboard.title}</h1>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${live ? 'bg-green-400 animate-pulse' : 'bg-zinc-600'}`} />
              <span className={`text-xs font-mono ${live ? 'text-green-400' : 'text-zinc-500'}`}>
                {live ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
          <p className="text-sm text-zinc-500 mt-1 font-mono">Agent Activity Monitor</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-600 font-mono">{t.dashboard.lastUpdate}</p>
          <p className="text-xs text-zinc-400 font-mono">
            {new Date(data.lastUpdated).toLocaleTimeString(locale)}
          </p>
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${statusBg(data.cycleStatus)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {data.cycleStatus === 'idle' ? <span className="text-2xl">💤</span> :
             data.cycleStatus === 'running' ? <span className="text-2xl animate-spin-slow">⚙️</span> :
             data.cycleStatus === 'completed' ? <span className="text-2xl">✅</span> :
             <span className="text-2xl">❌</span>}
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold tracking-widest ${statusColor(data.cycleStatus)}`}>
                  {statusLabel(data.cycleStatus)}
                </span>
                {data.cycleNumber > 0 && <span className="text-xs text-zinc-500 font-mono">· CYCLE #{data.cycleNumber}</span>}
              </div>
              {data.cycleStatus === 'idle' ? (
                <p className="text-white font-semibold mt-0.5">{t.dashboard.waiting}</p>
              ) : (
                <p className="text-white font-semibold mt-0.5">
                  {data.gameTitle || '...'}
                  {data.gameId && <span className="text-zinc-400 font-normal text-sm ml-2">({data.gameId})</span>}
                </p>
              )}
            </div>
          </div>
          {data.cycleStatus === 'running' && (
            <div className="text-right">
              <p className="text-xs text-zinc-500 font-mono">{t.dashboard.currentStep}</p>
              <p className="text-sm text-white font-mono font-semibold">
                {data.currentStep}/{data.totalSteps} — {displayStepName}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-1">
          {AGENT_IDS.map((id, i) => {
            const stepNum = i + 1
            const isDone    = data.currentStep > stepNum
            const isCurrent = data.currentStep === stepNum && isRunning
            const label = agentLabels[id as keyof typeof agentLabels]
            return (
              <div key={id} className="flex-1 min-w-0">
                <div className={`h-1 rounded-full transition-all duration-700 ${
                  isDone ? 'bg-cyan-400' : isCurrent ? 'bg-green-400 animate-pulse' : 'bg-zinc-700'
                }`} />
                <p className={`text-[10px] font-mono mt-1 truncate ${
                  isDone ? 'text-cyan-500' : isCurrent ? 'text-green-400' : 'text-zinc-600'
                }`}>{stepNum}. {label}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENT_IDS.map((id, i) => (
          <AgentCard
            key={id}
            agentId={id}
            label={agentLabels[id as keyof typeof agentLabels]}
            role={ROLES[i]}
            step={i + 1}
            data={data.agents[id]}
          />
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span className="text-xs font-mono text-zinc-400 font-semibold tracking-wider">LIVE LOG</span>
          </div>
          <span className="text-xs font-mono text-zinc-600">{displayLogs.length} entries</span>
        </div>
        <div ref={logRef} className="h-64 overflow-y-auto p-4 space-y-1 font-mono text-xs">
          {displayLogs.length === 0 ? (
            <p className="text-zinc-600 italic">{t.dashboard.noLogs}</p>
          ) : (
            displayLogs.map((log, i) => {
              const isAgent = /\[(?:ANALYST|PLANNER|DESIGNER|CODER|REVIEWER|DEPLOYER|POSTMORTEM)\]/.test(log)
              const isCycle = /\[CYCLE\]/.test(log)
              const isError = /\[ERROR\]/.test(log)
              const timestamp = log.slice(0, 19)
              const message   = log.slice(20)
              return (
                <div key={i} className="flex gap-3 leading-relaxed">
                  <span className="text-zinc-600 shrink-0">{timestamp}</span>
                  <span className={isError ? 'text-red-400' : isCycle ? 'text-yellow-400' : isAgent ? 'text-zinc-200' : 'text-zinc-500'}>
                    {message}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
