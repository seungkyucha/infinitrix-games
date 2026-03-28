---
verdict: NEEDS_MAJOR_FIX
game-id: gem-royal-challenge
cycle: 49
reviewer: QA-agent
review-round: 2
date: 2026-03-28
---

# Cycle 49 QA 리뷰 — 젬 로얄 챌린지 (2차)

## 최종 판정: NEEDS_MAJOR_FIX

---

## 0. 요약

2차 리뷰에서 **치명적 런타임 버그**가 발견되었습니다.
`function` 선언을 이용한 함수 오버라이드 패턴이 JavaScript 호이스팅으로 인해
**9개 함수에서 무한 재귀(Maximum call stack size exceeded)** 를 발생시켜,
게임이 **완전히 검은 화면으로만 표시**됩니다.

---

## 1. 치명적 버그: 함수 오버라이드 무한 재귀 (BLOCKER)

### 원인
코드 후반부(§48, §101~§110)에서 기존 함수를 확장하기 위해 다음 패턴을 사용:

```js
const _origRenderTitle2 = renderTitle;   // 라인 4575
function renderTitle(ctx) {              // 라인 4576 — function 선언!
  _origRenderTitle2(ctx);                // ← 자기 자신을 호출
  renderTitleCredits(ctx);
}
```

**문제**: `function renderTitle(ctx)` 은 **함수 선언(declaration)** 이므로 호이스팅됩니다.
같은 스코프에 두 개의 `function renderTitle` 선언이 있으면, 마지막 것(라인 4576)이 승리합니다.
따라서 `const _origRenderTitle2 = renderTitle` 실행 시점에 `renderTitle`은 이미
라인 4576의 래퍼 함수를 가리키므로, `_origRenderTitle2(ctx)`는 **자기 자신을 호출**합니다.

### 올바른 패턴 (assignment 방식)
```js
const _origRenderTitle2 = renderTitle;   // 원본 캡처
renderTitle = function(ctx) {            // 대입문(assignment)으로 오버라이드
  _origRenderTitle2(ctx);
  renderTitleCredits(ctx);
};
```

### 영향 받는 함수 목록 (9개)

| # | 함수명 | 원본 라인 | 오버라이드 라인 | _orig 캡처 라인 |
|---|--------|----------|---------------|----------------|
| 1 | `renderHUD` | 2377 | 3662 | 3661 (`_baseRenderHUD`) |
| 2 | `renderLevelIntro` | 2605 | 4499 | 4498 |
| 3 | `renderResult` | 2687 | 4514 | 4513 |
| 4 | `handleMiniResultInput` | 3296 | 4546 | 4545 |
| 5 | `renderMiniResult` | 2785 | 4558 | 4557 |
| 6 | `renderTitle` | 2470 | 4576 | 4575 |
| 7 | `handleTitleInput` | 3045 | 4581 | 4580 |
| 8 | `renderEventHub` | 2559 | 4589 | 4588 |
| 9 | `finishCascade` | 1346 | 4654 | 4653 |

### 수정 방법
위 9개 모두 `function funcName(...)` 을 `funcName = function(...)` 으로 변경.

### 검증 결과 (Puppeteer)
```
[IX.Engine] RangeError: Maximum call stack size exceeded
```
- renderTitle: Maximum call stack size exceeded
- renderHUD: Maximum call stack size exceeded
- coreRender: Maximum call stack size exceeded
- 화면: 완전한 검은색 (아무것도 렌더링되지 않음)

---

## 2. 정적 분석 체크리스트

### 📌 1. preventDefault()
- **상태**: ✅ PASS
- `contextmenu` 에 `e.preventDefault()` 적용 (라인 3454)
- 터치 이벤트는 `{passive:true}`로 등록 — 스크롤 방지는 CSS `touch-action:none`으로 처리

### 📌 2. requestAnimationFrame + delta time
- **상태**: ✅ PASS
- Engine 클래스가 rAF 루프 제공, `dtMs` → `coreUpdate(dtMs / 1000)` 로 초 단위 변환
- BGM도 dt 기반 타이머 (`bgmTimer += dt`, 라인 1703)
- `setTimeout` 사용 0건 (게임 로직 내), `setInterval` 0건

### 📌 3. 터치 이벤트
- **상태**: ✅ PASS
- `touchstart` (라인 3391, 3500), `touchend` (라인 3402, 3508), `touchmove` (라인 3509)
- 스와이프 threshold 30px (§3 조작 준수)
- 롱프레스 500ms (라인 3506) — 보석 정보 팝업
- 최소 터치 타겟 48px (`MIN_TOUCH = 48`, 라인 153)

### 📌 4. 상태 전환 흐름
- **상태**: ✅ PASS (코드 설계는 우수)
- 18개 상태 enum + TRANSITION_TABLE 화이트리스트 (라인 74~94)
- `deferredQueue` 지연 전환 (라인 371~372) — enterState 내 동기 전환 방지
- `beginTransition()` → 페이드 → `enterState()` 체인
- GUARDS 11개 플래그 + `isInputBlocked()` 단일 게이트

### 📌 5. localStorage 최고점 저장/로드
- **상태**: ✅ PASS
- `Save.set()` / `Save.get()` (IX Engine API 사용, 라인 799~822)
- `gSaveData` 구조: levelProgress, boosters, streaks, settings, totalStars
- 레벨 클리어 시 자동 저장 (라인 1813~1825)

