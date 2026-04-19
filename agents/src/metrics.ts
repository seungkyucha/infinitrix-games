/**
 * Cycle metrics collector — 4-Discipline quality scorecard.
 *
 * Called at the end of each cycle. Parses the cycle's artefacts (spec, review,
 * index.html, manifest, postmortem, engine-notes) and computes 27 signals
 * grouped into 4 disciplines (planning / development / art / qa).
 *
 * Output: docs/cycle-metrics/cycle-N.json  — machine-readable input for
 * evolver.ts (which runs every 3 cycles) and dashboard.ts (which aggregates
 * the last 10 cycles for human-readable trends).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { CycleMetrics, Discipline, DisciplineScore } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')
const METRICS_DIR = resolve(PROJECT_ROOT, 'docs', 'cycle-metrics')

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function readFileSafe(path: string): string {
  try { return existsSync(path) ? readFileSync(path, 'utf-8') : '' }
  catch { return '' }
}

function clamp(n: number, lo = 0, hi = 100): number { return Math.max(lo, Math.min(hi, n)) }

/** Extract a scalar value from YAML-ish front-matter. */
function extractYaml(text: string, key: string): string {
  const m = text.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, 'm'))
  return m?.[1]?.trim() ?? ''
}

function countMatches(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length
}

/**
 * Given a regex that matches a function header ending with `{`,
 * return the body substring up to the matching closing brace.
 * Returns '' when the header isn't found.
 */
function extractBalancedBody(src: string, headerRe: RegExp): string {
  const m = src.match(headerRe)
  if (!m || m.index == null) return ''
  const start = m.index + m[0].length
  let depth = 1
  let i = start
  while (i < src.length && depth > 0) {
    const c = src[i]
    if (c === '{') depth++
    else if (c === '}') depth--
    i++
  }
  return depth === 0 ? src.slice(start, i - 1) : ''
}

// ═══════════════════════════════════════════════════════════
// 🎯 Planning signals (6)
// ═══════════════════════════════════════════════════════════

interface PlanningInputs {
  specText: string
  recentGenres: string[]
  recentStyles: string[]
  currentGenre: string
  currentStyle: string
  plannerReworkCount: number
  postmortemText: string
  manifestText: string
}

function scorePlanning(inp: PlanningInputs): DisciplineScore {
  // specCompleteness: 6 required sections
  const sections = ['게임루프', '조작', '난이도', '에셋|asset-requirements', '승리|클리어|점수', '재시작']
  const hasSectionCount = sections.filter(pattern => new RegExp(pattern, 'i').test(inp.specText)).length
  const specCompleteness = hasSectionCount / sections.length

  // genre/style diversity: overlap count in last 10
  const genreDupCount = inp.recentGenres.filter(g => g === inp.currentGenre).length
  const styleDupCount = inp.recentStyles.filter(s => s === inp.currentStyle).length

  // refChainValid: ratio of variation-assets with a valid ref
  let refValid = 1.0
  try {
    const m = JSON.parse(inp.manifestText || '{}') as { assets?: Record<string, { ref?: string }> }
    const assets = Object.values(m.assets ?? {})
    const possibleVariations = assets.filter(a =>
      typeof a.ref === 'string' || /attack|hurt|walk|run|jump|death|idle/i.test(JSON.stringify(a))
    )
    if (possibleVariations.length > 0) {
      const withRef = possibleVariations.filter(a => !!a.ref).length
      refValid = withRef / possibleVariations.length
    }
  } catch { /* manifest unreadable — keep default 1.0 */ }

  // postmortem depth: bullet count under "근본원인|root-cause" sections
  const postmortemDepth = countMatches(inp.postmortemText, /^[-*]\s+.+/gm)

  const score = clamp(
    specCompleteness * 40
    + Math.max(0, 20 - genreDupCount * 5)
    + Math.max(0, 15 - styleDupCount * 3)
    + refValid * 15
    - Math.min(10, inp.plannerReworkCount * 5)
    + Math.min(20, postmortemDepth * 2),
  )

  return {
    score,
    signals: {
      specCompleteness,
      genreDupCount,
      styleDupCount,
      refChainValid: refValid,
      plannerReworkCount: inp.plannerReworkCount,
      postmortemDepth,
    },
  }
}

