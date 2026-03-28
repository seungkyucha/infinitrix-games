---
game-id: gem-kingdom-builder
cycle: 50
reviewer: Claude QA
date: 2026-03-28
verdict: APPROVED
review-round: 2
previous-verdict: NEEDS_MAJOR_FIX
fixes-verified: 3
---

# Cycle #50 — 보석 왕국 건설기 (Gem Kingdom Builder) QA 리뷰 (2회차)

## 요약

매치3 + 왕국 건설 메타게임. 8×8 그리드, 6색 보석, 장애물 10종, 스페셜 4종, 부스터 4종, 30레벨 5구역, 일일 챌린지, 주간 경쟁, 다국어(ko/en) 지원. PNG 에셋 67개 + manifest.json 기반 로드. 총 3,204줄.

**2회차 재리뷰: 1회차에서 발견된 CRITICAL 3건의 수정이 모두 유지됨을 확인. 추가 문제 없음.**

---

## 1회차 CRITICAL 버그 수정 검증 (3건 모두 ✅)

### BUG-1: gBgCache TDZ — ✅ 수정 유지 확인
- **라인 370**: `let gBgCache = null;` — Engine 생성자(라인 372) **이전에** 선언됨
- **검증**: 게임 로드 시 에러 0건, 타이틀 화면 정상 렌더링

### BUG-2: input.flush() 타이밍 — ✅ 수정 유지 확인
- **라인 1755~1757**: coreUpdate의 finally 블록은 비어 있음 (주석만 존재)
- **라인 1823**: `input.flush()`가 coreRender 마지막에 배치됨
- **검증**: TITLE→KINGDOM_MAP→LEVEL_MAP 전환에서 클릭/키보드 입력 모두 정상 동작

### BUG-3: LEVEL_FAIL → PLAY 재시작 미초기화 — ✅ 수정 유지 확인
- **라인 505~507**: `gPrevState === STATE.LEVEL_FAIL` 조건에서 `initLevel(gLevel)` 호출
- **검증**: LEVEL_FAIL 후 R키 재시작 → score=0, turns=25, combo=0, 보드 재생성 확인. **무한 루프 없음.**

---

## 브라우저 테스트 결과 (Puppeteer)

| 테스트 | 결과 | 비고 |
|--------|------|------|
| A: 로드+타이틀 | **PASS** | 에러 0건, 타이틀 화면 정상 (보석 왕국 건설기 + 왕 캐릭터 + 보석 6색 장식 + 일일챌린지/효과음 버튼) |
| B: Space 시작 | **PASS** | TITLE→KINGDOM_MAP 전환 (구역 노드 5개 + "레벨 1" 버튼 + "타이틀로"/"일일 챌린지" UI) |
| C: 레벨 진입+보드 조작 | **PASS** | KINGDOM_MAP→LEVEL_MAP→LEVEL_INTRO→PLAY 전환, 스왑 후 score=75/turns=24 변화 확인 |
| D: 일시정지+게임오버+재시작 | **PASS** | ESC→PAUSED(계속/타이틀로/효과음 ON)→PLAY 복귀, LEVEL_FAIL 화면(왕 슬픈 표정+재시도+왕국 버튼) 정상, R키 재시작 score=0/turns=25/combo=0 완전 초기화 |
| E: 터치 동작 | **PASS** | TouchEvent → input.tapped=true, tapX/tapY 정상 변환 (400, 300) |

---

## 정적 코드 리뷰

### 📌 1. 게임 시작 흐름 — PASS
- [x] 타이틀 화면 존재 (renderTitle, 라인 1838)
- [x] Space/Enter/클릭/터치로 시작 (input.confirm() → beginTransition(KINGDOM_MAP))
- [x] 초기화: gScore=0, gTurns=gMaxTurns, gCombo=0, 보드 생성, 목표 설정 (initLevel, 라인 773)

### 📌 2. 입력 시스템 — 데스크톱 — PASS
- [x] keydown/keyup 리스너 (IX Engine Input, window+document 양쪽)
- [x] e.preventDefault() — GAME_KEYS (IX Engine 제공)
- [x] 보드 드래그 스왑 (handleBoardInput → mouseDown + SWAP_THRESHOLD=25px, 라인 1311~1353)
- [x] ESC/P 일시정지 (input.jp('Escape') || input.jp('KeyP'), 라인 2846)
- [x] 부스터 키보드 선택 (Digit1~4, 라인 2812~2816)
- [x] R키/Space/Enter 재시작 (renderLevelFail, 라인 2959~2971)

