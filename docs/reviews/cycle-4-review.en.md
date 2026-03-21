# Cycle 4 Code Review & Test Results

> **Game:** Neon Dash Runner
> **Game ID:** `neon-dash-runner`
> **Review Date:** 2026-03-20
> **Reviewer:** Claude (QA)
> **Spec:** `docs/game-specs/cycle-4-spec.md`

---

## 1. Code Review (Static Analysis)

### 1.1 Feature Completeness

| Spec Item | Impl | Notes |
|-----------|------|-------|
| 3-lane system + tween transition | ✅ | easeOutQuad 150ms, 180ms for touch |
| Jump physics (parabolic) | ✅ | JUMP_DURATION=500ms, simultaneous lane change possible |
| 4 obstacle types (barrier/spike/laser/drone) | ✅ | Drone oscillates up/down, laser occupies 2 lanes |
| 2 coin types (normal/super) + consecutive lines | ✅ | Probability distribution 70%/15%/15% |
| 3 power-up types (magnet/shield/x2) | ✅ | Guard flags applied |
| Procedural level generation (chunks) | ✅ | 6 patterns, safe lane guaranteed, difficulty curve |
| Speed curve | ✅ | `min(600, 200 + distance * 0.04)` |
| Generous hitbox | ✅ | Obstacles ×0.7, coins ×1.3 |
| Near Miss system | ✅ | +30 points, slow-mo tween |
| Score + localStorage best record | ✅ | 4 keys, try-catch wrapped |
| 6-state game state machine | ✅ | LOADING/TITLE/PLAYING/PAUSE/CONFIRM_MODAL/GAMEOVER |
| TweenManager (5 easing types) | ✅ | linear/easeOutQuad/easeInQuad/easeOutBack/easeOutElastic |
| ObjectPool (4 types) | ✅ | Obstacles 20, coins 30, powerups 5, particles 60 |
| TransitionGuard pattern | ✅ | STATE_PRIORITY map + beginTransition() |
| Canvas-based modal | ✅ | confirm replacement complete |
| State×system matrix comment | ✅ | Included as ASCII table at top of code |
| destroy() + listener cleanup | ✅ | registeredListeners pattern, AudioContext close |
| Keyboard/mouse/touch auto-detection | ✅ | inputMode with 4 usage points all implemented |
| 3-layer parallax background | ✅ | offscreen canvas cache, ×0.1/×0.4/×1.0 |
| Web Audio sound effects (5 types) | ✅ | jump/coin/hit/powerup/gameover |
| Dynamic balance correction | ✅ | dangerModeChunks, consecutiveSafeDist, vignette |

### 1.2 Game Loop & Frame Handling

- ✅ `requestAnimationFrame` used
- ✅ Delta time handling: `Math.min((timestamp - lastTime) / 1000, 0.05)` — 50ms cap
- ✅ `tw.update(dt)` called in all states (matrix compliant)
- ✅ Particle update in GAMEOVER (matrix compliant)

### 1.3 Memory Management

- ✅ `registeredListeners[]` + `listen()` helper for event tracking
- ✅ `destroy()` cleans up listeners/pools/tweens/audio entirely
- ✅ ObjectPool acquire/release pattern (reverse traversal + splice)
- ✅ TweenManager deferred cancel pattern

### 1.4 Security Checks

- ✅ No `eval()` usage
- ✅ No `setTimeout` / `setInterval` usage
- ✅ No `confirm()` / `alert()` / `prompt()` usage
- ✅ No XSS risk factors

### 1.5 Mobile Support

- ✅ Touch events implemented (touchstart/touchend + preventDefault)
- ✅ `{ passive: false }` option
- ✅ Swipe sensitivity 30px threshold
- ✅ Canvas resize: based on `window.innerWidth × window.innerHeight`
- ✅ DPR support (`devicePixelRatio`)
- ✅ `touch-action: none` + `-webkit-tap-highlight-color: transparent`
- ✅ Touch mode buttons scaled 1.5x

### 1.6 Score/Best Score Storage

- ✅ localStorage 4 keys (`ndr_bestScore`, `ndr_bestDist`, `ndr_totalCoins`, `ndr_totalRuns`)
- ✅ try-catch wrapped (iframe sandbox safe)
- ✅ "Judge first, save later" order maintained (`isNewBest = score > prevBest` → `saveBest()`)

---

## 2. Bugs Found

### [B1] CRITICAL — `startGame()` state transition failure (game cannot start)

**Location:** `startGame()` function (line 798~805)

