# Cycle 2 — Star Guardian Code Review & Test Report

> **Review Date:** 2026-03-20
> **Game ID:** `star-guardian`
> **File:** `public/games/star-guardian/index.html` (1,185 lines)
> **Reviewer:** Claude (QA)
> **Spec:** `docs/game-specs/cycle-2-spec.md`

---

## 1. Code Review (Static Analysis)

### 1.1 Feature Completeness Checklist

| # | Spec Requirement | Impl | Notes |
|---|-----------------|:----:|-------|
| 1 | Vertical scroll shooter basic loop | ✅ | requestAnimationFrame + deltaTime working |
| 2 | 4 enemy types (scout/fighter/tank/dart) | ✅ | Movement patterns, HP, scores all match spec |
| 3 | Boss battle (every 5 waves) | ✅ | 3-phase attack pattern cycling implemented |
| 4 | 3 power-up types (W/H/S) | ✅ | Drop rates, effects, durations match |
| 5 | 4-tier weapon upgrade | ✅ | Single→Double→Triple→Triple+Rear shot |
| 6 | Combo system | ✅ | Consecutive kills within 1 second, multiplier formula accurate |
| 7 | 5 score milestones | ✅ | Messages/colors match spec |
| 8 | 3-layer parallax background | ✅ | Star count/size/speed match spec |
| 9 | TweenManager system | ✅ | 5 easing types, 16+ usage points |
| 10 | ObjectPool system | ✅ | 6-type pooling: bullets/enemies/powerups/particles/text |
| 11 | 4-type AABB collision detection | ✅ | Player bullets↔enemies, enemy bullets↔player, enemies↔player, powerups↔player |
| 12 | 6-state game state machine | ✅ | LOADING/TITLE/PLAYING/PAUSE/CONFIRM_MODAL/GAMEOVER |
| 13 | Simultaneous keyboard input (Set) | ✅ | Including diagonal movement normalization |
| 14 | Mouse lerp tracking | ✅ | factor 0.12 |
| 15 | Touch virtual joystick | ✅ | Dead zone 8px, restricted to bottom-left area |
| 16 | Canvas confirmation modal (R key) | ⚠️ | **Implemented but not displayed — see MAJOR B1 below** |
| 17 | Pause (P/Esc) | ✅ | Keyboard selection + mouse/touch support |
| 18 | localStorage best score | ✅ | try-catch applied |
| 19 | DPR support | ✅ | resize + orientationchange |
| 20 | Wave difficulty scaling | ✅ | Formula matches spec |

### 1.2 Cycle 1 Mistake Prevention Verification

| # | Check Item | Result | Notes |
|---|----------|:----:|-------|
| M1 | 0 external CDNs | ✅ PASS | No Google Fonts, system font stack only |
| M2 | No leftover unused assets | ✅ PASS | ASSET_MAP 8 items = manifest.json 8 items (excluding thumbnail) match |
| M3 | 0 confirm()/alert()/prompt() calls | ✅ PASS | Replaced with Canvas modal |
| M4 | No setTimeout animation replacement | ⚠️ | **line 507: `setTimeout(600)` used for game over transition — see B3** |

### 1.3 Game Loop & Performance

| Item | Result | Notes |
|------|:----:|-------|
| requestAnimationFrame usage | ✅ PASS | Used in `loop` function |
| deltaTime handling | ✅ PASS | `ms = min(now - lastT, 33.33)`, 60fps normalization `dt = ms / 16.67` |
| Max frame skip protection | ✅ PASS | 33.33ms cap |
| No per-frame DOM access | ✅ PASS | Canvas API only |
| Object pooling | ✅ PASS | 6 entity types pooled, GC minimized |
| DPR support | ✅ PASS | `canvas.width = cssW * dpr`, `ctx.setTransform(dpr*scX,...)` |

### 1.4 Collision Detection

