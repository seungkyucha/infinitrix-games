# Cycle 14 — 프루츠 머지 (Fruits Merge) 코드 리뷰 & 브라우저 테스트

_게임 ID: `fruits-merge` | 리뷰 일자: 2026-03-21_

---

## 1. 코드 리뷰 (정적 분석)

### 체크리스트

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 기능 완성도 | ⚠️ PARTIAL | 코드 자체는 기획서 기능 대부분 구현, 단 **치명적 초기화 버그로 게임 실행 불가** |
| 2 | 게임 루프 | ✅ PASS | `requestAnimationFrame` 사용, dt 캡 0.033초, 서브스텝 물리 |
| 3 | 메모리 | ✅ PASS | 파티클·팝업 역순 splice 제거, 이벤트 리스너는 한 번만 등록 |
| 4 | 충돌 감지 | ✅ PASS | 원-원 충돌 + 분리 벡터 + 탄성 충돌 응답, 벽 충돌 정확 |
| 5 | 모바일 | ✅ PASS | touchstart/touchmove/touchend 구현, `{ passive: false }`, canvas 리사이즈 |
| 6 | 게임 상태 | ✅ PASS | TITLE → PLAYING ↔ PAUSED → GAMEOVER 흐름 완전, 상태×시스템 매트릭스 준수 |
| 7 | 점수/최고점 | ✅ PASS | `localStorage` try-catch 래핑, 키 `"fruits-merge-best"`, 판정→저장 순서 준수 |
| 8 | 보안 | ✅ PASS | eval() 없음, alert/confirm/prompt 없음, XSS 위험 없음 |
| 9 | 성능 | ✅ PASS | 매 프레임 DOM 접근 없음, Canvas API만 사용, setTimeout/setInterval 미사용 |
| 10 | 에셋 | ✅ PASS | 외부 에셋 0개, assets/ 디렉토리 미생성, 100% Canvas 코드 드로잉 |
| 11 | DPR 대응 | ✅ PASS | `devicePixelRatio` 사용, CSS 크기와 캔버스 해상도 분리 |
| 12 | iframe 호환 | ✅ PASS | `sandbox="allow-scripts allow-same-origin"` 제한 사항 모두 준수 |

### 🚨 치명적 버그: 스크립트 실행 순서 오류 (CRITICAL)

**위치**: `index.html` 라인 1081~1152 (canvas 이벤트 리스너 등록)

**원인**:
```
라인 67:   let canvas, ctx;           // canvas = undefined
라인 1081: canvas.addEventListener('mousemove', ...)  // ❌ TypeError!
  ...
라인 1166: window.addEventListener('resize', resizeCanvas);  // ← 실행 안 됨
라인 1167: window.addEventListener('load', init);            // ← 실행 안 됨
```

- `canvas` 변수는 `let`으로 선언만 되고, 실제 DOM 요소 할당은 `init()` 함수 내부(라인 1157)에서 수행
- 그런데 `init()`은 `window.addEventListener('load', init)`(라인 1167)으로 등록되어야 하는데, 그 **이전**인 라인 1081에서 `canvas.addEventListener(...)`가 실행됨
- 이 시점에서 `canvas`는 `undefined` → **TypeError: Cannot read properties of undefined (reading 'addEventListener')** 발생
- 에러로 인해 라인 1081 이후의 코드가 모두 실행되지 않음 → `init()` 미등록 → **게임 로드 실패**

**수정 방법** (택 1):
1. canvas 이벤트 리스너 등록을 `init()` 함수 내부로 이동 (권장)
2. `let canvas = document.getElementById('gameCanvas');`로 선언 시점에 즉시 할당
3. 라인 67에서 `let canvas = document.getElementById('gameCanvas');`로 변경

### 기타 소소한 사항

| # | 내용 | 심각도 |
|---|------|--------|
| M1 | 일시정지 버튼 크기 48×36px — 터치 타겟 높이가 44px 미달 (기획서 §4는 48×48 요구) | LOW |
| M2 | `roundRect`은 비교적 최신 Canvas API — 구형 브라우저에서 미지원 가능성 (대상 브라우저가 모던이면 무관) | LOW |
| M3 | PAUSED 상태에서 `Date.now()` 사용(라인 670) — dt 기반이 아닌 절대 시간 사용, 일관성 약간 떨어짐 | TRIVIAL |

---

## 2. 에셋 로딩 확인

| 항목 | 결과 | 비고 |
|------|------|------|
| `assets/` 디렉토리 | ✅ 미존재 | 기획서 F2 준수 — assets 디렉토리 생성 금지 |
| `assets/manifest.json` | ✅ 미존재 | 외부 리소스 0개 |
| SVG 파일 | ✅ 미존재 | 기획서 F10 준수 |
| 외부 리소스 참조 | ✅ 없음 | `<link>`, `<img>`, `fetch()` 등 없음 |
| 파일 구조 | ✅ 단일 파일 | `public/games/fruits-merge/index.html` 1개만 존재 |

---

## 3. 브라우저 테스트 (Puppeteer MCP)

### 테스트 환경
- Chromium (Puppeteer headless)
- 뷰포트: 400×700

