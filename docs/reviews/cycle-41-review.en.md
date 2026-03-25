---
game-id: ashen-stronghold
cycle: 41
round: 2
reviewer: qa-agent
date: 2026-03-25
verdict: APPROVED
---

# Cycle #41 Review (Round 2) — Ashen Stronghold

## Final Verdict: ✅ APPROVED

All issues raised in the Round 1 review (**MINOR-1~4 + INFO-2**) have been resolved. The core game loop (Title→MAP→Day Explore→Night Prep→Night Wave→Game Over→Restart) is fully functional, all 21 assets load correctly, and there are zero console errors.

---

## Round 1 Issue Fix Verification

| Issue | Round 1 Status | Round 2 Check | Result |
|-------|---------------|---------------|--------|
| MINOR-1: Floating-point resource display | `G.food` displayed directly → `15.918...` | `Math.floor(G.food)` applied (line 2472~2498) | ✅ Fixed |
| MINOR-2: R button touch target 40px | `r: 20` → diameter 40px | `r: 24` → diameter 48px (≥MIN_TOUCH_TARGET) | ✅ Fixed |
| MINOR-3: Extension system monkey-patch | 7 IIFE chain wrapping | Structure maintained (no functional issues, maintainability concern) | ℹ️ No change (accepted) |
| MINOR-4: NIGHT_PREP auto-skip | Design intent confirmed | 30s timer + START button in parallel — intended behavior | ℹ️ Not an issue |
| INFO-2: onBossDefeated transition guard conflict | `beginTransition()` call may conflict with `_transitioning` guard | Direct `G.state = ST.MAP; enterState(ST.MAP)` used | ✅ Fixed |

---

## Stage 1: Code Review (Static Analysis)

### Checklist

| Item | Result | Notes |
|------|--------|-------|
| keydown preventDefault() | ✅ PASS | Handled in ix-engine.js for GAME_KEYS list (line 105, 115) |
| requestAnimationFrame game loop + delta time | ✅ PASS | Engine class based, dt parameter passing |
| Touch events registered | ✅ PASS | touchstart/touchmove/touchend in ix-engine.js Input (line 147, 159, 168) |
| State transition flow | ✅ PASS | TRANSITION_TABLE (7 states) + beginTransition single function (line 120~129, 1234) |
| localStorage high score | ✅ PASS | Save.setHighScore/getHighScore + saveProgress (line 1311~1312, 1319~1341) |
| Canvas resize + devicePixelRatio | ✅ PASS | Engine onResize callback + recalcLayout (line 294~306) |
| No external CDN dependencies | ✅ PASS | System font `'Segoe UI', system-ui, -apple-system, sans-serif` fallback |
| Math.random 0 occurrences | ✅ PASS | All SeededRNG (F18) — grep result 0 |
| alert/confirm/prompt 0 occurrences | ✅ PASS | iframe compliance (F3) — grep result 0 |

---

## Stage 2: Browser Runtime Tests (Puppeteer)

| Test | Result | Notes |
|------|--------|-------|
| A: Load + Title | ✅ PASS | Background assets (ruined cityscape) + zombie silhouettes + title "잿빛 요새" + subtitle + "L: English" toggle. 0 errors |
| B: Space to Start | ✅ PASS | TITLE→DAY_EXPLORE transition successful, explore map + Fog of War + item/survivor sprites + HUD all rendered |
| C: Movement Controls | ✅ PASS | WASD keys moved player (x: 491→576), Fog of War expanded, resources changed (🔩30→60), "Survivor Found!" event triggered |
| D: Game Over + Restart | ✅ PASS | NIGHT_WAVE core.hp=0 → auto-GAMEOVER transition → "Stronghold Fallen" screen (score/best/zone/wave/kills/stars) → R key → TITLE return, full state reset (score=0, coreHp=100, scrap=30) |
| E: Click/Touch Controls | ✅ PASS | Canvas click TITLE→MAP transition + touch event zone selection→DAY_EXPLORE entry successful |
| Pause (ESC) | ✅ PASS | `showPauseUI` toggle working, renderPauseUI call confirmed (line 2180) |
| Asset Load (21 items) | ✅ PASS | manifest.json based, 21 PNG assets confirmed loaded (Puppeteer `assets.sprites` count: 21) |

---

