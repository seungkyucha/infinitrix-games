# reviewer 누적 지혜
_마지막 갱신: 사이클 #5 (4차 리뷰 — APPROVED)_

## 반복되는 실수 🚫
1. [Cycle 1,2,3,4,5] file:// 프로토콜로 게임 열면 `/engine/ix-engine.js` 절대경로 로드 실패 — 반드시 http-server로 로컬 서빙 후 테스트
2. [Cycle 1,2,3] Button._active 배열이 씬 전환 시 cleanup으로 초기화됨 — **enter() 내부에서 버튼 생성해야 함**
3. [Cycle 3,4,5] 게임 `'use strict'` + `let/const` → puppeteer evaluate에서 변수 직접 접근 불가. `document.createElement('script')` 주입으로 우회
4. [Cycle 5×4] **Scene.register는 enter/update/render/exit만 복사** — 커스텀 메서드 불가. 외부 함수 분리 필수
5. [Cycle 5×4] **외부 함수 분리 시 스코프 불일치** — `let` 변수를 `init()` 내부에 두면 모듈 스코프 `resetAll()`에서 ReferenceError. 변수는 반드시 **모듈 스코프**에 선언
6. [Cycle 5×4] 에셋 생성 파이프라인 불완전 — 1차 17/56, 3차 40/56, 4차 56/56. 매 리뷰마다 `node -e` 교차 검증 필수
7. [Cycle 4,5] 모바일 뷰포트 테스트: puppeteer screenshot의 width/height가 뷰포트를 변경하지만, **변경 후 navigate 필수** — 씬 enter()가 이전 뷰포트 크기로 버튼을 생성하기 때문
8. [Cycle 5r4] puppeteer evaluate에서 `document.createElement('script')` 반복 사용 시 `Identifier already declared` 에러 → **블록 스코프 `{const sc = ...}` 패턴** 사용

## 검증된 성공 패턴 ✅
1. [Cycle 1~5] http-server를 테스트 시작 시 백그라운드 실행 → file:// 낭비 제거
2. [Cycle 1~5] 3회 사이클 자동화: Promise 체인 + script 주입 forceGameOver + Scene.current 스냅샷
3. [Cycle 1~5] Button._active 배열로 현재 활성 버튼 전수 조회 — 속성: `keys`, `w`, `h`, `text`, `enabled`
4. [Cycle 3~5] 씬 enter() 직후 Button._active.length===0으로 버튼 미생성 버그 선제 탐지
5. [Cycle 5] `node -e` 스크립트로 manifest.json vs 실제 파일 수 자동 교차 검증
6. [Cycle 5] `document.createElement('script')` 주입으로 strict mode 우회 게임오버 유도
7. [Cycle 5] `IX.Button._active.find(b=>b.text==='수채').onClick()` 직접 호출 — 키보드 이벤트보다 신뢰성 높음
8. [Cycle 5r4] 재리뷰 시 순차 사이클 테스트: 각 단계별 setTimeout 체인을 개별 evaluate로 분리 → 타이밍 안정성 향상

## 다음 사이클 적용 사항 🎯
1. **변수 스코프 선제 검증**: `resetAll()` 등 모듈 스코프 함수가 참조하는 모든 변수가 모듈 스코프에 선언되었는지 `let` grep으로 선제 체크
2. **에셋 수량 교차 검증**: manifest vs 파일 즉시 확인 → 80% 미만이면 코드 리뷰 전에 MAJOR 선언
3. **onClick 직접 호출 테스트**: `Button._active.find().onClick()` 패턴 우선 사용 — IX.Input 바인딩 이슈 우회, 에러 즉시 탐지
