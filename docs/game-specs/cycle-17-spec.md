---
game-id: neon-bubble-pop
title: 네온 버블 팝
genre: arcade
difficulty: medium
---

# 네온 버블 팝 — 상세 기획서

_사이클 #17 | 작성일: 2026-03-22_

---

## §0. 이전 사이클 피드백 반영 매핑

> Cycle 16 포스트모템 "아쉬웠던 점" + platform-wisdom 누적 교훈(F1~F23, 16사이클)을 기획 단계에서 선제 대응한다.

| # | 출처 | 문제 | 이번 기획서 해결 방법 | 해당 섹션 |
|---|------|------|----------------------|-----------|
| F1 | Cycle 1~16 (16사이클 연속) | assets/ 디렉토리 재발 | **빈 index.html에서 처음부터 작성.** assets/ 디렉토리 절대 생성 금지. 100% Canvas 코드 드로잉. thumbnail.svg만 허용 | §8, §12.6 |
| F2 | Cycle 2~4 | SVG 필터(feGaussianBlur) 재발 | Canvas `arc()` + `createRadialGradient()`로 버블 렌더링. SVG 필터 코드 **0줄** | §8.2 |
| F3 | Cycle 1~5 | setTimeout 상태 전환 | tween `onComplete` 콜백으로만 상태 전환. setTimeout 사용 **완전 금지** | §5, §12.5 |
| F4 | Cycle 6~8 | 전역 참조 함수 → 테스트 불가 | 순수 함수 패턴 — 모든 게임 로직 함수는 파라미터로 데이터 수신. §10에 시그니처 정의 | §10 |
| F5 | Cycle 2/3 | 상태×시스템 매트릭스 누락 | §6에 4상태 × 4시스템 매트릭스 선행 작성 | §6 |
| F6 | Cycle 4/5 | TweenManager cancelAll+add 경쟁 조건 | `clearImmediate()` 즉시 플러시 API 분리. resetGame()에서 clearImmediate() 사용 | §5.5 |
| F7 | Cycle 15~16 | 범위 축소 전략 성공 | **상태 4개**(TITLE/PLAYING/PAUSED/GAMEOVER), 목표 1종(고득점), 스테이지 분기 없음 | §1, §6 |
| F8 | Cycle 1 | iframe 환경 호환성 | alert/confirm/prompt/window.open **미사용**. Canvas 기반 모달 only | §8.5 |
| F9 | Cycle 7~16 | 기획서 수치 ↔ 코드 수치 불일치 | §13 수치 정합성 검증 테이블 필수 포함. 색상 배열·열거형 데이터까지 대조 | §13 |
| F10 | Cycle 5~16 | offscreen 캐싱 미적용 | 배경 그리드 + 정적 UI는 offscreen canvas 1회 렌더 후 캐싱 | §8.3 |
| F11 | Cycle 11~16 | 터치 타겟 48px 미달 | `CONFIG.MIN_TOUCH_TARGET: 48` 직접 참조. 일시정지 버튼 `Math.max(48, size)` 강제 | §4.7, §12.3 |
| F12 | Cycle 10 | 게임 루프 try-catch 미적용 | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` 기본 적용 | §5.3 |
| F13 | Cycle 13~14 | 스모크 테스트 3단계 미비 | 리뷰 제출 전: (1) index.html 존재 (2) 페이지 로드 성공 (3) 콘솔 에러 0건 | §12.7 |
| F14 | Cycle 3/4 | 가드 플래그 누락 → 콜백 반복 호출 | 버블 팝/낙하 처리 시 `isPopping` 가드 + TransitionGuard 패턴 | §5.4 |
| F15 | Cycle 3/7 | 유령 변수 (선언만 하고 미사용) | §13.2 변수 사용처 검증 테이블 포함 | §13.2 |
| F16 | Cycle 5 | 하나의 값에 대한 갱신 경로 이중화 | score/combo는 단일 함수(`addScore()`, `addCombo()`)로만 갱신 | §7.1 |
| F17 | Cycle 3 | 상태 전환 우선순위 체계 | GAMEOVER > PAUSED > PLAYING. STATE_PRIORITY 맵 | §6.2 |
| F18 | Cycle 11/14 | let/const TDZ 크래시 + 초기화 순서 | 변수 선언 → DOM 할당 → 이벤트 등록 → init() 순서 명시 | §5.1, §12.1 |
| F19 | Cycle 10 | 수정 회귀 | 수정 시 전체 플로우 회귀 테스트 필수 (TITLE→PLAY→PAUSE→GAMEOVER) | §12.8 |
| F20 | Cycle 5/8 | beginTransition() 우회 직접 전환 | 모든 화면 전환은 `beginTransition()` 경유. PAUSED만 예외(즉시 전환) | §6.2 |
| F21 | Cycle 16 아쉬운점 | NEXT 블록 프리뷰 미구현 | **NEXT 버블 프리뷰 UI** — 발사대 옆에 다음 버블 색상 표시 | §2.6 |
| F22 | Cycle 16 아쉬운점 | 마우스 하드드롭 미지원 | 마우스 단독 플레이 **완전 지원** — 조준+클릭으로 모든 조작 가능 | §4 |
| F23 | Cycle 16 아쉬운점 | 레벨별 활성 색상 수 불일치 (배열/열거형) | 수치 정합성 테이블에 색상 배열까지 포함. §13.1 참조 | §13.1 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
네온 글로우 스타일의 **버블 슈터**. 화면 하단 발사대에서 색상 버블을 조준·발사하여, 같은 색 3개 이상이 연결되면 터뜨리는 클래식 메커닉. 콤보 연쇄와 고립 버블 낙하(Orphan Drop)로 전략적 깊이를 제공한다. 일정 발사 횟수마다 천장이 한 줄 내려와 긴장감을 높인다.

### 핵심 재미 요소
1. **조준의 쾌감**: 각도를 미세 조정하여 좁은 틈새로 버블을 쏘아 넣는 기술적 쾌감. 벽 반사(1회 바운스)를 활용한 트릭 샷
2. **연쇄 팝의 만족감**: 3+ 매칭 팝 후 매달림 잃은 고립(Orphan) 버블이 우수수 떨어지는 대량 소거의 시각·청각 보상
3. **NEXT 버블 전략**: 다음에 올 버블 색을 미리 보고 현재 버블의 최적 배치를 계획하는 전략적 깊이
4. **천장 압박의 긴장**: 5발마다 천장이 1줄 내려와 게임 영역이 점점 좁아지는 타임 프레셔
5. **한 판 2~5분**: 즉시 재도전 가능한 세션 길이. "한 번만 더"의 중독 루프

### 장르 균형 기여
- 현재 플랫폼: arcade 8개, puzzle 7개, casual 7개 — **버블 슈터 0개**
- 이 게임: **arcade + casual** → 최근 5사이클 중 3개가 puzzle인 편향 탈피
- CrazyGames 아케이드 TOP 10 중 3개가 버블 슈터류 — 시장 검증 완료

### Cycle 16 포스트모템 반영 포인트
- **NEXT 프리뷰**: Cycle 16에서 "NEXT UI 없이 전략 깊이 부족" 지적 → 발사대 옆 NEXT 버블 표시
- **마우스 단독 플레이 완전 지원**: Cycle 16 "마우스 하드드롭 미지원" → aim+click만으로 모든 조작
- **범위 축소 계승**: 상태 4개, 목표 1종(고득점), 스테이지 분기 없음
- **레벨별 색상 수 정합성**: 수치 테이블에 배열/열거형 데이터 포함

---

## §2. 게임 규칙 및 목표

### 2.1 기본 규칙
1. 화면 상단에 **오프셋 격자(offset hex grid)** 배열로 버블이 배치된다
2. 화면 하단 중앙에 **발사대(Launcher)** 가 위치한다
3. 플레이어는 각도를 조준하여 버블을 발사한다
4. 발사된 버블은 직선으로 이동하며, **좌우 벽에 1회 반사** 가능하다
5. 버블이 격자의 다른 버블 또는 천장에 닿으면 **가장 가까운 빈 격자 셀에 스냅**된다
6. 스냅 후 같은 색 **3개 이상 연결**(BFS 인접 탐색)된 그룹은 팝(소멸)된다
7. 팝 후 천장에 연결되지 않은 **고립 버블(Orphans)** 도 함께 낙하·소멸된다

### 2.2 격자 구조
- **열(columns)**: 짝수 행 8개, 홀수 행 7개 (오프셋 배열)
- **행(rows)**: 초기 5행. 천장 하강 시 +1행씩 추가
- **셀 크기**: `CONFIG.BUBBLE_RADIUS` = 18px, 셀 간격 = `BUBBLE_RADIUS * 2`
- **인접 정의**: 각 셀은 최대 6개 이웃 (좌, 우, 좌상, 우상, 좌하, 우하) — 행 짝/홀에 따라 오프셋 다름

### 2.3 발사 메커닉
- 조준 각도 범위: **10° ~ 170°** (수평 기준, 0°=우측). 최소/최대 각도 클램핑으로 수평 발사 방지
- 발사 속도: `CONFIG.SHOOT_SPEED` = 12 px/frame
- 벽 반사: 좌우 벽 터치 시 X 속도 반전 (최대 1회 반사)
- 충돌 판정: 발사 버블 중심과 격자 버블 중심 거리 < `BUBBLE_RADIUS * 2`
- 스냅: 충돌 지점에서 가장 가까운 빈 격자 셀 좌표로 즉시 이동

### 2.4 매칭 규칙
- **BFS 탐색**: 스냅된 셀에서 시작, 같은 색 인접 셀을 BFS로 탐색
- **3개 이상** 연결되면 해당 그룹 전체 팝
- 팝 후 **Orphan 탐색**: 천장(row=0)에 연결된 버블만 유지, 나머지는 Orphan으로 낙하
- 연쇄(Cascade)는 없음 — Orphan 낙하가 연쇄의 역할을 대체

### 2.5 천장 하강 (Ceiling Push)
- **5발 발사마다** 천장이 **1행 높이만큼 아래로 이동**
- 하강 시 기존 격자 전체가 1행분 Y축 이동 (새로운 빈 행이 상단에 추가되지 않음)
- 최하단 버블이 **데드라인(발사대 위 3행 높이)** 을 넘으면 **GAMEOVER**

### 2.6 NEXT 버블 프리뷰 ★ (Cycle 16 개선)
- 발사대 좌측에 다음 버블 색상을 미리 표시
- 현재 버블 발사 후 NEXT → 현재로 승격, 새로운 NEXT 생성
- NEXT 색상은 현재 격자에 존재하는 색상 중 랜덤 선택 (격자에 없는 색은 출현하지 않음)

### 2.7 게임 오버 조건
- 격자의 최하단 버블 Y 좌표가 데드라인(`canvas.height - CONFIG.LAUNCHER_Y - CONFIG.BUBBLE_RADIUS * 6`)을 넘으면 GAMEOVER

### 2.8 목표
- **단일 목표: 최고 점수 달성** — 스테이지 분기, 레벨 클리어 조건 없음. 범위 축소 전략(F7) 준수

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 동작 |
|----|------|
| ← / A | 조준 각도 좌측 이동 (1°/프레임, 장 누르면 연속) |
| → / D | 조준 각도 우측 이동 (1°/프레임) |
| Space / ↑ / W | 버블 발사 |
| P / Escape | 일시정지 토글 |
| Enter | TITLE: 게임 시작 / GAMEOVER: 재시작 |

### 3.2 마우스 ★ (Cycle 16 개선: 마우스 단독 플레이 완전 지원)
| 입력 | 동작 |
|------|------|
| 마우스 이동 | 발사대 → 마우스 커서 방향으로 조준선 실시간 표시 |
| 좌클릭 | 버블 발사 (현재 조준 각도로) |
| 일시정지 버튼 클릭 | 일시정지 토글 |

### 3.3 터치 (모바일)
| 입력 | 동작 |
|------|------|
| 터치 이동 (드래그) | 발사대 → 터치 위치 방향으로 조준선 실시간 표시 |
| 터치 릴리스 (손 떼기) | 버블 발사 (현재 조준 각도로) |
| 일시정지 버튼 탭 | 일시정지 토글 |

> **모든 입력 방식에서 동일한 기능 제공** — 키보드/마우스/터치 어느 하나만으로도 전체 플레이 가능

---

## §4. 시각적 스타일 가이드

### 4.1 색상 팔레트

| 용도 | HEX | 설명 |
|------|-----|------|
| 배경 | `#0a0a1a` | 짙은 네이비-블랙 |
| 격자 가이드선 | `#1a1a3a` | 미세한 헥스 그리드 |
| 버블 — 빨강 | `#ff3366` | Neon Red |
| 버블 — 파랑 | `#3388ff` | Neon Blue |
| 버블 — 초록 | `#33ff88` | Neon Green |
| 버블 — 노랑 | `#ffdd33` | Neon Yellow |
| 버블 — 보라 | `#bb44ff` | Neon Purple |
| 버블 — 시안 | `#33ffee` | Neon Cyan |
| 발사대 | `#cccccc` | 밝은 회색 |
| 조준선 | `#ffffff` (alpha=0.4) | 점선 |
| 데드라인 | `#ff3366` (alpha=0.3) | 빨간 경고선 |
| UI 텍스트 | `#ffffff` | 흰색 |
| 점수 텍스트 | `#33ffee` | Accent Cyan |
| 글로우 효과 | 각 버블 색상 + alpha=0.3 | 외곽 네온 글로우 |

