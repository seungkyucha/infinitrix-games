---
game-id: fruits-merge
title: 프루츠 머지
genre: puzzle
difficulty: medium
---

# 프루츠 머지 (Fruits Merge) - 게임 기획서

_사이클 #14 | 작성일: 2026-03-21_

---

## 0. 이전 사이클 피드백 매핑 (Cycle 13 포스트모템 + platform-wisdom 반영)

| # | 이전 문제 | 출처 | 이번 해결 방법 |
|---|-----------|------|----------------|
| F1 | index.html 미생성 — 게임 코드 자체 부재 | Cycle 13 | 단일 index.html 구현. §12 스모크 테스트 게이트에서 파일 존재+로드+에러 0건 확인 필수 |
| F2 | assets/ 디렉토리 13사이클 연속 재발 | Cycle 1~13 | **assets/ 디렉토리 절대 생성 금지.** 100% Canvas 코드 드로잉. 과일은 arc()+fillStyle+이모지 텍스트로 렌더링 |
| F3 | 잘못된 템플릿 복사로 무관한 에셋 생성 | Cycle 13 | 빈 프로젝트에서 시작. 범용 템플릿/보일러플레이트 복사 금지 |
| F4 | 기획서 완성도 ≠ 구현 완성도 | Cycle 13 | 구현 난이도를 "쉬움~중간"으로 제한. 핵심 메카닉(드롭+물리+머지)을 최소 기능으로 정의 |
| F5 | confirm()/alert() iframe 차단 | Cycle 1 | Canvas 기반 모달만 사용. window.confirm/alert 호출 0건 |
| F6 | setTimeout 상태 전환 | Cycle 1~2 | requestAnimationFrame 기반 게임 루프만 사용. setTimeout/setInterval 금지 |
| F7 | TweenManager 경쟁 조건 | Cycle 2~4 | TweenManager 미사용. 물리 엔진이 직접 위치/속도 갱신 |
| F8 | 상태×시스템 매트릭스 누락 | Cycle 2 | §5에 상태×시스템 매트릭스 포함 |
| F9 | 유령 변수 선언 후 미사용 | Cycle 3 | §11 체크리스트에서 모든 변수의 선언-사용 대응 검증 |
| F10 | SVG 필터 재발 | Cycle 3~4 | SVG 파일 자체를 생성하지 않으므로 해당 없음 |
| F11 | 판정→저장 순서 | Cycle 2 | §7 점수 시스템에서 "비교 먼저, 저장 나중에" 순서 명시 |
| F12 | 전역 객체 직접 참조 | Cycle 6~7 | §10 순수 함수 설계에서 파라미터 기반 함수 시그니처 사전 정의 |
| F13 | 터치 타겟 44px+ 미달 | Cycle 12 | §4 UI 요소 최소 터치 영역 48×48px |
| F14 | let/const TDZ 크래시 | Cycle 11 | 변수 선언을 모든 함수 호출보다 먼저 배치. 초기화 순서 명시 |
| F15 | 기획서 수치와 구현 수치 불일치 | Cycle 7~8 | §11.2 CONFIG 수치 정합성 검증 테이블 포함 |

---

## 1. 게임 개요 및 핵심 재미 요소

### 한 줄 설명
과일을 떨어뜨려 같은 과일끼리 합체시키는 물리 기반 머지 퍼즐 게임.

### 핵심 재미 요소
1. **물리적 쾌감**: 과일이 중력에 의해 떨어지고, 서로 부딪히며 굴러가는 물리 시뮬레이션의 촉각적 만족감
2. **연쇄 합체의 카타르시스**: 전략적으로 배치한 과일들이 연쇄적으로 합체하며 폭발적 점수를 얻는 순간
3. **공간 관리 긴장감**: 용기가 점점 차오르는 압박 속에서 최적의 위치를 판단하는 의사결정
4. **단순한 조작, 깊은 전략**: "어디에 떨어뜨릴까"라는 하나의 결정이 게임의 전부이나, 물리 시뮬레이션으로 인해 예측과 실제 결과의 간극에서 재미 발생

### 레퍼런스
- **Suika Game (수박 게임)**: 2024~2026 글로벌 바이럴. CrazyGames 머지 퍼즐 TOP 3
- **Watermelon Game**: 브라우저 버전 Suika. 원형 과일 + 중력 + 머지
- 차별점: Canvas 코드 드로잉 기반 경량 구현 + 한국어 UI + InfiniTriX 플랫폼 통합

