---
cycle: 44
game-id: royal-gem-chronicle
title: 로얄 젬 크로니클
reviewer: claude-qa
date: 2026-03-27
round: 2
verdict: APPROVED
---

# 사이클 #44 QA 2차 리뷰 — 로얄 젬 크로니클

## 최종 판정: ✅ APPROVED

> 2차 리뷰 (플래너·디자이너 피드백 반영 후 회귀 테스트)
> 별도의 플래너/디자이너 피드백 문서 미확인 — 1차 리뷰 APPROVED 상태에서 기존 기능 회귀 여부 중점 확인

---

## 📌 1. 게임 시작 흐름 — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| 타이틀 화면 존재 | ✅ | 캐슬 배경 이미지 + 6색 보석 라인업 + "게임 시작" 버튼 + "탭하며 시작" 안내 |
| SPACE/클릭으로 시작 | ✅ | `input.confirm()` → Space/Enter/탭 모두 대응. TITLE→CASTLE_MAP 전환 확인 |
| 게임 상태 초기화 | ✅ | `startLevel()`: score=0, turnsLeft=level.turns, 가드 플래그 전수 리셋, 보드 재생성 |

**브라우저 테스트**: Space 입력 → 캐슬맵 전환 확인. 레벨 1 탭 → LEVEL_INTRO → PLAY 화면 진입 확인. 점수 0, 턴 25로 초기화 확인.

---

## 📌 2. 입력 시스템 (데스크톱) — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| keydown/keyup 등록 | ✅ | IX Engine Input 클래스: window + document 양쪽 리스너 (iframe 호환) |
| 방향키 커서 이동 | ✅ | ArrowUp/Down/Left/Right → `cursorCell.r/c` 변경 → 점선 사각형 렌더링 |
| Space 선택/스왑 | ✅ | 첫 Space=선택(금색 하이라이트), 인접 이동 후 Space=스왑 실행 |
| ESC 일시정지 | ✅ | `directTransition(STATE.PAUSE)` → 일시정지 오버레이: "일시정지", "계속하기", "나가기" |
| e.preventDefault() | ✅ | `GAME_KEYS` Set에 Space/Arrow/Escape/Enter/R 등 포함, keydown에서 preventDefault 호출 |

**브라우저 테스트**: ESC → 일시정지 화면("일시정지", "계속하기", "나가기", "ESC / SPACE: 계속하기") 표시 확인. ESC 재입력 → 플레이 복귀 확인.

---

## 📌 3. 입력 시스템 (모바일) — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| touchstart/touchmove/touchend 등록 | ✅ | IX Engine Input: canvas에 3개 이벤트 등록, `{ passive: false }` 미명시이나 `e.preventDefault()` 호출 |
| 탭 스왑 | ✅ | tapped=true → tapX/tapY 설정 → screenToGrid → 선택/스왑 처리 |
| 드래그 스왑 | ✅ | mouseDown + mousemove → `threshold(cellSize*0.35)` 초과 시 인접 방향 스왑 |
| 터치 타겟 48px+ | ✅ | MIN_TOUCH=48 상수 정의, 부스터 버튼에 적용 |
| touch-action: none | ✅ | `html,body { touch-action: none }` + CSS `user-select: none` |
| 키보드 없이 전체 플레이 가능 | ✅ | 타이틀(탭) → 캐슬맵(탭) → 플레이(탭/드래그) → 결과(탭) → 재시작(탭) |

**브라우저 테스트**: 탭 시뮬레이션으로 보석 선택(1,3) → 인접(1,2) 탭 → 스왑 → 매치 발생 → 점수 0→50, 턴 25→24 확인.

---

