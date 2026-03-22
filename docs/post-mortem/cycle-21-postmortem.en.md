---
cycle: 21
game-id: runeforge-tactics
title: RuneForge Tactics
date: 2026-03-22
verdict: APPROVED
---

# RuneForge Tactics — Post-Mortem

## One-Line Summary
Built a 2-phase strategy puzzle where players place 8 rune types on a 5×5 grid to complete magic circles and repel enemy waves — 4,215 lines of pure Canvas, APPROVED after 5 review rounds.

## What We Built

**RuneForge Tactics** is the first game to fill the completely vacant puzzle + strategy genre combination on the platform. In the puzzle phase, players strategically place 8 types of runes on a 5×5 grid to activate 120+ magic circle patterns (lines, L-shapes, T-shapes, crosses, etc.), then in the defense phase, the completed spells automatically repel 3-lane enemy waves. The core fun lies in experimenting: "What happens with this combination?"

The game features premium-level content volume: 5 regions (Forest, Cave, Desert, Snowfield, Magic Tower) × 20+ stages + 5 bosses + permanent upgrades + recipe book collection. Even failed runs permanently save newly discovered magic circle recipes, delivering roguelike "progress through failure" satisfaction. A polished package with 12-state machine, Korean/English dual language support, and 3 difficulty levels (Apprentice/Wizard/Archmage).

## What Went Well ✅

- **F1–F35 record 35 feedback pre-mappings**: Accumulated lessons from 20 cycles were systematically categorized (assets/state machine/code quality/input/misc) and reflected in the spec, with all 6 planner + 5 designer feedback items fully addressed. The trend of quality improving proportionally with feedback mapping count (32 in Cycle 20 → 35) has been confirmed for 6 consecutive cycles.
- **No assets/ directory — true establishment after 21 cycles**: Only thumbnail.svg exists; ASSET_MAP/SPRITES/preloadAssets code is completely absent. Full 100% Canvas code drawing achieved — all 8 rune types, 8 enemy types, and 5 boss types drawn directly via Canvas API. Zero setTimeout, zero alert/confirm, zero external CDNs.
- **12-state dispatch + ESCAPE_ALLOWED pattern**: 12 states (TITLE/STAGE_SELECT/PUZZLE/DEFENSE/RESULT/GAMEOVER/PAUSED/UPGRADE/RECIPE_BOOK/BOSS_INTRO/ENDING/TUTORIAL) managed via STATE_PRIORITY map, with 6 reverse transition paths also permitted — a flexible state machine design.
- **Code quality**: Pure function patterns (scanMagicCircles, checkCollision, findLine), single update paths (modifyLives, modifyCrystals, addScore), ObjectPool (particles 200 + projectiles 50), TweenManager clearImmediate(), ScrollManager (momentum + bounce) — infrastructure verified over 21 cycles working flawlessly.
- **Full mobile support**: touchSafe 48px, long-press rune retrieval (300ms), drag scroll (upgrade/recipe screens), direct grid tap + inventory tap, touch-action:none dual prevention — touch input implemented without gaps.

## What Could Be Better ⚠️

- **5 review rounds**: Took 5 rounds to reach final APPROVED. While extra rounds were needed for planner/designer feedback integration, this exceeded the first-round pass target.
- **gridCacheCanvas/Ctx unused variables (P3)**: Declared for offscreen caching but never implemented — ghost variables persisting into the 21st cycle. Hard to eliminate without ESLint `no-unused-vars`.
- **ObjectPool exception safety (P3)**: Items may not return to pool if `updateAll()` callback throws. Easily solvable with try-catch wrapping, but not applied this cycle.
- **Upgrade icon caching (P4)**: `drawUpgradeIcon()` creates new paths every frame. Room for optimization via offscreen caching.
- **4,215-line single file**: Platform's all-time largest. Shared engine module extraction (shared/engine.js) has been delayed for 21 cycles, with TweenManager/ObjectPool/SoundManager/touchSafe() copy-pasted across 21 games.

## Technical Highlights 🛠️

The technical highlight is the **magic circle pattern matching algorithm**. The `scanMagicCircles()` pure function scans the 5×5 grid to detect patterns (line-3, L-shape, T-shape, cross, 2×2, diagonal) in real-time, activating 120+ magic effects based on matched rune attribute combinations.

**ScrollManager** is also noteworthy. It implements momentum-based inertial scrolling (MOMENTUM_DECAY=0.92, MAX_MOMENTUM=30) and bounce effects (BOUNCE_FACTOR=0.3) directly on Canvas for upgrade shop and recipe book screens — a perfect response to Cycle 20's "touch scroll not implemented" feedback.

**SoundManager** uses Web Audio API procedural sound synthesis to maintain zero external audio files, handling context-specific effects (rune placement, magic circle activation, enemy defeat, boss appearance) via ctx.currentTime native scheduling. 10 consecutive cycles of complete setTimeout elimination.

## Next Cycle Suggestions 🚀

1. **Shared engine module extraction — for real this time**: At 4,215 lines (all-time record), this can no longer be postponed. Extracting TweenManager/ObjectPool/TransitionGuard/SoundManager/touchSafe() to shared/engine.js would save 500+ lines per game with bulk bug fix propagation.
2. **Puzzle+strategy genre variations**: With RuneForge Tactics validating the "placement puzzle → auto-execution" 2-phase structure, similar patterns like card placement → auto-combat or circuit design → auto-operation are worth exploring.
3. **Balance simulator introduction**: Verifying balance across 8 rune types × 120+ magic circles × 5 regions × 3 difficulty levels through code review alone is impossible. A tool for auto-placement + N-run simulation to statistically verify per-stage clear rates is needed.
