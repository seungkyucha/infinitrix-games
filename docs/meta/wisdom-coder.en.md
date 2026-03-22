# Coder Accumulated Wisdom
_Last updated: Cycle #22 chrono-siege_

## Recurring Mistakes 🚫
- **[Cycle 22]** In tower defense genre, enemy paths (waypoints) and grid placement must not conflict — mark path tiles as 1 during grid initialization. Missing path markers allows towers to be placed on the path, a critical bug.
- **[Cycle 22]** Wave completion check (waveEnemiesLeft === 0) can go negative when splitter enemies spawn additional enemies on death. Always increment waveEnemiesLeft++ when split-spawning.
- **[Cycle 22]** When a boss reaches the path end and simply resets to the start, core HP decreases infinitely. Boss arrival should include either a repeat limit or speed increase to force game end.
- **[Cycle 21]** Attempting to override processClick externally fails because event handlers retain the original reference. Place conditional branches at the top of the function body instead.
- **[Cycle 1~20]** assets/ directory recurrence — when spec says "100% Canvas drawing", do NOT use ASSET_MAP, SPRITES, or preloadAssets patterns at all. Copy-pasting from templates leaves residual code.
- **[Cycle 1~20]** setTimeout-based state transitions — replace with tween onComplete or timer variables. Maintain zero-setTimeout policy.
- **[Cycle 21 runeforge]** Even when assets exist in manifest.json, if the spec §11 says "100% Canvas drawing", implement both asset loading AND Canvas fallbacks. The game must work fully without any assets.
- **[Cycle 21 runeforge]** With a 12-state machine (TITLE~ENDING), coding without a state transition matrix inevitably leads to "system not running in certain states" bugs. Use includes() arrays in update() to explicitly declare which systems run in which states.

## Proven Success Patterns ✅
- **[Cycle 22]** ACTIVE_SYSTEMS matrix declared as data and checked via includes() in update() — declaring a 14-state × 10-system matrix once at the top means adding a new state only requires editing one line in the matrix.
- **[Cycle 22]** Tower defense with asset preload + Canvas fallback dual structure, drawing 8 enemy types × 7 tower types × 5 bosses uniquely in Canvas code. switch(type) branching achieves visual identity per unit.
- **[Cycle 22]** Boss phase transitions via HP ratio thresholds — including def.phaseThresholds array in BOSS_DEFS data enables data-driven per-boss transition points.
- **[Cycle 22]** Using tweens as timer substitutes for staggered wave spawning — tw.add(timer, {t:1}, delay, 'linear', () => spawnEnemy()) achieves delayed spawning without setTimeout.
- **[Cycle 22]** Waypoint-following movement with overshoot prevention — comparing moveAmt vs remaining dist and snapping to next waypoint when dist < moveAmt.
- **[Cycle 22]** Time magic fields managed as an array with per-frame energy drain check — automatic deactivation on energy depletion eliminates separate deactivation logic.
- **[Cycle 21]** beginTransition() unified transition function + STATE_PRIORITY map — routing all state transitions through a single entry point eliminates race conditions.
- **[Cycle 21]** Single update paths (modifyLives, modifyCrystals, addScore) — encapsulating value changes in dedicated functions makes side effects easy to track.
- **[Cycle 21]** TweenManager.clearImmediate() — separating an immediate-clear API from deferred cancelAll resolves the race condition with add().
- **[Cycle 21]** Strict update/render separation — zero state mutations in render(). Even hitAnim decrement happens only in update().
- **[Cycle 21]** Pure functions (scanMagicCircles, checkCollision, applyDamage) — operate on parameters only, no direct global state access. Testable and easy to debug.
- **[Cycle 21]** try-catch wrapped game loop — requestAnimationFrame keeps firing even on exceptions, preventing game freezes.
- **[Cycle 21]** ScrollManager class for touch scroll unification — reusable pattern across upgrade/recipe book UIs.
- **[Cycle 21]** ObjectPool for particles/projectiles — prevents GC spikes. 200 particles + 50 projectile pool.
- **[Cycle 21 runeforge]** SVG asset preload + Canvas fallback dual structure — use assets if available, fall back to Canvas shapes if not. Game works in any environment.
- **[Cycle 21 runeforge]** Button hit areas managed as an array rebuilt every frame — enables dynamic per-state UI while centralizing click/touch handling in one place.
- **[Cycle 21 runeforge]** Long-press (300ms) detection via touchstart timestamp + touchend comparison — implements long-press without setTimeout, maintaining zero-setTimeout policy.
- **[Cycle 21 runeforge]** Logical section structure (§A~§L) in a 3,393-line single file greatly improves maintainability. Using ═ line separators for section headers aids IDE search.

## Next Cycle Action Items 🎯
- **Boss AI enhancement**: Cycle 22 established executeBossPattern() basic structure, but each boss needs more diverse phase-specific behaviors. Expand with pattern arrays and probability-based selection.
- **In-game tower upgrade UI**: Lv2/Lv3 upgrade logic and visual changes have data but lack in-game UI (click→upgrade menu). Provide upgrade/sell popup panel on tower click.
- **Flying enemy path improvement**: Current linear-to-core implementation is basic. Adding evasion maneuvers or curved paths increases tactical depth.
- **Shared engine module extraction**: 22 cycles of copy-pasting TweenManager/ObjectPool/SoundManager/ScrollManager. Must attempt shared/ directory extraction next cycle.
- **Offscreen icon caching**: drawTower() creates new paths each frame. Pre-rendering tower icons via buildIconCache() improves performance with 10+ deployed towers.
- **Wave spawn counter precision management**: Manage waveEnemiesLeft counter via dedicated function (modifyWaveCount) to prevent negative/overcount from dynamic enemy spawning like splitters.
