---
game-id: gem-arena
title: 보석 대전
genre: puzzle
difficulty: medium
---

# 보석 대전 (Gem Arena) — 사이클 #51 기획서

## §0. 이전 사이클 피드백 반영 테이블

| C50 아쉬웠던 점 | §번호 | C51 해결 방안 (코드 패턴) |
|---|---|---|
| 1회차 CRITICAL 3건 (TDZ/flush/초기화) | §12 | `_ready` TDZ 방어 패턴 + `coreRender()` 마지막에 `input.flush()` + `enterState()` 내 모든 변수 초기화 체크리스트 |
| 3,204줄 단일 파일 한계 | §11 | 함수 영역별 주석 블록 + 섹션 인덱스 + coreUpdate()/coreRender() 단일 진입점으로 구조 명확화. 공용 엔진(TweenManager, ObjectPool, TransitionGuard)은 코드 상단 800줄 이내 배치 |
| 주간 경쟁 AI 깊이 부족 | §5.4 | PvP AI에 3단계 행동 모델 적용 — 탐욕(greedy), 전략(스페셜 우선), 방어(장애물 회피). 플레이어 리그에 따라 AI 레벨 동적 조정 |
| 페이드 전환 프록시 복잡성 | §11 | `gFadeProxy` 제거 → tween 시스템에서 `gFadeAlpha` 직접 조작. `tweenManager.fadeTo(target, duration, callback)` 유틸 메서드 추가 |

### 검증 완료 계승 사항 (C50에서 이어받는 것)
- ✅ 오버라이드 0건 정책 — stateHandlers 맵 방식
- ✅ TRANSITION_TABLE 12상태 화이트리스트
- ✅ consumed[][] 매치 소비 추적 + 캐스케이드 tween 체인
- ✅ SeededRNG 날짜 시드 일일 챌린지
- ✅ DDA failStreak 기반 3단계
- ✅ Gemini PNG + manifest.json + drawAssetOrFallback() 전수 적용
- ✅ deferredTransition 큐 — enterState 데드락 근절

---

## §0.5. MVP Phase 구분

### Phase 1 — MVP (반드시 완성) ⭐
- 8×8 매치3 엔진 (C50 계승)
- 6색 보석 + 스페셜 4종 (라인H/라인V/폭탄/레인보우)
- PvP 턴 기반 대전 (분할 화면, AI 상대)
- 솔로 모드 30레벨 (5구역 × 6레벨)
- 왕국 건설 메타 (C50 계승, 5구역)
- 리그 시스템 (브론즈→다이아몬드 5단계)
- 부스터 4종 (망치/교환/셔플/추가턴)
- 장애물 6종 (얼음1단/얼음2단/체인/돌블록/잠금블록/독)
- DDA 3단계 + 일일 챌린지

### Phase 2 — 확장 (시간 허용 시)
- 주간 PvP 토너먼트 (32강 브래킷)
- 리그 보상 보석 스킨 4종
- 건설 완료 축하 연출 강화
- 다국어 (ko/en)

> ⚠️ Phase 1만으로 완전히 플레이 가능한 게임이어야 함. Phase 2는 보너스.

---

## §1. 게임 개요 및 핵심 재미 요소

**보석 대전(Gem Arena)**은 Match Masters 스타일의 **1v1 턴 기반 PvP 매치3 퍼즐 게임**이다. 플레이어는 8×8 보석 보드에서 상대(AI)와 번갈아 매칭하며, 더 높은 점수를 얻어 승리한다. 스페셜 보석으로 만든 콤보는 상대 보드에 장애물을 전송하여 방해할 수 있다.

### 핵심 재미 3축
1. **PvP 긴장감**: 같은 보드에서 상대와 교대하며, 내 수가 상대에게 미칠 영향까지 계산하는 전략적 매칭
2. **콤보 → 공격 쾌감**: 4매치 이상 스페셜 보석 생성 → 상대 보드에 돌블록/얼음 전송 → 상대 방해
3. **리그 승급 성취감**: 트로피 누적 → 리그 승급 연출 → 전용 보석 스킨 해금 → 왕국 건설 진행

### 컨셉 한 줄 요약
> "네 보석 콤보가 상대의 악몽이 된다" — 매칭할 때마다 공격과 방어를 동시에 고민하는 전략 PvP 매치3

---

## §2. 게임 규칙 및 목표

### 2.1 모드 구성

| 모드 | 설명 | 승리 조건 |
|------|------|-----------|
| **솔로 어드벤처** | 30레벨 × 5구역, 레벨별 목표 달성 | 제한 턴 내 목표(점수/특정 보석 수집/장애물 제거) 달성 |
| **PvP 대전** | AI 상대 1v1, 턴 기반 교대 매칭 | 20턴(각 10턴) 후 더 높은 점수 획득 |

### 2.2 PvP 턴 규칙
1. **코인 토스**: 랜덤 선공/후공 결정 (SeededRNG)
2. **교대 턴**: 각 플레이어 1턴에 1매칭 (캐스케이드는 무제한)
3. **장애물 전송**: 스페셜 보석 발동 시 상대 보드에 장애물 전송
   - 4매치 라인 → 상대에게 얼음 1개 전송
   - 폭탄 발동 → 상대에게 돌블록 2개 전송
   - 레인보우 발동 → 상대에게 체인 3개 전송
   - 캐스케이드 3연쇄+ → 추가 독 1개 전송
4. **전송 타이밍**: 현재 턴의 모든 캐스케이드 완료 후 일괄 전송
5. **승리 판정**: 20턴 완료 후 총점 비교. 동점 시 마지막 콤보 점수가 높은 쪽 승리

### 2.3 매치 검출 우선순위 (C44+ 검증 패턴)
```
5매치(라인5) → T/L형(5칸) → 4매치(라인4) → 3매치(라인3)
```
- `consumed[][]` 배열로 이미 매치된 셀 중복 방지
- 초기 보드 생성 시 3매치 이상 존재하지 않도록 검증
- 유효 이동 0개 시 자동 셔플 (최대 3회, 이후 보드 재생성)

### 2.4 스페셜 보석 생성 규칙

| 매치 패턴 | 생성 스페셜 | 발동 효과 |
|-----------|------------|-----------|
| 4매치 가로 | 가로 화살표 (Line-H) | 가로 1줄 전체 파괴 |
| 4매치 세로 | 세로 화살표 (Line-V) | 세로 1줄 전체 파괴 |
| T형/L형 5칸 | 폭탄 (Bomb) | 3×3 영역 파괴 |
| 5매치 일직선 | 레인보우 (Rainbow) | 스왑한 색상 전체 제거 |

### 2.5 스페셜 조합 (스페셜+스페셜 스왑)

