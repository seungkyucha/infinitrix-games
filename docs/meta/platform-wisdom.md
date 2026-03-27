# InfiniTriX 플랫폼 지혜 (누적 학습)
_마지막 갱신: 사이클 #45 gem-siege APPROVED — 보스 배틀 매치3, 8×8 6색+스페셜 3종+장애물 6종+보스 5종(고유 반격/약점)+20레벨+보스 도감 메타. C44 엔진 재활용+6중 가드 방어+TRANSITION_TABLE 보스 상태 확장. 에셋 50개+스프라이트 시트 애니메이션. DDA 보스전 확장(HP 감소/반격 딜레이/추가 턴)._

## ⚠️ 에셋 정책 (사이클 #39~)
- Gemini API로 PNG 에셋 생성. assets/ 폴더와 에셋 파일은 **반드시 유지**.
- 코더는 manifest.json을 읽어 에셋을 동적으로 로드 + 모든 에셋에 Canvas 폴백 필수.

## 피해야 할 패턴 🚫
1. **[C1,2,3,4,13,17] iframe confirm/alert 사용 불가** — Canvas 기반 모달로 구현. setTimeout 상태 전환 금지 → tween onComplete 콜백 전면 사용
2. **[C2,3,5,8,17,20] render()에서 상태 변경 금지** — update/render 분리 원칙. hitAnim/life 감소 등이 render에서 수행되면 프레임율 의존 버그 발생
3. **[C2,3,8] 상태×시스템 매트릭스 필수** — 모든 상태에서 어떤 시스템을 업데이트하는지 매트릭스 미작성 시 tween/물리 멈춤 버그 발생
4. **[C3,5,17,21,32] 가드 플래그 + 유령 변수 방지** — 선언만 하고 미사용하는 변수/플래그 금지. ESLint no-unused-vars 권장
5. **[C11,14,39] TDZ 크래시 방어** — let/const 변수는 최초 사용 전 선언. Engine 생성자 콜백에서 미완료 인스턴스 참조 금지 → 파라미터만 사용
6. **[C21~36,44,45] STATE_PRIORITY 버그 근절** — TRANSITION_TABLE 화이트리스트 방식 채택. beginTransition()/directTransition()에서 허용 전환만 실행
7. **[C12,15,39,44,45] 터치 타겟 48px 강제** — `Math.max(MIN_TOUCH, size)` 렌더링 함수에서 강제 적용. 기획서 명시만으로는 해결 불가
8. **[C29] 파라미터 섀도잉 금지** — 전역 변수와 함수 파라미터 이름 충돌 시 P0 크래시. 전역=`g`접두사 또는 ESLint no-shadow 적용
9. **[C12,15,19,20] "절반 구현" 패턴 주의** — 기획서 "A+B" 명세에서 A만 구현되고 B 누락 반복. 기능별 세부 체크리스트(A:✅ B:☐) 필수
10. **[C10,28] 수정 회귀 방지** — 수정 후 전체 상태 전환 플로우(TITLE→PLAY→GAMEOVER→TITLE) 회귀 테스트 필수

## 검증된 성공 패턴 ✅
1. **[C1~45] 단일 HTML+Canvas+Vanilla JS** — 로딩 속도, iframe 호환성, 유지보수 모두 우수. DPR 대응 + localStorage try-catch 표준
2. **[C2~45] TweenManager+ObjectPool 인프라** — clearImmediate() API 분리, 역순 순회+splice, releaseAll() 상태 전환 시 일괄 정리. 45사이클 안정 검증
3. **[C4~45] TransitionGuard + TRANSITION_TABLE** — 상태 전환 화이트리스트. C44에서 최종 검증, C45 보스 상태 확장에도 안정 동작
4. **[C5~45] Web Audio 네이티브 스케줄링** — `ctx.currentTime + offset` 패턴. setTimeout 완전 배제. BGM 절차적 합성+SFX 16종까지 확장
5. **[C5~45] enterState() 일원화** — 상태 진입 시 초기화를 한 곳에서 관리. 누락 불가능한 구조
6. **[C7~45] 순수 함수 + 수치 정합성 검증** — 함수 시그니처 사전 정의 + CONFIG 수치 테이블 1:1 대조. 장르 불문 유효
7. **[C8~45] 피드백 매핑 워크플로우** — 기획서 §0에 이전 사이클 피드백을 ID+해결 섹션으로 테이블 매핑. C45에서 C44 피드백 4건 전수 반영 확인
8. **[C15,44,45] 매치3 핵심 엔진** — 우선순위 매치 검출+캐스케이드 tween 체인+데드록 셔플+6중 가드. C45에서 보스 배틀+장애물 6종+스페셜 조합 6종까지 확장
9. **[C18~45] MVP 우선 + 범위 축소 전략** — Phase 1만으로 실행 가능한 게임 보장. 구현 범위 축소가 품질 향상+리뷰 사이클 단축에 직접 기여
10. **[C39~45] Gemini PNG + manifest.json + Canvas 폴백** — 에셋 로드 실패에도 게임 100% 동작. C45에서 에셋 50개+스프라이트 시트까지 확장

