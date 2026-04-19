---
cycle: 5
basedOn: [3, 4, 5]
generatedAt: 2026-04-19T13:00:00.000Z
---

# Evolution Proposal — Cycle 5

## 추세 요약

| Discipline  | 3  | 4  | 5  | Trend | Action |
|-------------|----|----|----|-------|--------|
| planning    | 92 | 92 | 91 | STABLE (Δ-1.6) — specCompleteness 0.833 3사이클 고정, refChainValid 0.875→0.867→0.769 소폭 하락 | — (상승여지 얇음, 과적합 위험) |
| development | 62 | 54 | 64 | VOLATILE (Δ+1.6) — enginePromotions 0→0→**13**(승격탐지 복구), engineAdoption 0.134→0.107→0.153(회복), 그러나 onResetCoverage 0.556→0.083→**0.000**(catastrophic) | **YES (#1)** — onReset 측정 회귀 |
| art         | 50 | 58 | 68 | **IMPROVING** (Δ+17.1) — thumbnailFromGameAssets false→false→**true**(회복), charConsistency 0.71→1.0→1.0, 그러나 stylePurity **0.5 고정** 3사이클 | **YES (#2)** — stylePurity 토큰화 |
| qa          | 95 | 95 | 95 | STABLE (측정 기준) — 그러나 cycle-5 실제는 6차 리뷰였는데 reviewRounds=1 로 기록 (review YAML의 `reviewRound: 6` 미캡처) | **YES (#3)** — reviewRounds 실제값 반영 |

**신뢰도**: HIGH (3사이클 추세 + 직접 재현 검증 완료).

---

## 핵심 통찰: "cycle-4 fix 2건은 성공했고, 이번 사이클 JSON 은 그 흔적을 증명한다"

- cycle-4 proposal #1(resetBody brace-balanced) + #2(engineAdoption 분모 보정) 은 apply 로그상 `failed: 2, applied: 0` 이었으나 현재 `metrics.ts`에 두 수정 모두 **반영되어 있음** (수동 머지 또는 뒤늦은 apply). cycle-5 측정값이 이를 방증:
  - `engineAdoption`: ink-maiden 0.107 → painted-sky 0.153 (내장 호출 제외 효과 확인)
  - `enginePromotions`: 0→0→13 (cycle-3 `### ` 앵커 수정 효과 확인)
  - `thumbnailFromGameAssets`: false→false→true (.svg 허용 수정 효과 확인)
  - `charConsistency`: 0.71→1.0→1.0 (.svg 허용 효과 확인)
- **그러나 2개의 구조적 측정 버그가 새로 드러남**:
  1. `onResetCoverage = 0` — 원인: cycle-5 `painted-sky`는 `function resetAll() {...}` 정의 + `GameFlow.init({ ..., onReset: resetAll, ... })` 참조 패턴. 현재 `extractBalancedBody`는 `function resetGameState` / 인라인 arrow / 인라인 function 3가지만 매치 → **함수 참조를 못 따라감**.
  2. `stylePurity = 0.5` — 3사이클 연속. 원인: spec `art-style: painterly-2d` 의 canonical 토큰이 manifest `"Painterly digital 2D illustration..."` 의 **중간에 다른 단어가 끼어서** 정규화 substring 양방향 모두 실패. (`painterlydigital2d...` 는 `painterly2d` 를 포함 안 함.)
- **추가로 드러난 3번째 버그**: `reviewRounds` 는 review 파일 YAML 의 `reviewRound: N` 필드를 읽지 않고 본문 텍스트에서 `N회차`/`round N` 패턴을 찾음. cycle-5 review 파일에는 `reviewRound: 6` 가 front-matter 에 명시되어 있음에도 regex 가 못 잡아 **실제 6 라운드가 1 라운드로 기록됨** → QA 점수 20점 허위 부양.

이번 사이클도 **프롬프트·엔진·스킬은 건드리지 않고** 메트릭 계산 정확도 3건만 교정한다. 에이전트 행동은 이미 우수(5사이클 연속 APPROVED, 엔진 승격 13건 대기록); 측정이 이를 따라가지 못하는 구조가 반복된다.

---

## 제안 #1

- discipline: development
- pattern: `onResetCoverage` 가 cycle-5 에서 **0** 으로 catastrophic 회귀. 3사이클 추이 0.556→0.083→0.000. 실측 재현: `painted-sky/index.html:127` 에 `function resetAll(){ ... }`, `:739` 에 `GameFlow.init({...onReset:resetAll,...})`. 현재 `extractBalancedBody` 후보 3개는 (a)`function resetGameState(...)`, (b)`onReset:(...)=>{`, (c)`onReset:function(...){` 만 매치 → **함수 참조 패턴 `onReset: <identifier>` 을 전혀 못 따라감**. 결과 resetBody='' → coveredVars=0 → onResetCoverage=0. cycle-1~4 는 모두 `function resetGameState` 로 명명해서 우연히 PASS 했으나, cycle-5 는 `resetAll` 로 명명 → fail. 이는 **코더의 정당한 네이밍 재량을 처벌**하는 측정 편향이며, reviewer 의 "재시작 3회 PASS" 판정과 **정면 모순**(`restartVerifyPass: true`).
- category: METRIC_FIX
- safety: MEDIUM
- title: onReset 함수 참조 패턴 추적 — `onReset: <identifier>` 발견 시 해당 이름의 `function <id>(...){...}` 본문 추출
- target-file: agents/src/metrics.ts
- rationale:
  - **근본 원인**: 현재 3개 후보 정규식은 모두 "`onReset` 키 뒤에 곧바로 함수 리터럴이 오는" 경우만 처리. JS 현실에서 `onReset: resetAll` 처럼 **외부 함수 이름을 참조하는 패턴이 훨씬 흔함** (함수 분리·가독성·hoisting 의 장점). 매치 실패 시 resetBody='' → 모든 mutableGlobals 가 uncovered 로 카운트 → coverage=0. development 점수 가중 20% → **최대 20점 편향 손실**.
  - **해결책**: 기존 3개 후보가 모두 비면 폴백으로 `/onReset\s*:\s*([a-zA-Z_][\w$]*)\s*[,}]/` 매치 → 캡처한 식별자 이름 `fnName` 으로 `new RegExp(\`function\\s+${fnName}\\s*\\([^)]*\\)\\s*\\{\`)` 생성 → `extractBalancedBody` 호출. 기존 3 후보 중 하나라도 매치하면 폴백 미실행 → **기존 동작 100% 보존**.
  - **영향 범위**:
    1. `agents/src/metrics.ts:152-154` 한 블록 수정. signal 이름·점수 가중(20%)·인터페이스·반환 타입 불변. 외부 파일 영향 0.
    2. `onResetCoverage` signal 값만 영향. `mutableGlobals`·`customStateMachines`·`engineAdoption`·`buttonKeyCoverage` 모두 불변.
    3. cycle.ts·team.ts·types.ts·dashboard.ts·image/* 영향 0. 테스트 없음.
  - **하위호환**:
    1. 기존 3 후보가 매치하던 게임(cycle-1~4: `function resetGameState`·인라인 arrow·인라인 function)은 폴백 미실행 → 결과 **완전히 동일**.
    2. 측정값은 **상승 방향으로만 이동** (기존 0이었다가 정상 추출되면 >0). 과거 true positive 가 false 로 뒤집히는 경로 없음.
    3. 저장된 cycle-1~5 JSON 은 재계산 안 됨. cycle-6부터 반영.
    4. fnName 이 예약어·공백·특수문자면 identifier 정규식 `[a-zA-Z_][\w$]*` 가 애초에 매치 안 함 → 안전.
    5. `onReset: resetAll` 와 같은 식별자는 실제 `function resetAll(){...}` 정의가 HTML 어딘가에 존재해야 작동. 없으면 폴백도 빈 문자열 반환 → 기존과 동일한 coverage=0. **정의 없이 참조만 있는 비정상 게임은 어차피 런타임 에러** → 현실 케이스 0.
  - **부작용 검토**:
    1. **정규식 동적 생성의 안전성**: fnName 이 `[a-zA-Z_][\w$]*` 패턴으로만 캡처되므로 regex 메타문자 주입 불가. ReDoS 위험 없음 (고정 prefix/suffix + bounded identifier).
    2. **복수 onReset 선언**: HTML 에 `onReset:` 가 2개 이상 있으면 첫 매치 사용 → 과거와 동일 관행. 2개 이상은 현실에서 관찰된 적 없음.
    3. **함수명 충돌**: fnName 이 `Math` 같은 내장 이름을 덮는 경우 → identifier 가 정의되지 않으므로 `function Math(...)` 정의가 필요. 현실 게임에서 이런 네이밍 없음. 있다면 해당 변수만 커버리지에 들어갈 수 있는데, 이는 mutableGlobals 검사를 거쳐 정당한 매치로 처리됨.
  - **영향받는 코드 경로**: `metrics.ts:152-154` + 폴백 IIFE 추가 1곳. 검증: cycle-6 게임이 어떤 네이밍 규칙을 쓰든 `onResetCoverage` 가 reviewer 의 "restartVerifyPass" 방향과 일치하는지 확인.
  - **rollback**: `git tag -d evolve/cycle-5 && git reset --hard HEAD~1`. 즉시 이전 3-후보 로직으로 복원. 기존 cycle JSON 영향 없음.

```diff-old (path: agents/src/metrics.ts)
  const resetBody = extractBalancedBody(html, /function\s+resetGameState\s*\([^)]*\)\s*\{/)
    || extractBalancedBody(html, /onReset\s*:\s*\([^)]*\)\s*=>\s*\{/)
    || extractBalancedBody(html, /onReset\s*:\s*function\s*\([^)]*\)\s*\{/)
```
```diff-new
  const resetBody = extractBalancedBody(html, /function\s+resetGameState\s*\([^)]*\)\s*\{/)
    || extractBalancedBody(html, /onReset\s*:\s*\([^)]*\)\s*=>\s*\{/)
    || extractBalancedBody(html, /onReset\s*:\s*function\s*\([^)]*\)\s*\{/)
    || ((): string => {
      // Follow `onReset: <identifier>` references (e.g. `onReset: resetAll`)
      // to the actual `function <id>(...) { ... }` definition elsewhere in the file.
      // Identifier is captured via a bounded pattern so no regex injection is possible.
      const refMatch = html.match(/onReset\s*:\s*([a-zA-Z_][\w$]*)\s*[,}]/)
      if (!refMatch) return ''
      const fnName = refMatch[1]
      return extractBalancedBody(html, new RegExp(`function\\s+${fnName}\\s*\\([^)]*\\)\\s*\\{`))
    })()
```

---

## 제안 #2

- discipline: art
- pattern: `stylePurity` 가 **3사이클 연속 0.5 고정**(cycle-3 poly-spire, cycle-4 ink-maiden, cycle-5 painted-sky). cycle-3 proposal 에서 "양쪽 20자 slice" 버그를 "영숫자 정규화 후 substring 양방향" 로 수정했으나 여전히 FAIL. 실측 재현: cycle-5 spec `art-style: painterly-2d`(첫 매치), manifest `artDirection.style: "Painterly digital 2D illustration: visible brushstrokes, ..."`. 정규화 결과 ns=`painterly2d`, nm=`painterlydigital2dillustrationvisible...`. `nm.includes(ns)` = **false** (painterly 와 2d 사이에 `digital` 이 끼어 있음). `ns.includes(nm)` = false (길이 차이). → 0.5 fallback. cycle-3·4 도 동일 구조(`low-poly-3d` vs `Low-Poly 3D Rendered`, `hand-drawn-2d` vs `Hand-drawn 2D: inked linework, ...`)로 동일 패턴 failure. **canonical 토큰이 descriptive 안에서 인터리빙되는 케이스가 현실의 기본형**이다.
- category: METRIC_FIX
- safety: MEDIUM
- title: stylePurity 비교에 토큰 단위 매치 추가 — canonical 을 하이픈/공백으로 split, 모든 토큰이 manifest 에 존재하면 MATCH
- target-file: agents/src/metrics.ts
- rationale:
  - **근본 원인**: art-style 의 canonical(`painterly-2d`)은 하이픈으로 분리된 2~3개 토큰. manifest 의 descriptive 는 각 토큰을 **비인접 위치**에 배치(`Painterly digital 2D ...`). 정규화 후 substring 검사는 토큰 간 삽입물이 있으면 탐지 불가. 3사이클 연속 false-0.5 는 이 구조적 한계의 확증.
  - **해결책**: 기존 `nm.includes(ns) || ns.includes(nm)` 조건에 **3번째 대안** `allTokensPresent` 추가. canonical 을 `/[-\s_]+/` 로 split → 2자 이상 토큰만 필터 → 각 토큰을 정규화하여 `nm.includes(token)` 검사. 전부 참이면 MATCH. 기존 2 조건은 그대로 유지 → 하이픈 없는 경우·완전일치 경우 등 기존 통과 케이스 모두 유지.
  - **영향 범위**:
    1. `agents/src/metrics.ts:228` 한 줄을 `const tokens = ...; const allTokensPresent = ...; stylePurity = ...` 3줄로 확장. signal 이름·점수 가중(25%)·스키마 불변.
    2. `stylePurity` signal 값만 영향. charConsistency·assetVerifyRate·assetGenerateRate·thumbnail 불변.
    3. 다른 파일 영향 0.
  - **하위호환**:
    1. 측정값은 **상승 방향으로만 이동** (0.5→1 만 가능). 1→0.5 로 내려가는 경로 없음.
    2. 기존 MATCH 케이스(canonical=manifest 또는 완전 substring)는 이미 첫 2 조건에서 참 → `allTokensPresent` 미평가. 행동 불변.
    3. 저장된 cycle-1~5 JSON 재계산 안 됨. cycle-6부터 반영.
    4. canonical 에 토큰이 없는 극단 케이스(`art-style: ""`)는 `tokens.length === 0` 가드로 `allTokensPresent=false` → 기존 동작(stylePurity=1 default from init) 유지.
  - **부작용 검토**:
    1. **과대매치**: canonical 토큰이 2자 이상 + 영숫자 → 흔한 영어 단어가 토큰이 되면 false-positive 가능. 예: canonical=`hand-drawn-2d` → 토큰 `hand`·`drawn`·`2d`. manifest 가 `pixel-art` 라면 셋 다 없음 → 정확히 FAIL. manifest 가 `Hand-painted pixel` 이라면 `hand` 만 있고 `drawn`·`2d` 없음 → FAIL. 허위 통과 가능성 낮음.
    2. **2자 필터**: 길이 2 이상 토큰만 사용 → `3d`·`2d` 는 통과(길이 2), 빈 토큰은 제외. split 결과의 noise 차단.
    3. **노멀라이즈 된 토큰 빈 문자열**: 토큰이 모두 특수문자로만 구성된 경우(예: `--`) → split 후 `''` → filter 에서 제외 → 안전.
    4. 대소문자: `specStyle`·`manifestStyle` 모두 `.toLowerCase()` 후 normalize → 대소문자 차이 흡수.
  - **영향받는 코드 경로**: `metrics.ts:228` 1블록. 검증: cycle-6 에서 `stylePurity` 가 spec-manifest 실제 일치 방향(1.0) 으로 회복.
  - **rollback**: `git tag -d evolve/cycle-5 && git reset --hard HEAD~1`. 즉시 단일 조건 substring 로직으로 복원.

```diff-old (path: agents/src/metrics.ts)
      stylePurity = (ns && nm && (nm.includes(ns) || ns.includes(nm))) ? 1 : 0.5
```
```diff-new
      // 3사이클 연속 0.5 고정 해결: canonical(`painterly-2d`) 토큰이 descriptive
      // (`Painterly digital 2D illustration`) 안에서 `digital` 같은 단어로 인터리빙되면
      // substring 양방향 비교가 실패. canonical 을 하이픈/공백으로 split 한 뒤 모든 토큰이
      // normalized manifest 에 존재하면 MATCH 로 인정한다.
      const tokens = specStyle.split(/[-\s_]+/).map(t => t.replace(/[^a-z0-9]/g, '')).filter(t => t.length >= 2)
      const allTokensPresent = tokens.length > 0 && tokens.every(t => nm.includes(t))
      stylePurity = (ns && nm && (nm.includes(ns) || ns.includes(nm) || allTokensPresent)) ? 1 : 0.5
```

---

## 제안 #3

- discipline: qa
- pattern: `reviewRounds` 가 cycle-1~5 전부 **1** 로 기록되었으나 실제로는 cycle-1(3라운드 추정), cycle-2(2라운드), cycle-3(3라운드), cycle-4(2라운드), **cycle-5(6라운드)**. 직접 확인: `docs/reviews/cycle-5-review.md:3` 에 `reviewRound: 6` YAML front-matter 명시, `cycle-4-review.md` 에 `reviewRound: 2`. 현재 regex `/(\d+)회차|round\s*\d+/gi` 는 본문의 "N회차" 또는 "round N" 을 찾지만 `reviewRound: 6` 는 `round` 뒤에 `\s*\d+` 가 아닌 `: \d+` → `\s` 가 `:` 를 매치 안 함 → **미탐지**. 결과 QA score 가 항상 최대 근사(라운드 불이익 0점), 특히 cycle-5 는 6라운드 현실을 1라운드로 기록하여 **20점 허위 부양**. postmortem "5차 리뷰까지 소요" 와 정면 모순.
- category: METRIC_FIX
- safety: MEDIUM
- title: reviewRounds 를 review 파일 YAML front-matter `reviewRound: N` 에서 1차 우선 추출, 실패 시 기존 regex 폴백
- target-file: agents/src/metrics.ts
- rationale:
  - **근본 원인**: reviewer 가 이미 YAML 에 정확한 값을 저장하는데 (`reviewRound: 6`), metrics 는 본문 regex 로만 추출 시도 → `:` 뒤의 숫자 패턴은 `\s*\d+` 로 매치 안 됨. **있는 데이터를 안 읽는 단순 누락**.
  - **해결책**: `extractYaml(reviewText, 'reviewRound')` 로 우선 파싱 → 유효한 양의 정수면 사용. 실패(빈 문자열, NaN, 0 이하) 시 기존 regex 폴백.
  - **영향 범위**:
    1. `agents/src/metrics.ts:377` 한 줄을 2줄로 확장. 다른 signal·점수 공식 불변.
    2. `reviewRounds` 값은 cycle-4 부터 YAML field 가 존재. cycle-1~3 은 없음 → 폴백 실행 → **행동 불변**.
    3. cycle.ts·team.ts·dashboard.ts 영향 0. scoreQA 호출부(reviewRounds 사용) 는 signature 불변.
  - **하위호환**:
    1. `reviewRound` 필드가 없는 리뷰(cycle-1~3)는 폴백 → 기존 결과와 동일.
    2. 필드가 있는 리뷰(cycle-4·5 및 이후)는 **실제값으로 반영**. 이 방향은 점수를 **낮추거나 같게 함** — cycle-4 QA score 95→85 (1→2 라운드, -10), cycle-5 95→75 (1→6 라운드, -20). **이 하락은 버그 수정이 드러내는 진실**이며 평균 품질 지표가 아닌 measurement 정확도 회복.
    3. 저장된 cycle-1~5 JSON 재계산 안 됨. cycle-6 부터 반영 → 대시보드 추세 그래프에는 cycle-6 부터 반영.
    4. 향후 reviewer 프롬프트가 YAML 필드를 계속 출력한다고 보장 필요 없음 — 없으면 폴백.
  - **부작용 검토**:
    1. **QA discipline STABLE→DECLINING 가능성**: cycle-6 이후 실측되는 reviewRounds 에 따라 discipline 분류가 바뀔 수 있음. 이는 **의도된 측정 정확도 회복**. 만약 연쇄 decline 이 감지되면 다음 evolver 사이클이 reviewer/coder 프롬프트 개선 제안을 자연스럽게 띄울 것 — 자가진화 루프의 정상 동작.
    2. **`reviewRound` vs `previousRound`**: cycle-5 파일에 `previousRound: 5` 도 있음. `extractYaml` 은 정확한 key 매치(`^reviewRound:`)만 하므로 혼동 없음.
    3. **음수·0·비정수**: `parseInt` 결과를 `Number.isFinite(n) && n > 0` 로 검증. 유효하지 않으면 폴백.
  - **영향받는 코드 경로**: `metrics.ts:377` 한 블록. 검증: cycle-6 의 `reviewRounds` 가 review YAML 과 일치하는지 확인.
  - **rollback**: `git tag -d evolve/cycle-5 && git reset --hard HEAD~1`. 즉시 이전 regex-only 로 복원.

```diff-old (path: agents/src/metrics.ts)
  const reviewRounds = Math.max(1, countMatches(reviewText, /(\d+)회차|round\s*\d+/gi) || 1)
```
```diff-new
  // reviewer 가 YAML front-matter 에 `reviewRound: N` 을 명시하면 이를 1차 우선. 없으면 본문 regex 폴백.
  // 기존 regex `/round\s*\d+/gi` 는 `reviewRound: 6` 의 `:` 를 `\s` 가 매치 못 해 미탐지였음.
  const reviewRoundYaml = parseInt(extractYaml(reviewText, 'reviewRound'), 10)
  const reviewRounds = (Number.isFinite(reviewRoundYaml) && reviewRoundYaml > 0)
    ? reviewRoundYaml
    : Math.max(1, countMatches(reviewText, /(\d+)회차|round\s*\d+/gi) || 1)
```

---

## 제안 없음 (planning)

- **planning** (92→92→91, STABLE): specCompleteness 0.833 3사이클 고정(6섹션 중 5 커버, 1개 누락은 heading 표기 차이로 추정). refChainValid 0.875→0.867→0.769 소폭 하락이지만 0.77 이상이면 재료 손실 미미 + 장르 복잡도 증가에 따른 자연 변동. genre/style 중복 0, postmortemDepth 8 안정. **1차 리뷰 APPROVED 흐름이 우선(cycle-4=1라운드 APPROVED)**. 추가 프롬프트 규칙은 cycle-4 의 14항목 체크리스트·cycle-5 의 C4-피드백-해결 체크리스트 성공 패턴을 압박 → 과적합 위험. 관찰만.

## 제안 없음 (development 추가 건)

- enginePromotions 13건(cycle-5) 은 직전 2사이클 0을 깨뜨린 record-high. coder 가 엔진 승격 phase 를 적극 활용하기 시작한 신호 → 추가 프롬프트 강화 불필요.
- customStateMachines·directListenerCount 3사이클 연속 0 유지. IX 엔진 준수 문화 정착.
- buttonKeyCoverage 0.941(16/17) — 17개 버튼 중 1개만 key 누락. cycle-6 post-hoc 점검 수준. 별도 규칙 추가 불필요.

## 제안 없음 (art 추가 건)

- thumbnailFromGameAssets: cycle-3·4 false → cycle-5 **true**. cycle-4 의 .svg 허용 fix 가 정착.
- charConsistency: 0.71→1.0→1.0 안정.
- 장르별 스타일 다양성(roguelike/survivor/deckbuilder/metroidvania/bullet-hell 각기 다른 art-style) 유지.

---

## 왜 이번에도 메트릭 수정 3건인가

- cycle-3·4 proposal 이 모두 METRIC_FIX 중심이었고, **현재 metrics.ts 에 그 수정들이 반영된 결과 cycle-5 에서 art·development 점수가 실질 회복**(enginePromotions 13, thumbnailFromGameAssets true, charConsistency 1.0, engineAdoption 0.153). 이는 "측정 버그 교정 → 점수 회복 → 추세 가시화" 사이클이 작동하고 있다는 증거.
- 남은 3 버그(#1·#2·#3)는 **같은 성격**(측정이 현실을 따라가지 못함)이며, 모두 reviewer/coder 행동에는 변화를 요구하지 않는 순수 메트릭 계산 정정. 이들을 마저 고치면 dashboard 가 4사이클 축적 품질 개선을 올바로 반영.
- 프롬프트·엔진·스킬은 5사이클 연속 APPROVED + 엔진 승격 13건이라는 실적 앞에 **안정기에 진입** 했다. 섣부른 규칙 추가는 과적합. 도메인 확장(퍼즐/리듬 장르)이나 구조적 변경(phase 재배치) 같은 HIGH 제안은 충분한 증거(2사이클 이상 VOLATILE/DECLINING)가 쌓인 뒤 제안.
- 3건 모두 **MEDIUM** — rollback 1회 명령으로 복구 가능(`git tag -d evolve/cycle-5 && git reset --hard HEAD~1`). 점수 이동 방향:
  - #1: dev onResetCoverage ↑ (0→정상값)
  - #2: art stylePurity ↑ (0.5→1)
  - #3: qa reviewRounds **정직값 반영** (현재 과대평가된 QA score 가 정정됨 — 하락 가능)

---

## 체크리스트

- [x] cycle-3·4·5 metrics/postmortem 3쌍 모두 읽음 + wisdom·engine-notes·이전 proposal/applied 모두 읽음
- [x] 디시플린별 추세표 + HIGH 신뢰도(3사이클) 명시
- [x] 가장 낮은 discipline(development 64) + VOLATILE art/qa 측정이슈 우선
- [x] 제안 ≤ 6개 (총 3개, discipline 당 최대 1개)
- [x] 각 제안에 diff block 포함 (apply-proposal.ts 파싱 형식 준수)
- [x] MEDIUM 판정 3건 모두 "영향 범위·하위호환·부작용·rollback" 4항목 포함
- [x] diff-old 텍스트가 target-file 에 유일함 grep 으로 확인 완료 (각 1건)
  - `extractBalancedBody(html, /function\s+resetGameState` — metrics.ts:152 1건
  - `stylePurity = (ns && nm` — metrics.ts:228 1건
  - `const reviewRounds = Math.max` — metrics.ts:377 1건
- [x] cycle-3·4 적용/실패 proposal 과 중복 없음 (onReset 참조 추적·토큰 매치·YAML reviewRound 모두 신규 제안)
- [x] HIGH 분류 대상(phase 순서·agent 역할·scoring 공식 교체·기존 API 시그니처 변경) 없음 — 모두 metrics.ts 내부 계산 로직만 수정
- [x] 실측 재현: painted-sky resetAll + onReset:resetAll 패턴 재현 확인
- [x] 실측 재현: painterly-2d vs "Painterly digital 2D illustration" 토큰 인터리빙 재현 확인
- [x] 실측 재현: cycle-5-review.md `reviewRound: 6` YAML 명시 재현 확인
