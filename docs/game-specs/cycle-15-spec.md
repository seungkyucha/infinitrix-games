---
game-id: gem-match-blitz
title: 보석 매치 블리츠
genre: puzzle
difficulty: medium
---

# 보석 매치 블리츠 — 상세 기획서

_사이클 #15 | 작성일: 2026-03-22_

---

## §0. 이전 사이클 피드백 반영 매핑

> Cycle 14 포스트모템 "아쉬웠던 점" + platform-wisdom 누적 교훈(14사이클)을 기획 단계에서 선제 대응한다.

| # | 출처 | 문제 | 이번 기획서 해결 방법 | 해당 섹션 |
|---|------|------|----------------------|-----------|
| F1 | Cycle 13~14 | `CONFIG.MIN_TOUCH_TARGET` 선언-구현 괴리 | 모든 버튼·셀 크기 = `CONFIG.MIN_TOUCH_TARGET` **직접 참조**. `touchSafe()` 유틸로 48px 하한 강제 | §4, §12.3 |
| F2 | Cycle 13~14 | SoundManager setTimeout 잔존 | Web Audio `ctx.currentTime + offset` 네이티브 스케줄링만 허용. setTimeout **0건** 목표 | §9, §12.5 |
| F3 | Cycle 14 wisdom | canvas 이벤트 리스너 init() 외부 등록 → TypeError | **모든 이벤트 리스너는 init() 내부에서만 등록.** DOM 할당 전 DOM 접근 원천 차단 | §5, §12.1 |
| F4 | Cycle 12~14 | 터치 타겟 높이 미달 (48×36px) | 버튼 크기를 너비·높이 **독립적으로** `CONFIG.MIN_TOUCH_TARGET` 이상 보장 | §4.7, §12.3 |
| F5 | Cycle 11/14 | let/const TDZ 크래시 + 초기화 순서 오류 | 변수 선언 → DOM 할당 → 이벤트 등록 → init() 순서 명시. §12.1 초기화 순서 체크리스트 | §5, §12.1 |
| F6 | Cycle 1~14 | assets/ 디렉토리 재발 (14사이클 연속) | **빈 index.html에서 시작.** assets/ 디렉토리 절대 생성 금지. 100% Canvas + Web Audio | §8, §12.6 |
| F7 | Cycle 2 | 상태×시스템 매트릭스 누락 | §6에 전체 상태×시스템 매트릭스 선행 작성 | §6 |
| F8 | Cycle 3/4 | 가드 플래그 누락 → 콜백 반복 호출 | 연쇄 처리 시 `isResolving` 가드 + TransitionGuard 패턴 적용 | §5.4, §6.2 |
| F9 | Cycle 2/5 | setTimeout 상태 전환 | tween onComplete 콜백으로만 상태 전환. setTimeout 사용 완전 금지 | §5, §12.5 |
| F10 | Cycle 5 | beginTransition() 우회 직접 전환 | 모든 화면 전환은 beginTransition() 경유 필수. PAUSED만 예외 허용 | §6.2 |
| F11 | Cycle 7/8 | 기획서 수치 ↔ 코드 수치 불일치 | §13 수치 정합성 검증 테이블 필수 포함 | §13 |
| F12 | Cycle 6/7 | 전역 참조 함수 → 테스트 불가 | 순수 함수 패턴 — 모든 게임 로직 함수는 파라미터로 데이터 수신 | §10 |
| F13 | Cycle 10 | 게임 루프 try-catch 미적용 | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` 기본 적용 | §5.3, §12.4 |
| F14 | Cycle 14 포스트모템 제안1 | Match-3 기획서 이미 완성 — 직접 활용 | gem-match-blitz로 구현. 8×8 그리드, 연쇄 폭발, 특수 보석 3종, 30 스테이지 | §1 |
| F15 | Cycle 14 포스트모템 제안2 | 스모크 테스트 3단계 자동화 | 리뷰 제출 전: (1) index.html 존재 (2) 페이지 로드 (3) 콘솔 에러 0건 | §12.7 |
| F16 | Cycle 10 | 수정 회귀 (render 시그니처 변경) | 수정 시 전체 플로우 회귀 테스트 필수 | §12.8 |
| F17 | Cycle 3/7 | 유령 변수 (선언만 하고 미사용) | §13.2 변수 사용처 검증 테이블 포함 | §13.2 |
| F18 | Cycle 14 아쉬운점 | 프루츠 머지 초기화 버그로 재기획 — 사이클 자원 낭비 | 스모크 테스트 3단계 게이트 선적용 + 초기화 순서 명시 | §12.1, §12.7 |
| F19 | Cycle 14 아쉬운점 | 밸런스 검증 부재 | 스테이지 1~5 수동 테스트 필수 + 목표 수치 밸런스 테이블 §7.3 | §7.3 |
| F20 | Cycle 14 아쉬운점 | 사운드 체감 미검증 | 매칭·콤보·폭발·스테이지 클리어 효과음 체크리스트 §9.2 | §9.2 |
| F21 | Cycle 5 | 하나의 값에 대한 갱신 경로 이중화 | 스코어/콤보 카운터는 단일 함수(`addScore()`)를 통해서만 갱신 | §7.1 |
| F22 | Cycle 3 | 상태 전환 우선순위 체계 | GAMEOVER > STAGE_CLEAR > COMBO_RESOLVING > PLAYING 우선순위 명시 | §6.2 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
8×8 보석 그리드에서 인접한 보석을 스와이프하여 같은 종류 3개 이상을 일렬로 맞추면 보석이 터지고 점수를 획득하는 **클래식 Match-3 퍼즐**. 30개 스테이지를 클리어하며 특수 보석 3종을 활용한 연쇄 폭발의 쾌감을 즐긴다.

### 핵심 재미 요소
1. **연쇄 폭발의 카타르시스**: 보석이 터지고 → 위에서 떨어지고 → 다시 매칭 → 또 터짐. 연쇄(cascade)가 이어질 때의 시청각 피드백이 핵심 쾌감
2. **특수 보석의 전략적 생성**: 4매치 → 줄 폭발 보석, 5매치 → 색상 폭탄, L/T매치 → 범위 폭탄. 특수 보석을 의도적으로 만드는 전략
3. **스테이지 목표의 다양성**: "빨간 보석 20개 제거", "줄 폭발 보석 3개 생성", "3000점 달성" 등 스테이지마다 다른 목표
4. **한판 1~2분**: 짧은 세션, "한판만 더" 중독 루프
5. **누구나 즉시 이해**: Match-3은 전 연령대가 직관적으로 이해하는 메커니즘

### 장르 균형 기여
- 현재 플랫폼: arcade 7개(41%), casual 7개(41%), puzzle 5개(29%)
- 이 게임: **puzzle** → Match-3 완전 공백 해소 (puzzle 5→6, 서브장르 다양성 ↑)
- arcade/casual 과밀 장르를 피하면서 시장 1위 장르 커버

### 트렌드 부합
- Match-3은 2025-2026 HTML5 게임 시장 부동의 1위 장르 (CrazyGames, Poki, itch.io 전 플랫폼)
- Tower Swap(Match-3+TD 하이브리드)이 CrazyGames 트렌딩 진입
- Jewels FRVR, Candy Rain 7 등 순수 Match-3 수요도 여전히 건재

---

## §2. 게임 규칙 및 목표

### 2.1 기본 규칙
- 8×8 그리드에 6종 보석(💎) 무작위 배치
- 인접한 보석 2개를 스와이프/클릭하여 위치를 교환
- 교환 결과 가로 또는 세로로 **같은 종류 3개 이상** 연속되면 매칭 성공 → 보석 제거
- 매칭이 발생하지 않는 교환은 **원래 위치로 되돌림** (swap-back 애니메이션)
- 보석 제거 후 빈 칸은 위의 보석이 중력으로 낙하 + 최상단에서 새 보석 생성
- 낙하 완료 후 자동으로 재매칭 체크 → 연쇄(cascade) 처리
- 연쇄가 끝날 때까지 입력 차단 (`isResolving = true` 가드)

### 2.2 특수 보석 (3종)

| 이름 | 생성 조건 | 효과 | 시각 표현 |
|------|-----------|------|-----------|
| **줄 폭탄** (Line Bomb) | 4개 매치 | 가로 또는 세로 1줄 전체 제거 | 보석 안에 수평/수직 화살표 (↔ 또는 ↕) |
| **범위 폭탄** (Area Bomb) | L자 또는 T자 매치 (5개) | 중심 기준 3×3 범위 제거 | 보석 안에 + 십자 마크 |
| **색상 폭탄** (Color Bomb) | 일렬 5개 매치 | 그리드의 특정 색상 보석 전부 제거 | 무지개 구체 (🌈), 보석 색 없음 |

### 2.3 특수 보석 조합

| 조합 | 효과 |
|------|------|
| 줄 폭탄 + 줄 폭탄 | 십자(가로+세로) 1줄 동시 제거 |
| 줄 폭탄 + 범위 폭탄 | 가로 3줄 + 세로 3줄 제거 |
| 범위 폭탄 + 범위 폭탄 | 5×5 범위 제거 |
| 색상 폭탄 + 일반 보석 | 해당 색상 보석 전부 제거 |
| 색상 폭탄 + 줄/범위 폭탄 | 해당 색상 보석을 모두 줄/범위 폭탄으로 변환 후 연쇄 |
| 색상 폭탄 + 색상 폭탄 | **그리드 전체 보석 제거** (Ultimate) |

### 2.4 스테이지 목표 유형 (5종)

| 목표 유형 | 설명 | 예시 |
|-----------|------|------|
| **점수 달성** | 제한 이동 횟수 안에 목표 점수 달성 | "20수 안에 5000점" |
| **보석 수집** | 특정 색상 보석을 N개 제거 | "파란 보석 25개 제거" |
| **특수 보석 생성** | 특수 보석을 N개 만들기 | "줄 폭탄 3개 생성" |
| **얼음 깨기** | 얼음 타일 위의 보석을 매치하여 얼음 제거 | "얼음 12개 깨기" |
| **복합** | 위 목표 2개 동시 달성 | "빨간 보석 15개 + 3000점" |

### 2.5 이동 횟수 제한
- 각 스테이지별 이동 횟수가 정해져 있음 (15~30수)
- 이동 횟수를 모두 소진하면 **GAME OVER**
- 목표 달성 후 남은 이동 횟수 × 보너스 점수 (남은 수 × 200점)

---

## §3. 조작 방법

### 3.1 마우스 (데스크톱)
| 조작 | 동작 |
|------|------|
| **드래그** | 보석 위에서 마우스 다운 → 인접 방향으로 드래그 → 보석 교환 |
| **클릭 2회** | 첫 클릭: 보석 선택 (하이라이트), 두 번째 클릭: 인접 보석 선택 → 교환 |

### 3.2 키보드 (데스크톱)
| 키 | 동작 |
|----|------|
| **←→↑↓** | 커서(선택 셀) 이동 |
| **Space / Enter** | 보석 선택/교환 확정 |
| **P / Esc** | 일시정지 |
| **R** | 리스타트 (일시정지 중) |

### 3.3 터치 (모바일)
| 조작 | 동작 |
|------|------|
| **스와이프** | 보석 터치 후 상하좌우 드래그(>20px) → 보석 교환 |
| **탭 2회** | 첫 탭: 보석 선택, 두 번째 탭: 인접 보석 → 교환 |
| **일시정지 버튼 탭** | 화면 우상단 일시정지 토글 |

> 모든 터치 영역: `CONFIG.MIN_TOUCH_TARGET = 48`px 이상 보장 (F1, F4)

---

## §4. 시각적 스타일 가이드

### 4.1 색상 팔레트

#### 보석 6종 (색상 + 도형 + 글자 3중 구분 — 접근성 보장, Cycle 5/14 패턴 계승)

| # | 이름 | HEX | 도형 | 글자 | 설명 |
|---|------|-----|------|------|------|
| 1 | 루비 | `#FF4757` | 다이아몬드 ◇ | R | 빨강 보석 |
| 2 | 사파이어 | `#3742FA` | 원형 ○ | S | 파랑 보석 |
| 3 | 에메랄드 | `#2ED573` | 삼각형 △ | E | 초록 보석 |
| 4 | 토파즈 | `#FFA502` | 사각형 □ | T | 주황 보석 |
| 5 | 자수정 | `#A55EEA` | 별 ☆ | A | 보라 보석 |
| 6 | 시트린 | `#ECCC68` | 육각형 ⬡ | C | 노랑 보석 |

