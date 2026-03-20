---
cycle: 7
game-id: mini-survivor-arena
title: "미니 서바이버 아레나"
reviewer: claude-qa
date: 2026-03-20
review-round: 2
verdict: APPROVED
code-review: APPROVED
test-result: PASS
---

# Cycle 7 — 미니 서바이버 아레나 코드 리뷰 & 테스트 결과 (2회차 재리뷰)

> 리뷰 일시: 2026-03-20 (2회차)
> 파일: `public/games/mini-survivor-arena/index.html` (1397행, 단일 HTML)
> 기획서: `docs/game-specs/cycle-7-spec.md`
> 이전 리뷰: 1회차 NEEDS_MINOR_FIX → 3건 이슈 지적

---

## 0. 이전 리뷰 지적사항 수정 검증

| # | 이전 이슈 | 심각도 | 수정 여부 | 검증 방법 |
|---|----------|--------|:--------:|----------|
| 1 | `assets/` 디렉토리 잔존 (SVG 9개 + manifest.json) | MUST FIX | ✅ **수정됨** | `Glob("public/games/mini-survivor-arena/assets/**/*")` → "No files found" |
| 2 | 전투/충돌 함수의 전역 P 직접 참조 | WARN | ✅ **수정됨** | 코드 검증: `updateEnemies(dt,target)` L370, `fireWeapon(dt,pl)` L533, `hitProjEnemy(pl)` L459, `hitEnemyPlayer(pl)` L490, `pickGems(dt,pl)` L504 — 모두 파라미터화 완료 |
| 3 | 조이스틱 내부 노브 반지름 18px | WARN | ✅ **수정됨** | L1124: `ctx.arc(jcx,jcy,24,...)` — 18px → 24px (직경 48px ≥ 44px 권장) |

**결론: 1회차에서 지적한 3건 모두 정확히 수정 완료.**

---

## 1. 코드 리뷰 (정적 분석)

### 1.1 기능 완성도 체크리스트 (기획서 §1~§14 대조)

| # | 기획서 항목 | 구현 | 비고 |
|---|------------|:----:|------|
| 1 | 7개 게임 상태 (TITLE/PLAYING/WAVE_PREP/LEVELUP/PAUSE/GAMEOVER/VICTORY) | ✅ | `enterState()` + `STATE_PRIORITY` 매트릭스 완전 구현 |
| 2 | 월드(1600x1600) + 뷰포트(800x800) + 카메라 lerp | ✅ | `updateCam()` 순수 함수, lerp 0.1 |
| 3 | 플레이어 자동 공격 + 이동 전용 조작 | ✅ | `fireWeapon(dt,pl)` 최근접 적 자동 조준 |
| 4 | 적 4종 (일반/빠른/탱커/원거리) | ✅ | 각 고유 AI, 형태, 색상 (기획서 §6.2 일치) |
| 5 | 보스 3페이즈 AI (돌진/방사탄/소환) | ✅ | HP 비율 기반 전환, 스크린 셰이크 포함 |
| 6 | 12종 스킬 시스템 + 레벨업 카드 선택 | ✅ | SKILLS 배열 12종, `pickSkills()` + `applySkill()` |
| 7 | 20웨이브 스케일링 (선언적 config) | ✅ | `waveCfg(w)` 순수 함수 |
| 8 | 콤보 시스템 (2초 타임아웃, x3.0 캡) | ✅ | HUD 5+ 강조 표시 |
| 9 | 일일 챌린지 (시드 기반 RNG) | ✅ | `dateSeed()` djb2 + `seededRng()` LCG |
| 10 | 난이도 모드 (Normal/Hard) | ✅ | Hard: HP x1.5, 스킬 선택지 2개 |
| 11 | XP 젬 + 자석 시스템 | ✅ | 기본 40px + 스킬 최대 +150px |
| 12 | 오비탈/충격파/번개 특수 스킬 | ✅ | 각각 독립 update 함수, 모두 pl 파라미터화 |
| 13 | 미니맵 (우하단 80x80) | ✅ | 플레이어 + 보스 + 뷰포트 범위 표시 |
| 14 | 보스 HP 바 (상단) | ✅ | `drawBossBar()` |
| 15 | 무적 시간 (iFrame 0.5초) | ✅ | 깜빡임 애니메이션 포함 |
| 16 | 적 넉백 | ✅ | 감쇠 방식 (0.85 factor) |
| 17 | 플로팅 데미지 텍스트 | ✅ | 크리티컬: 노란색/큰 폰트 |
| 18 | 스크린 셰이크 | ✅ | 카메라 오프셋 + 감쇠 |
| 19 | Web Audio 절차적 사운드 (9종) | ✅ | shoot/hit/kill/gem/lvup/boss/phit/go/victory |
| 20 | 관대한 히트박스 (시각 12px, 피격 8px) | ✅ | §6.2 준수 |

