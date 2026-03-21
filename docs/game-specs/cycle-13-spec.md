---
game-id: hangul-word-quest
title: 한글 워드 퀘스트
genre: puzzle
difficulty: medium
---

# 한글 워드 퀘스트 — 상세 기획서 (Cycle 13)

---

## §0. 이전 사이클 피드백 반영 매핑

| # | 출처 | 문제/제안 | 이번 기획 반영 방법 |
|---|------|----------|-------------------|
| 1 | Cycle 13 분석 보고서 | **워드 퍼즐 장르 0% — 최대 시장 격차** | ✅ 본 게임으로 플랫폼 최초 워드 퍼즐 장르 추가. 시장 CAGR 9% |
| 2 | Cycle 13 분석 보고서 | **arcade 53.8% 과잉 편중** | ✅ 순수 puzzle 태그. arcade 비중 자연 하락 (7/14 = 50%) |
| 3 | Cycle 13 분석 보고서 | **puzzle 장르 부족 (23.1%)** | ✅ puzzle 3→4개 (4/14 = 28.6%)로 보강 |
| 4 | Cycle 12 포스트모템 | **assets/ 디렉토리 12사이클 연속 재발** | §11.1 — 100% Canvas 텍스트 렌더링. 이미지/SVG 에셋 0개. assets/ 디렉토리 생성 절대 금지 |
| 5 | Cycle 12 포스트모템 | **CI pre-commit 훅 실제 배포** | §11.2 — `.git/hooks/pre-commit`에 assets/ 검증 스크립트 등록 + 등록 여부 자체를 검증 항목에 포함 |
| 6 | Cycle 12 포스트모템 | **시뮬레이션 장르 도전 제안** | 검토 후 우선순위 변경 — 분석 보고서 기준 워드 퍼즐이 시장 격차가 더 큼 |
| 7 | Cycle 12 포스트모템 | **공용 엔진 모듈 분리 제안** | §11.10 — 본 기획 범위 외(별도 태스크). 동일 인터페이스(TweenManager, TransitionGuard) 유지 |
| 8 | Cycle 12 포스트모템 | **WCAG 터치 타겟 44×44px 미달** | §4.6 — 모든 터치 인터랙션 최소 48×48px 강제 (44px 이상 보장) |
| 9 | Cycle 12 포스트모템 | **데드 코드(빈 if 블록) 잔존** | §11.3 — 빈 블록 금지. 임시 코드 시 `// TODO:` 주석 필수, 최종 빌드 전 TODO 전수 제거 |
| 10 | Cycle 12 포스트모템 | **2회 리뷰 소요 → 1회차 통과 목표** | §11 전체 — 사전 검증 체크리스트 34항목으로 1회차 APPROVED 목표 |
| 11 | platform-wisdom [Cycle 1~12] | **assets/ 13사이클 연속 재발 차단** | §11.1 — 텍스트 기반 게임이므로 에셋 자체가 불필요. Canvas drawText/fillRect만 사용 |
| 12 | platform-wisdom [Cycle 1] | **iframe 내 confirm()/alert() 금지** | 모든 모달은 Canvas 기반 커스텀 UI. `confirm()`/`alert()` 사용 0건 |
| 13 | platform-wisdom [Cycle 2] | **상태×시스템 매트릭스 필수** | §5.3 — 5상태 × 4시스템 매트릭스 포함 |
| 14 | platform-wisdom [Cycle 3] | **tween onComplete 가드 플래그** | §5.2 — `_transitioning` 가드 플래그. 이중 호출 차단 |
| 15 | platform-wisdom [Cycle 4] | **cancelAll+add 경쟁 조건** | §11.4 — clearImmediate() 즉시 정리 후 add |
| 16 | platform-wisdom [Cycle 2] | **setTimeout 상태 전환 금지** | §5 — 턴 기반이라 타이머 불필요. 지연 전환은 tween onComplete 전용 |
| 17 | platform-wisdom [Cycle 5] | **단일 값 갱신 경로 통일** | 하나의 값은 tween OR 직접 대입 중 하나만 사용 |
| 18 | platform-wisdom [Cycle 6-7] | **순수 함수 원칙** | §10 — 모든 게임 로직 함수는 파라미터 기반 순수 함수 |
| 19 | platform-wisdom [Cycle 7] | **기획-구현 수치 정합성** | §6 — CONFIG 객체에 상수 집중. 기획서 수치와 1:1 대조 |
| 20 | platform-wisdom [Cycle 8] | **beginTransition() 경유 원칙** | §5.2 — 모든 전환이 beginTransition() 경유. 즉시 전환도 `immediate:true` |
| 21 | platform-wisdom [Cycle 10] | **수정 회귀 방지** | §11.8 — 함수 시그니처 변경 시 호출부 전수 검증 |
| 22 | platform-wisdom [Cycle 11] | **let/const TDZ 크래시 방지** | §11.7 — 모든 변수는 최초 참조 이전에 선언 |
| 23 | platform-wisdom [Cycle 2-3] | **유령 변수 방지** | §11.3 — 선언 변수 사용처 전수 검증 |
| 24 | platform-wisdom [Cycle 10] | **게임 루프 try-catch 래핑** | §11.9 — `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` |
| 25 | platform-wisdom [Cycle 11] | **dt 파라미터 전달** | 모든 렌더/업데이트 함수에 dt 파라미터 전달 |
| 26 | platform-wisdom [Cycle 12] | **반복 호출 내 I/O 접근 금지** | localStorage 읽기는 화면 진입 시 1회 캐싱 |
| 27 | platform-wisdom [Cycle 12] | **"절반 구현" 방지** | §11.5 — 기능별 세부 체크리스트(A: ☐, B: ☐) 항목 분리 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
한국어 단어를 자모(초성·중성·종성) 단위로 풀어서 맞추는 **턴 기반 워드 퍼즐**. Wordle의 검증된 게임 루프(추측→색상 피드백→추론)에 **한글 자모 분해**라는 독자적 메카닉을 결합한다. 매일 바뀌는 일일 챌린지와 무제한 연습 모드를 제공하며, 결과를 이모지 그리드로 공유하여 바이럴을 유도한다. 1판 약 2~5분, 짧고 중독성 있는 세션.

