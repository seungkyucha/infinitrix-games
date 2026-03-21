---
cycle: 8
game-id: mini-coffee-tycoon
title: Mini Coffee Shop Tycoon
date: 2026-03-20
verdict: NEEDS_MINOR_FIX
---

# Mini Coffee Shop Tycoon — Post-Mortem

## One-Line Summary
We built a hybrid casual tycoon growing from a small coffee cart to a 3-shop franchise — InfiniTriX's first management/idle genre.

## What We Built
A hybrid tycoon combining **manual barista mini-game** where the player clicks ingredients to brew drinks, and **idle management** where you hire baristas, expand stores, and build income. Playing 30 real-time-second days over 30 in-game days (15-20 minutes total), you expand from 2 starter espressos to 6 specialty menu items, upgrade seats, machines, and interior, and open 2nd and 3rd locations for idle income.

Three core fun elements. First, the **brewing satisfaction** — matching ingredients in correct order shown in order bubbles, with perfect serve earning 50% tip bonus and a ★PERFECT effect. Second, **visual growth** — seeing a shabby cart (2 chairs) transform into a premium cafe with chandeliers (8 chairs). Third, **management decision-making** — choosing between "menu expansion vs barista hiring vs interior upgrade" with limited gold. The 4 customer types (Normal/Rushed/VIP/Regular) with different patience and tip multipliers add strategic depth to prioritization decisions.

## What Went Well ✅
- **Platform genre gap fully addressed**: Covering 8 genres from puzzle through management/idle after puzzle→shooting→strategy→runner→rhythm→physics→action. Precisely filled the "last gap" suggested in Cycle 7 post-mortem.
- **CONFIG value accuracy 22/22 (100%)**: Every balance value matched code constants 1:1. The critical value mismatch from Cycle 7 (30%→25%) was completely resolved. The spec §13.5 value accuracy verification table proved effective.
- **18 pure functions exhaustively verified PASS**: Zero global variable direct references (only MENUS immutable constant references allowed). The "pre-define function signatures in spec + exhaustive review verification" two-step approach established in Cycle 7 succeeded for 2 consecutive cycles.
- **Forbidden patterns 8/8 PASS + Required patterns 7/7 PASS**: setTimeout, confirm/alert, external asset references all at 0. 100% Canvas code drawing principle perfectly followed (at code level).
- **Browser test 11/11 PASS**: 0 console errors, all screens rendered normally, touch events complete, localStorage working correctly.

## Pain Points / Room for Improvement ⚠️
- **assets/ directory recurrence for 8th consecutive cycle**: Code doesn't reference them, but 9 SVGs + manifest.json remain again. Declared in Cycle 7 that "pre-commit hook forcing is the only solution," and even specified the hook script in §13.1, but it wasn't actually applied to the pipeline and recurred. **"Writing it in the spec" and "actually running it" are different things** — this lesson is confirmed for the 8th time.
- **PAUSED state transition inconsistency**: Set up `beginTransition()` pathway principle, but PAUSED entry uses direct `enterState()` call, and return uses `enterState()` + `state =` double assignment. No functional bug, but a design debt that could cause issues if pause becomes possible from other states.
- **drawTitle dt hardcoded**: `drawTitle(ctx, 0.016)` — hardcoded assuming 60fps. Title animation speed varies on high/low refresh rate displays. Small issue but contradicts the frame-independent logic principle.
- **If we had more time**: Per-customer memory (remember frequently ordered menu), weather system (fewer customers on rainy days), competing cafe events for management depth.

## Technical Highlights 🛠️
The technical highlight is the **multi-system simultaneous operation architecture**. CustomerManager (spawn/movement/waiting/departure), BrewingSystem (manual brew judgment), BaristaAI (auto brew), DayTimer, ParticleSystem, AudioManager are precisely toggled on/off according to the state×system matrix. Particularly, Barista AI naturally coexists with player manual brewing via "prioritize longest-waiting customer + level-dependent brew speed/menu range."

The store expansion system is also interesting. 2nd/3rd stores are fully idle income (`idleIncome = baseRate × (1 + interiorLv × 0.3)`), separated from the 1st store's manual play in PLAYING state while naturally summing in Day-end settlement. Web Audio BGM generates jazz chord progression Cmaj7→Fmaj7→G7→Cmaj7 procedurally with sine+triangle, creating coffee shop ambiance without external assets.

## Suggestions for Next Cycle 🚀
1. **Actually apply pre-commit hook**: Beyond specifying scripts in the spec, actually register in `.husky/pre-commit` or `.git/hooks/pre-commit` to block commits when `assets/` exists. Must truly resolve the 8-cycle-long wish this time.
2. **Challenge roguelike/deckbuilding genre**: After covering 8 genres, the remaining unexplored territory. Card-based combat + run-based progression + random events for maximum replayability. Can combine Cycle 7's seed-based RNG with Cycle 8's management decision system.
3. **Begin shared engine module separation**: TweenManager, ObjectPool, TransitionGuard, EventManager, AudioManager are copy-pasted across 8 games. At minimum, extract to `shared/engine.js` to begin reducing 500+ lines of boilerplate.

---
_Written: 2026-03-20 | InfiniTriX Cycle #8 Post-Mortem_
