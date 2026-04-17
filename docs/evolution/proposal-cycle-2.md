---
cycle: 2
basedOn: [1, 2]
generatedAt: 2026-04-18T00:00:00.000Z
---

# Evolution Proposal — Cycle 2

## 추세 요약

| Discipline  | 1  | 2  | Trend     | Action |
|-------------|----|----|-----------|--------|
| planning    | 98 | 95 | DECLINING (Δ-3.8, LOW 신뢰도 — refChainValid 1→0.75 1건) | — |
| development | 56 | 60 | IMPROVING (Δ+3.9, engineAdoption 0.20→0.24, onResetCoverage 0.06→0.21) | YES (#1) — 측정 버그 |
| art         | 68 | 58 | DECLINING (Δ-10.0, stylePurity 0.5 2회 반복 + thumbnail true→false) | YES (#2, #3) |
| qa          | 80 | 80 | STABLE (firstRoundVerdict=NEEDS_MINOR_FIX 2회 반복) | YES (#3 cross-cut) |

**신뢰도**: LOW (2사이클 스냅샷). 따라서 단일 사이클의 저점만으로는 제안 금지.
아래 제안들은 모두 **2사이클 교차 확인된 구조적 패턴** 또는 **명백한 측정 버그**만 대상으로 함.

**우선순위 근거**:
- art DECLINING + 2사이클 교차 확인된 근본 원인(designer wisdom #1, platform-wisdom #1,#2) → **최우선**.
- development 측정이 여전히 0을 보고(enginePromotions=0 in both cycles despite 2+5 real promotions) → 측정 버그 **즉시 수정**.
- qa 정체 + cycle-2 포스트모템이 "1차 리뷰 통과율 개선" 명시 제안 → 코더 셀프체크로 구조 강화.
- planning: 단일 샘플 차이(1건 ref 실패) 뿐 → 제안 없음.

---

## 제안 #1
- discipline: development
- pattern: cycle-1 적용 fix 이후에도 enginePromotions 여전히 0 (cycle-1 2건, cycle-2 2건 실제 승격). 원인: `(##|$)` 가 `### 1. IX.Pool` 의 `##` 와 일치하여 섹션 본문을 **0바이트**로 캡처. 모든 승격 노트는 `## 승격\n\n### 1. ...` 형식이므로 항상 0이 반환됨.
- category: METRIC_FIX
- safety: MEDIUM
- title: enginePromotions 캡처 종료 앵커를 `##(?!#)` 로 수정하여 `###` 헤더 오인식 방지
- target-file: agents/src/metrics.ts
- rationale:
  - **근본 원인**: 정규식 `/##\s*승격(?:\s*완료)?([\s\S]*?)(##|$)/` 의 종료 앵커 `(##|$)` 가 `###` 의 앞 `##` 과 매치됨. cycle-1-promotion.md / cycle-2-promotion.md 모두 `## 승격\n\n### 1. XXX` 구조라 바로 0바이트 캡처 후 종료. cycle-1 적용 proposal 은 `완료?` → `(?:\s*완료)?` 만 고쳤으므로 이 잔존 버그는 그대로.
  - **영향 범위**: `scoreDevelopment` 함수 내부 regex 1줄만 수정. `promoSection` 바인딩은 metrics.ts 내 단 1곳(grep 확인). 다른 파일·agent 프롬프트·cycle.ts phase 에 영향 없음.
  - **하위호환**: signal 이름·타입·공식 불변. 단지 enginePromotions 값이 0 → 실제 승격 entry 수로 정확히 계산됨. 이미 저장된 cycle-1.json·cycle-2.json 은 재계산되지 않으므로 변경 없음. 점수 상한은 `Math.min(15, enginePromotions * 5)` 로 **15점 캡** 유지 → 급격한 점수 점프 없음.
  - **부작용 검토**: 새 regex `##(?!#)` 은 `###` (단 `##` 뒤에 `#` 또 있는 경우) 만 배제. 정상 섹션 경계(`## 보류`, `## 향후`)는 정확히 매치. negative lookahead 라 기존 매치를 **축소만** 하지 확장하지 않음 → 거짓 양성 리스크 없음.
  - **영향받는 코드 경로**: `metrics.ts:161` 한 줄. 테스트 대상은 다음 사이클 cycle-3.json 의 enginePromotions 값이 0 이 아닌 실제 entry 수를 반영하는지.
  - **rollback**: `git tag -d evolve/cycle-2 && git reset --hard HEAD~1`

```diff-old (path: agents/src/metrics.ts)
  const promoSection = inp.enginePromotionText.match(/##\s*승격(?:\s*완료)?([\s\S]*?)(##|$)/)
```
```diff-new
  const promoSection = inp.enginePromotionText.match(/##\s*승격(?:\s*완료)?([\s\S]*?)(##(?!#)|$)/)
```

---

## 제안 #2
- discipline: art
- pattern: stylePurity 0.5 **2사이클 연속** + designer wisdom #1 [Cycle 1,2] "Gemini 캐릭터 변형 일관성 붕괴" + platform-wisdom #1 [Cycle 1,2] "에셋 변형을 다른 포맷/스타일로 대체" + cycle-2 postmortem "제안 #1 에셋 완성도 강화 — 파이프라인 레벨에서 해결해야 한다". player-hurt, player-attack, player-idle-sheet, boss-phase2 등 **base+ref** 구조의 변형 에셋이 매 사이클 다른 인물로 생성되어 스타일 이질감이 큰 art 점수 하락의 주 원인.
- category: PROMPT_RULE
- safety: LOW
- title: 디자이너 프롬프트에 "캐릭터 변형 에셋은 SVG로 직접 제작" 강제 규칙 추가
- target-file: agents/src/team.ts
- rationale:
  - **추가만 하는 변경**: designer 프롬프트의 `⚠️ 아트 디렉션 준수 원칙:` 블록 바로 **뒤에 새 불릿 섹션**을 삽입. 기존 4개 원칙(art-style 준수, 시각적 통일감, 레퍼런스 참고, 스타일 불일치 금지) 불변. 1단계/2단계 절차·에셋 목록·파일 크기 기준 모두 불변.
  - **LOW 판정 근거**:
    1. 기존 동작 경로에 영향 0 — 새 규칙은 "변형 에셋(ref 필드 있음)은 .svg 로만 제작" 을 지시할 뿐, 기존 base 에셋(.png 또는 .svg) 생성 로직에 영향 없음.
    2. Gemini PNG 자동 생성 파이프라인(image/prompts.ts, image/verify.ts)은 건드리지 않음 → 자동화 코드 변경 없음.
    3. 이미 designer wisdom "다음 사이클 적용 사항 #1" 에 같은 내용이 있으나 프롬프트 레벨에서 강제되지 않아 2사이클 연속 실패 → 프롬프트에 박아 강제.
  - **영향받는 파일·경로**: `agents/src/team.ts` 내 designer.prompt 문자열 단일 위치. diff-old 가 team.ts 전체에서 유일함(grep 확인: `⚠️ 아트 디렉션 준수 원칙:` 1회만 존재).
  - **wisdom 교차 근거**:
    - designer wisdom [Cycle 1,2] #1: "ref 필드만으로는 AI 이미지 생성기가 동일 캐릭터를 보장 못함. Cycle 2에서도 3종 모두 불일치 재현."
    - platform-wisdom [Cycle 1,2] #1: "SVG 벡터가 PNG 픽셀아트와 이질감 유발. player-hurt, idle-sheet 등 변형은 반드시 원본과 동일 포맷+스타일."
    - designer wisdom 다음 사이클 적용 사항 #1: "캐릭터 변형 에셋은 반드시 SVG로 직접 제작 — Gemini ref 필드는 2사이클 연속 실패. base PNG를 참고해 SVG 변형을 만드는 것이 유일한 일관성 보장 방법."
  - **실패 시 rollback**: `git tag -d evolve/cycle-2 && git reset --hard HEAD~1`

```diff-old (path: agents/src/team.ts)
⚠️ 아트 디렉션 준수 원칙:
- 기획서에서 정의한 아트 스타일(art-style 필드)을 **엄격히** 따라야 합니다.
- 모든 에셋은 시각적 통일감을 유지해야 합니다 (동일한 라이팅 방향, 동일한 색상 팔레트, 동일한 렌더링 스타일).
- 유사한 아트 디렉션을 가진 Steam 인디 게임이나 모바일 게임을 레퍼런스로 참고하세요.
- 에셋 간 스타일 불일치(예: 캐릭터는 픽셀아트인데 배경은 수채화)는 절대 금지입니다.
```
```diff-new
⚠️ 아트 디렉션 준수 원칙:
- 기획서에서 정의한 아트 스타일(art-style 필드)을 **엄격히** 따라야 합니다.
- 모든 에셋은 시각적 통일감을 유지해야 합니다 (동일한 라이팅 방향, 동일한 색상 팔레트, 동일한 렌더링 스타일).
- 유사한 아트 디렉션을 가진 Steam 인디 게임이나 모바일 게임을 레퍼런스로 참고하세요.
- 에셋 간 스타일 불일치(예: 캐릭터는 픽셀아트인데 배경은 수채화)는 절대 금지입니다.

⚠️ 변형 에셋(ref 필드 있음)은 **반드시 SVG로 직접 제작** (Cycle 1·2 반복 지적):
- ref 필드(예: player-hurt → ref: "player", enemy-boss-phase2 → ref: "enemy-boss") 로 base 를 참조하더라도, Gemini PNG 생성기는 동일 인물 일관성을 보장하지 못함. Cycle 1·2 에서 player/player-hurt/player-idle-sheet 전부 **서로 다른 인물**로 생성된 사례가 designer/platform wisdom 에 2회 연속 기록됨.
- 따라서 ref 필드가 있는 모든 변형 에셋은 .png 로 두지 말고, base PNG 를 Read 로 열어 시각적으로 확인한 뒤 **동일 팔레트·동일 실루엣·동일 스타일 cue** 를 적용한 .svg 를 Write 로 직접 제작할 것. manifest.json 의 해당 항목 "file" 확장자도 .svg 로 맞춰야 함.
- 반투명/밝은색 소형 오브젝트(아이템, 보석, 파티클)도 PNG 생성 불안정 → 처음부터 SVG + glow 필터로 제작 권장.
```

---

## 제안 #3
- discipline: qa
- pattern: **2사이클 연속 firstRoundVerdict=NEEDS_MINOR_FIX** + cycle-2 postmortem "제안 #3: 1차 리뷰 통과율 개선 — 개발 완료 후 셀프 체크리스트(IX API 준수, 버튼 크기, 에셋 일관성)를 돌려 1차 통과를 목표로 하자" + **2사이클 연속 thumbnail 문제**(cycle-1 불일치, cycle-2 누락, platform-wisdom #2) + cycle-2 특유 버그(GameFlow.init 커스텀 씬 덮어씀, Layout.fontSize 바인딩 손실 — reviewer wisdom #5,#6). 코더가 제출 직전 self-check 를 돌면 1차 리뷰 회차가 줄어듦.
- category: PROMPT_RULE
- safety: LOW
- title: 코더 프롬프트에 "제출 전 최종 체크리스트" 섹션 추가 (썸네일 필수, GameFlow.init 커스텀 씬 명시, Layout 유틸 래핑, resetGameState 전수 나열)
- target-file: agents/src/team.ts
- rationale:
  - **추가만 하는 변경**: 코더 프롬프트의 `위 6가지 중 하나라도 위반하면 리뷰에서 NEEDS_MAJOR_FIX.` 와 `## IX Engine 사용법 (반드시 사용할 것!)` 사이에 **새 섹션** 1개 삽입. 기존 최우선 규칙 (1)~(6), IX Engine 사용법, 이후 모든 지시 불변.
  - **LOW 판정 근거**:
    1. 기존 동작에 영향 0 — 새 섹션은 "제출 직전 자체 점검" 만 지시. cycle.ts phase 순서, reviewer 검증 로직, metrics.ts 공식 모두 건드리지 않음.
    2. 원래의 "위 6가지 중 하나라도 위반하면 NEEDS_MAJOR_FIX" 문장 불변 → 기존 판정 임계값 유지.
    3. 체크리스트 항목은 이미 발견된 wisdom 의 재명시일 뿐 신규 규칙 강제 아님.
  - **영향받는 파일·경로**: `agents/src/team.ts` 의 coder.prompt 문자열 단일 위치. diff-old 블록의 3줄 연속 텍스트는 team.ts 에 유일(grep 확인 — `위 6가지 중 하나라도 위반하면 리뷰에서 NEEDS_MAJOR_FIX.` 1회 존재).
  - **wisdom 교차 근거**:
    - platform-wisdom #2 [Cycle 1,2]: "thumbnail 미생성/불일치 — 2사이클 연속 지적"
    - platform-wisdom #5 [Cycle 2]: "Layout.fontSize 바인딩 손실 — 화살표 래퍼/바인드 필요"
    - platform-wisdom #6 [Cycle 2]: "GameFlow.init 이 커스텀 씬 덮어씀 — title 명시 전달"
    - coder-wisdom 성공 패턴 #2 [Cycle 1,2]: "resetGameState() 모든 전역 변수 빠짐없이 나열"
    - cycle-2 postmortem "다음 사이클 제안 #3": "개발 완료 후 셀프 체크리스트를 돌려 1차 통과를 목표로 하자"
  - **보완성**: cycle-1 적용된 "reviewer 0단계 피드백 문서" 는 **리뷰 후** 루프 강화, 본 제안은 **리뷰 전** 코더 자체 검수 강화 → 두 축이 상호 보완적이며 충돌하지 않음.
  - **실패 시 rollback**: `git tag -d evolve/cycle-2 && git reset --hard HEAD~1`

```diff-old (path: agents/src/team.ts)
위 6가지 중 하나라도 위반하면 리뷰에서 NEEDS_MAJOR_FIX.

═══════════════════════════════════════════════════
## IX Engine 사용법 (반드시 사용할 것!)
═══════════════════════════════════════════════════
```
```diff-new
위 6가지 중 하나라도 위반하면 리뷰에서 NEEDS_MAJOR_FIX.

═══════════════════════════════════════════════════
## 🧪 제출 전 최종 셀프 체크 (리뷰어에게 넘기기 직전 필수 실행)
═══════════════════════════════════════════════════

Cycle 1·2 모두 1차 리뷰에서 NEEDS_MINOR_FIX 판정. 아래 항목을 **모두 확인**한 뒤 리뷰어에게 인계하세요.
하나라도 누락 시 1차 리뷰에서 반려될 확률이 매우 높습니다 (platform-wisdom 교차 확인).

1. **썸네일 존재 확인** (platform-wisdom #2, 2사이클 연속 지적):
   \`Bash: ls public/games/[game-id]/assets/thumbnail.*\` — thumbnail.png 또는 thumbnail.svg 중 하나가 **반드시 존재**해야 함. 없으면 플랫폼 게임 리스트에서 기본 이미지로 표시되어 완성도 저하. 없으면 thumbnail.svg 를 직접 작성(게임 제목 + 대표 캐릭터 + 배경) 후 다시 리뷰 요청.

2. **GameFlow.init 커스텀 씬 명시 전달** (platform-wisdom #6, Cycle 2 치명 버그):
   커스텀 TITLE/DIFF_SELECT 등을 \`IX.Scene.register\` 로 만들었다면, 반드시 \`GameFlow.init({ title: Scene._states.TITLE, play: Scene._states.PLAY, ... })\` 형태로 **각 씬을 명시 전달**. 생략 시 init() 이 기본 TITLE 로 덮어써 커스텀 흐름이 죽은 코드가 됨.

3. **엔진 유틸리티 바인딩 손실 방지** (platform-wisdom #5, Cycle 2 HUD 미렌더링 원인):
   \`Layout.fontSize\`, \`MathUtil.*\` 등 엔진 유틸을 자주 참조하는 지점에 분해할당 or 직접 호출. 분해할당 시 this 바인딩 손실 가능하므로, 아래 중 하나:
   - \`const fontSize = (...args) => IX.Layout.fontSize(...args)\` (화살표 래퍼)
   - \`IX.Layout.fontSize.bind(IX.Layout)\`
   - 그냥 매 호출마다 \`IX.Layout.fontSize(...)\` 전체 경로 사용.

4. **resetGameState() 전역 변수 전수 나열** (coder-wisdom 성공 패턴 #2):
   \`onReset\` 콜백에서 **모든** 전역/모듈 변수·배열·맵·플래그·타이머·IX.Pool 인스턴스를 명시적으로 초기화. 풀은 \`pool.releaseAll()\` 필수. 빠진 항목이 하나라도 있으면 3회 재시작 테스트에서 누수 감지.

5. **IX.Button 전면 사용 확인** (reviewer wisdom #6):
   \`grep -n "UI.hitTest\\|inp.tapped\\|canvas.addEventListener" index.html\` 로 커스텀 히트테스트 잔존 확인. 레벨업 카드/인벤토리/오버레이도 IX.Button 으로 구현했는지 재확인.

6. **44px 미달 버튼 경고 확인** (cycle-1 evolve-proposal 적용 결과):
   브라우저 콘솔에 \`[IX.Button] tap target under 44px\` 경고가 뜨는지 Puppeteer/수동 실행 중 확인. 뜨면 해당 버튼의 w/h 를 Math.max(44, ...) 이상으로 조정.

═══════════════════════════════════════════════════
## IX Engine 사용법 (반드시 사용할 것!)
═══════════════════════════════════════════════════
```

---

## 제안 없음 (planning)

- **planning** (98→95, Δ-3.8): 단일 사이클 비교에서 refChainValid 1→0.75 단 1건 차이가 점수 하락의 전부. 2사이클은 샘플 부족이며, 본문·genre/style 중복 지표는 모두 이상 없음. planner 프롬프트는 cycle-2 에서 postmortem 학습 반영·성능 가이드 등 성공 패턴이 다수 추가되어 오히려 구조가 양호 → 무리한 개입 금지. cycle-3 에서 refChainValid 추가 하락 시 재평가.

## 체크리스트

- [x] 2사이클 metrics / postmortem / wisdom / engine-promotion 모두 읽음
- [x] 디시플린별 추세 판정표 작성 + LOW 신뢰도 명시
- [x] DECLINING (art) 우선, 측정 버그(development) 병행
- [x] 제안 ≤ 6개 (총 3개, discipline당 최대 2개 준수: art 1·dev 1·qa 1)
- [x] 각 제안에 diff block 포함 (apply-proposal.ts 파싱 형식 준수)
- [x] LOW 판정 (#2, #3) 에 "기존 동작 영향 없음" 근거 명시
- [x] MEDIUM 판정 (#1) 에 영향 범위·하위호환·rollback 3항목 포함
- [x] diff-old 텍스트가 target-file 에 유일함 grep 확인 완료 (metrics.ts:161, team.ts:271-275, team.ts:458-461)
- [x] cycle-1 적용된 3건과 중복 없음 확인
