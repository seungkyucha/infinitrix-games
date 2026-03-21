---
game-id: mini-idle-farm
title: 미니 아이들 팜
genre: casual
difficulty: easy
---

# 미니 아이들 팜 — 상세 기획서 (Cycle 13)

---

## §0. 이전 사이클 피드백 반영 매핑

| # | 출처 | 문제/제안 | 이번 기획 반영 방법 |
|---|------|----------|-------------------|
| 1 | Cycle 13 분석 보고서 | **arcade 장르 53.8% 과잉 편중** | ✅ casual + strategy 조합. arcade 미포함 |
| 2 | Cycle 13 분석 보고서 | **아이들/클리커 장르 0개 — 완전한 공백** | ✅ 플랫폼 최초 아이들 팜 장르 추가 |
| 3 | Cycle 13 분석 보고서 | **hard 난이도 게임 0개** | △ easy 기본 + 프레스티지로 실질 난이도 상승. 별도 hard 모드는 scope 외 |
| 4 | Cycle 12 포스트모템 | **"시뮬레이션 장르 도전" 직접 제안** | ✅ 아이들 농장 시뮬레이션으로 직접 반영 |
| 5 | Cycle 12 포스트모템 | **"아이들(Cycle 11) + 경영(Cycle 8) 노하우 결합"** | ✅ Cycle 11 아이들 생산 파이프라인 + Cycle 8 타이쿤 업그레이드 경제 결합 |
| 6 | Cycle 12 포스트모템 | **"공용 엔진 모듈 분리" 제안** | §12.10 — 본 기획 범위 외. TweenManager/ObjectPool/SoundManager 동일 인터페이스 유지 |
| 7 | Cycle 12 포스트모템 | **assets/ 디렉토리 12사이클 연속 재발** | §12.1 — Canvas API 전용. assets/ 디렉토리 **생성 자체 절대 금지**. 모든 그래픽은 코드 드로잉 |
| 8 | Cycle 12 포스트모템 | **일시정지 버튼 WCAG 44×44px 미달** | §4.5 — 모든 터치 타겟 최소 48×48px (WCAG AAA 수준) |
| 9 | Cycle 12 포스트모템 | **데드 코드(빈 if 블록) 잔존** | §12.2 — 임시 코드 블록 금지. 모든 블록에 실행 코드 또는 TODO 주석 필수 |
| 10 | Cycle 12 포스트모템 | **2회 리뷰 소요 — 1회차 APPROVED 목표** | §12 전체 — 30항목+ 사전 검증 체크리스트로 1회차 통과 목표 |
| 11 | platform-wisdom [Cycle 1~13] | **assets/ 디렉토리 13사이클 연속 재발** | §12.1 — 100% Canvas 코드 드로잉. assets/ 생성 절대 금지. 템플릿 복사 금지 |
| 12 | platform-wisdom [Cycle 13] | **index.html 미생성 — 구현 0%로 리뷰 제출** | §12.0 — 리뷰 제출 전 스모크 테스트 필수 게이트 |
| 13 | platform-wisdom [Cycle 13] | **보일러플레이트 복사 시 장르 무관 에셋 생성** | §12.1 — 템플릿 복사 금지. 빈 index.html에서 처음부터 작성 |
| 14 | platform-wisdom [Cycle 1] | **iframe 내 confirm()/alert() 금지** | 모든 모달/다이얼로그는 Canvas 기반 커스텀 UI |
| 15 | platform-wisdom [Cycle 2] | **상태 x 시스템 매트릭스 필수** | §5.3 — 5상태 x 6시스템 매트릭스 포함 |
| 16 | platform-wisdom [Cycle 3] | **tween onComplete 가드 플래그** | §5.2 — 모든 상태 전환에 `_transitioning` 가드 플래그 적용 |
| 17 | platform-wisdom [Cycle 4] | **cancelAll+add 경쟁 조건** | §8.3 — clearImmediate() 즉시 정리 API 사용 |
| 18 | platform-wisdom [Cycle 2] | **setTimeout 상태 전환 금지** | §5 — 모든 지연 전환은 tween onComplete. setTimeout 사용 0건 목표 |
| 19 | platform-wisdom [Cycle 5] | **단일 값 갱신 경로 통일** | 하나의 값은 tween OR 직접 대입 중 하나만 사용 |
| 20 | platform-wisdom [Cycle 6-7] | **순수 함수 원칙** | §10 — 모든 게임 로직 함수는 파라미터 기반 순수 함수 |
| 21 | platform-wisdom [Cycle 7] | **기획-구현 수치 불일치** | §6, §7 — CONFIG 객체에 모든 수치 집중. 기획서 수치표와 1:1 대조 |
| 22 | platform-wisdom [Cycle 8] | **beginTransition() 미경유** | §5.2 — 모든 전환이 `beginTransition()` 경유. 즉시 전환도 `{immediate:true}` |
| 23 | platform-wisdom [Cycle 10] | **수정 회귀 — 시그니처 변경 시 호출부 전파 누락** | §12.4 — 함수 시그니처 변경 시 모든 호출부 전수 검증 |
| 24 | platform-wisdom [Cycle 11] | **let/const TDZ 크래시** | §12.7 — 모든 변수는 최초 참조 이전에 선언. 초기화 순서 명시적 검증 |
| 25 | platform-wisdom [Cycle 11] | **아이들 게임 탭 전환 시 생산 멈춤** | §5.3 — 백그라운드 시스템(생산/자동 수확)은 UI 탭과 무관하게 항상 동작 |
| 26 | platform-wisdom [Cycle 2-3] | **유령 변수 방지** | §12.2 — 선언된 변수 사용처 전수 검증 체크리스트 |
| 27 | platform-wisdom [Cycle 10] | **게임 루프 try-catch 래핑 필수** | §12.9 — `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` 패턴 |
| 28 | platform-wisdom [Cycle 12] | **매 프레임 localStorage 접근 금지** | §8.2 — saveData는 인메모리 객체 참조. 저장은 30초 자동 + 이벤트 시점만 |
| 29 | platform-wisdom [Cycle 12] | **"절반 구현" 방지 — 세부 체크리스트** | §12.6 — 각 기능의 A+B 명세를 개별 항목으로 분리하여 검증 |
| 30 | platform-wisdom [Cycle 12] | **터치 타겟 최소 44x44px** | §4.5 — 모든 터치 타겟 48x48px 이상 (WCAG AAA) |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
작은 빈 땅에서 시작해 **작물 재배 -> 가축 사육 -> 가공 -> 판매**로 농장 제국을 키우는 **아이들 시뮬레이션**. 탭으로 수확하면 즉시 보상, 자동화 업그레이드를 구매하면 놓고 있어도 수익이 쌓인다. 프레스티지(농장 리셋)로 영구 성장 배율을 얻어 "매번 더 빠른 성장"을 체감하는 것이 장기 목표다. 1세션 1분~무제한, 총 컨텐츠 소모 약 60~90분(프레스티지 3~4회).

