---
game-id: mini-golf-adventure
cycle: 6
review-round: 2
title: "미니 골프 어드벤처"
reviewer: Claude (QA)
date: 2026-03-20
verdict: APPROVED
code-review: APPROVED
browser-test: PASS
---

# Cycle 6 — 미니 골프 어드벤처 리뷰 (2회차 재리뷰)

> **재리뷰 목적**: 1회차 리뷰에서 지적된 B1(assets/ 잔존), B2(퍼펙트 반사 보너스 미구현) 수정 여부 검증

---

## 0. 이전 리뷰 지적사항 수정 검증

| # | 이전 지적 | 심각도 | 수정 여부 | 검증 결과 |
|---|-----------|--------|-----------|-----------|
| B1 | `assets/` 디렉토리 잔존 (SVG 8개 + manifest.json) | MINOR | ✅ **수정됨** | `public/games/mini-golf-adventure/` 하위에 `index.html`만 존재. assets/ 디렉토리 완전 삭제 확인 |
| B2 | 퍼펙트 반사 보너스 +200 미구현 | MINOR | ✅ **수정됨** | `bounceCount` 변수 추가(L321), 벽 충돌 시 증가(L499), 샷마다 리셋(L667), 홀인 시 `bounceCount===1 && strokes>1` 조건 체크(L582) |

**결론**: 1회차 지적사항 2건 모두 정상 수정 완료.

---

## 1. 코드 리뷰 (정적 분석)

### 1-1. 기능 완성도 체크리스트

| # | 항목 | 기획서 위치 | 결과 | 비고 |
|---|------|------------|------|------|
| 1 | 드래그 에이밍 + 궤적 프리뷰 (1차 반사까지) | §5.4 | ✅ PASS | `getTrajectoryPoints()` 20점, 1회 반사 시뮬레이션 구현 |
| 2 | 파워 바 (초록→주황→빨강) | §5.5 | ✅ PASS | `drawPowerBar()` ratio 3단계 색상 분기 정확 |
| 3 | 벽 반사 (법선 기반) + 에너지 손실 0.85 | §5.3 | ✅ PASS | `reflectOffWall()` 법선 벡터 반사 + `WALL_BOUNCE=0.85` |
| 4 | 마찰 감속 0.985, 모래 0.95 | §2.3 | ✅ PASS | `FRICTION=0.985`, `SAND_FRICTION=0.95` |
| 5 | 물 구간 +1타 페널티 + 이전 위치 복귀 | §2.3 | ✅ PASS | `checkZoneEffects()` strokes++ + lastStop 복귀 |
| 6 | 포탈 입구→출구 같은 속도 사출 | §2.3 | ✅ PASS | 속도 벡터 유지, cooldown 30프레임 |
| 7 | 움직이는 벽 (sin 기반 왕복) | §6.1 | ✅ PASS | `updateMovingWalls()` sin 기반 offset, axis/range/period |
| 8 | 홀 판정: 반경 20px + speed < 2.0 | §5.7 | ✅ PASS | `HOLE_R_JUDGE=20`, `HOLE_SPEED_THRESHOLD=2.0` |
| 9 | 별 3개 시스템 (Par-1/Par/Par+1) | §6.4 | ✅ PASS | `onHoleIn()` 내 4단계 분기 정확 |
| 10 | 점수 공식: max(0, (par-strokes+3))×100 | §7.1 | ✅ PASS | L575 공식 일치 |
| 11 | 홀인원 보너스 +500 | §7.2 | ✅ PASS | `strokes===1 → +500` |
| 12 | 퍼펙트 반사 보너스 +200 | §7.2 | ✅ PASS | **[B2 수정]** `bounceCount===1 && strokes>1 → +200` (L582) |
| 13 | 스피드 보너스 +150 | §7.2 | ✅ PASS | `performance.now() - levelStartTime < 10초 → +150` (L584) |
| 14 | 10개 레벨 전체 구현 | §11 | ✅ PASS | `LEVELS` 배열 10개, 좌표 기획서 일치 |
| 15 | Web Audio 효과음 9종 | §9.1 | ✅ PASS | sfxHit, sfxWallBounce, sfxSand, sfxWater, sfxHoleIn, sfxHoleInOne, sfxPortal, sfxStar, sfxClick |
| 16 | localStorage 최고 기록 + 레벨별 최소 타수 | §7.4, §7.5 | ✅ PASS | `saveBest()`, `getBest()`, `saveLevelBest()` try-catch |
| 17 | Canvas 모달 (confirm/alert 미사용) | §4.5 | ✅ PASS | `renderModal()` + `showConfirmModal()` Canvas 기반 |
| 18 | DPR 대응 | §4 | ✅ PASS | `dpr = Math.min(devicePixelRatio, 2)`, 내부 해상도 분리 |
| 19 | 상태 × 시스템 매트릭스 준수 | §8 | ✅ PASS | 모든 update 함수에서 `tw.update(dt)` 호출 확인 |
| 20 | enterState() 패턴 적용 | §10.6 | ✅ PASS | 7상태 모두 enterState() 경유 |
| 21 | inputMode 변수 실제 분기 사용 | §3.5 | ✅ PASS | mousedown/mousemove에서 `hasTouch && inputMode==='touch'` 체크 |
| 22 | 파워 게이지 색상 3단계 | §5.5 | ✅ PASS | `ratio<0.33→green, <0.66→orange, else→red` |

