---
game-id: mini-idle-farm
cycle: 13
review-round: 1
reviewer: claude-qa
date: 2026-03-21
verdict: NEEDS_MINOR_FIX
code-review: NEEDS_MINOR_FIX
browser-test: PASS
---

# Cycle 13 Review — 미니 아이들 팜 (mini-idle-farm)

> **참고**: 기획서(cycle-13-spec.md)의 game-id가 `mini-idle-farm`으로 변경됨. 이전 리뷰는 `hangul-word-quest` 대상이었으므로, 본 리뷰는 `mini-idle-farm`의 **최초 리뷰**입니다.

---

## 1. 코드 리뷰 (정적 분석)

### 1.1 체크리스트

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 기능 완성도 | ✅ PASS | 3단계 농장(밭→목장→가공), 10종 자원, 업그레이드(속도/수확량/자동화/특수), 프레스티지(6종 영구 업그레이드), 오프라인 수입, 마일스톤 5단계, 통계. 기획서 §1~§2 전체 기능 반영 |
| 2 | 게임 루프 | ✅ PASS | `requestAnimationFrame` 사용, `dt = Math.min((timestamp - lastTime) / 1000, 0.1)` delta time + 100ms 클램핑 (line 1586) |
| 3 | 메모리 관리 | ✅ PASS | 이벤트 리스너 전역 1회 등록 (line 1551-1557), ObjectPool 파티클/팝업 재사용, 배경 캐시 offscreen canvas |
| 4 | 충돌/판정 로직 | ✅ PASS | 히트존 기반 역순 탐색 (line 1472). 수확 판정은 timer >= growTime 비교 (line 741) |
| 5 | 모바일 터치 | ✅ PASS | touchstart/touchmove/touchend + {passive:false} (line 1554-1556). 스와이프 탭 전환 + 롱프레스 연속구매 구현 |
| 6 | 게임 상태 전환 | ✅ PASS | 5상태(LOADING→TITLE→PLAYING→PAUSED→PRESTIGE_CONFIRM) TransitionGuard + 우선순위 기반 이중 호출 차단 (line 268-296) |
| 7 | 점수/최고점 | ✅ PASS | `localStorage` 기반 세이브 — 골드, 총수입, 프레스티지 별, 통계. 30초 자동저장 + 이벤트 시점 저장 (line 1600-1603) |
| 8 | 보안 | ✅ PASS | `eval()` 0건, `alert()/confirm()/prompt()` 0건, XSS 위험 없음 |
| 9 | 성능 | ✅ PASS | 배경 offscreen canvas 캐시 (line 506-544), 매 프레임 DOM 접근 없음, localStorage I/O는 저장 시점만 |
| 10 | assets/ 미사용 | ✅ PASS | assets/ 디렉토리 없음. 이미지/SVG/폰트 외부 파일 0건. 100% Canvas + 시스템 폰트 + Web Audio |
| 11 | try-catch 래핑 | ✅ PASS | 게임 루프 전체 `try{...}catch(e){console.error(e);}requestAnimationFrame(gameLoop)` (line 1585-1669) |
| 12 | TweenManager | ✅ PASS | `clearImmediate()` API 구현 (line 178), Cycle 4 교훈 준수 |
| 13 | dt 파라미터 전달 | ✅ PASS | `tw.update(dt)`, `updateProduction(dt, sd)`, `updateParticles(dt)` 모두 dt 기반 (line 1591-1597) |
| 14 | 순수 함수 원칙 | ✅ PASS | `calcGrowTime()`, `calcYield()`, `calcSellPrice()`, `calcPrestigeStars()`, `calcOfflineEarnings()` — 모두 파라미터 기반 순수 함수 |
| 15 | beginTransition 경유 | ✅ PASS | 모든 상태 전환이 `guard.beginTransition()` 경유. 즉시 전환도 `{immediate:true}` |
| 16 | 상태 x 시스템 매트릭스 | ✅ PASS | 코드 내 주석으로 5상태 × 6시스템 매트릭스 명시 (line 1575-1582), 구현과 일치 |

### 1.2 에셋 로딩 검사

| 항목 | 결과 | 비고 |
|------|------|------|
| assets/ 디렉토리 | ✅ 없음 | 기획서 §12.1 준수 — 에셋 제로 원칙 달성 |
| assets/manifest.json | N/A | 에셋 디렉토리 자체 미존재 |
| SVG 파일 | ✅ 0건 | 외부 이미지/SVG 참조 없음 |
| 외부 폰트 | ✅ 0건 | 시스템 폰트 스택만 사용 (`system-ui`, `Malgun Gothic`, `sans-serif`) |

---

