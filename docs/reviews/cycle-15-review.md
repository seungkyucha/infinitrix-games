---
game-id: gem-match-blitz
cycle: 15
title: "보석 매치 블리츠"
date: 2026-03-22
reviewer: claude-qa
review-round: 5
code-review-verdict: APPROVED
browser-test-verdict: PASS
verdict: APPROVED
---

# Cycle 15 Review (5차) — 보석 매치 블리츠 (gem-match-blitz)

_게임 ID: `gem-match-blitz` | 리뷰 일자: 2026-03-22 | 5차 리뷰_

---

## 0. 이전 리뷰 수정 검증

4차 리뷰에서 관찰된 `assets/` 디렉토리 재출현 문제가 **해결됨**.

| 항목 | 이전 (4차) | 현재 (5차) |
|------|-----------|-----------|
| `assets/` 디렉토리 | 존재 (SVG 8개) | **미존재** |
| 게임 디렉토리 파일 | index.html + assets/ | **index.html + thumbnail.svg만** |

> F6 정책 완전 준수 확인.

---

## 1. 코드 리뷰 (정적 분석)

### 1.1 기능 완성도

| 기획서 항목 | 구현 | 비고 |
|-------------|------|------|
| 8×8 그리드 Match-3 | ✅ | `CONFIG.GRID_SIZE=8` |
| 보석 6종 (색상+도형+글자 3중 구분) | ✅ | `GEM_DEFS[6]` — diamond/circle/triangle/square/star/hexagon + R/S/E/T/A/C |
| 스와이프 교환 + 탭 2회 교환 | ✅ | `handlePointerDown/Move` — 드래그 & 클릭선택 모두 |
| 교환 실패 되돌림 (swap-back) | ✅ | `easeOutBounce` 트윈 + swapFail 사운드 |
| 가로/세로 3+매치 탐지 | ✅ | `findMatches()` — 가로·세로 스캔 + L/T 교차 병합 |
| 연쇄 (cascade) 처리 | ✅ | `cascadeStep()` 재귀 — `isResolving` 가드 |
| 특수 보석 3종 (LINE_H/V, AREA, COLOR_BOMB) | ✅ | `SPECIAL` 열거 + `createSpecialType()` |
| 특수 보석 조합 6종 | ✅ | `handleSpecialCombo()` + `handleSpecialSwap()` |
| 중력 낙하 + 새 보석 생성 | ✅ | `applyGravityCalc()` + `fillEmptyCells()` |
| 30 스테이지 (5종 목표) | ✅ | `getStageConfig(1~30)` — score/collect/special/ice/composite |
| 스테이지 클리어 판정 | ✅ | `checkGoalPure()` — 5종 목표 분기 + composite 재귀 |
| 별 등급 (1~3성) | ✅ | `getStarRating()` — 잔여 이동 5수/10수 기준 |
| 얼음 타일 (1~3중) | ✅ | `iceTiles[][]`, 레이어별 시각 구분 |
| 셔플 (교착 방지) | ✅ | `shuffleGridSafe()` + `hasValidMoves()` |
| 일시정지/재시작/타이틀 복귀 | ✅ | 버튼 UI + 키보드(P/Esc/R) |
| 키보드 조작 | ✅ | 화살표 커서 이동 + Space/Enter 선택 |
| 콤보 배수 (×1.0~×3.0) | ✅ | `calcScore()` — `Math.min(1+(combo-1)*0.5, 3.0)` |

### 1.2 게임 루프

| 항목 | 결과 | 비고 |
|------|------|------|
| requestAnimationFrame | ✅ PASS | L1880 |
| delta time 처리 | ✅ PASS | `Math.min((timestamp-lastTime)/1000, CONFIG.DT_CAP)` — 33ms 클램프 |
| try-catch 보호 | ✅ PASS | L1859~L1879 (F13) |

### 1.3 메모리 관리

| 항목 | 결과 | 비고 |
|------|------|------|
| ObjectPool (파티클 100) | ✅ PASS | `active` 플래그 재사용 |
| ObjectPool (팝업 20) | ✅ PASS | 동일 패턴 |
| TweenManager.clearImmediate() | ✅ PASS | 경쟁 조건 방지 |
| 이벤트 리스너 해제 | N/A | 단일 페이지, iframe 언로드 시 GC |

### 1.4 매치 로직

