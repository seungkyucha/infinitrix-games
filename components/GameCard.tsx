import Link from 'next/link'
import Image from 'next/image'
import type { Game } from '@/lib/types'

// 장르별 네온 테마 — 단순 배지가 아닌 카드 전체 아이덴티티
const GENRE_THEME: Record<string, { border: string; glow: string; badge: string; dot: string }> = {
  arcade:   { border: 'hover:border-accent-purple/60', glow: 'hover:shadow-[0_0_20px_rgba(108,60,247,0.25)]', badge: 'bg-accent-purple/15 text-accent-purple border border-accent-purple/30', dot: 'bg-accent-purple' },
  puzzle:   { border: 'hover:border-accent-cyan/60',   glow: 'hover:shadow-[0_0_20px_rgba(0,212,255,0.25)]',  badge: 'bg-accent-cyan/15   text-accent-cyan   border border-accent-cyan/30',   dot: 'bg-accent-cyan'   },
  strategy: { border: 'hover:border-accent-green/60',  glow: 'hover:shadow-[0_0_20px_rgba(0,255,135,0.25)]', badge: 'bg-accent-green/15  text-accent-green  border border-accent-green/30',  dot: 'bg-accent-green'  },
  action:   { border: 'hover:border-red-500/60',       glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]', badge: 'bg-red-500/15       text-red-400       border border-red-500/30',       dot: 'bg-red-500'       },
  casual:   { border: 'hover:border-accent-yellow/60', glow: 'hover:shadow-[0_0_20px_rgba(255,215,0,0.25)]', badge: 'bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30', dot: 'bg-accent-yellow' },
}
const DEFAULT_THEME = { border: 'hover:border-white/20', glow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]', badge: 'bg-white/10 text-text-secondary border border-white/10', dot: 'bg-white/40' }

export default function GameCard({ game }: { game: Game }) {
  const primaryGenre = game.genre[0]
  const theme = GENRE_THEME[primaryGenre] ?? DEFAULT_THEME

  return (
    <Link href={`/games/${game.id}`} className="group block">
      <article className={`relative bg-bg-card border border-border-dim rounded-lg overflow-hidden h-full flex flex-col transition-all duration-300 ${theme.border} ${theme.glow}`}>

        {/* 썸네일 영역 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-bg-secondary">
          <Image
            src={game.thumbnail}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />

          {/* 스캔라인 오버레이 — 호버 시 레트로 이펙트 */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)' }}
          />

          {/* 플레이 버튼 — 슬라이드 업 */}
          <div className="absolute inset-0 flex items-end justify-center pb-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white text-xs font-medium tracking-widest uppercase">
              <span className="text-[10px]">▶</span> PLAY
            </div>
          </div>

          {/* 배지 — 좌상단 */}
          <div className="absolute top-2 left-2 flex gap-1">
            {isNew(game.addedAt) && (
              <span className="text-[10px] px-2 py-0.5 rounded-sm bg-accent-green text-bg-primary font-bold tracking-wider uppercase">
                NEW
              </span>
            )}
          </div>
          {game.featured && (
            <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-sm bg-accent-yellow text-bg-primary font-bold">
              PICK
            </span>
          )}
        </div>

        {/* 카드 하단 정보 */}
        <div className="p-3 flex flex-col flex-1 gap-2">
          {/* 제목 — 호버 시 장르 색상 */}
          <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-1 group-hover:text-accent-cyan transition-colors duration-200">
            {game.title}
          </h3>

          <p className="text-text-secondary text-xs leading-relaxed line-clamp-2 flex-1">
            {game.description}
          </p>

          {/* 하단 메타 */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-dim/50">
            <div className="flex gap-1">
              {game.genre.slice(0, 2).map(g => {
                const t = GENRE_THEME[g] ?? DEFAULT_THEME
                return (
                  <span key={g} className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium tracking-wide uppercase ${t.badge}`}>
                    {g}
                  </span>
                )
              })}
            </div>

            {game.playCount > 0 && (
              <span className="text-text-muted text-[10px] flex items-center gap-1">
                <span className={`w-1 h-1 rounded-full inline-block ${theme.dot}`} />
                {formatCount(game.playCount)}
              </span>
            )}
          </div>
        </div>

        {/* 좌측 장르 액센트 바 — 카드 인디케이터 */}
        <div className={`absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${theme.dot}`} />
      </article>
    </Link>
  )
}

function isNew(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 7 * 24 * 60 * 60 * 1000
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