### 핵심 재미 3요소
1. **추론의 쾌감**: 색상 피드백(초록/노랑/회색)으로 자모 위치를 좁혀가는 논리적 추론 과정이 "유레카" 순간을 만든다
2. **한글 자모 탐험**: "가" → ㄱ+ㅏ, "한" → ㅎ+ㅏ+ㄴ 으로 풀어쓰기 하면서 한글 구조를 자연스럽게 체감. 외국인 학습자에게도 어필 가능
3. **일일 의식(Ritual)**: 매일 같은 단어로 전 세계 플레이어와 경쟁 → 통계 누적 → "N일 연속" 스트릭이 재방문을 유도

### 레퍼런스
- **Wordle (NYT)**: 5글자 영단어 맞추기의 원조. 색상 피드백 + 6회 시도 + 일일 1문제 + 이모지 공유
- **꼬들 (kordle.kr)**: 한국어 풀어쓰기 워들. 6칸 자모 분해 방식
- **한들 (handle)**: 한국어 워들 변형. 음절 단위 피드백

### 차별화 포인트
- **이중 피드백 시스템**: 자모 단위 색상 + 음절 단위 보조 힌트(해당 음절의 자모가 모두 맞으면 음절 테두리 강조)
- **초성 퀴즈 모드**: 초성 N개가 주어지고 단어를 맞추는 보너스 모드 (예: ㅎㄱ → 한글)
- **난이도 선택**: 2글자(쉬움) / 3글자(보통) / 4글자(어려움) — 입문자부터 고수까지

### 게임 페이지 사이드바 정보
```yaml
title: "한글 워드 퀘스트"
description: "한글 자모를 풀어서 숨겨진 단어를 맞춰라! 매일 새로운 단어 도전, 이모지로 결과를 공유하세요."
genre: ["puzzle"]
playCount: 0
rating: 0
controls:
  - "키보드: 한글 자모 직접 입력 / Enter 제출 / Backspace 삭제"
  - "마우스: 화면 내 가상 키보드 클릭"
  - "터치: 화면 내 가상 키보드 터치"
tags:
  - "#워드퍼즐"
  - "#한글"
  - "#데일리챌린지"
  - "#퍼즐"
  - "#두뇌게임"
addedAt: "2026-03-21"
version: "1.0.0"
featured: true
```

---

## §2. 게임 규칙 및 목표

### 2.1 기본 규칙
- 숨겨진 한국어 단어를 **자모(초성·중성·종성) 단위로 풀어서** 맞춘다
- 한국어 2~4글자 단어 → 자모로 풀어쓰면 **4~12칸** (난이도별 상이)
- **시도 횟수**: 6회 (모든 난이도 동일)
- 각 시도 후 칸별 색상 피드백이 즉시 표시된다

