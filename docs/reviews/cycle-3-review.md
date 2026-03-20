# Cycle 3 코드 리뷰 & 테스트 결과

> **게임:** 미니 타워 디펜스 (mini-tower-defense)
> **리뷰일:** 2026-03-20
> **리뷰어:** Claude (QA / Senior Game Developer)
> **기획서:** `docs/game-specs/cycle-3-spec.md`

---

## 🔴 코드 리뷰 판정: NEEDS_MAJOR_FIX

## 🔴 테스트 판정: FAIL

---

## 1. 코드 리뷰 (정적 분석)

### ✅ PASS 항목

| 항목 | 결과 | 비고 |
|------|------|------|
| 게임 루프 | ✅ PASS | `requestAnimationFrame` 사용, `dt` 최대 50ms 캡 적용 |
| 상태 머신 (7상태) | ✅ PASS | LOADING → TITLE → WAVE_PREP → PLAYING → PAUSE → CONFIRM_MODAL → GAMEOVER 전체 구현 |
| TweenManager 모든 상태 업데이트 | ✅ PASS | 6개 상태(LOADING 제외) 모두 `tw.update(dt)` 호출 확인 |
| 이징 함수 5종 | ✅ PASS | linear, easeOutQuad, easeInQuad, easeOutBack, easeOutElastic 모두 구현 |
| setTimeout 사용 금지 | ✅ PASS | 실제 코드에 setTimeout 호출 0건 (주석 내 언급만 존재) |
| eval() 미사용 | ✅ PASS | eval 호출 0건 |
| alert/confirm/prompt 미사용 | ✅ PASS | Canvas 모달로 대체, 금지 API 0건 |
| 점수 판정→저장 순서 | ✅ PASS | `isNewBest = score > getBest()` → `saveBest(score, wave)` 순서 정확 (§7.2 준수) |
| localStorage try-catch | ✅ PASS | `getBest()`, `getBestWave()`, `saveBest()` 모두 try-catch 래핑 |
| ObjectPool 패턴 | ✅ PASS | 적(30), 투사체(50), 파티클(80) 풀링 구현, 역순 순회 + splice |
| destroy() 패턴 | ✅ PASS | `cancelAnimationFrame`, 리스너 전체 해제, `tw.cancelAll()`, `audioCtx.close()` |
| listen() 헬퍼 | ✅ PASS | `registeredListeners[]`에 등록, destroy()에서 일괄 해제 |
| Web Audio SFX | ✅ PASS | 4종 효과음(shoot×3, kill, wave, gameover), try-catch 래핑, PLAYING에서만 재생 |
| DPR 대응 | ✅ PASS | `window.devicePixelRatio` 기반 캔버스 내부 해상도 조정 |
| 캔버스 리사이즈 | ✅ PASS | `window.resize` 이벤트에 `resize()` 등록, 동적 스케일 |
| 터치 이벤트 | ✅ PASS | `touchstart`, `touchmove` 구현, `{ passive: false }` 적용 |
| 입력 모드 자동 감지 | ✅ PASS | `inputMode = 'mouse' / 'touch'` 자동 전환 |
| 오프스크린 배경 캐시 | ✅ PASS | `buildBgCache()`로 배경을 별도 캔버스에 사전 렌더링 |
| 상태×시스템 매트릭스 주석 | ✅ PASS | 코드 상단에 매트릭스 테이블 주석으로 포함 |
| TweenManager deferred cancel | ✅ PASS | `_pendingCancel` 플래그로 update 중 안전 취소 |
| 타워 3종 × 3단계 | ✅ PASS | archer/mage/cannon, 각 Lv.1~3 스탯 기획서와 일치 |
| 적 4종 | ✅ PASS | goblin/orc/dark/runner, HP/속도/보상/방어력/감속저항 구현 |
| 경로 시스템 | ✅ PASS | S자 웨이포인트 경로, PATH_TILES 배치 불가 마킹 |
| 판매 60% 반환 | ✅ PASS | `Math.floor(t.totalInvested * 0.6)` |
| 방어력 계산 | ✅ PASS | `Math.max(1, dmg - enemy.armor)` |
| 위기 보너스 | ✅ PASS | `lives <= 5` 시 골드 ×1.3 |
| First 타겟팅 | ✅ PASS | 웨이포인트 인덱스 + 진행률 기반 가장 앞선 적 타겟 |
| 관대한 히트박스 | ✅ PASS | `def.range + 8` (+8px 관용) |
| 에셋 프리로드 | ✅ PASS | `preloadAssets()` async, onerror 시 resolve로 폴백 보장 |

### ❌ FAIL 항목 (버그)

---

#### 🔴 B1 [CRITICAL] — waveComplete() 반복 호출 버그 (골드/점수 무한 누적)

**위치:** `updateWave()` (line ~403) → `waveComplete()` (line ~417)

**증상:**
- 웨이브 1 클리어 후 골드 **2,380G** (정상: ~105G), 점수 **27,900** (정상: ~600)
- 게임 경제 시스템이 완전히 파괴됨

