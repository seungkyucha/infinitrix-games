---
game-id: gem-kingdom-legends
title: 보석 왕국 전설
genre: puzzle
difficulty: medium
---

# 보석 왕국 전설 (Gem Kingdom Legends) — 사이클 #52 기획서

---

## §0. 이전 사이클 피드백 매핑 (C51 → C52 개선)

| # | C51 아쉬웠던 점 | C52 해결 섹션 | 기술적 해결책 |
|---|----------------|-------------|-------------|
| F1 | ACTIVE_SYSTEMS 매트릭스 수기 실수 → SETTINGS.tween=false CRITICAL | §5.2, §12 | `validateActiveSystems()` 자동 검증 함수: 모든 상태의 tween/particles/sound 플래그를 순회하며 `false`인데 해당 상태에서 tween이 필요한 경우 콘솔 경고 + 기본값 `true`로 폴백 |
| F2 | 4,948줄 단일 파일 한계 | §5.1 | 섹션 인덱스 40줄 이내 + 함수당 최대 60줄 제한 + 공용 유틸 함수 파일 상단 집중 배치 |
| F3 | Phase 2 미구현 (주간 토너먼트, 다국어) | §0.5 | Phase 1/2 엄격 분리. Phase 1만으로 완전한 게임. 길드 레이드는 Phase 1에 심플 버전만 |
| F4 | AI 깊이 검증 부족 | §6.3 | AI 4단계 행동 모델(탐욕/전략/방어/적응) + 리그별 가중치 테이블 CONFIG에 수치 명시 |

---

## §0.5. Phase 구분 (MVP 범위 관리)

### Phase 1 (필수 — 이것만으로 완성 게임)
- 8×8 매치3 코어 엔진 (6색 보석 + 스페셜 4종 + 장애물 6종)
- 솔로 어드벤처 36레벨 (6구역 × 6레벨)
- 왕국 건설 메타 (별 수집 → 건물 건설/업그레이드)
- 시즌 패스 (무료 트랙 30단계 + 프리미엄 트랙 시뮬레이션)
- 길드 레이드 심플 버전 (AI 길드원 3명과 협동 보스전 1종)
- 부스터 4종 (망치/교환/셔플/추가턴)
- DDA 3단계 (연속 실패 시 자동 난이도 조절)
- 일일 챌린지 (SeededRNG 날짜 시드)
- AI 4단계 행동 모델
- Web Audio BGM + 효과음 8종+
- ACTIVE_SYSTEMS 자동 검증

### Phase 2 (보너스 — 시간 여유 시)
- 주간 PvP 토너먼트 (C51 PvP 엔진 활용)
- 시즌 리셋 + 시즌 보상 스킨
- 다국어 지원 (ko/en)
- 길드 레이드 확장 (보스 5종, 난이도 3단계)
- 왕국 건설 축하 연출 강화

---

## §1. 게임 개요 및 핵심 재미 요소

**보석 왕국 전설**은 Royal Match와 Gardenscapes의 성공 공식을 결합한 프리미엄 매치3 퍼즐 게임이다. 플레이어는 몰락한 보석 왕국의 젊은 왕으로서, 8×8 보석 보드에서 매치3 퍼즐을 풀어 별을 획득하고, 그 별로 왕국을 재건하는 여정을 떠난다.

### 핵심 재미 3축
1. **전략적 매치3**: 5→T/L→4→3 우선순위 매칭, 스페셜 보석 조합, 장애물 공략의 깊은 전략
2. **왕국 건설 메타**: 레벨 클리어로 얻은 별로 건물을 짓고 왕국을 꾸미는 장기 진행의 보람
3. **시즌 패스 + 길드**: 시즌 미션 달성 → 보상 트랙 진행 + 길드원과 협동 보스 레이드의 사회적 동기

### 감정 곡선
```
레벨 시작(기대) → 전략 탐색(몰입) → 콤보 연쇄(흥분) → 목표 달성(성취)
    → 별 획득(보상) → 왕국 건설(만족) → 다음 레벨(기대)
```

---

## §2. 게임 규칙 및 목표

### §2.1 기본 규칙
- **보드**: 8×8 그리드, 6색 보석 (빨강/파랑/초록/노랑/보라/주황)
- **매칭**: 인접한 보석 2개를 스왑하여 같은 색 3개 이상 일렬로 배치
- **턴 제한**: 각 레벨마다 정해진 턴 수 내에 목표 달성
- **중력**: 매칭 후 빈 칸은 위에서 새 보석이 떨어져 채워짐 (캐스케이드)

### §2.2 레벨 목표 유형 (6종)
| 목표 | 설명 | 등장 구역 |
|------|------|----------|
| 점수 달성 | 목표 점수 이상 획득 | 구역 1~6 |
| 특정 보석 수집 | 지정 색상 N개 매칭 | 구역 1~6 |
| 장애물 제거 | 얼음/돌/체인 등 파괴 | 구역 2~6 |
| 보석 하강 | 특수 보석을 보드 최하단으로 이동 | 구역 3~6 |
| 보스 약점 타격 | 보스 체력 0으로 만들기 (레이드) | 길드 레이드 |
| 시간 제한 | 제한 시간 내 점수 달성 (시즌 미션) | 시즌 패스 |

### §2.3 매치 검출 우선순위 (⚠️ 핵심)
```
1순위: 5매치 (직선 5개) → 레인보우 보석 생성
2순위: T/L매치 (T자 또는 L자 5개) → 폭탄 보석 생성
3순위: 4매치 (직선 4개) → 줄 파괴 보석 생성 (가로/세로)
4순위: 3매치 (직선 3개) → 일반 매칭, 스페셜 없음
```

