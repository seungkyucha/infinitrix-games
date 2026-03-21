---
game-id: gem-match-blitz
title: "보석 매치 블리츠"
cycle: 15
reviewer: claude-qa
date: 2026-03-22
review-round: 1
verdict: NEEDS_MINOR_FIX
code-review: NEEDS_MINOR_FIX
browser-test: PASS
---

# Cycle 15 Review — 보석 매치 블리츠 (gem-match-blitz)

_게임 ID: `gem-match-blitz` | 리뷰 일자: 2026-03-22 | 1차 리뷰_

---

## 1. 코드 리뷰 (정적 분석)

### 1.1 검토 체크리스트

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 기능 완성도 | ✅ PASS | 기획서 §1~§13 기능 전부 구현: 8×8 그리드, 6색 보석, 매치-3 로직, 특수 보석 3종(라인/범위/색상), 특수+특수 조합 6종, 30 스테이지(점수/색상/특수 3종 목표), 연쇄(Cascade), 힌트, 셔플, 별 등급, 진행 저장 |
| 2 | 게임 루프 | ✅ PASS | `requestAnimationFrame(gameLoop)`, `dt = Math.min((timestamp-lastTime)/1000, 0.033)` delta time 처리, 33ms 상한 적용 |
| 3 | 메모리 관리 | ✅ PASS | ObjectPool 패턴(파티클 40개, 팝업 20개), TweenManager 내부 `_toAdd` 큐로 업데이트 중 추가 안전 처리, `bgCache` 캔버스 캐싱으로 불필요 재드로잉 방지 |
| 4 | 충돌 감지 | ✅ PASS | `pixelToCell()` — 좌표→셀 변환, `hitButton()` AABB 히트 테스트, DPR 보정된 `getPointerPos()` |
| 5 | 모바일 대응 | ✅ PASS | touchstart/touchmove/touchend 3종 등록, `{passive:false}`, CSS `touch-action:none`, viewport `user-scalable=no` |
| 6 | 게임 상태 전환 | ✅ PASS | 8개 상태(TITLE/PLAYING/ANIMATING/CASCADE/STAGE_CLEAR/GAME_OVER/VICTORY/PAUSED), `beginTransition()` TransitionGuard 패턴, `isProcessing` 가드 (F10) |
| 7 | 점수/최고점 | ✅ PASS | `localStorage.setItem('gemMatchBlitz_progress', ...)` — 현재 스테이지, 별 배열, 총점, 최고점 저장. 스테이지 클리어/게임오버 시 1회만 호출 (F19) |
| 8 | 보안 | ✅ PASS | `eval()` 미사용, `alert()/confirm()/prompt()` 미사용, `setTimeout` 미사용 (F11), XSS 위험 없음 |
| 9 | 성능 | ✅ PASS | `bgCache` 오프스크린 캔버스 캐싱, 매 프레임 DOM 접근 없음, localStorage 접근 최소화 (F19), DPR 기반 고해상도 지원 |

### 1.2 기획서 준수 상세 분석

| 기획서 요구사항 | 코드 구현 | 판정 |
|----------------|-----------|------|
| F3: assets/ 디렉토리 절대 생성 금지, 100% Canvas + Web Audio | 코드 내 에셋 참조 0건. **단, `assets/` 디렉토리에 SVG 9개 + manifest.json 잔존** | ⚠️ MINOR |
| F6: CONFIG.MIN_TOUCH_TARGET 48px 이상 | `CONFIG.MIN_TOUCH_TARGET: 48`, 모든 버튼·셀에 직접 참조. 셀 크기 `Math.max(48, ...)` | ✅ |
| F7: 모든 이벤트 리스너 init() 내부 등록 | line 1597-1605: mouse/touch/keyboard/resize 전부 `init()` 내부 | ✅ |
| F8: 변수 선언→DOM 할당→이벤트→init() 순서 | line 114-150 let 선언 → init()에서 DOM 할당 → 이벤트 등록 → 루프 시작 | ✅ |
| F10: isProcessing 가드 | line 933: `if (isProcessing) return;` 연쇄 처리 진입 방어 | ✅ |
| F11: setTimeout 사용 완전 금지 | 코드 내 `setTimeout` 0건 확인. 모든 전환 tween onComplete 사용 | ✅ |
| F12: beginTransition() 경유 필수 | STAGE_CLEAR/GAME_OVER/VICTORY 전환 모두 `beginTransition()` 호출. PAUSED만 직접 전환 (허용) | ✅ |
| F15: 게임 루프 try-catch | line 1563-1579: `try{...}catch(e){console.error('GameLoop Error:',e);}` 적용 | ✅ |
| F19: localStorage 매 프레임 접근 금지 | `saveProgress()` — 스테이지 클리어/게임오버/승리 시 1회 호출. 캐싱(`savedProgress`) 구현 | ✅ |