**원인:**
```javascript
function updateWave(dt) {
  if (waveSpawned >= waveTotal) {
    if (enemies.length === 0 && waveKilled >= waveTotal) waveComplete(); // ← 매 프레임 호출!
    return;
  }
```
`waveComplete()`가 상태 전환을 tween onComplete(1.5초)로 처리하므로, 그 1.5초 동안 state가 여전히 PLAYING → `updateWave()`가 매 프레임 `waveComplete()`을 반복 호출.

**수정 방안:**
```javascript
let waveClearing = false; // 가드 플래그 추가

function updateWave(dt) {
  if (waveSpawned >= waveTotal) {
    if (!waveClearing && enemies.length === 0 && waveKilled >= waveTotal) {
      waveClearing = true;
      waveComplete();
    }
    return;
  }
  // ...
}

function startWave() {
  waveClearing = false;
  // ... 기존 코드
}
```

---

#### 🔴 B2 [CRITICAL] — 게임오버 전환이 waveComplete와 경쟁 (게임오버 불가)

**위치:** `endGame()` (line ~748) vs `waveComplete()` (line ~417)

**증상:**
- 라이프가 0이 되어도 GAMEOVER 화면이 표시되지 않고 WAVE_PREP로 전환됨
- 게임을 정상적으로 끝낼 수 없음

**원인:**
- `endGame()` tween (0.8s) → GAMEOVER 전환
- `waveComplete()` tween (1.5s) → WAVE_PREP 전환
- 두 tween이 동시에 실행되면, 더 늦게 완료되는 waveComplete tween이 GAMEOVER를 덮어씀
- B1 버그와 연계: waveComplete가 매 프레임 호출되므로 새 tween이 계속 쌓임

**수정 방안:**
```javascript
function waveComplete() {
  if (lives <= 0) return; // 게임오버 상태면 웨이브 클리어 무시
  // ... 기존 코드
}
```
또는 `checkGameOver()`를 `updateWave()` 전에 호출.

---

#### 🟡 B3 [MINOR] — consecutiveCleanWaves 로직 항상 false

**위치:** `waveComplete()` line ~424

**문제:**
```javascript
if (lives >= INIT_LIVES - (wave > 1 ? 0 : 0)) consecutiveCleanWaves++;
// ↑ (wave > 1 ? 0 : 0) 는 항상 0 → lives >= 20 이어야만 카운트
```
- 게임 시작부터 단 한 번도 라이프를 잃지 않은 경우에만 동작
- `livesAtWaveStart` 변수가 선언(line 444)만 되고 갱신/사용되지 않음

**수정 방안:**
```javascript
function startWave() {
  livesAtWaveStart = lives; // 웨이브 시작 시 기록
  // ...
}

function waveComplete() {
  if (lives >= livesAtWaveStart) consecutiveCleanWaves++;
  else consecutiveCleanWaves = 0;
  // ...
}
```

---

#### 🟡 B4 [MINOR] — SVG 에셋에 feGaussianBlur 필터 사용

**위치:** `assets/player.svg`, `assets/enemy.svg`

**문제:**
- 기획서 §0-1: "**SVG 필터 완전 미사용**. 모든 에셋을 순수 Canvas Path2D 드로잉으로 생성"
- `player.svg`에 `<filter id="glow"><feGaussianBlur>`, `<filter id="softGlow">` 사용
- `enemy.svg`에 `<filter id="enemyGlow">`, `<filter id="threatAura">` 사용
- Canvas 폴백 드로잉이 정상 구현되어 **기능적 문제는 없음**, 기획서 명세 위반

**영향:** 일부 브라우저/환경에서 SVG 필터 렌더링 결함 가능성 (Cycle 2 B5 재발 위험)

---

## 2. 브라우저 테스트 (Puppeteer)

**테스트 환경:** Chromium (Puppeteer), file:// 프로토콜