#### 배경 및 UI
| 요소 | HEX | 설명 |
|------|-----|------|
| 배경 (상단 그라디언트) | `#1A1A2E` | 어두운 남색 |
| 배경 (하단 그라디언트) | `#16213E` | 짙은 네이비 |
| 그리드 배경 | `#0F3460` | 반투명 네이비 |
| 그리드 셀 테두리 | `#E94560` (accent) | 얇은 네온 라인 |
| 점수 텍스트 | `#FFFFFF` | 흰색 |
| 이동 횟수 텍스트 | `#00D2FF` (accent-cyan) | 시안 강조 |
| 목표 달성 텍스트 | `#FFD700` (accent-yellow) | 금색 |
| 보석 선택 하이라이트 | `#FFFFFF` alpha 0.4 | 흰색 글로우 |
| 특수 보석 글로우 | `#FFD700` alpha 0.6 | 금색 펄스 |

### 4.2 보석 렌더링 (100% Canvas 코드 드로잉)
- 각 보석은 `cellSize` 내에 80% 크기로 중앙 배치
- 보석 도형: `ctx.beginPath()` → 도형별 패스 → `ctx.fill()` + `ctx.stroke()`
- 글자: 보석 중앙에 `ctx.fillText(글자, x, y)` 반투명 오버레이
- 특수 보석: 기본 보석 위에 추가 이펙트 (화살표/십자/무지개 그라디언트)
- **SVG, Image(), fetch() 사용 금지** (F6)

