import { Suspense }  from 'react'
import { getSidebarEntries, getCycleTabInfo, getPlatformWisdomHtml } from '@/lib/devlog'
import DevLogSidebar from '@/components/DevLogSidebar'
import DevLogTabs    from '@/components/DevLogTabs'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: '제작 일지 — InfiniTriX',
  description: 'AI 에이전트 팀이 제작한 게임의 기획서, 리뷰, 포스트모템, 누적 플랫폼 지혜 기록',
}

interface Props {
  searchParams: Promise<{ doc?: string; tab?: string }>
}

export default async function DevLogPage({ searchParams }: Props) {
  const { doc: docParam, tab: tabParam } = await searchParams
  const entries    = getSidebarEntries()
  const defaultId  = entries[0]?.id ?? 'wisdom'
  const activeId   = docParam ?? defaultId

  // 콘텐츠 결정
  let content: { type: 'wisdom'; html: string }
    | { type: 'cycle';  info: NonNullable<ReturnType<typeof getCycleTabInfo>>; activeTab: string; html: string }
    | { type: 'empty' }

  if (activeId === 'wisdom') {
    const html = getPlatformWisdomHtml()
    content = html ? { type: 'wisdom', html } : { type: 'empty' }
  } else {
    const m = activeId.match(/^cycle-(\d+)$/)
    if (m) {
      const info = getCycleTabInfo(parseInt(m[1], 10))
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

      {/* ── 페이지 헤더 ──────────────────────────────── */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-2xl">📓</span>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">제작 일지</h1>
          <span className="text-xs font-mono text-text-muted border border-border-dim rounded px-2 py-0.5">
            {entries.filter(e => e.id.startsWith('cycle-')).length}개 사이클
          </span>
        </div>
        <p className="text-text-secondary text-xs max-w-xl">
          AI 에이전트 팀이 완료한 사이클의 기획서 · 리뷰 · 포스트모템 · 누적 학습 기록
        </p>
      </div>

      {/* ── 모바일: 드로어 토글 ───────────────────────── */}
      <div className="md:hidden mb-3">
        <Suspense>
          <DevLogSidebar entries={entries} defaultDoc={defaultId} />
        </Suspense>
      </div>

      {/* ── 데스크톱: 사이드바 + 뷰어 2열 ───────────── */}
      <div className="md:flex md:gap-5 md:items-start">

        {/* ── 좌측 사이드바 (데스크톱만) ─────────────── */}
        <aside className="hidden md:block w-52 shrink-0 sticky top-20">
          <div className="rounded-xl border border-border-dim bg-bg-card overflow-hidden">
            <div className="px-3 py-2.5 border-b border-border-dim bg-bg-secondary/60">
              <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">
                문서 목록
              </span>
            </div>
            <div className="p-2">
              <Suspense>
                <DevLogSidebar entries={entries} defaultDoc={defaultId} />
              </Suspense>
            </div>
          </div>
        </aside>

        {/* ── 문서 뷰어 ───────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {content.type === 'wisdom' && (
            <WisdomViewer html={content.html} />
          )}
          {content.type === 'cycle' && (
            <CycleViewer
              info={content.info}
              activeTab={content.activeTab}
              html={content.html}
              docId={activeId}
            />
          )}
          {content.type === 'empty' && (
            <EmptyDoc />
          )}
        </main>

      </div>
    </div>
  )
}

// ── 뷰어 컴포넌트 ───────────────────────────────────────────────────────────

const VERDICT_STYLE: Record<string, string> = {
  APPROVED:        'text-green-400  bg-green-400/10  border-green-400/30',
  NEEDS_MINOR_FIX: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  NEEDS_MAJOR_FIX: 'text-red-400    bg-red-400/10    border-red-400/30',
}

const PROSE = `prose prose-invert prose-sm max-w-none overflow-x-auto
  prose-headings:text-text-primary prose-headings:font-bold prose-headings:tracking-tight
  prose-h1:text-xl prose-h2:text-base prose-h3:text-sm
  prose-p:text-text-secondary prose-p:leading-relaxed
  prose-li:text-text-secondary
  prose-code:text-accent-cyan prose-code:bg-bg-secondary prose-code:px-1.5 prose-code:rounded prose-code:text-xs
  prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-border-dim prose-pre:rounded-lg
  prose-a:text-accent-purple prose-a:no-underline hover:prose-a:underline
  prose-strong:text-text-primary
  prose-hr:border-border-dim
  prose-blockquote:border-l-4 prose-blockquote:border-accent-purple/50 prose-blockquote:text-text-secondary prose-blockquote:not-italic
  prose-table:text-text-secondary prose-th:text-text-primary prose-th:border-border-dim prose-td:border-border-dim`

function CycleViewer({
  info,
  activeTab,
  html,
  docId,
}: {
  info:      { cycleNumber: number; gameTitle: string; verdict: string; tabs: { key: string; label: string; icon: string }[] }
  activeTab: string
  html:      string
  docId:     string
}) {
  return (
    <article className="rounded-xl border border-border-dim bg-bg-card overflow-hidden">
      {/* 헤더: 사이클 정보 */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border-dim bg-bg-secondary/40 flex items-center gap-3 flex-wrap">
        <span className="text-lg">🎮</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-text-muted">
              CYCLE #{info.cycleNumber}
            </span>
            <h2 className="text-sm font-bold text-text-primary">
              {info.gameTitle}
            </h2>
          </div>
        </div>
        {info.verdict && (
          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border tracking-wider shrink-0 whitespace-nowrap ${VERDICT_STYLE[info.verdict] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
            {info.verdict.replace(/^NEEDS_/, '').replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {/* 탭 */}
      <div className="px-4 md:px-6 pt-3 border-b border-border-dim bg-bg-secondary/20">
        <Suspense>
          <DevLogTabs
            tabs={info.tabs.map(t => ({ key: t.key, label: t.label, icon: t.icon }))}
            activeTab={activeTab}
            docId={docId}
          />
        </Suspense>
      </div>

      {/* 본문 */}
      <div className="px-4 md:px-6 py-4 md:py-6">
        <div className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  )
}

function WisdomViewer({ html }: { html: string }) {
  return (
    <article className="rounded-xl border border-border-dim bg-bg-card overflow-hidden">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border-dim bg-bg-secondary/40 flex items-center gap-3">
        <span className="text-lg">🧠</span>
        <h2 className="text-sm font-bold text-text-primary">누적 플랫폼 지혜</h2>
      </div>
      <div className="px-4 md:px-6 py-4 md:py-6">
        <div className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  )
}

function EmptyDoc() {
  return (
    <div className="rounded-xl border border-border-dim bg-bg-card flex flex-col items-center justify-center py-24 text-center">
      <div className="text-4xl mb-4">📄</div>
      <p className="text-text-primary font-semibold mb-1">문서를 선택하세요</p>
      <p className="text-text-muted text-xs">좌측 목록에서 확인할 문서를 선택하면 여기에 표시됩니다.</p>
    </div>
  )
}
