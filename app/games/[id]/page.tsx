import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllGames, getGameById } from '@/lib/games'
import GameFrame from '@/components/GameFrame'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export async function generateStaticParams() {
  const games = getAllGames()
  return games.map(g => ({ id: g.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const game = getGameById(params.id)
  if (!game) return { title: '게임을 찾을 수 없습니다' }
  return {
    title: `${game.title} — InfiniTriX`,
    description: game.description,
  }
}

export default function GamePage({ params }: Props) {
  const game = getGameById(params.id)
  if (!game) notFound()

  const genreColors: Record<string, string> = {
    arcade:   'bg-accent-purple/20 text-accent-purple border-accent-purple/30',
    puzzle:   'bg-accent-cyan/20   text-accent-cyan   border-accent-cyan/30',
    strategy: 'bg-accent-green/20  text-accent-green  border-accent-green/30',
    action:   'bg-red-500/20       text-red-400       border-red-500/30',
    casual:   'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6 text-sm"
      >
        ← 게임 목록으로
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 게임 프레임 (3/4) */}
        <div className="lg:col-span-3">
          <GameFrame game={game} />
        </div>

        {/* 사이드바 (1/4) */}
        <aside className="space-y-4">
          {/* 게임 정보 */}
          <div className="bg-bg-card border border-border-dim rounded-xl p-5">
            <h1 className="text-xl font-bold text-text-primary mb-1">{game.title}</h1>
            <p className="text-text-secondary text-sm mb-4">{game.description}</p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {game.genre.map(g => (
                <span
                  key={g}
                  className={`genre-badge border ${genreColors[g] ?? 'bg-white/10 text-text-secondary border-white/10'}`}
                >
                  {g}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-bg-secondary rounded-lg p-3">
                <div className="text-accent-cyan font-bold text-lg">{game.playCount.toLocaleString()}</div>
                <div className="text-text-muted text-xs mt-0.5">플레이</div>
              </div>
              <div className="bg-bg-secondary rounded-lg p-3">
                <div className="text-accent-yellow font-bold text-lg">
                  {game.rating > 0 ? game.rating.toFixed(1) : '—'}
                </div>
                <div className="text-text-muted text-xs mt-0.5">평점</div>
              </div>
            </div>
          </div>

          {/* 조작 방법 */}
          {game.controls && (
            <div className="bg-bg-card border border-border-dim rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">조작 방법</h3>
              <ul className="space-y-1.5">
                {game.controls.map((ctrl, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-accent-purple mt-0.5">▸</span>
                    <span className="text-text-secondary">{ctrl}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 태그 */}
          {game.tags.length > 0 && (
            <div className="bg-bg-card border border-border-dim rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">태그</h3>
              <div className="flex flex-wrap gap-1.5">
                {game.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-md bg-bg-secondary text-text-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 추가 정보 */}
          <div className="bg-bg-card border border-border-dim rounded-xl p-5 text-xs text-text-muted space-y-1.5">
            <div className="flex justify-between">
              <span>추가일</span>
              <span className="text-text-secondary">{new Date(game.addedAt).toLocaleDateString('ko-KR')}</span>
            </div>
            {game.version && (
              <div className="flex justify-between">
                <span>버전</span>
                <span className="text-text-secondary">v{game.version}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
