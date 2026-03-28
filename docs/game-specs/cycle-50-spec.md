---
game-id: gem-kingdom-builder
title: 보석 왕국 건설기
genre: puzzle
difficulty: medium
---

# 보석 왕국 건설기 (Gem Kingdom Builder)

> **사이클 #50 — 매치3 집중 모드 7/10 라운드 (후기 1/4: 프리미엄 완성 + 메타 시스템)**
> Royal Match의 핵심 공식 — 매치3 + 왕국 건설 메타 시스템 완전 통합. 보석을 매칭하고, 별을 모아, 무너진 왕국을 재건하라!

---

## §0. MVP 범위 정의

### Phase 1 — 이번 사이클 구현 범위 (MVP)
- C49 젬 로얄 챌린지 핵심 엔진 계승 (8×8 그리드, 6색, 매치 검출 우선순위, 캐스케이드, 스페셜 조합 6종)
- 장애물 8종 유지 (얼음 1~3겹, 체인, 나무 상자, 독 퍼짐, 돌 블록, 커튼, 젤리, Pie 블로커)
- 부스터 4종 유지 (망치, 셔플, 추가 턴, 색상 폭탄)
- **★핵심 신규: 왕국 건설 메타 시스템**
  - 레벨 클리어 → 별 1~3개 획득 → 건물/장식 배치 선택지 (3택 1)
  - 5구역(성문/정원/시장/도서관/왕좌실) × 6레벨 = 30레벨
  - 각 구역 완성 시 패시브 보너스 + 구역 해금 연출
  - 왕국 맵 화면: 건설 진행도 시각화, 줌/패닝, 건물 탭 상호작용
- **★신규: 일일 챌린지** (SeededRNG 날짜 시드 — C49 코드 계승)
- **★신규: 주간 건설 경쟁** (AI 3명과 건설 진행도 순위 경쟁)
- deferredTransition 큐 계승 (C49 검증 패턴)
- safeGridAccess() + coreUpdate() 단일화 + finally input.flush() 계승
- 12상태 이내 TRANSITION_TABLE (C49 18상태에서 최적화)
- Web Audio BGM + 효과음 10종+
- Canvas 풀스크린 + devicePixelRatio + 동적 리사이즈
- 다국어 ko/en
- 왕국 건설 진행 세이브/로드 (localStorage try-catch)

### Phase 2+ — 후속 라운드 확장 (이번에 미구현)
- 실시간 PvP 온라인 대전
- 길드 시스템 + 협동 건설
- 시즌 패스 (무료/프리미엄 보상 트랙)
- 부스터 업그레이드 시스템 (3단계 강화)

---

## §0.1 이전 학습 반영 매핑

### C44~49 검증 완료 (유지) ✅
| ID | 검증된 패턴 | 적용 섹션 |
|----|------------|-----------|
| V1 | 매치 검출 우선순위(5→T/L→4→3) + used[][] 소비 추적 | §2.2 |
| V2 | TRANSITION_TABLE 화이트리스트 방식 | §5.3 |
| V3 | 가드 플래그 11중 방어 + isInputBlocked() 단일 함수 | §5.1.1 |
| V4 | 초기 보드 3매치 없음 + 유효 이동 BFS 검증 | §2.1 |
| V5 | tween onComplete 콜백 체인 (setTimeout 0건) | §5 전체 |
| V6 | DDA failStreak 기반 다단계 | §6.3 |
| V7 | Gemini PNG + manifest.json + Canvas 폴백 100% | §8 |
| V8 | touchSafe() 48px 강제 적용 | §3.4 |
| V9 | directTransition() 즉시 전환 API | §5.3 |
| V10 | SeededRNG (Math.random() 0건) | §5 전체 |
| V11 | MAP/PLAY InputHandler 완전 분리 | §5.3 |
| V12 | safeGridAccess() + coreUpdate() 단일화 + finally input.flush() | §5.1 |
| V13 | deferredTransition 큐 — enterState 데드락 근본 해결 | §5.3 |
| V14 | drawAssetOrFallback 전수 폴백 | §8 |

### C49 젬 로얄 챌린지 아쉬웠던 점 → C50 해결 (신규 상세) 🔧
| ID | C49 문제 | 해결 섹션 | 기술적 해결책 |
|----|----------|-----------|--------------|
| F1 | **치명적 호이스팅 버그** — `function f()` 선언으로 9개 함수 무한 재귀 → 검은 화면 | §5.1, §12 | **함수 오버라이드 전면 금지**: 이번 사이클에서는 함수 오버라이드 패턴 자체를 사용하지 않음. 기능 확장은 모듈 내부에서 직접 구현. 불가피한 경우 `f = function()` 대입문만 사용 (declaration 0건 정책). §12 린터 체크리스트 항목 추가 |
| F2 | **이벤트 4종 과잉 복잡도** — 18상태 TRANSITION_TABLE | §5.3 | **이벤트 2종으로 축소**: 일일 챌린지 + 주간 건설 경쟁만 구현. 상태 12개 이내. King's Cup/팀 배틀은 Phase 2로 이관 |
| F3 | **renderMap 이중 오버라이드** — §54, §98에서 두 번 오버라이드 | §5.1 | **모듈별 단일 함수 원칙**: 각 기능(맵 렌더링, 왕국 렌더링 등)을 별도 함수로 분리. renderKingdomMap(), renderLevelMap() 등 명확한 네이밍 |
| F4 | **런타임 검증 부재** — 4700줄에서 눈으로 검증 불가 | §12 | **자가 검증 체크리스트 10항목**: 타이틀→맵→레벨1→첫 매치→캐스케이드→왕국맵→건설→세이브→로드→일일챌린지. 각 항목 콘솔 로그 자동 출력 |
| F5 | **함수 오버라이드 비일관성** — 대입문/선언문 혼용 | §5.1 | **오버라이드 패턴 사용 0건 목표**. 기능 분기는 if/else 또는 전략 패턴(함수 맵)으로 처리 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
보석 왕국 5개 구역(성문 광장, 왕실 정원, 번화가 시장, 대도서관, 왕좌실)을 복원하는 **건설 메타 매치3**. 매치3 레벨을 클리어하면 별을 획득하고, 별로 왕국의 건물과 장식을 선택하여 배치한다. Royal Match의 핵심 공식(매치3 + 건설 메타)을 HTML5 단일 파일로 구현하되, 6라운드간 축적된 매치3 엔진의 완성도를 프리미엄급 주스(juice) 이펙트와 왕국 건설의 장기 동기 부여로 마무리한다.

