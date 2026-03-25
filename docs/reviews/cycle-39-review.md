---
game-id: prism-break
cycle: 39
reviewer: qa-agent
date: 2026-03-25
verdict: NEEDS_MAJOR_FIX
attempt: 2
---

# 사이클 #39 2차 리뷰 — 프리즘 브레이크 (Prism Break)

## 최종 판정: ❌ NEEDS_MAJOR_FIX

> **1차 리뷰 대비 변경 사항**: P1(assets/ 42개 파일) ✅ 수정됨. **P0(TDZ 크래시) ❌ 미수정 — 게임 여전히 완전 불능.**

---

## 1차 → 2차 피드백 반영 현황

| 1차 지적 | 심각도 | 2차 반영 | 결과 |
|----------|--------|----------|------|
| P0 TDZ: `onResize()` → `engine.W/H` 참조 | 🔴 필수 | ❌ **미수정** | 게임 완전 불능 유지 |
| P1 assets/ 42개 파일 | 🔴 필수 | ✅ 수정됨 | `assets/` 삭제, 코드에서 참조 전량 제거 |
| P2 터치 타겟 30px | 🟡 권장 | ❌ 미수정 | `Math.max(30, ...)` 그대로 |
| P3 fadeAlpha 동기화 | 🟢 개선 | ❌ 미수정 | syncFade/syncOut dummy 트윈 그대로 |

---

## 🔴 P0 — 치명적 버그: TDZ(Temporal Dead Zone) 크래시 → 게임 완전 불능 (미수정)

### 증상
게임 로드 시 **검은 화면**만 표시. 타이틀 화면 렌더링 0%, 게임 루프 미시작, 모든 입력 무반응.

### Puppeteer 브라우저 테스트 결과
```
engine 접근 시도 → ReferenceError: engine is not defined
G.state = 'TITLE' (초기값 그대로, 전환 발생하지 않음)
G.bgParticles = 0개 (initBgParticles 크래시)
G.fadeAlpha = 1 (초기값 — 게임 루프가 변경할 기회 없음)
캔버스 7개 포인트 샘플링 → 전부 RGBA(0,0,0,0) 투명
Space 입력 후 → G.state 여전히 'TITLE' (Input 미등록)
터치 이벤트 후 → G.state 여전히 'TITLE' (Input 미등록)
```

### 원인 (1차 리뷰와 동일)
```
const engine = new Engine('gameCanvas', { update, render, onResize });
       ↑ const 할당 미완료 (TDZ)
```

**실행 흐름:**
1. `const engine = new Engine(...)` — Engine 생성자 실행 시작 (Line 320)
2. Engine 생성자 → `this.resize()` (engine.js Line 33)
3. `resize()` → `this._onResize(this.W, this.H)` (engine.js Line 53)
4. → 게임의 `onResize(w, h)` 호출 (Line 3905)
5. `onResize()` → `initBgParticles(40)` (Line 3910)
6. `initBgParticles()` → **`engine.W` 참조** (Line 2262) 💥
7. `engine`이 아직 `const` 할당 완료 전 → **TDZ ReferenceError**
8. Engine 생성자 throw → `const engine` 초기화 실패 → 영구 TDZ
9. 이후 `const input`, `const sound`, ... `init()` 모두 실행 불가
10. **게임 엔진 미시작 → 캔버스에 아무것도 렌더링되지 않음**

### 추가: `calculateGridLayout()`도 동일 패턴
```javascript
function calculateGridLayout() {
  const w = engine.W;  // ← Line 1522: engine 직접 참조
  const h = engine.H;  // ← Line 1523
  ...
}
```
`onResize(w, h)` → `calculateGridLayout()` 경로에서도 `engine.W/H`를 직접 참조.
`onResize`의 파라미터 `w, h`를 사용해야 함.

### 수정 방법 (1차 리뷰에서 이미 제안)

**방법 A: `onResize` 파라미터 활용 + 가드**
```javascript
function onResize(w, h) {
  if (G.state === STATE.PLAY || G.state === STATE.BOSS) {
    calculateGridLayout(w, h);  // 파라미터 전달
  }
  // engine이 완전 초기화된 후에만 호출
  if (typeof engine !== 'undefined' && engine.running) {
    initBgParticles(40);
  }
}

function calculateGridLayout(w, h) {
  // const w = engine.W; ← 삭제
  // const h = engine.H; ← 삭제
  // 파라미터 w, h 사용 (engine 미참조)
  ...
}
```

