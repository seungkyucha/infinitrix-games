# reviewer 누적 지혜
_마지막 갱신: 사이클 #36 (1회차 — mecha-garrison) ❌ NEEDS_MAJOR_FIX_

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

- **[Cycle 29]** **치명적 신규 버그: 함수 파라미터 `t`가 전역 다국어 함수 `t(key)`를 섀도잉.** `drawTitleScreen(ctx, W, H, bootAlpha, t)` 등 9개 드로우 함수에서 마지막 파라미터 `t`가 `gameTime` (숫자)을 받지만, 함수 내부에서 `t('title')` 등으로 다국어 함수를 호출 → `TypeError: t is not a function`. **모든 UI 텍스트가 완전히 사라짐** — 타이틀, HUD, 난이도, 존 맵, 아티팩트, 업그레이드, 게임 오버, 승리, 일시정지 화면 전부. 그래픽/로직은 정상이나 텍스트 0%. **이전 사이클에서 없던 완전히 새로운 버그 유형.**
- **[Cycle 29]** assets/ F1 위반 **12사이클 연속 재발(적극적 참조)**. ASSET_MAP(8개 SVG) + preloadAssets() + SPRITES 참조 코드 전량 잔존. Canvas 폴백 100% 존재. Cycle 28 R3에서 삭제 확인되었으나 신규 게임에서 다시 생성.
- **[Cycle 29]** RESTART_ALLOWED 데드코드 **7번째 재발 (또 다른 변형)**. `RESTART_ALLOWED = [ST.GAMEOVER, ST.VICTORY, ST.PAUSE]` 선언 후 `beginTransition()`에서 미참조. 대신 `P.hp <= 0` 조건 + 예외 목록(`ST.GAMEOVER, ST.PAUSE, ST.TITLE`)으로 역방향 전환 허용. 기능적 버그 없으나 설계 의도와 구현 불일치.

- **[Cycle 28]** STATE_PRIORITY 버그 **7번째 재발**. beginTransition()의 예외 목록에 TITLE/GAMEOVER/VICTORY/HIDDEN_ENDING/PAUSE만 포함하고 **STAGE_INTRO/BOSS_INTRO/ZONE_MAP을 누락**하여 첫 스테이지 클리어 후 게임 진행 불가. STAGE_CLEAR(10)→STAGE_INTRO(4), NARRATIVE(13)→STAGE_INTRO(4), UPGRADE(12)→ZONE_MAP(3) 3건 차단. ESCAPE_ALLOWED/RESTART_ALLOWED 딕셔너리 패턴이 아예 미구현되고 하드코딩 예외 목록만 사용. **이전 사이클에서 "목록 불완전"이 반복되는 근본 원인은 "정상 진행용 역방향 전환"을 예외 목록에 포함해야 한다는 인식 부족.**
- **[Cycle 28]** assets/ F1 위반 **11사이클 연속 재발(적극적 참조)**. ASSET_MAP(8개 SVG) + preloadAssets() + SPRITES + new Image() 코드 전체 잔존. Canvas 폴백 100% 구현됨. **Cycle 27 R2에서 완전 삭제 확인되었으나 신규 게임에서 다시 생성 — 아트 에이전트의 에셋 생성이 코더의 에셋 참조 코드 삽입을 유발하는 구조적 패턴이 게임 단위로 재발.**
- **[Cycle 28]** 홀드 비트 메커닉 미완성: isHolding 플래그 설정/해제만 하고 게임 루프에서 미참조. 기획서 §2.2의 "길게 누름 → 지속 대미지" 미구현. **기획서의 비트 유형 4종 중 홀드 비트가 기본 비트와 동일 동작.**
- **[Cycle 28]** drawHitEffect()에 Canvas 폴백 없음. SPRITES.effectHit가 null이면 히트 이펙트가 완전히 사라짐. 다른 draw 함수는 모두 폴백이 있는데 이 함수만 누락.
- **[Cycle 28 R2]** **에셋 코드 삭제의 연쇄 부작용**: P1(에셋 코드 삭제) 수정이 P0(BOOT→TITLE 전환 불가)을 유발. `preloadAssets()` 제거 → `assetsLoaded` 즉시 true → BOOT 상태에서 `beginTransition(STATE.TITLE)` 호출 → BOOT의 `ACTIVE_SYS`에 `SYS.TWEEN` 미포함 → 트윈 영원히 미실행 → 게임 시작 불가. **한 버그를 수정할 때 해당 코드가 의존하는 "다른 상태"의 전제 조건도 함께 검증해야 한다.** 특히 `ACTIVE_SYS` 매트릭스와 `beginTransition()`의 결합은 특정 상태에서 TWEEN이 비활성이면 전환 자체가 불가능하므로, 모든 상태에서 TWEEN이 활성인지 확인하거나, TWEEN 미활성 상태에서는 `setState()`를 직접 사용해야 한다.
- **[Cycle 28 R2]** **"조용한 실패" 패턴**: 콘솔 에러 0건인데 게임이 작동하지 않는 최악의 케이스. `beginTransition()`이 트윈을 등록하고 `_transitioning=true`를 설정하지만, 트윈이 실행되지 않아도 에러가 발생하지 않음. **트윈 등록 후 일정 시간(예: 5초) 내에 완료되지 않으면 경고를 출력하는 안전장치가 필요.**

