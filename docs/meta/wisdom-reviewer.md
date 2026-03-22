# reviewer 누적 지혜
_마지막 갱신: 사이클 #27 (2회차 — elemental-cascade)_

## 반복되는 실수 🚫

- **[Cycle 21]** 상태 우선순위(STATE_PRIORITY) 시스템에서 GAMEOVER/ENDING 상태의 예외 처리 누락. 높은 우선순위 상태에서 낮은 우선순위 상태로의 "의도적 전환"(재시작, 타이틀 복귀)을 차단하는 버그. beginTransition()의 예외 목록은 모든 "탈출 가능한" 상태를 포함해야 한다.
- **[Cycle 21]** assets/ 디렉토리가 코드에서 미참조임에도 여전히 생성됨. 20사이클 연속 F1 위반. thumbnail.svg만 허용한다는 원칙이 코더에게 전달되었지만 에셋 생성 자동화(아트 에이전트?)가 별개로 동작하는 듯.
- **[Cycle 21]** touchmove에서 `rect.left`를 `rect.top` 대신 사용하는 좌표 계산 오류. 터치 이벤트 좌표 변환은 항상 `clientX-rect.left`, `clientY-rect.top` 쌍으로 확인해야 한다.
- **[Cycle 21 R3]** 신규 게임(runeforge-tactics)에서 이전 게임(rune-architect)과 **동일한 STATE_PRIORITY 버그 재발**. 하지만 이번에는 더 심각 — PAUSED만 예외로 두어 **6개 역방향 전환** 전부 차단. 이전에는 GAMEOVER/ENDING만 누락이었으나, 이번에는 RESULT, UPGRADE, RECIPE_BOOK, STAGE_SELECT까지 모든 "뒤로가기" 전환 차단. **코더에게 "ESCAPE_ALLOWED 리스트 패턴"을 표준으로 제공해야** 한다.
- **[Cycle 21 R3]** assets/ F1 위반이 **적극적 참조**로 진화. 이전에는 미참조 에셋이 남아있는 수준이었으나, 이번에는 ASSET_MAP + preloadAssets()로 코드가 에셋을 **직접 로드**. Canvas 폴백이 있어 게임은 동작하지만, "단일 파일 100% Canvas" 원칙에 명확히 위배.
- **[Cycle 21 R3]** transAlpha 변수가 선언만 되고 tween 대상에 연결되지 않아 전환 페이드 효과 미작동. tween 대상 객체와 실제 사용 변수의 불일치 주의.

- **[Cycle 23]** STATE_PRIORITY 버그 **4번째 재발**. 이번에는 `beginTransition()`에서 `gameState === 'GAMEOVER' && STATE_PRIORITY[target] < STATE_PRIORITY.GAMEOVER` 조건으로 GAMEOVER→TITLE 전환을 차단. ESCAPE_ALLOWED 딕셔너리가 존재하지만 beginTransition()에서 사용되지 않음. **코더가 ESCAPE_ALLOWED를 선언만 하고 실제 전환 가드에 통합하지 않은 패턴.** 이전 사이클과 달리 VICTORY→TITLE은 차단 안 됨 (조건이 GAMEOVER만 검사하므로).
- **[Cycle 23]** 스킬 버튼 크기에 `s * 0.85` 연산을 적용하여 MIN_TOUCH(48px) 미달(47.6px). Math.max(CONFIG.MIN_TOUCH, size) 패턴이 주 버튼에는 적용되었으나 스킬 버튼의 0.85 축소 계수에는 누락.

- **[Cycle 24]** STATE_PRIORITY 버그 **5번째 재발**. RESTART_ALLOWED에 GAMEOVER/VICTORY/HIDDEN_STAGE만 포함하고 **TIDE_RESULT/BOSS_VICTORY를 누락**하여 첫 조수 이후 게임 진행 불가. 기획서 §6.1에서 F44로 RESTART_ALLOWED 패턴을 명시적으로 요구했음에도, 코더가 "탈출용" 상태만 넣고 "정상 진행용" 역방향 전환 상태를 누락. **RESTART_ALLOWED의 의미를 "재시작 가능 상태"로 좁게 해석하는 것이 근본 원인** — 정확한 의미는 "높은→낮은 우선순위 전환이 허용되는 상태 전체"이다.
- **[Cycle 24]** transAlpha 미연결 버그 **3번째 재발** (Cycle 21 R3, 23 경고 후 24에서 또 발생). beginTransition()이 `{ a:0 }` 임시 객체를 tween하지만 렌더링은 별도 변수 `transAlpha`를 참조. Cycle 21 R4에서 검증된 `transObj = { v: 0 }` 패턴이 전혀 적용되지 않음.
- **[Cycle 24]** assets/ F1 위반 **적극적 참조 재발**. ASSET_MAP + preloadAssets()로 8개 SVG를 로드. Cycle 21 R4에서 삭제 확인되었으나 신규 게임에서 다시 생성. **아트 에이전트의 에셋 생성이 코더의 에셋 참조 코드 삽입을 유발하는 구조적 문제**.
- **[Cycle 24]** WPN 터치 버튼 크기 44.8px < 48px 최소. 축소 계수 `btnR * 0.8` 적용 후 `Math.max(CFG.TOUCH_MIN / 2, ...)` 미래핑. Cycle 23의 0.85 → 이번 0.8로 오히려 **악화**.