### 핵심 재미 요소
1. **"한 판만 더" 건설 동기**: 별 1개만 더 모으면 분수대가 완성된다! → 레벨 1개 더 → 자연스러운 세션 연장
2. **3택 1 건설 선택**: 별을 모을 때마다 3개 건물/장식 중 하나를 선택. "내 왕국"이라는 소유감 + 선택의 재미
3. **구역 완성 보너스**: 6레벨 클리어 + 건설 완료 시 구역 패시브 보너스(추가 턴, 점수 배율 등) + 화려한 해금 연출
4. **연쇄 폭발의 쾌감**: 캐스케이드 → 콤보 → 스페셜 조합의 도미노 폭발. 보석 광택 + 충격파 + 파티클 주스
5. **장애물 8종의 전략적 깊이**: 복합 장애물 조합이 각 레벨마다 고유한 퍼즐 경험 제공
6. **일일 챌린지**: 날짜 시드 기반 매일 다른 특수 규칙 — "오늘의 챌린지" 완료 시 건설 자재 보너스
7. **주간 건설 경쟁**: AI 3명과 건설 진행도 순위 — 1위 달성 시 한정 장식 보상

---

## §2. 게임 규칙 및 목표

### §2.1 보드 구성
- **8×8 그리드**, 6색 보석 (루비-빨강, 사파이어-파랑, 에메랄드-초록, 토파즈-노랑, 아메시스트-보라, 다이아몬드-하양)
- 초기 보드 생성: 3매치 없음 + 유효 이동 1개 이상 BFS 검증 (SeededRNG)
- 유효 이동 없을 시 자동 셔플 (3회 실패 시 보드 전체 재생성)

### §2.2 매칭 규칙 (우선순위 매치 검출 — V1 계승)
검출 순서 (상위 우선):
1. **5매치** → 무지개 보석 (Rainbow Gem): 선택한 색상 전체 제거
2. **T/L자 매치** → 폭탄 보석 (Bomb Gem): 3×3 범위 폭발
3. **4매치** → 줄 파괴 보석 (Line Gem): 가로 또는 세로 한 줄 전체 파괴 (스왑 방향 기반)
4. **3매치** → 기본 매칭: 해당 보석 3개 제거
- `used[][]` 소비 추적으로 중복 매치 방지 (V1)

### §2.3 스페셜 조합 (6종)
| 조합 | 효과 | 연출 |
|------|------|------|
| Line + Line | 십자가 파괴 (가로+세로 동시) | 십자 레이저 빔 |
| Line + Bomb | 3줄 파괴 (가로 3줄 또는 세로 3줄) | 확장 레이저 |
| Bomb + Bomb | 5×5 범위 폭발 | 대형 충격파 |
| Line + Rainbow | 모든 보석 → Line 변환 후 전체 폭발 | 무지개 레이저 비 |
| Bomb + Rainbow | 모든 보석 → Bomb 변환 후 전체 폭발 | 무지개 충격파 연쇄 |
| Rainbow + Rainbow | 보드 전체 보석 제거 | 화면 전체 백색 플래시 + 별 파티클 |

### §2.4 장애물 8종
| 장애물 | 해제 조건 | 레벨 첫 등장 | 시각적 특징 |
|--------|-----------|-------------|------------|
| 얼음 (1~3겹) | 인접 매칭 1회당 1겹 제거 | 레벨 2 | 반투명 청색 크리스탈, 겹수별 두께 |
| 체인 | 인접 매칭 2회 | 레벨 4 | 금속 사슬, 1회 시 끊어지는 애니메이션 |
| 나무 상자 | 인접 매칭 1회 | 레벨 6 | 나무결 텍스처, 파괴 시 조각 파티클 |
| 독 퍼짐 | 턴마다 인접 1칸 확산, 매칭으로 제거 | 레벨 9 | 보라색 연기, 확산 시 물결 |
| 돌 블록 | 매칭 불가, 스페셜로만 파괴 | 레벨 12 | 회색 바위, 균열 텍스처 |
| 커튼 | 인접 매칭 1회로 열림 (숨겨진 보석 공개) | 레벨 15 | 붉은 벨벳 커튼, 열리는 애니메이션 |
| 젤리 | 매칭 위에서 2회 매칭해야 제거 | 레벨 19 | 투명 젤리 질감, 흔들림 |
| Pie 블로커 | 인접 6회 매칭 (6조각 → 1조각씩 제거) | 레벨 23 | 6조각 파이, 각 조각 개별 제거 |

### §2.5 부스터 4종
| 부스터 | 효과 | 획득 방법 |
|--------|------|-----------|
| 🔨 망치 | 선택한 보석 1개 즉시 파괴 | 레벨 클리어 보상 / 일일 챌린지 |
| 🔄 셔플 | 보드 전체 보석 재배치 | 5레벨마다 1개 무료 |
| ➕ 추가 턴 | 턴 +5 추가 | 구역 완성 보상 |
| 💎 색상 폭탄 | 선택한 색상 전체 제거 (무지개 효과) | 주간 경쟁 1위 보상 |

### §2.6 레벨 목표 유형
각 레벨은 아래 목표 중 1~2개를 조합:
| 목표 유형 | 설명 | 아이콘 |
|-----------|------|--------|
| 보석 수집 | 특정 색상 N개 매칭 | 색상 보석 + 숫자 |
| 장애물 제거 | 특정 장애물 N개 파괴 | 장애물 아이콘 + 숫자 |
| 점수 달성 | 목표 점수 이상 | 별 + 숫자 |
| 보석 낙하 | 특정 아이템을 보드 최하단으로 이동 | 화살표 아이콘 |

### §2.7 왕국 건설 메타 시스템 (★핵심 신규)

#### 건설 루프
```
레벨 클리어 → 별 1~3개 획득 → 왕국 맵 이동 → 건설 선택지 3택 1 → 배치 애니메이션
→ 구역 건설 게이지 증가 → 게이지 100% 시 구역 완성 연출 + 패시브 보너스 해금
→ 다음 구역 개방 → 반복
```

#### 5구역 건설 상세
| 구역 | 테마 | 레벨 범위 | 건물 수 | 완성 보너스 |
|------|------|-----------|---------|------------|
| 🏰 성문 광장 | 튜토리얼 + 입문 | 1~6 | 4개 | 기본 턴 +1 |
| 🌿 왕실 정원 | 자연 + 생장 | 7~12 | 5개 | 매칭 점수 ×1.1 |
| 🏪 번화가 시장 | 상업 + 활기 | 13~18 | 5개 | 부스터 슬롯 +1 |
| 📚 대도서관 | 지식 + 마법 | 19~24 | 5개 | 스페셜 생성 확률 +5% |
| 👑 왕좌실 | 최종 + 호화 | 25~30 | 6개 | 전체 효과 중첩 |

#### 건설 선택지 예시 (성문 광장)
- 별 2개: **성문 복원** / **경비초소 건설** / **환영 분수대** (3택 1)
- 선택하지 않은 건물은 소멸 (리플레이 시 다른 선택 가능)
- 각 건물은 순수 시각적 + 약한 패시브 보너스 (밸런스 파괴 방지)

#### 세이브/로드
```javascript
// localStorage try-catch 래핑 (V7 패턴)
const gSaveData = {
  kingdom: { zones: [{built: [], progress: 0}, ...], totalStars: 0 },
  levels: { cleared: [], stars: {}, bestScore: {} },
  boosters: { hammer: 0, shuffle: 0, extraTurn: 0, colorBomb: 0 },
  daily: { lastDate: '', completed: false },
  weekly: { rank: 0, score: 0 },
  settings: { lang: 'ko', sfx: true, bgm: true, colorblind: false }
};
```

