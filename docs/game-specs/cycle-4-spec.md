---
game-id: neon-dash-runner
title: 네온 대시 러너
genre: arcade, casual
difficulty: medium
---

# 네온 대시 러너 (Neon Dash Runner) — 상세 기획서

> **Cycle:** 4
> **작성일:** 2026-03-20
> **기획:** Claude (Game Designer)
> **근거:** `docs/analytics/cycle-4-report.md` 분석 보고서 기반

---

## 0. 이전 사이클 피드백 반영

> Cycle 3 "미니 타워 디펜스" 포스트모템에서 지적된 문제점과 다음 사이클 제안을 **명시적으로** 반영합니다.

### 0-1. Cycle 3 문제 해결 매핑

| Cycle 3 문제 / 제안 | 심각도 | Cycle 4 반영 방법 |
|---------------------|--------|-------------------|
| **[B1] waveComplete() 반복 호출** — tween 지연 전환 중 매 프레임 보상 중복 지급 | CRITICAL | → **§8 tween 상태 전환 가드 패턴 표준화**. 모든 tween onComplete 상태 전환에 `transitioning` 가드 플래그를 즉시 설정. 파워업 획득·게임오버 전환 등 모든 지연 콜백에 동일 패턴 적용 |
| **[B2] 게임오버 전환 경쟁** — endGame()과 waveComplete() tween 동시 실행 | CRITICAL | → **상태 전환 우선순위 체계 도입**. `STATE_PRIORITY` 맵 정의: GAMEOVER(99) > 모든 상태. 전환 함수 진입부에 `if (STATE_PRIORITY[currentState] >= STATE_PRIORITY[targetState]) return;` 가드 |
| **[B3] consecutiveCleanWaves 미작동** — 유령 변수 | MAJOR | → **"유령 변수 방지" 체크리스트** 명시. §13 코드 리뷰 체크리스트에 "선언된 모든 변수의 갱신/사용처 확인" 항목 추가. 기획서에 명시된 변수는 §5에서 사용 흐름까지 명시 |
| **[B4] SVG 필터 재발** — feGaussianBlur가 에셋에 포함 | MINOR | → **SVG 완전 미사용**. 모든 시각 요소를 순수 Canvas Path2D + arc + fillRect로 렌더링. §4에 "금지 목록: SVG, feGaussianBlur, 외부 이미지" 명시 |
| tween 상태 전환 가드 패턴 표준화 | 제안 | → **§10.1 TransitionGuard 패턴** 설계. `beginTransition(targetState)` 헬퍼 함수로 가드 플래그 + 우선순위 검사를 일원화 |
| 러너/레이싱 또는 리듬 장르 도전 | 제안 | → **무한 러너 (Endless Runner)** 장르 선택. 절차적 레벨 생성으로 무한 맵 구현. casual 장르 최초 진입 |
| 에셋 파이프라인 자동 검증 | 제안 | → 에셋이 아예 없음 (100% Canvas 드로잉). 금지 패턴 grep 검사 목록: `setTimeout`, `confirm(`, `alert(`, `feGaussianBlur`, `eval(` |

### 0-2. platform-wisdom.md 검증된 패턴 계승

| 성공 패턴 | 적용 |
|-----------|------|
| 단일 HTML + Canvas + Vanilla JS | 동일 아키텍처 유지 |
| 게임 상태 머신 | LOADING → TITLE → PLAYING → PAUSE → CONFIRM_MODAL → GAMEOVER (6상태) |
| DPR 대응 (Canvas 내부 해상도 ≠ CSS) | 동일 적용 |
| localStorage try-catch | 동일 적용 (iframe sandbox 대응) |
| TweenManager + ObjectPool 재사용 | 핵심 인프라로 채택 (이징 5종 완전 구현) |
| 기획서에 HEX/수식 명시 | 모든 수치/공식/색상 코드 명시 (구현 충실도 목표 95%) |
| Canvas 기반 모달 (confirm/alert 금지) | 모든 확인 UI를 Canvas 모달로 구현 |
| 관대한 히트박스 | 플레이어 시각 크기(32×32)보다 작은 히트박스(20×20) 적용 |
| 코드 폴백 렌더링 | 에셋 로드 실패 대비 불필요 — 100% Canvas 드로잉 |
| Web Audio API 절차적 사운드 | 효과음 5종 (점프, 코인, 충돌, 파워업, 게임오버) |
| destroy() 패턴 표준화 | registeredListeners + listen() + destroy() 그대로 계승 |
| 상태×시스템 매트릭스 | §8에서 기획서 정의 + 코드 주석 이중 포함 |
| setTimeout 완전 금지 | 모든 지연 전환은 tween onComplete. 코딩 가이드라인 명시 |
| 판정 먼저, 저장 나중에 | §7 점수 시스템에서 순서 고정 |

### 0-3. 누적 기술 개선 반영

| 미해결 항목 | 출처 | Cycle 4 대응 |
|------------|------|-------------|
| tween onComplete 가드 플래그 | Cycle 3 신규 | → `beginTransition()` 헬퍼로 표준화 (§10.1) |
| 상태 전환 우선순위 체계 | Cycle 3 신규 | → `STATE_PRIORITY` 맵 도입 (§10.1) |
| 유령 변수 방지 | Cycle 2~3 반복 | → 코드 리뷰 체크리스트에 항목 추가 (§13.4) |

---

## 1. 게임 개요 및 핵심 재미 요소

### 컨셉
네온 사이버펑크 도시를 질주하는 무한 러너 게임입니다. 플레이어는 **3개 레인(상/중/하)**을 전환하고 **점프**로 장애물을 피하며 **코인을 수집**합니다. 거리에 따라 속도가 점진적으로 증가하고, **절차적 레벨 생성**으로 매번 다른 패턴의 장애물이 등장합니다. **자석·쉴드·x2** 3종 파워업으로 전략적 요소를 더했습니다.