| 조합 | 효과 | PvP 전송 |
|------|------|----------|
| Line + Line | 십자형 파괴 (가로+세로 전체) | 돌블록 3개 |
| Line + Bomb | 3줄 가로 또는 세로 파괴 | 돌블록 4개 |
| Bomb + Bomb | 5×5 영역 파괴 | 체인 3개 |
| Rainbow + Line | 모든 같은 색 → Line으로 변환 후 발동 | 얼음 6개 |
| Rainbow + Bomb | 모든 같은 색 → Bomb으로 변환 후 발동 | 돌블록 6개 |
| Rainbow + Rainbow | 보드 전체 클리어 | 독 5개 + 돌블록 5개 |

### 2.6 장애물 시스템

| 장애물 | HP | 제거 방법 | PvP 전송 여부 |
|--------|----|-----------|----|
| 얼음 1단 | 1 | 인접 매치 1회 | ✅ |
| 얼음 2단 | 2 | 인접 매치 2회 | ❌ (솔로 전용) |
| 체인 | 1 | 해당 셀 매치 | ✅ |
| 돌블록 | - | 인접 매치/스페셜로만 파괴 | ✅ |
| 잠금블록 | 1 | 인접 매치로 해제 후 일반 보석 | ❌ (솔로 전용) |
| 독 | - | 인접 매치로 제거, 매 턴 1칸 확산 | ✅ |

### 2.7 부스터 (솔로+PvP 공용)

| 부스터 | 효과 | PvP 사용 제한 |
|--------|------|--------------|
| 🔨 망치 | 보석 1개 즉시 파괴 | 대전 당 1회 |
| 🔄 교환 | 아무 보석 2개 위치 교환 | 대전 당 1회 |
| 🌀 셔플 | 보드 전체 랜덤 섞기 | 대전 당 1회 |
| ⏳ 추가턴 | 턴 1개 추가 | 대전 당 1회 |

---

## §3. 조작 방법

### 키보드
| 키 | 동작 |
|----|------|
| 마우스 드래그 | 보석 스왑 (클릭 후 인접 4방향 드래그) |
| ESC | 일시정지/설정 메뉴 |
| Space | 턴 건너뛰기 (PvP 모드) |
| 1~4 | 부스터 1~4 선택 |
| M | 음소거 토글 |

### 마우스
- **클릭+드래그**: 보석 선택 후 인접 방향으로 드래그하여 스왑
- **클릭**: UI 버튼, 맵 노드, 건설 선택지 등
- **휠 스크롤**: 왕국 맵 확대/축소

### 터치 (모바일)
- **스와이프**: 보석 선택 후 방향 스와이프로 스왑 (최소 20px 이동, 48px 터치 타겟)
- **탭**: UI 버튼, 맵 노드 선택
- **핀치 줌**: 왕국 맵 확대/축소
- **길게 누르기(500ms)**: 보석 정보 팝업 (스페셜 보석 효과 설명)

> ⚠️ 모든 터치 타겟: `Math.max(48, actualSize)` 강제 적용 (C12+ 표준)

---

## §4. 시각적 스타일 가이드

### 4.1 색상 팔레트
| 용도 | 색상 | HEX |
|------|------|-----|
| 배경 기본 (진한 네이비) | 🟫 | `#1a1a3e` |
| 배경 보조 (보라) | 🟪 | `#2d1b69` |
| 골드 액센트 | 🟨 | `#ffd700` |
| 시안 액센트 | 🟦 | `#00d4ff` |
| 승리 그린 | 🟩 | `#4ade80` |
| 패배 레드 | 🟥 | `#ff4444` |
| 보드 배경 | ⬛ | `#0f0f2e` |

### 4.2 보석 색상 (6색)
| 보석 | 색상 | 형태 |
|------|------|------|
| 빨강 | `#ff4466` | 다이아몬드형 — 뾰족한 마름모, 내부 빛 산란 |
| 파랑 | `#4488ff` | 원형 — 매끈한 구체, 글로시 하이라이트 |
| 초록 | `#44dd88` | 육각형 — 에메랄드 커팅, 면 반사 |
| 노랑 | `#ffdd44` | 별형 — 5각 별, 따뜻한 내부 광택 |
| 보라 | `#aa44ff` | 하트형 — 부드러운 곡선, 보라빛 그라데이션 |
| 주황 | `#ff8844` | 삼각형 — 역삼각 커팅, 호박색 광택 |

### 4.3 배경 스타일
- **판타지 왕국**: 따뜻한 동화풍 성, 푸른 하늘, 구름, 나무
- **PvP 대전 배경**: 투기장(아레나) 분위기 — 양쪽에 왕좌, 중앙에 대전 보드
- **왕국 맵**: 조감도 시점의 동화 마을, 구역별 다른 테마(성문/정원/시장/도서관/왕좌실)

---

## §4.5. 아트 디렉션 (Art Direction)

### 아트 스타일 키워드
**"Glossy Fantasy Gem — 밝고 화려한 3D 느낌의 2D 보석 + 따뜻한 판타지 동화 배경"**

### 스타일 상세
- **보석**: 부드러운 그라디언트, 글로시 반사 하이라이트, 내부 빛 산란 효과. 각 보석은 고유한 기하학적 형태를 가지며, Royal Match/Candy Crush 급의 3D 느낌 2D 렌더링
- **배경**: 수채화 터치가 가미된 따뜻한 판타지 동화 스타일. 부드러운 빛과 따뜻한 색감
- **캐릭터**: 귀엽고 친근한 SD(Super Deformed) 비율의 판타지 캐릭터. 큰 눈, 밝은 표정
- **UI**: 금테 장식 + 보석 장식이 들어간 고급스러운 판타지 UI 프레임. 버튼에 미세한 빛 반사 효과
- **이펙트**: 밝고 화려한 파티클 — 보석 파편, 빛 줄기, 별 반짝임. 과장된 스쿼시/스트레치 애니메이션

### 레퍼런스 게임
1. **Royal Match** — 보석의 글로시한 질감, 왕국 건설 UI, 전체적인 밝고 따뜻한 톤
2. **Match Masters** — PvP 대전 화면 레이아웃, 분할 화면 구성, 리그 배지 디자인

---

## §5. 핵심 게임 루프 (프레임 기준 로직 흐름)

### 5.1 메인 루프 (60fps)
```
requestAnimationFrame(gameLoop)
├── deltaTime = clamp(now - lastTime, 0, 50ms)  // 50ms 캡
├── coreUpdate(dt)
│   ├── tweenManager.update(dt)
│   ├── particleManager.update(dt)
│   ├── stateHandlers[currentState].update(dt)
│   │   ├── STATE.PLAY → updateSoloBoard(dt)
│   │   ├── STATE.PVP_MATCH → updatePvpMatch(dt)
│   │   ├── STATE.KINGDOM_MAP → updateKingdomMap(dt)
│   │   └── ... (stateHandlers 맵 참조)
│   └── audioManager.update(dt)
├── coreRender()
│   ├── clearCanvas()
│   ├── renderBackground()
│   ├── stateHandlers[currentState].render()
│   ├── renderFadeOverlay(gFadeAlpha)  // tween 직접 조작
│   ├── renderParticles()
│   └── input.flush()  // ⚠️ render 완료 후 flush (C50 교훈)
└── lastTime = now
```

