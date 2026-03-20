---
game-id: mini-coffee-tycoon
title: 미니 커피숍 타이쿤
genre: casual, strategy
difficulty: medium
---

# 미니 커피숍 타이쿤 — 상세 기획서 (Cycle 8)

---

## §0. 이전 사이클 피드백 반영 매핑

| # | 출처 | 문제/제안 | 이번 기획 반영 방법 |
|---|------|----------|-------------------|
| 1 | Cycle 7 포스트모템 | **경영/시뮬레이션 장르 도전** | ✅ 본 게임이 플랫폼 최초 경영/아이들 타이쿤 장르 |
| 2 | Cycle 7 포스트모템 | **assets/ 존재 시 빌드 실패 pre-commit 훅** | §13에서 pre-commit 훅 스크립트 명세 + CI 강제. **assets/ 디렉토리 미생성 절대 원칙** |
| 3 | Cycle 7 포스트모템 | 공용 엔진 모듈 분리 | 단일 HTML 내 모듈식 클래스 구조 유지. §12에서 공용 패턴 재사용 명세 |
| 4 | Cycle 7 아쉬운 점 | **assets/ + SVG 에셋 7사이클 재발** | §13.1 pre-commit 훅으로 `games/mini-coffee-tycoon/assets/` 존재 시 커밋 차단. 100% Canvas 코드 드로잉. 외부 에셋 참조 0건 |
| 5 | Cycle 7 아쉬운 점 | **순수 함수 원칙 부분 위반** | §10에서 모든 게임 로직 함수의 파라미터 시그니처를 사전 정의. 전역 참조 0건 목표. §13.4 전수 검증 체크리스트 |
| 6 | Cycle 7 아쉬운 점 | **기획-구현 수치 불일치** | §6, §7에서 모든 밸런스 수치를 `CONFIG` 객체 상수로 1:1 매핑. §13.5 수치 정합성 검증 테이블 |
| 7 | platform-wisdom | setTimeout 상태 전환 금지 | §5 게임 루프에서 모든 지연 전환은 tween onComplete 전용 |
| 8 | platform-wisdom | 상태×시스템 매트릭스 필수 | §5.3에 전체 매트릭스 포함 |
| 9 | platform-wisdom | cancelAll/add 경쟁 조건 | clearImmediate() API 사용. §12 TweenManager 명세 |
| 10 | platform-wisdom | 가드 플래그 필수 | §5.2 상태 전환에 `isTransitioning` 가드 |
| 11 | platform-wisdom | 유령 변수 방지 | §13.4 "선언된 변수 사용처 전수 검증" 포함 |
| 12 | platform-wisdom | iframe 내 confirm/alert 금지 | 모든 확인 UI는 Canvas 기반 모달 |
| 13 | platform-wisdom | 단일 값 갱신 경로 통일 | 하나의 값은 tween OR 직접 대입 중 하나만 사용 |
| 14 | 분석 보고서 | idle/tycoon 장르 0% | ✅ 플랫폼 최초 경영/아이들 타이쿤으로 공백 해소 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
작은 커피 노점에서 시작해 **도시 최고의 커피 체인**으로 성장시키는 하이브리드 캐주얼 타이쿤 게임. 낮에는 직접 음료를 제조하고(수동), 밤에는 바리스타가 자동 운영하며(아이들), 번 돈으로 메뉴·장비·인테리어·매장을 확장한다. **30일(게임 내 시간, 약 15~20분 실플레이)**을 목표로 3호점까지 확장하면 **엔딩**.

### 핵심 재미 3요소
1. **제조의 쾌감**: 고객 주문을 보고 재료를 올바른 순서로 클릭/터치하여 음료 완성 → 정확할수록 팁 보너스 → "나만의 바리스타" 몰입
2. **성장의 판타지**: 초라한 노점(의자 2개) → 아늑한 카페(좌석 6개) → 프랜차이즈 3호점. 화면이 시각적으로 점점 화려해지는 진행감
3. **경영 의사결정**: 제한된 골드로 "메뉴 확장 vs 바리스타 고용 vs 인테리어 업그레이드" 중 무엇을 먼저 할지 선택하는 전략적 깊이

### 레퍼런스
- **Idle Coffee Corp**: 커피숍 아이들 경영, 자동화 계층
- **Papa's Freezeria**: 수동 음료 제조 미니게임, 고객 만족도
- **Leek Factory Tycoon**: 공장 확장 + 자동화 + 인크리멘탈 수익

---

## §2. 게임 규칙 및 목표

### 승리 조건
- **Day 30** 도달 + **3호점 오픈** 완료 → **VICTORY** (최종 평가 등급 S/A/B/C)