| Item | Result | Notes |
|------|:----:|-------|
| AABB logic accuracy | ✅ PASS | Center+half-size based, `ax-ahw < bx+bhw ...` |
| Player hitbox reduction | ✅ PASS | Visual 40×48 → judgment 24×24 (generous judgment) |
| 4-type collision checks | ✅ PASS | Bullets↔enemies, enemy bullets↔player, enemies↔player, powerups↔player |

### 1.5 Mobile Support

| Item | Result | Notes |
|------|:----:|-------|
| Touch events (start/move/end) | ✅ PASS | passive: false configured |
| Virtual joystick | ✅ PASS | 50px radius, visual indicator, 8px dead zone |
| Pause button (touch) | ✅ PASS | Upper-right area |
| Canvas resize | ✅ PASS | resize + orientationchange handlers, maintains 2:3 ratio |
| touch-action: none | ✅ PASS | Set in CSS |
| user-select: none | ✅ PASS | Set in CSS |
| contextmenu blocking | ✅ PASS | `e.preventDefault()` |

### 1.6 Security & iframe Compatibility

| Item | Result | Notes |
|------|:----:|-------|
| eval() usage | ✅ None | |
| alert()/confirm()/prompt() usage | ✅ None | Replaced with Canvas modal |
| XSS risk | ✅ None | No external input |
| External CDN dependency | ✅ 0 | |
| window.open / popups | ✅ None | |
| form submit | ✅ None | |

### 1.7 Asset Loading Verification

| Item | Result | Notes |
|------|:----:|-------|
| manifest.json exists | ✅ | 9 assets defined (including thumbnail) |
| ASSET_MAP ↔ manifest match | ✅ | 8 items (excluding thumbnail) fully matched |
| All SVG files exist | ✅ | All 10 files confirmed (thumbnail.svg + manifest.json included) |
| Asset preload Promise.all | ✅ | `img.onerror = resolve` — game continues even on asset failure |
| Code fallback rendering | ✅ | Fallbacks for player, enemy types, powerup, HUD hearts, etc. |
| Leftover unused assets | ✅ None | Cycle 1 M2 resolved |

---

## 2. Bugs Found

### B1 [MAJOR] — Tween not updated in CONFIRM_MODAL

**Location:** `loop()` function (line 1149)

**Problem:**
```javascript
case'CONFIRM_MODAL': drawGame(); drawModal(); break;
```
`tw.update(ms)` is not called in the `CONFIRM_MODAL` state. `tw.update(ms)` only executes inside `updateGame()` (line 455), but `CONFIRM_MODAL` state does not call `updateGame()`.

**Measured evidence:** In Puppeteer test, after pressing R key → entering CONFIRM_MODAL, `modAnim = {sc: 0.8, a: 0}` is frozen. tweenCount = 1 (tween is queued but not executed). Modal is **completely transparent (alpha=0)** and not visible on screen.

**Impact:** R key restart confirmation feature is effectively non-functional. User can only blindly exit the invisible modal with Enter/Esc.

**Fix:**
```javascript
case'CONFIRM_MODAL': tw.update(ms); drawGame(); drawModal(); break;
```

### B2 [MAJOR] — Tween also not updated in PAUSE state

**Location:** `loop()` function (line 1148)

**Problem:**
```javascript
case'PAUSE': drawGame(); drawPauseOL(); break;
```
When clicking RESTART button in PAUSE, it transitions to CONFIRM_MODAL and adds `modAnim` tween, but tween is still not updated afterward, causing the same transparent modal issue.

**Fix:**
```javascript
case'PAUSE': tw.update(ms); drawGame(); drawPauseOL(); break;
```

### B3 [MINOR] — setTimeout used for game over transition

**Location:** line 507

**Problem:** `setTimeout(()=>{if(!pl.alive)state='GAMEOVER';},600)` — Reuse of the setTimeout pattern flagged in Cycle 1 M4.

