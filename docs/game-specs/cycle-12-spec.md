---
game-id: mini-drift-racer
title: 미니 드리프트 레이서
genre: arcade
difficulty: medium
---

# 미니 드리프트 레이서 — 상세 기획서

_Cycle #12 | 작성일: 2026-03-21_

---

## 1. 게임 개요 및 핵심 재미 요소

### 컨셉
탑다운 시점의 드리프트 레이싱 게임. 플레이어는 관성 기반 차량을 조종하여 5개 트랙을 돌며 드리프트 포인트를 쌓고 랩 타임을 단축한다.

### 핵심 재미
1. **드리프트의 쾌감** — 핸드브레이크로 후미를 미끄러뜨리고, 카운터 스티어링으로 각도를 유지하며 코너를 통과하는 물리적 쾌감
2. **리스크-리워드** — 드리프트 각도가 클수록 포인트 배율이 높지만, 벽에 부딪히면 콤보가 초기화. "얼마나 위험하게 돌 것인가"의 판단
3. **부스트 순환** — 드리프트 포인트 → 부스트 게이지 충전 → 직선 가속 → 다음 코너 진입 속도 ↑의 선순환
4. **기록 경쟁** — 트랙별 베스트 랩 + 고스트 레코드로 자기 자신과의 경쟁

### Cycle 11 학습 반영 요약

| 이전 이슈 | 본 기획서 반영 |
|-----------|--------------|
| assets/ 11사이클 연속 재발 | §11에서 Canvas 전용 드로잉 명세. assets/ 디렉토리 생성 절대 금지. 모든 비주얼은 fillRect/arc/lineTo/fillText로 코드 드로잉 |
| 3회 리뷰 소요 | §12 코드 리뷰 체크리스트에 1회차 통과 목표 검증 항목 26개 수시 적용 |
| 월드별 고유 장애물 미구현 | §5.2에서 트랙별 고유 노면 효과 5종 상세 명세 (구현 가능 범위로 축소) |
| 일일 챌린지 미구현 | 본 사이클에서는 의도적 제외. 코어 메커닉 완성에 집중 |
| 공용 엔진 모듈 분리 제안 | §10에서 TweenManager/ObjectPool/SoundManager 인라인 구현 (분리는 플랫폼 레벨 작업) |
| 미개척 장르 도전 | 레이싱 장르 — InfiniTriX 12개 게임 중 최초 |

---

## 2. 게임 규칙 및 목표

### 2.1 승리 조건
- 각 트랙에서 **3랩 완주** 시 클리어
- 완주 시간 + 드리프트 포인트 합산으로 **별점 1~3개** 부여

### 2.2 별점 기준 (트랙별 CONFIG에 정의)

| 별점 | 조건 |
|------|------|
| ★☆☆ | 완주 |
| ★★☆ | 목표 시간 이내 완주 |
| ★★★ | 목표 시간 이내 + 드리프트 포인트 목표 달성 |

### 2.3 트랙 언락
- 트랙 1(초원)은 처음부터 해금
- 트랙 N은 트랙 N-1에서 ★1개 이상 획득 시 해금

### 2.4 실패 조건
- 없음 (타임 어택 방식). 벽 충돌 시 속도 감소 + 드리프트 콤보 초기화 페널티

---

## 3. 조작 방법

### 3.1 키보드
| 키 | 동작 |
|----|------|
| ↑ / W | 가속 |
| ↓ / S | 브레이크 / 후진 |
| ← / A | 좌회전 (스티어링) |
| → / D | 우회전 (스티어링) |
| Space | 핸드브레이크 (드리프트 진입) |
| Shift | 부스트 사용 |
| Esc / P | 일시정지 |

### 3.2 마우스
- 사용하지 않음 (메뉴 선택만 클릭)

### 3.3 터치 (모바일)

```
┌─────────────────────────────────────┐
│              게임 화면               │
│                                     │
│  ⏸(좌상)              BOOST(우상)  │
│                                     │
│                                     │
│                                     │
│  ◄ ►(좌하)        BRAKE  GAS(우하) │
│  스티어링              핸드브레이크  │
│                        ⊗(중하)      │
└─────────────────────────────────────┘
```

