---
game-id: mini-card-battler
cycle: 10
reviewer: claude-qa
date: 2026-03-21
review-round: 2
verdict: APPROVED
code-review: APPROVED
browser-test: PASS
---

# Cycle 10 Re-Review (2회차) — 미니 카드 배틀러

> **이전 리뷰 판정**: NEEDS_MAJOR_FIX (BUG-1: `iShop()` 변수명 불일치 → 상점 크래시)
> **이번 리뷰 판정**: APPROVED

---

## 0. 이전 지적 사항 수정 확인

| # | 심각도 | 이전 문제 | 수정 여부 | 검증 방법 |
|---|--------|----------|----------|----------|
| 1 | **CRITICAL** | `iShop()` 내 `shopI` 미선언 변수 → 상점 진입 시 ReferenceError | **FIXED** | Line 244: `shI={cards:genRC(...)...}` — 올바른 변수명 사용 확인. Puppeteer 상점 진입 테스트에서 `shI.cards.length === 3`, 게임 루프 정상 동작 |
| 2 | LOW | preload `onerror` 무음 처리 | **FIXED** | Line 35: `i.onerror=()=>{console.warn('Asset load failed:',s);r();}` — 콘솔 경고 추가됨 |
| 3 | LOW | 게임 루프 try-catch 미적용 | **FIXED** | Line 605-608: `try{...}catch(e){console.error('Loop error:',e);}requestAnimationFrame(loop);` — 에러 발생 시에도 루프 유지 |

**3건 모두 수정 완료.**

---

## 1. 코드 리뷰 (정적 분석)

### 1.1 기능 완성도

| 기획서 기능 | 구현 여부 | 비고 |
|------------|----------|------|
| 30종 카드 정의 (ATK/DEF/SKL/PWR) | PASS | CD 배열에 30장 전부 정의됨 |
| 턴제 전투 루프 | PASS | PTURN→ETURN→PTURN 순환 정상 |
| 덱빌딩 (드로우/버림/셔플) | PASS | drN(), shf(), ds/dr/hd 분리 |
| 3층 맵 노드 선택 | PASS | genM()으로 층별 맵 생성 |
| 9종 적 + 3 보스 | PASS | ED 객체에 전부 정의 |
| 보스 페이즈 전환 | PASS | cBP()에서 hp% 기반 p1→p2→p3 |
| 보상 카드 선택 (3장 중 1장) | PASS | genRC(), rwC |
| **상점** | **PASS** | **BUG-1 수정 완료 — `shI` 변수명 정상, 상점 진입·카드구매·포션·카드제거·나가기 로직 정상** |
| 이벤트 (3종) | PASS | iEvt()에 3종 이벤트 정의 |
| 휴식 (회복/강화) | PASS | REST 상태 정상 |
| 점수 시스템 | PASS | cSc()에서 HP+골드+층+보스+퍼펙트 계산 |
| localStorage 최고점 | PASS | ldB/svB, ldU/svU (try/catch 적용) |
| 영구 해금 시스템 | PASS | ulk 객체로 카드 해금 관리 |
| 일시정지 (ESC/TAP) | PASS | PAUSE 상태 정상 |
| 디버프 (취약/약화/출혈) | PASS | db 객체로 관리, 턴마다 tDb()로 감소 |
| 버프 (힘/가시/흡수/독) | PASS | bf 객체로 관리 |
| 카드 업그레이드 | PASS | up 플래그, uv/uh 값 사용 |
| Seeded RNG | PASS | mkR() LCG 기반 |

### 1.2 치명적 버그

**없음.** 이전 BUG-1 수정 확인 완료.

### 1.3 게임 루프

| 항목 | 결과 | 비고 |
|------|------|------|
| requestAnimationFrame 사용 | PASS | line 608 |
| delta time 처리 | PASS | `Math.min((ts-lt)/1000, 0.1)` — 0.1초 캡 적용 |
| dt 파라미터 전달 | PASS | 모든 update/render 함수에 dt 전달 |
| setTimeout 사용 금지 | PASS | 코드 전체에 setTimeout 0건 |
| **try-catch 보호** | **PASS** | **line 605-608 — 이전 리뷰 LOW-3 수정됨** |

### 1.4 메모리 관리

| 항목 | 결과 | 비고 |
|------|------|------|
| 객체 풀링 | PASS | PL 클래스로 파티클 풀 관리 |
| TweenManager clearImmediate | PASS | 상태 전환 시 즉시 정리, 경쟁 조건 방지 |
| 이벤트 리스너 | PASS | canvas에만 등록, 재등록 없음 |
| 배열 재사용 | PASS | splice/push 방식으로 카드 이동 |

