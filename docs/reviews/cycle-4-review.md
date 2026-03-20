# Cycle 4 코드 리뷰 & 테스트 결과

> **게임:** 네온 대시 러너 (Neon Dash Runner)
> **Game ID:** `neon-dash-runner`
> **리뷰 일시:** 2026-03-20
> **리뷰어:** Claude (QA)
> **기획서:** `docs/game-specs/cycle-4-spec.md`

---

## 1. 코드 리뷰 (정적 분석)

### 1.1 기능 완성도

| 기획 항목 | 구현 | 비고 |
|-----------|------|------|
| 3레인 시스템 + tween 전환 | ✅ | easeOutQuad 150ms, 터치 시 180ms |
| 점프 물리 (포물선) | ✅ | JUMP_DURATION=500ms, 레인 전환 동시 가능 |
| 장애물 4종 (배리어/스파이크/레이저/드론) | ✅ | 드론 상하 왕복, 레이저 2레인 점유 |
| 코인 2종 (일반/슈퍼) + 연속 줄 | ✅ | 확률 분배 70%/15%/15% |
| 파워업 3종 (자석/쉴드/x2) | ✅ | 가드 플래그 적용 |
| 절차적 레벨 생성 (청크) | ✅ | 6패턴, 안전 레인 보장, 난이도 곡선 |
| 속도 곡선 | ✅ | `min(600, 200 + distance * 0.04)` |
| 관대한 히트박스 | ✅ | 장애물 ×0.7, 코인 ×1.3 |
| Near Miss 시스템 | ✅ | +30점, 슬로모 tween |
| 점수 + localStorage 최고기록 | ✅ | 4개 키, try-catch 래핑 |
| 6상태 게임 상태 머신 | ✅ | LOADING/TITLE/PLAYING/PAUSE/CONFIRM_MODAL/GAMEOVER |
| TweenManager (이징 5종) | ✅ | linear/easeOutQuad/easeInQuad/easeOutBack/easeOutElastic |
| ObjectPool (4종) | ✅ | 장애물 20, 코인 30, 파워업 5, 파티클 60 |
| TransitionGuard 패턴 | ✅ | STATE_PRIORITY 맵 + beginTransition() |
| Canvas 기반 모달 | ✅ | confirm 대체 완료 |
| 상태×시스템 매트릭스 주석 | ✅ | 코드 상단에 ASCII 테이블로 포함 |
| destroy() + 리스너 cleanup | ✅ | registeredListeners 패턴, AudioContext close |
| 키보드/마우스/터치 입력 자동감지 | ✅ | inputMode 4개 사용처 모두 구현 |
| 패럴랙스 3레이어 배경 | ✅ | offscreen canvas 캐시, ×0.1/×0.4/×1.0 |
| Web Audio 효과음 5종 | ✅ | jump/coin/hit/powerup/gameover |
| 동적 밸런스 보정 | ✅ | dangerModeChunks, consecutiveSafeDist, 비네트 |

### 1.2 게임 루프 & 프레임 처리

- ✅ `requestAnimationFrame` 사용
- ✅ delta time 처리: `Math.min((timestamp - lastTime) / 1000, 0.05)` — 50ms 캡
- ✅ `tw.update(dt)` 모든 상태에서 호출 (매트릭스 준수)
- ✅ GAMEOVER에서 파티클 업데이트 (매트릭스 준수)

### 1.3 메모리 관리

- ✅ `registeredListeners[]` + `listen()` 헬퍼로 이벤트 추적
- ✅ `destroy()` 에서 리스너/풀/tween/오디오 전부 정리
- ✅ ObjectPool acquire/release 패턴 (역순 순회 + splice)
- ✅ TweenManager deferred cancel 패턴

### 1.4 보안 검사

- ✅ `eval()` 사용 없음
- ✅ `setTimeout` / `setInterval` 사용 없음
- ✅ `confirm()` / `alert()` / `prompt()` 사용 없음
- ✅ XSS 위험 요소 없음

### 1.5 모바일 대응

