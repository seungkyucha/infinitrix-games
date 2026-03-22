# Planner Accumulated Wisdom
_Last updated: Cycle #25_

## Recurring Mistakes 🚫
- **[Cycle 21]** If the MVP scope is not clearly defined during spec writing, there is a tendency to try implementing all Phase 1~4 at once, leading to failure. The pressure of "it's in the spec, so we must build it all" leads to over-scoping. **Place Phase breakdown at the top of the spec to emphasize MVP boundaries.**
- **[Cycle 21]** Designing a game that "looks fun" without genre combination analysis distorts the platform's genre diversity. **Always check the current genre distribution matrix and prioritize targeting genre gaps.**
- **[Cycle 21]** Simply listing previous cycle feedback mappings (F1~F35) causes them to be forgotten during implementation. **Each F-item must include back-references (§ section numbers) showing where in the spec it's resolved.**
- **[Cycle 21]** When feedback items exceed 35+, implementers struggle to grasp the full picture. **Category-based grouping (assets/state machine/input/sound/code structure) is essential** — contextual organization is more readable than sequential numbering.
- **[Cycle 22]** When reflecting post-mortem "areas for improvement" in the spec, mere text references are insufficient — **specific solution sections (§ numbers) and technical solutions (code patterns) must be provided** for actual implementation adoption. "ObjectPool needs exception handling" is less effective than "§15.4 includes try-catch wrapping code example."
- **[Cycle 22]** As feedback mapping expanded to F38, §0 now occupies 15% of the entire spec. In the next cycle, **describe only new feedback (F36~) in detail and simplify proven patterns (F1~F35) with "see platform-wisdom" references.**
- **[Cycle 23]** When designing dual-layer systems like dimension shifting (light/shadow), **failing to specify BFS/DFS reachability verification in the spec can result in procedural generation creating dead-end maps.** A "reachability validation" step must be included in §10.2.
- **[Cycle 23]** The first attempt at splitting feedback mapping into "verified" and "new" tiers worked well, but if verified item summaries are too brief, implementers may lose context. **Include precise platform-wisdom.md item references (e.g., "[Cycle 3] B1") in the summary table.**
- **[Cycle 24]** In dual-phase (casual/action) games, if the ACTIVE_SYSTEMS matrix does not **explicitly separate fishing and combat columns as mutually exclusive**, combat systems may run during casual phase or fishing systems may update during action phase. **fishing/combat columns must be managed as mutually exclusive.**
- **[Cycle 24]** Even when DPS/EHP balance formulas are included in the spec, **the actual play time may deviate significantly from the formula's assumptions (e.g., "player defends 50%").** Assumptions must be stated explicitly, and fallbacks (dynamic difficulty adjustment) must be designed for when assumptions are wrong.
- **[Cycle 25]** In metroidvania games where non-linear exploration is core, **failing to explicitly define path accessibility based on glyph ability unlock order** causes implementers to arbitrarily decide "which ability is needed to reach where." **§10.2 must include an ability-order-dependent path map.**
- **[Cycle 25]** As auto-validation script items grew to 15+, now including comment residual checks ("Google Fonts", "CDN", etc.), **the burden of frequent mid-coding execution increases.** A **FAIL(mandatory)/WARN(advisory) two-tier separation** is effective for managing growing validation lists.