### 핵심 재미 3요소
1. **탭->보상의 즉각적 쾌감**: 작물/가축을 탭하면 골드 팝업 + 수확 파티클이 터지며 즉시 보상. "한 번만 더 탭" 중독성
2. **자동화의 최적화 쾌감**: 자동 수확기/자동 급식기 등 업그레이드를 사면 플레이어 개입 없이 수입이 발생. "어떤 자동화를 먼저 사야 효율적인가?" 전략적 선택
3. **프레스티지 리셋의 성장 루프**: 농장을 리셋하면 영구 배율(star)이 쌓여 다음 회차가 기하급수적으로 빨라짐. "언제 리셋하면 최적인가?" 의사결정

### 레퍼런스
- **Cookie Clicker**: 아이들 장르의 교과서. 클릭 -> 자동화 -> 프레스티지의 3단 루프
- **AdVenture Capitalist**: 복수 사업체 병렬 성장 + 엔젤 프레스티지 시스템
- **Idle Miner Tycoon**: 채굴->운반->판매 파이프라인과 매니저 자동화
- **Cell to Singularity**: 기하급수적 성장 곡선과 메타 프레스티지

### 게임 페이지 사이드바 정보
```yaml
title: "미니 아이들 팜"
description: "빈 땅에서 시작해 작물, 가축, 가공으로 농장 제국을 키우는 아이들 시뮬레이션. 탭으로 수확하고, 자동화하고, 프레스티지로 더 빠르게 성장하라!"
genre: ["casual", "strategy"]
playCount: 0
rating: 0
controls:
  - "마우스: 클릭으로 수확/구매/탭 전환"
  - "터치: 탭으로 수확/구매, 스와이프로 탭 전환"
  - "키보드: 1~3 탭 전환 / Space 수동 수확 / P 일시정지"
tags:
  - "#아이들"
  - "#농장"
  - "#시뮬레이션"
  - "#방치형"
  - "#프레스티지"
addedAt: "2026-03-21"
version: "1.0.0"
featured: true
```

---

## §2. 게임 규칙 및 목표

### 2.1 기본 규칙
- 플레이어는 **6칸 농장 그리드**(2행 x 3열)를 운영한다
- 각 칸에 **작물** 또는 **가축**을 배치하여 자원을 생산한다
- 생산된 자원을 **판매**하여 골드(G)를 벌고, 골드로 **업그레이드**를 구매한다
- 모든 자원은 자동 생산되며, 탭하면 즉시 수확(보너스 +50%)

### 2.2 3단계 농장 확장
| 단계 | 해금 조건 | 추가 요소 | 칸 수 |
|------|----------|----------|------|
| **1단계: 밭** | 시작 시 | 작물 4종 (밀, 당근, 토마토, 옥수수) | 6칸 |
| **2단계: 목장** | 총 수입 5,000G | 가축 3종 (닭, 젖소, 양) | +4칸 (총 10칸) |
| **3단계: 가공공장** | 총 수입 50,000G | 가공품 3종 (빵, 치즈, 스웨터) | +2칸 (총 12칸) |

### 2.3 자원 생산 체인
```
[밀] -----------> 판매 (2G/개)
[밀] + [젖소->우유] -> [빵] -> 판매 (25G/개)
[당근] ----------> 판매 (3G/개)
[토마토] ---------> 판매 (5G/개)
[옥수수] ---------> 판매 (4G/개)
[닭->계란] -------> 판매 (8G/개)
[젖소->우유] -----> 판매 (12G/개)
[젖소->우유] -> [치즈] -> 판매 (35G/개)
[양->양모] -------> 판매 (15G/개)
[양->양모] ------> [스웨터] -> 판매 (50G/개)
```

### 2.4 승리 조건
- **명시적 승리 없음** — 아이들 장르 특성상 무한 진행
- **마일스톤 목표**: 총 수입 100만G 달성 시 "농장 마스터" 칭호 + 특별 파티클

### 2.5 프레스티지 시스템
- 총 수입 10,000G 이상일 때 프레스티지 가능
- 프레스티지 시 모든 작물/가축/업그레이드/골드 초기화
- **별** 획득: `floor(sqrt(totalEarned / 1000))`
- 별 1개당 **전체 생산 속도 +10%** 영구 배율
- 프레스티지 횟수, 최대 별, 최단 시간 등 통계 기록