**Fix:** Replace with tween's onComplete callback:
```javascript
tw.add(goAnim,{oa:0.7},500,'easeOutQuad',()=>{if(!pl.alive)state='GAMEOVER';});
```

### B4 [MINOR] — goAnim.isNew judgment timing error → NEW BEST never displayed

**Location:** line 503~504

**Problem:**
```javascript
pl.alive=false; saveBest(score,wave);        // ← saves first
goAnim.isNew = score > getBest();            // ← compares against already-updated value → always false
```
`saveBest()` is called first, updating localStorage. Then `getBest()` returns the updated value, so `score > getBest()` is always `false`.

**Fix:** Swap the order:
```javascript
pl.alive=false;
goAnim.isNew = score > getBest();   // judge first
saveBest(score, wave);              // save after
```

### B5 [MINOR] — Enemy SVG source-atop rendering exposes background rectangle

**Location:** `drawEN()` function (line 811~814)

**Problem:** When applying enemy color overlay via `source-atop` compositing, the SVG filter (`feGaussianBlur`) creates semi-transparent pixels across the entire viewBox, visually exposing a 64×64 rectangular background.

**Confirmed in Puppeteer screenshot:** Dark rectangular background visible around enemy sprites.

**Fix:** Remove color overlay, or draw to offscreen canvas first then composite, or limit SVG filter range with `filterUnits="userSpaceOnUse"` + narrow area.

### B6 [INFO] — Homing bullet rotation speed is frame-dependent

**Location:** line 441

**Problem:** `b.ang += clamp(diff, -2*dt/60, 2*dt/60)` — Spec specifies `2rad/s`. Current implementation is `dt/60` based, which may have slight differences with frame rate variation. Accurate time-based would be `2 * (ms/1000)`.

---

## 3. Browser Test (Puppeteer)

### 3.1 Test Environment
- **URL:** `file:///C:/Work/InfinitriX/public/games/star-guardian/index.html`
- **Resolution:** 480×720
- **Browser:** Chromium (Puppeteer)

### 3.2 Test Results

| # | Item | Result | Notes |
|---|------|:----:|-------|
| 1 | Page load | ✅ PASS | Normal load, LOADING → TITLE transition |
| 2 | No console errors | ✅ PASS | 0 errors/warnings |
| 3 | Canvas rendering | ✅ PASS | 480×720 Canvas created normally |
| 4 | Start screen display | ✅ PASS | Title, subtitle, controls guide, fighter preview |
| 5 | Asset load (8 types) | ✅ PASS | All 8 keys confirmed in SPRITES object |
| 6 | TITLE → PLAYING transition | ✅ PASS | Normal transition via Enter key |
| 7 | Gameplay rendering | ✅ PASS | Player, enemies, background stars, HUD all normal |
| 8 | Pause (P key) | ✅ PASS | PLAYING → PAUSE, 3 buttons shown (RESUME/RESTART/TITLE) |
| 9 | Confirmation modal (R key) | ❌ **FAIL** | Modal fixed at alpha=0, not visible (B1) |
| 10 | Game over screen | ✅ PASS | GAME OVER + score/wave/BEST + RETRY/TITLE buttons |
| 11 | Touch event code exists | ✅ PASS | touchstart/touchmove/touchend handlers |
| 12 | Score system | ✅ PASS | Score increase on enemy kill confirmed (100 points) |
| 13 | localStorage best score | ✅ PASS | try-catch wrapped, save/load working |
| 14 | Game over/restart | ✅ PASS | HP=0 → GAMEOVER transition, Enter to restart |
| 15 | Parallax background | ✅ PASS | 3-layer star scroll visually confirmed |
| 16 | HUD display | ✅ PASS | Heart icons, star icons, score, WAVE, weapon level |
| 17 | SVG asset rendering | ⚠️ | Enemy sprite background rectangle exposed (B5) |
| 18 | DPR support | ✅ PASS | dpr × scaleX transform applied |

### 3.3 Screenshot Evidence

