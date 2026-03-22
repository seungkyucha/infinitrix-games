---
game-id: abyss-keeper
title: 어비스 키퍼
genre: action, casual
difficulty: medium
---

# 어비스 키퍼 (Abyss Keeper) — 사이클 #24 게임 기획서

> **1페이지 요약**: 심해 등대지기가 되어 평화로운 낚시·자원 채집(casual)과 심연의 괴수 격퇴(action)를 번갈아 수행하는 이중 페이즈 서바이벌. 15개 조수(Tide) 스테이지 + 3 심연 보스 + 히든 스테이지 "마리아나 해구"로 구성. 등대 업그레이드 트리, 무기 제작, 날씨/시간대 변화가 전략적 깊이를 더한다. SeededRNG 프로시저럴 파도 패턴 + 랜덤 어획물로 매 플레이가 다른 경험. **action+casual 장르 공백을 완전 해소**한다.

> **MVP 경계**: Phase 1(핵심 루프: 낚시→전투→업그레이드, Tide 1~5 + 보스1) + Phase 2(Tide 6~15 + 보스2,3 + 날씨 + 히든) 순차 구현. Phase 1만으로도 완전한 게임 경험 제공 필수.

---

## §0. 피드백 매핑 (이전 사이클 교훈)

### 검증 완료 패턴 (platform-wisdom 참조) ✅
> 아래 항목은 18사이클 이상 검증되어 platform-wisdom.md에 상세 기술됨. 본 기획서에서는 **적용 섹션만 표기**한다.

