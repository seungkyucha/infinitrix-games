---
cycle: 45
game-id: gem-siege
title: 젬 시즈
reviewer: claude-qa
date: 2026-03-28
round: 2
verdict: APPROVED
---

# 사이클 #45 QA 2차 리뷰 — 젬 시즈 (Gem Siege)

## 최종 판정: ✅ APPROVED

> 2차 리뷰 (플래너·디자이너 피드백 반영 후 회귀 테스트)
> 별도의 플래너/디자이너 피드백 문서 미확인 — 1차 코딩 완료 상태에서 기획 적합성 + 비주얼 품질 + 회귀 테스트 중점 확인

---

## 📌 1. 게임 시작 흐름 — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| 타이틀 화면 존재 | ✅ | 배경 에셋(판타지 왕국) + "젬 시즈" 금색 타이틀 + "탭 / Space로 시작" 버튼 + 떠다니는 보석 파티클 |
| SPACE/클릭으로 시작 | ✅ | `input.confirm()` → Space/Enter/탭 모두 대응. TITLE→WORLD_MAP 전환 확인 |
| 게임 상태 초기화 | ✅ | `initLevel()`: score=0, turnsLeft=def.turns+DDA, 가드 플래그 6종 전수 리셋, 보드 재생성 |

**브라우저 테스트**: HTTP 서버 기동 후 타이틀 화면 정상 렌더링. Space 입력 → WORLD_MAP 전환 확인. 레벨 선택 → LEVEL_INTRO → PLAY 진입 확인.

---

## 📌 2. 핵심 게임 루프 — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| requestAnimationFrame + delta time | ✅ | IX Engine의 `update(dt, ts)` 콜백 구조. dt 기반 Tween/Particles/BGM 갱신 |
| 매치 검출 우선순위 (5→T/L→4→3) | ✅ | `processMatches()`: used[][] 소비 추적, 상위 패턴 우선 소비 (V1 검증 패턴 유지) |
| 캐스케이드 루프 | ✅ | resolveMatches → clearCell → startCascade → settleCheck → (재매치 시) resolveMatches 체인. setTimeout 0건 (tween onComplete 콜백 100%) |
| 스왑 실패 시 원복 | ✅ | 매치 없으면 `swapTypes()` 역호출 + 역방향 `animateSwap()` |
| 데드록 감지 + 자동 셔플 | ✅ | `hasValidMove()` BFS + `doShuffle()` Fisher-Yates + 셔플 후 3매치 제거 + 재귀 안전 |
| 15초 무입력 강제 셔플 | ✅ | `updateStuckDetection()` — PLAY IDLE에서 15초 초과 시 자동 셔플 |

**브라우저 테스트**: 유효 스왑 4회 연속 실행 → 점수 증가(0→125→275), 턴 감소(25→24→21), 캐스케이드 완료 후 IDLE 복귀 확인. 매치 없는 스왑 시 원복 확인.

---

## 📌 3. 입력 처리 — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| preventDefault (Space/Arrow 등) | ✅ | IX Engine `Input` 클래스: `GAME_KEYS` 화이트리스트에 Space/Arrow/WASD 등록, keydown/keyup에서 `e.preventDefault()` |
| 터치 이벤트 등록 | ✅ | IX Engine: `touchstart/touchmove/touchend` + `e.preventDefault()` + `touch-action:none` CSS |
| 키보드 커서 + Space 선택/스왑 | ✅ | `handlePlayInput()`: ArrowUp/Down/Left/Right로 커서, Space/Enter로 선택+스왑 |
| 마우스 클릭 선택 + 드래그 스왑 | ✅ | `input.tapped` → 클릭 선택, `gDragging` + threshold(0.4 셀) → 드래그 스왑 |
| 터치 탭+탭 스왑 | ✅ | 터치 이벤트 시뮬레이션으로 (2,2) 선택 → (2,3) 스왑 시도 확인 |
| touchSafe 48px 최소 터치 영역 | ✅ | `touchSafe(size) = Math.max(48, size)` — 부스터 버튼에 적용 (V8 유지) |

**브라우저 테스트**: 키보드(Space) 선택 + Arrow 이동 + Space 스왑 동작 확인. Touch 이벤트 디스패치로 보석 선택/스왑 동작 확인.

---

## 📌 4. 상태 전환 + 화면 — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| TRANSITION_TABLE 화이트리스트 | ✅ | 8개 상태 간 허용 전환만 등록. 위반 시 `console.warn` + return false |
| `state =` 직접 할당 0건 | ✅ | `gState = to`는 오직 `enterState()` 내부에서만 (line 315). 외부에서 gState 직접 할당 0건 확인 (F2 해결) |
| beginTransition (페이드) | ✅ | 페이드아웃(200ms) → enterState → 페이드인(200ms) Tween 체인 |
| directTransition (즉시) | ✅ | TRANSITION_TABLE 검증 후 즉시 enterState |
| 컷신 자동 전환 | ✅ | LEVEL_INTRO(1.5s) → BOSS_INTRO/PLAY, BOSS_INTRO(2.5s) → PLAY, BOSS_DEFEAT(3s) → LEVEL_COMPLETE |