- ✅ 터치 이벤트 구현 (touchstart/touchend + preventDefault)
- ✅ `{ passive: false }` 옵션
- ✅ 스와이프 감도 30px 임계치
- ✅ Canvas 리사이즈: `window.innerWidth × window.innerHeight` 기준
- ✅ DPR 대응 (`devicePixelRatio`)
- ✅ `touch-action: none` + `-webkit-tap-highlight-color: transparent`
- ✅ 터치 모드 시 버튼 1.5배 확대

### 1.6 점수/최고점 저장

- ✅ localStorage 4개 키 (`ndr_bestScore`, `ndr_bestDist`, `ndr_totalCoins`, `ndr_totalRuns`)
- ✅ try-catch 래핑 (iframe sandbox 안전)
- ✅ "판정 먼저, 저장 나중에" 순서 준수 (`isNewBest = score > prevBest` → `saveBest()`)

---

## 2. 발견된 버그

### 🔴 [B1] CRITICAL — `startGame()` 상태 전환 실패 (게임 시작 불가)

**위치:** `startGame()` 함수 (line 798~805)

**원인:**
```javascript
function startGame() {
  resetGame();           // ← tw.cancelAll() 호출 → _pendingCancel = true
  tw.add(titleGlow, { alpha: 0 }, 300, 'easeOutQuad', () => {
    forceState(STATES.PLAYING);   // ← 이 콜백이 영영 실행되지 않음
    titleGlow.alpha = 0.7;
  });
  transitioning = true;  // ← 영구 true로 고정됨
}
```

`resetGame()`이 `tw.cancelAll()`을 호출하면 `_pendingCancel = true`가 설정됩니다.
직후에 추가된 fadeOut 트윈은 다음 `tw.update(dt)` 호출 시 `_pendingCancel` 플래그에 의해
**신규 트윈까지 함께 전부 삭제**됩니다.

결과:
- `forceState(STATES.PLAYING)` 콜백이 **영원히 실행되지 않음**
- `transitioning = true`가 **영구 고정** → 이후 어떤 상태 전환도 불가
- **유저가 게임을 시작할 수 없음** (Space/Enter/클릭/탭 모두 무효)

**수정 방안:**
```javascript
function startGame() {
  resetGame();
  // cancelAll의 deferred 처리가 완료된 후 tween 추가하거나,
  // cancelAll 직후 즉시 flush
  tw._pendingCancel = false;  // 즉시 해제 (resetGame이 이미 _tweens를 비움)
  tw._tweens.length = 0;      // 명시적 비우기
  tw.add(titleGlow, { alpha: 0 }, 300, 'easeOutQuad', () => {
    forceState(STATES.PLAYING);
    titleGlow.alpha = 0.7;
  });
  transitioning = true;
}
```
또는 TweenManager에 `clearImmediate()` 메서드 추가.

**심각도:** 🔴 CRITICAL — 게임을 정상적으로 시작할 수 없음

---

### 🟡 [B2] MAJOR — SVG 에셋 사용 (기획서 §4.5 금지 목록 위반)

**위치:** line 96~121 (ASSET_MAP + preloadAssets)

**기획서 §4.5 금지 목록:**
> ❌ SVG 파일 / SVG 필터 (feGaussianBlur, \<filter\>)
> ❌ 외부 이미지 파일 (.png, .jpg, .svg, .gif)

**현황:**
- `assets/` 폴더에 SVG 파일 9개 존재 (player, enemy, bg-layer1/2, ui-heart, ui-star, powerup, effect-hit, thumbnail)
- `manifest.json`에 에셋 8개 정의
- `preloadAssets()`가 전부 로드 → 8개 모두 성공적으로 로드됨
- `player.svg`에 `feGaussianBlur` 필터 2개 포함 (line 22, 26)
- `drawPlayer()`, `drawObstacle()`, `drawCoin()`, `drawPowerup()`, HUD에서 SVG 에셋 우선 사용 (폴백 Canvas 드로잉 존재)

**영향:**
- Canvas 폴백 코드가 있어 SVG 로드 실패 시에도 게임 동작은 가능
- 그러나 기획서의 "SVG 완전 미사용" + "100% Canvas 드로잉" 원칙에 명백히 위반
- `feGaussianBlur` 사용은 Cycle 3 B4에서 명시적으로 금지된 패턴의 재발

