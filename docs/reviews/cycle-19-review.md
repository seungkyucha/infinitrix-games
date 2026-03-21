---
game-id: spell-card-dungeon
title: 스펠 카드 던전
cycle: 19
review-round: 1
date: 2026-03-22
reviewer: QA Agent (Claude)
verdict: NEEDS_MINOR_FIX
code-review: NEEDS_MINOR_FIX
browser-test: PASS
---

# Cycle 19 리뷰 — 스펠 카드 던전 (spell-card-dungeon)

## 요약

**판정: NEEDS_MINOR_FIX** — 2,815줄의 index.html이 잘 구조화되어 있고, TITLE→MAP→BATTLE→BOSS_INTRO→REWARD→SHOP→REST→EVENT→RESULT→GAMEOVER 전체 10개 상태가 구현되어 있습니다. 카드 20종, 적 7종, 보스 3체, 유물 8종, 업적 10종까지 Phase 1~5 거의 완전 구현. **그러나 두 가지 수정이 필요합니다**: (1) `assets/` 디렉토리가 존재하여 F1(18사이클 연속 교훈) 위반, (2) 적의 디버프(약화/취약/둔화)가 플레이어에게 실제 적용되지 않는 게임플레이 버그.

---

## 2. 코드 리뷰 (정적 분석)

### ✅ PASS 항목

| # | 항목 | 결과 | 상세 |
|---|------|------|------|
| 1 | 기능 완성도 | ✅ PASS | 기획서 Phase 1~5 거의 완전 구현. 카드 20종, 적 7종, 보스 3체, 유물 8종, 이벤트 4종, 업적 10종, 상점, 휴식, 맵 시스템 전부 존재 |
| 2 | 게임 루프 | ✅ PASS | `requestAnimationFrame` 사용 (L2783). `dt = Math.min((timestamp - lastTime) / 1000, 0.1)` delta time 처리. try-catch 감싸기 (F12) |
| 3 | 메모리 | ✅ PASS | 파티클 수명 관리 후 splice 제거 (L314). floatingTexts 수명 관리 (L1344). TweenManager clearImmediate() 제공 (F6) |
| 4 | 충돌 감지 | ✅ PASS | 턴제 게임이라 실시간 충돌 불필요. `inRect()` 유틸로 UI 히트 테스트 (L564). 맵 노드는 `Math.hypot` 거리 판정 (L2469) |
| 5 | 게임 상태 전환 | ✅ PASS | `beginTransition()` (F23) 경유 필수. STATE_PRIORITY 맵 (F17). PAUSED만 직접 전환 (예외 허용). 전환 오버레이 alpha 애니메이션 |
| 6 | 점수/최고점 | ✅ PASS | `calcScore()` 층×100 + 처치×10 + 보스×500. `localStorage` 저장/로드 (L588-604). 업적도 localStorage 별도 저장 |
| 7 | 보안 | ✅ PASS | `eval()` 0건, `alert()/confirm()/prompt()` 0건, `window.open()` 0건. XSS 위험 없음 |
| 8 | 성능 | ✅ PASS | offscreen bgCache (F10). `buildBgCache()` resizeCanvas() 시에만 재빌드 (L214). 매 프레임 DOM 접근 없음 |
| 9 | setTimeout | ✅ PASS | 코드 내 setTimeout 실사용 0건 (주석에만 1회 등장). 모든 타이밍은 TweenManager 콜백 (F2) |
| 10 | 가드 플래그 | ✅ PASS | `GUARDS.isTransitioning`, `isAnimating`, `isSelectingCard`, `isBossIntro` 4중 가드 체계 (F5) |
| 11 | 단일 갱신 경로 | ✅ PASS | `modifyHP()`, `modifyMana()`, `addGold()` 전용 함수 (F16). 직접 `playerHP =` 할당은 초기화 시에만 |
| 12 | SVG 필터 | ✅ PASS | `feGaussianBlur` 0건. glow는 `shadowBlur`로 구현 (F9) |
| 13 | DPR 지원 | ✅ PASS | `window.devicePixelRatio` 적용. canvas.width = W * dpr (L209-213) |
| 14 | Web Audio | ✅ PASS | SoundManager 클래스. 카드 원소별 SFX, BGM 드론, 보스 전용 BGM. 네이티브 스케줄링 (`ctx.currentTime + delay`) |
| 15 | update/render 분리 | ✅ PASS | update()는 상태 변경만 (L1326-1348), render()는 순수 출력 (L1354-1392). F26 준수 |

