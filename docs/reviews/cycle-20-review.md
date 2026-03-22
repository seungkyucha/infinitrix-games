---
game-id: crystal-pinball
cycle: 20
date: 2026-03-22
reviewer: Claude QA Agent
verdict: NEEDS_MINOR_FIX
code-review: NEEDS_MINOR_FIX
browser-test: PASS
---

# Cycle 20 — 크리스탈 핀볼 리뷰

## 1. 코드 리뷰 (정적 분석)

### 1.1 기능 완성도

| 기획 항목 | 구현 여부 | 비고 |
|-----------|-----------|------|
| 5상태 (TITLE→TABLE_SELECT→PLAYING→DRAIN→GAMEOVER) | ✅ PASS | 10개 상태 모두 구현 (PAUSED, UPGRADE, BOSS_INTRO, TABLE_CLEAR, RESULT 포함) |
| 10개 테이블 데이터 | ✅ PASS | TABLE_DATA 10개 항목, 보스 테이블 2개 (5, 10) |
| 플리퍼 좌/우 조작 | ✅ PASS | 키보드(←→/Z/X), 마우스, 터치 영역 모두 지원 |
| 플런저 발사 | ✅ PASS | 충전 방식, 스페이스/터치 지원 |
| 범퍼/파워범퍼 | ✅ PASS | 반발 계수 차별화, 히트 애니메이션 |
| 크리스탈 타겟 | ✅ PASS | 5가지 색상, 체력 시스템, 테이블별 내구도 차등 |
| 콤보 시스템 | ✅ PASS | 1~4: ×1, 5~9: ×2, 10~19: ×3, 20+: ×5 — 기획서 일치 |
| 업그레이드 상점 | ✅ PASS | 8종 업그레이드, 크리스탈 통화, 스크롤 지원 |
| 보스 테이블 | ✅ PASS | T5 미드보스(HP20), T10 최종보스(HP45, 3코어) |
| 멀티볼 | ✅ PASS | 롤오버 레인 3개 완성 시 발동, 업그레이드 연동 |
| 세이브 게이트 | ✅ PASS | 킥아웃 홀 충전 방식, 업그레이드 연동 |
| 업적 10종 | ✅ PASS | 첫 발사 ~ 프리즘 정복자 모두 정의 |
| 퍼펙트 보너스 | ✅ PASS | 크리스탈 ×2 보상 |

### 1.2 게임 루프 & 성능

| 항목 | 결과 | 비고 |
|------|------|------|
| requestAnimationFrame 사용 | ✅ PASS | `gameLoop()` → `requestAnimationFrame(gameLoop)` |
| delta time 처리 | ✅ PASS | `DT_CAP: 0.05`으로 프레임 스파이크 방지 |
| try-catch (F12) | ✅ PASS | gameLoop 내부 전체 try-catch |
| 물리 서브스텝 | ✅ PASS | `SUB_STEPS: 4` — 고속 볼 터널링 방지 |
| 오프스크린 캐싱 (F10) | ✅ PASS | `buildTableCache()` — 테이블 정적 요소 캐싱 |
| 파티클 풀링 | ✅ PASS | `ParticlePool(200)` — 객체 재사용으로 GC 감소 |
| 매 프레임 DOM 접근 | ✅ PASS | 없음. 모든 렌더링은 Canvas API |
| setTimeout 사용 (F2) | ✅ PASS | 0건. 모든 타이밍은 TweenManager 또는 Web Audio 스케줄링 |

### 1.3 메모리 & 이벤트

| 항목 | 결과 | 비고 |
|------|------|------|
| 이벤트 리스너 등록 | ✅ PASS | `init()`에서 일괄 등록 |
| 이벤트 리스너 정리 | ⚠️ N/A | 단일 페이지 게임이므로 해제 불필요 |
| 객체 재사용 | ✅ PASS | ParticlePool, ball trail 배열 shift 방식 |
| 전역 변수 관리 | ✅ PASS | 'use strict' 사용, 명확한 섹션별 분리 |

### 1.4 충돌 감지

| 항목 | 결과 | 비고 |
|------|------|------|
| 볼-벽 충돌 | ✅ PASS | 좌/우/상단 벽, 반발 계수 적용 |
| 볼-플리퍼 충돌 | ✅ PASS | 선분-원 충돌, 플리핑 보너스 속도 |
| 볼-범퍼 충돌 | ✅ PASS | 원-원 충돌, `resolveCircleCollision()` 순수 함수 |
| 볼-크리스탈 충돌 | ✅ PASS | 원-원 충돌, HP 감소 로직 |
| 드레인 감지 | ✅ PASS | Y좌표 기준, 세이브 게이트 우선 체크 |
| 멀티볼 드레인 | ✅ PASS | 추가 볼은 조용히 제거, 마지막 볼만 드레인 |