### 4.2 버블 렌더링
- **Canvas `arc()`** 로 원 그리기. SVG 필터 절대 사용 금지 (F2)
- 중심부 밝은 하이라이트: `createRadialGradient()` — 중심 흰색→버블 색상
- 외곽 글로우: `shadowColor` = 버블색, `shadowBlur` = 8px
- 크기: 반지름 `CONFIG.BUBBLE_RADIUS` = 18px

### 4.3 배경
- offscreen canvas에 캐싱 (F10)
- 그라디언트: 상단 `#0a0a1a` → 하단 `#0d0d2a`
- 미세한 격자 가이드선: `#1a1a3a`, 1px 선
- `resizeCanvas()` 호출 시에만 재빌드

### 4.4 발사대
- 삼각형 형태 (`moveTo/lineTo`), 회전 중심 = 발사대 중앙
- 현재 조준 각도로 회전하여 그리기
- 현재 버블: 발사대 중앙에 해당 색상 버블 표시

### 4.5 조준선
- 발사대에서 조준 방향으로 **점선 (dash 8, gap 8)**: `setLineDash([8, 8])`
- 벽 반사 예측: 1차 반사까지 경로 표시 (Cycle 6 궤적 프리뷰 패턴)
- alpha=0.4, 흰색

### 4.6 팝 이펙트
- 파티클 시스템 (ObjectPool 50개)
- 팝 시 버블 위치에서 6~8개 원형 파티클 방사, 500ms 페이드아웃
- Orphan 낙하: 중력 적용 파티클 + alpha 감소

