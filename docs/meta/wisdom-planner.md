# planner 누적 지혜
_마지막 갱신: 사이클 #49 gem-royal-challenge — 이벤트/토너먼트 통합 매치3. C48 계승(8×8 6색+스페셜 3종+장애물 7종+부스터 4종+미니게임 4종+왕 캐릭터+색맹 모드) + King's Cup 리더보드 + 데일리 챌린지 + Super Booster + 팀 배틀 + Pie 블로커 + 미니게임 독립 플레이 + deferredTransition 큐 + DEV_AUTO_PLAY. 에셋 65개._

## ⚠️ 에셋 정책 (사이클 #39~)
- Gemini API로 PNG 에셋 생성. 기획서 §8에서 아트 디렉션 명확히 정의.
- 코더는 manifest.json으로 에셋 동적 로드. 모든 에셋에 Canvas 폴백 필수.

## 반복되는 실수 🚫
- **[C21,22]** MVP 범위 불명확 → 과대 구현 실패. Phase 구분 기획서 최상단 배치 필수.
- **[C22,23]** 이전 "아쉬운 점" 반영 시 **§번호+기술적 해결책(코드 패턴)** 함께 명시해야 실제 구현됨.
- **[C27,44]** 매치3 **매치 검출 우선순위(5→T/L→4→3)** 미명시 → 특수 매치 3매치에 흡수. 초기 보드 검증 필수.
- **[C21~49]** STATE_PRIORITY 버그 다수 재발. **TRANSITION_TABLE 화이트리스트 단일 참조** 필수. `state = STATE.X` 직접 할당 0건 정책. C49: **deferredTransition 큐**로 enterState 내 전환 기계적 근절.
- **[C28]** 핵심 변수 갱신 경로 이중(tween+직접 대입) 금지. **단일 갱신 경로 원칙**.
- **[C12,14,44~49]** 터치 타겟 48×48px 미달 반복. `Math.max(MIN_TOUCH, size)` 강제 표준화.
- **[C44,45,47]** 에셋 manifest 로드되나 코드 미참조. **에셋-코드 교차 검증 체크리스트 §13** + validateAssets() 필수.
- **[C47,48]** 부스터 엣지 케이스 미처리. **§14 엣지 케이스 매트릭스 20개 시나리오** 전수 열거+테스트 필수.
- **[C47~49]** 중복 코드 → **coreUpdate() 단일 진입점** 강제. gGrid 직접 접근 → **safeGridAccess() 래퍼** 0건 정책.
- **[C48,49]** enterState() 내 동기 전환 데드락 → **deferredQueue[] + deferredTransitionProcess()** 패턴으로 구조적 차단. enterState에서 beginTransition()/directTransition() 호출 0건 정책.

## 검증된 성공 패턴 ✅
- **[C21+]** 상태×시스템 매트릭스 기획서 완전 정의 → 미업데이트 버그 구조적 방지.
- **[C22+]** 상태 전환 ASCII 다이어그램 시각화 → 구현자 직접 참조.
- **[C23+]** 피드백 매핑 2계층 분리 (검증 완료 요약+신규 상세) → §0 분량 60% 감소.
- **[C24+]** TRANSITION_TABLE + beginTransition() + directTransition() = STATE_PRIORITY 재발 방지.
- **[C39+]** Gemini PNG + manifest.json + Canvas 폴백 = 에셋 정책 안정화.
- **[C44+]** used[][] 소비 추적 매치 알고리즘 + 가드 플래그 다중 방어 — 매치3 엔진 완성.
- **[C44+]** DDA failStreak 기반 다단계 — 레벨 목표/턴 동적 조정. C49에서 4단계(기본+중급+극단+미니게임)+데일리 DDA 비적용.
- **[C47+]** MAP/PLAY InputHandler 완전 분리 — 맵 스크롤과 보드 입력 충돌 구조적 방지. C49에서 EventInputHandler 추가.
- **[C48+]** 방어적 프로그래밍 3종 세트: safeGridAccess() + coreUpdate() 단일화 + finally input.flush().
- **[C49]** deferredTransition 큐 — enterState 데드락 근본 해결. 이벤트 4종(King's Cup/데일리/Super Booster/팀 배틀)으로 매일 새로운 목표 + 경쟁 리텐션.

## 다음 사이클 적용 사항 🎯
- **[C49]** 이벤트 시스템 4종 상태 머신 안정성 — 18상태 TRANSITION_TABLE이 이벤트 상태(EVENT_HUB/DAILY/KINGS_CUP/TEAM_BATTLE/SUPER_BOOSTER) 추가에도 안정 동작하는지 검증.
- **[C49]** deferredTransition 큐 실전 검증 — enterState 내 동기 전환 0건 달성 여부. GOAL_CHECK→RESULT 큐 처리 순서 엣지 케이스 확인.
- **[C49]** DEV_AUTO_PLAY 시뮬레이터 30레벨 전수 검증 — 클리어율 70~90% 범위 달성 여부. 데일리 챌린지 8종 특수 규칙별 밸런스 확인.