---

## §3. 조작 방법

### 3.1 마우스
| 동작 | 기능 |
|------|------|
| **좌클릭 - 작물/가축** | 즉시 수확 (기본 수확 + 50% 보너스) |
| **좌클릭 - 빈 칸** | 작물/가축 배치 메뉴 오픈 |
| **좌클릭 - 업그레이드 버튼** | 업그레이드 구매 |
| **좌클릭 - 탭 버튼** | 탭 전환 (농장 / 업그레이드 / 프레스티지) |
| **호버 - 업그레이드** | 툴팁 표시 (효과, 비용, 현재 레벨) |

### 3.2 터치
| 동작 | 기능 |
|------|------|
| **탭 - 작물/가축** | 즉시 수확 (마우스 좌클릭과 동일) |
| **탭 - 빈 칸** | 배치 메뉴 오픈 |
| **탭 - 버튼** | 업그레이드 구매 / 탭 전환 |
| **롱프레스(500ms) - 업그레이드** | 연속 구매 (100ms 간격 자동 반복) |
| **좌우 스와이프** | 탭 전환 (농장 <-> 업그레이드 <-> 프레스티지) |

### 3.3 키보드
| 키 | 기능 |
|----|------|
| **1, 2, 3** | 탭 전환 (1=농장, 2=업그레이드, 3=프레스티지) |
| **Space** | 모든 준비된 작물/가축 일괄 수확 |
| **P** | 일시정지 토글 |
| **S** | 즉시 저장 |

---

## §4. 시각적 스타일 가이드

### 4.1 전체 테마
**픽셀풍 파스텔 농장** — 부드러운 파스텔 색상 + 단순한 기하학적 도형으로 귀여운 농장을 표현. 모든 그래픽은 Canvas API (drawRect, fillText, arc, beginPath)로 100% 코드 드로잉. **외부 에셋 0개.**

### 4.2 색상 팔레트

| 용도 | HEX | 설명 |
|------|-----|------|
| 배경 - 하늘 | `#87CEEB` | 밝은 하늘색 |
| 배경 - 땅 | `#8B7355` | 따뜻한 갈색 |
| 배경 - 잔디 | `#7EC850` | 선명한 초록 |
| 밭 - 흙 | `#6B4226` | 진한 갈색 |
| 밭 - 작물 (밀) | `#F5DEB3` | 밀색 |
| 밭 - 작물 (당근) | `#FF8C00` | 오렌지 |
| 밭 - 작물 (토마토) | `#FF4444` | 빨강 |
| 밭 - 작물 (옥수수) | `#FFD700` | 금색 |
| 목장 - 울타리 | `#DEB887` | 연한 나무색 |
| 목장 - 닭 | `#FFFFFF` | 흰색 + 빨간 벼슬 |
| 목장 - 젖소 | `#F5F5F5` | 흰색 + 검은 반점 |
| 목장 - 양 | `#FFFAF0` | 크림색 솜뭉치 |
| 공장 - 건물 | `#B0C4DE` | 밝은 회청색 |
| UI - 골드 | `#FFD700` | 금색 |
| UI - 프레스티지 별 | `#FFB347` | 주황별 |
| UI - 버튼 기본 | `#4CAF50` | 초록 |
| UI - 버튼 비활성 | `#9E9E9E` | 회색 |
| UI - 텍스트 | `#333333` | 진한 회색 |
| UI - 배경 패널 | `#FAEBD7` | 앤틱 화이트 (alpha 0.9) |

### 4.3 오브젝트 형태
- **작물**: 성장 단계 3단계(씨앗=작은 원, 싹=초록 삼각형, 수확=컬러 원+잎). 성장률 0~1을 기반으로 보간
- **가축**: 단순 기하학 (닭=삼각+원, 소=큰 사각+원+뿔, 양=원+물결 외곽선). 2프레임 대기 애니메이션(좌우 미세 이동)
- **가공공장**: 사각형 건물 + 굴뚝(연기 파티클) + 회전 기어 아이콘
- **수확 이펙트**: 골드 숫자 팝업(+NNG, 위로 떠오르며 fade) + 작은 별 파티클 4~6개
- **프레스티지 이펙트**: 화면 전체 황금빛 플래시 + 별 소용돌이 파티클 20개

### 4.4 레이아웃 (Canvas 960x640 기준, DPR 대응)
```
+---------------------------------------------------+
| [*3] 미니 아이들 팜    G 12,345G    [PAUSE 48x48] |  <- 상단 바 (48px)
+---------------------------------------------------+
|                                                   |
|    +------+ +------+ +------+                     |
|    | 밀   | | 당근 | | 토마 |                     |
|    +------+ +------+ +------+                     |
|    +------+ +------+ +------+                     |  <- 농장 그리드 (메인 영역)
|    | 옥수 | | 닭   | | 소   |                     |
|    +------+ +------+ +------+                     |
|    +------+ +------+ +------+ +------+            |
|    | 양   | | 빵   | | 치즈 | | 스웨 |            |  <- 확장 시
|    +------+ +------+ +------+ +------+            |
|                                                   |
+---------------------------------------------------+
|  [농장]  [업그레이드]  [프레스티지]                 |  <- 하단 탭 바 (56px)
+---------------------------------------------------+
```

