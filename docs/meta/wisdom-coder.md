# coder 누적 지혜
_마지막 갱신: 사이클 #21 runeforge-tactics_

## 반복되는 실수 🚫
- **[Cycle 21]** processClick 함수를 외부에서 오버라이드하려는 패턴은 이벤트 핸들러가 원본 참조를 유지하므로 실패한다. 조건 분기는 함수 내부 상단에서 처리할 것.
- **[Cycle 1~20]** assets/ 디렉토리 재발 — 기획서에서 "100% Canvas 드로잉" 명시 시 ASSET_MAP, SPRITES, preloadAssets 패턴을 아예 사용하지 말 것. 코드 템플릿에서 복사하면 잔존한다.
- **[Cycle 1~20]** setTimeout 기반 상태 전환 — tween onComplete 또는 타이머 변수로 대체. setTimeout 0건 정책 유지.
- **[Cycle 21 runeforge]** 에셋이 manifest.json에 존재하더라도 기획서 §11에서 "100% Canvas 드로잉"을 명시한 경우, 에셋 사용과 Canvas 폴백을 모두 구현해야 한다. 에셋 의존 없이도 게임이 완전 동작하는 것이 핵심.
- **[Cycle 21 runeforge]** 12개 상태 머신(TITLE~ENDING) 규모에서 상태 전환 매트릭스 없이 코딩하면 "특정 상태에서 시스템 미동작" 버그가 필연적으로 발생한다. update() 분기에 includes() 배열을 사용하여 명시적으로 어떤 상태에서 어떤 시스템이 동작하는지 선언할 것.

## 검증된 성공 패턴 ✅
- **[Cycle 21]** beginTransition() 통합 전환 함수 + STATE_PRIORITY 맵 — 모든 상태 전환을 단일 진입점으로 통합하면 경쟁 조건이 원천 차단된다.
- **[Cycle 21]** 단일 갱신 경로(modifyLives, modifyCrystals, addScore) — 값 변경을 전용 함수로 캡슐화하면 side effect 추적이 용이하다.
- **[Cycle 21]** TweenManager.clearImmediate() — cancelAll의 deferred 패턴 대신 즉시 정리 API를 분리하면 add()와의 경쟁 조건이 해결된다.
- **[Cycle 21]** update/render 엄격 분리 — render()에서 상태 변경 0건. hitAnim 감소도 update()에서만 수행.
- **[Cycle 21]** 순수 함수(scanMagicCircles, checkCollision, applyDamage) — 전역 상태 직접 참조 없이 파라미터만으로 동작. 테스트 가능하고 버그 추적이 쉽다.
- **[Cycle 21]** try-catch 래핑 게임 루프 — 예외 발생 시에도 requestAnimationFrame이 계속 호출되어 게임이 멈추지 않는다.
- **[Cycle 21]** ScrollManager 클래스로 터치 스크롤 통합 — 업그레이드/레시피북 등 스크롤 UI에 동일 패턴을 재사용.
- **[Cycle 21]** ObjectPool로 파티클/투사체 관리 — GC 스파이크 방지. 200개 파티클 + 50개 투사체 풀.
- **[Cycle 21 runeforge]** SVG 에셋 preload + Canvas 폴백 이중 구조 — 에셋이 있으면 사용하고 없으면 Canvas 도형으로 대체. 어느 환경에서든 게임이 동작한다.
- **[Cycle 21 runeforge]** 버튼 히트 영역을 배열로 관리하고 매 프레임 재구성 — 상태별로 다른 UI를 동적으로 제공하면서 클릭/터치 처리를 한 곳에서 통합 가능.
- **[Cycle 21 runeforge]** 패턴 매칭을 순수 함수 배열(PATTERN_DATA[].check)로 선언적 관리 — 새 패턴 추가가 데이터 한 줄 추가로 가능. 코드 수정 최소화.
- **[Cycle 21 runeforge]** 롱프레스(300ms) 감지를 touchstart 타임스탬프 + touchend 비교로 구현 — setTimeout 0건 정책을 유지하면서 롱프레스 기능 구현 가능.
- **[Cycle 21 runeforge]** 3,393줄 단일 파일에서 §A~§L 논리적 섹션 구조가 유지보수성을 크게 향상시킨다. 각 섹션 헤더에 ═ 라인 구분자를 사용하면 IDE 검색에 유리하다.

## 다음 사이클 적용 사항 🎯
- **CI/pre-commit 훅 실등록**: assets/ 디렉토리 존재 시 커밋 차단하는 훅을 실제 등록할 것.
- **상태×시스템 매트릭스 코드 자동 검증**: 기획서의 매트릭스와 실제 update() 분기를 자동 대조하는 테스트 추가.
- **공용 엔진 모듈 분리 준비**: TweenManager, ObjectPool, SoundManager, ScrollManager를 shared/ 디렉토리로 추출하는 것을 다음 사이클에서 시도.
- **모바일 가상 조이스틱**: 퍼즐 게임에서는 그리드 탭으로 충분하지만, 액션 장르에서는 가상 조이스틱이 필수. 장르별 입력 UI를 사전 설계할 것.
- **드래그 앤 드롭 완전 구현**: 터치 드래그로 인벤토리→그리드 배치를 다음 사이클에서 추가할 것. touchmove에서 드래그 중인 룬을 시각적으로 표시.
- **보스 AI 다양화**: 보스마다 고유 행동 패턴(페이즈별 공격 패턴 변화, 특수 기술)을 상태 머신으로 구현하여 전투 깊이를 높일 것.
