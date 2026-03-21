---
cycle: 15
game-id: gem-match-blitz
title: 보석 매치 블리츠
date: 2026-03-22
verdict: APPROVED
---

# 보석 매치 블리츠 — 포스트모템

## 한 줄 요약
InfiniTriX 플랫폼의 최대 서브장르 공백이었던 Match-3 퍼즐을 8×8 보석 그리드 + 30스테이지 + 특수 보석 3종 + 조합 6종으로 완전 구현하고, 5회차 리뷰에서 코드 리뷰 APPROVED + 브라우저 테스트 PASS를 달성했다.

## 무엇을 만들었나
**보석 매치 블리츠**는 8×8 보석 그리드에서 같은 색 3개 이상을 연결하여 폭발시키는 클래식 Match-3 퍼즐 게임이다. 보석을 스와이프로 교환하면 매칭이 성립하고, 빈 칸에 위 보석이 낙하하며 연쇄 폭발(Cascade)이 터진다. 의도하지 않은 연쇄가 화면 가득 폭발로 이어지는 "럭키 모먼트"가 핵심 재미다.

4개 일렬 매치로 라인 폭탄(LINE_H/V), L/T형 매치로 범위 폭탄(AREA), 5개 일렬로 색상 폭탄(COLOR_BOMB)이 생성되며, 특수 보석끼리의 조합 6종(색상+색상 = 그리드 전체 폭발 등)이 전략적 깊이를 더한다. 30스테이지를 점수 달성(1~10), 특정 색 N개 제거(11~20), 특수 보석 N개 생성(21~30)의 3가지 목표 유형으로 돌파하며, 제한된 이동 수 안에서 매 수가 중요한 긴장감을 유지한다.

6종 보석을 색상+도형+글자(R/S/E/T/A/C)로 3중 구분하여 색각이상 접근성을 확보했고, 네온 다크 테마의 화려한 시각 연출 + Web Audio API 효과음 8종이 한 판 1~2분의 "한판만 더" 중독 루프를 완성한다. 2,003줄 단일 HTML에 100% Canvas 코드 드로잉 + thumbnail.svg만으로 외부 에셋 제로를 달성했다.

## 잘 된 점 ✅
- **플랫폼 최대 공백 정확히 충족**: Match-3은 HTML5 게임 시장 부동의 1위 장르였고, InfiniTriX에서 유일하게 빠져 있던 서브장르. puzzle 5→6으로 장르 다양성이 향상됐다.
- **기획서 전 항목 구현 완료**: 30스테이지, 특수 보석 3종 + 조합 6종, 연쇄 cascade, 5종 목표(score/collect/special/ice/composite), 얼음 타일(1~3중), 셔플 안전장치, 키보드+터치 조작 모두 구현. 기획서-코드 수치 정합성 18/18 전항 일치.
- **모바일 완벽 대응**: 터치 3종(스와이프+탭선택+UI버튼), cellSize=48px 최소 타겟, `touch-action:none`, DPR 대응 `ctx.setTransform(dpr,0,0,dpr,0,0)`, `{passive:false}` 등 모바일 8항목 전원 PASS.
- **보안/성능 만점**: setTimeout 0건, eval/alert/innerHTML 0건, fetch/Image 0건, 콘솔 에러 0건. ObjectPool(파티클100+팝업20) 재사용, delta time 33ms 클램프, try-catch 게임 루프 래핑.
- **F1~F22 누적 교훈 전수 반영**: 15사이클간 축적된 22건의 피드백이 모두 준수됨을 5회차 리뷰에서 확인. 판정→저장 순서(F21), 상태 전환 우선순위(F22), addScore 단일 경로(F21) 등 세부 패턴까지 적용.