### 2.2 자모 분해 규칙
```
"한글" → ㅎ ㅏ ㄴ ㄱ ㅡ ㄹ  (6칸)
"사과" → ㅅ ㅏ ㄱ ㅘ         (4칸) — ㅘ는 복합 모음으로 1칸
"닭"  → ㄷ ㅏ ㄹ ㄱ         (4칸) — 겹받침 분리
```
- 복합 모음(ㅘ, ㅙ, ㅚ, ㅝ, ㅞ, ㅟ, ㅢ)은 **1칸**으로 취급
- 겹받침(ㄳ, ㄵ, ㄶ, ㄺ, ㄻ, ㄼ, ㄽ, ㄾ, ㄿ, ㅀ, ㅄ)은 **2칸으로 분리**
- 쌍자음(ㄲ, ㄸ, ㅃ, ㅆ, ㅉ)은 **1칸** (단일 자소)

### 2.3 색상 피드백 시스템
| 색상 | 의미 | HEX |
|------|------|-----|
| 🟩 **초록** | 정확한 위치에 정확한 자모 | `#538D4E` |
| 🟨 **노랑** | 단어에 포함되지만 다른 위치 | `#B59F3B` |
| ⬛ **회색** | 단어에 포함되지 않음 | `#3A3A3C` |
| 🔲 **빈 칸** | 아직 미입력 | `#121213` (테두리 `#3A3A3C`) |
| ✏️ **입력 중** | 현재 행에 입력된 자모 | `#121213` (테두리 `#565656`) |

### 2.4 음절 보조 힌트
- 한 음절을 구성하는 모든 자모가 🟩(정확한 위치)이면 → 해당 음절 영역에 **밝은 테두리 글로우** 표시
- 시각적 보상 + 진행 상황 파악 보조

### 2.5 승리/패배 조건
- **승리**: 6회 이내에 모든 자모를 정확한 위치에 맞춤
- **패배**: 6회 시도 소진 후에도 미완성 → 정답 공개

### 2.6 게임 모드
| 모드 | 설명 | 단어 수 |
|------|------|---------|
| **일일 챌린지** | 매일 자정(KST) 기준 1문제. 시드 = `YYYYMMDD`. 전 플레이어 동일 단어 | 1/일 |
| **무한 모드** | 랜덤 단어. 연습용 무제한 | 무제한 |
| **초성 퀴즈** | 초성 N개가 힌트로 주어짐. 해당 초성으로 시작하는 단어 맞추기 | 무제한 |

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 동작 |
|----|------|
| **한글 자모 키** (ㄱ~ㅎ, ㅏ~ㅣ) | 현재 칸에 자모 입력 |
| **Enter** | 현재 행 제출 (칸이 모두 채워진 경우) |
| **Backspace** | 마지막 입력 자모 삭제 |
| **Escape** | 일시정지 메뉴 (PLAYING 상태에서만) |

### 3.2 마우스
| 동작 | 설명 |
|------|------|
| **가상 키보드 클릭** | 자모 입력 (물리 키보드 없는 데스크톱) |
| **Enter/Backspace 버튼 클릭** | 제출/삭제 |
| **메뉴 버튼 클릭** | 모드 선택, 난이도 변경, 통계 확인 |

### 3.3 터치 (모바일)
| 동작 | 설명 |
|------|------|
| **가상 키보드 탭** | 자모 입력 |
| **Enter/Backspace 탭** | 제출/삭제 |
| **스와이프 업** | 통계 패널 열기 |
| **메뉴 버튼 탭** | 모드/난이도/설정 |

> ⚠️ 모든 터치 타겟: **최소 48×48px** (WCAG 2.1 AA 준수, Cycle 12 교훈 반영)

---

## §4. 시각적 스타일 가이드

### 4.1 전체 톤
- **다크 모드 기본**: 어두운 배경 위에 밝은 텍스트와 색상 피드백이 돋보이는 구성
- Wordle의 검증된 시각 언어를 기반으로, 네온 악센트로 InfiniTriX 브랜드 통일감

### 4.2 색상 팔레트
```
배경:        #121213 (거의 블랙)
카드/패널:   #1A1A1B
테두리:      #3A3A3C (비활성) / #565656 (활성)
정답(초록):  #538D4E
포함(노랑):  #B59F3B
미포함(회색): #3A3A3C
텍스트:      #FFFFFF (주) / #818384 (보조)
악센트:      #00D4FF (네온 시안 — 타이틀, 버튼 하이라이트)
악센트2:     #FF6B9D (네온 핑크 — 스트릭 카운터, 공유 버튼)
```

### 4.3 타이포그래피 (Canvas 렌더링)
- **시스템 폰트 스택**: `'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif`
- 외부 폰트 로드 0건 (Cycle 1 교훈)
- 자모 칸 내 글자: **bold 24px** (2글자 모드) ~ **bold 18px** (4글자 모드)
- 가상 키보드 글자: **bold 14px**

