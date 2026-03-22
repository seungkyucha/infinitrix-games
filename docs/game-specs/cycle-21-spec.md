---
game-id: runeforge-tactics
title: 룬포지 택틱스
genre: puzzle, strategy
difficulty: medium
---

# 룬포지 택틱스 — 상세 기획서

_사이클 #21 | 작성일: 2026-03-22_

---

## 1페이지 요약 (구현자 필독)

**룬포지 택틱스**는 5×5 그리드에 8종 룬을 배치하여 마법진 패턴을 완성하는 **퍼즐 페이즈**와, 발동된 마법으로 3레인 적 웨이브를 격퇴하는 **방어 페이즈**가 교대 진행되는 턴제 전략 퍼즐이다. puzzle + strategy 장르 공백(0개→1개)을 해소하며, 20+ 스테이지 + 5보스 + 영구 업그레이드 + 120+ 마법진 조합으로 프리미엄 리플레이 가치를 제공한다.

**MVP(Phase 1)**: TITLE → STAGE_SELECT → PUZZLE → DEFENSE → RESULT 5상태 + 숲 지역 3스테이지 + 기본 룬 4종 + 마법진 10패턴. **이것만 먼저 완성한 후 확장.**

**핵심 금지 사항**: assets/ 디렉토리 생성 금지, setTimeout 0건, render 내 상태 변경 금지, 외부 폰트/CDN 0건.

---

## §0. 이전 사이클 피드백 반영 매핑

> Cycle 20 포스트모템 "아쉬웠던 점" + platform-wisdom 누적 교훈을 카테고리별로 그룹핑하여 선제 대응한다.

### 에셋/파일 시스템

| # | 출처 | 문제 | 해결 방법 | 해당 섹션 |
|---|------|------|---------|-----------|
| F1 | Cycle 1~20 (20사이클 연속) | assets/ 디렉토리 재발 | **index.html 단일 파일 100% Canvas 코드 드로잉.** pre-commit 훅 실등록 필수 | §11, §14.5 |
| F6 | Cycle 2~4 | SVG 필터 (feGaussianBlur) 재발 | Canvas shadowBlur로만 glow 구현. 인라인 SVG 사용 금지 | §4.2 |
| F33 | Cycle 20 | Google Fonts 외부 의존성 | 시스템 monospace만 사용. 외부 CDN 요청 0건 | §4.1 |

### 상태 머신/전환

| # | 출처 | 문제 | 해결 방법 | 해당 섹션 |
|---|------|------|---------|-----------|
| F2 | Cycle 1~2 | setTimeout 기반 상태 전환 | tween onComplete만 사용. setTimeout **0건** 목표 | §5, §13 |
| F4 | Cycle 2 | 상태×시스템 매트릭스 누락 | §6.3에 12상태 × 9시스템 매트릭스 선행 작성 | §6.3 |
| F5 | Cycle 3/4 | 가드 플래그 누락 → 콜백 반복 | `isTransitioning`, `isPlacingRune`, `isWaveActive` 3중 가드 | §5.4 |
| F17 | Cycle 3 | 상태 전환 우선순위 체계 | GAMEOVER > RESULT > DEFENSE > PUZZLE. STATE_PRIORITY 맵 | §6.2 |
| F23 | Cycle 5/8 | beginTransition() 우회 직접 전환 | 모든 화면 전환은 `beginTransition()` 경유 필수 | §6.2 |
| F26 | Cycle 17/20 | 상태 변경이 render에서 수행 | update()에서만 상태 변경. render()는 순수 출력 | §5.2 |
| F31 | Cycle 20 | hitAnim render 내 수정 | 모든 애니메이션 타이머는 update()에서만 감소 | §5.2 |

### 코드 품질

| # | 출처 | 문제 | 해결 방법 | 해당 섹션 |
|---|------|------|---------|-----------|
| F3 | Cycle 6~20 | 순수 함수 패턴 필수 | 룬 매칭·데미지 계산·충돌 모든 함수는 파라미터 기반 | §15.2 |
| F6b | Cycle 4 | TweenManager cancelAll+add 경쟁 조건 | `clearImmediate()` 즉시 정리 API 분리 | §15 |
| F7 | Cycle 7/16 | 기획서 수치 ↔ 코드 수치 불일치 | §14.4 수치 정합성 검증 테이블 전수 대조 | §14.4 |
| F11 | Cycle 11/14 | let/const TDZ 크래시 | 변수 선언 → DOM → 이벤트 → init() 순서 엄격 | §14.1 |
| F12 | Cycle 10/11 | gameLoop try-catch 미적용 | `try{...}catch(e){console.error(e);}raf(loop)` 기본 적용 | §5.1 |
| F15 | Cycle 3/7/17 | 유령 변수 | §14.2 변수 사용처 검증 테이블 | §14.2 |
| F16 | Cycle 5 | 하나의 값에 이중 갱신 경로 | 모든 주요 값은 단일 함수(`modifyStat()`)로만 갱신 | §15.3 |
| F30 | Cycle 18 | 단일 파일 모듈화 | §A~§L 논리적 섹션 구조화 | §15.1 |

### 입력/모바일

| # | 출처 | 문제 | 해결 방법 | 해당 섹션 |
|---|------|------|---------|-----------|
| F8 | Cycle 1 | iframe 내 confirm/alert 차단 | Canvas 기반 모달 UI만 사용 | §4 |
| F20 | Cycle 13~20 | CONFIG.MIN_TOUCH 선언-구현 괴리 | 모든 UI에 `touchSafe()` 48px 하한 강제 | §12.3 |
| F21 | Cycle 16 | 입력 방식 전기능 미지원 | 키보드/마우스/터치 모두 전 기능 지원 | §3 |
| F24 | Cycle 12~20 | 터치 타겟 44×44px 미달 | 모든 인터랙티브 UI 최소 48×48px | §12.3 |
| F32 | Cycle 20 | 업그레이드 상점 터치 스크롤 미구현 | touchmove 드래그 스크롤 완전 구현 (관성/바운스 수치 포함) | §4.7 |
| F34 | Cycle 20 | 터치 영역 시각 가이드 없음 | 첫 플레이 시 튜토리얼 오버레이로 안내 | §3.4 |

### 기타

| # | 출처 | 문제 | 해결 방법 | 해당 섹션 |
|---|------|------|---------|-----------|
| F10 | Cycle 15~20 | offscreen canvas 배경 캐싱 | `buildGridCache()` 패턴 — resize/스테이지 전환 시에만 재빌드 | §4.3 |
| F13 | Cycle 13/17 | index.html 미존재 (과대 기획) | MVP 우선: 5상태 + 챕터1 먼저 완성 | §1.3 |
| F14 | Cycle 10 | 수정 회귀 | §14.7 전체 플로우 회귀 테스트 | §14.7 |
| F19 | Cycle 12/15 | "절반 구현" 패턴 | 기능별 세부 구현 체크리스트 | §14.3 |
| F22 | Cycle 17 | 기획 명시 UI 미구현 | MVP에 포함되지 않으면 기획서에 적지 않음 | §1.3 |
| F25 | Cycle 17 (핵심) | 기획 과대 → 구현 0% | Phase 구분으로 MVP 경계 명확화 | §1.3 |
| F27 | Cycle 17 | 오브젝트 간 상호작용 미정의 | §2.7 룬×마법진 상호작용 매트릭스 | §2.7 |
| F28 | Cycle 18 | 밸런스 검증 부재 | 상수 테이블(RUNE_DATA, UPGRADE_DATA) 관리 | §7.2 |
| F29 | Cycle 18 | 사운드 체감 품질 미검증 | SFX 이벤트 정밀 매핑 + 볼륨 밸런스 테이블 | §13.3 |
| F35 | Cycle 20 제안 | 공용 엔진 모듈 분리 | 단일 파일 유지, §A~§C 독립 섹션 배치 | §15.1 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 1.1 컨셉

