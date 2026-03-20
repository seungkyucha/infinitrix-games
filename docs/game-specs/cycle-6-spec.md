---
game-id: mini-golf-adventure
title: 미니 골프 어드벤처
genre: puzzle, casual
difficulty: easy
---

# 미니 골프 어드벤처 (Mini Golf Adventure) — 상세 기획서

> **Cycle:** 6
> **작성일:** 2026-03-20
> **기획:** Claude (Game Designer)
> **근거:** `docs/analytics/cycle-6-report.md` 분석 보고서 기반 — 1순위 추천 채택

---

## 0. 이전 사이클 피드백 반영

> Cycle 5 "비트 러시" 포스트모템에서 지적된 문제점과 다음 사이클 제안을 **명시적으로** 반영합니다.

### 0-1. Cycle 5 문제 해결 매핑

| Cycle 5 문제 / 제안 | 심각도 | Cycle 6 반영 방법 |
|---------------------|--------|-------------------|
| **SVG 로딩 코드 잔존 (ASSET_MAP, SPRITES, preloadAssets)** — 자동 검증 스크립트 도입 후에도 초기 코드에 잔존 패턴 발견 | MAJOR | → **§13.5 자동 검증 스크립트를 코딩 초기부터 수시 실행** 규칙 명시. 물리 게임은 원/선/사각형 코드 드로잉만 사용하므로 SVG 필요성 자체가 없음. 금지 패턴 검증을 코딩 시작 전·중·후 3단계로 확장 |
| **assets/ 디렉토리 SVG 8개 + manifest.json 잔존** — 코드 미참조이나 디스크 위생 문제 | MINOR | → 이번 게임은 assets/ 디렉토리를 **생성하지 않음**. 모든 시각 요소는 Canvas API 코드 드로잉. §4.5 금지 목록에 "assets/ 디렉토리 생성 금지" 추가 |
| **BPM tween 이중 등록** — 단일 변수에 tween 갱신과 직접 대입 동시 존재 | MINOR | → **§10.5 단일 갱신 경로 원칙**: 물리 값(위치, 속도, 각도, 마찰)은 물리 루프 단일 경로에서만 갱신. tween은 UI/시각 전환에만 사용하고, 물리 변수에 tween을 걸지 않음 |
| **절차적 음악 청감 품질 한계** — Am 마이너 키 고정, 다양성 부족 | N/A | → 미니 골프는 음악 기반이 아닌 물리 기반. Web Audio API는 효과음(타격, 반사, 홀인원)에만 사용. 짧고 명확한 효과음으로 청각 피드백 집중 |
| **모바일 터치 레이턴시 보정 미검증** | MINOR | → 드래그 에이밍은 리듬 판정보다 레이턴시 민감도가 낮음. 단, 터치 좌표 보정(getBoundingClientRect 기반)은 정확하게 구현. §3에서 터치 좌표 변환 공식 명시 |
| **물리 기반 장르 도전** | 제안 | → **미니 골프 어드벤처 채택!** 2D 벡터 물리(중력 미사용, 반사 + 마찰)를 Canvas + TweenManager + ObjectPool 인프라 위에 구현 |
| **검증 스크립트 코딩 중 수시 실행** | 제안 | → **§13.5에서 3단계 검증 타이밍 명시**: 코딩 시작 전(템플릿 점검) → 코딩 중(50% 완성 시점) → 코드 완성 후(최종 검증) |

### 0-2. platform-wisdom.md 검증된 패턴 계승

| 성공 패턴 | 적용 |
|-----------|------|
| 단일 HTML + Canvas + Vanilla JS | 동일 아키텍처 유지 |
| 게임 상태 머신 6상태 | LOADING → TITLE → PLAYING → LEVEL_CLEAR → PAUSE → CONFIRM_MODAL → GAMEOVER (7상태로 확장) |
| DPR 대응 (Canvas 내부 해상도 ≠ CSS) | 동일 적용 |
| localStorage try-catch | 동일 적용 (레벨별 최소 타수 저장) |
| TweenManager + clearImmediate() | Cycle 5 안정 버전 그대로 계승 |
| ObjectPool | 궤적 프리뷰 점, 파티클, 반사 이펙트에 적용 |
| 기획서에 HEX/수식 명시 | 모든 수치/공식/색상 코드 명시 (구현 충실도 목표 95%) |
| Canvas 기반 모달 (confirm/alert 금지) | 모든 확인 UI를 Canvas 모달로 구현 |
| TransitionGuard + enterState() | STATE_PRIORITY 맵 + beginTransition() + enterState() 그대로 계승 |
| Web Audio API 효과음 | 타격음, 벽 반사음, 홀인원 사운드 등 절차적 생성 |
| destroy() + listen() 패턴 | registeredListeners + listen() + destroy() 그대로 계승 |
| 상태×시스템 매트릭스 | §8에서 기획서 정의 + 코드 주석 이중 포함 |
| setTimeout 완전 금지 | 모든 지연 전환은 tween onComplete |
| 판정 먼저, 저장 나중에 | §7 점수 시스템에서 순서 고정 |
| 유령 변수 방지 체크리스트 | §13.4에서 모든 변수의 갱신/사용처 명시 |
| 관대한 판정 | 홀 입구 판정 반경을 시각적 크기보다 크게 설정 (§5.7) |

### 0-3. 누적 기술 개선 반영

| 미해결 항목 | 출처 | Cycle 6 대응 |
|------------|------|-------------|
| SVG 로딩 코드 잔존 (코딩 중 점검 부재) | Cycle 5 아쉬운 점 | → 3단계 자동 검증 (§13.5) |
| assets/ 디렉토리 파일 잔존 | Cycle 5 아쉬운 점 | → assets/ 디렉토리 미생성 원칙 (§4.5) |
| 단일 변수 이중 갱신 경로 | Cycle 5 B2 | → 물리 변수는 물리 루프 단일 경로만 허용 (§10.5) |

---

## 1. 게임 개요 및 핵심 재미 요소

