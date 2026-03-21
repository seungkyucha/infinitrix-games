# Cycle 12 리뷰 — 미니 드리프트 레이서 (mini-drift-racer)

_리뷰일: 2026-03-21 | 리뷰 회차: 1차_

---

## 1. 코드 리뷰 (정적 분석)

| # | 체크 항목 | 결과 | 비고 |
|---|----------|------|------|
| 1 | 기능 완성도 | ⚠️ PARTIAL | 물웅덩이 조향 반전 미구현 (§5.3 명세 위반) |
| 2 | 게임 루프 | ✅ PASS | `requestAnimationFrame` + delta time + 50ms 상한 캡 |
| 3 | try-catch 래핑 | ✅ PASS | gameLoop 전체를 try-catch로 감싸고 에러 시 rAF 재호출 |
| 4 | 메모리 관리 | ✅ PASS | ObjectPool (연기 파티클 80개), 타이어 자국 200개 제한 |
| 5 | TweenManager | ✅ PASS | 인라인 구현, 모든 상태에서 update (§8.2) |
| 6 | SoundManager | ✅ PASS | Web Audio API 기반, 지연 초기화, 사용자 제스처 후 활성화 |
| 7 | 충돌 감지 | ✅ PASS | closestTrackPoint 기반 도로 이탈 판정 + 벽 밀어내기 |
| 8 | 모바일 터치 | ✅ PASS | 멀티터치 지원, 6개 버튼 (좌/우/GAS/BRK/핸드브레이크/부스트), passive:false |
| 9 | Canvas 리사이즈 | ✅ PASS | `window.innerWidth × window.innerHeight` 기반 자동 조정 |
| 10 | 게임 상태 전환 | ✅ PASS | 7개 상태 (TITLE→TRACK_SELECT→COUNTDOWN→RACING→LAP_CLEAR→RACE_RESULT, PAUSED) |
| 11 | 점수 시스템 | ✅ PASS | 드리프트 DP + 콤보 배율 + 니어미스 보너스 + 클린랩/드리프트킹 보너스 |
| 12 | localStorage 최고점 | ✅ PASS | 트랙별 별점/베스트타임 + 고스트 데이터 저장, try-catch 래핑 |
| 13 | 보안 | ✅ PASS | eval/alert/confirm/prompt 미사용, XSS 위험 없음 |
| 14 | 성능 | ⚠️ MINOR | `updateTrackSelect()`에서 매 프레임 `loadTrackData()` 호출 (불필요한 localStorage 접근) |
| 15 | Canvas 전용 드로잉 | ✅ PASS | 코드 내 Image/SVG/fetch 참조 없음, 순수 Canvas API 드로잉 |
| 16 | 트랙 5종 | ✅ PASS | 초원/사막/설산/도심/화산 — 웨이포인트 + 고유 노면 효과 |
| 17 | 드리프트 물리 | ✅ PASS | 핸드브레이크 → 횡방향 마찰 감소 → driftAngle 누적 → 관성 슬라이드 |
| 18 | 부스트 순환 | ✅ PASS | DP 500당 부스트 게이지 충전 → 부스트 사용 시 MAX_SPEED 초과 가속 |
| 19 | 고스트 시스템 | ✅ PASS | 6프레임 간격 기록, localStorage 저장/로드, 반투명 렌더링 |
| 20 | 카운트다운 | ✅ PASS | 3→2→1→GO! 트윈 애니메이션 + 사운드 |
| 21 | 별점 판정 | ✅ PASS | 완주=★, 목표시간=★★, 목표시간+DP=★★★ |
| 22 | 트랙 언락 | ✅ PASS | 이전 트랙 ★1개 이상 시 다음 트랙 해금 |
| 23 | 미니맵 | ✅ PASS | 우상단 80×80px, 트랙 윤곽 + 플레이어 위치 표시 |
| 24 | 카메라 | ✅ PASS | lerp 추적 + 전방 룩어헤드 + 셰이크 감쇠 |
| 25 | 'use strict' | ✅ PASS | 스크립트 최상단 선언 |
| 26 | 단일 HTML 파일 | ✅ PASS | index.html 1개 파일, 외부 의존성 없음 |

### 발견된 이슈

#### ISSUE-1: 물웅덩이 조향 반전 미구현 (Medium)
- **기획서 §5.3**: "puddle — 순간 속도 ×0.5, **1초간 조향 반전**"
- **실제 코드** (line 665-666): 속도 감소 + puddleTimer 설정만 존재. 조향 반전 로직 없음
- `updateInput()` 또는 `updateCarPhysics()`에서 `car.puddleTimer > 0`일 때 left↔right 스왑 필요
- **심각도**: Medium — 게임 플레이 가능하나 기획 의도 불충족

#### ISSUE-2: assets/ 디렉토리 존재 (Low)
- **기획서 §11**: "assets/ 디렉토리 생성 절대 금지"
- **실제**: `public/games/mini-drift-racer/assets/` 에 manifest.json + SVG 8개 파일 존재
- **코드 참조 여부**: index.html에서 해당 파일들을 전혀 로드하지 않음 (순수 Canvas 드로잉)
- 코드에는 영향 없으나, 불필요한 파일이 배포에 포함됨 → 삭제 필요
- **심각도**: Low — 기능 영향 없음, 배포 크기만 증가

