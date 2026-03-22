---
game-id: crystal-pinball
title: 크리스탈 핀볼
genre: arcade
difficulty: medium
---

# 크리스탈 핀볼 — 상세 기획서

_사이클 #20 | 작성일: 2026-03-22_

---

## §0. 이전 사이클 피드백 반영 매핑

> Cycle 19 포스트모템 "아쉬웠던 점" + platform-wisdom 누적 교훈(F1~F32)을 기획 단계에서 선제 대응한다.

| # | 출처 | 문제 | 이번 기획서 해결 방법 | 해당 섹션 |
|---|------|------|----------------------|-----------|
| F1 | Cycle 1~19 (19사이클 연속) | assets/ 디렉토리 재발 | **index.html 단일 파일에서 처음부터 작성.** assets/ 디렉토리 절대 생성 금지. 100% Canvas 코드 드로잉. thumbnail.svg만 별도 허용 | §8, §14.5 |
| F2 | Cycle 1~19 | setTimeout 기반 상태 전환 | tween onComplete 콜백만으로 전환. setTimeout **0건** 목표. Web Audio는 `oscillator.start(ctx.currentTime + delay)` 네이티브 스케줄링 | §5, §13 |
| F3 | Cycle 6~19 | 순수 함수 패턴 필수 | 물리 엔진·충돌·스코어링 모든 함수는 파라미터 기반. 전역 직접 참조 0건 | §15 |
| F4 | Cycle 2 | 상태×시스템 매트릭스 누락 | §6.3에 전체 상태×시스템 매트릭스 선행 작성 | §6.3 |
| F5 | Cycle 3/4 | 가드 플래그 누락 → 콜백 반복 호출 | `isTransitioning`, `isLaunching`, `isDraining` 3중 가드 체계 | §5.4 |
| F6 | Cycle 4 | TweenManager cancelAll+add 경쟁 조건 | `clearImmediate()` 즉시 정리 API 분리 | §15 |
| F7 | Cycle 7/16 | 기획서 수치 ↔ 코드 수치 불일치 | §14.4 수치 정합성 검증 테이블. 범퍼 점수·업그레이드 비용 전수 대조 | §14.4 |
| F8 | Cycle 1 | iframe 환경 confirm/alert 사용 불가 | Canvas 기반 모달 UI만 사용. window.open/alert/confirm/prompt 0건 | §4 |
| F9 | Cycle 3~4 | SVG 필터 재발 (feGaussianBlur) | 인라인 SVG 사용 금지. Canvas glow는 shadowBlur로 구현 | §4.2 |
| F10 | Cycle 15~19 | offscreen canvas 배경 캐싱 | `buildTableCache()` 패턴 — resizeCanvas() + 테이블 전환 시에만 재빌드 | §4.3 |
| F11 | Cycle 11/14 | let/const TDZ 크래시 | 변수 선언 → DOM 할당 → 이벤트 등록 → init() 순서 엄격 준수 | §14.1 |
| F12 | Cycle 10/11 | gameLoop try-catch 미적용 | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` 기본 적용 | §5.1 |
| F13 | Cycle 13/17 | index.html 미존재 | **MVP 우선 전략**: TITLE→TABLE_SELECT→PLAYING→DRAIN→GAMEOVER 5상태 먼저 | §1.3 |
| F14 | Cycle 10 | 수정 회귀 (render 시그니처 변경) | 수정 시 전체 플로우 회귀 테스트 | §14.7 |
| F15 | Cycle 3/7/17 | 유령 변수 (선언만 하고 미사용) | §14.2 변수 사용처 검증 테이블 | §14.2 |
| F16 | Cycle 5 | 하나의 값에 대한 갱신 경로 이중화 | 볼 속도·점수·크리스탈은 단일 함수를 통해서만 갱신 | §15 |
| F17 | Cycle 3 | 상태 전환 우선순위 체계 | GAMEOVER > DRAIN > TABLE_CLEAR > PLAYING. STATE_PRIORITY 맵 | §6.2 |
| F18 | Cycle 15~19 | 범위 축소 전략 | 단일 핵심 루프(발사→플리퍼→충돌→점수)에 집중. 핀볼은 단일 메카닉이 명확 | §1 |
| F19 | Cycle 12/15 | "절반 구현" 패턴 | 기능별 세부 구현 체크리스트(§14.3) | §14.3 |
| F20 | Cycle 13~19 | CONFIG.MIN_TOUCH 선언-구현 괴리 | 모든 버튼·UI에 `touchSafe()` 유틸로 48px 하한 강제 적용 | §12.3 |
| F21 | Cycle 16 | 입력 방식 전기능 미지원 | 키보드/마우스/터치 모두 **전 기능 지원** 보장 | §3 |
| F22 | Cycle 17 | 기획 명시 UI 미구현 | 기획서에 명시된 UI는 **100% 구현**. MVP에 포함되지 않으면 기획서에 적지 않는다 | §1.3 |
| F23 | Cycle 5/8 | beginTransition() 우회 직접 전환 | 모든 화면 전환은 `beginTransition()` 경유 필수. PAUSED만 예외(즉시 전환 모드) | §6.2 |
| F24 | Cycle 12~19 | 터치 타겟 44×44px 미달 | 모든 인터랙티브 UI 최소 48×48px | §12.3 |
| F25 | Cycle 17 (핵심) | 기획 과대 → 구현 0% | **MVP 우선**: 5상태 + 테이블 1개 + 기본 물리 먼저 완성 후 확장 | §1.3 |
| F26 | Cycle 17 | 상태 변경이 render에서 수행 | 모든 상태 변경은 update()에서만. render()는 순수 출력 함수 | §5.2 |
| F27 | Cycle 17 | 오브젝트 간 상호작용 미정의 | §2.7 볼 × 오브젝트 상호작용 매트릭스 포함 | §2.7 |
| F28 | Cycle 18 | 밸런스 검증 부재 | 점수·업그레이드 비용을 상수 테이블(TABLE_DATA, UPGRADE_DATA)로 관리 | §7.2 |
| F29 | Cycle 18 | 사운드 체감 품질 미검증 | SFX 타이밍을 게임 이벤트(범퍼히트/플리퍼/드레인/보너스)에 정밀 매핑. 볼륨 밸런스 테이블 포함 | §13.3 |
| F30 | Cycle 18 | 단일 파일 모듈화 | 코드를 논리적 섹션(CONFIG/DATA → Physics → Collision → Rendering → States → Init)으로 분리 가능하게 구조화 | §15.1 |
| F31 | Cycle 19 신규 | 적 디버프 빈 객체 대입 버그 | 핀볼에는 디버프 없음. 모든 효과(범퍼 히트, 타겟 클리어)는 적용 대상을 직접 참조 확인 후 적용 | §5.5 |
| F32 | Cycle 19 신규 | 스크롤 UI 미구현 (카드 6장+) | 업그레이드 상점에서 항목이 많을 때 Canvas 내 스크롤 구현 포함 | §4.7 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 1.1 컨셉
플레이어는 마법 크리스탈로 가득한 핀볼 테이블에서 빛나는 볼을 발사하고, 플리퍼를 조작하여 크리스탈 타겟을 파괴하며 점수를 획득한다. 10개의 테이블을 순차적으로 공략하며, 각 테이블은 고유한 범퍼/타겟/장애물 배치와 클리어 조건을 가진다. 테이블 클리어 시 획득한 크리스탈로 플리퍼 파워, 볼 속성, 특수 능력을 업그레이드하여 점점 어려워지는 테이블에 도전한다.

**물리 기반 핀볼 + 크리스탈 수집 + 스테이지 진행 + 업그레이드** — 플랫폼에 완전히 부재한 물리 아케이드 장르.

### 1.2 핵심 재미 요소
1. **즉각적 물리 피드백**: 플리퍼 조작 → 볼 반사 → 범퍼 히트 → 파티클 폭발 + 사운드의 0.1초 미만 쾌감 루프
2. **테이블 공략**: 10개 테이블 각각 다른 배치와 클리어 조건 → "이 테이블은 어떻게 깨지?" 탐구 재미
3. **성장 시스템**: 크리스탈로 업그레이드 → 더 강력한 플리퍼/볼 → 더 높은 점수 → 더 많은 크리스탈의 양성 피드백
4. **멀티볼/특수 볼**: 동시 3볼, 폭발볼, 관통볼 등 특수 모드의 카타르시스
5. **보스 테이블**: 5번째(미드보스), 10번째(최종보스) 테이블에서 "살아있는 타겟"과 대결

### 1.3 MVP 우선 전략 (F13, F25 대응)
**Phase 1 (MVP — 반드시 먼저 완성)**
- 5상태: TITLE → TABLE_SELECT → PLAYING → DRAIN → GAMEOVER
- 테이블 1개 (Tutorial Table)
- 기본 물리: 중력, 볼-벽 충돌, 볼-플리퍼 충돌, 볼-범퍼 충돌
- 플리퍼 좌/우 조작
- 플런저 발사
- 범퍼 3개 + 타겟 5개
- 3볼 라이프
- 기본 점수 시스템

**Phase 2 (테이블 확장)**
- 10개 테이블 + 보스 테이블 2개
- 테이블별 고유 배치/클리어 조건
- 크리스탈 수집 시스템
- 기본 업그레이드 5종

**Phase 3 (고급 기능)**
- 특수 볼 3종 (멀티볼/폭발볼/관통볼)
- 보스 테이블 패턴
- 업적 10종
- 화면 흔들림/슬로우모션 연출

**Phase 4 (폴리시)**
- 다중 파티클 시스템
- BGM 분기 (일반/보스)
- UI 애니메이션 (점수 카운트업, 콤보 텍스트)
- 세이브/로드

---

## §2. 게임 규칙 및 목표

### 2.1 기본 규칙
- 플레이어는 **3개의 볼**(라이프)로 시작
- 플런저로 볼을 발사하고, 좌/우 플리퍼로 볼이 빠지지 않게 조작
- 테이블 위의 타겟/범퍼/레인을 맞춰 점수 획득
- 각 테이블에는 **클리어 조건** (모든 크리스탈 타겟 파괴)이 있음
- 모든 볼을 잃으면 게임 오버

### 2.2 테이블 클리어 조건
- 테이블 내 **모든 크리스탈 타겟**(빨강/파랑/초록/노랑/보라)을 파괴하면 클리어
- 클리어 시 크리스탈 보상 + 다음 테이블 해금
- 볼을 잃지 않고 클리어하면 **퍼펙트 보너스** (크리스탈 ×2)

### 2.3 점수 획득 요소
| 요소 | 기본 점수 | 콤보 배율 |
|------|-----------|-----------|
| 일반 범퍼 | 100 | ×콤보 |
| 파워 범퍼 | 250 | ×콤보 |
| 크리스탈 타겟 | 500 | ×콤보 |
| 드롭 타겟 (전체) | 1,000 | — |
| 롤오버 레인 | 150 | ×콤보 |
| 스피너 (1회전) | 50 | — |
| 킥아웃 홀 | 300 | — |
| 올 타겟 보너스 | 5,000 | — |
| 테이블 클리어 | 10,000 × 테이블# | — |

### 2.4 콤보 시스템
- 범퍼/타겟 연속 히트 시 **콤보 카운터** 증가 (1초 내 재히트)
- 콤보 1~4: ×1, 콤보 5~9: ×2, 콤보 10~19: ×3, 콤보 20+: ×5
- 1초간 히트 없으면 콤보 리셋
- 콤보 20+ 달성 시 화면 흔들림 + "MEGA COMBO" 텍스트

### 2.5 크리스탈 수집
- 크리스탈 타겟 파괴 시 크리스탈 1개 획득
- 크리스탈은 **업그레이드 상점**의 화폐
- 테이블별 크리스탈 타겟 수: 5~12개 (난이도에 비례)

### 2.6 특수 모드
| 모드 | 발동 조건 | 효과 | 지속 시간 |
|------|-----------|------|-----------|
| 멀티볼 | MULTIBALL 레인 3개 전부 통과 | 볼 2개 추가 발사 (총 3볼) | 볼이 1개가 될 때까지 |
| 크리스탈 러시 | 크리스탈 타겟 5개 연속 파괴 | 모든 점수 ×3 | 15초 |
| 세이브 게이트 | 킥아웃 홀 3회 진입 | 드레인 홀 자동 막힘 | 볼 1회 세이브 |
| 폭발볼 | 업그레이드 해금 후 파워 범퍼 5회 히트 | 볼이 반경 80px 내 모든 타겟 동시 파괴 | 1회 |
| 관통볼 | 업그레이드 해금 후 스피너 10회전 | 볼이 타겟을 관통하며 파괴 | 10초 |

### 2.7 볼 × 오브젝트 상호작용 매트릭스 (F27 대응)

| 볼 → \ 오브젝트 ↓ | 일반볼 | 폭발볼 | 관통볼 |
|---|---|---|---|
| **일반 범퍼** | 반사+100pt | 반사+범퍼파괴+300pt | 관통+100pt |
| **파워 범퍼** | 강반사+250pt | 반사+250pt(파괴 불가) | 관통+250pt |
| **크리스탈 타겟** | 반사+파괴+500pt | 반경 내 전체파괴 | 관통+파괴+500pt |
| **드롭 타겟** | 반사+눌림 | 전체 눌림 | 관통+눌림 |
| **스피너** | 회전+50pt/회전 | 회전+50pt/회전 | 관통(회전 없음) |
| **킥아웃 홀** | 흡수→발사 | 흡수→발사 | 관통(흡수 안됨) |
| **벽** | 반사 | 반사 | 반사 |
| **플리퍼** | 반사(파워 적용) | 반사(파워 적용) | 반사(파워 적용) |

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 동작 |
|---|---|
| ← (왼쪽 방향키) / Z | 왼쪽 플리퍼 |
| → (오른쪽 방향키) / X | 오른쪽 플리퍼 |
| ↓ (아래 방향키) / Space | 플런저 (누르고 있으면 파워 증가, 떼면 발사) |
| P / Escape | 일시정지 |
| Enter | 메뉴 확인 |

### 3.2 마우스
| 동작 | 효과 |
|---|---|
| 화면 왼쪽 절반 클릭 | 왼쪽 플리퍼 |
| 화면 오른쪽 절반 클릭 | 오른쪽 플리퍼 |
| 플런저 영역 드래그 다운 → 릴리즈 | 플런저 발사 (드래그 거리 = 파워) |
| UI 버튼 클릭 | 메뉴 조작 |

### 3.3 터치 (모바일)
| 동작 | 효과 |
|---|---|
| 화면 왼쪽 하단 1/3 터치 | 왼쪽 플리퍼 |
| 화면 오른쪽 하단 1/3 터치 | 오른쪽 플리퍼 |
| 플런저 영역 스와이프 업 | 플런저 발사 (스와이프 속도 = 파워) |
| 양손 동시 터치 | 양쪽 플리퍼 동시 작동 |
| UI 버튼 탭 | 메뉴 조작 |

> ⚠️ 터치 영역은 화면 높이 하단 40% 영역으로 한정하여, 테이블 시야 영역과 플리퍼 조작 영역이 겹치지 않도록 설계. 모든 터치 타겟 최소 48×48px (F20, F24).

### 3.4 입력 모드 자동 감지 (F21 대응)
```
inputMode = 'keyboard' | 'mouse' | 'touch'
// 마지막 입력 이벤트 기준으로 자동 전환
// 각 모드별 온스크린 가이드 텍스트 변경
```

---

## §4. 시각적 스타일 가이드

### 4.1 색상 팔레트

| 용도 | 색상 | HEX |
|------|------|-----|
| 배경 (우주/깊은 밤) | 다크 네이비 | #0A0E27 |
| 테이블 면 | 다크 인디고 | #141852 |
| 테이블 테두리 | 메탈릭 실버 | #8892B0 |
| 플리퍼 | 밝은 시안 | #00E5FF |
| 볼 | 화이트 글로우 | #FFFFFF (glow: #00E5FF) |
| 크리스탈 타겟 - 빨강 | 루비 | #FF1744 |
| 크리스탈 타겟 - 파랑 | 사파이어 | #2979FF |
| 크리스탈 타겟 - 초록 | 에메랄드 | #00E676 |
| 크리스탈 타겟 - 노랑 | 토파즈 | #FFEA00 |
| 크리스탈 타겟 - 보라 | 자수정 | #D500F9 |
| 일반 범퍼 | 오렌지 네온 | #FF6D00 |
| 파워 범퍼 | 골드 글로우 | #FFD600 |
| 콤보 텍스트 | 핫 핑크 | #FF4081 |
| UI 배경 | 반투명 다크 | rgba(10, 14, 39, 0.85) |
| UI 텍스트 | 밝은 화이트 | #E8EAED |

### 4.2 Canvas 드로잉 스타일 (F9 대응 — SVG 필터 사용 금지)
- **글로우 효과**: `ctx.shadowBlur` + `ctx.shadowColor`로 네온 글로우 구현
- **크리스탈 타겟**: 다각형(6~8각) + 내부 그라데이션(`createRadialGradient`) + 외곽 글로우
- **범퍼**: 원형 + 히트 시 반경 확장 애니메이션 + 밝기 플래시
- **플리퍼**: 둥근 사다리꼴, 회전 애니메이션 (0° → 45° 스윙)
- **볼**: 원형 + 이동 궤적(trail) + 글로우
- **배경**: 다층 별 필드 (패럴랙스) + 성운 그라데이션

### 4.3 offscreen Canvas 캐싱 (F10 대응)
```
buildTableCache(tableId):
  offCtx에 테이블 벽, 레일, 고정 장식물을 1회 드로잉
  → tableCache[tableId] 저장
  → render()에서 drawImage(tableCache[tableId]) 로 재사용

