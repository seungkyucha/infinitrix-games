export interface CycleState {
  cycleNumber: number
  gameId:      string
  gameTitle:   string
  gameGenre:   string[]
  difficulty:  'easy' | 'medium' | 'hard'
  status:      CycleStatus
  startedAt:   string
  completedAt?: string
  error?:      string
}

export type CycleStatus =
  | 'analysis'
  | 'planning'
  | 'coding'
  | 'designing'
  | 'reviewing'
  | 'testing'
  | 'deploying'
  | 'completed'
  | 'failed'

export interface AgentResult {
  agent:   string
  success: boolean
  output:  string
  error?:  string
}