**Cause:**
```javascript
function startGame() {
  resetGame();           // ← calls tw.cancelAll() → _pendingCancel = true
  tw.add(titleGlow, { alpha: 0 }, 300, 'easeOutQuad', () => {
    forceState(STATES.PLAYING);   // ← this callback never executes
    titleGlow.alpha = 0.7;
  });
  transitioning = true;  // ← permanently stuck at true
}
```

`resetGame()` calls `tw.cancelAll()` which sets `_pendingCancel = true`.
The fadeOut tween added immediately after is **deleted along with all other tweens** by the `_pendingCancel` flag on the next `tw.update(dt)` call.

Result:
- `forceState(STATES.PLAYING)` callback **never executes**
- `transitioning = true` is **permanently stuck** → no state transitions possible afterward
- **User cannot start the game** (Space/Enter/click/tap all ineffective)

**Fix:**
```javascript
function startGame() {
  resetGame();
  // Flush immediately after cancelAll's deferred handling, or add tween after flush
  tw._pendingCancel = false;  // immediate release (resetGame already cleared _tweens)
  tw._tweens.length = 0;      // explicit clear
  tw.add(titleGlow, { alpha: 0 }, 300, 'easeOutQuad', () => {
    forceState(STATES.PLAYING);
    titleGlow.alpha = 0.7;
  });
  transitioning = true;
}
```
Or add a `clearImmediate()` method to TweenManager.

**Severity:** CRITICAL — Game cannot be started normally

---

### [B2] MAJOR — SVG asset usage (spec §4.5 ban list violation)

**Location:** line 96~121 (ASSET_MAP + preloadAssets)

**Spec §4.5 ban list:**
> No SVG files / SVG filters (feGaussianBlur, \<filter\>)
> No external image files (.png, .jpg, .svg, .gif)

**Current state:**
- 9 SVG files exist in `assets/` folder (player, enemy, bg-layer1/2, ui-heart, ui-star, powerup, effect-hit, thumbnail)
- `manifest.json` defines 8 assets
- `preloadAssets()` loads all → all 8 loaded successfully
- `player.svg` contains 2 `feGaussianBlur` filters (line 22, 26)
- SVG assets used first in `drawPlayer()`, `drawObstacle()`, `drawCoin()`, `drawPowerup()`, HUD (Canvas fallback drawing exists)

**Impact:**
- Canvas fallback code exists so game works even if SVG loading fails
- However, clearly violates spec's "No SVG whatsoever" + "100% Canvas drawing" principle
- `feGaussianBlur` usage is a recurrence of the pattern explicitly banned in Cycle 3 B4

**Fix:**
1. Delete entire `assets/` folder
2. Remove `ASSET_MAP`, `SPRITES`, `preloadAssets()` code
3. Remove SVG asset branches from all rendering functions (keep only fallback Canvas code)
4. No need to wait for asset preload on loading screen

**Severity:** MAJOR — Explicit spec ban violation, but no functional issues due to fallback code

---

### [B3] MINOR — Title glow tween not restored after `goToTitle()`

**Location:** `goToTitle()` (line 877~881) / `init()` (line 1804~1808)

**Cause:** `pulseTitle()` is only called once during `init()`.
`goToTitle()` → `resetGame()` → `tw.cancelAll()` removes existing glow tween,
but `pulseTitle()` is not called again, so glow animation stops when returning GAMEOVER → TITLE.

**Impact:** Visual quality degradation (title glow stops), no impact on game functionality

**Fix:** Add `pulseTitle()` re-call in `goToTitle()`

**Severity:** MINOR

---

### [B4] MINOR — Coin combo bonus not implemented

**Spec §7.1:** "5 consecutive coins combo → +20 point bonus"

Code has a `coinCount` variable but no **consecutive coin counter** (bonus every 5). `coinCount` only counts cumulative total with no consecutive judgment logic.

**Severity:** MINOR — Secondary scoring mechanic missing

---

## 3. Browser Test (Puppeteer)

| Item | Result | Notes |
|------|--------|-------|
| Page load | ✅ PASS | Loaded without errors |
| No console errors | ✅ PASS | 0 JS errors/warnings |
| Canvas rendering | ✅ PASS | DPR support normal, 3-layer background rendering |
| Start screen display | ✅ PASS | Title, controls guide, best record displayed |
| Game start (user input) | ❌ FAIL | **[B1]** Cannot start game via Space/click/tap (tween transition failure) |
| Gameplay (forced entry) | ✅ PASS | Obstacles/coins/collision/HUD all working normally |
| Touch event code exists | ✅ PASS | touchstart/touchend + swipe detection |
| Score system | ✅ PASS | Distance score, coin score, x2 multiplier, Near Miss |
| localStorage best score | ✅ PASS | Save/load confirmed working |
| Game over/restart | ⚠️ PARTIAL | Game over screen displays normally, but restart has same [B1] issue |
| SVG asset load | ✅ Loaded | 8/8 assets loaded successfully (but violates spec) |