**룬포지 택틱스**는 고대 마법 룬을 5×5 그리드에 전략적으로 배치하여 마법진을 완성하는 **퍼즐 페이즈**와, 완성된 마법진의 마법으로 3레인 적 웨이브를 격퇴하는 **방어 페이즈**가 번갈아 진행되는 2페이즈 전략 퍼즐 게임이다.

플랫폼에 **puzzle + strategy 조합이 0개**인 완전 공백 장르를 최초로 채운다.

**핵심 공식**: 룬 배치 퍼즐 + 마법진 패턴 매칭 + 웨이브 방어 전략 + 영구 성장

### 1.2 핵심 재미 요소

1. **조합 발견의 쾌감**: 8종 룬의 배치 조합에 따라 120+ 마법진 패턴이 발동. "이 조합은 뭐가 나올까?" 실험의 재미
2. **2페이즈 긴장감 전환**: 퍼즐(사고)→방어(실행)의 리듬 변화. 충분히 고민한 배치가 강력한 방어로 이어지는 전략적 만족감
3. **실패해도 성장**: 발견한 마법진 레시피는 영구 저장. 실패한 런에서도 "새 레시피 발견!" 보상
4. **프로시저럴 변동성**: 매 턴 룬 드롭이 랜덤 → 같은 전략이 매번 통하지 않음 → 적응형 플레이
5. **보스 마법사 대결**: 지역 보스가 역으로 마법진을 사용 → 플레이어 마법진과 "마법 대결"
6. **스토리 몰입**: 5지역에 흩어진 룬 조각을 수집하며 마법탑을 복원하는 내러티브

### 1.3 MVP 우선 전략 (F13, F25 대응)

> **Phase 구분이 MVP 경계를 정의한다. Phase 1만 먼저 100% 완성 후 확장.**

**Phase 1 (MVP — 반드시 먼저 완성)**
- 5상태: TITLE → STAGE_SELECT → PUZZLE → DEFENSE → RESULT
- 숲 지역(챕터 1) 3스테이지
- 기본 룬 4종 (화/수/지/풍)
- 5×5 그리드 배치
- 기본 마법진 10패턴 (직선3, L자, T자, 십자, 2×2, 대각선 등)
- 적 3종 (슬라임, 고블린, 오크)
- 3라이프 시스템
- 기본 점수 + 크리스탈

**Phase 2 (확장 룬 + 챕터 2~3)**
- 룬 4종 추가 (뇌/얼음/빛/암)
- 사막·얼음 지역 6스테이지
- 업그레이드 상점 (크리스탈 화폐)
- 마법진 레시피북 UI (터치 스크롤 포함)

**Phase 3 (보스 + 챕터 4~5)**
- 지역 보스 3체 (트레엔트, 스핑크스, 프로스트 드래곤)
- 화산·고대탑 지역 6스테이지
- 최종 보스 (어둠의 마법사) + 히든 보스 (룬 골렘)
- 히든 스테이지 2개

**Phase 4 (완성도)**
- 스토리 내러티브 (지역별 룬 역사 조각)
- 업적 시스템 10종
- 날씨/시간대 시각 효과
- 카메라 줌/팬 보스 연출
- 난이도 3단계 (견습생/마법사/대마법사)

---

## §2. 게임 규칙 및 목표

### 2.1 전체 구조
- 5지역 × 3스테이지 = **15 메인 스테이지**
- 3 지역 보스 + 1 최종 보스 + 1 히든 보스 = **5 보스전**
- 2 히든 스테이지 = **총 22 스테이지**

### 2.2 지역 구성

| 지역 | 스테이지 | 환경 | 특수 요소 | 보스 |
|------|----------|------|-----------|------|
| 숲 (Forest) | 1-1 ~ 1-3 | 초록, 나무, 이끼 | 없음 (튜토리얼) | 트레엔트 (HP 30) |
| 사막 (Desert) | 2-1 ~ 2-3 | 황금, 모래, 오아시스 | 모래바람 (시야 제한) | 스핑크스 (HP 45) |
| 얼음 (Ice) | 3-1 ~ 3-3 | 파랑, 결정, 눈 | 빙결 (룬 1칸 동결) | 프로스트 드래곤 (HP 55) |
| 화산 (Volcano) | 4-1 ~ 4-3 | 빨강, 용암, 바위 | 용암류 (그리드 1행 파괴) | — |
| 고대 탑 (Ancient Tower) | 5-1 ~ 5-3 | 보라, 마법진, 별 | 혼돈 (룬 효과 랜덤 변형) | 어둠의 마법사 (HP 80, 3페이즈) |

### 2.3 퍼즐 페이즈 규칙
1. 매 턴 시작 시 **룬 3개가 랜덤으로 지급** (인벤토리 최대 5개)
2. 플레이어는 5×5 그리드에 룬을 **자유 배치** (빈 칸에만)
3. 배치 완료 후 "발동" 버튼 → 그리드를 스캔하여 **마법진 패턴 매칭**
4. 매칭된 마법진은 **방어 페이즈에서 사용할 마법**으로 변환
5. 매칭되지 않은 룬은 **0.5× 약화된 기본 공격**으로 변환
6. 퍼즐 페이즈 제한 시간: 스테이지당 30초 (난이도에 따라 조절)

### 2.4 방어 페이즈 규칙
1. 적이 화면 우측에서 좌측으로 3개 레인을 따라 진행
2. 발동된 마법은 **자동으로 적에게 발사** (1초 간격)
3. 마법진 등급이 높을수록 데미지/범위/효과 강화
4. 모든 적을 처치하면 **스테이지 클리어**
5. 적이 좌측 끝에 도달하면 **라이프 -1**
6. 라이프 0 = 게임 오버 (현재 지역 처음부터)

### 2.5 승리 조건
- 5지역 모든 스테이지 + 보스 클리어 = **엔딩**
- 히든 스테이지 2개 발견 + 클리어 = **트루 엔딩**

### 2.6 룬 시스템

| 룬 | 색상 | 기본 데미지 | 부가 효과 | 마법진 보너스 |
|----|------|-----------|----------|--------------|
| 화 (Fire) | #FF4444 | 15 | — | 화염 계열: 광역 폭발 |
| 수 (Water) | #4488FF | 12 | 감속 30% | 수류 계열: 관통 + 감속 |
| 지 (Earth) | #88AA44 | 8 | 방어막 20 흡수 | 대지 계열: 벽 생성 |
| 풍 (Wind) | #AADDFF | 8 | 넉백 2칸 | 풍류 계열: 전체 넉백 |
| 뇌 (Thunder) | #FFDD00 | 10 | 연쇄 3타겟 | 뇌전 계열: 즉사 확률 |
| 얼음 (Ice) | #88EEFF | 10 | 동결 2초 | 빙결 계열: 범위 동결 |
| 빛 (Light) | #FFFFAA | 10 | 회복 15 HP | 성스러운 계열: 전체 회복 |
| 암 (Dark) | #8844AA | 18 | 저주 (매초 5 지속) | 암흑 계열: 즉사 + 자기 피해 |

### 2.7 룬 × 마법진 상호작용 매트릭스 (F27 대응)

**기본 마법진 패턴 (10종)**:

