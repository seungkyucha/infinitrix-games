/**
 * Auto-apply evolver proposals that are marked safety=LOW.
 *
 * Proposal parsing: reads `docs/evolution/proposal-cycle-N.md` and extracts
 * one section per proposal. Each LOW proposal must contain either:
 *   - old_string / new_string fenced blocks (for Edit)
 *   - full_content fenced block (for Write / new file)
 *
 * After applying, run tsc and (if an engine file was touched) a parse check.
 * On success, git-commit with an `evolve/cycle-N` tag so rollback is trivial.
 * On TS or parse failure, revert the edits and defer the proposal.
 */
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { EvolutionProposal, ProposalSafety } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')

interface ParsedProposal extends EvolutionProposal {
  rawSection: string
}

// ═══════════════════════════════════════════════════════════
// Parser
// ═══════════════════════════════════════════════════════════

/**
 * Split the proposal markdown into per-proposal sections and extract fields.
 * Format expected (from evolve-proposal skill):
 *
 * ## 제안 #1
 * - discipline: development
 * - category: PROMPT_RULE
 * - safety: LOW
 * - title: <short>
 * - target-file: <path>
 * - rationale: <reason>
 *
 * ```diff-old (path: <file>)
 * ...exact text to replace...
 * ```
 * ```diff-new
 * ...replacement text...
 * ```
 *
 * Or for new-file proposals:
 * ```diff-new (full: <file>)
 * ...full contents...
 * ```
 */
export function parseProposals(markdown: string): ParsedProposal[] {
  const sections = markdown.split(/^##\s*제안\s*#?/gm).slice(1)
  const proposals: ParsedProposal[] = []

  for (const rawSection of sections) {
    const idMatch = rawSection.match(/^\s*(\d+)/)
    const id = idMatch ? parseInt(idMatch[1], 10) : proposals.length + 1

    const field = (name: string) => {
      const m = rawSection.match(new RegExp(`[-*]\\s*${name}\\s*:\\s*([^\\n]+)`, 'i'))
      return m?.[1]?.trim() ?? ''
    }

    const discipline = field('discipline') as EvolutionProposal['discipline']
    const category = field('category') as EvolutionProposal['category']
    const safety = field('safety').toUpperCase() as ProposalSafety
    const title = field('title')
    const targetFile = field('target-file')
    const rationale = field('rationale')

    // Old/New block pairs for Edit
    const oldMatch = rawSection.match(/```diff-old[^\n]*\n([\s\S]*?)```/)
    const newMatch = rawSection.match(/```diff-new[^\n]*\n([\s\S]*?)```/)
    const fullMatch = rawSection.match(/```diff-new\s*\(full[^)]*\)\s*\n([\s\S]*?)```/)

    const oldString = oldMatch ? oldMatch[1].replace(/\n$/, '') : undefined
    const newString = newMatch ? newMatch[1].replace(/\n$/, '') : undefined
    const fullContent = fullMatch ? fullMatch[1].replace(/\n$/, '') : undefined

    proposals.push({
      id, discipline, category, safety,
      title, targetFile, rationale,
      pattern: field('pattern'),
      oldString, newString, fullContent,
      rawSection,
    })
  }

  return proposals
}

// ═══════════════════════════════════════════════════════════
// Validators
// ═══════════════════════════════════════════════════════════

interface BackupEntry { path: string; original: string | null }

function backupFile(path: string): BackupEntry {
  return { path, original: existsSync(path) ? readFileSync(path, 'utf-8') : null }
}

function restoreFile(entry: BackupEntry): void {
  if (entry.original === null) {
    try { require('fs').unlinkSync(entry.path) } catch {}
  } else {
    writeFileSync(entry.path, entry.original)
  }
}

function runCheck(cmd: string): { ok: boolean; output: string } {
  try {
    const out = execSync(cmd, { cwd: PROJECT_ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] })
    return { ok: true, output: out }
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message?: string }
    return { ok: false, output: (err.stdout ?? '') + '\n' + (err.stderr ?? err.message ?? '') }
  }
}

/** Fast heuristic: TS project typecheck subset. */
function validateTypescript(): { ok: boolean; output: string } {
  return runCheck('cd agents && npx tsc --noEmit')
}

/** Engine file must still parse as valid JS. */
function validateEngineParse(): { ok: boolean; output: string } {
  return runCheck('node -e "const fs=require(\'fs\'); const s=fs.readFileSync(\'public/engine/ix-engine.js\',\'utf8\'); new Function(s);"')
}

// ═══════════════════════════════════════════════════════════
// Applier
// ═══════════════════════════════════════════════════════════

interface ApplyResult {
  applied: ParsedProposal[]
  deferred: Array<{ proposal: ParsedProposal; reason: string }>
  failed: Array<{ proposal: ParsedProposal; reason: string }>
}

/** Numeric rank so "autoLevel ≥ proposalSafety" works. */
const SAFETY_RANK: Record<string, number> = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3 }