### 4.4 그리드 레이아웃
```
┌─────────────────────┐
│     한글 워드 퀘스트    │  ← 타이틀 바 (40px)
├─────────────────────┤
│  ┌──┬──┬──┬──┬──┬──┐ │
│  │ㅎ│ㅏ│ㄴ│ㄱ│ㅡ│ㄹ│ │  ← 자모 그리드 (6행 × N열)
│  ├──┼──┼──┼──┼──┼──┤ │     N = 자모 수 (4~12)
│  │  │  │  │  │  │  │ │
│  ├──┼──┼──┼──┼──┼──┤ │
│  │  │  │  │  │  │  │ │
│  ├──┼──┼──┼──┼──┼──┤ │
│  │  │  │  │  │  │  │ │
│  ├──┼──┼──┼──┼──┼──┤ │
│  │  │  │  │  │  │  │ │
│  ├──┼──┼──┼──┼──┼──┤ │
│  │  │  │  │  │  │  │ │
│  └──┴──┴──┴──┴──┴──┘ │
│                       │
│  ┌─────────────────┐  │
│  │ 가상 키보드 (3행)  │  │  ← 자모 키보드
│  │ ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ│  │
│  │  ㅁㄴㅇㄹㅎㅗㅓㅏㅣ │  │
│  │ ⇧ㅋㅌㅊㅍㅠㅜㅡ ⌫ │  │
│  │     [  확인  ]     │  │
│  └─────────────────┘  │
└─────────────────────┘
```

### 4.5 애니메이션 (tween 기반)
| 애니메이션 | 지속시간 | 이징 | 설명 |
|-----------|---------|------|------|
| **타일 입력** | 100ms | easeOutBack | 약간 커졌다 원래 크기로 (scale 1.1→1.0) |
| **타일 플립** | 300ms | easeInOutCubic | Y축 회전 효과(scaleY 1→0→1). 0일 때 색상 변경 |
| **행 흔들림** | 400ms | easeOutElastic | 유효하지 않은 단어 제출 시 좌우 진동 |
| **승리 바운스** | 500ms | easeOutBounce | 정답 행의 각 타일이 순차적으로 점프 (50ms 딜레이) |
| **화면 전환** | 250ms | easeInOutQuad | fade in/out via beginTransition() |

### 4.6 UI 요소 크기 제약
| 요소 | 최소 크기 | 비고 |
|------|----------|------|
| 가상 키보드 키 | 48×48px | WCAG 터치 타겟 (Cycle 12 반영) |
| 자모 그리드 셀 | 48×48px | 가독성 + 터치 |
| 메뉴 버튼 | 48×48px | 아이콘 버튼 포함 |
| 모달 닫기 버튼 | 48×48px | Canvas 기반 모달 |

---

## §5. 핵심 게임 루프 및 상태 머신

### 5.1 상태 정의
```
TITLE → MODE_SELECT → PLAYING → RESULT → STATS
                         ↕
                       PAUSED
```

| 상태 | 설명 |
|------|------|
| `TITLE` | 타이틀 화면. 게임 이름 + "시작" 버튼 |
| `MODE_SELECT` | 모드(일일/무한/초성퀴즈) + 난이도(2/3/4글자) 선택 |
| `PLAYING` | 자모 입력 → 제출 → 피드백 루프 |
| `PAUSED` | 일시정지. ESC 또는 일시정지 버튼 |
| `RESULT` | 승리/패배 결과 + 정답 표시 + 공유 버튼 |
| `STATS` | 누적 통계 (승률, 시도 분포, 스트릭) |

### 5.2 상태 전환 규칙
- **모든 전환은 `beginTransition(targetState, options)` 경유** (Cycle 5~8 교훈)
- 즉시 전환이 필요한 경우: `beginTransition(state, { immediate: true })` (PAUSED ↔ PLAYING)
- 전환 중 `_transitioning = true` 가드 플래그로 이중 전환 차단 (Cycle 3 교훈)
- tween 기반 전환의 onComplete에서만 `enterState()` 호출
- `clearImmediate()` 후 신규 tween 추가 (Cycle 4 교훈)

### 5.3 상태 × 시스템 매트릭스 (Cycle 2 필수 교훈)

| 시스템＼상태 | TITLE | MODE_SELECT | PLAYING | PAUSED | RESULT | STATS |
|-------------|:-----:|:-----------:|:-------:|:------:|:------:|:-----:|
| **TweenManager.update()** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **InputHandler** | menu | menu | game | esc_only | share | menu |
| **Renderer** | ✅ | ✅ | ✅ | ✅(overlay) | ✅ | ✅ |
| **SoundManager** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |

