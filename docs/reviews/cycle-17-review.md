---
game-id: arcane-bastion
title: 아케인 바스티온
cycle: 17
review-round: 3
date: 2026-03-22
reviewer: QA Agent (Claude)
verdict: NEEDS_MINOR_FIX
code-review: NEEDS_MINOR_FIX
browser-test: PASS
---

# Cycle 17 리뷰 (3회차 재리뷰) — 아케인 바스티온 (arcane-bastion)

## 요약

**판정: NEEDS_MINOR_FIX** — 2회차까지 지적된 **모든 핵심 문제가 해결**되었습니다. `index.html`이 2,093줄(74KB)로 완성되어 전체 게임이 구현되었으며, `assets/` 디렉토리는 삭제되고 `thumbnail.svg`도 생성되었습니다. 게임은 정상적으로 로드·플레이·렌더링되며, 5개 상태 머신·15웨이브 시스템·5종 타워·7종 적·3종 보스·로그라이크 업그레이드·가상 조이스틱 등 핵심 기능이 모두 작동합니다. 남은 문제는 **사소한 수치 불일치 및 코드 품질 이슈**로, 게임 플레이 자체에는 지장이 없어 **배포 가능** 수준입니다.

---

## 🔄 2회차 리뷰 지적사항 수정 여부 검증

| # | 2회차 지적 사항 | 수정 여부 | 상세 |
|---|----------------|-----------|------|
| 1 | `assets/` 디렉토리 삭제 (F1 위반) | ✅ **수정 완료** | `assets/` 디렉토리 및 SVG 8개 파일 전부 삭제됨 |
| 2 | `index.html` 생성 및 전체 게임 구현 | ✅ **수정 완료** | 2,093줄/74KB — 전체 게임 구현 |
| 3 | `thumbnail.svg` 생성 | ✅ **수정 완료** | 4,314 bytes, 바스티온+마법진+적 테마 썸네일 |
| 4 | 100% Canvas 코드 드로잉 (F1) | ✅ **수정 완료** | `new Image`, `fetch`, SVG 에셋 로딩 코드 0건 |
| 5 | 기획서 §1~§13 전체 구현 | ✅ **대부분 구현** | 핵심 기능 완성, 일부 수치 불일치(아래 상세) |

> **2회 연속 미수정이었던 모든 CRITICAL 문제가 3회차에서 완벽히 해결되었습니다.**

---

## 1단계: 코드 리뷰 (정적 분석)

### F 규칙 준수 현황

| # | 규칙 | 결과 | 비고 |
|---|------|------|------|
| F1 | assets/ 금지, 100% Canvas 드로잉 | ✅ PASS | `assets/` 삭제됨. 모든 그래픽 Canvas API로 드로잉 |
| F2 | setTimeout 0건 | ✅ PASS | `setTimeout`/`setInterval` 사용 없음. 모든 지연 처리 tween `onComplete`로 수행 |
| F3 | 순수 함수 패턴 (전역 직접 참조 0건) | ⚠️ MINOR | 대부분 `g` 파라미터 사용하나, `updatePlaying()` L1058 `G.selectedTower`, `renderRuneCircles()` L1400 `G.bastionX`, `renderEnemy()` L1594 `G.bastionX`, `renderMobileControls()` L1847 `G.wizFireballCd` 등에서 전역 `G` 직접 참조 |
| F4 | 5상태 × 6시스템 매트릭스 | ✅ PASS | STATE: TITLE(0), PLAYING(1), UPGRADE(2), PAUSED(3), GAMEOVER(4) + STATE_PRIORITY 맵 |
| F5 | 3중 가드 체계 | ✅ PASS | `_waveClearing`, `_isTransitioning`, `_isBossActive` 가드 플래그 구현 |
| F6 | TweenManager 경쟁 조건 방지 | ✅ PASS | `_clearing` + `_adding` 배열로 clearAll+add 경쟁 조건 방지 |
| F8 | alert/confirm/prompt 금지 | ✅ PASS | 사용 0건. Canvas UI로 모든 화면 구현 |
| F9 | SVG feGaussianBlur 금지 | ✅ PASS | inline SVG 사용 없음. Canvas `shadowBlur`로 glow 구현 |
| F10 | offscreen canvas 배경 캐싱 | ✅ PASS | `buildBgCache()` — 3바이옴(FOREST/CAVE/VOLCANO) offscreen canvas 생성, `resize()` 시 재빌드 |
| F11 | 초기화 순서 | ✅ PASS | 변수 선언 → DOM(`getElementById`) → 이벤트 등록 → `init()` |
| F12 | try-catch 게임 루프 | ✅ PASS | `gameLoop()` 내 `try{...}catch(err){console.error(...)}` 적용 |
| F21 | 입력 3종 전 기능 지원 | ⚠️ MINOR | 키보드+마우스 ✅, 터치 ✅. 마우스 단독 이동(드래그) 미구현 — §3.2 "마법사 드래그" 누락 |
| F24 | 터치 타겟 48px 이상 | ⚠️ MINOR | 스킬 버튼 56px ✅, 타워 버튼 50px ✅, 일시정지 버튼 42px (표시 크기) — 단, 터치 히트 영역은 `x>W-60 && y<60`(60x60)으로 충분 |

