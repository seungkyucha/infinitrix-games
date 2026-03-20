'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export interface TabDef {
  key:   string
  label: string
  icon:  string
}

interface Props {
  tabs:      TabDef[]
  activeTab: string
  docId:     string      // e.g. 'cycle-3'
}

export default function DevLogTabs({ tabs, activeTab, docId }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()

  function select(tabKey: string) {
    router.push(`/dev-log?doc=${docId}&tab=${tabKey}`, { scroll: false })
  }

  if (tabs.length <= 1) return null

  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-px">
      {tabs.map(t => {
        const isActive = t.key === activeTab
        return (
          <button
            key={t.key}
            onClick={() => select(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border border-b-0 whitespace-nowrap transition-colors
              ${isActive
                ? 'bg-bg-card text-text-primary border-border-dim'
                : 'bg-transparent text-text-muted border-transparent hover:text-text-secondary hover:bg-bg-card/50'
              }`}
          >
            <span className="text-sm">{t.icon}</span>
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