| 패턴 | 형태 | 필요 룬 수 | 효과 배율 | 설명 |
|------|------|-----------|-----------|------|
| 직선-3 (Line-3) | ─ 또는 │ | 같은 룬 3개 | 2.0× | 가장 기본적인 마법진 |
| L자 (L-Shape) | ┘ 회전 4종 | 2종 룬 3개 | 1.8× | 주 룬 효과 + 보조 룬 부가 |
| T자 (T-Shape) | ┴ 회전 4종 | 2종 룬 4개 | 2.5× | 주 룬 강화 + 보조 범위 확장 |
| 십자 (Cross) | ✚ | 1종 중심 + 4종 팔 | 3.0× | 중심 룬 극대화 |
| 2×2 (Square) | ■ | 같은 룬 4개 | 2.8× | 폭발형 범위 공격 |
| 대각선-3 (Diag-3) | ╲ 또는 ╱ | 같은 룬 3개 | 2.2× | 관통형 |
| X자 (X-Shape) | ╳ | 1종 5개 | 3.5× | 전방위 공격 |
| 이중 직선 (Double Line) | ═ | 같은 룬 6개 | 4.0× | 초강력 단일 속성 |
| 혼합 십자 (Mixed Cross) | ✚ 모두 다른 룬 | 5종 룬 5개 | 3.8× | 5원소 조화 — 전체 화면 공격 |
| 비밀 마법진 (Secret) | 특수 패턴 | 특수 조합 | 5.0× | 레시피북에서 힌트 획득 |

**복합 마법진 (보너스 — 2개 이상 동시 발동 시)**:
- 같은 속성 마법진 2개 = **속성 폭주** (데미지 1.5× 추가)
- 상반 속성 (화+수, 빛+암) = **원소 충돌** (범위 2× 추가)
- 3개 이상 동시 = **마법 폭풍** (화면 전체 광역)

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 동작 |
|----|------|
| 방향키 / WASD | 그리드 커서 이동 |
| Space / Enter | 룬 배치 / UI 확인 |
| 1~5 | 인벤토리 룬 선택 |
| R | 배치 취소 (마지막 룬 회수) |
| Q | 마법진 발동 (퍼즐→방어 전환) |
| Tab | 레시피북 열기/닫기 |
| Escape / P | 일시정지 |
| M | 음소거 토글 |

### 3.2 마우스
| 동작 | 설명 |
|------|------|
| 클릭 (인벤토리 룬) | 룬 선택 |
| 클릭 (그리드 칸) | 선택된 룬 배치 |
| 우클릭 (배치된 룬) | 룬 회수 |
| 휠 | 레시피북/업그레이드 스크롤 |
| 클릭 (발동 버튼) | 마법진 발동 |

### 3.3 터치 (모바일)
| 동작 | 설명 |
|------|------|
| 탭 (인벤토리 룬) | 룬 선택 (하이라이트) |
| 탭 (그리드 칸) | 선택된 룬 배치 |
| 롱프레스 (배치된 룬) | 룬 회수 (300ms 홀드) |
| 드래그 (인벤토리→그리드) | 드래그 앤 드롭 배치 |
| 스와이프 (레시피북/상점) | 터치 드래그 스크롤 (F32 대응) |
| 탭 (발동 버튼) | 마법진 발동 |
| 두 손가락 탭 | 일시정지 |

### 3.4 튜토리얼 오버레이 (F34 대응)
- 첫 플레이 시 반투명 오버레이로 핵심 조작 3단계 안내:
  - Step 1: "룬을 탭하여 선택" (화살표 애니메이션, 인벤토리 영역 하이라이트)
  - Step 2: "그리드에 탭하여 배치" (빈 칸 점멸)
  - Step 3: "발동 버튼을 눌러 마법진 발동!" (버튼 펄스 효과)
- 터치 영역 점선 시각 가이드 (그리드 좌우, 인벤토리 하단)
- `localStorage.setItem('rft_tutorial', '1')` — 1회만 표시

---

## §4. 시각적 스타일 가이드

### 4.1 색상 팔레트 (F33 대응 — 외부 폰트/CDN 0건)

**기본 팔레트**:
```
배경 (어두운 석조)    : #1A1A2E → #16213E 그라데이션
그리드 셀 (빈 칸)     : #2A2A4A (테두리 #3A3A6A)
그리드 셀 (활성)      : #3A3A6A (하이라이트 #5050AA)
그리드 셀 (마법진 미리보기) : #4A3A6A (골드 테두리 #FFD700)
UI 텍스트             : #E0E0FF
UI 강조               : #FFD700 (골드)
HP 바                 : #FF4444 → #44FF44
마나 바               : #4488FF → #88CCFF
크리스탈 (화폐)       : #00FFCC
```

**지역별 환경 색상**:
```
숲   : #2D5A27 배경 + #88CC44 강조 + #4A2D0A 나무
사막 : #C4A035 배경 + #FFD700 강조 + #8B6914 바위
얼음 : #1A3A5A 배경 + #88EEFF 강조 + #FFFFFF 눈
화산 : #4A1A0A 배경 + #FF4400 강조 + #8B2500 용암
고대탑: #2E1A4A 배경 + #AA66FF 강조 + #FFD700 마법진
```

**폰트**: 시스템 monospace (`'Courier New', Courier, monospace`) — 외부 CDN 요청 0건

### 4.2 오브젝트 형태 (F6 대응 — SVG 필터 0건, Canvas shadowBlur만)

**룬 (8종)**: 각 60×60px 정사각형 내 속성 심볼. Canvas `arc()`, `lineTo()`, `bezierCurveTo()`로 직접 드로잉
- 화: 불꽃 형태 (삼각형 3겹 + 주황~빨강 radialGradient)
- 수: 물방울 형태 (역 삼각 곡선 + 파랑 radialGradient)
- 지: 다이아몬드 형태 (사각형 45° 회전 + 녹색 linearGradient)
- 풍: 소용돌이 형태 (나선 곡선 + 하늘색 linearGradient)
- 뇌: 번개 형태 (지그재그 3단 + 노랑 linearGradient)
- 얼음: 눈결정 형태 (6각 방사선 + 연파랑 radialGradient)
- 빛: 태양 형태 (원 + 방사선 8개 + 금색 radialGradient)
- 암: 초승달 형태 (겹원 마스크 + 보라 radialGradient)

**적 유닛 (8종)**: 각 40×40px, 레인 위 좌측 이동
- 슬라임 (원형, 녹색, HP 바), 고블린 (삼각형 몸체, 갈색)
- 오크 (큰 사각형, 회색-녹색), 사막 전갈 (다관절 곡선, 황색)
- 얼음 정령 (다각형 결정, 하늘색), 화염 마법사 (삼각모자+로브, 빨강)
- 그림자 기사 (방패+검 실루엣, 보라), 혼돈 구체 (맥동하는 원, 다색)

**보스 (5체)**: 각 120×120px+ 대형
- 트레엔트: 나무 형태, 가지 흔들림 애니메이션 (sin 기반)
- 스핑크스: 사자 몸체 + 인간 얼굴 + 날개 (펼침/접힘 토글)
- 프로스트 드래곤: S자 곡선 몸체, 얼음 결정 날개 (결정 회전)
- 어둠의 마법사: 로브 마법사, 3페이즈 변신 (로브→갑옷→해골)
- 룬 골렘(히든): 거대 석상, 몸에 룬 심볼 발광

### 4.3 배경 렌더링 (F10 대응 — offscreen canvas 캐싱)

```
buildGridCache() {
  // offscreen canvas에 정적 요소 1회 렌더링:
  // - 5×5 그리드 테두리 + 좌표 라벨
  // - 지역별 배경 패턴 (타일 반복)
  // - 환경 장식 (나무/바위/결정 등)
  // 호출 시점: resizeCanvas() 또는 stageChange 시에만 재빌드
}
```

### 4.4 카메라 연출
- **보스 등장**: 화면 0.5초 줌아웃(0.8×) → 보스 실루엣 등장 → 1초 줌인(1.0×) → HP 바 표시
- **마법진 발동**: 그리드 영역 0.3초 줌인(1.2×) → 마법진 이펙트 → 0.3초 줌아웃(1.0×)
- **스테이지 클리어**: 0.5초 슬로우모션(0.3× timeScale) → 결과 화면 전환