### 실패 조건 (소프트 실패)
- 파산 없음. 대신 Day 30까지 3호점을 오픈하지 못하면 등급이 낮아진다 (C 등급)
- **고객 만족도**가 0%로 떨어지면 그 날 매출 0 (경고 연출)

### 기본 규칙
1. 하루(Day) = **30초 실시간**. Day는 "오전(15초, 피크 아님)" + "오후(15초, 피크)"로 나뉜다
2. 고객은 왼쪽에서 입장 → 카운터에서 대기 → 주문 표시 → 제조 → 수령 → 퇴장(오른쪽)
3. **수동 제조**: 주문 버블의 재료 아이콘을 순서대로 클릭하여 음료 완성
4. **자동 제조**: 바리스타를 고용하면 주문을 자동 처리 (속도는 바리스타 레벨에 따라)
5. 완성된 음료 → 고객에게 전달 → **골드(₩)** 획득
6. 제조 정확도(올바른 순서 클릭)에 따라 **팁 보너스** (0%/25%/50%)
7. 대기 시간 초과(5초) → 고객 이탈 → 만족도 하락
8. Day 종료 시 **일일 정산**: 매출, 지출, 순이익, 만족도 표시
9. 정산 후 **업그레이드 화면**(UPGRADE 상태)에서 투자

### §2.1 고객 시스템
- **고객 타입 4종**:

| 타입 | 스프라이트 색상 | 인내심 | 주문 메뉴 | 팁 배율 |
|------|---------------|--------|----------|---------|
| 일반 (Normal) | `#5B8C5A` 녹색 | 5초 | 기본 메뉴 | ×1.0 |
| 급한 (Rushed) | `#E74C3C` 빨간 | 3초 | 기본 메뉴 | ×1.5 |
| VIP | `#F1C40F` 금색 | 7초 | 프리미엄 메뉴 | ×2.0 |
| 단골 (Regular) | `#8E44AD` 보라 | 6초 | 고정 메뉴 1개 | ×1.2 + 만족도 보너스 |

- **스폰 규칙**: `spawnInterval = max(2.0, 5.0 - day * 0.1)` 초
- **동시 대기 가능**: 좌석 수에 따라 (초기 2, 최대 8)
- **대기열 초과 시**: 문 앞에서 돌아감 → 만족도 -5%

---

## §3. 조작 방법

### 키보드 (데스크톱)
| 키 | 동작 |
|----|------|
| `1`~`6` | 재료 슬롯 1~6번 선택 (음료 제조) |
| `Space` | 음료 완성/서빙 확인 |
| `Tab` | 업그레이드 카테고리 전환 |
| `Enter` | 업그레이드 구매 확인 |
| `P` / `Esc` | 일시정지 |

### 마우스 (데스크톱)
| 동작 | 설명 |
|------|------|
| 재료 슬롯 클릭 | 재료 추가 (화면 하단 6슬롯) |
| 음료 완성 버튼 클릭 | 제조 완료 및 서빙 |
| 업그레이드 항목 클릭 | 구매 |
| 고객 클릭 | 주문 상세 보기 (툴팁) |

### 터치 (모바일)
| 동작 | 설명 |
|------|------|
| 재료 슬롯 탭 | 재료 추가 |
| 음료 완성 버튼 탭 | 제조 완료 및 서빙 |
| 업그레이드 항목 탭 | 구매 |
| 스와이프 좌/우 | 업그레이드 카테고리 전환 |

> **inputMode 자동 감지**: 첫 입력 유형(keyboard/mouse/touch)에 따라 UI 힌트를 자동 전환. Cycle 7 가상 조이스틱 패턴 재활용.

---

## §4. 시각적 스타일 가이드

### 색상 팔레트

| 요소 | HEX | 용도 |
|------|-----|------|
| 배경 (벽) | `#FFF8F0` | 따뜻한 아이보리. 카페 분위기 |
| 배경 (바닥) | `#D4A574` | 나무 바닥 느낌 |
| 카운터 | `#8B6914` | 나무 카운터 갈색 |
| 에스프레소 머신 | `#C0C0C0` | 메탈릭 회색 |
| 커피 액체 | `#6F4E37` | 진한 커피 브라운 |
| 우유 | `#FDFEFE` | 흰색 |
| 시럽 | `#E67E22` | 카라멜 오렌지 |
| 휘핑크림 | `#F5F0E1` | 크림색 |
| 골드(화폐) | `#FFD700` | UI 골드 |
| 만족도 높음 | `#27AE60` | 녹색 |
| 만족도 낮음 | `#E74C3C` | 빨간색 |
| 업그레이드 가능 | `#3498DB` | 파란 하이라이트 |
| UI 배경 | `#2C2C2C` | 어두운 패널 |
| UI 텍스트 | `#FFFFFF` | 흰색 텍스트 |

### 오브젝트 형태 (100% Canvas 코드 드로잉)

