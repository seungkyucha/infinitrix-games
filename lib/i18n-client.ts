'use client'

import { createContext, useContext } from 'react'
import type { Locale } from './i18n'
import ko from '@/messages/ko.json'
import en from '@/messages/en.json'

type Messages = typeof ko

const messagesMap: Record<string, Messages> = { ko, en }

const I18nContext = createContext<{ t: Messages; locale: Locale }>({ t: ko, locale: 'ko' })

export const I18nProvider = I18nContext.Provider

export function useTranslations() {
  return useContext(I18nContext)
}

export function getClientMessages(locale: Locale): Messages {
  return messagesMap[locale] ?? messagesMap['ko']
}

/** 쿠키에 로케일 저장 */
export function setLocaleCookie(locale: Locale) {
  document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`
}
