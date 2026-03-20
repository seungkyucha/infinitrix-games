'use client'

import { useState } from 'react'
import type { CycleDoc } from '@/lib/devlog'

type Tab = 'spec' | 'review' | 'postmortem'

const TAB_LABELS: Record<Tab, string> = {
  spec:       '📋 기획서',
  review:     '🔍 리뷰',
  postmortem: '📝 포스트모템',
}

const VERDICT_COLORS: Record<string, string> = {
  APPROVED:          'text-green-400  bg-green-400/10  border-green-400/30',
  NEEDS_MINOR_FIX:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  NEEDS_MAJOR_FIX:   'text-red-400    bg-red-400/10    border-red-400/30',
}

export default function DevLogEntry({ doc }: { doc: CycleDoc }) {
  const [activeTab, setActiveTab] = useState<Tab>('postmortem')

  const availableTabs: Tab[] = (['postmortem', 'review', 'spec'] as Tab[]).filter(t => {
    if (t === 'spec')       return doc.hasSpec
    if (t === 'review')     return doc.hasReview
    if (t === 'postmortem') return doc.hasPostmortem
    return false
  })

  // 선택된 탭이 사용 불가하면 첫 번째 사용 가능한 탭으로
  const tab = availableTabs.includes(activeTab)
    ? activeTab
    : (availableTabs[0] ?? 'spec')

  const html =
    tab === 'spec'       ? doc.specHtml :
    tab === 'review'     ? doc.reviewHtml :
                           doc.postmortemHtml

  const verdictClass = VERDICT_COLORS[doc.verdict] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'

  return (
    <article className="rounded-xl border border-border-dim bg-bg-card overflow-hidden">
      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-border-dim bg-bg-secondary/40">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-text-muted">CYCLE #{doc.cycleNumber}</span>
              {doc.genre && (
                <span className="text-xs px-2 py-0.5 rounded-sm bg-accent-purple/20 text-purple-300 border border-purple-500/20 font-mono">
                  {doc.genre}
                </span>
              )}
              {doc.difficulty && (
                <span className="text-xs px-2 py-0.5 rounded-sm bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                  {doc.difficulty}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-text-primary">{doc.gameTitle}</h2>
            {doc.gameId && (
              <p className="text-xs font-mono text-text-muted mt-0.5">{doc.gameId}</p>
            )}
          </div>
          {doc.verdict && (
            <span className={`text-xs font-mono font-semibold px-3 py-1.5 rounded border tracking-wider shrink-0 ${verdictClass}`}>
              {doc.verdict}
            </span>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-border-dim px-2 pt-2">
        {(['postmortem', 'review', 'spec'] as Tab[]).map(t => {
          const available = availableTabs.includes(t)
          const isActive  = tab === t
          return (
            <button
              key={t}
              onClick={() => available && setActiveTab(t)}
              disabled={!available}
              className={`px-4 py-2 text-xs font-medium rounded-t-md transition-colors ${
                isActive
                  ? 'bg-bg-card-hover text-text-primary border-b-2 border-accent-purple'
                  : available
                    ? 'text-text-secondary hover:text-text-primary'
                    : 'text-text-muted opacity-40 cursor-not-allowed'
              }`}
            >
              {TAB_LABELS[t]}
              {!available && ' —'}
            </button>
          )
        })}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="px-6 py-5">
        {html ? (
          <div
            className="prose prose-invert prose-sm max-w-none
              prose-headings:text-text-primary prose-headings:font-bold
              prose-p:text-text-secondary prose-p:leading-relaxed
              prose-li:text-text-secondary
              prose-code:text-accent-cyan prose-code:bg-bg-secondary prose-code:px-1 prose-code:rounded
              prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-border-dim
              prose-a:text-accent-purple prose-a:no-underline hover:prose-a:underline
              prose-strong:text-text-primary
              prose-hr:border-border-dim
              prose-blockquote:border-accent-purple prose-blockquote:text-text-secondary"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="text-text-muted text-sm italic font-mono">
            문서가 아직 생성되지 않았습니다.
          </p>
        )}
      </div>
    </article>
  )
}