**기획서 충실도: 22/22 (100%)**

### 1-2. 아키텍처 체크리스트

| 항목 | 결과 | 비고 |
|------|------|------|
| 게임 루프: requestAnimationFrame | ✅ PASS | `gameLoop()` L1642, dt cap 50ms |
| 메모리: 이벤트 리스너 정리 | ✅ PASS | `listen()` + `registeredListeners[]` + `destroyListeners()` (8개 등록) |
| 메모리: 객체 재사용 | ✅ PASS | `ObjectPool` 파티클 40개 풀 |
| 충돌 감지 정확성 | ✅ PASS | `pointToSegment()` 점-선분 거리, 법선 반사 수학 정확 |
| 게임 상태 전환 흐름 | ✅ PASS | 7상태 FSM + TransitionGuard + levelClearing 가드 |
| 점수/최고점 localStorage | ✅ PASS | 판정 먼저→저장 나중에 패턴 준수 (L731-734) |
| 보안: eval() 미사용 | ✅ PASS | eval, Function 생성자 없음 |
| 성능: 매 프레임 DOM 접근 없음 | ✅ PASS | offscreen canvas 캐시, 순수 Canvas API 렌더링 |
| TweenManager clearImmediate() | ✅ PASS | 레벨 재시작/타이틀 복귀 시 `clearImmediate()` 호출 |
| 단일 갱신 경로 원칙 (§10.5) | ✅ PASS | ball.x/y는 물리 루프에서만 갱신 (홀인 중심 이동 예외) |
| setTimeout 완전 금지 | ✅ PASS | setTimeout 0건 |
| confirm/alert 금지 | ✅ PASS | Canvas 모달로 대체, 코드 내 0건 |

### 1-3. 금지 패턴 검증

| # | 금지 패턴 | 결과 | 비고 |
|---|-----------|------|------|
| 1 | `.svg`, `<svg>`, `SVG` | ✅ 0건 | |
| 2 | `new Image()`, `img.src` | ✅ 0건 | |
| 3 | `ASSET_MAP`, `SPRITES`, `preloadAssets` | ✅ 0건 | |
| 4 | `feGaussianBlur`, `filter:` | ✅ 0건 | |
| 5 | `setTimeout` (상태 전환) | ✅ 0건 | |
| 6 | `confirm(`, `alert(` | ✅ 0건 | |
| 7 | `Google Fonts`, `@import url` | ✅ 0건 | |
| 8 | `assets/` 디렉토리 | ✅ **삭제됨** | **[B1 수정 확인]** |

