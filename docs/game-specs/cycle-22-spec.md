---
game-id: chrono-siege
title: 크로노 시즈
genre: arcade, strategy
difficulty: hard
---

# 크로노 시즈 — 상세 기획서

_사이클 #22 | 작성일: 2026-03-22_

---

## 1페이지 요약 (구현자 필독)

**크로노 시즈**는 시간 조작 능력을 가진 크로노맨서가 되어, 타워를 전략적으로 배치(strategy)하면서 **실시간으로 시간 마법(감속/가속/역전)을 시전(arcade)**하여 시간 균열에서 쏟아지는 적을 격퇴하는 하이브리드 타워 디펜스이다. arcade + strategy 장르 공백(0개→1개, 플랫폼 최대 공백)을 해소하며, 5시대 × 4스테이지 + 5보스 + 5히든 = 30스테이지 + 영구 업그레이드 트리 + 랜덤 웨이브 + 3전략 경로로 프리미엄 리플레이 가치를 제공한다.

**MVP(Phase 1)**: TITLE → ERA_SELECT → STAGE_SELECT → GAMEPLAY → RESULT 5상태 + 고대 시대 4스테이지 + 기본 타워 3종 + 시간 감속 마법 1종. **이것만 먼저 완성한 후 확장.**

**핵심 금지 사항**: assets/ 디렉토리 생성 금지, setTimeout 0건, render 내 상태 변경 금지, 외부 폰트/CDN 0건, alert/confirm 0건.

---

## §0. 이전 사이클 피드백 반영 매핑

> Cycle 21 포스트모템 "아쉬웠던 점" + platform-wisdom 누적 교훈을 카테고리별로 그룹핑하여 선제 대응한다.

### 에셋/파일 시스템

| # | 출처 | 문제 | 해결 방법 | 해당 섹션 |
|---|------|------|---------|-----------|
| F1 | Cycle 1~21 (21사이클 연속) | assets/ 디렉토리 재발 | **index.html 단일 파일 100% Canvas 코드 드로잉.** Cycle 21에서 "미생성 정착" 달성 — 이 패턴 유지 | §11, §14.5 |
| F6 | Cycle 2~4 | SVG 필터 (feGaussianBlur) 재발 | Canvas shadowBlur로만 glow 구현. 인라인 SVG 사용 금지 | §4.2 |
| F33 | Cycle 20 | Google Fonts 외부 의존성 | 시스템 monospace만 사용. 외부 CDN 요청 0건 | §4.1 |

### 상태 머신/전환

| # | 출처 | 문제 | 해결 방법 | 해당 섹션 |
|---|------|------|---------|-----------|
| F2 | Cycle 1~2 | setTimeout 기반 상태 전환 | tween onComplete만 사용. setTimeout **0건** 목표 (11사이클 연속 유지) | §5, §13 |
| F4 | Cycle 2 | 상태×시스템 매트릭스 누락 | §6.3에 14상태 × 10시스템 매트릭스 선행 작성 | §6.3 |
| F5 | Cycle 3/4 | 가드 플래그 누락 → 콜백 반복 | `isTransitioning`, `isWaveActive`, `isBossPhase` 3중 가드 | §5.4 |
| F17 | Cycle 3 | 상태 전환 우선순위 체계 | GAMEOVER > BOSS_DEFEATED > RESULT > GAMEPLAY. STATE_PRIORITY 맵 | §6.2 |
| F23 | Cycle 5/8 | beginTransition() 우회 직접 전환 | 모든 화면 전환은 `beginTransition()` 경유 필수. PAUSED는 예외로 `enterState()` 직접 허용 | §6.2 |
| F26 | Cycle 17/20 | 상태 변경이 render에서 수행 | update()에서만 상태 변경. render()는 순수 출력 | §5.2 |

### 코드 품질

| # | 출처 | 문제 | 해결 방법 | 해당 섹션 |
|---|------|------|---------|-----------|
| F3 | Cycle 6~21 | 순수 함수 패턴 필수 | 충돌 판정·데미지 계산·시간 에너지 관리 모든 함수는 파라미터 기반 | §15.2 |
| F6b | Cycle 4 | TweenManager cancelAll+add 경쟁 조건 | `clearImmediate()` 즉시 정리 API 분리 | §15 |
| F7 | Cycle 7/16 | 기획서 수치 ↔ 코드 수치 불일치 | §14.4 수치 정합성 검증 테이블 전수 대조 | §14.4 |
| F11 | Cycle 11/14 | let/const TDZ 크래시 | 변수 선언 → DOM → 이벤트 → init() 순서 엄격 | §14.1 |
| F12 | Cycle 10/11 | gameLoop try-catch 미적용 | `try{...}catch(e){console.error(e);}raf(loop)` 기본 적용 | §5.1 |
| F15 | Cycle 3/7/17/21 | 유령 변수 (gridCacheCanvas 등) | §14.2 변수 사용처 검증 테이블. 선언 즉시 사용처 매핑 | §14.2 |
| F16 | Cycle 5 | 하나의 값에 이중 갱신 경로 | 모든 주요 값은 단일 함수(`modifyStat()`)로만 갱신 | §15.3 |
| F30 | Cycle 18/21 | 4,215줄 단일 파일 비대화 | §A~§M region 주석으로 논리적 섹션 구조화. 드로잉 함수 시그니처 표준화 | §15.1 |
| F36 | Cycle 21 신규 | ObjectPool 예외 안전성 | updateAll() 콜백을 try-catch로 래핑. 예외 시 아이템 풀 복귀 보장 | §15.4 |
| F37 | Cycle 21 신규 | drawUpgradeIcon 매 프레임 생성 비효율 | 오프스크린 캐싱 패턴: buildIconCache()로 아이콘 사전 렌더링 | §4.3 |

### 입력/모바일

| # | 출처 | 문제 | 해결 방법 | 해당 섹션 |
|---|------|------|---------|-----------|
| F8 | Cycle 1 | iframe 내 confirm/alert 차단 | Canvas 기반 모달 UI만 사용 | §4 |
| F20 | Cycle 13~21 | CONFIG.MIN_TOUCH 선언-구현 괴리 | 모든 UI에 `touchSafe()` 48px 하한 강제. 렌더링 함수에서 `Math.max(MIN_TOUCH, h)` | §12.3 |
| F21 | Cycle 16 | 입력 방식 전기능 미지원 | 키보드/마우스/터치 모두 전 기능 지원 | §3 |
| F24 | Cycle 12~21 | 터치 타겟 44×44px 미달 | 모든 인터랙티브 UI 최소 48×48px | §12.3 |
| F32 | Cycle 20~21 | 터치 스크롤 | ScrollManager(momentum + bounce) 완전 구현 | §4.7 |

### 기타