### 🔴 필수 수정 (MAJOR)

#### C1. `assets/` 디렉토리 존재 — F1 위반

**위치**: `public/games/spell-card-dungeon/assets/` (8 SVG + manifest.json)

**문제**: 기획서 §14.5 및 F1에서 "assets/ 디렉토리 절대 생성 금지. 100% Canvas 코드 드로잉. thumbnail.svg만 별도 허용"이라 명시. 그러나 현재 `ASSET_MAP` (L169-178), `preloadAssets()` (L181-192), `SPRITES` 객체가 존재하고 8개 SVG를 로드함.

**현상**: 게임은 Canvas fallback이 모두 구현되어 있어 SVG 없이도 동작함 (drawEnemy, drawBoss, drawWizard, renderHUD 등). 그러나 에셋이 존재하는 한 불필요한 네트워크 요청 8건이 발생.

**수정 방법**:
1. `assets/` 디렉토리 전체 삭제 (thumbnail.svg는 게임 루트로 이동)
2. `ASSET_MAP`, `SPRITES`, `preloadAssets()` 코드 제거
3. `SPRITES.xxx` 참조 분기 모두 제거 (Canvas fallback만 남기기)
4. `buildBgCache()` 내 `SPRITES.bgLayer1`, `SPRITES.bgLayer2` 분기 제거
5. `init()` 내 `await preloadAssets()` 제거

**영향 범위**: L168-192 (ASSET_MAP/preloadAssets), L237-246 (bgCache SVG), L1413-1417 (title wizard), L1783-1786 (enemy SVG), L1931 (wizard SVG), L1950-1955 (uiHeart), L1981-1988 (uiStar), L2162-2164 (powerup), L2804 (init)

#### C2. 적 디버프가 플레이어에게 미적용 — 게임플레이 버그

**위치**: `executeEnemyAction()` 함수 (L978-1068)

**문제**: 밴시의 'debuff'(L1005), 가디언의 'crush'(L1026), 아크메이지의 'ice'(L1037) 액션이 `applyStatus({ statuses: {} }, ...)` — 임시 빈 객체에 상태를 적용하여 즉시 버려짐. 플레이어에 실제 약화/취약/둔화가 적용되지 않음.

**현상**: 적의 디버프가 시각적 텍스트만 뜨고 실제 플레이어에 영향 없음. 게임이 의도보다 쉬움.

**수정 방법**:
1. 플레이어 상태 효과 객체 추가: `let playerStatuses = {};`
2. 디버프 액션에서 `applyStatus(playerStatuses객체, ...)` 호출
3. `dealDamageToPlayer()`에서 취약 상태 시 데미지 1.5배 적용
4. `startPlayerTurn()`에서 플레이어 약화/둔화 적용 및 턴 감소 처리
5. HUD에 플레이어 디버프 아이콘 표시

### 🟡 권장 수정 (MINOR)

#### M1. 카드 스와이프 미구현

**기획서 §3.3**: "스와이프 좌/우 — 손패 카드 스크롤 (6장 이상 시)" 명시. 현재 touchmove에서 좌표 추적만 하고 스크롤 로직 없음. 현재 카드가 5장 기본이라 당장 문제 없지만, 드로우 추가 효과로 6장 이상 가능.

#### M2. 덱 보기(D키) 미구현