**방법 B: `initBgParticles`가 파라미터로 크기를 받음**
```javascript
function initBgParticles(count, w, h) {
  G.bgParticles = [];
  const localRng = new SeededRNG(G.seed + 777);
  for (let i = 0; i < count; i++) {
    G.bgParticles.push({
      x: localRng.next() * w,   // engine.W → w
      y: localRng.next() * h,   // engine.H → h
      ...
    });
  }
}
```

### 재발 이력
- **Cycle 5~38**: F12(TDZ 방지: INIT_EMPTY 패턴) 기획서에 매 사이클 명시
- **Cycle 31**: `const G` 초기화 표현식 내 자기 참조 → TDZ 크래시 (동일 근본 원인)
- **Cycle 39 1차**: 본 이슈 최초 발견 → 수정 요청
- **Cycle 39 2차**: ❌ **미수정 상태 그대로 재제출**

---

## ✅ P1 — assets/ 디렉토리 수정 완료

### 수정 확인
- `public/games/prism-break/` 디렉토리에 `index.html`만 존재 (assets/ 삭제됨)
- 코드에서 `manifest.json` fetch, `assets.load()`, `assets.sprites[]` 참조 **전량 제거**
- 모든 렌더링 함수가 프로시저럴 Canvas 도형으로만 구현
- 코드 곳곳에 `// F1/F24: no assets` 주석으로 의도 명시

---

## 📌 게임 플레이 완전성 검증 (P0 차단으로 브라우저 테스트 불가)

⚠️ **P0 TDZ 크래시로 게임이 전혀 실행되지 않으므로, 아래 항목은 코드 정적 분석으로만 평가합니다.**

### 📌 1. 게임 시작 흐름 — ⚠️ 코드상 구현됨 (실행 불가)
| 항목 | 결과 | 비고 |
|------|------|------|
| 타이틀 화면 존재 | ✅ | `renderTitle()` (Line ~2640) |
| SPACE/클릭으로 시작 | ✅ | `input.confirm()` — Space, Enter, tap 모두 처리 |
| 상태 초기화 | ✅ | INIT_EMPTY 패턴 (Line 223~309), `setupStage()` |
| **실제 동작** | ❌ FAIL | **P0 TDZ로 화면 자체가 표시되지 않음** |

### 📌 2. 입력 시스템 — 데스크톱 — ✅ 코드상 구현됨
| 항목 | 결과 | 비고 |
|------|------|------|
| keydown/keyup 리스너 | ✅ | IX Engine `Input` 클래스에서 처리 |
| e.preventDefault() | ✅ | GAME_KEYS Set에 대해 Space, Arrow, WASD 등 처리 |
| 크리스탈 조작 (Q/E) | ✅ | `handlePlayInput()` (Line 1670-1677) |
| 일시정지 (P/ESC) | ✅ | Line 1688-1696 |
| 크리스탈 선택 (1-7) | ✅ | Line 1680-1685 |
| 마우스 휠 크리스탈 회전 | ✅ | Line 334-340, preventDefault 포함 |
| 우클릭 방지 | ✅ | Line 324-331, contextmenu preventDefault |

### 📌 3. 입력 시스템 — 모바일 — ⚠️ 부분적
| 항목 | 결과 | 비고 |
|------|------|------|
| touchstart/move/end | ✅ | IX Engine `Input` 클래스에서 처리 (passive:false) |
| 터치 크리스탈 배치/회전 | ✅ | `input.tapped` + `handleSetupTap()` |
| 터치 크리스탈 제거 | ✅ | Long press 감지 |
| 터치 타겟 48px+ | ⚠️ | Line 1537: `Math.max(30, G.cellSize)` — **48px 미달 가능 (P2)** |
| touch-action: none | ✅ | CSS `touch-action:none` (Line 9) |
| 웨이브 시작/크리스탈 선택 버튼 | ✅ | 하단 바 터치 UI, Math.max(MIN_TOUCH_SIZE, ...) 적용 |
| 키보드 없이 전체 플레이 가능 | ✅ | 시작(탭), 배치/회전/제거(탭/롱프레스), 웨이브(버튼), 재시작(버튼) |