| # | 출처 | 문제 | 해결 방법 | 해당 섹션 |
|---|------|------|---------|-----------|
| F10 | Cycle 15~21 | offscreen canvas 배경 캐싱 | `buildBgCache()` 패턴 — resize/스테이지 전환 시에만 재빌드 | §4.3 |
| F13 | Cycle 13/17 | index.html 미존재 (과대 기획) | MVP 우선: 5상태 + 고대 시대 먼저 완성 | §1.3 |
| F14 | Cycle 10 | 수정 회귀 | §14.7 전체 플로우 회귀 테스트 | §14.7 |
| F19 | Cycle 12/15 | "절반 구현" 패턴 | 기능별 세부 구현 체크리스트 | §14.3 |
| F38 | Cycle 21 신규 | 5회 리뷰 사이클 소요 | 초회 통과 목표: F1~F38 완전 선제 대응 + 스모크 테스트 게이트 | §14.8 |

---

## §1. 게임 개요 및 핵심 재미 요소

### §1.1 컨셉

시간의 균열에서 쏟아지는 시간 괴물(크로노비스트)을 막는 크로노맨서의 시대 여행 이야기. 타워를 전략적으로 배치하고, 실시간으로 시간 마법을 시전하여 전장을 지배한다.

**핵심 재미**:
1. **전략적 배치** — 7종 타워의 사거리·속성·시너지를 고려한 그리드 배치 (strategy)
2. **실시간 시간 조작** — 감속/가속/역전 3축 마법을 적시에 사용하는 아케이드 조작 (arcade)
3. **시간 에너지 관리** — 마법 사용량 vs 잔여 에너지의 긴장감 있는 자원 관리
4. **시대 탐험** — 고대→중세→산업혁명→미래→시간의끝 5시대의 고유한 적·환경·보스
5. **영구 성장** — 실패해도 시간 결정을 획득해 타워/마법 영구 강화

### §1.2 장르 정당성

- **arcade + strategy = 0게임** (플랫폼 최대 공백 해소)
- 기존 `mini-tower-defense`(순수 strategy)와 차별화: 실시간 시간 조작 아케이드 메카닉
- 2025-2026 TD+로그라이크 트렌드 정합 (Minos, Rogue Tower, Tile Tactics)

### §1.3 MVP / Phase 구분

| Phase | 범위 | 우선순위 |
|-------|------|----------|
| **Phase 1 (MVP)** | TITLE, ERA_SELECT, STAGE_SELECT, GAMEPLAY, RESULT 5상태 + 고대 시대 4스테이지 + 타워 3종 + 시간감속 1종 | **필수** |
| Phase 2 | + 중세/사막 시대 + 타워 2종 추가 + 시간가속/역전 + 보스 2종 | 높음 |
| Phase 3 | + 미래/시간의끝 + 업그레이드 트리 + 히든 스테이지 + 엔딩 | 중간 |
| Phase 4 | + 무한 모드 + 도전 과제 + 리더보드 | 낮음 |

---

## §2. 게임 규칙 및 목표

### §2.1 승리 조건
- 모든 웨이브의 적을 처치하거나, 일정 수 이상 탈출하지 못하게 방어
- 보스 스테이지: 보스 HP를 0으로 만들면 승리

### §2.2 패배 조건
- 시간 코어(거점)의 HP가 0이 되면 패배
- 코어 HP: 기본 20 (업그레이드로 최대 35)

### §2.3 스테이지 구조
```
[스테이지 시작]
  → 배치 페이즈 (30초, 시간 정지 상태)
    → 타워 배치/이동/판매
  → 전투 페이즈
    → 웨이브 1~N (적 이동 + 타워 자동 공격)
    → 플레이어: 실시간 시간 마법 시전
    → 웨이브 종료 → 보너스 골드 + 배치 페이즈 반복
  → 최종 웨이브 클리어 or 패배
[결과 화면]
```

### §2.4 웨이브 시스템
- 스테이지당 3~8 웨이브 (시대 진행에 따라 증가)
- 웨이브 간 10초 배치 페이즈 (타워 추가/재배치)
- 보스 웨이브: 최종 웨이브에 보스 + 잡몹 혼합 등장

---

## §3. 조작 방법

### §3.1 키보드

| 키 | 동작 |
|----|------|
| 1~7 | 타워 선택 (각 슬롯) |
| Q/W/E | 시간 마법 선택 (감속/가속/역전) |
| Space | 선택된 마법 시전 (마우스 위치에) |
| ESC | 일시정지 / 메뉴 |
| Tab | 타워 정보 패널 토글 |
| R | 선택 취소 |
| F | 웨이브 조기 소환 (보너스 골드) |

### §3.2 마우스

| 동작 | 결과 |
|------|------|
| 좌클릭 (그리드 빈칸) | 선택된 타워 배치 |
| 좌클릭 (배치된 타워) | 타워 선택 (정보 표시) |
| 우클릭 (배치된 타워) | 타워 판매 |
| 좌클릭+드래그 (전투 중) | 시간 마법 범위 지정 후 시전 |
| 휠 업/다운 | 타워 슬롯 순환 |

### §3.3 터치

| 동작 | 결과 |
|------|------|
| 탭 (그리드 빈칸) | 선택된 타워 배치 |
| 탭 (배치된 타워) | 타워 정보 팝업 (업그레이드/판매 버튼) |
| 롱프레스 300ms (타워) | 타워 드래그 이동 |
| 하단 슬롯 탭 | 타워/마법 선택 |
| 두 손가락 핀치 | (미사용 — 단일 화면 고정) |
| 스와이프 (업그레이드 화면) | ScrollManager 관성 스크롤 |

### §3.4 터치 가이드
- 첫 플레이 시 3단계 인터랙티브 튜토리얼 오버레이
  1. "타워를 탭하여 선택하세요" (하이라이트 + 화살표)
  2. "빈 칸을 탭하여 배치하세요" (그리드 하이라이트)
  3. "마법 버튼을 눌러 시간을 조작하세요" (마법 버튼 펄스)

---

## §4. 시각적 스타일 가이드

### §4.1 색상 팔레트

```
배경 기본:     #0a0e1a (깊은 남색)
그리드 라인:   #1a2744 (어두운 파랑)
시간 에너지:   #00e5ff (시안 글로우)
타워 기본:     #4fc3f7 (밝은 하늘)
타워 강화:     #ffab40 (주황 골드)
적 기본:       #ef5350 (붉은색)
보스:          #ab47bc (보라)
골드:          #ffd740 (금색)
HP 바:         #66bb6a → #ef5350 (초록→빨강 그라디언트)
시간 감속:     #4dd0e1 (밝은 시안)
시간 가속:     #ff7043 (주황 빨강)
시간 역전:     #ce93d8 (밝은 보라)
UI 텍스트:     #e0e0e0 (밝은 회색)
```