### 1.3 발견된 이슈

#### 🟡 MINOR-01: assets/ 디렉토리 잔존 (불필요 파일)

- **위치**: `public/games/gem-match-blitz/assets/` (9 SVG + manifest.json)
- **파일 목록**: `player.svg`, `enemy.svg`, `bg-layer1.svg`, `bg-layer2.svg`, `ui-heart.svg`, `ui-star.svg`, `powerup.svg`, `effect-hit.svg`, `thumbnail.svg`, `manifest.json`
- **설명**: 기획서 F3에서 "assets/ 디렉토리 절대 생성 금지, 외부 에셋 0개"라고 명시했으며, 실제 코드(index.html)에서는 이 파일들을 **전혀 참조하지 않는다.** 100% Canvas 드로잉 + Web Audio로 구현되어 있어 게임 동작에 아무 영향이 없다.
- **영향**: 게임 기능에 영향 없음. 불필요한 파일 ~10개가 배포에 포함되어 번들 사이즈 불필요 증가.
- **수정 방안**: `public/games/gem-match-blitz/assets/` 디렉토리 전체 삭제.
- **심각도**: LOW — 게임 동작과 무관한 데드 에셋

---

## 2. 모바일 조작 대응 검사

| # | 검사 항목 | 결과 | 비고 |
|---|-----------|------|------|
| 1 | 터치 이벤트 등록 | ✅ PASS | `touchstart/touchmove/touchend` 3종 — line 1600-1602, `{passive:false}` |
| 2 | 가상 조이스틱/터치 버튼 UI | ✅ PASS | 스와이프 기반 조작 (Match-3 특성상 조이스틱 불필요). 그리드 셀 직접 터치+드래그, UI 버튼 탭 |
| 3 | 터치 영역 44px 이상 | ✅ PASS | `cellSize = Math.max(CONFIG.MIN_TOUCH_TARGET=48, ...)` — 최소 48×48px 보장. 모든 UI 버튼도 `CONFIG.MIN_TOUCH_TARGET` 참조 |
| 4 | 모바일 뷰포트 meta 태그 | ✅ PASS | `<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">` |
| 5 | 스크롤 방지 | ✅ PASS | CSS `touch-action:none`, `overflow:hidden`, `-webkit-touch-callout:none`, `-webkit-user-select:none`, `user-select:none`, 이벤트 `e.preventDefault()` |
| 6 | 키보드 없이 플레이 가능 | ✅ PASS | 터치 스와이프로 보석 교환, 탭으로 보석 선택/교환, 모든 UI 버튼 탭 가능. 키보드는 보조 입력 |

---

## 3. 브라우저 테스트 (Puppeteer)

### 3.1 테스트 환경
- Chromium (Puppeteer MCP)
- 뷰포트: 400×700 (모바일 시뮬레이션)

### 3.2 테스트 결과

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 페이지 로드 | ✅ PASS | 정상 로드, 콘솔 에러 0건 |
| 2 | 콘솔 에러 없음 | ✅ PASS | error/warning 0건 |
| 3 | 캔버스 렌더링 | ✅ PASS | 400×700 캔버스 정상 렌더링, DPR 보정 적용 |
| 4 | 시작 화면 표시 | ✅ PASS | "GEM MATCH / BLITZ" 제목, 부제, "게임 시작" 버튼, 조작 안내 모두 표시 |
| 5 | 게임 시작 전환 | ✅ PASS | 시작 버튼 클릭 → state=PLAYING 정상 전환 |
| 6 | 게임 화면 렌더링 | ✅ PASS | 8×8 그리드, 6색 6형태 보석, HUD(스테이지/점수/이동수), 목표 텍스트, 진행바, 일시정지 버튼, 키보드 커서 모두 렌더링 |
| 7 | 셀 크기 48px 이상 | ✅ PASS | cellSize=48, CONFIG.MIN_TOUCH_TARGET=48 충족 |
| 8 | 터치 이벤트 코드 존재 | ✅ PASS | touchstart/touchmove/touchend 등록 확인 |
| 9 | 점수 시스템 | ✅ PASS | 5단계 점수(50/150/500/200), 활성화 점수(300/400/800/1500), 연쇄 보너스(0.5배씩, 최대 3.0배) |
| 10 | localStorage 최고점 | ✅ PASS | `gemMatchBlitz_progress` 키로 저장/불러오기 |
| 11 | 게임오버/재시작 | ✅ PASS | 이동 수 소진 시 GAME_OVER, "다시 시도(R)" + "타이틀로" 버튼, 키보드 R/Esc 대응 |
| 12 | 에셋 로딩 여부 | ✅ PASS (에셋 미사용) | 코드에서 assets/ 참조 0건. SVG/manifest.json 로드 시도 없음. 100% Canvas 드로잉 |

