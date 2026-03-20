---
game-id: beat-rush
cycle: 5
review-round: 2
reviewer: Claude (QA)
date: 2026-03-20
verdict: APPROVED
code-review: APPROVED
browser-test: PASS
---

# Cycle 5 — 비트 러시 (Beat Rush) 2회차 재리뷰

> **재리뷰 목적:** 1회차 리뷰에서 지적된 [B1] SVG 에셋 로딩 코드 존재, [B2] BPM tween 이중 등록 두 건의 수정 여부 검증

---

## 0. 이전 리뷰 지적사항 수정 확인 (핵심)

| # | 이전 지적 | 심각도 | 수정 여부 | 검증 결과 |
|---|-----------|--------|-----------|-----------|
| B1 | SVG 에셋 로딩 코드 존재 (ASSET_MAP, preloadAssets, SPRITES) | MINOR | ✅ **완전 수정** | 코드에서 `SPRITES`, `ASSET_MAP`, `preloadAssets` 모두 제거 확인 (grep 0건). 런타임에서도 `typeof SPRITES === undefined` 확인 |
| B2 | BPM tween 이중 등록 (불필요한 bpmObj tween) | TRIVIAL | ✅ **완전 수정** | L457~463: `hud.bpmScale` 펄스 tween 1건 + `bpm = targetBPM` 즉시 반영만 존재. 이중 등록 제거 확인 |

**결론: 1회차 지적사항 2건 모두 정상 수정 완료.**

---

## 1. 자동 검증 스크립트 결과 (§13.5)

| 금지 패턴 | 검출 수 | 결과 |
|-----------|---------|------|
| `setTimeout` / `setInterval` | 0 | ✅ PASS |
| `confirm()` / `alert()` / `prompt()` | 0 | ✅ PASS |
| `eval()` | 0 | ✅ PASS |
| 외부 폰트 / CDN | 0 | ✅ PASS |
| 외부 사운드 파일 (`.mp3`/`.ogg`/`.wav`/`new Audio`) | 0 | ✅ PASS |
| SVG / 외부 이미지 참조 (코드 내) | 0 | ✅ **PASS (수정됨!)** |
| `SPRITES` / `ASSET_MAP` / `preloadAssets` | 0 | ✅ **PASS (수정됨!)** |

**자동 검증: 전 항목 PASS — 4사이클 연속 재발했던 SVG 문제 완전 해결!**

---

## 2. 코드 리뷰 (정적 분석)

### 2.1 기능 완성도 체크리스트 (§13.1 대조)

| 항목 | 결과 | 비고 |
|------|------|------|
| 4레인 노트 낙하 시스템 | ✅ | laneXs 4위치, AudioContext.currentTime 기반 y 계산 |
| 탭/롱/동시 노트 3종 | ✅ | type: tap/long, 동시=같은 targetTime 연결선 |
| AudioContext.currentTime 타이밍 판정 | ✅ | diffMs 기반 Perfect/Great/Good/Miss 4등급 |
| BeatScheduler 절차적 비트 생성 | ✅ | beatSchedulerUpdate() — while 루프 선행 스케줄링 |
| Web Audio 절차적 음악 3트랙 | ✅ | 드럼(킥/스네어/하이햇) + 베이스(Am) + 멜로디(Am 스케일) |
| 콤보 시스템 + 배율 (×3.0 cap) | ✅ | `Math.min(3, 1 + Math.floor(combo/10)*0.1)` |
| HP 게이지 (회복/감소/게임오버) | ✅ | Perfect+2, Great+1, Miss-8, hp≤0→GAMEOVER |
| BPM 단계적 상승 (100→160) | ✅ | BPM_CURVE 7단계, getBPMForTime() |
| 절차적 비트맵 + 안전 규칙 | ✅ | 난이도별 레인 수 제한, 롱 노트 중 같은 레인 금지 |
| 동적 밸런스 보정 | ✅ | HP≤30 밀도↓, Miss 3연속 밀도↓, FEVER(combo 50/100) |
| 점수 + localStorage 최고 기록 | ✅ | br_bestScore/br_bestCombo/br_totalPlays, try-catch 래핑 |
| 6상태 게임 상태 머신 | ✅ | LOADING/TITLE/PLAYING/PAUSE/CONFIRM_MODAL/GAMEOVER |
| TweenManager + clearImmediate() | ✅ | resetGame()(L937) + goToTitle()(L985)에서 clearImmediate() 사용 |
| ObjectPool (노트40, 파티클60, 파동10) | ✅ | 3개 풀 초기화 완료 |
| TransitionGuard 패턴 | ✅ | STATE_PRIORITY + transitioning 가드 |
| enterState() 패턴 | ✅ | 5상태 모두 진입 초기화 구현 (TITLE 글로우 포함) |
| Canvas 기반 모달 | ✅ | renderModal() — 예/아니오 버튼 Canvas 드로잉 |
| 상태×시스템 매트릭스 주석 | ✅ | L16~29 코드 상단 주석 포함 |
| destroy() + 리스너 cleanup | ✅ | registeredListeners + cancelAnimationFrame + audioCtx.close |
| 키보드/마우스/터치 입력 자동 감지 | ✅ | inputMode 변수, 첫 입력 시 자동 설정 + 분기 동작 4곳 |

