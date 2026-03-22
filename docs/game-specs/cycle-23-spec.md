---
game-id: phantom-shift
title: 팬텀 시프트
genre: puzzle, action
difficulty: hard
---

# 팬텀 시프트 (Phantom Shift) — 사이클 #23 게임 기획서

> **1페이지 요약**: 빛과 그림자 이중 차원을 실시간으로 전환하며 프로시저럴 던전을 탐험하는 퍼즐-액션 로그라이크. Q키로 차원을 전환하면 벽이 사라지고 통로가 나타나며, 적의 차원 속성에 맞춰 공격 타이밍을 판단해야 한다. 15층 + 3보스 + 히든 스테이지 + 영구 업그레이드 트리로 **puzzle+action 장르 공백을 완전 해소**한다.

---

## §0. 피드백 매핑 (이전 사이클 교훈)

### 검증 완료 패턴 (platform-wisdom 참조) ✅
> 아래 항목은 18사이클 이상 검증되어 platform-wisdom.md에 상세 기술됨. 본 기획서에서는 **적용 섹션만 표기**한다.

| ID | 교훈 요약 | 적용 섹션 |
|----|----------|----------|
| F1 | assets/ 디렉토리 절대 생성 금지 | §4.1 |
| F2 | 외부 CDN/폰트 0건 | §4.1 |
| F3 | iframe 환경 confirm/alert 금지 → Canvas 모달 | §6.4 |
| F4 | setTimeout 0건 → tween onComplete 전용 | §5.2 |
| F5 | 가드 플래그로 tween 콜백 1회 실행 보장 | §5.2 |
| F6 | STATE_PRIORITY + beginTransition 체계 | §6.1 |
| F7 | 상태×시스템 매트릭스 필수 | §6.2 |
| F8 | 판정 먼저, 저장 나중에 | §11.1 |
| F9 | 순수 함수 패턴 (ctx, x, y, size, ...state) | §4.4 |
| F10 | 수치 정합성 테이블 (기획=코드 1:1) | §13.1 |
| F11 | 터치 타겟 최소 48×48px + Math.max 강제 | §3.3 |
| F12 | TDZ 방지: 변수 선언 → DOM 할당 → 이벤트 등록 순서 | §5.1 |
| F13 | TweenManager clearImmediate() API 분리 | §5.2 |
| F14 | 단일 값 갱신 경로 통일 (tween vs 직접 대입) | §5.2 |
| F15 | 스모크 테스트 게이트 8항목 | §13.3 |

### 신규 피드백 (Cycle 22 포스트모템 기반) 🆕

| ID | 교훈 | 해결책 | 적용 섹션 |
|----|------|--------|----------|
| F39 | 4라운드 리뷰 소요 — 480px 모바일 뷰포트 레이아웃 미검증 | menuY 하한 바운드 패턴 + 뷰포트 테스트 매트릭스(320/480/768/1024px) | §3.4, §13.2 |
| F40 | 밸런스 검증 미비 — 대규모 조합 공간의 자동 검증 수단 없음 | 난이도 3구간(초반/중반/후반) 밸런스 테이블 + 핵심 수치 범위 명시 | §8.1, §13.4 |
| F41 | 단일 파일 규모 지속 증가 — 모듈 분리 22사이클째 미해결 | 코드 영역별 주석 구분 + 함수 그룹핑 가이드 (8개 영역) | §5.3 |
| F42 | menuY 레이아웃 이슈 3회차까지 잔존 | `Math.min(H*0.72, H-(n*(btnH+gap)+margin))` 패턴 전 UI에 강제 | §3.4 |
| F43 | 피드백 매핑 분량 과다 (기획서의 15%) | 검증 완료 패턴은 요약 테이블, 신규만 상세 기술 | §0 (본 섹션) |

---

## §1. 게임 개요 및 핵심 재미 요소

### 1.1 컨셉
팬텀 시프트는 **빛의 세계**와 **그림자 세계**, 두 차원이 겹쳐진 던전을 탐험하는 퍼즐-액션 로그라이크다. 플레이어는 "차원의 수호자"로서, 그림자 세계에서 침식해오는 팬텀들을 막고 던전 최심부의 대균열을 봉인해야 한다.

### 1.2 핵심 재미 3축
1. **차원 전환 퍼즐**: 빛의 세계에서 보이는 벽이 그림자 세계에서는 통로가 된다. 두 차원의 지형을 머릿속에 겹쳐 최적 경로를 찾는 공간 퍼즐.
2. **실시간 전투 액션**: 적의 차원 속성(빛/그림자/혼합)에 맞춰 전환 타이밍을 판단하고, 회피와 공격을 실시간으로 수행.
3. **로그라이크 리플레이**: 프로시저럴 던전 생성 + 랜덤 아이템/유물 조합으로 매 플레이가 다른 경험. 영구 업그레이드 트리로 장기 진행 동기 부여.

### 1.3 스토리/내러티브
- **배경**: 고대에 빛과 그림자는 하나의 세계였으나, "대분열"로 두 차원이 갈라졌다. 두 차원의 경계에 균열이 생기면서 팬텀(그림자 존재)이 빛의 세계로 침입하기 시작한다.
- **목표**: 던전 15층을 돌파하며 3개의 봉인석을 모아 대균열을 봉인한다.
- **스토리 전달**: 각 보스 격파 후 짧은 컷신(Canvas 연출) + 층마다 발견하는 "고대 비문"(TEXT 오브젝트)으로 세계관 전달.

### 1.4 장르 공백 해소
- **puzzle + action = 0개** → 본 게임으로 **완전 해소**
- 기존 퍼즐 게임(color-merge-puzzle, gem-match-blitz 등)과 차별화: 실시간 전투 + 공간 퍼즐의 이중 구조

