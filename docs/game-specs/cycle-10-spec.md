---
game-id: mini-card-battler
title: 미니 카드 배틀러
genre: strategy, casual
difficulty: easy
---

# 미니 카드 배틀러 — 상세 기획서 (Cycle 10)

---

## §0. 이전 사이클 피드백 반영 매핑

| # | 출처 | 문제/제안 | 이번 기획 반영 방법 |
|---|------|----------|-------------------|
| 1 | Cycle 10 분석 보고서 | **카드/덱빌딩 메커닉 0% — 최대 공백** | ✅ 본 게임이 플랫폼 최초 턴제 덱빌딩 카드 배틀러. 카드/덱빌딩 공백 해소 |
| 2 | Cycle 10 분석 보고서 | **전 게임 실시간 → 턴제 0개** | ✅ 플랫폼 최초 턴제 게임. 플레이 스타일 다각화 |
| 3 | Cycle 10 분석 보고서 | **strategy 장르 2개로 가장 약함** | ✅ strategy 2→3개 보강 |
| 4 | Cycle 10 분석 보고서 | **medium 난이도 78% 편중** | ✅ difficulty: easy로 설정. easy 2→3개로 확대 |
| 5 | platform-wisdom [Cycle 1~8] | **assets/ 디렉토리 8사이클 연속 재발** | §13.1 pre-commit 훅 **실제 `.git/hooks/` 등록** + 훅 등록 자체를 검증 항목에 포함. 100% Canvas 코드 드로잉. assets/ 디렉토리 생성 자체를 금지 |
| 6 | platform-wisdom [Cycle 2~4] | **SVG feGaussianBlur 재발** | 외부 SVG 파일 0개. 모든 비주얼은 Canvas API(fillRect, arc, roundRect, fillText)로 코드 드로잉 |
| 7 | platform-wisdom [Cycle 1~2] | **setTimeout 상태 전환 금지** | §5 모든 지연 전환은 tween onComplete 전용. **턴제이므로 setTimeout 유혹 자체가 구조적으로 낮음** |
| 8 | platform-wisdom [Cycle 4] | **cancelAll+add 경쟁 조건** | clearImmediate() 즉시 정리 API 사용. §12 TweenManager 명세 |
| 9 | platform-wisdom [Cycle 2] | **상태×시스템 매트릭스 필수** | §5.3에 전체 매트릭스 포함 |
| 10 | platform-wisdom [Cycle 6~7] | **순수 함수 원칙 위반** | §10에서 모든 게임 로직 함수의 파라미터 시그니처를 사전 정의. 전역 참조 0건 목표 |
| 11 | platform-wisdom [Cycle 7] | **기획-구현 수치 불일치** | §6, §7 모든 밸런스 수치를 CONFIG 객체 상수로 1:1 매핑. §13.5 수치 정합성 검증 테이블 |
| 12 | platform-wisdom [Cycle 8] | **beginTransition() 미경유 (PAUSED 등)** | §5.2에 `beginTransition(state, {immediate: true})` 즉시 전환 모드. 예외 없이 모든 전환이 beginTransition 경유 |
| 13 | platform-wisdom [Cycle 3] | **가드 플래그 누락** | 턴제이므로 매 프레임 조건 반복 평가 없음. 그래도 `isTransitioning` 가드 플래그 적용 |
| 14 | platform-wisdom [Cycle 2~3] | **유령 변수 방지** | §13.4 선언된 변수 사용처 전수 검증 체크리스트 |
| 15 | platform-wisdom [Cycle 5] | **단일 값 갱신 경로 통일** | 하나의 값은 tween OR 직접 대입 중 하나만 사용 |
| 16 | platform-wisdom [Cycle 1] | **iframe 내 confirm/alert 금지** | 모든 확인 UI는 Canvas 기반 모달 (CONFIRM_MODAL 상태) |
| 17 | platform-wisdom [Cycle 8] | **drawTitle dt 하드코딩** | 모든 렌더/업데이트 함수에 gameLoop의 dt를 파라미터로 전달. 하드코딩 금지 |
| 18 | platform-wisdom [Cycle 5] | **beginTransition 필수인데 직접 전환 발생** | §5.2 상태 전환 함수 목록을 사전 정의하여 직접 enterState() 호출 방지 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
어둠의 탑에 갇힌 영웅이 **카드를 무기 삼아 몬스터와 턴제 전투**를 벌이며 **3층 미니 던전을 돌파**하는 로그라이크 덱빌딩 게임. Slay the Spire의 핵심 재미를 **단일 index.html**에 응축한 미니멀 버전. 1런 약 **10~15분**. 매 런마다 랜덤 카드/적/이벤트 조합으로 **무한 리플레이 가치**를 제공한다.

### 핵심 재미 3요소
1. **전략적 카드 선택**: 매 턴 손패 5장 중 마나 한도 내에서 최적의 조합을 고르는 의사결정. "이번 턴 공격을 올인할까, 방어를 쌓을까?"
2. **덱 성장의 쾌감**: 전투 승리 → 3장 중 1장 보상 카드 선택 → 덱이 점점 강해지는 빌드업. "이 카드와 저 카드의 시너지가 터질 때" 유레카 경험
3. **로그라이크 긴장감**: 매 런 HP가 이어지고 죽으면 처음부터 → "한 판만 더" 중독성 + 영구 해금으로 장기 리텐션

### 레퍼런스
- **Slay the Spire**: 덱빌딩 로그라이크의 원조. 턴제 카드 전투 + 맵 노드 선택
- **Balatro**: 포커 손패 + 조커 시너지로 덱빌딩의 대중화 달성 (2024 GOTY 후보)
- **Slay the Web**: 오픈소스 HTML5 StS 클론. 단일 웹페이지 카드 전투 검증 사례

### 게임 페이지 사이드바 정보
```yaml
title: "미니 카드 배틀러"
description: "카드를 무기 삼아 어둠의 탑을 돌파하라! 턴제 덱빌딩 로그라이크."
genre: ["strategy", "casual"]
playCount: 0
rating: 0
controls:
  - "마우스: 카드 클릭으로 플레이, 적 클릭으로 타겟 선택"
  - "터치: 카드 탭으로 플레이, 적 탭으로 타겟 선택"
  - "키보드: 1~5 카드 선택, E 턴 종료, Space 진행, ESC 일시정지"
tags:
  - "#덱빌딩"
  - "#카드배틀"
  - "#로그라이크"
  - "#턴제전략"
  - "#싱글플레이"
addedAt: "2026-03-21"
version: "1.0.0"
featured: true
```

---

## §2. 게임 규칙 및 목표

### 2.1 최종 목표
3층 던전을 돌파하고 **최종 보스를 처치**하면 런 클리어. 클리어 점수는 잔여 HP, 사용 턴 수, 획득 골드에 기반한다.

