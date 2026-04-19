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

### 1. EffectQueue (스프라이트 기반 일회성 이펙트 큐)
- `spawnEffect()`, `updateEffects()`, `renderEffects()` — 단 36줄
- **보류 이유**: 1개 게임에서만 사용. RPG/액션 등에서 재사용 가능하나, 2게임 이상 검증 후 승격.

### 2. 패럴렉스 배경 시스템
- `drawBG()` — 3레이어 패럴렉스 스크롤
- **보류 이유**: 배경 키 하드코딩이 게임에 강하게 결합. 범용화하려면 레이어 설정 추상화 필요.

### 3. GrazeSystem의 게임 내 인라인 사용 유지
- painted-sky에서 GrazeSystem 클래스를 승격했으나, 기존 게임 코드에서 인라인 사용은 유지.
- 게임의 그레이즈는 파워업(grzPro), 시너지(spcMul), 메타 업그레이드(lifeGraze) 등과 복합적으로 결합되어 있어, 단순 `.check()` 대체만으로는 코드가 줄지 않음.
- 다음 슈터 게임에서 처음부터 GrazeSystem을 사용해 검증.

---

## 향후 후보

1. **EffectQueue** — 2개 이상 게임에서 확인되면 `IX.EffectQueue`로 승격
2. **Parallax** — 레이어 설정 추상화 후 `IX.Parallax` 또는 `IX.Genre.Shooter.Parallax`
3. **WarningLine** — 보스 공격 예고선 시스템. 슈터 외에도 턴제/액션에서 활용 가능
4. **PowerUpPicker** — 3택 파워업 UI + 시너지 체크. 로그라이트 계열에서 반복될 가능성 높음