---

## §2. 게임 규칙 및 목표

### 2.1 기본 규칙
- 플레이어는 15층 던전을 차례로 탐험하며, 각 층의 출구(계단)를 찾아 다음 층으로 진행
- 각 층은 **빛 레이어**와 **그림자 레이어**가 겹쳐진 프로시저럴 그리드 맵
- Q키(또는 화면 우측 버튼)로 **차원 전환**: 현재 차원의 지형/적이 전환
- 차원 전환에는 **차원 에너지**가 소모됨 (최대 100, 전환당 -15, 시간 경과로 회복)
- 적을 처치하면 경험치 + 골드 획득, 레벨업 시 스킬 3택 중 1개 선택

### 2.2 승리/패배 조건
- **승리**: 15층 보스(그림자 군주) 격파 + 대균열 봉인
- **패배**: HP 0 → 런 종료, 획득 골드의 30%를 영구 통화로 보존
- **히든 스테이지**: 특정 조건(전 층 무피격 + 비문 전부 수집) 달성 시 16층 해금

### 2.3 층 구성
| 층 | 테마 | 특징 | 보스 |
|----|------|------|------|
| 1~5 | 잊혀진 성소 | 기본 차원 퍼즐 학습 | 5층: 그림자 파수꾼 |
| 6~10 | 균열의 회랑 | 시간제 퍼즐 방 + 함정 | 10층: 차원 직조자 |
| 11~15 | 심연의 핵 | 양 차원 동시 위협 | 15층: 그림자 군주 |
| 16 | 빛의 기원 (히든) | 퍼즐 전용 (전투 없음) | — |

### 2.4 난이도 3종
| 난이도 | HP 배율 | 적 강화 | 에너지 회복 | 보상 배율 |
|--------|---------|---------|------------|----------|
| 쉬움 | ×1.5 | ×0.7 | ×1.3 | ×0.8 |
| 보통 | ×1.0 | ×1.0 | ×1.0 | ×1.0 |
| 어려움 | ×0.7 | ×1.5 | ×0.7 | ×1.5 |

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 동작 |
|----|------|
| WASD / 방향키 | 8방향 이동 |
| Q | 차원 전환 (빛 ↔ 그림자) |
| Space / 클릭 | 공격 (현재 차원 기준) |
| E | 상호작용 (상자, 비문, NPC) |
| 1~3 | 스킬 사용 (레벨업 시 획득) |
| ESC | 일시정지 / 메뉴 |
| Tab | 미니맵 토글 |

### 3.2 마우스
- **좌클릭**: 이동 목표 지점 설정 / 공격
- **우클릭**: 차원 전환
- **마우스 휠**: 미니맵 줌

### 3.3 터치 (모바일)
- **가상 조이스틱**: 화면 좌측 하단 (반경 60px, 터치 영역 120×120px)
- **공격 버튼**: 우측 하단 (60×60px, MIN_TOUCH 48px 이상 보장)
- **차원 전환 버튼**: 우측 중앙 (60×60px)
- **스킬 버튼 1~3**: 우측 하단 세로 배치 (각 52×52px)
- 모든 터치 버튼: `Math.max(CONFIG.MIN_TOUCH, size)` 강제 적용 [F11]

```javascript
// 터치 타겟 크기 보장 패턴
const btnSize = Math.max(CONFIG.MIN_TOUCH, desiredSize);
```

### 3.4 반응형 UI 레이아웃 [F39, F42]
```javascript
// menuY 하한 바운드 패턴 — 모든 버튼 배치에 적용
const menuY = Math.min(H * 0.72, H - (btnCount * (btnH + gap) + margin));

// 뷰포트별 레이아웃 조정
// 320px: 조이스틱 축소(50px), 버튼 48px, HUD 간소화
// 480px: 조이스틱 60px, 버튼 52px, 미니맵 축소
// 768px+: 풀 UI, 미니맵 확대
// 1024px+: 사이드 패널 표시 가능
```

**뷰포트 테스트 매트릭스** (리뷰 전 필수 검증):
| 뷰포트 | 검증 항목 |
|--------|----------|
| 320×480 | 모든 버튼 화면 내 수용, HUD 겹침 없음 |
| 480×800 | 조이스틱+버튼 동시 표시, 게임 영역 최소 60% |
| 768×1024 | 미니맵 정상 표시, 인벤토리 스크롤 동작 |
| 1920×1080 | 풀스크린 렌더링, devicePixelRatio 적용 |

---

## §4. 시각적 스타일 가이드

### 4.1 기본 원칙
- **assets/ 디렉토리 절대 생성 금지** [F1] — 모든 그래픽은 Canvas 인라인 드로잉
- **외부 CDN 0건** [F2] — 폰트는 시스템 폰트 + Canvas fillText
- **SVG 필터 금지** — feGaussianBlur, feDropShadow 등 사용 금지
- thumbnail.svg만 유일한 외부 파일

### 4.2 색상 팔레트

#### 빛 차원
| 용도 | 색상 | HEX |
|------|------|-----|
| 배경 | 따뜻한 아이보리 | #FFF8E7 |
| 벽 | 황금빛 갈색 | #C4943A |
| 바닥 | 연한 베이지 | #F5E6C8 |
| 플레이어 | 빛나는 금색 | #FFD700 |
| 적 (빛 속성) | 순백 | #FFFFFF (글로우) |
| UI 액센트 | 호박색 | #FF8C00 |

#### 그림자 차원
| 용도 | 색상 | HEX |
|------|------|-----|
| 배경 | 깊은 남색 | #0A0A2E |
| 벽 | 짙은 보라 | #2D1B69 |
| 바닥 | 어두운 회색 | #1A1A3E |
| 플레이어 | 보라빛 실루엣 | #9B59B6 |
| 적 (그림자 속성) | 진홍 | #DC143C (글로우) |
| UI 액센트 | 네온 보라 | #8B5CF6 |