### 2.2 패배 조건
플레이어 HP가 0 이하가 되면 런 종료(Game Over). 런 간 HP가 이어지므로 자원(HP/골드) 관리가 핵심.

### 2.3 턴 구조 (전투 중)
```
턴 시작
  ├─ 1. 드로우 페이즈: 드로우 파일에서 카드 5장 뽑기 (덱 소진 시 버린 더미 셔플)
  ├─ 2. 플레이어 턴: 마나 소비하여 카드 플레이 (순서 자유)
  │     ├─ 공격 카드 → 적에게 데미지
  │     ├─ 방어 카드 → 블록(아머) 획득
  │     └─ 스킬 카드 → 버프/디버프/드로우/특수 효과
  ├─ 3. 턴 종료 선언 (E키 또는 "턴 종료" 버튼 클릭)
  ├─ 4. 미사용 카드 → 버린 더미로 이동
  ├─ 5. 블록 초기화 (블록은 턴 간 유지 안 됨)
  └─ 6. 적 턴: 사전 표시된 인텐트대로 행동 → 다음 인텐트 공개
```

### 2.4 맵 구조 (3층 미니 던전)
```
[Floor 1 — 숲] 노드 5개: 전투×3, 이벤트×1, 상점×1
        ↓
[Floor 2 — 동굴] 노드 5개: 전투×2, 엘리트×1, 상점×1, 휴식×1
        ↓
[Floor 3 — 탑 꼭대기] 노드 4개: 전투×1, 엘리트×1, 휴식×1, 보스×1
```
- 각 층의 노드는 **2~3갈래 분기**로 연결 (플레이어가 경로 선택)
- 분기 구조는 seededRng로 런마다 고정 (같은 시드 = 같은 맵)

### 2.5 노드 타입별 규칙

| 노드 | 설명 |
|------|------|
| ⚔️ 전투 | 일반 몬스터 1~2마리와 턴제 전투. 승리 시 카드 보상(3→1 선택) + 골드 |
| 💀 엘리트 | 강화된 몬스터 1마리. 승리 시 유물(패시브) + 골드 + 카드 보상 |
| 🛒 상점 | 골드로 카드 구매(3장 진열) / 카드 제거(덱 슬림화) / HP 회복 포션 |
| ❓ 이벤트 | 랜덤 이벤트 2지선다 (예: "HP 10 소모 → 레어 카드 획득" or "안전하게 통과") |
| 🏕 휴식 | HP 25% 회복 or 카드 1장 업그레이드(강화 버전) 중 선택 |
| 👑 보스 | 층별 고유 보스. 처치 시 다음 층으로 / 최종 보스 처치 시 런 클리어 |

---

## §3. 조작 방법

### 3.1 마우스 (PC)
| 동작 | 설명 |
|------|------|
| 카드 클릭 | 손패에서 카드 선택 → 선택된 카드 강조(글로우) |
| 적 클릭 | 선택된 공격 카드의 타겟 지정 → 카드 효과 즉시 적용 |
| 방어/스킬 카드 클릭 | 타겟 불필요한 카드는 클릭만으로 즉시 사용 |
| "턴 종료" 버튼 클릭 | 플레이어 턴 종료 → 적 턴 시작 |
| 맵 노드 클릭 | 다음 노드 선택 (연결된 노드만 클릭 가능) |
| 카드 호버 | 카드 확대 프리뷰 + 상세 설명 툴팁 |

### 3.2 키보드 (PC)
| 키 | 동작 |
|----|------|
| `1`~`5` | 손패 왼쪽부터 n번째 카드 선택 |
| `Q` / `W` | 적 1번 / 적 2번 타겟 선택 (공격 카드 선택 후) |
| `E` | 턴 종료 |
| `Space` | 전투 후 "계속" / 보상 확인 / 다음 진행 |
| `Escape` | 일시정지 메뉴 (Canvas 모달) |

### 3.3 터치 (모바일)
| 동작 | 설명 |
|------|------|
| 카드 탭 | 카드 선택 (첫 탭=선택, 두 번째 탭=사용/타겟 없는 카드 즉시 사용) |
| 적 탭 | 선택된 공격 카드의 타겟 지정 |
| "턴 종료" 버튼 탭 | 턴 종료 |
| 카드 길게 누르기 (300ms) | 카드 상세 정보 팝업 |
| 맵 노드 탭 | 노드 선택 |

---

## §4. 시각적 스타일 가이드

### 4.1 전체 톤
**다크 판타지 + 네온 악센트** — 어두운 배경에 카드/UI가 밝은 색상으로 돋보이는 스타일. Slay the Spire의 어두운 톤 + Balatro의 네온 감성 절충.

### 4.2 색상 팔레트

| 용도 | 색상 | HEX |
|------|------|-----|
| 배경 (던전) | 매우 어두운 남색 | `#0A0E1A` |
| 카드 배경 | 다크 슬레이트 | `#1A1F2E` |
| 카드 테두리 (공격) | 크림슨 레드 | `#E63946` |
| 카드 테두리 (방어) | 스틸 블루 | `#457B9D` |
| 카드 테두리 (스킬) | 에메랄드 그린 | `#2A9D8F` |
| 카드 테두리 (파워) | 앰버 골드 | `#E9C46A` |
| 마나 구슬 | 딥 퍼플 | `#7B2CBF` |
| HP 바 (플레이어) | 레드 그라디언트 | `#E63946` → `#C1121F` |
| HP 바 (적) | 오렌지 레드 | `#FF6B35` |
| 블록(아머) | 스카이 블루 | `#48CAE4` |
| 골드 | 밝은 골드 | `#FFD60A` |
| 텍스트 (일반) | 밝은 회색 | `#E8E8E8` |
| 텍스트 (비활성) | 어두운 회색 | `#6B7280` |
| 적 인텐트 (공격) | 레드 | `#EF4444` |
| 적 인텐트 (방어) | 블루 | `#3B82F6` |
| 적 인텐트 (버프) | 퍼플 | `#A855F7` |
| 선택된 카드 글로우 | 밝은 화이트 | `#FFFFFF` (alpha 0.4) |
| 보스 글로우 | 다크 레드 | `#9B1B30` |

### 4.3 배경
- **Floor 1 (숲)**: 어두운 남색 바탕 + 하단에 짙은 녹색 나무 실루엣 (삼각형 조합)
- **Floor 2 (동굴)**: 더 어두운 배경 + 상단/하단에 갈색 종유석 (역삼각형)
- **Floor 3 (탑)**: 짙은 보라색 바탕 + 별빛 파티클 (작은 흰 점 20개 랜덤 깜빡임)

### 4.4 오브젝트 형태 (100% Canvas 코드 드로잉)

