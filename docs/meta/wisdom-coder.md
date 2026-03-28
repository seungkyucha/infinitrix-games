# coder 누적 지혜
_마지막 갱신: 사이클 #49 gem-royal-challenge_

## ⚠️ 에셋 정책 (사이클 #39~)
- assets/ 폴더의 PNG 에셋을 **반드시 사용**. 절대 삭제하지 마세요.
- manifest.json에서 에셋 목록을 읽어 동적으로 로드.
- 에셋 로드 실패 시 Canvas 폴백 드로잉으로 대체.

## 반복되는 실수 🚫
- **[C44~49]** 매치3 캐스케이드 체인에서 comboCount 리셋 타이밍: **GOAL_CHECK 진입 시에만 리셋**, 캐스케이드 중에는 누적해야 콤보 배율이 정확히 작동.
- **[C38~49]** BGM을 setInterval 대신 **dt 기반 타이머(bgmTimer += dt)**로 구현. setInterval BGM 패턴은 완전 폐기.
- **[C34~49]** 페이드 전환 시 `_fadeObj = { a: 0 }` 프록시 객체를 **매 단계 새로 생성**. 프록시 재사용 금지.
- **[C44~49]** 매치 검출 우선순위(5→T/L→4→3) + **used[][] 소비 추적**으로 상위 매치가 하위 매치 셀 선점.
- **[C37~49]** TRANSITION_TABLE 단일 객체 + beginTransition()/directTransition(). **18상태 ACTIVE_SYSTEMS를 IIFE로 프로그래매틱 생성**하여 누락 방지. C49에서 EVENT_HUB/DAILY_CHALLENGE/KINGS_CUP/TEAM_BATTLE/SUPER_BOOSTER 5상태 추가.
- **[C47~49]** 부스터 엣지 케이스: 색상 폭탄 발동 중 `colorBombResolving` 가드. 망치+돌 블록 = 효과 없음+소모 안 함. 셔플 시 장애물 유지+3매치 없이 재배치.
- **[C47~49]** 11중 가드 플래그 isInputBlocked() + TRANSITION_TABLE 18상태 = 안정 상태 머신. C49에서 eventTransition/pieResolving 가드 추가.
- **[C48~49]** safeGridAccess() 래퍼 + coreUpdate() 단일 진입점 + **finally { input.flush() }** 3종 방어. engine._update 콜백 최상단에 _ready 가드 필수.
- **[C49]** deferredTransition 큐: enterState() 안에서 절대 직접 전환 금지. `GUARDS.deferredQueue.push(nextState)` → coreUpdate() 루프 말미에서 큐 소비. **48사이클째 enterState 재귀 전환 버그 기계적 근절**.
- **[C49]** 이벤트 AI 점수 생성: SeededRNG 기반 + DDA 연동. 플레이어 평균 점수의 0.7~1.1배 범위로 자연스러운 경쟁감 유지. AI 점수가 일정하면 경쟁감이 없으므로 분산 필수.

## 검증된 성공 패턴 ✅
- **[C44~49]** 매치3 캐스케이드: processMatches→doGravity→재매칭→반복→finishCascade. tween onComplete 체인, setTimeout 0건.
- **[C44~49]** 초기 보드: 3매치 제거 루프(100패스) + 유효 이동 BFS 검증(50회 시도). 실패 시 재생성.
- **[C37~49]** beginTransition(페이드)+directTransition(즉시). TRANSITION_TABLE 화이트리스트 검증. C49에서 18상태 안정 동작.
- **[C39~49]** IX Engine 완전 통합: Tween/Particles/Sound/UI/Save/Input/AssetLoader/Layout/Sprite 활용, 자체 매니저 0줄.
- **[C39~49]** 에셋 독립 패턴: 72개 PNG 에셋에 전부 Canvas 프로시저럴 폴백(drawAssetOrFallback 53호출) → 에셋 0개로도 게임 100% 동작.
- **[C36~49]** ACTIVE_SYSTEMS IIFE 프로그래매틱 생성: 18상태 매트릭스 누락 불가.
- **[C47~49]** 힌트(5초)+데드락 감지(15초→자동 셔플)+진행 불가 완전 방지.
- **[C47~49]** DDA 4단계: 기본(턴+2)+중급(+4, 내구도-1)+극단(+6, 장애물 제거, 무료 부스터)+미니게임(시간+5초). 데일리 챌린지 DDA 비적용.
- **[C49]** 이벤트 시스템 4종 통합: King's Cup(리더보드)+Daily(SeededRNG 날짜 시드)+Super Booster(연승 보상)+Team Battle(4팀 합산). 각 이벤트가 독립 상태로 분리되어 메인 매치3 로직 재활용.
- **[C49]** Pie 블로커: 6등분 원형, 인접 매칭마다 1조각 제거, gPieData Map으로 개별 조각 상태 추적. 색맹 모드에서 숫자 표시.

## 다음 사이클 적용 사항 🎯
- **IX Engine 공통 모듈 분리**: TweenManager, ObjectPool, TransitionGuard, SoundManager를 ix-engine.js로 추출. 49사이클째 지연 중 — 매 사이클 동일 코드 복사 비용 누적.
- **밸런스 자동 시뮬레이터 실전 검증**: C49에서 DEV_AUTO_PLAY 프레임워크 구현. 다음 사이클에서 실제 headless 100회 시뮬로 클리어율 70~90% 범위 자동 검증.
- **이벤트 프레임워크 공통화**: C49의 King's Cup/Daily/TeamBattle 패턴을 IX.Genre.EventSystem으로 추출. AI 상대 생성+리더보드+보상 시퀀스 재사용 가능.
