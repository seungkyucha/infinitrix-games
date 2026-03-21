---
game-id: mini-dungeon-dice
title: 미니 던전 다이스
genre: action, strategy
difficulty: medium
---

# 미니 던전 다이스 — 상세 기획서

_사이클 #14 | 작성일: 2026-03-21_

---

## §0. 이전 사이클 피드백 반영 매핑

> Cycle 13 포스트모템 "아쉬웠던 점" + platform-wisdom 누적 교훈을 기획 단계에서 선제 대응한다.

| # | 출처 | 문제 | 이번 기획서 해결 방법 | 해당 섹션 |
|---|------|------|----------------------|-----------|
| F1 | Cycle 13 아쉬운점 | 3회 리뷰 소요 — `CONFIG.MIN_TOUCH_TARGET` 선언-구현 괴리 | 모든 버튼 렌더링에서 `btnW = CONFIG.MIN_TOUCH_TARGET`, `btnH = CONFIG.MIN_TOUCH_TARGET` **직접 참조** 패턴 강제. Math.max 유틸 불필요 — 선언부에서 바로 크기 지정 | §4, §12.3 |
| F2 | Cycle 13 아쉬운점 | SoundManager setTimeout 잔존 | Web Audio `ctx.currentTime + offset` 네이티브 스케줄링만 허용. setTimeout 0건 목표 | §9, §12.5 |
| F3 | Cycle 14 wisdom | canvas 이벤트 리스너 init() 외부 등록 → TypeError | **모든 이벤트 리스너는 init() 내부에서만 등록.** DOM 할당 전 DOM 접근 원천 차단 | §5, §12.1 |
| F4 | Cycle 14 wisdom | 일시정지 버튼 48×36px — 높이 미달 | 버튼 크기를 너비·높이 **독립적으로** `CONFIG.MIN_TOUCH_TARGET` 이상 보장 | §4.7, §12.3 |
| F5 | Cycle 11/14 wisdom | let/const TDZ 크래시 + 초기화 순서 오류 | 변수 선언 → DOM 할당 → 이벤트 등록 → init() 순서 명시. §12.1 초기화 순서 체크리스트 | §5, §12.1 |
| F6 | Cycle 1~14 wisdom | assets/ 디렉토리 재발 (13사이클 연속) | **빈 index.html에서 시작.** assets/ 디렉토리 절대 생성 금지. 100% Canvas + Web Audio | §8, §12.6 |
| F7 | Cycle 2 wisdom | 상태×시스템 매트릭스 누락 | §6에 전체 상태×시스템 매트릭스 선행 작성 | §6 |
| F8 | Cycle 3/4 wisdom | 가드 플래그 누락 → 콜백 반복 호출 | 모든 상태 전환에 `transitioning` 가드 + TransitionGuard 패턴 적용 | §6.2 |
| F9 | Cycle 2/5 wisdom | setTimeout 상태 전환 | tween onComplete 콜백으로만 상태 전환. setTimeout 사용 완전 금지 | §5, §12.5 |
| F10 | Cycle 5 wisdom | beginTransition() 우회 직접 전환 | 모든 화면 전환은 beginTransition() 경유 필수. PAUSED만 예외 허용 | §6.2 |
| F11 | Cycle 7/8 wisdom | 기획서 수치 ↔ 코드 수치 불일치 | §13 수치 정합성 검증 테이블 필수 포함 | §13 |
| F12 | Cycle 6 wisdom | 전역 참조 함수 → 테스트 불가 | 순수 함수 패턴 — 모든 게임 로직 함수는 파라미터로 데이터 수신 | §10 |
| F13 | Cycle 10 wisdom | 게임 루프 try-catch 미적용 | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` 기본 적용 | §5.3, §12.4 |
| F14 | Cycle 13 제안 | 시뮬레이션/경영 장르 심화 | action + strategy 조합으로 장르 균형 개선 (action 18.8% → 보강) | §1 |
| F15 | Cycle 14 wisdom | 스모크 테스트 3단계 미충족 | 리뷰 제출 전: (1) index.html 존재 (2) 페이지 로드 (3) 콘솔 에러 0건 | §12.7 |
| F16 | Cycle 10 wisdom | 수정 회귀 (render 시그니처 변경) | 수정 시 전체 플로우 회귀 테스트 필수 | §12.8 |
| F17 | Cycle 3/7 wisdom | 유령 변수 (선언만 하고 미사용) | §13.2 변수 사용처 검증 테이블 포함 | §13.2 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
주사위를 굴려 던전을 탐험하는 **턴 기반 로그라이트**. 매 전투에서 3~6개의 주사위를 굴려 공격/방어/회복 슬롯에 배치하고, 층을 클리어할 때마다 주사위를 업그레이드하거나 새 주사위를 획득한다. 5층 보스를 처치하면 승리.

### 핵심 재미 요소
1. **주사위 배치의 전략적 의사결정**: 3~6개 주사위 → 3개 슬롯(공격/방어/회복). "이번 턴 공격에 몰빵? 방어를 두텁게?" 매 턴 고민
2. **로그라이트 리플레이**: 매 판 랜덤 주사위 조합 + 랜덤 적 배치 → 무한 리플레이 가치
3. **주사위 성장의 빌드업**: 층 클리어 보상으로 주사위 면 업그레이드, 새 주사위 획득 → "내 주사위가 강해진다" 성장 쾌감
4. **한판 3~5분**: 짧은 세션으로 "한판만 더" 중독성

### 장르 균형 기여
- 현재 플랫폼: arcade 7개(43.8%), action 3개(18.8%, **최저**)
- 이 게임: **action + strategy** → action 부족 해소 + strategy 보강

### 트렌드 부합
- itch.io 로그라이트 TOP 장르: "Die in the Dungeon", "Dungeons & Degenerate Gamblers" 등 주사위 로그라이트 급성장
- 턴 기반이라 기존 플랫폼 인프라(Cycle 10 카드 배틀러)와 호환성 높음

---

## §2. 게임 규칙 및 목표

### 2.1 승리 조건
- 5층 던전의 최종 보스를 처치

### 2.2 패배 조건
- 플레이어 HP가 0 이하

### 2.3 턴 진행 흐름
```
[주사위 굴리기] → [슬롯에 배치 (드래그 or 탭)] → [전투 해결] → [결과 표시]
     ↓                                                          ↓
  3~6개 주사위                                            적 HP 0? → 다음 방/층
  자동 굴림                                              내 HP 0? → 게임 오버
