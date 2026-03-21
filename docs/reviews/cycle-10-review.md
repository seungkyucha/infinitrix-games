# Cycle 10 Review — mini-card-battler (미니 카드 배틀러)

**Reviewer**: Claude AI (Senior Game Dev & QA)
**Date**: 2026-03-21
**Game ID**: `mini-card-battler`
**File**: `public/games/mini-card-battler/index.html` (1905 lines)
**Spec**: `docs/game-specs/cycle-10-spec.md`

---

## 1. 코드 리뷰 (정적 분석)

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 기능 완성도 | PASS | 30장 카드풀, 10종 적(일반5+엘리트2+보스3), 3층 맵, 상점/이벤트/휴식/보상, 언락 시스템 모두 구현 |
| 2 | 게임 루프 | PASS | `requestAnimationFrame` 사용, `dt = Math.min((timestamp - lastTime) / 1000, 0.1)` 프레임 캡 적용 |
| 3 | 메모리 관리 | PASS | `tw.clearImmediate()` 즉시 정리, 파티클/팝업 splice로 제거, 객체 재사용 패턴 |
| 4 | 충돌 감지 | N/A | 턴제 카드 게임 — 클릭/탭 히트 테스트로 대체. `getHandBounds()`, `getEnemyBounds()` 정확 |
| 5 | 모바일 터치 | PASS | `touchstart/touchmove/touchend` 모두 `{ passive: false }`, `getBoundingClientRect()` 좌표 보정 |
| 6 | 캔버스 리사이즈 | PASS | `window.addEventListener('resize', resizeCanvas)`, DPR 처리(`Math.min(dpr, 2)`), `window.innerWidth/Height` 기준 |
| 7 | 게임 상태 전환 | PASS | 14개 상태 정의, **모든 전환이 `beginTransition()` 경유**, `isTransitioning` 가드 플래그 적용 |
| 8 | 점수/최고점 | PASS | `localStorage` `mcb_best_score` + `mcb_unlocks` 키, try/catch 감싸기 |
| 9 | 보안 | PASS | `eval()` 없음, `innerHTML` 없음, `alert/confirm/prompt` 없음, XSS 위험 없음 |
| 10 | 성능 | PASS | 매 프레임 DOM 접근 없음, 100% Canvas API 렌더링 |
| 11 | 'use strict' | PASS | 스크립트 최상단 선언 |
| 12 | setTimeout 미사용 | PASS | 상태 전환에 `setTimeout` 사용 없음, 모두 tween `onComplete` 사용 |
| 13 | beginTransition 경유 | PASS | 직접 `enterState()` 호출 없음 (init 시 TITLE 1회 제외), 즉시 전환도 `beginTransition(s, {immediate:true})` |
| 14 | CONFIG 수치 정합성 | PASS | CFG 객체에 모든 밸런스 수치 1:1 매핑 (HP 80, 마나 3, 손패 5 등) |
| 15 | Web Audio | PASS | 프로시저럴 SFX, 첫 유저 인터랙션 시 `initAudio()`, try/catch 감싸기 |

### 에셋 관련 특이사항

| 항목 | 상태 | 설명 |
|------|------|------|
| `assets/manifest.json` | 존재 | 9개 에셋 정의 (player.svg, enemy.svg, bg 2개, UI 2개, powerup, effect, thumbnail) |
| SVG 파일 9개 | 존재 | `assets/` 디렉토리에 물리적으로 존재 |
| 코드 내 에셋 참조 | **없음** | `fetch`, `Image()`, `XMLHttpRequest`, `assets` 문자열 참조 0건 |
| 실제 렌더링 | **100% Canvas 코드 드로잉** | 적 10종 모두 Canvas shape로 렌더링 (slime, goblin, skeleton 등) |

> **판정**: 코드 자체는 에셋을 전혀 사용하지 않아 게임 실행에 영향 없음. 다만 기획서 §0 #5에서 "assets/ 디렉토리 생성 자체를 금지"라고 명시했으므로, **assets/ 디렉토리가 불필요하게 존재**하는 것은 기획 위반(경미).

---

## 2. 브라우저 테스트 (Puppeteer)

**테스트 환경**: Chromium (Puppeteer MCP), 400x600 viewport

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 페이지 로드 | **PASS** | 즉시 로드, 에러 없음 |
| 2 | 콘솔 에러 없음 | **PASS** | 콘솔 출력 0건 |
| 3 | 캔버스 렌더링 | **PASS** | 400x600 캔버스, DPR 적용 확인 |
| 4 | 시작 화면 표시 | **PASS** | 타이틀 "MINI CARD BATTLER", 카드 팬 애니메이션, 마나 파티클, 조작 안내 |
| 5 | 맵 화면 | **PASS** | Floor 1 - 숲, 노드 연결선, 도달 가능 노드 글로우, HP/Gold/Deck 하단 표시 |
| 6 | 전투 화면 | **PASS** | 적 렌더링(고블린), HP바, 인텐트 표시, 손패 5장, 마나 3/3, End Turn 버튼 |
| 7 | 일시정지 화면 | **PASS** | 배경 위 오버레이, Resume/Quit 버튼, 현재 상태 정보 표시 |
| 8 | 터치 이벤트 코드 존재 | **PASS** | `touchstart`, `touchmove`, `touchend` 모두 등록, `passive:false` |
| 9 | 점수 시스템 | **PASS** | `calcScore()` 함수, HP/골드/층/보스킬/퍼펙트 기반 점수 |
| 10 | localStorage 최고점 | **PASS** | `mcb_best_score` 키, 읽기/쓰기 정상 동작 확인 |
| 11 | 게임오버/재시작 | **PASS** | GAMEOVER/VICTORY 상태 존재, 점수 표시 + 언락 메시지 + 재시작 안내 |
| 12 | 상태 전환 | **PASS** | TITLE→MAP→PRE_BATTLE→PLAYER_TURN→PAUSED 전환 모두 정상, 페이드 오버레이 |

