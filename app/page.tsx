import { getAllGames, getAllGenres } from '@/lib/games'
import GameGrid from '@/components/GameGrid'
import HeroSection from '@/components/HeroSection'
import MiniAgentLog from '@/components/MiniAgentLog'
import { getTranslations } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const allGames = getAllGames()
  const genres   = getAllGenres()
  const { t }    = await getTranslations()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HeroSection totalGames={allGames.length} rightSlot={<MiniAgentLog />} />

      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-accent-cyan text-xl">🎮</span>
          <h2 className="text-xl font-bold text-text-primary">
            {t.home.allGames}
            <span className="ml-2 text-sm font-normal text-text-secondary">
              ({t.home.gamesCount.replace('{count}', String(allGames.length))})
            </span>
          </h2>
          <div className="flex-1 h-px bg-border-dim" />
        </div>

        {allGames.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">{t.home.emptyTitle}</h3>
            <p className="text-text-secondary text-sm">{t.home.emptyDesc}</p>
          </div>
        ) : (
          <GameGrid games={allGames} genres={genres} showFilter />
        )}
      </section>
    </div>
  )
}