- **좌측 하단**: 좌/우 스티어링 버튼 (반투명, 원형, 반지름 40px)
- **우측 하단**: GAS(초록) / BRAKE(빨강) 버튼 (원형, 반지름 44px)
- **중앙 하단**: 핸드브레이크 ⊗ (주황, 원형, 반지름 36px)
- **우측 상단**: BOOST (시안, 게이지 충분 시만 활성화)
- **좌측 상단**: 일시정지 ⏸

> 모든 터치 버튼은 Canvas 위 `touchstart`/`touchend`로 처리. 멀티터치 지원 (가속 + 스티어링 동시).

---

## 4. 시각적 스타일 가이드

### 4.1 색상 팔레트

| 용도 | HEX | 설명 |
|------|-----|------|
| 배경(잔디) | `#2d5a1e` | 초원 트랙 기본 |
| 도로 | `#3a3a3a` | 아스팔트 회색 |
| 도로 경계 | `#ffffff` | 흰색 점선/실선 |
| 커브 | `#cc2222` | 레드/화이트 커브석 |
| 플레이어 차량 | `#1e90ff` → `#ff4444` (부스트 시) | 도저블루 → 레드 |
| 고스트 차량 | `rgba(255,255,255,0.3)` | 반투명 흰색 |
| 드리프트 연기 | `rgba(200,200,200,0.6)` | 회색 반투명 파티클 |
| 타이어 자국 | `rgba(30,30,30,0.4)` | 어두운 반투명 선 |
| 부스트 게이지 | `#00e5ff` (시안) | HUD 요소 |
| UI 텍스트 | `#ffffff` | 기본 흰색 |
| UI 배경 | `rgba(0,0,0,0.7)` | 반투명 검정 |

### 4.2 트랙별 테마 색상

| 트랙 | 배경색 | 도로색 | 특수 효과색 |
|------|--------|--------|-------------|
| 1. 초원 서킷 | `#2d5a1e` 녹색 | `#3a3a3a` | `#4a7a2e` 풀밭 |
| 2. 사막 랠리 | `#c2956b` 모래 | `#8a7560` | `#e8c880` 모래먼지 |
| 3. 설산 코스 | `#d4e5f7` 빙판 | `#8899aa` | `#aaddff` 얼음 |
| 4. 도심 야경 | `#1a1a2e` 진남 | `#2a2a3e` | `#ff6600` 가로등 |
| 5. 화산 서킷 | `#2a1a0a` 암흑 | `#4a3020` | `#ff3300` 용암 |

### 4.3 차량 드로잉 (Canvas)

```
차량 크기: 30×16 px (논리 좌표)
┌──────────────────────────────┐
│  ■■■■■■■■■■■■■■■■■■■■■■■■  │  ← 차체 (fillRect, 둥근모서리)
│  ▪▪                    ▪▪  │  ← 타이어 4개 (fillRect 4×6)
└──────────────────────────────┘
앞유리: 차체 전방 25%에 반투명 하늘색 직사각형
후미등: 차체 후방에 빨간 2px 원 2개
```

- 차량은 `ctx.save()` → `ctx.translate(x,y)` → `ctx.rotate(angle)` → 드로잉 → `ctx.restore()` 로 회전 렌더링
- 드리프트 중: 차체 색상 밝기 +20%, 타이어에서 연기 파티클 방출

### 4.4 트랙 드로잉

- 트랙은 **웨이포인트 배열** 기반 베지어 곡선으로 도로 형태 정의
- 도로 폭: 80px (논리 좌표)
- 도로 중앙선: 5px 흰색 대시 (`setLineDash([20, 15])`)
- 도로 외곽: 3px 빨강/흰색 교차 커브석 (`커브석 세그먼트 10px 간격`)
- 트랙 외부는 배경색(잔디/모래 등)으로 채움

### 4.5 HUD 레이아웃

```
┌──────────────────────────────────────────┐
│ LAP 2/3     00:42.15      DP: 1,250     │  ← 상단 바
│ [████████░░] BOOST                       │  ← 부스트 게이지
│                                          │
│              (게임 영역)                  │
│                                          │
│ BEST: 01:23.45    ★★☆               │  ← 하단 정보
└──────────────────────────────────────────┘
```

---

## 5. 핵심 게임 루프 (60 FPS 기준 로직 흐름)

### 5.1 메인 루프 (매 프레임)

