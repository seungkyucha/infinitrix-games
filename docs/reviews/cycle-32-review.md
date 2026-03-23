---
verdict: APPROVED
game-id: spectral-sleuth
cycle: 32
reviewer: claude-reviewer
date: 2026-03-23
attempt: 3
---

# 사이클 #32 코드 리뷰 (2차 리뷰 2회차) — 유령 탐정 (Spectral Sleuth)

## 📋 요약

| 항목 | 결과 |
|------|------|
| **코드 리뷰 판정** | APPROVED |
| **테스트 판정** | PASS |
| **최종 판정** | ✅ APPROVED |

**2차 리뷰 2회차 사유**: 이전 리뷰(attempt 2)에서 지적된 잔존 이슈 3건(P1-R orphaned SVG, P2 beginTransition 이중 정의, P3 RESTART_ALLOWED 데드코드)이 **모두 수정 완료**. 기능 회귀 없음. 즉시 배포 가능.

---

## 🔄 이전 리뷰(attempt 2) 대비 변경 사항

| 이전 이슈 | 수정 여부 | 상세 |
|----------|----------|------|
| P1-R: assets/ orphaned SVG 8개 | ✅ **삭제 완료** | assets/ 디렉토리에 `thumbnail.svg`, `manifest.json`만 잔존. 8개 orphaned SVG 전량 삭제 확인. |
| P2: beginTransition 이중 정의 | ✅ **수정 완료** | `function beginTransition` 검색 결과 Line 4123 **1건만 존재**. 1차 정의(구 Line 1637) 삭제됨. `origBeginTransition` 변수도 0건. |
| P3: RESTART_ALLOWED 데드코드 | ✅ **삭제 완료** | `RESTART_ALLOWED` 검색 결과 0건. 완전 삭제 확인. |

### 회귀 테스트 결과
- ✅ ASSET_MAP / SPRITES / preloadAssets — 여전히 0건 (이전 수정 유지)
- ✅ alert/confirm/prompt/eval — 0건
- ✅ Math.random — 0건 (주석 제외, SeededRNG 100%)
- ✅ setTimeout/setInterval — 0건 (주석 제외, TweenManager 전용)
- ✅ requestAnimationFrame — 정상 사용 (Line 2682, 4178)
- ✅ 터치 이벤트 — touchstart/touchmove/touchend 정상 등록 (Line 2324, 2358, 2380)
- ✅ localStorage — try/catch 보호, SAVE_KEY + HIGH_KEY 저장/로드 (Line 1766-1806)
- ✅ resize 이벤트 — `window.addEventListener('resize', resize)` (Line 1912)
- ✅ ESCAPE_ALLOWED — 선언 + 참조 정상 (Line 1568, 1944)
- ✅ beginTransition — 단일 정의, transProxy 기반 tween 전환 (Line 4123)

---

## 🎮 게임 플레이 완전성 검증 (3차)

### 📌 1. 게임 시작 흐름 — ✅ PASS
- **타이틀 화면**: `renderTitle()` — 유령 탐정 타이틀(시안 글로우), 부제 "SPECTRAL SLEUTH", 유령 실루엣(페도라+트렌치코트+돋보기), 아르데코 도시 실루엣 배경, 별+달 날씨 효과, 난이도 선택 UI.
- **시작 입력**: SPACE/Enter(키보드), 탭(모바일).
- **초기화**: `G` 객체 INIT_EMPTY 패턴. `startGame()`에서 로딩 화면 표시 후 `beginTransition(TITLE)` [F12, F86 준수].

### 📌 2. 입력 시스템 — 데스크톱 — ✅ PASS
- **keydown/keyup**: `window.addEventListener('keydown/keyup')` 등록.
- **이동**: WASD/화살표 → `keys` 객체 → `updateExploration(dt)` → `L.vx/vy` → `L.x/y` 갱신.
- **능력 사용**: 1/2/3키 → `selectAbility()` → Space → `useAbility()` → 에테르 차감 + 단서 발견 + 파티클 + SFX.
- **일시정지**: ESC → `ESCAPE_ALLOWED[G.state]` 확인 → PAUSE 상태 전환.

### 📌 3. 입력 시스템 — 모바일 — ✅ PASS
- **터치 이벤트**: `touchstart`(2324), `touchmove`(2358), `touchend`(2380) — `{ passive: false }` 적용.
- **가상 조이스틱**: 화면 하단 50% 터치 시 활성화. 방향 벡터 계산.
- **더블 탭**: 상호작용 대체.
- **롱프레스**: 500ms 후 능력 사용.
- **터치 타겟**: `Math.max(C.TOUCH_MIN, cw * 0.12)` = 최소 48px [F11 준수].
- **스크롤 방지**: `touch-action: none` + `overflow: hidden` + `e.preventDefault()`.

