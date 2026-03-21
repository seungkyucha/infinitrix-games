---
game-id: mini-platformer
title: 미니 플랫포머
genre: action, arcade
difficulty: medium
---

# 미니 플랫포머 — 상세 기획서 (Cycle 11)

---

## §0. 이전 사이클 피드백 반영 매핑

| # | 출처 | 문제/제안 | 이번 기획 반영 방법 |
|---|------|----------|-------------------|
| 1 | Cycle 11 분석 보고서 | **플랫포머 메커닉 0% — 미보유 기본 장르** | ✅ 본 게임으로 플랫폼 최초 플랫포머 장르 추가 |
| 2 | Cycle 11 분석 보고서 | **casual 60% 편중** | ✅ pure action+arcade 태그. casual 태그 없음 |
| 3 | Cycle 11 분석 보고서 | **action 20%로 부족** | ✅ action 2→3개 보강 (20%→30%) |
| 4 | Cycle 10 포스트모템 | **assets/ 디렉토리 10사이클 연속 재발** | §12.1 — **assets/ 디렉토리 생성 절대 금지.** 모든 비주얼은 Canvas API(fillRect, arc, lineTo, fillText)로 코드 드로잉. SVG/이미지 파일 0개 |
| 5 | Cycle 10 포스트모템 | **축약 변수명 → CRITICAL 버그** | §11 — 변수명 축약 규칙 표 사전 정의. 모호한 축약 금지, 일관된 접두사 규칙 적용 |
| 6 | Cycle 10 포스트모템 | **덱빌딩 밸런스 미검증** | 본 게임은 카드 시스템 없음. 대신 §6 난이도 곡선을 레벨 단위 CONFIG 상수로 정의하여 수치 정합성 검증 가능 |
| 7 | Cycle 10 포스트모템 | **공용 엔진 모듈 10사이클째 미분리** | §12.10 — 본 기획서에서 TweenManager, ObjectPool, TransitionGuard 사용 시 이전 사이클과 동일한 인터페이스 유지. 분리 작업은 별도 태스크로 진행 |
| 8 | Cycle 10 포스트모템 제안 | **미개척 장르 도전** | ✅ 플랫포머 = itch.io/CrazyGames 상위 인기 + 플랫폼 미보유 장르 |
| 9 | Cycle 10 포스트모템 제안 | **시드 RNG 범용화** | §6.5 일일 챌린지 모드에 Seeded RNG(Cycle 7/10 검증 완료) 적용 |
| 10 | platform-wisdom [Cycle 1~8] | **SVG feGaussianBlur 재발** | 외부 SVG 파일 0개. Canvas drawRect/arc/lineTo 전용. §12.2 금지 패턴 목록 |
| 11 | platform-wisdom [Cycle 1~2] | **setTimeout 상태 전환 금지** | §5 모든 지연 전환은 tween onComplete. setTimeout 사용 0건 목표 |
| 12 | platform-wisdom [Cycle 4] | **cancelAll+add 경쟁 조건** | §12.4 clearImmediate() 즉시 정리 API 사용 |
| 13 | platform-wisdom [Cycle 2] | **상태×시스템 매트릭스 필수** | §5.3 전체 매트릭스 포함 (5상태 × 7시스템) |
| 14 | platform-wisdom [Cycle 6~7] | **순수 함수 원칙 위반** | §10 모든 게임 로직 함수는 파라미터 기반 순수 함수. 전역 참조 0건 목표 |
| 15 | platform-wisdom [Cycle 7] | **기획-구현 수치 불일치** | §6, §7 모든 밸런스 수치를 CONFIG 객체 상수로 1:1 매핑. §12.5 수치 정합성 검증 테이블 |
| 16 | platform-wisdom [Cycle 8] | **beginTransition() 미경유** | §5.2 모든 전환이 `beginTransition()` 경유. 즉시 전환도 `beginTransition(state, {immediate:true})` |
| 17 | platform-wisdom [Cycle 3] | **가드 플래그 누락** | §5.2 `isTransitioning` 가드 플래그 모든 전환에 적용 |
| 18 | platform-wisdom [Cycle 2~3] | **유령 변수 방지** | §12.3 선언된 변수 사용처 전수 검증 체크리스트 |
| 19 | platform-wisdom [Cycle 5] | **단일 값 갱신 경로 통일** | 하나의 값은 tween OR 직접 대입 중 하나만 사용 |
| 20 | platform-wisdom [Cycle 1] | **iframe 내 confirm/alert 금지** | 모든 확인 UI는 Canvas 기반 모달 |
| 21 | platform-wisdom [Cycle 8] | **drawTitle dt 하드코딩** | 모든 렌더/업데이트 함수에 gameLoop의 dt를 파라미터로 전달 |
| 22 | platform-wisdom [Cycle 11] | **let/const TDZ 크래시 — 변수 선언이 최초 사용 함수 이후에 위치** | §12.7 — 모든 `let`/`const` 변수는 최초 참조/호출 이전에 선언. 초기화 블록 실행 순서 검증 체크리스트 추가 |
| 23 | platform-wisdom [Cycle 11] | **아이들 게임 탭 전환 시 시스템 정지** | 본 게임은 탭 UI 없으나, PAUSE↔PLAY 전환 시 물리·파티클 재개 순서를 §5.3 매트릭스로 보장 |
| 24 | platform-wisdom [Cycle 10] | **수정 회귀 — 시그니처 변경 시 호출부 전파 누락** | §12.8 — 함수 시그니처 변경 시 모든 호출부 + 하위 함수 전파 전수 검증 |
| 25 | Cycle 10 포스트모템 제안 | **수정 회귀 방지 자동화 (Puppeteer)** | 본 기획 범위 외(별도 인프라 태스크). 대신 §12.8에서 수동 전경로 회귀 테스트 체크리스트 포함 |
| 26 | platform-wisdom [Cycle 11] | **assets/ 미생성 11사이클 연속 유지 성공** | §12.1 — 동일 원칙 유지. 100% Canvas 코드 드로잉 |
| 27 | platform-wisdom [Cycle 10] | **게임 루프 try-catch 래핑 필수** | §12.9 — `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` 패턴 기본 적용 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
무너져가는 고대 탑을 **벽점프, 대시, 이중점프**로 돌파하는 **정밀 플랫포머**. Celeste와 Super Meat Boy의 "죽고 다시 시도" 핵심 루프를 단일 index.html에 응축했다. 5개 월드(숲→동굴→하늘→용암→별빛탑), 월드당 5스테이지 = **총 25스테이지**. 1스테이지 클리어 평균 20~40초, 전체 클리어 약 **15~25분**. 매 스테이지마다 보석 3개 수집 + 스피드런 타이머로 리플레이 가치를 제공한다.

