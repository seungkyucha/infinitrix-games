'use client'

import { useState, useEffect, type ReactNode } from 'react'
import type { Locale } from '@/lib/i18n-config'
import { I18nProvider, getClientMessages, loadClientMessages } from '@/lib/i18n-client'

export default function I18nWrapper({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [t, setT] = useState(() => getClientMessages(locale))

  useEffect(() => {
    // ko, en은 이미 번들에 포함됨. 그 외 언어는 동적 로드
    loadClientMessages(locale).then(setT)
  }, [locale])

  return <I18nProvider value={{ t, locale }}>{children}</I18nProvider>
}
