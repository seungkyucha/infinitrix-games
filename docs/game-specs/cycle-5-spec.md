---
game-id: beat-crafter
title: 비트 크래프터
genre: puzzle, casual
difficulty: medium
---

# 비트 크래프터 (Beat Crafter) — 상세 기획서

> **Cycle:** 5
> **작성일:** 2026-03-20
> **기획:** Claude (Game Designer)
> **근거:** `docs/analytics/cycle-5-report.md` 분석 보고서 기반 — 1순위 추천 채택

---

## 0. 이전 사이클 피드백 반영

> Cycle 4 "네온 대시 러너" 포스트모템에서 지적된 문제점과 다음 사이클 제안을 **명시적으로** 반영합니다.

### 0-1. Cycle 4 문제 해결 매핑

| Cycle 4 문제 / 제안 | 심각도 | Cycle 5 반영 방법 |
|---------------------|--------|-------------------|
| **[B1] TweenManager cancelAll+add 경쟁 조건** — deferred `_pendingCancel`이 신규 tween까지 삭제하여 게임 시작 불가 | CRITICAL | → **§10.2 TweenManager `clearImmediate()` API 분리**. `cancelAll()`은 deferred 유지, `clearImmediate()`는 즉시 `_tweens.length = 0` + `_pendingCancel = false` 실행. `resetGame()`에서는 `clearImmediate()`만 호출 |
| **[B2] SVG 에셋 재발 (3사이클 연속)** — 기획서 금지 명시로는 해결 불가 | MAJOR | → **§4.5 금지 목록 + §13.5 자동 검증 스크립트** 명시. 100% Canvas 드로잉 + grep 자동 검증 실행 규칙 확정. 퍼즐 게임은 기하학 도형 중심으로 SVG 필요성 자체가 없음 |
| **코인 콤보 보너스 미구현** — §7.1의 연속 코인 5개→+20점 메커니즘 누락 | MINOR | → 퍼즐 게임 특성상 **연쇄 클리어(체인) 보너스가 핵심 메커니즘**으로 격상. §7.1에 체인 배율 공식을 명확히 정의하고 변수 사용처까지 명시 |
| **타이틀 글로우 tween 비복구** — GAMEOVER→TITLE 복귀 시 pulseTitle() 미재호출 | MINOR | → **상태 진입 함수(enterState) 패턴** 도입. 각 상태 진입 시 해당 상태의 tween 초기화를 일원화하여 누락 방지 |
| TweenManager `clearImmediate()` API 분리 | 제안 | → **§10.2에서 구현** — cancelAll(deferred) vs clearImmediate(즉시) 이원화 |
| 에셋 자동 검증 스크립트 실제 도입 | 제안 | → **§13.5에서 grep 명령어 + 기대 결과 명시** |
| 리듬/음악 장르 도전 | 제안 | → **Beat Crafter (비트 크래프터) 리듬 퍼즐** 선택. 그리드 퍼즐 + Web Audio 절차적 음악 생성 융합 |

### 0-2. platform-wisdom.md 검증된 패턴 계승

| 성공 패턴 | 적용 |
|-----------|------|
| 단일 HTML + Canvas + Vanilla JS | 동일 아키텍처 유지 |
| 게임 상태 머신 | LOADING → TITLE → PLAYING → PAUSE → CONFIRM_MODAL → GAMEOVER (6상태) |
| DPR 대응 (Canvas 내부 해상도 ≠ CSS) | 동일 적용 |
| localStorage try-catch | 동일 적용 (iframe sandbox 대응) |
| TweenManager + ObjectPool 재사용 | **clearImmediate() 추가 개선 버전** 채택 (이징 5종 완전 구현) |
| 기획서에 HEX/수식 명시 | 모든 수치/공식/색상 코드 명시 (구현 충실도 목표 95%) |
| Canvas 기반 모달 (confirm/alert 금지) | 모든 확인 UI를 Canvas 모달로 구현 |
| TransitionGuard 패턴 | STATE_PRIORITY 맵 + beginTransition() 헬퍼 그대로 계승 |
| Web Audio API 절차적 사운드 | **핵심 게임플레이 메커니즘으로 격상** — 블록 배치·클리어 시 해당 음계 화음 연주 |
| destroy() 패턴 표준화 | registeredListeners + listen() + destroy() 그대로 계승 |
| 상태×시스템 매트릭스 | §8에서 기획서 정의 + 코드 주석 이중 포함 |
| setTimeout 완전 금지 | 모든 지연 전환은 tween onComplete. AudioContext.currentTime 기반 타이밍 |
| 판정 먼저, 저장 나중에 | §7 점수 시스템에서 순서 고정 |
| 유령 변수 방지 체크리스트 | §13.4에서 모든 변수의 갱신/사용처 명시 |
| 상태 진입 함수(enterState) | **신규** — Cycle 4 타이틀 글로우 미복구 문제 해결 |

### 0-3. 누적 기술 개선 반영

| 미해결 항목 | 출처 | Cycle 5 대응 |
|------------|------|-------------|
| TweenManager cancelAll+add 경쟁 조건 | Cycle 4 B1 CRITICAL | → `clearImmediate()` API 분리 (§10.2) |
| SVG 에셋 재발 (3사이클 연속) | Cycle 2~4 반복 | → 자동 grep 검증 스크립트 (§13.5) |
| 상태 진입 시 tween 초기화 누락 | Cycle 4 타이틀 글로우 | → `enterState()` 패턴 도입 (§10.1) |

---

## 1. 게임 개요 및 핵심 재미 요소

### 컨셉
떨어지는 **음표 블록**을 **4×4 그리드**에 배치하여 같은 음 3개를 가로/세로로 정렬하면 **화음이 발생하며 줄이 클리어**되는 리듬 퍼즐 게임입니다. 테트리스의 블록 배치 전략과 매치3의 정렬 쾌감에 **절차적 음악 생성**을 결합하여, "퍼즐을 풀면 음악이 만들어진다"는 유니크한 경험을 제공합니다. 5종 음계(도·레·미·파·솔) 블록이 각각 고유한 색상과 소리를 가지며, 클리어할 때마다 Web Audio API로 해당 음계의 화음이 연주됩니다. 레벨이 오르면 BPM이 상승하고 블록 낙하 속도가 빨라지면서 긴장감을 높입니다.

### 핵심 재미 요소
1. **"퍼즐 = 작곡"** — 자신의 블록 배치가 화음과 멜로디를 만들어내는 쾌감. 매 게임이 다른 곡을 만든다
2. **시각+청각 동시 보상** — 줄 클리어 시 네온 폭발 이펙트 + 화음 연주가 동시에 터져 감각적 만족감 극대화
3. **연쇄 클리어(체인)의 쾌감** — 한 번의 배치로 여러 줄이 연쇄 클리어되면 화음이 겹겹이 쌓이며 점수 폭발
4. **점진적 긴장감** — BPM 상승에 따른 낙하 속도 증가로 "이번엔 더 버텨보자"는 생존 긴장감
5. **그리드 퍼즐의 전략적 깊이** — C1 컬러 머지에서 검증된 "합치면 진화"류 쾌감. 어디에 어떤 음을 놓을지 판단

### 장르 다양화 기여
- **플랫폼 최초의 음악 기반 게임** — 기존 4개 게임(퍼즐/슈팅/전략/러너)과 완전히 다른 경험
- **puzzle + casual 듀얼 태그** — arcade 편중 탈피 (기존 arcade 2개, puzzle은 C1 이후 2번째)
- Cycle 1 컬러 머지의 **그리드 기반 구조를 재활용**하면서 음악 메커니즘으로 차별화
- Web Audio API를 핵심 게임플레이로 사용하는 첫 사례 (Cycle 3~4는 효과음 용도)

---

## 2. 게임 규칙 및 목표