---

## 2. 게임 규칙 및 목표

### 목표
최대한 높은 점수를 획득하는 것. 같은 과일을 합체시켜 더 큰 과일로 진화시킨다.

### 규칙
1. 화면 상단에서 과일을 좌우로 이동시켜 원하는 위치에 드롭한다
2. 드롭된 과일은 중력에 의해 아래로 떨어진다
3. **같은 종류의 과일 2개가 접촉하면 자동으로 합체**하여 다음 단계 과일 1개로 변한다
4. 합체로 생성된 과일이 또 다른 같은 과일과 접촉하면 **연쇄 합체** 발생
5. **용기 상단의 데드라인을 과일이 3초 이상 넘으면 게임 오버**
6. 드롭 후 다음 과일이 준비되기까지 0.5초 쿨다운
7. 다음에 나올 과일을 미리 표시 (Next 프리뷰)

### 과일 진화 체계 (11단계)

| 단계 | 과일 | 이모지 | 반지름(px) | 색상 (HEX) | 합체 점수 |
|------|------|--------|-----------|------------|----------|
| 0 | 체리 | - | 12 | #E74C3C | 1 |
| 1 | 딸기 | - | 16 | #FF6B6B | 3 |
| 2 | 포도 | - | 22 | #9B59B6 | 6 |
| 3 | 귤 | - | 28 | #F39C12 | 10 |
| 4 | 오렌지 | - | 34 | #E67E22 | 15 |
| 5 | 사과 | - | 40 | #E74C3C | 21 |
| 6 | 배 | - | 48 | #A8D860 | 28 |
| 7 | 복숭아 | - | 56 | #FDCB6E | 36 |
| 8 | 파인애플 | - | 64 | #F9CA24 | 45 |
| 9 | 멜론 | - | 72 | #2ECC71 | 55 |
| 10 | 수박 | - | 82 | #27AE60 | 66 |

> 수박(10) + 수박(10) 합체 시: 두 수박이 모두 소멸 + 보너스 100점

### 드롭 과일 출현 확률

| 난이도 구간 | 체리 | 딸기 | 포도 | 귤 | 오렌지 |
|------------|------|------|------|-----|--------|
| 0~500점 | 35% | 30% | 20% | 10% | 5% |
| 501~2000점 | 25% | 30% | 25% | 15% | 5% |
| 2001점+ | 20% | 25% | 25% | 20% | 10% |

> 드롭 가능한 과일은 0~4단계(체리~오렌지)만. 사과 이상은 합체로만 생성 가능.

---

## 3. 조작 방법

### 키보드
| 키 | 동작 |
|----|------|
| ← / A | 드롭 위치 왼쪽 이동 |
| → / D | 드롭 위치 오른쪽 이동 |
| Space / ↓ / S | 과일 드롭 |
| P / Escape | 일시정지 토글 |

### 마우스
| 동작 | 설명 |
|------|------|
| 마우스 좌우 이동 | 드롭 위치가 마우스 X 좌표를 따라감 |
| 좌클릭 | 과일 드롭 |

### 터치 (모바일)
| 동작 | 설명 |
|------|------|
| 터치 좌우 드래그 | 드롭 위치가 터치 X 좌표를 따라감 |
| 터치 떼기 (touchend) | 과일 드롭 |

> **입력 모드 자동 감지**: 첫 입력 이벤트 타입에 따라 키보드/마우스/터치 모드 결정. 이후 다른 입력이 감지되면 즉시 전환.

---

## 4. 시각적 스타일 가이드

### 색상 팔레트

| 용도 | HEX | 설명 |
|------|-----|------|
| 배경 | #1A1A2E | 짙은 남색 |
| 용기 벽 | #16213E | 진한 네이비 |
| 용기 내부 | #0F3460 | 어두운 파랑 |
| 데드라인 | #E74C3C (alpha 0.5) | 반투명 빨강 점선 |
| 드롭 가이드라인 | #FFFFFF (alpha 0.3) | 반투명 흰색 점선 |
| 점수 텍스트 | #ECF0F1 | 밝은 회색 |
| UI 배경 | #2C3E50 | 어두운 청회색 |
| 강조 (버튼) | #3498DB | 밝은 파랑 |

