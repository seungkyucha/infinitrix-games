import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { marked } from 'marked'

const DOCS_DIR = join(process.cwd(), 'docs')

// ── 타입 ────────────────────────────────────────────────────────────────────

export interface CycleDoc {
  cycleNumber: number
  gameId:      string
  gameTitle:   string
  genre:       string
  difficulty:  string
  date:        string
  verdict:     string
  specHtml:    string
  reviewHtml:  string
  postmortemHtml: string
  hasSpec:     boolean
  hasReview:   boolean
  hasPostmortem: boolean
}

export interface DocEntry {
  id:    string
  label: string
  icon:  string
  group: string
  cycleNumber?: number
  gameTitle?:   string
  verdict?:     string
}

/** 사이드바용 엔트리 (플랫 리스트) */
export interface SidebarEntry {
  id:       string   // 'wisdom' | 'cycle-3'
  label:    string   // '누적 플랫폼 지혜' | '#3 미니 타워 디펜스'
  icon:     string
  verdict?: string
}

/** 사이클별 문서 탭 정보 */
export interface CycleTabInfo {
  cycleNumber: number
  gameTitle:   string
  verdict:     string
  tabs:        { key: string; label: string; icon: string; html: string }[]
}

// ── 유틸 ────────────────────────────────────────────────────────────────────

function parseFrontMatter(content: string): Record<string, string> {
  const meta: Record<string, string> = {}
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return meta
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
    meta[key] = val
  }
  return meta
}

/** 로케일에 맞는 문서 파일 경로 결정 (ko가 아니면 .en.md 우선) */
function resolveDocPath(filePath: string, locale: string = 'ko'): string {
  if (locale === 'ko') return filePath
  // /path/to/file.md → /path/to/file.en.md
  const enPath = filePath.replace(/\.md$/, '.en.md')
  if (existsSync(enPath)) return enPath
  return filePath // 영문 파일 없으면 한국어 폴백
}

function readDocHtml(filePath: string, locale: string = 'ko'): string {
  const resolved = resolveDocPath(filePath, locale)
  if (!existsSync(resolved)) return ''
  const raw = readFileSync(resolved, 'utf-8')
  const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, '')
  return marked.parse(body) as string
}

function readDocRaw(filePath: string): string {
  if (!existsSync(filePath)) return ''
  return readFileSync(filePath, 'utf-8')
}

// ── 사이드바 엔트리 (플랫 리스트) ────────────────────────────────────────────

/** 사이드바에 표시할 문서 목록 (meta + 사이클별 1줄) */
export function getSidebarEntries(locale: string = 'ko'): SidebarEntry[] {
  const entries: SidebarEntry[] = []

  // 번역 메시지 로드 (wisdom 라벨용)
  let wisdomLabel = '누적 플랫폼 지혜'
  if (locale !== 'ko') {
    try {
      const msgs = require(`@/messages/${locale}.json`)
      wisdomLabel = msgs?.devlog?.wisdom ?? 'Platform Wisdom'
    } catch {
      wisdomLabel = 'Platform Wisdom'
    }
  }

  // 누적 플랫폼 지혜
  const wisdomPath = join(DOCS_DIR, 'meta', 'platform-wisdom.md')
  if (existsSync(wisdomPath)) {
    entries.push({ id: 'wisdom', label: wisdomLabel, icon: '🧠' })
  }

  // 게임 레지스트리에서 i18n 타이틀 로드
  let gameI18n: Record<string, Record<string, { title?: string }>> = {}
  if (locale !== 'ko') {
    try {
      const regPath = join(process.cwd(), 'public', 'games', 'game-registry.json')
      const reg = JSON.parse(readFileSync(regPath, 'utf-8'))
      for (const g of reg.games) {
        if (g.i18n) gameI18n[g.id] = g.i18n
      }
    } catch {}
  }

  // 사이클 번호 수집
  const cycleNumbers = collectCycleNumbers()

  for (const n of cycleNumbers) {
    const { gameTitle, gameId, verdict } = getCycleMeta(n)
    // i18n 타이틀 우선 사용
    const localizedTitle = (locale !== 'ko' && gameId && gameI18n[gameId]?.[locale]?.title)
      ? gameI18n[gameId][locale].title
      : gameTitle
    entries.push({
      id:      `cycle-${n}`,
      label:   `#${n} ${localizedTitle}`,
      icon:    '🎮',
      verdict,
    })
  }

  return entries
}

// ── 사이클 탭 정보 ──────────────────────────────────────────────────────────

const TAB_DEFS = [
  { key: 'postmortem', label: '포스트모템',  icon: '📝', dir: 'post-mortem', suffix: 'postmortem' },
  { key: 'review',     label: '리뷰 보고서', icon: '🔍', dir: 'reviews',     suffix: 'review'     },
  { key: 'spec',       label: '게임 기획서', icon: '📋', dir: 'game-specs',  suffix: 'spec'       },
  { key: 'analytics',  label: '트렌드 분석', icon: '📊', dir: 'analytics',   suffix: 'report'     },
] as const

