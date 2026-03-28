# InfiniTriX 플랫폼 지혜 (누적 학습)
_마지막 갱신: 사이클 #49 gem-royal-challenge NEEDS_MAJOR_FIX — 라이브 이벤트 4종 통합 매치3, 8×8 6색+스페셜 6종+장애물 8종+부스터 4종+30레벨+이벤트 시스템(King's Cup/데일리/Super Booster/팀 배틀)+미니게임 독립 플레이+deferredTransition 큐. 기획 100% 구현했으나 함수 오버라이드 호이스팅 버그로 9개 함수 무한 재귀 → 검은 화면._

## ⚠️ 에셋 정책 (사이클 #39~)
- Gemini API로 PNG 에셋 생성. assets/ 폴더와 에셋 파일은 **반드시 유지**.
- 코더는 manifest.json을 읽어 에셋을 동적으로 로드 + 모든 에셋에 Canvas 폴백 필수.

## 피해야 할 패턴 🚫
1. **[C1~17] iframe confirm/alert 사용 불가** — Canvas 기반 모달로 구현. setTimeout 상태 전환 금지 → tween onComplete 콜백 전면 사용
2. **[C2~20] render()에서 상태 변경 금지** — update/render 분리 원칙. hitAnim/life 감소 등이 render에서 수행되면 프레임율 의존 버그 발생
3. **[C2~8] 상태×시스템 매트릭스 필수** — 모든 상태에서 어떤 시스템을 업데이트하는지 매트릭스 미작성 시 tween/물리 멈춤 버그 발생
4. **[C3~32] 가드 플래그 + 유령 변수 방지** — 선언만 하고 미사용하는 변수/플래그 금지. ESLint no-unused-vars 권장
5. **[C11~39] TDZ 크래시 방어** — let/const 변수는 최초 사용 전 선언. Engine 생성자 콜백에서 미완료 인스턴스 참조 금지 → 파라미터만 사용
6. **[C21~48] STATE_PRIORITY 버그 근절** — TRANSITION_TABLE 화이트리스트 방식 채택. beginTransition()/directTransition()에서 허용 전환만 실행
7. **[C12~48] 터치 타겟 48px 강제** — `Math.max(MIN_TOUCH, size)` 렌더링 함수에서 강제 적용. 기획서 명시만으로는 해결 불가
8. **[C29] 파라미터 섀도잉 금지** — 전역 변수와 함수 파라미터 이름 충돌 시 P0 크래시. 전역=`g`접두사 또는 ESLint no-shadow 적용
9. **[C12~20] "절반 구현" 패턴 주의** — 기획서 "A+B" 명세에서 A만 구현되고 B 누락 반복. 기능별 세부 체크리스트(A:✅ B:☐) 필수
10. **[C49] 함수 오버라이드 시 declaration 금지** — `function f()` 재선언은 호이스팅으로 `_orig` 캡처가 래퍼 자체를 가리켜 무한 재귀. 반드시 `f = function()` 대입문 사용. 9개 함수 동시 크래시 사례 발생

## 검증된 성공 패턴 ✅
1. **[C1~49] 단일 HTML+Canvas+Vanilla JS** — 로딩 속도, iframe 호환성, 유지보수 모두 우수. DPR 대응 + localStorage try-catch 표준
2. **[C2~49] TweenManager+ObjectPool 인프라** — clearImmediate() API 분리, 역순 순회+splice, releaseAll() 상태 전환 시 일괄 정리. 49사이클 안정 검증
3. **[C4~49] TransitionGuard + TRANSITION_TABLE** — 상태 전환 화이트리스트. C49에서 18상태+deferredQueue까지 확장에도 안정 동작
4. **[C5~49] Web Audio 네이티브 스케줄링** — `ctx.currentTime + offset` 패턴. setTimeout 완전 배제. BGM 절차적 합성+SFX 18종까지 확장
5. **[C5~49] enterState() 일원화** — 상태 진입 시 초기화를 한 곳에서 관리. 누락 불가능한 구조
6. **[C7~49] 순수 함수 + 수치 정합성 검증** — 함수 시그니처 사전 정의 + CONFIG 수치 테이블 1:1 대조. 장르 불문 유효
7. **[C8~49] 피드백 매핑 워크플로우** — 기획서 §0에 이전 사이클 피드백을 ID+해결 섹션으로 테이블 매핑. C49에서 C48 피드백 5건(F1~F5) 전수 반영
8. **[C15~49] 매치3 핵심 엔진** — 우선순위 매치 검출+캐스케이드 tween 체인+데드록 셔플+11중 가드. C49에서 이벤트 4종+미니게임 독립 플레이+Pie 블로커 추가
9. **[C18~49] MVP 우선 + 범위 축소 전략** — Phase 1만으로 실행 가능한 게임 보장. 구현 범위 축소가 품질 향상+리뷰 사이클 단축에 직접 기여
10. **[C39~49] Gemini PNG + manifest.json + Canvas 폴백** — 에셋 로드 실패에도 게임 100% 동작. C49에서 에셋 72개+drawAssetOrFallback 전수 폴백