### 2.1 기본 규칙
- **4열 × 8행 그리드** 하단에서부터 블록이 쌓인다
- 상단에서 **음표 블록 1개**가 떨어지며, 플레이어가 좌우 이동 + 빠른 낙하로 위치를 결정
- 블록이 그리드에 착지하면 **매치 판정** 실행
- **같은 음표 3개 이상**이 가로 또는 세로로 연속 정렬 → **클리어** (해당 블록 소멸 + 화음 연주)
- 클리어 후 **중력 적용** — 위 블록이 아래로 떨어짐 → 연쇄 매치 가능 (체인)
- **그리드 최상단(8행)까지 블록이 쌓이면 게임 오버**
- 목표: **최고 점수 달성** (체인 보너스 + 레벨 보너스)

### 2.2 그리드 시스템

```
그리드 크기: 4열(col) × 8행(row)
셀 크기: 48 × 48px
그리드 전체: 192 × 384px

그리드 좌상단 좌표:
  gridX = (canvasWidth - 192) / 2 = (480 - 192) / 2 = 144px
  gridY = (canvasHeight - 384) / 2 + 24 = 12px  (상단 HUD 24px 여백)

셀(col, row)의 화면 좌표:
  x = gridX + col × 48
  y = gridY + (7 - row) × 48   // row 0이 바닥
```

- 내부 데이터: `grid[col][row]` = `null` 또는 `{ note: 0~4, merging: false }`
- row 0 = 바닥, row 7 = 최상단 (오버플로우 영역)
- 블록 존재 검사: `grid[col][row] !== null`

### 2.3 블록 유형 (5종 음계)

| 인덱스 | 음계 | 표기 | 주파수(Hz) | 색상 (HEX) | 시각 형태 |
|--------|------|------|-----------|------------|-----------|
| 0 | **도 (C4)** | C | 261.6 | `#FF1744` 레드 | 원 |
| 1 | **레 (D4)** | D | 293.7 | `#2979FF` 블루 | 다이아몬드 |
| 2 | **미 (E4)** | E | 329.6 | `#00E676` 그린 | 삼각형 |
| 3 | **파 (F4)** | F | `#FFAB00` 앰버 | 348.8 | 사각형 |
| 4 | **솔 (G4)** | G | 392.0 | `#D500F9` 퍼플 | 별 (5각) |

> **수정:** 인덱스 3 주파수 348.8Hz, 색상 `#FFAB00`

- 블록 크기: 44×44px (셀 48px 내 양쪽 2px 여백)
- 각 음계는 **고유 도형**으로 색각이상 사용자도 구분 가능 (접근성)
- 현재 블록 + 다음 블록 1개 미리보기

### 2.4 매치 & 클리어 시스템

```
매치 판정 (블록 착지 직후):
  1. 모든 행(가로)에서 연속 같은 음표 3개 이상 검사
  2. 모든 열(세로)에서 연속 같은 음표 3개 이상 검사
  3. 매치된 셀 표시: matched[][] = true
  4. 매치 존재 시:
     a. 매치된 블록에 클리어 이펙트 (tween: 스케일 1.2→0, 300ms, easeOutQuad)
     b. Web Audio로 매치된 음계의 화음 연주
     c. 300ms 후 매치된 블록 제거
     d. 중력 적용 (위 블록 낙하, tween: y 이동 200ms, easeOutQuad)
     e. 낙하 완료 후 → 다시 매치 판정 (1번으로, 체인 카운트 +1)
  5. 더 이상 매치 없으면 → 다음 블록 생성

체인(연쇄):
  - 1회 매치: 체인 0 (기본)
  - 클리어 → 중력 → 재매치: 체인 1
  - 연속 가능: 체인 2, 3, ... (이론상 무한)
  - 체인 수에 따라 화음이 겹겹이 쌓여 풍성해짐 (§10.5 참조)
```

> **⚠️ Cycle 3 교훈:** 매치 판정 → 클리어 → 중력 → 재판정 과정에서 **가드 플래그(`isClearing = true`)로 새 블록 생성을 차단**. 체인 완료 시에만 `isClearing = false`로 해제하고 다음 블록 스폰.

### 2.5 블록 낙하 시스템

```
낙하 블록 상태:
  - fallingBlock = { note: 0~4, col: 1, row: 7, dropTimer: 0 }
  - 자동 낙하 간격: dropInterval = max(200, 1000 - level × 80) ms
  - 소프트 드롭 (↓ 키): dropInterval × 0.15 (약 6.67배 속도)
  - 하드 드롭 (Space): 즉시 최하단 착지

낙하 위치 결정:
  - 블록은 col 위치에서 수직 낙하
  - 착지 row = 해당 col에서 가장 높은 블록 위 (또는 row 0)
  - 착지 예측선: 고스트 블록 (30% alpha)으로 착지 위치 표시
```

---

## 3. 조작 방법

### 3.1 키보드 (PC 기본)

| 키 | 동작 |
|----|------|
| **←** / **A** | 블록 좌측 이동 |
| **→** / **D** | 블록 우측 이동 |
| **↓** / **S** | 소프트 드롭 (빠른 낙하) |
| **Space** | 하드 드롭 (즉시 착지) |
| **P** / **ESC** | 일시정지 토글 |
| **R** | 게임오버 시 재시작 (Canvas 모달 확인) |
| **Enter** | 타이틀 화면에서 게임 시작 |

- 좌우 이동: 첫 입력 즉시 + 200ms 후 100ms 간격 반복 (DAS: Delayed Auto Shift)
- DAS는 `keyDown` 상태 추적으로 구현 (setTimeout 사용 금지, dt 누적 방식)

### 3.2 마우스 (PC 보조)

| 조작 | 동작 |
|------|------|
| **그리드 열 클릭** | 해당 열로 블록 이동 + 하드 드롭 |
| **일시정지 버튼 (우상단)** | 일시정지 토글 |

### 3.3 터치 (모바일)

| 조작 | 동작 |
|------|------|
| **좌/우 스와이프** | 블록 좌/우 이동 |
| **하향 스와이프** | 하드 드롭 |
| **그리드 열 탭** | 해당 열로 블록 이동 + 하드 드롭 |
| **일시정지 버튼 (우상단)** | 일시정지 토글 |

> **입력 모드 자동 감지**: 첫 입력(키보드/마우스/터치)에 따라 모드 자동 설정. 이후 입력 변경 시 즉시 전환.
>
> **⚠️ Cycle 2~4 교훈**: 입력 모드 변수(`inputMode`)의 사용처를 §5.3에 명확히 명시하여 유령 코드 방지.

---

## 4. 시각적 스타일 가이드

### 4.1 색상 팔레트 — 네온 뮤직 팔레트

| 용도 | HEX | 설명 |
|------|-----|------|
| **배경** | `#0A0A14` | 깊은 다크 블루블랙 |
| **배경 그라데이션 하단** | `#0F0A1E` | 은은한 보라빛 |
| **그리드 배경** | `#12122A` | 그리드 영역 (배경보다 살짝 밝음) |
| **그리드 셀 테두리** | `#2A2A5E` (20% alpha) | 은은한 격자선 |
| **도(C) 블록** | `#FF1744` | 레드 네온 |
| **레(D) 블록** | `#2979FF` | 블루 네온 |
| **미(E) 블록** | `#00E676` | 그린 네온 |
| **파(F) 블록** | `#FFAB00` | 앰버 네온 |
| **솔(G) 블록** | `#D500F9` | 퍼플 네온 |
| **클리어 이펙트** | 블록 색상 → `#FFFFFF` | 해당 색상 폭발 → 백색 플래시 |
| **체인 텍스트** | `#00E5FF` | 시안 ("Chain ×2!") |
| **점수 텍스트** | `#E0E0E0` | 밝은 회색 |
| **레벨 텍스트** | `#FFD740` | 골드 |
| **게임오버 경고** | `#FF1744` (20% alpha) | 상단 2행 적색 비네트 |
| **고스트 블록** | 블록 색상 (30% alpha) | 착지 예측 |
| **다음 블록 배경** | `#1A1A3E` | 미리보기 영역 |
| **비트 반응 배경** | 마지막 클리어 블록 색상 | 클리어 시 배경 펄스 |
| **부유 파티클** | 5종 블록 색상 랜덤 | 비트에 맞춰 발생 |
| **BPM 표시** | `#D500F9` | 퍼플 |

### 4.2 배경 (비트 반응형)

