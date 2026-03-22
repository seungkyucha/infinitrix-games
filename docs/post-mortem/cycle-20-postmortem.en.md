---
cycle: 20
game-id: crystal-pinball
title: Crystal Pinball
date: 2026-03-22
verdict: NEEDS_MINOR_FIX
---

# Crystal Pinball — Post-Mortem

## One-Line Summary
Built a physics-based pinball game combining crystal collection, 10-table progression, and upgrade systems in a single 2,485-line pure Canvas file.

## What We Built
Crystal Pinball is a physics arcade game where players control flippers to bounce a glowing ball, destroying bumpers and crystal targets for points. It introduces the first-ever "physics simulation" genre to the InfiniTriX platform, with a core satisfaction loop of flipper hit → ball reflection → bumper collision → particle explosion + sound in under 0.1 seconds.

The 10-table sequential progression (from Tutorial to the Final Boss) combined with an 8-upgrade crystal shop creates a "just one more table" loop. The T5 mid-boss (HP 20) and T10 final boss (HP 45, 3 cores) deliver unique tension compared to regular tables, and all Phase 3–4 advanced features including multiball, save gates, and 10 achievements were fully implemented.

## What Went Well ✅
- **Record 32 feedback mappings (F1–F32)**: Pre-addressing all 19 previous cycles' lessons in spec §0 resulted in feature completeness 12/12 all PASS and value accuracy 11/11 exact match.
- **Physics engine quality**: 4-step substeps (`SUB_STEPS: 4`) prevent high-speed ball tunneling; vector-normalized collision resolution (`resolveCircleCollision` as a pure function) with overlap correction delivers natural pinball physics without external libraries.
- **Web Audio sound**: `ctx.currentTime`-based precise scheduling maintains 0 setTimeout usage (9 consecutive cycles). SFX precisely mapped to bumper hits, flipper activations, drains, and bonus events.
- **Code structure**: 16 logical sections (§A–§S) systematically organize 2,485 lines. Proven infrastructure (pure functions, ParticlePool(200), offscreen canvas table caching) deployed stably.
- **Mobile support**: Multi-touch flippers (simultaneous two-hand operation), touch area splitting (left 40%/right 60%/plunger), auto inputMode detection enable complete keyboard-free play.

## What Could Be Better ⚠️
- **assets/ directory recurrence — 20 consecutive cycles**: Despite spec explicitly stating "never create," 9 SVGs + manifest.json generated again. Canvas fallbacks are complete so no functional impact, but 20 cycles of data definitively confirm "spec-level approaches have absolute limits." CI forced blocking is the only solution.
- **Upgrade shop touch scroll not implemented (M2)**: Only wheel events handled; no touchmove drag scroll, making it difficult to browse 8 upgrade items on mobile. Spec F32 specified "include Canvas scroll" but the touch path was omitted — another "half implementation" pattern.
- **hitAnim decrement in render (M4)**: `drawBumper()` and `drawCrystalTarget()` directly modify hitAnim, violating F26 (render as pure output). Frame-based, so animation speed varies across refresh rates.
- **No visual guide for touch flipper zones (M3)**: First-time mobile users have no indication of where to touch. An initial tutorial overlay would improve onboarding.
- **Google Fonts external dependency (M5)**: Press Start 2P loaded from CDN. Monospace fallback works offline, but inconsistent with the "0 external assets" principle.

## Technical Highlights 🛠️
The core technical challenge was **implementing pinball physics without external libraries**. 4-step substeps divide dt to prevent high-speed ball penetration through walls and bumpers. Line-circle collision (ball-flipper) and circle-circle collision (ball-bumper/crystal) were combined for diverse object interactions. `resolveCircleCollision()` is a fully pure function — receiving position, velocity, and restitution as parameters and returning new velocity.

The `buildTableCache()` pattern renders static table elements (bumper outlines, lanes, walls) to an offscreen canvas once and reuses them every frame, achieving zero performance overhead even across 10 table transitions. ParticlePool(200) prevents GC spikes from simultaneous particle generation during bumper hits, crystal destruction, and boss core explosions.

STATE_PRIORITY map manages transition priorities across 10 states (TITLE/TABLE_SELECT/PLAYING/PAUSED/UPGRADE/DRAIN/BOSS_INTRO/TABLE_CLEAR/RESULT/GAMEOVER), and the triple guard system (`isTransitioning`/`isDraining`/`isLaunching`) achieved 0 race conditions.

## Next Cycle Suggestions 🚀
1. **CI/pre-commit hook actual registration**: 20 consecutive cycles of assets/ recurrence is confirmed. Register `test -f index.html && ! test -d assets/` in `.git/hooks/pre-commit` — there is no more "next time."
2. **Shared engine module extraction**: Consolidate TweenManager/ObjectPool/TransitionGuard/SoundManager/touchSafe() copy-pasted across 20 games into `shared/engine.js`. This cycle's 2,485 lines could drop below 1,800 with shared code removal.
3. **Physics pinball extension or new genre**: With the pinball physics engine validated, either (a) add an online leaderboard to Crystal Pinball, or (b) leverage the verified substep physics for new physics genres like billiards or air hockey.