| 항목 | 결과 | 비고 |
|------|------|------|
| 가로·세로 스캔 | ✅ PASS | 연속 동일 색상 3+ 그룹화 |
| 교차 매치 병합 (L/T자) | ✅ PASS | Set 기반 셀 병합 |
| COLOR_BOMB 스킵 | ✅ PASS | 매치 스캔 시 COLOR_BOMB 제외 |
| `canSwap` 비파괴 검증 | ✅ PASS | 임시 교환→매치 체크→복원 |

### 1.5 모바일 대응

| # | 검사 항목 | 결과 | 비고 |
|---|-----------|------|------|
| 1 | 터치 이벤트 등록 | ✅ PASS | `{passive:false}` + `e.preventDefault()` |
| 2 | 스와이프 방향 감지 | ✅ PASS | `CONFIG.SWIPE_THRESHOLD=20px` |
| 3 | 터치 영역 ≥ 48px | ✅ PASS | `touchSafe()` 전역 사용 |
| 4 | 모바일 뷰포트 meta | ✅ PASS | `width=device-width,initial-scale=1.0,user-scalable=no` |
| 5 | 스크롤 방지 | ✅ PASS | `touch-action:none`, `overflow:hidden` |
| 6 | 키보드 없이 플레이 가능 | ✅ PASS | 스와이프 교환, 탭 선택, 모든 UI 버튼 터치 대응 |
| 7 | DPR 대응 캔버스 리사이즈 | ✅ PASS | `devicePixelRatio` 반영, `ctx.setTransform(dpr,0,0,dpr,0,0)` |
| 8 | cellSize ≥ MIN_TOUCH_TARGET | ✅ PASS | 런타임 확인: `cellSize=48` (400px 뷰포트 기준) |

### 1.6 게임 상태 관리

| 항목 | 결과 | 비고 |
|------|------|------|
| 7개 상태 | ✅ PASS | TITLE/STAGE_SELECT/PLAYING/RESOLVING/STAGE_CLEAR/GAMEOVER/PAUSED |
| STATE_PRIORITY 우선순위 | ✅ PASS | GAMEOVER(100) > STAGE_CLEAR(80) > RESOLVING(60) |
| `beginTransition()` 가드 | ✅ PASS | `if(isTransitioning) return` + 페이드 인/아웃 |
| `isResolving` 가드 | ✅ PASS | 연쇄 중 입력 차단 |
| `isSwapping` 가드 | ✅ PASS | 교환 애니메이션 중 차단 |
| PAUSED 복귀 | ✅ PASS | `prevState` 저장/복원 |

### 1.7 점수 / localStorage

| 항목 | 결과 | 비고 |
|------|------|------|
| 매치 유형별 차등 점수 | ✅ PASS | 3매치=50, 4매치=100, L/T=150, 5매치=300 |
| 콤보 배수 | ✅ PASS | ×1.0~×3.0 (0.5 단위 증가, 상한 적용) |
| addScore() 단일 경로 | ✅ PASS | score + goalProgress.score 동시 갱신 (F21) |
| localStorage try-catch | ✅ PASS | `loadSave()`, `writeSave()`, `loadMuted()`, `saveMuted()` |
| 판정→저장 순서 | ✅ PASS | Cycle 2 교훈 준수 |

### 1.8 보안

| 항목 | 결과 |
|------|------|
| `eval()` | ✅ 없음 |
| `innerHTML` | ✅ 없음 |
| `alert()/confirm()/prompt()` | ✅ 없음 (iframe sandbox 호환) |
| XSS 위험 | ✅ 없음 |
| `window.open()` | ✅ 없음 |
| `setTimeout/setInterval` | ✅ 없음 (0건, F2/F9 준수) |
| `fetch()/Image()` | ✅ 없음 (F6 준수) |

### 1.9 성능

| 항목 | 결과 | 비고 |
|------|------|------|
| 매 프레임 DOM 접근 | ✅ 없음 | Canvas 전용 |
| ObjectPool 재사용 | ✅ PASS | 파티클 100 + 팝업 20 |
| 배경 매 프레임 재생성 | ⚠️ 관찰 | `drawBackground()`에서 그라디언트+그리드 패턴 매 프레임 생성 — 경량이라 실용적 영향 없음 |

### 1.10 에셋 로딩 확인

| 항목 | 결과 | 비고 |
|------|------|------|
| `assets/` 디렉토리 | **미존재** | F6 정책 완전 준수 |
| `assets/manifest.json` | **미존재** | 에셋 파일 자체 불필요 |
| SVG 파일 코드 참조 | 0건 | `thumbnail.svg`는 플랫폼 UI용, 게임 코드 미참조 |
| 외부 리소스 로딩 | 없음 | 100% Canvas API + Web Audio 절차적 생성 |

### 1.11 금지 패턴 검증 (§12.2)

