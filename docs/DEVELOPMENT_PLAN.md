# InfiniTriX — 개발 계획서

> **비전**: AI 에이전트 팀이 기획·개발·테스트·배포 사이클을 자동 반복하여 HTML5 게임이 무한 증식하는 플랫폼

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 플랫폼 | Next.js 14 + TypeScript + Tailwind CSS |
| 배포 | GitHub → Vercel 자동 배포 |
| 게임 | 순수 HTML5/Canvas (단일 index.html) |
| 에이전트 | Claude Agent SDK (TypeScript) |
| 스타일 | 다크 네온 테마 |

---

## 에이전트 팀 구성

```
분석가 (Analyst)
 └→ 플래너 (Planner)
     └→ 코더 (Coder) ←─ 리뷰어 피드백
     └→ 디자이너 (Designer)
         └→ 리뷰어 (Reviewer)
             └→ 테스터 (Tester)
                 └→ 배포 담당 (Deployer)
                     └→ [GitHub Push → Vercel Auto-Deploy]
                         └→ 분석가 (다음 사이클)
```

### 역할 정의

| 에이전트 | 주요 역할 | 사용 도구 | 산출물 |
|---------|----------|----------|--------|
| **매니저** | 사이클 총괄, 품질 게이트 | Agent, Read, Write, Bash | 사이클 요약 로그 |
| **분석가** | 플랫폼 현황 분석, 트렌드 조사 | WebSearch, Read, Write | analytics/cycle-N-report.md |
| **플래너** | 게임 기획서 작성, 스코프 정의 | WebSearch, Read, Write | game-specs/cycle-N-spec.md |
| **코더** | HTML5 게임 단일 파일 구현 | Read, Write, Edit, Bash | public/games/[id]/index.html |
| **디자이너** | SVG 썸네일 및 그래픽 리소스 | Read, Write, Edit | public/games/[id]/thumbnail.svg |
| **리뷰어** | 코드 품질·버그·성능 검토 | Read, Glob, Grep, Write | reviews/cycle-N-review.md |
| **테스터** | 기능 테스트 & 재미 검증 | Read, Bash, Write | test-reports/cycle-N-test.md |
| **배포 담당** | 레지스트리 등록 & git push | Read, Write, Edit, Bash | game-registry.json 업데이트 |

---

## 개발 단계 (Phases)

### Phase 1: 플랫폼 기반 구축 ✅ (현재 완료)

**목표**: 게임을 담을 Next.js 플랫폼 골격 완성

- [x] Next.js 14 + TypeScript + Tailwind 설정
- [x] 다크 네온 테마 디자인 시스템
- [x] 게임 레지스트리 시스템 (JSON 기반)
- [x] 게임 로비 페이지 (그리드 레이아웃)
- [x] 개별 게임 페이지 (iframe 임베딩)
- [x] 장르/카테고리 필터 + 검색
- [x] 반응형 헤더/네비게이션
- [x] GitHub Actions CI 파이프라인

**다음 할 일**: GitHub 저장소 생성 → Vercel 연결 → main 브랜치 push

---

### Phase 2: GitHub & Vercel 연동 🔲 (다음 단계)

**목표**: 자동 배포 파이프라인 완성

1. GitHub 저장소 생성 (`infinitrix-games`)
2. `git remote add origin` 설정
3. Vercel 프로젝트 생성 (GitHub 연동)
4. Vercel 환경변수 설정 (`NEXT_PUBLIC_SITE_URL`)
5. 첫 번째 배포 확인
6. `.env` 파일에 `GITHUB_TOKEN` 설정 (에이전트용)

---

### Phase 3: 에이전트 첫 번째 사이클 실행 🔲

**목표**: 에이전트 팀이 첫 번째 게임을 자동 개발·배포

1. `agents/` 폴더에서 `npm install`
2. `ANTHROPIC_API_KEY` 환경변수 설정
3. `npm run cycle` 실행 (단일 사이클 테스트)
4. 생성된 게임 확인 및 플랫폼 동작 검증
5. 문제 없으면 `npm run start` (자동 반복 모드)

**예상 첫 번째 게임**: 스네이크, 테트리스, 벽돌깨기 등 검증된 클래식 장르

---

### Phase 4: 플랫폼 고도화 🔲

**목표**: 사용자 경험 향상

- [ ] 게임 플레이 카운트 (서버사이드 API)
- [ ] 즐겨찾기 기능 (localStorage)
- [ ] 최근 플레이 기록
- [ ] 소셜 공유 버튼
- [ ] SEO 최적화 (sitemap.xml, robots.txt)
- [ ] 소개 페이지 (`/about`)
- [ ] 게임 카테고리 페이지 (`/genre/[genre]`)

---

### Phase 5: 자동 성장 모니터링 🔲