| 오브젝트 | 형태 | 크기(논리 px) |
|----------|------|-------------|
| 고객 | 원(머리) + 둥근사각형(몸) + 색상으로 타입 구분 | 30×50 |
| 주문 버블 | 둥근사각형 말풍선 + 재료 아이콘 내부 | 80×40 |
| 재료 아이콘 | 원/사각형 조합 (색상+글자로 구분) | 24×24 |
| 커피컵 | 사다리꼴(컵) + 반원(손잡이) | 20×24 |
| 에스프레소 머신 | 사각형 + 원형 다이얼 2개 | 60×80 |
| 좌석 | 둥근사각형 + 원형 다리 4개 | 32×32 |
| 바리스타 NPC | 원(머리) + 사각형(앞치마, `#4A7C59`) | 28×48 |
| 매장 건물 (2호점+) | 사각형 + 삼각형(지붕) + 사각형(문) | 120×100 |

### 배경 레이아웃
```
┌─────────────────────────────────────┐
│  [HUD: Day, Gold, 만족도, 시간바]     │
│                                     │
│  ┌──────────────────────────┐       │
│  │    커피숍 인테리어         │       │
│  │  ┌─┐ ┌─┐        ┌────┐  │       │
│  │  │좌│ │좌│  ...   │머신│  │       │
│  │  └─┘ └─┘        └────┘  │       │
│  │    ╔═══════════╗         │       │
│  │    ║  카운터   ║         │       │
│  │    ╚═══════════╝         │       │
│  │  👤→  👤→  👤→           │       │
│  └──────────────────────────┘       │
│                                     │
│  ┌──────────────────────────┐       │
│  │ [재료 슬롯 1][2][3][4][5][6]     │
│  │ [현재 제조 중인 음료 프리뷰]      │
│  │ [완성 버튼]                       │
│  └──────────────────────────┘       │
└─────────────────────────────────────┘
```

### 인테리어 업그레이드 시각 변화
| 레벨 | 벽 색상 | 바닥 | 추가 요소 |
|------|--------|------|----------|
| Lv1 (노점) | `#FFF8F0` | `#D4A574` | 의자 2, 카운터만 |
| Lv2 (카페) | `#FAF0E6` | `#C4956A` 타일패턴 | 의자 4, 벽 액자, 식물 |
| Lv3 (프리미엄) | `#FDF5E6` | 체커보드 타일 | 의자 6, 조명, 간판 |
| Lv4 (프랜차이즈) | 그라디언트 | 대리석 패턴 | 의자 8, 샹들리에, VIP 존 |

---

## §5. 핵심 게임 루프 (초당 프레임 기준 로직 흐름)

### §5.1 게임 상태 머신 (FSM)

```
LOADING → TITLE → PLAYING → DAY_END → UPGRADE → PLAYING → ... → VICTORY
                    ↕                                       ↓
                  PAUSED                                 GAMEOVER (만족도 0% 3일 연속)
```

**상태 목록 (7종)**:

| 상태 | 설명 | 진입 조건 |
|------|------|----------|
| `LOADING` | Canvas 초기화, 폰트 프리렌더 | 페이지 로드 |
| `TITLE` | 타이틀 화면 + 새 게임/이어하기 | LOADING 완료 |
| `PLAYING` | 핵심 게임플레이 (고객→주문→제조→판매) | TITLE에서 시작 / UPGRADE에서 다음 날 |
| `DAY_END` | 일일 정산 애니메이션 (매출/지출/순이익) | dayTimer ≤ 0 |
| `UPGRADE` | 업그레이드 쇼핑 화면 | DAY_END 정산 완료 |
| `PAUSED` | 일시정지 오버레이 | P/Esc 입력 |
| `VICTORY` | 최종 평가 + 통계 | Day 30 완료 OR 3호점 오픈 후 Day 종료 |

### §5.2 상태 전환 규칙

모든 전환은 `TransitionGuard.beginTransition(targetState)` 경유. 직접 `state = X` 금지.

```javascript
const STATE_PRIORITY = {
  VICTORY: 6,
  GAMEOVER: 5,    // (미사용이지만 확장성 위해 예약)
  DAY_END: 4,
  UPGRADE: 3,
  PAUSED: 2,
  PLAYING: 1,
  TITLE: 0,
  LOADING: 0
};
```

각 전환에 `isTransitioning` 가드 플래그 적용. tween onComplete 콜백으로만 상태 변경.

```javascript
function enterState(newState) {
  // 각 상태 진입 시 초기화를 일원화
  switch(newState) {
    case 'PLAYING':
      tw.clearImmediate();
      startDay();
      break;
    case 'DAY_END':
      tw.clearImmediate();
      calcDayResult();
      // 정산 애니메이션 tween → onComplete → UPGRADE 전환
      break;
    case 'UPGRADE':
      tw.clearImmediate();
      buildUpgradeUI();
      break;
    // ...
  }
}
```

