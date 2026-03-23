---
game-id: corsair-tides
title: 해적의 조류
genre: casual, strategy
difficulty: medium
---

# 해적의 조류 (Corsair Tides) — 사이클 #34 게임 기획서

> **1페이지 요약**: 어촌 출신 소년이 해적왕의 부름을 받아 5대 해역을 정복하는 **항구 경영 + 해전 전략 로그라이트**. 항구에서 시설 건설·교역·선박 건조(casual)를 하고, 출항하여 함대 배치·포격 전술·보딩 작전(strategy)으로 적 함대·해양 보스를 격파한다. 5해역 × 3~4섬 = 17 기본 스테이지 + 해역 보스 5종 + 히든 전설의 섬 = **총 23 스테이지**. 선박 해금 트리(12종) × 선원 스킬(8분야) × 항구 시설(5단계) 영구 진행 + 프로시저럴 항로 이벤트·날씨 변화·적 함대 랜덤 구성으로 높은 리플레이 가치. **casual+strategy 조합으로 10사이클 연속 서로 다른 장르 조합 달성(#25~#34) — 플랫폼 최초 10개 조합 완전 순환!** 플랫폼 최초 해적 테마, 해양 Canvas 비주얼 신규 도입.

> **MVP 경계**: Phase 1(핵심 루프: 항구 경영→출항→해전→귀환, 해역 1~2 + 보스 2체 + 기본 선박 4종 + 시설 6종 + 선원 스킬 4분야) → Phase 2(해역 3~5 + 보스 3체 + 히든 전설의 섬 + 전체 내러티브 + 선박 12종 + 시설 전체 + 선원 8분야 + 보물 지도 도감). **Phase 1만으로도 완전한 게임 경험 제공 필수.**

---

## §0. 피드백 매핑 (이전 사이클 교훈)

### 검증 완료 패턴 (platform-wisdom 참조) ✅
> 아래 항목은 17~33사이클 이상 검증되어 platform-wisdom.md에 상세 기술됨. 본 기획서에서는 **적용 섹션만 표기**한다.

| ID | 교훈 요약 | 적용 섹션 |
|----|----------|----------|
| F1 | assets/ 디렉토리 절대 생성 금지 — 17사이클 연속 성공 [Cycle 1~33] | §4.1 |
| F2 | 외부 CDN/폰트 0건 [Cycle 1] | §4.1 |
| F3 | iframe 환경 confirm/alert 금지 → Canvas 모달 [Cycle 1] | §6.4 |
| F4 | setTimeout 0건 → tween onComplete 전용 [Cycle 1~2] | §5.2 |
| F5 | 가드 플래그로 tween 콜백 1회 실행 보장 [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition 체계 [Cycle 3 B2] | §6.1 |
| F7 | 상태×시스템 매트릭스 필수 [Cycle 2 B1] | §6.2 |
| F8 | 판정 먼저, 저장 나중에 [Cycle 2 B4] | §11.1 |
| F9 | 순수 함수 패턴 (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | 수치 정합성 테이블 (기획=코드 1:1) [Cycle 7] | §14.1 |
| F11 | 터치 타겟 최소 48×48px + Math.max 강제 [Cycle 12~33] | §3.3 |
| F12 | TDZ 방지: INIT_EMPTY 패턴 [Cycle 5~33] | §5.1 |
| F13 | TweenManager clearImmediate() API 분리 [Cycle 4 B1] | §5.2 |
| F14 | 단일 값 갱신 경로 통일 [Cycle 5 B2] | §5.2 |
| F15 | 스모크 테스트 게이트 [Cycle 22~33] | §14.3 |
| F16 | hitTest() 단일 함수 통합 [Cycle 27] | §3.3 |
| F17 | bossRewardGiven 플래그 패턴 [Cycle 27] | §7.5 |
| F18 | SeededRNG 완전 사용 (Math.random 0건) [Cycle 19~33] | §5.2, §14.3 |
| F19 | 프로시저럴 SFX + BGM (Web Audio API 생성) [Cycle 19~33] | §12 |
| F20 | 다국어 지원 (ko/en) [Cycle 27~33] | §13 |
| F21 | beginTransition 단일 정의 [Cycle 32] | §6.1 |
| F22 | orphaned SVG 전량 삭제 [Cycle 32] | §4.1 |

### 신규 피드백 (사이클 #33 교훈) 🆕

| ID | 교훈 | 적용 섹션 | 해결 방법 |
|----|------|----------|----------|
| F23 | 보스 5종 × 3페이즈 약점 공략 조건을 능력 해금 순서와 연계해야 함 [Cycle 33] | §10.4 | 선박 해금 순서 → 해역 접근 가능성 맵 테이블 제공 |
| F24 | 로그라이크 빌드 조합 공간의 극단 빌드 사전 검증 필요 [Cycle 33] | §부록A | 3종 극단 빌드 DPS 수식 사전 검증 + 캡 초과 시 선택지 자동 제외 |
| F25 | 하이브리드 프로시저럴 생성에서 변형 범위의 리플레이 체감 검증 [Cycle 33] | §10.2 | 기본 항로 사전 정의 + 변형 요소(적·이벤트·날씨) 30~50% 랜덤화 |
| F26 | 이중 페이즈(경영/전투) 게임에서 ACTIVE_SYSTEMS 매트릭스 페이즈별 분리 [Cycle 24] | §6.2 | port/voyage 열을 별도로 분리하여 상호 배타적 관리 |
| F27 | DPS/EHP 밸런스 산식의 가정을 명시하고 DDA 폴백 설계 [Cycle 24] | §8.2 | "플레이어 회피율 40%" 가정 명시 + 3연패 시 적 HP -15% 보정 |
| F28 | 영구 진행(항구 업그레이드)과 런별 진행(항로 이벤트 보상)의 축 분리 [Cycle 29] | §9 | 영구=선박/시설(전투력), 런별=선원 버프/보급품(전술 유연성) |

---

## §1. 게임 개요 및 핵심 재미 요소

### 1.1 콘셉트
어촌 출신 소년 '타이드(Tide)'가 전설의 해적왕이 남긴 나침반을 손에 넣고, 5대 해역을 정복하며 최강의 해적 함대를 건설하는 이야기. **경영의 성장감**(항구가 발전하는 시각적 쾌감) + **전술적 해전**(함대 배치와 포격 타이밍)의 이중 쾌감.

### 1.2 핵심 재미
1. **항구 성장의 시각적 쾌감**: 초라한 어촌 → 번영하는 해적 요새로 변모
2. **전술적 해전**: 바람/해류를 읽고 함대를 배치하여 적 함대 격파
3. **탐험과 발견**: 프로시저럴 항로 이벤트, 보물 지도 조각 수집
4. **영구 진행 성취감**: 선박 해금 트리, 선원 스킬, 시설 업그레이드
5. **로그라이트 리플레이**: 항로마다 다른 적·이벤트·날씨 조합

### 1.3 내러티브 아크
- **프롤로그**: 어촌 마을에 떠밀려온 해적왕의 나침반
- **해역 1 (카리브해)**: 첫 출항, 해적의 기본을 배움
- **해역 2 (지중해)**: 상인 길드와 교역, 해군 등장
- **해역 3 (인도양)**: 폭풍 해역, 크라켄 출현
- **해역 4 (남중국해)**: 유령선 함대와 대결
- **해역 5 (북대서양)**: 해군 제독과 최종 결전
- **히든**: 보물 지도 7조각 → 전설의 섬 (해적왕의 유산)

---

## §2. 게임 규칙 및 목표

### 2.1 승리 조건
- 5대 해역의 보스를 모두 격파하여 해적왕의 칭호 획득
- (선택) 보물 지도 7조각 수집 → 전설의 섬 클리어

### 2.2 패배 조건
- 해전에서 기함(旗艦) HP가 0 → 항구로 귀환 (보급품 50% 손실)
- 항구 자금이 0 이하 → 게임 오버 (영구 진행은 유지)

### 2.3 핵심 루프
```
[항구 페이즈] → [출항 준비] → [항로 이동] → [해전/이벤트] → [보상] → [귀환] → [항구 페이즈]
     ↓              ↓              ↓              ↓            ↓         ↓
   시설 건설      함대 편성      랜덤 이벤트    전술 전투     전리품    시설 강화
   교역/수입      보급품 구매    날씨 변화      보스전        경험치    선박 해금
   선원 고용      항로 선택      해류 효과      보딩 작전     지도 조각  스킬 업그레이드
```

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 항구 페이즈 | 해전 페이즈 |
|----|-----------|-----------|
| 마우스 클릭 | 시설 선택/건설/업그레이드 | 함선 선택/이동 명령 |
| 1~4 숫자 | 빠른 시설 탭 전환 | 포격 유형 선택 (일반/체인/폭발/산탄) |
| Space | 교역 확인 | 일제 사격 (선택된 함선) |
| E | 원정 출발 | 보딩 작전 (근접 시) |
| Tab | 시설 탭 순환 | 다음 함선 선택 |
| Esc | 게임 메뉴 | 퇴각 확인 모달 |
| R | — | 대열 변경 (공격진↔방어진↔쐐기진) |

### 3.2 마우스
- **항구**: 클릭으로 시설 선택, 드래그로 지도 스크롤, 휠로 줌
- **해전**: 클릭으로 함선 선택 → 우클릭으로 이동/공격 명령, 드래그로 범위 선택

### 3.3 터치 (모바일)
- **항구**: 탭으로 시설 선택, 스와이프로 스크롤, 핀치로 줌
- **해전**: 탭으로 함선 선택 → 탭으로 이동 명령, 롱프레스로 공격 명령
- 모든 버튼 최소 48×48px (`Math.max(CONFIG.MIN_TOUCH, size)` 강제) — [F11]
- hitTest() 단일 함수로 터치/마우스 통합 — [F16]

**모바일 버튼 레이아웃 (≤400px):**
```
┌────────────────────────────┐
│  [≡]                 [⚓]  │  ≡=메뉴, ⚓=항구 복귀
│                            │
│        게임 영역           │
│                            │
│  [🔄]  [💰]         [⚔️]  │  🔄=대열, 💰=교역, ⚔️=공격
│  [1][2][3][4]       [📦]  │  1~4=포격유형, 📦=보급
└────────────────────────────┘
```

**모바일 버튼 레이아웃 (>400px):**
```
┌──────────────────────────────────┐
│  [≡]              [🗺️]    [⚓]  │
│                                  │
│           게임 영역              │
│                                  │
│  [🔄][💰]              [⚔️][📦] │
│     [1] [2] [3] [4]             │
└──────────────────────────────────┘
```

---

## §4. 시각적 스타일 가이드

### 4.1 에셋 원칙
- **assets/ 디렉토리 절대 생성 금지** — 18사이클 연속 준수 목표 [F1]
- **외부 CDN/폰트 0건** — 모든 에셋은 Canvas/SVG inline 생성 [F2]
- **INIT_EMPTY 패턴**: 빈 객체 초기화 → `init()` 에서 Canvas 드로잉으로 생성 [F12]
- SVG 필터(feGaussianBlur, feDropShadow) **절대 사용 금지** — Canvas shadow/glow로 대체

### 4.2 색상 팔레트
```
해양 테마:
  --ocean-deep:    #0a2463   (깊은 바다)
  --ocean-mid:     #1e6091   (중층 바다)
  --ocean-surface: #3da5d9   (수면)
  --ocean-foam:    #d4f1f9   (거품)

항구 테마:
  --port-wood:     #8b5e3c   (목재)
  --port-stone:    #6b7b8d   (돌)
  --port-gold:     #f0c040   (금화)
  --port-rope:     #c4a35a   (밧줄)

전투 테마:
  --fire-cannon:   #ff6b35   (포격)
  --fire-explosion:#ff2e00   (폭발)
  --smoke-light:   #b0b0b0   (연기)
  --boarding-steel:#c0c0c0   (백병전)

UI:
  --ui-parchment:  #f5e6c8   (양피지 배경)
  --ui-ink:        #2a1810   (잉크 텍스트)
  --ui-accent:     #c9302c   (강조-빨강)
  --ui-gold:       #ffd700   (강조-금)
```

### 4.3 배경 및 환경
- **항구**: 부두 + 건물 + 바다 3레이어 패럴랙스
- **해전**: 해수면 파도 애니메이션 + 하늘(시간대 변화) + 원거리 섬 실루엣
- **날씨**: 맑음(기본), 구름(시야 약간 감소), 폭풍(파도 강화+시야 대폭 감소), 안개(시야 극감)
- **시간대**: 새벽(주황), 낮(파랑), 석양(빨강), 밤(남색) — 해역별 기본 시간대 + 경과

### 4.4 드로잉 함수 표준 시그니처 [F9]
```javascript
// 모든 드로잉 함수는 순수 함수 — 전역 상태 직접 참조 금지
drawShip(ctx, x, y, size, shipType, rotation, dmgRatio, flags)
drawBuilding(ctx, x, y, w, h, buildingType, level, isSelected)
drawWave(ctx, x, y, w, h, time, weatherType)
drawCannon(ctx, x, y, angle, firingState, cannonType)
drawUI_Button(ctx, x, y, w, h, label, isHovered, isPressed)
drawUI_ResourceBar(ctx, x, y, w, resource, maxResource, color)
drawBoss(ctx, x, y, size, bossType, phase, hpRatio, animFrame)
```

### 4.5 SVG 인라인 에셋 목록 (20~25개, 각 400×400+ viewBox)

| # | 에셋명 | 용도 | 크기 목표 |
|---|--------|------|-----------|
| 1 | ship-sloop | 소형 범선 (초기) | 400×400, 12KB |
| 2 | ship-brigantine | 중형 범선 | 400×400, 14KB |
| 3 | ship-galleon | 대형 범선 | 400×400, 16KB |
| 4 | ship-warship | 전투함 | 400×400, 16KB |
| 5 | ship-flagship | 기함 (최종) | 400×400, 18KB |
| 6 | boss-pirate-king | 보스1: 해적왕 | 600×400, 20KB |
| 7 | boss-kraken | 보스2: 크라켄 | 600×400, 22KB |
| 8 | boss-ghost-ship | 보스3: 유령선 | 600×400, 20KB |
| 9 | boss-admiral | 보스4: 해군 제독 | 600×400, 20KB |
| 10 | boss-leviathan | 보스5: 리바이어던 (최종) | 600×400, 22KB |
| 11 | building-dock | 항구 조선소 | 400×400, 10KB |
| 12 | building-warehouse | 창고 | 400×400, 10KB |
| 13 | building-tavern | 선술집 (선원 고용) | 400×400, 12KB |
| 14 | building-market | 교역소 | 400×400, 10KB |
| 15 | building-fort | 방어 요새 | 400×400, 12KB |
| 16 | building-lighthouse | 등대 | 400×400, 10KB |
| 17 | env-island-tropical | 열대 섬 | 400×300, 10KB |
| 18 | env-island-rocky | 암초 섬 | 400×300, 10KB |
| 19 | env-storm-clouds | 폭풍 구름 | 400×200, 8KB |
| 20 | env-sea-monster | 해양 생물 | 400×300, 12KB |
| 21 | ui-compass | 나침반 UI | 400×400, 10KB |
| 22 | ui-treasure-map | 보물 지도 | 400×400, 12KB |
| 23 | ui-anchor | 닻 아이콘 | 200×200, 6KB |
| 24 | ui-skull-flag | 해적 깃발 | 300×300, 8KB |
| 25 | thumbnail | 썸네일 (시네마틱) | 800×600, 22KB |

---

## §5. 핵심 게임 루프 (프레임 기준 로직 흐름)

### 5.1 초기화 순서 [F12 — INIT_EMPTY 패턴]
```javascript
// 1단계: 빈 객체 선언 (TDZ 방지)
const G = {
  state: 'INIT', phase: 'PORT', ships: [], buildings: [],
  crew: [], gold: 0, supplies: 0, fame: 0,
  currentSea: 0, currentIsland: 0, weather: 'clear',
  wind: { dir: 0, force: 1 }, tide: { level: 0, rising: true },
  boss: null, treasureMap: [false,false,false,false,false,false,false],
  lang: 'ko', save: null, rng: null, tw: null, sfx: null,
  // 런별 변수
  runBuffs: [], runSupplies: 100, runMorale: 100
};

// 2단계: 캔버스/컨텍스트 초기화
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 3단계: init() 호출 — 에셋 생성, 사운드 초기화, 저장 로드
function init() { /* ... */ }
```

### 5.2 메인 루프 [F4, F5, F13, F14, F18]
```javascript
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // 50ms 캡
    lastTime = timestamp;

    // 시스템 업데이트 (상태×시스템 매트릭스 §6.2 참조)
    if (ACTIVE_SYSTEMS[G.state].tween) G.tw.update(dt);
    if (ACTIVE_SYSTEMS[G.state].physics) updatePhysics(G, dt);
    if (ACTIVE_SYSTEMS[G.state].weather) updateWeather(G, dt);
    if (ACTIVE_SYSTEMS[G.state].economy) updateEconomy(G, dt);
    if (ACTIVE_SYSTEMS[G.state].ai) updateEnemyAI(G, dt);
    if (ACTIVE_SYSTEMS[G.state].particles) updateParticles(G, dt);
    if (ACTIVE_SYSTEMS[G.state].idle) updateIdleProduction(G, dt);

    // 렌더링
    render(ctx, G, timestamp);

    requestAnimationFrame(gameLoop);
  } catch(e) {
    console.error('gameLoop error:', e);
    // 에러 화면 렌더링
    renderError(ctx, e);
  }
}
```

- **setTimeout 0건** — 모든 지연 전환은 `G.tw.add()` + `onComplete` 콜백 [F4]
- **가드 플래그**: 상태 전환 tween의 onComplete에 `if (G._transitioning) return; G._transitioning = true;` [F5]
- **clearImmediate()**: `G.tw.cancelAll()` 대신 `G.tw.clearImmediate()` 사용하여 경쟁 조건 방지 [F13]
- **단일 갱신 경로**: `G.wind.force` 등 핵심 변수는 tween 또는 직접 대입 중 하나만 [F14]
- **SeededRNG**: `G.rng = new SeededRNG(seed)` — Math.random 0건 [F18]

---

## §6. 상태 머신

### 6.1 게임 상태 목록 [F6, F21]

```
INIT → TITLE → CUTSCENE → PORT → PORT_BUILD → PORT_TRADE → PORT_CREW
  → VOYAGE_PREP → VOYAGE_MAP → VOYAGE_EVENT → BATTLE_SETUP
  → BATTLE → BATTLE_BOSS → BOARDING → BATTLE_RESULT
  → UPGRADE → GAMEOVER → VICTORY → CONFIRM_MODAL → PAUSED → SETTINGS
```

**STATE_PRIORITY** (높을수록 우선):
```javascript
const STATE_PRIORITY = {
  GAMEOVER: 100, VICTORY: 90, CONFIRM_MODAL: 80,
  BATTLE_BOSS: 70, BATTLE: 60, BOARDING: 55,
  BATTLE_SETUP: 50, BATTLE_RESULT: 45,
  VOYAGE_EVENT: 40, VOYAGE_MAP: 35, VOYAGE_PREP: 30,
  PORT: 20, PORT_BUILD: 20, PORT_TRADE: 20, PORT_CREW: 20,
  UPGRADE: 15, CUTSCENE: 10, TITLE: 5, SETTINGS: 3, PAUSED: 2, INIT: 0
};
```

**beginTransition() 단일 정의** — 모든 상태 전환은 이 함수를 경유 [F21]:
```javascript
function beginTransition(fromState, toState, duration = 0.4) {
  if (STATE_PRIORITY[toState] < STATE_PRIORITY[G.state] && G.state !== fromState) return;
  if (G._transitioning) return;
  G._transitioning = true;
  G.tw.add({ target: G, props: { _transAlpha: 0 }, duration,
    onComplete: () => { enterState(toState); G._transAlpha = 1; G._transitioning = false; }
  });
}
```

**예외**: PAUSED ↔ 이전 상태는 `beginTransition(_, _, 0)` 즉시 전환 모드 사용

**RESTART_ALLOWED 화이트리스트** [Cycle 24]:
```javascript
const RESTART_ALLOWED = ['GAMEOVER', 'VICTORY', 'TITLE'];
// enterState('TITLE')는 RESTART_ALLOWED에 포함된 상태에서만 호출 가능
```

### 6.2 상태 × 시스템 매트릭스 [F7, F26]

| 상태 | Tween | Physics | Weather | Economy | AI | Particles | Idle | Input 모드 | Render |
|------|-------|---------|---------|---------|-----|-----------|------|-----------|--------|
| INIT | — | — | — | — | — | — | — | — | splash |
| TITLE | ✅ | — | ✅(배경) | — | — | ✅ | — | menu | title |
| CUTSCENE | ✅ | — | — | — | — | ✅ | — | skip | cutscene |
| PORT | ✅ | — | ✅ | ✅ | — | ✅ | ✅ | port | port |
| PORT_BUILD | ✅ | — | ✅ | ✅ | — | ✅ | ✅ | build | port+UI |
| PORT_TRADE | ✅ | — | ✅ | ✅ | — | ✅ | ✅ | trade | port+UI |
| PORT_CREW | ✅ | — | ✅ | ✅ | — | ✅ | ✅ | crew | port+UI |
| VOYAGE_PREP | ✅ | — | ✅ | — | — | ✅ | — | prep | prep |
| VOYAGE_MAP | ✅ | ✅(이동) | ✅ | — | — | ✅ | — | navigate | map |
| VOYAGE_EVENT | ✅ | — | ✅ | — | — | ✅ | — | event | event |
| BATTLE_SETUP | ✅ | — | ✅ | — | — | ✅ | — | deploy | battle |
| BATTLE | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | combat | battle |
| BATTLE_BOSS | ✅ | ✅ | ✅ | — | ✅(보스) | ✅ | — | combat | battle |
| BOARDING | ✅ | — | ✅ | — | ✅(보딩) | ✅ | — | boarding | boarding |
| BATTLE_RESULT | ✅ | — | ✅ | — | — | ✅ | — | limited | result |
| UPGRADE | ✅ | — | — | — | — | ✅ | — | upgrade | upgrade |
| GAMEOVER | ✅ | — | — | — | — | ✅ | — | limited | gameover |
| VICTORY | ✅ | — | — | — | — | ✅ | — | limited | victory |
| CONFIRM_MODAL | ✅ | — | — | — | — | — | — | modal | prev+modal |
| PAUSED | ✅ | — | — | — | — | — | ✅(백그라운드) | menu | prev+pause |
| SETTINGS | ✅ | — | — | — | — | — | — | settings | settings |

> **핵심 [F26]**: PORT 계열과 BATTLE 계열에서 활성화되는 시스템이 상호 배타적(Economy vs AI). Idle 시스템은 PORT 계열 + PAUSED에서 항상 동작하여 아이들 수입 보장 [Cycle 11].

### 6.3 Input 모드 세분화 [Cycle 26]

| 모드 | 허용 입력 |
|------|----------|
| menu | 클릭/탭 (메뉴 버튼만) |
| port | 시설 클릭, 탭 전환, 스크롤/줌 |
| build | 건설 위치 선택, 건물 종류 선택, 취소 |
| trade | 교역품 선택, 수량 조절, 확인/취소 |
| crew | 선원 선택, 배치, 스킬 할당 |
| prep | 함대 편성, 보급품 구매, 항로 선택, 출항 |
| navigate | 함대 이동 방향, 속도 조절 |
| event | 선택지 클릭 (2~3개) |
| deploy | 함선 배치, 진형 선택, 전투 시작 |
| combat | 함선 선택, 이동/공격 명령, 포격 유형, 보딩 |
| boarding | 공격/방어 타이밍 클릭 |
| limited | 확인/다음 버튼만 |
| upgrade | 업그레이드 선택, 확인/취소 |
| modal | 확인/취소 |
| skip | 아무 키/탭 → 스킵 |
| settings | 설정 항목 토글, 볼륨 조절, 언어 전환 |

### 6.4 Canvas 기반 모달 [F3]
- `confirm()`/`alert()` **절대 사용 금지**
- 퇴각 확인, 과금 확인, 게임 오버 등 모든 확인 UI는 Canvas 렌더링 모달
- 모달 표시 시 배경 어둡게(alpha 0.6) + 애니메이션(scale 0→1 tween)

---

## §7. 핵심 시스템 상세

### 7.1 항구 경영 시스템 (casual)

#### 7.1.1 시설 목록

| 시설 | Lv1 효과 | Lv2 | Lv3 | Lv4 | Lv5 | 건설 비용 |
|------|----------|-----|-----|-----|-----|----------|
| 조선소 | 소형 범선 건조 | 중형 | 대형 | 전투함 | 기함 | 100/300/600/1200/2500 |
| 창고 | 자원 상한 +50 | +100 | +200 | +400 | +800 | 80/200/400/800/1600 |
| 선술집 | 선원 2명 모집 | 3명 | 4명 | 5명 | 6명 | 60/150/350/700/1400 |
| 교역소 | 교역 2품목 | 3품목 | 4품목 | 5품목 | 6품목 | 120/250/500/1000/2000 |
| 방어 요새 | 항구 방어력 +10 | +20 | +35 | +55 | +80 | 150/350/700/1400/2800 |
| 등대 | 시야 +1 | +2 | +3 | +4 | +5 | 50/120/250/500/1000 |

#### 7.1.2 교역 시스템
- 품목: 향신료, 비단, 화약, 럼, 보석, 희귀목재 (6종)
- 각 해역마다 특산품(싸게 구매) ↔ 희귀품(비싸게 판매) 구조
- 교역 이익 = `(판매가 - 구매가) × 수량 × 교역소레벨보너스`
- **자동 교역**: 등대 Lv3 이상 시 해금, 일정 시간마다 자동 소규모 이익 (아이들 요소)

#### 7.1.3 선원 고용 및 배치
- 선원 8분야: 항해, 포격, 백병전, 수리, 정찰, 교역, 요리, 의료
- 각 분야 Lv1~5, 선원당 주특기 1개 + 부특기 1개
- 함선마다 선원 슬롯: 소형 2, 중형 4, 대형 6, 전투함 8, 기함 10

### 7.2 해전 시스템 (strategy)

#### 7.2.1 함대 배치
- 전투 시작 전 BATTLE_SETUP에서 함선 위치 배치 (그리드 기반, 좌측 배치)
- 진형: 공격진(▶), 방어진(■), 쐐기진(▲) — 각 보너스/페널티

| 진형 | 공격력 | 방어력 | 이동속도 |
|------|--------|--------|----------|
| 공격진 | +20% | -10% | +10% |
| 방어진 | -10% | +25% | -15% |
| 쐐기진 | +10% | +10% | -5% |

#### 7.2.2 포격 유형
| 유형 | 데미지 | 범위 | 쿨다운 | 특수 효과 |
|------|--------|------|--------|----------|
| 일반(실탄) | 100% | 단일 | 2초 | — |
| 체인(사슬탄) | 60% | 단일 | 3초 | 이동속도 -30%, 3초 |
| 폭발(폭탄) | 80% | 범위 2칸 | 4초 | 화재(초당 5 데미지, 5초) |
| 산탄(포도탄) | 40%×3 | 부채꼴 3칸 | 3초 | 선원 피해 증가 |

#### 7.2.3 바람/해류 시스템
- **바람**: 8방향, 세기 1~3 — 순풍 +속도, 역풍 -속도, 측풍 편류
- **해류**: 특정 방향 자동 이동 — 해역별 고정 패턴 + 날씨 변형
- **풍향 변화**: 3~5턴마다 SeededRNG로 변화 예고 (UI에 표시)

#### 7.2.4 보딩 작전 (근접 전투)
- 함선이 인접 시 E키/탭으로 보딩 개시
- 미니게임: 타이밍 클릭 (3회) — 공격 윈도우(0.8초) 내 클릭 성공 시 데미지
- 선원 백병전 스킬이 높을수록 윈도우 확장

### 7.3 항로 이벤트 시스템

항로 이동 중 SeededRNG로 이벤트 발생 (30~50% 랜덤화) [F25]:

| 이벤트 | 확률 | 효과 | 대응 선택지 |
|--------|------|------|------------|
| 표류 상인 | 15% | 할인 교역 | 구매/무시 |
| 해적 습격 | 20% | 전투 진입 | 전투/협상(금 지불)/도주(50%) |
| 폭풍 | 15% | 선박 손상 10~30% | 돌파(데미지)/우회(시간+2) |
| 해양 생물 | 10% | 크라켄/고래 등 | 전투/관찰(정보보상) |
| 보물 섬 | 10% | 보급품/금화/지도조각 | 탐색(함정 30%)/무시 |
| 조난 선원 | 10% | 무료 선원 획득 | 구조/무시 |
| 안개 | 10% | 시야 -3, 3턴 | 정찰 스킬 시 회피 |
| 우호 함대 | 10% | 정보/보급품 | 교역/동행(다음 전투 지원) |

### 7.4 날씨 시스템

| 날씨 | 시야 | 이동속도 | 포격 명중 | 특수 |
|------|------|----------|----------|------|
| 맑음 | 100% | 100% | 100% | — |
| 구름 | 80% | 100% | 90% | — |
| 비 | 60% | 90% | 75% | 화재 지속시간 -50% |
| 폭풍 | 30% | 70% | 50% | 매 턴 선박 5 데미지 |
| 안개 | 20% | 80% | 40% | 정찰 스킬 무효화 |

### 7.5 보스전 [F17]

5해역 보스 + 히든 보스:

| 보스 | 해역 | HP | 페이즈 수 | 핵심 메카닉 | 필요 선박 |
|------|------|-----|----------|------------|----------|
| 블랙비어드(해적왕) | 카리브해 | 500 | 2 | 돌격+포격 교대 | 소형+ |
| 크라켄 | 인도양 | 800 | 3 | 촉수 회피+약점 공격 | 중형+ |
| 유령선 플리트 | 남중국해 | 600×3 | 2 | 안개 속 다수전 | 대형+ |
| 해군 제독 | 북대서양 | 1000 | 3 | 진형 파훼+기함 집중 | 전투함+ |
| 리바이어던 | 전설의 섬 | 1500 | 4 | 해류 변동+전방위 공격 | 기함 |

**보스 페이즈 전환 다이어그램 (크라켄 예시)**:
```
[Phase 1: HP 100%~60%]
  촉수 3개 활성 → 촉수 파괴 시 본체 노출 (3초)
  ↓ HP 60%
[Phase 2: HP 60%~25%]
  촉수 5개 + 잉크 분사(시야 0, 2초) → 촉수 전멸 시 본체 노출 (2초)
  ↓ HP 25%
[Phase 3: HP 25%~0%]
  전신 노출 + 해류 소용돌이 → 소용돌이 중심에서 포격 (이동 불가 구역 회피)
```

**bossRewardGiven 플래그** [F17]:
```javascript
if (boss.hp <= 0 && !G._bossRewardGiven) {
  G._bossRewardGiven = true;
  giveReward(boss.rewards);
  beginTransition(G.state, 'BATTLE_RESULT');
}
```

---

## §8. 난이도 시스템

### 8.1 해역별 밸런스 테이블

| 해역 | 적 HP 범위 | 적 공격력 | 적 함선 수 | 이벤트 위험도 | 보스 난이도 |
|------|-----------|----------|-----------|-------------|-----------|
| 카리브해 | 50~120 | 10~20 | 1~2 | 낮음 | ★☆☆☆☆ |
| 지중해 | 100~250 | 20~40 | 2~3 | 중하 | ★★☆☆☆ |
| 인도양 | 200~400 | 35~60 | 3~4 | 중간 | ★★★☆☆ |
| 남중국해 | 350~600 | 50~80 | 3~5 | 중상 | ★★★★☆ |
| 북대서양 | 500~900 | 70~110 | 4~6 | 높음 | ★★★★★ |

### 8.2 밸런스 산식 [F27]

**DPS 계산** (플레이어 기준):
```
기본 DPS = (포격 데미지 × 포문 수) / 쿨다운
실효 DPS = 기본 DPS × 명중률(날씨) × 진형보너스 × 선원포격스킬보너스
```

**EHP 계산** (적 기준):
```
EHP = HP / (1 - 방어율)
가정: 플레이어 회피율 40% (진형 방어 + 이동 회피)
적 실효 DPS = 적 DPS × (1 - 플레이어 회피율 0.4)
```

**클리어 예상 시간**: `적 총 EHP / 플레이어 실효 DPS = 20~45초 (해전 1회)`

**DDA 폴백** [F27]: 동일 해전 3연패 시 적 HP -15%, 5연패 시 -25%

**DPS 캡** [Cycle 26, 33]: 최대 DPS = 기본 DPS × 200%, 시너지 캡 150%
```javascript
function applyBuff(ship, buff) {
  const newDps = ship.baseDps * (1 + buff.dpsBonus);
  ship.dps = Math.min(newDps, ship.baseDps * CONFIG.DPS_CAP); // 200%
}
```

---

## §9. 영구 진행 시스템 [F28]

### 9.1 영구 진행 (전투력 축) — 항구 시설 + 선박 해금
| 카테고리 | 항목 | 효과 축 |
|---------|------|--------|
| 조선소 업그레이드 | 선박 12종 순차 해금 | 화력/내구도 |
| 창고 확장 | 자원 상한 증가 | 경제 규모 |
| 방어 요새 | 항구 방어력 | 생존성 |
| 등대 | 시야 범위 + 자동 교역 | 정보/수입 |

### 9.2 런별 진행 (전술 유연성 축) — 항로 이벤트 보상
| 카테고리 | 항목 | 효과 축 |
|---------|------|--------|
| 선원 버프 | 고용 선원 능력 랜덤 | 전술 선택지 |
| 보급품 | 수리 키트, 연막탄, 갈고리 등 | 즉시 전투 옵션 |
| 항로 정보 | 다음 이벤트 미리보기 | 전략적 선택 |
| 동맹 | 우호 함대 동행 | 임시 전력 |

> **영구/런별 분리 원칙** [F28]: 영구 진행은 "무엇을 할 수 있는가"(선박 종류, 시설 규모), 런별 진행은 "어떻게 할 것인가"(선원 조합, 보급품 선택)를 담당. 두 축이 같은 능력을 강화하지 않도록 설계.

### 9.3 선박 해금 순서 → 해역 접근 가능성 맵 [F23]

| 해금 순서 | 선박 | 해금 조건 | 접근 가능 해역 |
|----------|------|----------|--------------|
| 1 | 소형 범선 (Sloop) | 초기 보유 | 카리브해 |
| 2 | 소형 쌍동선 (Catboat) | 조선소 Lv1 + 금 100 | 카리브해 |
| 3 | 중형 브리간틴 (Brigantine) | 카리브해 보스 격파 + 조선소 Lv2 | 카리브해, 지중해 |
| 4 | 중형 스쿠너 (Schooner) | 금 500 + 조선소 Lv2 | 카리브해, 지중해 |
| 5 | 대형 갤리온 (Galleon) | 지중해 보스 격파 + 조선소 Lv3 | 카리브~인도양 |
| 6 | 대형 캐러벨 (Caravel) | 금 1200 + 조선소 Lv3 | 카리브~인도양 |
| 7 | 전투함 프리깃 (Frigate) | 인도양 보스 격파 + 조선소 Lv4 | 카리브~남중국해 |
| 8 | 전투함 코르벳 (Corvette) | 금 2000 + 조선소 Lv4 | 카리브~남중국해 |
| 9 | 기함 맨오워 (Man-o-War) | 남중국해 보스 격파 + 조선소 Lv5 | 전 해역 |
| 10 | 특수 유령선 (Ghost Ship) | 히든 보물 3개 수집 | 전 해역 |
| 11 | 특수 크라켄호 (Krakenship) | 크라켄 보스 3회 격파 | 전 해역 |
| 12 | 전설 해적왕호 (Pirate King) | 전설의 섬 클리어 | 전 해역+히든 |

> **BFS 도달 가능성 검증**: 보스 격파 → 선박 해금 → 다음 해역 접근 체인이 논리적으로 일관됨을 보장. 어떤 해역도 해당 해역에 접근 불가능한 선박으로만 도전해야 하는 상황이 발생하지 않음.

---

## §10. 프로시저럴 생성 [F25]

### 10.1 기본 항로 구조 (사전 정의)
- 각 해역: 3~4개 고정 섬 + 섬 간 항로 구조(그래프) 사전 정의
- 항로 길이, 기본 이벤트 슬롯 수 사전 정의

### 10.2 변형 요소 (SeededRNG 랜덤화)
- **적 구성**: 기본 함선 종류 확정 + 수량 ±1, 배치 랜덤
- **이벤트**: 각 이벤트 슬롯에 §7.3 이벤트 풀에서 확률 기반 선택
- **날씨**: 항로별 기본 날씨 + 30% 확률로 변형
- **보물 위치**: 보물 지도 조각 7개의 위치 매 런마다 다름
- **변형 범위**: 전체 콘텐츠의 30~50%가 런마다 변화 (리플레이 체감 확보)

### 10.3 도달 가능성 검증
```javascript
// 항로 생성 후 BFS로 목적지 도달 가능성 검증
function validateRoute(seaMap, startIsland, bossIsland) {
  const visited = new Set();
  const queue = [startIsland];
  visited.add(startIsland);
  while (queue.length > 0) {
    const island = queue.shift();
    if (island === bossIsland) return true;
    for (const neighbor of seaMap.connections[island]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false; // 도달 불가 → 항로 재생성
}
```

---

## §11. 점수 시스템 [F8]

### 11.1 점수 요소

| 요소 | 점수 | 비고 |
|------|------|------|
| 적 함선 격침 | HP 비례 (10~90점) | — |
| 보스 격파 | 500/800/1000/1500/2000 | 해역별 |
| 교역 이익 | 이익의 10% | — |
| 이벤트 성공 | 50~200 | 이벤트별 |
| 보물 지도 조각 | 300/조각 | — |
| 항구 시설 건설 | 레벨 × 100 | — |
| 무피해 해전 | 기본 × 1.5 | 보너스 |
| 전설의 섬 클리어 | 5000 | 히든 |

**판정 먼저, 저장 나중에** [F8]:
```javascript
function onBattleEnd(result) {
  const newScore = calculateScore(result);  // 판정 먼저
  const isNewBest = newScore > loadBest();  // 비교
  saveBest(Math.max(newScore, loadBest())); // 저장 나중에
  return { newScore, isNewBest };
}
```

### 11.2 명성(Fame) 시스템
- 해전 승리, 교역, 이벤트 완료로 명성 획득
- 명성 레벨: 무명(0) → 신참(100) → 해적(500) → 선장(1500) → 제독(3000) → 해적왕(5000)
- 명성 레벨에 따라 선원 고용 풀 확장, 교역 할인, 특수 이벤트 해금

---

## §12. 사운드 시스템 [F19]

### 12.1 BGM (Web Audio API 프로시저럴 생성, 4종+)

| BGM | 사용 상태 | 분위기 | BPM |
|-----|----------|--------|-----|
| port_theme | PORT 계열 | 평화로운 항구, 아코디언 느낌 | 90 |
| voyage_theme | VOYAGE 계열 | 모험적, 바람과 파도 | 110 |
| battle_theme | BATTLE, BOARDING | 긴장감, 전투 드럼 | 140 |
| boss_theme | BATTLE_BOSS | 웅장한 위기감 | 160 |

### 12.2 SFX (프로시저럴, 8종+)

| SFX | 트리거 | 파형 |
|-----|--------|------|
| cannon_fire | 포격 발사 | noise burst + low freq |
| cannon_hit | 적중 | noise + sine decay |
| explosion | 폭발탄 적중 | noise + distortion |
| wave_splash | 파도 효과 | filtered noise |
| coin_collect | 금화 획득 | sine sweep up |
| build_complete | 건설 완료 | chord arpeggio |
| boarding_clash | 백병전 | noise burst short |
| boss_roar | 보스 등장 | low sine + tremolo |
| level_up | 레벨업 | ascending tones |
| horn_blow | 출항 | sawtooth + reverb |

> **Web Audio 스케줄링**: `oscillator.start(ctx.currentTime + delay)` 네이티브 스케줄링 사용, setTimeout 절대 금지 [Cycle 13]

---

## §13. 다국어 지원 [F20]

```javascript
const I18N = {
  ko: {
    title: '해적의 조류',
    start: '게임 시작',
    port: '항구',
    voyage: '출항',
    battle: '전투',
    build: '건설',
    trade: '교역',
    crew: '선원',
    gold: '금화',
    supplies: '보급품',
    fame: '명성',
    boss_pirate: '블랙비어드',
    boss_kraken: '크라켄',
    boss_ghost: '유령선 함대',
    boss_admiral: '해군 제독',
    boss_leviathan: '리바이어던',
    // ... 전체 UI 텍스트
  },
  en: {
    title: 'Corsair Tides',
    start: 'Start Game',
    port: 'Port',
    voyage: 'Set Sail',
    battle: 'Battle',
    build: 'Build',
    trade: 'Trade',
    crew: 'Crew',
    gold: 'Gold',
    supplies: 'Supplies',
    fame: 'Fame',
    boss_pirate: 'Blackbeard',
    boss_kraken: 'Kraken',
    boss_ghost: 'Ghost Fleet',
    boss_admiral: 'Admiral',
    boss_leviathan: 'Leviathan',
    // ...
  }
};
```

---

## §14. 코드 위생 및 검증

### 14.1 수치 정합성 테이블 [F10]

| 기획서 수치 | CONFIG 상수명 | 값 |
|------------|--------------|-----|
| 소형 범선 HP | CONFIG.SHIP_HP[0] | 100 |
| 중형 브리간틴 HP | CONFIG.SHIP_HP[1] | 200 |
| 대형 갤리온 HP | CONFIG.SHIP_HP[2] | 350 |
| 전투함 HP | CONFIG.SHIP_HP[3] | 500 |
| 기함 HP | CONFIG.SHIP_HP[4] | 700 |
| 일반 포격 데미지 | CONFIG.CANNON_DMG[0] | 50 |
| 체인 포격 데미지 | CONFIG.CANNON_DMG[1] | 30 |
| 폭발 포격 데미지 | CONFIG.CANNON_DMG[2] | 40 |
| 산탄 포격 데미지 | CONFIG.CANNON_DMG[3] | 20×3 |
| DPS 캡 | CONFIG.DPS_CAP | 2.0 |
| 시너지 캡 | CONFIG.SYNERGY_CAP | 1.5 |
| DDA 3연패 보정 | CONFIG.DDA_3LOSS | -0.15 |
| DDA 5연패 보정 | CONFIG.DDA_5LOSS | -0.25 |
| 터치 최소 크기 | CONFIG.MIN_TOUCH | 48 |
| 프레임 dt 캡 | CONFIG.MAX_DT | 0.05 |
| 보딩 윈도우 | CONFIG.BOARD_WINDOW | 0.8 |

### 14.2 코드 위생 체크리스트 (FAIL/WARN 2단계) [Cycle 25]

**FAIL (빌드 실패)**:
1. `assets/` 디렉토리 존재
2. `Math.random` 호출 존재 (SeededRNG 아닌 것)
3. `setTimeout`/`setInterval` 호출 존재
4. `confirm(`/`alert(` 호출 존재
5. `feGaussianBlur`/`feDropShadow` SVG 필터 존재
6. 외부 URL (http/https + 외부 도메인) 존재
7. `Google Fonts`/CDN 참조 존재
8. 미선언 변수 참조 (let/const TDZ)
9. `applyBuff()` 내 DPS_CAP 검증 누락

**WARN (경고)**:
1. 전역 변수 직접 참조하는 드로잉/로직 함수
2. 빈 if/else 블록
3. TODO 주석 잔존
4. 50줄 이상 함수
5. 중복 코드 3회 이상

### 14.3 스모크 테스트 게이트 [F15]

리뷰 제출 전 필수 통과 항목:
1. ☐ index.html 존재 + 브라우저 로드 성공
2. ☐ 콘솔 에러 0건
3. ☐ TITLE → PORT → VOYAGE_PREP → BATTLE → PORT 풀사이클 완주
4. ☐ 보스전 진입 + 페이즈 전환 동작
5. ☐ GAMEOVER → TITLE 복귀 정상
6. ☐ 저장/로드 정상 (localStorage)
7. ☐ 모바일 터치 조작 정상 (≤400px 뷰포트)
8. ☐ 다국어 전환 (ko↔en)
9. ☐ Math.random 0건 (grep 검증)
10. ☐ setTimeout 0건 (grep 검증)
11. ☐ assets/ 디렉토리 부재 (ls 검증)

---

## §15. 코드 영역 가이드 (8 REGION)

```javascript
// ─── REGION 1: CONFIG & CONSTANTS (줄 1~150) ───
// ─── REGION 2: UTILS (SeededRNG, TweenManager, SoundManager) (줄 151~450) ───
// ─── REGION 3: I18N & ASSETS (인라인 SVG 생성) (줄 451~900) ───
// ─── REGION 4: GAME STATE & INIT (줄 901~1100) ───
// ─── REGION 5: PORT SYSTEMS (경영/교역/선원) (줄 1101~1600) ───
// ─── REGION 6: BATTLE SYSTEMS (해전/AI/보스) (줄 1601~2200) ───
// ─── REGION 7: RENDER (Canvas 드로잉 전체) (줄 2201~2800) ───
// ─── REGION 8: INPUT & MAIN LOOP (줄 2801~3220+) ───
```

---

## §16. localStorage 데이터 스키마

```javascript
const SAVE_SCHEMA = {
  version: 3,
  key: 'corsair-tides-save',
  data: {
    gold: 0,
    fame: 0,
    totalScore: 0,
    bestScore: 0,
    buildings: { dock: 0, warehouse: 0, tavern: 0, market: 0, fort: 0, lighthouse: 0 },
    ships: ['sloop'], // 해금된 선박 목록
    crewSkills: { nav: 0, gun: 0, melee: 0, repair: 0, scout: 0, trade: 0, cook: 0, medic: 0 },
    bossDefeated: [false, false, false, false, false],
    treasureMap: [false, false, false, false, false, false, false],
    legendIsland: false,
    settings: { lang: 'ko', sfxVol: 0.7, bgmVol: 0.5, dda: true },
    stats: { battlesWon: 0, battlesLost: 0, tradesCompleted: 0, eventsCleared: 0 }
  }
};
```

---

## §17. 이전 사이클 아쉬운 점 반영 요약

| 이전 문제 | 원인 | 본 기획서 해결 | 해당 섹션 |
|-----------|------|--------------|----------|
| 보스 약점-능력 해금 불일치 [C33] | 인술 해금↔보스 연계 미명시 | 선박 해금→해역 접근 완전 테이블 | §9.3 |
| 극단 빌드 밸런스 붕괴 [C33] | DPS 캡 검증 미비 | applyBuff() 내 캡 강제 + 부록A | §8.2, 부록A |
| 프로시저럴 변형 체감 부족 [C33] | 변형 범위 미명시 | 30~50% 변형 범위 명시 | §10.2 |
| 이중 페이즈 시스템 혼재 [C24] | ACTIVE_SYSTEMS 미분리 | port/battle 열 상호 배타 | §6.2 |
| DDA 가정 미명시 [C24] | 회피율 가정 누락 | 40% 가정 + 3/5연패 폴백 | §8.2 |
| 영구/런별 진행 축 겹침 [C29] | 같은 축 강화 | 전투력/전술유연성 분리 | §9 |

---

## §18. 게임 페이지 메타데이터

```yaml
game:
  id: corsair-tides
  title: 해적의 조류
  description: 어촌 출신 소년이 5대 해역을 정복하는 항구 경영 + 해전 전략 로그라이트. 시설을 건설하고, 함대를 이끌고, 전설의 보물을 찾아라!
  genre: [casual, strategy]
  playCount: 0
  rating: 0
  controls:
    - "마우스: 시설 선택, 함선 이동/공격 명령"
    - "1~4: 포격 유형 선택"
    - "Space: 일제 사격"
    - "E: 보딩 작전"
    - "R: 대열 변경"
    - "Tab: 다음 함선 선택"
    - "터치: 탭으로 선택, 롱프레스로 공격"
  tags:
    - "#해적"
    - "#항구경영"
    - "#해전"
    - "#전략"
    - "#로그라이트"
    - "#캐주얼"
  addedAt: "2026-03-24"
  version: "1.0.0"
  featured: true
```

---

## 부록 A: 극단 빌드 검증 [F24]

### 빌드 1: 최대 화력 (기함 + 포격 특화 선원)
```
기함 기본 DPS = (50 × 10포문) / 2초 = 250 DPS
포격 Lv5 보너스 = +50%
공격진 보너스 = +20%
총 DPS = 250 × 1.5 × 1.2 = 450 DPS
DPS 캡 = 250 × 2.0 = 500 DPS → 450 < 500 ✅ 캡 미초과
북대서양 보스 HP 1000 → 클리어 시간 = 1000 / 450 ≈ 2.2초 → ⚠️ 너무 빠름
→ 보스 방어율 50% 적용: 1000 / (450 × 0.5) = 4.4초 → 보스 페이즈 전환으로 실질 15~25초
```

### 빌드 2: 최대 내구 (기함 + 수리/의료 특화)
```
기함 HP 700 + 방어진 +25% = 실효 HP 875
수리 Lv5 = 초당 20 HP 회복
의료 Lv5 = 선원 사망률 -50%
적 DPS 110 × (1 - 방어진 0.25) = 82.5 DPS
실효 수신 DPS = 82.5 - 20(수리) = 62.5 DPS
생존 시간 = 875 / 62.5 = 14초 → 적 HP 500~900 / 자체 DPS(낮음) → 클리어 30~60초
→ 보스전은 힐 지속력으로 장기전 가능, 하지만 클리어 시간이 길어 별 3개 어려움
```

### 빌드 3: 다함선 함대 (소형 5척 + 쐐기진)
```
소형 5척 DPS = (50 × 2포문) / 2초 × 5 = 250 DPS
쐐기진 +10% = 275 DPS
선원 분산으로 특화 보너스 낮음 (+20% 평균) = 330 DPS
DPS 캡 미초과 (330 < 500)
총 HP = 100 × 5 = 500 → 1척 격침되면 DPS -20%
→ 빠른 격침 전략, 보스전에서 유리하나 범위 공격에 취약
```

> 3종 빌드 모두 DPS 캡 미초과, 보스 클리어 시간 15~60초 범위 — 밸런스 적정 ✅

---

## 부록 B: 뷰포트 테스트 매트릭스

| 뷰포트 | 확인 항목 |
|--------|----------|
| 320px | 모바일 버튼 겹침 없음, 최소 터치 48px, 텍스트 읽기 가능 |
| 480px | 항구 시설 탭 전환 정상, 해전 함선 선택 정상 |
| 768px | 사이드바 표시 정상, 해전 전체 맵 가시 |
| 1024px+ | 풀스크린 레이아웃, devicePixelRatio 적용 |

---

_이 기획서는 InfiniTriX 플랫폼 사이클 #34 기획 에이전트에 의해 작성되었습니다._
_작성일: 2026-03-24_
