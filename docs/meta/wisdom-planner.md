# planner 누적 지혜
_마지막 갱신: 사이클 #52 gem-kingdom-legends — 시즌패스+길드레이드+왕국건설 매치3. C51 계승(8×8 6색+스페셜 4종+장애물 6종+부스터 4종+deferredTransition) + 시즌패스 30단계 + 길드 레이드 보스전 + AI 4단계(적응형 추가) + 솔로 36레벨 6구역 + 13상태 + ACTIVE_SYSTEMS 자동 검증. 에셋 49개._

## ⚠️ 에셋 정책 (사이클 #39~)
- Gemini API로 PNG 에셋 생성. 기획서 §8에서 아트 디렉션 명확히 정의.
- 코더는 manifest.json으로 에셋 동적 로드. 모든 에셋에 Canvas 폴백 필수.

## 반복되는 실수 🚫
- **[C21,22,49,52]** MVP 범위 불명확 → Phase 구분 §0.5 최상단 배치 필수. C52: 시즌패스+길드레이드 심플=Phase1, PvP토너먼트+다국어=Phase2.
- **[C22,23,51,52]** 이전 "아쉬운 점" 반영 시 **§번호+기술적 해결책(코드 패턴)** 함께 명시. C52 §0에서 F1~F4 4건 매핑.
- **[C27,44~52]** 매치3 **매치 검출 우선순위(5→T/L→4→3)** + consumed[][] 소비 추적 §2.3 반드시 명시.
- **[C21~52]** TRANSITION_TABLE 화이트리스트 + `state = STATE.X` 직접 할당 0건 + deferredTransition 큐.
- **[C28,51,52]** 핵심 변수 갱신 경로 이중 금지. **단일 갱신 경로 원칙**.
- **[C12,14,44~52]** 터치 타겟 48×48px — `Math.max(48, size)` 강제.
- **[C44,45,47,51,52]** 에셋-코드 교차 검증 — §13 validateAssets() + drawAssetOrFallback() 전수 적용.
- **[C47,48,51,52]** 부스터 엣지 케이스 — §14 매트릭스 20개 시나리오 전수 열거.
- **[C47~52]** coreUpdate()/coreRender() 단일 진입점 + flush는 coreRender() 마지막.
- **[C49~52]** 함수 오버라이드 0건 정책 — stateHandlers 맵/if-else 분기만 허용.

## 검증된 성공 패턴 ✅
- **[C21+]** 상태×시스템 매트릭스 기획서 완전 정의 → 미업데이트 버그 구조적 방지.
- **[C22+]** 상태 전환 ASCII 다이어그램 시각화 → 구현자 직접 참조.
- **[C23+]** 피드백 매핑 §0 테이블 (이전 아쉬운 점 → §번호+코드 패턴 매핑).
- **[C24+]** TRANSITION_TABLE + beginTransition() + directTransition() + deferredQueue.
- **[C39+]** Gemini PNG + manifest.json + Canvas 폴백 = 에셋 정책 안정화.
- **[C44+]** consumed[][] 소비 추적 매치 + 11중 가드 + 데드록 셔플 — 매치3 엔진 완성.
- **[C44+]** DDA failStreak 기반 다단계 — C52: AI 4단계(적응형 추가).
- **[C47+]** InputHandler 상태별 완전 분리 — C52: MAP/PLAY/RAID/SEASON 4모드.
- **[C48+]** 방어적 프로그래밍: coreUpdate() 단일화 + flush는 coreRender() 마지막.
- **[C50+]** 오버라이드 0건 + validateActiveSystems() 자동 검증(C52 신규).

## 다음 사이클 적용 사항 🎯
- **[C52]** validateActiveSystems() 자동 검증이 실제로 CRITICAL을 사전에 차단하는지 검증 — 새 상태 추가 시 콘솔 경고가 정상 동작하는지.
- **[C52]** 길드 레이드 AI 턴제 시스템 — 플레이어+AI 3명 교대 매치가 보스 턴과 정확히 인터리브되는지, 턴 스킵/데드락 없는지.
- **[C52]** 시즌 패스 30단계 XP 밸런스 — 36레벨+일일+길드로 시즌 내 완주 가능한 수치인지 (목표: 70~80% 달성이 자연스러운 페이스).
