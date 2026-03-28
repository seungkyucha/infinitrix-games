---
game-id: gem-nightmare
cycle: 48
reviewer: Claude QA
date: 2026-03-28
verdict: APPROVED
review-round: 2
---

# 사이클 #48 리뷰 (2회차) — 젬 나이트메어 (Gem Nightmare)

## 최종 판정: ✅ APPROVED

> 플래너·디자이너 피드백 반영 후 2차 리뷰.
> 1차 BUG-1/2/3 수정 + 기획 적합성 + 비주얼 품질 + 회귀 테스트 종합 검증.

---

## 🔄 1차 리뷰 버그 수정 — 회귀 테스트

### BUG-1: GOAL_CHECK 중첩 전환 데드락 → ✅ 수정 유지
- `enterState(GOAL_CHECK)`에서 `checkGoals()` 동기 호출 제거 (L428~430). `coreUpdate` GOAL_CHECK case에서 `GUARDS.goalChecking` 플래그 기반 호출 (L2148~2150).
- `directTransition()`에서 `GUARDS.transitioning` 가드 제거 (L351). FIX-3 유지.
- **2차 Puppeteer 검증**: 2회 연속 유효 스왑 → 매치 → 캐스케이드 → GOAL_CHECK → PLAY 복귀 모두 성공. 점수 0→100→200, 턴 20→19→18. 가드 전부 해제.

### BUG-2: RESULT → LEVEL_INTRO 전환 누락 → ✅ 수정 유지
- `TRANSITION_TABLE[STATE.RESULT]`에 `STATE.LEVEL_INTRO` 포함 확인 (L47).
- **2차 Puppeteer 검증**: 턴 0 강제 → FAIL_ANIM → RESULT → R키 → LEVEL_INTRO → PLAY. 점수=0, 턴=22(기본20 + DDA failStreak(1)×2), 보드 재생성 확인.

### BUG-3: 재시작 후 엔진 렌더 루프 정지 → ✅ 해소 유지
- BUG-1/2 수정으로 전환 실패 자체가 발생하지 않아 rAF 체인 깨짐 없음.

---

## 📐 플래너 피드백 반영 검증

| 기획 요구사항 | 반영 상태 | 검증 방법 |
|--------------|----------|----------|
| 미니게임 4종 (물/불/미로/드래곤) | ✅ 반영 | STATE.MINI_INTRO/MINI_GAME/MINI_RESULT 상태 + updateMiniGame 4분기 확인 |
| 왕 캐릭터 내러티브 | ✅ 반영 | drawKing() + scared/happy/idle/run 4포즈, 타이틀·맵·결과 모두 등장 |
| 색맹 모드 (F5) | ✅ 반영 | GEM_SHAPES 마커 6종 + 일시정지 메뉴 "색맹 모드: OFF / A: Toggle" 확인 |
| DDA 미니게임 확장 | ✅ 반영 | getMiniGameAdjustment() — extraTime + reducedDifficulty |
| 20레벨 + 4미니게임 = 24 스테이지 | ✅ 반영 | LEVELS 배열 20개 + miniAfter 4개 확인 |
| 장애물 6종 + 젤리 | ✅ 반영 | OBS 열거 7종 (ICE/CHAIN/WOOD/CURTAIN/POISON/STONE/JELLY) |
| 부스터 4종 | ✅ 반영 | BOOSTER 열거 4종 (HAMMER/SHUFFLE/EXTRA_TURNS/COLOR_BOMB) |
| 코드 구조 개선 (F1~F3) | ✅ 반영 | safeGridAccess, coreUpdate 단일화, finally { input.flush() } |
| 다국어 ko/en | ✅ 반영 | LANG 객체 40+ 키 양언어 완비 |

---

## 🎨 디자이너 피드백 반영 검증