### 5.2 매치3 보드 업데이트 사이클
```
IDLE (입력 대기)
  → 스왑 입력 감지
  → validateSwap(row1, col1, row2, col2)
  → 유효하지 않으면 → bounceBack tween → IDLE
  → 유효하면 → swapTween 재생
    → MATCHING 상태
      → findMatches() [우선순위: 5→T/L→4→3, consumed[][] 추적]
      → 매치 없으면 → IDLE
      → 매치 있으면:
        → removeMatches() + spawnSpecials()
        → scoreUpdate() + comboCounter++
        → PvP: queueObstacles(combo) — 장애물 전송 큐에 추가
        → GRAVITY (낙하)
          → dropTweens 생성
          → 빈 칸 새 보석 생성
          → MATCHING (재검사 — 캐스케이드)
    → 캐스케이드 완료
      → PvP: sendQueuedObstacles() — 큐에 쌓인 장애물 일괄 전송
      → 턴 종료 판정
      → 다음 턴 또는 레벨 클리어/실패 체크
```

### 5.3 PvP 대전 루프
```
PVP_MATCH 상태 진입
├── 보드 초기화 (같은 시드로 양쪽 동일 보드 생성)
├── 턴 교대 루프 (총 20턴 = 각 10턴)
│   ├── PLAYER_TURN:
│   │   ├── 입력 활성화
│   │   ├── 매치 → 캐스케이드 → 장애물 전송
│   │   └── 턴 종료 → AI_TURN
│   └── AI_TURN:
│       ├── AI 사고 딜레이 (0.8~1.5초, 리그에 따라 조정)
│       ├── AI가 최적 수 선택 (§5.4 참조)
│       ├── 매치 → 캐스케이드 → 장애물 전송
│       └── 턴 종료 → PLAYER_TURN
├── 20턴 완료 → 점수 비교
└── PVP_RESULT 상태 전환
```

### 5.4 PvP AI 행동 모델 (C50 AI 깊이 부족 해결)

AI는 플레이어 리그에 따라 3단계 모델을 혼합 사용한다:

| AI 레벨 | 리그 | 행동 모델 | 설명 |
|---------|------|-----------|------|
| Lv.1 | 브론즈~실버 | **탐욕형(Greedy)** | 즉시 점수 최대화. 가장 큰 매치 우선 선택 |
| Lv.2 | 골드~플래티넘 | **전략형(Strategic)** | 스페셜 보석 생성을 우선. 4+매치 기회가 있으면 3매치보다 우선 |
| Lv.3 | 다이아몬드 | **복합형(Hybrid)** | 전략형 기반 + 상대 장애물 상황 고려 + 스페셜 조합 탐색 |

```javascript
// AI 의사결정 흐름 (의사 코드)
function aiDecide(board, aiLevel) {
  const allMoves = findAllValidMoves(board);
  const scored = allMoves.map(m => {
    let score = evaluateMove(m, board);
    if (aiLevel >= 2) score += evaluateSpecialCreation(m, board) * 2.0;
    if (aiLevel >= 3) score += evaluateOpponentImpact(m, board) * 1.5;
    // 약간의 랜덤성 추가 (인간적 느낌)
    score *= (0.85 + seededRNG.next() * 0.3);
    return { move: m, score };
  });
  return scored.sort((a, b) => b.score - a.score)[0].move;
}
```

---

## §6. 난이도 시스템

### 6.1 솔로 모드 레벨 구조 (30레벨 × 5구역)

| 구역 | 레벨 | 테마 | 장애물 도입 | 턴 수 |
|------|------|------|------------|-------|
| 1. 성문 | 1~6 | 성 입구 | 얼음1단 | 25~20 |
| 2. 정원 | 7~12 | 꽃밭 | 체인, 독 | 20~18 |
| 3. 시장 | 13~18 | 활기찬 마을 | 돌블록, 얼음2단 | 18~15 |
| 4. 도서관 | 19~24 | 마법 서재 | 잠금블록, 복합 | 15~12 |
| 5. 왕좌실 | 25~30 | 왕의 전당 | 전 장애물 혼합 | 12~10 |

### 6.2 레벨 목표 유형
- **점수 달성**: 목표 점수 이상 획득
- **보석 수집**: 특정 색상 보석 N개 매칭
- **장애물 제거**: 얼음/체인/돌블록 N개 파괴
- **스페셜 생성**: 스페셜 보석 N개 만들기
- **복합 목표**: 위 2~3개 조합 (구역 3 이상)

### 6.3 DDA (동적 난이도 조절) — C50 계승

```
failStreak 0~1: 기본 난이도 (목표 100%, 턴 100%)
failStreak 2~3: 쉬움 보정 (목표 85%, 턴 +2)
failStreak 4+:  대폭 보정 (목표 70%, 턴 +4, 시작 시 스페셜 1개 배치)
클리어 시: failStreak = 0
```

### 6.4 PvP 난이도 (리그 기반)

| 리그 | 트로피 범위 | AI 레벨 | 턴 수 | 장애물 밀도 |
|------|-----------|---------|-------|------------|
| 브론즈 | 0~299 | Lv.1 | 20 | 없음 |
| 실버 | 300~599 | Lv.1~2 혼합 | 20 | 얼음 2개 |
| 골드 | 600~999 | Lv.2 | 20 | 얼음 3 + 돌 1 |
| 플래티넘 | 1000~1499 | Lv.2~3 혼합 | 18 | 얼음 3 + 돌 2 |
| 다이아몬드 | 1500+ | Lv.3 | 16 | 얼음 4 + 돌 2 + 독 1 |

---

## §7. 점수 시스템

### 7.1 기본 점수
| 매치 유형 | 기본 점수 |
|-----------|----------|
| 3매치 | 50 |
| 4매치 | 120 |
| T/L형 | 200 |
| 5매치 | 350 |
| 스페셜 발동 (Line) | 200 |
| 스페셜 발동 (Bomb) | 400 |
| 스페셜 발동 (Rainbow) | 600 |
| 스페셜 조합 | 기본 × 2.0 |

### 7.2 콤보 배율
```
콤보 1: ×1.0
콤보 2: ×1.5
콤보 3: ×2.0
콤보 4: ×2.5
콤보 5+: ×3.0
```

### 7.3 PvP 보상
| 결과 | 트로피 변동 | 별 | 코인 |
|------|------------|-----|------|
| 승리 | +25~35 (리그별) | 2 | 50 |
| 패배 | -10~20 (리그별) | 0 | 10 |
| 무승부 | +5 | 1 | 25 |