### 4.7 UI 요소
- **점수**: 좌상단, 24px 폰트, Accent Cyan
- **최고 점수**: 좌상단 점수 아래, 16px 폰트, `#888888`
- **레벨**: 우상단, 20px 폰트, 흰색
- **남은 발사 횟수 (천장 하강까지)**: 우상단 레벨 아래, "NEXT PUSH: 3", 16px
- **NEXT 버블**: 발사대 좌측 60px, 반지름 14px로 축소 표시
- **일시정지 버튼**: 우상단, **최소 48×48px** (F11: `Math.max(CONFIG.MIN_TOUCH_TARGET, 48)`)

---

## §5. 핵심 게임 루프

### 5.1 초기화 순서 (F18: TDZ 방지)
```
1. CONFIG 상수 선언
2. let canvas, ctx 선언
3. 게임 상태 변수 선언 (state, grid, score, ...)
4. TweenManager 선언
5. ObjectPool(파티클) 선언
6. SoundManager 선언
7. window.onload → DOM 할당 (canvas = getElementById)
8. resizeCanvas() → offscreen 캐싱
9. 이벤트 리스너 등록 (registeredListeners + listen() 헬퍼)
10. enterState(STATE.TITLE)
11. requestAnimationFrame(loop)
```

### 5.2 메인 루프 (60fps)
```
function loop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // 50ms cap
    lastTime = timestamp;

    update(dt);
    render();
  } catch(e) {
    console.error('Game loop error:', e);
  }
  requestAnimationFrame(loop);
}
```