#### 공통
| 용도 | 색상 | HEX |
|------|------|-----|
| HP 바 | 생명 빨강 | #E74C3C |
| 에너지 바 | 차원 파랑 | #3498DB |
| 경험치 바 | 성장 초록 | #2ECC71 |
| 골드 | 황금 | #F1C40F |
| 크리티컬 텍스트 | 밝은 노랑 | #FFEB3B |

### 4.3 차원 전환 시각 효과
1. **전환 시작** (0~200ms): 화면 중앙에서 원형 파문이 퍼져나감
2. **전환 중** (200~400ms): 이전 차원이 페이드아웃 + 새 차원이 페이드인 (알파 크로스페이드)
3. **전환 완료** (400~500ms): 새 차원 색상으로 완전 전환 + 가장자리 글로우 이펙트
4. **파티클**: 전환 중 빛/그림자 파티클 20개 방사

### 4.4 드로잉 함수 시그니처 표준 [F9]
```javascript
// 모든 드로잉 함수는 순수 함수: 전역 변수 참조 금지
drawPlayer(ctx, x, y, size, dimension, animFrame, facing)
drawEnemy(ctx, x, y, size, type, dimension, hp, maxHp, animFrame)
drawTile(ctx, x, y, tileSize, tileType, dimension, revealed)
drawProjectile(ctx, x, y, size, dimension, type)
drawBoss(ctx, x, y, size, phase, hp, maxHp, animFrame, dimension)
drawItem(ctx, x, y, size, itemType, rarity)
drawParticle(ctx, x, y, size, alpha, color)
drawHUD(ctx, W, H, playerState, gameState, dimension)
drawMinimap(ctx, x, y, w, h, mapData, playerPos, dimension)
drawButton(ctx, x, y, w, h, text, state, style)
```

### 4.5 캐릭터 디자인
- **플레이어**: 후드를 쓴 수호자. 빛 차원에서는 금빛 윤곽, 그림자 차원에서는 보라빛 실루엣
  - 8방향 이동 포즈 (프레임 기반 애니메이션, 3프레임/방향)
  - 공격 모션 (2프레임)
  - 차원 전환 모션 (3프레임 — 외곽선 번쩍임)
  - 피격 모션 (1프레임 + 깜빡임)
- **적 5종**: 그림자 슬라임, 빛 위스프, 그림자 기사, 차원 수정, 팬텀 마법사
- **보스 3체**: 각각 전용 대형 드로잉 (200×200px 기준)

### 4.6 배경 및 환경
- **타일 기반 맵**: 32×32px 기본 타일 (줌 레벨에 따라 가변)
- **배경 레이어**: 오프스크린 캐싱으로 매 프레임 재드로잉 방지
  - `buildBgCache(dimension, floor)`: 차원+층별 배경 캐시
  - `buildGridCache(mapData, dimension)`: 지형 그리드 캐시
  - `buildUICache(W, H)`: HUD 프레임 캐시
- **파괴 가능 오브젝트**: 상자(아이템 드롭), 수정(에너지 회복), 고대 비문(스토리)
- **인터랙티브 배경**: 횃불(빛 반경 확대), 차원 균열(에너지 회복 지점), 함정(스파이크/화살)

### 4.7 카메라 시스템
- **기본**: 플레이어 중심 추적 (부드러운 따라가기, lerp 0.08)
- **보스전 진입**: 줌 아웃 (1.0x → 0.7x, 600ms tween)
- **보스 등장 컷신**: 카메라 팬 (플레이어 → 보스 → 돌아오기, 2초)
- **히든 스테이지**: 서서히 줌 인 (1.0x → 1.3x, 분위기 연출)

---

## §5. 핵심 게임 루프 (프레임 기준 로직 흐름)

### 5.1 초기화 순서 [F12]
```
1. 상수/CONFIG 선언
2. let 변수 선언 (canvas, ctx, 게임 상태)
3. DOM 로드 대기 (DOMContentLoaded)
4. canvas = document.getElementById(...)
5. ctx = canvas.getContext('2d')
6. 이벤트 리스너 등록
7. SoundManager 초기화
8. TweenManager 초기화
9. resizeCanvas() 호출
10. 타이틀 화면 진입
```

### 5.2 메인 루프 (60fps 목표)
```
function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  const dt = Math.min(timestamp - lastTime, 50); // 프레임 스파이크 방지 (50ms 상한)
  lastTime = timestamp;

  // 1. 입력 처리 (inputManager.update())
  // 2. TweenManager.update(dt) — 모든 상태에서 호출 [F7 매트릭스 참조]
  // 3. 상태별 업데이트 (switch on gameState)
  //    - GAMEPLAY: 물리, AI, 충돌, 차원 로직, 파티클
  //    - PAUSED: UI 애니메이션만
  //    - BOSS_CUTSCENE: 카메라 tween만
  //    - 기타: 해당 상태 로직
  // 4. 렌더링 (switch on gameState)
  // 5. 사운드 업데이트
}
```

**setTimeout 0건 원칙** [F4]: 모든 지연은 TweenManager로 처리
```javascript
// ❌ 금지
setTimeout(() => enterState('GAMEPLAY'), 1000);

// ✅ 올바른 방식
tw.add({ duration: 1000, onComplete: () => {
  if (transitionGuard) return; // 가드 플래그 [F5]
  transitionGuard = true;
  beginTransition('GAMEPLAY');
}});
```

**TweenManager clearImmediate() 패턴** [F13]:
```javascript
TweenManager.clearImmediate = function() {
  this._tweens.length = 0;
  this._pendingCancel = false;
};
// cancelAll() 후 즉시 add() 필요 시 clearImmediate() 사용
```