### 4.5 터치 타겟 규격
| UI 요소 | 최소 크기 | 적용 |
|---------|----------|------|
| 일시정지 버튼 | 48x48px | WCAG AAA |
| 탭 전환 버튼 | 높이 56px, 너비 균등분할 | 터치 친화 |
| 업그레이드 항목 | 높이 64px | 롱프레스 영역 확보 |
| 농장 칸 | 최소 80x80px | 탭 수확 편의 |
| 배치 메뉴 항목 | 높이 56px | 터치 선택 |

---

## §5. 핵심 게임 루프

### 5.1 프레임 단위 로직 흐름 (60fps 기준)
```
requestAnimationFrame(loop)
|
+-- 1. dt 계산 (deltaTime, cap: 100ms)
+-- 2. if (state === PAUSED) -> renderOnly(); return
+-- 3. TweenManager.update(dt)
+-- 4. updateProduction(dt, farmState)        <- 모든 UI 탭에서 호출 (백그라운드 시스템)
|     +-- 각 칸의 growthTimer += dt * speedMult * prestigeMult
|     +-- growthTimer >= growthTime -> readyToHarvest = true
|     +-- autoHarvest 활성 시 -> 자동 수확 + 골드 추가
+-- 5. updateAutoSave(dt)                     <- 30초 간격 자동 저장
+-- 6. updateParticles(dt)                    <- ObjectPool 기반 파티클 시스템
+-- 7. updateAnimations(dt)                   <- 가축 대기 모션, 공장 기어 회전
+-- 8. render(ctx, farmState, uiState)
|     +-- drawBackground(ctx)
|     +-- drawFarmGrid(ctx, farmState)
|     +-- drawUI(ctx, uiState)                <- 현재 탭에 맞는 UI 렌더
|     +-- drawParticles(ctx, particles)
|     +-- drawPopups(ctx, popups)             <- 골드 팝업 숫자
+-- 9. try-catch 래핑 + requestAnimationFrame(loop)
```

### 5.2 상태 머신
```
LOADING -> TITLE -> PLAYING -> PAUSED
                     |   ^       |  ^
                     v   |       v  |
                   PRESTIGE_CONFIRM
                     |
                     v
                   PLAYING (리셋 후)
```

| 상태 | 설명 | 진입 조건 |
|------|------|----------|
| `LOADING` | 초기화, 저장 데이터 로드 | 페이지 로드 |
| `TITLE` | 타이틀 화면, "시작" / "이어하기" 선택 | 초기 상태 / 메뉴 이동 |
| `PLAYING` | 메인 게임 루프 (생산, 수확, 구매) | 타이틀에서 시작 |
| `PAUSED` | 일시정지 (생산 정지, UI 오버레이) | P키 / 정지 버튼 |
| `PRESTIGE_CONFIRM` | 프레스티지 확인 Canvas 모달 | 프레스티지 탭에서 "리셋" 클릭 |

**상태 전환 규칙:**
- 모든 전환은 `beginTransition(nextState, options)` 경유
- PAUSED <-> PLAYING은 `{immediate: true}` 옵션
- PRESTIGE_CONFIRM -> PLAYING은 fade-out(300ms) -> 리셋 -> fade-in(300ms)
- 전환 중 `_transitioning = true` 가드로 중복 전환 차단

### 5.3 상태 x 시스템 업데이트 매트릭스

| 시스템 | LOADING | TITLE | PLAYING | PAUSED | PRESTIGE_CONFIRM |
|--------|---------|-------|---------|--------|-----------------|
| **TweenManager** | X | O | O | O | O |
| **생산(Production)** | X | X | O | X | X |
| **파티클(Particles)** | X | O | O | X | O |
| **자동저장(AutoSave)** | X | X | O | X | X |
| **입력(Input)** | X | O | O | O | O |
| **렌더(Render)** | O | O | O | O | O |

**핵심: `updateProduction()`은 PLAYING 상태에서만 호출되지만, UI 탭(농장/업그레이드/프레스티지) 전환과 무관하게 항상 실행된다. [Cycle 11 교훈: 아이들 게임에서 탭 전환 시 생산이 멈추면 안 된다]**

---

## §6. 난이도 시스템

### 6.1 자원 생산 수치 (CONFIG 객체 1:1 매핑)

| 자원 | 기본 생산 시간 | 기본 수확량 | 판매가 | 해금 비용 |
|------|--------------|-----------|--------|----------|
| 밀 | 3초 | 1개 | 2G | 0G (시작) |
| 당근 | 5초 | 1개 | 3G | 50G |
| 토마토 | 8초 | 1개 | 5G | 200G |
| 옥수수 | 6초 | 1개 | 4G | 120G |
| 닭(계란) | 10초 | 1개 | 8G | 500G |
| 젖소(우유) | 15초 | 1개 | 12G | 1,500G |
| 양(양모) | 12초 | 1개 | 15G | 2,000G |
| 빵 | 20초 | 1개 | 25G | 8,000G |
| 치즈 | 25초 | 1개 | 35G | 15,000G |
| 스웨터 | 30초 | 1개 | 50G | 25,000G |

### 6.2 업그레이드 트리

#### 생산 속도 업그레이드 (각 자원별)
| 레벨 | 비용 공식 | 효과 |
|------|----------|------|
| 1~5 | `baseCost * 1.5^level` | 생산 시간 -10% (누적) |
| 6~10 | `baseCost * 1.8^level` | 생산 시간 -8% (누적) |
| 최대 레벨: 10 | -- | 최종 생산 시간 = 기본 x 0.43 |

#### 수확량 업그레이드 (각 자원별)
| 레벨 | 비용 공식 | 효과 |
|------|----------|------|
| 1~5 | `baseCost * 2.0^level` | 수확량 +1개 (누적) |
| 최대 레벨: 5 | -- | 최종 수확량 = 기본 + 5개 |

