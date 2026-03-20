---
game-id: beat-rush
title: 비트 러시
genre: arcade, casual
difficulty: medium
---

# 비트 러시 (Beat Rush) — 상세 기획서

> **Cycle:** 5
> **작성일:** 2026-03-20
> **기획:** Claude (Game Designer)
> **근거:** `docs/analytics/cycle-5-report.md` 분석 보고서 기반

---

## 0. 이전 사이클 피드백 반영

> Cycle 4 "네온 대시 러너" 포스트모템에서 지적된 문제점과 다음 사이클 제안을 **명시적으로** 반영합니다.

### 0-1. Cycle 4 문제 해결 매핑

| Cycle 4 문제 / 제안 | 심각도 | Cycle 5 반영 방법 |
|---------------------|--------|-------------------|
| **[B1] TweenManager cancelAll+add 경쟁 조건** — deferred `_pendingCancel`이 신규 tween까지 삭제하여 게임 시작 불가 | CRITICAL | → **§10.2 TweenManager `clearImmediate()` API 분리**. `cancelAll()`은 deferred 유지, `clearImmediate()`는 즉시 `_tweens.length = 0` + `_pendingCancel = false` 실행. `resetGame()`에서는 `clearImmediate()`만 호출 |
| **[B2] SVG 에셋 재발 (3사이클 연속)** — 기획서 금지 명시로는 해결 불가 | MAJOR | → **§4.5 금지 목록 + §13.5 자동 검증 스크립트** 명시. 100% Canvas 드로잉 + grep 자동 검증 실행 규칙 확정. 리듬 게임은 기하학 도형 중심으로 SVG 필요성 자체가 없음 |
| **코인 콤보 보너스 미구현** — §7.1의 연속 코인 5개→+20점 메커니즘 누락 | MINOR | → 리듬 게임 특성상 **콤보 시스템이 핵심 메커니즘**으로 격상. §7.1에 콤보 배율 공식을 명확히 정의하고 변수 사용처까지 명시 |
| **타이틀 글로우 tween 비복구** — GAMEOVER→TITLE 복귀 시 pulseTitle() 미재호출 | MINOR | → **상태 진입 함수(enterState) 패턴** 도입. 각 상태 진입 시 해당 상태의 tween 초기화를 일원화하여 누락 방지 |
| TweenManager `clearImmediate()` API 분리 | 제안 | → **§10.2에서 구현** — cancelAll(deferred) vs clearImmediate(즉시) 이원화 |
| 에셋 자동 검증 스크립트 실제 도입 | 제안 | → **§13.5에서 grep 명령어 + 기대 결과 명시** |
| 리듬/음악 장르 도전 | 제안 | → **Beat Rush (비트 러시) 리듬 아케이드** 선택. Web Audio API 절차적 비트 생성 + 4레인 노트 판정 |

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
| Web Audio API 절차적 사운드 | **핵심 게임플레이 메커니즘으로 격상** — 비트 생성 + 효과음 |
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
Web Audio API로 **절차적으로 생성되는 비트**에 맞춰 4레인에서 내려오는 노트를 타이밍에 맞게 입력하는 리듬 아케이드 게임입니다. 드럼·베이스·멜로디 3트랙이 실시간 합성되어 매 게임마다 다른 음악이 생성되고, BPM이 단계적으로 상승하면서 "한 판만 더"의 중독성을 만듭니다. 외부 음악 파일 없이 순수 코드만으로 음악과 게임플레이가 동기화되는 것이 기술적 핵심입니다.

### 핵심 재미 요소
1. **비트와의 일체감** — 자신의 입력이 음악의 일부가 되는 쾌감. Perfect 판정 시 시각·청각 피드백이 극대화
2. **콤보의 쾌감** — 연속 히트가 쌓이면 배경 비주얼이 점점 화려해지고 점수 배율이 올라가는 "존 진입" 경험
3. **절차적 음악의 신선함** — 패턴 암기가 아닌 반응 테스트. 매 게임마다 다른 비트 시퀀스
4. **점진적 긴장감** — BPM 상승과 노트 밀도 증가로 자연스러운 난이도 곡선. "이번엔 더 버텨보자"
5. **즉각적 시각 보상** — Perfect/Great 판정에 따라 달라지는 네온 폭발 이펙트와 파동 연출

### 장르 다양화 기여
- **플랫폼 최초의 리듬/음악 기반 게임** — 기존 4개 게임(퍼즐/슈팅/전략/러너)과 완전히 다른 경험
- arcade + casual 듀얼 태그로 접근성과 리플레이 가치 동시 확보
- Web Audio API를 핵심 게임플레이로 사용하는 첫 사례 (Cycle 3~4는 효과음 용도)

---

## 2. 게임 규칙 및 목표

### 2.1 기본 규칙
- **4레인 하향식 리듬 게임** — 화면 상단에서 노트가 내려와 하단의 **판정 라인(Judge Line)**에 도착
- 노트가 판정 라인에 도달하는 타이밍에 맞춰 해당 레인의 키를 입력
- 판정 등급: **Perfect** / **Great** / **Good** / **Miss** (4단계)
- Miss가 일정 횟수 누적되면 **HP 게이지**가 소진되어 게임 오버
- 목표: **최고 점수 + 최대 콤보 달성**

### 2.2 레인 시스템

```
레인 1 (좌):  x = canvasWidth × 0.25
레인 2 (중좌): x = canvasWidth × 0.40
레인 3 (중우): x = canvasWidth × 0.60
레인 4 (우):  x = canvasWidth × 0.75
```

- 레인 너비: `60px` (양옆 4px 여백 포함, 유효 터치 영역 68px)
- 판정 라인 y 위치: `canvasHeight - 60px` (하단에서 60px 위)
- 노트 낙하 속도: BPM에 비례 (§6 참조)

### 2.3 노트 유형 (3종)

| 노트 유형 | 형태 | 크기 | 판정 방식 | 색상 | 등장 시점 |
|-----------|------|------|-----------|------|-----------|
| **탭 노트** (Tap) | 둥근 사각형 | 52×16px | 한 번 입력 | 레인별 색상 (§4) | 0초+ |
| **롱 노트** (Long) | 사각형 + 꼬리 | 52×가변px | 누르고 있기 | 레인 색상 + 50% alpha 꼬리 | 30초+ |
| **동시 노트** (Double) | 탭 노트 2개 | 52×16px ×2 | 2레인 동시 입력 | 각 레인 색상 + 연결선 | 60초+ |