```
gameLoop(timestamp):
  try {
    dt = (timestamp - lastTime) / 1000   // 초 단위 델타
    dt = min(dt, 0.05)                    // 50ms 상한 (탭 복귀 보호)
    lastTime = timestamp

    switch(gameState):
      TITLE:      updateTitle(dt);      renderTitle()
      TRACK_SELECT: updateTrackSelect(dt); renderTrackSelect()
      COUNTDOWN:  updateCountdown(dt);  renderGame(); renderCountdown()
      RACING:     updateRacing(dt);     renderGame()
      LAP_CLEAR:  updateLapClear(dt);   renderGame(); renderLapOverlay()
      RACE_RESULT: updateResult(dt);    renderGame(); renderResult()
      PAUSED:     /* 업데이트 없음 */    renderGame(); renderPauseMenu()

    tweenManager.update(dt)   // 모든 상태에서 tween 업데이트 (Cycle 2 교훈)
    requestAnimationFrame(gameLoop)
  } catch(e) {
    console.error('GameLoop error:', e)   // Cycle 11 교훈: try-catch 래핑
    requestAnimationFrame(gameLoop)
  }
```

### 5.2 차량 물리 업데이트 (updateRacing 내부, 순수 함수)

```javascript
// 순수 함수: 전역 직접 참조 금지 (Cycle 6~7 교훈)
function updateCarPhysics(car, input, track, dt, config) {
  // 1. 스티어링 적용 (속도 비례 — 저속에서 더 민감)
  const steerFactor = config.STEER_SPEED * (1 - car.speed / config.MAX_SPEED * 0.4)
  if (input.left)  car.angle -= steerFactor * dt
  if (input.right) car.angle += steerFactor * dt

  // 2. 가속/브레이크
  if (input.gas)   car.speed = min(car.speed + config.ACCEL * dt, config.MAX_SPEED)
  if (input.brake) car.speed = max(car.speed - config.BRAKE * dt, -config.MAX_SPEED * 0.3)

  // 3. 드리프트 물리
  if (input.handbrake && car.speed > config.DRIFT_MIN_SPEED) {
    car.drifting = true
    car.driftAngle += (input.left ? -1 : input.right ? 1 : 0) * config.DRIFT_STEER * dt
    car.lateralFriction = config.DRIFT_FRICTION  // 낮은 횡방향 마찰
  } else {
    car.drifting = false
    car.driftAngle = lerp(car.driftAngle, 0, config.DRIFT_RECOVERY * dt)
    car.lateralFriction = config.NORMAL_FRICTION
  }

  // 4. 속도 벡터 계산 (전방 + 횡방향 슬라이드)
  const totalAngle = car.angle + car.driftAngle
  car.vx = cos(totalAngle) * car.speed
  car.vy = sin(totalAngle) * car.speed

  // 5. 마찰 감속
  car.speed *= (1 - config.GROUND_FRICTION * dt)

  // 6. 부스트
  if (input.boost && car.boostGauge >= config.BOOST_COST) {
    car.speed = min(car.speed + config.BOOST_ACCEL * dt, config.BOOST_MAX_SPEED)
    car.boostGauge -= config.BOOST_DRAIN * dt
    car.boosting = true
  } else {
    car.boosting = false
  }

  // 7. 위치 갱신
  car.x += car.vx * dt
  car.y += car.vy * dt

  // 8. 트랙 충돌 판정
  checkTrackCollision(car, track, config)

  // 9. 노면 효과 적용
  applyTrackSurface(car, track, config)

  return car
}
```

### 5.3 트랙별 노면 효과 (Cycle 11 "월드별 장애물 미구현" 해소)

| 트랙 | 노면 효과 | 물리 변화 |
|------|-----------|-----------|
| 초원 | 잔디 이탈 | 속도 ×0.6, 조향력 ×0.8 |
| 사막 | 모래 구간 (도로 위 패치) | 속도 ×0.7, 드리프트 마찰 ×0.5 (미끌) |
| 설산 | 빙판 구간 | 횡마찰 ×0.3, 드리프트 진입 쉬움+제어 어려움 |
| 도심 | 물웅덩이 | 순간 속도 ×0.5, 1초간 조향 반전 |
| 화산 | 용암 균열 | 접촉 시 속도 0 + 3초 페널티, 경고 깜빡임 |

---

## 6. 난이도 시스템

### 6.1 트랙 순서에 의한 자연 난이도 상승

