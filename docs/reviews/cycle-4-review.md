---
verdict: APPROVED
game-id: ink-maiden
cycle: 4
reviewRound: 2
date: 2026-04-19
buttons:
  - name: "Easy / 쉬움"
    scene: TITLE
    keys: [Digit1]
    size: 220x56
    hitTest: PASS
    minSize: PASS
    keyboard: PASS
    onClick: PASS
  - name: "Normal / 보통"
    scene: TITLE
    keys: [Digit2]
    size: 220x56
    hitTest: PASS
    minSize: PASS
    keyboard: PASS
    onClick: PASS
  - name: "Hard / 어려움"
    scene: TITLE
    keys: [Digit3]
    size: 220x56
    hitTest: PASS
    minSize: PASS
    keyboard: PASS
    onClick: PASS
  - name: "Resume"
    scene: PAUSE
    keys: [Escape, KeyP, Space, Enter]
    size: 200x52
    hitTest: PASS
    minSize: PASS
    keyboard: PASS
    onClick: PASS
  - name: "Title"
    scene: PAUSE
    keys: [KeyT]
    size: 200x52
    hitTest: PASS
    minSize: PASS
    keyboard: PASS
    onClick: PASS
  - name: "Continue"
    scene: ABILITY
    keys: [Space, Enter]
    size: 160x52
    hitTest: PASS
    minSize: PASS
    keyboard: PASS
    onClick: PASS
  - name: "Restart (Savepoint)"
    scene: GAMEOVER
    keys: [KeyR, Space, Enter]
    size: 220x52
    hitTest: PASS
    minSize: PASS
    keyboard: PASS
    onClick: PASS
  - name: "Title"
    scene: GAMEOVER
    keys: [Escape]
    size: 220x52
    hitTest: PASS
    minSize: PASS
    keyboard: PASS
    onClick: PASS
  - name: "Play Again"
    scene: ENDING
    keys: [Space, Enter]
    size: 220x52
    hitTest: PASS
    minSize: PASS
    keyboard: PASS
    onClick: PASS
  - name: "Title"
    scene: ENDING
    keys: [Escape]
    size: 220x52
    hitTest: PASS
    minSize: PASS
    keyboard: PASS
    onClick: PASS
  - name: "◀ (터치 D-pad)"
    scene: PLAY-mobile
    keys: []
    size: 56x56
    hitTest: PASS
    minSize: PASS
    keyboard: "N/A (입력 프록시)"
    onClick: PASS
  - name: "▶ (터치 D-pad)"
    scene: PLAY-mobile
    keys: []
    size: 56x56
    hitTest: PASS
    minSize: PASS
    keyboard: "N/A (입력 프록시)"
    onClick: PASS
  - name: "A (점프)"
    scene: PLAY-mobile
    keys: []
    size: 56x56
    hitTest: PASS
    minSize: PASS
    keyboard: "N/A (입력 프록시)"
    onClick: PASS
  - name: "B (공격)"
    scene: PLAY-mobile
    keys: []
    size: 48x48
    hitTest: PASS
    minSize: PASS
    keyboard: "N/A (입력 프록시)"
    onClick: PASS
  - name: "DASH"
    scene: PLAY-mobile
    keys: []
    size: 48x48
    hitTest: PASS
    minSize: PASS
    keyboard: "N/A (입력 프록시)"
    onClick: PASS
  - name: "| | (일시정지-모바일)"
    scene: PLAY-mobile
    keys: [Escape]
    size: 48x48
    hitTest: PASS
    minSize: PASS
    keyboard: PASS
    onClick: PASS
---

# Cycle 4 리뷰 (2차): 잉크 메이든 (ink-maiden)

## 판정: ✅ APPROVED

> 2차 리뷰 — 플래너/디자이너 피드백 반영 후 재검토.
> 1차 리뷰(2026-04-18)에서 APPROVED 판정. 1차 피드백의 LOW 우선순위 3건은 비필수 권장사항.