재빌드 조건:
  - resizeCanvas() 호출 시
  - 테이블 전환 시
  - devicePixelRatio 변경 시 (다중 모니터 이동)
```

### 4.4 파티클 시스템
```javascript
// ParticlePool — 오브젝트 풀링으로 GC 최소화
const PARTICLE_POOL_SIZE = 200;
// 파티클 타입별 설정
PARTICLE_TYPES = {
  bumperHit:   { count: 8,  life: 0.4, speed: 200, color: '#FF6D00', size: 3 },
  crystalBreak:{ count: 15, life: 0.6, speed: 150, color: 'inherit', size: 4 },
  comboFlash:  { count: 20, life: 0.3, speed: 300, color: '#FF4081', size: 2 },
  ballTrail:   { count: 1,  life: 0.2, speed: 0,   color: '#00E5FF', size: 2 },
  drainWarn:   { count: 5,  life: 1.0, speed: 50,  color: '#FF1744', size: 3 },
  tableComplete:{ count: 50, life: 1.5, speed: 250, color: 'rainbow', size: 5 }
};
```

### 4.5 화면 흔들림 / 슬로우모션
- **화면 흔들림**: 콤보 20+ 또는 보스 히트 시 `shakeIntensity = 8`, `shakeDuration = 0.3s`
  - `ctx.translate(rand(-shake, shake), rand(-shake, shake))` 매 프레임
- **슬로우모션**: 보스 최종 히트 시 `timeScale = 0.3` → 1.0으로 1초간 복귀
  - `dt *= timeScale` 적용

### 4.6 배경 레이어 (패럴랙스 3단)
| 레이어 | 내용 | 이동 속도 |
|--------|------|-----------|
| far (뒤) | 작은 별 200개 (1~2px, twinkle) | 볼 이동 × 0.02 |
| mid (중간) | 성운 그라데이션 블롭 3~4개 | 볼 이동 × 0.05 |
| near (앞) | 큰 별 20개 (3~4px, 밝은 글로우) | 볼 이동 × 0.1 |

> ⚠️ 패럴랙스는 볼 위치 기반 미세 이동. 과도한 이동은 어지러움 유발하므로 최대 ±10px 범위.

### 4.7 UI 스크롤 (F32 대응)
- 업그레이드 상점에서 항목 6개 이상일 때 Canvas 내 스크롤 구현
- 터치: 스와이프 드래그로 스크롤, 관성 스크롤 포함
- 마우스: 휠 스크롤
- 키보드: ↑↓ 방향키
- 스크롤바 시각적 표시 (우측 얇은 바)

---

## §5. 핵심 게임 루프 (초당 프레임 기준 로직 흐름)

### 5.1 메인 루프 (F12 대응)
```
function gameLoop(timestamp):
  try:
    dt = min((timestamp - lastTime) / 1000, 0.05)  // dt 캡 50ms
    lastTime = timestamp

    tweenManager.update(dt)

    switch(gameState):
      TITLE:        updateTitle(dt)
      TABLE_SELECT: updateTableSelect(dt)
      PLAYING:      updatePlaying(dt)
      DRAIN:        updateDrain(dt)
      TABLE_CLEAR:  updateTableClear(dt)
      UPGRADE:      updateUpgrade(dt)
      BOSS_INTRO:   updateBossIntro(dt)
      GAMEOVER:     updateGameOver(dt)
      RESULT:       updateResult(dt)
      PAUSED:       // 아무것도 안 함 (tween은 위에서 이미 업데이트)

    render(gameState, dt)

  catch(e):
    console.error('GameLoop error:', e)

  requestAnimationFrame(gameLoop)