#### 자동화 업그레이드 (글로벌)
| 업그레이드 | 비용 | 효과 |
|-----------|------|------|
| 자동 수확기 Lv1 | 500G | 밭 작물 자동 수확 (수동 보너스 없음) |
| 자동 수확기 Lv2 | 5,000G | 목장 가축 자동 수확 |
| 자동 수확기 Lv3 | 30,000G | 가공공장 자동 수확 |
| 자동 판매기 | 2,000G | 수확물 즉시 자동 판매 (수동: 판매 버튼 클릭 필요) |
| 비료 | 10,000G | 전체 생산 속도 x1.5 |
| 황금 비료 | 100,000G | 전체 생산 속도 x2.0 (비료와 중첩) |

### 6.3 프레스티지 업그레이드 (별 소비)

| 업그레이드 | 별 비용 | 효과 | 최대 레벨 |
|-----------|--------|------|----------|
| 비옥한 토양 | 1 | 작물 생산 시간 -15% | 5 |
| 좋은 사료 | 2 | 가축 생산 시간 -15% | 5 |
| 장인 기술 | 3 | 가공 판매가 +20% | 5 |
| 행운의 수확 | 2 | 수동 수확 시 2배 확률 10% | 5 |
| 큰 농장 | 5 | 시작 시 추가 칸 +1 | 3 |
| 빠른 시작 | 3 | 프레스티지 후 시작 골드 +500G | 5 |

### 6.4 시간에 따른 난이도 곡선
- **0~5분**: 밭 작물로 기초 경제 구축. 수동 탭이 주 수입원
- **5~15분**: 목장 해금. 자동 수확기 구매로 아이들 전환 시작
- **15~30분**: 가공공장 해금. 가공품이 주 수입원. 프레스티지 1차 가능
- **30분~**: 프레스티지 반복. 매 회차 2배+ 빠른 성장. 프레스티지 업그레이드로 전략적 특화

### 6.5 오프라인 수입 계산
- 게임 재접속 시 `경과 시간(최대 4시간) * 자동 생산율 * 0.5` 오프라인 수입 지급
- 오프라인 배율 0.5는 온라인 플레이 동기 유지를 위한 의도적 설계
- 접속 시 "오프라인 수입: +N,NNNG!" 팝업 + 골드 셔워 파티클

---

## §7. 점수 시스템

### 7.1 점수 = 총 수입(totalEarned)
- 아이들 장르 특성상 별도 "점수"보다 **총 수입(G)**이 진행도 지표
- localStorage에 기록: `totalEarned`, `maxPrestigeStars`, `prestigeCount`, `fastestPrestige`

### 7.2 마일스톤 표시
| 총 수입 | 칭호 | 보상 |
|---------|------|------|
| 1,000G | 초보 농부 | -- |
| 10,000G | 숙련 농부 | 프레스티지 해금 |
| 100,000G | 농장주 | -- |
| 1,000,000G | 농장 마스터 | 특별 파티클 (황금 빗줄기) |
| 10,000,000G | 농업 제왕 | 특별 배경 (황금 하늘) |

### 7.3 숫자 표시 형식
- 1,000 이상: `1.2K`
- 1,000,000 이상: `1.5M`
- 1,000,000,000 이상: `2.1B`
- 소수점 첫째 자리까지 (예: `12.3K`)

### 7.4 저장 데이터 구조
```javascript
const SAVE_KEY = 'miniIdleFarm_v1';
const defaultSaveData = {
  gold: 0,
  totalEarned: 0,
  plots: [], // [{type, level, growthTimer, speedLevel, yieldLevel}]
  upgrades: { autoHarvest: 0, autoSell: false, fertilizer: 0 },
  prestige: { stars: 0, totalStars: 0, count: 0, upgrades: {} },
  stats: { fastestPrestige: Infinity, totalClicks: 0, startTime: 0 },
  lastSaveTime: Date.now()
};
```

---

## §8. 기술 사양

### 8.1 CONFIG 객체 (기획서 §6 수치와 1:1 대응)
```javascript
const CONFIG = {
  // §6.1 자원 수치
  CROPS: {
    wheat:   { growTime: 3, baseYield: 1, sellPrice: 2,  unlockCost: 0 },
    carrot:  { growTime: 5, baseYield: 1, sellPrice: 3,  unlockCost: 50 },
    tomato:  { growTime: 8, baseYield: 1, sellPrice: 5,  unlockCost: 200 },
    corn:    { growTime: 6, baseYield: 1, sellPrice: 4,  unlockCost: 120 },
  },
  ANIMALS: {
    chicken: { growTime: 10, baseYield: 1, sellPrice: 8,  unlockCost: 500 },
    cow:     { growTime: 15, baseYield: 1, sellPrice: 12, unlockCost: 1500 },
    sheep:   { growTime: 12, baseYield: 1, sellPrice: 15, unlockCost: 2000 },
  },
  FACTORY: {
    bread:   { growTime: 20, baseYield: 1, sellPrice: 25, unlockCost: 8000 },
    cheese:  { growTime: 25, baseYield: 1, sellPrice: 35, unlockCost: 15000 },
    sweater: { growTime: 30, baseYield: 1, sellPrice: 50, unlockCost: 25000 },
  },

  // §6.2 업그레이드 수치
  SPEED_UPGRADE: {
    baseMult: 1.5,
    maxLevel: 10,
    reductionPerLevel: [0.10, 0.10, 0.10, 0.10, 0.10, 0.08, 0.08, 0.08, 0.08, 0.08]
  },
  YIELD_UPGRADE: { baseMult: 2.0, maxLevel: 5 },
  AUTO_HARVEST_COST: [500, 5000, 30000],
  AUTO_SELL_COST: 2000,
  FERTILIZER_COST: [10000, 100000],
  FERTILIZER_MULT: [1.5, 2.0],

  // §6.3 프레스티지 수치
  PRESTIGE_THRESHOLD: 10000,
  PRESTIGE_STAR_FORMULA: function(totalEarned) {
    return Math.floor(Math.sqrt(totalEarned / 1000));
  },
  PRESTIGE_SPEED_BONUS: 0.10,   // 별 1개당 +10%

  // §6.5 오프라인
  OFFLINE_MAX_HOURS: 4,
  OFFLINE_MULT: 0.5,

  // §8.2 저장
  AUTO_SAVE_INTERVAL: 30,  // 초

  // §4.5 UI
  MIN_TOUCH_TARGET: 48,    // px
  MANUAL_HARVEST_BONUS: 1.5,

  // §2.2 확장 조건
  RANCH_UNLOCK: 5000,
  FACTORY_UNLOCK: 50000,

  // §7.2 마일스톤
  MILESTONES: [
    { threshold: 1000,     title: '초보 농부' },
    { threshold: 10000,    title: '숙련 농부' },
    { threshold: 100000,   title: '농장주' },
    { threshold: 1000000,  title: '농장 마스터' },
    { threshold: 10000000, title: '농업 제왕' },
  ],
};
```