---

## §3. 조작 방법

### §3.1 키보드 (PC)
| 키 | 동작 |
|----|------|
| 마우스 드래그 | 보석 스왑 (인접 4방향) |
| 마우스 클릭 | 부스터 사용 시 대상 선택, 건설 선택, UI 버튼 |
| ESC | 일시정지 / 메뉴 |
| R | 레벨 재시작 |
| 1~4 | 부스터 1~4 선택 |
| F4 | DEV_AUTO_PLAY 토글 (개발 모드) |

### §3.2 마우스 (PC)
- **보석 스왑**: 드래그 방향으로 인접 보석과 교환 (30px 이상 드래그 시 발동)
- **왕국 맵**: 드래그로 맵 패닝, 클릭으로 건물 상호작용
- **레벨 맵**: 클릭으로 레벨 선택

### §3.3 터치 (모바일)
- **보석 스왑**: 터치 드래그 (threshold 30px)
- **왕국 맵**: 터치 드래그로 패닝, 핀치 줌 (2-finger)
- **부스터**: 하단 부스터 버튼 탭 → 대상 보석 탭

### §3.4 터치 타겟 강제 (V8)
```javascript
// 모든 인터랙티브 요소에 적용
const MIN_TOUCH = 48;
function touchSafe(size) { return Math.max(MIN_TOUCH, size); }
```
- 부스터 버튼, 건설 선택지, 메뉴 버튼, 레벨 선택 노드 모두 최소 48×48px

---

## §4. 시각적 스타일 가이드

### §4.1 색상 팔레트
| 용도 | 색상 | HEX |
|------|------|-----|
| 배경 기본 (따뜻한 크림) | ██ | #FFF8E7 |
| 왕국 하늘 (맑은 파랑) | ██ | #87CEEB |
| UI 프레임 (로열 골드) | ██ | #DAA520 |
| 루비 (빨강) | ██ | #E74C3C |
| 사파이어 (파랑) | ██ | #3498DB |
| 에메랄드 (초록) | ██ | #2ECC71 |
| 토파즈 (노랑) | ██ | #F1C40F |
| 아메시스트 (보라) | ██ | #9B59B6 |
| 다이아몬드 (하양) | ██ | #ECF0F1 |
| 강조 (핫핑크) | ██ | #FF6B9D |

### §4.2 배경
- **레벨 플레이**: 각 구역 테마에 맞는 배경 (성문→석조벽, 정원→꽃밭, 시장→가판대, 도서관→책장, 왕좌실→왕좌)
- **왕국 맵**: 조감도 시점의 판타지 왕국. 건설 전은 폐허/안개, 건설 후는 화려한 건물
- **레벨 맵**: 구역별 경로형 노드맵 (점선 연결, 별 표시)

### §4.3 오브젝트 형태
- **보석**: 둥글고 광택 있는 3D 느낌의 2D 렌더링. 부드러운 그라디언트 + 글로시 하이라이트 + 내부 빛 산란
- **장애물**: 각각 고유한 텍스처와 파괴 애니메이션
- **건물**: 판타지 동화풍 건축물. 따뜻한 색조, 둥근 지붕, 깃발/화분 등 소품

---

## §4.5 아트 디렉션 (Art Direction)

### 아트 스타일 키워드
**"glossy casual fantasy"** — 밝고 따뜻한 판타지 동화 스타일. 글로시한 3D 느낌의 2D 보석 + 부드러운 그라디언트 배경 + 카툰 건축물

### 스타일 상세
- **보석**: Royal Match / Candy Crush 급 — 부드러운 그라디언트, 글로시 반사, 내부 빛 산란, 각 색상별 고유 커팅 형태
- **배경**: 따뜻한 톤의 판타지 왕국. 수채화 느낌의 하늘 + 선명한 건축물
- **UI**: 골드 프레임 + 둥근 버튼 + 드롭 섀도우. 프리미엄 캐주얼 느낌
- **이펙트**: 밝은 파티클, 별 반짝임, 부드러운 글로우

### 레퍼런스 게임
1. **Royal Match** (Dream Games) — 왕국 건설 메타 + 보석 시각 품질 + UI 레이아웃
2. **Homescapes** (Playrix) — 건설/장식 선택 시스템 + 따뜻한 인테리어 분위기

---

## §5. 핵심 게임 루프 (초당 프레임 기준 로직 흐름)

### §5.1 메인 루프 구조
```
requestAnimationFrame(gameLoop)
├── deltaTime = (now - lastTime) / 1000  (캡: 최대 0.05s)
├── coreUpdate(dt)
│   ├── gTweenManager.update(dt)
│   ├── stateHandlers[gState].update(dt)
│   ├── gParticleManager.update(dt)
│   └── deferredTransitionProcess()  ← 큐 소비 (V13)
├── coreRender()
│   ├── clearCanvas()
│   ├── stateHandlers[gState].render()
│   └── renderUI()
└── lastTime = now
```

#### §5.1.1 가드 플래그 (11중 방어 — V3 계승)
```javascript
const GUARDS = {
  isSwapping: false,      // 스왑 애니메이션 중
  isCascading: false,     // 캐스케이드 처리 중
  isMatching: false,      // 매치 검출 중
  isShuffling: false,     // 셔플 중
  isSpecialActivating: false, // 스페셜 발동 중
  isBoosterActive: false, // 부스터 사용 중
  isTransitioning: false, // 상태 전환 중
  isPaused: false,        // 일시정지
  isBuilding: false,      // 건설 애니메이션 중 (★신규)
  isDailyActive: false,   // 일일 챌린지 활성 (★신규)
  isInputLocked: false    // 입력 전체 잠금
};

function isInputBlocked() {
  return GUARDS.isSwapping || GUARDS.isCascading || GUARDS.isMatching ||
         GUARDS.isShuffling || GUARDS.isSpecialActivating || GUARDS.isBoosterActive ||
         GUARDS.isTransitioning || GUARDS.isPaused || GUARDS.isBuilding;
}
```

#### §5.1.2 함수 오버라이드 금지 정책 (F1 해결)
```
⚠️ 이 프로젝트에서 함수 오버라이드 패턴은 사용하지 않습니다.
- `function f()` 선언으로 기존 함수를 재선언하는 것은 절대 금지
- 불가피한 경우 `f = function()` 대입문만 사용
- 기능 분기는 stateHandlers 맵 또는 if/else로 처리
- 목표: 코드 전체에서 함수 오버라이드 0건
```

### §5.2 프레임별 상세 흐름 (매치3 플레이 상태)

