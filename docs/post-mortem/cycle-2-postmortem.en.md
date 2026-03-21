---
cycle: 2
game-id: star-guardian
title: Star Guardian
date: 2026-03-20
verdict: NEEDS_MAJOR_FIX
---

# Star Guardian — Post-Mortem

## One-Line Summary
We validated TweenManager and ObjectPool infrastructure while building a neon space vertical shooter, only to ironically experience the core UI being invisible due to missing tween updates in certain states.

## What We Built
**Star Guardian** is a vertical scrolling shooter where the player controls a fighter craft to destroy enemy fleets arriving in waves across a space backdrop. With 4 enemy types (Scout, Fighter, Tank, Dart), a 3-phase cycling boss battle, 3 power-up types (weapon upgrade, HP recovery, shield), a combo system for kills within 1 second, and 5-tier score milestones — we packed the core fun of arcade shooting into a single HTML file of 1,185 lines.

Neon glow effects, screen shake, and explosion particles layered over a 3-layer parallax star background create high visual immersion. Supporting all 3 input types — keyboard (WASD+arrow keys), mouse (lerp tracking), and touch (virtual joystick+autofire) — each session lasts 3-7 minutes for short but intense "one more round" addictiveness. This was a meaningful cycle that challenged completely different technical territory (real-time input, collision detection, frame-based loops) from Cycle 1's puzzle.

## What Went Well ✅
- **Perfectly resolved 3 of 4 major Cycle 1 issues.** Removed Google Fonts (M1), cleaned up unused assets (M2), built TweenManager for animation system (M4). The strategy of explicitly organizing previous cycle feedback as a table in spec §0 was effective.
- **TweenManager + ObjectPool architecture validated in production.** Tween was used in 16+ places including enemy appearances, explosions, power-ups, wave text, HP bars, and hit flashes. ObjectPool eliminated GC pressure for 6 entity types including bullets, enemies, and particles. These two systems can become the platform's standard infrastructure.
- **Very high spec fidelity.** The strategy of specifying HEX codes and formulas in the spec proved effective again — movement/attack patterns for 4 enemy types + boss, power-up drop rates, and wave scaling formulas all matched. 18 of 20 feature checklist items fully implemented.
- **Handled 2x code growth.** From Cycle 1 (~600 lines) to Cycle 2 (~1,185 lines), complexity significantly increased but was structurally managed with a 6-state machine, object pooling, and tween system.

## Pain Points / Room for Improvement ⚠️
- **[B1/B2] Tween not updated in CONFIRM_MODAL and PAUSE states, causing Canvas modal to be fixed at alpha=0 (transparent).** Implemented Canvas modal to solve Cycle 1 M3 (confirm() replacement), but `tw.update(ms)` wasn't called in those state branches of `loop()`, so tween animations didn't progress. Pressing R showed an invisible modal — a critical UX flaw. Fix is just 1 line addition per state, but "which systems should run in each state" should have been planned as a matrix at design time.
- **[B4] NEW BEST判定 always returns false.** Comparing `score > getBest()` after calling `saveBest()` means comparing against the already-updated value, so the new record animation never displays. A 2-line order swap fixes this logic error.
- **[B3] setTimeout(600) remains for game-over transition.** Reuse of the pattern called out in Cycle 1 M4. Should be replaced with tween onComplete callback.
- **[B5] Background rectangle exposed when compositing enemy SVG with source-atop.** feGaussianBlur filter generates semi-transparent pixels across the entire viewBox. Visually distracting but doesn't affect gameplay.

## Technical Highlights 🛠️
The biggest technical achievement this cycle was **production validation of 2 reusable game infrastructure components**.

**TweenManager** can apply property interpolation animation to any object with a single `add(target, props, duration, easing, onComplete)` API. With 5 built-in easing functions (linear, easeOutQuad, easeInQuad, easeOutBack, easeOutElastic), it fundamentally solved the "game without movement" that was Cycle 1's biggest disappointment. However, the lesson learned this time was — even if you build the system, **it's useless if you don't call update in every state**.

**ObjectPool** pools 6 entity types including bullets, enemies, and particles using the acquire/release pattern. It maintained 60fps without GC spikes in a shooting game where dozens of objects are created/destroyed per frame. **Boss 3-phase AI** (straight burst → circular spread → homing missiles, accelerating below HP 50%) was also cleanly implemented as a state machine on top of a state machine.

Setting the player hitbox smaller (24×24) than the visual size (40×48) for "generous hit detection" was also a good choice in AABB collision. It brought perceived difficulty to an appropriate level, reducing "unlucky deaths."

## Suggestions for Next Cycle 🚀
1. **Introduce State × System Update Matrix** — The root cause of B1/B2 was that the requirement "Tween must run in CONFIRM_MODAL state" was missing from the design. Let's mandate a game state × system (tween, physics, input, render) matrix in the spec.
2. **Challenge Strategy/Simulation Genre** — Having covered puzzle (C1) and action (C2), let's validate the versatility of TweenManager and ObjectPool with tower defense or resource management.
3. **Experiment with Procedural Sound (Web Audio API)** — Only visuals have evolved over 2 cycles. It's time to prototype a procedural SFX system that generates sound effects without external assets.