**시대별 배경 색상**:
- 고대: #1a0f0a (따뜻한 갈색) + 모래 파티클
- 중세: #0a1a0f (짙은 초록) + 안개 효과
- 산업혁명: #1a1410 (연기 회색) + 증기 파티클
- 미래: #0a0a1f (네온 남색) + 홀로그램 글리치
- 시간의끝: #0f0020 (깊은 보라) + 시간 왜곡 웨이브

**폰트**: 시스템 monospace 전용 — `'Courier New', 'Consolas', monospace`

### §4.2 Canvas 드로잉 스타일
- **glow 효과**: `ctx.shadowBlur` + `ctx.shadowColor` 전용 (SVG 필터 금지)
- **그라디언트**: `createLinearGradient` / `createRadialGradient`
- **시간 왜곡 시각화**: sin/cos 기반 물결 변형 (ctx.transform 활용)
- **파티클**: ObjectPool(200) 기반 Canvas 원/사각형

### §4.3 오프스크린 캐싱 전략

```
buildBgCache()      — 시대별 배경 (resize/스테이지 전환 시)
buildGridCache()    — 그리드 라인 (resize 시)
buildIconCache()    — 타워/마법 아이콘 (최초 1회, 업그레이드 시 갱신)
buildUICache()      — HUD 프레임 (resize 시)
```

**규칙**: 매 프레임 새 Path 생성 금지 → 캐시 캔버스에서 drawImage()로 블리팅

### §4.4 캐릭터 드로잉 함수 시그니처 표준화

모든 드로잉 함수는 다음 표준 시그니처를 준수:

```javascript
function drawTower(ctx, x, y, size, towerType, level, state) { ... }
function drawEnemy(ctx, x, y, size, enemyType, hp, maxHp, statusEffects) { ... }
function drawBoss(ctx, x, y, size, bossType, phase, hp, maxHp) { ... }
function drawProjectile(ctx, x, y, size, projType, angle) { ... }
function drawEffect(ctx, x, y, size, effectType, progress) { ... }
```

**규칙**: 전역 변수 직접 참조 금지. 모든 상태는 파라미터로 전달.

### §4.5 에셋 목록 (100% Canvas 코드 드로잉)

| # | 에셋 | 크기 | 설명 |
|---|------|------|------|
| 1 | 타워: 화살탑 | 40×40 | 3레벨 변형 (색상 + 장식) |
| 2 | 타워: 대포탑 | 40×40 | 3레벨 변형 |
| 3 | 타워: 번개탑 | 40×40 | 체인 라이트닝 이펙트 |
| 4 | 타워: 시간탑 | 40×40 | 시안 글로우 + 시계 모티프 |
| 5 | 타워: 화염탑 | 40×40 | 불꽃 파티클 |
| 6 | 타워: 빙결탑 | 40×40 | 결정 형태 |
| 7 | 타워: 고대유물탑 | 40×40 | 시대별 특수 타워 |
| 8 | 적: 러셔 | 24×24 | 빠른 이동, 낮은 HP |
| 9 | 적: 탱커 | 32×32 | 느린 이동, 높은 HP, 방패 |
| 10 | 적: 비행체 | 24×24 | 경로 무시 직선 이동 |
| 11 | 적: 분열체 | 28×28 | 처치 시 2분열 |
| 12 | 적: 시간도적 | 24×24 | 시간 에너지 흡수 |
| 13 | 적: 차원이동자 | 24×24 | 순간이동 |
| 14 | 적: 실드베어러 | 28×28 | 주변 적 보호막 |
| 15 | 적: 힐러 | 24×24 | 주변 적 회복 |
| 16 | 보스: 고대 파라오 | 64×64 | 사막 폭풍 공격, 미라 소환 |
| 17 | 보스: 흑기사 | 64×64 | 검기 패턴, 적 강화 오라 |
| 18 | 보스: 기계거인 | 80×80 | 증기 레이저, 부품 분리 |
| 19 | 보스: AI 코어 | 64×64 | 홀로그램 분신, 해킹 |
| 20 | 보스: 크로노스 | 80×80 | 시간 정지, 시간 역행 |
| 21 | 투사체 6종 | 8×8 | 화살/포탄/번개/시간구/화염/빙결 |
| 22 | 시간 마법 이펙트 3종 | 가변 | 감속(시안원)/가속(주황원)/역전(보라 소용돌이) |
| 23 | UI 아이콘 | 32×32 | 타워 슬롯, 마법 슬롯, 코인, HP |
| 24 | 환경: 파괴 가능 장애물 | 32×32 | 시대별 (돌기둥/나무/기계/홀로그램/균열) |
| 25 | 썸네일 대표 장면 | 800×600 | 크로노맨서 + 시간 왜곡 + 타워 배치 전경 |

### §4.6 보스 등장 컷신 연출

```
[카메라 줌 인: 2초]
  배경 어둡게 (overlay alpha 0→0.7)
  보스 실루엣 등장 (하단에서 올라옴, scale 0.3→1.0)
  보스 이름 텍스트 페이드인 (글리치 효과)
  시간 왜곡 이펙트 (화면 전체 sin 물결)
[카메라 줌 아웃: 1초]
  전투 시작
```

### §4.7 ScrollManager 스펙 (업그레이드/도감 화면)

```javascript
const SCROLL = {
  MOMENTUM_DECAY: 0.92,
  MAX_MOMENTUM: 30,
  BOUNCE_FACTOR: 0.3,
  SCROLL_THRESHOLD: 5,   // 이하 이동은 탭으로 판정
  OVERSCROLL_MAX: 60      // 바운스 최대 거리
};
```

---

## §5. 핵심 게임 루프 (프레임 기준 로직 흐름)

### §5.1 메인 루프 구조

```javascript
function gameLoop(timestamp) {
  try {
    const dt = Math.min(timestamp - lastTime, 33.33); // 최대 30fps 보정
    lastTime = timestamp;

    update(dt);
    render();
  } catch (e) {
    console.error('[ChronoSiege] Loop error:', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### §5.2 update/render 분리 원칙

- **update(dt)**: 상태 변경, 물리, 충돌 판정, 타이머 감소, tween 갱신
- **render()**: 순수 출력만. **절대 상태 변경 금지.** 읽기 전용.

```
update(dt):
  1. tweenManager.update(dt)
  2. particlePool.updateAll(dt)        // try-catch 래핑
  3. projectilePool.updateAll(dt)      // try-catch 래핑
  4. if (state === GAMEPLAY) {
       updateEnemies(dt)
       updateTowers(dt)
       updateTimeMagic(dt)
       checkCollisions()
       checkWaveComplete()
     }
  5. scrollManager.update(dt)          // 스크롤 관성

