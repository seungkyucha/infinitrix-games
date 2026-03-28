---
game-id: gem-royal-challenge
title: 젬 로얄 챌린지
genre: puzzle
difficulty: hard
---

# 젬 로얄 챌린지 (Gem Royal Challenge)

> **사이클 #49 — 매치3 집중 모드 6/10 라운드 (중기 3/3)**
> Royal Match급 라이브 이벤트/토너먼트 시스템 통합 매치3 — 보석 왕국의 챔피언이 되어라!

---

## §0. MVP 범위 정의

### Phase 1 — 이번 사이클 구현 범위 (MVP)
- C48 젬 나이트메어 핵심 엔진 완전 계승 (8×8 그리드, 6색, 매치 검출, 캐스케이드, 스페셜 조합 6종)
- 장애물 7종 유지 (얼음 1~3겹, 체인, 나무 상자, 독 퍼짐, 돌 블록, 커튼, 젤리)
- 부스터 4종 유지 (망치, 셔플, 추가 턴, 색상 폭탄)
- **★신규: 라이브 이벤트 시스템**
  - King's Cup 리더보드: 5레벨 단위 점수 합산 순위 경쟁 (AI 가상 플레이어 5명)
  - 데일리 챌린지: SeededRNG(날짜 시드) → 매일 다른 특수 규칙 레벨 자동 생성
  - Super Booster 이벤트: 연속 3레벨 클리어 시 부스터 무료 충전 + 추가 턴 보상
  - 팀 배틀 시뮬레이션: AI 3팀과 레벨 클리어 속도/점수 경쟁
- **★신규: 레벨 25개 + 이벤트 전용 5레벨 = 총 30레벨**
  - 5개 지역 × 5레벨 + 이벤트 전용 5레벨
  - 장애물 복합 조합 레벨 (Pie 블로커 신규: 인접 6회 매칭 필요)
- **★신규: 미니게임 독립 플레이 모드** — C48 미니게임 4종을 메인 메뉴에서 독립 선택 가능 + 타임 어택 리더보드
- **★신규: deferredTransition 큐** — enterState() 내 동기 전환 근절, coreUpdate()에서 지연 처리
- **★신규: DEV_AUTO_PLAY 시뮬레이터** — F4 토글, headless BFS 기반 자동 플레이 + 클리어율 로깅
- C48 계승: 왕 캐릭터 + 색맹 모드 + 3단계 DDA + safeGridAccess() + coreUpdate() 단일화
- Web Audio BGM + 효과음 18종+
- Canvas 풀스크린 + devicePixelRatio + 동적 리사이즈
- 다국어 ko/en

### Phase 2+ — 후속 라운드 확장 (이번에 미구현)
- 실시간 PvP 온라인 대전
- 시즌 패스 시스템 (무료/프리미엄 보상 트랙)
- 왕국 건설 메타 레이어
- 부스터 업그레이드 시스템 (3단계 강화)

---

## §0.1 이전 학습 반영 매핑

### C44~48 검증 완료 (유지) ✅
| ID | 검증된 패턴 | 적용 섹션 |
|----|------------|-----------|
| V1 | 매치 검출 우선순위(5→T/L→4→3) + used[][] 소비 추적 | §2.2 |
| V2 | TRANSITION_TABLE 화이트리스트 방식 | §5.3 |
| V3 | 가드 플래그 10중 방어 + isInputBlocked() 단일 함수 | §5.1.1 |
| V4 | 초기 보드 3매치 없음 + 유효 이동 BFS 검증 | §2.1 |
| V5 | tween onComplete 콜백 체인 (setTimeout 0건) | §5 전체 |
| V6 | DDA failStreak 기반 3단계 (기본+극단 레벨+미니게임) | §6.3 |
| V7 | Gemini PNG + manifest.json + Canvas 폴백 100% | §8 |
| V8 | touchSafe() 48px 강제 적용 | §3.4 |
| V9 | directTransition() 즉시 전환 API | §5.3 |
| V10 | SeededRNG (Math.random() 0건) | §5 전체 |
| V11 | MAP/PLAY/MINI_GAME InputHandler 완전 분리 | §5.3, §5.5 |
| V12 | safeGridAccess() 래퍼 + coreUpdate() 단일화 + finally input.flush() | §5.1 |
| V13 | 미니게임 상태 전용 InputHandler 분리 + 메인 보드 렌더링 비활성 | §5.5 |

### C48 젬 나이트메어 아쉬웠던 점 → C49 해결 (신규 상세) 🔧
| ID | C48 문제 | 해결 섹션 | 기술적 해결책 |
|----|----------|-----------|--------------|
| F1 | enterState() 내 동기 전환 트리거 — 48사이클째 여전히 발생 | §5.3 | **`GUARDS.deferredTransition` 큐 도입**: enterState()에서 전환 요청 시 `deferredQueue.push(nextState)`. coreUpdate() 루프 말미에서 큐 소비하여 전환 실행. enterState() 내부에서 `beginTransition()`/`directTransition()` 직접 호출 시 `console.error()` + 큐로 대체. **기계적 강제 장치** |
| F2 | 밸런스 자동 시뮬레이터 미착수 | §6.4 | **DEV_AUTO_PLAY 간이 시뮬레이터**: F4 토글. BFS 기반 최적 이동 자동 선택 → 레벨당 100회 시뮬 → 클리어율/평균 턴 소모/장애물 파괴율 콘솔 로깅. 30레벨 전수 자동 검증. 프로덕션 빌드에서 `if(DEV_MODE)` 가드로 제거 |
| F3 | 미니게임 모바일 UX 미검증 | §3.4, §9.3 | **이벤트 UI 전용 터치 최적화**: 모든 이벤트 버튼 48px 강제 + 스와이프 방향 감도 조절(threshold 30px). 미니게임 독립 플레이 시 전용 터치 가이드 오버레이 |
| F4 | 공용 엔진 모듈 미분리 (48사이클째) | §5.1 | **코드 내부 섹션 분리**: `// ═══ MODULE: TweenManager ═══`, `// ═══ MODULE: ObjectPool ═══` 등 명확한 섹션 구분 + 함수 시그니처 통일. 향후 분리 대비 의존성 단방향 강제 |
| F5 | 미니게임 독립 플레이 미제공 | §10 | **미니게임 허브**: 메인 메뉴에서 "미니게임" 탭으로 4종 독립 선택 + 타임 어택 리더보드. 이벤트 보상으로 미니게임 언락 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
보석 왕국 5개 지역(수정 숲, 루비 화산, 사파이어 해안, 에메랄드 정원, 다이아몬드 성)을 여행하며 25레벨을 클리어하는 매치3 퍼즐에, Royal Match식 **라이브 이벤트/토너먼트 시스템**을 통합한 **경쟁형 이벤트 매치3**. King's Cup 리더보드, 데일리 챌린지, Super Booster 이벤트, 팀 배틀이 단순 레벨 클리어를 넘어 매일 새로운 목표와 경쟁을 제공한다.

