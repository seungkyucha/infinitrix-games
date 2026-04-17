# coder 누적 지혜
_마지막 갱신: 사이클 #2_

## 반복되는 실수 🚫
1. [Cycle 1] 턴제 로그라이크는 스코프가 매우 넓음 — 시스템 수가 많아 코드 1200줄 이상. 사전에 핵심 시스템을 우선순위화할 것.
2. [Cycle 1] 모바일에서 D-pad + 맵 탭 이동이 겹칠 수 있음 — hitTest 영역 분리 필요.
3. [Cycle 2] 오브젝트 풀 크기를 너무 작게 잡으면 웨이브 후반에 적/탄환이 사라짐 — 풀 소진 시 graceful skip 패턴 필수 + 풀 크기는 넉넉하게(적 80+, 탄환 200+, 보석 300+).
4. [Cycle 2] 보스 탄환과 플레이어 탄환이 같은 풀을 공유하면 데미지 부호로 구분해야 함 — dmg < 0 = 적 탄환 컨벤션 확립.
5. [Cycle 2] 레벨업 오버레이(게임 일시정지 상태)에서 게임 로직 update를 스킵해야 하는데, Button.updateAll은 계속 호출되어야 함 — upgradeState.active 분기를 update 최상단에서 처리.

## 검증된 성공 패턴 ✅
1. [Cycle 1,2] GameFlow.init() + Scene.register()로 라이프사이클 표준화 — 상태 전환 버그 구조적 방지.
2. [Cycle 1,2] resetGameState()에 모든 전역 변수를 빠짐없이 나열 — 재시작 버그 방지 핵심. 풀도 releaseAll() 필수.
3. [Cycle 1,2] camera lerp(0.1~0.15)로 부드러운 추적 — 실시간/턴제 모두 시각적 편안함 제공.
4. [Cycle 1,2] AssetLoader.draw() 폴백 컬러로 에셋 로드 실패 시에도 게임 정상 진행.
5. [Cycle 2] createPool() + acquire/release 패턴으로 오브젝트 풀링 — GC 부담 최소화, forEach로 활성 객체만 순회.
6. [Cycle 2] spatialHash로 충돌 판정 최적화 — 64px 셀 기반 query로 O(n²) → O(n) 수준 달성.
7. [Cycle 2] 가상 조이스틱은 터치 시작 위치 기준 동적 생성 + 데드존 10px — 고정 위치보다 UX 우수.
8. [Cycle 2] 씬 전환 후 inputDelay(200ms)로 키 이중 소비 문제 구조적 해결.
9. [Cycle 2] 난이도 선택을 별도 Scene(DIFF_SELECT)으로 분리 — GameFlow 표준 흐름에 자연스럽게 끼워넣기 가능.
10. [Cycle 2] 보스 2페이즈(HP 50%)에서 에셋 교체 + 속도/패턴 변화 — 적은 코드로 극적인 전투 경험.

## 다음 사이클 적용 사항 🎯
1. survivor-like 장르 공통 코드(오브젝트 풀, 웨이브 매니저, 자동 공격 시스템)를 engine/genres/survivor.js로 승격 검토
2. Sprite 클래스로 프레임 애니메이션 적극 활용 — 이번에 idle sheet 에셋이 있었지만 미활용
3. 카메라 시스템(lerp 추적, 경계 클램프, 쉐이크)을 IX.Camera로 엔진 승격 검토 — 2사이클 연속 구현
