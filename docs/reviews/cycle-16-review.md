---
game-id: neon-hex-drop
cycle: 16
title: "네온 헥스 드롭"
date: 2026-03-22
reviewer: claude-qa
review-round: 3
code-review-verdict: APPROVED
browser-test-verdict: PASS
verdict: APPROVED
---

# Cycle 16 Review (3차) — 네온 헥스 드롭 (neon-hex-drop)

_게임 ID: `neon-hex-drop` | 리뷰 일자: 2026-03-22 | 3차 리뷰 (최종 검증)_

---

## 0. 요약 (Executive Summary)

> **판정: 🟢 APPROVED — 즉시 배포 가능**

1차 리뷰에서 지적된 모든 CRITICAL 이슈(index.html 미존재, assets/ 디렉토리)가 완전 해결되었습니다.
- `index.html` 단일 파일 완전 구현 (1376줄, 외부 의존성 0개)
- `assets/` 디렉토리 없음 — `thumbnail.svg`만 존재 (F3/F23 준수)
- 기획서 피드백 F1~F23 충실히 반영
- 4개 상태 화면 모두 정상 렌더링, 콘솔 에러 0건, 콘솔 경고 0건

---

## 1. 파일 구조 검증

### 실제 파일 구조

```
public/games/neon-hex-drop/
├── index.html       ← 단일 HTML (1376줄, 모든 코드 인라인)
└── thumbnail.svg    ← 게임 썸네일 (허용)
```

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| F-1 | `index.html` 존재 | ✅ PASS | 1376줄 완전한 게임 구현 |
| F-2 | `assets/` 디렉토리 없음 | ✅ PASS | F3/F23 준수 |
| F-3 | 외부 에셋 0개 | ✅ PASS | 100% Canvas 코드 드로잉 |
| F-4 | `manifest.json` 없음 | ✅ PASS | 에셋 로딩 구조 불필요 |
| F-5 | SVG 에셋 파일 없음 | ✅ PASS | `thumbnail.svg`만 존재 (허용) |

---

## 2. 코드 리뷰 (정적 분석)

### 체크리스트

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| C-1 | 기능 완성도 | ✅ PASS | 4상태(TITLE/PLAYING/PAUSED/GAMEOVER), 6방향 낙하, 회전, BFS 매칭 3+, 재귀 연쇄, 하드드롭, 레벨업, 듀얼스폰, 구조 메커닉 |
| C-2 | 게임 루프 (rAF + delta time) | ✅ PASS | `requestAnimationFrame(gameLoop)`, `DT_CAP: 0.033`s, try-catch 래핑(F12) |
| C-3 | 메모리 관리 | ✅ PASS | `ObjectPool` (파티클 50, 팝업 10), `resetGame()` 시 전체 정리 |
| C-4 | 충돌/매칭 감지 | ✅ PASS | `findMatches()` BFS 기반 인접 3+ 그룹 탐색, `applyGravity()`, 재귀 연쇄 `resolveStep()` |
| C-5 | 모바일 터치 이벤트 | ✅ PASS | touchstart/touchend/touchmove 등록, `{passive:false}`, 스와이프+탭 분기 |
| C-6 | 게임 상태 머신 | ✅ PASS | `beginTransition()` + `STATE_PRIORITY` 우선순위 가드, `_transitioning` 중복 방지 |
| C-7 | 점수/최고점 localStorage | ✅ PASS | `saveHighScore()`/`loadHighScore()` try-catch 래핑, `neonHexDrop_hi` 키 |
| C-8 | 보안 (eval/XSS) | ✅ PASS | `eval()` 미사용, `alert()/confirm()/prompt()` 미사용 |
| C-9 | 성능 (DOM 접근 최소화) | ✅ PASS | offscreen canvas 배경 캐싱(`buildBgCache()`), 매 프레임 DOM 접근 없음, 오브젝트 풀링 |

### 코드 품질 상세

#### 순수 함수 패턴 (F11)
- `hexVertex()`, `sideVertices()`, `blockVertices()`, `blockCenter()`, `getNeighbors()`, `findMatches()`, `rotateGridData()`, `applyGravity()`, `checkGameOver()`, `calcScore()`, `getDropInterval()`, `getActiveColors()` — 모두 파라미터로 데이터 수신, 부작용 없음

#### 상태 전환 (F9, F17)
- `STATE_PRIORITY` 맵: `{ 3:3, 2:2, 1:1, 0:0 }` (GAMEOVER > PAUSED > PLAYING > TITLE)
- `beginTransition()`: 우선순위 기반 가드, tween 300ms 후 `enterState()` 호출
- PAUSED ↔ PLAYING: `enterState()` 직접 호출 (즉시 전환)
- `_transitioning` 가드로 중복 전환 방지

#### setTimeout 사용 (F2, F8)
- **0건** — Web Audio `ctx.currentTime + offset` 네이티브 스케줄링만 사용
- 연쇄(cascade)는 `TweenManager.add()` + `onComplete` 콜백으로 처리

#### 단일 갱신 경로 (F16)
- `addScore()`: 점수 갱신 + highScore 동기 갱신의 유일한 경로
- `setLevel()`: 레벨 갱신 + 낙하속도 갱신의 유일한 경로