## 📌 4. 게임 루프 & 로직 — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| requestAnimationFrame 루프 | ✅ | IX Engine: `requestAnimationFrame(loop)` + dt cap 33.33ms |
| delta time 프레임 독립 | ✅ | `const dt = Math.min(rawDt, 33.33)` → update(dt) → 모든 타이머/tween에 dt 전달 |
| 매치 검출 | ✅ | 우선순위: 5매치→T/L자→4매치→3매치, `used[][]` 배열로 소비 추적 (F9 해결) |
| 캐스케이드 루프 | ✅ | MATCH_RESOLVE→CASCADE→SETTLE→재매칭 체크, tween onComplete 체인 (F4: setTimeout 0건) |
| 점수 증가 | ✅ | 매치 발생 시 기본 점수 × 콤보 배율 → score += totalScore |
| 난이도 변화 | ✅ | 15레벨: 5→6색, 턴 감소(25→15), 장애물 증가, DDA 3연패 시 가중치 조정 |
| 초기 보드 검증 | ✅ | 3매치 없음 + 유효 이동 1개+ 검증 (최대 100회 시도, 초과 시 안전 패턴) (F10 해결) |

---

## 📌 5. 게임 오버 & 재시작 — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| 게임 오버 조건 | ✅ | `turnsLeft <= 0` + 목표 미달성 → `onLevelFail()` → LEVEL_FAIL 전환 |
| 게임 오버 화면 | ✅ | "실패..." 텍스트, "레벨 1", "점수: 100", "다시하기 (R)" + "나가기" 버튼 |
| 최고 점수 localStorage | ✅ | `Save.set(SAVE_KEY, saveData)` 확인. saveData에 failStreak, totalPlays 기록 |
| R키 재시작 | ✅ | `input.jp('KeyR')` → `doTransition(STATE.PLAY, () => startLevel(currentLevelIdx))` |
| 탭 재시작 | ✅ | 재시도 버튼 탭 → 동일 `doTransition` 경로 |
| 상태 완전 초기화 | ✅ | `startLevel()`: score=0, turnsLeft=25, 가드 플래그 전수 리셋, 새 보드 생성 |

**브라우저 테스트**: turnsLeft=0 설정 → 스왑 → state=5(LEVEL_FAIL) 전환 확인. "실패..." 화면 스크린샷 확인. R키 → state=3(PLAY), score=0, turnsLeft=25로 완전 초기화 + 새 보드 생성 확인.

---

## 📌 6. 화면 렌더링 — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| canvas window.innerWidth/Height | ✅ | IX Engine: `this.W = window.innerWidth; this.H = window.innerHeight` |
| devicePixelRatio | ✅ | `this.dpr = Math.min(window.devicePixelRatio \|\| 1, 2)` → canvas.width × dpr |
| resize 이벤트 | ✅ | `window.addEventListener('resize', () => this.resize())` → `recalcGrid()` |
| 배경/보석/UI 렌더링 | ✅ | 타이틀(캐슬 배경+보석+버튼), 캐슬맵(배경+레벨 노드), 플레이(HUD+그리드+부스터), 결과(점수+버튼) |

**브라우저 테스트**: 480×640 뷰포트에서 모든 요소 정상 렌더링. 에셋(보석 PNG 6개, 배경 PNG 2개, UI 패널 PNG) 모두 로드 확인. gridX=24, gridY=104, cellSize=54로 8×8 그리드 정확히 배치.

---

## 📌 7. 외부 의존성 안전성 — PASS ✅

| 항목 | 결과 | 상세 |
|------|------|------|
| 외부 CDN 없음 | ✅ | Google Fonts/CDN 미사용. `@import`/`@font-face` 없음 |
| 시스템 폰트 폴백 | ✅ | IX Engine 내부 시스템 폰트 사용 |
| 에셋 로드 실패 시 폴백 | ✅ | 모든 보석/장애물/배경에 Canvas 폴백 드로잉 구현 |
| manifest.json 동적 로드 | ✅ | `fetch('assets/manifest.json')` + catch → `assetsLoaded = false` 시 폴백 |

---

## 📱 모바일 조작 대응 — PASS ✅

