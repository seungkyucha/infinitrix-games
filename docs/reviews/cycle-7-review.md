# Cycle 7 코드 리뷰 & 브라우저 테스트 — mini-survivor-arena

> 리뷰 일시: 2026-03-20
> 게임: 미니 서바이버 아레나 (`mini-survivor-arena`)
> 파일: `public/games/mini-survivor-arena/index.html` (2213줄, 76.8KB)

---

## 1. 코드 리뷰 (정적 분석)

### 1.1 기능 완성도 체크 (기획서 §1~§14 대조)

| 기능 | 구현 | 비고 |
|------|:----:|------|
| 8방향 이동 (WASD/방향키) | ✅ | 정규화 포함 |
| 자동 공격 (에너지 볼트) | ✅ | 최근접 적 방향 부채꼴 |
| 20웨이브 서바이벌 | ✅ | WAVE_COUNT=20, 웨이브 클리어/VICTORY |
| 적 4유형 (일반/빠른/탱커/원거리) | ✅ | 각 고유 AI, 형태, 색상 |
| 보스 3페이즈 AI | ✅ | 돌진→방사탄→소환, HP 비례 전환 |
| 레벨업 스킬 선택 (12종) | ✅ | 3개 랜덤 카드 UI, 1/2/3 키 또는 클릭 |
| 콤보 시스템 | ✅ | 2초 타임아웃, ×3.0 최대 |
| XP 젬 드롭/흡수 | ✅ | 자석 반경, 가속 이동 |
| 일일 챌린지 (시드 RNG) | ✅ | seededRng(), 타이틀에서 C키 토글 |
| 난이도 모드 (Normal/Hard) | ✅ | H키 토글, 적 HP ×1.5, 스킬 선택지 2개 |
| 일시정지 (P/ESC) | ✅ | |
| 가상 조이스틱 (터치) | ✅ | touchstart/move/end/cancel 처리 |
| Web Audio 절차적 사운드 (9종) | ✅ | shoot/hit/kill/gem/levelup/playerHit/gameover/victory/boss |
| 최고점 localStorage 저장 | ✅ | try-catch 래핑, "판정 먼저 저장 나중에" |
| 일일 챌린지 최고점 저장 | ✅ | dailyChallenge_YYYYMMDD 키 |
| 오비탈/충격파/번개 스킬 | ✅ | 모두 구현 |
| HP 회복/방어력/넉백/크리티컬 | ✅ | 스킬 적용 로직 완비 |
| 화면 흔들림 (Screen Shake) | ✅ | |
| 플로팅 데미지 텍스트 | ✅ | 크리티컬 시 노란색 강조 |

### 1.2 아키텍처 체크

| 항목 | 판정 | 비고 |
|------|:----:|------|
| 게임 루프 (rAF + dt cap) | ✅ PASS | `requestAnimationFrame`, DT_CAP=50ms |
| 상태 머신 (7 상태) | ✅ PASS | TITLE/PLAYING/WAVE_PREP/LEVELUP/PAUSE/GAMEOVER/VICTORY |
| `enterState()` 전환 함수 | ✅ PASS | TransitionGuard, STATE_PRIORITY |
| `clearImmediate()` 호출 | ✅ PASS | enterState() 진입부에서 호출 |
| 가드 플래그 3종 | ✅ PASS | isTransitioning, isWaveClearing, isLevelingUp |
| TweenManager (deferred 삭제) | ✅ PASS | _toRemove 역순 splice |
| ObjectPool 4종 | ✅ PASS | 적100, 투사체200, 젬200, 파티클300 |
| EventManager (listen/destroy) | ✅ PASS | 등록/해제 쌍 |
| 순수 함수 패턴 (§10) | ✅ PASS | updatePlayer, checkCircleCollision 등 파라미터 전달 |
| inputMode 분기 실사용 | ✅ PASS | 타이틀/GAMEOVER/VICTORY 텍스트 분기, 조이스틱 렌더 |
| DPR 대응 | ✅ PASS | `devicePixelRatio`, setTransform |
| 오프스크린 격자 캐시 | ✅ PASS | buildGridCache() |
| 상태 × 시스템 매트릭스 | ✅ PASS | §5.3 매트릭스와 코드 switch문 일치 |

### 1.3 금지 패턴 검사 (§13.1)

| # | 금지 패턴 | 판정 | 비고 |
|---|----------|:----:|------|
| 1 | 외부 에셋 참조 | ⚠️ **FAIL** | `ASSET_MAP`에서 `assets/*.svg` 8개 참조. preloadAssets()로 로드 |
| 2 | Google Fonts | ✅ PASS | 미사용 |
| 3 | SVG 필터 | ✅ PASS | 미사용 |
| 4 | setTimeout 상태 전환 | ✅ PASS | tween onComplete만 사용 |
| 5 | confirm/alert | ✅ PASS | 미사용 |
| 6 | **assets/ 디렉토리 존재** | ❌ **FAIL** | `assets/` 폴더에 SVG 9개 + manifest.json 존재 |
| 7 | 전역 직접 참조 함수 | ⚠️ WARN | `damageEnemy()`에서 `player.critChance` 전역 참조 (경미) |