### 핵심 재미 요소
1. **King's Cup 경쟁**: 5레벨 단위 점수 합산으로 AI 가상 플레이어 5명과 실시간 느낌의 순위 경쟁. "지금 3위인데 한 판만 더!" 리텐션 유발
2. **매일 새로운 챌린지**: 날짜 시드 기반 랜덤 생성으로 매일 다른 특수 규칙 레벨 — "오늘은 폭탄만 사용", "턴 제한 10턴" 등
3. **Super Booster 연속 클리어 보상**: 3연승 시 부스터 무료 충전 → 부스터를 아낄지 공격적으로 쓸지 전략적 선택
4. **팀 배틀 소속감**: AI 3팀 vs 나의 팀, 레벨 클리어 속도/점수 합산으로 팀 승리 달성 시 보너스 보상
5. **연쇄 폭발의 쾌감**: 캐스케이드 → 콤보 → 스페셜 조합의 도미노 폭발. 스페셜 조합 6종의 화려한 연출
6. **장애물 8종의 퍼즐적 깊이**: 기존 7종 + 신규 Pie 블로커(인접 6회 매칭 필요)의 복합 조합

---

## §2. 게임 규칙 및 목표

### §2.1 보드 구성
- **8×8 그리드**, 6색 보석 (루비-빨강, 사파이어-파랑, 에메랄드-초록, 토파즈-노랑, 아메시스트-보라, 다이아몬드-하양)
- 초기 보드 생성 시: 3매치 없음 + 유효 이동 1개 이상 BFS 검증 (SeededRNG)
- 유효 이동 없을 시 자동 셔플 (Royal Match식 — 부스터 강제 소비 방지)

### §2.2 매칭 규칙 (우선순위 매치 검출)
1. **5매치** → 무지개 보석 (Rainbow Gem) 생성: 선택 시 해당 색상 전체 제거
2. **T/L자 매치** → 폭탄 보석 (Bomb Gem) 생성: 3×3 범위 폭발
3. **4매치** → 줄 파괴 보석 (Line Gem) 생성: 가로 또는 세로 한 줄 전체 파괴
4. **3매치** → 기본 매칭: 해당 보석 3개 제거 + 점수 획득
- `used[][]` 소비 추적으로 하나의 보석이 여러 매치에 중복 사용되지 않도록 보장

### §2.3 스페셜 조합 (6종)
| 조합 | 효과 |
|------|------|
| Line + Line | 십자가 파괴 (가로+세로 동시) |
| Line + Bomb | 3줄 파괴 (가로 3줄 또는 세로 3줄) |
| Bomb + Bomb | 5×5 범위 폭발 |
| Line + Rainbow | 모든 보석을 Line으로 변환 후 전체 폭발 |
| Bomb + Rainbow | 모든 보석을 Bomb으로 변환 후 전체 폭발 |
| Rainbow + Rainbow | 보드 전체 보석 제거 |

### §2.4 장애물 8종
| 장애물 | 해제 조건 | 레벨 첫 등장 |
|--------|-----------|-------------|
| 얼음 (1~3겹) | 인접 매칭 1회당 1겹 제거 | 레벨 2 |
| 체인 | 인접 매칭 2회 | 레벨 4 |
| 나무 상자 | 인접 매칭 1회 | 레벨 6 |
| 독 퍼짐 | 턴마다 인접 1칸 확산, 매칭으로 제거 | 레벨 8 |
| 돌 블록 | 파괴 불가, 우회 필요 | 레벨 10 |
| 커튼 | 인접 매칭으로 개방, 뒤 보석 미리보기 불가 | 레벨 13 |
| 젤리 | 보석 아래 깔림, 해당 칸 매칭으로 제거 | 레벨 16 |
| **Pie 블로커 (신규)** | 6등분, 인접 매칭마다 1조각 제거, 6회 완전 파괴 | 레벨 20 |

### §2.5 부스터 4종
| 부스터 | 효과 | 충전 조건 |
|--------|------|-----------|
| 🔨 망치 | 선택한 보석/장애물 1개 즉시 파괴 | 레벨 클리어 보상 또는 Super Booster 이벤트 |
| 🔀 셔플 | 보드 전체 보석 재배치 | 3레벨 연속 클리어 시 무료 1회 |
| ➕ 추가 턴 | 남은 턴 +5 | King's Cup 리더보드 보상 |
| 🌈 색상 폭탄 | 선택한 색상 보석 전체 제거 | 데일리 챌린지 클리어 보상 |

### §2.6 레벨 목표 유형
| 목표 유형 | 설명 | 예시 |
|-----------|------|------|
| 점수 달성 | 목표 점수 이상 획득 | "15,000점 달성" |
| 보석 수집 | 특정 색상 보석 N개 매칭 | "루비 30개 수집" |
| 장애물 파괴 | 특정 장애물 전부 제거 | "얼음 모두 파괴" |
| 젤리 제거 | 젤리 타일 전부 클리어 | "젤리 20칸 제거" |
| 복합 목표 | 2개 이상 동시 달성 | "에메랄드 20개 + 체인 5개 파괴" |
| **Pie 완파 (신규)** | Pie 블로커 전부 파괴 | "Pie 블로커 3개 완전 파괴" |

---

## §3. 조작 방법

### §3.1 키보드
| 키 | 기능 |
|----|------|
| 마우스 클릭+드래그 | 보석 스왑 |
| 1, 2, 3, 4 | 부스터 1~4 선택 |
| ESC | 일시정지 메뉴 |
| M | 레벨 맵으로 복귀 |
| F4 | DEV_AUTO_PLAY 토글 (개발 전용) |
| F5 | 색맹 모드 토글 |
| Tab | 이벤트 패널 열기/닫기 |

### §3.2 마우스
- **클릭+드래그**: 인접 보석과 위치 교환 (스왑)
- **더블 클릭**: 스페셜 보석 즉시 발동
- **우클릭**: 부스터 사용 (선택 상태에서)
- **스크롤**: 레벨 맵 스크롤 / 리더보드 스크롤

### §3.3 터치
- **스와이프**: 인접 보석과 위치 교환 (threshold 30px, 4방향 판정)
- **탭**: 스페셜 보석 발동 / 부스터 사용 / UI 버튼
- **롱프레스 (500ms)**: 보석 정보 팝업 (장애물 남은 내구도 표시)
- **핀치 줌**: 레벨 맵에서 줌 인/아웃

### §3.4 터치 안전 규칙
- 모든 인터랙티브 요소: `Math.max(CONFIG.MIN_TOUCH_48, elementSize)` 강제 적용
- 이벤트 UI 버튼: 최소 48×48px
- 보석 셀: 그리드 크기에 따라 자동 조절, 최소 44×44px
- 스와이프 방향 감도: threshold 30px (오조작 방지)

---

## §4. 시각적 스타일 가이드

### §4.1 색상 팔레트
- **Primary**: #1a0a2e (딥 퍼플 배경), #6c3cf7 (로얄 퍼플)
- **Accent**: #ffd700 (골드 — 점수/왕관), #00d4ff (시안 — 이벤트), #ff4444 (레드 — 경고/타이머)
- **Gem Colors**: #ff3344 (루비), #3388ff (사파이어), #33cc55 (에메랄드), #ffcc00 (토파즈), #aa44ff (아메시스트), #ffffff (다이아몬드)
- **UI**: #2a1a3e (패널 배경), #f0e6ff (밝은 텍스트), #8b6fcf (서브 텍스트)

