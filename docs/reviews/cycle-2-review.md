# Cycle 2 — 스타 가디언 (Star Guardian) 코드 리뷰 & 테스트 리포트

> **리뷰 일시:** 2026-03-20
> **게임 ID:** `star-guardian`
> **파일:** `public/games/star-guardian/index.html` (1,185줄)
> **리뷰어:** Claude (QA)
> **기획서:** `docs/game-specs/cycle-2-spec.md`

---

## 1. 코드 리뷰 (정적 분석)

### 1.1 기능 완성도 체크리스트

| # | 기획서 요구사항 | 구현 | 비고 |
|---|---------------|:----:|------|
| 1 | 종스크롤 슈팅 기본 루프 | ✅ | requestAnimationFrame + deltaTime 정상 |
| 2 | 적 4종 (스카우트/파이터/탱크/다트) | ✅ | 이동 패턴, HP, 점수 모두 기획서 일치 |
| 3 | 보스전 (5웨이브마다) | ✅ | 3페이즈 공격 패턴 순환 구현 |
| 4 | 파워업 3종 (W/H/S) | ✅ | 드롭 확률, 효과, 지속시간 일치 |
| 5 | 무기 강화 4단계 | ✅ | 단발→더블→트리플→트리플+후방탄 |
| 6 | 콤보 시스템 | ✅ | 1초 이내 연속 처치, 배수 공식 정확 |
| 7 | 점수 이정표 5종 | ✅ | 메시지/색상 기획서 일치 |
| 8 | 3레이어 패럴랙스 배경 | ✅ | 별 개수/크기/속도 기획서 일치 |
| 9 | TweenManager 시스템 | ✅ | 이징 5종, 16+ 활용처 |
| 10 | ObjectPool 시스템 | ✅ | 총알/적/파워업/파티클/텍스트 6종 풀링 |
| 11 | AABB 충돌 감지 4종 | ✅ | 아탄↔적, 적탄↔아군, 적↔아군, 파워업↔아군 |
| 12 | 게임 상태 머신 6상태 | ✅ | LOADING/TITLE/PLAYING/PAUSE/CONFIRM_MODAL/GAMEOVER |
| 13 | 키보드 동시 입력 (Set) | ✅ | 대각선 이동 정규화 포함 |
| 14 | 마우스 lerp 추적 | ✅ | factor 0.12 |
| 15 | 터치 가상 조이스틱 | ✅ | 데드존 8px, 좌하단 영역 제한 |
| 16 | Canvas 확인 모달 (R키) | ⚠️ | **구현됨 but 표시 안 됨 — 아래 MAJOR B1 참조** |
| 17 | 일시정지 (P/Esc) | ✅ | 키보드 선택 + 마우스/터치 지원 |
| 18 | localStorage 최고점 | ✅ | try-catch 적용 |
| 19 | DPR 대응 | ✅ | resize + orientationchange |
| 20 | 웨이브 난이도 스케일링 | ✅ | 공식 기획서 일치 |

### 1.2 Cycle 1 실수 재발 방지 검증

| # | 점검 항목 | 결과 | 비고 |
|---|----------|:----:|------|
| M1 | 외부 CDN 0개 | ✅ PASS | Google Fonts 미사용, 시스템 폰트 스택만 |
| M2 | 미사용 에셋 잔존 없음 | ✅ PASS | ASSET_MAP 8종 = manifest.json 8종 (thumbnail 제외) 일치 |
| M3 | confirm()/alert()/prompt() 0건 | ✅ PASS | Canvas 모달로 대체 |
| M4 | setTimeout 애니메이션 대체 없음 | ⚠️ | **line 507: `setTimeout(600)` 게임오버 전환에 사용 — B3 참조** |

### 1.3 게임 루프 & 성능

| 항목 | 결과 | 비고 |
|------|:----:|------|
| requestAnimationFrame 사용 | ✅ PASS | `loop` 함수에서 사용 |
| deltaTime 처리 | ✅ PASS | `ms = min(now - lastT, 33.33)`, 60fps 정규화 `dt = ms / 16.67` |
| 최대 프레임 스킵 보호 | ✅ PASS | 33.33ms 캡 |
| 매 프레임 DOM 접근 없음 | ✅ PASS | Canvas API만 사용 |
| 객체 풀링 | ✅ PASS | 6종 엔티티 풀링, GC 최소화 |
| DPR 대응 | ✅ PASS | `canvas.width = cssW * dpr`, `ctx.setTransform(dpr*scX,...)` |

### 1.4 충돌 감지