### 2.2 게임 루프 & 성능

| 항목 | 결과 | 비고 |
|------|------|------|
| requestAnimationFrame 사용 | ✅ | `rafId = requestAnimationFrame(loop)` (L1678) |
| delta time 처리 + 50ms 캡 | ✅ | `Math.min((timestamp - lastTime)/1000, 0.05)` (L1630) |
| offscreen canvas 그리드 캐시 | ✅ | buildGridCache() — 매 프레임 재드로잉 방지 |
| 매 프레임 불필요한 DOM 접근 없음 | ✅ | Canvas ctx만 사용, DOM 조작 없음 |
| ObjectPool로 GC 부담 최소화 | ✅ | 노트/파티클/파동 모두 풀링 |

### 2.3 상태 매트릭스 대조 (§8)

| 상태 | TweenMgr | BeatSched | NoteMgr | Particles | Audio | 결과 |
|------|----------|-----------|---------|-----------|-------|------|
| LOADING | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ |
| TITLE | ✓ | ✗ | ✗ | ✗ | ✗ | ✅ |
| PLAYING | ✓ | ✓ | ✓ | ✓ | ✓(running) | ✅ |
| PAUSE | ✓ | ✗ | ✗ | ✗ | suspend | ✅ |
| CONFIRM_MODAL | ✓ | ✗ | ✗ | ✗ | suspend | ✅ |
| GAMEOVER | ✓ | ✗ | ✗ | ✓(감쇠) | suspend | ✅ |

### 2.4 변수 사용처 검증 (§7.3 유령 코드 방지)

| 변수 | 기획 사용처 | 실제 사용처 | 결과 |
|------|------------|------------|------|
| `combo` | 5개 | 5개 (배율, 렌더링, 비주얼, FEVER, 결과) | ✅ |
| `maxCombo` | 2개 | 2개 (결과 표시, 갱신 보너스) | ✅ |
| `hp` | 4개 | 4개 (렌더링, 색상, 게임오버, 밸런스) | ✅ |
| `bpm` | 4개 | 4개 (속도, 표시, 비트간격, 비주얼) | ✅ |
| `elapsedTime` | 3개 | 3개 (BPM단계, 난이도, 결과시간) | ✅ |
| `noteSpeed` | 2개 | 2개 (노트y갱신, calcNoteSpeed) | ✅ |
| `inputMode` | 4개 | 4개 (키가이드, 입력영역, 안내텍스트, 일시정지버튼) | ✅ |
| 판정 카운터 4종 | 3개 | 3개 (결과화면, FullCombo, Perfect연속) | ✅ |

### 2.5 보안 검사

| 항목 | 결과 |
|------|------|
| eval() 사용 금지 | ✅ 0건 |
| XSS 위험 없음 (innerHTML 등) | ✅ 미사용 |
| 외부 리소스 로드 없음 | ✅ **수정됨 — SVG 로딩 코드 완전 제거** |

### 2.6 Cycle 4 교훈 반영 확인 (§0-1)