### 핵심 재미 요소
1. **"한 판만 더"의 중독성** — 속도가 올라갈수록 긴장감이 높아지고, 최고 기록을 깨고 싶은 욕구가 반복 플레이를 유도
2. **즉각적 반응의 쾌감** — 레인 전환과 점프의 반응이 즉각적이고 부드러워 조작 자체가 재미있음
3. **절차적 레벨의 신선함** — 매 게임마다 다른 장애물 배치로 패턴 암기가 아닌 순간 판단력 테스트
4. **시각적 보상** — 네온 색상의 코인 획득 이펙트, 쉴드 파괴 연출, 파워업 활성화 효과가 플레이의 쾌감을 증폭
5. **간단한 조작, 높은 숙련 천장** — 3레인 + 점프만으로 누구나 시작할 수 있지만, 고속에서의 최적 경로 선택은 고숙련 영역

### 장르 다양화 기여
- **casual 장르 최초 진입** — 플랫폼 5개 허용 장르(arcade, puzzle, strategy, action, casual) 중 유일한 공백 해소
- arcade + casual 듀얼 태그로 접근성과 리플레이 가치 동시 확보

---

## 2. 게임 규칙 및 목표

### 2.1 기본 규칙
- **사이드스크롤 무한 러너** — 캐릭터는 화면 좌측 고정, 배경과 장애물이 우→좌로 스크롤
- 3개 **레인** (상: y=25%, 중: y=50%, 하: y=75% — 게임 영역 기준)을 전환하며 장애물 회피
- **점프**로 바닥 장애물을 넘을 수 있음 (점프 중에도 레인 전환 가능)
- 장애물에 충돌하면 **라이프 1 감소** (초기 라이프: 3, 최대 3)
- 라이프가 0이면 **게임 오버**
- **쉴드 파워업** 보유 시 충돌 1회 흡수 (라이프 대신 쉴드 소멸)
- 목표: **최대한 먼 거리를 달리며 최고 점수를 기록**

### 2.2 레인 시스템

```
레인 0 (상단): y = gameAreaTop + gameAreaHeight × 0.25
레인 1 (중앙): y = gameAreaTop + gameAreaHeight × 0.50  ← 시작 위치
레인 2 (하단): y = gameAreaTop + gameAreaHeight × 0.75
```

- 레인 전환: tween 애니메이션 `150ms, easeOutQuad` (즉각적이면서 부드러움)
- 점프: 현재 레인에서 수직으로 `jumpHeight = 60px` 상승 후 하강, 총 `500ms`
- 점프 중 레인 전환 → 포물선 궤적이 새 레인으로 이동 (입력 즉시 반영)

### 2.3 장애물 유형 (4종)

| 장애물 | 형태 | 크기 | 회피 방법 | 색상 | 등장 거리 |
|--------|------|------|-----------|------|-----------|
| **배리어** (Barrier) | 네온 직사각형 벽 | 40×50px | 다른 레인으로 전환 | `#FF1744` (레드) | 0m+ |
| **스파이크** (Spike) | 바닥 삼각형 | 30×20px | 점프 | `#FF9100` (오렌지) | 0m+ |
| **레이저** (Laser) | 수평 레이저 빔 (2레인 점유) | 400×8px | 비어있는 1레인으로 전환 | `#D500F9` (퍼플) | 300m+ |
| **드론** (Drone) | 떠다니는 삼각형 | 28×28px | 레인 전환 (상하 왕복 이동) | `#00E5FF` (시안) | 600m+ |

- **모든 장애물 시각 크기 > 판정 히트박스**: 판정 크기 = 시각 크기 × 0.7 (관대한 판정, Cycle 2 성공 패턴)
- 장애물은 ObjectPool로 재활용 (풀 크기: 20)

### 2.4 코인

| 유형 | 점수 | 시각 | 배치 확률 |
|------|------|------|-----------|
| **일반 코인** | 10점 | 작은 네온 원(∅16px), `#FFD740` | 70% |
| **슈퍼 코인** | 50점 | 큰 네온 별(∅24px), `#FF4081` | 15% |
| **연속 코인 줄** | 10점 × 5~8개 | 일반 코인 일렬 배치 | 15% |

- 코인 히트박스: 시각 크기 × 1.3 (넉넉한 획득 판정)
- 코인 획득 시: tween scaleUp(1.5) + fadeOut(200ms) + 점수 팝업
- 코인은 ObjectPool로 재활용 (풀 크기: 30)

### 2.5 파워업 (3종)

| 파워업 | 아이콘 색상 | 효과 | 지속 시간 | 등장 간격 |
|--------|------------|------|-----------|-----------|
| **자석 (Magnet)** | `#2979FF` (블루) | 2레인 범위 내 코인 자동 흡수 | 8초 | 15~25초 |
| **쉴드 (Shield)** | `#00E676` (그린) | 충돌 1회 흡수 (라이프 대신 소멸) | 1회 사용 | 20~35초 |
| **x2 (Double)** | `#FFAB00` (앰버) | 모든 점수 2배 | 10초 | 25~40초 |

- 파워업 캡슐: 32×32px, 네온 글로우 + 아이콘
- 파워업 획득에 **가드 플래그** 적용 (Cycle 3 B1 교훈):
  ```
  if (powerup.collected) continue;  // 가드
  powerup.collected = true;          // 즉시 플래그
  activatePowerup(powerup.type);     // 효과 적용
  ```
- 자석 활성 시: 코인이 플레이어를 향해 tween 이동 (easeOutQuad, 300ms)
- 쉴드 활성 시: 플레이어 주변 녹색 글로우 원 렌더링
- x2 활성 시: HUD 점수 옆 "×2" 텍스트 깜빡임

---

## 3. 조작 방법

### 3.1 키보드 (PC 기본)

| 키 | 동작 |
|----|------|
| **↑** / **W** | 레인 위로 이동 (상단 레인이면 무시) |
| **↓** / **S** | 레인 아래로 이동 (하단 레인이면 무시) |
| **Space** | 점프 (공중에선 무시 — 2단 점프 없음) |
| **P** / **ESC** | 일시정지 토글 |
| **R** | 게임오버 시 재시작 (Canvas 모달 확인) |
| **Enter** / **Space** | 타이틀 화면에서 게임 시작 |