render():
  1. clearCanvas()
  2. drawBackground()                  // 오프스크린 캐시 블리팅
  3. drawGrid()                        // 오프스크린 캐시 블리팅
  4. drawTowers()
  5. drawEnemies()
  6. drawProjectiles()
  7. drawEffects()
  8. drawTimeMagicOverlay()
  9. drawHUD()
  10. drawUI()                          // 버튼, 슬롯, 정보 패널
  11. if (showTutorial) drawTutorialOverlay()
```

### §5.3 시간 마법 물리 처리

```
시간 감속 (SLOW):
  - 범위 내 적 이동속도 × 0.3 (70% 감소)
  - 시간 에너지 소모: 2/초
  - 지속: 토글 (에너지 소진까지)
  - 시각: 시안 원형 필드 + 내부 적 파란 틴트

시간 가속 (HASTE):
  - 범위 내 타워 공격속도 × 2.0 (100% 증가)
  - 시간 에너지 소모: 3/초
  - 지속: 토글
  - 시각: 주황 원형 필드 + 내부 타워 주황 글로우

시간 역전 (REWIND):
  - 범위 내 적 5초 전 위치로 되돌림
  - 시간 에너지 소모: 30 (일회성)
  - 쿨다운: 15초
  - 시각: 보라 소용돌이 + 되돌림 궤적 잔상
```

### §5.4 가드 플래그

```javascript
let isTransitioning = false;  // 화면 전환 중 입력 차단
let isWaveActive = false;     // 웨이브 진행 중 (중복 웨이브 시작 방지)
let isBossPhase = false;      // 보스 컷신/페이즈 전환 중
let isWaveClearing = false;   // 웨이브 클리어 보상 처리 중 (1회 보장)
let isPlacingTower = false;   // 타워 배치 미리보기 중
```

---

## §6. 상태 머신

### §6.1 상태 목록 (14상태)

```
TITLE           — 타이틀 화면
ERA_SELECT      — 시대 선택 (5시대)
STAGE_SELECT    — 스테이지 선택 (4+1 스테이지)
GAMEPLAY        — 전투 진행 (배치 + 전투 페이즈 통합)
WAVE_PREP       — 웨이브 간 배치 시간 (10초)
BOSS_INTRO      — 보스 등장 컷신
BOSS_FIGHT      — 보스 전투 (특수 패턴)
RESULT          — 스테이지 결과 (별점/보상)
GAMEOVER        — 패배 화면
PAUSED          — 일시정지
UPGRADE         — 영구 업그레이드 상점
CODEX           — 적/타워 도감
ENDING          — 엔딩 컷신
TUTORIAL        — 튜토리얼 오버레이 (다른 상태 위에 레이어)
```

### §6.2 상태 전환 규칙

```
TITLE → ERA_SELECT → STAGE_SELECT → GAMEPLAY
GAMEPLAY ↔ WAVE_PREP (웨이브 간 순환)
GAMEPLAY → BOSS_INTRO → BOSS_FIGHT → RESULT
GAMEPLAY/BOSS_FIGHT → GAMEOVER
RESULT → STAGE_SELECT (다음 스테이지) or ERA_SELECT (시대 완료)
TITLE ↔ UPGRADE, TITLE ↔ CODEX
any → PAUSED → (이전 상태 복귀)    ← enterState() 직접 허용 (F23 예외)
```

**STATE_PRIORITY** (높을수록 우선):
```javascript
const STATE_PRIORITY = {
  GAMEOVER: 100,
  BOSS_INTRO: 90,
  RESULT: 80,
  BOSS_FIGHT: 70,
  GAMEPLAY: 60,
  WAVE_PREP: 50,
  PAUSED: 40, // 모든 상태 위에 오버레이
  // ... 나머지 30 이하
};
```

**ESCAPE_ALLOWED** 역방향 전환:
```javascript
const ESCAPE_ALLOWED = {
  ERA_SELECT: 'TITLE',
  STAGE_SELECT: 'ERA_SELECT',
  UPGRADE: 'TITLE',
  CODEX: 'TITLE',
  PAUSED: null,       // 이전 상태 복귀
  RESULT: 'STAGE_SELECT',
};
```

### §6.3 상태 × 시스템 매트릭스

| 시스템 \ 상태 | TITLE | ERA_SEL | STG_SEL | GAMEPLAY | WAVE_PREP | BOSS_INTRO | BOSS_FIGHT | RESULT | GAMEOVER | PAUSED | UPGRADE | CODEX | ENDING | TUTORIAL |
|---------------|-------|---------|---------|----------|-----------|------------|------------|--------|----------|--------|---------|-------|--------|----------|
| tween.update | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| particle.update | ✅ | - | - | ✅ | ✅ | ✅ | ✅ | ✅ | - | - | - | - | ✅ | ✅ |
| projectile.update | - | - | - | ✅ | - | - | ✅ | - | - | - | - | - | - | - |
| enemy.update | - | - | - | ✅ | - | - | ✅ | - | - | - | - | - | - | - |
| tower.update | - | - | - | ✅ | - | - | ✅ | - | - | - | - | - | - | - |
| timeMagic.update | - | - | - | ✅ | - | - | ✅ | - | - | - | - | - | - | - |
| collision.check | - | - | - | ✅ | - | - | ✅ | - | - | - | - | - | - | - |
| scroll.update | - | - | - | - | - | - | - | - | - | - | ✅ | ✅ | - | - |
| sound.update | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | - | ✅ | ✅ | ✅ | ✅ |
| input.process | ✅ | ✅ | ✅ | ✅ | ✅ | - | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## §7. 타워 시스템

### §7.1 타워 종류 (7종)

| # | 이름 | 비용 | 사거리 | 공격속도 | 데미지 | 특수 효과 | 언락 시대 |
|---|------|------|--------|----------|--------|-----------|-----------|
| 1 | 화살탑 | 50 | 3칸 | 1.0/s | 10 | 없음 (기본) | 고대 |
| 2 | 대포탑 | 100 | 2.5칸 | 0.5/s | 40 | 범위 공격 (1칸) | 고대 |
| 3 | 번개탑 | 120 | 3.5칸 | 0.8/s | 15 | 체인 3마리 | 고대 |
| 4 | 시간탑 | 150 | 2칸 | - | 0 | 범위 내 적 20% 감속 | 중세 |
| 5 | 화염탑 | 130 | 2칸 | 0.6/s | 25 | 지속 화상 (5s, 3/s) | 산업혁명 |
| 6 | 빙결탑 | 140 | 2.5칸 | 0.7/s | 20 | 30% 확률 1초 빙결 | 미래 |
| 7 | 고대유물탑 | 200 | 4칸 | 0.3/s | 80 | 시간 에너지 회복 +1/킬 | 시간의끝 |

### §7.2 타워 업그레이드 (인게임)

각 타워 3레벨:
- **Lv2**: 비용 × 0.7, 데미지 +40%, 시각 변화 (색상 강화)
- **Lv3**: 비용 × 1.0, 데미지 +40%, 특수 효과 강화, 시각 변화 (장식 추가)

### §7.3 타워 배치 규칙
- 그리드 기반 (10×8 타일, 각 타일 60×60px 기준)
- 경로 위 배치 불가
- 배치 미리보기: 사거리 원 + 유효/무효 색상 표시
- 타워 판매: 비용의 70% 환불

---

## §8. 적 시스템

### §8.1 적 종류 (8종)

| # | 이름 | HP | 이동속도 | 보상골드 | 특수 | 등장 시대 |
|---|------|----|----------|----------|------|-----------|
| 1 | 러셔 | 30 | 2.0 | 5 | 없음 | 고대 |
| 2 | 탱커 | 150 | 0.8 | 15 | 방어력 5 | 고대 |
| 3 | 비행체 | 50 | 1.5 | 10 | 경로 무시 직선 이동 | 중세 |
| 4 | 분열체 | 80 | 1.2 | 8 | 처치 시 미니×2 (HP 20) | 중세 |
| 5 | 시간도적 | 60 | 1.8 | 12 | 피격 시 시간에너지 -2 | 산업혁명 |
| 6 | 차원이동자 | 70 | 1.0 | 15 | 5초마다 전방 3칸 순간이동 | 미래 |
| 7 | 실드베어러 | 100 | 0.9 | 18 | 반경 1칸 적 50% 피해감소 | 미래 |
| 8 | 힐러 | 45 | 1.0 | 20 | 반경 2칸 적 5HP/s 회복 | 시간의끝 |

### §8.2 적 경로
- 각 스테이지 고유 경로 (웨이포인트 배열)
- 분기 경로 스테이지: 2갈래 (후반 시대)
- 경로는 `STAGE_DATA[era][stage].path` 배열로 정의

---

## §9. 보스 시스템

### §9.1 보스 목록 (5종)

| 시대 | 보스 | HP | 페이즈 수 | 핵심 패턴 |
|------|------|----|-----------|-----------|
| 고대 | 파라오 아누비스 | 500 | 2 | P1: 사막 폭풍(전체 타워 30% 감속), P2: 미라 소환(3체) |
| 중세 | 흑기사 모드레드 | 700 | 2 | P1: 검기 패턴(경로 위 직선 공격), P2: 적 공격력 +50% 오라 |
| 산업혁명 | 기계거인 콜로서스 | 1000 | 3 | P1: 증기 레이저, P2: 부품 분리(좌/우 팔 독립체), P3: 자폭 카운트다운 |
| 미래 | AI 코어 네메시스 | 800 | 2 | P1: 홀로그램 분신(3체, 진짜만 데미지), P2: 타워 해킹(30초간 1타워 적으로 전환) |
| 시간의끝 | 크로노스 | 1500 | 3 | P1: 시간 정지(5초, 타워만), P2: 시간 역행(적 부활), P3: 시공 붕괴(화면 전체 물결+무적 해제) |

### §9.2 보스 페이즈 전환 상태 다이어그램 (ASCII)

```
파라오 아누비스:
  ┌─────────┐    HP≤50%    ┌─────────┐
  │ Phase 1 │ ──────────→ │ Phase 2 │
  │ 사막폭풍 │  (컷신 1s)  │ 미라소환 │
  └─────────┘             └────┬────┘
                                │ HP=0
                                ▼
                          [BOSS_DEFEATED]

