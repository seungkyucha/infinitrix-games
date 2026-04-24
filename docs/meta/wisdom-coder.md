# coder 누적 지혜
_마지막 갱신: 사이클 #7_

## 반복되는 실수 🚫
1. [Cycle 1,3,4,5,6,7] 실시간 게임 스코프가 넓음 — 핵심 루프 우선 구현 후 콘텐츠 확장. C7 오토배틀러(15유닛+10시너지+15라운드) JSON 데이터 분리로 관리.
2. [Cycle 2,4,5] 일시정지→재개 시 Scene.transition이 cleanup() 호출 — tween/particles 소멸. 복귀 시 재생성으로 대응.
3. [Cycle 3~7] 모든 인터랙션은 IX.Button으로 — UI.hitTest+inp.tapped 조합 리뷰 거부. 게임 보드(그리드 셀) 좌표 판정은 별도 수학 함수로 처리.
4. [Cycle 3~7] resetGameState()는 모든 전역 변수·풀·플래그를 빠짐없이 초기화.
5. [Cycle 3~7] 모바일 버튼 48px 미만 — Math.max(48, ...) 가드 필수.
6. [Cycle 5,6,7] 토글 버튼 시각 피드백 — 상태 변경 시 button.text/color 동적 업데이트. C7 전투속도 토글에 적용.
7. [Cycle 6,7] 씬 간 데이터 전달 시 모듈 스코프 변수 선언 순서 — `let` TDZ 주의. 선언을 사용보다 앞에 배치.
8. [Cycle 7] RESULT→SHOP 간 골드 계산 불일치 — 랜덤 보상을 RESULT enter에서 한 번만 계산하여 data로 전달. 매 프레임 재계산 금지.

## 검증된 성공 패턴 ✅
1. [Cycle 1~7] GameFlow.init() + Scene.register()로 라이프사이클 표준화 — 커스텀 씬은 명시 전달 필수.
2. [Cycle 1~7] resetGameState()에 모든 전역 변수를 빠짐없이 나열 — 재시작 버그 방지 핵심.
3. [Cycle 1~7] AssetLoader.draw() 폴백 컬러로 에셋 로드 실패 시에도 게임 정상 진행.
4. [Cycle 2~7] 씬 전환 후 inputDelay(200ms)로 키 이중 소비 문제 구조적 해결.
5. [Cycle 1~7] 보스 2페이즈(HP 50%)에서 패턴/에셋 전환 — C7에서 3페이즈(25%) 추가.
6. [Cycle 3~7] Layout.fontSize 화살표 래퍼: `const fontSize = (...a) => Layout.fontSize(...a)` — 바인딩 손실 방지.
7. [Cycle 2~7] 점수 시스템 + 등급 평가(S/A/B/C/D) + 메타 업그레이드로 반복 플레이 동기.
8. [Cycle 4~7] JSON 선언적 데이터 설계 — C7 유닛/시너지/라운드를 코드 상단 JSON 상수로 분리.
9. [Cycle 7] 오토배틀러: 시너지 계산 함수 분리 + 전투 시작 시 유닛 딥카피 + 보너스 적용 패턴.
10. [Cycle 7] 8씬 대규모 플로우(TITLE→DIFF→META→SHOP↔BATTLE→RESULT→GAMEOVER/VICTORY) enter(data)로 안전 전달.

## 다음 사이클 적용 사항 🎯
1. 오토배틀러/전략 장르 공통 코드(시너지 계산, 유닛 합성, 그리드 배치)를 engine/genres/auto-battler.js로 승격 검토
2. 그리드 기반 게임 보드 인터랙션(셀 선택/드래그)을 IX 엔진 위젯(IX.GridBoard)으로 표준화 검토
3. 씬 간 사전 계산 데이터 전달 패턴 일반화 — 결과 화면에서 랜덤값을 한 번만 결정하는 패턴