### 7.4 왕국 건설 (C50 계승)
- 솔로 레벨 클리어 → 별 1~3개 획득 (목표 달성도에 따라)
- 별 소비 → 건물/장식 3택 1 선택
- 구역 완성 → 패시브 보너스 (시작 점수 +500, 턴 +1 등)

---

## §8. 에셋 요구 사항 (Asset Requirements)

```yaml
# asset-requirements
art-style: "Glossy Fantasy Gem — 밝고 화려한 3D 느낌의 2D 보석 + 따뜻한 판타지 동화 배경"
color-palette: "#1a1a3e, #2d1b69, #ffd700, #00d4ff, #4ade80, #ff4444, #0f0f2e"
mood: "화려하고 경쟁적인 판타지 아레나, 따뜻한 동화 왕국, 보석의 영롱한 빛"
reference: "Royal Match 보석 질감 + Match Masters PvP 레이아웃"

assets:
  - id: gem-red
    desc: "빨간 다이아몬드형 보석 — 마름모 커팅, 내부에 붉은 빛 산란, 상단 좌측에 글로시 하이라이트 반사점, 하단에 부드러운 그림자 그라데이션. 투명 배경."
    size: "128x128"

  - id: gem-blue
    desc: "파란 원형 보석 — 매끈한 구체, 사파이어 블루 그라디언트, 상단에 밝은 흰색 하이라이트, 내부 깊이감 있는 빛 굴절. 투명 배경."
    size: "128x128"

  - id: gem-green
    desc: "초록 육각형 보석 — 에메랄드 커팅 6면체, 각 면에 미세한 빛 반사, 중앙이 가장 밝고 가장자리 어두운 그라디언트. 투명 배경."
    size: "128x128"

  - id: gem-yellow
    desc: "노란 별형 보석 — 5각 별 모양, 따뜻한 골드 그라디언트, 꼭짓점에서 빛이 퍼지는 효과, 내부 호박색 광택. 투명 배경."
    size: "128x128"

  - id: gem-purple
    desc: "보라 하트형 보석 — 부드러운 하트 곡선, 자수정 보라빛 그라디언트, 중앙에 밝은 하이라이트, 테두리에 미세한 분홍 반사. 투명 배경."
    size: "128x128"

  - id: gem-orange
    desc: "주황 삼각형 보석 — 역삼각 커팅, 호박색→오렌지 그라디언트, 각 꼭짓점에 빛 반사, 내부에 따뜻한 광택. 투명 배경."
    size: "128x128"

  - id: special-line-h
    desc: "가로 화살표 스페셜 — 보석 위에 겹쳐지는 양방향 수평 화살표 오버레이, 금색 빛나는 화살, 중앙에 에너지 구체. 투명 배경."
    size: "128x128"

  - id: special-line-v
    desc: "세로 화살표 스페셜 — 보석 위에 겹쳐지는 양방향 수직 화살표 오버레이, 금색 빛나는 화살, 중앙에 에너지 구체. 투명 배경."
    size: "128x128"

  - id: special-bomb
    desc: "폭탄 스페셜 — 보석 위에 겹쳐지는 원형 폭탄 오버레이, 빛나는 동심원, 펄스하는 에너지 링, 중앙에 별 모양 빛. 투명 배경."
    size: "128x128"

  - id: special-rainbow
    desc: "레인보우 스페셜 — 6색이 소용돌이치는 구체, 무지개빛 그라디언트, 외곽에 빛 파티클, 회전하는 프리즘 효과. 투명 배경."
    size: "128x128"

  - id: obstacle-ice-1
    desc: "얼음 1단 장애물 — 반투명 하늘색 얼음 결정, 보석이 비치는 느낌, 균열 없음, 서리 가장자리. 투명 배경."
    size: "128x128"

  - id: obstacle-ice-2
    desc: "얼음 2단 장애물 — 두꺼운 불투명 얼음, 내부에 기포, 짙은 파란 색조, 두꺼운 서리 테두리. 투명 배경."
    size: "128x128"

  - id: obstacle-chain
    desc: "체인 장애물 — 보석을 감싸는 금속 사슬 X자 형태, 자물쇠 중앙, 녹슨 금속 질감, 어두운 그림자. 투명 배경."
    size: "128x128"

  - id: obstacle-stone
    desc: "돌블록 장애물 — 회색 돌 블록, 금이 간 표면, 이끼가 약간 낀 가장자리, 거친 질감. 투명 배경."
    size: "128x128"

  - id: obstacle-lock
    desc: "잠금블록 장애물 — 보석 위의 금색 자물쇠, 열쇠 구멍 빛남, 장식적인 금테 프레임. 투명 배경."
    size: "128x128"

  - id: obstacle-poison
    desc: "독 장애물 — 보라색 독 웅덩이, 기포가 올라오는 슬라임, 어두운 보라빛 증기, 위협적인 느낌. 투명 배경."
    size: "128x128"

  - id: char-king
    desc: "왕 캐릭터 — SD 비율의 귀여운 왕, 금관과 붉은 망토, 밝은 표정, 정면 포즈. 판타지 동화 스타일. 투명 배경."
    size: "512x512"

  - id: char-king-happy
    desc: "왕 기쁜 표정 — 눈이 반달형, 입 크게 웃음, 왕관에서 별 반짝임. 정면 상반신."
    size: "512x512"
    ref: "char-king"

  - id: char-king-worried
    desc: "왕 걱정 표정 — 눈썹 내려감, 입 삐죽, 땀방울 1개. 정면 상반신."
    size: "512x512"
    ref: "char-king"

  - id: char-opponent-1
    desc: "AI 상대 캐릭터 1 — SD 비율의 장난꾸러기 마법사, 보라 모자와 별 지팡이, 도전적 미소. 투명 배경."
    size: "512x512"

  - id: char-opponent-2
    desc: "AI 상대 캐릭터 2 — SD 비율의 기사, 은색 갑옷과 방패, 진지한 표정. 투명 배경."
    size: "512x512"

  - id: char-opponent-3
    desc: "AI 상대 캐릭터 3 — SD 비율의 드래곤 조련사, 붉은 머리카락과 비늘 어깨갑, 자신감 넘치는 포즈. 투명 배경."
    size: "512x512"

  - id: bg-arena
    desc: "PvP 대전 배경 — 판타지 아레나 내부, 양쪽에 관중석과 깃발, 중앙에 빛나는 마법진, 위에서 떨어지는 보석 파티클, 따뜻한 황금빛 조명. 가로로 넓은 구도."
    size: "1920x1080"

  - id: bg-kingdom
    desc: "왕국 맵 배경 — 조감도 시점의 동화 왕국, 초록 언덕과 강, 구름이 떠있는 푸른 하늘, 멀리 성이 보이는 따뜻한 풍경. 건물 배치 영역 5곳이 비어있는 구도."
    size: "1920x1080"

  - id: bg-board
    desc: "매치3 보드 프레임 — 금테 장식의 직사각형 보드 테두리, 모서리에 보석 장식, 내부는 반투명 어두운 배경. 보석 위에 겹치지 않는 프레임."
    size: "800x800"

  - id: bg-title
    desc: "타이틀 화면 배경 — 왕국의 성 전경, 하늘에 거대한 보석들이 떠있고, 아래에서 빛줄기가 올라오는 드라마틱한 구도. '보석 대전' 텍스트 들어갈 공간 상단."
    size: "1920x1080"

  - id: ui-board-cell
    desc: "보드 셀 배경 — 체커보드 패턴용 어두운 셀(#1a1a40)과 밝은 셀(#252550), 부드러운 라운드 모서리, 미세한 내부 그림자."
    size: "128x128"

  - id: ui-trophy
    desc: "트로피 아이콘 — 금색 우승컵, 보석 장식, 빛나는 하이라이트. PvP 트로피 표시용."
    size: "128x128"

  - id: ui-star
    desc: "별 아이콘 — 금색 5각 별, 중앙에서 빛이 퍼지는 효과, 글로시 질감. 솔로 레벨 클리어 보상 표시용."
    size: "128x128"

  - id: ui-hp-heart
    desc: "하트 아이콘 — 빨간 하트, 하이라이트와 그림자, 생명력/시도 횟수 표시용."
    size: "128x128"

  - id: ui-coin
    desc: "코인 아이콘 — 금화, 보석 문양 각인, 빛 반사, 부스터 구매용 화폐."
    size: "128x128"

  - id: ui-booster-hammer
    desc: "망치 부스터 아이콘 — 금색 망치, 보석 파편이 튀는 효과, 원형 프레임 안."
    size: "128x128"

  - id: ui-booster-swap
    desc: "교환 부스터 아이콘 — 두 개의 화살표가 교차하는 아이콘, 보석 2개가 위치를 바꾸는 모션, 원형 프레임 안."
    size: "128x128"

  - id: ui-booster-shuffle
    desc: "셔플 부스터 아이콘 — 소용돌이 회전 화살표, 보석들이 뒤섞이는 느낌, 원형 프레임 안."
    size: "128x128"

  - id: ui-booster-extra-turn
    desc: "추가턴 부스터 아이콘 — 모래시계 + '+1' 텍스트, 시간이 되돌아가는 느낌, 원형 프레임 안."
    size: "128x128"

  - id: ui-league-bronze
    desc: "브론즈 리그 배지 — 동색 방패 모양, 칼과 보석 장식, 'III' 로마숫자."
    size: "256x256"

  - id: ui-league-silver
    desc: "실버 리그 배지 — 은색 방패 모양, 날개 장식, 'II' 로마숫자."
    size: "256x256"

  - id: ui-league-gold
    desc: "골드 리그 배지 — 금색 방패 모양, 왕관 장식, 'I' 로마숫자."
    size: "256x256"

  - id: ui-league-platinum
    desc: "플래티넘 리그 배지 — 백금색 방패, 보석 날개, 빛나는 후광."
    size: "256x256"

  - id: ui-league-diamond
    desc: "다이아몬드 리그 배지 — 다이아몬드 결정 형태, 프리즘 빛 반사, 왕관+별 장식, 최상위 화려함."
    size: "256x256"

  - id: ui-turn-indicator
    desc: "턴 표시 화살표 — 현재 턴 플레이어를 가리키는 금색 화살표, 빛나는 테두리, 펄스 애니메이션용."
    size: "128x64"

  - id: ui-vs-emblem
    desc: "VS 엠블럼 — 화려한 'VS' 텍스트, 불꽃 이펙트, 대전 시작 연출용. 금색+빨간색."
    size: "512x512"

  - id: effect-match-burst
    desc: "매칭 폭발 이펙트 시퀀스 — 보석이 터지며 빛 파편이 방사형으로 퍼지는 4프레임 애니메이션. 밝은 흰색→색상→소멸."
    size: "512x128"
    frames: 4

  - id: effect-line-laser
    desc: "줄 파괴 레이저 이펙트 — 수평 레이저 빔, 중앙이 밝고 가장자리 글로우, 4프레임 시퀀스."
    size: "512x128"
    frames: 4

  - id: effect-bomb-shockwave
    desc: "폭탄 충격파 이펙트 시퀀스 — 중앙에서 원형으로 퍼지는 충격파, 4프레임. 밝은 빛→링→확산→소멸."
    size: "512x128"
    frames: 4

  - id: effect-rainbow-swirl
    desc: "레인보우 발동 이펙트 시퀀스 — 6색 무지개 소용돌이가 보드를 휩쓰는 4프레임."
    size: "512x128"
    frames: 4

  - id: effect-combo-text
    desc: "콤보 텍스트 팝업 시퀀스 — 'COMBO!', 'AWESOME!', 'INCREDIBLE!' 텍스트가 튀어나오는 4프레임. 금색 텍스트, 별 파티클."
    size: "512x128"
    frames: 4

  - id: effect-obstacle-send
    desc: "장애물 전송 이펙트 — 보석 파편이 상대 보드로 날아가는 궤적, 보라색 에너지 트레일, 4프레임."
    size: "512x128"
    frames: 4

  - id: effect-victory
    desc: "승리 이펙트 시퀀스 — 금색 폭죽, 별 비, 'VICTORY!' 텍스트, 4프레임."
    size: "512x128"
    frames: 4

  - id: effect-league-up
    desc: "리그 승급 이펙트 시퀀스 — 방패 배지가 빛나며 변환, 빛줄기 폭발, 4프레임."
    size: "512x128"
    frames: 4

  - id: particle-sparkle
    desc: "반짝임 파티클 텍스처 — 작은 4각 별 모양 빛 점, 중심이 밝고 외곽 알파 그라데이션, 보석 이동 시 트레일용."
    size: "64x64"

  - id: particle-star
    desc: "별 파티클 텍스처 — 5각 별 모양, 금색, 알파 그라데이션, 콤보/레벨업 연출용."
    size: "64x64"

  - id: particle-shard
    desc: "보석 파편 파티클 — 작은 삼각형 보석 조각, 다색, 매칭 시 흩어지는 파편용."
    size: "64x64"

  - id: building-gate
    desc: "성문 건물 — 왕국 구역 1 대표 건물, 거대한 성문과 탑, 깃발 펄럭임. 동화 판타지 스타일."
    size: "256x256"

  - id: building-garden
    desc: "정원 건물 — 왕국 구역 2 대표, 화려한 꽃밭과 분수대, 나비, 밝은 색감."
    size: "256x256"

  - id: building-market
    desc: "시장 건물 — 왕국 구역 3 대표, 천막 가판대와 상품들, 활기찬 분위기."
    size: "256x256"

  - id: building-library
    desc: "도서관 건물 — 왕국 구역 4 대표, 마법 탑과 떠다니는 책들, 신비로운 푸른 빛."
    size: "256x256"

  - id: building-throne
    desc: "왕좌실 건물 — 왕국 구역 5 대표, 웅장한 왕좌와 금장식, 붉은 카펫, 최종 구역의 위엄."
    size: "256x256"

  - id: gem-idle-sheet
    desc: "보석 대기 애니메이션 시트 — 6색 보석이 각각 미세하게 회전/반짝이는 4프레임. 총 24프레임 (6색×4프레임). 각 128×128."
    size: "3072x128"
    frames: 24

  - id: thumbnail
    desc: "게임 대표 이미지 — 중앙에 PvP 대전 장면(분할 화면 보드 2개), 양쪽에 왕 캐릭터와 상대 캐릭터가 대치, 상단에 '보석 대전' 한국어 제목 텍스트, 하단에 화려한 보석 파티클. 판타지 아레나 배경."
    size: "800x600"
```