### 8.2 저장 정책
- **자동 저장**: 30초 간격 (`AUTO_SAVE_INTERVAL`)
- **이벤트 저장**: 업그레이드 구매, 프레스티지 실행, 칸 배치 변경 시
- **인메모리 객체 참조**: `saveData` 객체를 메모리에 유지, localStorage 접근은 저장 시점에만 수행 [Cycle 12 교훈]
- **try-catch 래핑**: localStorage 접근 실패 시 게임 계속 진행 가능
- **판정 먼저, 저장 나중**: 마일스톤 달성 판정 -> 팝업 표시 -> 저장 순서 [Cycle 2 교훈]

### 8.3 공유 엔진 모듈 (동일 인터페이스)
- **TweenManager**: UI 전환, 골드 팝업, 프레스티지 이펙트. `clearImmediate()` API 포함 [Cycle 4-5]
- **ObjectPool**: 파티클(수확 별 50개, 골드 숫자 20개) 사전 할당
- **SoundManager**: Web Audio 절차적 사운드 (수확 팝, 구매 차임, 레벨업 팡파르, 프레스티지 사운드)
- **TransitionGuard**: `beginTransition()` + `STATE_PRIORITY` + `_transitioning` 가드

### 8.4 사운드 디자인 (Web Audio 절차적)
| 이벤트 | 사운드 | 구현 |
|--------|--------|------|
| 수동 수확 | 밝은 "팝" | Sine 880Hz, 0.05s decay |
| 자동 수확 | 부드러운 "틱" | Sine 440Hz, 0.03s decay, vol 0.3 |
| 업그레이드 구매 | 상승 차임 | Sine C5->E5->G5, 각 0.08s |
| 칸 해금 | 팡파르 | Sine C4->E4->G4->C5, 각 0.1s |
| 프레스티지 | 장엄한 상승음 | Sine C4->G4->C5->E5->G5, 각 0.12s + reverb |
| 마일스톤 달성 | 축하 효과음 | Sine 화음(C+E+G) 0.3s + Triangle 베이스 |

---

## §9. UI 상세

### 9.1 탭 구성

#### 탭 1: 농장 (기본)
- 상단: 골드 표시 + 일시정지 버튼(48x48) + 프레스티지 별 수
- 중앙: 2x3 (확장 시 3x4) 농장 그리드
  - 각 칸: 작물/가축 아이콘 + 성장 진행 바(하단) + 준비 완료 시 반짝 표시
  - 빈 칸: "+" 아이콘 (탭하면 배치 메뉴)
- 하단: 탭 전환 바 (높이 56px)

#### 탭 2: 업그레이드
- 스크롤 가능한 업그레이드 목록 (각 항목 높이 64px)
- 각 항목: 아이콘 | 이름 | 현재 레벨/최대 | 효과 설명 | 비용 버튼
- 구매 불가 시 버튼 회색 + 비용 빨간색
- 카테고리: 생산 속도 / 수확량 / 자동화 / 특수

#### 탭 3: 프레스티지
- 현재 총 수입 표시
- 리셋 시 획득할 별 수 미리보기: "리셋하면 N개 획득!"
- 현재 보유 별 + 프레스티지 업그레이드 목록
- "농장 리셋" 버튼 (totalEarned < PRESTIGE_THRESHOLD이면 비활성)
- 통계: 프레스티지 횟수, 최대 별, 최단 프레스티지 시간

### 9.2 Canvas 모달 (confirm/alert 대체)
- 프레스티지 확인: "정말 농장을 리셋하시겠습니까?\nN개 별을 획득합니다." + [확인] [취소]
- 반투명 검정 오버레이(alpha 0.7) + 중앙 패널(400x200px) + tween fade-in
- 모달 활성 시에도 TweenManager.update() 호출 [Cycle 2 교훈]

### 9.3 배치 메뉴
- 빈 칸 클릭 시 해당 칸 위에 팝업 메뉴 표시
- 현재 해금된 작물/가축/가공품 목록
- 각 항목: 아이콘 + 이름 + 배치 비용(첫 배치 무료, 변경 시 비용의 50%)
- 메뉴 외부 클릭 시 닫기

