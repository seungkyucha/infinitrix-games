---
game-id: ashen-stronghold
title: 잿빛 요새
genre: action, strategy
difficulty: hard
---

# 잿빛 요새 (Ashen Stronghold) — 사이클 #41 게임 기획서

> **1페이지 요약**: 포스트아포칼립스 세계에서 마지막 생존자 '캡틴 애쉬'가 폐허 요새를 재건하며 좀비 무리에 맞서는 **서바이벌 타워디펜스 로그라이트**. 낮에는 폐허를 탐색하여 자원·서바이버를 수집(action), 밤에는 요새를 방어하고 바리케이드·포탑을 배치(strategy). Plants vs Zombies의 배치 전략 + They Are Billions의 서바이벌 긴장감 + Slay the Spire의 로그라이트 선택지 시너지. 5개 구역(폐시가지/산업단지/병원/군부대/지하벙커) × 3야간 = 15 메인 스테이지 + 보스 좀비 3종(MVP) + 히든 스테이지 2개 = **총 20스테이지**. 업그레이드 트리 3갈래(방어/공격/탐색) × 5단계 + SeededRNG 프로시저럴 야간 웨이브 + BFS 경로 검증. **action+strategy 11사이클 최장 미사용 해소 + 좀비 포스트아포칼립스 플랫폼 최초 테마.**

> **MVP 경계**: **Phase 1**(핵심 루프: 주간탐색→야간방어→보상→업그레이드, 구역 1~3 + 보스 3체 + 업그레이드 Lv1~3 + DDA 4단계 + 서바이버 4종 + 기본 내러티브 + 유물 시스템) → **Phase 2**(구역 4~5 + 히든 2스테이지 + 업그레이드 Lv4~5 + 날씨/시간대 연출 + 전체 내러티브 + 다국어 완성). **Phase 1만으로도 완전한 좀비 서바이벌 TD 로그라이트 경험 제공 필수.**

---

## §0. 피드백 매핑 (이전 사이클 교훈)

### 검증 완료 패턴 (platform-wisdom 참조) ✅