### §5.3 상태 × 시스템 업데이트 매트릭스

| 시스템 \ 상태 | LOADING | TITLE | PLAYING | DAY_END | UPGRADE | PAUSED | VICTORY |
|-------------|---------|-------|---------|---------|---------|--------|---------|
| TweenManager.update() | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CustomerManager.update() | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| BrewingSystem.update() | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| BaristaAI.update() | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| DayTimer.update() | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| ParticleSystem.update() | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| AudioManager (BGM) | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| InputHandler | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Render (모든 상태) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### §5.4 메인 루프 의사코드 (60fps)

```javascript
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // 최대 50ms cap
  lastTime = timestamp;

  // 1. 항상 업데이트
  tw.update(dt);
  particles.update(dt);

  // 2. 상태별 업데이트
  switch (state) {
    case 'PLAYING':
      dayTimer -= dt;
      if (dayTimer <= 0 && !isTransitioning) {
        isTransitioning = true;
        beginTransition('DAY_END');
      }
      customerManager.update(dt, shopData);
      brewingSystem.update(dt, shopData);
      baristaAI.update(dt, shopData);
      checkAutoComplete(shopData);
      break;
    case 'DAY_END':
      // tween 애니메이션만 (매트릭스에 따라)
      break;
    case 'UPGRADE':
      // 입력만 처리 (매트릭스에 따라)
      break;
  }

  // 3. 렌더링 (모든 상태)
  render(state, shopData, camera);

  requestAnimationFrame(gameLoop);
}
```

---

## §6. 난이도 시스템

### §6.1 일(Day) 기반 진행 난이도

모든 수치는 `CONFIG` 객체에 상수로 정의. 기획서 수치와 1:1 매핑.

```javascript
const CONFIG = {
  // §6.1 난이도 스케일링
  DAY_DURATION: 30,                          // 초
  CUSTOMER_BASE_INTERVAL: 5.0,               // 초
  CUSTOMER_INTERVAL_DECAY: 0.1,              // per day
  CUSTOMER_MIN_INTERVAL: 2.0,                // 초
  CUSTOMER_PATIENCE_NORMAL: 5.0,             // 초
  CUSTOMER_PATIENCE_RUSHED: 3.0,
  CUSTOMER_PATIENCE_VIP: 7.0,
  CUSTOMER_PATIENCE_REGULAR: 6.0,

  // §6.1 고객 타입 출현 확률 (Day 기반)
  // getCustomerWeights(day) 함수로 계산
  // Day 1-5:  Normal 80%, Rushed 15%, VIP 0%, Regular 5%
  // Day 6-15: Normal 50%, Rushed 25%, VIP 15%, Regular 10%
  // Day 16-30: Normal 30%, Rushed 30%, VIP 25%, Regular 15%

  // §6.2 메뉴 복잡도
  RECIPE_STEPS_BASE: 2,                      // 초기 재료 단계 수
  RECIPE_STEPS_MAX: 5,                       // 최대 재료 단계 수
  // Day 1-10: 2~3단계, Day 11-20: 3~4단계, Day 21-30: 4~5단계

  // §7 가격/수익
  MENU_BASE_PRICE: 10,                       // 에스프레소 기본가
  TIP_PERFECT: 0.50,                         // 50% 팁 (완벽 제조)
  TIP_GOOD: 0.25,                            // 25% 팁 (1실수)
  TIP_NONE: 0.00,                            // 0% 팁 (2실수 이상)
  SATISFACTION_LEAVE_PENALTY: -5,             // % per 이탈 고객
  SATISFACTION_SERVE_BONUS: 2,               // % per 서빙 성공
  SATISFACTION_PERFECT_BONUS: 3,             // % per 완벽 서빙

  // §6.3 업그레이드 가격
  UPGRADE_PRICES: {
    // [Lv1가격, Lv2, Lv3, ...]
    seat:      [0, 50, 150, 400],            // 좌석 (2→4→6→8)
    menu:      [0, 30, 80, 200, 500],        // 메뉴 (2→3→4→5→6종)
    barista:   [100, 300, 800],              // 바리스타 (고용/속도업/속도업)
    interior:  [0, 200, 600, 1500],          // 인테리어 Lv1~4
    machine:   [0, 100, 350, 900],           // 머신 (제조 속도 -20%/레벨)
    shop2:     [2000],                       // 2호점 오픈
    shop3:     [5000],                       // 3호점 오픈
  },
};
```

### §6.2 메뉴 시스템