### 검토 체크리스트

| 항목 | 결과 | 비고 |
|------|------|------|
| □ 기능 완성도 | ✅ PASS | 15웨이브, 7적+3보스, 5타워, 3주문, 업그레이드18종, 업적10종 구현 |
| □ 게임 루프 | ✅ PASS | `requestAnimationFrame` + delta time + `CFG.DT_CAP`(0.05) 캡 |
| □ 메모리 관리 | ✅ PASS | `ObjectPool` (파티클 80개, 발사체 30개), `releaseAll()` 리셋 시 호출 |
| □ 충돌 감지 | ✅ PASS | `dist()` 기반 원형 충돌 — 적↔바스티온, 발사체↔적, 프로스트노바 범위 |
| □ 모바일 대응 | ✅ PASS | 가상 조이스틱 + 스킬 버튼 + 터치 사격 + 반응형 캔버스 |
| □ 게임 상태 | ✅ PASS | TITLE→PLAYING→UPGRADE→PLAYING→...→GAMEOVER. `beginTransition()` 경유 + `forceState()` (PAUSED만) |
| □ 점수/최고점 | ✅ PASS | `localStorage` key: `arcaneBastion_hi`, `arcaneBastion_achievements` |
| □ 보안 | ✅ PASS | `eval()` 0건, XSS 위험 없음, 불필요한 에셋 노출 없음 |
| □ 성능 | ✅ PASS | offscreen canvas 캐싱, 오브젝트 풀, 매 프레임 DOM 접근 없음 |

### 남은 Minor 이슈

#### [MINOR-1] F3 — 전역 G 직접 참조 (4건)

```
L1058: if(mouseDown && G.selectedTower < 0)    → g.selectedTower
L1400: ctx.arc(G.bastionX, G.bastionY, ...)     → g.bastionX (renderRuneCircles에 g 전달 필요)
L1594: angle(e.x,e.y,G.bastionX,G.bastionY)     → g.bastionX (renderEnemy에 g 전달됨, 사용 가능)
L1847: var cd = i===0 ? G.wizFireballCd : ...    → g.wizFireballCd (renderMobileControls에 g 전달됨)
```

게임 동작에는 영향 없음 (단일 인스턴스 `G`와 파라미터 `g`가 동일 객체). 코드 품질 이슈.

#### [MINOR-2] F7 — 적 색상/수치 불일치 (기획서 ↔ 코드)

| 항목 | 기획서 | 코드 | 차이 |
|------|--------|------|------|
| 스파이더 색상 | `#884488` | `#aa44ff` | 보라 톤 차이 |
| 레이스 색상 | `#6666ff` | `#4488ff` | 청색 톤 차이 |
| 다크나이트 색상 | `#333333` | `#888888` | 밝기 차이 (가시성 개선 의도로 보임) |
| 골렘 킹 속도 | 0.3 | 0.4 | +33% 빠름 |
| 레이스 킹 공격력 | 25 | 18 | -28% 낮음 |
| 드래곤 공격력 | 30 | 25 | -17% 낮음 |

게임 밸런스에 미세한 영향. 기획 의도와 정확히 맞추려면 수정 필요.

#### [MINOR-3] F21 — 마우스 단독 이동 미구현