#### 카드
```
┌─────────────────────┐  크기: 100×140px (손패 기본)
│ [마나코스트]  [타입] │  확대 시: 150×210px
│                     │
│    [카드 아이콘]     │  아이콘: 도형 조합으로 표현
│   (Canvas 도형)     │    공격=칼(삼각형+사각형)
│                     │    방어=방패(원+사각형)
│   [카드 이름]       │    스킬=별(5각별 path)
│                     │    파워=왕관(삼각형 3개)
│  [효과 수치 텍스트] │
│                     │  테두리: 타입별 색상 2px
└─────────────────────┘  둥근 모서리: radius 8px
```

#### 적 몬스터 (Canvas 도형 조합)
| 적 | 형태 | 색상 |
|----|------|------|
| 슬라임 | 반원 + 작은 원 2개(눈) | `#4ADE80` (초록) |
| 고블린 | 역삼각형(몸) + 원(머리) + 삼각형 2개(귀) | `#FB923C` (오렌지) |
| 해골전사 | 원(두개골) + 사각형(몸) + 라인 2개(칼) | `#D4D4D8` (회색) |
| 가고일 | 삼각형(몸) + 삼각형 2개(날개) + 원(눈, 빨강) | `#6B21A8` (보라) |
| 다크 슬라임 | 반원(큰) + 원 2개(눈, 빨강) + 가시(삼각형 3개) | `#1E3A5F` (어두운 남색) |
| 오크 대장 | 큰 사각형(몸) + 원(머리) + 삼각형(도끼) | `#92400E` (갈색) |
| 밤의 사신 | 삼각형(로브) + 원(두개골) + 라인(낫) | `#4C1D95` (어두운 보라) |
| 불의 드래곤(보스1) | 큰 삼각형(몸) + 원(머리) + 삼각형 2개(날개) + 불꽃(주황 삼각형) | `#DC2626` (빨강) |
| 서리 리치(보스2) | 사각형(로브) + 원(두개골) + 파란 글로우(shadowBlur) | `#7C3AED` (보라) |
| 다크 나이트(최종보스) | 큰 사각형(갑옷) + 삼각형(투구) + 라인(대검) + 검정 글로우 | `#1F2937` (다크, 빨강 눈) |

#### 플레이어 영역 (화면 하단)
```
[HP 바] [블록 표시] [마나 구슬×3]     [턴 종료 버튼]
[───────── 손패 카드 5장 (부채꼴 배치) ─────────]
```

#### 적 영역 (화면 상단)
```
[적1: 도형 + HP바 + 인텐트아이콘]  [적2: 도형 + HP바 + 인텐트아이콘]
```

### 4.5 외부 에셋 원칙
- **외부 파일 0개**: 이미지, SVG, 폰트, 오디오 파일 일절 불사용
- **assets/ 디렉토리 생성 금지**: 디렉토리 자체를 만들지 않음
- **모든 비주얼**: Canvas API (fillRect, arc, roundRect, lineTo, fillText, shadowBlur)
- **모든 사운드**: Web Audio API 절차적 합성
- **폰트**: system-ui, -apple-system, sans-serif (시스템 폰트 스택만)
- **❌ 금지 항목**: SVG 파일, feGaussianBlur, Google Fonts, `<img>` 태그, `new Image()`, ASSET_MAP, SPRITES, preloadAssets

---

## §5. 핵심 게임 루프

### 5.1 전체 상태 머신 (FSM)

```
LOADING → TITLE → MAP → PRE_BATTLE → PLAYER_TURN → ENEMY_TURN →
  ├─ REWARD (전투 승리)
  │    ├─ MAP (다음 노드 선택)
  │    └─ VICTORY (최종 보스 클리어)
  ├─ EVENT (이벤트 노드)
  ├─ SHOP (상점 노드)
  ├─ REST (휴식 노드)
  ├─ GAMEOVER (HP ≤ 0)
  ├─ PAUSED (ESC)
  └─ CONFIRM_MODAL (확인 필요 시)
```

상태 전이 다이어그램:
```
LOADING ──→ TITLE ──→ MAP ──→ PRE_BATTLE ──→ PLAYER_TURN ⇄ ENEMY_TURN
                ↑       │          ↑               │              │
                │       │          └── REWARD ←─────┘              │
                │       ├──→ EVENT ──→ MAP                         │
                │       ├──→ SHOP ──→ MAP                          │
                │       ├──→ REST ──→ MAP                          │
                │       └──→ (보스노드) PRE_BATTLE → ... → VICTORY │
                │                                                   │
                └────────── GAMEOVER ←──────────────────────────────┘
```

### 5.2 상태 전환 규칙

**모든 전환은 반드시 `beginTransition(targetState, options)` 경유.**

```javascript
// 전환 모드
beginTransition('MAP', { immediate: false });  // 페이드 전환 (기본)
beginTransition('PAUSED', { immediate: true }); // 즉시 전환 (PAUSED 등)

// 상태 우선순위 (STATE_PRIORITY)
const STATE_PRIORITY = {
  GAMEOVER: 100,    // 최우선
  VICTORY: 90,
  PAUSED: 80,
  CONFIRM_MODAL: 70,
  ENEMY_TURN: 30,
  PLAYER_TURN: 20,
  PRE_BATTLE: 15,
  REWARD: 10,
  EVENT: 10,
  SHOP: 10,
  REST: 10,
  MAP: 5,
  TITLE: 1,
  LOADING: 0,
};
```

**가드 플래그**: `isTransitioning = true` 설정 후 tween onComplete에서 상태 변경 + `isTransitioning = false`. 중복 전환 방지.

### 5.3 상태 × 시스템 업데이트 매트릭스

| 상태 | TweenMgr | Render | Input | Audio | Timer |
|------|----------|--------|-------|-------|-------|
| LOADING | ✅ | ✅ 로딩바 | ❌ | ❌ | ❌ |
| TITLE | ✅ | ✅ 타이틀 | ✅ 시작 | ✅ BGM | ❌ |
| MAP | ✅ | ✅ 맵 | ✅ 노드 선택 | ✅ | ❌ |
| PRE_BATTLE | ✅ | ✅ 적 등장 연출 | ❌ | ✅ SFX | ❌ |
| PLAYER_TURN | ✅ | ✅ 전투 | ✅ 카드/턴종료 | ✅ SFX | ❌ |
| ENEMY_TURN | ✅ | ✅ 적 행동 연출 | ❌ | ✅ SFX | ✅ 적 행동 타이머 |
| REWARD | ✅ | ✅ 보상 UI | ✅ 카드 선택 | ✅ SFX | ❌ |
| EVENT | ✅ | ✅ 이벤트 UI | ✅ 선택지 | ✅ | ❌ |
| SHOP | ✅ | ✅ 상점 UI | ✅ 구매/제거 | ✅ SFX | ❌ |
| REST | ✅ | ✅ 휴식 UI | ✅ 회복/강화 | ✅ | ❌ |
| VICTORY | ✅ | ✅ 승리 연출 | ✅ 재시작 | ✅ 팡파레 | ❌ |
| GAMEOVER | ✅ | ✅ 패배 연출 | ✅ 재시작 | ✅ SFX | ❌ |
| PAUSED | ✅ | ✅ 일시정지 오버레이 | ✅ 재개/종료 | ❌ (BGM 정지) | ❌ |
| CONFIRM_MODAL | ✅ | ✅ 모달 오버레이 | ✅ 예/아니오 | ❌ | ❌ |

