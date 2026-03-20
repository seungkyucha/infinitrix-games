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
  stepName:    string
  gameTitle:   string
  agents: {
    analyst:  AgentState
    planner:  AgentState
    coder:    AgentState
    reviewer: AgentState
    deployer: AgentState
  }
  recentLogs: string[]
}

const AGENTS = [
  { id: 'analyst'  as const, label: '분석' },
  { id: 'planner'  as const, label: '기획' },
  { id: 'coder'    as const, label: '코딩' },
  { id: 'reviewer' as const, label: '리뷰' },
  { id: 'deployer' as const, label: '배포' },
]

function dot(status: AgentStatus) {
  switch (status) {
    case 'running':   return 'bg-green-400 animate-pulse shadow-[0_0_5px_#4ade80]'
    case 'completed': return 'bg-cyan-400   shadow-[0_0_5px_#22d3ee]'
    case 'error':     return 'bg-red-400'
    default:          return 'bg-zinc-700'
  }
}

function dotText(status: AgentStatus) {
  switch (status) {
    case 'running':   return 'text-green-400'
    case 'completed': return 'text-cyan-500'
    default:          return 'text-zinc-600'
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

  const isRunning = data?.cycleStatus === 'running'
  const logs      = data?.recentLogs.slice(0, 14) ?? []

  return (
    <Link href="/dashboard" className="block group" aria-label="에이전트 현황판">
      <div
        className="
          rounded-xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm
          overflow-hidden font-mono text-xs
          transition-all duration-300
          hover:border-zinc-600
          shadow-[0_0_40px_rgba(108,60,247,0.04)]
          group-hover:shadow-[0_0_40px_rgba(108,60,247,0.14)]
        "
      >
        {/* ── 타이틀 바 ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/60 border-b border-zinc-800">
          {/* 맥 트래픽라이트 */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            <span className="text-[10px] text-zinc-500 tracking-[0.2em] pl-1">AGENT CONSOLE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-zinc-700'}`} />
            <span className={`text-[10px] tracking-wider font-semibold ${isRunning ? 'text-green-400' : 'text-zinc-600'}`}>
              {isRunning ? 'LIVE' : 'IDLE'}
            </span>
          </div>
        </div>

        {/* ── 사이클 상태 ────────────────────────────────────── */}
        <div className="px-3.5 pt-2.5 pb-2 border-b border-zinc-800/60">
          {data && data.cycleStatus !== 'idle' ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-zinc-600">CYCLE</span>
                <span className="text-zinc-300 font-semibold">#{data.cycleNumber}</span>
                <span className="text-zinc-700">·</span>
                <span className="text-green-400 truncate">{data.stepName || '준비 중'}</span>
                <span className="text-zinc-600 ml-auto shrink-0">[{data.currentStep}/5]</span>
              </div>
              {data.gameTitle && (
                <p className="text-cyan-400/70 truncate text-[10px]">▸ {data.gameTitle}</p>
              )}
            </div>
          ) : (
            <p className="text-zinc-600 text-[10px]">
              에이전트 대기 중
              <span className={`ml-px transition-opacity duration-100 ${blink ? 'opacity-100' : 'opacity-0'}`}>▋</span>
            </p>
          )}
        </div>

        {/* ── 에이전트 상태 도트 ──────────────────────────────── */}
        <div className="flex border-b border-zinc-800/60 px-3.5 py-2.5">
          {AGENTS.map(({ id, label }) => {
            const status = data?.agents[id]?.status ?? 'idle'
            return (
              <div key={id} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${dot(status)}`} />
                <span className={`text-[9px] font-semibold tracking-tight ${dotText(status)}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* ── 라이브 로그 ─────────────────────────────────────── */}
        <div className="relative h-[168px] overflow-hidden">
          <div className="absolute inset-0 px-3.5 py-2.5 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {logs.length === 0 ? (
              <p className="text-zinc-700 italic text-[10px] pt-0.5">
                로그가 없습니다
                <span className={`ml-px ${blink ? 'opacity-100' : 'opacity-0'}`}>_</span>
              </p>
            ) : (
              logs.map((log, i) => {
                const msg      = log.slice(20)
                const isLatest = i === 0
                const isAgent  = /\[(?:ANALYST|PLANNER|CODER|REVIEWER|DEPLOYER)\]/.test(msg)
                const isCycle  = /\[CYCLE\]/.test(msg)
                const alpha    = Math.max(0.12, 0.85 - i * 0.065)
                return (
                  <p
                    key={i}
                    className="leading-relaxed break-all text-[10px] transition-colors duration-300"
                    style={{
                      color: isLatest
                        ? (isCycle ? '#fbbf24' : isAgent ? '#d4d4d8' : '#a1a1aa')
                        : `rgba(161,161,170,${alpha})`,
                    }}
                  >
                    {msg}
                  </p>
                )
              })
            )}
          </div>
          {/* 하단 페이드 */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-950/95 to-transparent pointer-events-none" />
        </div>

        {/* ── 푸터 ───────────────────────────────────────────── */}
        <div className="px-3.5 py-2 border-t border-zinc-800/60 flex items-center justify-between bg-zinc-900/30">
          <span className="text-zinc-500 text-[10px] group-hover:text-zinc-300 transition-colors">
            현황판 전체 보기 →
          </span>
          <span className="text-zinc-700 text-[10px]">3s</span>
        </div>
      </div>
    </Link>
  )
}
