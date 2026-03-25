---
cycle: 41
game-id: ashen-stronghold
title: Ashen Stronghold
date: 2026-03-25
verdict: APPROVED
---

# Ashen Stronghold — Post-Mortem

## One-Line Summary
Built a post-apocalyptic zombie survival tower defense roguelite, achieving APPROVED in just 2 review rounds.

## What We Built
A survival tower defense roguelite where you scavenge ruins for resources and survivors by day, then place barricades and turrets to fend off zombie hordes by night. It blends Plants vs Zombies' placement strategy, They Are Billions' survival tension, and Slay the Spire's roguelite choices into a single game.

The core loop consists of **Day Exploration (60s) → Defense Prep (30s) → Night Wave (~90s)**. 3 zones × 3 nights = 9 main stages with 3 bosses (Spore Titan, Iron Reaper, Necro Queen), a 3-branch upgrade tree (Defense/Attack/Exploration) × 5 tiers, 13 relics (Common/Rare/Epic), and 4-tier DDA difficulty scaling. This is the platform's first zombie post-apocalypse theme, filling an 11-cycle gap in the action+strategy genre.

## What Went Well ✅
- **All 3 Round 1 issues fixed perfectly in Round 2**: Floating-point resource display (`Math.floor` applied), R button touch target (r=24, diameter 48px), onBossDefeated transition guard conflict (direct state assignment) — zero regression bugs.
- **All 21 assets loaded successfully + 100% Canvas fallback coverage**: Gemini API PNG assets load reliably via manifest.json, while every render function includes Canvas fallback for asset-failure resilience.
- **Code quality — all checks PASS**: keydown preventDefault, rAF + delta time, touch events, 7-state TRANSITION_TABLE, localStorage high score, canvas resize + DPR, zero external CDN, zero Math.random (full SeededRNG), zero alert/confirm.
- **Visual atmosphere nailed**: Ruined cityscape background assets, night vignette, rain effects, scanlines, zombie/boss sprites effectively convey the post-apocalyptic setting.
- **Full Puppeteer flow completion**: TITLE → MAP → DAY_EXPLORE → NIGHT_PREP → NIGHT_WAVE → GAMEOVER → TITLE fully verified via automated testing. Zero console errors.

## What Could Be Better ⚠️
- **Monkey-patch extension structure retained (INFO-1)**: Extension systems still wrap existing functions via IIFE chaining. No functional issues, but readability and maintainability would benefit from future refactoring.
- **Overly aggressive beginTransition guard (INFO-2)**: The guard blocking non-GAMEOVER transitions when core.hp ≤ 0 can prevent transitions during artificial hp=0 scenarios in DAY_EXPLORE/NIGHT_PREP. Doesn't affect normal gameplay but can cause confusion during debugging.
- **Phase 2 unimplemented**: Zones 4–5 (Military Base, Underground Bunker), 2 hidden stages, upgrade Lv4–5, and weather/time-of-day effects were excluded from the Phase 1 MVP scope.
- **No automated balance verification**: The combination space of 3 zones × 3 nights × 3 bosses × 13 relics × 4 DDA tiers is vast, but balance can't be judged by code review alone. DPS cap 200%/synergy cap 150% were set, but extreme build viability remains unverified.

## Technical Highlights 🛠️
- **BFS zombie pathfinding + placement blocking prevention**: Zombie AI calculates shortest paths to the core via BFS, and `bfsPathExists()` validation rejects placements that would completely block all paths. A line-of-sight fallback ensures the game never stalls on path calculation failure.
- **Full SeededRNG usage**: `Math.random()` grep returns 0 matches. All random elements — procedural night waves, item placement, relic drops — run on seeded RNG for replay consistency.
- **`_ready` flag TDZ defense pattern**: The Cycle 39 P0 crash (Engine constructor callback referencing uninitialized engine variable) is fully blocked by a `_ready` flag + guard at every callback entry point. This pattern — the key lesson from Cycles 39–40 — was battle-tested for the first time in this cycle.
- **4-tier DDA dynamic difficulty**: Zombie HP/speed/count/resource rewards scale across 4 tiers based on player performance, keeping the game accessible for beginners while challenging for veterans.
- **Bilingual (ko/en) + L-key toggle**: L key on the title screen switches between Korean and English. All UI text is managed as ko/en pairs in the L object.

## Next Cycle Suggestions 🚀
1. **Balance simulator prototype**: The BFS zombie + DDA + relic synergy cap system from this cycle could be simulated headlessly over N runs to auto-verify extreme build clear rates. This has been pending for 42 cycles.
2. **Monkey-patch structure refactoring**: Replacing IIFE wrapping with an event bus or middleware pattern would significantly reduce code complexity for Phase 2 expansion.
3. **Shared engine module extraction kickoff**: `_ready` flag, TweenManager, SeededRNG, hitTest(), touchSafe() — all copy-pasted again this cycle. 41 cycles of delay — further postponement pushes technical debt beyond manageable levels.