기계거인 콜로서스:
  ┌─────────┐    HP≤60%    ┌─────────┐    HP≤25%    ┌─────────┐
  │ Phase 1 │ ──────────→ │ Phase 2 │ ──────────→ │ Phase 3 │
  │ 증기레이저│  (컷신 1.5s) │ 부품분리 │  (컷신 1s)  │자폭카운트│
  └─────────┘             └─────────┘             └────┬────┘
                                                        │ HP=0 or 타이머 종료
                                                        ▼
                                                  [BOSS_DEFEATED]

크로노스:
  ┌─────────┐    HP≤70%    ┌─────────┐    HP≤30%    ┌─────────┐
  │ Phase 1 │ ──────────→ │ Phase 2 │ ──────────→ │ Phase 3 │
  │ 시간정지 │  (컷신 2s)  │ 시간역행 │  (컷신 2s)  │ 시공붕괴 │
  └─────────┘             └─────────┘             └────┬────┘
                                                        │ HP=0
                                                        ▼
                                                  [FINAL_ENDING]
```

---

## §10. 난이도 시스템

### §10.1 동적 난이도 (시대/스테이지 진행)

| 시대 | 적 HP 배율 | 적 이동속도 배율 | 웨이브당 적 수 | 시간 에너지 최대 |
|------|-----------|----------------|--------------|-----------------|
| 고대 | ×1.0 | ×1.0 | 5~10 | 100 |
| 중세 | ×1.3 | ×1.1 | 8~15 | 110 |
| 산업혁명 | ×1.6 | ×1.2 | 10~20 | 120 |
| 미래 | ×2.0 | ×1.3 | 12~25 | 130 |
| 시간의끝 | ×2.5 | ×1.4 | 15~30 | 150 |

### §10.2 3단계 난이도 선택

| 난이도 | 코어 HP | 골드 배율 | 적 HP 배율 | 시간 에너지 회복 |
|--------|---------|----------|-----------|-----------------|
| 견습생 (Easy) | 30 | ×1.5 | ×0.7 | +3/s |
| 시간술사 (Medium) | 20 | ×1.0 | ×1.0 | +2/s |
| 크로노마스터 (Hard) | 15 | ×0.8 | ×1.3 | +1.5/s |

### §10.3 히든 스테이지 조건

| 시대 | 조건 | 보상 |
|------|------|------|
| 고대 | 4스테이지 전부 ★★★ | 히든: 피라미드 심층 |
| 중세 | 보스를 시간역전 없이 격파 | 히든: 마법사 탑 최상층 |
| 산업혁명 | 타워 3개 이하로 클리어 | 히든: 비밀 공장 |
| 미래 | 시간도적 0피격으로 클리어 | 히든: AI 서버실 |
| 시간의끝 | 전 시대 히든 클리어 | 히든: 시간의 기원 (진 엔딩) |

---

## §11. 점수 시스템

### §11.1 점수 계산

```
적 처치: HP × 시대배율 × 콤보배율
보스 처치: 기본 1000 × 시대배율
웨이브 보너스: 남은 코어 HP × 50
시간 보너스: 남은 시간 에너지 × 10
스테이지 클리어: 기본 500 × 시대배율

콤보: 3초 내 연속 처치
  ×2 (2킬), ×3 (3킬), ×4 (4킬), ×5 (5킬+, 최대)