### §4.2 배경
- 5개 지역별 고유 배경:
  - 수정 숲: 보라+파랑 톤의 마법 숲, 수정 나무, 반딧불이 파티클
  - 루비 화산: 붉은 용암 흐름, 화산 실루엣, 불꽃 파티클
  - 사파이어 해안: 청록색 바다, 산호초, 물방울 파티클
  - 에메랄드 정원: 초록+골드 정원, 꽃, 나비 파티클
  - 다이아몬드 성: 은색+흰색 성, 눈꽃 결정, 별빛 파티클
- 패럴랙스 3레이어: 원경(하늘/구름) + 중경(지형/건물) + 근경(보드 프레임)

### §4.3 오브젝트 형태
- **보석**: 3D 느낌의 글로시 보석 — 부드러운 그라디언트 + 하이라이트 반사 + 내부 빛 산란
- **스페셜 보석**: 기본 보석 + 빛나는 이펙트 오버레이 (줄 파괴=화살표, 폭탄=별, 무지개=프리즘)
- **장애물**: 반투명 레이어 (얼음), 금속 체인, 나무 텍스처, 독 버블, 돌 텍스처, 커튼 천, 젤리 반짝임, Pie 조각
- **왕 캐릭터**: 작은 왕관 + 로브 + 5가지 표정 (기본/기쁨/놀람/공포/트로피)
- **이벤트 UI**: 골드+퍼플 로얄 테마, 왕관 아이콘, 리본 장식, 방패 프레임

---

## §4.5 아트 디렉션 (Art Direction)

### 아트 스타일 키워드
**"glossy 3D-style 2D gems, warm fantasy storybook"**

- 로얄 매치/캔디 크러시 급 — 밝고 화려한 3D 느낌의 2D 보석 렌더링
- 부드러운 그라디언트, 글로시 반사, 보석 내부 빛 산란 (caustics 효과)
- 배경은 따뜻한 판타지 동화 스타일 — 수채화 텍스처 + 부드러운 그림자
- UI는 로얄/럭셔리 테마 — 골드 테두리, 보석 장식, 리본 배너

### 레퍼런스 게임
1. **Royal Match** (Dream Games) — 보석 광택/반사, 로얄 UI 테마, 캐릭터 표정 연출
2. **Candy Crush Saga** (King) — 밝고 포화된 색감, 매칭 이펙트 연출, 레벨 맵 디자인

### 에셋 통일성 규칙
- 모든 보석은 동일한 광원 방향 (좌상단 45°)에서 하이라이트
- 배경과 UI는 보석 색상과 충돌하지 않는 어두운 톤 유지
- 이펙트는 보석 색상을 기반으로 한 발광(glow) 중심
- 모든 에셋 art-style 필드: `"glossy 3D-style 2D gems, warm fantasy storybook"`

---

## §5. 핵심 게임 루프 (프레임 기준 로직 흐름)

### §5.1 메인 루프 구조

```
requestAnimationFrame(mainLoop)
  ├─ dt = clamp(timestamp - lastTime, 0, 50) // 50ms 캡 (20fps 최저)
  ├─ try {
  │    coreUpdate(dt)    // 단일 진입점
  │    coreRender()      // 렌더링만
  │  } finally {
  │    input.flush()     // 에러 시에도 입력 플러시 보장
  │  }
  └─ deferredTransitionProcess() // enterState에서 큐잉된 전환 처리
```

### §5.1.1 가드 플래그 11중 방어 + isInputBlocked() 단일 함수
```
swapLocked         — 스왑 애니메이션 진행 중
cascadeInProgress  — 캐스케이드 진행 중
resolving          — 매치 해소 중
goalChecking       — 목표 확인 중
poisonSpreading    — 독 퍼짐 처리 중
colorBombResolving — 색상 폭탄 연쇄 중
miniGameActive     — 미니게임 진행 중
eventTransition    — 이벤트 화면 전환 중 (★신규)
boosterActive      — 부스터 사용 중
pieResolving       — Pie 블로커 조각 제거 중 (★신규)
boardShuffling     — 셔플 진행 중

function isInputBlocked() {
  return swapLocked || cascadeInProgress || resolving || goalChecking ||
         poisonSpreading || colorBombResolving || miniGameActive ||
         eventTransition || boosterActive || pieResolving || boardShuffling;
}
```

### §5.2 상태×시스템 매트릭스

| 상태 | Tween | Physics | Input | Board | Event | Render |
|------|-------|---------|-------|-------|-------|--------|
| LOADING | - | - | - | - | - | 프로그레스 바 |
| TITLE | ✅ | - | 메뉴 | - | - | 타이틀 화면 |
| EVENT_HUB | ✅ | - | 이벤트 | - | ✅ | 이벤트 허브 |
| DAILY_CHALLENGE | ✅ | - | 보드 | ✅ | ✅ | 데일리 보드 |
| KINGS_CUP | ✅ | - | 보드 | ✅ | ✅ | 리더보드 오버레이 |
| TEAM_BATTLE | ✅ | - | 보드 | ✅ | ✅ | 팀 스코어 오버레이 |
| MAP | ✅ | - | 맵 스크롤 | - | - | 레벨 맵 |
| LEVEL_INTRO | ✅ | - | 확인 | - | - | 목표 표시 |
| PLAY | ✅ | ✅ | 보드+부스터 | ✅ | - | 게임 보드 |
| CASCADE | ✅ | ✅ | 차단 | ✅ | - | 캐스케이드 |
| GOAL_CHECK | ✅ | - | 차단 | ✅ | - | 목표 검사 |
| RESULT | ✅ | - | 확인 | - | - | 결과 화면 |
| MINI_HUB | ✅ | - | 메뉴 | - | - | 미니게임 선택 |
| MINI_INTRO | ✅ | - | 확인 | - | - | 미니게임 소개 |
| MINI_GAME | ✅ | ✅ | 미니게임 | - | - | 미니게임 보드 |
| MINI_RESULT | ✅ | - | 확인 | - | - | 미니게임 결과 |
| PAUSE | - | - | 메뉴 | - | - | 일시정지 오버레이 |
| SUPER_BOOSTER | ✅ | - | 선택 | - | ✅ | 부스터 보상 UI |

### §5.3 상태 전환 다이어그램 (TRANSITION_TABLE 18상태)

```
LOADING → TITLE
TITLE → MAP | EVENT_HUB | MINI_HUB
EVENT_HUB → DAILY_CHALLENGE | KINGS_CUP | TEAM_BATTLE | TITLE
DAILY_CHALLENGE → GOAL_CHECK | RESULT | EVENT_HUB | PAUSE
KINGS_CUP → GOAL_CHECK | RESULT | EVENT_HUB | PAUSE
TEAM_BATTLE → GOAL_CHECK | RESULT | EVENT_HUB | PAUSE
MAP → LEVEL_INTRO | TITLE | EVENT_HUB
LEVEL_INTRO → PLAY | MAP
PLAY → CASCADE | GOAL_CHECK | PAUSE | SUPER_BOOSTER
CASCADE → PLAY | GOAL_CHECK
GOAL_CHECK → RESULT | PLAY (턴 남음+목표 미달)
RESULT → MAP | MINI_INTRO | KINGS_CUP(점수 갱신) | EVENT_HUB
MINI_HUB → MINI_INTRO | TITLE
MINI_INTRO → MINI_GAME | MAP | MINI_HUB
MINI_GAME → MINI_RESULT | PAUSE
MINI_RESULT → MAP | MINI_HUB | EVENT_HUB
PAUSE → (이전 상태로 복귀)
SUPER_BOOSTER → PLAY
```

