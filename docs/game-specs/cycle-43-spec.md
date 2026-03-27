---
game-id: storm-ronin
title: 스톰 로닌
genre: arcade, action
difficulty: hard
---

# 스톰 로닌 (Storm Ronin) — 사이클 #43 게임 기획서

> **1페이지 요약**: 전국시대 말기, 배신당한 낭인(로닌)이 요괴에 침략당한 5개 성을 돌파하며 복수를 완수하는 **사무라이 불릿헬 로그라이트 아케이드 액션**. 적 탄막을 검으로 반사하여 되돌리는 "참격 반사" 메카닉이 핵심. 스테이지 진입→탄막 돌파(이동+반사+콤보)→보스전(패턴 학습+약점 공략)→보상(검술/유물/업그레이드) 핵심 루프. Cuphead의 보스 패턴 공략 + Vampire Survivors의 로그라이트 빌드 + Sekiro의 반격 쾌감. 5성(구역) × 3스테이지 = 15 메인 + 히든 2개 = **총 17스테이지**. 보스 4종(오니 대장/여우 요괴/용신/[히든] 검성의 환영) + 업그레이드 3축×5단계 + 유물 13종 + DDA 4단계 + 날씨 4종. **arcade+action 10사이클 최장 미사용 해소 + 사무라이 플랫폼 최초 테마.**

> **MVP 경계**: **Phase 1**(핵심 루프: 탄막 반사→적 처치→보상→업그레이드, 성 1~3(풍림성/화산성/수령성) + 보스 2체(오니 대장/여우 요괴) + 업그레이드 Lv1~3 + 유물 9종(일반5+희귀4) + 적 5종 + DDA 4단계 + 날씨 2종(비/벚꽃) + 기본 내러티브 + 다국어(ko/en)) → **Phase 2**(성 4~5(토굴성/천공성) + 보스 2체(용신/검성의 환영) + 히든 2스테이지 + 업그레이드 Lv4~5 + 에픽 유물 4종 + 날씨 4종 전체 + 카메라 줌/팬 연출 + 전체 내러티브 완성). **Phase 1만으로도 완전한 아케이드 액션 경험 제공 필수.**

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
| F12 | TDZ 방지: `_ready` 플래그 + Engine 생성자 콜백 TDZ 확장 방어 [Cycle 39~41 검증] | §5.1 |
| F13 | TweenManager clearImmediate() API 분리 [Cycle 4 B1] | §5.2 |
| F14 | 단일 값 갱신 경로 통일 [Cycle 5 B2] | §5.2 |
| F15 | 스모크 테스트 게이트 [Cycle 22~41] | §14.3 |
| F16 | hitTest() 단일 함수 통합 [Cycle 27] | §3.3 |
| F17 | bossRewardGiven 플래그 패턴 [Cycle 27] | §7.5 |
| F18 | SeededRNG 완전 사용 (Math.random 0건) [Cycle 19~41] | §5.2, §14.3 |
| F19 | 프로시저럴 SFX + BGM (Web Audio API 생성) [Cycle 19~41] | §12 |
| F20 | 다국어 지원 (ko/en) [Cycle 27~41] | §13 |
| F21 | beginTransition 단일 정의 [Cycle 32~41] | §6.1 |
| F22 | Gemini PNG 에셋 manifest.json 기반 로드 [Cycle 39+] | §4.1, §8 |
| F23 | `_ready` 플래그 TDZ 방어 패턴 [Cycle 39~41 실전 검증] | §5.1 |
| F24 | Canvas 폴백 100% 완비 [Cycle 41 검증] | §4.1 |
| F25 | DPS 캡 200% / 시너지 캡 150% [Cycle 26~27, 41] | §7.4, §14.2 |
| F26 | 극단 빌드 사전 검증 (부록 A) [Cycle 30~41] | §14.4 |

### 신규 피드백 (사이클 #42 교훈) 🆕

| ID | 교훈 | 적용 섹션 | 해결 방법 |
|----|------|----------|----------|
| F27 | monkey-patch 확장 구조 → 이벤트 버스 패턴 전환 [Cycle 41 INFO-1, Cycle 42 계승] | §4.3 | EventBus 중앙 이벤트 시스템 — `bus.on('slash', handler)` |
| F28 | Phase 2 미구현 — MVP 과대 설계 [Cycle 41~42] | §1 | Phase 1 = 3성+보스2+유물9, 이것만으로 완전한 루프 |
| F29 | 밸런스 자동 검증 부재 [Cycle 41~42] | §14.4 | 탄막 밀도×반사 윈도우 수식 기반 DPS/생존 검증 |
| F30 | beginTransition 가드 과도 차단 [Cycle 41] | §6.1 | GAMEOVER/VICTORY = priority 10 (항상 전환 가능) |
| F31 | 매치-3→불릿헬 장르 전환: 판정 시스템 차이 대응 | §7.1 | 프레임 단위 반사 윈도우 (±5프레임 Perfect / ±10 Good) |
| F32 | 콤보 시스템 갱신 경로 이중화 방지 [Cycle 5 B2 확장] | §7.2 | comboCount 갱신은 ComboManager.add() 단일 경로만 |

### 이전 사이클 "아쉬웠던 점" 직접 반영 ⚠️

| 아쉬운 점 (cycle-41~42) | 해결 섹션 | 해결 방법 | 검증 기준 |
|-------------------------|----------|----------|----------|
| monkey-patch 확장 구조 유지 (C41 INFO-1) | §4.3 | EventBus 패턴: `bus.on('event', handler)` | monkey-patch grep 0건 |
| Phase 2 미구현 (C41~42) | §1 MVP | Phase 1 = 3성+보스2+업그레이드Lv1~3 | Phase 1만으로 TITLE→PLAY→BOSS→VICTORY 완전 루프 |
| 밸런스 자동 검증 부재 (C41~42) | §14.4 | 탄막 DPS vs 반사 DPS 수식 사전 검증 | 부록 A 극단 빌드 3종 클리어 가능성 수식 증명 |
| beginTransition 과도 차단 (C41) | §6.1 | TRANSITION_TABLE priority 필드 + GAMEOVER 최고 우선 | 모든 상태에서 GAMEOVER 전환 가능 확인 |

### 이전 사이클 "다음 사이클 제안" 반영

| 제안 (cycle-41~42 포스트모템) | 반영 여부 | 적용 섹션 |
|------------------------------|----------|----------|
| monkey-patch → 이벤트 버스/미들웨어 패턴 | ✅ | §4.3 EventBus 중앙 이벤트 시스템 |
| 밸런스 시뮬레이터/사전 검증 | ✅ | §14.4 프레임 단위 DPS 수식 기반 사전 검증 |
| 공용 엔진 모듈 분리 착수 | ⚠️ 부분 | §4.3 EventBus/TweenManager/SeededRNG 코드 내 모듈 패턴 |
| 매치-3 이외 장르 확대 | ✅ | 불릿헬 아케이드 액션으로 장르 전환 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 1.1 컨셉
**스톰 로닌(Storm Ronin)**은 전국시대 말기, 5개 성주에게 배신당한 낭인 '카제(風)'가 요괴에 침략된 성을 차례로 돌파하며 복수와 진실을 찾아가는 **사무라이 불릿헬 로그라이트 아케이드 액션**이다. 적이 발사하는 탄막을 검으로 베어 반사하는 "참격 반사(斬撃反射)" 메카닉이 핵심이며, 완벽한 타이밍의 반사로 콤보를 쌓아 필살기를 발동시키는 쾌감이 게임의 중독 루프를 형성한다.

