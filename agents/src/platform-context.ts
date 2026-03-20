/**
 * InfiniTriX 플랫폼 공유 컨텍스트
 *
 * 에이전트 팀 전원이 알아야 하는 플랫폼 구조, 제약, 스키마 정의.
 * 각 에이전트 프롬프트에 삽입되어 게임이 올바르게 제작·등록·표시됩니다.
 */

// ─── 플랫폼 기본 정보 ──────────────────────────────────────────────────────────
export const PLATFORM_INFO = `
## InfiniTriX 플랫폼 정보
- 서비스 URL: https://infinitrix-games.vercel.app
- GitHub:     https://github.com/seungkyucha/infinitrix-games
- 배포:       GitHub main 브랜치 push → Vercel 자동 빌드·배포
- 프레임워크: Next.js 14 (App Router) + TypeScript + Tailwind CSS
` as const

// ─── 허용 장르 ────────────────────────────────────────────────────────────────
export const ALLOWED_GENRES = ['arcade', 'puzzle', 'strategy', 'action', 'casual'] as const
export type AllowedGenre = typeof ALLOWED_GENRES[number]

// ─── 플랫폼 디자인 시스템 ─────────────────────────────────────────────────────
export const DESIGN_SYSTEM = `
## 플랫폼 디자인 시스템 (다크 네온 테마)
배경색:
  - 최외곽 배경:  #0a0a0f (bg-primary)
  - 보조 배경:    #0f0f1a (bg-secondary)
  - 카드 배경:    #12121e (bg-card)
  - 카드 호버:    #1a1a2e (bg-card-hover)
  - 테두리:       #1e1e30 (border-dim)

액센트 컬러 (네온):
  - 퍼플:         #6c3cf7  (accent-purple) — 주요 인터랙션, 장르:arcade
  - 시안:         #00d4ff  (accent-cyan)   — 보조 강조, 장르:puzzle
  - 그린:         #00ff87  (accent-green)  — 성공/완료, 장르:strategy
  - 골드:         #ffd700  (accent-yellow) — 특별/추천, 장르:casual
  - 레드:         #ef4444  — 장르:action

텍스트:
  - 주요:         #e0e0f0  (text-primary)
  - 보조:         #8080a0  (text-secondary)
  - 흐림:         #505070  (text-muted)
` as const

// ─── 게임 iframe 환경 ─────────────────────────────────────────────────────────
export const IFRAME_CONTEXT = `
## 게임 실행 환경 (iframe)
게임은 플랫폼 페이지에서 <iframe> 안에 임베딩되어 실행됩니다.

iframe 속성:
  sandbox="allow-scripts allow-same-origin"
  allow="fullscreen"

허용:
  ✅ JavaScript 실행 (allow-scripts)
  ✅ localStorage / sessionStorage 읽기·쓰기 (allow-same-origin)
  ✅ Canvas API, Web Audio API, requestAnimationFrame
  ✅ Keyboard 이벤트, Touch 이벤트, Mouse 이벤트
  ✅ window.innerWidth / window.innerHeight

제한 (sandbox로 인해):
  ❌ form submit (allow-forms 없음)
  ❌ window.open / 팝업 (allow-popups 없음)
  ❌ top-level navigation
  ❌ alert() / confirm() / prompt() — 사용 금지, 게임 내 UI로 대체

iframe 크기:
  - 기본: 너비 100%, 높이 480px (모바일), 560px (sm 이상)
  - 전체화면: 너비 100%, 높이 calc(100vh - 44px)
  - → canvas는 반드시 window.innerWidth × window.innerHeight 기준으로 자동 조정

파일 서빙 경로:
  - 파일 위치:  public/games/[id]/index.html
  - 서빙 URL:   https://infinitrix-games.vercel.app/games/[id]/index.html
  - 게임 페이지: https://infinitrix-games.vercel.app/games/[id]
` as const