⚠️ **deferredTransition 큐 규칙 (C48 F1 해결)**:
```javascript
// enterState() 내부에서 절대 직접 전환하지 않음
function enterState(newState) {
  // ... 초기화 로직 ...
  // ❌ 금지: beginTransition(STATE.X)
  // ✅ 허용: GUARDS.deferredQueue.push(STATE.X)
}

// coreUpdate() 루프 말미에서 큐 소비
function deferredTransitionProcess() {
  if (GUARDS.deferredQueue.length > 0) {
    const next = GUARDS.deferredQueue.shift();
    beginTransition(next);
  }
}
```

### §5.4 캐스케이드 흐름
```
PLAY (스왑 완료)
  → 매치 검출 (5→T/L→4→3 우선순위, used[][] 추적)
  → 매치 있음? → CASCADE 상태 진입
    → 매칭 보석 제거 tween (0.15s)
    → 스페셜 보석 생성 체크
    → 장애물 인접 데미지 (얼음/체인/Pie 조각 제거)
    → 독 퍼짐 처리
    → 중력 낙하 tween (0.2s)
    → 빈 칸 새 보석 생성
    → 재매치 검출 → 매치 있으면 루프 반복
    → 매치 없음 → GOAL_CHECK로 deferredQueue push
  → 매치 없음? → 스왑 되돌리기 tween → PLAY 유지
```

### §5.5 InputHandler 분리 정책
- **MapInputHandler**: 맵 스크롤, 레벨 선택, 핀치 줌
- **BoardInputHandler**: 보석 스왑, 부스터 사용, 더블 클릭 스페셜 발동
- **EventInputHandler**: 이벤트 허브 탐색, 리더보드 스크롤, 데일리 챌린지 선택
- **MiniGameInputHandler**: 미니게임별 전용 조작 (스와이프/탭/드래그)
- 각 InputHandler는 상태 전환 시 `activate()`/`deactivate()` 토글

### §5.6 coreUpdate() 단일 진입점 강제
```javascript
function coreUpdate(dt) {
  tweenManager.update(dt);
  switch (currentState) {
    case STATE.PLAY: updatePlay(dt); break;
    case STATE.CASCADE: updateCascade(dt); break;
    case STATE.GOAL_CHECK: updateGoalCheck(dt); break;
    case STATE.DAILY_CHALLENGE: updateDailyChallenge(dt); break;
    case STATE.KINGS_CUP: updateKingsCup(dt); break;
    case STATE.TEAM_BATTLE: updateTeamBattle(dt); break;
    case STATE.MINI_GAME: updateMiniGame(dt); break;
    // ... 기타 상태
  }
}
// ⚠️ engine._update에서 coreUpdate()만 호출. 별도 gameUpdate() 중복 코드 0건.
```

---

## §6. 난이도 시스템

### §6.1 레벨 구성 (25 메인 + 5 이벤트)

| 지역 | 레벨 | 턴 수 | 장애물 | 목표 | 난이도 |
|------|------|-------|--------|------|--------|
| 수정 숲 (1~5) | 1~5 | 30~25 | 얼음1~2, 나무 상자 | 점수/보석 수집 | ★☆☆☆☆ |
| 루비 화산 (6~10) | 6~10 | 25~22 | 체인, 독, 돌 블록 | 장애물 파괴/복합 | ★★☆☆☆ |
| 사파이어 해안 (11~15) | 11~15 | 22~20 | 커튼, 얼음3, 독+체인 | 젤리 제거/복합 | ★★★☆☆ |
| 에메랄드 정원 (16~20) | 16~20 | 20~18 | 젤리+독+커튼+돌 | 복합 2종+점수 | ★★★★☆ |
| 다이아몬드 성 (21~25) | 21~25 | 18~15 | Pie+전종 복합 | Pie 완파/복합 3종 | ★★★★★ |
| 이벤트 전용 (E1~E5) | E1~E5 | 가변 | 가변 | 이벤트별 특수 | ★★★~★★★★★ |

### §6.2 난이도 곡선 (Royal Match 참조)
- **이동 감소**: 초반 30턴 → 후반 15턴 (약 50% 결정 밀도 증가)
- **장애물 복합도**: 1종 → 최대 4종 동시 (레벨 21+)
- **목표 복합도**: 단일 → 최대 3종 동시 (레벨 21+)
- **피크 난이도 레벨**: 10, 15, 20, 25 (지역 보스 레벨)
- **쉬어가기 레벨**: 6, 11, 16, 21 (지역 첫 레벨, 새 장애물 학습)

### §6.3 DDA (Dynamic Difficulty Adjustment) — 4단계
| 레벨 | 조건 | 조정 |
|------|------|------|
| 기본 | failStreak ≥ 2 | 턴 +2, 목표 수량 -2 |
| 중급 | failStreak ≥ 4 | 턴 +4, 목표 수량 -4, 장애물 내구도 -1 |
| 극단 | failStreak ≥ 6 | 턴 +6, 목표 수량 -6, 장애물 1종 제거, 부스터 1개 무료 |
| 미니게임 | miniFailStreak ≥ 2 | 시간 +5초, 난이도 감소 (독립 적용) |
- 클리어 시 failStreak 리셋
- DDA 적용 시 UI에 은근한 힌트 ("행운의 바람이 불어옵니다!" 텍스트)
- ⚠️ **데일리 챌린지에서는 DDA 비적용** (공정성 보장)

### §6.4 DEV_AUTO_PLAY 시뮬레이터 (F4 토글)
```
활성화 시:
1. 현재 레벨을 headless 모드로 실행
2. BFS 기반 최적 이동 자동 선택 (매칭 수 최대화 → 목표 진행도 최대화)
3. 레벨당 100회 시뮬레이션 실행
4. 콘솔 로깅: 클리어율, 평균 턴 소모, 장애물 파괴율, 스페셜 생성 빈도
5. 30레벨 전수 자동 검증 → 클리어율 70~90% 범위가 적정
6. if(DEV_MODE) 가드로 프로덕션에서 제거
```

---

## §7. 점수 시스템

### §7.1 기본 점수
| 액션 | 점수 |
|------|------|
| 3매치 | 50 × 보석 수 |
| 4매치 | 100 × 보석 수 |
| T/L매치 | 150 × 보석 수 |
| 5매치 | 250 × 보석 수 |
| 캐스케이드 콤보 | ×1.5 (2콤보), ×2 (3콤보), ×3 (4+콤보) |
| 장애물 파괴 | 200 / 개 |
| Pie 조각 제거 | 50 / 조각 |
| Pie 완전 파괴 | 500 보너스 |
| 잔여 턴 보너스 | 잔여턴 × 100 |

### §7.2 스페셜 조합 점수
| 조합 | 추가 점수 |
|------|-----------|
| Line + Line | 1,000 |
| Line + Bomb | 1,500 |
| Bomb + Bomb | 2,000 |
| Line + Rainbow | 3,000 |
| Bomb + Rainbow | 4,000 |
| Rainbow + Rainbow | 5,000 |

