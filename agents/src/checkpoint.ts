/**
 * Cycle checkpoint — resume mid-cycle after token exhaustion.
 *
 * Flow:
 *   - Each completed phase of the cycle writes its name to logs/checkpoint.json.
 *   - On cycle restart (same cycleNumber), we skip phases already listed.
 *   - On full cycle success (deploy completes), we clear the checkpoint.
 *   - Recovery preserves on-disk artefacts (spec.md, review.md, assets, etc.)
 *     which are the source of truth for resumed phases.
 *
 * The checkpoint does NOT store in-memory state — gameId/title/genre are
 * re-parsed from spec.md each time a phase runs, so resuming is idempotent.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')
const CHECKPOINT_PATH = resolve(PROJECT_ROOT, 'logs', 'checkpoint.json')

export type PhaseName =
  | 'analysis'
  | 'planning'
  | 'designing'
  | 'coding'
  | 'review_1st'
  | 'review_2nd'
  | 'engine_promote'
  | 'postmortem'
  | 'self_evolution'
  | 'deploy'

export interface CycleCheckpoint {
  cycle: number
  completedPhases: PhaseName[]
  startedAt: string
  updatedAt: string
  resumedCount: number
}

export function loadCheckpoint(cycle: number): CycleCheckpoint | null {
  if (!existsSync(CHECKPOINT_PATH)) return null
  try {
    const cp: CycleCheckpoint = JSON.parse(readFileSync(CHECKPOINT_PATH, 'utf-8'))
    if (cp.cycle !== cycle) return null  // stale checkpoint from earlier cycle
    return cp
  } catch {
    return null
  }
}

export function initCheckpoint(cycle: number, existing?: CycleCheckpoint | null): CycleCheckpoint {
  if (existing) return { ...existing, resumedCount: (existing.resumedCount ?? 0) + 1, updatedAt: new Date().toISOString() }
  return {
    cycle,
    completedPhases: [],
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resumedCount: 0,
  }
}

export function saveCheckpoint(cp: CycleCheckpoint): void {
  mkdirSync(dirname(CHECKPOINT_PATH), { recursive: true })
  cp.updatedAt = new Date().toISOString()
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(cp, null, 2))
}

export function markPhaseDone(cp: CycleCheckpoint, phase: PhaseName): void {
  if (!cp.completedPhases.includes(phase)) {
    cp.completedPhases.push(phase)
    saveCheckpoint(cp)
  }
}

export function hasPhaseDone(cp: CycleCheckpoint, phase: PhaseName): boolean {
  return cp.completedPhases.includes(phase)
}

export function clearCheckpoint(cycle: number): void {
  if (!existsSync(CHECKPOINT_PATH)) return
  try {
    const cp: CycleCheckpoint = JSON.parse(readFileSync(CHECKPOINT_PATH, 'utf-8'))
    if (cp.cycle === cycle) unlinkSync(CHECKPOINT_PATH)
  } catch { /* ignore */ }
}