## 2. 모바일 조작 대응 검사

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | touchstart 이벤트 등록 | ✅ PASS | `canvas.addEventListener('touchstart', handlePointerDown, {passive:false})` (line 1554) |
| 2 | touchmove 이벤트 등록 | ✅ PASS | `canvas.addEventListener('touchmove', handlePointerMove, {passive:false})` (line 1555) |
| 3 | touchend 이벤트 등록 | ✅ PASS | `canvas.addEventListener('touchend', handlePointerUp, {passive:false})` (line 1556) |
| 4 | 가상 조이스틱/터치 버튼 UI | ✅ PASS | 히트존 기반 버튼 — 수확 탭, 배치 메뉴, 업그레이드 구매, 탭 전환, 일시정지 등 모두 터치 대응 |
| 5 | 모바일 뷰포트 meta | ✅ PASS | `width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no` (line 5) |
| 6 | 스크롤 방지 | ✅ PASS | CSS: `touch-action:none`, `overflow:hidden`, `-webkit-tap-highlight-color:transparent`, `user-select:none` (line 9) |
| 7 | 키보드 없이 플레이 가능 | ✅ PASS | 작물 배치/수확, 업그레이드 구매, 탭 전환(탭+스와이프), 프레스티지, 일시정지 — 모두 터치만으로 플레이 가능 |
| 8 | 롱프레스 연속구매 | ✅ PASS | 500ms 후 100ms 간격 자동 반복 (line 1606-1611) |
| 9 | 스와이프 탭 전환 | ✅ PASS | 좌우 50px 이상 스와이프 시 탭 전환 (line 1507-1514) |

### 터치 타겟 크기 상세

| 요소 | 시각 크기 | 히트존 크기 | 48px 충족 | 기획서 요구 |
|------|-----------|-----------|-----------|-----------|
| 일시정지 버튼 | 48×40px | 48×40px | ⚠️ **높이 40 < 48** | §4.5: 48×48px |
| 사운드 버튼 | 40×40px | 40×40px | ⚠️ **너비·높이 40 < 48** | §4.5: 48×48px |
| 업그레이드 구매 버튼 | 80×36px | 80×36px | ⚠️ **높이 36 < 48** | — |
| 프레스티지 구매 버튼 | 70×36px | 70×36px | ⚠️ **높이 36 < 48** | — |
| 탭 바 버튼 | 130×56px | 130×56px | ✅ | §4.5: 높이 56px |
| 농장 칸 | 110×110px | 110×110px | ✅ | §4.5: 최소 80×80px |
| 배치 메뉴 항목 | ~272×44px | ~272×44px | ⚠️ **높이 44 < 기획 56px** | §4.5: 높이 56px |
| 시작하기 버튼 | 180×50px | 180×50px | ✅ | — |
| 계속하기/타이틀로 | 120×44 / 100×36 | 동일 | ⚠️ | — |

---

## 3. 브라우저 테스트 (Puppeteer)

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 페이지 로드 | ✅ PASS | 정상 로드, 에러 없음 |
| 2 | 콘솔 에러 없음 | ✅ PASS | 콘솔 에러/경고 0건 |
| 3 | 캔버스 렌더링 | ✅ PASS | DPR 대응 Canvas 정상 렌더링 (390×680) |
| 4 | 시작 화면 표시 | ✅ PASS | 하늘+구름+태양 배경 + 미리보기 아이콘(밀,당근,토마토,닭,소) + "시작하기" 버튼 + "탭하거나 SPACE를 눌러 시작" |
| 5 | 농장 탭 | ✅ PASS | 2행×3열 그리드(6칸), 밀 1칸 + 빈칸 5개(+ 아이콘), 상단 골드, 하단 탭 바 |
| 6 | 수확 시스템 | ✅ PASS | 밀 성장 완료 후 탭 → 3G 획득 (1×2G×1.5 = 3G), 통계(totalClicks) 정상 증가 |
| 7 | 업그레이드 탭 | ✅ PASS | 생산 속도/수확량/자동화/특수 카테고리, 비용 표시, 비활성 버튼 처리 |
| 8 | 프레스티지 탭 | ✅ PASS | 총 수입, 현재 별, 생산 배율, 해금까지 필요 골드, 6종 프레스티지 업그레이드, 통계 표시 |
| 9 | 일시정지 | ✅ PASS | PAUSED 상태 전환 정상, "일시정지" 오버레이 + 계속하기/타이틀로 버튼 |
| 10 | localStorage 저장 | ✅ PASS | `miniIdleFarm_v1` 키에 정상 저장/로드 확인 (438 bytes) |
| 11 | 게임오버/재시작 | N/A | 아이들 장르 — 명시적 게임오버 없음. 프레스티지 리셋 구현됨 |

### 스크린샷 검증 요약

