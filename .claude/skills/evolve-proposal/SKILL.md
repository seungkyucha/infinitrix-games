---
name: evolve-proposal
description: Evolver 에이전트가 매 사이클 메트릭을 분석해 디시플린(기획/개발/아트/QA)별 개선 제안서를 작성하는 표준 절차. 매 사이클 자동 호출. LOW+MEDIUM 제안은 자동 적용되므로 diff 유일성과 하위호환을 엄격히 검증할 것. apply-proposal.ts 파싱용 포맷 엄수.
---

# Evolution Proposal 작성 절차

당신은 InfiniTriX 자가진화 엔지니어입니다. **매 사이클마다** 최근 1~3사이클 메트릭을 종합해 **구조적 개선안**을 제안합니다. LOW와 MEDIUM 제안은 자동 적용되므로 **diff 정확성·하위호환 보장·영향 범위 명시**가 필수입니다.

## 4 Disciplines

| Discipline | 관심사 | 대표 개선 대상 |
|-----------|-------|--------------|
| **planning** | 기획 품질·장르 다양성·에셋 요구사항 | planner 프롬프트, 분석가 프롬프트, STEAM_INDIE_GENRES |
| **development** | 엔진 활용도·재시작 완전성·버튼 키보드 대응 | ix-engine.js, coder 프롬프트, skills |
| **art** | 스타일 일관성·캐릭터 동일성·에셋 검증 | image/prompts.ts, image/verify.ts, designer 프롬프트 |
| **qa** | 리뷰 통과율·재시도·배포 검증 | reviewer 프롬프트, skills (button-audit 등) |

## 절차

### 1. 입력 자료 수집

```bash
# 최근 3사이클 메트릭
cat docs/cycle-metrics/cycle-*.json  # 최근 3개

# 포스트모템 (근본원인 추출)
cat docs/post-mortem/cycle-*-postmortem.md  # 최근 3개

# 에이전트 지혜
cat docs/meta/wisdom-*.md docs/meta/platform-wisdom.md

# 엔진 승격 이력 (정체 감지)
ls docs/engine-notes/
cat docs/engine-notes/cycle-*-promotion.md  # 최근 3개

# 현재 엔진 상태 (파악용)
wc -l public/engine/ix-engine.js
head -50 public/engine/ix-engine.js

# 현재 에이전트 프롬프트 (수정 대상 후보 파악)
grep -c "^  " agents/src/team.ts
```

### 2. 추세 판정 (디시플린별)

주어진 trendSummary 데이터에서 각 discipline의 3사이클 점수 추이를 확인:

- **IMPROVING**: 단조 증가 + Δ > 2
- **DECLINING**: 단조 감소 + Δ < -2
- **VOLATILE**: max-min > 20
- **STABLE**: 그 외

### 3. 우선순위 규칙

1. **DECLINING** discipline이 있으면 **최우선**
2. 동률이면 **가장 점수 낮은** discipline 우선
3. 모두 STABLE/IMPROVING이면 **VOLATILE** 안정화
4. 모두 건강하면 **정체된 discipline의 점프** 노리기 (과감한 제안)

### 4. 패턴 탐지 (디시플린별 signal 체크)

#### 🎯 planning
- `specCompleteness < 0.8` 3회 반복 → **SPEC_RULE**: 누락 섹션을 planner 프롬프트에 명시 추가
- `genreDupCount >= 2` → **GENRE_ROTATION**: 최근 중복 차단 로직 강화
- `refChainValid < 0.7` 반복 → **PROMPT_REFERENCE_ENFORCE**: planner가 변형 에셋 ref 강제

#### 💻 development
- `customStateMachines > 0` 반복 → **PROMPT_RULE**: coder 최우선 규칙 추가
- `engineAdoption` 하락 추세 → **ENGINE_API** 또는 **SKILL_UPDATE**: 실제로 엔진이 부족한지 점검
- `directListenerCount > 0` 반복 → **SKILL_UPDATE**: game-template에 Scene.setTimeout 사용 예시 강화
- `onResetCoverage < 0.9` 반복 → **ENGINE_API**: IX.GameFlow에 debugAssertReset 옵션 추가
- `enginePromotions = 0` 3회 연속 → **PIPELINE_PHASE**: 승격 phase가 유명무실 → 프롬프트 강화

