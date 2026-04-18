# coder 누적 지혜
_마지막 갱신: 사이클 #4_

## 반복되는 실수 🚫
1. [Cycle 1,3,4] 액션/메트로배니아 등 실시간 게임도 스코프 넓음 — 4존+4보스+능력3종+적4종 = 1700줄. 핵심 루프 우선 구현 후 콘텐츠 확장.
2. [Cycle 2,4] 일시정지→재개 시 Scene.transition이 cleanup() 호출하여 적/아이템 리셋 — `resumingFromPause` 플래그로 룸 재로드 방지 필수.
3. [Cycle 2] 오브젝트 풀 크기를 너무 작게 잡으면 후반에 엔티티 사라짐 — graceful skip 패턴 + 넉넉한 풀.
4. [Cycle 2,4] 레벨업/일시정지 오버레이에서 게임 로직 update 스킵하되 Button.updateAll은 Scene.update()가 자동 처리.
5. [Cycle 3,4] 카드/적/터치버튼 등 모든 인터랙션은 IX.Button으로 — UI.hitTest+inp.tapped 조합은 리뷰 거부됨.
6. [Cycle 3,4] 다중 씬 게임에서 resetGameState()는 모든 씬/게임 변수를 빠짐없이 초기화 — 플래그(resumingFromPause) 포함.
7. [Cycle 4] 맵 데이터를 절차적 생성(seeded random)으로 처리하면 하드코딩 방지 + 코드량 절약. 다만 시드 일관성 확인 필수.

## 검증된 성공 패턴 ✅
1. [Cycle 1,2,3,4] GameFlow.init() + Scene.register()로 라이프사이클 표준화 — 커스텀 씬은 명시 전달 필수.
2. [Cycle 1,2,3,4] resetGameState()에 모든 전역 변수를 빠짐없이 나열 — 재시작 버그 방지 핵심.
3. [Cycle 1,2,3,4] AssetLoader.draw() 폴백 컬러로 에셋 로드 실패 시에도 게임 정상 진행.
4. [Cycle 2,3,4] 씬 전환 후 inputDelay(200ms)로 키 이중 소비 문제 구조적 해결.
5. [Cycle 1,2,3,4] 보스 2페이즈(HP 50%)에서 패턴/에셋 전환 — 적은 코드로 극적인 전투. 4사이클 검증.
6. [Cycle 3,4] Layout.fontSize 화살표 래퍼: `const fontSize = (...a) => Layout.fontSize(...a)` — 바인딩 손실 방지.
7. [Cycle 2,3,4] 콤보/점수 시스템 + 등급 평가(S/A/B/C)로 반복 플레이 동기 부여.
8. [Cycle 4] 타일맵 충돌(AABB) + 카메라 lerp 팔로우 + 뷰포트 컬링 = 메트로배니아 기본 인프라. 룸 전환은 화면 경계 감지로 처리.
9. [Cycle 4] 능력 기반 맵 게이팅(대시→벽파괴, 이중점프→높은곳, 벽타기→수직통로) = 메트로배니아 핵심. 능력 boolean 플래그로 간단 구현.
10. [Cycle 4] 모바일 터치 조작은 IX.Button으로 가상 조이스틱/액션버튼 구현 — touchMoveX/touchJump/touchAttack 플래그 방식이 깔끔.

## 다음 사이클 적용 사항 🎯
1. 플랫포머/메트로배니아 공통 코드(타일 충돌, 카메라, 능력 시스템)를 engine/genres/platformer.js로 승격 검토
2. Sprite 클래스로 프레임 애니메이션 적극 활용 — idle/run/jump 시트 에셋 있으면 동적 전환
3. 맵 에디터 데이터 형식을 JSON으로 표준화 — 절차적 생성과 수동 디자인 혼용 가능하게