```

### 2.4 전투 해결 순서
1. 플레이어 공격 슬롯 합산 → 적 방어력 차감 후 남은 값만큼 적 HP 감소
2. 적 공격 → 플레이어 방어 슬롯 합산만큼 경감 후 HP 차감 (최소 0)
3. 플레이어 회복 슬롯 합산 → HP 회복 (최대 HP 초과 불가)

### 2.5 던전 구조
| 층 | 방 수 | 일반 적 | 엘리트 | 보스 | 층 클리어 보상 |
|----|-------|---------|--------|------|---------------|
| 1층 | 3 | 2 | 0 | 1 | 주사위 면 +1 업그레이드 |
| 2층 | 3 | 1 | 1 | 1 | 새 주사위 획득 (3→4개) |
| 3층 | 4 | 2 | 1 | 1 | 주사위 면 +2 업그레이드 |
| 4층 | 4 | 2 | 1 | 1 | 새 주사위 획득 (4→5개) |
| 5층 | 3 | 1 | 1 | 1(최종) | — (승리 화면) |

- **총 전투 수**: 17회 (3+3+4+4+3)
- **예상 플레이 시간**: 1회 3~5분

### 2.6 주사위 시스템

#### 주사위 종류 (4종)
| 종류 | 아이콘 | 색상 | 면 범위(초기) | 설명 |
|------|--------|------|---------------|------|
| 공격 | 검 모양 | `#FF6B6B` (빨강) | 1~4 | 적에게 데미지 |
| 방어 | 방패 모양 | `#4ECDC4` (청록) | 1~3 | 받는 데미지 경감 |
| 회복 | 하트 모양 | `#45B7D1` (파랑) | 1~2 | HP 회복 |
| 만능 | 별 모양 | `#F7DC6F` (노랑) | 1~3 | 어느 슬롯에든 배치 가능, 보너스 +1 |

#### 초기 주사위 세트
- 공격 ×1, 방어 ×1, 회복 ×1 (총 3개)
- 2층/4층 클리어 보상으로 3→4→5개까지 증가 (최대 6은 만능 획득 시)

#### 주사위 업그레이드
- **면 업그레이드**: 선택한 주사위의 최대값 +1 또는 +2 (층에 따라 다름)
- **새 주사위 획득**: 4종 중 랜덤 2개 제시 → 1개 선택

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 동작 |
|----|------|
| `1`~`6` | 주사위 선택 (보유 수만큼) |
| `Q` / `W` / `E` | 선택된 주사위를 공격/방어/회복 슬롯에 배치 |
| `Space` | 전투 해결 (모든 주사위 배치 완료 시) |
| `R` | 주사위 재굴림 (턴당 1회, 층당 2회 제한) |
| `Esc` / `P` | 일시정지 |

### 3.2 마우스
| 동작 | 설명 |
|------|------|
| 클릭 주사위 | 주사위 선택 (하이라이트) |
| 클릭 슬롯 | 선택된 주사위를 해당 슬롯에 배치 |
| 드래그 주사위 → 슬롯 | 직접 드래그 배치 |
| 클릭 "전투" 버튼 | 전투 해결 |
| 클릭 "재굴림" 버튼 | 재굴림 (잔여 횟수 > 0일 때) |

### 3.3 터치 (모바일)
| 동작 | 설명 |
|------|------|
| 탭 주사위 | 선택 |
| 탭 슬롯 | 배치 |
| 드래그 주사위 → 슬롯 | 직접 배치 |
| 탭 "전투" 버튼 | 전투 해결 |
| 탭 "재굴림" 버튼 | 재굴림 |

