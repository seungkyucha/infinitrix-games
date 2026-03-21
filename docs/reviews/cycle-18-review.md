---
game-id: rune-survivor
title: 룬 서바이버
cycle: 18
review-round: 2
date: 2026-03-22
reviewer: QA Agent (Claude)
verdict: APPROVED
code-review: APPROVED
browser-test: PASS
---

# Cycle 18 리뷰 (2회차 재리뷰) — 룬 서바이버 (rune-survivor)

## 요약

**판정: APPROVED** — 1회차 리뷰에서 지적된 모든 MAJOR/MINOR 수정사항이 정상적으로 반영되었습니다. 2,757줄(99KB)의 index.html에 100% Canvas 코드 드로잉으로 구현되어 외부 에셋 의존이 완전히 제거되었습니다. `assets/` 디렉토리 삭제, 에셋 로딩 코드 제거, `transitionAlpha` update()로 이동, `assetsLoaded` 유령 변수 삭제, `thumbnail.svg` 생성까지 모두 완료. 즉시 배포 가능합니다.

---

## 1. 1회차 지적사항 수정 검증

### 🔴 필수 수정 (MAJOR) — 전체 해결 ✅

| # | 지적 내용 | 수정 결과 | 검증 |
|---|-----------|-----------|------|
| **C1** | `assets/` 디렉토리 전체 삭제 | ✅ **완료** | `public/games/rune-survivor/` 내 파일: `index.html`, `thumbnail.svg` 2개만 존재. `assets/` 디렉토리 없음 |
| **C2** | 에셋 로딩 코드 제거 (`ASSET_MAP`, `SPRITES`, `preloadAssets()`) | ✅ **완료** | `ASSET_MAP`, `SPRITES`, `preloadAssets`, `new Image` 검색 결과 0건. L2732 주석: "no external assets — 100% Canvas drawing" |
| **C3** | 모든 `SPRITES` 분기 제거, Canvas fallback만 남기기 | ✅ **완료** | `drawPlayer()`, `drawEnemy()`, `drawBackground()` 모두 순수 Canvas API만 사용. `drawImage` 참조는 `bgCache`(offscreen canvas) 전용 1건만 존재 |
| **C4** | `thumbnail.svg` 생성 (400×300) | ✅ **완료** | `thumbnail.svg` 83줄, viewBox="0 0 400 300". 룬 서클 + 마법사 + 적 + 투사체 + 제목 표시 |

### ⚠️ 권장 수정 (MINOR) — 전체 해결 ✅

| # | 지적 내용 | 수정 결과 | 검증 |
|---|-----------|-----------|------|
| **M2** | `transitionAlpha`를 render()→update()로 이동 | ✅ **완료** | L1504: `update()` 내부에서 `if (isTransitioning) transitionAlpha = Math.min(1, transitionAlpha + dt * 3.33);` — F26 준수. `render()`에서는 읽기 전용 참조만 (L1622) |
| **M4** | `assetsLoaded` 유령 변수 삭제 | ✅ **완료** | L193 주석: "Loading state (removed assetsLoaded — unused variable F15)". 변수 선언 0건 |

---

## 2. 코드 리뷰 (정적 분석)

### ✅ 기능 완성도

| 기능 | 구현 여부 | 비고 |
|------|-----------|------|
| TITLE 상태 | ✅ | 룬 서클 애니메이션, 별 필드, 글리치 이펙트 |
| PLAYING 상태 | ✅ | 플레이어 이동, 자동 무기 발사, 적 스폰 |
| LEVEL_UP 상태 | ✅ | 3택 1 카드 UI, 레어리티 시스템 |
| BOSS_INTRO 상태 | ✅ | 경고 연출, 비네트 효과, 파티클 |
| PAUSED 상태 | ✅ | 계속하기/타이틀로 버튼 |
| GAMEOVER 상태 | ✅ | 점수, 최고점, 재시작 버튼 |
| RESULT 상태 | ✅ | 승리/패배, 상세 통계, 업적 카운트 |
| 적 5종 | ✅ | slime, bat, golem, mage, skeleton (각각 고유 AI) |
| 무기 5종 | ✅ | runeBolt, fireAura, iceLance, lightningChain, shield |
| 무기 업그레이드 5레벨 | ✅ | WEAPON_UPGRADES 테이블 |
| 데미지 상성 테이블 | ✅ | DMG_TABLE (§2.5) |
| 보스 2종 | ✅ | crimsonWarden, elderLich |
| 10웨이브 시스템 | ✅ | WAVE_TABLE, 엘리트 몬스터, 보스 웨이브 |
| XP 테이블/레벨업 | ✅ | xpForLevel() |
| 업적 8종 | ✅ | ACH_LIST, localStorage 저장, 알림 UI |
| 미니맵 | ✅ | 우하단, 적/젬/플레이어 표시 |
| 오브젝트 풀링 | ✅ | 6종 풀 (enemy, proj, particle, gem, popup, bullet) |
| 배경 캐시 | ✅ | offscreen canvas (F10) |
| 화면 흔들림 | ✅ | triggerShake() |
| 슬로우모션 | ✅ | timeScale 조작 |
| BGM + SFX | ✅ | Web Audio API |