### 📌 3. 입력 시스템 — 모바일 — PASS
- [x] touchstart/touchmove/touchend 등록 (IX Engine, passive:false)
- [x] 터치 좌표 변환 (toCanvasCoords — getBoundingClientRect 기반)
- [x] MIN_TOUCH = 48px + touchSafe() 래퍼 (라인 1670)
- [x] touch-action: none (CSS body, 라인 9)
- [x] overflow: hidden (CSS body, 라인 9)
- [x] user-select: none (CSS body, 라인 9)
- [x] 가상 조이스틱 불필요 (매치3 — 드래그 스왑 기반)

### 📌 4. 게임 루프 & 로직 — PASS
- [x] rAF 기반 게임 루프 (IX Engine)
- [x] dt 기반 프레임 독립 업데이트 (coreUpdate, 라인 1675)
- [x] 매치 검출 우선순위: 5매치 → T/L → 4매치 → 3매치 + consumed[][] 소비 추적 (findAllMatches, 라인 642)
- [x] 캐스케이드: doGravity → 재매칭 → tween 콜백 체인 (라인 1207~1222)
- [x] 스페셜 조합 6종 (LINE+LINE, LINE+BOMB, BOMB+BOMB, RAINBOW+X) (executeSpecialCombo, 라인 1393)
- [x] 장애물 처리 10종 (얼음 1~3, 체인, 상자, 독, 돌, 커튼, 젤리, 파이) (processObstacleAdjacentMatch, 라인 1040)
- [x] 점수 증가 (base × combo 보정 + 구역 보너스, 라인 904~914)
- [x] DDA: failStreak 기반 보너스 턴 + 목표 감소 (3/5/8회 단계별, 라인 781~785)
- [x] SeededRNG 전수 사용 — Math.random() 호출 0건 ✅

### 📌 5. 게임 오버 & 재시작 — PASS
- [x] 턴 소진 (gTurns <= 0) → LEVEL_FAIL (finishCascade, 라인 1250)
- [x] 목표 달성 → LEVEL_CLEAR (finishCascade, 라인 1244)
- [x] 독 보드 가득 → LEVEL_FAIL (spreadPoison, 라인 1122)
- [x] R키/탭/Space/Enter 재시작 (renderLevelFail, 라인 2959~2971)
- [x] 킹덤맵 복귀 버튼 (라인 2964)
- [x] 재시작 시 initLevel() 호출 → 완전 초기화 (score=0, turns=max, combo=0, 보드 재생성)
- [x] localStorage 세이브/로드 (try-catch 래핑, 라인 388~421)
- [x] bestScore, stars, cleared Set 저장

### 📌 6. 화면 렌더링 — PASS
- [x] canvas 크기 = window.innerWidth × innerHeight (IX Engine)
- [x] devicePixelRatio 적용 (IX Engine ctx.setTransform)
- [x] resize 이벤트 → gBgCache 무효화 + 보드 레이아웃 재계산 (onResize, 라인 375)
- [x] 배경: 구역별 PNG 에셋 + Canvas 폴백 (drawAssetOrFallback, 라인 3136)
- [x] 보석: 6색 PNG + drawGemFallback + idle 스프라이트 애니메이션 (라인 203~206)
- [x] 이펙트 시퀀스 시스템: 6종 스프라이트 시트 애니메이션 (라인 207~250)
- [x] UI: HUD(턴/점수/목표), 부스터바, 콤보 텍스트, 페이드 전환

### 📌 7. 외부 의존성 안전성 — PASS
- [x] 외부 CDN 0건 ✅
- [x] font-family: 'Segoe UI', system-ui, -apple-system, sans-serif (라인 35)
- [x] drawAssetOrFallback() — 모든 에셋에 Canvas 폴백 함수 제공
- [x] manifest.json fetch 실패 시 console.warn + 폴백 모드 (라인 3174)
- [x] alert()/confirm()/prompt()/window.open() 사용 0건 ✅
- [x] function 선언문 오버라이드 0건 (F1 수정 유지) ✅

### 📌 8. 진행 불가능(Stuck) 상태 — PASS