### 1.2 금지 패턴 검사 (§13.1)

| # | 금지 패턴 | 결과 | 비고 |
|---|----------|:----:|------|
| 1 | 외부 에셋 참조 (src=, href=) | ✅ PASS | HTML 내 외부 리소스 참조 0건 |
| 2 | Google Fonts | ✅ PASS | 시스템 폰트 스택 사용 |
| 3 | SVG 필터 (feGaussianBlur 등) | ✅ PASS | 없음 |
| 4 | setTimeout 상태 전환 | ✅ PASS | 없음 |
| 5 | confirm() / alert() | ✅ PASS | 없음 |
| 6 | assets/ 디렉토리 존재 | ✅ **PASS** | ~~1회차 FAIL~~ → **삭제 완료** |
| 7 | 전역 직접 참조 함수 | ✅ **PASS** | ~~1회차 WARN~~ → **전투/충돌 함수 모두 파라미터화** (drawEnemies 내 P 참조는 렌더링 전용으로 허용) |

### 1.3 필수 패턴 검사 (§13.2)

| # | 필수 패턴 | 결과 | 위치 |
|---|----------|:----:|------|
| 1 | `enterState()` | ✅ | L664 정의, 전체 18곳에서 호출 |
| 2 | `clearImmediate()` | ✅ | L100 정의, `enterState()` L667에서 호출 |
| 3 | `try…localStorage` | ✅ | `saveBest()` L712, `loadBest()` L720, `loadDaily()` L721 |
| 4 | `isTransitioning` / `isWaveClearing` | ✅ | L238 선언, 가드 조건 6곳 |
| 5 | addEventListener + removeEventListener | ✅ | `listen()` L132 / `destroyListeners()` L133 |
| 6 | `devicePixelRatio` | ✅ | L213 `resize()` 내 DPR 대응 |
| 7 | `inputMode` 분기 실사용 | ✅ | 8곳 이상 조건 분기 (타이틀, 레벨업, 일시정지, 게임오버 등) |

### 1.4 게임 루프 & 성능

| 항목 | 결과 | 비고 |
|------|:----:|------|
| requestAnimationFrame | ✅ | L1320 `requestAnimationFrame(loop)` |
| delta time + cap | ✅ | L1321 `DT_CAP = 0.05` (50ms) |
| 매 프레임 DOM 접근 없음 | ✅ | Canvas 전용 렌더링 |
| ObjectPool 4종 | ✅ | 적(150), 투사체(200), 젬(200), 파티클(300) |
| offscreen canvas 격자 캐시 | ✅ | `buildGrid()` L221 256x256 타일 |
| 뷰포트 기반 렌더링 컬링 | ✅ | `inView()` L348 |
| 원거리 적 재스폰 (성능 보호) | ✅ | `cullFar(pl)` L870, 1200px 이상 |

### 1.5 충돌 감지

| 항목 | 결과 | 비고 |
|------|:----:|------|
| 원형 충돌 (circHit) | ✅ | L145, 제곱 거리 비교 (sqrt 회피) |
| 관대한 히트박스 | ✅ | 시각 12px, 피격 8px |
| 투사체 vs 적 + 관통 | ✅ | `hitProjEnemy(pl)` L459 — 파라미터화 |
| 적 vs 플레이어 + iFrame | ✅ | `hitEnemyPlayer(pl)` L490 — 파라미터화 |
| 적 투사체 vs 플레이어 | ✅ | `hitEProjPlayer(pl)` L477 — 파라미터화 |
| 젬 흡수 (자석 + 가속) | ✅ | `pickGems(dt,pl)` L504 — 파라미터화 |

### 1.6 상태 x 시스템 매트릭스 검증 (§5.3)

코드의 `switch(state)` 구문(L1329~1377)과 기획서 §5.3 매트릭스를 대조 검증:

| 시스템 | TITLE | PLAYING | WAVE_PREP | LEVELUP | PAUSE | GAMEOVER | VICTORY |
|--------|:-----:|:-------:|:---------:|:-------:|:-----:|:--------:|:-------:|
| tw.update() | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| 플레이어 이동 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 무기 발사 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 투사체 이동 | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 적 이동/스폰 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 충돌 판정 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 파티클 | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |

**결과**: 기획서 §5.3 매트릭스와 코드 구현이 **정확히 일치**.

### 1.7 순수 함수 검증 (§10 — 2회차 중점 검증)

