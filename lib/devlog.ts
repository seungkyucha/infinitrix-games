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
