---
game-id: rune-survivor
title: 룬 서바이버
genre: action
difficulty: medium
---

# 룬 서바이버 — 상세 기획서

_사이클 #18 | 작성일: 2026-03-22_

---

## §0. 이전 사이클 피드백 반영 매핑

> Cycle 17 포스트모템 "아쉬웠던 점" + platform-wisdom 누적 교훈(F1~F24, 17사이클)을 기획 단계에서 선제 대응한다.

| # | 출처 | 문제 | 이번 기획서 해결 방법 | 해당 섹션 |
|---|------|------|----------------------|-----------|
| F1 | Cycle 1~17 (17사이클 연속) | assets/ 디렉토리 재발 | **빈 index.html에서 처음부터 작성.** assets/ 디렉토리 절대 생성 금지. 100% Canvas 코드 드로잉. thumbnail.svg만 별도 허용 | §8, §16.5 |
| F2 | Cycle 1~17 | setTimeout 기반 상태 전환 | tween onComplete 콜백만으로 전환. setTimeout **0건** 목표. Web Audio는 `oscillator.start(ctx.currentTime + delay)` 네이티브 스케줄링 | §5, §13, §16.5 |
| F3 | Cycle 6~17 | 순수 함수 패턴 필수 | 모든 게임 로직 함수는 파라미터 기반. 전역 직접 참조 0건. §18에 전체 함수 시그니처 정의 | §18 |
| F4 | Cycle 2 | 상태×시스템 매트릭스 누락 | §6에 전체 상태×시스템 매트릭스 선행 작성 (7상태 × 13시스템) | §6.3 |
| F5 | Cycle 3/4 | 가드 플래그 누락 → 콜백 반복 호출 | `waveClearing`, `isTransitioning`, `isLevelingUp`, `isDying` 4중 가드 체계 | §5.4 |
| F6 | Cycle 4 | TweenManager cancelAll+add 경쟁 조건 | `clearImmediate()` 즉시 정리 API 분리. cancelAll 직후 `_pendingCancel=false` + `_tweens.length=0` 플러시 | §18 |
| F7 | Cycle 7/16 | 기획서 수치 ↔ 코드 수치 불일치 | §16.4 수치 정합성 검증 테이블. 웨이브별 적 수·HP·보상 전수 대조 | §16.4 |
| F8 | Cycle 1 | iframe 환경 confirm/alert 사용 불가 | Canvas 기반 모달 UI만 사용. window.open/alert/confirm/prompt 0건 | §4 |
| F9 | Cycle 3~4 | SVG 필터 재발 (feGaussianBlur) | 인라인 SVG 사용 금지. Canvas glow는 shadowBlur로 구현. thumbnail.svg에서만 filter 허용 | §4.2 |
| F10 | Cycle 15~17 | offscreen canvas 배경 캐싱 | `buildBgCache()` 패턴 — resizeCanvas() 시에만 재빌드. 배경 레이어 3종 캐싱 | §4.3 |
| F11 | Cycle 11/14 | let/const TDZ 크래시 + DOM 할당 전 접근 | 변수 선언 → DOM 할당 → 이벤트 등록 → init() 순서 엄격 준수. §16.1 초기화 순서 체크리스트 | §16.1 |
| F12 | Cycle 10/11 | gameLoop try-catch 미적용 | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` 기본 적용 | §5.1 |
| F13 | Cycle 13/17 | index.html 미존재 (3회 발생) | **MVP 우선 전략**: TITLE→PLAYING→GAMEOVER 3상태 먼저 구현. 리뷰 제출 전 스모크 테스트 3단계 | §1.3, §16.6 |
| F14 | Cycle 10 | 수정 회귀 (render 시그니처 변경) | 수정 시 전체 플로우 회귀 테스트 (TITLE→PLAYING→LEVEL_UP→BOSS→GAMEOVER→RESULT) | §16.7 |
| F15 | Cycle 3/7/17 | 유령 변수 (선언만 하고 미사용) | §16.2 변수 사용처 검증 테이블 | §16.2 |
| F16 | Cycle 5 | 하나의 값에 대한 갱신 경로 이중화 | HP/XP/점수는 단일 함수(`modifyHP()`, `addXP()`, `addScore()`)를 통해서만 갱신 | §18 |
| F17 | Cycle 3 | 상태 전환 우선순위 체계 | GAMEOVER > BOSS_INTRO > LEVEL_UP > PAUSED > PLAYING. STATE_PRIORITY 맵 | §6.2 |
| F18 | Cycle 15~17 | 범위 축소 전략 (Cycle 17에서 과대 범위로 구현 0%) | **단일 장르 축(action)** + 시스템 조합(로그라이크 업그레이드). 10웨이브 + 보스 2체로 현실적 범위 | §1 |
| F19 | Cycle 12/15 | "절반 구현" 패턴 | 기능별 세부 구현 체크리스트(§16.3) — A+B+C 개별 완료 확인 | §16.3 |
| F20 | Cycle 13~16 | CONFIG.MIN_TOUCH 선언-구현 괴리 | 모든 버튼·UI에 `touchSafe()` 유틸로 48px 하한 강제 적용 | §12.3 |
| F21 | Cycle 16 | 입력 방식 전기능 미지원 | 키보드/마우스/터치 모두 **전 기능 지원** 보장. 입력별 매핑 테이블 §3에 명시 | §3 |
| F22 | Cycle 17 | 기획 명시 UI 미구현 | 기획서에 명시된 UI는 **100% 구현**. "선택적" 기능 없음. MVP에 포함되지 않으면 기획서에 적지 않는다 | §1.3 |
| F23 | Cycle 5/8 | beginTransition() 우회 직접 전환 | 모든 화면 전환은 `beginTransition()` 경유 필수. PAUSED만 예외(즉시 전환) | §6.2 |
| F24 | Cycle 12~16 | 터치 타겟 44×44px 미달 | 모든 인터랙티브 UI 최소 48×48px. CONFIG.MIN_TOUCH_TARGET = 48 | §12.3 |
| F25 | Cycle 17 (핵심) | 기획 과대 → 구현 0% | **MVP 우선**: 3상태(TITLE/PLAYING/GAMEOVER) + 적 1종 + 무기 1종 먼저. 기능은 점진 확장 | §1.3 |
| F26 | Cycle 17 | scorePopups life 감소가 render에서 수행 | 모든 상태 변경은 update()에서만. render()는 순수 출력 함수 | §5.2, §5.3 |
| F27 | Cycle 17 | 오브젝트 간 상호작용 미정의 | §2.5 무기 × 적 타입 상호작용 매트릭스 포함 | §2.5 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 1.1 컨셉
플레이어는 고대 룬 마법사를 조작하여 사방에서 몰려오는 몬스터 무리 속에서 생존한다. **이동만 직접 조작**하고, 무기(룬)는 **자동으로 발사**된다. 적을 처치하면 경험치 젬이 드롭되고, 젬을 수집하여 레벨업하면 **3택 1 로그라이크 업그레이드**를 선택한다. 10웨이브를 돌파하면 클리어.

**Vampire Survivors 스타일**의 자동 전투 서바이버라이크 — 2024~2026 최대 히트 장르.

### 1.2 핵심 재미 요소
1. **생존 긴장감**: 360° 전방위에서 몰려오는 적. 이동 판단이 생사를 가른다
2. **로그라이크 성장 쾌감**: 레벨업마다 3택 1 업그레이드. 매 런마다 다른 빌드 → 무한 리플레이
3. **무기 시너지**: 최대 5종 무기 동시 장착. 화염 오라 + 얼음 창 = 슬로우된 적에게 범위 화염 데미지
4. **보스전 스펙터클**: 웨이브 5, 10에 대형 보스 등장 — 특수 패턴 + 화면 흔들림 + 슬로우모션
5. **점진적 압도감**: 1웨이브(슬라임 5마리) → 10웨이브(리치 보스 + 엘리트 혼합)
6. **한 판 5~8분**: 즉시 재도전 가능. "한 판만 더" 중독성

### 1.3 범위 관리 전략 (F25 대응)
> ⚠️ Cycle 17에서 과대 범위로 구현 0%가 발생했다. 이번에는 **MVP 우선 전략**을 엄수한다.

**MVP 구현 순서** (반드시 이 순서로 구현):
1. **Phase 1 (핵심 — 이것만으로 실행 가능)**: TITLE → PLAYING → GAMEOVER 3상태 + 플레이어 이동 + 슬라임 1종 + 룬볼트 1종 + 젬 수집
2. **Phase 2**: 레벨업 시스템 + LEVEL_UP 상태 + 3택 1 업그레이드 UI
3. **Phase 3**: 적 5종 + 무기 5종 + 웨이브 10개
4. **Phase 4**: 보스 2체 + BOSS_INTRO 상태
5. **Phase 5**: 업적 시스템 + RESULT 상태 + 파티클/이펙트 풍부화
6. **Phase 6**: BGM + 효과음 + 화면 흔들림/슬로우모션

Phase 1~2가 완성되면 **실행 가능한 게임**이다. Phase 3 이후는 점진 확장.

### 1.4 장르 균형 기여
- action 장르 직접 보강 (현재 5개 → 6개, 플랫폼에서 가장 부족한 장르)
- mini-survivor-arena와의 차별화: 로그라이크 업그레이드 + 보스전 + 다중 무기 시너지 + 18사이클급 비주얼

---

## §2. 게임 규칙 및 목표

### 2.1 승리 조건
- 10웨이브 전부 돌파 (웨이브 10 보스 처치)

### 2.2 패배 조건
- 플레이어 HP가 0 이하

### 2.3 코어 루프
```
이동(WASD/조이스틱) → 자동 공격(무기별 쿨다운) → 적 처치 → 젬 드롭
→ 젬 수집 → XP 증가 → 레벨업 → 3택 1 업그레이드 선택
→ 웨이브 클리어 → 다음 웨이브 → (웨이브 5/10: 보스전)
```

### 2.4 기본 스탯
| 스탯 | 초기값 | 최대값 | 설명 |
|------|--------|--------|------|
| HP | 100 | 200 | 피격 시 감소, 회복 젬으로 회복 |
| 이동 속도 | 3.0 px/frame | 6.0 | 업그레이드로 증가 |
| 자석 범위 | 60 px | 200 | 젬 흡수 반경 |
| 행운 | 0% | 50% | 희귀 업그레이드 확률 증가 |
| 쿨다운 감소 | 0% | 40% | 무기 발사 간격 감소 |
| 데미지 배율 | 1.0 | 2.5 | 전체 무기 데미지 곱연산 |

### 2.5 무기 × 적 타입 상호작용 매트릭스 (F27 대응)

| 무기 \ 적 | 슬라임 | 박쥐 | 골렘 | 마법사 | 해골전사 | 보스 |
|-----------|--------|------|------|--------|---------|------|
| 룬볼트 | 1.0× | 1.0× | 0.5× | 1.0× | 1.0× | 1.0× |
| 화염 오라 | 1.5× | 1.0× | 0.5× | 1.0× | 1.5× | 0.8× |
| 얼음 창 | 1.0× | 1.5× | 1.0× | 1.0× | 1.0× | 0.8× |
| 번개 체인 | 1.0× | 1.0× | 1.5× | 0.5× | 1.0× | 0.8× |
| 보호 실드 | — | — | — | — | — | — |

> 보호 실드는 공격 무기가 아닌 방어 무기(접촉 적에게 넉백 + 피해 감소).

---

## §3. 조작 방법

### 3.1 입력 매핑 테이블 (F21 대응)

| 기능 | 키보드 | 마우스 | 터치 |
|------|--------|--------|------|
| 이동 | WASD / 방향키 | — | 가상 조이스틱 (좌측 하단) |
| 자동 공격 | 자동 (조작 불필요) | 자동 | 자동 |
| 업그레이드 선택 | 1/2/3 키 | 카드 클릭 | 카드 탭 |
| 일시정지 | ESC / P | 일시정지 버튼 클릭 | 일시정지 버튼 탭 |
| 재시작 (게임오버) | R 키 | 버튼 클릭 | 버튼 탭 |
| 타이틀로 돌아가기 | ESC (일시정지 중) | 버튼 클릭 | 버튼 탭 |

### 3.2 가상 조이스틱 사양
- 위치: 화면 좌하단 (캔버스 높이 75%, 캔버스 너비 20%)
- 크기: 외부 원 반지름 60px, 내부 원 반지름 24px
- 투명도: idle 시 alpha 0.3, 터치 중 alpha 0.7
- 데드존: 10px (이 안에서는 이동 안 함)
- 조이스틱은 터치 모드에서만 표시 (마우스/키보드 시 숨김)

### 3.3 입력 모드 자동 감지
```
키보드 입력 → inputMode = 'keyboard' → 조이스틱 숨김
마우스 이동 → inputMode = 'mouse'    → 조이스틱 숨김
터치 시작   → inputMode = 'touch'    → 조이스틱 표시
```

---

## §4. 시각적 스타일 가이드

### 4.1 색상 팔레트

| 용도 | HEX | 설명 |
|------|-----|------|
| 배경 (어두운 바닥) | `#1a1a2e` | 딥 네이비 |
| 배경 그리드 | `#16213e` | 약간 밝은 네이비 |
| 플레이어 | `#00d4ff` | 사이안 (룬 글로우) |
| 플레이어 로브 | `#4a00e0` | 보라색 |
| 슬라임 | `#39ff14` | 네온 그린 |
| 박쥐 | `#8b00ff` | 보라 |
| 골렘 | `#ff6600` | 주황 |
| 마법사 (적) | `#ff0066` | 핑크 레드 |
| 해골전사 | `#cccccc` | 실버 그레이 |
| 보스 (웨이브5) | `#ff3300` | 레드 |
| 보스 (웨이브10) | `#9900ff` | 다크 퍼플 |
| XP 젬 | `#00ff88` | 민트 그린 |
| HP 회복 젬 | `#ff4444` | 레드 |
| 룬볼트 | `#00d4ff` | 사이안 |
| 화염 오라 | `#ff4400` | 오렌지 레드 |
| 얼음 창 | `#66ccff` | 라이트 블루 |
| 번개 체인 | `#ffff00` | 옐로우 |
| 보호 실드 | `#00ffaa` | 터코이즈 |
| UI 텍스트 | `#ffffff` | 화이트 |
| UI 배경 | `rgba(0,0,0,0.7)` | 반투명 블랙 |
| 업그레이드 카드 배경 | `#2a2a4a` | 다크 퍼플 그레이 |
| 업그레이드 카드 테두리 | `#00d4ff` | 사이안 |