**수정 방안:**
1. `assets/` 폴더 전체 삭제
2. `ASSET_MAP`, `SPRITES`, `preloadAssets()` 코드 제거
3. 모든 렌더링 함수에서 SVG 에셋 분기 제거 (폴백 Canvas 코드만 유지)
4. 로딩 화면에서 에셋 프리로드 대기 불필요

**심각도:** 🟡 MAJOR — 기획서 명시적 금지 위반이나 폴백 코드로 기능상 문제 없음

---

### 🟢 [B3] MINOR — `goToTitle()` 후 타이틀 글로우 tween 미복구

**위치:** `goToTitle()` (line 877~881) / `init()` (line 1804~1808)

**원인:** `pulseTitle()` 함수는 `init()` 내부에서만 최초 1회 호출됩니다.
`goToTitle()` → `resetGame()` → `tw.cancelAll()`로 기존 글로우 tween이 제거되지만,
`pulseTitle()`이 다시 호출되지 않아 GAMEOVER → TITLE 복귀 시 글로우 애니메이션이 멈춥니다.

**영향:** 시각적 퀄리티 저하 (타이틀 글로우 정지), 게임 기능에 영향 없음

**수정:** `goToTitle()`에 `pulseTitle()` 재호출 추가

**심각도:** 🟢 MINOR

---

### 🟢 [B4] MINOR — 코인 콤보 보너스 미구현

**기획서 §7.1:** "연속 코인 5개 콤보 → +20점 보너스"

코드에 `coinCount` 변수는 있으나 **연속 코인 카운터**(5개마다 보너스)는 구현되어 있지 않습니다.
`coinCount`는 총 누적 수만 세고, 연속 판정 로직이 없습니다.

**심각도:** 🟢 MINOR — 보조 점수 메커니즘 누락

---

## 3. 브라우저 테스트 (puppeteer)

| 항목 | 결과 | 비고 |
|------|------|------|
| 페이지 로드 | ✅ PASS | 에러 없이 로드 완료 |
| 콘솔 에러 없음 | ✅ PASS | JS 에러/경고 0건 |
| 캔버스 렌더링 | ✅ PASS | DPR 대응 정상, 배경 3레이어 렌더링 |
| 시작 화면 표시 | ✅ PASS | 타이틀, 조작 안내, 최고기록 표시 |
| 게임 시작 (유저 입력) | ❌ FAIL | **[B1]** Space/클릭/탭으로 게임 시작 불가 (tween 전환 실패) |
| 게임플레이 (강제 진입) | ✅ PASS | 장애물/코인/충돌/HUD 모두 정상 동작 |
| 터치 이벤트 코드 존재 | ✅ PASS | touchstart/touchend + 스와이프 감지 |
| 점수 시스템 | ✅ PASS | 거리 점수, 코인 점수, x2 배율, Near Miss |
| localStorage 최고점 | ✅ PASS | 정상 저장/불러오기 확인 |
| 게임오버/재시작 | ⚠️ PARTIAL | 게임오버 화면 정상 표시, 그러나 재시작 시 [B1]과 동일 이슈 |
| SVG 에셋 로드 | ✅ 로드됨 | 8/8 에셋 로드 성공 (단, 기획서 위반) |

### 스크린샷 요약

1. **타이틀 화면** — 네온 사이버펑크 배경, 건물 실루엣, 별 파티클, 스캔라인 효과 정상
2. **게임플레이** (강제 진입) — 3레인 도로, 플레이어 삼각형 + 글로우, 배리어/스파이크 장애물, 코인, "+10" 팝업, HUD 정상
3. **게임오버** — 반투명 오버레이, 거리/점수/코인 순차 표시, NEW BEST! easeOutElastic 연출, inputMode별 재시작 안내

---

## 4. 기획서 대조 체크리스트 (§13.4)

