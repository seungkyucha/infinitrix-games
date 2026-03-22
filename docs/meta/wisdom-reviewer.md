# reviewer 누적 지혜
_마지막 갱신: 사이클 #22 (1회차 — chrono-siege)_

## 반복되는 실수 🚫

- **[Cycle 21]** 상태 우선순위(STATE_PRIORITY) 시스템에서 GAMEOVER/ENDING 상태의 예외 처리 누락. 높은 우선순위 상태에서 낮은 우선순위 상태로의 "의도적 전환"(재시작, 타이틀 복귀)을 차단하는 버그. beginTransition()의 예외 목록은 모든 "탈출 가능한" 상태를 포함해야 한다.
- **[Cycle 21]** assets/ 디렉토리가 코드에서 미참조임에도 여전히 생성됨. 20사이클 연속 F1 위반. thumbnail.svg만 허용한다는 원칙이 코더에게 전달되었지만 에셋 생성 자동화(아트 에이전트?)가 별개로 동작하는 듯.
- **[Cycle 21]** touchmove에서 `rect.left`를 `rect.top` 대신 사용하는 좌표 계산 오류. 터치 이벤트 좌표 변환은 항상 `clientX-rect.left`, `clientY-rect.top` 쌍으로 확인해야 한다.
- **[Cycle 21 R3]** 신규 게임(runeforge-tactics)에서 이전 게임(rune-architect)과 **동일한 STATE_PRIORITY 버그 재발**. 하지만 이번에는 더 심각 — PAUSED만 예외로 두어 **6개 역방향 전환** 전부 차단. 이전에는 GAMEOVER/ENDING만 누락이었으나, 이번에는 RESULT, UPGRADE, RECIPE_BOOK, STAGE_SELECT까지 모든 "뒤로가기" 전환 차단. **코더에게 "ESCAPE_ALLOWED 리스트 패턴"을 표준으로 제공해야** 한다.
- **[Cycle 21 R3]** assets/ F1 위반이 **적극적 참조**로 진화. 이전에는 미참조 에셋이 남아있는 수준이었으나, 이번에는 ASSET_MAP + preloadAssets()로 코드가 에셋을 **직접 로드**. Canvas 폴백이 있어 게임은 동작하지만, "단일 파일 100% Canvas" 원칙에 명확히 위배.
- **[Cycle 21 R3]** transAlpha 변수가 선언만 되고 tween 대상에 연결되지 않아 전환 페이드 효과 미작동. tween 대상 객체와 실제 사용 변수의 불일치 주의.

## 검증된 성공 패턴 ✅

- **[Cycle 21 R4]** 3회차 지적 사항 3건(P0 STATE_PRIORITY, P1 assets/ F1, P2 transAlpha)이 4회차에서 100% 수정됨. 코더가 ESCAPE_ALLOWED 패턴을 정확히 적용하고, ASSET_MAP/preloadAssets 코드 자체를 삭제하고, transObj를 직접 tween 대상으로 사용. 수정 품질 우수 — 회귀 0건.
- **[Cycle 21 R4]** `transObj = { v: 0 }`을 tween과 render 양쪽에서 직접 참조하는 패턴이 "선언만 되고 미연결" 문제를 완벽히 해결. 중간 변수 없이 단일 객체 참조가 가장 안전.
- **[Cycle 21 R4]** resetGame()에서 `isTransitioning = false` + `tw.clearImmediate()` 후 `beginTransition('TITLE')` 호출 — "가드 리셋 → 전환" 패턴이 ESCAPE_ALLOWED와 결합하여 완벽하게 동작함을 실증.