---

## §9. 상태 머신 (State Machine)

### 9.1 상태 목록 (12상태)

```
STATE = {
  BOOT:          0,  // 에셋 로딩 + 초기화
  TITLE:         1,  // 타이틀 화면
  MODE_SELECT:   2,  // 솔로/PvP 모드 선택
  KINGDOM_MAP:   3,  // 왕국 건설 맵
  LEVEL_SELECT:  4,  // 솔로 레벨 선택
  PLAY:          5,  // 솔로 매치3
  PVP_MATCH:     6,  // PvP 대전
  PVP_RESULT:    7,  // PvP 결과 화면
  LEVEL_CLEAR:   8,  // 레벨 클리어
  LEVEL_FAIL:    9,  // 레벨 실패
  BUILD_SELECT: 10,  // 건설 3택 1
  SETTINGS:     11   // 설정/일시정지
}
```

### 9.2 TRANSITION_TABLE (화이트리스트)

```
TRANSITION_TABLE = {
  BOOT         → [TITLE],
  TITLE        → [MODE_SELECT, SETTINGS],
  MODE_SELECT  → [KINGDOM_MAP, PVP_MATCH, TITLE],
  KINGDOM_MAP  → [LEVEL_SELECT, BUILD_SELECT, MODE_SELECT, SETTINGS],
  LEVEL_SELECT → [PLAY, KINGDOM_MAP],
  PLAY         → [LEVEL_CLEAR, LEVEL_FAIL, SETTINGS],
  PVP_MATCH    → [PVP_RESULT, SETTINGS],
  PVP_RESULT   → [MODE_SELECT, PVP_MATCH, BUILD_SELECT],
  LEVEL_CLEAR  → [BUILD_SELECT, KINGDOM_MAP, LEVEL_SELECT],
  LEVEL_FAIL   → [PLAY, LEVEL_SELECT, KINGDOM_MAP],
  BUILD_SELECT → [KINGDOM_MAP],
  SETTINGS     → [이전 상태로 복귀 — settingsReturnState 변수 사용]
}
```

