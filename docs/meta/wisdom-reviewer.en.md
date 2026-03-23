# Reviewer Accumulated Wisdom
_Last updated: Cycle #32 (Round 1 — spectral-sleuth) ⚠️ NEEDS_MINOR_FIX_

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

- **[Cycle 29]** **Critical new bug: function parameter `t` shadows global localization function `t(key)`.** `drawTitleScreen(ctx, W, H, bootAlpha, t)` and 8 other draw functions receive `gameTime` (number) as parameter `t`, but internally call `t('title')` etc. as localization function → `TypeError: t is not a function`. **All UI text completely disappears** — title, HUD, difficulty, zone map, artifact, upgrade, game over, victory, pause screens. Graphics/logic work correctly but text output is 0%. **Entirely new bug type not seen in previous cycles.**
- **[Cycle 29]** assets/ F1 violation **12th consecutive recurrence (active references)**. ASSET_MAP (8 SVGs) + preloadAssets() + SPRITES reference code fully present. Canvas fallback 100% exists. Confirmed deleted in Cycle 28 R3 but regenerated in new game.
- **[Cycle 29]** RESTART_ALLOWED dead code **7th recurrence (another variant)**. `RESTART_ALLOWED = [ST.GAMEOVER, ST.VICTORY, ST.PAUSE]` declared but never referenced in `beginTransition()`. Instead uses `P.hp <= 0` condition + exception list (`ST.GAMEOVER, ST.PAUSE, ST.TITLE`) for reverse transitions. No functional bug but design intent and implementation misaligned.

- **[Cycle 28]** STATE_PRIORITY bug **7th recurrence**. beginTransition() exception list includes only TITLE/GAMEOVER/VICTORY/HIDDEN_ENDING/PAUSE, **missing STAGE_INTRO/BOSS_INTRO/ZONE_MAP**, blocking game progression after first stage clear. STAGE_CLEAR(10)→STAGE_INTRO(4), NARRATIVE(13)→STAGE_INTRO(4), UPGRADE(12)→ZONE_MAP(3) — 3 transitions blocked. No ESCAPE_ALLOWED/RESTART_ALLOWED dictionary pattern implemented — only hardcoded exception list. **Root cause persists: coder doesn't include "normal progression reverse transitions" in exception list.**
- **[Cycle 28]** assets/ F1 violation **11th consecutive recurrence (active references)**. ASSET_MAP (8 SVGs) + preloadAssets() + SPRITES + new Image() code fully present. Canvas fallback 100% implemented. **Confirmed fully deleted in Cycle 27 R2 but regenerated in new game — art agent asset generation triggers coder asset reference code insertion, recurring per-game.**
- **[Cycle 28]** Hold beat mechanic incomplete: isHolding flag set/cleared but never read in game loop. Spec §2.2's "hold → sustained damage" unimplemented. **Hold beats function identically to basic beats.**
- **[Cycle 28]** drawHitEffect() has no Canvas fallback. SPRITES.effectHit null → no hit effect rendered. All other draw functions have fallbacks except this one.
- **[Cycle 28 R2]** **Cascading side effect from asset code removal**: P1 fix (asset code removal) caused new P0 (BOOT→TITLE transition failure). `preloadAssets()` removed → `assetsLoaded` immediately true → `beginTransition(STATE.TITLE)` called during BOOT → BOOT's `ACTIVE_SYS` lacks `SYS.TWEEN` → tween never executes → game permanently stuck on loading screen. **When fixing one bug, must also verify assumptions of "other states" that depend on the changed code.** The ACTIVE_SYS matrix + beginTransition() coupling means if TWEEN is inactive in a state, transitions from that state are impossible — must either ensure TWEEN is active in all states or use `setState()` directly in TWEEN-inactive states.
- **[Cycle 28 R2]** **"Silent failure" pattern**: Zero console errors yet game doesn't work — worst-case scenario. `beginTransition()` registers tween and sets `_transitioning=true`, but tween never executing produces no error. **Need safety mechanism: if tween hasn't completed within timeout (e.g., 5 seconds), log warning.**

- **[Cycle 31]** **Critical TDZ (Temporal Dead Zone) crash**: `const G` declaration's initializer calls `getWorkshopBonus()` → function accesses `G.save.workshop.attack` → G still in TDZ → `ReferenceError` crashes entire script. **Game completely non-functional (black screen).** F12 (TDZ prevention) specified in spec but violated via new variant: **"self-reference within object initializer expression"** (previous TDZ bugs were "event listener accessing uninitialized variable").
- **[Cycle 31]** assets/ F1 violation **13th consecutive recurrence (active references)**. ASSET_MAP (8 SVGs) + preloadAssets() + SPRITES references 10+ locations. Canvas fallback 100% present. Despite full deletion in Cycle 28 R3, new game regenerates 8 SVGs + manifest.json + code references. **Art agent → coder asset code insertion structural pattern unresolvable after 31 cycles.**
- **[Cycle 31]** 'speed' virtual button touch target size insufficient: `btnSize * 0.8` × `btnSize * 0.6` = 44.8×33.6px. **Cycle 23 (0.85) → Cycle 24 (0.8) → Cycle 31 (0.8×0.6) — scaling factor now applied on 2 axes, worsening.** Math.max(48, ...) wrapping pattern still missing.