```

### 5.2 물리 업데이트 (서브스텝)
```
function updatePlaying(dt):
  if isTransitioning: return  // F5 가드

  // 물리 서브스텝 (안정적 충돌 감지)
  const SUB_STEPS = 4
  const subDt = dt / SUB_STEPS
  for i in 0..SUB_STEPS:
    applyGravity(ball, subDt)       // 중력 적용
    updateBallPosition(ball, subDt) // 위치 갱신
    checkWallCollision(ball, table) // 벽 충돌
    checkFlipperCollision(ball, flippers)  // 플리퍼 충돌
    checkBumperCollision(ball, bumpers)    // 범퍼 충돌
    checkTargetCollision(ball, targets)    // 타겟 충돌
    checkSpecialCollision(ball, specials)  // 특수 오브젝트 충돌
    checkDrain(ball)                       // 드레인 체크

  updateCombo(dt)         // 콤보 타이머
  updateParticles(dt)     // 파티클
  updateAnimations(dt)    // UI 애니메이션
  checkTableClear()       // 클리어 조건 확인

  // F26 대응: 상태 변경은 update()에서만
```

### 5.3 충돌 감지 — 원-선분/원-원
```
// 볼-벽: 원-선분 최근접점 계산 → 거리 < radius → 반사 벡터
// 볼-범퍼: 원-원 거리 < r1+r2 → 법선 벡터 반사 + 반발계수
// 볼-플리퍼: 플리퍼를 선분으로 근사, 스윙 중이면 추가 속도 부여
// 볼-타겟: 원-다각형(간소화→원-원 근사)