### 4.3 애니메이션
| 애니메이션 | 시간 | 이징 |
|-----------|------|------|
| 보석 교환 | 200ms | easeOutQuad |
| 교환 실패 되돌림 | 250ms | easeOutBounce |
| 보석 제거 (스케일 → 0) | 180ms | easeInBack |
| 보석 낙하 | 150ms × 낙하 칸 수 | easeOutBounce |
| 특수 보석 폭발 | 300ms | easeOutExpo |
| 스테이지 전환 | 500ms | easeInOutCubic |
| 점수 팝업 (+N) | 600ms | easeOutQuad (위로 떠오름) |

### 4.4 파티클 이펙트 (ObjectPool 활용)
- **매칭 제거**: 보석 위치에서 해당 색상 파티클 8개 방사
- **특수 보석 폭발**: 범위 내 흰색+금색 파티클 20개
- **연쇄 콤보**: 콤보 배수에 따라 파티클 크기·수량 증가
- **스테이지 클리어**: 화면 전체에 금색 컨페티 40개

### 4.5 UI 레이아웃 (Canvas 내부)
```
┌──────────────────────────────────────┐
│ [⏸] Stage 5    Score: 12,450        │ ← 상단 HUD (40px)
│         Moves: 15 / 25              │
├──────────────────────────────────────┤
│ ┌─────────────────────────────────┐  │
│ │  목표: 🔵×20  🟣×15            │  │ ← 목표 표시줄 (36px)
│ │        12/20   8/15            │  │
│ └─────────────────────────────────┘  │
│                                      │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┐         │
│  │  │  │  │  │  │  │  │  │         │
│  ├──┼──┼──┼──┼──┼──┼──┼──┤         │ ← 8×8 그리드
│  │  │  │  │  │  │  │  │  │         │    (화면 중앙)
│  │  ... (8행)  ...        │         │
│  └──┴──┴──┴──┴──┴──┴──┴──┘         │
│                                      │
│         ⭐⭐⭐ (스타 등급)           │ ← 하단 정보
└──────────────────────────────────────┘
```

### 4.6 반응형 레이아웃
- `cellSize = Math.floor(Math.min(canvasW * 0.85, canvasH * 0.65) / 8)`
- 최소 `cellSize = 40px` (모바일), 최대 `cellSize = 70px` (데스크톱)
- DPR 대응: `canvas.width = canvas.clientWidth * dpr`, `ctx.scale(dpr, dpr)`
- 그리드 중앙 정렬: `gridX = (canvasW - cellSize * 8) / 2`