**8-1. TITLE 화면:**
- [x] ACTIVE_SYSTEMS: input=true, tween=true (라인 133)
- [x] Space/Enter/클릭/터치 → KINGDOM_MAP (input.confirm())
- [x] 일일 챌린지 버튼, 효과음 토글 버튼 존재

**8-2. KINGDOM_MAP:**
- [x] 구역 노드 클릭 → LEVEL_MAP (라인 2144~2156)
- [x] "레벨 N" 버튼 → LEVEL_MAP (라인 2136~2139)
- [x] 뒤로 가기 → TITLE (라인 2123~2125)
- [x] 일일 챌린지 버튼 → DAILY_CHALLENGE (라인 2130)

**8-3. LEVEL_MAP:**
- [x] 레벨 노드 클릭 → LEVEL_INTRO (라인 2265~2276, 해금 조건 확인)
- [x] 뒤로 가기 → KINGDOM_MAP (라인 2260~2262)

**8-4. LEVEL_INTRO:**
- [x] 1.5초 자동 전환 → PLAY (gLevelIntroTimer > 1500, 라인 1730~1733)
- [x] 입력 비활성 (ACTIVE_SYSTEMS.input = false, 라인 136) — 대기 전용

**8-5. PLAY — 데드락:**
- [x] 유효 이동 없음 → doShuffle() 자동 셔플 (라인 1256~1258)
- [x] 15초 stuck → 자동 셔플 (gStuckTimer > 15000, 라인 1713~1715)
- [x] 셔플 반복 실패 → 보드 전체 재생성 (라인 1299~1301)
- [x] SPEED_RUN 일일 챌린지: 시간 초과 → LEVEL_FAIL (라인 1722~1723)

**8-6. LEVEL_CLEAR:**
- [x] 탭/Space/Enter → BUILD_SELECT (별 획득 시) 또는 KINGDOM_MAP

**8-7. LEVEL_FAIL:**
- [x] R키/탭/Space/Enter → PLAY (재시도, initLevel 포함, 라인 2959~2971)
- [x] 킹덤맵 버튼 → KINGDOM_MAP (라인 2964~2966)

**8-8. BUILD_SELECT:**
- [x] 3택 카드 클릭 → 선택
- [x] 확인 버튼/Enter → BUILD_ANIM (라인 3050)
- [x] 스킵 버튼 → KINGDOM_MAP (라인 3059~3061)

**8-9. BUILD_ANIM:**
- [x] 자동 완료 → KINGDOM_MAP (tween onComplete)

**8-10. PAUSED:**
- [x] ESC/P → PLAY 재개 (라인 2846~2848)
- [x] 계속 버튼 → PLAY
- [x] 타이틀로 버튼 → KINGDOM_MAP
- [x] SFX 토글 버튼 (라인 2839~2842)

**8-11. DAILY_CHALLENGE:**
- [x] initDailyChallenge → deferred PLAY 전환
- [x] TRANSITION_TABLE: DAILY_CHALLENGE → [PLAY, KINGDOM_MAP]

---

## 에셋 로딩 검증

- manifest.json: 67개 에셋 정의 ✓
- assets/ 디렉토리: 67개 PNG 파일 + manifest.json = 68 파일 ✓
- Puppeteer 로드 테스트: assets.sprites 67개 로드, 에러 0건 ✓
- drawAssetOrFallback(): 모든 에셋 참조에 Canvas 폴백 제공 ✓
- idle 스프라이트 시트 6개 (보석별 4프레임 애니메이션) ✓
- 이펙트 시퀀스 스프라이트 시트 6개 (매치/폭탄/레인보우/건설/해금) ✓

---

## 모바일 조작 대응

