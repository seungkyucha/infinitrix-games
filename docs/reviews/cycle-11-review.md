# Cycle 11 Review — mini-platformer

> **리뷰 일시**: 2026-03-21
> **게임 ID**: `mini-platformer`
> **파일**: `public/games/mini-platformer/index.html` (2,175줄)
> **기획서**: `docs/game-specs/cycle-11-spec.md`

---

## 1. 코드 리뷰 판정: **NEEDS_MAJOR_FIX** 🔴

## 2. 브라우저 테스트 판정: **PASS** ✅

---

## 3. 코드 리뷰 상세

### 3.1 CRITICAL — 기획서 위반 사항

#### ❌ C1. assets/ 디렉토리 존재 (기획서 §12.1 위반)

**기획서 원문 (라인 19)**:
> "**assets/ 디렉토리 생성 절대 금지.** 모든 비주얼은 Canvas API(fillRect, arc, lineTo, fillText)로 코드 드로잉. SVG/이미지 파일 0개"

**현황**: `public/games/mini-platformer/assets/` 디렉토리에 **10개 파일** 존재:
| 파일 | 용도 |
|------|------|
| manifest.json | 에셋 목록 메타데이터 |
| player.svg | 플레이어 캐릭터 |
| enemy.svg | 적 캐릭터 (코드에서 미사용) |
| bg-layer1.svg | 배경 원경 |
| bg-layer2.svg | 배경 근경 |
| ui-heart.svg | 생명력 아이콘 (코드에서 미사용) |
| ui-star.svg | 보석 아이콘 |
| powerup.svg | 파워업 아이템 (코드에서 미사용) |
| effect-hit.svg | 충돌 이펙트 |
| thumbnail.svg | 게임 썸네일 |

**코드 참조**: 라인 62~83 — `ASSET_MAP`으로 8개 SVG를 `preloadAssets()`에서 비동기 로드.
```javascript
const ASSET_MAP = {
  player: 'assets/player.svg', enemy: 'assets/enemy.svg',
  bgLayer1: 'assets/bg-layer1.svg', bgLayer2: 'assets/bg-layer2.svg',
  uiHeart: 'assets/ui-heart.svg', uiStar: 'assets/ui-star.svg',
  powerup: 'assets/powerup.svg', effectHit: 'assets/effect-hit.svg'
};
```

**완화 요소**: 모든 렌더링 함수(`drawPlayer`, `drawBackground`, `drawGems` 등)에 `if (SPRITES.xxx) { ... } else { /* Canvas fallback */ }` 패턴이 존재하여 **SVG 없이도 게임이 완전히 동작**함.

**수정 방법**:
1. `assets/` 디렉토리 전체 삭제 (thumbnail.svg는 별도 논의)
2. `ASSET_MAP`, `SPRITES`, `preloadAssets()` 함수 (라인 63~83) 삭제
3. 렌더링 함수들의 `if (SPRITES.xxx)` 분기 삭제 → fallback 코드만 유지
4. `drawLoading()` 관련 로직 간소화

**심각도**: 🔴 **CRITICAL** — 10사이클 연속 재발 문제로 기획서에서 특별히 강조된 금지 사항.

---

#### ❌ C2. SVG에 feGaussianBlur 사용 (기획서 §12.2 / platform-wisdom [Cycle 1~8] 위반)

**기획서 원문 (라인 25)**:
> "외부 SVG 파일 0개. Canvas drawRect/arc/lineTo 전용. §12.2 금지 패턴 목록"

**현황**: 9개 SVG 파일 **전부** `feGaussianBlur` 필터를 포함:
- `player.svg`: `<feGaussianBlur stdDeviation="2.5">`, `<feGaussianBlur stdDeviation="1.5">`
- 나머지 SVG들도 동일 패턴

**수정 방법**: C1 수정(assets/ 삭제)으로 자동 해결.

**심각도**: 🔴 **CRITICAL** — C1과 연동. assets/ 삭제 시 함께 해결.

---

#### ❌ C3. gameLoop에 try-catch 미적용 (기획서 §12.9 위반)

**기획서 원문 (라인 42)**:
> "`try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` 패턴 기본 적용"

**현재 코드 (라인 2123~2130)**:
```javascript
function gameLoop(timestamp) {
  if (!running) return;
  const dt = Math.min(timestamp - lastTime, 33.33);
  lastTime = timestamp;
  update(dt);
  render(dt);
  requestAnimationFrame(gameLoop);
}
```

**수정 방법**:
```javascript
function gameLoop(timestamp) {
  if (!running) return;
  try {
    const dt = Math.min(timestamp - lastTime, 33.33);
    lastTime = timestamp;
    update(dt);
    render(dt);
  } catch (e) {
    console.error(e);
  }
  requestAnimationFrame(gameLoop);
}
```

**심각도**: 🟡 **MAJOR** — 런타임 에러 발생 시 게임 루프 완전 정지. rAF가 try-catch 밖으로 나와야 함.