### 4.5 날씨/시간대 효과
- **숲**: 떨어지는 나뭇잎 파티클 (ParticlePool에서 관리)
- **사막**: 모래 입자 + 주기적 모래바람 (시야 50% 차단 효과)
- **얼음**: 떨어지는 눈 파티클 + 숨결 안개 이펙트
- **화산**: 상승하는 불씨 파티클 + 화면 하단 용암 흐름
- **고대 탑**: 부유하는 마법 입자 + 별빛 배경 (회전)

### 4.6 파괴 가능 환경 오브젝트
- 숲: 덤불 (파괴 시 룬 드롭 확률 20%)
- 사막: 항아리 (파괴 시 크리스탈 드롭)
- 얼음: 얼음 기둥 (파괴 시 범위 동결)
- 화산: 마그마 풀 (적 통과 시 지속 피해)
- 고대 탑: 마법 결계 (파괴 시 랜덤 버프)

### 4.7 터치 스크롤 UI (F32 대응 — 세부 수치 포함)

**레시피북 & 업그레이드 상점**: Canvas 내부 가상 스크롤. `touchstart→touchmove→touchend` 전 경로 처리.

```
스크롤 구현 상세:
  scrollOffset: 현재 스크롤 위치 (px)
  touchStartY: 터치 시작 Y 좌표
  isDragging: 드래그 중 플래그
  momentum: 관성 스크롤 속도 (px/frame)
  MOMENTUM_DECAY: 0.92 (매 프레임 감쇠 — 약 25프레임에 정지)
  MAX_MOMENTUM: 30 (px/frame — 최대 관성 속도)
  BOUNCE_FACTOR: 0.3 (끝단 오버스크롤 시 바운스 비율)
  SCROLL_THRESHOLD: 5 (px — 이 이하는 탭으로 간주)

  onTouchStart: touchStartY = e.touches[0].clientY; isDragging = true; momentum = 0
  onTouchMove:
    delta = e.touches[0].clientY - touchStartY
    scrollOffset += delta
    touchStartY = 현재 Y
    momentum = delta (마지막 프레임 delta 저장)
  onTouchEnd: isDragging = false
  update:
    if (!isDragging && |momentum| > 0.5):
      scrollOffset += momentum
      momentum *= MOMENTUM_DECAY
    // 범위 초과 시 바운스:
    if (scrollOffset > 0): scrollOffset *= BOUNCE_FACTOR
    if (scrollOffset < minScroll): scrollOffset = minScroll + (scrollOffset - minScroll) * BOUNCE_FACTOR
```

---

## §5. 핵심 게임 루프 (초당 프레임 기준 로직 흐름)

### 5.1 메인 루프 (F12 대응 — try-catch 래핑)

