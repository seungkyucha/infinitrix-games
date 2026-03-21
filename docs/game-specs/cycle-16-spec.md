---
game-id: neon-hex-drop
title: 네온 헥스 드롭
genre: puzzle
difficulty: medium
---

# 네온 헥스 드롭 — 상세 기획서

_사이클 #16 | 작성일: 2026-03-22_

---

## §0. 이전 사이클 피드백 반영 매핑

> Cycle 15 포스트모템 "아쉬웠던 점" + platform-wisdom 누적 교훈(F1~F22, 15사이클)을 기획 단계에서 선제 대응한다.

| # | 출처 | 문제 | 이번 기획서 해결 방법 | 해당 섹션 |
|---|------|------|----------------------|-----------|
| F1 | Cycle 13~15 | `CONFIG.MIN_TOUCH_TARGET` 선언-구현 괴리 | 모든 버튼·셀 크기에 `CONFIG.MIN_TOUCH_TARGET` **직접 참조**. `touchSafe()` 유틸로 48px 하한 강제 | §4, §12.3 |
| F2 | Cycle 13~15 | SoundManager setTimeout 잔존 | Web Audio `ctx.currentTime + offset` 네이티브 스케줄링만 허용. setTimeout **0건** 목표 | §9, §12.5 |
| F3 | Cycle 1~15 (15사이클 연속) | assets/ 디렉토리 재발 | **빈 index.html에서 처음부터 작성.** assets/ 디렉토리 절대 생성 금지. 100% Canvas 코드 드로잉 + thumbnail.svg만 허용 | §8, §12.6 |
| F4 | Cycle 12~15 | 터치 타겟 높이 미달 | 버튼 크기 너비·높이 **독립적으로** `CONFIG.MIN_TOUCH_TARGET` 이상 보장. 헥스 셀 최소 외접원 반지름 24px(내접원~21px → 터치 42px+ 보장) | §4.7, §12.3 |
| F5 | Cycle 11/14 | let/const TDZ 크래시 + 초기화 순서 오류 | 변수 선언 → DOM 할당 → 이벤트 등록 → init() 순서 명시. §12.1 초기화 순서 체크리스트 | §5, §12.1 |
| F6 | Cycle 2 | 상태×시스템 매트릭스 누락 | §6에 전체 상태×시스템 매트릭스 선행 작성 (4상태 × 5시스템) | §6 |
| F7 | Cycle 3/4 | 가드 플래그 누락 → 콜백 반복 호출 | 블록 소멸/낙하 처리 시 `isResolving` 가드 + TransitionGuard 패턴 적용 | §5.4, §6.2 |
| F8 | Cycle 2/5 | setTimeout 상태 전환 | tween onComplete 콜백으로만 상태 전환. setTimeout 사용 완전 금지 | §5, §12.5 |
| F9 | Cycle 5/8 | beginTransition() 우회 직접 전환 | 모든 화면 전환은 beginTransition() 경유 필수. PAUSED만 예외(즉시 전환) | §6.2 |
| F10 | Cycle 7/8 | 기획서 수치 ↔ 코드 수치 불일치 | §13 수치 정합성 검증 테이블 필수 포함. 레벨별 속도·점수 등 전수 대조 | §13 |
| F11 | Cycle 6/7 | 전역 참조 함수 → 테스트 불가 | 순수 함수 패턴 — 모든 게임 로직 함수는 파라미터로 데이터 수신. §10에 시그니처 정의 | §10 |
| F12 | Cycle 10 | 게임 루프 try-catch 미적용 | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` 기본 적용 | §5.3, §12.4 |
| F13 | Cycle 14 | 스모크 테스트 3단계 자동화 미비 | 리뷰 제출 전: (1) index.html 존재 (2) 페이지 로드 성공 (3) 콘솔 에러 0건 | §12.7 |
| F14 | Cycle 10 | 수정 회귀 (render 시그니처 변경) | 수정 시 전체 플로우 회귀 테스트 필수 (TITLE→PLAY→PAUSE→GAMEOVER) | §12.8 |
| F15 | Cycle 3/7 | 유령 변수 (선언만 하고 미사용) | §13.2 변수 사용처 검증 테이블 포함 | §13.2 |
| F16 | Cycle 5 | 하나의 값에 대한 갱신 경로 이중화 | score/level/combo는 단일 함수(`addScore()`, `setLevel()`)를 통해서만 갱신 | §7.1 |
| F17 | Cycle 3 | 상태 전환 우선순위 체계 | GAMEOVER > PAUSED > PLAYING 우선순위 명시. STATE_PRIORITY 맵 | §6.2 |
| F18 | Cycle 15 아쉬운점 | 5회 리뷰 사이클 (역대 최다) | 상태 4개 + 목표 1종("생존")으로 구현 범위 한정. 2~3회 목표 | §1, §6 |
| F19 | Cycle 15 아쉬운점 | 스테이지 목표 유형 초기 미구현("절반 구현") | 스테이지 목표 유형 분기 없음 — 점수+레벨(속도) 단일 시스템만 | §2, §7 |
| F20 | Cycle 15 아쉬운점 | drawBackground() 매 프레임 그라디언트 재생성 | offscreen canvas에 배경 캐싱 — resizeCanvas() 시에만 재빌드 | §8.3, §12.9 |
| F21 | Cycle 15 아쉬운점 | 밸런스/사운드 실측 검증 불가 | 레벨 1~5 수동 플레이 테스트 + 효과음 5종 체감 체크리스트 | §9.2, §12.8 |
| F22 | Cycle 12~15 | "절반 구현" 패턴 재발 | 기능별 세부 구현 체크리스트(§13.3)에서 A+B+C 개별 완료 각각 확인 | §13.3 |
| F23 | Cycle 15 아쉬운점 | assets/ 15사이클 연속 재발 — CI 훅 필수 | thumbnail.svg 외 파일 존재 시 리뷰 FAIL 규칙 명시. 스모크 테스트 §12.7에 파일 목록 검증 포함 | §12.6, §12.7 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
화면 중앙의 정육각형(Hexagon)을 회전시켜 6방향에서 떨어지는 색상 블록을 정렬하는 **낙하 블록 퍼즐**. Hextris에서 영감을 받았으며, 같은 색 3개 이상이 한 변(Side)에 연속 인접하면 소멸된다. 레벨이 오를수록 블록 낙하 속도가 빨라지며, 블록이 한계선을 넘으면 게임 오버.

### 핵심 재미 요소
1. **회전의 긴장감**: 6방향에서 동시에 내려오는 블록을 중앙 헥사곤을 좌/우 회전하여 정렬. 어느 방향을 먼저 받을지 순간 판단이 핵심
2. **연쇄 소멸의 쾌감**: 블록이 소멸되면 위 블록이 내려오고, 새로운 매칭이 발생하는 Cascade. 의도하지 않은 연쇄가 터질 때의 "럭키 모먼트"
3. **점진적 가속의 몰입**: 레벨 1(2초/블록) → 레벨 20(0.4초/블록)으로 점진 가속. "이번 레벨까지만..."의 중독 루프
4. **한 판 1~3분**: 초보자 1분, 숙련자 3분+의 짧은 세션. 즉시 재도전 가능
5. **직관적 조작**: 좌/우 탭 한 번으로 60도 회전. 누구나 5초 만에 이해

### 장르 균형 기여
- 현재 플랫폼: puzzle 6개 (머지x2, Match-3x1, 워드x1, 골프x1, 리듬x1) — **낙하 블록 0개**
- 이 게임: **puzzle + arcade** → 낙하 블록 서브장르 완전 공백 해소
- Tetris 5억+ 판매, Hextris GitHub 2k+ Stars — 시장 검증 완료된 장르

### Cycle 15 포스트모템 반영 포인트
- **리뷰 사이클 축소**: 상태 4개, 목표 1종("생존"), 스테이지 목표 분기 없음 → 2~3회 목표
- **"절반 구현" 방지**: 기능 범위를 한정하여 체크리스트 항목 수 자체를 줄임
- **offscreen canvas 배경 캐싱**: Cycle 15에서 미적용된 최적화를 초기부터 적용

---

## §2. 게임 규칙 및 목표

### 2.1 기본 규칙
1. 화면 중앙에 정육각형(이하 "코어")이 위치한다
2. 코어의 6개 변(Side 0~5) 외곽에서 색상 블록이 코어를 향해 낙하한다
3. 블록은 코어 변에 도달하면 해당 변에 쌓인다 (최대 4층)
4. 플레이어는 코어를 좌/우로 60도 회전하여 블록 정렬 위치를 제어한다
5. **같은 색 블록 3개 이상이 인접**하면 소멸되고 점수를 얻는다
   - "인접"의 정의: 같은 변의 연속 층 + 이웃 변의 같은 층이 연결된 경우
6. 소멸 후 위 블록이 한 칸 내려오고, 새로운 매칭 발생 시 연쇄(Cascade)
7. 어떤 변이든 블록이 **한계선(코어 중심에서 반지름 x 2.5)을 넘으면** 게임 오버

### 2.2 블록 색상
총 **6색** — 레벨에 따라 활성 색상 수 증가:

| 레벨 | 활성 색상 수 | 색상 |
|------|-------------|------|
| 1~3 | 3 | 빨강, 파랑, 초록 |
| 4~7 | 4 | + 노랑 |
| 8~12 | 5 | + 보라 |
| 13+ | 6 | + 주황 |

### 2.3 게임 목표
- **생존**: 블록이 한계선을 넘지 않도록 최대한 오래 버틴다
- **최고 점수**: localStorage에 하이스코어 기록
- **최고 레벨**: 도달한 최고 레벨 기록

### 2.4 레벨 시스템
- 블록 10개 소멸할 때마다 레벨 업 (레벨 1→2: 10개, 2→3: 20개 누적...)
- 최대 레벨 20
- 레벨업 시 낙하 속도 증가 + 잠깐의 시각적 축하 연출 (tween 기반)

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 동작 |
|----|------|
| ArrowLeft | 코어 반시계 방향 60도 회전 |
| ArrowRight | 코어 시계 방향 60도 회전 |
| ArrowDown | 현재 블록 즉시 낙하 (하드 드롭) |
| Space | 일시정지 토글 |
| P | 일시정지 토글 |
| Enter | 타이틀/게임오버에서 게임 시작 |

### 3.2 마우스
| 동작 | 효과 |
|------|------|
| 화면 좌측 절반 클릭 | 반시계 방향 60도 회전 |
| 화면 우측 절반 클릭 | 시계 방향 60도 회전 |
| 하단 중앙 버튼 클릭 | 일시정지 토글 |

### 3.3 터치 (모바일)
| 동작 | 효과 |
|------|------|
| 화면 좌측 절반 탭 | 반시계 방향 60도 회전 |
| 화면 우측 절반 탭 | 시계 방향 60도 회전 |
| 아래로 스와이프 (dy > 50px) | 하드 드롭 |
| 일시정지 버튼 탭 | 일시정지 토글 |

**모바일 필수 설정:**
- `touch-action: none` (스크롤 방지)
- `{passive: false}` 이벤트 리스너
- DPR 대응: `canvas.width = canvas.clientWidth * dpr`
- `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`

---

## §4. 시각적 스타일 가이드

### 4.1 테마
**네온 다크** — InfiniTriX 플랫폼 시각 정체성과 일관. 어두운 배경 위에 네온 글로우 블록이 빛나는 사이버펑크 분위기.

### 4.2 색상 팔레트

#### 배경
| 요소 | HEX 코드 | 용도 |
|------|----------|------|
| 배경 상단 | `#0a0a1a` | 그라디언트 상단 (짙은 남색) |
| 배경 하단 | `#1a0a2e` | 그라디언트 하단 (짙은 보라) |
| 코어 채우기 | `#1a1a3e` | 중앙 헥사곤 내부 |
| 코어 테두리 | `#4a4a8a` | 중앙 헥사곤 윤곽선 |
| 한계선 | `#ff2255` | 게임오버 기준선 (반투명 원) |
| 격자선 | `#ffffff10` | 변 구분 가이드 |