| 트랙 | 핵심 난이도 요소 |
|------|-----------------|
| 1. 초원 | 넓은 도로(100px), 완만한 커브, 노면 효과 없음 (튜토리얼) |
| 2. 사막 | 표준 도로(80px), 중간 커브 + 모래 패치 2개소 |
| 3. 설산 | 표준 도로(80px), 급커브 + 빙판 구간 3개소 |
| 4. 도심 | 좁은 도로(65px), 직각 코너 + 물웅덩이 2개소 |
| 5. 화산 | 좁은 도로(60px), S자 연속 + 용암 균열 4개소 |

### 6.2 동적 난이도 요소
- 없음. 트랙 설계 자체가 난이도를 결정 (프로시저럴 생성 없음)
- 대신 **별점 3개 목표 시간**을 타이트하게 설정하여 마스터리 플레이어에게 도전 과제 제공

### 6.3 별점 목표 시간 (3랩 합산)

| 트랙 | ★☆☆ | ★★☆ | ★★★ | 드리프트 포인트 목표(★★★) |
|------|------|------|------|--------------------------|
| 초원 | 완주 | < 45s | < 35s | 3,000 DP |
| 사막 | 완주 | < 55s | < 42s | 5,000 DP |
| 설산 | 완주 | < 60s | < 48s | 7,000 DP |
| 도심 | 완주 | < 70s | < 55s | 8,000 DP |
| 화산 | 완주 | < 80s | < 62s | 10,000 DP |

---

## 7. 점수 시스템

### 7.1 드리프트 포인트 (DP)

```
기본 DP = 드리프트 지속 시간(초) × |드리프트 각도|(도) × 10

콤보 배율:
  - 드리프트 연속 2초 이상: ×1.5
  - 드리프트 연속 4초 이상: ×2.0
  - 드리프트 연속 6초 이상: ×3.0
  - 니어미스 (벽 10px 이내 통과): 추가 ×1.5

DP → 부스트 변환: 500 DP마다 부스트 게이지 20% 충전
```

### 7.2 콤보 초기화 조건
- 벽 충돌: 현재 콤보 DP 50% 손실 + 확정 (나머지 50%는 획득)
- 정지 (속도 < 5): 콤보 전체 손실
- 드리프트 해제 후 1.5초 이내 재진입: 콤보 유지

### 7.3 랩 클리어 보너스

| 보너스 | 조건 | DP |
|--------|------|----|
| 클린 랩 | 벽 충돌 0회 | +500 |
| 드리프트 킹 | 랩 중 DP 2,000 이상 | +300 |
| 스피드 데몬 | 개인 베스트 랩 갱신 | +200 |

### 7.4 최종 결과

```
총점 = 전체 DP + 랩 보너스 합산
별점 = 시간 조건 + DP 조건 동시 충족 여부
```

---

## 8. 게임 상태 머신

### 8.1 상태 목록

```
TITLE → TRACK_SELECT → COUNTDOWN → RACING → LAP_CLEAR → RACE_RESULT
                                      ↕
                                    PAUSED
```

| 상태 | 진입 조건 | 이탈 조건 |
|------|-----------|-----------|
| TITLE | 게임 시작 시 | 아무 키/터치 → TRACK_SELECT |
| TRACK_SELECT | TITLE에서 전환 | 트랙 선택 → COUNTDOWN |
| COUNTDOWN | 트랙 선택 완료 | 3→2→1→GO! (3초) → RACING |
| RACING | 카운트다운 종료 | 3랩 완주 → RACE_RESULT, ESC → PAUSED |
| PAUSED | RACING에서 ESC | ESC → RACING (즉시 전환, beginTransition 예외) |
| LAP_CLEAR | 랩 완주 시 | 1.5초 후 → RACING (다음 랩) / 마지막 랩 → RACE_RESULT |
| RACE_RESULT | 최종 랩 완주 | 아무 키 → TRACK_SELECT |

### 8.2 상태 × 시스템 매트릭스 (Cycle 2 필수 교훈)

| 시스템 | TITLE | TRACK_SELECT | COUNTDOWN | RACING | LAP_CLEAR | RACE_RESULT | PAUSED |
|--------|-------|--------------|-----------|--------|-----------|-------------|--------|
| **tweenManager.update()** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **carPhysics** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **driftScoring** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **particlePool.update()** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **camera.update()** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **ghostRecord** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **timerUpdate** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **inputProcessing** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **renderGame()** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

