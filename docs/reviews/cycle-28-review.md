---
game-id: neon-pulse
cycle: 28
round: 4
date: 2026-03-23
verdict: APPROVED
review-type: post-feedback
---

# 사이클 #28 코드 리뷰 (4회차 — 플래너·디자이너 피드백 반영 후 2차 리뷰) — 네온 펄스 (Neon Pulse)

## 게임 개요
- **장르**: arcade, casual (리듬 아케이드 로그라이트)
- **파일**: `public/games/neon-pulse/index.html` (3,288줄)
- **에셋**: assets/ 디렉토리 자체 미존재 (완전 삭제 확인 ✅)

---

## 🔄 3회차 이후 변경점 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 3회차 APPROVED 상태 유지 | ✅ 유지 | 신규 이슈 0건 |
| 2 | 플래너 피드백 반영 | ✅ 확인 | BPM tween 단일경로(F70), 스모크 게이트 14항목, REGION 10구조 |
| 3 | 디자이너 피드백 반영 | ✅ 확인 | 네온 글로우 시그니처, 존별 색상 팔레트, 순수 Canvas 렌더링 |
| 4 | 회귀 버그 없음 | ✅ 확인 | Puppeteer 실행 테스트로 전 흐름 검증 |

---

## 📌 1. 게임 시작 흐름 — ✅ PASS

- **BOOT→TITLE 전환**: L242 `ACTIVE_SYS[STATE.BOOT] = SYS.TWEEN|SYS.DRAW` → Puppeteer 검증: `state=1` 정상 도달 ✅
- **타이틀 화면**: drawTitle() — 글리치 이펙트, 서브타이틀, 플레이어 캐릭터, 하이스코어, 언어 토글 구현 ✅
- **시작 입력**: Space/Enter (L2786) + 화면 탭 (L2923) → `beginTransition(STATE.DIFFICULTY_SELECT)` ✅
- **난이도 선택**: 3단 (Beginner/DJ/Maestro) — 키보드 ↑↓ + Enter, 터치 탭 모두 지원 ✅
- **존 맵**: 해금된 존 표시 + 업그레이드 버튼 ✅
- **초기화**: `startNewRun()` (L2158) — HP, 콤보, 점수, 칩, 크리스탈, DDA 모두 초기화 ✅
- **Puppeteer 검증**: TITLE(1) → DIFFICULTY_SELECT(2) → ZONE_MAP(3) → PLAYING(5) 전환 성공 ✅

## 📌 2. 입력(조작) 시스템 — 데스크톱 — ✅ PASS

- **keydown/keyup**: L2762, L2774 — 등록 확인 ✅
- **이동/공격 키**: Space/↑/W → 비트 공격 (L2818-2821), ←/A → 좌회피 (L2823), →/D → 우회피 (L2824) ✅
- **코드 흐름**: keydown → handleKeyAction → handleBeatAttack → judgeInput → calcDamage → applyDamageToEnemy ✅
- **일시정지**: P/Escape (L2825-2829) → `beginTransition(STATE.PAUSE)` ✅
- **홀드**: keydown에서 `isHolding=true` (L2820), keyup에서 `isHolding=false` (L2778) → updateHoldBeats() 참조 ✅
- **마우스**: L3025 mousedown 별도 등록 ✅
- **브라우저 기본 동작 차단**: L2764 e.preventDefault() 적용 ✅

## 📌 3. 입력(조작) 시스템 — 모바일 — ✅ PASS

- **touchstart/touchmove/touchend**: L2881, L2894, L2898 — 등록 확인 ✅
- **터치 공격**: 화면 탭 → handleTouchStart → handleBeatAttack ✅
- **스와이프 회피**: touchend에서 dx ≥ 30px && elapsed ≤ 200ms → handleDodge ✅
- **일시정지 버튼**: 우상단, hitTest 사용 (L2957-2958) ✅
- **touch-action: none**: L9 ✅, overflow: hidden ✅
- **좌표 변환**: `inputToCanvas()` (L2493-2495) — `clientX - rect.left`, `clientY - rect.top` 정확 ✅
- **스크롤 방지**: touchstart/touchmove/touchend 모두 `e.preventDefault()` + `{ passive: false }` ✅
- **키보드 없이 전 조작 가능**: 타이틀 탭→난이도 탭→존 탭→플레이(탭+스와이프)→일시정지→칩선택→업그레이드→게임오버 탭 ✅

## 📌 4. 게임 루프 & 로직 — ✅ PASS

