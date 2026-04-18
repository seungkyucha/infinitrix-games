---
cycle: 4
applied: 0
deferred: 1
failed: 2
---

# Evolution Apply Report — Cycle 4

## 보류됨 (수동 검토 필요)
- #3 **[/]**  — *safety=, auto-threshold=MEDIUM*

## 적용 실패 (rollback 완료)
- #1 **[development/METRIC_FIX]** resetGameState/onReset 본문 추출을 brace-balanced 스캐너로 대체 — 객체 리터럴·중첩 블록 있어도 함수 전체 본문 포착 — *old_string not found in target*
- #2 **[development/METRIC_FIX]** engineAdoption 분모에서 언어 내장(Math/JSON/Object/Array/Number/String/console/Set/Map/parseInt/parseFloat/isNaN/isFinite) 호출 제외 — *old_string not found in target*