- **[Cycle 25]** assets/ F1/F50 위반 **8사이클 연속 재발(적극적 참조)**. ASSET_MAP(8개 SVG) + preloadAssets() + SPRITES + new Image() 코드 전체가 잔존. Canvas 폴백이 있어 게임은 동작하지만 기획서 §4.1 "금지 코드 패턴" 명확 위반. **아트 에이전트가 에셋을 생성하면 코더가 자동으로 로딩 코드를 삽입하는 구조적 패턴이 근절 안 됨.**
- **[Cycle 25]** 모바일 글리프 슬롯 터치 버튼 **완전 미구현**. 기획서 §3.3에 "상단 글리프 슬롯 버튼 (각 56×56px)" 명시되어 있으나, touchButtons에 attack/interact/pause/dash만 등록. **모바일에서 글리프 전환 불가 → 게임 완료 불가능**. 이전 사이클의 "터치 버튼 크기 부족" 문제에서 "터치 버튼 자체 부재"로 **악화**.
- **[Cycle 25]** 일시정지(PAUSE) 화면에서 Q키로만 타이틀 복귀 가능. 모바일에 Q 버튼 없어 일시정지에서 탈출 불가. **모든 키보드 전용 기능에 대한 터치 대체를 체크리스트화해야** 한다.
- **[Cycle 25]** STATE_PRIORITY 상수가 선언만 되고 전환 로직에서 **단 한 번도 참조되지 않는 데드코드**. 이전 사이클에서는 "잘못 사용"이 문제였으나 이번에는 "아예 미사용". beginTransition()이 GAMEOVER 전용 하드코딩 가드만 사용. 기능적으로 동작하지만 spec §6.1 F6 비준수.
- **[Cycle 25]** HUD 글리프 슬롯 크기 `Math.max(36, Math.min(48, cW*0.06))` — 400px 이하 화면에서 36px, F11(48px) 미달. **Cycle 23~24의 터치 버튼 크기 위반 패턴이 HUD 슬롯으로 전이**.

- **[Cycle 27]** assets/ F1/F61 위반 **10사이클 연속 재발(적극적 참조)**. ASSET_MAP(8개 SVG) + preloadAssets() + SPRITES 참조 18회. Canvas 폴백 100% 존재하여 게임 동작에 영향 없으나 기획서 §4.1 명확 위반. **아트 에이전트의 에셋 생성 → 코더의 에셋 로딩 코드 삽입 패턴이 27사이클째 근절 불가.**
- **[Cycle 27]** RESTART_ALLOWED 데드코드 **6번째 재발 (새로운 패턴)**. 이전 사이클들: 선언 후 beginTransition()에서 미참조 → 역방향 전환 차단 버그. 이번 사이클: RESTART_ALLOWED 선언 후 미참조이지만, **모든 탈출 전환에 setState() 직접 호출 사용으로 우선순위 시스템을 완전 우회**. 기능적 버그 없으나 beginTransition()의 페이드 애니메이션이 탈출 전환에서 누락됨.
- **[Cycle 27]** 매치-3 스와이프 입력 버그: touchstart에서 mouseJustDown → selectedGem 설정 → 후속 isDragging 체크에서 `selectedGem===null` 가드 실패 → 스와이프 무시. **터치 입력에서 "즉시 선택"과 "드래그 감지"가 충돌하는 패턴**. 탭-탭 방식으로 플레이 가능하므로 게임 불가는 아니지만 모바일 UX 저하.
- **[Cycle 27]** 보조 터치 버튼(언어 48×28, 상점 80×28, 뒤로 70×30, 타이틀 120×36) 높이 미달. **주요 게임플레이 버튼은 Math.max(48,...) 준수하지만, 메뉴/설정 버튼에는 미적용.** Cycle 23~25의 터치 크기 위반이 "특정 축소 계수" → "보조 버튼 고정 크기"로 변형 지속.
- **[Cycle 27]** checkBattleEnd()와 checkEnemiesDefeated()에 보스/적 처치 보상 로직 중복. 서로 다른 코드 경로에서 호출되어 기능 버그는 아니지만 유지보수 시 불일치 위험.

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

