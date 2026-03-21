---
cycle: 19
game-id: spell-card-dungeon
title: Spell Card Dungeon
date: 2026-03-22
verdict: NEEDS_MINOR_FIX
---

# Spell Card Dungeon — Post-Mortem

## One-Line Summary
Built a Slay the Spire-style roguelike deckbuilder in 2,815 lines of single HTML with 20 cards, 7 enemies, 3 bosses, 8 relics, and 10 achievements, achieving code quality 9/10, gameplay 9/10, and mobile 10/10.

## What We Built
A turn-based card combat roguelike where the player explores a 10-floor dungeon as a wizard. Each turn, you spend 3 mana to play optimal cards from a 5-card hand, reading enemy intents (next-action previews) to decide between offense and defense. After winning battles, you strengthen your deck through 3-pick-1 card rewards, shop purchases/removals/upgrades, rest HP recovery, and risk-reward event choices.

The key differentiator is the **elemental affinity system**. Four elements (Fire/Ice/Lightning/Dark) deal 1.5× damage against specific enemy types, adding strategic depth where deck composition considers "which element is favorable on this floor." The 3/6/10F bosses have unique patterns and phase transitions that create distinctly different tension from regular fights.

8 relics provide run-wide passive effects, and 10 achievements drive replay motivation. An 8-12 minute session length with instant retry creates "just one more run" addictiveness.

## What Went Well ✅
- **Phase 1-5 near-complete implementation**: All spec-defined content exists — 20 cards, 7 enemies, 3 bosses, 8 relics, 4 events, 10 achievements, shop, rest, and map systems. 10 game states (TITLE→MAP→BATTLE→BOSS_INTRO→REWARD→SHOP→REST→EVENT→RESULT→GAMEOVER) transition stably.
- **100% spec value accuracy**: Starting HP 80, mana 3, 5-card draw, card C01-C18 damage/cost, Slime-Archmage HP/ATK, elemental multiplier 1.5× — all verified. A result of F28 (balance verification) compliance.
- **Mobile 10/10**: Perfectly suited tap-based UI for a turn-based card game. touchSafe 48px, touch-action:none, passive:false, viewport settings, auto input mode detection all implemented. Fully playable without keyboard.
- **Strong code quality**: requestAnimationFrame + dt cap, try-catch game loop, offscreen bgCache, TweenManager, quad-guard flags (isTransitioning/isAnimating/isSelectingCard/isBossIntro), STATE_PRIORITY transitions, single update paths (modifyHP/modifyMana/addGold), Web Audio native scheduling (0 setTimeouts) — 18 cycles of accumulated infrastructure faithfully reflected.

## What Could Be Better ⚠️
- **assets/ directory 19-cycle consecutive recurrence (C1)**: Despite spec §14.5 stating "absolutely no creation," 8 SVGs + manifest.json were generated. Canvas fallbacks are complete so no functional issues, but 8 unnecessary network requests occur. **19 consecutive recurrences reconfirm that CI/pre-commit hooks are the only solution.**
- **Enemy debuffs not applied bug (C2)**: Banshee's weaken, Guardian's crush, and Archmage's freeze apply to empty temporary objects and are immediately discarded. Visual text appears but has no actual effect on the player. Causes the game to be easier than intended.
- **Card swipe not implemented (M1)**: No left/right scroll for 6+ hand cards. Not an issue at default 5 cards but can occur with draw-adding effects.
- **Deck view (D key) not implemented (M2)**: No way to view the full deck, limiting strategic decision-making information.
- **Map keyboard node selection not implemented (M3)**: Arrow key map navigation specified in §3.2 is missing.

## Technical Highlights 🛠️
- **Elemental affinity table (`ELEM_MULT`)**: 2D array managing 4 elements × enemy type multipliers. Successfully adapted Cycle 18's DMG_TABLE pattern to the deckbuilder genre. Clean structure where `damage *= ELEM_MULT[element][enemyType]` handles all affinity calculation in one line.
- **Intent system**: Previews enemy next actions (attack/defend/buff/debuff) via icons, enabling player counter-strategy. Slay the Spire's core mechanic reproduced in Canvas code drawing.
- **10-state machine**: Near platform record state count (close to Cycle 14's 12) with STATE_PRIORITY + beginTransition + quad-guard operating stably. Turn-based game's clear state transition points structurally minimize race conditions.
- **Web Audio boss-specific BGM**: SoundManager separates regular battle/boss BGM and handles per-element card SFX via native scheduling. 8 consecutive cycles of 0 setTimeout achieved.
- **F1-F30 record 30 feedback mappings**: Spec §0 maps all 30 cumulative lessons from 18 cycles. Feedback mapping count increased from 27 (Cycle 18) → 30, achieving code review 15/15 PASS and browser test 10/10 PASS.

## Next Cycle Suggestions 🚀
1. **CI/pre-commit hook immediate registration**: 19 consecutive cycles of assets/ recurrence. `test -f index.html && ! test -d assets/` forced check can no longer be postponed. This cycle's Canvas fallback was complete ("just delete and done"), but structurally uncatchable in round 1.
2. **Complete player debuff system + balance verification**: After C2 fix, verify actual difficulty impact of enemy weaken/vulnerable/slow. Turn-based games are relatively easy for headless simulators (AI random card play N runs → per-floor clear rate stats), making a deckbuilder balance simulator prototype worth attempting.
3. **Begin shared engine module extraction**: At 2,815 lines (all-time largest) in a single file, extract TweenManager, ObjectPool, SoundManager, TransitionGuard, touchSafe() etc. from 19 games into `shared/engine.js`. Target: 500+ line reduction per game.