### 3.2 마우스 (PC 보조)

| 조작 | 동작 |
|------|------|
| **Canvas 상단 1/3 클릭** | 레인 위로 이동 |
| **Canvas 하단 1/3 클릭** | 레인 아래로 이동 |
| **Canvas 중앙 1/3 클릭** | 점프 |
| **일시정지 버튼 (우상단)** | 일시정지 토글 |

### 3.3 터치 (모바일)

| 조작 | 동작 |
|------|------|
| **스와이프 ↑** | 레인 위로 이동 |
| **스와이프 ↓** | 레인 아래로 이동 |
| **탭** | 점프 |
| **일시정지 버튼 (우상단)** | 일시정지 토글 |
| **재시작 버튼** | 게임오버 시 재시작 |

> **입력 모드 자동 감지**: 첫 입력(키보드/마우스/터치)에 따라 모드 자동 설정. 이후 입력 변경 시 즉시 전환. 터치 모드에서는 스와이프 감도 최적화, 버튼 크기 1.5배 확대.
>
> **⚠️ Cycle 2 교훈**: 입력 모드 변수(`inputMode`)가 선언만 되고 실제 분기에 사용되지 않는 "유령 코드"가 되지 않도록, §5에서 입력 모드별 분기 로직의 사용 흐름을 명확히 명시한다.

---

## 4. 시각적 스타일 가이드

### 4.1 색상 팔레트 — 네온 사이버펑크

| 용도 | HEX | 설명 |
|------|-----|------|
| **배경 (도시)** | `#0D0D1A` | 깊은 남색 (밤하늘) |
| **배경 그라데이션 하단** | `#1A0A2E` | 보라빛 어둠 |
| **도로 표면** | `#1C1C2E` | 진한 남보라 |
| **레인 구분선** | `#2D2D4E` (40% alpha) | 은은한 레인 가이드 |
| **플레이어** | `#00E5FF` (시안) | 밝은 네온 시안 |
| **플레이어 글로우** | `#00E5FF` (30% alpha) | 플레이어 주변 발광 |
| **코인 일반** | `#FFD740` | 골드 네온 |
| **코인 슈퍼** | `#FF4081` | 핑크 네온 |
| **배리어** | `#FF1744` | 레드 네온 |
| **스파이크** | `#FF9100` | 오렌지 네온 |
| **레이저** | `#D500F9` | 퍼플 네온 |
| **드론** | `#00E5FF` | 시안 네온 (깜빡임으로 플레이어와 구분) |
| **파워업 자석** | `#2979FF` | 블루 네온 |
| **파워업 쉴드** | `#00E676` | 그린 네온 |
| **파워업 x2** | `#FFAB00` | 앰버 네온 |
| **HUD 텍스트** | `#E0E0E0` | 밝은 회색 |
| **HUD 강조** | `#00E5FF` | 시안 (거리/점수) |
| **HUD 라이프** | `#FF1744` | 레드 (하트) |
| **HUD 콤보** | `#FFD740` | 골드 (콤보 카운터) |
| **건물 실루엣** | `#14142B` → `#1A1A3E` | 그라데이션 다크 (원경) |
| **건물 창문** | `#FF1744`, `#D500F9`, `#00E5FF` 랜덤 | 작은 네온 사각형 |
| **도로 중앙선** | `#FFD740` (50% alpha) | 대시 패턴 (속도감 강조) |

### 4.2 배경 (패럴랙스 3레이어)

| 레이어 | 내용 | 스크롤 배율 | 높이 비율 |
|--------|------|------------|-----------|
| **원경 (하늘)** | 별 파티클 + 달(원) | ×0.1 | 상위 30% |
| **중경 (건물)** | 절차적 사각형 빌딩 실루엣 + 네온 창문 | ×0.4 | 상위 60% |
| **근경 (도로)** | 3레인 도로 + 중앙선 대시 + 양옆 네온 스트립 | ×1.0 | 하위 70% |

- **Canvas 기본 크기:** `480 × 360px` (4:3 비율, 상단 HUD 40px 포함)
- 게임 영역: `480 × 320px` (HUD 아래)
- 원경·중경은 **offscreen canvas 캐시** → 스크롤 시 drawImage 오프셋만 변경
- 건물 실루엣: 높이 50~150px 랜덤 사각형, 상단 안테나(가는 선) 가끔 추가
- 건물 창문: 3×3px 네온 사각형이 랜덤 배치 (`#FF1744`/`#D500F9`/`#00E5FF` 중 랜덤)
- 도로 양옆 네온 스트립: `#D500F9` 2px 직선, 글로우 효과(반투명 8px 선 겹치기)

### 4.3 오브젝트 형태 (순수 Canvas 드로잉 — SVG/외부 이미지 완전 미사용)

| 오브젝트 | 드로잉 방식 |
|----------|------------|
| **플레이어** | 시안 삼각형(우측 뾰족) 32×32px + 내부 밝은 삼각형 + 후방 속도선 2개 + 글로우(반투명 큰 원) |
| **배리어** | 빨강 직사각형 40×50px + 테두리 밝은 빨강 + 상단/하단 수평선 장식 |
| **스파이크** | 오렌지 삼각형 30×20px (위로 뾰족) + 글로우 |
| **레이저** | 보라 수평선 400×4px + 위아래 글로우 라인 + 양쪽 끝 원형 이미터 |
| **드론** | 시안 역삼각형 28×28px + 하단 프로펠러(회전 선) + 빨강 눈(작은 원) |
| **코인 일반** | 골드 원 ∅16px + 내부 작은 원 + 글로우 + 회전 tween |
| **코인 슈퍼** | 핑크 별(5꼭지) ∅24px + 글로우 + 회전 + 깜빡임 tween |
| **파워업 캡슐** | 해당 색상 둥근사각 32×32px + 내부 아이콘(자석=U자, 쉴드=원, x2=텍스트) + 글로우 펄스 |
| **충돌 이펙트** | 빨강 파티클 8개 방사형 확산 + fadeOut |
| **코인 획득 이펙트** | 골드 파티클 4개 + scaleUp + fadeOut |
| **쉴드 파괴 이펙트** | 녹색 파편 6개 + 충격파 원 확장 |
| **점수 팝업** | "+10" 텍스트 tween fadeUp + fadeOut (300ms) |