⚠️ **consumed[][] 소비 추적 필수**: 상위 매치에서 사용된 셀은 하위 매치에서 재사용 불가. 매 프레임 findMatches() 호출 시 consumed 배열 초기화 → 5매치 먼저 마킹 → T/L → 4 → 3 순서로 검출.

### §2.4 스페셜 보석 4종
| 스페셜 | 생성 조건 | 효과 |
|--------|----------|------|
| 줄 파괴(H) | 가로 4매치 | 활성화 시 가로 1줄 전체 제거 |
| 줄 파괴(V) | 세로 4매치 | 활성화 시 세로 1줄 전체 제거 |
| 폭탄 | T/L 5매치 | 활성화 시 3×3 범위 제거 |
| 레인보우 | 직선 5매치 | 활성화 시 스왑한 색상 전체 제거 |

### §2.5 스페셜 보석 조합 효과 (2개 스왑)
| 조합 | 효과 |
|------|------|
| 줄 + 줄 | 십자(+) 형태 2줄 동시 제거 |
| 줄 + 폭탄 | 3줄(가로 또는 세로) 제거 |
| 폭탄 + 폭탄 | 5×5 범위 제거 |
| 레인보우 + 줄 | 1색 전체를 줄 파괴로 변환 후 일괄 발동 |
| 레인보우 + 폭탄 | 1색 전체를 폭탄으로 변환 후 일괄 발동 |
| 레인보우 + 레인보우 | 보드 전체 제거 (궁극기) |

### §2.6 장애물 6종
| 장애물 | HP | 제거 방법 | 등장 |
|--------|-----|----------|------|
| 얼음 (Ice) | 1 | 인접 매칭 1회 | 구역 1+ |
| 돌블록 (Stone) | 2 | 인접 매칭 2회 | 구역 2+ |
| 체인 (Chain) | 1 | 체인 걸린 보석 매칭 | 구역 2+ |
| 독 (Poison) | 확산 | 매턴 인접 1칸 확산, 인접 매칭으로 제거 | 구역 3+ |
| 잠금 (Lock) | 1 | 잠긴 보석 매칭 (이동 불가) | 구역 4+ |
| 저주 (Curse) | 3 | 인접 매칭 3회 (최고 난이도) | 구역 5+ |

---

## §3. 조작 방법

### 키보드
| 키 | 동작 |
|----|------|
| 마우스 클릭+드래그 | 보석 스왑 (클릭 후 인접 방향으로 드래그) |
| ESC | 일시정지 / 설정 메뉴 |
| R | 레벨 재시작 (확인 모달) |
| 1~4 | 부스터 1~4 선택 |
| Space | 힌트 표시 |

### 마우스
- **클릭+드래그**: 보석 선택 후 인접 방향으로 드래그하여 스왑
- **클릭**: UI 버튼 (부스터, 메뉴, 왕국 건물)
- **마우스 휠**: 왕국 맵 줌 인/아웃

### 터치 (모바일)
- **스와이프**: 보석 선택 후 인접 방향으로 스와이프하여 스왑
- **탭**: UI 버튼, 왕국 건물 선택
- **핀치 줌**: 왕국 맵 줌 인/아웃
- ⚠️ 모든 터치 타겟 최소 48×48px 강제: `Math.max(48, size)`

---

## §4. 시각적 스타일 가이드

### 색상 팔레트
| 용도 | 색상 | HEX |
|------|------|-----|
| 배경 (하늘) | 밝은 하늘색 | #87CEEB |
| 배경 (풀밭) | 에메랄드 그린 | #2ECC71 |
| UI 프레임 | 로열 골드 | #FFD700 |
| UI 배경 | 딥 로열 블루 | #1A237E |
| 텍스트 | 크림 화이트 | #FFF8E1 |
| 강조 | 루비 레드 | #E53935 |
| 보조 강조 | 사파이어 블루 | #1E88E5 |

### 보석 6색
| 색상 | HEX | 형태 |
|------|-----|------|
| 빨강 (루비) | #E53935 | 다이아몬드 컷 하트형 |
| 파랑 (사파이어) | #1E88E5 | 타원 커팅 |
| 초록 (에메랄드) | #43A047 | 에메랄드 컷 사각형 |
| 노랑 (토파즈) | #FDD835 | 별 모양 |
| 보라 (자수정) | #8E24AA | 둥근 브릴리언트 컷 |
| 주황 (호박) | #FB8C00 | 드롭(물방울) 형태 |

### 배경 스타일
- 판타지 동화 왕국 — 따뜻한 톤, 부드러운 그라데이션
- 각 구역별 테마: 성문(석재) → 정원(꽃) → 시장(활기) → 도서관(신비) → 대성당(장엄) → 왕좌실(황금)
- 패럴랙스 배경 3레이어: 원경(하늘+구름) / 중경(건물 실루엣) / 근경(게임 보드 프레임)

---

## §4.5. 아트 디렉션 (Art Direction)

### 아트 스타일 키워드
**"Glossy Fantasy Gem — 밝고 화려한 3D 느낌의 2D 보석 + 따뜻한 판타지 동화 배경"**

### 세부 정의
- **보석**: 글로시(glossy) 반사 + 내부 빛 산란 + 부드러운 그라데이션. 각 보석은 고유한 형태와 컷을 가짐
- **배경**: 수채화 터치의 판타지 동화풍. 부드러운 빛 번짐, 따뜻한 색온도
- **UI**: 골드 프레임 + 약간의 3D 돌출 효과 + 반투명 글래스 패널
- **이펙트**: 밝은 파티클 + 빛줄기 + 글로우. 매칭 시 보석 색상의 광채 폭발
- **캐릭터**: 디포르메(SD) 스타일의 귀여운 왕/왕비/기사 — 큰 눈, 부드러운 윤곽선