function resolveCircleCollision(ball, obj, restitution):
  nx = (ball.x - obj.x) / dist
  ny = (ball.y - obj.y) / dist
  vDotN = ball.vx * nx + ball.vy * ny
  ball.vx -= (1 + restitution) * vDotN * nx
  ball.vy -= (1 + restitution) * vDotN * ny
  // 위치 보정 (관통 방지)
  overlap = (ball.r + obj.r) - dist
  ball.x += nx * overlap
  ball.y += ny * overlap
```

### 5.4 가드 플래그 체계 (F5 대응)
```
isTransitioning = false  // 화면 전환 중
isLaunching = false      // 플런저 발사 중
isDraining = false       // 드레인 애니메이션 중
isBossIntro = false      // 보스 인트로 중

// 모든 상태 전환 함수 진입부에서 체크
function beginDrain():
  if isDraining: return  // 중복 호출 방지
  isDraining = true
  ...
```

### 5.5 효과 적용 참조 검증 (F31 대응)
```
// 모든 게임 효과는 적용 대상 유효성 검증 후 적용
function applyBumperHit(ball, bumper):
  if !ball || !bumper: return           // null 체크
  if bumper.destroyed: return            // 이미 파괴된 범퍼
  addScore(bumper.points * comboMult)    // 단일 경로로 점수 갱신 (F16)
  bumper.hitAnim = 1.0                   // 히트 애니메이션 시작
  spawnParticles('bumperHit', bumper.x, bumper.y)
  playSound('bumperHit')
```

---

## §6. 게임 상태 머신

### 6.1 상태 목록 (9상태)

| 상태 | 설명 |
|------|------|
| TITLE | 타이틀 화면 — 로고 + "TAP TO START" |
| TABLE_SELECT | 테이블 선택 화면 — 해금된 테이블 목록 |
| PLAYING | 핀볼 플레이 중 |
| DRAIN | 볼 드레인 → 잔여 볼 표시 → 재발사 or GAMEOVER |
| TABLE_CLEAR | 테이블 클리어 연출 → 크리스탈 보상 |
| UPGRADE | 업그레이드 상점 |
| BOSS_INTRO | 보스 테이블 인트로 연출 (1.5초) |
| GAMEOVER | 게임 오버 — 최종 점수 + 재도전 |
| RESULT | 전체 클리어 — 통계 + 업적 확인 |

### 6.2 상태 전환 우선순위 (F17, F23 대응)
```
STATE_PRIORITY = {
  GAMEOVER: 100,
  DRAIN: 90,
  TABLE_CLEAR: 80,
  BOSS_INTRO: 70,
  UPGRADE: 60,
  RESULT: 50,
  PLAYING: 40,
  TABLE_SELECT: 30,
  TITLE: 20
}

function beginTransition(nextState, duration = 0.4):
  if isTransitioning: return
  if STATE_PRIORITY[nextState] < STATE_PRIORITY[gameState]:
    return  // 낮은 우선순위 전환 거부 (예외: TITLE로의 명시적 복귀)
  isTransitioning = true
  tweenManager.add({
    target: transitionAlpha,
    from: 0, to: 1,
    duration: duration / 2,
    onComplete: () => {
      enterState(nextState)
      tweenManager.add({
        target: transitionAlpha,
        from: 1, to: 0,
        duration: duration / 2,
        onComplete: () => { isTransitioning = false }
      })
    }
  })

// PAUSED만 예외: 즉시 전환
function togglePause():
  if gameState === 'PAUSED':
    gameState = prevState
  else:
    prevState = gameState
    gameState = 'PAUSED'