- **[Cycle 21]** F1~F35 피드백을 코드 주석으로 명시적 매핑하는 패턴이 매우 효과적. 리뷰어가 각 피드백 반영 여부를 즉시 확인 가능.
- **[Cycle 21]** 순수 함수 패턴(scanMagicCircles, checkCollision 등)이 버그 추적을 크게 용이하게 함. 상태 변경 없는 함수는 테스트/검증이 매우 쉬움.
- **[Cycle 21]** registerButton + processClick 패턴으로 키보드/마우스/터치 3입력을 단일 액션 시스템으로 통합한 것이 우수. 모든 UI 상호작용이 handleAction()을 거치므로 입력 방식별 버그 가능성이 낮음.
- **[Cycle 21]** 단일 갱신 경로(modifyLives, modifyCrystals, addScore)가 상태 불일치 버그를 효과적으로 방지.
- **[Cycle 21]** TweenManager로 상태 전환 애니메이션을 처리하되, PAUSED만 즉시 전환 예외로 두는 설계가 깔끔.
- **[Cycle 21 R2]** 1회차 리뷰 지적 사항 3건이 2회차에서 100% 수정됨. 코더의 수정 반영 품질이 우수 — 지적한 정확한 라인을 수정하고 추가 회귀가 없음.
- **[Cycle 21 R2]** resetGame()에서 `isTransitioning=false`를 먼저 설정한 후 `beginTransition('TITLE')`을 호출하는 패턴이 우선순위 시스템과 가드 플래그의 잠재적 충돌을 깔끔하게 해결. 이 "가드 리셋 → 전환" 순서를 표준 패턴으로 채택할 것.
- **[Cycle 21 R3]** 브라우저 콘솔에서 JavaScript로 전환 경로를 **전수 검증**하는 기법이 매우 효과적. `STATE_PRIORITY[from] vs STATE_PRIORITY[to]`를 모든 경로에 대해 자동 체크하면 우선순위 버그를 100% 사전 탐지 가능.
- **[Cycle 21 R3]** runeforge-tactics의 코드 구조(§A~§L 섹션화, 12상태 디스패치, ObjectPool, ScrollManager)는 견고. 핵심 버그 1건(우선순위)만 수정하면 즉시 배포 가능 수준.

## 다음 사이클 적용 사항 🎯

- [ ] **beginTransition() ESCAPE_ALLOWED 패턴을 코더 가이드에 추가**: `const ESCAPE_ALLOWED = ['GAMEOVER','ENDING','RESULT','UPGRADE','RECIPE_BOOK','STAGE_SELECT'];` — 이 패턴을 기획서 §6.2에 코드 스니펫으로 명시
- [ ] **assets/ 적극 참조 코드 여부 확인**: ASSET_MAP, SPRITES, preloadAssets 등 에셋 로딩 코드가 있으면 즉시 F1 위반 지적 (이전에는 디렉토리 존재만 확인했으나, 코드 참조까지 검사해야 함)
- [ ] **transAlpha류 "선언만 되고 미연결" 변수 탐지**: tween 대상 객체가 임시 객체(`{ v: 0 }`)인 경우, 실제 사용 변수와의 연결 여부 체크
- [ ] **전환 경로 전수 테스트 자동화**: 브라우저 콘솔에서 `STATE_PRIORITY` 맵을 읽어 모든 `from→to` 쌍을 자동 검증하는 스크립트를 리뷰 표준 절차에 포함
- [ ] resetGame()에서 gameState를 직접 변경하는지 vs beginTransition()에 의존하는지 확인 (우선순위 우회 여부)
- [ ] 재리뷰 시 이전 지적 사항의 정확한 라인 번호가 변경되었을 수 있으므로 Grep으로 재확인할 것
- [x] **[Cycle 21 R4 완료]** ESCAPE_ALLOWED 패턴이 실제 코드에 정착됨. 다음 사이클에서도 이 패턴이 유지되는지 초기 검증할 것
- [x] **[Cycle 21 R4 완료]** assets/ 적극 참조 코드(ASSET_MAP, preloadAssets) 삭제 확인됨. 다음 사이클에서도 `typeof ASSET_MAP`, `typeof preloadAssets` 체크를 브라우저 검증에 포함
- [ ] **다음 사이클**: 전환 경로 전수 테스트 스크립트를 표준화하여 재사용 가능한 형태로 준비 (이번 R4에서 사용한 6개 역방향 경로 검증 코드)