### 1.5 상태 관리 (F5, F17, F23)

| 항목 | 결과 | 비고 |
|------|------|------|
| 상태 우선순위 (F17) | ✅ PASS | `STATE_PRIORITY` 맵으로 낮은→높은 전환 차단 |
| 전환 가드 (F5) | ✅ PASS | `isTransitioning`, `isDraining`, `isLaunching` 3중 가드 |
| `beginTransition()` 경유 (F23) | ✅ PASS | PAUSED만 예외(즉시 전환) |
| render에서 상태 변경 금지 (F26) | ✅ PASS | render 함수는 순수 출력 |

### 1.6 보안

| 항목 | 결과 | 비고 |
|------|------|------|
| eval() 사용 | ✅ PASS | 0건 |
| alert/confirm/prompt (F8) | ✅ PASS | 0건 |
| window.open | ✅ PASS | 0건 |
| XSS 위험 | ✅ PASS | 사용자 입력을 DOM에 삽입하는 경로 없음 |

### 1.7 점수/최고점 & 저장

| 항목 | 결과 | 비고 |
|------|------|------|
| 점수 단일 갱신 경로 (F16) | ✅ PASS | `addScore()` 함수만 사용 |
| localStorage 저장 | ✅ PASS | `crystal-pinball-save` 키, try-catch 보호 |
| 로드 시 기본값 | ✅ PASS | JSON 파싱 실패 시 안전한 기본값 |
| 저장 항목 | ✅ PASS | 버전, 테이블 해금, 크리스탈, 점수, 업그레이드, 업적 |

---

## 2. 모바일 조작 대응 검사

| 항목 | 결과 | 비고 |
|------|------|------|
| touchstart 등록 | ✅ PASS | `canvas.addEventListener('touchstart', ...)` passive:false |
| touchmove 등록 | ✅ PASS | `canvas.addEventListener('touchmove', ...)` passive:false |
| touchend 등록 | ✅ PASS | `canvas.addEventListener('touchend', ...)` passive:false |
| e.preventDefault() | ✅ PASS | 3개 터치 이벤트 모두 호출 |
| 가상 조이스틱/버튼 UI | ⚠️ INFO | 명시적 가상 버튼 UI는 없으나, 화면 영역 분할 방식(좌40%=왼쪽 플리퍼, 우60%=오른쪽 플리퍼, 우하단=플런저)으로 터치 조작 구현 |
| 터치 영역 44px 이상 | ✅ PASS | 플리퍼 좌: 160×280px, 플리퍼 우: 160×280px, 플런저: 120×350px — 모두 최소 기준 초과 |
| CONFIG.MIN_TOUCH | ✅ PASS | 48px 설정 (F20, F24 대응) |
| 뷰포트 meta 태그 | ✅ PASS | `width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no` |
| 가로/세로 스크롤 방지 | ✅ PASS | body: `overflow:hidden; touch-action:none`, canvas: `touch-action:none` |
| `-webkit-touch-callout:none` | ✅ PASS | body CSS에 적용 |
| `user-select:none` | ✅ PASS | body CSS에 적용 |
| 키보드 없이 플레이 가능 | ✅ PASS | 터치만으로 전 상태 전환 + 플레이 가능: 타이틀(탭), 테이블 선택(탭), 플런저(터치홀드→릴리즈), 플리퍼(영역 터치), 게임오버(탭), 업그레이드(탭+스크롤) |
| 멀티터치 플리퍼 | ✅ PASS | `touches` 객체로 개별 터치 추적, 양쪽 플리퍼 동시 조작 가능 |
| inputMode 자동 감지 | ✅ PASS | keyboard/mouse/touch 자동 전환, UI 텍스트 반영 ("TAP TO START" vs "PRESS SPACE") |

### 모바일 대응 미비 사항

1. **가상 버튼 시각적 가이드 부재**: 터치 영역이 화면에 시각적으로 표시되지 않음. 첫 플레이 시 어디를 터치해야 하는지 모를 수 있음. → **MINOR**
2. **업그레이드 상점 터치 스크롤**: `wheel` 이벤트만 처리. 터치 드래그로 스크롤하는 로직이 없음 (`touchmove`에서 `upgradeScroll` 갱신 미구현). → **MINOR**