> PAUSED에서도 tweenManager는 업데이트하여 모달 페이드인 tween이 동작하도록 보장 (Cycle 2 B1 교훈)

---

## 9. 화면별 상세

### 9.1 TITLE 화면
- 배경: 어두운 아스팔트 색 (`#1a1a2e`) + 움직이는 도로 중앙선 애니메이션
- 로고: "MINI DRIFT RACER" (Canvas fillText, 48px bold, `#00e5ff`, 그림자 효과)
- 부제: "탑다운 드리프트 레이싱" (24px, `#aaaaaa`)
- 하단: "PRESS ANY KEY TO START" 깜빡임 (alpha tween 0.3↔1.0, 1초 주기)
- 차량 실루엣이 화면 하단을 좌→우로 드리프트하며 지나가는 데코 애니메이션

### 9.2 TRACK_SELECT 화면
- 5개 트랙을 가로 스크롤 카드로 표시
- 카드: 120×90px, 트랙 미니맵(베지어 경로 축소) + 트랙명 + 별점 + 잠금 아이콘
- 선택된 카드: 스케일 ×1.2, 테두리 `#00e5ff`
- 우측에 트랙 상세 정보 (베스트 타임, 노면 효과 설명)
- 키보드: ←/→ 이동, Enter 선택 / 터치: 스와이프 + 탭

### 9.3 COUNTDOWN
- 게임 화면 위에 중앙 대형 숫자 (3→2→1→GO!)
- 각 숫자는 scale tween (2.0 → 1.0, 0.3초) + alpha fade out
- "GO!"는 `#00ff00` 색상, 0.5초 유지 후 페이드

### 9.4 RACING (메인 게임)
- 탑다운 뷰, 카메라가 차량을 lerp 추적 (lerp factor: 0.08)
- look-ahead: 차량 이동 방향으로 속도×0.4만큼 카메라 선행
- 화면 흔들림: 벽 충돌 시 3px, 0.3초 감쇠
- HUD 상단: 랩 카운터 / 현재 시간 / 드리프트 DP
- HUD 좌측: 부스트 게이지 (세로 바, 시안)
- HUD 우측: 미니맵 (트랙 전체 윤곽 + 차량 위치 점)

### 9.5 RACE_RESULT
- 반투명 오버레이 (`rgba(0,0,0,0.8)`)
- 결과 카드 중앙 표시:
  - 트랙명
  - 총 시간 (MM:SS.ms)
  - 각 랩 시간
  - 총 드리프트 포인트
  - 별점 (★ 획득 시 scale bounce tween)
  - 신기록 시 "NEW RECORD!" 텍스트 깜빡임 (`#ffd700`)
- "RETRY" / "NEXT TRACK" / "MENU" 버튼 (Canvas 드로잉)

---

## 10. 핵심 인프라 (인라인 구현)

### 10.1 CONFIG 객체 (모든 수치 중앙 관리)

```javascript
const CONFIG = {
  // 차량 물리
  MAX_SPEED: 400,          // px/s
  ACCEL: 300,              // px/s²
  BRAKE: 500,              // px/s²
  STEER_SPEED: 3.0,        // rad/s
  GROUND_FRICTION: 0.3,    // 기본 감속 계수
  NORMAL_FRICTION: 0.95,   // 횡방향 마찰 (일반)
  DRIFT_FRICTION: 0.7,     // 횡방향 마찰 (드리프트)
  DRIFT_MIN_SPEED: 80,     // 드리프트 최소 속도
  DRIFT_STEER: 2.5,        // 드리프트 중 조향 속도
  DRIFT_RECOVERY: 5.0,     // 드리프트 복귀 속도

  // 부스트
  BOOST_ACCEL: 200,        // px/s² 추가
  BOOST_MAX_SPEED: 550,    // px/s
  BOOST_COST: 20,          // 최소 게이지
  BOOST_DRAIN: 40,         // /s 소모량
  BOOST_CHARGE_PER_500DP: 20, // 500DP당 충전량

  // 콤보
  COMBO_TIMEOUT: 1.5,      // 드리프트 해제 후 유지 시간
  NEAR_MISS_DIST: 10,      // 니어미스 판정 거리
  WALL_DP_PENALTY: 0.5,    // 벽 충돌 시 콤보 DP 잔존율

  // 카메라
  CAM_LERP: 0.08,
  CAM_LOOK_AHEAD: 0.4,
  CAM_SHAKE_INTENSITY: 3,
  CAM_SHAKE_DECAY: 0.3,

  // 파티클
  SMOKE_POOL_SIZE: 80,
  TIRE_MARK_MAX: 200,

  // 트랙
  ROAD_WIDTH: 80,
  CAR_WIDTH: 30,
  CAR_HEIGHT: 16,
}
```

