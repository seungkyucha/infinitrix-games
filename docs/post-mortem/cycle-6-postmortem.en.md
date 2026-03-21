---
cycle: 6
game-id: mini-golf-adventure
title: Mini Golf Adventure
date: 2026-03-20
verdict: APPROVED
---

# Mini Golf Adventure — Post-Mortem

## One-Line Summary
We built a 10-level top-down mini golf game with wall reflection, friction, and portals using pure 2D vector math — no external physics library.

## What We Built
A top-down 2D mini golf game where you drag mouse/touch to control the ball's direction and force, aiming to hole the ball in minimum strokes. Progressing through 10 sequential levels, each introduces new elements: wall reflection, sand zones (increased friction), water hazards (penalty), moving walls, and portals. A trajectory preview showing up to the first reflection lets you plan "if I hit at this angle, it bounces off the wall into the hole" — that calculated satisfaction is core.

Being the first physics-based game on the InfiniTriX platform is its biggest significance. Adding physics mechanics absent from the 5 existing games (puzzle/shooting/strategy/runner/rhythm puzzle) while setting difficulty to easy lowers the entry barrier. The 3-star system and hole-in-one bonus (+500 points) drive replay motivation.

## What Went Well ✅
- **100% spec fidelity achieved**: All 22 checklist items PASS. Received APPROVED on 2nd re-review, with both 1st-round issues (assets/ remaining, perfect reflection bonus not implemented) cleanly fixed.
- **Forbidden patterns completely eliminated**: The SVG asset issue that recurred for 4 consecutive cycles finally reached 0 occurrences. The principle of not creating the assets/ directory at all was effective, and the 3-stage automated verification (before/during/after coding) also produced results.
- **Physics calculation accuracy**: Normal vector-based wall reflection, point-to-segment distance collision detection, and friction deceleration model implemented with mathematical precision. Generous hole detection (visual 16px, detection 20px) nicely captures the "barely made it in" satisfaction.
- **Practical application of Cycle 5 lessons**: Single update path principle (ball.x/y only in physics loop), complete setTimeout elimination, enterState() pattern, clearImmediate() API all stably inherited.
- **Perfect touch support**: The drag-aiming control naturally integrates touch and mouse, enabling all core gameplay without a keyboard.

## Pain Points / Room for Improvement ⚠️
- **assets/ recurrence in 1st round**: Despite planning 3-stage automated verification, the assets/ directory was found in 1st review. Enforcing verification script execution timing remains a challenge.
- **speed() function coupling**: The global `speed()` function directly depends on the `ball` object, reducing testability. Parameterizing it as a pure function would enable unit testing.
- **Potential physics skip during Space acceleration**: Wall collisions might frame-skip during 4x speed. Currently addressed with a 3-iteration loop, but substep physics would be more robust.
- **No level editor**: 10 levels are hardcoded as JS array literals. With more time, a visual level editor or JSON-based level loader would improve extensibility.

## Technical Highlights 🛠️
The core technology of this game is **2D physics simulation without external libraries**. We directly implemented a Vector2 class to handle normal vector reflection (`V' = V - 2·dot(V,N)·N`) and energy loss (×0.85). Point-to-segment distance function (`pointToSegmentDist`) detects ball-wall collisions, and friction coefficients (0.985/0.95) implement the deceleration model.

The trajectory preview system is also interesting — it simulates actual physics for 20 steps and displays the dotted line up to the first reflection. This gives players confidence in "predictable physics" while maintaining challenge by hiding reflections beyond the first.

The portal system prevents infinite loops with a 30-frame cooldown, and moving walls create predictable timing puzzles with sin-based oscillation. Caching grass texture on offscreen canvas to avoid per-frame background redrawing was also a practical optimization.

## Suggestions for Next Cycle 🚀
1. **Separate shared engine module**: TweenManager, ObjectPool, TransitionGuard, listen/destroy, Web Audio utilities stabilized over 6 cycles. Extracting to `shared/engine.js` would drastically reduce boilerplate and propagate bug fixes across all games.
2. **Asynchronous competition system**: All 6 games are solo play. A localStorage-based "daily seed" challenge prototype adding competition without external servers is worth trying.
3. **Challenge simulation/management genre**: Having covered puzzle→shooting→strategy→runner→rhythm→physics, expanding the portfolio with a resource management + decision-based management/simulation genre is feasible.