### §7.3 이벤트 점수
- **King's Cup**: 5레벨 합산 점수로 순위 결정
- **데일리 챌린지**: 별도 점수 체계 (특수 규칙별 보너스 점수)
- **팀 배틀**: 팀원 점수 합산 (내 점수 + AI 팀원 2명 점수)

### §7.4 별 등급 (레벨별)
| 등급 | 조건 |
|------|------|
| ★☆☆ | 목표 달성 |
| ★★☆ | 목표 달성 + 점수 80% 이상 |
| ★★★ | 목표 달성 + 점수 100% 이상 + 잔여턴 3턴 이상 |

---

## §8. 에셋 요구 사항 (Asset Requirements)

이 섹션은 디자이너(아트 디렉터)에게 전달되는 에셋 제작 지시서입니다.

```yaml
# asset-requirements
art-style: "glossy 3D-style 2D gems, warm fantasy storybook"
color-palette: "#1a0a2e, #6c3cf7, #ffd700, #00d4ff, #ff4444, #33cc55, #f0e6ff"
mood: "밝고 화려한 로얄 판타지, 보석의 영롱한 빛, 따뜻한 동화 왕국"
reference: "Royal Match 보석 광택 + Candy Crush Saga 이펙트 연출"

assets:
  # ─── 보석 6색 ───
  - id: gem-ruby
    desc: "루비 보석 — 빨간색, 타원 커팅, 내부에 붉은 빛 산란, 좌상단 하이라이트 반사, 투명한 깊이감"
    size: "512x512"

  - id: gem-sapphire
    desc: "사파이어 보석 — 파란색, 직사각 커팅, 깊은 바다색 그라디언트, 빛 반사 밴드, 투명한 깊이감"
    size: "512x512"

  - id: gem-emerald
    desc: "에메랄드 보석 — 초록색, 육각 커팅, 숲의 초록 빛 그라디언트, 자연스러운 내부 결정"
    size: "512x512"

  - id: gem-topaz
    desc: "토파즈 보석 — 노란색, 하트형 커팅, 따뜻한 황금빛 그라디언트, 눈부신 중앙 하이라이트"
    size: "512x512"

  - id: gem-amethyst
    desc: "아메시스트 보석 — 보라색, 삼각 커팅, 몽환적 보라 그라디언트, 은은한 별빛 반사"
    size: "512x512"

  - id: gem-diamond
    desc: "다이아몬드 보석 — 흰색/투명, 브릴리언트 커팅, 무지개 프리즘 반사, 최고급 광택"
    size: "512x512"

  # ─── 보석 반짝임 스프라이트 시트 ───
  - id: gem-ruby-sheet
    desc: "루비 반짝임 애니메이션 — 6프레임, 빛 반사가 좌상단에서 우하단으로 이동하는 시퀀스"
    size: "768x128"
    frames: 6
    ref: "gem-ruby"

  - id: gem-sapphire-sheet
    desc: "사파이어 반짝임 애니메이션 — 6프레임, 깊은 파란 빛이 회전하는 시퀀스"
    size: "768x128"
    frames: 6
    ref: "gem-sapphire"

  - id: gem-emerald-sheet
    desc: "에메랄드 반짝임 애니메이션 — 6프레임, 초록 빛 펄스 시퀀스"
    size: "768x128"
    frames: 6
    ref: "gem-emerald"

  - id: gem-topaz-sheet
    desc: "토파즈 반짝임 애니메이션 — 6프레임, 황금빛 글리터 시퀀스"
    size: "768x128"
    frames: 6
    ref: "gem-topaz"

  - id: gem-amethyst-sheet
    desc: "아메시스트 반짝임 애니메이션 — 6프레임, 보라 별빛 펄스 시퀀스"
    size: "768x128"
    frames: 6
    ref: "gem-amethyst"

  - id: gem-diamond-sheet
    desc: "다이아몬드 반짝임 애니메이션 — 6프레임, 프리즘 무지개 반사 시퀀스"
    size: "768x128"
    frames: 6
    ref: "gem-diamond"

  # ─── 스페셜 보석 ───
  - id: special-line-h
    desc: "가로 줄 파괴 보석 — 기본 보석 형태 + 가로 방향 빛나는 화살표 오버레이, 좌우로 빛 줄기"
    size: "512x512"

  - id: special-line-v
    desc: "세로 줄 파괴 보석 — 기본 보석 형태 + 세로 방향 빛나는 화살표 오버레이, 상하로 빛 줄기"
    size: "512x512"

  - id: special-bomb
    desc: "폭탄 보석 — 기본 보석 + 별 모양 에너지 오라, 3×3 폭발 범위 암시하는 파동 링"
    size: "512x512"

  - id: special-rainbow
    desc: "무지개 보석 — 프리즘 구체, 6색 무지개 그라디언트 회전, 중앙에 빛나는 별, 모든 색상 반사"
    size: "512x512"

  # ─── 장애물 ───
  - id: obstacle-ice-1
    desc: "얼음 1겹 — 반투명 하늘색 얼음 결정 레이어, 균열 없음, 보석이 살짝 비침"
    size: "512x512"

  - id: obstacle-ice-2
    desc: "얼음 2겹 — 더 불투명한 얼음, 약간의 균열, 서리 결정 패턴"
    size: "512x512"
    ref: "obstacle-ice-1"

  - id: obstacle-ice-3
    desc: "얼음 3겹 — 거의 불투명한 두꺼운 얼음, 깊은 균열, 눈꽃 결정 장식"
    size: "512x512"
    ref: "obstacle-ice-1"

  - id: obstacle-chain
    desc: "체인 — 금속 자물쇠 체인, 2단계 내구도 표시(밝은 체인→어두운 녹슨 체인)"
    size: "512x512"

  - id: obstacle-wood
    desc: "나무 상자 — 나무 판자 + 못, 금이 간 텍스처, 따뜻한 갈색 톤"
    size: "512x512"

  - id: obstacle-poison
    desc: "독 — 보라/검정 독 버블, 연기 이펙트, 위협적인 해골 문양"
    size: "512x512"

  - id: obstacle-stone
    desc: "돌 블록 — 회색 화강암 텍스처, 이끼 장식, 파괴 불가능 느낌의 견고함"
    size: "512x512"

  - id: obstacle-curtain
    desc: "커튼 — 보라색 벨벳 커튼, 금 술 장식, 물음표 표시, 뒤가 보이지 않는 불투명"
    size: "512x512"

  - id: obstacle-jelly
    desc: "젤리 — 반투명 핑크 젤리 타일, 반짝임 하이라이트, 탄력있는 질감"
    size: "512x512"

  - id: obstacle-pie
    desc: "Pie 블로커 — 6등분 원형 파이, 각 조각이 독립적 색상(파스텔 톤), 조각 제거 시 빈 공간 표시, 골드 테두리"
    size: "512x512"

  # ─── 왕 캐릭터 ───
  - id: king-idle
    desc: "왕 기본 포즈 — 작은 황금 왕관, 파란 로브, 손을 모은 기본 자세, 따뜻한 미소, 풍성한 수염"
    size: "512x512"

  - id: king-happy
    desc: "왕 기쁨 포즈 — 양팔 들어올린 환호, 왕관 반짝임, 만세 자세, 눈이 반달 모양"
    size: "512x512"
    ref: "king-idle"

  - id: king-surprised
    desc: "왕 놀람 포즈 — 눈 크게 뜨고 입 벌림, 왕관 약간 기울어짐, 놀란 제스처"
    size: "512x512"
    ref: "king-idle"

  - id: king-scared
    desc: "왕 공포 포즈 — 떨리는 손, 식은땀, 왕관 삐뚤어짐, 두려운 표정"
    size: "512x512"
    ref: "king-idle"

  - id: king-trophy
    desc: "왕 트로피 포즈 — 한 손에 황금 트로피 컵, 다른 손으로 V포즈, King's Cup 우승 연출, 빛나는 배경"
    size: "512x512"
    ref: "king-idle"

  # ─── 배경 (5개 지역 × 2레이어 + 공통 근경) ───
  - id: bg-crystal-forest-far
    desc: "수정 숲 원경 — 보라+파랑 마법의 밤하늘, 별과 오로라, 먼 산맥 실루엣"
    size: "1920x1080"

  - id: bg-crystal-forest-mid
    desc: "수정 숲 중경 — 보라빛 수정 나무들, 반딧불이 빛점, 마법 입자 부유"
    size: "1920x1080"

  - id: bg-ruby-volcano-far
    desc: "루비 화산 원경 — 붉은 석양, 화산 실루엣, 용암 강줄기, 검붉은 하늘"
    size: "1920x1080"

  - id: bg-ruby-volcano-mid
    desc: "루비 화산 중경 — 용암 흐름, 화산암 기둥, 불꽃 파티클, 열기 아지랑이"
    size: "1920x1080"

  - id: bg-sapphire-coast-far
    desc: "사파이어 해안 원경 — 청록색 바다, 수평선, 솜사탕 구름, 밝은 하늘"
    size: "1920x1080"

  - id: bg-sapphire-coast-mid
    desc: "사파이어 해안 중경 — 산호초 아치, 열대어 실루엣, 파도 거품, 해변 야자수"
    size: "1920x1080"

  - id: bg-emerald-garden-far
    desc: "에메랄드 정원 원경 — 맑은 하늘, 무지개, 먼 성 실루엣, 새떼"
    size: "1920x1080"

  - id: bg-emerald-garden-mid
    desc: "에메랄드 정원 중경 — 만개한 꽃밭, 나비, 분수대, 토피어리(동물 모양 정원수)"
    size: "1920x1080"

  - id: bg-diamond-castle-far
    desc: "다이아몬드 성 원경 — 은색 달빛 하늘, 눈꽃 결정, 별자리, 오로라"
    size: "1920x1080"

  - id: bg-diamond-castle-mid
    desc: "다이아몬드 성 중경 — 크리스탈 성벽, 눈 덮인 탑, 빙하 아치, 다이아몬드 장식"
    size: "1920x1080"

  - id: bg-board-frame
    desc: "보드 프레임 근경 — 골드+보석 장식의 게임 보드 테두리, 로얄 문양, 모든 지역 공용"
    size: "1920x1080"

  # ─── 이벤트 UI ───
  - id: ui-kings-cup
    desc: "King's Cup 아이콘 — 황금 트로피 컵, 보석 장식, 왕관 로고, 로얄 리본"
    size: "256x256"

  - id: ui-daily-challenge
    desc: "데일리 챌린지 아이콘 — 달력 + 별 + 물음표, 매일 바뀌는 느낌, 골드 테두리"
    size: "256x256"

  - id: ui-team-battle
    desc: "팀 배틀 아이콘 — 방패 2개 교차 + 검, 팀 대전 느낌, 불꽃 이펙트"
    size: "256x256"

  - id: ui-super-booster
    desc: "Super Booster 아이콘 — 번개 + 별 + 무지개 오라, 파워업 느낌, 밝은 글로우"
    size: "256x256"

  - id: ui-leaderboard-frame
    desc: "리더보드 프레임 — 세로 스크롤 랭킹 판, 1/2/3위 금/은/동 장식, 로얄 테두리"
    size: "512x768"

  - id: ui-event-banner
    desc: "이벤트 배너 — 가로형 축제 리본, 'EVENT' 텍스트 공간, 보석 장식, 골드 테두리"
    size: "1024x256"

  - id: ui-goal-panel
    desc: "레벨 목표 패널 — 상단 고정형 투명 패널, 아이콘 슬롯 3개, 진행률 바, 턴 수 표시"
    size: "800x200"

  - id: ui-booster-slot
    desc: "부스터 슬롯 — 원형 버튼 프레임, 골드 테두리, 잔여 수량 배지, 비활성 시 회색조"
    size: "128x128"

  - id: ui-star-full
    desc: "채워진 별 — 황금색 5각 별, 글로우 이펙트, 레벨 클리어 등급용"
    size: "128x128"

  - id: ui-star-empty
    desc: "빈 별 — 회색 5각 별 윤곽선, 레벨 클리어 등급 미달성용"
    size: "128x128"

  - id: ui-turn-counter
    desc: "턴 카운터 — 원형 프레임 안에 숫자 공간, 5턴 이하 시 빨간색 경고 변환용"
    size: "128x128"

  - id: ui-hp-bar
    desc: "점수 진행률 바 — 가로형 게이지, 별 마커 3개 (1/2/3성 달성 위치), 골드 테두리"
    size: "512x64"

  # ─── 이펙트 ───
  - id: effect-match-burst
    desc: "매칭 폭발 이펙트 시퀀스 — 4프레임, 보석 파편이 퍼지며 빛나는 폭발"
    size: "512x128"
    frames: 4

  - id: effect-line-laser
    desc: "줄 파괴 레이저 이펙트 — 가로 방향 에너지 빔, 빛줄기 + 파티클"
    size: "1024x128"

  - id: effect-bomb-shockwave
    desc: "폭탄 충격파 이펙트 시퀀스 — 4프레임, 중앙에서 퍼지는 원형 충격파"
    size: "512x128"
    frames: 4

  - id: effect-rainbow-wave
    desc: "무지개 전체 파괴 이펙트 — 화면 전체에 무지개빛 파동, 6색 빛줄기 방사"
    size: "1024x512"

  - id: effect-cascade-combo
    desc: "콤보 텍스트 팝업 — 'COMBO x2', 'x3', 'x4+' 텍스트 + 폭죽 이펙트"
    size: "256x256"

  - id: effect-level-clear
    desc: "레벨 클리어 축하 이펙트 — 대형 별 폭발 + 'CLEAR!' 텍스트 + 색종이 파티클"
    size: "1024x512"

  - id: effect-pie-crack
    desc: "Pie 조각 제거 이펙트 — 파이 한 조각이 깨지며 빛 파편 흩어짐"
    size: "256x256"

  - id: effect-special-create
    desc: "스페셜 보석 생성 연출 — 빛 기둥 + 회전 오라 + 플래시, 스페셜 보석 탄생 순간"
    size: "512x512"

  # ─── 파티클 텍스처 ───
  - id: particle-sparkle
    desc: "반짝임 파티클 — 작은 빛 점, 알파 그라데이션, 보석 반짝임용"
    size: "64x64"

  - id: particle-star
    desc: "별 파티클 — 4각 별 형태, 글로우, 레벨 클리어/이벤트 보상용"
    size: "64x64"

  - id: particle-confetti
    desc: "색종이 파티클 — 작은 직사각형, 6색 변형, 축하 연출용"
    size: "64x64"

  - id: particle-fire
    desc: "불꽃 파티클 — 주황+빨강 그라디언트, 알파 감소, 화산 배경/이펙트용"
    size: "64x64"

  - id: particle-bubble
    desc: "물방울 파티클 — 투명 청록색 원, 하이라이트 반사, 해안 배경용"
    size: "64x64"

  # ─── 레벨 맵 ───
  - id: map-path-node
    desc: "맵 경로 노드 — 원형 돌 발판, 레벨 번호 공간, 클리어 시 별 장식 추가"
    size: "128x128"

  - id: map-region-banner
    desc: "지역 이름 배너 — 리본형 현수막, 지역명 텍스트 공간, 지역 색상 변형용"
    size: "512x128"

  - id: map-lock
    desc: "잠금 아이콘 — 금색 자물쇠, 미해금 레벨에 오버레이"
    size: "128x128"

  # ─── 미니게임 아이콘 ───
  - id: mini-water-icon
    desc: "물 탈출 미니게임 아이콘 — 물방울 + 사다리 + 왕 실루엣"
    size: "256x256"

  - id: mini-fire-icon
    desc: "불 회피 미니게임 아이콘 — 불꽃 + 방패 + 왕 실루엣"
    size: "256x256"

  - id: mini-maze-icon
    desc: "미로 탈출 미니게임 아이콘 — 미로 패턴 + 열쇠 + 왕 실루엣"
    size: "256x256"

  - id: mini-dragon-icon
    desc: "드래곤 보스 미니게임 아이콘 — 드래곤 머리 + 검 + 왕 실루엣"
    size: "256x256"

  # ─── 썸네일 ───
  - id: thumbnail
    desc: "게임 대표 이미지 — 중앙에 King's Cup 트로피를 든 왕 캐릭터, 주위로 6색 보석이 폭발처럼 방사, 상단에 'GEM ROYAL CHALLENGE' 금색 텍스트, 하단에 리더보드 UI 힌트, 배경은 다이아몬드 성 + 보석 비"
    size: "800x600"
```

