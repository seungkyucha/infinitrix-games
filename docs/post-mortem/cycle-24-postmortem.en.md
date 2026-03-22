---
cycle: 24
game-id: abyss-keeper
title: Abyss Keeper
date: 2026-03-22
verdict: APPROVED
---

# Abyss Keeper — Post-Mortem

## One-Line Summary
Built a dual-phase deep-sea survival game — casual fishing/gathering by day, monster combat by night — in pure Canvas, achieving APPROVED after 2nd review round 2 (3 total rounds).

## What We Built
Abyss Keeper tells the story of the last lighthouse keeper guarding against the abyss. During the day, players gather resources through timing-based fishing minigames and driftwood collection to upgrade the lighthouse (casual phase). At night, they defend the lighthouse against deep-sea monsters using three distinct weapons — harpoon, sonar cannon, and net (action phase). The two phases cycle naturally through Tide stages, letting casual players enjoy fishing and building while action players dive into combat.

The game packs 15 Tide stages, 3 abyssal bosses, a hidden "Mariana Trench" stage, a lighthouse upgrade tree, weapon crafting, and weather/time-of-day changes — all in a single HTML file with SeededRNG procedural wave patterns and dynamic difficulty adjustment. This game completely fills the **action + casual = 0 games** genre gap on the platform.

Bioluminescence particles, lighthouse light diffusion, and 3-layer sin-wave animations bring the deep-sea atmosphere to life using only Canvas API, achieving strong visual immersion without any external assets.

## What Went Well ✅
- **Dual-phase system completeness**: The spec's intended "casual → action natural cycle" was precisely implemented with 16 game states + ACTIVE_SYSTEMS matrix (16×12). All state transitions — tide changes, boss entries, hidden stage unlocks — use STATE_PRIORITY + RESTART_ALLOWED with 0 race conditions.
- **RESTART_ALLOWED pre-emptive spec inclusion (F44)**: The GAMEOVER→TITLE P0 bug that persisted 5 rounds across Cycles 21–23 was resolved in the 1st review by explicitly declaring the whitelist in spec §6.1. A success case for spec-level pre-emption.
- **Bioluminescence visual direction**: Deep-sea particles, lighthouse light diffusion, casual→action sky gradient transition (3-second tween) all implemented in Canvas code drawing alone, with rendering quality perfectly maintained after assets/ deletion.
- **F1/F2 platform compliance**: 0 external assets, 0 external CDNs. assets/ directory contains only platform-required files (manifest.json + thumbnail.svg). ASSET_MAP/SPRITES/preloadAssets code fully removed. assets/ non-creation **8 consecutive cycles** (Cycle 18–24).
- **Code quality**: ObjectPool pattern, Math.hypot distance-based collision, rAF + dt cap (50ms), 0 per-frame DOM access, F8 pattern (judge first, save later), 0 eval/XSS — all code quality items PASS.

## What Could Be Better ⚠️
- **3 review rounds needed (2nd review round 2)**: Round 1 found B1 (RESTART_ALLOWED missing, P0), B2 (transAlpha disconnected, P1), B4 (touch 48px short, P2). Round 2-1 still had B3 (assets/ F1 violation, P1) and B5 (Google Fonts F2 violation, P1). The 10-item smoke test gate (F47) was specified but not fully followed in initial implementation.
- **Google Fonts residue (B5)**: Despite the "system fonts only" principle, two `<link>` tags remained. Removed in 2nd review, but the P3 comment "Google Fonts with fallback" (line 148) still lingers.
- **Asset code residue (B3)**: ASSET_MAP/SPRITES/preloadAssets found in round 1. Canvas fallback was complete so deletion sufficed, but it shows the "never create in the first place" principle isn't yet 100% internalized.
- **No automatic balance verification (F46)**: 15 tides × 3 difficulties × multiple weapon combos can't be validated by code review alone. DPS/EHP formulas were specified but no auto-simulator exists yet.
- **Single-file scale**: Dual-phase + bosses + upgrade tree = large code volume. Shared engine extraction (shared/engine.js) has been delayed for 24 cycles.

## Technical Highlights 🛠️
- **16-state dual-phase system**: TITLE/DIFF_SELECT/CASUAL_PHASE/FISHING/UPGRADE/ACTION_PHASE/BOSS_FIGHT/TIDE_RESULT and more — 16 states managed flawlessly via STATE_PRIORITY + RESTART_ALLOWED + beginTransition. Casual↔action transitions smoothly connected via tween-based fades.
- **SeededRNG procedural content**: LCG-based seeded RNG makes wave patterns, fish catches, and monster spawns different every play yet reproducible. Combined with dynamic difficulty adjustment for balance curves beyond the 3 static difficulty levels.
- **ACTIVE_SYSTEMS matrix (F7)**: Complete 16 states × 12 systems definition matrix, dually specified in spec and code. The largest-scale application of a pattern validated across 22 cycles since Cycle 2 B1.
- **3-weapon system**: Harpoon (single penetration), sonar cannon (AoE knockback), net (slow trap) — distinct physics per weapon combined with Canvas code drawing. 1/2/3 key switching + mobile WPN touch button (48px+ guaranteed).
- **Bioluminescence particle system**: Sin-curve-based natural luminous movement, lighthouse light interaction with diffusion effects via Canvas globalAlpha + gradient.

## Next Cycle Suggestions 🚀
1. **Begin shared engine module extraction**: TweenManager/ObjectPool/TransitionGuard/RESTART_ALLOWED/SoundManager/touchSafe()/ScrollManager — extracting copy-paste from 24 games to shared/engine.js saves 500+ lines per game with bulk bug fix propagation. Further delay exceeds maintainability limits.
2. **Balance auto-simulator prototype**: A tool for headless N-run auto-play to output per-stage clear rates/DPS statistics for complex balance spaces like this cycle's 15 tides × 3 difficulties. Especially urgent for action+casual hybrids.
3. **Explore simulation/management genres**: With action+casual gap filled, analyze the platform's next genre gaps and try untapped combinations like simulation or strategy+casual. The dual-phase system validated here can be reused.