> **모든 탭 가능 요소**: `CONFIG.MIN_TOUCH_TARGET`(48px) 이상 보장 (F1, F4 반영)
> **터치 설정**: `passive: false` + CSS `touch-action: none` 스크롤 방지

---

## §4. 시각적 스타일 가이드

### 4.1 색상 팔레트
| 용도 | 색상 | HEX |
|------|------|-----|
| 배경 (던전) | 짙은 남색 | `#1A1A2E` |
| 배경 그라디언트 | 어두운 보라 | `#16213E` |
| UI 패널 | 반투명 검정 | `rgba(0,0,0,0.7)` |
| 공격 주사위/슬롯 | 빨강 | `#FF6B6B` |
| 방어 주사위/슬롯 | 청록 | `#4ECDC4` |
| 회복 주사위/슬롯 | 파랑 | `#45B7D1` |
| 만능 주사위 | 노랑 | `#F7DC6F` |
| 적 HP 바 | 진홍 | `#E74C3C` |
| 플레이어 HP 바 | 초록 | `#2ECC71` |
| 텍스트 메인 | 흰색 | `#FFFFFF` |
| 텍스트 서브 | 연회색 | `#B0B0B0` |
| 보스 강조 | 금색 | `#FFD700` |
| 슬롯 비어있음 | 어두운 보라 | `#3D3D5C` |
| 슬롯 배치됨 | 해당 주사위 색상 alpha 0.3 | — |

### 4.2 배경 스타일
- 던전 벽돌 패턴: Canvas `fillRect` 반복으로 벽돌 텍스처
- 층별 색조: 1층 회색(`#2C2C3A`) → 2층 갈색(`#3A2C1A`) → 3층 청록(`#1A3A3A`) → 4층 보라(`#2E1A3A`) → 5층 진홍(`#3A1A1A`)
- **offscreen Canvas 캐시**: 배경을 1회 렌더 후 `drawImage`로 재사용 (Cycle 13 패턴)

### 4.3 주사위 렌더링
- **크기**: 64×64px (터치 영역 충분)
- **형태**: 둥근 사각형 (cornerRadius 8px) + 3D 효과 (아래쪽 4px 그림자 + 상단 하이라이트)
- **눈(pip)**: 원형 도트로 주사위 값 표시 (1~6 표준 배치)
- **종류 표시**: 주사위 배경색으로 구분 + 좌상단 작은 아이콘 (Canvas 드로잉)
- **굴림 애니메이션**: tween rotation(0→360°×3) + scale(0.5→1.2→1.0), 0.6초, easeOutBack
- **선택 상태**: 밝은 테두리 glow (globalAlpha 펄스 tween)

### 4.4 적 렌더링 (Canvas 기본 도형 — 에셋 0개)
| 적 | Canvas 구성 | 고유 색상 |
|----|-------------|-----------|
| 슬라임 | 큰 원(몸) + 작은 원×2(눈) | `#27AE60` 초록 |
| 박쥐 | 삼각×2(날개) + 원(머리) + 점×2(눈) | `#8E44AD` 보라 |
| 해골전사 | 원(두개골) + 사각(갑옷) + 선(검) | `#ECF0F1` 흰+회 |
| 고블린도적 | 사각(몸) + 삼각(모자) + 점×2(눈) | `#D4AC0D` 녹갈 |
| 다크메이지 | 삼각(로브) + 원(얼굴) + 작은 원(지팡이 보석) | `#6C3483` 진보라 |
| 미노타우르스 | 큰 사각(몸) + 삼각×2(뿔) + 점×2(눈) | `#873600` 갈색 |
| 드래곤(보스) | 큰 삼각(몸) + 원(머리) + 삼각×2(날개) + 삼각(꼬리) | `#C0392B` 진홍 |

- 피격 시: 빨간 플래시 (`globalAlpha` 깜빡, 0.1초 tween) + x축 흔들림 (±5px, 0.2초)
- 보스: 금색 왕관(`#FFD700`) 추가 렌더링 + 크기 1.5배

### 4.5 슬롯 UI
- 3개 슬롯 가로 배열: 공격(빨강 테두리) | 방어(청록 테두리) | 회복(파랑 테두리)
- 비어있을 때: 점선 테두리 (`setLineDash([4,4])`) + 중앙 아이콘 (alpha 0.3)
- 배치 시: 해당 주사위 축소(48×48) 렌더링 + 배경색 채움(alpha 0.2)
- 복수 주사위 배치: 슬롯 내 가로 나열 (최대 6개, 자동 축소)

### 4.6 데미지/회복 숫자 표시
- **ObjectPool** 기반 팝업 텍스트 (풀 크기: 20개)
- 빨강 텍스트 `-5` (데미지), 초록 텍스트 `+3` (회복), 청록 `Block!` (완전 방어)
- 위로 떠오르며 페이드아웃: tween `y -= 40`, `alpha 1→0`, 0.8초, easeOutCubic

