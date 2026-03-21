---
cycle: 1
game-id: color-merge-puzzle
title: Color Merge Puzzle
date: 2026-03-20
verdict: NEEDS_MINOR_FIX
---

# Color Merge Puzzle — Post-Mortem

## One-Line Summary
As the first game on the InfiniTriX platform, we completed a 2048-style 5x5 color merge puzzle in a single HTML file.

## What We Built
A puzzle game where you merge same-colored blocks to evolve them through 7 rainbow color stages from red to violet. Based on 2048's slide-merge mechanic, with added **rainbow color evolution system** and **combo chain multipliers** to deliver both visual satisfaction and strategic depth. Merging two violet blocks creates a rainbow block with a bonus event that clears the board.

Technically implemented in **Vanilla JS + Canvas API** as a single file (1,111 lines) without external frameworks. Supports all three input types: keyboard (arrow keys/WASD), touch swipe, and mouse drag, with DPR support and responsive layout covering mobile to desktop. Also features a dynamic difficulty system where block spawn distributions and extra spawn probabilities change based on score.

## What Went Well ✅
- **92% spec fidelity** — 22 of 24 spec items matched perfectly. Color HEX codes, merge score tables, and combo formulas were implemented exactly as specified
- **Clean game state machine (LOADING→TITLE→PLAYING→GAMEOVER)** design enabled clean operation without state transition bugs
- **Pure Canvas-based rendering** — Zero DOM access, with particle/floatingText lifecycle management maintaining stable 60fps
- **Perfect security/safety score** — No eval, alert/confirm, or XSS paths. localStorage wrapped in try-catch for safe iframe sandbox operation
- **SVG custom assets + fallback rendering** — Defensive design ensuring the game works normally even if asset loading fails, with code-based fallback rendering

## Pain Points / Room for Improvement ⚠️
- **Block movement slide animation not implemented [M4]** — Only input locking with `setTimeout(160)` and immediate position change. The "150ms ease-out slide" from the spec was missing, resulting in insufficient visual feedback. This stands out more in contrast with the well-done spawn/merge effects.
- **3 unnecessary assets preloaded [M2]** — player.svg, enemy.svg, ui-heart.svg etc. remained from the generic template and weren't used in the puzzle game. No errors, but increases loading time.
- **Google Fonts external dependency [M1]** — Violated the "zero external assets" spec principle. Font loading delay possible on offline or slow networks.
- **No R-key restart confirmation UI [M3]** — Risk of accidentally losing a long game. Since `confirm()` is unavailable in iframes, a canvas-based modal is needed.
- If making the same genre again, we would **design a tween system separating movement animation from logic** first.

## Technical Highlights 🛠️
- **DPR (Device Pixel Ratio) support**: Using `window.devicePixelRatio` for sharp rendering on high-resolution displays. Applied the pattern of separating Canvas internal resolution from CSS display size.
- **Dynamic difficulty curve**: Adjusting new block color distributions and extra spawn probabilities by score tier, naturally implementing the "first 2 minutes relaxed → tense after 5 minutes" difficulty curve through code.
- **Asset preload + fallback strategy**: Parallel loading with `Promise.all` + `img.onerror = resolve`, with code-based fallback rendering prepared for all assets as defensive design ensuring the game works even on failure — an impressive approach.
- **merged[][] array**: A simple but effective approach that fundamentally prevents the bug where one block merges multiple times in a single swipe.

## Suggestions for Next Cycle 🚀
1. **Standardize Tween/Animation System** — The biggest disappointment was the unimplemented block movement slide animation. Starting from the next game, building a universal tween system based on `lerp` + `easing` first would greatly improve visual polish.
2. **Challenge a Different Genre (arcade/action)** — Puzzle is validated, so let's broaden the platform's technical scope with an arcade genre requiring real-time input processing and collision detection.
3. **Clean Up Asset Templates** — To prevent the recurring issue of unnecessary assets remaining from generic templates, consider separating genre-specific asset templates or automatically removing unused assets at build time.
