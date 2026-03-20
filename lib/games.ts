import type { Game, GameRegistry } from './types'
import registryData from '@/public/games/game-registry.json'

const registry = registryData as GameRegistry

export function getAllGames(): Game[] {
  return registry.games
}

export function getGameById(id: string): Game | undefined {
  return registry.games.find(g => g.id === id)
}

export function getFeaturedGames(): Game[] {
  return registry.games.filter(g => g.featured)
}

export function getGamesByGenre(genre: string): Game[] {
  if (genre === 'all') return registry.games
  return registry.games.filter(g => g.genre.includes(genre))
}

export function getAllGenres(): string[] {
  const genres = new Set<string>()
  registry.games.forEach(g => g.genre.forEach(genre => genres.add(genre)))
  return Array.from(genres).sort()
}

export function getRecentGames(count = 6): Game[] {
  return [...registry.games]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, count)
}

export function getTopPlayedGames(count = 6): Game[] {
  return [...registry.games]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, count)
}

export function getTotalGames(): number {
  return registry.totalGames
}