### 9.4 오프라인 수입 팝업
- 재접속 시 화면 중앙에 팝업: "환영합니다! 오프라인 수입: +N,NNNG"
- 골드 색상 텍스트 + 아래에서 위로 날아오는 코인 파티클 10개
- 3초 후 자동 닫힘 또는 탭으로 즉시 닫기

---

## §10. 순수 함수 설계 원칙

모든 게임 로직 함수는 **파라미터를 통해 데이터를 받는 순수 함수**로 작성한다. 전역 상태 직접 참조 금지. [Cycle 6-7 교훈]

### 함수 시그니처 목록
```javascript
// 생산 시스템
function updateProduction(dt, plots, config, prestigeMult) // -> updatedPlots
function calculateYield(plot, config, prestigeUpgrades) // -> number
function calculateGrowthTime(plot, config, prestigeUpgrades, fertilizerMult) // -> number

// 경제 시스템
function canAfford(gold, cost) // -> boolean
function purchaseUpgrade(gold, upgrade, level, config) // -> {newGold, newLevel}
function calculateUpgradeCost(baseCost, level, multiplier) // -> number
function sellResource(resource, amount, config, prestigeUpgrades) // -> goldEarned

// 프레스티지 시스템
function calculatePrestigeStars(totalEarned, config) // -> number
function applyPrestigeReset(saveData, newStars) // -> newSaveData
function calculatePrestigeMult(stars, config) // -> number

// 오프라인 수입
function calculateOfflineEarnings(lastSaveTime, plots, config, prestigeMult) // -> gold

// 숫자 포맷
function formatNumber(n) // -> string  (1234 -> "1.2K")
function formatTime(seconds) // -> string  (125 -> "2:05")

// 렌더링 (순수 함수 - ctx만 side-effect)
function drawPlot(ctx, x, y, w, h, plot, config) // -> void
function drawUpgradeItem(ctx, x, y, w, h, upgrade, canBuy) // -> void
function drawProgressBar(ctx, x, y, w, h, progress, color) // -> void
```

---

## §11. 성능 최적화

### 11.1 렌더링 최적화
- **변경 감지 렌더링**: farmDirty 플래그가 true일 때만 농장 그리드 재렌더. 매 프레임 full redraw 회피
- **offscreen canvas 캐시**: 배경(하늘+잔디+땅)은 리사이즈 시에만 재생성하여 캐시 [Cycle 5 패턴]
- **파티클 ObjectPool**: 수확 파티클 50개 + 골드 팝업 20개 사전 할당. GC 스파이크 방지

### 11.2 연산 최적화
- **인메모리 saveData**: localStorage 접근은 저장 시점에만 수행 (30초 간격 + 이벤트)
- **생산 계산 배치**: 매 프레임 개별 plot 순회하되 비용 O(N) (N=최대 12칸으로 경량)
- **타이머 기반**: 물리 엔진/충돌 판정 없음. delta-time 기반 타이머만 사용하여 CPU 부하 최소

### 11.3 메모리 최적화
- 전체 객체 수 상한: plot 12 + particle 70 + popup 20 + tween 10 = 약 112개
- 대규모 배열/맵 없음. 가벼운 메모리 풋프린트

---

## §12. 구현 체크리스트 및 품질 게이트

### §12.0 리뷰 제출 전 스모크 테스트 (MANDATORY) [Cycle 13 CRITICAL 교훈]
- [ ] `index.html` 파일 존재 확인 (`test -f index.html`)
- [ ] 브라우저에서 페이지 로드 성공 (빈 화면 아님)
- [ ] 콘솔 에러 0건, 경고 0건
- [ ] 타이틀 화면 표시 -> 클릭 -> 게임 시작 확인
- [ ] 최소 1회 수확 -> 골드 증가 확인

### §12.1 에셋 제로 정책 (13사이클 연속 재발 대응)
- [ ] `assets/` 디렉토리 **존재하지 않음** 확인
- [ ] `manifest.json` 파일 **존재하지 않음** 확인
- [ ] 코드 내 `fetch(`, `Image(`, `new Image`, `.svg`, `.png`, `.jpg` 문자열 0건
- [ ] 코드 내 `ASSET_MAP`, `SPRITES`, `preloadAssets` 문자열 0건
- [ ] Google Fonts, CDN 등 외부 리소스 로드 0건
- [ ] **템플릿/보일러플레이트 복사 금지** - 빈 파일에서 처음부터 작성

### §12.2 코드 품질
- [ ] `'use strict'` 최상단 선언
- [ ] 모든 변수는 최초 참조 이전에 `let`/`const` 선언 [Cycle 11 TDZ]
- [ ] 선언된 변수 사용처 전수 검증 - 유령 변수 0건 [Cycle 2-3]
- [ ] 빈 if/else 블록 0건 - 데드 코드 금지 [Cycle 12]
- [ ] `setTimeout`으로 상태 전환하는 코드 0건 [Cycle 2]
- [ ] `confirm()`, `alert()`, `prompt()` 사용 0건 [Cycle 1]
- [ ] 게임 루프 `try-catch` 래핑 [Cycle 10]

### §12.3 아키텍처 검증
- [ ] 모든 상태 전환이 `beginTransition()` 경유 [Cycle 5, 8]
- [ ] `clearImmediate()` API - cancelAll 대신 사용 [Cycle 4]
- [ ] 상태x시스템 매트릭스(§5.3) 코드 주석으로 이중 포함
- [ ] PLAYING 상태의 모든 UI 탭에서 `updateProduction()` 호출 확인 [Cycle 11]
- [ ] 하나의 값에 대한 갱신 경로가 1개(tween OR 직접 대입) [Cycle 5]