**기획서 §3.2**: "D — 덱 보기 토글" 명시. L2735에 `/* TODO: deck view toggle */` 주석만 존재.

#### M3. 키보드로 맵 노드 선택 불가

**기획서 §3.2**: "←→ — 맵 경로 선택 이동" 명시. MAP 상태의 키보드 핸들러에 방향키 처리 없음.

---

## 3. 모바일 조작 대응 검사

| # | 항목 | 결과 | 상세 |
|---|------|------|------|
| 1 | 터치 이벤트 등록 | ✅ PASS | `touchstart` (L2699), `touchmove` (L2709), `touchend` (L2719) 모두 `{ passive: false }` + `e.preventDefault()` |
| 2 | 가상 조이스틱/터치 버튼 | ✅ PASS (해당없음) | 턴제 카드 게임으로 조이스틱 불필요. 모든 인터랙션이 탭 기반으로 적합 |
| 3 | 터치 영역 44px 이상 | ✅ PASS | `touchSafe()` 유틸 (L543)로 최소 48px 강제. CONFIG.MIN_TOUCH = 48. 카드 90×130px, 버튼 120×48px 이상 |
| 4 | 모바일 뷰포트 meta | ✅ PASS | `<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">` |
| 5 | 스크롤 방지 | ✅ PASS | CSS: `touch-action: none` (canvas), `overflow: hidden` (html, body). 터치 이벤트 `preventDefault()` |
| 6 | 키보드 없이 플레이 가능 | ✅ PASS | 모든 화면에 탭 인터랙션 존재. TITLE(시작 버튼 탭), MAP(노드 탭), BATTLE(카드 탭 + 턴종료 탭), BOSS_INTRO(탭), REWARD(카드 탭/건너뛰기), SHOP(아이템 탭/나가기), REST(옵션 탭), EVENT(옵션 탭), GAMEOVER/RESULT(재시작 탭) |
| 7 | 입력 모드 자동 감지 | ✅ PASS | `setInputMode()` 함수. 마우스/터치/키보드 이벤트 시 자동 전환 (L2434) |

---

## 4. 에셋 로딩 검사

| # | 항목 | 결과 | 상세 |
|---|------|------|------|
| 1 | `assets/manifest.json` 존재 | ⚠️ 존재 (삭제 필요) | 8개 SVG 에셋 정의. F1 위반 |
| 2 | SVG 파일 존재 | ⚠️ 8개 존재 (삭제 필요) | player, enemy, bg-layer1, bg-layer2, ui-heart, ui-star, powerup, effect-hit |
| 3 | SVG 로딩 성공 | ✅ 전부 로드됨 | SPRITES 객체에 8개 키 모두 존재 |
| 4 | Canvas fallback 존재 | ✅ 모두 존재 | 모든 SPRITES 분기에 else 블록으로 Canvas 코드 드로잉 구현 |
| 5 | thumbnail.svg | ⚠️ assets/ 내부 | 게임 루트로 이동 필요 |

---

## 5. 브라우저 테스트

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 페이지 로드 | ✅ PASS | 에러 없이 로드 완료 |
| 2 | 콘솔 에러 없음 | ✅ PASS | console.error / console.warn 0건 |
| 3 | 캔버스 렌더링 | ✅ PASS | 400×700 DPR 반영. 배경 그라데이션 + 격자 + 횃불 글로우 정상 |
| 4 | 시작 화면 표시 | ✅ PASS | 제목 "스펠 카드 던전", 부제 "로그라이크 덱빌딩 RPG", 시작 버튼, 업적 버튼, 최고점수 표시 |
| 5 | MAP 상태 | ✅ PASS | 10층 맵 노드 표시. 전투/보스/상점/휴식/이벤트 아이콘 구분. HUD(HP/마나/골드/층) 정상 |
| 6 | BATTLE 상태 | ✅ PASS | 적(슬라임) 캔버스 드로잉. 카드 5장 손패. 마나 비용/원소 아이콘/이름/효과 표시. 턴 종료 버튼 |
| 7 | 카드 사용 | ✅ PASS | 화염탄 사용 → 슬라임 HP 20→12 (8 데미지 정상). 마나 3→2 소모. 파티클 이펙트 |
| 8 | GAMEOVER 상태 | ✅ PASS | "게임 오버" + 층 표시 + 점수 + 통계 + "다시 도전 [R]" 버튼 |
| 9 | 점수 저장 | ✅ PASS | bestScore=100 localStorage 저장 확인 |
| 10 | 상태 전환 | ✅ PASS | TITLE→MAP→BATTLE→GAMEOVER 전환 오버레이 애니메이션 정상 |

