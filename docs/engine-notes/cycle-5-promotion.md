# Cycle 5 엔진 승격 내역

_게임: painted-sky (물들인 하늘) — bullet-hell 장르_
_날짜: 2026-04-19_

---

## 승격

### 1. `IX.Genre.Shooter.BulletPatterns` → `public/engine/genres/shooter.js` (신규)

**출처**: `painted-sky/index.html` — `firePat()` 함수 내 7개 패턴 생성 로직
**승격 이유**: 극좌표 기반 탄막 패턴(radial, fan, doubleFan, spiral, aimed, rain, wave)은 모든 탄막 슈터/종스크롤 슈터에서 핵심 재사용 코드. 순수 데이터 생성기로 풀/렌더링과 완전 분리.

**API**:
- `new BulletPatterns({ speedScale: 100 })` — 속도 배율 설정
- `.radial(ox, oy, count, speed)` → `[{x,y,vx,vy}]`
- `.fan(ox, oy, targetAngle, count, spreadDeg, speed)`
- `.doubleFan(ox, oy, targetAngle, count, spreadDeg, speed)`
- `.spiral(ox, oy, arms, bulletsPerArm, speed, rotSpeed)` — 내부 spiralAngle 자동 증가
- `.aimed(ox, oy, targetAngle, count, spreadDeg, speed)`
- `.rain(areaW, count, speed)`
- `.wave(ox, oy, count, speed)`
- `.resetAngle()` — 게임 리셋 시 spiralAngle 초기화

### 2. `IX.Genre.Shooter.GrazeSystem` → `public/engine/genres/shooter.js`

**출처**: `painted-sky/index.html` — 그레이즈 판정 + 콤보 로직 (459~466행)
**승격 이유**: 근접 탄환에 대한 니어미스 보상은 탄막 슈터의 핵심 재미 요소. 히트/그레이즈 판정 + 콤보 배율 관리를 캡슐화.

**API**:
- `new GrazeSystem({ radius, baseScore, comboStep, maxComboMul })`
- `.check(px, py, hitR, bx, by, br, alreadyGrazed)` → `{hit, grazed, score}`
- `.resetCombo()` — 피격 시
- `.reset()` — 게임 리셋 시

---

## 보류 (이유)

### ~~1. EffectQueue~~ → **승격 완료** (3차 검증에서 `IX.EffectQueue`로 승격)

### 2. 패럴렉스 배경 시스템
- `drawBG()` — 3레이어 패럴렉스 스크롤
- **보류 이유**: 배경 키 하드코딩이 게임에 강하게 결합. 범용화하려면 레이어 설정 추상화 필요.

### 3. GrazeSystem의 게임 내 인라인 사용 유지
- painted-sky에서 GrazeSystem 클래스를 승격했으나, 기존 게임 코드에서 인라인 사용은 유지.
- 게임의 그레이즈는 파워업(grzPro), 시너지(spcMul), 메타 업그레이드(lifeGraze) 등과 복합적으로 결합되어 있어, 단순 `.check()` 대체만으로는 코드가 줄지 않음.
- 다음 슈터 게임에서 처음부터 GrazeSystem을 사용해 검증.

---

## 향후 후보

1. ~~**EffectQueue**~~ — ✅ 승격 완료 (`IX.EffectQueue`)
2. **Parallax** — 레이어 설정 추상화 후 `IX.Parallax` 또는 `IX.Genre.Shooter.Parallax`
3. **WarningLine** — 보스 공격 예고선 시스템. 슈터 외에도 턴제/액션에서 활용 가능
4. **PowerUpPicker** — 3택 파워업 UI + 시너지 체크. 로그라이트 계열에서 반복될 가능성 높음

---

## 2차 검증 (2026-04-20)

### 추가 승격: 없음

게임 코드(748줄)를 재검토한 결과, 기존 승격(BulletPatterns, GrazeSystem) 외에 즉시 승격할 후보 없음.

**검토한 추가 후보와 보류 이유:**

| 후보 | 줄 수 | 판정 | 이유 |
|---|---|---|---|
| burst/gravity/blackout/combined/pattern 패턴 타입 | ~50줄 | 보류 | `burst`는 `radial()`의 위치 변경, `gravity`/`blackout`은 탄 패턴이 아닌 플레이어 효과. `combined`는 게임별 보스 패턴 참조에 결합. 순수 데이터 생성기로 분리 어려움 |
| SPRITE_DIMS SVG workaround | ~6줄 | 보류 | Firefox/Safari에서 SVG `naturalWidth=0` 대응. Sprite 생성자가 이미 explicit `frameWidth/frameHeight`를 받으므로 엔진 변경 불필요. 게임별 대응이 적절 |
| Boss Phase FSM | ~40줄 | 향후 후보 추가 | HP 기반 페이즈 전환 + 3초 연출 + 패턴 순환. 2페이즈 보스는 5사이클 연속 사용(C1~C5)하므로 `IX.Genre.BossPhase` 후보. 단, 현재 보스마다 세부 로직이 달라 추상화 어려움 |
| 시너지 체크 시스템 | ~15줄 | 보류 | 카테고리별 카운트 + 임계값 트리거. 로그라이트에서 재사용 가능하나 1게임 |

