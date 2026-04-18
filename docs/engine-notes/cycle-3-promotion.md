# Cycle 3 엔진 승격 보고서
_게임: poly-spire (폴리 스파이어) — 덱빌더_
_날짜: 2026-04-18_

---

## 승격

### 1. `MathUtil.shuffle(arr)` → `ix-engine.js`
- **위치**: `MathUtil` 객체에 메서드 추가
- **원본**: `poly-spire/index.html` 내 `shuffle()` 함수
- **내용**: Fisher-Yates in-place 배열 셔플. 입력 배열을 변경하고 같은 참조를 반환.
- **승격 근거**:
  - Cycle 1 로그라이크: 아이템 풀 셔플, 적 배치 셔플
  - Cycle 3 덱빌더: 덱 셔플 (뽑기 더미 소진 → 버리기 더미 셔플)
  - Match3 장르: 보드 초기화 시 셔플
  - 순수 함수, 게임 상태 비의존, MathUtil에 자연스럽게 편입
- **하위 호환**: 새 메서드 추가만. 기존 API 변경 없음.
- **게임 변경**: `shuffle()` → `MathUtil.shuffle()` 위임 래퍼로 교체

### 2. `Button.remove(btn)` / `Button.removeList(list)` → `ix-engine.js`
- **위치**: `Button` 클래스 static 메서드 추가 (기존 `clearAll` 옆)
- **원본**: `poly-spire/index.html` 내 `clearDynamicButtons()` 함수
- **내용**:
  - `Button.remove(btn)`: 단일 버튼을 `_active` 목록에서 제거
  - `Button.removeList(list)`: 버튼 배열을 일괄 제거
- **승격 근거**:
  - poly-spire: 카드/적 타겟 버튼을 턴마다 동적 생성/제거 (`clearDynamicButtons`)
  - 향후 인벤토리, 스킬 슬롯, 레벨업 선택지 등 동적 버튼이 필요한 모든 게임에서 활용
  - 기존에는 `Button._active` 내부 배열을 직접 조작해야 했음 → 캡슐화 위반
  - `clearAll()`은 전체 제거만 가능 → 특정 그룹만 제거하는 API가 없었음
- **하위 호환**: 새 static 메서드 추가만. 기존 `clearAll`/`updateAll`/`renderAll` 변경 없음.
- **게임 변경**: `clearDynamicButtons()` 내부를 `Button.removeList()` 호출로 단순화

### 3. `PopupText` 클래스 → `ix-engine.js` (2차 승격 — 향후 후보에서 승격)

- **위치**: `IX.PopupText` (신규 클래스)
- **내용**: 떠오르며 사라지는 데미지/점수/상태 팝업 텍스트 매니저
- **승격 근거**:
  - Cycle 1 `pixel-depths`: `damagePopups` 배열 + 수동 update/render (~15줄)
  - Cycle 3 `poly-spire`: `damagePopups` 배열 + `addPopup`/`updatePopups`/`renderPopups` (~20줄)
  - 2개 게임에서 거의 동일한 패턴 반복 → 승격 기준 충족
  - 게임 상태 비의존, 독립 클래스, 장르 불문 범용 패턴
- **API**:
  ```javascript
  const popups = new PopupText({ defaultVy: -60, defaultLife: 1.0 });
  popups.add(x, y, text, color, { vy, life });
  popups.update(dt);            // 매 프레임 (dt: 밀리초)
  popups.render(ctx, { fontSize, bold, glow });
  popups.clear();               // 전체 제거
  popups.count;                 // 현재 팝업 수
  ```
- **하위 호환**: 새 클래스 추가만. 기존 API 변경 없음.
- **게임 변경**:
  - `poly-spire`: `damagePopups` 전역 배열 제거 → `new PopupText()` 인스턴스 사용
  - `addPopup()` 래퍼 유지 (게임 내 호출 코드 변경 최소화)
  - `updatePopups(dt)` / `renderPopups(ctx, w, h)` → `popups.update(dt)` / `popups.render(ctx)` 위임

---

## 보류 (이유)

### Layout.isPortrait(w, h)
- 엔진에 이미 존재 (line 673: `return h > w`).
- 게임은 `h > w * 1.1` (10% 마진)을 사용하는데, 이는 게임 특화 임계값이므로 엔진 수정 불필요.

---

## 향후 후보

### 1. DeckManager (장르 모듈: `genres/deckbuilder.js`)
- **내용**: 뽑기/버리기/소멸 더미 관리, 자동 셔플, 드로우 로직, 손패 제한
- **현재 상태**: poly-spire에서 `drawPile`, `discardPile`, `exhaustPile`, `drawCards()` 등으로 구현
- **보류 이유**: 첫 번째 덱빌더 게임. 2개 이상의 카드/덱 게임이 등장하면 장르 모듈로 승격.
- **승격 조건**: 다음 카드 게임 개발 시 패턴 일치 확인 후 즉시 승격

### 2. 턴제 전투 시스템 (장르 모듈: `genres/turnbased.js`)
- **내용**: 턴 진행 (플레이어→디스카드→적턴→다음턴), 적 패턴 시스템, 보스 페이즈 전환
- **보류 이유**: 게임별로 턴 구조가 크게 다를 수 있음. 추상화 수준 확정 불가.
- **승격 조건**: 2번째 턴제 게임에서 공통 패턴 확인 후 검토

### 3. 점수 등급 시스템 (S/A/B/C)
- **내용**: `getGrade(score, thresholds)` → { grade, color }
- **보류 이유**: 등급 임계값과 색상이 게임마다 다름. 인라인 코드와 차이가 미미.

### 4. 전투 이펙트 오버레이 시스템
- **내용**: 에셋 기반 일시적 시각 이펙트 (확대+페이드아웃)
- **보류 이유**: Particles와 역할 중복 가능. 1개 게임에서만 사용.
