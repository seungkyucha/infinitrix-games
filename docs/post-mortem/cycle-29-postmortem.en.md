---
cycle: 29
game-id: shadow-rift
title: Shadow Rift
date: 2026-03-23
verdict: APPROVED
---

# Shadow Rift — Post-Mortem

## One-Line Summary
Built a **Metroidvania roguelite** where players explore 5 interconnected zones, unlock abilities, and defeat bosses — implemented in 3,510 lines of pure Canvas code, APPROVED on review round 2-2.

## What We Built
Shadow Rift is a Metroidvania spanning 5 zones (Ruin, Crystal, Abyss, Magma, Void) × 3 rooms = 15 base rooms + 2 hidden rooms = 17 total stages. A 5-stage ability gating system (Dash → Wall Jump → Dimension Shift → Time Stop → Gravity Invert) provides nonlinear exploration paths. Clearing rooms offers a 3-choice artifact selection (common 6/rare 4/epic 3 = 13 total), creating different builds every run. Three permanent upgrade trees (Shadow/Rift/Echo) provide long-term progression incentive.

The core fun stays true to the Metroidvania essence: "unlock ability → backtrack to previously inaccessible areas." Melee/ranged attacks + ability combos, environmental puzzles (switches, moving platforms, dimension gates), and roguelite build diversity form three pillars, with 5 zone bosses + hidden boss "Void Weaver" (6 total) delivering climactic encounters. Three difficulty levels (Explorer/Warrior/Legend) + 3-tier DDA dynamic balancing accommodate various player skill levels.

## What Went Well ✅
- **APPROVED on round 2-2**: Improved from Cycle 28's "4-round review" issue, approaching the "APPROVED within 2 rounds" target set in the spec.
- **All P0/P1/P2 issues resolved**: `t` parameter shadowing (P0), complete assets/ reference removal (P1), and RESTART_ALLOWED dead code cleanup (P2) all completed. Zero remaining issues — ready for immediate deployment.
- **100% Canvas code drawing**: 3,510-line single file, 0 external assets, 0 CDN dependencies, 0 Math.random calls (full SeededRNG). F1 principle maintained for 13 consecutive cycles.
- **Zone-specific color palettes**: Each of the 5 zones has unique pri/sec/bg/enemy colors achieving strong visual differentiation without any assets. Glitch effect title, dimensional rift effects, game over shake — all 5/5 designer feedback items fully implemented.
- **Full planner feedback compliance (3/3)**: Enhanced smoke tests, state×system matrix validation, and 10 REGION code structure all reflected in the implementation.

## What Could Be Better ⚠️
- **No dedicated mobile ranged attack button**: Ranged attacks work via double-tap, but the lack of a dedicated UI button makes mobile UX less intuitive (P3). Future action games should finalize mobile button sets during early planning.
- **Required 2 review rounds**: `t` parameter shadowing (P0) and assets/ references (P1) were caught in round 1, preventing immediate APPROVED. The assets/ reference issue (ASSET_MAP/preloadAssets/SPRITES code remnants) represents the "inertial inclusion" pattern that has persisted for 28 cycles.
- **No balance verification**: The combination space of 5 zones × 6 bosses × 13 artifacts × 3 upgrade trees is vast, but no DPS/EHP simulation was performed. No way to verify whether extreme builds (e.g., all-in dash + attack artifacts) can actually clear.
- **Shared engine still not extracted (cycle 29)**: TweenManager, ObjectPool, SoundManager, InputManager etc. still copy-pasted per game. A significant portion of the 3,510 lines is reusable code.

## Technical Highlights 🛠️
- **`gt` parameter refactoring**: Fixed a P0 bug where 9 draw functions had a parameter `t` shadowing the global delta time variable, renamed to `gt` (game time) across all functions. A case study in how naming can cascade across entire function signatures.
- **Dimensional rift effect (`drawDimensionalRift()`)**: Pure Canvas effect combining radial gradients + fracture lines + vortex particles. `shadowBlur` glow with cyan+magenta gradients visually conveys dimensional instability.
- **SeededRNG procedural room variation**: Zero Math.random calls — all randomness processed through SeededRNG for reproducible procedural generation from identical seeds.
- **10 REGION code structure**: CONFIG→ENGINE→ENTITY→DRAW→ABILITY→COMBAT→ROGUE→STATE→SAVE→MAIN with unidirectional dependency flow, maintaining maintainability across 3,510 lines and serving as the starting point for future module extraction.
- **DDA 3-tier dynamic balance + 3-level difficulty**: Dual balance system combining automatic DDA (adjusting enemy HP/damage based on player performance) with Explorer/Warrior/Legend preset difficulties.

## Next Cycle Suggestions 🚀
1. **Begin shared engine module extraction**: Extract TweenManager, ObjectPool, TransitionGuard, SoundManager, hitTest(), touchSafe() — validated across 29 cycles — into `shared/engine.js`. Shadow Rift's 10 REGION structure is the optimal starting point.
2. **Balance simulator prototype**: Build a headless DPS/EHP auto-simulation tool for ability × artifact × boss combinations to detect "physically impossible combos" or "dominant builds" before they ship.
3. **Mobile UX standardization**: Standardize action game mobile button sets (including dedicated ranged attack button) and add automatic UI layout verification for small displays (≤400px) to the smoke test suite.
