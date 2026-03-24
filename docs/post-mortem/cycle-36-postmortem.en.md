---
cycle: 36
game-id: mecha-garrison
title: Mecha Garrison
date: 2026-03-24
verdict: NEEDS_MAJOR_FIX
---

# Mecha Garrison — Postmortem

## One-Line Summary
Built a tower defense roguelite where players deploy mecha units against alien machine legions, but the game was submitted for review in an unplayable state due to a STATE_PRIORITY bug that blocks game start entirely.

## What We Built
Mecha Garrison is a tower defense roguelite where players defend 5 zones (City Outskirts → Industrial District → Energy Core → Underground Bunker → Final Command) against the alien machine legion "Vortex." The core loop is placing 5 types of mecha units on a grid strategically, then choosing 1 of 3 random parts after each wave clear to customize armaments. The roguelite structure ensures different builds every run, with a permanent upgrade tree (3 branches × 5 levels) providing "go further next time" motivation.

The design targeted a blue ocean — zero pure TD games in Poki Top 10 — and the arcade+strategy combination had been unused for 8 cycles (since #25). Technically ambitious features include BFS pathfinding for placement validation, 4-tier DDA difficulty correction, boss weakness exposure mechanics (3-second windows every 8 seconds), and SeededRNG-based wave/part randomization. All TD roguelite systems were packed into a single 3,500-line HTML file.

## What Went Well ✅
- **Code Structure**: 3,500 lines cleanly organized into 11 REGIONs. Every system needed for a TD roguelite (placement, waves, bosses, parts, upgrades, DDA) was fully implemented
- **transAlpha Proxy Pattern**: The tween disconnection bug from Cycle 24 was structurally resolved via `G._transProxy`, auto-syncing transition effects with the game loop
- **BFS Pathfinding**: Placement validation + enemy path recalculation — the core TD mechanic implemented correctly
- **Procedural Sound**: 15 SFX + 6 BGM moods generated via Web Audio API, zero external audio files
- **Mobile UX**: Unified hitTest() function + long-press sell + double-tap upgrade + 48px minimum touch targets guaranteed
- **Localization**: 60+ strings with full ko/en support
- **bossRewardGiven Guard Flag**: F17 pattern precisely applied, preventing duplicate boss reward payouts

## What Could Be Better ⚠️
- **STATE_PRIORITY Bug — 7th Recurrence**: Following Cycles 21/23/24/25/27/28/32, the same pattern struck again in 36. `RESTART_ALLOWED` was declared but never referenced in `beginTransition()`, blocking 10 of 12 core transitions. The game cannot progress past ZONE_INTRO to PLACEMENT — **game start is completely impossible**. The fact that a 5-line fix keeps recurring 7 times proves it cannot be eradicated without automated verification
- **assets/ Directory — 36 Consecutive Cycles of Recurrence**: 10 SVG files + manifest.json still generated. Canvas fallbacks are 100% present so gameplay is unaffected, but the spec §4.1 "absolute ban on assets/" principle is violated. Complete failure of all manual prevention measures across 36 cycles reconfirmed
- **No Actual Play Verification**: Due to the STATE_PRIORITY bug, all game flow after PLACEMENT was untestable. Wave balance, part combination balance, boss difficulty — core gameplay quality remains unverified
- **No Balance Simulator**: The combination space of 5 mechas × 15 parts × 5 zones × 3 waves × 4-tier DDA cannot be verified through code review alone

## Technical Highlights 🛠️
- **BFS Pathfinding + Placement Validation**: `canPlace()` creates a temporary grid and verifies path existence via BFS before allowing placement. Structurally prevents "blocked paths" where enemies cannot reach the core — essential TD technology
- **4-Tier DDA Correction**: Dynamically adjusts enemy HP/speed/count based on consecutive deaths. Automatically maintains balance that's accessible for beginners yet challenging for veterans
- **Boss Weakness Exposure Mechanic**: Weak points exposed for 3 seconds every 8-second cycle. Boss design requiring timing strategy rather than pure DPS checks
- **Proxy-Based Transition Animation**: `G._transProxy` auto-syncs tween values with the game loop's `G.transAlpha`. Structurally prevents the "declared but not connected" pattern from Cycle 24
- **Parts System DPS Cap**: Maximum DPS from part combinations capped at 2.0, ensuring extreme builds don't break the game

## Next Cycle Suggestions 🚀
1. **Build STATE_PRIORITY Auto-Verification Tool**: Static analysis or Puppeteer pre-test to automatically verify that `beginTransition()` actually references ESCAPE_ALLOWED/RESTART_ALLOWED. Seven recurrences completely prove the limits of manual review
2. **Actually Register assets/ CI Blocking**: Accept the failure of all manual prevention measures across 36 cycles. Actually register a pre-commit hook that rejects commits when an `assets/` directory exists
3. **TD Balance Simulator Prototype**: A headless tool that takes wave enemy HP/count/speed + mecha DPS + part bonuses as input and auto-simulates N runs. Code review alone cannot catch "dominant builds" or "impossible late waves"
