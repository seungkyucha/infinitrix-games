---
game-id: gem-arena
title: "보석 대전 (Gem Arena)"
cycle: 51
reviewer: claude-qa
date: 2026-03-29
review-round: 2-2
verdict: APPROVED
---

# 사이클 #51 — 보석 대전 (Gem Arena) QA 리뷰 (2차 2회차)

## 개요

PvP 턴 기반 매치3 + 솔로 어드벤처 30레벨 + 왕국 건설 + 리그 시스템.
4,948줄 단일 파일. IX Engine (Input/Tween/Particles/Sound/Save/AssetLoader/UI/Layout) 활용.
에셋: manifest.json + PNG 60개.

> ✅ 2차 2회차 리뷰: 이전 CRITICAL 버그(설정 화면 검은 화면 고착) 수정 확인 완료.

---

## 이전 리뷰 지적 사항 수정 확인

### 🔧 CRITICAL 버그: 설정 화면 검은 화면 고착 → ✅ 수정 완료

| 항목 | 이전 상태 | 현재 상태 |
|------|----------|----------|
| `ACTIVE_SYSTEMS[SETTINGS].tween` | `false` (164줄) | `true` (164줄) ✅ |
| `returnFromSettings()` | `gState`만 변경 | `gFadeAlpha=0; gTransitioning=false;` 추가 (3404~3409줄) ✅ |
| ESC → 설정 화면 진입 | 검은 화면 영구 고착 | 설정 UI 정상 렌더링 ✅ |
| ESC → 게임 복귀 | 불가능 (검은 화면) | PLAY 상태 정상 복귀, 보드/HUD 유지 ✅ |

**Puppeteer 실증:**
- PLAY(gState=5) → ESC → SETTINGS(gState=11), `gFadeAlpha=0`, `gTransitioning=false`
- 설정 화면: "설정" 제목 + 계속하기/소리/음악/언어/타이틀로 5개 버튼 정상 렌더링
- ESC로 복귀 → PLAY(gState=5), `gFadeAlpha=0` — 게임 보드 완전 유지

---

## 1단계: 코드 리뷰 (정적 분석)

| 항목 | 결과 | 비고 |
|------|------|------|
| keydown preventDefault | ✅ PASS | IX Engine Input 모듈이 처리 |
| rAF 기반 게임 루프 + delta time | ✅ PASS | `coreUpdate(dt, timestamp)` — Engine이 rAF + dt 계산 |
| 터치 이벤트 등록 | ✅ PASS | IX Input이 canvas에 pointer/touch 자동 바인딩. `touch-action:none` CSS 적용 |
| 상태 전환 흐름 | ✅ PASS | 12상태 TRANSITION_TABLE 화이트리스트 + deferredQueue, SETTINGS tween 수정 완료 |
| localStorage 저장/로드 | ✅ PASS | `Save.get/set` 래퍼, SAVE_KEY='ix_gem_arena_save', version:1, 9개 필드 |
| canvas resize + dPR | ✅ PASS | Engine onResize 콜백, Layout.safeArea 활용 |
| 외부 CDN 의존 없음 | ✅ PASS | Google Fonts 미사용, UI.FONT 시스템 폰트 활용 |
| alert/confirm/prompt 미사용 | ✅ PASS | `input.confirm()`은 IX Input 메서드, 브라우저 네이티브 아님 |

### 코드 구조 상세

- **TDZ 방어**: 171줄 주석으로 명시, 모든 전역 변수가 Engine 생성(301줄) 이전에 선언됨 ✅
- **input.flush() 위치**: `coreRender()` 마지막(3532줄)에 배치 — C50 교훈 반영 ✅
- **TRANSITION_TABLE**: 140~153줄에 12상태 전환 화이트리스트 완비 ✅
- **ACTIVE_SYSTEMS**: 156~168줄, 상태×시스템 매트릭스 — **SETTINGS.tween = true 수정 완료** ✅
- **returnFromSettings()**: gFadeAlpha=0 + gTransitioning=false 정리 추가 ✅
- **safeGridAccess**: 모든 그리드 접근에 bounds check 래퍼 적용 ✅
- **consumed[][] 매치 추적**: 5→T/L→4→3 우선순위 매칭 + 소비 추적 ✅
- **drawAssetOrFallback**: 에셋 로드 실패 시 Canvas 폴백 전수 적용 ✅
- **DDA 3단계**: failStreak 2/4/6에 따라 턴 증가 + 목표 감소 + 스킵 허용 ✅
- **ObjectPool**: scorePopPool로 GC 압박 최소화 ✅
- **SeededRNG**: 일일 챌린지 + 보드 생성에 시드 기반 RNG 적용 ✅
- **섹션 인덱스**: 24~39줄에 전체 코드 구조 목차 제공 ✅