#### 블록 색상 (네온)
| 색상 | 채우기 HEX | 글로우 HEX | 글자 | 도형 |
|------|-----------|-----------|------|------|
| 빨강 | `#ff3366` | `#ff336680` | R | 원 |
| 파랑 | `#3388ff` | `#3388ff80` | B | 다이아 |
| 초록 | `#33ff88` | `#33ff8880` | G | 삼각 |
| 노랑 | `#ffdd33` | `#ffdd3380` | Y | 사각 |
| 보라 | `#bb44ff` | `#bb44ff80` | P | 별 |
| 주황 | `#ff8833` | `#ff883380` | O | 이중원 |

> 색각이상 접근성: 색상 + 도형 + 글자 **3중 구분** (Cycle 5/14 검증 패턴)

### 4.3 코어 헥사곤
- 정육각형, **pointy-top** 방향 (꼭짓점이 위/아래)
- 외접원 반지름: `CONFIG.CORE_RADIUS = 60`px
- 테두리 두께: 2px, 색상 `#4a4a8a`
- 내부 채우기: `#1a1a3e`
- 회전 시 60도 단위 스냅 (tween으로 부드러운 보간, 150ms easeOutCubic)

### 4.4 블록
- 사다리꼴(trapezoid) 형태: 코어 변에 맞닿는 안쪽이 좁고 바깥쪽이 넓음
- 높이: `CONFIG.BLOCK_HEIGHT = 20`px
- 블록 내부에 색상별 **도형 아이콘** + **글자** 표시 (10px 크기)
- 네온 글로우: `shadowBlur = 8`, `shadowColor = 해당 색상 글로우 HEX`