**단일 값 갱신 경로 통일** [F14]:
- 차원 에너지: TweenManager에 의한 회복만 허용, 직접 대입은 소모 시에만
- HP: 데미지 계산 함수의 반환값으로만 감소, 직접 대입 금지

### 5.3 코드 영역 구분 가이드 [F41]
단일 파일(index.html) 내 8개 영역을 주석으로 명확히 구분:
```
// ═══════════════════════════════════════════
// REGION 1: CONFIG & CONSTANTS (L1~L150)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 2: UTILITY CLASSES (L151~L400)
//   - TweenManager, ObjectPool, SoundManager
//   - ScrollManager, InputManager
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 3: DRAWING FUNCTIONS (L401~L800)
//   - drawPlayer, drawEnemy, drawTile, drawBoss
//   - drawHUD, drawMinimap, drawButton
//   - buildBgCache, buildGridCache, buildUICache
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 4: PROCEDURAL GENERATION (L801~L1050)
//   - generateFloor, placeDoors, placeEnemies
//   - placeItems, placeTraps, generateBossRoom
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 5: GAME SYSTEMS (L1051~L1500)
//   - DimensionSystem, CombatSystem
//   - LevelUpSystem, ItemSystem, UpgradeTree
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 6: STATE MACHINE & TRANSITIONS (L1501~L1800)
//   - enterState, beginTransition, STATE_PRIORITY
//   - 각 상태별 update/render 함수
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 7: INPUT & EVENT HANDLERS (L1801~L2000)
//   - 키보드, 마우스, 터치 이벤트
//   - 가상 조이스틱 로직
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 8: INITIALIZATION & MAIN LOOP (L2001~끝)
//   - DOMContentLoaded, resizeCanvas
//   - gameLoop, 로컬라이제이션
// ═══════════════════════════════════════════
```

---

## §6. 상태 머신

### 6.1 상태 목록 및 우선순위 [F6]
```
STATE_PRIORITY = {
  LOADING:       0,
  TITLE:         1,
  DIFFICULTY:    2,
  TUTORIAL:      3,
  FLOOR_INTRO:   4,
  GAMEPLAY:      5,
  DIMENSION_SHIFT: 6,  // 차원 전환 연출 (짧은 0.5초)
  PAUSED:        7,
  LEVEL_UP:      8,
  SHOP:          9,
  INVENTORY:    10,
  BOSS_CUTSCENE: 11,
  BOSS_FIGHT:   12,
  VICTORY:      13,
  GAMEOVER:     14,  // 최고 우선순위
};

ESCAPE_ALLOWED = {
  PAUSED: 'GAMEPLAY',
  SHOP: 'GAMEPLAY',
  INVENTORY: 'GAMEPLAY',
  LEVEL_UP: null,  // ESC 불가 — 반드시 선택
};
```

### 6.2 상태 × 시스템 매트릭스 [F7]

| 상태 | Tween | Physics | AI | Combat | Particle | Sound | Camera | Input | Render |
|------|:-----:|:-------:|:--:|:------:|:--------:|:-----:|:------:|:-----:|:------:|
| LOADING | ✅ | — | — | — | — | — | — | — | ✅ |
| TITLE | ✅ | — | — | — | ✅ | ✅ | — | ✅ | ✅ |
| DIFFICULTY | ✅ | — | — | — | ✅ | ✅ | — | ✅ | ✅ |
| TUTORIAL | ✅ | ✅ | — | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| FLOOR_INTRO | ✅ | — | — | — | ✅ | ✅ | ✅ | — | ✅ |
| GAMEPLAY | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DIMENSION_SHIFT | ✅ | — | — | — | ✅ | ✅ | ✅ | — | ✅ |
| PAUSED | ✅ | — | — | — | — | 🔇 | — | ✅ | ✅ |
| LEVEL_UP | ✅ | — | — | — | ✅ | ✅ | — | ✅ | ✅ |
| SHOP | ✅ | — | — | — | — | ✅ | — | ✅ | ✅ |
| INVENTORY | ✅ | — | — | — | — | ✅ | — | ✅ | ✅ |
| BOSS_CUTSCENE | ✅ | — | — | — | ✅ | ✅ | ✅ | — | ✅ |
| BOSS_FIGHT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| VICTORY | ✅ | — | — | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| GAMEOVER | ✅ | — | — | — | ✅ | ✅ | — | ✅ | ✅ |

> 🔇 = 볼륨 감소 (BGM 30%), ✅ = 활성, — = 비활성

### 6.3 상태 전환 규칙
```
beginTransition(targetState) {
  if (STATE_PRIORITY[targetState] < STATE_PRIORITY[currentState]) {
    // 우선순위 낮은 상태로의 전환은 GAMEOVER 체크
    if (currentState === 'GAMEOVER') return; // GAMEOVER는 최우선 [Cycle 3 B2]
  }
  if (transitionGuard) return; // 이중 전환 방지 [F5]
  transitionGuard = true;

  tw.add({
    target: screenAlpha, from: 1, to: 0,
    duration: 300,
    onComplete: () => {
      enterState(targetState);
      tw.add({
        target: screenAlpha, from: 0, to: 1,
        duration: 300,
        onComplete: () => { transitionGuard = false; }
      });
    }
  });
}

// 예외: PAUSED는 즉시 전환 (beginTransition 미경유)
// PAUSED → GAMEPLAY: enterState('GAMEPLAY') 직접 호출
// DIMENSION_SHIFT: 0.5초 연출 후 자동 복귀
```