---

## 6. 기획서 수치 정합성

| 항목 | 기획서 | 코드 | 일치 |
|------|--------|------|------|
| 시작 HP | 80 | CONFIG.STARTING_HP = 80 | ✅ |
| 시작 마나 | 3 | CONFIG.STARTING_MANA = 3 | ✅ |
| 턴당 드로우 | 5장 | CONFIG.DRAW_PER_TURN = 5 | ✅ |
| 시작 덱 | 10장 (타격×4, 수호×3, 마나폭발×2, 화염탄×1) | STARTING_DECK 배열 일치 | ✅ |
| 카드 C01 타격 | 6 데미지 / 업그레이드 9 | damage:6, upgDmg:9 | ✅ |
| 카드 C18 인페르노 | 50 데미지, 소멸 | damage:50, exhaust:true | ✅ |
| 슬라임 HP/ATK | 20/5 | hp:20, atk:5 | ✅ |
| 가디언 골렘 HP/ATK | 80/10 | hp:80, atk:10 | ✅ |
| 아크메이지 HP/ATK | 150/12 | hp:150, atk:12 | ✅ |
| 원소 배율 (fire→skeleton) | 1.5× | ELEM_MULT.fire.skeleton = 1.5 | ✅ |
| 최소 터치 사이즈 | 48px | CONFIG.MIN_TOUCH = 48 | ✅ |

---

## 7. 수정 지시 요약

### 🔴 필수 (배포 전 수정)

| # | 내용 | 영향도 |
|---|------|--------|
| **C1** | `assets/` 디렉토리 삭제 + 에셋 로딩 코드 제거 + SPRITES 분기 제거 | 높음 — F1 위반 |
| **C2** | 플레이어 디버프 시스템 구현 (약화/취약/둔화 실제 적용) | 중간 — 게임플레이 버그 |

### 🟡 권장 (배포 가능하나 개선 권장)

| # | 내용 | 영향도 |
|---|------|--------|
| **M1** | 카드 스와이프 스크롤 구현 (6장 이상 시) | 낮음 |
| **M2** | 덱 보기(D키) 구현 | 낮음 |
| **M3** | 맵에서 키보드 노드 선택 구현 | 낮음 |

---

## 8. 종합 평가

**코드 품질: 9/10** — 18사이클 교훈(F1~F30)의 대부분을 정확히 반영. 구조화된 섹션 분리, 가드 플래그, 단일 갱신 경로, beginTransition 패턴, offscreen 캐싱 등 모범적. assets/ 디렉토리 문제와 디버프 미적용만 수정하면 즉시 APPROVED.

**게임성: 9/10** — Slay the Spire 스타일 로그라이크 덱빌더가 2,815줄 단일 HTML에 완전히 구현됨. 20종 카드, 7종 적, 3보스, 8유물, 원소 상성, 인텐트 시스템, 상점/휴식/이벤트까지 높은 완성도.

**모바일 대응: 10/10** — 턴제 카드 게임에 완벽히 적합한 탭 기반 UI. touchSafe 48px, touch-action:none, 뷰포트 설정, 입력 모드 자동 감지 모두 충실.
