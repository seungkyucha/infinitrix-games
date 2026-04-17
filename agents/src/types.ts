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

// ═══════════════════════════════════════════════════════════
// 자가발전 (Self-Evolution) 관련 타입 — 4 Discipline Quality System
// ═══════════════════════════════════════════════════════════

export type Discipline = 'planning' | 'development' | 'art' | 'qa'

export interface DisciplineScore {
  score: number                 // 0..100
  signals: Record<string, number | string | boolean>
}

export interface CycleMetrics {
  cycle: number
  gameId: string
  genre: string
  artStyle: string
  verdict: 'APPROVED' | 'NEEDS_MINOR_FIX' | 'NEEDS_MAJOR_FIX' | 'UNKNOWN'
  reviewRounds: number
  review2Rounds: number
  durationMin: number
  disciplines: Record<Discipline, DisciplineScore>
  overallScore: number
  weakestDiscipline: Discipline
  rootCauses: string[]
  createdAt: string
}

export type TrendDirection = 'IMPROVING' | 'STABLE' | 'DECLINING' | 'VOLATILE'

export interface DisciplineTrend {
  discipline: Discipline
  recent: number[]              // 최근 N사이클 점수 (오래된 → 최신)
  direction: TrendDirection
  delta: number                 // 최신 - 가장 오래된
}

export type ProposalSafety = 'LOW' | 'MEDIUM' | 'HIGH'

export type ProposalCategory =
  | 'SPEC_RULE'
  | 'GENRE_ROTATION'
  | 'PROMPT_RULE'
  | 'ENGINE_API'
  | 'GENRE_MODULE'
  | 'SKILL_UPDATE'
  | 'SKILL_NEW'
  | 'PIPELINE_PHASE'
  | 'PROMPT_REFERENCE_ENFORCE'
  | 'STYLE_CUE_TUNE'
  | 'REVIEW_CHECK'

export interface EvolutionProposal {
  id: number                    // 제안 #1, #2, ...
  discipline: Discipline | 'cross'
  pattern: string               // 감지된 signal 설명
  category: ProposalCategory
  safety: ProposalSafety
  title: string
  rationale: string
  targetFile: string
  oldString?: string            // Edit tool 적용용 (LOW)
  newString?: string            // Edit tool 적용용 (LOW)
  fullContent?: string          // Write tool 적용용 (SKILL_NEW)
}

export interface EvolutionReport {
  cycle: number
  basedOn: number[]             // 분석에 사용한 사이클 번호들
  trends: DisciplineTrend[]
  proposals: EvolutionProposal[]
  appliedProposalIds: number[]
  deferredProposalIds: number[]
}