기획서 §3.2에 "마법사 드래그"로 마우스 단독 이동을 명시했으나, 코드에는 마우스 드래그 기반 마법사 이동이 구현되어 있지 않습니다. 키보드+마우스 및 터치(조이스틱)에서는 이동 가능.

#### [MINOR-4] 외부 리소스 의존

```html
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet">
```

Google Fonts 외부 CDN 의존. 오프라인/제한 환경에서 폰트 미로드 시 `serif` 폴백으로 동작하므로 게임 불가는 아니지만, 네트워크 지연 시 초기 렌더링 영향 가능.

#### [MINOR-5] 웨이브별 적 수 불일치

코드의 적 수 산출 로직(`baseCount + extra`)이 기획서 §2.2의 명시적 적 수와 정확히 일치하지 않음. 예: Wave 2 기획서 8마리 → 코드 약 6마리.

---

## 📱 모바일 조작 대응 검사

| 항목 | 결과 | 비고 |
|------|------|------|
| 터치 이벤트(touchstart/touchmove/touchend) 등록 | ✅ PASS | L862-885, `{passive:false}`로 등록 |
| 가상 조이스틱 (좌측 이동용) | ✅ PASS | 좌측 40% 영역 터치 시 조이스틱 활성화, 반경 60px, 데드존 12px |
| 스킬 버튼 UI (우하단) | ✅ PASS | Q(파이어볼) + E(프로스트노바) 원형 버튼, 쿨다운 오버레이 표시 |
| 터치 영역 48px 이상 (F24) | ✅ PASS | 스킬 버튼 56px, 타워 버튼 50px, 일시정지 터치영역 60x60px |
| 모바일 뷰포트 meta 태그 | ✅ PASS | `width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no` |
| 가로/세로 스크롤 방지 | ✅ PASS | `touch-action:none`, `overflow:hidden`, `-webkit-user-select:none`, `user-select:none` |
| 키보드 입력 없이 게임 플레이 가능 여부 | ✅ PASS | 조이스틱(이동) + 우측탭(사격) + 스킬버튼(파이어볼/프로스트) + 타워바(타워 선택/배치) |

---

## 2단계: 브라우저 테스트 (Puppeteer)

### 테스트 환경
```
URL: file:///C:/Work/InfiniTriX/public/games/arcane-bastion/index.html
Browser: Chromium (Puppeteer)
Desktop: 800×600  |  Mobile: 375×667
```

### 테스트 결과

| 항목 | 결과 | 비고 |
|------|------|------|
| 페이지 로드 | ✅ PASS | 즉시 로드 성공 |
| 콘솔 에러 없음 | ✅ PASS | JavaScript 에러 0건 |
| 캔버스 렌더링 | ✅ PASS | offscreen 배경 + 바스티온 + 마법사 + 적 + HUD 정상 렌더링 |
| 시작 화면 표시 | ✅ PASS | "ARCANE BASTION" 타이틀 + 파티클 + "PRESS ENTER TO START" 표시 |
| 터치 이벤트 코드 존재 | ✅ PASS | touchstart/touchmove/touchend 핸들러 + 조이스틱 + 스킬 버튼 |
| 점수 시스템 | ✅ PASS | HUD에 Score 표시, 적 처치/웨이브 클리어 보너스 |
| localStorage 최고점 | ✅ PASS | `arcaneBastion_hi` 키로 저장/로드, try-catch 보호 |
| 게임오버/재시작 | ✅ PASS | HP 0 → GAMEOVER 전환 + 최고점 갱신 + "PRESS ENTER" 재시작 |
| 모바일 렌더링 | ✅ PASS | 375×667에서 반응형 렌더링 확인 (폰트, UI 비례 조정) |

### 스크린샷 결과

1. **타이틀 화면 (800×600)**: 배경 그리드 + 파티클 애니메이션 + 골드 바스티온 아이콘 + 타이틀 텍스트 + 글리치 효과 정상
2. **플레이 화면 (800×600)**: Wave 1/15, 슬라임 적 스폰, 바스티온(금성) + 마법사(보라 로브) + 룬 서클 + HUD(HP/마나/스코어) + 타워바 5종 정상 표시
3. **모바일 화면 (375×667)**: 세로 모드에서 반응형 렌더링, 폰트 크기 비례 축소, "TAP TO START" 모바일 분기 정상

