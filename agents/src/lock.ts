/**
 * Single-instance PID lock for the cycle runner.
 *
 * Prevents two `npm start` invocations from racing on the same checkpoint,
 * logs, and git working tree. Write PID at startup, delete on graceful exit,
 * and reclaim stale locks only when the recorded PID is confirmed dead.
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')
export const LOCK_FILE = resolve(PROJECT_ROOT, 'logs', 'main.pid')

/** Check if a PID is alive on this OS. process.kill(pid, 0) works on both POSIX and Windows. */
function isPidAlive(pid: number): boolean {
  if (!Number.isFinite(pid) || pid <= 0) return false
  try { process.kill(pid, 0); return true } catch { return false }
}

export interface LockResult {
  acquired: boolean
  reason?: string
  existingPid?: number
}

/** Acquire the exclusive lock. Idempotent on same-PID takeover (defensive). */
export function acquireLock(): LockResult {
  mkdirSync(dirname(LOCK_FILE), { recursive: true })

  if (existsSync(LOCK_FILE)) {
    let existingPid = 0
    try { existingPid = parseInt(readFileSync(LOCK_FILE, 'utf-8').trim(), 10) } catch {}
    if (existingPid && existingPid !== process.pid && isPidAlive(existingPid)) {
      return {
        acquired: false,
        reason: `another cycle runner is already alive (PID ${existingPid})`,
        existingPid,
      }
    }
    if (existingPid && existingPid !== process.pid) {
      console.warn(`[lock] stale lock from PID ${existingPid} — cleaning up and taking over`)
    }
    try { unlinkSync(LOCK_FILE) } catch {}
  }

  writeFileSync(LOCK_FILE, String(process.pid))
  return { acquired: true }
}

export function releaseLock(): void {
  try {
    if (!existsSync(LOCK_FILE)) return
    const recorded = parseInt(readFileSync(LOCK_FILE, 'utf-8').trim(), 10)
    if (recorded === process.pid) unlinkSync(LOCK_FILE)
  } catch { /* best-effort */ }
}

/** Register signal + exit handlers so the lock is always released. */
export function installLockHandlers(): void {
  const cleanup = () => { releaseLock() }
  process.on('exit', cleanup)
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT'] as NodeJS.Signals[]) {
    process.on(sig, () => {
      cleanup()
      // Exit with the conventional 128 + signalNumber for scripted supervisors.
      const code = sig === 'SIGINT' ? 130 : sig === 'SIGTERM' ? 143 : 1
      process.exit(code)
    })
  }
}
