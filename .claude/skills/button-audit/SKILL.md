---
name: button-audit
description: 게임 index.html 의 모든 버튼을 스캔해 마우스/터치/키보드 3방식 동작을 실제로 보장하는지 감사. 리뷰어 단계에서 반드시 호출. 버튼 하나라도 키보드 대응 없으면 NEEDS_MAJOR_FIX.
---

# Button 3방식 동작 감사

리뷰어가 게임을 검증할 때 **모든 버튼이 마우스·터치·키보드로 동작하는지** 체계적으로 확인하는 프로토콜.

## 사용 시점

- 리뷰어 단계에서 공통 검증 `📌 B. 버튼 3방식 동작` 수행 시
- 코더가 자체 검토할 때

## 감사 절차

### 1. 버튼 후보 수집

```bash
grep -n "new Button\|new IX.Button\|new .*Button" public/games/<game-id>/index.html
```

자체 hit-test 기반 버튼(`UI.hitTest` + 수동 onclick) 이 남아있으면 **자동 FAIL**. IX.Button 로 교체 지시.

### 2. 각 버튼의 속성 점검

각 `new Button({...})` 호출에 대해:

| 속성 | 필수 | 실패 시 |
|------|------|---------|
| `x, y, w, h` 모두 숫자 | ✅ | 렌더 불가 |
| `w >= 44 && h >= 44` | ✅ | 모바일 터치 타겟 미달 |
| `text` 비어있지 않음 | ✅ | 식별 불가 |
| `key` (문자열 or 배열) | ✅ | 키보드 접근성 실패 |
| `onClick` 함수 | ✅ | 동작 없음 |

### 3. key 값 유효성

키 코드는 아래 중 하나여야 함 (IX.Input 의 GAME_KEYS 와 일치):
`Space, Enter, Escape, ArrowUp/Down/Left/Right, KeyW/A/S/D/P/R/E/Q/X/Z, Digit1~9, ShiftLeft/Right`

`'Tab'`, `'Backspace'` 등은 브라우저 기본동작 때문에 **권장 안 함**.

### 4. onClick 실효성 확인

onClick 콜백이 실제로 state를 바꾸는지 코드 흐름 추적:
- `Scene.transition(...)`, `GameFlow.startPlay()`, `GameFlow.gameOver(...)` 호출
- 또는 명시적인 변수 토글 (예: `paused = !paused`)
- 아무것도 없는 `() => {}` 는 FAIL

### 5. 보고 양식

```
## 버튼 감사 결과

### 발견된 버튼 (N개)
1. TITLE.START — x=480, y=320, w=240, h=64, key=['Space','Enter'], onClick=GameFlow.startPlay
   → mouse: PASS / touch: PASS (64px) / keyboard: PASS
2. GAMEOVER.RESTART — ...
3. PLAY.PAUSE — w=80, h=36 ⚠️ 터치 타겟 44px 미달
   → mouse: PASS / touch: FAIL / keyboard: PASS

### 자체 hit-test 버튼 (레거시 — 교체 필요)
- line 423: if (UI.hitTest(input.tapX, ..., x, y, 100, 40)) startGame();
  → IX.Button으로 교체

### 최종 판정
- 총 N개 중 M개 PASS, K개 FAIL
- 전체 FAIL 수 0개 → APPROVED / 1개 이상 → NEEDS_MAJOR_FIX
```

## 체크리스트 (요약)

- [ ] `grep new Button` 결과 모든 버튼 속성 리스트업
- [ ] key 속성 없는 버튼 0개
- [ ] w/h ≥ 44 미달 버튼 0개
- [ ] 자체 hit-test 잔존 0개
- [ ] onClick 빈 함수 0개