### 4.4 폰트
- **시스템 폰트 스택만 사용** (외부 CDN 의존 0개):
  ```
  'Segoe UI', system-ui, -apple-system, sans-serif
  ```
- HUD 텍스트: `14px bold`
- 거리/점수: `18px bold`
- 타이틀: `36px bold`
- 파워업 타이머: `11px`
- 점수 팝업: `12px bold`
- 게임오버 점수: `28px bold`

### 4.5 금지 목록 (에셋 자동 검증 대상)
- ❌ SVG 파일 / SVG 필터 (`feGaussianBlur`, `<filter>`)
- ❌ 외부 이미지 파일 (`.png`, `.jpg`, `.svg`, `.gif`)
- ❌ 외부 폰트 / Google Fonts / CDN
- ❌ `setTimeout` / `setInterval` (게임 로직)
- ❌ `confirm()` / `alert()` / `prompt()`
- ❌ `eval()`

---

## 5. 핵심 게임 루프 (초당 프레임 기준 로직 흐름)

### 5.1 메인 루프 (`requestAnimationFrame`)

```
function loop(timestamp) {
  const dt = min((timestamp - lastTime) / 1000, 0.05);  // 최대 50ms 캡
  lastTime = timestamp;

  switch (state) {
    case LOADING:       updateLoading();                                        break;
    case TITLE:         tw.update(dt); renderTitle();                           break;
    case PLAYING:       updateGame(dt); tw.update(dt); renderGame();            break;
    case PAUSE:         tw.update(dt); renderGame(); renderPause();             break;
    case CONFIRM_MODAL: tw.update(dt); renderGame(); renderModal();             break;
    case GAMEOVER:      tw.update(dt); renderGame(); renderGameover();          break;
  }

  rafId = requestAnimationFrame(loop);
}
```

### 5.2 updateGame(dt) 상세 흐름

```
1. ScrollManager.update(dt)
   → speed 증가 계산: speed = min(maxSpeed, baseSpeed + distance / 1000 * accel)
   → 3레이어 패럴랙스 오프셋 갱신
   → 거리(distance) 누적: distance += speed × dt

2. ChunkGenerator.update(dt)
   → 현재 scrollX 기준 다음 청크 필요 여부 검사
   → 필요 시 절차적 생성: spawnObstacles() + spawnCoins() + spawnPowerup()
   → ObjectPool.acquire로 장애물/코인/파워업 활성화

3. Player.update(dt)
   → 레인 전환 tween 진행 (inputMode에 따른 분기: 키보드→즉시, 터치→스와이프 감도 적용)
   → 점프 물리: jumpVelocity -= gravity × dt; y += jumpVelocity × dt
   → 자석 파워업 활성 시: 주변 코인 흡인 로직

4. Obstacles.forEach(obstacle => {
   → obstacle.x -= speed × dt         // 좌측으로 스크롤
   → if (obstacle.type === DRONE) obstacle.updatePatrol(dt)  // 상하 왕복
   → if (obstacle.x < -obstacle.width) pool.release(obstacle) // 화면 밖 회수
   → if (collide(player, obstacle)) { handleCollision(obstacle); }
   })
   ※ 역순 순회 + splice 패턴

5. Coins.forEach(coin => {
   → coin.x -= speed × dt
   → if (magnetActive) { attractToPlayer(coin); }
   → if (coin.x < -20) pool.release(coin)
   → if (collide(player, coin)) {
       if (coin.collected) continue;    // 가드 플래그 (C3 B1 교훈)
       coin.collected = true;
       addScore(coin.value × scoreMultiplier);
       spawnCoinFX();
       pool.release(coin);
     }
   })

6. Powerups.forEach(pu => {
   → pu.x -= speed × dt
   → if (pu.x < -40) pool.release(pu)
   → if (collide(player, pu)) {
       if (pu.collected) continue;      // 가드 플래그
       pu.collected = true;
       activatePowerup(pu.type);
       pool.release(pu);
     }
   })

7. ActivePowerups.update(dt)
   → 각 파워업 남은 시간 감소
   → 만료 시 비활성화 + HUD 업데이트

8. Particles.update(dt)                // 시각 이펙트

9. checkGameOver()
   → if (lives <= 0 && !transitioning) {
       beginTransition(GAMEOVER);       // 가드 + 우선순위 검사 내장
     }
```

### 5.3 입력 모드별 분기 (유령 코드 방지 — 사용처 명시)

```
변수: inputMode = 'keyboard' | 'mouse' | 'touch'

사용처 1: Player.update(dt) — 레인 전환 속도
  keyboard/mouse → 즉시 전환 (tween 150ms)
  touch → 스와이프 감도 threshold 30px 적용

사용처 2: renderPause() — 버튼 크기
  keyboard/mouse → 기본 크기
  touch → 버튼 1.5배 확대

사용처 3: renderGameover() — 재시작 안내 텍스트
  keyboard → "R키를 눌러 재시작"
  mouse → "클릭하여 재시작"
  touch → "탭하여 재시작"

사용처 4: Pause 버튼 표시
  keyboard → P키 안내만 표시
  mouse/touch → 우상단 일시정지 아이콘 버튼 표시
```

### 5.4 렌더링 순서 (Z-order)

```
1. 배경 원경 (하늘 + 별)         — offscreen canvas, ×0.1 스크롤
2. 배경 중경 (건물 실루엣)       — offscreen canvas, ×0.4 스크롤
3. 배경 근경 (도로 + 레인선)     — ×1.0 스크롤
4. 도로 중앙선 대시               — 속도감 연출
5. 코인                           — 회전 + 글로우
6. 파워업 캡슐                    — 글로우 펄스
7. 장애물                         — 유형별 드로잉
8. 플레이어                       — 삼각형 + 글로우 + 속도선
9. 파티클/이펙트                  — 충돌, 코인 획득, 점수 팝업
10. HUD (상단)                    — 거리, 점수, 라이프, 파워업 타이머
11. 오버레이 (일시정지/모달/게임오버) — 반투명 배경 위
```

