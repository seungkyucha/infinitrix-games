---
cycle: 7
game-id: mini-survivor-arena
title: Mini Survivor Arena
date: 2026-03-20
verdict: APPROVED
---

# Mini Survivor Arena — Post-Mortem

## One-Line Summary
We implemented a Vampire Survivors-like top-down survivor with auto-attack and 12 skill builds in a single HTML file of 1,397 lines, battling 360-degree monster waves.

## What We Built
A top-down survivor game inspired by Vampire Survivors. The player controls only movement while attacks fire automatically. Facing 4 monster types (Normal/Fast/Tanker/Ranged) plus bosses every 5 waves, you select 1 of 3 skills on level-up to complete your build. You might fill the screen with projectiles via Multishot, or build close-range defense with Orbital+Shockwave.

The core fun comes from "different builds every run." The fantasy of a weak single-shot attack early becoming screen-filling bullet hell late is powerful. The combo system (×3.0 multiplier for kills within 2 seconds) and daily challenge (seed-based identical patterns) add replay motivation. Normal/Hard difficulty options and virtual joystick touch support ensure accessibility.

## What Went Well ✅
- **100% feature completeness**: All 20 core spec items (20 waves, 12 skills, boss 3-phase AI, daily challenge, combo, difficulty modes) fully implemented. Architecture 13 items + forbidden patterns 7 + required patterns 7 all PASS.
- **Pure function design succeeded**: Reflecting the global dependency issue flagged in Cycle 6, 18 core logic functions including `updatePlayer()`, `updateEnemies()`, `fireWeapon()`, `hitProjEnemy()`, `hitEnemyPlayer()`, `pickGems()` were written as parameter-based pure functions. 5 combat/collision functions' global P references found in 1st review were all parameterized by 2nd round.
- **Accumulated infrastructure stability**: TweenManager(clearImmediate), ObjectPool(4 types, 800 total), TransitionGuard(STATE_PRIORITY), EventManager(listen/destroy), Web Audio SFX 9 types — shared patterns refined over 6 cycles worked flawlessly in the new genre.
- **Declarative wave config**: `waveCfg(w)` function scales enemy count, spawn interval, HP/speed multiplier, and type ratios via formulas. Faithfully reflected the Cycle 6 feedback for minimal hardcoding.
- **2nd review APPROVED**: From 1st round NEEDS_MINOR_FIX → all 3 issues fixed → 2nd round with 0 console errors, all items PASS for immediate deployment judgment.

## Pain Points / Room for Improvement ⚠️
- **assets/ directory recurrence (1st round)**: Despite specifying "100% Canvas code drawing" and "no assets/ creation" in the spec, and even declaring closure in Cycle 5-6, SVG 9 files + manifest.json were found in 1st review. Deleted in 2nd round, but this problem repeated in most of 7 cycles **definitively proves** that spec specification alone cannot provide a fundamental solution. **A forced mechanism that fails the build when assets/ exists in CI/build hooks is essential.**
- **Partial pure function principle violation (1st round)**: 5 combat/collision functions directly referenced global P. All parameterized by 2nd round, but confirms that even when principles are specified in the spec, some violations occur during implementation, so exhaustive verification checklists are essential.
- **Critical value mismatch**: Spec Lv3=30% vs implementation 25%. Spec-implementation accuracy verification must go down to the numerical level, not just feature existence.
- **If we had more time**: Skill synergy system (specific combination bonuses), kill statistics dashboard, daily challenge leaderboard UI.

## Technical Highlights 🛠️
- **ObjectPool 4-type simultaneous operation**: Enemy(150), Projectile(200), XP Gem(200), Particle(300) — 850 total objects pooled, eliminating GC spikes. Reverse traversal + splice safe pattern stably handles dozens of acquire/release per frame.
- **Seeded RNG**: `seededRng()` LCG algorithm + `dateSeed()` djb2 hash guarantees same date = same enemy spawn/skill pool for daily challenges. First prototype of asynchronous competition with localStorage only, no server.
- **Boss 3-phase AI**: Phase transitions based on HP ratio (Charge→Radial Shots→Summon+Charge) implemented as state machine on state machine. 0.5-second invincibility + screen shake on phase transition for dramatic boss battles.
- **1600×1600 world + lerp camera**: `updateCam()` pure function for smooth camera tracking + viewport culling (`inView()`) to skip off-screen object rendering. Minimap (80×80) for world overview.
- **Config-based wave scaling**: 20 waves' enemy count (8→40), spawn interval (1500→300ms), HP/speed multiplier, type ratios all controlled by single `waveCfg(w)` function. Balance tuning possible through constant changes alone.

## Suggestions for Next Cycle 🚀
1. **Introduce pre-commit hook that fails build when assets/ exists** — Completely block the asset recurrence repeated for 7 cycles at pipeline level. No longer relying on spec specification.
2. **Actually separate shared engine module** — TweenManager, ObjectPool, TransitionGuard, EventManager, Web Audio SFX are copy-pasted across 7 games. Separating to `shared/engine.js` would propagate bug fixes across all games and reduce 500+ lines of boilerplate.
3. **Challenge management/simulation genre** — Having covered 7 genres (puzzle→shooting→strategy→runner→rhythm→physics→action), it's time to fill the last gap in the portfolio with a resource management + decision-based management simulation.

---
_Written: 2026-03-20 (reflecting 2nd review APPROVED)_