**목표**: 플랫폼 성장 추적 및 에이전트 품질 개선

- [ ] 에이전트 실행 대시보드 (관리자 페이지)
- [ ] 게임 품질 점수 추적
- [ ] 사이클 성공/실패율 모니터링
- [ ] 에이전트 프롬프트 개선 (품질 피드백 루프)
- [ ] 게임 장르 다양성 자동 조정

---

## 디렉토리 구조

```
InfiniTriX/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 전체 레이아웃 (Header 포함)
│   ├── page.tsx                # 게임 로비 (홈페이지)
│   ├── globals.css             # 전역 스타일
│   └── games/[id]/page.tsx     # 개별 게임 페이지
│
├── components/                 # 재사용 UI 컴포넌트
│   ├── Header.tsx
│   ├── HeroSection.tsx
│   ├── GameCard.tsx
│   ├── GameGrid.tsx            # 필터 + 검색 포함
│   └── GameFrame.tsx           # iframe 게임 플레이어
│
├── lib/                        # 유틸리티
│   ├── types.ts                # TypeScript 타입 정의
│   └── games.ts                # 게임 레지스트리 헬퍼
│
├── public/
│   └── games/
│       ├── game-registry.json  # 게임 목록 (에이전트가 자동 업데이트)
│       └── [game-id]/          # 각 게임 폴더
│           ├── index.html      # 게임 본체
│           └── thumbnail.svg   # 게임 썸네일
│
├── agents/                     # 에이전트 팀 (별도 실행)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts             # 엔트리포인트 (무한/단일 사이클)
│       ├── cycle.ts            # 개발 사이클 오케스트레이션
│       ├── team.ts             # 에이전트 역할 정의
│       └── types.ts            # 공통 타입
│
├── docs/                       # 에이전트 산출물
│   ├── DEVELOPMENT_PLAN.md     # 이 파일
│   ├── analytics/              # 분석가 보고서 (git ignored)
│   ├── game-specs/             # 게임 기획서 (git committed)
│   ├── reviews/                # 코드 리뷰 (git ignored)
│   └── test-reports/           # 테스트 리포트 (git ignored)
│
├── logs/                       # 사이클 로그 (git ignored)
├── .github/workflows/ci.yml    # GitHub Actions CI
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── .env.example
```

---

## 게임 레지스트리 스키마

```json
{
  "lastUpdated": "ISO-8601",
  "totalGames": 0,
  "games": [
    {
      "id":          "snake",
      "title":       "스네이크",
      "description": "먹이를 먹고 성장하는 클래식 스네이크 게임",
      "genre":       ["arcade"],
      "thumbnail":   "/games/snake/thumbnail.svg",
      "path":        "/games/snake/index.html",
      "addedAt":     "2024-01-01T00:00:00Z",
      "featured":    true,
      "playCount":   0,
      "rating":      0,
      "tags":        ["classic", "snake"],
      "controls":    ["방향키/WASD로 이동", "P키로 일시정지"],
      "difficulty":  "easy",
      "version":     "1.0.0"
    }
  ]
}
```

---

## 에이전트 실행 방법

```bash
# 1. agents 의존성 설치
cd agents
npm install

# 2. 환경변수 설정 (.env 파일 또는 시스템 환경변수)
export ANTHROPIC_API_KEY="your-key"
export GITHUB_TOKEN="your-token"

# 3-A. 단일 사이클 테스트 (게임 1개 개발)
npm run cycle

# 3-B. 자동 반복 모드 (30분 간격으로 게임 계속 추가)
npm run start
```

---

## Vercel 배포 설정

1. Vercel 대시보드에서 GitHub 저장소 연결
2. Framework: `Next.js` (자동 감지)
3. Root Directory: `/` (루트)
4. Build Command: `npm run build`
5. Output Directory: `.next`
6. 환경변수: `NEXT_PUBLIC_SITE_URL`

---

## 자동화 사이클 흐름

```
[에이전트 팀 서버]
       │
       ▼
  분석가: 트렌드 조사 & 플랫폼 분석
       │
       ▼
  플래너: 게임 기획서 작성
       │
       ▼
  코더: index.html 구현    ←── 리뷰어 피드백 (NEEDS_MAJOR_FIX 시)
  디자이너: thumbnail.svg 제작
       │
       ▼
  리뷰어: 코드 검토
       │
       ▼
  테스터: 기능 & 재미 검증
       │
       ▼
  배포 담당: game-registry.json 업데이트
            git commit & push
       │
       ▼
  [GitHub main 브랜치]
       │
       ▼ (자동 트리거)
  [Vercel 빌드 & 배포]
       │
       ▼
  [라이브 플랫폼 업데이트]
       │
       ▼ (30분 후)
  분석가: 다음 사이클 시작...
```

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*