---

## 에셋 로딩 검사

| 항목 | 결과 | 비고 |
|------|------|------|
| assets/ 디렉토리 | ✅ 삭제됨 | `ls` 결과 `No such file or directory` 확인 |
| assets/manifest.json | ✅ N/A | assets/ 디렉토리 자체가 없으므로 해당 없음 |
| SVG 파일 로딩 코드 | ✅ 없음 | `new Image`, `fetch()`, `.svg` 참조 코드 0건 |
| thumbnail.svg (루트) | ✅ 존재 | 4,314 bytes, 정상 SVG 파일 |
| 외부 리소스 | ⚠️ 참고 | Google Fonts CDN 1건 (Cinzel, 폰트 미로드 시 serif 폴백) |

---

## 구현 완성도 요약

### 핵심 시스템

| 시스템 | 상태 | 비고 |
|--------|------|------|
| 5상태 머신 (TITLE/PLAYING/UPGRADE/PAUSED/GAMEOVER) | ✅ 완성 | `beginTransition()` + `forceState()` |
| 15웨이브 시스템 | ✅ 완성 | 3바이옴(숲/동굴/화산), 웨이브별 스케일링 |
| 7종 일반 적 | ✅ 완성 | 슬라임/스켈레톤/스파이더/골렘/레이스/다크나이트/드래곤킨 개별 Canvas 드로잉 |
| 3종 보스 (W5/W10/W15) | ✅ 완성 | 크라운 장식 + 슬로우 모션 + 화면 흔들림 |
| 5종 타워 | ✅ 완성 | 아케인/화염(AOE)/냉기(슬로우)/번개(체인)/치유 |
| 3종 마법사 주문 | ✅ 완성 | 볼트/파이어볼/프로스트노바 |
| 로그라이크 업그레이드 (18종) | ✅ 완성 | 웨이브 클리어 후 3택 1 카드 UI |
| 업적 시스템 (10종) | ✅ 완성 | localStorage 저장 + 토스트 알림 |
| 오브젝트 풀 | ✅ 완성 | 파티클 80개 + 발사체 30개 |
| Web Audio 효과음 | ✅ 완성 | 14종 SFX (오실레이터 기반) |
| HUD | ✅ 완성 | HP/마나 바, 스코어, 웨이브/바이옴 표시, 적 잔여 수, 쿨다운 |
| 모바일 UI | ✅ 완성 | 조이스틱 + 스킬 버튼 + 타워 바 |

---

## 필수 수정 사항 (3회차)

### 🔴 Critical — 없음

> 게임 불가 수준의 버그가 없습니다.

### 🟡 Minor — 배포 가능하나 개선 권장 (5건)

1. **[MINOR-1]** 전역 `G` 직접 참조 4건 → 파라미터 `g`로 교체 (F3 완전 준수)
2. **[MINOR-2]** 적 색상/보스 수치 기획서 불일치 6건 → 기획서 §2.3 수치로 맞춤 (F7)
3. **[MINOR-3]** 마우스 단독 이동(드래그) 미구현 → §3.2 "마법사 드래그" 추가 (F21)
4. **[MINOR-4]** Google Fonts 외부 의존 → 폰트 인라인 또는 제거 고려
5. **[MINOR-5]** 웨이브별 적 수 산출 로직이 기획서 §2.2 명시 수치와 불일치 → 수식 조정 (F7)

---

## 최종 판정

| 구분 | 판정 |
|------|------|
| **코드 리뷰** | **NEEDS_MINOR_FIX** |
| **브라우저 테스트** | **PASS** |
| **종합 판정** | **NEEDS_MINOR_FIX** |

> **3회차 재리뷰 결과: 2회차까지의 모든 CRITICAL 문제(index.html 미존재, assets/ F1 위반, thumbnail 미존재)가 완벽히 해결되었습니다.** 게임은 타이틀→플레이→업그레이드→보스전→게임오버 전체 플로우가 작동하며, 모바일 터치 조작(조이스틱/스킬 버튼)도 구현되어 **즉시 배포 가능** 수준입니다. 남은 5건의 MINOR 이슈는 다음 패치에서 개선하면 충분합니다.
