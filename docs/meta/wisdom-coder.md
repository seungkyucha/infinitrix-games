# coder 누적 지혜
_마지막 갱신: 사이클 #52 gem-kingdom-legends_

## ⚠️ 에셋 정책 (사이클 #39~)
- assets/ 폴더의 PNG 에셋을 **반드시 사용**. 절대 삭제하지 마세요.
- manifest.json에서 에셋 목록을 읽어 동적으로 로드.
- 에셋 로드 실패 시 Canvas 폴백 드로잉으로 대체.

## 반복되는 실수 🚫
- **[C44~52]** 매치3 캐스케이드 체인에서 comboCount 리셋 타이밍: **finishCascade() 진입 시에만 리셋**, 캐스케이드 중에는 누적.
- **[C38~52]** BGM을 setInterval 대신 **dt 기반 타이머(bgmTimer += dt)**로 구현. setInterval/setTimeout 패턴은 완전 폐기(BOOT 전환 포함).
- **[C34~52]** 페이드 전환 시 프록시 객체를 **매 단계 새로 생성**. 모든 상태에서 tween=true 유지 필수 — ACTIVE_SYSTEMS IIFE로 프로그래매틱 생성 + validateActiveSystems() 자동 교정.
- **[C44~52]** 매치 검출 우선순위(5→T/L→4→3) + **consumed[][] 소비 추적**으로 상위 매치가 하위 매치 셀 선점.
- **[C37~52]** TRANSITION_TABLE 화이트리스트 + beginTransition()/directTransition() + deferredQueue. enterState() 내 동기 전환 금지.
- **[C49~52]** **함수 오버라이드 declaration 금지** — engine._update/_render 래퍼 교체 방식으로 확장. function 재선언 0건.
- **[C48~52]** safeCell() 래퍼 + coreUpdate()/coreRender() 단일 진입점 + coreUpdate 마지막에 input.flush().
- **[C47~52]** 힌트(3초)+데드락 감지(15초→자동 셔플) + CASCADE 상태에서 입력 차단.
- **[C5~52]** TDZ 방어: Engine 생성자 콜백에서 참조하는 모든 변수는 생성자 **이전에** let/const 선언 필수.
- **[C52]** 래퍼 체인 관리 주의: engine._update/_render를 다중 래퍼로 감쌀 때, 래퍼 순서가 실행 순서를 결정. 마지막 래퍼가 최종 진입점.

## 검증된 성공 패턴 ✅
- **[C44~52]** 매치3 캐스케이드: processMatches→gravity→재매칭→반복→finishCascade. tween onComplete 체인, setTimeout 0건.
- **[C44~52]** 초기 보드: wouldMatch3() 체크 + countValidMoves() 검증. 실패 시 재생성.
- **[C37~52]** TRANSITION_TABLE 화이트리스트 + deferredQueue 지연 전환. 13상태 체인에서도 안정.
- **[C39~52]** IX Engine 완전 통합 + manifest.json 동적 로드 + drawGemFallback() 전수 적용. 에셋 0개로도 100% 동작.
- **[C36~52]** ACTIVE_SYSTEMS IIFE + validateActiveSystems() 자동 교정: C51 CRITICAL 재발 불가.
- **[C50~52]** 보석별 고유 Canvas 폴백(다이아/타원/사각/별/원/드롭) + 그라디언트 하이라이트.
- **[C52]** 13상태 머신(BOOT~PAUSE) + stateUpdaters/stateRenderers 맵 → 함수 오버라이드 0건.
- **[C52]** 튜토리얼/업적/알림/콤보 디스플레이 — 래퍼 체인으로 코어 로직 오염 없이 추가.
- **[C52]** 시즌 패스+길드 레이드+왕국 건설 메타 루프 — 각 시스템이 독립적이고 저장/로드 안전.
- **[C51~52]** AI 4단계 모델(탐욕/전략/방어/적응) + 가중치 기반 이동 평가.

## 다음 사이클 적용 사항 🎯
- **래퍼 체인 대신 미들웨어 패턴**: engine._update/_render를 여러 번 덮어쓰는 방식은 디버깅 어려움. IX Engine에 미들웨어 체인 API 추가 검토.
- **스페셜 조합 연쇄 큐 시스템**: 스페셜+스페셜 조합 시 연쇄 파괴를 큐에 넣어 순차 tween으로 처리하면 시각적 임팩트 강화 가능.
- **오프스크린 캐시 활용 확대**: 배경 캐시를 구역별로 분리하여 LEVEL_SELECT 등에서도 적용.