---

## 0단계: 1차 피드백 교차 확인

1차 리뷰(cycle-4-feedback.md)는 **APPROVED** 판정이었으며, HIGH 항목 0건.
LOW 항목 3건(에셋 포맷 혼재, thumbnail manifest, 모바일 세로 모드)은 비필수 권장사항으로 수정 의무 없음.

| # | 1차 피드백 항목 | 우선순위 | 2차 확인 결과 |
|---|--------------|---------|-------------|
| 1 | 에셋 포맷 혼재 (PNG+SVG) | LOW | 유지 — 게임 스케일에서 무영향 |
| 2 | thumbnail manifest 미등록 | LOW | 유지 — 플랫폼 사이드바 표시에만 영향 |
| 3 | 모바일 세로 모드 빈 공간 | LOW | 유지 — 가로 게임이므로 수용 가능 |

> ✅ HIGH 항목 없음 → 교차 확인 통과

---

## 📌 A. IX Engine 준수

| 항목 | 결과 | 비고 |
|------|------|------|
| A-1. IX.GameFlow / IX.Scene / IX.Button 사용 | ✅ PASS | GameFlow.init + Scene.register 7개 씬(TITLE/PLAY/PAUSE/ABILITY/GAMEOVER/ENDING + 내부 BOSS) |
| A-2. Scene.setTimeout만 사용 | ✅ PASS | raw setTimeout/setInterval/addEventListener 0건. Scene.setTimeout 4곳(L1090, L1091, L1400, L1515) |
| A-3. manifest art-style 팔레트 반영 | ✅ PASS | COL 객체에 7색 팔레트 매핑. 전체 렌더링에 일관 적용 |

---

## 📌 B. 버튼 3방식 동작

### UI 버튼 (10개) — 전원 PASS

모든 UI 버튼이 다음을 충족:
- **B-1 hitTest**: IX.Button 내장 hitTest 사용 ✅
- **B-2 최소 크기**: 모두 ≥48px (Math.max(48, ...) 가드) ✅
- **B-3 키보드 단축키**: 모두 key 배열 지정 ✅
- **B-4 onClick 상태 변경**: Scene.transition() 또는 GameFlow 호출 ✅

### 모바일 터치 프록시 버튼 (6개) — 면제 판정

터치 프록시 버튼(◀/▶/점프/공격/대시)은 `input.isMobile` 조건에서만 생성. 데스크톱에서는 키보드 input.held()/jp()로 직접 처리. 일시정지 모바일 버튼은 key=['Escape'] 등록됨.

---

## 📌 C. 재시작 3회 연속 검증

### resetGameState() 변수 초기화 점검

| 카테고리 | 초기화 변수 | 결과 |
|---------|-----------|------|
| 위치/물리 | player.{x,y,vx,vy,grounded,facing,prevX,prevY} | ✅ |
| HP/전투 | player.{hp,maxHp,attacking,attackTimer,attackCd,invincible,hurtTimer} | ✅ |
| 대시 | player.{dashing,dashTimer,dashCd} | ✅ |
| 점프 | player.{airJumps,maxAirJumps,wallSliding,wallDir} | ✅ |
| 능력 | abilities {dash,doublejump,wallclimb} = false | ✅ |
| 점수 | score=0, deaths=0, secretRoomsFound=0, gameTime=0 | ✅ |
| 맵/존 | roomId='f0', lastSaveRoom='f0', lastSaveSpawn | ✅ |
| 배열 | enemies=[], items=[], bosses=[], projectiles=[] | ✅ |
| Set | bossDefeated=new Set(), visitedRooms=new Set(), noDamageBoss=new Set() | ✅ |
| 이펙트 | activeEffects.length=0 | ✅ |
| 맵 원본 | ROOMS 맵 _origMap 복원 (breakwall 편집 리셋) | ✅ |
| 터치 | touchMoveDir=0, mobileJumpPressed/AttackPressed/DashPressed=false | ✅ |
| UI | inputDelay=0.2, shakeIntensity=0, resumingFromPause=false | ✅ |

