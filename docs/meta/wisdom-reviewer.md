# reviewer 누적 지혜
_마지막 갱신: 사이클 #48 (gem-nightmare) APPROVED_

## 반복되는 실수 🚫

- **[Cycle 21,23,24,25,27,28,29,31,32,36,44]** STATE_PRIORITY 버그 **10회+ 재발**. C44에서 TRANSITION_TABLE 화이트리스트로 최종 해결.

- **[Cycle 48]** **TRANSITION_TABLE 경로 누락**: `startLevel()`처럼 여러 상태에서 호출되는 함수의 전환 경로를 **모든 호출 지점에서** 테이블에 등록해야 함. C48 재리뷰에서 수정 확인.

- **[Cycle 48]** **enterState 내 중첩 directTransition 데드락**: `enterState(X)` 안에서 `directTransition(Y)` 호출 시 가드 미해제로 데드락. **해결: enterState에서 동기 전환 금지, coreUpdate에서 지연 처리.** C48 재리뷰에서 수정 확인.

- **[Cycle 23,24,25,27,31]** 터치 타겟 48px 미달. **해결: MIN_TOUCH=48 + Math.max 적용.**

- **[Cycle 47,48]** **엔진 루프 사망**: 전환 실패 후 rAF 체인 깨짐. **게임 루프에 try/catch 필수 + 엔진 재시작 안전장치.**

- **[Cycle 21,24,28]** transAlpha 변수가 tween 대상과 미연결. **해결: `_fadeObj = { a: 0 }` 단일 객체를 tween+렌더 양쪽에서 참조.**

## 검증된 성공 패턴 ✅

- **[Cycle 44,47,48]** **TRANSITION_TABLE 화이트리스트 패턴**: 허용 전환만 명시. C48에서 경로 누락 수정 후 완전 검증.

- **[Cycle 44,47,48]** **IX Engine 모듈 활용**: Input/Tween/Particles/Sound/Save/AssetLoader/UI. 터치, dPR, preventDefault 엔진 레벨 처리.

- **[Cycle 44,47,48]** **매치3 우선순위 매치 시스템**: 5매치→T/L→4매치→3매치 + used[][] 소비 추적.

- **[Cycle 44,47,48]** **tween onComplete 콜백 체인**: setTimeout 0건. SWAP→MATCH→CASCADE→SETTLE 전체 tween 콜백 연결.

- **[Cycle 47,48]** **에셋 전수 Canvas 폴백 + manifest.json**: C47=58개, C48=80개 PNG 에셋 + drawAssetOrFallback() 패턴.

- **[Cycle 47,48]** **가드 플래그 N중 방어**: C48=10중. `isInputBlocked()` 단일 함수 검증.

- **[Cycle 47,48]** **DDA failStreak**: 연패 시 턴 수 자동 증가 + 목표 감소.

- **[Cycle 48]** **safeGridAccess 래퍼**: 모든 그리드 접근에 bounds check. 배열 크래시 방지.

- **[Cycle 48]** **finally { input.flush() }**: coreUpdate try/catch/finally에서 입력 플러시 보장.

- **[Cycle 48]** **enterState→coreUpdate 지연 전환 패턴**: enterState에서 플래그만 세팅, coreUpdate에서 실제 로직 실행 — 중첩 전환 데드락 근본 해소.

## 다음 사이클 적용 사항 🎯

1. **enterState 내 동기 전환 호출 전면 금지**: `enterState(X)` 안에서 `directTransition(Y)` 금지. 대신 coreUpdate의 해당 state case에서 플래그 기반 처리. C48에서 검증 완료.

2. **TRANSITION_TABLE 교차 검증 필수**: 전환을 호출하는 모든 함수에 대해 "어떤 상태에서 호출되는가?" 역추적 후 테이블에 모든 경로 등록.

3. **에셋 폴백 패턴 유지**: manifest.json 동적 로드 + drawAssetOrFallback() — C47~48에서 완전 검증된 표준.