| 항목 | 결과 |
|------|------|
| viewport meta | ✅ `width=device-width,initial-scale=1.0,user-scalable=no` |
| 키보드 없이 전체 기능 | ✅ 탭/드래그 스왑, 부스터 버튼 탭, 결과 화면 탭 |
| 가상 컨트롤러 위치 | ✅ 부스터 패널이 그리드 하단에 배치, 게임 영역 미가림 |
| 스크롤 방지 | ✅ `touch-action:none; overflow:hidden; user-select:none` |

---

## 🔍 에셋 검증

| 에셋 | 파일 존재 | 로드 확인 | 폴백 |
|------|-----------|-----------|------|
| gem-ruby~diamond (6개) | ✅ | ✅ 타이틀+플레이 화면 | ✅ 원형 그라디언트 |
| special-line-h/v, bomb, rainbow (4개) | ✅ | ✅ 오버레이 렌더링 | ✅ 화살표/원/무지개 |
| obstacle-ice, crate, chain (3개) | ✅ | ✅ Lv3+ 장애물 | ✅ 반투명/사각형/선 |
| bg-castle, bg-play (2개) | ✅ | ✅ 배경 블렌딩 | ✅ 그라디언트 |
| effect-match-burst, combo-text (2개) | ✅ | 코드 내 미참조* | ✅ 파티클/텍스트 |
| ui-booster-panel, goal-panel (2개) | ✅ | ✅ HUD/부스터 | ✅ roundRect |
| thumbnail.png | ✅ | N/A (플랫폼용) | N/A |
| manifest.json | ✅ | ✅ 동적 로드 | ✅ catch 처리 |

*effect-match-burst, effect-combo-text: manifest에 등록되어 로드되지만, 렌더링에서 직접 sprites 참조 대신 파티클/텍스트 시스템 사용. 기능적 문제 없음.

---

## 🏗️ 상태 전환 테이블 검증 (F12)

```
TRANSITION_TABLE 정의:
  TITLE          → [CASTLE_MAP]                     ✅
  CASTLE_MAP     → [LEVEL_INTRO, TITLE]             ✅
  LEVEL_INTRO    → [PLAY]                           ✅ (타이머 자동)
  PLAY           → [LEVEL_COMPLETE, LEVEL_FAIL, PAUSE] ✅
  LEVEL_COMPLETE → [CASTLE_MAP]                     ✅
  LEVEL_FAIL     → [CASTLE_MAP, PLAY]               ✅ (R키 재시작)
  PAUSE          → [PLAY, CASTLE_MAP]               ✅ (Resume/Quit)
```

- `doTransition()`: TRANSITION_TABLE 검증 + 페이드 IN/OUT (tween 기반)
- `directTransition()`: TRANSITION_TABLE 검증 + 즉시 전환 (일시정지 해제)
- **STATE_PRIORITY 버그 없음**: TRANSITION_TABLE 화이트리스트 방식으로 완벽 해결 (F12)

---

## 🎮 브라우저 테스트 결과 요약 (2차)

| 테스트 | 결과 | 비고 |
|--------|------|------|
| A: 로드+타이틀 | ✅ PASS | 타이틀 완벽 렌더링, 에셋 로드 성공, 콘솔 에러 0건 |
| B: Space 시작 | ✅ PASS | TITLE→CASTLE_MAP 전환, 레벨 1 탭→PLAY. 점수 0, 턴 25 초기화 |
| C: 보석 스왑 조작 | ✅ PASS | 탭 스왑 매치 → score 0→50, turns 25→24 확인 |
| D: 일시정지+게임오버+재시작 | ✅ PASS | ESC→일시정지 오버레이→ESC 해제. 턴 소진→"실패..." 화면→R키→완전 초기화 |
| E: 터치 동작 | ✅ PASS | 탭 선택 → 인접 탭 스왑 → 매치 발생 + 점수 증가 확인 |

---

