---
game-id: neon-drift-racer
title: 네온 드리프트 레이서
genre: arcade
difficulty: medium
---

# 네온 드리프트 레이서 — 상세 기획서 (Cycle 12)

---

## §0. 이전 사이클 피드백 반영 매핑

| # | 출처 | 문제/제안 | 이번 기획 반영 방법 |
|---|------|----------|-------------------|
| 1 | Cycle 12 분석 보고서 | **레이싱 장르 0% — 완전한 공백** | ✅ 본 게임으로 플랫폼 최초 레이싱 장르 추가 |
| 2 | Cycle 12 분석 보고서 | **casual 55% 편중** | ✅ 순수 arcade 태그. casual 태그 없음 → casual 55%→50% |
| 3 | Cycle 11 포스트모템 | **"레이싱에 도전하자" 직접 제안** | ✅ 탑다운 아케이드 레이싱으로 직접 반영 |
| 4 | Cycle 11 포스트모템 | **물리 엔진 노하우 재활용** | ✅ AABB 충돌→벡터 기반 차량 물리로 진화. 카메라 추적 시스템 재활용 |
| 5 | Cycle 11 포스트모템 | **3회 리뷰 필요 — 1회차 통과 목표** | §12.1 — 처음부터 100% Canvas 코드 드로잉. assets/ 디렉토리 생성 절대 금지 |
| 6 | Cycle 11 포스트모템 | **CI pre-commit 훅 실제 등록** | §12.2 — `.git/hooks/pre-commit`에 assets/ 검증 스크립트 실제 등록 후 동작 검증 |
| 7 | Cycle 11 포스트모템 | **공용 엔진 모듈 분리 제안** | §12.10 — 본 기획 범위 외(별도 태스크). TweenManager/ObjectPool/TransitionGuard 동일 인터페이스 유지 |
| 8 | Cycle 11 포스트모템 | **월드별 고유 장애물 6종 미구현** | ✅ 본 게임은 트랙 3개에 각각 고유 장애물/특수 구간 구현 (§2.4) |
| 9 | Cycle 11 포스트모템 | **일일 챌린지 미구현** | 본 게임 범위 외. 코어 레이싱에 집중하여 scope creep 방지 |
| 10 | platform-wisdom [Cycle 1~11] | **assets/ 디렉토리 11사이클 연속 재발** | §12.1 — Canvas API 전용. assets/ 생성 금지. pre-commit 훅 실등록 |
| 11 | platform-wisdom [Cycle 1] | **iframe 내 confirm()/alert() 금지** | 모든 모달/다이얼로그는 Canvas 기반 커스텀 UI |
| 12 | platform-wisdom [Cycle 2] | **상태×시스템 매트릭스 필수** | §5.3 — 6상태 × 7시스템 매트릭스 포함 |
| 13 | platform-wisdom [Cycle 3] | **tween onComplete 가드 플래그** | §5.2 — 모든 상태 전환에 `_transitioning` 가드 플래그 적용 |
| 14 | platform-wisdom [Cycle 4] | **cancelAll+add 경쟁 조건** | §12.4 — clearImmediate() 즉시 정리 API 사용 |
| 15 | platform-wisdom [Cycle 2] | **setTimeout 상태 전환 금지** | §5 — 모든 지연 전환은 tween onComplete. setTimeout 사용 0건 목표 |
| 16 | platform-wisdom [Cycle 5] | **단일 값 갱신 경로 통일** | 하나의 값은 tween OR 직접 대입 중 하나만 사용 |
| 17 | platform-wisdom [Cycle 6-7] | **순수 함수 원칙** | §10 — 모든 물리/충돌/AI 함수는 파라미터 기반 순수 함수 |
| 18 | platform-wisdom [Cycle 7] | **기획-구현 수치 불일치** | §6, §7 — CONFIG 객체에 물리 상수 집중. 기획서 수치표와 1:1 대조 |
| 19 | platform-wisdom [Cycle 8] | **beginTransition() 미경유** | §5.2 — 모든 전환이 `beginTransition()` 경유. 즉시 전환도 `beginTransition(state, {immediate:true})` |
| 20 | platform-wisdom [Cycle 8] | **PAUSED 같은 즉시 전환 예외** | §5.2 — PAUSED↔RACE 전환은 `immediate:true` 옵션으로 통일 |
| 21 | platform-wisdom [Cycle 10] | **수정 회귀 — 시그니처 변경 시 호출부 전파 누락** | §12.8 — 함수 시그니처 변경 시 모든 호출부 전수 검증 |
| 22 | platform-wisdom [Cycle 11] | **let/const TDZ 크래시** | §12.7 — 모든 변수는 최초 참조 이전에 선언 |
| 23 | platform-wisdom [Cycle 2-3] | **유령 변수 방지** | §12.3 — 선언된 변수 사용처 전수 검증 체크리스트 |
| 24 | platform-wisdom [Cycle 10] | **게임 루프 try-catch 래핑 필수** | §12.9 — `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` 패턴 |
| 25 | platform-wisdom [Cycle 11] | **dt 파라미터 전달** | 모든 렌더/업데이트 함수에 gameLoop의 dt를 파라미터로 전달 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
네온 불빛이 빛나는 미래도시 트랙에서 **드리프트**와 **부스트**를 구사하며 AI 차량 3대와 경쟁하는 **탑다운 아케이드 레이싱**. 1레이스 3랩(약 2~3분), 짧은 세션과 높은 리플레이성. 드리프트 조작을 마스터할수록 부스트 게이지가 빨리 차오르는 "스킬 표현 → 보상" 루프가 핵심이다. 3개 트랙을 순차 언락하며, 전체 클리어 약 15~20분. 트랙별 최고 기록 + 순위표로 마스터리 동기를 부여한다.