> PAUSED에서는 TweenManager와 SoundManager를 멈추되, Renderer는 반투명 오버레이와 함께 계속 그린다.

### 5.4 게임 루프 (PLAYING 상태)
```
매 프레임 (requestAnimationFrame):
  1. dt 계산 (이전 프레임과의 차이, cap 100ms)
  2. try {
       if (state !== PAUSED) tweenManager.update(dt)
       handleInput(inputQueue, gameState)      // 순수 함수
       if (state === PLAYING) {
         updateAnimations(gameState, dt)        // 타일 플립 등
       }
       render(ctx, gameState, dt)               // 순수 함수
     } catch(e) {
       console.error('[HangulWordQuest]', e)
     }
  3. requestAnimationFrame(loop)
```

---

## §6. 난이도 시스템

### 6.1 난이도별 설정 (CONFIG 객체 — 기획-구현 1:1 대조)

```javascript
const CONFIG = {
  DIFFICULTY: {
    EASY:   { syllables: 2, maxJamo: 6,  label: '쉬움 (2글자)' },
    MEDIUM: { syllables: 3, maxJamo: 9,  label: '보통 (3글자)' },
    HARD:   { syllables: 4, maxJamo: 12, label: '어려움 (4글자)' },
  },
  MAX_ATTEMPTS: 6,           // 모든 난이도 동일
  CELL_SIZE: 48,             // px, 최소 터치 타겟
  CELL_GAP: 4,               // px
  KEYBOARD_KEY_SIZE: 48,     // px, WCAG 준수
  FLIP_DURATION: 300,        // ms
  FLIP_DELAY_PER_TILE: 150,  // ms (순차 플립)
  BOUNCE_DURATION: 500,      // ms (승리 바운스)
  SHAKE_DURATION: 400,       // ms (오류 흔들림)
  TRANSITION_DURATION: 250,  // ms (화면 전환)
};
```

### 6.2 단어 사전 구성
- **코드 내 JSON 배열로 내장** (외부 API 0건, 외부 파일 로드 0건)
- 난이도별 사전:
  - EASY: 2글자 단어 ~200개 (예: 사과, 하늘, 바다, 구름, 나비, 별빛, ...)
  - MEDIUM: 3글자 단어 ~300개 (예: 고양이, 무지개, 도서관, 수박씨, ...)
  - HARD: 4글자 단어 ~200개 (예: 인공지능, 프로그램, 도서관에, ...)
- 일일 챌린지 단어 선정: `seed = parseInt(dateStr) % dictLength` (결정론적)

---

## §7. 점수 시스템

### 7.1 점수 계산
```
기본 점수 = (MAX_ATTEMPTS - usedAttempts + 1) × 100
난이도 보너스 = { EASY: ×1.0, MEDIUM: ×1.5, HARD: ×2.0 }
시간 보너스 = max(0, 300 - elapsedSeconds) (일일 모드 전용)
초성퀴즈 보너스 = ×1.3

최종 점수 = floor(기본 점수 × 난이도 보너스 + 시간 보너스)
```

### 7.2 점수 예시
| 시나리오 | 계산 | 점수 |
|---------|------|------|
| MEDIUM, 1회 만에 정답 | (6-1+1)×100×1.5 = 900 | 900 |
| MEDIUM, 3회 만에 정답 | (6-3+1)×100×1.5 = 600 | 600 |
| HARD, 6회 만에 정답 | (6-6+1)×100×2.0 = 200 | 200 |
| EASY, 패배 | 0 | 0 |

### 7.3 통계 저장 (localStorage)
```javascript
const STATS_KEY = 'hangul-word-quest-stats';
// 저장 구조:
{
  totalPlayed: number,
  totalWon: number,
  currentStreak: number,
  maxStreak: number,
  distribution: [0,0,0,0,0,0],  // 1~6회차 정답 분포
  bestScore: number,
  lastDaily: 'YYYY-MM-DD',       // 마지막 일일 챌린지 날짜
}
```

> ⚠️ **판정 먼저 → 저장 나중에** (Cycle 2 교훈): `checkNewBest()` → `saveStats()` 순서 엄수

---

## §8. 핵심 메카닉 상세

