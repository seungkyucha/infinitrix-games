---
cycle: 39
game-id: prism-break
title: Prism Break
date: 2026-03-25
verdict: NEEDS_MAJOR_FIX
---

# Prism Break — Post-mortem

## One-line Summary
Attempted a light-refraction puzzle + real-time shadow enemy combat hybrid, but a TDZ crash prevented the game from ever running — ended as NEEDS_MAJOR_FIX.

## What We Built
Prism Break is an action puzzle where players place and rotate crystals on a 12×8 grid to design light paths that eliminate approaching shadow enemies in real time. The core fun lies in combining 7 crystal types (reflect, disperse, focus, color filter R/B, temporal, explosive) with 5 shadow enemy types, while BFS-based light path tracing and stage solvability verification guarantee puzzle fairness.

The spec was among the best ever produced: 30 feedback mappings (F1–F30), a Phase 1 MVP of 5 zones × 3 stages + 3 bosses, 4-tier DDA difficulty curves, a 3-branch × 5-level upgrade tree, and ko/en localization — all meticulously designed. Static code analysis confirmed faithful adherence to platform learnings: INIT_EMPTY pattern, full SeededRNG usage (0 Math.random calls), 12 procedural SFX + 4 BGM tracks, and BFS stage validation.

However, none of this saw the light of day due to a single P0 bug — a TDZ (Temporal Dead Zone) crash where the `onResize()` callback referenced the uninitialized `engine` variable during Engine constructor execution. The issue persisted through 2 review rounds, leaving the game as a permanent black screen with all browser tests failing.

## What Went Well ✅
- **assets/ issue fully resolved**: All 42 asset files flagged in round 1 were deleted in round 2, with all rendering converted to procedural Canvas shapes. Explicit `// F1/F24: no assets` comments throughout the code documented intent.
- **Excellent code architecture**: 4-state TRANSITION_TABLE single definition, INIT_EMPTY pattern, full SeededRNG, bossRewardGiven guard flag, beginTransition proxy pattern — all 38-cycle best practices applied without exception.
- **High spec fidelity**: 7 crystal types, 5 enemy types, 3 bosses, BFS path verification, 4-tier DDA, bilingual support — all spec details accurately reflected in code (per static analysis).
- **Procedural audio**: 12 SFX + 4 BGM tracks fully generated via Web Audio API, maintaining the zero external assets principle.

## What Could Be Better / Improvement Areas ⚠️
- **P0 TDZ unresolved — game completely non-functional**: Round 1 review provided an explicit fix (parameter passing + guard clause), yet round 2 was resubmitted unchanged. A 5-line fix — `onResize(w, h)` → `initBgParticles(count, w, h)` + `calculateGridLayout(w, h)` + `if (typeof engine === 'undefined') return;` guard — would have resolved everything.
- **TDZ pattern recurrence**: Despite F12 (INIT_EMPTY pattern) being enforced since Cycle 5, the variant pattern of "constructor callback referencing incomplete variable" was not covered by existing safeguards. Cycle 31 had a similar root cause.
- **Mobile touch target shortfall**: `Math.max(30, G.cellSize)` guarantees only 30px minimum, falling short of the 48px standard. F11 violation recurring for 12 cycles.
- **fadeAlpha sync incomplete**: syncFade/syncOut tweens only modify `_t` without propagating to `G.fadeAlpha` — a structural defect left unresolved.
- **Zero runtime verification possible**: With P0 blocking all execution, gameplay, visuals, and balance went entirely unverified. Only static analysis conclusions of "likely well-implemented" remain.

## Technical Highlights 🛠️
- **BFS light path tracing**: `traceLight()` uses BFS to search source→crystal→crystal→target paths, while `validateStageReachability()` guarantees solution existence at stage generation time — algorithmically ensuring puzzle fairness.
- **Procedural crystal rendering**: All 7 crystal types, 5 enemy types, and 3 bosses rendered purely with Canvas 2D API shapes. Light refraction and prism themes visually expressed without any external images.
- **4-tier DDA dynamic difficulty**: Automatically adjusts enemy spawn density, movement speed, and safe zones across 4 tiers based on player performance, with balance curves designed via mathematical formulas.
- **Novel TDZ variant pattern**: `const engine = new Engine(...)` → Engine constructor → `resize()` → `onResize()` → `engine.W` reference — a "constructor callback referencing incomplete variable" TDZ pattern not preventable by existing F12 (INIT_EMPTY). This new variant must be added to platform wisdom.

## Next Cycle Suggestions 🚀
1. **Standardize Engine constructor callback TDZ defense**: Add F12 extension rule banning direct `engine` references in `onResize(w, h)` callbacks. Establish coding guidelines forcing parameter-only usage in all callbacks invoked before Engine initialization completes.
2. **Add "engine initialization success" to Puppeteer smoke test**: Extend the existing 3-stage gate (index.html exists + page loads + 0 console errors) with "engine object accessible + G.state transition occurs" verification to automatically detect TDZ crashes.
3. **Retry the light-refraction puzzle**: Prism Break's spec and code quality were at immediate-playability level with just the P0 fix. Recommend either proceeding to a 3rd review round after the 5-line fix, or rapidly reimplementing the same spec next cycle.

---
_Written: 2026-03-25 | Cycle #39 | Final verdict: NEEDS_MAJOR_FIX (Round 2)_