> **핵심**: TweenMgr.update()는 **모든 상태에서** 호출. Cycle 2 B1(모달 alpha=0) 재발 방지.

### 5.4 메인 게임 루프 (requestAnimationFrame)

```
gameLoop(timestamp):
  dt = (timestamp - lastTime) / 1000   // 초 단위
  lastTime = timestamp

  // 1. 시스템 업데이트 (매트릭스 참조)
  tweenManager.update(dt)               // 모든 상태에서
  if (TIMER_STATES[state]) updateTimer(dt)

  // 2. 렌더링
  clearCanvas(ctx)
  renderBackground(ctx, state, floor)
  renderState(ctx, state, dt)           // 상태별 렌더 분기
  renderTransition(ctx, dt)             // 전환 오버레이

  // 3. 다음 프레임
  requestAnimationFrame(gameLoop)
```

> **dt 전달 원칙**: 모든 렌더/업데이트 함수는 `dt`를 파라미터로 받음. 하드코딩 금지 (Cycle 8 교훈).

---

## §6. 카드 시스템

### 6.1 카드 타입 (4종)

| 타입 | 색상 | 설명 |
|------|------|------|
| 공격 (ATK) | `#E63946` 크림슨 | 적에게 데미지. 타겟 지정 필요 |
| 방어 (DEF) | `#457B9D` 스틸 블루 | 블록(아머) 획득. 타겟 불필요 |
| 스킬 (SKL) | `#2A9D8F` 에메랄드 | 버프/디버프/드로우 등 특수 효과 |
| 파워 (PWR) | `#E9C46A` 앰버 골드 | 전투 동안 지속되는 영구 효과 |

### 6.2 시작 덱 (10장)

| 카드명 | 타입 | 코스트 | 효과 | 수량 |
|--------|------|--------|------|------|
| 타격 | ATK | 1 | 데미지 6 | 5장 |
| 수비 | DEF | 1 | 블록 5 | 4장 |
| 돌파 | ATK | 2 | 데미지 10 | 1장 |

### 6.3 전체 카드 풀 (30종)

#### 공격 카드 (ATK) — 10종
| # | 카드명 | 코스트 | 효과 | 레어리티 | 강화 |
|---|--------|--------|------|----------|------|
| A1 | 타격 | 1 | 데미지 6 | 기본 | 데미지 9 |
| A2 | 돌파 | 2 | 데미지 10 | 기본 | 데미지 14 |
| A3 | 연타 | 1 | 데미지 3 × 2회 | 일반 | 3 × 3회 |
| A4 | 관통 | 2 | 데미지 8 + 블록 무시 | 일반 | 데미지 12 |
| A5 | 출혈 | 1 | 데미지 4 + 출혈 2 (3턴) | 일반 | 출혈 3 (3턴) |
| A6 | 분노의 일격 | 3 | 데미지 20 | 희귀 | 데미지 28 |
| A7 | 회전베기 | 2 | 전체 데미지 8 | 희귀 | 전체 데미지 12 |
| A8 | 약점공략 | 1 | 데미지 5, 취약이면 2배 | 희귀 | 데미지 7 |
| A9 | 처형 | 2 | 데미지 12, HP<25%면 즉사 | 전설 | 임계 HP<33% |
| A10 | 칼날 폭풍 | 3 | 전체 데미지 5 × 3회 | 전설 | 전체 5 × 4회 |

#### 방어 카드 (DEF) — 8종
| # | 카드명 | 코스트 | 효과 | 레어리티 | 강화 |
|---|--------|--------|------|----------|------|
| D1 | 수비 | 1 | 블록 5 | 기본 | 블록 8 |
| D2 | 철벽 | 2 | 블록 12 | 일반 | 블록 16 |
| D3 | 반격 | 1 | 블록 4 + 데미지 4 | 일반 | 각 6 |
| D4 | 가시갑옷 | 2 | 블록 6 + 가시 2 (2턴) | 일반 | 가시 3 |
| D5 | 회복 | 1 | 블록 3 + HP 회복 3 | 희귀 | 각 5 |
| D6 | 성벽 | 3 | 블록 20 | 희귀 | 블록 28 |
| D7 | 흡수 | 2 | 블록 8 + 초과분 HP 회복 | 희귀 | 블록 12 |
| D8 | 불멸 | 3 | 블록 15 + 이번 턴 데미지 면역 | 전설 | 블록 20 |

#### 스킬 카드 (SKL) — 8종
| # | 카드명 | 코스트 | 효과 | 레어리티 | 강화 |
|---|--------|--------|------|----------|------|
| S1 | 집중 | 0 | 카드 1장 드로우 | 일반 | 2장 드로우 |
| S2 | 약화 | 1 | 적 취약 2턴 (받는 데미지 +50%) | 일반 | 3턴 |
| S3 | 무력화 | 1 | 적 약화 2턴 (주는 데미지 -25%) | 일반 | 3턴 |
| S4 | 전투태세 | 1 | 카드 2장 드로우 + 마나 1 회복 | 희귀 | 3장 드로우 |
| S5 | 선제공격 | 0 | 다음 공격 데미지 2배 | 희귀 | 이번 턴 모든 공격 +50% |
| S6 | 혼란 | 2 | 적 전체 약화 1턴 + 취약 1턴 | 희귀 | 각 2턴 |
| S7 | 도둑질 | 1 | 골드 10~20 획득 | 일반 | 15~30 |
| S8 | 정화 | 1 | 디버프 모두 제거 | 희귀 | + 카드 1장 드로우 |

#### 파워 카드 (PWR) — 4종
| # | 카드명 | 코스트 | 효과 | 레어리티 | 강화 |
|---|--------|--------|------|----------|------|
| P1 | 전사의 혼 | 2 | 매 턴 시작 시 공격력 +2 (누적) | 희귀 | +3 |
| P2 | 방어 본능 | 2 | 매 턴 시작 시 블록 3 자동 획득 | 희귀 | 블록 5 |
| P3 | 독구름 | 2 | 적 턴 종료마다 전체 데미지 3 | 희귀 | 데미지 5 |
| P4 | 광전사 | 3 | 공격 카드 사용 시 데미지 +3, 대신 블록 -1 | 전설 | 데미지 +5 |