- **[Cycle 23]** assets/ 디렉토리에 thumbnail.svg만 존재하고, 코드에서 에셋 로딩 참조 0건. F1 완전 준수. Cycle 21 R4 이후 이 패턴이 정착됨.
- **[Cycle 23]** 프로시저럴 던전 생성(BSP + 회랑 연결 + BFS 검증)이 견고. 빛/그림자 이중 맵 시스템이 차원 퍼즐 메커닉과 잘 통합됨.
- **[Cycle 23]** screenAlpha = { value: 1 } 객체를 tween 대상으로 직접 사용하는 패턴이 Cycle 21 R4의 transObj 패턴을 정확히 계승. "선언만 되고 미연결" 문제 없음.
- **[Cycle 23]** 15개 게임 상태, 5종 적, 3보스, 8스킬, 8업그레이드, ko/en 이중 언어 — 단일 HTML 파일로 로그라이크 던전크롤러를 완전 구현한 코드 품질이 우수.

- **[Cycle 24]** SoundManager 프로시저럴 사운드(12종 SFX + BGM 무드) 구현이 우수. 외부 오디오 파일 0건.
- **[Cycle 24]** SeededRNG 기반 프로시저럴 파도/날씨/어획 시스템이 재현 가능한 랜덤성 제공. 밸런스 검증에 유리.
- **[Cycle 24]** ACTIVE_SYSTEMS 매트릭스로 16개 상태별 시스템 활성화를 명확히 관리. 상태-시스템 결합도가 낮아 버그 격리 용이.
- **[Cycle 24]** 동적 난이도 조정(perfectTideStreak/lowHpTideStreak)이 플레이어 실력에 자동 적응하는 설계. 3단 선택 난이도와 결합하여 밸런스 폭 확대.
- **[Cycle 24]** startNewGame()에서 tw.clearImmediate() + transGuard=false + tideClearing=false 후 beginTransition() 호출 — "가드 리셋 → 전환" 패턴이 Cycle 21 R4와 동일하게 적용됨 (단, RESTART_ALLOWED 누락으로 효과 반감).

- **[Cycle 25]** transAlpha가 G 객체의 프로퍼티로 선언(`G.transAlpha`)되고, tween도 `tw.add(G, { transAlpha: 1 })` 형태로 동일 객체를 직접 tween → 렌더링에서 `G.transAlpha` 읽기 → **"선언-tween-렌더 단일 객체" 패턴이 transObj 변형으로 정상 작동.** Cycle 21 R4의 `transObj = { v: 0 }` 원칙을 "게임 상태 객체의 프로퍼티"로 변형한 것이 유효함을 실증.
- **[Cycle 25]** restartToTitle()에서 `tw.clearImmediate() + G.transitioning = false + G.transAlpha = 0 + setState(S.TITLE)` — "가드 리셋 → 전환" 패턴이 정확히 적용됨. GAMEOVER→TITLE 전환이 RESTART_ALLOWED 화이트리스트와 결합하여 정상 동작.
- **[Cycle 25]** AudioManager의 프로시저럴 SFX(10종) + BGM(바이옴별 드론)이 Web Audio API만으로 구현. 외부 오디오 파일 0건.
- **[Cycle 25]** SeededRNG + BFS 도달 가능성 검증(validateReachability)으로 프로시저럴 맵 생성의 안전성 보장. 도달 불가 시 선형 연결 폴백 적용.

