'use client'

import { useState }                   from 'react'
import { useRouter, useSearchParams }  from 'next/navigation'
import type { DocEntry }               from '@/lib/devlog'

const VERDICT_BADGE: Record<string, string> = {
  APPROVED:        'bg-green-500/20  text-green-400  border-green-500/30',
  NEEDS_MINOR_FIX: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  NEEDS_MAJOR_FIX: 'bg-red-500/20    text-red-400    border-red-500/30',
}

const VERDICT_SHORT: Record<string, string> = {
  APPROVED:        'PASS',
  NEEDS_MINOR_FIX: 'MINOR',
  NEEDS_MAJOR_FIX: 'MAJOR',
}

interface Props {
  entries:    DocEntry[]
  defaultDoc: string
}

export default function DevLogSidebar({ entries, defaultDoc }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const activeId     = searchParams.get('doc') ?? defaultDoc
  const [open, setOpen] = useState(false)

  const activeEntry = entries.find(e => e.id === activeId)

  function select(id: string) {
    router.push(`/dev-log?doc=${id}`, { scroll: false })
    setOpen(false)
  }

  const groups = buildGroups(entries)
  const navList = (
    <nav className="flex flex-col gap-1 text-sm">
      {groups.meta.map(e => (
        <SidebarItem key={e.id} entry={e} active={activeId === e.id} onClick={() => select(e.id)} />
      ))}
      {groups.cycles.map(({ cycleNumber, gameTitle, docs }) => (
        <div key={cycleNumber} className="mt-4">
          <div className="flex items-center gap-2 px-3 mb-1">
            <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">
              Cycle #{cycleNumber}
            </span>
            <div className="flex-1 h-px bg-border-dim" />
          </div>
          <p className="px-3 mb-2 text-[11px] text-text-secondary truncate font-medium">
            {gameTitle}
          </p>
          {docs.map(e => (
            <SidebarItem key={e.id} entry={e} active={activeId === e.id} onClick={() => select(e.id)} indent />
          ))}
        </div>
      ))}
      {entries.length === 0 && (
        <p className="px-3 py-4 text-xs text-text-muted italic">아직 문서가 없습니다.</p>
      )}
    </nav>
  )

  return (
    <>
      {/* ── 모바일: 상단 토글 바 ─────────────────────── */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border-dim bg-bg-card text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base shrink-0">{activeEntry?.icon ?? '📄'}</span>
            <span className="text-xs font-medium text-text-primary truncate">
              {activeEntry
                ? (activeEntry.gameTitle
                    ? `${activeEntry.gameTitle} — ${activeEntry.label}`
                    : activeEntry.label)
                : '문서 선택'}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="mt-1 rounded-xl border border-border-dim bg-bg-card overflow-hidden shadow-lg">
            <div className="px-3 py-2 border-b border-border-dim bg-bg-secondary/60">
              <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">문서 목록</span>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto">
              {navList}
            </div>
          </div>
        )}
      </div>

      {/* ── 데스크톱: 고정 사이드바 ──────────────────── */}
      <div className="hidden md:block">
        {navList}
      </div>
    </>
  )
}

// ── 아이템 ──────────────────────────────────────────────────────────────────

function SidebarItem({
  entry,
  active,
  onClick,
  indent = false,
}: {
  entry:   DocEntry
  active:  boolean
  onClick: () => void
  indent?: boolean
}) {
  const verdict = entry.verdict
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors
        ${indent ? 'pl-5' : ''}
        ${active
          ? 'bg-accent-purple/15 text-text-primary border border-accent-purple/30'
          : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover border border-transparent'
        }`}
    >
      <span className="text-sm shrink-0">{entry.icon}</span>
      <span className="flex-1 text-xs font-medium truncate">{entry.label}</span>
      {verdict && (
        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 max-w-14 truncate ${VERDICT_BADGE[verdict] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
          {VERDICT_SHORT[verdict] ?? verdict.replace(/^NEEDS_/, '').replace(/_/g, ' ')}
        </span>
      )}
    </button>
  )
}

// ── 그룹 빌더 ───────────────────────────────────────────────────────────────

interface CycleGroup {
  cycleNumber: number
  gameTitle:   string
  docs:        DocEntry[]
}

function buildGroups(entries: DocEntry[]) {
  const meta: DocEntry[]          = []
  const cycleMap = new Map<number, CycleGroup>()

  for (const e of entries) {
    if (e.group === 'meta') { meta.push(e); continue }
    const n = e.cycleNumber!
    if (!cycleMap.has(n)) {
      cycleMap.set(n, { cycleNumber: n, gameTitle: e.gameTitle ?? `사이클 #${n}`, docs: [] })
    }
    cycleMap.get(n)!.docs.push(e)
  }

  const cycles = Array.from(cycleMap.values()).sort((a, b) => b.cycleNumber - a.cycleNumber)
  return { meta, cycles }
}
