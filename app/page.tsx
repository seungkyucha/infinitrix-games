import { getAllGames, getFeaturedGames, getAllGenres } from '@/lib/games'
import GameGrid from '@/components/GameGrid'
import HeroSection from '@/components/HeroSection'
import MiniAgentLog from '@/components/MiniAgentLog'

export const dynamic = 'force-static'
export const revalidate = 3600 // 1시간마다 재생성

export default function HomePage() {
  const allGames   = getAllGames()
  const featured   = getFeaturedGames()
  const genres     = getAllGenres()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 히어로 섹션 */}
      <HeroSection totalGames={allGames.length} rightSlot={<MiniAgentLog />} />

      {/* 인기 게임 섹션 */}
      {featured.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-accent-yellow text-xl">⭐</span>
            <h2 className="text-xl font-bold text-text-primary">추천 게임</h2>
            <div className="flex-1 h-px bg-border-dim" />
          </div>
          <GameGrid games={featured} />
        </section>
      )}

      {/* 전체 게임 섹션 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-accent-cyan text-xl">🎮</span>
          <h2 className="text-xl font-bold text-text-primary">
            모든 게임
            <span className="ml-2 text-sm font-normal text-text-secondary">
              ({allGames.length}개)
            </span>
          </h2>
          <div className="flex-1 h-px bg-border-dim" />
        </div>

        {allGames.length === 0 ? (
          <EmptyState />
        ) : (
          <GameGrid games={allGames} genres={genres} showFilter />
        )}
      </section>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">🚀</div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        첫 번째 게임 제작 중...
      </h3>
      <p className="text-text-secondary text-sm">
        AI 에이전트 팀이 지금 게임을 개발하고 있습니다. 곧 추가됩니다!
      </p>
    </div>
  )
}