---

## 6. 난이도 시스템

### 6.1 속도 곡선

| 파라미터 | 공식 | 0m | 500m | 1000m | 2000m | 5000m |
|----------|------|----|------|-------|-------|-------|
| **게임 속도** (px/s) | `min(600, 200 + distance × 0.04)` | 200 | 220 | 240 | 280 | 400 |
| **장애물 밀도** (개/청크) | `min(4, 1 + floor(distance / 500))` | 1 | 2 | 3 | 3 | 4 |
| **레이저 등장** | `distance >= 300` | ✗ | ✓ | ✓ | ✓ | ✓ |
| **드론 등장** | `distance >= 600` | ✗ | ✗ | ✓ | ✓ | ✓ |
| **다중 장애물 조합** | `distance >= 800` | ✗ | ✗ | ✗ | ✓ | ✓ |

### 6.2 절차적 레벨 생성 — 청크 시스템

```
청크 크기: 400px (화면 너비에 근접)
생성 트리거: 다음 청크 시작 X가 화면 우측 + 200px 이내일 때

청크 생성 알고리즘:
  1. 난이도 레벨 = floor(distance / 500) (0~10, cap)
  2. 장애물 수 = min(4, 1 + 난이도 레벨)
  3. 패턴 선택 (난이도별 가중치):
     - SINGLE_BARRIER: 단일 레인 배리어          (가중치: 10 - 난이도)
     - SPIKE_ROW: 한 레인에 스파이크 2~3개       (가중치: 8 - 난이도 × 0.5)
     - DOUBLE_BARRIER: 2레인 동시 배리어         (가중치: 난이도 × 1.5)
     - LASER_GATE: 2레인 레이저 (300m+)          (가중치: 난이도 × 1.0)
     - DRONE_PATROL: 드론 1~2마리 (600m+)        (가중치: 난이도 × 0.8)
     - GAUNTLET: 배리어+스파이크+드론 복합 (800m+) (가중치: 난이도 × 0.5)
  4. 코인 배치: 안전 레인에 3~8개 일렬 또는 지그재그
  5. 파워업 배치: 마지막 파워업 후 경과 시간 > 최소 간격이면 확률적 배치

안전 규칙:
  - 반드시 1개 이상의 안전 레인 (회피 가능) 보장
  - 연속 2청크에 레이저 배치 금지 (반응 시간 확보)
  - 점프+레인전환 동시 요구 장애물은 1000m 이후에만
```

### 6.3 동적 밸런스 보정

| 조건 | 효과 | UI 표시 |
|------|------|---------|
| **라이프 1** (위기 상태) | 다음 3청크 장애물 밀도 -1 | 화면 가장자리 빨강 비네트 |
| **연속 500m 무피격** | 보너스 코인 줄 추가 배치 | "PERFECT RUN!" 텍스트 팝업 |
| **최고 기록 근접 (90%)** | 점수 텍스트 글로우 강화 | HUD 점수 깜빡임 |

---

## 7. 점수 시스템

### 7.1 점수 획득

| 행동 | 기본 점수 | 비고 |
|------|-----------|------|
| 거리 100m 도달 | 100점 | 100m마다 자동 적립 |
| 일반 코인 획득 | 10점 | |
| 슈퍼 코인 획득 | 50점 | |
| 장애물 아슬아슬 회피 (Near Miss) | 30점 | 판정: 장애물과 플레이어 거리 < 15px && 충돌 안 함 |
| 연속 코인 5개 콤보 | +20점 보너스 | 5개마다 추가 |
| 500m 무피격 보너스 | 200점 | |
| x2 파워업 활성 | 위 모든 점수 ×2 | |

### 7.2 Near Miss (아슬아슬 회피) 시스템

```
판정 조건:
  1. 장애물의 x가 플레이어 x를 통과 (obstacle.x + obstacle.width < player.x)
  2. 통과 시점에 플레이어와 장애물의 y 거리 < 40px (같은 레인 근접)
  3. 실제 충돌은 발생하지 않음

연출:
  - "NEAR MISS!" 텍스트 tween (easeOutBack, 500ms, fadeUp)
  - 점수 +30 팝업 (골드 색상)
  - 화면 미세 슬로모 효과 (gameSpeed × 0.8, 200ms 후 복원 — tween으로)
```

### 7.3 최고 점수 처리 순서 (B4 교훈 반영)

```javascript
// ⚠️ 반드시 이 순서 — "판정 먼저, 저장 나중에"
const isNewBest = score > getBest();     // 1. 판정
const isNewDist = distance > getBestDist(); // 1b. 거리도 동일
saveBest(score);                          // 2. 저장
saveBestDist(distance);                   // 2b.
if (isNewBest) showNewBestEffect();       // 3. 연출
```

### 7.4 localStorage 키
- `ndr_bestScore` — 최고 점수
- `ndr_bestDist` — 최고 도달 거리 (미터)
- `ndr_totalCoins` — 누적 코인 수 (통계용)
- `ndr_totalRuns` — 총 플레이 횟수 (통계용)
- 모든 접근은 `try { ... } catch(e) { /* silent */ }` 래핑

---

## 8. 상태 × 시스템 업데이트 매트릭스 ⭐

> **Cycle 2 B1/B2의 근본 원인 해결. Cycle 3에서 효과 검증 완료.** 이 매트릭스는 코드 상단 주석으로도 그대로 복사할 것.