export async function applyProposals(proposalPath: string, cycle: number): Promise<ApplyResult> {
  const result: ApplyResult = { applied: [], deferred: [], failed: [] }
  if (!existsSync(proposalPath)) {
    console.log(`  ⚠️ [Apply] proposal file not found: ${proposalPath}`)
    return result
  }

  const markdown = readFileSync(proposalPath, 'utf-8')
  const proposals = parseProposals(markdown)

  const autoLevel = (process.env.EVOLVER_AUTO_APPLY ?? 'MEDIUM').toUpperCase()
  const autoRank = SAFETY_RANK[autoLevel] ?? SAFETY_RANK.MEDIUM
  const dryRun = process.env.EVOLVER_DRY_RUN === '1'

  for (const p of proposals) {
    const pRank = SAFETY_RANK[p.safety] ?? 99
    if (pRank > autoRank || pRank === 0) {
      result.deferred.push({ proposal: p, reason: `safety=${p.safety}, auto-threshold=${autoLevel}` })
      continue
    }
    if (!p.targetFile) {
      result.failed.push({ proposal: p, reason: 'missing target-file' })
      continue
    }
    const fullPath = resolve(PROJECT_ROOT, p.targetFile)

    // Validate proposal has actionable content
    const hasEdit = !!(p.oldString && p.newString)
    const hasWrite = !!p.fullContent
    if (!hasEdit && !hasWrite) {
      result.failed.push({ proposal: p, reason: 'no diff blocks' })
      continue
    }

    if (dryRun) {
      console.log(`  [DRY] would apply #${p.id} ${p.title} → ${p.targetFile}`)
      result.applied.push(p)
      continue
    }

    // Apply
    const backup = backupFile(fullPath)
    try {
      if (hasEdit) {
        if (backup.original === null) throw new Error('file does not exist for Edit')
        if (!backup.original.includes(p.oldString!)) {
          throw new Error('old_string not found in target')
        }
        if (backup.original.split(p.oldString!).length > 2) {
          throw new Error('old_string not unique in target')
        }
        writeFileSync(fullPath, backup.original.replace(p.oldString!, p.newString!))
      } else if (hasWrite) {
        const dir = dirname(fullPath)
        if (!existsSync(dir)) require('fs').mkdirSync(dir, { recursive: true })
        writeFileSync(fullPath, p.fullContent!)
      }

      // Validate: engine must parse if we touched it
      if (fullPath.endsWith('ix-engine.js') || fullPath.includes('/engine/')) {
        const v = validateEngineParse()
        if (!v.ok) throw new Error('engine parse failed: ' + v.output.slice(0, 200))
      }

      // Validate: TS typecheck if we touched TS files under agents/
      if (fullPath.includes('/agents/src/') && fullPath.endsWith('.ts')) {
        const v = validateTypescript()
        if (!v.ok) throw new Error('tsc failed: ' + v.output.slice(0, 300))
      }

      result.applied.push(p)
      const tag = p.safety === 'MEDIUM' ? '🟡' : '✅'
      console.log(`  ${tag} [Apply] #${p.id} [${p.safety}] ${p.title} → ${p.targetFile}`)
    } catch (err) {
      restoreFile(backup)
      const reason = (err as Error).message
      result.failed.push({ proposal: p, reason })
      console.log(`  ❌ [Apply] #${p.id} reverted: ${reason}`)
    }
  }

  // Commit applied changes atomically
  if (!dryRun && result.applied.length > 0) {
    try {
      const lowCount = result.applied.filter(p => p.safety === 'LOW').length
      const medCount = result.applied.filter(p => p.safety === 'MEDIUM').length
      const summaryTag = medCount > 0 ? '[MEDIUM]' : '[LOW]'
      execSync(`git add -A`, { cwd: PROJECT_ROOT, stdio: 'pipe' })
      const msg = `evolve(cycle ${cycle}) ${summaryTag}: ${result.applied.length} auto-applied (L${lowCount}/M${medCount})\n\n${result.applied.map(p => `- #${p.id} [${p.discipline}/${p.category}/${p.safety}] ${p.title}`).join('\n')}`
      execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, { cwd: PROJECT_ROOT, stdio: 'pipe' })
      try { execSync(`git tag evolve/cycle-${cycle}`, { cwd: PROJECT_ROOT, stdio: 'pipe' }) } catch {}
      console.log(`  🏷️  [Apply] committed (L${lowCount}/M${medCount}) + tagged evolve/cycle-${cycle}`)
    } catch (err) {
      console.log(`  ⚠️ [Apply] git commit failed: ${(err as Error).message}`)
    }
  }

  // Write apply report
  writeApplyReport(cycle, result)

  return result
}

function writeApplyReport(cycle: number, result: ApplyResult): void {
  const reportPath = resolve(PROJECT_ROOT, 'docs', 'evolution', `applied-cycle-${cycle}.md`)
  const lines: string[] = [
    `---`,
    `cycle: ${cycle}`,
    `applied: ${result.applied.length}`,
    `deferred: ${result.deferred.length}`,
    `failed: ${result.failed.length}`,
    `---`, '',
    `# Evolution Apply Report — Cycle ${cycle}`, '',
  ]

  if (result.applied.length > 0) {
    const lowCount = result.applied.filter(p => p.safety === 'LOW').length
    const medCount = result.applied.filter(p => p.safety === 'MEDIUM').length
    lines.push(`## 자동 적용됨 (LOW ${lowCount}건 / MEDIUM ${medCount}건)`)
    for (const p of result.applied) {
      const badge = p.safety === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW'
      lines.push(`- ${badge} #${p.id} **[${p.discipline}/${p.category}]** ${p.title} → \`${p.targetFile}\``)
    }
    lines.push('')
  }
  if (result.deferred.length > 0) {
    lines.push('## 보류됨 (수동 검토 필요)')
    for (const { proposal: p, reason } of result.deferred) {
      lines.push(`- #${p.id} **[${p.discipline}/${p.category}]** ${p.title} — *${reason}*`)
    }
    lines.push('')
  }
  if (result.failed.length > 0) {
    lines.push('## 적용 실패 (rollback 완료)')
    for (const { proposal: p, reason } of result.failed) {
      lines.push(`- #${p.id} **[${p.discipline}/${p.category}]** ${p.title} — *${reason}*`)
    }
    lines.push('')
  }

  writeFileSync(reportPath, lines.join('\n'))
}