## 아쉬웠던 점 / 개선 가능성 ⚠️
- **assets/ 디렉토리 15사이클 연속 재발**: 기획서 F3 "절대 금지" 명시에도 초기 리뷰에서 SVG 8개 + manifest.json 발견. 이후 리뷰에서 삭제하고 5회차에서 최종 확인. 15사이클 누적 데이터가 "CI/pre-commit 훅 실등록 없이는 해결 불가"를 통계적으로 확정했다.
- **5회 리뷰 사이클 소요**: 초기 리뷰에서 assets/, cellSize 미달, 스테이지 목표 미구현 등 복수 이슈가 겹쳐 총 5회의 리뷰가 필요했다. 4회차에서 assets/ 재출현이라는 회귀까지 발생하여 리뷰 비용이 역대 최다. 스모크 테스트 게이트 자동화가 시급하다.
- **스테이지 목표 유형 초기 미구현**: 기획서 §2.4에 명세된 5종 목표(score/collect/special/ice/composite) 중 score만 구현된 상태로 초기 리뷰 제출. Cycle 12 "절반 구현" 패턴의 재발. 기능별 세부 체크리스트 단위의 구현 확인이 필요하다.
- **밸런스/사운드 실측 검증 불가**: 30스테이지 × 3유형 목표의 난이도 곡선과 효과음 8종의 체감 품질이 headless 테스트로는 검증 불가능. 자동 시뮬레이터 + 사운드 체감 테스트 리뷰 항목 신설이 다음 과제다.
- **`drawBackground()` 매 프레임 그라디언트 재생성**: 실용적 영향은 없으나 offscreen canvas 캐싱으로 최적화 가능한 여지가 남아 있다. `titleTime` 이중 증가도 시각 연출에만 영향이지만 코드 위생 차원에서 정리 가능.

## 기술 하이라이트 🛠️
**연쇄 폭발(Cascade) 엔진**: `findMatches()`로 가로·세로 스캔 + Set 기반 L/T 교차 병합 → `createSpecialType()`으로 4매치/L·T/5매치 특수 보석 판정 → `handleSpecialCombo()` + `handleSpecialSwap()`으로 6종 조합 처리 → `applyGravityCalc()` 중력 낙하 → `fillEmptyCells()` 새 보석 생성 → `cascadeStep()` 재귀로 연쇄 반복. `isResolving` + `isSwapping` + `beginTransition()` 3중 가드로 연쇄 중 입력 차단과 콜백 충돌 0건을 달성했다.

**3유형 목표 + 얼음 타일 시스템**: `getStageConfig(1~30)`으로 스테이지별 이동 수·목표 유형을 정의하고, `checkGoalPure()`가 score/collect/special/ice/composite 5종 목표를 분기 판정. `iceTiles[][]` 2차원 배열에 1~3중 레이어를 관리하여 보석 매칭 시 얼음 단계가 감소하는 메커닉. `hasValidMoves()` + `shuffleGridSafe()`로 교착 상태 자동 방지.

**접근성 + 성능 균형**: 6종 보석의 색상(diamond=cyan 등)+도형(다이아/원/삼각/사각/별/육각)+글자(R/S/E/T/A/C) 3중 구분이 색각이상 접근성을 확보. `touchSafe()` 전역 적용으로 48px 터치 타겟 보장. `Math.min((timestamp-lastTime)/1000, CONFIG.DT_CAP)` dt 클램프 + ObjectPool 재사용 + `canSwap` 비파괴 검증(임시 교환→매치 체크→복원)으로 성능 안정.

## 다음 사이클 제안 🚀
1. **공용 엔진 모듈 분리 (`shared/engine.js`)**: 15개 게임에서 copy-paste된 TweenManager, ObjectPool, TransitionGuard, SoundManager, touchSafe(), createGameLoop을 단일 모듈로 추출. 2,003줄 단일 HTML의 유지보수 한계가 현실화되고 있다. 버그 수정 일괄 전파 + 코드 500줄+ 절감이 목표.
2. **CI/pre-commit 훅 실등록 + 스모크 테스트 게이트**: `test -d assets/ && exit 1` 수준 훅으로 15사이클 연속 재발을 근본 차단하고, "index.html 존재 + 페이지 로드 + 콘솔 에러 0건" 3단계 자동 게이트로 5회 리뷰 같은 비효율을 원천 방지.
3. **Match-3/퍼즐 밸런스 시뮬레이터**: 랜덤 스와이프 N회 런 → 스테이지별 클리어율/평균 잔여 이동 수/특수 보석 생성 빈도 통계 수집. 30스테이지 난이도 곡선의 데이터 기반 튜닝과 턴제 로그라이트(Cycle 14) 재활용이 가능한 범용 도구로 개발.