### 핵심 재미 3요소
1. **정밀 조작의 성취감**: 코요테 타임, 점프 버퍼링, 코너 보정 등 관대한 입력 보정으로 "내가 의도한 대로 움직이는" 기분 좋은 조작감. 어려운 구간을 돌파했을 때 압도적 쾌감
2. **죽고 다시 시도의 중독성**: 사망 시 0.3초 내 즉시 리스폰. 로딩 없음, 페널티 최소. "한 번만 더"의 끝없는 시도
3. **수집과 마스터리**: 스테이지별 보석 3개 + 히든 보석 1개 + 스피드런 기록. "클리어는 쉽지만 마스터는 어렵다"

### 레퍼런스
- **Celeste**: 정밀 플랫포머의 교과서. 코요테 타임·점프 버퍼링·가변 점프 높이 등 입력 보정 기법
- **Super Meat Boy**: 즉사 + 즉시 리스폰의 중독성 루프
- **Geometry Dash**: CrazyGames 상위권. 원버튼 리듬 플랫포머의 대중성 증명

### 게임 페이지 사이드바 정보
```yaml
title: "미니 플랫포머"
description: "벽점프, 대시, 이중점프로 고대 탑을 돌파하라! 정밀 조작 액션 플랫포머."
genre: ["action", "arcade"]
playCount: 0
rating: 0
controls:
  - "키보드: 화살표/WASD 이동, Space 점프, Shift 대시"
  - "터치: 가상 D패드(좌) + 점프/대시 버튼(우)"
  - "마우스: 메뉴 선택 전용"
tags:
  - "#플랫포머"
  - "#정밀액션"
  - "#벽점프"
  - "#스피드런"
  - "#싱글플레이"
addedAt: "2026-03-21"
version: "1.0.0"
featured: true
```

---

## §2. 게임 규칙 및 목표

### 2.1 최종 목표
5개 월드 × 5스테이지 = 25스테이지를 순서대로 돌파. 최종 월드(별빛탑) 마지막 스테이지 클리어 시 엔딩.

### 2.2 스테이지 규칙
- 플레이어는 **시작점**에서 출발하여 **골 플래그**에 도달하면 클리어
- 함정(가시, 용암, 낙하)에 닿으면 **즉사** → 현재 스테이지 시작점(또는 체크포인트)에서 즉시 리스폰
- 목숨 제한 없음 (무한 리트라이)
- 스테이지별 **보석 3개** 배치 — 수집은 선택사항이지만 히든 스테이지 언락 조건

### 2.3 월드별 테마 및 언락 무브셋

| 월드 | 테마 | 색상 | 새 무브셋 | 새 장애물 |
|------|------|------|-----------|-----------|
| 1 | 🌲 초록 숲 | #2d5a27 + #8fbc8f | 기본 이동 + 점프 | 가시, 이동 발판 |
| 2 | 🪨 암석 동굴 | #4a3728 + #d4a574 | **벽점프** | 무너지는 발판, 낙석 |
| 3 | ☁️ 구름 하늘 | #87ceeb + #f0f8ff | **이중점프** | 바람(좌우 밀림), 사라지는 구름 발판 |
| 4 | 🔥 용암 지대 | #8b0000 + #ff6347 | **대시** | 용암 상승, 화염 기둥 |
| 5 | ✨ 별빛 탑 | #1a0a2e + #e0b0ff | 전무브셋 조합 | 중력 반전 존, 레이저 |

### 2.4 진행 시스템
- 월드 N 클리어 시 월드 N+1 언락
- 수집 보석 총합에 따라 히든 스테이지 언락 (50개/75개 도달 시)
- 스피드런 기록은 localStorage에 저장
- **일일 챌린지**: Seeded RNG로 매일 동일한 프로시저럴 스테이지 생성 (§6.5)

---

## §3. 조작 방법

### 3.1 키보드 (기본)
| 입력 | 동작 |
|------|------|
| ← → 또는 A D | 좌우 이동 |
| ↑ 또는 W | 위 바라보기 (카메라 패닝) |
| ↓ 또는 S | 아래 바라보기 / 웅크리기 |
| Space | 점프 (길게 누르면 높이 점프) |
| Shift 또는 X | 대시 (월드 4 이후) |
| R | 즉시 리스폰 (자발적 리트라이) |
| ESC / P | 일시정지 |

