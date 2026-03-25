---
game-id: vine-temple
title: 바인 템플
genre: action, casual
difficulty: medium
---

# 바인 템플 (Vine Temple) — 사이클 #40 게임 기획서

> **1페이지 요약**: 고고학자 '아이비 박사'가 고대 바인 문명의 비밀을 풀기 위해 정글 신전을 탐험하는 **액션 캐주얼 로그라이트**. 덩굴을 잡고 스윙하여 이동하고, 원터치로 적을 처치하는 Stickman Hook(Poki #3) + Temple Run 2(Poki #8) 시너지. 5개 바이옴(밀림/늪지/수관층/지하동굴/신전 심부) × 3층 = 15 메인 스테이지 + 보스 3종(MVP) + 히든 룸 2개 = **총 20스테이지**. 3갈래 업그레이드 트리(전투/탐험/생존) × 5단계 + SeededRNG 프로시저럴 맵 + BFS 도달 가능성 검증. **action+casual 11사이클 최장 미사용 해소 + 정글 밝은 톤으로 기존 심해(abyss-keeper)/우주(celestial-drift)와 극적 차별화.**

> **MVP 경계**: **Phase 1**(핵심 루프: 스윙→전투→수집→귀환, 바이옴 1~3 + 보스 3체 + 업그레이드 Lv1~3 + DDA 4단계 + 유물 시스템 + 기본 내러티브) → **Phase 2**(바이옴 4~5 + 히든 2스테이지 + 업그레이드 Lv4~5 + 날씨/시간대 연출 + 전체 내러티브 + 다국어 완성). **Phase 1만으로도 완전한 정글 스윙 액션 로그라이트 경험 제공 필수.**

---

## §0. 피드백 매핑 (이전 사이클 교훈)

### 검증 완료 패턴 (platform-wisdom 참조) ✅

| ID | 교훈 요약 | 적용 섹션 |
|----|----------|----------|
| F1 | assets/ 디렉토리 유지 — Gemini API PNG 에셋 + manifest.json 동적 로드 [Cycle 39+] | §4.1, §8 |
| F2 | 외부 CDN/폰트 0건 [Cycle 1] | §4.1 |
| F3 | iframe 환경 confirm/alert 금지 → Canvas 모달 [Cycle 1] | §6.4 |
| F4 | setTimeout 0건 → tween onComplete 전용 [Cycle 1~2] | §5.2 |
| F5 | 가드 플래그로 tween 콜백 1회 실행 보장 [Cycle 3 B1] | §5.2 |
| F6 | TRANSITION_TABLE 단일 정의로 상태 전환 관리 [Cycle 3~39] | §6.1 |
| F7 | 상태×시스템 매트릭스 필수 [Cycle 2 B1] | §6.2 |
| F8 | 판정 먼저, 저장 나중에 [Cycle 2 B4] | §11.1 |
| F9 | 순수 함수 패턴 (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | 수치 정합성 테이블 (기획=코드 1:1) [Cycle 7] | §14.1 |
| F11 | 터치 타겟 최소 48×48px + Math.max 강제 [Cycle 12~39] | §3.3 |
| F12 | TDZ 방지: INIT_EMPTY 패턴 + **Engine 생성자 콜백 TDZ 확장 방어** [Cycle 5~39] | §5.1 |
| F13 | TweenManager clearImmediate() API 분리 [Cycle 4 B1] | §5.2 |
| F14 | 단일 값 갱신 경로 통일 [Cycle 5 B2] | §5.2 |
| F15 | 스모크 테스트 게이트 [Cycle 22~39] | §14.3 |
| F16 | hitTest() 단일 함수 통합 [Cycle 27] | §3.3 |
| F17 | bossRewardGiven 플래그 패턴 [Cycle 27] | §7.5 |
| F18 | SeededRNG 완전 사용 (Math.random 0건) [Cycle 19~39] | §5.2, §14.3 |
| F19 | 프로시저럴 SFX + BGM (Web Audio API 생성) [Cycle 19~39] | §12 |
| F20 | 다국어 지원 (ko/en) [Cycle 27~39] | §13 |
| F21 | beginTransition 단일 정의 [Cycle 32~39] | §6.1 |
| F22 | Gemini PNG 에셋 manifest.json 기반 로드 [Cycle 39+] | §4.1, §8 |

### 신규 피드백 (사이클 #39 교훈) 🆕

| ID | 교훈 | 적용 섹션 | 해결 방법 |
|----|------|----------|----------|
| F23 | TDZ 크래시: Engine 생성자 내 onResize 콜백이 미완료 engine 참조 [Cycle 39 P0] | §5.1 | **onResize(w, h) 콜백에서 engine 직접 참조 절대 금지**. 모든 콜백은 파라미터만 사용. `if (!engine?._ready) return;` 가드 필수 |
| F24 | fadeAlpha 동기화 불완전 — 트윈 _t 값이 G.fadeAlpha에 미반영 [Cycle 39] | §6.1 | 트윈 onUpdate 콜백에서 `G.fadeAlpha = tw._t;` 직접 동기화. 모든 트윈 값↔렌더링 값 1:1 매핑 검증 |
| F25 | 모바일 터치 타겟 48px 미달 12사이클째 반복 [Cycle 39] | §3.3 | `Math.max(48, computedSize)` 강제. 스모크 테스트 항목 추가 |
| F26 | 런타임 검증 불가 — P0 차단으로 모든 실질 검증 실패 [Cycle 39] | §14.3 | Engine 초기화 성공 검증을 스모크 테스트 1번 항목으로. `engine._ready === true` + `G.state !== undefined` 확인 |
| F27 | Engine 생성자 콜백 TDZ 변형 패턴 — INIT_EMPTY로 방어 불가 [Cycle 39] | §5.1 | **Engine 초기화 완료 플래그 `_ready = true`를 생성자 마지막에 설정**. 모든 콜백 진입부에 `_ready` 체크 |

### 이전 사이클 "아쉬웠던 점" 직접 반영 ⚠️

| 아쉬운 점 (cycle-39) | 해결 섹션 | 해결 방법 | 검증 기준 |
|----------------------|----------|----------|----------|
| P0 TDZ 미수정으로 게임 완전 불능 | §5.1 | `_ready` 플래그 + 모든 콜백 가드 + 파라미터 전달 방식 | 엔진 초기화 후 `engine._ready === true` |
| TDZ 변형 패턴(생성자 내 콜백) | §5.1 | onResize(w,h) → initBgParticles(count,w,h) 패턴. engine 참조 0건 | grep `engine\.` in callbacks = 0 |
| 모바일 터치 타겟 30px 미달 | §3.3 | Math.max(48, G.cellSize) 강제 | 최소 터치 영역 48×48px |
| fadeAlpha 동기화 불완전 | §6.1 | 트윈 값→렌더링 값 onUpdate 동기화 | fadeAlpha === tween._t 항상 성립 |
| 런타임 검증 완전 불가 | §14.3 | 엔진 초기화 성공을 스모크 테스트 #1로 | TITLE 상태 진입 확인 |

### 이전 사이클 "다음 사이클 제안" 반영

| 제안 (cycle-39 포스트모템) | 반영 여부 | 적용 섹션 |
|--------------------------|----------|----------|
| Engine 생성자 콜백 TDZ 방어 패턴 표준화 | ✅ | §5.1 — `_ready` 플래그 + 콜백 가드 패턴 |
| Puppeteer 스모크 테스트에 "엔진 초기화 성공" 검증 추가 | ✅ | §14.3 — 항목 #1로 추가 |
| onResize 콜백에서 engine 직접 참조 금지 규칙 | ✅ | §5.1 — 파라미터 전달 전용 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 핵심 컨셉
"**탭 한 번으로 덩굴을 잡고, 스윙의 관성으로 정글을 날아다니며, 고대 신전의 비밀을 풀어라.**"

플레이어는 고고학자 '아이비 박사'가 되어, 덩굴(바인)을 잡고 스윙하여 정글 신전을 탐험한다. Stickman Hook의 검증된 스윙 물리에 로그라이트 진행(유물 수집 → 영구 업그레이드)과 원터치 전투를 결합한 action+casual 하이브리드.

### 핵심 재미 요소 (3축)
1. **물리 기반 스윙의 쾌감**: 덩굴을 잡고 원호를 그리며 가속 → 최적 타이밍에 놓기 → 포물선 비행 → 다음 덩굴 캐치. 운동 에너지 보존 법칙이 만드는 자연스러운 가속감.
2. **로그라이트 진행의 중독성**: 매 런마다 랜덤 생성되는 맵 + 유물 선택 + 영구 업그레이드. "이번엔 더 깊이 갈 수 있다"는 성장 체감.
3. **캐주얼 접근성 + 깊은 마스터리**: 탭/클릭 하나로 덩굴 잡기/놓기. 누구나 즉시 플레이 가능하지만, 최적 스윙 각도·콤보 체인·보스 패턴 숙달에 수십 시간의 깊이.

### 스토리/내러티브
바인 문명은 식물과 공생하며 신전을 건설한 고대 문명. 미지의 역병으로 멸망한 신전에 독성 식물과 변이 생물이 자리잡았다. 아이비 박사는 문명의 유물을 수집하며 멸망의 원인을 밝혀, 신전의 봉인을 해제하고 바인 문명의 지혜를 되살려야 한다.

- **바이옴 1 밀림**: "이 덩굴… 살아있어." — 바인 문명 발견
- **바이옴 2 늪지**: "역병의 근원이 여기서 시작됐어." — 독성 식물 확산
- **바이옴 3 수관층**: "하늘 위에도 신전이 있었다니!" — 공중 신전 발견
- **보스 1 밀림 수호자**: 첫 번째 봉인 해제 → 바인 문명 일지 획득
- **보스 2 늪지 여왕**: 두 번째 봉인 → 역병 원인 단서
- **보스 3 수관층 현자**: 세 번째 봉인 → 문명 부활의 열쇠

---

## §2. 게임 규칙 및 목표

### 게임 목표
- **단기**: 현재 스테이지의 출구 도달 (스윙으로 이동 + 적/함정 회피 + 아이템 수집)
- **중기**: 3개 바이옴(MVP) 클리어 + 보스 3체 처치
- **장기**: 유물 수집 완성 + 업그레이드 트리 완성 + 히든 룸 발견

### 핵심 규칙
1. **체력 시스템**: HP 3칸(기본). 피격 시 1칸 소모. 0이면 런 종료 → 수집 유물로 영구 업그레이드 후 재시작
2. **스윙 물리**: 덩굴 앵커 포인트에 매달려 원운동. 놓는 타이밍에 따라 발사 각도/속도 결정
3. **전투**: 스윙 중 적과 충돌 시 — 아래에서 위로 충돌하면 적 처치, 옆/위에서 충돌하면 피격
4. **유물**: 스테이지 곳곳에 숨겨진 유물 수집 → 런 종료 시 영구 업그레이드 재화로 전환
5. **콤보**: 연속 적 처치 시 콤보 카운트 증가 → 점수 배율 상승 + 일시적 무적 (3콤보 이상)

### 런 구조 (로그라이트)
```
[타이틀] → [월드맵] → [스테이지 선택] → [스윙 탐험] → [보스전]
                                              ↓ (사망)
                                         [결과 화면] → [업그레이드] → [월드맵]
```

---

## §3. 조작 방법

### §3.1 키보드
| 키 | 동작 |
|----|------|
| Space / Z | 덩굴 잡기 (누르고 있는 동안 매달림) / 놓기 (키 떼기) |
| X | 대시 어택 (스윙 중 발동 — 현재 속도 방향으로 돌진, 적 관통) |
| ↑↓ | 월드맵에서 바이옴 선택 |
| ←→ | 월드맵에서 스테이지 선택 |
| Enter | 확인 / 스테이지 진입 |
| Escape | 일시정지 메뉴 |
| R | 즉시 재시작 (스테이지 내) |

### §3.2 마우스
| 입력 | 동작 |
|------|------|
| 좌클릭 (홀드) | 가장 가까운 덩굴 앵커에 매달리기 (홀드 중 스윙) |
| 좌클릭 (떼기) | 덩굴 놓기 → 포물선 발사 |
| 우클릭 | 대시 어택 |
| 클릭 | UI 버튼 / 월드맵 상호작용 |

### §3.3 터치 (모바일)
| 입력 | 동작 |
|------|------|
| 화면 터치 (홀드) | 가장 가까운 덩굴 앵커에 매달리기 |
| 터치 떼기 | 덩굴 놓기 → 포물선 발사 |
| 두 손가락 탭 | 대시 어택 |
| 스와이프 | 월드맵 내비게이션 |

**⚠️ 터치 타겟 규칙 (F11/F25)**:
- 모든 터치 인터랙션 영역: `Math.max(48, computedSize)` px
- 덩굴 앵커 히트박스: 실제 시각 크기와 별개로 최소 48×48px
- UI 버튼: 최소 48×48px, 간격 최소 8px
- 스모크 테스트 §14.3에서 48px 미만 터치 타겟 0건 검증

### §3.4 소형 디스플레이 레이아웃 (≤400px) — [F30 Cycle 30]
```
┌──────────────────────┐
│   [HP♥♥♥] [Score]    │  ← 상단 HUD (32px)
│                      │
│                      │
│   게임 플레이 영역    │  ← 전체 화면 터치 = 스윙
│                      │
│                      │
│              [DASH]  │  ← 대시 버튼 (56×56px, 우하단)
│         [PAUSE]      │  ← 일시정지 (48×48px, 우상단)
└──────────────────────┘
```

### §3.5 대형 디스플레이 레이아웃 (>768px)
```
┌──────────────────────────────┐
│ [HP♥♥♥]     [Score] [Combo] │  ← 상단 HUD
│                              │
│                              │
│       게임 플레이 영역        │
│                              │
│                              │
│ [PAUSE]              [DASH]  │
└──────────────────────────────┘
```

---

## §4. 시각적 스타일 가이드

### §4.1 기술 원칙
- **Gemini API PNG 에셋 사용** (F1/F22): assets/ 폴더에 저장, manifest.json으로 동적 로드
- **외부 CDN/폰트 0건** (F2): 모든 텍스트는 시스템 폰트 또는 Canvas 드로잉
- **프로시저럴 이펙트**: 파티클 시스템은 Canvas 2D API로 런타임 생성
- **Canvas 해상도**: 풀스크린 + `devicePixelRatio` + 동적 리사이즈

### §4.2 색상 팔레트
| 용도 | 색상 | HEX |
|------|------|-----|
| 밀림 초록 (주색) | 생동감 있는 에메랄드 | `#2ecc71` |
| 고대 금 (강조) | 따뜻한 골드 | `#f1c40f` |
| 심연 보라 (위험) | 독성 퍼플 | `#8e44ad` |
| 하늘 청 (배경) | 열대 하늘 | `#3498db` |
| 흙 갈색 (지면) | 어스 브라운 | `#8b4513` |
| 꽃 분홍 (아이템) | 코랄 핑크 | `#e74c3c` |
| 안개 백 (UI) | 미스트 화이트 | `#ecf0f1` |

### §4.3 바이옴별 배경
| 바이옴 | 원경 | 중경 | 근경 |
|--------|------|------|------|
| 밀림 | 안개 낀 열대 산맥 + 폭포 | 거대 나무 캐노피 실루엣 | 덩굴 아치 + 이끼 낀 돌 |
| 늪지 | 보라빛 독안개 + 죽은 나무 | 거대 버섯 군락 + 썩은 덩굴 | 늪지 수면 + 독 웅덩이 |
| 수관층 | 구름 사이 햇살 + 무지개 | 공중 뿌리 다리 + 새 무리 | 거대 잎사귀 플랫폼 |

### §4.4 드로잉 함수 표준 (F9)
모든 렌더링 함수는 순수 함수 패턴:
```javascript
// ✅ 올바른 패턴
function drawPlayer(ctx, x, y, size, animFrame, facing) { ... }
function drawVine(ctx, x1, y1, x2, y2, thickness, swayPhase) { ... }
function drawEnemy(ctx, x, y, size, type, hp, maxHp) { ... }

// ❌ 금지 패턴
function drawPlayer() { ctx.drawImage(player, G.px, G.py); }
```

---

## §4.5 아트 디렉션 (Art Direction)

### 아트 스타일 키워드
**"Lush Tropical Hand-Painted Adventure"** — 따뜻하고 밀도 높은 열대 정글, 수채화 터치의 핸드페인팅 스타일. 고대 문명의 신비로운 황금 장식과 푸른 생명력이 공존하는 비주얼.

### 스타일 레퍼런스
1. **Ori and the Blind Forest** (Moon Studios) — 빛과 식물의 조화, 배경의 깊이감과 레이어링
2. **Rayman Legends** (Ubisoft) — 밝고 에너지 넘치는 색감, 유기적인 환경 디자인, 유쾌한 캐릭터 실루엣

### 디자인 원칙
- **실루엣 가독성**: 모든 오브젝트는 배경 없이 실루엣만으로 식별 가능해야 함
- **색상 역할 분리**: 초록=안전/이동 경로, 금색=수집품/보상, 보라=위험/독, 붉은=적/데미지
- **레이어 깊이**: 원경(불투명 30%)→중경(50%)→근경(100%)으로 깊이감 연출
- **애니메이션 일관성**: 모든 캐릭터 8방향 이동 프레임 (idle 2, run 4, swing 4, attack 2 = 12프레임)

---

## §5. 핵심 게임 루프 (초당 프레임 기준 로직 흐름)

### §5.1 엔진 초기화 안전 패턴 (F12/F23/F27)

**⚠️ CRITICAL — TDZ 방어 필수 패턴**

```javascript
// ✅ Engine 초기화 순서 (TDZ 방지)
class Engine {
  constructor(canvas) {
    // 1. 내부 상태 초기화 (INIT_EMPTY)
    this._ready = false;           // ← 초기화 완료 플래그
    this.W = 0; this.H = 0;
    this.G = { state: 'LOADING', fadeAlpha: 0, /* ... */ };
    this.tweens = new TweenManager();
    this.rng = new SeededRNG(Date.now());

    // 2. Canvas 설정 (engine 참조 불필요)
    this.ctx = canvas.getContext('2d');

    // 3. 리사이즈 (파라미터 전달만 — engine 참조 금지!)
    const w = canvas.width, h = canvas.height;
    this._initLayout(w, h);        // ← this 사용 OK (생성자 내부)

    // 4. 이벤트 리스너 (가드 필수)
    window.addEventListener('resize', () => {
      if (!this._ready) return;    // ← TDZ 가드
      this._onResize(canvas.clientWidth, canvas.clientHeight);
    });

    // 5. 초기화 완료 표시 (반드시 생성자 마지막!)
    this._ready = true;
  }
}

// ❌ 금지 패턴 (Cycle 39 P0 재발)
// window.addEventListener('resize', () => { engine.W = ...; }); // engine이 아직 undefined!
```

**스모크 테스트 게이트 #1**: `engine._ready === true` && `G.state !== 'LOADING'`

### §5.2 메인 게임 루프

```
매 프레임 (requestAnimationFrame):
├── 1. deltaTime 계산 (최대 50ms 캡)
├── 2. TweenManager.update(dt)
│   ├── clearImmediate() 처리 (F13: deferred cancelAll 대신 즉시 정리)
│   └── 각 tween의 onUpdate → G 값 동기화 (F24: fadeAlpha 등)
├── 3. 상태별 update 분기 (§6.2 매트릭스 참조)
│   ├── TITLE: 배경 파티클 + UI 애니메이션
│   ├── MAP: 월드맵 스크롤 + 바이옴 전환
│   ├── PLAY: ──────────────────────────────
│   │   ├── 3a. 입력 처리 (터치/마우스/키보드)
│   │   ├── 3b. 스윙 물리 (§5.3)
│   │   ├── 3c. 플레이어 이동
│   │   ├── 3d. 적 AI 이동
│   │   ├── 3e. 충돌 검사 (hitTest 단일 함수, F16)
│   │   │   ├── 플레이어↔적: 처치 or 피격
│   │   │   ├── 플레이어↔아이템: 수집
│   │   │   ├── 플레이어↔함정: 피격
│   │   │   └── 플레이어↔출구: 스테이지 클리어
│   │   ├── 3f. 콤보 타이머 갱신
│   │   ├── 3g. DDA 평가 (§10)
│   │   └── 3h. 카메라 추적
│   └── BOSS: ──────────────────────────────
│       ├── 3a. 보스 AI 패턴 실행
│       ├── 3b. 스윙 물리 + 전투
│       ├── 3c. 보스 HP 바 + 약점 노출
│       └── 3d. 페이즈 전환 체크
├── 4. 렌더링
│   ├── 4a. 배경 레이어 (원경→중경→근경, 패럴랙스)
│   ├── 4b. 덩굴 네트워크
│   ├── 4c. 적/아이템/함정
│   ├── 4d. 플레이어 (스윙 궤적 포함)
│   ├── 4e. 이펙트/파티클
│   └── 4f. HUD (HP, Score, Combo, 미니맵)
├── 5. fadeAlpha 렌더링 (F24: tween._t 동기화 검증)
└── 6. 다음 프레임 요청
```

### §5.3 스윙 물리 시스템

```
스윙 상태 머신:
  FREE_FALL → (터치/클릭) → ATTACH → SWING → (떼기) → LAUNCH → FREE_FALL

ATTACH:
  - 가장 가까운 앵커 탐색 (반경 = Math.max(48, G.cellSize * 3))
  - 앵커까지 바인(덩굴) 연결

SWING:
  - 원운동: angle += angularVelocity * dt
  - angularVelocity += gravity * sin(angle) / ropeLength * dt
  - damping: angularVelocity *= 0.998 (자연 감쇠)

LAUNCH:
  - 발사 속도 = tangentialVelocity (접선 방향)
  - vx = -angularVelocity * ropeLength * sin(angle)
  - vy = angularVelocity * ropeLength * cos(angle)

FREE_FALL:
  - vy += GRAVITY * dt (중력)
  - vx *= AIR_DRAG (공기 저항 0.999)
```

**단일 값 갱신 경로 (F14)**: `angularVelocity`는 물리 시스템에서만 갱신. tween으로 변경 금지.

---

## §6. 상태 머신 및 전환 관리

### §6.1 TRANSITION_TABLE (F6/F21)

```javascript
// 4상태 단일 정의 (Cycle 39 성공 패턴 계승)
const TRANSITION_TABLE = {
  TITLE: { targets: ['MAP'],  transition: 'fade' },
  MAP:   { targets: ['PLAY', 'TITLE'], transition: 'slide' },
  PLAY:  { targets: ['MAP', 'BOSS'],  transition: 'fade' },
  BOSS:  { targets: ['MAP', 'PLAY'],  transition: 'fade' },
};

// GAMEOVER는 PLAY의 서브상태 (Cycle 38 교훈)
// PLAY.subState: 'active' | 'gameover' | 'clear' | 'paused'

// 모든 전환은 beginTransition() 단일 진입점
function beginTransition(from, to) {
  if (!TRANSITION_TABLE[from]?.targets.includes(to)) {
    console.warn(`Invalid transition: ${from} → ${to}`);
    return;
  }
  // fadeAlpha 동기화 (F24)
  tweens.clearImmediate(); // F13
  tweens.add({
    target: G, prop: 'fadeAlpha',
    from: 0, to: 1, duration: 300,
    onUpdate: (t) => { G.fadeAlpha = t; }, // ← 명시적 동기화
    onComplete: () => {
      G.state = to;
      G.fadeAlpha = 1;
      tweens.add({
        target: G, prop: 'fadeAlpha',
        from: 1, to: 0, duration: 300,
        onUpdate: (t) => { G.fadeAlpha = t; },
      });
    }
  });
}
```

### §6.2 상태 × 시스템 매트릭스 (F7) — [Cycle 2 B1 방지]

| 상태 | Input | Physics | Enemies | Items | Tween | Render | Audio | DDA | Camera |
|------|-------|---------|---------|-------|-------|--------|-------|-----|--------|
| TITLE | menu | — | — | — | ✅ | bg+ui | bgm | — | fixed |
| MAP | navigate | — | — | — | ✅ | map+ui | bgm | — | scroll |
| PLAY.active | swing | ✅ | ✅ | ✅ | ✅ | full | sfx+bgm | ✅ | follow |
| PLAY.paused | pause-menu | — | — | — | — | dim+ui | mute | — | fixed |
| PLAY.gameover | result | — | — | — | ✅ | dim+ui | jingle | — | fixed |
| PLAY.clear | result | — | — | — | ✅ | full+ui | jingle | — | fixed |
| BOSS | swing+dodge | ✅ | boss-ai | — | ✅ | full | boss-bgm | — | boss-cam |

**Input 모드 세분화 (Cycle 26 교훈)**:
- `menu`: 방향키/클릭으로 메뉴 선택
- `navigate`: 월드맵 내비게이션 (스와이프/방향키)
- `swing`: 터치/클릭 = 스윙, 대시 = 공격
- `pause-menu`: 일시정지 메뉴 전용
- `result`: 결과 화면 (계속/업그레이드 선택)
- `swing+dodge`: 보스전 전용 (스윙 + 회피 패턴)

### §6.3 서브상태 전환 규칙

```
PLAY.active:
  ├── HP <= 0 → PLAY.gameover (가드: gameoverTriggered = true, F5)
  ├── 출구 도달 → PLAY.clear (가드: clearTriggered = true)
  ├── ESC/Pause → PLAY.paused
  └── 보스 스테이지 진입 → BOSS (beginTransition)

PLAY.gameover:
  └── 확인 → MAP (결과 화면 → 영구 업그레이드 → 월드맵)

PLAY.clear:
  └── 다음 스테이지 or MAP (선택)

BOSS:
  ├── 보스 HP 0 → PLAY.clear (bossRewardGiven 가드, F17)
  └── 플레이어 HP 0 → PLAY.gameover
```

### §6.4 모달 UI (F3)
- confirm/alert 사용 금지 → Canvas 기반 커스텀 모달
- 모달 표시 중에도 `tweens.update()` 호출 유지 (Cycle 2 B1 방지)

---

## §7. 게임 콘텐츠

### §7.1 바이옴 구성 (Phase 1 MVP)

#### 바이옴 1: 밀림 (Jungle Canopy)
| 층 | 환경 특징 | 적 타입 | 함정 | 유물 |
|----|----------|---------|------|------|
| 1-1 | 튜토리얼. 안전한 덩굴 배치 | 없음 | 없음 | 황금 나뭇잎 |
| 1-2 | 이동 덩굴 도입 | 독 개구리 (지면) | 가시 덩굴 | 비취 원숭이 |
| 1-3 | 복합 배치 + 보스 진입 | 독 개구리 + 바인 뱀 | 가시 + 함정 바닥 | 태양 문장 |

#### 바이옴 2: 늪지 (Toxic Swamp)
| 층 | 환경 특징 | 적 타입 | 함정 | 유물 |
|----|----------|---------|------|------|
| 2-1 | 독 안개 (시야 제한) | 독 버섯 (원거리 포자) | 독 웅덩이 | 보라 수정 |
| 2-2 | 부식 덩굴 (시간 제한 매달리기) | 독 버섯 + 늪 거미 | 독 안개 구역 | 뱀 토템 |
| 2-3 | 늪지 전체 독 상승 | 전체 적 + 미니보스 | 상승 독 수위 | 달 거울 |

#### 바이옴 3: 수관층 (Canopy Heights)
| 층 | 환경 특징 | 적 타입 | 함정 | 유물 |
|----|----------|---------|------|------|
| 3-1 | 강풍 (수평 힘 추가) | 독수리 (공중) | 바람 구역 | 깃털 왕관 |
| 3-2 | 구름 플랫폼 (일시적 발판) | 독수리 + 바인 정령 | 낙뢰 구역 | 하늘 나침반 |
| 3-3 | 보스 아레나 (원형) | 바인 정령 | 복합 | 바람의 심장 |

### §7.2 적 타입 (5종)

| 적 | 이동 패턴 | HP | 처치 조건 | 드롭 |
|----|----------|----|---------|----|
| 독 개구리 | 지면 순찰 (좌우) | 1 | 위에서 스윙 충돌 | 코인 ×1 |
| 바인 뱀 | 덩굴 타고 이동 | 2 | 위/옆에서 충돌 2회 | 코인 ×2 |
| 독 버섯 | 고정 위치 + 포자 발사 (3초 간격) | 1 | 대시 어택 | 코인 ×2 + HP 포션 10% |
| 늪 거미 | 벽 부착 + 거미줄 슈팅 (감속) | 2 | 대시 어택 | 코인 ×3 |
| 독수리 | 수평 비행 + 급강하 | 2 | 위에서 충돌 or 대시 | 코인 ×3 + 유물 파편 20% |

### §7.3 환경 위험 테이블 (Cycle 30 교훈)

| 위험 | 바이옴 | 데미지 | 지속 | 쿨다운 | 대응 방법 |
|------|--------|--------|------|--------|----------|
| 가시 덩굴 | 밀림 | 1 HP | 즉시 | — | 회피 (위/아래 스윙) |
| 함정 바닥 | 밀림 | 1 HP | 즉시 | — | 스윙으로 통과 |
| 독 웅덩이 | 늪지 | 0.5 HP/초 | 접촉 중 | — | 스윙으로 회피 |
| 독 안개 | 늪지 | 없음 | 진입 중 | — | 시야 50% 감소 |
| 상승 독 수위 | 늪지 | 즉사 | 바닥 도달 시 | — | 상방 이동 |
| 강풍 | 수관층 | 없음 | 진입 중 | — | 수평 밀림 (vx ±200) |
| 낙뢰 | 수관층 | 2 HP | 즉시 | 5초 경고 | 번개 표시 구역 회피 |

### §7.4 아이템

| 아이템 | 효과 | 출현 확률 |
|--------|------|----------|
| 코인 | +10 점수 | 100% (적 드롭) |
| HP 포션 | +1 HP (최대까지) | 15% (적 드롭) |
| 유물 파편 | +1 유물 (영구 재화) | 10% (적 드롭) + 보물상자 |
| 황금 덩굴 | 30초간 스윙 속도 ×1.5 | 스테이지당 1개 고정 |
| 보호막 | 다음 피격 1회 무효 | 히든 룸 전용 |

### §7.5 보스 3종

#### 보스 1: 밀림 수호자 (Jungle Guardian) — HP 30
```
Phase 1 (HP 100~60%):
  ┌─── 덩굴 휘두르기 (2초) ──→ 약점 노출 (머리, 1.5초) ───┐
  └──────────────────── 반복 ──────────────────────────────┘
  패턴: [VINE_SWEEP 2s] → [EXPOSED 1.5s] → [VINE_SWEEP]

Phase 2 (HP 60~30%):
  ┌─── 덩굴 비 (3초) → 돌진 (1.5초) → 약점 노출 (1초) ───┐
  └──────────────────── 반복 ──────────────────────────────┘
  패턴: [VINE_RAIN 3s] → [CHARGE 1.5s] → [EXPOSED 1s]

Phase 3 (HP 30~0%):
  ┌─── 분노 (속도 ×1.5) + Phase 1~2 랜덤 교차 ───────────┐
  └──────────────────── 반복 ──────────────────────────────┘
```
**약점 공략**: 약점 노출 시 위에서 스윙 충돌 = 3데미지. 대시 어택 = 5데미지.
**bossRewardGiven 가드 (F17)**: 보스 HP 0 도달 시 보상은 1회만 지급.

#### 보스 2: 늪지 여왕 (Swamp Queen) — HP 40
```
Phase 1 (HP 100~50%):
  ┌─── 포자 구름 (2s) → 독 촉수 (2s) → 약점 (핵, 1.5s) ──┐
  └──────────────────── 반복 ───────────────────────────────┘

Phase 2 (HP 50~0%):
  ┌─── 분열 (미니 2체) → 본체 약점 (1s) → 재합체 ──────────┐
  └──────────────────── 반복 ───────────────────────────────┘
```
**약점 공략**: 핵(코어) 노출 시에만 데미지 가능. 분열 중 미니 처치 필수(안 하면 재합체 시 HP 회복).

#### 보스 3: 수관층 현자 (Canopy Sage) — HP 50
```
Phase 1 (HP 100~60%):
  ┌─── 바람 칼날 (3s) → 낙뢰 유도 (2s) → 약점 (등, 2s) ──┐
  └──────────────────── 반복 ───────────────────────────────┘

Phase 2 (HP 60~30%):
  ┌─── 토네이도 (끌어당김, 3s) → 낙뢰 패턴 (2s) → 약점 (1.5s) ─┐
  └────────────────────── 반복 ────────────────────────────────┘

Phase 3 (HP 30~0%):
  ┌─── Phase 1+2 혼합 + 덩굴 앵커 파괴 (안전 앵커 3개만 남김) ──┐
  └────────────────────── 반복 ────────────────────────────────┘
```
**약점 공략**: 등의 크리스탈 — 뒤에서 스윙 충돌만 유효. Phase 3에서 앵커가 줄어들어 난이도 급상승.

---

## §8. 에셋 요구 사항 (Asset Requirements)

```yaml
# asset-requirements
art-style: "Lush Tropical Hand-Painted Adventure — 따뜻한 수채화 터치의 열대 정글, Ori and the Blind Forest 감성 + Rayman Legends 밝기"
color-palette: "#2ecc71, #f1c40f, #8e44ad, #3498db, #8b4513, #e74c3c, #ecf0f1"
mood: "밝고 생동감 있는 모험, 미지의 정글 탐험 설렘, 고대 문명의 신비"
reference: "Ori and the Blind Forest 깊이감 + Rayman Legends 색감 활력"

assets:
  - id: player-idle
    desc: "아이비 박사 대기 포즈 — 탐험가 복장(카키색 조끼+모자), 덩굴 채찍을 한 손에 들고 정면을 바라봄. 짧은 갈색 머리, 밝은 녹색 눈, 자신감 있는 미소"
    size: "512x512"

  - id: player-swing
    desc: "아이비 박사 스윙 포즈 — 한 손으로 덩굴을 잡고 몸을 활처럼 휜 채 공중 비행 중. 조끼 자락과 머리카락이 바람에 날림. 역동적인 원호 느낌"
    size: "512x512"

  - id: player-dash
    desc: "아이비 박사 대시 어택 포즈 — 덩굴 채찍을 앞으로 뻗으며 전방 돌진. 녹색 잔상 이펙트. 강렬한 전투 포즈"
    size: "512x512"

  - id: enemy-frog
    desc: "독 개구리 — 보라색 반점이 있는 밝은 녹색 개구리. 과장된 큰 눈, 독 침을 내뱉는 부풀어오른 볼. 귀여우면서도 위협적"
    size: "512x512"

  - id: enemy-snake
    desc: "바인 뱀 — 덩굴에 감긴 에메랄드색 뱀. 금색 무늬, 붉은 눈, 날카로운 이빨. 덩굴과 일체화된 느낌의 보호색"
    size: "512x512"

  - id: enemy-mushroom
    desc: "독 버섯 — 보라색 갓에 발광하는 포자를 내뿜는 대형 버섯. 성난 표정의 얼굴, 뿌리 같은 다리. 늪지 분위기"
    size: "512x512"

  - id: enemy-spider
    desc: "늪 거미 — 어두운 보라색 거미, 금색 무늬 등딱지. 8개 다리로 벽에 부착, 빛나는 거미줄 발사 준비 자세"
    size: "512x512"

  - id: enemy-eagle
    desc: "독수리 — 거대한 날개를 펼친 황금빛 독수리. 날카로운 부리와 발톱, 바람의 기운이 날개 주변에 소용돌이"
    size: "512x512"

  - id: boss-guardian
    desc: "밀림 수호자 — 거대한 나무 골렘, 몸체가 살아있는 덩굴과 이끼로 뒤덮임. 금색 눈, 가슴에 빛나는 에메랄드 코어(약점). 높이가 화면의 1/3. 위압감 있는 포즈"
    size: "768x768"

  - id: boss-queen
    desc: "늪지 여왕 — 거대한 독 연꽃 위에 앉은 반인반식물 여왕. 보라색 피부에 독꽃 왕관, 독 촉수가 사방으로 뻗음. 가슴의 빛나는 핵(약점)이 독안개 속에서 발광"
    size: "768x768"

  - id: boss-sage
    desc: "수관층 현자 — 바람을 조종하는 거대한 새 형태의 고대 존재. 하늘색+금색 깃털, 등에 빛나는 크리스탈(약점). 폭풍 구름을 두르고 있음. 신비로운 위엄"
    size: "768x768"

  - id: bg-jungle
    desc: "밀림 배경 — 안개 낀 열대 산맥, 거대한 나무 캐노피 사이로 쏟아지는 황금빛 햇살, 먼 폭포, 이끼 낀 고대 돌기둥. 3레이어(원경/중경/근경) 패럴랙스용"
    size: "1920x1080"

  - id: bg-swamp
    desc: "늪지 배경 — 보라빛 독안개, 죽은 거대 나무 실루엣, 발광하는 독 버섯 군락, 어두운 늪 수면에 비친 달빛. 불길하면서도 아름다운 분위기"
    size: "1920x1080"

  - id: bg-canopy
    desc: "수관층 배경 — 구름 위 하늘, 거대한 공중 뿌리 다리, 무지개빛 새 무리, 햇살에 빛나는 거대 잎사귀 플랫폼. 밝고 장엄한 공중 정원"
    size: "1920x1080"

  - id: item-coin
    desc: "고대 금화 — 바인 문명 문양이 새겨진 둥근 금화. 은은한 금빛 발광. 회전 애니메이션용 정면 뷰"
    size: "128x128"

  - id: item-potion
    desc: "HP 포션 — 하트 모양의 붉은 열매가 담긴 나무 바이알. 덩굴이 감긴 마개, 은은한 붉은 발광"
    size: "128x128"

  - id: item-relic
    desc: "유물 파편 — 빛나는 에메랄드 조각, 고대 룬 문자가 새겨짐. 녹색+금색 발광, 신비로운 기운"
    size: "128x128"

  - id: item-golden-vine
    desc: "황금 덩굴 — 금색으로 빛나는 특수 덩굴 아이콘. 덩굴이 별 모양으로 감긴 형태, 강렬한 금빛 오라"
    size: "128x128"

  - id: ui-hp
    desc: "체력 아이콘 — 덩굴로 감싼 녹색 하트. 가득 찬 상태/빈 상태 2버전. 생명력과 정글 테마 조화"
    size: "128x128"

  - id: thumbnail
    desc: "게임 대표 이미지 — 아이비 박사가 덩굴을 잡고 정글 신전 상공을 스윙하는 역동적 장면. 배경에 거대한 밀림 수호자(보스) 실루엣, 황금빛 햇살, 고대 신전 입구. 'VINE TEMPLE' 텍스트를 덩굴 서체로. 밝고 모험적인 분위기"
    size: "800x600"
```

---

## §9. 영구 진행 시스템 (업그레이드 트리)

### §9.1 업그레이드 트리 3갈래 × 5단계

**재화: 유물 파편 (Relic Shards)**

#### 전투 트리 (Combat)
| Lv | 이름 | 효과 | 비용 |
|----|------|------|------|
| 1 | 날카로운 채찍 | 대시 데미지 +1 | 5 |
| 2 | 연속 타격 | 콤보 타이머 +1초 (3→4초) | 10 |
| 3 | 관통 돌진 | 대시 어택 관통 (2체까지) | 20 |
| 4 | 독 내성 | 독 데미지 50% 감소 | 35 |
| 5 | 바인 마스터 | 스윙 충돌 데미지 2배 | 50 |

#### 탐험 트리 (Explore)
| Lv | 이름 | 효과 | 비용 |
|----|------|------|------|
| 1 | 유물 탐지 | 유물 위치 미니맵 표시 | 5 |
| 2 | 스윙 가속 | 스윙 최대 속도 +20% | 10 |
| 3 | 이중 점프 | 공중에서 추가 덩굴 잡기 1회 | 20 |
| 4 | 보물 코 | 히든 룸 입구 하이라이트 | 35 |
| 5 | 바람 타기 | 강풍에서 감속 대신 가속 | 50 |

#### 생존 트리 (Survival)
| Lv | 이름 | 효과 | 비용 |
|----|------|------|------|
| 1 | 강인한 체력 | 최대 HP +1 (3→4) | 5 |
| 2 | 부활 | 런당 1회 즉시 부활 (HP 1) | 10 |
| 3 | 보호막 친화 | 보호막 지속 시간 2배 | 20 |
| 4 | 생명력 흡수 | 적 처치 시 5% 확률 HP +1 | 35 |
| 5 | 불사 | HP 1 이하에서 3초 무적 (런당 1회) | 50 |

### §9.2 로그라이크 캡 (Cycle 26 교훈)
- **DPS 캡**: 기본 대비 최대 200%
- **시너지 캡**: 업그레이드 효과 누적 최대 150%
- **캡 초과 검증**: `applyUpgrade()` 내부에서 캡 체크 → 초과 시 효과 클램프
- **극단 빌드 사전 검증**: 부록 A 참조

---

## §10. 프로시저럴 맵 생성

### §10.1 생성 알고리즘
```
1. 시드(SeededRNG) 기반 기본 구조 생성
   - 스테이지 크기: 가로 4~8 화면, 세로 2~4 화면
   - 앵커 포인트 배치: 그리드 기반 + SeededRNG 오프셋 (±20%)
   - 앵커 간격: 최소 80px, 최대 250px (스윙 물리로 도달 가능 범위)

2. 경로 생성 (입구→출구)
   - BFS로 앵커 연결 그래프 생성
   - 최단 경로 보장 (도달 가능성 검증)
   - 분기 경로 2~3개 추가 (히든 룸 접근용)

3. 적/함정/아이템 배치
   - 바이옴별 적 타입 풀에서 SeededRNG로 선택
   - 난이도 등급별 배치 밀도 (§10.3)
   - 아이템은 분기 경로 끝에 배치 (탐험 보상)

4. 도달 가능성 검증 (BFS) — F27/Cycle 23 교훈
   - 입구→출구 경로 존재 확인
   - 모든 분기 경로 도달 가능 확인
   - 검증 실패 시 시드 재생성 (최대 10회)
```

### §10.2 BFS 도달 가능성 검증 (Cycle 23/39 교훈)
```javascript
function validateStageReachability(anchors, entry, exit) {
  const visited = new Set();
  const queue = [entry];
  visited.add(entry.id);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.id === exit.id) return true;

    for (const neighbor of getReachableAnchors(current, anchors)) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push(neighbor);
      }
    }
  }
  return false; // 도달 불가 → 시드 재생성
}

function getReachableAnchors(from, all) {
  // 스윙 물리로 도달 가능한 앵커만 반환
  // 최대 스윙 반경 = ropeLength * 2 + launchDistance
  return all.filter(a =>
    dist(from, a) <= MAX_SWING_REACH && a.id !== from.id
  );
}
```

### §10.3 난이도 등급별 배치 (세그먼트 기준)

| 등급 | 적 밀도 | 함정 밀도 | 앵커 밀도 | 아이템 | 배분 비율 |
|------|---------|----------|----------|--------|----------|
| E (Easy) | 0~1/화면 | 0/화면 | 높음 | 코인 | 30% |
| M (Medium) | 1~2/화면 | 1/화면 | 중간 | 코인+포션 | 40% |
| H (Hard) | 2~3/화면 | 2/화면 | 낮음 | 코인+유물 | 25% |
| X (Extreme) | 3+/화면 | 3+/화면 | 최소 | 유물+파워업 | 5% |

**세그먼트 난이도 배분 공식** (Cycle 38 교훈):
```
바이옴 1: E:50% M:40% H:10% X:0%
바이옴 2: E:20% M:40% H:30% X:10%
바이옴 3: E:10% M:30% H:40% X:20%
```

---

## §11. 점수 시스템

### §11.1 점수 산출 (F8: 판정 먼저, 저장 나중에)

```javascript
// 점수 구성 요소
const SCORE = {
  ENEMY_KILL: 100,
  COMBO_MULTIPLIER: (combo) => Math.min(combo, 10) * 0.5 + 1, // 1.5x ~ 6x
  COIN_COLLECT: 10,
  RELIC_FIND: 500,
  STAGE_CLEAR: 1000,
  BOSS_KILL: 5000,
  TIME_BONUS: (seconds) => Math.max(0, 300 - seconds) * 10, // 최대 3000
  NO_HIT_BONUS: 2000,
};

// 판정 먼저, 저장 나중에 (F8)
function onStageComplete() {
  const finalScore = calculateScore();  // 1. 판정
  const isNewBest = finalScore > getBestScore(); // 2. 비교
  saveBestScore(finalScore);            // 3. 저장 (마지막!)
  showResult(finalScore, isNewBest);
}
```

### §11.2 콤보 시스템
- 적 처치 후 3초(업그레이드 시 4초) 이내 다음 적 처치 → 콤보 +1
- 콤보 3+ → 일시적 무적 1초
- 콤보 5+ → 스윙 속도 +10% 부스트
- 콤보 10+ → 최대 배율 (6x) + 금빛 오라 이펙트

### §11.3 점수 정합성 테이블 (F10)

| 항목 | 기획 값 | CONFIG 상수명 |
|------|---------|-------------|
| 적 처치 기본 | 100 | SCORE.ENEMY_KILL |
| 코인 수집 | 10 | SCORE.COIN_COLLECT |
| 유물 발견 | 500 | SCORE.RELIC_FIND |
| 스테이지 클리어 | 1000 | SCORE.STAGE_CLEAR |
| 보스 처치 | 5000 | SCORE.BOSS_KILL |
| 무피격 보너스 | 2000 | SCORE.NO_HIT_BONUS |
| 콤보 최대 배율 | 6x | SCORE.COMBO_MULTIPLIER(10) |
| 시간 보너스 최대 | 3000 | SCORE.TIME_BONUS(0) |

---

## §12. 사운드 시스템 (F19 — Web Audio API 프로시저럴)

### §12.1 BGM (4종)
| BGM | 상태 | 분위기 |
|-----|------|--------|
| 타이틀 | TITLE | 신비로운 정글 앰비언스 — 새소리 + 바람 + 낮은 패드 |
| 밀림 | PLAY (바이옴1) | 리드미컬한 마림바 + 정글 퍼커션, 밝고 모험적 |
| 늪지 | PLAY (바이옴2) | 어둡고 둔탁한 베이스 + 에코 드럼, 긴장감 |
| 수관층 | PLAY (바이옴3) | 밝고 장엄한 하프 + 플루트 + 바람 패드, 해방감 |

### §12.2 SFX (8종+)
| SFX | 트리거 | 구현 |
|-----|--------|------|
| vine_grab | 덩굴 잡기 | 짧은 휘파람 + 스트링 플럭 |
| vine_release | 덩굴 놓기 | 탄성 스냅 사운드 |
| swing_whoosh | 스윙 중 속도 비례 | 바람 소리 (속도에 따라 피치 변화) |
| enemy_hit | 적 처치 | 타격음 + 코인 징글 |
| player_hurt | 피격 | 둔탁한 충격음 + 페이드 |
| combo_up | 콤보 증가 | 상승 아르페지오 (콤보 수에 따라 피치 상승) |
| boss_roar | 보스 등장 | 저주파 진동 + 에코 |
| stage_clear | 스테이지 클리어 | 승리 팡파르 |
| coin_collect | 코인 획득 | 짧은 금속 징글 |
| dash_attack | 대시 어택 | 바람 돌진음 + 임팩트 |

---

## §13. 다국어 지원 (F20)

```javascript
const LANG = {
  ko: {
    title: '바인 템플',
    subtitle: '고대 정글의 비밀을 풀어라',
    play: '탐험 시작',
    upgrade: '업그레이드',
    combat: '전투', explore: '탐험', survival: '생존',
    stage_clear: '스테이지 클리어!',
    game_over: '탐험 종료',
    boss_defeated: '보스 처치!',
    score: '점수', combo: '콤보', time: '시간',
    new_best: '신기록!',
    relics: '유물', coins: '코인',
    pause: '일시정지', resume: '계속하기', quit: '월드맵으로',
    biome_jungle: '밀림', biome_swamp: '늪지', biome_canopy: '수관층',
    controls_hint: '화면을 터치하여 덩굴을 잡으세요',
  },
  en: {
    title: 'Vine Temple',
    subtitle: 'Unravel the secrets of the ancient jungle',
    play: 'Start Exploring',
    upgrade: 'Upgrade',
    combat: 'Combat', explore: 'Explore', survival: 'Survival',
    stage_clear: 'Stage Clear!',
    game_over: 'Exploration Over',
    boss_defeated: 'Boss Defeated!',
    score: 'Score', combo: 'Combo', time: 'Time',
    new_best: 'New Best!',
    relics: 'Relics', coins: 'Coins',
    pause: 'Paused', resume: 'Resume', quit: 'World Map',
    biome_jungle: 'Jungle', biome_swamp: 'Swamp', biome_canopy: 'Canopy',
    controls_hint: 'Touch the screen to grab a vine',
  },
};
```

---

## §14. 코드 위생 및 검증

### §14.1 수치 정합성 체크리스트 (F10)
- [ ] 기획서 §7.2 적 HP 수치 = CONFIG.ENEMY_HP[type]
- [ ] 기획서 §7.5 보스 HP = CONFIG.BOSS_HP[id]
- [ ] 기획서 §9.1 업그레이드 비용 = CONFIG.UPGRADE_COST[tree][lv]
- [ ] 기획서 §11.3 점수 수치 = SCORE 상수
- [ ] 기획서 §10.3 난이도 배분 = CONFIG.DIFFICULTY_RATIO[biome]

### §14.2 코드 위생 체크리스트
- [ ] `Math.random()` 사용 0건 → SeededRNG만 사용 (F18)
- [ ] `setTimeout/setInterval` 사용 0건 → tween onComplete (F4)
- [ ] `confirm()/alert()` 사용 0건 → Canvas 모달 (F3)
- [ ] 전역 직접 참조 0건 (G 객체 제외) → 순수 함수 (F9)
- [ ] `engine.` 콜백 내 직접 참조 0건 → 파라미터 전달 (F23)
- [ ] 48px 미만 터치 타겟 0건 (F25)
- [ ] `applyUpgrade()` 내 DPS 캡 200% / 시너지 캡 150% 검증
- [ ] bossRewardGiven 가드 플래그 존재 (F17)
- [ ] fadeAlpha === tween._t 동기화 (F24)

### §14.3 스모크 테스트 게이트 (F15/F26) — 14항목 (FAIL 9 / WARN 5)

**FAIL (필수 통과)**:
1. ✅ `engine._ready === true` && `G.state !== 'LOADING'` (F26 — 엔진 초기화 성공)
2. ✅ index.html 존재 + 페이지 로드 성공
3. ✅ 콘솔 에러 0건 (최초 10초)
4. ✅ TITLE → MAP → PLAY 상태 전환 정상
5. ✅ `Math.random` grep 결과 0건 (F18)
6. ✅ `setTimeout` grep 결과 0건 (F4)
7. ✅ `confirm(` / `alert(` grep 결과 0건 (F3)
8. ✅ 모든 TRANSITION_TABLE 대상이 유효 상태명
9. ✅ 터치 타겟 최소 48px (F25)

**WARN (권고)**:
10. ⚠️ 외부 리소스 로드 0건 (F2)
11. ⚠️ 미참조 에셋 파일 0건
12. ⚠️ REGION 주석 8개 이상 존재
13. ⚠️ 다국어 키 일치 (`Object.keys(LANG.ko)` === `Object.keys(LANG.en)`)
14. ⚠️ manifest.json 에셋 전량 로드 성공

### §14.4 코드 영역 가이드 (10 REGION)

```
// REGION 1: CONFIG & CONSTANTS (줄 1~200)
// REGION 2: UTILS & SEEDED_RNG (줄 201~400)
// REGION 3: TWEEN_MANAGER (줄 401~550)
// REGION 4: AUDIO_SYSTEM (줄 551~800)
// REGION 5: ASSET_LOADER (줄 801~950)     ← manifest.json 로드
// REGION 6: PHYSICS_ENGINE (줄 951~1200)   ← 스윙 물리
// REGION 7: GAME_ENTITIES (줄 1201~1800)   ← 플레이어, 적, 보스, 아이템
// REGION 8: MAP_GENERATOR (줄 1801~2200)   ← 프로시저럴 + BFS 검증
// REGION 9: RENDER_SYSTEM (줄 2201~2800)   ← 드로잉 함수
// REGION 10: ENGINE_CORE (줄 2801~3700+)   ← 상태머신, 입력, 메인루프
```

의존 방향 (Cycle 27 교훈):
```
R1 ← R2 ← R3
R1 ← R4
R1 ← R5
R1,R2 ← R6
R1,R2,R6 ← R7
R1,R2,R6 ← R8
R1,R5,R7 ← R9
R1~R9 ← R10
```

---

## §15. DDA (Dynamic Difficulty Adjustment) — 4단계

### §15.1 DDA 평가 지표

| 지표 | 측정 방법 | 가중치 |
|------|----------|--------|
| 사망률 | 최근 3 스테이지 평균 사망 횟수 | 40% |
| 클리어 시간 | 스테이지 기대 시간 대비 실제 비율 | 30% |
| 피격률 | 스테이지당 평균 피격 횟수 / 적 수 | 30% |

### §15.2 4단계 DDA 곡선

| DDA 레벨 | 조건 | 적 HP 배율 | 적 속도 | 앵커 추가 | 아이템 드롭 |
|----------|------|-----------|---------|----------|------------|
| 1 (쉬움) | 사망률 >2 / 스테이지 | ×0.7 | ×0.8 | +3/화면 | ×1.5 |
| 2 (보통) | 기본 | ×1.0 | ×1.0 | 0 | ×1.0 |
| 3 (어려움) | 클리어 시간 < 기대의 70% | ×1.3 | ×1.2 | -1/화면 | ×0.8 |
| 4 (극한) | 무피격 클리어 2회 연속 | ×1.6 | ×1.4 | -2/화면 | ×0.6 |

### §15.3 DDA 폴백 (Cycle 24 교훈)
- **가정**: 플레이어가 적의 50%를 회피하고, 앵커의 80%를 활용함
- **가정 오류 폴백**: 3연속 사망 시 DDA 1로 강제 전환 + "유령 경로 힌트" 표시 (Cycle 35 교훈: 난이도 유지 + 정보 제공)

---

## §16. localStorage 데이터 스키마

```javascript
const SAVE_SCHEMA = {
  version: 1,
  bestScores: { '1-1': 0, '1-2': 0, /* ... */ },
  upgrades: { combat: 0, explore: 0, survival: 0 },
  relicShards: 0,
  totalRelics: 0,
  clearedStages: [],
  bossesDefeated: [],
  hiddenRoomsFound: [],
  ddaLevel: 2,
  language: 'ko',
  settings: { sfxVolume: 0.7, bgmVolume: 0.5 },
};
```

---

## §17. 게임 페이지 사이드바 필드

```yaml
game:
  title: "바인 템플"
  description: "덩굴을 잡고 스윙하며 고대 정글 신전을 탐험하는 액션 캐주얼 로그라이트. 5개 바이옴, 3종 보스, 영구 업그레이드 트리로 끝없는 모험!"
  genre: ["action", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "Space/터치: 덩굴 잡기/놓기"
    - "X/우클릭/두 손가락: 대시 어택"
    - "방향키/스와이프: 맵 내비게이션"
    - "ESC: 일시정지"
  tags: ["정글", "스윙", "로그라이트", "보스전", "업그레이드", "물리"]
  addedAt: "2026-03-25"
  version: "1.0.0"
  featured: true
```

---

## 부록 A: 극단 빌드 밸런스 검증

### 빌드 1: 풀 전투 (Combat Lv5)
- 대시 데미지: 기본 3 + 업그레이드 1 = 4 (×2 바인마스터 = 8)
- 콤보 타이머: 4초
- 보스 3 (HP 50) 클리어 예상: 약점 노출 7회 × 8데미지 = 56 (56 > 50 ✅)
- 예상 시간: 7회 × (패턴 7초 + 약점 2초) = 63초 ✅ (20~120초 범위)

### 빌드 2: 풀 생존 (Survival Lv5)
- HP: 4 + 불사 무적 = 실질 5히트
- 생명력 흡수: 5% 회복
- 보스 3 (HP 50) 클리어 예상: 기본 데미지 3 × 약점 노출 17회 = 51 (51 > 50 ✅)
- 예상 시간: 17회 × 9초 = 153초 → DDA 폴백 발동하여 보스 HP ×0.7 = 35 → 12회 = 108초 ✅

### 빌드 3: 풀 탐험 (Explore Lv5)
- 스윙 속도 +20%: 더 빠른 접근, 더 많은 공격 기회
- 이중 점프: 보스 회피력 상승
- 보스 3 (HP 50) 클리어 예상: 속도 보너스로 약점 노출당 2회 공격 가능 → 9회 × 6 = 54 (54 > 50 ✅)
- 예상 시간: 9회 × 9초 = 81초 ✅

**DPS 캡 검증**: 최대 DPS = 8데미지/9초 = 0.89/초. 기본 DPS = 3/9 = 0.33/초. 비율 = 270% → **캡 200% 적용 → 0.66/초로 클램프**. 클리어 시간 = 50/0.66 = 76초 ✅

---

## 부록 B: 이전 사이클 교훈 반영 종합표

| # | 교훈 출처 | 문제 | 해결 | 검증 |
|---|----------|------|------|------|
| 1 | Cycle 39 P0 | TDZ 크래시 (Engine 생성자 콜백) | §5.1 `_ready` 플래그 + 가드 | 스모크 #1 |
| 2 | Cycle 39 | fadeAlpha 동기화 | §6.1 onUpdate 동기화 | 코드 위생 §14.2 |
| 3 | Cycle 39 | 터치 48px 미달 | §3.3 Math.max(48) | 스모크 #9 |
| 4 | Cycle 39 | 런타임 검증 불가 | §14.3 엔진 초기화 게이트 | 스모크 #1 |
| 5 | Cycle 39+ | assets/ 정책 변경 | §4.1, §8 Gemini PNG 사용 | 스모크 #14 |
| 6 | Cycle 38 | 상태 4개 단순화 | §6.1 TRANSITION_TABLE 4상태 | 스모크 #8 |
| 7 | Cycle 35 | 단일 핵심 루프 집중 | §1 스윙→전투→수집 단일 루프 | MVP 경계 |
| 8 | Cycle 26 | 로그라이크 캡 | §9.2 DPS 200%/시너지 150% | 부록 A |
| 9 | Cycle 23 | BFS 도달 가능성 | §10.2 validateStageReachability | 맵 생성 시 |
| 10 | Cycle 2 | 상태×시스템 매트릭스 | §6.2 7상태×9시스템 | 기획서 |
