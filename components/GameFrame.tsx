'use client'

import { useState, useEffect, useRef } from 'react'
import type { Game } from '@/lib/types'
import { useTranslations } from '@/lib/i18n-client'

export default function GameFrame({ game }: { game: Game }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading,    setIsLoading]    = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslations()

  useEffect(() => {
    const key = `play_${game.id}`
    const last = localStorage.getItem(key)
    const now  = Date.now()
    if (!last || now - Number(last) > 3600_000) {
      localStorage.setItem(key, String(now))
    }
  }, [game.id])

  // iframe 포커스 시 부모 페이지의 Space/Arrow 스크롤 차단
  useEffect(() => {
    const BLOCK_KEYS = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])
    function blockScroll(e: KeyboardEvent) {
      if (BLOCK_KEYS.has(e.code)) {
        e.preventDefault()
      }
    }
    // iframe에 포커스가 있을 때 부모도 키 이벤트를 받으므로 차단
    window.addEventListener('keydown', blockScroll, { passive: false })
    return () => window.removeEventListener('keydown', blockScroll)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`bg-bg-card border border-border-dim rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
    >
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
          tabIndex={0}
          className={`w-full border-0 outline-none ${isFullscreen ? 'h-[calc(100vh-44px)]' : 'h-[480px] sm:h-[560px]'}`}
          onLoad={() => {
            setIsLoading(false)
            const iframe = document.getElementById('game-iframe') as HTMLIFrameElement
            iframe?.focus()
          }}
          onClick={() => {
            const iframe = document.getElementById('game-iframe') as HTMLIFrameElement
            iframe?.focus()
          }}
          sandbox="allow-scripts allow-same-origin"
          allow="fullscreen; autoplay"
        />
      </div>
    </div>
  )
}
