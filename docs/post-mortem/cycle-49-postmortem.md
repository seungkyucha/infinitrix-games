---
cycle: 49
game-id: gem-royal-challenge
title: 젬 로얄 챌린지
date: 2026-03-28
verdict: NEEDS_MAJOR_FIX
---

# 젬 로얄 챌린지 — 포스트모템

## 한 줄 요약
Royal Match급 라이브 이벤트 시스템을 갖춘 매치3를 완성했지만, JavaScript 호이스팅 함정에 빠져 게임이 검은 화면으로만 출력된다.

## 무엇을 만들었나
8×8 그리드 6색 보석 매치3에 **라이브 이벤트 시스템 4종**(King's Cup 리더보드, 데일리 챌린지, Super Booster 연승 보상, 팀 배틀)을 통합한 경쟁형 퍼즐 게임이다. C48 젬 나이트메어의 핵심 엔진을 계승하면서 레벨을 30개로 확장하고, 신규 Pie 블로커(인접 6회 매칭 필요)를 추가해 장애물이 8종으로 늘었다.

미니게임 4종을 독립 플레이 모드로 분리하고, SeededRNG 기반 데일리 챌린지로 매일 다른 특수 규칙 레벨을 자동 생성하며, AI 5명과 경쟁하는 King's Cup까지 — 단순 레벨 클리어를 넘어 매일 새로운 목표를 제공하는 구조를 설계했다. 또한 48사이클째 숙원이었던 `deferredTransition` 큐를 도입해 enterState() 내 동기 전환 문제를 기계적으로 차단하고, DEV_AUTO_PLAY 시뮬레이터로 밸런스 자동 검증의 첫 발을 뗐다.

## 잘 된 점 ✅
- **기획 완성도 100%**: 스펙 대비 16개 주요 항목(8종 장애물, 4종 이벤트, 4종 미니게임, 30레벨, DDA, 색맹 모드, 다국어 등) 전부 구현 확인
- **deferredTransition 큐 도입 성공**: 48사이클째 반복되던 enterState() 내 동기 전환 문제를 `deferredQueue` + coreUpdate 말미 소비 패턴으로 근본 해결
- **정적 분석 7개 항목 전부 PASS**: preventDefault, rAF+delta time, 터치 이벤트(48px 강제), 상태 전환 화이트리스트(18상태), localStorage, Canvas resize, 외부 CDN 0건
- **방어적 설계 우수**: GUARDS 11중 방어 + isInputBlocked() 단일 게이트, safeGridAccess() 래퍼, SeededRNG(Math.random() 0건), drawAssetOrFallback 72개 에셋 폴백
- **이벤트 시스템 설계**: King's Cup AI 5명 생성, 시드 기반 데일리 챌린지, Super Booster 연승 보상, 팀 배틀 4팀 시뮬레이션까지 독립적으로 동작하는 구조

## 아쉬웠던 점 / 개선 가능성 ⚠️
- **치명적 호이스팅 버그**: 기존 함수를 확장할 때 `function` 선언(declaration)을 사용해 호이스팅으로 `_orig` 변수가 래퍼 자체를 캡처 → 9개 함수에서 무한 재귀 발생. 게임이 완전한 검은 화면. **해결은 단순**(9곳에서 `function f()` → `f = function()` 변경)하지만, 런타임 테스트 없이는 발견 불가능한 유형
- **함수 오버라이드 패턴 비일관성**: 일부는 올바른 대입문(assignment), 일부는 잘못된 선언문(declaration) — 동일 코드베이스 내 패턴 불통일이 근본 원인
- **renderMap 이중 오버라이드**: §54와 §98에서 두 번 오버라이드하여 체인은 작동하나 가독성 저하
- **실행 검증 프로세스 부재**: 코드 규모(4700줄+)가 커졌지만 코딩 단계에서 런타임 검증 없이 제출됨. 최소한 타이틀 화면 렌더링까지는 자가 검증 필요

## 기술 하이라이트 🛠️
- **18상태 TRANSITION_TABLE + deferredQueue**: enterState() 내에서 전환 요청 시 큐에 push하고 coreUpdate() 루프 말미에서 소비. `console.error()`로 직접 호출 시도를 경고 — 기계적 강제 장치
- **SeededRNG 기반 데일리 챌린지**: 날짜를 시드로 사용해 전 세계 플레이어가 동일한 레벨을 플레이하는 구조. Math.random() 완전 배제
- **DEV_AUTO_PLAY 시뮬레이터**: F4 토글로 BFS 기반 최적 이동 자동 선택 → 레벨당 100회 시뮬레이션 → 클리어율/평균 턴 소모/장애물 파괴율 콘솔 로깅. 밸런스 정량 검증의 첫 단계
- **drawAssetOrFallback 72개 에셋 폴백**: Gemini PNG 에셋 로드 실패 시에도 Canvas 폴백으로 100% 동작 보장
- **Pie 블로커 6조각 관리**: `gPieData` 구조체로 인접 매칭 6회 추적 — 기존 장애물과 독립적인 상태 관리

## 다음 사이클 제안 🚀
1. **함수 오버라이드 린터 규칙 도입**: `function` 선언으로 기존 함수명을 재선언하는 패턴을 정적 분석 단계에서 차단. ESLint 커스텀 룰 또는 코딩 가이드라인 체크리스트에 "오버라이드 시 대입문만 사용" 항목 추가
2. **최소 런타임 검증 자동화**: Puppeteer로 타이틀 화면 렌더링 + 첫 프레임 스택 트레이스 확인하는 스모크 테스트를 코딩 단계에 포함. 4700줄 규모에서 눈으로 잡기 불가능한 버그 사전 차단
3. **공용 엔진 모듈 분리 재착수**: 49사이클째 지연 중. TweenManager, ObjectPool, TransitionGuard 등을 `shared/engine.js`로 추출하면 함수 오버라이드 패턴 자체가 불필요해질 수 있음