```

### §11.2 별점 (스테이지 결과)

| 등급 | 조건 |
|------|------|
| ★☆☆ | 클리어 |
| ★★☆ | 코어 HP ≥ 50% |
| ★★★ | 코어 HP = 100% (무피격) |

### §11.3 시간 결정 (영구 통화)

- 스테이지 클리어: 3~10개 (별점 비례)
- 보스 처치: +15개
- 히든 스테이지: +25개
- 패배 시: 1~3개 (위로 보상, 진행도 비례)

---

## §12. 영구 업그레이드 트리

### §12.1 업그레이드 카테고리

```
[시간 역량]                    [타워 강화]                [코어 강화]
├ 에너지 최대 +10 (5단계)     ├ 기본 공격력 +5% (5단계)  ├ 코어 HP +3 (5단계)
├ 회복속도 +0.5/s (5단계)     ├ 사거리 +5% (5단계)       ├ 코어 회복 1HP/웨이브 (3단계)
├ 감속 효율 +10% (3단계)      ├ 타워 비용 -5% (5단계)    ├ 골드 보너스 +10% (5단계)
├ 가속 효율 +10% (3단계)      ├ 판매 환불 +5% (3단계)    └ 시작 골드 +50 (5단계)
└ 역전 쿨다운 -2s (3단계)     └ Lv3 특수 해금 (7종)
```

### §12.2 업그레이드 비용 (시간 결정)

```
1단계: 5, 2단계: 10, 3단계: 20, 4단계: 35, 5단계: 50
```

### §12.3 UI 터치 스펙
- 모든 업그레이드 버튼: 최소 48×48px (`touchSafe()` 강제)
- 렌더링 함수에서 `Math.max(CONFIG.MIN_TOUCH, buttonHeight)` 적용
- ScrollManager로 관성 스크롤 (§4.7 수치 참조)

---

## §13. 사운드 시스템 (Web Audio API)

### §13.1 효과음 목록 (8종+)

| # | 효과음 | 트리거 | 파형 | 빈도(Hz) | 지속(ms) |
|---|--------|--------|------|----------|----------|
| 1 | 타워 배치 | 타워 건설 완료 | square | 440→880 | 150 |
| 2 | 화살 발사 | 화살탑 공격 | sawtooth | 600→300 | 80 |
| 3 | 대포 폭발 | 대포탑 공격 | noise | - | 200 |
| 4 | 번개 | 번개탑 공격 | square | 200→2000 랜덤 | 100 |
| 5 | 시간 감속 | SLOW 마법 시전 | sine | 220→110 | 500 |
| 6 | 시간 가속 | HASTE 마법 시전 | sine | 220→440 | 300 |
| 7 | 시간 역전 | REWIND 마법 시전 | triangle+sine | 440→110→440 | 800 |
| 8 | 적 처치 | 적 HP 0 | noise+sine | 300→0 | 120 |
| 9 | 보스 등장 | BOSS_INTRO | sine chord | C3+E3+G3 | 2000 |
| 10 | 코어 피격 | 적 코어 도달 | square | 100→50 | 400 |

### §13.2 BGM 루프

- **시대별 BGM**: 절차적 생성 4마디 루프 (BPM 80~120)
- **보스전 BGM**: 긴박한 드럼 패턴 (BPM 140)
- `oscillator.start(ctx.currentTime + delay)` 네이티브 스케줄링 (setTimeout 0건)

---

## §14. 품질 보증 체크리스트

### §14.1 초기화 순서

```
1. const/let 변수 선언 (모든 전역)
2. CONFIG 상수 객체
3. DOM 참조 (canvas, ctx)
4. TweenManager, ObjectPool, SoundManager, ScrollManager 인스턴스
5. 이벤트 리스너 등록
6. init() 호출 → TITLE 상태 진입
```

### §14.2 변수 사용처 검증 테이블

> 선언된 모든 주요 변수가 실제 사용되는지 검증. 유령 변수 방지 (F15).

| 변수명 | 선언 위치 | 갱신 함수 | 참조 함수 | 비고 |
|--------|-----------|----------|----------|------|
| coreHP | 전역 | modifyCoreHP() | drawHUD(), checkGameOver() | 단일 갱신 경로 |
| timeEnergy | 전역 | modifyTimeEnergy() | drawHUD(), canCastMagic() | 단일 갱신 경로 |
| gold | 전역 | modifyGold() | drawHUD(), canBuildTower() | 단일 갱신 경로 |
| score | 전역 | addScore() | drawHUD(), drawResult() | 단일 갱신 경로 |
| currentWave | 전역 | startNextWave() | spawnWave(), drawHUD() | |
| towers[] | 전역 | placeTower(), sellTower() | updateTowers(), drawTowers() | |
| enemies[] | 전역 | spawnEnemy(), removeEnemy() | updateEnemies(), drawEnemies() | ObjectPool |
| projectiles[] | 전역 | fireProjectile() | updateProjectiles() | ObjectPool |
| timeMagicFields[] | 전역 | castTimeMagic() | updateTimeMagic(), drawTimeMagicOverlay() | |

### §14.3 기능별 세부 구현 체크리스트

> "절반 구현" 방지 (F19). 각 기능의 A + B 모두 확인.

```
[ ] 시간 감속: 이동속도 감소 ✅ + 시안 시각 효과 ✅ + 에너지 소모 ✅
[ ] 시간 가속: 공격속도 증가 ✅ + 주황 시각 효과 ✅ + 에너지 소모 ✅
[ ] 시간 역전: 위치 되돌림 ✅ + 보라 소용돌이 ✅ + 쿨다운 ✅ + 잔상 ✅
[ ] 보스 P1→P2: HP 조건 ✅ + 컷신 ✅ + 패턴 전환 ✅
[ ] 타워 판매: 환불 ✅ + 타워 제거 ✅ + 사거리 원 제거 ✅
[ ] 적 분열: 처치 이벤트 ✅ + 미니 2체 생성 ✅ + 각각 보상 ✅
[ ] 터치 스크롤: 드래그 ✅ + 관성 ✅ + 바운스 ✅ + 탭 판별 ✅
```

### §14.4 수치 정합성 검증 테이블

> 기획서 값과 CONFIG 상수를 1:1 대응 (F7).

| 기획서 항목 | 기획서 값 | CONFIG 키 | 검증 |
|------------|----------|-----------|------|
| 코어 HP (기본) | 20 | CONFIG.CORE_HP_BASE | [ ] |
| 시간 에너지 최대 (고대) | 100 | CONFIG.TIME_ENERGY_MAX[0] | [ ] |
| 화살탑 비용 | 50 | CONFIG.TOWERS[0].cost | [ ] |
| 화살탑 데미지 | 10 | CONFIG.TOWERS[0].damage | [ ] |
| 감속 이동속도 배율 | 0.3 | CONFIG.SLOW_SPEED_MULT | [ ] |
| 가속 공격속도 배율 | 2.0 | CONFIG.HASTE_ATTACK_MULT | [ ] |
| 역전 에너지 소모 | 30 | CONFIG.REWIND_COST | [ ] |
| 역전 쿨다운 | 15초 | CONFIG.REWIND_COOLDOWN | [ ] |
| 타워 판매 환불율 | 70% | CONFIG.SELL_REFUND_RATE | [ ] |
| 러셔 HP | 30 | CONFIG.ENEMIES[0].hp | [ ] |
| 러셔 이동속도 | 2.0 | CONFIG.ENEMIES[0].speed | [ ] |
| 콤보 시간 | 3초 | CONFIG.COMBO_WINDOW | [ ] |

### §14.5 금지 패턴 자동 검증

```bash
# assets/ 디렉토리 존재 확인
[ -d "games/chrono-siege/assets" ] && echo "FAIL: assets/ exists" && exit 1

