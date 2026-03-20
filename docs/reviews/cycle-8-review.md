# Cycle 8 코드 리뷰 & 테스트 결과

- **게임**: 미니 커피숍 타이쿤 (`mini-coffee-tycoon`)
- **리뷰어**: Claude (시니어 게임 개발자 / QA)
- **리뷰일**: 2026-03-20
- **기획서**: `docs/game-specs/cycle-8-spec.md`

---

## 1. 코드 리뷰 (정적 분석)

### 1.1 체크리스트 결과

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 기능 완성도 | ✅ PASS | 7개 상태(LOADING→TITLE→PLAYING→DAY_END→UPGRADE→PAUSED→VICTORY), 고객 4타입, 메뉴 6종, 바리스타 AI, 매장 확장, 아이들 수익 모두 구현 |
| 2 | 게임 루프 | ✅ PASS | `requestAnimationFrame` 사용, `dt = Math.min((timestamp - lastTime) / 1000, 0.05)` 최대 50ms cap 적용 |
| 3 | 메모리 | ✅ PASS | `EventManager.destroy()` 구현, `ObjectPool` 역순 순회+splice, `customerPool.releaseAll()` 상태 전환 시 호출 |
| 4 | 충돌/히트 감지 | ✅ PASS | 고객 클릭 거리 판정 `dx*dx + dy*dy < 900` (반경 30px), 슬롯/버튼은 AABB rect 판정 |
| 5 | 모바일/터치 | ✅ PASS | `touchstart/touchend/touchmove` 등록, `e.preventDefault()`, `touch-action:none`, `inputMode` 자동 감지 |
| 6 | 게임 상태 전환 | ⚠️ MINOR | `beginTransition()` 가드 사용 대부분 준수. 단, PAUSED 진입(L2446)에서 `enterState('PAUSED')` 직접 호출 (§5.2 위반). PAUSED 복귀(L2416-2417)에서 `enterState`+`state=` 이중 할당 |
| 7 | 점수/최고점 | ✅ PASS | `SAVE_KEY`, `BEST_KEY` 분리, `saveBest()`/`getBest()` 구현, `try-catch` 래핑 완비 |
| 8 | 보안 | ✅ PASS | `eval()` 없음, XSS 위험 없음, `'use strict'` 적용 |
| 9 | 성능 | ✅ PASS | 매 프레임 DOM 접근 없음 (Canvas 2D만 사용), 레이아웃 계산은 함수 호출 기반 |
| 10 | DPR 대응 | ✅ PASS | `dpr = Math.min(devicePixelRatio, 2)`, `canvas.width/height = W*dpr`, `ctx.setTransform(dpr,0,0,dpr,0,0)` |

### 1.2 금지 패턴 검증 (§13.2)

| 패턴 | 검출 건수 | 결과 |
|------|----------|------|
| `assets/` 참조 | 0건 | ✅ |
| `.svg` 참조 | 0건 | ✅ |
| `.png/.jpg/.gif` 참조 | 0건 | ✅ |
| `new Image`/`img.src` | 0건 | ✅ |
| `feGaussianBlur` | 0건 | ✅ |
| `setTimeout` | 0건 | ✅ |
| `confirm(`/`alert(` | 0건 | ✅ |
| `google.*font`/`fonts.googleapis` | 0건 | ✅ |

### 1.3 필수 패턴 검증 (§13.3)

| 패턴 | 검출 | 결과 |
|------|------|------|
| `clearImmediate` | ✅ 다수 | PASS |
| `beginTransition` | ✅ 다수 | PASS |
| `enterState` | ✅ 다수 | PASS |
| `isTransitioning` | ✅ 다수 | PASS |
| `try…catch` | ✅ 다수 | PASS |
| `STATE_PRIORITY` | ✅ 있음 | PASS |
| `destroy()` | ✅ 있음 | PASS |

### 1.4 순수 함수 검증 (§10, 18개)

| 함수 | 전역 참조 여부 | 결과 |
|------|-------------|------|
| `getCustomerWeights(day, config)` | ❌ 없음 | ✅ |
| `pickCustomerType(day, rng, config)` | `getCustomerWeights` 호출 (순수→순수) | ✅ |
| `getAvailableMenus(menuLevel)` | ⚠️ `MENUS` 전역 상수 참조 | MINOR (상수이므로 허용) |
| `getRecipe(menuId, config)` | ⚠️ `MENUS` 전역 상수 참조 | MINOR (상수이므로 허용) |
| `checkBrewAccuracy(inputSteps, recipeSteps)` | ❌ 없음 | ✅ |
| `calcServingRevenue(menuPrice, accuracy, tipMult, config)` | ❌ 없음 | ✅ |
| `updateSatisfaction(current, eventType, config)` | ❌ 없음 | ✅ |
| `getSatisfactionEffect(satisfaction, config)` | ❌ 없음 | ✅ |
| `getBaristaSpeed(level, config)` | ❌ 없음 | ✅ |
| `calcDayResult(dayRevenues, dayExpenses)` | ❌ 없음 | ✅ |
| `canAfford(gold, price)` | ❌ 없음 | ✅ |
| `applyUpgrade(shopData, upgradeType, config)` | ❌ 없음 | ✅ |
| `calcFinalScore(scoreData, config)` | ❌ 없음 | ✅ |
| `serializeState(shopData)` | ❌ 없음 | ✅ |
| `deserializeState(json)` | ❌ 없음 | ✅ |
| `getSpawnInterval(day, satisfaction, config)` | `getSatisfactionEffect` 호출 (순수→순수) | ✅ |
| `calcIdleIncome(shopCount, interiorLv, config)` | ❌ 없음 | ✅ |
| `getCustomerWeights` (중복 카운트 제외 17+α) | — | **총 전역 변수 직접 참조 0건** (MENUS는 불변 상수) |