```

### 6.3 상태 × 시스템 매트릭스 (F4 대응)

| 시스템 \ 상태 | TITLE | TABLE_SELECT | PLAYING | DRAIN | TABLE_CLEAR | UPGRADE | BOSS_INTRO | GAMEOVER | RESULT | PAUSED |
|---|---|---|---|---|---|---|---|---|---|---|
| **물리 엔진** | ✗ | ✗ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **충돌 감지** | ✗ | ✗ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **TweenManager** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **파티클** | ✅ | ✗ | ✅ | ✅ | ✅ | ✗ | ✅ | ✅ | ✅ | ✗ |
| **입력 처리** | ✅ | ✅ | ✅ | ✗ | ✗ | ✅ | ✗ | ✅ | ✅ | ✅ |
| **사운드** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✗ |
| **배경 렌더** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **UI 렌더** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **콤보 타이머** | ✗ | ✗ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

> ⚠️ TweenManager는 **모든 상태**에서 업데이트 (PAUSED 포함). Cycle 2 B1 교훈.

---

## §7. 점수 시스템 및 밸런스

### 7.1 점수 공식
```
hitScore = basePoints × comboMultiplier × (1 + flipperPowerBonus)
// comboMultiplier: §2.4 참조
// flipperPowerBonus: 업그레이드 레벨 × 0.1 (최대 +50%)
```

### 7.2 밸런스 상수 테이블 (F28 대응)

#### 물리 상수
| 상수 | 값 | 설명 |
|------|-----|------|
| GRAVITY | 980 | px/s² (현실 감각) |
| BALL_RADIUS | 10 | px |
| BALL_MAX_SPEED | 1500 | px/s |
| FLIPPER_LENGTH | 80 | px |
| FLIPPER_SWING_SPEED | 8 | rad/s |
| FLIPPER_RESTITUTION | 1.2 | 반발계수 (>1로 가속) |
| BUMPER_RESTITUTION | 1.5 | 범퍼 반발계수 |
| WALL_RESTITUTION | 0.6 | 벽 반발계수 |
| PLUNGER_MIN_POWER | 400 | px/s |
| PLUNGER_MAX_POWER | 1200 | px/s |

#### 업그레이드 비용 테이블 (UPGRADE_DATA)
| 업그레이드 | Lv1 | Lv2 | Lv3 | Lv4 | Lv5 | 효과 |
|---|---|---|---|---|---|---|
| 플리퍼 파워 | 3💎 | 6💎 | 10💎 | 15💎 | 25💎 | 반발계수 +0.1/Lv |
| 볼 제어력 | 3💎 | 6💎 | 10💎 | 15💎 | 25💎 | 최대속도 -5%/Lv (제어 용이) |
| 콤보 지속 | 5💎 | 10💎 | 18💎 | — | — | 콤보 타이머 +0.3초/Lv |
| 세이브 게이트 | 5💎 | 12💎 | 20💎 | — | — | 게이트 충전 히트 -2/Lv |
| 멀티볼 | 8💎 | 15💎 | — | — | — | 멀티볼 추가 볼 +1/Lv |
| 폭발볼 | 10💎 | 20💎 | — | — | — | 폭발 반경 +20px/Lv |
| 관통볼 | 10💎 | 20💎 | — | — | — | 관통 지속 +5초/Lv |
| 엑스트라 볼 | 15💎 | 30💎 | — | — | — | 시작 볼 +1/Lv |

#### 테이블 데이터 (TABLE_DATA)
| # | 이름 | 크리스탈 타겟 | 일반 범퍼 | 파워 범퍼 | 특수 요소 | 클리어 보상 |
|---|------|---|---|---|---|---|
| 1 | 크리스탈 동굴 | 5 | 3 | 0 | — | 5💎 |
| 2 | 사파이어 해저 | 6 | 3 | 1 | 스피너 1 | 7💎 |
| 3 | 에메랄드 숲 | 7 | 4 | 1 | 롤오버레인 3 | 9💎 |
| 4 | 토파즈 사막 | 8 | 4 | 2 | 킥아웃홀 1 | 12💎 |
| 5 | **루비 화산 (미드보스)** | 10 | 5 | 2 | 보스 코어 1 | 18💎 |
| 6 | 자수정 하늘 | 8 | 4 | 2 | 멀티볼레인 3 | 14💎 |
| 7 | 오팔 미궁 | 9 | 5 | 3 | 드롭타겟 세트 | 16💎 |
| 8 | 다이아 빙하 | 10 | 5 | 3 | 스피너 2, 킥아웃홀 1 | 20💎 |
| 9 | 문스톤 심연 | 11 | 6 | 3 | 전부 포함 | 24💎 |
| 10 | **프리즘 왕좌 (최종보스)** | 12 | 6 | 4 | 보스 코어 3, 전부 포함 | 50💎 |

---

## §8. 에셋 전략 — 100% Canvas 코드 드로잉 (F1 대응)

> ⚠️ **assets/ 디렉토리 절대 생성 금지.** 20사이클 연속 재발 방지를 위해 이 항목을 최우선으로 강조한다.

### 8.1 Canvas 드로잉 함수 목록

| 함수 | 대상 | 주요 API |
|------|------|----------|
| `drawBall(ctx, ball)` | 볼 + 글로우 + 트레일 | arc, shadowBlur, globalAlpha |
| `drawFlipper(ctx, flipper)` | 플리퍼 (회전 애니메이션) | save/restore, rotate, roundRect |
| `drawBumper(ctx, bumper)` | 범퍼 (히트 플래시) | arc, radialGradient, shadowBlur |
| `drawCrystalTarget(ctx, target)` | 크리스탈 다각형 | beginPath, lineTo (6~8각), linearGradient |
| `drawDropTarget(ctx, dropTarget)` | 드롭 타겟 세트 | fillRect, strokeRect |
| `drawSpinner(ctx, spinner)` | 스피너 (회전) | save/restore, rotate, fillRect |
| `drawRolloverLane(ctx, lane)` | 롤오버 레인 | strokeStyle, lineWidth, lineDash |
| `drawKickoutHole(ctx, hole)` | 킥아웃 홀 | arc, radialGradient |
| `drawPlunger(ctx, plunger)` | 플런저 (당김 애니메이션) | fillRect, radialGradient |
| `drawWalls(ctx, table)` | 테이블 벽/레일 | beginPath, lineTo, stroke |
| `drawSaveGate(ctx, gate)` | 세이브 게이트 | moveTo, lineTo, strokeStyle |
| `drawBoss(ctx, boss)` | 보스 코어 (페이즈별) | arc, radialGradient, 회전 |
| `drawBackground(ctx)` | 별 + 성운 배경 | arc, radialGradient, globalAlpha |
| `drawParticle(ctx, p)` | 파티클 1개 | arc, globalAlpha |
| `drawUI(ctx, state)` | HUD, 점수, 볼 카운트 | fillText, roundRect |

### 8.2 thumbnail.svg
- **유일하게 허용되는 외부 파일**
- 게임 하이라이트 장면: 플리퍼 2개 + 볼 + 크리스탈 범퍼 3개 + 글로우 이펙트 + "CRYSTAL PINBALL" 텍스트
- viewBox="0 0 400 300", 15KB+
- SVG 필터 사용 **금지** (F9)

---

## §9. 난이도 시스템

### 9.1 테이블별 난이도 스케일링
| 요소 | T1 | T3 | T5(미드보스) | T7 | T10(최종보스) |
|------|-----|-----|------|-----|------|
| 크리스탈 타겟 수 | 5 | 7 | 10 | 9 | 12 |
| 타겟 내구도 | 1 | 1 | 2 | 2 | 3 |
| 범퍼 반발력 | 1.5 | 1.6 | 1.8 | 1.7 | 2.0 |
| 드레인 홀 폭 | 80px | 90px | 100px | 95px | 110px |
| 이동 장애물 | 없음 | 없음 | 1개 | 2개 | 3개 |
| 중력 배율 | 1.0 | 1.05 | 1.1 | 1.1 | 1.2 |

### 9.2 보스 테이블 특수 규칙

#### 테이블 5 — 루비 화산 (미드보스)
- **보스 코어**: 테이블 상단 중앙, HP 20
- **패턴 A (0~10HP)**: 2초마다 "화염 범퍼" 1개 소환 (볼과 충돌 시 볼 속도 감소)
- **패턴 B (10HP 이하)**: 1.5초마다 화염 범퍼 2개 소환 + 이동 장애물 활성화
- **약점**: 코어에 직접 볼 히트 시 1HP 감소, 크리스탈 타겟 파괴 시 2HP 감소

#### 테이블 10 — 프리즘 왕좌 (최종보스)
- **보스 코어**: 3개 (좌/중/우), 각 HP 15
- **페이즈 1 (3코어)**: 각 코어가 "프리즘 빔" (반사벽 생성, 5초 지속)
- **페이즈 2 (2코어)**: 남은 코어가 "중력 왜곡" (볼을 코어로 흡인)
- **페이즈 3 (1코어)**: 최후 코어가 "프리즘 방패" (보호 범퍼 3개 궤도 회전)
- **전체 코어 파괴 → 게임 클리어**

---

## §10. 업적 시스템

| # | 이름 | 조건 | 보상 |
|---|------|------|------|
| 1 | 첫 발사 | 첫 번째 볼 발사 | 1💎 |
| 2 | 콤보 마스터 | 콤보 20 이상 달성 | 3💎 |
| 3 | 크리스탈 수집가 | 크리스탈 50개 누적 수집 | 5💎 |
| 4 | 올 클리어 | 테이블 1~4 모두 클리어 | 5💎 |
| 5 | 미드보스 격파 | 테이블 5 (루비 화산) 클리어 | 8💎 |
| 6 | 퍼펙트 게임 | 볼을 잃지 않고 테이블 1개 클리어 | 5💎 |
| 7 | 멀티볼 달인 | 멀티볼 모드에서 모든 볼로 범퍼 히트 | 3💎 |
| 8 | 폭발의 예술 | 폭발볼로 크리스탈 타겟 3개 동시 파괴 | 5💎 |
| 9 | 100만 점 | 누적 점수 1,000,000점 돌파 | 10💎 |
| 10 | 프리즘 정복자 | 테이블 10 (최종보스) 클리어 | 20💎 |

- 업적은 `localStorage`에 저장
- 업적 달성 시 화면 상단에 토스트 알림 (tween 슬라이드 인/아웃)
- RESULT 화면에서 전체 업적 목록 확인 가능

---

## §11. 테이블 오브젝트 상세

### 11.1 일반 범퍼 (Bumper)
- **형태**: 원형, 반경 20px
- **동작**: 볼 충돌 시 반발계수 1.5로 밀어냄
- **시각**: 오렌지 네온, 히트 시 0.15초 밝기 플래시 + 반경 1.3배 확장
- **사운드**: bumperHit (짧은 "퐁" 음)

### 11.2 파워 범퍼 (Power Bumper)
- **형태**: 원형, 반경 25px, 내부 별 무늬
- **동작**: 반발계수 2.0 + 볼 속도 1.3배 부스트
- **시각**: 골드 글로우, 히트 시 파티클 방출 + 별 회전 애니메이션
- **사운드**: powerBumperHit (강한 "팡" 음)

### 11.3 크리스탈 타겟 (Crystal Target)
- **형태**: 6각형, 반경 18px, 5색 중 랜덤
- **동작**: 히트 시 내구도 -1, 0이 되면 파괴 → 크리스탈 획득
- **시각**: 해당 색상 글로우, 파괴 시 15개 파티클 폭발 + 크리스탈 아이콘 부유
- **사운드**: crystalBreak (유리 깨지는 "차르르" 음)

### 11.4 드롭 타겟 세트 (Drop Target Set)
- **형태**: 4~5개 직사각형 타겟이 일렬 배치
- **동작**: 각각 히트하면 눌림(비활성), 전부 눌리면 1000점 보너스 + 전체 복원
- **시각**: 눌린 타겟은 어둡게, 전체 눌림 시 플래시
- **사운드**: dropTarget (짧은 "딸깍" 음)

### 11.5 스피너 (Spinner)
- **형태**: 가로 바 (폭 40px, 높이 5px), 중심 회전
- **동작**: 볼 통과 시 회전, 회전당 50점
- **시각**: 메탈릭 실버, 회전 중 모션 블러(globalAlpha 잔상)
- **사운드**: spinner (빠른 "틱틱틱" 반복음)

### 11.6 롤오버 레인 (Rollover Lane)
- **형태**: 수직 선형 감지 구간 (길이 60px)
- **동작**: 볼 통과 시 150점, 3개 모두 통과 시 멀티볼 발동
- **시각**: 비활성=어두운 선, 활성=밝은 시안 글로우
- **사운드**: rollover (부드러운 "웅" 음)

### 11.7 킥아웃 홀 (Kickout Hole)
- **형태**: 원형 구멍, 반경 15px
- **동작**: 볼 흡수 → 1초 후 랜덤 방향으로 발사 + 300점
- **시각**: 어두운 원 + 가장자리 글로우, 흡수 중 맥동 애니메이션
- **사운드**: kickout (흡수 "슈웅" + 발사 "퍼웅")

### 11.8 세이브 게이트 (Save Gate)
- **형태**: 드레인 홀 위 수평 바
- **동작**: 활성화 시 볼 드레인 1회 방지, 사용 후 비활성
- **시각**: 비활성=투명, 활성=밝은 초록 글로우 맥동
- **충전**: 킥아웃 홀 3회 진입 (업그레이드로 감소 가능)

---

## §12. 모바일 대응 (F20, F21, F24 대응)

### 12.1 Canvas 해상도
```javascript
function resizeCanvas():
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  ctx.scale(dpr, dpr)
  // 테이블 스케일 재계산
  tableScale = Math.min(
    window.innerWidth / TABLE_BASE_WIDTH,
    window.innerHeight / TABLE_BASE_HEIGHT
  )
  buildTableCache(currentTable)  // F10: 캐시 재빌드