### 3.2 터치 (모바일)
```
┌─────────────────────────────────────────┐
│                 게임 영역                  │
│                                         │
│  ┌───┐                      ┌───┬───┐  │
│  │ ◀ │  ┌───┐              │ B │ A │  │
│  ├───┤  │ ▼ │              ├───┼───┤  │
│  │ ▶ │  └───┘              │ Y │   │  │
│  └───┘                      └───┴───┘  │
│  D-패드(좌측 하단)     A=점프 B=대시(우측 하단) │
└─────────────────────────────────────────┘
```
- **가상 D패드**: 좌측 하단 반투명 컨트롤. 좌/우 이동 + 하 웅크리기
- **A 버튼 (점프)**: 우측 하단. 길게 누르면 높이 점프
- **B 버튼 (대시)**: A 버튼 좌측. 월드 4 이후 활성화
- 터치 영역 크기: 최소 48×48px (접근성 기준)
- passive: false 설정으로 스크롤 방지

### 3.3 마우스
- 메뉴/월드 선택 화면에서만 사용
- 게임 플레이 중에는 키보드/터치 전용

---

## §4. 시각적 스타일 가이드

### 4.1 전체 미학
**네온 기하학 미니멀리즘** — 모든 오브젝트는 사각형/원/삼각형의 기하학 도형. 배경은 단색 그라데이션. 캐릭터와 장애물은 밝은 네온 아웃라인으로 시인성 확보.

### 4.2 색상 팔레트

| 요소 | 색상 | 용도 |
|------|------|------|
| 플레이어 | `#00ffcc` (민트) | 플레이어 사각형 본체 |
| 플레이어 잔상 | `#00ffcc` alpha 0.3 | 대시 시 잔상 트레일 |
| 지형 (기본) | `#3a3a5c` (어두운 보라) | 솔리드 타일 |
| 가시/함정 | `#ff3366` (핫핑크) | 위험 오브젝트 — 즉시 구분 가능 |
| 보석 | `#ffd700` (골드) | 수집 아이템 |
| 골 플래그 | `#00ff66` (밝은 초록) | 도착 지점 |
| 배경 | 월드별 그라데이션 | §2.3 참조 |
| UI 텍스트 | `#ffffff` | HUD, 메뉴 |
| UI 강조 | `#ff6b35` (오렌지) | 선택된 메뉴 항목 |

### 4.3 오브젝트 형태

| 오브젝트 | 형태 | 크기 (타일 기준) | 렌더링 |
|----------|------|-----------------|--------|
| 플레이어 | 사각형 + 눈 2개 (작은 원) | 0.8 × 1.0 타일 | fillRect + 2× arc(눈) |
| 지형 타일 | 사각형 | 1.0 × 1.0 타일 | fillRect |
| 가시 | 삼각형 (방향별 회전) | 1.0 × 0.5 타일 | moveTo/lineTo ×3 |
| 이동 발판 | 둥근 사각형 | 2.0 × 0.5 타일 | roundRect |
| 보석 | 회전하는 다이아몬드 | 0.5 × 0.5 타일 | rotate + 사각형 45° |
| 골 플래그 | 깃발 모양 (막대 + 삼각형) | 1.0 × 2.0 타일 | fillRect(막대) + 삼각형(깃발) |
| 파티클 | 작은 사각형/원 | 2~6px | ObjectPool 관리 |

### 4.4 화면 레이아웃
```
┌─────────────────────────────────────┐
│ W1-S3  ◆◆◇  00:23.4    ⏸         │  ← HUD (상단)
├─────────────────────────────────────┤
│                                     │
│          [게임 월드]                  │  ← 카메라가 플레이어 추적
│          (타일맵 기반)                │
│                                     │
└─────────────────────────────────────┘
```
- HUD: 월드-스테이지 번호 / 보석 수집 현황 / 스피드런 타이머 / 일시정지 버튼
- 카메라: 플레이어 중심 부드러운 추적 (lerp 0.08)

---

## §5. 핵심 게임 루프 (프레임 기준 로직 흐름)

### 5.1 메인 루프 (60fps, `requestAnimationFrame`)
```
매 프레임 (dt = 현재시간 - 이전시간, 캡 = 33.33ms):
│
├─ 1. Input.update(dt)          — 키/터치 입력 폴링, 버퍼 갱신
├─ 2. TweenManager.update(dt)   — 활성 tween 진행
├─ 3. State별 update(dt):
│   ├─ TITLE:   타이틀 애니메이션 업데이트
│   ├─ PLAY:    Physics.update(dt) → Collision.check() → Camera.follow(dt)
│   ├─ DEAD:    사망 연출 tween 진행 → 완료 시 리스폰
│   ├─ CLEAR:   클리어 연출 tween → 완료 시 다음 스테이지 전환
│   └─ PAUSE:   입력만 처리 (게임 로직 정지)
├─ 4. Particle.update(dt)       — 파티클 시스템 업데이트
├─ 5. Renderer.draw(state, dt)  — 상태별 렌더링
└─ 6. Input.postUpdate()        — 이번 프레임 입력 플래그 리셋
```

### 5.2 상태 전환 규칙

**모든 전환은 반드시 `beginTransition(targetState, options)` 경유.**

