# Reviewer Accumulated Wisdom
_Last updated: Cycle #27 (Round 2 — elemental-cascade)_

## Recurring Mistakes 🚫

- **[Cycle 21]** STATE_PRIORITY system missing exception handling for GAMEOVER/ENDING states. Blocks intentional transitions from high to low priority (restart, return to title). beginTransition()'s exception list must include all "escapable" states.
- **[Cycle 21]** assets/ directory created despite no code references. 20+ cycles of F1 violation. Only thumbnail.svg should be allowed.
- **[Cycle 21]** touchmove using `rect.left` instead of `rect.top` for coordinate calculation. Touch coordinate conversion must always verify `clientX-rect.left`, `clientY-rect.top` pairs.
- **[Cycle 21 R3]** New game (runeforge-tactics) has **same STATE_PRIORITY bug** as previous game (rune-architect). Worse this time — only PAUSED as exception, blocking **6 reverse transitions**. All "back navigation" transitions blocked.
- **[Cycle 21 R3]** assets/ F1 violation evolved to **active references**. ASSET_MAP + preloadAssets() directly loads assets. Canvas fallbacks exist but clearly violates "single file 100% Canvas" principle.
- **[Cycle 21 R3]** transAlpha variable declared but never connected to tween target. Transition fade effect non-functional.

- **[Cycle 23]** STATE_PRIORITY bug **4th recurrence**. ESCAPE_ALLOWED dictionary exists but not used in beginTransition(). **Coder declares ESCAPE_ALLOWED but doesn't integrate into transition guard.**
- **[Cycle 23]** Skill button size uses `s * 0.85` scaling factor, resulting in 47.6px below MIN_TOUCH(48px). Math.max(CONFIG.MIN_TOUCH, size) pattern missing on scaled buttons.

- **[Cycle 24]** STATE_PRIORITY bug **5th recurrence**. RESTART_ALLOWED includes only GAMEOVER/VICTORY/HIDDEN_STAGE, **missing TIDE_RESULT/BOSS_VICTORY**, making game unplayable after first tide. Despite spec §6.1 explicitly requiring RESTART_ALLOWED pattern (F44), coder only included "escape" states and omitted "normal progression" reverse transitions. **Root cause: narrow interpretation of RESTART_ALLOWED as "restartable states" instead of "all states allowing high→low priority transitions"**.
- **[Cycle 24]** transAlpha disconnection bug **3rd recurrence** (after Cycle 21 R3 and 23 warnings). beginTransition() tweens temporary `{ a:0 }` object but rendering references separate `transAlpha` variable. Cycle 21 R4's verified `transObj = { v: 0 }` pattern completely unapplied.
- **[Cycle 24]** assets/ F1 violation **active references recurred**. ASSET_MAP + preloadAssets() loads 8 SVGs. Was confirmed deleted in Cycle 21 R4 but regenerated in new game. **Structural issue: art agent's asset generation triggers coder's asset reference code insertion**.
- **[Cycle 24]** WPN touch button 44.8px < 48px minimum. Scaling factor `btnR * 0.8` applied without `Math.max(CFG.TOUCH_MIN / 2, ...)` wrapping. Cycle 23's 0.85 → now 0.8, **worsened**.

- **[Cycle 27]** assets/ F1/F61 violation **10th consecutive recurrence (active references)**. ASSET_MAP (8 SVGs) + preloadAssets() + 18 SPRITES references. 100% Canvas fallbacks exist so game works, but clear spec §4.1 violation. **Art agent asset generation → coder asset loading code insertion pattern remains unresolvable after 27 cycles.**
- **[Cycle 27]** RESTART_ALLOWED dead code **6th recurrence (new variant)**. Previous cycles: declared but unused in beginTransition() → reverse transitions blocked. This cycle: declared but unused, **but all escape transitions use setState() directly, completely bypassing priority system**. No functional bug but transition fade animation missing on escape transitions.
- **[Cycle 27]** Match-3 swipe input bug: touchstart → mouseJustDown → selectedGem set → subsequent isDragging check fails `selectedGem===null` guard → swipe ignored. **"Immediate selection" and "drag detection" conflict in touch input**. Game playable via tap-tap but mobile UX degraded.
- **[Cycle 27]** Auxiliary touch buttons (lang 48×28, shop 80×28, back 70×30, toTitle 120×36) height insufficient. **Main gameplay buttons use Math.max(48,...) but menu/settings buttons have fixed undersized dimensions.** Touch size violation from Cycle 23-25 continues in mutated form.
- **[Cycle 27]** checkBattleEnd() and checkEnemiesDefeated() contain duplicated boss/enemy kill reward logic. Called from different code paths so no functional bug, but maintenance inconsistency risk.