### 4.2 Canvas 코드 드로잉 명세 (F1, F9 대응)
> ⚠️ assets/ 디렉토리 절대 생성 금지. 모든 비주얼은 Canvas 2D API로 직접 드로잉. SVG 인라인 사용 금지. 글로우는 shadowBlur로만 구현.

#### 플레이어 (룬 마법사)
- 몸체: 삼각형 로브 (보라 `#4a00e0`, 하단 넓이 24px, 높이 32px)
- 머리: 원형 (사이안 `#00d4ff`, 반지름 8px, 상단)
- 룬 글로우: shadowBlur 15, shadowColor `#00d4ff`
- idle 상태: 로브 좌우 미세 흔들림 (sin(time) × 2px)
- 피격 상태: 0.1초간 빨간 플래시 (globalCompositeOperation: 'source-atop')
- 이동 상태: 이동 방향으로 약간 기울어짐 (±5°)

#### 적 타입 5종
1. **슬라임**: 반원 + 아래 물결선 (네온 그린 `#39ff14`), 통통 튀는 애니메이션 (sin(time)으로 y 오프셋 ±3px)
2. **박쥐**: V자 날개 + 작은 원 몸체 (보라 `#8b00ff`), 날개 펄럭임 (sin(time×4)으로 날개 각도 ±30°)
3. **골렘**: 큰 사각형 몸체 + 작은 사각형 팔 (주황 `#ff6600`), 느린 이동 + 몸체 좌우 흔들림
4. **마법사(적)**: 삼각형 모자 + 원 몸체 (핑크 레드 `#ff0066`), 주기적 탄 발사 시 손 들어올림 애니메이션
5. **해골전사**: 원 머리(빈 원) + 사각형 몸체 + 직선 칼 (실버 `#cccccc`), 돌진 시 칼 휘두르기 애니메이션

