'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type AgentStatus = 'idle' | 'running' | 'completed' | 'error'
type CycleStatus = 'idle' | 'running' | 'completed' | 'error'

interface AgentState { status: AgentStatus; currentAction: string; toolCalls: number }

interface StatusData {
  cycleNumber: number
  cycleStatus: CycleStatus
  currentStep: number
  totalSteps:  number
  stepName:    string
  gameTitle:   string
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

const AGENTS: { id: keyof StatusData['agents']; label: string }[] = [
  { id: 'analyst',    label: '분석' },
  { id: 'planner',    label: '기획' },
  { id: 'coder',      label: '코딩' },
  { id: 'reviewer',   label: '리뷰' },
  { id: 'postmortem', label: 'PM' },
  { id: 'deployer',   label: '배포' },
]

function dotClass(status: AgentStatus) {
  switch (status) {
    case 'running':   return 'bg-green-400 animate-pulse shadow-[0_0_4px_#4ade80]'
    case 'completed': return 'bg-cyan-400   shadow-[0_0_4px_#22d3ee]'
    case 'error':     return 'bg-red-400'
    default:          return 'bg-zinc-700'
  }
}

export default function MiniAgentLog() {
  const [data,  setData]  = useState<StatusData | null>(null)
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    let dead = false
    const poll = async () => {
      try {
        const r = await fetch('/api/agent-status', { cache: 'no-store' })
        if (r.ok && !dead) setData(await r.json())
      } catch {}
    }
    poll()
    const pid = setInterval(poll, 3000)
    const bid = setInterval(() => setBlink(b => !b), 550)
    return () => { dead = true; clearInterval(pid); clearInterval(bid) }
  }, [])

  const isRunning  = data?.cycleStatus === 'running'
  const latestLog  = data?.recentLogs?.[0]?.slice(20) ?? ''

  return (
    <Link href="/dashboard" aria-label="에이전트 현황판" className="block group">
      <div className="
        flex items-center gap-0
        rounded-lg border border-zinc-800 bg-zinc-950/70 backdrop-blur-sm
        overflow-hidden font-mono text-[10px]
        transition-all duration-300
        hover:border-zinc-600
        group-hover:shadow-[0_0_20px_rgba(108,60,247,0.1)]
      ">

        {/* ── 왼쪽: 타이틀 + LIVE 뱃지 ────────────────────────── */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-zinc-900/60 border-r border-zinc-800 shrink-0">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500/40" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/40" />
            <span className="w-2 h-2 rounded-full bg-green-500/40" />
          </div>
          <span className="text-zinc-500 tracking-[0.18em] text-[9px]">AGENTS</span>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-zinc-700'}`} />
            <span className={`font-semibold tracking-wider ${isRunning ? 'text-green-400' : 'text-zinc-600'}`}>
              {isRunning ? 'LIVE' : 'IDLE'}
            </span>
          </div>
        </div>

        {/* ── 에이전트 도트 ────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-r border-zinc-800 shrink-0">
          {AGENTS.map(({ id, label }) => {
            const status = data?.agents[id]?.status ?? 'idle'
            return (
              <div key={id} className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${dotClass(status)}`} />
                <span className={`text-[9px] ${status === 'running' ? 'text-green-400' : status === 'completed' ? 'text-cyan-500' : 'text-zinc-600'}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* ── 사이클 / 최신 로그 (남은 공간 전부) ─────────────── */}
        <div className="flex items-center gap-2 px-4 py-2.5 flex-1 min-w-0">
          {data && data.cycleStatus !== 'idle' ? (
            <>
              <span className="text-zinc-500 shrink-0">
                #{data.cycleNumber}
              </span>
              <span className="text-zinc-700 shrink-0">·</span>
              <span className="text-green-400/80 shrink-0 hidden sm:inline">
                {data.stepName || '준비 중'}
              </span>
              {latestLog && (
                <>
                  <span className="text-zinc-700 shrink-0 hidden sm:inline">›</span>
                  <span className="text-zinc-400 truncate">{latestLog}</span>
                </>
              )}
            </>
          ) : (
            <span className="text-zinc-600">
              에이전트 대기 중
              <span className={`ml-px transition-opacity duration-100 ${blink ? 'opacity-100' : 'opacity-0'}`}>▋</span>
            </span>
          )}
        </div>

        {/* ── 오른쪽: 현황판 링크 ──────────────────────────────── */}
        <div className="px-3.5 py-2.5 border-l border-zinc-800 shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-colors">
          현황판 →
        </div>
      </div>
    </Link>
  )
}