### 3회 사이클 Puppeteer 실행 결과

| 사이클 | 경로 | HP | score | deaths | abilities | errors |
|--------|------|-----|-------|--------|-----------|--------|
| 1 | GAMEOVER→부활→PLAY | 5 | 0 | 2 | 전부 false | 0 |
| 2 | GAMEOVER→부활→PLAY | 5 | 0 | 3 | 전부 false | 0 |
| 3 | GAMEOVER→TITLE→Digit2→PLAY | 5 | 0 | 0 | 전부 false | 0 |

> ✅ **3회 사이클 완전 통과.** TITLE 경유 시 전체 리셋(deaths=0, score=0), 부활 시 부분 리셋(HP 회복, deaths 누적) 모두 정상.

---

## 📌 D. 스팀 인디 수준 플레이 완성도

| 항목 | 결과 | 비고 |
|------|------|------|
| D-1. 핵심 루프 30초 내 재미 | ✅ PASS | 이동→적 전투→아이템→방 탐험→보스 트리거 |
| D-2. 승리/패배 조건 명확 | ✅ PASS | 승리: 4보스 처치→ENDING. 패배: HP=0→GAMEOVER |
| D-3. 점수/진행도 피드백 | ✅ PASS | HP 하트, 금색 점수, 능력 아이콘, 보스 HP바, PopupText, 미니맵 |
| D-4. 사운드 이펙트 | ✅ PASS | sound.sfx: jump/dash/hit/score/gameover/select/explosion/powerup + tone() |
| D-5. 파티클/트윈 연출 | ✅ PASS | 공격/대시/피격/사망/치유/능력획득 파티클 + 스크린셰이크 |

---

## 📌 E. 스크린 전환 + Stuck 방어

| 항목 | 결과 | 비고 |
|------|------|------|
| E-1. 에셋 10초 타임아웃 → TITLE 진행 | ✅ PASS | `assets.load(assetMap, { timeoutMs: 10000 })` + fallback 도형 렌더 |
| E-2. StateGuard 기본 활성화 | ✅ PASS | `GameFlow.init({ stuckMs: 45000 })` |
| E-3. TITLE/GAMEOVER에서 입력 → PLAY | ✅ PASS | TITLE: Digit1/2/3, GAMEOVER: R/Space/Enter(부활) + Escape(타이틀) |
| E-4. PLAY → GAMEOVER 도달 가능 | ✅ PASS | 적/가시/보스 피격 → HP=0 → hurtPlayer → Scene.transition('GAMEOVER') |

---

## 📌 F. 입력 시스템

| 항목 | 결과 | 비고 |
|------|------|------|
| F-1. IX.Input 사용, 자체 리스너 없음 | ✅ PASS | addEventListener 0건. input.held()/jp()/tapped 사용 |
| F-2. 엔진 내장 좌표 변환 | ✅ PASS | IX.Input 캔버스 좌표 변환 사용 |
| F-3. 씬 전환 200ms 입력 무시 | ✅ PASS | inputDelay=0.2 매 전환마다 설정 |

---

## 📌 G. 에셋 일관성

| 항목 | 결과 | 비고 |
|------|------|------|
| G-1. art-style 일관성 | ✅ PASS | 잉크 선화 + 수채화 채움 스타일 전체 통일. 배경/캐릭터/적/아이템/UI 일관 |
| G-2. 캐릭터 변형 동일 인물 | ✅ PASS | player.png 기준 — 파란 머리/하얀 원피스/붓. 모든 변형 동일 디자인 유지 |
| G-3. 외부 CDN 의존 없음 | ✅ PASS | googleapis/fonts.google/cloudflare 등 0건 |
| G-4. alert/confirm/prompt 없음 | ✅ PASS | 0건 |

---

## 브라우저 테스트 결과 요약 (Puppeteer)