#### 🎨 art
- `stylePurity < 0.9` 반복 → **STYLE_CUE_TUNE**: ART_STYLES cue 문장 강화 / image/prompts.ts 수정
- `charConsistency < 0.8` → **PROMPT_REFERENCE_ENFORCE**: variation 에셋은 항상 ref 사용 + 검증 강화
- `assetVerifyRate < 0.9` → **STYLE_CUE_TUNE** 또는 image/verify.ts 임계값 조정
- `failedAssetCount > 0` 반복 (특정 asset id) → prompts.ts에 해당 에셋 타입 전용 템플릿 추가

#### 🔍 qa
- `firstRoundVerdict != APPROVED` 3회 연속 → **REVIEW_CHECK** 강화 또는 coder 프롬프트 보강
- `buttonAuditPass < 1.0` 반복 → **REVIEW_CHECK**: button-audit skill 호출 강제
- `stuckStateBugs > 0` 반복 → **REVIEW_CHECK**: reviewer 체크리스트에 신규 항목 추가
- `deployVerifyPass = FAIL` → **PIPELINE_PHASE**: deployer 검증 로직 보강

### 5. Cross-cutting 패턴

- **기획↔개발 괴리**: plannerReworkCount 높고 engineAdoption 낮음 → 기획서가 엔진 몰라서 생기는 재작업. planner 프롬프트에 엔진 개요 삽입.
- **아트↔QA 괴리**: art score는 양호한데 qa 재시도 많음 → 에셋은 좋으나 게임에서 활용 안됨. asset-consistency를 coder 단계에서도 호출.
- **전체 동반 하락**: 4개 discipline 모두 DECLINING → 구조적 문제. PIPELINE_PHASE 제안 (HIGH safety).

### 6. 제안 작성 (output format — 엄격 준수)

**파일**: `docs/evolution/proposal-cycle-<N>.md`

```markdown
---
cycle: <N>
basedOn: [<N-2>, <N-1>, <N>]
generatedAt: <ISO timestamp>
---

# Evolution Proposal — Cycle <N>

## 추세 요약

| Discipline | <N-2> | <N-1> | <N> | Trend | Action |
|-----------|-------|-------|-----|-------|--------|
| planning   | 82    | 78    | 74  | DECLINING | YES (#1, #2) |
| development | 80   | 82    | 85  | IMPROVING | — |
| art        | 68    | 70    | 73  | IMPROVING | — |
| qa         | 85    | 86    | 87  | STABLE | — |

**우선순위**: planning DECLINING → 최우선 개선

---

## 제안 #1
- discipline: planning
- pattern: specCompleteness 평균 0.67 (에셋요구/재시작 섹션 반복 누락)
- category: PROMPT_RULE
- safety: LOW
- title: planner 프롬프트에 "재시작 시나리오 섹션" 의무화
- target-file: agents/src/cycle.ts
- rationale: 3사이클 모두 spec에 재시작 시나리오 섹션 누락 → coder가 재시작 로직을 즉흥 구현 → onReset 누락 빈발

\`\`\`diff-old (path: agents/src/cycle.ts)
      기획서 맨 위 YAML front-matter (반드시 아래 필드 모두 채울 것):
      ---
      game-id: [영문-소문자-하이픈]
\`\`\`
\`\`\`diff-new
      기획서에 반드시 포함할 섹션:
      - 재시작 시나리오 (게임 오버 후 RESTART 버튼 → 초기화되는 변수 리스트)

      기획서 맨 위 YAML front-matter (반드시 아래 필드 모두 채울 것):
      ---
      game-id: [영문-소문자-하이픈]
\`\`\`

---

## 제안 #2
- discipline: cross (planning+qa)
- pattern: reviewer가 같은 재시작 버그를 3사이클 지적했는데 planner 측이 수정 안함
- category: REVIEW_CHECK
- safety: MEDIUM
- title: reviewer → planner 피드백 루프 강화
- target-file: agents/src/cycle.ts
- rationale: ...

(MEDIUM은 diff 있어도 자동 적용 안 됨 — 수동 머지 대기)
\`\`\`diff-old (path: agents/src/cycle.ts)
...
\`\`\`
\`\`\`diff-new
...
\`\`\`
```

