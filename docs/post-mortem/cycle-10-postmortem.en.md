---
cycle: 10
game-id: mini-card-battler
title: Mini Card Battler
date: 2026-03-21
verdict: APPROVED
---

# Mini Card Battler — Post-Mortem

## One-Line Summary
We condensed the core loop of Slay the Spire into a single HTML file, completing the platform's first turn-based deckbuilding roguelike and receiving APPROVED on the 2nd review.

## What We Built
A roguelike deckbuilding game where you fight through a 3-floor dungeon (Forest→Cave→Tower) with card combat. Each turn, you combine attack, defense, skill, and power cards from your 5-card hand within the mana limit, then select 1 of 3 reward cards upon victory to strengthen your deck. "Go all-in on attack this turn? Or stack defense?" — this decision occurs every turn, with the eureka moment when synergies connect being the core fun.

30 card types, 10 enemy types (5 normal + 2 elite + 3 bosses), 14 game states, shop/event/rest/reward systems, 4 debuff types, boss phase transitions, permanent unlock system, and Seeded RNG were all included. After 9 cycles of only real-time games, this opened a completely new axis of turn-based gameplay on the platform. One run provides substantial strategic depth in 10-15 minutes.

## What Went Well ✅
- **Code review all items PASS + browser test all items PASS**: In 2nd round, all core spec requirements met. Non-functional requirements also passed thoroughly — mobile touch (3 event types + passive:false), DPR support, localStorage, Web Audio, security (eval/alert 0 instances).
- **All 18 previous feedback items fully reflected**: Explicitly mapped 18 platform-wisdom feedback items in spec §0, with `beginTransition()` pathway principle, `isTransitioning` guard, `clearImmediate()`, forbidden pattern 0 instances all faithfully implemented. Proved that previous cycle learning actually works.
- **Turn-based architecture compatibility verified**: Infrastructure validated over 9 cycles of real-time games — TweenManager, ObjectPool, TransitionGuard — worked without modification when the genre switched to turn-based. Confirmed platform architecture maturity.
- **1st round CRITICAL bug rapidly fixed**: `iShop()` had an undeclared variable `shopI` causing store crashes, but `shI` was corrected in 2nd round — all 3 issues (1 CRITICAL + 2 LOW) resolved.

## Pain Points / Room for Improvement ⚠️
- **assets/ directory remaining**: Despite specifying "creation itself prohibited" in spec §0.5, 9 SVGs + manifest.json physically exist. No functional issues due to complete fallback rendering, but 10 cycles of consecutive recurrence definitively shows that only pre-commit hook enforcement can solve it.
- **Pitfall of abbreviated variable names**: The root cause of the 1st round CRITICAL bug was variable name mismatch `shopI` vs `shI`. Extreme abbreviation for code compression actually caused reference errors. Need a consistency management approach for abbreviation naming rules.
- **Deckbuilding balance unverified**: Synergy balance of 30 card types and 3-floor difficulty curve are areas that headless testing cannot verify. Without N-run automated play simulation, issues like "a specific build is overwhelming" are hard to catch.
- **Shared engine module still not separated after 10 cycles**: TweenManager, ObjectPool, TransitionGuard are copy-pasted across 10 games. Boilerplate accumulation has reached its limit.

## Technical Highlights 🛠️
The turn-based nature created technically interesting differences. Instead of frame-based collision detection from real-time games, the core challenge was stably managing **a complex transition graph of 14 states** (TITLE→MAP→PRE_BATTLE→PLAYER_TURN→ENEMY_TURN→REWARD→SHOP→REST→EVENT→VICTORY→DEFEAT etc.). All transitions are protected by `beginTransition()` pathway + `isTransitioning` guard, with immediate transitions also unified via `beginTransition(s, {immediate:true})`. LCG-based Seeded RNG enables identical run reproduction when sharing seeds, and boss phase transitions (HP%-based p1→p2→p3 pattern switching) create deep combat with minimal code. PL class particle object pooling and TweenManager's clearImmediate() API guarantee stable effects without race conditions.

## Suggestions for Next Cycle 🚀
1. **Separate shared engine module**: Extract TweenManager, ObjectPool, TransitionGuard verified across 10 games to `shared/engine.js`. Enables 500+ line boilerplate reduction and batch bug fix propagation.
2. **Automate regression prevention**: Automate full-flow regression tests (TITLE→MAP→BATTLE→VICTORY/DEFEAT full path traversal) with Puppeteer scripts after code modifications. Individual fix verification alone cannot catch signature change propagation gaps.
3. **Challenge unexplored genre**: After covering 10 genres, consider fresh directions like narrative-based adventure or social deduction. Also review generalizing the daily challenge system (Cycle 7 seed RNG) in parallel.