### 6.4 Canvas 기반 모달 [F3]
```javascript
// confirm()/alert() 절대 금지 — Canvas 모달 사용
function showModal(title, message, buttons) {
  modalState = { title, message, buttons, alpha: 0 };
  tw.add({ target: modalState, prop: 'alpha', to: 1, duration: 200 });
  // 버튼 클릭으로 콜백 실행
}
```

---

## §7. 차원 시스템 (핵심 메카닉)

### 7.1 차원 전환 규칙
- **에너지 소모**: 전환당 15 (최대 100)
- **에너지 회복**: 1.5/초 (쉬움: 2.0, 어려움: 1.0)
- **쿨다운**: 0.5초 (연타 방지)
- **전환 불가 조건**: 에너지 < 15, 쿨다운 중, BOSS_CUTSCENE 상태

### 7.2 차원별 지형 규칙
```
빛 차원 맵:        그림자 차원 맵:
█ █ █ █ █          █ · █ · █
█ · · · █          · · · · ·
█ · █ · █    →     █ · · · █
█ · · · █          · · █ · ·
█ █ █ █ █          █ · █ · █

█ = 벽, · = 통로
```
- 빛 차원의 벽 중 약 40%가 그림자 차원에서는 통로
- 그림자 차원 고유 벽도 존재 (약 20%)
- **핵심 퍼즐**: 양쪽 차원 지형을 머릿속에 겹쳐 출구까지의 경로를 찾기

### 7.3 적 차원 속성
| 적 유형 | 차원 속성 | 빛에서 | 그림자에서 |
|---------|----------|--------|-----------|
| 그림자 슬라임 | 그림자 전용 | 투명 (무해) | 활성 (공격) |
| 빛 위스프 | 빛 전용 | 활성 (공격) | 투명 (무해) |
| 그림자 기사 | 그림자 우세 | 약화 (50% 피해) | 강화 (150% 피해) |
| 차원 수정 | 혼합 | 활성 | 활성 (패턴 변경) |
| 팬텀 마법사 | 적응형 | 플레이어 반대 차원으로 자동 전환 |

### 7.4 차원 전환 에너지 관리 전략
- **공격적 전환**: 적 약점 차원으로 자주 전환 → 에너지 고갈 위험
- **수비적 전환**: 위기 시에만 전환 → 적 회피 가능하나 퍼즐 해결 지연
- **유물로 에너지 효율 강화**: "차원 나침반"(전환 비용 -3), "그림자 렌즈"(그림자 차원 에너지 회복 2배)

---

## §8. 난이도 시스템

### 8.1 층별 밸런스 곡선 [F40]

#### 초반 (1~5층) — 학습 구간
| 파라미터 | 값 | 설명 |
|---------|-----|------|
| 적 수/방 | 2~4 | 기본 전투 학습 |
| 적 HP | 20~40 | 2~4타에 처치 |
| 적 공격력 | 5~10 | 플레이어 HP(100) 대비 여유 |
| 퍼즐 복잡도 | 1~2 전환 | 단순 경로 차단 |
| 아이템 드롭률 | 40% | 넉넉한 보급 |
| 예상 클리어 시간/층 | 2~3분 | |

#### 중반 (6~10층) — 도전 구간
| 파라미터 | 값 | 설명 |
|---------|-----|------|
| 적 수/방 | 4~7 | 군중 제어 필요 |
| 적 HP | 40~80 | 효율적 차원 전환 필수 |
| 적 공격력 | 10~20 | 회피 필수 |
| 퍼즐 복잡도 | 3~5 전환 | 다중 전환 경로 |
| 시간제 퍼즐 방 | 출현 (30초 제한) | |
| 아이템 드롭률 | 25% | 선택적 전투 |
| 예상 클리어 시간/층 | 3~5분 | |

#### 후반 (11~15층) — 극한 구간
| 파라미터 | 값 | 설명 |
|---------|-----|------|
| 적 수/방 | 6~10 | 양 차원 적 동시 출현 |
| 적 HP | 80~150 | 스킬+아이템 조합 필수 |
| 적 공격력 | 20~35 | 2~3피 사망 가능 |
| 퍼즐 복잡도 | 5~8 전환 | 양 차원 동시 위협 |
| 함정 | 스파이크, 차원 역전 함정 | |
| 아이템 드롭률 | 15% | 자원 관리 극대화 |
| 예상 클리어 시간/층 | 5~8분 | |

### 8.2 적응형 난이도 보조 (선택)
- 같은 방에서 3회 이상 사망 시: "비밀 통로가 보인다" 힌트 표시
- 5회 연속 사망 시: 해당 런에서 에너지 회복 +30% 버프

---

## §9. 보스 시스템

### 9.1 보스 3체 스펙

#### 5층 보스: 그림자 파수꾼
- **HP**: 500 (쉬움 350, 어려움 750)
- **페이즈 1** (HP 100~50%): 그림자 차원에서만 공격 가능. 빛 차원에서는 무적
  - 패턴: 직선 돌진 → 벽에 충돌 시 스턴 2초 → 공격 기회
- **페이즈 2** (HP 50~0%): 양 차원 빠른 전환. 3초 주기로 차원 변경
  - 패턴: 방사형 탄환 6발 + 돌진
- **드롭**: 봉인석 #1, "그림자 망토" (유물)

#### 10층 보스: 차원 직조자
- **HP**: 1000 (쉬움 700, 어려움 1500)
- **페이즈 1** (HP 100~60%): 맵 타일을 실시간으로 변경 (퍼즐 요소)
  - 패턴: 3×3 영역 차원 반전 → 경로 재탐색 필요
- **페이즈 2** (HP 60~30%): 분신 2체 소환 (약한 분신은 반대 차원)
  - 패턴: 분신과 동시 공격 → 본체 식별 퍼즐
- **페이즈 3** (HP 30~0%): 전 맵 차원 불안정 (2초마다 자동 전환)
  - 패턴: 대형 레이저 → 차원 전환으로 회피