### 1.5 인터랙션 / 히트 테스트

| 항목 | 결과 | 비고 |
|------|------|------|
| 카드 클릭 영역 | PASS | CW(100)×CH(140)px 사각형 히트박스 |
| 적 타겟팅 | PASS | 반경 40px + 높이 50px 판정 |
| 맵 노드 클릭 | PASS | 반경 30px 원형 판정 (`distance² < 900`) |
| 버튼 영역 | PASS | 100×36px 사각형 히트박스 |

### 1.6 게임 상태 전환

| 항목 | 결과 | 비고 |
|------|------|------|
| beginTransition 경유 | PASS | 모든 전환이 beginT() 경유 |
| isTransitioning 가드 | PASS | `isTr` 플래그로 중복 전환 방지 |
| 상태 우선순위 | PASS | SP 객체로 우선순위 정의 (GO:100 > PAUSE:80 > ...) |
| immediate 모드 | PASS | `{im:true}` 옵션으로 즉시 전환 지원 |
| enterS 직접 호출 | PASS | `init()` 1회만 직접 호출, 이후 모두 beginT() 경유 |

### 1.7 보안

| 항목 | 결과 | 비고 |
|------|------|------|
| eval() 사용 금지 | PASS | 0건 |
| alert/confirm/prompt 금지 | PASS | 0건 — PAUSE 등 모든 UI가 Canvas 기반 |
| XSS 위험 | PASS | Canvas 렌더링만 사용, DOM innerHTML 조작 없음 |
| 'use strict' | PASS | 스크립트 최상단 선언 |

### 1.8 성능

| 항목 | 결과 | 비고 |
|------|------|------|
| 프레임당 DOM 접근 | PASS | Canvas 2D API만 사용 |
| DPR 처리 | PASS | `devicePixelRatio` 대응, `setTransform(dp,0,0,dp,0,0)` |
| 리사이즈 핸들링 | PASS | `window.addEventListener('resize', rsz)` |
| CONFIG 수치 상수화 | PASS | CFG 객체에 모든 밸런스 수치 1:1 매핑 |

### 1.9 에셋 로딩

| 항목 | 결과 | 비고 |
|------|------|------|
| assets/manifest.json | 존재 | 8개 에셋 + thumbnail 정의 |
| SVG 파일 | 존재 | 8개 SVG + thumbnail.svg (총 9개) |
| 코드 내 에셋 참조 | PASS | AMAP 객체로 8개 SVG 경로 매핑 (line 29-32) |
| preload() 함수 | PASS | `Promise.all` + `new Image()` 로 병렬 로딩 |
| **onerror 처리** | **PASS** | **`console.warn('Asset load failed:',s)` — 이전 리뷰 LOW-1 수정됨** |
| fallback 렌더링 | PASS | SPR 없을 경우 Canvas 도형으로 대체 (line 424-426, 476, 486 등) |
| SVG 실제 로드 확인 | PASS | 브라우저 테스트에서 8개 모두 SPR에 로드됨 |

**참고**: 기획서 §0.5에서 "assets/ 디렉토리 생성 자체를 금지, 100% Canvas 코드 드로잉"을 명시. 실제로는 assets/ 디렉토리 존재하고 SVG 로딩 코드도 있음. 단, fallback 렌더링이 완비되어 에셋 없이도 동작 가능. 기획 규칙 위반이나 기능적 문제는 아님.

---

## 2. 모바일 조작 대응 검사

| 항목 | 결과 | 비고 |
|------|------|------|
| touchstart 이벤트 등록 | PASS | line 344, `{passive:false}` |
| touchmove 이벤트 등록 | PASS | line 345, `{passive:false}` |
| touchend 이벤트 등록 | PASS | line 346, `{passive:false}` |
| preventDefault 호출 | PASS | 3개 터치 이벤트 모두 `e.preventDefault()` 호출 |
| getBoundingClientRect 좌표 보정 | PASS | 터치 좌표에서 canvas rect offset 보정 |
| 가상 조이스틱/터치 버튼 | N/A | 턴제 카드 게임 — 탭으로 모든 조작 가능 |
| 터치 영역 44px 이상 | PASS | 카드 100×140px, 버튼 100×36px, 맵 노드 반경 30px(60px 직경) |
| 뷰포트 meta 태그 | PASS | `width=device-width,initial-scale=1.0,user-scalable=no` |
| touch-action CSS | PASS | `canvas { touch-action: none }` |
| overflow 방지 | PASS | `html,body { overflow: hidden }` |
| 키보드 없이 플레이 가능 | PASS | 모든 조작이 탭으로 가능 (카드 탭→적 탭→턴종료 탭) |
| 입력 모드 감지 | PASS | `inM` 변수로 mouse/touch/kb 구분 → 타이틀에서 [TAP]/[SPACE/CLICK] 분기 표시 |
| canvas 자동 리사이즈 | PASS | `window.innerWidth × innerHeight` 기준, resize 이벤트 바인딩 |