### 적용 현황 확인

- ✅ `shooter.js` 파싱 정상 (`node -e "require(...)"` PASS)
- ✅ `ix-engine.js` 파싱 정상
- ✅ 게임이 `IX.Genre.Shooter.BulletPatterns` 올바르게 사용 (radial/fan/spiral/aimed/rain/wave/doubleFan)
- ⚠️ GrazeSystem은 인라인 유지 (의도적 — 파워업/시너지 복합 로직 결합)
- ℹ️ 다음 슈터 게임에서 GrazeSystem `.check()` API 우선 도입하여 실전 검증 필요

### 향후 후보 갱신

5. **Boss Phase FSM** — HP 임계값 기반 페이즈 전환 + 연출 + 패턴 사이클러. 5사이클 연속 2페이즈 보스 사용. C6에서 보스전이 있으면 추상화 시도

---

## 3차 검증 — EffectQueue 승격 실행 (2026-04-20)

### 추가 승격: `IX.EffectQueue` → `public/engine/ix-engine.js`

**출처**: painted-sky의 `effectQueue[]` + `updateEffects()` + `renderEffects()` + `spawnEffect()`

**판정 변경 근거**: 기존 "보류(1게임)" 판정이었으나, Cycle 1~4 코드 회고 시 모든 게임에서 일회성 시각 이펙트(히트 플래시, 사망 파티클, 폭발) 패턴이 반복적으로 구현됨. EffectQueue는 IX.Sprite에만 의존하는 순수 유틸리티이며, 게임 상태와 완전 독립.

**API**:
- `new EffectQueue()` — 생성
- `.add(sprite, x, y, size)` — 사전 생성된 Sprite 추가
- `.spawn(image, x, y, size, frames, fps, dims)` — 이미지로부터 Sprite 자동 생성+추가 (SVG naturalWidth=0 대응 dims 파라미터 포함)
- `.update(dt)` — 매 프레임 호출 (ms)
- `.render(ctx)` — 중심 좌표 기준 정사각 렌더
- `.clear()` — 전체 제거
- `.count` — 활성 이펙트 수 (getter)

**게임 측 변경 (painted-sky)**:
- `let effectQueue = []` → `const effectQueue = new EffectQueue()`
- `updateEffects(dt)` / `renderEffects(ctx)` 함수 정의 제거
- `spawnEffect()` 내부: 수동 Sprite 생성+push → `effectQueue.spawn(img, ..., dims)` 호출
- `effectQueue = []` (resetAll/GAME.enter) → `effectQueue.clear()`

**하위 호환**: 새 클래스 추가만. 기존 API 변경 없음. ✅

### 최종 검증 (engine-promote 절차)

- ✅ `ix-engine.js` 파싱 정상 (`node -e "new Function(code)"` PASS)
- ✅ `shooter.js` 파싱 정상
- ✅ 게임이 `IX.EffectQueue` 인스턴스 사용 (line 118: `const effectQueue = new EffectQueue()`)
- ✅ 게임이 `effectQueue.spawn()` / `.update()` / `.render()` / `.clear()` API 호출
- ✅ `effectQueue = []` 패턴 0건 (`.clear()` 사용)
- ✅ 게임이 `IX.Genre.Shooter.BulletPatterns` 올바르게 사용 (7개 패턴 타입)
- ⚠️ GrazeSystem은 인라인 유지 (파워업/시너지 복합 로직으로 `.check()` 대체 불가)

### 추가 승격 후보 재검토 (이번 라운드)

이번 engine-promote 절차에서 게임 코드 748줄 전수 검토 결과, **신규 승격 없음**.

| 후보 | 판정 | 이유 |
|---|---|---|
| `addWarningLine` / `generateWarnings` | 보류 | 게임 변수(`px`, `py`, `dc`, `BOSS`, `bPhase`)에 깊게 결합. 순수 함수로 분리 불가 |
| `drawBG` (패럴렉스) | 향후 | C4+C5에서 반복 사용되나 에셋 키/스테이지에 결합. 추상화 필요 |
| `firePat` (패턴 디스패처) | 보류 | BulletPatterns를 사용하는 게임별 glue code. 보스 데이터 구조에 종속 |
| SFX 함수 8종 | 보류 | `sound.tone()` 래퍼일 뿐. 게임마다 음색/주파수 상이 |

### C6 향후 후보 (갱신)

1. **Parallax** — 3레이어 배경 스크롤. C4(메트로배니아)+C5(탄막)에서 반복. 추상화 시도 가치 있음
2. **WarningLine** — 보스 공격 예고선. 슈터·액션에서 활용 가능
3. **PowerUpPicker** — 3택 UI + 카테고리 시너지. 로그라이트 계열에서 반복 예상
4. **Boss Phase FSM** — HP 임계값 기반 페이즈 전환. 5사이클 연속 2페이즈 보스 사용
5. **GrazeSystem 실전 검증** — 다음 슈터 게임에서 `.check()` API 우선 도입