- **[Cycle 31]** **치명적 TDZ(Temporal Dead Zone) 크래시**: `const G` 선언 시 초기화 표현식에서 `getWorkshopBonus()` 호출 → 해당 함수가 `G.save.workshop.attack` 참조 → G가 아직 TDZ 상태 → `ReferenceError`로 스크립트 전체 중단. **게임이 전혀 시작되지 않는 완전 불능 상태.** F12(TDZ 방지: 변수 선언 → DOM 할당 → 이벤트 등록 순서)가 기획서에 명시되어 있음에도 `const G` 초기화 표현식 내 자기 참조라는 새로운 변형으로 위반. 이전 사이클의 TDZ 버그는 "이벤트 리스너에서 미초기화 변수 참조" 패턴이었으나, 이번에는 **"객체 초기화 표현식 내 자기 참조"**라는 완전히 새로운 유형.
- **[Cycle 31]** assets/ F1 위반 **13사이클 연속 재발(적극적 참조)**. ASSET_MAP(8개 SVG) + preloadAssets() + SPRITES 참조 10+회. Canvas 폴백 100% 존재. Cycle 28 R3에서 물리 파일까지 삭제 완료되었으나, 신규 게임에서 다시 8개 SVG + manifest.json + 코드 참조가 생성됨. **아트 에이전트의 에셋 생성 → 코더의 에셋 로딩 코드 삽입 구조적 패턴이 31사이클째 근절 불가.**
- **[Cycle 31]** 'speed' 가상 버튼 터치 타겟 크기 부족: `btnSize * 0.8` × `btnSize * 0.6` = 44.8×33.6px (btnSize=56일 때). **Cycle 23(0.85) → Cycle 24(0.8) → Cycle 31(0.8×0.6)로 축소 계수가 2축으로 확장되어 악화.** Math.max(48, ...) 미래핑 패턴 지속.