### 5.3 update(dt) 분기
```
switch(state) {
  case TITLE:
    tw.update(dt);      // 타이틀 애니메이션
    break;
  case PLAYING:
    tw.update(dt);       // tween 애니메이션
    updateShootingBubble(dt);  // 발사된 버블 이동
    particles.update(dt); // 파티클 업데이트
    break;
  case PAUSED:
    // 아무것도 업데이트하지 않음
    break;
  case GAMEOVER:
    tw.update(dt);       // 게임오버 애니메이션
    particles.update(dt);
    break;
}
```

### 5.4 발사→스냅→매칭→정리 플로우
```
shoot()
  → 버블에 vx, vy 속도 부여
  → 매 프레임 updateShootingBubble()에서 이동
  → 벽 반사 체크 (vx 반전, bounceCount++ < 1)
  → 충돌 체크: 격자 버블 또는 천장
  → snapToGrid(bubble, grid) — 가장 가까운 빈 셀 결정
  → [가드] if(isPopping) return; isPopping = true;  (F14)
  → findCluster(grid, row, col, color) — BFS 같은 색 탐색
  → cluster.length >= 3 ? popCluster(cluster) : miss
  → findOrphans(grid) — 천장 미연결 그룹 탐색
  → dropOrphans(orphans) — 낙하 애니메이션 + 소멸
  → addScore(cluster, orphans)
  → shotsUntilPush--; if(shotsUntilPush <= 0) pushCeiling();
  → nextBubble → current; generateNext();
  → isPopping = false;
```

### 5.5 TweenManager 안전 패턴 (F6)
```javascript
// clearImmediate(): 즉시 플러시 (resetGame, goToTitle에서 사용)
tw.clearImmediate = function() {
  this._tweens.length = 0;
  this._pendingCancel = false;
};

// cancelAll(): deferred 취소 (일반 상태 전환에서 사용)
tw.cancelAll = function() {
  this._pendingCancel = true;
};
```

---

## §6. 상태 머신 및 상태×시스템 매트릭스

### 6.1 상태 정의 (4개 — F7 범위 축소)

```javascript
const STATE = { TITLE: 0, PLAYING: 1, PAUSED: 2, GAMEOVER: 3 };
```

### 6.2 상태 전환 다이어그램

```
TITLE --(클릭/Enter)--> PLAYING
PLAYING --(P/ESC)--> PAUSED
PAUSED --(P/ESC)--> PLAYING
PLAYING --(데드라인 초과)--> GAMEOVER
GAMEOVER --(클릭/Enter)--> TITLE
```

**전환 규칙:**
- 모든 전환은 `beginTransition(targetState)` 경유 필수 (F20)
- PAUSED만 예외: 즉시 `enterState()` (F20 예외)
- **STATE_PRIORITY**: `{ GAMEOVER: 3, PAUSED: 2, PLAYING: 1, TITLE: 0 }` (F17)
- 상위 우선순위 전환 중 하위 전환 요청은 무시

### 6.3 상태 × 시스템 매트릭스 (F5)

| 시스템 \ 상태 | TITLE | PLAYING | PAUSED | GAMEOVER |
|---------------|-------|---------|--------|----------|
| **TweenManager** | ✅ 타이틀 애니 | ✅ 팝/전환 | ❌ | ✅ 게임오버 애니 |
| **Physics (버블 이동)** | ❌ | ✅ | ❌ | ❌ |
| **Particles** | ❌ | ✅ | ❌ | ✅ 잔여 파티클 |
| **SoundManager** | ✅ BGM | ✅ SFX+BGM | ❌ 뮤트 | ✅ 게임오버 SFX |

### 6.4 enterState(state) 초기화

```
TITLE:
  - tw.clearImmediate()
  - 타이틀 글로우 tween 시작
  - BGM 시작 (Web Audio)

PLAYING:
  - grid = generateInitialGrid(CONFIG.INITIAL_ROWS, CONFIG.INITIAL_COLORS)
  - score = 0, level = 1, combo = 0
  - currentBubble = generateBubble()
  - nextBubble = generateBubble()
  - shotsUntilPush = CONFIG.SHOTS_PER_PUSH
  - isPopping = false, _transitioning = false

PAUSED:
  - (상태만 변경, 시스템 정지)

GAMEOVER:
  - hiBefore = getBest()
  - isNewHi = (score > hiBefore)  ← 판정 먼저 (F9, Cycle 2 교훈)
  - saveBest(score)               ← 저장 나중에
  - 게임오버 tween 시작
```