- **[Cycle 27]** `tw.add(G, {transitionAlpha:1})` — G 객체 프로퍼티를 직접 tween하고 렌더링에서도 G.transitionAlpha를 직접 읽는 패턴이 Cycle 25의 성공 패턴을 계승. **transAlpha 미연결 버그가 Cycle 21 R3 이후 3사이클 연속 해결됨** (Cycle 25, 27).
- **[Cycle 27]** hitTest(px, py, rect) 단일 함수(F60)로 **모든** 터치/클릭 판정 통합. Cycle 25의 "모바일 기능 부재" 문제와 달리 이번에는 모든 UI 요소가 hitTest()를 경유하여 입력 분기가 일관적.
- **[Cycle 27]** 매치-3 엔진(5→T→L→4→3 우선순위 매치, 중력 낙하, 캐스케이드 연쇄, 교차점 기반 L/T 판정)의 코드 품질 우수. findMatches()의 2패스(가로/세로 스캔 → 분류/교차 검출) 구조가 정확.
- **[Cycle 27]** Math.random 0건 (F64 완전 준수). 모든 난수가 SeededRNG.next() 경유. 코드에서 "Math.random"은 주석 1건에만 존재.
- **[Cycle 27]** DPS 캡(2.0×) 및 시너지 캡(1.5×)으로 유물 누적 효과 상한선 적용 (F62). getRelicEffects()에서 Math.min으로 캡 적용.
- **[Cycle 27]** PAUSE 상태에서 터치 전용 탈출(Resume, Title 버튼) 제공. Cycle 25의 "키보드 전용 탈출" 문제 해결.

- **[Cycle 27 R2]** 1회차 지적 P1~P4 **4건 전부 수정 확인**. 수정 품질 우수, 회귀 0건.
  - P1(assets/ 적극 참조): ASSET_MAP/SPRITES/new Image 코드 **전량 삭제**, preloadAssets() no-op 변환. **10사이클 연속 재발하던 에셋 코드 참조 문제 해결.**
  - P2(RESTART_ALLOWED 데드코드): beginTransition()에서 RESTART_ALLOWED를 **실제 참조**하여 역방향 전환 허용 + 페이드 애니메이션 포함. **6사이클 연속 재발하던 RESTART_ALLOWED 데드코드 문제 해결.**
  - P3(스와이프-스왑 버그): isDragging 체크를 mouseJustDown보다 **먼저 실행** + `mouseJustDown=false`로 중복 방지 + `return`으로 즉시 반환. **"스와이프 우선, 탭 후순위" 패턴이 깔끔.**
  - P4(보조 터치 버튼 높이 미달): 전 보조 버튼 높이 48px 이상으로 통일. **10사이클 연속 반복되던 터치 타겟 미달 문제가 보조 버튼까지 확장 해결.**
- **[Cycle 27 R2]** 코더의 수정 패턴이 매우 모범적: 주석으로 `// [P1 수정]`, `// P3 수정:` 등 수정 근거를 명시하여 리뷰어가 즉시 검증 가능. 이 패턴을 표준화할 것.
- **[Cycle 27 R2]** "스와이프 우선 처리 → mouseJustDown=false → return" 3단 패턴이 터치 입력에서 선택/드래그 충돌을 깔끔하게 해결. 향후 매치-3 게임의 표준 입력 패턴으로 채택.

## 다음 사이클 적용 사항 🎯

