---
game-id: mecha-garrison
cycle: 36
reviewer: claude-qa
date: 2026-03-24
verdict: NEEDS_MAJOR_FIX
attempt: 1
---

# 사이클 #36 코드 리뷰 — 메카 개리슨 (Mecha Garrison)

## 최종 판정: ❌ NEEDS_MAJOR_FIX

> **게임이 ZONE_INTRO 화면에서 영구적으로 멈춤. PLACEMENT 상태로 전환 불가 — 플레이 자체 불가능.**
> 근본 원인: `beginTransition()`에서 `RESTART_ALLOWED`를 참조하지 않아 12개 핵심 전환 중 10개가 STATE_PRIORITY에 의해 차단.

---

## P0: 치명적 버그 (게임 불능)

### B1. STATE_PRIORITY 버그 — 7번째 재발 (Cycle 21/23/24/25/27/28/32 → 36)

**코드 위치**: Line 2078-2079
```javascript
function beginTransition(fromState, toState, duration) {
  if (STATE_PRIORITY[toState] < STATE_PRIORITY[G.state] && G.state !== STATES.PAUSED) return;
  // ...
}
```

**문제**: `RESTART_ALLOWED` (Line 175)가 선언만 되고 `beginTransition()`에서 **전혀 참조되지 않음**. PAUSED만 예외로 두어 **10개 역방향 전환이 전부 차단**.

**차단되는 전환 (Puppeteer 검증 완료)**:

| FROM (우선순위) | TO (우선순위) | 결과 |
|----------------|-------------|------|
| ZONE_INTRO (50) | PLACEMENT (30) | ❌ 차단 — **게임 시작 불가** |
| WAVE (70) | WAVE_CLEAR (35) | ❌ 차단 — **웨이브 종료 불가** |
| WAVE (70) | REWARD_SELECT (30) | ❌ 차단 |
| WAVE (70) | BOSS_INTRO (60) | ❌ 차단 |
| BOSS_FIGHT (80) | BOSS_CLEAR (55) | ❌ 차단 |
| BOSS_CLEAR (55) | ZONE_INTRO (50) | ❌ 차단 |
| GAMEOVER (100) | ZONE_INTRO (50) | ❌ 차단 — **재시작 불가** |
| GAMEOVER (100) | HUB (20) | ❌ 차단 — **허브 복귀 불가** |
| VICTORY (90) | HUB (20) | ❌ 차단 — **승리 후 탈출 불가** |
| WAVE_CLEAR (35) | REWARD_SELECT (30) | ❌ 차단 |

**수정 방법**: `beginTransition()`에서 역방향 전환 허용 로직 추가:
```javascript
function beginTransition(fromState, toState, duration) {
  const isDownward = STATE_PRIORITY[toState] < STATE_PRIORITY[G.state];
  const isEscape = G.state === STATES.PAUSED || G.state === STATES.GAMEOVER ||
    G.state === STATES.VICTORY || G.state === STATES.BOSS_CLEAR ||
    G.state === STATES.WAVE_CLEAR || G.state === STATES.ZONE_INTRO ||
    G.state === STATES.BOSS_INTRO || G.state === STATES.REWARD_SELECT ||
    G.state === STATES.WAVE || G.state === STATES.BOSS_FIGHT;
  if (isDownward && !isEscape) return;
  // ... 기존 로직
}
```
또는 더 간결하게 (권장):
```javascript
const ESCAPE_ALLOWED = {
  PAUSED:true, GAMEOVER:true, VICTORY:true, BOSS_CLEAR:true,
  WAVE_CLEAR:true, ZONE_INTRO:true, BOSS_INTRO:true,
  REWARD_SELECT:true, WAVE:true, BOSS_FIGHT:true
};
function beginTransition(fromState, toState, duration) {
  if (STATE_PRIORITY[toState] < STATE_PRIORITY[G.state] && !ESCAPE_ALLOWED[G.state]) return;
  // ...
}
```

---

## P1: 중요 버그

### B2. assets/ 디렉토리 F1 위반 — 36사이클 연속 재발

**현상**: `public/games/mecha-garrison/assets/` 디렉토리에 10개 파일 존재:
- bg-layer1.svg, bg-layer2.svg, effect-hit.svg, enemy.svg, player.svg
- powerup.svg, thumbnail.svg, ui-heart.svg, ui-star.svg, manifest.json

**코드 참조**: Line 509-533에서 `ASSET_MAP` + `preloadAssets()`로 8개 SVG를 적극 로드.
```javascript
const ASSET_MAP = {
  player: 'assets/player.svg',
  enemy: 'assets/enemy.svg',
  // ... 8개
};
```

**영향**: Canvas 폴백이 100% 존재하여 게임 동작에는 영향 없으나, 기획서 §4.1 "assets/ 디렉토리 절대 생성 금지" 명확 위반.

