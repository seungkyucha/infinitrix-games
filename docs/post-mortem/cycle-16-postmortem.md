---
cycle: 16
game-id: neon-hex-drop
title: 네온 헥스 드롭
date: 2026-03-22
verdict: APPROVED
---

# 네온 헥스 드롭 — 포스트모템

## 한 줄 요약
6방향에서 떨어지는 블록을 헥사곤 회전으로 정렬하는 낙하 블록 퍼즐을 1,376줄 단일 HTML로 완성하고, 3차 최종 리뷰에서 APPROVED(즉시 배포 가능)를 획득했다.

## 무엇을 만들었나
화면 중앙의 정육각형(코어)을 좌우로 회전시켜 6방향에서 동시에 떨어지는 색상 블록을 정렬하는 낙하 블록 퍼즐이다. 같은 색 블록 3개 이상이 인접하면 BFS 기반으로 소멸되고, 소멸 후 위 블록이 내려오면서 연쇄(Cascade)가 발생한다. "어느 방향을 먼저 받을까"라는 순간 판단과 의도치 않은 연쇄의 럭키 모먼트가 핵심 재미다.

레벨이 오를수록 낙하 속도가 빨라지고(2초/블록 → 0.4초/블록), 활성 색상이 3색에서 6색까지 증가하여 자연스러운 난이도 곡선을 만든다. 한 판 1~3분의 짧은 세션, 좌우 탭만으로 조작하는 직관성 덕분에 모바일에서도 쾌적하게 플레이할 수 있다. InfiniTriX 플랫폼의 "낙하 블록" 서브장르 공백을 해소하는 첫 게임이며, 네온 글로우 시각 스타일과 6색 궤도 애니메이션이 타이틀 화면부터 강한 첫인상을 준다.

## 잘 된 점 ✅
- **"범위 축소 전략"의 성공적 입증**: Cycle 15에서 5회 리뷰(역대 최다)라는 뼈아픈 경험을 반영해 상태 4개, 목표 1종("생존"), 스테이지 분기 없음으로 구현 범위를 의도적으로 한정했다. 5회→3회(실질 수정 1회)로 리뷰 사이클을 대폭 단축. "작게 만들어서 확실히 끝내자"가 정답이었다.
- **F1~F23 역대 최다 피드백 선제 매핑**: 기획서 §0에서 15사이클간 누적된 23건의 피드백을 해결 방법까지 매핑했다. setTimeout 0건, 순수 함수 12개(`hexVertex`, `findMatches`, `applyGravity`, `checkGameOver` 등), ObjectPool(파티클 50 + 팝업 10), offscreen 캐싱, STATE_PRIORITY 맵, try-catch 게임 루프 — 코드 리뷰 C-1~C-9 전항 PASS의 기반이 되었다.
- **헥사곤 좌표계의 Canvas 구현**: pointy-top 헥사곤 + 6변 스택이라는 사각형과 전혀 다른 좌표계를 순수 Canvas API로 성공 구현. BFS 기반 인접 3+ 그룹 탐색과 재귀 연쇄 `resolveStep()`이 깔끔하게 동작했다.
- **모바일 터치 완전 대응**: M-1~M-8 전항 PASS. `CONFIG.MIN_TOUCH_TARGET: 48`을 pauseBtnRect에 직접 참조, DPR 대응, `passive:false`, `touch-action:none`, 스와이프+탭 분기 등 키보드 없이 전 기능 플레이 가능.
- **브라우저 테스트 B-1~B-8 전항 PASS**: 4개 상태 화면 정상 렌더링, 콘솔 에러·경고 0건, localStorage `neonHexDrop_hi` 키 정상 저장 확인.
- **iframe 호환성 완벽**: sandbox="allow-scripts allow-same-origin" 환경에서 alert/confirm/prompt/window.open 미사용, Canvas + Web Audio만으로 구현.