| 함수 | 시그니처 | 전역 참조 | 결과 |
|------|---------|----------|:----:|
| `updatePlayer` | `(p, dx, dy, dt, bnd)` | 없음 | ✅ |
| `updateCam` | `(c, tx, ty, vw, vh, ww, wh, sm)` | 없음 | ✅ |
| `calcXp` | `(lv)` | 없음 | ✅ |
| `waveCfg` | `(w)` | 없음 | ✅ |
| `calcDmg` | `(base, critCh)` | `rng` (설계 의도) | ✅ |
| `pickSkills` | `(pool, owned, count)` | `rng` (설계 의도) | ✅ |
| `spawnPos` | `(px, py, margin)` | `rng` (설계 의도) | ✅ |
| `circHit` | `(ax, ay, ar, bx, by, br)` | 없음 | ✅ |
| `updateEnemies` | `(dt, target)` | 없음 (~~1회차: 전역 P~~) | ✅ **수정됨** |
| `fireWeapon` | `(dt, pl)` | 없음 (~~1회차: 전역 P, enemies~~) | ✅ **수정됨** |
| `hitProjEnemy` | `(pl)` | 없음 (~~1회차: 전역 P~~) | ✅ **수정됨** |
| `hitEnemyPlayer` | `(pl)` | 없음 (~~1회차: 전역 P~~) | ✅ **수정됨** |
| `hitEProjPlayer` | `(pl)` | 없음 | ✅ |
| `pickGems` | `(dt, pl)` | 없음 (~~1회차: 전역 P~~) | ✅ **수정됨** |
| `updateOrbitals` | `(dt, pl)` | 없음 | ✅ |
| `updateShock` | `(dt, pl)` | 없음 | ✅ |
| `updateLight` | `(dt, pl)` | 없음 | ✅ |
| `updateRegen` | `(dt, pl)` | 없음 | ✅ |
| `updateSpawn` | `(dt, pl)` | 없음 | ✅ |
| `cullFar` | `(pl)` | 없음 | ✅ |

**참고**: `rng`는 일일 챌린지 시드 시스템 설계 의도에 따라 전역 함수 참조 허용. 메인 루프(L1335~1351)에서 모든 호출이 `P`를 명시적 파라미터로 전달.

### 1.8 보안

| 항목 | 결과 |
|------|:----:|
| eval() 사용 | ✅ 없음 |
| innerHTML 미사용 | ✅ (Canvas 전용) |
| XSS 위험 | ✅ 없음 |
| 외부 스크립트 로드 | ✅ 없음 |

---

## 2. 모바일 조작 대응 검사

| # | 검사 항목 | 결과 | 비고 |
|---|----------|:----:|------|
| 1 | touchstart 이벤트 등록 | ✅ PASS | L772, `{passive:false}` |
| 2 | touchmove 이벤트 등록 | ✅ PASS | L795, `{passive:false}` |
| 3 | touchend 이벤트 등록 | ✅ PASS | L808, `{passive:false}` |
| 4 | 가상 조이스틱 UI | ✅ PASS | L1120~1126, 외곽 원 50px 반지름 + 내부 노브 **24px** 반지름 |
| 5 | 터치 영역 >= 44px | ✅ **PASS** | ~~1회차 WARN~~ → 노브 직경 48px ≥ 44px 충족, 외곽 100px |
| 6 | 모바일 뷰포트 meta 태그 | ✅ PASS | `width=device-width,initial-scale=1.0,user-scalable=no` |
| 7 | 스크롤 방지 (touch-action) | ✅ PASS | CSS `touch-action:none` + `overflow:hidden` (L9) |
| 8 | `-webkit-touch-callout: none` | ✅ PASS | L9 |
| 9 | `-webkit-user-select: none` | ✅ PASS | L9 |
| 10 | `e.preventDefault()` 호출 | ✅ PASS | touchstart/touchmove/touchend 모두 호출 |
| 11 | 키보드 없이 플레이 가능 | ✅ PASS | 터치로 시작/이동/스킬선택/재시작 모두 가능 |
| 12 | inputMode 자동 감지 | ✅ PASS | 첫 keydown → 'keyboard', 첫 touchstart → 'touch' |
| 13 | 모드별 UI 힌트 분기 | ✅ PASS | 'TAP TO START' vs 'PRESS ENTER OR SPACE' 등 8곳 이상 |
| 14 | 터치 좌표 변환 | ✅ PASS | getBoundingClientRect + scaleX/scaleY 정규화 |

---

## 3. 에셋 로딩 검사

| 항목 | 결과 | 비고 |
|------|:----:|------|
| assets/ 디렉토리 존재 여부 | ✅ **삭제됨** | ~~1회차: SVG 9개 + manifest.json 잔존~~ → Glob 검증 0건 |
| 코드에서 에셋 참조 여부 | ✅ 미참조 | HTML 내 에셋 경로/로딩 코드 0건 |
| Canvas 코드 드로잉 100% | ✅ | 모든 오브젝트가 Canvas API로 드로잉 |

