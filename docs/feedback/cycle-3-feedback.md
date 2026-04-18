# Cycle 3 피드백 — 폴리 스파이어 (poly-spire)
_작성일: 2026-04-18 | 2차 리뷰_

---

## 1차 지적사항 수정 현황

| 항목 | 상태 |
|------|------|
| HIGH-1: TDZ 에러 | ✅ 수정됨 (L136~141에 변수 선언 이동) |
| HIGH-2: 5개 버튼 key 미지정 | ✅ 수정됨 (전부 key 배열 추가) |
| HIGH-3: 모바일 분기 없음 | ✅ 수정됨 (isMobileView/safeArea/isPortrait 다수 사용) |
| MED-1: manifest thumbnail 누락 | ✅ 수정됨 (manifest.json에 thumbnail 항목 추가 확인) |

---

## 2차 리뷰 신규 지적사항

### 🔴 HIGH-1 (NEW): BATTLE 첫 턴 카드/적 버튼 미생성

- **파일**: `public/games/poly-spire/index.html`
- **위치**: `BATTLE.enter()` (L1100~1133)
- **현상**: `startBattle()` (L1036) → `initBattle()` → `startPlayerTurn()` → `rebuildBattleButtons()` 순서로 카드/적 버튼을 먼저 생성하지만, 직후 `Scene.transition('BATTLE')` 호출 시 Scene cleanup이 기존 버튼을 전부 삭제함. `BATTLE.enter()`에서는 턴 종료 + 포션 버튼만 생성하고 `rebuildBattleButtons()`를 호출하지 않음.
- **영향**: 매 전투 첫 턴에 카드 선택/사용 불가 (클릭·터치·키보드 모두). 플레이어는 반드시 첫 턴을 E키로 넘겨야 함.
- **puppeteer 검증**: BATTLE 진입 직후 `IX.Button._active.length === 1` (턴 종료만). E키로 턴 종료 후 2턴에서 `length === 8` (정상).
- **수정 방법**: `BATTLE.enter()` 함수 끝(L1132 `}` 직전)에 한 줄 추가:
  ```javascript
  rebuildBattleButtons();
  ```
- **기대 결과**: BATTLE 진입 즉시 `IX.Button._active.length >= 7` (턴종료 + 카드5 + 적1~2)

---

### ~~🟡 MED-1: manifest.json에 thumbnail 미등록~~ → ✅ 수정 확인됨

manifest.json에 thumbnail 항목이 정상 등록되어 있음 (2차 리뷰에서 확인).

---

### 🟢 LOW-1 (NEW): 모바일 세로 화면에서 일부 UI 잘림

- **파일**: `public/games/poly-spire/index.html`
- **현상**: 390×844 뷰포트에서 TITLE "게임 시작" 버튼, BATTLE "턴 종료" 버튼이 우측으로 약간 잘림. 적 캐릭터가 세로 화면에서 보이지 않을 수 있음.
- **수정 제안**: 버튼 x 좌표를 safe area 너비 기준으로 계산. 적 위치를 portrait 모드에서 상단에 더 크게 배치.

---

## 재리뷰(3차) 시 확인 항목

1. [ ] HIGH-1: BATTLE 진입 직후 `IX.Button._active.length >= 7` 확인 (puppeteer)
2. [ ] HIGH-1: 첫 턴에 Digit1 → Digit6 키 입력으로 카드 사용 가능 확인
3. [ ] MED-1: manifest.json에 thumbnail 항목 존재 확인
4. [ ] LOW-1: 모바일 390×844에서 버튼 잘림 없는지 확인 (optional)
