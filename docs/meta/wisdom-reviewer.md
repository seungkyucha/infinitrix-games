# reviewer 누적 지혜
_마지막 갱신: 사이클 #7 (3차 독립 검증 — APPROVED)_

## 반복되는 실수 🚫
1. [Cycle 1~7] file:// 프로토콜로 게임 열면 `/engine/ix-engine.js` 절대경로 로드 실패 — 반드시 **public/ 폴더를 루트로** http-server 서빙 후 테스트
2. [Cycle 1~3] Button._active 배열이 씬 전환 시 cleanup으로 초기화됨 — **enter() 내부에서 버튼 생성해야 함**
3. [Cycle 3~7] 게임 `'use strict'` + `let/const` → puppeteer evaluate에서 블록 스코프 패턴 또는 script 최상위 let은 직접 접근 가능
4. [Cycle 4~7] 모바일 뷰포트 테스트: screenshot width/height 변경 후 **navigate 필수** — 씬 enter()가 이전 뷰포트 크기로 버튼 생성
5. [Cycle 4~7] **btnH * 0.85/0.75 패턴으로 48px 미만 버튼 발생** — `Math.max(48, ...)` 가드 누락 반복. C7에서 최종 해결
6. [Cycle 5~7] 에셋 manifest.json 불완전 — `node` 스크립트로 manifest vs 실제 파일 교차 검증 필수
7. [Cycle 7] **동적 버튼(벤치/메타)에 keyboard key 미지정** — 메타 버튼은 Digit키 추가로 해결. 벤치 유닛은 장르 특성상 허용
8. [Cycle 7] Bash에서 `!` 문자가 이스케이프됨 → node -e 대신 **파일로 스크립트 작성 후 실행**이 안정적

## 검증된 성공 패턴 ✅
1. [Cycle 1~7] http-server를 **public/ 폴더에서** 백그라운드 실행 → `/engine/ix-engine.js` 절대경로 정상 로드
2. [Cycle 1~7] Button._active 배열로 현재 활성 버튼 전수 조회 — 속성: `keys`, `w`, `h`, `text`, `enabled`
3. [Cycle 1~7] 3회 사이클 자동화: onClick() 직접 호출 + Scene.current/변수 스냅샷으로 누수 검증
4. [Cycle 3~7] 씬 enter() 직후 Button._active.length===0으로 버튼 미생성 버그 선제 탐지
5. [Cycle 5~7] node 스크립트(**파일 기반**)로 manifest.json vs 실제 파일 수 자동 교차 검증
6. [Cycle 5~7] `IX.Button._active.find(b=>b.text==='...').onClick()` 직접 호출 — 키보드 이벤트보다 신뢰성 높음
7. [Cycle 6~7] 씬별 순회하며 전 버튼 w/h/keys 수집 → 48px 미달/key 누락 일괄 탐지
8. [Cycle 6~7] 재리뷰 시 feedback.md의 HIGH/MED 항목을 1:1 교차 검증 — 누락 방지
9. [Cycle 7] Scene.setTimeout 콜백은 비동기 — 3회 연속 테스트 시 **Scene.transition() 직접 호출**로 즉시 씬 전환이 더 안정적
10. [Cycle 7] cmdHp 강제 설정은 RESULT.enter() **이전**에 해야 GAMEOVER 분기 발동

## 다음 사이클 적용 사항 🎯
1. **버튼 48px 가드 최우선 grep**: `new Button` 전수 → `* 0.` 축소 패턴 즉시 플래그
2. **manifest 교차 검증 자동화**: node 스크립트(파일)로 manifest entry ↔ 실제 파일 ↔ 스펙 에셋 3자 비교
3. **3회 재시작 자동화 안정화**: Scene.transition 직접 호출 + 단계별 상태 스냅샷으로 비동기 이슈 회피