## 📝 2차 리뷰 소견

### 회귀 테스트 결과
1차 리뷰 APPROVED 이후 코드 변경에 의한 회귀 없음. 모든 핵심 기능(스왑, 매칭, 캐스케이드, 일시정지, 게임오버, 재시작)이 정상 작동 확인.

### 플래너 피드백 반영 여부
별도의 플래너 피드백 문서가 확인되지 않았으나, 기획서(cycle-44-spec.md) 대비 구현 적합성 검증:
- ✅ 8×8 그리드 6색 보석 스왑 매칭
- ✅ 스페셜 보석 3종 + 조합 폭발 (§2.3, §2.4)
- ✅ 캐스케이드 루프 (§5.1)
- ✅ 15개 레벨 시스템 (턴 제한 + 다양한 목표) (§6)
- ✅ 장애물 3종 (얼음/상자/체인) (§2.5)
- ✅ 별 평가, 부스터 3종 (§6.2, §6.4)
- ✅ 캐슬 복원 메타 레이어 (§8)
- ✅ Web Audio BGM + 효과음 (§9)
- ✅ 다국어 ko/en (§1)

### 디자이너 피드백 반영 여부
별도의 디자이너 피드백 문서가 확인되지 않았으나, 비주얼 품질 검증:
- ✅ 타이틀: 캐슬 배경 이미지 + 보석 라인업 + 금색 버튼 — 프리미엄 캐주얼 분위기
- ✅ 캐슬맵: 배경 + 레벨 노드(해금/잠금) + CP 진행바 — Royal Match 스타일
- ✅ 플레이: HUD(레벨/점수/턴) + 8×8 보석 그리드 + 하단 부스터 — 가독성 우수
- ✅ 게임오버: 깔끔한 다크 배경 + "실패..." + 점수 + 버튼 — 명확한 UX
- ✅ 일시정지: 반투명 오버레이 + 버튼 2개 + 하단 안내 — 직관적

### 우수 사항
1. **TRANSITION_TABLE 화이트리스트**: STATE_PRIORITY 재발 방지 최적 설계
2. **매치 검출 우선순위**: 5매치→T/L→4매치→3매치 + 소비 추적 완벽 (F9)
3. **캐스케이드 tween 체인**: setTimeout 0건 (F4)
4. **에셋 폴백 100%**: 20개 에셋 모두 Canvas 폴백
5. **가드 플래그 4중**: swapLocked, cascadeInProgress, resolving, goalChecking (F5)
6. **DDA**: 3연패 시 목표색 가중, failStreak 기록 확인
7. **다국어 ko/en**: `t()` 함수 + 시스템 언어 자동 감지
8. **IX Engine 통합**: Input/Tween/Particles/Sound/Save/AssetLoader 정상 활용

### 경미한 개선 사항 (배포에 영향 없음)
- `effect-match-burst.png`, `effect-combo-text.png`가 manifest에 로드되지만 렌더링 코드에서 직접 참조되지 않음 (낭비이나 에러 아님)
- LEVEL_INTRO→PLAY 전환이 `state = STATE.PLAY` 직접 할당 (TRANSITION_TABLE 미경유). 기능적 문제 없으나 일관성 측면에서 `directTransition(STATE.PLAY)` 권장

---

## 결론

**APPROVED**. 2차 리뷰에서 1차 리뷰 이후 회귀 없음을 확인했습니다. 매치3 퍼즐의 핵심 메카닉(스왑, 매칭, 캐스케이드, 스페셜 보석, 장애물)이 완벽히 구현되었고, 15개 레벨 + 캐슬 복원 메타 레이어까지 갖추었습니다. 기획서 대비 모든 MVP 요구사항이 충족되었으며, 비주얼 품질도 프리미엄 캐주얼 수준을 달성했습니다. 브라우저 테스트 5종 모두 PASS, 콘솔 에러 0건, localStorage 세이브 정상 작동 확인.
