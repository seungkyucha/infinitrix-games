---
verdict: NEEDS_MAJOR_FIX
game-id: gem-royal-challenge
cycle: 49
reviewer: QA-agent
review-round: 2
date: 2026-03-28
---

# Cycle 49 QA Review — Gem Royal Challenge (Round 2)

## Final Verdict: NEEDS_MAJOR_FIX

---

## 0. Summary

A **critical runtime bug** was discovered during the 2nd review round.
Function override patterns using `function` declarations cause **infinite recursion
(Maximum call stack size exceeded) in 9 functions** due to JavaScript hoisting,
rendering the game as a **completely black screen**.

---

## 1. Critical Bug: Function Override Infinite Recursion (BLOCKER)

### Root Cause
In the latter sections of the code (§48, §101–§110), the following pattern is used
to extend existing functions:

```js
const _origRenderTitle2 = renderTitle;   // line 4575
function renderTitle(ctx) {              // line 4576 — function DECLARATION!
  _origRenderTitle2(ctx);                // ← calls itself
  renderTitleCredits(ctx);
}
```

**Problem**: `function renderTitle(ctx)` is a **function declaration** and is hoisted.
When two `function renderTitle` declarations exist in the same scope, the last one
(line 4576) wins during hoisting. Therefore, when `const _origRenderTitle2 = renderTitle`
executes, `renderTitle` already points to the wrapper function at line 4576,
making `_origRenderTitle2(ctx)` a **self-call** → infinite recursion.

### Correct Pattern (assignment)
```js
const _origRenderTitle2 = renderTitle;   // captures the original
renderTitle = function(ctx) {            // assignment override (not declaration)
  _origRenderTitle2(ctx);
  renderTitleCredits(ctx);
};
```

### Affected Functions (9 total)

| # | Function | Original Line | Override Line | _orig Capture Line |
|---|----------|--------------|---------------|-------------------|
| 1 | `renderHUD` | 2377 | 3662 | 3661 (`_baseRenderHUD`) |
| 2 | `renderLevelIntro` | 2605 | 4499 | 4498 |
| 3 | `renderResult` | 2687 | 4514 | 4513 |
| 4 | `handleMiniResultInput` | 3296 | 4546 | 4545 |
| 5 | `renderMiniResult` | 2785 | 4558 | 4557 |
| 6 | `renderTitle` | 2470 | 4576 | 4575 |
| 7 | `handleTitleInput` | 3045 | 4581 | 4580 |
| 8 | `renderEventHub` | 2559 | 4589 | 4588 |
| 9 | `finishCascade` | 1346 | 4654 | 4653 |

### Fix
Change all 9 from `function funcName(...)` to `funcName = function(...)`.

### Puppeteer Verification
```
[IX.Engine] RangeError: Maximum call stack size exceeded
```
- renderTitle: Maximum call stack size exceeded
- renderHUD: Maximum call stack size exceeded
- coreRender: Maximum call stack size exceeded
- Screen: completely black (nothing renders)

---

## 2. Static Analysis Checklist

### 1. preventDefault()
- **Status**: PASS
- `contextmenu` has `e.preventDefault()` (line 3454)
- Touch events registered with `{passive:true}` — scroll prevention via CSS `touch-action:none`

### 2. requestAnimationFrame + delta time
- **Status**: PASS
- Engine class provides rAF loop, `dtMs` → `coreUpdate(dtMs / 1000)` for seconds
- BGM uses dt-based timer (`bgmTimer += dt`, line 1703)
- 0 `setTimeout` calls in game logic, 0 `setInterval` calls

### 3. Touch Events
- **Status**: PASS
- `touchstart` (lines 3391, 3500), `touchend` (lines 3402, 3508), `touchmove` (line 3509)
- Swipe threshold 30px (per spec §3)
- Long-press 500ms (line 3506) — gem info popup
- Minimum touch target 48px (`MIN_TOUCH = 48`, line 153)

### 4. State Transition Flow
- **Status**: PASS (architecture is excellent)
- 18 state enum + TRANSITION_TABLE whitelist (lines 74–94)
- `deferredQueue` deferred transition (lines 371–372) — prevents synchronous transitions in enterState
- `beginTransition()` → fade → `enterState()` chain
- 11 GUARD flags + `isInputBlocked()` single gate

### 5. localStorage High Score Save/Load
- **Status**: PASS
- `Save.set()` / `Save.get()` (IX Engine API, lines 799–822)
- `gSaveData` structure: levelProgress, boosters, streaks, settings, totalStars
- Auto-save on level clear (lines 1813–1825)