- 노트 히트박스: 시각 크기 그대로 (리듬 게임은 시각=판정이 직관적)
- 노트는 ObjectPool로 재활용 (풀 크기: 40)

### 2.4 판정 시스템

| 판정 등급 | 타이밍 오차 (ms) | 점수 배율 | 콤보 | HP 영향 | 시각 효과 |
|-----------|-----------------|-----------|------|---------|-----------|
| **Perfect** | ±30ms | ×1.0 | +1 | +2 | 밝은 폭발 + 파동 |
| **Great** | ±60ms | ×0.8 | +1 | +1 | 중간 폭발 |
| **Good** | ±100ms | ×0.5 | 콤보 리셋 | 0 | 작은 반짝임 |
| **Miss** | >100ms 또는 미입력 | ×0 | 콤보 리셋 | -8 | 레인 어둡게 + 흔들림 |

- 판정 타이밍 기준: `AudioContext.currentTime` (고정밀 오디오 클럭, setTimeout 절대 금지)
- 노트 통과 판정: 노트가 판정 라인 아래 `100ms` 분량 이상 통과하면 자동 Miss
- HP 게이지: 초기 100, 최대 100, 0 이하 시 게임 오버

### 2.5 HP 게이지 시스템

```
HP 초기값: 100
HP 최대값: 100
HP 회복:   Perfect → +2, Great → +1
HP 감소:   Miss → -8
HP = 0:    게임 오버 (beginTransition(GAMEOVER))
```

- HP 바: 화면 좌측 세로 바 (폭 8px, 높이 = 게임 영역 높이)
- HP 색상: 100~60 `#00E676` (그린) → 59~30 `#FFD740` (옐로) → 29~0 `#FF1744` (레드)
- HP 30 이하: 바 깜빡임 tween (alpha 0.5 → 1.0, 300ms 반복)

---

## 3. 조작 방법

### 3.1 키보드 (PC 기본 — 리듬 게임 표준 4키)

| 키 | 동작 |
|----|------|
| **D** | 레인 1 (좌) 입력 |
| **F** | 레인 2 (중좌) 입력 |
| **J** | 레인 3 (중우) 입력 |
| **K** | 레인 4 (우) 입력 |
| **P** / **ESC** | 일시정지 토글 |
| **R** | 게임오버 시 재시작 (Canvas 모달 확인) |
| **Enter** / **Space** | 타이틀 화면에서 게임 시작 |

> **롱 노트**: 해당 키를 누르고 있는 동안 유지. 떼면 롱 노트 종료 판정.

### 3.2 마우스 (PC 보조)

| 조작 | 동작 |
|------|------|
| **레인 영역 클릭** | 해당 레인 입력 (4등분 영역) |
| **일시정지 버튼 (우상단)** | 일시정지 토글 |

### 3.3 터치 (모바일)

| 조작 | 동작 |
|------|------|
| **레인 영역 탭** | 해당 레인 입력 (4등분 영역) |
| **롱 노트 영역 홀드** | 롱 노트 유지 |
| **일시정지 버튼 (우상단)** | 일시정지 토글 |

> **입력 모드 자동 감지**: 첫 입력(키보드/마우스/터치)에 따라 모드 자동 설정. 이후 입력 변경 시 즉시 전환.
>
> **⚠️ Cycle 2~4 교훈**: 입력 모드 변수(`inputMode`)의 사용처를 §5.3에 명확히 명시하여 유령 코드 방지.

---

## 4. 시각적 스타일 가이드

### 4.1 색상 팔레트 — 네온 사이버 리듬

| 용도 | HEX | 설명 |
|------|-----|------|
| **배경** | `#0A0A14` | 깊은 다크 블루블랙 |
| **배경 그라데이션 하단** | `#0F0A1E` | 은은한 보라빛 |
| **레인 배경** | `#12122A` | 레인 영역 (배경보다 살짝 밝음) |
| **레인 구분선** | `#2A2A5E` (30% alpha) | 은은한 세로 구분 |
| **판정 라인** | `#FFFFFF` (80% alpha) | 밝은 수평선 |
| **판정 라인 글로우** | `#FFFFFF` (20% alpha) | 판정 라인 주변 발광 |
| **레인 1 노트** | `#FF1744` | 레드 네온 (좌) |
| **레인 2 노트** | `#2979FF` | 블루 네온 (중좌) |
| **레인 3 노트** | `#00E676` | 그린 네온 (중우) |
| **레인 4 노트** | `#FFAB00` | 앰버 네온 (우) |
| **Perfect 이펙트** | `#FFFFFF` → 레인 색상 | 밝은 백색 폭발 → 레인 색상 전환 |
| **Great 이펙트** | 레인 색상 (80% alpha) | 중간 밝기 폭발 |
| **Good 이펙트** | 레인 색상 (40% alpha) | 작은 반짝임 |
| **Miss 이펙트** | `#555555` | 회색 어둡게 |
| **HP 바 (높음)** | `#00E676` | 그린 |
| **HP 바 (중간)** | `#FFD740` | 옐로 |
| **HP 바 (낮음)** | `#FF1744` | 레드 |
| **콤보 텍스트** | `#00E5FF` | 시안 (콤보 숫자) |
| **콤보 글로우** | `#00E5FF` (20% alpha) | 시안 발광 |
| **점수 텍스트** | `#E0E0E0` | 밝은 회색 |
| **판정 텍스트 Perfect** | `#FFD740` | 골드 |
| **판정 텍스트 Great** | `#00E5FF` | 시안 |
| **판정 텍스트 Good** | `#AAAAAA` | 회색 |
| **판정 텍스트 Miss** | `#FF1744` | 레드 |
| **BPM 표시** | `#D500F9` | 퍼플 |
| **배경 파티클** | 레인 색상 4종 랜덤 | 비트에 맞춰 발생 |

### 4.2 배경 (비트 반응형)

| 레이어 | 내용 | 비트 반응 |
|--------|------|-----------|
| **베이스 배경** | 위→아래 그라데이션 (`#0A0A14` → `#0F0A1E`) | 베이스 킥에 밝기 펄스 |
| **격자 그리드** | 가로/세로 20px 간격 직선 (`#1A1A3E`, 15% alpha) | BPM에 맞춰 밝기 진동 |
| **원형 파동** | 판정 라인 중앙에서 방사형 확장 원 | Perfect/Great 히트 시 발생 |
| **부유 파티클** | 작은 원·삼각형 8~12개, 느린 상승 | 콤보 50+ 시 밀도 증가 |