#### ISSUE-3: 매 프레임 localStorage 접근 (Low)
- `updateTrackSelect()` (line 890-893)에서 매 프레임마다 전체 트랙의 `loadTrackData()` 호출
- 트랙 선택 화면 진입 시 1회 캐싱하는 방식으로 개선 권장
- **심각도**: Low — 5개 트랙 × 60fps = 초당 300회 localStorage 읽기, 성능 영향 미미하나 불필요

---

## 2. 브라우저 테스트 (Puppeteer)

**테스트 URL**: `file:///C:/Work/InfinitriX/public/games/mini-drift-racer/index.html`

| # | 테스트 항목 | 결과 | 비고 |
|---|-----------|------|------|
| 1 | 페이지 로드 | ✅ PASS | 즉시 로드, 외부 리소스 없음 |
| 2 | 콘솔 에러 없음 | ✅ PASS | 에러/경고 0건 |
| 3 | 캔버스 렌더링 | ✅ PASS | 800×600 정상 렌더링 |
| 4 | 타이틀 화면 | ✅ PASS | "MINI DRIFT RACER" + 부제 + 데코 차량 애니메이션 + 깜빡이는 프롬프트 |
| 5 | 트랙 선택 화면 | ✅ PASS | 5개 트랙 카드, 잠금 표시, 별점, 트랙 프리뷰, 정보 패널 |
| 6 | 카운트다운 → 레이싱 진입 | ✅ PASS | COUNTDOWN → RACING 상태 전환 정상 |
| 7 | 레이싱 화면 렌더링 | ✅ PASS | 트랙 도로 + 커브석 + 중앙선 + 출발선 + 차량 + HUD + 미니맵 + 터치 버튼 |
| 8 | 일시정지 오버레이 | ✅ PASS | 반투명 검정 오버레이 + "PAUSED" + 재개 안내 |
| 9 | 터치 이벤트 코드 존재 | ✅ PASS | touchstart/touchmove/touchend/touchcancel 전부 구현, 멀티터치 지원 |
| 10 | 점수 시스템 | ✅ PASS | HUD에 LAP, 타이머, DP 표시 |
| 11 | localStorage 최고점 | ✅ PASS | `mdr_track_[id]`, `mdr_ghost_[id]` 키로 저장/로드 |
| 12 | 게임오버/재시작 | ✅ PASS | RACE_RESULT 상태에서 RETRY/NEXT/MENU 버튼 + 키보드 단축키 |

### 스크린샷 기록

| 화면 | 캡처 | 판정 |
|------|------|------|
| 타이틀 | title-screen | ✅ 정상 |
| 트랙 선택 | track-select | ✅ 정상 |
| 레이싱 | racing-screen | ✅ 정상 |
| 일시정지 | paused-confirmed | ✅ 정상 |

---

## 3. 에셋 로딩 점검

| 항목 | 결과 | 비고 |
|------|------|------|
| assets/manifest.json | ⚠️ 파일 존재 (미사용) | 코드에서 참조 없음 |
| assets/*.svg (8개) | ⚠️ 파일 존재 (미사용) | player/enemy/bg-layer1/bg-layer2/ui-heart/ui-star/powerup/effect-hit/thumbnail |
| 코드 내 Image 로드 | ✅ 없음 | `new Image()`, `createElement('img')` 미사용 |
| 코드 내 fetch/SVG 참조 | ✅ 없음 | `.svg`, `manifest.json` 문자열 미참조 |

**결론**: 게임 코드는 기획서 명세대로 순수 Canvas API 드로잉만 사용. assets/ 디렉토리는 코더가 실수로 생성한 것으로 보이며, 게임 동작에 영향 없음. **삭제 권장**.

---

## 4. 종합 판정

### 코드 리뷰 판정: **NEEDS_MINOR_FIX**

### 테스트 판정: **PASS**

### 수정 필요 항목 (우선순위순)

| 우선순위 | 이슈 | 예상 작업량 | 필수 여부 |
|---------|------|-----------|----------|
| 1 | ISSUE-1: 물웅덩이 조향 반전 구현 | ~10줄 | 권장 (기획 명세 준수) |
| 2 | ISSUE-2: assets/ 디렉토리 삭제 | 파일 삭제 | 필수 (기획서 규칙 위반) |
| 3 | ISSUE-3: 트랙선택 localStorage 캐싱 | ~5줄 | 선택 (성능 최적화) |

### 판정 사유
- 게임의 핵심 메커닉(드리프트 물리, 부스트 순환, 트랙 시스템, 고스트 레코드)이 모두 정상 작동
- 12사이클 연속 재발하던 assets/ 이슈가 **코드 내에서는 해결**됨 (Canvas 전용 드로잉 확인), 다만 파일 자체는 여전히 존재
- 물웅덩이 조향 반전은 5개 트랙 중 도심(트랙4)에만 해당하므로 게임 전체 플레이에 큰 영향 없음
- 콘솔 에러 0건, 모든 화면 정상 렌더링 → **배포는 가능하나 minor fix 후 배포 권장**
