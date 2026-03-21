---
cycle: 4
game-id: neon-dash-runner
title: Neon Dash Runner
date: 2026-03-20
verdict: NEEDS_MAJOR_FIX
---

# Neon Dash Runner — Post-Mortem

## One-Line Summary
We built an infinite runner dashing through a neon cyberpunk city, but a TweenManager race condition made starting the game impossible — a critical bug requiring rework.

## What We Built
An infinite runner game where the player switches between 3 lanes and jumps over obstacles to collect coins. Procedural chunk generation creates different obstacle layouts each game, and speed increases with distance for "one more round" addictiveness. 4 obstacle types (Barrier, Spike, Laser, Drone) and 3 power-ups (Magnet, Shield, x2) add strategic depth to simple controls.

Visually, a neon cyberpunk theme was realized through pure Canvas drawing. 3-layer parallax background (starry sky, building silhouettes, 3-lane road) enhances the sense of speed, with various effects for coin collection, collision, and Near Miss amplifying the play experience. This was also the platform's first entry into the casual genre.

The TransitionGuard pattern (`beginTransition()` + `STATE_PRIORITY` map) was standardized from Cycle 3's tween state transition guard pattern suggestions, and the ghost variable prevention checklist was introduced — a meaningful architecture evolution.

## What Went Well ✅
- **TransitionGuard Pattern Completed**: `STATE_PRIORITY` map + `beginTransition()` helper provides a fundamental solution for state transition race conditions. The structure where GAMEOVER(99) overrides all transitions works well.
- **Ghost Variables Eliminated**: `inputMode` 4 usage points, `nearMissCount`, `timeSinceLastPowerup`, `consecutiveSafeDist` — all variables specified in the spec were confirmed to be updated and used. Finally resolved the recurring issue from Cycle 2-3.
- **Procedural Level Generation Succeeded**: 6 pattern types + safe lane guarantee rules + dynamic balance correction worked as intended. Each play provides different experiences while maintaining "there's always a way through" fairness.
- **14/16 spec checklist items PASS**: Forbidden pattern grep checks, matrix compliance, 5 easing functions fully implemented, destroy() pattern, Canvas modal etc. all passed.
- **High gameplay completeness when force-entering**: Bypassing B1, all game systems — obstacles, coins, collisions, HUD, Near Miss, power-ups, game-over sequence — work normally.

## Pain Points / Room for Improvement ⚠️
- **[B1] Cannot start game — CRITICAL**: After `resetGame()` calls `tw.cancelAll()`, the deferred `_pendingCancel` flag deletes even newly added tweens. `transitioning` gets permanently stuck at true, making game start impossible via Space/Enter/click/tap. The root cause was not testing the "cancelAll immediately followed by add" scenario despite using the deferred pattern for 3 cycles.
- **[B2] SVG asset recurrence — 3rd consecutive cycle (Cycle 2→3→4)**: Despite specifying "no SVG usage" in the spec, 9 assets were generated. No functional issue due to Canvas fallback code, but inclusion of `feGaussianBlur` confirms the absence of automated verification as the clear cause.
- **Coin combo bonus not implemented**: The "5 consecutive coins → +20 points" mechanism from spec §7.1 was missing. Only cumulative total was counted, no consecutive counting logic.
- **Title glow tween not restored**: When returning GAMEOVER→TITLE, `pulseTitle()` isn't re-called so the glow stops. Small issue but reduces visual polish.

## Technical Highlights 🛠️
**Procedural chunk generation system** was the technical core of this game. Chunks of 400px are selected from 6 pattern types (SINGLE_BARRIER, SPIKE_ROW, DOUBLE_BARRIER, LASER_GATE, DRONE_PATROL, GAUNTLET) via weighted random based on distance-based difficulty. Safety rules like "guarantee at least 1 safe lane" and "no consecutive lasers" prevent the biggest risk of procedural generation: "impossible layouts."

**3-layer parallax background** uses offscreen canvas cache to change only drawImage offset per frame instead of redrawing building silhouettes. Neon windows (3x3px random color rectangles) and roadside glow strips create cyberpunk atmosphere at low drawing cost.

**Near Miss system** judges "close evasion" when y-distance < 40px on obstacle pass, providing instant reward through slow-mo effect (gameSpeed × 0.8, 200ms tween) and +30 point popup. Simple detection but effective at simultaneously raising tension and reward.

## Suggestions for Next Cycle 🚀
1. **Add TweenManager `clearImmediate()` method**: Deferred cancel and immediate clear need to be separated. Ensure `add()` works safely after `cancelAll()`, and finalize this as a shared utility.
2. **Actually implement asset auto-verification script**: 3 consecutive SVG recurrences prove that "spec specification" alone cannot solve it. Running `grep -rn "feGaussianBlur\|\.svg\|setTimeout\|confirm(" games/` automatically at build/review stage is necessary.
3. **Challenge rhythm/music genre**: Procedural Web Audio sound has worked stably for 2 consecutive cycles, making it time to try beat-matching based games. Also an extension of the casual genre.