| Cycle 4 문제 | 반영 결과 |
|-------------|-----------|
| [B1] TweenManager cancelAll+add 경쟁 조건 | ✅ `clearImmediate()` 구현 + resetGame()/goToTitle()에서 사용 |
| [B2] SVG 에셋 재발 | ✅ **코드에서 완전 제거** (4사이클 연속 재발 종결) |
| 타이틀 글로우 미복구 | ✅ `enterState(TITLE)` → `pulseTitle()` 호출로 해결 |
| 콤보 보너스 미구현 | ✅ 콤보 배율 시스템 핵심 메커니즘으로 구현 |

---

## 3. 발견된 문제

**없음.** 이전 리뷰 지적사항 모두 수정 완료. 신규 문제 0건.

### 참고사항 (비차단)

- `assets/` 디렉토리에 SVG 파일 8개 + manifest.json이 여전히 존재합니다. 코드에서 참조하지 않으므로 기능에 영향 없으나, 디스크 정리 차원에서 삭제를 권장합니다 (thumbnail.svg는 플랫폼 썸네일용으로 유지).

---

## 4. 브라우저 테스트 결과

### 테스트 환경
- Puppeteer (Chromium headless)
- 해상도: 480×360 (기획서 기본)

### 테스트 결과 매트릭스

| 항목 | 결과 | 비고 |
|------|------|------|
| 페이지 로드 | ✅ PASS | 에러 없이 즉시 로드 (preloadAssets 제거로 로딩 단축) |
| 콘솔 에러 없음 | ✅ PASS | 런타임 에러 0건, 경고 0건 |
| 캔버스 렌더링 | ✅ PASS | 480×360 정상, DPR 대응 |
| 시작 화면 표시 | ✅ PASS | "비트 러시 / BEAT RUSH" + 음표 + 4색 레인 가이드 + 글로우 펄스 |
| 게임 시작 (Space키) | ✅ PASS | TITLE→PLAYING, audioCtx "running" 확인 |
| 4레인 노트 낙하 | ✅ PASS | 레인 배경 + 판정 라인 + D/F/J/K 가이드 정상 |
| BPM 표시 | ✅ PASS | 우하단 "♪ 100 BPM" 표시 |
| HP 시스템 | ✅ PASS | Miss 누적 시 HP 감소 → hp=0 도달 시 GAMEOVER 정상 전환 |
| 점수 시스템 | ✅ PASS | 콤보 배율, 판정별 점수, 보너스 로직 정상 |
| 게임오버 화면 | ✅ PASS | GAME OVER + 점수/콤보/시간/판정 통계 순차 fadeIn |
| localStorage 최고점 | ✅ PASS | br_totalPlays = 1 정상 기록, getLS/setLS 동작 확인 |
| 터치 이벤트 코드 존재 | ✅ PASS | touchstart/touchend `{ passive: false }` 등록 (L1689~1690) |
| 게임오버/재시작 | ✅ PASS | R키로 GAMEOVER→TITLE 정상 복귀, 글로우 tween 재시작 확인 |

### 시스템 상태 확인 (런타임 검증)

```
✅ state = TITLE (1) → 정상 초기화
✅ TweenManager.clearImmediate() 존재
✅ ObjectPool 3종 초기화 (note:40, particle:60, wave:10)
✅ destroy() 함수 존재
✅ registeredListeners = 8개 (resize, keydown, keyup, touchstart, touchend, mousedown, mouseup, contextmenu)
✅ enterState() / beginTransition() 존재
✅ localStorage read/write 정상
✅ 이징 함수 5종 구현 (linear, easeOutQuad, easeInQuad, easeOutBack, easeOutElastic)
✅ SPRITES = undefined (SVG 코드 완전 제거 확인!)
✅ ASSET_MAP = undefined (SVG 코드 완전 제거 확인!)
✅ preloadAssets = undefined (SVG 코드 완전 제거 확인!)
✅ GAMEOVER→TITLE 복귀 후 titleGlow tween 정상 동작 (Cycle 4 글로우 미복구 해결 확인)
```

---

## 5. 모바일 조작 대응 검사