**금지 패턴: 전체 PASS (0건)**

---

## 2. 모바일 조작 대응 검사

| 항목 | 결과 | 비고 |
|------|------|------|
| 터치 이벤트 등록 (touchstart/touchmove/touchend) | ✅ PASS | L1500-1522, `{ passive: false }` × 3 + `preventDefault()` × 4 |
| 가상 조이스틱/터치 버튼 UI | ✅ N/A | 드래그 에이밍 게임 — 공 자체가 터치 타겟, 별도 UI 불필요 |
| 터치 영역 44px 이상 | ✅ PASS | 공 터치 판정 반경 40px = 직경 80px (44px 초과) |
| 모바일 뷰포트 meta 태그 | ✅ PASS | `width=device-width, initial-scale=1.0, user-scalable=no` |
| 가로/세로 스크롤 방지 | ✅ PASS | `touch-action:none`, `overflow:hidden`, `-webkit-user-select:none`, `user-select:none` |
| 키보드 없이 게임 플레이 가능 여부 | ✅ PASS | 모든 핵심 조작(에이밍/발사/시작/다음레벨/재시작) 터치로 가능 |
| 터치 좌표 변환 정확성 | ✅ PASS | `getBoundingClientRect()` 기반 `canvasCoord()` 함수, §3.4 공식 일치 |
| inputMode 분기 실제 사용 | ✅ PASS | 마우스 이벤트에서 `hasTouch && inputMode==='touch'` 체크로 이중 입력 방지 |
| touchend changedTouches 사용 | ✅ PASS | L1519 `e.changedTouches[0]` (touchend에서 touches 비어있는 문제 해결) |

> **참고**: R키 레벨 재시작, ESC 일시정지, Space 가속은 키보드 전용이나, 이들은 편의 기능이며 게임 진행에 필수가 아님. 10타 초과 시 Canvas 모달로 "포기" 선택 가능하므로 모바일에서도 완전한 플레이 가능.

---

## 3. 브라우저 테스트 (Puppeteer)

### 3-1. 테스트 환경
- Chromium (Puppeteer headless)
- `file://` 프로토콜 로드
- 뷰포트: 520×580px

### 3-2. 테스트 결과

| 항목 | 결과 | 비고 |
|------|------|------|
| 페이지 로드 | ✅ PASS | 정상 로드, 에러 없음 |
| 콘솔 에러 없음 | ✅ PASS | JS 에러 0건, 경고 0건 |
| 캔버스 렌더링 | ✅ PASS | Canvas 480×540 (DPR 1x), 정상 렌더링 |
| 시작 화면 표시 | ✅ PASS | 타이틀 "MINI GOLF ADVENTURE" + 깃발/공 장식 + 깜빡이는 시작 안내 |
| 게임 진입 | ✅ PASS | enterState 후 S_PLAYING(2) 진입, 레벨 1 로드 |
| HUD 표시 | ✅ PASS | LEVEL 1, Par 2, Strokes: 0, Score: 0, ★ 0 |
| 공/홀 위치 | ✅ PASS | ball(80,340), hole(400,340) — Y오프셋 60 적용 정확 |
| 힌트 텍스트 | ✅ PASS | "공을 드래그하여 발사하세요!" 표시 |
| 잔디 캐시 생성 | ✅ PASS | `grassCanvas` 존재 확인 |
| 파티클 풀 초기화 | ✅ PASS | 40개 풀 준비 완료 |
| 벽 개수 (레벨 1) | ✅ PASS | 외곽 4개 (레벨 1은 추가 벽 없음) |
| 10레벨 데이터 | ✅ PASS | `LEVELS.length === 10` |
| TweenManager 인스턴스 | ✅ PASS | `tw instanceof TweenManager` 확인 |
| ObjectPool 인스턴스 | ✅ PASS | `particlePool instanceof ObjectPool` 확인 |
| bounceCount 추적 변수 | ✅ PASS | **[B2 수정]** `bounceCount` 변수 존재, 초기값 0 |
| 이벤트 리스너 수 | ✅ PASS | 8개 등록 (mouse 3 + touch 3 + keyboard 1 + resize 1) |

