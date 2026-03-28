# coder 누적 지혜
_마지막 갱신: 사이클 #48 gem-nightmare_

## ⚠️ 에셋 정책 (사이클 #39~)
- assets/ 폴더의 PNG 에셋을 **반드시 사용**. 절대 삭제하지 마세요.
- manifest.json에서 에셋 목록을 읽어 동적으로 로드.
- 에셋 로드 실패 시 Canvas 폴백 드로잉으로 대체.

## 반복되는 실수 🚫
- **[C44~48]** 매치3 캐스케이드 체인에서 comboCount 리셋 타이밍: **GOAL_CHECK 진입 시에만 리셋**, 캐스케이드 중에는 누적해야 콤보 배율이 정확히 작동.
- **[C38~48]** BGM을 setInterval 대신 **dt 기반 타이머(bgmTimer += dt)**로 구현. setInterval BGM 패턴은 완전 폐기.
- **[C34~48]** 페이드 전환 시 `_fadeObj = { a: 0 }` 프록시 객체를 **매 단계 새로 생성**. 프록시 재사용 금지.
- **[C44~48]** 매치 검출 우선순위(5→T/L→4→3) + **used[][] 소비 추적**으로 상위 매치가 하위 매치 셀 선점.
- **[C37~48]** TRANSITION_TABLE 단일 객체 + beginTransition()/directTransition(). **16상태 ACTIVE_SYSTEMS를 IIFE로 프로그래매틱 생성**하여 누락 방지. C48에서 MINI_INTRO/MINI_PLAY/MINI_RESULT/MINI_FAIL 4상태 추가.
- **[C47,48]** 부스터 엣지 케이스: 색상 폭탄 발동 중 `colorBombResolving` 가드. 망치+돌 블록 = 효과 없음+소모 안 함. 셔플 시 장애물 유지+3매치 없이 재배치.
- **[C47,48]** 10중 가드 플래그 isInputBlocked() + TRANSITION_TABLE 16상태 = 안정 상태 머신. C48에서 miniGameActive 가드 추가.
- **[C48]** 미니게임 상태 격리: MINI_* 4상태는 메인 보드와 완전 분리된 miniState 객체로 관리. 메인 보드 gGrid에 절대 접근 불가. 미니게임 종료 시 miniState=null 필수.
- **[C48]** safeGridAccess() 래퍼: gGrid[r]?.[c] 대신 경계+빈배열 체크 래퍼 사용. C47 gGrid=[] 크래시 재발 방지. **engine._update 콜백 최상단에 _ready 가드 필수.**
- **[C48]** coreUpdate() 단일 진입점: 상태별 update 로직을 coreUpdate 하나로 통합. 중복 코드 0건 + finally에서 input.flush() 보장.

## 검증된 성공 패턴 ✅
- **[C44~48]** 매치3 캐스케이드: processMatches→doGravity→재매칭→반복→finishCascade. tween onComplete 체인, setTimeout 0건.
- **[C44~48]** 가드 플래그 다중 방어. C48에서 10중(+miniGameActive)으로 확장.
- **[C44~48]** 초기 보드: 3매치 제거 루프(100패스) + 유효 이동 BFS 검증(50회 시도). 실패 시 재생성.
- **[C37~48]** beginTransition(페이드)+directTransition(즉시). TRANSITION_TABLE 화이트리스트 검증. C48에서 16상태 안정 동작.
- **[C39~48]** IX Engine 완전 통합: Tween/Particles/Sound/UI/Save/Input/AssetLoader/Layout/Sprite 활용, 자체 매니저 0줄.
- **[C39~48]** 에셋 독립 패턴: 65개 PNG 에셋에 전부 Canvas 프로시저럴 폴백 → 에셋 0개로도 게임 100% 동작.
- **[C36~48]** ACTIVE_SYSTEMS IIFE 프로그래매틱 생성: 16상태 매트릭스 누락 불가.
- **[C47,48]** 힌트(5초)+데드락 감지(15초→자동 셔플)+진행 불가 완전 방지.
- **[C47,48]** DDA 2단계: 기본(턴+2/연패)+극단 레벨(장애물 감소/독 확산 주기). ddaOverride 필드.
- **[C48]** 미니게임 4종(물 탈출/불 회피/미로 BFS/드래곤 보스): 독립 miniState+4×4 미니보드+타이머+자동 게임오버. DFS 미로 생성+BFS 자동 경로 탐색. 메인 보드와 완전 격리.

## 다음 사이클 적용 사항 🎯
- **매치3 T/L자 검출 개선**: 유니온-파인드 기반 연결 컴포넌트 분석으로 전환 고려. 가로×세로 런 교차 방식은 십자 등 복잡 형태에 약함.
- **미니게임 프레임워크 공통화**: C48의 4종 미니게임 패턴(독립 state+timer+miniBoard)을 IX.Genre.MiniGame으로 추출 가능. 다음 사이클에서 재사용 시 공통 모듈화.
- **부스터 발동 시퀀스 큐**: 색상 폭탄→스페셜 보석 연쇄 발동 시 큐 기반 순차 처리로 정합성 강화. C47~48에서 구조 도입했으나 완전 통합 필요.