### 핵심 재미 3요소
1. **드리프트 마스터리**: 고속에서 브레이크+조향 시 자동 드리프트 진입. 드리프트 각도와 지속 시간에 비례하여 부스트 게이지 충전. "완벽한 드리프트"를 연결할수록 빠른 랩 타임 달성
2. **부스트 러시**: 게이지 50% 이상 시 Space로 폭발적 순간 가속. 부스트 타이밍(직선 구간 vs 커브 진입 전)이 전략적 선택
3. **AI 경쟁과 언락**: 3대 AI 차량과 순위 경쟁. 시티 3위 이내→캐니언, 캐니언 3위 이내→스타 링 언락. 하드 모드(AI +20% 속도)로 마스터리 확장

### 레퍼런스
- **Micro Machines**: 탑다운 레이싱의 고전. 미니어처 차량 + 가정용품 트랙
- **Drift King (CrazyGames)**: 브라우저 드리프트 레이싱의 인기 검증
- **Moto X3M**: 물리 기반 레이싱의 "즉시 리트라이" 중독성
- **Initial D Arcade**: 드리프트 게이지→부스트 메카닉의 원조

### 게임 페이지 사이드바 정보
```yaml
title: "네온 드리프트 레이서"
description: "네온 불빛의 미래도시에서 드리프트와 부스트로 AI를 제치고 1위를 차지하라! 탑다운 아케이드 레이싱."
genre: ["arcade"]
playCount: 0
rating: 0
controls:
  - "키보드: ←→ 조향 / ↑ 가속 / ↓ 브레이크 / Space 부스트"
  - "터치: 가상 스티어링(좌) + 가속·브레이크·부스트 버튼(우)"
  - "마우스: 메뉴 선택 전용"
tags:
  - "#레이싱"
  - "#드리프트"
  - "#네온"
  - "#아케이드"
  - "#싱글플레이"
addedAt: "2026-03-21"
version: "1.0.0"
featured: true
```

---

## §2. 게임 규칙 및 목표

### 2.1 최종 목표
3개 트랙(시티 서킷→캐니언 런→스타 링)을 순차 언락하여 모두 3위 이내로 클리어. 스타 링 1위 달성 시 하드 모드 해금.

### 2.2 레이스 규칙
- 4대 차량(플레이어 1 + AI 3)이 동시 출발
- 3랩 완주 시 순위 확정
- 트랙 경계(벽) 충돌 시 속도 70% 감소 + 0.3초 스턴
- 역주행 시 "WRONG WAY" 경고 표시 (3초 이상 역주행 시 최근 체크포인트로 리셋)
- 오프로드(트랙 밖) 주행 시 최대 속도 40% 감소

### 2.3 트랙 구성

| 트랙 | 테마 | 난이도 | 색상 팔레트 | 특징 |
|------|------|--------|-------------|------|
| 시티 서킷 | 네온 도시 | 초급 | #0ff(cyan) + #333(도로) + #111(배경) | 넓은 도로(120px), 완만한 커브 4개, 직선 구간 多 |
| 캐니언 런 | 사막 협곡 | 중급 | #f80(orange) + #543(도로) + #221(배경) | 좁은 도로(90px), 헤어핀 2개, S커브 연속, 모래 구간(감속) |
| 스타 링 | 우주 궤도 | 고급 | #f0f(magenta) + #224(도로) + #000(배경) | 극좁 도로(70px), 급커브 5개, 부스트 패드 3개, 운석 장애물 |

### 2.4 트랙별 고유 요소 (Cycle 11 "월드별 장애물 미구현" 개선)

| 트랙 | 고유 장애물/특수 구간 | 설명 |
|------|---------------------|------|
| 시티 서킷 | 공사 바리케이드 (2개) | 도로 일부를 좁히는 고정 장애물. 초보자에게 회피 연습 제공 |
| 캐니언 런 | 모래 구간 (3개) | 진입 시 최대 속도 50% + 조향력 60%로 제한. 드리프트 불가 |
| 스타 링 | 운석 (4개, 왕복 이동) | 트랙을 가로지르며 왕복. 충돌 시 2초 스핀아웃 |

### 2.5 언락 조건

| 조건 | 결과 |
|------|------|
| 시티 서킷 3위 이내 | 캐니언 런 언락 |
| 캐니언 런 3위 이내 | 스타 링 언락 |
| 스타 링 1위 | 하드 모드 언락 (AI 속도 +20%) |

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 동작 |
|----|------|
| ↑ 또는 W | 가속 |
| ↓ 또는 S | 브레이크 (고속+조향 시 드리프트 진입) |
| ← 또는 A | 좌회전 |
| → 또는 D | 우회전 |
| Space | 부스트 사용 (게이지 50% 이상) |
| P 또는 Esc | 일시정지 |

### 3.2 모바일 터치
- **좌측 하단**: 가상 스티어링 휠 (원형 영역, 터치 드래그로 좌우 조향)
- **우측 하단**: 3개 버튼 세로 배치
  - 가속 (홀드)
  - 브레이크 (홀드, 고속+조향 시 드리프트)
  - 부스트 (탭, 게이지 50%+ 시 활성화)
- **우측 상단**: 일시정지 버튼
- 모바일 감지: `'ontouchstart' in window` → 터치 UI 자동 표시

### 3.3 마우스
- 메뉴/트랙 선택/결과 화면에서 클릭 전용
- 인게임 조작에는 사용하지 않음

---

## §4. 시각적 스타일 가이드

### 4.1 전체 톤
**사이버펑크 네온** — 어두운 배경 위에 밝은 네온 선과 글로우 이펙트. Tron 레거시 + 아웃런 미학.

### 4.2 색상 팔레트

