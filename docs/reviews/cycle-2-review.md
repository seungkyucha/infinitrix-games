---
verdict: NEEDS_MINOR_FIX
game-id: neon-survivors
cycle: 2
reviewer: QA-agent
date: 2026-04-18
review-round: 3

buttons:
  - name: "START (TITLE — 커스텀)"
    keys: [Space, Enter]
    size: "260x56"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: "Scene.transition('DIFF_SELECT') → 난이도 선택"
  - name: "쉬움/보통/어려움 (DIFF_SELECT)"
    keys: [Digit1, Digit2, Digit3]
    size: "260x52"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: "난이도 설정 → PLAY 전환"
  - name: "⏸ (PLAY)"
    keys: [Escape]
    size: "48x48"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: PASS
  - name: "레벨업 카드 1/2/3 (IX.Button)"
    keys: [Digit1, Digit2, Digit3]
    size: "dynamic (max 180xN)"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: "selectUpgrade(idx) → 업그레이드 적용"
  - name: "RESTART (GAMEOVER)"
    keys: [KeyR, Space, Enter]
    size: "280x52"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: PASS
  - name: "TITLE (GAMEOVER)"
    keys: [Escape]
    size: "280x48"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: PASS
  - name: "RESTART (VICTORY)"
    keys: [KeyR, Space, Enter]
    size: "280x52"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: PASS
  - name: "TITLE (VICTORY)"
    keys: [Escape]
    size: "280x48"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: PASS

restart-leak-test:
  cycles: 3
  result: PASS
  details: "3회 연속 GAMEOVER→DIFF_SELECT→PLAY 반복 — score/kills/wave/hp/level/xp 모두 정상 초기화"

asset-consistency:
  art-style: "pixel-art-32bit"
  total-loaded: 32
  total-failed: 0
  inconsistencies:
    - "player-idle-sheet.png: player.png과 불일치 — 단, 게임 코드에서 미사용 (dead asset)"
    - "player-hurt.svg: 벡터 실루엣 — PNG pixel art와 스타일 차이 (피격 시 짧은 시간 표시)"
    - "thumbnail: 에셋 누락"
---

# Cycle 2 리뷰 — 네온 서바이버즈 (neon-survivors)

> **판정: NEEDS_MINOR_FIX**
> 3차 리뷰 (2차 피드백 반영 후 재검토) | 2026-04-18

---

## 이전 피드백 반영 여부 교차 확인

### HIGH 항목

| 항목 | 수정 여부 | 상세 |
|------|----------|------|
| H-NEW-1: `Layout.fontSize` 바인딩 손실 → HUD 미렌더링 → 45초 리셋 | ✅ **수정됨** | line 1103: `const fs = (sz, w2, h2) => Layout.fontSize(sz, w2, h2);` — 화살표 함수 래퍼로 바인딩 유지. HUD 전체 정상 렌더링 확인. 60초+ 플레이 StateGuard 리셋 없음. |
| H-1: GameFlow.init이 커스텀 TITLE 덮어씀 → DIFF_SELECT 도달 불가 | ✅ **수정됨** | line 1471: `GameFlow.init({ title: Scene._states.TITLE, ... })` — 커스텀 TITLE 유지. TITLE→DIFF_SELECT→PLAY 흐름 정상 동작. 네온 그리드/서브타이틀/하이스코어 모두 표시. |
| H-2: 레벨업 카드가 IX.Button 미사용 — 자체 hit-test | ✅ **수정됨** | line 797-818: `showLevelUpChoices()`에서 `new Button({...})` 3개 생성. `upgradeButtons` 배열로 관리, `clearUpgradeButtons()`로 정리. 키보드(Digit1/2/3) + 터치 + 클릭 모두 IX.Button으로 동작. |
| H-3: player-idle-sheet.png이 player.png과 불일치 | ⚠️ **부분 해소** | PNG 자체는 미수정이나, **게임 코드에서 `playerIdleSheet`를 사용하지 않음** (dead asset). `playerHurt`만 사용하며 SVG fallback으로 동작. 시각적 영향 최소 → LOW로 하향. |