1. **타이틀**: 하늘 그라디언트 + 구름 + 태양 + 울타리 + 잔디 + 미리보기 아이콘 + "시작하기" 버튼 ✅
2. **농장 탭**: 2×3 그리드 + 밀(성장 애니메이션) + 빈칸(+) + 상단 HUD(골드) + 하단 탭 바 ✅
3. **수확 후**: 골드 3G 표시 + 밀 재성장(진행바) + 파티클 팝업 ✅
4. **업그레이드 탭**: 4카테고리(속도/수확량/자동화/특수) + 비용 버튼 + 스크롤 ✅
5. **프레스티지 탭**: 별 0개 보유 + 배율 x1.0 + 해금까지 10.0KG + 6종 업그레이드 목록 + 통계 ✅
6. **일시정지**: 반투명 오버레이 + "⏸ 일시정지" + 계속하기/타이틀로 버튼 ✅

---

## 4. 기획서 수치 대조

| 기획서 항목 | 기획값 | 구현값 | 일치 |
|------------|--------|--------|------|
| 수동 수확 보너스 | ×1.5 | `CONFIG.MANUAL_HARVEST_BONUS = 1.5` | ✅ |
| 속도 업그레이드 최대 | Lv.10 | `SPEED_UPGRADE.maxLevel = 10` | ✅ |
| 수확량 업그레이드 최대 | Lv.5 | `YIELD_UPGRADE.maxLevel = 5` | ✅ |
| 자동 수확 비용 (밭/목장/공장) | 500/5,000/30,000 | `AUTO_HARVEST_COST = [500,5000,30000]` | ✅ |
| 자동 판매 비용 | 2,000 | `AUTO_SELL_COST = 2000` | ✅ |
| 비료 비용 | 10,000/100,000 | `FERTILIZER_COST = [10000,100000]` | ✅ |
| 비료 배율 | ×1.5/×2.0 | `FERTILIZER_MULT = [1.5,2.0]` | ✅ |
| 프레스티지 해금 | 10,000G | `PRESTIGE_THRESHOLD = 10000` | ✅ |
| 별당 속도 보너스 | +10% | `PRESTIGE_SPEED_BONUS = 0.10` | ✅ |
| 오프라인 최대 | 4시간 | `OFFLINE_MAX_HOURS = 4` | ✅ |
| 오프라인 배율 | ×0.5 | `OFFLINE_MULT = 0.5` | ✅ |
| 자동저장 간격 | 30초 | `AUTO_SAVE_INTERVAL = 30` | ✅ |
| 터치 최소 크기 | 48px | `MIN_TOUCH = 48` | ✅ (선언만, 실제 미적용 — ISSUE-1) |
| 목장 해금 | 5,000G | `RANCH_UNLOCK = 5000` | ✅ |
| 공장 해금 | 50,000G | `FACTORY_UNLOCK = 50000` | ✅ |
| 밀 성장시간/가격 | 3초/2G | `wheat: {growTime:3, price:2}` | ✅ |
| 당근 성장시간/가격 | 5초/3G | `carrot: {growTime:5, price:3}` | ✅ |
| 토마토 성장시간/가격 | 8초/5G | `tomato: {growTime:8, price:5}` | ✅ |
| 옥수수 성장시간/가격 | 6초/4G | `corn: {growTime:6, price:4}` | ✅ |
| 닭 성장시간/가격 | 10초/8G | `chicken: {growTime:10, price:8}` | ✅ |
| 젖소 성장시간/가격 | 15초/12G | `cow: {growTime:15, price:12}` | ✅ |
| 양 성장시간/가격 | 12초/15G | `sheep: {growTime:12, price:15}` | ✅ |
| 빵 성장시간/가격 | 20초/25G | `bread: {growTime:20, price:25}` | ✅ |
| 치즈 성장시간/가격 | 25초/35G | `cheese: {growTime:25, price:35}` | ✅ |
| 스웨터 성장시간/가격 | 30초/50G | `sweater: {growTime:30, price:50}` | ✅ |
| 마일스톤 (5단계) | 1K/10K/100K/1M/10M | 구현 동일 | ✅ |
| 프레스티지 별 공식 | floor(sqrt(totalEarned/1000)) | `calcPrestigeStars()` (line 123) | ✅ |
| 상단 바 높이 | 48px | `topH = 48` | ✅ |
| 하단 탭 바 높이 | 56px | `botH = 56` | ✅ |
| 농장 칸 최소 | 80px | `cellW = Math.max(80, maxCellW)` | ✅ |

---

## 5. 발견 이슈

### ISSUE-1: 일부 버튼 터치 타겟 48×48px 미달 ⚠️ MINOR

**위치**: 여러 곳

| 버튼 | 현재 크기 | 기획 요구 | 라인 |
|------|----------|----------|------|
| 일시정지 | 48×**40** | 48×48 | 1004 |
| 사운드 | **40**×**40** | 48×48 | 1013 |
| 업그레이드 구매 | 80×**36** | — | 852 |
| 프레스티지 구매 | 70×**36** | — | 940 |
| 배치 메뉴 항목 | ~272×**44** | 높이 56px | 1053 |