- [x] viewport meta: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no` (라인 5)
- [x] 키보드 없이 전 기능 가능: 모든 화면에 탭/클릭 대응
- [x] 터치 타겟 48px+ (touchSafe 래퍼, MIN_TOUCH=48)
- [x] 드래그 스왑 (SWAP_THRESHOLD = 25px)
- [x] 부스터 하단 바 탭 선택

---

## TRANSITION_TABLE 검증 (12상태)

| From | Allowed To | 코드 내 호출 확인 |
|------|-----------|------------------|
| BOOT | TITLE | enterState(TITLE) in gameInit ✓ |
| TITLE | KINGDOM_MAP | renderTitle input.confirm ✓ |
| KINGDOM_MAP | LEVEL_MAP, BUILD_SELECT, DAILY_CHALLENGE, TITLE | handleKingdomInput ✓ |
| LEVEL_MAP | LEVEL_INTRO, KINGDOM_MAP | renderLevelMap 입력 ✓ |
| LEVEL_INTRO | PLAY | coreUpdate 타이머 (1500ms) ✓ |
| PLAY | PAUSED, LEVEL_CLEAR, LEVEL_FAIL | ESC/finishCascade ✓ |
| PAUSED | PLAY, LEVEL_MAP, KINGDOM_MAP | renderPauseOverlay ✓ |
| LEVEL_CLEAR | BUILD_SELECT, LEVEL_MAP, KINGDOM_MAP | renderLevelClear ✓ |
| LEVEL_FAIL | PLAY, LEVEL_MAP, KINGDOM_MAP | renderLevelFail ✓ |
| BUILD_SELECT | BUILD_ANIM, KINGDOM_MAP | renderBuildSelect ✓ |
| BUILD_ANIM | KINGDOM_MAP, LEVEL_MAP | startBuildAnim ✓ |
| DAILY_CHALLENGE | PLAY, KINGDOM_MAP | initDailyChallenge ✓ |

---

## C49 문제 해결 검증 (F1~F5)

| ID | 문제 | 해결 상태 |
|----|------|----------|
| F1 | 함수 호이스팅 버그 | ✅ `function` 선언문 0건 — 모든 함수가 `const f = () =>` 또는 `const f = (args) => {}` 형태 |
| F2 | 18상태 과잉 복잡도 | ✅ 12상태로 축소 (이벤트 2종: 일일 챌린지 + 주간 경쟁) |
| F3 | renderMap 이중 오버라이드 | ✅ renderKingdomMap / renderLevelMap / renderPlay 명확 분리 |
| F4 | 런타임 검증 부재 | ✅ console.log 기반 자가 검증, Puppeteer 전수 테스트 |
| F5 | 오버라이드 비일관성 | ✅ 오버라이드 패턴 0건 — 기능 분기는 switch/if로 처리 |

---

## 기획 적합성 (플래너 피드백 반영)

- [x] 왕국 건설 메타 시스템: 5구역 × 6레벨 = 30레벨 (LEVEL_DATA, 라인 275~317)
- [x] 별 1~3개 획득 + 건물 3택 선택 (BUILD_SELECT 상태)
- [x] 구역 완성 시 패시브 보너스 (ZONE_BONUSES, 라인 343~349)
- [x] 일일 챌린지 8종 규칙 (DAILY_RULES, 라인 354)
- [x] 주간 건설 경쟁 AI 3명 (WEEKLY_AI, 라인 361~365)
- [x] 다국어 ko/en 완비 (LANG 객체, 라인 51~82)

## 비주얼 품질 (디자이너 피드백 반영)

- [x] PNG 에셋 67개 — 보석/장애물/UI/배경/캐릭터/이펙트 전수 제공
- [x] idle 스프라이트 애니메이션 (4프레임 × 6색)
- [x] 이펙트 시퀀스 6종 (매치폭발/폭탄/레이저/레인보우/건설완료/구역해금)
- [x] 왕 캐릭터 3종 (기본/기쁨/슬픔) — 상황별 감정 표현
- [x] 구역별 고유 배경 5종 (성문/정원/시장/도서관/왕좌실)
- [x] 콤보 텍스트 (Good→Great→Awesome→INCREDIBLE) + 화면 흔들림
- [x] 페이드 전환 + tween 애니메이션 전수 적용

---

## 최종 판정

### **APPROVED** ✅

1회차에서 발견된 CRITICAL 버그 3건의 수정이 모두 유지됨을 코드 및 브라우저 테스트로 확인했습니다.
📌 1~8 전체 항목 PASS. 모바일 조작 가능. C49 문제 F1~F5 전수 해결 확인. 추가 문제 없음. 배포 승인.

| # | 이전 버그 | 수정 상태 | 재리뷰 검증 |
|---|----------|----------|-----------|
| 1 | gBgCache TDZ | ✅ 수정 완료 | ✅ 라인 370에서 선행 선언 확인 |
| 2 | input.flush() 타이밍 | ✅ 수정 완료 | ✅ coreRender 마지막(라인 1823)에서 호출 확인 |
| 3 | LEVEL_FAIL 재시작 미초기화 | ✅ 수정 완료 | ✅ Puppeteer 재시작 테스트 score=0/turns=25 확인 |