**수정 방법**:
1. `ASSET_MAP`, `SPRITES`, `preloadAssets()` 코드 전량 삭제
2. `SPRITES.*` 참조 조건부 분기 제거 (Canvas 폴백만 유지)
3. `assets/` 디렉토리 물리 삭제 (thumbnail.svg는 게임 디렉토리 루트로 이동)
4. `boot()` 함수에서 `await preloadAssets()` 제거

---

## 코드 리뷰 체크리스트

### 📌 1. 게임 시작 흐름
| 항목 | 결과 | 비고 |
|------|------|------|
| 타이틀/시작 화면 존재 | ✅ PASS | 렌더링 정상, SVG 에셋 + Canvas 파티클 + 글리치 효과 |
| SPACE/클릭/탭으로 시작 | ❌ **FAIL** | TITLE→STORY_INTRO→ZONE_INTRO까지 진행, **ZONE_INTRO→PLACEMENT 차단** |
| 시작 시 상태 초기화 | ✅ PASS | `initRun(G)` — 코어HP, 에너지, 메카, 적, 투사체, 파트 보너스 모두 리셋 |

### 📌 2. 입력 시스템 — 데스크톱
| 항목 | 결과 | 비고 |
|------|------|------|
| keydown/keyup 등록 | ✅ PASS | Line 434-439, window에 등록, preventDefault 포함 |
| 이동 키 동작 | ⚠️ N/A | TD 장르 — 직접 이동 없음 (그리드 배치 시스템) |
| 액션 키 동작 | ✅ PASS | Space(웨이브 시작/배속), 1-5(메카 선택), Q(궁극기), R(재시작) |
| 일시정지 (ESC) | ✅ PASS | Line 2694-2698, `G.state = STATES.PAUSED` 직접 할당으로 정상 동작 |

### 📌 3. 입력 시스템 — 모바일
| 항목 | 결과 | 비고 |
|------|------|------|
| touchstart/touchmove/touchend 등록 | ✅ PASS | Line 456-491, passive:false + preventDefault |
| 가상 조이스틱/터치 버튼 | ✅ PASS | 하단 패널에 메카 5개 버튼 + 웨이브/배속/일시정지 컨트롤 |
| 터치→게임 로직 연결 | ✅ PASS | hitTest() 단일 함수 (F16/F26), 그리드 셀 터치 배치 |
| 터치 타겟 48px+ | ✅ PASS | `btnSize = Math.max(48, Math.min(56, w/8))` — 최소 48px 보장 |
| 스크롤 방지 | ✅ PASS | `touch-action:none; overflow:hidden` (Line 9) |

### 📌 4. 게임 루프 & 로직
| 항목 | 결과 | 비고 |
|------|------|------|
| requestAnimationFrame | ✅ PASS | Line 2278, 매 프레임 호출 |
| delta time | ✅ PASS | `Math.min(rawDt, 50) * G.speed` — 50ms 캡 + 배속 |
| 충돌 감지 | ✅ PASS | 투사체-적 거리 기반(400=20px²), BFS 경로 추적 |
| 점수 증가 경로 | ✅ PASS | `applyDamage()` → `G.score += SCORE_KILL_BASE * (zone+1)` |
| 난이도 변화 | ✅ PASS | DDA 4단계 + 웨이브/존 기반 HP/속도 배율 + 야간 사거리 감소 |

### 📌 5. 게임 오버 & 재시작
| 항목 | 결과 | 비고 |
|------|------|------|
| 게임 오버 조건 | ✅ PASS | `G.coreHp <= 0` (Line 2407) |
| 게임 오버 화면 | ✅ PASS | `drawGameOverScreen()` — 점수, CP, 허브 복귀 버튼 |
| localStorage 최고점 | ✅ PASS | `SAVE_KEY='mecha-garrison-v1'`, `savePersistent()` (Line 1630) |
| R키/탭 재시작 | ❌ **FAIL** | `beginTransition(G.state, STATES.ZONE_INTRO, 600)` — **STATE_PRIORITY 차단** |
| 상태 완전 초기화 | ✅ PASS | `initRun(G)` 에서 모든 상태 리셋 (코드 상 정상이나 호출 불가) |

### 📌 6. 화면 렌더링
| 항목 | 결과 | 비고 |
|------|------|------|
| canvas 크기 | ✅ PASS | `window.innerWidth × innerHeight` (Line 2246-2248) |
| devicePixelRatio | ✅ PASS | `const dpr = window.devicePixelRatio \|\| 1` + `ctx.setTransform(dpr,...)` |
| resize 이벤트 | ✅ PASS | `window.addEventListener('resize', resizeCanvas)` (Line 2271) |
| 렌더링 상태별 확인 | ⚠️ 부분 | TITLE/STORY_INTRO/ZONE_INTRO 확인, PLACEMENT 이후 미확인 (진입 불가) |