### 8.1 자모 분해 알고리즘
```javascript
// 순수 함수 — 전역 참조 0건 (Cycle 6-7 교훈)
function decomposeHangul(char) {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return [char]; // 비한글 문자
  const cho  = Math.floor(code / 588);
  const jung = Math.floor((code % 588) / 28);
  const jong = code % 28;
  const result = [CHO[cho], JUNG[jung]];
  if (jong > 0) {
    const jongJamo = JONG[jong];
    if (DOUBLE_JONG[jongJamo]) {
      result.push(...DOUBLE_JONG[jongJamo]); // 겹받침 분리
    } else {
      result.push(jongJamo);
    }
  }
  return result;
}

function decomposeWord(word) {
  return [...word].flatMap(decomposeHangul);
}
```

### 8.2 피드백 판정 알고리즘
```javascript
// 순수 함수 (guessJamo, answerJamo를 파라미터로 받음)
function evaluateGuess(guessJamo, answerJamo) {
  const result = new Array(guessJamo.length).fill('absent');
  const answerUsed = new Array(answerJamo.length).fill(false);

  // 1차: 정확한 위치 (초록)
  for (let i = 0; i < guessJamo.length; i++) {
    if (guessJamo[i] === answerJamo[i]) {
      result[i] = 'correct';
      answerUsed[i] = true;
    }
  }

  // 2차: 포함되지만 다른 위치 (노랑)
  for (let i = 0; i < guessJamo.length; i++) {
    if (result[i] === 'correct') continue;
    for (let j = 0; j < answerJamo.length; j++) {
      if (!answerUsed[j] && guessJamo[i] === answerJamo[j]) {
        result[i] = 'present';
        answerUsed[j] = true;
        break;
      }
    }
  }

  return result; // ['correct', 'present', 'absent', ...]
}
```

### 8.3 가상 키보드 상태 관리
- 각 자모 키에 최고 상태를 누적: `absent` < `present` < `correct`
- 한번 `correct`로 판정된 자모는 이후 시도에서도 초록 유지
- 키보드 렌더링 시 해당 상태의 배경색 적용

### 8.4 일일 챌린지 시드
```javascript
function getDailyWord(dictionary, dateStr) {
  // dateStr: 'YYYYMMDD' (예: '20260321')
  const seed = parseInt(dateStr, 10);
  const index = seed % dictionary.length;
  return dictionary[index];
}
```

### 8.5 이모지 공유
```javascript
function generateShareText(results, attemptCount, maxAttempts, date) {
  const header = `한글 워드 퀘스트 ${date} ${attemptCount}/${maxAttempts}\n\n`;
  const grid = results.map(row =>
    row.map(r => r === 'correct' ? '🟩' : r === 'present' ? '🟨' : '⬛').join('')
  ).join('\n');
  return header + grid;
}
```
- 클립보드 복사: `navigator.clipboard.writeText()` (iframe 환경에서는 Canvas 기반 "복사됨" 토스트 표시)

---

## §9. 초성 퀴즈 모드 상세

### 9.1 규칙
- 화면 상단에 초성 힌트가 표시됨 (예: `ㅎ ㄱ` → 정답: "한글")
- 자모 그리드에는 초성 위치가 미리 채워지고 **초록색으로 고정**
- 나머지 중성·종성만 추론하여 입력
- 시도 횟수: 4회 (일반 모드보다 적음 — 힌트가 있으므로)

### 9.2 점수
- 기본 점수에 초성퀴즈 보너스 ×1.3 적용

---

## §10. 코드 아키텍처 원칙

### 10.1 파일 구조
```
public/games/hangul-word-quest/
  └── index.html          ← 단일 파일 (HTML + CSS + JS)
                             assets/ 디렉토리 없음 (§11.1)
```

### 10.2 순수 함수 원칙 (Cycle 6-7)
모든 게임 로직 함수는 **파라미터를 통해 데이터를 받는 순수 함수**로 작성:
- `decomposeHangul(char)` → `[자모 배열]`
- `decomposeWord(word)` → `[자모 배열]`
- `evaluateGuess(guessJamo, answerJamo)` → `[결과 배열]`
- `calculateScore(attempts, difficulty, elapsed)` → `number`
- `getDailyWord(dictionary, dateStr)` → `string`
- `generateShareText(results, attempts, max, date)` → `string`
- `renderGrid(ctx, grid, cellSize, colors)` → `void`
- `renderKeyboard(ctx, keys, keyStates, keySize)` → `void`
- `checkWin(results)` → `boolean`

> 전역 객체 직접 참조 0건 목표. 모든 함수는 테스트 가능해야 한다.

### 10.3 공용 인프라 (동일 인터페이스 유지)
- **TweenManager**: `add()`, `update(dt)`, `clearImmediate()` — 타일 애니메이션 전용
- **TransitionGuard**: `beginTransition(state, opts)` — 화면 전환 보호
- **SoundManager**: Web Audio API 기반 — 키 입력음, 플립음, 정답/오답 효과음
- `createGameLoop(updateFn, renderFn)` — try-catch 래핑된 루프 (Cycle 10-11 교훈)