/** 사이클 N의 탭 정보 + HTML */
export function getCycleTabInfo(n: number, locale: string = 'ko'): CycleTabInfo | null {
  const { gameTitle, verdict } = getCycleMeta(n)
  const tabs: CycleTabInfo['tabs'] = []

  for (const def of TAB_DEFS) {
    const filePath = join(DOCS_DIR, def.dir, `cycle-${n}-${def.suffix}.md`)
    if (!existsSync(filePath)) continue
    tabs.push({
      key:   def.key,
      label: def.label,
      icon:  def.icon,
      html:  readDocHtml(filePath, locale),
    })
  }

  if (tabs.length === 0) return null
  return { cycleNumber: n, gameTitle, verdict, tabs }
}

/** 누적 플랫폼 지혜 HTML */
export function getPlatformWisdomHtml(locale: string = 'ko'): string {
  const basePath = join(DOCS_DIR, 'meta', 'platform-wisdom.md')
  if (!existsSync(basePath)) return ''
  const resolved = resolveDocPath(basePath, locale)
  try {
    return marked.parse(readFileSync(resolved, 'utf-8')) as string
  } catch { return '' }
}

// ── 내부 헬퍼 ───────────────────────────────────────────────────────────────

function collectCycleNumbers(): number[] {
  const nums = new Set<number>()

  const dirs = [
    { dir: 'game-specs',  pattern: /^cycle-(\d+)-spec\.md$/ },
    { dir: 'post-mortem', pattern: /^cycle-(\d+)-postmortem\.md$/ },
  ]

  for (const { dir, pattern } of dirs) {
    const fullDir = join(DOCS_DIR, dir)
    if (!existsSync(fullDir)) continue
    try {
      for (const f of readdirSync(fullDir)) {
        const m = f.match(pattern)
        if (m) nums.add(parseInt(m[1], 10))
      }
    } catch { /* ignore */ }
  }

  return Array.from(nums).sort((a, b) => b - a)
}

function getCycleMeta(n: number): { gameTitle: string; gameId: string; verdict: string } {
  const specPath = join(DOCS_DIR, 'game-specs', `cycle-${n}-spec.md`)
  const pmPath   = join(DOCS_DIR, 'post-mortem', `cycle-${n}-postmortem.md`)

  const specMeta = existsSync(specPath) ? parseFrontMatter(readDocRaw(specPath)) : {}
  const pmMeta   = existsSync(pmPath)   ? parseFrontMatter(readDocRaw(pmPath))   : {}

  return {
    gameTitle: specMeta['title'] ?? pmMeta['title'] ?? `사이클 #${n}`,
    gameId:    specMeta['game-id'] ?? '',
    verdict:   pmMeta['verdict'] ?? '',
  }
}

// ── 하위 호환 (기존 API) ────────────────────────────────────────────────────

export function getAllDocEntries(): DocEntry[] {
  return getSidebarEntries().map(e => ({
    id: e.id, label: e.label, icon: e.icon, group: 'meta', verdict: e.verdict,
  }))
}

export function getDocHtml(docId: string): string {
  if (docId === 'wisdom') return getPlatformWisdomHtml()
  const m = docId.match(/^cycle-(\d+)-(postmortem|review|spec|analytics)$/)
  if (!m) return ''
  const [, num, type] = m
  const dirMap: Record<string, string> = { postmortem: 'post-mortem', review: 'reviews', spec: 'game-specs', analytics: 'analytics' }
  const suffixMap: Record<string, string> = { postmortem: 'postmortem', review: 'review', spec: 'spec', analytics: 'report' }
  const filePath = join(DOCS_DIR, dirMap[type], `cycle-${num}-${suffixMap[type]}.md`)
  return readDocHtml(filePath)
}

export function getAllCycleDocs(): CycleDoc[] {
  const specsDir    = join(DOCS_DIR, 'game-specs')
  const reviewsDir  = join(DOCS_DIR, 'reviews')
  const postmortemDir = join(DOCS_DIR, 'post-mortem')
  if (!existsSync(specsDir)) return []
  let specFiles: string[]
  try { specFiles = readdirSync(specsDir).filter(f => f.match(/^cycle-(\d+)-spec\.md$/)) } catch { return [] }
  const cycles: CycleDoc[] = []
  for (const filename of specFiles) {
    const match = filename.match(/^cycle-(\d+)-spec\.md$/)
    if (!match) continue
    const cycleNumber = parseInt(match[1], 10)
    const specPath      = join(specsDir,      `cycle-${cycleNumber}-spec.md`)
    const reviewPath    = join(reviewsDir,    `cycle-${cycleNumber}-review.md`)
    const postmortemPath = join(postmortemDir, `cycle-${cycleNumber}-postmortem.md`)
    const specRaw  = readDocRaw(specPath)
    const specMeta = parseFrontMatter(specRaw)
    let verdict = ''
    if (existsSync(postmortemPath)) {
      const pmMeta = parseFrontMatter(readDocRaw(postmortemPath))
      verdict = pmMeta['verdict'] ?? ''
    }
    cycles.push({
      cycleNumber, gameId: specMeta['game-id'] ?? '', gameTitle: specMeta['title'] ?? `사이클 #${cycleNumber}`,
      genre: specMeta['genre'] ?? '', difficulty: specMeta['difficulty'] ?? '', date: specMeta['date'] ?? '', verdict,
      specHtml: readDocHtml(specPath), reviewHtml: readDocHtml(reviewPath), postmortemHtml: readDocHtml(postmortemPath),
      hasSpec: existsSync(specPath), hasReview: existsSync(reviewPath), hasPostmortem: existsSync(postmortemPath),
    })
  }
  return cycles.sort((a, b) => b.cycleNumber - a.cycleNumber)
}