### 컨셉
마우스/터치 드래그로 공의 발사 방향과 힘을 조절하여, 최소 타수로 홀에 공을 넣는 **탑다운 2D 미니 골프** 게임입니다. 10개 레벨을 순서대로 클리어하며, 레벨마다 벽 반사, 움직이는 장애물, 모래 구간(마찰 증가), 워프 포탈 등 새로운 요소가 등장합니다. 외부 물리 라이브러리 없이 **기본 2D 벡터 연산(반사, 마찰, 감속)**만으로 공의 움직임을 구현합니다.

### 핵심 재미 요소
1. **궤적 예측의 전략적 쾌감** — 드래그 시 점선으로 예상 궤적(1차 반사까지)을 표시. "이 각도로 치면 벽에 반사되어 홀에 들어간다"를 계획하는 당구/골프의 머리싸움
2. **물리 피드백의 직관성** — 공이 벽에 부딪히면 법선 반사로 튕기고, 모래 위에서는 느려지는 등 현실 물리를 직관적으로 체감. 드래그 힘 조절로 섬세한 컨트롤
3. **별 3개 시스템의 리플레이** — 각 레벨마다 Par(기준 타수) 대비 성적으로 ★1~3개 부여. "이 레벨 별 3개 받으려면 어떻게 쳐야 하지?" → 반복 도전 유도
4. **점진적 장애물 도입** — 레벨 1은 빈 공간 + 홀만, 레벨 10은 움직이는 벽 + 모래 + 포탈 조합. 매 레벨 새 요소를 하나씩 소개하여 학습 곡선 완만
5. **홀인원의 극적 보상** — 1타 만에 홀에 넣으면 화려한 파티클 폭발 + 특별 사운드 + 보너스 점수. 드문 성공에 대한 강력한 시각·청각 보상

### 장르 다양화 기여
- **플랫폼 최초의 물리 기반 게임** — 기존 5개 게임(퍼즐/슈팅/전략/러너/리듬)에 없는 물리 메커닉
- **puzzle + casual 듀얼 태그** — arcade 과포화(3/5) 해소, puzzle은 C1 이후 2번째
- **난이도 easy** — 기존 medium 4개 편중 해소. 레벨 기반 진행으로 초보자도 1~3레벨은 쉽게 클리어
- 시장 트렌드(물리 퍼즐 🔥🔥🔥) + Cycle 5 포스트모템 제안과 완벽 일치

---

## 2. 게임 규칙 및 목표

### 2-1. 기본 규칙
- 플레이어는 **공(Ball)**을 드래그하여 방향과 힘을 결정하고, 놓으면 발사
- 공이 **홀(Hole)**에 도달하면 레벨 클리어
- 공이 완전히 정지하면(속도 < 0.3px/frame) 다음 샷 가능
- 레벨별 **Par(기준 타수)**가 있으며, 타수 대비 별 1~3개 부여
- 10개 레벨을 모두 클리어하면 게임 완료, 총 점수 + 총 별 표시

### 2-2. 승리/패배 조건
- **레벨 클리어**: 공이 홀 판정 원(반경 20px, 시각 반경 16px) 안에 들어가고 속도 < 2.0px/frame
- **레벨 실패 없음**: 타수 제한 없이 계속 칠 수 있음 (별 개수만 감소). 단, 최대 10타를 초과하면 "포기하고 다음 레벨로" 옵션 표시
- **게임 완료**: 10개 레벨 모두 클리어 시 결과 화면

### 2-3. 물리 규칙
- **마찰 감속**: 매 프레임 `velocity *= friction` (기본 마찰 = 0.985)
- **벽 반사**: 법선 벡터 기반 완전 반사, 반사 시 `speed *= 0.85` (에너지 손실)
- **모래 구간**: 마찰 = 0.95 (기본 0.985 대비 3.5배 빠른 감속)
- **물 구간**: 공이 진입하면 +1타 페널티 후 이전 위치로 복귀
- **포탈**: 입구에 진입하면 출구에서 같은 속도로 사출
- **최소 속도 임계치**: `speed < 0.3`이면 공 정지 처리

---

## 3. 조작 방법

### 3-1. 마우스 조작
| 동작 | 입력 | 설명 |
|------|------|------|
| 에이밍 | 공 위에서 마우스 다운 + 드래그 | 드래그 반대 방향으로 발사 방향 표시 (점선 궤적) |
| 힘 조절 | 드래그 거리 | `power = min(dragDist × 0.15, MAX_POWER)`, MAX_POWER = 15 |
| 발사 | 마우스 업 | 공을 계산된 방향 + 힘으로 발사 |
| 카메라 이동 | 없음 | 전체 레벨이 화면에 맞춰 자동 스케일링 |

### 3-2. 키보드 조작
| 키 | 동작 |
|----|------|
| `R` | 현재 레벨 재시작 |
| `ESC` | 일시 정지 / 메뉴 |
| `Space` | 현재 샷 스킵 (공이 굴러가는 중 빠른 정지 — 디버그용 아님, 속도 4배 가속) |

### 3-3. 터치 조작
| 동작 | 입력 | 설명 |
|------|------|------|
| 에이밍 | 공 터치 + 드래그 | 마우스와 동일. `touch.clientX/Y` → `getBoundingClientRect()` 기반 Canvas 좌표 변환 |
| 힘 조절 | 드래그 거리 | 마우스와 동일 공식 |
| 발사 | 터치 엔드 | 마우스 업과 동일 |

### 3-4. 터치 좌표 변환 공식
```
canvasX = (touch.clientX - rect.left) / rect.width * CANVAS_W
canvasY = (touch.clientY - rect.top) / rect.height * CANVAS_H
```
※ DPR 적용 시: Canvas 내부 해상도는 `CANVAS_W × DPR`이지만, 좌표 계산은 논리 해상도(`CANVAS_W`) 기준

### 3-5. 입력 모드 분기
```
let inputMode = 'mouse'; // 'mouse' | 'touch'
// touchstart 발생 시 → inputMode = 'touch', 마우스 이벤트 무시
// mousemove 발생 시 (touchstart 이력 없으면) → inputMode = 'mouse'
```
**⚠️ platform-wisdom [Cycle 2]**: inputMode 변수는 반드시 실제 분기에 사용할 것. 선언만 하고 미사용 금지.

---

## 4. 시각적 스타일 가이드