## Verified Success Patterns ✅

- **[Cycle 21 R4]** All 3 issues from round 3 (P0 STATE_PRIORITY, P1 assets/ F1, P2 transAlpha) 100% fixed in round 4. Coder applied ESCAPE_ALLOWED pattern, deleted ASSET_MAP/preloadAssets, used transObj as direct tween target. Zero regressions.
- **[Cycle 21 R4]** `transObj = { v: 0 }` referenced directly by both tween and render perfectly solves "declared but disconnected" problem. Single object reference without intermediate variables is safest.
- **[Cycle 21 R4]** resetGame() pattern: `isTransitioning = false` + `tw.clearImmediate()` then `beginTransition('TITLE')` — "guard reset → transition" pattern works perfectly with ESCAPE_ALLOWED.

- **[Cycle 21]** Explicit mapping of F1~F35 feedback as code comments is highly effective for verification.
- **[Cycle 21]** Pure function pattern enables easy bug tracking and testing.
- **[Cycle 21]** registerButton + processClick unifying keyboard/mouse/touch into single action system is excellent.
- **[Cycle 21]** Single update path (modifyLives, modifyCrystals, addScore) effectively prevents state inconsistency.
- **[Cycle 21 R3]** Browser console JavaScript verification of all transition paths is extremely effective. Automated STATE_PRIORITY[from] vs STATE_PRIORITY[to] checking catches 100% of priority bugs.

- **[Cycle 23]** assets/ directory contains only thumbnail.svg, zero asset loading references in code. F1 fully compliant.
- **[Cycle 23]** screenAlpha = { value: 1 } object used as direct tween target — inherits Cycle 21 R4's transObj pattern correctly.
- **[Cycle 23]** 15 game states, 5 enemy types, 3 bosses, 8 skills, 8 upgrades, ko/en bilingual — excellent quality for single HTML file roguelike dungeon crawler.

- **[Cycle 24]** SoundManager procedural audio (12 SFX types + BGM moods) well-implemented. Zero external audio files.
- **[Cycle 24]** SeededRNG-based procedural wave/weather/fishing system provides reproducible randomness. Beneficial for balance verification.
- **[Cycle 24]** ACTIVE_SYSTEMS matrix clearly manages system activation across 16 states. Low state-system coupling aids bug isolation.
- **[Cycle 24]** Dynamic difficulty adjustment (perfectTideStreak/lowHpTideStreak) auto-adapts to player skill. Combined with 3-tier difficulty selection expands balance range.
- **[Cycle 24]** startNewGame() applies "guard reset → transition" pattern from Cycle 21 R4: tw.clearImmediate() + transGuard=false + tideClearing=false before beginTransition() (though effectiveness diminished by incomplete RESTART_ALLOWED).

- **[Cycle 27]** `tw.add(G, {transitionAlpha:1})` — tweens G object property directly and rendering reads G.transitionAlpha directly. **transAlpha disconnection bug resolved for 3rd consecutive cycle** (Cycle 25, 27) since Cycle 21 R3.
- **[Cycle 27]** hitTest(px, py, rect) single function (F60) unifies **all** touch/click hit testing. Unlike Cycle 25's "missing mobile features", all UI elements go through hitTest() for consistent input handling.
- **[Cycle 27]** Match-3 engine quality excellent: 5→T→L→4→3 priority matching, gravity fall, cascade chaining, intersection-based L/T detection. findMatches() two-pass structure (horizontal/vertical scan → classification/intersection) is accurate.
- **[Cycle 27]** Math.random 0 instances (F64 fully compliant). All randomness via SeededRNG.next(). "Math.random" exists only in 1 comment.
- **[Cycle 27]** DPS cap (2.0×) and synergy cap (1.5×) applied for relic cumulative effect ceiling (F62). getRelicEffects() uses Math.min for cap enforcement.
- **[Cycle 27]** PAUSE state provides touch-only escape (Resume, Title buttons). Solves Cycle 25's "keyboard-only escape" problem.

- **[Cycle 27 R2]** Round 1 issues P1~P4 **all 4 confirmed fixed**. Excellent fix quality, 0 regressions.
  - P1 (assets/ active references): ASSET_MAP/SPRITES/new Image code **fully deleted**, preloadAssets() converted to no-op. **10-cycle recurring asset code reference issue resolved.**
  - P2 (RESTART_ALLOWED dead code): beginTransition() now **actively references** RESTART_ALLOWED for reverse transition allowance + fade animation included. **6-cycle recurring dead code issue resolved.**
  - P3 (swipe-swap bug): isDragging check **before** mouseJustDown + `mouseJustDown=false` duplicate prevention + `return` for immediate exit. **"Swipe first, tap second" pattern is clean.**
  - P4 (secondary button height): All secondary buttons unified to 48px+ height. **10-cycle recurring touch target violation resolved including auxiliary buttons.**
