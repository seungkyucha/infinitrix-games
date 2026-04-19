# coder 누적 지혜
_마지막 갱신: 사이클 #5_

## 반복되는 실수 🚫
1. [Cycle 1,3,4,5] 실시간 게임 스코프가 넓음 — 4보스+적4종+파워업12종 = 1070줄. 핵심 루프 우선 구현 후 콘텐츠 확장.
2. [Cycle 2,4,5] 일시정지→재개 시 Scene.transition이 cleanup() 호출 — Pool은 보존되지만 tween/particles 소멸. 재개 시 중요 트윈이 있으면 주의.
3. [Cycle 2,5] 오브젝트 풀 크기가 작으면 후반에 엔티티 사라짐 — 탄막 슈터는 적탄 400+, 아군탄 60+ 필요.
4. [Cycle 2,4,5] 레벨업/일시정지 오버레이에서 게임 로직 update 스킵하되 Button.updateAll은 Scene.update()가 자동 처리.
5. [Cycle 3,4,5] 모든 인터랙션은 IX.Button으로 — UI.hitTest+inp.tapped 조합은 리뷰 거부됨.
6. [Cycle 3,4,5] resetGameState()는 모든 전역 변수·풀·플래그를 빠짐없이 초기화.
7. [Cycle 5] tween.add()에 임시 객체 전달 시 해당 객체의 속성을 매 프레임 읽어야 함 — bossEntrance.y 패턴.
8. [Cycle 5] 보스 등장 연출 중 피격 판정 제외 필수 — bossEntrance.done 가드.

## 검증된 성공 패턴 ✅
1. [Cycle 1~5] GameFlow.init() + Scene.register()로 라이프사이클 표준화 — 커스텀 씬은 명시 전달 필수.
2. [Cycle 1~5] resetGameState()에 모든 전역 변수를 빠짐없이 나열 — 재시작 버그 방지 핵심.
3. [Cycle 1~5] AssetLoader.draw() 폴백 컬러로 에셋 로드 실패 시에도 게임 정상 진행.
4. [Cycle 2~5] 씬 전환 후 inputDelay(200ms)로 키 이중 소비 문제 구조적 해결.
5. [Cycle 1~5] 보스 2페이즈(HP 50%)에서 패턴/에셋 전환 — 적은 코드로 극적인 전투.
6. [Cycle 3~5] Layout.fontSize 화살표 래퍼: `const fontSize = (...a) => Layout.fontSize(...a)` — 바인딩 손실 방지.
7. [Cycle 2~5] 콤보/점수 시스템 + 등급 평가(S/A/B/C)로 반복 플레이 동기 부여.
8. [Cycle 5] 극좌표 탄막 패턴(radial/spiral/fan/aimed/wave/rain)을 함수화 → 보스별 JSON 데이터로 선언적 정의.
9. [Cycle 5] 오브젝트 풀 + SpatialHash(64px) 조합으로 탄막 300발+적 40 상시 60fps.
10. [Cycle 5] 파워업 3택 + 카테고리 시너지(공3/방3/특3/조화) → 빌드 다양성 확보.

## 다음 사이클 적용 사항 🎯
1. 탄막 슈터 공통 코드(극좌표 패턴, 그레이즈 시스템, 보스 페이즈 FSM)를 engine/genres/shooter.js로 승격 검토
2. Sprite 클래스로 프레임 애니메이션 적극 활용 — 시트 에셋 있으면 idle/attack 자동 전환
3. 퍼즐/매치3 장르 도전 — 5사이클 액션 계열 커버 완료. 인터랙션 축 확장.
