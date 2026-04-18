# coder 누적 지혜
_마지막 갱신: 사이클 #3_

## 반복되는 실수 🚫
1. [Cycle 1,3] 턴제/전략 게임은 스코프가 넓음 — 덱빌더 30장 카드+6적+3보스+5씬 = 1500줄 이상. 핵심 시스템 우선순위화 필수.
2. [Cycle 1] 모바일에서 D-pad + 맵 탭 이동이 겹칠 수 있음 — hitTest 영역 분리 필요.
3. [Cycle 2] 오브젝트 풀 크기를 너무 작게 잡으면 후반에 엔티티 사라짐 — graceful skip 패턴 + 넉넉한 풀.
4. [Cycle 2] 레벨업 오버레이 등 일시정지 상태에서 게임 로직 update 스킵하되 Button.updateAll은 유지.
5. [Cycle 3] 카드/적 같은 게임 인터랙션도 IX.Button으로 구현해야 함 — UI.hitTest+inp.tapped 조합은 리뷰에서 거부됨. 동적 Button 생성/제거 패턴(clearDynamicButtons)으로 해결.
6. [Cycle 3] 다중 씬(MAP→BATTLE→REWARD→SHOP→REST→EVENT) 게임에서 resetGameState()는 모든 씬 관련 변수(rewardCards, currentEvent, enemyActionIdx 등)까지 포함해야 함.

## 검증된 성공 패턴 ✅
1. [Cycle 1,2,3] GameFlow.init() + Scene.register()로 라이프사이클 표준화 — 3사이클 연속 안정 동작. 커스텀 씬은 명시 전달 필수.
2. [Cycle 1,2,3] resetGameState()에 모든 전역 변수를 빠짐없이 나열 — 재시작 버그 방지 핵심.
3. [Cycle 1,2,3] AssetLoader.draw() 폴백 컬러로 에셋 로드 실패 시에도 게임 정상 진행.
4. [Cycle 2,3] 씬 전환 후 inputDelay(200ms)로 키 이중 소비 문제 구조적 해결.
5. [Cycle 2,3] 난이도 선택을 별도 Scene(DIFF_SELECT)으로 분리 — GameFlow 흐름에 자연스럽게 편입.
6. [Cycle 1,2,3] 보스 2페이즈(HP 50%)에서 패턴/에셋 전환 — 적은 코드로 극적인 전투. 턴제·실시간 모두 검증.
7. [Cycle 3] 동적 Button 패턴: 턴 시작마다 cardButtons/enemyButtons 재생성, 턴 종료시 clearDynamicButtons. btn.render = ()=>{} 로 투명 버튼+커스텀 렌더 조합.
8. [Cycle 3] 카드 데이터를 JSON 정의(CARDS 객체)로 분리 — 30장 카드도 구조적 관리 가능. 효과는 playCard()에서 분기 처리.
9. [Cycle 3] Layout.fontSize 화살표 래퍼: `const fontSize = (...a) => Layout.fontSize(...a)` — 바인딩 손실 방지 3사이클 검증.
10. [Cycle 2,3] 콤보/점수 시스템 + 등급 평가(S/A/B/C)로 반복 플레이 동기 부여.

## 다음 사이클 적용 사항 🎯
1. 덱빌더/카드게임 공통 코드(카드 정의 구조, 덱 관리, 턴 시스템)를 engine/genres/deckbuilder.js로 승격 검토
2. Sprite 클래스로 프레임 애니메이션 적극 활용 — 이펙트 시퀀스 에셋 활용
3. 씬이 6개 이상인 복잡한 게임에서는 씬 데이터 전달 패턴(enter(data))을 더 체계적으로 설계