### 레퍼런스
1. **Royal Match** — 보석 광택/글로시 느낌, UI 골드 프레임, 왕국 건설 비주얼
2. **Gardenscapes** — 따뜻한 동화풍 배경, 캐릭터 SD 비율, 건설 진행 연출

---

## §5. 핵심 게임 루프 (프레임 기준 로직 흐름)

### §5.1 메인 루프 구조
```
requestAnimationFrame(mainLoop)
├── deltaTime 계산 (cap 33ms)
├── coreUpdate(dt)
│   ├── tweenManager.update(dt)
│   ├── particleManager.update(dt)
│   ├── stateHandlers[currentState].update(dt)
│   └── soundManager.update(dt)
├── coreRender()
│   ├── clearCanvas()
│   ├── drawBackground()
│   ├── stateHandlers[currentState].render()
│   ├── drawUI()
│   ├── particleManager.render()
│   └── inputManager.flush()  ← render 마지막
└── requestAnimationFrame(mainLoop)
```

⚠️ **coreUpdate()** / **coreRender()** 단일 진입점 원칙. 각 상태는 stateHandlers 맵에 등록. 함수 오버라이드 0건.

### §5.2 상태 머신 (13상태)

```
STATE = {
  BOOT:           0,   // 에셋 로딩
  TITLE:          1,   // 타이틀 화면
  MODE_SELECT:    2,   // 모드 선택 (어드벤처/길드/시즌)
  KINGDOM:        3,   // 왕국 건설 맵
  LEVEL_SELECT:   4,   // 구역 레벨 선택
  PLAY:           5,   // 매치3 플레이
  CASCADE:        6,   // 캐스케이드 진행 중 (입력 차단)
  LEVEL_CLEAR:    7,   // 레벨 클리어 연출
  LEVEL_FAIL:     8,   // 레벨 실패
  GUILD_RAID:     9,   // 길드 레이드 보스전
  SEASON_PASS:   10,   // 시즌 패스 화면
  SETTINGS:      11,   // 설정
  PAUSE:         12,   // 일시정지
}
```

### §5.2.1 ACTIVE_SYSTEMS 매트릭스 (⚠️ F1 해결)

| 상태 | tween | particles | sound | input | grid |
|------|-------|-----------|-------|-------|------|
| BOOT | true | false | false | false | false |
| TITLE | true | true | true | true | false |
| MODE_SELECT | true | true | true | true | false |
| KINGDOM | true | true | true | true | false |
| LEVEL_SELECT | true | true | true | true | false |
| PLAY | true | true | true | true | true |
| CASCADE | true | true | true | false | true |
| LEVEL_CLEAR | true | true | true | true | false |
| LEVEL_FAIL | true | true | true | true | false |
| GUILD_RAID | true | true | true | true | true |
| SEASON_PASS | true | true | true | true | false |
| SETTINGS | true | true | true | true | false |
| PAUSE | true | true | true | true | false |

⚠️ **자동 검증 함수** (F1 CRITICAL 재발 방지):
```javascript
function validateActiveSystems() {
  for (const [stateName, config] of Object.entries(ACTIVE_SYSTEMS)) {
    // tween은 모든 상태에서 true 필수 (UI 애니메이션 때문)
    if (config.tween === false) {
      console.warn(`[ACTIVE_SYSTEMS] ${stateName}.tween=false 감지! true로 교정`);
      config.tween = true;
    }
    // sound는 BOOT 외 모든 상태에서 true
    if (stateName !== 'BOOT' && config.sound === false) {
      console.warn(`[ACTIVE_SYSTEMS] ${stateName}.sound=false 감지! true로 교정`);
      config.sound = true;
    }
  }
}
// enterState() 첫 줄에서 호출
```

### §5.2.2 상태 전환 다이어그램

```
BOOT ──→ TITLE ──→ MODE_SELECT ──┬→ KINGDOM ──→ LEVEL_SELECT ──→ PLAY
                                  ├→ GUILD_RAID                    │
                                  └→ SEASON_PASS                   │
                                                                   ↓
                                                              CASCADE
                                                                   │
                                                    ┌──────────────┤
                                                    ↓              ↓
                                              LEVEL_CLEAR    LEVEL_FAIL
                                                    │              │
                                                    ↓              ↓
                                               KINGDOM ←──── PLAY(재시작)

PLAY/KINGDOM/… ──→ SETTINGS ──→ (이전 상태로 복귀)
PLAY ──→ PAUSE ──→ PLAY
```

### §5.2.3 TRANSITION_TABLE 화이트리스트
```javascript
const TRANSITION_TABLE = {
  BOOT:         ['TITLE'],
  TITLE:        ['MODE_SELECT'],
  MODE_SELECT:  ['KINGDOM', 'GUILD_RAID', 'SEASON_PASS', 'TITLE'],
  KINGDOM:      ['LEVEL_SELECT', 'MODE_SELECT', 'SETTINGS'],
  LEVEL_SELECT: ['PLAY', 'KINGDOM'],
  PLAY:         ['CASCADE', 'LEVEL_CLEAR', 'LEVEL_FAIL', 'PAUSE', 'SETTINGS'],
  CASCADE:      ['PLAY', 'LEVEL_CLEAR', 'LEVEL_FAIL'],
  LEVEL_CLEAR:  ['KINGDOM', 'LEVEL_SELECT', 'PLAY'],
  LEVEL_FAIL:   ['PLAY', 'LEVEL_SELECT', 'KINGDOM'],
  GUILD_RAID:   ['CASCADE', 'LEVEL_CLEAR', 'LEVEL_FAIL', 'MODE_SELECT', 'PAUSE'],
  SEASON_PASS:  ['MODE_SELECT'],
  SETTINGS:     ['TITLE', 'MODE_SELECT', 'KINGDOM', 'LEVEL_SELECT', 'PLAY', 'GUILD_RAID', 'PAUSE'],
  PAUSE:        ['PLAY', 'GUILD_RAID', 'LEVEL_SELECT'],
};
```