### 7. Safety 판정 기준 (엄격 — LOW/MEDIUM 모두 자동 적용됨)

| Safety | 정의 | 예시 | 자동 적용? |
|--------|------|------|-----------|
| **LOW** | 파일 뒤에 섹션 추가 / 스킬 문구 보강 / 새 메서드 추가 / 새 skill 파일 | 기존 동작에 영향 0 | ✅ YES |
| **MEDIUM** | 기존 프롬프트 rule 수정 / skill 절차 변경 / 엔진 기존 API에 파라미터 추가 | 영향 제한적, 하위호환 유지 | ✅ YES (기본) |
| **HIGH** | cycle.ts phase 순서 변경 / agent 역할 정의 교체 / scoring 공식 교체 / 기존 API 시그니처 변경 | 구조적 영향 | ✅ YES (EVOLVER_AUTO_APPLY=HIGH 기본) |

**LOW 판정 기준** (반드시 근거에 명시):
- "다른 파일·다른 경로의 동작에 영향이 없음" 을 근거로 설명
- 추가만 하고 삭제·수정 없음

**MEDIUM 판정 기준** (반드시 rationale에 포함):
- 영향 범위: 어떤 호출자/로직이 영향받는지 명시 (예: "team.ts의 coder 프롬프트만 수정, cycle.ts 영향 없음")
- 하위호환: 시그니처 변경은 기본값 있는 파라미터 추가만 허용 (기존 호출부 변경 불필요)
- rollback: `git tag evolve/cycle-<N>` 로 즉시 원복 가능함 확인

**HIGH 로 분류해야 하는 것** (자동 적용되지만 rollback 경로 필수):
- cycle.ts 의 phase 순서/개수 변경
- agent role(team.ts) 의 description 또는 핵심 책임 변경
- metrics.ts 의 score 공식 교체 (가중치 변경은 MEDIUM 가능)
- ix-engine.js 의 기존 export 제거/시그니처 축소
- skill 삭제

### 8. 제한 사항

- 제안 총 **최대 6개** (3사이클 × 2 discipline × 1 개 기준)
- 제안 없이 "모든 discipline이 건강함, 제안 없음" 결론도 **정당**
- 억지로 제안 만들지 말 것 — 과적합 방지
- 각 제안에 **반드시 diff block 포함** (자동 적용 필수)

### 9. Apply 자동화 규격

`apply-proposal.ts`가 파싱 가능하려면:
- `## 제안 #<N>` 로 섹션 시작
- 필드는 `- <key>: <value>` 형태
- Edit용: ` ```diff-old (path: <file>)` ... ` ``` ` + ` ```diff-new ` ... ` ``` ` 짝
- Write(신규 파일)용: ` ```diff-new (full: <file>) ` ... ` ``` `
- `diff-old`의 텍스트는 **타겟 파일에 정확히 유일하게 존재**해야 함 (유일성 필수)

## 체크리스트

- [ ] 3사이클 metrics/postmortem/wisdom 모두 읽음
- [ ] 디시플린별 추세 판정표 작성
- [ ] DECLINING 우선 원칙 준수
- [ ] 제안 ≤ 6개
- [ ] 각 제안에 diff block 포함
- [ ] LOW 판정에 영향 분석 근거 포함
- [ ] old_string은 target-file에 **유일하게** 존재함을 grep 으로 확인