---

## §7. 점수 시스템

### 7.1 점수 계산 (단일 갱신 경로 — F16)

```javascript
// addScore()만이 score를 갱신하는 유일한 경로
function addScore(clusterSize, orphanCount, level, combo) {
  const base = clusterSize * 10;
  const orphanBonus = orphanCount * 15;
  const levelMul = 1 + (level - 1) * 0.1;
  const comboMul = 1 + combo * 0.25;
  const gained = Math.floor((base + orphanBonus) * levelMul * comboMul);
  return { gained, newCombo: combo + 1 };
}

// miss 시 (3개 미만 매칭)
function resetCombo() { return 0; }
```

### 7.2 점수 테이블

| 요소 | 점수 |
|------|------|
| 매칭 팝 (버블 1개당) | 10 |
| Orphan 낙하 (버블 1개당) | 15 |
| 레벨 배율 | `1 + (level-1) * 0.1` |
| 콤보 배율 | `1 + combo * 0.25` |
| 콤보 리셋 | 매칭 실패 시 0으로 |

### 7.3 레벨 시스템

| 레벨 | 필요 점수 | 활성 색상 수 | 색상 목록 | 천장 하강 간격 |
|------|-----------|-------------|-----------|---------------|
| 1 | 0 | 3 | `[RED, BLUE, GREEN]` | 5발 |
| 2 | 500 | 3 | `[RED, BLUE, GREEN]` | 5발 |
| 3 | 1200 | 4 | `[RED, BLUE, GREEN, YELLOW]` | 5발 |
| 4 | 2000 | 4 | `[RED, BLUE, GREEN, YELLOW]` | 4발 |
| 5 | 3000 | 5 | `[RED, BLUE, GREEN, YELLOW, PURPLE]` | 4발 |
| 6 | 4500 | 5 | `[RED, BLUE, GREEN, YELLOW, PURPLE]` | 4발 |
| 7 | 6500 | 6 | `[RED, BLUE, GREEN, YELLOW, PURPLE, CYAN]` | 3발 |
| 8+ | +2500/lv | 6 | 전체 | 3발 |

### 7.4 최고 점수 저장

```javascript
const STORAGE_KEY = 'neonBubblePop_hi';
function getBest() {
  try { return parseInt(localStorage.getItem(STORAGE_KEY)) || 0; }
  catch(e) { return 0; }
}
function saveBest(s) {
  try { localStorage.setItem(STORAGE_KEY, s); }
  catch(e) { /* iframe sandbox 대응 */ }
}
```

---

## §8. 시각적 렌더링 상세

### 8.1 Canvas 설정
- **DPR 대응**: `canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr);`
- CSS: `width: 100%; height: 100%;`
- **게임 영역**: 최대 480×720px (4:3 비율). 모바일에서 뷰포트에 맞춤 축소

### 8.2 버블 렌더링 함수 (Canvas only — F2)

```javascript
function drawBubble(ctx, x, y, radius, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha || 1;

  // 글로우
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  // 본체
  const grad = ctx.createRadialGradient(
    x - radius * 0.3, y - radius * 0.3, 0,
    x, y, radius
  );
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, color);
  grad.addColorStop(1, darken(color, 0.3));
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}
```

### 8.3 offscreen 캐싱 (F10)

```javascript
let bgCache = null;
function buildBgCache(w, h) {
  const osc = document.createElement('canvas');
  osc.width = w; osc.height = h;
  const octx = osc.getContext('2d');
  // 배경 그라디언트
  const grad = octx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0a0a1a');
  grad.addColorStop(1, '#0d0d2a');
  octx.fillStyle = grad;
  octx.fillRect(0, 0, w, h);
  bgCache = osc;
}
```

### 8.4 팝 파티클 (ObjectPool)

```javascript
const particlePool = new ObjectPool(50, () => ({
  x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0.5,
  color: '#fff', radius: 3
}));
```

### 8.5 Canvas 기반 UI (F8: iframe 호환)
- TITLE 화면: "NEON BUBBLE POP" 글로우 텍스트 + "TAP TO START"
- PAUSED: 반투명 오버레이(alpha=0.7) + "PAUSED" 텍스트
- GAMEOVER: 최종 점수 + 최고 점수 + "NEW!" 배지(갱신 시) + "TAP TO RESTART"
- **alert/confirm/prompt/window.open 사용 금지** (F8)

---

## §9. 사운드 시스템

### 9.1 Web Audio API (setTimeout 완전 배제 — F3)

```javascript
const SND = {
  shoot:  { freq: 440, dur: 0.08, type: 'sine' },
  pop:    { freq: 880, dur: 0.12, type: 'triangle' },
  orphan: { freq: 660, dur: 0.15, type: 'sine' },
  snap:   { freq: 330, dur: 0.05, type: 'square' },
  over:   { freq: [440, 330, 220], dur: 0.3, type: 'sawtooth' }
};
```

### 9.2 사운드 재생 (네이티브 스케줄링)

```javascript
function playSound(snd) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = snd.type;
    osc.frequency.value = Array.isArray(snd.freq) ? snd.freq[0] : snd.freq;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + snd.dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + snd.dur);
  } catch(e) { /* 미지원 환경 무시 */ }
}
```

