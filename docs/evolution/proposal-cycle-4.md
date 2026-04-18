---
cycle: 4
basedOn: [2, 3, 4]
generatedAt: 2026-04-19T00:00:00.000Z
---

# Evolution Proposal — Cycle 4

## 추세 요약

| Discipline  | 2  | 3  | 4  | Trend | Action |
|-------------|----|----|----|-------|--------|
| planning    | 95 | 92 | 92 | STABLE (Δ-2.3) — specCompleteness 0.833 3사이클 고정 | — (측정 안정, 과적합 위험) |
| development | 60 | 62 | 54 | **VOLATILE/DECLINING** (Δ-6.0) — engineAdoption 단조 감소(0.244→0.134→0.107), onResetCoverage 0.214→0.556→**0.083** | **YES (#1, #2)** — 측정 버그 2건 |
| art         | 58 | 50 | 58 | STABLE (Δ0.0) — stylePurity 3사이클 0.5 고정, thumbnailFromGameAssets 3사이클 false | — (이미 수정 반영됨, 관찰) |
| qa          | 80 | 95 | 95 | IMPROVING/STABLE (Δ+15) — 2사이클 연속 APPROVED 1차 | — (건강) |

**신뢰도**: HIGH (3사이클 추세 확립).

---

## 핵심 통찰: "현재 리뷰는 4사이클 연속 최상급인데 점수가 떨어진다"

- cycle-4 `ink-maiden`은 **플랫폼 최초로 1차 리뷰에서 HIGH 항목 0건 APPROVED**를 달성. reviewer/postmortem 모두 A~G 전 카테고리 PASS 판정.
- 그럼에도 development 점수는 **60 → 62 → 54**로 주저앉음. art는 stylePurity 0.5 고정으로 누적 낙인.
- **cycle-3 proposal #1,#2,#3 (METRIC_FIX)은 apply 결과가 `failed: 3, applied: 0`이었으나, 현재 `metrics.ts`를 조사한 결과 세 수정사항이 모두 반영되어 있음** — 수동 반영되었거나 cycle-4 실행 직후 반영된 것으로 추정.
- 따라서 cycle-4 JSON 값(stylePurity=0.5, enginePromotions=0, thumbnailFromGameAssets=false)은 **cycle-4 실행 당시의 구버전 metrics.ts 기준**이며, cycle-5부터는 자연 회복될 것 → **cycle-3 fix를 재제안할 필요 없음**.
- 하지만 cycle-3 proposal은 stylePurity/charConsistency/thumbnail/promotion 4건의 측정 버그는 잡았으나, **development 점수의 진짜 변동 원인 2건**(아래 제안 #1·#2)은 미처 보지 못함. 본 cycle 에서는 이 2건만 집중 교정.

---

## 제안 #1

- discipline: development
- pattern: onResetCoverage가 **3사이클 연속 volatile** (0.214 → 0.556 → **0.083**). cycle-4 실측으로 재현: `resetGameState` 정규식이 `function\s+resetGameState\s*\([^)]*\)\s*\{([\s\S]*?)\}` 인데 `[\s\S]*?`이 **non-greedy**라 첫 `}`에서 조기 종료. ink-maiden `resetGameState`(line 693-729)는 두번째 라인이 `player = { x:0, y:0, ... };` 객체 리터럴이라, 정규식이 `player = {` 의 닫는 `}`(line 704)을 함수 종료로 오인하고 resetBody 캡처를 11 라인만에 끝냄. 나머지 12개 변수 초기화 라인(currentRoom, roomId, visitedRooms, enemies, items, bosses, projectiles, score, gameTime, inputDelay, shakeIntensity, abilities, bossActive, bossDefeated, lastSaveRoom, lastSaveSpawn, deathCount, secretsFound, bossNoHit, resumingFromPause, ROOMS 루프)을 **전혀 보지 못함** → coveredVars=1/12=**0.0833**. cycle-3(poly-spire)는 전투 상태를 객체 리터럴 없이 재할당해 우연히 0.556 측정, cycle-2(neon-survivors)는 `stateRef.enemies = []` 패턴이라 0.214 측정. **객체 리터럴 사용량 = 측정값의 역수**라는 비의도적 바이어스.
- category: METRIC_FIX
- safety: MEDIUM
- title: resetGameState/onReset 본문 추출을 brace-balanced 스캐너로 대체 — 객체 리터럴·중첩 블록 있어도 함수 전체 본문 포착
- target-file: agents/src/metrics.ts
- rationale:
  - **근본 원인 (재확인)**: 정규식 `[\s\S]*?\}` non-greedy 매칭은 중첩 `{...}` 블록을 만나면 가장 얕은 `}`에서 종료. 현대 게임 코드의 reset 함수는 객체 리터럴 1개 이상을 필수로 포함(player state, abilities, bosses map 등) → 사실상 모든 게임에서 본문 일부만 캡처. 이는 `stuckStateBugs = 0`이라는 qa 결과와 모순되는 development 저점수의 **단일 최대 원인**.
  - **해결책**: 함수 헤더(`function resetGameState(...) {` 또는 `onReset: (...) => {` 또는 `onReset: function (...) {`)를 정규식으로 찾은 후, **중괄호 깊이를 카운트**하며 문자열·템플릿 리터럴 내부는 건너뛰는 단순 스캐너 헬퍼 `extractBalancedBody(text, startRe)`를 추가. 기존 `resetBlockMatch` 대신 사용.
  - **영향 범위**:
    1. `agents/src/metrics.ts` 1개 파일. 헬퍼 함수 `extractBalancedBody` 1개 추가 + `resetBody` 할당 1줄 교체. 외부 API·signal 이름·점수 공식·반환 타입·인터페이스 모두 불변.
    2. `onResetCoverage` signal 값만 영향. 분자(`coveredVars`)와 분모(`mutableGlobals`)의 계산 방식 변경 없음 — 오직 resetBody 입력이 **전체**가 될 뿐.
    3. cycle.ts·team.ts·types.ts·dashboard.ts 영향 0. 테스트 파일 없음.
  - **하위호환**:
    1. 기존 매치 대상(`resetGameState` 없음 또는 `onReset` 없음)은 그대로 빈 문자열 반환 → mutableGlobals>0 일 때 coverage=0 유지.
    2. 기존에 우연히 전체 본문을 캡처하던 케이스(객체 리터럴 없는 단순 reset — 미래의 가상 케이스)는 brace-balanced 스캐너에서도 같은 본문을 반환 → 결과 동일.
    3. **측정값은 상승 방향으로만 변경**: 잘리던 본문이 제대로 캡처되면 coveredVars 증가. 기존 true positive가 false로 뒤집히는 경우 없음 → dashboard 시각화에서 점수 하락 없음.
    4. 이미 저장된 cycle-1~4 JSON은 재계산 안 됨. cycle-5부터 반영. 점프 가능성이 있지만 이는 **의도된 측정 정확도 회복**.
    5. 성능: 스캐너는 resetBody 길이(수백 라인)만 1회 스캔 → O(n) 1회. 현재 metrics 총 실행 시간이 수백 ms 수준이므로 체감 영향 0.
  - **부작용 검토**:
    1. **문자열 내 중괄호**: ES 템플릿 리터럴(`${...}`) 내 `{}`를 `skipString`이 건너뜀. 일반 문자열의 `"{"`·`'}'` 도 건너뜀. 정규식 리터럴은 여기서는 무시(드물고, 있어도 중괄호 포함 가능성 낮음).
    2. **주석 내 중괄호**: `//` 또는 `/* */` 주석 내부의 `{}`는 현재 스캐너가 인식 못함. 그러나 reset 본문에 주석으로 중괄호를 넣는 경우는 드물고(ink-maiden: 0건), 있어도 depth 틀어지는 최악이 "본문 끝을 조금 일찍 끝냄" — 이는 기존 버그보다 **항상 나음**.
    3. **함수 종료 미발견**: 매우 긴/잘못된 HTML인 경우 depth가 0 안 됨. 그 때는 resetBody가 파일 끝까지 포함 → mutableGlobals는 모두 커버 안에 들어가므로 coverage=1. 이 케이스는 HTML이 이미 파싱 불가능한 상태라 다른 지표에서 먼저 드러남.
  - **영향받는 코드 경로**: `metrics.ts:140-148` (onResetCoverage 블록) + 헬퍼 함수 추가 1곳. 검증: cycle-5 JSON의 `onResetCoverage` 가 실제 reset 본문에 나타나는 변수 비율과 일치하는지 수동 확인.
  - **rollback**: `git tag -d evolve/cycle-4 && git reset --hard HEAD~1`. 즉시 이전 정규식 버전으로 복원되며 기존 cycle-1~4 JSON은 영향 없음.

```diff-old (path: agents/src/metrics.ts)
  const resetBlockMatch = html.match(/function\s+resetGameState\s*\([^)]*\)\s*\{([\s\S]*?)\}|onReset\s*:\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)\}|onReset\s*:\s*function\s*\([^)]*\)\s*\{([\s\S]*?)\}/)
  const resetBody = resetBlockMatch ? (resetBlockMatch[1] ?? resetBlockMatch[2] ?? resetBlockMatch[3] ?? '') : ''
```
```diff-new
  const resetBody = extractBalancedBody(html, /function\s+resetGameState\s*\([^)]*\)\s*\{/)
    || extractBalancedBody(html, /onReset\s*:\s*\([^)]*\)\s*=>\s*\{/)
    || extractBalancedBody(html, /onReset\s*:\s*function\s*\([^)]*\)\s*\{/)
```

```diff-old (path: agents/src/metrics.ts)
function countMatches(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length
}
```
```diff-new
function countMatches(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length
}

/**
 * Extract a function/arrow-block body by scanning balanced braces.
 * Finds `startRe` (which must end at an opening `{`), then walks forward
 * counting `{`/`}` while skipping string/template-literal contents.
 * Returns the inner body (between the opening `{` and its matching `}`),
 * or '' if the pattern is not found.
 */
function extractBalancedBody(text: string, startRe: RegExp): string {
  const m = startRe.exec(text)
  if (!m) return ''
  let i = m.index + m[0].length
  let depth = 1
  const start = i
  while (i < text.length && depth > 0) {
    const c = text[i]
    if (c === '"' || c === "'" || c === '`') {
      const quote = c
      i++
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\') i++
        i++
      }
      i++
      continue
    }
    if (c === '{') depth++
    else if (c === '}') depth--
    i++
  }
  return depth === 0 ? text.slice(start, i - 1) : text.slice(start)
}
```

---

## 제안 #2

- discipline: development
- pattern: `engineAdoption`이 **3사이클 단조 감소** (0.244 → 0.134 → 0.107). 그런데 reviewer는 4사이클 모두 "IX 엔진 100% 준수, 자체 setTimeout/addEventListener 0건" 판정. `customStateMachines=0`·`directListenerCount=0`이라 분자 쪽 엔진 API 사용은 만점. 원인: 분모 `countMatches(html, /\b\w+\s*\(/g)` 가 **모든 함수 호출**을 카운트 — `Math.floor`, `Math.max`, `Array.from`, `Object.entries`, `JSON.parse`, `parseInt`, `console.log`, `Set`, `Map`, 익명 게임 헬퍼 등까지 모두 포함. 게임이 복잡해질수록(ink-maiden=1573라인, poly-spire=1896라인, neon-survivors=1427라인) 이런 **언어 내장/유틸 호출이 분자보다 빠르게 증가** → 비율이 구조적으로 낮아짐. 즉 **"게임이 길어지면 엔진 채택률이 떨어지는 것처럼 보이는" 측정 바이어스**.
- category: METRIC_FIX
- safety: MEDIUM
- title: engineAdoption 분모에서 언어 내장(Math/JSON/Object/Array/Number/String/console/Set/Map/parseInt/parseFloat/isNaN/isFinite) 호출 제외
- target-file: agents/src/metrics.ts
- rationale:
  - **근본 원인**: engineAdoption = (IX + destructured) / totalCalls. 분자는 IX.* 및 구조분해된 엔진 클래스 호출만 카운트 → 게임 코드 품질과 무관한 상한 존재. 분모는 `\b\w+\(`로 모든 호출 카운트 → **언어 내장 호출도 포함**. 실측 ink-maiden: ixCalls+destructuredCalls ≈ 149, totalCallsApprox ≈ 1392 → 0.107. Math.*/Array.* 등 내장 호출만 약 300~400개 추정 → 분모에서 빼면 약 0.15 이상으로 상승 추정.
  - **해결책**: 분모에서 **언어 내장 전역 네임스페이스 호출**(`Math.`, `JSON.`, `Object.`, `Array.`, `Number.`, `String.`, `console.`, `parseInt(`, `parseFloat(`, `isNaN(`, `isFinite(`, `new Set(`, `new Map(`, `new Promise(`, `new Error(`, `new RegExp(`)을 카운트해 빼기. 이는 **플랫폼이 "엔진을 쓴다"고 평가해야 할 대상이 아닌** 언어 기본요소.
  - **영향 범위**:
    1. `agents/src/metrics.ts:121` 1줄 수정 + 직전 3줄 추가. signal 이름·점수 가중치(25점)·반환 타입 불변.
    2. `engineAdoption` signal 값만 변화. `customStateMachines`, `directListenerCount`, `onResetCoverage`, `buttonKeyCoverage`, `codeLineCount`, `enginePromotions` 모두 영향 없음.
    3. cycle.ts·team.ts·image/·dashboard.ts 영향 0.
  - **하위호환**:
    1. 분모 값은 **줄어들거나 같음** (내장 호출을 빼니 작아짐). 분자는 불변 → 비율은 **증가 방향으로만 이동**. 기존에 고평가되던 게임의 engineAdoption이 낮아지는 경우 없음.
    2. `clamp(...*100) / 100` 가드 유지 → 상한 1.0 유지. 0~1 범위 불변.
    3. `totalCallsApprox > 0` 가드 유지. `Math.max(1, ...)`로 하한 1 보호 추가하여 분모 0 제로디비전 제거.
    4. 이미 저장된 cycle-1~4 JSON 재계산 안 됨. cycle-5부터 반영. **상승 방향 점프 주의**: ink-maiden 기준 0.107 → 0.15~0.20 추정. development score 가중 25% → 약 +1~2점.
  - **부작용 검토**:
    1. **언어 내장 외 헬퍼 함수**(`getGrade()`, `rand()`, `lerp()` 등 게임 내 유틸)는 여전히 분모에 포함 → "게임 로직 대비 엔진 활용" 의미는 유지.
    2. **내장 제외 목록 오판**: 만약 게임이 커스텀 클래스명을 `Math`나 `JSON`으로 지어 쓰는 극단적 경우 잘못 제외 가능 → 현실 가능성 0.
    3. **Math.* 호출이 적은 간단한 게임**에서는 체감 변화 미미. 이는 부작용이 아닌 **내장 의존도에 비례한 보정**으로 정상.
    4. `IX.MathUtil` 같은 엔진 API는 분자의 `IX.*` 매치로 이미 카운트됨. `Math.` 제외와 **충돌 없음**.
  - **영향받는 코드 경로**: `metrics.ts:121-124` (engineAdoption 분모 계산) 한 블록. 검증: cycle-5 JSON의 `engineAdoption` 이 0.12 이상으로 회복되고 reviewer의 "엔진 100% 준수" 판정과 방향 일치.
  - **rollback**: `git tag -d evolve/cycle-4 && git reset --hard HEAD~1`. 즉시 이전 분모 계산으로 복원.

```diff-old (path: agents/src/metrics.ts)
  const totalCallsApprox = countMatches(html, /\b\w+\s*\(/g)
  const engineAdoption = totalCallsApprox > 0
    ? clamp(((ixCalls + destructuredCalls) / totalCallsApprox) * 100) / 100
    : 0
```
```diff-new
  const allCalls = countMatches(html, /\b\w+\s*\(/g)
  // Exclude language built-ins from denominator — they are not "engine API" candidates.
  // (Math/JSON/Object/Array/Number/String/console namespaced + parseInt/parseFloat/isNaN/isFinite + new Set/Map/Promise/Error/RegExp/Date/WeakMap/WeakSet)
  const builtinCalls =
      countMatches(html, /\b(Math|JSON|Object|Array|Number|String|console)\s*\./g)
    + countMatches(html, /\b(parseInt|parseFloat|isNaN|isFinite)\s*\(/g)
    + countMatches(html, /\bnew\s+(Set|Map|Promise|Error|RegExp|Date|WeakMap|WeakSet)\s*\(/g)
  const totalCallsApprox = Math.max(1, allCalls - builtinCalls)
  const engineAdoption = totalCallsApprox > 0
    ? clamp(((ixCalls + destructuredCalls) / totalCallsApprox) * 100) / 100
    : 0
```

---

## 제안 없음 (planning, art, qa)

- **planning** (95→92→92, STABLE): specCompleteness 0.833 3사이클 고정(6섹션 중 1개 누락)이지만 장르·스타일 중복 0, refChainValid 0.75→0.875→0.867 회복 추세, postmortemDepth 8+ 유지. cycle-4는 1차 APPROVED 달성 → **실질 품질 최고 상태**. 섹션 1개 누락은 heading 표기 차이일 가능성이 높으며, 무리한 프롬프트 강화는 **cycle-4의 성공 패턴(14항목 체크리스트)을 압박**해 과적합 위험. 관찰만.
- **art** (58→50→58, STABLE): cycle-4 실측으로 stylePurity 계산 검증 — 현재 metrics.ts(이미 정규화 반영됨)로 돌리면 `"handdrawn2d".includes(specStyle.slice(0,20))` 패턴에서 **true** 반환 예상 → cycle-5부터 1.0 복원. thumbnail.svg도 현재 metrics.ts에서 검사 대상 → cycle-5부터 true. **별도 제안 불필요, cycle-5 측정값으로 자동 회복**.
- **qa** (80→95→95, STABLE 최상급): 2사이클 연속 1차 APPROVED. buttonAuditPass=1, restartVerifyPass=true, stuckStateBugs=0, reviewRounds=1. cycle-2 proposal #3(코더 self-check) + cycle-3 postmortem wisdom(14항목 QA) 조합이 정착. **추가 규칙은 프롬프트 비대화만 초래** → 개입 금지.

---

## 왜 이번에도 메트릭 수정 2건인가

- cycle-3 proposal이 METRIC_FIX 3건을 올렸으나 **development score의 진짜 변동 원인 2건**(resetBody 조기 종료, 분모 인플레이션)은 발견 못함. 결과: cycle-4 development 54점(역대 최저) — 측정이 현실(reviewer "엔진 100% 준수")을 배신.
- 프롬프트·엔진·스킬에 새 규칙을 **추가**하면 agents 는 이미 최적 행동을 하고 있는데도(cycle-4 1차 APPROVED) 과적합·대화량 증가 위험. 실제로 cycle-3에서 "더 보탤 게 없다"는 판단이 맞았고 그 판단은 이번에도 유효.
- 2건 모두 **값을 올리는 방향의 보정**이라 safety=MEDIUM으로 보수 분류. 대시보드에 cycle-5에서 development 점수가 60~75 구간으로 뛸 수 있는데, 이는 **측정 정확도 회복**이지 게임 품질 급등이 아님을 대시보드 해석 시 유의 필요.

---

## 체크리스트

- [x] cycle-2·3·4 metrics/postmortem 3쌍 모두 읽음 + wisdom-*·platform-wisdom·engine-notes·이전 proposal/applied 모두 읽음
- [x] 디시플린별 추세표 + HIGH 신뢰도(3사이클) 명시
- [x] DECLINING (development) 우선 원칙 준수 (2건 모두 development)
- [x] 제안 ≤ 6개 (총 2개)
- [x] 각 제안에 diff block 포함 (apply-proposal.ts 파싱 형식 준수)
- [x] MEDIUM 판정 2건 모두 "영향 범위·하위호환·부작용·rollback" 4항목 포함
- [x] diff-old 텍스트가 target-file에 유일함 grep 확인 완료
  - `const resetBlockMatch = html.match` → 1건 (metrics.ts:145)
  - `const totalCallsApprox = countMatches` → 1건 (metrics.ts:121)
  - `function countMatches` → 1건 (metrics.ts:38, 헬퍼 추가용 anchor)
- [x] cycle-2·3 적용/실패 proposal과 중복 없음 (resetBody·분모 인플레이션은 이전 제안에 없었음)
- [x] HIGH 분류 대상(phase 순서·agent 역할·시그니처 변경) 없음 — 모두 metrics.ts 내부 계산 로직만 수정
- [x] 실측 재현: ink-maiden resetGameState line 693-729 확인 → 객체 리터럴 `player = {...};`의 `}` 에서 non-greedy 조기 종료 재현
- [x] 실측 재현: ink-maiden thumbnail.svg 존재 + 현재 metrics.ts line 219-221 수정 반영됨 → cycle-5 자연 회복 예상