### 4-1. 색상 팔레트

| 역할 | HEX | 설명 |
|------|-----|------|
| 배경 (잔디) | `#1A4D2E` | 어두운 초록 — 골프장 느낌 |
| 벽 | `#8B9DAF` | 부드러운 청회색 — 경계 명확 |
| 벽 하이라이트 | `#C8D6E5` | 밝은 회색 — 벽 위쪽 3D 느낌 |
| 공 | `#FFFFFF` | 순백 — 높은 대비로 가시성 확보 |
| 공 그림자 | `rgba(0,0,0,0.3)` | 공 아래 작은 원으로 높이감 표현 |
| 홀 | `#0A0A0A` | 거의 검정 — 구멍 느낌 |
| 홀 테두리 | `#4A4A4A` | 짙은 회색 — 홀 가장자리 입체감 |
| 궤적 점선 | `rgba(255,255,255,0.6)` | 반투명 흰색 — 에이밍 가이드 |
| 힘 게이지 (약) | `#2ECC71` | 초록 |
| 힘 게이지 (중) | `#F39C12` | 주황 |
| 힘 게이지 (강) | `#E74C3C` | 빨강 |
| 모래 구간 | `#D4A574` | 연한 갈색 — 사막/모래 |
| 물 구간 | `#3498DB` | 파란색 — 물 위험 지역 |
| 포탈 A | `#9B59B6` | 보라 |
| 포탈 B | `#E67E22` | 주황 |
| 별 (획득) | `#F1C40F` | 금색 |
| 별 (미획득) | `#34495E` | 어두운 회색 |
| UI 텍스트 | `#ECF0F1` | 밝은 회색 |
| UI 강조 | `#1ABC9C` | 민트 — InfiniTriX 브랜드 톤 |
| 파 텍스트 | `#95A5A6` | 중간 회색 |

### 4-2. 오브젝트 형태