### 1.4 필수 포함 패턴 검사 (§13.2)

| # | 필수 패턴 | 판정 |
|---|----------|:----:|
| 1 | `enterState(` | ✅ |
| 2 | `clearImmediate(` | ✅ |
| 3 | `try.*localStorage` | ✅ |
| 4 | `isTransitioning` / `isWaveClearing` | ✅ |
| 5 | `addEventListener` + `removeEventListener` | ✅ |
| 6 | `devicePixelRatio` | ✅ |
| 7 | `inputMode` 분기 실사용 | ✅ |

### 1.5 에셋 관련 상세 분석

**발견된 문제:**
`assets/` 디렉토리에 다음 파일이 존재합니다:
- `player.svg`, `enemy.svg`, `bg-layer1.svg`, `bg-layer2.svg`
- `ui-heart.svg`, `ui-star.svg`, `powerup.svg`, `effect-hit.svg`
- `thumbnail.svg`, `manifest.json`

**코드 내 참조:**
- `§6. ASSET PRELOADER` (L283~308): `ASSET_MAP` 객체로 8개 SVG 파일 경로 매핑
- `preloadAssets()`: Image 객체로 비동기 로드, onerror 시 fallback (게임 진행 가능)
- 렌더링에서 `SPRITES.player`, `SPRITES.enemy`, `SPRITES.bgLayer1/2`, `SPRITES.uiHeart/Star`, `SPRITES.powerup`, `SPRITES.effectHit` 조건부 사용

**영향 범위:**
- `renderPlayer()` L1547: SVG가 있으면 drawImage, 없으면 Canvas 원+삼각형 fallback
- `renderEnemies()` L1579: normal 적만 SVG, 나머지는 Canvas
- `renderBackground()` L1509~1520: bgLayer1/2 parallax, 없으면 grid만 표시
- `renderHUD()` L1756, L1790: 하트/별 아이콘, 없으면 텍스트 fallback
- `renderLevelUp()` L2002: powerup 장식, 없으면 무시
- `killEnemy()` L957: effectHit 파티클, 없으면 무시

**판정:** 기획서 §4는 "100% Canvas 코드 드로잉", §13은 "assets/ 디렉토리 미생성 원칙"을 명시합니다. SVG 에셋 사용은 **기획서 위반**입니다. 다만 모든 SVG에 Canvas fallback이 존재하므로 에셋 삭제 후에도 게임 기능은 정상 동작합니다.

### 1.6 기타 발견 사항

| # | 유형 | 설명 | 심각도 |
|---|------|------|--------|
| M1 | 기획서 위반 | `assets/` 디렉토리 + SVG 에셋 + preloader 코드 존재 | **MAJOR** |
| M2 | 경미 | `damageEnemy()`에서 `player.critChance` 전역 직접 참조 (§10 순수함수 원칙 위반) | MINOR |
| M3 | 경미 | `checkGemPickup()`에서 `GEM_ACCEL * 0.016` 하드코딩 (dt를 파라미터로 받지 않음) | MINOR |
| M4 | 경미 | `updateLightning()`에서 `Math.random()` 사용 — 일일 챌린지 시 시드 RNG(`rng`) 사용해야 일관성 보장 | MINOR |
| M5 | 개선 | `critChance` 초기값이 0이므로 스킬 Lv1 시 `0.05 + 0.10 = 0.15` (기획서 15% 일치), Lv2=0.20, Lv3=0.25 — 기획서는 Lv3=30%이므로 **불일치** | MINOR |

---

## 2. 브라우저 테스트 (Puppeteer)

### 테스트 환경
- 브라우저: Chromium (Puppeteer headless)
- 해상도: 800×600
- 테스트 URL: `file:///C:/Work/InfinitriX/public/games/mini-survivor-arena/index.html`

### 2.1 테스트 결과