| ID | 교훈 요약 | 적용 섹션 |
|----|----------|----------|
| F1 | assets/ 디렉토리 절대 생성 금지 — 7사이클 연속 성공 [Cycle 1~17] | §4.1 |
| F2 | 외부 CDN/폰트 0건 [Cycle 1] | §4.1 |
| F3 | iframe 환경 confirm/alert 금지 → Canvas 모달 [Cycle 1] | §6.4 |
| F4 | setTimeout 0건 → tween onComplete 전용 [Cycle 1~2] — 12사이클 연속 | §5.2 |
| F5 | 가드 플래그로 tween 콜백 1회 실행 보장 [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition 체계 [Cycle 3 B2] | §6.1 |
| F7 | 상태×시스템 매트릭스 필수 [Cycle 2 B1] | §6.2 |
| F8 | 판정 먼저, 저장 나중에 [Cycle 2 B4] | §11.1 |
| F9 | 순수 함수 패턴 (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | 수치 정합성 테이블 (기획=코드 1:1) [Cycle 7] | §13.1 |
| F11 | 터치 타겟 최소 48×48px + Math.max 강제 [Cycle 22] | §3.3 |
| F12 | TDZ 방지: 변수 선언 → DOM 할당 → 이벤트 등록 순서 [Cycle 5] | §5.1 |
| F13 | TweenManager clearImmediate() API 분리 [Cycle 4 B1] | §5.2 |
| F14 | 단일 값 갱신 경로 통일 (tween vs 직접 대입) [Cycle 5 B2] | §5.2 |
| F15 | 스모크 테스트 게이트 8항목 [Cycle 22] | §13.3 |

### 신규 피드백 (Cycle 23 포스트모템 기반) 🆕

| ID | 교훈 | 해결책 | 적용 섹션 |
|----|------|--------|----------|
| F44 | P0 GAMEOVER→TITLE 5라운드 지속 — RESTART_ALLOWED 패턴을 기획서 단계에서 명시하지 않아 반복 수정 | 기획서 §6.1에 RESTART_ALLOWED 화이트리스트를 명시적으로 선언하여 1차 통과 목표 | §6.1 |
| F45 | 단일 파일 2,400줄+ 비대화 지속 — REGION 주석으로만 대응 중 | 10개 REGION 코드 영역 가이드를 §5.3에 줄번호 범위와 함께 명시. 공용 패턴 재활용으로 총량 2,500줄 이내 목표 | §5.3 |
| F46 | 밸런스 자동 검증 미비 — 15층×3난이도×다수 조합의 밸런스를 코드 리뷰만으로 판별 불가 | 3구간 밸런스 테이블(초반/중반/후반)을 §8.1에 수치화. CONFIG 상수와 1:1 대응. 핵심 조합의 DPS/EHP 산식 명시 | §8.1, §13.4 |
| F47 | 2차 리뷰 2회차 소요 — 초기 구현 시 P0/P2 미해결 상태로 제출 | 스모크 테스트 게이트 확장(10항목). RESTART_ALLOWED + 터치 타겟 48px를 게이트 필수 항목으로 추가 | §13.3 |
| F48 | 피드백 매핑 2계층 분리 시 검증완료 요약이 과도하게 간소 — platform-wisdom 역참조 부재 | 검증 완료 테이블에 [Cycle N BN] 형식 역참조 추가 (본 §0 테이블 적용) | §0 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 1.1 컨셉
어비스 키퍼는 끝없는 심해의 마지막 등대를 지키는 수호자의 이야기다. 낮에는 심해에서 물고기를 낚고 표류물을 채집하여 등대를 강화하고(캐주얼 페이즈), 밤에는 심연에서 밀려오는 괴수들로부터 등대를 방어한다(액션 페이즈). 두 페이즈가 자연스럽게 순환하며, 캐주얼 유저는 낚시와 건설에, 액션 유저는 전투에 몰입할 수 있다.

### 1.2 핵심 재미 3축
1. **낚시·채집의 캐주얼 만족감**: 타이밍 기반 낚시 미니게임, 랜덤 어획물 수집 도감, 표류물 탐색. "다음에 뭐가 잡힐까?"의 기대감.
2. **실시간 전투 액션**: 작살 투척, 음파포 발사, 그물 설치 등 무기별 차별화된 공격. 심해 괴수의 패턴을 읽고 회피하며 등대를 방어하는 긴장감.
3. **등대 성장 시스템**: 조명 범위 확장, 내구도 강화, 소나 탐지 범위 증가 등 영구 업그레이드 트리. "내 등대를 키운다"는 소유감과 전략적 투자 결정.

### 1.3 스토리/내러티브
- **배경**: 고대 해양 문명 "아틀라스"가 심연에 봉인한 "심연의 균열"이 깨어나면서, 바다 깊은 곳에서 괴수가 올라오기 시작했다. 플레이어는 대대로 등대를 지켜온 키퍼 가문의 마지막 후예.
- **목표**: 15개 조수(Tide)를 버텨내며 3개의 봉인 조각을 모아 심연의 균열을 다시 봉인한다.
- **스토리 전달**: 각 보스 격파 후 짧은 컷신(Canvas 연출) + 조수마다 발견하는 "해저 기록물"(표류물 형태)로 아틀라스 문명의 비밀을 점진적으로 드러냄.
- **엔딩**: 봉인 완료 후 등대에서 수평선을 바라보는 평화로운 결말. 히든 스테이지 클리어 시 "아틀라스의 진실" 추가 엔딩.

### 1.4 장르 공백 해소
- **action + casual = 0개** → 본 게임으로 **완전 해소**
- 기존 casual 게임(neon-dash-runner, mini-idle-farm 등)과 차별화: 실시간 전투 액션이 결합된 이중 페이즈 구조
- 기존 action 게임(rune-survivor, mini-survivor-arena 등)과 차별화: 낚시·건설의 캐주얼 이완 구간 제공

---

## §2. 게임 규칙 및 목표

### 2.1 기본 규칙
- 게임은 **캐주얼 페이즈**(낮)와 **액션 페이즈**(밤)가 반복되는 조수(Tide) 사이클로 진행
- 각 Tide = 캐주얼 페이즈(60초) + 액션 페이즈(90초) = 약 2.5분
- 캐주얼 페이즈: 낚시, 표류물 채집, 등대 업그레이드, 장비 제작
- 액션 페이즈: 파도와 함께 밀려오는 심해 괴수 격퇴, 등대 방어
- 등대 HP가 0이 되면 게임 오버 (획득 자원의 30%를 영구 통화로 보존)

### 2.2 승리/패배 조건
- **승리**: Tide 15 보스(심연의 군주) 격파 + 봉인 완료
- **패배**: 등대 HP 0 → 런 종료. 획득 산호(영구 통화)의 30% 보존
- **히든 스테이지**: Tide 1~15 전부 등대 무손상 + 해저 기록물 전부 수집 시 "마리아나 해구" 해금

### 2.3 조수(Tide) 구성
| Tide | 테마 | 특징 | 보스 |
|------|------|------|------|
| 1~5 | 천해(淺海) | 기본 낚시·전투 학습, 약한 괴수 | Tide 5: 심해 앵글러 |
| 6~10 | 중심해(中深海) | 날씨 변화 시작, 중급 괴수 + 함정 해류 | Tide 10: 크라켄 유생 |
| 11~15 | 심연(深淵) | 폭풍 + 안개 + 강력 괴수 동시 출현 | Tide 15: 심연의 군주 |
| 16 | 마리아나 해구 (히든) | 순수 탐험 + 퍼즐 (전투 없음) | — |

### 2.4 난이도 3종
| 난이도 | 등대HP 배율 | 적 강화 | 낚시 보상 | 전투 보상 | 잠금 조건 |
|--------|-----------|---------|----------|----------|----------|
| 쉬움 | ×1.5 | ×0.7 | ×1.3 | ×0.8 | 없음 |
| 보통 | ×1.0 | ×1.0 | ×1.0 | ×1.0 | 없음 |
| 어려움 | ×0.7 | ×1.5 | ×0.7 | ×1.5 | Tide 10 이상 클리어 |

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 캐주얼 페이즈 | 액션 페이즈 |
|----|-------------|-----------|
| WASD / 방향키 | 등대 주변 이동 (낚시 포인트 탐색) | 캐릭터 이동 (등대 주변 방어) |
| Space | 낚시 캐스트 / 릴 타이밍 | 주무기 공격 |
| E | 표류물 채집 / 상점 상호작용 | 보조무기 사용 |
| Q | 등대 업그레이드 메뉴 토글 | 소나 파동 발사 (범위 공격) |
| 1~3 | 무기 슬롯 전환 | 무기 슬롯 전환 |
| ESC | 일시정지 메뉴 | 일시정지 메뉴 |

### 3.2 마우스
| 동작 | 캐주얼 페이즈 | 액션 페이즈 |
|------|-------------|-----------|
| 좌클릭 | 낚시 캐스트 / UI 버튼 | 공격 방향 지정 + 발사 |
| 우클릭 | 표류물 채집 | 보조무기 사용 |
| 휠 | 무기 슬롯 전환 | 무기 슬롯 전환 |
| 이동 | 조준 방향 표시 | 조준 방향 표시 |

### 3.3 터치 (모바일)
| 동작 | 캐주얼 페이즈 | 액션 페이즈 |
|------|-------------|-----------|
| 가상 조이스틱 (좌측) | 이동 | 이동 |
| 탭 (우측) | 낚시/채집 | 공격 |
| 더블탭 (우측) | — | 소나 파동 |
| 상단 슬롯 버튼 | 무기 전환 / 업그레이드 | 무기 전환 |

> ⚠️ **F11 준수**: 모든 터치 버튼은 `Math.max(48, computed)` px 이상. 가상 조이스틱 영역 최소 120×120px.

### 3.4 뷰포트 대응
| 뷰포트 | 레이아웃 조정 |
|--------|-------------|
| 320px | 조이스틱 80px, 버튼 48px, UI 스케일 0.7 |
| 480px | 조이스틱 100px, 버튼 52px, UI 스케일 0.8 |
| 768px | 표준 레이아웃 |
| 1024px+ | 사이드 정보 패널 표시 |

> ⚠️ **F42 준수**: 모든 UI 요소 Y좌표에 `Math.min(H*0.72, H-(n*(btnH+gap)+margin))` 패턴 적용.

---

## §4. 시각적 스타일 가이드

### 4.1 에셋 원칙
- **assets/ 디렉토리 절대 생성 금지** (F1 — 7사이클 연속 성공, 8사이클 연속 목표)
- **외부 CDN/폰트 0건** (F2)
- 모든 비주얼은 **Canvas 2D API로 직접 렌더링** (인라인 SVG 생성 함수)
- SVG 필터(feGaussianBlur 등) **사용 금지** — Canvas shadow/gradient로 대체

### 4.2 색상 팔레트

| 용도 | 색상 | HEX |
|------|------|-----|
| 심해 배경 (깊은 바다) | 미드나이트 블루 | #0A1628 |
| 심해 배경 (중간) | 딥 오션 | #0D2847 |
| 얕은 바다 | 오션 블루 | #1A4B7A |
| 등대 조명 | 웜 골드 | #FFD93D |
| 등대 조명 확산 | 소프트 앰버 | #FFA94D |
| 캐주얼 UI 강조 | 아쿠아 민트 | #38D9A9 |
| 액션 UI 강조 | 코랄 레드 | #FF6B6B |
| 괴수 눈 / 위험 | 네온 퍼플 | #BE4BDB |
| 보스 오라 | 딥 크림슨 | #C92A2A |
| HP바 | 에메랄드 | #51CF66 |
| 텍스트 기본 | 밝은 회색 | #E9ECEF |
| 텍스트 보조 | 중간 회색 | #ADB5BD |

### 4.3 배경 / 환경

- **캐주얼 페이즈**: 부드러운 파도 애니메이션(sin 곡선 3겹 레이어), 등대 조명이 수면 위에서 황금빛으로 퍼져나감, 별이 반짝이는 하늘, 물고기 실루엣이 수면 아래에서 어렴풋이 보임
- **액션 페이즈**: 하늘이 붉은 보라색으로 변하고, 파도가 거세지며, 등대 조명이 유일한 안전 영역, 심연에서 녹색/보라색 발광 이펙트
- **날씨 효과**: 비(파티클 시스템), 안개(반투명 레이어), 폭풍(화면 흔들림 + 번개), 달밤(등대 조명 효과 강화)
- **시간 변화**: 캐주얼→액션 전환 시 하늘 그라데이션이 자연스럽게 변화 (tween 기반, 3초)

### 4.4 드로잉 함수 시그니처 (F9 순수 함수)

```
drawLighthouse(ctx, x, y, scale, hp, maxHp, lightAngle, lightRange)
drawKeeper(ctx, x, y, dir, frame, weapon, isAttacking)
drawMonster(ctx, x, y, type, hp, maxHp, frame, isHurt)
drawBoss(ctx, x, y, phase, hp, maxHp, frame, effects)
drawWave(ctx, waveOffset, amplitude, color, alpha)
drawWeather(ctx, type, intensity, particles)
drawFishingLine(ctx, startX, startY, endX, endY, tension, bobberFrame)
drawUI(ctx, W, H, state, resources, tideNum, phase)
drawUpgradeMenu(ctx, W, H, upgrades, selected, resources)
drawMinigame(ctx, W, H, type, progress, target)
```

> ⚠️ 모든 드로잉 함수는 전역 변수에 직접 접근 금지. 파라미터를 통해서만 데이터를 받는다.

### 4.5 에셋 목록 (Canvas 인라인 렌더링)

| # | 에셋 | 용도 | 크기(논리) | 프레임 수 |
|---|------|------|-----------|----------|
| 1~8 | 키퍼 8방향 | 이동 애니메이션 | 64×64 | 8 |
| 9~11 | 키퍼 공격 (작살/그물/음파) | 공격 모션 | 64×64 | 3 |
| 12 | 등대 | 메인 구조물 | 128×256 | 1 (조명 회전 별도) |
| 13~15 | 일반 괴수 3종 | 해파리/상어/갑각류 | 48×48 | 4 (이동 프레임) |
| 16 | 보스: 심해 앵글러 | Tide 5 보스 | 96×96 | 6 |
| 17 | 보스: 크라켄 유생 | Tide 10 보스 | 120×120 | 6 |
| 18 | 보스: 심연의 군주 | Tide 15 보스 | 160×160 | 8 |
| 19~21 | 무기 아이콘 3종 | 작살/그물/음파포 | 32×32 | 1 |
| 22 | 낚싯대 + 찌 | 낚시 미니게임 | 24×48 | 3 (캐스트/대기/잡기) |
| 23 | 물고기 실루엣 5종 | 수면 아래 배경 | 16~32 | 2 |
| 24 | 표류물 3종 | 채집 오브젝트 | 24×24 | 1 |
| 25 | 썸네일 | 홈 GameCard | 400×300 | 1 |

---

## §5. 핵심 게임 루프 (프레임 기준 로직)

### 5.1 초기화 순서 (F12 TDZ 방지)

```
1. CONFIG 상수 선언
2. 전역 상태 변수 선언 (let으로 초기값 할당)
3. Canvas DOM 할당 (document.getElementById)
4. TweenManager, ObjectPool, SoundManager 인스턴스 생성
5. 이벤트 리스너 등록 (키보드, 마우스, 터치, 리사이즈)
6. 게임 루프 시작 (requestAnimationFrame)
```

### 5.2 메인 루프 (60fps 기준)

```
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // 50ms 상한
  lastTime = timestamp;

  // 1. 입력 처리
  processInput(inputState);

  // 2. ACTIVE_SYSTEMS[currentState]에 따라 시스템 업데이트
  if (ACTIVE_SYSTEMS[state].tween) tweenMgr.update(dt);
  if (ACTIVE_SYSTEMS[state].physics) updatePhysics(dt);
  if (ACTIVE_SYSTEMS[state].ai) updateAI(dt);
  if (ACTIVE_SYSTEMS[state].weather) updateWeather(dt);
  if (ACTIVE_SYSTEMS[state].wave) updateWaves(dt);
  if (ACTIVE_SYSTEMS[state].timer) updateTimer(dt);
  if (ACTIVE_SYSTEMS[state].particles) particlePool.update(dt);
  if (ACTIVE_SYSTEMS[state].fishing) updateFishing(dt);
  if (ACTIVE_SYSTEMS[state].combat) updateCombat(dt);
  if (ACTIVE_SYSTEMS[state].camera) updateCamera(dt);

  // 3. 렌더링
  render(ctx, W, H, state, gameData);

  // 4. 다음 프레임
  requestAnimationFrame(gameLoop);
}
```

> ⚠️ **F4**: setTimeout/setInterval 사용 0건. 모든 지연은 TweenManager onComplete로 처리.
> ⚠️ **F5**: 모든 tween 콜백에 가드 플래그 사용. `if (tideClearing) return; tideClearing = true;`
> ⚠️ **F13**: TweenManager는 `clearImmediate()` API를 분리하여 cancelAll+add 경쟁 조건 방지.
> ⚠️ **F14**: 각 수치(등대HP, 키퍼 위치 등)의 갱신 경로는 tween 또는 직접 대입 중 하나만 사용.

### 5.3 코드 영역 가이드 (REGION 주석)

| # | REGION | 내용 | 예상 줄 수 |
|---|--------|------|-----------|
| 1 | CONFIG & CONSTANTS | 게임 상수, 밸런스 수치, 색상 팔레트 | 1~200 |
| 2 | ENGINE (Tween/Pool/Sound) | TweenManager, ObjectPool, SoundManager, SeededRNG | 201~500 |
| 3 | STATE MACHINE | 상태 정의, 전환, ACTIVE_SYSTEMS, RESTART_ALLOWED | 501~650 |
| 4 | GAME LOGIC - CASUAL | 낚시 시스템, 채집, 업그레이드, 제작 | 651~1000 |
| 5 | GAME LOGIC - ACTION | 전투, AI, 충돌, 무기, 보스 패턴 | 1001~1450 |
| 6 | PROCEDURAL GENERATION | SeededRNG, 파도 패턴, 어획물 테이블, 날씨 | 1451~1650 |
| 7 | RENDERING | 드로잉 함수, 파티클, 카메라, UI | 1651~2150 |
| 8 | AUDIO | Web Audio API, BGM, 효과음 | 2151~2300 |
| 9 | INPUT & EVENTS | 키보드/마우스/터치, 리사이즈 | 2301~2400 |
| 10 | INIT & LOOP | 초기화, 메인 루프, localStorage | 2401~2500 |

> 총 예상: **~2,500줄** (F45 목표 범위 이내)

---

## §6. 상태 머신

### 6.1 상태 정의 및 전환

```
상태 목록:
  BOOT → TITLE → DIFFICULTY_SELECT → CASUAL_PHASE → ACTION_PHASE →
  BOSS_INTRO → BOSS_FIGHT → BOSS_VICTORY → TIDE_RESULT →
  UPGRADE_MENU → GAMEOVER → VICTORY → HIDDEN_STAGE → PAUSE → CONFIRM_MODAL

상태 우선순위 (높을수록 우선):
  BOOT=0, TITLE=1, DIFFICULTY_SELECT=2,
  CASUAL_PHASE=5, FISHING_MINIGAME=5, ACTION_PHASE=5,
  BOSS_INTRO=6, BOSS_FIGHT=6, BOSS_VICTORY=7,
  TIDE_RESULT=7, UPGRADE_MENU=5,
  PAUSE=8, CONFIRM_MODAL=9,
  GAMEOVER=10, VICTORY=10, HIDDEN_STAGE=5
```

**RESTART_ALLOWED 화이트리스트** (F44):
```javascript
const RESTART_ALLOWED = ['GAMEOVER', 'VICTORY', 'HIDDEN_STAGE'];
// beginTransition()에서 역방향 전환 시:
// if (RESTART_ALLOWED.includes(currentState)) → 전환 허용
// else → 전환 차단 + console.warn
```

> ⚠️ GAMEOVER, VICTORY에서 TITLE로의 전환은 STATE_PRIORITY 역방향이지만 RESTART_ALLOWED 화이트리스트에 의해 **항상 허용**된다. 이 패턴은 Cycle 21~23에서 5라운드간 P0 버그를 유발한 문제의 근본 해결책이다.

**페이즈 전환 흐름 (ASCII 다이어그램)**:
```
TITLE ──select──→ DIFFICULTY_SELECT ──start──→ CASUAL_PHASE
                                                  │
                           ┌──────────────────────┘
                           ▼
                      CASUAL_PHASE ──timer(60s)──→ ACTION_PHASE
                           ▲                          │
                           │                    ┌─────┴──────┐
                      TIDE_RESULT          tide<boss    tide==boss
                           ▲                │            │
                           │           ACTION end    BOSS_INTRO
                      UPGRADE_MENU         │            │
                           ▲          TIDE_RESULT   BOSS_FIGHT
                           │                         │    │
                           └─────────────────────────┘  lose
                                    win                   │
                                                     GAMEOVER
                                                        │
                           Tide15 boss win ──→ VICTORY  │
                                    │              │    │
                                    ▼              ▼    ▼
                              HIDDEN_STAGE ──→ TITLE ◄──┘
                              (조건 충족시)   (RESTART_ALLOWED)
```

### 6.2 상태 × 시스템 매트릭스 (F7)

| 상태 | tween | physics | ai | weather | wave | timer | particles | fishing | combat | camera | audio |
|------|-------|---------|-----|---------|------|-------|-----------|---------|--------|--------|-------|
| BOOT | ✓ | | | | | | | | | | |
| TITLE | ✓ | | | | ✓ | | ✓ | | | | ✓ |
| DIFFICULTY_SELECT | ✓ | | | | ✓ | | ✓ | | | | ✓ |
| CASUAL_PHASE | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ |
| FISHING_MINIGAME | ✓ | | | ✓ | ✓ | ✓ | ✓ | ✓ | | | ✓ |
| ACTION_PHASE | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ |
| BOSS_INTRO | ✓ | | | ✓ | ✓ | | ✓ | | | ✓ | ✓ |
| BOSS_FIGHT | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ |
| BOSS_VICTORY | ✓ | | | ✓ | ✓ | | ✓ | | | ✓ | ✓ |
| TIDE_RESULT | ✓ | | | | ✓ | | ✓ | | | | ✓ |
| UPGRADE_MENU | ✓ | | | | ✓ | | ✓ | | | | ✓ |
| GAMEOVER | ✓ | | | | ✓ | | ✓ | | | | ✓ |
| VICTORY | ✓ | | | | ✓ | | ✓ | | | ✓ | ✓ |
| HIDDEN_STAGE | ✓ | ✓ | | | ✓ | | ✓ | ✓ | | ✓ | ✓ |
| PAUSE | ✓ | | | | | | | | | | |
| CONFIRM_MODAL | ✓ | | | | | | | | | | |

### 6.3 페이즈 전환 애니메이션
- CASUAL → ACTION: 하늘 그라데이션이 3초간 어두워지며, 경고 사이렌 + "괴수 출현!" 텍스트 tween
- ACTION → TIDE_RESULT: 마지막 괴수 처치 시 1.5초 슬로모션 + 폭발 파티클 → 결과 화면 페이드인
- BOSS_INTRO: 화면 줌인 + 보스 명함 텍스트 + 전용 BGM 전환 (2초)
- 모든 전환에 `beginTransition()` 필수 (F6)

### 6.4 Canvas 모달 (F3)
- 일시정지, 확인, 종료 등 모든 다이얼로그는 Canvas 위에 반투명 오버레이 + 버튼으로 구현
- `confirm()` / `alert()` 사용 절대 금지

---

## §7. 핵심 시스템 상세

### 7.1 낚시 시스템 (캐주얼 페이즈)

**낚시 미니게임 흐름**:
1. Space/클릭으로 캐스트 → 찌가 포물선으로 날아감
2. 대기 시간 (SeededRNG 기반 2~8초) → 찌가 흔들림 (물고기 접근 신호)
3. 타이밍 바 출현 → 이동하는 커서가 "적중 구간"에 있을 때 Space 누르면 성공
4. 성공 시 물고기 종류 + 크기 결정 (SeededRNG + 낚시 장비 보정)
5. 실패 시 미끼 소모 + 대기 시간 증가

**어획물 등급**:
| 등급 | 확률 | 판매가 | 특수 효과 |
|------|------|--------|----------|
| 일반 (흰색) | 60% | 5~15 | — |
| 희귀 (파란색) | 25% | 20~50 | 등대 HP 소량 회복 |
| 전설 (금색) | 12% | 80~150 | 무기 강화 재료 |
| 심연 (보라색) | 3% | 200~500 | 영구 업그레이드 재료 |

### 7.2 전투 시스템 (액션 페이즈)

**무기 3종**:
| 무기 | 공격 방식 | DPS | 범위 | 특성 |
|------|----------|-----|------|------|
| 작살 | 직선 투사체 | 높음 | 좁음 | 관통 (최대 2체) |
| 그물 | 범위 투척 | 중간 | 넓음 | 2초 속도 감소 |
| 음파포 | 원형 파동 | 낮음 | 최대 | 넉백 + 등대 주변 안전지대 유지 |

**괴수 3종**:
| 괴수 | HP | ATK | 속도 | 패턴 |
|------|-----|-----|------|------|
| 심해 해파리 | 낮음 | 낮음 | 느림 | 직선 이동, 접촉 시 독 (등대 DoT) |
| 심해 상어 | 중간 | 높음 | 빠름 | 돌진 패턴, 잠시 멈춤 후 재돌진 |
| 심해 갑각류 | 높음 | 중간 | 느림 | 높은 방어력, 그물에 면역 |

### 7.3 보스 전투

**보스 1: 심해 앵글러 (Tide 5)**
```
Phase 1 (HP 100%~60%): 유인등 빛으로 키퍼를 끌어당김 → 회피 필요
Phase 2 (HP 60%~30%): 어둠 뿜기로 등대 조명 범위 축소 → 음파포로 해제
Phase 3 (HP 30%~0%): 분열하여 소형 3체 → 각개 격파
         ┌─HP>60%──→ Phase1 (유인등)
  IDLE ──┤
         ├─HP>30%──→ Phase2 (어둠)
         │
         └─HP≤30%──→ Phase3 (분열) ──→ DEFEATED
```

**보스 2: 크라켄 유생 (Tide 10)**
```
Phase 1 (HP 100%~50%): 촉수 4개가 사방에서 공격 → 촉수 개별 HP
Phase 2 (HP 50%~20%): 먹물 분사로 시야 차단 + 촉수 재생
Phase 3 (HP 20%~0%): 본체 노출 → 집중 공격 기회 (10초 제한)
         ┌─HP>50%──→ Phase1 (촉수)
  IDLE ──┤
         ├─HP>20%──→ Phase2 (먹물+재생)
         │
         └─HP≤20%──→ Phase3 (본체 노출) ──→ DEFEATED
```

**보스 3: 심연의 군주 (Tide 15)**
```
Phase 1 (HP 100%~70%): 심연의 파동 (전방위 탄막) + 소환수
Phase 2 (HP 70%~40%): 차원 왜곡 (화면 일부 반전 + 조작 반전 5초)
Phase 3 (HP 40%~15%): 분노 모드 (속도 2배, ATK 1.5배, 패턴 혼합)
Phase 4 (HP 15%~0%): 최후 발악 (등대 직접 돌진 → 2회 회피 성공 시 격파 QTE)
         ┌─HP>70%──→ Phase1 (파동+소환)
  IDLE ──┤
         ├─HP>40%──→ Phase2 (차원왜곡)
         ├─HP>15%──→ Phase3 (분노)
         └─HP≤15%──→ Phase4 (최후발악→QTE) ──→ DEFEATED
```

### 7.4 날씨 시스템

| 날씨 | 출현 Tide | 캐주얼 효과 | 액션 효과 |
|------|----------|-----------|----------|
| 맑음 | 1~15 | 기본 | 기본 |
| 비 | 4~15 | 희귀 물고기 확률 +10% | 시야 약간 감소, 등대 조명 확산 |
| 안개 | 6~15 | 표류물 출현 +20% | 시야 크게 감소, 소나 탐지 필수 |
| 폭풍 | 9~15 | 낚시 타이밍 바 가속 | 화면 흔들림, 괴수 속도 +20%, 번개(랜덤 범위 피해) |
| 달밤 | 3~15 | 심연 등급 물고기 확률 +5% | 등대 조명 범위 +30%, 괴수 HP -10% |

### 7.5 등대 업그레이드 트리 (영구 진행)

| 카테고리 | 업그레이드 | 최대 레벨 | 효과 | 산호 비용 (Lv1→Max) |
|---------|-----------|----------|------|---------------------|
| 조명 | 조명 범위 | 5 | +10%/Lv | 50→250 |
| 조명 | 조명 강도 | 5 | 괴수 접근 시 속도 -5%/Lv | 80→400 |
| 내구 | 등대 HP | 5 | +50/Lv (기본 500) | 60→300 |
| 내구 | 자동 수리 | 3 | +2HP/5초/Lv | 100→300 |
| 무기 | 작살 강화 | 5 | ATK +10%/Lv | 40→200 |
| 무기 | 그물 강화 | 5 | 범위 +8%/Lv, 지속시간 +0.3초/Lv | 40→200 |
| 무기 | 음파포 강화 | 5 | 범위 +10%/Lv, 넉백 +15%/Lv | 40→200 |
| 낚시 | 낚시 장비 | 5 | 희귀 확률 +3%/Lv | 30→150 |
| 낚시 | 미끼 효율 | 3 | 미끼 소모 -20%/Lv | 50→150 |
| 소나 | 탐지 범위 | 3 | +15%/Lv | 70→210 |
| 소나 | 쿨다운 감소 | 3 | -2초/Lv (기본 12초) | 80→240 |

---

## §8. 난이도 시스템

### 8.1 3구간 밸런스 테이블 (F46)

**초반 (Tide 1~5)**:
| 항목 | 수치 |
|------|------|
| 괴수 스폰 수/웨이브 | 3→8 |
| 괴수 HP | 30→60 |
| 괴수 ATK | 5→10 |
| 괴수 속도 | 1.0→1.3 |
| 낚시 타이밍 바 속도 | 1.0 |
| 물고기 판매가 배율 | 1.0 |
| 보스 HP | 500 (심해 앵글러) |

**중반 (Tide 6~10)**:
| 항목 | 수치 |
|------|------|
| 괴수 스폰 수/웨이브 | 8→15 |
| 괴수 HP | 60→120 |
| 괴수 ATK | 10→20 |
| 괴수 속도 | 1.3→1.6 |
| 낚시 타이밍 바 속도 | 1.2 |
| 물고기 판매가 배율 | 1.5 |
| 보스 HP | 1200 (크라켄 유생) |

**후반 (Tide 11~15)**:
| 항목 | 수치 |
|------|------|
| 괴수 스폰 수/웨이브 | 15→25 |
| 괴수 HP | 120→200 |
| 괴수 ATK | 20→35 |
| 괴수 속도 | 1.6→2.0 |
| 낚시 타이밍 바 속도 | 1.5 |
| 물고기 판매가 배율 | 2.0 |
| 보스 HP | 2500 (심연의 군주) |

### 8.2 DPS/EHP 밸런스 산식

```
플레이어 DPS = 무기기본ATK × (1 + 업그레이드Lv × 0.1) × 공격속도
괴수 EHP = HP × (1 + 난이도보정)
클리어 조건: 플레이어DPS × 90초 > 총 괴수EHP × 1.2 (20% 여유)

등대 생존 조건:
  등대EHP = (500 + 업그레이드×50) × 난이도배율
  총 괴수DPS = Σ(괴수ATK × 괴수수 / 타격간격)
  등대EHP > 총괴수DPS × 90초 × 0.5 (50%는 플레이어가 방어한다고 가정)
```

### 8.3 동적 난이도 보정
- Tide 3회 연속 무손상 클리어 → 다음 Tide 괴수 수 +10%
- Tide 3회 연속 등대 HP 30% 이하 → 다음 Tide 괴수 수 -10%, 낚시 보상 +20%
- 보스에서 3회 사망 → "등대의 축복" 버프 제안 (등대 HP 자동 회복 +5/초)

---

## §9. 점수 시스템

### 9.1 점수 구성

| 항목 | 점수 |
|------|------|
| 일반 괴수 처치 | 10 × Tide 번호 |
| 보스 처치 | 500 / 1500 / 5000 |
| 물고기 낚기 (등급별) | 5 / 15 / 50 / 200 |
| 표류물 채집 | 10 |
| 등대 무손상 Tide 클리어 | 200 × Tide 번호 |
| 히든 스테이지 클리어 | 10000 |

### 9.2 산호 (영구 통화)

| 획득 경로 | 산호 수량 |
|-----------|----------|
| Tide 클리어 | 10 × Tide 번호 |
| 보스 처치 | 50 / 150 / 500 |
| 물고기 판매 | 판매가 × 0.1 (소수점 버림) |
| 게임 오버 시 보존 | 획득 산호 × 0.3 |
| 승리 시 보존 | 획득 산호 × 1.0 |

### 9.3 순위표 (localStorage)
- 상위 10개 기록 저장
- 표시 항목: 순위, 점수, 도달 Tide, 난이도, 날짜

---

## §10. 프로시저럴 생성

### 10.1 SeededRNG
```javascript
class SeededRNG {
  constructor(seed) { this.state = seed; }
  next() {
    this.state = (this.state * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (this.state >>> 0) / 0xFFFFFFFF;
  }
  range(min, max) { return min + this.next() * (max - min); }
  intRange(min, max) { return Math.floor(this.range(min, max + 1)); }
}
```

### 10.2 파도 패턴 생성
- 각 Tide의 시드 = 기본시드 + Tide번호 × 7919
- 파도 패턴: 괴수 스폰 타이밍, 종류, 위치를 시드 기반으로 결정
- **검증**: 생성된 패턴의 총 DPS가 등대 EHP × 2를 초과하지 않도록 검증 함수 적용 (F46 밸런스)

### 10.3 어획물 테이블
- 시드 기반 어획물 결정: 등급 → 종류 → 크기 순서로 난수 소모
- 낚시 장비 레벨에 따른 확률 보정: `희귀확률 = 기본확률 + 장비Lv × 0.03`

---

## §11. 데이터 저장 (localStorage)

### 11.1 데이터 스키마

```javascript
const SAVE_SCHEMA = {
  version: 1,
  // 영구 진행
  coral: 0,                    // 산호 (영구 통화)
  upgrades: {
    lightRange: 0,             // 조명 범위 (0~5)
    lightIntensity: 0,         // 조명 강도 (0~5)
    lighthouseHp: 0,           // 등대 HP (0~5)
    autoRepair: 0,             // 자동 수리 (0~3)
    harpoon: 0,                // 작살 강화 (0~5)
    net: 0,                    // 그물 강화 (0~5)
    sonicCannon: 0,            // 음파포 강화 (0~5)
    fishingGear: 0,            // 낚시 장비 (0~5)
    baitEfficiency: 0,         // 미끼 효율 (0~3)
    sonarRange: 0,             // 소나 범위 (0~3)
    sonarCooldown: 0,          // 소나 쿨다운 (0~3)
  },
  // 기록
  bestScore: 0,
  bestTide: 0,
  totalRuns: 0,
  totalFishCaught: 0,
  bossesDefeated: [false, false, false],
  hiddenUnlocked: false,
  hiddenCleared: false,
  // 순위표
  leaderboard: [],             // [{score, tide, difficulty, date}] 최대 10개
  // 설정
  settings: {
    difficulty: 'normal',
    lang: 'ko',
    sfxVolume: 0.7,
    bgmVolume: 0.5,
  }
};
```

> ⚠️ **F8**: `판정 먼저, 저장 나중에` — 신기록 판정 후 저장. `if (score > save.bestScore)` 먼저 평가, 그 후 `save.bestScore = score` 할당.

### 11.2 마이그레이션
```javascript
function migrateSave(data) {
  if (!data.version) data = { ...SAVE_SCHEMA, ...data, version: 1 };
  // 향후 version 2 마이그레이션은 여기에 추가
  return data;
}
```

---

## §12. 오디오 (Web Audio API)

### 12.1 BGM
| 트랙 | 상태 | 스타일 |
|------|------|--------|
| 타이틀 | TITLE | 잔잔한 바다 앰비언스 + 멜로디 |
| 캐주얼 | CASUAL_PHASE | 평화로운 어쿠스틱 루프 |
| 액션 | ACTION_PHASE | 긴장감 있는 드럼 + 베이스 |
| 보스 | BOSS_FIGHT | 에픽 오케스트라 풍 |
| 승리 | VICTORY | 웅장한 팡파르 |

### 12.2 효과음 (8종+)
| # | 효과음 | 트리거 |
|---|--------|--------|
| 1 | 파도 소리 | 파도 애니메이션 주기 |
| 2 | 낚시 캐스트 | Space 키 (캐주얼) |
| 3 | 물고기 잡힘 | 낚시 성공 |
| 4 | 작살 발사 | 주무기 공격 (작살) |
| 5 | 그물 투척 | 주무기 공격 (그물) |
| 6 | 음파 발사 | 주무기 공격 (음파포) |
| 7 | 괴수 피격 | 괴수에 데미지 |
| 8 | 괴수 사망 | 괴수 HP 0 |
| 9 | 보스 등장 | BOSS_INTRO 전환 |
| 10 | 등대 피격 | 등대에 데미지 |
| 11 | 업그레이드 구매 | 업그레이드 메뉴 |
| 12 | UI 클릭 | 버튼 상호작용 |

---

## §13. 검증 체크리스트

### 13.1 수치 정합성 테이블 (F10)

> 기획서 수치 = CONFIG 상수 1:1 대응 필수.

| 기획서 위치 | 수치명 | 값 | CONFIG 상수명 |
|------------|--------|-----|-------------|
| §2.1 | 캐주얼 페이즈 시간 | 60초 | CASUAL_DURATION |
| §2.1 | 액션 페이즈 시간 | 90초 | ACTION_DURATION |
| §2.4 | 쉬움 등대HP 배율 | 1.5 | DIFF_HP_MULT.easy |
| §2.4 | 어려움 적 강화 | 1.5 | DIFF_ENEMY_MULT.hard |
| §7.1 | 심연 물고기 확률 | 3% | FISH_PROB.abyssal |
| §7.5 | 등대 기본HP | 500 | BASE_LIGHTHOUSE_HP |
| §7.5 | HP 업그레이드/Lv | +50 | UPGRADE_HP_PER_LV |
| §8.1 | 보스1 HP | 500 | BOSS_HP[0] |
| §8.1 | 보스2 HP | 1200 | BOSS_HP[1] |
| §8.1 | 보스3 HP | 2500 | BOSS_HP[2] |

### 13.2 뷰포트 테스트 매트릭스

| 뷰포트 | 확인 항목 |
|--------|----------|
| 320px | 가상 조이스틱 위치, UI 버튼 48px 이상, 낚시 타이밍 바 가시성 |
| 480px | 업그레이드 메뉴 스크롤, 보스 HP바 가시성, 터치 타겟 간격 |
| 768px | 표준 레이아웃, 사이드 정보 미표시 |
| 1024px+ | 사이드 정보 패널, 모든 UI 정상 배치 |

### 13.3 스모크 테스트 게이트 (F15 + F47 확장)

| # | 테스트 항목 | PASS 기준 |
|---|-----------|----------|
| 1 | index.html 존재 및 로드 | 콘솔 에러 0건 |
| 2 | 타이틀 화면 표시 | TITLE 상태 진입 확인 |
| 3 | 게임 시작 가능 | CASUAL_PHASE 진입 확인 |
| 4 | 낚시 미니게임 작동 | 물고기 1마리 이상 잡힘 |
| 5 | 액션 페이즈 전환 | 60초 후 ACTION_PHASE 진입 |
| 6 | 괴수 스폰 및 처치 | 1체 이상 처치 가능 |
| 7 | GAMEOVER→TITLE 전환 | RESTART_ALLOWED 패턴 정상 작동 |
| 8 | 터치 버튼 48px 이상 | 모든 터치 타겟 검증 |
| 9 | localStorage 저장/로드 | 업그레이드 유지 확인 |
| 10 | assets/ 디렉토리 미존재 | 디렉토리 부재 확인 |

### 13.4 밸런스 검증 (F46)

| 검증 항목 | 기대 범위 | 측정 방법 |
|-----------|----------|----------|
| Tide 1 클리어 시간 | 120~150초 | 타이머 기록 |
| Tide 5 보스 전투 시간 | 30~60초 | 무업그레이드 기준 |
| Tide 10 도달률 (보통 난이도) | 1~2회 업그레이드 후 | 산호 100~200 소모 |
| Tide 15 클리어 (보통) | 5~8회 런 | 업그레이드 70%+ |
| 작살 DPS (Lv0) | 50/초 | 공격속도 × ATK |
| 등대 생존 (Tide 15, 보통) | HP 20%+ 잔여 | 업그레이드 Max 기준 |

---

## §14. 사이드바 메타데이터 (게임 페이지)

```yaml
game:
  title: "어비스 키퍼"
  description: "심해 등대지기가 되어 낮에는 낚시하고, 밤에는 심연의 괴수를 격퇴하라! 15개 조수를 버텨내며 등대를 지키는 액션-캐주얼 서바이벌."
  genre: ["action", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/방향키: 이동"
    - "Space: 낚시 / 공격"
    - "E: 채집 / 보조무기"
    - "Q: 업그레이드 / 소나"
    - "1~3: 무기 전환"
    - "ESC: 일시정지"
    - "터치: 가상 조이스틱 + 버튼"
  tags:
    - "#심해"
    - "#등대"
    - "#낚시"
    - "#괴수전투"
    - "#서바이벌"
    - "#업그레이드"
    - "#프로시저럴"
    - "#날씨변화"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## §15. 썸네일 구도

**시네마틱 구도 (400×300)**:
- 중앙 하단: 등대 (황금빛 조명이 부채꼴로 퍼짐)
- 좌측: 키퍼가 작살을 던지는 액션 포즈
- 우측 상단: 심해 앵글러의 유인등이 어둠 속에서 빛남
- 배경: 미드나이트 블루 그라데이션 + 별빛 + 파도
- 하단: "어비스 키퍼" 타이틀 텍스트 (웜 골드)
- 전체적으로 등대의 따뜻한 빛과 심해의 차가운 어둠이 대비되는 분위기

---

## §16. 다국어 지원

### 16.1 텍스트 키 구조
```javascript
const TEXT = {
  ko: {
    title: '어비스 키퍼',
    subtitle: '심연의 등대를 지켜라',
    start: '시작',
    continue: '이어하기',
    difficulty: { easy: '쉬움', normal: '보통', hard: '어려움' },
    phase: { casual: '낮 — 낚시 & 채집', action: '밤 — 괴수 습격!' },
    boss: { angler: '심해 앵글러', kraken: '크라켄 유생', lord: '심연의 군주' },
    weather: { clear: '맑음', rain: '비', fog: '안개', storm: '폭풍', moonlit: '달밤' },
    gameover: '등대가 무너졌습니다...',
    victory: '심연의 균열이 봉인되었습니다!',
    hidden: '마리아나 해구가 열렸습니다...',
    upgrade: '등대 업그레이드',
    fishing: { cast: '던지기', wait: '대기 중...', hit: '지금!', success: '잡았다!', fail: '놓쳤다...' },
    // ... 기타
  },
  en: {
    title: 'Abyss Keeper',
    subtitle: 'Defend the Lighthouse of the Abyss',
    start: 'Start',
    continue: 'Continue',
    difficulty: { easy: 'Easy', normal: 'Normal', hard: 'Hard' },
    phase: { casual: 'Day — Fish & Gather', action: 'Night — Monster Raid!' },
    boss: { angler: 'Abyssal Angler', kraken: 'Kraken Larva', lord: 'Lord of the Abyss' },
    weather: { clear: 'Clear', rain: 'Rain', fog: 'Fog', storm: 'Storm', moonlit: 'Moonlit' },
    gameover: 'The lighthouse has fallen...',
    victory: 'The Abyssal Rift has been sealed!',
    hidden: 'The Mariana Trench has opened...',
    upgrade: 'Lighthouse Upgrades',
    fishing: { cast: 'Cast', wait: 'Waiting...', hit: 'Now!', success: 'Caught!', fail: 'Missed...' },
    // ... etc
  }
};
```

---

## §17. 이전 사이클 아쉬운 점 반영 요약

| 아쉬운 점 (Cycle 23) | 해결 섹션 | 해결 방법 |
|----------------------|----------|----------|
| P0 GAMEOVER→TITLE 5라운드 지속 | §6.1 | RESTART_ALLOWED 화이트리스트를 기획서 단계에서 명시적 선언 |
| 2차 리뷰 2회차 소요 | §13.3 | 스모크 테스트 게이트 10항목으로 확장 (RESTART_ALLOWED + 48px 포함) |
| 단일 파일 규모 지속 증가 | §5.3 | 10개 REGION 코드 영역 가이드 + 2,500줄 이내 목표 |
| 밸런스 자동 검증 미비 | §8.1, §8.2, §13.4 | 3구간 밸런스 테이블 + DPS/EHP 산식 + 검증 체크리스트 |
| 다중 이해관계자 피드백 프로세스 3사이클 연속 재발 | §13.3 | 스모크 테스트 게이트를 1차 제출 전 필수 통과로 지정 |

---

_이 기획서는 InfiniTriX 플랫폼 사이클 #24 게임 "어비스 키퍼"의 상세 설계 문서입니다._
_작성일: 2026-03-22 | 기획 에이전트: planner_