#### 보스
1. **웨이브 5 — 크림슨 워든 (거대 골렘)**: 일반 골렘의 3배 크기(64px), 주황→빨강 그라데이션(createLinearGradient), HP바 상단 표시, 충격파 시 바닥 원형 파동 이펙트
2. **웨이브 10 — 엘더 리치**: 마법사의 2.5배 크기(56px), 다크 퍼플 `#9900ff` + 보라 오라(shadowBlur 25), 3페이즈별 오라 색상 변화, 텔레포트 시 잔상 이펙트 3프레임

### 4.3 배경 (offscreen canvas 캐싱 — F10)
- **레이어 1 (far)**: `#1a1a2e` 단색 + 작은 별 파티클 40개 (흰색, alpha 0.3~0.7, sin(time + offset)으로 깜빡임)
- **레이어 2 (mid)**: 그리드 패턴 (16px 간격, `#16213e`, 선 두께 1px). 플레이어 이동 시 패럴랙스 스크롤 (0.3배속)
- **레이어 3 (near)**: 게임 오브젝트 (플레이어, 적, 투사체, 젬) — 실시간 렌더링
- **레이어 4 (foreground)**: UI (HP바, XP바, 웨이브 표시, 미니맵, 파티클 이펙트)

`buildBgCache()`: 레이어 1+2를 offscreen canvas에 사전 렌더링. `resizeCanvas()` 호출 시에만 재빌드.

### 4.4 파티클 시스템 (ObjectPool 기반)
1. **적 처치 파티클**: 적 색상 기반 원형 파편 8~12개, 0.5초간 방사형 확산 + 알파 감소
2. **젬 수집 파티클**: 민트 그린 작은 원 4개, 플레이어 방향으로 수렴
3. **레벨업 파티클**: 사이안 링 확산 + 화이트 별 8개 회전 상승, 1초
4. **피격 파티클**: 빨간 원 파편 4개, 피격 반대 방향으로 확산
5. **보스 등장 파티클**: 화면 가장자리에서 중앙으로 수렴하는 에너지 라인 20개, 1.5초
6. **무기별 궤적 파티클**: 각 무기 색상의 잔상 (트레일 3~5프레임, alpha 감소)

### 4.5 이펙트
- **화면 흔들림 (screen shake)**: 보스 등장(8px, 0.5초), 보스 공격(5px, 0.2초), 플레이어 피격(3px, 0.15초)
- **슬로우모션**: 보스 처치 시 0.3초간 timeScale = 0.3 → tween으로 1.0 복귀
- **글로우 이펙트**: 플레이어(shadowBlur 15), 무기 투사체(shadowBlur 8~12), XP 젬(shadowBlur 6)
- **UI 애니메이션**: 점수 카운트업(tween), 레벨업 텍스트 바운스(easeOutBack), 업그레이드 카드 슬라이드 인(easeOutBack, 0.3초), 웨이브 알림 확대→축소(0.5초)

---

## §5. 핵심 게임 루프 (초당 프레임 기준 로직 흐름)

### 5.1 메인 루프 구조 (F12)
```javascript
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // 최대 50ms 캡
    lastTime = timestamp;
    const scaledDt = dt * timeScale; // 슬로우모션 지원

    update(scaledDt, gameState);
    render(ctx, gameState);
  } catch (e) {
    console.error('GameLoop error:', e);
  }
  requestAnimationFrame(gameLoop); // try-catch 외부
}
```

### 5.2 update(dt, state) 흐름 (F26: 모든 상태 변경은 update에서만)
```
1. tweenManager.update(dt)                         — 모든 상태에서 실행
2. updateScreenShake(shake, dt)                     — 모든 상태에서 실행
3. updateScorePopups(popups, dt)                    — 모든 상태에서 실행

4. if (state === PLAYING || state === BOSS):
   a. updatePlayerMovement(player, input, dt, config)
   b. updateWeapons(weapons, enemies, player, dt, dmgTable)
   c. updateProjectiles(projectiles, dt)
   d. updateEnemies(enemies, player, dt)
   e. checkProjectileHits(projectiles, enemies, dmgTable, pools)
   f. checkEnemyPlayerHits(enemies, player, dt, shield)
   g. updateGems(gems, player, dt, magnetRange)
   h. updateParticles(particles, dt)
   i. updateWaveTimer(wave, dt)
   j. checkLevelUp(player, xpTable)    — 가드: isLevelingUp
   k. checkWaveComplete(wave, enemies)  — 가드: waveClearing
   l. checkGameOver(player)             — 가드: isDying

5. if (state === LEVEL_UP):
   a. (tween 애니메이션만 — 입력 대기)

6. if (state === BOSS_INTRO):
   a. updateBossIntro(boss, dt)
```

### 5.3 render(ctx, state) 흐름 (순수 출력 — 상태 변경 0건 — F26)
```
1. ctx.save()
2. applyScreenShake(ctx, shake)
3. drawBackground(ctx, bgCache, cameraOffset)
4. drawGems(ctx, gems, time)
5. drawEnemies(ctx, enemies, time)
6. drawProjectiles(ctx, projectiles, time)
7. drawPlayer(ctx, player, time)
8. drawParticles(ctx, particles)
9. drawScorePopups(ctx, popups)
10. ctx.restore()

11. drawUI(ctx, state, player, wave, score)
12. if (state === TITLE): drawTitleScreen(ctx, time)
13. if (state === LEVEL_UP): drawUpgradeCards(ctx, cards, selectedIndex)
14. if (state === BOSS_INTRO): drawBossIntro(ctx, boss)
15. if (state === PAUSED): drawPauseOverlay(ctx)
16. if (state === GAMEOVER): drawGameOverScreen(ctx, result)
17. if (state === RESULT): drawResultScreen(ctx, result, achievements)
18. if (inputMode === 'touch'): drawJoystick(ctx, joystick)
```