```javascript
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // 50ms 상한
    lastTime = timestamp;
    update(dt);    // 상태 변경은 여기서만 (F26)
    render();      // 순수 출력만 (F31)
  } catch (e) {
    console.error('[GameLoop Error]', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 5.2 update/render 분리 원칙 (F26, F31 대응)

**update(dt)에서만 수행**:
- 입력 처리 결과 반영
- 상태 전환 판정 + 실행
- 적 이동/HP 변경
- 마법 효과 적용
- 타이머/카운터 감소 (puzzleTimer, hitAnim, flashTimer 등)
- tween.update(dt)
- particle.update(dt)

**render()에서만 수행**:
- Canvas 클리어
- 배경 캐시 그리기 (offscreen)
- 그리드 + 룬 그리기
- 적 유닛 그리기
- 마법 이펙트 + 투사체 그리기
- 파티클 그리기
- UI (HP 바, 점수, 인벤토리, 타이머) 그리기
- **상태 읽기만, 변경 절대 금지**

### 5.3 퍼즐 페이즈 루프
```
매 프레임:
1. puzzleTimer 감소 (updatePuzzleTimer(dt) — F16 단일 경로)
2. 입력 확인 → 커서 이동 / 룬 선택 / 배치 / 취소
3. 룬 배치 시 → scanMagicCircles(grid) 순수 함수 호출 → 미리보기 표시
4. 발동 입력 시 → 가드 체크(isTransitioning) → activateCircles() → 방어 전환
5. 타이머 0 → 자동 발동 (가드 체크 후 1회만 — F5)
6. tween.update(dt)
7. particle.update(dt)
```

### 5.4 방어 페이즈 루프
```
매 프레임:
1. 적 스폰 타이머 → 적 생성 (spawnEnemy 순수 함수)
2. 적 이동 (updateEnemies(enemies, dt, config) — 순수 함수, F3)
3. 마법 발사 타이머 → 투사체 생성
4. 충돌 검사: checkCollision(proj, enemy) — 순수 함수
5. 피격: applyDamage(enemy, amount, effects) — 순수 함수
6. 적 도착 검사 → modifyLives(-1) (F16 단일 경로)
7. 적 전멸 → 가드 체크(isWaveActive) → 스테이지 클리어 (F5)
8. 라이프 0 → GAMEOVER (STATE_PRIORITY 우선, F17)
9. tween.update(dt)
10. particle.update(dt)
```

---

## §6. 상태 머신

### 6.1 게임 상태 목록 (12개)

| 상태 | 설명 |
|------|------|
| TITLE | 타이틀 화면 |
| STAGE_SELECT | 지역/스테이지 선택 맵 |
| PUZZLE | 퍼즐 페이즈 (룬 배치) |
| DEFENSE | 방어 페이즈 (적 웨이브) |
| BOSS_INTRO | 보스 등장 연출 |
| BOSS_FIGHT | 보스전 (특수 방어 페이즈) |
| RESULT | 스테이지 결과 (점수/보상) |
| UPGRADE | 업그레이드 상점 |
| RECIPE_BOOK | 마법진 레시피북 |
| PAUSED | 일시정지 |
| GAMEOVER | 게임 오버 |
| ENDING | 엔딩 |

### 6.2 상태 전환 우선순위 (F17 대응)

```javascript
const STATE_PRIORITY = {
  GAMEOVER: 100,
  ENDING: 90,
  BOSS_INTRO: 80,
  RESULT: 70,
  DEFENSE: 60,
  BOSS_FIGHT: 60,
  PUZZLE: 50,
  UPGRADE: 40,
  RECIPE_BOOK: 40,
  STAGE_SELECT: 30,
  TITLE: 20,
  PAUSED: 10  // 예외: 즉시 전환 허용 (F23)
};
```

모든 전환은 `beginTransition(targetState)` 경유 필수. PAUSED만 예외(즉시 토글).

### 6.3 상태 × 시스템 매트릭스 (F4 대응)

| 시스템 \ 상태 | TITLE | STAGE_SEL | PUZZLE | DEFENSE | BOSS_INTRO | BOSS_FIGHT | RESULT | UPGRADE | RECIPE | PAUSED | GAMEOVER | ENDING |
|---------------|-------|-----------|--------|---------|-----------|-----------|--------|---------|--------|--------|---------|--------|
| tween.update | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| particle.update | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| input.process | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| enemy.update | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| magic.update | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| timer.update | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| camera.update | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| sound.update | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| scroll.update | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## §7. 난이도 시스템

### 7.1 시간/스테이지에 따른 변화

| 지역 | 퍼즐 제한시간 | 적 HP 배율 | 적 속도 배율 | 웨이브 수 | 스폰 간격 |
|------|--------------|-----------|-----------|---------|---------|
| 숲 (1) | 45초 | 1.0× | 1.0× | 2 | 2.0초 |
| 사막 (2) | 40초 | 1.3× | 1.1× | 3 | 1.8초 |
| 얼음 (3) | 35초 | 1.6× | 1.2× | 3 | 1.5초 |
| 화산 (4) | 30초 | 2.0× | 1.3× | 4 | 1.2초 |
| 고대 탑 (5) | 25초 | 2.5× | 1.5× | 5 | 1.0초 |

### 7.2 난이도 모드 (3단계)

| 모드 | 라이프 | 퍼즐 시간 보너스 | 적 배율 | 보상 배율 | 설명 |
|------|-------|---------------|---------|---------|------|
| 견습생 (Apprentice) | 5 | +15초 | 0.7× | 0.8× | 캐주얼 플레이어용 |
| 마법사 (Mage) | 3 | +0초 | 1.0× | 1.0× | 표준 난이도 |
| 대마법사 (Archmage) | 2 | -5초 | 1.5× | 1.5× | 하드코어 |

### 7.3 보스 스펙 (F28 대응 — 상수 테이블 관리)

```javascript
const BOSS_DATA = {
  treant:       { hp: 30, atk: 8,  phases: 1, special: 'vine_grab', crystalReward: 50 },
  sphinx:       { hp: 45, atk: 12, phases: 2, special: 'riddle_seal', crystalReward: 80 },
  frost_dragon: { hp: 55, atk: 15, phases: 2, special: 'ice_breath', crystalReward: 120 },
  dark_mage:    { hp: 80, atk: 20, phases: 3, special: 'counter_spell', crystalReward: 200 },
  rune_golem:   { hp: 100, atk: 25, phases: 3, special: 'rune_absorb', crystalReward: 300 }
};
```

---

## §8. 점수 시스템

### 8.1 점수 획득

| 행동 | 점수 |
|------|------|
| 적 처치 (일반) | 100 × 지역 번호 |
| 적 처치 (엘리트) | 300 × 지역 번호 |
| 보스 처치 | 2000 × 지역 번호 |
| 마법진 발동 (기본) | 50 |
| 마법진 발동 (고급) | 150 |
| 마법진 발동 (비밀) | 500 |
| 새 레시피 발견 | 200 |
| 무피해 클리어 | 스테이지 점수 × 2 |
| 타임 보너스 | 남은 시간 × 10 |

### 8.2 크리스탈 (영구 화폐)

| 획득 방법 | 크리스탈 |
|-----------|---------|
| 스테이지 클리어 | 10 × 지역 번호 |
| 보스 클리어 | BOSS_DATA[id].crystalReward |
| 환경 오브젝트 파괴 | 1~5 (랜덤) |
| 새 레시피 발견 | 15 |
| 무피해 보너스 | +50% |

### 8.3 업그레이드 트리 (크리스탈 소비)

| 업그레이드 | 최대 레벨 | 비용 (레벨별) | 효과 |
|-----------|---------|-------------|------|
| 마나 확장 | 5 | 30/60/100/150/250 | 마법 발사 횟수 +1/레벨 |
| 룬 강화 | 5 | 40/80/130/200/300 | 기본 데미지 +15%/레벨 |
| 인벤토리 확장 | 3 | 50/120/250 | 룬 보유 최대 +1 (5→8) |
| 마법진 직감 | 3 | 60/140/280 | 배치 시 마법진 힌트 범위 +1칸 |
| 크리스탈 자석 | 3 | 35/85/180 | 크리스탈 획득량 +20%/레벨 |
| 시간 왜곡 | 3 | 70/160/320 | 퍼즐 제한 시간 +5초/레벨 |
| 보호막 | 3 | 80/180/350 | 적 도착 시 30%/50%/70% 라이프 보호 |
| 룬 마스터리 | 1 | 500 | 비밀 마법진 패턴 1개 해금 |

---

## §9. 스토리 / 내러티브

### 9.1 배경
고대에 세계를 수호하던 **마법탑**이 어둠의 마법사의 침략으로 파괴되었다. 플레이어는 마지막 **룬포지 마스터** — 마법진을 설계하고 발동시킬 수 있는 유일한 존재다. 5개 지역에 흩어진 **룬의 조각**을 수집하고, 마법탑을 복원하여 어둠의 마법사를 물리쳐야 한다.

### 9.2 지역별 스토리 조각 (스테이지 클리어 시 표시)

| 지역 | 스토리 주제 | 클리어 시 획득 |
|------|-----------|-------------|
| 숲 | "생명의 룬 — 숲의 수호자가 남긴 최초의 마법진" | 생명의 룬 조각 |
| 사막 | "지혜의 룬 — 스핑크스가 감춘 고대의 수수께끼" | 지혜의 룬 조각 |
| 얼음 | "영원의 룬 — 시간이 멈춘 빙하 속 잠든 힘" | 영원의 룬 조각 |
| 화산 | "힘의 룬 — 세계의 핵에서 태어난 원시적 에너지" | 힘의 룬 조각 |
| 고대 탑 | "조화의 룬 — 4개 조각이 합쳐질 때 열리는 진실" | 마법탑 복원 |

### 9.3 히든 스테이지
- **히든 1**: 사막 2-3 클리어 + 스핑크스 보스전에서 특정 마법진 패턴 사용 → "시간의 틈" 출현
- **히든 2**: 5지역 전 클리어 + 레시피북 80% 이상 수집 → "룬 골렘의 시험장"

---

## §10. 리플레이 시스템

### 10.1 랜덤 생성 요소
- 매 스테이지 **룬 드롭 풀** 랜덤 (8종 중 4~6종 활성)
- 매 턴 **지급 룬 3개** 랜덤 (활성 풀에서)
- 적 구성 **변동**: 기본 구성 ± 1~2 유닛 랜덤
- 환경 오브젝트 **배치** 랜덤 (고정 슬롯에 랜덤 종류)

### 10.2 다중 전략 경로
- **화력 집중 빌드**: 화+뇌 룬 강화 → 단일 대상 극대화
- **제어 빌드**: 수+얼음+풍 → 감속/동결/넉백으로 안전 플레이
- **방어 빌드**: 지+빛 → 방어막+회복으로 장기전
- **도박 빌드**: 암+혼합 → 고위험 고보상 (자기 피해 + 즉사 효과)

### 10.3 업적 시스템 (10종)

| 업적 | 조건 | 보상 |
|------|------|------|
| 첫 걸음 | 첫 스테이지 클리어 | 크리스탈 20 |
| 조합의 시작 | 첫 마법진 발동 | 크리스탈 10 |
| 레시피 수집가 | 마법진 30종 발견 | 크리스탈 100 |
| 완벽한 방어 | 무피해로 보스 클리어 | 크리스탈 50 |
| 5원소 조화 | 혼합 십자 마법진 발동 | 크리스탈 80 |
| 어둠의 종결자 | 최종 보스 클리어 | 크리스탈 200 |
| 비밀의 문 | 히든 스테이지 발견 | 크리스탈 100 |
| 룬 골렘 정복 | 히든 보스 클리어 | 크리스탈 300 |
| 속도의 마법사 | 10초 이내 마법진 3개 동시 발동 | 크리스탈 60 |
| 대마법사의 길 | 대마법사 난이도 전 클리어 | 특수 룬 스킨 |

---

## §11. 에셋 목록 (F1 대응 — 100% Canvas 코드 드로잉)

> ⚠️ **assets/ 디렉토리 절대 생성 금지.** 모든 그래픽은 Canvas API로 직접 드로잉.
> thumbnail.svg만 games/runeforge-tactics/ 디렉토리에 별도 파일로 허용.

### 11.1 Canvas 드로잉 함수 목록 (코드 내 구현, 24개)

| # | 함수명 | 대상 | 예상 복잡도 |
|---|--------|------|-----------|
| 1 | `drawRuneFire(ctx, x, y, s)` | 화 룬 | 삼각형 3겹 + 그라데이션 |
| 2 | `drawRuneWater(ctx, x, y, s)` | 수 룬 | 곡선 물방울 + 그라데이션 |
| 3 | `drawRuneEarth(ctx, x, y, s)` | 지 룬 | 회전 사각형 + 그라데이션 |
| 4 | `drawRuneWind(ctx, x, y, s)` | 풍 룬 | 나선 곡선 + 그라데이션 |
| 5 | `drawRuneThunder(ctx, x, y, s)` | 뇌 룬 | 지그재그 + 그라데이션 |
| 6 | `drawRuneIce(ctx, x, y, s)` | 얼음 룬 | 6각 결정 + 그라데이션 |
| 7 | `drawRuneLight(ctx, x, y, s)` | 빛 룬 | 원+방사선 + 그라데이션 |
| 8 | `drawRuneDark(ctx, x, y, s)` | 암 룬 | 초승달 + 그라데이션 |
| 9 | `drawSlime(ctx, x, y, s, hp)` | 슬라임 적 | 원형 + HP바 |
| 10 | `drawGoblin(ctx, x, y, s, hp)` | 고블린 적 | 삼각 몸체 |
| 11 | `drawOrc(ctx, x, y, s, hp)` | 오크 적 | 큰 사각형 |
| 12 | `drawScorpion(ctx, x, y, s, hp)` | 전갈 적 | 다관절 곡선 |
| 13 | `drawIceSpirit(ctx, x, y, s, hp)` | 얼음 정령 적 | 다각형 결정 |
| 14 | `drawFireMage(ctx, x, y, s, hp)` | 화염 마법사 적 | 로브 실루엣 |
| 15 | `drawShadowKnight(ctx, x, y, s, hp)` | 그림자 기사 적 | 방패+검 |
| 16 | `drawChaosOrb(ctx, x, y, s, hp)` | 혼돈 구체 적 | 맥동 원 |
| 17 | `drawBossTreant(ctx, x, y, s, hp, phase)` | 트레엔트 보스 | 대형 나무 |
| 18 | `drawBossSphinx(ctx, x, y, s, hp, phase)` | 스핑크스 보스 | 대형 복합 |
| 19 | `drawBossDragon(ctx, x, y, s, hp, phase)` | 프로스트 드래곤 보스 | 대형 S곡선 |
| 20 | `drawBossDarkMage(ctx, x, y, s, hp, phase)` | 어둠 마법사 보스 | 대형 3페이즈 |
| 21 | `drawBossGolem(ctx, x, y, s, hp, phase)` | 룬 골렘 보스 | 대형 룬 각인 |
| 22 | `drawMagicCircle(ctx, x, y, r, type, intensity)` | 마법진 이펙트 | 발광 원형 패턴 |
| 23 | `drawEnvironment(ctx, region, w, h)` | 지역 배경 | offscreen 캐싱 |
| 24 | `drawProjectile(ctx, x, y, type, frame)` | 마법 투사체 | 속성별 이펙트 |

### 11.2 썸네일 (별도 SVG)
- `thumbnail.svg`: 5×5 그리드에 빛나는 룬이 배치된 마법진 발동 장면. 시네마틱 구도. 20KB+
- viewBox: `0 0 480 360` (4:3 비율)

---

## §12. 모바일 대응

### 12.1 반응형 캔버스
```javascript
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);
  // 그리드 셀 크기 동적 계산: min(w, h) / 7
  buildGridCache(); // offscreen 재빌드 (F10)
}
```

### 12.2 입력 모드 자동 감지
```javascript
let inputMode = 'keyboard'; // 'keyboard' | 'mouse' | 'touch'
// 마지막 사용 입력 장치에 따라 자동 전환
// 터치 시 추가 UI 표시 (인벤토리 확대, 힌트 버튼)
```

### 12.3 터치 타겟 최소 크기 (F20, F24 대응)
```javascript
const MIN_TOUCH = 48; // px — 모든 인터랙티브 요소의 하한
function touchSafe(w, h) {
  return { w: Math.max(MIN_TOUCH, w), h: Math.max(MIN_TOUCH, h) };
}
// 모든 버튼 렌더링에서 touchSafe() 호출 강제
```

---

## §13. 사운드 시스템 (Web Audio API)

### 13.1 BGM
- **타이틀**: 신비로운 하프 아르페지오 (C-E-G-C 반복, 저음 패드)
- **퍼즐 페이즈**: 차분한 앰비언트 (낮은 bpm, 사색적)
- **방어 페이즈**: 긴장감 있는 퍼커션 (높은 bpm, 전투적)
- **보스전**: 강렬한 드럼 + 현악 트레몰로
- BGM 전환은 `crossFade(oldGain, newGain, duration)` 패턴

### 13.2 효과음 (10종 — F29 대응)

| # | 이벤트 | 사운드 | 구현 |
|---|--------|--------|------|
| 1 | 룬 배치 | 크리스탈 착지음 | 500Hz sine 20ms |
| 2 | 룬 회수 | 역방향 클릭 | 300Hz sine 15ms, pitch down |
| 3 | 마법진 발동 | 마법 충전음 (상승 스윕) | 200→800Hz sweep 300ms |
| 4 | 마법 적중 | 폭발음 | white noise 50ms + bandpass |
| 5 | 적 처치 | 소멸음 (하강 톤) | 600→100Hz sweep 200ms |
| 6 | 보스 등장 | 저음 임팩트 | 60Hz sine 500ms + reverb |
| 7 | 스테이지 클리어 | 팡파레 | C-E-G-C 메이저 코드 시퀀스 |
| 8 | 라이프 손실 | 경고음 | 100Hz square 300ms × 2 |
| 9 | 레시피 발견 | 마법서 차임 | 클릭 + 1200Hz bell 200ms |
| 10 | 업그레이드 구매 | 코인 사운드 | metallic ping 800Hz |

### 13.3 사운드 볼륨 밸런스 테이블

| 카테고리 | 기본 볼륨 | 범위 |
|----------|---------|------|
| BGM | 0.25 | 0~1 |
| SFX 일반 | 0.4 | — |
| SFX 마법진 발동 | 0.5 | — |
| SFX 보스 | 0.6 | — |
| SFX UI | 0.3 | — |

### 13.4 setTimeout 0건 정책 (F2 대응)
모든 사운드 타이밍은 `ctx.currentTime + delay` 네이티브 스케줄링. setTimeout/setInterval 사용 0건 목표.

---

## §14. 검증 체크리스트

### 14.1 초기화 순서 검증 (F11 대응)
```
1. 상수/CONFIG 선언
2. let/const 변수 전체 선언
3. DOM 요소 할당 (canvas, ctx)
4. 유틸리티 클래스 정의 (TweenManager, ObjectPool, SoundManager, ScrollManager)
5. 게임 데이터 정의 (RUNE_DATA, BOSS_DATA, UPGRADE_DATA, PATTERN_DATA)
6. 게임 로직 함수 정의
7. 이벤트 리스너 등록
8. init() 호출
9. requestAnimationFrame(gameLoop)
```
✅ **let/const 변수는 반드시 최초 사용 이전에 선언** — TDZ 크래시 방지

### 14.2 변수 사용처 검증 테이블 (F15 대응)

| 변수 | 선언 위치 | 갱신 위치 | 참조 위치 | 상태 |
|------|---------|---------|---------|------|
| grid[][] | init | PUZZLE 입력 처리 | scanMagicCircles, render | ✅ |
| inventory[] | init | 턴 시작, 배치/회수 | render, 입력 처리 | ✅ |
| lives | init | modifyLives() | render, GAMEOVER 판정 | ✅ |
| crystals | init | modifyCrystals() | 업그레이드 구매, render | ✅ |
| score | init | addScore() | render, RESULT | ✅ |
| puzzleTimer | enterPuzzle | updatePuzzleTimer(dt) | render, 자동 발동 판정 | ✅ |
| discoveredRecipes | init (localStorage) | 마법진 최초 발동 | 레시피북, 업적 | ✅ |
| upgrades{} | init (localStorage) | buyUpgrade() | 전투 계산, render | ✅ |
| inputMode | init | 입력 이벤트 | UI 조건 분기 | ✅ |
| isTransitioning | beginTransition() | onTransitionComplete | 상태 전환 가드 | ✅ |
| isPlacingRune | placeRune() | onPlaceComplete | 배치 중복 방지 | ✅ |
| isWaveActive | enterDefense | 웨이브 전멸 판정 | 클리어 가드 | ✅ |

### 14.3 기능별 세부 구현 체크리스트 (F19 대응)

**퍼즐 시스템**:
- [ ] 룬 선택 (키보드 1~5 + 마우스 클릭 + 터치 탭)
- [ ] 그리드 배치 (키보드 커서 + 마우스 클릭 + 터치 탭)
- [ ] 룬 회수 (키보드 R + 마우스 우클릭 + 터치 롱프레스)
- [ ] 드래그 앤 드롭 (터치 전용)
- [ ] 마법진 미리보기 하이라이트
- [ ] 발동 버튼 (키보드 Q + 마우스 클릭 + 터치 탭)
- [ ] 타이머 시각 표시 + 자동 발동

**방어 시스템**:
- [ ] 적 스폰 (레인 3개, 웨이브 데이터 기반)
- [ ] 적 이동 (좌측 방향, 속도 개별)
- [ ] 마법 투사체 생성 + 이동
- [ ] 충돌 검사 (투사체 × 적)
- [ ] 데미지 + 상태이상 적용
- [ ] 적 사망 + 파티클 + 사운드
- [ ] 적 도착 → 라이프 감소
- [ ] 웨이브 전멸 → 다음 웨이브 / 클리어

**UI 시스템**:
- [ ] 인벤토리 표시 (룬 아이콘 + 수량)
- [ ] 그리드 커서 (키보드 모드)
- [ ] HP/마나 바
- [ ] 점수 + 크리스탈 표시
- [ ] 레시피북 (터치 스크롤 포함 — F32)
- [ ] 업그레이드 상점 (터치 스크롤 포함 — F32)
- [ ] 일시정지 모달 (Canvas 기반 — F8)
- [ ] 튜토리얼 오버레이 (F34)

**pre-commit 훅 등록**: ☐ (독립 체크 항목)

### 14.4 수치 정합성 검증 테이블 (F7 대응)

| 기획서 항목 | 기획서 값 | 코드 상수 | 일치 |
|------------|---------|---------|------|
| 화 룬 기본 데미지 | 15 | RUNE_DATA.fire.damage | ☐ |
| 수 룬 감속률 | 30% | RUNE_DATA.water.slowRate | ☐ |
| 트레엔트 HP | 30 | BOSS_DATA.treant.hp | ☐ |
| 스핑크스 HP | 45 | BOSS_DATA.sphinx.hp | ☐ |
| 프로스트 드래곤 HP | 55 | BOSS_DATA.frost_dragon.hp | ☐ |
| 최종 보스 HP | 80 | BOSS_DATA.dark_mage.hp | ☐ |
| 히든 보스 HP | 100 | BOSS_DATA.rune_golem.hp | ☐ |
| 인벤토리 기본 최대 | 5 | CONFIG.INV_MAX_BASE | ☐ |
| 퍼즐 기본 제한시간 (숲) | 45초 | REGION_DATA[0].puzzleTime | ☐ |
| MIN_TOUCH | 48px | CONFIG.MIN_TOUCH | ☐ |
| 마나 확장 Lv1 비용 | 30 | UPGRADE_DATA.mana.costs[0] | ☐ |
| 직선-3 효과 배율 | 2.0× | PATTERN_DATA.line3.multiplier | ☐ |
| MOMENTUM_DECAY | 0.92 | CONFIG.MOMENTUM_DECAY | ☐ |
| MAX_MOMENTUM | 30 | CONFIG.MAX_MOMENTUM | ☐ |
| BOUNCE_FACTOR | 0.3 | CONFIG.BOUNCE_FACTOR | ☐ |

### 14.5 파일 시스템 검증 (F1 대응 — 20사이클 연속 재발 방지)

> **절대 규칙**: `games/runeforge-tactics/` 디렉토리에는 `index.html`과 `thumbnail.svg`만 존재해야 한다.
> `assets/` 디렉토리, `manifest.json`, 외부 SVG 파일 생성 절대 금지.

**pre-commit 훅 (실등록 필수)**:
```bash
#!/bin/sh
# .git/hooks/pre-commit에 실제 등록할 것
GAME_DIR="games/runeforge-tactics"
if [ -d "$GAME_DIR/assets" ]; then
  echo "ERROR: assets/ directory detected in $GAME_DIR"
  echo "All graphics must be Canvas code drawings. Remove assets/ directory."
  exit 1
