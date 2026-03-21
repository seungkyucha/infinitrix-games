export interface Game {
  id:          string      // 고유 ID (예: "snake", "tetris")
  title:       string      // 표시 이름
  description: string      // 한 줄 설명
  genre:       string[]    // 장르 태그 (arcade, puzzle, strategy, action, casual)
  thumbnail:   string      // 썸네일 경로 (/games/[id]/thumbnail.svg)
  path:        string      // 게임 HTML 경로 (/games/[id]/index.html)
  addedAt:     string      // ISO 8601 날짜
  featured:    boolean     // 추천 게임 여부
  playCount:   number      // 플레이 횟수
  rating:      number      // 평균 평점 (0~5)
  tags:        string[]    // 추가 태그
  controls?:   string[]    // 조작 방법 설명
  i18n?:       Record<string, { title: string; description: string; tags: string[]; controls?: string[] }>  // 다국어 번역
  version?:    string      // 버전 (예: "1.0.0")
  author?:     string      // 제작자
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface GameRegistry {
  lastUpdated: string
  totalGames:  number
  games:       Game[]
}

export type Genre = 'arcade' | 'puzzle' | 'strategy' | 'action' | 'casual' | 'all'