### 4.7 버튼 최소 크기 규칙 (F1, F4 반영)
```
모든 인터랙티브 요소:
  width  >= CONFIG.MIN_TOUCH_TARGET (48px)
  height >= CONFIG.MIN_TOUCH_TARGET (48px)
```
| 요소 | 너비 | 높이 | 검증 |
|------|------|------|------|
| 일시정지 버튼 | 48px | 48px | >= 48 ✅ |
| 전투 버튼 | 160px | 48px | >= 48 ✅ |
| 재굴림 버튼 | 120px | 48px | >= 48 ✅ |
| 주사위 | 64px | 64px | >= 48 ✅ |
| 보상 선택 카드 | 120px | 160px | >= 48 ✅ |
| 시작 버튼 | 200px | 56px | >= 48 ✅ |
| 재시작 버튼 | 160px | 48px | >= 48 ✅ |
| 음소거 토글 | 48px | 48px | >= 48 ✅ |

---

## §5. 핵심 게임 루프 (프레임 기준 로직 흐름)

### 5.1 메인 루프 구조 (F13 반영)
```javascript
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.033); // 30fps 하한
    lastTime = timestamp;

    update(dt);
    render(ctx, dt, timestamp);

    tweenManager.update(dt);
    particlePool.updateAll(dt);
    popupPool.updateAll(dt);
  } catch (e) {
    console.error('[GameLoop Error]', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 5.2 상태 머신 (9상태)
```
TITLE → DUNGEON_MAP → DICE_ROLL → DICE_PLACE → BATTLE_RESOLVE
                  ↑       ↓                          ↓
                  └── REWARD ←──── (층 보스 클리어) ──┘
                                          ↓
                                    GAME_OVER / VICTORY
                          ↕
                        PAUSED
```

| 상태 | 설명 |
|------|------|
| `TITLE` | 타이틀 화면. "시작" 버튼, 최고 기록 표시 |
| `DUNGEON_MAP` | 현재 층/방 진행도 표시. "다음 방 진입" 버튼 |
| `DICE_ROLL` | 주사위 굴림 애니메이션 (0.6초) → 자동으로 DICE_PLACE 전환 |
| `DICE_PLACE` | 핵심 의사결정. 주사위를 슬롯에 드래그/탭 배치 |
| `BATTLE_RESOLVE` | 전투 해결 연출 (공격→방어→회복 순차, 1.5초) |
| `REWARD` | 층 보스 클리어 시 보상 선택 (업그레이드 or 새 주사위) |
| `GAME_OVER` | 패배. 도달 층수 + 점수 + "재시작" 버튼 |
| `VICTORY` | 5층 클리어 승리. 최종 점수 + "재시작" 버튼 |
| `PAUSED` | 일시정지. "재개" / "타이틀로" 버튼 |

### 5.3 초기화 순서 (F3, F5 반영)
```
1. 전역 상수 선언 (CONFIG 객체)
2. 유틸리티 클래스 정의 (TweenManager, ObjectPool, TransitionGuard, SoundManager)
3. 게임 상태 변수 선언 (let canvas, ctx, state, player, enemy, dice, ...)
4. 순수 함수 정의 (§10 — rollDice, resolveBattle, getEnemyStats 등)
5. render/update 함수 정의
6. init() 함수 정의:
   - canvas = document.getElementById('gameCanvas')
   - ctx = canvas.getContext('2d')
   - resizeCanvas()
   - 이벤트 리스너 등록 (mousemove, mousedown, touchstart, touchmove, touchend, keydown)
   - SoundManager.init() (AudioContext 생성)
   - enterState(TITLE)
   - requestAnimationFrame(gameLoop)