### 📌 4. 게임 루프 & 로직 — ✅ PASS
- **requestAnimationFrame**: `loop()` 함수 내 사용 (Line 2682, 4178).
- **Delta time**: `dt = (time - lastTime) / 1000`, 상한 `1/30`, 하한 `1/60`. 프레임 독립적.
- **충돌 감지**: `Math.hypot()` 기반 거리 계산 + `hitTest()` 통합 함수 [F16 준수].
- **점수**: `evaluateDeduction()` → baseScore + timeBonus + accuracyBonus + exploreBonus → rankMult 적용.
- **DDA**: `ddaStreak` ≥ 2 → `ddaLevel++`. 난이도별 시간제한/신뢰도/에테르 차등.

### 📌 5. 게임 오버 & 재시작 — ✅ PASS
- **게임 오버 조건**: `G.credibility <= 0` → `GAME_OVER` 전환.
- **게임 오버 화면**: `renderGameOver()` — 총점, 최고점수, 재시작 안내.
- **localStorage 저장**: `saveProgress()` — SAVE_KEY(진행), HIGH_KEY(최고점) — `try/catch` 보호 [F8 준수].
- **재시작**: R키/Space/탭 → `resetCurrentRun()` + `beginTransition(ZONE_MAP)`. 완전 초기화 확인.

### 📌 6. 화면 렌더링 — ✅ PASS
- **Canvas 크기**: `window.innerWidth × window.innerHeight`.
- **devicePixelRatio**: `dpr` 적용, `canvas.width = w * dpr`, `ctx.setTransform(dpr, ...)`.
- **resize 이벤트**: `window.addEventListener('resize', resize)` (Line 1912).
- **모든 상태 렌더**: `render()` 함수에서 18개 상태 분기.
- **전환 오버레이**: fade/wipe/slide/dramatic 4종.

### 📌 7. 외부 의존성 안전성 — ✅ PASS
- **폰트**: `"Segoe UI", system-ui, sans-serif` — 시스템 폰트 3단 폴백. 외부 CDN 0건 [F2 준수].
- **에셋**: ASSET_MAP/SPRITES/preloadAssets 코드 삭제 상태 유지. Canvas 순수 드로잉만 사용.
- **에셋 파일**: orphaned SVG 8개 전량 삭제 완료. `thumbnail.svg`, `manifest.json`만 잔존 [F1 준수].
- **사운드**: Web Audio API 프로시저럴 SFX 8종 + BGM 4종, 외부 오디오 파일 0건.

---

## 📱 모바일 조작 대응 검사

| 항목 | 결과 | 비고 |
|------|------|------|
| 뷰포트 meta | ✅ PASS | `width=device-width,initial-scale=1.0,user-scalable=no` |
| 키보드 없이 시작 | ✅ PASS | 탭으로 시작 가능 |
| 키보드 없이 이동 | ✅ PASS | 가상 조이스틱 (하단 50%) |
| 키보드 없이 능력 사용 | ✅ PASS | 능력 버튼 + 롱프레스 (500ms) |
| 키보드 없이 상호작용 | ✅ PASS | 더블 탭 (E키 대체) |
| 키보드 없이 퍼즐 | ✅ PASS | 증거 카드 탭 + 검증 버튼 |
| 키보드 없이 대질 | ✅ PASS | 증거 탭으로 제시 |
| 키보드 없이 재시작 | ✅ PASS | 탭으로 재시작 |
| 키보드 없이 일시정지 탈출 | ✅ PASS | 상단 탭=계속, 하단 탭=설정 |
| 가상 조이스틱 위치 | ✅ PASS | 화면 하단 50%, 게임 화면 미가림 |
| 터치 타겟 최소 48px | ✅ PASS | `Math.max(C.TOUCH_MIN, cw * 0.12)` |
| touch-action: none | ✅ PASS | body CSS에 적용 |
| 스크롤 방지 | ✅ PASS | `overflow: hidden` + `e.preventDefault()` |

---

## 🔍 브라우저 테스트 결과

| 항목 | 결과 | 비고 |
|------|------|------|
| 페이지 로드 | ✅ PASS | 정상 로드 |
| 콘솔 에러 없음 | ✅ PASS | 에러/경고 0건 |
| 캔버스 렌더링 (800×600) | ✅ PASS | 타이틀 화면 정상 — 아르데코 도시 실루엣, 별+달, 유령 캐릭터, 난이도 선택 |
| 캔버스 렌더링 (375×667) | ✅ PASS | 모바일 뷰포트 정상 — 레이아웃 자동 조정, "SPACE 또는 탭하여 시작" 표시 |
| 시작 화면 표시 | ✅ PASS | 타이틀 + 부제 + 유령 실루엣 + 난이도 선택 + 시작 프롬프트 |
| 터치 이벤트 코드 존재 | ✅ PASS | touchstart/touchmove/touchend + 조이스틱 + 더블탭 + 롱프레스 |
| 점수 시스템 | ✅ PASS | evaluateDeduction → totalScore 누적 |
| localStorage 최고점 | ✅ PASS | HIGH_KEY 저장/로드 + try/catch |
| 게임오버/재시작 | ✅ PASS | credibility ≤ 0 → GAME_OVER → R/탭 → resetCurrentRun + ZONE_MAP |
| Web Audio API | ✅ PASS | AudioContext 프로시저럴 SFX 8종 |