### §5.3 매치3 플레이 프레임 루프 (PLAY 상태)
```
PLAY.update(dt):
  1. 힌트 타이머 갱신 (3초 무입력 시 힌트 표시)
  2. 독(Poison) 확산 체크 (매턴 종료 시)
  3. 유효 이동 존재 여부 체크 → 없으면 데드록 셔플
  4. 부스터 활성화 처리
  5. 턴 카운터 / 레벨 목표 진행도 갱신

CASCADE.update(dt):
  1. 낙하 tween 완료 대기
  2. findMatches() 호출 (consumed[][] 소비 추적)
  3. 매치 있으면 → 보석 제거 + 스페셜 생성 + 점수 가산 + 파티클 생성
  4. 빈칸 채우기 tween 시작
  5. 매치 없으면 → PLAY 복귀 (또는 목표 달성 시 LEVEL_CLEAR)
```

---

## §6. 난이도 시스템

### §6.1 구역별 난이도 진행
| 구역 | 테마 | 레벨 | 턴 수 | 장애물 | 새 요소 |
|------|------|------|-------|--------|---------|
| 1. 성문 | 석재/깃발 | 1~6 | 25~30 | 얼음 | 기본 매칭 학습 |
| 2. 정원 | 꽃/분수 | 7~12 | 22~28 | +돌/체인 | 스페셜 보석 조합 |
| 3. 시장 | 상점/마차 | 13~18 | 20~25 | +독 | 독 확산 대응 전략 |
| 4. 도서관 | 마법서/촛불 | 19~24 | 18~23 | +잠금 | 보석 하강 목표 |
| 5. 대성당 | 스테인드글라스 | 25~30 | 16~22 | +저주 | 복합 장애물 조합 |
| 6. 왕좌실 | 황금/보석 | 31~36 | 14~20 | 전종 | 극한 전략 요구 |

### §6.2 DDA (Dynamic Difficulty Adjustment) — 3단계
```javascript
const DDA_CONFIG = {
  // failStreak: 같은 레벨 연속 실패 횟수
  EASY:   { failStreak: 3, turnBonus: +3, spawnSpecialChance: 0.15 },
  NORMAL: { failStreak: 0, turnBonus: 0,  spawnSpecialChance: 0.05 },
  HARD:   { failStreak: -3, turnBonus: -2, spawnSpecialChance: 0.02 },
  // 연속 3회 실패 → EASY: 턴 +3, 스페셜 출현 15%
  // 연속 3회 클리어 → HARD: 턴 -2, 스페셜 출현 2%
};
```

### §6.3 AI 행동 모델 (길드 레이드 보스 / 향후 PvP 확장용) — 4단계

| 레벨 | 이름 | 행동 | 가중치 (매치 선택) |
|------|------|------|-------------------|
| 1 | 탐욕(Greedy) | 가장 큰 매치 우선 | score: 0.9, special: 0.1 |
| 2 | 전략(Strategic) | 스페셜 보석 생성 우선 | score: 0.3, special: 0.6, combo: 0.1 |
| 3 | 방어(Defensive) | 장애물 제거 + 상대 스페셜 방해 | obstacle: 0.5, deny: 0.3, score: 0.2 |
| 4 | 적응(Adaptive) | 플레이어 패턴 분석 + 최적 대응 | 동적 가중치 조절 (3턴 이동평균) |

길드 레이드 보스 AI는 레벨 3~4 사이에서 동작하며, 보스 체력에 따라 공격적/방어적 모드를 전환한다.

---

## §7. 점수 시스템

### 기본 점수
| 매치 유형 | 기본 점수 | 콤보 배율 |
|----------|----------|----------|
| 3매치 | 50 | ×1.0 |
| 4매치 | 120 | ×1.2 |
| T/L매치 | 200 | ×1.5 |
| 5매치 | 350 | ×2.0 |
| 스페셜 발동 | +150 | ×1.3 |
| 스페셜 조합 | +500 | ×2.0 |

### 콤보 시스템
```
콤보 배율 = 1.0 + (cascadeCount - 1) × 0.25
최대 콤보 배율: ×3.0 (9+ 캐스케이드)
```

### 별 획득 (레벨 클리어 시)
| 조건 | 별 |
|------|-----|
| 목표 달성 | ★ (1별) |
| 점수 50% 이상 | ★★ (2별) |
| 점수 80% 이상 | ★★★ (3별) |

### 시즌 패스 경험치
- 레벨 클리어: +10 XP
- 3별 클리어: +25 XP
- 일일 챌린지 완료: +50 XP
- 길드 레이드 참여: +30 XP
- 각 단계 필요 XP: 100 (고정)

---

## §8. 에셋 요구 사항 (Asset Requirements)

이 섹션은 디자이너(아트 디렉터)에게 전달되는 에셋 제작 지시서입니다.

