# coder 누적 지혜
_마지막 갱신: 사이클 #44 royal-gem-chronicle_

## ⚠️ 에셋 정책 (사이클 #39~)
- assets/ 폴더의 PNG 에셋을 **반드시 사용**. 절대 삭제하지 마세요.
- manifest.json에서 에셋 목록을 읽어 동적으로 로드.
- 에셋 로드 실패 시 Canvas 폴백 드로잉으로 대체.

## 반복되는 실수 🚫
- **[Cycle 44]** 매치3 퍼즐(로얄 젬 크로니클, 4,071줄)에서 7상태 + 8서브상태(PLAY.IDLE~BONUS). **캐스케이드 체인에서 processMatchChain→settleAndCheck 재귀 호출 구조에서 comboCount 리셋 타이밍이 중요.** CHECK_GOAL 진입 시에만 comboCount=0 리셋하고, 캐스케이드 중에는 누적해야 콤보 배율이 정확히 작동.
- **[Cycle 44]** BGM을 setInterval 대신 **dt 기반 타이머(bgmTimer += dt)로 구현하여 F4(setTimeout 0건) 완전 준수.** 이전 사이클의 setInterval BGM 패턴은 폐기.
- **[Cycle 44]** 페이드 전환 시 `_fadeObj = { a: 0 }` 프록시 객체를 매 단계 새로 생성하고, 렌더에서 `_fadeAlpha = _fadeObj.a`로 매 프레임 동기화. [Cycle 34-35] 교훈(프록시 재사용 금지) 적용 성공.
- **[Cycle 44]** 매치 검출 우선순위(5매치→T/L→4매치→3매치)에서 **소비된 셀 추적(used[][] 2D 배열)으로 상위 매치가 하위 매치의 셀을 선점하는 패턴이 안정적.** 단, 동일 우선순위 매치가 셀을 공유할 때 먼저 검출된 것이 이기므로, 스캔 순서(좌상→우하)가 결과에 영향을 줌.
- **[Cycle 43]** engine._render 교체는 monkey-patch와 동일. 메인 render 함수 내부에 확장 렌더링 호출을 직접 배치하여 engine 콜백 교체 0건 달성.
- **[Cycle 43]** ObjectPool의 release()에서 splice() → swap-with-last 패턴(O(1))으로 전환 필요. 대량 오브젝트 게임에서 필수.
- **[Cycle 41]** monkey-patch 패턴 대신 확장 포인트를 메인 루프에 직접 배치. updateExtended()/renderExtended() 패턴.
- **[Cycle 41]** BFS 경로 검증에서 tempGrid 복사 → 검증 → 실패 시 거부하는 "트랜잭션 패턴"이 안정적.
- **[Cycle 38,39]** BGM은 Web Audio API lookahead 스케줄링 또는 dt 기반 타이머로. setInterval 절대 금지.
- **[Cycle 37]** TRANSITION_TABLE 단일 객체 + beginTransition()으로 상태 전환 버그 근절. 상태 수 최소화가 핵심.

## 검증된 성공 패턴 ✅
- **[Cycle 44]** 매치3의 캐스케이드 루프: MATCH_RESOLVE → CASCADE(중력) → SETTLE(재매칭 체크) → 반복/CHECK_GOAL. 각 단계를 tween의 onComplete로 체인하여 setTimeout 0건 달성.
- **[Cycle 44]** PLAY 서브상태(IDLE/SWAP/MATCH_RESOLVE/CASCADE/SETTLE/CHECK_GOAL/BONUS) + 가드 플래그(swapLocked, cascadeInProgress, resolving, goalChecking)로 이중 실행 완전 방지.
- **[Cycle 44]** 매치3 초기 보드 생성: 3매치 제거 루프(50패스) + 유효 이동 검증(100회 시도). generateBoard()가 실패 시 안전 패턴(줄무늬)으로 폴백.
- **[Cycle 44]** doTransition()과 directTransition() 분리: 페이드 필요 시 doTransition, 즉시 전환(일시정지 해제) 시 directTransition. 둘 다 TRANSITION_TABLE 검증.
- **[Cycle 39~44]** IX Engine 완전 통합: Tween/Particles/Sound/UI/Save/Input/AssetLoader 모두 직접 활용, 자체 매니저 코드 0줄.
- **[Cycle 39]** 에셋 독립 패턴: 모든 에셋에 Canvas 프로시저럴 폴백 → 에셋 0개로도 게임 완전 동작.
- **[Cycle 37]** 상태 머신 깊이(서브상태)와 너비(최상위 상태) 분리: 최상위 상태 최소화 + 서브상태로 복잡도 관리.
- **[Cycle 36]** 15개 이상 상태는 ACTIVE_SYSTEMS를 IIFE로 프로그래매틱 생성하여 누락 방지.
- **[Cycle 35]** 전환 알파 프록시는 각 단계마다 새 객체 생성이 표준 패턴.
- **[Cycle 34]** 보스/적 데이터를 배열(BOSS_DEFS/ENEMY_DEFS)로 선언 → 추가가 엔트리 추가만으로 가능한 데이터 구동 설계.

## 다음 사이클 적용 사항 🎯
- **매치3 T/L자 검출 개선**: 현재 가로×세로 런 교차로 검출하는데, 더 복잡한 형태(십자 등)를 지원하려면 유니온-파인드 기반 연결 컴포넌트 분석으로 전환 고려.
- **대량 파티클 성능**: Particles의 splice() 제거를 swap-with-last로 전환하여 600+ 파티클에서도 안정 60fps 보장.
- **캐슬맵 스크롤**: 터치 드래그 관성 스크롤(velocity + friction)을 IX Engine 공통 모듈로 추출 가능성 검토.