fi
if grep -rn "assets/" "$GAME_DIR/index.html" 2>/dev/null; then
  echo "ERROR: assets/ reference found in code"
  exit 1
fi
if grep -rn "fonts.googleapis.com" "$GAME_DIR/index.html" 2>/dev/null; then
  echo "ERROR: External font dependency detected"
  exit 1
fi
echo "Pre-commit checks passed"
```

### 14.6 코드 내 금지 패턴 목록

| 금지 패턴 | 이유 | 대체 |
|-----------|------|------|
| `setTimeout()` | 상태 전환 타이밍 불안정 (F2) | tween.onComplete |
| `setInterval()` | 동일 | requestAnimationFrame 루프 |
| `alert()` / `confirm()` | iframe 차단 (F8) | Canvas 모달 |
| `new Image()` / `img.src` | 외부 에셋 로드 (F1) | Canvas drawXxx() |
| `fetch('assets/')` | 에셋 디렉토리 참조 (F1) | 코드 내 데이터 |
| `fonts.googleapis.com` | 외부 CDN (F33) | 시스템 monospace |
| `ASSET_MAP` / `SPRITES` | 에셋 매핑 잔존 (F1) | Canvas 직접 드로잉 |

### 14.7 회귀 테스트 플로우 (F14 대응)

수정 시 아래 전체 플로우를 순서대로 검증:
1. TITLE → 시작 → STAGE_SELECT
2. STAGE_SELECT → 스테이지 선택 → PUZZLE
3. PUZZLE → 룬 배치 → 발동 → DEFENSE
4. DEFENSE → 적 전멸 → RESULT
5. RESULT → 다음 스테이지 / 업그레이드
6. DEFENSE → 라이프 0 → GAMEOVER
7. GAMEOVER → 재시작 → TITLE
8. BOSS_INTRO → BOSS_FIGHT → RESULT (보스)
9. UPGRADE → 구매 → 돌아가기
10. RECIPE_BOOK → 스크롤(마우스 휠 + 터치 드래그) → 닫기
11. 모바일: 터치 배치/회수/드래그/발동/스크롤 전 동작

---

## §15. 코드 구조 가이드라인

### 15.1 논리적 섹션 구조 (F30, F35 대응)

```
§A. CONFIG & CONSTANTS           (~100줄)
§B. GAME DATA                     (~200줄)
    - RUNE_DATA, BOSS_DATA, UPGRADE_DATA
    - PATTERN_DATA, REGION_DATA, ENEMY_DATA