### 6.4 레어리티 분포 (카드 보상 시 확률)

| 레어리티 | 보상 출현율 | 상점 출현율 | 상점 가격 |
|----------|------------|------------|-----------|
| 기본 | 보상 미출현 | 미판매 | — |
| 일반 | 60% | 60% | 30골드 |
| 희귀 | 30% | 30% | 60골드 |
| 전설 | 10% | 10% | 120골드 |

---

## §7. 전투 시스템

### 7.1 전투 수치

```javascript
const CONFIG = {
  // 플레이어
  PLAYER_MAX_HP: 80,
  PLAYER_START_HP: 80,
  MANA_PER_TURN: 3,
  HAND_SIZE: 5,

  // 블록
  BLOCK_RESET_PER_TURN: true,   // 매 턴 시작 시 블록 0으로

  // 디버프
  VULNERABLE_MULTIPLIER: 1.5,   // 취약: 받는 데미지 ×1.5
  WEAK_MULTIPLIER: 0.75,        // 약화: 주는 데미지 ×0.75
  BLEED_DAMAGE_PER_TURN: 1,     // 출혈: 턴당 출혈 스택 × 1
  THORN_DAMAGE: 1,              // 가시: 피격 시 가시 스택 × 1

  // 전투 보상
  REWARD_CARD_CHOICES: 3,       // 보상 카드 선택지
  GOLD_PER_BATTLE: [10, 20],    // 일반 전투 골드 (min, max)
  GOLD_PER_ELITE: [25, 40],     // 엘리트 골드
  GOLD_PER_BOSS: [50, 80],      // 보스 골드

  // 상점
  SHOP_CARD_COUNT: 3,
  SHOP_REMOVE_COST: 50,         // 카드 제거 비용
  SHOP_POTION_COST: 30,         // HP 포션 가격
  SHOP_POTION_HEAL: 20,         // HP 포션 회복량

  // 휴식
  REST_HEAL_PERCENT: 0.25,      // HP 25% 회복

  // 이벤트
  EVENT_HP_COST: 10,            // 위험한 선택지 HP 소모

  // 점수 (런 클리어 시)
  SCORE_PER_REMAINING_HP: 2,
  SCORE_PER_GOLD: 1,
  SCORE_FLOOR_CLEAR_BONUS: 100,
  SCORE_BOSS_KILL_BONUS: 200,
  SCORE_PERFECT_BONUS: 500,     // 무피해 보스전
};
```

### 7.2 적 몬스터 데이터

#### 일반 몬스터 (Floor 1~3)

| 이름 | HP | 행동 패턴 | 출현 층 |
|------|-----|----------|---------|
| 슬라임 | 20 | 공격 6 → 방어 4 → 반복 | 1 |
| 고블린 | 25 | 공격 8 → 공격 5 → 버프(힘+2) → 반복 | 1~2 |
| 해골전사 | 30 | 방어 6 → 공격 10 → 공격 10 → 반복 | 2 |
| 가고일 | 35 | 공격 7 + 취약 1턴 → 방어 8 → 공격 12 → 반복 | 2~3 |
| 다크 슬라임 | 40 | 공격 5 × 2회 → 버프(힘+3) → 공격 8 → 반복 | 3 |

#### 엘리트 몬스터

| 이름 | HP | 행동 패턴 | 출현 층 |
|------|-----|----------|---------|
| 오크 대장 | 50 | 버프(힘+3) → 공격 15 → 공격 12 + 약화 1턴 → 반복 | 2 |
| 밤의 사신 | 55 | 공격 8 × 2회 → 방어 10 + 출혈 2 → 공격 18 → 반복 | 3 |

#### 보스

| 이름 | HP | 행동 패턴 | 층 |
|------|-----|----------|-----|
| 불의 드래곤 | 70 | [P1] 공격 10 → 방어 8 → 브레스(전체 15) → [P2: HP<50%] 버프(힘+4) → 공격 18 → 브레스 20 → 반복 | 1→2 |
| 서리 리치 | 80 | [P1] 소환(슬라임×1) → 공격 12+취약 2턴 → 방어 10 → [P2: HP<40%] 전체 약화 2턴 → 공격 20 → 소환 → 반복 | 2→3 |
| 다크 나이트 | 100 | [P1] 방어 12 → 공격 15 → 공격 10×2 → [P2: HP<50%] 버프(힘+5,가시2) → 공격 20 → 전체 15 → [P3: HP<25%] 광란(매턴 힘+2) → 공격 25 → 반복 | 최종 |

### 7.3 적 인텐트 시스템
- 적의 **다음 행동**을 턴 시작 시 아이콘으로 표시
- 아이콘 Canvas 드로잉: 적 머리 위에 작은 원(직경 24px)
  - 공격: 빨간 원 + 칼 모양(×자 라인) + 데미지 수치 텍스트
  - 방어: 파란 원 + 방패 모양(반원) + 블록 수치
  - 버프: 보라 원 + 상향 화살표(△)
  - 디버프: 보라 원 + 하향 화살표(▽)

### 7.4 데미지 계산 공식

```
최종 데미지 = floor(기본 데미지 × 힘보정 × 약화보정 × 취약보정 × 선제공략보정)

- 힘보정: 1 + (힘 스택 × 0.1)    // 힘 1당 10% 증가
- 약화보정: 공격자가 약화 시 0.75  // -25%
- 취약보정: 피격자가 취약 시 1.5   // +50%
- 선제공략보정: 2.0 (1회 한정)

실제 피해 = max(0, 최종 데미지 - 대상 블록)
대상 HP -= 실제 피해
대상 블록 = max(0, 대상 블록 - 최종 데미지)
```

---

## §8. 맵 시스템

### 8.1 맵 생성 (seededRng 기반)

```
각 층은 3행 × 노드수 열의 격자에서 노드를 배치:

Floor 1 예시:
  Row 0: [전투] ──→ [전투] ──→ [이벤트] ──→ [상점] ──→ [보스준비]
  Row 1: [전투] ──↗          ↘ [전투]  ──↗
  Row 2:          (연결)        (연결)

- 시작 노드 1개 → 2~3 분기 → 마지막 노드(보스/층 이동)으로 수렴
- 연결 규칙: 현재 열의 노드는 다음 열의 ±1행 범위 노드와 연결 가능
```