| 게임 상태 | TweenMgr | Scroll | ChunkGen | Player | Obstacles | Coins | Powerups | Particles | Input | Render | SFX |
|-----------|----------|--------|----------|--------|-----------|-------|----------|-----------|-------|--------|-----|
| **LOADING** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | loading화면 | ✗ |
| **TITLE** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | start만 | title화면 | ✗ |
| **PLAYING** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | 이동+점프+pause | game | **✓** |
| **PAUSE** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | resume만 | game+pause오버레이 | ✗ |
| **CONFIRM_MODAL** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | 예/아니오 | game+modal오버레이 | ✗ |
| **GAMEOVER** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** | restart만 | game+결과화면 | ✗ |

> **핵심 규칙:** TweenManager는 **모든 상태에서 항상 업데이트**한다. 어떤 상태에서든 UI 애니메이션(모달 페이드인, 텍스트 스케일 등)이 동작해야 하기 때문이다.

---

## 9. 상태 전환 흐름 (setTimeout 완전 금지)

```
LOADING ──(Canvas 초기화 완료)──→ TITLE

TITLE ──(Enter/Space/클릭/탭)──→ PLAYING (tween: 타이틀 fadeOut 300ms onComplete)

PLAYING ──(라이프 ≤ 0 && !transitioning)──→ GAMEOVER
          (tween: 화면 적색 플래시 0.5초 + 슬로모 감속 onComplete)
          ※ beginTransition(GAMEOVER) 호출 — 가드+우선순위 내장

PLAYING ──(P키/ESC/일시정지 버튼)──→ PAUSE (즉시, tween 불필요)

PAUSE ──(P키/ESC/resume 버튼)──→ PLAYING (즉시)

PAUSE ──(R키)──→ CONFIRM_MODAL
                  (tween: 모달 fadeIn 200ms)

CONFIRM_MODAL ──(예)──→ TITLE (게임 리셋)
CONFIRM_MODAL ──(아니오/ESC)──→ PAUSE (tween: 모달 fadeOut 200ms onComplete)

GAMEOVER ──(R키/재시작 버튼/클릭/탭)──→ TITLE (게임 리셋)
```

> **모든 지연 전환은 tween의 onComplete 콜백으로 처리.** `setTimeout` / `setInterval` 사용 금지.
> **상태 전환 시 `beginTransition()` 헬퍼 필수 사용** (§10.1 참조).

---

## 10. 핵심 시스템 설계

### 10.1 TransitionGuard 패턴 (Cycle 3 B1/B2 교훈 → 신규 표준)

```javascript
// 상태 우선순위 (높을수록 강함)
const STATE_PRIORITY = {
  LOADING: 0, TITLE: 10, PLAYING: 20,
  PAUSE: 30, CONFIRM_MODAL: 35, GAMEOVER: 99
};

let transitioning = false;

function beginTransition(targetState, tweenConfig) {
  // 가드 1: 이미 전환 중이면 무시
  if (transitioning) return false;

  // 가드 2: 현재 상태 우선순위가 목표보다 높거나 같으면 무시
  //         (예: GAMEOVER 상태에서 다른 전환 시도 차단)
  if (STATE_PRIORITY[state] >= STATE_PRIORITY[targetState]) return false;

  // 가드 통과 — 전환 시작
  transitioning = true;

  if (tweenConfig) {
    tw.add(tweenConfig.target, tweenConfig.props, tweenConfig.duration,
           tweenConfig.easing, () => {
      state = targetState;
      transitioning = false;     // 전환 완료
      if (tweenConfig.onComplete) tweenConfig.onComplete();
    });
  } else {
    // 즉시 전환 (PAUSE 등)
    state = targetState;
    transitioning = false;
  }
  return true;
}
```

> **사용 예시:**
> - 게임오버: `beginTransition(GAMEOVER, { target: overlay, props: { alpha: 1 }, duration: 500, easing: 'easeOutQuad' })`
> - 일시정지: `beginTransition(PAUSE)` (즉시 전환)
> - GAMEOVER 상태에서 다른 전환 시도 → `STATE_PRIORITY[GAMEOVER]=99`이므로 자동 차단

### 10.2 TweenManager (Cycle 2~3 인프라 계승)

```javascript
// API
tw.add(target, { alpha: 1, scale: 1.2 }, 500, 'easeOutBack', () => { ... });
tw.update(dt);    // 매 프레임 호출 (모든 상태에서!)
tw.cancelAll();   // deferred 패턴으로 안전하게 취소

// 이징 함수 5종 완전 구현
const EASING = {
  linear:       t => t,
  easeOutQuad:  t => t * (2 - t),
  easeInQuad:   t => t * t,
  easeOutBack:  t => 1 + (--t) * t * (2.70158 * t + 1.70158),
  easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 :
    Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1
};
```

**동시 호출 보호 (Cycle 2 교훈):**
- `update()` 중 `cancelAll()` 호출 시 → `_pendingCancel = true` 플래그 → update 완료 후 실제 제거 (deferred 패턴)
- 역순 순회로 splice 안전성 보장

### 10.3 ObjectPool (Cycle 2~3 인프라 계승)

```javascript
// 풀링 대상 및 크기
const pools = {
  obstacle:   new ObjectPool(() => new Obstacle(), 20),
  coin:       new ObjectPool(() => new Coin(), 30),
  powerup:    new ObjectPool(() => new Powerup(), 5),
  particle:   new ObjectPool(() => new Particle(), 60)
};

// acquire/release + 역순 순회 패턴
for (let i = activeList.length - 1; i >= 0; i--) {
  if (activeList[i].dead || activeList[i].x < -50) {
    pools[type].release(activeList.splice(i, 1)[0]);
  }
}
```

### 10.4 ChunkGenerator — 절차적 레벨 생성