| 항목 | 결과 | 비고 |
|------|:----:|------|
| 페이지 로드 | ✅ PASS | 정상 로드, Loading → TITLE 전환 |
| 콘솔 에러 없음 | ✅ PASS | 에러/경고 0건 |
| 캔버스 렌더링 | ✅ PASS | 800×600, DPR=1 적용 |
| 시작 화면 표시 | ✅ PASS | 제목, 서브타이틀, 시작 프롬프트, 난이도/챌린지 옵션, 조작법 힌트 |
| PLAYING 상태 전환 | ✅ PASS | Enter 키로 게임 시작, 적 스폰, 자동 공격 확인 |
| HUD 렌더링 | ✅ PASS | HP 바, XP 바, 점수, 웨이브 표시 |
| 점수 시스템 | ✅ PASS | 적 처치 시 점수 증가 확인 (score=40) |
| GAMEOVER 전환 | ✅ PASS | HP=0 시 GAMEOVER 상태 전환, 오버레이 표시 |
| localStorage 최고점 | ✅ PASS | bestSaved=40 저장 확인, NEW RECORD 표시 |
| 게임오버/재시작 | ✅ PASS | "R / ENTER 로 타이틀" 프롬프트 표시 |
| 터치 이벤트 코드 존재 | ✅ PASS | touchstart/move/end/cancel + 가상 조이스틱 렌더 |
| SVG 에셋 로드 | ⚠️ INFO | 8개 SVG 모두 로드 성공 (SPRITES에 8개 Image) |

### 2.2 스크린샷

1. **타이틀 화면**: 글리치 이펙트 제목, 스캔라인 배경, 파티클 애니메이션, 난이도/챌린지 옵션
2. **플레이 화면**: 플레이어(SVG), 격자 배경, HUD(하트/별 SVG 아이콘), 투사체/적 렌더링
3. **게임오버 화면**: 붉은 비네팅, 점수/통계, NEW RECORD, 재시작 안내

---

## 3. 필요 수정 사항

### MAJOR (반드시 수정)

#### M1. assets/ 디렉토리 삭제 + 에셋 코드 제거
- **문제**: 기획서 §4 "100% Canvas 코드 드로잉", §13 "assets/ 디렉토리 미생성 원칙" 위반
- **수정 방법**:
  1. `public/games/mini-survivor-arena/assets/` 디렉토리 전체 삭제
  2. `ASSET_MAP` 객체 제거 (L286~295)
  3. `preloadAssets()` 함수 제거 (L297~308)
  4. `SPRITES` 객체 제거 (L285)
  5. `init()` 내 `await preloadAssets()` 제거 (L2197)
  6. 모든 `if (SPRITES.xxx)` 조건 분기 제거, fallback(Canvas) 코드만 남김:
     - `renderPlayer()` L1547~1548 → Canvas 원+삼각형만
     - `renderEnemies()` L1579~1580 → Canvas만
     - `renderBackground()` L1509~1520 → gridCanvas만
     - `renderHUD()` L1756~1758, L1790~1792 → 텍스트 아이콘만
     - `renderLevelUp()` L2002~2006 → 제거
     - `killEnemy()` L957~965 → 'spriteHit' 파티클 타입 제거
     - `renderParticles()` L1735~1738 → 'spriteHit' 분기 제거
  7. `init()`에서 Loading 표시 간소화 (async 불필요)

### MINOR (권장 수정)

#### M2. `damageEnemy()` 순수 함수화
- `calcDamage(baseDmg, player.critChance, 2)` → `critChance`를 파라미터로 전달

#### M3. `checkGemPickup()` dt 파라미터 추가
- `GEM_ACCEL * 0.016` → `GEM_ACCEL * dt` (실제 delta time 사용)

#### M4. `updateLightning()` 시드 RNG 사용
- `Math.random()` → `rng()` (일일 챌린지 일관성)

#### M5. 크리티컬 스킬 수치 보정
- 현재: `lv * 0.05 + 0.10` → Lv3 = 25%
- 기획서: Lv3 = 30%
- 수정: `lv * 0.05 + 0.10` → `0.10 + lv * (20/3)/100` 또는 단순히 Lv별 매핑

---

## 4. 최종 판정

### 코드 리뷰 판정: **NEEDS_MAJOR_FIX**

**사유**: `assets/` 디렉토리와 SVG 에셋 파일이 존재하며, 코드에서 이를 로드·사용하는 구조가 기획서의 핵심 원칙("외부 에셋 0개", "100% Canvas 코드 드로잉", "assets/ 디렉토리 미생성")을 위반합니다. Canvas fallback이 모두 구현되어 있어 게임 자체는 에셋 없이도 동작하지만, 에셋 디렉토리와 관련 코드의 삭제가 필수입니다.

### 테스트 판정: **PASS**

**사유**: 페이지 로드, 캔버스 렌더링, 게임 루프, 상태 전환(TITLE→PLAYING→GAMEOVER), 점수 시스템, localStorage 저장, HUD 표시, 터치 이벤트 코드 등 모든 핵심 기능이 정상 동작합니다. 콘솔 에러 0건.

### 종합: **NEEDS_MAJOR_FIX**

> assets/ 디렉토리 삭제 + ASSET_MAP/preloadAssets/SPRITES 관련 코드 제거 후 재검토 필요.
> MINOR 이슈 4건은 동시 수정 권장.