### 9.3 상태 전환 ASCII 다이어그램

```
[BOOT] → [TITLE] → [MODE_SELECT]
                         ├─── 솔로 ──→ [KINGDOM_MAP] ←──┐
                         │                  ↓            │
                         │            [LEVEL_SELECT]     │
                         │                  ↓            │
                         │              [PLAY]           │
                         │              ↙    ↘          │
                         │    [LEVEL_FAIL] [LEVEL_CLEAR] │
                         │         ↓            ↓        │
                         │       (재시도)  [BUILD_SELECT]─┘
                         │
                         └─── PvP ──→ [PVP_MATCH]
                                          ↓
                                     [PVP_RESULT]
                                      ↙      ↘
                              (재대전)  [BUILD_SELECT]→[KINGDOM_MAP]

         * [SETTINGS]은 PLAY/PVP_MATCH/KINGDOM_MAP에서 진입 가능
           settingsReturnState로 정확히 복귀
```

---

## §10. 상태×시스템 매트릭스

| 시스템＼상태 | BOOT | TITLE | MODE_SEL | K_MAP | LVL_SEL | PLAY | PVP | PVP_RES | LVL_CLR | LVL_FAIL | BUILD | SETTINGS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **TweenManager** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌pause |
| **ParticleManager** | ❌ | ✅bg | ✅bg | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌pause |
| **InputHandler** | ❌ | tap | tap | map | tap | board | board | tap | tap | tap | tap | tap |
| **AudioManager** | init | bgm | bgm | bgm | bgm | bgm+sfx | bgm+sfx | sfx | sfx | sfx | sfx | ❌muted |
| **Board (gGrid)** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅solo | ✅pvp×2 | ❌ | ❌ | ❌ | ❌ | pause |
| **AI System** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **DDA** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **SaveManager** | load | ❌ | ❌ | save | ❌ | ❌ | ❌ | save | save | ❌ | save | ❌ |

> ⚠️ SETTINGS 진입 시: TweenManager.pause(), ParticleManager.pause(), AudioManager.mute()
> ⚠️ SETTINGS 퇴장 시: resume() 일괄 호출. Board 상태는 그대로 유지.

---

## §11. 기술 요구 사항

### 11.1 구현 규칙 (C50 교훈 반영)
1. **단일 HTML 파일** — `index.html` 하나에 전체 구현
2. **함수 오버라이드 0건 정책** — `function f()` 재선언 금지. 기능 분기는 `stateHandlers` 맵 또는 if/else
3. **TDZ 방어** — Engine 생성자 콜백에서 참조하는 모든 변수는 생성자 **이전에** let/const 선언. `_ready` 플래그 패턴 사용
4. **input.flush()** — `coreRender()` 함수 마지막에 배치. update의 finally 아님
5. **gFadeProxy 제거** — `tweenManager.fadeTo(gFadeAlpha, target, duration, callback)` 직접 사용
6. **state 직접 할당 0건** — `gState = STATE.X` 금지. 반드시 `beginTransition()` 또는 `directTransition()` 사용
7. **safeGridAccess(r, c)** — gGrid 직접 접근 0건. 범위 검사 래퍼 필수
8. **coreUpdate() / coreRender() 단일 진입점** — 모든 상태의 update/render가 여기서 분기
9. **섹션 인덱스** — 코드 상단에 `// === SECTION INDEX ===` 목차 배치
10. **PvP 보드 분리** — `gPlayerBoard[][]`와 `gOpponentBoard[][]` 완전 독립. 공유 변수 0건