### 과일 렌더링 (100% Canvas 코드 드로잉)

각 과일은 다음 요소로 구성:
1. **원형 본체**: `ctx.arc()` + `ctx.fillStyle` = 해당 과일 색상
2. **하이라이트**: 원 중심에서 좌상 30% 위치에 작은 흰색 반투명 원 (광택 효과)
3. **외곽선**: `ctx.strokeStyle` = 본체 색상보다 20% 어두운 색, `lineWidth = 2`
4. **과일 이름**: `ctx.fillText()` 로 과일 이름 1글자 (체, 딸, 포, 귤, 오, 사, 배, 복, 파, 멜, 수)
5. **크기 구분**: 반지름이 단계마다 명확히 다름 (12px ~ 82px)

> **에셋 파일 0개**: 모든 시각 요소는 Canvas API (`arc`, `fillRect`, `fillText`, `strokeStyle`)로 실시간 렌더링

### 배경
- 고정 배경: 짙은 남색 (#1A1A2E) 단색
- 용기: 좌우+하단 벽이 있는 U자형 컨테이너, 둥근 모서리 (Canvas `roundRect`)
- 상단: 데드라인 점선 + "DANGER ZONE" 텍스트 (alpha 깜빡임)

### 파티클 효과 (합체 시)
- 합체 지점에서 8~12개 원형 파티클 방사
- 색상: 합체된 과일 색상
- 수명: 0.3초, alpha 서서히 감소
- 크기: 2~5px 랜덤

### UI 레이아웃

```
┌──────────────────────────────────┐
│  SCORE: 1234     BEST: 5678      │  ← 점수 영역 (높이 50px)
│  NEXT: [과일 미리보기]            │
├──────────────────────────────────┤
│        ↓ 드롭 가이드라인          │  ← 데드라인 위 (높이 40px)
│  ─ ─ ─ ─ DEADLINE ─ ─ ─ ─ ─ ─  │
│  ┌────────────────────────────┐  │
│  │                            │  │
│  │       [용기 영역]           │  │  ← 게임 용기 (메인 영역)
│  │     과일이 쌓이는 공간       │  │
│  │                            │  │
│  │                            │  │
│  └────────────────────────────┘  │
│  [일시정지]                      │  ← 하단 UI (높이 48px, 터치 48×48)
└──────────────────────────────────┘
```

### Canvas 크기
- **기본**: 400 × 700 (세로형)
- **반응형**: `window.innerWidth`와 `window.innerHeight`에 맞춰 비율 유지 스케일링
- **DPR 대응**: `canvas.width = displayWidth * dpr`, CSS 크기와 분리

---

## 5. 핵심 게임 루프 (상태 머신 + 프레임 기준 로직)

### 상태 머신

```
TITLE → PLAYING → GAMEOVER
          ↕
        PAUSED
```

| 상태 | 설명 |
|------|------|
| TITLE | 타이틀 화면. 탭/클릭/키 입력으로 PLAYING 전환 |
| PLAYING | 게임 진행 중. 물리+입력+렌더링 모두 활성 |
| PAUSED | 일시정지. 렌더링만 (정지 프레임). 입력은 Resume만 |
| GAMEOVER | 게임 오버. 점수 표시 + 재시작/타이틀 버튼 |

### 상태 × 시스템 업데이트 매트릭스

| 시스템 | TITLE | PLAYING | PAUSED | GAMEOVER |
|--------|-------|---------|--------|----------|
| 입력 처리 | Start만 | ✅ 전체 | Resume만 | Retry/Title만 |
| 물리 엔진 | ❌ | ✅ | ❌ | ❌ |
| 충돌 감지 | ❌ | ✅ | ❌ | ❌ |
| 머지 판정 | ❌ | ✅ | ❌ | ❌ |
| 파티클 업데이트 | ❌ | ✅ | ❌ | ✅ (잔여) |
| 데드라인 판정 | ❌ | ✅ | ❌ | ❌ |
| 렌더링 | ✅ | ✅ | ✅ (정지) | ✅ |
| UI 렌더링 | ✅ | ✅ | ✅ (오버레이) | ✅ (오버레이) |

### 매 프레임 로직 (PLAYING 상태, 60fps 기준)

```
1. deltaTime 계산 (이전 프레임과의 시간 차, 최대 33ms 캡)
2. 입력 처리
   - 마우스/터치: dropX = clamp(inputX, 용기좌측+과일반지름, 용기우측-과일반지름)
   - 키보드: dropX += direction * MOVE_SPEED * dt
   - 드롭 명령 + 쿨다운 완료 → spawnFruit(dropX)
3. 물리 시뮬레이션 (고정 timestep 1/60초, 최대 3회 서브스텝)
   a. 중력 적용: vy += GRAVITY * dt
   b. 속도 적용: x += vx * dt, y += vy * dt
   c. 벽 충돌: 좌/우/하단 벽과 원-직선 충돌 → 반사 + 반발계수
   d. 과일 간 충돌: 원-원 충돌 → 분리 + 탄성 충돌 응답
4. 머지 판정
   a. 충돌 중인 같은 종류 과일 쌍 탐색
   b. 쌍 발견 시: 두 과일 제거 → 중간 지점에 다음 단계 과일 생성 → 점수 추가 → 파티클 생성
   c. 새 과일로 인한 추가 머지 확인 (연쇄)
5. 데드라인 판정
   a. 모든 과일의 최상단 y좌표 확인
   b. 데드라인 위에 과일 존재 시 타이머 시작
   c. 3초 초과 → GAMEOVER 전환
   d. 데드라인 아래로 내려오면 타이머 리셋
6. 파티클 업데이트: 위치/alpha/수명 갱신, 수명 종료 시 제거
7. 렌더링
   a. 배경 + 용기
   b. 모든 과일 (아래→위 순서)
   c. 파티클
   d. 드롭 가이드라인 + 현재 과일 (드롭 전)
   e. UI (점수, NEXT, 일시정지 버튼)
   f. 데드라인 경고 (타이머 > 0이면 빨강 깜빡임)
```

---

## 6. 난이도 시스템

### 점수 기반 난이도 변화

| 점수 구간 | 변화 내용 |
|-----------|----------|
| 0 ~ 500 | 기본 난이도. 체리·딸기 위주 출현. 여유로운 공간 관리 |
| 501 ~ 2000 | 포도·귤 출현 비율 증가. 용기가 더 빨리 차오름 |
| 2001+ | 오렌지까지 출현. 큰 과일이 많아 공간 압박 심화 |

### 자연적 난이도 곡선
- 물리 시뮬레이션 자체가 난이도를 자동 조절:
  - 초반: 작은 과일 → 공간 여유 → 쉬움
  - 중반: 합체된 중형 과일이 쌓임 → 공간 압박 시작
  - 후반: 대형 과일이 용기를 차지 → 빈틈 관리가 핵심 → 어려움
- **별도 난이도 파라미터 변경 없이** 과일 크기 성장 자체가 난이도를 올린다

### 쿨다운
- 드롭 후 다음 과일 준비까지 **0.5초** (30프레임)
- 이 쿨다운 동안 좌우 이동만 가능, 드롭 불가

---

## 7. 점수 시스템

### 점수 획득
- **합체 시**: 해당 단계의 합체 점수 획득 (§2 테이블 참조)
- **연쇄 합체 보너스**: 1회 드롭으로 N회 연쇄 합체 시, N번째 합체부터 ×1.5 보너스
- **수박 합체 보너스**: 수박+수박 합체 시 100점 추가

### 점수 계산 공식
```
단일 합체 점수 = FRUIT_SCORE[level]
연쇄 합체 점수 = FRUIT_SCORE[level] × (1 + 0.5 × max(0, chainIndex - 1))
```

### 최고 점수 저장
```javascript
// 판정 먼저, 저장 나중에 (platform-wisdom F11)
const isNewBest = score > getBestScore();
saveBestScore(score);
// isNewBest 을 UI 표시에 사용
```

- `localStorage` 사용, `try-catch`로 래핑 (iframe 안전)
- 키: `"fruits-merge-best"`

---

## 8. 물리 엔진 상세

### 상수 (CONFIG 객체에 일원화)

| 상수명 | 값 | 설명 |
|--------|-----|------|
| GRAVITY | 980 | 중력 가속도 (px/s^2) |
| RESTITUTION | 0.3 | 반발 계수 (0=완전 비탄성, 1=완전 탄성) |
| FRICTION | 0.1 | 마찰 계수 |
| DAMPING | 0.98 | 매 프레임 속도 감쇠 |
| MAX_VELOCITY | 800 | 최대 속도 제한 (px/s) |
| SUBSTEPS | 3 | 물리 서브스텝 수 |
| WALL_RESTITUTION | 0.2 | 벽 반발 계수 |
| DROP_COOLDOWN | 500 | 드롭 쿨다운 (ms) |
| DEADLINE_GRACE | 3000 | 데드라인 유예 시간 (ms) |
| MOVE_SPEED | 300 | 키보드 이동 속도 (px/s) |

### 원-원 충돌 감지 및 응답

```
충돌 조건: dist(a, b) < a.radius + b.radius

분리 벡터:
  overlap = (a.radius + b.radius) - dist
  nx = (b.x - a.x) / dist
  ny = (b.y - a.y) / dist
  a.x -= nx * overlap * 0.5
  a.y -= ny * overlap * 0.5
  b.x += nx * overlap * 0.5
  b.y += ny * overlap * 0.5

탄성 충돌 (질량 = 반지름^2):
  relVel = dot(b.vel - a.vel, normal)
  if relVel > 0: return  // 이미 벌어지는 중
  j = -(1 + RESTITUTION) * relVel / (1/massA + 1/massB)
  a.vx -= j * nx / massA
  a.vy -= j * ny / massA
  b.vx += j * nx / massB
  b.vy += j * ny / massB
```

### 원-벽 충돌
- 좌벽: `if (x - r < wallLeft) { x = wallLeft + r; vx = -vx * WALL_RESTITUTION; }`
- 우벽: `if (x + r > wallRight) { x = wallRight - r; vx = -vx * WALL_RESTITUTION; }`
- 바닥: `if (y + r > wallBottom) { y = wallBottom - r; vy = -vy * WALL_RESTITUTION; }`

---

## 9. 사운드 (Web Audio API 절차적 생성)

### 효과음 (외부 파일 0개)

| 이벤트 | 사운드 | 구현 |
|--------|--------|------|
| 과일 드롭 | 짧은 "퉁" | sine 200Hz, duration 0.1s, gain 0→0.3→0 |
| 과일 충돌 | 가벼운 "톡" | sine 300Hz + noise, duration 0.05s |
| 합체 | 상승 "띵" | sine (과일 단계×100+200)Hz, duration 0.2s, gain 0→0.5→0 |
| 연쇄 합체 | 연속 상승음 | 합체음을 피치 점점 올려서 연속 재생 |
| 데드라인 경고 | 낮은 "웅" | sine 80Hz + square 40Hz, duration 0.3s, 0.5초 간격 반복 |
| 게임 오버 | 하강 "부웅" | sine 400Hz→100Hz sweep, duration 0.5s |

```javascript
// 사운드 헬퍼 (try-catch로 AudioContext 미지원 환경 안전)
function playSound(freq, duration, type = 'sine') {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e) { /* 무시 */ }
}
```

---

## 10. 순수 함수 설계 (전역 참조 금지)

### 순수 함수 목록 및 시그니처

| 함수명 | 파라미터 | 반환 | 설명 |
|--------|----------|------|------|
| `checkCircleCollision(a, b)` | {x,y,r}, {x,y,r} | {hit, overlap, nx, ny} | 원-원 충돌 판정 |
| `resolveCollision(a, b, normal)` | fruit, fruit, {nx,ny} | void (a,b 직접 수정) | 탄성 충돌 응답 |
| `checkWallCollision(fruit, walls)` | {x,y,r,vx,vy}, {l,r,b} | void (fruit 직접 수정) | 벽 충돌 처리 |
| `findMergePairs(fruits)` | fruit[] | [indexA, indexB][] | 합체 가능 쌍 탐색 |
| `calcMergeScore(level, chainIdx)` | number, number | number | 합체 점수 계산 |
| `getDropFruitLevel(score)` | number | number (0~4) | 점수 기반 출현 과일 결정 |
| `isAboveDeadline(fruit, deadlineY)` | {y,r}, number | boolean | 데드라인 초과 여부 |
| `clampDropX(x, radius, walls)` | number, number, {l,r} | number | 드롭 X좌표 클램프 |
| `getBestScore()` | - | number | localStorage 읽기 |
| `saveBestScore(score)` | number | void | localStorage 저장 |
| `drawFruit(ctx, fruit, config)` | CanvasCtx, fruit, fruitConfig | void | 과일 렌더링 |
| `drawContainer(ctx, walls)` | CanvasCtx, wallConfig | void | 용기 렌더링 |
| `createParticles(x, y, color, count)` | number, number, string, number | particle[] | 파티클 배열 생성 |

> **전역 변수 직접 참조 금지**: 모든 함수는 파라미터로만 데이터를 수신. `gameState` 등 전역 상태는 게임 루프(`update`, `render`)에서만 참조하고, 하위 함수에는 필요한 값만 전달.

---

## 11. 구현 검증 체크리스트

### 11.1 필수 게이트 (리뷰 제출 전 확인)

- [ ] **G1**: `games/fruits-merge/index.html` 파일이 존재한다
- [ ] **G2**: 브라우저에서 로드 시 콘솔 에러 0건
- [ ] **G3**: `games/fruits-merge/assets/` 디렉토리가 존재하지 않는다
- [ ] **G4**: 코드 내 `confirm(`, `alert(`, `prompt(` 호출 0건
- [ ] **G5**: 코드 내 `setTimeout`, `setInterval` 호출 0건
- [ ] **G6**: 코드 내 `fetch(`, `new Image(`, `.svg`, `assets/` 문자열 0건
- [ ] **G7**: 코드 내 `Google Fonts`, `@import`, `<link rel="stylesheet"` 외부 리소스 0건
- [ ] **G8**: 모든 `let`/`const` 선언이 첫 사용 이전에 위치
- [ ] **G9**: 모든 터치/클릭 영역이 최소 48×48px
- [ ] **G10**: `try-catch`로 `localStorage`, `AudioContext` 래핑

### 11.2 CONFIG 수치 정합성 검증 테이블

| 기획서 항목 | 기획서 값 | 코드 내 위치 (예상) | 일치 여부 |
|------------|----------|-------------------|----------|
| GRAVITY | 980 | CONFIG.GRAVITY | [ ] |
| RESTITUTION | 0.3 | CONFIG.RESTITUTION | [ ] |
| FRICTION | 0.1 | CONFIG.FRICTION | [ ] |
| DAMPING | 0.98 | CONFIG.DAMPING | [ ] |
| MAX_VELOCITY | 800 | CONFIG.MAX_VELOCITY | [ ] |
| SUBSTEPS | 3 | CONFIG.SUBSTEPS | [ ] |
| WALL_RESTITUTION | 0.2 | CONFIG.WALL_RESTITUTION | [ ] |
| DROP_COOLDOWN | 500 | CONFIG.DROP_COOLDOWN | [ ] |
| DEADLINE_GRACE | 3000 | CONFIG.DEADLINE_GRACE | [ ] |
| MOVE_SPEED | 300 | CONFIG.MOVE_SPEED | [ ] |
| 체리 반지름 | 12 | FRUITS[0].radius | [ ] |
| 딸기 반지름 | 16 | FRUITS[1].radius | [ ] |
| 포도 반지름 | 22 | FRUITS[2].radius | [ ] |
| 귤 반지름 | 28 | FRUITS[3].radius | [ ] |
| 오렌지 반지름 | 34 | FRUITS[4].radius | [ ] |
| 사과 반지름 | 40 | FRUITS[5].radius | [ ] |
| 배 반지름 | 48 | FRUITS[6].radius | [ ] |
| 복숭아 반지름 | 56 | FRUITS[7].radius | [ ] |
| 파인애플 반지름 | 64 | FRUITS[8].radius | [ ] |
| 멜론 반지름 | 72 | FRUITS[9].radius | [ ] |
| 수박 반지름 | 82 | FRUITS[10].radius | [ ] |
| 수박 합체 보너스 | 100 | WATERMELON_BONUS | [ ] |
| 연쇄 보너스 배수 | ×1.5 | CHAIN_MULTIPLIER | [ ] |

### 11.3 기능 존재 검증

- [ ] 타이틀 화면 표시 + 시작 입력 반응
- [ ] 드롭 위치 좌우 이동 (키보드/마우스/터치 각각)
- [ ] 과일 드롭 + 중력 낙하
- [ ] 과일 간 충돌 + 분리
- [ ] 벽 충돌 + 반사
- [ ] 같은 과일 합체 + 다음 단계 생성
- [ ] 연쇄 합체 동작
- [ ] 합체 파티클 효과
- [ ] 합체 사운드 (주파수 상승)
- [ ] 데드라인 3초 유예 + 게임 오버
- [ ] 데드라인 경고 시각 효과
- [ ] NEXT 과일 미리보기
- [ ] 점수 표시 + 최고 점수 저장/로드
- [ ] 일시정지/재개
- [ ] 게임 오버 화면 + 재시작/타이틀 버튼
- [ ] 드롭 쿨다운 0.5초
- [ ] 점수 구간별 드롭 과일 확률 변화
- [ ] DPR 대응 (고해상도 Canvas)
- [ ] 반응형 스케일링 (세로형 비율 유지)

---

## 12. 구현 완료 스모크 테스트 (Cycle 13 F1 대응)

리뷰 제출 전 아래 5개 항목을 **반드시** 확인:

```
1. [ ] games/fruits-merge/index.html 파일이 물리적으로 존재
2. [ ] 브라우저에서 직접 열어 게임 화면이 표시됨
3. [ ] 개발자 도구 콘솔에 에러 0건
4. [ ] 과일 드롭 → 낙하 → 합체 기본 루프가 동작
5. [ ] games/fruits-merge/assets/ 디렉토리가 존재하지 않음
```

> **이 5개 항목 중 하나라도 FAIL이면 리뷰 제출 불가.**

---

## 13. 사이드바 & GameCard 메타데이터

### 사이드바 표시 정보

```yaml
game:
  title: "프루츠 머지"
  description: "같은 과일을 합체시켜 수박을 만들어라! 물리 기반 머지 퍼즐."
  genre: ["puzzle", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "마우스 좌우: 드롭 위치 이동"
    - "클릭/탭: 과일 드롭"
    - "←→ / A/D: 키보드 이동"
    - "Space/↓: 키보드 드롭"
    - "P / ESC: 일시정지"
  tags:
    - "#머지"
    - "#퍼즐"
    - "#물리"
    - "#수박게임"
    - "#캐주얼"
  addedAt: "2026-03-21"
  version: "1.0.0"
```

### GameCard 표시

```yaml
thumbnail: "(Canvas 기반 4:3 스크린샷 또는 서버사이드 생성)"
title: "프루츠 머지"
description: "같은 과일을 합체시켜 수박을 만들어라! 물리 기반 머지 퍼즐."
genre_badges: ["puzzle", "casual"]  # 최대 2개
playCount: "0"  # 1000 이상 시 "1.2k" 형식
addedAt_new: true  # 7일 이내이므로 "NEW" 배지 표시
featured: false
```

---

## 14. 코더 참고 — 초기화 순서 (TDZ 방지, F14 대응)

```javascript
// === 1. 상수 & CONFIG 선언 ===
const CONFIG = { ... };
const FRUITS = [ ... ];

// === 2. 전역 변수 선언 ===
let canvas, ctx;
let gameState = 'TITLE';
let fruits = [];
let particles = [];
let score = 0;
let bestScore = 0;
let dropX, currentFruit, nextFruitLevel;
let dropCooldown = 0;
let deadlineTimer = 0;
let audioCtx = null;

// === 3. 순수 함수 정의 ===
function checkCircleCollision(a, b) { ... }
// ... (§10의 모든 함수)

// === 4. 게임 루프 함수 정의 ===
function update(dt) { ... }
function render() { ... }
function gameLoop(timestamp) { ... }

// === 5. 이벤트 리스너 등록 ===
// (모든 변수 선언 완료 후)

// === 6. 초기화 & 시작 ===
function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  bestScore = getBestScore();
  requestAnimationFrame(gameLoop);
}
window.addEventListener('load', init);
```

> **절대 규칙**: `let`/`const` 선언이 해당 변수를 사용하는 모든 함수 호출보다 위에 위치해야 한다.

---

_프루츠 머지 기획서 v1.0 | 사이클 #14 | 2026-03-21_
_이전 13사이클 누적 피드백 15건 반영 완료_
