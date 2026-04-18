---
name: mobile-audit
description: 게임이 모바일에서 완전히 플레이 가능한지 체계적으로 검증. 리뷰어 📌 H 항목에서 필수 호출. 키보드 없이 TITLE→PLAY→GAMEOVER→RESTART 전 플로우가 터치만으로 완주 가능해야 PASS.
---

# Mobile-First 감사 프로토콜

**"처음부터 끝까지 모바일에서 원활하게"** 를 보장하기 위한 표준 감사 절차. 리뷰어 `📌 H` 검증 시 이 스킬을 호출.

## 사용 시점

- 리뷰어 단계의 모바일 대응 검증
- 코더가 제출 전 자체 검증

## 검증 항목

### 1. 정적 검사 (grep 기반)

```bash
GAME=public/games/<game-id>/index.html

# viewport meta
grep -E 'name="viewport"' $GAME
# → "width=device-width,initial-scale=1.0,user-scalable=no" 포함 필수

# CSS 모바일 기본
grep -E 'touch-action|user-select|overflow:\s*hidden' $GAME
# → touch-action:none + user-select:none + overflow:hidden 모두 존재

# 모바일 감지
grep -E 'isMobile|ontouchstart|input\.isMobile' $GAME
# → 최소 1곳 이상 분기 있어야 모바일 전용 UI 렌더

# 가상 조이스틱/터치 버튼
grep -nE 'Layout\.touchControls|joystick|virtualPad|touchButton' $GAME
# → 1개 이상 (특히 액션 게임)
```

### 2. IX.Button 크기 감사

```bash
# 모든 new Button({...}) 추출 후 w/h 값 검사
grep -oP 'new Button\(\{[^}]*\}' $GAME | while read ctor; do
  w=$(echo "$ctor" | grep -oP 'w:\s*\K\d+' | head -1)
  h=$(echo "$ctor" | grep -oP 'h:\s*\K\d+' | head -1)
  if [ "$w" -lt 48 ] || [ "$h" -lt 48 ]; then
    echo "⚠️ 터치 타겟 미달: w=$w h=$h"
  fi
done
```

**기준**: `w >= 48 && h >= 48` (iOS HIG + Material guidelines).

### 3. 키보드 없이 전 플로우 완주 가능?

각 씬(TITLE, PLAY, PAUSE, GAMEOVER)별로 확인:

| Scene | 필수 터치 동작 |
|-------|--------------|
| TITLE | 탭으로 START 버튼 활성화 → PLAY 전환 |
| PLAY | 가상 조이스틱(이동) + 액션 버튼(공격/점프) — 둘 다 화면에 있음 |
| PAUSE | 탭으로 PAUSE 버튼 → PAUSE 모달 열림, 탭으로 RESUME |
| GAMEOVER | 탭으로 RESTART, TITLE 선택 가능 |

⛔ 어느 하나라도 **Space/Enter 눌러야만** 동작하면 FAIL.

### 4. 포트레이트·랜드스케이프 레이아웃

```bash
grep -E 'isPortrait|Layout\.safeArea|window\.innerHeight' $GAME
# → 양쪽 모드 대응 코드 존재
```

- 세로(portrait, 390×844): HUD가 화면 넘침 없이 배치
- 가로(landscape, 844×390): 조이스틱·액션 버튼 좌우 끝에 배치
- Canvas는 window.innerWidth/Height 그대로 사용 (고정 크기 금지)

### 5. 실제 모바일 뷰포트 시뮬레이션 (puppeteer)

```javascript
// 리뷰어가 puppeteer로 실행
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto('http://127.0.0.1:<port>/games/<id>/index.html');
await page.waitForTimeout(2000);

// TITLE 탭 → PLAY 진입 확인
const canvasBox = await page.$eval('#gameCanvas', el => el.getBoundingClientRect());
await page.touchscreen.tap(canvasBox.x + canvasBox.width/2, canvasBox.y + canvasBox.height/2);
await page.waitForTimeout(1500);

// 스크린샷 2장 (before/after)
await page.screenshot({ path: 'mobile-title.png' });
// ... tap ...
await page.screenshot({ path: 'mobile-play.png' });
```

두 스크린샷이 **명확히 다른 씬** 이어야 PASS (상태 전환 성공).

### 6. 보고 양식

```
## 모바일 감사 결과

### 1. 정적 검사
- viewport meta: ✅
- touch-action / user-select / overflow:hidden: ✅
- 모바일 감지 분기: ✅ (3곳)
- 가상 조이스틱: ✅ (Layout.touchControls 사용)

### 2. 버튼 크기 (5개)
- TITLE.START: 240×64 ✅
- PLAY.PAUSE: 80×36 ❌ 터치 타겟 미달 (min 48)
- ...

### 3. 키보드 없이 플레이
- TITLE → PLAY: ✅ (탭 전환 확인)
- PLAY 이동·액션: ⚠️ 이동은 조이스틱 OK, 액션은 Space만 — 액션 버튼 없음
- GAMEOVER RESTART: ✅

### 4. Orientation
- portrait safe area 준수: ✅
- landscape UI 배치: ⚠️ HUD가 가로모드에서 잘림

### 5. Puppeteer 실험
- TITLE→PLAY 탭 전환: ✅
- PLAY→GAMEOVER 상태 변화: ✅

### 최종
- FAIL 항목: 2개 (PLAY.PAUSE 크기, 액션 버튼 누락)
- → NEEDS_MAJOR_FIX
```

## 체크리스트

- [ ] viewport meta 정확
- [ ] touch-action:none CSS 존재
- [ ] 모든 IX.Button 48×48 이상
- [ ] 모바일 분기에서 가상 조이스틱 + 액션 버튼 렌더
- [ ] 키보드 없이 TITLE/PLAY/GAMEOVER 전 플로우 완주
- [ ] portrait + landscape 양쪽 UI 배치 확인
- [ ] Puppeteer 모바일 뷰포트로 실제 탭 시뮬레이션