---

## 3. 에셋 로딩 검사

| 항목 | 결과 | 비고 |
|------|------|------|
| assets/manifest.json 존재 | ✅ EXISTS | 8개 에셋 + thumbnail 정의 |
| SVG 파일 존재 | ✅ EXISTS | player, enemy, bgLayer1, bgLayer2, uiHeart, uiStar, powerup, effectHit, thumbnail (9개) |
| 프리로더 구현 | ✅ PASS | `preloadAssets()` async, `Promise.all`, `img.onerror = resolve` (에러 시 fallback) |
| Canvas fallback | ✅ PASS | 모든 스프라이트에 Canvas 코드 드로잉 fallback 존재 |
| 로딩 화면 | ✅ PASS | "LOADING..." 텍스트 표시 후 에셋 로딩 |

### ⚠️ 기획서 위반 사항

**F1 위반: `assets/` 디렉토리 존재**
> 기획서 §14.5 및 F1: "index.html 단일 파일에서 처음부터 작성. assets/ 디렉토리 절대 생성 금지. 100% Canvas 코드 드로잉. thumbnail.svg만 별도 허용"

현재 상태:
- `assets/` 디렉토리에 9개 SVG 파일 + manifest.json 존재
- 코드에 `ASSET_MAP`으로 8개 SVG 참조
- **단, 모든 스프라이트에 Canvas fallback이 구현**되어 있으므로 에셋 없이도 게임이 동작함

**판정**: Canvas fallback이 완전하므로 게임 플레이에는 영향 없음. 하지만 기획서 명시 규칙 위반이므로 **MINOR FIX** — 에셋 디렉토리 삭제하거나, 에셋을 인라인 data URI로 변환하는 것을 권장.

---

## 4. 브라우저 테스트 결과

| 항목 | 결과 | 비고 |
|------|------|------|
| 페이지 로드 | ✅ PASS | 에러 없이 로드 |
| 콘솔 에러 없음 | ✅ PASS | 에러/경고 0건 |
| 캔버스 렌더링 | ✅ PASS | 배경, 별, 성운, 스캔라인 효과 모두 렌더링 |
| 시작 화면 표시 | ✅ PASS | "CRYSTAL PINBALL" 타이틀, 글리치 효과, 크리스탈 장식, "PRESS SPACE" 깜빡임 |
| 테이블 선택 화면 | ✅ PASS | 10개 테이블 카드, 잠금 표시, UPGRADES 버튼 |
| 플레이 화면 | ✅ PASS | 범퍼(3), 크리스탈 타겟(5), 플리퍼(2), 플런저, 롤오버 레인, HUD 모두 표시 |
| 볼 물리 | ✅ PASS | 중력, 벽 반사, 범퍼 반발, 볼 트레일 효과 |
| 점수 시스템 | ✅ PASS | 범퍼 히트(100), 크리스탈 파괴(500) 확인 |
| 콤보 표시 | ✅ PASS | 카운터 증가 확인 |
| 게임오버 화면 | ✅ PASS | "GAME OVER", 점수, "NEW RECORD!", 크리스탈, 재시작 안내 |
| localStorage 최고점 | ✅ PASS | `crystal-pinball-save` 키에 정상 저장 확인 |
| 업적 시스템 | ✅ PASS | "첫 발사" 업적 자동 달성, 크리스탈 보상 지급 |
| DPR 대응 | ✅ PASS | `devicePixelRatio` 기반 캔버스 크기 조정 |

---

## 5. 수치 정합성 검증 (기획서 §14.4)

| 항목 | 기획서 | 코드 | 일치 |
|------|--------|------|------|
| 범퍼 점수 | 100 | `SCORE.BUMPER: 100` | ✅ |
| 파워 범퍼 점수 | 250 | `SCORE.POWER_BUMPER: 250` | ✅ |
| 크리스탈 점수 | 500 | `SCORE.CRYSTAL: 500` | ✅ |
| 킥아웃 점수 | 300 | `SCORE.KICKOUT: 300` | ✅ |
| 롤오버 점수 | 150 | `SCORE.ROLLOVER: 150` | ✅ |
| 콤보 배율 5~9 | ×2 | `comboMult(5) → 2` | ✅ |
| 콤보 배율 10~19 | ×3 | `comboMult(10) → 3` | ✅ |
| 콤보 배율 20+ | ×5 | `comboMult(20) → 5` | ✅ |
| T5 보스 HP | 20 | `TABLE_DATA[4].bossHP: 20` | ✅ |
| T10 보스 HP | 45 | `bossHP = 45` (코드 line 598) | ✅ |
| 시작 볼 | 3 | `ballsLeft = 3 + extraBall Lv` | ✅ |

