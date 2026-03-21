# Cycle 3 Code Review & Test Results

> **Game:** Mini Tower Defense (mini-tower-defense)
> **Review Date:** 2026-03-20
> **Reviewer:** Claude (QA / Senior Game Developer)
> **Spec:** `docs/game-specs/cycle-3-spec.md`

---

## Code Review Verdict: NEEDS_MAJOR_FIX

## Test Verdict: FAIL

---

## 1. Code Review (Static Analysis)

### PASS Items

| Item | Result | Notes |
|------|--------|-------|
| Game loop | ✅ PASS | Uses `requestAnimationFrame`, `dt` capped at 50ms max |
| State machine (7 states) | ✅ PASS | Full implementation: LOADING → TITLE → WAVE_PREP → PLAYING → PAUSE → CONFIRM_MODAL → GAMEOVER |
| TweenManager updates in all states | ✅ PASS | `tw.update(dt)` called in all 6 states (excluding LOADING) confirmed |
| 5 easing functions | ✅ PASS | linear, easeOutQuad, easeInQuad, easeOutBack, easeOutElastic all implemented |
| setTimeout usage ban | ✅ PASS | 0 actual setTimeout calls in code (only mentioned in comments) |
| eval() not used | ✅ PASS | 0 eval calls |
| alert/confirm/prompt not used | ✅ PASS | Replaced with Canvas modal, 0 banned API calls |
| Score judgment→save order | ✅ PASS | `isNewBest = score > getBest()` → `saveBest(score, wave)` order is correct (§7.2 compliant) |
| localStorage try-catch | ✅ PASS | `getBest()`, `getBestWave()`, `saveBest()` all wrapped in try-catch |
| ObjectPool pattern | ✅ PASS | Pooling for enemies(30), projectiles(50), particles(80), reverse traversal + splice |
| destroy() pattern | ✅ PASS | `cancelAnimationFrame`, full listener removal, `tw.cancelAll()`, `audioCtx.close()` |
| listen() helper | ✅ PASS | Registered in `registeredListeners[]`, bulk removal in destroy() |
| Web Audio SFX | ✅ PASS | 4 sound effects (shoot×3, kill, wave, gameover), try-catch wrapped, plays only in PLAYING |
| DPR support | ✅ PASS | Canvas internal resolution adjusted based on `window.devicePixelRatio` |
| Canvas resize | ✅ PASS | `resize()` registered on `window.resize` event, dynamic scaling |
| Touch events | ✅ PASS | `touchstart`, `touchmove` implemented, `{ passive: false }` applied |
| Auto input mode detection | ✅ PASS | `inputMode = 'mouse' / 'touch'` auto-switching |
| Offscreen background cache | ✅ PASS | `buildBgCache()` pre-renders background to separate canvas |
| State×system matrix comment | ✅ PASS | Matrix table included as comment at top of code |
| TweenManager deferred cancel | ✅ PASS | `_pendingCancel` flag for safe cancellation during update |
| 3 tower types × 3 tiers | ✅ PASS | archer/mage/cannon, Lv.1~3 stats match spec |
| 4 enemy types | ✅ PASS | goblin/orc/dark/runner, HP/speed/reward/armor/slow-resistance implemented |
| Path system | ✅ PASS | S-shaped waypoint path, PATH_TILES marked as non-buildable |
| 60% sell return | ✅ PASS | `Math.floor(t.totalInvested * 0.6)` |
| Armor calculation | ✅ PASS | `Math.max(1, dmg - enemy.armor)` |
| Crisis bonus | ✅ PASS | Gold ×1.3 when `lives <= 5` |
| First targeting | ✅ PASS | Targets furthest-progressed enemy based on waypoint index + progress |
| Generous hitbox | ✅ PASS | `def.range + 8` (+8px tolerance) |
| Asset preload | ✅ PASS | `preloadAssets()` async, onerror resolves for fallback guarantee |

### FAIL Items (Bugs)

---

#### B1 [CRITICAL] — waveComplete() repeated call bug (infinite gold/score accumulation)

**Location:** `updateWave()` (line ~403) → `waveComplete()` (line ~417)