```
[입력 감지] → 스왑 방향 결정 (threshold 30px)
→ [스왑 애니메이션] tween 0.2s, GUARDS.isSwapping = true
→ [매치 검출] findMatches() — 우선순위 5→T/L→4→3, used[][] 추적
  ├── 매치 있음 → [제거 애니메이션] 0.3s + 파티클 + 점수
  │   → [스페셜 생성] 조건 충족 시 스페셜 보석 배치
  │   → [중력 낙하] tween 0.15s/칸
  │   → [새 보석 생성] 상단에서 떨어짐
  │   → [매치 재검출] → 캐스케이드 반복 (콤보 카운터++)
  │   → [캐스케이드 종료] → 턴 소모 + 목표 체크
  │   → [목표 달성?] → 레벨 클리어 → 별 계산 → 왕국 맵
  │   → [턴 소진?] → 레벨 실패 → 리트라이 선택
  └── 매치 없음 → [스왑 되돌리기] tween 0.2s
→ [장애물 업데이트] 독 퍼짐 등 턴 기반 장애물 처리
→ [유효 이동 검사] 없으면 자동 셔플
```

### §5.3 상태 머신 (12상태 — C49 18상태에서 축소)

```
상태 전환 다이어그램:

BOOT → TITLE → KINGDOM_MAP ↔ LEVEL_MAP → LEVEL_INTRO → PLAY
                    ↑              ↑            ↑          ↕
                    │              │            │        PAUSED
                    │              │            │          ↕
                    │              │            └──── LEVEL_CLEAR
                    │              │                      ↕
                    │              └───────────── LEVEL_FAIL
                    │
                    └──── BUILD_SELECT → BUILD_ANIM ──┘
                    ↕
               DAILY_CHALLENGE (PLAY 재사용)
```

#### TRANSITION_TABLE (화이트리스트 — V2)
```javascript
const STATE = {
  BOOT: 0, TITLE: 1, KINGDOM_MAP: 2, LEVEL_MAP: 3,
  LEVEL_INTRO: 4, PLAY: 5, PAUSED: 6, LEVEL_CLEAR: 7,
  LEVEL_FAIL: 8, BUILD_SELECT: 9, BUILD_ANIM: 10,
  DAILY_CHALLENGE: 11
};

const TRANSITION_TABLE = {
  [STATE.BOOT]:            [STATE.TITLE],
  [STATE.TITLE]:           [STATE.KINGDOM_MAP],
  [STATE.KINGDOM_MAP]:     [STATE.LEVEL_MAP, STATE.BUILD_SELECT, STATE.DAILY_CHALLENGE, STATE.TITLE],
  [STATE.LEVEL_MAP]:       [STATE.LEVEL_INTRO, STATE.KINGDOM_MAP],
  [STATE.LEVEL_INTRO]:     [STATE.PLAY],
  [STATE.PLAY]:            [STATE.PAUSED, STATE.LEVEL_CLEAR, STATE.LEVEL_FAIL],
  [STATE.PAUSED]:          [STATE.PLAY, STATE.LEVEL_MAP, STATE.KINGDOM_MAP],
  [STATE.LEVEL_CLEAR]:     [STATE.BUILD_SELECT, STATE.LEVEL_MAP, STATE.KINGDOM_MAP],
  [STATE.LEVEL_FAIL]:      [STATE.PLAY, STATE.LEVEL_MAP, STATE.KINGDOM_MAP],
  [STATE.BUILD_SELECT]:    [STATE.BUILD_ANIM, STATE.KINGDOM_MAP],
  [STATE.BUILD_ANIM]:      [STATE.KINGDOM_MAP, STATE.LEVEL_MAP],
  [STATE.DAILY_CHALLENGE]: [STATE.PLAY, STATE.KINGDOM_MAP]
};
```

#### deferredTransition 큐 (V13 계승)
```javascript
const gDeferredQueue = [];

// enterState() 내부에서 전환 요청 시:
function requestTransition(nextState) {
  if (GUARDS.isTransitioning) {
    gDeferredQueue.push(nextState);
    console.warn('[DEFERRED] Transition queued:', nextState);
    return;
  }
  beginTransition(nextState);
}

// coreUpdate() 말미에서 큐 소비:
function deferredTransitionProcess() {
  if (gDeferredQueue.length > 0 && !GUARDS.isTransitioning) {
    const next = gDeferredQueue.shift();
    beginTransition(next);
  }
}
```

### §5.4 상태×시스템 매트릭스 (V3 — wisdom §3)

| 상태 | Tween | Particle | Input | Board | Kingdom | Audio | Save |
|------|-------|----------|-------|-------|---------|-------|------|
| BOOT | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 로드 |
| TITLE | ✅ | ✅ | ✅menu | ❌ | ❌ | BGM | ❌ |
| KINGDOM_MAP | ✅ | ✅ | ✅map | ❌ | ✅render | BGM | ❌ |
| LEVEL_MAP | ✅ | ✅ | ✅map | ❌ | ❌ | BGM | ❌ |
| LEVEL_INTRO | ✅ | ✅ | ❌ | ✅init | ❌ | SFX | ❌ |
| PLAY | ✅ | ✅ | ✅board | ✅full | ❌ | BGM+SFX | ❌ |
| PAUSED | ❌ | ❌ | ✅menu | ❌ | ❌ | 음소거 | 저장 |
| LEVEL_CLEAR | ✅ | ✅ | ✅btn | ❌ | ❌ | SFX팡파레 | 저장 |
| LEVEL_FAIL | ✅ | ✅ | ✅btn | ❌ | ❌ | SFX실패 | ❌ |
| BUILD_SELECT | ✅ | ✅ | ✅select | ❌ | ✅render | SFX | ❌ |
| BUILD_ANIM | ✅ | ✅ | ❌ | ❌ | ✅anim | SFX건설 | 저장 |
| DAILY_CHALLENGE | ✅ | ✅ | ✅board | ✅full | ❌ | BGM+SFX | 저장 |

### §5.5 InputHandler 분리 (V11 계승)
```javascript
const InputHandlers = {
  menu: { down, up, move },    // 타이틀/일시정지 메뉴
  map: { down, up, move },     // 왕국맵/레벨맵 패닝+탭
  board: { down, up, move },   // 매치3 보드 스왑
  select: { down, up, move },  // 건설 선택지 탭
  btn: { down, up, move }      // 단순 버튼 탭
};
```

---

## §6. 난이도 시스템

### §6.1 30레벨 난이도 곡선

| 구역 | 레벨 | 턴 | 목표 수 | 장애물 종류 | 특수 규칙 |
|------|------|----|---------|------------|-----------|
| 성문 (1~6) | 1 | 25 | 1 (보석 20개) | 없음 | 튜토리얼 |
| | 2 | 22 | 1 (보석 30개) | 얼음 1겹 | |
| | 3 | 22 | 1 (얼음 10개) | 얼음 1~2겹 | |
| | 4 | 20 | 2 (보석+체인) | 체인 | |
| | 5 | 20 | 1 (점수 5000) | 얼음+체인 | |
| | 6★ | 18 | 2 (체인 15+얼음 10) | 복합 | 구역 보스 |
| 정원 (7~12) | 7~11 | 18~15 | 1~2 | 나무상자+독 추가 | 독 퍼짐 메커닉 |
| | 12★ | 15 | 2 (독 전멸+보석) | 복합 | 구역 보스 |
| 시장 (13~18) | 13~17 | 16~13 | 2 | 돌블록+커튼 추가 | 숨겨진 보석 |
| | 18★ | 13 | 2 (커튼 전체+점수) | 복합 | 구역 보스 |
| 도서관 (19~24) | 19~23 | 14~11 | 2~3 | 젤리+Pie 추가 | 복합 장애물 |
| | 24★ | 11 | 3 | 전종 | 구역 보스 |
| 왕좌실 (25~30) | 25~29 | 12~9 | 2~3 | 전종 복합 | 최고 난이도 |
| | 30★ | 8 | 3 (전멸 목표) | 전종 | 최종 보스 |