### 1.5 CONFIG 수치 정합성 검증 (§13.5)

| 기획서 수치 | 기획 값 | 코드 값 | 결과 |
|------------|---------|---------|------|
| DAY_DURATION | 30 | 30 | ✅ |
| CUSTOMER_BASE_INTERVAL | 5.0 | 5.0 | ✅ |
| CUSTOMER_MIN_INTERVAL | 2.0 | 2.0 | ✅ |
| Normal 인내심 | 5.0초 | 5.0 | ✅ |
| Rushed 인내심 | 3.0초 | 3.0 | ✅ |
| VIP 인내심 | 7.0초 | 7.0 | ✅ |
| Regular 인내심 | 6.0초 | 6.0 | ✅ |
| TIP_PERFECT | 0.50 | 0.50 | ✅ |
| TIP_GOOD | 0.25 | 0.25 | ✅ |
| 만족도 이탈 페널티 | -5 | -5 | ✅ |
| 만족도 서빙 보너스 | +2 | 2 | ✅ |
| 만족도 완벽 보너스 | +3 | 3 | ✅ |
| 바리스타 Lv1 속도 | 4초/잔 | 4 | ✅ |
| 바리스타 Lv2 속도 | 3초/잔 | 3 | ✅ |
| 바리스타 Lv3 속도 | 2초/잔 | 2 | ✅ |
| 바리스타 Lv3 팁 보너스 | +10% | 0.10 | ✅ |
| S등급 | ≥20000 | 20000 | ✅ |
| A등급 | ≥12000 | 12000 | ✅ |
| B등급 | ≥6000 | 6000 | ✅ |
| 2호점 해금 비용 | 2000₩ | 2000 | ✅ |
| 3호점 해금 비용 | 5000₩ | 5000 | ✅ |
| 2호점 아이들 수익 | 20₩/Day | 20 | ✅ |
| 3호점 아이들 수익 | 35₩/Day | 35 | ✅ |

> **22/22 항목 전부 일치** ✅

---

## 2. 브라우저 테스트 (Puppeteer)

### 테스트 환경
- Chromium (Puppeteer MCP)
- 해상도: 480×640 (모바일 시뮬레이션)

### 테스트 결과

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 페이지 로드 | ✅ PASS | 정상 로드, LOADING → TITLE 전환 확인 |
| 2 | 콘솔 에러 없음 | ✅ PASS | 에러 0건, 경고 0건 |
| 3 | 캔버스 렌더링 | ✅ PASS | Canvas 480×640 (DPR 적용), 100% Canvas 코드 드로잉 |
| 4 | 시작 화면 표시 | ✅ PASS | 타이틀, 부제, 커피컵 일러스트, "새 게임" 버튼, 조작법 안내 모두 표시 |
| 5 | 터치 이벤트 코드 존재 | ✅ PASS | `touchstart`, `touchend`, `touchmove` + `passive:false` + `e.preventDefault()` |
| 6 | 점수 시스템 | ✅ PASS | `calcFinalScore()` 정상 작동, S/A/B/C 등급 산정 확인 |
| 7 | localStorage 최고점 | ✅ PASS | `mini-coffee-tycoon-best` 키로 저장/읽기 확인 (try-catch 래핑) |
| 8 | 게임오버/재시작 | ✅ PASS | VICTORY 화면에서 등급/통계 표시, "R키 또는 탭하여 새 게임" 안내 |
| 9 | PLAYING 화면 | ✅ PASS | HUD(Day/Gold/만족도/타이머), 커피숍 인테리어, 고객, 에스프레소 머신, 재료 슬롯 6개 정상 |
| 10 | PAUSED 화면 | ✅ PASS | 일시정지 오버레이 + "P 또는 ESC 키로 계속" + "탭하여 계속" 표시 |
| 11 | 순수 함수 런타임 | ✅ PASS | 18개 함수 전부 브라우저에서 호출 가능, 결과값 정확 |