- **requestAnimationFrame**: L3213, L3280 `requestAnimationFrame(gameLoop)` ✅
- **delta time**: L3089-3090 `rawDt = timestamp - lastTime`, `dt = Math.min(rawDt, 33.33)` (30fps 하한) ✅
- **sys() 기반 시스템 활성화**: L3112-3125 ✅
- **충돌 감지**: 비트 타이밍 판정 기반 (judgeInput L1766) — 정확 ✅
- **점수 증가**: `calcScore()` → `G.score += scoreGain` ✅
- **난이도 변화**: 존별 BPM 범위 + 보스 페이즈별 BPM tween + DDA 3단계 ✅
- **홀드 비트 지속 대미지**: `updateHoldBeats()` (L1812) — holdDur/holdRatio/isHolding 연동 완전 ✅
- **더블 비트 2연타**: `doublePending` 상태 + 400ms 타이머 + 자동 Miss (L3049-3059) ✅
- **BPM tween 단일 경로**: G.bpm은 오직 tw.add()으로만 갱신, 직접 대입 0건 (F70) ✅
- **프로시저럴 BGM**: SoundManager.startBGM/updateBGM — audioCtx.currentTime 기반, setTimeout 0건 ✅

## 📌 5. 게임 오버 & 재시작 — ✅ PASS

- **게임 오버 조건**: `G.player.hp <= 0` → `onGameOver()` (L2372) ✅
- **게임 오버 화면**: `drawGameOver()` (L1357) — Puppeteer 스크린샷으로 확인 ✅
- **최고 점수 localStorage**: `finishRun()` → `saveSave()` (L2383-2397) ✅
- **재시작**: R키/Space/탭 → `tw.clearImmediate() + particles.clear() + G._transitioning=false + setState(STATE.TITLE)` ✅
- **REVERSE_ALLOWED 적용**: GAMEOVER(90)→TITLE(1) 허용 (L2119) ✅
- **상태 초기화**: startNewRun() (L2158-2185) — HP, 콤보, 점수, 칩, 크리스탈, 적, 비트 전부 초기화 ✅
- **Puppeteer 검증**: HP 0 → state=90 (GAMEOVER) 정상 전환 확인 ✅

## 📌 6. 화면 렌더링 — ✅ PASS

- **canvas 크기**: `resizeCanvas()` (L2478) — `window.innerWidth × innerHeight` 사용 ✅
- **devicePixelRatio**: L2479 dpr 적용, L2482-2483 canvas 크기 설정, L3094 `ctx.setTransform(dpr, ...)` ✅
- **resize 이벤트**: L3033 `window.addEventListener('resize', resizeCanvas)` ✅
- **렌더링**: 배경(drawBackground), 플레이어(drawPlayer), 적(drawEnemy), 보스(drawBoss), 비트레인(drawBeatLane), HUD(drawUI) 모두 순수 Canvas 구현 ✅
- **카메라 쉐이크**: L3097-3101 SeededRNG 기반 ✅
- **drawHitEffect**: L1660-1680 순수 Canvas 방사형 파티클 ✅
- **전환 페이드**: L3202-3205 `G._transAlpha` 오버레이 ✅
- **비트 펄스 오버레이**: L3252-3259 BPM 동기화 화면 펄스 ✅
- **Puppeteer 검증**: 400×600, 800×600 양쪽 해상도에서 정상 렌더링 확인 ✅

## 📌 7. 외부 의존성 안전성 — ✅ PASS

- **시스템 폰트 폴백**: `"Segoe UI", system-ui, sans-serif` — 전체 사용 ✅
- **외부 CDN 0건**: Google Fonts, 외부 스크립트 없음 ✅
- **에셋 코드 0건**: new Image() 0건, fetch() 파일 참조 0건 ✅
- **assets/ 디렉토리**: 존재하지 않음 (완전 삭제) ✅
- **Canvas 폴백**: 100% Canvas 프로시저럴 렌더링 ✅

---

## 📊 코드 품질 체크리스트

