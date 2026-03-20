# Cycle 1 — 코드 리뷰 & 테스트 결과

> **게임:** 컬러 머지 퍼즐 (color-merge-puzzle)
> **리뷰 일시:** 2026-03-20
> **리뷰어:** Claude (QA Reviewer)
> **기획서:** `docs/game-specs/cycle-1-spec.md`
> **파일:** `public/games/color-merge-puzzle/index.html` (1,111줄, 단일 파일)

---

## 1. 코드 리뷰 (정적 분석)

### 1.1 기능 완성도 체크리스트

| # | 기획 항목 | 구현 여부 | 비고 |
|---|-----------|-----------|------|
| 1 | 5×5 그리드 | ✅ PASS | `GRID_SIZE = 5`, `initGrid()` 정상 |
| 2 | 상/하/좌/우 스와이프 이동 | ✅ PASS | `moveBlocks(dir)` 4방향 모두 처리 |
| 3 | 같은 색상 머지 → 다음 단계 진화 | ✅ PASS | `newLevel = grid[cr][cc] + 1` |
| 4 | 한 번의 스와이프에서 한 블록 한 번만 머지 | ✅ PASS | `merged[][]` 배열로 중복 머지 방지 |
| 5 | 7단계 무지개 색상 (HEX 일치) | ✅ PASS | 기획서의 HEX 코드와 정확히 일치 |
| 6 | 머지 점수 테이블 (2,6,18,54,162,486,1458) | ✅ PASS | `MERGE_SCORES` 배열 정확 |
| 7 | 콤보 시스템 (2회+→배수 적용) | ✅ PASS | 기획서 공식(`머지횟수×1.5 버림`)과 코드 매핑 일치 |
| 8 | 보라+보라 → 무지개 블록 (2916점+3개 제거) | ✅ PASS | `handleRainbowBlock()` 구현 완료 |
| 9 | 난이도 시스템 (점수별 블록 레벨 분포) | ✅ PASS | `getNewBlockLevel()` 3단계 구현 |
| 10 | 점수 5000+에서 추가 블록 스폰 | ✅ PASS | `getExtraSpawnChance()` — 5000+:20%, 10000+:35% |
| 11 | 점수 이정표 알림 (100/500/2000/5000/10000) | ✅ PASS | `MILESTONES` 배열 + `checkMilestones()` |
| 12 | 키보드: 방향키/WASD 이동 | ✅ PASS | `onKeyDown()` 8키 매핑 |
| 13 | 키보드: R키 재시작 | ⚠️ MINOR | 기획서는 "확인 팝업" 요구, 코드는 즉시 재시작. iframe에서 `confirm()` 사용 불가이므로 게임 내 확인 UI 필요 |
| 14 | 터치 스와이프 (30px 최소 거리) | ✅ PASS | `SWIPE_MIN = 30`, `resolveSwipe()` 수평/수직 비교 |
| 15 | 마우스 드래그 | ✅ PASS | `onMouseDown/onMouseUp` 구현 |
| 16 | 게임 오버 조건 (25칸 가득 + 머지 불가) | ✅ PASS | `canMove()` 빈 칸 + 인접 동일 블록 체크 |
| 17 | 게임 오버 시 최종점수/최고점/재시작 | ✅ PASS | `drawGameOver()` 모두 표시 |
| 18 | localStorage 최고 점수 저장 | ✅ PASS | 키: `colorMergePuzzle_bestScore` (기획서 일치) |
| 19 | 블록 이동 애니메이션 (150ms ease-out) | ⚠️ MINOR | `setTimeout(160)` 사용 — 실제 tween 애니메이션 대신 타이머 기반 잠금만 구현 |
| 20 | 머지 바운스 애니메이션 | ✅ PASS | `easeOutBack` 이징 + spawn 애니메이션 |
| 21 | 새 블록 팝업 애니메이션 (200ms) | ✅ PASS | `blockAnims.push({ type: 'spawn', duration: 200 })` |
| 22 | 콤보 텍스트 이펙트 | ✅ PASS | `floatingTexts` — "COMBO ×N!" 표시 |
| 23 | 게임 오버 오버레이 페이드인 | ✅ PASS | `gameOverAlpha += 0.03` 점진적 페이드 |
| 24 | 반응형 (모바일~500px 데스크톱) | ✅ PASS | `min(W-32, H*0.6, 500)` + resize 이벤트 |

**기능 완성도: 22/24 PASS, 2 MINOR**

---

### 1.2 게임 루프 & 렌더링

| 항목 | 결과 | 비고 |
|------|------|------|
| requestAnimationFrame 사용 | ✅ PASS | `gameLoop()` → `requestAnimationFrame(gameLoop)` |
| delta time 처리 | ✅ PASS | `dt = Math.min(timestamp - lastTime, 33)` — 30fps 하한 보장 |
| Canvas 기반 렌더링 | ✅ PASS | 매 프레임 DOM 접근 없음, 순수 Canvas API |
| DPR (Device Pixel Ratio) 대응 | ✅ PASS | `dpr = window.devicePixelRatio`, 고해상도 디스플레이 지원 |
| 게임 상태 머신 | ✅ PASS | LOADING → TITLE → PLAYING → GAMEOVER 전환 명확 |