| 메뉴 | 해금 조건 | 재료 단계 | 기본가(₩) | 재료 순서 |
|------|----------|----------|----------|----------|
| 에스프레소 | 시작 시 | 2 | 10 | 원두→물 |
| 아메리카노 | 시작 시 | 2 | 15 | 원두→물(많이) |
| 카페라떼 | 메뉴 Lv2 | 3 | 25 | 원두→물→우유 |
| 카라멜 마키아토 | 메뉴 Lv3 | 4 | 40 | 원두→물→우유→시럽 |
| 프라푸치노 | 메뉴 Lv4 | 4 | 50 | 원두→우유→얼음→휘핑 |
| 스페셜 블렌드 | 메뉴 Lv5 | 5 | 70 | 원두→물→우유→시럽→휘핑 |

**재료 슬롯 6종** (화면 하단):
1. ☕ 원두 (`#6F4E37`)
2. 💧 물 (`#87CEEB`)
3. 🥛 우유 (`#FDFEFE`)
4. 🧊 얼음 (`#B0E0E6`)
5. 🍯 시럽 (`#E67E22`)
6. 🍦 휘핑 (`#F5F0E1`)

> 재료 슬롯은 색상 + 도형(원/사각/삼각 등) + 글자(한글 초성)로 3중 구분 → 색각이상 접근성 확보 (Cycle 5 패턴)

### §6.3 바리스타 자동화

| 레벨 | 비용(₩) | 효과 | 제조 속도 |
|------|---------|------|----------|
| Lv1 (고용) | 100 | 기본 메뉴 2종 자동 제조 | 4초/잔 |
| Lv2 (숙련) | 300 | 메뉴 4종까지 자동 제조 | 3초/잔 |
| Lv3 (마스터) | 800 | 전 메뉴 자동 제조 + 팁 보너스 +10% | 2초/잔 |

바리스타 AI 로직:
```
매 프레임:
  if (대기 고객 존재 && 바리스타 idle) {
    가장 오래 기다린 고객의 주문 선택
    제조 타이머 시작 (baristaSpeed)
    제조 완료 시 → 서빙 + 골드 획득 (팁 = 25% 고정, Lv3이면 35%)
  }
```

> 플레이어 수동 제조는 항상 바리스타보다 빠르고 팁이 높다 → 수동 플레이의 가치 유지

---

## §7. 점수 시스템

### 골드(₩) — 게임 내 화폐
```
서빙 수익 = menuPrice × (1 + tipRate)
일일 수익 = Σ(모든 서빙 수익)
일일 지출 = 바리스타 일급 (Lv1: 5₩, Lv2: 10₩, Lv3: 20₩) × 바리스타 수
순이익 = 일일 수익 - 일일 지출
```

### 평가 점수 (VICTORY 시 산출)
```javascript
const SCORE = {
  totalGold: 0,          // 총 누적 수익
  totalServed: 0,        // 총 서빙 횟수
  perfectServes: 0,      // 완벽 제조 횟수
  customersLost: 0,      // 이탈 고객 수
  shopsOpened: 0,        // 오픈한 매장 수 (1~3)
  avgSatisfaction: 0,    // 평균 만족도
};

// 최종 점수 공식
finalScore = totalGold
  + (perfectServes × 50)
  + (shopsOpened × 2000)
  + (avgSatisfaction × 100)
  - (customersLost × 30);

// 등급 산정
// S: finalScore ≥ 20000
// A: finalScore ≥ 12000
// B: finalScore ≥ 6000
// C: finalScore < 6000
```

### 만족도 시스템
```
초기값: 70%
서빙 성공: +2% (완벽 시 +3%)
고객 이탈: -5%
범위: 0% ~ 100%
효과: 만족도 ≥ 80% → 고객 스폰 +20% (입소문 효과)
      만족도 ≤ 30% → 고객 스폰 -30% (악평 효과)
```

### localStorage 저장
```javascript
const SAVE_KEY = 'mini-coffee-tycoon-save';
// 저장 항목: day, gold, satisfaction, upgradeLevels, score, shopCount
// try-catch 래핑 (iframe sandbox 대응)
// "판정 먼저, 저장 나중에" 원칙 (Cycle 2 B4)
```

---

## §8. 매장 확장 시스템 (아이들 수익)

### 다중 매장 구조
| 매장 | 해금 비용 | 해금 Day | 아이들 수익/Day |
|------|----------|---------|---------------|
| 1호점 (현재 운영) | 무료 | Day 1 | 수동 + 바리스타 수익 |
| 2호점 | 2000₩ | Day 15+ | `20₩ × (1 + 인테리어Lv × 0.3)` / Day |
| 3호점 | 5000₩ | Day 25+ | `35₩ × (1 + 인테리어Lv × 0.3)` / Day |

- 2호점/3호점은 완전 자동(아이들) 수익 — 플레이어는 1호점에 집중
- 매장 확장 시 화면 상단에 미니 건물 아이콘 표시 + 수익 팝업