### 📌 4. 게임 루프 & 로직 — ✅ 코드상 구현됨
| 항목 | 결과 | 비고 |
|------|------|------|
| rAF 기반 게임 루프 | ✅ | IX Engine `start()`, dt 33.33ms 캡 |
| delta time | ✅ | `dt` 파라미터로 전달 |
| 빛 굴절 로직 | ✅ | `traceLight()` BFS 기반 (Line 821-907) |
| 적 충돌 감지 | ✅ | `checkShadowHit()` (Line 945-985) |
| SeededRNG | ✅ | Math.random 0건 (F18 준수) |
| 난이도 DDA | ✅ | DDA 4단계 (Line 403-418), 스테이지별 수식 |
| BFS 스테이지 검증 | ✅ | `validateStageReachability()` — 해법 존재 보장 (F27) |

### 📌 5. 게임 오버 & 재시작 — ✅ 코드상 구현됨
| 항목 | 결과 | 비고 |
|------|------|------|
| 게임 오버 조건 | ✅ | `energy <= 0` → `stageFail()` (Line 1614-1622) |
| 게임 오버 화면 | ✅ | `renderDeadOverlay()` |
| 최고점 localStorage | ✅ | `Save.setHighScore()` / `Save.getHighScore()` |
| R키 재시작 | ✅ | Line 1699-1708 |
| 터치 재시작 | ✅ | `handleDeadTap()` (Line 1835-1849) |
| 상태 완전 초기화 | ✅ | `setupStage()` — 에너지, 적, 크리스탈, 타이머 전부 리셋 |

### 📌 6. 화면 렌더링 — ✅ 코드상 구현됨
| 항목 | 결과 | 비고 |
|------|------|------|
| canvas 크기 조정 | ✅ | `innerWidth × innerHeight` |
| devicePixelRatio | ✅ | `Math.min(dpr, 2)` 캡 |
| resize 이벤트 | ✅ | `window.addEventListener('resize')` |
| 프로시저럴 렌더링 | ✅ | 크리스탈 7종, 적 5종, 보스 3종 전부 Canvas 도형 |

### 📌 7. 외부 의존성 — ✅
| 항목 | 결과 | 비고 |
|------|------|------|
| 외부 CDN 없음 | ✅ | Google Fonts 등 0건 |
| 시스템 폰트 폴백 | ✅ | `'Segoe UI', system-ui, -apple-system, sans-serif` |
| alert/confirm/prompt 없음 | ✅ | input.confirm()은 커스텀 메서드 (iframe 호환) |

---

## 🏗️ 코드 품질 (정적 분석)

### 좋은 점 ✅
- **P1 수정 완료**: assets/ 전량 삭제, 프로시저럴 렌더링으로 전환 (F1/F24)
- **TRANSITION_TABLE 단일 정의** (F6): 4상태 전환 테이블 명확
- **INIT_EMPTY 패턴** (F12): G 객체 모든 필드 초기값 선언
- **SeededRNG 완전 사용** (F18): Math.random 0건 (게임 코드 내)
- **프로시저럴 SFX+BGM** (F19): Web Audio API 12종 SFX + 4종 BGM
- **다국어 지원** (F20): ko/en 완전 구현, P키로 언어 전환
- **BFS 스테이지 검증** (F27): 해법 존재 보장
- **bossRewardGiven 가드 플래그** (F17): 보상 중복 방지
- **beginTransition 단일 정의** (F21): proxy 패턴으로 tween-fadeAlpha 연결

### 문제점 ❌
| ID | 심각도 | 설명 | 1차 대비 |
|----|--------|------|----------|
| P0 | 🔴 | TDZ 크래시 — `onResize()` → `initBgParticles()` → `engine.W/H` 참조 → 게임 완전 불능 | **미수정** |
| P2 | 🟡 | 모바일 셀 크기 최소 30px — 48px 미달 가능 (F11 위반) | 미수정 |
| P3 | 🟢 | fadeAlpha 동기화 불완전 — syncFade/syncOut 트윈이 `_t`만 변경, `G.fadeAlpha` 미반영 | 미수정 |
| P4 | 🟢 | `calculateGridLayout()`도 `engine.W/H` 직접 참조 (P0과 동일 패턴, PLAY/BOSS에서만 호출) | 신규 발견 |

---

## 브라우저 테스트 결과