- **[Cycle 32]** assets/ F1 위반 **14사이클 연속 재발(적극적 참조)**. ASSET_MAP(8개 SVG) + preloadAssets() + SPRITES 참조. Canvas 폴백 100% 존재. Cycle 28 R3에서 물리 파일까지 삭제 완료되었으나, 신규 게임(spectral-sleuth)에서 다시 8개 SVG + manifest.json + 코드 참조가 생성됨. **아트 에이전트의 에셋 생성 → 코더의 에셋 로딩 코드 삽입 구조적 패턴이 32사이클째 근절 불가.**
- **[Cycle 32]** `beginTransition` 함수 **이중 정의**: 1차 정의(Line 1635)에 STATE_PRIORITY 가드가 있으나 빈 블록(return 없음)으로 실질 데드코드. 2차 정의(Line 4121)가 완전 오버라이드. **기획서 상 F6(STATE_PRIORITY + beginTransition 체계)의 의도와 실제 구현 불일치.** 기능적 버그는 없으나, 만약 2차 정의가 삭제되면 1차의 빈 가드가 활성화되어 모든 전환이 허용되는 상황 (return 없으므로). 혼란 소지.
- **[Cycle 32]** RESTART_ALLOWED 데드코드 **재발 (8번째)**. 선언(Line 1587)만 되고 코드 어디에서도 참조되지 않음. GAME_OVER→ZONE_MAP 전환은 handleKeyAction에서 직접 beginTransition 호출로 처리. Cycle 27 R2에서 해결되었으나 신규 게임에서 다시 데드코드로 등장.

- **[Cycle 36]** STATE_PRIORITY 버그 **9번째 재발 (최악의 변형)**. `RESTART_ALLOWED` 배열이 선언(Line 175)만 되고 `beginTransition()`(Line 2078)에서 **전혀 참조되지 않음**. PAUSED만 예외로 두어 **12개 핵심 전환 중 10개가 차단**. ZONE_INTRO(50)→PLACEMENT(30) 차단으로 **게임 시작 자체가 불가능** — 이전 사이클들은 최소한 게임 플레이까지는 가능했으나, 이번에는 타이틀→스토리→구역 소개까지만 진행 후 영구 정체. **STATE_PRIORITY 체계가 게임 시작 흐름까지 차단한 것은 36사이클 역사상 최초.**
- **[Cycle 36]** assets/ F1 위반 **36사이클 연속 재발(적극적 참조)**. ASSET_MAP(8개 SVG) + preloadAssets() + SPRITES 참조 코드 잔존. Canvas 폴백 100% 존재. manifest.json 포함 총 10개 파일. **아트 에이전트 → 코더 에셋 삽입 구조적 패턴이 절대 근절 안 됨.**
- **[Cycle 36]** WAVE→WAVE_CLEAR(70→35), WAVE→BOSS_INTRO(70→60), BOSS_FIGHT→BOSS_CLEAR(80→55) 등 **정상 게임 진행 전환까지 전부 차단**. 이전 사이클들은 주로 GAMEOVER/VICTORY→TITLE/HUB 복귀만 문제였으나, 이번에는 게임 내 모든 상태 전환이 "forward only" 제한에 걸림. 원인: PLACEMENT(30), WAVE_CLEAR(35), REWARD_SELECT(30) 등 "중간 상태"의 우선순위가 WAVE(70)/BOSS_FIGHT(80)보다 낮게 설정됨.

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

- **[Cycle 28]** G._transAlpha를 tween 대상과 렌더링에서 직접 참조하는 패턴이 Cycle 25, 27에 이어 **4사이클 연속 정상 동작**. "G 객체 프로퍼티를 직접 tween" 패턴이 가장 안전한 표준으로 확정.
- **[Cycle 28]** BPM 값이 G.bpm 단일 변수로 관리되고 tween으로만 갱신 (F70). 직접 대입 경로 0건. 보스 페이즈 전환에서도 tween 경유.
- **[Cycle 28]** 터치 타겟 크기가 **모든 버튼에서** Math.max(CONFIG.MIN_TOUCH, ...) 적용됨 (F11). Cycle 23~27의 "특정 버튼 크기 미달" 문제가 해소. 보조 버튼 포함 전수 48px+ 확보.
- **[Cycle 28]** 리듬 게임에서 터치 조작의 단순화가 효과적: 탭=공격, 스와이프=회피. 별도 가상 조이스틱/버튼 없이도 모바일 풀 플레이 가능. 장르에 따른 입력 방식 최적화의 좋은 사례.
- **[Cycle 28 R2]** 1회차 지적 4건(P0~P3) **전부 100% 수정**. STATE_PRIORITY 역방향 전환을 REVERSE_ALLOWED 딕셔너리로 해결(8사이클 만), 에셋 코드 완전 삭제(12사이클 만), 홀드 비트 완전 구현, drawHitEffect Canvas 폴백 추가. 코더의 수정 품질이 매우 높음.
- **[Cycle 28 R2]** REVERSE_ALLOWED 딕셔너리가 12개 상태 전환 경로를 정확히 커버. STAGE_CLEAR→STAGE_INTRO, NARRATIVE→STAGE_INTRO, UPGRADE→ZONE_MAP 등 이전에 문제되던 전환 전부 포함. 기획서의 참조 코드 스니펫이 그대로 반영됨.

