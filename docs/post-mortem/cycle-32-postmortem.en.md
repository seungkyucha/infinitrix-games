---
cycle: 32
game-id: spectral-sleuth
title: Spectral Sleuth
date: 2026-03-23
verdict: ✅ APPROVED
---

# Spectral Sleuth — Post-Mortem

## One-Line Summary
Built a 1920s Art Deco mystery puzzle adventure where a murdered detective returns as a ghost, using Clairvoyance, Empathy, and Time Rewind abilities to gather invisible clues and deduce the culprit through logic puzzles and Phoenix Wright-style confrontation boss fights.

## What We Built
"Spectral Sleuth" is the platform's first detective-themed game. Players take on the role of Lucian Grey, a renowned detective murdered under mysterious circumstances, who awakens as a ghost to pursue his own killer. Three spectral abilities — Clairvoyance (revealing hidden fingerprints and bloodstains), Empathy (reading residual emotions), and Time Rewind (replaying past scenes) — allow discovery of clues invisible to the living. Collected evidence is combined into "deduction chains," and suspects are confronted in turn-based argumentation boss fights where players present proof against contradictions in testimony.

The key differentiator is **non-combat boss battles**. Defeating bosses through reasoning and evidence rather than fighting is a novel experience within the platform, strengthening the puzzle+casual genre combination from 2 to 3 entries. Set in "Misthaven," a 1920s Art Deco port city, the visuals maximize atmosphere through the contrast of warm gas-lamp amber lighting against cyan ghost-vision overlays, with district-specific weather effects (fog, rain, snow, dust, ether particles). This marks 8 consecutive cycles of distinct genre combinations (#25–#32).

## What Went Well ✅
- **INIT_EMPTY pattern fully established**: The TDZ crash issue that dragged Cycle 31 to a 3rd review was structurally prevented by initializing the G object with empty structures at declaration. Zero TDZ issues this cycle.
- **Perfect asset rule compliance**: ASSET_MAP/SPRITES/preloadAssets code at 0 hits, all 8 orphaned SVGs deleted (cleaned in attempt 3), minimal state with only thumbnail.svg + manifest.json remaining.
- **Complete mobile input implementation**: Virtual joystick + ability buttons + double-tap (interaction) + long-press (ability use) + evidence card tap + verification button — full gameplay without keyboard. All 13 mobile test items PASS.
- **Most procedural sounds to date**: 8 SFX + 4 BGM tracks via Web Audio API with zero external audio files.
- **18-state complete mapping**: ESCAPE_ALLOWED + ACTIVE_SYSTEMS matrix flawlessly managing all 18 states. Single beginTransition definition with zero dead code.
- **Code quality**: SeededRNG 100% (Math.random 0 hits), setTimeout 0, alert/confirm/prompt 0, eval 0, hitTest() unified, pure function pattern, full bilingual support (ko/en).

## What Could Be Better ⚠️
- **Required 3 review attempts**: Attempts 1–2 flagged 8 orphaned SVGs (P1-R), duplicate beginTransition definition (P2), and RESTART_ALLOWED dead code (P3). APPROVED only on the 3rd submission. Asset file management and code cleanup need stronger integration into the pre-review gate.
- **Balance unverified**: The combination space of 5 districts × 3 cases × 3 abilities × 8 tools × DDA cannot be validated through code review alone. Reducing puzzle difficulty to 3 variables (clue count/time limit/error tolerance) was a good approach, but without automated simulation, "impossible districts" or "single-ability dominance" issues remain undetectable.
- **Shared engine still not extracted — 32 cycles running**: TweenManager, ObjectPool, SoundManager, InputManager continue to be copy-pasted per game. Dependency direction is organized via 10 REGION structure, but actual module extraction hasn't begun.
- **Small display (320px) deep verification incomplete**: A 5-tier viewport matrix was included in the spec, but evidence panel/deduction board UI overlap at 320px extreme-small screens lacks real-device verification.

## Technical Highlights 🛠️
- **Art Deco visuals in pure Canvas**: Geometric building silhouettes, ghost glow aura (5-frame afterimage trail), gas-lamp amber lighting, star+moon weather effects, and 4 transition animations (fade/wipe/slide/dramatic) — all achieved with zero assets via code drawing. An 11-color palette (deep navy #0B1426, ethereal cyan #00D4FF, amber gold #FFB800, etc.) effectively evokes the 1920s ghost world.
- **3 spectral ability visual modes**: Clairvoyance (brightness up, saturation down, cyan tint), Empathy (colored emotion auras around targets), Time Rewind (sepia tone + VHS noise + reversed particles). Canvas filters and compositing provide completely distinct visual experiences per ability.
- **transProxy-based tween transition system**: Single beginTransition definition + 4 transition effects managed cleanly via proxy pattern, structurally resolving the prior cycle's duplicate definition problem.
- **devicePixelRatio handling**: `canvas.width = w * dpr` + `ctx.setTransform(dpr, ...)` pattern ensures crisp rendering on high-resolution displays.

## Next Cycle Suggestions 🚀
1. **Begin shared engine module extraction** — A 32-cycle delay is absolutely unjustifiable. Use spectral-sleuth's 10 REGION + transProxy pattern as the base to extract TweenManager/ObjectPool/SoundManager/InputManager/hitTest()/touchSafe()/ScrollManager into `shared/engine.js`. Target: 500+ line reduction per game + bulk bug fix propagation.
2. **Expand pre-review automated gate** — Automate orphaned asset file detection + single beginTransition verification + dead code detection to reduce 3-attempt reviews down to 1.
3. **Puzzle genre balance simulator** — Leverage this cycle's 3-variable puzzle difficulty (clue count/time/errors) to build an auto-deduction simulator (random ability selection + clue collection + puzzle solving N runs) for pre-verifying per-district clear rates and time distributions.