- **Canvas 기본 크기:** `480 × 360px` (4:3 비율)
- 게임 영역: 전체 캔버스 (HUD는 게임 영역 위에 오버레이)
- 격자 그리드는 offscreen canvas 캐시 → 비트 반응은 globalAlpha 조절만으로 처리
- 원형 파동: ObjectPool 재활용 (풀 크기: 10)

### 4.3 오브젝트 형태 (순수 Canvas 드로잉 — SVG/외부 이미지 완전 미사용)

| 오브젝트 | 드로잉 방식 |
|----------|------------|
| **탭 노트** | 둥근사각형 52×16px, 레인 색상 fill + 밝은 테두리 2px + 상단 하이라이트(흰색 30% alpha, 1px) |
| **롱 노트 헤드** | 탭 노트와 동일 |
| **롱 노트 꼬리** | 레인 색상 50% alpha 직사각형 (52×가변), 세로 중앙에 밝은 선 1px |
| **동시 노트 연결선** | 2레인 사이 수평 점선 (`#FFFFFF` 40% alpha, 2px) |
| **판정 라인** | 수평 직선 (480px × 2px, 흰색 80%) + 위아래 글로우(6px, 20% alpha) |
| **레인 키 가이드** | 판정 라인 아래 D/F/J/K 글자 (`14px`, 40% alpha) — 키보드 모드에서만 |
| **Perfect 이펙트** | 백색 원 확장(0→40px, 200ms) + 레인 색상 파티클 6개 방사 + 판정 라인 플래시 |
| **Great 이펙트** | 레인 색상 원 확장(0→25px, 150ms) + 파티클 3개 |
| **Good 이펙트** | 레인 색상 원(15px, 100ms fadeOut) |
| **Miss 이펙트** | 레인 영역 적색 플래시(50ms) + 판정 라인 미세 셰이크 |
| **콤보 카운터** | 중앙 상단, 숫자 tween scaleUp(1.3→1.0, easeOutBack, 150ms) |
| **판정 텍스트** | 판정 라인 위 중앙, tween fadeUp(−20px) + fadeOut(400ms) |
| **HP 바** | 좌측 세로 바 8px, 둥근 끝, 색상 구간별 변화 |
| **BPM 표시** | 우하단 소형 텍스트 `"♪ 120 BPM"` |
| **배경 파동** | 반투명 원 확장 + fadeOut (레인 색상, 500ms) |

### 4.4 폰트
- **시스템 폰트 스택만 사용** (외부 CDN 의존 0개):
  ```
  'Segoe UI', system-ui, -apple-system, sans-serif
  ```
- 콤보 숫자: `32px bold`
- 판정 텍스트: `16px bold`
- 점수: `18px bold`
- HUD 보조 텍스트: `12px`
- 타이틀: `36px bold`
- BPM: `11px`
- 레인 키 가이드: `14px`

### 4.5 금지 목록 (에셋 자동 검증 대상)
- ❌ SVG 파일 / SVG 필터 (`feGaussianBlur`, `<filter>`)
- ❌ 외부 이미지 파일 (`.png`, `.jpg`, `.svg`, `.gif`)
- ❌ 외부 폰트 / Google Fonts / CDN
- ❌ 외부 음악/사운드 파일 (`.mp3`, `.ogg`, `.wav`)
- ❌ `setTimeout` / `setInterval` (게임 로직 — 오디오 스케줄링도 AudioContext.currentTime 사용)
- ❌ `confirm()` / `alert()` / `prompt()`
- ❌ `eval()`

---

## 5. 핵심 게임 루프 (초당 프레임 기준 로직 흐름)

### 5.1 메인 루프 (`requestAnimationFrame`)

```
function loop(timestamp) {
  const dt = min((timestamp - lastTime) / 1000, 0.05);  // 최대 50ms 캡
  lastTime = timestamp;

  switch (state) {
    case LOADING:       updateLoading();                                        break;
    case TITLE:         tw.update(dt); updateTitleBG(dt); renderTitle();        break;
    case PLAYING:       updateGame(dt); tw.update(dt); renderGame();            break;
    case PAUSE:         tw.update(dt); renderGame(); renderPause();             break;
    case CONFIRM_MODAL: tw.update(dt); renderGame(); renderModal();             break;
    case GAMEOVER:      tw.update(dt); renderGame(); renderGameover();          break;
  }

  rafId = requestAnimationFrame(loop);
}
```

### 5.2 updateGame(dt) 상세 흐름

```
1. BeatScheduler.update()
   → AudioContext.currentTime 기준 다음 비트 시간 계산
   → 비트 도달 시: 절차적 사운드 재생 (드럼/베이스/멜로디)
   → 새 노트 생성 (BeatMap에서 다음 노트 큐)
   → BPM 단계 체크: 경과 시간에 따라 BPM 상승

2. NoteManager.update(dt)
   → 활성 노트 y 위치 갱신: note.y += noteSpeed × dt
   → 판정 라인 통과 검사: if (note.y > judgeLine.y + missThreshold) → autoMiss(note)
   → 롱 노트 유지 판정: if (longNote.held && keyDown[lane]) → 지속 점수
   → 화면 밖 노트 → pool.release(note)

3. InputHandler.process()
   → 키다운/터치 이벤트 큐에서 입력 처리
   → 해당 레인의 가장 가까운 노트 검색
   → 타이밍 오차 = |AudioContext.currentTime - note.targetTime| × 1000 (ms)
   → 판정 등급 결정 (§2.4 테이블)
   → 콤보 업데이트 + HP 업데이트 + 점수 업데이트
   → 판정 이펙트 생성

4. ComboManager.update()
   → 콤보 카운터 표시 tween
   → 콤보 구간별 배경 비주얼 강화 레벨 업데이트
   → 콤보 배율 계산

5. HPManager.update()
   → HP 바 tween 업데이트
   → HP ≤ 0 && !transitioning → beginTransition(GAMEOVER)

6. BeatVisualizer.update(dt)
   → 비트 반응 배경 밝기 감쇠 (kickFlash -= dt × 4)
   → 격자 그리드 alpha 진동
   → 파동 이펙트 확장 + fadeOut
   → 부유 파티클 업데이트

7. Particles.update(dt)  // 판정 이펙트 파티클
```