### ✅ 게임 루프

- `requestAnimationFrame(gameLoop)` 사용 (L2699)
- `dt = Math.min((timestamp - lastTime) / 1000, 0.05)` — delta time 처리 + 프레임 드롭 방어 (L2692)
- try-catch 적용 (F12, L2691~2698)
- `timeScale` 분리로 슬로우모션 시에도 tween/UI는 정상 속도

### ✅ 메모리 관리

- ObjectPool 6종으로 객체 재사용 (L236~277)
- 비활성 객체 `release()` 처리
- 배열 splice로 참조 정리

### ✅ 충돌 감지

- `circleCollision()` 거리 제곱 비교 — 정확함
- 투사체-적, 적-플레이어, 보스탄-플레이어 분리 처리

### ✅ 게임 상태 전환

- 7개 상태 (TITLE, PLAYING, LEVEL_UP, BOSS_INTRO, PAUSED, GAMEOVER, RESULT)
- `beginTransition()` 경유 원칙 (F23) 준수
- STATE_PRIORITY 맵 존재 (L25)
- 4중 가드 플래그 (F5)

### ✅ 점수/최고점

- `saveBest()` / `getBest()` — localStorage with try-catch (L429~432)
- 업적도 localStorage 저장
- iframe 환경 안전 (allow-same-origin)

### ✅ 보안

- eval() 사용 0건
- alert/confirm/prompt 사용 0건
- window.open 0건
- XSS 위험 없음

### ✅ 성능

- 매 프레임 DOM 접근 없음 (초기화 시 canvas/ctx 캐싱)
- offscreen canvas 배경 캐싱 (F10)
- 파티클/투사체 오브젝트 풀링 6종
- dpr 대응 고해상도 렌더링

### ✅ 에셋 준수 (F1)

- `assets/` 디렉토리 **없음** ✅
- 외부 이미지 로딩 코드 **없음** ✅
- 모든 그래픽 100% Canvas API 드로잉 ✅
- `thumbnail.svg`만 루트에 존재 ✅

---

## 3. 📱 모바일 조작 대응 검사

| # | 검사 항목 | 결과 | 상세 |
|---|-----------|------|------|
| T1 | 터치 이벤트 등록 | ✅ PASS | `touchstart/touchmove/touchend` 3종 등록 (L2743~2745), `{passive:false}` |
| T2 | 가상 조이스틱 UI | ✅ PASS | `drawJoystick()` (L2450), JOYSTICK_OUTER=60, JOYSTICK_INNER=24, DEADZONE=10 |
| T3 | 터치 영역 ≥44px | ✅ PASS | `touchSafe()` 유틸로 MIN_TOUCH_TARGET=48px 강제 (L425~426). 재시작/일시정지/계속하기 버튼 등 7곳 적용 확인 |
| T4 | 모바일 뷰포트 meta | ✅ PASS | `width=device-width, initial-scale=1.0, user-scalable=no` (L5) |
| T5 | 스크롤 방지 | ✅ PASS | CSS: `touch-action:none` (L12), `overflow:hidden` (L11), touchstart/move에 `e.preventDefault()` |
| T6 | 키보드 없이 플레이 가능 | ✅ PASS | 타이틀(탭)→플레이(조이스틱)→레벨업(카드 터치)→일시정지(버튼 터치)→게임오버(재시작 터치) 전경로 터치 지원 |
| T7 | inputMode 자동 전환 | ✅ PASS | keyboard/mouse/touch 3모드 자동 감지, 조이스틱은 touch 모드에서만 렌더링 |
| T8 | canvas 리사이즈 | ✅ PASS | `window.addEventListener('resize', resizeCanvas)` (L2746), dpr 대응 |

---