# setTimeout 사용 확인
grep -n "setTimeout" games/chrono-siege/index.html && echo "FAIL: setTimeout found" && exit 1

# alert/confirm 사용 확인
grep -n "alert\|confirm(" games/chrono-siege/index.html && echo "FAIL: alert/confirm found" && exit 1

# 외부 리소스 참조
grep -n "googleapis\|cdn\|fonts.google\|<link.*href.*http" games/chrono-siege/index.html && echo "FAIL: external resource" && exit 1

# SVG 필터
grep -n "feGaussianBlur\|<filter" games/chrono-siege/index.html && echo "FAIL: SVG filter" && exit 1

# ASSET_MAP/SPRITES/preloadAssets 코드 잔존
grep -n "ASSET_MAP\|SPRITES\|preloadAssets\|new Image()" games/chrono-siege/index.html && echo "FAIL: asset code remnant" && exit 1
```

### §14.6 에셋 드로잉 함수 목록 (전역 참조 금지 확인용)

| 함수명 | 파라미터 | 전역 참조 | 검증 |
|--------|---------|----------|------|
| drawTower | ctx, x, y, size, type, level, state | 없음 | [ ] |
| drawEnemy | ctx, x, y, size, type, hp, maxHp, effects | 없음 | [ ] |
| drawBoss | ctx, x, y, size, type, phase, hp, maxHp | 없음 | [ ] |
| drawProjectile | ctx, x, y, size, type, angle | 없음 | [ ] |
| drawEffect | ctx, x, y, size, type, progress | 없음 | [ ] |
| drawTimeMagicField | ctx, cx, cy, radius, type, alpha | 없음 | [ ] |

### §14.7 회귀 테스트 플로우

```
TITLE → ERA_SELECT → (고대 선택) → STAGE_SELECT → (1-1 선택)
→ GAMEPLAY (배치 → 전투 → WAVE_PREP → 전투 반복)
→ RESULT (★★★) → STAGE_SELECT
→ (1-4 보스 선택) → BOSS_INTRO → BOSS_FIGHT
→ (승리) RESULT → ERA_SELECT
→ (패배 테스트) GAMEOVER → TITLE
→ UPGRADE → (구매) → TITLE
→ CODEX → (스크롤) → TITLE
→ (모바일 터치 전체 반복)
```

### §14.8 스모크 테스트 게이트 (리뷰 제출 전 필수)

```
1. index.html이 존재하는가?
2. 브라우저에서 에러 없이 로드되는가?
3. TITLE 화면이 표시되는가?
4. 1스테이지 진입이 가능한가?
5. 타워 배치가 동작하는가?
6. 적이 이동하는가?
7. 게임오버까지 도달 가능한가?
8. §14.5 금지 패턴 검증 통과하는가?
```

---

## §15. 코드 아키텍처

### §15.1 파일 구조 (region 주석)

```javascript
// ═══════════════════════════════════════
// §A — CONFIG & CONSTANTS
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §B — UTILITY CLASSES (TweenManager, ObjectPool, SoundManager, ScrollManager)
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §C — GAME STATE & DATA
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §D — STAGE & WAVE DATA
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §E — DRAWING FUNCTIONS (표준 시그니처)
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §F — TOWER LOGIC
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §G — ENEMY LOGIC
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §H — TIME MAGIC SYSTEM
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §I — COLLISION & COMBAT
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §J — UI & HUD
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §K — INPUT HANDLING
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §L — STATE MACHINE & TRANSITIONS
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §M — MAIN LOOP & INIT
// ═══════════════════════════════════════
```

### §15.2 순수 함수 패턴

```javascript
// ✅ 올바른 예
function calcDamage(baseDmg, towerLevel, enemyArmor, hasteMultiplier) {
  return Math.max(1, baseDmg * (1 + 0.4 * (towerLevel - 1)) * hasteMultiplier - enemyArmor);
}

function checkCollision(proj, enemy) {
  const dx = proj.x - enemy.x;
  const dy = proj.y - enemy.y;
  return dx * dx + dy * dy < (proj.r + enemy.r) * (proj.r + enemy.r);
}