---

## ✅ 긍정적 평가

1. **이전 리뷰 지적사항 3건 모두 완전 수정**: orphaned SVG 삭제, beginTransition 단일화, RESTART_ALLOWED 삭제.
2. **ASSET_MAP/SPRITES/preloadAssets 삭제 유지**: §4.1 에셋 금지 코드+파일 모두 준수.
3. **TDZ 문제 없음**: `G` 객체 INIT_EMPTY 패턴, 모든 프로퍼티 선언 시 초기화 [F12, F86 준수].
4. **ESCAPE_ALLOWED 18개 상태 완전 매핑** [F90 준수].
5. **ACTIVE_SYSTEMS 매트릭스 18개 상태 완전 정의** [F7 준수].
6. **SeededRNG 100% 사용**: Math.random 0건 [F18 준수].
7. **setTimeout 0건**: tw.delay + tween onComplete 패턴만 사용 [F4 준수].
8. **alert/confirm/prompt 0건**: Canvas 모달 사용 [F3 준수].
9. **eval() 0건**: 보안 위험 없음.
10. **hitTest() 통합 함수** [F16 준수].
11. **모바일 입력 완전 구현**: 가상 조이스틱 + 능력 버튼 + 더블탭 + 롱프레스.
12. **다국어(ko/en) 완전 지원**.
13. **프로시저럴 사운드**: Web Audio API 기반 SFX 8종 + BGM 4종.
14. **비주얼 품질**: 아르데코 도시 실루엣, 유령 글로우 오라, 별+달+가스등, 전환 애니메이션 4종 — 모두 Canvas 순수 드로잉.
15. **beginTransition 단일 정의**: transProxy 기반 tween 전환, 데드코드 0건.

---

## 📊 기획서 대비 준수율

| 섹션 | 준수 | 비고 |
|------|------|------|
| §2 게임 규칙 | ✅ | 4자원, 3능력, 대질 시스템, DDA |
| §3 조작 방법 | ✅ | 키보드 + 마우스 + 터치 완전 구현 |
| §4.1 에셋 금지 (코드) | ✅ | ASSET_MAP/SPRITES/preloadAssets 삭제 유지 |
| §4.1 에셋 금지 (파일) | ✅ | orphaned SVG 8개 삭제 완료, thumbnail.svg + manifest.json만 잔존 |
| §4.4 순수 함수 | ✅ | draw 함수 시그니처 (ctx, gt, ...) 준수 [F9, F19] |
| §5.1 INIT_EMPTY | ✅ | G 객체 모든 프로퍼티 선언 시 초기화 [F86] |
| §5.2 TweenManager | ✅ | clearImmediate, 가드 플래그 [F5, F13, F14] |
| §5.3 10 REGION | ✅ | CONFIG→ENGINE→ENTITY→DRAW→ABILITY→PUZZLE→CONFRONT→STATE→SAVE→MAIN |
| §6.1 STATE_PRIORITY | ✅ | ESCAPE_ALLOWED 완전 + beginTransition 단일 정의 (이전 데드코드 이슈 해소) |
| §6.2 ACTIVE_SYSTEMS | ✅ | 18상태 매트릭스 완전 [F7] |
| §8.2 DDA | ✅ | ddaStreak + ddaLevel 동적 난이도 |
| §11.1 점수 | ✅ | 판정 먼저 → 저장 나중에 [F8] |
| §14.3 SeededRNG | ✅ | Math.random 0건 [F18] |

---

## ⚠️ 잔존 이슈

**없음.** 이전 리뷰에서 지적된 P1-R, P2, P3 모두 수정 완료.

---

## 최종 판정

### 코드 리뷰: ✅ APPROVED
### 테스트: ✅ PASS
### 최종: ✅ APPROVED

**이전 리뷰(attempt 2) 대비 개선**:
- ✅ P1-R 해결: orphaned SVG 8개 삭제 완료
- ✅ P2 해결: beginTransition 이중 정의 → 단일 정의로 정리
- ✅ P3 해결: RESTART_ALLOWED 데드코드 삭제

**배포 가능 여부**: ✅ 즉시 배포 가능 — 잔존 이슈 0건