---

### 1.3 메모리 & 성능

| 항목 | 결과 | 비고 |
|------|------|------|
| 이벤트 리스너 정리 | ✅ N/A | 단일 페이지 게임, 페이지 언로드 시 자동 해제 |
| 파티클 배열 정리 | ✅ PASS | 역순 순회 + `splice()` — `life <= 0` 시 제거 |
| floatingTexts 정리 | ✅ PASS | 동일한 패턴으로 수명 종료 시 제거 |
| 매 프레임 DOM 접근 | ✅ PASS | 없음 — Canvas API만 사용 |
| 매 프레임 객체 생성 | ⚠️ INFO | 파티클 생성 시 `push({...})` 사용, 객체 풀링 없음. 현재 규모에서는 문제 없음 |

---

### 1.4 모바일 & 반응형

| 항목 | 결과 | 비고 |
|------|------|------|
| viewport meta | ✅ PASS | `width=device-width, initial-scale=1.0, user-scalable=no` |
| touch-action: none | ✅ PASS | CSS에 설정됨 — 브라우저 기본 터치 동작 방지 |
| touchstart/touchmove/touchend | ✅ PASS | 3종 이벤트 모두 구현 |
| touchmove preventDefault | ✅ PASS | `{ passive: false }` + `e.preventDefault()` 스크롤 방지 |
| window resize 리사이즈 | ✅ PASS | `resizeCanvas()` → `recalcLayout()` 재계산 |
| Canvas 사이즈 자동 조정 | ✅ PASS | `window.innerWidth × window.innerHeight` 기준 |

---

### 1.5 보안 & iframe 호환성

| 항목 | 결과 | 비고 |
|------|------|------|
| eval() 사용 금지 | ✅ PASS | 사용 없음 |
| XSS 위험 | ✅ PASS | 사용자 입력 → DOM 삽입 경로 없음 |
| alert/confirm/prompt 사용 금지 | ✅ PASS | 사용 없음 (R키 확인 UI 미구현이지만 금지 함수는 호출 안 함) |
| window.open/팝업 | ✅ PASS | 사용 없음 |
| form submit | ✅ PASS | 사용 없음 |
| localStorage 사용 | ✅ PASS | try-catch로 감싸서 안전하게 처리 |

---

### 1.6 에셋 로딩

| 항목 | 결과 | 비고 |
|------|------|------|
| assets/manifest.json 존재 | ✅ PASS | 9개 에셋 정의 (8개 게임용 + 1 thumbnail) |
| SVG 파일 존재 (8+1개) | ✅ PASS | player, enemy, bg-layer1/2, ui-heart, ui-star, powerup, effect-hit, thumbnail |
| 프리로드 시스템 | ✅ PASS | `preloadAssets()` — Promise.all로 병렬 로딩 |
| 로딩 실패 시 폴백 | ✅ PASS | `img.onerror = resolve` (에러 무시) + 코드 내 폴백 렌더링 |
| SVG 품질 | ✅ PASS | 모든 SVG가 게임 테마에 맞는 커스텀 아트워크 (우주/네온 스타일) |

**주의사항:**
- `ASSET_MAP`에 `player`, `enemy`, `uiHeart` 등 **퍼즐 게임에 사용되지 않는 에셋**이 포함됨 (범용 템플릿에서 복사된 것으로 추정)
- 실제 코드에서 사용되는 에셋: `bgLayer1`, `bgLayer2`, `uiStar`, `powerup`, `effectHit` (5개)
- 사용되지 않는 에셋: `player`, `enemy`, `uiHeart` (3개) — 불필요한 네트워크 요청 발생
- 모든 에셋에 폴백 렌더링이 있어 에셋 로딩 실패 시에도 게임 정상 작동

---

## 2. 발견된 이슈 목록

### 🔴 MAJOR (게임 불가능 버그): 없음

### 🟡 MINOR (사소한 수정 필요)