### 4.7 터치 타겟 보장
- 모든 셀 크기 ≥ `CONFIG.MIN_TOUCH_TARGET` (48px)
- 일시정지 버튼: 48×48px 이상 (너비·높이 독립 보장, F4)
- `touchSafe(size)` = `Math.max(CONFIG.MIN_TOUCH_TARGET, size)`

---

## §5. 핵심 게임 루프

### 5.1 메인 루프 (requestAnimationFrame)
```
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.033); // 33ms 상한
    lastTime = timestamp;

    tweenManager.update(dt);
    particlePool.update(dt);
    popupPool.update(dt);

    switch (state) {
      case 'TITLE':       updateTitle(dt);       break;
      case 'STAGE_SELECT':updateStageSelect(dt); break;
      case 'PLAYING':     updatePlaying(dt);     break;
      case 'RESOLVING':   updateResolving(dt);   break;
      case 'STAGE_CLEAR': updateStageClear(dt);  break;
      case 'GAMEOVER':    updateGameOver(dt);     break;
      case 'PAUSED':      /* 렌더만 */            break;
    }

    render(state, dt);
  } catch (e) {
    console.error('[GameLoop Error]', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 5.2 초기화 순서 (F3, F5)
```
1. const/let 변수 선언 (모든 변수)
2. CONFIG 상수 정의
3. 유틸리티 클래스 정의 (TweenManager, ObjectPool, SoundManager, TransitionGuard)
4. 순수 함수 정의 (§10)
5. init() 함수 정의
6. DOMContentLoaded → init() 호출
   6a. canvas = document.getElementById('gc')
   6b. ctx = canvas.getContext('2d')
   6c. resizeCanvas()
   6d. 이벤트 리스너 등록 (mouse/keyboard/touch/resize)
   6e. 게임 데이터 초기화
   6f. enterState('TITLE')
   6g. requestAnimationFrame(gameLoop)
```

### 5.3 연쇄 처리 흐름 (핵심 로직)
```
[플레이어 스와이프]
  → swapGems(a, b)  // tween 교환 애니메이션
  → 교환 완료 후:
    → matches = findMatches(grid)  // 순수 함수
    → if (matches.length === 0):
        → swapBack(a, b)  // 되돌림 애니메이션
        → state = PLAYING  (입력 허용)
    → else:
        → isResolving = true  // F8: 가드 플래그
        → state = RESOLVING
        → resolveLoop()

[resolveLoop] — 재귀적 연쇄 처리
  → removeMatches(grid, matches)     // 제거 tween + 파티클
  → createSpecialGems(matches)       // 특수 보석 생성
  → addScore(matches, comboCount)    // F21: 단일 경로 갱신
  → comboCount++
  → 제거 tween 완료 후:
    → applyGravity(grid)            // 낙하 tween
    → fillEmptyCells(grid)          // 새 보석 생성
    → 낙하 tween 완료 후:
      → newMatches = findMatches(grid)
      → if (newMatches.length > 0):
          → resolveLoop()           // 연쇄 계속
      → else:
          → isResolving = false     // 가드 해제
          → comboCount = 0
          → checkStageGoal()        // 목표 달성 확인
          → checkMoves()            // 이동 횟수 확인
          → state = PLAYING         (입력 허용)
