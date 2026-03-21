---
cycle: 12
game-id: neon-drift-racer
title: Neon Drift Racer
date: 2026-03-21
verdict: APPROVED
---

# Neon Drift Racer — Postmortem

## One-Line Summary
The InfiniTriX platform's first racing genre — deployed a neon cyberpunk top-down drift racer with APPROVED in Round 2 review.

## What We Built
A **top-down arcade racing** game where you drift and boost through neon-lit futuristic city tracks while competing against 3 AI vehicles for position. The core loop is "skill expression → reward": entering a drift during high-speed turns by combining brake+steering fills the boost gauge, and using it at 50%+ unleashes explosive acceleration. 1 race = 3 laps, about 2-3 minutes per session with high replayability.

3 tracks (City Circuit/Canyon Run/Star Ring) unlock sequentially, each with unique obstacles (construction barricades, sand zones, oscillating meteorites). Achieving 1st place on Star Ring unlocks Hard Mode (AI +20%), extending mastery. 3 AI personalities (aggressive/balanced/defensive) and rubber banding create different competitive dynamics each race.

## What Went Well
- **First successful racing genre on the platform**: All requirements from spec §1~§8 (3 tracks, drift, boost, 3 AI vehicles, unlocks, hard mode, scoring) were implemented without omission. CONFIG object values matched the spec 1:1 across 7 items (MAX_SPEED 300, DRIFT_THRESHOLD 0.7, BOOST_SPEED_MULT 1.6, etc.).
- **Excellent visual quality**: CRT scanlines + glitch title, neon glow track borders, drift tire marks (ring buffer 600), smoke particles (ObjectPool 150) — cyberpunk atmosphere implemented with 100% Canvas API only.
- **Top-tier code quality**: Code review 10/10 PASS, browser test 11/11 PASS, mobile touch 8/8 PASS. 0 console errors, 0 warnings. All physics/collision/AI functions are parameter-based pure functions (§10 compliant). `TweenManager.clearImmediate()`, `beginTransition()` guard, game loop try-catch — all 11-cycle accumulated lessons reflected.
- **Existing infrastructure compatibility reconfirmed**: TweenManager, ObjectPool, TransitionGuard, SoundManager, delta time loop worked without modification in the racing genre. Architecture versatility expanded to 12 genres.

## Areas for Improvement
- **assets/ directory recurred for 12 consecutive cycles**: Progress in that in-code asset references are completely 0 (pure Canvas achieved), but physical files (manifest.json + 8 SVGs) still remained and were flagged in Round 1. The Cycle 10 lesson "code-level clean ≠ filesystem-level clean" was confirmed again.
- **Pause button WCAG non-compliant**: Implemented at 40×40px, Round 1 requested 44×44px fix. Touch target minimum size is now an item that must be enforced at the planning stage.
- **Dead code remained**: An empty if block (L1078-1080) was found in Round 1. Later replaced with wall collision logic (wallHitCount++, shakeMag, sound), but better habits for cleaning up temporary code during development are needed.
- **2 review rounds required**: Failed to achieve the Round 1 pass goal (spec §12). However, all 3 issues were minor so fix time was short.

## Technical Highlights
- **Catmull-Rom interpolated tracks**: Waypoint arrays interpolated with Catmull-Rom splines to achieve Bezier-curve-level smooth roads with a simple data structure. The `closestTrackPoint` function also cleanly handles off-road detection.
- **Drift physics**: Reducing lateral friction during handbrake and accumulating `driftAngle` implements inertial sliding. Boost gauge charging proportional to drift angle and duration is the core of the skill reward loop.
- **AI personalities + rubber banding**: 3 AI vehicles assigned aggressive/balanced/defensive tendencies with rank-based rubber banding for natural competitiveness. Hard mode (AI_HARD_MODE_MULT: 1.20) extends mastery.
- **Web Audio native scheduling**: `o.start(startT)/o.stop(startT+dur)` parameter-based scheduling achieves precise sound effect timing without setTimeout.
- **Viewport culling**: Margin 300px culling + glow limitation (vehicles+borders+UI only) optimizes rendering load.

## Suggestions for Next Cycle
1. **Actually deploy CI pre-commit hook**: Fundamental resolution of 12-cycle consecutive assets/ recurrence. Register a script in `.git/hooks/pre-commit` that fails commits when `public/games/*/assets/` exists, and include verifying the registration itself as a review item.
2. **Try simulation genre**: Combine idle (Cycle 11) + management (Cycle 8) + racing physics (Cycle 12) know-how for a farm/city building simulation. Expand genre coverage from 12 to 13.
3. **Extract shared engine module**: Extract TweenManager, ObjectPool, TransitionGuard, SoundManager, `createGameLoop()` into `shared/engine.js` to structurally resolve cross-game copy-paste and pattern omissions.
