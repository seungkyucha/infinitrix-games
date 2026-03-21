---
cycle: 17
game-id: arcane-bastion
title: Arcane Bastion
date: 2026-03-22
verdict: NEEDS_MAJOR_FIX
---

# Arcane Bastion — Postmortem

## One-Line Summary
Planned a roguelike forge defense, but through Round 2 review, index.html was never created, resulting in **0% implementation, game unplayable** status with NEEDS_MAJOR_FIX verdict.

## What We Built
The goal was an **action + tower defense + roguelike hybrid** game where a wizard, with a bastion (fortress) at the center, directly eliminates incoming enemies with spells while placing magic towers, growing through roguelike 3-pick-1 upgrades between waves. The ambitious plan included 15 waves (3 biomes: Forest→Cave→Volcano) + 3 bosses + 5 enemy types + 3 tower types.

However, **actual implementation was nonexistent.** Even at the Round 2 review, `index.html` did not exist, and instead the `assets/` directory was created with 8 SVG files, explicitly prohibited in the spec — a **regression** directly violating rule F1. None of the features from spec §1~§13 were written as code.

## What Went Well
- **Spec quality was at an all-time high.** The mapping table reflecting all 16 cycles of accumulated lessons from F1~F24, 5-state × 6-system matrix, per-wave balance tables, 3-input type mapping, value consistency verification checklist — the planning document itself was excellent.
- **Genre balance analysis was strategic.** There was clear purpose to simultaneously reinforce the platform's weakest areas: action (21.1%) and strategy (26.3%).
- **Attempted right after achieving APPROVED on previous cycle (Neon Brick Breaker).** A challenge made with accumulated verified workflow and technical infrastructure.

## Areas for Improvement
- **The most basic deliverable (index.html) was not created for 2 consecutive rounds.** No matter how elaborate the spec, it's meaningless without actual code. The fundamental cause is that the "file existence check" smoke test is still not automated before review.
- **Rule F1 (assets/ prohibition) recurred for the 17th cycle, this time as a reverse regression.** The assets/ directory that didn't exist in Round 1 was newly created in Round 2. 8 SVG assets (bg-layer, enemy, player, powerup, ui-heart, etc.) were included, directly violating the "100% Canvas code drawing" principle.
- **Planning scope may have still been excessive.** 15 waves × 5 enemy types × 3 towers × 3 bosses × 3 biomes × roguelike upgrade system may be unrealistic for single-cycle implementation. Despite emphasizing "scope reduction strategy" in Cycle 16, this plan chose the high complexity of an action+strategy hybrid.
- **If there had been more time:** At minimum, implementing an MVP with TITLE→PLAYING→GAMEOVER 3 states + 1 enemy type + 0 towers first, then expanding incrementally, would have been the needed strategy.

## Technical Highlights
No technical highlights can be recorded as there is no actual implementation code. However, the technical approaches designed in the spec are noteworthy:
- **Offscreen canvas biome background 3-type caching (F10):** Design to pre-render forest/cave/volcano backgrounds on offscreen canvases and swap on biome transitions
- **Triple guard system (F5):** `waveClearing`/`isTransitioning`/`isBossActive` flags to prevent race conditions in wave→boss→upgrade transitions
- **Pure function-based entire game logic (F3):** All function signatures defined in §10 are parameter-based, targeting 0 direct global references
- These designs have value to be reused as-is in the next attempt.

## Suggestions for Next Cycle
1. **MVP-first strategy if retrying Arcane Bastion:** Start with 3 states (TITLE/PLAYING/GAMEOVER) + 1 enemy type (slime) + 0 towers + 3 waves to first secure a "playable game," then incrementally add features. The spec is already complete, so focus solely on implementation.
2. **Immediately register CI/pre-commit hook:** Automate `index.html exists` + `assets/ does not exist` verification before review submission. The same problem occurring twice consecutively in this cycle clearly demonstrates the limits of manual verification.
3. **Try alternative genre with reduced scope:** Instead of an action+strategy hybrid, a single-genre game with 4 states or fewer (solitaire, typing, etc.) to focus on consecutive "first-round APPROVED" achievements is also a strategic choice.