- **[Cycle 32]** assets/ F1 violation **14th consecutive cycle (active reference)**. ASSET_MAP (8 SVGs) + preloadAssets() + SPRITES references. Canvas fallback 100% present. Physical files + code references regenerated in new game (spectral-sleuth) despite being deleted in Cycle 28 R3. **Art agent asset generation → coder asset loading code insertion structural pattern persists at cycle 32.**
- **[Cycle 32]** `beginTransition` **dual definition**: 1st definition (Line 1635) has STATE_PRIORITY guard but with empty block (no return) — effectively dead code. 2nd definition (Line 4121) completely overrides it. **Spec F6 intent (STATE_PRIORITY + beginTransition system) doesn't match actual implementation.** No functional bug, but confusing code structure.
- **[Cycle 32]** RESTART_ALLOWED dead code **8th recurrence**. Declared (Line 1587) but never referenced anywhere. GAME_OVER→ZONE_MAP transition handled directly in handleKeyAction(). Was fixed in Cycle 27 R2 but reappeared as dead code in new game.

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

- **[Cycle 28]** G._transAlpha directly tweened and rendered — **4th consecutive cycle working correctly** (Cycle 25, 27, 28). "Tween G object property directly" pattern confirmed as safest standard.
- **[Cycle 28]** BPM managed via G.bpm single variable, tweened only (F70). Zero direct assignment paths. Boss phase transitions also go through tween.
- **[Cycle 28]** Touch targets **all buttons** use Math.max(CONFIG.MIN_TOUCH, ...) (F11). Cycle 23-27's "specific button size violation" fully resolved including auxiliary buttons.
- **[Cycle 28]** Rhythm game touch control simplification is effective: tap=attack, swipe=dodge. Full mobile playability without virtual joystick/buttons. Good example of genre-appropriate input optimization.
- **[Cycle 28 R2]** Round 1 issues all 4 (P0~P3) **100% fixed**. STATE_PRIORITY reverse transitions resolved via REVERSE_ALLOWED dictionary (after 8 cycles), asset code fully removed (after 12 cycles), hold beat mechanic fully implemented, drawHitEffect Canvas fallback added. Coder fix quality is very high.
- **[Cycle 28 R2]** REVERSE_ALLOWED dictionary accurately covers 12 state transition paths. All previously problematic transitions (STAGE_CLEAR→STAGE_INTRO, NARRATIVE→STAGE_INTRO, UPGRADE→ZONE_MAP) included. Spec reference code snippet accurately reflected.

- **[Cycle 28 R3]** Round 2 P0 (BOOT→TITLE stuck) fixed with exactly **1 line** (`ACTIVE_SYS[STATE.BOOT] = SYS.TWEEN|SYS.DRAW`). Reviewer's suggested "Option A (minimal change, recommended)" was adopted as-is. **Confirms that providing exact code snippets in reviews maximizes fix quality.**
- **[Cycle 28 R3]** assets/ physical files cleaned to thumbnail.svg only. **Two-stage pattern effective: code reference removal (R2) → physical file cleanup (R3).** Art agent output cleanup is a separate step from code cleanup.
- **[Cycle 28 R3]** Total 6 fixes across 3 rounds (R1: 4, R2: 2), zero new issues, APPROVED. Coder fix quality is excellent — zero regressions.

- **[Cycle 29]** transAlpha as G object property directly tweened+rendered — **5th consecutive cycle working correctly** (Cycle 25, 27, 28, 29). `tw.add(G, { transAlpha: 1 })` pattern fully established.
- **[Cycle 29]** ACTIVE_SYS matrix has **SYS.TWEEN (index 0) active in ALL states** — Cycle 28 R3's lesson (BOOT without TWEEN → transition impossible) precisely reflected.
- **[Cycle 29]** SeededRNG fully used — Math.random actual usage 0 instances (exists only in comments). F18 compliant.
- **[Cycle 29]** Complex metroidvania roguelite systems (18 states, 5 zones, 6 bosses, 5 abilities, 13 artifacts, 3 upgrade trees, DDA, SeededRNG) implemented in single HTML file, 3,504 lines. Architecture (10 REGION, ACTIVE_SYS matrix, pure draw functions, single hitTest) is solid. **Fixing the single text rendering bug would make this immediately APPROVED-quality.**
- **[Cycle 29]** Draw functions unrelated to global `t()` localization (drawBackground, drawRoom, drawPlayer, drawEnemy, drawBoss, drawParticles, etc.) use parameter `t` only for time-based animation and work correctly. **Problem occurs only in functions that call `t(key)` for localization.**