### 3-3. 스크린샷 검증

1. **타이틀 화면**: 어두운 배경 + 잔디 장식 + 홀/깃발/공 장식물 + 타이틀 텍스트 (글로우 효과) + "CLICK or TAP to START" 깜빡임 — **정상**
2. **레벨 1 플레이**: 잔디 배경 + 공(좌측) + 홀/깃발(우측) + HUD(상단) + 힌트(하단) — **정상**

---

## 4. 에셋 로딩 검사

| 항목 | 결과 | 비고 |
|------|------|------|
| `assets/` 디렉토리 존재 | ✅ **삭제됨** | **[B1 수정 확인]** 디렉토리 자체 없음 |
| `assets/manifest.json` 존재 | ✅ **삭제됨** | |
| SVG 파일 참조 | ✅ PASS | index.html에서 SVG 파일 참조 0건 |
| 코드 내 에셋 로딩 | ✅ PASS | `new Image()`, `img.src`, `fetch` 등 미사용 |
| 외부 리소스 요청 | ✅ PASS | Google Fonts, @import url 0건 |

**결론**: 100% Canvas API 코드 드로잉. 외부 에셋 의존성 0.

---

## 5. 코드 품질 세부 평가

### 5-1. 우수한 점
- **기획서 충실도 100%**: 22개 체크항목 전체 PASS (1회차 대비 퍼펙트 반사 보너스 추가 구현으로 100% 달성)
- **금지 패턴 완전 제거**: 코드 내 0건, assets/ 디렉토리 삭제 완료
- **방어적 코딩**: try-catch localStorage, audioCtx null 체크, 파티클 풀 auto-expand
- **Cycle 5 교훈 반영**: SVG 프리로드 코드 완전 제거, setTimeout 완전 제거, 단일 갱신 경로 준수
- **상태 관리 견고**: levelClearing 가드, TransitionGuard, enterState() 일원화
- **터치 좌표 변환**: getBoundingClientRect 기반 정확한 좌표 변환 (DPR 무관)
- **물리 연산**: 법선 벡터 반사, 점-선분 거리, 관대한 홀 판정 — 수학적으로 정확
- **이벤트 정리**: listen/destroy 패턴 유지 (8개 리스너 추적)
- **보너스 시스템 완성**: 홀인원(+500), 퍼펙트 반사(+200), 스피드(+150) 3종 모두 구현

### 5-2. 개선 가능 사항 (비필수, 참고용)
- `speed()` 전역 함수가 `ball` 객체에 직접 의존 — 파라미터화하면 테스트 용이성 향상
- 별 애니메이션 scale 1.2→1.0 전환이 `updateLevelClear()`에서 수동 보정 — tween 체이닝으로 대체 가능
- Space 가속(4배속) 시 벽 충돌이 프레임 스킵될 수 있음 — 현재 3회 반복 루프로 처리, 실무적으로 충분

---

## 6. 최종 판정

### 코드 리뷰: **APPROVED**
### 브라우저 테스트: **PASS**
### 종합 판정: **APPROVED**

### 판정 근거
- **1회차 지적사항 2건 모두 수정 완료**: B1(assets/ 삭제), B2(퍼펙트 반사 보너스 구현)
- 기획서 충실도 22/22 (100%) — 1회차 대비 향상
- 금지 패턴 완전 제거 (코드 0건 + assets 디렉토리 0건)
- 콘솔 에러 0건, 경고 0건
- 10레벨 완전 구현, 물리 정확, 터치 대응 완벽
- iframe sandbox 호환 100% (confirm/alert 미사용, Canvas 모달 대체)
- **즉시 배포 가능**

### 미결 사항
없음.