| 항목 | 결과 | 비고 |
|------|------|------|
| Math.random 0건 | ✅ PASS | SeededRNG만 사용 |
| setTimeout 0건 (호출) | ✅ PASS | 주석 2건만 존재, 실제 호출 0건 |
| alert/confirm/prompt 0건 | ✅ PASS | Canvas UI 전용 |
| eval() 0건 | ✅ PASS | |
| 외부 CDN 0건 | ✅ PASS | 시스템 폰트만 사용 |
| new Image() 0건 | ✅ PASS | |
| assets/ 디렉토리 | ✅ PASS | 디렉토리 자체 미존재 |
| devicePixelRatio | ✅ PASS | dpr 적용 |
| resize 이벤트 | ✅ PASS | resizeCanvas() |
| hitTest 단일 함수 (F16) | ✅ PASS | 12건 호출 |
| 터치 타겟 48px+ (F11) | ✅ PASS | Math.max(CONFIG.MIN_TOUCH, ...) |
| STATE×SYSTEM 매트릭스 (F7) | ✅ PASS | 16상태 전수 정의 |
| BPM tween 단일 경로 (F70) | ✅ PASS | 직접 대입 0건 |
| bossRewardGiven 가드 (F17) | ✅ PASS | L2177, L2193 |
| transAlpha 연결 | ✅ PASS | G._transAlpha 직접 tween+렌더 |
| REVERSE_ALLOWED 딕셔너리 | ✅ PASS | 11개 상태 전환 경로 커버 |
| BOOT→TITLE 전환 | ✅ PASS | ACTIVE_SYS[BOOT]에 SYS.TWEEN 포함 |
| 홀드 비트 완전 구현 | ✅ PASS | updateHoldBeats() + holdDur + holdRatio |
| drawHitEffect Canvas 폴백 | ✅ PASS | 방사형 파티클 구현 |
| try-catch 게임루프 보호 | ✅ PASS | L3088, L3209-3212 |
| 10 REGION 코드 구조 (F66) | ✅ PASS | CONFIG→ENGINE→ENTITY→DRAW→RHYTHM→COMBAT→ROGUE→STATE→SAVE→MAIN |

---

## 📱 모바일 조작 대응 검사

| 항목 | 결과 | 비고 |
|------|------|------|
| 뷰포트 meta 태그 | ✅ PASS | width=device-width, user-scalable=no |
| 키보드 없이 시작 가능 | ✅ PASS | 타이틀 탭 → 난이도 탭 → 존 탭 |
| 키보드 없이 플레이 가능 | ✅ PASS | 탭 = 공격, 스와이프 = 회피, 일시정지 버튼 |
| 키보드 없이 재시작 가능 | ✅ PASS | 게임오버 화면 탭 (L3013-3020) |
| 키보드 없이 칩 선택 가능 | ✅ PASS | 카드 영역 탭 (L2982-2985) |
| 키보드 없이 업그레이드 가능 | ✅ PASS | 트리 탭 + 뒤로가기 버튼 탭 (L2999-3010) |
| 키보드 없이 일시정지 탈출 가능 | ✅ PASS | Resume/Quit 버튼 탭 (L2972-2976) |
| 스크롤 방지 | ✅ PASS | touch-action:none, overflow:hidden, e.preventDefault() |
| 마우스 이벤트 별도 등록 | ✅ PASS | L3025 mousedown |

---

## 🎨 플래너 피드백 반영 검증

| 피드백 항목 | 반영 여부 | 코드 위치 |
|------------|----------|----------|
| F70: BPM tween 단일 경로 | ✅ 반영 | L1965, L2199 — tw.add()만 사용 |
| F66: 10 REGION 구조 유지 | ✅ 반영 | REGION 1~10 명확 분리 |
| F67: DPS/EHP 산식 + 칩 캡 | ✅ 반영 | CHIP_DPS_CAP(2.0), CHIP_SYNERGY_CAP(1.5) |
| F68: assets/ 0개 원칙 | ✅ 반영 | 디렉토리 자체 미존재 |
| F69: hitTest 단일 함수 | ✅ 반영 | L1133, 12건 호출 |
| F65: 스모크 테스트 14항목 | ✅ 반영 | 정적+동적 검증 전항목 PASS |
| F18: SeededRNG 완전 사용 | ✅ 반영 | Math.random 0건 |
| F4: setTimeout 0건 | ✅ 반영 | 호출 0건, 주석만 2건 |

## 🎨 디자이너 피드백 반영 검증

| 피드백 항목 | 반영 여부 | 코드 위치 |
|------------|----------|----------|
| 네온 글로우 라인 시그니처 | ✅ 반영 | drawPlayer 핑크 바이저+시안 헤드폰, 전체 글로우 |
| Synthwave 색상 팔레트 | ✅ 반영 | ZONE_COLORS[0] = ['#FF6EC7','#7B68EE','#FF69B4','#1A0033'] |
| 존별 차별화된 적 디자인 | ✅ 반영 | drawEnemy 존별 5종 (음표/스피커/카세트/드럼스틱/글리치) |
| 보스 턴테이블 디자인 | ✅ 반영 | drawBoss — 바이닐 홈, 톤암, 이퀄라이저 바 |
| 보스별 고유 장식 | ✅ 반영 | 크라운/스피커/노이즈/에너지링/글리치 (L884-916) |
| 순수 Canvas 렌더링 | ✅ 반영 | new Image() 0건, 100% 프로시저럴 |
| 비트 유형별 시각 차별화 | ✅ 반영 | 원형/더블/사각홀드/다이아회피/별보스 (L976-999) |

---