| 패턴 | 검색 결과 | 판정 |
|------|----------|------|
| `setTimeout` | 주석에서만 발견 (L215: "setTimeout 0건") | ✅ PASS |
| `setInterval` | 0건 | ✅ PASS |
| `alert()/confirm()/prompt()` | 0건 | ✅ PASS |
| `eval()/innerHTML` | 0건 | ✅ PASS |
| `new Image()/fetch()/XMLHttpRequest` | 0건 | ✅ PASS |
| `assets/` 디렉토리 | 미존재 | ✅ PASS |
| `.svg/.png/.jpg` 코드 내 참조 | 0건 | ✅ PASS |
| `feGaussianBlur` | 0건 | ✅ PASS |
| Google Fonts / 외부 CDN | 0건 | ✅ PASS |

---

## 2. 브라우저 테스트 (Puppeteer)

### 테스트 환경
- Chromium (Puppeteer MCP), 뷰포트 400×700

### 테스트 결과

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 페이지 로드 | ✅ PASS | file:// 프로토콜 정상 로드 |
| 2 | 콘솔 에러 없음 | ✅ PASS | 초기화~상태전환 전 과정 에러 0건 |
| 3 | 캔버스 렌더링 | ✅ PASS | canvas 400×700 정상 |
| 4 | 타이틀 화면 | ✅ PASS | "GEM MATCH" + "BLITZ" 네온 글로우, 배경 다이아몬드 파티클, 기하학 그리드 패턴, "TAP TO START" 깜빡임 |
| 5 | 스테이지 선택 | ✅ PASS | 30개 스테이지 5×6 그리드, Stage 1 해금(빨간), 2~30 잠금(🔒), ◀BACK 버튼 |
| 6 | 게임 플레이 | ✅ PASS | 8×8 보석 그리드, 6종 보석(색상+도형+글자 3중 구분), HUD(Stage/Score/Moves/Goal), ⏸/🔊 버튼, 키보드 커서 |
| 7 | 일시정지 화면 | ✅ PASS | "PAUSED" + RESUME/TITLE 버튼, 반투명 오버레이 |
| 8 | 게임오버 화면 | ✅ PASS | "GAME OVER" + Score + RETRY/SELECT 버튼, 셰이크 효과 |
| 9 | 스테이지 클리어 | ✅ PASS | "STAGE CLEAR!" + ★★★ 별 등급 + Score/Bonus + NEXT/SELECT 버튼, 컨페티 |
| 10 | 터치 이벤트 코드 | ✅ PASS | touchstart/touchmove/touchend `{passive:false}` |
| 11 | 점수 시스템 | ✅ PASS | `calcScore()` + `addScore()` + 팝업 + HUD |
| 12 | localStorage 최고점 | ✅ PASS | `gem-match-blitz-save` → `{unlockedStage:2, stars:{1:3}, highScores:{1:3900}}` |
| 13 | cellSize ≥ 48px | ✅ PASS | 런타임: `cellSize=48` |

### 스크린샷 요약

1. **타이틀**: 시안 글로우 "GEM MATCH" + 골드 "BLITZ" + 보석 파티클 장식 — 시각적 완성도 높음
2. **스테이지 선택**: 5열 그리드, 해금/잠금 시각 구분 명확, 스크롤 대응
3. **게임 플레이**: 6종 보석 색상·도형·글자 3중 구분 접근성 우수, 셀 테두리·얼음 타일 렌더링 정상
4. **일시정지**: 반투명 오버레이 + RESUME/TITLE 명확한 버튼
5. **게임오버**: 빨간 네온 "GAME OVER" + RETRY/SELECT 양방향 동선
6. **스테이지 클리어**: 골드 "STAGE CLEAR!" + 별 등급 순차 출현 애니메이션 + 보너스 점수

---

## 3. 기획서 수치 정합성 (§13.1)

