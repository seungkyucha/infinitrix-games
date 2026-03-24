---
game-id: mecha-garrison
cycle: 36
reviewer: claude-qa
date: 2026-03-24
verdict: NEEDS_MAJOR_FIX
attempt: 1
---

# Cycle #36 Code Review — Mecha Garrison

## Final Verdict: ❌ NEEDS_MAJOR_FIX

> **Game permanently stuck at ZONE_INTRO screen. Cannot transition to PLACEMENT state — gameplay completely impossible.**
> Root cause: `beginTransition()` does not reference `RESTART_ALLOWED`, causing 10 out of 12 critical transitions to be blocked by STATE_PRIORITY.

---

## P0: Critical Bug (Game-Breaking)

### B1. STATE_PRIORITY Bug — 7th Recurrence (Cycles 21/23/24/25/27/28/32 → 36)

**Code location**: Line 2078-2079
```javascript
function beginTransition(fromState, toState, duration) {
  if (STATE_PRIORITY[toState] < STATE_PRIORITY[G.state] && G.state !== STATES.PAUSED) return;
  // ...
}
```

**Problem**: `RESTART_ALLOWED` (Line 175) is declared but **never referenced** in `beginTransition()`. Only PAUSED is exempted, causing **10 reverse transitions to be completely blocked**.

**Blocked transitions (verified via Puppeteer)**:

| FROM (priority) | TO (priority) | Result |
|-----------------|---------------|--------|
| ZONE_INTRO (50) | PLACEMENT (30) | ❌ Blocked — **cannot start game** |
| WAVE (70) | WAVE_CLEAR (35) | ❌ Blocked — **waves never end** |
| WAVE (70) | REWARD_SELECT (30) | ❌ Blocked |
| WAVE (70) | BOSS_INTRO (60) | ❌ Blocked |
| BOSS_FIGHT (80) | BOSS_CLEAR (55) | ❌ Blocked |
| BOSS_CLEAR (55) | ZONE_INTRO (50) | ❌ Blocked |
| GAMEOVER (100) | ZONE_INTRO (50) | ❌ Blocked — **cannot restart** |
| GAMEOVER (100) | HUB (20) | ❌ Blocked — **cannot return to hub** |
| VICTORY (90) | HUB (20) | ❌ Blocked — **cannot exit victory** |
| WAVE_CLEAR (35) | REWARD_SELECT (30) | ❌ Blocked |

**Fix**: Add ESCAPE_ALLOWED dictionary to `beginTransition()`:
```javascript
const ESCAPE_ALLOWED = {
  PAUSED:true, GAMEOVER:true, VICTORY:true, BOSS_CLEAR:true,
  WAVE_CLEAR:true, ZONE_INTRO:true, BOSS_INTRO:true,
  REWARD_SELECT:true, WAVE:true, BOSS_FIGHT:true
};
function beginTransition(fromState, toState, duration) {
  if (STATE_PRIORITY[toState] < STATE_PRIORITY[G.state] && !ESCAPE_ALLOWED[G.state]) return;
  // ...existing logic
}
```

---

## P1: Important Bug

### B2. assets/ Directory F1 Violation — 36 Consecutive Cycles

**Observation**: `public/games/mecha-garrison/assets/` contains 10 files:
- bg-layer1.svg, bg-layer2.svg, effect-hit.svg, enemy.svg, player.svg
- powerup.svg, thumbnail.svg, ui-heart.svg, ui-star.svg, manifest.json

**Code reference**: Lines 509-533 actively load 8 SVGs via `ASSET_MAP` + `preloadAssets()`.

**Impact**: Canvas fallbacks exist for 100% of draw functions, so game would work without assets. However, this clearly violates spec §4.1 "assets/ directory creation strictly forbidden".

**Fix**:
1. Remove `ASSET_MAP`, `SPRITES`, `preloadAssets()` code entirely
2. Remove conditional `SPRITES.*` branches (keep Canvas fallback only)
3. Physically delete `assets/` directory (move thumbnail.svg to game root)
4. Remove `await preloadAssets()` from `boot()`

