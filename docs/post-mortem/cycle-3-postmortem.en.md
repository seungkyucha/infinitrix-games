---
cycle: 3
game-id: mini-tower-defense
title: Mini Tower Defense
date: 2026-03-20
verdict: NEEDS_MAJOR_FIX / FAIL
---

# Mini Tower Defense — Post-Mortem

## One-Line Summary
We implemented a classic tower defense where 3 tower types are placed on an 8x6 grid to defend against 20 waves, using single HTML + Canvas + Web Audio, but a repeated waveComplete call bug collapsed the game economy, requiring rework.

## What We Built
A mini tower defense game set in a fantasy world. Three tower types — Archer (fast single), Mage (area slow), and Cannon (explosive AoE) — each upgradable to 3 levels, with 4 enemy types (Goblin, Orc, Dark Knight, Speed Runner) rushing along an S-shaped path. The core strategy lies in choosing where to place what with limited gold, targeting 5-10 minute sessions.

After puzzle (Cycle 1) and shooting (Cycle 2), this was the first foray into the strategy genre. We reused validated infrastructure from previous cycles — TweenManager, ObjectPool, state machine — while newly adding 4 procedural sound effects via Web Audio API. We also fully implemented the `destroy()` pattern and `easeOutElastic` easing that were unresolved in Cycle 2.

## What Went Well ✅
- **Most Cycle 2 lessons successfully applied**: Zero setTimeout usage (0 instances), state×system matrix included as code comments, TweenManager updated in all states, score "judge first, save later" order correctly applied. All 3 CRITICAL bugs from previous cycles (B1 tween not updating, B3 setTimeout, B4 judgment order) did not recur.
- **High architecture quality**: 7-state game machine, ObjectPool (enemy 30, projectile 50, particle 80), listen() helper + destroy() pattern, 5 easing functions fully implemented. Over 30 PASS items in code review — the most ever.
- **Rich game content**: 3 tower types × 3 upgrade levels, 4 enemy types (with armor and slow resistance), 20-wave formula-based scaling, dynamic balance correction (crisis bonus), Web Audio procedural SFX 4 types — all completed with zero external assets.
- **Visual polish**: Individualistic tower/enemy/projectile expressions through pure Canvas drawing, with rendering performance secured via offscreen background cache. Faithful HUD feedback including gold pulse and life shake.

## Pain Points / Room for Improvement ⚠️
- **B1 [CRITICAL] waveComplete() repeated calls**: After wave clear, rewards were duplicated every frame during the state transition tween (1.5 seconds), causing gold to explode to 2,380G after clearing just wave 1. Painfully, a single guard flag line would have fixed it. "Tween-based delayed transitions" are a successful pattern, but the new lesson is that you must always guard whether the original condition remains true during that interval.
- **B2 [CRITICAL] Game-over transition race condition**: When endGame() and waveComplete() tweens ran simultaneously, GAMEOVER was overwritten by WAVE_PREP, making the game unfinishable. A state transition priority system was missing.
- **B3 consecutiveCleanWaves not functioning**: Dynamic balance correction (difficulty increase on consecutive no-loss clears) existed in the spec but didn't work in code. The `livesAtWaveStart` variable was declared but never updated.
- **B4 SVG filter recurrence**: Despite specifying "no SVG filters" in the spec, feGaussianBlur appeared again in asset files. Same pattern as Cycle 2 B5, demonstrating the need for automated asset pipeline verification.
- **If we had more time**: Touch-mode specific UI optimization (1.5x button scaling code exists but lacked real testing), infinite mode (play beyond wave 20), tower placement drag preview.

## Technical Highlights 🛠️
- **Web Audio API Procedural Sound**: Generated 4 sound effects at runtime using OscillatorNode + GainNode combinations without external audio files. Archer (high beep), Mage (frequency sweep), Cannon (low thud), Kill (pop) — each matching tower characteristics. Try-catch wrapping ensures no impact on gameplay in unsupported AudioContext environments.
- **State × System Matrix**: Defined a 7-state × 9-system matrix in the spec and double-included it as code comments. This was the direct cause of Cycle 2's CONFIRM_MODAL tween bug not recurring.
- **S-path + First Targeting**: Calculated "frontmost enemy" precisely by combining waypoint index + within-segment progress. Clean implementation of the core targeting logic for tower defense.
- **game.destroy() Pattern Standardization**: Tracks all addEventListener calls via registeredListeners array, then in destroy() performs batch cleanup: cancelAnimationFrame + listener removal + pool clear + AudioContext close. Prevents memory leaks in SPA environments.

## Suggestions for Next Cycle 🚀
1. **Standardize guard pattern for tween-based state transitions**: As a lesson from the waveComplete bug, add the rule "always use guard flag + state priority check for tween delayed transitions" to the coding guidelines and validate in the next game.
2. **Challenge runner/racing or rhythm genre**: After puzzle (C1)→shooting (C2)→strategy (C3), expand to real-time reaction-based genres. Could experiment with procedural generation (infinite maps) or music synchronization.
3. **Automated asset pipeline verification**: To fundamentally prevent SVG filter recurrence (C2→C3), introduce a check script that automatically scans for forbidden patterns (feGaussianBlur, setTimeout, confirm/alert) at build/review stage.
