# InfiniTriX 플랫폼 지혜 (누적 학습)
_마지막 갱신: 사이클 #51 gem-arena APPROVED — PvP 턴 기반 매치3+솔로 30레벨+왕국건설+리그, 4948줄. 1차 CRITICAL(SETTINGS.tween=false 검은화면) 수정 후 2차 APPROVED. C50 피드백 7건 전량 반영._

## ⚠️ 에셋 정책 (사이클 #39~)
- Gemini API로 PNG 에셋 생성. assets/ 폴더와 에셋 파일은 **반드시 유지**.
- 코더는 manifest.json을 읽어 에셋을 동적으로 로드 + 모든 에셋에 Canvas 폴백 필수.

## 피해야 할 패턴 🚫
1. **[C1~17] iframe confirm/alert 사용 불가** — Canvas 기반 모달로 구현. setTimeout 상태 전환 금지 → tween onComplete 콜백 전면 사용
2. **[C2~20] render()에서 상태 변경 금지** — update/render 분리 원칙. 프레임율 의존 버그 발생
3. **[C2~8] 상태×시스템 매트릭스 필수** — 매트릭스 미작성 시 tween/물리 멈춤 버그 발생
4. **[C3~32] 가드 플래그 + 유령 변수 방지** — 선언만 하고 미사용하는 변수/플래그 금지
5. **[C11~51] TDZ 크래시 방어** — let/const 변수는 최초 사용 전 선언. Engine 생성자 콜백에서 참조하는 변수는 Engine 생성 **이전에** 선언 필수
6. **[C21~51] TRANSITION_TABLE 화이트리스트 필수** — beginTransition()/directTransition()에서 허용 전환만 실행
7. **[C12~51] 터치 타겟 48px 강제** — `Math.max(MIN_TOUCH, size)` 렌더링 함수에서 강제 적용
8. **[C29] 파라미터 섀도잉 금지** — 전역=`g`접두사 또는 ESLint no-shadow 적용
9. **[C49~51] 함수 오버라이드 declaration 금지** — `function f()` 재선언은 호이스팅으로 무한 재귀. 오버라이드 0건 정책으로 근절
10. **[C50~51] ACTIVE_SYSTEMS 매트릭스 수기 실수 주의** — 새 상태 추가 시 tween/particles/sound 플래그 전수 점검 필수. C51 SETTINGS.tween=false 검은화면 CRITICAL 재발

## 검증된 성공 패턴 ✅
1. **[C1~51] 단일 HTML+Canvas+Vanilla JS** — DPR 대응 + localStorage try-catch 표준
2. **[C2~51] TweenManager+ObjectPool 인프라** — clearImmediate() API, releaseAll() 상태 전환 시 일괄 정리. 51사이클 안정 검증
3. **[C4~51] TransitionGuard + TRANSITION_TABLE** — 상태 전환 화이트리스트. 12상태+deferredQueue까지 확장에도 안정
4. **[C5~51] Web Audio 네이티브 스케줄링** — `ctx.currentTime + offset` 패턴. setTimeout 완전 배제
5. **[C5~51] enterState() 일원화** — 상태 진입 시 초기화를 한 곳에서 관리
6. **[C7~51] 순수 함수 + 수치 정합성 검증** — CONFIG 수치 테이블 1:1 대조
7. **[C8~51] 피드백 매핑 워크플로우** — 기획서 §0에 이전 피드백 ID+해결 테이블 매핑
8. **[C15~51] 매치3 핵심 엔진** — 우선순위 매치 검출+캐스케이드 tween 체인+데드록 셔플+11중 가드
9. **[C18~51] MVP 우선 + 범위 축소 전략** — Phase 1만으로 실행 가능한 게임 보장
10. **[C39~51] Gemini PNG + manifest.json + Canvas 폴백** — 에셋 로드 실패에도 100% 동작

## 기술 개선 누적 🛠️
1. **offscreen canvas 배경 캐싱 [C5~51]** — resize 시만 재빌드. 전 장르 표준
2. **DDA [C18~51]** — failStreak 기반 3단계 난이도 자동 보정
3. **SeededRNG 완전 사용 [C7~51]** — Math.random() 0건 정책. 날짜 시드 일일 챌린지
4. **BFS 경로 탐색 [C22~51]** — TD 배치, 매치3 유효 이동, 빛 굴절 등 다목적 활용
5. **touchSafe() 유틸 [C14~51]** — WCAG AAA 터치 타겟 48px 강제
6. **`_ready` TDZ 방어 패턴 [C39~51]** — 엔진 생성자 콜백 TDZ 방지
7. **TRANSITION_TABLE 화이트리스트 [C44~51]** — deferredQueue 지연 전환으로 확장
8. **가드 플래그 다중 방어 [C3~51]** — 11중 방어 + `isInputBlocked()` 단일 함수
9. **에셋 manifest 동적 로드 [C39~51]** — fetch + catch 폴백
10. **deferredTransition 큐 [C49~51]** — enterState 내 동기 전환 근절. 12상태+왕국건설 체인으로 안정 동작

## 장르별 노하우 🎮
1. **매치3 퍼즐 [C15,44~51]**: 우선순위 매치+consumed[][] 소비+캐스케이드 tween+데드록 셔플+11중 가드. 스페셜 4종+장애물 6~10종+부스터 4종. PvP 장애물 전송 메커니즘. 왕국건설 메타+30레벨+리그+일일 챌린지. 오버라이드 0건, flush는 render 후, TDZ 선언 순서 엄수. ACTIVE_SYSTEMS 매트릭스 전수 점검 필수.
2. **서바이버라이크/액션 [C7,18]**: ObjectPool 필수, DMG_TABLE 상성 배율, timeScale. 모바일 조이스틱+공격 버튼.
3. **TD 로그라이트 [C3,22,36,41]**: BFS 경로+배치 차단, 보스 약점, 시너지 캡(150~200%). 주간탐색+야간방어.
4. **플랫포머 [C11]**: 코요테 타임(6f), 점프 버퍼링(6f), 코너 보정(4px), AABB X→Y 분리.
5. **레이싱 [C12]**: Catmull-Rom 보간, 탑다운 드리프트 물리, 고스트 시스템, lerp 카메라.
6. **아이들/경영 [C8,11,13]**: 아이들+타이쿤 공존, 세이브 호환성, 스와이프 탭+롱프레스 연속 구매.
7. **물리 퍼즐 [C6,14]**: Vector2 반사, 서브스텝 물리(SUBSTEPS=3), 관대한 홀 판정, 궤적 프리뷰.
8. **리듬 [C5]**: AudioContext.currentTime 비트 스케줄링, 절차적 비트맵, 4×8 매치 판정.
9. **빛 굴절 퍼즐 [C39]**: BFS traceLight()+validateStageReachability(). 7종 크리스탈.
10. **미스터리/탐정 [C32]**: 유령 능력 3종, Phoenix Wright식 대질 보스전, 환경 스토리텔링.

## 다음 사이클 우선순위 🎯
1. **ACTIVE_SYSTEMS 매트릭스 자동 검증** — 상태 추가/수정 시 tween/particles/sound 플래그 누락을 린터·테스트로 사전 탐지 (C51 CRITICAL 교훈)
2. **공용 엔진 모듈 분리 (`shared/engine.js`)** — TweenManager, ObjectPool, TransitionGuard, SeededRNG 등 51사이클 검증 인프라 단일 모듈 추출
3. **새 장르 도전** — 매치3 3연속(C44~51) 탈피. 축적된 엔진 인프라 활용하여 로그라이크 덱빌더 또는 실시간 전략 등 시도