---

## §10. 순수 함수 목록 및 시그니처 (F4)

> 모든 게임 로직 함수는 전역 참조 없이 파라미터만으로 동작한다.

| # | 함수명 | 파라미터 | 반환값 | 설명 |
|---|--------|---------|--------|------|
| 1 | `calcAngle(x1, y1, x2, y2)` | 좌표 4개 | `number` (라디안) | 발사 각도 계산 |
| 2 | `getGridPos(row, col, offsetX, offsetY, radius)` | 격자 좌표 + 오프셋 | `{x, y}` | 격자 셀 → 화면 좌표 변환 |
| 3 | `getSnapCell(bx, by, grid, offsetX, offsetY, radius)` | 버블 위치 + 격자 | `{row, col}` | 가장 가까운 빈 셀 결정 |
| 4 | `findCluster(grid, row, col, color)` | 격자 + 시작 셀 + 색상 | `[{row, col}, ...]` | BFS 같은 색 클러스터 탐색 |
| 5 | `findOrphans(grid, maxRows, maxCols)` | 격자 + 크기 | `[{row, col}, ...]` | 천장 미연결 고립 버블 탐색 |
| 6 | `getNeighbors(row, col, maxRows, maxCols)` | 셀 위치 + 격자 크기 | `[{row, col}, ...]` | 인접 6셀 좌표 반환 |
| 7 | `generateBubble(activeColors)` | 활성 색상 배열 | `{color}` | 랜덤 색상 버블 생성 |
| 8 | `generateInitialGrid(rows, cols, colors)` | 행·열·색상 수 | `grid[][]` | 초기 격자 생성 |
| 9 | `getActiveColors(level)` | 레벨 번호 | `string[]` | 레벨별 활성 색상 배열 반환 |
| 10 | `getShotsPerPush(level)` | 레벨 번호 | `number` | 레벨별 천장 하강 간격 반환 |
| 11 | `checkDeadline(grid, deadlineY, offsetY, radius)` | 격자 + 데드라인 | `boolean` | 게임오버 판정 |
| 12 | `addScore(clusterSize, orphanCount, level, combo)` | 4개 수치 | `{gained, newCombo}` | 점수 계산 (순수 연산) |

---

## §11. 난이도 시스템

### 11.1 난이도 곡선

레벨이 올라갈수록:
1. **활성 색상 수 증가**: 3색 → 6색 (매칭 확률 하락)
2. **천장 하강 간격 감소**: 5발 → 3발 (시간 압박 강화)
3. **초기 격자 행 수는 고정 (5행)** — 순수하게 색상 다양성과 천장 압박으로만 난이도 제어

### 11.2 난이도 수치 테이블

| 레벨 | 누적 점수 | 활성 색상 | 색상 목록 | 천장 하강(발) |
|------|-----------|-----------|-----------|-------------|
| 1 | 0 | 3 | `['#ff3366','#3388ff','#33ff88']` | 5 |
| 2 | 500 | 3 | `['#ff3366','#3388ff','#33ff88']` | 5 |
| 3 | 1200 | 4 | `['#ff3366','#3388ff','#33ff88','#ffdd33']` | 5 |
| 4 | 2000 | 4 | `['#ff3366','#3388ff','#33ff88','#ffdd33']` | 4 |
| 5 | 3000 | 5 | `['#ff3366','#3388ff','#33ff88','#ffdd33','#bb44ff']` | 4 |
| 6 | 4500 | 5 | `['#ff3366','#3388ff','#33ff88','#ffdd33','#bb44ff']` | 4 |
| 7 | 6500 | 6 | `['#ff3366','#3388ff','#33ff88','#ffdd33','#bb44ff','#33ffee']` | 3 |
| 8+ | +2500/lv | 6 | 전체 6색 | 3 |

---

## §12. 구현 체크리스트 및 검증

### 12.1 초기화 순서 체크리스트 (F18)
- [ ] CONFIG 상수가 모든 변수 선언보다 먼저 위치
- [ ] `let canvas, ctx;` 가 이벤트 리스너 등록보다 먼저 위치
- [ ] `window.onload` 또는 DOMContentLoaded 내에서 DOM 할당
- [ ] resizeCanvas()가 이벤트 등록 후, loop() 전에 호출
- [ ] enterState(TITLE)이 loop() 전에 호출

### 12.2 금지 패턴 목록
- [ ] `setTimeout` / `setInterval` — 0건 (F3)
- [ ] `alert()` / `confirm()` / `prompt()` / `window.open()` — 0건 (F8)
- [ ] `feGaussianBlur` / SVG 필터 — 0건 (F2)
- [ ] `eval()` / `innerHTML` — 0건
- [ ] `assets/` 디렉토리 — 미존재 (F1)
- [ ] `ASSET_MAP` / `SPRITES` / `preloadAssets` — 0건
- [ ] 전역 변수 직접 참조 함수 — 0건 (F4)

### 12.3 터치 타겟 검증 (F11)
- [ ] 일시정지 버튼: 최소 48×48px (`Math.max(CONFIG.MIN_TOUCH_TARGET, size)`)
- [ ] TITLE "시작" 영역: 최소 48px 높이
- [ ] GAMEOVER "재시작" 영역: 최소 48px 높이

