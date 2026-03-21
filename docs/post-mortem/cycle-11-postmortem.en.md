---
cycle: 11
game-id: mini-platformer
title: Mini Platformer
date: 2026-03-21
verdict: APPROVED
---

# Mini Platformer — Postmortem

## One-Line Summary
Built a Celeste-style precision platformer with 25 stages in a single HTML file, and after 3 review rounds finally resolved the assets/ issue that had been a persistent problem for 11 cycles, earning APPROVED.

## What We Built
A **precision action platformer** where players break through a crumbling ancient tower using wall jumps, dashes, and double jumps. 5 worlds (Forest→Cave→Sky→Lava→Starlight Tower) x 5 stages = 25 total stages were constructed with handcrafted level data. Input correction techniques proven in Celeste/Super Meat Boy — coyote time (6 frames), jump buffering (6 frames), corner correction (4px), and variable jump height — were faithfully implemented, achieving the feeling of "it moves exactly as I intended."

The core loop of respawning within 0.4 seconds of death creates "just one more try" addictiveness, while 3 gems per stage + speedrun timer provide replay value. New movesets unlock per world (W2: wall jump, W3: double jump, W4: dash) forming a natural learning curve. This was the first pure platformer genre on the InfiniTriX platform and a strategic choice to break away from the 60% casual genre concentration.

## What Went Well
- **Excellent precision platformer mechanics**: Coyote time, jump buffering, corner correction, variable jump height, wall slide, dash+afterimage — all core input correction techniques from the spec were accurately implemented. Achieved precise collision using AABB X→Y separation without external physics libraries.
- **Full mobile touch support across all paths**: Title→World select(arrows+tap)→Gameplay(D-pad+A/B/R)→Pause(pause btn)→Clear(tap) — entire flow playable via touch without keyboard. All 3 mobile issues (T1/T2/T3) pointed out in Round 2 were fixed.
- **All 19 code review items PASS**: Pure function principle, unified beginTransition transitions, ObjectPool particle management, try-catch game loop, TDZ prevention, clearImmediate(), dt parameter passing — all 10-cycle accumulated infrastructure fully compliant.
- **assets/ issue finally fully resolved**: Round 1 had 10 SVGs reappear, but Round 3 saw complete directory deletion + total removal of ASSET_MAP/SPRITES/preloadAssets code. All visuals confirmed to use Canvas API (fillRect, arc, lineTo, fillText) code drawing.
- **All 12 browser test items PASS**: 0 console errors, stable operation across the entire flow from load→start→world select→play→death→respawn→clear.

## Areas for Improvement
- **3 review rounds were needed**: Round 1 assets/ CRITICAL → Round 2 residual code CRITICAL → Round 3 APPROVED. If we had written Canvas-only from the start, Round 1 would have been sufficient. The fact that first-round pass was never achieved in 11 cycles despite explicit spec requirements definitively proves the need for CI enforcement mechanisms.
- **6 world-specific obstacle types unimplemented**: Crumbling platforms, falling rocks, wind push, disappearing cloud platforms, flame pillars, lasers were planned but not implemented. No impact on core mechanics, but differentiation between worlds is weakened.
- **Daily challenge (§6.5) completely unimplemented**: Both Seeded RNG-based procedural level generation and UI were missing. Focus on core mechanics left no capacity for additional modes. Separating this into a dedicated iteration is realistic.
- **Hidden gems/hidden stages unimplemented**: No collection content expansion means insufficient endgame content for mastery players.

## Technical Highlights
The most impressive technical achievement was **AABB-based tilemap collision with X→Y separation**. By separating horizontal and vertical movement detection and applying corner correction (4px) and hazard margin (3px), the classic platformer problem ("can't jump because stuck on wall corner") was solved. The world index-based conditional moveset activation (`CONFIG.ABILITIES[worldIdx]`) is a clean design that achieves progressive mechanic expansion with simple implementation.

The camera system is also noteworthy. The 4-layer combination of lerp tracking + look-ahead (anticipating movement direction) + screen shake + world boundary clamping ensures visual stability even during dashes. SoundManager synthesizes 9 sound effects directly via Web Audio API code, maintaining 0 external audio files. ObjectPool (150 particles) + tile viewport culling achieves stable performance across all 25 levels.

## Suggestions for Next Cycle
1. **Actually register assets/ blocking in CI/pre-commit hooks.** A simple 5-line script in `.git/hooks/pre-commit` that fails the commit when `public/games/*/assets/` exists would fundamentally resolve the 11-cycle persistent issue.
2. **Extract shared engine module (`shared/engine.js`).** The copy-paste structure of TweenManager, ObjectPool, TransitionGuard, SoundManager, createGameLoop (with built-in try-catch) across 11 games creates omission risk every time.
3. **Try unexplored genres like racing or simulation.** Physics engine know-how proven in the platformer (AABB collision, separation detection, camera tracking) can be reused for racing.
