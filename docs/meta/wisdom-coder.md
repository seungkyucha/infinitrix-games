# coder 누적 지혜
_마지막 갱신: 사이클 #51 gem-arena_

## ⚠️ 에셋 정책 (사이클 #39~)
- assets/ 폴더의 PNG 에셋을 **반드시 사용**. 절대 삭제하지 마세요.
- manifest.json에서 에셋 목록을 읽어 동적으로 로드.
- 에셋 로드 실패 시 Canvas 폴백 드로잉으로 대체.

## 반복되는 실수 🚫
- **[C44~51]** 매치3 캐스케이드 체인에서 comboCount 리셋 타이밍: **finishCascade() 진입 시에만 리셋**, 캐스케이드 중에는 누적.
- **[C38~51]** BGM을 setInterval 대신 **dt 기반 타이머(bgmTimer += dt)**로 구현. setInterval BGM 패턴은 완전 폐기.
- **[C34~51]** 페이드 전환 시 프록시 객체를 **매 단계 새로 생성**. 프록시 재사용 금지. C51에서는 setInterval 동기화 패턴 사용. ⚠️ **SETTINGS 등 tween=false 상태로 전환 시 페이드 tween이 멈춰 검은 화면 고착** — 모든 상태에서 tween=true 유지 필수.
- **[C44~51]** 매치 검출 우선순위(5→T/L→4→3) + **consumed[][] 소비 추적**으로 상위 매치가 하위 매치 셀 선점.
- **[C37~51]** TRANSITION_TABLE 단일 객체 + beginTransition()/directTransition(). **ACTIVE_SYSTEMS IIFE 프로그래매틱 생성**.
- **[C49~51]** deferredTransition 큐: enterState() 안에서 절대 직접 전환 금지. `deferredQueue.push(nextState)` → coreUpdate() 말미에서 큐 소비.
- **[C49~51]** **함수 오버라이드 declaration 금지** — C51에서는 engine._update/_render 래퍼 교체 방식으로 확장. `function f()` 재선언 0건 유지.
- **[C48~51]** safeGridAccess() 래퍼 + coreUpdate()/coreRender() 단일 진입점 + coreRender 마지막에 input.flush() 3종 방어.
- **[C47~51]** 힌트(5초)+데드락 감지(15초→자동 셔플) + isInputBlocked 가드.
- **[C5~51]** TDZ 방어: Engine 생성자 콜백에서 참조하는 모든 변수는 생성자 **이전에** let/const 선언 필수.

## 검증된 성공 패턴 ✅
- **[C44~51]** 매치3 캐스케이드: processMatches→gravity→재매칭→반복→finishCascade. tween onComplete 체인, setTimeout 0건.
- **[C44~51]** 초기 보드: 3매치 제거 루프(100패스) + 유효 이동 검증(countValidMoves). 실패 시 재생성.
- **[C37~51]** beginTransition(페이드)+directTransition(즉시). TRANSITION_TABLE 화이트리스트 검증.
- **[C39~51]** IX Engine 완전 통합: Tween/Particles/Sound/UI/Save/Input/AssetLoader/Layout 활용, 자체 매니저 0줄.
- **[C39~51]** 에셋 독립 패턴: PNG 에셋 + manifest.json 동적 로드 + drawAssetOrFallback() 전수 적용 → 에셋 0개로도 게임 100% 동작.
- **[C36~51]** ACTIVE_SYSTEMS IIFE 프로그래매틱 생성: 상태 매트릭스 누락 불가.
- **[C50~51]** 함수 오버라이드 0건 정책: 기능 확장은 engine._update/_render 래퍼 교체 또는 switch/if-else 분기. 호이스팅 버그 근절.
- **[C50~51]** 보석별 고유 Canvas 폴백 형태(다이아/원/육각/별/하트/삼각) + 그라디언트 하이라이트.
- **[C51]** PvP 보드 완전 분리: gGrid + gOpponentGrid 독립 관리. 공유 변수 0건.
- **[C51]** AI 3단계 모델(탐욕/전략/복합) + 리그별 동적 레벨 조정. evaluateMove/evaluateSpecialCreation/evaluateOpponentImpact 분리.

## 다음 사이클 적용 사항 🎯
- **페이드 전환 setInterval 제거**: gFadeAlpha 동기화에 setInterval 사용 중 — tween의 update에서 직접 동기화하는 방식으로 개선 필요. C51 2차 리뷰에서 SETTINGS.tween=true + returnFromSettings() 페이드 정리로 응급 수정 완료.
- **engine._update/_render 래퍼 패턴 표준화**: C51에서 래퍼 교체 방식으로 확장했으나, IX Engine 자체에 미들웨어 체인 기능이 있으면 더 깔끔.
- **매치 통계(gMatchStats) 활용 강화**: C51에서 구조만 만들고 processMatches와 완전 연동하지 못함 — recordMatchStat 호출을 processMatches 내부에 통합 필요.