### 8.2 맵 렌더링
- 노드: 원(r=18px) + 타입별 아이콘 + 타입별 테두리 색상
- 연결선: 회색 직선 (방문 가능한 경로만 밝은 색)
- 현재 위치: 밝은 글로우 + 플레이어 마커(작은 삼각형)
- 방문 완료 노드: 어두운 톤 + 체크 표시

### 8.3 노드 색상

| 노드 타입 | 아이콘 색상 | 아이콘 형태 |
|-----------|------------|-------------|
| 전투 | `#E63946` | 교차된 칼 (×자 라인) |
| 엘리트 | `#FF6B35` | 해골 (원 + 빈 원 2개) |
| 상점 | `#FFD60A` | 골드 자루 (원 + 삼각형) |
| 이벤트 | `#2A9D8F` | 물음표 (?) |
| 휴식 | `#4ADE80` | 모닥불 (삼각형 + 흔들리는 불꽃) |
| 보스 | `#9B1B30` | 왕관 (삼각형 3개) |

---

## §9. 난이도 시스템

### 9.1 기본 난이도: Easy
이 게임의 기본 설정은 **easy**로, 전략 게임 입문자도 즐길 수 있도록 설계한다.

| 요소 | easy 설정 | 근거 |
|------|-----------|------|
| 플레이어 시작 HP | 80 | 넉넉한 HP로 실수 허용 |
| 턴당 마나 | 3 | 충분한 행동력 |
| 적 인텐트 | **항상 표시 (수치 포함)** | 전략 판단 명확 |
| 시작 덱 | 10장 (타격5+수비4+돌파1) | 단순한 초기 덱 |
| 카드 보상 선택지 | 3장 | 충분한 선택 |
| 일반 전투 적 수 | 1마리 | 부담 최소화 |
| 상점 카드 제거 비용 | 50골드 | 덱 슬림화 접근 용이 |

### 9.2 층별 난이도 스케일링

| 층 | 적 HP 보정 | 적 데미지 보정 | 적 수 (일반전투) | 골드 보상 보정 |
|----|-----------|---------------|-----------------|---------------|
| Floor 1 | ×1.0 | ×1.0 | 1마리 | ×1.0 |
| Floor 2 | ×1.2 | ×1.15 | 1~2마리 | ×1.2 |
| Floor 3 | ×1.4 | ×1.3 | 1~2마리 | ×1.5 |

### 9.3 보스 패턴 난이도
- 보스는 HP 임계치에서 **페이즈 전환** (공격 패턴 변화)
- 페이즈 전환 시 **1턴 준비 행동** (방어만 실행) → 플레이어에게 대비 시간 부여
- 인텐트가 항상 표시되므로 보스 패턴 학습이 핵심 전략

---

## §10. 순수 함수 설계 — 파라미터 시그니처 사전 정의

> **원칙**: 모든 게임 로직 함수는 전역 변수에 직접 접근하지 않고, 필요한 데이터를 파라미터로 받는다. (Cycle 6~8 누적 교훈)

### 10.1 전투 로직 함수

```javascript
// 데미지 계산
calcDamage(baseDmg, attackerBuffs, defenderDebuffs) → number

// 카드 효과 적용
applyCard(card, player, enemies, targetIdx, rng) → { player, enemies, log }

// 적 행동 실행
executeEnemyAction(enemy, player, actionIdx) → { enemy, player, log }

// 적 인텐트 결정
getEnemyIntent(enemy, turnCount) → { type, value, icon }

// 블록 적용
applyBlock(target, amount) → target

// 디버프 적용
applyDebuff(target, debuffType, duration) → target

// 디버프 틱 (턴 종료 시)
tickDebuffs(target) → target

// 사망 판정
checkDeath(entity) → boolean

// 전투 종료 판정
checkBattleEnd(player, enemies) → 'WIN' | 'LOSE' | null
```

### 10.2 덱/카드 관리 함수

```javascript
// 드로우
drawCards(deck, discard, hand, count, rng) → { deck, discard, hand }

// 카드 사용 후 버리기
discardCard(hand, cardIdx, discard) → { hand, discard }

// 턴 종료 시 전체 버리기
discardHand(hand, discard) → { hand: [], discard }

// 카드 보상 생성
generateRewardCards(cardPool, count, rng, floor) → Card[]

// 덱에 카드 추가
addCardToDeck(deck, card) → deck

// 덱에서 카드 제거
removeCardFromDeck(deck, cardIdx) → deck

// 카드 강화
upgradeCard(card) → upgradedCard

// 셔플
shuffleDeck(deck, rng) → deck
```

### 10.3 맵/진행 함수

```javascript
// 맵 생성
generateMap(seed, floorNum) → MapNode[][]

// 이동 가능 노드 판정
getReachableNodes(map, currentNode) → MapNode[]

// 이벤트 생성
generateEvent(rng, floor) → { text, choices }

// 상점 아이템 생성
generateShopItems(cardPool, rng, floor) → { cards, potionCost, removeCost }

// 점수 계산
calcScore(hp, gold, floorsCleared, bossKills, perfectBosses) → number
```

### 10.4 렌더 함수 (ctx를 첫 파라미터로)

```javascript
renderCard(ctx, card, x, y, w, h, isSelected, isPlayable, dt)
renderEnemy(ctx, enemy, x, y, scale, dt)
renderPlayer(ctx, player, x, y, dt)
renderHPBar(ctx, current, max, x, y, w, h, color)
renderMana(ctx, current, max, x, y)
renderIntent(ctx, intent, x, y)
renderMap(ctx, map, currentNode, reachable, dt)
renderHand(ctx, hand, selectedIdx, mana, canvasW, canvasH, dt)
renderReward(ctx, choices, selectedIdx, dt)
renderShop(ctx, items, gold, dt)
renderEvent(ctx, event, selectedChoice, dt)
renderButton(ctx, text, x, y, w, h, isHovered)
```

---

## §11. 점수 시스템

### 11.1 런 클리어 점수
```
총점 = 잔여HP × 2 + 보유골드 × 1 + 클리어층 × 100 + 보스킬 × 200 + 무피해보스전 × 500
```

### 11.2 런 통계 (GAMEOVER / VICTORY 화면)
- 클리어 층수 (0~3)
- 처치한 적 수
- 사용한 카드 수
- 획득한 카드 수
- 최고 단일 데미지
- 잔여 HP / 최대 HP
- 보유 골드
- 총점

### 11.3 localStorage 저장
```javascript
// try-catch로 감싸서 iframe sandbox 안전 (Cycle 1 패턴)
try {
  const best = JSON.parse(localStorage.getItem('mcb_best') || '{}');
  // 판정 먼저, 저장 나중에 (Cycle 2 B4 교훈)
  const isNewBest = score > (best.score || 0);
  if (isNewBest) {
    localStorage.setItem('mcb_best', JSON.stringify({ score, floor, ... }));
  }
} catch(e) { /* iframe sandbox — 무시 */ }
```

