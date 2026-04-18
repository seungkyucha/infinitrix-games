import Link from 'next/link'
import {
  listEvolutionCycles,
  getDashboardHtml,
  getProposalHtml,
  getAppliedHtml,
  getSummaryHtml,
} from '@/lib/evolution'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Self-Evolution — InfiniTriX',
  description: '자가발전 시스템의 사이클별 메트릭, Evolver 제안, 자동 적용 내역.',
}

interface PageProps {
  searchParams: Promise<{ cycle?: string; tab?: string }>
}

export default async function EvolutionPage({ searchParams }: PageProps) {
  const { cycle: cycleParam, tab: tabParam } = await searchParams
  const cycles = listEvolutionCycles()
  const selectedCycle = cycleParam ? parseInt(cycleParam, 10) : null
  const tab = tabParam ?? 'summary'

  const dashboardHtml = getDashboardHtml()

  let detailHtml = ''
  let detailTitle = ''
  if (selectedCycle != null) {
    if (tab === 'proposal') { detailHtml = getProposalHtml(selectedCycle); detailTitle = '제안서 (Evolver)' }
    else if (tab === 'applied') { detailHtml = getAppliedHtml(selectedCycle); detailTitle = '적용 내역' }
    else { detailHtml = getSummaryHtml(selectedCycle); detailTitle = '사이클 요약' }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-2xl">🧬</span>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Self-Evolution</h1>
          <span className="text-xs font-mono text-text-muted border border-border-dim rounded px-2 py-0.5">
            {cycles.length} 사이클
          </span>
        </div>
        <p className="text-text-secondary text-xs max-w-2xl">
          매 사이클마다 4-Discipline (Planning / Development / Art / QA) 메트릭을 측정하고,
          Evolver 에이전트가 LOW·MEDIUM 제안을 자동 적용하여 파이프라인 자체를 진화시킵니다.
        </p>
      </div>

      {/* ── Dashboard ─────────────────────────── */}
      {dashboardHtml && (
        <section className="mb-10 rounded-xl border border-border-dim bg-bg-secondary/40 p-4 md:p-6">
          <div className="prose prose-invert prose-sm md:prose-base max-w-none" dangerouslySetInnerHTML={{ __html: dashboardHtml }} />
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* ── Sidebar: cycle list ───────────────── */}
        <aside className="md:sticky md:top-20 md:self-start">
          <div className="rounded-lg border border-border-dim bg-bg-secondary/30 overflow-hidden">
            <div className="px-3 py-2 border-b border-border-dim text-xs font-mono text-text-muted uppercase tracking-wide">
              사이클 이력
            </div>
            <ul className="max-h-[70vh] overflow-y-auto">
              {cycles.map((entry) => {
                const active = selectedCycle === entry.cycle
                const score = entry.metrics?.overallScore
                const verdictBadge = entry.metrics?.verdict === 'APPROVED' ? '✅'
                                   : entry.metrics?.verdict === 'NEEDS_MINOR_FIX' ? '⚠️'
                                   : entry.metrics?.verdict === 'NEEDS_MAJOR_FIX' ? '❌' : '·'
                return (
                  <li key={entry.cycle}>
                    <Link
                      href={`/evolution?cycle=${entry.cycle}&tab=${tab}`}
                      className={`block px-3 py-2 text-sm border-b border-border-dim/50 transition-colors ${active ? 'bg-accent-purple/20 text-text-primary' : 'text-text-secondary hover:bg-bg-secondary/60 hover:text-text-primary'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono">#{entry.cycle}</span>
                        <span className="text-xs">{verdictBadge}</span>
                      </div>
                      {entry.metrics && (
                        <div className="text-[10px] text-text-muted mt-0.5 truncate">
                          {entry.metrics.genre || 'n/a'} · {score != null ? `${score.toFixed(0)}점` : ''}
                        </div>
                      )}
                      <div className="text-[10px] text-text-muted mt-0.5">
                        🧬 적용 {entry.appliedCount} · 🟡 보류 {entry.deferredCount}
                        {entry.failedCount > 0 && ` · ❌ ${entry.failedCount}`}
                      </div>
                    </Link>
                  </li>
                )
              })}
              {cycles.length === 0 && (
                <li className="px-3 py-4 text-xs text-text-muted">(아직 데이터 없음)</li>
              )}
            </ul>
          </div>
        </aside>

        {/* ── Detail panel ───────────────────────── */}
        <section className="min-w-0">
          {selectedCycle == null ? (
            <div className="rounded-lg border border-border-dim bg-bg-secondary/30 p-8 text-center text-text-muted text-sm">
              ← 사이클을 선택하세요
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-border-dim mb-4 overflow-x-auto">
                {[
                  { key: 'summary',  label: '📝 요약' },
                  { key: 'applied',  label: '✅ 적용된 제안' },
                  { key: 'proposal', label: '🧬 Evolver 제안서' },
                ].map((t) => (
                  <Link
                    key={t.key}
                    href={`/evolution?cycle=${selectedCycle}&tab=${t.key}`}
                    className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? 'border-accent-purple text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>

              <div className="rounded-lg border border-border-dim bg-bg-secondary/30 p-4 md:p-6">
                <div className="mb-2 text-xs font-mono text-text-muted">사이클 #{selectedCycle} — {detailTitle}</div>
                {detailHtml ? (
                  <div className="prose prose-invert prose-sm md:prose-base max-w-none" dangerouslySetInnerHTML={{ __html: detailHtml }} />
                ) : (
                  <div className="text-text-muted text-sm">(이 탭에 해당하는 파일이 아직 없습니다)</div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