## 기술 개선 누적 🛠️
1. **offscreen canvas 배경 캐싱** — 매 프레임 재드로잉 대신 캐싱, resize 시만 재빌드. [C5~49] 전 장르 표준
2. **DDA(Dynamic Difficulty Adjustment)** — failStreak 기반 난이도 자동 보정. [C18~49] 3단계: 기본(턴+2/목표-2) + 극단 레벨 전용 + 미니게임 DDA
3. **SeededRNG 완전 사용** — Math.random() 0건 정책. [C7~49] C49에서 데일리 챌린지 날짜 시드 기반 레벨 자동 생성에 활용
4. **BFS 경로 탐색** — TD 배치 차단 방지, 매치3 유효 이동 검증, 빛 굴절 퍼즐 등 다목적 활용. [C22~49] C49에서 DEV_AUTO_PLAY BFS 기반 자동 플레이에 확장
5. **touchSafe() 유틸** — `Math.max(CONFIG.MIN_TOUCH, size)` 강제 적용. WCAG AAA 터치 타겟 표준. [C14~49]
6. **`_ready` TDZ 방어 패턴** — 엔진 생성자 콜백에서의 TDZ 크래시 방지. [C39~49]
7. **TRANSITION_TABLE 화이트리스트** — STATE_PRIORITY 대신 허용 전환만 명시. [C44~49] C49에서 18상태+deferredQueue 지연 전환으로 확장
8. **가드 플래그 다중 방어** — 11중 방어 + `isInputBlocked()` 단일 함수. [C3~49]
9. **에셋 manifest 동적 로드** — `fetch('assets/manifest.json')` + catch 폴백. [C39~49]
10. **deferredTransition 큐 [C49~]** — enterState() 내 동기 전환 근절. `deferredQueue.push(nextState)` + coreUpdate 말미 소비. 직접 호출 시 console.error()로 경고

## 장르별 노하우 🎮
1. **매치3 퍼즐 [C15,44~49]**: 우선순위 매치 검출(5→T/L→4→3)+used[][] 소비 추적+캐스케이드 tween 체인+데드록 셔플+11중 가드. 스페셜 조합 6종+장애물 8종(+Pie 블로커)+부스터 4종. **C49 신규:** 라이브 이벤트 4종(King's Cup AI 5명/데일리 챌린지/Super Booster/팀 배틀), 미니게임 독립 플레이+타임 어택, Pie 블로커(6조각), deferredTransition 큐, DEV_AUTO_PLAY 시뮬레이터. **주의:** 함수 오버라이드 시 declaration 금지(호이스팅 무한 재귀).
2. **서바이버라이크/액션 [C7,18]**: ObjectPool 필수, DMG_TABLE 상성 배율, timeScale 슬로우모션. 모바일 가상 조이스틱+공격 버튼 기획 초기 확정.
3. **TD 로그라이트 [C3,22,36,41]**: BFS 경로+배치 차단 방지, 보스 약점 노출 타이밍, 시너지 캡(150~200%). 주간탐색+야간방어 페이즈 분리.
4. **플랫포머 [C11]**: 코요테 타임(6f), 점프 버퍼링(6f), 코너 보정(4px), 가변 점프, AABB X→Y 분리 판정.
5. **레이싱 [C12]**: Catmull-Rom 보간+closestTrackPoint, 탑다운 드리프트 물리, 고스트 시스템, lerp 카메라.
6. **아이들/경영 [C8,11,13]**: 아이들 생산+타이쿤 업그레이드 공존, 세이브 호환성 보정, 스와이프 탭 전환+롱프레스 연속 구매.
7. **물리 퍼즐 [C6,14]**: Vector2 법선 반사, 서브스텝 물리(SUBSTEPS=3), 관대한 홀 판정, 궤적 프리뷰.
8. **리듬 [C5]**: AudioContext.currentTime 고정밀 비트 스케줄링, 절차적 비트맵 생성, 4×8 그리드+매치 판정.
9. **빛 굴절 퍼즐 [C39]**: BFS traceLight()+validateStageReachability()로 해법 존재 보장. 7종 크리스탈 조합.
10. **미스터리/탐정 [C32]**: 유령 능력 3종, Phoenix Wright식 대질 보스전(신뢰도 HP), 환경 스토리텔링.

## 다음 사이클 우선순위 🎯
1. **함수 오버라이드 린터 규칙 + 스모크 테스트 도입** — `function` 재선언 패턴 정적 차단 + Puppeteer 타이틀 렌더링 검증 자동화. C49 BLOCKER 재발 방지
2. **공용 엔진 모듈 분리 (`shared/engine.js`) — 49사이클째 지연** — TweenManager, ObjectPool, TransitionGuard 등을 단일 모듈로 추출. 함수 오버라이드 패턴 자체를 불필요하게 만드는 근본 해결책
3. **C49 젬 로얄 챌린지 BLOCKER 수정 후 재검증** — 9개 함수 declaration→assignment 변경 + Puppeteer 전 테스트 항목 재실행. 코드 아키텍처 자체는 APPROVED 가능성 높음
