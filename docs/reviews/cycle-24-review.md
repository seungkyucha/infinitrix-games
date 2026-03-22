---
game-id: abyss-keeper
cycle: 24
round: 2
sub-round: 2
date: 2026-03-22
reviewer: claude-reviewer
verdict: APPROVED
code-review: APPROVED
browser-test: PASS
---

# 사이클 #24 2차 리뷰 2회차 — 어비스 키퍼 (Abyss Keeper)

## 요약

2차 리뷰 1회차에서 지적한 **P1 B3(assets/ F1 위반)**과 **P1 B5(Google Fonts F2 위반)** 2건이 모두 정확하게 수정되었습니다. 기존에 수정 확인된 B1(RESTART_ALLOWED), B2(transObj), B4(WPN 터치)도 회귀 없이 유지됩니다. 모든 이슈가 해소되어 **즉시 배포 가능** 상태입니다.

---

## 이전 지적 사항 수정 반영 현황

### 1차 리뷰 지적 (Round 1)

| # | 버그 | 심각도 | 수정 여부 | 검증 내용 |
|---|------|--------|-----------|-----------|
| B1 | RESTART_ALLOWED 누락 | P0 | ✅ 수정됨 (R1→R2) | line 126: 8개 상태 포함 — puppeteer 런타임 확인 완료 |
| B2 | transAlpha 미연결 | P1 | ✅ 수정됨 (R1→R2) | line 288: `transObj = { v: 0 }`, line 380-385: tween, line 2883: render |
| B4 | WPN 터치 48px 미달 | P2 | ✅ 수정됨 (R1→R2) | line 2076: `Math.max(CFG.TOUCH_MIN / 2, btnR * 0.8)` |

### 2차 리뷰 1회차 지적 (Round 2-1)

| # | 버그 | 심각도 | 수정 여부 | 검증 내용 |
|---|------|--------|-----------|-----------|
| B3 | assets/ F1 위반 | P1 | ✅ **수정됨** | `ASSET_MAP`, `SPRITES`, `preloadAssets()` 코드 완전 삭제. `assets/` 디렉토리에 `manifest.json`+`thumbnail.svg`만 존재 (플랫폼 필수 파일). puppeteer 런타임에서 `typeof ASSET_MAP === 'undefined'`, `typeof SPRITES === 'undefined'` 확인 |
| B5 | Google Fonts CDN F2 위반 | P1 | ✅ **수정됨** | `<link>` 태그 2줄 완전 삭제. FONT/FONT_TITLE에서 외부 폰트명 제거 → 시스템 폰트만 사용. puppeteer에서 `externalLinks: []` 확인. 단, line 148 주석 "Google Fonts with fallback"이 잔존 (P3, 기능 무관) |

---

## 게임 플레이 완전성 검증 (📌 1~7)

### 📌 1. 게임 시작 흐름

| 항목 | 결과 | 비고 |
|------|------|------|
| 타이틀/시작 화면 존재 | ✅ PASS | 등대 실루엣 + 바이올루미네센스 애니메이션 + 한/EN 전환 |
| SPACE/클릭/탭으로 시작 | ✅ PASS | SPACE/Enter → DIFF_SELECT |
| 시작 시 초기화 | ✅ PASS | `startNewGame()` 전체 상태 리셋 |

**판정: PASS**

### 📌 2. 입력(조작) 시스템 — 데스크톱

| 항목 | 결과 | 비고 |
|------|------|------|
| keydown/keyup 리스너 | ✅ PASS | `initInput()` |
| WASD/화살표 이동 | ✅ PASS | 방향 정규화 + 경계 클램핑 |
| 공격키 (Space, E) | ✅ PASS | 3종 무기, 1/2/3 변경 |
| 일시정지 (ESC) | ✅ PASS | CASUAL/ACTION/BOSS_FIGHT → PAUSE |

**판정: PASS**

### 📌 3. 입력(조작) 시스템 — 모바일