## 🌐 브라우저 테스트 (Puppeteer MCP)

| 항목 | 결과 | 비고 |
|------|------|------|
| 페이지 로드 | ✅ PASS | file:// 프로토콜 정상 로드 |
| 콘솔 에러 없음 | ✅ PASS | errors=0, warnings=0 |
| 캔버스 렌더링 | ✅ PASS | 400×600, 800×600 양쪽 확인 |
| BOOT→TITLE 전환 | ✅ PASS | state=1 확인 |
| 타이틀 화면 표시 | ✅ PASS | 글리치 타이틀 + DJ 캐릭터 + 시작 안내 |
| 언어 토글 | ✅ PASS | ko→en 클릭 전환 확인 |
| 난이도 선택 화면 | ✅ PASS | 3단 난이도 + 설명 표시 |
| 존 맵 화면 | ✅ PASS | Synthwave 존 + 업그레이드 버튼 |
| 게임 플레이 화면 | ✅ PASS | 플레이어/적/비트레인/HUD/판정표시/DDA 모두 렌더링 |
| 게임오버 화면 | ✅ PASS | 점수/최고점/콤보/크리스탈/재시작 안내 |
| 터치 이벤트 코드 존재 | ✅ PASS | touchstart/move/end + { passive: false } |
| 점수 시스템 | ✅ PASS | calcScore + G.score |
| localStorage 최고점 | ✅ PASS | SAVE_KEY + saveSave |

**Puppeteer 테스트 흐름**: BOOT → TITLE → (언어 토글 ko→en) → DIFFICULTY_SELECT → ZONE_MAP → STAGE_INTRO → PLAYING → GAMEOVER — **전 상태 전환 에러 없이 완료** ✅

---

## 최종 판정

### 코드 리뷰: APPROVED
### 테스트: PASS (Puppeteer MCP 실행 검증)

**이유**: 3회차 APPROVED 상태가 유지됨. 플래너 피드백(F65~F70) 전수 반영 확인. 디자이너 피드백(네온 글로우 시그니처, 존별 색상, 보스 디자인) 전수 반영 확인. Puppeteer MCP로 실제 브라우저에서 BOOT→TITLE→DIFFICULTY→ZONE→PLAYING→GAMEOVER 전 흐름 에러 없이 동작 확인. 회귀 버그 0건. 즉시 배포 가능.

### 전체 리뷰 사이클 요약:

| 회차 | 판정 | 주요 이슈 |
|------|------|----------|
| 1회차 | NEEDS_MAJOR_FIX | P0: STATE_PRIORITY 역방향 전환 차단, P1: assets/ 적극 참조, P2: 홀드 비트 미구현, P3: drawHitEffect 폴백 없음 |
| 2회차 | NEEDS_MAJOR_FIX | 1회차 4건 전부 수정 ✅, 신규 P0: BOOT→TITLE 전환 불가, P1: assets/ 물리 파일 잔존 |
| 3회차 | APPROVED | 2회차 2건 전부 수정 ✅. 신규 이슈 0건. |
| **4회차** | **APPROVED** | 플래너·디자이너 피드백 반영 확인 + Puppeteer 실행 검증. 회귀 버그 0건. |

### 긍정적 평가:
- Puppeteer MCP 실행 테스트로 실제 브라우저 동작 검증 완료 ✅
- BOOT→TITLE→DIFFICULTY→ZONE→PLAYING→GAMEOVER 전 상태 전환 에러 없음 ✅
- 콘솔 에러 0건, 경고 0건 ✅
- 400×600(모바일), 800×600(데스크톱) 양쪽 해상도 렌더링 정상 ✅
- 언어 토글(ko↔en) 실시간 전환 정상 ✅
- 플래너 피드백 F65~F70 전수 반영 ✅
- 디자이너 피드백 — 네온 글로우, 존별 색상, 보스 턴테이블, 적 5종 디자인 전수 반영 ✅
- assets/ 디렉토리 자체 미존재 — F1/F68 완전 준수 ✅
- 10 REGION 코드 구조로 3,288줄 코드 탐색성 확보 (F66) ✅
- DPS 캡(2.0) + 시너지 캡(1.5) + DDA 3단계 폴백 — 밸런스 안전 장치 (F67) ✅
- hitTest 단일 함수 12건 호출 (F16/F69) ✅
- SeededRNG 완전 사용, Math.random 0건 (F18) ✅
- setTimeout 0건, TweenManager + rAF 전용 (F4) ✅
- BPM tween 단일 경로 (F70) ✅
- 로그라이트 칩 13종 + 업그레이드 3트리 완성도 높음 ✅
- 프로시저럴 사운드(SoundManager) — 판정별, 콤보별, 보스별, 존별 차별화 ✅