### MED 항목

| 항목 | 수정 여부 | 상세 |
|------|----------|------|
| M-1: GAMEOVER 데이터 접근 `GameFlow._config?._gameoverData` | ✅ **수정됨** | line 1351-1354: `let gameoverData = {}; enter: (data) => { gameoverData = data || {}; }` — 모듈 레벨 변수로 정상 저장 |
| M-2: VICTORY `Scene._states.VICTORY._data` 내부 접근 | ✅ **수정됨** | line 1398-1401: `let victoryData = {}; enter: (data) => { victoryData = data || {}; }` — 동일 패턴 적용 |
| M-3: thumbnail 에셋 누락 | ❌ **미수정** | 파일 없음, manifest에도 미등록 |

### LOW 항목

| 항목 | 수정 여부 | 상세 |
|------|----------|------|
| L-1: playerHurt SVG 스타일 차이 | 변화 없음 | 피격 시 짧은 시간만 표시, 게임플레이 영향 미미 |
| L-2: inputDelay 음수 방지 | ✅ **수정됨** | line 1287: `gameState.inputDelay = Math.max(0, gameState.inputDelay - dt / 1000);` |

### 📌 결론: HIGH 항목 3/3 완전 수정 + 1/1 하향(dead asset), MED 2/3 수정

---

## 항목별 검증 결과

### A. IX Engine 준수

| 항목 | 결과 | 비고 |
|------|------|------|
| A-1. IX.GameFlow/Scene/Button 사용 | ✅ PASS | GameFlow.init에 커스텀 TITLE 전달, 레벨업 카드 IX.Button 사용 |
| A-2. Scene.setTimeout/setInterval/on 사용 | ✅ PASS | 모든 타이머가 Scene.setTimeout 사용 |
| A-3. art-style 반영 | ✅ PASS | 배경 #0d1117, 사이안 #00d4ff, 네온 그리드 배선 |

> **판정: PASS**

### B. 버튼 3방식 동작

| 버튼 | 마우스 | 터치 | 키보드 | 44px+ | 판정 |
|------|--------|------|--------|-------|------|
| START (TITLE) | ✅ | ✅ | ✅ Space/Enter | ✅ 260x56 | PASS |
| 난이도 3버튼 (DIFF_SELECT) | ✅ | ✅ | ✅ Digit1/2/3 | ✅ 260x52 | PASS |
| ⏸ (PLAY) | ✅ | ✅ | ✅ Escape | ✅ 48x48 | PASS |
| 레벨업 카드 1/2/3 | ✅ | ✅ | ✅ Digit1/2/3 | ✅ max180xN | **PASS (IX.Button)** |
| RESTART (GAMEOVER) | ✅ | ✅ | ✅ R/Space/Enter | ✅ 280x52 | PASS |
| TITLE (GAMEOVER) | ✅ | ✅ | ✅ Escape | ✅ 280x48 | PASS |
| RESTART (VICTORY) | ✅ | ✅ | ✅ R/Space/Enter | ✅ 280x52 | PASS |
| TITLE (VICTORY) | ✅ | ✅ | ✅ Escape | ✅ 280x48 | PASS |

> **판정: PASS**

### C. 재시작 3회 연속 검증

| 항목 | Cycle 1 | Cycle 2 | Cycle 3 | 판정 |
|------|---------|---------|---------|------|
| score | 1 | 1 | 1 | ✅ |
| kills | 0 | 0 | 0 | ✅ |
| wave | 0 | 0 | 0 | ✅ |
| hp/maxHp | 100/100 | 100/100 | 100/100 | ✅ |
| level/xp | 1/0 | 1/0 | 1/0 | ✅ |

> **판정: PASS**

### D. 스팀 인디 수준 플레이 완성도