§C. UTILITY CLASSES              (~250줄)
    - TweenManager (clearImmediate 포함 — F6b)
    - ObjectPool (파티클, 투사체)
    - SoundManager (Web Audio)
    - ScrollManager (터치 스크롤 — F32)
§D. GRID & RUNE SYSTEM           (~300줄)
    - placeRune(), removeRune()
    - scanMagicCircles(grid) — 순수 함수 (F3)
    - matchPattern(grid, pattern) — 순수 함수
    - activateCircles()
§E. ENEMY & DEFENSE SYSTEM       (~250줄)
    - spawnEnemy(type, lane, config)
    - updateEnemies(enemies, dt, config) — 순수 함수
    - createProjectile(magic, target)
    - checkCollision(proj, enemy) — 순수 함수
    - applyDamage(enemy, amount, effects) — 순수 함수
§F. BOSS SYSTEM                   (~200줄)
    - initBoss(bossId), updateBoss(boss, dt, state)
    - bossCutscene()
§G. CAMERA & EFFECTS             (~100줄)
    - cameraZoom(), cameraPan(), screenShake()
§H. UPGRADE & PROGRESSION        (~150줄)
    - buyUpgrade(id, level)
    - saveProgress() / loadProgress()
    - checkAchievement()
§I. RENDERING                     (~400줄)
    - drawRune(), drawEnemy(), drawBoss()
    - drawGrid(), drawUI(), drawParticles()
    - buildGridCache() (offscreen — F10)