// ❌ 금지
function calcDamage() {
  return selectedTower.damage - currentEnemy.armor; // 전역 직접 참조
}
```

### §15.3 단일 갱신 경로

```javascript
function modifyCoreHP(delta) { coreHP = Math.max(0, Math.min(maxCoreHP, coreHP + delta)); }
function modifyTimeEnergy(delta) { timeEnergy = Math.max(0, Math.min(maxTimeEnergy, timeEnergy + delta)); }
function modifyGold(delta) { gold = Math.max(0, gold + delta); }
function addScore(points) { score += points; }
```

### §15.4 ObjectPool 예외 안전성 (F36)

```javascript
class ObjectPool {
  updateAll(dt) {
    for (let i = this._active.length - 1; i >= 0; i--) {
      try {
        if (!this._updateFn(this._active[i], dt)) {
          this._pool.push(this._active.splice(i, 1)[0]);
        }
      } catch (e) {
        console.error('[ObjectPool] Update error:', e);
        this._pool.push(this._active.splice(i, 1)[0]); // 예외 시에도 풀 복귀
      }
    }
  }
}
```

### §15.5 TweenManager clearImmediate()

```javascript
class TweenManager {
  clearImmediate() {
    this._tweens.length = 0;
    this._pendingCancel = false;
  }
  // cancelAll()은 deferred, clearImmediate()은 즉시
}
```

---

## §16. 다국어 지원

### §16.1 텍스트 테이블

```javascript
const TEXT = {
  ko: {
    title: '크로노 시즈',
    subtitle: '시간을 지배하라',
    start: '게임 시작',
    continue: '이어하기',
    upgrade: '업그레이드',
    codex: '도감',
    era_ancient: '고대',
    era_medieval: '중세',
    era_industrial: '산업혁명',
    era_future: '미래',
    era_timeend: '시간의 끝',
    wave: '웨이브',
    boss: '보스',
    victory: '승리!',
    defeat: '시간이 무너졌다...',
    paused: '일시정지',
    // ... 전체 UI 텍스트
  },
  en: {
    title: 'Chrono Siege',
    subtitle: 'Master Time',
    start: 'Start Game',
    continue: 'Continue',
    upgrade: 'Upgrades',
    codex: 'Codex',
    era_ancient: 'Ancient',
    era_medieval: 'Medieval',
    era_industrial: 'Industrial',
    era_future: 'Future',
    era_timeend: 'End of Time',
    wave: 'Wave',
    boss: 'Boss',
    victory: 'Victory!',
    defeat: 'Time has fallen...',
    paused: 'Paused',
    // ...
  }
};
```

### §16.2 언어 감지

```javascript
const LANG = (navigator.language || 'ko').startsWith('ko') ? 'ko' : 'en';
function t(key) { return TEXT[LANG][key] || TEXT.en[key] || key; }
```

---

## §17. localStorage 데이터 스키마

```javascript
const SAVE_KEY = 'chrono-siege-v1';
const SAVE_SCHEMA = {
  version: 1,
  lang: 'ko',                        // 언어 설정
  difficulty: 'medium',               // 난이도
  eraProgress: [4, 0, 0, 0, 0],     // 각 시대 클리어 스테이지 수
  stageStars: {},                     // { "0-0": 3, "0-1": 2, ... }
  upgrades: {                         // 영구 업그레이드 레벨
    timeMax: 0, timeRegen: 0, slowEff: 0, hasteEff: 0, rewindCd: 0,
    towerDmg: 0, towerRange: 0, towerCost: 0, sellRefund: 0, towerLv3: [],
    coreHp: 0, coreRegen: 0, goldBonus: 0, startGold: 0
  },
  timeCrystals: 0,                    // 영구 통화
  totalScore: 0,                      // 누적 점수
  codexUnlocked: [],                  // 발견한 적/보스/타워
  hiddenStagesUnlocked: [],           // 해금된 히든 스테이지
  playCount: 0,                       // 총 플레이 횟수
  bestScorePerStage: {},              // 스테이지별 최고 점수
  tutorialComplete: false,            // 튜토리얼 완료 여부
};
```

**저장/로드 순서 (F2/B4 방지)**:
```
판정 먼저 → 저장 나중에
1. isNewBest = score > getBestScore(stageId)
2. saveProgress(stageId, stars, score)
3. if (isNewBest) showNewBestAnimation()
```

---

## §18. 게임 페이지 사이드바 데이터

```yaml
game:
  title: "크로노 시즈"
  description: "시간 조작 능력으로 타워를 배치하고 시간 마법을 시전하여 시간 균열의 적을 격퇴하는 전략 아케이드 타워 디펜스"
  genre: ["arcade", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "1~7: 타워 선택"
    - "Q/W/E: 시간 마법 (감속/가속/역전)"
    - "Space: 마법 시전"
    - "클릭: 타워 배치/선택"
    - "우클릭: 타워 판매"
    - "터치: 탭으로 배치, 롱프레스로 이동"
  tags:
    - "#타워디펜스"
    - "#시간조작"
    - "#전략"
    - "#아케이드"
    - "#로그라이크"
    - "#보스전"
  addedAt: "2026년 3월 22일"
  version: "1.0.0"
  featured: true
```

### 홈 카드 데이터

```yaml
thumbnail: "games/chrono-siege/thumbnail.svg"   # 4:3 비율
title: "크로노 시즈"                              # 1줄 잘림
description: "시간을 지배하라! 타워 배치 + 실시간 시간 마법으로 시간 균열의 적을 격퇴하는 전략 아케이드 TD"  # 2줄 잘림
genre: ["arcade", "strategy"]                     # 배지 2개
playCount: 0                                      # 1000 이상이면 "1.2k"
addedAt: "2026-03-22"                             # 7일 이내 → "NEW" 배지
featured: true                                     # ⭐ 배지 표시
```

---

## §19. 스토리/내러티브

### §19.1 배경 스토리

> 시간의 균열이 역사의 다섯 시대를 관통하며 열렸다.
> 균열에서 쏟아지는 크로노비스트들이 시간의 흐름을 집어삼키고 있다.
> 마지막 크로노맨서인 당신만이 시간을 조작하는 힘으로 이 위기를 막을 수 있다.

### §19.2 시대별 인트로 텍스트

- **고대**: "모래 속에 잠든 고대 문명... 시간의 균열이 파라오의 저주를 깨웠다."
- **중세**: "안개 낀 성 너머, 흑기사의 군대가 시간을 거슬러 깨어난다."
- **산업혁명**: "증기와 톱니바퀴의 시대. 기계가 시간을 삼키기 시작했다."
- **미래**: "네온 불빛 아래, AI가 시간 자체를 해킹하려 한다."
- **시간의끝**: "모든 시대가 하나로 수렴하는 곳. 크로노스가 기다린다."

### §19.3 엔딩

- **일반 엔딩**: 크로노스 격파 → "균열이 봉인되었다. 시간은 다시 흐른다."
- **진 엔딩**: 히든 스테이지 "시간의 기원" 클리어 → "당신은 시간의 기원을 보았다. 이제 당신이 새로운 크로노스다."

---

## §20. Cycle 21 대비 발전 포인트 요약

| 영역 | Cycle 21 (runeforge-tactics) | Cycle 22 (chrono-siege) |
|------|------------------------------|------------------------|
| 장르 | puzzle+strategy | **arcade+strategy** (새로운 최대 공백 해소) |
| 코어 루프 | 턴 기반 배치 → 자동 방어 | **실시간 배치 + 실시간 시간 조작** (높은 APM) |
| 시간 메카닉 | 없음 | **감속/가속/역전 3축 시간 제어** |
| 스테이지 수 | 20+ | **30** (5시대×4 + 5보스 + 5히든) |
| 리플레이 | 마법진 레시피 수집 | **랜덤 웨이브 + 3전략 경로 + 시간 도전** |
| 상태 수 | 12 | **14** |
| ObjectPool | 예외 미처리 | **try-catch 래핑 (F36)** |
| 아이콘 캐싱 | 매 프레임 생성 | **오프스크린 사전 렌더링 (F37)** |
| 드로잉 시그니처 | 비표준 | **(ctx, x, y, size, ...state) 표준화** |
| 보스 행동 패턴 | 텍스트 설명만 | **ASCII 상태 다이어그램 포함** |
| 기획서 분량 | ~1000줄 | **핵심 집중, 반복 패턴 참조 링크 활용** |
| 리뷰 목표 | 5회 | **3회 이하 (F38 스모크 테스트 게이트)** |