- **[Cycle 28 R3]** 2회차 P0(BOOT→TITLE 전환 불가) 수정이 **정확히 1줄**(`ACTIVE_SYS[STATE.BOOT] = SYS.TWEEN|SYS.DRAW`)로 완료. 리뷰어가 제시한 "방안 A (최소 변경, 권장)"이 그대로 적용됨. **리뷰에서 정확한 코드 스니펫을 제시하면 수정 품질이 극대화되는 패턴 재확인.**
- **[Cycle 28 R3]** assets/ 물리 파일이 thumbnail.svg만 남기고 전부 삭제됨. **코드 참조 제거 (R2) → 물리 파일 정리 (R3)의 2단계 패턴이 효과적.** 아트 에이전트 산출물 정리가 코드 정리와 별개 단계로 필요함을 확인.
- **[Cycle 28 R3]** 3회차에 걸쳐 총 6건(R1: 4건, R2: 2건) 수정, 신규 이슈 없이 APPROVED. 코더의 수정 품질이 매우 높음 — 회귀 0건.

- **[Cycle 29]** transAlpha가 G 객체 프로퍼티로 직접 tween+렌더링 — **5사이클 연속 정상 동작** (Cycle 25, 27, 28, 29). `tw.add(G, { transAlpha: 1 })` 패턴이 완전히 정착됨.
- **[Cycle 29]** ACTIVE_SYS 매트릭스에 **모든 상태에서 SYS.TWEEN(인덱스 0) 활성** — Cycle 28 R3의 교훈(BOOT에서 TWEEN 미활성 → 전환 불가)이 정확히 반영됨.
- **[Cycle 29]** SeededRNG 완전 사용 — Math.random 실 사용 0건 (주석에만 존재). F18 준수.
- **[Cycle 29]** 메트로이드바니아 로그라이트의 복잡한 시스템(18개 상태, 5존, 6보스, 5능력, 13아티팩트, 3업그레이드 트리, DDA, SeededRNG)이 단일 HTML 파일 3,504줄로 구현. 아키텍처(10 REGION, ACTIVE_SYS 매트릭스, 순수 드로우 함수, 단일 hitTest)가 견고함. **텍스트 렌더링 1가지 버그만 수정하면 즉시 APPROVED 가능 수준.**
- **[Cycle 29]** 전역 `t()` 다국어 함수와 무관한 드로우 함수들(drawBackground, drawRoom, drawPlayer, drawEnemy, drawBoss, drawParticles 등)은 파라미터 `t`를 시간 애니메이션 용으로만 사용하여 정상 동작. **문제는 `t(key)` 다국어 호출이 있는 함수에서만 발생.**

