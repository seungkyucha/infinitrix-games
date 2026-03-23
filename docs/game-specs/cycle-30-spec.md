---
game-id: celestial-drift
title: 천체 표류
genre: action, casual
difficulty: medium
---

# 천체 표류 (Celestial Drift) — 사이클 #30 게임 기획서

> **1페이지 요약**: 우주 난파선에서 시작하여 5개 섹터(소행성대/성운/블랙홀/빙결/공허)를 표류하며 자원을 수집하고 함선을 강화하며 섹터 보스를 격퇴하는 **우주 서바이벌 액션 로그라이트**. 5존×3구역 = 15 기본 섹터 + 히든 존 1 = **총 16 스테이지**. 존 보스 5체 + 히든 보스 "Void Sentinel" = **6체 보스**. 함선 업그레이드 3트리(공격/방어/탐사), 아티팩트 14종(common 6/rare 5/epic 3) 빌드 다양성, SeededRNG 프로시저럴 섹터 변형, 3단 난이도(탐험가/전투원/전설) + DDA 3단계 동적 밸런스, 다국어(한/영). **action+casual 조합을 1→2개로 강화**하며 플랫폼 최초 우주/SF 테마를 도입한다.

> **MVP 경계**: Phase 1(핵심 루프: 탐사→전투→자원수집→업그레이드→보스, 존 1~2 + 보스 2체 + 무기 3종 + 아티팩트 7종 + 업그레이드 기본 트리) → Phase 2(존 3~5 + 보스 3체 + 히든 보스 + 전체 내러티브 + 아티팩트 7종 추가). **Phase 1만으로도 완전한 게임 경험 제공 필수.**

---

## §0. 피드백 매핑 (이전 사이클 교훈)

### 검증 완료 패턴 (platform-wisdom 참조) ✅
> 아래 항목은 20사이클 이상 검증되어 platform-wisdom.md에 상세 기술됨. 본 기획서에서는 **적용 섹션만 표기**한다.