```

### 12.2 터치 이벤트
```javascript
canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

// touch-action: none (CSS)
// e.preventDefault() 모든 핸들러에서 호출
```

### 12.3 터치 타겟 최소 크기 (F24 대응)
```javascript
const MIN_TOUCH = 48 // px

function touchSafe(x, y, w, h):
  // 48px 미만이면 48px로 확장 (중심 유지)
  const safeW = Math.max(w, MIN_TOUCH)
  const safeH = Math.max(h, MIN_TOUCH)
  return {
    x: x - (safeW - w) / 2,
    y: y - (safeH - h) / 2,
    w: safeW,
    h: safeH
  }
```

### 12.4 세로 모드 최적화
- 핀볼 테이블은 **세로 비율**(≈ 2:3)이 자연스러움
- 모바일 세로 모드에서 최적 표시
- 가로 모드에서는 좌우 여백에 UI 배치

---

## §13. 사운드 시스템

### 13.1 Web Audio API 기반 (F2 대응 — setTimeout 0건)
```javascript
class SoundManager:
  constructor():
    this.ctx = null  // AudioContext (사용자 상호작용 후 생성)

  init():
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()

  // 모든 사운드는 오실레이터 합성
  play(name, volume = 1.0):
    if !this.ctx: return
    const now = this.ctx.currentTime
    // 사운드별 합성 로직 (아래 §13.2)