| 항목 | 결과 | 비고 |
|------|------|------|
| 모든 상태에서 `tw.update(dt)` 호출 | ✅ PASS | 6상태 모두 확인 |
| `setTimeout`/`setInterval` 사용 0건 | ✅ PASS | grep 0건 |
| `confirm()`/`alert()` 사용 0건 | ✅ PASS | Canvas 모달로 대체 |
| SVG/외부 이미지/외부 폰트 사용 0건 | ❌ FAIL | SVG 에셋 8개 사용 [B2] |
| 점수 판정→저장 순서 | ✅ PASS | `isNewBest` 먼저 → `saveBest()` 나중 |
| `beginTransition()` 헬퍼 사용 | ✅ PASS | GAMEOVER 전환에 사용 |
| `transitioning` 가드 플래그 적용 | ⚠️ PARTIAL | 적용됨, 그러나 [B1]로 인해 영구 true 가능 |
| `STATE_PRIORITY` 맵 + 우선순위 검사 | ✅ PASS | {0:0, 1:10, 2:20, 3:30, 4:35, 5:99} |
| `destroy()` 패턴 리스너 정리 | ✅ PASS | 6개 리스너 등록/정리 확인 |
| 이징 5종 구현 | ✅ PASS | linear/easeOutQuad/easeInQuad/easeOutBack/easeOutElastic |
| 유령 변수 방지 | ✅ PASS | inputMode(4곳), nearMissCount, timeSinceLastPowerup, consecutiveSafeDist 모두 갱신/사용 확인 |
| 관대한 히트박스 | ✅ PASS | HITBOX_SHRINK=0.7, COIN_HITBOX_GROW=1.3 |
| 안전 레인 보장 | ✅ PASS | safeLanes 검사 + 폴백 장애물 제거 |
| Canvas 기반 모달만 사용 | ✅ PASS | renderModal() 구현 확인 |
| 금지 패턴 grep 검사 | ✅ PASS | 0건 (JS 코드 내) |

---

## 5. 에셋 확인

| 에셋 | 존재 | 비고 |
|------|------|------|
| `assets/manifest.json` | ✅ | 8개 에셋 정의 |
| `assets/player.svg` | ✅ | ⚠️ `feGaussianBlur` 2개 포함 |
| `assets/enemy.svg` | ✅ | 배리어 렌더링용 |
| `assets/bg-layer1.svg` | ✅ | 원경 배경 |
| `assets/bg-layer2.svg` | ✅ | 근경 배경 |
| `assets/ui-heart.svg` | ✅ | HUD 라이프 |
| `assets/ui-star.svg` | ✅ | HUD 점수/코인 |
| `assets/powerup.svg` | ✅ | 파워업 캡슐 |
| `assets/effect-hit.svg` | ✅ | 충돌 이펙트 |
| `assets/thumbnail.svg` | ✅ | 플랫폼 썸네일 |

> **기획서 §4.5 위반:** 모든 SVG 에셋은 삭제 필요. 이미 Canvas 폴백 렌더링 코드가 존재하므로 에셋 제거 후에도 게임 동작에 문제 없음.

---

## 6. 최종 판정

### 코드 리뷰: **NEEDS_MAJOR_FIX** 🔴

### 테스트: **FAIL** ❌

### 근거

1. **[B1] CRITICAL** — `startGame()` tween 전환 실패로 **유저가 게임을 시작할 수 없음**. TweenManager의 deferred `cancelAll()` 패턴과 직후 tween 추가 사이의 경쟁 조건. 게임 플레이 자체가 불가능한 치명적 버그.

2. **[B2] MAJOR** — 기획서에서 명시적으로 금지한 SVG 에셋을 사용 중. `feGaussianBlur` 포함. Cycle 3 B4의 재발.

### 수정 우선순위

| 순위 | 버그 | 필수 여부 |
|------|------|-----------|
| 1 | [B1] startGame() tween 경쟁 조건 | 🔴 필수 — 게임 시작 불가 |
| 2 | [B2] SVG 에셋 제거 + Canvas 전용 전환 | 🔴 필수 — 기획서 원칙 위반 |
| 3 | [B3] goToTitle() 글로우 tween 복구 | 🟡 권장 |
| 4 | [B4] 코인 콤보 보너스 구현 | 🟢 선택 |

> **→ 코더 재작업 필요.** [B1]과 [B2]를 수정한 후 재리뷰 요청.
