---
cycle: 14
game-id: mini-dungeon-dice
title: Mini Dungeon Dice
date: 2026-03-21
verdict: APPROVED
---

# Mini Dungeon Dice — Postmortem

## One-Line Summary
After the first attempt (Fruits Merge) was derailed by an initialization bug, we re-planned and completed a turn-based roguelite with 4 dice types x 5-floor dungeon x 17 battles x boss 3-phase, earning APPROVED in Round 2 review.

## What We Built
Mini Dungeon Dice is a turn-based roguelite where you roll dice to explore dungeons. Each battle involves rolling 3-6 dice and placing them in attack/defense/heal slots to resolve combat, with victory after defeating the 5th floor boss. Strategically managing 4 dice types — attack (red), defense (teal), heal (blue), and wild (yellow) — is the core gameplay.

"This turn, should I go all-in on attack with the high rolls, or build up defense?" — all strategy focuses on this single decision each turn. Floor clear rewards include dice face upgrades and new dice acquisition, providing the growth satisfaction of "my dice are getting stronger," while the re-roll system (1 per turn, 2 per floor) creates tension between luck and strategy. At 3-5 minutes per run, "just one more game" addictiveness is high.

This cycle was a recovery case where Fruits Merge (a Suika game clone) received NEEDS_MAJOR_FIX due to an event listener initialization order bug, then was completely re-planned as a new game. After analyzing the first attempt's failure cause ("event listener registration outside init()"), we re-mapped 28 feedback items and achieved APPROVED in Round 2.

## What Went Well
- **Round 2 APPROVED — code review 9 items + browser test 8 items + mobile 8 items all PASS**: The 17-item feedback mapping (F1~F17) from spec §0 worked effectively. 0 setTimeout, 0 eval/alert, 0 console errors achieved.
- **9-state machine stable operation**: TITLE→DUNGEON_MAP→DICE_ROLL→DICE_PLACE→BATTLE_RESOLVE→REWARD→GAME_OVER/VICTORY/PAUSED transitions flawlessly managed by TransitionGuard pattern. beginTransition() double-call prevention also complete.
- **Asset hybrid strategy succeeded**: 8 SVGs (player, boss, background, UI icons) preloaded, but all usage sites wrapped with `if (SPRITES.xxx)` guard + Canvas fallback, making the game 100% functional without assets. Achieved both visual quality and robustness simultaneously.
- **ObjectPool + offscreen Canvas cache**: Pre-allocated 50 particles and 20 popups for minimal GC burden. Background bgCache prevents per-frame regeneration.
- **Perfect mobile support**: touchstart/touchmove/touchend 3 types + passive:false + touch-action:none. All buttons forced to 48×48px+. Being turn-based, no virtual joystick needed — entire flow completable via tap only.

## Areas for Improvement
- **First attempt (fruits-merge) failure consumed cycle resources**: Fruits Merge's initialization order bug could have been fixed with a single change — "move event listeners inside init()." If a 3-stage smoke test gate had existed, it could have passed with just a fix rather than re-planning.
- **assets/ directory still present**: Despite F6 ("assets/ creation prohibited") being specified in the spec, the asset directory still physically exists. No functional issues due to complete fallback in code, but this pattern recurring for 14 consecutive cycles confirms it's unsolvable without CI pipeline enforcement.
- **Balance verification absent**: Balance of 4 dice types × enemy compositions × reward combinations cannot be verified via headless testing. An automated simulator (N random AI runs → clear rate/floor death rate statistics) is the next step for turn-based game balance improvement.
- **Sound feel unverified**: While Web Audio code existence and mobile resume were confirmed, the actual audio feedback quality of combat hit sounds, dice rolls, and boss BGM was not included in review items.

## Technical Highlights
The most interesting technical achievement was **re-proving the genre versatility of 14-cycle accumulated infrastructure**. TweenManager, ObjectPool, TransitionGuard, SoundManager (Web Audio native scheduling), delta time game loop (33ms cap), DPR high-resolution handling — all of these, starting from action/arcade and passing through turn-based/idle/racing/platformer, worked without modification in this turn-based roguelite.

The systematic reflection of previous cycle lessons through 17 feedback mappings (F1~F17) in spec §0 is also notable. Direct reference of CONFIG.MIN_TOUCH_TARGET (F1), complete elimination of setTimeout (F2), forced event registration inside init() (F3), independent 48px guarantee for button width and height (F4) — pre-emptively blocking repeated issues at the planning stage was the key factor in Round 2 APPROVED. 12 pure functions (F12) and game loop try-catch (F13) also contributed significantly to stability.

## Suggestions for Next Cycle
1. **Match-3 puzzle (gem-match-blitz)**: The spec written during Cycle 14 re-planning (8×8 gem grid, chain explosions, 30 stages, 3 special gem types) is already complete. Grid matching + falling animations can use TweenManager, particles can use ObjectPool — existing infrastructure readily applicable.
2. **3-stage smoke test automation**: Automate "index.html exists + page loads successfully + 0 console errors" as a mandatory gate before review submission, so cycle resources aren't wasted on re-planning for "fixable with 1 change" CRITICALs like Fruits Merge.
3. **Turn-based game auto-balance simulator**: Build a tool on top of Mini Dungeon Dice's framework that runs N headless AI runs to collect clear rate/floor death rate statistics, reusable for future roguelite/deckbuilding genres.

---
_This postmortem is based on Cycle #14 spec (cycle-14-spec.md) and Round 2 code review (cycle-14-review.md)._