---

## §9. 이벤트 시스템 상세

### §9.1 King's Cup 리더보드
- **참가**: 레벨 5 이상 해금
- **구간**: 5레벨 단위로 Cup 진행 (레벨 1~5 = Cup 1, 레벨 6~10 = Cup 2, ...)
- **경쟁자**: AI 가상 플레이어 5명 (SeededRNG 기반 점수 생성, 플레이어 실력에 DDA 적용)
- **순위**: 1~6위, 상위 3위 보상
- **보상**: 1위 — 부스터 3개 + 추가 턴 3개 / 2위 — 부스터 2개 / 3위 — 부스터 1개
- **UI**: 화면 좌측 슬라이드인 리더보드 패널, 점수 변동 시 실시간 순위 업데이트 애니메이션
- **AI 플레이어 점수 생성**:
  ```
  aiScore = baseDifficulty[cup] × (0.7 + SeededRNG.next() × 0.6)
  // DDA: 플레이어가 높은 점수면 AI도 높아짐 (경쟁감 유지)
  aiAdjustedScore = aiScore × (1 + playerAvgScore / baseTarget × 0.3)
  ```

### §9.2 데일리 챌린지
- **시드**: `SeededRNG(YYYYMMDD)` — 모든 플레이어 동일 보드
- **특수 규칙 풀 (8종, 매일 1~2종 랜덤 적용)**:
  1. 제한 턴 (10~15턴)
  2. 특정 색상만 점수 인정 (2~3색)
  3. 폭탄 보석만 사용 가능 (줄 파괴/무지개 비활성)
  4. 장애물 지옥 (얼음 3겹 + 체인 + Pie 동시)
  5. 역전 중력 (보석이 위로 떨어짐)
  6. 시간 제한 (60초)
  7. 콤보 필수 (3콤보 미만 시 턴 차감)
  8. 거대 보드 (10×10)