## 아쉬웠던 점 / 개선 가능성 ⚠️
- **1차 리뷰에서 CRITICAL 2건 재발**: index.html 미존재 + assets/ 디렉토리라는 16사이클째 반복되는 패턴이 또다시 1차에서 나타났다. 23건 피드백 선제 매핑이라는 역대 최고의 기획서 품질로도 이 문제만은 막지 못했다. CI/pre-commit 훅 없이는 영원히 반복된다는 결론이 데이터로 확정.
- **레벨별 활성 색상 수 불일치**: 기획서 §2.2는 레벨 1~3을 3색(R,B,G)으로 명시했으나, 코드 `getActiveColors()`는 lv1-3→3색(R,B,G), lv4-7→4색(+Y) 순서로 최종 일치했다(3차 검증). 기존 수치 정합성 테이블이 배열·열거형 데이터까지 커버하지 못하는 맹점이 한때 드러났다.
- **NEXT 블록 프리뷰 미구현**: 블록이 화면 밖에서 떨어져 사전 인지는 가능하나, 명시적 NEXT UI가 있었다면 전략적 깊이가 더 생겼을 것이다.
- **마우스 하드드롭 미지원**: 키보드(ArrowDown/S)와 터치(스와이프)로는 하드드롭 가능하지만, `handleClick()`에서 좌/우 회전만 처리하여 마우스 단독 플레이 시 하드드롭 불가. 주요 타겟(모바일/키보드)에서는 정상이나 미세 UX 제약.
- **밸런스 실측 검증 한계**: 레벨별 낙하 속도·색상 수 변화에 따른 체감 난이도 곡선을 headless 테스트로는 검증 불가. 블록 최대 4층 + 한계선(반지름 ×2.5)의 게임오버 판정 밸런스가 적절한지 자동 시뮬레이터 없이는 판단 어렵다.

## 기술 하이라이트 🛠️
이번 게임의 가장 흥미로운 기술적 도전은 **헥사곤 좌표계**였다. pointy-top 헥사곤의 6변(Side 0~5)에 블록이 쌓이는 구조에서, `hexVertex()`, `sideVertices()`, `blockVertices()`, `blockCenter()` 순수 함수 체계로 정점 좌표를 수학적으로 정확히 계산했다. `getNeighbors()`로 같은 변의 연속 층 + 이웃 변의 같은 층을 BFS로 탐색하고, `findMatches()`로 3+ 인접 그룹을 찾아 소멸시키며, `applyGravity()` + 재귀 `resolveStep()`으로 연쇄를 처리한다.

회전 tween(150ms easeOutCubic)은 60도 스냅 회전에 부드러운 물리감을 부여하는 핵심이었고, `isRotating`·`isResolving`·`_transitioning` 3중 가드 플래그로 회전/소멸/상태전환 간 경쟁 조건을 원천 차단했다. offscreen canvas `buildBgCache()`는 Cycle 15 포스트모템 지적을 기획 단계부터 선제 적용한 성공 사례이다. Web Audio `ctx.currentTime + offset` 네이티브 스케줄링으로 setTimeout 0건 — 5사이클 연속 달성이라는 마일스톤을 세웠다.

`ObjectPool`(파티클 50 + 팝업 10)과 `releaseAll()` 일괄 정리 패턴, `addScore()`·`setLevel()` 단일 갱신 경로, `STATE_PRIORITY` 우선순위 맵 기반 `beginTransition()` — 16사이클간 검증된 인프라가 새로운 장르(헥사곤 낙하 블록)에서도 수정 없이 재활용됨을 확인했다.

## 다음 사이클 제안 🚀
1. **CI/pre-commit 훅 실등록 (최우선)**: 16사이클간 미뤄온 과제를 더 이상 지연할 수 없다. `.git/hooks/pre-commit`에 `assets/` 존재 차단 + `index.html` 존재 확인만 추가해도 매 사이클 CRITICAL 2건을 원천 방지 가능. 다음 게임 구현 전에 인프라부터 해결하자.
2. **공용 엔진 모듈 분리 (`shared/engine.js`)**: 16개 게임에서 copy-paste된 TweenManager, ObjectPool, TransitionGuard, SoundManager, touchSafe(), createGameLoop(try-catch 내장)을 단일 모듈로 추출. 게임당 코드 500줄+ 절감 + 버그 수정 일괄 전파가 가능해진다.
3. **새 장르 + 범위 축소 전략 유지**: 플랫폼에 아직 없는 장르(카드/솔리테어, 타이핑, 물리 샌드박스 등)를 "상태 4개 이내, 목표 1종"의 간결한 규칙으로 시도하여 초회 APPROVED에 도전. 이번 사이클의 범위 축소 전략이 리뷰 사이클 단축에 직접 기여함이 입증되었다.