### 스크린샷 요약

| 화면 | 상태 |
|------|------|
| 타이틀 | 카드 팬 + 마나 파티클 + 글로우 타이틀 + 조작 안내 |
| 맵 | Floor 1 숲 배경 + 노드 그래프 + 플레이어 정보바 |
| 전투 | 적(고블린) + 인텐트 + HP바 + 손패 5장 + 마나 + End Turn |
| 일시정지 | 반투명 오버레이 + Resume/Quit 버튼 + 상태 정보 |

---

## 3. 기획서 핵심 요구사항 대비

| # | 기획서 요구사항 | 구현 여부 | 비고 |
|---|----------------|----------|------|
| 1 | 턴제 카드 전투 | O | 드로우→플레이→턴종료→적턴 사이클 |
| 2 | 30장 카드풀 (ATK 10 + DEF 8 + SKL 8 + PWR 4) | O | CARD_POOL.length === 30 |
| 3 | 10종 적 (일반5 + 엘리트2 + 보스3) | O | ENEMY_DEFS 10개 |
| 4 | 3층 맵 (숲→동굴→탑) | O | generateMap() + FLOOR_NODES 3층 |
| 5 | 보스 페이즈 전환 | O | phase2hp, phase3hp, 패턴 교체 |
| 6 | 상점/이벤트/휴식 | O | setupShop(), generateEvent(), handleRestClick() |
| 7 | 덱빌딩 (보상 카드 3→1 선택) | O | generateRewardCards() + REWARD 상태 |
| 8 | 언락 시스템 | O | checkUnlocks() 6개 조건, localStorage 저장 |
| 9 | Seeded RNG | O | LCG 기반 makeRng(), 맵 시드 고정 |
| 10 | 키보드 조작 (1-5, Q/W, E, Space, ESC) | O | keydown 이벤트 핸들러 |
| 11 | 카드 업그레이드 | O | upgraded 플래그, upgEffect/upgDesc |
| 12 | 디버프 시스템 (취약/약화/출혈/가시) | O | tickDebuffs(), 전투 로직에 반영 |
| 13 | 파워 카드 지속 효과 | O | powers 배열, 턴 시작 시 효과 적용 |
| 14 | assets/ 디렉토리 금지 (§0 #5) | **X** | assets/ 디렉토리 존재 (코드에서 미사용) |

---

## 4. 발견된 이슈

### MINOR-01: assets/ 디렉토리 불필요 존재
- **심각도**: Minor
- **위치**: `public/games/mini-card-battler/assets/`
- **내용**: 기획서 §0 #5에서 "assets/ 디렉토리 생성 자체를 금지"라고 명시. 코드에서 전혀 참조하지 않으나, 9개 SVG 파일 + manifest.json이 물리적으로 존재.
- **영향**: 게임 실행에 영향 없음. 불필요한 파일로 빌드 사이즈 증가만 유발.
- **권장 조치**: `public/games/mini-card-battler/assets/` 디렉토리 삭제

---

## 5. 최종 판정

### 코드 리뷰 판정: **APPROVED**

코드 품질이 우수합니다:
- 기획서의 모든 핵심 기능이 단일 `index.html`에 완전 구현
- 8사이클 연속 재발된 assets 로딩 문제가 코드 레벨에서는 **완벽히 해소** (100% Canvas 코드 드로잉)
- `beginTransition()` 경유 원칙, `isTransitioning` 가드, `clearImmediate()` 등 이전 사이클 피드백 전부 반영
- 보안/성능/모바일 모든 체크리스트 통과

### 브라우저 테스트 판정: **PASS**

- 타이틀/맵/전투/일시정지 화면 모두 정상 렌더링
- 콘솔 에러 0건
- 상태 전환 정상 동작
- localStorage 동작 확인

---

### 최종 판정: NEEDS_MINOR_FIX

> 게임 코드 자체는 즉시 배포 가능한 품질이나, `assets/` 디렉토리가 기획서 규칙 위반으로 불필요하게 존재합니다.
> **`public/games/mini-card-battler/assets/` 디렉토리 삭제** 후 배포를 권장합니다.
> 이 수정은 코드 변경 없이 파일 삭제만으로 완료되므로, 배포 자체는 가능합니다.
