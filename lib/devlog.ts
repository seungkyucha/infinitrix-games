import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { marked } from 'marked'

const DOCS_DIR = join(process.cwd(), 'docs')

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

/** YAML front-matter 파싱 (간단한 key: value 형식) */
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

function readDocHtml(filePath: string): string {
  if (!existsSync(filePath)) return ''
  const raw = readFileSync(filePath, 'utf-8')
  // front-matter 제거 후 HTML 변환
  const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, '')
  return marked.parse(body) as string
}

function readDocRaw(filePath: string): string {
  if (!existsSync(filePath)) return ''
  return readFileSync(filePath, 'utf-8')
}

/** 누적 플랫폼 지혜 파일을 HTML로 변환 */
export function getPlatformWisdomHtml(): string {
  const path = join(DOCS_DIR, 'meta', 'platform-wisdom.md')
  if (!existsSync(path)) return ''
  try {
    const raw = readFileSync(path, 'utf-8')
    return marked.parse(raw) as string
  } catch { return '' }
}

// ── 사이드바용 타입 ────────────────────────────────────────────────────────────

export interface DocEntry {
  id:    string   // 'wisdom' | 'cycle-N-postmortem' | 'cycle-N-review' | 'cycle-N-spec'
  label: string
  icon:  string
  group: string   // 'meta' | 'cycle-N'
  cycleNumber?: number
  gameTitle?:   string
  verdict?:     string
}

/** 사이드바에 표시할 문서 목록 반환 */
export function getAllDocEntries(): DocEntry[] {
  const entries: DocEntry[] = []

  // 누적 플랫폼 지혜
  const wisdomPath = join(DOCS_DIR, 'meta', 'platform-wisdom.md')
  if (existsSync(wisdomPath)) {
    entries.push({ id: 'wisdom', label: '누적 플랫폼 지혜', icon: '🧠', group: 'meta' })
  }

  // 사이클 문서
  const specsDir      = join(DOCS_DIR, 'game-specs')
  const reviewsDir    = join(DOCS_DIR, 'reviews')
  const postmortemDir = join(DOCS_DIR, 'post-mortem')
  const analyticsDir  = join(DOCS_DIR, 'analytics')

  let specFiles: string[] = []
  if (existsSync(specsDir)) {
    try { specFiles = readdirSync(specsDir).filter(f => f.match(/^cycle-(\d+)-spec\.md$/)) }
    catch { /* ignore */ }
  }

  // 사이클 번호 목록 (spec 없어도 postmortem만 있는 경우 포함)
  const cycleNumbers = new Set<number>()
  specFiles.forEach(f => {
    const m = f.match(/^cycle-(\d+)-spec\.md$/)
    if (m) cycleNumbers.add(parseInt(m[1], 10))
  })
  if (existsSync(postmortemDir)) {
    try {
      readdirSync(postmortemDir)
        .filter(f => f.match(/^cycle-(\d+)-postmortem\.md$/))
        .forEach(f => {
          const m = f.match(/^cycle-(\d+)-postmortem\.md$/)
          if (m) cycleNumbers.add(parseInt(m[1], 10))
        })
    } catch { /* ignore */ }
  }

  Array.from(cycleNumbers).sort((a, b) => b - a).forEach(n => {
    const specPath      = join(specsDir,      `cycle-${n}-spec.md`)
    const reviewPath    = join(reviewsDir,    `cycle-${n}-review.md`)
    const postmortemPath = join(postmortemDir, `cycle-${n}-postmortem.md`)
    const analyticsPath  = join(analyticsDir,  `cycle-${n}-report.md`)

    const specRaw   = existsSync(specPath)       ? readDocRaw(specPath)       : ''
    const specMeta  = parseFrontMatter(specRaw)
    const pmRaw     = existsSync(postmortemPath) ? readDocRaw(postmortemPath) : ''
    const pmMeta    = parseFrontMatter(pmRaw)

    const gameTitle = specMeta['title'] ?? pmMeta['title'] ?? `사이클 #${n}`
    const verdict   = pmMeta['verdict'] ?? ''
    const group     = `cycle-${n}`

    if (existsSync(postmortemPath))
      entries.push({ id: `cycle-${n}-postmortem`, label: '포스트모템', icon: '📝', group, cycleNumber: n, gameTitle, verdict })
    if (existsSync(reviewPath))
      entries.push({ id: `cycle-${n}-review`,     label: '리뷰 보고서', icon: '🔍', group, cycleNumber: n, gameTitle })
    if (existsSync(specPath))
      entries.push({ id: `cycle-${n}-spec`,        label: '게임 기획서', icon: '📋', group, cycleNumber: n, gameTitle })
    if (existsSync(analyticsPath))
      entries.push({ id: `cycle-${n}-analytics`,   label: '트렌드 분석', icon: '📊', group, cycleNumber: n, gameTitle })
  })

  return entries
}

/** doc ID로 HTML 콘텐츠 반환 */
export function getDocHtml(docId: string): string {
  if (docId === 'wisdom') {
    const p = join(DOCS_DIR, 'meta', 'platform-wisdom.md')
    return existsSync(p) ? (marked.parse(readFileSync(p, 'utf-8')) as string) : ''
  }
  const m = docId.match(/^cycle-(\d+)-(postmortem|review|spec|analytics)$/)
  if (!m) return ''
  const [, num, type] = m
  const dirMap: Record<string, string> = {
    postmortem: 'post-mortem',
    review:     'reviews',
    spec:       'game-specs',
    analytics:  'analytics',
  }
  const suffixMap: Record<string, string> = {
    postmortem: 'postmortem',
    review:     'review',
    spec:       'spec',
    analytics:  'report',
  }
  const filePath = join(DOCS_DIR, dirMap[type], `cycle-${num}-${suffixMap[type]}.md`)
  return readDocHtml(filePath)
}

/** 사용 가능한 모든 사이클 문서를 읽어 최신 순으로 반환 */
export function getAllCycleDocs(): CycleDoc[] {
  const specsDir    = join(DOCS_DIR, 'game-specs')
  const reviewsDir  = join(DOCS_DIR, 'reviews')
  const postmortemDir = join(DOCS_DIR, 'post-mortem')

  if (!existsSync(specsDir)) return []

  let specFiles: string[]
  try {
    specFiles = readdirSync(specsDir).filter(f => f.match(/^cycle-(\d+)-spec\.md$/))
  } catch {
    return []
  }

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

    // postmortem의 verdict 우선 사용
    let verdict = ''
    if (existsSync(postmortemPath)) {
      const pmMeta = parseFrontMatter(readDocRaw(postmortemPath))
      verdict = pmMeta['verdict'] ?? ''
    }

    cycles.push({
      cycleNumber,
      gameId:    specMeta['game-id']    ?? '',
      gameTitle: specMeta['title']      ?? `사이클 #${cycleNumber}`,
      genre:     specMeta['genre']      ?? '',
      difficulty: specMeta['difficulty'] ?? '',
      date:      specMeta['date']       ?? '',
      verdict,
      specHtml:       readDocHtml(specPath),
      reviewHtml:     readDocHtml(reviewPath),
      postmortemHtml: readDocHtml(postmortemPath),
      hasSpec:        existsSync(specPath),
      hasReview:      existsSync(reviewPath),
      hasPostmortem:  existsSync(postmortemPath),
    })
  }

  // 최신 사이클이 위로
  return cycles.sort((a, b) => b.cycleNumber - a.cycleNumber)
}