### 5.4 가드 플래그 (F5)
| 플래그 | 용도 | 설정 시점 | 해제 시점 |
|--------|------|-----------|-----------|
| `waveClearing` | 웨이브 완료 → 다음 웨이브 전환 중복 방지 | checkWaveComplete()에서 true | enterState(PLAYING) 시 false |
| `isTransitioning` | 화면 전환 중 입력 무시 | beginTransition() 호출 시 | 전환 tween onComplete |
| `isLevelingUp` | 레벨업 처리 중복 방지 | checkLevelUp()에서 true | 업그레이드 선택 완료 후 false |
| `isDying` | 사망 연출 중 추가 피격 무시 | HP ≤ 0 시 true | GAMEOVER 상태 진입 후 |

---

## §6. 상태 머신 및 상태 × 시스템 매트릭스

### 6.1 상태 전이도
```
TITLE ──(시작)──→ PLAYING ──(레벨업)──→ LEVEL_UP ──(선택)──→ PLAYING
                    │                                          │
                    ├──(웨이브5/10)──→ BOSS_INTRO ──(완료)──→ PLAYING(보스전)
                    │
                    ├──(ESC)──→ PAUSED ──(ESC)──→ PLAYING
                    │
                    └──(HP≤0)──→ GAMEOVER ──(결과)──→ RESULT ──(재시작)──→ TITLE
```

### 6.2 상태 전환 우선순위 (F17, F23)
```javascript
const STATE_PRIORITY = {
  GAMEOVER: 100,    // 최고 우선 — HP≤0이면 모든 전환을 덮어씀
  BOSS_INTRO: 80,
  LEVEL_UP: 60,
  PAUSED: 40,
  RESULT: 30,
  PLAYING: 20,
  TITLE: 10         // 최저 우선
};
```
- 모든 전환은 `beginTransition(targetState, options)` 경유 필수 (F23)
- PAUSED만 `beginTransition(PAUSED, { immediate: true })` 즉시 전환
- 전환 함수 진입부에 `if (player.hp <= 0 && target !== GAMEOVER) return;` 사전 체크 (Cycle 3 교훈)

### 6.3 상태 × 시스템 업데이트 매트릭스 (F4)

| 시스템 \ 상태 | TITLE | PLAYING | LEVEL_UP | BOSS_INTRO | PAUSED | GAMEOVER | RESULT |
|---------------|-------|---------|----------|------------|--------|----------|--------|
| TweenManager | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| 플레이어 이동 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 적 AI/이동 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 무기 시스템 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 투사체 물리 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 충돌 판정 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 젬 시스템 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 파티클 | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Screen Shake | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Score Popups | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| 입력 처리 | 시작만 | 전체 | 1/2/3+클릭 | ❌ | ESC만 | R/버튼 | R/버튼 |
| 오디오 BGM | 타이틀곡 | 전투곡 | 전투곡(음량↓) | 보스곡 | 음소거 | ❌ | 결과곡 |
| 렌더링 | 타이틀 | 전체 | 전체+카드 | 전체+연출 | 전체+오버레이 | 전체+오버레이 | 결과화면 |

---

## §7. 적 시스템

### 7.1 적 타입 상세

| 적 | HP | 속도 | 데미지 | XP | 특수 능력 | 히트박스(px) |
|----|-----|------|--------|-----|----------|-------------|
| 슬라임 | 15 | 1.2 | 8 | 5 | 없음 (기본 적) | 반지름 10 |
| 박쥐 | 10 | 3.0 | 5 | 8 | 빠른 이동 + 지그재그 (sin(time×3) × 30px) | 반지름 8 |
| 골렘 | 60 | 0.6 | 20 | 15 | 높은 HP, 넉백 저항 50% | 반지름 16 |
| 마법사(적) | 25 | 1.0 | 12 | 20 | 원거리 탄 발사 (3초 간격, 탄속 4.0) | 반지름 11 |
| 해골전사 | 35 | 1.5 | 15 | 12 | 근접 150px 내 돌진 (속도 ×3, 1.5초, 쿨다운 4초) | 반지름 12 |

### 7.2 엘리트 적 (웨이브 9~10)
- 일반 적의 1.5배 HP, 1.2배 데미지, 2배 XP
- 시각적 구분: 몸체 둘레에 금색 테두리 (strokeStyle `#ffd700`, lineWidth 2)

### 7.3 보스 상세

#### 웨이브 5 보스: 크림슨 워든 (거대 골렘)
| 속성 | 값 |
|------|----|
| HP | 500 |
| 히트박스 | 반지름 32 |
| 속도 | 0.8 |
| 접촉 데미지 | 30 |
| XP | 100 |
| 페이즈 1 (HP 100~50%) | 느린 추적 + 5초마다 지면 충격파 (8방향 원형 탄, 탄속 2.5, 각 탄 데미지 15) |
| 페이즈 2 (HP 50~0%) | 속도 ×1.5 + 충격파 3초마다 + 10초마다 슬라임 2마리 소환 |

#### 웨이브 10 보스: 엘더 리치
| 속성 | 값 |
|------|----|
| HP | 1000 |
| 히트박스 | 반지름 28 |
| 속도 | 1.2 |
| 접촉 데미지 | 25 |
| XP | 200 |
| 페이즈 1 (HP 100~66%) | 3초마다 랜덤 위치 텔레포트 + 2초마다 나선형 탄막 12발 (각 데미지 10) |
| 페이즈 2 (HP 66~33%) | 텔레포트 2초마다 + 8초마다 해골전사 2마리 소환 |
| 페이즈 3 (HP 33~0%) | 지속 나선형 탄막 (1초마다) + 유효 플레이 영역 80%로 축소 (화면 가장자리 어둡게) |

---

## §8. 무기 시스템

### 8.1 무기 상세

| 무기 | 타입 | 기본 데미지 | 쿨다운 | 범위/사거리 | 설명 |
|------|------|------------|--------|------------|------|
| 룬볼트 | 발사체 | 10 | 0.8초 | 직선 400px | 가장 가까운 적 방향으로 발사. 관통 없음. 탄속 6.0 |
| 화염 오라 | 범위 | 5/tick | 1.5초(tick 0.3초) | 반경 80px | 플레이어 주변 원형 범위. 0.3초마다 데미지 tick |
| 얼음 창 | 발사체 | 18 | 1.2초 | 직선 350px | 적중 시 1.5초 슬로우(50%). 관통 1회. 탄속 5.0 |
| 번개 체인 | 체인 | 8 | 2.0초 | 연쇄 120px | 가장 가까운 적 → 주변 3마리 연쇄. 연쇄마다 데미지 ×0.8 |
| 보호 실드 | 방어 | 3 | 상시 | 반경 40px | 회전 구체 3개 (2초 주기). 접촉 적에게 넉백 50px + 데미지. 피해 감소 -15% |

### 8.2 무기 강화 (레벨별)

각 무기는 최대 레벨 5. 레벨업 업그레이드에서 선택 시 레벨 +1:

| 무기 | Lv2 | Lv3 | Lv4 | Lv5 |
|------|-----|-----|-----|-----|
| 룬볼트 | 데미지 15 | 발사체 2개 | 쿨다운 0.64초 | 관통 1회 |
| 화염 오라 | 범위 100px | 데미지 8/tick | 범위 120px | 데미지 13/tick |
| 얼음 창 | 슬로우 70% | 관통 +1(총2) | 쿨다운 0.9초 | 슬로우 적 데미지 2배 |
| 번개 체인 | 연쇄 5마리 | 데미지 12 | 쿨다운 1.4초 | 연쇄 감소 0%(동일 데미지) |
| 보호 실드 | 구체 4개 | 넉백 80px | 피해 감소 25% | 구체 6개, 회전속도 2배 |