| 항목 | 결과 | 비고 |
|------|------|------|
| D-1. 핵심 루프 30초 내 재미 전달 | ✅ PASS | 자동 공격 + 적 웨이브 + 보석 수집 + 콤보 시스템 동작 |
| D-2. 승리/패배 조건 명확 | ✅ PASS | HP 0=게임오버(Score/Kills/Time/Best 표시), 보스 처치=승리(등급 표시) |
| D-3. 점수/진행도 시각 피드백 | ✅ PASS | HUD 전체 정상 렌더링 — HP바, XP바, 웨이브, 타이머, 점수, 킬수, 콤보 |
| D-4. 사운드 이펙트 | ✅ PASS | Web Audio 톤 합성 정상 |
| D-5. 파티클/트윈 연출 | ✅ PASS | 적 사망 파티클, 피격 스파크, 레벨업 이펙트 |

> **판정: PASS**

### E. 스크린 전환 + Stuck 방어

| 항목 | 결과 | 비고 |
|------|------|------|
| E-1. 에셋 로드 10초 타임아웃 | ✅ PASS | `assets.load(assetMap, { timeoutMs: 10000 })` |
| E-2. StateGuard 활성화 | ✅ PASS | `stuckMs: 45000` — 60초+ 플레이에서도 오작동 없음 |
| E-3. TITLE→DIFF_SELECT→PLAY 전환 | ✅ PASS | 커스텀 TITLE 정상 유지, DIFF_SELECT 도달 가능 |
| E-4. PLAY→GAMEOVER 전환 | ✅ PASS | endGame(false) → GameFlow.gameOver(data) 정상 |
| E-5. GAMEOVER→TITLE→DIFF_SELECT→PLAY 재시작 | ✅ PASS | 키보드/터치 모두 정상 |
| E-6. 씬 전환 200ms 입력 무시 | ✅ PASS | `inputDelay = 0.2`, `Math.max(0, ...)` 적용 |

> **판정: PASS**

### F. 입력 시스템

| 항목 | 결과 | 비고 |
|------|------|------|
| F-1. IX.Input 사용 | ✅ PASS | `held()/jp()/tapped/tapX/tapY/touches` 모두 IX.Input |
| F-2. 좌표 변환 엔진 내장 사용 | ✅ PASS | |
| F-3. 가상 조이스틱 | ✅ PASS | 터치 시 동적 생성, 데드존 10px, 힌트 영역 표시 |

> **판정: PASS**

### G. 에셋 일관성

| 항목 | 결과 | 비고 |
|------|------|------|
| G-1. art-style 통일 | ⚠️ PARTIAL | player-idle-sheet.png 불일치이나 게임 코드 미사용. thumbnail 누락. |
| G-2. 캐릭터 변형 일관성 | ⚠️ PARTIAL | playerHurt SVG fallback 사용 (스타일 차이 있으나 기능적 문제 없음) |

> **판정: PARTIAL PASS** (게임플레이 영향 없음)

---

## 브라우저 테스트 결과 (Puppeteer)

| 테스트 | 결과 | 비고 |
|--------|------|------|
| A: 로드 + 타이틀 | ✅ PASS | 에셋 32개 로드 성공, 에러 0. 커스텀 TITLE 정상 (네온 그리드/서브타이틀/하이스코어) |
| B: Space 시작 → DIFF_SELECT → PLAY | ✅ PASS | TITLE→DIFF_SELECT→PLAY 전체 흐름 정상. 난이도 선택(HP 변화) 확인. |
| C: 이동 조작 | ✅ PASS | WASD 이동, 자동 공격, 적 처치, 보석 수집, 콤보 ×1.5 동작 |
| D: 게임오버 + 재시작 3회 | ✅ PASS | 3회 모두 완벽 초기화. GAMEOVER 화면 Score/Kills/Time/Best 정상 |
| D-2: 레벨업 카드 (IX.Button) | ✅ PASS | 3장 IX.Button 생성, 키보드(Digit2) 선택 후 upgradeActive=false 정상 |
| E: 터치 동작 | ✅ PASS | 터치로 START→DIFF_SELECT→PLAY 전체 흐름 완료 (쉬움 HP 150 확인) |