| 레이어 | 내용 | 비트 반응 |
|--------|------|-----------|
| **베이스 배경** | 위→아래 그라데이션 (`#0A0A14` → `#0F0A1E`) | 클리어 시 밝기 펄스 |
| **격자 그리드** | 가로/세로 48px 간격 직선 (`#2A2A5E`, 20% alpha) | BPM에 맞춰 밝기 미세 진동 |
| **음표 파티클** | ♪ 형태 소형 파티클 6~10개, 느린 상승 | 체인 시 밀도 증가 |

- **Canvas 기본 크기:** `480 × 360px` (4:3 비율)
- 게임 영역: 중앙 그리드(192×384px) + 양옆 사이드 (HUD, 미리보기)
- 격자 그리드는 offscreen canvas 캐시 → 비트 반응은 globalAlpha 조절만으로 처리

### 4.3 오브젝트 형태 (순수 Canvas 드로잉 — SVG/외부 이미지 완전 미사용)

| 오브젝트 | 드로잉 방식 |
|----------|------------|
| **도(C) 블록** | `arc()` 원형, 20px 반지름, 레드 fill + 밝은 테두리 2px + 내부 "C" 텍스트 |
| **레(D) 블록** | 45° 회전 사각형(다이아몬드), 30×30px, 블루 fill + 테두리 + "D" |
| **미(E) 블록** | `moveTo/lineTo` 삼각형, 밑변 32px, 그린 fill + 테두리 + "E" |
| **파(F) 블록** | `fillRect` 사각형, 30×30px, 앰버 fill + 테두리 + "F" |
| **솔(G) 블록** | 5각 별 (`moveTo/lineTo` 10꼭짓점), 퍼플 fill + 테두리 + "G" |
| **고스트 블록** | 해당 블록과 동일 형태, 30% alpha, 점선 테두리 |
| **그리드 셀** | `strokeRect` 48×48px, `#2A2A5E` 20% alpha |
| **클리어 이펙트** | 블록 색상 원 확장(0→60px, 300ms) + 파티클 8개 방사 |
| **체인 이펙트** | 화면 중앙 "Chain ×N!" tween scaleUp(1.5→1.0, easeOutBack, 300ms) |
| **착지 이펙트** | 블록 색상 수평 웨이브 (그리드 너비, 150ms fadeOut) |
| **레벨업 이펙트** | 화면 전체 백색 플래시 (alpha 0.3→0, 400ms) + "Level Up!" 텍스트 |
| **그리드 경계** | 2px 실선 (`#4A4A8E`), 둥근 모서리 4px |
| **다음 블록 미리보기** | 60×60px 영역, 블록 중앙 배치, 배경 `#1A1A3E` |
| **음표 파티클** | ♪ 형태 — `arc`(머리) + `lineTo`(꼬리), 10~14px, 블록 색상 랜덤 |

### 4.4 폰트
- **시스템 폰트 스택만 사용** (외부 CDN 의존 0개):
  ```
  'Segoe UI', system-ui, -apple-system, sans-serif
  ```
- 블록 내 음계 글자: `14px bold`
- 체인 텍스트: `28px bold`
- 점수: `18px bold`
- 레벨: `14px bold`
- HUD 보조 텍스트: `12px`
- 타이틀: `36px bold`
- BPM: `11px`

### 4.5 금지 목록 (에셋 자동 검증 대상)
- ❌ SVG 파일 / SVG 필터 (`feGaussianBlur`, `<filter>`)
- ❌ 외부 이미지 파일 (`.png`, `.jpg`, `.svg`, `.gif`)
- ❌ 외부 폰트 / Google Fonts / CDN
- ❌ 외부 음악/사운드 파일 (`.mp3`, `.ogg`, `.wav`)
- ❌ `setTimeout` / `setInterval` (게임 로직 — 모든 타이밍은 dt 누적 또는 tween)
- ❌ `confirm()` / `alert()` / `prompt()`
- ❌ `eval()`
- ❌ ASSET_MAP / SPRITES / preloadAssets (미사용 에셋 잔존 방지)

---

## 5. 핵심 게임 루프 (초당 프레임 기준 로직 흐름)

### 5.1 메인 루프 (`requestAnimationFrame`)

```
function loop(timestamp) {
  const dt = min((timestamp - lastTime) / 1000, 0.05);  // 최대 50ms 캡
  lastTime = timestamp;

  switch (state) {
    case LOADING:       updateLoading();                                          break;
    case TITLE:         tw.update(dt); updateTitleBG(dt); renderTitle();          break;
    case PLAYING:       updateGame(dt); tw.update(dt); renderGame();              break;
    case PAUSE:         tw.update(dt); renderGame(); renderPause();               break;
    case CONFIRM_MODAL: tw.update(dt); renderGame(); renderModal();               break;
    case GAMEOVER:      tw.update(dt); renderGame(); renderGameover();            break;
  }

  rafId = requestAnimationFrame(loop);
}
```

### 5.2 updateGame(dt) 상세 흐름

```
1. if (isClearing) → 클리어/체인 애니메이션 중이면 블록 입력 무시, return early
   (단, tween은 메인 루프에서 항상 update)

2. DropManager.update(dt)
   → dropTimer += dt × 1000
   → dropTimer >= dropInterval → 블록 1행 아래로 이동
   → 소프트 드롭 중이면 dropInterval × 0.15 적용
   → 착지 판정: 아래칸이 차있거나 바닥(row 0)이면 착지

3. InputHandler.process()
   → 좌우 입력: fallingBlock.col 변경 (범위 0~3 클램프)
   → DAS: keyDownTime += dt, 초과 시 자동 반복
   → 하드 드롭: 즉시 착지 위치로 이동 + 착지
   → 마우스/터치: 열 클릭 → col 이동 + 하드 드롭

4. 착지 시 → placeBlock()
   a. grid[col][landRow] = { note: fallingBlock.note }
   b. 착지 이펙트 (tween)
   c. 착지 사운드 (Web Audio: 해당 음계 짧은 톤, 50ms)
   d. → checkMatches()

5. checkMatches()
   a. 가로/세로 매치 탐색 → matched[][] 표시
   b. 매치 없으면: isClearing = false, spawnNextBlock()
   c. 매치 있으면:
      i.   isClearing = true
      ii.  chainCount++
      iii. 매치된 블록 클리어 이펙트 tween (300ms, easeOutQuad)
      iv.  Web Audio 화음 연주 (매치된 음계들)
      v.   점수 계산: baseScore × chainMultiplier × levelMultiplier
      vi.  tween onComplete → removeMatched() → applyGravity()

6. applyGravity()
   → 빈칸 위의 블록을 아래로 이동 (tween: 200ms, easeOutQuad)
   → tween onComplete → checkMatches() (연쇄)

7. BeatPulse.update(dt)
   → 배경 밝기 감쇠 (clearFlash -= dt × 3)
   → 음표 파티클 업데이트
   → BPM 기반 미세 진동 (그리드 셀 alpha)

8. GameOverCheck
   → 새 블록 생성 시 착지 위치가 row 7 이상이면
   → && !transitioning → beginTransition(GAMEOVER)
```

### 5.3 입력 모드별 분기 (유령 코드 방지 — 사용처 명시)

```
변수: inputMode = 'keyboard' | 'mouse' | 'touch'

사용처 1: renderGrid() — 조작 가이드 표시
  keyboard → 그리드 아래에 ← → ↓ Space 키 아이콘 표시
  mouse → "클릭으로 블록 배치" 텍스트
  touch → "스와이프/탭으로 조작" 텍스트

사용처 2: InputHandler — 입력 처리 분기
  keyboard → keydown/keyup 이벤트 처리, DAS 적용
  mouse → 그리드 열 클릭 → col 이동 + 하드 드롭
  touch → 스와이프 감지(좌우/하향) + 열 탭

사용처 3: renderPause() / renderGameover() — 안내 텍스트
  keyboard → "P키로 재개" / "R키로 재시작"
  mouse → "클릭하여 재개" / "클릭하여 재시작"
  touch → "탭하여 재개" / "탭하여 재시작"

사용처 4: Pause 버튼 표시
  keyboard → ESC/P 키 안내만 표시
  mouse/touch → 우상단 일시정지 아이콘 버튼 표시
```