### 10.2 TweenManager

```javascript
class TweenManager {
  constructor() { this._tweens = []; }

  add(target, props, duration, easing, onComplete) {
    // Cycle 4 교훈: _pendingCancel 체크 후 안전하게 추가
    const tw = { target, props, duration, elapsed: 0, easing, onComplete, startValues: {} };
    for (const k in props) tw.startValues[k] = target[k];
    this._tweens.push(tw);
    return tw;
  }

  clearImmediate() {
    // Cycle 4 교훈: 즉시 정리 API (cancelAll의 deferred 문제 방지)
    this._tweens.length = 0;
  }

  update(dt) {
    for (let i = this._tweens.length - 1; i >= 0; i--) {
      const tw = this._tweens[i];
      tw.elapsed += dt;
      const t = Math.min(tw.elapsed / tw.duration, 1);
      const e = tw.easing ? tw.easing(t) : t;
      for (const k in tw.props) {
        tw.target[k] = tw.startValues[k] + (tw.props[k] - tw.startValues[k]) * e;
      }
      if (t >= 1) {
        this._tweens.splice(i, 1);
        if (tw.onComplete) tw.onComplete();
      }
    }
  }
}
```

### 10.3 ObjectPool (파티클)

```javascript
class ObjectPool {
  constructor(factory, size) {
    this._pool = Array.from({ length: size }, factory);
    this._active = [];
  }
  acquire() {
    const obj = this._pool.pop() || this._active[0]; // 풀 부족 시 가장 오래된 것 재활용
    if (obj) this._active.push(obj);
    return obj;
  }
  release(obj) {
    const idx = this._active.indexOf(obj);
    if (idx !== -1) { this._active.splice(idx, 1); this._pool.push(obj); }
  }
  update(dt, updateFn) {
    for (let i = this._active.length - 1; i >= 0; i--) {
      if (!updateFn(this._active[i], dt)) {
        this._pool.push(this._active[i]);
        this._active.splice(i, 1);
      }
    }
  }
  renderAll(ctx, renderFn) {
    for (const obj of this._active) renderFn(ctx, obj);
  }
}
```

### 10.4 SoundManager (Web Audio API 코드 합성)

| 효과음 | 합성 방법 |
|--------|-----------|
| 엔진 소리 | OscillatorNode (sawtooth, 100~400Hz 속도 비례) + GainNode |
| 타이어 스퀼 | 노이즈 버퍼 + BandpassFilter (800Hz) + 드리프트 중 gain |
| 벽 충돌 | 노이즈 burst (0.1초) + LowpassFilter (200Hz) |
| 부스트 | OscillatorNode (sawtooth, 200→800Hz 스윕, 0.3초) |
| 카운트다운 비프 | OscillatorNode (sine, 880Hz, 0.1초) |
| GO! | OscillatorNode (sine, 1320Hz, 0.2초) |
| 랩 클리어 | 3음 상행 (C5→E5→G5, 각 0.1초) |
| 별점 획득 | 글로켄 느낌 (sine, 2kHz, 0.15초, gain decay) |

---

## 11. 비주얼 구현 원칙 (CRITICAL)

### ⛔ 절대 금지 목록
1. **assets/ 디렉토리 생성 금지** — 11사이클 연속 재발 패턴. 생성 자체를 하지 말 것
2. **SVG 파일/인라인 SVG 금지** — feGaussianBlur 등 SVG 필터 재발 방지
3. **외부 이미지/폰트 로드 금지** — Google Fonts, CDN 이미지 등
4. **ASSET_MAP, SPRITES, preloadAssets 변수/함수 선언 금지** — Cycle 11 2회차 CRITICAL 원인
5. **confirm()/alert()/prompt() 사용 금지** — iframe 환경 비호환

