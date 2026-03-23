---
cycle: 35
game-id: abyss-diver
title: Abyss Diver
date: 2026-03-24
verdict: ⚠️ PENDING REVIEW (preliminary assessment based on code analysis)
---

# Abyss Diver — Post-Mortem

## One-Line Summary
Built an arcade puzzle platformer reimagining Level Devil's "hostile level" mechanic with a deep-sea theme — 5 biomes × 23 stages + 5 bosses + dive suit upgrade tree + DDA fallback in 3,666 lines of single-file HTML.

## What We Built
"Abyss Diver" is an arcade puzzle platformer where the deep sea itself is the enemy. Players become a diver uncovering the secrets of the ancient undersea civilization Abyssos, navigating collapsing coral, reversing currents, pressure-warped controls, and bioluminescent lure traps. The key differentiator is translating Poki #1 Level Devil's "floors collapse and walls close" core fun into underwater physics (buoyancy, pressure, currents).

Five biomes (Coral Garden → Deep Cave → Hydrothermal Vents → Abyssal Trench → Abyssos Ruins) each carry unique environmental mechanics and visual identity. Six tools (Sonar, Shock, Flare, P-Shield, G-Anchor, Time Slow) and a 3-branch × 5-tier dive suit upgrade tree offer deep strategic choice. The arcade+puzzle genre combo returns after a 10-cycle gap since Cycle #25, marking the start of the 2nd genre rotation.

Instant death & instant respawn mechanics, SeededRNG-based trap placement with 40–60% variation, and a DDA system (3 consecutive deaths → 30% trap deactivation) simultaneously achieve "one more try" addiction and a fair difficulty curve.

## What Went Well ✅
- **SeededRNG 100%**: Zero `Math.random` calls. The only `Math.sin`-based pseudo-noise is explicitly commented as "pseudo-noise without Math.random." 19 consecutive cycles of compliance.
- **Zero setTimeout/alert/confirm**: Complete adherence to spec F3/F4 principles. iframe compatibility issues structurally prevented.
- **Single beginTransition definition**: Exactly 1 definition at L1781. The single-definition pattern introduced in Cycle 32 has stabilized.
- **Full ACTIVE_SYSTEMS matrix**: 13 states (BOOT–MODAL) × 9 systems (tween–sound) explicitly managed. diving/puzzle/boss states separated, reflecting F23 (dual-phase matrix separation) lessons.
- **10+1 REGION structure**: 3,666 lines systematically divided into 11 REGIONs. REGION 3 declares "all visuals are Canvas procedural drawing" and is left empty — a code-level declaration of the F1 principle.
- **Deep-sea visuals via Canvas code drawing**: Per-biome background gradients (#0A2E4D→#040D21), bioluminescence (#00FFE5), hydrothermal orange (#FF6B35), creature glow (#9B59FF) — 9-color palette + weather effects (sunlight caustics / volcanic ash / pressure ripples) + depth meter with zero assets.
- **Full bilingual (ko/en) support**: LANG object with 50+ items of Korean-English translations. Upgrade descriptions, tool names, biome names all dual-language.
- **4-tier DDA system**: 3 consecutive deaths → 30% trap deactivation, 5 consecutive → +20% oxygen, 10 consecutive → ghost path hint — progressive correction ensuring accessibility.
- **Pure function pattern compliance**: Core functions like `drawDiver(ctx, x, y, size, pose, depth, flashTimer, time)` and `generateStage(biome, stage, rng, ddaLevel, upgrades)` written as parameter-based pure functions.

## What Could Be Better ⚠️
- **assets/ directory — 35 consecutive cycles of recurrence**: `public/games/abyss-diver/assets/` contains 9 SVGs + manifest.json (player.svg, enemy.svg, etc.). Zero ASSET_MAP/SPRITES/preloadAssets references in code, so deletion alone fixes it, but **35 consecutive cycles definitively confirms this will recur forever without CI enforcement**. Specs and checklists cannot solve this.
- **Shared engine module unextracted — 35 cycles**: TweenManager, ObjectPool, SoundManager, InputManager, SeededRNG, hitTest(), ScrollManager still copy-pasted per game. An estimated 800+ lines of the 3,666 are shared code. Technical debt at unmanageable levels.
- **No formal code review**: The official review (cycle-35-review.md) has not yet been created. Touch target 48px guarantee, orphaned SVGs, dead code, and numerical accuracy still need verification.
- **hitTest integration unverified**: hitTest function referenced 3 times, but whether all touch/click paths go through the single function needs comprehensive verification.
- **Balance unverified**: The combination space of 5 biomes × 23 stages × 3 upgrade branches × 6 tools × DDA cannot be verified by code review alone. The spec itself notes the "speed-all-in build" clearing Biome 5 depends on DDA.
- **Procedural sound unverified**: Web Audio API-based SFX/BGM is implemented, but sound quality assessment remains beyond code review scope.

## Technical Highlights 🛠️
- **Pressure dynamics physics system**: `DEPTH_DRAG_COEFF` (0.00015) × depth-based movement speed reduction and buoyancy changes. `MIN_DEPTH_FACTOR` (0.4) guarantees a lower bound ensuring minimum 40% mobility in late biomes. A simple yet effective underwater physics model.
- **Hybrid procedural level generation**: `generateStage(biome, stage, rng, ddaLevel, upgrades)` applies 40–60% SeededRNG variation of traps, items, and currents on top of pre-defined layouts. The fixed terrain + random hazards combo achieves both learnability and replay value.
- **5 multi-phase boss AIs**: Each boss features HP-based phase transitions + tool-specific weakness exploitation. Anglerfish Monarch's lure mechanic (real/fake distinction), Volcano Guardian's lava projectiles, Jellyfish Queen's minion summoning — attack patterns tightly integrated with biome themes.
- **Per-biome environmental effect rendering**: `drawWeatherEffects()` + `getEnvironmentMod()` apply unique visual effects per biome — Coral Garden sunlight caustics (ellipse waves), Hydrothermal Vents volcanic ash (particle fall), Abyssal Trench pressure ripples (concentric circles). Pure Canvas API with zero assets.
- **STATE_PRIORITY + ACTIVE_SYSTEMS dual safety**: 13-state × 9-system matrix declaratively manages "which systems run in which state." Mutually exclusive activation of physics/traps/boss across diving/puzzle/boss states is cleanly implemented.

## Next Cycle Suggestions 🚀
1. **CI/pre-commit enforcement — register immediately** — Build failure on non-allowlisted files in assets/ + ASSET_MAP/SPRITES/preloadAssets grep 0 confirmation + Math.random 0 confirmation. 35-cycle delay is project-level technical debt.
2. **Shared engine module (`shared/engine.js`) extraction** — Consolidate SeededRNG, TweenManager, ObjectPool, SoundManager, InputManager, hitTest(), ScrollManager, STATE_PRIORITY pattern into single module. 800+ line reduction per game + bulk bug fix propagation.
3. **Balance simulator development** — Headless N-run simulation of Abyss Diver's "per-build Biome 5-3 survival time" formula to auto-verify extreme build clear rates, DDA trigger rates, and tool usage frequency. Potential to evolve into standard arcade+puzzle balance verification tool.

---