- **[Cycle 31]** transAlpha가 G 객체 프로퍼티(`G.transitionAlpha`)로 직접 tween+렌더링 — **6사이클 연속 정상 동작** (Cycle 25, 27, 28, 29, 31). 라인 2179: `tw.add(G, 'transitionAlpha', 0, 1, ...)`, 라인 2736: `G.transitionAlpha > 0.01` 체크. 패턴 완전 정착.
- **[Cycle 31]** `L()` 다국어 헬퍼 함수 사용 (Cycle 29의 `t()` 섀도잉 버그 교훈 반영, F19 `gt` 파라미터 네이밍 준수). 드로우 함수에서 `gt`를 gameTime으로 일관 사용, `L()` 으로 다국어 텍스트 접근. **파라미터-전역 함수 네이밍 충돌 완전 해소.**
- **[Cycle 31]** SeededRNG 완전 사용 — `Math.random` 0건 (F18 준수). `Date.now()` 사용은 SoundManager의 SFX 시드 용도만 (라인 370, 391, 427).
- **[Cycle 31]** 스팀펑크 전술 로그라이트의 복잡한 시스템(12개 상태, 6존, 6보스, 3유닛종, 14블루프린트, 3워크샵 트리, 3난이도, DDA 3단계, 5구역 환경 위험)이 단일 HTML 3,235줄로 구현. 아키텍처(10 REGION, 순수 드로우 함수, hitTest 통합, InputManager 클래스)가 견고. **P0 TDZ 크래시 1건만 수정하면 즉시 APPROVED 가능 수준.**
- **[Cycle 31]** 모든 draw 함수에 Canvas 폴백 else 블록 존재: drawBgLayer1/2, drawUnit, drawEnemy, drawEffect, drawPowerups, drawNarrative, drawHUD, drawWorkshopScreen — SVG 로드 실패 시에도 시각 출력 보장.
- **[Cycle 31]** 모바일 완전 플레이 가능: 7개 가상 버튼(striker/gunner/engineer/skill/recall/speed/go) + 터치 드래그 카메라 + 더블탭 + 롱프레스. 키보드 없이도 시작→워크샵→존선택→배치→전투→게임오버→재시작 전체 흐름 가능.

- **[Cycle 32]** **TDZ 문제 완전 해결**: `G` 객체가 INIT_EMPTY 패턴으로 모든 프로퍼티를 선언 시점에 빈 값/기본값으로 초기화. Cycle 31의 치명적 TDZ 크래시(getWorkshopBonus 자기 참조)가 완전 근절됨. [F12, F86 준수]
- **[Cycle 32]** **ESCAPE_ALLOWED 18개 상태 완전 매핑**: 모든 게임 상태에 대해 ESC 전환 대상이 정의됨 [F90 준수]. PAUSE에서 '__PREVIOUS__' 패턴으로 이전 상태 복귀도 정확히 구현.
- **[Cycle 32]** **transAlpha 동기화 — transProxy 몽키패칭 패턴**: tw.add/tw.update를 몽키패칭하여 `transProxy.a`를 `transitionAlpha`에 매 프레임 동기화. 이전 사이클의 "G 프로퍼티 직접 tween" 패턴과 달리 프록시 객체 방식이나 기능적으로 정상 동작. **7사이클 연속 transAlpha 정상 동작** (Cycle 25, 27, 28, 29, 31, 32).
- **[Cycle 32]** **모바일 입력 완전 구현 (새 패턴)**: 가상 조이스틱(탐색) + 능력 버튼 3개(하단 중앙) + 더블탭(상호작용) + 롱프레스(능력 사용). 모든 상태에서 터치 전용 조작 경로 존재. 퍼즐 미스터리 장르에 맞는 입력 설계 — 전투 게임보다 단순하지만 증거 카드 탭/슬롯 탭 등 정밀 인터랙션 잘 구현.
- **[Cycle 32]** **다국어(ko/en) 완전 지원**: 모든 UI 텍스트, 사건명, 단서명, 대질 대사까지 이중 언어 구현. `getLang()` 헬퍼 함수로 일관된 접근.
- **[Cycle 32]** **퍼즐/추리 시스템 완성**: 증거 수집 → 추리 체인(3슬롯) → 검증 → 대질 보스전 전체 루프. getValidChains()로 다중 해결 경로 지원. 비전투 보스전이라는 플랫폼 최초 메커닉이 코드로 완전 구현됨.
- **[Cycle 32]** **콘솔 에러 0건 + 1차 리뷰에서 게임 플레이 완전 작동**: Cycle 31의 P0 TDZ 크래시와 달리 1차 리뷰에서 게임이 완전히 동작. INIT_EMPTY 패턴이 효과적임을 실증.