- **보상**: 클리어 시 색상 폭탄 1개 + King's Cup 보너스 점수
- **DDA 비적용**: 공정성 보장을 위해 데일리 챌린지에서는 DDA 꺼짐

### §9.3 Super Booster 이벤트
- **조건**: 3레벨 연속 클리어
- **보상 시퀀스**: 3연승 → 셔플 1개 / 5연승 → 망치 1개 / 7연승 → 추가 턴 1개 / 10연승 → 색상 폭탄 1개
- **리셋**: 클리어 실패 시 연승 카운터 리셋
- **UI**: SUPER_BOOSTER 상태에서 화려한 부스터 선택 연출 (보석 비 + 왕 환호 포즈)

### §9.4 팀 배틀 시뮬레이션
- **구성**: 나의 팀 (나 + AI 2명) vs AI 팀 3개 (각 3명)
- **진행**: 5레벨 플레이 → 팀 총 점수 합산 → 순위 결정
- **AI 팀원**: 플레이어 실력의 0.7~1.1배 점수 생성 (DDA 적용)
- **보상**: 팀 1위 시 전 팀원 부스터 2개 + King's Cup 보너스
- **UI**: 화면 상단에 4팀 점수 진행률 바 (실시간 갱신 연출)

---

## §10. 미니게임 독립 플레이 모드

### §10.1 미니게임 허브 (MINI_HUB 상태)
- 메인 타이틀 메뉴에서 "미니게임" 버튼으로 진입
- 4종 미니게임 아이콘 그리드 표시
- 해금 조건: 메인 스토리에서 해당 미니게임 최초 클리어 시 해금
- 각 미니게임별 타임 어택 최고 기록 표시

### §10.2 타임 어택 리더보드
- 각 미니게임별 독립 localStorage 리더보드
- 최고 기록 5개 저장 (시간, 점수, 날짜)
- 기록 갱신 시 "NEW RECORD!" 축하 연출 + 왕 기쁨 포즈

---

## §11. Web Audio 사운드 디자인

### §11.1 BGM (5곡 + 이벤트 1곡)
| 장면 | 스타일 | 스케일 |
|------|--------|--------|
| 타이틀/맵 | 밝은 오케스트라 판타지 | C major |
| 수정 숲 | 몽환적 하프+벨 | F# minor |
| 루비 화산 | 긴장감 있는 스트링+드럼 | D minor |
| 사파이어 해안 | 경쾌한 우쿨렐레+파도 | G major |
| 에메랄드 정원 | 따뜻한 피아노+플루트 | Bb major |
| 다이아몬드 성/이벤트 | 장엄한 브라스+합창 | Eb major |