**브라우저 테스트**: TITLE→WORLD_MAP→LEVEL_INTRO→PLAY→PAUSE→PLAY→LEVEL_FAIL→LEVEL_INTRO→PLAY→BOSS_DEFEAT→LEVEL_COMPLETE→WORLD_MAP 전체 플로우 검증 완료. 모든 전환에서 에러 0건.

---

## 📌 5. 시각 효과 + 연출 — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| 에셋 로드 (manifest.json) | ✅ | 50개 에셋 전수 로드 성공. 프로그레스 바 연동 로딩 화면 |
| 에셋-코드 교차 검증 | ✅ | manifest의 모든 에셋(effectMatchBurst, effectComboText 포함)이 렌더링 코드에서 참조됨 (F1 해결) |
| Canvas 폴백 100% | ✅ | 모든 보석(6종 형태별), 장애물(6종), 스페셜(3종), 이펙트(7종)에 PNG 미로드 시 Canvas 폴백 존재 |
| 스프라이트 시트 애니메이션 | ✅ | 6색 보석 × 6프레임 반짝임 시트 + 이펙트 스프라이트 시트 3종 |
| 보스 인트로 컷신 | ✅ | 실루엣 줌인(300~800ms) → 이름 슬라이드(1000ms) → HP바 슬라이드(1400ms) → 번개 파티클(1700ms) |
| 보스 격파 컷신 | ✅ | 깜빡임(~1s) → 백색 플래시 폭발(1~1.4s) → VICTORY 스케일 바운스(1.4s) → 보석 비(2s) → 도감 카드 슬라이드(2.5s) |
| 독 타일 글로우 경고 | ✅ | 독 타일 위에 보라색 펄스 글로우 + 기포 파티클 |
| 턴 3이하 경고 플래시 | ✅ | `gTurnFlash` 기반 빨강↔주황 번갈아 표시 |
| 선택 펄스 글로우 | ✅ | `gSelectionPulse` sin 파동 기반 금색 글로우 |
| 힌트 시스템 | ✅ | 5초 무입력 → 유효 이동 셀에 금색 펄스 하이라이트 |
| 배경 캐시 | ✅ | offscreen canvas에 Normal/Boss 배경을 한 번 그린 후 drawImage로 재사용 |

**브라우저 테스트**: 보스 인트로 화면에서 보스 초상화(독 슬라임 왕) + HP바 800/800 + 약점 텍스트 + 보스 배경 확인. 보스 격파 후 승리 화면에서 별 3개 + Boss Bonus + 부스터 보상 표시 확인.

---

## 📌 6. localStorage / 진행 저장 — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| 최고점 저장/로드 | ✅ | `Save.setHighScore()` / `Save.get()` — IX Engine의 Save 래퍼 사용 |
| 레벨 별, 보스 도감, 부스터 저장 | ✅ | `saveProgress()`: stars, bossDefeated, maxUnlocked, boosters 4항목 |
| DDA failStreak 유지 | ✅ | 실패 시 `gDDA.onFail()` → failStreak++, 승리 시 `gDDA.onWin()` → 리셋 |
| 키 프리픽스 충돌 방지 | ✅ | `gem-siege_stars`, `gem-siege_bossDef` 등 게임별 접두사 |

---

## 📌 7. 기획 적합성 — PASS ✅

