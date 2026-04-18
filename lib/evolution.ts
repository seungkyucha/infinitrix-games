/**
 * Self-evolution data reader — reads docs/evolution/, docs/cycle-metrics/,
 * and logs/cycle-N-summary.md to power the /evolution web page.
 */
import { readFileSync, existsSync, readdirSync } from 'fs'
import { resolve } from 'path'
import { marked } from 'marked'

const ROOT = resolve(process.cwd())
const EVOLUTION_DIR = resolve(ROOT, 'docs', 'evolution')
const METRICS_DIR = resolve(ROOT, 'docs', 'cycle-metrics')
const LOGS_DIR = resolve(ROOT, 'logs')

marked.setOptions({ breaks: true, gfm: true })

export interface CycleMetricsSummary {
  cycle: number
  gameId: string
  genre: string
  artStyle: string
  verdict: string
  overallScore: number
  weakestDiscipline: string
  disciplines: { planning: number; development: number; art: number; qa: number }
  createdAt: string
}

export interface EvolutionCycleEntry {
  cycle: number
  metrics?: CycleMetricsSummary
  appliedCount: number
  deferredCount: number
  failedCount: number
  hasProposal: boolean
  hasApplied: boolean
  hasSummary: boolean
}

function safeRead(path: string): string {
  try { return existsSync(path) ? readFileSync(path, 'utf-8') : '' } catch { return '' }
}

function safeJson<T>(path: string): T | null {
  try {
    if (!existsSync(path)) return null
    return JSON.parse(readFileSync(path, 'utf-8')) as T
  } catch { return null }
}

/** Parse applied-cycle-N.md front-matter counts. */
function parseApplyCounts(md: string): { applied: number; deferred: number; failed: number } {
  const m = md.match(/^applied:\s*(\d+)[\s\S]*?^deferred:\s*(\d+)[\s\S]*?^failed:\s*(\d+)/m)
  if (!m) return { applied: 0, deferred: 0, failed: 0 }
  return { applied: parseInt(m[1], 10), deferred: parseInt(m[2], 10), failed: parseInt(m[3], 10) }
}

export function listEvolutionCycles(): EvolutionCycleEntry[] {
  if (!existsSync(METRICS_DIR)) return []
  const cycles = new Set<number>()
  for (const f of readdirSync(METRICS_DIR)) {
    const m = f.match(/^cycle-(\d+)\.json$/)
    if (m) cycles.add(parseInt(m[1], 10))
  }
  if (existsSync(EVOLUTION_DIR)) {
    for (const f of readdirSync(EVOLUTION_DIR)) {
      const m = f.match(/^(?:proposal|applied)-cycle-(\d+)\.md$/)
      if (m) cycles.add(parseInt(m[1], 10))
    }
  }

  return Array.from(cycles).sort((a, b) => b - a).map((cycle) => {
    const metrics = safeJson<CycleMetricsSummary>(resolve(METRICS_DIR, `cycle-${cycle}.json`)) ?? undefined
    const appliedMd = safeRead(resolve(EVOLUTION_DIR, `applied-cycle-${cycle}.md`))
    const counts = parseApplyCounts(appliedMd)
    return {
      cycle,
      metrics,
      appliedCount: counts.applied,
      deferredCount: counts.deferred,
      failedCount: counts.failed,
      hasProposal: existsSync(resolve(EVOLUTION_DIR, `proposal-cycle-${cycle}.md`)),
      hasApplied: !!appliedMd,
      hasSummary: existsSync(resolve(LOGS_DIR, `cycle-${cycle}-summary.md`)),
    }
  })
}

export function getDashboardHtml(): string {
  const md = safeRead(resolve(EVOLUTION_DIR, 'dashboard.md'))
  if (!md) return ''
  return marked.parse(md) as string
}

export function getProposalHtml(cycle: number): string {
  const md = safeRead(resolve(EVOLUTION_DIR, `proposal-cycle-${cycle}.md`))
  if (!md) return ''
  return marked.parse(md) as string
}

export function getAppliedHtml(cycle: number): string {
  const md = safeRead(resolve(EVOLUTION_DIR, `applied-cycle-${cycle}.md`))
  if (!md) return ''
  return marked.parse(md) as string
}

export function getSummaryHtml(cycle: number): string {
  const md = safeRead(resolve(LOGS_DIR, `cycle-${cycle}-summary.md`))
  if (!md) return ''
  return marked.parse(md) as string
}