| 용도 | 색상 | HEX |
|------|------|-----|
| 배경 | 깊은 검정 | `#0a0a0a` |
| 트랙 도로 | 짙은 회색 | `#2a2a2a` |
| 트랙 경계선 | 네온 시안 | `#00ffff` |
| 플레이어 차량 | 네온 시안 | `#00ffff` |
| AI 차량 1 | 네온 마젠타 | `#ff00ff` |
| AI 차량 2 | 네온 그린 | `#00ff66` |
| AI 차량 3 | 네온 오렌지 | `#ff8800` |
| 부스트 게이지 | 시안→옐로우 그라데이션 | `#00ffff` → `#ffff00` |
| 드리프트 잔상 | 반투명 플레이어 색 | `rgba(0,255,255,0.3)` |
| UI 텍스트 | 밝은 화이트 | `#ffffff` |
| 경고 텍스트 | 네온 레드 | `#ff3333` |
| 체크포인트 | 네온 옐로우 | `#ffff00` |
| 미니맵 배경 | 반투명 검정 | `rgba(0,0,0,0.7)` |

### 4.3 오브젝트 드로잉 (Canvas API 전용, assets/ 0개)

모든 비주얼은 **Canvas 2D API**(fillRect, arc, lineTo, fillText, strokeStyle + lineWidth + globalAlpha)로 구현. 외부 이미지/SVG 파일 없음.

| 오브젝트 | 드로잉 방식 |
|----------|------------|
| 차량 | 직사각형(20x12px) + 삼각형 앞부분. `ctx.rotate(angle)` 활용 |
| 트랙 | 선분 배열 기반 폴리라인. `ctx.lineWidth`로 도로 폭 표현 |
| 트랙 경계 | 트랙 폴리라인의 법선 방향 오프셋 + 네온 글로우 (`shadowBlur`) |
| 체크포인트 | 트랙 가로지르는 점선 (`setLineDash`) |
| 부스트 패드 | 트랙 위 삼각형 화살표 패턴 (네온 옐로우) |
| 드리프트 잔상 | 이전 위치에 반투명 차량 도형 (alpha 감쇠) |
| 부스트 이펙트 | 차량 뒤 파티클 (ObjectPool, 원형 3~5px, alpha 감쇠) |
| 타이어 자국 | 드리프트 중 트랙 위 반투명 선 (`rgba(255,255,255,0.1)`) |
| 벽 충돌 스파크 | 충돌 지점에서 3~5개 파티클 방사 |
| 배경 별 | 작은 원(1~2px) 랜덤 배치 (스타 링 전용) |
| 미니맵 | 우측 상단 150x150px 박스. 트랙 축소 + 차량 점 4개 |
| 바리케이드 | 빨간-흰 줄무늬 직사각형 (fillRect 반복) |
| 모래 구간 | 노란 반투명 영역 (fillStyle + globalAlpha 0.3) |
| 운석 | 불규칙 원형 (arc + 짧은 lineTo 돌기 4~6개) + 오렌지 글로우 |

### 4.4 글로우 효과 규칙
- `ctx.shadowBlur = 8~15` + `ctx.shadowColor` = 오브젝트 색상
- 성능 보호: 글로우는 **차량(4대) + 트랙 경계선 + UI 텍스트**에만 적용
- 파티클/타이어 자국에는 글로우 미적용 (shadowBlur = 0)
- **feGaussianBlur 등 SVG 필터 절대 미사용**

---

## §5. 핵심 게임 루프

### 5.1 메인 루프 (60fps 기준)

```
requestAnimationFrame(loop)
+-- dt = clamp(now - lastTime, 0, 50) / 1000   // 최대 50ms(20fps) 캡
+-- try {
|   +-- switch(gameState) {
|   |   case TITLE:        updateTitle(dt)        -> renderTitle(ctx, dt)
|   |   case TRACK_SELECT: updateTrackSelect(dt)  -> renderTrackSelect(ctx, dt)
|   |   case COUNTDOWN:    updateCountdown(dt)    -> renderCountdown(ctx, dt)
|   |   case RACE:         updateRace(dt)         -> renderRace(ctx, dt)
|   |   case PAUSED:       /* no update */        -> renderPaused(ctx, dt)
|   |   case RESULT:       updateResult(dt)       -> renderResult(ctx, dt)
|   |   }
|   +-- tweenManager.update(dt)
|   +-- inputManager.resetFrame()
|   } catch(e) { console.error(e); }
+-- lastTime = now
```

### 5.2 상태 전환 규칙

모든 상태 전환은 **반드시 `beginTransition(targetState, options)` 경유**. 직접 `gameState = X` 금지.

```javascript
function beginTransition(target, opts = {}) {
  if (_transitioning) return;       // 가드 플래그
  _transitioning = true;
  if (opts.immediate) {
    gameState = target;
    _transitioning = false;
    return;
  }
  tweenManager.clearImmediate();    // cancelAll 대신 즉시 플러시
  tweenManager.add({
    from: 1, to: 0, duration: 300,
    onUpdate: v => fadeAlpha = v,
    onComplete: () => {
      gameState = target;
      tweenManager.add({
        from: 0, to: 1, duration: 300,
        onUpdate: v => fadeAlpha = v,
        onComplete: () => { _transitioning = false; }
      });
    }
  });
}
```

전환 경로:
```
TITLE -> TRACK_SELECT -> COUNTDOWN -> RACE <-> PAUSED
                                       |
                                     RESULT -> TRACK_SELECT (또는 TITLE)
```

- `RACE <-> PAUSED`: `beginTransition(state, {immediate: true})` (즉시 전환)
- 나머지: 페이드 전환 (300ms)

### 5.3 상태 x 시스템 매트릭스

| 시스템 \ 상태 | TITLE | TRACK_SELECT | COUNTDOWN | RACE | PAUSED | RESULT |
|--------------|-------|-------------|-----------|------|--------|--------|
| **물리(physics)** | - | - | - | O | - | - |
| **AI** | - | - | - | O | - | - |
| **렌더(render)** | O | O | O | O | O | O |
| **입력(input)** | O(메뉴) | O(메뉴) | - | O(조작) | O(P키만) | O(메뉴) |
| **tween** | O | O | O | O | O | O |
| **사운드** | O(BGM) | O(BGM) | O(효과음) | O(전체) | - | O(효과음) |
| **파티클** | - | - | - | O | - | - |