| 항목 | 기획서 | 코드 | 일치 |
|------|--------|------|------|
| 그리드 크기 | 8×8 | `CONFIG.GRID_SIZE=8` | ✅ |
| 보석 종류 | 6 | `CONFIG.GEM_TYPES=6` | ✅ |
| MIN_TOUCH_TARGET | 48px | `CONFIG.MIN_TOUCH_TARGET=48` | ✅ |
| 3매치 점수 | 50 | `CONFIG.SCORE_3MATCH=50` | ✅ |
| 4매치 점수 | 100 | `CONFIG.SCORE_4MATCH=100` | ✅ |
| L/T매치 점수 | 150 | `CONFIG.SCORE_LMATCH=150` | ✅ |
| 5매치 점수 | 300 | `CONFIG.SCORE_5MATCH=300` | ✅ |
| 특수 조합 점수 | 500 | `CONFIG.SCORE_COMBO_SPECIAL=500` | ✅ |
| Ultimate 점수 | 2000 | `CONFIG.SCORE_ULTIMATE=2000` | ✅ |
| 콤보 상한 | ×3.0 | `CONFIG.MAX_COMBO_MULTI=3.0` | ✅ |
| 잔여 이동 보너스 | 200/수 | `CONFIG.BONUS_PER_MOVE=200` | ✅ |
| 2스타 기준 | 5수 잔여 | `CONFIG.STAR2_MOVES=5` | ✅ |
| 3스타 기준 | 10수 잔여 | `CONFIG.STAR3_MOVES=10` | ✅ |
| 교환 시간 | 200ms | `CONFIG.SWAP_DURATION=0.2` | ✅ |
| 제거 시간 | 180ms | `CONFIG.REMOVE_DURATION=0.18` | ✅ |
| 낙하 시간 | 150ms | `CONFIG.FALL_DURATION=0.15` | ✅ |
| 스와이프 임계값 | 20px | `CONFIG.SWIPE_THRESHOLD=20` | ✅ |
| 총 스테이지 | 30 | `CONFIG.TOTAL_STAGES=30` | ✅ |
| 스테이지 1 | 25수, 1000점 | `{moves:25, goal:{type:'score',target:1000}}` | ✅ |

---

## 4. 피드백 반영 (F1~F22)

| # | 요구사항 | 충족 | 비고 |
|---|---------|------|------|
| F1 | MIN_TOUCH_TARGET 직접 참조 | ✅ | `touchSafe()` 유틸 전역 사용 |
| F2 | setTimeout 0건 | ✅ | Web Audio 네이티브 스케줄링만 |
| F3 | init() 내부 이벤트 등록 | ✅ | L1912~L1989 |
| F4 | 터치 타겟 너비·높이 독립 보장 | ✅ | `touchSafe()` 적용 |
| F5 | 초기화 순서 준수 | ✅ | 변수→CONFIG→클래스→순수함수→init()→DOMContentLoaded |
| F6 | 100% Canvas + Web Audio | ✅ | assets/ 미존재, fetch/Image 0건 |
| F7 | 상태×시스템 매트릭스 | ✅ | gameLoop 내 조건부 업데이트 |
| F8 | isResolving 가드 | ✅ | 연쇄 진입/종료 시 on/off |
| F9 | tween onComplete만 사용 | ✅ | setTimeout 0건 |
| F10 | beginTransition() 경유 | ✅ | PAUSED 예외 |
| F12 | 순수 함수 패턴 | ✅ | findMatches/canSwap/calcScore 등 파라미터 수신 |
| F13 | 게임 루프 try-catch | ✅ | L1859~L1879 |
| F21 | addScore 단일 경로 | ✅ | `addScore()` 함수만 사용 |
| F22 | 상태 전환 우선순위 | ✅ | GAMEOVER > STAGE_CLEAR > RESOLVING |

---

## 5. 발견 이슈

**없음.** 게임 코드 2,003줄, 기능 결함 0건, 보안 이슈 0건.

**관찰 사항** (수정 불필요):
- `drawBackground()`에서 그라디언트+그리드 패턴을 매 프레임 생성하나 경량이라 실용적 영향 없음
- `titleTime` 변수가 게임 루프(L1863)와 drawTitle(L1110) 양쪽에서 증가 — TITLE 상태에서만 drawTitle이 호출되므로 누적 시간이 이중으로 증가하나 시각적 연출에만 영향, 게임 로직에 무관

---

## 6. 최종 판정

| 영역 | 판정 |
|------|------|
| 코드 리뷰 | **APPROVED** |
| 브라우저 테스트 | **PASS** |
| 모바일 대응 | **PASS** |
| 에셋 정책 | **PASS** |
| **종합** | **APPROVED** — 즉시 배포 가능 |

**사유**:
- 기획서 전 항목 구현 (30스테이지, 특수 보석 3종+조합 6종, 연쇄, 5종 목표, 얼음 타일)
- 모바일 완벽 대응 (터치 3종, 48px 최소 타겟, touch-action:none, DPR)
- setTimeout/eval/alert 0건 — iframe sandbox 완전 호환
- F1~F22 누적 교훈 전수 반영
- 콘솔 에러 0건, 전 상태 화면 렌더링 정상
- 4차 대비 개선: assets/ 디렉토리 완전 제거
