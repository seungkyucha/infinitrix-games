/** 클라이언트·서버 공통 i18n 상수 (next/headers 의존 없음) */

export type Locale = 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW' | 'es' | 'fr' | 'de' | 'pt'

export const LOCALES: Locale[] = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'pt']
export const DEFAULT_LOCALE: Locale = 'ko'

export const LOCALE_NAMES: Record<Locale, string> = {
  'ko':    '한국어',
  'en':    'English',
  'ja':    '日本語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'es':    'Español',
  'fr':    'Français',
  'de':    'Deutsch',
  'pt':    'Português',
}

export const LOCALE_FLAGS: Record<Locale, string> = {
  'ko':    '🇰🇷',
  'en':    '🇺🇸',
  'ja':    '🇯🇵',
  'zh-CN': '🇨🇳',
  'zh-TW': '🇹🇼',
  'es':    '🇪🇸',
  'fr':    '🇫🇷',
  'de':    '🇩🇪',
  'pt':    '🇧🇷',
}