### 5.4 렌더링 순서 (Z-order)

```
1.  배경 그라데이션                       — 클리어 시 밝기 펄스
2.  격자 배경 (offscreen canvas)          — BPM 미세 진동
3.  그리드 영역 배경 (#12122A)            — 반투명 사각형
4.  그리드 셀 테두리 (격자선)             — 20% alpha
5.  배치된 블록 (grid[][])                — 각 음계별 도형+색상
6.  고스트 블록 (착지 예측)               — 30% alpha
7.  떨어지는 블록 (fallingBlock)          — 현재 위치
8.  클리어 이펙트 (폭발, 파티클)          — tween 스케일+페이드
9.  체인 텍스트 ("Chain ×2!")             — tween scaleUp + fadeOut
10. 착지 이펙트 (수평 웨이브)             — tween fadeOut
11. 그리드 경계선                         — 2px 실선
12. HUD: 점수 (우상단)                    — 변동 시 밝아짐
13. HUD: 레벨 (좌상단)                    — 레벨업 시 글로우
14. HUD: 다음 블록 미리보기 (우측)        — 60×60px 영역
15. HUD: BPM (우하단)                     — 소형 텍스트
16. HUD: 라인 클리어 카운트 (좌측)        — 누적 표시
17. 음표 파티클 (부유)                    — 배경 위 떠다님
18. 게임오버 경고 (상단 2행 적색 비네트)  — 블록이 row 5+ 시
19. 오버레이 (일시정지/모달/게임오버)     — 반투명 배경 위
```

---

## 6. 난이도 시스템

### 6.1 레벨 곡선 (핵심 난이도 드라이버)

| 레벨 | 필요 클리어 수 | 낙하 간격 (ms) | BPM (배경) | 음표 종류 | 체감 |
|------|---------------|----------------|------------|-----------|------|
| 1 | 0 | 1000 | 80 | 3종 (C, D, E) | 입문 — 여유로운 배치 |
| 2 | 5 | 920 | 90 | 3종 | 웜업 — 리듬 적응 |
| 3 | 12 | 840 | 100 | 4종 (+F) | 확장 — 새 음표 등장 |
| 4 | 21 | 760 | 110 | 4종 | 적응 — 전략 필요 |
| 5 | 32 | 680 | 120 | 5종 (+G) | 도전 — 전체 음계 |
| 6 | 45 | 600 | 125 | 5종 | 긴장 — 빨라짐 |
| 7 | 60 | 520 | 130 | 5종 | 열광 — 빠른 판단 |
| 8 | 77 | 440 | 135 | 5종 | 극한 — 생존 |
| 9 | 96 | 360 | 140 | 5종 | 마스터 |
| 10+ | 117+ | 280 (최소) | 145 (최대) | 5종 | 무한 — 최고 기록 도전 |

- **낙하 간격 공식**: `dropInterval = max(280, 1000 - (level - 1) × 80)` ms
- **BPM 공식**: `bpm = min(145, 80 + (level - 1) × 7.2)`
- 레벨업 시: 화면 플래시 + "Level Up!" tween + BPM 증가 tween(500ms, easeOutQuad)
- 레벨업 보너스: `level × 200` 점

### 6.2 블록 생성 규칙 (음표 분배)

```
음표 풀(가용 음표 배열):
  level 1~2: [C, D, E]     — 3종
  level 3~4: [C, D, E, F]  — 4종
  level 5+:  [C, D, E, F, G] — 5종

블록 선택: 가중 랜덤
  기본: 균등 분배
  보정: 그리드에 2개 이상 존재하는 음표의 가중치 +30%
        (매치 기회를 높여 "불가능한 상황" 방지)

다음 블록:
  현재 블록 생성 시 동시에 다음 블록 1개 미리 결정
  미리보기 영역에 표시
```

### 6.3 동적 밸런스 보정

| 조건 | 효과 | UI 표시 |
|------|------|---------|
| **그리드 높이 6행 이상** (위기) | 가중치 추가: 매치 가능성 높은 음표 +50% | 상단 2행 적색 비네트 깜빡임 |
| **연속 3블록 매치 없음** | 다음 블록을 그리드에 2개 이상 있는 음표로 강제 | (비표시, 내부 보정) |
| **체인 3+ 달성** | 배경 비주얼 강화 (파티클 밀도 2배, 1초간) | "Amazing!" 텍스트 팝업 |

---

## 7. 점수 시스템

### 7.1 기본 점수 + 체인 배율

| 행동 | 기본 점수 | 체인 배율 | 체인 0 | 체인 1 | 체인 2 | 체인 3 |
|------|-----------|-----------|--------|--------|--------|--------|
| **3매치 클리어** | 100 | `× (1 + chain × 0.5)` | 100 | 150 | 200 | 250 |
| **4매치 클리어** (4개 연속) | 300 | `× (1 + chain × 0.5)` | 300 | 450 | 600 | 750 |
| **T자/L자 매치** (가로+세로 동시) | 500 | `× (1 + chain × 0.5)` | 500 | 750 | 1000 | 1250 |
| **소프트 드롭** | 행당 1점 | ×1 (체인 무관) | — | — | — | — |
| **하드 드롭** | 행당 2점 | ×1 (체인 무관) | — | — | — | — |

- **체인 배율** = `1 + chain × 0.5` (체인 1당 +50%, 최대 제한 없음)
- **레벨 배율** = `1 + (level - 1) × 0.1` (레벨 1당 +10%)
- **최종 점수** = `기본점수 × 체인배율 × 레벨배율`

### 7.2 보너스 점수

| 행동 | 보너스 | 비고 |
|------|--------|------|
| 레벨업 | `level × 200` | 레벨 도달 시 1회 |
| 올 클리어 (그리드 완전 비움) | 3000 | "ALL CLEAR!" 특별 연출 |
| 체인 3+ | 500 | "Amazing Chain!" 팝업 |
| 체인 5+ | 1500 | "Incredible!" 팝업 |

### 7.3 변수 사용처 명시 (유령 코드 방지)

```
변수: score (현재 점수)
  갱신: clearMatches() — 매치 시 기본점수 × 체인배율 × 레벨배율 가산
  사용: (1) HUD 점수 렌더링, (2) 결과 화면 표시, (3) 최고 점수 비교

변수: level (현재 레벨)
  갱신: clearCount 증가 시 레벨 테이블 참조하여 갱신
  사용: (1) HUD 레벨 표시, (2) 낙하 간격 계산, (3) BPM 계산,
        (4) 레벨 배율 계산, (5) 블록 음표 종류 결정, (6) 레벨업 보너스 점수

변수: clearCount (총 클리어 횟수)
  갱신: clearMatches() — 매치된 블록 수만큼(3 or 4) 증가
  사용: (1) 레벨 판정, (2) HUD 클리어 수 표시, (3) 결과 화면

변수: chainCount (현재 연쇄 수)
  갱신: checkMatches() — 매치 발견 시 +1, 체인 종료 시 0
  사용: (1) 체인 배율 계산, (2) 체인 텍스트 렌더링, (3) 체인 보너스 판정,
        (4) 화음 레이어 수 결정 (§10.5)

변수: maxChain (최대 연쇄)
  갱신: chainCount 증가 시 max(maxChain, chainCount)
  사용: (1) 결과 화면 표시, (2) 최고 체인 저장 비교

변수: dropInterval (현재 낙하 간격)
  갱신: 레벨 변경 시 재계산: max(280, 1000 - (level-1) × 80)
  사용: (1) DropManager.update() 낙하 타이밍 판정

변수: bpm (배경 비트 속도)
  갱신: 레벨 변경 시 tween으로 부드럽게 전환 (§6.1 공식)
  ⚠️ 주의: bpm 갱신 경로는 tween 단일 경로만 허용 (직접 대입 금지 — Cycle 5 교훈)
  사용: (1) 배경 비트 진동 주기, (2) BPM 텍스트 렌더링, (3) 음표 파티클 생성 주기

변수: isClearing (체인 진행 중 여부)
  갱신: checkMatches() 매치 발견 시 true, 체인 종료 시 false
  사용: (1) 입력 차단 (체인 중 블록 조작 금지), (2) 새 블록 생성 차단

변수: inputMode
  갱신: 첫 키보드/마우스/터치 입력 시 설정, 이후 입력 변경 시 전환
  사용: (1) 조작 가이드 렌더링, (2) 입력 처리 분기, (3) 안내 텍스트 분기, (4) 버튼 표시

변수: fallingBlock = { note, col, row, dropTimer }
  갱신: (1) 생성 시 note/col/row 초기화, (2) update에서 dropTimer 누적,
        (3) 입력에서 col 변경, (4) 낙하에서 row 감소
  사용: (1) 블록 렌더링, (2) 착지 판정, (3) 고스트 블록 위치 계산
```

