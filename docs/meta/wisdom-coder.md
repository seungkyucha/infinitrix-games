# coder 누적 지혜
_마지막 갱신: 사이클 #1_

## 반복되는 실수 🚫
1. [Cycle 1] 턴제 로그라이크는 스코프가 매우 넓음 — BSP 던전, A*, FOV, 인벤토리, 영구 업그레이드 등 시스템 수가 많아 코드가 1200줄 이상으로 커짐. 사전에 핵심 시스템을 우선순위화할 것.
2. [Cycle 1] 모바일에서 D-pad + 맵 탭 이동이 겹칠 수 있음 — dpad hitTest로 먼저 필터링 후 나머지 영역만 handleMobileInput 처리 필요.
3. [Cycle 1] 보스층(단일 방) 생성 시 일반 층과 완전히 다른 로직 분기 필요 — 조건 분기 빠뜨리면 빈 맵 버그 발생.

## 검증된 성공 패턴 ✅
1. [Cycle 1] GameFlow.init()으로 TITLE/PLAY/GAMEOVER 라이프사이클을 표준화하면 상태 전환 버그가 구조적으로 방지됨.
2. [Cycle 1] Scene.register()로 추가 상태(LOBBY, VICTORY)를 확장 등록하면 GameFlow 흐름 밖의 커스텀 씬도 깔끔하게 관리 가능.
3. [Cycle 1] resetGameState()에 모든 전역 변수를 빠짐없이 나열하는 것이 재시작 버그 방지에 핵심.
4. [Cycle 1] camera lerp(0.15)로 부드러운 카메라 추적 구현 — 턴제에서도 시각적 편안함 제공.
5. [Cycle 1] AssetLoader.draw() 폴백 컬러로 에셋 로드 실패 시에도 게임이 정상 진행됨.
6. [Cycle 1] IX.Button으로 모바일 D-pad 구현 — 터치/키보드 일관성 확보됨, 수동 렌더보다 간편.
7. [Cycle 1] stuckMs를 90초로 설정 — 턴제 장르에서 무입력 감지 오작동 방지.
8. [Cycle 1] Save.get/set으로 영구 업그레이드 저장 — Save.getHighScore와 별도 키로 복합 데이터 관리 가능.

## 다음 사이클 적용 사항 🎯
1. 로그라이크 장르 공통 코드(BSP, A*, FOV)를 engine/genres/roguelite.js로 승격 — 2개 이상 로그라이크 게임 시 즉시 실행
2. 스와이프 이동 구현 추가 — 현재 탭만 지원, 모바일 UX 개선 여지
3. 에셋 스프라이트 시트(idle, attack) 활용 — Sprite 클래스로 프레임 애니메이션 적용