### 1.2 핵심 재미 요소
1. **참격 반사의 쾌감**: 적 탄막을 정확한 타이밍에 베면 탄이 적에게 돌아간다. 완벽(Perfect) 타이밍 = 2배 반사 데미지 + 화면 슬로모션 + 잔상 이펙트.
2. **콤보 체인의 긴장감**: 10콤보→속도 버프, 25콤보→필살기 게이지 충전, 50콤보→무적 섬광참격. 피격 시 콤보 리셋으로 긴장 유지.
3. **로그라이트 빌드 다양성**: 3축 업그레이드(검술/신체/정신) × 유물 13종 조합으로 매 런마다 다른 전략. 반사 특화, 회피 특화, 필살기 특화 등 다중 경로.
4. **보스 패턴 공략**: 4체 보스 각각 고유 탄막 패턴. 페이즈 전환마다 새로운 공략법 요구. "외워서 이기는" 아케이드 정수.
5. **일본풍 세계관 몰입**: 전국시대+요괴 테마, 수묵화 영감의 비주얼, 벚꽃/비/안개 날씨 연출. 플랫폼 최초 사무라이 세계관.

### 1.3 레퍼런스
- **Cuphead** — 보스 패턴 학습과 반복 도전의 중독성. 아트 스타일의 극강 개성.
- **Sekiro: Shadows Die Twice** — 반격(탄기) 메카닉의 쾌감. 타이밍 기반 전투.
- **Vampire Survivors** — 로그라이트 빌드 시너지, 무기 융합, 런 다양성.
- **Shogun Showdown** — 사무라이 로그라이크의 턴제 전투 → 이를 실시간 아케이드로 변환.

---

## §2. 게임 규칙 및 목표

### 2.1 최종 목표
5개 성을 돌파하여 성주들의 음모를 밝히고, 요괴를 이용한 쿠데타를 저지하여 진정한 검의 도(道)를 깨닫는다.

### 2.2 구역 구성 (MVP Phase 1: 성 1~3)

| 성(구역) | 이름 | 테마 | 스테이지 수 | 보스 | 날씨 |
|---------|------|------|------------|------|------|
| 1 | 풍림성(風林城) | 초원+바람, 튜토리얼 | 3 | — | 벚꽃(힐링) |
| 2 | 화산성(火山城) | 용암+불, 화염 탄막 | 3 | 오니 대장 | 화산재(시야↓) |
| 3 | 수령성(水靈城) | 폭포+얼음, 동결 탄막 | 3 | 여우 요괴 | 비(미끄러움) |
| 4 | 토굴성(土窟城) (Phase 2) | 지하+독, 독안개 탄막 | 3 | 용신 | 안개(시야제한) |
| 5 | 천공성(天空城) (Phase 2) | 하늘+번개, 5속성 혼합 | 3 | [히든] 검성의 환영 | 낙뢰(랜덤 위험) |
| H1 | 요괴의 수련장 (Phase 2) | 히든 | 1 | — | 전속성 |
| H2 | 검성의 시험 (Phase 2) | 히든 | 1 | — | 무 |

### 2.3 스테이지 구조
각 스테이지는 3개 구간(세그먼트)으로 구성:
- **구간 1 (진입)**: 잡적 2~3종, 탄막 밀도 낮음. 콤보 쌓기 연습.
- **구간 2 (격화)**: 잡적 3~4종, 탄막 밀도 중간. 환경 장애물 등장.
- **구간 3 (절정)**: 잡적 4~5종 + 미니보스급 강적. 탄막 밀도 높음.

### 2.4 전투 규칙
- **이동**: 8방향 자유 이동 (아레나형, 횡스크롤 아님)
- **참격 반사**: 검을 휘두르면 전방 120° 부채꼴 범위의 탄막을 반사
  - **Perfect** (±5프레임, ±83ms): 2× 데미지 + 슬로모션 0.3초 + 콤보+2
  - **Good** (±10프레임, ±167ms): 1× 데미지 + 콤보+1
  - **Miss**: 탄에 피격, HP -1, 콤보 리셋
- **회피(대시)**: 짧은 무적 대시 (8프레임 무적, 쿨다운 30프레임)
- **필살기**: 콤보 게이지 100% 충전 시 발동. 화면 전체 참격 (모든 적탄 소멸 + 전 적에게 대데미지)

### 2.5 승리/패배 조건
- **스테이지 승리**: 3구간 모든 적 처치 (또는 생존 시간 충족)
- **스테이지 패배**: HP ≤ 0 → 획득 경험치 50% 보존, 스테이지 재도전
- **보스 승리**: 보스 HP ≤ 0 → 예언 조각 획득 + 에픽 유물 선택지
- **런 종료**: 모든 성 클리어(승리) 또는 3회 연속 패배(게임오버)

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 동작 |
|----|------|
| WASD / 방향키 | 8방향 이동 |
| J / Z | 참격 반사 (검 휘두르기) |
| K / X | 대시 (회피) |
| L / C | 필살기 (게이지 100% 시) |
| Space | 반사 방향 고정 (홀드 시 방향 유지) |
| Tab | 유물 목록 토글 |
| Esc | 일시정지 메뉴 |
| L키 (메뉴) | 언어 전환 (ko ↔ en) |
| M | BGM 음소거 토글 |

### 3.2 마우스
| 입력 | 동작 |
|------|------|
| 마우스 이동 | 반사 방향 조준 (캐릭터→마우스 방향) |
| 좌클릭 | 참격 반사 |
| 우클릭 | 대시 (마우스 방향으로) |
| 휠 클릭 | 필살기 |
| WASD | 이동 (마우스와 병행) |

### 3.3 터치 (모바일)
| 입력 | 동작 |
|------|------|
| 좌측 가상 조이스틱 | 8방향 이동 |
| [참격] 버튼 | 참격 반사 (이동 방향으로) |
| [대시] 버튼 | 대시 (이동 방향으로) |
| [필살] 버튼 | 필살기 (게이지 100% 시) |
| 전체 화면 탭 (전투 외) | UI 버튼 선택 |

**⚠️ 모든 터치 타겟 최소 48×48px**: `Math.max(48, btnSize)` 강제 적용 (F11)

#### 소형 디스플레이 (≤400px) 레이아웃
```
┌─────────────────────────┐
│ HP[■■■■░░] 콤보:12 점수 │ ← 상단 고정
├─────────────────────────┤
│                         │
│    [게임 아레나 영역]     │ ← 전투 필드
│                         │
├─────────────────────────┤
│ (◎)     [참격][대시][필] │ ← 하단: 좌=조이스틱, 우=버튼
│ 조이     48px  48px 48px│    각 버튼 48px 이상
└─────────────────────────┘
```

#### 대형 디스플레이 (>400px) 레이아웃
```
┌─────────────────────────────────┐
│ HP[■■■■■■░░░░] 콤보:25 ★필살기 │
├─────────────────────────────────┤
│ 유물  │                         │
│ 목록  │   [게임 아레나 영역]     │
│ (좌측)│                         │
│       │                         │
├───────┴─────────────────────────┤
│ (◎)조이    [참격]  [대시]  [필] │
└─────────────────────────────────┘
```

---

## §4. 시각적 스타일 가이드

### 4.1 기술 제약
- **Canvas 해상도**: 풀스크린 + `devicePixelRatio` + 동적 리사이즈
- **에셋**: Gemini API PNG 에셋 + manifest.json 기반 동적 로드 (F1, F22)
- **Canvas 폴백**: 모든 렌더 함수에 `if (!img) { drawFallback(ctx, ...); }` (F24)
- **외부 CDN/폰트**: 0건 (F2)
- **alert/confirm**: 0건 → Canvas 기반 모달 (F3)