---

## §9. 업그레이드 시스템 (로그라이크)

### 9.1 레벨업 시 3택 1
레벨업 시 게임 일시정지(LEVEL_UP 상태) → 3장의 업그레이드 카드 표시 → 1장 선택.

**카드 풀:**
| 카테고리 | 이름 | 효과 | 최대 | 등급 |
|----------|------|------|------|------|
| 무기 획득 | 화염 오라 | 화염 오라 무기 추가 | 1 | 희귀 |
| 무기 획득 | 얼음 창 | 얼음 창 무기 추가 | 1 | 희귀 |
| 무기 획득 | 번개 체인 | 번개 체인 무기 추가 | 1 | 희귀 |
| 무기 획득 | 보호 실드 | 보호 실드 무기 추가 | 1 | 전설 |
| 무기 강화 | [보유 무기] 강화 | 보유 무기 레벨 +1 | Lv5 | 일반 |
| 스탯 | HP 회복 | HP +30 회복 | ∞ | 일반 |
| 스탯 | 최대 HP 증가 | 최대 HP +20 | 5 | 일반 |
| 스탯 | 이동 속도 증가 | 속도 +0.5 | 6 | 일반 |
| 스탯 | 자석 범위 증가 | 자석 +30px | 5 | 일반 |
| 스탯 | 쿨다운 감소 | 쿨다운 -8% | 5 | 희귀 |
| 스탯 | 데미지 배율 | 데미지 ×1.15 | 5 | 희귀 |
| 특수 | 행운의 주문 | 행운 +10% | 5 | 희귀 |
| 특수 | 경험치 부스트 | XP 획득 +20% | 3 | 전설 |

### 9.2 카드 드로우 규칙
1. 풀에서 3장 무작위 선택 (중복 불가)
2. 이미 보유한 무기의 "획득" 카드는 풀에서 제거
3. 무기가 최대 레벨(Lv5)이면 해당 "강화" 카드 제거
4. 스탯이 최대 스택이면 해당 스탯 카드 제거
5. **행운** 스탯이 높을수록 희귀/전설 등급 출현 확률 증가:
   - 기본: 일반 70%, 희귀 25%, 전설 5%
   - 행운 최대(50%): 일반 45%, 희귀 40%, 전설 15%
6. 유효 카드가 3장 미만이면 남은 카드 + "HP 회복" 카드로 채움

### 9.3 업그레이드 카드 UI
- 3장 가로 배치 (카드 크기: 너비 160px, 높이 220px)
- 카드 간격: 20px
- 배경: `#2a2a4a`, 테두리: 등급별 색상 (일반 `#888888`, 희귀 `#00d4ff`, 전설 `#ffd700`)
- 상단: 아이콘 (Canvas로 무기/스탯 아이콘 드로잉, 48×48px 영역)
- 중앙: 이름 (16px 볼드, 흰색)
- 하단: 효과 설명 (12px, `#aaaaaa`)
- 카드 슬라이드 인 애니메이션: 상단에서 y: -300 → 중앙, 0.3초, easeOutBack
- 선택 시: 선택 카드 scale 1.1 + 글로우 → 나머지 alpha 0 → 0.5초 후 PLAYING 복귀
- 키보드: 1/2/3 키, 마우스: 클릭, 터치: 탭 (F21: 모든 입력 지원)
- 카드 최소 터치 영역: 160×220px (F24: 48px 초과하므로 OK)

---

## §10. 난이도 시스템

### 10.1 웨이브 스폰 테이블

| 웨이브 | 지속(초) | 스폰 간격(초) | 적 구성 | 동시 최대 적 | 특이사항 |
|--------|---------|-------------|---------|-------------|---------|
| 1 | 30 | 2.0 | 슬라임 100% | 15 | 튜토리얼 |
| 2 | 35 | 1.8 | 슬라임 80%, 박쥐 20% | 20 | |
| 3 | 40 | 1.5 | 슬라임 50%, 박쥐 30%, 해골전사 20% | 25 | |
| 4 | 45 | 1.3 | 슬라임 30%, 박쥐 20%, 골렘 20%, 해골전사 30% | 30 | |
| 5 | 60 | 1.0 | **보스: 크림슨 워든** + 슬라임 50%, 박쥐 50% | 35 | 보스 웨이브 |
| 6 | 45 | 1.2 | 박쥐 30%, 골렘 30%, 마법사 20%, 해골전사 20% | 35 | 마법사 첫 등장 |
| 7 | 50 | 1.0 | 전 종류 균등 (20% × 5) | 40 | |
| 8 | 50 | 0.8 | 골렘 30%, 마법사 30%, 해골전사 40% | 45 | 강적 비중↑ |
| 9 | 55 | 0.7 | 전 종류 + 엘리트 20% | 50 | 엘리트 혼합 |
| 10 | 90 | 0.8 | **보스: 엘더 리치** + 전 종류 혼합 | 50 | 최종 보스 |

### 10.2 적 스폰 위치
- 플레이어 위치 기준 반경 500~600px에서 360° 무작위 방향 스폰
- 화면 밖 최소 50px 보장
- 동시 최대 적 수 초과 시 스폰 대기 (풀에 반환 안 함, 타이머만 정지)

### 10.3 레벨업 XP 테이블
| 레벨 | 필요 XP | 누적 XP |
|------|---------|---------|
| 1→2 | 20 | 20 |
| 2→3 | 35 | 55 |
| 3→4 | 55 | 110 |
| 4→5 | 80 | 190 |
| 5→6 | 110 | 300 |
| 6→7 | 150 | 450 |
| 7→8 | 200 | 650 |
| 8→9 | 260 | 910 |
| 9→10 | 330 | 1240 |
| 10+ | 330 + (레벨-10)×50 | — |

---

## §11. 점수 시스템

### 11.1 점수 구성
| 행동 | 점수 |
|------|------|
| 슬라임 처치 | 10 |
| 박쥐 처치 | 15 |
| 해골전사 처치 | 20 |
| 골렘 처치 | 30 |
| 마법사(적) 처치 | 35 |
| 엘리트 처치 | 기본 점수 ×2 |
| 크림슨 워든 처치 | 500 |
| 엘더 리치 처치 | 1000 |
| 웨이브 클리어 보너스 | 웨이브 번호 × 50 |
| 노대미지 웨이브 보너스 | +200 |
| 생존 시간 보너스 (클리어 시) | 남은 HP × 10 |

### 11.2 점수 표시
- 우상단에 상시 표시 (24px 볼드, 흰색, shadowBlur 4)
- 처치 시 적 위치에 점수 팝업 (0.8초간 y -30px 이동 + alpha 1→0 tween)
- 게임오버/결과 화면에서 최종 점수 + 최고 점수 비교 표시
- 최고 점수는 localStorage에 저장 (try-catch 래핑 — F8)
  - **저장 순서(Cycle 2 교훈)**: `isNewBest = score > getBest()` 판정 먼저 → `saveBest(score)` 저장 나중에

---

## §12. 업적/도전과제 시스템

### 12.1 업적 목록 (8개)

