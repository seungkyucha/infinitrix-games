---
cycle: 3
basedOn: [1, 2, 3]
generatedAt: 2026-04-18T06:37:27.000Z
---

# Evolution Proposal — Cycle 3

## 추세 요약

| Discipline  | 1  | 2  | 3  | Trend | Action |
|-------------|----|----|----|-------|--------|
| planning    | 98 | 95 | 96 | STABLE (Δ-1.9) | — |
| development | 56 | 60 | 62 | IMPROVING (Δ+6.3) | YES (#1) — 측정 버그 잔존 |
| art         | 68 | 58 | 50 | **DECLINING** (Δ-17.1) 3사이클 단조 감소 | YES (#2, #3) — 측정 버그 2건 |
| qa          | 80 | 80 | 95 | IMPROVING (cycle-3 APPROVED 1차 달성) | — |

**신뢰도**: HIGH (3사이클 추세 확립).

**우선순위 근거**:
- **art DECLINING 3사이클 단조 감소**가 압도적으로 심각하지만, 3사이클 메트릭을 실제 에셋 파일과 교차 분석한 결과 점수 하락의 **주 원인은 에셋 품질이 아니라 메트릭 측정 버그 3건**으로 판명됨. (stylePurity 비교 오류, charConsistency가 .svg base를 인식 못함, thumbnail이 .png만 인정.) 실제 cycle-3 게임은 reviewer가 "전 영역 PASS" + "전 영역 G(에셋 일관성) PASS" 판정했고 APPROVED를 받음 → 점수↔현실 괴리.
- **development enginePromotions=0 이 3사이클 연속**: cycle-2 proposal #1 에서 `(##|$)` → `(##(?!#)|$)` 로 고쳤으나 **수정이 불완전**. `### 1.` 의 2·3번째 `#` 위치에서 `##(?!#)` 가 매치되어(negative lookahead 는 이전 문자를 검사 안 함) body 를 3바이트만 캡처하고 종료됨. cycle-3-promotion.md 로 실측 검증 완료 (body length=3, entries=0). **이미 1회 실패한 수정의 재도전**이므로 신중히 올려야 함.
- **planning·qa** 는 건강함 — 무리한 개입 금지. qa 는 오히려 cycle-3 에서 최초 APPROVED 1차 통과를 달성한 상태라 코더 self-check 추가 제안은 과적합 위험.

**핵심 통찰**: cycle-3 는 reviewer/postmortem 상 **플랫폼 최고 품질 사이클**(APPROVED, 전 영역 PASS, 21버튼 키보드 대응, 3회 재시작 JS에러 0, 모바일 통과)인데 overallScore 는 73.38→74.35 로 거의 동일. **"점수가 현실을 반영 못함" = 메트릭 자체의 신호 품질 문제**. 본 사이클 proposal 은 구조적 개선 대신 **메트릭 정확도 회복에 집중**.

---

## 제안 #1
- discipline: development
- pattern: cycle-1·2·3 모두 `enginePromotions: 0` 보고. cycle-2 proposal #1 에서 `(##|$)` → `(##(?!#)|$)` 수정했으나 **불완전**. 실측 `match[1].length === 3, entries === 0`. 원인: `### 1.` 내부의 2번째·3번째 `#` 위치에서도 `##(?!#)` 가 매치됨 — negative lookahead 는 뒤쪽만 검사하고 앞쪽 `#` 은 검사 안 함. cycle-3-promotion.md 로 `node -e` 실행하여 재현 확인.
- category: METRIC_FIX
- safety: MEDIUM
- title: enginePromotions 섹션 종료 앵커에 lookbehind 추가 — `(?<!#)##(?!#)` 로 `###` 중간 매치 완전 차단
- target-file: agents/src/metrics.ts
- rationale:
  - **근본 원인 (재확인)**: 정규식 `/##\s*승격(?:\s*완료)?([\s\S]*?)(##(?!#)|$)/` 의 `##(?!#)` 는 `### 1.` 에서 다음과 같이 매치됨:
    - 문자열 `###X` (X=공백·개행). position 0: `##` + lookahead(`#`) → 부정 → fail.
    - position 1: `##` + lookahead(`X`) → 부정(non-#) → **PASS** ← 여기서 매치.
    - 따라서 body 캡처가 `\n\n#` (3바이트)에서 조기 종료됨. cycle-3-promotion.md 에서 실증: `m[1]="\n\n#", m[2]="##"`. entry count=0.
  - **해결책**: 앞쪽 lookbehind `(?<!#)` 추가. `(?<!#)##(?!#)` 는 "앞에도 `#` 없고 뒤에도 `#` 없는" 정확한 `##` 경계만 매치. cycle-3-promotion.md 로 실측 검증: body length=1138, entries=12. Node 10+ 는 lookbehind 지원(이 프로젝트는 ES2022 target).
  - **영향 범위**:
    1. `agents/src/metrics.ts:161` 한 줄만 수정. `promoSection` 바인딩은 파일 내 유일(위 grep 1건).
    2. 다른 signal/공식/시그니처 불변. `enginePromotions` 타입(number)·이름·상한(`Math.min(15, x*5)`) 모두 유지.
    3. cycle.ts·team.ts·agent 프롬프트 영향 0.
  - **하위호환**:
    1. 정상 섹션 경계(`## 보류`, `## 향후`)는 기존과 동일하게 매치(앞/뒤 모두 `#` 없음) → 현재 정상 동작하는 케이스 변경 없음.
    2. lookbehind 추가는 기존 매치를 **축소만** 하지 확장하지 않음 → 거짓 양성 리스크 0.
    3. 이미 저장된 cycle-1.json~cycle-3.json 은 재계산되지 않음(JSON 파일은 수정 대상 아님). 다음 사이클부터 signal 개선.
    4. score 상한 15점 유지 → 점수 급등 없음. cycle-3 제안 승격 note 가 (실수 2건) × 5 = 10~15점 보정되는 수준.
  - **부작용 검토**: 실제 `###` + lookbehind 동작을 다음 3 케이스로 검증.
    1. `## 승격\n\n### 1. X\n- a\n## 보류` → lookbehind 포함 버전: body 에 `### 1. X\n- a\n` 캡처, entries=1. ✅
    2. `## 승격\n` 만 있고 이후 아무것도 없음 → `$` 분기 매치, body=`\n`, entries=0. ✅ (변경 없음)
    3. `## 승격\n#### h4\n- a\n## 보류` → `####` 에서 lookbehind 포함 버전은 "앞 `#` 있음" 부정 → 모두 fail. `## 보류` 에서 매치. body=`\n#### h4\n- a\n`, entries=1. ✅
  - **영향받는 코드 경로**: `metrics.ts:161` 1줄. 검증: 다음 cycle-4.json 의 `enginePromotions >= 1` 이면 수정 성공.
  - **rollback**: `git tag -d evolve/cycle-3 && git reset --hard HEAD~1`. cycle-2 proposal #1 의 lookahead-only 버전으로 롤백됨(그것도 불완전하지만 현 상태와 동일한 signal 을 생성하므로 무해).

```diff-old (path: agents/src/metrics.ts)
  const promoSection = inp.enginePromotionText.match(/##\s*승격(?:\s*완료)?([\s\S]*?)(##(?!#)|$)/)
```
```diff-new
  const promoSection = inp.enginePromotionText.match(/##\s*승격(?:\s*완료)?([\s\S]*?)((?<!#)##(?!#)|$)/)
```

---

## 제안 #2
- discipline: art
- pattern: `stylePurity: 0.5` 3사이클 연속 고정. 실제 에셋은 reviewer 가 매번 스타일 일관성 PASS 판정. 원인: 비교 로직이 `spec.art-style` 단축 슬러그(예: `low-poly-3d`, `pixel-art-16bit`)와 `manifest.artDirection.style` 자연어 문장(예: `Low-poly 3D render style: flat-shaded polygons...`)을 **정규화 없이** `slice(0,20)` 단순 부분문자열 포함 검사하여, **하이픈-공백 차이·대소문자·공백·구두점** 때문에 cycle-1~3 전부 fail → 0.5 고정.
- category: METRIC_FIX
- safety: MEDIUM
- title: stylePurity 비교 전 양쪽 문자열을 영숫자만 남기는 정규화로 하이픈/공백/구두점 차이 흡수
- target-file: agents/src/metrics.ts
- rationale:
  - **근본 원인**: cycle-3 실측으로 검증.
    - specStyle(lowercased) = `"low-poly-3d"` (길이 11)
    - manifestStyle(lowercased) = `"low-poly 3d render style: flat-shaded polygons, geometric forms, ps1/n64 era look, visible triangulation."` (길이 108)
    - `specStyle.includes(manifestStyle.slice(0,20))` → `"low-poly-3d".includes("low-poly 3d render s")` → **false** (하이픈 vs 공백).
    - `manifestStyle.includes(specStyle.slice(0,20))` → `"low-poly 3d ...".includes("low-poly-3d")` → **false** (공백 vs 하이픈).
    - 결과 0.5. cycle-1(`pixel-art-16bit` vs `"32bpp pixel art, 16-bit era SNES"`), cycle-2(`pixel-art-32bit` vs 유사) 도 동일 패턴.
  - **해결책**: 양쪽을 `replace(/[^a-z0-9]/g, '')` 로 정규화 후 includes 검사. 하이픈·공백·콜론·punctuation 모두 제거되어 `"lowpoly3d"` vs `"lowpoly3drenderstyleflatshaded..."` 비교. `normMani.includes(normSpec.slice(0,20))` → `"lowpoly3drender...".includes("lowpoly3d")` → **true** → stylePurity=1. cycle-1·2 도 동일하게 true 로 복원.
  - **영향 범위**:
    1. `agents/src/metrics.ts:206-213` 의 stylePurity 블록 내부만 수정. 블록 외 코드·signal 이름·공식·반환 타입 모두 불변.
    2. `agents/src/metrics.ts` 내 `stylePurity: manifest.art-style` 주석은 파일 내 유일(위 grep 1건) → diff-old 유일성 보장.
    3. cycle.ts·team.ts·image/verify.ts 영향 0.
  - **하위호환**:
    1. 기본값 `stylePurity = 1` 과 `try/catch` 구조 유지. 값 범위 `{0.5, 1}` 그대로.
    2. 이미 정상 매치되던 케이스(가상의 `"pixel-art-16bit"` vs `"pixel-art-16bit..."` 직접 포함)는 정규화 후에도 여전히 매치 → 기존 true 가 false 로 뒤집히는 경우 없음. 정규화는 **매치를 확장만** 하지 축소하지 않음.
    3. 이미 저장된 cycle-1~3 json 은 재계산되지 않음. cycle-4 부터 stylePurity 가 정확해짐 → art score 약 +12.5점 복원 예상 (cycle-3 기준 62.85 → 75 추정). 이는 **측정 오류 교정**이므로 의도된 회복.
    4. 양쪽 중 하나라도 빈 문자열이면 `if (specStyle && manifestStyle)` 가드로 skip → NaN/crash 없음.
  - **부작용 검토**:
    1. 짧은 슬러그(예: `"2d"`)가 긴 manifest 문장에 우연 포함될 수 있음 → 거짓 양성 가능. 그러나 `slice(0,20)` 로 비교 길이를 제한하므로 "manifest 앞 20자에 spec 슬러그 전체가 있는지" 검사 → manifest 가 spec 기반 자연어 확장이 아닌 한 우연 매치 희박.
    2. 20자 미만 슬러그(`"2d"` 2자 등)는 spec-포함-manifest 방향이 매우 짧은 2자만 검사해 false positive 증가 가능 → 그러나 현재 플랫폼의 art-style 슬러그 최소 길이는 8자 이상(`"low-poly-3d"=9자 정규화후`)이라 실용적 위험 낮음. 향후 2자 슬러그 추가되면 재평가.
  - **영향받는 코드 경로**: `metrics.ts:206-213` (stylePurity 블록). 검증: cycle-4.json 의 `stylePurity == 1` 이면 성공(manifest 와 spec 양자 다 정상 입력된 경우).
  - **rollback**: `git tag -d evolve/cycle-3 && git reset --hard HEAD~1`.

```diff-old (path: agents/src/metrics.ts)
  // stylePurity: manifest.art-style matches spec (string equality after trim)
  let stylePurity = 1
  try {
    const m = JSON.parse(inp.manifestText || '{}') as { artDirection?: { style?: string } }
    const manifestStyle = (m.artDirection?.style ?? '').toLowerCase()
    const specStyle = extractYaml(inp.specText, 'art-style').toLowerCase()
    if (specStyle && manifestStyle) {
      stylePurity = specStyle.includes(manifestStyle.slice(0, 20)) || manifestStyle.includes(specStyle.slice(0, 20)) ? 1 : 0.5
    }
  } catch { /* default 1 */ }
```
```diff-new
  // stylePurity: manifest.art-style matches spec (normalize: strip non-alphanumerics to absorb hyphen/space/punct differences)
  let stylePurity = 1
  try {
    const m = JSON.parse(inp.manifestText || '{}') as { artDirection?: { style?: string } }
    const manifestStyle = (m.artDirection?.style ?? '').toLowerCase()
    const specStyle = extractYaml(inp.specText, 'art-style').toLowerCase()
    if (specStyle && manifestStyle) {
      const norm = (s: string) => s.replace(/[^a-z0-9]/g, '')
      const ns = norm(specStyle)
      const nm = norm(manifestStyle)
      stylePurity = (ns && nm && (ns.includes(nm.slice(0, 20)) || nm.includes(ns.slice(0, 20)))) ? 1 : 0.5
    }
  } catch { /* default 1 */ }
```

---

## 제안 #3
- discipline: art
- pattern: cycle-3 `charConsistency: 0.714` (1→1→0.714 하락), `thumbnailFromGameAssets: false` (cycle-2·3 연속). 실측: cycle-3 manifest 에 7개 ref-변형 중 2개(`cardFrameUncommon`, `cardFrameRare`)의 base 가 `card-frame-common.svg` 로만 존재(PNG 버전 없음) → 현재 메트릭의 `a.file === "${ref}.png"` 하드코딩 체크가 fail. 또 `thumbnail.svg` 는 매니페스트에 정상 등록됐지만 `existsSync("thumbnail.png")` 만 검사해 false. **designer wisdom 에 따라 cycle-2 proposal #2 가 "변형 에셋은 SVG 로 제작" 을 권고한 직접적 결과로 base/thumbnail 도 SVG 가 늘었는데, 메트릭은 이 변화를 반영 못함** → "지시 따르면 점수 내려감" 역설.
- category: METRIC_FIX
- safety: MEDIUM
- title: charConsistency 와 thumbnail 검사에 .svg 확장자 허용 — "SVG 로 변환된 에셋이 더 좋다" 는 designer 지침과 메트릭을 일치시킴
- target-file: agents/src/metrics.ts
- rationale:
  - **근본 원인**:
    1. `charConsistency`: `Object.values(m.assets).find(a => a.file === \`${v.ref}.png\`)` — base 가 `.svg` 인 경우 항상 undefined. cycle-3 실측: 7 쌍 중 2 쌍(`card-frame-common.svg` 참조) 누락 → 5/7 = 0.714.
    2. `thumbnailFromGameAssets`: `existsSync(resolve(assetsDir, 'thumbnail.png'))` 만 체크. cycle-2·3 모두 `thumbnail.svg` 로 생성했으나 false. cycle-2 proposal #3 에서 코더 self-check 에 "thumbnail.png 또는 thumbnail.svg" 를 명시했는데도 **메트릭은 .png 만 인정**하는 비대칭.
  - **해결책**: 두 군데 모두 `.png` OR `.svg` 허용.
    1. charConsistency: `a.file === \`${v.ref}.png\` || a.file === \`${v.ref}.svg\``
    2. thumbnail: `existsSync(... 'thumbnail.png') || existsSync(... 'thumbnail.svg')`
  - **영향 범위**:
    1. `agents/src/metrics.ts:216-217` (thumbnail 블록), `metrics.ts:219-231` (charConsistency 블록) 두 블록 수정. 파일 내 anchor 문자열 각각 유일(위 grep 각 1건).
    2. signal 이름·타입·공식 불변. score 공식(각 25점·10점 가중) 불변.
    3. cycle.ts·team.ts·image/verify.ts·prompts.ts 영향 0.
  - **하위호환**:
    1. 기존에 true 였던 모든 케이스 유지(.png base 가 여전히 매치). .svg base 만 추가로 true 됨.
    2. score 상승 방향만 가능(매치 추가만). score 하락 케이스 없음 → 기존 사이클 상대 비교에서 퇴행 없음.
    3. 이미 저장된 json 은 재계산 안 됨. cycle-4 부터 반영.
    4. cycle-3 기준 복원: charConsistency 0.714→1 (+7.1점), thumbnail false→true (+10점) → art score +17.1 회복 예상(50.35→67.5, cycle-1 수준).
  - **부작용 검토**:
    1. manifest 에 `.svg` base 가 있는데 파일은 실제 없는 경우 → 기존과 동일하게 `existsSync(variant)` 가 함께 검사하므로 **variant 가 없으면 여전히 fail** → 거짓 양성 없음.
    2. thumbnail.png 와 thumbnail.svg 가 둘 다 있는 경우 → 기존 true 유지. 문제 없음.
    3. 향후 webp/avif 등 다른 확장자 등장 시 재확장 필요하지만 현재는 SVG 까지만 허용하면 충분(image/verify.ts 도 png/svg 만 처리).
  - **영향받는 코드 경로**: `metrics.ts:216-231` 2블록. 검증: cycle-4.json 에서 `thumbnailFromGameAssets == true`(manifest 에 thumbnail 있을 때) + `charConsistency` 가 실제 ref-쌍 비율과 일치.
  - **rollback**: `git tag -d evolve/cycle-3 && git reset --hard HEAD~1`.

```diff-old (path: agents/src/metrics.ts)
  // thumbnail-from-game-assets: heuristic — thumbnail.png exists and verify passed (we lack bytes comparison here)
  const thumbnailExists = existsSync(resolve(inp.assetsDir, 'thumbnail.png'))

  // charConsistency: we don't compute pixel diff here (heavy); use a ref-pair-exists proxy
  let charConsistency = 1
  try {
    const m = JSON.parse(inp.manifestText || '{}') as { assets?: Record<string, { ref?: string; file?: string }> }
    const pairs = Object.entries(m.assets ?? {}).filter(([, v]) => !!v.ref)
    if (pairs.length > 0) {
      const bothExist = pairs.filter(([, v]) => {
        const baseFile = Object.values(m.assets ?? {}).find(a => a.file === `${v.ref}.png`)
        return !!baseFile && existsSync(resolve(inp.assetsDir, v.file ?? ''))
      }).length
      charConsistency = bothExist / pairs.length
    }
  } catch { /* default */ }
```
```diff-new
  // thumbnail-from-game-assets: heuristic — thumbnail.png OR thumbnail.svg exists (designer wisdom prefers SVG for variants)
  const thumbnailExists = existsSync(resolve(inp.assetsDir, 'thumbnail.png'))
    || existsSync(resolve(inp.assetsDir, 'thumbnail.svg'))

  // charConsistency: we don't compute pixel diff here (heavy); use a ref-pair-exists proxy (accept .png or .svg base)
  let charConsistency = 1
  try {
    const m = JSON.parse(inp.manifestText || '{}') as { assets?: Record<string, { ref?: string; file?: string }> }
    const pairs = Object.entries(m.assets ?? {}).filter(([, v]) => !!v.ref)
    if (pairs.length > 0) {
      const bothExist = pairs.filter(([, v]) => {
        const baseFile = Object.values(m.assets ?? {}).find(a =>
          a.file === `${v.ref}.png` || a.file === `${v.ref}.svg`,
        )
        return !!baseFile && existsSync(resolve(inp.assetsDir, v.file ?? ''))
      }).length
      charConsistency = bothExist / pairs.length
    }
  } catch { /* default */ }
```

---

## 제안 없음 (planning, qa)

- **planning** (98→95→96, STABLE): specCompleteness 0.83 3사이클 고정, refChainValid 1→0.75→0.875 로 회복 추세, postmortemDepth 13+ 유지. 루트코즈 없음 → 개입 시 **과적합 위험**.
- **qa** (80→80→95, IMPROVING): cycle-3 에서 최초 APPROVED 1차 통과 달성. firstRoundVerdict=APPROVED, restartVerifyPass=true, stuckStateBugs=0. cycle-2 proposal #3 (코더 self-check) 적용 효과가 나타난 상태 → 추가 규칙을 부과하면 **프롬프트 비대화**만 초래.

## 왜 프롬프트·엔진 수정이 아닌 메트릭 수정 3건인가

- 3사이클 wisdom 누적 결과, 플랫폼의 **실제 품질은 cycle-3 에 정점** 도달 (APPROVED, 전 영역 PASS, 21 버튼 키보드 대응, 모바일 PASS).
- 그럼에도 overallScore 는 **거의 개선 안 됨** (73.38→71.30→74.35): art 와 development 의 signal 공식이 "실제 현실"을 반영 못하기 때문.
- 프롬프트를 더 추가하는 대신 **측정 기준 자체를 교정**하여, 다음 사이클부터는 신호가 노이즈가 아니라 실제 품질을 추적하도록 함 → Evolver 루프의 근본 자기교정.
- 단, 메트릭 수정 3건이 모두 **값을 올리는 방향** 이라 safety 는 MEDIUM 으로 보수 분류. 이미 저장된 JSON 은 재계산 안 되고 cycle-4 부터 반영되므로 급격한 점프가 트렌드 시각화에 보여도 실제 게임 품질 변화 아님을 **대시보드 해석 시 유의 필요**.

## 체크리스트

- [x] 3사이클 metrics / postmortem / wisdom / engine-promotion / 이전 proposal+applied 모두 읽음
- [x] 디시플린별 추세 판정표 작성 + HIGH 신뢰도(3사이클) 명시
- [x] DECLINING (art) 우선 + 3사이클 누적 측정 버그(development) 병행
- [x] 제안 ≤ 6개 (총 3개 — art 2·dev 1)
- [x] 각 제안에 diff block 포함 (apply-proposal.ts 파싱 형식 준수)
- [x] MEDIUM 판정 3건 모두 "영향 분석·하위호환·rollback" 3항목 포함
- [x] diff-old 텍스트가 target-file 에 유일함 grep 확인 완료 (metrics.ts:161 / :205-213 / :216-231 각 1건)
- [x] cycle-1·2 적용 proposals 와 중복 없음(cycle-2 #1 의 잔존 버그 재수정, cycle-2 #3 과 비대칭이던 메트릭 정합성 맞춤)
- [x] 실측 검증: node -e 로 cycle-3-promotion.md 에 lookbehind 적용 시 body=1138 / entries=12 확인
- [x] 실측 검증: cycle-3 manifest/spec 에 정규화 적용 시 stylePurity=1 로 복원 확인