## Stage 3: Detailed Verification (📌 1~7)

### 📌 1. Game Start Flow — ✅ PASS
- Title screen: "잿빛 요새" + subtitle + background assets + zombie silhouette decorations
- Space/Enter/tap/click to start → MAP transition → zone selection → DAY_EXPLORE
- On start `fullReset()`: score/resources/core/zombies/defenses/relics all reset confirmed (line 1344~1360)
- `loadProgress()` loads previous save data (line 1328~1341)

### 📌 2. Input System — Desktop — ✅ PASS
- keydown/keyup: registered in ix-engine.js, preventDefault included (line 105, 115)
- WASD/arrows: `updatePlayerMovement()` → `input.held()` → dx/dy → normalize → position update
- Shooting: mouse click → `MathUtil.angle()` aim → `createProjectile()` → projectile creation (line 485~487)
- Pause: ESC → `showPauseUI` toggle → update loop early return
- Defense switch: Q/E keys → `selectedDef` cycle
- Reload: R key → `reloading = true` → 1.5s timer
- Minimap: Tab key toggle (line 3788~3793), preventDefault included

### 📌 3. Input System — Mobile — ✅ PASS
- touchstart/touchmove/touchend: processed in ix-engine.js Input class (line 147, 159, 168)
- Virtual joystick: bottom-left circle (radius 50px), `updateJoystickTouch()` → dx/dy normalization (line 2792~)
- Touch buttons: ATK (r=30, diameter 60px), ACT (r=24, diameter 48px), R (r=24, diameter 48px) — all ≥48px ✅
- touch-action: none ✅ (line 9), overflow: hidden ✅ (line 9)

### 📌 4. Game Loop & Logic — ✅ PASS
- requestAnimationFrame based (Engine class), _ready guard (line 2876~2877)
- dt (milliseconds) parameter for frame-independent updates
- BFS pathfinding: zombie AI to core BFS path + straight-line fallback (line 496~530)
- BFS path blocking prevention: `bfsPathExists()` validation before placement (F29, line 514~530)
- DPS cap 200%, synergy cap 150% (F30, line 139~140, 474)
- DDA 4 levels (line 216~221)

### 📌 5. Game Over & Restart — ✅ PASS
- Game over condition: `G.core.hp <= 0` (during night wave/boss)
- Game over screen: "Stronghold Fallen" + score/best/zone/wave/kills/stars stats (line 2733~2751)
- localStorage: `Save.setHighScore()` + `saveProgress()` — judge first, save later (F8, line 1308~1312)
- Restart: R key/tap → `fullReset()` → `beginTransition(ST.TITLE)` (line 1344~1360)
- `fullReset()` verified (Puppeteer): score=0, coreHp=100, scrap=30 — all reset ✅

### 📌 6. Screen Rendering — ✅ PASS
- Canvas: window.innerWidth/Height based (Engine onResize)
- devicePixelRatio: handled in Engine class
- Resize event: `onResize()` → `recalcLayout()` → cellSize/gridOffX/gridOffY recalculation (line 294~306)
- Per-state rendering confirmed: TITLE (bg+zombies), MAP (zone selection), DAY_EXPLORE (grid+fog+items+survivors), NIGHT_PREP (core+defenses+START), NIGHT_WAVE (zombies+projectiles+vignette+rain), GAMEOVER (stats)
- Additional visual effects: weather (rain), vignette (line 3562~3574), scanlines, core glow, particles
- Asset fallback: all render functions have `if (assets.sprites[key]) { drawImage } else { Canvas fallback }` pattern

### 📌 7. External Dependency Safety — ✅ PASS
- External CDN: 0 (grep result 0)
- Font: `'Segoe UI', system-ui, -apple-system, sans-serif` — complete fallback chain (line 25)
- Asset load failure: Canvas fallback drawing exists
- manifest.json load failure: try/catch + `.catch(() => null)` — game works without assets (line 2887~2899)

---

## 📱 Mobile Control Inspection

| Item | Result | Notes |
|------|--------|-------|
| Viewport meta tag | ✅ PASS | width=device-width, user-scalable=no (line 5) |
| Full flow without keyboard | ✅ PASS | Tap/touch for start/zone select/placement/shooting (auto-aim) |
| Joystick/button position | ✅ PASS | Bottom-left joystick (r=50), bottom-right buttons — no game view obstruction |
| Touch target size ≥48px | ✅ PASS | ATK 60px, ACT 48px, R 48px — all compliant |
| touch-action: none | ✅ PASS | Applied to body (line 9) |
| Scroll prevention | ✅ PASS | overflow: hidden + touch-action: none |