| 전환 | 트리거 | 연출 | 소요시간 |
|------|--------|------|----------|
| TITLE → PLAY | Start 버튼 | 페이드아웃 → 스테이지 로드 → 페이드인 | 0.5s |
| PLAY → DEAD | 함정 충돌 / 낙하 | 플레이어 파티클 폭발 + 화면 미세 흔들림 | 0.3s |
| DEAD → PLAY | 사망 연출 완료 (tween onComplete) | 페이드인 (체크포인트에서 리스폰) | 0.2s |
| PLAY → CLEAR | 골 플래그 충돌 | 보석/타이머 결과 팝업 tween | 1.0s |
| CLEAR → PLAY | 결과 팝업 완료 + 입력 | 페이드아웃 → 다음 스테이지 로드 → 페이드인 | 0.5s |
| PLAY ↔ PAUSE | ESC/P 또는 일시정지 버튼 | `beginTransition(state, {immediate:true})` | 즉시 |
| CLEAR → TITLE | 최종 스테이지 클리어 시 | 엔딩 연출 → 페이드아웃 → 타이틀 | 2.0s |

- **가드 플래그**: `isTransitioning = true` 동안 추가 전환 요청 무시
- **DEAD → PLAY 즉시 전환**: beginTransition(PLAY, {immediate: true})로 통일. enterState() 직접 호출 금지

### 5.3 상태 × 시스템 매트릭스

| 시스템 \ 상태 | TITLE | PLAY | DEAD | CLEAR | PAUSE |
|--------------|-------|------|------|-------|-------|
| Input.update | ✅ | ✅ | ✅ (R키만) | ✅ (진행키만) | ✅ (ESC만) |
| TweenManager.update | ✅ | ✅ | ✅ | ✅ | ❌ |
| Physics.update | ❌ | ✅ | ❌ | ❌ | ❌ |
| Collision.check | ❌ | ✅ | ❌ | ❌ | ❌ |
| Camera.follow | ❌ | ✅ | ✅ (고정) | ✅ (고정) | ❌ |
| Particle.update | ✅ | ✅ | ✅ | ✅ | ❌ |
| Renderer.draw | ✅ | ✅ | ✅ | ✅ | ✅ (반투명 오버레이) |

---

## §6. 난이도 시스템

### 6.1 월드별 난이도 곡선

모든 수치는 `CONFIG.WORLDS[n]` 객체에 상수 정의.

| 월드 | 가시 밀도 | 이동 장애물 수 | 보석 난이도 | 평균 클리어 시간(목표) |
|------|-----------|---------------|-------------|---------------------|
| 1 (숲) | 낮음 (10~15%) | 1~2개/스테이지 | 쉬움 (경로 근처) | 15~25초 |
| 2 (동굴) | 중간 (15~25%) | 2~3개 | 보통 (벽점프 필요) | 20~35초 |
| 3 (하늘) | 중간 (20~30%) | 3~4개 | 보통 (이중점프 필요) | 25~40초 |
| 4 (용암) | 높음 (25~35%) | 4~5개 | 어려움 (대시+타이밍) | 30~50초 |
| 5 (별빛탑) | 매우높음 (30~40%) | 5~6개 | 매우어려움 (전 무브셋 조합) | 40~60초 |

### 6.2 스테이지 내 난이도 흐름
각 월드의 5스테이지는 다음 패턴을 따른다:
1. **스테이지 1**: 새 무브셋 소개 (안전한 환경에서 연습)
2. **스테이지 2**: 기본 조합 (새 무브셋 + 기존 장애물)
3. **스테이지 3**: 심화 (타이밍 요구 증가)
4. **스테이지 4**: 도전 (복합 장애물 조합)
5. **스테이지 5**: 보스 구간 (월드 전체 무브셋 종합 테스트)

### 6.3 레벨 데이터 구조
```javascript
// CONFIG.LEVELS[worldIdx][stageIdx]
{
  width: 40,           // 타일 단위 너비
  height: 22,          // 타일 단위 높이
  spawn: {x: 2, y: 18},
  goal: {x: 37, y: 3},
  checkpoints: [{x: 20, y: 12}],  // 중간 체크포인트 (월드3 이후)
  gems: [{x: 10, y: 8}, {x: 25, y: 5}, {x: 33, y: 15}],
  tiles: "...",        // 압축된 타일맵 문자열 (RLE 인코딩)
  hazards: [...],      // 동적 장애물 배열
  movingPlatforms: [...] // 이동 발판 배열
}
```

### 6.4 적응형 힌트 시스템
- 같은 스테이지에서 **10회 이상 사망** 시: "R키로 체크포인트에서 재시작" 힌트 표시
- **20회 이상 사망** 시: 해당 구간의 무브셋 힌트 화살표 표시 (선택적)
- 힌트는 CONFIG.HINT_THRESHOLD로 조절 가능

### 6.5 일일 챌린지 모드
- **Seeded RNG** (LCG: `seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF`)
- 시드 = `YYYYMMDD` 정수 (예: 20260321)
- 프로시저럴 스테이지 1개 생성: 모든 무브셋 사용 가능, 높은 난이도
- 클리어 시간 기록을 localStorage에 저장
- 리더보드는 로컬 전용 (이전 일일 기록 비교)

---

## §7. 점수 시스템