**Symptoms:**
- After clearing wave 1, gold is **2,380G** (expected: ~105G), score is **27,900** (expected: ~600)
- Game economy system is completely broken

**Cause:**
```javascript
function updateWave(dt) {
  if (waveSpawned >= waveTotal) {
    if (enemies.length === 0 && waveKilled >= waveTotal) waveComplete(); // ← called every frame!
    return;
  }
```
`waveComplete()` handles state transition via tween onComplete (1.5 seconds), so during that 1.5 seconds the state is still PLAYING → `updateWave()` calls `waveComplete()` every frame.

**Fix:**
```javascript
let waveClearing = false; // add guard flag

function updateWave(dt) {
  if (waveSpawned >= waveTotal) {
    if (!waveClearing && enemies.length === 0 && waveKilled >= waveTotal) {
      waveClearing = true;
      waveComplete();
    }
    return;
  }
  // ...
}

function startWave() {
  waveClearing = false;
  // ... existing code
}
```

---

#### B2 [CRITICAL] — Game over transition races with waveComplete (game over impossible)

**Location:** `endGame()` (line ~748) vs `waveComplete()` (line ~417)

**Symptoms:**
- Even when lives reach 0, GAMEOVER screen is not shown and transitions to WAVE_PREP instead
- Game cannot be ended normally

**Cause:**
- `endGame()` tween (0.8s) → GAMEOVER transition
- `waveComplete()` tween (1.5s) → WAVE_PREP transition
- When both tweens run simultaneously, the later-completing waveComplete tween overwrites GAMEOVER
- Combined with B1: waveComplete is called every frame so new tweens keep stacking

**Fix:**
```javascript
function waveComplete() {
  if (lives <= 0) return; // ignore wave clear if game over state
  // ... existing code
}
```
Or call `checkGameOver()` before `updateWave()`.

---

#### B3 [MINOR] — consecutiveCleanWaves logic always false

**Location:** `waveComplete()` line ~424

**Problem:**
```javascript
if (lives >= INIT_LIVES - (wave > 1 ? 0 : 0)) consecutiveCleanWaves++;
// ↑ (wave > 1 ? 0 : 0) is always 0 → only counts when lives >= 20
```
- Only works when not a single life has been lost since game start
- `livesAtWaveStart` variable is declared (line 444) but never updated/used

**Fix:**
```javascript
function startWave() {
  livesAtWaveStart = lives; // record at wave start
  // ...
}

function waveComplete() {
  if (lives >= livesAtWaveStart) consecutiveCleanWaves++;
  else consecutiveCleanWaves = 0;
  // ...
}
```

---

#### B4 [MINOR] — SVG assets use feGaussianBlur filter

**Location:** `assets/player.svg`, `assets/enemy.svg`

**Problem:**
- Spec §0-1: "**No SVG filters whatsoever**. Create all assets with pure Canvas Path2D drawing"
- `player.svg` uses `<filter id="glow"><feGaussianBlur>`, `<filter id="softGlow">`
- `enemy.svg` uses `<filter id="enemyGlow">`, `<filter id="threatAura">`
- Canvas fallback drawing is properly implemented so **no functional issues**, but violates spec

**Impact:** Possible SVG filter rendering issues in some browsers/environments (Cycle 2 B5 recurrence risk)

---

## 2. Browser Test (Puppeteer)

**Test environment:** Chromium (Puppeteer), file:// protocol