```yaml
# asset-requirements
art-style: "Glossy Fantasy Gem — 밝고 화려한 3D 느낌의 2D 보석 + 따뜻한 판타지 동화 배경"
color-palette: "#E53935, #1E88E5, #43A047, #FDD835, #8E24AA, #FB8C00, #FFD700"
mood: "따뜻한 동화적 모험 — 밝고 희망찬 왕국 재건, 보석의 화려한 광채"
reference: "Royal Match 보석 광택 + Gardenscapes 동화풍 배경"

assets:
  - id: gem-red
    desc: "루비 보석 — 다이아몬드 컷 하트형, 진홍색 그라데이션, 내부 빛 산란, 상단 글로시 반사 하이라이트, 약간의 그림자"
    size: "128x128"

  - id: gem-blue
    desc: "사파이어 보석 — 타원형 커팅, 진청색~하늘색 그라데이션, 내부 빛 줄기, 상단 백색 반사"
    size: "128x128"

  - id: gem-green
    desc: "에메랄드 보석 — 에메랄드 컷 사각형, 진초록~연초록 그라데이션, 내부 격자 빛 무늬"
    size: "128x128"

  - id: gem-yellow
    desc: "토파즈 보석 — 별 모양, 밝은 금색~레몬색 그라데이션, 중앙 밝은 발광, 꼭짓점 반짝임"
    size: "128x128"

  - id: gem-purple
    desc: "자수정 보석 — 둥근 브릴리언트 컷, 진보라~연보라 그라데이션, 내부 별 모양 빛"
    size: "128x128"

  - id: gem-orange
    desc: "호박 보석 — 물방울(드롭) 형태, 진주황~밝은 오렌지 그라데이션, 내부 따뜻한 빛 산란"
    size: "128x128"

  - id: gem-red-sheet
    desc: "루비 보석 반짝임 애니메이션 — 6프레임, 빛 반사가 보석 표면을 순환하며 반짝이는 시퀀스"
    size: "768x128"
    frames: 6
    ref: "gem-red"

  - id: gem-blue-sheet
    desc: "사파이어 보석 반짝임 애니메이션 — 6프레임, 빛 줄기가 내부에서 회전"
    size: "768x128"
    frames: 6
    ref: "gem-blue"

  - id: gem-green-sheet
    desc: "에메랄드 보석 반짝임 애니메이션 — 6프레임, 격자 빛 무늬가 반짝이는 시퀀스"
    size: "768x128"
    frames: 6
    ref: "gem-green"

  - id: gem-yellow-sheet
    desc: "토파즈 보석 반짝임 애니메이션 — 6프레임, 꼭짓점에서 중앙으로 빛 수렴"
    size: "768x128"
    frames: 6
    ref: "gem-yellow"

  - id: gem-purple-sheet
    desc: "자수정 보석 반짝임 애니메이션 — 6프레임, 내부 별빛이 회전 반짝임"
    size: "768x128"
    frames: 6
    ref: "gem-purple"

  - id: gem-orange-sheet
    desc: "호박 보석 반짝임 애니메이션 — 6프레임, 따뜻한 빛이 드롭 내부에서 맥동"
    size: "768x128"
    frames: 6
    ref: "gem-orange"

  - id: special-line-h
    desc: "가로 줄 파괴 보석 — 보석 형태에 가로 화살표 2개(←→)가 빛나는 오버레이, 양쪽 끝에 번개 이펙트"
    size: "128x128"

  - id: special-line-v
    desc: "세로 줄 파괴 보석 — 보석 형태에 세로 화살표 2개(↑↓)가 빛나는 오버레이, 상하 번개 이펙트"
    size: "128x128"

  - id: special-bomb
    desc: "폭탄 보석 — 둥근 폭탄 형태, 보석 색상 유지 + 불꽃 심지, 내부 에너지 소용돌이, 위험한 광채"
    size: "128x128"

  - id: special-rainbow
    desc: "레인보우 보석 — 6색이 소용돌이치는 구체, 무지개 프리즘 반사, 중앙 별 모양 백색 발광, 주변 작은 별 파티클"
    size: "128x128"

  - id: obstacle-ice
    desc: "얼음 장애물 — 반투명 하늘색 얼음 결정, 내부에 보석 실루엣이 비침, 표면 서리 패턴, 차가운 빛 반사"
    size: "128x128"

  - id: obstacle-stone
    desc: "돌블록 장애물 — 거친 회색 석재, 금이 간 표면, 미세한 광물 반짝임, 2단계 파괴 시 균열 확대"
    size: "256x128"
    frames: 2

  - id: obstacle-chain
    desc: "체인 장애물 — 금속 사슬이 보석을 X자로 감싸는 형태, 은색 금속 광택, 열쇠 구멍 디테일"
    size: "128x128"

  - id: obstacle-poison
    desc: "독 장애물 — 보라색~검정 독액이 보석을 감싸는 형태, 독 방울 떨어짐, 연기 이펙트, 불길한 광채"
    size: "128x128"

  - id: obstacle-lock
    desc: "잠금 장애물 — 황금 자물쇠가 보석 위에 걸린 형태, 열쇠 구멍, 잠금 메커니즘 디테일"
    size: "128x128"

  - id: obstacle-curse
    desc: "저주 장애물 — 어두운 보라색 마법진이 보석을 감싸는 형태, 3겹 룬 문자 원, 사악한 눈 문양"
    size: "384x128"
    frames: 3

  - id: bg-zone1-castle-gate
    desc: "구역1 성문 배경 — 따뜻한 석재 성문, 양쪽 탑, 펄럭이는 깃발, 맑은 하늘, 새 떼, 성문 너머 왕국 전경"
    size: "1920x1080"

  - id: bg-zone2-garden
    desc: "구역2 정원 배경 — 만개한 꽃밭, 분수, 나비, 오솔길, 아치형 덩굴, 부드러운 빛 번짐"
    size: "1920x1080"

  - id: bg-zone3-market
    desc: "구역3 시장 배경 — 활기찬 중세 시장, 천막 상점들, 과일 수레, 보석 진열대, 사람 실루엣"
    size: "1920x1080"

  - id: bg-zone4-library
    desc: "구역4 도서관 배경 — 거대한 마법 도서관, 떠다니는 책들, 촛불 조명, 별자리 천장화, 신비한 파란 빛"
    size: "1920x1080"

  - id: bg-zone5-cathedral
    desc: "구역5 대성당 배경 — 장엄한 스테인드글라스, 빛줄기 내리쬐는 예배당, 보석 장식 기둥, 신성한 금빛"
    size: "1920x1080"

  - id: bg-zone6-throne
    desc: "구역6 왕좌실 배경 — 황금 왕좌, 보석 박힌 기둥, 붉은 카펫, 왕관 거치대, 화려한 샹들리에"
    size: "1920x1080"

  - id: bg-kingdom-map
    desc: "왕국 전체 조감도 맵 — 위에서 내려다본 왕국 전경, 6구역이 길로 연결, 빈 건설 부지들, 산맥과 강, 동화풍"
    size: "1920x1080"

  - id: char-king-idle
    desc: "왕 캐릭터 기본 포즈 — SD 비율(2.5등신), 보석 왕관, 파란 망토, 황금 홀, 미소짓는 표정, 정면향"
    size: "512x512"

  - id: char-king-happy
    desc: "왕 캐릭터 기쁨 포즈 — 두 손 들어 환호, 왕관이 살짝 기울어짐, 눈 반짝임, 축하 표정"
    size: "512x512"
    ref: "char-king-idle"

  - id: char-king-sad
    desc: "왕 캐릭터 실패 포즈 — 고개 숙인 모습, 왕관 내려앉음, 눈물 한 방울, 기운 없는 표정"
    size: "512x512"
    ref: "char-king-idle"

  - id: char-knight
    desc: "기사 NPC (길드 멤버) — SD 비율, 은색 갑옷, 보석 장식 방패, 용감한 표정, 측면향"
    size: "512x512"

  - id: char-wizard
    desc: "마법사 NPC (길드 멤버) — SD 비율, 보라색 로브, 보석 박힌 지팡이, 영리한 표정"
    size: "512x512"

  - id: char-healer
    desc: "치유사 NPC (길드 멤버) — SD 비율, 초록 옷, 빛나는 보석 펜던트, 따뜻한 미소"
    size: "512x512"

  - id: boss-dragon
    desc: "드래곤 보스 — 대형, 보석으로 장식된 비늘, 입에서 보라색 에너지, 날개 펼침, 위압적 포즈, 붉은 눈"
    size: "800x600"

  - id: effect-match-burst
    desc: "매칭 폭발 이펙트 시퀀스 — 4프레임, 보석 색상의 빛 파티클이 방사형으로 퍼지며 사라짐"
    size: "512x128"
    frames: 4

  - id: effect-line-laser
    desc: "줄 파괴 레이저 이펙트 — 가로 형태, 밝은 백색 레이저 빔 + 양쪽 끝 에너지 폭발, 파란 전기 아크"
    size: "1024x128"

  - id: effect-bomb-shockwave
    desc: "폭탄 충격파 이펙트 시퀀스 — 4프레임, 중심에서 원형 충격파 확장, 파편 날림"
    size: "512x128"
    frames: 4

  - id: effect-rainbow-wave
    desc: "레인보우 발동 이펙트 — 무지개색 파동이 보드 전체를 휩쓰는 이펙트, 6색 빛줄기"
    size: "1024x256"

  - id: effect-cascade-star
    desc: "캐스케이드 콤보 별 이펙트 — 콤보 숫자 주변에 회전하는 별 파티클, 점점 커지는 크기"
    size: "256x256"

  - id: particle-sparkle
    desc: "반짝임 파티클 텍스처 — 작은 4각 별 모양, 백색~금색 알파 그라데이션, 중심 밝고 가장자리 투명"
    size: "64x64"

  - id: particle-dust
    desc: "보석 먼지 파티클 — 원형, 매우 작은 빛 점, 무지개색 알파, 부드러운 가장자리"
    size: "32x32"

  - id: ui-board-frame
    desc: "게임 보드 프레임 — 금색 장식 테두리, 모서리 보석 장식, 상단 레벨 목표 패널 영역, 하단 부스터 슬롯 영역"
    size: "1024x1024"

  - id: ui-turn-counter
    desc: "턴 수 표시 UI — 원형 금색 배지, 중앙에 숫자 영역, 보석 장식 테두리"
    size: "128x128"

  - id: ui-score-bar
    desc: "점수바 UI — 가로 막대형, 금색 프레임, 내부 그라데이션 게이지, 별 3개 위치 마커"
    size: "512x64"

  - id: ui-booster-hammer
    desc: "부스터: 망치 — 금색 망치 아이콘, 보석 파편 이펙트, 둥근 배경"
    size: "128x128"

  - id: ui-booster-swap
    desc: "부스터: 교환 — 양방향 화살표 아이콘, 파란 에너지, 둥근 배경"
    size: "128x128"

  - id: ui-booster-shuffle
    desc: "부스터: 셔플 — 소용돌이 아이콘, 무지개 에너지, 둥근 배경"
    size: "128x128"

  - id: ui-booster-extra-turn
    desc: "부스터: 추가 턴 — +5 숫자가 새겨진 모래시계, 금색 빛, 둥근 배경"
    size: "128x128"

  - id: ui-star
    desc: "별 아이콘 — 5각 별, 금색 글로시, 내부 빛 발산, 완성/미완성 2가지 상태 표현"
    size: "128x128"

  - id: ui-season-banner
    desc: "시즌 패스 배너 — 가로 리본형, 금색 테두리, 중앙 시즌 아이콘(왕관), 보라색~금색 그라데이션"
    size: "512x128"

  - id: ui-guild-emblem
    desc: "길드 엠블럼 — 방패 형태, 중앙 보석 문양, 검과 지팡이 교차, 금색 월계관 장식"
    size: "256x256"

  - id: ui-button-play
    desc: "플레이 버튼 — 둥근 사각형, 초록색 그라데이션, 중앙 ▶ 아이콘, 글로시 반사, 금색 테두리"
    size: "256x96"

  - id: ui-hp-bar
    desc: "보스 체력바 — 가로 막대, 빨간색 게이지, 해골 아이콘 좌측, 보스 이름 표시 영역"
    size: "512x64"

  - id: building-castle
    desc: "왕국 건물: 성 — 3단계 업그레이드 형태 (작은집→석성→대성), 동화풍, 깃발, 보석 장식"
    size: "384x256"

  - id: building-garden
    desc: "왕국 건물: 정원 — 3단계 (잡초밭→꽃밭→분수 정원), 나비, 꽃, 울타리"
    size: "384x256"

  - id: building-market
    desc: "왕국 건물: 시장 — 3단계 (노점→상점가→번화가), 천막, 상품, 활기"
    size: "384x256"

  - id: building-tower
    desc: "왕국 건물: 마법탑 — 3단계 (돌탑→수정탑→대마법탑), 빛나는 크리스탈, 마법 아우라"
    size: "384x256"

  - id: thumbnail
    desc: "게임 대표 이미지 — 중앙에 6색 보석이 원형으로 배치, 배경에 왕국 전경, 상단에 '보석 왕국 전설' 금색 타이틀 텍스트, 하단에 왕 캐릭터(SD), 전체적으로 밝고 화려한 판타지 분위기"
    size: "800x600"
```