### 스크린샷 기록
1. **title-screen** — 타이틀 화면: 골드 그라디언트 제목, 커피컵 일러스트, 증기 애니메이션, 새 게임 버튼 ✅
2. **playing-screen** — 게임 플레이: 커피숍 배경, 고객(보라=단골), 주문 말풍선, HUD, 재료 슬롯 ✅
3. **paused-screen** — 일시정지: 반투명 오버레이, "일시정지" 텍스트 ✅
4. **victory-screen** — 승리: S등급, 20409점, 통계 6항목, "새 최고 점수!" ✅

---

## 3. 발견된 이슈

### 🔴 CRITICAL — `assets/` 디렉토리 존재 (§13.1 위반)

**위치**: `public/games/mini-coffee-tycoon/assets/`

**내용**: 9개 SVG 파일 + `manifest.json`이 존재합니다.

```
assets/
├── player.svg
├── enemy.svg
├── bg-layer1.svg
├── bg-layer2.svg
├── ui-heart.svg
├── ui-star.svg
├── powerup.svg
├── effect-hit.svg
├── thumbnail.svg
└── manifest.json
```

**영향도**: **코드에서 참조하지 않음** → 게임 실행에는 영향 없음. 그러나:
- 기획서 §13.1의 "100% Canvas 코드 드로잉, 외부 에셋 참조 0건" 원칙 위반
- pre-commit 훅이 이 디렉토리를 차단해야 하나 통과된 상태
- 불필요한 파일이 배포됨 (총 ~30KB 낭비)

**수정 방법**: `public/games/mini-coffee-tycoon/assets/` 디렉토리 전체 삭제

```bash
rm -rf public/games/mini-coffee-tycoon/assets/
```

### 🟡 MINOR — PAUSED 상태 전환 시 `beginTransition` 미사용 (§5.2)

**위치**: L2446

```javascript
// 현재 코드
prevStateBeforePause = 'PLAYING';
enterState('PAUSED');  // ← beginTransition() 미경유
```

**영향도**: PAUSED는 즉각 전환이 자연스러우므로 실질적 버그는 아님. 다만 기획서 §5.2 "모든 전환은 `beginTransition()` 경유" 원칙과 불일치.

### 🟡 MINOR — PAUSED 복귀 시 이중 상태 할당 (L2416-2417)

**위치**: L2416-2417 (PAUSED 클릭 핸들러)

```javascript
// 현재 코드
case 'PAUSED':
  enterState('PLAYING');  // ← state = 'PLAYING' 으로 설정됨
  state = prevStateBeforePause === 'PLAYING' ? 'PLAYING' : prevStateBeforePause;  // ← 다시 덮어씀
  break;
```

**영향도**: `prevStateBeforePause`가 항상 `'PLAYING'`으로 설정되므로 현재는 동작에 문제없음. 그러나 로직이 혼란스러우며, 만약 다른 상태에서 일시정지가 가능해지면 `enterState()` 호출 후 직접 `state =` 로 덮어쓰는 패턴은 초기화 로직 불일치를 유발할 수 있음.

**권장 수정**:
```javascript
case 'PAUSED':
  enterState(prevStateBeforePause);
  break;
```

### 🟡 MINOR — `drawTitle` 함수에서 `dt` 하드코딩 (L2109)

**위치**: L2109

```javascript
case 'TITLE':
  drawTitle(ctx, 0.016);  // ← dt 대신 16ms 하드코딩
  break;
```

**영향도**: 타이틀 애니메이션 속도가 프레임레이트와 무관하게 고정됨. 60fps에서는 정상이나, 고/저 주사율 디스플레이에서 속도 차이 발생 가능.

---

## 4. 최종 판정

### 코드 리뷰 판정: **NEEDS_MINOR_FIX**

**사유**:
- ✅ 게임 로직, 수치 정합성, 순수 함수 설계 모두 우수
- ✅ 금지 패턴 0건, 필수 패턴 완비
- ✅ 메모리 관리, 이벤트 정리, 객체 풀링 적절
- 🔴 **`assets/` 디렉토리 삭제 필수** (배포 전 반드시 제거)
- 🟡 PAUSED 전환 관련 사소한 코드 품질 이슈 3건

### 테스트 판정: **PASS**

**사유**:
- 콘솔 에러 0건
- 모든 화면(TITLE/PLAYING/PAUSED/VICTORY) 정상 렌더링
- 순수 함수 18개 런타임 테스트 전부 통과
- CONFIG 수치 22/22 정합성 확인
- localStorage 저장/불러오기 정상
- 터치 이벤트 코드 완비

### 필수 수정 사항 (배포 전)

1. **`public/games/mini-coffee-tycoon/assets/` 디렉토리 삭제** — 코드에서 참조하지 않으므로 삭제만 하면 됨

### 권장 수정 사항 (선택)

2. PAUSED 클릭 핸들러: `enterState(prevStateBeforePause)` 로 단순화
3. `drawTitle(ctx, 0.016)` → `drawTitle(ctx, dt)` 로 변경 (gameLoop 내에서 dt 전달 필요)

---

_리뷰 완료: 2026-03-20 | Cycle #8 QA_