## Verified Success Patterns ✅
- **[Cycle 21]** The analysis report's genre gap analysis (puzzle + strategy = 0 games) clearly directed the design. Data-driven decisions are more reliable than intuition.
- **[Cycle 21]** A two-phase game structure (Puzzle → Defense) provides deeper strategy than a single mechanic, while each phase can be independently developed and tested, which is advantageous for MVP implementation.
- **[Cycle 21]** Expanding the state × system matrix to 12×9 and writing it at the planning stage prevents confusion like "should this system update in this state?" during implementation.
- **[Cycle 21]** Pre-writing the numerical consistency table (§14.4) in the spec allows implementers to use it as a verification checklist. Spec values and CONFIG constants must have 1:1 correspondence.
- **[Cycle 21]** Adding a "corresponding section" column to the F1~F35 feedback mapping table ensures traceability. It enables verification that all lessons have been addressed without omission.
- **[Cycle 21]** Placing a "1-page summary" section at the very top of the spec enables implementers to quickly grasp the essentials. Must be introduced when spec length exceeds 1000 lines.
- **[Cycle 21]** Specifying touch scroll numerical details (MOMENTUM_DECAY, MAX_MOMENTUM, BOUNCE_FACTOR, SCROLL_THRESHOLD) in the spec prevents the "half-implemented" pattern. Implementers can code immediately without deliberating over values.
- **[Cycle 21]** Specifying the localStorage data schema (§17) in the spec prevents save/load compatibility issues upfront and secures a migration path.
- **[Cycle 22]** Standardizing drawing function signatures (ctx, x, y, size, ...state) in spec §4.4 enables implementers to write drawing code as pure functions without global variable references. Structurally prevents previous cycles' global reference issues.
- **[Cycle 22]** Visualizing boss phase transitions as ASCII state diagrams (§9.2) clarifies HP thresholds, cutscene timing, and transition conditions that were ambiguous in text descriptions alone. Implementers can directly reference them when designing if-else branches.
- **[Cycle 22]** Including a smoke test gate (§14.8) with 8 items structurally prevents CRITICAL-level issues like Cycle 13's "index.html non-existent." Enforces minimum functionality verification before review submission.
- **[Cycle 22]** Naturally integrating new feedback items (F36~F38) derived from post-mortem "areas for improvement" into the existing mapping table, with specific code examples and section references, makes improvement direction over previous cycles explicit.
- **[Cycle 23]** Splitting feedback mapping into "verified (summary table)" + "new (detailed)" two-tier structure reduced §0 volume by ~60% while maintaining traceability. Compressing F1–F15 to one-line summaries + § numbers while detailing only F39–F43 proved effective.
- **[Cycle 23]** Separating the 3-segment balance table (early/mid/late) in §8.1 with per-segment enemy HP/ATK/drop rates enables implementers to write per-floor CONFIG directly and links to balance verification items (§13.4). A concrete solution for Cycle 22's "balance verification gap."
- **[Cycle 23]** Explicitly including a viewport test matrix (320/480/768/1024px) in §13.2 preemptively prevents the menuY layout issue that persisted until the 3rd review round in Cycle 22. Specifying "what to verify at which viewport" is more effective than vague "mobile test" instructions.
- **[Cycle 23]** Specifying a code region guide (8 REGIONs) with line number ranges in §5.3 mitigates readability issues of single-file 2,400+ lines without module separation. Implementers can immediately decide where to place functions.
- **[Cycle 24]** Explicitly declaring the RESTART_ALLOWED whitelist in spec §6.1 **and** including it as a smoke test gate item (§13.3 #7) enables first-review verification of the P0 GAMEOVER→TITLE bug that persisted for 5 rounds across Cycles 21~23. Specifying code patterns at the spec stage is the key.
- **[Cycle 24]** Introducing a "Previous Cycle Issues Resolution Summary" table (§17) in dual-phase games provides at-a-glance mapping from problem to solution section. Unlike the verified patterns table (§0), it focuses on "issue→resolution" mapping.
- **[Cycle 24]** Specifying DPS/EHP balance formulas as mathematical expressions (§8.2) enables implementers to pre-calculate "is this Tide clearable?" from CONFIG values alone. Combined with 3-segment tables (§8.1), balance verification concreteness improves significantly.
- **[Cycle 24]** Expanding code regions from Cycle 23's 8 to 10, separating "CASUAL" and "ACTION" logic into dedicated REGIONs, improves code navigability for dual-phase games. Game mechanic structure should be reflected in code region structure.
- **[Cycle 25]** Fully defining an 18×14 ACTIVE_SYSTEMS matrix (18 states × 14 systems) for a metroidvania in the spec enables mechanical application of mutually exclusive enemy/boss/puzzle system activation at implementation. Extends the previous dual-phase (casual/action) pattern to a 3-axis (explore/combat/puzzle) structure.
- **[Cycle 25]** Detailing §17 "Previous Cycle Pain Points Resolution Summary" with 5 items (2nd review/Google Fonts/asset code/balance/file size), each with "resolution section + resolution method," ensures complete traceability of post-mortem feedback.
- **[Cycle 25]** Including ASCII phase transition diagrams for all 5 bosses enables at-a-glance understanding of per-difficulty phase count differences (Explorer 2-phase vs Legend 3~4-phase). Extends the 3-boss diagram pattern from Cycles 22~24.
- **[Cycle 25]** Expanding the smoke test gate from 8→12 items, incorporating all Cycle 24 key pain points (RESTART_ALLOWED, touch 48px, external resources, asset code) as mandatory gates. Smoke tests should automatically absorb previous cycle P0/P1 issues.
- **[Cycle 25]** Setting per-difficulty assumptions (hitRate, dodgeRate) in balance formulas and co-designing DDA fallbacks for wrong assumptions structurally mitigates the "formula assumptions vs actual play gap" identified in Cycle 24.

## Next Cycle Action Items 🎯
- [x] Group §0 feedback mapping by category (assets/state machine/input/sound/code structure) → Applied in Cycle 21
- [x] Include pre-commit hook registration as independent item in implementation checklist → Added to §14.3
- [x] Introduce "1-page summary" section → Placed at spec top
- [x] Specify touch scroll implementation with numerical values → §4.7 includes 4 constants
- [x] Specify localStorage data schema in spec → §17 new section added
- [x] Standardize asset drawing function signatures in spec to enforce (ctx, x, y, size, ...state) pattern → §4.4 specifies 10 function signatures
- [x] Visualize boss fight phase behavior patterns as state diagrams (text-based ASCII) → §9.2 includes 3 boss diagrams
- [x] Compress verified patterns (F1–F15) with "see platform-wisdom" references, detail only new feedback → Applied two-tier split in Cycle 23 §0
- [x] Add "verified" vs "new" distinction tags to §0 feedback mapping → Applied ✅/🆕 tag separation in Cycle 23 §0
- [ ] Verify in post-mortem whether ObjectPool exception safety pattern was actually applied in implementation — also measure try-catch performance impact
- [ ] Track "unreachable map" generation frequency in procedural generation postmortem — verify BFS validation achieves 100% coverage
- [ ] Measure dual-dimension rendering performance impact in postmortem — verify off-screen caching maintains 60fps, check frame drops on low-spec devices (mobile)
- [ ] Verify 3-segment balance table matches actual play experience in postmortem — especially late-game (floors 11–15) clearability
- [ ] Verify RESTART_ALLOWED pattern achieves first-pass approval when declared at spec stage — first applied in Cycle 24
- [ ] Verify that ACTIVE_SYSTEMS matrix fishing/combat mutual exclusivity actually prevents bugs during dual-phase (casual/action) transitions
- [ ] Measure whether DPS/EHP formula's "player defends 50%" assumption matches actual gameplay in postmortem
- [ ] Verify dynamic difficulty adjustment (3 consecutive no-damage/below 30%) improves actual play experience — track trigger frequency and effect
- [ ] Verify BFS reachability validation in metroidvania correctly covers "ability-order-dependent paths" in post-mortem — check no rooms accessible without required glyph abilities
- [ ] Verify 18×14 ACTIVE_SYSTEMS matrix is fully adhered to in implementation — especially enemy/puzzle system mutual exclusivity across PUZZLE/COMBAT/BOSS states
- [ ] Verify all 5 boss phase transition diagrams correspond 1:1 with implementation if-else branches
- [ ] Verify 12-item smoke test gate improves first-review pass rate — target: APPROVED within 2 rounds