### 12.4 게임 루프 try-catch (F12)
- [ ] loop() 함수 내 try-catch 래핑 확인
- [ ] catch 블록에서 console.error() 호출
- [ ] requestAnimationFrame(loop)이 catch 외부에 위치

### 12.5 setTimeout 0건 검증 (F3)
- [ ] 코드 전체에서 `setTimeout` 문자열 0건
- [ ] 코드 전체에서 `setInterval` 문자열 0건
- [ ] SoundManager에서 Web Audio 네이티브 스케줄링만 사용

### 12.6 파일 구조 검증 (F1)
- [ ] `public/games/neon-bubble-pop/index.html` — 유일한 게임 파일
- [ ] `public/games/neon-bubble-pop/thumbnail.svg` — 썸네일 (선택)
- [ ] `public/games/neon-bubble-pop/assets/` — **존재하면 FAIL**

### 12.7 스모크 테스트 3단계 (F13)
1. [ ] `index.html` 파일 존재 확인
2. [ ] 브라우저에서 페이지 로드 성공 (빈 화면 아님)
3. [ ] 콘솔 에러 0건, 경고 0건

### 12.8 회귀 테스트 (F19)
- [ ] TITLE → 클릭 → PLAYING 전환 정상
- [ ] PLAYING → 버블 발사 → 스냅 → 매칭 정상
- [ ] PLAYING → P키 → PAUSED → P키 → PLAYING 복귀
- [ ] 데드라인 초과 → GAMEOVER 전환 정상
- [ ] GAMEOVER → 클릭 → TITLE 복귀
- [ ] 최고 점수 localStorage 저장/로드 정상

### 12.9 성능 체크리스트
- [ ] offscreen canvas 배경 캐싱 확인 (F10)
- [ ] ObjectPool로 파티클 재활용 (매 프레임 new 금지)
- [ ] 반복 호출 내 I/O 접근 없음 (localStorage 등)
- [ ] drawBubble()에서 매번 new RadialGradient가 아닌 캐시 검토

---

## §13. 수치 정합성 검증 테이블

### 13.1 CONFIG 상수 대조 (F9, F23)

| 상수명 | 기획서 값 | 코드 내 값 | 일치 |
|--------|-----------|-----------|------|
| `BUBBLE_RADIUS` | 18 | | ☐ |
| `SHOOT_SPEED` | 12 | | ☐ |
| `INITIAL_ROWS` | 5 | | ☐ |
| `SHOTS_PER_PUSH` (레벨1) | 5 | | ☐ |
| `MIN_TOUCH_TARGET` | 48 | | ☐ |
| `COLORS` 배열 | `['#ff3366','#3388ff','#33ff88','#ffdd33','#bb44ff','#33ffee']` | | ☐ |
| `LEVEL_THRESHOLDS` | `[0,500,1200,2000,3000,4500,6500]` | | ☐ |
| `ACTIVE_COLORS_BY_LEVEL` | `[3,3,4,4,5,5,6]` | | ☐ |
| `SHOTS_PER_PUSH_BY_LEVEL` | `[5,5,5,4,4,4,3]` | | ☐ |
| `AIM_MIN_ANGLE` | 10° (0.1745 rad) | | ☐ |
| `AIM_MAX_ANGLE` | 170° (2.9671 rad) | | ☐ |
| `STORAGE_KEY` | `'neonBubblePop_hi'` | | ☐ |
| `POP_SOUND_FREQ` | 880 | | ☐ |
| `SHOOT_SOUND_FREQ` | 440 | | ☐ |
| `EVEN_ROW_COLS` | 8 | | ☐ |
| `ODD_ROW_COLS` | 7 | | ☐ |
| `PARTICLE_POOL_SIZE` | 50 | | ☐ |

### 13.2 변수 사용처 검증 (F15: 유령 변수 방지)

| 변수명 | 선언 위치 | 갱신 위치 | 사용(읽기) 위치 | 일치 |
|--------|-----------|-----------|----------------|------|
| `score` | enterState(PLAYING) | addScore() 반환값 적용 | render(), enterState(GAMEOVER) | ☐ |
| `combo` | enterState(PLAYING) | addScore()→newCombo, resetCombo() | addScore() 인자 | ☐ |
| `level` | enterState(PLAYING) | checkLevelUp() | getActiveColors(), getShotsPerPush(), render() | ☐ |
| `shotsUntilPush` | enterState(PLAYING) | shoot() 후 감소 | render(), pushCeiling() 조건 | ☐ |
| `isPopping` | enterState(PLAYING) | shoot() 시작/종료 | shoot() 가드 체크 | ☐ |
| `_transitioning` | beginTransition() | enterState() 완료 시 | beginTransition() 가드 | ☐ |
| `nextBubble` | enterState(PLAYING) | shoot() 후 교체 | render(), shoot() 승격 | ☐ |
| `aimAngle` | enterState(PLAYING) | 입력 핸들러 (마우스/키보드/터치) | render() 조준선, shoot() 방향 | ☐ |
| `grid` | enterState(PLAYING) | snapToGrid, popCluster, pushCeiling | render(), findCluster, findOrphans | ☐ |
| `ceilingOffset` | enterState(PLAYING) | pushCeiling() | render() Y좌표 보정 | ☐ |

