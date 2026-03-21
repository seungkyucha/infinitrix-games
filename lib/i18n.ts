import { cookies } from 'next/headers'
import ko from '@/messages/ko.json'
import en from '@/messages/en.json'

export type Locale = 'ko' | 'en'
export const LOCALES: Locale[] = ['ko', 'en']
export const DEFAULT_LOCALE: Locale = 'ko'

const messages: Record<Locale, typeof ko> = { ko, en }

/** 서버 컴포넌트에서 현재 로케일 가져오기 */
export async function getLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies()
    const locale = cookieStore.get('locale')?.value as Locale | undefined
    if (locale && LOCALES.includes(locale)) return locale
  } catch {}
  return DEFAULT_LOCALE
}

/** 서버 컴포넌트용 번역 함수 */
export async function getTranslations() {
  const locale = await getLocale()
  return { t: messages[locale], locale }
}

/** 동기 번역 (locale을 이미 알고 있을 때) */
export function getMessages(locale: Locale) {
  return messages[locale] ?? messages[DEFAULT_LOCALE]
}
