import { getAllCycleDocs, getPlatformWisdomHtml } from '@/lib/devlog'
import DevLogEntry from '@/components/DevLogEntry'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '제작 일지 — InfiniTriX',
  description: 'AI 에이전트 팀이 제작한 게임의 기획서, 리뷰, 포스트모템 기록',
}

export default function DevLogPage() {
  const docs          = getAllCycleDocs()
  const wisdomHtml    = getPlatformWisdomHtml()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">📓</span>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">제작 일지</h1>
        </div>
        <p className="text-text-secondary text-sm max-w-xl">
          AI 에이전트 팀이 완료한 각 개발 사이클의 기획서, 코드 리뷰 결과, 포스트모템 문서를 기록합니다.
        </p>
        {docs.length > 0 && (
          <p className="text-text-muted text-xs font-mono mt-2">
            총 {docs.length}개 사이클 완료
          </p>
        )}
      </div>

      {/* 누적 플랫폼 지혜 */}
      {wisdomHtml && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">🧠</span>
            <h2 className="text-lg font-bold text-text-primary">누적 플랫폼 지혜</h2>
            <div className="flex-1 h-px bg-border-dim" />
          </div>
          <div className="rounded-xl border border-accent-purple/20 bg-accent-purple/5 px-6 py-5">
            <div
              className="prose prose-invert prose-sm max-w-none
                prose-headings:text-text-primary prose-headings:font-bold
                prose-p:text-text-secondary prose-p:leading-relaxed
                prose-li:text-text-secondary
                prose-strong:text-text-primary
                prose-hr:border-border-dim"
              dangerouslySetInnerHTML={{ __html: wisdomHtml }}
            />
          </div>
        </section>
      )}

      {/* 사이클 목록 */}
      <section>
        {docs.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">📋</span>
            <h2 className="text-lg font-bold text-text-primary">사이클별 기록</h2>
            <div className="flex-1 h-px bg-border-dim" />
          </div>
        )}
        {docs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {docs.map(doc => (
              <DevLogEntry key={doc.cycleNumber} doc={doc} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-24 rounded-xl border border-border-dim bg-bg-card">
      <div className="text-5xl mb-4">📋</div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        아직 완료된 사이클이 없습니다
      </h3>
      <p className="text-text-secondary text-sm mb-6">
        에이전트 팀이 첫 번째 게임 개발 사이클을 완료하면 여기에 기록이 남습니다.
      </p>
      <div className="inline-block font-mono text-xs text-text-muted bg-bg-secondary border border-border-dim rounded-lg px-5 py-3 text-left space-y-1">
        <p><span className="text-text-secondary">$</span> cd agents</p>
        <p><span className="text-text-secondary">$</span> npm run cycle</p>
      </div>
    </div>
  )
}