### 4.5 한계선
- 코어 중심에서 반지름 `CONFIG.CORE_RADIUS * 2.5 = 150`px의 원
- 색상: `#ff2255`, 투명도 30% (`globalAlpha = 0.3`)
- 블록이 3층 이상 쌓이면 투명도 50%로 경고, 4층이면 70%로 위험 표시

### 4.6 UI 요소
| 요소 | 위치 | 크기/폰트 | 색상 |
|------|------|-----------|------|
| SCORE 라벨 | 좌상단 (10, 24) | 12px | `#888888` |
| 점수 값 | 좌상단 (10, 44) | 24px bold | `#ffffff` |
| LEVEL 라벨 | 좌상단 (10, 70) | 12px | `#888888` |
| 레벨 값 | 좌상단 (10, 90) | 20px bold | `#33ff88` |
| HIGH SCORE | 우상단 (right-10, 24) | 12px | `#888888` |
| 하이스코어 값 | 우상단 (right-10, 44) | 18px bold | `#ffdd33` |
| 일시정지 버튼 | 우상단 | 48x48px (F1 준수) | `#ffffff` |
| COMBO 표시 | 코어 상단 | 28px bold | `#ff3366` |
| LEVEL UP! | 중앙 | 32px bold, 페이드 | `#33ff88` |

### 4.7 터치 타겟 최소 크기
모든 인터랙티브 요소: **48x48px 이상** (CONFIG.MIN_TOUCH_TARGET = 48)
- 일시정지 버튼: 48x48px
- 좌/우 회전 탭 영역: 화면 절반 (항상 48px 이상)
- 게임 시작/재시작 버튼: 160x48px

### 4.8 배경 효과
- 느리게 움직이는 별(Star) 파티클: 20개, 1~2px 크기, 30% 투명도
- **offscreen canvas에 캐싱** (F20): `bgCache`에 그라디언트 렌더링, `resizeCanvas()` 시에만 재빌드
- 별 위치만 매 프레임 업데이트 (y += 0.2), bgCache 위에 오버레이

---

## §5. 핵심 게임 루프