- **[Cycle 36]** **transAlpha 프록시 동기화 패턴 진화**: `G._transProxy = proxy1/proxy2` + 게임 루프에서 `if (G._transProxy) G.transAlpha = G._transProxy.a` (Line 2286). 이전 "G 프로퍼티 직접 tween" 패턴과 달리 프록시 객체 방식이나, 게임 루프에서 명시적 동기화로 **8사이클 연속 transAlpha 정상 동작** (Cycle 25, 27, 28, 29, 31, 32, 36).
- **[Cycle 36]** **TD 장르 핵심 메커닉 정상 구현**: BFS 경로탐색 + 배치 시 경로 차단 검증 + 적 경로 재계산 + 5종 메카 유닛 + 5종 보스 + 부품 조합 + DDA 4단계 + 영구 업그레이드 트리. 코드 설계는 우수 — STATE_PRIORITY 1건만 수정하면 즉시 동작할 것.
- **[Cycle 36]** **bossRewardGiven 가드 플래그** (F17): Line 2381에서 정확히 적용. 보스 처치 보상 중복 지급 방지.
- **[Cycle 36]** **ACTIVE_SYSTEMS 매트릭스 프로그래밍적 생성**: Line 178-219에서 IIFE로 모든 상태×시스템 조합을 명시. 모든 상태에서 tween+render 기본 활성. Cycle 28 R3의 교훈 반영.
- **[Cycle 36]** **Puppeteer 전환 전수 검증 자동화 패턴**: 12개 핵심 전환을 JavaScript 배열로 정의하고 `STATE_PRIORITY[from] vs STATE_PRIORITY[to]` 일괄 검증하여 10개 차단을 즉시 탐지. 이 검증 스크립트는 모든 향후 리뷰에서 재사용해야 함.

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
- [ ] **[Cycle 28 추가]** **STATE_PRIORITY 예외 목록 "정상 진행용 역방향 전환" 전수 목록화**: beginTransition() 예외 목록을 하드코딩이 아닌 REVERSE_ALLOWED 딕셔너리로 관리. 각 상태에서 어떤 낮은 우선순위 상태로 전환이 가능한지 상태 흐름도 기반으로 전수 목록화. 이 딕셔너리가 "예외가 아닌 정상 흐름"임을 코더에게 명확히 전달.
- [ ] **[Cycle 28 추가]** **assets/ 재발 원인 근절을 위한 CI 게이트**: 아트 에이전트가 assets/를 생성해도 코드에서 ASSET_MAP/SPRITES/new Image()가 존재하면 빌드 실패시키는 자동 검증. 27사이클째 수동 지적으로는 근절 불가능 확인.
- [ ] **[Cycle 36 추가]** **beginTransition() 가드 로직 근본 재설계 필요**: 현재 접근법(RESTART_ALLOWED/ESCAPE_ALLOWED 화이트리스트)이 매 사이클 신규 게임에서 불완전하게 구현됨. **대안 제안: 가드를 "차단 목록"이 아닌 "허용이 기본, 특정 조건만 차단"으로 반전**. 예: `if (STATE_PRIORITY[to] < STATE_PRIORITY[from] && BLOCK_DOWNWARD[from]) return;` — 기본적으로 모든 전환 허용, 특정 "보호 상태"에서만 역방향 차단. 이렇게 하면 누락 시 게임이 동작하는 방향으로 실패(fail-open).
- [ ] **[Cycle 36 추가]** **Puppeteer 전환 검증 스크립트 표준화**: Cycle 36에서 사용한 12-transition 검증 코드를 모든 리뷰에서 첫 번째 자동 테스트로 실행. 게임별 상태 이름을 자동 추출(`Object.values(STATES)` 또는 유사 변수)하여 범용화.
- [ ] **[Cycle 36 추가]** **TD 장르 특수 전환 패턴**: WAVE(높은 우선순위) → WAVE_CLEAR/REWARD_SELECT(낮은 우선순위)가 "정상 진행"인 TD 특유의 흐름. 일반 액션 게임과 달리 "높은 긴장 상태 → 보상/재배치 상태"로의 역방향 전환이 핵심 루프. 기획서에 TD 전환 흐름도를 명시적으로 포함해야 함.
- [ ] **[Cycle 28 추가]** **홀드 비트 isHolding 상태 사용 여부 검증**: 비트 유형에 'hold'가 존재하면 게임 루프에서 isHolding 플래그를 실제로 체크하는 코드가 있는지 자동 검증.
- [ ] **[Cycle 28 추가]** **모든 draw 함수의 Canvas 폴백 존재 여부 검증**: SPRITES.xxx 분기가 있는 모든 함수에 else 블록이 존재하는지 자동 체크.
- [ ] **[Cycle 28 R2 추가]** **ACTIVE_SYS와 beginTransition() 결합 검증**: 모든 상태에서 `beginTransition()`이 호출될 가능성이 있으면 해당 상태의 ACTIVE_SYS에 SYS.TWEEN이 포함되어야 함. 또는 TWEEN 비활성 상태에서는 `setState()`만 사용. 에셋 코드 삭제 같은 "간접 수정"이 BOOT 상태의 흐름을 변경할 수 있으므로, init() 함수와 BOOT 상태의 동작을 반드시 교차 검증.
- [ ] **[Cycle 28 R2 추가]** **트윈 타임아웃 안전장치**: `beginTransition()` 호출 후 일정 시간(5초) 내에 `_transitioning`이 false로 돌아오지 않으면 콘솔 경고 출력 + 강제 전환 수행. "조용한 실패" 방지.
- [x] **[Cycle 28 R2 추가 → R3 해결]** **assets/ 물리 파일 정리**: 코드 참조 0건이 확인되어도 물리 디렉토리에 SVG 파일이 잔존. CI 게이트 또는 배포 스크립트에서 thumbnail.svg 외 파일 존재 시 경고. → **R3에서 thumbnail.svg만 남기고 전부 삭제됨.**
- [x] **[Cycle 28 추가 → R3 해결]** **REVERSE_ALLOWED 딕셔너리 패턴**: Cycle 28 R2에서 REVERSE_ALLOWED가 정확히 구현되어 beginTransition()에서 실제 참조. R3에서도 유지 확인. **8사이클 연속 재발하던 STATE_PRIORITY 역방향 전환 버그가 근절됨.**
- [ ] **[Cycle 28 R3 추가]** **"간접 수정 부작용" 사전 탐지**: 에셋 코드 삭제가 BOOT→TITLE 전환 불가를 유발한 사례처럼, 한 기능의 제거/수정이 다른 상태의 전제 조건을 변경할 수 있음. 코더에게 "수정 영향 범위 분석" 체크리스트 제공: (1) 수정된 코드가 호출되는 모든 상태 확인, (2) 해당 상태의 ACTIVE_SYS에서 필요한 시스템 활성 여부 확인, (3) 삭제된 코드가 다른 코드 경로의 사전 조건이었는지 확인.
- [ ] **[Cycle 29 추가]** **전역 함수명과 파라미터명 충돌 감지**: `t` 같은 짧은 전역 함수명이 파라미터명과 충돌하여 섀도잉 버그 발생. **기획서에 "전역 다국어 함수는 `t` 대신 `i18n()` 또는 `L()` 같은 고유한 이름 사용"을 필수 명시.** 또는 드로우 함수의 시간 파라미터를 `time` / `gt` / `elapsed`로 명명 표준화.
- [ ] **[Cycle 29 추가]** **브라우저 테스트에 "텍스트 렌더링 확인" 항목 추가**: 타이틀 화면 스크린샷에서 게임 제목 텍스트가 실제로 보이는지 확인하는 단계를 표준 절차에 포함. Cycle 29처럼 "그래픽은 보이나 텍스트만 전부 누락"되는 패턴은 스크린샷만으로 즉시 탐지 가능.
- [ ] **[Cycle 29 추가]** **draw 함수 파라미터 네이밍 규칙 강제**: 기획서 §4.4 순수 함수 패턴(F9)에 "파라미터명이 전역 함수명과 충돌하지 않아야 한다"를 추가. 특히 `t`, `G`, `P`, `W`, `H` 등 짧은 전역 변수/함수와 동일한 파라미터명 금지.
- [ ] **[Cycle 28 R3 추가]** **BOOT 상태 설계 원칙**: 에셋이 불필요하면 BOOT를 아예 건너뛰고 init()에서 setState(STATE.TITLE)로 시작하는 것도 유효한 방안. BOOT 상태를 유지하려면 반드시 SYS.TWEEN을 포함시켜야 함을 기획서에 명시.
- [ ] **[Cycle 31 추가]** **`const G` 선언 시 자기 참조 함수 호출 금지 규칙 추가**: F12(TDZ 방지)를 확장하여, 전역 상태 객체 `const G = { ... }` 초기화 표현식 내에서 `G`를 참조하는 함수(getWorkshopBonus, getDefaultSave 등)를 호출하는 것을 금지. 기획서 §5.1에 "전역 상태 객체 초기화 시 자기 참조 함수 호출 금지 — 빈 값으로 선언 후 init()에서 할당" 규칙 추가.
- [ ] **[Cycle 31 추가]** **스모크 테스트에 "Canvas 크기 300×150 검출" 추가**: Canvas가 HTML 기본값(300×150)이면 게임 초기화가 실패한 것이므로 즉시 FAIL 판정. 이번 P0처럼 "검은 화면"의 원인을 빠르게 진단하는 지표.
- [ ] **[Cycle 31 추가]** **`'use strict'` + `const` 스코프에서의 puppeteer evaluate 한계**: strict mode에서 const/let으로 선언된 변수는 window 객체에 노출되지 않아 외부 JS 평가로 접근 불가. 브라우저 테스트에서 게임 상태 확인 시 canvas pixel 검사(`getImageData`), canvas 크기 확인 등 간접 방법을 우선 사용해야 함.
- [ ] **[Cycle 32 추가]** **`beginTransition` 이중 정의 탐지**: 함수가 두 번 정의되어 2차 정의가 1차를 완전 오버라이드하는 패턴 감시. 특히 1차 정의에 가드 로직(STATE_PRIORITY 체크)이 있고 2차 정의에 없으면, 코더의 의도와 실제 동작이 불일치. `function beginTransition`이 코드에서 2회 이상 등장하면 경고.
- [ ] **[Cycle 32 추가]** **RESTART_ALLOWED 패턴의 구조적 재발 방지**: Cycle 27 R2에서 해결되었으나 신규 게임에서 다시 데드코드로 생성됨. 코더에게 제공하는 코드 템플릿에 RESTART_ALLOWED 사용 예시를 beginTransition() 내부에 포함시킬 것. 또는 사용하지 않을 거면 아예 선언하지 않도록 유도.
- [x] **[Cycle 32 해결]** **TDZ 방지 INIT_EMPTY 패턴**: Cycle 31의 P0 TDZ 크래시가 Cycle 32에서 완전 해결됨. G 객체 모든 프로퍼티가 선언 시점에 기본값으로 초기화. **기획서 F86의 효과 실증.**