### 4.2 색상 팔레트
| 용도 | 색상 코드 | 설명 |
|------|----------|------|
| 배경 (밤하늘) | `#0a0a1a` | 깊은 밤의 일본 하늘 |
| 벚꽃 핑크 | `#ffb7c5` | 벚꽃잎, 힐링 이펙트 |
| 선혈 빨강 | `#cc2222` | 참격 이펙트, 적 피격 |
| 황금 | `#ffd700` | 콤보 카운터, UI 강조 |
| 수묵 검정 | `#1a1a2e` | 캐릭터 윤곽, 검 |
| 강철 회색 | `#8899aa` | 적 탄막, 검날 |
| 요괴 보라 | `#6c3cf7` | 요괴 에너지, 보스 탄막 |
| 바람 청록 | `#00d4ff` | 바람 이펙트, 대시 잔상 |
| 불 주황 | `#ff6b35` | 화산성 탄막, 불 이펙트 |
| 얼음 파랑 | `#66ccff` | 수령성 탄막, 동결 이펙트 |
| 독 녹색 | `#44cc44` | 토굴성 탄막, 독 이펙트 |

### 4.3 아키텍처 패턴 — EventBus (F27 해결)

monkey-patch 확장 대신 **이벤트 버스 패턴**으로 시스템 간 통신:

```javascript
// EventBus 패턴 (monkey-patch 대체)
const bus = {
  _handlers: {},
  on(event, fn) { (this._handlers[event] ||= []).push(fn); },
  off(event, fn) {
    const arr = this._handlers[event];
    if (arr) this._handlers[event] = arr.filter(h => h !== fn);
  },
  emit(event, data) { (this._handlers[event] || []).forEach(fn => fn(data)); }
};

// 사용 예시 — 시스템 간 결합도 0
bus.on('slash', ({ perfect, dir }) => { /* BulletManager: 반사 처리 */ });
bus.on('slash', ({ perfect, dir }) => { /* SoundManager: 참격음 재생 */ });
bus.on('slash', ({ perfect, dir }) => { /* ParticleManager: 참격 이펙트 */ });
bus.on('combo', ({ count }) => { /* ComboManager: UI 업데이트 */ });
bus.on('combo', ({ count }) => { /* CameraManager: 셰이크 */ });
```

**검증**: `grep "origFn\|_orig\|monkey" index.html` → 0건

### 4.4 순수 함수 패턴 (F9)
모든 렌더/로직 함수는 파라미터를 통해 데이터를 받는 순수 함수:
```javascript
function renderRonin(ctx, x, y, size, pose, slashFrame, img) { ... }
function calcReflectDamage(baseDmg, timing, upgradeLevel, relicBonuses) { ... }
function spawnBulletPattern(rng, patternId, difficulty, bulletPool) { ... }
```

---

## §4.5. 아트 디렉션 (Art Direction)

### 아트 스타일 키워드
**"Sengoku Ink Wash — Dark Ukiyo-e meets Neon Slash"**

전통 일본 수묵화(墨絵)의 거친 붓 터치와 우키요에 판화 스타일을 기반으로, 참격과 탄막에는 네온 발광 이펙트를 적용한 대비 스타일. 배경은 어둡고 차분한 수묵 톤, 캐릭터와 이펙트는 선명한 색감으로 시각적 계층을 분리.

### 레퍼런스 게임
1. **Shogun Showdown** (Roboatino) — 사무라이 픽셀아트의 양식화된 캐릭터, 일본 건축 배경
2. **Katana ZERO** (Askiisoft) — 어두운 톤 + 네온 참격 이펙트의 대비, 슬로모션 액션

### 에셋 통일 원칙
- 모든 에셋은 "dark ink wash + neon slash" 아트 디렉션을 따름
- 캐릭터/적은 수묵화 스타일 윤곽 + 단색 채색 (셀 셰이딩에 가까운 2~3톤)
- 배경은 레이어드 수묵 (원경=연한 먹/중경=중간 먹/근경=진한 먹)
- 탄막/이펙트는 네온 발광 (glow 효과)
- UI는 일본 전통 목재 프레임 + 먹 글씨 스타일

---

## §5. 핵심 게임 루프

### 5.1 Engine 초기화 (F12, F23)

```javascript
// _ready 플래그 TDZ 방어 (검증된 패턴)
class Engine {
  constructor(canvas) {
    this._ready = false;
    this.bus = bus;
    this.rng = new SeededRNG(Date.now());
    this.tweenMgr = new TweenManager();
    this.bulletPool = new ObjectPool(Bullet, 200);
    this.particleMgr = new ParticleManager();
    this.comboMgr = new ComboManager(this.bus);
    this.soundMgr = new SoundManager();
    // ... 나머지 초기화 ...
    this.onResize = () => {
      if (!this._ready) return;
      // resize 로직
    };
    window.addEventListener('resize', this.onResize);
    this._ready = true;
  }
}
```

### INIT_EMPTY 패턴 — 전역 객체 초기값 테이블 (Cycle 32 교훈)

| 객체 | 초기값 | 용도 |
|------|--------|------|
| `G.player` | `{ x:0, y:0, hp:5, maxHp:5, combo:0, gauge:0, dashing:false, slashing:false }` | 플레이어 상태 |
| `G.bullets` | `[]` | 활성 탄막 배열 |
| `G.enemies` | `[]` | 활성 적 배열 |
| `G.relics` | `[]` | 획득 유물 목록 |
| `G.upgrades` | `{ sword:0, body:0, mind:0 }` | 업그레이드 레벨 |
| `G.score` | `0` | 현재 런 점수 |
| `G.stage` | `{ castle:0, segment:0 }` | 현재 진행 위치 |
| `G.weather` | `null` | 현재 날씨 효과 |

### 5.2 프레임 루프 (60fps 기준)

```
매 프레임 (requestAnimationFrame + delta time):
  1. deltaTime = (now - lastTime) / 1000; lastTime = now;
  2. tweenMgr.update(deltaTime);            // 항상 업데이트
  3. particleMgr.update(deltaTime);         // 항상 업데이트
  4. soundMgr.update(deltaTime);            // 항상 업데이트
  5. switch(state) {
       TITLE:       updateTitle(dt);       break;
       MAP:         updateMap(dt);         break;
       STAGE:       updateStage(dt);       break;
       BOSS:        updateBoss(dt);        break;
       REWARD:      updateReward(dt);      break;
       UPGRADE:     updateUpgrade(dt);     break;
       GAMEOVER:    updateGameOver(dt);    break;
       VICTORY:     updateVictory(dt);     break;
       PAUSED:      /* render only */      break;
     }
  6. render(state, dt);
  7. bus.emit('frame', { dt, state });
```

**핵심 규칙**:
- `setTimeout` 0건 → `tweenMgr.add({ onComplete })` 전용 (F4)
- 가드 플래그로 tween 콜백 1회 보장: `if (this._transitioning) return;` (F5)
- `clearImmediate()` API로 cancelAll/add 경쟁 조건 방지 (F13)
- 단일 값(combo, gauge 등) 갱신 경로 1개로 통일 (F14, F32)
- `Math.random()` 0건 → `rng.next()` 전용 (F18)

### 5.3 코드 영역 가이드 (REGION)

| REGION | 영역 | 줄번호 범위 (추정) | 의존 |
|--------|------|-------------------|------|
| R1 | 상수/설정 (CONFIG, TRANSITION_TABLE, LANG) | 1~200 | — |
| R2 | 유틸리티 (SeededRNG, TweenManager, EventBus, ObjectPool) | 201~500 | R1 |
| R3 | 에셋 로딩 + Canvas 폴백 | 501~650 | R1, R2 |
| R4 | 입력 시스템 (키보드/마우스/터치, hitTest) | 651~850 | R1, R2 |
| R5 | 탄막 시스템 (BulletManager, 반사 로직, 패턴 생성기) | 851~1300 | R1, R2 |
| R6 | 전투 시스템 (적 AI, 보스 AI, 콤보, 필살기) | 1301~2000 | R1~R5 |
| R7 | 진행 시스템 (업그레이드, 유물, DDA) | 2001~2400 | R1, R2 |
| R8 | 사운드 시스템 (Web Audio API, BGM, SFX) | 2401~2700 | R1, R2 |
| R9 | 렌더링 (배경, 캐릭터, UI, 날씨, 파티클) | 2701~3500 | R1~R8 |
| R10 | 상태 머신 + 메인 루프 + 초기화 | 3501~4000+ | R1~R9 |