### 5.1 초기화 순서 (F5 준수)
```
1. 상수/CONFIG 객체 선언
2. let 변수 선언 (canvas, ctx 포함)
3. 유틸 클래스 정의 (TweenManager, ObjectPool, SoundManager)
4. 게임 로직 순수 함수 정의
5. window.addEventListener('load', init)
   init() 내부:
      a. canvas = document.getElementById('gameCanvas')
      b. ctx = canvas.getContext('2d')
      c. resizeCanvas()
      d. registerEventListeners()
      e. loadHighScore()
      f. enterState(STATE.TITLE)
      g. requestAnimationFrame(gameLoop)
```

### 5.2 프레임 루프 (60fps 기준)
```
gameLoop(timestamp):
  try {
    dt = Math.min((timestamp - lastTime) / 1000, 0.033)  // 33ms 캡
    lastTime = timestamp

    // 상태별 업데이트 (§6 매트릭스 참조)
    update(dt)

    // 렌더링
    render()
  } catch(e) {
    console.error(e)
  }
  requestAnimationFrame(gameLoop)
```

### 5.3 update(dt) 흐름
```
1. tweenManager.update(dt)          — 모든 상태에서 실행 (매트릭스)
2. if (state === PLAYING):
   a. dropTimer += dt
   b. if (dropTimer >= dropInterval):
      - 낙하 중인 블록 한 칸 이동 OR 코어 변에 착지
      - dropTimer = 0
   c. 블록 착지 시:
      - findMatches(grid) → 매칭 셀 목록
      - if (매칭 있음): resolveMatches() (isResolving = true)
      - else: spawnNewBlock()
   d. checkGameOver(grid) → 한계선 초과 검사
3. particlePool.update(dt)           — PLAYING + GAMEOVER에서 실행
```

### 5.4 핵심 가드 패턴
- **isResolving**: 매칭→소멸→낙하→연쇄 처리 중 true. 새 블록 스폰 차단, 입력 차단
- **isRotating**: 회전 tween 진행 중 true. 추가 회전 입력 차단
- **_transitioning**: TransitionGuard 플래그. 화면 전환 중 true

---

## §6. 상태 머신 및 상태x시스템 매트릭스

### 6.1 상태 정의
```
STATE = {
  TITLE: 0,      // 타이틀 화면
  PLAYING: 1,    // 게임 진행 중
  PAUSED: 2,     // 일시정지
  GAMEOVER: 3    // 게임 오버
}
```

### 6.2 상태 전환 규칙

```
TITLE ---[Enter/탭]---> PLAYING    (beginTransition)
PLAYING ---[Space/P]---> PAUSED    (즉시, 예외)
PAUSED ---[Space/P]---> PLAYING    (즉시, 예외)
PLAYING ---[한계초과]---> GAMEOVER  (beginTransition)
GAMEOVER ---[Enter/탭]---> TITLE   (beginTransition)
```

**STATE_PRIORITY**: `{ GAMEOVER: 3, PAUSED: 2, PLAYING: 1, TITLE: 0 }`
- GAMEOVER 전환은 항상 최우선 (F17)
- beginTransition() 내부에서 현재 상태보다 우선순위가 낮은 전환 요청은 무시

### 6.3 상태 x 시스템 업데이트 매트릭스 (F6)

| 시스템 \ 상태 | TITLE | PLAYING | PAUSED | GAMEOVER |
|--------------|-------|---------|--------|----------|
| TweenManager | O | O | O | O |
| 블록 낙하 | X | O | X | X |
| 매칭 판정 | X | O | X | X |
| 입력 처리 | 시작만 | 회전/드롭/정지 | 재개만 | 재시작만 |
| ParticlePool | X | O | X | O (잔존) |
| SoundManager | 음소거 | 효과음 | 음소거 | 효과음 |
| 배경 별 | O | O | X | O |

### 6.4 enterState(newState) 패턴
각 상태 진입 시 초기화를 일원화:
```
enterState(TITLE):    resetGame(), 타이틀 tween 시작
enterState(PLAYING):  dropTimer=0, spawnNewBlock()
enterState(PAUSED):   (추가 초기화 없음)
enterState(GAMEOVER): saveHighScore(), 게임오버 tween 시작, 폭발 파티클
```

---

## §7. 점수 시스템

### 7.1 기본 점수 (F16: addScore() 단일 경로)
```
addScore(amount):
  score += amount
  // 하이스코어 판정 먼저 (판정->저장 순서)
  isNewHigh = score > highScore
  if (isNewHigh): highScore = score
```

### 7.2 점수 계산 공식
| 이벤트 | 점수 | 공식 |
|--------|------|------|
| 3블록 매칭 | 30 | `3 x 10` |
| 4블록 매칭 | 50 | `4 x 10 + 10(보너스)` |
| 5블록 매칭 | 80 | `5 x 10 + 30(보너스)` |
| 6+ 블록 매칭 | `n x 10 + (n-3) x 20` | 초과 보너스 증가 |
| 연쇄 배수 | x(1 + cascade x 0.5) | cascade=0: x1, cascade=1: x1.5, cascade=2: x2, ... |
| 하드 드롭 보너스 | 2 x 남은 칸 수 | 빠른 낙하 보상 |

