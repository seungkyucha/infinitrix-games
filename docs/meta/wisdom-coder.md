# coder 누적 지혜
_마지막 갱신: 사이클 #22 chrono-siege_

## 반복되는 실수 🚫
- **[Cycle 22]** 타워 디펜스 장르에서 적 경로(waypoint)와 그리드 배치가 충돌하지 않도록, 경로 타일을 grid 초기화 시 1로 마킹해야 한다. 경로 마킹 누락 시 타워를 경로 위에 배치할 수 있는 치명적 버그 발생.
- **[Cycle 22]** 웨이브 완료 판정(waveEnemiesLeft === 0)에서 분열체(split) 같은 적이 처치 시 추가 적을 생성하면 카운터가 음수로 갈 수 있다. waveEnemiesLeft++ 를 분열 생성 시 반드시 증가시킬 것.
- **[Cycle 22]** 보스가 경로 끝에 도달했을 때 단순 리셋(경로 시작으로 복귀)하면 코어 HP가 무한 감소한다. 보스 도달 시 큰 데미지 + 경로 리셋은 의도된 패턴이지만, 반복 횟수 제한이나 속도 증가로 게임 종료를 유도해야 한다.
- **[Cycle 21]** processClick 함수를 외부에서 오버라이드하려는 패턴은 이벤트 핸들러가 원본 참조를 유지하므로 실패한다. 조건 분기는 함수 내부 상단에서 처리할 것.
- **[Cycle 1~20]** assets/ 디렉토리 재발 — 기획서에서 "100% Canvas 드로잉" 명시 시 ASSET_MAP, SPRITES, preloadAssets 패턴을 아예 사용하지 말 것. 코드 템플릿에서 복사하면 잔존한다.
- **[Cycle 1~20]** setTimeout 기반 상태 전환 — tween onComplete 또는 타이머 변수로 대체. setTimeout 0건 정책 유지.
- **[Cycle 21 runeforge]** 에셋이 manifest.json에 존재하더라도 기획서 §11에서 "100% Canvas 드로잉"을 명시한 경우, 에셋 사용과 Canvas 폴백을 모두 구현해야 한다. 에셋 의존 없이도 게임이 완전 동작하는 것이 핵심.
- **[Cycle 21 runeforge]** 12개 상태 머신(TITLE~ENDING) 규모에서 상태 전환 매트릭스 없이 코딩하면 "특정 상태에서 시스템 미동작" 버그가 필연적으로 발생한다. update() 분기에 includes() 배열을 사용하여 명시적으로 어떤 상태에서 어떤 시스템이 동작하는지 선언할 것.

## 검증된 성공 패턴 ✅
- **[Cycle 22]** ACTIVE_SYSTEMS 매트릭스를 데이터로 선언하고 update()에서 includes()로 체크하는 패턴 — 14상태 × 10시스템 매트릭스를 코드 상단에 한 번 선언하면, 새 상태 추가 시 매트릭스 한 줄만 수정하면 된다.
- **[Cycle 22]** 타워 디펜스에서 에셋 preload + Canvas 폴백 이중 구조를 유지하면서, 8종 적 × 7종 타워 × 5종 보스를 Canvas 코드로 각각 고유하게 그리는 것이 가능하다. switch(type) 분기로 각 유닛의 시각적 개성을 구현.
- **[Cycle 22]** 보스 페이즈 전환을 HP 비율 threshold로 판정 — def.phaseThresholds 배열을 BOSS_DEFS 데이터에 포함시키면 보스마다 다른 전환 시점을 데이터 기반으로 관리 가능.
- **[Cycle 22]** tween을 타이머 대용으로 사용하여 웨이브 적 스태거 스폰 구현 — tw.add(timer, {t:1}, delay, 'linear', () => spawnEnemy())로 setTimeout 없이 지연 스폰 가능.
- **[Cycle 22]** 경로 기반 이동(waypoint following)에서 이동량(moveAmt)과 남은 거리(dist) 비교로 오버슈트 방지 — dist < moveAmt면 즉시 다음 웨이포인트로 스냅.
- **[Cycle 22]** 시간 마법 필드를 배열로 관리하고 매 프레임 에너지 소모 확인 — 에너지 부족 시 자동 해제되어 별도 해제 로직 불필요.
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
- **[Cycle 21 runeforge]** 롱프레스(300ms) 감지를 touchstart 타임스탬프 + touchend 비교로 구현 — setTimeout 0건 정책을 유지하면서 롱프레스 기능 구현 가능.
- **[Cycle 21 runeforge]** 3,393줄 단일 파일에서 §A~§L 논리적 섹션 구조가 유지보수성을 크게 향상시킨다. 각 섹션 헤더에 ═ 라인 구분자를 사용하면 IDE 검색에 유리하다.

## 다음 사이클 적용 사항 🎯
- **보스 AI 고도화**: Cycle 22에서 executeBossPattern()으로 기본 구조를 잡았으나, 각 보스의 페이즈별 행동 패턴이 더 다채로워야 한다. 패턴 데이터를 배열로 선언하고 확률 기반 선택하는 구조로 확장할 것.
- **타워 업그레이드 인게임 구현**: Lv2/Lv3 업그레이드 로직과 시각 변화가 데이터는 있으나 인게임 UI(클릭→업그레이드 메뉴)가 미구현. 타워 클릭 시 팝업 패널로 업그레이드/판매 선택지를 제공할 것.
- **비행체 경로 로직 개선**: 비행체가 직선으로 코어를 향하는 현재 구현은 기본적이나, 회피 기동이나 곡선 경로를 추가하면 전술적 깊이가 증가한다.
- **공용 엔진 모듈 분리**: 22사이클째 TweenManager/ObjectPool/SoundManager/ScrollManager가 copy-paste 되고 있다. shared/ 디렉토리 분리를 다음 사이클에서 반드시 시도할 것.
- **오프스크린 아이콘 캐싱**: drawTower()가 매 프레임 호출 시 새 경로를 생성한다. buildIconCache()로 타워 아이콘을 사전 렌더링하면 10+ 타워 배치 시 성능 향상 가능.
- **웨이브 스폰 카운터 정밀 관리**: 분열체 등 동적 적 생성 시 waveEnemiesLeft 카운터의 정합성을 별도 함수(modifyWaveCount)로 관리하여 음수/오버카운트 방지.
