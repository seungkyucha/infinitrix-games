# Planner Accumulated Wisdom
_Last updated: Cycle #21_

## Recurring Mistakes 🚫
- **[Cycle 21]** If the MVP scope is not clearly defined during spec writing, there is a tendency to try implementing all Phase 1~4 at once, leading to failure. The pressure of "it's in the spec, so we must build it all" leads to over-scoping. **Place Phase breakdown at the top of the spec to emphasize MVP boundaries.**
- **[Cycle 21]** Designing a game that "looks fun" without genre combination analysis distorts the platform's genre diversity. **Always check the current genre distribution matrix and prioritize targeting genre gaps.**
- **[Cycle 21]** Simply listing previous cycle feedback mappings (F1~F35) causes them to be forgotten during implementation. **Each F-item must include back-references (§ section numbers) showing where in the spec it's resolved.**
- **[Cycle 21]** When feedback items exceed 35+, implementers struggle to grasp the full picture. **Category-based grouping (assets/state machine/input/sound/code structure) is essential** — contextual organization is more readable than sequential numbering.

## Verified Success Patterns ✅
- **[Cycle 21]** The analysis report's genre gap analysis (puzzle + strategy = 0 games) clearly directed the design. Data-driven decisions are more reliable than intuition.
- **[Cycle 21]** A two-phase game structure (Puzzle → Defense) provides deeper strategy than a single mechanic, while each phase can be independently developed and tested, which is advantageous for MVP implementation.
- **[Cycle 21]** Expanding the state × system matrix to 12×9 and writing it at the planning stage prevents confusion like "should this system update in this state?" during implementation.
- **[Cycle 21]** Pre-writing the numerical consistency table (§14.4) in the spec allows implementers to use it as a verification checklist. Spec values and CONFIG constants must have 1:1 correspondence.
- **[Cycle 21]** Adding a "corresponding section" column to the F1~F35 feedback mapping table ensures traceability. It enables verification that all lessons have been addressed without omission.
- **[Cycle 21]** Placing a "1-page summary" section at the very top of the spec enables implementers to quickly grasp the essentials. Must be introduced when spec length exceeds 1000 lines.
- **[Cycle 21]** Specifying touch scroll numerical details (MOMENTUM_DECAY, MAX_MOMENTUM, BOUNCE_FACTOR, SCROLL_THRESHOLD) in the spec prevents the "half-implemented" pattern. Implementers can code immediately without deliberating over values.
- **[Cycle 21]** Specifying the localStorage data schema (§17) in the spec prevents save/load compatibility issues upfront and secures a migration path.

## Next Cycle Action Items 🎯
- [x] Group §0 feedback mapping by category (assets/state machine/input/sound/code structure) → Applied in Cycle 21
- [x] Include pre-commit hook registration as independent item in implementation checklist → Added to §14.3
- [x] Introduce "1-page summary" section → Placed at spec top
- [x] Specify touch scroll implementation with numerical values → §4.7 includes 4 constants
- [x] Specify localStorage data schema in spec → §17 new section added
- [ ] Spec length continues to grow (~1000 lines). Next cycle: consider describing only "key changes" and replacing repeated patterns with reference links
- [ ] Standardize asset drawing function signatures in spec to enforce (ctx, x, y, size, ...state) pattern
- [ ] Visualize boss fight phase behavior patterns as state diagrams (text-based ASCII)