| Item | Result | Notes |
|------|--------|-------|
| Page load | ✅ PASS | Normal load, 0 console errors |
| No console errors | ✅ PASS | No errors/warnings |
| Canvas rendering | ✅ PASS | Canvas created and rendering normally |
| Start screen display | ✅ PASS | Title, best record, controls guide, blinking start prompt |
| Asset load (8 SVGs) | ✅ PASS | player, enemy, bgLayer1, bgLayer2, uiHeart, uiStar, powerup, effectHit all loaded |
| manifest.json | ✅ PASS | 8 assets + thumbnail defined, gameId matches |
| Tower placement | ✅ PASS | Archer tower placed at (0,0), (2,0) successfully, gold deducted correctly |
| Wave start | ✅ PASS | Space key transitions WAVE_PREP → PLAYING, enemy spawn confirmed |
| Enemy kill & gold | ❌ FAIL | B1 bug causes abnormal gold/score accumulation (wave 1: 2380G) |
| Wave clear → next wave | ⚠️ PARTIAL | Transition works but economy system broken due to B1 |
| Pause (P key) | ✅ PASS | PLAYING ↔ PAUSE toggles normally |
| Pause (ESC key) | ✅ PASS | PLAYING → PAUSE transitions normally |
| Confirmation modal (Pause→R) | ✅ PASS | PAUSE → CONFIRM_MODAL, Y/N works correctly |
| Game over | ❌ FAIL | B2 bug causes GAMEOVER screen to be overwritten by WAVE_PREP |
| Score system | ❌ FAIL | Score accuracy unverifiable due to B1 bug |
| localStorage best score | ✅ PASS | `mtd_bestScore`, `mtd_bestWave` save/read normally |
| Touch event code exists | ✅ PASS | touchstart, touchmove implemented, passive:false |
| Tower range display | ✅ PASS | Circular range shown when tower info panel is selected |
| HUD display | ✅ PASS | Wave, gold, lives, score, progress bar rendering correctly |
| Bottom tower bar | ✅ PASS | 3 tower type buttons + gray/red cost when gold insufficient |

### Screenshot Evidence

1. **Title screen** — Normal (terminal style background, bgLayer1 applied, controls guide)
2. **WAVE_PREP screen** — Normal (S-shaped path, grid, HUD, WAVE START button)
3. **PLAYING screen** — Tower placement/attack normal, but gold/score spike after wave completion
4. **GAMEOVER screen** — ❌ FAIL (GAMEOVER screen not shown due to B2 bug, transitions to WAVE_PREP)

---

## 3. Spec Cross-Reference Checklist (§13.4)

| Item | Result |
|------|--------|
| tw.update(dt) called in all states | ✅ |
| 0 setTimeout usages | ✅ |
| Score judgment→save order | ✅ |
| 0 unused assets / external CDNs | ✅ (0 external dependencies) |
| destroy() pattern with listener cleanup | ✅ |
| 5 easing functions implemented | ✅ |
| Canvas modal only (0 confirm/alert) | ✅ |
| waveComplete duplicate call prevention | ❌ (B1) |
| Game over transition stability | ❌ (B2) |
| consecutiveCleanWaves dynamic balance | ❌ (B3, effectively non-functional) |
| SVG filter non-usage principle | ❌ (B4, Canvas fallback exists but SVGs contain filters) |

---

## 4. Summary

### Positives
- **Most Cycle 2 lessons reflected**: TweenManager updates in all states, setTimeout ban, score judgment-save order, destroy() pattern, Canvas modal
- **Excellent architecture quality**: 7-state state machine fully implemented, ObjectPool, listen() helper, state×system matrix comment
- **Rich game content**: 3 tower types × 3 tiers, 4 enemy types, 20-wave scaling, economy system, 4 Web Audio SFX
- **Asset system**: 8 SVG assets + manifest.json + Canvas fallback drawing complete

### Fixes Needed
- **B1 [CRITICAL]**: `waveComplete()` repeated call — fixable by adding 1 guard flag line
- **B2 [CRITICAL]**: Game over transition race — fixable by adding 1 lives check line to `waveComplete()`
- **B3 [MINOR]**: consecutiveCleanWaves logic — fix to use `livesAtWaveStart`
- **B4 [MINOR]**: SVG assets' feGaussianBlur — remove filters or switch to Canvas-only drawing

---

## 5. Final Verdict

### Code Review: **NEEDS_MAJOR_FIX**
### Test: **FAIL**

**Reasoning:** B1 (waveComplete repeated call) and B2 (game over impossible) are CRITICAL bugs that fundamentally prevent gameplay. Even clearing wave 1 inflates gold to 2,380G, breaking economy balance, and the game over screen never appears when lives reach 0. Both bugs have small fix scopes (1~2 lines each), but they impact the core game loop so **coder rework followed by re-verification is required**.