**원인**: `CONFIG.MIN_TOUCH = 48`이 선언되어 있지만 (line 32), 실제 버튼 크기 지정 시 이 값을 참조하지 않음.

**수정 방향**:
- 일시정지 버튼: `roundRect(ctx, pX, pY, 48, 48, 6)` + 히트존 h=48
- 사운드 버튼: `roundRect(ctx, sX, pY, 48, 48, 6)` + 히트존 w=48, h=48
- 업그레이드/프레스티지 구매 버튼: 높이 최소 48px
- 배치 메뉴 항목: `itemH = 56`으로 변경 (기획서 §4.5 준수)
- 상단 바 높이(`topH`)를 56px로 늘리면 48×48 버튼을 수용할 수 있음

**심각도**: MINOR — 게임 플레이 자체에는 영향 없으나, 기획서 §4.5 WCAG AAA 기준 미달.

### ISSUE-2: SoundManager에서 setTimeout 사용 ⚠️ INFO

**위치**: line 248-259 (SoundManager.buy, unlock, prestige)

```javascript
setTimeout(() => this._play(659, 0.08, 'sine', 0.6), 80);
```

**분석**: 기획서 §5는 "setTimeout 사용 0건 목표"이나, 이 setTimeout은 **상태 전환이 아닌 사운드 시퀀싱 전용**. Web Audio의 `oscillator.start(ctx.currentTime + delay)` 패턴으로 대체 가능하지만, 현재 구현도 게임 로직에 영향 없음.

**심각도**: INFO — 수정 권장하지만 필수는 아님. 배포 차단 사유 아님.

---

## 6. 코드 품질 요약

### 잘 된 점
- **에셋 제로 달성**: 100% Canvas + Web Audio, 외부 파일 0건 (§12.1 완벽 준수)
- **TransitionGuard**: 우선순위 기반 상태 전환 가드로 이중 호출/경쟁 조건 차단
- **TweenManager**: `clearImmediate()` 즉시 정리 API (Cycle 4 교훈)
- **ObjectPool**: 파티클 80개 + 팝업 30개 풀링 — 메모리 안정
- **순수 함수**: calcGrowTime, calcYield, calcSellPrice, calcPrestigeStars, calcOfflineEarnings — 모두 파라미터 기반
- **배경 캐시**: offscreen canvas로 배경 1회 렌더 후 재사용 (성능 최적화)
- **상태 × 시스템 매트릭스**: 코드 내 주석으로 명시 + 구현 일치
- **오프라인 수입**: 접속 시 경과 시간 기반 수입 계산 + 환영 팝업
- **롱프레스 연속구매**: 500ms 후 100ms 간격 자동 반복 (기획서 §3.2)
- **스와이프 탭 전환**: 좌우 50px + 500ms 이내 감지 (기획서 §3.2)
- **localStorage 캐싱**: 인메모리 `sd` 객체 → 저장 시점만 I/O (§8.2)
- **세이브 호환성 보정**: 이전 버전 세이브 로드 시 누락 필드 자동 보정 (line 1427-1433)
- **try-catch 래핑**: 런타임 에러 시에도 게임 루프 유지

### 개선 필요
- **ISSUE-1**: CONFIG.MIN_TOUCH 선언만 하고 실제 버튼 크기에 미적용 → 시스템적으로 적용 필요
- **ISSUE-2**: SoundManager setTimeout → Web Audio 스케줄링으로 대체 권장

---

## 7. 최종 판정

### 코드 리뷰: **NEEDS_MINOR_FIX**
### 브라우저 테스트: **PASS**
### 종합 판정: **NEEDS_MINOR_FIX**

**사유**: 게임 기능은 기획서 전체 범위를 충실히 구현하였으며, 콘솔 에러 0건, 에셋 제로 원칙 달성, 모바일 터치 조작 완전 지원. 그러나 기획서 §4.5에서 요구하는 **WCAG AAA 터치 타겟 48×48px** 기준을 일시정지 버튼(48×40), 사운드 버튼(40×40), 업그레이드 구매 버튼(80×36), 배치 메뉴 항목(높이 44px) 등 다수 UI 요소가 미달. `CONFIG.MIN_TOUCH = 48` 선언은 있으나 실제 적용이 누락됨.

**수정 범위**: 해당 버튼들의 높이를 최소 48px로 조정하고, 상단 바 높이를 56px로 늘려 일시정지/사운드 버튼을 48×48으로 맞추는 것을 권장. 수정 범위가 UI 레이아웃 조정에 국한되어 **사소한 수정**으로 분류.

> **배포 가능 여부**: ⚠️ 수정 후 배포 권장 (게임 자체는 정상 동작)
> **리뷰 이력**: 1회차 NEEDS_MINOR_FIX