### 7.4 최고 점수 처리 순서 (Cycle 2 B4 교훈 반영)

```javascript
// ⚠️ 반드시 이 순서 — "판정 먼저, 저장 나중에"
const isNewBest = score > getBest();           // 1. 판정
const isNewChain = maxChain > getBestChain();  // 1b.
saveBest(score);                                // 2. 저장
saveBestChain(maxChain);                        // 2b.
if (isNewBest) showNewBestEffect();             // 3. 연출
```

### 7.5 localStorage 키
- `bc_bestScore` — 최고 점수
- `bc_bestChain` — 최고 체인
- `bc_bestLevel` — 최고 레벨
- `bc_totalPlays` — 총 플레이 횟수
- `bc_totalClears` — 누적 클리어 수 (통계용)
- 모든 접근은 `try { ... } catch(e) { /* silent */ }` 래핑

---

## 8. 상태 × 시스템 업데이트 매트릭스

> **Cycle 2 B1/B2의 근본 원인 해결. Cycle 3~4에서 효과 검증 완료.** 이 매트릭스는 코드 상단 주석으로도 그대로 복사할 것.

| 게임 상태 | TweenMgr | DropMgr | Input | MatchSys | BeatPulse | Particles | Render | Audio |
|-----------|----------|---------|-------|----------|-----------|-----------|--------|-------|
| **LOADING** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | loading화면 | ✗ |
| **TITLE** | **✓** | ✗ | start만 | ✗ | 느린 배경만 | ✗ | title화면 | ✗ |
| **PLAYING** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | game | **✓** |
| **PAUSE** | **✓** | ✗ | resume만 | ✗ | 정지 | ✗ | game+pause오버레이 | suspend |
| **CONFIRM_MODAL** | **✓** | ✗ | 예/아니오 | ✗ | 정지 | ✗ | game+modal오버레이 | suspend |
| **GAMEOVER** | **✓** | ✗ | restart만 | ✗ | 느린 감쇠 | **✓** | game+결과화면 | ✗ |

> **핵심 규칙:**
> 1. TweenManager는 **모든 상태에서 항상 업데이트**한다.
> 2. isClearing === true 중에도 TweenManager는 업데이트 (클리어/중력 tween 진행)
> 3. GAMEOVER에서 Particles는 업데이트하여 마지막 이펙트가 자연스럽게 사라지게 한다.
> 4. AudioContext는 PLAYING에서만 활성, PAUSE/CONFIRM_MODAL에서 suspend.

---

## 9. 상태 전환 흐름 (setTimeout 완전 금지)

```
LOADING ──(Canvas + AudioContext 초기화 완료)──→ TITLE

TITLE ──(Enter/Space/클릭/탭)──→ PLAYING
        (tween: 타이틀 fadeOut 300ms onComplete)
        (enterState(PLAYING): AudioContext.resume(), spawnFirstBlock())

PLAYING ──(블록 착지 위치 >= row 7 && !transitioning)──→ GAMEOVER
          (tween: 화면 적색 플래시 0.5초 + 그리드 흔들림 onComplete)
          ※ beginTransition(GAMEOVER) 호출 — 가드+우선순위 내장
          (enterState(GAMEOVER): AudioContext.suspend(), 결과 집계)

PLAYING ──(P키/ESC/일시정지 버튼)──→ PAUSE
          (즉시, AudioContext.suspend())

PAUSE ──(P키/ESC/resume 버튼)──→ PLAYING
        (즉시, AudioContext.resume())

PAUSE ──(R키)──→ CONFIRM_MODAL
                  (tween: 모달 fadeIn 200ms)

CONFIRM_MODAL ──(예)──→ TITLE (게임 리셋 — clearImmediate() 호출)
CONFIRM_MODAL ──(아니오/ESC)──→ PAUSE (tween: 모달 fadeOut 200ms onComplete)

GAMEOVER ──(R키/재시작 버튼/클릭/탭)──→ TITLE (게임 리셋 — clearImmediate() 호출)
```

> **모든 지연 전환은 tween의 onComplete 콜백으로 처리.** `setTimeout` / `setInterval` 사용 금지.
> **상태 전환 시 `beginTransition()` 헬퍼 필수 사용** (§10.1 참조).
> **상태 진입 시 `enterState()` 호출** — 해당 상태의 tween/오디오 초기화 일원화 (Cycle 4 글로우 미복구 문제 해결).

---

## 10. 핵심 시스템 설계

### 10.1 TransitionGuard + enterState 패턴 (Cycle 4 계승 + 신규 개선)

```javascript
// 상태 우선순위 (높을수록 강함)
const STATE_PRIORITY = {
  LOADING: 0, TITLE: 10, PLAYING: 20,
  PAUSE: 30, CONFIRM_MODAL: 35, GAMEOVER: 99
};

let transitioning = false;

function beginTransition(targetState, tweenConfig) {
  if (transitioning) return false;
  if (STATE_PRIORITY[state] >= STATE_PRIORITY[targetState]) return false;

  transitioning = true;

  if (tweenConfig) {
    tw.add(tweenConfig.target, tweenConfig.props, tweenConfig.duration,
           tweenConfig.easing, () => {
      state = targetState;
      transitioning = false;
      enterState(targetState);  // ← 상태 진입 초기화
      if (tweenConfig.onComplete) tweenConfig.onComplete();
    });
  } else {
    state = targetState;
    transitioning = false;
    enterState(targetState);
  }
  return true;
}

// 상태 진입 시 초기화 (Cycle 4 타이틀 글로우 미복구 해결)
function enterState(s) {
  switch(s) {
    case TITLE:
      pulseTitle();             // 타이틀 글로우 tween 시작
      pulseMusicNotes();        // 음표 아이콘 부유 tween
      audioCtx?.suspend();
      break;
    case PLAYING:
      audioCtx?.resume();
      spawnNextBlock();
      startBeatPulse();         // 배경 비트 진동 시작
      break;
    case PAUSE:
      audioCtx?.suspend();
      break;
    case GAMEOVER:
      audioCtx?.suspend();
      calculateResults();
      startResultSequence();    // 결과 순차 fadeIn tween
      break;
  }
}
```

### 10.2 TweenManager (Cycle 4 계승 + clearImmediate 신규)

```javascript
class TweenManager {
  constructor() {
    this._tweens = [];
    this._pendingCancel = false;
  }

  add(target, props, duration, easing, onComplete) {
    this._tweens.push({ target, props, duration, easing, onComplete,
                        elapsed: 0, startValues: {} });
    return this;
  }

  update(dt) {
    if (this._pendingCancel) {
      this._tweens.length = 0;
      this._pendingCancel = false;
      return;
    }
    for (let i = this._tweens.length - 1; i >= 0; i--) {
      const tw = this._tweens[i];
      if (!tw._started) {
        tw._started = true;
        for (const k in tw.props) tw.startValues[k] = tw.target[k];
      }
      tw.elapsed += dt * 1000;
      const t = Math.min(1, tw.elapsed / tw.duration);
      const e = EASING[tw.easing || 'linear'](t);
      for (const k in tw.props) {
        tw.target[k] = tw.startValues[k] + (tw.props[k] - tw.startValues[k]) * e;
      }
      if (t >= 1) {
        this._tweens.splice(i, 1);
        if (tw.onComplete) tw.onComplete();
      }
    }
  }

  // 기존: deferred cancel (update 중 안전)
  cancelAll() {
    this._pendingCancel = true;
  }

  // ⭐ 신규: 즉시 정리 (Cycle 4 B1 CRITICAL 해결)
  // resetGame() 등 update 밖에서 호출할 때 사용
  clearImmediate() {
    this._tweens.length = 0;
    this._pendingCancel = false;   // 혹시 남은 deferred 플래그도 제거
  }
}

// 이징 함수 5종 완전 구현
const EASING = {
  linear:       t => t,
  easeOutQuad:  t => t * (2 - t),
  easeInQuad:   t => t * t,
  easeOutBack:  t => 1 + (--t) * t * (2.70158 * t + 1.70158),
  easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 :
    Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1
};
```