- **드롭**: 봉인석 #2, "차원 나침반" (유물)

#### 15층 보스: 그림자 군주
- **HP**: 2000 (쉬움 1400, 어려움 3000)
- **페이즈 1** (HP 100~70%): 소환수 + 장판 공격
- **페이즈 2** (HP 70~40%): 양 차원 동시 존재 (양쪽에서 피해)
- **페이즈 3** (HP 40~10%): 차원 붕괴 → 맵 축소 (외곽에서 데미지)
- **페이즈 4** (HP 10~0%): 분노 모드 → 전 패턴 빠른 속도로 반복
- **드롭**: 봉인석 #3, 게임 클리어

### 9.2 보스 페이즈 전환 다이어그램 [Cycle 22 패턴]
```
[그림자 파수꾼]
  ENTER → CUTSCENE(2s) → PHASE1(HP>50%)
    │                       │ HP≤50%
    │                       ▼
    │                    PHASE2(HP>0%)
    │                       │ HP≤0%
    │                       ▼
    └──────────────────── DEFEAT → DROP → FLOOR_CLEAR

[차원 직조자]
  ENTER → CUTSCENE(3s) → PHASE1(HP>60%)
    │                       │ HP≤60%
    │                       ▼
    │                    PHASE2(HP>30%)
    │                       │ HP≤30%
    │                       ▼
    │                    PHASE3(HP>0%)
    │                       │ HP≤0%
    │                       ▼
    └──────────────────── DEFEAT → DROP → FLOOR_CLEAR

[그림자 군주]
  ENTER → CUTSCENE(4s) → PHASE1(HP>70%)
    │                       │ HP≤70%
    │                       ▼
    │                    PHASE2(HP>40%)
    │                       │ HP≤40%
    │                       ▼
    │                    PHASE3(HP>10%)
    │                       │ HP≤10%
    │                       ▼
    │                    PHASE4(HP>0%)
    │                       │ HP≤0%
    │                       ▼
    └──────────────────── DEFEAT → ENDING_CUTSCENE → VICTORY
```

### 9.3 보스전 진입 컷신 연출
1. BGM 페이드아웃 (500ms)
2. 카메라 팬: 플레이어 → 보스 위치 (800ms)
3. 보스 등장 애니메이션: 그림자에서 솟아오름 (600ms)
4. 보스 이름 + HP 바 표시 (400ms)
5. 보스 전용 BGM 시작
6. 카메라 줌 아웃 (0.7x, 400ms)
7. 전투 시작 (입력 활성화)

---

## §10. 프로시저럴 던전 생성

### 10.1 생성 알고리즘
- **방 기반 생성**: BSP(Binary Space Partitioning) 트리로 방 배치
- 각 층: 8~15방 (층이 깊을수록 방 증가)
- 방 크기: 5×5 ~ 12×12 타일
- 복도: 방과 방 사이 2타일 폭 연결

### 10.2 이중 차원 지형 생성
```
1. 빛 차원 맵 생성 (BSP)
2. 그림자 차원 맵 = 빛 차원 복사
3. 빛 차원 벽의 40%를 그림자 차원에서 통로로 변환 (랜덤)
4. 그림자 차원 고유 벽 20% 추가
5. 양 차원에서 출구 도달 가능 여부 검증 (BFS)
6. 도달 불가 시 → 통로 추가 또는 재생성
```

### 10.3 시드 기반 생성
- 런 시작 시 시드 자동 생성 (표시 가능)
- 동일 시드 → 동일 던전 (재현 가능)
- 시드 입력 기능 (타이틀 화면)

---

## §11. 점수 및 진행 시스템

### 11.1 점수 계산 [F8]
```javascript
// 판정 먼저, 저장 나중에
const newScore = calculateScore(kills, time, dimension_shifts, items);
const isNewBest = newScore > getBestScore(); // 판정 먼저
saveBestScore(newScore);                      // 저장 나중에
if (isNewBest) showNewBestEffect();
```

| 행동 | 점수 |
|------|------|
| 적 처치 | 10 × 적레벨 |
| 보스 처치 | 500 / 1000 / 2000 |
| 층 클리어 보너스 | 100 × 층수 |
| 무피격 클리어 보너스 | +50% |
| 차원 전환 횟수 보너스 | 50회 미만: +20%, 100회 초과: -10% |
| 비문 수집 | 50 / 개 |
| 히든 스테이지 클리어 | +5000 |

### 11.2 영구 업그레이드 트리
골드(런마다 30% 보존)로 구매하는 영구 강화:

| 카테고리 | 업그레이드 | 최대 레벨 | 비용(Lv당) |
|---------|-----------|----------|-----------|
| 체력 | HP 최대치 +10 | 10 | 50/100/150... |
| 공격 | 기본 공격력 +2 | 8 | 80/160/240... |
| 차원 | 에너지 최대치 +10 | 8 | 100/200/300... |
| 차원 | 에너지 회복 +0.2/초 | 5 | 150/300/450... |
| 탐험 | 미니맵 범위 +1 | 5 | 60/120/180... |
| 탐험 | 아이템 드롭률 +5% | 5 | 120/240/360... |
| 스킬 | 스킬 슬롯 +1 | 2 | 500/1000 |
| 히든 | ???(전 업그레이드 MAX 시 해금) | 1 | 5000 |

### 11.3 런 내 레벨업 시스템
- 적 처치 → 경험치 획득
- 레벨업 시 랜덤 스킬 3개 중 1개 선택:
  - **빛의 창** (빛 차원 공격 강화): 관통 공격
  - **그림자 단검** (그림자 차원 공격 강화): 연쇄 공격
  - **차원 방패**: 전환 직후 1초 무적
  - **에너지 흡수**: 처치 시 에너지 +5 회복
  - **투시**: 반대 차원 지형 반투명 표시
  - **가속**: 이동속도 +15%
  - **행운**: 아이템 드롭률 +20%
  - **재생**: HP 0.5/초 자연 회복