## 4. 브라우저 테스트

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| B1 | 페이지 로드 | ✅ PASS | 정상 로드, 콘솔 에러 0건 |
| B2 | 콘솔 에러 없음 | ✅ PASS | 콘솔 에러/경고 0건 |
| B3 | 캔버스 렌더링 | ✅ PASS | 800×600, dpr 적용 |
| B4 | 시작 화면 표시 | ✅ PASS | 룬 서클 애니메이션, 별 필드, 타이틀, 조작법 안내 정상 표시 |
| B5 | 게임 플레이 화면 | ✅ PASS | 플레이어(Canvas), 적(슬라임 Canvas), 투사체, HP/XP 바, WAVE, 점수, 미니맵, 무기 아이콘 정상 |
| B6 | 게임오버 화면 | ✅ PASS | GAME OVER + 점수(90) + ★ NEW BEST! ★ + 통계 + 재시작 버튼 표시 |
| B7 | localStorage 최고점 | ✅ PASS | `runeSurvivorBest: "90"` 저장 확인 |
| B8 | 외부 에셋 의존 없음 | ✅ PASS | SVG/이미지 로드 0건. 100% Canvas 렌더링 |
| B9 | Canvas fallback 불필요 | ✅ PASS | 외부 에셋 코드 완전 제거로 fallback 분기 자체가 없음 — 순수 Canvas 코드만 존재 |

### 스크린샷

- **타이틀 화면**: 룬 서클 애니메이션 + 별 필드 + 글리치 타이틀 + "PRESS SPACE / TAP TO START" 정상 렌더링
- **플레이 화면**: Canvas 플레이어(마법사), 슬라임 적, 룬볼트 투사체, HP/XP 바, WAVE 1/10, 점수, 미니맵, 무기 아이콘(Lv1) 모두 정상
- **게임오버 화면**: GAME OVER + 점수(90) + ★ NEW BEST! ★ + Wave/Kills/Level 통계 + 재시작 버튼 정상

---

## 5. 에셋 로딩 검사

| 파일 | 존재 | 규칙 준수 |
|------|------|-----------|
| assets/ 디렉토리 | ❌ 없음 | ✅ F1 준수 (삭제됨) |
| assets/manifest.json | ❌ 없음 | ✅ 삭제 완료 |
| assets/*.svg (8개) | ❌ 없음 | ✅ 삭제 완료 |
| thumbnail.svg | ✅ 존재 | ✅ 400×300, 83줄 SVG |
| 에셋 로딩 코드 | ❌ 없음 | ✅ ASSET_MAP/SPRITES/preloadAssets 전부 제거 |

---

## 6. 잔여 이슈

없음. 1회차에서 지적된 모든 MAJOR 및 MINOR 사항이 해결되었습니다.

| 1회차 이슈 | 분류 | 2회차 상태 |
|-----------|------|-----------|
| C1: assets/ 디렉토리 | MAJOR | ✅ 해결 |
| C2: 에셋 로딩 코드 | MAJOR | ✅ 해결 |
| C3: SPRITES 분기 | MAJOR | ✅ 해결 |
| C4: thumbnail.svg | MAJOR | ✅ 해결 |
| M2: transitionAlpha render()→update() | MINOR | ✅ 해결 |
| M4: assetsLoaded 유령 변수 | MINOR | ✅ 해결 |

---

## 7. 최종 판정

| 항목 | 결과 |
|------|------|
| **코드 리뷰** | **APPROVED** |
| **브라우저 테스트** | **PASS** |
| **최종 판정** | **APPROVED** |

### 판정 근거
1회차에서 NEEDS_MAJOR_FIX 판정의 유일한 원인이었던 **F1 위반(assets/ 디렉토리 생성)이 완전히 해결**되었습니다.

- `assets/` 디렉토리 삭제 ✅
- 에셋 로딩 코드(ASSET_MAP, SPRITES, preloadAssets) 전부 제거 ✅
- 모든 그래픽 100% Canvas API 순수 드로잉 ✅
- `thumbnail.svg` 400×300 생성 ✅
- `transitionAlpha` update()로 이동 (F26) ✅
- `assetsLoaded` 유령 변수 삭제 (F15) ✅

게임 완성도는 1회차에서도 높이 평가되었으며(7개 상태, 5종 무기, 5종 적, 2종 보스, 10웨이브, 로그라이크 업그레이드, 업적 시스템, 가상 조이스틱, Web Audio BGM/SFX), 코드 위반 없이 즉시 배포 가능합니다.

**18사이클 만에 F1 규칙을 정면 준수한 첫 번째 성공 사례입니다.** 🎉
