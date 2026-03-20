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
    designer:   AgentState
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
  { id: 'designer',   label: '디자인' },
  { id: 'coder',      label: '코딩' },
  { id: 'reviewer',   label: '리뷰' },
  { id: 'postmortem', label: 'PM'   },
  { id: 'deployer',   label: '배포' },
]

function dotClass(status: AgentStatus) {
  switch (status) {
    case 'running':   return 'bg-green-400 animate-pulse shadow-[0_0_5px_#4ade80]'
    case 'completed': return 'bg-cyan-400   shadow-[0_0_5px_#22d3ee]'
    case 'error':     return 'bg-red-500'
    default:          return 'bg-zinc-700'
  }
}

function logColor(msg: string, idx: number) {
  if (idx > 0) return `rgba(161,161,170,${Math.max(0.2, 0.6 - idx * 0.18)})`
  if (/\[CYCLE\]/.test(msg))  return '#fbbf24'
  if (/\[ERROR\]/.test(msg))  return '#f87171'
  if (/\[(?:ANALYST|PLANNER|CODER|REVIEWER|DEPLOYER|POSTMORTEM)\]/.test(msg)) return '#d4d4d8'
  return '#a1a1aa'
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

  const isRunning = data?.cycleStatus === 'running'
  const logs      = data?.recentLogs?.slice(0, 4) ?? []

  return (
    <Link href="/dashboard" aria-label="에이전트 현황판" className="block group">
      <div className={`
        rounded-xl overflow-hidden font-mono text-[11px]
        border transition-all duration-300
        ${isRunning
          ? 'border-green-500/30 shadow-[0_0_24px_rgba(74,222,128,0.08)] group-hover:shadow-[0_0_32px_rgba(74,222,128,0.15)]'
          : 'border-zinc-800     shadow-[0_0_24px_rgba(108,60,247,0.05)] group-hover:shadow-[0_0_32px_rgba(108,60,247,0.12)] group-hover:border-zinc-700'
        }
        bg-zinc-950/80 backdrop-blur-sm
      `}>

        {/* ── 상단 바: 타이틀 · 에이전트 도트 · 사이클 정보 ──────── */}
        <div className="flex items-center gap-0 border-b border-zinc-800/80">

          {/* 맥 버튼 + 타이틀 */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-zinc-900/50 border-r border-zinc-800/80 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            <span className="text-zinc-500 tracking-[0.2em] text-[9px] font-semibold">AGENT CONSOLE</span>
          </div>

          {/* 에이전트 도트 */}
          <div className="flex items-center gap-4 px-5 py-3 border-r border-zinc-800/80 shrink-0">
            {AGENTS.map(({ id, label }) => {
              const status = data?.agents[id]?.status ?? 'idle'
              return (
                <div key={id} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full transition-all duration-500 ${dotClass(status)}`} />
                  <span className={`text-[9px] font-medium ${
                    status === 'running'   ? 'text-green-400' :
                    status === 'completed' ? 'text-cyan-500'  : 'text-zinc-600'
                  }`}>{label}</span>
                </div>
              )
            })}
          </div>

          {/* 사이클 정보 */}
          <div className="flex items-center gap-2 px-4 py-3 flex-1 min-w-0">
            {data && data.cycleStatus !== 'idle' ? (
              <>
                <span className="text-zinc-500 shrink-0 text-[10px]">CYCLE</span>
                <span className="text-white font-semibold shrink-0">#{data.cycleNumber}</span>
                <span className="text-zinc-700 shrink-0">·</span>
                <span className={`shrink-0 truncate max-w-[160px] ${isRunning ? 'text-green-400' : 'text-zinc-400'}`}>
                  {data.stepName || '준비 중'}
                </span>
                {data.gameTitle && (
                  <>
                    <span className="text-zinc-700 shrink-0">·</span>
                    <span className="text-cyan-400/70 truncate text-[10px]">{data.gameTitle}</span>
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

          {/* LIVE 뱃지 */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-l border-zinc-800/80 shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-zinc-700'}`} />
            <span className={`font-semibold tracking-widest text-[9px] ${isRunning ? 'text-green-400' : 'text-zinc-600'}`}>
              {isRunning ? 'LIVE' : 'IDLE'}
            </span>
          </div>
        </div>

        {/* ── 하단: 최근 로그 3줄 ─────────────────────────────────── */}
        <div className="relative px-4 py-2.5 space-y-1 min-h-[62px]">
          {logs.length === 0 ? (
            <p className="text-zinc-700 italic text-[10px] leading-relaxed pt-0.5">
              로그가 없습니다. 에이전트가 실행되면 여기에 표시됩니다.
              <span className={`ml-px transition-opacity duration-100 ${blink ? 'opacity-100' : 'opacity-0'}`}>_</span>
            </p>
          ) : (
            logs.map((log, i) => {
              const ts  = log.slice(0, 19)
              const msg = log.slice(20)
              return (
                <div key={i} className="flex items-baseline gap-2 leading-relaxed">
                  <span className="text-[9px] text-zinc-700 shrink-0">{ts.slice(11)}</span>
                  <span
                    className="text-[10px] truncate transition-colors duration-300"
                    style={{ color: logColor(msg, i) }}
                  >
                    {msg}
                  </span>
                </div>
              )
            })
          )}
          {/* 우측 페이드 */}
          <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-zinc-950/80 to-transparent pointer-events-none" />
        </div>

        {/* ── 푸터 ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800/60 bg-zinc-900/30">
          <span className="text-zinc-600 text-[9px] tracking-wider">
            {data?.recentLogs?.length ?? 0} log entries
          </span>
          <span className="text-zinc-500 text-[10px] group-hover:text-zinc-200 transition-colors duration-200">
            현황판 전체 보기 →
          </span>
        </div>
      </div>
    </Link>
  )
}
