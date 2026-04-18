---
cycle: 3
applied: 0
deferred: 1
failed: 3
---

# Evolution Apply Report — Cycle 3

## 보류됨 (수동 검토 필요)
- #4 **[/]**  — *safety=, auto-threshold=MEDIUM*

## 적용 실패 (rollback 완료)
- #1 **[development/METRIC_FIX]** enginePromotions 섹션 종료 앵커에 lookbehind 추가 — `(?<!#)##(?!#)` 로 `###` 중간 매치 완전 차단 — *old_string not found in target*
- #2 **[art/METRIC_FIX]** stylePurity 비교 전 양쪽 문자열을 영숫자만 남기는 정규화로 하이픈/공백/구두점 차이 흡수 — *old_string not found in target*
- #3 **[art/METRIC_FIX]** charConsistency 와 thumbnail 검사에 .svg 확장자 허용 — "SVG 로 변환된 에셋이 더 좋다" 는 designer 지침과 메트릭을 일치시킴 — *old_string not found in target*
