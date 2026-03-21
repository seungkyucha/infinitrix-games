'use client'

import { useState, useEffect } from 'react'
import type { Game } from '@/lib/types'
import { useTranslations } from '@/lib/i18n-client'

export default function GameFrame({ game }: { game: Game }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading,    setIsLoading]    = useState(true)
  const { t } = useTranslations()

  useEffect(() => {
    const key = `play_${game.id}`
    const last = localStorage.getItem(key)
    const now  = Date.now()
    if (!last || now - Number(last) > 3600_000) {
      localStorage.setItem(key, String(now))
    }
  }, [game.id])

  return (
    <div className={`bg-bg-card border border-border-dim rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-dim bg-bg-secondary">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-accent-yellow/60" />
            <div className="w-3 h-3 rounded-full bg-accent-green/60" />
          </div>
          <span className="text-text-secondary text-xs font-mono">{game.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const iframe = document.getElementById('game-iframe') as HTMLIFrameElement
              iframe?.contentWindow?.location.reload()
            }}
            className="text-text-muted hover:text-text-primary text-xs px-2 py-1 rounded hover:bg-bg-card transition-colors"
            title={t.game.restart}
          >
            ↺ {t.game.restart}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-text-muted hover:text-text-primary text-xs px-2 py-1 rounded hover:bg-bg-card transition-colors"
            title={t.game.fullscreen}
          >
            {isFullscreen ? `⊡ ${t.game.minimize}` : `⊞ ${t.game.fullscreen}`}
          </button>
        </div>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary z-10">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin mx-auto mb-3" />
              <p className="text-text-muted text-sm">{t.game.loading}</p>
            </div>
          </div>
        )}
        <iframe
          id="game-iframe"
          src={game.path}
          title={game.title}
          className={`w-full border-0 ${isFullscreen ? 'h-[calc(100vh-44px)]' : 'h-[480px] sm:h-[560px]'}`}
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin"
          allow="fullscreen"
        />
      </div>
    </div>
  )
}
