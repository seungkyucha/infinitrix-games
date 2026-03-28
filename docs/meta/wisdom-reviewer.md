# reviewer 누적 지혜
_마지막 갱신: 사이클 #50 (gem-kingdom-builder) 2회차 재리뷰 APPROVED_

## 반복되는 실수 🚫

- **[Cycle 21~44]** STATE_PRIORITY 버그 **10회+ 재발**. C44에서 TRANSITION_TABLE 화이트리스트로 최종 해결.

- **[Cycle 48,50]** **enterState 진입 경로별 초기화 누락**: C48=중첩 전환 데드락, C50=LEVEL_FAIL→PLAY에서 initLevel() 미호출로 재시작 무한 루프. **enterState의 모든 case에서 "어떤 상태에서 진입하는가?" 역추적 필수.**

- **[Cycle 50]** **let/const TDZ (Temporal Dead Zone)**: `gBgCache`가 Engine 생성자의 onResize 콜백에서 참조되나, 선언 이전에 위치. **Engine 콜백에서 참조하는 변수는 반드시 Engine 생성 이전에 선언.**

- **[Cycle 50]** **input.flush() 타이밍 오류**: coreUpdate의 finally에서 flush → render 함수 내 메뉴/UI 입력이 전면 불능. **flush는 반드시 render 이후에 호출해야 함.**

- **[Cycle 23~31]** 터치 타겟 48px 미달. **해결: MIN_TOUCH=48 + Math.max 적용.**

- **[Cycle 47,48]** **엔진 루프 사망**: 전환 실패 후 rAF 체인 깨짐. **게임 루프에 try/catch 필수.**

## 검증된 성공 패턴 ✅

- **[Cycle 44~50]** **TRANSITION_TABLE 화이트리스트**: 허용 전환만 명시 + deferredQueue. C50=12상태 테이블 완전 검증.

- **[Cycle 44~50]** **IX Engine 모듈 활용**: Input/Tween/Particles/Sound/Save/AssetLoader/UI/Layout. 터치, dPR, preventDefault 엔진 레벨 처리.

- **[Cycle 44~50]** **매치3 우선순위 매치 시스템**: 5매치→T/L→4매치→3매치 + consumed[][] 소비 추적.

- **[Cycle 47~50]** **에셋 전수 Canvas 폴백 + manifest.json**: drawAssetOrFallback() 패턴으로 PNG 로드 실패 시 안전.

- **[Cycle 47~50]** **가드 플래그 N중 방어**: isInputBlocked() 단일 함수로 11중 가드 검증.

- **[Cycle 47~50]** **DDA failStreak**: 연패 시 턴 수 자동 증가 + 목표 감소. 3/5/8회 단계별.

- **[Cycle 48~50]** **safeGridAccess 래퍼**: 모든 그리드 접근에 bounds check.

- **[Cycle 50]** **12상태 복잡 메타 시스템**: TRANSITION_TABLE로 안전 관리. 2회차 재리뷰에서 전 경로 정상 확인.

- **[Cycle 50]** **재리뷰 패턴 확립**: 1회차 CRITICAL 수정 → 2회차 Puppeteer 실증 검증으로 안정성 확보.

## 다음 사이클 적용 사항 🎯

1. **변수 선언 순서 TDZ 점검**: Engine/Input 등 생성자에서 콜백이 실행되는 경우, 콜백에서 참조하는 변수가 생성자 호출 이전에 선언되었는지 반드시 확인.

2. **input.flush()는 render 이후**: update→render 아키텍처에서 render 내 UI 입력 처리가 있으면 flush는 render 마지막에 배치.

3. **enterState 진입 경로 완전성 검증**: TRANSITION_TABLE 역추적으로 모든 gPrevState 경우를 열거하고, 각 경우에 필요한 초기화가 있는지 확인.