| 항목 | 결과 | 비고 |
|------|:----:|------|
| AABB 로직 정확성 | ✅ PASS | 중심+반크기 기반, `ax-ahw < bx+bhw ...` |
| 플레이어 히트박스 축소 | ✅ PASS | 시각 40×48 → 판정 24×24 (관대한 판정) |
| 4종 충돌 체크 | ✅ PASS | 총알↔적, 적탄↔플레이어, 적↔플레이어, 파워업↔플레이어 |

### 1.5 모바일 대응

| 항목 | 결과 | 비고 |
|------|:----:|------|
| 터치 이벤트 (start/move/end) | ✅ PASS | passive: false 설정 |
| 가상 조이스틱 | ✅ PASS | 반지름 50px, 시각 인디케이터, 데드존 8px |
| 일시정지 버튼 (터치용) | ✅ PASS | 우측 상단 영역 |
| canvas 리사이즈 | ✅ PASS | resize + orientationchange 핸들러, 2:3 비율 유지 |
| touch-action: none | ✅ PASS | CSS에 설정 |
| user-select: none | ✅ PASS | CSS에 설정 |
| contextmenu 차단 | ✅ PASS | `e.preventDefault()` |

### 1.6 보안 & iframe 호환

| 항목 | 결과 | 비고 |
|------|:----:|------|
| eval() 사용 | ✅ 없음 | |
| alert()/confirm()/prompt() 사용 | ✅ 없음 | Canvas 모달로 대체 |
| XSS 위험 | ✅ 없음 | 외부 입력 없음 |
| 외부 CDN 의존 | ✅ 0건 | |
| window.open / 팝업 | ✅ 없음 | |
| form submit | ✅ 없음 | |

### 1.7 에셋 로딩 검증

| 항목 | 결과 | 비고 |
|------|:----:|------|
| manifest.json 존재 | ✅ | 9종 에셋 정의 (thumbnail 포함) |
| ASSET_MAP ↔ manifest 일치 | ✅ | 8종 (thumbnail 제외) 완전 일치 |
| SVG 파일 전체 존재 | ✅ | 10개 파일 모두 확인 (thumbnail.svg + manifest.json 포함) |
| 에셋 프리로드 Promise.all | ✅ | `img.onerror = resolve` — 에셋 실패해도 게임 진행 |
| 코드 폴백 렌더링 | ✅ | player, enemy 유형별, powerup, HUD hearts 등 모두 폴백 존재 |
| 미사용 에셋 잔존 | ✅ 없음 | Cycle 1 M2 해결 |

---

## 2. 발견된 버그

### 🔴 B1 [MAJOR] — CONFIRM_MODAL에서 Tween이 업데이트되지 않음

**위치:** `loop()` 함수 (line 1149)

**문제:**
```javascript
case'CONFIRM_MODAL': drawGame(); drawModal(); break;
```
`CONFIRM_MODAL` 상태에서 `tw.update(ms)`가 호출되지 않습니다. `tw.update(ms)`는 `updateGame()` 내부(line 455)에서만 실행되는데, `CONFIRM_MODAL` 상태는 `updateGame()`을 호출하지 않습니다.

**실측 증거:** Puppeteer 테스트에서 R키 → CONFIRM_MODAL 진입 후 `modAnim = {sc: 0.8, a: 0}` 고정 확인. tweenCount = 1 (tween이 큐에 있으나 미실행). 모달이 **완전히 투명(alpha=0)** 하여 화면에 표시되지 않음.

**영향:** R키 재시작 확인 기능이 사실상 작동 불가. 사용자는 보이지 않는 모달에서 Enter/Esc로만 맹목적으로 빠져나올 수 있음.

**수정안:**
```javascript
case'CONFIRM_MODAL': tw.update(ms); drawGame(); drawModal(); break;
```

### 🔴 B2 [MAJOR] — PAUSE 상태에서도 Tween 미업데이트

**위치:** `loop()` 함수 (line 1148)

**문제:**
```javascript
case'PAUSE': drawGame(); drawPauseOL(); break;
```
PAUSE에서 RESTART 버튼 클릭 시 CONFIRM_MODAL로 전환하며 `modAnim` tween을 추가하지만, 이후에도 tween이 업데이트되지 않아 동일한 투명 모달 문제 발생.

**수정안:**
```javascript
case'PAUSE': tw.update(ms); drawGame(); drawPauseOL(); break;
```

### 🟡 B3 [MINOR] — 게임오버 전환에 setTimeout 사용

**위치:** line 507

**문제:** `setTimeout(()=>{if(!pl.alive)state='GAMEOVER';},600)` — Cycle 1 M4에서 지적된 setTimeout 패턴의 재사용.

**수정안:** tween의 onComplete 콜백으로 대체:
```javascript
tw.add(goAnim,{oa:0.7},500,'easeOutQuad',()=>{if(!pl.alive)state='GAMEOVER';});
```