**에셋 총 수: 49개**
- 보석 기본 6개 + 보석 애니메이션 시트 6개 = 12
- 스페셜 보석 4개
- 장애물 6개 (돌/저주는 다단계 시트)
- 배경 7개 (6구역 + 왕국맵)
- 캐릭터 6개 (왕 3포즈 + NPC 3명)
- 보스 1개
- 이펙트 5개 + 파티클 2개 = 7
- UI 11개
- 건물 4개
- 썸네일 1개

---

## §9. 왕국 건설 메타 시스템

### 건물 목록
| 건물 | 필요 별 | 단계 | 효과 |
|------|---------|------|------|
| 성 | 3/8/15 | 3 | 부스터 저장 슬롯 +1 (단계당) |
| 정원 | 3/8/15 | 3 | 일일 챌린지 보상 +20% (단계당) |
| 시장 | 5/10/20 | 3 | 시즌 패스 XP +10% (단계당) |
| 마법탑 | 5/10/20 | 3 | DDA 보정 강화 (추가 턴 +1, 단계당) |

### 건설 흐름
```
레벨 클리어 → 별 ★~★★★ 획득 → 왕국 맵 이동 →
건물 선택 → 별 소비 → 건설 연출 (tween 2초) →
다음 레벨 언락 확인 → 레벨 선택 화면
```