7. window.addEventListener('load', init)  ← 파일 내 유일한 즉시 실행 코드
```

> **이벤트 리스너는 반드시 init() 내부에서만 등록** (F3)
> **let/const 변수는 최초 사용 이전에 선언** (F5)
> **canvas 할당 후에만 canvas.addEventListener 호출** (F3)

---

## §6. 상태 × 시스템 매트릭스 (F7 반영)

### 6.1 매트릭스

| 상태 | TweenMgr | Particles | Popups | Input(주사위) | Input(UI) | Audio | Render |
|------|----------|-----------|--------|---------------|-----------|-------|--------|
| TITLE | ✅ | ❌ | ❌ | ❌ | ✅ (시작) | ✅ | ✅ |
| DUNGEON_MAP | ✅ | ❌ | ❌ | ❌ | ✅ (다음방) | ✅ | ✅ |
| DICE_ROLL | ✅ | ✅ (굴림) | ❌ | ❌ | ❌ | ✅ (SFX) | ✅ |
| DICE_PLACE | ✅ | ❌ | ❌ | ✅ (드래그/탭) | ✅ (전투/재굴림) | ✅ | ✅ |
| BATTLE_RESOLVE | ✅ | ✅ (히트) | ✅ (데미지) | ❌ | ❌ | ✅ (SFX) | ✅ |
| REWARD | ✅ | ✅ (보상) | ❌ | ❌ | ✅ (선택) | ✅ | ✅ |
| GAME_OVER | ✅ | ❌ | ❌ | ❌ | ✅ (재시작) | ✅ | ✅ |
| VICTORY | ✅ | ✅ (축하) | ❌ | ❌ | ✅ (재시작) | ✅ | ✅ |
| PAUSED | ✅ | ❌ | ❌ | ❌ | ✅ (재개/타이틀) | ❌ | ✅ |

> **TweenMgr.update(dt)는 PAUSED 포함 모든 상태에서 호출** (Cycle 2 B1 방지)
> **Input 시스템은 현재 상태 기반 분기 처리** — 매트릭스 참조 필수

### 6.2 상태 전환 규칙 (F8, F9, F10 반영)

#### TransitionGuard 우선순위
```javascript
const STATE_PRIORITY = {
  GAME_OVER: 100,    // 최고 — HP 0 감지 시 모든 전환보다 우선
  VICTORY: 90,
  PAUSED: 80,        // 예외: 즉시 전환 허용 (beginTransition 미경유)
  REWARD: 50,
  BATTLE_RESOLVE: 40,
  DICE_ROLL: 30,
  DICE_PLACE: 20,
  DUNGEON_MAP: 10,
  TITLE: 0
};
```

#### 전환 규칙
1. **모든 상태 전환은 `beginTransition(targetState)` 경유** — PAUSED만 예외 (F10)
2. **전환 중 `transitioning = true` 가드** — 중복 전환 차단 (F8)
3. **전환 완료 시 `enterState(targetState)` 호출** — 상태 진입 초기화 일원화
4. **tween onComplete로만 전환 트리거** — setTimeout 절대 금지 (F9)
5. **GAME_OVER 전환은 모든 전환보다 우선** — `if (player.hp <= 0) return;` 사전 체크
6. **전환 애니메이션**: 페이드 아웃(0.3초) → enterState → 페이드 인(0.3초)

---

## §7. 난이도 시스템

### 7.1 적 스탯 스케일링 (순수 함수)
```javascript
function getEnemyStats(floor, roomIndex, isElite, isBoss) {
  const baseHp  = 8 + floor * 4;            // 1층:12, 3층:20, 5층:28
  const baseAtk = 2 + Math.floor(floor * 1.5); // 1층:3, 3층:6, 5층:9
  const baseDef = Math.floor(floor * 0.5);   // 1층:0, 3층:1, 5층:2

  const eliteMul = isElite ? 1.5 : 1.0;
  const bossMul  = isBoss  ? 2.5 : 1.0;
  const roomMul  = 1 + roomIndex * 0.1;

  return {
    hp:  Math.floor(baseHp  * eliteMul * bossMul * roomMul),
    atk: Math.floor(baseAtk * eliteMul * bossMul * roomMul),
    def: Math.floor(baseDef * eliteMul * bossMul)
  };
}
```

### 7.2 적 종류 (7종)

| 적 | 등장 층 | 특성 | HP/ATK/DEF 예시 (해당 층 기준) |
|----|---------|------|-------------------------------|
| 슬라임 | 1~2 | 기본. 특수 능력 없음 | 12/3/0 |
| 박쥐 | 1~3 | 공격 높음, HP 낮음 | 8/5/0 |
| 해골전사 | 2~4 | 방어 높음 | 16/4/2 |
| 고블린도적 | 2~4 | 2회 공격 (공격력 절반씩 2번) | 14/3×2/0 |
| 다크메이지 | 3~5 | 매 턴 플레이어 주사위 1개 값 -1 | 16/5/1 |
| 미노타우르스 | 3~5 (엘리트) | HP·공격 모두 높음 | 30/9/1 |
| 드래곤 | 5 (최종보스) | 3페이즈 전환 | 70/9/2 |

### 7.3 드래곤 보스 3페이즈 (Cycle 2 패턴 재활용)
| 페이즈 | HP 구간 | 행동 |
|--------|---------|------|
| Phase 1 | 100%~66% | 기본 공격 (ATK 9) |
| Phase 2 | 66%~33% | 공격력 ×1.5 + 플레이어 방어 슬롯 1개 무효화 |
| Phase 3 | 33%~0% | 공격력 ×2.0 + 매 턴 2HP 자가 회복 |

### 7.4 재굴림 시스템
- **턴당 1회**, **층당 2회** 재굴림 가능
- 재굴림 버튼에 잔여 횟수 표시 (예: "재굴림 (1/2)")
- 재굴림 시 모든 미배치 주사위 재굴림

---

## §8. 시각적 렌더링 원칙 (F6 반영)

### 100% Canvas 코드 드로잉 — 에셋 제로
- **assets/ 디렉토리 절대 생성 금지**
- **외부 파일 로드 0건**: `fetch`, `new Image()`, `XMLHttpRequest` 사용 금지
- **Google Fonts 등 외부 리소스 0건**
- 모든 시각 요소: Canvas API (`fillRect`, `arc`, `lineTo`, `fillText` 등)
- 배경 텍스처: offscreen Canvas 1회 렌더 → `drawImage` 캐시 재사용

### 금지 패턴 자동 grep 검증
```
❌ fetch(            ❌ new Image(         ❌ XMLHttpRequest
❌ assets/           ❌ .svg              ❌ .png
❌ feGaussianBlur    ❌ Google Fonts       ❌ @import url
❌ innerHTML         ❌ eval(              ❌ confirm(
❌ alert(            ❌ setTimeout(  (상태전환/사운드 용도로 사용 시)
```

---

## §9. 사운드 시스템 (F2 반영)

### Web Audio API 전용 — setTimeout 0건
```javascript
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  init() {
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { console.warn('Web Audio unavailable'); }
  }
  play(type, startOffset = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + startOffset;
    // oscillator.start(t) / oscillator.stop(t + duration) ← 네이티브 스케줄링
  }
}
```

### 사운드 목록
| 이벤트 | 파형 | 주파수 | 길이 | 스케줄링 |
|--------|------|--------|------|----------|
| 주사위 굴림 | noise(filtered) | 200~800Hz sweep | 0.3s | `t + 0` |
| 주사위 배치 | sine | C4 (261Hz) | 0.1s | `t + 0` |
| 공격 히트 | sawtooth | E3→C3 sweep down | 0.15s | `t + 0` |
| 방어 블록 | triangle | G4 (392Hz) | 0.1s | `t + 0` |
| 회복 | sine | C4→E4→G4 | 0.3s | `t + 0 / +0.1 / +0.2` |
| 보스 등장 | sawtooth | C2 (65Hz) 진동 | 0.5s | `t + 0` |
| 층 클리어 | sine | C4-E4-G4-C5 아르페지오 | 0.6s | `t + 0 / +0.15 / +0.3 / +0.45` |
| 게임 오버 | triangle | C3→A2 하행 | 0.5s | `t + 0` |
| 승리 팡파레 | sine+triangle | C4-E4-G4-C5 화음 | 1.0s | `t + 0` (동시) |
| 버튼 클릭 | sine | A4 (440Hz) | 0.05s | `t + 0` |

---

## §10. 순수 함수 설계 (F12 반영)

> 모든 게임 로직 함수는 파라미터를 통해 데이터를 수신. 전역 상태 직접 참조 금지.

| # | 함수명 | 파라미터 | 반환값 | 설명 |
|---|--------|----------|--------|------|
| 1 | `rollDice(dice)` | `{type, minVal, maxVal}` | `number` | 단일 주사위 굴림 |
| 2 | `rollAllDice(diceArray)` | `Dice[]` | `number[]` | 전체 주사위 굴림 |
| 3 | `resolveBattle(slots, enemy, player)` | 슬롯 배치 정보, 적, 플레이어 | `{enemyDmg, playerDmg, healAmt, enemyDead, playerDead}` | 전투 해결 |
| 4 | `getEnemyStats(floor, roomIdx, isElite, isBoss)` | 숫자 인자들 | `{hp, atk, def}` | 적 스탯 |
| 5 | `getEnemyAction(enemy, floor, bossPhase)` | 적, 층, 보스 페이즈 | `{atk, special}` | 적 행동 결정 |
| 6 | `upgradeDice(dice, amount)` | 주사위, 증가량 | `Dice` (새 객체) | 주사위 업그레이드 |
| 7 | `generateFloor(floorNum)` | 층 번호 | `Room[]` | 층 데이터 생성 |
| 8 | `calcScore(stats)` | `{floors, kills, damage, bosses}` | `number` | 점수 계산 |
| 9 | `hitTest(x, y, rect)` | 좌표, `{x,y,w,h}` | `boolean` | 터치/클릭 충돌 |
| 10 | `getBossPhase(hp, maxHp)` | HP 수치 | `1\|2\|3` | 보스 페이즈 |
| 11 | `canPlaceDice(diceType, slotType)` | 종류 2개 | `boolean` | 배치 가능 여부 |
| 12 | `calcRerollsLeft(used, maxPerFloor)` | 사용/최대 | `number` | 잔여 재굴림 |

---

## §11. 점수 시스템

### 11.1 점수 계산
```javascript
function calcScore(stats) {
  return stats.floors * 200     // 층 클리어
       + stats.kills * 50       // 적 처치
       + stats.damage * 2       // 총 데미지
       + stats.bosses * 500     // 보스 처치 보너스
       + (stats.floors >= 5 ? 3000 : 0); // 완주 보너스
}
```

| 요소 | 점수 |
|------|------|
| 층 클리어 | +200 / 층 |
| 적 처치 | +50 / 마리 |
| 보스 처치 | +500 / 마리 (별도 보너스) |
| 총 데미지 | +2 / 데미지 |
| 5층 완주 보너스 | +3000 |

### 11.2 기록 저장
- `localStorage`에 최고 점수 + 최고 도달 층 + 총 플레이 횟수 저장
- try-catch 래핑 (iframe sandbox 대응)
- **판정 먼저, 저장 나중에** (Cycle 2 B4 교훈)

---

## §12. 구현 가이드라인 (platform-wisdom 반영)

### 12.1 초기화 순서 체크리스트 (F3, F5)
- [ ] `CONFIG` 상수가 파일 최상단에 선언
- [ ] `let canvas, ctx` 선언이 모든 함수 정의보다 앞에 위치
- [ ] `canvas = document.getElementById(...)` 는 `init()` 내부에서만 실행
- [ ] 모든 `addEventListener`는 `init()` 내부에서만 호출
- [ ] `window.addEventListener('load', init)` 가 유일한 즉시 실행 코드

### 12.2 TweenManager 안전 규칙
- `clearImmediate()` 사용: `resetGame()`, `goToTitle()` 등 즉시 정리 필요 시
- `cancelAll()` 사용: 일반적인 상태 전환 시 (deferred)
- **cancelAll 직후 add 금지** — clearImmediate 후 add로 대체 (Cycle 4 B1 방지)

### 12.3 터치 타겟 강제 적용 (F1, F4)
```javascript
// 모든 버튼 렌더링에서 직접 참조:
const btnH = CONFIG.MIN_TOUCH_TARGET; // 48px — 선언-구현 괴리 원천 차단
```

### 12.4 게임 루프 try-catch (F13)
```javascript
function gameLoop(ts) {
  try { /* update + render */ }
  catch(e) { console.error('[GameLoop]', e); }
  requestAnimationFrame(gameLoop);
}
```

### 12.5 setTimeout 금지 규칙 (F2, F9)
- 상태 전환: tween onComplete 콜백으로만
- 사운드 시퀀싱: `ctx.currentTime + offset` 네이티브 스케줄링으로만
- **코드 내 setTimeout 0건이 리뷰 PASS 조건**

### 12.6 에셋 제로 원칙 (F6)
- assets/ 디렉토리 생성 금지. 빈 index.html에서 시작
- 모든 시각: Canvas API. 모든 사운드: Web Audio API 절차적 생성

### 12.7 스모크 테스트 게이트 (F15)
리뷰 제출 전 필수 3단계:
1. `index.html` 파일 존재
2. 브라우저 로드 시 화면 렌더링 성공 (타이틀 화면 표시)
3. 콘솔 에러 0건

### 12.8 수정 회귀 방지 (F16)
수정 후 전체 플로우 회귀 테스트:
```
TITLE → DUNGEON_MAP → DICE_ROLL → DICE_PLACE → BATTLE_RESOLVE
  → (방 클리어 후) DUNGEON_MAP → ... → REWARD → DUNGEON_MAP
  → GAME_OVER (HP 0)
  → VICTORY (5층 클리어)
  → PAUSED → 재개 / 타이틀
```

---

## §13. 수치 정합성 검증 테이블 (F11)

### 13.1 CONFIG 수치 (30개)

| 상수명 | 기획값 | 용도 |
|--------|--------|------|
| `MIN_TOUCH_TARGET` | `48` | 최소 터치 영역 px |
| `PLAYER_MAX_HP` | `30` | 플레이어 최대 HP |
| `INITIAL_DICE_COUNT` | `3` | 초기 주사위 수 |
| `MAX_DICE_COUNT` | `6` | 최대 주사위 수 |
| `REROLLS_PER_FLOOR` | `2` | 층당 재굴림 횟수 |
| `REROLLS_PER_TURN` | `1` | 턴당 재굴림 최대 |
| `TOTAL_FLOORS` | `5` | 총 던전 층수 |
| `ROLL_ANIM_DURATION` | `0.6` | 굴림 애니메이션 초 |
| `BATTLE_ANIM_DURATION` | `1.5` | 전투 연출 초 |
| `TRANSITION_DURATION` | `0.3` | 화면 전환 페이드 초 |
| `DICE_SIZE` | `64` | 주사위 렌더링 px |
| `ATK_DICE_MIN` | `1` | 공격 주사위 초기 최소 |
| `ATK_DICE_MAX` | `4` | 공격 주사위 초기 최대 |
| `DEF_DICE_MIN` | `1` | 방어 주사위 초기 최소 |
| `DEF_DICE_MAX` | `3` | 방어 주사위 초기 최대 |
| `HEAL_DICE_MIN` | `1` | 회복 주사위 초기 최소 |
| `HEAL_DICE_MAX` | `2` | 회복 주사위 초기 최대 |
| `WILD_DICE_MIN` | `1` | 만능 주사위 초기 최소 |
| `WILD_DICE_MAX` | `3` | 만능 주사위 초기 최대 |
| `WILD_BONUS` | `1` | 만능 보너스 |
| `UPGRADE_SMALL` | `1` | 면 업그레이드 소 |
| `UPGRADE_BIG` | `2` | 면 업그레이드 대 |
| `SCORE_FLOOR` | `200` | 층 클리어 점수 |
| `SCORE_ENEMY` | `50` | 적 처치 점수 |
| `SCORE_BOSS` | `500` | 보스 처치 보너스 |
| `SCORE_DAMAGE` | `2` | 데미지당 점수 |
| `SCORE_CLEAR_BONUS` | `3000` | 완주 보너스 |
| `BOSS_PHASE2_HP` | `0.66` | Phase 2 전환 HP 비율 |
| `BOSS_PHASE3_HP` | `0.33` | Phase 3 전환 HP 비율 |
| `BOSS_P2_ATK_MUL` | `1.5` | Phase 2 공격 배율 |
| `BOSS_P3_ATK_MUL` | `2.0` | Phase 3 공격 배율 |
| `BOSS_P3_HEAL` | `2` | Phase 3 자가 회복 |
| `POPUP_POOL_SIZE` | `20` | 팝업 텍스트 풀 크기 |
| `PARTICLE_POOL_SIZE` | `50` | 파티클 풀 크기 |

### 13.2 변수 사용처 검증 (F17)

| 변수명 | 선언 | 갱신 위치 | 참조 위치 |
|--------|------|-----------|-----------|
| `transitioning` | 상단 | beginTransition(), enterState() | beginTransition() 가드 |
| `currentFloor` | init() | enterState(DUNGEON_MAP), nextFloor() | getEnemyStats(), generateFloor(), render |
| `currentRoom` | init() | nextRoom(), enterState(DUNGEON_MAP) | getEnemyStats(), render, 방 진행 판정 |
| `rerollsUsedFloor` | enterState(DUNGEON_MAP) | reroll() | calcRerollsLeft(), 재굴림 버튼 render |
| `rerollsUsedTurn` | enterState(DICE_ROLL) | reroll() | 재굴림 가능 판정 |
| `placedSlots` | enterState(DICE_PLACE) | placeDice(), removeDice() | canResolve(), render, resolveBattle() |
| `player.hp` | init(), resetGame() | resolveBattle() 결과 적용 | render, GAME_OVER 판정 |
| `enemy` | enterState(DICE_ROLL) | resolveBattle() 결과 적용 | render, 적 사망 판정 |
| `score` | init(), resetGame() | 전투 후 calcScore() | render, saveBest() |
| `selectedDice` | DICE_PLACE 입력 | 주사위 클릭/탭 | 슬롯 배치 시 참조 |
| `diceResults` | enterState(DICE_ROLL) | rollAllDice() | render, 배치 시 값 참조 |

---

## §14. 게임 페이지 사이드바 메타데이터

```json
{
  "id": "mini-dungeon-dice",
  "title": "미니 던전 다이스",
  "description": "주사위를 굴려 던전을 탐험하는 턴 기반 로그라이트! 공격·방어·회복 슬롯에 주사위를 배치하고, 5층 보스를 처치하세요.",
  "genre": ["action", "strategy"],
  "playCount": 0,
  "rating": 0,
  "controls": [
    "1~6: 주사위 선택",
    "Q/W/E: 공격/방어/회복 슬롯 배치",
    "Space: 전투 해결",
    "R: 재굴림 (층당 2회)",
    "P/Esc: 일시정지",
    "마우스: 클릭/드래그로 주사위 배치",
    "터치: 탭/드래그로 주사위 배치"
  ],
  "tags": ["#로그라이트", "#주사위", "#턴제", "#던전", "#전략"],
  "addedAt": "2026-03-21",
  "version": "1.0.0",
  "featured": true
}
```

---

## §15. 코드 리뷰 체크리스트 (구현 완료 후 자체 검증)

### 15.1 금지 패턴 (0건 목표)
- [ ] `assets/` 디렉토리 존재 → 없어야 함
- [ ] `fetch(`, `new Image(`, `XMLHttpRequest` → 0건
- [ ] `.svg`, `.png`, `@import url` → 0건
- [ ] `feGaussianBlur` → 0건
- [ ] `setTimeout(` (상태전환/사운드) → 0건
- [ ] `alert(`, `confirm(`, `innerHTML`, `eval(` → 0건

### 15.2 필수 패턴 (전항 PASS 목표)
- [ ] `try-catch` 게임 루프 래핑
- [ ] `CONFIG.MIN_TOUCH_TARGET` 선언 + 모든 버튼에서 직접 참조
- [ ] `beginTransition()` 경유 상태 전환 (PAUSED 예외)
- [ ] `transitioning` 가드 플래그
- [ ] `enterState()` 일원화
- [ ] `clearImmediate()` 사용 (resetGame/goToTitle)
- [ ] `ctx.currentTime + offset` 사운드 스케줄링
- [ ] `passive: false` + `touch-action: none` 터치 설정
- [ ] DPR 대응 (`canvas.width = w * dpr`)
- [ ] localStorage try-catch 래핑
- [ ] 판정 먼저, 저장 나중에 (saveBest)

### 15.3 수치 정합성 (§13.1 전항 일치)
- [ ] CONFIG 상수 34개 기획서 대조

### 15.4 순수 함수 전수 검증 (§10, 12개)
- [ ] 전역 변수 직접 참조 0건

### 15.5 초기화 순서 (§12.1)
- [ ] 이벤트 리스너 init() 내부 등록
- [ ] let/const 선언 → 최초 사용 이전 위치
- [ ] canvas 할당 후에만 canvas.addEventListener

### 15.6 스모크 테스트 (§12.7)
- [ ] index.html 존재
- [ ] 페이지 로드 성공 (타이틀 화면 렌더링)
- [ ] 콘솔 에러 0건