| 기획 항목 | 구현 상태 | 상세 |
|-----------|----------|------|
| 8×8 그리드 6색 매치3 | ✅ | GRID_ROWS=8, GRID_COLS=8, GEM_TYPES 6종 |
| 스페셜 보석 3종 | ✅ | 줄 파괴(line, 방향=직교), 폭탄(bomb, 3×3), 무지개(rainbow, 전체 색 제거) |
| 스페셜 조합 6종 | ✅ | `executeSpecialCombo()`: 줄+줄, 줄+폭탄, 폭탄+폭탄, 무지개+줄, 무지개+폭탄, 무지개+무지개 |
| 장애물 6종 (기존3+신규3) | ✅ | 얼음(1~2겹), 나무상자, 체인, 독 타일(확산), 텔레포터(쌍), 잠금석(색 지정) |
| 보스 5종 | ✅ | 독 슬라임 왕(HP 800), 얼음 마녀(1200), 체인 골렘(1600), 잠금 사신(2000), 카오스 드래곤(2800) |
| 보스 고유 반격 패턴 | ✅ | slimeCounter(독 추가), iceCounter(얼음 2겹), chainCounter(체인 3개/2턴), lockCounter(잠금석+색 셔플), dragonCounter(독+얼음+색 셔플) |
| 보스 약점 시스템 | ✅ | 독 슬라임(독 제거 시 ×2), 얼음 마녀(4매치+ ×2), 체인 골렘(스페셜 ×2), 잠금 사신(스페셜 조합 ×3), 카오스 드래곤(무지개 ×3) |
| 20레벨 (일반15+보스5) | ✅ | LEVEL_DEFS[20], 보스: 4/8/12/16/20 |
| 부스터 4종 | ✅ | 셔플, 색폭탄, 줄파괴, 실드(보스 반격 1턴 방어) |
| 보스 도감 메타 레이어 | ✅ | 도감 화면: 격파 보스 초상화+약점+배지, 미격파 보스 실루엣+???, 전체 격파 시 왕국 수호자 칭호 |
| DDA failStreak 기반 | ✅ | 2연패: 보스 HP -5%~20%, 3연패: 반격 1턴 딜레이, 4연패: 추가 턴 +2 |
| 다국어 ko/en | ✅ | LANG 객체 ko/en 32항목. `navigator.language` 자동 감지 |
| 별 평가 (1~3성) | ✅ | 보스 레벨: 잔여턴 8+→3성, 5+→2성, 일반: 6+→3성, 3+→2성 |
| Web Audio BGM 4트랙 | ✅ | title/puzzle/boss/victory — 절차적 합성, dt 기반 업데이트 (setInterval 0건) |
| SFX 10종+ | ✅ | swap, match, cascade, specialCreate, specialActivate, bossHit, bossCounter, bossEntrance, victory, fail, poison, combo, iceBreak, crateBreak, chainBreak, lockOpen = 16종 |
| SeededRNG (Math.random 0건) | ✅ | `rng()` 함수 기반, `Math.random()` 직접 호출 0건 확인 |
| 가드 플래그 4중 방어 | ✅ | gSwapLocked, gCascadeInProgress, gResolving, gGoalChecking + gPoisonSpreading, gBossCountering = 6중 방어 (V3 확장) |

---

## 📌 추가 확인: iframe 호환성

| 항목 | 결과 | 상세 |
|------|------|------|
| alert/confirm/prompt 사용 금지 | ✅ | 전체 코드에서 `alert()`, `confirm()`, `prompt()` 호출 0건 |
| 외부 CDN 의존 없음 | ✅ | Google Fonts 등 외부 리소스 0건. 시스템 폰트 사용 (`Segoe UI, system-ui, sans-serif`) |
| canvas 동적 리사이즈 | ✅ | IX Engine `onResize(w,h)` 콜백 + `recalcLayout()` — gCellSize 동적 계산 (28~80px 클램프) |
| devicePixelRatio 처리 | ✅ | IX Engine: `Math.min(dpr, 2)` 캡, 좌표 변환 시 dpr 보정 |

---

## 테스트 결과 요약

| 테스트 | 결과 | 비고 |
|--------|------|------|
| A: 로드+타이틀 | ✅ PASS | 에셋 50개 로드, 타이틀 정상 렌더링, 에러 0건 |
| B: Space 시작 | ✅ PASS | TITLE→WORLD_MAP→LEVEL_INTRO→PLAY 전환 정상 |
| C: 이동 조작 | ✅ PASS | 키보드 커서 이동 + Space 선택/스왑, 매치→점수→캐스케이드 정상 |
| D: 게임오버+재시작 | ✅ PASS | 턴 소진→LEVEL_FAIL 화면, R키 재시작→PLAY 복귀 (턴/점수 리셋) |
| E: 터치+보스+도감 | ✅ PASS | 터치 선택/스왑, 일시정지, 보스 인트로/격파 컷신, 도감 등록 전체 확인 |

---

## C44 피드백 반영 확인

| ID | C44 문제 | 해결 여부 | 확인 방법 |
|----|----------|----------|----------|
| F1 | 미참조 에셋 2건 | ✅ 해결 | effectMatchBurst → `renderEffects()` case 'matchBurst', effectComboText → case 'comboGlow'에서 참조 |
| F2 | state= 직접 할당 1건 | ✅ 해결 | `gState =` 패턴 grep → line 172(초기값), line 315(enterState 내부) = 오직 2건, 외부 직접 할당 0건 |
| F3 | 캐슬 복원 시각 연출 미흡 | ✅ 해결 | 보스 등장 컷신(실루엣 줌+이름 슬라이드+HP바+번개 파티클) + 격파 컷신(폭발+VICTORY+보석비+도감 카드) |
| F4 | 밸런스 미검증 | ✅ 해결 | LEVEL_DEFS 20레벨 수치 테이블 명시 + DDA 확장(bossHpReduction, bossCounterDelay, extraTurns) |

---

## 결론

젬 시즈는 기획서 §0~§8의 MVP 범위를 완전히 구현했습니다. 보스 배틀 매치3의 핵심 재미(전략적 스왑 + 보스 반격 + 스페셜 조합 + 캐스케이드 연쇄)가 코드 수준에서 검증되었고, Puppeteer 브라우저 테스트로 전체 게임 플로우(타이틀→월드맵→레벨 인트로→플레이→보스 인트로→보스 격파→레벨 완료→도감)를 실제 실행하여 확인했습니다. C44 피드백 4건 모두 반영 완료.

**배포 승인합니다.**