### 📌 7. 외부 의존성 안전성
| 항목 | 결과 | 비고 |
|------|------|------|
| 외부 CDN 0건 | ✅ PASS | `'Segoe UI',system-ui,sans-serif` 시스템 폰트 전용 |
| SVG 로드 실패 시 폴백 | ✅ PASS | 모든 draw 함수에 `if (SPRITES.x) { drawImage } else { Canvas 드로잉 }` |

---

## 브라우저 테스트 결과

| 테스트 | 결과 | 스크린샷 | 비고 |
|--------|------|----------|------|
| A: 로드+타이틀 | ✅ PASS | 01-boot-screen | 타이틀 정상 렌더링, SVG 메카 표시 |
| B: Space 시작 | ❌ **FAIL** | 04-stuck-at-zone-intro | STORY_INTRO→ZONE_INTRO 진행 후 **PLACEMENT 진입 불가** |
| C: 이동/배치 조작 | ❌ **FAIL** | N/A | PLACEMENT 진입 불가로 테스트 불가 |
| D: 게임오버+재시작 | ❌ **FAIL** | N/A | 게임 도달 불가 |
| E: 터치 동작 | ⚠️ 부분 | N/A | TITLE→STORY_INTRO 터치 전환 정상, 이후 테스트 불가 |

### Puppeteer 검증 상세

**테스트 A: 타이틀 화면 로드**
- `file:///C:/Work/InfinitriX/public/games/mecha-garrison/index.html` 접속
- 3초 대기 후 스크린샷 — 타이틀 정상 렌더링 확인
- `window.__errors = []` — 콘솔 에러 0건

**테스트 B: SPACE 입력으로 게임 시작**
1. `G.input.keys['Space'] = true` → TITLE → STORY_INTRO 전환 성공
2. 다시 Space → STORY_INTRO → ZONE_INTRO 전환 성공 ("구역 1 — 도시 외곽" 표시)
3. 다시 Space → **ZONE_INTRO에서 변화 없음**
4. 상태 확인: `{ state: "ZONE_INTRO", prevState: "STORY_INTRO" }` — 영구 정체
5. `willBlock` 검증: `STATE_PRIORITY['PLACEMENT'](30) < STATE_PRIORITY['ZONE_INTRO'](50) && state !== 'PAUSED'` → **true (차단됨)**

**테스트 전환 전수 검증**:
- 12개 핵심 전환 중 **10개 차단** 확인 (Puppeteer evaluate로 검증)
- 통과하는 2개: BOSS_CLEAR→VICTORY (55→90), WAVE_CLEAR→BOSS_INTRO (35→60)

---

## 긍정적 요소

1. **코드 구조**: 11개 REGION으로 명확한 구조화. 3500줄에서 TD 로그라이트의 전체 시스템 구현
2. **transAlpha 프록시 패턴**: `G._transProxy` → 게임 루프에서 `G.transAlpha` 동기화 (Line 2286) — Cycle 24의 미연결 버그가 해결됨
3. **BFS 경로탐색**: 배치 시 경로 차단 검증 + 적 경로 재계산 — TD 핵심 메커닉 정상 구현
4. **DDA 시스템**: 연속 사망 기반 4단계 난이도 보정 — 기획서 §7.6 준수
5. **부품 시스템**: 3등급 × 3선택 + DPS 캡(2.0) — 기획서 §7.4/F27 준수
6. **bossRewardGiven 가드 플래그**: F17 패턴 정확 적용 (Line 2381)
7. **보스 약점 노출 메커닉**: 8초 주기 3초 노출 — 전략적 타이밍 요소 제공
8. **프로시저럴 SFX/BGM**: 15종 SFX + 6종 BGM 무드 — 외부 오디오 파일 0건
9. **다국어 (ko/en)**: 60+ 문자열 + 확장 LANG — F20 준수
10. **터치 입력**: hitTest() 단일 함수 + 롱프레스 판매 + 더블탭 업그레이드 — 모바일 UX 고려

---

## 수정 우선순위

| 우선순위 | 버그 ID | 설명 | 예상 난이도 |
|---------|---------|------|-----------|
| **P0** | B1 | STATE_PRIORITY beginTransition() ESCAPE_ALLOWED 미적용 | 쉬움 (5줄 수정) |
| **P1** | B2 | assets/ F1 위반 + ASSET_MAP/SPRITES 코드 삭제 | 중간 (50줄 삭제) |

---

## 결론

코드 구조와 게임 메커닉 설계는 우수하나, **STATE_PRIORITY 버그로 게임이 ZONE_INTRO에서 영구 정체**하여 플레이 자체가 불가능합니다. 이 버그는 Cycle 21 이후 **7번째 재발**이며, `RESTART_ALLOWED`를 선언만 하고 `beginTransition()`에서 참조하지 않는 **동일한 패턴**의 반복입니다.

B1(P0) 수정만으로 게임이 정상 동작할 것으로 판단되며, B2(P1)도 함께 수정을 권장합니다. 수정 후 2회차 리뷰에서 전체 플레이 흐름을 재검증해야 합니다.