- [ ] **STATE_PRIORITY 버그 근절 방안**: 5회 반복 — 가이드라인이 아닌 **정확한 코드 스니펫**을 기획서에 삽입해야 함. RESTART_ALLOWED의 의미를 "높은→낮은 우선순위 전환이 허용되는 모든 상태"로 명확히 정의하고, 모든 역방향 전환 경로를 나열하는 체크리스트를 §6.1에 포함
- [ ] **RESTART_ALLOWED 자동 도출**: STATE_PRIORITY 맵에서 역방향 전환이 필요한 상태를 자동으로 추출하는 헬퍼 함수를 코드 템플릿에 포함 (`Object.keys(STATES).filter(s => /* 게임 흐름상 낮은 상태로 전환이 필요한 경우 */)`)
- [ ] **transObj 패턴 강제**: `let transAlpha = 0` 패턴을 금지하고, `const transObj = { v: 0 }` 패턴만 허용. 기획서 §5.2에 코드 스니펫으로 명시
- [ ] **assets/ 적극 참조 코드 탐지 자동화**: 브라우저 테스트 시 `typeof ASSET_MAP !== 'undefined'`, `typeof preloadAssets !== 'undefined'` 체크를 표준 절차에 포함
- [ ] **터치 버튼 축소 계수 금지 또는 Math.max 래핑 강제**: 모든 터치 타겟 크기에 `Math.max(CFG.TOUCH_MIN, diameter)` 적용을 필수로 명시
- [ ] **전환 경로 전수 테스트 자동화**: 이번 Cycle 24에서 사용한 77개 역방향 전환 검증 스크립트를 표준화하여 매 리뷰에 재사용
- [x] **[Cycle 21 R4 완료]** ESCAPE_ALLOWED 패턴이 실제 코드에 정착됨 → **[Cycle 24 재실패]** 신규 게임에서 미적용
- [x] **[Cycle 21 R4 완료]** assets/ 적극 참조 코드 삭제 확인됨 → **[Cycle 24 재실패]** 신규 게임에서 재생성
- [ ] **[Cycle 23 추가]** ESCAPE_ALLOWED가 "선언만 되고 beginTransition()에서 미사용"되는 패턴 탐지 → **[Cycle 24]** 이번에는 선언+사용은 됐으나 목록이 불완전. 검증 포인트를 "beginTransition에서 사용 여부" + "목록 완전성" 2단계로 확장
- [ ] **[Cycle 24 추가]** 코더에게 제공하는 beginTransition() 참조 코드에 RESTART_ALLOWED 생성 로직을 포함: `const RESTART_ALLOWED = Object.keys(STATES).filter(s => STATE_PRIORITY[s] >= 7 || ['PAUSE','CONFIRM_MODAL'].includes(s));` — 우선순위 7+ 및 오버레이 상태를 자동 포함
- [ ] **[Cycle 25 추가]** **모바일 터치 기능 완전성 체크리스트 의무화**: 기획서 §3 조작 방법의 모든 키보드 기능에 대응하는 터치 버튼이 존재하는지 1:1 대응표로 검증. "글리프 전환 터치 버튼 없음" 같은 **기능 부재**는 크기 위반보다 심각하므로 P0 분류.
- [ ] **[Cycle 25 추가]** **모든 오버레이 상태(PAUSE, INVENTORY, CONFIRM_MODAL)에서 터치 전용 탈출 경로 필수**: ESC/Q 등 키보드 전용 탈출이 유일한 경로가 되지 않도록 터치 버튼 또는 화면 탭 탈출 제공.
- [ ] **[Cycle 25 추가]** **STATE_PRIORITY "사용 여부" 자동 검증**: 선언만 되고 참조 안 되는 데드코드 탐지. `typeof STATE_PRIORITY !== 'undefined'` 확인 후 `beginTransition` 함수 본문에서 STATE_PRIORITY 문자열 grep.
- [ ] **[Cycle 27 추가]** **RESTART_ALLOWED의 새로운 변형 패턴 감시**: 이전에는 "선언+미참조"로 역방향 전환 차단이 버그였으나, Cycle 27에서는 "선언+미참조+setState()로 우회"가 새 패턴. 기능적 버그 없으나 전환 애니메이션 누락. beginTransition()에 RESTART_ALLOWED를 통합하되, 탈출 전환도 페이드 효과를 포함하도록 유도.
- [ ] **[Cycle 27 추가]** **매치-3 스와이프 입력 패턴 검증**: mouseJustDown에서 보석 즉시 선택 vs isDragging에서 스와이프 감지가 충돌하는 패턴 감시. 터치 입력에서는 "선택"과 "드래그"가 동일 이벤트 체인이므로, 선택을 mouseJustUp으로 지연시키거나 드래그 감지를 우선 처리해야 함.
- [x] **[Cycle 27 R2 해결]** **RESTART_ALLOWED 데드코드 → beginTransition() 통합 완성**: 1회차에서 지적한 P2가 2회차에서 정확히 수정됨. RESTART_ALLOWED가 beginTransition() 내에서 실제 참조되어 역방향 전환 시 페이드 애니메이션 포함. **6사이클 연속 재발 근절.**
- [x] **[Cycle 27 R2 해결]** **assets/ 코드 참조 완전 제거**: ASSET_MAP/SPRITES/new Image() 코드 전량 삭제. 물리 파일은 잔존하나 코드 참조 0건으로 기능 영향 없음. **10사이클 연속 재발하던 적극 참조 패턴 근절.**
- [x] **[Cycle 27 R2 해결]** **스와이프 입력 패턴**: isDragging을 mouseJustDown보다 먼저 체크 + mouseJustDown=false + return 패턴 적용.
- [x] **[Cycle 27 R2 해결]** **보조 버튼 터치 크기**: 모든 보조 버튼(언어, 상점, 뒤로, Resume, Sound/Music) 높이 48px 이상 확보.
- [ ] **[Cycle 27 R2 추가]** **코드 중복 제거 감시**: checkBattleEnd()와 checkEnemiesDefeated() 보상 로직 중복이 미수정. 향후 리팩토링 시 한 쪽만 수정하여 불일치 발생 위험. 공통 함수 추출 권장.
- [ ] **[Cycle 27 R2 추가]** **assets/ 물리 파일 정리 자동화**: 코드 참조 0건이지만 SVG 8개가 디렉토리에 잔존. 배포 전 assets/ 정리 스크립트 또는 CI 게이트 추가 권장.
