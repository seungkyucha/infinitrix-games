'use client'

import { useState, useMemo } from 'react'
import GameCard from './GameCard'
import type { Game } from '@/lib/types'
import { useTranslations } from '@/lib/i18n-client'

interface Props {
  games:      Game[]
  genres?:    string[]
  showFilter?: boolean
}

export default function GameGrid({ games, genres = [], showFilter = false }: Props) {
  const [activeGenre, setActiveGenre] = useState<string>('all')
  const [query,       setQuery]       = useState('')
  const { t } = useTranslations()

  const filtered = useMemo(() => {
    let result = games
    if (activeGenre !== 'all') {
      result = result.filter(g => g.genre.includes(activeGenre))
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return result
  }, [games, activeGenre, query])

  return (
    <div>
      {showFilter && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">🔍</span>
            <input
              type="text"
              placeholder={t.home.searchPlaceholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-bg-card border border-border-dim rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-purple/50 transition-colors"
            />
          </div>

          {genres.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <GenreBtn
                label={t.home.filterAll}
                active={activeGenre === 'all'}
                onClick={() => setActiveGenre('all')}
              />
              {genres.map(g => (
                <GenreBtn
                  key={g}
                  label={g}
                  active={activeGenre === g}
                  onClick={() => setActiveGenre(g)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <div className="text-4xl mb-3">🎮</div>
          <p>{t.home.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  )
}

function GenreBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
        active
          ? 'bg-accent-purple text-white border-accent-purple shadow-glow-purple'
          : 'bg-bg-card text-text-secondary border-border-dim hover:border-accent-purple/50 hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  )
}