### 7.1 스테이지 클리어 점수
```javascript
CONFIG.SCORE = {
  STAGE_CLEAR_BASE: 1000,    // 스테이지 클리어 기본 점수
  GEM_BONUS: 500,            // 보석 1개당
  HIDDEN_GEM_BONUS: 2000,    // 히든 보석
  TIME_BONUS_THRESHOLD: 15,  // 이 시간(초) 이하면 타임 보너스
  TIME_BONUS_PER_SEC: 100,   // 절약 초당 보너스
  NO_DEATH_BONUS: 2000,      // 무사망 클리어 보너스
  WORLD_CLEAR_BONUS: 5000    // 월드 클리어 보너스
};
```

### 7.2 점수 계산 공식
```
스테이지 점수 = BASE
  + (수집 보석 수 × GEM_BONUS)
  + (히든 보석 ? HIDDEN_GEM_BONUS : 0)
  + max(0, (TIME_BONUS_THRESHOLD - 클리어시간) × TIME_BONUS_PER_SEC)
  + (사망 0회 ? NO_DEATH_BONUS : 0)
```

### 7.3 영구 기록 (localStorage)
```javascript
// 저장 키: "mini-platformer-save"
{
  unlockedWorld: 3,           // 현재 언락된 최대 월드
  bestTimes: {                // 스테이지별 최고 기록
    "1-1": 12.4, "1-2": 18.7, ...
  },
  gems: {                     // 스테이지별 보석 수집 현황
    "1-1": [true, true, false], ...
  },
  totalGems: 42,              // 총 수집 보석 수
  totalScore: 128500,         // 누적 총점
  dailyBest: {                // 일일 챌린지 기록
    "20260321": 34.2, ...
  },
  deaths: {}                  // 스테이지별 사망 횟수 (힌트 시스템용)
}
```

**중요**: 판정(최고 기록 비교) → 저장(localStorage 갱신) 순서 준수 (Cycle 2 교훈)

---

## §8. 물리 엔진 상수

### 8.1 플레이어 물리 (CONFIG.PHYSICS)
```javascript
CONFIG.PHYSICS = {
  GRAVITY: 0.55,              // 프레임당 중력 가속도
  MAX_FALL_SPEED: 12,         // 최대 낙하 속도
  MOVE_SPEED: 4.5,            // 좌우 이동 최대 속도
  ACCELERATION: 0.8,          // 좌우 가속도 (지상)
  AIR_ACCELERATION: 0.5,      // 좌우 가속도 (공중)
  FRICTION: 0.85,             // 지상 마찰 계수 (매 프레임 속도 × friction)
  AIR_FRICTION: 0.95,         // 공중 마찰 계수

  // 점프
  JUMP_FORCE: -11.5,          // 점프 초기 속도 (음수 = 위)
  JUMP_CUT_MULTIPLIER: 0.4,   // 점프 키 떼면 vy *= 이 값 (가변 점프 높이)
  COYOTE_TIME: 6,             // 발판 이탈 후 점프 허용 프레임 (0.1초)
  JUMP_BUFFER: 6,             // 착지 전 점프 선입력 프레임 (0.1초)

  // 벽점프 (월드 2+)
  WALL_SLIDE_SPEED: 2.0,      // 벽 미끄러짐 최대 속도
  WALL_JUMP_FORCE_X: 7,       // 벽점프 수평 반발력
  WALL_JUMP_FORCE_Y: -10.5,   // 벽점프 수직 힘
  WALL_STICK_TIME: 4,         // 벽 달라붙기 유지 프레임

  // 이중점프 (월드 3+)
  DOUBLE_JUMP_FORCE: -10,     // 이중점프 힘 (기본 점프보다 약간 약함)

  // 대시 (월드 4+)
  DASH_SPEED: 14,             // 대시 속도
  DASH_DURATION: 8,           // 대시 지속 프레임
  DASH_COOLDOWN: 0,           // 공중 대시 1회 → 착지 시 리셋

  // 코너 보정
  CORNER_CORRECTION: 4        // 벽 코너 보정 픽셀 수
};
```

### 8.2 카메라 (CONFIG.CAMERA)
```javascript
CONFIG.CAMERA = {
  LERP_SPEED: 0.08,          // 카메라 추적 보간 속도
  LOOK_AHEAD_X: 40,          // 이동 방향 선행 오프셋
  LOOK_UP_OFFSET: -80,       // 위 바라보기 오프셋
  LOOK_DOWN_OFFSET: 80,      // 아래 바라보기 오프셋
  DEAD_ZONE_X: 20,           // 카메라 데드존 수평
  DEAD_ZONE_Y: 15,           // 카메라 데드존 수직
  SHAKE_DECAY: 0.9           // 화면 흔들림 감쇠
};
```

### 8.3 물리 업데이트 흐름 (PLAY 상태, 매 프레임)
```
1. 입력 처리 → 가속도 적용
2. 중력 적용: vy += GRAVITY
3. 벽 슬라이드 체크: 벽 접촉 + 낙하 중 → vy = min(vy, WALL_SLIDE_SPEED)
4. 속도 제한: vy = min(vy, MAX_FALL_SPEED)
5. 마찰 적용: vx *= (onGround ? FRICTION : AIR_FRICTION)
6. 위치 업데이트: x += vx, y += vy
7. 타일맵 충돌 판정 (AABB)
8. 위치 보정 + 접지/벽접촉 플래그 갱신
9. 코요테 타임 카운터 갱신
10. 점프 버퍼 카운터 갱신
```

---

## §9. 충돌 판정 시스템

