# Cycle 2 피드백 — 네온 서바이버즈 (neon-survivors)

_작성일: 2026-04-18 | 3차 리뷰 갱신_

---

## 지적사항 요약

### HIGH (반드시 수정 — 배포 차단)

> ✅ **모든 HIGH 항목 수정 완료** (3차 리뷰에서 확인)

#### ~~H-NEW-1. Layout.fontSize 바인딩 손실~~ → ✅ 수정됨
- line 1103: `const fs = (sz, w2, h2) => Layout.fontSize(sz, w2, h2);`
- HUD 전체 정상 렌더링, 60초+ 플레이 StateGuard 리셋 없음

#### ~~H-1. GameFlow.init이 커스텀 TITLE 덮어씀~~ → ✅ 수정됨
- line 1471: `GameFlow.init({ title: Scene._states.TITLE, ... })`
- TITLE → DIFF_SELECT → PLAY 흐름 정상 동작

#### ~~H-2. 레벨업 카드가 IX.Button 미사용~~ → ✅ 수정됨
- line 797-818: `new Button({...})` 3개 생성, `upgradeButtons` 배열 관리
- 키보드(Digit1/2/3) + 터치 + 클릭 모두 IX.Button으로 동작

#### ~~H-3. 에셋 불일치~~ → ⚠️ 하향 (LOW)
- player-idle-sheet.png 불일치이나 **게임 코드에서 미사용** (dead asset)
- playerHurt는 SVG fallback으로 동작 (기능적 문제 없음)

### MED (수정 권장)

#### M-3. [미수정] thumbnail 에셋 누락
- **파일**: `assets/` 디렉토리, `manifest.json`
- **현상**: 게임 대표 이미지(800x600) 없음
- **수정 방법**: 기획서 에셋 요구사항에 따라 thumbnail 생성 및 manifest 등록
- **우선순위**: 배포 전 추가 권장

#### ~~M-1. GAMEOVER 데이터 접근~~ → ✅ 수정됨
#### ~~M-2. VICTORY 내부 접근~~ → ✅ 수정됨

### LOW (선택)

#### L-3. player-idle-sheet.png 불일치 (dead asset)
- 게임 코드 미사용. 향후 애니메이션 추가 시 교체 필요

#### L-1. playerHurt SVG 스타일 차이
- 피격 시 0.5초간만 표시, 영향 미미

#### ~~L-2. inputDelay 음수 방지~~ → ✅ 수정됨

---

## 수정 우선순위

| 순위 | 항목 | 상태 | 비고 |
|------|------|------|------|
| ~~1~~ | ~~H-NEW-1: Layout.fontSize 바인딩~~ | ✅ 수정됨 | |
| ~~2~~ | ~~H-1: GameFlow.init 커스텀 TITLE~~ | ✅ 수정됨 | |
| ~~3~~ | ~~H-2: 레벨업 카드 IX.Button~~ | ✅ 수정됨 | |
| ~~4~~ | ~~H-3: 에셋 불일치~~ | ⚠️ 하향(LOW) | dead asset |
| ~~5~~ | ~~M-1/M-2: 데이터 전달 패턴~~ | ✅ 수정됨 | |
| 6 | M-3: thumbnail | ❌ 미수정 | 배포 전 추가 권장 |
| ~~7~~ | ~~L-2: inputDelay~~ | ✅ 수정됨 | |

---

## 재리뷰 시 확인 항목

- [x] H-NEW-1: HUD 텍스트(HP/웨이브/점수/킬/콤보/타이머)가 PLAY 중 정상 표시되는가?
- [x] H-NEW-1: 45초 이상 플레이해도 StateGuard가 리셋하지 않는가?
- [x] H-1: TITLE → DIFF_SELECT → PLAY 씬 흐름이 정상 동작하는가?
- [x] H-1: 커스텀 TITLE 화면 (네온 그리드, 서브타이틀, 하이스코어) 표시되는가?
- [x] H-2: 레벨업 카드가 IX.Button으로 생성되는가?
- [x] H-2: 레벨업 카드가 마우스 클릭 / 터치 탭 / 키보드(1/2/3) 모두 동작하는가?
- [x] H-3: player-idle-sheet.png이 게임 코드에서 미사용 확인
- [x] M-1: GAMEOVER 데이터가 enter(data) 파라미터로 전달되는가?
- [x] M-2: VICTORY 내부 `_data` 접근 제거 여부
- [ ] M-3: thumbnail 에셋 존재 여부 → **미수정**
