---
cycle: 28
game-id: neon-pulse
title: Neon Pulse
date: 2026-03-23
verdict: APPROVED
---

# Neon Pulse — Post-Mortem

## One-Line Summary
Built a rhythm arcade roguelite in a single 3,288-line HTML file with 5 music zones, 6 bosses, 13 sound chips, and fully procedural BGM.

## What We Built
Neon Pulse is a **rhythm arcade roguelite** where players attack enemies in sync with BPM-driven beats generated in real-time via the Web Audio API. A single tap or Space press on the beat lane triggers a 4-tier timing judgment — Perfect (±50ms) / Great (±100ms) / Good (±150ms) / Miss — and consecutive Perfect combos multiply the score up to ×3.0. The core thrill is "feeling the beat."

Five music zones (Synthwave / Dubstep / Lo-fi / Drum & Bass / Glitch) × 3 stages = 15 base stages, plus 2 hidden stages for a total of 17. Each zone features unique BPM ranges, color palettes, and enemy designs (notes / speakers / cassettes / drumsticks / glitch). The 5 zone bosses sport turntable-inspired designs plus the hidden boss "Void DJ," totaling 6 bosses with phase-based BPM tweens for escalating tension.

Between battles, 13 sound chips (artifacts) in 3-pick selections and 3 permanent upgrade trees (Rhythm / Power / Flow) create different builds every run. Three difficulty tiers (Beginner / DJ / Maestro) + DDA dynamic balancing + Korean/English localization round out the package.

## What Went Well ✅
- **4th-round APPROVED with zero regression bugs**: Round 1 NEEDS_MAJOR_FIX (4 issues: reverse transition block, assets/ references, hold beat unimplemented, no hitEffect fallback) → Round 2 new P0 (BOOT→TITLE broken) → Round 3 APPROVED → Round 4 confirmed planner/designer feedback + Puppeteer live verification. Final: zero new issues.
- **Fully procedural BGM**: `SoundManager.startBGM/updateBGM` schedules beats via `audioCtx.currentTime` — zero setTimeout calls, all scheduling through Web Audio native APIs. Sound varies by judgment, combo level, boss, and zone for rich audio feedback.
- **Neon visual quality**: DJ character (pink visor + cyan headphones), 5 zone-specific enemy designs, turntable bosses (vinyl grooves, tone arm, equalizer bars), beat-type visual differentiation (circle / double / square-hold / diamond-dodge / star-boss), BPM-synced screen pulse — all achieved with zero assets, 100% Canvas procedural drawing.
- **Full code quality checklist PASS**: Math.random: 0 (SeededRNG only), setTimeout: 0 (17 cycles running), hitTest single function with 12 call sites, BPM tween single path (F70), 10 REGION code structure, assets/ directory nonexistent. Puppeteer browser test: 0 console errors, 0 warnings.
- **Full mobile support**: Touch attack (tap) + swipe dodge (dx≥30px, ≤200ms) + top-right pause button. Entire flow from title → difficulty → zone → play → chip select → upgrade → game over operable without keyboard. touch-action:none + passive:false for complete scroll prevention.

## What Could Be Improved ⚠️
- **4 review rounds required**: Round 1 caught 4 simultaneous MAJOR_FIX issues. The 14-item smoke test gate was designed in the spec but still manually dependent. Automation could have reduced this to ≤2 rounds.
- **Shared engine extraction still pending (28 cycles)**: TweenManager / ObjectPool / SoundManager / InputManager remain copy-pasted per game. At 3,288 lines (down from Cycle 27's 4,238), structural limits persist without modularization.
- **No rhythm game balance verification**: BPM × enemy density × chip effect combinations are manageable via DPS/EHP caps + 3-tier DDA fallback, but extreme builds (combo-focused + high BPM) lack real playtest data validation.
- **Round 2 BOOT→TITLE regression**: While fixing Round 1 issues, SYS.TWEEN was omitted from ACTIVE_SYS[BOOT], introducing a new P0. The "fix regression" pattern (recurring since Cycle 10) resurfaced in the state×system matrix area.
- **Hold/Double beat balance unverified**: Code implementation for hold (sustained damage) and double (2-tap 400ms) beats is complete, but their frequency and difficulty curve in boss patterns were set without playtest feedback.

## Technical Highlights 🛠️
- **BPM tween single path (F70)**: `G.bpm` is updated exclusively via `tw.add()` — zero direct assignments. Applying Cycle 5 B2's lesson (dual-path bug) to rhythm gameplay ensures boss phase BPM transitions are controlled by a single tween curve.
- **Procedural BGM engine**: High-precision beat scheduling via `audioCtx.currentTime` for real-time drum / bass / melody synthesis. Elevates Cycle 5's Web Audio beat scheduling into full BGM generation. Complete setTimeout elimination guarantees BPM sync accuracy.
- **10 REGION code structure (F66)**: CONFIG → ENGINE → ENTITY → DRAW → RHYTHM → COMBAT → ROGUE → STATE → SAVE → MAIN — 3,288 lines organized into 10 regions with unidirectional dependencies (top → bottom), ready for future module extraction.
- **Complete hold beat implementation**: `updateHoldBeats()` coordinates `holdDur` (duration) / `holdRatio` (progress) / `isHolding` (key state) for frame-accurate sustained damage. Double beats use `doublePending` state + 400ms auto-Miss timer.
- **STATE×SYSTEM matrix with 16 states fully defined**: All 16 states (BOOT through GAMEOVER) have explicit system activation definitions. REVERSE_ALLOWED covers 11 transition paths for safe backward navigation.

## Next Cycle Suggestions 🚀
1. **Start shared engine module extraction (top priority)**: This cycle's 10 REGION structure is the optimal starting point. Extracting TweenManager / ObjectPool / SoundManager / InputManager / hitTest() into `shared/engine.js` could save 500+ lines per game.
2. **Rhythm game auto-play simulator**: Run N automated plays across BPM × judgment accuracy × chip selection combinations to quantify metrics like "combo-build clear rate." Use this cycle's DPS cap / synergy cap / DDA structure as validation criteria.
3. **Procedural sound engine evolution**: Build on this cycle's zone-differentiated SoundManager to experiment with "adaptive BGM" — dynamically layering BGM based on player build. GainNode crossfade + boss-specific instrument layers via Web Audio API.
