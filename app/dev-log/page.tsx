import { Suspense }  from 'react'
import { getSidebarEntries, getCycleTabInfo, getPlatformWisdomHtml } from '@/lib/devlog'
import DevLogSidebar from '@/components/DevLogSidebar'
import DevLogTabs    from '@/components/DevLogTabs'
import { getTranslations } from '@/lib/i18n'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata() {
  const { t } = await getTranslations()
  return { title: `${t.devlog.title} — InfiniTriX`, description: t.devlog.desc }
}

interface Props {
  searchParams: Promise<{ doc?: string; tab?: string }>
}

export default async function DevLogPage({ searchParams }: Props) {
  const { doc: docParam, tab: tabParam } = await searchParams
  const entries    = getSidebarEntries()
  const defaultId  = entries[0]?.id ?? 'wisdom'
  const activeId   = docParam ?? defaultId
  const { t, locale } = await getTranslations()

  let content: { type: 'wisdom'; html: string }
    | { type: 'cycle';  info: NonNullable<ReturnType<typeof getCycleTabInfo>>; activeTab: string; html: string }
    | { type: 'empty' }

  if (activeId === 'wisdom') {
    const html = getPlatformWisdomHtml(locale)
    content = html ? { type: 'wisdom', html } : { type: 'empty' }
  } else {
    const m = activeId.match(/^cycle-(\d+)$/)
    if (m) {
      const info = getCycleTabInfo(parseInt(m[1], 10), locale)
      if (info && info.tabs.length > 0) {
        const activeTab = (tabParam && info.tabs.some(t => t.key === tabParam)) ? tabParam : info.tabs[0].key
        const tabData   = info.tabs.find(t => t.key === activeTab)!
        content = { type: 'cycle', info, activeTab, html: tabData.html }
      } else {
        content = { type: 'empty' }
      }
    } else {
      content = { type: 'empty' }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-2xl">📓</span>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">{t.devlog.title}</h1>
          <span className="text-xs font-mono text-text-muted border border-border-dim rounded px-2 py-0.5">
            {t.devlog.cyclesCount.replace('{count}', String(entries.filter(e => e.id.startsWith('cycle-')).length))}
          </span>
        </div>
        <p className="text-text-secondary text-xs max-w-xl">{t.devlog.desc}</p>
      </div>

      <div className="md:hidden mb-3">
        <Suspense><DevLogSidebar entries={entries} defaultDoc={defaultId} /></Suspense>
      </div>

      <div className="md:flex md:gap-5 md:items-start">
        <aside className="hidden md:block w-52 shrink-0 sticky top-20">
          <div className="rounded-xl border border-border-dim bg-bg-card overflow-hidden">
            <div className="px-3 py-2.5 border-b border-border-dim bg-bg-secondary/60">
              <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">{t.devlog.docList}</span>
            </div>
            <div className="p-2">
              <Suspense><DevLogSidebar entries={entries} defaultDoc={defaultId} /></Suspense>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {content.type === 'wisdom' && <WisdomViewer html={content.html} title={t.devlog.wisdom} />}
          {content.type === 'cycle' && (
            <CycleViewer info={content.info} activeTab={content.activeTab} html={content.html} docId={activeId} />
          )}
          {content.type === 'empty' && <EmptyDoc t={t} />}
        </main>
      </div>
    </div>
  )
}

const VERDICT_STYLE: Record<string, string> = {
  APPROVED:        'text-green-400  bg-green-400/10  border-green-400/30',
  NEEDS_MINOR_FIX: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  NEEDS_MAJOR_FIX: 'text-red-400    bg-red-400/10    border-red-400/30',
}

const PROSE = `prose prose-invert prose-sm max-w-none overflow-x-auto
  prose-headings:text-text-primary prose-headings:font-bold prose-headings:tracking-tight
  prose-h1:text-xl prose-h2:text-base prose-h3:text-sm
  prose-p:text-text-secondary prose-p:leading-relaxed prose-li:text-text-secondary
  prose-code:text-accent-cyan prose-code:bg-bg-secondary prose-code:px-1.5 prose-code:rounded prose-code:text-xs
  prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-border-dim prose-pre:rounded-lg
  prose-a:text-accent-purple prose-a:no-underline hover:prose-a:underline
  prose-strong:text-text-primary prose-hr:border-border-dim
  prose-blockquote:border-l-4 prose-blockquote:border-accent-purple/50 prose-blockquote:text-text-secondary prose-blockquote:not-italic
  prose-table:text-text-secondary prose-th:text-text-primary prose-th:border-border-dim prose-td:border-border-dim`

function CycleViewer({ info, activeTab, html, docId }: {
  info: { cycleNumber: number; gameTitle: string; verdict: string; tabs: { key: string; label: string; icon: string }[] }
  activeTab: string; html: string; docId: string
}) {
  return (
    <article className="rounded-xl border border-border-dim bg-bg-card overflow-hidden">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border-dim bg-bg-secondary/40 flex items-center gap-3 flex-wrap">
        <span className="text-lg">🎮</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-text-muted">CYCLE #{info.cycleNumber}</span>
            <h2 className="text-sm font-bold text-text-primary">{info.gameTitle}</h2>
          </div>
        </div>
        {info.verdict && (
          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border tracking-wider shrink-0 whitespace-nowrap ${VERDICT_STYLE[info.verdict] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
            {info.verdict.replace(/^NEEDS_/, '').replace(/_/g, ' ')}
          </span>
        )}
      </div>
      <div className="px-4 md:px-6 pt-3 border-b border-border-dim bg-bg-secondary/20">
        <Suspense>
          <DevLogTabs tabs={info.tabs.map(t => ({ key: t.key, label: t.label, icon: t.icon }))} activeTab={activeTab} docId={docId} />
        </Suspense>
      </div>
      <div className="px-4 md:px-6 py-4 md:py-6">
        <div className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  )
}

function WisdomViewer({ html, title }: { html: string; title: string }) {
  return (
    <article className="rounded-xl border border-border-dim bg-bg-card overflow-hidden">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border-dim bg-bg-secondary/40 flex items-center gap-3">
        <span className="text-lg">🧠</span>
        <h2 className="text-sm font-bold text-text-primary">{title}</h2>
      </div>
      <div className="px-4 md:px-6 py-4 md:py-6">
        <div className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  )
}

function EmptyDoc({ t }: { t: { devlog: { selectDoc: string; selectDocDesc: string } } }) {
  return (
    <div className="rounded-xl border border-border-dim bg-bg-card flex flex-col items-center justify-center py-24 text-center">
      <div className="text-4xl mb-4">📄</div>
      <p className="text-text-primary font-semibold mb-1">{t.devlog.selectDoc}</p>
      <p className="text-text-muted text-xs">{t.devlog.selectDocDesc}</p>
    </div>
  )
}