#### TDZ/초기화 순서 (F5)
- `let canvas, ctx, dpr` 변수 선언 → `init()` DOM 할당 → `registerEventListeners()` → `loadHighScore()` → `enterState(TITLE)` → `requestAnimationFrame(gameLoop)`
- `window.addEventListener('load', init)` — DOM 완전 로드 후 초기화

#### 게임 루프 안전성 (F12)
```javascript
function gameLoop(timestamp) {
  try { ... } catch (e) { console.error(e); }
  requestAnimationFrame(gameLoop); // crash 시에도 루프 유지
}
```

---

## 3. 모바일 조작 대응 검사

| # | 검사 항목 | 결과 | 비고 |
|---|----------|------|------|
| M-1 | 터치 이벤트 등록 (touchstart/touchmove/touchend) | ✅ PASS | L1352~1354, `{ passive: false }` |
| M-2 | 터치 조작 UI (스와이프/탭 영역) | ✅ PASS | 좌/우 절반 탭=회전, 하향 스와이프(dy>50)=하드드롭, 일시정지 버튼 탭 |
| M-3 | 터치 타겟 ≥ 48px (F1/F4) | ✅ PASS | `CONFIG.MIN_TOUCH_TARGET: 48`, pauseBtnRect `w:48, h:48` |
| M-4 | 모바일 뷰포트 meta 태그 | ✅ PASS | `width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no` |
| M-5 | 스크롤 방지 | ✅ PASS | CSS `touch-action:none`, `overflow:hidden`, touchmove `e.preventDefault()` |
| M-6 | 키보드 없이 플레이 가능 | ✅ PASS | 탭(시작/회전/일시정지/재시작), 스와이프(하드드롭) — 전 상태 터치 대응 |
| M-7 | DPR 대응 | ✅ PASS | `canvas.width = W * dpr`, `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`, `resizeCanvas()` |
| M-8 | user-select 방지 | ✅ PASS | `user-select:none`, `-webkit-user-select:none`, `-webkit-touch-callout:none` |

---

## 4. 브라우저 테스트 (Puppeteer)

### 테스트 환경
- Chromium (Puppeteer MCP), 뷰포트 400×700 (모바일 시뮬레이션)

### 테스트 결과

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| B-1 | 페이지 로드 | ✅ PASS | file:// 프로토콜 즉시 로드 완료 |
| B-2 | 콘솔 에러 없음 | ✅ PASS | 에러 0건, 경고 0건 |
| B-3 | 캔버스 렌더링 | ✅ PASS | 400×700 캔버스 정상, DPR 적용 |
| B-4 | 시작 화면 표시 | ✅ PASS | "NEON HEX DROP" 글로우 타이틀, 6색 궤도 헥사곤, "PRESS ENTER OR TAP TO START" |
| B-5 | 게임 플레이 화면 | ✅ PASS | 중앙 헥사곤, 블록 낙하, HUD(SCORE/LEVEL/HIGH SCORE), ⏸ 버튼 |
| B-6 | 일시정지 화면 | ✅ PASS | 반투명 오버레이 + "PAUSED" + "PRESS SPACE OR TAP TO RESUME" |
| B-7 | 게임오버 화면 | ✅ PASS | "GAME OVER", SCORE/LEVEL 표시, "★ NEW HIGH SCORE! ★", "PRESS ENTER OR TAP TO RESTART" |
| B-8 | localStorage 최고점 | ✅ PASS | `neonHexDrop_hi` 키 정상 저장 확인 |

### 스크린샷 요약
1. **타이틀**: 네온 글로우 헥사곤 2중(코어+외곽), 6색 궤도 블록 애니메이션, 하단 조작법 안내
2. **플레이**: 6방향 블록 착지/낙하, HUD 좌상단(SCORE/LEVEL), 우상단(HIGH SCORE + ⏸ 버튼)
3. **일시정지**: 반투명 오버레이 + "PAUSED"
4. **게임오버**: 빨간 글로우 "GAME OVER", 점수/레벨/NEW HIGH SCORE 표시

---

## 5. 에셋 검증

| 항목 | 결과 |
|------|------|
| `public/games/neon-hex-drop/` 파일 목록 | `index.html` + `thumbnail.svg` (2개) |
| `assets/` 디렉토리 | ❌ 없음 (정상 — F3/F23 준수) |
| `manifest.json` | ❌ 없음 (정상) |
| 외부 SVG 에셋 | ❌ 없음 (정상) |
| 외부 리소스 요청 | 없음 — 100% Canvas 코드 드로잉 |

---

## 6. 기획서 피드백 반영 검증 (F1~F23)