### 6. Canvas Resize + devicePixelRatio
- **Status**: PASS
- Engine provides `onResize(w,h)` callback (line 3361)
- All coordinates dynamically computed via `Layout.cx()`, `Layout.cy()`
- `getCellSize()` responsive based on `window.innerWidth/innerHeight`

### 7. No External CDN Dependencies
- **Status**: PASS
- No Google Fonts; system font `system-ui` only
- No external scripts (only local `/engine/ix-engine.js`)
- No external images/CDN

---

## 3. Spec Compliance

| Spec Requirement | Status | Notes |
|-----------------|--------|-------|
| 8×8 grid, 6 gem colors | Implemented | ROWS=8, COLS=8, GEM_TYPES=6 |
| Match priority 5→T/L→4→3 | Implemented | findMatches() §17, used[][] tracking |
| 6 special combos | Implemented | checkSpecialCombo() §18 |
| 8 obstacle types (PIE new) | Implemented | OBS enum 8 types, gPieData 6 pieces |
| 4 boosters | Implemented | §26 complete |
| 30 levels (25+5 event) | Implemented | LEVELS array 30 entries |
| King's Cup 5 AI players | Implemented | kingsCupGenerateAI() §34 |
| Daily Challenge (seeded) | Implemented | getDailyChallengeDef() + SeededRNG |
| Super Booster streak rewards | Implemented | §33 SUPER_BOOSTER state |
| Team Battle 4 teams | Implemented | teamBattleGenerateAI() §34 |
| 4 mini-games standalone | Implemented | MINI_HUB state + 4 types |
| deferredTransition queue | Implemented | §11 + consumed in coreUpdate tail |
| DDA 3 levels | Implemented | applyDdaToBoard() §27 |
| Color blind mode | Implemented | GEM_SHAPES + F5 toggle |
| i18n ko/en | Implemented | LANG object + T() function |
| King character emotions | Implemented | idle/happy/scared/surprised |

---

## 4. Browser Test Results

| Test | Result | Notes |
|------|--------|-------|
| A: Load + Title | **FAIL** | Black screen. renderTitle infinite recursion |
| B: Space to Start | **FAIL** | Cannot test — rendering broken |
| C: Movement Controls | **FAIL** | Cannot test — rendering broken |
| D: Game Over + Restart | **FAIL** | Cannot test — rendering broken |
| E: Touch Actions | **FAIL** | Cannot test — rendering broken |

> Engine loads successfully (IX exists, gState=TITLE, assetsLoaded=true).
> However, `coreRender()` throws stack overflow every frame,
> resulting in a completely black screen.

---

## 5. Positive Code Quality Aspects

Excluding the runtime bug, the code architecture is excellent:

1. **TRANSITION_TABLE whitelist** — blocks invalid state transitions
2. **deferredTransition queue** — eliminates synchronous transitions in enterState (spec F1)
3. **11 GUARD flags** + `isInputBlocked()` single gate
4. **safeGridAccess()** — wraps all grid accesses
5. **SeededRNG** — 0 Math.random() calls, fully deterministic
6. **drawAssetOrFallback** — canvas fallbacks for all 72 PNG assets
7. **18 procedural SFX** + dt-based BGM
8. **4 fully independent mini-games**
9. **4 event types** (King's Cup, Daily, Team, Super Booster)
10. **Auto-shuffle** — automatic board reshuffle when no valid moves (§109)

---

## 6. Required Fixes

### RED — BLOCKER (Must Fix)
1. **Fix 9 function override infinite recursions**
   - Lines: 3662, 4499, 4514, 4546, 4558, 4576, 4581, 4589, 4654
   - Change `function funcName(...)` → `funcName = function(...)`

### YELLOW — MINOR (Post-deploy improvements)
2. Wood obstacle `obsLayer` defaults to 1 but spec says "1 adjacent match" — verify consistency
3. `renderMap` overridden twice (§54 + §98) — chain works but reduces readability
4. Mixed override patterns (`const _orig` + assignment vs `const _orig` + declaration) — unify

---

## 7. Conclusion

The code architecture and feature scope are impressive, faithfully implementing nearly
all spec requirements. However, a **systematic error in the function override pattern**
prevents the game from running at all.

**The fix is straightforward**: remove the `function` keyword and use assignment
for all 9 affected locations. After this fix, the game has a high probability of
receiving APPROVED status on the next review round.