### §11.2 SFX (18종+)
| SFX | 설명 |
|-----|------|
| gem-swap | 보석 스왑 (짧은 슬라이드음) |
| match-3 | 3매치 (밝은 종소리) |
| match-4 | 4매치 (2음 차임) |
| match-5 | 5매치 (3음 화음 상승) |
| match-tl | T/L매치 (임팩트 + 차임) |
| cascade | 캐스케이드 (연속 방울음) |
| special-create | 스페셜 보석 생성 (마법 에너지 차징음) |
| special-combo | 스페셜 조합 (대형 폭발음) |
| obstacle-break | 장애물 파괴 (유리 깨짐/체인 끊김) |
| pie-crack | Pie 조각 제거 (세라믹 균열음) |
| poison-spread | 독 퍼짐 (위협적 버블음) |
| booster-use | 부스터 사용 (파워업음) |
| level-clear | 레벨 클리어 (팡파레 3초) |
| level-fail | 레벨 실패 (하강 멜로디) |
| event-start | 이벤트 시작 (트럼펫 팡파레) |
| leaderboard-up | 리더보드 순위 상승 (승리 차임) |
| combo-text | 콤보 텍스트 팝업 (기운찬 효과음) |
| ui-click | UI 버튼 클릭 (부드러운 클릭) |

---

## §12. 게임 페이지 메타데이터

```yaml
game:
  id: "gem-royal-challenge"
  title: "젬 로얄 챌린지"
  description: "King's Cup 리더보드, 데일리 챌린지, 팀 배틀로 매일 새로운 경쟁! 보석 왕국 5개 지역을 정복하는 프리미엄 매치3 퍼즐."
  genre: ["puzzle"]
  playCount: 0
  rating: 0
  controls:
    - "마우스 드래그: 보석 스왑"
    - "1~4: 부스터 선택"
    - "Tab: 이벤트 패널"
    - "ESC: 일시정지"
    - "터치: 스와이프로 보석 교환"
  tags:
    - "#매치3"
    - "#퍼즐"
    - "#리더보드"
    - "#데일리챌린지"
    - "#로얄매치"
    - "#이벤트"
    - "#팀배틀"
  addedAt: "2026-03-28"
  version: "1.0.0"
  featured: true
```

---

## §13. 에셋-코드 교차 검증 체크리스트

- [ ] 모든 에셋(65개)이 manifest.json에 등록되어 있는가
- [ ] manifest의 모든 에셋이 코드에서 실제 참조되는가
- [ ] Canvas 폴백이 모든 에셋에 구현되어 있는가 (drawAssetOrFallback 패턴)
- [ ] 이벤트 UI 에셋 (배너, 리더보드, 데일리 아이콘) 코드 참조 확인
- [ ] 스프라이트 시트 6종 frames 수와 코드 애니메이션 frameCount 일치 여부
- [ ] 배경 5개 지역 전환 코드에서 정확한 에셋 ID 참조 여부
- [ ] 왕 캐릭터 5포즈 전환 코드 존재 여부
- [ ] 파티클 5종 텍스처 코드에서 활용 여부
- [ ] Pie 블로커 에셋 + 파괴 이펙트 코드 연동 여부
- [ ] 미니게임 아이콘 4종 MINI_HUB 상태에서 참조 여부
- [ ] validateAssets() 함수에서 manifest 전수 검증 여부

---

## §14. 엣지 케이스 매트릭스 (20개 시나리오)

| # | 시나리오 | 예상 동작 | 가드 |
|---|---------|----------|------|
| 1 | 망치로 Pie 블로커 사용 | 1조각만 제거 (전체 파괴 X) | boosterActive |
| 2 | 색상 폭탄으로 독 칸 타겟 | 독 제거 + 해당 색상 전체 제거 | colorBombResolving |
| 3 | 무지개+무지개 조합 중 독 퍼짐 | 독 퍼짐 대기 → 전체 파괴 후 독 셀 제거 | resolving |
| 4 | 캐스케이드 중 Pie 인접 매칭 | Pie 조각 1개 제거 per 인접 매칭 | pieResolving |
| 5 | 셔플 시 스페셜 보석 위치 | 스페셜 보석은 셔플 대상 제외 | boardShuffling |
| 6 | 얼음 3겹 + 체인 동시 적용 셀 | 체인 먼저 해제 → 얼음 겹 감소 순서 | resolving |
| 7 | 데일리 챌린지 중 DDA 적용 | 데일리 챌린지는 DDA 비적용 (공정성) | eventTransition |
| 8 | King's Cup 진행 중 부스터 사용 | 정상 사용 가능, 점수에 반영 | boosterActive |
| 9 | 팀 배틀 중 미니게임 트리거 | 팀 배틀에서는 미니게임 비발동 | miniGameActive |
| 10 | 유효 이동 0개 시 자동 셔플 | 셔플 → 재검증 → 여전히 0개면 재셔플 (최대 3회) | boardShuffling |
| 11 | 커튼 뒤 스페셜 보석 | 커튼 개방 시 스페셜 보석 즉시 발동하지 않음 (다음 매칭에서 발동) | resolving |
| 12 | Pie 블로커 6조각 중 5조각 제거 후 셔플 | Pie 상태 유지 (1조각 남음) | boardShuffling |
| 13 | 추가 턴 부스터 사용 시 잔여턴 표시 | +5턴 즉시 반영, 턴 카운터 갱신 애니메이션 | - |
| 14 | Super Booster 보상 중 ESC (일시정지) | 보상 UI 유지, 일시정지 불가 (상태 충돌 방지) | eventTransition |
| 15 | 폭탄+폭탄 조합 범위에 Pie | 5×5 범위 내 Pie 조각 전부 1개씩 제거 | pieResolving |
| 16 | enterState(GOAL_CHECK) 내에서 RESULT 전환 시도 | deferredQueue에 RESULT 큐잉, coreUpdate에서 처리 | GUARDS.deferredQueue |
| 17 | 역전 중력 데일리에서 스페셜 생성 | 보석 상승 방향 기준으로 스페셜 보석 위치 결정 | resolving |
| 18 | 거대 보드(10×10) 데일리에서 터치 타겟 | 셀 크기 자동 축소, 최소 44px 유지, 스크롤 불필요하도록 캔버스 스케일 | - |
| 19 | AI 팀원 점수가 플레이어보다 높은 경우 | 정상 허용, 팀 합산으로 경쟁 (AI 캐리 가능) | - |
| 20 | localStorage 용량 초과 시 리더보드 저장 | try-catch + 가장 오래된 기록 삭제 후 재시도 | - |

---

## §15. 색맹 모드 (C48 계승 + 확장)

- **F5 토글**: 활성화 시 보석 위에 고유 형태 마커 오버레이
  - 루비 = ◆ (다이아몬드), 사파이어 = ● (원), 에메랄드 = ⬡ (육각)
  - 토파즈 = ♥ (하트), 아메시스트 = ▲ (삼각), 다이아몬드 = ★ (별)
- **하이콘트라스트 배경**: 보드 그리드 배경을 짙은 네이비로 변경
- **Pie 블로커 색맹 대응**: 각 조각에 숫자 (1~6) 표시
- **이벤트 UI 색맹 대응**: 팀 배틀 팀 구분 시 색상+패턴(줄무늬/점/격자/빈칸) 동시 사용

---

## §16. 다국어 지원

- **기본**: 한국어 (ko)
- **추가**: 영어 (en)
- **구현**: `LANG` 객체에 ko/en 키-값 쌍. CONFIG.lang으로 전환
- **이벤트 텍스트**: "King's Cup", "Daily Challenge" 등 이벤트 명칭은 영어 유지 (브랜드명 성격)
- **UI 텍스트**: 버튼, 설명, 힌트 등은 다국어 적용