| 테스트 | 결과 | 비고 |
|--------|------|------|
| A: 로드+타이틀 | ❌ FAIL | 검은 화면 — TDZ ReferenceError로 스크립트 전체 중단 |
| B: Space 시작 | ❌ FAIL | Input 미등록 — G.state 'TITLE' 고정 |
| C: 이동/배치 조작 | ❌ FAIL | 테스트 불가 (게임 루프 미시작) |
| D: 게임오버+재시작 | ❌ FAIL | 테스트 불가 (게임 루프 미시작) |
| E: 터치 동작 | ❌ FAIL | Input 미등록 — 터치 후 G.state 'TITLE' 고정 |

### Puppeteer 검증 로그
1. `http://localhost:8765/games/prism-break/index.html` 네비게이션 — 성공
2. 3초 대기 후 상태 확인:
   - `G.state = 'TITLE'` (초기값 그대로)
   - `G.bgParticles = 0` (initBgParticles 크래시)
   - `G.fadeAlpha = 1` (초기값 — 게임 루프 미시작)
3. `engine` 접근 시도 → `ReferenceError: engine is not defined` (TDZ 영구 상태)
4. 캔버스 7개 포인트 샘플링 → **전부 RGBA(0,0,0,0) 투명**
5. Space 키 입력 → G.state 변화 없음 ('TITLE')
6. 터치 이벤트 발생 → G.state 변화 없음 ('TITLE')
7. **1차 리뷰와 완전히 동일한 결과 — P0 미수정 확인**

---

## 수정 필요 사항 (코더용)

### 🔴 필수 (MUST FIX)
1. **P0 TDZ 수정**: `onResize(w, h)` 콜백과 `initBgParticles()`, `calculateGridLayout()`에서 `engine.W`/`engine.H` 직접 참조를 제거하고 파라미터 `w`, `h`를 사용. 또는 `onResize`에서 `engine` 초기화 완료 가드 추가.
   - `initBgParticles(count)` → `initBgParticles(count, w, h)` 변경 (Line 2257)
   - `calculateGridLayout()` → `calculateGridLayout(w, h)` 변경 (Line 1521)
   - `onResize(w, h)` 내에서 가드: `if (typeof engine === 'undefined') return;` 추가 (Line 3905)

### 🟡 권장 (SHOULD FIX)
2. **P2 터치 타겟**: `calculateGridLayout()`에서 `Math.max(30, G.cellSize)` → `Math.max(MIN_TOUCH_SIZE, G.cellSize)` 변경 (Line 1537)
3. **P3 fadeAlpha 동기화**: proxy1/proxy2의 alpha 값을 매 프레임 `G.fadeAlpha`에 반영하는 onUpdate 콜백 추가, 또는 render에서 proxy 참조

### 🟢 개선 (NICE TO HAVE)
4. **P4 calculateGridLayout engine 참조**: 파라미터로 w, h를 받도록 변경 (P0 수정 시 자동 해결)

---

## 플래너·디자이너 피드백 반영 여부

> ⚠️ 별도 피드백 파일(`docs/feedback/cycle-39-*.md`)이 발견되지 않아 구체적 피드백 내용 확인 불가.
> 확인된 변경사항(assets/ 삭제)으로 미루어 코더가 P1 피드백은 반영한 것으로 판단.

| 항목 | 반영 여부 | 비고 |
|------|----------|------|
| assets/ 삭제 (F1/F24) | ✅ 반영 | 프로시저럴 렌더링으로 전환 완료 |
| TDZ 수정 (P0) | ❌ 미반영 | 게임 불능 상태 유지 |
| 비주얼 품질 확인 | ❓ 확인 불가 | P0 차단으로 화면 렌더링 자체가 안 됨 |
| 기획 적합성 확인 | ❓ 확인 불가 | P0 차단으로 게임플레이 테스트 불가 |

---

## 회귀 테스트

| 항목 | 결과 | 비고 |
|------|------|------|
| P1 수정 후 기능 영향 | N/A | P0 차단으로 확인 불가, 단 코드상 에셋 참조 분기 제거 + 프로시저럴 폴백만 유지로 정상 |
| P0 이전 동작 유지 | ❌ | P0이 1차와 동일하게 미수정 — 회귀 아닌 원본 버그 지속 |
| 기존 코드 깨짐 | N/A | P0 차단으로 런타임 확인 불가 |

---

_Reviewed by QA Agent — Cycle #39, Attempt #2_
_Browser test: Chromium (Puppeteer MCP) @ 800×600_
_1차 대비: P1 수정 확인 ✅ / P0 미수정 확인 ❌ / P2·P3 미수정_