### 10.4 변수 선언 순서 (Cycle 11 TDZ 교훈)
```javascript
// 1. 상수 (CONFIG, 사전 데이터)
// 2. Canvas/Context 참조
// 3. 게임 상태 객체
// 4. TweenManager, SoundManager 인스턴스
// 5. 유틸리티 함수 정의
// 6. 게임 로직 함수 정의
// 7. 렌더링 함수 정의
// 8. 이벤트 리스너 등록
// 9. 초기화 함수 호출
```
> `let`/`const` 변수는 반드시 최초 참조 이전에 선언. resizeCanvas() 등 초기화 함수 호출 전에 관련 변수 모두 선언 완료.

---

## §11. 구현 검증 체크리스트 (1회차 APPROVED 목표)

### 11.1 에셋 제로 원칙 (13사이클 연속 재발 근본 차단)
- [ ] `public/games/hangul-word-quest/` 하위에 `assets/` 디렉토리 없음
- [ ] `index.html` 내 `<img>`, `new Image()`, `fetch('assets/` 문자열 0건
- [ ] `ASSET_MAP`, `SPRITES`, `preloadAssets` 패턴 0건
- [ ] 외부 폰트(Google Fonts 등) 로드 0건
- [ ] SVG 인라인 또는 외부 참조 0건
- [ ] `feGaussianBlur` 등 SVG 필터 0건

### 11.2 CI pre-commit 훅 (Cycle 12 제안 실행)
```bash
#!/bin/bash
# .git/hooks/pre-commit
if [ -d "public/games/hangul-word-quest/assets" ]; then
  echo "ERROR: assets/ directory exists. Delete before committing."
  exit 1
fi
for dir in public/games/*/assets; do
  if [ -d "$dir" ]; then
    echo "ERROR: $dir exists."
    exit 1
  fi
done
```
- [ ] 위 스크립트가 `.git/hooks/pre-commit`에 **실제 등록**되어 있음
- [ ] `chmod +x .git/hooks/pre-commit` 실행됨
- [ ] 테스트: 임시로 assets/ 생성 → 커밋 시도 → 실패 확인 → 삭제

### 11.3 코드 품질
- [ ] 빈 if/else 블록 0건 (데드 코드 금지, Cycle 12 교훈)
- [ ] `// TODO:` 주석 0건 (최종 빌드 전 전수 제거)
- [ ] 선언되었으나 미사용 변수 0건 (유령 변수 금지, Cycle 2-3 교훈)
- [ ] `confirm()`, `alert()`, `prompt()` 사용 0건
- [ ] `setTimeout` 상태 전환 0건 (tween onComplete 전용)
- [ ] 전역 객체 직접 참조 함수 0건 (순수 함수, Cycle 6-7)

### 11.4 인프라 패턴
- [ ] TweenManager `clearImmediate()` 사용 (cancelAll 경쟁 조건 방지, Cycle 4)
- [ ] 모든 상태 전환이 `beginTransition()` 경유 (Cycle 5-8)
- [ ] `_transitioning` 가드 플래그 동작 확인 (Cycle 3)
- [ ] 게임 루프 try-catch 래핑 (Cycle 10-11)
- [ ] dt 파라미터가 모든 update/render에 전달 (Cycle 11)

### 11.5 기능 세부 체크리스트 ("절반 구현" 방지, Cycle 12 교훈)
| 기능 | 세부 항목 A | 세부 항목 B | 세부 항목 C |
|------|-----------|-----------|-----------|
| 자모 분해 | ☐ 기본 초중종 분리 | ☐ 겹받침 2칸 분리 | ☐ 복합모음 1칸 처리 |
| 색상 피드백 | ☐ 정확(초록) | ☐ 포함(노랑) | ☐ 미포함(회색) |
| 키보드 상태 | ☐ 게임→키보드 색상 반영 | ☐ 최고 상태 누적 | ☐ 쌍자음 shift 처리 |
| 일일 챌린지 | ☐ 시드 기반 단어 선택 | ☐ 하루 1회 제한 | ☐ 날짜 변경 감지 |
| 통계 | ☐ 승률 계산 | ☐ 시도 분포 막대 | ☐ 스트릭 카운터 |
| 공유 | ☐ 이모지 그리드 생성 | ☐ 클립보드 복사 | ☐ "복사됨" 토스트 |
| 음절 보조 힌트 | ☐ 자모 전체 맞음 감지 | ☐ 글로우 테두리 표시 | — |