---

## §6. 상태 머신

### 6.1 TRANSITION_TABLE (F6, F21, F30)

```javascript
const TRANSITION_TABLE = {
  TITLE:    { targets: ['MAP'],                         priority: 0 },
  MAP:      { targets: ['STAGE', 'UPGRADE', 'BOSS', 'TITLE'], priority: 1 },
  STAGE:    { targets: ['REWARD', 'BOSS', 'GAMEOVER'],  priority: 3 },
  BOSS:     { targets: ['REWARD', 'GAMEOVER'],          priority: 4 },
  REWARD:   { targets: ['MAP', 'UPGRADE'],              priority: 2 },
  UPGRADE:  { targets: ['MAP'],                         priority: 1 },
  GAMEOVER: { targets: ['TITLE'],                       priority: 10 }, // 최고 우선순위
  VICTORY:  { targets: ['TITLE'],                       priority: 10 },
  PAUSED:   { targets: ['*_PREV'],                      priority: 5 },
};

function beginTransition(from, to) {
  if (from === to) return false;
  const entry = TRANSITION_TABLE[from];
  if (!entry || !entry.targets.includes(to)) {
    if (to === 'GAMEOVER' || to === 'VICTORY') { /* 항상 허용 */ }
    else { console.error(`Invalid transition: ${from}→${to}`); return false; }
  }
  if (_transitioning) return false;
  _transitioning = true;
  // fade-out → enterState(to) → fade-in → _transitioning = false
}
```

### 6.2 상태 × 시스템 매트릭스 (F7)

| 상태 | Tween | Particle | Sound | Bullet | EnemyAI | BossAI | Combo | Input모드 | Weather | Narrative |
|------|-------|----------|-------|--------|---------|--------|-------|----------|---------|-----------|
| TITLE | ✅ | ✅ bg | ✅ bgm | — | — | — | — | menu | — | — |
| MAP | ✅ | ✅ bg | ✅ bgm | — | — | — | — | map | ✅ | ✅ dialog |
| STAGE | ✅ | ✅ full | ✅ battle | ✅ | ✅ | — | ✅ | game | ✅ | — |
| BOSS | ✅ | ✅ full | ✅ boss | ✅ boss | — | ✅ | ✅ | game | ✅ boss | ✅ cutscene |
| REWARD | ✅ | ✅ | ✅ fanfare | — | — | — | — | menu | — | ✅ reward |
| UPGRADE | ✅ | ✅ | ✅ bgm | — | — | — | — | menu | — | — |
| GAMEOVER | ✅ | ✅ | ✅ defeat | — | — | — | — | menu | — | — |
| VICTORY | ✅ | ✅ | ✅ fanfare | — | — | — | — | menu | — | ✅ ending |
| PAUSED | ✅ | — | — muted | — | — | — | — | pause | — | — |

### 6.3 Input 모드 세분화 (Cycle 26 교훈)

| Input 모드 | 허용 입력 |
|-----------|----------|
| menu | 클릭/탭: 버튼, 키: Enter/Esc/L/M |
| map | 클릭/탭: 성 노드, 키: WASD(맵 스크롤)/Enter/Esc/L/M |
| game | 키: WASD+J+K+L, 마우스: 조준+클릭, 터치: 조이스틱+버튼 |
| pause | 클릭/탭: 메뉴 버튼, 키: Esc(복귀)/L/M |

### 6.4 Canvas 기반 모달 (F3)
모든 확인/취소 UI는 Canvas 오버레이로 구현. `alert()`/`confirm()` 사용 0건.

---

## §7. 전투 시스템 (불릿헬 엔진)

### 7.1 참격 반사 시스템

#### 7.1.1 반사 판정 (프레임 단위)
```
참격 키 입력 시:
  1. slashActive = true, slashFrame = 0
  2. 10프레임(167ms) 동안 전방 120° 부채꼴 영역 활성
  3. 부채꼴 내 적탄 검출 (hitTest 단일 함수, F16):
     - 탄과 검 중심 거리 < SLASH_RADIUS (80px)
     - 탄의 각도가 플레이어 향 ±60° 이내
  4. 판정:
     - 입력 후 0~5프레임: PERFECT (±83ms)
     - 입력 후 6~10프레임: GOOD (±167ms)
  5. PERFECT 반사:
     - 탄 속도 반전 × 2배
     - bus.emit('slash', { perfect: true, dir, bullet })
     - comboMgr.add(2)  // 콤보 +2 (단일 경로, F32)
     - 슬로모션 0.3초 (timeScale = 0.3)
  6. GOOD 반사:
     - 탄 속도 반전 × 1배
     - comboMgr.add(1)  // 콤보 +1
  7. slashFrame > 10 → slashActive = false
```

#### 7.1.2 탄막 패턴 생성기 (SeededRNG)
```javascript
const PATTERNS = {
  RADIAL_8:  (rng, cx, cy, spd) => { /* 8방향 원형 */ },
  SPIRAL:    (rng, cx, cy, spd, rotSpd) => { /* 나선형 */ },
  AIMED:     (rng, cx, cy, spd, targetX, targetY) => { /* 조준탄 */ },
  RANDOM:    (rng, cx, cy, spd, count) => { /* 랜덤 산탄 */ },
  WAVE:      (rng, cx, cy, spd, amplitude) => { /* 사인파 */ },
};
// 모든 패턴은 SeededRNG 기반, Math.random 0건
```

### 7.2 콤보 시스템 (F14, F32)

**콤보 갱신은 ComboManager.add() 단일 경로만 사용:**
```javascript
class ComboManager {
  constructor(bus) {
    this.count = 0;
    this.timer = 0;
    this.bus = bus;
  }
  add(n) {
    this.count += n;
    this.timer = COMBO_TIMEOUT; // 3초
    this.bus.emit('combo', { count: this.count });
    // 임계값 체크
    if (this.count >= 50 && !this._ultraTriggered) {
      this._ultraTriggered = true;
      this.bus.emit('ultra_ready');
    }
    if (this.count >= 25) this.bus.emit('gauge_charge', { amount: 5 });
    if (this.count >= 10) this.bus.emit('speed_buff');
  }
  update(dt) {
    this.timer -= dt;
    if (this.timer <= 0 && this.count > 0) {
      this.count = 0;
      this._ultraTriggered = false;
      this.bus.emit('combo', { count: 0 });
    }
  }
}
```

**검증**: `grep "comboCount\|combo =" index.html` → ComboManager.add() 호출만 존재해야 함

### 7.3 적 종류

| 적 | 등장 성 | 탄막 패턴 | HP | 속도 |
|----|---------|----------|-----|------|
| 잡귀(雑鬼) | 1~5 | AIMED (단발 조준) | 1 | 2 |
| 화염귀(火炎鬼) | 2~5 | RADIAL_8 (8방향) | 2 | 1.5 |
| 빙결귀(氷結鬼) | 3~5 | WAVE (사인파) | 2 | 1 |
| 독무귀(毒霧鬼) | 4~5 | RANDOM (산탄) | 3 | 1 |
| 뇌신귀(雷神鬼) | 5 | SPIRAL (나선) | 3 | 2.5 |

