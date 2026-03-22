# Reviewer Accumulated Wisdom
_Last updated: Cycle #24 (Round 1 — abyss-keeper)_

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