### 5.3 입력 모드별 분기 (유령 코드 방지 — 사용처 명시)

```
변수: inputMode = 'keyboard' | 'mouse' | 'touch'

사용처 1: renderJudgeLine() — 키 가이드 표시
  keyboard → 판정 라인 아래에 D/F/J/K 글자 표시
  mouse/touch → 레인 영역 하이라이트(반투명 사각형) 표시

사용처 2: InputHandler — 입력 영역 크기
  keyboard → 키 입력만 처리 (영역 무관)
  mouse → 4등분 클릭 영역, 여백 0px
  touch → 4등분 탭 영역, 여백 확대(+8px 양쪽)

사용처 3: renderPause() / renderGameover() — 안내 텍스트
  keyboard → "P키로 재개" / "R키로 재시작"
  mouse → "클릭하여 재개" / "클릭하여 재시작"
  touch → "탭하여 재개" / "탭하여 재시작"

사용처 4: Pause 버튼 표시
  keyboard → P키 안내만 표시
  mouse/touch → 우상단 일시정지 아이콘 버튼 표시
```

### 5.4 렌더링 순서 (Z-order)

```
1. 배경 그라데이션                   — 비트 반응 밝기 조절
2. 격자 그리드                       — offscreen canvas, BPM 진동
3. 레인 배경 (4개 세로 영역)         — 입력 시 밝아짐
4. 원형 파동 이펙트                  — 판정 시 발생
5. 롱 노트 꼬리                     — 레인 색상 50% alpha
6. 탭 노트 / 롱 노트 헤드 / 동시 연결선  — 레인별 색상
7. 판정 라인                         — 흰색 + 글로우
8. 판정 이펙트 파티클                — 폭발, 플래시
9. 판정 텍스트 (PERFECT/GREAT 등)   — tween fadeUp
10. HP 바 (좌측 세로)               — 색상 구간별
11. 콤보 카운터 (중앙 상단)          — tween scaleUp
12. 점수 (우상단)                    — 변동 시 밝아짐
13. BPM 표시 (우하단)               — 소형 텍스트
14. 부유 파티클                      — 배경 위 떠다님
15. 오버레이 (일시정지/모달/게임오버) — 반투명 배경 위
```

---

## 6. 난이도 시스템

### 6.1 BPM 곡선 (핵심 난이도 드라이버)

| 경과 시간 | BPM | 노트 밀도 (노트/비트) | 비트 간격 (ms) | 체감 |
|-----------|-----|-----------------------|----------------|------|
| 0~15초 | 100 | 0.5 (2비트에 1노트) | 600 | 입문 — 여유로운 타이밍 |
| 15~30초 | 110 | 0.6 | 545 | 웜업 — 리듬 적응 |
| 30~60초 | 120 | 0.7 | 500 | 기본 — 안정적 리듬 |
| 60~90초 | 130 | 0.8 | 462 | 긴장 — 동시 노트 등장 |
| 90~120초 | 140 | 0.9 | 429 | 도전 — 빠른 반응 필요 |
| 120~150초 | 150 | 1.0 (매 비트 노트) | 400 | 열광 — 풀 밀도 |
| 150초+ | 160 (최대) | 1.0 | 375 | 극한 — 생존 모드 |

- BPM 전환: tween으로 부드럽게 증가 (이전 BPM → 다음 BPM, 4비트에 걸쳐)
- BPM 전환 시 시각 효과: BPM 텍스트 스케일 펄스 + 배경 밝기 플래시

### 6.2 노트 낙하 속도

```
noteSpeed (px/s) = 200 + (BPM - 100) × 1.5
  BPM 100 → 200 px/s (느림)
  BPM 120 → 230 px/s (기본)
  BPM 140 → 260 px/s (빠름)
  BPM 160 → 290 px/s (최대)

노트 생성 y: -20px (화면 위)
판정 라인 y: canvasHeight - 60px = 300px
낙하 거리: 320px

도달 시간 (BPM 120): 320 / 230 ≈ 1.39초 (반응 준비 시간)
도달 시간 (BPM 160): 320 / 290 ≈ 1.10초
```

### 6.3 절차적 비트맵 생성

```
비트맵 생성 알고리즘:
  1. 현재 BPM에서 다음 4마디(16비트) 분량의 노트 패턴 생성
  2. 난이도 레벨 = floor(elapsedTime / 15) (0~10, cap)
  3. 노트 배치 규칙:
     - 난이도 0~2: 단일 레인 탭 노트만, 2~4비트 간격
     - 난이도 3~4: 2레인까지 사용, 롱 노트 등장 (2~4비트 길이)
     - 난이도 5~6: 3레인 활용, 동시 노트 등장 (2레인)
     - 난이도 7~8: 4레인 풀 활용, 16분음표 등장
     - 난이도 9~10: 3레인 동시 + 롱 노트 + 빠른 연타
  4. 안전 규칙:
     - 4레인 동시 노트 금지 (물리적으로 입력 불가)
     - 동일 레인 연속 3노트 후 최소 1비트 휴식
     - 롱 노트 중 같은 레인에 탭 노트 배치 금지
     - BPM 전환 직후 2비트는 노트 밀도 50% 감소 (적응 시간)
```

### 6.4 동적 밸런스 보정

| 조건 | 효과 | UI 표시 |
|------|------|---------|
| **HP 30 이하** (위기) | 다음 4비트 노트 밀도 -30% | HP 바 깜빡임 + 화면 가장자리 적색 비네트 |
| **콤보 50 연속** | 배경 비주얼 강화 (파티클 밀도 2배) | "FEVER!" 텍스트 팝업 |
| **콤보 100 연속** | 배경 색상 반전 효과 (1초 tween) | "PERFECT FEVER!" 팝업 |
| **Miss 3연속** | 다음 2비트 노트 밀도 -50% | 격려 메시지 "Focus!" |

---

## 7. 점수 시스템

### 7.1 기본 점수 + 콤보 배율

| 판정 | 기본 점수 | 콤보 배율 공식 | 0콤보 | 50콤보 | 100콤보 |
|------|-----------|---------------|-------|--------|---------|
| **Perfect** | 300 | `300 × (1 + floor(combo / 10) × 0.1)` | 300 | 450 | 600 |
| **Great** | 200 | `200 × (1 + floor(combo / 10) × 0.1)` | 200 | 300 | 400 |
| **Good** | 100 | 100 (배율 없음) | 100 | 100 | 100 |
| **Miss** | 0 | 0 | 0 | 0 | 0 |