### Screenshot Summary

1. **Title screen** — Neon cyberpunk background, building silhouettes, star particles, scanline effect normal
2. **Gameplay** (forced entry) — 3-lane road, player triangle + glow, barrier/spike obstacles, coins, "+10" popup, HUD normal
3. **Game over** — Semi-transparent overlay, distance/score/coins sequential display, NEW BEST! easeOutElastic animation, inputMode-specific restart guide

---

## 4. Spec Cross-Reference Checklist (§13.4)

| Item | Result | Notes |
|------|--------|-------|
| `tw.update(dt)` in all states | ✅ PASS | All 6 states confirmed |
| 0 `setTimeout`/`setInterval` | ✅ PASS | grep 0 results |
| 0 `confirm()`/`alert()` | ✅ PASS | Replaced with Canvas modal |
| 0 SVG/external images/fonts | ❌ FAIL | 8 SVG assets in use [B2] |
| Score judgment→save order | ✅ PASS | `isNewBest` first → `saveBest()` after |
| `beginTransition()` helper usage | ✅ PASS | Used for GAMEOVER transition |
| `transitioning` guard flag | ⚠️ PARTIAL | Applied, but can be permanently true due to [B1] |
| `STATE_PRIORITY` map + priority check | ✅ PASS | {0:0, 1:10, 2:20, 3:30, 4:35, 5:99} |
| `destroy()` pattern listener cleanup | ✅ PASS | 6 listeners registered/cleaned confirmed |
| 5 easing functions | ✅ PASS | linear/easeOutQuad/easeInQuad/easeOutBack/easeOutElastic |
| Ghost variable prevention | ✅ PASS | inputMode(4 places), nearMissCount, timeSinceLastPowerup, consecutiveSafeDist all update/use confirmed |
| Generous hitbox | ✅ PASS | HITBOX_SHRINK=0.7, COIN_HITBOX_GROW=1.3 |
| Safe lane guarantee | ✅ PASS | safeLanes check + fallback obstacle removal |
| Canvas-based modal only | ✅ PASS | renderModal() implementation confirmed |
| Banned pattern grep check | ✅ PASS | 0 results (in JS code) |

---

## 5. Asset Verification

| Asset | Exists | Notes |
|-------|--------|-------|
| `assets/manifest.json` | ✅ | 8 assets defined |
| `assets/player.svg` | ✅ | ⚠️ Contains 2 `feGaussianBlur` |
| `assets/enemy.svg` | ✅ | Used for barrier rendering |
| `assets/bg-layer1.svg` | ✅ | Far background |
| `assets/bg-layer2.svg` | ✅ | Near background |
| `assets/ui-heart.svg` | ✅ | HUD lives |
| `assets/ui-star.svg` | ✅ | HUD score/coins |
| `assets/powerup.svg` | ✅ | Power-up capsule |
| `assets/effect-hit.svg` | ✅ | Collision effect |
| `assets/thumbnail.svg` | ✅ | Platform thumbnail |

> **Spec §4.5 violation:** All SVG assets need to be removed. Canvas fallback rendering code already exists, so the game will work without issues after asset removal.

---

## 6. Final Verdict

### Code Review: **NEEDS_MAJOR_FIX**

### Test: **FAIL**

### Reasoning

1. **[B1] CRITICAL** — `startGame()` tween transition failure means **the user cannot start the game**. Race condition between TweenManager's deferred `cancelAll()` pattern and immediately adding a tween. A fatal bug that prevents gameplay entirely.

2. **[B2] MAJOR** — Using SVG assets explicitly banned by the spec. Includes `feGaussianBlur`. Recurrence of Cycle 3 B4.

### Fix Priority

| Priority | Bug | Required |
|----------|-----|----------|
| 1 | [B1] startGame() tween race condition | Required — Game cannot start |
| 2 | [B2] Remove SVG assets + switch to Canvas-only | Required — Spec principle violation |
| 3 | [B3] goToTitle() glow tween restoration | Recommended |
| 4 | [B4] Coin combo bonus implementation | Optional |

> **→ Coder rework required.** Re-review after fixing [B1] and [B2].