| 검사 항목 | 결과 | 비고 |
|-----------|------|------|
| 터치 이벤트 등록 (touchstart/touchend) | ✅ PASS | `{ passive: false }` + `e.preventDefault()` 처리 |
| touchmove 이벤트 | ⬜ N/A | 리듬 게임 특성상 불필요 (탭/홀드만 사용) |
| 가상 조이스틱/터치 버튼 UI | ✅ PASS | 터치 모드에서 판정 라인 아래 4레인 색상 하이라이트 (L1213~1219) |
| 터치 영역 44px 이상 | ✅ PASS | laneW=68px + 터치 모드 여백 +8px×2 = 84px 유효 영역 |
| 모바일 뷰포트 meta 태그 | ✅ PASS | `width=device-width,initial-scale=1.0,user-scalable=no` |
| 스크롤 방지 처리 | ✅ PASS | CSS `touch-action:none` + `overflow:hidden` + `-webkit-tap-highlight-color:transparent` |
| 키보드 없이 플레이 가능 | ✅ PASS | 터치로 시작/레인입력/일시정지/게임오버재시작 모두 가능 |
| 일시정지 버튼 (터치/마우스) | ✅ PASS | 우상단 50×50px 터치 영역 (inputMode !== keyboard일 때 표시) |
| 입력 모드 자동 감지 | ✅ PASS | 첫 입력에 따라 keyboard/mouse/touch 즉시 전환 |
| 컨텍스트 메뉴 방지 | ✅ PASS | `contextmenu` 이벤트 preventDefault 등록 |

---

## 6. 에셋 검사

| 항목 | 결과 | 비고 |
|------|------|------|
| 코드 내 SVG/외부 이미지 참조 | ✅ 0건 | **수정됨!** ASSET_MAP/SPRITES/preloadAssets 완전 제거 |
| `assets/` 디렉토리 SVG 파일 | ⚠️ 잔존 | 파일 8개 + manifest.json 아직 남아 있으나 코드에서 미참조 → 기능 무영향 |
| thumbnail.svg | ✅ | 플랫폼 썸네일용 — 유지 |
| 순수 Canvas 드로잉 | ✅ | 모든 오브젝트 100% Canvas API로 드로잉 (둥근사각형, 파동, 파티클 등) |

---

## 7. 최종 판정

### 코드 리뷰: **APPROVED** ✅

**사유:**
- 1회차 지적사항 [B1] SVG 코드 + [B2] BPM tween 이중 등록 **모두 수정 완료**
- 기획서 §13.1~§13.5 전 항목 충족
- 핵심 게임 기능 100% 구현 (4레인 리듬, Web Audio 절차적 음악 3트랙, 콤보/HP/BPM 시스템)
- 상태 머신(6상태), TweenManager(clearImmediate), TransitionGuard, enterState, destroy 패턴 모두 정확
- 변수 사용처 100% 일치 (유령 코드 0건)
- 금지 패턴 자동 검증 전 항목 0건 PASS
- 4사이클 연속 재발했던 SVG 에셋 문제 **최종 해결**

### 브라우저 테스트: **PASS** ✅

**사유:**
- 페이지 로드, 캔버스 렌더링, 상태 전환 (TITLE→PLAYING→GAMEOVER→TITLE) 전 흐름 정상
- 콘솔 에러/경고 0건
- HP→게임오버, 결과 화면 순차 표시, 재시작 후 글로우 복구 모두 확인
- 모바일 터치 대응 완비 (터치 이벤트, 84px 영역, 뷰포트, 스크롤 방지)
- localStorage 읽기/쓰기 정상

---

### 수정 필요 사항 요약

| # | 심각도 | 설명 | 상태 |
|---|--------|------|------|
| ~~B1~~ | ~~MINOR~~ | ~~SVG 에셋 로딩 코드 삭제~~ | ✅ 수정 완료 |
| ~~B2~~ | ~~TRIVIAL~~ | ~~BPM tween 이중 등록 정리~~ | ✅ 수정 완료 |

> **배포 가능 여부:** ✅ **즉시 배포 가능.** 미해결 차단 이슈 0건.
>
> **참고:** `assets/` 디렉토리의 잔존 SVG 파일(8개)은 코드에서 미참조이므로 기능에 무영향이나, 디스크 정리 차원에서 추후 삭제를 권장합니다.