### 9.1 AABB 충돌 (타일 기반)
```javascript
// 플레이어 히트박스는 비주얼보다 약간 작음 (관대한 판정)
CONFIG.HITBOX = {
  PLAYER_WIDTH: 12,    // 타일 16px 기준, 비주얼 13px → 히트박스 12px
  PLAYER_HEIGHT: 16,
  OFFSET_X: 2,         // 히트박스 좌측 오프셋
  OFFSET_Y: 0
};
```

### 9.2 충돌 응답 우선순위
1. **솔리드 타일**: 위치 보정 (밀어내기)
2. **이동 발판**: 위에 서 있으면 발판 속도 반영
3. **함정 (가시/용암)**: 즉사 → DEAD 상태 전환
4. **보석**: 수집 → 파티클 연출 + 사운드
5. **골 플래그**: CLEAR 상태 전환
6. **체크포인트**: 활성화 (리스폰 위치 갱신)

### 9.3 코너 보정 (Corner Correction)
천장 충돌 시, 플레이어가 모서리에 CORNER_CORRECTION(4px) 이내로 걸리면 자동으로 좌/우로 밀어서 통과시킨다. 이 기능이 없으면 "벽에 머리가 걸려서 점프가 끊기는" 답답한 경험이 발생한다.

---

## §10. 함수 시그니처 설계 (순수 함수 원칙)

**모든 게임 로직 함수는 필요한 데이터를 파라미터로 받는다. 전역 변수 직접 참조 금지.**

### 10.1 핵심 함수 목록

| 함수 | 파라미터 | 반환 | 역할 |
|------|----------|------|------|
| `updatePlayer(player, input, level, dt)` | 플레이어 상태, 입력, 레벨 데이터, dt | 갱신된 player | 물리+이동 통합 |
| `checkCollision(entity, level)` | 엔티티 AABB, 타일맵 | 충돌 결과 객체 | AABB 충돌 판정 |
| `resolveCollision(player, collision)` | 플레이어, 충돌 결과 | 보정된 위치 | 위치 보정 |
| `checkHazards(player, hazards)` | 플레이어 AABB, 함정 배열 | boolean | 함정 충돌 여부 |
| `collectGem(player, gems)` | 플레이어 AABB, 보석 배열 | 수집된 보석 인덱스 | 보석 수집 판정 |
| `updateCamera(camera, target, bounds, dt)` | 카메라, 추적 대상, 레벨 경계, dt | 갱신된 camera | 카메라 추적 |
| `updateMovingPlatform(platform, dt)` | 발판 데이터, dt | 갱신된 위치 | 이동 발판 |
| `spawnDeathParticles(pool, x, y, color)` | 파티클 풀, 좌표, 색상 | void | 사망 파티클 |
| `calcStageScore(time, gems, deaths, cfg)` | 클리어 데이터, CONFIG | number | 점수 계산 |
| `generateDailyLevel(seed, cfg)` | 시드, 생성 CONFIG | 레벨 데이터 | 일일 챌린지 레벨 생성 |

### 10.2 상태 전환 함수
```javascript
// 유일한 전환 진입점
function beginTransition(targetState, options = {}) {
  if (isTransitioning) return;  // 가드
  isTransitioning = true;
  if (options.immediate) {
    enterState(targetState);
    isTransitioning = false;
  } else {
    tweenManager.add({
      target: transitionOverlay,
      props: { alpha: { from: 0, to: 1 } },
      duration: options.duration || 300,
      onComplete: () => {
        enterState(targetState);
        tweenManager.add({
          target: transitionOverlay,
          props: { alpha: { from: 1, to: 0 } },
          duration: options.duration || 300,
          onComplete: () => { isTransitioning = false; }
        });
      }
    });
  }
}
```

---

## §11. 변수 네이밍 규칙

Cycle 10에서 축약 변수명(`shopI` vs `shI`)이 CRITICAL 버그를 유발했으므로, 본 기획에서는 명확한 네이밍 규칙을 사전 정의한다.

### 11.1 약어 허용 목록 (이외 축약 금지)

| 약어 | 원형 | 용도 |
|------|------|------|
| `dt` | deltaTime | 프레임 간 시간 |
| `vx`, `vy` | velocityX/Y | 속도 벡터 |
| `dx`, `dy` | deltaX/Y | 위치 변화량 |
| `tw` | tweenManager | 트윈 매니저 참조 |
| `pl` | player | 플레이어 객체 |
| `cam` | camera | 카메라 객체 |
| `cfg` | config | 설정 객체 |
| `ctx` | canvasContext | 캔버스 2D 컨텍스트 |
| `lvl` | level | 현재 레벨 데이터 |
| `idx` | index | 반복 인덱스 |
| `len` | length | 배열 길이 |
| `btn` | button | 버튼 요소 |

### 11.2 금지 패턴
- 같은 개념에 2개 이상의 약어 사용 금지 (예: `stageIdx`와 `stgI` 혼용 금지)
- 단일 문자 변수는 `i`, `j`, `k` (루프)와 `x`, `y` (좌표)만 허용
- 함수 내 지역 변수도 동일 규칙 적용

---

## §12. 구현 체크리스트 및 금지 패턴

### 12.1 assets/ 디렉토리 정책
- **assets/ 디렉토리 생성 절대 금지**
- 모든 비주얼은 Canvas API(fillRect, arc, lineTo, bezierCurveTo, fillText)로 렌더링
- 외부 이미지/SVG/폰트 파일 0개
- Google Fonts 등 외부 CDN 로드 금지
- 시스템 폰트만 사용: `"Segoe UI", system-ui, sans-serif`

