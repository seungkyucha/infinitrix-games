---
cycle: 27
game-id: elemental-cascade
title: Elemental Cascade
date: 2026-03-23
verdict: APPROVED
---

# Elemental Cascade — Post-Mortem

## One-Line Summary
A roguelike combining 6-element match-3 gem puzzles with RPG combat, packing 5 regions, 7 bosses, 13 relics, and 18 spells into a single 4,238-line HTML file.

## What We Built
Elemental Cascade is an **elemental match-3 roguelike RPG** where players match gems of 6 elements (Fire/Water/Earth/Wind/Light/Dark) on an 8×8 grid to generate mana, then cast 18 spells to defeat monsters and bosses in sealed dungeons. The visual satisfaction of cascade combos — from 3-match → 4-match (cross explosion) → 5-match (elemental explosion) → L/T-match (special effects) — is the core experience.

Players conquer 5 regions (Volcano/Deep Sea/Forest/Sky/Abyss) sequentially, each with unique environmental effects (fire bonus damage, auto water gem spawn, fixed lightning damage, etc.) that shift strategy. Between battles, 3-pick roguelike relics (6 common/4 rare/3 epic) and 3 permanent upgrade trees (attack/defense/utility) provide build diversity. Reaching the hidden boss "Primordial" unlocks the true ending. The game features 3 difficulty tiers (Apprentice/Mage/Archmage), DDA dynamic balancing, and Korean/English dual language support.

## What Went Well ✅
- **100% spec implementation**: 8×8 grid, 6-element affinity, 5 match types (3/4/5/L/T), mana generation values, 5 regions, 7 bosses, 13 relics, 3 upgrade trees, 3 difficulties, DDA, SeededRNG, dual language — all CONFIG values matched spec 1:1.
- **Boss double-reward bug fundamentally resolved**: `bossRewardGiven` flag + `checkBattleEnd()→checkEnemiesDefeated()` delegation ensured single reward path. Code duplication also eliminated, greatly improving maintainability.
- **Visual quality**: 5 unique enemy type visuals, 6-element boss decorations, region-specific environment effects (lava/bubbles/falling leaves/lightning/distortion), parallax starfield, boss zoom-in choreography, combo gold glow, camera shake — all achieved with 0 assets via 100% Canvas procedural drawing.
- **Code quality excellence**: Smoke test 12/12 PASS, browser (Puppeteer) test console errors 0, Math.random 0 (complete SeededRNG), setTimeout 0 (16 consecutive cycles), hitTest() single function for all touch/click detection.
- **APPROVED in round 4**: All P1–P5 issues from rounds 1–3 fixed and maintained + P2 boss double-reward fully resolved. Regression bugs: 0.

## What Could Be Improved ⚠️
- **4 review rounds required**: Round 1 simultaneously found assets/ illegal SVGs (P0), RESTART_ALLOWED dead code, swipe defect, and touch button height violation. An automated smoke test gate could have reduced this to 2 rounds or less.
- **Shared engine extraction delayed 27 cycles**: TweenManager/ObjectPool/SoundManager/InputManager still copy-pasted within a single file. At 4,238 lines (near all-time record), single HTML maintainability is approaching its limit.
- **No automated balance verification**: The combination space (6 elements × 4 match types × 13 relics × 5 enemy types × 7 bosses) is vast, but relies only on DPS/EHP caps (200%/150%) and DDA fallback without actual simulation.
- **assets/ round-1 recurrence**: The 10-consecutive-cycle cleanup streak (Cycle 18–26) was nearly broken, recovered in round 2. Confirms that without CI enforcement, this issue will recur in round 1 even at cycle 27.
- **Hit area / drawing coordinate separation**: The drawTitle() language toggle 12px offset pattern from Cycle 26 was improved with hitTest() single function, but legacy coordinate separation patterns haven't been fully eliminated.

## Technical Highlights 🛠️
- **Match detection algorithm**: 5-match → T → L → 4 → 3 priority scan + recursive cascade processing. `isProcessing` guard + `_transitioning` dual guard achieves 0 callback collisions.
- **Complete SeededRNG usage**: `G.rng.next()` exclusively, 0 Math.random strings. Gem placement, enemy spawns, relic choices all seed-based for replay reproducibility.
- **bossRewardGiven flag pattern**: Reward path consolidated into `checkEnemiesDefeated()` single function with flag guard ensuring first-time-only payment from any call path. Clean separation of state transition and reward logic.
- **hitTest() single function**: Scattered per-function touch/click detection (F60) fully unified into `hitTest(x, y, rect)`. Structurally prevents hit area sync issues.
- **18-state-class game depth**: Multiple states (title/difficulty/battle/boss intro/boss fight/relic select/shop/pause/game over/victory) managed flawlessly via STATE_PRIORITY + beginTransition + RESTART_ALLOWED. Guard flag pattern stable for 20 consecutive cycles.
- **devicePixelRatio + Math.min(rawDt, 33.33)**: High-res display support + 2-frame skip cap for stable rendering across diverse environments.

## Next Cycle Suggestions 🚀
1. **Begin shared engine module extraction**: This cycle's well-organized InputManager/hitTest()/SoundManager utilities make it an ideal starting point for `shared/engine.js`. Estimated 500+ line reduction per game.
2. **Match-3 RPG balance simulator**: Prototype an automated verification tool running AI random-play N times to test extreme builds (single-element focus, etc.) against this game's 6-element affinity + relic synergy combinations.
3. **puzzle+strategy genre variant**: Reuse Elemental Cascade's element affinity system in real-time strategy or tower defense, or conversely combine Cycle 26's tetromino system with match-3 for an experimental hybrid.