- **콤보 배율** = `1 + floor(combo / 10) × 0.1` (10콤보마다 +10%, 최대 ×3.0 = 200콤보)
- Good/Miss는 콤보 리셋 → 배율도 ×1.0으로 초기화
- 롱 노트 유지 보너스: 유지 중 비트마다 `50 × 콤보배율` 추가 점수

### 7.2 보너스 점수

| 행동 | 보너스 | 비고 |
|------|--------|------|
| Full Combo (게임 종료 시 Miss 0) | 총 점수 × 1.5 | 결과 화면에서 별도 표시 |
| Perfect 10연속 | +500 | "PERFECT STREAK!" 팝업 |
| 최대 콤보 갱신 | +200 | 플레이 중 최고 콤보 경신 시 |

### 7.3 변수 사용처 명시 (유령 코드 방지)

```
변수: combo (현재 콤보)
  갱신: InputHandler.process() — Perfect/Great 시 +1, Good/Miss 시 = 0
  사용: (1) 콤보 배율 계산, (2) 콤보 카운터 렌더링, (3) 배경 비주얼 강화 판정,
        (4) FEVER 트리거, (5) 결과 화면 최대 콤보

변수: maxCombo (최대 콤보)
  갱신: combo 증가 시 max(maxCombo, combo)
  사용: (1) 결과 화면 표시, (2) 최대 콤보 갱신 보너스 판정

변수: hp (체력)
  갱신: InputHandler.process() — 판정별 증감 (§2.5)
  사용: (1) HP 바 렌더링, (2) HP 색상 구간 판정, (3) 게임오버 판정,
        (4) 동적 밸런스 보정 트리거

변수: perfectCount / greatCount / goodCount / missCount
  갱신: InputHandler.process() — 판정 시 +1
  사용: (1) 결과 화면 판정 통계, (2) Full Combo 판정 (missCount === 0),
        (3) Perfect 10연속 보너스

변수: bpm (현재 BPM)
  갱신: BeatScheduler.update() — 경과 시간에 따라 단계적 증가
  사용: (1) 노트 낙하 속도 계산, (2) BPM 표시 렌더링, (3) 비트 간격 계산,
        (4) 비트 시각화 진동 주기

변수: elapsedTime (게임 경과 시간)
  갱신: updateGame(dt) — dt 누적
  사용: (1) BPM 단계 결정, (2) 난이도 레벨 계산, (3) 결과 화면 플레이 시간

변수: noteSpeed (노트 낙하 속도)
  갱신: BPM 변경 시 재계산: 200 + (bpm - 100) × 1.5
  사용: (1) NoteManager.update() 노트 y 갱신, (2) 노트 생성 시 targetTime 계산
```

### 7.4 최고 점수 처리 순서 (Cycle 2 B4 교훈 반영)

```javascript
// ⚠️ 반드시 이 순서 — "판정 먼저, 저장 나중에"
const isNewBest = score > getBest();           // 1. 판정
const isNewCombo = maxCombo > getBestCombo();  // 1b.
saveBest(score);                                // 2. 저장
saveBestCombo(maxCombo);                        // 2b.
if (isNewBest) showNewBestEffect();             // 3. 연출
```

### 7.5 localStorage 키
- `br_bestScore` — 최고 점수
- `br_bestCombo` — 최고 콤보
- `br_totalPlays` — 총 플레이 횟수
- `br_totalPerfects` — 누적 Perfect 수 (통계용)
- 모든 접근은 `try { ... } catch(e) { /* silent */ }` 래핑

---

## 8. 상태 × 시스템 업데이트 매트릭스 ⭐

> **Cycle 2 B1/B2의 근본 원인 해결. Cycle 3~4에서 효과 검증 완료.** 이 매트릭스는 코드 상단 주석으로도 그대로 복사할 것.

| 게임 상태 | TweenMgr | BeatSched | NoteMgr | Input | ComboMgr | HPMgr | BeatViz | Particles | Render | Audio |
|-----------|----------|-----------|---------|-------|----------|-------|---------|-----------|--------|-------|
| **LOADING** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | loading화면 | ✗ |
| **TITLE** | **✓** | ✗ | ✗ | start만 | ✗ | ✗ | 느린 배경만 | ✗ | title화면 | ✗ |
| **PLAYING** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | game | **✓** |
| **PAUSE** | **✓** | ✗ (suspend) | ✗ | resume만 | ✗ | ✗ | 정지 | ✗ | game+pause오버레이 | suspend |
| **CONFIRM_MODAL** | **✓** | ✗ (suspend) | ✗ | 예/아니오 | ✗ | ✗ | 정지 | ✗ | game+modal오버레이 | suspend |
| **GAMEOVER** | **✓** | ✗ | ✗ | restart만 | ✗ | ✗ | 느린 감쇠 | **✓** | game+결과화면 | ✗ |

> **핵심 규칙:**
> 1. TweenManager는 **모든 상태에서 항상 업데이트**한다.
> 2. BeatScheduler/AudioContext는 PAUSE/CONFIRM_MODAL에서 **suspend**(일시중지)하고 resume 시 재개한다.
> 3. GAMEOVER에서 Particles는 업데이트하여 마지막 이펙트가 자연스럽게 사라지게 한다.

---

## 9. 상태 전환 흐름 (setTimeout 완전 금지)

```
LOADING ──(Canvas + AudioContext 초기화 완료)──→ TITLE

TITLE ──(Enter/Space/클릭/탭)──→ PLAYING
        (tween: 타이틀 fadeOut 300ms onComplete)
        (enterState(PLAYING): AudioContext.resume(), BeatScheduler.start())

PLAYING ──(HP ≤ 0 && !transitioning)──→ GAMEOVER
          (tween: 화면 적색 플래시 0.5초 + 슬로모 감속 onComplete)
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
      enterState(targetState);  // ← 신규: 상태 진입 초기화
      if (tweenConfig.onComplete) tweenConfig.onComplete();
    });
  } else {
    state = targetState;
    transitioning = false;
    enterState(targetState);    // ← 신규
  }
  return true;
}

// 신규: 상태 진입 시 초기화 (Cycle 4 타이틀 글로우 미복구 해결)
function enterState(s) {
  switch(s) {
    case TITLE:
      pulseTitle();             // 타이틀 글로우 tween 시작
      audioCtx?.suspend();
      break;
    case PLAYING:
      audioCtx?.resume();
      beatScheduler.start();
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

### 10.2 TweenManager (Cycle 4 계승 + clearImmediate 신규 ⭐)

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
      tw.elapsed += dt * 1000;
      const t = Math.min(1, tw.elapsed / tw.duration);
      const e = EASING[tw.easing](t);
      // ... lerp 적용 ...
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
  tapNote:   new ObjectPool(() => new TapNote(), 40),
  longNote:  new ObjectPool(() => new LongNote(), 10),
  particle:  new ObjectPool(() => new Particle(), 60),
  wave:      new ObjectPool(() => new Wave(), 10)
};
```

