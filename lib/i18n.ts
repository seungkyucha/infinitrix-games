import { cookies, headers } from 'next/headers'
import ko from '@/messages/ko.json'
import en from '@/messages/en.json'

export type { Locale } from './i18n-config'
export { LOCALES, DEFAULT_LOCALE, LOCALE_NAMES, LOCALE_FLAGS } from './i18n-config'

import { LOCALES, DEFAULT_LOCALE } from './i18n-config'
import type { Locale } from './i18n-config'

const messageCache: Partial<Record<Locale, typeof ko>> = { ko, en }

async function loadMessages(locale: Locale): Promise<typeof ko> {
  if (messageCache[locale]) return messageCache[locale]!
  try {
    const mod = await import(`@/messages/${locale}.json`)
    messageCache[locale] = mod.default
    return mod.default
  } catch {
    return ko
  }
}

function detectLocaleFromHeader(acceptLang: string): Locale {
  const mapping: Record<string, Locale> = {
    'ko': 'ko', 'en': 'en', 'ja': 'ja',
    'zh-cn': 'zh-CN', 'zh-hans': 'zh-CN', 'zh-sg': 'zh-CN',
    'zh-tw': 'zh-TW', 'zh-hant': 'zh-TW', 'zh-hk': 'zh-TW', 'zh': 'zh-CN',
    'es': 'es', 'fr': 'fr', 'de': 'de', 'pt': 'pt', 'pt-br': 'pt',
  }
  const langs = acceptLang.split(',').map(p => p.split(';')[0].trim().toLowerCase())
  for (const lang of langs) {
    if (mapping[lang]) return mapping[lang]
    const prefix = lang.split('-')[0]
    if (mapping[prefix]) return mapping[prefix]
  }
  return DEFAULT_LOCALE
}

export async function getLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('locale')?.value as Locale | undefined
    if (localeCookie && LOCALES.includes(localeCookie)) return localeCookie
  } catch {}
  try {
    const headerStore = await headers()
    const acceptLang = headerStore.get('accept-language')
    if (acceptLang) return detectLocaleFromHeader(acceptLang)
  } catch {}
  return DEFAULT_LOCALE
}

export async function getTranslations() {
  const locale = await getLocale()
  const t = await loadMessages(locale)
  return { t, locale }
}

export function getMessages(locale: Locale) {
  return messageCache[locale] ?? ko
}
