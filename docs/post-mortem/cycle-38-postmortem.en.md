---
cycle: 38
game-id: gravity-flip
title: Gravity Flip
date: 2026-03-25
verdict: PENDING
---

# Gravity Flip — Post-Mortem

## One-Line Summary
A one-touch gravity-reversal rage platformer escaping a collapsing lab — directly responding to the Level Devil trend while filling the longest-unused arcade+casual genre gap on the platform.

## What We Built

**Gravity Flip** is a one-touch gravity-reversal rage platformer set in a research lab where a gravity experiment has gone wrong. A single tap/click flips gravity 180°, and the player must dodge obstacles and break through increasingly hostile environments (disappearing floors, falling ceilings, protruding spikes) to reach the exit portal. It directly borrows Level Devil's philosophy of "what looks safe is a trap" (Poki's #1 in March 2026) while differentiating through physics-based gravity-flip mechanics.

The game features 5 zones (Lab Wing → Corridor → Reactor → Gravity Chamber → Core) × 3 stages = 15 main stages + 5 bosses + 3 hidden zero-gravity stages = **23 total stages**. The upgrade tree (Gravity Control / Dash / Time Slow, 3 branches × 5 levels) ensures build diversity, and the instant-death + instant-respawn (0.3s) loop maximizes the "rage → retry → satisfaction" cycle. SeededRNG-based procedural obstacle pattern combinations introduce subtle variations each play, preventing pure pattern memorization.

Learning from the previous cycle (#37 Gold Rush Tactics) where dual systems (puzzle + town building) caused scope overload, this cycle focuses on a **single core loop: flip → break through → escape**. The state machine was further simplified from 5 states to **4 states (TITLE/MAP/PLAY/BOSS)**, reducing code complexity.

## What Went Well ✅

- **Systematic application of prior lessons**: 28 feedback mappings (F1–F28) explicitly documented in the spec, with all 4 "areas for improvement" from Cycle 37 linked to resolution sections. Three proposals — TRANSITION_TABLE auto-verification, assets/ CI enforcement, and mathematical balance formulas — all reflected in §6.1, §14.3, and §8.
- **Single core loop focus**: Following Cycle 35 planner lessons, sub-systems were reduced to a single upgrade tree, and core mechanic functions limited to ≤5, effectively controlling code complexity.
- **4-state TRANSITION_TABLE single definition**: Learning from STATE_PRIORITY's 7th recurrence (Cycle 36), states were minimized to 4 by merging MAP/SHOP, with `Object.keys(TRANSITION_TABLE).length === 4` as a verification criterion in the spec.
- **Mathematical difficulty curve formalization**: Obstacle density, speed, safe intervals, coin count, and par time defined as mathematical functions of stage number n, enabling pre-implementation balance verification — a structural improvement over Cycle 37's missing balance simulator.
- **BFS reachability verification + procedural generation**: Auto-verifying exit reachability via BFS during stage generation, with seed+1 retry up to 10 times on failure, structurally preventing impossible maps.
- **Boss weakness timing window ASCII visualization**: Reflecting Cycle 37 planner's suggestion, boss-specific weakness exposure timings are documented as ASCII diagrams in the spec, pre-verifying completability.

## Areas for Improvement ⚠️

- **Review incomplete (PENDING)**: Second consecutive cycle without a full code review. The game code appears to not yet be generated or implementation is still in progress. The gap between the spec's completeness and the unverifiable implementation state is the biggest concern.
- **assets/ 38-cycle consecutive recurrence risk**: Despite F1/F24 spec declarations and smoke test FAIL gate design, 37 cycles of data prove "spec declarations alone will always recur in round 1." Whether CI enforcement actually works is the key question.
- **Balance auto-simulator still absent**: Mathematical formula-based balance design is progress, but actual clearability with extreme upgrade builds (all-in dash + all-in slow) cannot be verified without an auto-simulator. Unresolved for 38 cycles.
- **Shared engine not extracted — 38 cycles running**: TweenManager, ObjectPool, SoundManager, hitTest(), touchSafe() still copy-pasted per game. The INIT_EMPTY, TW, SND patterns in spec §5 are identical code repeated from 37 prior games.
- **Content volume with 10 obstacle types + 5 bosses**: Despite focusing on a single core loop, 10 obstacle types (T1–T10) + 5 bosses + 3 hidden stages is still substantial. Clear Phase 1 MVP boundaries are good, but Phase 2 scope could become excessive during actual implementation.

## Technical Highlights 🛠️

- **One-touch gravity reversal physics**: A single input (tap) flips gravity direction 180°. Combined with auto-scroll (120px/s), controls are extremely simple yet timing judgment depth is substantial.
- **SeededRNG segment-based stage generation**: Stages composed of 8 segments (300px each) from 20 predefined patterns with ±2 tile / 30% variations. Difficulty distribution (`[E, E, M, M, M, H, H, E]`) structurally encodes the rage game emotional curve of "safety before the exit."
- **4-mode camera system**: Player-centered horizontal scroll (left 1/3 fixed) + boss zoom-out (1.0→0.7) + death screen shake + slow-mo + clear zoom-in (1.0→1.3) — four camera modes synchronized with game events.
- **DDA 4-tier "information provision" approach**: Progressive help through speed reduction, ghost path hints, and danger glow at 5/10/20 consecutive deaths. Provides "more information" rather than disabling traps, preserving the rage game's challenge integrity.
- **TRANSITION_TABLE static verification**: Smoke tests verify all transition pairs (from→to), with `Object.keys(TRANSITION_TABLE).length === 4` as a static verification criterion — addressing the 7th STATE_PRIORITY recurrence.

## Suggestions for Next Cycle 🚀

1. **Complete implementation + full code review**: Resolving 2 consecutive PENDING cycles is the top priority. With the spec's high completeness, rapidly implement Phase 1 MVP (zones 1–3 + 3 bosses + upgrade Lv1–3 + DDA 3-tier) and verify full play flow (including TITLE→MAP→PLAY→BOSS transitions).
2. **CI/pre-commit hook actual registration + verification**: The only way to simultaneously resolve 37-cycle assets/ recurrence + 7th STATE_PRIORITY recurrence. The smoke test gate designed in the spec must be moved to an actual CI pipeline.
3. **DDA effectiveness measurement in rage platformer genre**: Attempt a metrics collection system to verify whether the "information provision" DDA approach actually reduces churn or diminishes challenge — using play data (consecutive death distribution, per-stage abandonment rate).

---

*Written: 2026-03-25 | InfiniTriX Post-Mortem Record*