### 7.3 콤보 시스템
- 연속 매칭(cascade) 횟수를 추적
- cascade >= 2 시 "COMBO xN" 텍스트 표시 (코어 상단, 페이드 아웃 tween)
- cascade >= 3 시 화면 미세 흔들림 (screenShake tween, 3px, 200ms)
- cascade >= 5 시 "AMAZING!" 텍스트 추가

### 7.4 레벨업 점수 보너스
- 레벨업 시 레벨 x 100 보너스 점수 (레벨 5 도달 시 +500)

---

## §8. 시각적 구현 상세

### 8.1 헥사곤 좌표계
**Pointy-top 헥사곤** 사용 (꼭짓점이 12시/6시 방향):

```
꼭짓점 i (0~5):
  angle = 60deg x i - 30deg  (pointy-top 오프셋)
  x = centerX + radius x cos(angle)
  y = centerY + radius x sin(angle)
```

**변(Side) 인덱스**: 0 = 우상단, 시계방향으로 1~5
```
Side 0: 꼭짓점 0-1 사이
Side 1: 꼭짓점 1-2 사이
Side 2: 꼭짓점 2-3 사이
Side 3: 꼭짓점 3-4 사이
Side 4: 꼭짓점 4-5 사이
Side 5: 꼭짓점 5-0 사이
```

### 8.2 블록 렌더링
각 블록은 코어 변에 쌓이는 사다리꼴:
```
drawBlock(side, layer, color):
  // 변의 두 꼭짓점 좌표 계산
  innerR = CORE_RADIUS + layer x BLOCK_HEIGHT
  outerR = innerR + BLOCK_HEIGHT
  // 4개 꼭짓점: (side 시작 꼭짓점의 innerR, outerR) x 2
  // 사다리꼴 path -> fill(color) + stroke(borderColor)
  // 중앙에 도형+글자 표시
```

### 8.3 배경 캐싱 (F20)
```
let bgCache = null;

function buildBgCache():
  bgCache = document.createElement('canvas')
  bgCache.width = canvas.width
  bgCache.height = canvas.height
  const bgCtx = bgCache.getContext('2d')
  // 그라디언트 배경 렌더링
  const grad = bgCtx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0a0a1a')
  grad.addColorStop(1, '#1a0a2e')
  bgCtx.fillStyle = grad
  bgCtx.fillRect(0, 0, w, h)

function resizeCanvas():
  // ... 리사이즈 로직 ...
  buildBgCache()  // 리사이즈 시에만 재빌드

function render():
  ctx.drawImage(bgCache, 0, 0)  // 캐시된 배경 한 번에 그리기
  // 별 파티클 오버레이 (위치만 변경)
  // 게임 요소 렌더링
```

### 8.4 회전 애니메이션
코어 회전 시 전체 그리드가 함께 회전:
```
rotateCore(direction):  // direction: -1(반시계) or +1(시계)
  if (isRotating) return
  isRotating = true
  targetAngle = currentAngle + direction * (Math.PI / 3)  // 60deg
  tweenManager.add({
    obj: coreState,
    prop: 'angle',
    from: currentAngle,
    to: targetAngle,
    duration: 150,
    easing: easeOutCubic,
    onComplete: () => {
      // 그리드 데이터 회전 (논리적)
      rotateGridData(grid, direction)
      currentAngle = targetAngle
      isRotating = false
    }
  })
```

### 8.5 블록 소멸 애니메이션
```
resolveMatches():
  isResolving = true
  matchedCells = findMatches(grid)
  // 매칭된 블록에 소멸 tween (150ms, 스케일 1->0 + alpha 1->0)
  tweenManager.add({
    duration: 150,
    onUpdate: (t) => { /* 매칭 블록 스케일/알파 보간 */ },
    onComplete: () => {
      removeMatchedBlocks(grid, matchedCells)
      applyGravity(grid)  // 빈 칸으로 블록 내려오기
      // 재귀: 새 매칭 확인
      const newMatches = findMatches(grid)
      if (newMatches.length > 0) {
        cascadeCount++
        resolveMatches()  // 연쇄
      } else {
        isResolving = false
        cascadeCount = 0
        spawnNewBlock()
      }
    }
  })
```

---

## §9. 사운드 시스템

### 9.1 Web Audio API 절차적 사운드 (F2: setTimeout 0건)
```
SoundManager:
  ctx: AudioContext (lazy init on first user gesture)
  muted: false

  play(type):
    if (muted || !ctx) return
    const now = ctx.currentTime
    // 타입별 oscillator 설정 (모두 ctx.currentTime 기반 스케줄링)
```

### 9.2 효과음 목록 (5종)
| # | 이벤트 | 파형 | 주파수 | 지속 | 비고 |
|---|--------|------|--------|------|------|
| 1 | 회전 | sine | 440->520Hz | 80ms | 짧은 스윕 |
| 2 | 블록 착지 | triangle | 220Hz | 100ms | 둔탁한 톤 |
| 3 | 매칭 소멸 | sine | 523->784Hz | 150ms | 상승 톤 |
| 4 | 콤보 (cascade>=2) | sine+square | 659->1047Hz | 200ms | 높은 화음 |
| 5 | 게임 오버 | sawtooth | 440->110Hz | 500ms | 하강 톤 |