★ = 구역 보스 레벨 (건설 마일스톤)

### §6.2 난이도 설계 원칙
- 첫 3레벨은 반드시 1회 시도 클리어 가능 (튜토리얼)
- 구역 보스 레벨(6,12,18,24,30)은 평균 2~3회 시도 클리어
- 독 퍼짐 레벨은 시간 압박, Pie 레벨은 계획적 플레이 유도
- 레벨 30은 전 장애물 복합 + 최소 턴으로 극한 도전

### §6.3 DDA (Dynamic Difficulty Adjustment — V6 계승)

```javascript
const DDA = {
  failStreak: 0,           // 연속 실패 횟수
  adjustLevel(levelConfig) {
    if (this.failStreak >= 3) {
      levelConfig.turns += 2;        // 턴 +2
      levelConfig.targetReduction = 0.9; // 목표량 10% 감소
    }
    if (this.failStreak >= 5) {
      levelConfig.turns += 3;        // 턴 추가 +3 (누적 +5)
      levelConfig.freeBooster = 'hammer'; // 무료 부스터 제공
    }
    if (this.failStreak >= 8) {
      levelConfig.turns += 5;        // 극한 보정 (누적 +10)
      levelConfig.freeBooster = 'colorBomb';
      levelConfig.targetReduction = 0.75; // 목표량 25% 감소
    }
  },
  onClear() { this.failStreak = Math.max(0, this.failStreak - 1); },
  onFail() { this.failStreak++; }
};
```

- 일일 챌린지에는 DDA 비적용 (공정한 경쟁)
- DDA 적용 시 UI에 "도움 모드" 표시 없음 (플레이어 자존심 보호)

---

## §7. 점수 시스템

### §7.1 기본 점수
| 행동 | 점수 |
|------|------|
| 3매치 | 50 |
| 4매치 | 150 |
| T/L 매치 | 200 |
| 5매치 | 500 |
| 캐스케이드 콤보 | 기본 × (콤보 수 × 0.5) |
| 장애물 제거 | 100~300 (종류별) |
| 스페셜 조합 발동 | 300~1000 (조합별) |
| 남은 턴 보너스 | 턴당 200 (클리어 시) |

### §7.2 별 계산 (레벨 클리어 시)
```
별 1개: 목표 달성 (기본 클리어)
별 2개: 목표 점수 × 1.5 이상
별 3개: 목표 점수 × 2.5 이상
```

### §7.3 콤보 연출
| 콤보 수 | 텍스트 | 색상 | 연출 |
|---------|--------|------|------|
| 2 | "Good!" | #3498DB | 텍스트 팝업 |
| 3 | "Great!" | #2ECC71 | 텍스트 + 화면 흔들림 |
| 5 | "Awesome!" | #F1C40F | 텍스트 + 화면 흔들림 + 파티클 폭발 |
| 7+ | "INCREDIBLE!" | #E74C3C | 텍스트 + 대형 파티클 + 화면 플래시 |

---

## §8. 에셋 요구 사항 (Asset Requirements)