```javascript
const CHUNK_WIDTH = 400;   // 청크 너비 (px)
let nextChunkX = 600;      // 다음 청크 생성 위치

function generateChunk() {
  const difficulty = Math.min(10, Math.floor(distance / 500));

  // 1. 패턴 선택 (가중 랜덤)
  const pattern = weightedRandom(getPatterns(difficulty));

  // 2. 장애물 배치 — 반드시 안전 레인 1개 이상 보장
  const obstacles = pattern.generate(nextChunkX, difficulty);
  const safeLanes = getSafeLanes(obstacles);
  if (safeLanes.length === 0) {
    // 안전 규칙 위반 → 가장 약한 장애물 1개 제거
    obstacles.pop();
  }

  // 3. 코인 배치 — 안전 레인에 유도
  const coins = generateCoins(nextChunkX, safeLanes, difficulty);

  // 4. 파워업 배치 — 간격 조건 충족 시
  if (timeSinceLastPowerup > minPowerupInterval) {
    if (Math.random() < 0.3) {
      spawnPowerup(nextChunkX + CHUNK_WIDTH / 2, randomLane(safeLanes));
    }
  }

  // 5. 다음 청크 위치 갱신
  nextChunkX += CHUNK_WIDTH;
}
```

### 10.5 Web Audio API — 절차적 효과음 (Cycle 3 성공 패턴 확장)

```javascript
// AudioContext 초기화 (첫 사용자 인터랙션 시)
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { /* 사운드 비활성 — 게임플레이 영향 없음 */ }
  }
}

// 효과음 5종
function sfxJump()     { /* 상승 스윕: 300→600Hz, 150ms, sine */ }
function sfxCoin()     { /* 고음 팝: 1200Hz→800Hz, 80ms, triangle */ }
function sfxHit()      { /* 저음 임팩트: 150Hz, 200ms, sawtooth + 빠른 감쇠 */ }
function sfxPowerup()  { /* 화음 아르페지오: 440→660→880Hz, 300ms, sine 3연타 */ }
function sfxGameover() { /* 하강음: 400→100Hz, 600ms, sawtooth */ }
```

- 모든 SFX 호출은 `try-catch` 래핑 — 오디오 실패 시 무시
- PLAYING 상태에서만 SFX 재생 (매트릭스 참조)
- 볼륨: 0.25 (기본)

### 10.6 game.destroy() 패턴 (Cycle 3 표준 계승)

```javascript
const registeredListeners = [];

function listen(el, evt, fn, opts) {
  el.addEventListener(evt, fn, opts);
  registeredListeners.push([el, evt, fn, opts]);
}

function destroy() {
  // 1. 게임 루프 중단
  cancelAnimationFrame(rafId);

  // 2. 이벤트 리스너 제거
  registeredListeners.forEach(([el, evt, fn, opts]) =>
    el.removeEventListener(evt, fn, opts));
  registeredListeners.length = 0;

  // 3. ObjectPool 전체 해제
  Object.values(pools).forEach(p => p.clear());

  // 4. TweenManager 전체 취소
  tw.cancelAll();

  // 5. AudioContext 닫기
  if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
}
```

---

## 11. UI 레이아웃 상세

### 11.1 상단 HUD (y: 0~40px)

```
┌──────────────────────────────────────────────────────┐
│  🏃 1,250m     ⭐ 8,430     ❤️❤️❤️     🧲 5.2s      │
│                              [⏸]                     │
└──────────────────────────────────────────────────────┘
```

- 거리: `#00E5FF` (시안), `18px bold`, 100m 단위에서 tween 스케일 펄스
- 점수: `#FFD740` (골드), `18px bold`, 변동 시 잠시 밝아짐
- 라이프: `#FF1744` (레드), 하트 아이콘 3개, 감소 시 tween 흔들림(shake) + 빨강 비네트 플래시
- 파워업 타이머: 활성 파워업 아이콘 + 남은 초 (해당 파워업 색상)
- 일시정지 버튼: 우상단 20×20px (마우스/터치 모드에서만 표시)
- x2 활성 시: 점수 옆에 `"×2"` 텍스트 (앰버, 깜빡임 tween)

### 11.2 타이틀 화면

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│            ╔═══════════════════════╗                  │
│            ║  네온 대시 러너       ║                  │
│            ║  NEON DASH RUNNER     ║                  │
│            ╚═══════════════════════╝                  │
│                                                      │
│         BEST: 12,450pts  |  2,350m                   │
│                                                      │
│         [SPACE / 탭으로 시작]                         │
│                                                      │
│    ↑↓: 레인 이동  SPACE: 점프  P: 일시정지           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- 타이틀 텍스트: tween 글로우 펄스 (alpha 0.7 → 1.0 반복)
- 배경: 느린 속도로 스크롤되는 도시 실루엣 (분위기 연출)
- 최고 기록: 0이면 표시 안 함

### 11.3 게임오버 화면

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              ╔══════════════════╗                     │
│              ║   GAME OVER     ║                     │
│              ╚══════════════════╝                     │
│                                                      │
│           거리: 1,250m                               │
│           점수: 8,430                                │
│           코인: 47개                                 │
│                                                      │
│           🏆 NEW BEST! (이전: 7,200)                 │
│                                                      │
│          [R키 / 탭으로 재시작]                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- 결과 텍스트: tween 순차 fadeIn (거리 → 점수 → 코인, 각 200ms 딜레이)
- NEW BEST: easeOutElastic 스케일 연출 (0 → 1.2 → 1.0)
- 배경: 마지막 게임 화면 위에 반투명 검정 오버레이 (`#000000` 70% alpha)

---

## 12. 사이드바 메타데이터 (게임 페이지용)