| # | 피드백 | 반영 | 비고 |
|---|--------|------|------|
| F1 | MIN_TOUCH_TARGET 직접 참조 | ✅ | `CONFIG.MIN_TOUCH_TARGET: 48`, `pauseBtnRect` w/h에 직접 사용 |
| F2 | setTimeout 미사용 | ✅ | Web Audio 네이티브 스케줄링, setTimeout 0건 |
| F3 | assets/ 절대 금지 | ✅ | index.html + thumbnail.svg만 존재 |
| F4 | 터치 타겟 너비·높이 독립 보장 | ✅ | pauseBtnRect 48×48 |
| F5 | 초기화 순서 | ✅ | 변수 선언 → init() DOM → 이벤트 → rAF |
| F7 | 가드 플래그 | ✅ | `isResolving`, `_transitioning`, `isRotating` |
| F8 | setTimeout 상태 전환 금지 | ✅ | tween onComplete만 사용 |
| F9 | beginTransition() 단일 경로 | ✅ | STATE_PRIORITY 기반 우선순위 가드 |
| F11 | 순수 함수 패턴 | ✅ | 12개 순수 함수 식별 |
| F12 | try-catch 게임 루프 | ✅ | gameLoop 내부 래핑, rAF는 catch 밖 |
| F16 | 단일 갱신 경로 | ✅ | `addScore()`, `setLevel()` 단일 경로 |
| F17 | 상태 전환 우선순위 | ✅ | `STATE_PRIORITY` 맵 정의 |
| F20 | offscreen canvas 배경 캐싱 | ✅ | `buildBgCache()`, resizeCanvas() 시에만 재빌드 |
| F23 | assets/ 리뷰 검증 | ✅ | thumbnail.svg 외 파일 없음 |

---

## 7. 1차 리뷰 지적 사항 재검증

| 1차 이슈 | 1차 판정 | 2차 상태 | 검증 방법 |
|----------|---------|---------|----------|
| index.html 미존재 | 🔴 CRITICAL | ✅ 해결 | 파일 확인 — 1376줄 완전 구현 |
| assets/ 디렉토리 존재 | 🔴 CRITICAL | ✅ 해결 | Glob 검색 — index.html + thumbnail.svg만 존재 |
| 외부 SVG 에셋 | 🟡 MAJOR | ✅ 해결 | 100% Canvas 코드 드로잉 |

### 1차 Minor 이슈 재검증

| 이슈 | 2차 상태 | 비고 |
|------|---------|------|
| M1: 레벨별 활성 색상 수 불일치 | ✅ 해결 | `getActiveColors()`: lv1-3→3색(R,B,G), lv4-7→4색(+Y), lv8-12→5색(+P), lv13+→6색(+O) — 기획서 §2.2와 정확히 일치 |
| M2: PAUSED→GAMEOVER 전환 경로 | ⚠️ 유지 (무해) | `beginTransition(GAMEOVER)`는 어디서든 호출 가능하나, PAUSED 상태에서는 `update()` → `if (state !== STATE.PLAYING) return;`으로 블록 업데이트 중단 → GAMEOVER 트리거 불가. 방어적 코드로 무해 |

---

## 8. 발견 사항 (Minor — 배포 차단 불필요)

### M1. NEXT 블록 프리뷰 미구현
- 기획서에는 명시적 NEXT 프리뷰 언급이 없으나, 1차 리뷰에서 "NEXT 우상단"으로 기록됨
- 현재 코드에는 NEXT 프리뷰 UI가 없음 — 블록이 화면 밖에서 떨어지므로 사전에 보임
- **영향도**: 없음 — 게임플레이에 영향 없음

### M2. 마우스 클릭으로는 하드드롭 불가
- `handleClick()`에서 좌/우 회전만 처리, 하향 스와이프 감지 없음
- 키보드(ArrowDown/S)와 터치(스와이프)로는 하드드롭 가능
- **영향도**: 낮음 — 마우스 플레이 시 하드드롭 불가하나, 주요 타겟(모바일/키보드)에서는 정상

---

## 9. iframe 호환성 검증

| 항목 | 결과 | 비고 |
|------|------|------|
| sandbox="allow-scripts allow-same-origin" | ✅ 호환 | JS 실행 + localStorage 정상 |
| alert/confirm/prompt 미사용 | ✅ PASS | Canvas UI만 사용 |
| window.open/팝업 미사용 | ✅ PASS | |
| form submit 미사용 | ✅ PASS | |
| Canvas API | ✅ PASS | 전체 렌더링 Canvas 기반 |
| Web Audio API | ✅ PASS | try-catch 래핑으로 실패 시 무시 |
| window.innerWidth/Height | ✅ PASS | `resizeCanvas()`에서 사용 |
| Keyboard/Touch/Mouse 이벤트 | ✅ PASS | 3종 입력 모두 등록 |

---

## 10. 최종 판정

| 구분 | 판정 | 사유 |
|------|------|------|
| **코드 리뷰** | 🟢 **APPROVED** | F1~F23 충실 반영, 순수 함수 12개, 오브젝트 풀링, offscreen 캐싱, setTimeout 0건, 보안 이슈 없음 |
| **브라우저 테스트** | 🟢 **PASS** | 4개 화면 정상 렌더링, 콘솔 에러/경고 0건, localStorage 정상, 터치 완전 대응 |
| **종합 판정** | 🟢 **APPROVED** | 즉시 배포 가능. 마우스 하드드롭 미지원(M2)은 미세 UX 사안으로 차기 수정 가능. |