```

### 13.2 사운드 합성 설계
| 사운드 | 파형 | 주파수 | 엔벨로프 | 설명 |
|--------|------|--------|----------|------|
| bumperHit | sine+square | 440→880Hz (0.05s) | A:0.01 D:0.05 S:0 R:0.05 | 짧은 "퐁" |
| powerBumperHit | square+sawtooth | 660→1320Hz (0.08s) | A:0.01 D:0.08 S:0.3 R:0.1 | 강한 "팡" |
| crystalBreak | noise+sine | 2000→200Hz (0.3s) | A:0.01 D:0.1 S:0.5 R:0.2 | 유리 "차르르" |
| flipper | square | 220 (0.03s) | A:0.005 D:0.03 S:0 R:0.01 | 기계 "탁" |
| plunger | sine | 100→400Hz (0.1s) | A:0.01 D:0.1 S:0 R:0.05 | 스프링 "슝" |
| drain | sine | 440→110Hz (0.5s) | A:0.01 D:0.3 S:0.2 R:0.3 | 하강 "우우웅" |
| combo | sine×3 | 523/659/784Hz | A:0.01 D:0.1 S:0.5 R:0.2 | 화음 "딩!" |
| tableComplete | 코드진행 | C-E-G-C5 아르페지오 | 각 0.15s | 승리 팡파르 |
| bgmNormal | sine+triangle 루프 | 저음 드론 + 아르페지오 | 루프 8마디 | 일반 BGM |
| bgmBoss | square+sawtooth 루프 | 긴박한 베이스 + 멜로디 | 루프 8마디 | 보스 BGM |

### 13.3 볼륨 밸런스 테이블 (F29 대응)
| 사운드 | 볼륨 | 비고 |
|--------|------|------|
| bgmNormal | 0.15 | 배경 — 게임 플레이에 방해 안 됨 |
| bgmBoss | 0.20 | 긴박감 강조 |
| bumperHit | 0.5 | 빈번 — 적당한 볼륨 |
| powerBumperHit | 0.6 | 범퍼보다 살짝 크게 |
| crystalBreak | 0.7 | 핵심 보상 — 명확히 들림 |
| flipper | 0.3 | 매우 빈번 — 낮게 |
| plunger | 0.5 | 발사 피드백 |
| drain | 0.8 | 경고 — 크게 |
| combo | 0.6 | 보상 피드백 |
| tableComplete | 0.8 | 클리어 — 크게 |

---

## §14. 코드 품질 보증 체크리스트

### 14.1 변수 선언 순서 (F11 대응)
```
1. 'use strict'
2. const CONFIG = { ... }          // 설정 상수
3. const TABLE_DATA = [ ... ]      // 테이블 데이터
4. const UPGRADE_DATA = [ ... ]    // 업그레이드 데이터
5. let canvas, ctx                 // DOM 참조
6. let gameState, prevState        // 상태 변수
7. let ball, flippers, bumpers...  // 게임 오브젝트
8. let tweenManager, soundManager  // 매니저
9. let particlePool               // 파티클 풀
10. // --- 함수 정의 ---
11. // --- 이벤트 등록 ---
12. // --- init() 호출 ---
```

### 14.2 변수 사용처 검증 테이블 (F15 대응)
| 변수 | 선언 | 갱신 위치 | 사용 위치 |
|------|------|-----------|-----------|
| ball.x/y | initBall() | updateBallPosition() | render(), checkCollision() |
| ball.vx/vy | initBall() | applyGravity(), resolveCollision() | updateBallPosition() |
| comboCount | PLAYING 진입 | applyBumperHit(), updateCombo() | hitScore 계산, drawCombo() |
| comboTimer | PLAYING 진입 | applyBumperHit(), updateCombo() | updateCombo() 리셋 판정 |
| score | initGame() | addScore() 단일 경로 | drawUI(), checkAchievement() |
| crystals | initGame() | addCrystals() 단일 경로 | drawUI(), canUpgrade() |
| ballsLeft | initGame() | drainBall() 단일 경로 | drawUI(), checkGameOver() |
| isTransitioning | beginTransition() | beginTransition onComplete | 모든 update 함수 가드 |
| isDraining | beginDrain() | beginDrain(), drainComplete() | updatePlaying() 가드 |
| tableScale | resizeCanvas() | resizeCanvas() | 모든 draw 함수 |

### 14.3 기능별 세부 구현 체크리스트 (F19 대응)
- [ ] 플리퍼 좌: 키보드(←/Z) + 마우스(좌클릭) + 터치(좌하단)
- [ ] 플리퍼 우: 키보드(→/X) + 마우스(우클릭) + 터치(우하단)
- [ ] 플런저: 키보드(↓/Space 홀드) + 마우스(드래그) + 터치(스와이프)
- [ ] 볼-벽 충돌: 반사 + 위치 보정
- [ ] 볼-범퍼 충돌: 반사 + 점수 + 파티클 + 사운드
- [ ] 볼-타겟 충돌: 반사 + 내구도 감소 + (파괴 시) 크리스탈 + 파티클 + 사운드
- [ ] 볼-플리퍼 충돌: 스윙 중이면 추가 속도
- [ ] 드레인 감지: 볼 y > 드레인라인 → isDraining → ballsLeft - 1
- [ ] 테이블 클리어: 모든 크리스탈 타겟 파괴 → TABLE_CLEAR
- [ ] 콤보: 1초 내 재히트 → 카운터 증가, 타임아웃 → 리셋
- [ ] 멀티볼: 3레인 통과 → 볼 2개 추가
- [ ] 세이브 게이트: 킥아웃 3회 → 게이트 활성 → 드레인 1회 방지
- [ ] 업그레이드 상점: 테이블 클리어 후 → 크리스탈로 구매
- [ ] 보스 패턴: T5 화염범퍼, T10 프리즘 3코어
- [ ] 업적 10종: 조건 달성 → 토스트 알림 → localStorage 저장
- [ ] 일시정지: P/ESC → 오버레이 + 입력 차단
- [ ] BGM 전환: 일반→보스 크로스페이드

### 14.4 수치 정합성 검증 테이블 (F7 대응)
> 코드 리뷰 시 아래 수치가 기획서와 일치하는지 전수 검증

| 항목 | 기획서 값 | 코드 상수 확인란 |
|------|-----------|-----------------|
| GRAVITY | 980 | ☐ |
| BALL_RADIUS | 10 | ☐ |
| FLIPPER_LENGTH | 80 | ☐ |
| FLIPPER_RESTITUTION | 1.2 | ☐ |
| BUMPER_RESTITUTION | 1.5 | ☐ |
| 일반 범퍼 점수 | 100 | ☐ |
| 파워 범퍼 점수 | 250 | ☐ |
| 크리스탈 타겟 점수 | 500 | ☐ |
| 콤보 ×2 구간 | 5~9 | ☐ |
| 콤보 ×3 구간 | 10~19 | ☐ |
| 콤보 ×5 구간 | 20+ | ☐ |
| T1 크리스탈 타겟 수 | 5 | ☐ |
| T5 보스 HP | 20 | ☐ |
| T10 보스 코어 HP | 각 15 | ☐ |
| 플리퍼 파워 Lv1 비용 | 3💎 | ☐ |
| 엑스트라 볼 Lv1 비용 | 15💎 | ☐ |

### 14.5 assets/ 디렉토리 금지 규칙 (F1 — 20사이클 최우선)
```
⛔ 절대 금지 항목:
1. assets/ 디렉토리 생성
2. 외부 SVG/PNG/JPG 파일 참조
3. ASSET_MAP, SPRITES, preloadAssets 등 에셋 로드 코드
4. new Image(), fetch('assets/...') 패턴
5. Google Fonts 등 외부 리소스 로드