---

## §10. 시즌 패스 시스템

### 시즌 패스 트랙 (30단계)
```
무료 트랙:  [보석×100] → [부스터:망치] → [보석×200] → ... → [스킨:골든 보드]
프리미엄 트랙: [보석×300] → [부스터 세트] → [보석×500] → ... → [스킨:드래곤 보석]
```

- 각 단계: 100 XP 필요
- XP 획득: 레벨 클리어(10), 3별(25), 일일 챌린지(50), 길드 레이드(30)
- 프리미엄 트랙: 시뮬레이션 (무료 게임이므로 자동 언락)
- 시즌 기간: localStorage 기반 7일 카운트다운 (리셋 시 진행도 초기화)

---

## §11. 길드 레이드 시스템

### 길드 구성
- 플레이어 + AI 길드원 3명 (기사/마법사/치유사)
- 각 길드원은 자동으로 매치3를 수행 (AI 레벨 2~3)

### 보스전 흐름
```
보스 등장 컷신 (tween 3초) → 턴제 진행:
  플레이어 턴 → 매치3 (데미지 = 점수 × 0.1)
  길드원 1 턴 → AI 자동 매치 (데미지 표시)
  길드원 2 턴 → AI 자동 매치
  길드원 3 턴 → AI 자동 매치
  보스 턴 → 보스 공격 (장애물 3~5개 랜덤 배치)
  → 보스 HP 0 = 클리어 / 30턴 초과 = 실패
```

### 보스 패턴 (드래곤)
| 보스 HP | 행동 |
|---------|------|
| 100~70% | 얼음 3개 배치 |
| 70~40% | 돌블록 2개 + 체인 2개 배치 |
| 40~10% | 독 2개 + 저주 1개 배치 |
| 10% 이하 | 분노 모드: 장애물 5개 + 잠금 2개 |

---

## §12. 기술 구현 지침 (코더용)

### 필수 준수 사항
1. **단일 HTML 파일** — Vanilla JS, Canvas 2D. DPR 대응 + localStorage try-catch
2. **TweenManager + ObjectPool** — clearImmediate() / releaseAll() 상태 전환 시 일괄 정리
3. **TRANSITION_TABLE 화이트리스트** — §5.2.3 참조. `state = STATE.X` 직접 할당 0건
4. **deferredTransition 큐** — enterState() 내 동기 전환 시도를 큐에 저장, 다음 프레임 처리
5. **enterState() 일원화** — 상태 진입 초기화 한 곳에서 관리
6. **validateActiveSystems()** — §5.2.1 자동 검증 함수, enterState() 첫 줄에서 호출 (F1)
7. **consumed[][] 소비 추적** — §2.3 매치 우선순위. 반드시 5→T/L→4→3 순서 (C44~51 검증)
8. **함수 오버라이드 0건** — stateHandlers 맵/if-else만 허용. function 재선언 금지
9. **coreUpdate()/coreRender() 단일 진입점** — flush는 coreRender() 마지막
10. **터치 타겟 48px** — `Math.max(48, size)` 렌더링 함수 강제
11. **SeededRNG** — Math.random() 0건. 일일 챌린지는 날짜 시드
12. **TDZ 방어** — let/const 변수는 최초 사용 전 선언. Engine 생성 이전에 참조 변수 선언
13. **Web Audio 네이티브** — `ctx.currentTime + offset`. setTimeout 배제
14. **drawAssetOrFallback()** — 모든 에셋 렌더링에 Canvas 폴백 필수