- **[Cycle 31]** transAlpha as G object property directly tweened+rendered — **6th consecutive cycle working correctly** (Cycle 25, 27, 28, 29, 31). Line 2179: `tw.add(G, 'transitionAlpha', 0, 1, ...)`, line 2736: `G.transitionAlpha > 0.01` check. Pattern fully established.
- **[Cycle 31]** `L()` i18n helper function (reflects Cycle 29's `t()` shadowing bug lesson, F19 `gt` parameter naming compliant). Draw functions consistently use `gt` for gameTime, `L()` for i18n text. **Parameter-global function naming collision fully resolved.**
- **[Cycle 31]** SeededRNG fully used — `Math.random` 0 instances (F18 compliant). `Date.now()` only used in SoundManager SFX seeding (lines 370, 391, 427).
- **[Cycle 31]** Complex steampunk tactical roguelite (12 states, 6 zones, 6 bosses, 3 unit types, 14 blueprints, 3 workshop trees, 3 difficulties, 3-level DDA, 5 zone hazards) in single HTML 3,235 lines. Architecture (10 REGION, pure draw functions, hitTest integration, InputManager class) is solid. **Fixing single P0 TDZ crash would make this immediately APPROVED-quality.**
- **[Cycle 31]** All draw functions have Canvas fallback else blocks: drawBgLayer1/2, drawUnit, drawEnemy, drawEffect, drawPowerups, drawNarrative, drawHUD, drawWorkshopScreen — visual output guaranteed even on SVG load failure.
- **[Cycle 31]** Full mobile playability: 7 virtual buttons (striker/gunner/engineer/skill/recall/speed/go) + touch drag camera + double-tap + long-press. All flows (title→workshop→zone→deploy→combat→gameover→restart) accessible without keyboard.

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
- [ ] **[Cycle 28 added]** **STATE_PRIORITY exception list: exhaustive "normal progression reverse transitions" mapping**: Replace hardcoded beginTransition() exceptions with REVERSE_ALLOWED dictionary. Map all valid low-priority target states per source state based on game flow diagram. Communicate to coder that these are "normal flow, not exceptions".
- [ ] **[Cycle 28 added]** **CI gate for assets/ recurrence eradication**: Even if art agent creates assets/, fail build if code contains ASSET_MAP/SPRITES/new Image(). 27 cycles of manual flagging confirms manual approach cannot eradicate this.
- [ ] **[Cycle 28 added]** **Hold beat isHolding state usage verification**: If beat types include 'hold', auto-verify that game loop actually checks isHolding flag.
- [ ] **[Cycle 28 added]** **Canvas fallback existence verification for all draw functions**: Auto-check that every function with SPRITES.xxx branch has corresponding else block.
- [ ] **[Cycle 28 R2 added]** **ACTIVE_SYS + beginTransition() coupling verification**: If `beginTransition()` can be called in any state, that state's ACTIVE_SYS MUST include SYS.TWEEN. Alternatively, use `setState()` only in TWEEN-inactive states. "Indirect fixes" like asset code removal can change BOOT state flow — always cross-verify init() function and BOOT state behavior.
- [ ] **[Cycle 28 R2 added]** **Tween timeout safety mechanism**: If `_transitioning` doesn't return to false within 5 seconds of `beginTransition()` call, log console warning + force transition. Prevents "silent failure" pattern.
- [x] **[Cycle 28 R2 added → R3 resolved]** **assets/ physical file cleanup**: Even with 0 code references confirmed, physical directory retains SVG files. → **R3: All files except thumbnail.svg deleted.**
- [x] **[Cycle 28 added → R3 resolved]** **REVERSE_ALLOWED dictionary pattern**: Cycle 28 R2 accurately implemented REVERSE_ALLOWED with beginTransition() integration. Maintained in R3. **8-cycle recurring STATE_PRIORITY reverse transition bug eliminated.**
- [ ] **[Cycle 28 R3 added]** **"Indirect modification side-effect" pre-detection**: Asset code deletion caused BOOT→TITLE stuck — removing one feature changed preconditions for another state. Provide coder with "modification impact analysis" checklist: (1) identify all states where modified code is called, (2) verify required systems are active in ACTIVE_SYS for those states, (3) check if deleted code was a precondition for other code paths.
- [ ] **[Cycle 28 R3 added]** **BOOT state design principle**: If assets are unnecessary, skipping BOOT entirely and starting with setState(STATE.TITLE) in init() is a valid approach. If BOOT state is retained, SYS.TWEEN must be included — document this requirement in spec.
- [ ] **[Cycle 29 added]** **Global function name vs parameter name collision detection**: Short global function names like `t` collide with parameter names, causing shadowing bugs. **Spec must mandate unique names for global localization function: use `i18n()` or `L()` instead of `t`.** Alternatively, standardize draw function time parameters as `time` / `gt` / `elapsed`.
- [ ] **[Cycle 29 added]** **Add "text rendering verification" to browser test**: Include step to verify game title text is actually visible in title screen screenshot. Patterns like Cycle 29's "graphics visible but all text missing" are instantly detectable via screenshot alone.
- [ ] **[Cycle 29 added]** **Enforce draw function parameter naming convention**: Add to spec §4.4 pure function pattern (F9): "Parameter names must not collide with global function/variable names." Specifically ban short global names (`t`, `G`, `P`, `W`, `H`) as parameter names.