### 테스트 결과

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| T1 | 페이지 로드 | ❌ **FAIL** | HTML 파싱 성공, JS 실행 중 TypeError로 게임 초기화 실패 |
| T2 | 콘솔 에러 없음 | ❌ **FAIL** | `TypeError: Cannot read properties of undefined (reading 'addEventListener')` (라인 1081) |
| T3 | 캔버스 렌더링 | ❌ **FAIL** | Canvas 기본 크기(300×150) 유지, 어떤 것도 렌더링되지 않음 |
| T4 | 시작 화면 표시 | ❌ **FAIL** | 타이틀 화면 미표시 (init 미호출) |
| T5 | 터치 이벤트 코드 존재 | ✅ PASS | touchstart/touchmove/touchend 코드 존재 (단, 등록은 실패) |
| T6 | 점수 시스템 | ✅ PASS (코드) | 코드상 정상 구현, 런타임 미테스트 (게임 미로드) |
| T7 | localStorage 최고점 | ✅ PASS (코드) | try-catch 래핑, 키 정상 |
| T8 | 게임오버/재시작 | ✅ PASS (코드) | 상태 전환 로직 정상 구현 |

### 수동 init() 호출 후 검증
- `init()`을 수동 호출하면 Canvas가 400×700으로 리사이즈되고, 타이틀 화면이 정상 렌더링됨
- 과일 11종 애니메이션, "프루츠 머지" 타이틀, "TAP / SPACE 시작" 깜빡임, 배경 별 — 모두 정상 표시
- **결론: 초기화 순서만 수정하면 게임 자체는 정상 작동할 것으로 판단**

---

## 4. CONFIG 수치 정합성 (기획서 §11.2)

| 상수 | 기획서 값 | 코드 값 | 일치 |
|------|----------|---------|------|
| GRAVITY | 980 | 980 | ✅ |
| RESTITUTION | 0.3 | 0.3 | ✅ |
| FRICTION | 0.1 | 0.1 | ✅ |
| DAMPING | 0.98 | 0.98 | ✅ |
| MAX_VELOCITY | 800 | 800 | ✅ |
| SUBSTEPS | 3 | 3 | ✅ |
| WALL_RESTITUTION | 0.2 | 0.2 | ✅ |
| DROP_COOLDOWN | 500ms | 500 | ✅ |
| DEADLINE_GRACE | 3000ms | 3000 | ✅ |
| MOVE_SPEED | 300 | 300 | ✅ |

### 과일 데이터 정합성

| 단계 | 기획서 반지름 | 코드 반지름 | 기획서 색상 | 코드 색상 | 기획서 점수 | 코드 점수 |
|------|-------------|------------|------------|----------|------------|----------|
| 0 체리 | 12 | 12 | #E74C3C | #E74C3C | 1 | 1 | ✅ |
| 1 딸기 | 16 | 16 | #FF6B6B | #FF6B6B | 3 | 3 | ✅ |
| 2 포도 | 22 | 22 | #9B59B6 | #9B59B6 | 6 | 6 | ✅ |
| 3 귤 | 28 | 28 | #F39C12 | #F39C12 | 10 | 10 | ✅ |
| 4 오렌지 | 34 | 34 | #E67E22 | #E67E22 | 15 | 15 | ✅ |
| 5 사과 | 40 | 40 | #E74C3C | #E74C3C | 21 | 21 | ✅ |
| 6 배 | 48 | 48 | #A8D860 | #A8D860 | 28 | 28 | ✅ |
| 7 복숭아 | 56 | 56 | #FDCB6E | #FDCB6E | 36 | 36 | ✅ |
| 8 파인애플 | 64 | 64 | #F9CA24 | #F9CA24 | 45 | 45 | ✅ |
| 9 멜론 | 72 | 72 | #2ECC71 | #2ECC71 | 55 | 55 | ✅ |
| 10 수박 | 82 | 82 | #27AE60 | #27AE60 | 66 | 66 | ✅ |

---

## 5. 최종 판정

### 코드 리뷰 판정: **NEEDS_MAJOR_FIX**

### 테스트 판정: **FAIL**

### 종합 판정: **NEEDS_MAJOR_FIX** 🔴

---

## 6. 필수 수정 사항

### [CRITICAL] 스크립트 실행 순서 오류 — 게임 로드 불가

**문제**: `canvas` 이벤트 리스너가 `init()` 호출 전에 등록되어 TypeError 발생 → 게임 미시작

**수정**: canvas 이벤트 리스너(mousemove, mousedown, touchstart, touchmove, touchend)를 `init()` 함수 내부로 이동

```javascript
// === 수정 전 (라인 1081~1167) ===
// canvas.addEventListener('mousemove', ...);  // canvas가 undefined!
// ...
// window.addEventListener('load', init);

// === 수정 후 ===
function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  initBgStars();
  bestScore = getBestScore();
  lastTimestamp = 0;

  // ▼ 이벤트 리스너를 여기로 이동
  canvas.addEventListener('mousemove', function(e) { ... });
  canvas.addEventListener('mousedown', function(e) { ... });
  canvas.addEventListener('touchstart', function(e) { ... }, { passive: false });
  canvas.addEventListener('touchmove', function(e) { ... }, { passive: false });
  canvas.addEventListener('touchend', function(e) { ... }, { passive: false });

  requestAnimationFrame(gameLoop);
}
```

### [LOW] 일시정지 버튼 터치 타겟

**문제**: 버튼 크기 48×36px, 기획서 요구 최소 48×48px
**수정**: `bh`를 36 → 48로 변경

---

_이 리뷰는 Cycle 14 코더에게 반환됩니다. CRITICAL 수정 완료 후 재리뷰 요청 바랍니다._