### §13. 에셋-코드 교차 검증
```javascript
function validateAssets(manifest, requiredIds) {
  const missing = requiredIds.filter(id => !manifest[id]);
  if (missing.length > 0) {
    console.warn('[Assets] 누락:', missing.join(', '));
  }
  // 모든 에셋은 drawAssetOrFallback()으로 렌더링
}
```

### §14. 엣지 케이스 매트릭스 (부스터 × 상태)
| 시나리오 | 처리 |
|---------|------|
| 망치 + 스페셜 보석 | 스페셜 발동 후 제거 |
| 망치 + 장애물 | 장애물 HP -1 |
| 교환 + 레인보우 | 레인보우 발동 (교환 대상 색) |
| 셔플 + 캐스케이드 중 | 입력 차단 (CASCADE 상태) |
| 추가 턴 + 턴 0 | 턴 +5 즉시 적용 |
| 부스터 + 길드 레이드 | 플레이어 턴에만 사용 가능 |
| 독 확산 + 보석 하강 | 하강 보석은 독 면역 |
| 데드록 + 장애물 가득 | 장애물 제외 보석만 셔플 |
| 레인보우 + 레인보우 | 보드 전체 제거 + 보너스 점수 ×5 |
| 캐스케이드 중 스페셜 연쇄 | 큐에 넣어 순차 처리 (tween 완료 후) |
| 보스 장애물 + 기존 장애물 | 겹침 불가 — 빈 칸에만 배치 |
| DDA EASY + 부스터 사용 | DDA 보정과 부스터 효과 동시 적용 |
| 일일 챌린지 + DDA | 일일 챌린지에서는 DDA 비활성 (공정성) |
| 시즌 패스 XP + 3별 | 기본 10 + 보너스 15 = 25 XP |
| 왕국 건설 중 레벨 언락 | 건설 tween 완료 후 언락 확인 |
| 길드원 AI 매치 + 보스 공격 | 턴 순서 엄격 유지, 동시 발동 불가 |
| 보스 분노 + 보드 가득 | 장애물 배치 불가 시 스킵 |
| localStorage 용량 초과 | try-catch + 가장 오래된 데이터 삭제 |
| 보석 6색 미만 잔여 | 최소 3색 보장, 부족 시 강제 보충 |
| 시즌 패스 만료 | 진행도 리셋 + 알림 모달 |

---

## §15. 사운드 디자인

### 효과음 (최소 8종)
| ID | 설명 | 트리거 |
|----|------|--------|
| sfx-match | 보석 매칭 소리 (맑은 종소리) | 3매치 성공 |
| sfx-combo | 콤보 소리 (피치 상승) | 캐스케이드 2+ |
| sfx-special-create | 스페셜 보석 생성 (반짝임+차임) | 4/5/T/L매치 |
| sfx-special-activate | 스페셜 발동 (폭발/레이저) | 스페셜 보석 활성화 |
| sfx-level-clear | 레벨 클리어 팡파레 | LEVEL_CLEAR 진입 |
| sfx-level-fail | 레벨 실패 (하강 멜로디) | LEVEL_FAIL 진입 |
| sfx-build | 건설 완료 (망치+팡파레) | 왕국 건물 건설 |
| sfx-boss-attack | 보스 공격 (으르렁+충격) | 보스 턴 |
| sfx-star-collect | 별 획득 (반짝+상승) | 레벨 클리어 별 카운트 |

### BGM
- Web Audio API 절차적 생성
- 메인 테마: 밝은 판타지 오케스트라풍 (C Major, 120 BPM)
- 보스전: 긴장감 있는 전투 테마 (D Minor, 140 BPM)
- 왕국 맵: 평화로운 배경음 (F Major, 90 BPM)

---

## §16. 게임 페이지 메타데이터

```yaml
game:
  title: "보석 왕국 전설"
  description: "몰락한 왕국을 보석의 힘으로 재건하라! 36개 레벨, 왕국 건설, 시즌 패스, 길드 레이드까지 — 프리미엄 매치3 퍼즐의 정수."
  genre: ["puzzle"]
  playCount: 0
  rating: 0
  controls:
    - "마우스 드래그: 보석 스왑"
    - "클릭: UI 선택"
    - "터치 스와이프: 보석 스왑 (모바일)"
    - "ESC: 일시정지"
    - "1~4: 부스터 선택"
    - "Space: 힌트 표시"
  tags:
    - "#매치3"
    - "#퍼즐"
    - "#왕국건설"
    - "#시즌패스"
    - "#길드레이드"
    - "#판타지"
    - "#보석"
    - "#캐주얼"
  addedAt: "2026-03-29"
  version: "1.0.0"
  featured: true
```

---

## §17. 코드 규모 목표
- **최소 5,000줄** (C51 4,948줄 이상)
- 섹션 인덱스 40줄 이내
- 함수당 최대 60줄
- 13상태 × stateHandlers 맵
- 에셋 49개 manifest.json 로드
- Web Audio BGM + 효과음 9종