---

## 4. 브라우저 테스트 (Puppeteer)

### 테스트 환경
- 브라우저: Chromium (Puppeteer headless)
- 해상도: 800x600
- URL: `file:///C:/Work/InfiniTriX/public/games/mini-survivor-arena/index.html`

### 테스트 결과

| # | 항목 | 결과 | 비고 |
|---|------|:----:|------|
| 1 | 페이지 로드 | ✅ PASS | 에러 없이 즉시 로드 |
| 2 | 콘솔 에러 없음 | ✅ PASS | 에러/경고 0건 |
| 3 | 캔버스 렌더링 | ✅ PASS | DPR 대응, 리사이즈 대응 |
| 4 | 타이틀 화면 | ✅ PASS | 한글 제목 + 영문 부제 + 별 배경 + 적 애니메이션 + 조작법 + 일일챌린지/난이도 |
| 5 | PLAYING 전환 | ✅ PASS | state='PLAYING', 플레이어/격자/HUD/미니맵 정상 |
| 6 | 적 스폰 & 자동 공격 | ✅ PASS | 적 6체 활성 + 투사체 발사 + XP 젬 드롭 확인 |
| 7 | HUD 표시 | ✅ PASS | HP바 10/10, XP바 Lv.1, Wave 1/20, Score, 미니맵 |
| 8 | GAMEOVER 화면 | ✅ PASS | "GAME OVER" + 점수(55) + 웨이브(1/20) + NEW RECORD + 재시작 안내 |
| 9 | localStorage 저장 | ✅ PASS | `msa_best` 키에 55 저장 확인 |
| 10 | 게임오버 → TITLE 복귀 | ✅ PASS | enterState('TITLE') 정상 전환 |
| 11 | 터치 이벤트 코드 | ✅ PASS | touchstart/touchmove/touchend 3종 등록 (이벤트 8건 총 등록) |

### 검증된 런타임 상태
```
state: TITLE → PLAYING → GAMEOVER → TITLE (전 전환 정상)
Canvas: 800x600, DPR=1
TweenManager: ✅
ObjectPool: ✅
enterState(): ✅
SKILLS: 12종 ✅
AudioContext: created ✅
listen/destroyListeners: ✅ (8건 등록)
STATE_PRIORITY: [TITLE,PLAYING,WAVE_PREP,LEVELUP,PAUSE,GAMEOVER,VICTORY] ✅
콘솔 에러: 0건 ✅
```

---

## 5. 발견된 이슈

**이슈 없음.** 1회차에서 지적된 3건 모두 수정 완료, 신규 이슈 발견되지 않음.

### 참고 사항 (이슈 아님)

- `drawEnemies()` L960에서 `P.x`, `P.y`를 참조하여 빠른 적(fast)의 방향 삼각형을 그리는 데 사용. 이는 **렌더링 함수**이므로 순수 함수 원칙(§10) 적용 범위 외. 동작에 문제 없음.

---

## 6. 최종 판정

| 항목 | 판정 |
|------|------|
| **코드 리뷰** | **APPROVED** |
| **브라우저 테스트** | **PASS** |
| **종합 판정** | **✅ APPROVED** |

### 판정 사유

1회차 리뷰에서 지적한 **3건 이슈 모두 정확히 수정** 완료:
- `assets/` 디렉토리 완전 삭제 (§13.1 #6 준수)
- 전투/충돌 함수 5개 모두 플레이어를 파라미터로 전달 (§10 순수 함수 원칙 준수)
- 조이스틱 노브 48px 직경으로 44px 터치 타겟 기준 충족

게임은 기획서의 **모든 핵심 기능**을 정확하게 구현:
- 7개 상태 머신 + TransitionGuard + 가드 플래그 3종
- 4종 적 + 보스 3페이즈 AI
- 12종 스킬 + 레벨업 카드 선택
- 20웨이브 선언적 스케일링 + 콤보 시스템
- 일일 챌린지 (시드 RNG) + Normal/Hard 난이도
- 모바일 터치 가상 조이스틱 + inputMode 분기
- Web Audio 절차적 사운드 9종
- ObjectPool 4종 + offscreen 격자 캐시 + 뷰포트 컬링
- localStorage 안전 저장 (try-catch)
- 콘솔 에러 0건, 외부 에셋 0건, 보안 위험 0건

**즉시 배포 가능합니다.**

---

_리뷰 완료: 2026-03-20 (2회차)_
_리뷰어: Claude QA Agent_