### 12.2 코드 금지 패턴

| 금지 패턴 | 사유 | 대체 |
|-----------|------|------|
| `setTimeout` / `setInterval` | 상태 전환 타이밍 불안정 | tween onComplete |
| `alert()` / `confirm()` / `prompt()` | iframe 환경 불가 | Canvas 기반 모달 |
| `eval()` | 보안 취약 | 직접 파싱 |
| `feGaussianBlur` / SVG 필터 | 10사이클 재발 이력 | Canvas shadow 또는 직접 렌더 |
| `new Image()` / `<img>` | 외부 에셋 의존 | Canvas 코드 드로잉 |
| `enterState()` 직접 호출 | 전환 가드 우회 | `beginTransition()` |
| 전역 변수 직접 참조 (함수 내) | 순수 함수 원칙 위반 | 파라미터로 전달 |
| `document.querySelector` 남용 | Canvas 전용 게임 | Canvas API |

### 12.3 선언 변수 사용처 검증 (유령 변수 방지)
구현 완료 후, 선언된 모든 `let`/`const`/`var` 변수가 실제로 읽히는지 검증:
- 선언만 되고 사용되지 않는 변수 → 삭제
- 기획서 의도와 다르게 사용되는 변수 → 수정

### 12.4 TweenManager 사용 규칙
- `clearImmediate()`: 상태 전환 시 즉시 정리 (deferred cancelAll 대신)
- `add()` 호출은 반드시 `clearImmediate()` 이후에만
- 하나의 값에 대한 갱신 경로는 tween 또는 직접 대입 중 **하나만** 사용

### 12.5 기획-구현 수치 정합성 검증 테이블

구현 완료 후, 아래 테이블의 모든 값이 코드와 일치하는지 검증:

| 섹션 | 상수명 | 기획 값 | 코드 값 (검증 후 기입) |
|------|--------|---------|----------------------|
| §8.1 | GRAVITY | 0.55 | |
| §8.1 | JUMP_FORCE | -11.5 | |
| §8.1 | COYOTE_TIME | 6 | |
| §8.1 | JUMP_BUFFER | 6 | |
| §8.1 | WALL_JUMP_FORCE_X | 7 | |
| §8.1 | WALL_JUMP_FORCE_Y | -10.5 | |
| §8.1 | DOUBLE_JUMP_FORCE | -10 | |
| §8.1 | DASH_SPEED | 14 | |
| §8.1 | DASH_DURATION | 8 | |
| §8.1 | CORNER_CORRECTION | 4 | |
| §7.1 | STAGE_CLEAR_BASE | 1000 | |
| §7.1 | GEM_BONUS | 500 | |
| §7.1 | NO_DEATH_BONUS | 2000 | |
| §6.4 | HINT_THRESHOLD(10회) | 10 | |
| §6.4 | HINT_THRESHOLD(20회) | 20 | |

### 12.7 변수 선언 순서 검증 (TDZ 방지 — Cycle 11 교훈)
Cycle 11에서 `let gridCache` 선언이 `resizeCanvas()` 호출보다 뒤에 위치하여 게임 완전 불능 CRITICAL이 발생했다.

**규칙:**
- 모든 `let`/`const` 변수는 최초 참조(함수 호출 포함) **이전에** 선언
- 초기화 코드 블록의 실행 순서를 명시적으로 검증:
  1. CONFIG 상수 선언
  2. 유틸리티 클래스 선언 (TweenManager, ObjectPool 등)
  3. 게임 상태 변수 선언 (`let player, camera, level, ...`)
  4. 캐시/오프스크린 Canvas 변수 선언
  5. 함수 선언 (function 호이스팅되지만, 변수를 참조하는 함수 주의)
  6. `resizeCanvas()` 및 초기화 호출
  7. 이벤트 리스너 등록
  8. `requestAnimationFrame(gameLoop)` 시작

**검증 체크리스트:**
- [ ] 모든 `let`/`const` 선언이 최초 사용 라인보다 위에 위치하는가?
- [ ] `resizeCanvas()` 호출 시점에 필요한 모든 변수가 선언되었는가?
- [ ] 오프스크린 Canvas 캐시 변수가 `resizeCanvas()` 이전에 선언되었는가?

### 12.8 수정 회귀 방지 (Cycle 10 교훈)
Cycle 10에서 1회차 MINOR 수정 중 `render()` 시그니처 변경 시 `timestamp` 미전달로 신규 CRITICAL이 발생했다.

**규칙:**
- 함수 시그니처 변경 시, 해당 함수의 **모든 호출부**를 전수 검색하여 인자 전파 확인
- 수정 후 전체 플로우 회귀 테스트: TITLE→PLAY→DEAD→PLAY→CLEAR→(반복)→PAUSE→PLAY 전경로 순회
- 수정 1건당 영향 범위 사전 분석 후 수정

**회귀 테스트 체크리스트:**
- [ ] 타이틀 화면 정상 렌더링?
- [ ] 게임 시작 → 이동/점프 정상?
- [ ] 함정 사망 → 즉시 리스폰 정상?
- [ ] 보석 수집 → 파티클/사운드 정상?
- [ ] 골 도달 → 클리어 연출 → 다음 스테이지 로드 정상?
- [ ] 일시정지 → 재개 정상?
- [ ] 터치 컨트롤 정상?