```yaml
# asset-requirements
art-style: "glossy casual fantasy — 밝고 따뜻한 판타지 동화 스타일, Royal Match급 글로시 3D 느낌의 2D 보석"
color-palette: "#FFF8E7, #87CEEB, #DAA520, #E74C3C, #3498DB, #2ECC71, #F1C40F, #9B59B6, #ECF0F1"
mood: "따뜻하고 화려한 동화 속 왕국, 밝은 모험, 프리미엄 캐주얼"
reference: "Royal Match (Dream Games) 비주얼 품질 + Homescapes (Playrix) 건설 분위기"

assets:
  # ═══ 보석 (6색 + 스페셜 3종) ═══
  - id: gem-ruby
    desc: "루비 보석 — 빨간색, 라운드 브릴리언트 컷, 내부 빛 산란, 글로시 상단 하이라이트, 하단 그림자. 따뜻한 빨강 그라디언트(#E74C3C→#C0392B), 흰색 반사점 2개"
    size: "512x512"

  - id: gem-sapphire
    desc: "사파이어 보석 — 파란색, 쿠션 컷, 내부 빛 산란, 글로시 반사. 파랑 그라디언트(#3498DB→#2980B9), 흰색 하이라이트"
    size: "512x512"

  - id: gem-emerald
    desc: "에메랄드 보석 — 초록색, 에메랄드 컷(직사각), 내부 빛 산란. 초록 그라디언트(#2ECC71→#27AE60)"
    size: "512x512"

  - id: gem-topaz
    desc: "토파즈 보석 — 노란색, 페어 컷(물방울), 내부 금빛 산란. 노랑 그라디언트(#F1C40F→#F39C12)"
    size: "512x512"

  - id: gem-amethyst
    desc: "아메시스트 보석 — 보라색, 오벌 컷, 내부 보랏빛 산란. 보라 그라디언트(#9B59B6→#8E44AD)"
    size: "512x512"

  - id: gem-diamond
    desc: "다이아몬드 보석 — 하얀/무지개빛, 프린세스 컷, 무지개 프리즘 반사. 흰색(#ECF0F1) 기반에 무지개 하이라이트"
    size: "512x512"

  - id: gem-special-line-h
    desc: "가로 줄 파괴 보석 — 보석 중앙에 수평 화살표 빛줄기. 밝은 금색 글로우, 양쪽 끝 화살표"
    size: "512x512"

  - id: gem-special-line-v
    desc: "세로 줄 파괴 보석 — 보석 중앙에 수직 화살표 빛줄기. 밝은 금색 글로우, 위아래 화살표"
    size: "512x512"

  - id: gem-special-bomb
    desc: "3×3 폭탄 보석 — 보석 중앙에 빛나는 폭탄 심볼, 주변 충격파 링, 금색+주황 글로우"
    size: "512x512"

  - id: gem-special-rainbow
    desc: "무지개 보석 — 6색 그라디언트가 회전하는 구체, 무지개 파티클, 별 반짝임, 가장 화려한 보석"
    size: "512x512"

  # ═══ 보석 애니메이션 시트 ═══
  - id: gem-ruby-idle-sheet
    desc: "루비 보석 대기 애니메이션 — 4프레임, 미세한 빛 반사 이동 + 글로우 펄스"
    size: "512x128"
    frames: 4
    ref: "gem-ruby"

  - id: gem-sapphire-idle-sheet
    desc: "사파이어 보석 대기 애니메이션 — 4프레임, 빛 반사 회전"
    size: "512x128"
    frames: 4
    ref: "gem-sapphire"

  - id: gem-emerald-idle-sheet
    desc: "에메랄드 보석 대기 애니메이션 — 4프레임, 내부 빛 흔들림"
    size: "512x128"
    frames: 4
    ref: "gem-emerald"

  - id: gem-topaz-idle-sheet
    desc: "토파즈 보석 대기 애니메이션 — 4프레임, 금빛 펄스"
    size: "512x128"
    frames: 4
    ref: "gem-topaz"

  - id: gem-amethyst-idle-sheet
    desc: "아메시스트 보석 대기 애니메이션 — 4프레임, 보랏빛 흔들림"
    size: "512x128"
    frames: 4
    ref: "gem-amethyst"

  - id: gem-diamond-idle-sheet
    desc: "다이아몬드 보석 대기 애니메이션 — 4프레임, 무지개 프리즘 회전"
    size: "512x128"
    frames: 4
    ref: "gem-diamond"

  # ═══ 장애물 ═══
  - id: obstacle-ice-1
    desc: "얼음 장애물 1겹 — 반투명 얇은 서리, 보석 위에 오버레이"
    size: "512x512"

  - id: obstacle-ice-2
    desc: "얼음 장애물 2겹 — 중간 두께 얼음, 불투명도 증가, 균열 패턴"
    size: "512x512"
    ref: "obstacle-ice-1"

  - id: obstacle-ice-3
    desc: "얼음 장애물 3겹 — 두꺼운 얼음, 거의 불투명, 눈 결정 패턴"
    size: "512x512"
    ref: "obstacle-ice-1"

  - id: obstacle-chain
    desc: "체인 장애물 — 금속 사슬이 보석을 감싸는 형태, 메탈릭 광택"
    size: "512x512"

  - id: obstacle-crate
    desc: "나무 상자 — 나무결 텍스처, 못 박힌 판자, 따뜻한 갈색"
    size: "512x512"

  - id: obstacle-poison
    desc: "독 — 보라색 연기/슬라임이 칸을 덮은 형태, 기포 올라옴"
    size: "512x512"

  - id: obstacle-stone
    desc: "돌 블록 — 회색 바위, 이끼 조금, 금이 간 텍스처, 무거운 느낌"
    size: "512x512"

  - id: obstacle-curtain
    desc: "커튼 — 붉은 벨벳 커튼이 칸을 가림, 금색 술 장식, 양쪽으로 열리는 느낌"
    size: "512x512"

  - id: obstacle-jelly
    desc: "젤리 — 반투명 연보라 젤리가 보석 위를 덮음, 말랑말랑한 질감"
    size: "512x512"

  - id: obstacle-pie
    desc: "Pie 블로커 — 6조각 원형 파이, 각 조각이 개별적으로 금색/갈색, 격자무늬 크러스트"
    size: "512x512"

  # ═══ 배경 ═══
  - id: bg-zone1-gateplaza
    desc: "성문 광장 배경 — 웅장한 석조 성문, 깃발 펄럭임, 따뜻한 오후 햇살, 돌 바닥 광장"
    size: "1920x1080"

  - id: bg-zone2-garden
    desc: "왕실 정원 배경 — 꽃이 만발한 정원, 분수대, 나비, 초록 잔디, 화사한 봄 분위기"
    size: "1920x1080"

  - id: bg-zone3-market
    desc: "번화가 시장 배경 — 가판대, 천막, 색색 깃발, 활기찬 분위기, 따뜻한 노을빛"
    size: "1920x1080"

  - id: bg-zone4-library
    desc: "대도서관 배경 — 높은 책장, 마법 구체, 스테인드글라스 창, 고요한 분위기"
    size: "1920x1080"

  - id: bg-zone5-throne
    desc: "왕좌실 배경 — 황금 왕좌, 붉은 카펫, 크리스탈 샹들리에, 호화로운 분위기"
    size: "1920x1080"

  - id: bg-kingdom-map
    desc: "왕국 전경 맵 — 조감도 시점, 5구역이 한눈에 보이는 판타지 왕국, 성+정원+시장+도서관+왕좌실, 길로 연결, 안개로 미해금 구역 표시"
    size: "1920x1080"

  # ═══ 왕국 건물 ═══
  - id: building-gate
    desc: "성문 — 웅장한 석조 아치형 성문, 철 격자문, 양쪽 횃불, 깃발"
    size: "512x512"

  - id: building-guardhouse
    desc: "경비초소 — 작은 석조 탑, 초소 지붕에 깃발, 창문에 불빛"
    size: "512x512"

  - id: building-fountain
    desc: "환영 분수대 — 물이 솟는 3단 분수, 금색 장식, 주변 꽃"
    size: "512x512"

  - id: building-garden-arch
    desc: "정원 아치 — 장미 넝쿨이 감싼 흰색 아치, 요정 조명"
    size: "512x512"

  - id: building-flower-bed
    desc: "꽃밭 — 알록달록 꽃이 심긴 원형 화단, 나비"
    size: "512x512"

  - id: building-market-stall
    desc: "시장 가판대 — 과일/보석이 진열된 가판대, 줄무늬 천막"
    size: "512x512"

  - id: building-bookshelf-tower
    desc: "책탑 — 책이 탑처럼 쌓인 마법 서가, 빛나는 룬 문자"
    size: "512x512"

  - id: building-throne
    desc: "왕좌 — 금색+보라 벨벳 왕좌, 보석 장식, 왕관 걸이"
    size: "512x512"

  # ═══ 이펙트 ═══
  - id: effect-match-explosion
    desc: "매칭 폭발 이펙트 시퀀스 — 4프레임, 보석 색상 파편 + 빛 파티클이 퍼져나감"
    size: "512x128"
    frames: 4

  - id: effect-line-laser
    desc: "줄 파괴 레이저 이펙트 — 금색 레이저 빔이 가로/세로로 관통, 빛 산란"
    size: "1024x128"

  - id: effect-bomb-shockwave
    desc: "폭탄 충격파 이펙트 시퀀스 — 4프레임, 원형 충격파가 퍼져나감, 주황→노랑 글로우"
    size: "512x128"
    frames: 4

  - id: effect-rainbow-burst
    desc: "무지개 폭발 이펙트 — 6색 무지개 파티클이 전 방향 확산, 별 반짝임"
    size: "512x512"

  - id: effect-cascade-combo
    desc: "콤보 텍스트 팝업 — 'Good!', 'Great!', 'Awesome!' 등 글자 + 별 파티클"
    size: "512x256"

  - id: effect-build-complete
    desc: "건설 완료 이펙트 시퀀스 — 6프레임, 반짝이는 별 비+금색 가루+광선 방사"
    size: "768x128"
    frames: 6

  - id: effect-zone-unlock
    desc: "구역 해금 이펙트 — 안개가 걷히며 금색 테두리 빛남, 6프레임 시퀀스"
    size: "768x128"
    frames: 6

  - id: particle-sparkle
    desc: "반짝임 파티클 텍스처 — 작은 별 모양 빛 점, 알파 그라데이션, 흰색~금색"
    size: "64x64"

  - id: particle-gem-shard
    desc: "보석 파편 파티클 — 작은 삼각 보석 조각, 반투명, 다색상용 흰색 기본"
    size: "64x64"

  # ═══ UI ═══
  - id: ui-star-empty
    desc: "빈 별 아이콘 — 회색 윤곽선 별, 얇은 선"
    size: "128x128"

  - id: ui-star-filled
    desc: "채워진 별 아이콘 — 금색 별, 글로시 반사, 작은 반짝임"
    size: "128x128"

  - id: ui-turn-counter
    desc: "턴 카운터 프레임 — 원형 금색 프레임, 숫자가 들어갈 중앙 공간, 왕국 문양"
    size: "256x256"

  - id: ui-goal-panel
    desc: "레벨 목표 패널 — 상단 배너 형태, 금색 프레임, 목표 아이콘 3칸 공간"
    size: "512x128"

  - id: ui-booster-hammer
    desc: "망치 부스터 아이콘 — 금색 망치, 빛나는 효과, 원형 프레임"
    size: "128x128"

  - id: ui-booster-shuffle
    desc: "셔플 부스터 아이콘 — 회전 화살표, 보석 실루엣, 원형 프레임"
    size: "128x128"

  - id: ui-booster-extra-turn
    desc: "추가 턴 아이콘 — +5 숫자 + 모래시계, 초록색 글로우, 원형 프레임"
    size: "128x128"

  - id: ui-booster-color-bomb
    desc: "색상 폭탄 아이콘 — 무지개 구체, 별 파티클, 원형 프레임"
    size: "128x128"

  - id: ui-button-play
    desc: "플레이 버튼 — 초록색 둥근 사각형, 흰색 삼각형 재생 아이콘, 그림자"
    size: "256x128"

  - id: ui-button-retry
    desc: "재시도 버튼 — 파란색 둥근 사각형, 흰색 회전 화살표, 그림자"
    size: "256x128"

  - id: ui-build-card
    desc: "건설 선택 카드 — 금색 프레임의 카드 형태, 건물 이미지+이름+보너스 설명 공간"
    size: "256x384"

  - id: ui-daily-badge
    desc: "일일 챌린지 배지 — 달력 아이콘 + 별, 금색 테두리, 오늘 날짜 표시 공간"
    size: "128x128"

  - id: ui-weekly-trophy
    desc: "주간 경쟁 트로피 — 금색 트로피 + 월계관, 1~3등 표시용"
    size: "128x128"

  - id: ui-progress-bar
    desc: "구역 건설 진행바 — 금색 프레임 바, 초록색 채움, 별 마커"
    size: "512x64"

  # ═══ 캐릭터 ═══
  - id: char-king
    desc: "왕 캐릭터 — 친근한 표정의 카툰 왕, 금관+보라 망토+흰 수염, 상반신 포즈"
    size: "512x512"

  - id: char-king-happy
    desc: "왕 기쁨 표정 — 활짝 웃는 왕, 양손 들어올림 포즈"
    size: "512x512"
    ref: "char-king"

  - id: char-king-sad
    desc: "왕 슬픈 표정 — 실망한 왕, 고개 숙임 포즈"
    size: "512x512"
    ref: "char-king"

  # ═══ 썸네일 ═══
  - id: thumbnail
    desc: "게임 대표 이미지 — 중앙에 반짝이는 6색 보석 배열, 뒤로 판타지 왕국 실루엣, 상단에 왕관, 하단에 '보석 왕국 건설기' 제목 텍스트(금색 로열 서체), 밝고 화려한 분위기"
    size: "800x600"
```