```

### 5.4 가드 플래그 체계 (F8)
| 가드 변수 | 용도 | 설정 시점 | 해제 시점 |
|-----------|------|-----------|-----------|
| `isResolving` | 연쇄 처리 중 입력 차단 | resolveLoop() 진입 | 연쇄 완전 종료 후 |
| `isSwapping` | 교환 애니메이션 중 입력 차단 | swapGems() 호출 | swap tween 완료 |
| `isTransitioning` | 화면 전환 중 입력 차단 | beginTransition() | enterState() |

---

## §6. 상태 머신

### 6.1 상태 정의 (7개)

| 상태 | 설명 |
|------|------|
| `TITLE` | 타이틀 화면 — 게임 로고, "TAP TO START" |
| `STAGE_SELECT` | 스테이지 선택 — 30개 스테이지 목록, 별 표시, 잠금 |
| `PLAYING` | 게임 플레이 — 입력 대기 상태 |
| `RESOLVING` | 매칭·낙하·연쇄 처리 중 — 입력 차단 |
| `STAGE_CLEAR` | 스테이지 클리어 — 결과 표시, 별 등급 |
| `GAMEOVER` | 게임 오버 — 이동 횟수 소진, 재시도/스테이지 선택 |
| `PAUSED` | 일시정지 — 오버레이 표시, 재개/타이틀 버튼 |

### 6.2 상태×시스템 매트릭스 (F7)

| 시스템 \ 상태 | TITLE | STAGE_SELECT | PLAYING | RESOLVING | STAGE_CLEAR | GAMEOVER | PAUSED |
|--------------|-------|-------------|---------|-----------|-------------|----------|--------|
| **tweenManager.update()** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **particlePool.update()** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **popupPool.update()** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **입력 처리** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅(제한) |
| **그리드 렌더** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **HUD 렌더** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **soundManager** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### 6.3 상태 전환 우선순위 (F22)

```
STATE_PRIORITY = {
  GAMEOVER:     100,   // 최고 — 이동 횟수 소진 시 즉시
  STAGE_CLEAR:   80,   // 목표 달성 시
  RESOLVING:     60,   // 매칭 처리 중
  PAUSED:        50,   // 일시정지
  PLAYING:       40,   // 일반 플레이
  STAGE_SELECT:  20,   // 스테이지 선택
  TITLE:         10,   // 타이틀
};
```

### 6.4 상태 전환 다이어그램
```
TITLE ──(start)──→ STAGE_SELECT
STAGE_SELECT ──(select stage)──→ PLAYING
PLAYING ──(match found)──→ RESOLVING
RESOLVING ──(cascade done)──→ PLAYING
PLAYING ──(goal met)──→ STAGE_CLEAR
PLAYING ──(moves=0)──→ GAMEOVER
STAGE_CLEAR ──(next/select)──→ STAGE_SELECT | PLAYING
GAMEOVER ──(retry)──→ PLAYING
GAMEOVER ──(select)──→ STAGE_SELECT
ANY ──(pause)──→ PAUSED ──(resume)──→ (이전 상태)
```

모든 전환은 `beginTransition()` 경유 필수 (PAUSED 예외, F10).

---

## §7. 점수 시스템

### 7.1 기본 점수 (F21: 단일 경로 `addScore()`)

| 매치 유형 | 기본 점수 | 콤보 보너스 |
|-----------|----------|-------------|
| 3매치 | 50점 | × comboMultiplier |
| 4매치 (줄 폭탄 생성) | 100점 | × comboMultiplier |
| L/T 매치 (범위 폭탄 생성) | 150점 | × comboMultiplier |
| 5매치 (색상 폭탄 생성) | 300점 | × comboMultiplier |
| 특수 보석 조합 | 500점 | × comboMultiplier |
| 색상폭탄 + 색상폭탄 | 2000점 | × comboMultiplier |

### 7.2 콤보 배수

| 연쇄 횟수 | comboMultiplier |
|-----------|-----------------|
| 1 (첫 매치) | ×1.0 |
| 2 | ×1.5 |
| 3 | ×2.0 |
| 4 | ×2.5 |
| 5+ | ×3.0 (상한) |

### 7.3 스테이지 밸런스 테이블 (F19: 밸런스 검증)

| 스테이지 | 목표 유형 | 목표 상세 | 이동 횟수 | 보석 종류 | 예상 난이도 |
|---------|----------|----------|----------|----------|------------|
| 1 | 점수 | 1000점 | 25수 | 5종 | ★☆☆ |
| 2 | 보석 수집 | 루비 15개 | 22수 | 5종 | ★☆☆ |
| 3 | 점수 | 2000점 | 22수 | 5종 | ★☆☆ |
| 4 | 보석 수집 | 사파이어 18개 | 20수 | 5종 | ★★☆ |
| 5 | 특수 보석 | 줄 폭탄 2개 | 20수 | 5종 | ★★☆ |
| 6 | 복합 | 에메랄드 12개 + 1500점 | 22수 | 6종 | ★★☆ |
| 7 | 얼음 | 얼음 8개 | 20수 | 5종 | ★★☆ |
| 8 | 점수 | 4000점 | 20수 | 6종 | ★★☆ |
| 9 | 특수 보석 | 범위 폭탄 2개 | 20수 | 6종 | ★★★ |
| 10 | 복합 | 루비 20개 + 얼음 6개 | 22수 | 6종 | ★★★ |
| 11~20 | 다양 | 점수 5000~15000 / 보석 25~40개 / 얼음 10~16개 | 18~22수 | 6종 | ★★★ |
| 21~30 | 다양 | 점수 15000~30000 / 복합 목표 / 얼음 16~24개 | 15~20수 | 6종 | ★★★ |

> **밸런스 검증**: 스테이지 1~5를 수동 테스트하여 클리어 가능성 확인 필수 (F19)

### 7.4 스타 등급

| 등급 | 조건 |
|------|------|
| ⭐ (1스타) | 목표 달성 |
| ⭐⭐ (2스타) | 목표 + 잔여 이동 ≥ 5수 |
| ⭐⭐⭐ (3스타) | 목표 + 잔여 이동 ≥ 10수 |

### 7.5 저장 (localStorage, try-catch 래핑)
```javascript
saveData = {
  unlockedStage: 1~30,        // 해금된 최대 스테이지
  stars: { 1: 3, 2: 2, ... }, // 스테이지별 최고 스타
  highScores: { 1: 5200, ... } // 스테이지별 최고 점수
}
```
- 판정 먼저 → 저장 나중에 (Cycle 2 B4 교훈)

---

## §8. 시각적 에셋 정책 (F6)

### 8.1 절대 규칙
- **assets/ 디렉토리 생성 절대 금지** (14사이클 연속 재발 방지)
- **SVG 파일, Image(), fetch(), XMLHttpRequest 사용 금지**
- 모든 그래픽은 **Canvas API 코드 드로잉**으로 구현
- 폰트: 시스템 폰트만 사용 (`'Segoe UI', system-ui, sans-serif`)
- 외부 CDN, Google Fonts 로드 금지

### 8.2 보석 드로잉 함수
```javascript
function drawGem(ctx, type, x, y, size, alpha) {
  // type: 0~5 → 루비/사파이어/에메랄드/토파즈/자수정/시트린
  // 각 보석별 도형 패스 + 색상 + 글자 오버레이
  // 특수 보석은 추가 이펙트 오버레이
}
```

### 8.3 금지 패턴 grep 검증 (F6 자동 검증)
```
❌ new Image()
❌ fetch(
❌ XMLHttpRequest
❌ assets/
❌ .svg
❌ .png
❌ .jpg
❌ @import
❌ Google Fonts
❌ feGaussianBlur
```

---

## §9. 사운드 시스템 (Web Audio API)

### 9.1 SoundManager 사양
- **AudioContext** 싱글턴 + 모바일 resume (첫 터치 시)
- 모든 사운드는 **OscillatorNode + GainNode**로 절차적 생성
- setTimeout 완전 금지 — `oscillator.start(ctx.currentTime + delay)` 네이티브 스케줄링 (F2)

### 9.2 효과음 목록 (F20: 사운드 체감 검증)

| 이벤트 | 소리 유형 | 주파수 | 지속시간 |
|--------|----------|--------|----------|
| 보석 선택 | 클릭음 | 880Hz sine | 50ms |
| 보석 교환 | 스와이프음 | 440→660Hz sweep | 100ms |
| 3매치 제거 | 팝음 | 523→784Hz | 80ms |
| 4매치 (특수 생성) | 딩동음 | 784→1047Hz | 120ms |
| 5매치 (색상폭탄) | 차임음 | 523→1047Hz sweep | 200ms |
| 연쇄 콤보 (n번째) | 상승 음계 | base × 1.1^n | 100ms |
| 줄 폭탄 폭발 | 슈울 | white noise 200ms | 200ms |
| 범위 폭탄 폭발 | 붐 | 110Hz sine 떨어짐 | 300ms |
| 색상 폭탄 폭발 | 화려한 sweep | 220→1760Hz | 400ms |
| 교환 실패 | 버즈 | 220Hz square | 150ms |
| 스테이지 클리어 | 팡파레 | C-E-G-C' 아르페지오 | 500ms |
| 게임 오버 | 하강음 | 440→110Hz | 400ms |

### 9.3 음소거 토글
- UI 버튼 48×48px (🔊/🔇)
- localStorage에 음소거 상태 저장

---

## §10. 순수 함수 목록 (F12)

> 모든 게임 로직 함수는 전역 변수에 직접 접근하지 않고, 파라미터로 데이터를 수신한다.

| # | 함수명 | 파라미터 | 반환 | 설명 |
|---|--------|----------|------|------|
| 1 | `findMatches(grid)` | grid: number[][] | Match[] | 가로·세로 3+ 매치 탐지 (BFS) |
| 2 | `canSwap(grid, a, b)` | grid, {r,c}, {r,c} | boolean | 교환 시 매치 발생 여부 확인 |
| 3 | `applyGravity(grid)` | grid: number[][] | FallInfo[] | 빈 칸 위 보석 낙하 정보 |
| 4 | `fillEmptyCells(grid, gemCount)` | grid, number | NewGem[] | 빈 칸에 새 보석 생성 |
| 5 | `calcScore(matches, combo)` | Match[], number | number | 매치+콤보 기반 점수 계산 |
| 6 | `checkGoal(goal, progress)` | Goal, Progress | boolean | 스테이지 목표 달성 여부 |
| 7 | `getStarRating(movesLeft)` | number | 1\|2\|3 | 잔여 이동 수 기반 스타 등급 |
| 8 | `createSpecialGem(matchType, matchLen)` | string, number | GemType | 매치 유형에 따른 특수 보석 결정 |
| 9 | `resolveSpecialCombo(gemA, gemB)` | GemType, GemType | Effect | 특수 보석 조합 효과 결정 |
| 10 | `hasValidMoves(grid)` | grid: number[][] | boolean | 유효한 이동 존재 여부 (교착 방지) |
| 11 | `shuffleGrid(grid, gemCount)` | grid, number | grid | 교착 시 그리드 셔플 (매치 없이) |
| 12 | `getStageConfig(stageNum)` | number | StageConfig | 스테이지별 목표·이동횟수·보석종류 반환 |
| 13 | `touchSafe(size)` | number | number | `Math.max(CONFIG.MIN_TOUCH_TARGET, size)` |

---

## §11. 난이도 시스템

### 11.1 스테이지 진행에 따른 난이도 변화

| 구간 | 스테이지 | 보석 종류 | 이동 횟수 | 목표 유형 | 특수 요소 |
|------|---------|----------|----------|----------|----------|
| 입문 | 1~5 | 5종 | 20~25수 | 단일 (점수/수집) | 없음 |
| 초급 | 6~10 | 6종 | 18~22수 | 복합, 얼음 등장 | 얼음 타일 |
| 중급 | 11~20 | 6종 | 16~20수 | 복합 + 높은 목표 | 얼음 2중 |
| 고급 | 21~30 | 6종 | 15~18수 | 극한 복합 | 얼음 3중 |

### 11.2 얼음 타일 메커니즘
- 얼음 타일 위의 보석을 매치하면 얼음 1층 제거
- 1중 얼음: 투명 파란 오버레이, 매치 1회로 제거
- 2중 얼음: 반투명 파란 오버레이 + 금 테두리, 매치 2회 필요
- 3중 얼음 (21+ 스테이지): 불투명 파란 오버레이 + 금 테두리 + 눈꽃, 매치 3회 필요
- 얼음은 Canvas 코드 드로잉으로 구현 (반투명 사각 + 대각선 빗금)

### 11.3 교착(Deadlock) 방지
- `hasValidMoves(grid)`가 false 반환 시 → 자동 셔플
- 셔플 시 3연속 매치가 없는 상태로 재배치
- 셔플 애니메이션: 전체 보석이 화면 밖으로 나간 후 새로 떨어지는 연출 (800ms)

---

## §12. 구현 규칙 및 체크리스트

### 12.1 초기화 순서 체크리스트 (F3, F5)
- [ ] 모든 `let`/`const` 변수가 최초 사용 전에 선언됨
- [ ] `canvas`/`ctx` 할당이 `init()` 내부에서 수행됨
- [ ] 모든 이벤트 리스너가 `init()` 내부에서 등록됨
- [ ] `resizeCanvas()`가 `canvas` 할당 이후에 호출됨
- [ ] `DOMContentLoaded` → `init()` → `gameLoop()` 순서 보장

### 12.2 금지 패턴 (F6, F9)
- [ ] `setTimeout` 0건 (상태 전환·사운드 모두)
- [ ] `setInterval` 0건
- [ ] `alert()` / `confirm()` / `prompt()` 0건
- [ ] `eval()` / `innerHTML` 0건
- [ ] `new Image()` / `fetch()` / `XMLHttpRequest` 0건
- [ ] `assets/` 디렉토리 미존재
- [ ] `.svg` / `.png` / `.jpg` 파일 미존재
- [ ] `feGaussianBlur` / SVG 필터 0건
- [ ] Google Fonts / 외부 CDN 0건

### 12.3 터치 타겟 체크리스트 (F1, F4)
- [ ] 보석 셀 크기 ≥ 48px (`cellSize ≥ CONFIG.MIN_TOUCH_TARGET`)
- [ ] 일시정지 버튼: 너비 ≥ 48px, 높이 ≥ 48px (독립 보장)
- [ ] 음소거 버튼: 너비 ≥ 48px, 높이 ≥ 48px
- [ ] 스테이지 선택 셀: 너비 ≥ 48px, 높이 ≥ 48px
- [ ] 결과 화면 버튼: 너비 ≥ 48px, 높이 ≥ 48px
- [ ] `touchSafe()` 함수가 모든 버튼 렌더링에서 호출됨

### 12.4 방어적 코딩 (F13)
- [ ] `gameLoop()` 전체가 try-catch 래핑
- [ ] localStorage 접근이 try-catch 래핑
- [ ] AudioContext 생성이 try-catch 래핑
- [ ] `preload onerror = console.warn + resolve` 패턴 (해당 없음 — 에셋 0개)

### 12.5 tween/사운드 규칙 (F2, F9)
- [ ] 모든 상태 전환은 `beginTransition()` 경유 (PAUSED 예외)
- [ ] 모든 지연 효과는 tween `onComplete` 콜백으로 처리
- [ ] 사운드: `oscillator.start(ctx.currentTime + delay)` 패턴만 사용
- [ ] `clearImmediate()` API로 cancelAll + add 경쟁 조건 방지

### 12.6 에셋 정책 (F6)
- [ ] `assets/` 디렉토리 미존재
- [ ] 코드 내 `ASSET_MAP`, `SPRITES`, `preloadAssets` 미존재
- [ ] `if (SPRITES.xxx)` 분기 미존재 (에셋 자체가 없으므로)
- [ ] 모든 그래픽 = Canvas `ctx.beginPath()` + `ctx.fill()` + `ctx.stroke()`
- [ ] 모든 텍스트 = `ctx.fillText()` + 시스템 폰트

### 12.7 스모크 테스트 3단계 게이트 (F15, F18)
리뷰 제출 전 필수 확인:
1. [ ] `index.html` 파일이 존재한다
2. [ ] 브라우저에서 페이지가 정상 로드된다 (빈 화면 아님)
3. [ ] 개발자 콘솔에 에러가 0건이다

### 12.8 수정 회귀 방지 (F16)
수정 적용 후 반드시 전체 플로우 테스트:
- TITLE → STAGE_SELECT → PLAYING → 매치 → RESOLVING → 연쇄 → PLAYING → STAGE_CLEAR / GAMEOVER → 재시도 → PAUSED → 재개

---

## §13. 수치 정합성 검증 테이블 (F11)

### 13.1 CONFIG 수치

| 상수명 | 기획서 값 | 용도 |
|--------|----------|------|
| `CONFIG.GRID_SIZE` | 8 | 그리드 크기 (8×8) |
| `CONFIG.GEM_TYPES` | 6 | 보석 종류 수 (스테이지별 5~6) |
| `CONFIG.MIN_MATCH` | 3 | 최소 매칭 개수 |
| `CONFIG.MIN_TOUCH_TARGET` | 48 | 최소 터치 타겟 (px) |
| `CONFIG.MAX_COMBO_MULTI` | 3.0 | 최대 콤보 배수 |
| `CONFIG.SWAP_DURATION` | 200 | 교환 애니메이션 (ms) |
| `CONFIG.FALL_DURATION` | 150 | 낙하 애니메이션 (ms/칸) |
| `CONFIG.REMOVE_DURATION` | 180 | 제거 애니메이션 (ms) |
| `CONFIG.SCORE_3MATCH` | 50 | 3매치 기본 점수 |
| `CONFIG.SCORE_4MATCH` | 100 | 4매치 기본 점수 |
| `CONFIG.SCORE_LMATCH` | 150 | L/T매치 기본 점수 |
| `CONFIG.SCORE_5MATCH` | 300 | 5매치 기본 점수 |
| `CONFIG.SCORE_COMBO_SPECIAL` | 500 | 특수 보석 조합 점수 |
| `CONFIG.SCORE_ULTIMATE` | 2000 | 색상폭탄×2 점수 |
| `CONFIG.BONUS_PER_MOVE` | 200 | 잔여 이동당 보너스 점수 |
| `CONFIG.STAR2_MOVES` | 5 | 2스타 잔여 이동 조건 |
| `CONFIG.STAR3_MOVES` | 10 | 3스타 잔여 이동 조건 |
| `CONFIG.DT_CAP` | 0.033 | 프레임 dt 상한 (초) |
| `CONFIG.SWIPE_THRESHOLD` | 20 | 스와이프 판정 거리 (px) |
| `CONFIG.PARTICLE_POOL_SIZE` | 100 | 파티클 풀 크기 |
| `CONFIG.POPUP_POOL_SIZE` | 20 | 팝업 풀 크기 |
| `CONFIG.TOTAL_STAGES` | 30 | 총 스테이지 수 |

### 13.2 변수 사용처 검증 테이블 (F17)

| 변수명 | 선언 | 갱신 위치 | 참조 위치 | 용도 |
|--------|------|-----------|-----------|------|
| `isResolving` | init | resolveLoop 진입/종료 | 입력 핸들러 | 연쇄 중 입력 차단 |
| `isSwapping` | init | swapGems/swap완료 | 입력 핸들러 | 교환 중 입력 차단 |
| `comboCount` | resolveLoop 시작 | resolveLoop 내 | calcScore | 연쇄 횟수 추적 |
| `movesLeft` | 스테이지 시작 | 교환 성공 시 -1 | HUD 렌더, checkMoves | 잔여 이동 횟수 |
| `score` | 스테이지 시작 | addScore() | HUD 렌더, checkGoal | 현재 점수 |
| `goalProgress` | 스테이지 시작 | removeMatches 내 | HUD 렌더, checkGoal | 목표 진행도 |
| `selectedGem` | null | 클릭/탭 시 | 입력 핸들러, 렌더 | 선택된 보석 좌표 |
| `grid` | 스테이지 시작 | 교환/낙하/채움 | 거의 모든 함수 | 8×8 보석 배열 |
| `iceTiles` | 스테이지 시작 | 매치 시 감소 | 렌더, checkGoal | 얼음 타일 상태 |

---

## §14. 게임 페이지 사이드바 정보

```yaml
game:
  title: "보석 매치 블리츠"
  description: "8×8 보석 그리드에서 같은 보석 3개를 맞춰 터뜨리세요! 연쇄 폭발과 특수 보석으로 30개 스테이지를 클리어하는 Match-3 퍼즐."
  genre: ["puzzle"]
  playCount: 0
  rating: 0
  controls:
    - "마우스 드래그: 보석 교환"
    - "클릭 2회: 보석 선택 후 교환"
    - "스와이프: 터치 보석 교환"
    - "방향키+스페이스: 키보드 조작"
    - "P/Esc: 일시정지"
  tags:
    - "#매치3"
    - "#퍼즐"
    - "#보석"
    - "#연쇄폭발"
    - "#스테이지"
    - "#캐주얼"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## §15. 홈 페이지 GameCard 표시 정보

| 필드 | 값 |
|------|-----|
| thumbnail | 8×8 보석 그리드 + 연쇄 폭발 이펙트 (4:3 비율 잘림) |
| title | 보석 매치 블리츠 |
| description | 8×8 보석 그리드에서 같은 보석 3개를 맞춰 터뜨리세요! 연쇄 폭발과 특수 보석으로 30개 스테이지를 클리어하는 Match-3 퍼즐. |
| genre 배지 | `puzzle` (최대 2개 중 1개) |
| playCount | 0 (신규) |
| NEW 배지 | ✅ (addedAt 7일 이내) |
| ⭐ 배지 | ✅ (featured=true) |

---

## 부록 A: 이전 사이클 교훈 반영 요약

| 사이클 | 교훈 | 이번 기획서 해결 상태 |
|--------|------|---------------------|
| C1~C14 | assets/ 디렉토리 재발 | ✅ §8, §12.6 — 100% Canvas, assets/ 절대 금지 |
| C1 | iframe confirm/alert 불가 | ✅ Canvas 기반 모달/오버레이 사용 |
| C2 | 상태×시스템 매트릭스 | ✅ §6.2 — 7상태 × 7시스템 매트릭스 |
| C2~C5 | setTimeout 금지 | ✅ §12.2, §12.5 — tween + Web Audio 네이티브 |
| C3 | 가드 플래그 | ✅ §5.4 — isResolving, isSwapping, isTransitioning |
| C3 | 상태 전환 우선순위 | ✅ §6.3 — GAMEOVER > STAGE_CLEAR > RESOLVING |
| C4 | cancelAll+add 경쟁 | ✅ clearImmediate() 분리 API |
| C5 | 값 갱신 경로 단일화 | ✅ §7.1 — addScore() 단일 경로 |
| C6~C7 | 순수 함수 패턴 | ✅ §10 — 13개 순수 함수 목록 |
| C7~C8 | 수치 정합성 검증 | ✅ §13.1 — CONFIG 22개 수치 테이블 |
| C10 | 수정 회귀 방지 | ✅ §12.8 — 전체 플로우 회귀 테스트 |
| C11 | TDZ 크래시 방지 | ✅ §5.2, §12.1 — 초기화 순서 명시 |
| C12~C14 | 터치 타겟 48px | ✅ §4.7, §12.3 — touchSafe() 강제 적용 |
| C13 | 스모크 테스트 | ✅ §12.7 — 3단계 게이트 |
| C14 | 밸런스 검증 | ✅ §7.3 — 스테이지 밸런스 테이블 |
| C14 | 사운드 체감 미검증 | ✅ §9.2 — 12종 효과음 체크리스트 |