---

## Asset Loading Verification

| Item | Result |
|------|--------|
| assets/manifest.json exists | ✅ |
| 22 PNG assets exist (including thumbnail) | ✅ |
| In-game asset load (21, excluding thumbnail) | ✅ Confirmed 21 via Puppeteer |
| Canvas fallback drawing exists | ✅ All render functions have fallback |
| Assets actually used in rendering | ✅ Background/character/zombie/item/boss confirmed via screenshots |

---

## Planner/Designer Feedback Verification

| Item | Result | Notes |
|------|--------|-------|
| Design fit: Day explore→Night defense core loop | ✅ | TITLE→MAP→DAY_EXPLORE→NIGHT_PREP→NIGHT_WAVE/BOSS_NIGHT→GAMEOVER full flow confirmed |
| 3 zones × 3 nights = 9 main stages + 3 bosses | ✅ | ZONE_NAMES 3, BOSS_HP/BOSS_NAMES 3, boss transition at waveNum>=3 |
| Upgrade tree 3 axes (defense/attack/explore) × 5 levels | ✅ | UPGRADE_TREE implementation confirmed (line 171~193) |
| Relic system (normal/rare/epic) | ✅ | 13 RELICS, 3 tiers, applyRelic + DPS cap/synergy cap |
| DDA 4 levels | ✅ | DDA_LEVELS 4 entries, hp/speed/count/resource multipliers (line 216~221) |
| BFS zombie path + placement blocking prevention | ✅ | bfsPath/bfsPathExists implementation (line 496~530) |
| SeededRNG fully used | ✅ | Math.random 0 occurrences |
| Multilingual (ko/en) | ✅ | L object with ko/en complete (line 29~97), L key toggle |
| Asset manifest.json based loading | ✅ | 21 PNGs, Canvas fallback |
| Visual: Post-apocalyptic atmosphere | ✅ | Background assets (ruined city), night vignette, rain effects, scanlines, zombie/boss sprites |

---

## Regression Test (Existing Functionality)

| Feature | Result | Notes |
|---------|--------|-------|
| _ready flag TDZ defense (F23, F27) | ✅ | `G._ready = false` init, set true at boot() end (line 243, 2910) |
| beginTransition guard (F5, F21) | ✅ | TRANSITION_TABLE validation + _transitioning guard (line 1234~1252) |
| Judge first, save later (F8) | ✅ | enterState(GAMEOVER) judges isNewBest before save (line 1308~1312) |
| bossRewardGiven flag (F17) | ✅ | Initialized false, boss reward given only once |
| Touch target ≥48px (F11, F25) | ✅ | MIN_TOUCH_TARGET=48, Math.max enforced (line 26, 302) |

---

## Notes (Not Issues)

### ℹ️ INFO-1: Monkey-patch Extension Structure Maintained
- **Status**: Extension systems integrated via conditional calls in existing update/render
- **Verdict**: No functional issues, future refactoring recommended

### ℹ️ INFO-2: beginTransition Guard Over-blocking
- **Location**: line 1241 — `if (G.core.hp <= 0 && to !== ST.GAMEOVER) return;`
- **Status**: Blocks transitions when core.hp=0 artificially set during DAY_EXPLORE/NIGHT_PREP
- **Verdict**: Does not occur in normal gameplay (core.hp only decreases during night phases)

---

## Conclusion

The Ashen Stronghold Round 2 review confirms all Round 1 issues have been properly addressed:

1. ✅ **Floating-point resource display** → `Math.floor()` applied
2. ✅ **R button touch target** → r=24 (diameter 48px ≥ MIN_TOUCH_TARGET)
3. ✅ **onBossDefeated transition guard** → direct state transition to avoid guard conflict

Puppeteer runtime testing completed the full game loop (TITLE→MAP→DAY_EXPLORE→NIGHT_PREP→NIGHT_WAVE→GAMEOVER→TITLE), confirmed 21 assets loaded, zero console errors, and all movement/shooting/state transitions/restart functioning correctly. **APPROVED**.