### 13.3 기능별 세부 구현 체크리스트 (F22: "절반 구현" 방지)

| 기능 | 세부 항목 | 구현 |
|------|-----------|------|
| 발사 | A. 각도 조준 (키보드+마우스+터치) | ☐ |
| | B. 벽 반사 (1회 제한) | ☐ |
| | C. 격자 스냅 (최근접 빈 셀) | ☐ |
| 매칭 | A. BFS 같은 색 탐색 | ☐ |
| | B. 3+ 연결 팝 + 파티클 | ☐ |
| | C. Orphan 탐색 (천장 미연결) | ☐ |
| | D. Orphan 낙하 애니메이션 | ☐ |
| 천장 | A. 발사 횟수 카운트 감소 | ☐ |
| | B. 격자 Y축 하강 이동 | ☐ |
| | C. 데드라인 초과 GAMEOVER 판정 | ☐ |
| NEXT | A. NEXT 버블 UI 표시 | ☐ |
| | B. 발사 후 NEXT→현재 승격 | ☐ |
| | C. 격자 내 존재 색상 기반 생성 | ☐ |
| 점수 | A. 클러스터 팝 점수 (버블당 10) | ☐ |
| | B. Orphan 보너스 (버블당 15) | ☐ |
| | C. 레벨 배율 적용 | ☐ |
| | D. 콤보 배율 적용 + 실패 시 리셋 | ☐ |
| | E. 최고 점수 localStorage 저장/로드 | ☐ |
| 입력 | A. 키보드 조준(←→) + 발사(Space) | ☐ |
| | B. 마우스 이동 조준 + 클릭 발사 | ☐ |
| | C. 터치 드래그 조준 + 릴리스 발사 | ☐ |
| | D. P/ESC 일시정지 토글 | ☐ |
| UI | A. 일시정지 버튼 48px+ | ☐ |
| | B. 점수/최고점수/레벨 표시 | ☐ |
| | C. NEXT PUSH 카운트다운 표시 | ☐ |
| | D. NEXT 버블 프리뷰 표시 | ☐ |
| 사운드 | A. 발사 SFX (440Hz sine) | ☐ |
| | B. 팝 SFX (880Hz triangle) | ☐ |
| | C. Orphan 낙하 SFX (660Hz sine) | ☐ |
| | D. 게임오버 SFX (하강 sawtooth) | ☐ |

---

## §14. 게임 페이지 메타데이터

### 사이드바 정보 (game-registry.json 등록용)

```json
{
  "id": "neon-bubble-pop",
  "title": "네온 버블 팝",
  "description": "네온 글로우 버블 슈터! 같은 색 3개를 연결하여 터뜨리고, 고립 버블을 떨어뜨려 콤보를 쌓아보세요. 천장이 내려오기 전에 최고 점수에 도전!",
  "genre": ["arcade", "casual"],
  "playCount": 0,
  "rating": 0,
  "controls": [
    "마우스: 이동으로 조준, 클릭으로 발사",
    "키보드: ←→ 조준, Space 발사, P 일시정지",
    "터치: 드래그로 조준, 손 떼면 발사"
  ],
  "tags": ["#버블슈터", "#네온", "#아케이드", "#캐주얼", "#퍼즐액션"],
  "addedAt": "2026-03-22",
  "version": "1.0.0",
  "featured": true
}
```

### 홈 페이지 GameCard 표시
- **thumbnail**: 네온 글로우 버블 격자 + 발사대 (4:3 비율)
- **title**: "네온 버블 팝" (1줄)
- **description**: "네온 글로우 버블 슈터! 같은 색 3개를 연결하여 터뜨리고..." (2줄 잘림)
- **genre 배지**: `arcade`, `casual` (최대 2개)
- **playCount**: 0 (초기)
- **addedAt**: 2026-03-22 → 7일 이내이므로 **"NEW" 배지 표시**
- **featured**: true → **⭐ 배지 표시**

---

## §15. 예상 코드 규모 및 구조

### 목표: 1,000~1,300줄 단일 HTML

```
index.html
├─ <style>: canvas 풀스크린 CSS (~20줄)
├─ <canvas>
└─ <script>
    ├─ CONFIG 상수 (~30줄)
    ├─ 유틸: darken(), clamp(), lerp() (~20줄)
    ├─ TweenManager (~60줄)
    ├─ ObjectPool (~30줄)
    ├─ SoundManager (~40줄)
    ├─ 순수 함수 12개 (~250줄)
    │   ├─ calcAngle, getGridPos, getSnapCell
    │   ├─ findCluster, findOrphans, getNeighbors
    │   ├─ generateBubble, generateInitialGrid
    │   ├─ getActiveColors, getShotsPerPush
    │   ├─ checkDeadline, addScore
    ├─ 상태 머신 + enterState + beginTransition (~80줄)
    ├─ 입력 핸들러 (키보드/마우스/터치) (~100줄)
    ├─ update() + shoot/snap/pop 로직 (~150줄)
    ├─ render() 함수들 (~200줄)
    │   ├─ drawBubble, drawGrid, drawLauncher
    │   ├─ drawAimLine, drawUI, drawParticles
    │   ├─ drawTitle, drawPaused, drawGameOver
    ├─ 초기화 + 이벤트 등록 + loop (~50줄)
    └─ 총계: ~1,030줄 예상
```