### 9.3 사운드 체감 체크리스트 (F21)
- [ ] 회전 효과음이 조작 즉시 재생되는가
- [ ] 블록 착지 시 시각+청각 피드백이 동기화되는가
- [ ] 연쇄 콤보 시 톤이 점진적으로 상승하여 쾌감을 주는가
- [ ] 게임 오버 효과음이 패배감을 전달하는가
- [ ] 모든 효과음이 볼륨 적절한가 (gainNode.gain = 0.3 기본)

---

## §10. 순수 함수 시그니처 (F11)

> 모든 게임 로직 함수는 파라미터로 데이터를 수신한다. 전역 직접 참조 금지.

| # | 함수명 | 파라미터 | 반환값 | 용도 |
|---|--------|---------|--------|------|
| 1 | `hexVertex(cx, cy, r, i)` | 중심좌표, 반지름, 인덱스 | `{x, y}` | 헥사곤 꼭짓점 좌표 |
| 2 | `sideVertices(cx, cy, r, side)` | 중심, 반지름, 변 인덱스 | `[{x,y},{x,y}]` | 변의 두 끝점 |
| 3 | `blockVertices(cx, cy, r, side, layer, bh)` | 중심, 반지름, 변, 층, 블록높이 | `[4개 {x,y}]` | 블록 사다리꼴 꼭짓점 |
| 4 | `findMatches(grid)` | 6x4 그리드 배열 | `[{side, layer}]` | 3+인접 매칭 탐색 |
| 5 | `rotateGridData(grid, dir)` | 그리드, 방향(+/-1) | 새 그리드 | 논리적 회전 |
| 6 | `applyGravity(grid)` | 그리드 | 변경된 그리드 | 빈 칸 채우기(낙하) |
| 7 | `checkGameOver(grid, maxLayer)` | 그리드, 한계층수 | boolean | 게임 오버 판정 |
| 8 | `calcScore(matchCount, cascadeCount)` | 매칭수, 연쇄수 | number | 점수 계산 |
| 9 | `getDropInterval(level)` | 레벨 | number(초) | 낙하 속도 |
| 10 | `getActiveColors(level)` | 레벨 | number | 활성 색상 수 |
| 11 | `randomBlock(colorCount, rng)` | 색상수, 난수함수 | `{color, side}` | 새 블록 생성 |
| 12 | `isAdjacent(s1, l1, s2, l2)` | 변1,층1,변2,층2 | boolean | 인접 판정 |

---

## §11. 난이도 시스템

### 11.1 낙하 속도 (레벨별)
```
getDropInterval(level):
  return Math.max(0.4, 2.0 - (level - 1) * 0.085)
```

| 레벨 | 낙하 간격(초) | 체감 |
|------|-------------|------|
| 1 | 2.000 | 여유 |
| 3 | 1.830 | 여유 |
| 5 | 1.660 | 보통 |
| 8 | 1.405 | 약간 빠름 |
| 10 | 1.235 | 빠름 |
| 13 | 0.980 | 상당히 빠름 |
| 15 | 0.810 | 바쁨 |
| 18 | 0.555 | 매우 바쁨 |
| 20 | 0.400 | 극한 (최소값) |

### 11.2 색상 수 증가 (§2.2 재확인)
레벨 4에서 4색, 레벨 8에서 5색, 레벨 13에서 6색 — 색상이 늘면 매칭 확률이 감소하여 난이도 자연 상승.

### 11.3 블록 스폰 패턴
- 레벨 1~5: 한 번에 1개 블록 낙하
- 레벨 6~10: 가끔 2개 동시 낙하 (30% 확률)
- 레벨 11+: 2개 동시 낙하 (50% 확률)
- 동시 낙하 시 반드시 **서로 다른 변**에서 스폰 (같은 변 금지)

### 11.4 "구제" 메커닉
- 모든 변에 2층 이상 쌓인 상태가 5초 지속되면, 다음 블록은 가장 적게 쌓인 변에서 스폰 (생존 기회 부여)
- 연쇄 cascade >= 4 시 0.5초 일시 감속 (시각적 연출 겸 보상)

---

## §12. 구현 가이드라인 및 체크리스트

### 12.1 초기화 순서 체크리스트 (F5)
- [ ] 모든 `let`/`const` 변수가 최초 사용 이전에 선언됨
- [ ] `canvas`와 `ctx`는 `init()` 내부에서만 할당
- [ ] 모든 이벤트 리스너는 `registerEventListeners()` 내부 (init() 호출)
- [ ] `window.addEventListener('load', init)` — 유일한 최상위 레벨 이벤트

### 12.2 금지 패턴
- [ ] `setTimeout` / `setInterval` 사용 0건
- [ ] `eval()` / `Function()` 사용 0건
- [ ] `alert()` / `confirm()` / `prompt()` 사용 0건
- [ ] `innerHTML` / `outerHTML` 사용 0건
- [ ] `fetch()` / `XMLHttpRequest` / `new Image()` 사용 0건
- [ ] 외부 CDN 로드 0건 (Google Fonts 포함)
- [ ] `feGaussianBlur` / SVG 필터 사용 0건
- [ ] 전역 변수 직접 참조 게임 로직 함수 0건

### 12.3 터치 타겟 체크리스트 (F1/F4)
- [ ] 일시정지 버튼: 48x48px 이상
- [ ] 시작 버튼: 160x48px 이상
- [ ] 재시작 버튼: 160x48px 이상
- [ ] 모든 버튼 크기에 `CONFIG.MIN_TOUCH_TARGET` 직접 참조