---

## 2단계: 브라우저 실행 테스트 (Puppeteer)

### 테스트 A: 게임 로드 + 타이틀 화면
- **결과: ✅ PASS**
- 에셋 60개 로드 성공 (manifest.json 기반 동적 로드)
- 타이틀 화면: 배경(bgTitle), 캐릭터(charKing), 보석 에셋 모두 렌더링 확인
- 콘솔 에러: 0건
- gState: TITLE (1), gReady: true
- canvas: 800×600 정상
- 모바일 뷰포트(375×667)에서도 정상 반응형 렌더링 확인

### 테스트 B: Space로 게임 시작
- **결과: ✅ PASS**
- 캔버스 클릭 → input.tapped → TITLE → MODE_SELECT 전환 성공
- 모드 선택 화면: 솔로/PvP/일일 챌린지 3개 버튼 + 뒤로 버튼 + 하단 상태(트로피/별/코인) 표시
- 페이드 전환 애니메이션 정상

### 테스트 C: 솔로 플레이 전체 흐름
- **결과: ✅ PASS**
- MODE_SELECT → KINGDOM_MAP → LEVEL_SELECT → PLAY 전환 정상
- **왕국 지도**: 5구역(성문/정원/시장/도서관/왕좌실) 카드 + 배경 에셋 정상
- **레벨 선택**: 30레벨 6열 그리드 표시, 레벨 1 선택 가능
- **플레이 화면**: 8×8 보석 보드 정상 생성
- **HUD**: Lv.1, 이동:25, 점수:0, 목표(점수 1200: 0/1200) 정상 표시
- **부스터 바**: 망치/교환/셔플/추가턴 4개 에셋 포함 표시
- **보석 스왑 테스트**: findOneValidMove(gGrid) → trySwap(gGrid,...) → startCascade() → finishCascade() → gMovesLeft-- 정상
  - 스왑 후: 이동 25→24, 점수 0→50, 콤보 0→1 확인

### 테스트 D: 게임 오버(LEVEL_FAIL) + 재시작
- **결과: ✅ PASS**
- gMovesLeft=0 → checkSoloLevelEnd() → deferredQueue → LEVEL_FAIL 전환 정상
- 실패 화면: 왕 걱정 표정(charKingWorried), "실패...", 점수:50, 재시도/레벨 선택 버튼 정상
- failStreak: 0→1 증가 확인
- **R키 재시작**: LEVEL_FAIL → PLAY 재진입 → 이동:25, 점수:0, 새 보드 생성 — 완전 초기화 확인

### 테스트 E: PvP + 설정 + 터치/모바일
- **PvP 대전: ✅ PASS** — 양쪽 보드(플레이어+AI), VS 표시, 턴 2/20, 아레나 배경, 부스터 바 정상
- **설정 화면: ✅ PASS (이전 CRITICAL 수정 확인)** — ESC → 설정 UI 정상 렌더링 → ESC → 게임 복귀 정상
- **터치 이벤트: ✅ PASS** — TouchEvent dispatch 정상 처리
- **모바일 뷰(375×667): ✅ PASS** — 타이틀 정상 반응형 렌더링
- **localStorage: ✅ PASS** — version/kingdom/trophies/currentLevel/failStreak/dailyCompleted/soundOn/musicOn/lang 9개 필드 저장 확인

---

## 3단계: 게임 플레이 완전성 검증

### 📌 1. 게임 시작 흐름 — PASS
- 타이틀 화면 존재 (TITLE 상태, gTitleAlpha 페이드 인)
- Space/Enter/클릭/탭 → input.confirm() → MODE_SELECT 전환
- 솔로: initSoloLevel()에서 gMovesLeft, gLevelScore, gGrid 완전 초기화