| 테스트 | 결과 | 비고 |
|--------|------|------|
| A: 로드+타이틀 | ✅ PASS | 종이 텍스처 배경, 제목("잉크 메이든"/INK MAIDEN), 난이도 버튼 3개 |
| B: 게임 시작 (Digit2) | ✅ PASS | TITLE→PLAY, HP=5, 잉크 숲 f0, 에러 0건 |
| C: 이동+점프+공격 | ✅ PASS | 위치 변화 확인, 공격 판정+적 충돌 정상 |
| D: 게임오버+부활 | ✅ PASS | HP=0→GAMEOVER→R→PLAY, HP 복원, deaths 누적 |
| E: 일시정지+미니맵 | ✅ PASS | PAUSED 화면, 미니맵 방 노드/연결/보스 표시, Resume/Title 버튼 |
| F: 보스전+능력획득 | ✅ PASS | inkwolf 페이즈2 전환, dash 능력 획득, score +1200 |
| G: 엔딩 화면 | ✅ PASS | VICTORY!, GRADE:B, 시간/비밀/사망/노데미지 보너스, NEW HIGH SCORE |
| H: 3회 재시작 | ✅ PASS | 변수 누수 0건, JS 에러 0건 |

---

## 2차 리뷰 추가 확인사항

### 플래너 피드백 반영 여부
- ✅ 4개 영역(잉크 숲/수묵 동굴/먹물 성/어둠의 방) + 5개 비밀방 — 기획서 준수
- ✅ 3개 능력(대시/이중점프/벽타기) — 순차 해금 + 맵 진행 차단 로직 정상
- ✅ 4개 보스(inkwolf/sumispider/inkknight/darkbrush) — 각각 2페이즈 패턴 구현
- ✅ 3단계 난이도(HP/적 배율/무적시간/드롭률/세이브포인트 간격) — 기획서 매핑 정확
- ✅ 점수+등급(S/A/B/C) + 시간보너스/비밀방보너스/노데미지보너스 — 완전 구현

### 디자이너 피드백 반영 여부
- ✅ 핸드드로우 잉크 선화 + 수채화 에셋 — Hollow Knight/Cuphead 느낌 일관
- ✅ 7색 팔레트(inkBlack/paperIvory/waterBlue/waterRed/waterGreen/waterPurple/inkGold) 엄수
- ✅ 패럴렉스 배경 3레이어(far/mid/ground) — 영역별 분위기 차별화
- ✅ 어둠의 방: 라디얼 그라데이션으로 플레이어 주변만 밝히는 특수 연출
- ✅ 보스 페이즈2 시각 변화: 빨간/보라 파티클 폭발 + 스크린셰이크

### 회귀 테스트
- ✅ 기존 기능 깨짐 없음 — 모든 1차 PASS 항목 재확인 완료
- ✅ JS 에러 0건 유지
- ✅ 3회 재시작 안정성 유지

---

## 권장 개선사항 (비필수, 이전과 동일)

1. **에셋 포맷 통일** (LOW): player 변형 SVG↔PNG 혼재. 게임 스케일에서 무영향이나 통일 권장
2. **모바일 세로 모드** (LOW): 가로 게임 특성상 세로에서 빈 공간. 가로 모드 유도 고려
3. **thumbnail manifest** (LOW): thumbnail 항목 추가 시 플랫폼 사이드바 표시 자동화

---

## 결론

잉크 메이든은 2차 리뷰에서도 모든 검증 항목을 통과했습니다. 1차 APPROVED 판정에서 변경된 코드 없이 안정성이 유지되고 있으며, 기획서의 메트로배니아 핵심 요소(4영역+4보스+3능력+비밀방+난이도3단계+점수등급)가 완전히 구현되어 있습니다. 핸드드로우 수채화 에셋의 품질과 일관성이 우수하며, IX 엔진 API를 정확히 활용한 안정적인 코드베이스입니다.

**Cycle 4 — 2차 리뷰 최종 판정: ✅ APPROVED**