| 항목 | 결과 | 비고 |
|------|------|------|
| touchstart/move/end | ✅ PASS | passive:false 적용 |
| 가상 조이스틱 렌더링 | ✅ PASS | `drawTouchControls()` 좌측 조이스틱 |
| 터치→게임로직 연결 | ✅ PASS | 조이스틱 → dx/dy → 플레이어 이동 |
| 터치 타겟 48px+ | ✅ PASS | ATK/Q 56px, WPN `Math.max(24, ...)` → 48px+ 보장 |
| 스크롤 방지 | ✅ PASS | `touch-action:none; overflow:hidden` |

**판정: PASS**

### 📌 4. 게임 루프 & 로직

| 항목 | 결과 | 비고 |
|------|------|------|
| requestAnimationFrame | ✅ PASS | `gameLoop()` 재귀 호출 |
| delta time 처리 | ✅ PASS | `dt = Math.min((timestamp - lastTime) / 1000, 0.05)` — 50ms 캡 |
| 충돌 감지 | ✅ PASS | `Math.hypot` 거리 기반 |
| 점수 증가 경로 | ✅ PASS | 낚시, 드리프트, 몬스터, 보스, 조수 보너스 |
| 난이도 변화 | ✅ PASS | 3단계 선택 + 동적 난이도 조정 |

**판정: PASS**

### 📌 5. 게임 오버 & 재시작

| 항목 | 결과 | 비고 |
|------|------|------|
| 게임 오버 조건 | ✅ PASS | `lighthouse.hp <= 0` → GAMEOVER |
| 게임 오버 화면 | ✅ PASS | 점수, 조수, 최고 점수 표시 |
| localStorage 저장 | ✅ PASS | `saveRun()` — F8 패턴 |
| R키/탭 재시작 | ✅ PASS | R/Space → TITLE |
| 조수 진행 | ✅ PASS | TIDE_RESULT → CASUAL_PHASE 전환 정상 |
| 완전 초기화 | ✅ PASS | `startNewGame()` 전체 리셋 |

**판정: PASS**

### 📌 6. 화면 렌더링

| 항목 | 결과 | 비고 |
|------|------|------|
| canvas 크기 설정 | ✅ PASS | `window.innerWidth/Height` 사용 |
| devicePixelRatio | ✅ PASS | `dpr = window.devicePixelRatio || 1` |
| resize 이벤트 | ✅ PASS | `resizeCanvas` 등록 |
| 배경/캐릭터/UI 렌더링 | ✅ PASS | 스크린샷 확인 — 등대, 바이올루미네센스, 파도 정상 |
| 전환 효과 | ✅ PASS | `transObj.v` 기반 페이드 정상 |

**판정: PASS**

### 📌 7. 외부 의존성 안전성

| 항목 | 결과 | 비고 |
|------|------|------|
| 외부 CDN 없음 | ✅ **PASS** | Google Fonts `<link>` 삭제 확인 — F2 준수 |
| 폰트 폴백 | ✅ PASS | 시스템 폰트 전용 체인 |
| 단일 파일 원칙 (F1) | ✅ **PASS** | ASSET_MAP/SPRITES/preloadAssets 삭제, assets/ 내 플랫폼 파일만 존재 |
| eval/alert 없음 | ✅ PASS | 보안 위반 0건 |

**판정: ✅ PASS (B3, B5 모두 해결)**

---

## 브라우저 테스트 결과

| 항목 | 결과 | 비고 |
|------|------|------|
| 페이지 로드 | ✅ PASS | 정상 로드 |
| 콘솔 에러 없음 | ✅ PASS | JavaScript 에러 0건 |
| 캔버스 렌더링 | ✅ PASS | 800×600, dpr 적용 |
| 시작 화면 표시 | ✅ PASS | 등대 실루엣 + 타이틀 + 바이올루미네센스 + 한/EN 버튼 |
| 터치 이벤트 코드 | ✅ PASS | touchstart/touchmove/touchend 등록 |
| 점수 시스템 | ✅ PASS | 다중 경로 점수 증가 |
| localStorage 최고점 | ✅ PASS | saveRun() + loadSave() |
| 게임오버/재시작 | ✅ PASS | RESTART_ALLOWED 8개 상태 완전 |
| 외부 리소스 | ✅ PASS | externalLinks: [] — CDN/폰트 0건 |
| assets 참조 | ✅ PASS | ASSET_MAP/SPRITES undefined 확인 |

