---
game-id: shadow-shinobi
title: 그림자 닌자
genre: arcade, action
difficulty: hard
---

# 그림자 닌자 (Shadow Shinobi) — 사이클 #33 게임 기획서

> **1페이지 요약**: 요괴왕 오니마루에게 멸망한 카게무라 닌자 마을의 유일한 생존자 카게(影)가 그림자 인술을 익혀 5개 성을 탈환하는 **로그라이크 액션 플랫포머**. 5성(城) × 3층 = 15 기본 스테이지 + 보스 5종 + 히든 스테이지 3개 = **총 23 스테이지**. 벽타기·대시·수리검·인술 4종 전투 + 절벽/함정 회피 + 보스 패턴 공략. 인술 스킬 트리(4계열 × 5단계), 닌자 도구 12종, 비전서 수집(40+ 항목). 적 배치·함정 변형 SeededRNG 랜덤 생성 + 3가지 닌자 유파 빌드 경로로 높은 리플레이 가치. **arcade+action 조합으로 9사이클 연속 서로 다른 장르 조합 달성(#25~#33)**. 플랫폼 최초 닌자/사무라이 테마, 수묵화 Canvas 비주얼 신규 도입.

> **MVP 경계**: Phase 1(핵심 루프: 이동→전투→보스 공략, 성 1~2 + 보스 2체 + 기본 인술 4종 + 도구 6종 + 스킬 트리 Lv1~3) → Phase 2(성 3~5 + 보스 3체 + 히든 3개 + 전체 내러티브 + 인술 진화 + 도구 6종 추가 + 비전서 도감). **Phase 1만으로도 완전한 게임 경험 제공 필수.**

---

## §0. 피드백 매핑 (이전 사이클 교훈)

### 검증 완료 패턴 (platform-wisdom 참조) ✅
> 아래 항목은 16~32사이클 이상 검증되어 platform-wisdom.md에 상세 기술됨. 본 기획서에서는 **적용 섹션만 표기**한다.

| ID | 교훈 요약 | 적용 섹션 |
|----|----------|----------|
| F1 | assets/ 디렉토리 절대 생성 금지 — 16사이클 연속 성공 [Cycle 1~32] | §4.1 |
| F2 | 외부 CDN/폰트 0건 [Cycle 1] | §4.1 |
| F3 | iframe 환경 confirm/alert 금지 → Canvas 모달 [Cycle 1] | §6.4 |
| F4 | setTimeout 0건 → tween onComplete 전용 [Cycle 1~2] | §5.2 |
| F5 | 가드 플래그로 tween 콜백 1회 실행 보장 [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition 체계 [Cycle 3 B2] | §6.1 |
| F7 | 상태×시스템 매트릭스 필수 [Cycle 2 B1] | §6.2 |
| F8 | 판정 먼저, 저장 나중에 [Cycle 2 B4] | §11.1 |
| F9 | 순수 함수 패턴 (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | 수치 정합성 테이블 (기획=코드 1:1) [Cycle 7] | §14.1 |
| F11 | 터치 타겟 최소 48×48px + Math.max 강제 [Cycle 12~32] | §3.3 |
| F12 | TDZ 방지: INIT_EMPTY 패턴 — 빈 객체 초기화 → init()에서 채우기 [Cycle 5~32] | §5.1 |
| F13 | TweenManager clearImmediate() API 분리 [Cycle 4 B1] | §5.2 |
| F14 | 단일 값 갱신 경로 통일 (tween vs 직접 대입) [Cycle 5 B2] | §5.2 |
| F15 | 스모크 테스트 게이트 [Cycle 22~32] | §14.3 |
| F16 | hitTest() 단일 함수 통합 [Cycle 27] | §3.3 |
| F17 | bossRewardGiven 플래그 패턴 [Cycle 27] | §7.5 |
| F18 | SeededRNG 완전 사용 (Math.random 0건) [Cycle 19~32] | §5.2, §14.3 |
| F19 | `gt` 파라미터 네이밍 (draw 함수 시그니처) [Cycle 29] | §4.4 |
| F20 | beginTransition 단일 정의 + transProxy 패턴 [Cycle 32] | §6.1 |

### 신규 피드백 (Cycle 32 포스트모템 기반) 🆕

| ID | 교훈 | 해결책 | 적용 섹션 |
|----|------|--------|----------|
| F91 | 3차 리뷰까지 소요 — orphaned SVG 8개 + beginTransition 이중 정의 + RESTART_ALLOWED 데드코드 | 프리 리뷰 자동 게이트에 **orphaned 에셋 검출 + 데드코드 검출** 추가. 에셋 0건 정책 강화 | §14.3 |
| F92 | 밸런스 미검증 — 5구역×3사건×3능력×8도구×DDA 조합 공간 과대 | 전투 밸런스를 **ATK/DEF/SPD 3축 + 보스 HP 스케일링**으로 축소. 극단 빌드 3종 사전 검증 (부록 A) | §8, 부록 A |
| F93 | 공용 엔진 미분리 32사이클째 | 10 REGION 구조 유지 + 각 REGION export 함수 목록을 §5.3에 명시. 의존 방향 단방향 다이어그램 포함 | §5.3 |
| F94 | 소형 디스플레이(320px) 심층 검증 미완 | 5단계 뷰포트 매트릭스(320/375/400/768/1024px) + 320px 전용 모바일 레이아웃 ASCII 명시 | §3.3, §14.4 |

### 이전 사이클 아쉬운 점 → 본 기획 해결 매핑

| Cycle 32 아쉬운 점 | 해결 섹션 | 해결 방법 | 검증 기준 |
|-------------------|----------|----------|----------|
| 3차 리뷰 소요 (orphaned SVG) | §14.3 | 19항목 스모크 테스트 게이트 + orphaned 파일 자동 검출 | 2라운드 이내 APPROVED |
| 밸런스 미검증 (조합 공간 과대) | §8, 부록 A | 전투 3축(ATK/DEF/SPD) + 극단 빌드 3종 사전 검증 | 보스 클리어 시간 30~120초 범위 |
| 공용 엔진 미분리 | §5.3 | 10 REGION + export 함수 목록 + 의존 방향 다이어그램 | 순환 참조 0건 |
| 소형 디스플레이 미완 | §3.3, §14.4 | 5단계 뷰포트 매트릭스 + 320px 전용 ASCII 레이아웃 | 320px 버튼 겹침 0건 |

### 다음 사이클 제안 반영 (Cycle 32 포스트모템)

| 제안 | 반영 여부 | 적용 섹션 |
|------|----------|----------|
| 공용 엔진 모듈 추출 착수 | ⚠️ 단일 파일 유지, REGION export 명시로 추출 준비 | §5.3 |
| 프리 리뷰 자동 게이트 확장 | ✅ 19항목으로 확장 (orphaned 파일 + 데드코드 + 밸런스 산식) | §14.3 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 1.1 컨셉
그림자 닌자(Shadow Shinobi)는 요괴왕 오니마루에게 멸망한 카게무라 닌자 마을의 유일한 생존자 **카게(影)**가 그림자 인술을 수련하며 5개 성을 차례로 탈환하는 **로그라이크 액션 플랫포머**다. 플레이어는 벽타기·대시·수리검·인술을 활용하여 함정과 요괴를 돌파하고, 각 성의 보스 요괴를 패턴 공략으로 물리친다.

핵심 차별점은 **"닌자 기동성 × 그림자 인술 × 로그라이크 빌드"**의 3축 시스템이다. Level Devil식 트랩 플랫포밍의 긴장감에 닌자 테마의 벽타기·은신·분신 메커닉을 결합하고, 매 런마다 달라지는 적 배치·함정·보상으로 리플레이 가치를 극대화한다.

### 1.2 핵심 재미 3축
1. **닌자 기동성 (Ninja Mobility)**: 벽타기(Wall Run), 천장 매달리기(Ceiling Hang), 대시(Shadow Dash), 2단 점프로 복잡한 지형을 자유롭게 이동. 속도감과 정밀 조작의 쾌감.
2. **그림자 인술 (Shadow Jutsu)**: 그림자 분신(Shadow Clone), 그림자 도약(Shadow Leap), 그림자 칼날(Shadow Blade), 그림자 은신(Shadow Veil) 4종. 전투와 탐색 양면에서 활용.
3. **로그라이크 빌드 (Roguelike Build)**: 3가지 닌자 유파(풍림화산 중 풍·림·화) 빌드 경로. 매 런마다 무작위 보상 선택지로 다른 전략 경로.

### 1.3 스토리
> _전국시대 어둠 속, 카게무라 닌자 마을은 요괴왕 오니마루의 군세에 의해 하룻밤에 멸망한다. 유일한 생존자 카게는 전설의 닌자 스승 겐류(幻龍)에게서 그림자 인술의 비밀을 전수받고, 오니마루가 점령한 5개 성을 하나씩 탈환해 나간다. 각 성에는 오니마루의 부하 요괴가 성주로 군림하고 있다. 카게는 복수가 아닌 평화를 위해 싸우며, 히든 루트에서는 요괴와 인간의 공존이라는 진정한 결말에 도달할 수 있다._

---

## §2. 게임 규칙 및 목표

### 2.1 메인 목표
- 5개 성(각 3층)을 순서대로 클리어하여 요괴왕 오니마루를 물리친다
- 각 성의 3층을 돌파하면 성주 보스전 진입
- 히든 스테이지 3개에서 비전서 수집 시 평화 엔딩 해금

### 2.2 서브 목표
- 비전서 40종 수집 (도감 완성)
- 인술 스킬 트리 4계열 마스터
- 닌자 도구 12종 해금
- 3가지 유파 빌드로 각각 클리어 (리플레이)

### 2.3 생명 시스템
- HP 100 (기본) + 방어구 보너스
- 피격 시 무적 시간 1.5초 (10프레임 깜빡임)
- HP 0 → 사망 → 런 종료 (획득 경험치의 50% 보존)
- 부활 아이템 "비전의 두루마리" — 런 중 1회 사용 가능

### 2.4 전투 수치 기본
| 파라미터 | 기본값 | 스케일링 |
|---------|--------|---------|
| 카게 ATK | 10 | +2/성 (스킬 트리 보너스 별도) |
| 카게 DEF | 5 | +1/성 |
| 카게 SPD | 1.0 | 유파별 ±0.2 |
| 수리검 DMG | 8 | ATK × 0.8 |
| 대시 무적 | 0.3초 | 스킬 Lv에 따라 +0.1초 |
| 인술 쿨다운 | 5초 기본 | 스킬 Lv에 따라 -0.5초 |

---

## §3. 조작 방법

### 3.1 키보드 조작
| 키 | 동작 |
|----|------|
| ← → | 좌우 이동 |
| ↑ / Space | 점프 (공중 1회 추가 = 2단 점프) |
| ↓ | 하단 플랫폼 통과 / 웅크리기 |
| Z | 수리검 투척 (진행 방향) |
| X | 대시 (진행 방향, 0.3초 무적) |
| C | 인술 사용 (현재 장착 인술) |
| A / S | 인술 전환 (좌/우 사이클) |
| Shift | 벽타기 (벽 접촉 시 유지) |
| Enter | 상호작용 / 대화 확인 |
| Esc | 일시정지 메뉴 |

### 3.2 마우스 조작
| 입력 | 동작 |
|------|------|
| 좌클릭 | 수리검 투척 (클릭 방향) |
| 우클릭 | 대시 (클릭 방향) |
| 마우스 휠 | 인술 전환 |

### 3.3 터치/모바일 조작
```
┌─────────────────────────────────┐
│           게임 화면              │
│                                 │
│ [PAUSE]                 [JUTSU] │
│                                 │
│                                 │
│                                 │
│ ┌───┐                  [SHUR]  │
│ │JOY│                  [DASH]  │
│ │STK│                  [JUMP]  │
│ └───┘                          │
└─────────────────────────────────┘
```

| 터치 입력 | 동작 |
|----------|------|
| 가상 조이스틱 (좌측 하단) | 이동 (8방향) |
| JUMP 버튼 (우측 하단) | 점프 / 2단 점프 |
| DASH 버튼 (우측 중단) | 대시 |
| SHUR 버튼 (우측 상단) | 수리검 투척 |
| JUTSU 버튼 (우측 최상단) | 인술 사용 |
| 화면 상단 스와이프 | 인술 전환 |
| PAUSE 버튼 (좌측 상단) | 일시정지 |
| 더블탭 (NPC 근처) | 상호작용 |

**터치 타겟 규격**: 모든 버튼 최소 48×48px, `Math.max(48, computedSize)` 강제 적용.

#### 320px 소형 디스플레이 레이아웃
```
┌───────────────────┐
│ [P]         [JUT] │
│                   │
│                   │
│ ┌──┐       [SH]  │
│ │JS│       [DA]  │
│ └──┘       [JU]  │
└───────────────────┘
버튼: 48×48px, 간격 4px
조이스틱: 80×80px
```

---

## §4. 시각적 스타일 가이드

### 4.1 에셋 정책
- **assets/ 디렉토리 절대 생성 금지** (F1, 17사이클 연속 목표)
- **외부 CDN/폰트 0건** (F2)
- 모든 그래픽 = 순수 Canvas 드로잉 (프로시저럴)
- thumbnail.svg + manifest.json만 허용

### 4.2 색상 팔레트 (수묵화 스타일)
| 이름 | HEX | 용도 |
|------|-----|------|
| 먹색 (Sumi Black) | `#1A1A2E` | 배경, 윤곽선 |
| 담묵 (Light Ink) | `#2D2D4A` | 배경 레이어 2 |
| 주홍 (Vermillion) | `#E74C3C` | 카게 스카프, 피격 효과, 적 공격 |
| 남색 (Indigo) | `#2E4057` | 그림자 인술 기본색 |
| 금색 (Gold) | `#F1C40F` | UI 강조, 보상, 비전서 |
| 벚꽃 (Sakura) | `#FFB7C5` | 힐링, 히든 스테이지 |
| 에테르 블루 (Ether Blue) | `#00B4D8` | 그림자 분신, 마나 |
| 요괴 자주 (Yokai Purple) | `#7B2D8E` | 요괴 에너지, 보스 오라 |
| 눈백색 (Snow White) | `#F0F0F0` | 눈, 텍스트, 하이라이트 |
| 이끼 (Moss Green) | `#2D5016` | 숲 배경, 자연 요소 |
| 불꽃 (Flame Orange) | `#FF6B35` | 불 속성 공격, 화산 성 |

### 4.3 배경 스타일
- 수묵화 풍 다층 패럴랙스 (3~4 레이어)
- 성별 테마: ① 바람의 성(구름·절벽) ② 숲의 성(대나무·안개) ③ 불의 성(화산·용암) ④ 물의 성(폭포·빙결) ⑤ 어둠의 성(공허·보라)
- 날씨 효과: 비(성1), 안개(성2), 화산재(성3), 눈(성4), 에테르 입자(성5)
- 시간대: 각 성 층별로 새벽→낮→밤 변화

### 4.4 드로잉 함수 표준 시그니처
```javascript
// 순수 함수 패턴: 전역 변수 직접 참조 0건
function drawKage(ctx, x, y, size, facing, frame, state, gt) { ... }
function drawEnemy(ctx, x, y, type, hp, frame, gt) { ... }
function drawBoss(ctx, x, y, bossId, phase, hp, frame, gt) { ... }
function drawTerrain(ctx, x, y, w, h, type, gt) { ... }
function drawParticle(ctx, x, y, type, alpha, gt) { ... }
function drawUI(ctx, uiState, gt) { ... }
```

### 4.5 캐릭터 스프라이트 사양
- **카게**: 8방향 이동(4방향 × 미러링) × 4프레임 = 32포즈
  - IDLE(2프레임), RUN(4프레임), JUMP(2프레임), FALL(1프레임), WALL(2프레임), DASH(3프레임), ATTACK(3프레임), JUTSU(4프레임), HIT(2프레임), DEATH(4프레임)
- **잡졸 요괴 6종**: 각 4프레임 (IDLE/MOVE/ATTACK/DEATH)
- **보스 요괴 5종**: 각 12프레임+ (IDLE/MOVE/ATTACK×3/PHASE_SHIFT/DEATH)

### 4.6 SVG 에셋 사양 (Canvas 드로잉으로 구현)
| 에셋 | 용도 | 복잡도 |
|------|------|--------|
| 카게 8포즈 | 주인공 | 400×400, 8~12개 path |
| 잡졸 요괴 6종 | 일반 적 | 300×300, 6~8개 path |
| 보스 5종 | 성주 보스 | 600×400+, 15~20개 path |
| 환경 오브젝트 4종 | 파괴 가능/인터랙티브 | 200×200, 4~6개 path |
| UI 아이콘 5종 | HP바/인술/도구/미니맵/비전서 | 100×100, 3~5개 path |
| **합계: 28개** | 목표 20~25개 + α | filter 체인 없음 |

---

## §5. 핵심 게임 루프 (초당 프레임 기준 로직 흐름)

### 5.1 INIT_EMPTY 패턴 — 전역 객체 초기값 테이블

```javascript
// 선언 시점에 빈 구조 초기화 (TDZ 원천 차단 — F12)
const G = {
  state: 'BOOT', phase: 0, lang: 'ko',
  player: { x: 0, y: 0, vx: 0, vy: 0, hp: 100, maxHp: 100, atk: 10, def: 5, spd: 1.0,
            facing: 1, frame: 0, animState: 'IDLE', jutsu: 0, jCool: [0,0,0,0],
            onGround: false, onWall: false, dashTimer: 0, invTimer: 0 },
  camera: { x: 0, y: 0, zoom: 1, shakeX: 0, shakeY: 0 },
  level: { castle: 0, floor: 0, tiles: [], enemies: [], items: [], traps: [], spawn: {x:0,y:0} },
  boss: { id: -1, hp: 0, maxHp: 0, phase: 0, pattern: 0, timer: 0 },
  run: { score: 0, time: 0, kills: 0, collected: [], school: -1 },
  persist: { xp: 0, skills: {}, tools: [], codex: [], bestScore: 0 },
  ui: { modal: null, toast: [], shake: 0, transition: null },
  input: { keys: {}, touch: null, mouse: null },
  rng: null, tw: null, pool: null, snd: null, scroll: null
};
```

### 5.2 메인 게임 루프 (60fps)

```
매 프레임 (16.67ms):
  1. dt 계산 (캡: 33.3ms, 저사양 보호)
  2. G.input 갱신 (키보드/터치/마우스 통합)
  3. if (ACTIVE_SYSTEMS[G.state].tween) → G.tw.update(dt)
  4. if (ACTIVE_SYSTEMS[G.state].physics) → updatePhysics(G, dt)
  5. if (ACTIVE_SYSTEMS[G.state].ai) → updateEnemies(G, dt)
  6. if (ACTIVE_SYSTEMS[G.state].combat) → updateCombat(G, dt)
  7. if (ACTIVE_SYSTEMS[G.state].trap) → updateTraps(G, dt)
  8. if (ACTIVE_SYSTEMS[G.state].particle) → G.pool.update(dt)
  9. if (ACTIVE_SYSTEMS[G.state].camera) → updateCamera(G, dt)
  10. if (ACTIVE_SYSTEMS[G.state].dda) → updateDDA(G, dt)
  11. render(ctx, G, timestamp)  // 항상 실행
  12. G.ui.toast 정리 (만료된 토스트 제거)
```

**핵심 규칙**:
- setTimeout 0건 → 모든 지연 전환은 tween onComplete (F4)
- tween 콜백에 가드 플래그 필수 (F5): `if (guard) return; guard = true;`
- 단일 변수 갱신 경로 통일 (F14): 하나의 값에 tween과 직접 대입 공존 금지
- SeededRNG 완전 사용 (F18): `G.rng = new SeededRNG(seed)`, Math.random 0건
- TweenManager clearImmediate() API 포함 (F13)

### 5.3 10 REGION 코드 구조 + Export 함수 목록

```
// ─── 의존 방향 (단방향, 순환 참조 0건) ───
// R1(Config/Util) ← R2(Engine) ← R3(State)
// R1 ← R4(Entity) ← R5(Level)
// R2 ← R6(Render) ← R7(UI)
// R3 + R6 ← R8(Game)
// R1 ← R9(Sound)
// R8 + R9 ← R10(Main/Init)

R1: CONFIG/UTIL — SeededRNG, clamp, lerp, hitTest, PALETTE, GAME_CONFIG
R2: ENGINE — TweenManager, ObjectPool, InputManager, ScrollManager
R3: STATE — 상태 머신, ACTIVE_SYSTEMS, beginTransition, STATE_PRIORITY
R4: ENTITY — Player(카게), Enemy(요괴), Boss, Projectile, Trap
R5: LEVEL — LevelGenerator, TileMap, CastleConfig, 도달 가능성 BFS 검증
R6: RENDER — drawKage, drawEnemy, drawBoss, drawTerrain, drawParticle, drawWeather
R7: UI — drawHUD, drawModal, drawMenu, drawSkillTree, drawCodex, drawMinimap
R8: GAME — gameLoop, updatePhysics, updateCombat, updateAI, updateDDA
R9: SOUND — SoundManager (프로시저럴 SFX + BGM)
R10: MAIN — init(), resizeCanvas(), 이벤트 바인딩, 언어 설정
```

---

## §6. 상태 머신

### 6.1 전체 상태 목록 (20개)

```
BOOT → TITLE → SCHOOL_SELECT → CASTLE_MAP → FLOOR_INTRO → PLAYING →
BOSS_INTRO → BOSS_FIGHT → BOSS_VICTORY → FLOOR_CLEAR →
CASTLE_CLEAR → SKILL_TREE → SHOP → CODEX → CUTSCENE →
PAUSE → CONFIRM_MODAL → GAME_OVER → ENDING → HIDDEN_STAGE
```

**STATE_PRIORITY** (높을수록 우선):
```javascript
const STATE_PRIORITY = {
  GAME_OVER: 100, ENDING: 90, BOSS_VICTORY: 80, CONFIRM_MODAL: 70,
  CUTSCENE: 60, BOSS_INTRO: 55, FLOOR_INTRO: 50, PAUSE: 40,
  BOSS_FIGHT: 30, HIDDEN_STAGE: 25, PLAYING: 20,
  SKILL_TREE: 15, SHOP: 15, CODEX: 15,
  FLOOR_CLEAR: 10, CASTLE_CLEAR: 10, CASTLE_MAP: 5,
  SCHOOL_SELECT: 3, TITLE: 2, BOOT: 1
};
```

**beginTransition 단일 정의** (F6, F20):
```javascript
function beginTransition(fromState, toState, effect = 'fade', duration = 500) {
  if (STATE_PRIORITY[toState] < STATE_PRIORITY[G.state] && G.state !== fromState) return;
  if (G.ui.transition) return; // 중복 전환 방지
  G.ui.transition = { from: fromState, to: toState, effect, progress: 0 };
  G.tw.add(G.ui.transition, 'progress', 0, 1, duration, () => {
    enterState(toState);
    G.ui.transition = null;
  });
}
```

**ESCAPE_ALLOWED**:
```javascript
const ESCAPE_ALLOWED = {
  PLAYING: 'PAUSE', BOSS_FIGHT: 'PAUSE', HIDDEN_STAGE: 'PAUSE',
  PAUSE: '_RESUME', SKILL_TREE: 'CASTLE_MAP', SHOP: 'CASTLE_MAP',
  CODEX: '_BACK', CONFIRM_MODAL: '_CANCEL', CASTLE_MAP: 'TITLE',
  SCHOOL_SELECT: 'TITLE'
};
```

### 6.2 상태 × 시스템 매트릭스 (20×12)

| 상태 | Tween | Physics | AI | Combat | Trap | Particle | Camera | DDA | Input | Sound | Render | Save |
|------|-------|---------|-----|--------|------|----------|--------|-----|-------|-------|--------|------|
| BOOT | — | — | — | — | — | — | — | — | — | — | ✅ | — |
| TITLE | ✅ | — | — | — | — | ✅ | — | — | menu | ✅ | ✅ | — |
| SCHOOL_SELECT | ✅ | — | — | — | — | ✅ | — | — | menu | ✅ | ✅ | — |
| CASTLE_MAP | ✅ | — | — | — | — | ✅ | — | — | menu | ✅ | ✅ | ✅ |
| FLOOR_INTRO | ✅ | — | — | — | — | ✅ | ✅ | — | skip | ✅ | ✅ | — |
| PLAYING | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | game | ✅ | ✅ | — |
| BOSS_INTRO | ✅ | — | — | — | — | ✅ | ✅ | — | skip | ✅ | ✅ | — |
| BOSS_FIGHT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | game | ✅ | ✅ | — |
| BOSS_VICTORY | ✅ | — | — | — | — | ✅ | ✅ | — | skip | ✅ | ✅ | ✅ |
| FLOOR_CLEAR | ✅ | — | — | — | — | ✅ | — | — | menu | ✅ | ✅ | ✅ |
| CASTLE_CLEAR | ✅ | — | — | — | — | ✅ | ✅ | — | skip | ✅ | ✅ | ✅ |
| SKILL_TREE | ✅ | — | — | — | — | ✅ | — | — | menu | ✅ | ✅ | ✅ |
| SHOP | ✅ | — | — | — | — | ✅ | — | — | menu | ✅ | ✅ | ✅ |
| CODEX | ✅ | — | — | — | — | — | — | — | menu | ✅ | ✅ | — |
| CUTSCENE | ✅ | — | — | — | — | ✅ | ✅ | — | skip | ✅ | ✅ | — |
| PAUSE | ✅ | — | — | — | — | — | — | — | pause | ✅ | ✅ | — |
| CONFIRM_MODAL | ✅ | — | — | — | — | — | — | — | modal | ✅ | ✅ | — |
| GAME_OVER | ✅ | — | — | — | — | ✅ | ✅ | — | menu | ✅ | ✅ | ✅ |
| ENDING | ✅ | — | — | — | — | ✅ | ✅ | — | skip | ✅ | ✅ | ✅ |
| HIDDEN_STAGE | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | game | ✅ | ✅ | — |

**Input 모드 세분화**:
- `menu`: 방향키+확인+취소 (UI 탐색)
- `game`: 이동+점프+공격+대시+인술+상호작용 (전체 조작)
- `skip`: 확인 키로 스킵 (컷신/인트로)
- `pause`: 확인+취소+방향키 (메뉴 탐색)
- `modal`: 확인+취소만 (모달 응답)

### 6.4 Canvas 기반 모달 (F3)
- `confirm()` / `alert()` 절대 사용 금지
- 모든 확인/경고 UI → Canvas 렌더링 모달
- CONFIRM_MODAL 상태에서 Tween ✅ (모달 등장/퇴장 애니메이션)

---

## §7. 스테이지 설계

### 7.1 성(城) 구조

| 성 | 테마 | 환경 위험 | 날씨 | 보스 |
|----|------|----------|------|------|
| 1. 풍뢰성 (Wind Castle) | 절벽·구름 | 돌풍(밀림), 낙뢰(범위 DMG) | 비+바람 | 텐구 (Tengu) |
| 2. 심림성 (Forest Castle) | 대나무·이끼 | 독안개(DoT), 늪(감속) | 안개 | 카파 (Kappa) |
| 3. 염화성 (Fire Castle) | 화산·용암 | 용암(즉사), 화산탄(범위 DMG) | 화산재 | 오니 (Oni) |
| 4. 빙설성 (Ice Castle) | 폭포·빙하 | 빙결바닥(미끄럼), 고드름(낙하 DMG) | 눈 | 유키온나 (Yuki-onna) |
| 5. 명암성 (Shadow Castle) | 공허·차원 | 공허 구멍(텔레포트), 그림자 촉수(구속) | 에테르 입자 | 오니마루 (Onimaru) |

### 7.2 층별 구조 (각 성 3층)
- **1층**: 탐색 위주, 적 소수, 함정 입문. 비전서 1개 숨김.
- **2층**: 전투 강화, 적 다수, 복합 함정. 닌자 도구 발견.
- **3층**: 혼합, 미니 퍼즐 + 전투. 보스 방 진입 조건: 열쇠 아이템 3개 수집.
- **보스 방**: 단일 보스전 (아래 §9 참조)

### 7.3 환경 위험 상세 테이블

| 위험 | 효과 | 데미지 | 지속 | 쿨다운 | 대응 방법 |
|------|------|--------|------|--------|----------|
| 돌풍 | 카게를 밀림 | 0 (낙사 위험) | 2초 | 5초 | 벽타기로 고정 |
| 낙뢰 | 착탄 범위 DMG | 20 | 즉시 | 8초 | 예고 표시 후 회피 |
| 독안개 | DoT | 3/초 | 진입 중 | 상시 | 대시로 통과 |
| 늪 | SPD 50% 감소 | 0 | 진입 중 | 상시 | 점프로 탈출 |
| 용암 | 즉사 | 999 | 즉시 | 상시 | 절대 접촉 금지 |
| 화산탄 | 범위 DMG | 15 | 즉시 | 6초 | 이동으로 회피 |
| 빙결바닥 | 마찰 0 (미끄럼) | 0 | 진입 중 | 상시 | 벽타기/점프 활용 |
| 고드름 | 낙하 DMG | 12 | 즉시 | 10초 | 접근 시 흔들림 예고 |
| 공허 구멍 | 랜덤 텔레포트 | 0 | 즉시 | 15초 | 은신으로 통과 |
| 그림자 촉수 | 2초 구속 | 5/초 | 2초 | 12초 | 대시로 탈출 |

### 7.4 프로시저럴 레벨 생성
- SeededRNG 기반 적 배치·함정 위치·아이템 배치 변형
- **핵심**: 기본 타일맵은 사전 정의 (성별 3층 × 5 = 15개 기본 레이아웃)
- 변형 요소: 적 종류/위치 (±2타일), 함정 활성/비활성 (30% 변형), 아이템 위치 셔플
- **BFS 도달 가능성 검증** (F, Cycle 23 교훈): 레벨 생성 후 spawn → exit BFS 검증 필수. 실패 시 seed 재생성.

### 7.5 보스 보상 시스템
- `bossRewardGiven` 플래그 패턴 (F17): 보스 처치 보상은 정확히 1회만 지급
- 보상: 경험치 × 5 + 인술 포인트 1 + 고유 닌자 도구

---

## §8. 난이도 시스템

### 8.1 3축 밸런스 모델 (ATK/DEF/SPD)

| 성 | 적 HP | 적 ATK | 적 SPD | 보스 HP | 보스 ATK |
|----|-------|--------|--------|---------|---------|
| 1 | 20 | 8 | 0.6 | 300 | 15 |
| 2 | 30 | 12 | 0.7 | 500 | 20 |
| 3 | 45 | 16 | 0.8 | 750 | 25 |
| 4 | 60 | 20 | 0.9 | 1000 | 30 |
| 5 | 80 | 25 | 1.0 | 1500 | 40 |

### 8.2 DDA (Dynamic Difficulty Adjustment)
- **3회 연속 사망** → 적 HP/ATK 10% 감소 (최대 30% 감소)
- **무손상 층 클리어** → 적 HP/ATK 5% 증가 (최대 15% 증가)
- DDA 계수는 성 전환 시 리셋

### 8.3 로그라이크 선택지 캡
- **DPS 캡**: 기본 ATK의 200% 초과 불가 (스킬+도구+유파 합산)
- **시너지 캡**: 단일 계열 보너스 150% 초과 불가
- 캡 초과 선택지는 선택 목록에서 자동 제외

---

## §9. 보스 설계

### 9.1 보스 공통 규칙
- 3페이즈 (HP 100%→66%→33%→0%)
- 페이즈 전환 시 1.5초 컷신 + 패턴 변화
- 피격 판정: hitTest() 단일 함수 (F16)
- 보스 방 진입 전 자동 세이브

### 9.2 보스별 페이즈 다이어그램

#### 텐구 (Tengu) — 풍뢰성 보스
```
[IDLE] ──┬── Phase 1 (HP>66%): 돌진 → 회오리 발사 × 3 → IDLE
         │   쿨다운: 2초
         ├── Phase 2 (HP>33%): + 낙뢰 소환 (예고 1초) + 비행 패턴
         │   쿨다운: 1.5초
         └── Phase 3 (HP≤33%): + 분신 2체 (분신 HP=50)
             광역 회오리 + 낙뢰 연쇄
             약점: 분신 처치 후 2초 스턴
```

#### 카파 (Kappa) — 심림성 보스
```
[IDLE] ──┬── Phase 1: 물줄기 발사 → 늪 생성 (감속) → IDLE
         ├── Phase 2: + 물 방패 (정면 무적) + 점프 공격 (착지 충격파)
         └── Phase 3: + 전장 절반 수몰 (물 위만 안전)
             약점: 등판의 접시 — 뒤에서 공격 시 DMG ×2
```

#### 오니 (Oni) — 염화성 보스
```
[IDLE] ──┬── Phase 1: 몽둥이 3연타 → 화염 브레스 (부채꼴) → IDLE
         ├── Phase 2: + 바닥 용암 확산 (안전 지대 축소) + 돌진
         └── Phase 3: + 광폭화 (SPD ×1.5, ATK ×1.3)
             약점: 돌진 후 1.5초 스턴 — 벽에 박히면 3초
```

#### 유키온나 (Yuki-onna) — 빙설성 보스
```
[IDLE] ──┬── Phase 1: 빙결 광선 (직선) → 빙주 생성 (장애물) → IDLE
         ├── Phase 2: + 흡수 (빙주에서 HP 회복) + 순간이동
         └── Phase 3: + 전장 눈보라 (시야 50%) + 빙결 트랩 그리드
             약점: 빙주 파괴 시 2초 스턴 + 회복 차단
```

#### 오니마루 (Onimaru) — 명암성 최종 보스
```
[IDLE] ──┬── Phase 1: 그림자 칼날 × 5 → 차원 균열 (텔레포트) → IDLE
         ├── Phase 2: + 이전 보스 패턴 랜덤 1종 소환 + 그림자 분신 4체
         └── Phase 3: + 전장 어둠 (카게 주변 3타일만 가시) + 광역 공허 폭발
             약점: 분신 전멸 후 3초 코어 노출 — 그림자 칼날로만 피해
             히든: HP 10% 이하에서 대화 선택 → 평화 엔딩 루트
```

---

## §10. 인술 & 스킬 트리

### 10.1 그림자 인술 4종

| 인술 | 효과 | 쿨다운 | 마나 소모 | 전투 용도 | 탐색 용도 |
|------|------|--------|----------|----------|----------|
| 그림자 분신 (Clone) | 적을 유인하는 분신 생성 (3초) | 8초 | 20 | 적 어그로 분산 | 스위치 가중판 작동 |
| 그림자 도약 (Leap) | 전방 5타일 순간이동 | 6초 | 15 | 보스 뒤로 회피 | 벽/장애물 통과 |
| 그림자 칼날 (Blade) | 전방 부채꼴 범위 공격 (ATK×2) | 10초 | 30 | 강력한 근접 공격 | 파괴 가능 벽 파괴 |
| 그림자 은신 (Veil) | 4초간 투명 (적 무시) | 12초 | 25 | 보스 광역 회피 | 감시 요괴 통과 |

### 10.2 닌자 유파 3종 (빌드 경로)

| 유파 | 강화 축 | ATK 보너스 | DEF 보너스 | SPD 보너스 | 특수 효과 |
|------|---------|-----------|-----------|-----------|----------|
| 풍 (Wind) | SPD 특화 | +0% | -10% | +30% | 대시 거리 ×1.5, 2단 점프 → 3단 점프 |
| 림 (Forest) | 밸런스 | +10% | +10% | +10% | 독/DoT 면역, 자연 회복 2HP/10초 |
| 화 (Fire) | ATK 특화 | +30% | +0% | -10% | 수리검 관통, 인술 DMG ×1.3 |

### 10.3 스킬 트리 (4계열 × 5단계)

| 계열 | Lv1 | Lv2 | Lv3 | Lv4 | Lv5 |
|------|-----|-----|-----|-----|-----|
| 분신 | 분신 지속 +1초 | HP 50 분신 | 분신 폭발 (처치 시 DMG) | 분신 2체 | 영구 분신 (쿨다운 0) |
| 도약 | 거리 +2타일 | 도약 시 무적 | 연쇄 도약 (2회) | 도약 착지 충격파 | 시공간 도약 (보스 뒤 고정) |
| 칼날 | 범위 +30% | 출혈 DoT 추가 | 크리티컬 30% | 360도 회전 칼날 | 그림자 대검 (범위 ×3) |
| 은신 | 지속 +2초 | 은신 중 이동속도 유지 | 은신 해제 시 기습 (DMG ×3) | 은신 중 마나 회복 | 완전 은신 (트랩도 무시) |

### 10.4 인술 해금 순서 → 경로 접근 가능성 맵

| 성 | 필요 인술 | 해금되는 인술/도구 | 접근 가능 영역 |
|----|----------|-----------------|---------------|
| 성 1 (풍뢰) | 기본 이동만 | 그림자 분신 + 그림자 도약 | 성 1~2 메인 경로 |
| 성 2 (심림) | 분신 (스위치), 도약 (장애물) | 그림자 칼날 | 성 3 메인 + 히든 1 |
| 성 3 (염화) | 칼날 (파괴벽) | 그림자 은신 | 성 4 메인 + 히든 2 |
| 성 4 (빙설) | 은신 (감시 통과) | 인술 진화 | 성 5 메인 + 히든 3 |
| 성 5 (명암) | 전 인술 조합 | — | 최종 보스 + 평화 루트 |

---

## §11. 점수 시스템

### 11.1 점수 구성
- **적 처치**: 잡졸 100점, 정예 300점, 보스 2000점
- **층 클리어 보너스**: 잔여 HP% × 500
- **시간 보너스**: 층당 기준 시간(120초) 이내 시 (기준-실제)×10
- **콤보 보너스**: 연속 처치 × 50 (최대 ×20 = 1000)
- **비전서 발견**: 개당 500점
- **히든 스테이지 클리어**: 5000점

### 11.2 저장 규칙 (F8)
```javascript
// 판정 먼저, 저장 나중에
const isNewBest = G.run.score > G.persist.bestScore;
if (isNewBest) G.persist.bestScore = G.run.score;
saveToLocalStorage(G.persist);
```

### 11.3 영구 진행 (localStorage)
```javascript
const SAVE_SCHEMA = {
  version: 1,
  xp: 0,
  skills: { clone: 0, leap: 0, blade: 0, veil: 0 }, // 0~5
  tools: [],       // 해금된 도구 ID 배열
  codex: [],       // 발견한 비전서 ID 배열
  bestScore: 0,
  bestCastle: 0,   // 도달한 최고 성
  school: -1,      // 선택한 유파 (-1=미선택)
  settings: { lang: 'ko', sfx: true, bgm: true },
  dda: { deathStreak: 0, noHitStreak: 0 }
};
```

---

## §12. 사운드 설계 (Web Audio API)

### 12.1 BGM (프로시저럴 생성, 4종)
| BGM | 상태 | 분위기 | BPM | 키 |
|-----|------|--------|-----|-----|
| 마을/메뉴 | TITLE, CASTLE_MAP, SKILL_TREE | 잔잔한 일본풍 | 80 | Am |
| 탐험 | PLAYING, HIDDEN_STAGE | 긴장감 있는 수묵 | 110 | Dm |
| 보스전 | BOSS_FIGHT | 격렬한 태고 드럼 | 140 | Em |
| 엔딩/컷신 | ENDING, CUTSCENE | 서정적 가야금풍 | 70 | CM |

### 12.2 SFX (프로시저럴 합성, 10종)
| SFX | 트리거 | 합성 방식 |
|-----|--------|----------|
| 수리검 투척 | Z키/SHUR | 고주파 스윕 다운 (800→200Hz, 150ms) |
| 수리검 명중 | 적 피격 | 금속 충돌 노이즈 (50ms) |
| 대시 | X키/DASH | 바람 노이즈 + 저주파 우프 (200ms) |
| 점프 | Space/JUMP | 짧은 상승 톤 (300→500Hz, 100ms) |
| 피격 | 카게 HP 감소 | 둔탁한 임팩트 (100Hz, 150ms) + 노이즈 |
| 인술 발동 | C키/JUTSU | 리버스 심벌 (300ms) + 에코 |
| 보스 등장 | BOSS_INTRO | 태고 드럼 롤 (1초) |
| 아이템 획득 | 아이템 터치 | 상승 아르페지오 (C→E→G, 200ms) |
| 레벨업/해금 | 스킬/도구 해금 | 팡파레 코드 (500ms) |
| 사망 | HP 0 | 하강 톤 + 리버브 (800ms) |

**setTimeout 완전 배제**: 모든 사운드 스케줄링은 `audioCtx.currentTime + delay` 기반 (F4, Cycle 13 교훈)

---

## §13. 카메라 시스템

### 13.1 기본 추적
- 카게를 화면 중앙 약간 위에 고정 (진행 방향으로 2타일 선행)
- 부드러운 추적: `lerp(camera, target, 0.08)`

### 13.2 연출용 줌/팬
| 상황 | 줌 레벨 | 효과 |
|------|---------|------|
| 보스 등장 | 0.7→1.0 (줌 아웃→인) | 보스 전체 노출 후 전투 시작 |
| 보스 처치 | 0.5 줌 아웃 | 승리 연출, 슬로우 모션 |
| 히든 발견 | 1.2→1.0 | 줌 인 후 복귀 |
| 피격 | shake ±3px, 3프레임 | 화면 흔들림 |
| 보스 강공격 | shake ±8px, 6프레임 | 강한 화면 흔들림 |

---

## §14. 검증 & 코드 위생

### 14.1 수치 정합성 테이블 (F10)
> 기획서 수치 = 코드 CONFIG 상수 1:1 대응 필수

| 기획 수치 | CONFIG 상수 | 값 |
|----------|------------|-----|
| 카게 기본 HP | `CONFIG.PLAYER_HP` | 100 |
| 카게 기본 ATK | `CONFIG.PLAYER_ATK` | 10 |
| 대시 무적 시간 | `CONFIG.DASH_INVULN` | 0.3초 |
| 인술 기본 쿨다운 | `CONFIG.JUTSU_CD` | [8, 6, 10, 12] |
| DDA 사망 감소율 | `CONFIG.DDA_DEATH_REDUCE` | 0.10 |
| DPS 캡 | `CONFIG.DPS_CAP` | 2.0 (×기본 ATK) |
| 시너지 캡 | `CONFIG.SYNERGY_CAP` | 1.5 |
| 터치 최소 크기 | `CONFIG.MIN_TOUCH` | 48 |

### 14.2 코드 위생 체크리스트 (FAIL/WARN 2단계)
**FAIL (빌드 차단)**:
1. `assets/` 디렉토리 존재
2. `ASSET_MAP`, `SPRITES`, `preloadAssets` 코드 존재
3. `Math.random` 호출 (SeededRNG 외)
4. `setTimeout` / `setInterval` 호출
5. `alert()` / `confirm()` / `prompt()` 호출
6. `eval()` 호출
7. 외부 CDN/폰트 참조
8. TDZ 위험 (G 객체 미초기화)
9. beginTransition 복수 정의
10. hitTest 복수 정의

**WARN (리뷰 플래그)**:
11. 선언 후 미사용 변수
12. 빈 if/else 블록
13. 전역 직접 참조 함수 (순수 함수 위반)
14. 터치 타겟 < 48px
15. CONFIG 상수 미일치 (기획 vs 코드)
16. orphaned SVG 파일

### 14.3 스모크 테스트 게이트 (19항목)

**1단계: 존재 검증**
1. index.html 파일 존재 + 브라우저 로드 성공
2. thumbnail.svg 파일 존재
3. manifest.json 파일 존재
4. assets/ 디렉토리 부재 확인

**2단계: 기본 플로우**
5. BOOT → TITLE 전환 성공
6. TITLE → SCHOOL_SELECT → CASTLE_MAP 전환 성공
7. CASTLE_MAP → FLOOR_INTRO → PLAYING 전환 성공
8. PLAYING에서 이동/점프/공격 동작 확인
9. PLAYING → PAUSE → PLAYING 복귀 성공
10. 적 처치 → 점수 증가 확인
11. HP 0 → GAME_OVER 전환 성공

**3단계: 핵심 시스템**
12. 보스 방 진입 + 보스 INTRO + 보스전 시작 확인
13. 보스 처치 + BOSS_VICTORY + 보상 1회 지급 확인
14. 인술 4종 각각 발동 확인
15. 스킬 트리 투자 + 효과 적용 확인
16. localStorage 저장/로드 확인

**4단계: 비기능**
17. 모바일 터치 입력 동작 확인 (가상 조이스틱 + 버튼)
18. 다국어 전환 (ko↔en) 동작 확인
19. orphaned 파일 0건 확인 (코드 미참조 파일)

### 14.4 뷰포트 매트릭스 (5단계)

| 뷰포트 | Canvas 크기 | 조이스틱 | 버튼 크기 | 폰트 | 미니맵 |
|--------|------------|---------|----------|------|--------|
| 320px | 320×480 | 80×80 | 48×48 | 12px | 숨김 |
| 375px | 375×560 | 90×90 | 48×48 | 13px | 60×60 |
| 400px | 400×600 | 100×100 | 52×52 | 14px | 70×70 |
| 768px | 768×576 | — (키보드) | 56×56 | 16px | 120×90 |
| 1024px+ | 동적 | — (키보드) | 60×60 | 18px | 160×120 |

---

## §15. 다국어 지원

```javascript
const I18N = {
  ko: {
    title: '그림자 닌자',
    subtitle: '카게무라의 마지막 닌자',
    start: '시작',
    school: { wind: '풍 유파', forest: '림 유파', fire: '화 유파' },
    castle: ['풍뢰성', '심림성', '염화성', '빙설성', '명암성'],
    boss: ['텐구', '카파', '오니', '유키온나', '오니마루'],
    jutsu: ['그림자 분신', '그림자 도약', '그림자 칼날', '그림자 은신'],
    pause: '일시정지',
    resume: '계속',
    quit: '나가기',
    gameOver: '임무 실패',
    newBest: '신기록!',
    // ... 추가 항목
  },
  en: {
    title: 'Shadow Shinobi',
    subtitle: 'Last Ninja of Kagemura',
    start: 'Start',
    school: { wind: 'Wind School', forest: 'Forest School', fire: 'Fire School' },
    castle: ['Wind Castle', 'Forest Castle', 'Fire Castle', 'Ice Castle', 'Shadow Castle'],
    boss: ['Tengu', 'Kappa', 'Oni', 'Yuki-onna', 'Onimaru'],
    jutsu: ['Shadow Clone', 'Shadow Leap', 'Shadow Blade', 'Shadow Veil'],
    pause: 'Paused',
    resume: 'Resume',
    quit: 'Quit',
    gameOver: 'Mission Failed',
    newBest: 'New Record!',
    // ... 추가 항목
  }
};
```

---

## §16. 사이드바 & GameCard 메타데이터

### 사이드바 (게임 페이지)
```yaml
game:
  title: "그림자 닌자"
  description: "요괴왕에게 멸망한 닌자 마을의 유일한 생존자가 그림자 인술을 수련하며 5개 성을 탈환하는 로그라이크 액션 플랫포머. 벽타기, 대시, 수리검, 인술 4종으로 요괴를 물리치고 보스를 공략하라!"
  genre: ["arcade", "action"]
  playCount: 0
  rating: 0
  controls:
    - "← → 이동"
    - "Space 점프 / 2단 점프"
    - "Z 수리검 투척"
    - "X 대시 (무적)"
    - "C 인술 사용"
    - "A/S 인술 전환"
    - "Shift 벽타기"
    - "터치: 가상 조이스틱 + 버튼"
  tags: ["#닌자", "#로그라이크", "#플랫포머", "#요괴", "#수묵화", "#액션", "#보스전"]
  addedAt: "2026-03-23"
  version: "1.0.0"
  featured: true
```

### GameCard (홈 페이지)
```yaml
thumbnail: "games/shadow-shinobi/thumbnail.svg"  # 4:3, 시네마틱 구도
title: "그림자 닌자"                               # 1줄 잘림
description: "요괴왕에게 멸망한 닌자 마을의 유일한 생존자가 5개 성을 탈환하는 로그라이크 액션 플랫포머"  # 2줄 잘림
genre: ["arcade", "action"]                       # 배지 2개
playCount: 0                                      # 초기값
addedAt: "2026-03-23"                             # → "NEW" 배지 표시 (7일 이내)
featured: true                                    # → ⭐ 배지 표시
```

---

## 부록 A: 극단 빌드 사전 검증

### A.1 풍 유파 극대화 (SPD 특화)
```
SPD: 1.0 + 0.3(유파) + 0.1(스킬Lv5) = 1.4
ATK: 10 + 0(유파) = 10 → DPS = 10 × 1.4(SPD보정) = 14
보스5 HP: 1500 → 클리어 시간: 1500/14 ≈ 107초 (범위 내 ✅)
방어: DEF 5 - 10%(유파) = 4.5 → 보스5 순 피해 = 40-4.5 = 35.5
HP 100 → 생존 피격 횟수 = 2.8회 → 높은 난이도지만 대시 회피로 보상
```

### A.2 화 유파 극대화 (ATK 특화)
```
ATK: 10 + 3(유파30%) + 6(스킬Lv5 칼날크리30%) = 19 기본
그림자 칼날: 19 × 2 × 1.3(유파) = 49.4 → 쿨다운 10초
DPS: (19 × 1.0 + 49.4/10) ≈ 24 (SPD 0.9)
보스5 HP: 1500 → 클리어 시간: 1500/24 ≈ 63초 (범위 내 ✅)
DPS 캡 확인: 24 / 10(기본ATK) = 2.4 → 캡 200% = 20 초과 → 캡 적용 → DPS=20
캡 적용 후: 1500/20 = 75초 (범위 내 ✅)
```

### A.3 림 유파 밸런스 (회복 특화)
```
ATK: 10 + 1(유파10%) = 11 → DPS = 11 × 1.1(SPD) ≈ 12
보스5 HP: 1500 → 클리어 시간: 1500/12 = 125초 (상한 근접, DDA 보정으로 120초 이내 ✅)
DEF: 5 + 0.5(유파10%) = 5.5 → 순 피해 = 34.5
HP 100 + 자연회복 2HP/10초 → 유효 HP ≈ 125 (125초간)
생존 피격 횟수 = 3.6회 → 안정적 생존
```

---

## 부록 B: thumbnail.svg 사양
- **크기**: 800×600 (4:3 비율)
- **구도**: 카게가 절벽 위에서 수묵화 풍경을 배경으로 포즈 (벽타기 or 대시 자세)
- **요소**: 먹색 배경 + 주홍 스카프 + 보름달 (금색) + 벚꽃 파티클 + 요괴 실루엣
- **용량**: 20KB+ (복합 path, 그래디언트)

---

_본 기획서는 사이클 #32 "유령 탐정" 포스트모템, platform-wisdom.md 32사이클 누적 교훈, cycle-33-report.md 시장 분석 데이터를 종합하여 작성되었습니다. 9사이클 연속 서로 다른 장르 조합 달성(#25~#33), 플랫폼 최초 닌자 테마, Poki Top 10 60% 점유 arcade+action 장르를 타겟팅합니다._