---

## §9. 사운드 디자인 (Web Audio API 절차적 생성)

외부 오디오 파일 0개. 모든 사운드는 OscillatorNode + GainNode로 생성.

| 이벤트 | 사운드 | 구현 |
|--------|--------|------|
| 고객 입장 | 문 벨 "딩동" | sine 800Hz→600Hz, 0.15초 |
| 재료 추가 | 톡 효과음 | triangle 400Hz, 0.05초 |
| 음료 완성 | 밝은 차임 | sine C5→E5→G5 아르페지오, 0.3초 |
| 완벽 서빙 | 팡파레 | sine C5+E5+G5 화음, 0.4초 |
| 고객 이탈 | 낮은 "붕" | sine 200Hz→100Hz, 0.2초 |
| 골드 획득 | 코인 효과 | square 1000Hz→1200Hz, 0.1초 |
| 업그레이드 | 레벨업 | sine sweep 400→800Hz, 0.3초 |
| Day 종료 | 종 효과 | sine 600Hz, 감쇠 0.5초 |
| BGM (PLAYING) | 부드러운 재즈 루프 | sine+triangle 코드 진행 Cmaj7→Fmaj7→G7→Cmaj7, 4마디 반복 |

---

## §10. 순수 함수 설계 (전역 참조 0건 목표)

모든 게임 로직 함수는 파라미터를 통해 데이터를 받는 순수 함수로 작성. `CONFIG` 상수 객체만 전역 참조 허용.

### 함수 시그니처 사전 정의

```javascript
// 고객 시스템
function spawnCustomer(day, satisfaction, seatCount, config) → Customer | null
function updateCustomer(customer, dt, config) → { customer, event }
function getCustomerWeights(day, config) → { normal, rushed, vip, regular }

// 제조 시스템
function getRecipe(menuId, config) → { steps: string[], price: number }
function checkBrewAccuracy(inputSteps, recipeSteps) → 'perfect' | 'good' | 'fail'
function calcServingRevenue(menuPrice, accuracy, tipMultiplier, config) → number

// 바리스타 AI
function updateBarista(barista, customers, dt, config) → { barista, servedCustomer }
function getBaristaSpeed(level, config) → number

// 경제
function calcDayResult(dayRevenues, dayExpenses) → { revenue, expense, profit }
function canAfford(gold, price) → boolean
function applyUpgrade(shopData, upgradeType, config) → shopData

// 만족도
function updateSatisfaction(current, event, config) → number
function getSatisfactionEffect(satisfaction, config) → { spawnMultiplier }

// 점수
function calcFinalScore(scoreData, config) → { score, grade }

// 저장
function serializeState(shopData) → string
function deserializeState(json) → shopData | null
```

> ⚠️ 코드 리뷰 시 위 18개 함수 전수 검증: 전역 변수 직접 참조 0건 확인

---

## §11. 파티클 / 시각 이펙트

| 이펙트 | 트리거 | 구현 |
|--------|--------|------|
| 골드 팝업 | 서빙 완료 | `+₩{금액}` 텍스트, 위로 float + fadeOut (tween 0.8초) |
| 팁 보너스 | 완벽 서빙 | `★ PERFECT!` 텍스트, 스케일 업 + fadeOut |
| 고객 하트 | 서빙 완료 | ♥ 파티클 3개, 위로 흩어짐 |
| 고객 화남 | 이탈 시 | 💢 아이콘 + 빨간 플래시 |
| 증기 | 에스프레소 머신 | 작은 원 파티클 위로 상승 (항상) |
| 업그레이드 | 구매 시 | 별 파티클 방사형 burst |
| 매장 오픈 | 2/3호점 | 화면 전체 폭죽 파티클 + 축하 텍스트 |

파티클 풀: ObjectPool(100) — Cycle 7에서 검증된 패턴 재사용.

---

## §12. 아키텍처 / 공용 패턴

### 단일 HTML 구조
```
index.html
├─ <style> (인라인 CSS: body margin 0, canvas centering)
├─ <canvas id="gameCanvas">
└─ <script>
    ├─ CONFIG 객체 (§6 수치 전부)
    ├─ TweenManager (clearImmediate API 포함)
    ├─ ObjectPool (고객 풀, 파티클 풀)
    ├─ TransitionGuard (STATE_PRIORITY, beginTransition)
    ├─ EventManager (listen/destroy)
    ├─ ParticleSystem
    ├─ AudioManager (Web Audio SFX + BGM)
    ├─ CustomerManager
    ├─ BrewingSystem
    ├─ BaristaAI
    ├─ UpgradeManager
    ├─ ShopRenderer (Canvas 드로잉)
    ├─ HUD
    ├─ 순수 함수들 (§10)
    ├─ enterState() + gameLoop()
    └─ init()
```