### ✅ 허용된 비주얼 방법
- `ctx.fillRect()`, `ctx.strokeRect()`, `ctx.arc()`, `ctx.lineTo()`, `ctx.moveTo()`
- `ctx.fillText()`, `ctx.strokeText()` (시스템 폰트만: `"bold 16px monospace"`)
- `ctx.createLinearGradient()`, `ctx.createRadialGradient()`
- `ctx.setLineDash()` (도로 중앙선)
- `ctx.globalAlpha` (반투명 효과)
- `ctx.save()`/`ctx.restore()`/`ctx.translate()`/`ctx.rotate()` (차량 회전)

---

## 12. 코드 리뷰 체크리스트 (1회차 통과 목표)

### 12.1 파일 시스템 검증
- [ ] `assets/` 디렉토리가 존재하지 않는가?
- [ ] `.svg`, `.png`, `.jpg`, `.mp3`, `.ogg` 파일이 0개인가?
- [ ] `index.html` 단일 파일로 구성되어 있는가?

### 12.2 코드 패턴 검증
- [ ] `ASSET_MAP`, `SPRITES`, `preloadAssets` 문자열이 코드에 없는가?
- [ ] `new Image()`, `fetch(`, `<img` 문자열이 코드에 없는가?
- [ ] `setTimeout`으로 게임 상태를 전환하는 코드가 없는가? (tween onComplete 전용)
- [ ] `confirm(`, `alert(`, `prompt(` 문자열이 코드에 없는가?
- [ ] `feGaussianBlur`, `<svg`, `<filter` 문자열이 코드에 없는가?
- [ ] Google Fonts 또는 외부 CDN URL이 코드에 없는가?

### 12.3 아키텍처 검증
- [ ] 모든 게임 로직 함수가 전역 변수 직접 참조 없이 파라미터로 데이터를 수신하는가?
- [ ] TweenManager에 `clearImmediate()` API가 있는가?
- [ ] ObjectPool이 파티클에 사용되는가?
- [ ] gameLoop가 try-catch로 래핑되어 있는가?
- [ ] CONFIG 객체에 모든 수치가 중앙 관리되는가?
- [ ] `let`/`const` 변수가 최초 사용 이전에 선언되어 있는가? (TDZ 방지)

### 12.4 기획-구현 정합성
- [ ] CONFIG 수치가 §10.1과 일치하는가?
- [ ] 상태 × 시스템 매트릭스(§8.2)대로 각 상태에서 올바른 시스템이 업데이트되는가?
- [ ] 별점 목표 시간(§6.3)이 코드와 일치하는가?
- [ ] 5개 트랙의 노면 효과(§5.3)가 모두 구현되어 있는가?
- [ ] 터치 컨트롤이 §3.3 레이아웃대로 배치되어 있는가?
- [ ] 8종 효과음(§10.4)이 모두 Web Audio API로 구현되어 있는가?

### 12.5 상태 전환 검증
- [ ] 모든 화면 전환이 `beginTransition()`을 경유하는가? (PAUSED 즉시 전환은 예외 허용 — Cycle 8 교훈)
- [ ] 상태 전환 tween onComplete에 가드 플래그가 있는가? (1회 실행 보호 — Cycle 3 교훈)
- [ ] GAMEOVER급 전환이 다른 전환보다 우선하는가? (우선순위 — Cycle 3 교훈)

### 12.6 유령 코드 검증
- [ ] 선언된 변수 중 미사용인 것이 없는가? (Cycle 3 교훈)
- [ ] 값에 대한 갱신 경로가 하나로 통일되어 있는가? (tween과 직접 대입 중복 금지 — Cycle 5 교훈)

---

## 13. 트랙 데이터 구조

### 13.1 웨이포인트 기반 트랙 정의

```javascript
const TRACKS = [
  {
    id: 'meadow',
    name: '초원 서킷',
    roadWidth: 100,
    bgColor: '#2d5a1e',
    roadColor: '#3a3a3a',
    // 웨이포인트: [x, y] 제어점 배열 → 베지어 곡선으로 도로 경로 생성
    waypoints: [
      [200, 300], [400, 150], [600, 200], [700, 400],
      [600, 550], [350, 600], [150, 500], [200, 300]
    ],
    surfaces: [],  // 노면 효과 없음 (튜토리얼)
    starTimes: [45, 35],  // ★★ / ★★★ 목표 시간(초)
    starDP: 3000,          // ★★★ 드리프트 포인트 목표
    locked: false
  },
  {
    id: 'desert',
    name: '사막 랠리',
    roadWidth: 80,
    bgColor: '#c2956b',
    roadColor: '#8a7560',
    waypoints: [ /* 더 복잡한 경로 */ ],
    surfaces: [
      { type: 'sand', cx: 450, cy: 300, radius: 40 },
      { type: 'sand', cx: 600, cy: 500, radius: 35 }
    ],
    starTimes: [55, 42],
    starDP: 5000,
    locked: true
  },
  // ... 설산, 도심, 화산
]
```