### 11.4 영구 해금 (런 간 진행)
| 해금 조건 | 보상 |
|-----------|------|
| 첫 런 클리어 | 카드 풀에 "연타(A3)" 추가 |
| Floor 2 첫 도달 | 카드 풀에 "전투태세(S4)" 추가 |
| Floor 3 첫 도달 | 카드 풀에 "전사의 혼(P1)" 추가 |
| 최종 보스 첫 처치 | 카드 풀에 "처형(A9)" 추가 |
| 3회 클리어 | 카드 풀에 "칼날 폭풍(A10)" 추가 |
| 5회 클리어 | 카드 풀에 "불멸(D8)" 추가 |

> 초기 런에서는 카드 풀이 제한적(기본+일반 위주) → 해금할수록 강력한 카드 등장 → 장기 리텐션.

---

## §12. 기술 아키텍처

### 12.1 단일 HTML 구조
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>미니 카드 배틀러</title>
  <style>
    /* 인라인 CSS — 시스템 폰트, Canvas 중앙 정렬, 배경색 */
  </style>
</head>
<body>
  <canvas id="gc"></canvas>
  <script>
    // 전체 게임 코드 — 단일 <script> 블록
  </script>
</body>
</html>
```

### 12.2 핵심 모듈 (단일 파일 내 클래스/함수 그룹)

```
[재활용 인프라]
├── TweenManager      — lerp+easing, clearImmediate() (Cycle 5 확정 버전)
├── ObjectPool        — 카드/적/파티클 객체 풀링 (역순 순회+splice)
├── TransitionGuard   — STATE_PRIORITY + beginTransition() + immediate 모드
├── enterState()      — 상태 진입 초기화 일원화 (Cycle 5 확정)
├── seededRng()       — LCG 시드 기반 난수 (맵/적/카드 보상 생성)
├── WebAudioSFX       — 절차적 효과음 (카드사용/공격/방어/승리/패배)
└── DPR Canvas        — 고해상도 대응 (Cycle 1 검증)

[신규 모듈]
├── CardSystem        — 카드 데이터, 효과 적용, 덱/손패/버린더미 관리
├── BattleSystem      — 턴 진행, 인텐트, 데미지 계산, 디버프 틱
├── MapSystem         — 맵 생성, 노드 연결, 이동 가능 판정
├── EnemyAI           — 적 행동 패턴(인덱스 순환), 보스 페이즈 전환
├── RewardSystem      — 카드 보상 생성, 상점 아이템, 이벤트 생성
├── UnlockSystem      — 영구 해금 조건 판정, localStorage 저장
└── InputHandler      — 마우스/터치/키보드 통합 입력 (상태별 분기)
```

### 12.3 TweenManager 사용 패턴 (턴제 특화)

턴제 게임이므로 tween은 **연출 전용**으로 사용:
- 카드 드로우 애니메이션: 덱 위치 → 손패 위치 (0.3초, easeOutBack)
- 카드 사용 애니메이션: 손패 → 적 위치로 이동 후 소멸 (0.2초)
- 적 공격 연출: 적이 앞으로 살짝 돌진 (0.15초) → 복귀 (0.15초)
- 데미지 숫자 팝업: 피격 위치에서 위로 떠올라 소멸 (0.5초)
- HP 바 감소: 현재값 → 새값 lerp (0.3초)
- 전투 시작/종료: 페이드 전환 (0.4초)
- **동시 tween 최대 수**: ~10개 (실시간 게임의 수십개와 비교해 매우 안전)

### 12.4 Web Audio SFX 설계

| 효과음 | 주파수 | 파형 | 지속시간 | 트리거 |
|--------|--------|------|----------|--------|
| 카드 드로우 | 800→1200 Hz | sine | 0.08초 | 드로우 애니메이션 |
| 공격 적중 | 200→100 Hz | sawtooth | 0.12초 | 데미지 적용 |
| 방어 획득 | 600→800 Hz | triangle | 0.1초 | 블록 추가 |
| 적 사망 | 400→50 Hz | square→sine | 0.3초 | HP ≤ 0 |
| 턴 시작 | 500, 700 Hz (chord) | sine | 0.15초 | 드로우 페이즈 |
| 승리 | C4→E4→G4→C5 | sine+triangle | 0.6초 | 전투 승리 |
| 패배 | A3→F3→D3 | triangle | 0.5초 | HP ≤ 0 (플레이어) |
| 카드 선택 | 1000 Hz | sine | 0.05초 | 카드 클릭 |
| 골드 획득 | 1200→1500 Hz | sine | 0.1초 | 골드 추가 |
| 보스 등장 | 80→120→80 Hz | sawtooth | 0.5초 | 보스 PRE_BATTLE |

---

## §13. 검증 체크리스트

### 13.1 pre-commit 훅 (assets/ 디렉토리 차단)

```bash
#!/bin/sh
# .git/hooks/pre-commit — 실제 등록 필수!
if [ -d "games/mini-card-battler/assets" ]; then
  echo "❌ ERROR: assets/ 디렉토리 존재! 제거 후 커밋하세요."
  exit 1