§J. STATE MACHINE                 (~200줄)
    - enterState(), beginTransition() (F23)
    - STATE_PRIORITY (F17)
    - 상태별 update/render 분기
§K. INPUT HANDLING                (~150줄)
    - 키보드/마우스/터치 통합 처리
    - inputMode 자동 감지, touchSafe() (F20)
§L. INIT & GAME LOOP             (~100줄)
    - init(), resizeCanvas()
    - gameLoop() (try-catch — F12)

예상 총 라인: ~2,400줄
```

### 15.2 순수 함수 규칙 (F3 대응)

아래 함수는 **반드시 파라미터만으로 동작**, 전역 상태 직접 접근 금지:
- `scanMagicCircles(grid)` → returns `Circle[]`
- `matchPattern(grid, pattern)` → returns `Match | null`
- `checkCollision(projX, projY, projR, enemyX, enemyY, enemyR)` → returns `boolean`
- `applyDamage(enemyHp, amount, defense)` → returns `newHp`
- `calculateScore(action, multiplier, region)` → returns `number`
- `resolveUpgradeEffect(baseValue, upgradeLevel, scaling)` → returns `number`
- `updateEnemies(enemies, dt, config)` → returns updated enemies

### 15.3 단일 갱신 경로 원칙 (F16 대응)

| 값 | 갱신 함수 | 금지 |
|----|---------|------|
| lives | `modifyLives(delta)` | `lives--` 직접 변경 |
| crystals | `modifyCrystals(delta)` | `crystals += n` 직접 변경 |
| score | `addScore(amount, reason)` | `score += n` 직접 변경 |
| puzzleTimer | `updatePuzzleTimer(dt)` | `puzzleTimer -= dt` 직접 변경 |

---

## §16. 다국어 지원

### 16.1 텍스트 테이블

```javascript
const LANG = {
  ko: {
    title: '룬포지 택틱스',
    start: '시작하기',
    stageSelect: '스테이지 선택',
    puzzle: '룬 배치',
    defense: '방어!',
    activate: '발동',
    inventory: '인벤토리',
    recipeBook: '레시피북',
    upgrade: '업그레이드',
    score: '점수',
    crystals: '크리스탈',
    lives: '라이프',
    timer: '남은 시간',
    wave: '웨이브',
    clear: '클리어!',
    gameover: '게임 오버',
    newRecipe: '새 레시피 발견!',
    pause: '일시정지',
    resume: '계속하기',
    restart: '처음부터',
    back: '돌아가기',
    buy: '구매',
    maxLevel: '최대 레벨',
    achievement: '업적 달성!',
    forest: '숲', desert: '사막', ice: '얼음', volcano: '화산', tower: '고대 탑',
    apprentice: '견습생', mage: '마법사', archmage: '대마법사'
  },
  en: {
    title: 'Runeforge Tactics',
    start: 'Start',
    stageSelect: 'Stage Select',
    puzzle: 'Place Runes',
    defense: 'Defend!',
    activate: 'Activate',
    inventory: 'Inventory',
    recipeBook: 'Recipe Book',
    upgrade: 'Upgrade',
    score: 'Score',
    crystals: 'Crystals',
    lives: 'Lives',
    timer: 'Time Left',
    wave: 'Wave',
    clear: 'Clear!',
    gameover: 'Game Over',
    newRecipe: 'New Recipe Found!',
    pause: 'Paused',
    resume: 'Resume',
    restart: 'Restart',
    back: 'Back',
    buy: 'Buy',
    maxLevel: 'MAX',
    achievement: 'Achievement Unlocked!',
    forest: 'Forest', desert: 'Desert', ice: 'Ice', volcano: 'Volcano', tower: 'Ancient Tower',
    apprentice: 'Apprentice', mage: 'Mage', archmage: 'Archmage'
  }
};
// navigator.language.startsWith('ko') ? 'ko' : 'en'
```

---

## §17. 영구 진행 시스템 (localStorage 데이터 스키마)

### 17.1 저장 데이터 구조

```javascript
const SAVE_KEY = 'rft_save_v1';
const SAVE_SCHEMA = {
  version: 1,                    // 스키마 버전 (마이그레이션용)
  currentRegion: 0,              // 현재 지역 인덱스 (0~4)
  currentStage: 0,               // 현재 스테이지 인덱스 (0~2)
  clearedStages: [],             // 클리어한 스테이지 ID 배열 ["1-1","1-2",...]
  crystals: 0,                   // 보유 크리스탈
  highScore: 0,                  // 최고 점수
  upgrades: {                    // 업그레이드 레벨
    mana: 0, runeBoost: 0, invExpand: 0,
    intuition: 0, magnet: 0, timeWarp: 0,
    shield: 0, mastery: 0
  },
  discoveredRecipes: [],         // 발견한 마법진 패턴 ID 배열
  achievements: [],              // 달성한 업적 ID 배열
  hiddenFound: [false, false],   // 히든 스테이지 발견 여부
  difficulty: 'mage',            // 난이도 설정
  tutorialDone: false,           // 튜토리얼 완료 여부
  lang: 'ko',                    // 언어 설정
  muted: false,                  // 음소거 설정
  totalPlayTime: 0               // 누적 플레이 시간 (초)
};
```

### 17.2 저장/로드 규칙
- **저장 시점**: 스테이지 클리어, 업그레이드 구매, 레시피 발견, 업적 달성, 설정 변경
- **판정 먼저, 저장 나중에** (Cycle 2 B4 교훈): 새 기록 판정 후 저장 실행
- **마이그레이션**: `version` 필드로 향후 스키마 변경 시 자동 변환

---

## §18. 사이드바 / GameCard 메타데이터

### 18.1 게임 페이지 사이드바 정보

```yaml
game:
  title: "룬포지 택틱스"
  description: "고대 룬을 배치하여 마법진을 완성하고, 3레인 적 웨이브를 마법으로 격퇴하는 퍼즐 전략 게임. 120+ 마법진 조합을 발견하고, 5개 지역 22스테이지를 공략하라!"
  genre: ["puzzle", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "방향키/WASD: 그리드 커서 이동"
    - "Space: 룬 배치"
    - "1~5: 룬 선택"
    - "Q: 마법진 발동"
    - "R: 배치 취소"
    - "Tab: 레시피북"
    - "터치: 탭으로 선택·배치, 드래그 앤 드롭"
  tags:
    - "#퍼즐"
    - "#전략"
    - "#마법"
    - "#룬"
    - "#타워디펜스"
    - "#로그라이트"
    - "#프로시저럴"
    - "#영구성장"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

### 18.2 홈 페이지 GameCard 표시

```yaml
thumbnail: "games/runeforge-tactics/thumbnail.svg"  # 4:3 비율
title: "룬포지 택틱스"                                # 1줄 잘림
description: "고대 룬으로 마법진을 완성하고 적 웨이브를 격퇴하는 퍼즐 전략 게임"  # 2줄 잘림
genre: ["puzzle", "strategy"]                        # 배지 2개
playCount: 0                                         # 0
addedAt: "2026-03-22"                                # 7일 이내 → "NEW" 배지
featured: true                                       # ⭐ 배지
```

---

_InfiniTriX Game Spec — Cycle #21 — Runeforge Tactics_
_https://infinitrix-games.vercel.app_
