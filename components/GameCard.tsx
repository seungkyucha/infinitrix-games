import Link from 'next/link'
import Image from 'next/image'
import type { Game } from '@/lib/types'

const GENRE_STYLE: Record<string, string> = {
  arcade:   'bg-accent-purple/20 text-accent-purple',
  puzzle:   'bg-accent-cyan/20   text-accent-cyan',
  strategy: 'bg-accent-green/20  text-accent-green',
  action:   'bg-red-500/20       text-red-400',
  casual:   'bg-accent-yellow/20 text-accent-yellow',
}

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.id}`} className="group block">
      <article className="bg-bg-card border border-border-dim rounded-xl overflow-hidden card-glow cursor-pointer h-full flex flex-col">
        {/* 썸네일 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-bg-secondary">
          <Image
            src={game.thumbnail}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
            onError={(e) => {
              // 썸네일 없으면 플레이스홀더
              const el = e.currentTarget as HTMLImageElement
              el.style.display = 'none'
            }}
          />
          {/* 플레이 오버레이 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
              <span className="text-white text-xl ml-0.5">▶</span>
            </div>
          </div>
          {/* 신규 배지 */}
          {isNew(game.addedAt) && (
            <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-accent-green text-bg-primary font-bold">
              NEW
            </span>
          )}
          {game.featured && (
            <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-accent-yellow text-bg-primary font-bold">
              ⭐
            </span>
          )}
        </div>

        {/* 정보 */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-text-primary text-sm mb-1 group-hover:text-accent-cyan transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-text-secondary text-xs mb-3 line-clamp-2 flex-1">
            {game.description}
          </p>

          {/* 장르 + 플레이수 */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 flex-wrap">
              {game.genre.slice(0, 2).map(g => (
                <span key={g} className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${GENRE_STYLE[g] ?? 'bg-white/10 text-text-secondary'}`}>
                  {g}
                </span>
              ))}
            </div>
            <span className="text-text-muted text-xs">
              {game.playCount > 0 ? `▶ ${formatCount(game.playCount)}` : ''}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function isNew(dateStr: string): boolean {
  const added = new Date(dateStr).getTime()
  const now   = Date.now()
  return now - added < 7 * 24 * 60 * 60 * 1000 // 7일 이내
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