---

## §12. 사운드 디자인

### 12.1 BGM 루프 (Web Audio API)
| 상태 | 음악 스타일 | 루프 길이 |
|------|-----------|----------|
| 타이틀 | 신비로운 앰비언트 | 16마디 |
| 탐험 (빛) | 밝은 피아노 아르페지오 | 8마디 |
| 탐험 (그림자) | 어두운 신스 드론 | 8마디 |
| 보스전 | 긴장감 높은 타악 리듬 | 16마디 |
| 상점/업그레이드 | 평화로운 벨 사운드 | 8마디 |

### 12.2 효과음 (8종+)
| 효과음 | 트리거 | 생성 방식 |
|--------|--------|----------|
| 차원 전환 | Q 키 / 우클릭 | 피치 슬라이드 (빛→높음, 그림자→낮음) |
| 공격 (빛) | Space / 좌클릭 | 짧은 금속 타격음 |
| 공격 (그림자) | Space / 좌클릭 | 부드러운 스워시 |
| 피격 | 데미지 수신 | 임팩트 + 피치 다운 |
| 적 처치 | 적 HP 0 | 파열음 + 코인 소리 |
| 레벨업 | 경험치 충족 | 상승 아르페지오 |
| 아이템 획득 | 아이템 터치 | 밝은 벨 소리 |
| 보스 등장 | 보스전 진입 | 깊은 드럼 롤 |
| 퍼즐 해결 | 숨겨진 방 발견 | 신비로운 화음 |
| UI 클릭 | 버튼 터치 | 짧은 클릭음 |

### 12.3 사운드 스케줄링
```javascript
// setTimeout 금지 — Web Audio 네이티브 스케줄링 사용
const osc = audioCtx.createOscillator();
osc.start(audioCtx.currentTime);
osc.stop(audioCtx.currentTime + duration);

// 시퀀스: currentTime + delay로 스케줄링
notes.forEach((note, i) => {
  const osc = audioCtx.createOscillator();
  osc.frequency.value = note.freq;
  osc.start(audioCtx.currentTime + i * 0.15);
  osc.stop(audioCtx.currentTime + i * 0.15 + note.dur);
});
```

---

## §13. 검증 체크리스트

### 13.1 수치 정합성 테이블 [F10]
> 기획서 값 = 코드 CONFIG 상수. 불일치 시 CRITICAL.

| 기획서 항목 | CONFIG 상수 | 값 |
|------------|-------------|-----|
| 차원 에너지 최대 | `CONFIG.DIM_ENERGY_MAX` | 100 |
| 전환 비용 | `CONFIG.DIM_SHIFT_COST` | 15 |
| 에너지 회복/초 | `CONFIG.DIM_ENERGY_REGEN` | 1.5 |
| 전환 쿨다운 | `CONFIG.DIM_SHIFT_COOLDOWN` | 500 (ms) |
| 플레이어 HP | `CONFIG.PLAYER_HP` | 100 |
| 플레이어 공격력 | `CONFIG.PLAYER_ATK` | 10 |
| 플레이어 이동속도 | `CONFIG.PLAYER_SPEED` | 120 (px/s) |
| 터치 타겟 최소 | `CONFIG.MIN_TOUCH` | 48 (px) |
| 보스1 HP | `CONFIG.BOSS1_HP` | 500 |
| 보스2 HP | `CONFIG.BOSS2_HP` | 1000 |
| 보스3 HP | `CONFIG.BOSS3_HP` | 2000 |
| 골드 보존률 | `CONFIG.GOLD_RETAIN_RATE` | 0.3 |
| 카메라 lerp | `CONFIG.CAM_LERP` | 0.08 |
| 보스전 줌 | `CONFIG.BOSS_ZOOM` | 0.7 |
| 프레임 스파이크 상한 | `CONFIG.MAX_DT` | 50 (ms) |

### 13.2 뷰포트 테스트 항목 [F39]
- [ ] 320×480: 타이틀 메뉴 버튼 모두 화면 내
- [ ] 320×480: 조이스틱 + 공격버튼 겹침 없음
- [ ] 480×800: HUD (HP/에너지/미니맵) 겹침 없음
- [ ] 480×800: 레벨업 선택지 3개 모두 화면 내
- [ ] 768×1024: 업그레이드 트리 스크롤 동작
- [ ] 1920×1080: devicePixelRatio 적용 확인
- [ ] 풀스크린 전환 후 UI 재배치 확인

### 13.3 스모크 테스트 게이트 [F15]
리뷰 제출 전 필수 확인 (8항목):
1. [ ] `index.html` 파일 존재
2. [ ] 브라우저에서 로드 시 콘솔 에러 0건
3. [ ] 타이틀 화면 표시됨
4. [ ] 게임 시작 → 1층 진입 가능
5. [ ] 차원 전환(Q키) 동작
6. [ ] 적 공격 + 처치 가능
7. [ ] ESC → 일시정지 → 재개 동작
8. [ ] 사망 → GAMEOVER 화면 표시

### 13.4 밸런스 검증 항목 [F40]
- [ ] 1~5층: 레벨업 없이 클리어 가능한가? (초보자 접근성)
- [ ] 6~10층: 적절한 레벨업+아이템으로 클리어 가능한가?
- [ ] 11~15층: 영구 업그레이드 없이 하드코어 플레이어가 클리어 가능한가?
- [ ] 보스1: 첫 도전에서 50% 확률로 클리어 가능한 난이도인가?
- [ ] 보스3: 충분한 업그레이드+스킬 조합이 필요한 난이도인가?
- [ ] 에너지 관리: 무분별한 차원 전환 시 벌칙(에너지 고갈)이 명확한가?
- [ ] 골드 보존 30%: 10런 내에 의미있는 영구 업그레이드 가능한가?