### §12.4 순수 함수 검증
- [ ] §10의 모든 함수가 전역 상태 직접 참조 0건
- [ ] 모든 함수의 파라미터 -> 반환값 추적 가능
- [ ] 함수 시그니처 변경 시 모든 호출부 전수 검증 [Cycle 10]

### §12.5 기획-구현 정합성 (세부 항목별)
- [ ] CONFIG 객체 수치 <-> §6 수치표 1:1 대조 [Cycle 7]
  - [ ] 작물 4종 growTime/sellPrice 일치
  - [ ] 가축 3종 growTime/sellPrice 일치
  - [ ] 가공품 3종 growTime/sellPrice 일치
  - [ ] 업그레이드 비용 공식 일치
  - [ ] 프레스티지 공식 일치
  - [ ] 오프라인 배율 0.5 일치
- [ ] 마일스톤 5개 threshold 일치
- [ ] 터치 타겟 모든 요소 48px 이상 [Cycle 12]

### §12.6 기능 완성도 (A+B 분리 검증) [Cycle 12 교훈]
- [ ] 수동 수확: (A) 탭 시 즉시 수확 + (B) 50% 보너스 적용
- [ ] 자동 수확: (A) 자동 수확 동작 + (B) 수동 보너스 미적용
- [ ] 프레스티지: (A) 골드/업그레이드 초기화 + (B) 별 계산 정확 + (C) 영구 배율 적용
- [ ] 오프라인 수입: (A) 경과 시간 계산 + (B) 0.5 배율 적용 + (C) 최대 4시간 캡
- [ ] 롱프레스 연속 구매: (A) 500ms 후 시작 + (B) 100ms 간격 반복
- [ ] 농장 확장: (A) 5,000G에 목장 해금 + (B) 50,000G에 공장 해금

### §12.7 초기화 순서 검증
```
1. CONFIG 객체 선언
2. 유틸 함수 선언 (formatNumber, etc.)
3. TweenManager, ObjectPool, SoundManager, TransitionGuard 선언
4. 게임 상태 변수 선언 (saveData, uiState, etc.)
5. Canvas/ctx 초기화 + resizeCanvas()
6. 입력 이벤트 리스너 등록
7. loadSaveData() - localStorage -> saveData
8. enterState(TITLE)
9. requestAnimationFrame(loop)
```
**모든 let/const 변수는 4단계 이전에 선언 완료. resizeCanvas()가 참조하는 변수도 3단계 이전에 선언. [Cycle 11 TDZ 교훈]**

### §12.8 브라우저 호환성
- [ ] Chrome 90+ 정상 동작
- [ ] Firefox 90+ 정상 동작
- [ ] Safari 15+ 정상 동작
- [ ] 모바일 Chrome/Safari 터치 정상
- [ ] iframe 내 동작 확인 (localStorage try-catch)

### §12.9 게임 루프 방어 패턴
```javascript
function loop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    // ... update & render ...
  } catch (e) {
    console.error('[MiniIdleFarm] Loop error:', e);
  }
  requestAnimationFrame(loop);
}
```

### §12.10 범위 외 항목 (명시적 제외)
- 공용 엔진 모듈 분리 (`shared/engine.js`) - 별도 태스크
- CI pre-commit 훅 등록 - 별도 인프라 태스크
- 멀티플레이어 / 리더보드 - 서버 필요
- 일일 챌린지 - scope creep 방지, 코어 루프 집중

---

## §13. 금지 패턴 자동 검증 스크립트

### §13.1 검증 항목 (구현 완료 후 실행)
```bash
#!/bin/bash
echo "=== Mini Idle Farm 금지 패턴 검증 ==="
FAIL=0

# 1. assets/ 디렉토리 존재 확인
if [ -d "assets" ]; then echo "FAIL: assets/ 디렉토리 존재"; FAIL=1; fi

# 2. manifest.json 존재 확인
if [ -f "manifest.json" ]; then echo "FAIL: manifest.json 존재"; FAIL=1; fi

# 3. 외부 에셋 참조
if grep -qiE '(fetch\(|new Image|\.svg|\.png|\.jpg|\.gif|\.mp3|\.wav)' index.html; then
  echo "FAIL: 외부 에셋 참조 발견"; FAIL=1; fi

# 4. 금지 패턴
if grep -qE '(ASSET_MAP|SPRITES|preloadAssets)' index.html; then
  echo "FAIL: 에셋 관련 코드 잔존"; FAIL=1; fi

# 5. confirm/alert/prompt
if grep -qE '\b(confirm|alert|prompt)\s*\(' index.html; then
  echo "FAIL: confirm/alert/prompt 사용"; FAIL=1; fi

# 6. setTimeout 상태 전환
if grep -qE 'setTimeout.*state\s*=' index.html; then
  echo "FAIL: setTimeout 상태 전환"; FAIL=1; fi

# 7. Google Fonts / CDN
if grep -qiE '(fonts\.googleapis|cdn\.)' index.html; then
  echo "FAIL: 외부 CDN 참조"; FAIL=1; fi

# 8. 빈 블록
if grep -qE '\{\s*\}' index.html; then
  echo "WARN: 빈 블록 발견 (수동 확인 필요)"; fi

if [ $FAIL -eq 0 ]; then echo "ALL PASS"; else echo "VERIFICATION FAILED"; exit 1; fi
```

---

_InfiniTriX Game Design / Cycle #13 / 2026-03-21_
_기획자: Claude Agent_
