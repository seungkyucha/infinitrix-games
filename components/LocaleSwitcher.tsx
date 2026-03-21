'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, setLocaleCookie, loadClientMessages } from '@/lib/i18n-client'
import { LOCALES, LOCALE_NAMES, LOCALE_FLAGS } from '@/lib/i18n-config'
import type { Locale } from '@/lib/i18n-config'

export default function LocaleSwitcher() {
  const { locale } = useTranslations()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function select(loc: Locale) {
    setOpen(false)
    setLocaleCookie(loc)
    // 새 언어 메시지 프리로드
    await loadClientMessages(loc)
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-colors"
      >
        <span className="text-sm">{LOCALE_FLAGS[locale]}</span>
        <span className="font-mono uppercase text-[10px]">{locale}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border-dim bg-bg-card shadow-lg overflow-hidden z-50">
          {LOCALES.map(loc => (
            <button
              key={loc}
              onClick={() => select(loc)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left
                ${loc === locale
                  ? 'bg-accent-purple/15 text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
                }`}
            >
              <span className="text-sm">{LOCALE_FLAGS[loc]}</span>
              <span className="flex-1">{LOCALE_NAMES[loc]}</span>
              {loc === locale && <span className="text-accent-purple text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