> **핵심 변경점**: `resetGame()`에서는 반드시 `tw.clearImmediate()`를 호출한다. `cancelAll()` 직후 `add()`를 호출하는 시나리오가 원천 차단된다. `cancelAll()`은 update 루프 내에서만 호출되는 안전한 패턴으로 유지한다.

### 10.3 ObjectPool (Cycle 2~4 인프라 계승)

```javascript
// 풀링 대상 및 크기
const pools = {
  particle:  new ObjectPool(() => new Particle(), 40),
  wave:      new ObjectPool(() => new Wave(), 8),
  noteIcon:  new ObjectPool(() => new NoteIcon(), 12)  // 부유 음표 파티클
};
```

> 그리드 블록은 `grid[col][row]` 배열로 직접 관리 (고정 크기 4×8이므로 풀링 불필요).

### 10.4 MatchSystem — 매치 판정 엔진 (핵심 신규 시스템)

```javascript
class MatchSystem {
  // 가로/세로 매치 탐색 — O(cols × rows) = O(32)로 매우 경량
  findMatches(grid) {
    const matched = Array.from({length: 4}, () => Array(8).fill(false));

    // 가로 탐색 (각 행에서 연속 같은 음표 3+)
    for (let r = 0; r < 8; r++) {
      let count = 1;
      for (let c = 1; c < 4; c++) {
        if (grid[c][r] && grid[c-1][r] &&
            grid[c][r].note === grid[c-1][r].note) {
          count++;
        } else {
          if (count >= 3) markRow(matched, r, c - count, count);
          count = 1;
        }
      }
      if (count >= 3) markRow(matched, r, 4 - count, count);
    }

    // 세로 탐색 (각 열에서 연속 같은 음표 3+)
    for (let c = 0; c < 4; c++) {
      let count = 1;
      for (let r = 1; r < 8; r++) {
        if (grid[c][r] && grid[c][r-1] &&
            grid[c][r].note === grid[c][r-1].note) {
          count++;
        } else {
          if (count >= 3) markCol(matched, c, r - count, count);
          count = 1;
        }
      }
      if (count >= 3) markCol(matched, c, 8 - count, count);
    }

    return matched;
  }

  // 매치 유형 판정 (점수 차등)
  classifyMatch(matched) {
    let hasHorizontal = false, hasVertical = false;
    let maxRun = 0;
    // ... 가로/세로 동시 매치(T자/L자) 판정, 4매치 판정 ...
    if (hasHorizontal && hasVertical) return 'CROSS';  // T/L자, 500점
    if (maxRun >= 4) return 'FOUR';                    // 4매치, 300점
    return 'THREE';                                     // 3매치, 100점
  }
}
```

### 10.5 Web Audio API — 절차적 음악 생성

```javascript
// AudioContext 초기화 (첫 사용자 인터랙션 시)
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { /* 사운드 비활성 — 게임플레이는 시각 판정만으로 동작 */ }
  }
}

// 마스터 볼륨
let masterGain;
function setupAudio() {
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(audioCtx.destination);
}

// 음계 주파수 맵
const NOTE_FREQ = [261.6, 293.7, 329.6, 349.2, 392.0]; // C4, D4, E4, F4, G4

// === 블록 착지 사운드 (짧은 단음) ===
function sfxPlace(noteIndex) {
  try {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTE_FREQ[noteIndex], audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.08);
  } catch(e) { /* silent */ }
}

// === 매치 클리어 화음 (핵심 — 퍼즐 풀이가 음악을 만든다) ===
function sfxClearChord(matchedNotes, chainCount) {
  try {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const uniqueNotes = [...new Set(matchedNotes)];

    // 기본 화음: 매치된 음계들을 동시 연주
    uniqueNotes.forEach((noteIdx, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(NOTE_FREQ[noteIdx], now);
      const vol = 0.15 / uniqueNotes.length;  // 음 수에 따라 볼륨 분배
      gain.gain.setValueAtTime(vol, now);
      gain.gain.linearRampToValueAtTime(vol * 0.8, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(now + i * 0.02);  // 미세 딜레이로 아르페지오 느낌
      osc.stop(now + 0.4);
    });

    // 체인 보너스: 체인 수에 따라 옥타브 위 화음 추가
    if (chainCount >= 1) {
      uniqueNotes.forEach((noteIdx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(NOTE_FREQ[noteIdx] * 2, now);  // 1옥타브 위
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain); gain.connect(masterGain);
        osc.start(now + 0.05); osc.stop(now + 0.3);
      });
    }

    // 체인 2+ : 베이스 추가
    if (chainCount >= 2) {
      const bassFreq = NOTE_FREQ[uniqueNotes[0]] / 2;  // 1옥타브 아래
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassFreq, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(now); osc.stop(now + 0.35);
    }
  } catch(e) { /* silent */ }
}

// === 배경 비트 (BPM 기반 메트로놈 — 리듬감 제공) ===
let beatTimer = 0;
function updateBeatPulse(dt) {
  beatTimer += dt;
  const beatInterval = 60 / bpm;
  if (beatTimer >= beatInterval) {
    beatTimer -= beatInterval;
    // 시각적 비트 펄스 (배경 alpha 펄스)
    beatFlash = 0.15;
    // 청각적 메트로놈 (매우 작은 볼륨)
    try {
      if (!audioCtx || audioCtx.state !== 'running') return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.03);
    } catch(e) { /* silent */ }
  }
}

// === 기타 효과음 ===
function sfxLevelUp() { /* 상승 아르페지오: C→E→G→C5, 각 60ms, 볼륨 0.1 */ }
function sfxGameOver() { /* 하강 단조: G→E→C→A3, 각 100ms, sawtooth, 볼륨 0.08 */ }
function sfxAllClear() { /* 풀 메이저 코드: C+E+G 동시, 800ms, 볼륨 0.15 */ }
```

- 모든 SFX/음악 호출은 `try-catch` 래핑 — 오디오 실패 시 시각 판정만으로 게임 정상 동작
- PLAYING 상태에서만 음악 재생 (매트릭스 참조)
- PAUSE 시 `audioCtx.suspend()`, 재개 시 `audioCtx.resume()`
- **⚠️ bpm 갱신은 tween 단일 경로만 허용** (Cycle 5 platform-wisdom 교훈: 이중 등록 방지)

### 10.6 game.destroy() 패턴 (Cycle 3~4 표준 계승)

```javascript
const registeredListeners = [];

function listen(el, evt, fn, opts) {
  el.addEventListener(evt, fn, opts);
  registeredListeners.push([el, evt, fn, opts]);
}

function destroy() {
  cancelAnimationFrame(rafId);
  registeredListeners.forEach(([el, evt, fn, opts]) =>
    el.removeEventListener(evt, fn, opts));
  registeredListeners.length = 0;
  Object.values(pools).forEach(p => p.clear());
  tw.clearImmediate();  // ← clearImmediate 사용 (cancelAll 아님)
  if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
}
```

---

## 11. UI 레이아웃 상세

### 11.1 게임 중 HUD