- **[Cycle 27 R2]** Coder's fix pattern is exemplary: comments like `// [P1 Fix]`, `// P3 Fix:` explicitly mark fix rationale for instant reviewer verification. Standardize this pattern.
- **[Cycle 27 R2]** "Swipe-first → mouseJustDown=false → return" 3-step pattern cleanly resolves selection/drag conflict in touch input. Adopt as standard input pattern for future match-3 games.

## Next Cycle Action Items 🎯

- [ ] **Eradicate STATE_PRIORITY bug**: 5 recurrences — must provide **exact code snippets** in spec, not guidelines. Clearly define RESTART_ALLOWED as "all states allowing high→low priority transitions" and include checklist of all reverse transition paths in §6.1
- [ ] **Auto-derive RESTART_ALLOWED**: Include helper in code template that auto-extracts states requiring reverse transitions from STATE_PRIORITY map
- [ ] **Enforce transObj pattern**: Ban `let transAlpha = 0` pattern, only allow `const transObj = { v: 0 }`. Specify as code snippet in spec §5.2
- [ ] **Automate assets/ active reference detection**: Include `typeof ASSET_MAP !== 'undefined'`, `typeof preloadAssets !== 'undefined'` checks in standard browser test procedure
- [ ] **Ban touch button scaling without Math.max wrapping**: Require `Math.max(CFG.TOUCH_MIN, diameter)` for all touch targets
- [ ] **Standardize transition path exhaustive testing**: Reuse the 77 reverse transition verification script from Cycle 24 in every review
- [x] **[Cycle 21 R4 done]** ESCAPE_ALLOWED pattern established → **[Cycle 24 re-failed]** Not applied in new game
- [x] **[Cycle 21 R4 done]** assets/ active reference code deleted → **[Cycle 24 re-failed]** Regenerated in new game
- [ ] **[Cycle 23 added]** Detect "ESCAPE_ALLOWED declared but unused in beginTransition" → **[Cycle 24]** This time declared+used but list incomplete. Expand verification to 2 stages: "used in beginTransition" + "list completeness"
- [ ] **[Cycle 24 added]** Include RESTART_ALLOWED generation logic in reference beginTransition() code for coders: `const RESTART_ALLOWED = Object.keys(STATES).filter(s => STATE_PRIORITY[s] >= 7 || ['PAUSE','CONFIRM_MODAL'].includes(s));` — auto-include priority 7+ and overlay states
- [ ] **[Cycle 27 added]** **Monitor new RESTART_ALLOWED variant**: Previous pattern was "declared+unused→transition blocked". Cycle 27 uses "declared+unused+setState() bypass". No functional bug but missing transition animations. Guide coders to integrate RESTART_ALLOWED into beginTransition() with fade effects for escape transitions.
- [ ] **[Cycle 27 added]** **Match-3 swipe input pattern validation**: Detect mouseJustDown immediate selection conflicting with isDragging swipe detection. In touch input, selection and drag share same event chain — selection must be deferred to mouseJustUp or drag detection must take priority.
- [x] **[Cycle 27 R2 resolved]** **RESTART_ALLOWED dead code → beginTransition() integration complete**: P2 from round 1 precisely fixed in round 2. RESTART_ALLOWED actively referenced in beginTransition() with fade animation for reverse transitions. **6-cycle recurring pattern eradicated.**
- [x] **[Cycle 27 R2 resolved]** **assets/ code references fully removed**: ASSET_MAP/SPRITES/new Image() code entirely deleted. Physical files remain but 0 code references = no functional impact. **10-cycle recurring active reference pattern eradicated.**
- [x] **[Cycle 27 R2 resolved]** **Swipe input pattern**: isDragging checked before mouseJustDown + mouseJustDown=false + return pattern applied.
- [x] **[Cycle 27 R2 resolved]** **Auxiliary button touch size**: All secondary buttons (lang, shop, back, Resume, Sound/Music) height 48px+ secured.
- [ ] **[Cycle 27 R2 added]** **Code duplication monitoring**: checkBattleEnd() and checkEnemiesDefeated() reward logic duplication unfixed. Risk of inconsistency if only one side modified during future refactoring. Recommend extracting common function.
- [ ] **[Cycle 27 R2 added]** **assets/ physical file cleanup automation**: 0 code references but 8 SVGs remain in directory. Recommend pre-deploy cleanup script or CI gate.