---

## 회귀 테스트

| 항목 | 결과 | 비고 |
|------|------|------|
| TITLE 렌더링 | ✅ 유지 | 등대 + 바이올루미네센스 정상 (assets 제거 후에도 Canvas 드로잉 정상) |
| DIFF_SELECT 전환 | ✅ 유지 | SPACE/탭 → 난이도 선택 정상 |
| 조이스틱+버튼 배치 | ✅ 유지 | 좌측 조이스틱, 우측 ATK/Q/WPN |
| 점수/세이브 로직 | ✅ 유지 | F8 패턴 유지 |
| 16개 상태 전환 | ✅ 유지 | STATE_PRIORITY + RESTART_ALLOWED 정상 |
| 보안 (eval/alert 없음) | ✅ 유지 | eval(), alert(), confirm(), prompt() 0건 |
| DOM 접근 최소화 | ✅ 유지 | init 시 할당 후 프레임 내 추가 접근 없음 |
| 전환 페이드 효과 | ✅ 유지 | transObj.v 기반 렌더링 정상 |

**회귀 판정: PASS — 기존 기능 깨짐 없음**

---

## 코드 품질 체크리스트

| 항목 | 결과 |
|------|------|
| □ 기능 완성도 | ✅ 기획서 기능 전부 구현 |
| □ 게임 루프 | ✅ rAF + dt 캡 |
| □ 메모리 | ✅ ObjectPool 패턴 |
| □ 충돌 감지 | ✅ Math.hypot 거리 기반 |
| □ 모바일 | ✅ 조이스틱 + 터치 버튼 (48px+ 보장) |
| □ 게임 상태 | ✅ 16개 상태 전환 정상 |
| □ 점수/최고점 | ✅ localStorage 완전 구현 |
| □ 보안 | ✅ eval() 없음, XSS 없음 |
| □ 성능 | ✅ 프레임당 DOM 접근 없음 |

---

## 미세 사항 (P3 — 수정 권장, 배포 차단 아님)

1. **line 148 주석**: `"Google Fonts with fallback"` → 실제로는 시스템 폰트만 사용. 주석을 `"System font stack"` 등으로 변경 권장.

---

## 우수한 점

1. **전 버그 해결**: B1(P0)→B2(P1)→B3(P1)→B4(P2)→B5(P1) 총 5건 모두 수정 완료
2. **F1/F2 플랫폼 규정 완전 준수**: 외부 에셋/CDN/폰트 0건
3. **16개 게임 상태**의 이중 페이즈 시스템 체계적 구현
4. **SeededRNG** 기반 프로시저럴 콘텐츠 + 동적 난이도 조정
5. **ACTIVE_SYSTEMS 매트릭스** (F7) 16×12 완전 정의
6. **F8 패턴** (판정 먼저, 저장 나중) 유지
7. 비주얼 품질 우수 — 바이올루미네센스 파티클, 등대 조명, 파도 애니메이션
8. Canvas 전용 드로잉으로 assets 제거 후에도 렌더링 품질 유지

---

## 최종 판정

### 코드 리뷰: **APPROVED**
### 테스트: **PASS**

**사유**: 1차 리뷰(B1, B2, B4) + 2차 리뷰 1회차(B3, B5) 총 5건의 지적 사항이 모두 정확하게 수정되었습니다. 회귀 없음 확인. 플랫폼 규정(F1~F15) 완전 준수. 즉시 배포 가능합니다.

### 수정 필수 항목 (0건):
_(없음)_

### 수정 권장 항목 (1건):
1. **[P3]** line 148 주석 "Google Fonts with fallback" → "System font stack"으로 변경