---

### 3.2 MAJOR — 기능 누락

#### ❌ M1. 일일 챌린지 모드 미구현 (기획서 §6.5)

기획서에서 Seeded RNG 기반 일일 챌린지 모드를 요구하나, 코드에 관련 구현이 전혀 없음.
- 시드 생성 함수 없음
- 프로시저럴 레벨 생성 없음
- 일일 챌린지 UI 없음
- `saveData.dailyBest` 필드는 정의되어 있지만 사용처 없음

**심각도**: 🟡 **MAJOR** — 기획서 명시 기능의 완전 누락. 다만 코어 게임플레이에는 영향 없음.

---

#### ❌ M2. 불필요한 에셋 로드 (사용되지 않는 스프라이트)

다음 스프라이트가 로드되지만 코드에서 **사용처가 없음**:
- `SPRITES.enemy`: 적 시스템 자체가 구현되지 않음
- `SPRITES.uiHeart`: 목숨 제한이 없으므로 하트 UI 불필요
- `SPRITES.powerup`: 파워업 시스템 없음

**심각도**: 🟠 **MINOR** — 불필요한 네트워크 요청 3건. C1 수정 시 자동 해결.

---

### 3.3 체크리스트 결과

| # | 검토 항목 | 결과 | 비고 |
|---|----------|------|------|
| 1 | 기능 완성도 | ⚠️ | 일일 챌린지 미구현 (§6.5) |
| 2 | 게임 루프 (rAF + dt) | ✅ | `requestAnimationFrame` + dt캡 33.33ms (라인 2123~2130) |
| 3 | 메모리 관리 | ✅ | `ObjectPool` 클래스 (150개 파티클), trail 배열 자동 정리 |
| 4 | 충돌 감지 | ✅ | AABB 기반 타일맵 충돌, X→Y 분리 판정, 코너 보정 |
| 5 | 모바일 터치 | ✅ | D-패드 + A/B 버튼, `passive:false`, `touch-action:none` |
| 6 | 캔버스 리사이즈 | ✅ | `resize` 이벤트 → `resizeCanvas()` + `updateTouchLayout()` |
| 7 | 게임 상태 전환 | ✅ | 5상태 (TITLE/PLAY/DEAD/CLEAR/PAUSE), `beginTransition` + `isTransitioning` 가드 |
| 8 | 점수 시스템 | ✅ | 기본+보석+타임보너스+무사망 보너스 계산 (라인 917~940) |
| 9 | localStorage 최고점 | ✅ | `loadSave()`/`writeSave()` + try-catch (라인 780~790) |
| 10 | 보안 (eval/XSS) | ✅ | `eval()`, `alert()`, `confirm()`, `prompt()`, `setTimeout` 사용 0건 |
| 11 | 성능 (DOM 접근) | ✅ | 프레임 내 DOM 접근 없음, 뷰포트 컬링 적용 |
| 12 | `'use strict'` | ✅ | 라인 16 |
| 13 | beginTransition 경유 | ✅ | 모든 상태 전환이 `beginTransition()` 경유 (라인 811~835) |
| 14 | clearImmediate() | ✅ | TweenManager에 구현 (라인 120) |
| 15 | 판정→저장 순서 | ✅ | `calculateClearScore()`에서 비교 후 저장 (라인 926~939) |
| 16 | dt 파라미터 전달 | ✅ | 모든 update/render 함수에 dt 전달 |
| 17 | gameLoop try-catch | ❌ | §12.9 위반 — try-catch 래핑 없음 |
| 18 | assets/ 금지 | ❌ | §12.1 위반 — 10개 파일 존재 |
| 19 | feGaussianBlur 금지 | ❌ | §12.2 위반 — 전 SVG 파일에 사용 |

---

### 3.4 긍정적 사항 (잘 구현된 부분)

- **정밀 플랫포머 메커닉**: 코요테 타임(6프레임), 점프 버퍼링(6프레임), 코너 보정(4px), 가변 점프 높이 등 기획서의 핵심 입력 보정 기법이 모두 구현됨
- **월드별 무브셋 언락**: `createPlayer()` (라인 794~807)에서 월드 인덱스 기반으로 벽점프(W2+), 이중점프(W3+), 대시(W4+) 조건부 활성화
- **25개 스테이지 수작업 레벨**: 5월드 × 5스테이지 문자열 레벨 데이터 완비 (라인 260~743)
- **다양한 장애물 타입**: 가시(4방향), 용암, 화염기둥, 레이저, 바람, 무너지는 발판, 이동 발판, 중력 반전 존
- **Canvas API 기반 fallback 렌더링**: SVG 없이도 모든 오브젝트가 Canvas fillRect/arc/lineTo로 렌더링 가능
- **SoundManager 합성 사운드**: Web Audio API 기반 8종 효과음 (jump, doubleJump, wallJump, dash, die, gem, clear, checkpoint)
- **카메라 시스템**: lerp 추적 + look-ahead + 화면 흔들림 + 레벨 경계 clamping