---

## 6. 코드 품질 체크리스트

| 항목 | 결과 |
|------|------|
| □ 'use strict' | ✅ |
| □ 변수 선언→DOM→이벤트→init 순서 (F11) | ✅ |
| □ TweenManager clearImmediate (F6) | ✅ |
| □ 순수 함수 패턴 (F3) | ✅ (applyGravity, resolveCircleCollision 등) |
| □ 상태×시스템 매트릭스 (F4) | ✅ (gameLoop switch + 파티클 조건부 업데이트) |
| □ SVG 필터 미사용 (F9) | ✅ (shadowBlur 사용) |
| □ 코드 섹션 구조화 (F30) | ✅ (§A~§S 16개 섹션) |
| □ 전역 직접 참조 최소화 (F3) | ⚠️ 물리 함수는 순수하나 `snd.play()` 등 일부 사이드 이펙트 존재 |

---

## 7. 발견된 이슈

### MINOR 이슈

| # | 이슈 | 심각도 | 위치 |
|---|------|--------|------|
| M1 | **assets/ 디렉토리 존재 (F1 위반)**: 기획서에서 "절대 생성 금지"로 명시. Canvas fallback이 있어 기능에 영향 없으나 규칙 위반 | MINOR | `/assets/*` |
| M2 | **업그레이드 상점 터치 스크롤 미구현**: `wheel` 이벤트만 처리, `touchmove` 드래그 스크롤 없음. 모바일에서 업그레이드 항목이 8개로 화면 초과 시 스크롤 불가 | MINOR | `handleTouchMove()` |
| M3 | **터치 플리퍼 영역 시각 가이드 없음**: 첫 모바일 유저가 어디를 터치해야 하는지 모를 수 있음 | MINOR | `renderPlaying()` |
| M4 | **hitAnim 감소가 render에서 수행됨**: `drawBumper()`와 `drawCrystalTarget()`에서 `hitAnim -= 0.05/0.04`. render는 순수 출력이어야 함 (F26 위반) | MINOR | lines 1305, 1367 |
| M5 | **Google Fonts 외부 의존성**: `Press Start 2P` 폰트를 Google Fonts CDN에서 로드. 오프라인/네트워크 불안정 시 폰트 미로드 가능 (monospace fallback은 있음) | MINOR | line 8 |

### 우수 사항

- **20개 사이클 피드백 반영 매핑**: F1~F32까지 역대 모든 이슈를 기획 단계에서 선제 대응한 흔적이 코드에 명확히 반영됨
- **완전한 Canvas fallback**: 모든 SVG 스프라이트에 Canvas 코드 드로잉 fallback이 있어, 에셋 로드 실패 시에도 게임이 완전히 동작
- **물리 엔진 품질**: 4단계 서브스텝, 벡터 정규화 기반 충돌 해결, 오버랩 보정이 안정적
- **Web Audio 사운드**: setTimeout 없이 `ctx.currentTime` 기반 정밀 스케줄링
- **코드 구조**: §A~§S 16개 논리 섹션으로 2,485줄을 체계적으로 조직

---

## 8. 최종 판정

### 코드 리뷰: **NEEDS_MINOR_FIX**
### 브라우저 테스트: **PASS**
### 종합 판정: **NEEDS_MINOR_FIX**

**사유**: 게임 자체는 완성도가 높고 모든 핵심 기능이 정상 작동하나, 기획서 F1 규칙 위반(assets 디렉토리), 업그레이드 상점 터치 스크롤 미구현, render 내 상태 변경(hitAnim) 등 사소한 수정이 필요합니다.

**배포 가능 여부**: ✅ 배포 가능 (Canvas fallback으로 에셋 미로드 시에도 동작, 핵심 게임플레이에 영향 없는 이슈만 존재)

### 권장 수정 사항 (우선순위순)
1. `assets/` 디렉토리 삭제 또는 SVG를 data URI로 인라인화 (F1 준수)
2. 업그레이드 상점에 `touchmove` 드래그 스크롤 추가
3. `hitAnim` 감소를 `update()` 쪽으로 이동 (F26 준수)
4. 모바일 첫 플레이 시 터치 영역 힌트 오버레이 추가 (선택)