### 11.6 WCAG / 접근성
- [ ] 모든 터치 타겟 ≥ 48×48px
- [ ] 색상 피드백에 추가 텍스트 힌트 (색맹 대응: 타일 내 작은 아이콘 ✓/→/✗)
- [ ] 가상 키보드 키 간 간격 ≥ 4px

### 11.7 변수 선언 순서 (Cycle 11 TDZ)
- [ ] 모든 `let`/`const` 변수가 최초 참조 이전에 선언됨
- [ ] `resizeCanvas()` 호출 전 canvas/ctx/gameState 변수 선언 완료

### 11.8 수정 회귀 방지 (Cycle 10)
- [ ] 함수 시그니처 변경 시 모든 호출부 전수 검증
- [ ] 수정 후 전체 플로우 테스트: TITLE → MODE_SELECT → PLAYING → RESULT → STATS

### 11.9 게임 루프 방어적 코딩
```javascript
function gameLoop(timestamp) {
  try {
    const dt = Math.min(timestamp - lastTime, 100);
    lastTime = timestamp;
    // ... update & render ...
  } catch (e) {
    console.error('[HangulWordQuest] Loop error:', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 11.10 범위 외 사항 (별도 태스크)
- 공용 엔진 모듈(`shared/engine.js`) 분리 — Cycle 12 제안, 본 기획 범위 외
- CI 파이프라인 통합 — pre-commit 훅으로 대체

---

## §12. 사운드 디자인

### 12.1 효과음 (Web Audio API 전용, 외부 파일 0건)
| 이벤트 | 파형 | 주파수 | 지속 | 설명 |
|--------|------|--------|------|------|
| 키 입력 | square | 440Hz | 30ms | 짧고 명확한 클릭음 |
| 자모 삭제 | square | 330Hz | 30ms | 입력보다 낮은 톤 |
| 타일 플립 | triangle | 520→660Hz | 150ms | 상승 스윕 |
| 정답 (승리) | sine | C5→E5→G5 | 300ms | 밝은 3화음 아르페지오 |
| 오답 (패배) | sawtooth | 220→110Hz | 400ms | 하강 톤 |
| 유효하지 않은 입력 | noise | — | 100ms | 짧은 버즈 |
| 행 제출 | triangle | 440Hz | 50ms | 확인음 |

> `o.start(startT)` / `o.stop(startT + dur)` 파라미터 기반 스케줄링 (setTimeout 0건, Cycle 12 기술)

---

## §13. 반응형 레이아웃

### 13.1 Canvas 크기 전략
```javascript
function resizeCanvas(canvas, gameState) {
  const w = Math.min(window.innerWidth, 500);  // 최대 500px (모바일 최적화)
  const h = window.innerHeight;
  canvas.width = w * devicePixelRatio;
  canvas.height = h * devicePixelRatio;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(devicePixelRatio, devicePixelRatio);
  // 그리드/키보드 레이아웃 재계산
  gameState.layout = calculateLayout(w, h, gameState.difficulty);
}
```

### 13.2 레이아웃 분기
| 화면 너비 | 그리드 셀 크기 | 키보드 키 크기 | 폰트 조정 |
|-----------|---------------|---------------|----------|
| ≥ 420px | 52×52px | 48×48px | 기본 |
| 360~419px | 48×48px | 44×48px | -2px |
| < 360px | 40×40px | 40×44px | -4px |

> 모든 경우에서 터치 타겟은 최소 40×44px 이상 유지 (WCAG 최소 기준)

---

## §14. localStorage 관리

### 14.1 키 구조
```
hangul-word-quest-stats     → 통계 JSON
hangul-word-quest-daily     → 일일 챌린지 진행 상태 JSON
hangul-word-quest-settings  → 설정 (난이도, 사운드 on/off)
```

### 14.2 읽기 최적화 (Cycle 12 교훈)
- localStorage 읽기는 **화면 진입 시 1회** 캐싱하여 메모리 변수에 저장
- 매 프레임 localStorage 접근 금지 (Cycle 12: 초당 300회 읽기 이슈)
- 저장 시점: 게임 종료 시, 설정 변경 시 (최소한의 I/O)

### 14.3 판정→저장 순서 (Cycle 2 교훈)
```javascript
// 올바른 순서
const isNewBest = score > cachedStats.bestScore;  // 1. 판정 먼저
cachedStats.bestScore = Math.max(cachedStats.bestScore, score);
saveStats(cachedStats);                            // 2. 저장 나중
if (isNewBest) showNewBestAnimation();             // 3. UI 반영
```