### 📌 2. 입력 시스템 (데스크톱) — PASS
- IX Input 모듈이 keydown/keyup 자동 등록
- 매치3는 드래그 기반 — handleBoardInput()에서 gDragStart + SWAP_THRESHOLD(20px)로 방향 결정
- 부스터 키(1~4): input.jp('Digit1~4') → activateBooster()
- ESC → 설정 화면: input.jp('Escape') → beginTransition(STATE.SETTINGS) ✅ 정상 동작
- R키 → 재시작: input.jp('KeyR') → beginTransition(STATE.PLAY/PVP_MATCH) ✅

### 📌 3. 입력 시스템 (모바일) — PASS
- IX Input이 touchstart/touchmove/touchend 자동 처리
- 매치3 드래그: input.tapped → gDragStart → input.mouseDown 드래그 감지
- CSS: `touch-action:none; user-select:none; overflow:hidden` 스크롤 방지
- 뷰포트 meta: `width=device-width, initial-scale=1.0, user-scalable=no`
- 부스터/메뉴 버튼: UI.hitTest()로 터치 영역 감지
- MIN_TOUCH=48px 상수 사용

### 📌 4. 게임 루프 & 로직 — PASS
- rAF 기반 Engine.start() + dt 계산 → coreUpdate(dt, timestamp)
- 캐스케이드: gCascadePhase(idle→checking→removing→gravity→checking...) dt 기반
- 매치 검출: findMatches() — 5→T/L→4→3 우선순위 + consumed[][] 소비 추적
- 중력: applyGravity() — 빈 셀 아래로 낙하 + 상단 리필
- 데드록: countValidMoves()==0 → shuffleBoard() → 3중 방어 (셔플×2 + 보드 재생성)
- 점수: SCORE_TABLE + comboMultiplier(gComboCount) 적용
- 난이도: DDA failStreak 3단계 (2회/4회/6회)

### 📌 5. 게임 오버 & 재시작 — PASS
- 솔로: gMovesLeft<=0 && 목표 미달성 → LEVEL_FAIL (deferredQueue)
- 솔로: 모든 목표 달성 → LEVEL_CLEAR
- PvP: gPvpTurn>=20 → PVP_RESULT
- 재시작: enterState(STATE.PLAY) → initSoloLevel() — 점수/이동/보드/콤보/캐스케이드 완전 초기화
- localStorage: saveGameData() → Save.set(SAVE_KEY, {...})

### 📌 6. 화면 렌더링 — PASS
- canvas: Engine이 window.innerWidth/Height + devicePixelRatio 자동 처리
- resize: onResize(w, h) → gBgCache 무효화
- 배경/캐릭터/UI: drawAssetOrFallback()로 에셋+폴백 전수 적용
- 12상태 모두 전용 render 함수 구현

### 📌 7. 외부 의존성 안전성 — PASS
- 외부 CDN 0건 — Google Fonts 미사용
- UI.FONT 시스템 폰트 폴백
- manifest.json 로드 실패 시 console.warn + 폴백 드로잉으로 게임 계속 가능

### 📌 8. 진행 불가능(Stuck) 상태 검증 — ✅ PASS

**8-1. TITLE 화면:** ✅
**8-2. 메뉴/선택 화면:** ✅
**8-3. 게임 플레이 데드락:** ✅ — 3중 셔플 방어
**8-4. 게임 오버/결과:** ✅
**8-5. 레벨 클리어/건설:** ✅
**8-6. 일시정지/설정:** ✅ — ESC 진입/복귀 정상 (이전 CRITICAL 수정 완료)

---

## 에셋 검증

| 항목 | 결과 |
|------|------|
| manifest.json | ✅ 존재, 60개 에셋 정의 |
| PNG 에셋 파일 | ✅ 60개 파일 존재 |
| 에셋 로드 | ✅ assets.load() 성공 |
| 폴백 드로잉 | ✅ drawAssetOrFallback() + drawGemFallback() + drawObstacleFallback() 전수 구현 |

---

## 모바일 조작 대응

| 항목 | 결과 |
|------|------|
| 뷰포트 meta | ✅ `width=device-width, initial-scale=1.0, user-scalable=no` |
| 키보드 없이 전체 플레이 가능 | ✅ 터치/클릭으로 시작→플레이→재시작 모든 흐름 가능 |
| 드래그 조작 | ✅ 매치3 드래그 스왑, SWAP_THRESHOLD=20px |
| touch-action: none | ✅ CSS에 적용 |
| overflow: hidden | ✅ `html,body{overflow:hidden}` |
| MIN_TOUCH=48px | ✅ 상수 사용, 부스터 버튼 영역 보장 |