### 공용 인프라 (Cycle 1~7 검증 완료)
- **TweenManager**: lerp + 8종 easing. `clearImmediate()` + `cancelAll()` 분리 (Cycle 5 확정)
- **ObjectPool**: acquire/release + 역순 순회 splice (Cycle 2 확정)
- **TransitionGuard**: STATE_PRIORITY 맵 + beginTransition() (Cycle 4 확정)
- **EventManager**: listen() 헬퍼 + registeredListeners + destroy() (Cycle 3 확정)
- **enterState()**: 상태 진입 시 초기화 일원화 (Cycle 5 확정)
- **DPR 대응**: Canvas 내부 해상도 ≠ CSS 표시 크기 (Cycle 1 확정)
- **localStorage**: try-catch 래핑 (Cycle 1 확정)

---

## §13. 검증 체크리스트

### §13.1 pre-commit 훅 (assets/ 존재 시 커밋 차단)

```bash
#!/bin/sh
# .husky/pre-commit 또는 .git/hooks/pre-commit
GAME_DIR="games/mini-coffee-tycoon"
if [ -d "$GAME_DIR/assets" ]; then
  echo "❌ ERROR: $GAME_DIR/assets/ 디렉토리가 존재합니다."
  echo "   100% Canvas 코드 드로잉 원칙 위반. assets/ 삭제 후 다시 커밋하세요."
  exit 1
fi
# SVG 파일 검사
if find "$GAME_DIR" -name "*.svg" 2>/dev/null | grep -q .; then
  echo "❌ ERROR: SVG 파일이 존재합니다. 삭제 후 다시 커밋하세요."
  exit 1
fi
echo "✅ assets/ 검증 PASS"
```

> 7사이클간 반복된 에셋 재발을 파이프라인 레벨에서 차단. 기획서 명시·스크립트·체크리스트로는 한계가 확정됨 (platform-wisdom).

### §13.2 금지 패턴 자동 검증 (grep)

코딩 중 수시로 + 완성 후 최종 1회 실행:

```bash
# 금지 패턴 7항목
grep -n "assets/" index.html          # → 0건이어야 함
grep -n "\.svg" index.html            # → 0건
grep -n "\.png\|\.jpg\|\.gif" index.html  # → 0건
grep -n "new Image\|img\.src" index.html  # → 0건
grep -n "feGaussianBlur" index.html   # → 0건
grep -n "setTimeout" index.html       # → 0건 (tween onComplete 전용)
grep -n "confirm(\|alert(" index.html # → 0건 (Canvas 모달 전용)
grep -n "google.*font\|fonts\.googleapis" index.html  # → 0건
```

### §13.3 필수 패턴 검증

```bash
grep -n "clearImmediate" index.html   # → 1건 이상
grep -n "beginTransition" index.html  # → 1건 이상
grep -n "enterState" index.html       # → 1건 이상
grep -n "isTransitioning" index.html  # → 1건 이상
grep -n "try.*catch" index.html       # → localStorage 래핑
grep -n "STATE_PRIORITY" index.html   # → 1건 이상
grep -n "destroy()" index.html        # → 1건 이상
```

### §13.4 코드 리뷰 체크리스트

- [ ] §10 순수 함수 18개 전수 검증: 전역 변수 직접 참조 0건
- [ ] 선언된 변수가 기획서 의도대로 갱신/사용되는지 전수 검증 (유령 변수 0건)
- [ ] 하나의 값에 대한 갱신 경로가 tween OR 직접 대입 중 하나만 사용
- [ ] 모든 상태 전환이 beginTransition() 경유 (직접 `state =` 금지)
- [ ] inputMode 조건 분기가 선언뿐 아니라 실제 사용되는지 확인
- [ ] assets/ 디렉토리 미존재 확인
- [ ] confirm()/alert() 미사용 확인
- [ ] setTimeout 미사용 확인 (tween onComplete 전용)

### §13.5 기획-구현 수치 정합성 검증 테이블

