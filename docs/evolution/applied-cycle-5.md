---
cycle: 5
applied: 1
deferred: 3
failed: 2
---

# Evolution Apply Report — Cycle 5

## 자동 적용됨 (LOW 0건 / MEDIUM 1건)
- 🟡 MEDIUM #1 **[development/METRIC_FIX]** onReset 함수 참조 패턴 추적 — `onReset: <identifier>` 발견 시 해당 이름의 `function <id>(...){...}` 본문 추출 → `agents/src/metrics.ts`

## 보류됨 (수동 검토 필요)
- #4 **[/]**  — *safety=, auto-threshold=MEDIUM*
- #5 **[/]**  — *safety=, auto-threshold=MEDIUM*
- #6 **[/]**  — *safety=, auto-threshold=MEDIUM*

## 적용 실패 (rollback 완료)
- #2 **[art/METRIC_FIX]** stylePurity 비교에 토큰 단위 매치 추가 — canonical 을 하이픈/공백으로 split, 모든 토큰이 manifest 에 존재하면 MATCH — *old_string not found in target*
- #3 **[qa/METRIC_FIX]** reviewRounds 를 review 파일 YAML front-matter `reviewRound: N` 에서 1차 우선 추출, 실패 시 기존 regex 폴백 — *old_string not found in target*