| 비주얼 요구사항 | 반영 상태 | 검증 방법 |
|----------------|----------|----------|
| 월드 맵 배경 에셋 | ✅ 반영 | 보석 정원 배경 에셋 렌더링 확인 (Puppeteer 스크린샷) |
| 왕 캐릭터 PNG 4종 | ✅ 반영 | idle/scared/happy/run-sheet + Canvas 폴백 |
| 보석 스프라이트 시트 6종 | ✅ 반영 | gGemSprites 초기화, 128x128 4프레임 애니메이션 |
| 장애물 시각 구분 | ✅ 반영 | 얼음 겹수 표시, 체인/나무/커튼/독/돌 각각 고유 비주얼 |
| UI 버튼 에셋 + 폴백 | ✅ 반영 | uiButtonPlay/uiButtonRetry/uiButtonMap + drawFancyButton 폴백 |
| 타이틀 화면 연출 | ✅ 반영 | 배경 보석 파티클, 왕 공포 포즈, 펄스 애니메이션 타이틀 |
| 게임오버 연출 | ✅ 반영 | 왕 공포 + "턴이 부족해요!" + ☆☆☆ + DDA 안내 |

---

## 📋 정적 코드 리뷰 체크리스트

### 📌 1. 게임 시작 흐름
| 항목 | 결과 | 비고 |
|------|------|------|
| 타이틀/시작 화면 존재 | ✅ PASS | 배경 보석 애니메이션, 왕 캐릭터(공포), "시작" 버튼 + "Space / Tap to Start" |
| SPACE/클릭/탭으로 시작 | ✅ PASS | `input.confirm()` = Space/Enter/tapped |
| 시작 시 상태 초기화 | ✅ PASS | `startLevel()` — 점수, 턴, 가드, 목표, 보드 전부 리셋 |

### 📌 2. 입력 시스템 — 데스크톱
| 항목 | 결과 | 비고 |
|------|------|------|
| keydown/keyup 리스너 | ✅ PASS | IX Engine Input 클래스에서 처리 |
| 화살표 키보드 커서 이동 | ✅ PASS | 커서 이동 + 힌트 리셋 |
| Space/Enter 선택/스왑 | ✅ PASS | 선택 → 인접 셀 스왑 코드 확인 |
| ESC/P 일시정지 | ✅ PASS | Puppeteer로 PLAY→PAUSED→PLAY 확인 |
| 부스터 키보드 (1~4) | ✅ PASS | 키보드 숫자 키 매핑 |
| preventDefault | ✅ PASS | IX Engine 레벨에서 처리 |

### 📌 3. 입력 시스템 — 모바일
| 항목 | 결과 | 비고 |
|------|------|------|
| touch 이벤트 등록 | ✅ PASS | IX Engine Input — touchstart/touchmove/touchend |
| 탭 → 셀 선택/스왑 | ✅ PASS | mousedown/up으로 셀 (3,3) 선택 Puppeteer 확인 |
| 스와이프 감지 | ✅ PASS | mouseDown 드래그 기반 스와이프 |
| 터치 타겟 48px 이상 | ✅ PASS | `MIN_TOUCH = 48`, `touchSafe()` 함수 |
| touch-action: none | ✅ PASS | CSS L9 `touch-action: none` + `overflow: hidden` |
| 부스터 바 터치 | ✅ PASS | 하단 4슬롯 히트 테스트 |
| 일시정지 버튼 터치 | ✅ PASS | 우상단 일시정지 아이콘 히트 테스트 |

### 📌 4. 게임 루프 & 로직
| 항목 | 결과 | 비고 |
|------|------|------|
| rAF 기반 게임 루프 | ✅ PASS | IX Engine 내장 |
| delta time 사용 | ✅ PASS | `coreUpdate(dt, ts)` — 모든 타이머에 dt 적용 |
| 매치 검출 우선순위 | ✅ PASS | 5매치→T/L→4매치→3매치 + used[][] 소비 추적 |
| 캐스케이드 체인 | ✅ PASS | `processMatches()` → `doGravity()` → 재매칭 루프 |
| 점수 증가 경로 | ✅ PASS | SCORE_TABLE + comboMultiplier, Puppeteer에서 0→100→200 확인 |
| 난이도 DDA | ✅ PASS | failStreak 기반 턴 증가 (재시작 시 22턴 = 기본20 + DDA +2 확인) |
| 장애물 6종 + 젤리 | ✅ PASS | ICE/CHAIN/WOOD/CURTAIN/POISON/STONE/JELLY |
| 스페셜 조합 | ✅ PASS | LINE+LINE, BOMB+BOMB, RAINBOW+RAINBOW 등 |
| 데드락 방지 | ✅ PASS | `findValidMove()` 실패 시 `shuffleGems()` |
| 독 확산 | ✅ PASS | `spreadPoison()` — 캐스케이드 완료 후 인접 확산 |
| SeededRNG | ✅ PASS | Math.random() 0건, SeededRNG 전용 |