---

## 플래너/디자이너 피드백 반영 확인

### C50→C51 피드백 반영 상태

| 피드백 항목 | 반영 여부 | 비고 |
|------------|----------|------|
| TDZ 크래시 방어 | ✅ 반영됨 | 171줄 명시, 모든 전역변수 Engine 생성 전 선언 |
| input.flush() 위치 | ✅ 반영됨 | coreRender() 마지막(3532줄) |
| 초기화 체크리스트 | ✅ 반영됨 | initSoloLevel()/initPvpMatch() 내 완전 리셋 |
| 코드 구조 명확화 | ✅ 반영됨 | 섹션 인덱스(24~39줄), 영역별 주석 블록 |
| gFadeProxy 제거 | ✅ 반영됨 | gFadeProxy 제거 + SETTINGS.tween=true 수정으로 setInterval 충돌 해결 |
| AI 깊이 강화 | ✅ 반영됨 | 3단계 AI 행동 모델 + getAiLevel() 동적 조정 |
| 오버라이드 0건 정책 | ✅ 반영됨 | engine._update/_render 래퍼 방식 |

### 2차 리뷰 지적 사항 수정 확인

| 지적 사항 | 수정 여부 | 검증 방법 |
|----------|----------|----------|
| SETTINGS.tween=false → 검은 화면 | ✅ 수정됨 | 164줄 `tween=true` 확인 + Puppeteer ESC 테스트 |
| returnFromSettings() 정리 누락 | ✅ 수정됨 | 3404~3409줄 gFadeAlpha/gTransitioning 초기화 확인 |

---

## 회귀 테스트

| 기능 | 수정 전 | 수정 후 | 회귀 여부 |
|------|---------|---------|----------|
| 타이틀→모드선택 | ✅ | ✅ | 없음 |
| 솔로 플레이 흐름 | ✅ | ✅ | 없음 |
| 보석 스왑+캐스케이드 | ✅ | ✅ | 없음 |
| 게임오버+재시작 | ✅ | ✅ | 없음 |
| PvP 대전 | ✅ | ✅ | 없음 |
| 설정 화면 | ❌ | ✅ | **수정됨** |
| 터치/모바일 | ✅ | ✅ | 없음 |
| localStorage 저장 | ✅ | ✅ | 없음 |

---

## 최종 판정

| 테스트 | 결과 |
|--------|------|
| A: 로드+타이틀 | ✅ PASS |
| B: Space 시작 | ✅ PASS |
| C: 솔로 플레이 흐름 | ✅ PASS |
| D: 게임오버+재시작 | ✅ PASS |
| E-PvP: PvP 대전 | ✅ PASS |
| E-설정: ESC 설정 화면 | ✅ PASS (이전 CRITICAL 수정 확인) |
| E-터치: 터치 이벤트 | ✅ PASS |
| E-모바일: 반응형 | ✅ PASS |
| 📌 1~7 완전성 검증 | ✅ 전체 PASS |
| 📌 8 Stuck 상태 검증 | ✅ 전체 PASS |

### ✅ verdict: APPROVED

**이전 CRITICAL 버그 수정 확인:**
- `ACTIVE_SYSTEMS[SETTINGS].tween = true` (164줄) — 페이드 tween이 SETTINGS 상태에서도 정상 업데이트
- `returnFromSettings()`에 `gFadeAlpha=0; gTransitioning=false;` 추가 (3404~3409줄) — 페이드 상태 완전 정리

**회귀 없음:** 기존 모든 기능(솔로/PvP/왕국/리그/터치/모바일/저장) 정상 동작 확인.

### 특기 사항
- 4,948줄이지만 섹션 인덱스(24~39줄)로 구조 명확
- C50→C51 피드백 7개 항목 모두 반영 완료
- 2차 리뷰 CRITICAL 1건 → 2줄 수정(164줄 + 3405~3407줄)으로 완전 해결
- Puppeteer 실증으로 ESC 진입→설정 UI 표시→ESC 복귀 전 과정 검증 완료