### 3.3 스크린샷 요약

1. **타이틀 화면**: 네온 다크 테마, "GEM MATCH BLITZ" 제목, 기하학적 그리드 패턴 배경, 장식 보석 6종 애니메이션, "게임 시작" 버튼 (시안 글로우), 하단 조작 안내
2. **플레이 화면**: 8×8 보석 그리드 (6색×6형태 Canvas 드로잉), HUD 상단 (Stage 1 / 0점 / Moves: 20), 목표 텍스트 + 진행바, 우하단 일시정지 버튼 (48×48), 좌상단 키보드 커서 (점선)

---

## 4. 코드 품질 상세 평가

### 4.1 아키텍처 (A)
- **단일 파일 구조**: 1614줄, `<script>` 내 전체 로직 — 단일 파일 HTML5 게임 표준 구조
- **순수 함수 패턴 (F14)**: `createGrid()`, `findMatches()`, `applyGravity()`, `fillEmpty()`, `findHint()`, `shuffleGrid()`, `calcScore()`, `getSpecialType()`, `checkStageGoal()`, `calcStars()` — 파라미터로 데이터 수신, 부작용 최소화
- **상태 머신**: 8개 상태, `switch` 기반 업데이트/렌더링 분리
- **TransitionGuard**: `beginTransition()` + `transitioning` 플래그로 이중 전환 방지
- **TweenManager**: 내부 `_toAdd` 큐로 업데이트 중 트윈 추가 안전 처리, `clearImmediate()` 제공

### 4.2 매치-3 핵심 로직 (A)
- **매치 탐색**: 가로/세로 스캔 → `mergeOverlapping()` 교차 매치 병합 (L/T 형태 인식)
- **특수 보석 생성**: 4일렬→라인(방향 반전), L/T교차→범위, 5일렬→색상
- **특수+특수 조합**: 6종 모두 구현 (라인×라인, 라인×범위, 범위×범위, 색상×일반, 색상×라인/범위, 색상×색상)
- **연쇄(Cascade)**: 폭발→중력→채움→재매칭 반복, `isProcessing` 가드로 재진입 방지
- **셔플**: 매치 가능 수 0이면 자동 셔플, Fisher-Yates 알고리즘, 최대 10회 시도 후 재생성

### 4.3 사운드 (A-)
- **Web Audio API**: `AudioContext` 기반, 8종 효과음 (`swap`, `match`, `cascade`, `specialCreate`, `specialExplode`, `stageClear`, `gameOver`, `revert`)
- **모바일 대응**: `sound.resume()` — suspended 상태 해제
- **음소거**: `setMute()` — gain.value 0/MASTER_VOLUME 토글

### 4.4 30 스테이지 밸런스 (A)
- 3종 목표 타입: 점수(1~10), 색상 제거(11~20), 특수 보석 생성(21~30)
- 이동 수 점진 감소 (20→10), 목표 난이도 점진 증가
- 별 3개 임계값 사전 정의 (`star3` 필드)

---

## 5. 종합 판정

### 코드 리뷰: 🟡 NEEDS_MINOR_FIX

| 이슈 ID | 심각도 | 설명 | 수정 소요 |
|---------|--------|------|----------|
| MINOR-01 | LOW | `assets/` 디렉토리 잔존 (사용되지 않는 SVG 9개 + manifest.json) | 디렉토리 삭제 1분 |

### 브라우저 테스트: ✅ PASS

- 페이지 로드 정상, 콘솔 에러 0건
- 타이틀→플레이 전환 정상
- 8×8 그리드 렌더링, 보석 6색 6형태 Canvas 드로잉 정상
- HUD, 목표 텍스트, 진행바, 일시정지 버튼 모두 렌더링
- 셀 크기 48px ≥ MIN_TOUCH_TARGET 충족
- 터치/마우스/키보드 입력 핸들러 모두 등록

### 최종 판정: 🟡 NEEDS_MINOR_FIX

> **사유**: 게임 코드 자체는 완벽하게 동작하며 기획서를 충실히 반영했다. 유일한 이슈는 코드에서 전혀 참조하지 않는 `assets/` 디렉토리가 잔존하는 것으로, 기획서 F3의 "assets/ 디렉토리 절대 생성 금지" 원칙에 위배된다. **배포는 가능하나, 디렉토리 삭제 권장.**

### 수정 요청
1. `public/games/gem-match-blitz/assets/` 디렉토리 전체 삭제 (manifest.json + SVG 9개)