| 기획서 위치 | 수치 이름 | 기획 값 | 코드 상수 경로 |
|------------|----------|---------|--------------|
| §6.1 | DAY_DURATION | 30 | CONFIG.DAY_DURATION |
| §6.1 | CUSTOMER_BASE_INTERVAL | 5.0 | CONFIG.CUSTOMER_BASE_INTERVAL |
| §6.1 | CUSTOMER_MIN_INTERVAL | 2.0 | CONFIG.CUSTOMER_MIN_INTERVAL |
| §2.1 | Normal 인내심 | 5.0초 | CONFIG.CUSTOMER_PATIENCE_NORMAL |
| §2.1 | Rushed 인내심 | 3.0초 | CONFIG.CUSTOMER_PATIENCE_RUSHED |
| §2.1 | VIP 인내심 | 7.0초 | CONFIG.CUSTOMER_PATIENCE_VIP |
| §2.1 | Regular 인내심 | 6.0초 | CONFIG.CUSTOMER_PATIENCE_REGULAR |
| §7 | TIP_PERFECT | 0.50 | CONFIG.TIP_PERFECT |
| §7 | TIP_GOOD | 0.25 | CONFIG.TIP_GOOD |
| §7 | 만족도 이탈 페널티 | -5% | CONFIG.SATISFACTION_LEAVE_PENALTY |
| §7 | 만족도 서빙 보너스 | +2% | CONFIG.SATISFACTION_SERVE_BONUS |
| §7 | 만족도 완벽 보너스 | +3% | CONFIG.SATISFACTION_PERFECT_BONUS |
| §6.3 | 바리스타 Lv1 속도 | 4초/잔 | CONFIG 내 참조 |
| §6.3 | 바리스타 Lv2 속도 | 3초/잔 | CONFIG 내 참조 |
| §6.3 | 바리스타 Lv3 속도 | 2초/잔 | CONFIG 내 참조 |
| §6.3 | 바리스타 Lv3 팁 보너스 | +10% | CONFIG 내 참조 |
| §7 | S등급 기준 | ≥20000 | CONFIG 또는 calcFinalScore 내부 |
| §7 | A등급 기준 | ≥12000 | CONFIG 또는 calcFinalScore 내부 |
| §7 | B등급 기준 | ≥6000 | CONFIG 또는 calcFinalScore 내부 |
| §8 | 2호점 해금 비용 | 2000₩ | CONFIG.UPGRADE_PRICES.shop2 |
| §8 | 3호점 해금 비용 | 5000₩ | CONFIG.UPGRADE_PRICES.shop3 |
| §8 | 2호점 아이들 수익 | 20₩/Day | CONFIG 내 참조 |
| §8 | 3호점 아이들 수익 | 35₩/Day | CONFIG 내 참조 |

> ⚠️ 코드 리뷰 시 위 테이블의 모든 행을 코드 상수와 1:1 대조 검증 필수.

---

## §14. 사이드바 / 게임카드 메타데이터

### 게임 페이지 사이드바

```yaml
game:
  title: "미니 커피숍 타이쿤"
  description: "작은 커피 노점에서 시작해 도시 최고의 커피 체인으로! 음료를 직접 제조하고, 바리스타를 고용하고, 매장을 확장하는 하이브리드 캐주얼 타이쿤."
  genre: ["casual", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "마우스/터치: 재료 슬롯 클릭으로 음료 제조"
    - "1~6 키: 재료 슬롯 바로가기"
    - "Space: 음료 완성/서빙"
    - "P/Esc: 일시정지"
    - "Tab: 업그레이드 카테고리 전환"
  tags:
    - "#커피숍"
    - "#타이쿤"
    - "#경영시뮬레이션"
    - "#아이들"
    - "#캐주얼"
    - "#전략"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

### 홈 페이지 GameCard

```yaml
thumbnail: "Canvas 렌더링 스냅샷 (카페 인테리어 + 고객 + 커피컵)"
title: "미니 커피숍 타이쿤"
description: "작은 커피 노점에서 시작해 도시 최고의 커피 체인으로! 음료를 직접 제조하고 매장을 확장하세요."
genre: ["casual", "strategy"]   # 최대 2개 배지
playCount: 0                     # 1000 이상이면 "1.2k" 형식
addedAt: "2026-03-20"           # 7일 이내 → "NEW" 배지 표시
featured: true                   # ⭐ 배지 표시
```

---

## §15. 구현 우선순위 (권장 순서)

1. **Phase 1 — 골격**: Canvas 세팅 + FSM(7상태) + enterState + gameLoop + HUD
2. **Phase 2 — 고객**: CustomerManager + 스폰/이동/대기/이탈 + ObjectPool
3. **Phase 3 — 제조**: BrewingSystem + 재료 슬롯 UI + 정확도 판정 + 서빙
4. **Phase 4 — 경제**: 골드 시스템 + 만족도 + DAY_END 정산 + localStorage
5. **Phase 5 — 업그레이드**: UPGRADE 상태 + 메뉴/좌석/머신/인테리어/바리스타
6. **Phase 6 — 바리스타 AI**: BaristaAI 자동 제조 + NPC 렌더링
7. **Phase 7 — 매장 확장**: 2호점/3호점 아이들 수익 + 미니 건물 UI
8. **Phase 8 — 연출**: 파티클 + SFX + BGM + 전환 애니메이션 + VICTORY

---

_작성: 2026-03-20 | InfiniTriX Cycle #8 Game Designer_