| ID | 교훈 요약 | 적용 섹션 |
|----|----------|----------|
| F1 | assets/ 디렉토리 유지 — Gemini API PNG 에셋 + manifest.json 동적 로드 [Cycle 39+] | §4.1, §8 |
| F2 | 외부 CDN/폰트 0건 [Cycle 1] | §4.1 |
| F3 | iframe 환경 confirm/alert 금지 → Canvas 모달 [Cycle 1] | §6.4 |
| F4 | setTimeout 0건 → tween onComplete 전용 [Cycle 1~2] | §5.2 |
| F5 | 가드 플래그로 tween 콜백 1회 실행 보장 [Cycle 3 B1] | §5.2 |
| F6 | TRANSITION_TABLE 단일 정의로 상태 전환 관리 [Cycle 3~39] | §6.1 |
| F7 | 상태×시스템 매트릭스 필수 [Cycle 2 B1] | §6.2 |
| F8 | 판정 먼저, 저장 나중에 [Cycle 2 B4] | §11.1 |
| F9 | 순수 함수 패턴 (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | 수치 정합성 테이블 (기획=코드 1:1) [Cycle 7] | §14.1 |
| F11 | 터치 타겟 최소 48×48px + Math.max 강제 [Cycle 12~39] | §3.3 |
| F12 | TDZ 방지: INIT_EMPTY 패턴 + Engine 생성자 콜백 TDZ 확장 방어 [Cycle 5~39] | §5.1 |
| F13 | TweenManager clearImmediate() API 분리 [Cycle 4 B1] | §5.2 |
| F14 | 단일 값 갱신 경로 통일 [Cycle 5 B2] | §5.2 |
| F15 | 스모크 테스트 게이트 [Cycle 22~39] | §14.3 |
| F16 | hitTest() 단일 함수 통합 [Cycle 27] | §3.3 |
| F17 | bossRewardGiven 플래그 패턴 [Cycle 27] | §7.5 |
| F18 | SeededRNG 완전 사용 (Math.random 0건) [Cycle 19~39] | §5.2, §14.3 |
| F19 | 프로시저럴 SFX + BGM (Web Audio API 생성) [Cycle 19~39] | §12 |
| F20 | 다국어 지원 (ko/en) [Cycle 27~39] | §13 |
| F21 | beginTransition 단일 정의 [Cycle 32~39] | §6.1 |
| F22 | Gemini PNG 에셋 manifest.json 기반 로드 [Cycle 39+] | §4.1, §8 |

### 신규 피드백 (사이클 #39~40 교훈) 🆕

| ID | 교훈 | 적용 섹션 | 해결 방법 |
|----|------|----------|----------|
| F23 | TDZ 크래시: Engine 생성자 내 onResize 콜백이 미완료 engine 참조 [Cycle 39 P0] | §5.1 | `_ready` 플래그 + 모든 콜백 가드 + 파라미터 전달 방식 |
| F24 | fadeAlpha 동기화 불완전 — 트윈 _t 값이 G.fadeAlpha에 미반영 [Cycle 39] | §6.1 | 트윈 onUpdate 콜백에서 직접 동기화 |
| F25 | 모바일 터치 타겟 48px 미달 12사이클째 반복 [Cycle 39] | §3.3 | `Math.max(48, computedSize)` 강제 |
| F26 | 런타임 검증 불가 — P0 차단으로 모든 실질 검증 실패 [Cycle 39] | §14.3 | Engine 초기화 성공을 스모크 테스트 #1으로 |
| F27 | Engine 생성자 콜백 TDZ 변형 패턴 [Cycle 39] | §5.1 | `_ready = true` 생성자 마지막 설정 + 콜백 진입부 체크 |
| F28 | 주야 전환 시스템에서 DAY/NIGHT 상호 배타적 시스템 활성화 필수 [Cycle 24,31,36] | §6.2 | ACTIVE_SYSTEMS 매트릭스에 explore/defense 열 분리 |
| F29 | TD 배치 시 BFS 경로 차단 방지 [Cycle 26,36] | §10.2 | 배치 시 즉시 BFS 재계산 → 경로 미존재 시 배치 거부 |
| F30 | 로그라이트 DPS/시너지 캡 [Cycle 26~27,36] | §7.4 | DPS 캡 200%, 시너지 캡 150%, applyRelic() 내 검증 |

### 이전 사이클 "아쉬웠던 점" 직접 반영 ⚠️

| 아쉬운 점 (cycle-39~40) | 해결 섹션 | 해결 방법 | 검증 기준 |
|-------------------------|----------|----------|----------|
| P0 TDZ 미수정으로 게임 완전 불능 (C39) | §5.1 | `_ready` 플래그 + 모든 콜백 가드 | `engine._ready === true` 확인 |
| TDZ 변형 패턴(생성자 내 콜백) (C39) | §5.1 | 콜백에서 engine 직접 참조 0건 | grep `engine\.` in callbacks = 0 |
| 모바일 터치 타겟 30px 미달 (C39) | §3.3 | Math.max(48, cellSize) 강제 | 최소 터치 영역 48×48px |
| fadeAlpha 동기화 불완전 (C39) | §6.1 | 트윈→렌더링 값 onUpdate 동기화 | fadeAlpha === tween._t |
| 런타임 검증 완전 불가 (C39) | §14.3 | 엔진 초기화 스모크 테스트 #1 | TITLE 상태 진입 확인 |
| Phase 2 구현 시 이중 시스템 과대화 우려 (C40) | §1 | 단일 핵심 루프 + 주야 전환 자연 분리 | 상태 5개 이하 유지 |

### 이전 사이클 "다음 사이클 제안" 반영

| 제안 (cycle-39~40 포스트모템) | 반영 여부 | 적용 섹션 |
|------------------------------|----------|----------|
| Engine 생성자 콜백 TDZ 방어 패턴 표준화 | ✅ | §5.1 — `_ready` 플래그 + 콜백 가드 |
| 스모크 테스트에 "엔진 초기화 성공" 검증 추가 | ✅ | §14.3 — 항목 #1 |
| onResize 콜백에서 engine 직접 참조 금지 | ✅ | §5.1 — 파라미터 전달 전용 |
| 업그레이드 축 분리 → 밸런스 직관적 검증 | ✅ | §7.3 — 방어/공격/탐색 3축 분리 |
| 스윙 도달 BFS를 장르 맞춤형으로 변환 | ✅ | §10.2 — 좀비 경로 BFS + 배치 가능 검증 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 핵심 컨셉
"**낮에 폐허를 뒤져 자원과 생존자를 찾고, 밤에는 쌓아올린 바리케이드 뒤에서 좀비 무리를 막아라.**"

플레이어는 포스트아포칼립스 세계의 마지막 지도자 '캡틴 애쉬'가 되어, 낮에는 주변 폐허를 탐색(action)하고 밤에는 요새를 방어(strategy)한다. Plants vs Zombies의 레인 기반 배치 전략에 They Are Billions의 생존 긴장감, Slay the Spire의 로그라이트 선택지를 결합한 action+strategy 하이브리드.

### 핵심 재미 5요소
1. **자원 압박의 긴장감**: 낮이 끝나기 전에 충분히 수집했나? 밤을 버틸 수 있나?
2. **배치 전략의 깊이**: 바리케이드/포탑/서바이버를 어디에 배치할지 매 밤 새로운 전략
3. **서바이버 조합**: 4종 서바이버(전사/사수/기술자/의무관) 조합에 따른 시너지
4. **점진적 요새 성장**: 폐허 → 임시 캠프 → 방어 진지 → 견고한 요새 → 성채로 시각적 진화
5. **로그라이트 리플레이**: 매 런마다 다른 유물, 다른 서바이버 조합, 다른 좀비 패턴

### 차별화 포인트
- 플랫폼 최초 좀비/포스트아포칼립스 테마
- 기존 action+strategy 3작(주사위RPG/판타지TD/군사)과 완전 차별화
- 주간 탐색(액션) + 야간 방어(전략) 자연 분리로 이중 페이즈 시스템 과대화 방지
- Steam TD Fest 2026 트렌드 + 글로벌 좀비 서바이벌 영구 인기 테마

### 스토리/내러티브
바이러스 "회색 역병(Grey Plague)"이 세계를 황폐화시킨 지 100일. 구도시 외곽의 폐 군사기지를 발견한 캡틴 애쉬는 이곳을 마지막 거점으로 삼는다. 구역을 하나씩 탐색하며 생존자를 모으고, 밤마다 몰려드는 좀비 무리를 막아내며, 바이러스의 근원지인 지하 벙커를 향해 전진한다.

- **구역 1 (폐시가지)**: "여기서 시작하자. 식량과 자재가 필요해."
- **구역 2 (산업단지)**: "공장에 발전기가 남아있을지도 몰라."
- **구역 3 (병원)**: "의약품... 그리고 뭔가 더 있다."
- **구역 4 (군부대)**: "무기고가 온전하다면 전세를 뒤집을 수 있어."
- **구역 5 (지하벙커)**: "여기가 시작점이야. 모든 것의 답이 여기에 있다."

---

## §2. 게임 규칙 및 목표

### 주요 목표
- **승리 조건**: 5개 구역을 모두 클리어하고 지하 벙커 보스를 격파
- **패배 조건**: 요새 내핵(Core) HP가 0이 되면 게임 오버
- **구역 클리어**: 각 구역의 3야간 웨이브를 모두 생존 → 구역 보스 격파

### 게임 사이클 (1구역 = 3일)
```
[주간 탐색 60초] → [방어 준비 30초] → [야간 방어 90초] × 3회 → [보스 야간]
```

1. **주간 탐색 (DAY_EXPLORE, 60초)**
   - 맵을 이동하며 자원(scrap/food/ammo) 수집
   - 건물 내부 탐색으로 서바이버 발견
   - 좀비 소수 조우 → 직접 전투 (액션)
   - 시간 종료 시 강제 귀환 (밤이 온다!)

2. **방어 준비 (NIGHT_PREP, 30초)**
   - 수집한 자원으로 방어물 배치 (바리케이드/포탑/트랩)
   - 서바이버 포지션 배정
   - 좀비 접근 경로 미리보기 (레이더)

3. **야간 방어 (NIGHT_WAVE, ~90초)**
   - 좀비 웨이브가 4방향에서 접근
   - 플레이어 직접 사격 + 서바이버 AI 자동 공격
   - 포탑/트랩 자동 발동
   - 웨이브 종료 시 보상 (자원 + 유물 선택지)

4. **보스 야간 (BOSS_NIGHT)**
   - 3야간 후 구역 보스 등장
   - 보스 약점 공략 = 전략적 배치 퍼즐

### 보스 3종 (Phase 1 MVP)

| 보스 | 구역 | HP | 약점 | 공략법 |
|------|------|-----|------|--------|
| **스포어 타이탄** (포자 거인) | 1. 폐시가지 | 300 | 화염 | 화염 포탑 3기를 삼각 배치 → 포자막 소각 → 코어 노출 |
| **아이언 리퍼** (철갑 사신) | 2. 산업단지 | 500 | 전기 | EMP 트랩으로 갑옷 비활성화 → 사수 집중 사격 |
| **패이션트 제로** (0번 환자) | 3. 병원 | 400 | 치유 역전 | 의무관의 치유 장치를 보스에게 조준 → 바이러스 역반응으로 자폭 |

---

## §3. 조작 방법

### §3.1 키보드 (PC)
| 키 | 기능 |
|----|------|
| WASD / 방향키 | 캐릭터 이동 (주간) |
| 마우스 좌클릭 | 사격 / 배치 확정 |
| 마우스 우클릭 | 배치 취소 |
| 1~4 | 서바이버 선택 |
| Q/E | 방어물 종류 전환 |
| Space | 액션 (상호작용/수집) |
| Tab | 레이더/미니맵 토글 |
| Esc | 일시정지 (Canvas 모달) |
| R | 재장전 |

### §3.2 마우스 (PC)
| 입력 | 기능 |
|------|------|
| 좌클릭 | 사격 방향 / 배치 위치 |
| 우클릭 | 배치 취소 / 서바이버 이동 명령 |
| 스크롤 | 방어물 종류 전환 |
| 클릭+드래그 | 준비 페이즈: 방어물 이동 |

### §3.3 터치 (모바일)
```
┌─────────────────────────────────┐
│                                 │
│          [Game Area]            │
│                                 │
│                                 │
│                          [R]    │  ← 재장전 버튼 (48×48+)
│  ┌─┐                   [ATK]   │  ← 공격 버튼 (64×64)
│  │J│                    [ACT]   │  ← 액션 버튼 (48×48+)
│  └─┘                           │
│  joystick              [1][2]   │  ← 서바이버 선택 (48×48+)
│  (120×120)             [3][4]   │
└─────────────────────────────────┘
```
- **가상 조이스틱 (좌측 하단)**: 이동 (120×120 터치 영역)
- **공격 버튼 (우측)**: 가장 가까운 적 방향 자동 조준 사격
- **액션 버튼**: 상호작용/수집
- **서바이버 버튼 (1~4)**: 서바이버 선택 후 탭으로 배치/이동
- **탭 (게임 영역)**: 배치 위치 지정 / 포탑 설치
- **길게 누르기**: 방어물 종류 전환 (원형 메뉴)
- **핀치 줌**: 맵 확대/축소 (준비 페이즈)
- **모든 터치 타겟**: `Math.max(48, computedSize)` 강제 (F11, F25)

### §3.4 소형 디스플레이 (≤400px) 레이아웃
```
┌───────────────────────┐
│      [Game Area]      │
│                       │
│                 [ATK] │
│  [J]            [ACT] │
│                [1][2] │
└───────────────────────┘
```
- 서바이버 버튼 2×2 → 1×4 세로 배열로 변경
- 조이스틱 크기 100×100으로 축소 (터치 영역 유지)

---

## §4. 시각적 스타일 가이드

### §4.1 기술 정책
- **Canvas 해상도**: 풀스크린 + `devicePixelRatio` + 동적 리사이즈
- **에셋 로딩**: Gemini API PNG 에셋 → `manifest.json` 동적 로드 (F1, F22)
- **외부 리소스**: 0건 (CDN/Google Fonts 금지) (F2)
- **모달/다이얼로그**: 100% Canvas 기반 (confirm/alert 금지) (F3)

### §4.2 색상 팔레트
| 용도 | 색상 | HEX |
|------|------|-----|
| 배경 (밤/기본) | 암회색 | `#1a1a2e` |
| 배경 (낮) | 회갈색 | `#4a4238` |
| 요새/UI 프레임 | 강철회색 | `#5c6b73` |
| 좀비 피부 | 부패녹색 | `#4a7c59` |
| 화염/위험 | 경고적색 | `#e74c3c` |
| 자원/보상 | 금속황금 | `#f39c12` |
| 치유/안전 | 의료청록 | `#00b894` |
| UI 텍스트 | 순백 | `#ecf0f1` |
| UI 강조 | 네온주황 | `#e67e22` |

### §4.3 배경 구성
- **원경 (bg-far)**: 황폐화된 도시 스카이라인, 부서진 빌딩 실루엣, 회색 안개
- **중경 (bg-mid)**: 구역별 건물 잔해 — 폐시가지(상점)/산업단지(공장)/병원(의료장비)
- **근경 (bg-ground)**: 균열된 아스팔트, 잡초, 바리케이드 잔해, 타일맵

### §4.4 드로잉 함수 시그니처 표준화 (F9)
모든 드로잉 함수는 순수 함수 패턴을 따른다:
```javascript
// 표준 시그니처: (ctx, x, y, size, ...state)
function drawPlayer(ctx, x, y, size, facing, hp, maxHp, isReloading) {}
function drawZombie(ctx, x, y, size, type, hp, maxHp, animFrame) {}
function drawBarricade(ctx, x, y, w, h, hp, maxHp, material) {}
function drawTurret(ctx, x, y, size, angle, type, cooldownPct) {}
function drawSurvivor(ctx, x, y, size, type, hp, isActive) {}
function drawProjectile(ctx, x, y, size, type, angle) {}
function drawEffect(ctx, x, y, size, type, progress) {}
function drawUI_HP(ctx, x, y, w, h, current, max) {}
function drawUI_Resource(ctx, x, y, iconType, amount) {}
function drawMinimap(ctx, x, y, w, h, entities, fogOfWar) {}
```

---

## §4.5. 아트 디렉션 (Art Direction)

### 아트 스타일 키워드
**"Dark Post-Apocalyptic Pixel Art"** — 어둡고 황폐한 세계를 16~32px 스프라이트급 디테일의 픽셀아트로 표현. 배경은 desaturated 갈색/회색 톤이지만, 좀비의 녹색 발광과 화염/전기 이펙트가 강렬한 대비를 형성. UI는 군사 HUD 스타일.

### 아트 스타일 세부
- **스타일 키워드**: `dark post-apocalyptic pixel art`
- **캐릭터**: 2.5등신 밀리터리 생존자, 각진 실루엣, 무기/장비가 눈에 띄게
- **좀비**: 실루엣으로 종류 구분 가능 (일반=인간형, 헐크=대형, 스피터=길쭉)
- **건물/오브젝트**: 부서진 질감, 녹슨 금속, 균열된 콘크리트
- **이펙트**: 화염(주황~적), 전기(청백), 치유(녹청), 폭발(황적) — 밤 배경 대비 발광
- **UI**: 군사 HUD 그린 모노크롬 느낌의 레이더/미니맵, 볼드 산세리프 텍스트

### 아트 레퍼런스
1. **Dead Cells** — 픽셀아트의 유려한 애니메이션 + 다크 분위기
2. **The Last Stand: Dead Zone** — 좀비 서바이벌 거점 방어의 시각적 톤

---

## §5. 핵심 게임 루프 (프레임 기준 로직)

### §5.1 초기화 및 TDZ 방어 (F12, F23, F27)

```javascript
// INIT_EMPTY 패턴 — 모든 전역 상태를 선언 시점에 초기화
const G = {
  state: 'BOOT', phase: 'NONE', day: 0, night: 0,
  zone: 0, wave: 0, fadeAlpha: 0,
  scrap: 0, food: 0, ammo: 0,
  core: { hp: 100, maxHp: 100 },
  survivors: [], barricades: [], turrets: [], traps: [],
  zombies: [], projectiles: [], effects: [],
  camera: { x: 0, y: 0, zoom: 1 },
  dda: { level: 0, consecutiveClears: 0, consecutiveFails: 0 },
  // ... 나머지 초기 상태
};

// Engine 생성 → 마지막에 _ready = true
class Engine {
  constructor(canvas) {
    this._ready = false;
    // ... 캔버스 설정, 이벤트 바인딩
    // ⚠️ 콜백 등록 시 engine 직접 참조 금지!
    // onResize(w, h)만 파라미터로 전달
    this._ready = true; // 생성자 마지막!
  }
}

// 모든 콜백 진입부 가드
function onResize(w, h) {
  if (!engine?._ready) return; // TDZ 방어
  recalcLayout(w, h); // engine 참조 X, 파라미터만 사용
}
```

### §5.2 메인 루프 (60fps)

```
매 프레임 (requestAnimationFrame):
├─ dt 계산 (이전 프레임과의 시간차, cap 50ms)
├─ 상태별 업데이트 분기 (ACTIVE_SYSTEMS 매트릭스 §6.2 참조)
│  ├─ TITLE: UI 트윈만 업데이트
│  ├─ MAP: 구역 선택 UI 업데이트
│  ├─ DAY_EXPLORE: 물리 + 입력 + 적AI + 수집 + 카메라
│  ├─ NIGHT_PREP: 배치 입력 + BFS 검증 + 타이머
│  ├─ NIGHT_WAVE: 물리 + 적AI + 포탑AI + 투사체 + 충돌 + DDA
│  ├─ BOSS_NIGHT: 물리 + 보스AI + 적AI + 패턴 + 투사체 + 충돌
│  └─ GAMEOVER: 페이드 트윈 + 결과 UI
├─ TweenManager.update(dt)
│  ├─ 가드 플래그: transitioning = true → 콜백 1회 (F5)
│  ├─ clearImmediate() API 분리 (F13)
│  └─ 단일 갱신 경로 검증 (F14)
├─ 렌더링
│  ├─ 배경 레이어 (parallax)
│  ├─ 게임 오브젝트 (z-sort)
│  ├─ 이펙트 레이어
│  ├─ UI 레이어
│  └─ fadeAlpha 오버레이 (트윈 onUpdate 동기화, F24)
└─ SeededRNG만 사용 (Math.random 0건, F18)
```

### §5.3 코드 영역 가이드 (10 REGION)

| REGION | 줄 범위 (예상) | 내용 | 의존 방향 |
|--------|---------------|------|-----------|
| R1 CONFIG | 1~200 | 상수, 밸런스 수치, INIT_EMPTY | 없음 |
| R2 ENGINE | 200~500 | Canvas, 입력, TweenManager, 리사이즈 | R1 |
| R3 AUDIO | 500~700 | Web Audio API, BGM, SFX 8종+ | R1 |
| R4 ENTITIES | 700~1200 | Player, Zombie, Survivor, Turret, Barricade | R1 |
| R5 AI | 1200~1600 | 좀비 AI(BFS 경로), 서바이버 AI, 보스 패턴 | R1, R4 |
| R6 SYSTEMS | 1600~2200 | 충돌, 투사체, DDA, 웨이브 스포너, 배치 검증 | R1~R5 |
| R7 GAMELOOP | 2200~2800 | 상태 머신, TRANSITION_TABLE, update/render | R1~R6 |
| R8 UI | 2800~3200 | HUD, 미니맵, 메뉴, 모달, 업그레이드 화면 | R1, R2 |
| R9 SAVE | 3200~3400 | localStorage 영구 진행, 언락, 통계 | R1 |
| R10 BOOT | 3400~3800 | 에셋 로드, manifest.json, Engine 초기화 | R1~R9 |

---

## §6. 상태 머신

### §6.1 TRANSITION_TABLE (F6, F21)

```javascript
const TRANSITION_TABLE = {
  TITLE:       { MAP: true },
  MAP:         { DAY_EXPLORE: true, TITLE: true },
  DAY_EXPLORE: { NIGHT_PREP: true, GAMEOVER: true },
  NIGHT_PREP:  { NIGHT_WAVE: true },
  NIGHT_WAVE:  { NIGHT_PREP: true, BOSS_NIGHT: true, GAMEOVER: true },
  BOSS_NIGHT:  { MAP: true, GAMEOVER: true },
  GAMEOVER:    { TITLE: true },
};

// 모든 전환은 beginTransition()을 경유 (F21)
function beginTransition(from, to, duration = 500) {
  if (!TRANSITION_TABLE[from]?.[to]) {
    console.error(`Invalid transition: ${from} → ${to}`);
    return; // 테이블에 없는 전환은 무시
  }
  if (G._transitioning) return; // 가드 플래그 (F5)
  G._transitioning = true;
  tw.add({ target: G, prop: 'fadeAlpha', from: 0, to: 1, duration,
    onUpdate: () => { /* F24: fadeAlpha 동기화 */ },
    onComplete: () => {
      G.state = to;
      enterState(to);
      tw.add({ target: G, prop: 'fadeAlpha', from: 1, to: 0, duration,
        onComplete: () => { G._transitioning = false; }
      });
    }
  });
}
```

**상태 전환 우선순위** (F5, [Cycle 3 B2]):
- GAMEOVER 전환은 다른 모든 전환보다 우선
- `if (G.core.hp <= 0) return;` 사전 체크를 모든 전환 함수 진입부에 배치

### §6.2 상태 × 시스템 ACTIVE_SYSTEMS 매트릭스 (F7, F28)

| 상태 | Physics | Input | Explore | Defense | AI_Zombie | AI_Surv | AI_Boss | Turret | Projectile | Collision | DDA | Tween | Audio | Render |
|------|---------|-------|---------|---------|-----------|---------|---------|--------|------------|-----------|-----|-------|-------|--------|
| TITLE | — | menu | — | — | — | — | — | — | — | — | — | ✅ | bgm_title | ✅ |
| MAP | — | map | — | — | — | — | — | — | — | — | — | ✅ | bgm_title | ✅ |
| DAY_EXPLORE | ✅ | game | ✅ | — | patrol | — | — | — | ✅ | ✅ | — | ✅ | bgm_day | ✅ |
| NIGHT_PREP | — | place | — | ✅ | — | — | — | — | — | — | — | ✅ | bgm_prep | ✅ |
| NIGHT_WAVE | ✅ | game | — | ✅ | wave | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | bgm_night | ✅ |
| BOSS_NIGHT | ✅ | game | — | ✅ | boss | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | bgm_boss | ✅ |
| GAMEOVER | — | modal | — | — | — | — | — | — | — | — | — | ✅ | sfx_over | ✅ |

**Input 모드 세분화** (F28, [Cycle 26]):
- `menu`: 메뉴 버튼 클릭만
- `map`: 구역 선택 + 업그레이드 화면 진입
- `game`: WASD 이동 + 마우스 사격 + Space 상호작용 + 숫자키
- `place`: 그리드 탭 배치 + Q/E 전환 + 우클릭 취소 (이동 비활성)
- `modal`: 확인/취소 버튼만

**Explore/Defense 상호 배타성** (F28):
- DAY_EXPLORE에서 Defense 시스템 비활성 (바리케이드 배치 불가)
- NIGHT_WAVE에서 Explore 시스템 비활성 (자원 수집 불가)

### §6.3 RESTART_ALLOWED 화이트리스트
```javascript
const RESTART_ALLOWED = { GAMEOVER: true };
// restartGame()은 반드시 RESTART_ALLOWED[G.state] 체크 후 실행
```

### §6.4 Canvas 모달 시스템 (F3)
- 일시정지, 게임오버, 업그레이드 선택 등 모든 다이얼로그는 Canvas 렌더링
- `confirm()`/`alert()` 사용 전면 금지
- 모달 상태에서도 Tween 시스템은 업데이트 (투명도 애니메이션)

---

## §7. 핵심 시스템 상세

### §7.1 주간 탐색 시스템 (DAY_EXPLORE)

**맵 구조**: 각 구역은 12×8 그리드 기반, 건물(탐색 가능)/잔해(파괴 가능)/도로(이동)
- 건물 진입 시 자원 랜덤 획득 (SeededRNG)
- 좀비 소수 패트롤 (3~5마리) — 직접 전투로 처치
- 서바이버 NPC 발견 확률: 구역당 1~2명 (SeededRNG)
- **시간 제한 60초**: 카운트다운 UI, 10초 남으면 경고 효과음 + 화면 붉은 테두리

**자원 3종**:
| 자원 | 아이콘 | 용도 |
|------|--------|------|
| 고철 (Scrap) | 🔩 | 바리케이드/포탑 건설 |
| 식량 (Food) | 🍖 | 서바이버 유지, 체력 회복 |
| 탄약 (Ammo) | 🔫 | 플레이어 사격, 포탑 재장전 |

### §7.2 야간 방어 시스템 (NIGHT_WAVE)

**레인 기반 배치**: 요새 주변 4방향 × 3레인 = 12개 방어 슬롯
```
          [N1][N2][N3]
[W1]                    [E1]
[W2]    [  CORE  ]      [E2]
[W3]                    [E3]
          [S1][S2][S3]
```

**방어물 종류**:
| 종류 | 비용(고철) | HP | 효과 |
|------|-----------|-----|------|
| 바리케이드 | 10 | 50 | 좀비 이동 속도 50% 감소 |
| 기관총 포탑 | 30 | 30 | DPS 15, 사거리 3칸 |
| 화염 포탑 | 40 | 25 | DPS 20(범위), 사거리 2칸 |
| EMP 트랩 | 25 | 1회용 | 범위 내 좀비 3초 기절 |
| 지뢰 | 15 | 1회용 | 접촉 시 50 데미지 (범위) |

**배치 시 BFS 검증** (F29, [Cycle 26,36]):
```javascript
// 배치 시도 → 즉시 BFS 재계산 → 경로 미존재 시 배치 거부
function tryPlace(gridX, gridY, defenseType) {
  const tempGrid = cloneGrid(G.grid);
  tempGrid[gridY][gridX] = BLOCKED;
  for (const spawnDir of ['N','S','E','W']) {
    if (!bfsPathExists(tempGrid, getSpawn(spawnDir), CORE_POS)) {
      showWarning('경로가 차단됩니다!');
      return false;
    }
  }
  // 배치 실행
  placeDefense(gridX, gridY, defenseType);
  return true;
}
```

### §7.3 업그레이드 트리 3갈래 × 5단계

**축 분리 원칙** ([Cycle 35,40]): 3갈래가 각각 다른 축(내구/데미지/정보)을 강화

| 레벨 | 🛡️ 방어 (내구) | ⚔️ 공격 (데미지) | 🔍 탐색 (정보) |
|------|---------------|-----------------|---------------|
| Lv1 | 바리케이드 HP +20% | 사격 데미지 +15% | 탐색 시간 +10초 |
| Lv2 | 코어 HP +25 | 포탑 사거리 +1 | 레이더 범위 확대 |
| Lv3 | 수리 가능 (낮에 바리케이드 복구) | 관통탄 해금 | 서바이버 발견 확률 +20% |
| Lv4 | 2차 바리케이드 해금 | 화염/EMP 포탑 해금 | 보스 약점 힌트 표시 |
| Lv5 | 코어 자동 회복 2/초 | 크리티컬 20% 확률 | 히든 스테이지 접근 |

**업그레이드 화폐**: 별(★) — 야간 웨이브 클리어 시 1~3★ 획득
- **총 획득 가능**: Phase 1 기준 약 30★ (15웨이브 + 보스 보너스)
- **전체 해금 비용**: 75★ (5단계 × 5코스트 × 3갈래)
- **희소 화폐 → 빌드 선택 강제 → 리플레이 가치** ([Cycle 39])

### §7.4 유물 시스템 (로그라이트)

야간 웨이브 클리어 시 3개 유물 중 1개 선택:

| 등급 | 확률 | 효과 범위 | 예시 |
|------|------|----------|------|
| 일반 (회색) | 50% | +5~10% | "녹슨 탄피": 사격 속도 +5% |
| 희귀 (파랑) | 35% | +15~25% | "군용 야시경": 야간 시야 +20% |
| 에픽 (보라) | 15% | +30~50% | "실험체 혈청": 모든 서바이버 공격력 +30% |

**DPS/시너지 캡** (F30, [Cycle 26~27]):
- DPS 캡: 기본값 대비 200% 상한
- 시너지 캡: 150% 상한
- 캡 초과 유물은 선택지에서 자동 제외
```javascript
function generateRelicChoices(currentStats) {
  const pool = RELICS.filter(r => {
    const projected = simulateApply(currentStats, r);
    return projected.dps <= BASE_DPS * 2.0 &&      // DPS 캡
           projected.synergy <= BASE_SYNERGY * 1.5;  // 시너지 캡
  });
  return pickN(pool, 3, G.rng); // SeededRNG
}
```

### §7.5 보스전 상세

**보스 보상 1회 지급 보장** (F17):
```javascript
let bossRewardGiven = false;
function onBossDefeated(boss) {
  if (bossRewardGiven) return;
  bossRewardGiven = true;
  giveReward(boss.reward);
}
```

**보스 1: 스포어 타이탄 (구역 1)**
```
Phase 1 (HP 300→200): 포자 구름 방출 → 시야 제한 + 좀비 소환 5마리
  ↓ HP 200 도달
Phase 2 (HP 200→100): 포자 방패 활성화 (화염 이외 데미지 50% 감소)
  ↓ 화염 포탑 3기 삼각 배치 시 방패 해제
Phase 3 (HP 100→0): 분노 모드 — 이동 속도 2배, 직접 코어 공격
```

**보스 2: 아이언 리퍼 (구역 2)**
```
Phase 1 (HP 500→300): 돌진 공격 (레인 1개 완전 파괴) + 바리케이드 무시
  ↓ HP 300 도달
Phase 2 (HP 300→150): 철갑 활성화 (모든 데미지 -70%)
  ↓ EMP 트랩 3회 적중 시 갑옷 비활성화 15초
Phase 3 (HP 150→0): 갑옷 해제 상태 — 사수 집중 사격 취약
```

**보스 3: 패이션트 제로 (구역 3)**
```
Phase 1 (HP 400→200): 바이러스 오라 — 범위 내 서바이버 초당 5 데미지
  ↓ HP 200 도달
Phase 2 (HP 200→100): 자가 치유 (초당 10 HP 회복)
  ↓ 의무관의 치유 장치를 보스에게 조준 → 바이러스 역반응 (치유=데미지)
Phase 3 (HP 100→0): 폭주 — 치유 역반응 지속 시 자폭, 미사용 시 분열 소환
```

---

## §8. 에셋 요구 사항 (Asset Requirements)

```yaml
# asset-requirements
art-style: "dark post-apocalyptic pixel art"
color-palette: "#1a1a2e, #4a4238, #5c6b73, #4a7c59, #e74c3c, #f39c12, #00b894"
mood: "긴장감 있는 생존, 황폐한 세계, 희망의 불꽃"
reference: "Dead Cells 픽셀아트 분위기 + The Last Stand: Dead Zone 좀비 서바이벌 톤"

assets:
  - id: player
    desc: "캡틴 애쉬 — 밀리터리 재킷+방탄조끼, 고글을 이마에 올린 채, 소총을 든 2.5등신 캐릭터. 정면/측면/후면 3방향 포즈. 어깨에 무전기 안테나. 다크 브라운~카키 색상 기반."
    size: "512x512"

  - id: player-shoot
    desc: "캡틴 애쉬 사격 포즈 — 소총을 겨누고 총구 섬광이 보이는 상태. 측면 기준 사격 자세."
    size: "512x512"

  - id: survivor-warrior
    desc: "전사 서바이버 — 임시로 만든 갑옷(자동차 문짝+사슬), 근접 무기(배관 파이프), 거친 표정. 빨간 머리띠."
    size: "512x512"

  - id: survivor-gunner
    desc: "사수 서바이버 — 카우보이 모자+선글라스, 쌍권총 포즈, 탄약 벨트를 어깨에 두른 모습."
    size: "512x512"

  - id: survivor-engineer
    desc: "기술자 서바이버 — 용접 마스크를 올린 상태, 공구 벨트, 한 손에 렌치+한 손에 설계도. 주황색 작업복."
    size: "512x512"

  - id: survivor-medic
    desc: "의무관 서바이버 — 더러운 의사 가운+적십자 완장, 의료 가방을 메고 주사기를 든 모습. 청록색 마스크."
    size: "512x512"

  - id: zombie-basic
    desc: "일반 좀비 — 찢어진 시민복, 한쪽 팔이 늘어진 채 비틀거리는 포즈. 부패한 녹색 피부, 붉은 눈."
    size: "512x512"

  - id: zombie-hulk
    desc: "헐크 좀비 — 일반의 2배 크기, 불룩한 근육에 뼈가 돌출, 양팔을 치켜든 돌진 포즈. 짙은 보라+녹색."
    size: "512x512"

  - id: zombie-spitter
    desc: "스피터 좀비 — 길쭉하고 마른 체형, 부풀어 오른 목에서 녹색 산성액이 흘러내리는 모습. 입을 크게 벌림."
    size: "512x512"

  - id: boss-spore-titan
    desc: "스포어 타이탄 — 3m 거인 좀비, 등에서 거대한 포자 버섯이 자라난 모습. 포자 구름이 몸을 감싸고, 한쪽 눈이 버섯으로 덮임. 갈색+녹색+보라 포자 색상. 위압적인 전면 포즈."
    size: "600x400"

  - id: boss-iron-reaper
    desc: "아이언 리퍼 — 산업용 로봇 잔해를 갑옷처럼 두른 좀비. 한쪽 팔이 기계 톱, 가슴에 빨간 동력 코어가 빛남. 강철회색+적색 발광. 돌진 직전 포즈."
    size: "600x400"

  - id: boss-patient-zero
    desc: "패이션트 제로 — 병원 가운을 걸친 창백한 인간형, 몸에서 보라색 바이러스 오라가 피어오름. 눈에서 녹색 빛, 정맥이 검게 부풀어 보임. 양팔을 벌린 의식적 포즈."
    size: "600x400"

  - id: bg-far
    desc: "원경 — 황폐화된 도시 스카이라인. 부서진 빌딩들의 실루엣, 회색~주황 안개 속 석양/달빛. 연기 기둥 2~3개. 하늘은 탁한 회적색(낮)/짙은 남색(밤)."
    size: "1920x1080"

  - id: bg-mid
    desc: "중경 — 폐시가지 잔해. 무너진 상점 간판, 뒤집힌 자동차, 부서진 가로등. 잡초가 콘크리트 틈에서 자란 모습. 갈색~회색 톤."
    size: "1920x1080"

  - id: bg-ground
    desc: "근경/지면 — 균열된 아스팔트 타일맵. 핏자국, 탄흔, 잡초 패치. 요새 주변은 즉석 바리케이드(드럼통+철조망)로 둘러싸인 모습."
    size: "1920x1080"

  - id: defense-barricade
    desc: "바리케이드 — 드럼통+모래주머니+철조망 조합. HP에 따라 온전→균열→파손 3단계 시각적 변화. 금속회색+갈색."
    size: "256x256"

  - id: defense-turret
    desc: "기관총 포탑 — 삼각대 위 기관총, 탄약 박스 연결. 회전 가능한 총신. 올리브그린+강철색."
    size: "256x256"

  - id: item-scrap
    desc: "고철 아이템 — 톱니바퀴+볼트+금속 조각이 뭉쳐진 모습. 금속 광택의 은회색."
    size: "128x128"

  - id: item-ammo
    desc: "탄약 아이템 — 탄약 상자에서 총알이 튀어나온 모습. 황동색 총알+올리브 상자."
    size: "128x128"

  - id: effect-explosion
    desc: "폭발 이펙트 — 주황→빨강→검정 연기 확산. 파편 조각이 튀는 모습. 4프레임 시퀀스."
    size: "512x512"

  - id: effect-heal
    desc: "치유 이펙트 — 청록색 십자가 모양 빛이 위로 퍼지며 사라지는 모습. 반짝이는 파티클."
    size: "256x256"

  - id: thumbnail
    desc: "게임 대표 이미지 — 캡틴 애쉬가 요새 바리케이드 위에서 좀비 무리를 향해 소총을 겨누는 장면. 배경에 불타는 도시 스카이라인. 상단에 '잿빛 요새' 타이틀. 좌하단에 서바이버 3명 실루엣. 다크+주황 화염 대비."
    size: "800x600"
```

에셋 총 20개 — 범위 내 (8~20개).

---

## §9. 난이도 시스템

### §9.1 DDA 4단계 (Dynamic Difficulty Adjustment)

| DDA 레벨 | 발동 조건 | 효과 |
|----------|----------|------|
| 0 (기본) | 기본 상태 | 표준 밸런스 |
| 1 (쉬움) | 2연속 야간 실패 | 좀비 HP -15%, 속도 -10% |
| 2 (더 쉬움) | 3연속 야간 실패 | 좀비 HP -25%, 속도 -20%, 자원 +20% |
| 3 (최소) | 5연속 야간 실패 | 좀비 수 -30%, HP -30%, 코어 자동 회복 1/초 |

**반대 방향**: 3연속 무손실 클리어 시 DDA 레벨 -1 (최소 0)

### §9.2 구역별 난이도 곡선

| 구역 | 야간 | 좀비 수 | 좀비 HP | 특수 좀비 | 보스 HP |
|------|------|---------|---------|-----------|---------|
| 1 폐시가지 | 1~3 | 8→12→16 | 20→25→30 | 헐크 0→0→1 | 300 |
| 2 산업단지 | 4~6 | 14→18→22 | 30→35→40 | 헐크 1→1→2, 스피터 0→1→1 | 500 |
| 3 병원 | 7~9 | 20→25→30 | 40→50→60 | 헐크 2→2→3, 스피터 1→2→2 | 400 |

**난이도 공식**:
```
zombieCount(zone, night) = BASE_COUNT[zone] + (night - 1) * NIGHT_SCALE[zone]
zombieHP(zone, night) = BASE_HP[zone] * (1 + (night - 1) * 0.15)
```

---

## §10. 프로시저럴 생성

### §10.1 야간 웨이브 생성 (SeededRNG)
- 매 야간 시작 시 `G.rng.seed(zone * 1000 + day * 100 + night)`
- 좀비 접근 방향: 4방향 중 2~3방향 활성 (SeededRNG)
- 특수 좀비 배치: 활성 방향에 균등 분배
- 웨이브 간격: 10~30초 사이 SeededRNG

### §10.2 BFS 경로 검증 (F29)

좀비 경로 = 각 스폰 포인트에서 코어까지의 최단 경로 (BFS)
```javascript
function bfsPathExists(grid, start, goal) {
  const queue = [start];
  const visited = new Set([key(start)]);
  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr.x === goal.x && curr.y === goal.y) return true;
    for (const dir of DIRS_4) {
      const nx = curr.x + dir.dx, ny = curr.y + dir.dy;
      if (inBounds(nx, ny) && !visited.has(key({x:nx,y:ny})) && grid[ny][nx] !== BLOCKED) {
        visited.add(key({x:nx,y:ny}));
        queue.push({x:nx, y:ny});
      }
    }
  }
  return false;
}
```

**배치 시 실시간 검증**: 방어물 배치 시 → `tryPlace()` → BFS 4방향 모두 경로 존재 확인 → 하나라도 차단 시 배치 거부 + 경고 메시지

---

## §11. 점수 시스템

### §11.1 점수 계산 (F8: 판정 먼저, 저장 나중에)

| 행동 | 점수 |
|------|------|
| 좀비 처치 (일반) | +10 |
| 좀비 처치 (헐크) | +30 |
| 좀비 처치 (스피터) | +20 |
| 야간 웨이브 클리어 | +100 × 구역 |
| 보스 격파 | +500 |
| 서바이버 구출 | +50 |
| 코어 무손실 보너스 | +200 |
| DDA 레벨 0 보너스 | ×1.5 배율 |

```javascript
// 판정 먼저 → 저장 나중에 (F8)
function onWaveComplete() {
  const score = calculateWaveScore();
  const isNewBest = score > getBestScore(); // 판정 먼저
  saveBestScore(score); // 저장 나중에
  if (isNewBest) showNewBestEffect();
}
```

### §11.2 영구 진행 시스템

**localStorage 데이터 스키마**:
```json
{
  "ashen-stronghold": {
    "version": 1,
    "bestScore": 0,
    "totalKills": 0,
    "zonesCleared": [false, false, false, false, false],
    "upgrades": { "defense": 0, "attack": 0, "explore": 0 },
    "stars": 0,
    "relicsFound": [],
    "survivorsRescued": [],
    "bossesDefeated": [],
    "playCount": 0,
    "settings": { "lang": "ko", "sfxVol": 0.7, "bgmVol": 0.5 }
  }
}
```

---

## §12. 사운드 시스템 (Web Audio API)

### BGM (프로시저럴 생성, F19)
| BGM | 분위기 | BPM | 키 |
|-----|--------|-----|-----|
| bgm_title | 어둡고 장엄한 드론 | 60 | Dm |
| bgm_day | 긴장감 있는 탐색 | 90 | Am |
| bgm_prep | 카운트다운 느낌, 틱톡 | 120 | Em |
| bgm_night | 격렬한 전투 드럼비트 | 140 | Gm |
| bgm_boss | 보스 등장 웅장한 테마 | 150 | Cm |

### SFX 8종+
| SFX | 설명 | 트리거 |
|-----|------|--------|
| sfx_shoot | 소총 발사 — 날카로운 팝 | 사격 시 |
| sfx_reload | 장전 — 금속 클릭 | R키 / 자동 장전 |
| sfx_zombie_hit | 좀비 피격 — 둔탁한 타격 | 좀비 피격 시 |
| sfx_zombie_death | 좀비 사망 — 붕괴 사운드 | 좀비 HP 0 |
| sfx_build | 건설 — 망치질+드릴 | 방어물 배치 시 |
| sfx_explosion | 폭발 — 저음 쿵 | 지뢰/EMP 작동 |
| sfx_alert | 경고 — 사이렌 2음 | 밤 접근/보스 등장 |
| sfx_pickup | 아이템 수집 — 금속 딸깍 | 자원 수집 시 |
| sfx_heal | 치유 — 맑은 차임 | 의무관 치유 시 |
| sfx_gameover | 게임 오버 — 저음 드론 페이드 | 코어 파괴 시 |

---

## §13. 다국어 지원 (F20)

```javascript
const L = {
  ko: {
    title: '잿빛 요새',
    start: '생존 시작',
    day: '주간 탐색',
    night: '야간 방어',
    prep: '방어 준비',
    wave: '웨이브',
    boss: '보스',
    gameover: '요새 함락',
    score: '점수',
    best: '최고 점수',
    scrap: '고철',
    food: '식량',
    ammo: '탄약',
    core_hp: '코어 HP',
    place_blocked: '경로가 차단됩니다!',
    upgrade: '업그레이드',
    defense: '방어',
    attack: '공격',
    explore: '탐색',
    relic_choose: '유물 선택',
    survivor_found: '생존자 발견!',
    zone_clear: '구역 클리어!',
    new_best: '신기록!',
    // ...
  },
  en: {
    title: 'Ashen Stronghold',
    start: 'Start Survival',
    day: 'Day Exploration',
    night: 'Night Defense',
    prep: 'Prepare Defenses',
    wave: 'Wave',
    boss: 'Boss',
    gameover: 'Stronghold Fallen',
    score: 'Score',
    best: 'Best Score',
    scrap: 'Scrap',
    food: 'Food',
    ammo: 'Ammo',
    core_hp: 'Core HP',
    place_blocked: 'Path blocked!',
    upgrade: 'Upgrade',
    defense: 'Defense',
    attack: 'Attack',
    explore: 'Explore',
    relic_choose: 'Choose Relic',
    survivor_found: 'Survivor Found!',
    zone_clear: 'Zone Clear!',
    new_best: 'New Record!',
    // ...
  }
};
```

---

## §14. 코드 위생 및 검증

### §14.1 수치 정합성 테이블 (F10)

| 기획서 값 | CONFIG 상수 | 기대값 |
|-----------|-------------|--------|
| 코어 기본 HP | CORE_BASE_HP | 100 |
| 바리케이드 HP | BARRICADE_HP | 50 |
| 기관총 DPS | TURRET_MG_DPS | 15 |
| 화염 DPS | TURRET_FIRE_DPS | 20 |
| 주간 탐색 시간 | DAY_DURATION | 60 |
| 준비 시간 | PREP_DURATION | 30 |
| 좀비 기본 HP (구역1) | ZOMBIE_BASE_HP[0] | 20 |
| 보스1 HP | BOSS_HP[0] | 300 |
| 보스2 HP | BOSS_HP[1] | 500 |
| 보스3 HP | BOSS_HP[2] | 400 |
| DPS 캡 | DPS_CAP_MULT | 2.0 |
| 시너지 캡 | SYNERGY_CAP_MULT | 1.5 |
| DDA 레벨1 HP 감소 | DDA_HP_REDUCTION[1] | 0.15 |
| 터치 타겟 최소 | MIN_TOUCH_TARGET | 48 |

### §14.2 코드 위생 체크리스트

| # | 체크 항목 | FAIL/WARN | 검증 방법 |
|---|----------|-----------|----------|
| 1 | setTimeout 0건 | FAIL | `grep -c "setTimeout" index.html === 0` |
| 2 | Math.random 0건 | FAIL | `grep -c "Math.random" index.html === 0` |
| 3 | confirm/alert 0건 | FAIL | `grep -c "confirm\|alert(" index.html === 0` |
| 4 | 외부 CDN/fonts 0건 | FAIL | `grep -c "googleapis\|cdnjs\|unpkg" index.html === 0` |
| 5 | engine 직접 참조 콜백 내 0건 | FAIL | 콜백 내 `engine.` 참조 grep |
| 6 | TRANSITION_TABLE 키 수 = 7 | FAIL | `Object.keys(TT).length === 7` |
| 7 | BFS 경로 검증 함수 존재 | FAIL | `bfsPathExists` 함수 정의 확인 |
| 8 | DPS_CAP / SYNERGY_CAP 상수 존재 | FAIL | grep 확인 |
| 9 | applyRelic 내 캡 검증 | FAIL | 코드 내 조건문 확인 |
| 10 | MIN_TOUCH_TARGET ≥ 48 | FAIL | 상수 값 확인 |
| 11 | 전역 변수 G 내 INIT_EMPTY | WARN | 모든 필드 초기값 존재 |
| 12 | _ready 플래그 존재 | WARN | Engine 클래스 내 확인 |
| 13 | 다국어 키 ko/en 대칭 | WARN | `Object.keys(L.ko).length === Object.keys(L.en).length` |

### §14.3 스모크 테스트 게이트 (F15, F26)

| # | 테스트 | FAIL/WARN |
|---|--------|-----------|
| 1 | Engine 초기화 성공: `engine._ready === true` (F26) | FAIL |
| 2 | TITLE 상태 진입 확인: `G.state === 'TITLE'` | FAIL |
| 3 | TITLE → MAP 전환 | FAIL |
| 4 | MAP → DAY_EXPLORE 전환 | FAIL |
| 5 | DAY_EXPLORE → NIGHT_PREP 전환 (시간 종료) | FAIL |
| 6 | NIGHT_PREP → NIGHT_WAVE 전환 | FAIL |
| 7 | 전체 플로우: TITLE→MAP→DAY→PREP→WAVE (회귀) | FAIL |
| 8 | 좀비 스폰 + BFS 경로 이동 확인 | FAIL |
| 9 | 사격 → 좀비 피격 → HP 감소 | FAIL |
| 10 | 방어물 배치 + BFS 경로 차단 경고 | FAIL |
| 11 | 웨이브 클리어 → 유물 선택지 표시 | FAIL |
| 12 | 보스 등장 + 페이즈 전환 | FAIL |
| 13 | GAMEOVER → TITLE 재시작 | FAIL |
| 14 | localStorage 저장/로드 정상 | FAIL |
| 15 | 모바일 터치 영역 48×48px 이상 | FAIL |
| 16 | manifest.json 에셋 로드 성공 | FAIL |
| 17 | 모든 SFX 재생 확인 | WARN |
| 18 | BGM 루프 재생 확인 | WARN |
| 19 | 다국어 전환 정상 | WARN |
| 20 | 60fps 유지 (데스크탑 기준) | WARN |

---

## §15. 밸런스 검증 (부록 A)

### 극단 빌드 3종 시뮬레이션

**빌드 1: 풀 방어 (방어 Lv5, 공격 Lv0, 탐색 Lv0)**
- 코어 HP: 100 + 25(Lv2) = 125, 자동 회복 2/초(Lv5)
- 바리케이드 HP: 50 × 1.2(Lv1) = 60, 수리 가능(Lv3), 2차 레이어(Lv4)
- 사격 DPS: 기본 10 (업그레이드 없음)
- **구역3 보스전 예상**: 400HP ÷ 10DPS = 40초 + 서바이버 AI DPS 5 = 26초
- **판정**: 클리어 가능 (30초 이내), 자원 부족 위험 있음

**빌드 2: 풀 공격 (방어 Lv0, 공격 Lv5, 탐색 Lv0)**
- 사격 DPS: 10 × 1.15(Lv1) × 1.2(크리티컬 Lv5) = ~16 평균
- 포탑: 화염 20DPS(Lv4) + 관통(Lv3) = 범위 공격 강화
- 코어 HP: 기본 100 (업그레이드 없음)
- **구역3 보스전 예상**: 400HP ÷ (16+20+5서바이버) = 10초
- **판정**: 빠른 클리어 가능, 코어 방어 취약 (DPS 캡 2.0 미만 확인 ✅)

**빌드 3: 풀 탐색 (방어 Lv0, 공격 Lv0, 탐색 Lv5)**
- 탐색 시간: 60 + 10(Lv1) = 70초
- 서바이버 발견 +20%(Lv3) → 평균 서바이버 4명 보유
- 보스 힌트(Lv4) + 히든 스테이지(Lv5)
- **구역3 보스전 예상**: 400HP ÷ (10 + 4×5서바이버) = 13초
- **판정**: 서바이버 수로 보상, 클리어 가능

**결론**: 3빌드 모두 클리어 가능 시간 10~26초 범위, 밸런스 범위 내.

---

## §16. 게임 페이지 사이드바 데이터

```json
{
  "game": {
    "id": "ashen-stronghold",
    "title": "잿빛 요새",
    "description": "포스트아포칼립스 세계에서 마지막 요새를 지켜라! 낮에 자원을 수집하고, 밤에 좀비 무리를 방어하는 서바이벌 타워디펜스 로그라이트.",
    "genre": ["action", "strategy"],
    "playCount": 0,
    "rating": 0,
    "controls": [
      "WASD/방향키: 이동",
      "마우스 좌클릭: 사격/배치",
      "1~4: 서바이버 선택",
      "Q/E: 방어물 전환",
      "Space: 상호작용",
      "Tab: 미니맵",
      "터치: 가상 조이스틱+버튼"
    ],
    "tags": ["#좀비", "#서바이벌", "#타워디펜스", "#로그라이트", "#포스트아포칼립스", "#전략"],
    "addedAt": "2026-03-25",
    "version": "1.0.0",
    "featured": true
  }
}
```

---

## §17. 이전 사이클 아쉬웠던 점 반영 요약

| 아쉬운 점 | 해결 섹션 | 해결 방법 | 검증 기준 |
|-----------|----------|----------|----------|
| C39: P0 TDZ로 게임 완전 불능 | §5.1 | `_ready` 플래그 + 콜백 가드 3중 방어 | 스모크 #1 통과 |
| C39: 모바일 터치 48px 미달 | §3.3 | Math.max(48) 강제 + ASCII 레이아웃 | 스모크 #15 통과 |
| C40: 이중 시스템 과대화 우려 | §1, §6.2 | 주간/야간 자연 분리 + 상호 배타 매트릭스 | 상태 7개, Explore/Defense 비중첩 |
| C36: BFS 경로 차단 버그 | §10.2, §7.2 | 배치 시 즉시 BFS 검증 + 차단 시 배치 거부 | 스모크 #10 통과 |
| C27: 캡 초과 유물 미제외 | §7.4 | DPS/시너지 캡 + 자동 제외 로직 | 코드 위생 #8~9 통과 |
| C34: 이중 시스템 경제 비중 불균형 | §7.1 | 자원 3종 각각 명확한 용도 지정 | 빌드 3종 클리어 가능 |

---

_이 기획서는 사이클 #41 분석 보고서 기반으로 작성되었습니다._
_action+strategy 11사이클 최장 미사용 해소 + 좀비 포스트아포칼립스 플랫폼 최초 테마._
_Steam TD Fest 2026 + 서바이벌 장르 트렌드 반영._