```yaml
game:
  title: "네온 대시 러너"
  description: "네온 사이버펑크 도시를 질주하라! 3레인을 전환하고 점프로 장애물을 피하며 코인을 모으는 무한 러너. 절차적 생성으로 매 게임이 새롭고, 속도가 올라갈수록 심장이 뛴다."
  genre: ["arcade", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "↑↓ / W·S: 레인 전환"
    - "Space: 점프"
    - "P / ESC: 일시정지"
    - "터치: 스와이프(레인) / 탭(점프)"
    - "마우스: 영역 클릭(레인/점프)"
  tags:
    - "#무한러너"
    - "#네온"
    - "#사이버펑크"
    - "#캐주얼"
    - "#아케이드"
    - "#절차적생성"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

---

## 13. 구현 체크리스트

### 13.1 핵심 기능 (필수)
- [ ] 3레인 시스템 + 레인 전환 tween 애니메이션
- [ ] 점프 물리 (포물선 + 레인 전환 동시 가능)
- [ ] 장애물 4종 (배리어, 스파이크, 레이저, 드론)
- [ ] 코인 2종 (일반, 슈퍼) + 연속 코인 줄
- [ ] 파워업 3종 (자석, 쉴드, x2)
- [ ] 절차적 레벨 생성 (청크 기반, 안전 레인 보장)
- [ ] 속도 곡선 (거리 기반 점진 증가, 캡 적용)
- [ ] 충돌 판정 (관대한 히트박스 — 시각×0.7)
- [ ] Near Miss 시스템
- [ ] 점수 시스템 + localStorage 최고 기록
- [ ] 6상태 게임 상태 머신
- [ ] TweenManager (이징 5종 완전 구현)
- [ ] ObjectPool (장애물, 코인, 파워업, 파티클)
- [ ] TransitionGuard 패턴 (가드 플래그 + 상태 우선순위)
- [ ] Canvas 기반 모달 (confirm 대체)
- [ ] 상태 × 시스템 매트릭스 코드 주석 포함
- [ ] game.destroy() + 리스너 cleanup
- [ ] 키보드/마우스/터치 입력 자동 감지 및 분기 동작

### 13.2 시각/연출 (필수)
- [ ] 네온 사이버펑크 비주얼 (순수 Canvas 드로잉)
- [ ] 패럴랙스 3레이어 배경 (원경/중경/근경)
- [ ] offscreen canvas 배경 캐시
- [ ] 플레이어 글로우 + 속도선 렌더링
- [ ] 코인 획득 이펙트 (scaleUp + fadeOut + 점수 팝업)
- [ ] 충돌 이펙트 (빨강 파티클 방사)
- [ ] 쉴드 파괴 이펙트 (녹색 파편 + 충격파)
- [ ] 파워업 활성화 연출 (자석 글로우, 쉴드 원, x2 텍스트)
- [ ] HUD 피드백 (거리 펄스, 라이프 셰이크, 점수 밝아짐)
- [ ] Near Miss 텍스트 팝업 + 슬로모 효과
- [ ] 게임오버 순차 fadeIn 연출
- [ ] NEW BEST easeOutElastic 연출

### 13.3 사운드 (도전)
- [ ] Web Audio API 절차적 효과음 5종
- [ ] try-catch 래핑 (실패 시 무시)
- [ ] PLAYING 상태에서만 재생
- [ ] 첫 인터랙션에서 AudioContext 초기화

### 13.4 기획서 대조 체크리스트 (코드 리뷰 시) ⭐
- [ ] 모든 상태에서 `tw.update(dt)` 호출 확인 (매트릭스 대조)
- [ ] `setTimeout` / `setInterval` 사용 0건 확인
- [ ] `confirm()` / `alert()` 사용 0건 확인
- [ ] SVG / 외부 이미지 / 외부 폰트 사용 0건 확인
- [ ] 점수 판정→저장 순서 확인 (`isNewBest` 먼저)
- [ ] `beginTransition()` 헬퍼로 모든 상태 전환 처리 확인
- [ ] `transitioning` 가드 플래그가 모든 tween 전환에 적용 확인
- [ ] `STATE_PRIORITY` 맵 정의 및 우선순위 검사 동작 확인
- [ ] destroy() 패턴으로 모든 리스너 정리 확인 (`registeredListeners` 사용)
- [ ] 이징 함수 5종 모두 구현 확인
- [ ] **선언된 모든 변수의 갱신/사용처 확인** (유령 변수 방지 — C2~C3 반복 이슈)
  - `inputMode`: §5.3에 명시된 4개 사용처 모두 구현 확인
  - `nearMissCount`: Near Miss 시스템에서 증가·리셋 확인
  - `timeSinceLastPowerup`: 청크 생성에서 갱신·비교 확인
  - `consecutiveSafeDist`: 동적 밸런스 보정에서 갱신·리셋 확인
- [ ] 관대한 히트박스 적용 확인 (장애물 ×0.7, 코인 ×1.3)
- [ ] 안전 레인 보장 규칙 동작 확인 (패턴당 최소 1레인)
- [ ] Canvas 기반 모달만 사용 확인
- [ ] 금지 패턴 grep 검사 통과:
  ```bash
  grep -n "setTimeout\|setInterval\|confirm(\|alert(\|eval(\|feGaussianBlur" index.html
  # 결과가 0건이어야 PASS
  ```

---

## 14. 예상 코드 규모

```
예상 줄 수: ~900~1,100줄

구조 분배:
  - 상수/설정:         ~70줄   (색상, 속도 공식, 장애물 스탯, 패턴 정의)
  - TweenManager:      ~60줄   (Cycle 3 계승, easeOutElastic 포함)
  - ObjectPool:        ~30줄   (Cycle 3 계승)
  - TransitionGuard:   ~25줄   (신규 — beginTransition + STATE_PRIORITY)
  - ScrollManager:     ~40줄   (속도 곡선 + 패럴랙스)
  - ChunkGenerator:    ~120줄  (절차적 생성 + 패턴 + 안전 규칙)
  - Player:            ~80줄   (레인 전환 + 점프 물리 + 자석)
  - Obstacles:         ~60줄   (4종 이동 + 드론 왕복)
  - Coins/Powerups:    ~60줄   (획득 + 효과 + 타이머)
  - 충돌 판정:         ~50줄   (AABB + Near Miss)
  - 입력 처리:         ~80줄   (키보드/마우스/터치 + 모드 분기)
  - UI/HUD:            ~100줄  (상단 HUD, 타이틀, 게임오버)
  - 렌더링:            ~130줄  (3레이어 배경, 엔티티, 파티클)
  - 상태 머신/루프:    ~40줄   (6상태 + 메인 루프)
  - Web Audio SFX:     ~45줄   (절차적 효과음 5종)
  - destroy/init:      ~30줄   (라이프사이클 관리)
```