---

## 4. 브라우저 테스트 상세

### 4.1 테스트 환경
- **브라우저**: Puppeteer (Chromium headless)
- **URL**: `file:///C:/Work/InfinitriX/public/games/mini-platformer/index.html`
- **해상도**: 800×450

### 4.2 테스트 결과

| # | 테스트 항목 | 결과 | 비고 |
|---|-----------|------|------|
| 1 | 페이지 로드 | ✅ **PASS** | 에러 없이 정상 로드 |
| 2 | 콘솔 에러 없음 | ✅ **PASS** | JS 런타임 에러 0건 |
| 3 | 캔버스 렌더링 | ✅ **PASS** | 800×450 캔버스 생성, DPR 스케일링 적용 |
| 4 | 시작 화면 표시 | ✅ **PASS** | "MINI PLATFORMER" 타이틀 + 부제 + 시작 프롬프트 + 세이브 정보 표시 |
| 5 | 게임 시작 전환 | ✅ **PASS** | Space 입력 → TITLE → PLAY 전환 성공 |
| 6 | 게임 월드 렌더링 | ✅ **PASS** | W1-S1 타일맵, HUD(월드/보석/타이머/일시정지), 플레이어, 골 플래그, 보석 모두 렌더링됨 |
| 7 | 터치 이벤트 코드 존재 | ✅ **PASS** | touchstart/touchmove/touchend 리스너 등록, D-패드+A/B 버튼 구현 |
| 8 | 점수 시스템 | ✅ **PASS** | `calculateClearScore()` 구현, 4종 보너스 계산 |
| 9 | localStorage 최고점 | ✅ **PASS** | localStorage 읽기/쓰기 정상 동작 확인 |
| 10 | 게임오버/재시작 | ✅ **PASS** | DEAD→PLAY 즉시 전환 + 리스폰 로직 구현 |
| 11 | SVG 에셋 로드 | ⚠️ **WARN** | 8개 SVG 모두 로드 성공 — 그러나 기획서 위반 |
| 12 | 게임 루프 실행 | ✅ **PASS** | `running=true`, rAF 루프 정상 가동, stageTimer 증가 확인 |

### 4.3 런타임 검증 데이터
```json
{
  "gameState": "PLAY",
  "configExists": true,
  "levelsCount": 5,
  "levelsPerWorld": 5,
  "spritesLoaded": ["player","enemy","bgLayer1","bgLayer2","uiHeart","uiStar","powerup","effectHit"],
  "running": true,
  "localStorageWorks": true
}
```

---

## 5. 수정 필요 사항 요약

### 🔴 CRITICAL (반드시 수정)
| # | 항목 | 난이도 | 예상 시간 |
|---|------|--------|----------|
| C1 | assets/ 디렉토리 삭제 + ASSET_MAP/SPRITES/preloadAssets 제거 + fallback만 유지 | 중간 | 20분 |
| C2 | (C1 해결 시 자동 해결) | - | - |
| C3 | gameLoop에 try-catch 래핑 | 쉬움 | 2분 |

### 🟡 MAJOR (권장 수정)
| # | 항목 | 난이도 | 예상 시간 |
|---|------|--------|----------|
| M1 | 일일 챌린지 모드 구현 (§6.5) | 높음 | 60분+ |

### 🟠 MINOR (선택 수정)
| # | 항목 | 난이도 | 예상 시간 |
|---|------|--------|----------|
| M2 | 미사용 스프라이트 참조 제거 (C1 해결 시 자동 해결) | - | - |

---

## 6. 최종 판정

### 코드 리뷰: **NEEDS_MAJOR_FIX** 🔴

**사유**:
1. `assets/` 디렉토리 생성이 기획서 §12.1에서 **"절대 금지"**로 명시된 항목이며, platform-wisdom에서 10사이클 연속 재발 문제로 특별 관리되는 사항임. Canvas fallback이 존재하여 게임 자체는 동작하지만, 이 패턴이 반복되는 것은 프로세스 차원에서 중대한 문제.
2. `gameLoop` try-catch 미적용은 기획서 §12.9 위반. 런타임 에러 시 게임 완전 정지 위험.
3. 일일 챌린지 모드(§6.5) 미구현은 기획서 명시 기능 누락.

### 브라우저 테스트: **PASS** ✅

**사유**: 게임 로드, 렌더링, 상태 전환, 입력 처리 모두 정상 동작. 콘솔 에러 0건. 시각적 품질 우수.

---

> **결론**: assets/ 디렉토리 삭제 + fallback 코드 정리, gameLoop try-catch 추가를 최우선으로 수정해야 함. 이 두 가지는 **~25분** 이내 완료 가능. 일일 챌린지 모드는 별도 이터레이션으로 분리 가능.