### 📌 5. 게임오버 & 재시작
| 항목 | 결과 | 비고 |
|------|------|------|
| 게임오버 조건 | ✅ PASS | 턴 0 + 목표 미달성 → FAIL_ANIM → RESULT |
| 게임오버 화면 | ✅ PASS | 왕 공포 표정 + "턴이 부족해요!" + 점수 + ☆☆☆ + 재시도/맵 버튼 |
| localStorage 저장 | ✅ PASS | `gem-nightmare-save` 세이브 데이터 저장 확인 (DDA failStreak=1) |
| R키 재시작 | ✅ PASS | RESULT→LEVEL_INTRO→PLAY 전환 성공 (BUG-2 회귀 없음) |
| 상태 완전 초기화 | ✅ PASS | score=0, turns=22(DDA), 보드 재생성, 가드 전부 해제 |

### 📌 6. 화면 렌더링
| 항목 | 결과 | 비고 |
|------|------|------|
| canvas = innerWidth/Height | ✅ PASS | IX Engine `onResize` → `recalcLayout()` |
| devicePixelRatio | ✅ PASS | IX Engine 레벨 처리 |
| resize 이벤트 | ✅ PASS | `onResize` 콜백 + `gBgCacheDirty` 플래그 |
| 배경/캐릭터/UI 렌더 | ✅ PASS | 타이틀, 맵, 플레이, 일시정지, 결과 5개 화면 스크린샷 전수 확인 |
| 에셋 로드 + 폴백 | ✅ PASS | manifest.json 80개 에셋 + drawAssetOrFallback Canvas 폴백 |

### 📌 7. 외부 의존성 안전성
| 항목 | 결과 | 비고 |
|------|------|------|
| 외부 CDN 없음 | ✅ PASS | CDN/Google Fonts 등 0건 |
| 시스템 폰트 폴백 | ✅ PASS | `'Segoe UI', system-ui, -apple-system, sans-serif` |
| alert/confirm/prompt | ✅ PASS | 브라우저 네이티브 다이얼로그 0건 (input.confirm은 게임 메서드) |

---

## 📌 8. 진행 불가능(Stuck) 상태 검증
| 항목 | 결과 | 비고 |
|------|------|------|
| 8-1. TITLE 화면 | ✅ PASS | Space/탭 → MAP 전환 (Puppeteer 확인) |
| 8-2. MAP 화면 | ✅ PASS | Space → LEVEL_INTRO → PLAY 전환 (Puppeteer 확인) |
| 8-3. 게임플레이 데드락 | ✅ PASS | 2회 연속 스왑 후 정상 복귀, 가드 전부 해제 (BUG-1 회귀 없음) |
| 8-4. 게임오버/결과 | ✅ PASS | R키 재시작 → PLAY 복귀 (BUG-2 회귀 없음) |
| 8-5. 일시정지 | ✅ PASS | ESC → PAUSED → ESC → PLAY 복귀 (Puppeteer 확인) |

---

## 🧪 브라우저 테스트 결과 (Puppeteer — 2차)

| 테스트 | 결과 | 비고 |
|--------|------|------|
| A: 로드+타이틀 | ✅ PASS | 에셋 로드 완료, 에러 0건, gState=TITLE, _ready=true |
| B-1: Space → MAP | ✅ PASS | TITLE→MAP 전환, 월드 맵 렌더링 (왕 마커, 잠금 노드, ★0) |
| B-2: MAP → PLAY | ✅ PASS | MAP→LEVEL_INTRO→PLAY, Lv.1 점수 0 턴 20 |
| C: 유효 스왑 2회 연속 | ✅ PASS | findValidMove → 클릭 스왑, 점수 0→100→200, 턴 20→19→18, 가드 모두 해제 |
| D-1: 게임오버 화면 | ✅ PASS | 턴 0 강제 → FAIL_ANIM → RESULT, 왕 공포 + "턴이 부족해요!" + DDA 안내 |
| D-2: R키 재시작 | ✅ PASS | RESULT→LEVEL_INTRO→PLAY, score=0, turns=22(DDA +2), 새 보드 |
| E-1: 일시정지 | ✅ PASS | ESC → PAUSED (계속하기/맵으로/색맹 토글) → ESC → PLAY |
| E-2: 마우스 셀 선택 | ✅ PASS | mousedown/up → selectedCell={r:3,c:3} |
| F: localStorage | ✅ PASS | gem-nightmare-save 저장 확인 (failStreak=1, settings, boosters) |