### 7.4 유물 시스템 (F25)

13종 유물, DPS 캡 200% / 시너지 캡 150% 적용:

| 등급 | 유물 | 효과 | 캡 영향 |
|------|------|------|---------|
| 일반 | 철 츠바(鍔) | 반사 데미지 +20% | DPS |
| 일반 | 초가 샌들 | 이동속도 +15% | — |
| 일반 | 치유의 부적 | 스테이지 클리어 시 HP +1 | — |
| 일반 | 연기 구슬 | 대시 쿨다운 -20% | — |
| 일반 | 콤보 주먹밥 | 콤보 타임아웃 +1.5초 | — |
| 희귀 | 뇌신의 인장 | Perfect 반사 시 주변 3적에게 연쇄 번개 | DPS |
| 희귀 | 여우 면(面) | 피격 시 30% 확률로 회피 (SeededRNG) | — |
| 희귀 | 용의 비늘 | 최대 HP +2, 반사 범위 +30° | DPS |
| 희귀 | 검성의 서 | 필살기 데미지 +50%, 게이지 충전 +25% | DPS |
| 에픽 | 오니의 뿔 (Phase 2) | 모든 반사탄 관통 + 2체 추가 피격 | DPS |
| 에픽 | 분신의 술 (Phase 2) | 참격 시 분신 1체가 동시 참격 | DPS |
| 에픽 | 시간의 모래 (Phase 2) | 상시 15% 슬로모션 + Perfect 윈도우 2배 | — |
| 에픽 | 불사의 불꽃 (Phase 2) | HP 0 시 1회 부활 (런당 1회) | — |

**캡 검증 로직**: `applyRelic()` 내에서 현재 DPS 배율 확인 → 200% 초과 시 해당 유물 선택지에서 제외 (F25)

### 7.5 보스전

#### 보스 1: 오니 대장 (화산성)
```
[페이즈 1] HP 100%~60%:
  - RADIAL_8 탄막 (3초 간격)
  - 돌진 공격 (경고선 표시 후 1초 뒤 돌진)
  약점: 돌진 직후 2초간 경직 → 반사탄 집중

[페이즈 2] HP 60%~30%:
  - RADIAL_8 + AIMED 복합 (2초 간격)
  - 지면 화염파 (하단 1/3 영역 화염)
  약점: 화염파 발동 시 상체 무방비 → Perfect 반사

[페이즈 3] HP 30%~0%:
  - 광폭화: 탄막 밀도 2배, 이동속도 1.5배
  - SPIRAL 탄막 추가
  약점: 20콤보 이상 달성 시 눈 부위 약점 노출 (3초간)
```

**보스 보상 가드**: `bossRewardGiven` 플래그로 1회만 지급 (F17)

#### 보스 2: 여우 요괴 (수령성)
```
[페이즈 1] HP 100%~50%:
  - 환술 분신 3체 (진짜는 1체, 나머지 투명도 약간 낮음)
  - 각 분신 AIMED 탄막
  약점: 진짜 여우에게 반사탄 명중 시 분신 소멸

[페이즈 2] HP 50%~0%:
  - 환술 분신 5체 + 빙결 WAVE 탄막
  - 분신 이동 패턴 복잡화 (원형 회전)
  약점: 연속 5회 Perfect 반사로 환술 해제 → 10초간 본체 노출
```

#### 보스 3: 용신 (Phase 2, 토굴성~천공성)
```
[페이즈 1] 5속성 순환 탄막 (풍→화→수→토→뇌)
[페이즈 2] 동시 2속성 탄막 + 아레나 축소
[페이즈 3] 전 속성 동시 + 필살기 강제 사용 구간
```

#### 히든 보스: 검성의 환영 (Phase 2)
```
플레이어 행동 패턴 복제 — 미러 매치
반사탄을 '다시 반사'하는 AI
```

---

## §8. 에셋 요구 사항 (Asset Requirements)

```yaml
# asset-requirements
art-style: "Sengoku Ink Wash — 전통 일본 수묵화 기반 다크톤 + 네온 참격 이펙트"
color-palette: "#0a0a1a, #ffb7c5, #cc2222, #ffd700, #6c3cf7, #00d4ff, #ff6b35"
mood: "긴장감 넘치는 어둠 속 화려한 검섬광, 전국시대의 비장함과 요괴의 신비로움"
reference: "Katana ZERO 어두운 톤 + Shogun Showdown 사무라이 양식화 + Sekiro 참격 쾌감"

assets:
  - id: player-idle
    desc: "로닌 카제 — 정면 대기 포즈. 해진 검은 기모노, 한 손에 카타나, 바람에 휘날리는 머리카락. 수묵화 윤곽 + 차가운 파란 눈. 단호한 표정."
    size: "512x512"

  - id: player-slash
    desc: "로닌 카제 — 참격 포즈. 카타나를 전방으로 크게 휘두르는 동작. 검 궤적에 붉은 잔상(선혈 빨강 #cc2222). 역동적 자세."
    size: "512x512"

  - id: player-dash
    desc: "로닌 카제 — 대시 포즈. 저자세 돌진, 잔상이 청록(#00d4ff) 빛으로 남는 순간. 몸이 약간 투명해지는 느낌."
    size: "512x512"

  - id: enemy-zako
    desc: "잡귀(雑鬼) — 작고 동글한 외눈 요괴. 보라색(#6c3cf7) 몸체, 한 개의 큰 노란 눈, 작은 뿔. 수묵화 스타일 윤곽."
    size: "512x512"

  - id: enemy-fire
    desc: "화염귀(火炎鬼) — 불꽃으로 이루어진 중형 요괴. 주황-빨강(#ff6b35) 몸체, 화산암 갑옷 파편, 이글거리는 눈. 수묵 윤곽."
    size: "512x512"

  - id: enemy-ice
    desc: "빙결귀(氷結鬼) — 얼음 결정 형태의 요괴. 파란(#66ccff) 투명 몸체, 날카로운 얼음 가시, 차가운 안개가 피어오름."
    size: "512x512"

  - id: boss-oni
    desc: "오니 대장 — 거대한 붉은 오니(도깨비). 근육질 몸체, 두 개의 큰 뿔, 거대한 철퇴, 이글거리는 금색 눈. 화산 용암 배경. 위압적이고 분노에 찬 표정. 보스 등장 컷신용 대형 이미지."
    size: "800x600"

  - id: boss-fox
    desc: "여우 요괴(구미호) — 9개의 꼬리를 가진 은빛 여우 요괴. 우아하고 신비로운 자태, 보라 빛나는 눈, 주변에 환술의 보라색 불꽃. 폭포와 달빛 배경."
    size: "800x600"

  - id: bg-field
    desc: "풍림성 배경 — 바람에 흔들리는 초원, 벚꽃잎이 날리는 전국시대 들판. 먼 산 실루엣, 일본식 성곽 그림자. 수묵화 톤의 은은한 색감."
    size: "1920x1080"

  - id: bg-volcano
    desc: "화산성 배경 — 용암이 흐르는 화산 내부. 붉은-주황 조명, 암석 기둥, 연기와 화산재. 어둡고 위험한 분위기."
    size: "1920x1080"

  - id: bg-waterfall
    desc: "수령성 배경 — 거대한 폭포 앞 얼음 동굴. 파란-청록 조명, 고드름, 안개. 신비롭고 차가운 분위기."
    size: "1920x1080"

  - id: effect-slash
    desc: "참격 이펙트 — 카타나 궤적의 붉은-흰 호(arc) 형태 이펙트. 수묵 붓 터치 스타일. 중앙이 밝고 가장자리가 어두운 그라데이션."
    size: "512x512"

  - id: effect-perfect
    desc: "Perfect 반사 이펙트 — 금색(#ffd700) 원형 충격파 + 벚꽃잎 파티클. 눈부신 섬광. 중앙에 한자 '斬' 실루엣."
    size: "512x512"

  - id: effect-combo
    desc: "콤보 달성 이펙트 — 불꽃과 바람이 소용돌이치는 원형 오라. 10콤보=청록, 25콤보=금색, 50콤보=무지개."
    size: "512x512"

  - id: item-relic
    desc: "유물 아이콘 — 빛나는 고대 일본 유물 (부적/인장/구슬). 금색 테두리, 신비로운 보라 빛. 둥근 프레임."
    size: "256x256"

  - id: ui-hp
    desc: "체력 아이콘 — 일본식 사쿠라(벚꽃) 형태의 하트. 분홍(#ffb7c5). 꽃잎이 줄어들며 HP 감소 표현."
    size: "128x128"

  - id: ui-combo
    desc: "콤보 카운터 프레임 — 먹으로 쓴 숫자를 감싸는 원형 프레임. 금색 테두리. 일본 전통 문양 장식."
    size: "256x256"

  - id: ui-gauge
    desc: "필살기 게이지 — 세로 카타나 형태의 게이지 바. 빈 상태=회색, 충전=빨강에서 금색으로 그라데이션."
    size: "128x512"

  - id: thumbnail
    desc: "게임 대표 이미지 — 로닌 카제가 카타나를 휘두르며 적탄을 반사하는 역동적 장면. 배경에 벚꽃과 일본 성곽 실루엣. 화면을 가로지르는 붉은 참격선. 상단에 '스톰 로닌' 먹 글씨 타이틀. 수묵화+네온 하이브리드 스타일."
    size: "800x600"
```