**에셋 총 합계: 55개**

---

## §9. 사운드 디자인 (Web Audio 절차적 합성)

### §9.1 BGM
- **왕국 맵 BGM**: 밝고 웅장한 판타지 오케스트라 느낌. C 메이저, BPM 90, 하프+플루트 느낌의 사인파 합성
- **레벨 플레이 BGM**: 경쾌하고 긴장감 있는 퍼즐 분위기. G 메이저, BPM 120, 피아노+스트링 느낌
- **건설 BGM**: 따뜻하고 편안한 분위기. F 메이저, BPM 80, 기타+벨 느낌

### §9.2 SFX (10종+)
| SFX | 설명 | Web Audio 구현 |
|-----|------|---------------|
| match-3 | 3매치 기본 매칭 | 상승 음계 3음 (도미솔) |
| match-4 | 4매치 | 상승 음계 4음 + 글리산도 |
| match-5 | 5매치 | 상승 음계 5음 + 하모닉스 |
| cascade | 캐스케이드 콤보 | 콤보 수에 따라 피치 상승 |
| special-create | 스페셜 보석 생성 | 벨 음 + 리버브 |
| special-activate | 스페셜 발동 | 폭발음 + 저음 우르릉 |
| swap | 보석 스왑 | 짧은 "틱" 사운드 |
| swap-fail | 스왑 실패 (매치 없음) | 낮은 "뚝" 사운드 |
| build-place | 건물 배치 | 벽돌 쌓는 음 + 차임벨 |
| build-complete | 구역 완성 | 팡파레 + 트럼펫 느낌 |
| level-clear | 레벨 클리어 | 짧은 승리 팡파레 |
| level-fail | 레벨 실패 | 하강 음계 + 약한 공허음 |
| button-click | UI 버튼 클릭 | 짧은 "팝" 사운드 |

---

## §10. 일일 챌린지 시스템

### §10.1 SeededRNG 기반 (V10 계승)
```javascript
// 날짜 시드로 매일 동일한 레벨 생성
const dailySeed = getDaySeed(); // YYYYMMDD → 정수
const dailyRNG = new SeededRNG(dailySeed);

// 특수 규칙 8종 중 1종 랜덤 선택
const DAILY_RULES = [
  'NO_SPECIAL',    // 스페셜 보석 생성 불가 — 순수 매칭만
  'BOMB_ONLY',     // 폭탄 보석만 생성
  'SPEED_RUN',     // 턴 제한 대신 시간 제한 60초
  'COLOR_LIMIT',   // 4색만 등장
  'OBSTACLE_HELL', // 장애물 2배
  'MEGA_CASCADE',  // 캐스케이드 점수 3배
  'REVERSE_GOAL',  // 특정 색상 매칭 금지 (다른 색만)
  'GIANT_BOARD'    // 고정 보드 패턴 (시드 기반)
];
```

### §10.2 보상
- 일일 챌린지 클리어: 별 2개 + 건설 자재 보너스
- 7일 연속 클리어: 특별 장식 (한정판)

---

## §11. 주간 건설 경쟁

### §11.1 AI 경쟁자 3명
```javascript
const WEEKLY_AI = [
  { name: '건축왕 루시', speed: 0.8, avatar: 'ai-1' },  // 느리지만 착실
  { name: '보석장인 카이', speed: 1.0, avatar: 'ai-2' }, // 평균
  { name: '왕실기사 레나', speed: 1.2, avatar: 'ai-3' }  // 빠르지만 실수 많음
];
```

