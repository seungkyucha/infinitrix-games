---
cycle: 31
game-id: ironclad-vanguard
title: "Ironclad Vanguard"
date: 2026-03-23
verdict: APPROVED
---

# Ironclad Vanguard — Post-Mortem

## One-Line Summary
Built a **real-time tactical action roguelite** set in steampunk city Cogheim using pure Canvas, achieving APPROVED on the 3rd review round after fixing all P0–P3 issues. First steampunk theme on the platform.

## What We Built
Ironclad Vanguard is a real-time tactical action roguelite where players command 3 types of clockwork units (Striker/Gunner/Engineer) as the Resistance's chief engineer to reclaim 5 zones from the corrupted Machine King Ferrix's legion. 5 zones × 3 stages = 15 base stages + 1 hidden zone = 16 total stages, with 5 zone bosses + hidden boss "Clockwork Arche" = 6 boss encounters.

The core fun lies in the 3-axis compound system of "unit deployment tactics × real-time action × roguelite build growth." Every stage demands different tactical decisions — place gunners on high ground with strikers holding the front line, or run an attrition war with engineer repairs? Boss clears grant 3-pick blueprints (common 6/rare 5/epic 3 = 14 total) and the workshop's 3-tree permanent upgrades (Attack/Defense/Production) ensure replay value.

3-tier difficulty (Apprentice/Technician/Master) + DDA 3-stage dynamic balance + zone-specific environmental hazards (Steam/Gear/Furnace/Clocktower/Aether) + bilingual (Ko/En) support accommodate diverse player skill levels. Steampunk visuals (rotating gears, city silhouettes, CRT vignette) are achieved entirely through zero-asset pure Canvas drawing.

## What Went Well ✅
- **All P0–P3 fixes completed**: TDZ crash (P0), assets/ F1 violation (P1), touch target shortfall (P2), and missing ESCAPE_ALLOWED pattern (P3) — all 4 issues from rounds 1–2 were resolved in round 3. Zero regression bugs, zero new bugs.
- **ESCAPE_ALLOWED pattern fully applied**: Allowed-transition dictionary for all 12 game states + RESTART_ALLOWED cleanly implemented. beginTransition() guard logic is accurate.
- **10 REGION code structure**: CONFIG→ENGINE→ENTITY→DRAW→WEAPON→COMBAT→ROGUE→STATE→SAVE→MAIN with unidirectional dependency. Zero circular references.
- **Steampunk visual quality**: Rotating gear animations, city silhouettes, CRT vignette effects — signature visuals achieved with Canvas only and zero assets. Zone-specific environmental hazards specified with exact values (F84 compliance).
- **100% Canvas code drawing**: ASSET_MAP/SPRITES/preloadAssets fully removed, 0 external CDNs, 0 Math.random (full SeededRNG), 0 setTimeout.
- **Code quality checklist full PASS**: Feature completeness, memory management (ObjectPool), mobile support (48px+ touch targets), SeededRNG, hitTest integration, localization — all 17 items passed.

## What Could Be Improved ⚠️
- **3 review rounds required**: The P0 TDZ crash remaining unresolved through rounds 1–2 indicates room for improvement in the fix process. A simple fix like workshopBonuses empty object initialization taking 3 rounds is regrettable.
- **Shared engine not extracted — 31 cycles running**: TweenManager, ObjectPool, SoundManager, InputManager still copy-pasted per game. REGION export function lists were specified but actual extraction hasn't begun.
- **Combat balance unverified**: 3 unit types × 14 blueprints × 3-tree upgrades × 5 zone hazards create a wide combination space, but code review alone cannot verify dominant strategies or impossible builds. DPS/EHP simulator absence remains an outstanding issue.
- **Small display (≤400px) deep verification incomplete**: Layout adaptation and button display confirmed at 375px, but UI interference on 320px ultra-small displays not fully verified.

## Technical Highlights 🛠️
- **TDZ prevention pattern evolution**: `workshopBonuses: {}` empty object initialization, then populated via `getWorkshopBonus()` in init()/onStateEnter. Structurally prevents scenarios where function calls precede variable declarations.
- **ESCAPE_ALLOWED + RESTART_ALLOWED dual dictionary**: 12 states × allowed transition lists + terminal state escape whitelist separated to maximize state transition safety. Combined with beginTransition() guard logic.
- **Environmental hazard system**: Zone-specific hazards (steam vents/gear grinders/lava jets/time distortion/aether corruption) with explicit numerical values — implemented as gameplay-modifying elements, not decoration. Direct F84 feedback application.
- **Procedural audio**: SoundManager with multi-type SFX + BGM via Web Audio API native scheduling. setTimeout count maintained at 0.
- **ObjectPool + Math.hypot collision**: Pooling + distance-based collision detection for mass unit/enemy/projectile management ensures performance.

## Next Cycle Suggestions 🚀
1. **Begin shared engine module extraction**: Consolidate TweenManager, ObjectPool, TransitionGuard, ESCAPE_ALLOWED/RESTART_ALLOWED, SoundManager, InputManager, hitTest(), touchSafe() verified over 31 cycles into `shared/engine.js`. Ironclad Vanguard's 10 REGION structure is the optimal extraction starting point.
2. **Balance simulator prototype**: Develop a headless auto-simulation tool to verify DPS/EHP across unit × blueprint × upgrade × environment combinations. Strategy genre combination spaces are expanding each cycle — this is urgent.
3. **Pre-review auto gate for 1st-round APPROVED**: To prevent P0 issues like TDZ crashes from persisting to round 3, automate `G` object initialization order verification + ESCAPE_ALLOWED completeness check + 48px touch target verification before review submission.