**JavaScript 에러: 0건**

---

## 2차 vs 3차 비교

| 영역 | 2차 리뷰 | 3차 리뷰 | 변화 |
|------|---------|---------|------|
| A. IX Engine 준수 | ⚠️ PARTIAL | ✅ PASS | ⬆ 개선 (레벨업 카드 IX.Button 전환) |
| B. 버튼 3방식 | ❌ FAIL | ✅ PASS | ⬆ 개선 (모든 버튼 IX.Button + 3방식) |
| C. 재시작 3회 | ✅ PASS | ✅ PASS | 동일 |
| D. 플레이 완성도 | ❌ FAIL | ✅ PASS | ⬆ 개선 (HUD 렌더링 정상) |
| E. 스크린 전환 | ⚠️ PARTIAL | ✅ PASS | ⬆ 개선 (DIFF_SELECT 도달 가능) |
| F. 입력 시스템 | ✅ PASS | ✅ PASS | 동일 |
| G. 에셋 일관성 | ❌ FAIL | ⚠️ PARTIAL | ⬆ 부분 개선 (미사용 에셋 확인) |

---

## 잔여 이슈 (MINOR)

### M-3. thumbnail 에셋 누락
- **파일**: `assets/` 디렉토리, `manifest.json`
- **현상**: 게임 대표 이미지(800x600) 없음
- **영향**: 게임 리스트 표시 시 기본 이미지 사용됨. 게임 플레이에는 영향 없음.
- **수정 방법**: 기획서 에셋 요구사항에 따라 thumbnail 생성 후 manifest 등록

### L-3. player-idle-sheet.png 불일치 (dead asset)
- **현상**: player.png과 다른 캐릭터이나, 게임 코드에서 사용하지 않음
- **영향**: 없음 (향후 애니메이션 추가 시 교체 필요)

### L-1. playerHurt SVG 스타일 차이
- **현상**: player-hurt.svg는 벡터 실루엣으로 pixel-art PNG와 스타일 차이
- **영향**: 피격 시 0.5초간만 표시, 게임플레이 영향 미미

---

## 코드 품질 메모

### 긍정적
- 오브젝트 풀링 (bullet 200, enemy 100, gem 300)
- 공간 해싱 64px 그리드 셀 충돌 판정 최적화
- deltaTime 기반 프레임 독립적 로직
- 카메라 시스템 (lerp 0.1 부드러운 추적)
- 콤보 시스템 4단계 배율
- 보스 AI 2페이즈
- IX 엔진 API 전면 사용 (GameFlow/Scene/Button/Input/Sound/Save)
- 씬 전환 200ms 입력 무시 + Math.max 적용
- enter(data) 패턴으로 씬 간 데이터 전달

### 개선 필요 (MINOR — 배포 가능)
1. **[MED]** thumbnail 에셋 생성 및 manifest 등록
2. **[LOW]** player-idle-sheet.png 교체 또는 미사용 확인 후 manifest에서 제거
3. **[LOW]** playerHurt SVG → PNG pixel-art로 교체 (선택)

---

## 최종 판정

> **NEEDS_MINOR_FIX**
>
> | 영역 | 판정 |
> |------|------|
> | A. IX Engine 준수 | ✅ PASS |
> | B. 버튼 3방식 | ✅ PASS |
> | C. 재시작 3회 | ✅ PASS |
> | D. 플레이 완성도 | ✅ PASS |
> | E. 스크린 전환 | ✅ PASS |
> | F. 입력 시스템 | ✅ PASS |
> | G. 에셋 일관성 | ⚠️ PARTIAL |
>
> **이전 HIGH 항목 3/3 완전 수정 + 신규 치명적 버그(H-NEW-1) 수정됨**
> **잔여: thumbnail 누락(MED) + dead asset 정리(LOW)**
>
> 🎮 게임 핵심 루프 완전 동작 — 배포 가능, thumbnail 추가 권장
