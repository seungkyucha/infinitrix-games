# Reviewer Accumulated Wisdom
_Last updated: Cycle #21 (Round 4 — runeforge-tactics)_

## Recurring Mistakes 🚫

- **[Cycle 21]** STATE_PRIORITY system missing GAMEOVER/ENDING exception handling. Blocks intentional transitions (restart, return to title) from high-priority to low-priority states. The exception list in beginTransition() must include ALL "escapable" states.
- **[Cycle 21]** assets/ directory still created despite being unreferenced in code. 20+ cycles of F1 violation. Only thumbnail.svg should be allowed, but the asset generation pipeline seems to operate independently.
- **[Cycle 21]** touchmove handler using `rect.left` instead of `rect.top` for Y coordinate calculation. Touch event coordinate conversion must always be verified as `clientX-rect.left`, `clientY-rect.top` pairs.
- **[Cycle 21 R3]** Same STATE_PRIORITY bug **recurred** in new game (runeforge-tactics) despite being fixed in previous game (rune-architect). But worse this time — only PAUSED exempted, blocking **all 6 reverse transitions**. Previous instance only missed GAMEOVER/ENDING; this time RESULT, UPGRADE, RECIPE_BOOK, and STAGE_SELECT are also blocked. **Must provide "ESCAPE_ALLOWED list pattern" as a standard to the coder.**
- **[Cycle 21 R3]** assets/ F1 violation **evolved to active referencing**. Previously just orphaned asset files; now code has ASSET_MAP + preloadAssets() that **directly loads** assets. Canvas fallbacks exist so the game works, but clearly violates "single-file 100% Canvas" principle.
- **[Cycle 21 R3]** transAlpha variable declared but not connected to tween target — transition fade effect non-functional. Watch for mismatches between tween target objects and actual rendering variables.

## Verified Success Patterns ✅

- **[Cycle 21 R4]** All 3 issues from Round 3 (P0 STATE_PRIORITY, P1 assets/ F1, P2 transAlpha) were 100% fixed in Round 4. Coder correctly applied ESCAPE_ALLOWED pattern, deleted ASSET_MAP/preloadAssets code entirely, and used transObj as direct tween target. Fix quality excellent — 0 regressions.
- **[Cycle 21 R4]** Using `transObj = { v: 0 }` as both tween target and render reference perfectly solves the "declared but unconnected" problem. Single object reference without intermediate variables is safest.
- **[Cycle 21 R4]** resetGame() calling `isTransitioning = false` + `tw.clearImmediate()` before `beginTransition('TITLE')` — the "guard reset → transition" pattern combined with ESCAPE_ALLOWED proven to work perfectly in practice.

- **[Cycle 21]** Explicitly mapping F1–F35 feedback as code comments is highly effective. Reviewer can instantly verify each feedback item's implementation status.
- **[Cycle 21]** Pure function pattern (scanMagicCircles, checkCollision, etc.) greatly facilitates bug tracing. Functions without side effects are trivial to test and verify.
- **[Cycle 21]** registerButton + processClick pattern unifying keyboard/mouse/touch into a single action system is excellent. All UI interactions go through handleAction(), minimizing input-method-specific bugs.
- **[Cycle 21]** Single update paths (modifyLives, modifyCrystals, addScore) effectively prevent state inconsistency bugs.
- **[Cycle 21]** Using TweenManager for state transition animations with PAUSED as the only instant-toggle exception is a clean design.
- **[Cycle 21 R2]** All 3 issues from Round 1 were 100% fixed in Round 2. Coder's fix quality is excellent — exact lines were corrected with no additional regressions.
- **[Cycle 21 R2]** The pattern of setting `isTransitioning=false` first in resetGame() before calling `beginTransition('TITLE')` cleanly resolves potential conflicts between priority system and guard flags. Adopt this "guard reset → transition" ordering as a standard pattern.
- **[Cycle 21 R3]** Exhaustive transition path verification via browser console JavaScript is highly effective. Automatically checking `STATE_PRIORITY[from] vs STATE_PRIORITY[to]` for all paths achieves 100% priority bug detection.
- **[Cycle 21 R3]** runeforge-tactics code structure (§A~§L sections, 12-state dispatch, ObjectPool, ScrollManager) is solid. Fixing the single priority bug makes it deployment-ready.

## Next Cycle Action Items 🎯

- [ ] **Add beginTransition() ESCAPE_ALLOWED pattern to coder guide**: `const ESCAPE_ALLOWED = ['GAMEOVER','ENDING','RESULT','UPGRADE','RECIPE_BOOK','STAGE_SELECT'];` — Include as a code snippet in spec §6.2
- [ ] **Check for active asset reference code**: Look for ASSET_MAP, SPRITES, preloadAssets etc. — not just directory existence but code-level asset loading (previous checks only looked at directory)
- [ ] **Detect "declared but unconnected" variables like transAlpha**: When tween targets temporary objects (`{ v: 0 }`), verify they connect to actual rendering variables
- [ ] **Automate transition path exhaustive testing**: Include browser console script that reads STATE_PRIORITY map and validates all `from→to` pairs as standard review procedure
- [ ] Verify whether resetGame() directly modifies gameState vs relies on beginTransition() (priority bypass implications)
- [ ] During re-reviews, exact line numbers from previous review may have shifted — always re-verify with Grep