### 12.4 방어적 코딩 패턴
- [ ] 게임 루프 `try-catch` 래핑 (F12)
- [ ] `localStorage` 접근 `try-catch` 래핑
- [ ] AudioContext 생성 `try-catch` 래핑
- [ ] delta time 33ms 캡 (`Math.min(dt, 0.033)`)

### 12.5 setTimeout 제로 정책 (F2/F8)
- 상태 전환: tween `onComplete` 콜백만 사용
- 사운드 시퀀싱: `ctx.currentTime + offset` 네이티브 스케줄링
- 타이머 기반 이벤트: dt 누적 기반 카운터 (게임 루프 내)

### 12.6 에셋 제로 정책 (F3/F23)
- **assets/ 디렉토리 절대 생성 금지**
- 허용 파일: `index.html` + `thumbnail.svg`만
- 100% Canvas 코드 드로잉 (hexVertex(), drawBlock() 등 §10 함수)
- 100% Web Audio API 절차적 사운드
- 폰트: `monospace`, `sans-serif` 시스템 폰트만 사용

### 12.7 스모크 테스트 게이트 (F13/F23)
리뷰 제출 전 필수 확인:
1. [ ] `index.html` 파일 존재
2. [ ] `thumbnail.svg` 파일 존재
3. [ ] assets/ 디렉토리 미존재
4. [ ] `index.html` 외 HTML 파일 미존재
5. [ ] 브라우저 로드 성공
6. [ ] 콘솔 에러 0건
7. [ ] 타이틀 화면 정상 표시
8. [ ] 게임 시작 가능 (Enter 키 / 탭)
9. [ ] 블록 낙하 + 코어 회전 동작 확인

### 12.8 회귀 테스트 체크리스트 (F14)
수정 후 전체 플로우 확인:
1. [ ] TITLE 화면 표시
2. [ ] TITLE -> PLAYING 전환 (beginTransition)
3. [ ] PLAYING 중 블록 낙하 + 회전 + 매칭
4. [ ] PLAYING -> PAUSED -> PLAYING 토글
5. [ ] PLAYING -> GAMEOVER 전환 (beginTransition)
6. [ ] GAMEOVER -> TITLE 전환 (beginTransition)
7. [ ] 하이스코어 저장/로드

### 12.9 성능 최적화 체크리스트 (F20)
- [ ] 배경 그라디언트: offscreen canvas 캐싱 (`bgCache`)
- [ ] 리사이즈 시에만 `buildBgCache()` 재빌드
- [ ] ObjectPool: 파티클 50개 + 팝업 텍스트 10개
- [ ] 블록 렌더링: 뷰포트 밖 블록 렌더 스킵

---

## §13. 수치 정합성 검증

### 13.1 CONFIG 수치 테이블 (F10)
| 상수명 | 기획 값 | 코드 확인란 |
|--------|---------|------------|
| `CORE_RADIUS` | 60 | [ ] |
| `BLOCK_HEIGHT` | 20 | [ ] |
| `MAX_LAYERS` | 4 | [ ] |
| `GAMEOVER_RADIUS_MULT` | 2.5 | [ ] |
| `MIN_TOUCH_TARGET` | 48 | [ ] |
| `ROTATION_DURATION` | 150 (ms) | [ ] |
| `DROP_INTERVAL_BASE` | 2.0 (초) | [ ] |
| `DROP_INTERVAL_MIN` | 0.4 (초) | [ ] |
| `DROP_INTERVAL_STEP` | 0.085 | [ ] |
| `BLOCKS_PER_LEVEL` | 10 | [ ] |
| `MAX_LEVEL` | 20 | [ ] |
| `SCORE_PER_BLOCK` | 10 | [ ] |
| `COMBO_MULTIPLIER` | 0.5 | [ ] |
| `HARD_DROP_BONUS` | 2 | [ ] |
| `LEVEL_BONUS_MULT` | 100 | [ ] |
| `PARTICLE_POOL_SIZE` | 50 | [ ] |
| `POPUP_POOL_SIZE` | 10 | [ ] |
| `STAR_COUNT` | 20 | [ ] |
| `SCREEN_SHAKE_PX` | 3 | [ ] |
| `SCREEN_SHAKE_MS` | 200 | [ ] |
| `DT_CAP` | 0.033 | [ ] |
| `DUAL_SPAWN_LEVEL` | 6 | [ ] |
| `DUAL_SPAWN_PROB_LOW` | 0.3 | [ ] |
| `DUAL_SPAWN_PROB_HIGH` | 0.5 | [ ] |
| `DUAL_SPAWN_LEVEL_HIGH` | 11 | [ ] |
| `RESCUE_THRESHOLD_SEC` | 5 | [ ] |
| `CASCADE_SLOWDOWN_SEC` | 0.5 | [ ] |
| `CASCADE_SLOWDOWN_MIN` | 4 | [ ] |
| `ACTIVE_COLORS_LV4` | 4 | [ ] |
| `ACTIVE_COLORS_LV8` | 5 | [ ] |
| `ACTIVE_COLORS_LV13` | 6 | [ ] |