| 오브젝트 | 렌더링 | 크기 (논리 px) |
|----------|--------|---------------|
| 공 | `arc()` 원 + radialGradient (흰→연회색) + 그림자 원 | 반경 8px |
| 홀 | `arc()` 원 (2단: 외곽 #4A4A4A r=18, 내부 #0A0A0A r=14) + 깃발 폴(선 + 삼각형) | 판정 반경 20px |
| 벽 | `fillRect()` + 위쪽 3px 하이라이트 (3D 느낌) | 가변 (10px 두께 기본) |
| 움직이는 벽 | 벽과 동일 + `rgba(255,255,100,0.3)` 글로우 | 가변 |
| 모래 구간 | `fillRect()` + 점 패턴 (3×3px 격자로 어두운 점) | 가변 |
| 물 구간 | `fillRect()` + 물결 라인(sin 파동, 매 프레임 위상 이동) | 가변 |
| 포탈 | `arc()` 원 + 회전 파티클 4개 (매 프레임 각도 += 0.05) | 반경 14px |
| 궤적 프리뷰 | 5px 간격 원 (r=2), alpha 거리에 따라 감소 | 최대 20개 점 |
| 깃발 | `lineTo()` 수직선 (30px) + `fillRect()` 삼각형 (빨강 #E74C3C) | 위 참조 |
| 파워 바 | 공 위 40×6px 바, 힘 비율에 따라 초록→주황→빨강 그라데이션 | 40×6px |

### 4-3. 배경 처리
- **잔디 텍스처**: offscreen canvas 캐시. `#1A4D2E` 단색 + 밝은 점 (`#1F5C36`) 을 무작위 200개 찍어 잔디 느낌
- **레벨 경계**: 전체를 `#0F3D20` 어두운 테두리 8px로 감쌈
- 레벨 번호 + Par 표시: 왼쪽 상단, 폰트 `"16px monospace"`, `#ECF0F1`

### 4-4. 이펙트

| 이펙트 | 트리거 | 구현 |
|--------|--------|------|
| 벽 반사 스파크 | 공이 벽에 반사 | 충돌점에서 파티클 6개 방사 (수명 0.3초, 색상 #C8D6E5) |
| 홀인 파티클 | 공이 홀에 진입 | 홀 중심에서 파티클 20개 원형 방사 (수명 0.8초, 별 색상 #F1C40F) |
| 홀인원 특별 | 1타 만에 홀인 | 홀인 파티클 × 3배 밀도 + 화면 테두리 금색 플래시 tween (0.5초) |
| 물 스플래시 | 공이 물 구간 진입 | 물 위치에서 파란 파티클 10개 위로 방사 + 공 페이드아웃 tween |
| 포탈 이동 | 공이 포탈 진입 | 입구 축소 tween (0.2초) → 출구 확대 tween (0.2초) |
| 레벨 전환 | 레벨 클리어 | 화면 전체 페이드 아웃/인 tween (0.4초씩) |
| 별 획득 | 레벨 클리어 시 별 표시 | 별 1~3개 순차적으로 scale 0→1.2→1.0 tween + 회전 |

### 4-5. 금지 목록 (자동 검증 대상)

| # | 금지 패턴 | 이유 |
|---|-----------|------|
| 1 | `<svg`, `.svg`, `SVG` | 외부 SVG 에셋 금지 (Cycle 2~5 반복 재발 방지) |
| 2 | `new Image()`, `img.src` | 외부 이미지 로딩 금지 |
| 3 | `ASSET_MAP`, `SPRITES`, `preloadAssets` | SVG 프리로드 잔존 코드 금지 (Cycle 5 잔존 재발 방지) |
| 4 | `feGaussianBlur`, `filter:` | SVG 필터 금지 |
| 5 | `setTimeout` (상태 전환 맥락) | tween onComplete로 대체 |
| 6 | `confirm(`, `alert(` | iframe 호환 불가, Canvas 모달로 대체 |
| 7 | `Google Fonts`, `@import url` | 외부 폰트 로딩 금지 |
| 8 | `assets/` 디렉토리 생성 | 모든 시각 요소 Canvas 코드 드로잉 |

---

## 5. 핵심 게임 루프

### 5-1. 메인 루프 (requestAnimationFrame, 60fps 목표)

```
function gameLoop(timestamp) {
  const dt = min((timestamp - lastTime) / 1000, 0.05); // 최대 50ms cap
  lastTime = timestamp;

  switch (state) {
    case LOADING:  updateLoading(dt);  break;
    case TITLE:    updateTitle(dt);    break;
    case PLAYING:  updatePlaying(dt);  break;
    case LEVEL_CLEAR: updateLevelClear(dt); break;
    case PAUSE:    updatePause(dt);    break;
    case CONFIRM_MODAL: updateConfirmModal(dt); break;
    case GAMEOVER: updateGameOver(dt); break;
  }

  render(state);
  requestAnimationFrame(gameLoop);
}
```

### 5-2. updatePlaying(dt) 세부 흐름

```
1. tw.update(dt)                    // TweenManager 업데이트
2. if (ball.moving) {
     a. ball.vx *= friction          // 마찰 감속
        ball.vy *= friction
     b. checkWallCollisions()        // 벽 반사 (법선 벡터)
     c. checkZoneEffects()           // 모래/물/포탈 특수 구간
     d. ball.x += ball.vx            // 위치 갱신
        ball.y += ball.vy
     e. if (speed < 0.3) stopBall()  // 정지 판정
     f. checkHoleCollision()         // 홀 진입 판정
   }
3. updateMovingWalls(dt)             // 움직이는 벽 위치 갱신
4. updatePortalAnim(dt)              // 포탈 회전 애니메이션
5. updateWaterAnim(dt)               // 물결 위상 이동
6. updateParticles(dt)               // 파티클 수명 관리
```

### 5-3. 물리 연산 핵심 함수

#### 벽 반사 (법선 반사)
```
// wall: {x1, y1, x2, y2}
// 벽 법선 벡터 N = normalize(perpendicular(wall direction))
// 반사: V' = V - 2 * dot(V, N) * N
// 에너지 손실: V' *= 0.85
function reflectBall(ball, wall) {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const len = Math.sqrt(dx*dx + dy*dy);
  const nx = -dy / len;  // 법선 x
  const ny = dx / len;   // 법선 y
  const dot = ball.vx * nx + ball.vy * ny;
  ball.vx = (ball.vx - 2 * dot * nx) * 0.85;
  ball.vy = (ball.vy - 2 * dot * ny) * 0.85;
}
```

#### 공-벽 충돌 판정 (점-선분 거리)
```
// 공 중심에서 벽 선분까지의 최소 거리 < ball.radius 이면 충돌
function pointToSegmentDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = clamp(((px-x1)*dx + (py-y1)*dy) / (dx*dx + dy*dy), 0, 1);
  const cx = x1 + t*dx, cy = y1 + t*dy;
  return Math.sqrt((px-cx)**2 + (py-cy)**2);
}
```

#### 홀 진입 판정
```
// 관대한 판정: 판정 반경 20px > 시각 반경 16px
const dist = Math.sqrt((ball.x-hole.x)**2 + (ball.y-hole.y)**2);
const speed = Math.sqrt(ball.vx**2 + ball.vy**2);
if (dist < 20 && speed < 2.0) {
  // 홀인! → 레벨 클리어 처리
}
// 빠른 속도로 홀 위를 지나가면 진입하지 않음 (현실적)
```

### 5-4. 에이밍 시스템

```
// 마우스다운 시작점: aimStart = {x, y}
// 마우스무브 현재점: aimCurrent = {x, y}
// 발사 벡터: direction = normalize(aimStart - aimCurrent)
// 발사 힘: power = min(dist(aimStart, aimCurrent) * 0.15, 15)

// 궤적 프리뷰: 공 위치에서 direction * power 방향으로 시뮬레이션
// 최대 1회 반사까지 점선 표시 (무한 반사 표시는 시각적 혼란)
function drawTrajectory(ctx) {
  let simX = ball.x, simY = ball.y;
  let simVx = direction.x * power;
  let simVy = direction.y * power;
  let bounced = false;

  for (let i = 0; i < 20; i++) {
    simX += simVx * 3;  // 3프레임 간격으로 점 배치
    simY += simVy * 3;
    simVx *= 0.985;      // 마찰 적용
    simVy *= 0.985;

    // 벽 충돌 체크 → 반사 시뮬레이션 (1회만)
    if (!bounced && checkSimWallHit(simX, simY)) {
      reflectSim(); bounced = true;
    }

    ctx.globalAlpha = 0.6 - i * 0.025;
    ctx.beginPath();
    ctx.arc(simX, simY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

### 5-5. 파워 바 시각화
```
// 공 위 10px 위치에 40×6px 바
// powerRatio = power / MAX_POWER (0~1)
// 색상: ratio < 0.33 → #2ECC71, ratio < 0.66 → #F39C12, else → #E74C3C
// 바 너비 = 40 * powerRatio
```

### 5-6. 공 정지 후 처리
```
function stopBall() {
  ball.vx = 0;
  ball.vy = 0;
  ball.moving = false;
  ball.lastStopX = ball.x;  // 물 페널티 복귀용
  ball.lastStopY = ball.y;
  canShoot = true;  // 다음 샷 허용
}
```

### 5-7. 관대한 홀 판정
- 홀 시각 반경: 16px (그려지는 크기)
- 홀 판정 반경: **20px** (시각보다 4px 넓음)
- 속도 임계치: `speed < 2.0`이어야 홀 진입 인정 (너무 빠르면 통과)
- **[platform-wisdom ✅]**: 관대한 판정으로 "아슬아슬 들어간" 쾌감 제공

---

## 6. 난이도 시스템

### 6-1. 레벨 구성 (10레벨)

| 레벨 | Par | 소개 요소 | 난이도 감각 |
|------|-----|-----------|------------|
| 1 | 2 | 빈 공간, 공→홀 직선 거리 짧음 | 튜토리얼: 드래그 조작 학습 |
| 2 | 2 | L자 벽 1개 (1회 반사 필요) | 반사 개념 도입 |
| 3 | 3 | 벽 2개 + 공과 홀 사이에 장애물 | 반사 경로 계획 |
| 4 | 3 | 모래 구간 도입 (중앙 모래 패치) | 힘 조절 학습 |
| 5 | 3 | 물 구간 도입 (좁은 통로 옆 물) | 정밀 에이밍 |
| 6 | 4 | 움직이는 벽 1개 (좌우 왕복) | 타이밍 도입 |
| 7 | 4 | 포탈 쌍 1개 (입구→출구 워프) | 공간 이동 개념 |
| 8 | 4 | 움직이는 벽 2개 + 모래 조합 | 복합 장애물 |
| 9 | 5 | 포탈 + 움직이는 벽 + 물 | 고난도 복합 |
| 10 | 5 | 모든 요소 총출동, 최소 경로가 2회 반사 | 최종 챌린지 |

### 6-2. 레벨 데이터 구조
```javascript
const LEVELS = [
  {
    id: 1,
    par: 2,
    ball: { x: 80, y: 240 },
    hole: { x: 400, y: 240 },
    walls: [
      // 외곽 벽은 자동 생성 (0,0)-(480,480)
    ],
    movingWalls: [],
    sand: [],
    water: [],
    portals: [],
    hint: "드래그하여 공을 홀에 넣으세요!"  // 레벨 1만 힌트 표시
  },
  // ... 레벨 2~10 (§11에서 전체 좌표 정의)
];
```

### 6-3. 레벨 영역
- 논리 해상도: **480 × 480px** (정사각형 — 골프 코스 탑다운 뷰)
- UI 영역: 캔버스 상단 60px (레벨 번호, Par, 타수, 별 표시)
- 실제 게임 영역: 480 × 420px (y: 60~480)
- Canvas 전체: **480 × 540px** (게임 480×420 + 상단 UI 60 + 하단 UI 60)

### 6-4. 별 시스템

| 조건 | 별 |
|------|---|
| 타수 ≤ Par - 1 | ★★★ (3개) |
| 타수 = Par | ★★☆ (2개) |
| 타수 = Par + 1 | ★☆☆ (1개) |
| 타수 ≥ Par + 2 | ☆☆☆ (0개, 클리어는 됨) |

---

## 7. 점수 시스템

### 7-1. 레벨별 점수
```
levelScore = max(0, (par - strokes + 3)) × 100
// Par 2, 1타 클리어: (2 - 1 + 3) × 100 = 400점
// Par 2, 2타 클리어: (2 - 2 + 3) × 100 = 300점
// Par 2, 5타 클리어: (2 - 5 + 3) × 100 = 0점 (최소 0)
```

### 7-2. 보너스 점수
| 보너스 | 조건 | 점수 |
|--------|------|------|
| 홀인원 | 1타 만에 클리어 | +500 |
| 퍼펙트 반사 | 반사 1회 후 직접 홀인 | +200 |
| 스피드 보너스 | 레벨 시작 후 10초 이내 클리어 | +150 |

### 7-3. 총 점수
```
totalScore = sum(levelScores) + sum(bonuses)
```

### 7-4. 최고 기록 저장 (localStorage)
```javascript
// ⚠️ 판정 먼저, 저장 나중에 (platform-wisdom [Cycle 2])
const prevBest = getBest();        // 1. 판정: 이전 기록 조회
const isNewBest = totalScore > prevBest;  // 2. 비교
saveBest(totalScore);              // 3. 저장
// isNewBest를 UI에 반영

function saveBest(score) {
  try { localStorage.setItem('miniGolfBest', score); } catch(e) {}
}
function getBest() {
  try { return parseInt(localStorage.getItem('miniGolfBest')) || 0; } catch(e) { return 0; }
}
```

### 7-5. 레벨별 최소 타수 저장
```javascript
function saveLevelBest(levelId, strokes) {
  try {
    const key = `miniGolf_L${levelId}`;
    const prev = parseInt(localStorage.getItem(key)) || 999;
    if (strokes < prev) localStorage.setItem(key, strokes);
  } catch(e) {}
}
```

---

## 8. 상태 × 시스템 업데이트 매트릭스

> **[platform-wisdom ✅ Cycle 2~3]**: 모든 상태에서 어떤 시스템을 업데이트하는지 매트릭스로 정의

| 상태 \ 시스템 | TweenMgr | Physics | MovingWalls | Particles | Anim(Portal/Water) | Input | Render |
|---------------|----------|---------|-------------|-----------|-------------------|-------|--------|
| LOADING | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (로딩 바) |
| TITLE | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ (클릭=시작) | ✅ |
| PLAYING | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (드래그 에이밍) | ✅ |
| LEVEL_CLEAR | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ (클릭=다음) | ✅ |
| PAUSE | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (ESC=재개) | ✅ (반투명 오버레이) |
| CONFIRM_MODAL | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (예/아니오) | ✅ |
| GAMEOVER | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ (클릭=타이틀) | ✅ |

**핵심**: TweenManager는 **모든 상태에서** 반드시 업데이트. Cycle 2 B1 재발 방지.

---

## 9. 사운드 디자인 (Web Audio API 절차적 생성)

### 9-1. 효과음 목록

| 사운드 | 트리거 | 생성 방법 |
|--------|--------|-----------|
| 타격음 (퍽) | 공 발사 시 | 100Hz sine → 50Hz, 0.1초 감쇠. gain 0.4→0 |
| 벽 반사음 (탁) | 공 벽 충돌 | 800Hz triangle, 0.05초 감쇠. gain 0.3→0 |
| 모래 마찰음 | 공 모래 구간 진입 | 화이트 노이즈(랜덤 버퍼), 0.2초, gain 0.15 |
| 물 스플래시 | 공 물 구간 진입 | 화이트 노이즈 + 300Hz sine 혼합, 0.3초 |
| 홀인 (딩!) | 공 홀 진입 | 523Hz(C5) sine → 659Hz(E5) → 784Hz(G5) 순차 (각 0.1초), gain 0.5 |
| 홀인원 (팡파레!) | 1타 홀인 | 홀인 사운드 + 1047Hz(C6) 추가, 전체 0.6초 |
| 포탈 워프 | 공 포탈 진입 | 200Hz→800Hz sine 스윕 0.3초, gain 0.3 |
| 별 획득 | 별 표시 시 | 1000Hz sine, 0.05초, gain 0.2 (별마다 100Hz 씩 상승) |
| UI 클릭 | 버튼 클릭 | 600Hz square, 0.03초, gain 0.2 |

### 9-2. AudioContext 초기화
```javascript
let audioCtx = null;
function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e) { /* 미지원 환경: 무음 진행 */ }
}
// 첫 사용자 인터랙션(click/touch)에서 호출 — autoplay 정책 대응
```

---

## 10. 핵심 시스템 설계

### 10-1. Vector2 클래스
```javascript
class Vector2 {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  add(v)    { return new Vector2(this.x + v.x, this.y + v.y); }
  sub(v)    { return new Vector2(this.x - v.x, this.y - v.y); }
  scale(s)  { return new Vector2(this.x * s, this.y * s); }
  dot(v)    { return this.x * v.x + this.y * v.y; }
  len()     { return Math.sqrt(this.x**2 + this.y**2); }
  normalize() {
    const l = this.len();
    return l > 0 ? this.scale(1/l) : new Vector2(0, 0);
  }
  reflect(normal) {
    const d = 2 * this.dot(normal);
    return new Vector2(this.x - d * normal.x, this.y - d * normal.y);
  }
}
```

### 10-2. TweenManager (Cycle 5 안정 버전 계승)
```javascript
class TweenManager {
  constructor() { this._tweens = []; this._pendingCancel = false; }

  add(target, props, duration, easing, onComplete) { /* ... */ }

  update(dt) {
    if (this._pendingCancel) {
      this._tweens.length = 0;
      this._pendingCancel = false;
      return;
    }
    // 역순 순회 + 완료 시 splice
    for (let i = this._tweens.length - 1; i >= 0; i--) { /* ... */ }
  }

  cancelAll() { this._pendingCancel = true; }  // deferred

  clearImmediate() {  // 즉시 정리 (Cycle 5에서 도입)
    this._tweens.length = 0;
    this._pendingCancel = false;
  }
}
```
**⚠️ [Cycle 4 B1 방지]**: `resetGame()`, `goToTitle()`에서는 반드시 `clearImmediate()` 사용

### 10-3. ObjectPool (파티클용)
```javascript
class ObjectPool {
  constructor(factory, initialSize) {
    this._pool = [];
    this._active = [];
    for (let i = 0; i < initialSize; i++) this._pool.push(factory());
  }
  acquire() {
    const obj = this._pool.length > 0 ? this._pool.pop() : this._factory();
    this._active.push(obj);
    return obj;
  }
  release(obj) { /* 역순 순회 splice + pool push */ }
  releaseAll() { /* ... */ }
}
```

풀 사이즈 설정:
- 파티클 풀: 40개 (최대 동시: 홀인원 20 + 반사 스파크 6 + 여유)
- 궤적 점 풀: 25개

### 10-4. TransitionGuard (Cycle 4 도입, 계승)
```javascript
const STATE_PRIORITY = {
  LOADING: 0, TITLE: 1, PLAYING: 2,
  LEVEL_CLEAR: 3, PAUSE: 4, CONFIRM_MODAL: 5, GAMEOVER: 6
};

let transitioning = false;

function beginTransition(newState, tween) {
  if (transitioning && STATE_PRIORITY[newState] < STATE_PRIORITY[state]) return;
  transitioning = true;
  // tween 시작, onComplete에서 enterState(newState) 호출
}
```

### 10-5. 단일 갱신 경로 원칙

> **[Cycle 5 B2 방지]**: 하나의 값에 대한 갱신 경로는 반드시 하나로 통일

| 변수 | 갱신 경로 | 금지 |
|------|-----------|------|
| `ball.x`, `ball.y` | 물리 루프 (`ball.x += ball.vx`) | tween으로 위치 이동 금지 (홀인 연출 제외) |
| `ball.vx`, `ball.vy` | 물리 루프 (마찰, 반사) | 직접 대입은 발사 시 1회만 |
| `movingWall.x/y` | `updateMovingWalls()` (sin/cos 기반 왕복) | tween 금지 |
| UI alpha, scale | TweenManager | 직접 대입 금지 |

### 10-6. enterState() 패턴 (Cycle 5 도입, 계승)
```javascript
function enterState(newState) {
  state = newState;
  transitioning = false;

  switch (newState) {
    case TITLE:
      tw.clearImmediate();
      // 타이틀 글로우 tween 시작
      break;
    case PLAYING:
      loadLevel(currentLevel);
      canShoot = true;
      break;
    case LEVEL_CLEAR:
      // 별 계산 + 별 tween 시작
      calculateStars();
      showStarAnimation();
      break;
    case GAMEOVER:
      // 총점 계산 + 최고 기록 판정
      calculateFinalScore();
      break;
  }
}
```

---

## 11. 레벨 상세 설계

> 좌표계: 게임 영역 480×420px, 원점 (0, 60) — 상단 UI 60px 오프셋

### 레벨 1 — "첫 퍼팅"
```
Par: 2 | 신규 요소: 없음 (튜토리얼)
Ball: (80, 280) | Hole: (400, 280)
Walls: 외곽만
Hint: "공을 드래그하여 발사 방향과 힘을 조절하세요!"
```

### 레벨 2 — "첫 반사"
```
Par: 2 | 신규 요소: L자 벽
Ball: (80, 400) | Hole: (400, 150)
Walls: 외곽 + (200,100)→(200,350) 수직벽
설계 의도: 벽에 1회 반사하여 우회해야 홀 도달
```

### 레벨 3 — "지그재그"
```
Par: 3 | 장애물 2개
Ball: (60, 400) | Hole: (420, 120)
Walls: 외곽 + (160,60)→(160,300) + (320,180)→(320,420)
설계 의도: 2개 벽 사이를 지그재그로 통과
```

### 레벨 4 — "모래 함정"
```
Par: 3 | 신규 요소: 모래 구간
Ball: (80, 400) | Hole: (400, 120)
Walls: 외곽 + (240,200)→(240,350) 중앙벽
Sand: (150,200, 140,120) — 중앙 좌측에 직사각형 모래
설계 의도: 모래를 피하거나 힘을 세게 줘서 관통
```

### 레벨 5 — "워터 해저드"
```
Par: 3 | 신규 요소: 물 구간
Ball: (80, 280) | Hole: (420, 280)
Walls: 외곽 + (200,180)→(200,380) + (300,180)→(300,380)
Water: (210,180, 80,200) — 두 벽 사이에 물
설계 의도: 좁은 통로를 물 위 안전 지대로 정밀 에이밍
```

### 레벨 6 — "움직이는 문"
```
Par: 4 | 신규 요소: 움직이는 벽
Ball: (80, 400) | Hole: (420, 120)
Walls: 외곽 + 고정벽 (240,60)→(240,250)
MovingWall: (240,300)→(240,380), 좌우 진동 ±60px, 주기 3초
설계 의도: 타이밍 맞춰 움직이는 벽 통과
```

### 레벨 7 — "포탈 점프"
```
Par: 4 | 신규 요소: 포탈
Ball: (80, 400) | Hole: (420, 120)
Walls: 외곽 + (240,60)→(240,420) 완전 분리벽
Portal A: (180, 200) 보라 | Portal B: (320, 300) 주황
설계 의도: 좌측에서 포탈로 우측 영역 진입
```

### 레벨 8 — "사막의 길"
```
Par: 4 | 조합: 움직이는 벽 × 2 + 모래
Ball: (60, 400) | Hole: (420, 100)
Walls: 복수 고정벽으로 좁은 통로 형성
MovingWalls: 2개 (통로 입구/출구에서 상하 왕복)
Sand: 통로 바닥 전체
설계 의도: 모래 감속 + 타이밍 조합
```

### 레벨 9 — "혼돈의 코스"
```
Par: 5 | 조합: 포탈 + 움직이는 벽 + 물
Ball: (60, 420) | Hole: (420, 100)
Walls: 미로형 복수 벽
Portal: 1쌍 (물 위험 구간 우회용)
MovingWall: 1개 (홀 근처 좌우 왕복)
Water: 2개 구간 (실수 페널티)
설계 의도: 모든 요소 이해도 테스트
```

### 레벨 10 — "마스터 홀"
```
Par: 5 | 모든 요소 총출동
Ball: (60, 420) | Hole: (420, 80)
Walls: 복잡한 미로 (최소 경로 2회 반사)
MovingWalls: 2개
Sand: 2개 구간
Water: 1개 구간
Portal: 1쌍
설계 의도: 최종 챌린지, 홀인원 불가능하게 설계 (Par 5 필요)
```

---

## 12. 게임 페이지 사이드바 데이터

```yaml
game:
  title: "미니 골프 어드벤처"
  description: "드래그로 공을 쳐서 최소 타수로 홀인원을 노려보세요! 벽 반사, 모래 함정, 움직이는 장애물, 포탈을 활용한 10개 레벨의 물리 퍼즐 골프."
  genre: ["puzzle", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "마우스 드래그: 에이밍 + 힘 조절"
    - "마우스 놓기: 공 발사"
    - "터치 드래그: 모바일 에이밍"
    - "R: 레벨 재시작"
    - "ESC: 일시 정지"
    - "Space: 공 이동 가속"
  tags:
    - "#미니골프"
    - "#물리퍼즐"
    - "#드래그에이밍"
    - "#레벨기반"
    - "#벽반사"
    - "#별3개"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

### 홈 페이지 GameCard 표시 데이터
```yaml
thumbnail: Canvas 기반 자동 생성 (잔디 배경 + 공 + 홀 + 깃발)
title: "미니 골프 어드벤처"       # 1줄 잘림
description: "드래그로 공을 쳐서 최소 타수로 홀인원을 노려보세요! 벽 반사, 모래 함정, 움직이는 장애물, 포탈을 활용한 10개 레벨의 물리 퍼즐 골프."  # 2줄 잘림
genre: ["puzzle", "casual"]       # 배지 2개
playCount: 0                      # "0"
addedAt: "2026-03-20"             # 7일 이내 → "NEW" 배지
featured: true                    # → ⭐ 배지
```

---

## 13. 구현 체크리스트 및 검증

### 13-1. 기획서 대조 체크리스트

| # | 항목 | 기획서 위치 | 확인 |
|---|------|------------|------|
| 1 | 드래그 에이밍 + 궤적 프리뷰 (1차 반사까지) | §5.4 | ☐ |
| 2 | 파워 바 (초록→주황→빨강) | §5.5 | ☐ |
| 3 | 벽 반사 (법선 기반) + 에너지 손실 0.85 | §5.3 | ☐ |
| 4 | 마찰 감속 0.985, 모래 0.95 | §2.3 | ☐ |
| 5 | 물 구간 +1타 페널티 + 이전 위치 복귀 | §2.3 | ☐ |
| 6 | 포탈 입구→출구 같은 속도 사출 | §2.3 | ☐ |
| 7 | 움직이는 벽 (sin 기반 왕복) | §6.1 (레벨 6~) | ☐ |
| 8 | 홀 판정: 반경 20px + speed < 2.0 | §5.7 | ☐ |
| 9 | 별 3개 시스템 (Par-1/Par/Par+1) | §6.4 | ☐ |
| 10 | 점수 공식: max(0, (par-strokes+3))×100 | §7.1 | ☐ |
| 11 | 홀인원 보너스 +500 | §7.2 | ☐ |
| 12 | 10개 레벨 전체 구현 | §11 | ☐ |
| 13 | Web Audio 효과음 9종 | §9.1 | ☐ |
| 14 | localStorage 최고 기록 + 레벨별 최소 타수 | §7.4, §7.5 | ☐ |
| 15 | Canvas 모달 (confirm/alert 미사용) | §4.5 | ☐ |
| 16 | DPR 대응 | §4 | ☐ |
| 17 | 상태 × 시스템 매트릭스 준수 | §8 | ☐ |
| 18 | enterState() 패턴 적용 | §10.6 | ☐ |
| 19 | inputMode 변수 실제 분기 사용 | §3.5 | ☐ |
| 20 | 파워 게이지 색상 3단계 | §5.5 | ☐ |

### 13-2. 상태 전환 매트릭스

```
LOADING → TITLE         (로딩 완료 시)
TITLE → PLAYING         (클릭/터치 시 → enterState(PLAYING), 레벨 1 로드)
PLAYING → LEVEL_CLEAR   (홀인 시 → beginTransition)
PLAYING → PAUSE         (ESC 키 → enterState(PAUSE))
PLAYING → CONFIRM_MODAL (타수 10 초과 → "포기?" 모달)
LEVEL_CLEAR → PLAYING   (다음 레벨 존재 시 → 클릭 → enterState(PLAYING))
LEVEL_CLEAR → GAMEOVER  (레벨 10 클리어 시 → enterState(GAMEOVER))
PAUSE → PLAYING         (ESC 키 → enterState(PLAYING))
CONFIRM_MODAL → PLAYING (아니오 → 계속 플레이)
CONFIRM_MODAL → PLAYING ("예" → 다음 레벨로 스킵, 0점 처리)
GAMEOVER → TITLE        (클릭 → enterState(TITLE))
```

### 13-3. 상태 전환 보호

```
// ⚠️ [Cycle 3] tween 지연 구간 중 반복 호출 방지
let levelClearing = false;

function onHoleIn() {
  if (levelClearing) return;  // 가드 플래그
  levelClearing = true;
  beginTransition(LEVEL_CLEAR, ...);
}

// enterState(PLAYING)에서 levelClearing = false 리셋
```

### 13-4. 변수 사용처 검증 (유령 변수 방지)

| 변수 | 선언 | 갱신 위치 | 읽기 위치 | 상태 |
|------|------|-----------|-----------|------|
| `ball.x/y` | loadLevel | updatePlaying(물리) | render, checkHole, checkWall | ✅ |
| `ball.vx/vy` | shootBall | updatePlaying(마찰,반사) | render(궤적), checkHole(speed) | ✅ |
| `ball.moving` | stopBall/shootBall | updatePlaying | updatePlaying(분기), render(에이밍 표시) | ✅ |
| `canShoot` | stopBall/shootBall | mouseup/touchend | mousedown(에이밍 허용) | ✅ |
| `strokes` | loadLevel(=0) | shootBall(++) | render(UI), calculateStars, calculateScore | ✅ |
| `currentLevel` | enterState(PLAYING) | onLevelClear(++) | loadLevel, render(UI) | ✅ |
| `levelClearing` | enterState(PLAYING)=false | onHoleIn=true | onHoleIn(가드) | ✅ |
| `inputMode` | 초기='mouse' | touchstart/mousemove | mousedown/touchstart(입력 분기) | ✅ |
| `transitioning` | enterState=false | beginTransition=true | beginTransition(가드) | ✅ |
| `totalScore` | enterState(TITLE)=0 | onLevelClear(+=levelScore) | render(GAMEOVER), saveBest | ✅ |
| `levelStars[]` | enterState(TITLE)=[] | calculateStars(push) | render(GAMEOVER 총 별), LEVEL_CLEAR | ✅ |

### 13-5. 자동 검증 스크립트 (3단계 실행)

> **[Cycle 5 교훈]**: 코드 완성 후 1회가 아니라, 코딩 시작 전·중·후 3단계 실행

**실행 타이밍:**
1. **코딩 시작 전** — 템플릿/보일러플레이트 검증 (SVG 잔존 코드 제거 확인)
2. **50% 완성 시점** — 중간 점검 (금지 패턴 침투 조기 발견)
3. **코드 완성 후** — 최종 검증 (전체 금지 패턴 0건 확인)

```bash
# 금지 패턴 검증 (games/mini-golf-adventure/index.html 대상)
echo "=== 금지 패턴 검증 ==="
FAIL=0

# 1. SVG 관련
grep -c "\.svg\|<svg\|SVG" index.html && echo "FAIL: SVG 참조" && FAIL=1
grep -c "new Image\|img\.src" index.html && echo "FAIL: 이미지 로딩" && FAIL=1
grep -c "ASSET_MAP\|SPRITES\|preloadAssets" index.html && echo "FAIL: 에셋 프리로드 잔존" && FAIL=1
grep -c "feGaussianBlur\|filter:" index.html && echo "FAIL: SVG 필터" && FAIL=1

# 2. 상태 전환
grep -c "setTimeout" index.html && echo "WARN: setTimeout 사용 확인 필요"

# 3. iframe 호환
grep -c "confirm(\|alert(" index.html && echo "FAIL: confirm/alert 사용" && FAIL=1

# 4. 외부 리소스
grep -c "fonts.googleapis\|@import url" index.html && echo "FAIL: 외부 폰트" && FAIL=1

# 5. assets 디렉토리
[ -d "assets" ] && echo "FAIL: assets/ 디렉토리 존재" && FAIL=1

[ $FAIL -eq 0 ] && echo "ALL PASS ✅" || echo "VALIDATION FAILED ❌"
```

### 13-6. 성능 목표
- 60fps 유지 (모든 레벨, 파티클 최대 동시 40개)
- 메모리: ObjectPool로 GC 스파이크 방지
- 초기 로딩: < 0.5초 (외부 에셋 0개, 단일 HTML)
- Canvas 크기: 480 × 540 (DPR 적용 시 내부 해상도 2배까지)

---

## 14. 기술 구현 요약

| 항목 | 구현 방식 |
|------|-----------|
| 아키텍처 | 단일 index.html, Canvas 2D API, Vanilla JS |
| 물리 | Vector2 클래스, 법선 반사, 마찰 감속, 에너지 손실 |
| 상태 관리 | 7상태 FSM + TransitionGuard + enterState() |
| 애니메이션 | TweenManager (clearImmediate 포함) + 이징 5종 |
| 오브젝트 관리 | ObjectPool (파티클 40, 궤적 점 25) |
| 사운드 | Web Audio API 절차적 효과음 9종 |
| 저장 | localStorage (try-catch), 총점 + 레벨별 최소 타수 |
| 레벨 데이터 | JS 배열 리터럴 (10레벨, 외부 JSON 불필요) |
| 입력 | mouse + touch 듀얼 지원, inputMode 분기 |
| 렌더링 | offscreen canvas 배경 캐시 + 실시간 오브젝트 드로잉 |
| 이벤트 | listen() 헬퍼 + destroy() 패턴 |
| 검증 | 자동 grep 스크립트 3단계 실행 |