### 11.2 코드 구조 (상단→하단 순서)
```
[0000~0050] 섹션 인덱스 + 상수 (CONFIG, STATE, TRANSITION_TABLE)
[0050~0200] 공용 엔진 (SeededRNG, ObjectPool, TweenManager)
[0200~0350] TransitionGuard + enterState() + deferredTransition 큐
[0350~0450] InputHandler (MAP/PLAY/PVP 분리)
[0450~0550] AudioManager (Web Audio API)
[0550~0650] SaveManager (localStorage + try-catch + 버전 마이그레이션)
[0650~0900] 매치3 엔진 (findMatches, removeMatches, gravity, cascade)
[0900~1100] 스페셜 보석 시스템 (생성, 발동, 조합)
[1100~1300] PvP 시스템 (턴 관리, 장애물 전송, AI)
[1300~1500] 왕국 건설 시스템
[1500~1700] DDA + 레벨 데이터 (30레벨)
[1700~1900] 리그 시스템 + 일일 챌린지
[1900~2200] 렌더링 (배경, 보드, UI, 이펙트, 파티클)
[2200~2400] stateHandlers 맵 (12상태 × update/render)
[2400~2500] 에셋 로더 + manifest.json + drawAssetOrFallback()
[2500~2600] 메인 루프 + 초기화
```

### 11.3 PvP 보드 관리
```javascript
// 두 보드 완전 독립 관리
let gPlayerBoard = [];    // 8×8 플레이어 보드
let gOpponentBoard = [];  // 8×8 AI 보드

// 보드 초기화 (같은 시드)
function initPvpBoards(seed) {
  const rng = new SeededRNG(seed);
  gPlayerBoard = generateBoard(rng);
  // 같은 시드로 재생성하여 동일 보드
  const rng2 = new SeededRNG(seed);
  gOpponentBoard = generateBoard(rng2);
}
```

---

## §12. 사전 체크리스트 (코더 자가 검증)

### TDZ/선언 순서 체크
- [ ] Engine/Canvas 생성 이전에 gPlayerBoard, gOpponentBoard, gFadeAlpha, gBgCache 등 모든 전역 변수 선언 완료
- [ ] enterState() 콜백 내에서 참조하는 변수가 enterState 정의 이전에 선언되었는가
- [ ] stateHandlers 맵의 모든 핸들러 함수가 맵 정의 이전에 선언되었는가

### 상태 전환 체크
- [ ] TRANSITION_TABLE에 정의되지 않은 전환이 코드에 존재하지 않는가
- [ ] `gState = STATE.X` 직접 할당이 0건인가
- [ ] SETTINGS → 복귀 시 settingsReturnState가 올바르게 저장/복원되는가
- [ ] LEVEL_FAIL → PLAY 재시작 시 보드, 점수, 턴, 콤보, 장애물 전부 초기화되는가

### 매치3 엔진 체크
- [ ] consumed[][] 매치 소비 추적이 모든 매치 검출에 적용되는가
- [ ] 초기 보드에 3매치 이상이 존재하지 않는가 (generateBoard 검증)
- [ ] 유효 이동 0개 시 셔플이 정상 동작하는가
- [ ] 캐스케이드 중 입력이 차단되는가 (isInputBlocked())

### PvP 체크
- [ ] 장애물 전송이 캐스케이드 완료 후에만 실행되는가
- [ ] AI 턴 중 플레이어 입력이 완전 차단되는가
- [ ] 20턴 종료 후 승패 판정이 정확한가 (동점 처리 포함)
- [ ] 트로피 증감이 리그에 따라 올바르게 적용되는가

### 에셋/렌더링 체크
- [ ] manifest.json의 모든 에셋 ID가 코드에서 drawAssetOrFallback()로 참조되는가
- [ ] Canvas 폴백이 모든 에셋에 구현되었는가
- [ ] input.flush()가 coreRender() 마지막에 배치되었는가
- [ ] 터치 타겟이 모두 48px 이상인가

---

## §13. 에셋-코드 교차 검증 체크리스트

```javascript
// validateAssets() — BOOT 상태 완료 직후 실행
function validateAssets() {
  const required = [
    'gem-red','gem-blue','gem-green','gem-yellow','gem-purple','gem-orange',
    'special-line-h','special-line-v','special-bomb','special-rainbow',
    'obstacle-ice-1','obstacle-ice-2','obstacle-chain','obstacle-stone',
    'obstacle-lock','obstacle-poison',
    'char-king','char-king-happy','char-king-worried',
    'char-opponent-1','char-opponent-2','char-opponent-3',
    'bg-arena','bg-kingdom','bg-board','bg-title',
    'ui-board-cell','ui-trophy','ui-star','ui-hp-heart','ui-coin',
    'ui-booster-hammer','ui-booster-swap','ui-booster-shuffle','ui-booster-extra-turn',
    'ui-league-bronze','ui-league-silver','ui-league-gold','ui-league-platinum','ui-league-diamond',
    'ui-turn-indicator','ui-vs-emblem',
    'effect-match-burst','effect-line-laser','effect-bomb-shockwave',
    'effect-rainbow-swirl','effect-combo-text','effect-obstacle-send',
    'effect-victory','effect-league-up',
    'particle-sparkle','particle-star','particle-shard',
    'building-gate','building-garden','building-market','building-library','building-throne',
    'gem-idle-sheet','thumbnail'
  ];
  const missing = required.filter(id => !gAssets[id]);
  if (missing.length > 0) {
    console.warn('[AssetValidation] Missing assets (fallback active):', missing);
  }
}
```

---

## §14. 엣지 케이스 매트릭스 (20개 시나리오)