### 10.4 BeatScheduler — 절차적 비트 생성 (핵심 신규 시스템 ⭐)

```javascript
class BeatScheduler {
  constructor(audioCtx) {
    this.ctx = audioCtx;
    this.bpm = 100;
    this.beatIndex = 0;
    this.nextBeatTime = 0;      // AudioContext.currentTime 기준
    this.scheduleAhead = 0.1;   // 100ms 미리 스케줄링
    this.lookAhead = 0.05;      // 50ms마다 체크
  }

  start() {
    this.nextBeatTime = this.ctx.currentTime + 0.5;  // 0.5초 준비 시간
    this.beatIndex = 0;
  }

  update() {
    const currentTime = this.ctx.currentTime;
    // 미리 스케줄링 (정확한 타이밍 보장)
    while (this.nextBeatTime < currentTime + this.scheduleAhead) {
      this.scheduleBeat(this.nextBeatTime);
      this.nextBeatTime += 60 / this.bpm;  // 비트 간격
      this.beatIndex++;
    }
    // BPM 단계 체크
    this.updateBPM();
  }

  scheduleBeat(time) {
    // 1. 사운드 스케줄링 (Web Audio API)
    const beatInBar = this.beatIndex % 4;  // 4/4 박자
    playDrumBeat(this.ctx, time, beatInBar);
    if (this.beatIndex % 2 === 0) playBassBeat(this.ctx, time);
    if (shouldPlayMelody(this.beatIndex)) playMelodyNote(this.ctx, time);

    // 2. 노트 생성 (비트맵 알고리즘)
    const notePattern = generateNotePattern(this.beatIndex, this.difficulty);
    notePattern.forEach(({ lane, type, duration }) => {
      spawnNote(lane, type, time, duration);
    });

    // 3. 비주얼 이벤트 큐 추가
    queueBeatVisual(time, beatInBar);
  }

  updateBPM() {
    const targetBPM = getBPMForTime(elapsedTime);  // §6.1 테이블
    if (targetBPM !== this.bpm) {
      // tween으로 부드러운 BPM 전환 (4비트에 걸쳐)
      tw.add(this, { bpm: targetBPM }, (60/this.bpm) * 4 * 1000,
             'easeOutQuad');
    }
  }
}
```

### 10.5 Web Audio API — 절차적 음악 생성 ⭐

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
const masterGain = audioCtx.createGain();
masterGain.gain.value = 0.3;
masterGain.connect(audioCtx.destination);

// === 드럼 트랙 ===
function playDrumBeat(ctx, time, beatInBar) {
  try {
    if (beatInBar === 0 || beatInBar === 2) {
      // 킥 (바스 드럼): 저음 사인파 급감쇠
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(time); osc.stop(time + 0.15);
    }
    if (beatInBar === 1 || beatInBar === 3) {
      // 스네어: 노이즈 버스트 시뮬레이션 (높은 주파수 사각파)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, time);
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(time); osc.stop(time + 0.08);
    }
    // 하이햇: 매 비트마다
    const hihat = ctx.createOscillator();
    const hGain = ctx.createGain();
    hihat.type = 'square';
    hihat.frequency.setValueAtTime(800, time);
    hGain.gain.setValueAtTime(0.05, time);
    hGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    hihat.connect(hGain); hGain.connect(masterGain);
    hihat.start(time); hihat.stop(time + 0.03);
  } catch(e) { /* silent */ }
}

// === 베이스 트랙 ===
const BASS_NOTES = [55, 65.4, 73.4, 82.4, 55, 82.4, 73.4, 65.4]; // Am 진행
function playBassBeat(ctx, time) {
  try {
    const freq = BASS_NOTES[(beatScheduler.beatIndex / 2) % BASS_NOTES.length | 0];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(time); osc.stop(time + 0.25);
  } catch(e) { /* silent */ }
}