// ═══════════════════════════════════════════════════════════
// 💻 Development signals (7)
// ═══════════════════════════════════════════════════════════

interface DevelopmentInputs {
  htmlText: string
  enginePromotionText: string
}

function scoreDevelopment(inp: DevelopmentInputs): DisciplineScore {
  const html = inp.htmlText

  // engineAdoption: IX.* calls / total function-like calls
  const ixCalls = countMatches(html, /\bIX\.(Engine|Input|Sound|Tween|Particles|AssetLoader|UI|Save|MathUtil|Layout|Sprite|Button|Scene|GameFlow|StateGuard|Genre)\b/g)
  const destructuredCalls = countMatches(html, /\b(Engine|Input|Sound|Tween|Particles|AssetLoader|Button|Scene|GameFlow|StateGuard|UI|MathUtil|Layout|Sprite)\s*[.(]/g)
  const allCalls = countMatches(html, /\b\w+\s*\(/g)
  // Exclude language built-ins from denominator — they are not "engine API" candidates.
  // (Math/JSON/Object/Array/Number/String/console namespaced + parseInt/parseFloat/isNaN/isFinite + new Set/Map/Promise/Error/RegExp/Date/WeakMap/WeakSet)
  const builtinCalls =
      countMatches(html, /\b(Math|JSON|Object|Array|Number|String|console)\s*\./g)
    + countMatches(html, /\b(parseInt|parseFloat|isNaN|isFinite)\s*\(/g)
    + countMatches(html, /\bnew\s+(Set|Map|Promise|Error|RegExp|Date|WeakMap|WeakSet)\s*\(/g)
  const totalCallsApprox = Math.max(1, allCalls - builtinCalls)
  const engineAdoption = totalCallsApprox > 0
    ? clamp(((ixCalls + destructuredCalls) / totalCallsApprox) * 100) / 100
    : 0

  // customStateMachines: anti-pattern detector
  const customStateMachines = countMatches(
    html,
    /(TRANSITION_TABLE|ACTIVE_SYSTEMS|beginTransition|setState\s*\(|currentState\s*=|_stateMachine|statesMap)/g,
  )

  // directListenerCount: engine bypass
  const directListener =
      countMatches(html, /window\.addEventListener|document\.addEventListener/g)
    + countMatches(html, /(^|[^.])\bsetTimeout\s*\(/g)
    + countMatches(html, /(^|[^.])\bsetInterval\s*\(/g)
  // Engine constructor own listeners are inside ix-engine.js, so games should have 0 direct

  // onResetCoverage: variable names in onReset body vs total mutable globals
  const letVars = [...html.matchAll(/^\s*let\s+([a-zA-Z_][\w$]*)/gm)].map(m => m[1])
  const varVars = [...html.matchAll(/^\s*var\s+([a-zA-Z_][\w$]*)/gm)].map(m => m[1])
  const constColls = [...html.matchAll(/^\s*const\s+([a-zA-Z_][\w$]*)\s*=\s*(\[\]|\{\}|new Map|new Set)/gm)].map(m => m[1])
  const mutableGlobals = Array.from(new Set([...letVars, ...varVars, ...constColls]))

  const resetBody = extractBalancedBody(html, /function\s+resetGameState\s*\([^)]*\)\s*\{/)
    || extractBalancedBody(html, /onReset\s*:\s*\([^)]*\)\s*=>\s*\{/)
    || extractBalancedBody(html, /onReset\s*:\s*function\s*\([^)]*\)\s*\{/)
    || ((): string => {
      // Follow `onReset: <identifier>` references (e.g. `onReset: resetAll`)
      // to the actual `function <id>(...) { ... }` definition elsewhere in the file.
      // Identifier is captured via a bounded pattern so no regex injection is possible.
      const refMatch = html.match(/onReset\s*:\s*([a-zA-Z_][\w$]*)\s*[,}]/)
      if (!refMatch) return ''
      const fnName = refMatch[1]
      return extractBalancedBody(html, new RegExp(`function\\s+${fnName}\\s*\\([^)]*\\)\\s*\\{`))
    })()
    || ((): string => {
      // Follow `onReset: <identifier>` references (e.g. `onReset: resetAll`)
      // to the actual `function <id>(...) { ... }` definition elsewhere in the file.
      // Identifier is captured via a bounded pattern so no regex injection is possible.
      const refMatch = html.match(/onReset\s*:\s*([a-zA-Z_][\w$]*)\s*[,}]/)
      if (!refMatch) return ''
      const fnName = refMatch[1]
      return extractBalancedBody(html, new RegExp(`function\\s+${fnName}\\s*\\([^)]*\\)\\s*\\{`))
    })()
    || ((): string => {
      // Follow `onReset: <identifier>` references (e.g. `onReset: resetAll`)
      // to the actual `function <id>(...) { ... }` definition elsewhere in the file.
      // Identifier is captured via a bounded pattern so no regex injection is possible.
      const refMatch = html.match(/onReset\s*:\s*([a-zA-Z_][\w$]*)\s*[,}]/)
      if (!refMatch) return ''
      const fnName = refMatch[1]
      return extractBalancedBody(html, new RegExp(`function\\s+${fnName}\\s*\\([^)]*\\)\\s*\\{`))
    })()
  const coveredVars = mutableGlobals.filter(v => new RegExp(`\\b${v}\\b`).test(resetBody))
  const onResetCoverage = mutableGlobals.length > 0 ? coveredVars.length / mutableGlobals.length : 1

  // buttonKeyCoverage
  const buttonCtors = [...html.matchAll(/new\s+(?:IX\.)?Button\s*\(\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g)]
  const totalButtons = buttonCtors.length
  const buttonsWithKey = buttonCtors.filter(m => /\bkey\s*:/.test(m[1])).length
  const buttonKeyCoverage = totalButtons > 0 ? buttonsWithKey / totalButtons : 1

  // codeLineCount
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/)
  const codeLineCount = scriptMatch ? scriptMatch[1].split('\n').length : html.split('\n').length

  // enginePromotions — 승격 헤더는 항상 `### ... IX.<Symbol> ...` 구조.
  // 과거: `## 승격` 고정 섹션의 `### ` 만 카운트 → `## N차 검증` 섹션의 `### 추가 승격: IX.X`
  // 와 `## 보류` 섹션의 `### 2. 패럴렉스`(IX. 없음) 를 동시에 혼동하여 false-positive/negative 발생.
  // 수정: 전체 문서에서 `### ` 헤더 중 같은 줄에 `IX.` 심볼을 언급한 항목만 실제 승격으로 인정.
  const enginePromotions = countMatches(inp.enginePromotionText, /^###\s+[^\n]*IX\./gm)

  const score = clamp(
    engineAdoption * 25
    + Math.max(0, 15 - customStateMachines * 5)
    + Math.max(0, 15 - directListener * 2)
    + onResetCoverage * 20
    + buttonKeyCoverage * 15
    + Math.max(0, 5 - Math.abs(codeLineCount - 1500) / 200)
    + Math.min(15, enginePromotions * 5),
  )

  return {
    score,
    signals: {
      engineAdoption,
      customStateMachines,
      directListenerCount: directListener,
      onResetCoverage,
      totalMutableGlobals: mutableGlobals.length,
      buttonKeyCoverage,
      totalButtons,
      codeLineCount,
      enginePromotions,
    },
  }
}

// ═══════════════════════════════════════════════════════════
// 🎨 Art signals (6)
// ═══════════════════════════════════════════════════════════

interface ArtInputs {
  manifestText: string
  specText: string
  assetsDir: string
  requestedAssetCount: number
  generatedAssetCount: number
  failedAssetCount: number
  verifyFailedCount: number
}

function scoreArt(inp: ArtInputs): DisciplineScore {
  // stylePurity: manifest.art-style matches spec (normalize: strip non-alphanumerics to absorb hyphen/space/punct differences)
  let stylePurity = 1
  try {
    const m = JSON.parse(inp.manifestText || '{}') as { artDirection?: { style?: string } }
    const manifestStyle = (m.artDirection?.style ?? '').toLowerCase()
    const specStyle = extractYaml(inp.specText, 'art-style').toLowerCase()
    if (specStyle && manifestStyle) {
      const norm = (s: string) => s.replace(/[^a-z0-9]/g, '')
      const ns = norm(specStyle)
      const nm = norm(manifestStyle)
      // 현재(구): 양쪽에서 20자만 잘라 비교 — 짧은 canonical (예: 'handdrawn2d' 11자) 이 긴 서술에
      // 완전 포함돼도 nm.slice(0,20) 이 ns 에 담길 수 없어 항상 FAIL. 3사이클 연속 false-0.5 원인.
      // 수정: 짧은 쪽이 긴 쪽의 부분문자열이면 MATCH (canonical-in-descriptive 패턴을 정식 인정).
      // 3사이클 연속 0.5 고정 해결: canonical(`painterly-2d`) 토큰이 descriptive
      // (`Painterly digital 2D illustration`) 안에서 `digital` 같은 단어로 인터리빙되면
      // substring 양방향 비교가 실패. canonical 을 하이픈/공백으로 split 한 뒤 모든 토큰이
      // normalized manifest 에 존재하면 MATCH 로 인정한다.
      const tokens = specStyle.split(/[-\s_]+/).map(t => t.replace(/[^a-z0-9]/g, '')).filter(t => t.length >= 2)
      const allTokensPresent = tokens.length > 0 && tokens.every(t => nm.includes(t))
      stylePurity = (ns && nm && (nm.includes(ns) || ns.includes(nm) || allTokensPresent)) ? 1 : 0.5
    }
  } catch { /* default 1 */ }

  // thumbnail-from-game-assets: heuristic — thumbnail.png OR thumbnail.svg exists (designer wisdom prefers SVG for variants)
  const thumbnailExists = existsSync(resolve(inp.assetsDir, 'thumbnail.png'))
    || existsSync(resolve(inp.assetsDir, 'thumbnail.svg'))

  // charConsistency: we don't compute pixel diff here (heavy); use a ref-pair-exists proxy (accept .png or .svg base)
  let charConsistency = 1
  try {
    const m = JSON.parse(inp.manifestText || '{}') as { assets?: Record<string, { ref?: string; file?: string }> }
    const pairs = Object.entries(m.assets ?? {}).filter(([, v]) => !!v.ref)
    if (pairs.length > 0) {
      const bothExist = pairs.filter(([, v]) => {
        const baseFile = Object.values(m.assets ?? {}).find(a =>
          a.file === `${v.ref}.png` || a.file === `${v.ref}.svg`,
        )
        return !!baseFile && existsSync(resolve(inp.assetsDir, v.file ?? ''))
      }).length
      charConsistency = bothExist / pairs.length
    }
  } catch { /* default */ }

  // cycle.ts:1040 이 assetStats 를 하드코딩 {0,0,0,0} 으로 넘기는 구조적 한계를 해결.
  // 파이프라인이 실제 값을 넘기면(>0) 폴백은 실행 안 되고 기존 경로 유지. 하드코딩 상태(현재)는
  // manifest.assets 선언 수를 requested, 디스크에 실재하는 파일 수를 generated 로 사용.
  let requested = inp.requestedAssetCount
  let generated = inp.generatedAssetCount
  if (requested === 0 && generated === 0) {
    try {
      const m2 = JSON.parse(inp.manifestText || '{}') as { assets?: Record<string, { file?: string }> }
      const entries = Object.values(m2.assets ?? {})
      requested = entries.length
      generated = entries.filter(a => !!a.file && existsSync(resolve(inp.assetsDir, a.file))).length
    } catch { /* manifest 파싱 실패 시 기존 0 유지 */ }
  }
  // assetVerifyRate (verifyFailed 는 파이프라인만 알 수 있음 — 폴백 시 0 가정)
  const assetVerifyRate = requested > 0
    ? 1 - (inp.verifyFailedCount / requested)
    : 1
  // assetGenerateRate
  const assetGenerateRate = requested > 0
    ? generated / requested
    : 0

  const score = clamp(
    stylePurity * 25
    + charConsistency * 25
    + assetVerifyRate * 20
    + assetGenerateRate * 20
    + (thumbnailExists ? 10 : 0),
  )

  return {
    score,
    signals: {
      stylePurity,
      charConsistency,
      assetVerifyRate,
      assetGenerateRate,
      failedAssetCount: inp.failedAssetCount,
      verifyFailedCount: inp.verifyFailedCount,
      thumbnailFromGameAssets: thumbnailExists,
    },
  }
}

// ═══════════════════════════════════════════════════════════
// 🔍 QA signals (7)
// ═══════════════════════════════════════════════════════════

interface QAInputs {
  reviewText: string
  verdict: CycleMetrics['verdict']
  reviewRounds: number
  review2Rounds: number
  deployVerifyPass: boolean | null
}

function scoreQA(inp: QAInputs): DisciplineScore {
  const rv = inp.reviewText

  // button audit pass ratio — parse reviewer report if it contains "버튼 ... M/N"
  const buttonMatch = rv.match(/버튼[^:]*:\s*(\d+)\s*\/\s*(\d+)|(\d+)\s*개\s*중\s*(\d+)\s*개\s*PASS/)
  let buttonAuditPass = 1
  if (buttonMatch) {
    const pass = parseInt(buttonMatch[1] ?? buttonMatch[4] ?? '0', 10)
    const total = parseInt(buttonMatch[2] ?? buttonMatch[3] ?? '0', 10)
    buttonAuditPass = total > 0 ? pass / total : 1
  }

  // restartVerifyPass — simple PASS/FAIL search
  const restartPassed = /재시작.*PASS|restart.*PASS|📌\s*C.*PASS/i.test(rv) && !/재시작.*FAIL/i.test(rv)

  // stuckStateBugs: count FAIL mentions under stuck-state checks
  const stuckStateBugs = countMatches(rv, /stuck.*FAIL|진행\s*불가.*FAIL|deadlock/gi)

  const score = clamp(
    (inp.verdict === 'APPROVED' ? 30 : inp.verdict === 'NEEDS_MINOR_FIX' ? 15 : 0)
    + Math.max(0, 20 - (inp.reviewRounds - 1) * 10)
    + Math.max(0, 10 - (inp.review2Rounds - 1) * 5)
    + buttonAuditPass * 15
    + (restartPassed ? 15 : 0)
    + (inp.deployVerifyPass === true ? 10 : inp.deployVerifyPass === false ? 0 : 5)
    - Math.min(10, stuckStateBugs * 5),
  )

  return {
    score,
    signals: {
      firstRoundVerdict: inp.verdict,
      reviewRounds: inp.reviewRounds,
      review2Rounds: inp.review2Rounds,
      buttonAuditPass,
      restartVerifyPass: restartPassed,
      stuckStateBugs,
      deployVerifyPass: inp.deployVerifyPass === null ? 'UNKNOWN' : inp.deployVerifyPass ? 'PASS' : 'FAIL',
    },
  }
}

// ═══════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════

export interface CollectOptions {
  cycle: number
  gameId: string
  durationMin: number
  assetStats: { requested: number; generated: number; failed: number; verifyFailed: number }
  plannerReworkCount: number
  deployVerifyPass: boolean | null
}

export function collectCycleMetrics(opts: CollectOptions): CycleMetrics {
  const { cycle, gameId, durationMin, assetStats, plannerReworkCount, deployVerifyPass } = opts

  const specPath = resolve(PROJECT_ROOT, 'docs', 'game-specs', `cycle-${cycle}-spec.md`)
  const reviewPath = resolve(PROJECT_ROOT, 'docs', 'reviews', `cycle-${cycle}-review.md`)
  const postmortemPath = resolve(PROJECT_ROOT, 'docs', 'post-mortem', `cycle-${cycle}-postmortem.md`)
  const promotionPath = resolve(PROJECT_ROOT, 'docs', 'engine-notes', `cycle-${cycle}-promotion.md`)
  const htmlPath = resolve(PROJECT_ROOT, 'public', 'games', gameId, 'index.html')
  const manifestPath = resolve(PROJECT_ROOT, 'public', 'games', gameId, 'assets', 'manifest.json')
  const assetsDir = resolve(PROJECT_ROOT, 'public', 'games', gameId, 'assets')

  const specText = readFileSafe(specPath)
  const reviewText = readFileSafe(reviewPath)
  const postmortemText = readFileSafe(postmortemPath)
  const promotionText = readFileSafe(promotionPath)
  const htmlText = readFileSafe(htmlPath)
  const manifestText = readFileSafe(manifestPath)

  const genre = extractYaml(specText, 'genre')
  const artStyle = extractYaml(specText, 'art-style')
  const verdictText = extractYaml(reviewText, 'verdict').toUpperCase()
  const verdict = (verdictText.includes('APPROVED') ? 'APPROVED'
                 : verdictText.includes('MAJOR') ? 'NEEDS_MAJOR_FIX'
                 : verdictText.includes('MINOR') ? 'NEEDS_MINOR_FIX'
                 : 'UNKNOWN') as CycleMetrics['verdict']

  // reviewer 가 YAML front-matter 에 `reviewRound: N` 을 명시하면 이를 1차 우선. 없으면 본문 regex 폴백.
  // 기존 regex `/round\s*\d+/gi` 는 `reviewRound: 6` 의 `:` 를 `\s` 가 매치 못 해 미탐지였음.
  const reviewRoundYaml = parseInt(extractYaml(reviewText, 'reviewRound'), 10)
  const reviewRounds = (Number.isFinite(reviewRoundYaml) && reviewRoundYaml > 0)
    ? reviewRoundYaml
    : Math.max(1, countMatches(reviewText, /(\d+)회차|round\s*\d+/gi) || 1)

  // Recent genre/style context (last 10 cycles excluding current)
  const recentMetrics = loadRecentMetrics(10, cycle)
  const recentGenres = recentMetrics.map(m => m.genre)
  const recentStyles = recentMetrics.map(m => m.artStyle)

  const planning = scorePlanning({
    specText, recentGenres, recentStyles,
    currentGenre: genre, currentStyle: artStyle,
    plannerReworkCount, postmortemText, manifestText,
  })

  const development = scoreDevelopment({ htmlText, enginePromotionText: promotionText })

  const art = scoreArt({
    manifestText, specText, assetsDir,
    requestedAssetCount: assetStats.requested,
    generatedAssetCount: assetStats.generated,
    failedAssetCount: assetStats.failed,
    verifyFailedCount: assetStats.verifyFailed,
  })

  const qa = scoreQA({
    reviewText, verdict,
    reviewRounds,
    review2Rounds: 1,
    deployVerifyPass,
  })

  const disciplines: Record<Discipline, DisciplineScore> = {
    planning, development, art, qa,
  }

  const overallScore = clamp(
    planning.score * 0.20
    + development.score * 0.30
    + art.score * 0.25
    + qa.score * 0.25,
  )

  const weakestDiscipline = (Object.entries(disciplines) as [Discipline, DisciplineScore][])
    .sort((a, b) => a[1].score - b[1].score)[0][0]

  // Extract root-cause tags from postmortem
  const rootCauses = [...postmortemText.matchAll(/root-?cause:\s*([^\n]+)/gi)].map(m => m[1].trim())

  const metrics: CycleMetrics = {
    cycle, gameId, genre, artStyle, verdict,
    reviewRounds, review2Rounds: 1,
    durationMin,
    disciplines, overallScore, weakestDiscipline,
    rootCauses,
    createdAt: new Date().toISOString(),
  }

  return metrics
}

export function saveCycleMetrics(m: CycleMetrics): string {
  if (!existsSync(METRICS_DIR)) mkdirSync(METRICS_DIR, { recursive: true })
  const path = resolve(METRICS_DIR, `cycle-${m.cycle}.json`)
  writeFileSync(path, JSON.stringify(m, null, 2))
  return path
}

/** Load the last N cycle metrics (excluding `excludeCycle` if set). */
export function loadRecentMetrics(n = 10, excludeCycle?: number): CycleMetrics[] {
  if (!existsSync(METRICS_DIR)) return []
  const files = readdirSync(METRICS_DIR)
    .filter(f => f.startsWith('cycle-') && f.endsWith('.json'))
    .map(f => {
      const m = f.match(/cycle-(\d+)\.json/)
      return m ? { file: f, cycle: parseInt(m[1], 10) } : null
    })
    .filter((x): x is { file: string; cycle: number } => !!x)
    .filter(x => x.cycle !== excludeCycle)
    .sort((a, b) => b.cycle - a.cycle)
    .slice(0, n)

  const result: CycleMetrics[] = []
  for (const { file } of files) {
    try {
      result.push(JSON.parse(readFileSync(resolve(METRICS_DIR, file), 'utf-8')))
    } catch { /* skip corrupted */ }
  }
  return result.reverse()  // oldest → newest
}
