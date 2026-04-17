---
name: restart-verify
description: 게임의 GAMEOVER → RESTART 사이클을 3회 반복 시뮬레이션하여 전역 변수·배열·타이머 누수가 없는지 검증. 리뷰어가 📌 C 항목 감사 시 사용. onReset 누락 변수가 하나라도 있으면 NEEDS_MAJOR_FIX.
---

# 재시작 누수 검증

"처음부터 끝까지 플레이 가능 + 재시작도 문제 없음" 을 보장하려면 onReset 이 **모든** 전역 상태를 초기화해야 한다. 이 스킬은 그 완전성을 감사한다.

## 사용 시점

- 리뷰어 단계의 `📌 C. 재시작 3회 연속 검증`
- 코더가 onReset 작성 후 자체 검증

## 절차

### 1. 전역 상태 수집

```bash
# <script> 본문에서 let/var/const 로 선언된 변경 가능 상태 식별
grep -nE "^\s*(let|var)\s+\w+|^\s*const\s+\w+\s*=\s*\[\]|^\s*const\s+\w+\s*=\s*\{\}|^\s*const\s+\w+\s*=\s*new Map|^\s*const\s+\w+\s*=\s*new Set" public/games/<game-id>/index.html
```

- `let` / `var` → 재할당 가능 → 반드시 초기값 복귀 필요
- `const` 로 선언된 배열/객체/Map/Set → `.length = 0` 또는 `.clear()` 필요

상수(숫자, 문자열, 설정값)는 제외. **게임 중 변경되는 상태만** 관심 대상.

### 2. 의도 분류

각 변수에 대해 3가지 중 하나:

| 분류 | 처리 |
|------|------|
| **게임 상태** (score, lives, level, wave, combo 등) | onReset 에서 초기값으로 재할당 필수 |
| **컬렉션** (entities, projectiles, particles 등) | onReset 에서 `.length = 0` (또는 `.clear()`) |
| **세션 불변** (difficulty, selectedChar 등) | onReset 제외 OK (의도적으로 유지) |

### 3. onReset 완전성 검증

```bash
# onReset 본문 추출 (함수 시그니처 기준)
grep -nA 50 "function resetGameState\|onReset:\s*(" public/games/<game-id>/index.html
```

1단계에서 수집한 변수가 **모두** onReset 에 나타나는지 대조. 빠진 변수 = 누수 위험.

### 4. Scene 리소스 검증

다음 패턴 **발견 시 자동 FAIL** (Scene 스코프 밖의 리소스):

```bash
grep -nE "window\.setTimeout|window\.setInterval|document\.addEventListener|window\.addEventListener" public/games/<game-id>/index.html
```

허용: `Scene.setTimeout / Scene.setInterval / Scene.on(target, ...)`.
단, Engine 내부 리스너(canvas 마우스/터치, window resize)는 Engine 생성자에서 한 번만 등록되므로 예외.

### 5. 3회 시뮬레이션 (논리적 추적)

코드 흐름을 따라가며:

1. **1회차**: `GameFlow.startPlay()` → PLAY enter → 게임 로직 → `GameFlow.gameOver({...})` → GAMEOVER enter
   - Scene.cleanup 호출 → timer/listener/button/tween/particle 정리 확인
2. **2회차**: RESTART 버튼 클릭 → `onReset()` → `Scene.transition('PLAY')` → PLAY enter
   - 이 시점에서 모든 게임 변수 = 초기값이어야 함
3. **3회차**: 다시 gameOver → onReset → PLAY
   - 여전히 누수 0

### 6. 보고 양식

```
## 재시작 감사 결과

### 1단계: 전역 상태 수집 (N개)
- let score, lives, level, wave, combo
- const entities = [], projectiles = [], particles = []
- let paused = false

### 2단계: onReset 커버리지
- score → ✅ (=0)
- lives → ✅ (=3)
- level → ❌ 누락
- wave → ❌ 누락
- combo → ✅ (=0)
- entities → ✅ (.length = 0)
- projectiles → ❌ 누락
- particles → Engine 자동 정리
- paused → ✅ (=false)

### 3단계: Scene 리소스
- Scene 스코프 외 setTimeout: 0개 ✓
- 직접 addEventListener: 1개 ✗ (line 423: window.addEventListener('resize', ...))

### 최종 판정
- 누락 변수 3개 / 누수 리스너 1개
- → NEEDS_MAJOR_FIX
- 수정 지시: level, wave, projectiles 초기화 추가 / resize 를 Engine 내장으로 대체
```

## 체크리스트

- [ ] 전역 상태 변수 전체 수집
- [ ] onReset 커버리지 1:1 대조
- [ ] 컬렉션은 `.length = 0` / `.clear()` 사용 확인
- [ ] Scene.setTimeout/setInterval/on 외 직접 리스너 0개
- [ ] 3회 시뮬레이션 논리 추적