// === 멜로디 트랙 (난이도 3+ 에서 등장) ===
const MELODY_SCALE = [220, 261.6, 293.7, 329.6, 392, 440, 523.3]; // Am 스케일
function playMelodyNote(ctx, time) {
  try {
    const freq = MELODY_SCALE[Math.floor(Math.random() * MELODY_SCALE.length)];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.linearRampToValueAtTime(0.06, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(time); osc.stop(time + 0.3);
  } catch(e) { /* silent */ }
}

// === 판정 효과음 ===
function sfxPerfect() { /* 고음 화음: 880+1320Hz, 100ms, sine, 볼륨 0.15 */ }
function sfxGreat()   { /* 중음: 660Hz, 80ms, triangle, 볼륨 0.1 */ }
function sfxMiss()    { /* 저음 불협: 120Hz, 60ms, sawtooth, 볼륨 0.08 */ }
```

- 모든 SFX/음악 호출은 `try-catch` 래핑 — 오디오 실패 시 시각 판정만으로 게임 정상 동작
- PLAYING 상태에서만 음악 재생 (매트릭스 참조)
- PAUSE 시 `audioCtx.suspend()`, 재개 시 `audioCtx.resume()`

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
┌──────────────────────────────────────────────────────┐
│ HP     ⭐ 12,450              87 COMBO          [⏸] │
│ ║                                                    │
│ ║            ┌──┐  ┌──┐  ┌──┐  ┌──┐                │
│ ║            │  │  │  │  │  │  │  │  ← 낙하 노트   │
│ ║            │  │  │  │  │  │  │  │                  │
│ ║            └──┘  └──┘  └──┘  └──┘                  │
│ ║                                                    │
│ ║          ══════════════════════════  ← 판정 라인   │
│ ║            D      F      J      K   ← 키 가이드   │
│ ║                                                    │
│ ║                PERFECT!              ← 판정 텍스트 │
│ ║                                         ♪ 120 BPM │
└──────────────────────────────────────────────────────┘
```

- 점수: 우상단 `#E0E0E0`, `18px bold`, 변동 시 잠시 밝아짐 tween
- 콤보: 중앙 상단 `#00E5FF`, `32px bold`, +1 시 scaleUp tween (1.3→1.0, easeOutBack, 150ms)
- HP 바: 좌측 세로 8px, 색상 구간별 변화
- 판정 텍스트: 판정 라인 위 중앙, 판정별 색상, tween fadeUp(-20px) + fadeOut(400ms)
- BPM: 우하단 `#D500F9`, `11px`
- 일시정지 버튼: 우상단 20×20px (마우스/터치 모드에서만)

### 11.2 타이틀 화면

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              ╔═══════════════════════╗                │
│              ║    비  트  러  시     ║                │
│              ║     BEAT RUSH        ║                │
│              ╚═══════════════════════╝                │
│                     ♪ ♫ ♪                            │
│           BEST: 24,800pts  |  142 COMBO              │
│                                                      │
│           [SPACE / 탭으로 시작]                       │
│                                                      │
│      D  F  J  K : 4레인 입력   P : 일시정지          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- 타이틀 텍스트: tween 글로우 펄스 (alpha 0.7 → 1.0 반복) + 레인 4색 순차 변화
- 배경: 느린 격자 그리드 + 부유 파티클 (리듬감 암시)
- 음표 아이콘: Canvas 드로잉 (♪ 형태 — arc + line)
- 최고 기록: 0이면 표시 안 함

### 11.3 게임오버 / 결과 화면

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              ╔══════════════════╗                     │
│              ║   STAGE CLEAR   ║  (또는 GAME OVER)   │
│              ╚══════════════════╝                     │
│                                                      │
│           점수:    24,800                            │
│           최대 콤보: 142                              │
│           플레이 시간: 2:35                           │
│                                                      │
│        Perfect: 187  Great: 43  Good: 12  Miss: 5    │
│                                                      │
│           🏆 NEW BEST! (이전: 18,200)                │
│                                                      │
│          [R키 / 탭으로 재시작]                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- 결과 텍스트: tween 순차 fadeIn (점수 → 콤보 → 시간 → 판정, 각 200ms 딜레이)
- NEW BEST: easeOutElastic 스케일 연출 (0 → 1.2 → 1.0)
- Full Combo 달성 시: "★ FULL COMBO ★" 특별 텍스트 (골드, easeOutElastic)
- 배경: 마지막 게임 화면 위에 반투명 검정 오버레이 (`#000000` 70% alpha)
- HP가 0이 아닌 경우 (시간 기반 종료는 없으므로 항상 GAME OVER)

---

## 12. 사이드바 메타데이터 (게임 페이지용)

```yaml
game:
  title: "비트 러시"
  description: "비트에 맞춰 노트를 쳐라! Web Audio API로 매번 새롭게 생성되는 음악에 맞춰 4레인 노트를 타이밍에 맞게 입력하는 리듬 아케이드. BPM이 올라갈수록 손가락이 바빠진다!"
  genre: ["arcade", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "D·F·J·K: 4레인 입력"
    - "키 홀드: 롱 노트 유지"
    - "P / ESC: 일시정지"
    - "터치: 레인 영역 탭/홀드"
    - "마우스: 레인 영역 클릭"
  tags:
    - "#리듬게임"
    - "#비트"
    - "#음악"
    - "#아케이드"
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
- [ ] 4레인 노트 낙하 시스템
- [ ] 탭 노트 / 롱 노트 / 동시 노트 3종
- [ ] AudioContext.currentTime 기반 타이밍 판정 (Perfect/Great/Good/Miss)
- [ ] BeatScheduler — 절차적 비트 생성 + 노트 스케줄링
- [ ] Web Audio API 절차적 음악 생성 (드럼/베이스/멜로디 3트랙)
- [ ] 콤보 시스템 + 콤보 배율 (10콤보당 +10%, 최대 ×3.0)
- [ ] HP 게이지 시스템 (회복/감소/게임오버)
- [ ] BPM 단계적 상승 (100 → 160, 15초 간격)
- [ ] 절차적 비트맵 생성 (난이도별 노트 패턴 + 안전 규칙)
- [ ] 동적 밸런스 보정 (HP 30 이하 밀도 감소, 콤보 50 FEVER)
- [ ] 점수 시스템 + localStorage 최고 기록
- [ ] 6상태 게임 상태 머신
- [ ] TweenManager (**clearImmediate() 포함** — Cycle 4 B1 해결)
- [ ] ObjectPool (노트, 파티클, 파동)
- [ ] TransitionGuard 패턴 (가드 플래그 + 상태 우선순위)
- [ ] enterState() 패턴 (상태 진입 시 초기화 일원화 — Cycle 4 글로우 미복구 해결)
- [ ] Canvas 기반 모달 (confirm 대체)
- [ ] 상태 × 시스템 매트릭스 코드 주석 포함
- [ ] game.destroy() + 리스너 cleanup
- [ ] 키보드/마우스/터치 입력 자동 감지 및 분기 동작

### 13.2 시각/연출 (필수)
- [ ] 네온 사이버 비주얼 (순수 Canvas 드로잉)
- [ ] 레인별 색상 (레드/블루/그린/앰버)
- [ ] 판정별 이펙트 차별화 (Perfect 폭발 → Miss 어둡게)
- [ ] 비트 반응형 배경 (킥 밝기 펄스, 격자 진동)
- [ ] 원형 파동 이펙트 (Perfect/Great 히트 시)
- [ ] 콤보 카운터 scaleUp tween
- [ ] 판정 텍스트 fadeUp + fadeOut
- [ ] HP 바 색상 구간 변화 + 저HP 깜빡임
- [ ] BPM 전환 시 시각 효과
- [ ] 게임오버 순차 fadeIn 결과 연출
- [ ] NEW BEST easeOutElastic 연출
- [ ] 부유 파티클 (콤보에 따라 밀도 변화)
- [ ] offscreen canvas 격자 그리드 캐시

### 13.3 사운드 (핵심 — 리듬 게임 특성상 필수)
- [ ] Web Audio API 절차적 드럼 (킥/스네어/하이햇)
- [ ] Web Audio API 절차적 베이스 (Am 진행)
- [ ] Web Audio API 절차적 멜로디 (Am 스케일 랜덤)
- [ ] 판정 효과음 3종 (Perfect/Great/Miss)
- [ ] AudioContext.currentTime 기반 비트 스케줄링 (setTimeout 절대 금지)
- [ ] PAUSE 시 audioCtx.suspend() / resume 시 audioCtx.resume()
- [ ] try-catch 래핑 (모든 오디오 호출)
- [ ] 첫 인터랙션에서 AudioContext 초기화
- [ ] 오디오 실패 시 시각 판정만으로 게임 정상 동작

### 13.4 기획서 대조 체크리스트 (코드 리뷰 시) ⭐
- [ ] 모든 상태에서 `tw.update(dt)` 호출 확인 (매트릭스 대조)
- [ ] `setTimeout` / `setInterval` 사용 0건 확인
- [ ] `confirm()` / `alert()` 사용 0건 확인
- [ ] SVG / 외부 이미지 / 외부 폰트 / 외부 사운드 사용 0건 확인
- [ ] 점수 판정→저장 순서 확인 (`isNewBest` 먼저)
- [ ] `beginTransition()` 헬퍼로 모든 상태 전환 처리 확인
- [ ] `enterState()` 함수에서 모든 상태의 초기화 로직 확인
- [ ] `transitioning` 가드 플래그가 모든 tween 전환에 적용 확인
- [ ] `STATE_PRIORITY` 맵 정의 및 우선순위 검사 동작 확인
- [ ] `clearImmediate()` 가 resetGame()에서 사용되는지 확인 (**cancelAll 아님!**)
- [ ] destroy() 패턴으로 모든 리스너 정리 확인 (`registeredListeners` 사용)
- [ ] 이징 함수 5종 모두 구현 확인
- [ ] **선언된 모든 변수의 갱신/사용처 확인** (유령 변수 방지 — §7.3 대조)
  - `combo`: 5개 사용처 모두 구현 확인
  - `maxCombo`: 2개 사용처 확인
  - `hp`: 4개 사용처 확인
  - `bpm`: 4개 사용처 확인
  - `elapsedTime`: 3개 사용처 확인
  - `noteSpeed`: 2개 사용처 확인
  - `inputMode`: 4개 사용처 확인
  - `perfectCount/greatCount/goodCount/missCount`: 3개 사용처 확인
- [ ] Canvas 기반 모달만 사용 확인
- [ ] PAUSE/CONFIRM_MODAL에서 audioCtx.suspend() 확인
- [ ] 4레인 동시 노트 금지 규칙 구현 확인
- [ ] 롱 노트 중 같은 레인 탭 노트 금지 확인

### 13.5 자동 검증 스크립트 (Cycle 4 제안 — 실제 도입 ⭐)

> 3사이클 연속 SVG 재발로 "기획서 명시만으로는 불가"가 확정되었다. 코드 리뷰 전 아래 명령어를 반드시 실행한다.

```bash
# 금지 패턴 검사 (모두 0건이어야 PASS)
echo "=== 금지 패턴 자동 검증 ==="
echo "--- setTimeout/setInterval ---"
grep -cn "setTimeout\|setInterval" games/beat-rush/index.html
echo "--- confirm/alert/prompt ---"
grep -cn "confirm(\|alert(\|prompt(" games/beat-rush/index.html
echo "--- SVG / 외부 이미지 ---"
grep -cn "\.svg\|\.png\|\.jpg\|\.gif\|feGaussianBlur\|<filter" games/beat-rush/index.html
echo "--- 외부 폰트/CDN ---"
grep -cn "fonts.googleapis\|cdn\.\|<link.*stylesheet" games/beat-rush/index.html
echo "--- 외부 사운드 파일 ---"
grep -cn "\.mp3\|\.ogg\|\.wav\|Audio(" games/beat-rush/index.html
echo "--- eval ---"
grep -cn "eval(" games/beat-rush/index.html
echo "=== 모든 항목 0이면 PASS ==="
```

---

## 14. 예상 코드 규모

```
예상 줄 수: ~1,000~1,200줄

구조 분배:
  - 상수/설정:           ~80줄   (색상, BPM 테이블, 판정 기준ms, 노트 스탯, 스케일 음계)
  - TweenManager:        ~70줄   (clearImmediate 포함, 이징 5종)
  - ObjectPool:          ~30줄   (Cycle 3~4 계승)
  - TransitionGuard:     ~35줄   (beginTransition + enterState + STATE_PRIORITY)
  - BeatScheduler:       ~100줄  (절차적 비트 생성 + BPM 관리 + 노트 스케줄링)
  - Web Audio 음악 생성:  ~90줄   (드럼 3종 + 베이스 + 멜로디 + 판정 SFX 3종)
  - NoteManager:         ~80줄   (노트 낙하 + 자동 Miss + 롱 노트 유지)
  - InputHandler:        ~90줄   (키보드/마우스/터치 + 타이밍 판정 + 모드 분기)
  - 절차적 비트맵 생성:   ~80줄   (난이도별 패턴 + 안전 규칙 + 동적 밸런스)
  - ComboManager:        ~40줄   (콤보 + 배율 + FEVER)
  - HPManager:           ~30줄   (HP 증감 + 게임오버 판정)
  - UI/HUD:              ~80줄   (콤보, 판정 텍스트, HP 바, 점수, BPM)
  - 렌더링:              ~120줄  (배경, 노트, 판정 라인, 파동, 파티클)
  - 상태 머신/루프:       ~50줄   (6상태 + 메인 루프 + enterState)
  - destroy/init:        ~35줄   (라이프사이클 관리)
```

---

## 15. 리스크 및 대응 계획

| 리스크 | 발생 확률 | 영향 | 대응 |
|--------|-----------|------|------|
| 절차적 음악이 듣기 불쾌할 수 있음 | 중간 | 플레이 만족도 저하 | Am 마이너 키로 고정, 불협화음 배제, 볼륨 낮게(0.3) |
| AudioContext.currentTime 정밀도 부족 | 낮음 | 판정 오차 | 판정 기준을 ±30ms Perfect로 관대하게 설정 |
| 모바일에서 터치 레이턴시 | 중간 | 판정 불공정 | 터치 모드에서 판정 보정 +15ms 오프셋 적용 |
| BPM 160에서 노트 과밀 | 낮음 | 시각적 혼잡 | 최대 BPM에서도 매 비트 1노트 제한, 4레인 동시 금지 |
| 오디오 미지원 브라우저 | 낮음 | 음악 없이 플레이 | 시각 판정 + 시각 비트(배경 펄스)로 대체 가능 설계 |