```
┌────────────────────────────────────────────────────┐
│ Lv.5    ⭐ 12,450                             [⏸] │
│ Lines: 32                                          │
│         ┌───┬───┬───┬───┐                          │
│         │   │ ▼ │   │   │  ← 떨어지는 블록        │
│         ├───┼───┼───┼───┤         ┌─────┐          │
│         │ ● │ ● │ ● │   │         │NEXT │          │
│         ├───┼───┼───┼───┤         │  ◆  │          │
│         │ ◆ │ ▲ │ ■ │ ● │         └─────┘          │
│         ├───┼───┼───┼───┤                          │
│         │ ★ │ ■ │ ▲ │ ◆ │                          │
│         ├───┼───┼───┼───┤     Chain ×2!            │
│         │ ▲ │ ★ │ ● │ ■ │                          │
│         ├───┼───┼───┼───┤                          │
│         │ ■ │ ● │ ★ │ ▲ │                          │
│         ├───┼───┼───┼───┤                          │
│         │ ● │ ◆ │ ■ │ ★ │                          │
│         └───┴───┴───┴───┘                          │
│         ← → ↓ Space              ♪ 120 BPM        │
└────────────────────────────────────────────────────┘
```

- 점수: 우상단 `#E0E0E0`, `18px bold`, 변동 시 잠시 밝아짐 tween
- 레벨: 좌상단 `#FFD740`, `14px bold`, 레벨업 시 글로우 tween
- 클리어 수: 좌측 `#AAAAAA`, `12px`
- 다음 블록: 우측 60×60px 영역, 배경 `#1A1A3E`, "NEXT" 텍스트 `#888888` `10px`
- 체인 텍스트: 그리드 우측, `#00E5FF`, `28px bold`, tween scaleUp(1.5→1.0, easeOutBack, 300ms) + fadeOut(800ms)
- BPM: 우하단 `#D500F9`, `11px`
- 일시정지 버튼: 우상단 20×20px (마우스/터치 모드에서만)
- 게임오버 경고: 그리드 상단 2행에 적색 비네트 (`#FF1744` 20% alpha)

### 11.2 타이틀 화면

```
┌────────────────────────────────────────────────────┐
│                                                    │
│           ╔══════════════════════════╗              │
│           ║  비 트  크 래 프 터     ║              │
│           ║    BEAT CRAFTER         ║              │
│           ╚══════════════════════════╝              │
│                  ♪ ♫ ♪ ♫                           │
│                                                    │
│            BEST: 24,800pts  |  Lv.7                │
│            BEST CHAIN: ×5                          │
│                                                    │
│          [ENTER / 탭으로 시작]                      │
│                                                    │
│     ← → : 이동   ↓ : 드롭   Space : 하드 드롭     │
│                                                    │
│      ● 도  ◆ 레  ▲ 미  ■ 파  ★ 솔                │
│                                                    │
└────────────────────────────────────────────────────┘
```

- 타이틀 텍스트: tween 글로우 펄스 (alpha 0.7 → 1.0 반복) + 5색 순차 변화
- 배경: 느린 격자 그리드 + 부유 음표 파티클 (리듬감 암시)
- 음계 가이드: 5종 블록 아이콘 + 음계명 표시 (게임 규칙 사전 학습)
- 최고 기록: 0이면 표시 안 함

### 11.3 게임오버 / 결과 화면

```
┌────────────────────────────────────────────────────┐
│                                                    │
│           ╔══════════════════════╗                  │
│           ║    GAME  OVER       ║                  │
│           ╚══════════════════════╝                  │
│                                                    │
│            점수:     24,800                        │
│            레벨:     7                             │
│            클리어:   60줄                           │
│            최대 체인: ×5                            │
│            플레이 시간: 4:12                        │
│                                                    │
│            🏆 NEW BEST! (이전: 18,200)             │
│                                                    │
│          [R키 / 탭으로 재시작]                      │
│                                                    │
└────────────────────────────────────────────────────┘
```

- 결과 텍스트: tween 순차 fadeIn (점수 → 레벨 → 클리어 → 체인 → 시간, 각 200ms 딜레이)
- NEW BEST: easeOutElastic 스케일 연출 (0 → 1.2 → 1.0)
- ALL CLEAR 달성 이력이 있으면: "★ ALL CLEAR ★" 특별 텍스트 (골드, easeOutElastic)
- 배경: 마지막 게임 화면 위에 반투명 검정 오버레이 (`#000000` 70% alpha)

---

## 12. 사이드바 메타데이터 (게임 페이지용)