### 13.2 변수 사용처 검증 테이블 (F15)
| 변수명 | 선언 위치 | 갱신 위치 | 사용(읽기) 위치 |
|--------|----------|-----------|----------------|
| `score` | 전역 | `addScore()` 단일 | render(), enterState(GAMEOVER) |
| `highScore` | 전역 | `addScore()`, `loadHighScore()` | render() |
| `level` | 전역 | `setLevel()` 단일 | getDropInterval(), getActiveColors(), render() |
| `cascadeCount` | 전역 | resolveMatches() | calcScore(), render(콤보UI) |
| `dropTimer` | 전역 | update() | update() |
| `isResolving` | 전역 | resolveMatches() 시작/종료 | update(), 입력 핸들러 |
| `isRotating` | 전역 | rotateCore() 시작/완료 | 입력 핸들러 |
| `grid` | 전역 (6x4 배열) | rotateGridData(), removeMatchedBlocks(), applyGravity() | findMatches(), render(), checkGameOver() |
| `currentAngle` | 전역 | rotateCore() onComplete | render() |
| `state` | 전역 | enterState() | update(), render(), 입력 핸들러 |
| `bgCache` | 전역 | buildBgCache() | render() |

### 13.3 기능별 세부 구현 체크리스트 (F22)
| # | 기능 | 세부 항목 | 구현 확인 |
|---|------|-----------|----------|
| 1 | 코어 렌더링 | a. 정육각형 그리기 | [ ] |
| | | b. pointy-top 방향 | [ ] |
| | | c. 테두리 + 채우기 | [ ] |
| 2 | 블록 렌더링 | a. 사다리꼴 형태 | [ ] |
| | | b. 색상별 네온 글로우 | [ ] |
| | | c. 도형+글자 아이콘 | [ ] |
| 3 | 블록 낙하 | a. 지정 변 방향으로 이동 | [ ] |
| | | b. 코어 변 착지 | [ ] |
| | | c. 층 쌓기 | [ ] |
| 4 | 코어 회전 | a. 좌/우 60도 tween | [ ] |
| | | b. isRotating 가드 | [ ] |
| | | c. 그리드 데이터 논리 회전 | [ ] |
| 5 | 매칭 판정 | a. 같은 변 연속 3+ | [ ] |
| | | b. 이웃 변 같은 층 연결 | [ ] |
| | | c. BFS/DFS 탐색 | [ ] |
| 6 | 소멸+연쇄 | a. 소멸 tween (150ms) | [ ] |
| | | b. 중력 낙하 | [ ] |
| | | c. 재매칭 -> cascade 루프 | [ ] |
| | | d. cascadeCount 정확 추적 | [ ] |
| 7 | 레벨 시스템 | a. 10블록당 레벨업 | [ ] |
| | | b. 낙하 속도 증가 | [ ] |
| | | c. 색상 수 증가 | [ ] |
| | | d. 레벨업 시각 연출 | [ ] |
| 8 | 하드 드롭 | a. 즉시 착지 | [ ] |
| | | b. 보너스 점수 | [ ] |
| 9 | 게임 오버 | a. 한계선 초과 판정 | [ ] |
| | | b. 게임오버 연출 | [ ] |
| | | c. 하이스코어 저장 | [ ] |
| 10 | 터치 조작 | a. 좌/우 탭 회전 | [ ] |
| | | b. 스와이프 하드 드롭 | [ ] |
| | | c. touch-action: none | [ ] |
| | | d. passive: false | [ ] |
| 11 | 사운드 5종 | a. 회전 | [ ] |
| | | b. 착지 | [ ] |
| | | c. 소멸 | [ ] |
| | | d. 콤보 | [ ] |
| | | e. 게임오버 | [ ] |
| 12 | 배경 캐싱 | a. bgCache offscreen | [ ] |
| | | b. resizeCanvas에서만 재빌드 | [ ] |
| 13 | 한계선 표시 | a. 기본 30% 투명도 | [ ] |
| | | b. 3층 50% 경고 | [ ] |
| | | c. 4층 70% 위험 | [ ] |
| 14 | 이중 스폰 | a. 레벨 6+ 30% | [ ] |
| | | b. 레벨 11+ 50% | [ ] |
| | | c. 서로 다른 변 | [ ] |

---

## §14. 게임 페이지 사이드바 데이터

```yaml
game:
  title: "네온 헥스 드롭"
  description: "중앙 헥사곤을 회전시켜 6방향에서 떨어지는 네온 블록을 정렬하라! 같은 색 3개를 모으면 소멸, 연쇄 콤보로 고득점을 노려라."
  genre: ["puzzle", "arcade"]
  playCount: 0
  rating: 0
  controls:
    - "← → : 코어 회전"
    - "↓ : 하드 드롭"
    - "Space/P : 일시정지"
    - "터치: 좌/우 탭 회전, 아래 스와이프 드롭"
  tags:
    - "#낙하블록"
    - "#헥사곤"
    - "#퍼즐"
    - "#네온"
    - "#Hextris"
    - "#연쇄콤보"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## §15. thumbnail.svg 가이드

4:3 비율 (400x300px), 내용:
- 중앙에 네온 글로우 정육각형 (pointy-top)
- 3개 변에 2~3층 색상 블록 쌓인 상태
- 1개 블록이 낙하 중 (모션 라인)
- 상단에 "NEON HEX DROP" 텍스트 (네온 글로우)
- 배경: `#0a0a1a` -> `#1a0a2e` 그라디언트
- SVG 필터 **사용 금지** (feGaussianBlur 등) — 순수 도형만으로 글로우 표현 (투명도 레이어)
