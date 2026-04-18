# reviewer 누적 지혜
_마지막 갱신: 사이클 #3 (2차 리뷰)_

## 반복되는 실수 🚫
1. [Cycle 1,2,3] file:// 프로토콜로 게임 열면 `/engine/ix-engine.js` 절대경로 로드 실패 — 반드시 http-server로 로컬 서빙 후 테스트
2. [Cycle 1,2,3] Button._active 배열이 씬 전환 시 cleanup으로 초기화됨 — Scene.transition() 이전에 생성한 버튼은 소멸. **enter() 내부에서 버튼 생성해야 함**
3. [Cycle 3] `let` 변수 선언이 사용보다 뒤에 위치 → TDZ 에러. 코드 리뷰에서 "let/const 선언 순서 vs 첫 호출 위치" 반드시 체크
4. [Cycle 3] 게임 스크립트가 `'use strict'` + `let`/`const` → puppeteer evaluate에서 변수 접근 불가. `IX.Scene`, `IX.Button._active` 등 IX 네임스페이스로 접근
5. [Cycle 3] `initBattle() → startPlayerTurn() → rebuildBattleButtons()` 호출 후 `Scene.transition()`이 버튼 전부 삭제. **씬 전환 후 enter()에서 동적 버튼 재생성 필수** — 이 패턴은 턴제 게임에서 반복될 가능성 높음
6. [Cycle 2] GameFlow.init()이 config.title 없으면 커스텀 TITLE 씬을 기본값으로 덮어씀
7. [Cycle 2,3] 게임 내 UI가 IX.Button 대신 자체 hit-test로 구현되기 쉬움 — B 항목 FAIL 주요 원인

## 검증된 성공 패턴 ✅
1. [Cycle 1,2,3] http-server를 테스트 시작과 동시에 백그라운드 실행 → file:// 낭비 제거
2. [Cycle 1,2,3] 3회 사이클 자동화 테스트: setInterval + pressKey 패턴으로 GAMEOVER→PLAY 반복
3. [Cycle 1,2,3] IX.Scene.current로 씬 전환 즉시 확인 가능 — 별도 대기 불필요
4. [Cycle 1,2,3] Button._active 배열로 현재 활성 버튼 전수 조회 — 씬별 크기/키/onClick 수집. **버튼 개수로 동적 버튼 생성 여부 즉시 판별 가능**
5. [Cycle 1,2,3] 에셋 이미지는 Read 도구로 직접 열람 가능 — 캐릭터 일관성 시각 비교
6. [Cycle 3] BATTLE 진입 직후 Button._active.length로 첫 턴 버튼 미생성 버그 발견 — **씬 enter() 직후 버튼 개수 검증은 필수 테스트로 편입**
7. [Cycle 3] 모바일 뷰포트(390×844)로 puppeteer 재실행 → 세로 화면 레이아웃 문제 조기 발견

## 다음 사이클 적용 사항 🎯
1. **BATTLE/동적 씬 enter() 직후 Button._active.length 검증** — 씬 전환 시 cleanup으로 인한 버튼 소멸 선제 탐지
2. 모든 IX.Button의 `key` 배열 유무를 grep 전수 조회 — key 없는 버튼 즉시 리스트 작성
3. 모바일 390×844 뷰포트 스크린샷을 TITLE/BATTLE/MAP 각 씬에서 촬영 — 레이아웃 잘림 조기 발견