```yaml
game:
  title: "비트 크래프터"
  description: "퍼즐을 풀면 음악이 만들어진다! 떨어지는 음표 블록을 4×4 그리드에 배치하여 같은 음 3개를 정렬하면 화음이 울려 퍼지는 리듬 퍼즐. 연쇄 클리어로 풍성한 멜로디를 만들어보세요!"
  genre: ["puzzle", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "← → : 블록 좌우 이동"
    - "↓ : 소프트 드롭"
    - "Space : 하드 드롭 (즉시 착지)"
    - "P / ESC : 일시정지"
    - "터치 : 스와이프 이동 / 열 탭"
    - "마우스 : 열 클릭으로 배치"
  tags:
    - "#리듬퍼즐"
    - "#음악"
    - "#퍼즐"
    - "#블록"
    - "#캐주얼"
    - "#절차적음악"
    - "#WebAudio"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

---

## 13. 구현 체크리스트

### 13.1 핵심 기능 (필수)
- [ ] 4열×8행 그리드 시스템
- [ ] 5종 음표 블록 (C/D/E/F/G, 각 고유 도형+색상)
- [ ] 블록 낙하 + 좌우 이동 + 소프트 드롭 + 하드 드롭
- [ ] DAS (Delayed Auto Shift) — dt 누적 방식 (setTimeout 금지)
- [ ] 고스트 블록 (착지 예측 표시)
- [ ] 다음 블록 미리보기 (1개)
- [ ] 매치 판정 (가로/세로 3개 이상 연속 같은 음표)
- [ ] 3매치 / 4매치 / T자·L자 매치 판정 차등 점수
- [ ] 클리어 → 중력 → 연쇄 매치 (체인 시스템)
- [ ] isClearing 가드 플래그 (체인 중 입력/블록 생성 차단)
- [ ] 레벨 시스템 (클리어 수 기반, 10단계)
- [ ] 낙하 속도 증가 (레벨별 dropInterval 감소)
- [ ] 음표 풀 확장 (레벨별 3종→5종)
- [ ] 동적 밸런스 보정 (위기 시 매치 유리 블록 생성)
- [ ] 점수 시스템 (체인 배율 × 레벨 배율) + localStorage 최고 기록
- [ ] 6상태 게임 상태 머신
- [ ] TweenManager (**clearImmediate() 포함** — Cycle 4 B1 해결)
- [ ] ObjectPool (파티클, 파동, 음표 아이콘)
- [ ] TransitionGuard 패턴 (가드 플래그 + 상태 우선순위)
- [ ] enterState() 패턴 (상태 진입 시 초기화 일원화 — Cycle 4 글로우 미복구 해결)
- [ ] Canvas 기반 모달 (confirm 대체)
- [ ] 상태 × 시스템 매트릭스 코드 주석 포함
- [ ] game.destroy() + 리스너 cleanup
- [ ] 키보드/마우스/터치 입력 자동 감지 및 분기 동작

### 13.2 시각/연출 (필수)
- [ ] 네온 뮤직 비주얼 (순수 Canvas 드로잉)
- [ ] 5종 블록 고유 도형 (원/다이아몬드/삼각형/사각형/별)
- [ ] 블록 내 음계 글자 표시 (C/D/E/F/G)
- [ ] 고스트 블록 (30% alpha, 점선 테두리)
- [ ] 클리어 이펙트 (스케일 확대→소멸 + 파티클 방사)
- [ ] 체인 텍스트 scaleUp + fadeOut tween
- [ ] 착지 이펙트 (수평 웨이브)
- [ ] 레벨업 이펙트 (화면 플래시 + 텍스트)
- [ ] 비트 반응형 배경 (클리어 시 밝기 펄스, BPM 진동)
- [ ] 음표 부유 파티클 (♪ 형태)
- [ ] offscreen canvas 격자 그리드 캐시
- [ ] 게임오버 순차 fadeIn 결과 연출
- [ ] NEW BEST easeOutElastic 연출
- [ ] 게임오버 경고 (상단 2행 적색 비네트)

### 13.3 사운드 (핵심 — "퍼즐 = 작곡" 체험의 핵심)
- [ ] Web Audio API 블록 착지 단음 (해당 음계, 50ms)
- [ ] Web Audio API 매치 클리어 화음 (매치된 음계 동시 연주)
- [ ] Web Audio API 체인 보너스 화음 (옥타브 위 + 베이스 추가)
- [ ] Web Audio API 배경 비트 메트로놈 (BPM 기반, 매우 작은 볼륨)
- [ ] 레벨업 아르페지오 효과음
- [ ] 게임오버 하강 효과음
- [ ] 올 클리어 풀 메이저 코드
- [ ] AudioContext.currentTime 기반 타이밍 (setTimeout 절대 금지)
- [ ] PAUSE 시 audioCtx.suspend() / resume 시 audioCtx.resume()
- [ ] try-catch 래핑 (모든 오디오 호출)
- [ ] 첫 인터랙션에서 AudioContext 초기화
- [ ] 오디오 실패 시 시각만으로 게임 정상 동작

### 13.4 기획서 대조 체크리스트 (코드 리뷰 시)
- [ ] 모든 상태에서 `tw.update(dt)` 호출 확인 (매트릭스 대조)
- [ ] `setTimeout` / `setInterval` 사용 0건 확인
- [ ] `confirm()` / `alert()` 사용 0건 확인
- [ ] SVG / 외부 이미지 / 외부 폰트 / 외부 사운드 사용 0건 확인
- [ ] ASSET_MAP / SPRITES / preloadAssets 잔존 0건 확인
- [ ] 점수 판정→저장 순서 확인 (`isNewBest` 먼저)
- [ ] `beginTransition()` 헬퍼로 모든 상태 전환 처리 확인
- [ ] `enterState()` 함수에서 모든 상태의 초기화 로직 확인
- [ ] `transitioning` 가드 플래그가 모든 tween 전환에 적용 확인
- [ ] `isClearing` 가드 플래그가 체인 중 입력/블록 생성 차단 확인
- [ ] `STATE_PRIORITY` 맵 정의 및 우선순위 검사 동작 확인
- [ ] `clearImmediate()` 가 resetGame()에서 사용되는지 확인 (**cancelAll 아님!**)
- [ ] destroy() 패턴으로 모든 리스너 정리 확인 (`registeredListeners` 사용)
- [ ] 이징 함수 5종 모두 구현 확인
- [ ] bpm 갱신 경로가 tween 단일 경로인지 확인 (직접 대입 없음)
- [ ] **선언된 모든 변수의 갱신/사용처 확인** (유령 변수 방지 — §7.3 대조)
  - `score`: 3개 사용처 모두 구현 확인
  - `level`: 6개 사용처 확인
  - `clearCount`: 3개 사용처 확인
  - `chainCount`: 4개 사용처 확인
  - `maxChain`: 2개 사용처 확인
  - `dropInterval`: 1개 사용처 확인
  - `bpm`: 3개 사용처 확인
  - `isClearing`: 2개 사용처 확인
  - `inputMode`: 4개 사용처 확인
  - `fallingBlock`: 4개 갱신처, 3개 사용처 확인
- [ ] Canvas 기반 모달만 사용 확인
- [ ] PAUSE/CONFIRM_MODAL에서 audioCtx.suspend() 확인

### 13.5 자동 검증 스크립트 (Cycle 4 제안 — 실제 도입)

> 3사이클 연속 SVG 재발로 "기획서 명시만으로는 불가"가 확정되었다. 코드 작성 중에도 수시로 실행하고, 코드 리뷰 전 최종 1회 반드시 실행한다.

```bash
# 금지 패턴 검사 (모두 0건이어야 PASS)
echo "=== 금지 패턴 자동 검증 ==="
echo "--- setTimeout/setInterval ---"
grep -cn "setTimeout\|setInterval" games/beat-crafter/index.html
echo "--- confirm/alert/prompt ---"
grep -cn "confirm(\|alert(\|prompt(" games/beat-crafter/index.html
echo "--- SVG / 외부 이미지 ---"
grep -cn "\.svg\|\.png\|\.jpg\|\.gif\|feGaussianBlur\|<filter" games/beat-crafter/index.html
echo "--- 외부 폰트/CDN ---"
grep -cn "fonts.googleapis\|cdn\.\|<link.*stylesheet" games/beat-crafter/index.html
echo "--- 외부 사운드 파일 ---"
grep -cn "\.mp3\|\.ogg\|\.wav\|Audio(" games/beat-crafter/index.html
echo "--- eval ---"
grep -cn "eval(" games/beat-crafter/index.html
echo "--- 미사용 에셋 잔존 ---"
grep -cn "ASSET_MAP\|SPRITES\|preloadAssets" games/beat-crafter/index.html
echo "=== 모든 항목 0이면 PASS ==="
```

> **⚠️ Cycle 5 platform-wisdom 추가 교훈:** 검증은 코드 완성 후 1회로는 부족하다. 코딩 중에도 수시로 실행하여 초기 잔존 패턴을 조기에 제거할 것.

---

## 14. 예상 코드 규모

```
예상 줄 수: ~1,000~1,300줄

구조 분배:
  - 상수/설정:           ~70줄   (색상, 음계 주파수, 레벨 테이블, 그리드 크기)
  - TweenManager:        ~70줄   (clearImmediate 포함, 이징 5종)
  - ObjectPool:          ~30줄   (Cycle 3~4 계승)
  - TransitionGuard:     ~35줄   (beginTransition + enterState + STATE_PRIORITY)
  - MatchSystem:         ~80줄   (가로/세로 매치 탐색 + 유형 분류)
  - DropManager:         ~60줄   (낙하 + DAS + 착지 + 고스트)
  - ChainManager:        ~50줄   (체인 진행 + 중력 + 재매치 루프)
  - Web Audio 음악 생성: ~100줄  (착지 단음 + 클리어 화음 + 체인 화음 + 배경 비트 + SFX)
  - InputHandler:        ~80줄   (키보드 DAS + 마우스 열 클릭 + 터치 스와이프)
  - BlockSpawner:        ~40줄   (음표 풀 + 가중 랜덤 + 밸런스 보정)
  - UI/HUD:              ~80줄   (점수, 레벨, 클리어 수, 체인 텍스트, 다음 블록, BPM)
  - 렌더링:              ~130줄  (배경, 그리드, 블록 5종 도형, 이펙트, 파티클)
  - 상태 머신/루프:      ~50줄   (6상태 + 메인 루프 + enterState)
  - destroy/init:        ~35줄   (라이프사이클 관리)
```

---

## 15. 리스크 및 대응 계획

| 리스크 | 발생 확률 | 영향 | 대응 |
|--------|-----------|------|------|
| 4열 그리드에서 3매치가 빈번하여 게임이 너무 쉬움 | 중간 | 긴장감 부족 | 5종 음표로 매치 확률 조절. 레벨 1~2만 3종, 이후 4~5종으로 밸런스 |
| 절차적 화음이 불쾌할 수 있음 | 낮음 | 플레이 만족도 저하 | C 메이저 스케일 내의 음만 사용하여 불협화음 배제. 볼륨 0.3으로 안전 설정 |
| 체인 중 tween 다수 동시 활성으로 성능 저하 | 낮음 | 프레임 드롭 | 클리어 이펙트 파티클 수 제한 (블록당 8개 × 최대 4블록 = 32개). ObjectPool로 GC 방지 |
| 마우스/터치의 "열 클릭 → 하드 드롭" 조작이 부정확 | 중간 | 모바일 UX 저하 | 열 영역을 48px로 넓게 잡고, 터치 시 피드백(해당 열 하이라이트) 표시 |
| 오디오 미지원 브라우저 | 낮음 | 핵심 체험 손실 | 시각 이펙트로 "음악 만들기" 체험 일부 대체. 클리어 시 블록 색상 폭발로 피드백 유지 |
| bpm tween 이중 등록 | 중간 | 값 오류 | bpm 갱신 경로를 tween 단일 경로로 강제. 직접 대입 절대 금지 (§7.3, §10.5) |