### 12.9 방어적 코딩 패턴 (Cycle 10 표준)
```javascript
// 게임 루프 try-catch 래핑 — 1프레임 에러가 전체 게임을 중단하지 않도록
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
    lastTime = timestamp;
    update(dt);
    render(ctx, dt, timestamp);
  } catch (e) {
    console.error('Game loop error:', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 12.10 보일러플레이트 모듈 (이전 사이클 동일 인터페이스)
아래 모듈은 이전 사이클에서 검증 완료된 인터페이스를 그대로 사용:
- **TweenManager**: `add()`, `update(dt)`, `clearImmediate()`, `cancelAll()`
- **ObjectPool**: `get()`, `release(obj)`, `forEach(fn)`
- **TransitionGuard**: `beginTransition(state, options)`
- **Input**: `isDown(key)`, `justPressed(key)`, `update()`, `postUpdate()`
- **SoundManager**: Web Audio API 기반, `play(name)`, `setVolume(v)`

---

## §13. 사운드 설계

### 13.1 효과음 (Web Audio API — 코드 생성)
모든 효과음은 OscillatorNode + GainNode로 코드 생성. 외부 오디오 파일 0개.

| 효과음 | 파형 | 주파수 | 지속시간 | 트리거 |
|--------|------|--------|----------|--------|
| 점프 | sine | 400→600Hz | 0.08s | 점프 |
| 이중점프 | sine | 500→800Hz | 0.1s | 이중점프 |
| 벽점프 | square | 300→500Hz | 0.06s | 벽점프 |
| 대시 | sawtooth | 200→100Hz | 0.12s | 대시 |
| 사망 | noise | - | 0.2s | 함정 충돌 |
| 보석 수집 | sine | 800→1200Hz | 0.15s | 보석 충돌 |
| 클리어 | sine arpeggio | C5→E5→G5→C6 | 0.4s | 골 도달 |
| 체크포인트 | triangle | 600→900Hz | 0.2s | 체크포인트 활성화 |

### 13.2 배경음
- 음소거 가능한 미니멀 앰비언스 (저주파 드론)
- 월드별 기본 주파수 변경으로 분위기 차별화

---

## §14. 모바일/반응형 대응

### 14.1 Canvas 크기
```javascript
CONFIG.CANVAS = {
  BASE_WIDTH: 800,          // 기본 해상도
  BASE_HEIGHT: 450,         // 16:9
  TILE_SIZE: 16,            // 1타일 = 16px (기본 해상도 기준)
  DPR: window.devicePixelRatio || 1  // 고해상도 디스플레이 대응
};
```

### 14.2 반응형 스케일링
- 부모 컨테이너에 맞춰 Canvas 스케일링 (`canvas.style.width/height`)
- 실제 Canvas 해상도는 `BASE × DPR`로 선명도 유지
- 터치 좌표 변환: `(touchX - canvasRect.left) / scaleX`

### 14.3 터치 이벤트 처리
```javascript
// 3종 이벤트 + passive: false
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', handleTouch, { passive: false });
canvas.addEventListener('touchend', handleTouch, { passive: false });

function handleTouch(e) {
  e.preventDefault();  // 스크롤 방지
  // 가상 D패드 + 버튼 영역 판정
}
```

---

## §15. 성능 최적화

### 15.1 렌더링 최적화
- **타일맵**: 카메라 뷰포트 내 타일만 렌더링 (뷰포트 컬링)
- **파티클**: ObjectPool로 GC 방지 (최대 동시 100개)
- **배경**: 별도 오프스크린 Canvas에 프리렌더 → 스크롤 시 drawImage

### 15.2 물리 최적화
- 충돌 판정은 플레이어 주변 3×3 타일 범위만 검사
- 이동 발판은 활성화 범위(카메라 뷰 + 여유) 내에서만 업데이트

---

## 부록: 구현 우선순위

| 순서 | 항목 | 필수/선택 |
|------|------|-----------|
| 1 | 타일맵 렌더링 + 기본 이동 + 점프 | 필수 |
| 2 | AABB 충돌 + 가시 즉사 + 리스폰 | 필수 |
| 3 | 코요테 타임 + 점프 버퍼 + 가변 점프 높이 | 필수 |
| 4 | 5상태 전환 (beginTransition 경유) | 필수 |
| 5 | 월드 1 (5스테이지) 핸드메이드 레벨 | 필수 |
| 6 | 벽점프 (월드 2) | 필수 |
| 7 | 이중점프 (월드 3) | 필수 |
| 8 | 대시 + 잔상 (월드 4) | 필수 |
| 9 | 월드 5 + 중력 반전 존 | 필수 |
| 10 | 보석 수집 + 점수 시스템 | 필수 |
| 11 | HUD + 스피드런 타이머 | 필수 |
| 12 | localStorage 저장/로드 | 필수 |
| 13 | 카메라 시스템 (lerp 추적) | 필수 |
| 14 | 파티클 시스템 (사망/보석/클리어) | 필수 |
| 15 | 사운드 (코드 생성 효과음) | 필수 |
| 16 | 터치 컨트롤 (가상 D패드) | 필수 |
| 17 | 일일 챌린지 (Seeded RNG) | 선택 |
| 18 | 적응형 힌트 시스템 | 선택 |
| 19 | 히든 스테이지 | 선택 |

---

_기획서 끝 — InfiniTriX Cycle #11, 미니 플랫포머_