| ID | 이름 | 조건 | Canvas 아이콘 |
|----|------|------|--------------|
| ACH_FIRST_CLEAR | 첫 클리어 | 10웨이브 돌파 | 트로피 (금색 컵) |
| ACH_NO_DAMAGE | 무적 웨이브 | 1웨이브를 피격 0으로 클리어 | 실드 (사이안 원+십자) |
| ACH_100_KILLS | 학살자 | 한 런에서 100킬 | 해골 (원+빈 눈) |
| ACH_ALL_WEAPONS | 룬 마스터 | 5종 무기 모두 획득 | 교차 검 |
| ACH_BOSS_FAST | 속전속결 | 보스를 30초 이내 처치 | 번개 (지그재그 선) |
| ACH_LEVEL_10 | 초월자 | 레벨 10 달성 | 별 (오각별) |
| ACH_5000_SCORE | 점수왕 | 5000점 이상 달성 | 왕관 (삼각+원 장식) |
| ACH_SURVIVE_5MIN | 끈질긴 생존자 | 5분 이상 생존 | 시계 (원+바늘) |

### 12.2 업적 알림 UI
- 달성 시 화면 상단에서 슬라이드 인 (y: -60 → 10, 0.3초, easeOutBack)
- 크기: 300×50px
- 배경: `rgba(0,0,0,0.85)`, 테두리: `#ffd700` (lineWidth 2)
- 좌측: 아이콘 (32×32), 우측: 업적명 + "달성!" (14px 볼드)
- 3초 후 슬라이드 아웃 (y → -60, tween)
- 업적 데이터는 localStorage에 영구 저장 (try-catch 래핑)

### 12.3 UI 터치 타겟 (F20, F24)
모든 인터랙티브 UI 요소의 최소 터치 영역: **48×48px**
```javascript
const CONFIG = { MIN_TOUCH_TARGET: 48 };
function touchSafe(w, h) {
  return { w: Math.max(CONFIG.MIN_TOUCH_TARGET, w), h: Math.max(CONFIG.MIN_TOUCH_TARGET, h) };
}
```
적용 대상: 일시정지 버튼(48×48), 업그레이드 카드(160×220), 재시작 버튼(200×48), 타이틀 시작 버튼(240×56), 가상 조이스틱(반지름 60)

---

## §13. 오디오 시스템

### 13.1 Web Audio API 절차적 사운드

> setTimeout 완전 배제. 모든 스케줄링은 `oscillator.start(ctx.currentTime + delay)` 사용 (F2).
> SoundManager 초기화는 첫 사용자 상호작용(클릭/탭) 시 AudioContext 생성 (브라우저 자동재생 정책 준수).

#### BGM (3종)
1. **타이틀 BGM**: C장조 아르페지오 (C4-E4-G4-C5 반복), 80 BPM, 삼각파 + 사인파, gain 0.15
2. **전투 BGM**: Am 진행 (A3-C4-E4-A4), 140 BPM, 사각파 베이스 + 삼각파 멜로디, gain 0.12
3. **보스 BGM**: Dm 진행 (D3-F3-A3-D4), 160 BPM, 톱니파 베이스 + 사각파 리드, gain 0.15

#### 효과음 (7종)
| 이름 | 파형 | 주파수 | 지속 | 트리거 |
|------|------|--------|------|--------|
| 룬볼트 발사 | 사인파 | 800→400Hz 슬라이드 | 0.1초 | fireRuneBolt() |
| 화염 tick | 노이즈(버퍼) + 사인파 200Hz | — | 0.15초 | updateFireAura() tick |
| 얼음 창 발사 | 삼각파 | 1200→1800Hz | 0.12초 | fireIceLance() |
| 번개 활성 | 사각파 + 노이즈 | 100→2000Hz 급상승 | 0.08초 | fireLightningChain() |
| 플레이어 피격 | 노이즈(버퍼) | bandpass 150Hz | 0.2초 | checkEnemyPlayerHits() 피격 시 |
| 레벨업 | 삼각파 | C5→E5→G5 순차 (각 0.1초) | 0.4초 | checkLevelUp() |
| 젬 수집 | 사인파 | 1000→1500Hz | 0.05초 | updateGems() 수집 시 |

---

## §14. 게임 페이지 사이드바 메타데이터

