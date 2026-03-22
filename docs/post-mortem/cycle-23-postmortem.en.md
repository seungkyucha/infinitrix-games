---
cycle: 23
game-id: phantom-shift
title: Phantom Shift
date: 2026-03-22
verdict: APPROVED
---

# Phantom Shift — Post-Mortem

## One-Line Summary
Built a puzzle-action roguelike where players explore procedural dungeons by switching between light and shadow dimensions in real-time, filling the platform's puzzle+action genre gap.

## What We Built
Phantom Shift is a game where you become the "Guardian of Dimensions" and explore dungeons layered with a light world and a shadow world. Pressing Q switches dimensions — walls vanish and new paths open — and the core tension lies in timing your shifts to match enemies' dimensional attributes (light/shadow/mixed). Managing dimension energy while constantly deciding "switch now or save for the boss?" drives every moment.

Rich content spans 15 procedural dungeon floors + 3 bosses (Shadow Sentinel / Dimension Weaver / Shadow Lord) + a hidden stage (Floor 16: Origin of Light), with SeededRNG-based random items/relics and a permanent upgrade tree adding replay value. Three difficulty levels (Easy/Normal/Hard) and Korean/English dual language are supported.

This hybrid genre combining spatial puzzles (mentally overlaying two dimensions to find optimal routes) with real-time combat action (dodge + dimension-shift attacks) clearly differentiates itself from existing puzzle games (color-merge-puzzle, etc.).

## What Went Well ✅
- **First puzzle+action genre gap filled**: Successfully covered this 0-game combination on the platform, securing the most unique genre position across all 23 cycles.
- **5-round P0 bug finally resolved**: The GAMEOVER→TITLE transition block bug, unresolved for 5 consecutive rounds since Cycle 21 R1, was finally fixed with the `RESTART_ALLOWED` whitelist pattern. This pattern will become the standard for all future games.
- **BFS path verification (verifyPath)**: Guaranteed start→exit accessibility in both dimensions via BFS in procedural dungeon generation, structurally preventing "impossible map" scenarios.
- **F1–F43 record 43 feedback mappings**: All lessons accumulated over 23 cycles mapped in spec §0 with a 2-tier structure (verified summary + new details). Also resolved the feedback mapping verbosity issue (F43).
- **11 code quality highlights**: Asset references 0, setTimeout 0 (12 consecutive cycles), pure function drawing, TDZ prevention, ACTIVE_SYSTEMS matrix, ObjectPool, REGION 1–10 structure — all items PASS.
- **assets/ non-creation for 6 consecutive cycles**: Zero-asset principle established since Cycle 18 is now fully embedded.

## What Could Be Better / Improvement Opportunities ⚠️
- **Required 2nd review round 2**: P0 (GAMEOVER→TITLE) and P2 (skill button 48px shortfall) were submitted unresolved in initial implementation, requiring multiple rounds. Had the RESTART_ALLOWED pattern been specified at the planning stage, first-pass approval was achievable.
- **GAMEOVER→TITLE P0 bug persisted 5 rounds**: This recurring bug from Cycle 21 shows that STATE_PRIORITY guard's "reverse transition" exception handling wasn't systematized. Going forward, escape transitions from terminal states like GAMEOVER/VICTORY must be explicitly whitelisted in specs.
- **Single file size continues growing**: 2,400+ line single HTML file. Readability is secured via REGION comment separation, but shared engine module extraction has been delayed for 23 cycles. Limits are completely exceeded.
- **No automated balance verification**: No automated balance verification for the combination space of 15 floors × 3 difficulties × numerous relic/item combinations. Code review alone cannot determine if "certain relic combos are overpowered" or "late floors are impossible."
- **Multi-stakeholder feedback process**: The pattern of planner/designer feedback extending review rounds has recurred for 3 consecutive cycles (Cycle 21–23). Establishing a consolidation process is urgent.

## Technical Highlights 🛠️
- **Dual-dimension map system**: Manages light and shadow layers on the same grid. `isTileBlocked()` 4-point check applies only the current dimension's terrain to collision detection, with `tryDimensionShift()` handling energy cost + cooldown checks on Q key press.
- **SeededRNG procedural dungeons**: Seed-based random number generation reproduces identical dungeons from the same seed. verifyPath() BFS verification guarantees start→exit accessibility in both dimensions for safe procedural generation.
- **RESTART_ALLOWED pattern**: Manages STATE_PRIORITY reverse guard exceptions via explicit whitelist (`['GAMEOVER', 'VICTORY']`) in `beginTransition()`. The fundamental fix for a P0 bug unresolved for 5 rounds, and a standard pattern to apply to all future games.
- **ACTIVE_SYSTEMS matrix**: Explicitly defines active systems per 15 states, structurally preventing bugs where tweens/physics stop in specific states.
- **Light/shadow split visuals**: Title screen left-right split + central dimension rift line + light (#FFD700) / shadow (#8B5CF6) particles + 3px scanline effects powerfully convey the dual-dimension concept visually.

## Next Cycle Suggestions 🚀
1. **Shared engine module extraction**: Extract TweenManager, ObjectPool, TransitionGuard, RESTART_ALLOWED pattern, etc. to shared/engine.js. This task delayed for 23 cycles is the bottleneck for code quality.
2. **RESTART_ALLOWED pattern standardization**: Include the terminal-state escape whitelist validated this cycle as a mandatory item in spec templates, structurally preventing the same P0 bug from recurring.
3. **Procedural content balance simulator**: Develop a tool to auto-play 15 floors × 3 difficulties × relic combinations and statistically verify per-floor clear rates and relic preferences.