> **PAUSED에서도 tween은 업데이트한다** (Cycle 2 B1 교훈: CONFIRM_MODAL에서 tween 미갱신 시 모달 alpha=0 고정)

---

## §6. 차량 물리 시스템

### 6.1 물리 모델 (벡터 기반)

```javascript
const CONFIG = {
  // --- 차량 물리 상수 (기획서 §6 수치와 1:1 매핑) ---
  MAX_SPEED:          300,    // px/s 최대 속도
  ACCELERATION:       180,    // px/s^2 가속도
  BRAKE_FORCE:        250,    // px/s^2 브레이크 감속
  COAST_FRICTION:     60,     // px/s^2 무입력 마찰
  STEER_SPEED:        3.2,    // rad/s 조향 속도
  STEER_SPEED_FACTOR: 0.4,    // 고속에서 조향 감소 비율
  DRIFT_THRESHOLD:    0.7,    // 속도 비율 70% 이상 + 브레이크 + 조향 시 드리프트
  DRIFT_FRICTION:     0.92,   // 드리프트 중 횡방향 마찰 계수
  DRIFT_STEER_MULT:   1.4,    // 드리프트 중 조향 배율
  BOOST_GAUGE_MAX:    100,    // 부스트 게이지 최대값
  BOOST_MIN_USE:      50,     // 부스트 사용 최소 게이지
  BOOST_DRAIN:        40,     // 부스트 사용 시 초당 게이지 소모
  BOOST_SPEED_MULT:   1.6,    // 부스트 시 속도 배율
  BOOST_DURATION:     1.5,    // 부스트 지속 시간 (초)
  DRIFT_CHARGE_RATE:  25,     // 드리프트 중 초당 게이지 충전
  WALL_SPEED_MULT:    0.3,    // 벽 충돌 시 남은 속도 비율
  WALL_STUN:          0.3,    // 벽 충돌 스턴 시간 (초)
  OFFROAD_SPEED_MULT: 0.6,    // 오프로드 최대 속도 비율
  SAND_SPEED_MULT:    0.5,    // 모래 구간 최대 속도 비율
  SAND_STEER_MULT:    0.6,    // 모래 구간 조향 비율
  SPINOUT_DURATION:   2.0,    // 운석 충돌 스핀아웃 (초)

  // --- AI 상수 ---
  AI_WAYPOINT_RADIUS: 40,     // AI 웨이포인트 도달 판정 반경
  AI_SPEED_EASY:      0.78,   // AI 시티 서킷 속도 배율
  AI_SPEED_MED:       0.85,   // AI 캐니언 속도 배율
  AI_SPEED_HARD:      0.92,   // AI 스타 링 속도 배율
  AI_HARD_MODE_MULT:  1.20,   // 하드 모드 AI 추가 배율

  // --- 카메라 ---
  CAM_LERP:           0.08,   // 카메라 추적 보간 계수
  CAM_LOOKAHEAD:      80,     // 이동 방향 선행 거리 (px)
  CAM_SHAKE_WALL:     6,      // 벽 충돌 흔들림 강도 (px)
  CAM_SHAKE_BOOST:    3,      // 부스트 흔들림 강도 (px)
};
```

### 6.2 물리 업데이트 (매 프레임)

```
updateCarPhysics(car, input, dt, trackData):
  1. 스턴 타이머 체크 -> 스턴 중이면 감속만 적용 후 return
  2. 조향 계산:
     effectiveSteer = input.steer * STEER_SPEED * (1 - speed/MAX_SPEED * STEER_SPEED_FACTOR)
     if (isDrifting) effectiveSteer *= DRIFT_STEER_MULT
     car.angle += effectiveSteer * dt
  3. 가속/감속:
     if (input.gas)   car.speed += ACCELERATION * dt
     if (input.brake) car.speed -= BRAKE_FORCE * dt
     else             car.speed -= COAST_FRICTION * dt
  4. 드리프트 판정:
     if (input.brake && input.steer != 0 && car.speed/MAX_SPEED > DRIFT_THRESHOLD)
       -> isDrifting = true, 횡속도에 DRIFT_FRICTION 적용, 부스트 게이지 충전
     else -> isDrifting = false
  5. 부스트 적용:
     if (input.boost && boostGauge >= BOOST_MIN_USE)
       -> car.speed *= BOOST_SPEED_MULT (캡: MAX_SPEED * BOOST_SPEED_MULT)
       -> boostGauge -= BOOST_DRAIN * dt
  6. 속도 제한:
     maxSpd = MAX_SPEED
     if (onOffroad) maxSpd *= OFFROAD_SPEED_MULT
     if (onSand)    maxSpd *= SAND_SPEED_MULT
     car.speed = clamp(car.speed, 0, maxSpd)
  7. 위치 이동:
     car.x += cos(car.angle) * car.speed * dt
     car.y += sin(car.angle) * car.speed * dt
  8. 충돌 판정 (트랙 경계):
     if (벽 충돌) -> speed *= WALL_SPEED_MULT, stunTimer = WALL_STUN, 위치 보정
  9. 체크포인트/랩 판정
```

### 6.3 드리프트 상세 메카닉

드리프트 진입 조건:
1. 속도 >= MAX_SPEED x DRIFT_THRESHOLD (70%)
2. 브레이크 입력 중
3. 좌/우 조향 입력 중

드리프트 중:
- 차량의 이동 방향과 차체 방향 사이에 **슬립 각도** 발생 (최대 35도)
- 조향 감도 1.4배 -> 더 날카로운 코너링
- 초당 부스트 게이지 +25 충전
- 드리프트 잔상 이펙트 + 타이어 자국 이펙트
- 효과음: 타이어 스키드