---

## §9. 난이도 시스템

### 9.1 시간/진행에 따른 변화

| 성(구역) | 탄막 밀도 (탄/초) | 탄 속도 (px/s) | 적 HP 배율 | 적 등장 간격 (s) |
|---------|------------------|---------------|-----------|-----------------|
| 풍림성 (1) | 2~4 | 120~160 | 1.0× | 3.0 |
| 화산성 (2) | 4~8 | 160~200 | 1.3× | 2.5 |
| 수령성 (3) | 6~12 | 180~240 | 1.6× | 2.0 |
| 토굴성 (4) | 8~16 | 200~280 | 2.0× | 1.5 |
| 천공성 (5) | 10~20 | 240~320 | 2.5× | 1.0 |

### 9.2 DDA 4단계 (동적 난이도 보정)

| DDA 레벨 | 조건 (최근 3스테이지) | 탄막 밀도 | 탄 속도 | 보상 배율 | 반사 윈도우 |
|---------|---------------------|----------|---------|----------|-----------|
| 0 (표준) | 사망 0~1회 | 100% | 100% | 100% | ±5F/±10F |
| 1 (약간 쉬움) | 사망 2~3회 | 80% | 90% | 110% | ±6F/±12F |
| 2 (쉬움) | 사망 4~5회 | 60% | 80% | 120% | ±7F/±14F |
| 3 (매우 쉬움) | 사망 6회+ | 50% | 70% | 130% | ±8F/±16F |

**DDA 폴백 (Cycle 24 교훈)**: DDA는 숨겨진 파라미터로 적용 — 플레이어에게 "쉬워졌다"는 인상을 주지 않음. 대신 "위험 경고 이펙트"의 표시 시간을 늘려 정보를 더 제공하는 방식 (Cycle 35/38 레이지 게임 교훈 적용).

### 9.3 난이도 곡선 수식

```
탄막밀도(stage) = BASE_DENSITY × (1 + (stage - 1) × 0.15) × DDA_MULT
탄속도(stage) = BASE_SPEED × (1 + (stage - 1) × 0.08) × DDA_MULT
적HP(stage) = BASE_HP × (1 + (castle - 1) × 0.3) × DDA_MULT

여기서:
  stage = 1~15 (전체 스테이지 순번)
  castle = 1~5 (성 번호)
  DDA_MULT = [1.0, 0.8, 0.6, 0.5][ddaLevel]
```

---

## §10. 진행 시스템

### 10.1 업그레이드 트리 (3축 × 5단계)

| 축 | Lv1 | Lv2 | Lv3 | Lv4 (Phase2) | Lv5 (Phase2) |
|----|-----|-----|-----|-------------|-------------|
| 검술(劍) | 반사 데미지 +10% | 반사 범위 120°→140° | Perfect 슬로모 0.3→0.5초 | 반사탄 관통 1체 | 연속 반사 (탄→적→적) |
| 신체(體) | 이동속도 +10% | HP +1 (5→6) | 대시 무적 8→12F | HP +2 (6→8) | 피격 시 반격파 발동 |
| 정신(心) | 콤보 타임아웃 3→4초 | 필살기 게이지 충전 +20% | 50콤보 필살기 자동 강화 | 콤보 피격 면역 1회 | 콤보 100 = 2차 필살기 |

**비용**: Lv1=100G, Lv2=250G, Lv3=500G, Lv4=1000G, Lv5=2000G

### 10.2 맵 구조 (성별 진행)

```
[풍림성] → [화산성] → [수령성] → [토굴성] → [천공성]
  S1-S3     S4-S6+B1   S7-S9+B2   S10-S12+B3  S13-S15+B4
                                     ↓ 조건: 전 성 클리어
                                   [히든1] [히든2]
```

**잠금 해제 조건**:
- 화산성: 풍림성 S1~S3 클리어
- 수령성: 화산성 S4~S6+오니대장 격파
- 토굴성 (Phase 2): 수령성 S7~S9+여우요괴 격파
- 천공성 (Phase 2): 토굴성 클리어+용신 격파
- 히든: 전 성 클리어 + 유물 10종 이상 수집

---

## §11. 점수 시스템

### 11.1 점수 계산 (F8: 판정 먼저, 저장 나중에)

| 행동 | 기본 점수 | 콤보 배율 |
|------|----------|----------|
| 적 처치 (반사킬) | 100 | × (1 + combo × 0.1) |
| Perfect 반사 | 50 | × (1 + combo × 0.1) |
| Good 반사 | 20 | × (1 + combo × 0.05) |
| 스테이지 클리어 | 500 | × (1 + 잔여HP × 0.2) |
| 보스 격파 | 2000 | × (1 + 잔여HP × 0.5) |
| 노대미지 보너스 | 1000 | — |

```javascript
// 판정 먼저, 저장 나중에 (F8)
function onStageComplete() {
  const isNewBest = score > bestScore;    // 1. 판정
  bestScore = Math.max(score, bestScore); // 2. 저장
  if (isNewBest) bus.emit('new_best');
}
```

### 11.2 화폐 (골드)

| 행동 | 골드 |
|------|------|
| 잡적 처치 | 5~10 (SeededRNG) |
| Perfect 반사 | 3 |
| 스테이지 클리어 | 50 × 스테이지 번호 |
| 보스 격파 | 300 |
| DDA 보상 배율 | ×1.0~1.3 |

---

## §12. 사운드 시스템 (Web Audio API, F19)

