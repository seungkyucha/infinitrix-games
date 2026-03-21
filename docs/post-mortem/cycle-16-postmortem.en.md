---
cycle: 16
game-id: neon-hex-drop
title: Neon Hex Drop
date: 2026-03-22
verdict: APPROVED
---

# Neon Hex Drop — Postmortem

## One-Line Summary
Completed a falling block puzzle where blocks drop from 6 directions and are aligned by rotating a hexagon, in 1,376 lines of single HTML, earning APPROVED (ready for immediate deployment) in the Round 3 final review.

## What We Built
A falling block puzzle where the central hexagon (core) is rotated left/right to align colored blocks falling simultaneously from 6 directions. When 3+ same-colored blocks are adjacent, they are eliminated via BFS, and when upper blocks fall after elimination, cascades occur. The core fun lies in the split-second decisions of "which direction to receive first" and the lucky moments of unintended chain reactions.

As levels increase, fall speed accelerates (2s/block → 0.4s/block) and active colors increase from 3 to 6, creating a natural difficulty curve. Short 1-3 minute sessions and intuitive left/right tap controls make it comfortable to play on mobile. This was the first game to fill the "falling block" sub-genre gap on the InfiniTriX platform, with neon glow visual style and 6-color orbital animation making a strong first impression from the title screen.

## What Went Well
- **Successful proof of "scope reduction strategy"**: Reflecting the painful experience of 5 reviews (all-time most) in Cycle 15, implementation scope was intentionally limited to 4 states, 1 objective ("survive"), and no stage branching. Review cycles reduced dramatically from 5 to 3 (effectively 1 fix round). "Make it small and finish it properly" was the right answer.
- **All-time most feedback pre-mapped (F1~F23)**: 23 accumulated feedback items from 15 cycles were mapped with solutions in spec §0. 0 setTimeout, 12 pure functions (`hexVertex`, `findMatches`, `applyGravity`, `checkGameOver`, etc.), ObjectPool (50 particles + 10 popups), offscreen caching, STATE_PRIORITY map, try-catch game loop — these formed the basis for code review C-1~C-9 all passing.
- **Canvas implementation of hexagonal coordinate system**: Successfully implemented pointy-top hexagon + 6-side stacks — a coordinate system completely different from rectangles — with pure Canvas API. BFS-based adjacent 3+ group detection and recursive cascade `resolveStep()` worked cleanly.
- **Full mobile touch support**: M-1~M-8 all PASS. `CONFIG.MIN_TOUCH_TARGET: 48` directly referenced in pauseBtnRect, DPR support, `passive:false`, `touch-action:none`, swipe+tap branching — all functions playable without keyboard.
- **Browser test B-1~B-8 all PASS**: All 4 state screens rendered correctly, 0 console errors/warnings, localStorage `neonHexDrop_hi` key saved correctly confirmed.
- **Perfect iframe compatibility**: Implemented with only Canvas + Web Audio in sandbox="allow-scripts allow-same-origin" environment, no alert/confirm/prompt/window.open usage.

## Areas for Improvement
- **2 CRITICAL issues recurred in Round 1**: The pattern of missing index.html + assets/ directory, recurring for the 16th cycle, appeared again in Round 1. Even with the all-time best spec quality of 23 pre-mapped feedback items, this issue alone couldn't be prevented. The conclusion that it will repeat forever without CI/pre-commit hooks is confirmed by data.
- **Level-based active color count mismatch**: Spec §2.2 specified levels 1-3 as 3 colors (R,B,G), and code `getActiveColors()` was verified to match as lv1-3→3 colors (R,B,G), lv4-7→4 (+Y) in the Round 3 check. The blind spot where existing value consistency tables didn't cover array/enum data was briefly exposed.
- **NEXT block preview unimplemented**: Blocks fall from off-screen so advance awareness is possible, but an explicit NEXT UI would have added more strategic depth.
- **Mouse hard drop unsupported**: Hard drop is available via keyboard (ArrowDown/S) and touch (swipe), but `handleClick()` only handles left/right rotation, making hard drop unavailable during mouse-only play. Normal on primary targets (mobile/keyboard) but a minor UX limitation.
- **Balance empirical verification limitations**: The perceived difficulty curve from level-based fall speed and color count changes cannot be verified via headless testing. Whether the game over detection balance of max 4 layers + boundary (radius ×2.5) is appropriate is hard to judge without an automated simulator.

## Technical Highlights
The most interesting technical challenge in this game was the **hexagonal coordinate system**. In a structure where blocks stack on the 6 sides (Side 0~5) of a pointy-top hexagon, vertex coordinates were mathematically precisely calculated through a pure function hierarchy of `hexVertex()`, `sideVertices()`, `blockVertices()`, `blockCenter()`. `getNeighbors()` searches consecutive layers of the same side + same layer of neighboring sides via BFS, `findMatches()` finds and eliminates 3+ adjacent groups, and `applyGravity()` + recursive `resolveStep()` handles cascades.

The rotation tween (150ms easeOutCubic) was key to adding smooth physics feel to 60-degree snap rotation, and the triple guard flags `isRotating`/`isResolving`/`_transitioning` fundamentally prevented race conditions between rotation/elimination/state transitions. Offscreen canvas `buildBgCache()` was a success case of pre-emptively applying Cycle 15 postmortem feedback from the planning stage. Web Audio `ctx.currentTime + offset` native scheduling achieved 0 setTimeout — setting a milestone of 5 consecutive cycles.

`ObjectPool` (50 particles + 10 popups) with `releaseAll()` batch cleanup pattern, `addScore()`/`setLevel()` single update paths, `STATE_PRIORITY` priority map-based `beginTransition()` — infrastructure validated over 16 cycles was confirmed to be reusable without modification in a new genre (hexagonal falling blocks).

## Suggestions for Next Cycle
1. **Actually register CI/pre-commit hook (top priority)**: A task deferred for 16 cycles can no longer be delayed. Just adding `assets/` existence blocking + `index.html` existence check to `.git/hooks/pre-commit` can fundamentally prevent 2 CRITICAL issues per cycle. Resolve infrastructure before implementing the next game.
2. **Extract shared engine module (`shared/engine.js`)**: Extract TweenManager, ObjectPool, TransitionGuard, SoundManager, touchSafe(), createGameLoop (with built-in try-catch) copy-pasted across 16 games into a single module. Enables 500+ lines saved per game + batch bug fix propagation.
3. **New genre + maintain scope reduction strategy**: Try genres not yet on the platform (card/solitaire, typing, physics sandbox, etc.) with concise rules of "4 states or fewer, 1 objective type" to aim for first-round APPROVED. This cycle's scope reduction strategy has been proven to directly contribute to review cycle reduction.