### 13.5 기능별 세부 체크리스트
> "절반 구현" 방지를 위한 A+B+C 분리 확인 [Cycle 12, 15 교훈]

- 차원 전환: [ ] 비주얼 전환 [ ] 지형 변경 [ ] 적 속성 변경 [ ] 에너지 소모 [ ] 쿨다운
- 보스전: [ ] 컷신 [ ] 페이즈 전환 [ ] 고유 패턴 [ ] 드롭 [ ] BGM 전환
- 레벨업: [ ] 3택 표시 [ ] 선택 적용 [ ] 중복 방지 [ ] UI 피드백
- 영구 업그레이드: [ ] 저장 [ ] 로드 [ ] 적용 [ ] UI 표시 [ ] 최대레벨 제한

---

## §14. 다국어 지원

### 14.1 텍스트 구조
```javascript
const TEXT = {
  ko: {
    title: '팬텀 시프트',
    subtitle: '차원의 수호자',
    start: '게임 시작',
    continue: '이어하기',
    upgrade: '업그레이드',
    settings: '설정',
    difficulty: { easy: '쉬움', normal: '보통', hard: '어려움' },
    dimension: { light: '빛의 차원', shadow: '그림자 차원' },
    boss: { guardian: '그림자 파수꾼', weaver: '차원 직조자', lord: '그림자 군주' },
    floor: '층',
    energy: '차원 에너지',
    // ... 전체 UI 텍스트
  },
  en: {
    title: 'Phantom Shift',
    subtitle: 'Guardian of Dimensions',
    start: 'Start Game',
    continue: 'Continue',
    upgrade: 'Upgrades',
    settings: 'Settings',
    difficulty: { easy: 'Easy', normal: 'Normal', hard: 'Hard' },
    dimension: { light: 'Light Realm', shadow: 'Shadow Realm' },
    boss: { guardian: 'Shadow Guardian', weaver: 'Dimension Weaver', lord: 'Shadow Lord' },
    floor: 'Floor',
    energy: 'Dimension Energy',
    // ... full UI text
  }
};
```

---

## §15. localStorage 데이터 스키마

```javascript
const SAVE_KEY = 'phantom-shift-save';
const SAVE_VERSION = 1;

// 저장 구조
{
  version: 1,
  lang: 'ko',                    // 선택 언어
  bestScore: 0,                   // 최고 점수
  bestFloor: 0,                   // 최고 도달 층
  totalRuns: 0,                   // 총 런 횟수
  totalKills: 0,                  // 총 처치 수
  gold: 0,                        // 영구 통화
  upgrades: {                     // 영구 업그레이드 레벨
    hp: 0, atk: 0, energy: 0, regen: 0,
    minimap: 0, dropRate: 0, skillSlot: 0, hidden: 0
  },
  unlockedLore: [],               // 수집한 비문 ID 목록
  hiddenUnlocked: false,          // 히든 스테이지 해금 여부
  settings: {
    sfxVolume: 0.7,
    bgmVolume: 0.5,
    difficulty: 'normal',
    showDamageNumbers: true
  }
}

// 마이그레이션
function loadSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return DEFAULT_SAVE;
  const data = JSON.parse(raw);
  if (data.version < SAVE_VERSION) return migrate(data);
  return data;
}
```

---

## §16. 사이드바 메타데이터 (게임 페이지용)

```yaml
game:
  title: "팬텀 시프트"
  description: "빛과 그림자 이중 차원을 실시간 전환하며 프로시저럴 던전을 탐험하는 퍼즐-액션 로그라이크. 차원의 수호자가 되어 15층 던전의 대균열을 봉인하라."
  genre: ["puzzle", "action"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/방향키: 8방향 이동"
    - "Q: 차원 전환 (빛 ↔ 그림자)"
    - "Space/클릭: 공격"
    - "E: 상호작용"
    - "1~3: 스킬 사용"
    - "ESC: 일시정지"
    - "터치: 가상 조이스틱 + 버튼"
  tags:
    - "#로그라이크"
    - "#퍼즐액션"
    - "#차원전환"
    - "#프로시저럴"
    - "#던전탐험"
    - "#보스전"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## §17. 썸네일 (thumbnail.svg)

### 구도
- **시네마틱 구도**: 화면 중앙에 빛/그림자 경계선, 경계선 위에 서있는 플레이어 실루엣
- 왼쪽: 빛 차원 (금빛 성소, 따뜻한 톤)
- 오른쪽: 그림자 차원 (보라빛 균열, 차가운 톤)
- 하단: 게임 타이틀 텍스트
- **크기**: 최소 20KB, SVG viewBox 400×300

---

## §18. 구현 사양 요약

| 항목 | 목표 |
|------|------|
| 코드 줄 수 | 2,400+ |
| 상태 수 | 15 |
| Canvas 드로잉 함수 | 22~25개 |
| 적 종류 | 5종 + 보스 3체 |
| 층 수 | 15 + 히든 1 |
| 영구 업그레이드 | 8종 |
| 런 내 스킬 | 8종 |
| 효과음 | 10종+ |
| BGM 루프 | 5종 |
| 다국어 | 한국어 + 영어 |
| assets/ 디렉토리 | ❌ 절대 생성 금지 |
| setTimeout | ❌ 0건 |
| 외부 CDN | ❌ 0건 |

---

_기획서 끝 | InfiniTriX 사이클 #23 — 팬텀 시프트 (Phantom Shift)_
