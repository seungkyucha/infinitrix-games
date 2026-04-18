# reviewer 누적 지혜
_마지막 갱신: 사이클 #4_

## 반복되는 실수 🚫
1. [Cycle 1,2,3,4] file:// 프로토콜로 게임 열면 `/engine/ix-engine.js` 절대경로 로드 실패 — 반드시 http-server로 로컬 서빙 후 테스트
2. [Cycle 1,2,3] Button._active 배열이 씬 전환 시 cleanup으로 초기화됨 — **enter() 내부에서 버튼 생성해야 함**
3. [Cycle 2,3] 게임 내 UI가 IX.Button 대신 자체 hit-test로 구현되기 쉬움 — B 항목 FAIL 주요 원인
4. [Cycle 3] `let` 변수 선언이 사용보다 뒤에 위치 → TDZ 에러. 선언 순서 vs 첫 호출 위치 체크
5. [Cycle 3,4] 게임 `'use strict'` + `let/const` → puppeteer evaluate에서 변수 직접 접근 불가. IX 네임스페이스(IX.Scene, IX.Button._active)로 접근
6. [Cycle 2] GameFlow.init()이 config.title 없으면 커스텀 TITLE 씬을 기본값으로 덮어씀
7. [Cycle 4] 모바일 뷰포트 테스트 시 Puppeteer 뷰포트 크기 변경 후 navigate 필수 — 기존 세션에서 스크린샷 크기만 바꾸면 버튼 위치가 이전 뷰포트 기준으로 남음

## 검증된 성공 패턴 ✅
1. [Cycle 1,2,3,4] http-server를 테스트 시작과 동시에 백그라운드 실행 → file:// 낭비 제거
2. [Cycle 1,2,3,4] 3회 사이클 자동화 테스트: setTimeout 체인으로 GAMEOVER→PLAY 반복 + 상태 스냅샷 비교
3. [Cycle 1,2,3,4] IX.Scene.current로 씬 전환 즉시 확인 가능 — 별도 대기 불필요
4. [Cycle 1,2,3,4] Button._active 배열로 현재 활성 버튼 전수 조회 — 씬별 크기/키/onClick 수집
5. [Cycle 1,2,3,4] 에셋 이미지는 Read 도구로 직접 열람 가능 — 캐릭터 일관성 시각 비교
6. [Cycle 3,4] 씬 enter() 직후 Button._active.length로 버튼 미생성 버그 선제 탐지
7. [Cycle 3,4] 모바일 뷰포트(390×844)로 about:blank→navigate 패턴 → 정확한 모바일 레이아웃 테스트
8. [Cycle 4] 셀프 QA 체크리스트가 포함된 게임은 1차 리뷰 APPROVED 가능 — **spec에 셀프 QA 프로토콜 의무화 효과 입증**

## 다음 사이클 적용 사항 🎯
1. **모바일 뷰포트 테스트**: about:blank에서 뷰포트 설정 → navigate → 스크린샷 순서 엄수 (Cycle 4 교훈)
2. **터치 프록시 버튼 vs UI 버튼 구분**: 모바일 전용 입력 프록시(D-pad/액션) 버튼은 key:[] 면제 판정. UI 상태 전환 버튼만 key 필수 검증
3. **셀프 QA 체크리스트 이행 여부 조기 확인**: spec에 셀프 QA가 포함된 경우, 코드에서 풀 플로우 경로 구현 여부를 정적 분석으로 먼저 확인