| ID | 효과음 | 생성 방법 |
|----|--------|----------|
| sfx-slash | 참격 (날카로운 금속음) | 사각파 → 하이패스 → 빠른 디케이 |
| sfx-perfect | Perfect 반사 (맑은 종소리) | 사인파 고음 → 리버브 → 느린 디케이 |
| sfx-reflect | 탄막 반사 (팅 소리) | 삼각파 → 짧은 디케이 |
| sfx-hit | 피격 (둔탁한 타격) | 노이즈 → 로우패스 → 짧은 디케이 |
| sfx-combo-10 | 10콤보 (기합소리) | 사인파 상승 글리산도 |
| sfx-combo-25 | 25콤보 (검명) | 사각파 진동 → 리버브 |
| sfx-boss-intro | 보스 등장 (북소리) | 노이즈+사인파 저음 → 느린 어택 |
| sfx-ultimate | 필살기 (폭발적 에너지) | 화이트노이즈 + 사인파 상승 |
| bgm-field | 풍림성 BGM (차분한 일본풍) | 펜타토닉 스케일 사인파 루프 |
| bgm-battle | 전투 BGM (긴장감) | 빠른 박자 사각파 + 저음 드럼 |
| bgm-boss | 보스전 BGM (웅장) | 저음 현 + 북 패턴 + 피치 상승 |

---

## §13. 다국어 지원 (F20)

```javascript
const LANG = {
  ko: {
    title: '스톰 로닌',
    subtitle: '사무라이 불릿헬 로그라이트',
    start: '시작하기',
    slash: '참격',
    dash: '회피',
    ultimate: '필살기',
    combo: '콤보',
    perfect: '완벽!',
    good: '좋음',
    miss: '빗나감',
    stage_clear: '구간 돌파!',
    boss_appear: '보스 출현!',
    game_over: '패배...',
    victory: '승리!',
    upgrade: '강화',
    sword: '검술',
    body: '신체',
    mind: '정신',
    relic: '유물',
    castle_names: ['풍림성', '화산성', '수령성', '토굴성', '천공성'],
    pause: '일시정지',
    resume: '계속하기',
    quit: '나가기',
    settings: '설정',
    lang_toggle: '언어: 한국어',
  },
  en: {
    title: 'Storm Ronin',
    subtitle: 'Samurai Bullet-Hell Roguelite',
    start: 'Start',
    slash: 'Slash',
    dash: 'Dash',
    ultimate: 'Ultimate',
    combo: 'Combo',
    perfect: 'Perfect!',
    good: 'Good',
    miss: 'Miss',
    stage_clear: 'Stage Clear!',
    boss_appear: 'Boss Incoming!',
    game_over: 'Defeated...',
    victory: 'Victory!',
    upgrade: 'Upgrade',
    sword: 'Swordsmanship',
    body: 'Physique',
    mind: 'Spirit',
    relic: 'Relic',
    castle_names: ['Wind Field', 'Volcano', 'Water Spirit', 'Earth Cavern', 'Sky Keep'],
    pause: 'Paused',
    resume: 'Resume',
    quit: 'Quit',
    settings: 'Settings',
    lang_toggle: 'Lang: English',
  }
};
```

---

## §14. 코드 위생 및 검증

### 14.1 수치 정합성 테이블 (F10)

| 기획서 값 | CONFIG 상수 | 값 |
|----------|------------|-----|
| Perfect 윈도우 ±5F | `PERFECT_WINDOW` | 5 |
| Good 윈도우 ±10F | `GOOD_WINDOW` | 10 |
| 참격 지속 10F | `SLASH_DURATION` | 10 |
| 반사 범위 120° | `SLASH_ARC` | 120 |
| 반사 반경 80px | `SLASH_RADIUS` | 80 |
| 대시 무적 8F | `DASH_INVULN` | 8 |
| 대시 쿨다운 30F | `DASH_COOLDOWN` | 30 |
| 콤보 타임아웃 3초 | `COMBO_TIMEOUT` | 3 |
| 슬로모션 0.3초 | `SLOW_DURATION` | 0.3 |
| DPS 캡 200% | `DPS_CAP` | 2.0 |
| 시너지 캡 150% | `SYNERGY_CAP` | 1.5 |

### 14.2 코드 위생 체크리스트

| # | 체크 항목 | 검증 방법 | FAIL/WARN |
|---|----------|----------|-----------|
| 1 | `Math.random` 0건 | `grep "Math.random" index.html` | FAIL |
| 2 | `setTimeout` 0건 | `grep "setTimeout" index.html` | FAIL |
| 3 | `alert\|confirm\|prompt` 0건 | `grep "alert\|confirm\|prompt" index.html` | FAIL |
| 4 | `monkey\|origFn\|_orig` 0건 | `grep "origFn\|_orig\|monkey" index.html` | FAIL |
| 5 | 외부 CDN/폰트 0건 | `grep "http\|googleapis\|cdn" index.html` | FAIL |
| 6 | `comboCount` 직접 대입 0건 | `grep "comboCount\s*[+\-]?=" index.html` → ComboManager.add()만 | FAIL |
| 7 | `applyRelic()` 내 캡 검증 존재 | `grep "DPS_CAP\|SYNERGY_CAP" index.html` | FAIL |
| 8 | TRANSITION_TABLE 참조 확인 | `grep "TRANSITION_TABLE" index.html` → beginTransition에서 참조 | FAIL |
| 9 | `_ready` 플래그 존재 | `grep "_ready" index.html` | FAIL |
| 10 | Canvas 폴백 함수 존재 | `grep "drawFallback" index.html` | WARN |
| 11 | 터치 타겟 48px | `grep "Math.max(48" index.html` | WARN |
| 12 | SeededRNG 클래스 존재 | `grep "class SeededRNG" index.html` | FAIL |
| 13 | EventBus 존재 | `grep "bus.on\|bus.emit" index.html` | FAIL |

### 14.3 스모크 테스트 게이트 (F15)

| # | 게이트 | 검증 방법 | FAIL/WARN |
|---|--------|----------|-----------|
| 1 | index.html 존재 | 파일 확인 | FAIL |
| 2 | 브라우저 로드 시 크래시 없음 | 콘솔 에러 0건 | FAIL |
| 3 | TITLE 화면 표시 | 시작 버튼 렌더 확인 | FAIL |
| 4 | TITLE→MAP 전환 | 시작 클릭 후 맵 표시 | FAIL |
| 5 | MAP→STAGE 전환 | 성 노드 클릭 후 스테이지 진입 | FAIL |
| 6 | 참격 반사 동작 | J키 입력 후 탄 반사 확인 | FAIL |
| 7 | 적 처치 시 점수 증가 | 반사킬 후 점수 UI 확인 | FAIL |
| 8 | 콤보 카운터 동작 | 연속 반사 시 콤보 증가 | FAIL |
| 9 | HP 0 → GAMEOVER | 피격 반복 후 게임오버 화면 | FAIL |
| 10 | GAMEOVER→TITLE | 게임오버에서 타이틀 복귀 | FAIL |
| 11 | 보스 등장 및 전투 | 보스 스테이지 진입 후 보스 패턴 확인 | FAIL |
| 12 | 보스 격파 → 보상 | 보스 HP 0 후 유물 선택지 표시 | FAIL |
| 13 | 업그레이드 적용 | 검술 Lv1 구매 후 데미지 변화 확인 | WARN |
| 14 | 모바일 터치 동작 | 조이스틱+버튼 탭 응답 | WARN |
| 15 | BGM 재생 | 게임 시작 후 오디오 출력 | WARN |
| 16 | 다국어 전환 | L키 입력 후 텍스트 변경 | WARN |
| 17 | manifest.json 기반 에셋 로드 | 에셋 이미지 정상 표시 | FAIL |
| 18 | DDA 동작 | 3회 사망 후 탄막 밀도 감소 | WARN |
| 19 | 유물 캡 검증 | DPS 200% 초과 유물 선택지 제외 | WARN |

### 14.4 밸런스 사전 검증 (F29, 부록 A)

#### 반사 윈도우 vs 탄막 밀도 분석

