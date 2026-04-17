/**
 * Meta-Evolver — analyzes the last 3 cycle metrics and asks the evolver agent
 * to propose targeted improvements per discipline.
 *
 * Triggered by cycle.ts every N cycles (default 3, configurable via
 * EVOLVER_PERIOD env var). Writes docs/evolution/proposal-cycle-N.md.
 * apply-proposal.ts then consumes that file and auto-applies LOW-safety items.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { agentRoles } from './team.js'
import { loadRecentMetrics } from './metrics.js'
import { startAgent, completeAgent, logTool } from './status-logger.js'
import type { CycleMetrics, Discipline, DisciplineTrend, TrendDirection } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')
const EVOLUTION_DIR = resolve(PROJECT_ROOT, 'docs', 'evolution')

// ═══════════════════════════════════════════════════════════
// Trend computation
// ═══════════════════════════════════════════════════════════

function computeTrend(recent: number[]): { direction: TrendDirection; delta: number } {
  if (recent.length < 2) return { direction: 'STABLE', delta: 0 }
  const first = recent[0]
  const last = recent[recent.length - 1]
  const delta = last - first
  const max = Math.max(...recent)
  const min = Math.min(...recent)

  if (max - min > 20) return { direction: 'VOLATILE', delta }

  // monotonic check
  let improving = true, declining = true
  for (let i = 1; i < recent.length; i++) {
    if (recent[i] <= recent[i - 1]) improving = false
    if (recent[i] >= recent[i - 1]) declining = false
  }

  if (improving && delta > 2) return { direction: 'IMPROVING', delta }
  if (declining && delta < -2) return { direction: 'DECLINING', delta }
  return { direction: 'STABLE', delta }
}

export function computeDisciplineTrends(metrics: CycleMetrics[]): DisciplineTrend[] {
  const disciplines: Discipline[] = ['planning', 'development', 'art', 'qa']
  return disciplines.map(d => {
    const recent = metrics.map(m => m.disciplines[d]?.score ?? 0)
    const { direction, delta } = computeTrend(recent)
    return { discipline: d, recent, direction, delta }
  })
}

// ═══════════════════════════════════════════════════════════
// Evolver agent invocation
// ═══════════════════════════════════════════════════════════

/** Returns true if proposal file was written. */
export async function runEvolver(currentCycle: number): Promise<boolean> {
  // Load up to 3 for trend, but run even with 1 (evolver is per-cycle now).
  const recent = loadRecentMetrics(3)
  if (recent.length < 1) {
    console.log(`  ⚠️ [Evolver] metrics 없음 — skip`)
    return false
  }

  const trends = computeDisciplineTrends(recent)
  const trendConfidence = recent.length >= 3 ? 'HIGH (3사이클 추세)'
                        : recent.length === 2 ? 'LOW (2사이클 비교)'
                        : 'VERY_LOW (단일 사이클 스냅샷)'

  // Print trend table to console for operator visibility
  const trendTable = trends.map(t => {
    const arrow = t.direction === 'IMPROVING' ? '↗' : t.direction === 'DECLINING' ? '↘' : t.direction === 'VOLATILE' ? '↔' : '→'
    return `  ${t.discipline.padEnd(12)} | ${t.recent.map(s => s.toFixed(0).padStart(3)).join(' | ')} | ${arrow} ${t.direction} (Δ${t.delta.toFixed(1)})`
  }).join('\n')
  console.log(`\n📊 [Evolver] Discipline trends (cycles ${recent.map(m => m.cycle).join(', ')}):\n${trendTable}`)

  if (!existsSync(EVOLUTION_DIR)) mkdirSync(EVOLUTION_DIR, { recursive: true })

  const trendSummary = trends.map(t =>
    `- ${t.discipline}: ${t.recent.map(s => s.toFixed(0)).join(' → ')} (${t.direction}, Δ${t.delta.toFixed(1)})`
  ).join('\n')

  const weakDisciplines = trends
    .filter(t => t.direction === 'DECLINING' || t.recent[t.recent.length - 1] < 70)
    .map(t => t.discipline)

  const cycleList = recent.map(m => m.cycle).join(', ')
  const inputFiles = recent.map(m => `- docs/cycle-metrics/cycle-${m.cycle}.json\n- docs/post-mortem/cycle-${m.cycle}-postmortem.md`).join('\n')

  const prompt = `
사이클 ${currentCycle} 종료 후 Self-Evolution 분석입니다.

═══════════════════════════════════════════════════
Discipline 추세 (사이클: ${cycleList})
신뢰도: ${trendConfidence}
═══════════════════════════════════════════════════

${trendSummary}

${weakDisciplines.length > 0
  ? `⚠️ 우선 개선 대상: ${weakDisciplines.join(', ')}`
  : '추세가 안정적입니다. VOLATILE 요소가 있다면 안정화에 집중하세요.'}

${recent.length < 3
  ? `⚠️ 사이클 데이터가 ${recent.length}개뿐이라 추세 신뢰도가 낮습니다.\n   단일 사이클의 signal(낮은 개별 signal값, 반복되지 않은 이슈)은 개선 제안의 근거로 쓰지 말 것.\n   단, 명백한 구조적 문제(예: engineAdoption < 0.2, customStateMachines > 0)는 즉시 개선 제안 가능.`
  : ''}

═══════════════════════════════════════════════════
입력 자료 (모두 읽을 것)
═══════════════════════════════════════════════════

${inputFiles}
- docs/meta/wisdom-*.md (모든 에이전트 지혜)
- docs/meta/platform-wisdom.md
- docs/engine-notes/ 폴더의 최근 사이클 파일들
- public/engine/ix-engine.js (엔진 현재 상태)
- agents/src/team.ts (에이전트 프롬프트 현재 상태)

═══════════════════════════════════════════════════
작업
═══════════════════════════════════════════════════

스킬 \`evolve-proposal\`의 절차를 따라
docs/evolution/proposal-cycle-${currentCycle}.md 를 작성하세요.

⚠️ 제안을 남발하지 말 것 — 확신이 있는 것만 (총 최대 6개).
⚠️ 각 제안에 diff block이 반드시 포함되어야 합니다 (자동 적용 가능하도록).
⚠️ **이 시스템은 LOW와 MEDIUM 모두 자동 적용됩니다**.
   - LOW: 기존 동작 영향 0 (새 섹션 추가, 새 파일, 새 메서드)
   - MEDIUM: 기존 rule/API 수정 (영향 제한적 — 반드시 diff-old 유일성 검증 + 하위호환)
   - HIGH: 구조적 변경 (phase 순서/agent 역할/scoring) — 수동 검토 대기
⚠️ MEDIUM 판정 시 반드시 "영향 분석" 항목을 rationale에 포함:
   - 어떤 기존 호출/로직이 영향받는지
   - 하위호환 깨지지 않음을 어떻게 보장했는지
   - 실패 시 rollback 경로 (git tag evolve/cycle-${currentCycle})
`

  startAgent('evolver', 6, '자가진화 분석', 'Self-Evolution Analysis')

  let output = ''
  try {
    for await (const msg of query({
      prompt,
      options: {
        cwd: PROJECT_ROOT,
        model: 'claude-opus-4-7',
        systemPrompt: agentRoles.evolver.prompt,
        settingSources: ['project'],
        permissionMode: 'acceptEdits',
        allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash'],
        maxTurns: 40,
        hooks: {
          PreToolUse: [{
            hooks: [async (input: unknown) => {
              try {
                const i = input as { tool_name?: string; tool_input?: unknown }
                logTool('evolver', i.tool_name ?? '', JSON.stringify(i.tool_input ?? {}))
              } catch {}
              return { continue: true }
            }],
          }],
        },
      },
    })) {
      const m = msg as { type?: string; message?: { content?: Array<{ type: string; text?: string }> } }
      if (m.type === 'assistant' && m.message?.content) {
        for (const c of m.message.content) if (c.type === 'text' && c.text) output += c.text
      }
    }
  } finally {
    completeAgent('evolver')
  }

  const proposalPath = resolve(EVOLUTION_DIR, `proposal-cycle-${currentCycle}.md`)
  if (!existsSync(proposalPath)) {
    // Evolver agent didn't write the file — save output as fallback so the attempt is preserved
    writeFileSync(proposalPath, `---\ncycle: ${currentCycle}\nbasedOn: [${recent.map(m => m.cycle).join(', ')}]\nstatus: NO_PROPOSAL\n---\n\n(Evolver agent completed without writing a proposal file. Raw output below.)\n\n${output}\n`)
    console.log(`  ⚠️ [Evolver] no proposal file produced — saved raw output`)
    return false
  }

  console.log(`  ✅ [Evolver] proposal saved: ${proposalPath}`)
  return true
}
