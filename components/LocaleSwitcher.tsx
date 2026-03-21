'use client'

import { useTranslations, setLocaleCookie } from '@/lib/i18n-client'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

const FLAGS: Record<Locale, string> = { ko: '🇰🇷', en: '🇺🇸' }

export default function LocaleSwitcher() {
  const { locale } = useTranslations()
  const router = useRouter()
  const next: Locale = locale === 'ko' ? 'en' : 'ko'

  function toggle() {
    setLocaleCookie(next)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-colors"
      aria-label={`Switch to ${next}`}
    >
      <span className="text-sm">{FLAGS[locale]}</span>
      <span className="font-mono uppercase">{locale}</span>
    </button>
  )
}