```
가정:
  - 플레이어 반응 시간: 200ms (일반), 150ms (숙련), 100ms (고수)
  - Perfect 윈도우: ±83ms (5F @60fps)
  - Good 윈도우: ±167ms (10F @60fps)

풍림성 (탄 2~4개/초):
  - 반사 가능 시간: 10F = 167ms (참격 활성)
  - 탄간 간격: 250~500ms
  - 결론: 충분한 여유 → 튜토리얼 적합

수령성 (탄 6~12개/초):
  - 탄간 간격: 83~167ms
  - 결론: Perfect 연속은 어렵지만 Good은 가능 → 중간 난이도

DDA Lv2 보정 시 수령성:
  - 탄 3.6~7.2개/초, 속도 80%
  - 탄간 간격: 139~278ms
  - 결론: 초보자도 Good 반사 가능
```

#### 극단 빌드 검증 (3종)

**빌드 A: 반사 특화 (검술 집중)**
- 검술 Lv3 + 철 츠바 + 뇌신 인장 + 용의 비늘
- DPS 배율: 1.0 × 1.1(Lv1) × 1.2(철 츠바) × 1.3(뇌신) × 1.3(용의 비늘) = **2.23× → 캡 2.0×**
- 보스2(여우 요괴 HP 500) 클리어 턴: 500 / (100 × 2.0 × 1.5 콤보평균) = **~1.7분** ✅

**빌드 B: 생존 특화 (신체 집중)**
- 신체 Lv3 + 여우 면 + 치유 부적 + 초가 샌들
- DPS 배율: 1.0× (기본)
- 보스2 클리어 턴: 500 / (100 × 1.0 × 1.3 콤보평균) = **~3.8분** ✅ (HP 6 + 30% 회피로 장기전 가능)

**빌드 C: 필살기 특화 (정신 집중)**
- 정신 Lv3 + 검성의 서 + 콤보 주먹밥
- DPS 배율: 1.0× (기본) + 필살기 50% 강화
- 보스2 클리어 턴: 필살기 3회 사용 가정 → **~2.5분** ✅

---

## §15. 날씨/시간 시스템

| 날씨 | 등장 성 | 시각 효과 | 게임플레이 효과 |
|------|---------|----------|---------------|
| 벚꽃 | 풍림성 | 분홍 파티클 낙하 | 스테이지 시작 시 HP +1 회복 |
| 화산재 | 화산성 | 회색 파티클 + 시야 반경 축소 | 화면 가장자리 어두움 (시야 80%) |
| 비 | 수령성 | 파란 줄무늬 + 물결 이펙트 | 이동속도 -10%, 대시 거리 +20% (미끄러짐) |
| 안개 (Phase 2) | 토굴성 | 흰 안개 레이어 + 시야 50% | 적 위치 불투명 (가까이 가야 보임) |

---

## §16. 내러티브 시스템

### 스토리 요약
1. **프롤로그 (TITLE)**: 카제는 풍림성 성주의 검객이었다. 어느 날 성주에게 배신당해 절벽에서 떨어지지만 생존. 복수를 다짐한다.
2. **풍림성 (성 1)**: 폐허가 된 고향에서 요괴들의 침략을 목격. 옛 스승의 유물을 회수.
3. **화산성 (성 2)**: 오니 대장이 지배. "성주들이 요괴를 불러들인 것"이라는 단서 발견.
4. **수령성 (성 3)**: 여우 요괴가 환술로 마을을 지배. 진실: 5성주가 요괴와 거래, 불사의 힘을 얻으려 함.
5. **토굴성 (Phase 2)**: 용신의 영역. 카제의 스승이 사실은 검성의 환영이었음을 깨달음.
6. **천공성 (Phase 2)**: 최종 결전. 검의 도란 "모든 것을 베는 것"이 아니라 "지켜야 할 것을 지키는 것"임을 깨달음.

### 내러티브 표시 방법
- **스테이지 진입 시**: 상단에 세로 먹 글씨로 1줄 대사 (2초간 표시 후 페이드)
- **보스전 전**: 화면 어둡게 + 보스 실루엣 등장 + 대사 2줄 (Canvas 텍스트)
- **보스 격파 후**: 예언 조각 이미지 + 스토리 요약 1~2줄

---

## §17. localStorage 데이터 스키마

```javascript
const SAVE_SCHEMA = {
  version: 1,
  bestScore: 0,
  bestCombo: 0,
  totalRuns: 0,
  totalKills: 0,
  upgrades: { sword: 0, body: 0, mind: 0 },
  gold: 0,
  relicsFound: [],      // 발견한 유물 ID 목록
  castlesCleared: [],    // 클리어한 성 번호 목록
  bossesDefeated: [],    // 격파한 보스 목록
  hiddenUnlocked: false,
  lang: 'ko',
  bgmMuted: false,
  sfxMuted: false,
};
```

---

## §18. 이전 사이클 아쉬운 점 반영 요약

| 아쉬운 점 | 출처 | 해결 섹션 | 해결 방법 | 검증 기준 |
|----------|------|----------|----------|----------|
| monkey-patch 확장 구조 | C41 | §4.3 | EventBus 패턴 | `grep "origFn\|_orig\|monkey" → 0건` |
| Phase 2 미구현 | C41~42 | §1 MVP | 3성+보스2 = Phase 1 완전 루프 | TITLE→STAGE→BOSS→VICTORY 플로우 확인 |
| 밸런스 자동 검증 부재 | C41~42 | §14.4 | 반사 윈도우 수식 + 극단 빌드 3종 | 부록 A 모든 빌드 클리어 가능 |
| beginTransition 과도 차단 | C41 | §6.1 | priority 10 = GAMEOVER/VICTORY 항상 허용 | 모든 상태에서 GAMEOVER 도달 테스트 |
| 매치-3 단일 장르 고착 | C42 | §1, §7 | 불릿헬 아케이드 액션으로 장르 전환 | 아케이드 실시간 전투 동작 확인 |
| 콤보 이중 갱신 위험 (C5 B2) | C5 | §7.2 | ComboManager.add() 단일 경로 | `grep "comboCount\s*=" → add()만` |

---

## 부록 A: 극단 빌드 밸런스 시트

### 전제 조건
- 60fps, Perfect 반사 데미지 = baseDmg × 2 × upgradeMult × relicMult
- 보스1(오니) HP = 400, 보스2(여우) HP = 500
- 스테이지당 평균 적 40체, 평균 콤보 15

### 빌드별 보스2 클리어 예상 시간

| 빌드 | DPS (반사/초) | 유효 DPS (캡 적용) | 보스2 클리어 시간 | 판정 |
|------|-------------|-------------------|-----------------|------|
| A 반사특화 | 300 | 300 (캡 이하) | ~100초 | ✅ 적정 |
| B 생존특화 | 130 | 130 | ~230초 | ✅ 장기전 (HP 여유) |
| C 필살특화 | 160 + 필살300×3 | 1060 총합 | ~150초 | ✅ 적정 |

**결론**: 3빌드 모두 보스2 클리어 가능, 최소 100초~최대 230초 범위로 밸런스 균형.

---

## 게임 페이지 사이드바 정보

```yaml
game:
  title: "스톰 로닌"
  description: "전국시대 사무라이의 복수극! 적 탄막을 검으로 반사하고 콤보를 쌓아 필살기를 발동시키는 불릿헬 로그라이트 액션."
  genre: ["arcade", "action"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/방향키: 이동"
    - "J/Z: 참격 반사"
    - "K/X: 대시 (회피)"
    - "L/C: 필살기"
    - "터치: 가상 조이스틱 + 버튼"
  tags:
    - "#사무라이"
    - "#불릿헬"
    - "#로그라이트"
    - "#탄막반사"
    - "#보스전"
    - "#전국시대"
    - "#아케이드"
  addedAt: "2026-03-26"
  version: "1.0.0"
  featured: true
```