| ID | 교훈 요약 | 적용 섹션 |
|----|----------|----------|
| F1 | assets/ 디렉토리 절대 생성 금지 — 13사이클 연속 성공 [Cycle 1~29] | §4.1 |
| F2 | 외부 CDN/폰트 0건 [Cycle 1] | §4.1 |
| F3 | iframe 환경 confirm/alert 금지 → Canvas 모달 [Cycle 1] | §6.4 |
| F4 | setTimeout 0건 → tween onComplete 전용 [Cycle 1~2] — 19사이클 연속 목표 | §5.2 |
| F5 | 가드 플래그로 tween 콜백 1회 실행 보장 [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition 체계 [Cycle 3 B2] | §6.1 |
| F7 | 상태×시스템 매트릭스 필수 [Cycle 2 B1] | §6.2 |
| F8 | 판정 먼저, 저장 나중에 [Cycle 2 B4] | §11.1 |
| F9 | 순수 함수 패턴 (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | 수치 정합성 테이블 (기획=코드 1:1) [Cycle 7] | §14.1 |
| F11 | 터치 타겟 최소 48×48px + Math.max 강제 [Cycle 12~22] | §3.3 |
| F12 | TDZ 방지: 변수 선언 → DOM 할당 → 이벤트 등록 순서 [Cycle 5~11] | §5.1 |
| F13 | TweenManager clearImmediate() API 분리 [Cycle 4 B1] | §5.2 |
| F14 | 단일 값 갱신 경로 통일 (tween vs 직접 대입) [Cycle 5 B2] | §5.2 |
| F15 | 스모크 테스트 게이트 [Cycle 22~29] | §14.3 |
| F16 | hitTest() 단일 함수 통합 [Cycle 27 F60] | §3.3 |
| F17 | bossRewardGiven 플래그 패턴 [Cycle 27] | §7.5 |
| F18 | SeededRNG 완전 사용 (Math.random 0건) [Cycle 19~29] | §5.2, §14.3 |
| F19 | `gt` 파라미터 네이밍 (draw 함수 시그니처) [Cycle 29 P0] | §4.4 |

### 신규 피드백 (Cycle 29 포스트모템 기반) 🆕

| ID | 교훈 | 해결책 | 적용 섹션 |
|----|------|--------|----------|
| F76 | 모바일 원거리 공격 전용 버튼 부재 — 더블탭이 직관적이지 않음 (Cycle 29 P3) | **모바일 버튼 세트를 기획 1단계에서 확정**: 가상 조이스틱(이동) + 공격 버튼 + 스킬 버튼 + 실드 버튼 4버튼 구성. 각 버튼 최소 56×56px, 화면 하단 고정 | §3.3 |
| F77 | 2차 리뷰까지 소요 — assets/ 참조 코드(ASSET_MAP/preloadAssets/SPRITES) "관성적 포함" (Cycle 29) | 코딩 전/중/후 3단계 자동 grep 검증 + CI 빌드 훅에서 assets/ 존재 시 실패. **코드 초기 템플릿에서 ASSET_MAP/preloadAssets/SPRITES 코드를 원천 배제** | §14.2, §14.3 |
| F78 | 밸런스 검증 수단 부재 — 5존×6보스×13아티팩트 조합 미검증 (Cycle 29) | **섹터별 DPS/EHP 매트릭스 사전 설계** + 아티팩트 캡(DPS 200%, 시너지 150%) + DDA 3단계 폴백. 극단 빌드(레이저 특화 + 공격력 아티팩트 올인)의 클리어 가능성을 수식으로 사전 검증 | §8.1, §8.2 |
| F79 | 공용 엔진 미분리 29사이클째 (Cycle 29) | 10 REGION 코드 구조 유지 + 의존 방향 단방향 정리. TweenManager/ObjectPool/SoundManager/InputManager를 R2에 격리하여 추후 shared/engine.js 추출 가능 구조 | §5.3 |
| F80 | 능력 전환 UI 미설계로 키 바인딩 충돌 위험 (Cycle 29) | 무기 전환은 1/2/3 키(키보드) + 좌측 무기 슬롯 탭(터치). 스킬 사용은 Space(키보드) + 전용 버튼(터치). §3에서 입력 방식별 완전 정의 | §3.1, §3.2, §3.3 |

### 이전 사이클 아쉬운 점 반영 요약 (Cycle 29 포스트모템)

| 아쉬운 점 | 해결 섹션 | 해결 방법 | 검증 기준 |
|-----------|----------|----------|----------|
| 모바일 원거리 공격 버튼 부재 | §3.3 | 가상 조이스틱 + 공격/스킬/실드 4버튼 세트, 각 56×56px | 터치 전용 플로우 완주 가능 |
| 2차 리뷰 소요 (assets/ 참조) | §14.2, §14.3 | 코드 초기 템플릿에서 ASSET_MAP 원천 배제 + 3단계 grep | 1라운드 APPROVED 목표 |
| 밸런스 검증 수단 부재 | §8.1, §8.2 | 섹터별 DPS/EHP 매트릭스 + 아티팩트 캡 + DDA | 극단 빌드 클리어 가능 확인 |
| 공용 엔진 미분리 | §5.3 | 10 REGION + 의존 방향 명시 + 줄번호 가이드 | 순환 참조 0건 |
| 변수 섀도잉 P0 (`t`→`gt`) | §4.4 | draw 함수 시그니처 `gt` 표준화 + grep 검증 | 파라미터 섀도잉 0건 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 1.1 컨셉
천체 표류는 우주 난파선에서 시작하여 위험한 우주 공간을 표류하며 자원을 수집하고, 함선을 강화하고, 각 섹터의 보스를 격퇴하는 **우주 서바이벌 액션 로그라이트**다. 소행성대, 성운, 블랙홀, 빙결, 공허 5개 존을 순차적으로 탐사하며, 각 존의 고유 환경이 게임플레이를 직접 변형한다. 조작은 1스틱(이동) + 3버튼(공격/스킬/실드)의 **캐주얼 친화적 설계**로, 쉽게 배우되 마스터하기 어려운 깊이를 제공한다.

### 1.2 핵심 재미 3축
1. **탐사와 발견 (Explore & Discover)**: 프로시저럴 생성된 섹터를 탐사하며 자원·아티팩트·숨겨진 경로를 발견. "다음 섹터에는 뭐가 있을까?"라는 탐험 동기.
2. **액션 전투의 긴장감 (Fight & Survive)**: 레이저/미사일/플라즈마 3종 무기 전환 + 대시 회피 + 에너지 실드 = 빠른 판단과 반사 신경의 전투. 자원이 부족한 서바이벌 상황에서의 스릴.
3. **로그라이트 빌드 다양성 (Build & Grow)**: 섹터 클리어 시 3택 아티팩트 선택, 영구 업그레이드 3트리(공격/방어/탐사), 매 런마다 다른 전략 경로. "이번엔 실드 특화로 가볼까, 화력 올인할까?"

### 1.3 스토리/내러티브
- **배경**: 은하 탐사선 "아스트라" 호의 조종사가 성간 폭풍에 휩쓸려 미지의 성역으로 표류한다. 이곳은 고대 우주 문명 "성간 설계자(Stellar Architects)"가 남긴 시험장이며, 5개 섹터 각각이 하나의 시련이다. 시험을 통과하면 "성간 설계자"의 유산 — 차원 항법 기술 — 을 계승할 수 있다.
- **섹터별 이야기**: 각 섹터에는 이전 도전자의 항해 기록이 남아있다.
  - **소행성대 존(Asteroid Belt)**: 첫 번째 도전자 "노바"의 기록 — 시험장의 발견
  - **성운 존(Nebula)**: 두 번째 도전자 "스텔라"의 기록 — 전자기 교란 속 생존
  - **블랙홀 존(Black Hole)**: 세 번째 도전자 "그래비톤"의 기록 — 시공간의 왜곡
  - **빙결 존(Frozen)**: 네 번째 도전자 "크리오"의 기록 — 절대영도의 시련
  - **공허 존(Void)**: 다섯 번째 도전자 "이클립스"의 기록 — 성간 설계자와의 조우
- **스테이지 간 텍스트 대화**: Canvas 연출 3줄 + 함선 포트레이트 (총 15회 + 히든 2회)
- **엔딩 분기**:
  - 5존 정화 → **"탈출 성공"** 일반 엔딩: 차원 항법 기술로 귀환에 성공한다.
  - 히든 보스 "Void Sentinel" 격파 → **"설계자의 계승"** 진엔딩: Void Sentinel은 사실 마지막 시험의 심판관이었고, 조종사는 새로운 성간 설계자가 된다.

---

## §2. 게임 규칙 및 목표

### 2.1 승리 조건
- **일반 클리어**: 5개 존의 보스를 모두 처치하고 최종 탈출 포탈 진입
- **진 클리어**: 5보스 처치 후 해금되는 히든 존에서 Void Sentinel 격파

### 2.2 패배 조건
- HP가 0이 되면 현재 런 종료 → 영구 업그레이드 유지, 아티팩트·자원은 리셋
- 런 시작 시 HP 100 + 업그레이드 보너스

### 2.3 핵심 규칙
1. **섹터(Sector) 기반 진행**: 맵은 16개 섹터(15 기본 + 1 히든)로 구성. 섹터마다 적 웨이브/환경 위험/보스 존재
2. **자원 시스템**: 에너지(탄약)·크리스탈(업그레이드 재료)·데이터(스토리 해금) 3종 자원
3. **무기 전환**: 레이저(연사/저데미지)·미사일(단발/고데미지)·플라즈마(관통/중데미지) 3종 + 에너지 소모
4. **에너지 실드**: 피격 흡수 3회 → 쿨다운 8초 → 재충전. 업그레이드로 횟수/쿨다운 개선
5. **대시**: 방향키 + Shift로 짧은 무적 대시 (쿨다운 2초)
6. **아티팩트**: 섹터 클리어 시 3택 중 1개 선택, 런 중 최대 5개 장착
7. **영구 업그레이드**: 크리스탈로 3트리(공격/방어/탐사) 업그레이드, 런 종료 후에도 유지

### 2.4 게임 플로우
```
BOOT → TITLE → HANGAR(업그레이드) → SECTOR_SELECT → EXPLORE → COMBAT → BOSS
                    ↑                                              ↓
                    ← ← ← ← GAME_OVER(런 종료) ← ← ← ← ← HP=0 ←
                    ↑                                              ↓
                    ← ← ← ← SECTOR_CLEAR(아티팩트 선택) → 다음 섹터
                                                                   ↓
                                                           VICTORY(엔딩)
```

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 동작 |
|----|------|
| WASD / 방향키 | 함선 이동 (8방향) |
| 마우스 좌클릭 / Z | 현재 무기 발사 |
| 1 / 2 / 3 | 무기 전환 (레이저/미사일/플라즈마) |
| Space | 스킬 발동 (장착 아티팩트 액티브 스킬) |
| Shift / X | 대시 (이동 방향으로 무적 대시) |
| E | 에너지 실드 토글 |
| Tab | 미니맵 확대/축소 |
| Esc / P | 일시정지 |
| M | BGM 음소거 토글 |

### 3.2 마우스
| 입력 | 동작 |
|------|------|
| 클릭 | 무기 발사 (마우스 방향으로) |
| 우클릭 | 대시 (마우스 방향으로) |
| 휠 업/다운 | 무기 전환 |
| 클릭 (UI 요소) | UI 버튼 상호작용 |

### 3.3 터치 (모바일) — ⚠️ Cycle 29 P3 해결
| 입력 | 동작 |
|------|------|
| **좌측 가상 조이스틱** | 함선 이동 (아날로그 8방향) — 엄지 기준 반경 60px |
| **우측 하단 공격 버튼** (빨강, 56×56px) | 현재 무기 발사 (자동 조준: 가장 가까운 적) |
| **우측 중단 스킬 버튼** (파랑, 56×56px) | 스킬 발동 (쿨다운 표시 오버레이) |
| **우측 상단 실드 버튼** (초록, 56×56px) | 에너지 실드 토글 (잔여 횟수 숫자 표시) |
| **좌측 상단 무기 슬롯** (3개 아이콘, 각 48×48px) | 무기 전환 탭 |
| **화면 좌측 스와이프** | 대시 (스와이프 방향으로) |

> **모바일 버튼 레이아웃** (≤400px 소형 디스플레이 대응):
> ```
> [무기1][무기2][무기3]         [일시정지]
> [HP바]                       [미니맵]
>
>
>     (조이스틱)          [실드]
>                        [스킬]
>                        [공격]
> ```
> 모든 터치 타겟: `Math.max(size, 48)` 강제 (F11)

---

## §4. 시각적 스타일 가이드

### 4.1 기본 원칙
- **100% Canvas 코드 드로잉**: 외부 에셋 0건, CDN 0건, Google Fonts 0건 (F1, F2)
- **assets/ 디렉토리 절대 생성 금지** — ASSET_MAP, preloadAssets, SPRITES 코드 원천 배제 (F77)
- 모든 시각 요소는 Canvas 2D API (arc, rect, lineTo, bezierCurveTo, gradient, shadowBlur)로 실시간 렌더링

### 4.2 색상 팔레트

| 존 | 기본색(pri) | 보조색(sec) | 배경색(bg) | 적 색상(enemy) |
|----|------------|------------|-----------|--------------|
| 소행성대 | #E8A04C (황갈) | #8B6914 (어두운 금) | #0A0A1A (심우주) | #CC4444 (적색) |
| 성운 | #7B68EE (보라) | #FF69B4 (핑크) | #0D0620 (짙은 보라) | #44CC88 (녹색) |
| 블랙홀 | #00CED1 (시안) | #FF4500 (주황) | #050510 (칠흑) | #FF6644 (주홍) |
| 빙결 | #87CEEB (하늘) | #E0FFFF (밝은 시안) | #0A1628 (짙은 남색) | #4488FF (청색) |
| 공허 | #C0C0C0 (은색) | #FFD700 (금색) | #000000 (순수 검정) | #FF00FF (마젠타) |

| UI 요소 | 색상 |
|---------|------|
| HP 바 | #44FF44 (밝은 녹색) |
| 에너지 바 | #4488FF (청색) |
| 실드 | #00FFCC (시안) |
| 크리스탈 | #FF44FF (마젠타) |
| 텍스트 | #FFFFFF (백색) |
| 비활성 | #666666 (회색) |

### 4.3 배경 및 환경
- **다층 스크롤링 별 필드**: 3레이어 (근거리·중거리·원거리 별) parallax 효과
- **존별 환경 오브젝트**:
  - 소행성대: 회전하는 소행성 (4~6종 크기, 랜덤 회전), 소행성 충돌 파편
  - 성운: 반투명 가스 구름 (gradient + alpha pulse), 번개 방전 이펙트
  - 블랙홀: 왜곡 렌즈 효과 (방사형 gradient), 강착원반 파티클 궤도
  - 빙결: 빙결 결정 (6각형 snowflake 패턴), 유빙 (이동 장애물)
  - 공허: 차원 균열 (Cycle 29 drawDimensionalRift 계승), 기하학적 구조물
- **날씨/환경 변화 효과**: 섹터 진행 중 환경이 동적으로 변화
  - 소행성 폭풍 (파티클 밀도 증가 + 화면 흔들림)
  - 성운 전자기 교란 (UI 글리치 이펙트)
  - 중력 왜곡 (이동 벡터 편향)
  - 빙결 확산 (화면 가장자리 서리 효과)
  - 공허 침식 (색상 채도 감소)

### 4.4 드로잉 함수 시그니처 표준화 (F9, F19)
모든 드로잉 함수는 아래 패턴을 준수:
```javascript
// ✅ 올바른 패턴: 파라미터로 상태를 전달, gt(game time) 사용
function drawShip(ctx, x, y, size, angle, thrustLevel, gt) { ... }
function drawBoss(ctx, x, y, phase, hp, maxHp, gt) { ... }
function drawSector(ctx, scrollX, scrollY, sectorData, gt) { ... }

// 🚫 금지 패턴: 전역 변수 직접 참조, t 파라미터
function drawShip() { ctx.fillRect(ship.x, ship.y, ...); } // 전역 참조 금지
function drawBoss(ctx, x, y, t) { ... } // t 섀도잉 위험 → gt 사용
```

### 4.5 에셋 목록 (Canvas 드로잉, 각 함수 10~20KB 상당 복잡도)

| # | 에셋 ID | 설명 | 복잡도 |
|---|---------|------|--------|
| 1 | ship-idle | 함선 기본 상태 | 다각형 + 그라디언트 + 글로우 |
| 2 | ship-thrust | 함선 추진 (엔진 불꽃 파티클) | idle + 파티클 시스템 |
| 3 | ship-dash | 함선 대시 (잔상 + 무적 이펙트) | trail effect + alpha |
| 4 | ship-shield | 함선 실드 활성 (육각형 에너지막) | 반복 hexagon + pulse |
| 5 | ship-damaged | 함선 피격 (스파크 + 연기) | 파티클 + 셰이크 |
| 6 | boss-asteroid | 소행성대 보스 "Rock Titan" | 거대 소행성 + 코어 발광 |
| 7 | boss-nebula | 성운 보스 "Storm Weaver" | 가스 촉수 + 번개 방전 |
| 8 | boss-blackhole | 블랙홀 보스 "Gravity Maw" | 강착원반 + 이벤트 호라이즌 |
| 9 | boss-frozen | 빙결 보스 "Crystal Warden" | 빙결 결정 갑옷 + 레이저 눈 |
| 10 | boss-void | 공허 보스 "Null Entity" | 기하학적 형태 변환 |
| 11 | boss-hidden | 히든 보스 "Void Sentinel" | 대형 (600×400 상당) |
| 12 | enemy-drone | 기본 적 드론 | 삼각형 + 글로우 |
| 13 | enemy-cruiser | 중형 적 순양함 | 다각형 + 포대 |
| 14 | enemy-mine | 기뢰 (접근 감지 폭발) | 원형 + 스파이크 + 경고등 |
| 15 | asteroid-sm | 소형 소행성 | 불규칙 다각형 |
| 16 | asteroid-lg | 대형 소행성 (파괴 가능) | 불규칙 다각형 + 균열 |
| 17 | nebula-cloud | 성운 가스 구름 | radialGradient + alpha |
| 18 | ice-crystal | 빙결 결정 | 6각형 + 반사광 |
| 19 | portal | 차원 포탈 (섹터 간 이동) | 소용돌이 + gradient |
| 20 | artifact-glow | 아티팩트 드롭 이펙트 | 등급별 색상 + 파티클 |
| 21 | explosion | 폭발 이펙트 (4단계) | 파티클 확산 + fadeOut |
| 22 | ui-joystick | 터치 조이스틱 | 이중 원 + 투명도 |
| 23 | ui-buttons | 공격/스킬/실드 버튼 | 원형 + 아이콘 + 쿨다운 |
| 24 | thumbnail | 썸네일 (시네마틱 구도) | 함선+성운+보스 대치 (20KB+) |

---

## §5. 핵심 엔진 시스템

### 5.1 초기화 순서 (F12: TDZ 방지)
```
1. CONFIG 상수 선언
2. Canvas/ctx DOM 할당
3. 전역 상태 객체 초기화 (G = { ... })
4. 엔진 시스템 생성 (TweenManager, ObjectPool, SoundManager, InputManager)
5. 이벤트 리스너 등록
6. 게임 루프 시작 (requestAnimationFrame)
```

### 5.2 핵심 엔진 규칙
- **setTimeout 0건** (F4): 모든 지연 전환은 TweenManager.onComplete() 사용
- **가드 플래그** (F5): `sectorClearing = true` 등으로 tween 콜백 1회 실행 보장
- **clearImmediate()** (F13): cancelAll() 직후 즉시 정리 + _pendingCancel 플러시
- **단일 갱신 경로** (F14): 핵심 변수(shipSpeed, fireRate 등)는 tween 또는 직접 대입 중 하나만 사용
- **SeededRNG** (F18): `Math.random` 0건, 모든 랜덤 요소에 SeededRNG 사용
- **beginTransition()** (F6): 모든 상태 전환은 이 함수를 통해서만 수행, STATE_PRIORITY 체계 준수

### 5.3 코드 영역 가이드 (10 REGION)

| REGION | 명칭 | 예상 줄 | 의존 |
|--------|------|---------|------|
| R1 | CONFIG | 1~200 | 없음 |
| R2 | ENGINE (Tween/Pool/Sound/Input) | 201~600 | R1 |
| R3 | ENTITY (Ship/Enemy/Boss/Projectile) | 601~1000 | R1, R2 |
| R4 | DRAW (모든 드로잉 함수) | 1001~1600 | R1 |
| R5 | COMBAT (무기/충돌/데미지) | 1601~1900 | R1, R2, R3 |
| R6 | SECTOR (프로시저럴 생성/환경) | 1901~2200 | R1, R2, R3 |
| R7 | ROGUE (아티팩트/업그레이드) | 2201~2500 | R1, R2, R3 |
| R8 | STATE (상태 머신/전환) | 2501~2800 | R1~R7 |
| R9 | SAVE (localStorage/진행 저장) | 2801~2950 | R1, R8 |
| R10 | MAIN (루프/리사이즈/진입점) | 2951~3200+ | R1~R9 |

> **의존 방향**: R1→R10 단방향. 역방향 참조 0건 목표. (F79)

---

## §6. 상태 머신

### 6.1 게임 상태 목록 + STATE_PRIORITY

| 상태 | 우선순위 | 설명 |
|------|---------|------|
| BOOT | 0 | 초기 로딩 |
| TITLE | 1 | 타이틀 화면 |
| HANGAR | 2 | 업그레이드/함선 관리 |
| SECTOR_SELECT | 3 | 섹터 선택 맵 |
| SECTOR_INTRO | 4 | 섹터 진입 컷신 |
| EXPLORE | 5 | 섹터 탐사 (이동+자원수집) |
| COMBAT | 6 | 전투 (적 웨이브) |
| BOSS_INTRO | 7 | 보스 등장 컷신 |
| BOSS | 8 | 보스전 |
| BOSS_VICTORY | 9 | 보스 격파 연출 |
| SECTOR_CLEAR | 10 | 섹터 클리어 + 아티팩트 선택 |
| NARRATIVE | 11 | 내러티브 대화 |
| GAME_OVER | 99 | 게임 오버 (최고 우선순위) |
| VICTORY | 98 | 최종 승리 |
| PAUSE | 50 | 일시정지 |
| CONFIRM_MODAL | 51 | 확인 모달 (Canvas 기반, F3) |
| SETTINGS | 52 | 설정 |

> **RESTART_ALLOWED 화이트리스트**: `[GAME_OVER, VICTORY, TITLE]` — 이 상태에서만 TITLE/HANGAR로 전환 가능. 다른 상태에서의 역방향 전환 차단.

### 6.2 상태 × 시스템 매트릭스 (F7)

| 상태 | Tween | Physics | Input | Draw | Sound | Combat | Sector | Rogue | Save |
|------|-------|---------|-------|------|-------|--------|--------|-------|------|
| BOOT | ✅ | — | — | ✅ | — | — | — | — | ✅ |
| TITLE | ✅ | — | menu | ✅ | ✅ | — | — | — | — |
| HANGAR | ✅ | — | menu | ✅ | ✅ | — | — | ✅ | ✅ |
| SECTOR_SELECT | ✅ | — | menu | ✅ | ✅ | — | — | — | — |
| SECTOR_INTRO | ✅ | — | skip | ✅ | ✅ | — | — | — | — |
| EXPLORE | ✅ | ✅ | game | ✅ | ✅ | — | ✅ | — | — |
| COMBAT | ✅ | ✅ | game | ✅ | ✅ | ✅ | ✅ | — | — |
| BOSS_INTRO | ✅ | — | skip | ✅ | ✅ | — | — | — | — |
| BOSS | ✅ | ✅ | game | ✅ | ✅ | ✅ | — | — | — |
| BOSS_VICTORY | ✅ | — | — | ✅ | ✅ | — | — | — | — |
| SECTOR_CLEAR | ✅ | — | select | ✅ | ✅ | — | — | ✅ | ✅ |
| NARRATIVE | ✅ | — | skip | ✅ | ✅ | — | — | — | — |
| GAME_OVER | ✅ | — | menu | ✅ | ✅ | — | — | — | ✅ |
| VICTORY | ✅ | — | menu | ✅ | ✅ | — | — | — | ✅ |
| PAUSE | ✅ | — | pause | ✅ | — | — | — | — | — |
| CONFIRM_MODAL | ✅ | — | modal | ✅ | — | — | — | — | — |
| SETTINGS | ✅ | — | menu | ✅ | ✅ | — | — | — | — |

> ⚠️ **모든 상태에서 Tween 활성화** (F72 해결: BOOT→TITLE 전환 회귀 방지)
> ⚠️ Input 열: 모드명(menu/game/skip/select/pause/modal)으로 세분화 (Cycle 26 교훈)

---

## §7. 핵심 게임 루프

### 7.1 메인 루프 (60fps 기준)
```
requestAnimationFrame(loop)
├── dt = (now - lastTime) / 1000, cap at 0.05 (20fps 최저)
├── IF state === PAUSE/CONFIRM_MODAL → tweenMgr.update(dt) + draw() only
├── tweenMgr.update(dt)
├── inputMgr.process()
├── IF ACTIVE_SYSTEMS[state].Physics → updatePhysics(dt)
│   ├── updateShip(dt)        // 이동, 대시, 실드
│   ├── updateProjectiles(dt) // 탄환 이동 + 화면 밖 제거
│   ├── updateEnemies(dt)     // 적 AI + 이동
│   └── updateEnvironment(dt) // 소행성, 성운, 유빙 등
├── IF ACTIVE_SYSTEMS[state].Combat → updateCombat(dt)
│   ├── checkCollisions()     // hitTest(a, b) 단일 함수 (F16)
│   ├── applyDamage()         // 판정 먼저, 저장 나중에 (F8)
│   └── checkWaveComplete()   // 가드 플래그 보호 (F5)
├── IF ACTIVE_SYSTEMS[state].Sector → updateSector(dt)
│   ├── spawnEnemyWave()      // SeededRNG 기반 (F18)
│   └── updateEnvironmentHazards(dt)
├── IF ACTIVE_SYSTEMS[state].Rogue → updateRogue()
│   └── processArtifactSelection()
├── IF ACTIVE_SYSTEMS[state].Save → autoSave()
├── draw(dt)                  // 모든 상태에서 실행
│   ├── drawBackground(ctx, scrollX, scrollY, zone, gt)
│   ├── drawEnvironment(ctx, sectorData, gt)
│   ├── drawEntities(ctx, entities, gt)
│   ├── drawEffects(ctx, particles, gt)
│   ├── drawUI(ctx, state, hp, energy, shield, gt)
│   └── drawMobileControls(ctx, inputState, gt) // 터치 시에만
└── lastTime = now
```

### 7.2 물리 시스템
- **이동**: 관성 기반 (가속/감속), 최대 속도 제한
- **충돌 감지**: AABB + 원형 hitTest() (F16)
  ```javascript
  function hitTest(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    return dist < a.radius + b.radius;
  }
  ```
- **ObjectPool**: 탄환·파티클·적에 풀 패턴 적용, 매 프레임 GC 0건 목표

### 7.3 환경 위험 시스템
| 존 | 환경 위험 | 효과 | 대응 |
|----|----------|------|------|
| 소행성대 | 소행성 충돌 | HP -10, 넉백 | 회피 또는 파괴 |
| 성운 | 전자기 교란 | 3초간 UI 글리치 + 조준 흔들림 | 성운 밖으로 이탈 |
| 블랙홀 | 중력 왜곡 | 이동 벡터 편향 (중심 방향) | 추력으로 저항 |
| 빙결 | 유빙 | 감속 50% + 방향 전환 지연 | 레이저로 용해 |
| 공허 | 차원 불안정 | 5초마다 랜덤 위치 순간이동 | 안정 구역에 머무름 |

### 7.4 전투 웨이브 시스템
- 각 섹터: 3~5 웨이브 (존 진행에 따라 증가)
- 웨이브 구성: SeededRNG로 적 종류·수량·배치 결정
- 웨이브 클리어 조건: 모든 적 처치 또는 시간 초과(60초 → 보너스 감소)
- 웨이브 간 자원 드롭 + 짧은 호흡 시간(3초)

### 7.5 보스 시스템 (F17: bossRewardGiven 플래그)
- 보스 처치 시 보상 1회만 지급: `if (boss.dead && !bossRewardGiven) { ... bossRewardGiven = true; }`
- 보스별 3페이즈 전환 (HP 66%→33%→0%)

---

## §8. 밸런스 시스템 (F78 해결)

### 8.1 섹터별 DPS/EHP 매트릭스

| 존 | 적 HP | 적 ATK | 적 수/웨이브 | 플레이어 예상 DPS | 예상 클리어 시간 |
|----|-------|--------|-------------|-----------------|---------------|
| 소행성대 | 20~40 | 5~8 | 4~6 | 25~35 | 45초/웨이브 |
| 성운 | 40~70 | 8~12 | 5~8 | 40~55 | 50초/웨이브 |
| 블랙홀 | 70~120 | 12~18 | 6~10 | 60~80 | 55초/웨이브 |
| 빙결 | 100~160 | 15~22 | 7~12 | 80~110 | 60초/웨이브 |
| 공허 | 140~220 | 20~30 | 8~14 | 100~140 | 65초/웨이브 |

### 8.2 밸런스 산식
```
플레이어 DPS = baseDMG × (1 + upgradeBonus) × (1 + artifactBonus) × fireRate
  - 아티팩트 캡: artifactBonus ≤ 2.0 (200%)
  - 시너지 캡: 동일 카테고리 아티팩트 누적 보너스 ≤ 1.5 (150%)

플레이어 EHP = baseHP × (1 + armorBonus) + shieldHP
  - 가정: 피격률 40% (탐험가) / 55% (전투원) / 70% (전설)

보스 클리어 가능 조건: 플레이어 DPS × 120초 > 보스 HP
  - 가정이 틀릴 경우: DDA 폴백 (§8.3)
```

### 8.3 DDA 3단계 동적 밸런스
| 조건 | DDA 레벨 | 효과 |
|------|---------|------|
| 3회 연속 피격 (5초 내) | Level 1 | 적 ATK -15%, 드롭률 +20% |
| 웨이브 시간 초과 2회 | Level 2 | 적 HP -20%, 적 수 -2 |
| 동일 섹터 3회 실패 | Level 3 | 적 HP -30%, ATK -25%, 자원 드롭 2배 |

> DDA는 내부적으로 작동하며 플레이어에게 노출되지 않음. 난이도 선택(탐험가/전투원/전설)과는 독립적으로 작동.

### 8.4 3단 난이도 프리셋

| 항목 | 탐험가 | 전투원 | 전설 |
|------|--------|--------|------|
| 적 HP 배율 | ×0.7 | ×1.0 | ×1.4 |
| 적 ATK 배율 | ×0.6 | ×1.0 | ×1.3 |
| 자원 드롭 | ×1.5 | ×1.0 | ×0.7 |
| 실드 충전 | 5회 | 3회 | 2회 |
| 대시 쿨다운 | 1.5초 | 2.0초 | 3.0초 |
| DDA | 활성 | 활성 | 비활성 |
| 보스 페이즈 | 2 | 3 | 4 |

---

## §9. 보스 설계 (6체)

### 9.1 보스 페이즈 전환 다이어그램

**Rock Titan (소행성대)**
```
[P1: HP 100%~66%] → [P2: HP 66%~33%] → [P3: HP 33%~0%]
    분열 공격          회전 돌진          코어 노출 + 소행성 폭풍
```

**Storm Weaver (성운)**
```
[P1: HP 100%~66%] → [P2: HP 66%~33%] → [P3: HP 33%~0%]
    촉수 휘두르기       번개 그물          전자기 폭풍 + 분신
```

**Gravity Maw (블랙홀)**
```
[P1: HP 100%~66%] → [P2: HP 66%~33%] → [P3: HP 33%~0%]
    중력 흡인          시공간 왜곡 공격     이벤트 호라이즌 (화면 축소)
```

**Crystal Warden (빙결)**
```
[P1: HP 100%~66%] → [P2: HP 66%~33%] → [P3: HP 33%~0%]
    빙결 레이저         결정 반사벽         절대영도 필드 + 유빙 소환
```

**Null Entity (공허)**
```
[P1: HP 100%~66%] → [P2: HP 66%~33%] → [P3: HP 33%~0%]
    형태 변환 (삼각→육각)  차원 분열 공격      현실 붕괴 (화면 글리치)
```

**Void Sentinel (히든) — 4페이즈**
```
[P1: HP 100%~75%] → [P2: HP 75%~50%] → [P3: HP 50%~25%] → [P4: HP 25%~0%]
    이전 보스 패턴 모방     다중 무기 사용       시험의 심판 (퀴즈)     진형 + 전 패턴 혼합
```

### 9.2 보스 등장 컷신
- **카메라 줌아웃** (1.0× → 0.7×, 1.5초)
- **보스명 + 이명 텍스트** (예: "ROCK TITAN — 소행성대의 수호자")
- **BGM 전환**: 탐사 BGM → 보스 BGM (크로스페이드 0.5초)
- **화면 흔들림** + 경고 사이렌 효과음

---

## §10. 프로시저럴 섹터 생성

### 10.1 SeededRNG 기반 생성
```javascript
// 시드 = 런 번호 × 1000 + 섹터 번호
const seed = runCount * 1000 + sectorIndex;
const rng = new SeededRNG(seed);

// 동일 시드 → 동일 섹터 (재현 가능)
function generateSector(rng, zone, difficulty) {
  return {
    enemies: generateEnemyWaves(rng, zone, difficulty),
    hazards: generateHazards(rng, zone),
    resources: generateResources(rng, zone),
    layout: generateLayout(rng, zone), // 소행성/성운/유빙 배치
  };
}
```

### 10.2 도달 가능성 검증 (Cycle 23 교훈)
- 섹터 생성 후 **BFS로 시작점→탈출 포탈 경로 존재 확인**
- 경로 미존재 시 시드+1로 재생성 (최대 5회)
- 환경 위험(소행성, 유빙)이 경로를 완전 차단하지 않도록 보장

### 10.3 섹터 간 연결 맵
```
소행성대(1-1 → 1-2 → 1-3[보스])
    ↓
성운(2-1 → 2-2 → 2-3[보스])
    ↓
블랙홀(3-1 → 3-2 → 3-3[보스])
    ↓
빙결(4-1 → 4-2 → 4-3[보스])
    ↓
공허(5-1 → 5-2 → 5-3[보스])
    ↓
히든(H-1[Void Sentinel]) ← 5보스 전원 처치 시 해금
```

---

## §11. 점수 시스템 및 저장

### 11.1 점수 산정 (F8: 판정 먼저, 저장 나중에)
```
점수 = 적 처치 점수 + 보스 처치 보너스 + 섹터 클리어 시간 보너스 + 자원 수집 보너스

적 처치: drone=50, cruiser=150, mine=100
보스: zone1=1000, zone2=2000, zone3=3000, zone4=4000, zone5=5000, hidden=10000
시간 보너스: max(0, (60 - clearTime) × 10) per wave
자원 보너스: 크리스탈 ×5, 데이터 ×10
```

> **순서**: ① 점수 계산 ② 하이스코어 비교/갱신 판정 ③ localStorage 저장

### 11.2 localStorage 스키마
```javascript
{
  "celestial-drift-save": {
    version: 2,
    highScore: 0,
    totalRuns: 0,
    bestSector: 0,     // 최대 도달 섹터
    upgrades: {
      attack: [0,0,0,0,0],   // 5레벨 각 트리
      defense: [0,0,0,0,0],
      explore: [0,0,0,0,0]
    },
    crystals: 0,
    bossesDefeated: [false,false,false,false,false,false],
    endings: { normal: false, true: false },
    settings: { difficulty: 1, bgm: true, sfx: true, lang: 'ko' }
  }
}
```

---

## §12. 로그라이트 시스템

### 12.1 아티팩트 목록 (14종)

| 등급 | ID | 이름 | 효과 | 캡 적용 |
|------|-----|------|------|---------|
| Common | C1 | 에너지 증폭기 | 에너지 최대량 +20% | — |
| Common | C2 | 합금 장갑 | 받는 피해 -10% | 방어 캡 50% |
| Common | C3 | 수집 드론 | 자원 수집 범위 +50% | — |
| Common | C4 | 추진 부스터 | 이동 속도 +15% | 속도 캡 200% |
| Common | C5 | 조준 보조 | 발사체 속도 +20% | — |
| Common | C6 | 수리 나노봇 | 웨이브 클리어 시 HP +5 회복 | — |
| Rare | R1 | 플라즈마 코어 | 무기 데미지 +30% | DPS 캡 200% |
| Rare | R2 | 위상 전환기 | 대시 쿨다운 -40% | — |
| Rare | R3 | 에너지 반사막 | 실드 파괴 시 주변 적에게 50 데미지 | — |
| Rare | R4 | 시간 감속기 | 적 이동/공격 속도 -20% | — |
| Rare | R5 | 행운의 코인 | 아티팩트 등급 상향 확률 +25% | — |
| Epic | E1 | 양자 분열포 | 발사체가 적 관통 + 분열 (3갈래) | DPS 캡 200% |
| Epic | E2 | 차원 앵커 | 피격 시 50% 확률로 피해 무효 | — |
| Epic | E3 | 성간 설계도 | 모든 업그레이드 효과 +50% | 시너지 캡 150% |

> **캡 초과 방지**: `applyArtifact()` 함수에서 캡 검증 후 적용. 캡 초과 아티팩트는 3택 선택지에서 **제외하지 않되**, 효과가 캡까지만 적용됨을 UI에 (MAX) 표시. (Cycle 27 교훈)

### 12.2 영구 업그레이드 3트리

**공격 트리 (크리스탈 소모)**
| Lv | 이름 | 효과 | 비용 |
|----|------|------|------|
| 1 | 기본 화력 | 무기 데미지 +10% | 50 |
| 2 | 연사 강화 | 발사 속도 +15% | 120 |
| 3 | 크리티컬 | 크리티컬 확률 +15% | 250 |
| 4 | 관통탄 | 발사체 관통 +1 | 500 |
| 5 | 오버드라이브 | 보스전 데미지 +25% | 1000 |

**방어 트리**
| Lv | 이름 | 효과 | 비용 |
|----|------|------|------|
| 1 | 강화 선체 | 최대 HP +15 | 50 |
| 2 | 실드 강화 | 실드 충전 +1 | 120 |
| 3 | 회피 기동 | 피격 시 20% 확률 회피 | 250 |
| 4 | 자동 수리 | 매 10초 HP +3 | 500 |
| 5 | 불멸 | 치사 피격 1회 생존 (런당 1회) | 1000 |

**탐사 트리**
| Lv | 이름 | 효과 | 비용 |
|----|------|------|------|
| 1 | 센서 확장 | 미니맵 범위 +30% | 50 |
| 2 | 자원 탐지 | 자원 위치 미니맵에 표시 | 120 |
| 3 | 하이퍼 드라이브 | 대시 거리 +30% | 250 |
| 4 | 스캐빈저 | 자원 드롭량 +40% | 500 |
| 5 | 차원 열쇠 | 히든 존 접근 (5보스 미처치도) | 1000 |

---

## §13. 사운드 시스템 (Web Audio API)

### 13.1 BGM
| 상태 | BGM | 구현 |
|------|-----|------|
| TITLE | 우주 앰비언트 (느린 패드) | OscillatorNode + GainNode 페이드 |
| EXPLORE | 탐사 테마 (중간 템포 아르페지오) | 3 Osc 레이어 |
| COMBAT | 전투 테마 (빠른 펄스) | 4 Osc + 필터 스윕 |
| BOSS | 보스 테마 (강렬한 베이스) | 5 Osc + 디스토션 |
| VICTORY | 승리 팡파르 | 짧은 멜로디 시퀀스 |

### 13.2 효과음 (8종+)
| ID | 상황 | 구현 |
|----|------|------|
| sfx-laser | 레이저 발사 | 고주파 사인파 감쇠 |
| sfx-missile | 미사일 발사 | 저주파 노이즈 + 사인파 |
| sfx-plasma | 플라즈마 발사 | 중주파 삼각파 + 비브라토 |
| sfx-explosion | 폭발 | 노이즈 버스트 + LP 필터 |
| sfx-shield | 실드 활성/피격 | 하이패스 핑 |
| sfx-dash | 대시 | 주파수 스윕 다운 |
| sfx-pickup | 자원 수집 | 상승 음계 3음 |
| sfx-boss-alert | 보스 등장 경고 | 저주파 사이렌 반복 |
| sfx-artifact | 아티팩트 선택 | 크리스탈 벨 |
| sfx-hit | 피격 | 저주파 펄스 |

---

## §14. 코드 위생 및 검증

### 14.1 수치 정합성 테이블 (F10)
> 기획서의 모든 수치는 CONFIG 상수와 1:1 대응. 구현자는 이 테이블로 검증.

| 기획서 값 | CONFIG 키 | 값 |
|----------|-----------|-----|
| 플레이어 기본 HP | CFG.PLAYER_HP | 100 |
| 대시 쿨다운 | CFG.DASH_CD | 2.0 |
| 실드 충전 횟수 | CFG.SHIELD_CHARGES | 3 |
| 실드 쿨다운 | CFG.SHIELD_CD | 8.0 |
| 아티팩트 DPS 캡 | CFG.ART_DPS_CAP | 2.0 |
| 시너지 캡 | CFG.ART_SYN_CAP | 1.5 |
| DDA Lv1 적 ATK 감소 | CFG.DDA_L1_ATK | 0.85 |
| DDA Lv2 적 HP 감소 | CFG.DDA_L2_HP | 0.80 |
| DDA Lv3 적 HP 감소 | CFG.DDA_L3_HP | 0.70 |
| 터치 최소 크기 | CFG.TOUCH_MIN | 48 |
| 크리티컬 Lv3 확률 | CFG.CRIT_L3 | 0.15 |

### 14.2 코드 위생 체크리스트
- [ ] `assets/` 디렉토리 존재하지 않음
- [ ] `ASSET_MAP`, `preloadAssets`, `SPRITES` 코드 0건
- [ ] `setTimeout` 0건
- [ ] `Math.random` 0건
- [ ] `confirm()`, `alert()`, `prompt()` 0건
- [ ] 외부 URL/CDN/Google Fonts 0건
- [ ] 전역 변수 직접 참조 드로잉 함수 0건
- [ ] 파라미터명 `t` 사용 0건 (→ `gt` 또는 `dt`)
- [ ] 모든 터치 타겟 ≥ 48px
- [ ] `applyArtifact()`에서 캡 검증 존재
- [ ] `bossRewardGiven` 플래그 존재
- [ ] RESTART_ALLOWED 화이트리스트 존재
- [ ] ACTIVE_SYSTEMS 매트릭스 모든 행에 Tween=true

### 14.3 스모크 테스트 게이트 (18항목)
1. `index.html` 존재 + 브라우저에서 열림
2. Canvas 렌더링 정상 (검은 화면 아님)
3. BOOT → TITLE 전환 (2초 내)
4. TITLE → HANGAR → SECTOR_SELECT → EXPLORE 전체 플로우
5. EXPLORE → COMBAT → BOSS 전투 플로우
6. BOSS 격파 → SECTOR_CLEAR → 아티팩트 선택
7. GAME_OVER → TITLE/HANGAR 복귀
8. VICTORY → TITLE 복귀
9. 키보드 입력 정상 (WASD + 공격 + 무기 전환)
10. 터치 입력 정상 (조이스틱 + 4버튼)
11. BGM 재생 + 음소거 토글
12. localStorage 저장/로드
13. `assets/` 디렉토리 미존재
14. `setTimeout` grep 0건
15. `Math.random` grep 0건
16. `ASSET_MAP`/`preloadAssets`/`SPRITES` grep 0건
17. 파라미터명 `t` grep 0건 (draw 함수 내)
18. 전체 플로우 회귀 테스트 (BOOT→TITLE→HANGAR→SECTOR_SELECT→EXPLORE→COMBAT→BOSS→VICTORY)

---

## §15. 다국어 지원

### 15.1 언어 전환
- 기본 언어: 한국어 (`ko`)
- 영어 UI: `en`
- 설정 화면에서 전환 가능
- `G.lang` 변수로 관리, `L(key)` 함수로 텍스트 조회

### 15.2 번역 키 예시
```javascript
const LANG = {
  ko: {
    title: '천체 표류',
    start: '시작',
    hangar: '격납고',
    attack: '공격',
    defense: '방어',
    explore: '탐사',
    // ...
  },
  en: {
    title: 'Celestial Drift',
    start: 'START',
    hangar: 'HANGAR',
    attack: 'ATTACK',
    defense: 'DEFENSE',
    explore: 'EXPLORE',
    // ...
  }
};
```

---

## §16. 게임 페이지 사이드바 정보

```yaml
game:
  title: "천체 표류"
  description: "우주 난파선에서 시작하여 5개 섹터를 표류하며 자원을 수집하고 함선을 강화하며 보스를 격퇴하는 우주 서바이벌 액션 로그라이트. 프로시저럴 생성 섹터, 14종 아티팩트, 3트리 영구 업그레이드, 6체 보스전."
  genre: ["action", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/방향키: 함선 이동"
    - "마우스 클릭/Z: 무기 발사"
    - "1/2/3: 무기 전환 (레이저/미사일/플라즈마)"
    - "Shift/X: 대시 (무적 회피)"
    - "E: 에너지 실드"
    - "Space: 스킬 발동"
    - "터치: 가상 조이스틱 + 공격/스킬/실드 버튼"
  tags:
    - "#우주"
    - "#서바이벌"
    - "#로그라이트"
    - "#액션"
    - "#캐주얼"
    - "#보스전"
    - "#업그레이드"
    - "#프로시저럴"
  addedAt: "2026-03-23"
  version: "1.0.0"
  featured: true
```

---

## §17. 썸네일 설계

**구도**: 화면 중앙에 "아스트라 호" 함선이 성운을 배경으로 거대한 보스 "Void Sentinel"과 대치하는 시네마틱 장면.
- 전경: 함선 (추진 불꽃 활성, 실드 발광)
- 중경: 보스 실루엣 (기하학적 형태, 눈 발광)
- 배경: 보라+시안 성운 그라데이션 + 별 필드
- 하단: 타이틀 "CELESTIAL DRIFT" 글로우 텍스트
- 목표 크기: 20KB+ SVG 상당 Canvas 드로잉 복잡도

---

## §18. 카메라 시스템

### 18.1 카메라 모드
| 모드 | 줌 레벨 | 사용 상태 |
|------|---------|----------|
| 기본 | 1.0× | EXPLORE, COMBAT |
| 줌아웃 | 0.7× | BOSS_INTRO (보스 전체 표시) |
| 줌인 | 1.3× | NARRATIVE (대화 포트레이트) |
| 셰이크 | ±5px | 피격, 폭발, 보스 등장 |
| 팬 | 부드러운 이동 | SECTOR_INTRO (섹터 전경 스캔) |

### 18.2 구현
```javascript
function applyCamera(ctx, camera) {
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x + camera.shakeX, -camera.y + camera.shakeY);
}
```

---

## 부록 A: 극단 빌드 밸런스 검증

### A.1 "화력 올인" 빌드
- 공격 트리 Lv5 + E1(양자 분열포) + R1(플라즈마 코어)
- 예상 DPS: 기본 25 × 1.5(업그레이드) × 1.3(R1) × 분열 효과 = ~73 (캡 미초과)
- 공허 보스 HP 8000 / DPS 73 = 110초 → 120초 제한 내 클리어 가능 ✅

### A.2 "탱커" 빌드
- 방어 트리 Lv5 + C2(합금 장갑) + E2(차원 앵커)
- 예상 EHP: (100+15) × 1.1 / (0.5 × 0.5) = 504
- 공허 존 웨이브당 피해: 30 × 0.4(피격률) × 14(적수) × 0.9(합금) = 151
- 생존 웨이브: 504/151 = 3.3 웨이브 → 5웨이브 존은 힐 필요 → C6 필요 ✅

### A.3 "탐사 특화" 빌드
- 탐사 트리 Lv5 + C3(수집 드론) + R5(행운)
- 자원 수집: ×1.4(Lv4) × 1.5(C3) = ×2.1
- DPS 부족으로 후반 보스 위험 → DDA Lv2로 보정 ✅
