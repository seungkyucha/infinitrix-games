/**
 * Quality Dashboard — aggregates the last 10 cycles into a human-readable
 * markdown file with trend arrows and moving averages.
 *
 * Regenerated at the end of every cycle (after metrics collection). Gives
 * operators a one-glance view of which discipline is drifting and whether
 * recent evolver proposals have actually improved things.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadRecentMetrics } from './metrics.js'
import { computeDisciplineTrends } from './evolver.js'
import type { CycleMetrics, Discipline } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')
const EVOLUTION_DIR = resolve(PROJECT_ROOT, 'docs', 'evolution')
const DASHBOARD_PATH = resolve(EVOLUTION_DIR, 'dashboard.md')

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function trendArrow(deltaPercent: number): string {
  if (deltaPercent > 2) return '↗'
  if (deltaPercent < -2) return '↘'
  return '→'
}

function movingAvg(metrics: CycleMetrics[], discipline: Discipline, window = 3): number[] {
  const result: number[] = []
  for (let i = 0; i < metrics.length; i++) {
    const start = Math.max(0, i - window + 1)
    const slice = metrics.slice(start, i + 1).map(m => m.disciplines[discipline]?.score ?? 0)
    result.push(avg(slice))
  }
  return result
}

function countAppliedProposals(cycles: number[]): { total: number; applied: number; deferred: number } {
  let total = 0, applied = 0, deferred = 0
  for (const c of cycles) {
    const appliedPath = resolve(EVOLUTION_DIR, `applied-cycle-${c}.md`)
    if (!existsSync(appliedPath)) continue
    const md = readFileSync(appliedPath, 'utf-8')
    const m = md.match(/^applied:\s*(\d+)[\s\S]*?^deferred:\s*(\d+)/m)
    if (m) {
      applied += parseInt(m[1], 10)
      deferred += parseInt(m[2], 10)
      total += parseInt(m[1], 10) + parseInt(m[2], 10)
    }
  }
  return { total, applied, deferred }
}

export function buildDashboard(): string {
  const metrics = loadRecentMetrics(10)
  if (metrics.length === 0) {
    return `# InfiniTriX Quality Dashboard\n\n_No cycle metrics yet. Will populate as cycles complete._\n`
  }

  const trends = computeDisciplineTrends(metrics.slice(-3))
  const disciplines: Discipline[] = ['planning', 'development', 'art', 'qa']

  const lines: string[] = []
  lines.push('# InfiniTriX Quality Dashboard', '')
  lines.push(`_Last updated: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}_`, '')
  lines.push(`_Based on last ${metrics.length} cycles (${metrics[0].cycle}~${metrics[metrics.length - 1].cycle})_`, '')

  // ── Summary ────────────────────────────────────────────
  const latest = metrics[metrics.length - 1]
  lines.push('## 📊 Latest Cycle Snapshot', '')
  lines.push(`- **Cycle ${latest.cycle}** — ${latest.gameId} (${latest.genre}, ${latest.artStyle})`)
  lines.push(`- Verdict: **${latest.verdict}** / Overall: **${latest.overallScore.toFixed(1)}** / Weakest: ${latest.weakestDiscipline}`)
  lines.push('')

  // ── Trend table ────────────────────────────────────────
  lines.push('## 📈 Discipline Scores (최근 10사이클)', '')
  const header = ['Cycle', ...disciplines, 'Overall', 'Verdict']
  lines.push('| ' + header.join(' | ') + ' |')
  lines.push('|' + header.map(() => '---').join('|') + '|')
  for (const m of metrics) {
    const row = [
      String(m.cycle),
      ...disciplines.map(d => (m.disciplines[d]?.score ?? 0).toFixed(0)),
      m.overallScore.toFixed(1),
      m.verdict === 'APPROVED' ? '✅' : m.verdict === 'NEEDS_MINOR_FIX' ? '⚠️' : m.verdict === 'NEEDS_MAJOR_FIX' ? '❌' : '?',
    ]
    lines.push('| ' + row.join(' | ') + ' |')
  }
  lines.push('')

  // ── Moving avg + trend arrows ──────────────────────────
  lines.push('## 📉 3-Cycle Moving Average (디시플린별 추세)', '')
  for (const d of disciplines) {
    const ma = movingAvg(metrics, d, 3)
    const latestMa = ma[ma.length - 1]
    const oldMa = ma.length >= 4 ? ma[ma.length - 4] : ma[0]
    const delta = latestMa - oldMa
    const trendInfo = trends.find(t => t.discipline === d)
    const arrow = trendArrow(delta)
    const last3 = ma.slice(-3).map(n => n.toFixed(1)).join(' → ')
    lines.push(`- **${d}**: ${last3}  ${arrow} (${trendInfo?.direction ?? 'STABLE'}, Δ${delta.toFixed(1)})`)
  }
  lines.push('')

  // ── Evolver proposal stats ─────────────────────────────
  const cycleNumbers = metrics.map(m => m.cycle)
  const stats = countAppliedProposals(cycleNumbers)
  lines.push('## 🔧 Evolver 제안 통계 (최근 10사이클)', '')
  lines.push(`- 총 제안: ${stats.total}건`)
  lines.push(`- 자동 적용 (LOW): ${stats.applied}건`)
  lines.push(`- 수동 대기 (MEDIUM/HIGH): ${stats.deferred}건`)
  lines.push('')

  // ── Regression watch ───────────────────────────────────
  if (metrics.length >= 2) {
    const prev = metrics[metrics.length - 2]
    const currOverall = latest.overallScore
    const prevOverall = prev.overallScore
    if (currOverall < prevOverall - 10) {
      lines.push('## ⚠️ Regression Alert', '')
      lines.push(`- Cycle ${prev.cycle}: overall ${prevOverall.toFixed(1)}`)
      lines.push(`- Cycle ${latest.cycle}: overall ${currOverall.toFixed(1)} (-${(prevOverall - currOverall).toFixed(1)})`)
      lines.push(`- 자동 적용 최근 3사이클: ${stats.applied}건`)
      lines.push(`- 원인 추적: \`git log --grep=evolve\`, \`git tag | grep evolve\``)
      lines.push('')
    }
  }

  // ── Weakest signal details for latest cycle ────────────
  lines.push('## 🔍 최약 디시플린 시그널 (최신 사이클)', '')
  const weakSignals = latest.disciplines[latest.weakestDiscipline]?.signals ?? {}
  for (const [k, v] of Object.entries(weakSignals)) {
    lines.push(`- \`${k}\`: ${typeof v === 'number' ? v.toFixed(2) : String(v)}`)
  }
  lines.push('')

  return lines.join('\n')
}

export function saveDashboard(): string {
  if (!existsSync(EVOLUTION_DIR)) mkdirSync(EVOLUTION_DIR, { recursive: true })
  const content = buildDashboard()
  writeFileSync(DASHBOARD_PATH, content)
  return DASHBOARD_PATH
}
