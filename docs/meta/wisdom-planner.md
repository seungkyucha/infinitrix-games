# planner 누적 지혜
_마지막 갱신: 사이클 #51 gem-arena — PvP 턴 기반 매치3+왕국건설 메타. C50 계승(8×8 6색+스페셜 4종+장애물 6종+부스터 4종+12상태+deferredTransition) + PvP 분할화면(교대 턴+장애물 전송+AI 3단계) + 리그 5단계(브론즈~다이아몬드) + 솔로 30레벨 5구역. 에셋 51개._

## ⚠️ 에셋 정책 (사이클 #39~)
- Gemini API로 PNG 에셋 생성. 기획서 §8에서 아트 디렉션 명확히 정의.
- 코더는 manifest.json으로 에셋 동적 로드. 모든 에셋에 Canvas 폴백 필수.

## 반복되는 실수 🚫
- **[C21,22,49]** MVP 범위 불명확 → Phase 구분 기획서 §0.5 최상단 배치 필수. C51: 이벤트 1종(일일 챌린지)만 Phase1, 주간 토너먼트는 Phase2.
- **[C22,23,51]** 이전 "아쉬운 점" 반영 시 **§번호+기술적 해결책(코드 패턴)** 함께 명시해야 실제 구현됨. C51 §0에서 4건 매핑.
- **[C27,44~51]** 매치3 **매치 검출 우선순위(5→T/L→4→3)** + consumed[][] 소비 추적 미명시 → 특수 매치 3매치에 흡수. §2.3에 반드시 명시.
- **[C21~51]** TRANSITION_TABLE 화이트리스트 + `state = STATE.X` 직접 할당 0건 + deferredTransition 큐. C51: 12상태 유지.
- **[C28,51]** 핵심 변수 갱신 경로 이중 금지. **단일 갱신 경로 원칙**. C51: PvP 보드 2개 완전 독립.
- **[C12,14,44~51]** 터치 타겟 48×48px — `Math.max(MIN_TOUCH, size)` 강제.
- **[C44,45,47,51]** 에셋-코드 교차 검증 — §13 validateAssets() + drawAssetOrFallback() 전수 적용.
- **[C47,48,51]** 부스터/PvP 엣지 케이스 — §14 매트릭스 20개 시나리오 전수 열거.
- **[C47~51]** coreUpdate()/coreRender() 단일 진입점 + safeGridAccess() 래퍼 0건 정책.
- **[C49~51]** 함수 오버라이드 0건 정책 — stateHandlers 맵/if-else 분기만 허용.

## 검증된 성공 패턴 ✅
- **[C21+]** 상태×시스템 매트릭스 기획서 완전 정의 → 미업데이트 버그 구조적 방지.
- **[C22+]** 상태 전환 ASCII 다이어그램 시각화 → 구현자 직접 참조.
- **[C23+]** 피드백 매핑 §0 테이블 (이전 아쉬운 점 → §번호+코드 패턴 매핑).
- **[C24+]** TRANSITION_TABLE + beginTransition() + directTransition() + deferredQueue.
- **[C39+]** Gemini PNG + manifest.json + Canvas 폴백 = 에셋 정책 안정화.
- **[C44+]** consumed[][] 소비 추적 매치 + 11중 가드 + 데드록 셔플 — 매치3 엔진 완성.
- **[C44+]** DDA failStreak 기반 다단계 — C51: PvP는 리그 기반 AI 레벨로 대체.
- **[C47+]** InputHandler 상태별 완전 분리 — C51: MAP/PLAY/PVP 3모드 분리.
- **[C48+]** 방어적 프로그래밍: safeGridAccess() + coreUpdate() 단일화 + flush는 coreRender() 마지막.
- **[C50+]** 오버라이드 0건 + 12상태 축소 + gFadeProxy 제거(tween 직접 조작).

## 다음 사이클 적용 사항 🎯
- **[C51]** PvP 보드 2개 독립 관리 검증 — gPlayerBoard/gOpponentBoard 크로스 오염 없이 캐스케이드+장애물 전송이 안정 동작하는지.
- **[C51]** AI 3단계 행동 모델(탐욕/전략/복합) — 리그별 난이도 체감이 적절한지, 다이아몬드 AI가 너무 강하거나 약하지 않은지 밸런스 검증.
- **[C51]** 이벤트 1종 제한 정책 — Phase1에 일일 챌린지만 포함, 주간 토너먼트는 Phase2로 엄격 분리가 범위 초과를 방지했는지 확인.