### 🟡 B4 [MINOR] — goAnim.isNew 판정 타이밍 오류 → NEW BEST 미표시

**위치:** line 503~504

**문제:**
```javascript
pl.alive=false; saveBest(score,wave);        // ← 먼저 저장
goAnim.isNew = score > getBest();            // ← 이미 갱신된 값과 비교 → 항상 false
```
`saveBest()`가 먼저 호출되어 localStorage가 갱신된 후, `getBest()`가 갱신된 값을 반환하므로 `score > getBest()`는 항상 `false`.

**수정안:** 순서 변경:
```javascript
pl.alive=false;
goAnim.isNew = score > getBest();   // 먼저 판정
saveBest(score, wave);              // 나중에 저장
```

### 🟡 B5 [MINOR] — 적 SVG source-atop 렌더링 시 배경 사각형 노출

**위치:** `drawEN()` 함수 (line 811~814)

**문제:** `source-atop` 컴포지팅으로 적 색상 오버레이 적용 시, SVG 필터(`feGaussianBlur`)가 viewBox 전체에 반투명 픽셀을 생성하여 64×64 사각형 배경이 시각적으로 노출됨.

**Puppeteer 스크린샷에서 확인:** 적 스프라이트 주변에 어두운 사각형 배경 보임.

**수정안:** 색상 오버레이 제거 또는 offscreen canvas에 먼저 그린 후 합성, 또는 SVG에서 filter 범위를 `filterUnits="userSpaceOnUse"` + 좁은 영역으로 제한.

### 🟢 B6 [INFO] — 추적탄 회전 속도 프레임 의존적

**위치:** line 441

**문제:** `b.ang += clamp(diff, -2*dt/60, 2*dt/60)` — 기획서는 `2rad/s` 명시. 현재는 `dt/60` 기반으로 프레임 변동 시 미세 차이 발생 가능. 정확한 시간 기반은 `2 * (ms/1000)`.

---

## 3. 브라우저 테스트 (Puppeteer)

### 3.1 테스트 환경
- **URL:** `file:///C:/Work/InfinitriX/public/games/star-guardian/index.html`
- **해상도:** 480×720
- **브라우저:** Chromium (Puppeteer)

### 3.2 테스트 결과

| # | 항목 | 결과 | 비고 |
|---|------|:----:|------|
| 1 | 페이지 로드 | ✅ PASS | 정상 로드, LOADING → TITLE 전환 |
| 2 | 콘솔 에러 없음 | ✅ PASS | 에러/경고 0건 |
| 3 | 캔버스 렌더링 | ✅ PASS | 480×720 Canvas 정상 생성 |
| 4 | 시작 화면 표시 | ✅ PASS | 타이틀, 부제, 조작 설명, 전투기 프리뷰 |
| 5 | 에셋 로드 (8종) | ✅ PASS | SPRITES 객체에 8개 키 모두 확인 |
| 6 | TITLE → PLAYING 전환 | ✅ PASS | Enter 키로 정상 전환 |
| 7 | 게임 플레이 렌더링 | ✅ PASS | 플레이어, 적, 배경 별, HUD 정상 |
| 8 | 일시정지 (P키) | ✅ PASS | PLAYING → PAUSE, 3버튼 (RESUME/RESTART/TITLE) 표시 |
| 9 | 확인 모달 (R키) | ❌ **FAIL** | 모달이 alpha=0으로 고정되어 안 보임 (B1) |
| 10 | 게임오버 화면 | ✅ PASS | GAME OVER + 점수/웨이브/BEST + RETRY/TITLE 버튼 |
| 11 | 터치 이벤트 코드 존재 | ✅ PASS | touchstart/touchmove/touchend 핸들러 |
| 12 | 점수 시스템 | ✅ PASS | 적 처치 시 점수 증가 확인 (100점) |
| 13 | localStorage 최고점 | ✅ PASS | try-catch 래핑, 저장/로드 정상 |
| 14 | 게임오버/재시작 | ✅ PASS | HP=0 → GAMEOVER 전환, Enter로 재시작 |
| 15 | 패럴랙스 배경 | ✅ PASS | 3레이어 별 스크롤 시각 확인 |
| 16 | HUD 표시 | ✅ PASS | 하트 아이콘, 별 아이콘, 점수, WAVE, 무기레벨 |
| 17 | SVG 에셋 렌더링 | ⚠️ | 적 스프라이트 배경 사각형 노출 (B5) |
| 18 | DPR 대응 | ✅ PASS | dpr × scaleX 트랜스폼 적용 |

### 3.3 스크린샷 증적