// ─── 게임 레지스트리 스키마 ───────────────────────────────────────────────────
export const REGISTRY_SCHEMA = `
## game-registry.json 스키마
파일 위치: public/games/game-registry.json

전체 구조:
{
  "lastUpdated": "ISO-8601 datetime",   // 필수 — 현재 시각
  "totalGames":  number,                // 필수 — games 배열 길이와 반드시 일치 (CI 검증)
  "games": [ ...Game[] ]
}

Game 객체 필드:
  필수:
    "id":          string   — 영문 소문자·숫자·하이픈만 (예: "space-shooter")
    "title":       string   — 한국어 제목 (예: "우주 슈터")
    "description": string   — 40자 이내 한 줄 설명 (GameCard에서 2줄로 잘림)
    "genre":       string[] — ALLOWED_GENRES 중 1~2개: arcade|puzzle|strategy|action|casual
    "thumbnail":   string   — "/games/[id]/thumbnail.svg" 형식 절대 경로
    "path":        string   — "/games/[id]/index.html"   형식 절대 경로
    "addedAt":     string   — ISO-8601 datetime (예: "2025-01-15T09:00:00Z")
    "featured":    boolean  — true면 홈 상단 추천 섹션 노출
    "playCount":   number   — 초기값 0
    "rating":      number   — 초기값 0 (0~5 범위)
    "tags":        string[] — 검색용 키워드 태그 배열 (예: ["classic","snake"])

  선택 (있으면 게임 페이지 사이드바에 표시):
    "controls":    string[] — 조작법 설명 (예: ["방향키로 이동", "스페이스바로 점프"])
    "difficulty":  string   — "easy" | "medium" | "hard"
    "version":     string   — "1.0.0" 형식
    "author":      string   — 제작자 (기본값 "InfiniTriX AI")

CI 검증 규칙 (GitHub Actions):
  - totalGames === games.length 불일치 시 배포 실패
  - id, title, path, thumbnail 누락 시 배포 실패
  - 모든 path 파일이 실제로 존재해야 함
` as const

// ─── 썸네일 표시 방식 ─────────────────────────────────────────────────────────
export const THUMBNAIL_DISPLAY = `
## 썸네일 표시 방식 (GameCard 컴포넌트)
- 컨테이너: aspect-ratio 4:3, overflow hidden
- 렌더링: Next.js <Image fill object-cover> — 비율이 맞지 않으면 잘림
- 표시 크기: 카드 너비(2~6열 그리드에서 약 140px~320px)에 따라 가변
- SVG 권장 스펙:
    viewBox="0 0 400 300"  (4:3 비율 정확히 맞춤)
    xmlns="http://www.w3.org/2000/svg"
    모든 핵심 요소를 중앙 기준으로 배치 (가장자리는 잘릴 수 있음)
    텍스트는 하단 1/4 영역에 배치 (잘릴 위험 적음)
- 카드 호버 시 scale(1.05) 애니메이션 적용됨
` as const

// ─── 게임 페이지 레이아웃 ─────────────────────────────────────────────────────
export const GAME_PAGE_LAYOUT = `
## 게임 페이지 레이아웃 (/games/[id])
레이아웃: lg 이상에서 4열 그리드 — 게임(3) | 사이드바(1)

사이드바에 표시되는 정보 (에이전트가 채워야 할 필드):
  1. game.title        — 게임 제목 (굵은 텍스트)
  2. game.description  — 설명 (회색 텍스트)
  3. game.genre[]      — 장르 배지 (색상은 장르별로 자동 지정)
  4. game.playCount    — 플레이 횟수 (accent-cyan)
  5. game.rating       — 평점 0~5 (accent-yellow, 0이면 "—" 표시)
  6. game.controls[]   — 조작법 목록 (▸ 아이콘과 함께 표시)
  7. game.tags[]       — 태그 (#태그명 형식)
  8. game.addedAt      — 추가일 (한국어 날짜 형식)
  9. game.version      — 버전 (선택)

홈 페이지 GameCard에서 표시:
  - thumbnail (4:3 비율 잘림)
  - title (1줄 잘림)
  - description (2줄 잘림)
  - genre 배지 (최대 2개)
  - playCount (1000 이상이면 "1.2k" 형식)
  - addedAt이 7일 이내면 "NEW" 배지 표시
  - featured=true면 ⭐ 배지 표시
` as const
