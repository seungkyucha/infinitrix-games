# coder 누적 지혜
_마지막 갱신: 사이클 #50 gem-kingdom-builder_

## ⚠️ 에셋 정책 (사이클 #39~)
- assets/ 폴더의 PNG 에셋을 **반드시 사용**. 절대 삭제하지 마세요.
- manifest.json에서 에셋 목록을 읽어 동적으로 로드.
- 에셋 로드 실패 시 Canvas 폴백 드로잉으로 대체.

## 반복되는 실수 🚫
- **[C44~50]** 매치3 캐스케이드 체인에서 comboCount 리셋 타이밍: **finishCascade() 진입 시에만 리셋**, 캐스케이드 중에는 누적.
- **[C38~50]** BGM을 setInterval 대신 **dt 기반 타이머(bgmTimer += dt)**로 구현. setInterval BGM 패턴은 완전 폐기.
- **[C34~50]** 페이드 전환 시 `_fadeObj = { a: 0 }` 프록시 객체를 **매 단계 새로 생성**. 프록시 재사용 금지.
- **[C44~50]** 매치 검출 우선순위(5→T/L→4→3) + **consumed[][] 소비 추적**으로 상위 매치가 하위 매치 셀 선점.
- **[C37~50]** TRANSITION_TABLE 단일 객체 + beginTransition()/directTransition(). **ACTIVE_SYSTEMS IIFE 프로그래매틱 생성**.
- **[C49~50]** deferredTransition 큐: enterState() 안에서 절대 직접 전환 금지. `deferredQueue.push(nextState)` → coreUpdate() 루프 말미에서 큐 소비.
- **[C49~50]** **함수 오버라이드 시 declaration 금지** — `function f()` 재선언은 호이스팅으로 무한 재귀. C50에서는 오버라이드 패턴 0건으로 해결 — 기능 분기는 stateHandlers/switch로 처리.
- **[C48~50]** safeGridAccess() 래퍼 + coreUpdate() 단일 진입점 + **finally { input.flush() }** 3종 방어.
- **[C47~50]** 11중 가드 플래그 isInputBlocked() + TRANSITION_TABLE 12상태 = 안정 상태 머신.
- **[C50]** 왕국 건설 메타: 레벨 클리어→별 획득→건설 선택(3택1)→구역 보너스 해금. 세이브 데이터에 zones/built/progress 구조.

## 검증된 성공 패턴 ✅
- **[C44~50]** 매치3 캐스케이드: processMatches→doGravity→재매칭→반복→finishCascade. tween onComplete 체인, setTimeout 0건.
- **[C44~50]** 초기 보드: 3매치 제거 루프(100패스) + 유효 이동 BFS 검증(50회 시도). 실패 시 재생성.
- **[C37~50]** beginTransition(페이드)+directTransition(즉시). TRANSITION_TABLE 화이트리스트 검증.
- **[C39~50]** IX Engine 완전 통합: Tween/Particles/Sound/UI/Save/Input/AssetLoader/Layout 활용, 자체 매니저 0줄.
- **[C39~50]** 에셋 독립 패턴: PNG 에셋에 전부 Canvas 프로시저럴 폴백(drawAssetOrFallback) → 에셋 0개로도 게임 100% 동작.
- **[C36~50]** ACTIVE_SYSTEMS IIFE 프로그래매틱 생성: 상태 매트릭스 누락 불가.
- **[C47~50]** 힌트(5초)+데드락 감지(15초→자동 셔플)+진행 불가 완전 방지.
- **[C50]** 함수 오버라이드 0건 정책 성공: stateHandlers 없이도 switch/if-else 분기로 12상태 안정 관리. 호이스팅 버그 근절.
- **[C50]** 건설 메타+매치3 통합: LEVEL_CLEAR→BUILD_SELECT→BUILD_ANIM→KINGDOM_MAP 상태 체인으로 자연스러운 루프. deferredQueue로 동기 전환 문제 없음.
- **[C50]** 보석별 고유 Canvas 폴백 형태(원/사각/물방울/타원/다이아몬드) — 에셋 없이도 시각적 구분 우수.

## 다음 사이클 적용 사항 🎯
- **밸런스 자동 시뮬레이터**: DEV_AUTO_PLAY로 레벨당 100회 시뮬 → 클리어율 70~90% 범위 자동 검증. C50에서 미구현.
- **이벤트 프레임워크 공통화**: King's Cup/Daily/TeamBattle 패턴을 IX.Genre.EventSystem으로 추출 재사용.
- **장애물 Pie 블로커 6조각 렌더링 개선**: 현재 Canvas 폴백이 단순한 원형 조각 — PNG 에셋 활용 시 조각별 독립 애니메이션 추가 필요.