| 항목 | 결과 | 비고 |
|------|------|------|
| 페이지 로드 | ✅ PASS | 정상 로드, 콘솔 에러 0건 |
| 콘솔 에러 없음 | ✅ PASS | 에러/경고 없음 |
| 캔버스 렌더링 | ✅ PASS | Canvas 정상 생성 및 렌더링 |
| 시작 화면 표시 | ✅ PASS | 타이틀, 최고기록, 조작법 안내, 깜빡이는 시작 안내 |
| 에셋 로드 (8개 SVG) | ✅ PASS | player, enemy, bgLayer1, bgLayer2, uiHeart, uiStar, powerup, effectHit 모두 로드 |
| manifest.json | ✅ PASS | 8개 에셋 + thumbnail 정의, gameId 일치 |
| 타워 배치 | ✅ PASS | 아처 타워 (0,0), (2,0) 배치 성공, 골드 차감 정상 |
| 웨이브 시작 | ✅ PASS | Space키로 WAVE_PREP → PLAYING 전환, 적 스폰 확인 |
| 적 처치 & 골드 | ❌ FAIL | B1 버그로 골드/점수 비정상 누적 (wave 1: 2380G) |
| 웨이브 클리어 → 다음 웨이브 | ⚠️ PARTIAL | 전환은 되나 B1으로 경제 시스템 파괴 상태 |
| 일시정지 (P키) | ✅ PASS | PLAYING ↔ PAUSE 정상 토글 |
| 일시정지 (ESC키) | ✅ PASS | PLAYING → PAUSE 정상 전환 |
| 확인 모달 (Pause→R) | ✅ PASS | PAUSE → CONFIRM_MODAL, Y/N 정상 동작 |
| 게임오버 | ❌ FAIL | B2 버그로 GAMEOVER 화면이 WAVE_PREP에 덮어씌워짐 |
| 점수 시스템 | ❌ FAIL | B1 버그로 점수 정확성 검증 불가 |
| localStorage 최고점 | ✅ PASS | `mtd_bestScore`, `mtd_bestWave` 정상 저장/읽기 |
| 터치 이벤트 코드 존재 | ✅ PASS | touchstart, touchmove 구현, passive:false |
| 타워 사거리 표시 | ✅ PASS | 타워 정보 패널 선택 시 원형 범위 표시 |
| HUD 표시 | ✅ PASS | 웨이브, 골드, 라이프, 점수, 진행바 정상 렌더링 |
| 하단 타워 바 | ✅ PASS | 3종 타워 버튼 + 골드 부족 시 회색/빨간 비용 |

### 스크린샷 증거

1. **타이틀 화면** — 정상 (터미널 스타일 배경, bgLayer1 적용, 조작법 안내)
2. **WAVE_PREP 화면** — 정상 (S자 경로, 그리드, HUD, WAVE START 버튼)
3. **PLAYING 화면** — 타워 배치·공격 정상, 그러나 웨이브 완료 후 골드/점수 폭증
4. **GAMEOVER 화면** — ❌ FAIL (B2 버그로 게임오버 화면 미표시, WAVE_PREP로 전환)

---

## 3. 기획서 대조 체크리스트 (§13.4)

| 항목 | 결과 |
|------|------|
| 모든 상태에서 tw.update(dt) 호출 | ✅ |
| setTimeout 사용 0건 | ✅ |
| 점수 판정→저장 순서 | ✅ |
| 미사용 에셋 / 외부 CDN 0개 | ✅ (외부 의존 0) |
| destroy() 패턴 리스너 정리 | ✅ |
| 이징 함수 5종 구현 | ✅ |
| Canvas 모달만 사용 (confirm/alert 0건) | ✅ |
| waveComplete 중복 호출 방지 | ❌ (B1) |
| 게임오버 전환 안정성 | ❌ (B2) |
| consecutiveCleanWaves 동적 밸런스 | ❌ (B3, 사실상 미작동) |
| SVG 필터 미사용 원칙 | ❌ (B4, Canvas 폴백 있으나 SVG에 filter 포함) |

---

## 4. 요약

### 잘 된 점 👍
- **Cycle 2 교훈 대부분 반영**: TweenManager 모든 상태 업데이트, setTimeout 금지, 점수 판정-저장 순서, destroy() 패턴, Canvas 모달
- **아키텍처 품질 우수**: 상태 머신 7상태 완전 구현, ObjectPool, listen() 헬퍼, 상태×시스템 매트릭스 주석
- **풍부한 게임 콘텐츠**: 3종 타워 × 3단계, 4종 적, 20웨이브 스케일링, 경제 시스템, Web Audio SFX 4종
- **에셋 시스템**: 8개 SVG 에셋 + manifest.json + Canvas 폴백 드로잉 완비

### 수정 필요 🔧
- **B1 [CRITICAL]**: `waveComplete()` 반복 호출 — 가드 플래그 1줄 추가로 해결 가능
- **B2 [CRITICAL]**: 게임오버 전환 경쟁 — `waveComplete()`에 lives 체크 1줄 추가로 해결 가능
- **B3 [MINOR]**: consecutiveCleanWaves 로직 — `livesAtWaveStart` 활용하도록 수정
- **B4 [MINOR]**: SVG 에셋의 feGaussianBlur — 필터 제거 또는 Canvas 전용 드로잉 전환

---

## 5. 최종 판정

### 📌 코드 리뷰: **NEEDS_MAJOR_FIX**
### 📌 테스트: **FAIL**

**사유:** B1(waveComplete 반복 호출)과 B2(게임오버 불가)는 게임 플레이를 근본적으로 불가능하게 만드는 CRITICAL 버그입니다. 웨이브 1만 클리어해도 골드가 2,380G로 폭증하여 경제 밸런스가 무너지고, 라이프가 0이 되어도 게임오버 화면이 표시되지 않습니다. 두 버그 모두 수정 범위는 작지만(각 1~2줄), 게임 핵심 루프에 영향을 미치므로 **코더 재작업 후 재검증이 필요**합니다.