드리프트 종료: 브레이크 해제 OR 속도 < 50% OR 조향 해제

---

## §7. 점수 시스템

### 7.1 레이스 결과 점수

| 항목 | 점수 |
|------|------|
| 1위 완주 | 1000 |
| 2위 완주 | 700 |
| 3위 완주 | 400 |
| 4위 완주 | 200 |
| 랩 보너스 (최빠른 랩) | +300 |
| 드리프트 보너스 (누적 3초+) | +50 x 드리프트 횟수 |
| 클린 랩 (벽 충돌 0) | +200 / 랩 |
| 부스트 사용 횟수 | +30 x 횟수 |

### 7.2 기록 저장 (localStorage)

```javascript
// 키 구조: ndr_{trackId}_{항목}
// 예: ndr_city_bestLap, ndr_city_bestRace, ndr_city_bestScore

// 판정 먼저, 저장 나중에 (Cycle 2 B4 교훈)
const isNewRecord = (currentLap < getBestLap(trackId));
saveBestLap(trackId, currentLap);
if (isNewRecord) showNewRecordEffect();
```

저장 항목:
- `ndr_{trackId}_bestLap`: 최빠른 싱글 랩 타임
- `ndr_{trackId}_bestRace`: 최빠른 전체 레이스 타임
- `ndr_{trackId}_bestScore`: 최고 점수
- `ndr_{trackId}_bestRank`: 최고 순위
- `ndr_unlocked`: 언락된 트랙 배열 ("city" 기본)
- `ndr_hardMode`: 하드 모드 해금 여부

---

## §8. AI 시스템

### 8.1 웨이포인트 추적 AI

각 트랙에 **웨이포인트 배열**(20~30개 좌표)을 사전 정의. AI 차량은 다음 웨이포인트를 향해 조향.

```
updateAI(aiCar, waypoints, dt, trackData, aiSpeedMult):
  1. 다음 웨이포인트까지 각도 계산
  2. 현재 방향과의 차이 -> 조향 입력 결정
  3. 장애물(다른 차량, 운석) 감지 -> 회피 조향 보정
  4. 속도 조절: 커브 전 감속, 직선 가속
     targetSpeed = MAX_SPEED * aiSpeedMult * (커브 급함 ? 0.7 : 1.0)
  5. 웨이포인트 도달 판정 -> 다음 웨이포인트로 이동
```

### 8.2 AI 개성

