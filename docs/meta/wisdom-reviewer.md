# reviewer 누적 지혜
_마지막 갱신: 사이클 #2 (1차 리뷰)_

## 반복되는 실수 🚫
1. [Cycle 1] file:// 프로토콜로 게임 열면 `/engine/ix-engine.js` 절대경로 로드 실패 — 반드시 http-server로 로컬 서빙 후 테스트
2. [Cycle 1] Puppeteer evaluate에서 `await`는 top-level에서 불가 — `setTimeout` + `document.title`로 비동기 결과 전달
3. [Cycle 1] `const canvas` 중복 선언 에러 — evaluate 블록마다 변수명 `_v1`, `_v2` 등 접미사 사용
4. [Cycle 1,2] Button._active 배열이 씬 전환 시 mutation — Space키 이중 소비, 씬 건너뜀 등 발생 가능
5. [Cycle 2] GameFlow.init()이 config.title 없으면 커스텀 TITLE 씬을 기본값으로 덮어씀 — 난이도 선택 등 커스텀 흐름이 죽은 코드가 됨
6. [Cycle 2] 레벨업 카드 등 게임 내 UI가 IX.Button 대신 자체 hit-test로 구현되기 쉬움 — B 항목 FAIL의 주요 원인

## 검증된 성공 패턴 ✅
1. [Cycle 1,2] 3회 사이클 자동화 테스트: `_runCycle(n)` 재귀 패턴으로 GAMEOVER→PLAY 반복, `document.title`에 JSON 결과 저장
2. [Cycle 1,2] IX.Scene.current로 씬 전환 즉시 확인 가능 — 별도 대기 불필요
3. [Cycle 1,2] manifest.json의 note/replacedAssets 필드에 디자이너가 이미 불일치 기록 — 리뷰 전 반드시 확인
4. [Cycle 1,2] Button._active 배열로 현재 활성 버튼 전수 조회 — 씬별 크기/키/onClick 한번에 수집
5. [Cycle 1,2] 에셋 이미지는 Read 도구로 직접 열람 가능 — 캐릭터 일관성 시각 비교에 필수
6. [Cycle 2] http-server를 테스트 시작과 동시에 백그라운드 실행 → file:// 낭비 제거, 즉시 puppeteer 테스트 가능
7. [Cycle 2] assets.sprites/assets.failed로 에셋 로드 성공/실패 전수 확인 가능

## 다음 사이클 적용 사항 🎯
1. GameFlow.init 호출 시 config.title 유무 반드시 확인 — 커스텀 TITLE이 덮어쓰이는지 코드 리뷰 단계에서 잡을 것
2. IX.Button이 아닌 커스텀 UI(오버레이 카드, 인벤토리 등)를 grep으로 선제 탐지 — `UI.hitTest` / `inp.tapped` 직접 사용 패턴
3. manifest.json의 note 필드를 먼저 읽고, 불일치 에셋을 Read로 시각 비교한 후 코드에서 실제 사용 여부까지 추적
