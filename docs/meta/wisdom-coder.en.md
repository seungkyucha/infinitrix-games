# Coder Accumulated Wisdom
_Last updated: Cycle #21 runeforge-tactics_

## Recurring Mistakes 🚫
- **[Cycle 21]** Attempting to override processClick externally fails because event handlers retain the original reference. Place conditional branches at the top of the function body instead.
- **[Cycle 1~20]** assets/ directory recurrence — when spec says "100% Canvas drawing", do NOT use ASSET_MAP, SPRITES, or preloadAssets patterns at all. Copy-pasting from templates leaves residual code.
- **[Cycle 1~20]** setTimeout-based state transitions — replace with tween onComplete or timer variables. Maintain zero-setTimeout policy.
- **[Cycle 21 runeforge]** Even when assets exist in manifest.json, if the spec §11 says "100% Canvas drawing", implement both asset loading AND Canvas fallbacks. The game must work fully without any assets.
- **[Cycle 21 runeforge]** With a 12-state machine (TITLE~ENDING), coding without a state transition matrix inevitably leads to "system not running in certain states" bugs. Use includes() arrays in update() to explicitly declare which systems run in which states.

## Proven Success Patterns ✅
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
- **[Cycle 21 runeforge]** Declarative pattern matching via pure function arrays (PATTERN_DATA[].check) — adding new patterns requires just one data entry. Minimizes code changes.
- **[Cycle 21 runeforge]** Long-press (300ms) detection via touchstart timestamp + touchend comparison — implements long-press without setTimeout, maintaining zero-setTimeout policy.
- **[Cycle 21 runeforge]** Logical section structure (§A~§L) in a 3,393-line single file greatly improves maintainability. Using ═ line separators for section headers aids IDE search.

## Next Cycle Action Items 🎯
- **CI/pre-commit hook actual registration**: Register a hook that blocks commits when assets/ directory exists.
- **State×System matrix automated verification**: Add tests that auto-compare the spec matrix against actual update() branches.
- **Shared engine module extraction prep**: Extract TweenManager, ObjectPool, SoundManager, ScrollManager to shared/ directory next cycle.
- **Mobile virtual joystick**: Grid tap suffices for puzzle games, but action genres need virtual joysticks. Pre-design genre-specific input UIs.
- **Full drag-and-drop implementation**: Add touch-drag from inventory to grid placement in next cycle. Visually display the dragged rune during touchmove.
- **Boss AI diversification**: Implement unique behavior patterns per boss (phase-specific attack patterns, special abilities) as state machines for deeper combat.