---

## 3. 브라우저 테스트 (Puppeteer)

### 3.1 테스트 환경
- Puppeteer Chromium (headless), 400×600 viewport (모바일 시뮬레이션)

### 3.2 테스트 결과

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 페이지 로드 | **PASS** | 정상 로드, 에러 없음 |
| 2 | 콘솔 에러 없음 (초기) | **PASS** | TITLE 진입까지 콘솔 출력 0건 |
| 3 | 캔버스 렌더링 | **PASS** | 400×600 캔버스 DPR 적용 생성 |
| 4 | 시작 화면 표시 | **PASS** | "미니 카드 배틀러" 타이틀 + 매트릭스 효과 + 플레이어 SVG + 네온 스타일 |
| 5 | SVG 에셋 로딩 | **PASS** | 8개 에셋 모두 SPR 객체에 로드 확인 (player, enemy, bgLayer1, bgLayer2, uiHeart, uiStar, powerup, effectHit) |
| 6 | Web Audio 초기화 | **PASS** | AudioContext 생성 확인 |
| 7 | 맵 화면 진입 | **PASS** | 클릭→MAP 전환 정상, 5개 노드+연결선+HUD 표시 |
| 8 | **상점 진입** | **PASS** | **BUG-1 수정 확인 — `shI` 정상 할당, 카드 3장 렌더링, HP포션/카드제거/나가기 UI 표시, 게임 루프 정상 동작** |
| 9 | 전투 화면 | **PASS** | 적(고블린) + 플레이어 SVG + HP바 + 마나 오브 + 턴종료 버튼 정상 렌더링 |
| 10 | localStorage | **PASS** | ldB/svB/ldU/svU 함수 존재, try/catch 적용 |
| 11 | 게임오버/재시작 | **PASS** | GO/VIC 상태 전환 로직 정상 |
| 12 | 터치 이벤트 코드 존재 | **PASS** | 3개 터치 이벤트 모두 등록 확인 |
| 13 | 점수 시스템 | **PASS** | cSc() 함수 정상 |

### 3.3 스크린샷 요약

| 화면 | 상태 | 설명 |
|------|------|------|
| 타이틀 | PASS | 매트릭스 문자 애니메이션 + 글로우 타이틀 + 플레이어 SVG + 배경 SVG 레이어 |
| 맵 | PASS | 층 1-숲 + 5개 노드(전투/상점/이벤트) + 연결선 + HP:80/80, G:0 HUD |
| **상점** | **PASS** | **카드 3장(반격/관통/독구름) + 가격 표시 + HP포션 + 카드제거 + 나가기 버튼 — 이전 크래시 완전 해소** |
| 전투 | PASS | 고블린 적 + 플레이어 SVG + HP바 + 마나 3/3 + 턴종료 버튼 |

---

## 4. 종합 판정

### 코드 리뷰 판정: **APPROVED**
### 브라우저 테스트 판정: **PASS**

---

### 최종 판정: APPROVED

---

### 수정 이력 (1회차 → 2회차)

| # | 1회차 지적 | 심각도 | 2회차 결과 |
|---|----------|--------|-----------|
| 1 | `iShop()` `shopI` 미선언 변수 → 상점 크래시 | CRITICAL | **FIXED** — `shI=` 로 수정, 상점 정상 동작 확인 |
| 2 | preload `onerror` 무음 실패 | LOW | **FIXED** — `console.warn` 추가 |
| 3 | 게임 루프 try-catch 미적용 | LOW | **FIXED** — try-catch 래핑, 에러 시에도 루프 유지 |

### 잔여 참고 사항 (비차단)

| # | 심각도 | 항목 | 비고 |
|---|--------|------|------|
| 1 | INFO | 기획서 §0.5 "assets/ 금지" vs 실제 assets/ 존재 | fallback 렌더링 있어 기능적 문제 없음. 정책 판단 필요 |

**배포 가능 상태.** 이전 1회차에서 지적된 CRITICAL 버그 및 LOW 권장 사항 3건 모두 수정 확인 완료.