1. **Title screen** — ✅ Normal. "★ STAR GUARDIAN ★" cyan neon title, decorative fighter, parallax background, blinking start guide, 3-line controls, CRT scanlines.
2. **Play screen** — ✅ Normal. HUD (hearts/stars/score/wave/weapon level), SVG player, SVG enemies (background rectangle issue present), parallax star background.
3. **Pause** — ✅ Normal. Semi-transparent overlay, "⏸ PAUSED" text, 3 buttons (RESUME cyan/RESTART orange/TITLE gray).
4. **Confirmation modal** — ❌ **FAIL**. Only game screen visible, modal not shown (`modAnim.a = 0` frozen).
5. **Game over** — ✅ Normal. Semi-transparent overlay, "GAME OVER" red neon, SCORE/WAVE/BEST display, RETRY/TITLE buttons.

---

## 4. Cycle 1 Feedback Verification

| Cycle 1 Issue | Result |
|---------------|--------|
| **M1 — Google Fonts external dependency** | ✅ Fully resolved. System fonts only, 0 external CDNs |
| **M2 — 3 unnecessary assets remaining** | ✅ Fully resolved. Only dedicated assets registered, all confirmed in use |
| **M3 — R key confirm() unavailable** | ⚠️ Canvas modal implemented, **but not displayed due to tween not updating (B1)** |
| **M4 — Movement animation not implemented** | ✅ TweenManager implemented. However setTimeout remains for game over (B3) |
| **Suggestion — Object pooling** | ✅ Applied. ObjectPool class with 6 entity types pooled |
| **Suggestion — Try arcade/action genre** | ✅ Applied. Vertical scroll shooter, completely different genre |
| **Suggestion — Clean up asset template** | ✅ Applied. manifest.json based asset management + 100% code fallback |

---

## 5. Cycle 1 vs Cycle 2 Improvement Assessment

| Area | Cycle 1 | Cycle 2 | Assessment |
|------|---------|---------|------------|
| Genre | Puzzle | Arcade shooter | ✅ Technical scope expanded |
| Code size | ~600 lines | ~1,185 lines | ✅ Handled 2x complexity |
| Tween system | None (setTimeout) | TweenManager implemented | ✅ Major improvement |
| Object pooling | None | ObjectPool 6 types | ✅ Major improvement |
| External dependency | Google Fonts | 0 | ✅ Fully resolved |
| Unused assets | 3 remaining | 0 | ✅ Fully resolved |
| confirm() replacement | Unresolved | Canvas modal implemented (but not displayed) | ⚠️ Implemented but bugged |
| Asset system | None | manifest.json + 8 SVGs + code fallback | ✅ Major improvement |

---

## 6. Final Verdict

### Code Review Verdict: `NEEDS_MAJOR_FIX`

### Test Verdict: `FAIL`

### Final Verdict: `NEEDS_MAJOR_FIX`

**Reasoning:**
- **B1 (CONFIRM_MODAL transparent)** — A core feature specified in spec §6.4, §11.4 (resolving Cycle 1 M3) is effectively non-functional. Pressing R key enters `CONFIRM_MODAL` state but the modal is invisible, making it UX-level unplayable.
- **B4 (NEW BEST never displayed)** — Missing critical feedback for score records.

### Required Fixes (Coder rework request)

| Priority | Bug | Fix |
|:--------:|-----|-----|
| Required | B1 | Add `tw.update(ms)` to `CONFIRM_MODAL` case in `loop()` |
| Required | B2 | Add `tw.update(ms)` to `PAUSE` case in `loop()` |
| Required | B4 | Swap order to judge `goAnim.isNew` before calling `saveBest()` |
| Recommended | B3 | Replace `setTimeout(600)` with tween onComplete callback |
| Recommended | B5 | Fix enemy SVG `source-atop` background rectangle issue |

> **Fix scope:** B1+B2 are 1 line addition each, B4 is a 2-line order swap. Quick fix followed by re-verification recommended.
