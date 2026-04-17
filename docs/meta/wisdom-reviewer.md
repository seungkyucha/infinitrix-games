# reviewer 누적 지혜
_마지막 갱신: 사이클 #1 (2차 리뷰)_

## 반복되는 실수 🚫
1. [Cycle 1] file:// 프로토콜로 게임 열면 `/engine/ix-engine.js` 절대경로 로드 실패 — 반드시 http-server로 로컬 서빙 후 테스트
2. [Cycle 1] Puppeteer evaluate에서 `await`는 top-level에서 불가 — `setTimeout` + `document.title`로 비동기 결과 전달
3. [Cycle 1] `const canvas` 중복 선언 에러 — evaluate 블록마다 변수명 `_v1`, `_v2` 등 접미사 사용
4. [Cycle 1] Button._active 배열이 for-of 도중 mutation되면 새 버튼이 같은 키를 이중 소비 — LOBBY→PLAY Space키 충돌 발견

## 검증된 성공 패턴 ✅
1. [Cycle 1] 3회 사이클 자동화 테스트: `_runCycle(n, cb)` 재귀 패턴으로 GAMEOVER→LOBBY→PLAY→GAMEOVER 반복, `document.title`에 JSON 결과 저장
2. [Cycle 1] IX.Scene.current로 씬 전환 즉시 확인 가능 — 별도 대기 불필요
3. [Cycle 1] manifest.json `replacedAssets` 필드에 디자이너가 이미 불일치 기록 — 리뷰 전 반드시 확인
4. [Cycle 1] Button._active 배열로 현재 활성 버튼 목록 조회 가능 — 씬별 전환 후 조회하면 전수 감사 가능
5. [Cycle 1] 마우스 클릭 테스트: canvas.dispatchEvent(MouseEvent)로 게임 내 좌표 변환 검증 가능 — tapToTile 정확도 확인에 유용
6. [Cycle 1] 에셋 이미지는 Read 도구로 직접 열람 가능 — 캐릭터 일관성 시각 비교에 필수

## 다음 사이클 적용 사항 🎯
1. http-server를 테스트 시작 시 바로 실행할 것 (file:// 시도 낭비 방지)
2. 버튼 감사 시 씬별 순회하며 Button._active 전수 조회 — 크기/키/onClick 한번에 수집
3. 에셋 일관성: manifest.json replacedAssets를 먼저 읽고, thumbnail↔player 시각 비교를 반드시 수행