---

## Code Review Checklist

### 📌 1. Game Start Flow
| Item | Result | Notes |
|------|--------|-------|
| Title/start screen exists | ✅ PASS | Renders correctly with SVG mecha + Canvas particles + glitch effect |
| SPACE/click/tap to start | ❌ **FAIL** | Progresses to ZONE_INTRO but **cannot enter PLACEMENT** |
| Initial state properly reset | ✅ PASS | `initRun(G)` resets all: coreHP, energy, mechas, enemies, projectiles, part bonuses |

### 📌 2. Input System — Desktop
| Item | Result | Notes |
|------|--------|-------|
| keydown/keyup registered | ✅ PASS | Lines 434-439, on window, with preventDefault |
| Movement keys work | ⚠️ N/A | TD genre — no direct movement (grid placement system) |
| Action keys work | ✅ PASS | Space(wave start/speed), 1-5(mecha select), Q(ultimate), R(restart) |
| Pause (ESC) | ✅ PASS | Lines 2694-2698, direct `G.state = STATES.PAUSED` — works correctly |

### 📌 3. Input System — Mobile
| Item | Result | Notes |
|------|--------|-------|
| touchstart/touchmove/touchend | ✅ PASS | Lines 456-491, passive:false + preventDefault |
| Virtual joystick/touch buttons | ✅ PASS | Bottom panel: 5 mecha buttons + wave/speed/pause controls |
| Touch → game logic connection | ✅ PASS | hitTest() single function (F16/F26), grid cell touch placement |
| Touch target 48px+ | ✅ PASS | `btnSize = Math.max(48, Math.min(56, w/8))` — minimum 48px guaranteed |
| Scroll prevention | ✅ PASS | `touch-action:none; overflow:hidden` (Line 9) |

### 📌 4. Game Loop & Logic
| Item | Result | Notes |
|------|--------|-------|
| requestAnimationFrame | ✅ PASS | Line 2278, called every frame |
| Delta time | ✅ PASS | `Math.min(rawDt, 50) * G.speed` — 50ms cap + speed multiplier |
| Collision detection | ✅ PASS | Projectile-enemy distance-based (400=20px²), BFS path tracking |
| Score increment path | ✅ PASS | `applyDamage()` → `G.score += SCORE_KILL_BASE * (zone+1)` |
| Difficulty progression | ✅ PASS | DDA 4-level + wave/zone HP/speed multipliers + night range reduction |

### 📌 5. Game Over & Restart
| Item | Result | Notes |
|------|--------|-------|
| Game over condition | ✅ PASS | `G.coreHp <= 0` (Line 2407) |
| Game over screen | ✅ PASS | `drawGameOverScreen()` — score, CP, hub return button |
| localStorage high score | ✅ PASS | `SAVE_KEY='mecha-garrison-v1'`, `savePersistent()` (Line 1630) |
| R key/tap restart | ❌ **FAIL** | `beginTransition(G.state, STATES.ZONE_INTRO, 600)` — **blocked by STATE_PRIORITY** |
| Full state reset | ✅ PASS | `initRun(G)` resets everything (code correct but unreachable) |

### 📌 6. Screen Rendering
| Item | Result | Notes |
|------|--------|-------|
| Canvas size | ✅ PASS | `window.innerWidth × innerHeight` (Lines 2246-2248) |
| devicePixelRatio | ✅ PASS | `const dpr = window.devicePixelRatio \|\| 1` + `ctx.setTransform(dpr,...)` |
| Resize event | ✅ PASS | `window.addEventListener('resize', resizeCanvas)` (Line 2271) |
| All states render | ⚠️ Partial | TITLE/STORY_INTRO/ZONE_INTRO verified; PLACEMENT onwards unreachable |

### 📌 7. External Dependency Safety
| Item | Result | Notes |
|------|--------|-------|
| External CDN count: 0 | ✅ PASS | `'Segoe UI',system-ui,sans-serif` system fonts only |
| SVG load failure fallback | ✅ PASS | All draw functions have `if (SPRITES.x) { drawImage } else { Canvas drawing }` |