- 주간 동안 AI와 건설 진행도(별 수집량) 경쟁
- AI 진행도는 시간 기반 시뮬레이션 (하루 2~5별 랜덤 증가)
- 주간 종료 시 순위 발표: 1위 한정 장식, 2위 부스터 2개, 3위 부스터 1개

---

## §12. 코더 체크리스트 (자가 검증)

### §12.1 빌드 전 정적 검증
| # | 검증 항목 | 확인 방법 | 통과 기준 |
|---|----------|-----------|----------|
| 1 | `function f()` 선언 오버라이드 0건 | 코드 내 function 키워드 + 기존 함수명 검색 | 0건 |
| 2 | TRANSITION_TABLE 12상태 완전 | 모든 STATE 값이 테이블에 존재 | 12/12 |
| 3 | deferredQueue 사용 | enterState() 내 직접 전환 0건 | console.error 0건 |
| 4 | manifest.json 에셋 수 = drawAssetOrFallback 호출 수 | 교차 검증 | 일치 |
| 5 | `Math.random()` 0건 | SeededRNG만 사용 | 0건 |
| 6 | touchSafe() 적용 | 모든 버튼/인터랙티브 요소 | 48px 이상 |
| 7 | localStorage try-catch | 모든 save/load 호출 | 100% 래핑 |
| 8 | state = STATE.X 직접 할당 0건 | beginTransition()/directTransition()만 사용 | 0건 |

### §12.2 런타임 검증 (10항목)
| # | 시나리오 | 예상 결과 |
|---|----------|-----------|
| 1 | 타이틀 화면 로딩 | 로고 + 시작 버튼 표시 |
| 2 | 왕국 맵 진입 | 5구역 표시, 1구역만 활성 |
| 3 | 레벨 1 시작 | 8×8 보드 + 보석 6색 + 목표 패널 |
| 4 | 첫 3매치 수행 | 보석 제거 + 점수 증가 + 파티클 |
| 5 | 캐스케이드 발생 | 콤보 텍스트 + 연쇄 점수 |
| 6 | 레벨 클리어 | 별 계산 + 클리어 연출 |
| 7 | 건설 선택 화면 | 3택 1 카드 표시 |
| 8 | 건설 완료 | 건물 배치 애니메이션 + 세이브 |
| 9 | 세이브/로드 | 새로고침 후 진행도 유지 |
| 10 | 일일 챌린지 | 날짜 기반 고정 레벨 생성 |

---

## §13. 에셋-코드 교차 검증 체크리스트

| # | 에셋 카테고리 | 에셋 수 | 코드 참조 함수 | 검증 |
|---|-------------|---------|---------------|------|
| 1 | 보석 6색 | 6 | renderGem() | ☐ |
| 2 | 스페셜 보석 4종 | 4 | renderSpecialGem() | ☐ |
| 3 | 보석 idle 시트 6종 | 6 | animateGemIdle() | ☐ |
| 4 | 장애물 10개(얼음3+7종) | 10 | renderObstacle() | ☐ |
| 5 | 배경 6종(5구역+왕국맵) | 6 | renderBackground() | ☐ |
| 6 | 왕국 건물 8종 | 8 | renderBuilding() | ☐ |
| 7 | 이펙트 7종 | 7 | playEffect() | ☐ |
| 8 | 파티클 2종 | 2 | gParticleManager | ☐ |
| 9 | UI 13종 | 13 | renderUI() | ☐ |
| 10 | 캐릭터 3종 | 3 | renderKing() | ☐ |
| 11 | 썸네일 1종 | 1 | (외부 사용) | ☐ |
| **합계** | | **55** | | |

---

## §14. 엣지 케이스 매트릭스 (20개 시나리오)

| # | 시나리오 | 예상 동작 | 관련 가드 |
|---|----------|-----------|----------|
| 1 | 스왑 중 터치 이벤트 | 무시 | isSwapping |
| 2 | 캐스케이드 중 부스터 탭 | 무시 | isCascading |
| 3 | 스페셜+스페셜 동시 스왑 | 스페셜 조합 테이블 참조 | isSpecialActivating |
| 4 | 독 퍼짐으로 보드 가득 참 | 레벨 즉시 실패 | PLAY 상태 체크 |
| 5 | 유효 이동 0개 | 자동 셔플, 3회 실패 시 재생성 | isShuffling |
| 6 | 마지막 턴에 캐스케이드 진행 중 | 캐스케이드 완료 후 목표 체크 | isCascading |
| 7 | 부스터 선택 후 취소 | ESC/빈 공간 탭으로 취소 | isBoosterActive |
| 8 | 건설 선택 중 뒤로가기 | 왕국 맵 복귀, 별 유지 | isBuilding |
| 9 | localStorage 꽉 참 | try-catch로 에러 흡수, 경고 표시 | save/load |
| 10 | 일일 챌린지 자정 넘김 | 다음 날짜 시드로 갱신 | daily.lastDate 체크 |
| 11 | 레벨 클리어 직후 전환 중 탭 | deferredQueue 처리 | isTransitioning |
| 12 | Pie 블로커 6조각 동시 인접 매칭 | 각 조각 개별 처리, 1턴 1조각 | GUARDS 복합 |
| 13 | 무지개+무지개 보드 전체 제거 후 | 새 보석 전체 낙하, 캐스케이드 체크 | cascade loop |
| 14 | DDA 턴 보너스 + 추가 턴 부스터 중첩 | 합산 적용 (최대 턴 40 캡) | CONFIG.MAX_TURNS |
| 15 | 세이브 데이터 버전 불일치 | 기본값 폴백 + 경고 | saveVersion 체크 |
| 16 | 건설 별 부족 시 건설 시도 | 건설 버튼 비활성화 (회색) | star 수 체크 |
| 17 | 에셋 로드 실패 (오프라인) | Canvas 폴백 100% 동작 | drawAssetOrFallback |
| 18 | 화면 리사이즈 중 게임 진행 | offscreen canvas 재캐싱, 레이아웃 재계산 | resize 이벤트 |
| 19 | 동시 2곳 터치 (멀티터치) | 첫 번째 터치만 처리 | touch[0] 고정 |
| 20 | 레벨 30 클리어 후 추가 진행 | 엔딩 연출 → 자유 플레이 모드 (별 수집 계속) | endgame flag |

---

## §15. 게임 페이지 메타데이터

```yaml
game:
  title: "보석 왕국 건설기"
  description: "보석을 매칭하고 별을 모아 무너진 왕국을 재건하세요! Royal Match 스타일의 프리미엄 매치3 + 왕국 건설 메타 게임."
  genre: ["puzzle", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "마우스 드래그: 보석 스왑"
    - "클릭: 부스터 사용, 건설 선택, UI 조작"
    - "터치: 드래그 스왑, 탭 선택"
    - "ESC: 일시정지"
    - "1~4: 부스터 선택"
  tags:
    - "#매치3"
    - "#왕국건설"
    - "#퍼즐"
    - "#판타지"
    - "#캐주얼"
    - "#프리미엄"
    - "#메타게임"
  addedAt: "2026-03-28"
  version: "1.0.0"
  featured: true
```
