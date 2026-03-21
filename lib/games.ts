import type { Game, GameRegistry } from './types'
import type { Locale } from './i18n-config'
import registryData from '@/public/games/game-registry.json'

const registry = registryData as GameRegistry

/** 로케일에 맞게 게임 메타를 오버라이드 (i18n 필드가 있으면 적용) */
function localize(game: Game, locale: Locale): Game {
  if (locale === 'ko' || !game.i18n) return game
  const tr = game.i18n[locale]
  if (!tr) return game
  return {
    ...game,
    title:       tr.title       ?? game.title,
    description: tr.description ?? game.description,
    tags:        tr.tags        ?? game.tags,
    controls:    tr.controls    ?? game.controls,
  }
}

export function getAllGames(locale: Locale = 'ko'): Game[] {
  return [...registry.games]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .map(g => localize(g, locale))
}

export function getGameById(id: string, locale: Locale = 'ko'): Game | undefined {
  const game = registry.games.find(g => g.id === id)
  return game ? localize(game, locale) : undefined
}

export function getFeaturedGames(locale: Locale = 'ko'): Game[] {
  return registry.games.filter(g => g.featured).map(g => localize(g, locale))
}

export function getGamesByGenre(genre: string, locale: Locale = 'ko'): Game[] {
  const games = genre === 'all' ? registry.games : registry.games.filter(g => g.genre.includes(genre))
  return games.map(g => localize(g, locale))
}

export function getAllGenres(): string[] {
  const genres = new Set<string>()
  registry.games.forEach(g => g.genre.forEach(genre => genres.add(genre)))
  return Array.from(genres).sort()
}

export function getRecentGames(count = 6, locale: Locale = 'ko'): Game[] {
  return [...registry.games]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, count)
    .map(g => localize(g, locale))
}

export function getTotalGames(): number {
  return registry.totalGames
}