### 13.2 랩 판정

```
- 트랙 시작/종료 지점에 "체크라인" (선분) 배치
- 차량이 체크라인을 정방향으로 통과 시 랩 카운트 증가
- 역방향 통과는 무시 (내적 판정)
- 중간 체크포인트 2개로 숏컷 방지
```

---

## 14. 고스트 레코드 시스템

### 14.1 기록 저장
- 매 6프레임(0.1초)마다 `{ x, y, angle, driftAngle, boosting }` 스냅샷 저장
- localStorage에 트랙별 최고 기록의 스냅샷 배열 저장
- 저장 키: `mdr_ghost_{trackId}`

### 14.2 고스트 재생
- 저장된 스냅샷을 시간 기반으로 lerp 보간하여 반투명 차량으로 렌더링
- 고스트 차량: `rgba(255,255,255,0.3)`, 충돌 판정 없음

### 14.3 기록 판정 순서 (Cycle 2 교훈: "판정 먼저, 저장 나중에")
```
1. 현재 기록과 저장된 베스트 비교 → isNewRecord 플래그 설정
2. isNewRecord이면 localStorage 저장
3. 결과 화면에서 isNewRecord 표시
```

---

## 15. 게임 페이지 사이드바 데이터

```yaml
game:
  title: "미니 드리프트 레이서"
  description: "관성 기반 드리프트 물리로 5개 트랙을 돌파하라! 드리프트 포인트를 쌓고 부스트를 충전하며 베스트 랩 타임에 도전하는 탑다운 레이싱 게임."
  genre: ["arcade"]
  playCount: 0
  rating: 0
  controls:
    - "↑/W: 가속"
    - "↓/S: 브레이크"
    - "←→/AD: 스티어링"
    - "Space: 핸드브레이크(드리프트)"
    - "Shift: 부스트"
    - "터치: 가상 버튼"
  tags:
    - "#레이싱"
    - "#드리프트"
    - "#탑다운"
    - "#물리엔진"
    - "#타임어택"
  addedAt: "2026년 3월 21일"
  version: "1.0.0"
  featured: true
```

---

## 16. 이전 사이클 교훈 대응 매핑

| # | 교훈 (platform-wisdom) | 기획서 반영 위치 | 대응 방법 |
|---|----------------------|----------------|-----------|
| 1 | assets/ 디렉토리 재발 | §11 | Canvas 전용 드로잉. 절대 금지 목록 5항목 |
| 2 | SVG 필터 재발 | §11 | SVG 전면 금지. 코드 검증 체크리스트 |
| 3 | setTimeout 상태 전환 | §5.1, §12.2 | tween onComplete 전용. 체크리스트 검증 |
| 4 | TweenManager 경쟁 조건 | §10.2 | clearImmediate() API 구현 |
| 5 | 상태×시스템 매트릭스 | §8.2 | 7개 상태 × 9개 시스템 매트릭스 명세 |
| 6 | 가드 플래그 1회 보호 | §12.5 | 상태 전환 tween에 가드 플래그 필수 |
| 7 | 순수 함수 패턴 | §5.2, §12.3 | updateCarPhysics 등 모든 로직 함수 파라미터화 |
| 8 | beginTransition 통일 | §8.1, §12.5 | PAUSED 예외 외 전부 beginTransition 경유 |
| 9 | 기획-구현 수치 정합성 | §12.4 | CONFIG 수치 대조 체크리스트 6항목 |
| 10 | 유령 코드 방지 | §12.6 | 미사용 변수/중복 갱신 경로 검증 |
| 11 | TDZ 방지 | §12.3 | let/const 선언 순서 검증 |
| 12 | try-catch gameLoop | §5.1, §12.3 | gameLoop try-catch 래핑 필수 |
| 13 | iframe 내 confirm/alert 금지 | §11 | Canvas 기반 모달 전용 |
| 14 | dt 상한 | §5.1 | dt = min(dt, 0.05) 탭 복귀 보호 |

---

_End of Spec — Cycle #12 미니 드리프트 레이서_
