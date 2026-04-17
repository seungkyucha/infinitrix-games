---
cycle: 1
basedOn: [1]
generatedAt: 2026-04-18T00:00:00.000Z
---

# Evolution Proposal — Cycle 1

## 추세 요약

| Discipline | 1 | Trend | Action |
|-----------|-----|-------|--------|
| planning    | 98 | STABLE (single snapshot, VERY_LOW) | — |
| development | 56 | STABLE (single snapshot) | YES (#1, #2) |
| art         | 68 | STABLE (single snapshot) | — |
| qa          | 80 | STABLE (single snapshot) | YES (#3) |

**신뢰도**: VERY_LOW — 사이클 1개 스냅샷. 따라서 **signal 값 자체**로 판단하지 않고,
**① 명백한 코드 버그(측정 자체가 틀린 경우)**와 **② 포스트모템·wisdom 에서 교차 확인된 구조적 이슈**
만 제안 대상으로 삼는다.

**판단 근거 요약**:
- development 점수 56은 engineAdoption(0.20)·onResetCoverage(0.0625)·enginePromotions(0)에 의해 깎였으나,
  실제로는 ① 로그라이크 특성상 게임 고유 로직이 커서 engineAdoption이 자연히 낮고, ② restartVerifyPass=true 이므로
  실질적 재시작 버그는 없으며, ③ **engine-notes/cycle-1-promotion.md 에는 실제로 2건 승격되었는데 메트릭은 0으로 읽음** → 측정 버그 확인.
- qa 점수 80은 firstRoundVerdict=NEEDS_MINOR_FIX 탓 — platform-wisdom #1 "피드백 문서 부재"가 1차→2차 미수정의 **직접 원인**으로 포스트모템에서도 확인됨.
- art 점수 68 (stylePurity 0.5) 은 Gemini 변형 에셋 실패로 SVG fallback 한 것의 **의도된 부작용**이라 디자이너 wisdom에 이미 기록됨 → 별도 구조 제안 없이 다음 사이클 재현 여부 관찰.

**우선순위**: (a) 측정 버그 수정 → (b) 포스트모템에서 교차 검증된 구조 이슈 2건.

---

## 제안 #1
- discipline: development
- pattern: enginePromotions 메트릭이 실제 승격 2건을 0으로 보고 (정규식 `완료?`가 `완(료)?` 로 해석되어 `완` 글자를 강제)
- category: METRIC_FIX
- safety: MEDIUM
- title: enginePromotions 섹션 정규식 오류 수정 (`완료?` → `(?:완료)?`)
- target-file: agents/src/metrics.ts
- rationale:
  - **영향 범위**: `scoreDevelopment` 함수 내부 regex 1줄만 수정. 호출자는 `collectCycleMetrics` 하나이며, 리턴 형식 동일.
  - **하위호환**: signal 이름·타입 불변. 단지 기존에 0이 잘못 반환되던 상황에서 정확한 수치가 반환될 뿐. cycle-1.json 등 이미 저장된 메트릭 파일은 재계산하지 않으므로 변경 없음.
  - **엔진승격 점수 상한 15점 유지**: `+ Math.min(15, enginePromotions * 5)` 공식은 그대로라 점수 상승은 제한적.
  - **rollback**: `git tag -d evolve/cycle-1 && git reset --hard HEAD~1`
  - **영향받는 코드 경로**: `metrics.ts:161` 한 줄. 다른 파일은 이 regex를 재사용하지 않음 (Grep 확인: `promoSection` 바인딩은 해당 라인에만 존재).
  - **근거**: engine-notes/cycle-1-promotion.md 는 `## 승격\n\n### 1. MathUtil.aStar ... - **출처**:` 형태. 기존 regex `##\s*승격\s*완료?` 는 `승격` 뒤에 `완`이 없으면 매치 실패 → 섹션 캡처 0 → enginePromotions=0. `(?:완료)?` 로 고치면 `완료` 유무 모두 매치.

```diff-old (path: agents/src/metrics.ts)
  const promoSection = inp.enginePromotionText.match(/##\s*승격\s*완료?([\s\S]*?)(##|$)/)
```
```diff-new
  const promoSection = inp.enginePromotionText.match(/##\s*승격(?:\s*완료)?([\s\S]*?)(##|$)/)
```

---

## 제안 #2
- discipline: development
- pattern: 포스트모템·platform-wisdom #4 — "뒤로"(36px) "타이틀"(40px) 버튼이 44px 미달. 개발자/리뷰어가 모두 놓쳤음 → 엔진 레벨에서 경고 필요
- category: ENGINE_API
- safety: LOW
- title: IX.Button 생성 시 44px 미달이면 console.warn 으로 경고 (동작 변경 없음, 개발시 감지용)
- target-file: public/engine/ix-engine.js
- rationale:
  - **추가만 하는 변경**: Button 생성자의 마지막 라인 `Button._active.push(this);` 바로 뒤에 경고 한 줄을 추가. 기존 필드/API/동작 변경 없음.
  - **기존 코드 영향 없음**: 경고는 console.warn 뿐이며 throw/return 없음 → 생성은 정상 진행. 기존 게임·테스트 모두 그대로 동작.
  - **탐지 효과**: 44px 미달 버튼이 콘솔에 기록되어 리뷰어가 `window.__errors` 수집 시 감지 가능 → 다음 사이클부터 재발 자동 포착.
  - **LOW 판정 근거**: 다른 파일·다른 경로의 동작에 영향이 없음. 오직 콘솔 출력만 추가.
  - **wisdom 교차 근거**: platform-wisdom.md #4 "버튼 높이 하드코딩" + designer/reviewer wisdom 에 동일 이슈 반복 기록.

```diff-old (path: public/engine/ix-engine.js)
    this._cooldown = 0;                       // prevent double-trigger
    Button._active.push(this);
  }
```
```diff-new
    this._cooldown = 0;                       // prevent double-trigger
    Button._active.push(this);
    if ((this.w && this.w < 44) || (this.h && this.h < 44)) {
      console.warn('[IX.Button] tap target under 44px — text=' + JSON.stringify(this.text) + ' size=' + this.w + 'x' + this.h + ' (mobile UX risk)');
    }
  }
```

---

## 제안 #3
- discipline: qa
- pattern: 1차 리뷰 → 2차 리뷰 사이에 피드백 문서가 전혀 작성되지 않아 지적 사항이 수정되지 않음 (postmortem "아쉬웠던 점" + platform-wisdom #1 + reviewer 다음 사이클 적용 사항)
- category: PROMPT_RULE
- safety: LOW
- title: reviewer 프롬프트에 "1단계 직전 피드백 문서 작성 의무화" 섹션 추가 (docs/feedback/cycle-N-feedback.md)
- target-file: agents/src/team.ts
- rationale:
  - **추가만 하는 변경**: reviewer 프롬프트의 "## 1단계: 코드 리뷰 (정적 분석)" 헤더 바로 앞에 **새 섹션** 삽입. 기존 1~3단계 지시·판정기준 불변.
  - **기존 동작 영향 없음**: 새 섹션은 단순히 리뷰 보고서와 함께 feedback.md 를 추가로 작성하도록 지시. 리뷰 통과/실패 로직·verdict 판정 기준·자동화 파이프라인 영향 0. docs/feedback/ 폴더가 없어도 Write 시 자동 생성.
  - **구조적 효과**: 1차 리뷰 지적 → feedback.md → (다음 사이클/재리뷰) 수정 → 2차 리뷰 루프가 **명시적으로 강제**됨.
  - **LOW 판정 근거**: diff-old 문자열이 reviewer 프롬프트 내에 유일 (grep 확인: team.ts:950 단일 매치). 다른 agent 프롬프트·cycle.ts phase 순서·metrics.ts scoring 에 영향 없음.
  - **wisdom 교차 근거**: platform-wisdom.md #1, reviewer wisdom "다음 사이클 적용 사항" #3 에 동일 프로세스 개선 기록.

```diff-old (path: agents/src/team.ts)
## 1단계: 코드 리뷰 (정적 분석)
```
```diff-new
## 0단계: 피드백 문서 작성 (1차 리뷰일 때 필수)

1차 리뷰(reviewRounds=1)라면, 리뷰 결과와 별개로 **반드시** 다음 파일을 Write 하세요:
- 경로: \`docs/feedback/cycle-N-feedback.md\`
- 내용: 지적사항 요약 / 수정 우선순위(HIGH/MED/LOW) / 코더가 고쳐야 할 파일·라인·기대 결과 / 재리뷰 시 확인 항목
- 이 문서가 없으면 2차 리뷰에서 수정 여부를 검증할 수 없으므로, 재리뷰 verdict 는 자동으로 NEEDS_MAJOR_FIX 로 취급합니다.

2차 리뷰일 때는 0단계를 건너뛰고 1단계로 바로 진행하되, 1단계 시작 전 docs/feedback/cycle-N-feedback.md 를 먼저 읽어 **모든 HIGH 항목이 수정되었는지** 교차 확인하세요.

## 1단계: 코드 리뷰 (정적 분석)
```

---

## 제안 없음 (planning / art)

- **planning**: 점수 98, specCompleteness 0.83, genreDup/styleDup 0. 단일 사이클이라 추세 불명이며 명백한 구조 문제 없음 → 제안 없음.
- **art**: stylePurity 0.5 는 Gemini 변형 에셋 실패로 SVG fallback 한 결과이며, designer wisdom("캐릭터 변형 에셋은 SVG로 직접 제작 우선")·platform-wisdom #2 에 이미 기록됨. 1사이클 스냅샷만으로 prompts.ts / verify.ts 튜닝을 강제하기엔 근거 부족 → 다음 사이클에서 재발 시 재평가.

## 체크리스트
- [x] 1사이클 metrics/postmortem/wisdom 모두 읽음
- [x] 디시플린별 추세 판정표 작성 (단일 스냅샷 명시)
- [x] VERY_LOW 신뢰도 원칙 준수 — 추세 기반 제안 금지, 구조적/버그성만
- [x] 제안 ≤ 6개 (총 3개)
- [x] 각 제안에 diff block 포함
- [x] LOW 판정에 영향 분석 근거 포함
- [x] MEDIUM 판정에 영향 범위·하위호환·rollback 포함
- [x] old_string 이 target-file 에 유일함 grep 확인 완료