✅ 허용:
1. thumbnail.svg (게임 디렉토리 루트, 카드 표시용)
2. 100% Canvas 코드 드로잉
3. Web Audio 오실레이터 합성
4. localStorage 읽기/쓰기
```

### 14.6 코드 리뷰 15항목 체크리스트
1. ☐ assets/ 디렉토리 미존재
2. ☐ setTimeout 0건 (Web Audio 네이티브 스케줄링)
3. ☐ confirm/alert/prompt 0건
4. ☐ 전역 직접 참조 0건 (순수 함수 패턴)
5. ☐ beginTransition() 경유 원칙 (PAUSED 예외)
6. ☐ render()에서 상태 변경 0건
7. ☐ try-catch gameLoop 래핑
8. ☐ dt 캡 (0.05초)
9. ☐ devicePixelRatio 적용
10. ☐ touch-action: none + passive: false
11. ☐ 터치 타겟 48×48px 이상
12. ☐ 기획서 수치 전수 일치 (§14.4)
13. ☐ 유령 변수 0건 (§14.2)
14. ☐ TweenManager clearImmediate() 구현
15. ☐ offscreen canvas 캐싱 구현

### 14.7 회귀 테스트 플로우 (F14 대응)
```
수정 후 전체 플로우 회귀 테스트:
TITLE → TABLE_SELECT(T1 선택)
  → PLAYING(발사→플리퍼→범퍼히트→타겟파괴→콤보)
  → DRAIN(볼 드레인→잔여볼 표시)
  → PLAYING(재발사)
  → TABLE_CLEAR(클리어 연출→보상)
  → UPGRADE(구매→취소)
  → TABLE_SELECT(T2 선택)
  → PLAYING
  → GAMEOVER(전체 볼 소진)
  → TITLE(재시작)
```

---

## §15. 코드 아키텍처

### 15.1 논리적 섹션 구조 (F30 대응)
```
// ═══════════════════════════════════════════
// §A. CONFIG & DATA (상수, 테이블, 업그레이드)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §B. ENGINE (TweenManager, SoundManager, ParticlePool)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §C. PHYSICS (중력, 충돌 감지/해결, 서브스텝)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §D. GAME OBJECTS (Ball, Flipper, Bumper, Target...)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §E. RENDERING (draw 함수들, offscreen 캐시)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §F. GAME STATES (각 상태 enter/update/exit)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §G. INPUT (키보드/마우스/터치 핸들러)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §H. SAVE/LOAD (localStorage)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §I. INIT (DOM 설정, 이벤트 등록, 게임 시작)
// ═══════════════════════════════════════════
```

### 15.2 순수 함수 패턴 (F3 대응)
```javascript
// ❌ 금지: 전역 직접 참조
function checkDrain() {
  if (ball.y > drainLine) { ... }
}

// ✅ 필수: 파라미터로 전달
function checkDrain(ball, drainLineY) {
  if (ball.y > drainLineY) { ... }
}
```

### 15.3 단일 갱신 경로 (F16 대응)
```javascript
// 점수 갱신: addScore() 만 사용
function addScore(amount) { score += amount; }

// 크리스탈 갱신: addCrystals() 만 사용
function addCrystals(amount) { crystals += amount; }

// 볼 감소: drainBall() 만 사용
function drainBall() { ballsLeft--; }

// ❌ 금지: score += 100 직접 대입
// ❌ 금지: ballsLeft-- 직접 대입
```

### 15.4 TweenManager (F6 대응)
```javascript
class TweenManager {
  _tweens = []
  _pendingAdd = []
  _isUpdating = false

  add(tween) {
    if (this._isUpdating) {
      this._pendingAdd.push(tween)
    } else {
      this._tweens.push(tween)
    }
    return tween
  }

  clearImmediate() {
    // 즉시 정리 — cancelAll()의 deferred 문제 해결
    this._tweens.length = 0
    this._pendingAdd.length = 0
    this._isUpdating = false
  }

  update(dt) {
    this._isUpdating = true
    // ... 업데이트 로직 ...
    this._isUpdating = false
    // pending 적용
    if (this._pendingAdd.length > 0) {
      this._tweens.push(...this._pendingAdd)
      this._pendingAdd.length = 0
    }
  }
}
```

---

## §16. 세이브/로드

### 16.1 저장 데이터 구조
```javascript
const SAVE_KEY = 'crystal-pinball-save'

saveData = {
  version: 1,
  unlockedTable: 4,      // 해금된 최고 테이블 번호
  crystals: 25,           // 보유 크리스탈
  upgrades: {             // 업그레이드 레벨
    flipperPower: 2,
    ballControl: 1,
    comboDuration: 0,
    saveGate: 1,
    multiball: 0,
    explosiveBall: 0,
    piercingBall: 0,
    extraBall: 0
  },
  highScore: 150000,      // 최고 점수
  achievements: [1, 2, 5], // 달성한 업적 ID
  totalCrystals: 48,      // 누적 수집 크리스탈
  totalScore: 580000       // 누적 점수
}
```

### 16.2 판정 순서 (Cycle 2 B4 교훈)
```
// 반드시 "판정 먼저, 저장 나중에"
const isNewHighScore = (score > loadHighScore())
saveHighScore(score)
if (isNewHighScore) showNewRecord()
```

---

## 사이드바 메타데이터 (게임 페이지 표시용)

```yaml
game:
  title: "크리스탈 핀볼"
  description: "마법 크리스탈이 가득한 핀볼 테이블에서 빛나는 볼을 조작하라! 10개 테이블을 공략하고, 크리스탈로 플리퍼를 업그레이드하여 최종 보스를 격파하자."
  genre: ["arcade", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "←/→ 또는 Z/X: 좌/우 플리퍼"
    - "↓/Space: 플런저 (꾹 눌러 파워 조절)"
    - "P/ESC: 일시정지"
    - "터치: 좌/우 화면 탭 = 플리퍼, 스와이프 = 발사"
  tags:
    - "#핀볼"
    - "#물리"
    - "#크리스탈"
    - "#아케이드"
    - "#업그레이드"
    - "#보스전"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## 홈 페이지 GameCard 표시 정보

```yaml
thumbnail: "games/crystal-pinball/thumbnail.svg"  # 4:3 비율
title: "크리스탈 핀볼"  # 1줄 잘림
description: "마법 크리스탈이 가득한 핀볼 테이블에서 빛나는 볼을 조작하라! 10개 테이블을 공략하고 보스를 격파하자."  # 2줄 잘림
genre: ["arcade", "casual"]  # 배지 최대 2개
playCount: 0  # 1000 이상이면 "1.2k" 형식
addedAt: "2026-03-22"  # 7일 이내 → "NEW" 배지
featured: true  # ⭐ 배지 표시
```