fi
```

**⚠️ 검증 항목**: `.git/hooks/pre-commit` 파일이 실제로 존재하고 실행 권한이 있는지 확인 (Cycle 8 교훈: 기획서에 쓰는 것 ≠ 실제 등록)

### 13.2 금지 패턴 자동 검증 (grep)

| # | 금지 패턴 | grep 명령 | 위반 시 |
|---|-----------|-----------|---------|
| 1 | 외부 SVG 참조 | `grep -r "\.svg" games/mini-card-battler/` | FAIL |
| 2 | feGaussianBlur | `grep -r "feGaussianBlur" games/mini-card-battler/` | FAIL |
| 3 | Google Fonts | `grep -r "fonts.googleapis" games/mini-card-battler/` | FAIL |
| 4 | new Image() | `grep -r "new Image" games/mini-card-battler/` | FAIL |
| 5 | ASSET_MAP | `grep -r "ASSET_MAP\|SPRITES\|preloadAssets" games/mini-card-battler/` | FAIL |
| 6 | confirm()/alert() | `grep -r "confirm(\|alert(" games/mini-card-battler/` | FAIL |
| 7 | setTimeout 상태전환 | `grep -r "setTimeout.*state\|setTimeout.*State" games/mini-card-battler/` | FAIL |
| 8 | assets/ 디렉토리 | `ls games/mini-card-battler/assets/ 2>/dev/null` | FAIL |

### 13.3 필수 패턴 검증

| # | 필수 패턴 | 검증 방법 |
|---|-----------|-----------|
| 1 | beginTransition() 전환 | 모든 상태 변경이 beginTransition 경유 (직접 enterState 호출 0건) |
| 2 | STATE_PRIORITY 맵 | 선언 + 14개 상태 모두 포함 |
| 3 | clearImmediate() 사용 | resetGame/goToTitle에서 clearImmediate 호출 |
| 4 | isTransitioning 가드 | beginTransition 진입부에 가드 체크 |
| 5 | try-catch localStorage | 모든 localStorage 접근이 try-catch 래핑 |
| 6 | DPR Canvas | devicePixelRatio 적용 |
| 7 | system-ui 폰트 | font-family에 system-ui 포함, 외부 폰트 0건 |

### 13.4 기획서 대조 체크리스트

| # | 기획서 항목 | 코드 검증 |
|---|------------|-----------|
| 1 | §2.3 턴 구조 (6단계) | 드로우→플레이→턴종료→버리기→블록초기화→적턴 순서 |
| 2 | §3 조작법 3종 | 마우스/키보드/터치 모두 동작 |
| 3 | §5.3 상태×시스템 매트릭스 | 14개 상태에서 TweenMgr 항상 업데이트 |
| 4 | §6.2 시작 덱 10장 | 타격5+수비4+돌파1 = 10장 |
| 5 | §6.3 카드 풀 30종 | ATK 10 + DEF 8 + SKL 8 + PWR 4 = 30종 |
| 6 | §7.1 CONFIG 수치 | 모든 수치 1:1 매칭 (§13.5 참조) |
| 7 | §7.2 적 5종+엘리트 2종+보스 3종 | 총 10종 적 데이터 |
| 8 | §7.4 데미지 공식 | calcDamage 함수 로직 일치 |
| 9 | §8.1 맵 3층 | Floor 1~3 노드 구성 일치 |
| 10 | §9 난이도 easy | 인텐트 항상 표시, HP 80, 마나 3 |
| 11 | §10 순수 함수 | 전역 참조 0건 (rng 제외, 설계 의도) |
| 12 | §11.4 영구 해금 6종 | 해금 조건/보상 일치 |
| 13 | §12.4 SFX 10종 | Web Audio 효과음 10종 |
| 14 | 유령 변수 0건 | 선언된 모든 변수의 갱신/사용처 확인 |

### 13.5 CONFIG 수치 정합성 검증 테이블

| # | 기획서 위치 | 수치명 | 기획값 | 코드 검증 |
|---|------------|--------|--------|-----------|
| 1 | §7.1 | PLAYER_MAX_HP | 80 | ☐ |
| 2 | §7.1 | MANA_PER_TURN | 3 | ☐ |
| 3 | §7.1 | HAND_SIZE | 5 | ☐ |
| 4 | §7.1 | VULNERABLE_MULTIPLIER | 1.5 | ☐ |
| 5 | §7.1 | WEAK_MULTIPLIER | 0.75 | ☐ |
| 6 | §7.1 | REWARD_CARD_CHOICES | 3 | ☐ |
| 7 | §7.1 | GOLD_PER_BATTLE | [10,20] | ☐ |
| 8 | §7.1 | GOLD_PER_ELITE | [25,40] | ☐ |
| 9 | §7.1 | GOLD_PER_BOSS | [50,80] | ☐ |
| 10 | §7.1 | SHOP_REMOVE_COST | 50 | ☐ |
| 11 | §7.1 | SHOP_POTION_COST | 30 | ☐ |
| 12 | §7.1 | SHOP_POTION_HEAL | 20 | ☐ |
| 13 | §7.1 | REST_HEAL_PERCENT | 0.25 | ☐ |
| 14 | §7.1 | SCORE_PER_REMAINING_HP | 2 | ☐ |
| 15 | §7.1 | SCORE_FLOOR_CLEAR_BONUS | 100 | ☐ |
| 16 | §7.1 | SCORE_BOSS_KILL_BONUS | 200 | ☐ |
| 17 | §7.1 | SCORE_PERFECT_BONUS | 500 | ☐ |
| 18 | §6.2 | 시작덱 타격 수량 | 5 | ☐ |
| 19 | §6.2 | 시작덱 수비 수량 | 4 | ☐ |
| 20 | §6.2 | 시작덱 돌파 수량 | 1 | ☐ |
| 21 | §6.4 | 일반 출현율 | 60% | ☐ |
| 22 | §6.4 | 희귀 출현율 | 30% | ☐ |
| 23 | §6.4 | 전설 출현율 | 10% | ☐ |
| 24 | §7.2 | 슬라임 HP | 20 | ☐ |
| 25 | §7.2 | 고블린 HP | 25 | ☐ |
| 26 | §7.2 | 해골전사 HP | 30 | ☐ |
| 27 | §7.2 | 가고일 HP | 35 | ☐ |
| 28 | §7.2 | 다크슬라임 HP | 40 | ☐ |
| 29 | §7.2 | 오크대장 HP | 50 | ☐ |
| 30 | §7.2 | 밤의사신 HP | 55 | ☐ |
| 31 | §7.2 | 불의드래곤 HP | 70 | ☐ |
| 32 | §7.2 | 서리리치 HP | 80 | ☐ |
| 33 | §7.2 | 다크나이트 HP | 100 | ☐ |
| 34 | §9.2 | Floor2 HP보정 | ×1.2 | ☐ |
| 35 | §9.2 | Floor3 HP보정 | ×1.4 | ☐ |

---

## §14. 턴제 장르의 구조적 안전성 요약

| platform-wisdom 문제 | 실시간 위험 | 턴제 위험 | 이유 |
|---------------------|-----------|----------|------|
| tween cancelAll+add 경쟁 (Cycle 4) | 🔴 높음 | 🟢 매우 낮음 | 동시 상태 전환 시나리오 없음 |
| 가드 플래그 누락 (Cycle 3) | 🔴 높음 | 🟢 매우 낮음 | 이벤트가 턴 단위 순차 발생 |
| setTimeout 남용 (Cycle 1~2) | 🟡 중간 | 🟢 매우 낮음 | 플레이어 입력 대기 = 자연스러운 동기 |
| 상태 전환 우선순위 (Cycle 3) | 🔴 높음 | 🟢 낮음 | 턴 종료→보상→다음 턴의 명확한 순서 |
| 물리/충돌 복잡도 | 🟡 중간 | 🟢 없음 | 물리 엔진 불필요 |
| bpm tween 이중등록 (Cycle 5) | 🟡 중간 | 🟢 없음 | 실시간 수치 변경 없음 |

> **턴제 카드 게임 = 가장 안전한 게임 아키텍처.** 9사이클 누적 문제의 대부분이 실시간 처리에서 발생했으며, 턴제는 이를 구조적으로 회피한다.

---

_InfiniTriX Game Designer | Cycle #10 | 2026-03-21_