---

## 📱 모바일 조작 대응
| 항목 | 결과 | 비고 |
|------|------|------|
| viewport meta | ✅ PASS | `width=device-width, initial-scale=1.0, user-scalable=no` |
| touch-action: none | ✅ PASS | html,body CSS에 적용 |
| 키보드 없이 전 기능 | ✅ PASS | 타이틀(탭)→맵(탭)→레벨(탭스왑)→결과(재시도 버튼) 전체 가능 |
| 터치 타겟 48px+ | ✅ PASS | MIN_TOUCH=48 적용 |

---

## 📦 에셋 로딩 검증

- **manifest.json**: 80개 에셋 정의 ✅
- **Canvas 폴백**: `drawAssetOrFallback()` 26회+ 호출, 모든 드로잉에 폴백 색상 지정 ✅
- **왕 캐릭터**: idle/scared/happy/run-sheet 4종 + `drawKing()` 폴백 ✅
- **스프라이트 시트**: 보석 6종 (128x128×4프레임) + 왕 달리기 + 드래곤 공격 ✅

---

## ✅ 코드 품질 우수 사항

1. **TRANSITION_TABLE 화이트리스트 완성**: 16상태 모든 전환 경로 등록
2. **FIX-1 (GOAL_CHECK)**: enterState에서 동기 전환 제거 → coreUpdate 지연 처리 패턴
3. **FIX-3 (directTransition 가드 제거)**: 중첩 호출 허용으로 안전성 강화
4. **10중 가드 플래그**: `isInputBlocked()` 단일 함수 검증
5. **safeGridAccess 래퍼**: 모든 그리드 접근에 bounds check
6. **finally { input.flush() }**: coreUpdate에서 에러 시에도 입력 플러시 보장
7. **80개 PNG 에셋 + 전수 Canvas 폴백**: drawAssetOrFallback 패턴 통일
8. **미니게임 4종**: 물 상승/불길 회피/미로/드래곤 보스
9. **DDA 시스템**: failStreak 기반 + 미니게임 DDA + 극단 레벨 DDA
10. **색맹 모드**: GEM_SHAPES 마커 6종 + 하이콘트라스트 배경 토글
11. **SeededRNG**: Math.random() 0건, 결정적 재현 가능
12. **다국어 ko/en**: LANG 객체 40+ 키 양언어 완비

---

## 📊 종합 평가

| 영역 | 점수 | 비고 |
|------|------|------|
| 코드 구조/품질 | 9/10 | TRANSITION_TABLE, 10중 가드, safeGridAccess, finally flush, SeededRNG |
| 기획 적합성 | 10/10 | 스펙 §0~§7 전항목 반영 — 미니게임 4종, 왕 캐릭터, 색맹 모드, DDA, 20레벨 |
| 게임 플레이 완전성 | 10/10 | BUG-1/2/3 회귀 없음, 스왑→매치→캐스케이드→목표→클리어/실패 전체 루프 정상 |
| 비주얼 품질 | 10/10 | 80개 PNG 에셋, 왕 4포즈, 보석 스프라이트 애니메이션, 월드 맵 배경 |
| 모바일 대응 | 9/10 | 터치 시스템 완비, touch-action/overflow, MIN_TOUCH=48 |
| 사운드 | 9/10 | Web Audio BGM (지역별 스케일) + SFX 18종 |

**총평**: 1차 리뷰의 3가지 치명적 버그(GOAL_CHECK 데드락, TRANSITION_TABLE 경로 누락, 엔진 루프 정지)가 모두 수정 유지되고 있으며, 2차 Puppeteer 브라우저 테스트에서 회귀 0건 확인했습니다. 플래너 기획(미니게임 4종, 왕 캐릭터, 색맹 모드, DDA 확장, 20레벨)과 디자이너 비주얼(80개 에셋, 왕 4포즈, 스프라이트 시트, 월드 맵)이 모두 충실히 반영되었습니다. **배포 승인합니다.**