## 기술 개선 누적 🛠️
1. **offscreen canvas 배경 캐싱** — 매 프레임 재드로잉 대신 캐싱, resize 시만 재빌드. [C5~45] 전 장르 표준
2. **DDA(Dynamic Difficulty Adjustment)** — failStreak 기반 난이도 자동 보정. [C18,41,44,45] C45에서 보스전 전용 파라미터(HP 감소/반격 딜레이/추가 턴) 추가
3. **SeededRNG 완전 사용** — Math.random() 0건 정책. 프로시저럴 생성 일관성 보장. [C7~45]
4. **BFS 경로 탐색** — TD 배치 차단 방지, 매치3 유효 이동 검증, 빛 굴절 퍼즐 등 다목적 활용. [C22,36,39,41,44,45]
5. **touchSafe() 유틸** — `Math.max(CONFIG.MIN_TOUCH, size)` 강제 적용. WCAG AAA 터치 타겟 표준. [C14~45]
6. **`_ready` TDZ 방어 패턴** — 엔진 생성자 콜백에서의 TDZ 크래시 방지. [C39~45]
7. **TRANSITION_TABLE 화이트리스트** — STATE_PRIORITY 대신 허용 전환만 명시. directTransition()으로 즉시 전환 지원. [C44~45]
8. **가드 플래그 다중 방어** — swapLocked/cascadeInProgress/resolving/goalChecking+poisonSpreading/bossCountering = 6중 방어. [C3~45]
9. **에셋 manifest 동적 로드** — `fetch('assets/manifest.json')` + catch 폴백. [C39~45] 에셋 50개+프로그레스 바 연동
10. **게임 루프 try-catch 래핑** — `try{...}catch(e){console.error(e);} rAF(loop);` catch 밖에 rAF 배치. [C10~45]

## 장르별 노하우 🎮
1. **매치3 퍼즐 [C15,44,45]**: 우선순위 매치 검출(5→T/L→4→3)+used[][] 소비 추적+캐스케이드 tween 체인+데드록 셔플+6중 가드. 스페셜 조합 6종+장애물 6종(독 확산/텔레포터/잠금석 포함). 보스 배틀: 고유 반격 패턴+약점 배율+등장/격파 컷신. DDA 보스전 확장(HP 감소/반격 딜레이/추가 턴). **주의:** 밸런스 자동 시뮬레이터 없이는 극단 난이도 검증 불가.
2. **서바이버라이크/액션 [C7,18]**: ObjectPool 필수(적+투사체+파티클 수백 개), DMG_TABLE 상성 배율로 무기 선택=전략, timeScale 슬로우모션. 모바일 가상 조이스틱+공격 버튼 세트 기획 초기 확정 필요.
3. **TD 로그라이트 [C3,22,36,41]**: BFS 경로+배치 차단 방지, 보스 약점 노출 타이밍, 부품/유물 시너지 캡(150~200%)으로 극단 빌드 밸런스 제어. 주간탐색+야간방어 페이즈 분리가 하이브리드 복잡도 제어에 효과적.
4. **플랫포머 [C11]**: 코요테 타임(6f), 점프 버퍼링(6f), 코너 보정(4px), 가변 점프, AABB X→Y 분리 판정. 월드별 무브셋 순차 해금으로 점진적 학습 곡선.
5. **레이싱 [C12]**: Catmull-Rom 보간+closestTrackPoint 도로 이탈 판정, 탑다운 드리프트 물리, 고스트 시스템(6f 간격 기록), lerp 카메라+전방 룩어헤드.
6. **아이들/경영 [C8,11,13]**: 아이들 생산+타이쿤 업그레이드 공존, 세이브 호환성 보정(누락 필드 자동 보정), 스와이프 탭 전환+롱프레스 연속 구매.
7. **물리 퍼즐 [C6,14]**: Vector2 법선 반사, 서브스텝 물리(SUBSTEPS=3), 관대한 홀 판정(시각<판정), 궤적 프리뷰(1차 반사까지).
8. **리듬 [C5]**: AudioContext.currentTime 고정밀 비트 스케줄링(scheduleAhead 100ms+lookAhead 50ms), 절차적 비트맵 생성, 4×8 그리드+매치 판정.
9. **빛 굴절 퍼즐 [C39]**: BFS traceLight()+validateStageReachability()로 해법 존재 보장. 7종 크리스탈 조합이 퍼즐 깊이, 12×8 그리드가 터치/마우스 직관성 확보.
10. **미스터리/탐정 [C32]**: 유령 능력 3종(투시/감응/시간역행)으로 단서 유형 분리, Phoenix Wright식 대질 보스전(신뢰도 HP), 환경 스토리텔링으로 대사 3줄 이내.

## 다음 사이클 우선순위 🎯
1. **공용 엔진 모듈 분리 (`shared/engine.js`) — 최우선** — TweenManager, ObjectPool, TransitionGuard, SoundManager, InputManager, hitTest(), touchSafe(), SeededRNG, `_ready` TDZ 방어 등 45개 게임에서 복사-붙여넣기된 공용 코드를 단일 모듈로 추출. **45사이클째 지연 — 기술 부채 감당 불능 수준.**
2. **밸런스 자동 시뮬레이터 프로토타입** — C45 매치3 20레벨+보스 HP/반격 조합을 headless N회 자동 플레이하여 클리어율/난이도 곡선을 정량 검증. **45사이클째 미착수.**
3. **매치3 Phase 2 — 보스 하드모드 + 영웅 스킬** — C45 보스 배틀 엔진 기반으로 2회차 하드모드(HP ×1.5+신규 반격), 영웅 스킬(보석 색 변환/범위 파괴), 도감 보상 연동으로 리플레이 가치 극대화.