| # | 심각도 | 이슈 | 위치 | 설명 |
|---|--------|------|------|------|
| M1 | MINOR | 외부 폰트 로드 | L7-8 | Google Fonts에서 Orbitron 로드. 기획서의 "외부 에셋 0개" 원칙 위반. 오프라인/느린 네트워크에서 폰트 로딩 지연 가능. 폴백 sans-serif로 동작하므로 게임은 플레이 가능. |
| M2 | MINOR | 불필요한 에셋 프리로드 | L37-46 | `player.svg`, `enemy.svg`, `ui-heart.svg` 등 퍼즐 게임에서 사용하지 않는 에셋 3개를 불필요하게 로딩. 에러 발생은 안 하지만 로딩 시간 증가. |
| M3 | MINOR | R키 확인 없이 즉시 재시작 | L499 | 기획서는 "R: 재시작 (확인 팝업)" 요구. `confirm()`은 iframe에서 사용 불가이므로 게임 내 모달 UI 구현 필요. 현재는 즉시 재시작되어 실수로 진행 중인 게임을 잃을 수 있음. |
| M4 | MINOR | 블록 이동 tween 애니메이션 미구현 | L329-346 | 블록 이동 시 실제 슬라이드 애니메이션이 없음. `setTimeout(160)`으로 입력 잠금만 걸고 즉시 위치가 변경됨. 기획서의 "150ms ease-out 슬라이드" 미구현. 스폰/머지 이펙트는 정상. |
| M5 | INFO | 에셋명과 manifest 불일치 없음 | — | manifest.json의 파일명과 ASSET_MAP의 경로가 일치하며 모든 파일 존재 확인 완료. |

---

## 3. 브라우저 테스트

> ⚠️ **Puppeteer MCP를 사용할 수 없어 자동 브라우저 테스트를 수행하지 못했습니다.**
> 아래는 코드 분석 기반 예상 결과입니다. 실제 브라우저 확인이 권장됩니다.

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 페이지 로드 | ✅ EXPECTED PASS | 단일 HTML 파일, 즉시 로드 예상 |
| 2 | 콘솔 에러 없음 | ⚠️ EXPECTED PASS | 에셋 로딩 실패 시 onerror→resolve 처리, Google Fonts 실패 시 무시됨. 단, **CORS 또는 Mixed Content 에러** 가능성 확인 필요 |
| 3 | 캔버스 렌더링 | ✅ EXPECTED PASS | Canvas 2D API만 사용, 폴백 렌더링 존재 |
| 4 | 시작 화면 표시 | ✅ EXPECTED PASS | `STATE.TITLE` → `drawTitle()` — 제목/색상 미리보기/시작 안내 표시 |
| 5 | 터치 이벤트 코드 존재 | ✅ PASS | `onTouchStart/onTouchMove/onTouchEnd` 구현 확인 |
| 6 | 점수 시스템 | ✅ EXPECTED PASS | 머지 점수 + 콤보 배수 + 누적 합산 |
| 7 | localStorage 최고점 | ✅ EXPECTED PASS | try-catch 감싸여 있어 iframe sandbox에서도 안전 |
| 8 | 게임오버/재시작 | ✅ EXPECTED PASS | `canMove()` → `triggerGameOver()` → `startGame()` 사이클 |

**브라우저 테스트 수동 확인 URL:**
- 로컬: `file:///[절대경로]/public/games/color-merge-puzzle/index.html`
- 프로덕션: `https://infinitrix-games.vercel.app/games/color-merge-puzzle/index.html`

---

## 4. 코드 품질 평가

| 항목 | 점수 | 비고 |
|------|------|------|
| 가독성 | ⭐⭐⭐⭐ | 함수 분리 명확, 한글 주석 풍부, 상수 분리 |
| 구조 | ⭐⭐⭐⭐ | 게임 상태 머신, 입력/로직/렌더링 분리 |
| 기획 충실도 | ⭐⭐⭐⭐ | 24개 항목 중 22개 완벽 일치, 2개 사소한 차이 |
| 성능 | ⭐⭐⭐⭐ | Canvas 기반, 불필요한 DOM 접근 없음, DPR 대응 |
| 안전성 | ⭐⭐⭐⭐⭐ | eval 없음, XSS 없음, 금지 API 미사용, localStorage try-catch |
| 에셋 | ⭐⭐⭐⭐ | SVG 커스텀 아트, 프리로드+폴백, 일부 불필요 에셋 존재 |

---

## 5. 최종 판정

### 코드 리뷰 판정: `NEEDS_MINOR_FIX`

### 테스트 판정: `EXPECTED PASS` (수동 브라우저 확인 필요)

---

### 종합 판정: `NEEDS_MINOR_FIX`

**사유:**
- 게임 자체는 완전히 플레이 가능하며, 기획서의 핵심 기능이 모두 구현됨
- 게임 오버/재시작/점수/최고점/콤보/난이도 등 모든 시스템 정상
- **즉시 배포는 가능**하나, 아래 사항을 후속 패치로 개선 권장

**권장 수정 사항 (우선순위순):**
1. **[M4]** 블록 이동 슬라이드 애니메이션 추가 — 현재 즉시 이동이라 시각적 피드백 부족
2. **[M2]** 불필요한 에셋(player/enemy/uiHeart) ASSET_MAP에서 제거 — 로딩 최적화
3. **[M1]** Google Fonts 의존 제거 또는 시스템 폰트 폴백 강화 — 오프라인 대응
4. **[M3]** R키 재시작 확인 모달 UI 구현 — 게임 내 캔버스 기반 확인 다이얼로그

**배포 가부:** ✅ **배포 가능** (MINOR 이슈만 존재, 게임 플레이에 지장 없음)