```yaml
game:
  title: "룬 서바이버"
  description: "고대 룬 마법사가 되어 사방에서 몰려오는 몬스터 무리 속에서 생존하세요! 자동 공격 무기를 수집하고 로그라이크 업그레이드로 매 판 새로운 빌드를 경험하는 서바이버라이크 액션."
  genre: ["action"]
  playCount: 0
  rating: 0
  controls:
    - "WASD / 방향키: 이동"
    - "1/2/3: 업그레이드 선택"
    - "ESC: 일시정지"
    - "터치: 가상 조이스틱 이동"
  tags:
    - "#서바이버라이크"
    - "#로그라이크"
    - "#자동전투"
    - "#보스전"
    - "#업그레이드"
    - "#액션"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## §15. 홈 페이지 GameCard 데이터

```yaml
thumbnail: "games/rune-survivor/thumbnail.svg"  # 4:3 비율, 게임 하이라이트 장면
title: "룬 서바이버"
description: "몬스터 무리 속에서 생존하며 로그라이크 업그레이드로 성장하는 서바이버라이크 액션"
genre: ["action"]
playCount: 0
addedAt: "2026-03-22"
featured: true
```

---

## §16. 구현 검증 체크리스트

### 16.1 초기화 순서 체크리스트 (F11)
```
1. ✅ 전역 상수/설정 선언 (CONFIG, COLORS, WAVE_TABLE, XP_TABLE, ENEMY_TYPES, WEAPON_TYPES, ...)
2. ✅ 전역 변수 선언 (let canvas, ctx, gameState, player, enemies, ...)
3. ✅ 유틸리티 클래스 정의 (TweenManager, ObjectPool, SoundManager)
4. ✅ 게임 로직 함수 정의 (update*, draw*, check*, fire*, ...)
5. ✅ DOM 할당 (canvas = document.getElementById('gameCanvas'))
6. ✅ Canvas 설정 (resizeCanvas(), DPR 적용, buildBgCache())
7. ✅ 이벤트 리스너 등록 (keydown, keyup, mousedown, mousemove, touchstart, touchmove, touchend, resize)
8. ✅ init() 호출 (gameState = TITLE, 초기 오브젝트 생성)
9. ✅ requestAnimationFrame(gameLoop) 시작
```

### 16.2 변수 사용처 검증 테이블 (F15)

| 변수명 | 선언 위치 | 갱신 함수 | 참조 함수 | 용도 |
|--------|----------|----------|----------|------|
| waveClearing | 전역 let | checkWaveComplete() | update(), checkWaveComplete() | 가드 플래그 |
| isTransitioning | 전역 let | beginTransition() | handleInput() | 전환 중 입력 차단 |
| isLevelingUp | 전역 let | checkLevelUp() | checkLevelUp(), selectUpgrade() | 레벨업 중복 방지 |
| isDying | 전역 let | checkGameOver() | checkEnemyPlayerHits() | 사망 중 피격 무시 |
| inputMode | 전역 let | keydown/mousemove/touchstart 핸들러 | render(조이스틱 표시 분기) | 입력 모드 분기 |
| timeScale | 전역 let | bossDefeated tween, enterState() | gameLoop(dt 곱연산) | 슬로우모션 |
| screenShake | 전역 obj | triggerShake() | updateScreenShake(), applyScreenShake() | 화면 흔들림 |

### 16.3 기능별 세부 구현 체크리스트 (F19)

| 기능 | 세부 항목 | 상태 |
|------|----------|------|
| 플레이어 이동 | WASD 입력 | ☐ |
| | 방향키 입력 | ☐ |
| | 터치 조이스틱 | ☐ |
| | 대각선 이동 정규화 | ☐ |
| | 맵 경계 제한 | ☐ |
| | 이동 방향 기울어짐 (±5°) | ☐ |
| 무기: 룬볼트 | 자동 발사 (쿨다운 0.8초) | ☐ |
| | 가장 가까운 적 타겟팅 | ☐ |
| | 적 적중 시 데미지 적용 | ☐ |
| | 적중 파티클 이펙트 | ☐ |
| | Lv2~5 강화 효과 | ☐ |
| 무기: 화염 오라 | 플레이어 주변 원형 범위 표시 | ☐ |
| | 범위 내 적에게 0.3초 tick 데미지 | ☐ |
| | 화염 파티클 이펙트 | ☐ |
| | Lv2~5 강화 효과 | ☐ |
| 무기: 얼음 창 | 발사 + 적중 시 슬로우 50% | ☐ |
| | 관통 로직 (Lv1: 0회) | ☐ |
| | 얼음 파티클 이펙트 | ☐ |
| | Lv2~5 강화 효과 | ☐ |
| 무기: 번개 체인 | 가까운 적 → 3마리 연쇄 데미지 | ☐ |
| | 번개 시각 이펙트 (지그재그 선) | ☐ |
| | Lv2~5 강화 효과 | ☐ |
| 무기: 보호 실드 | 회전 구체 3개 렌더링 | ☐ |
| | 접촉 넉백 + 데미지 | ☐ |
| | 피해 감소 -15% | ☐ |
| | Lv2~5 강화 효과 | ☐ |
| 젬 시스템 | 적 사망 시 XP 젬 드롭 | ☐ |
| | 5% 확률 HP 회복 젬 (HP +15) | ☐ |
| | 자석 범위 내 자동 흡수 | ☐ |
| | XP 누적 | ☐ |
| | 수집 파티클 이펙트 | ☐ |
| 레벨업 | XP 충족 → LEVEL_UP 전환 | ☐ |
| | 3장 카드 생성 (풀 기반) | ☐ |
| | 카드 슬라이드 인 애니메이션 | ☐ |
| | 카드 선택 (1/2/3 + 클릭 + 탭) | ☐ |
| | 효과 적용 → PLAYING 복귀 | ☐ |
| | 레벨업 파티클 이펙트 | ☐ |
| 웨이브 | 10웨이브 순차 진행 | ☐ |
| | 웨이브 간 3초 휴식 + 알림 UI | ☐ |
| | 웨이브 번호 좌상단 표시 | ☐ |
| | 웨이브 타이머 진행바 (상단) | ☐ |
| 보스: 크림슨 워든 | 2페이즈 AI 전환 | ☐ |
| | 충격파 공격 (8방향 탄) | ☐ |
| | 슬라임 소환 (페이즈2) | ☐ |
| | HP바 표시 | ☐ |
| 보스: 엘더 리치 | 3페이즈 AI 전환 | ☐ |
| | 텔레포트 + 잔상 이펙트 | ☐ |
| | 나선형 탄막 | ☐ |
| | 해골전사 소환 (페이즈2) | ☐ |
| | 화면 축소 효과 (페이즈3) | ☐ |
| | HP바 표시 | ☐ |
| 업적 | 8개 업적 조건 판정 | ☐ |
| | 달성 알림 슬라이드 UI | ☐ |
| | localStorage 영구 저장 | ☐ |
| 오디오 | BGM 3종 (타이틀/전투/보스) | ☐ |
| | 효과음 7종 | ☐ |
| | 첫 상호작용 시 AudioContext 생성 | ☐ |
| UI | HP바 (좌상단, 빨간→녹색 그라데이션) | ☐ |
| | XP바 (HP바 아래, 사이안) | ☐ |
| | 점수 표시 (우상단) | ☐ |
| | 웨이브 번호 (상단 중앙) | ☐ |
| | 미니맵 (우하단, 100×100) | ☐ |
| | 보유 무기 아이콘 (좌하단) | ☐ |
| | 일시정지 버튼 (우상단, 48×48) | ☐ |
| | 일시정지 오버레이 | ☐ |
| | 게임오버 화면 (점수 + 통계) | ☐ |
| | 결과 화면 (업적 + 최고점) | ☐ |
| | 타이틀 화면 (로고 + 시작 버튼) | ☐ |

### 16.4 수치 정합성 검증 테이블 (F7)

> 기획서의 모든 수치가 코드 상수와 1:1 일치하는지 대조.

| 항목 | 기획서 값 | 코드 상수명 | 확인 |
|------|----------|------------|------|
| 슬라임 HP | 15 | ENEMY_TYPES.slime.hp | ☐ |
| 슬라임 속도 | 1.2 | ENEMY_TYPES.slime.speed | ☐ |
| 슬라임 데미지 | 8 | ENEMY_TYPES.slime.damage | ☐ |
| 슬라임 XP | 5 | ENEMY_TYPES.slime.xp | ☐ |
| 박쥐 HP | 10 | ENEMY_TYPES.bat.hp | ☐ |
| 박쥐 속도 | 3.0 | ENEMY_TYPES.bat.speed | ☐ |
| 골렘 HP | 60 | ENEMY_TYPES.golem.hp | ☐ |
| 마법사 HP | 25 | ENEMY_TYPES.mage.hp | ☐ |
| 해골전사 HP | 35 | ENEMY_TYPES.skeleton.hp | ☐ |
| 크림슨 워든 HP | 500 | BOSS_TYPES.crimsonWarden.hp | ☐ |
| 엘더 리치 HP | 1000 | BOSS_TYPES.elderLich.hp | ☐ |
| 룬볼트 데미지 | 10 | WEAPON_TYPES.runeBolt.damage | ☐ |
| 룬볼트 쿨다운 | 0.8 | WEAPON_TYPES.runeBolt.cooldown | ☐ |
| 화염 오라 데미지 | 5/tick | WEAPON_TYPES.fireAura.damage | ☐ |
| 얼음 창 데미지 | 18 | WEAPON_TYPES.iceLance.damage | ☐ |
| 번개 체인 데미지 | 8 | WEAPON_TYPES.lightningChain.damage | ☐ |
| 보호 실드 데미지 | 3 | WEAPON_TYPES.shield.damage | ☐ |
| 초기 이동속도 | 3.0 | CONFIG.PLAYER_SPEED | ☐ |
| 초기 자석범위 | 60 | CONFIG.MAGNET_RANGE | ☐ |
| 초기 HP | 100 | CONFIG.PLAYER_HP | ☐ |
| 최대 HP | 200 | CONFIG.PLAYER_MAX_HP | ☐ |
| MIN_TOUCH_TARGET | 48 | CONFIG.MIN_TOUCH_TARGET | ☐ |
| 레벨 1→2 XP | 20 | XP_TABLE[1] | ☐ |
| 웨이브 1 지속 | 30초 | WAVE_TABLE[0].duration | ☐ |
| 웨이브 1 스폰간격 | 2.0초 | WAVE_TABLE[0].spawnInterval | ☐ |
| 웨이브 1 최대적 | 15 | WAVE_TABLE[0].maxEnemies | ☐ |
| 일반 등급 확률 | 70% | CARD_RARITY.common | ☐ |
| 희귀 등급 확률 | 25% | CARD_RARITY.rare | ☐ |
| 전설 등급 확률 | 5% | CARD_RARITY.legendary | ☐ |

### 16.5 금지 패턴 자동 검증 (F1, F2, F8, F9)

구현 완료 후 아래 패턴이 코드에 **0건**인지 검증:
```
❌ assets/            — 디렉토리 존재 금지
❌ .svg"              — SVG 파일 참조 금지 (thumbnail.svg 제외)
❌ setTimeout         — 0건 목표
❌ setInterval        — 0건 목표
❌ alert(             — 금지
❌ confirm(           — 금지
❌ prompt(            — 금지
❌ google fonts       — 외부 리소스 금지
❌ feGaussianBlur     — SVG 필터 금지
❌ ASSET_MAP          — 에셋 맵 금지
❌ SPRITES            — 스프라이트 금지
❌ preloadAssets      — 에셋 프리로드 금지
❌ new Image()        — 이미지 로드 금지
```

### 16.6 스모크 테스트 게이트 (F13 — 리뷰 제출 전 필수)
1. ✅ `index.html` 파일 존재
2. ✅ 브라우저에서 페이지 로드 성공 (흰 화면 아님)
3. ✅ 콘솔 에러 0건
4. ✅ 타이틀 화면 정상 표시
5. ✅ 게임 시작 → 플레이어 이동 (WASD) → 적 출현 → 자동 공격 동작
6. ✅ 적 처치 → 젬 드롭 → 수집 동작
7. ✅ 게임오버 → 재시작 가능
8. ✅ assets/ 디렉토리 미존재 확인

### 16.7 회귀 테스트 경로 (F14)
수정 후 아래 전체 플로우를 반드시 검증:
```
TITLE → (시작) → PLAYING → (레벨업) → LEVEL_UP → (선택) → PLAYING
→ (웨이브5) → BOSS_INTRO → PLAYING(보스전) → (보스 처치) → PLAYING
→ (ESC) → PAUSED → (ESC) → PLAYING
→ (HP 0) → GAMEOVER → RESULT → (재시작) → TITLE
```

---

## §17. 오브젝트 풀링

> 적·투사체·파티클·젬은 고빈도 생성/소멸이므로 ObjectPool 패턴 필수 (Cycle 2 교훈).

```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 50) { ... }
  acquire() { /* 풀에서 꺼내거나 createFn()으로 새로 생성 */ }
  release(obj) { /* resetFn(obj) 후 풀에 반환 */ }
}
// 순회 중 release: 역순 순회 + splice 패턴
```

| 오브젝트 | 초기 풀 크기 | 예상 최대 동시 활성 |
|----------|-------------|-------------------|
| 적 (Enemy) | 60 | 50 |
| 투사체 (Projectile) | 30 | 20 |
| 파티클 (Particle) | 200 | 150 |
| 젬 (Gem) | 100 | 80 |
| 점수 팝업 (ScorePopup) | 20 | 10 |
| 보스 탄 (BossBullet) | 30 | 20 |

---

## §18. 핵심 함수 시그니처 (F3 — 순수 함수, 전역 참조 0건)

```javascript
// === 이동 ===
function updatePlayerMovement(player, input, dt, config) → void
function normalizeDirection(dx, dy) → {x, y}

// === 무기 ===
function updateWeapons(weapons, enemies, player, dt, dmgTable, pools) → void
function fireRuneBolt(player, target, weaponLevel, pool) → projectile
function updateFireAura(player, enemies, weapon, dt, dmgTable, particles) → void
function fireIceLance(player, target, weaponLevel, pool) → projectile
function fireLightningChain(player, enemies, weapon, dmgTable, particles) → chainTargets[]
function updateShield(player, enemies, shield, dt, particles) → void

// === 적 ===
function spawnEnemy(waveConfig, player, pool, time) → enemy
function updateEnemyAI(enemy, player, dt) → void
function updateBossAI(boss, player, dt, phase, pools) → void
function getBossPhase(boss) → number

// === 충돌 ===
function checkProjectileHits(projectiles, enemies, dmgTable, pools, scoreState) → {kills, newGems}
function checkEnemyPlayerHits(enemies, player, dt, shield, isDying) → {damage, knockbacks}
function circleCollision(ax, ay, ar, bx, by, br) → boolean

// === 젬 ===
function updateGems(gems, player, dt, magnetRange, xpBoost) → {collected, xpGained, hpGained}

// === 레벨/웨이브 ===
function checkLevelUp(player, xpTable, isLevelingUp) → boolean
function generateUpgradeCards(player, weapons, cardPool, luck) → cards[3]
function applyUpgrade(player, weapons, card) → void
function checkWaveComplete(wave, enemies, waveClearing) → boolean
function advanceWave(wave, waveTable) → nextWaveConfig

// === 점수/스탯 (F16: 단일 갱신 경로) ===
function addScore(scoreState, amount) → void
function modifyHP(player, amount) → void
function addXP(player, amount, xpBoost) → void

// === 파티클 ===
function spawnDeathParticles(x, y, color, pool, count) → void
function spawnCollectParticles(x, y, targetX, targetY, pool) → void
function spawnLevelUpParticles(x, y, pool) → void
function updateParticles(particles, dt) → void

// === 상태 전환 (F23) ===
function beginTransition(target, options, tweenMgr, priority, currentState) → boolean
function enterState(state, gameData) → void

// === 렌더링 (순수 출력) ===
function drawPlayer(ctx, player, time) → void
function drawEnemy(ctx, enemy, time) → void
function drawBoss(ctx, boss, time, phase) → void
function drawProjectile(ctx, proj, time) → void
function drawGem(ctx, gem, time) → void
function drawParticles(ctx, particles) → void
function drawUI(ctx, state, player, wave, score, weapons) → void
function drawUpgradeCards(ctx, cards, selectedIndex, time) → void
function drawTitleScreen(ctx, time) → void
function drawGameOverScreen(ctx, result) → void
function drawResultScreen(ctx, result, achievements) → void
function drawPauseOverlay(ctx) → void
function drawJoystick(ctx, joystick) → void
function drawMinimap(ctx, player, enemies, mapSize) → void

// === 유틸 ===
function touchSafe(w, h, minTouch) → {w, h}
function buildBgCache(offCanvas, offCtx, w, h, stars) → void
function applyScreenShake(ctx, shake) → void
function triggerShake(shake, intensity, duration) → void
```

---

## §19. thumbnail.svg 명세

게임 하이라이트 장면: 룬 마법사(중앙)가 사이안 글로우 속에서 5종 무기를 동시에 발사하며, 사방에서 몬스터가 몰려오고, XP 젬이 흩뿌려진 장면.

- 크기: 640×480 (4:3 비율)
- 배경: 어두운 네이비 `#1a1a2e` + 그리드 패턴
- 중앙: 룬 마법사 (보라 로브 `#4a00e0` + 사이안 글로우 오라 `#00d4ff`)
- 주변: 각 무기의 시각 이펙트 (화염 원, 얼음 창, 번개, 실드 구체, 룬볼트 궤적)
- 적: 슬라임 3~4마리 (네온 그린) + 보스 실루엣 (상단 배경, 반투명)
- 젬: 민트 그린 `#00ff88` 다이아몬드 형태 5~6개 흩뿌림
- 텍스트: "룬 서바이버" 타이틀 (상단 중앙, 볼드, 사이안 글로우)
- 최소 크기: 15KB+
- filter/gradient 적극 사용 (thumbnail.svg만 예외적으로 SVG 필터 허용)