1. **타이틀 화면** — ✅ 정상. "★ STAR GUARDIAN ★" 시안 네온 타이틀, 장식 전투기, 패럴랙스 배경, 깜빡이는 시작 안내, 조작 설명 3줄, CRT 스캔라인.
2. **플레이 화면** — ✅ 정상. HUD(하트/별/점수/웨이브/무기레벨), SVG 플레이어, SVG 적 (배경 사각형 이슈 있음), 패럴랙스 별 배경.
3. **일시정지** — ✅ 정상. 반투명 오버레이, "⏸ PAUSED" 텍스트, 3개 버튼 (RESUME 시안/RESTART 주황/TITLE 회색).
4. **확인 모달** — ❌ **FAIL**. 게임 화면만 보이고 모달이 보이지 않음 (`modAnim.a = 0` 고정).
5. **게임오버** — ✅ 정상. 반투명 오버레이, "GAME OVER" 빨강 네온, SCORE/WAVE/BEST 표시, RETRY/TITLE 버튼.

---

## 4. Cycle 1 피드백 반영 검증

| Cycle 1 문제 | 반영 결과 |
|-------------|----------|
| **M1 — Google Fonts 외부 의존** | ✅ 완전 해결. 시스템 폰트만 사용, 외부 CDN 0건 |
| **M2 — 불필요 에셋 3개 잔존** | ✅ 완전 해결. 전용 에셋만 등록, 모두 실사용 확인 |
| **M3 — R키 confirm() 불가** | ⚠️ Canvas 모달 구현됨, **but tween 미업데이트로 표시 불가 (B1)** |
| **M4 — 이동 애니메이션 미구현** | ✅ TweenManager 구현. 단 게임오버에 setTimeout 잔존 (B3) |
| **제안 — 객체 풀링** | ✅ 반영. ObjectPool 클래스 6종 엔티티 풀링 |
| **제안 — 아케이드/액션 도전** | ✅ 반영. 종스크롤 슈팅으로 완전히 다른 장르 |
| **제안 — 에셋 템플릿 정리** | ✅ 반영. manifest.json 기반 에셋 관리 + 100% 코드 폴백 |

---

## 5. Cycle 1 대비 개선 평가

| 영역 | Cycle 1 | Cycle 2 | 평가 |
|------|---------|---------|------|
| 장르 | 퍼즐 | 아케이드 슈팅 | ✅ 기술 영역 확대 |
| 코드 규모 | ~600줄 | ~1,185줄 | ✅ 2배 복잡도 소화 |
| Tween 시스템 | 없음 (setTimeout) | TweenManager 구현 | ✅ 크게 개선 |
| 객체 풀링 | 없음 | ObjectPool 6종 | ✅ 크게 개선 |
| 외부 의존 | Google Fonts | 0개 | ✅ 완전 해결 |
| 미사용 에셋 | 3개 잔존 | 0개 | ✅ 완전 해결 |
| confirm() 대체 | 미해결 | Canvas 모달 구현 (but 표시 불가) | ⚠️ 구현했으나 버그 |
| 에셋 시스템 | 없음 | manifest.json + SVG 8종 + 코드 폴백 | ✅ 크게 개선 |

---

## 6. 최종 판정

### 코드 리뷰 판정: `NEEDS_MAJOR_FIX`

### 테스트 판정: `FAIL`

### 최종 판정: `NEEDS_MAJOR_FIX`

**사유:**
- **B1 (CONFIRM_MODAL 투명)** — 기획서 §6.4, §11.4에서 명시한 핵심 기능(Cycle 1 M3 해결)이 사실상 작동하지 않습니다. R키를 누르면 `CONFIRM_MODAL` 상태로 진입하지만 모달이 보이지 않아 UX상 게임 불가능 수준.
- **B4 (NEW BEST 미표시)** — 점수 기록의 핵심 피드백 누락.

### 필수 수정 사항 (코더 재작업 요청)

| 우선순위 | 버그 | 수정 내용 |
|:--------:|------|----------|
| 🔴 필수 | B1 | `loop()` → `CONFIRM_MODAL` 케이스에 `tw.update(ms)` 추가 |
| 🔴 필수 | B2 | `loop()` → `PAUSE` 케이스에 `tw.update(ms)` 추가 |
| 🟡 필수 | B4 | `saveBest()` 호출 전에 `goAnim.isNew` 판정하도록 순서 변경 |
| 🟡 권장 | B3 | `setTimeout(600)` → tween onComplete 콜백으로 대체 |
| 🟡 권장 | B5 | 적 SVG `source-atop` 배경 사각형 문제 해결 |

> **수정 범위:** B1+B2는 각 1줄 추가, B4는 2줄 순서 변경으로 해결 가능. 빠른 수정 후 재검증 권장.