### 📌 6. Canvas resize + devicePixelRatio
- **상태**: ✅ PASS
- Engine 클래스가 `onResize(w,h)` 콜백 제공 (라인 3361)
- 모든 좌표가 `Layout.cx()`, `Layout.cy()` 기반 동적 계산
- `getCellSize()`가 `window.innerWidth/innerHeight` 기반 반응형

### 📌 7. 외부 CDN 의존 없음
- **상태**: ✅ PASS
- Google Fonts 없음, 시스템 폰트 `system-ui` 전용
- 외부 스크립트 없음 (`/engine/ix-engine.js`만 로컬 참조)
- 외부 이미지/CDN 없음

---

## 3. 기획 적합성 (스펙 대비)

| 기획 항목 | 구현 상태 | 비고 |
|-----------|----------|------|
| 8×8 그리드 6색 | ✅ 구현됨 | ROWS=8, COLS=8, GEM_TYPES 6종 |
| 매치 우선순위 5→T/L→4→3 | ✅ 구현됨 | findMatches() §17, used[][] 추적 |
| 스페셜 조합 6종 | ✅ 구현됨 | checkSpecialCombo() §18 |
| 장애물 8종 (PIE 신규 포함) | ✅ 구현됨 | OBS enum 8종, gPieData 6조각 관리 |
| 부스터 4종 | ✅ 구현됨 | §26 전체 |
| 30레벨 (25+5이벤트) | ✅ 구현됨 | LEVELS 배열 30개 항목 |
| King's Cup AI 5명 | ✅ 구현됨 | kingsCupGenerateAI() §34 |
| 데일리 챌린지 (시드 기반) | ✅ 구현됨 | getDailyChallengeDef() + SeededRNG |
| Super Booster 연승 보상 | ✅ 구현됨 | §33 SUPER_BOOSTER 상태 |
| 팀 배틀 4팀 | ✅ 구현됨 | teamBattleGenerateAI() §34 |
| 미니게임 4종 독립 플레이 | ✅ 구현됨 | MINI_HUB 상태 + 4종 |
| deferredTransition 큐 | ✅ 구현됨 | §11 + coreUpdate 말미 소비 |
| DDA 3단계 | ✅ 구현됨 | applyDdaToBoard() §27 |
| 색맹 모드 | ✅ 구현됨 | GEM_SHAPES + F5 토글 |
| 다국어 ko/en | ✅ 구현됨 | LANG 객체 + T() 함수 |
| 왕 캐릭터 감정 | ✅ 구현됨 | idle/happy/scared/surprised |

---

## 4. 브라우저 실행 테스트 결과

| 테스트 | 결과 | 비고 |
|--------|------|------|
| A: 로드+타이틀 | **FAIL** | 검은 화면. renderTitle 무한 재귀 |
| B: Space 시작 | **FAIL** | 렌더링 불가로 테스트 불가 |
| C: 이동 조작 | **FAIL** | 렌더링 불가로 테스트 불가 |
| D: 게임오버+재시작 | **FAIL** | 렌더링 불가로 테스트 불가 |
| E: 터치 동작 | **FAIL** | 렌더링 불가로 테스트 불가 |

> 엔진은 로드 성공 (IX 존재, gState=TITLE, assetsLoaded=true).
> 그러나 `coreRender()` 호출 시 매 프레임 스택 오버플로우 발생으로
> 화면에 아무것도 표시되지 않음.

---

## 5. 코드 품질 긍정적 측면

런타임 버그를 제외하면 코드 설계 자체는 우수합니다:

1. **TRANSITION_TABLE 화이트리스트** — 잘못된 상태 전환 차단
2. **deferredTransition 큐** — enterState 내 동기 전환 근절 (기획서 F1 해결)
3. **GUARDS 11중 방어** + `isInputBlocked()` 단일 게이트
4. **safeGridAccess()** — 모든 그리드 접근 래핑
5. **SeededRNG** — Math.random() 0건, 완벽한 결정론적 난수
6. **drawAssetOrFallback** — 72개 에셋 전부 캔버스 폴백 구현
7. **18개 효과음** 절차적 생성 + dt 기반 BGM
8. **4개 미니게임** 완전 독립 구현
9. **이벤트 시스템** 4종 (King's Cup, Daily, Team, Super Booster)
10. **자동 셔플** — 유효 이동 없을 시 자동 재배치 (§109)

---

## 6. 수정 필요 사항

### 🔴 BLOCKER (반드시 수정)
1. **9개 함수 오버라이드 무한 재귀 수정**
   - 라인 3662, 4499, 4514, 4546, 4558, 4576, 4581, 4589, 4654
   - `function funcName(...)` → `funcName = function(...)` 로 변경

### 🟡 MINOR (배포 후 개선 가능)
2. Wood 장애물 `obsLayer` 기본값이 1이지만 스펙은 "인접 매칭 1회" — 일관성 확인 필요
3. `renderMap`이 두 번 오버라이드됨 (§54 + §98) — 체인은 정상 작동하나 가독성 저하
4. 일부 함수 오버라이드가 `const _orig` + assignment, 일부가 `const _orig` + declaration — 패턴 통일 필요

---

## 7. 결론

코드의 아키텍처와 기능 범위는 매우 인상적이며, 기획서의 거의 모든 요구사항을 충실히 구현했습니다.
그러나 **함수 오버라이드 패턴의 체계적 오류**로 인해 게임이 전혀 실행되지 않습니다.

**수정은 단순합니다**: 9개 위치에서 `function` 키워드를 제거하고 대입문으로 변경하면 됩니다.
수정 후 재검토 시 APPROVED 가능성이 높습니다.