---

## Browser Test Results

| Test | Result | Screenshot | Notes |
|------|--------|------------|-------|
| A: Load + Title | ✅ PASS | 01-boot-screen | Title renders correctly, SVG mecha displayed |
| B: Space to Start | ❌ **FAIL** | 04-stuck-at-zone-intro | STORY_INTRO→ZONE_INTRO works, **PLACEMENT unreachable** |
| C: Movement/Placement | ❌ **FAIL** | N/A | Cannot reach PLACEMENT to test |
| D: Game Over + Restart | ❌ **FAIL** | N/A | Cannot reach gameplay |
| E: Touch Input | ⚠️ Partial | N/A | TITLE→STORY_INTRO touch works, further untestable |

### Puppeteer Verification Details

**Test A: Title Screen Load**
- Navigated to `file:///C:/Work/InfinitriX/public/games/mecha-garrison/index.html`
- 3-second wait + screenshot — title renders correctly
- `window.__errors = []` — 0 console errors

**Test B: SPACE Input to Start Game**
1. `G.input.keys['Space'] = true` → TITLE → STORY_INTRO transition succeeded
2. Space again → STORY_INTRO → ZONE_INTRO succeeded ("Zone 1 — City Outskirts" displayed)
3. Space again → **No change from ZONE_INTRO**
4. State check: `{ state: "ZONE_INTRO", prevState: "STORY_INTRO" }` — permanently stuck
5. `willBlock` verification: `STATE_PRIORITY['PLACEMENT'](30) < STATE_PRIORITY['ZONE_INTRO'](50) && state !== 'PAUSED'` → **true (blocked)**

**Full Transition Verification**:
- 10 of 12 critical transitions confirmed blocked (verified via Puppeteer evaluate)
- Only 2 pass: BOSS_CLEAR→VICTORY (55→90), WAVE_CLEAR→BOSS_INTRO (35→60)

---

## Positive Aspects

1. **Code structure**: 11 clearly defined REGIONs. Full TD roguelite system in 3500 lines
2. **transAlpha proxy pattern**: `G._transProxy` → synced to `G.transAlpha` in game loop (Line 2286) — Cycle 24's disconnection bug is fixed
3. **BFS pathfinding**: Path blocking validation on placement + enemy path recalculation — core TD mechanic properly implemented
4. **DDA system**: 4-level difficulty adjustment based on consecutive deaths — spec §7.6 compliant
5. **Parts system**: 3 rarities × 3 choices + DPS cap (2.0) — spec §7.4/F27 compliant
6. **bossRewardGiven guard flag**: F17 pattern correctly applied (Line 2381)
7. **Boss weakpoint exposure mechanic**: 8-second cycle with 3-second exposure — strategic timing element
8. **Procedural SFX/BGM**: 15 SFX types + 6 BGM moods — 0 external audio files
9. **Bilingual (ko/en)**: 60+ strings + extended LANG — F20 compliant
10. **Touch input**: hitTest() single function + long press sell + double tap upgrade — mobile UX consideration

---

## Fix Priority

| Priority | Bug ID | Description | Est. Difficulty |
|----------|--------|-------------|-----------------|
| **P0** | B1 | STATE_PRIORITY beginTransition() ESCAPE_ALLOWED not applied | Easy (5 line fix) |
| **P1** | B2 | assets/ F1 violation + ASSET_MAP/SPRITES code removal | Medium (50 lines to delete) |

---

## Conclusion

Code structure and game mechanic design are excellent, but the **STATE_PRIORITY bug permanently stalls the game at ZONE_INTRO**, making gameplay completely impossible. This bug is the **7th recurrence** since Cycle 21, following the exact same pattern of declaring `RESTART_ALLOWED` but never referencing it in `beginTransition()`.

Fixing B1 (P0) alone should make the game fully functional. B2 (P1) should also be addressed. A 2nd attempt review is needed after fixes to verify the complete play flow.