| AI | 색상 | 특성 | 속도 배율 기본 |
|----|------|------|--------------|
| AI-1 "블레이즈" | 마젠타 (#ff00ff) | 공격적. 직선에서 빠르고 커브에서 느림 | x1.02 |
| AI-2 "팬텀" | 그린 (#00ff66) | 균형형. 안정적인 주행 | x1.00 |
| AI-3 "섀도우" | 오렌지 (#ff8800) | 방어적. 커브에서 빠르고 직선에서 느림 | x0.98 |

> 위 배율은 트랙별 AI_SPEED_xxx와 곱해짐. 예: 시티에서 블레이즈 = 0.78 x 1.02 = 0.796배

### 8.3 러버밴딩 (간이)

- 플레이어가 AI보다 반 랩 이상 앞서면: AI 속도 x1.05
- 플레이어가 AI보다 반 랩 이상 뒤처지면: AI 속도 x0.95
- 재미를 위한 최소한의 보정. 과도한 러버밴딩 금지.

---

## §9. 난이도 시스템

### 9.1 트랙별 난이도 설계

| 요소 | 시티 서킷 (초급) | 캐니언 런 (중급) | 스타 링 (고급) |
|------|-----------------|-----------------|---------------|
| 도로 폭 | 120px | 90px | 70px |
| 커브 수 | 4 (완만) | 6 (헤어핀 2개) | 8 (급커브 5개) |
| 특수 구간 | 바리케이드 2개 | 모래 3개 | 운석 4개 + 부스트패드 3개 |
| AI 속도 비율 | 0.78 | 0.85 | 0.92 |
| 드리프트 필수도 | 낮음 | 중간 | 높음 |
| 1랩 예상 시간 | 35~45초 | 40~55초 | 45~65초 |

### 9.2 하드 모드 (스타 링 1위 달성 후 해금)

- 모든 트랙의 AI 속도 x1.20 추가 배율
- AI 러버밴딩 비활성화
- 벽 충돌 스턴 0.3초→0.5초
- 결과 화면에 "HARD" 배지 표시

### 9.3 적응형 힌트 (AI 적응형 난이도 트렌드 반영)

- 시티 서킷에서 3회 연속 4위: "TIP: 브레이크를 밟으며 좌우로 꺾으면 드리프트!" 팁 표시
- 부스트 미사용 2회 연속: "TIP: 드리프트로 게이지를 채우고 Space로 부스트!" 팁 표시
- 팁은 Canvas 텍스트로 2초 표시 후 페이드아웃 (tween으로 alpha 감쇠)

---

## §10. 순수 함수 설계 원칙

### 10.1 규칙
- **모든 게임 로직 함수**는 필요한 데이터를 **파라미터로** 수신
- 전역 변수/객체 직접 참조 금지 (CONFIG 상수 객체는 예외: 읽기 전용)
- 함수 시그니처 변경 시 **모든 호출부** 전수 검증 (§12.8)

### 10.2 함수 시그니처 목록

| 함수명 | 파라미터 | 반환 |
|--------|----------|------|
| `updateCarPhysics` | (car, input, dt, trackData) | void (car 직접 수정) |
| `updateAI` | (aiCar, waypoints, dt, trackData, speedMult) | {steer, gas, brake, boost} |
| `checkTrackCollision` | (car, trackSegments, roadWidth) | {hit, normal, point} |
| `checkCheckpoint` | (car, checkpoints, currentCP) | nextCP index or -1 |
| `checkLapComplete` | (car, checkpoints, currentCP, totalCPs) | bool |
| `calculateScore` | (rank, fastestLap, driftCount, cleanLaps, boostCount) | number |
| `isOnOffroad` | (pos, trackSegments, roadWidth) | bool |
| `isOnSand` | (pos, sandZones) | bool |
| `checkMeteorCollision` | (car, meteors) | bool |
| `renderCar` | (ctx, car, color, isDrifting, glowEnabled) | void |
| `renderTrack` | (ctx, trackData, camera) | void |
| `renderMinimap` | (ctx, trackData, cars, camera) | void |
| `renderHUD` | (ctx, lap, totalLaps, time, rank, boostGauge, speed) | void |

---

## §11. 트랙 데이터 구조

### 11.1 형식

트랙은 **중심선 좌표 배열** + **메타데이터**로 정의. 코드 내 상수로 선언.

```javascript
const TRACKS = {
  city: {
    name: "시티 서킷",
    roadWidth: 120,
    // 중심선 좌표 (닫힌 루프, 10~15개 제어점)
    centerLine: [
      {x: 400, y: 600}, {x: 600, y: 600}, {x: 750, y: 550},
      {x: 800, y: 400}, {x: 750, y: 250}, {x: 600, y: 200},
      {x: 400, y: 200}, {x: 250, y: 250}, {x: 200, y: 400},
      {x: 250, y: 550}  // -> 첫 점으로 이어짐 (닫힌 루프)
    ],
    startPos: {x: 400, y: 620, angle: 0},
    checkpoints: [0, 3, 6],  // centerLine 인덱스
    laps: 3,
    obstacles: [
      {type: 'barricade', seg: 2, offset: 30, width: 40},
      {type: 'barricade', seg: 7, offset: -25, width: 40}
    ],
    aiWaypoints: [ /* 20~30개 좌표 - 트랙 중심선보다 촘촘 */ ],
    aiSpeedMult: 0.78,
    bgColor: '#0a0a0a',
    roadColor: '#2a2a2a',
    borderColor: '#00ffff'
  },
  canyon: {
    name: "캐니언 런",
    roadWidth: 90,
    centerLine: [ /* 12~15개 제어점 */ ],
    startPos: {x: 300, y: 650, angle: -0.3},
    checkpoints: [0, 4, 8],
    laps: 3,
    obstacles: [
      {type: 'sand', seg: 3, length: 80},
      {type: 'sand', seg: 7, length: 60},
      {type: 'sand', seg: 11, length: 70}
    ],
    aiSpeedMult: 0.85,
    bgColor: '#221100',
    roadColor: '#554433',
    borderColor: '#ff8800'
  },
  star: {
    name: "스타 링",
    roadWidth: 70,
    centerLine: [ /* 15~18개 제어점 */ ],
    startPos: {x: 500, y: 700, angle: -0.5},
    checkpoints: [0, 5, 10],
    laps: 3,
    obstacles: [
      {type: 'meteor', x: 600, y: 300, moveRange: 120, speed: 80},
      {type: 'meteor', x: 350, y: 450, moveRange: 100, speed: 60},
      {type: 'meteor', x: 700, y: 500, moveRange: 90, speed: 70},
      {type: 'meteor', x: 250, y: 250, moveRange: 110, speed: 65}
    ],
    boostPads: [
      {seg: 4, offset: 0},
      {seg: 9, offset: 0},
      {seg: 14, offset: 0}
    ],
    aiSpeedMult: 0.92,
    bgColor: '#000000',
    roadColor: '#222244',
    borderColor: '#ff00ff'
  }
};
```

### 11.2 트랙 렌더링 원리

1. centerLine 좌표 배열에서 **카트뮬-롬 보간**으로 부드러운 곡선 생성
2. 곡선의 각 점에서 **법선 벡터** 계산 -> 좌우 roadWidth/2 오프셋으로 도로 경계 생성
3. 도로: `ctx.fillStyle = roadColor` + 폴리곤 `ctx.fill()`
4. 경계선: `ctx.strokeStyle = borderColor` + `ctx.shadowBlur = 10` (네온 글로우)
5. 뷰포트 컬링: 카메라 기준 화면 밖 세그먼트는 렌더링 스킵

---

## §12. 구현 가이드라인 및 검증 체크리스트

### 12.1 assets/ 디렉토리 절대 금지 (11사이클 교훈)

**규칙:**
- `assets/` 디렉토리 생성 금지
- 외부 이미지 파일(SVG, PNG, JPG 등) 0개
- Google Fonts 등 외부 CDN 로드 금지
- 모든 비주얼은 Canvas API(`fillRect`, `arc`, `lineTo`, `fillText`, `strokeStyle`, `shadowBlur`)로 구현
- 모든 사운드는 Web Audio API `OscillatorNode`/`GainNode`로 코드 합성

**금지 패턴 목록:**
- `new Image()`, `<img>`, `background-image: url()`
- `ASSET_MAP`, `SPRITES`, `preloadAssets`
- `feGaussianBlur`, `<filter>`, SVG 파일 전체
- `@import url()`, `link rel="stylesheet" href="외부URL"`

### 12.2 pre-commit 훅 실제 등록

```bash
#!/bin/sh
# .git/hooks/pre-commit - assets/ 디렉토리 차단
if find public/games/*/assets -type f 2>/dev/null | head -1 | grep -q .; then
  echo "BLOCKED: assets/ 디렉토리에 파일이 있습니다. Canvas 코드 드로잉만 허용."
  exit 1
fi
```

**핵심:** 기획서에 쓰는 것이 아니라 `.git/hooks/pre-commit`에 **실제 등록 후 `chmod +x` 실행**까지 검증해야 함 (Cycle 8 교훈).

### 12.3 유령 변수 방지 체크리스트

선언된 모든 변수가 기획서 의도대로 사용되는지 확인:
- [ ] `isDrifting` — updateCarPhysics에서 설정, 렌더에서 잔상 표시에 사용
- [ ] `boostGauge` — 드리프트 시 충전, 부스트 시 소모, HUD에 표시
- [ ] `stunTimer` — 벽 충돌 시 설정, 매 프레임 감소, 0 이하일 때 입력 허용
- [ ] `currentCheckpoint` — 체크포인트 통과 시 증가, 랩 판정에 사용
- [ ] `lapTimes[]` — 랩 완료 시 기록, 결과 화면에서 표시
- [ ] `driftCount` — 드리프트 종료 시 +1, 결과 화면 점수 계산에 사용
- [ ] `boostCount` — 부스트 발동 시 +1, 결과 화면 점수 계산에 사용
- [ ] `wallHitCount` — 벽 충돌 시 +1, 클린 랩 판정에 사용
- [ ] `wrongWayTimer` — 역주행 시 증가, 3초 초과 시 리셋 트리거

### 12.4 TweenManager 안전 규칙

- `cancelAll()` 대신 `clearImmediate()` 사용 (즉시 정리)
- `clearImmediate()` 직후 `_pendingCancel = false` + `_tweens.length = 0` 플러시
- 하나의 값에 대한 갱신 경로는 tween OR 직접 대입 중 **하나만** 사용

### 12.5 기획-구현 수치 정합성 검증 테이블

| 기획서 항목 | CONFIG 키 | 기획 값 | 구현 값 | 일치 |
|------------|-----------|---------|---------|------|
| §6.1 최대 속도 | MAX_SPEED | 300 | — | [ ] |
| §6.1 가속도 | ACCELERATION | 180 | — | [ ] |
| §6.1 브레이크 감속 | BRAKE_FORCE | 250 | — | [ ] |
| §6.1 드리프트 임계 | DRIFT_THRESHOLD | 0.7 | — | [ ] |
| §6.1 드리프트 충전 | DRIFT_CHARGE_RATE | 25 | — | [ ] |
| §6.1 부스트 최소 | BOOST_MIN_USE | 50 | — | [ ] |
| §6.1 부스트 속도 | BOOST_SPEED_MULT | 1.6 | — | [ ] |
| §6.1 벽 충돌 속도 | WALL_SPEED_MULT | 0.3 | — | [ ] |
| §6.1 벽 스턴 | WALL_STUN | 0.3 | — | [ ] |
| §8.2 AI 시티 속도 | AI_SPEED_EASY | 0.78 | — | [ ] |
| §8.2 AI 캐니언 속도 | AI_SPEED_MED | 0.85 | — | [ ] |
| §8.2 AI 스타 링 속도 | AI_SPEED_HARD | 0.92 | — | [ ] |
| §8.2 하드 모드 배율 | AI_HARD_MODE_MULT | 1.20 | — | [ ] |
| §9.1 시티 도로 폭 | city.roadWidth | 120 | — | [ ] |
| §9.1 캐니언 도로 폭 | canyon.roadWidth | 90 | — | [ ] |
| §9.1 스타 링 도로 폭 | star.roadWidth | 70 | — | [ ] |

### 12.6 변수명 규칙

| 접두사/접미사 | 용도 | 예시 |
|-------------|------|------|
| `_` 접두사 | 내부 상태 플래그 | `_transitioning`, `_pendingCancel` |
| `Timer` 접미사 | 시간 카운터 (초 단위) | `stunTimer`, `countdownTimer` |
| `Count` 접미사 | 횟수 카운터 | `driftCount`, `boostCount` |
| `is` 접두사 | 불리언 | `isDrifting`, `isBoosting` |
| `current` 접두사 | 현재 추적 인덱스/값 | `currentCheckpoint`, `currentLap` |
| `best` 접두사 | 최고 기록 | `bestLap`, `bestScore` |

### 12.7 TDZ 방지

- 모든 `let`/`const` 변수는 **최초 참조/호출보다 위에** 선언
- 초기화 순서: CONFIG -> 유틸리티 함수 -> 클래스(TweenManager 등) -> 게임 상태 변수 -> 이벤트 리스너 -> 게임 루프 시작

### 12.8 함수 시그니처 변경 시 전파 규칙

함수 시그니처 변경 시:
1. 해당 함수를 호출하는 **모든 위치** 검색 (Ctrl+F)
2. 각 호출부의 인자 순서/타입 업데이트
3. 하위 함수가 변경된 파라미터를 사용하는 경우 하위까지 전파
4. 변경 후 전체 경로 수동 테스트

### 12.9 게임 루프 안전 장치

```javascript
function gameLoop(now) {
  try {
    const dt = Math.min((now - lastTime) / 1000, 0.05); // 50ms 캡
    lastTime = now;
    update(dt);
    render(ctx, dt);
  } catch (e) {
    console.error('[GameLoop Error]', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 12.10 공용 인프라 인터페이스 (copy 기반, 분리 미진행)

본 게임에서 사용할 공용 패턴 (이전 사이클과 동일 인터페이스 유지):
- **TweenManager**: `add({from, to, duration, onUpdate, onComplete})`, `clearImmediate()`, `update(dt)`
- **ObjectPool**: `get()`, `release(obj)`, `forEach(fn)` — 파티클 관리 (최대 100개)
- **TransitionGuard**: `beginTransition(target, opts)` — 가드 플래그 내장
- **SoundManager**: Web Audio API 기반 코드 합성. `play(soundId)`, `setVolume(v)`
- **createGameLoop**: try-catch 내장 + dt 캡 + RAF

---

## §13. 사운드 디자인 (Web Audio API 코드 합성)

| 효과음 ID | 트리거 | 합성 방식 |
|-----------|--------|-----------|
| `engine` | 가속 중 연속 | 저주파 사인파(80Hz) + 속도 비례 피치 변조 |
| `drift` | 드리프트 중 연속 | 화이트 노이즈 + 밴드패스 필터(800Hz) |
| `boost` | 부스트 발동 | 피치 상승 사인파(200->600Hz, 0.3s) |
| `wallHit` | 벽 충돌 | 짧은 노이즈 버스트(0.1s) + 저주파 펄스 |
| `checkpoint` | 체크포인트 통과 | 높은 사인파 2음(C5->E5, 각 0.1s) |
| `lapComplete` | 랩 완주 | 상승 아르페지오(C5->E5->G5, 0.3s) |
| `countdown` | 카운트다운 숫자 | 단일 사인파 비프(440Hz, 0.15s) |
| `raceStart` | GO! 표시 | 높은 비프(880Hz, 0.3s) |
| `result` | 결과 화면 진입 | 랭크별 멜로디 (1위: 승리 팡파레, 4위: 아쉬운 하강) |

---

## §14. UI 레이아웃

### 14.1 인게임 HUD

```
+----------------------------------------------+
| LAP 2/3          00:42.35           RANK: 2  |  <- 상단 바
|                                  +--------+  |
|                                  | MINIMAP|  |  <- 우상단 미니맵 (150x150)
|                                  +--------+  |
|           [게임 뷰 - 탑다운 레이싱]           |
|                                              |
| +----------------------+                     |
| | SPD: 245 km/h        |                     |  <- 좌하단 속도계
| | BOOST ########.. 78% |                     |  <- 부스트 게이지 바
| +----------------------+                     |
|                          [터치 컨트롤 영역]   |  <- 모바일 전용
+----------------------------------------------+
```

### 14.2 타이틀 화면

```
+----------------------------------------------+
|                                              |
|           NEON DRIFT RACER                   |  <- 네온 글로우 타이틀
|                                              |
|              > START RACE                    |
|              > OPTIONS                       |  <- Canvas 텍스트 메뉴
|                                              |
|         Best: City 01:42.35                  |  <- 최고 기록 표시
|                                              |
|        [TAP TO START] (모바일)               |
+----------------------------------------------+
```

### 14.3 트랙 선택 화면

```
+----------------------------------------------+
|            SELECT TRACK                      |
|                                              |
|   +------+    +------+    +------+          |
|   | CITY |    |CANYON|    | STAR |          |
|   |      |    |      |    | LOCK |          |  <- 미언락 트랙은 자물쇠
|   |Best: |    |Best: |    |      |          |
|   |1:42  |    | --   |    |      |          |
|   +------+    +------+    +------+          |
|                                              |
|   <-> 선택    Enter/탭 확인    Esc 뒤로      |
+----------------------------------------------+
```

### 14.4 결과 화면 (Canvas 모달 — confirm/alert 금지)

```
+----------------------------------------------+
|           +---------------------+            |
|           |   RACE RESULT       |            |
|           |                     |            |
|           |  RANK: #1           |            |
|           |  Time: 02:15.42     |            |
|           |  Best Lap: 00:41.23 |            |
|           |  Score: 1580        |            |
|           |  NEW RECORD!        |            |
|           |                     |            |
|           |  [RETRY]  [MENU]   |            |  <- Canvas 버튼
|           +---------------------+            |
+----------------------------------------------+
```

---

## §15. 카메라 시스템

Cycle 11 mini-platformer의 카메라 시스템을 레이싱에 맞게 변형:

- **추적 대상**: 플레이어 차량
- **lerp 보간**: `camera.x += (target.x - camera.x) * CAM_LERP` (부드러운 추적)
- **look-ahead**: 차량 이동 방향으로 `CAM_LOOKAHEAD`(80px) 선행. 진행 방향 시야 확보
- **스크린 셰이크**: 벽 충돌 시 6px / 부스트 시 3px (감쇠형)
- **줌**: 기본 1.0 (속도 비례 줌아웃 0.9~1.0은 v1.1 고려)
- **렌더 좌표 변환**: `ctx.translate(-camera.x + canvas.width/2, -camera.y + canvas.height/2)`

---

## §16. 구현 범위 및 우선순위

### P0 — 반드시 구현 (코어)
- [ ] 차량 물리 (가속/감속/조향/마찰)
- [ ] 드리프트 메카닉 + 부스트 시스템
- [ ] 트랙 3개 (중심선 데이터 + 렌더링)
- [ ] 벽 충돌 판정 + 반응
- [ ] 체크포인트/랩 판정
- [ ] AI 차량 3대 (웨이포인트 추적)
- [ ] 상태 머신 (TITLE->TRACK_SELECT->COUNTDOWN->RACE->RESULT)
- [ ] HUD (랩, 시간, 순위, 속도, 부스트 게이지)
- [ ] 미니맵
- [ ] 결과 화면 + 점수 계산
- [ ] localStorage 기록 저장/로드
- [ ] 트랙 언락 시스템
- [ ] 모바일 터치 조작
- [ ] beginTransition() 통일 전환

### P1 — 구현 권장 (몰입)
- [ ] 드리프트 잔상 + 타이어 자국
- [ ] 부스트 파티클 이펙트
- [ ] 벽 충돌 스파크
- [ ] 카운트다운 애니메이션 (3-2-1-GO!)
- [ ] 효과음 (Web Audio API)
- [ ] 카메라 셰이크
- [ ] 적응형 힌트

### P2 — 선택 (확장)
- [ ] 하드 모드
- [ ] AI 러버밴딩
- [ ] 트랙별 고유 장애물 (바리케이드/모래/운석)
- [ ] NEW RECORD 이펙트
- [ ] 역주행 감지 + 리셋

### 범위 외 (이번 사이클에서 미구현)
- 멀티플레이어
- 차량 커스터마이징
- 트랙 에디터
- 일일 챌린지
- 공용 엔진 모듈 분리 (별도 태스크)