| # | 시나리오 | 예상 동작 |
|---|---------|-----------|
| 1 | 초기 보드에 3매치 존재 | generateBoard()가 재생성. 최대 100회 시도 |
| 2 | 유효 이동 0개 (데드록) | 자동 셔플 3회. 실패 시 보드 재생성 |
| 3 | 캐스케이드 중 스왑 입력 | isInputBlocked() = true, 입력 무시 |
| 4 | 스페셜+스페셜 조합 후 캐스케이드 | 조합 효과 선 적용 → 이후 캐스케이드 정상 진행 |
| 5 | 레인보우+레인보우 보드 전체 클리어 | 전체 클리어 후 보드 리필 → 매치 재검사 |
| 6 | PvP 장애물 전송으로 상대 보드 꽉 참 | 빈 칸이 없으면 전송 무시 (최대 전송 = 빈칸 수) |
| 7 | PvP 독이 보드 전체 점령 | 독이 보드 60% 이상 점령 시 강제 독 제거 3개 |
| 8 | 부스터 사용 후 즉시 턴 종료 | 부스터는 턴을 소비하지 않음 (PvP에서만 대전 당 1회 제한) |
| 9 | 망치로 스페셜 보석 파괴 | 스페셜 발동 없이 단순 제거 |
| 10 | DDA 최대 보정 + 여전히 실패 | failStreak 6+ 시 '이 레벨 건너뛰기' 버튼 표시 |
| 11 | localStorage 용량 초과 | try-catch로 잡고 가장 오래된 일일 챌린지 기록 삭제 후 재시도 |
| 12 | localStorage 스키마 버전 불일치 | 마이그레이션 함수 실행. 실패 시 초기화 + 경고 |
| 13 | PvP AI 턴에 유효 이동 0개 | AI 보드 자동 셔플 (시각적으로 표시) |
| 14 | 리그 강등 (트로피 0 이하) | 최소 트로피 = 0, 브론즈 리그 이하로 강등 없음 |
| 15 | 솔로 레벨 클리어 + 별 3개 + 건설 완료 | BUILD_SELECT → 구역 완료 연출 → KINGDOM_MAP |
| 16 | PvP 동점 | 마지막 콤보 점수 비교. 그것도 동점이면 무승부 처리 |
| 17 | 설정에서 음소거 후 PvP 진입 | 음소거 상태 유지. bgm/sfx 별도 제어 |
| 18 | 터치+마우스 동시 입력 | 첫 번째 입력만 처리, 두 번째 무시 (inputLock 플래그) |
| 19 | 캐스케이드 10연쇄 이상 | 콤보 배율 ×3.0 캡. 파티클 증가하되 60fps 유지 (ObjectPool 재활용) |
| 20 | 왕국 5구역 전부 완성 후 추가 별 | "왕국 완성!" 축하 화면 + 잉여 별은 코인으로 자동 변환 |

---

## §15. 오디오 설계

### Web Audio API (C5+ 표준)
```javascript
// ctx.currentTime + offset 패턴. setTimeout 0건.
const SOUNDS = {
  gemSwap:      { freq: [440, 520], dur: 0.1, type: 'sine' },
  match3:       { freq: [523, 659, 784], dur: 0.15, type: 'triangle' },
  match4:       { freq: [523, 659, 784, 880], dur: 0.2, type: 'triangle' },
  match5:       { freq: [523, 659, 784, 880, 1047], dur: 0.25, type: 'triangle' },
  specialCreate:{ freq: [880, 1047, 1319], dur: 0.3, type: 'sine' },
  bombExplode:  { freq: [220, 110, 55], dur: 0.4, type: 'sawtooth' },
  lineDestroy:  { freq: [440, 880, 1760], dur: 0.3, type: 'square' },
  rainbowActivate: { freq: [262, 330, 392, 523, 659, 784], dur: 0.5, type: 'sine' },
  obstacleSend: { freq: [330, 220, 165], dur: 0.3, type: 'sawtooth' },
  pvpVictory:   { freq: [523, 659, 784, 1047, 1319], dur: 0.6, type: 'triangle' },
  pvpDefeat:    { freq: [440, 330, 220], dur: 0.5, type: 'sawtooth' },
  leagueUp:     { freq: [523, 659, 784, 880, 1047, 1319, 1568], dur: 0.8, type: 'sine' },
  buttonClick:  { freq: [660], dur: 0.05, type: 'sine' },
  turnChange:   { freq: [440, 550], dur: 0.15, type: 'triangle' },
  comboHit:     { freq: [880, 1100, 1320], dur: 0.2, type: 'triangle' }
};
```

### BGM
- 절차적 생성 루프 BGM: Cmaj7 → Fmaj7 → G7 → Cmaj7 코드 진행
- PvP 대전 시: 템포 +20%, 마이너 코드 혼합으로 긴장감
- 왕국 맵: 느린 템포, 따뜻한 메이저 코드

---

## §16. 게임 페이지 사이드바 데이터

```yaml
game:
  title: "보석 대전"
  description: "Match Masters 스타일 1v1 턴 기반 PvP 매치3! 스페셜 보석 콤보로 상대 보드에 장애물을 보내고, 리그를 승급하며 왕국을 건설하세요."
  genre: ["puzzle", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "마우스 드래그: 보석 스왑"
    - "터치 스와이프: 보석 스왑 (모바일)"
    - "ESC: 일시정지"
    - "1~4: 부스터 선택"
    - "Space: 턴 건너뛰기 (PvP)"
  tags:
    - "#매치3"
    - "#PvP대전"
    - "#턴제전략"
    - "#왕국건설"
    - "#보석퍼즐"
    - "#리그경쟁"
  addedAt: "2026-03-29"
  version: "1.0.0"
  featured: true
```

---

## §17. 다국어 지원 (Phase 2)

```javascript
const I18N = {
  ko: {
    title: '보석 대전',
    solo: '솔로 어드벤처',
    pvp: 'PvP 대전',
    victory: '승리!',
    defeat: '패배...',
    draw: '무승부',
    turn: '턴',
    score: '점수',
    trophy: '트로피',
    league: '리그',
    kingdom: '왕국',
    build: '건설하기',
    booster: '부스터',
    settings: '설정',
    sound: '소리',
    music: '음악',
    language: '언어',
    daily: '일일 챌린지',
    combo: '콤보',
    yourTurn: '당신의 턴!',
    opponentTurn: '상대의 턴...',
  },
  en: {
    title: 'Gem Arena',
    solo: 'Solo Adventure',
    pvp: 'PvP Battle',
    victory: 'Victory!',
    defeat: 'Defeat...',
    draw: 'Draw',
    turn: 'Turn',
    score: 'Score',
    trophy: 'Trophy',
    league: 'League',
    kingdom: 'Kingdom',
    build: 'Build',
    booster: 'Booster',
    settings: 'Settings',
    sound: 'Sound',
    music: 'Music',
    language: 'Language',
    daily: 'Daily Challenge',
    combo: 'Combo',
    yourTurn: 'Your Turn!',
    opponentTurn: "Opponent's Turn...",
  }
};
```

---

## §18. 일일 챌린지 (C50 계승)

- **SeededRNG 날짜 시드**: `seed = YYYYMMDD` → 매일 동일 챌린지
- **챌린지 유형 8종**:
  1. SCORE_RUSH: 15턴 내 최고 점수
  2. BOMB_MASTER: 폭탄만으로 목표 점수
  3. LINE_CLEAR: 라인 스페셜 10개 생성
  4. RAINBOW_HUNT: 레인보우 3개 생성
  5. NO_BOOSTER: 부스터 없이 레벨 클리어
  6. SPEED_RUN: 30초 내 최대 매치 수
  7. COMBO_KING: 5콤보 이상 3회 달성
  8. OBSTACLE_BREAKER: 장애물 30개 파괴

---

_기획서 작성 완료. 에셋 51개, 상태 12개, 솔로 30레벨 + PvP 리그 5단계._
_다음 단계: 디자이너에게 §8 에셋 목록 전달 → 코더에게 전체 기획서 전달._
