'use client'

import { createContext, useContext } from 'react'
import type { Locale } from './i18n-config'
import ko from '@/messages/ko.json'
import en from '@/messages/en.json'

type Messages = typeof ko

const messageCache: Partial<Record<string, Messages>> = { ko, en }

const I18nContext = createContext<{ t: Messages; locale: Locale }>({ t: ko, locale: 'ko' })

export const I18nProvider = I18nContext.Provider

export function useTranslations() {
  return useContext(I18nContext)
}

export async function loadClientMessages(locale: Locale): Promise<Messages> {
  if (messageCache[locale]) return messageCache[locale]!
  try {
    const mod = await import(`@/messages/${locale}.json`)
    messageCache[locale] = mod.default
    return mod.default
  } catch {
    return ko
  }
}

export function getClientMessages(locale: Locale): Messages {
  return messageCache[locale] ?? ko
}

export function setLocaleCookie(locale: Locale) {
  document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`
}
