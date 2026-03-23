---
game-id: ironclad-vanguard
title: Ironclad Vanguard
genre: action, strategy
difficulty: hard
---

# Ironclad Vanguard — Cycle #31 Game Design Document

> **One-Page Summary**: As a Resistance Chief Engineer, command 3 types of clockwork units (Striker/Gunner/Engineer) in real-time to reclaim 5 districts from the corrupted Machine King's army in a **real-time tactical action roguelite** set in a steampunk city. 5 zones × 3 stages = 15 base stages + 1 hidden zone = **16 total stages**. 5 zone bosses + hidden boss "Clockwork Arche" = **6 bosses**. Workshop upgrade 3-tree (Attack/Defense/Production), 14 blueprints (6 common/5 rare/3 epic) for build diversity, SeededRNG procedural zone generation, 3-tier difficulty (Apprentice/Technician/Master) + 3-level DDA dynamic balance, bilingual (KO/EN). Strengthens **action+strategy combination from 2→3 games** and introduces the platform's first steampunk theme.

> **MVP Boundary**: Phase 1 (Core Loop: Deploy→Combat→Collect→Upgrade→Boss, Zones 1-2 + 2 Bosses + 3 base unit types + 7 blueprints + Workshop base tree) → Phase 2 (Zones 3-5 + 3 Bosses + Hidden Boss + Full narrative + Unit evolution + 7 additional blueprints). **Phase 1 must deliver a complete game experience on its own.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅
> Items below have been verified over 14-20+ cycles and are detailed in platform-wisdom.md. Only **applicable sections** are noted here.

| ID | Lesson Summary | Applied Section |
|----|---------------|----------------|
| F1 | Never create assets/ directory — 14 cycles consecutive success [Cycle 1-30] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1-2] — targeting 19 consecutive | §5.2 |
| F5 | Guard flag for single tween callback execution [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system [Cycle 3 B2] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6-7] | §4.4 |
| F10 | Numeric consistency table (spec=code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target min 48×48px + Math.max enforcement [Cycle 12-22] | §3.3 |
| F12 | TDZ prevention: declare → DOM assign → event register order [Cycle 5-11] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path per value (tween vs direct assign) [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22-30] | §14.3 |
| F16 | hitTest() single function unification [Cycle 27 F60] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG full usage (zero Math.random) [Cycle 19-30] | §5.2, §14.3 |
| F19 | `gt` parameter naming (draw function signature) [Cycle 29 P0] | §4.4 |

### New Feedback (Based on Cycle 30 Postmortem) 🆕

| ID | Lesson | Solution | Applied Section |
|----|--------|----------|----------------|
| F81 | Shared engine not extracted for 30 cycles — clarify REGION separation | Maintain 10 REGION structure + specify export function lists per REGION for future module extraction | §5.3 |
| F82 | Narrative text volume limited within single file | Focus on key story events + environmental storytelling (visual narrative) to minimize text while maintaining depth. Dialogue ≤3 lines + background staging | §1.3, §9 |
| F83 | Small display (≤400px) optimization unverified | ASCII layouts for both small/large displays in §3.3 + viewport test matrix (320/400/768/1024px) | §3.3, §14.4 |
| F84 | Environment hazard specifics not specified → decoration or excessive penalty risk [Cycle 30] | Environment hazard table (hazard/effect/values/counter) per zone in §7.3 | §7.3 |
| F85 | Unit resource cost balance not specified → dominant strategy risk [Cycle 30] | Specify unit steam cost/DPS/characteristics numerically in §2.3 + extreme build verification (Appendix A) | §2.3, §Appendix A |

### Previous Cycle Regret Resolution Summary (Cycle 30 Postmortem)

| Regret | Resolution Section | Method | Verification |
|--------|-------------------|--------|-------------|
| Shared engine not extracted for 30 cycles | §5.3 | 10 REGION + function export list + unidirectional deps | Zero circular refs |
| Narrative text volume limit | §1.3, §9 | Environmental storytelling + concise dialogue + visual staging | Dialogue ≤3 lines + staging exists |
| Small display unverified | §3.3, §14.4 | ASCII layouts + 4-tier viewport matrix | Zero button overlap at 320px |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
Ironclad Vanguard is a **real-time tactical action roguelite** where the player reclaims the steampunk industrial city of "Cogheim" from the corrupted Machine King "Ferrix." As the Resistance Chief Engineer, deploy and command 3 types of clockwork units (Striker/Gunner/Engineer), manage the Steam Gauge, and defeat bosses across 5 districts.

The core differentiator is a 3-axis composite system: "unit deployment strategy × real-time action × roguelite builds." Combining tower defense placement strategy with action RPG real-time combat, while blueprint selections and permanent Workshop upgrades that change each run guarantee replay value.

### 1.2 Core Fun — 3 Axes
1. **Tactical Deployment (Deploy & Command)**: Unit placement position, timing, and composition determine battle outcomes. "Should I place 2 Gunners on high ground and hold the line with Strikers, or sustain with Engineer repairs?"
2. **Real-Time Action Tension (Fight & React)**: Enemy waves push in real-time; rapid decisions for unit repositioning, skill activation, and emergency repairs are essential. Boss fights require pattern reading + formation shifting.
3. **Roguelite Build Growth (Build & Evolve)**: Choose 1 of 3 blueprints on boss clear, permanently upgrade Workshop with accumulated Gears across runs. "This run I'll specialize Gunners, next time I'll try Engineer healer build."

### 1.3 Story/Narrative
- **Setting**: Cogheim, a city powered by steam engines. "Ferrix," the Chief Mechanic who managed the city's core energy source "Aether Core," becomes corrupted by Aether infection and raises a machine army. The player, as the Resistance Chief Engineer, must reclaim 5 districts one by one.
- **Zone Stories**: Each zone entry displays a previous engineer's work journal via Canvas staging.
  - **Steam Harbor**: 1st Engineer "Bolt" — The beginning of the uprising
  - **Gear Factory**: 2nd Engineer "Spring" — Seizing the production line
  - **Furnace District**: 3rd Engineer "Anvil" — Resistance in the flames
  - **Clocktower Plaza**: 4th Engineer "Pendulum" — Reversal of time
  - **Aether Core**: Ferrix's journal — The truth of corruption
- **Inter-stage Text**: Canvas staging 2-3 lines + engineer portrait (15 total + 2 hidden)
- **Ending Branches**:
  - 5 zones reclaimed → **"Cogheim Liberation"** Normal Ending: Purify the Aether Core and reclaim the city.
  - Hidden boss "Clockwork Arche" defeated → **"Aether Succession"** True Ending: Arche was the city's guardian created by the Aether Core; the player becomes the new guardian.

---

## §2. Game Rules & Objectives

### 2.1 Victory Conditions
- **Normal Clear**: Defeat all 5 zone bosses and purify the Aether Core
- **True Clear**: Defeat Clockwork Arche in the hidden zone unlocked after all 5 bosses

### 2.2 Defeat Conditions
- Commander HP reaches 0 → current run ends → Workshop permanent upgrades retained, blueprints/resources reset
- Run starts with Commander HP 100 + Workshop bonus

### 2.3 Core Rules

#### 2.3.1 Unit System
3 unit types + 3-tier evolution (evolution unlocked via blueprints):

| Unit | Role | Steam Cost | Base DPS | Range | Special |
|------|------|-----------|---------|-------|---------|
| Striker | Melee warrior | 20 | 15 | 1.5 tiles | +30% frontal DEF, Taunt |
| Gunner | Ranged artillery | 30 | 22 | 4.5 tiles | Piercing shot, +15% high-ground bonus |
| Engineer | Support/repair | 25 | 8 | 3 tiles | Ally repair (5 HP/sec), Barricade placement |

**Evolution Tree** (unlocked via blueprints, 3 tiers each):
- Striker: Trooper → Ironclad Knight → Steam Champion
- Gunner: Rifleman → Cannon Master → Aether Bombardier
- Engineer: Mechanic → Inventor → Master Architect

#### 2.3.2 Resource System
| Resource | Acquisition | Consumption | Cross-Run Retention |
|----------|------------|-------------|-------------------|
| Steam | Time (3/sec) + Steam Vent destruction | Unit summon, Skill use | ❌ |
| Gear | Enemy kills, chests, boss rewards | Workshop upgrades | ✅ (Permanent) |
| Blueprint | 3-choice on boss clear | Unit evolution, special abilities | ❌ (Per-run) |

#### 2.3.3 Steam Gauge Balance
- Max Steam: 100 (Workshop expandable to 150)
- Natural Regen: 3/sec (Workshop expandable to 5)
- Post-summon cooldown: 3 sec (same unit type)
- **Extreme build prevention**: Steam consumption cap = 80% of max. No simultaneous summons (cooldown stacking prohibited)

### 2.4 Game Flow
```
BOOT → TITLE → WORKSHOP(upgrade) → ZONE_SELECT → DEPLOY(placement) → COMBAT(battle)
                    ↑                                                        ↓
                    ← ← ← ← GAME_OVER(run end) ← ← ← ← ← ← ← HP=0 ← ← ←
                    ↑                                                        ↓
                    ← ← ← ← STAGE_CLEAR(blueprint selection) → next stage
                                                                             ↓
                                                                    BOSS_INTRO(cutscene)
                                                                             ↓
                                                                    BOSS_FIGHT
                                                                             ↓
                                                                    ZONE_CLEAR(rewards)
                                                                             ↓
                                                                    VICTORY(ending)
```

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Camera scroll (battlefield pan) |
| 1 / 2 / 3 | Unit selection (Striker/Gunner/Engineer) |
| Left Click | Place selected unit / Select existing unit |
| Right Click | Move command for selected unit |
| Q | Activate selected unit skill |
| E | Rally/Scatter all units toggle |
| Space | Game speed toggle (1×/2×) |
| R | Recall selected unit (50% steam refund) |
| Esc | Pause / Menu |

### 3.2 Mouse (without keyboard)
| Action | Effect |
|--------|--------|
| Screen edge hover | Camera scroll |
| Bottom unit icon click | Unit type selection |
| Battlefield left click | Place/Select |
| Battlefield right click | Move command |
| Unit double-click | Skill activation |
| Minimap click | Instant camera move |

### 3.3 Touch (Mobile)

#### Large Display (>400px) Layout
```
┌──────────────────────────────┐
│       Battlefield (scroll)    │
│                              │
│  [MINIMAP]            [2×]   │
│                              │
│                              │
│                              │
├──────────────────────────────┤
│ [STR][GUN][ENG]  [SKILL][RCL]│
│   Unit Select    Activate Rcl │
└──────────────────────────────┘
```

#### Small Display (≤400px) Layout
```
┌────────────────────┐
│  Battlefield(scroll)│
│                    │
│ [MAP]        [2×]  │
│                    │
├────────────────────┤
│[S][G][E] [SK][RC]  │
│ 44px ea   44px ea  │
│ gap 8px            │
└────────────────────┘
```

| Touch Gesture | Effect |
|--------------|--------|
| Battlefield drag | Camera scroll |
| Battlefield tap | Place unit (when selected) / Select unit |
| Long press (0.5s) | Move command |
| Unit double-tap | Skill activation |
| Bottom button tap | Unit type select / Skill / Recall |
| Pinch zoom | Camera zoom in/out |

**Touch Button Specs**:
- Large: 56×56px, 12px gap
- Small (≤400px): 44×44px (Math.max enforced), 8px gap
- hitTest() single function for all touch detection (F16)

---

## §4. Visual Style Guide

### 4.1 Asset Policy
- **100% Canvas code drawing** — Never create assets/ directory (F1, targeting 15 consecutive cycles)
- Zero external CDN, zero Google Fonts (F2)
- ASSET_MAP / preloadAssets / SPRITES code preemptively excluded (F77)
- Zero SVG asset files — all visuals drawn directly via Canvas 2D API

### 4.2 Color Palette (Steampunk)
```
PRIMARY:
  Copper:          #B87333  — Units, UI frames
  Brass:           #CD9B1D  — Highlights, gear icons
  Steel:           #71797E  — Background structures
  Dark Iron:       #1C1C1C  — Background darkness

ACCENT:
  Steam White:     #E8E8E8  — Steam effects, text
  Aether Teal:     #00CED1  — Aether energy, skills
  Corruption Purple:#8B008B  — Enemy units, boss aura
  Furnace Orange:  #FF6B35  — Fire, explosions
  Warning Red:     #DC3545  — HP bars, danger indicators

UI:
  Background Gradient: #0D0D0D → #1A1A2E
  Panel Background:    rgba(28, 28, 28, 0.85)
  Border:              #B87333 (Copper)
```

### 4.3 Backgrounds & Objects

#### Zone Backgrounds (Canvas Drawing)
| Zone | Background | Key Visual Elements |
|------|-----------|-------------------|
| Steam Harbor | Foggy harbor + cranes | Steam pipes, cargo containers, water reflections |
| Gear Factory | Rotating giant gears | Conveyor belts, press machines, sparks |
| Furnace District | Red heat + lava flows | Furnaces, smoke, heat shimmer |
| Clocktower Plaza | Giant clock + plaza | Rotating clock hands, bell chime effects, stone buildings |
| Aether Core | Purple aether + crystals | Aether particles, energy streams, floating objects |

#### Object Drawing Specs
- Units: 32×32px base (scale with zoom), multi-pose per state (idle/move/attack/hit/death)
- Enemies: 24×24 ~ 48×48px (by type)
- Bosses: 96×96px base + 128×128px for intro cutscene
- Environment: Tile-based 16×16px grid, destructible objects include destruction animation
- Effects: Particle system (steam, sparks, explosions, aether particles)

### 4.4 Drawing Function Signature Standard (F9, F19)
```javascript
// All drawing functions are pure functions
function drawUnit(ctx, x, y, size, unitType, state, gt) { ... }
function drawEnemy(ctx, x, y, size, enemyType, hp, gt) { ... }
function drawBoss(ctx, x, y, size, bossId, phase, hp, gt) { ... }
function drawEffect(ctx, x, y, effectType, progress, gt) { ... }
function drawUI(ctx, w, h, gameState, gt) { ... }
// gt = gameTime (F19: prevent 't' parameter shadowing)
```

---

## §5. Core Game Loop (Per-Frame Logic Flow)

### 5.1 Initialization Order (F12: TDZ Prevention)
```
1. CONFIG constants declaration
2. Global state object (G) declaration + defaults
3. Canvas DOM assignment
4. TweenManager/ObjectPool/SoundManager/InputManager instance creation
5. Event listener registration
6. gameLoop start
```

### 5.2 Main Loop (requestAnimationFrame)
```
function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // frame cap
    lastTime = timestamp;
    gt += dt; // F19: gameTime

    inputManager.update();

    switch(G.state) {
        case 'TITLE':      updateTitle(dt, gt);      break;
        case 'WORKSHOP':   updateWorkshop(dt, gt);   break;
        case 'ZONE_SELECT':updateZoneSelect(dt, gt);  break;
        case 'DEPLOY':     updateDeploy(dt, gt);     break;
        case 'COMBAT':     updateCombat(dt, gt);     break;
        case 'BOSS_INTRO': updateBossIntro(dt, gt);  break;
        case 'BOSS_FIGHT': updateBossFight(dt, gt);  break;
        case 'STAGE_CLEAR':updateStageClear(dt, gt); break;
        case 'ZONE_CLEAR': updateZoneClear(dt, gt);  break;
        case 'GAME_OVER':  updateGameOver(dt, gt);   break;
        case 'VICTORY':    updateVictory(dt, gt);    break;
        case 'PAUSE':      updatePause(dt, gt);      break;
        case 'MODAL':      updateModal(dt, gt);      break;
    }

    tweenManager.update(dt); // F5: update tweens in ALL states
    soundManager.update(dt);

    render(gt);
    requestAnimationFrame(gameLoop);
}
```

**Core Rules**:
- Zero setTimeout (F4) — all delays via tween onComplete
- Guard flags required (F5) — `if (transitioning) return;`
- Single update path per value (F14) — Steam gauge uses tween OR direct assign, never both
- SeededRNG full usage (F18) — zero Math.random
- TweenManager.clearImmediate() separation (F13) — prevent cancelAll/add race condition

### 5.3 Code REGION Structure (10 REGIONs, Line Number Guide)

| REGION | Range (est.) | Content | Key Exports |
|--------|-------------|---------|-------------|
| R1: CONFIG | 1-200 | Constants, balance values, i18n text | CONFIG, LANG |
| R2: ENGINE | 201-550 | TweenManager, ObjectPool, SoundManager, InputManager, SeededRNG | tw, pool, snd, input, rng |
| R3: ENTITY | 551-850 | Unit, Enemy, Boss, Projectile classes | createUnit, createEnemy, createBoss |
| R4: DRAW | 851-1200 | All drawing functions (pure functions) | drawUnit, drawEnemy, drawBoss, drawEffect, drawUI |
| R5: DEPLOY | 1201-1450 | Deploy phase logic | updateDeploy, handleDeployInput |
| R6: COMBAT | 1451-1800 | Combat logic, AI, collision | updateCombat, resolveCollisions, unitAI |
| R7: BOSS | 1801-2100 | Boss patterns, phases, cutscenes | updateBossIntro, updateBossFight, bossPatterns |
| R8: ROGUE | 2101-2400 | Blueprints, Workshop, permanent progression | applyBlueprint, workshopUpgrade, blueprintPool |
| R9: STATE | 2401-2700 | State machine, transitions, save/load | beginTransition, saveProgress, loadProgress |
| R10: MAIN | 2701-2980+ | Initialization, events, main loop | init, gameLoop, render |

**Dependency Direction**: R1 → R2 → R3 → R4 → R5/R6/R7 → R8 → R9 → R10 (unidirectional, zero circular refs)

**Narrative Text Separation (F82)**: All dialogue/journal text isolated in R1:CONFIG as STORY constant object in JSON-like structure:
```javascript
const STORY = {
  zones: {
    steamHarbor: { intro: { ko: "...", en: "..." }, journal: { ko: "...", en: "..." } },
    // ...
  },
  endings: { normal: { ko: "...", en: "..." }, true: { ko: "...", en: "..." } }
};
```

---

## §6. State Machine

### 6.1 State Priority (F6)
```javascript
const STATE_PRIORITY = {
    BOOT: 0, TITLE: 1, WORKSHOP: 2, ZONE_SELECT: 3,
    DEPLOY: 4, COMBAT: 5, BOSS_INTRO: 6, BOSS_FIGHT: 7,
    STAGE_CLEAR: 8, ZONE_CLEAR: 9, VICTORY: 10, GAME_OVER: 11,
    PAUSE: 50, MODAL: 99
};
```
- GAME_OVER/VICTORY always takes priority over STAGE_CLEAR/ZONE_CLEAR
- All transitions go through `beginTransition(targetState)` (F6)
- RESTART_ALLOWED whitelist: `['GAME_OVER', 'VICTORY', 'TITLE']`

### 6.2 State × System Matrix (F7)

| State | Tween | Physics | UnitAI | EnemyAI | Input | Sound | Camera | Deploy | Combat | Boss |
|-------|-------|---------|--------|---------|-------|-------|--------|--------|--------|------|
| BOOT | ✅ | — | — | — | — | — | — | — | — | — |
| TITLE | ✅ | — | — | — | menu | ✅ | fixed | — | — | — |
| WORKSHOP | ✅ | — | — | — | menu | ✅ | fixed | — | — | — |
| ZONE_SELECT | ✅ | — | — | — | menu | ✅ | pan | — | — | — |
| DEPLOY | ✅ | — | — | — | deploy | ✅ | scroll | ✅ | — | — |
| COMBAT | ✅ | ✅ | ✅ | ✅ | combat | ✅ | scroll | — | ✅ | — |
| BOSS_INTRO | ✅ | — | — | — | skip | ✅ | cinematic | — | — | — |
| BOSS_FIGHT | ✅ | ✅ | ✅ | ✅ | combat | ✅ | boss-track | — | ✅ | ✅ |
| STAGE_CLEAR | ✅ | — | — | — | select | ✅ | fixed | — | — | — |
| ZONE_CLEAR | ✅ | — | — | — | select | ✅ | fixed | — | — | — |
| GAME_OVER | ✅ | — | — | — | menu | ✅ | fixed | — | — | — |
| VICTORY | ✅ | — | — | — | menu | ✅ | cinematic | — | — | — |
| PAUSE | ✅ | — | — | — | pause | — | frozen | — | — | — |
| MODAL | ✅ | — | — | — | modal | — | frozen | — | — | — |

> **Input Mode Granularity (Cycle 26 lesson)**: deploy=placement only, combat=battle only, menu=UI navigation, modal=Canvas modal only, select=choice selection, pause=pause menu, skip=cutscene skip, boss-track=boss tracking camera

### 6.3 State Transition Diagram (Boss Fight)
```
COMBAT → [boss HP threshold] → BOSS_INTRO (3s cutscene, skippable)
                                     ↓
                                BOSS_FIGHT
                                ├── Phase 1 (HP 100%-60%): Base patterns
                                ├── Phase 2 (HP 60%-30%): Enhanced patterns + environment change
                                └── Phase 3 (HP 30%-0%): Enrage + final patterns
                                     ↓
                           [Boss HP=0] → ZONE_CLEAR (rewards + 3-choice blueprint)
                                     ↓
                           [HP=0 during boss] → GAME_OVER
```

### 6.4 Canvas Modal (F3)
confirm()/alert() unusable in iframe environments. All confirmation UI via Canvas modals:
- Return to title confirmation
- Game over restart/title selection
- Workshop purchase confirmation
- Game reset confirmation

---

## §7. Stage Design

### 7.1 Zone Structure (5 Zones × 3 Stages + Hidden)

| Zone | Stages | Boss | Theme Color |
|------|--------|------|-------------|
| Steam Harbor | 1-1, 1-2, 1-3 | Harbor Crane "Harbormaster" | #71797E + #E8E8E8 |
| Gear Factory | 2-1, 2-2, 2-3 | Giant Press "Crusher" | #CD9B1D + #71797E |
| Furnace District | 3-1, 3-2, 3-3 | Furnace Golem "Magmacore" | #FF6B35 + #DC3545 |
| Clocktower Plaza | 4-1, 4-2, 4-3 | Time Manipulator "Chronogear" | #00CED1 + #CD9B1D |
| Aether Core | 5-1, 5-2, 5-3 | Machine King "Ferrix" | #8B008B + #00CED1 |
| Hidden: Core Depths | H-1 | Clockwork Arche | #FFD700 + #8B008B |

### 7.2 Enemy Types (Zone Variants)

| Enemy Type | Base HP | Base ATK | Speed | Special |
|-----------|---------|---------|-------|---------|
| Gear Grunt | 30 | 5 | 1.5 | Basic melee |
| Steam Shooter | 20 | 8 | 1.0 | Ranged, 3.5 range |
| Cog Charger | 50 | 12 | 2.5 | Rush, self-destruct on collision |
| Repair Drone | 15 | 0 | 1.2 | Repairs nearby enemies (3 HP/sec) |
| Aether Infected | 80 | 15 | 0.8 | Creates corruption zone on death |
| Elite (zone variant) | 120-200 | 20-30 | 1.0 | Unique ability per zone |

### 7.3 Zone Environmental Mechanics (F84: Values Specified)

| Zone | Hazard | Effect | Values | Counter |
|------|--------|--------|--------|---------|
| Steam Harbor | Steam vent | Vision limit + move speed reduction | Vision 60%→40%, speed -25%, 3s duration/8s interval | Destroy vent (40 HP), Engineer repair grants immunity |
| Gear Factory | Rotating gears | Path block + contact damage | 5 DPS, 4s rotation cycle, 1.5s safe window | Time movement, Gunner ranged bypass |
| Furnace District | Lava eruption | Sustained fire damage | 8 DPS, 2-tile radius, 4s warning→2s eruption | Dodge on warning, Engineer shield -50% |
| Clocktower Plaza | Time warp | Unit attack speed fluctuation | ±30% attack speed, 5s period | Concentrate attacks during fast phase, reposition during slow |
| Aether Core | Aether corruption | Steam drain + unit max HP reduction | Steam -1/sec, unit max HP -5%/30s (cap -30%) | Destroy purifiers (3 on map), Engineer cleanse skill |

### 7.4 Procedural Generation (SeededRNG)
- Enemy placement, hazard locations, resource positions per stage generated via SeededRNG
- Seed = run number × 1000 + zone number × 100 + stage number
- Same seed = same map (reproducible)
- Generation validation: BFS from deployment positions to exit confirms path exists (Cycle 23 lesson)

### 7.5 Boss Details

#### Boss Common Rules
- bossRewardGiven flag prevents duplicate rewards (F17)
- HP bar UI: fixed at top of screen, phase divider lines
- Boss defeat → 3-choice blueprint selection (STAGE_CLEAR state transition)

| Boss | HP | Phase Thresholds | P1 Pattern | P2 Pattern | P3 Pattern |
|------|-----|-----------------|------------|------------|------------|
| Harbormaster | 500 | 100/60/30 | Crane arm swing (2s telegraph) | +Cargo drop (AoE) | +Hook chain (pulls units) |
| Crusher | 700 | 100/60/30 | Press stamp (linear AoE) | +Conveyor acceleration (field shift) | +Gear rotation (omnidirectional damage) |
| Magmacore | 900 | 100/60/30 | Lava projectiles (3-way) | +Flame barrier (path block) | +Core overheat (map-wide DPS 5s) |
| Chronogear | 1100 | 100/60/30 | Time stop (freeze 1 unit 2s) | +Rewind (self-heal 10% HP) | +Time acceleration (enemy speed 2× 10s) |
| Ferrix | 1500 | 100/50/25 | Aether beam (linear high damage) | +Unit corruption (control 1 ally 3s) | +Aether storm (map-wide sustained damage) |
| Arche (Hidden) | 2000 | 100/60/30/10 | Random all boss patterns | +2 Clockwork clones | +Spacetime collapse (map shrinks) | +Final: all patterns simultaneous |

---

## §8. Difficulty System

### 8.1 3-Tier Base Difficulty

| Difficulty | Enemy HP Mult | Enemy ATK Mult | Steam Regen | Blueprint Pool | Target |
|-----------|-------------|-------------|------------|---------------|--------|
| Apprentice | 0.7× | 0.7× | 4/sec | common+rare | New/casual |
| Technician | 1.0× | 1.0× | 3/sec | common+rare+epic | Regular |
| Master | 1.4× | 1.3× | 2.5/sec | Limited choices | Veteran |

### 8.2 DDA 3-Level Dynamic Balance
Combines player death count, clear time, unit loss ratio for real-time adjustment:

| DDA Level | Condition | Applied |
|-----------|----------|---------|
| Ease | Same stage failed 3 times | Enemy HP -15%, ATK -10%, Steam +1/sec |
| Normal | Default | No change |
| Challenge | No-hit clear or 2× speed clear | Enemy HP +10%, bonus Gears +20% |

### 8.3 Balance Matrix (DPS/EHP Pre-Verification)

#### Expected Values by Phase (Technician difficulty)
| Phase | Player DPS (3 units) | Enemy Total EHP/Wave | Est. Clear Time | Commander EHP |
|-------|---------------------|---------------------|----------------|--------------|
| Early (1-1~1-3) | 45-65 | 300-500 | 8-12s/wave | 150 |
| Mid (2-1~3-3) | 80-130 | 600-1200 | 10-15s/wave | 200-280 |
| Late (4-1~5-3) | 150-250 | 1500-3000 | 12-20s/wave | 350-500 |
| Boss | Specialized DPS | Boss HP (§7.5) | 45-90s | Same as above |

#### Extreme Build Verification — See Appendix A

---

## §9. Narrative Staging System

### 9.1 Zone Entry Cutscene
- Canvas fullscreen + darkened overlay (opacity 0.7)
- Engineer portrait: bottom-left (128×128px Canvas drawing)
- Text: centered, 2-3 lines at a time, typing animation
- Tap/Enter to skip
- Total volume: 3 per zone (entry/midpoint/pre-boss) × 2-3 lines ≈ 15-20 words per stage

### 9.2 Environmental Storytelling (F82: Minimize Text)
Convey through visuals instead of text:
- Destroyed barricades, deactivated unit wreckage → traces of previous battles
- Wall graffiti (Canvas text 1 line) → Resistance messages
- Camera zoom-in on boss room entry → Boss entrance staging
- Aether corruption visualization: purple pulsation + particles → threat atmosphere

### 9.3 Bilingual Support Structure
```javascript
const LANG = {
  ko: { title: "철갑 선봉대", start: "출격", workshop: "워크샵", ... },
  en: { title: "Ironclad Vanguard", start: "Deploy", workshop: "Workshop", ... }
};
// Current language: G.lang = 'ko' | 'en', switchable in settings
```

---

## §10. Scoring System

### 10.1 Score Calculation
| Action | Points |
|--------|--------|
| Gear Grunt kill | 10 |
| Steam Shooter kill | 15 |
| Cog Charger kill | 20 |
| Repair Drone kill | 25 |
| Aether Infected kill | 30 |
| Elite kill | 50 |
| Boss kill | 500 |
| Hidden boss kill | 1000 |
| No-hit wave clear | ×1.5 multiplier |
| 2× speed clear | ×1.3 multiplier |
| Zero unit loss clear | ×1.2 multiplier |

### 10.2 Combo System
- Consecutive kills within 5 seconds increase combo counter
- Combo multiplier: 1 + (combo count × 0.1), max 3.0×
- Combo timer: displayed as gauge at top of screen

### 10.3 High Score Save
- Per-difficulty high scores in localStorage
- Judge first, save later (F8): `if (score > best) { showNewBest(); saveBest(score); }`

---

## §11. Save/Load System

### 11.1 Data Schema
```javascript
const SAVE_SCHEMA = {
  version: 1,
  workshop: { attack: 0, defense: 0, production: 0 }, // each 0-10
  totalGears: 0,
  bestScore: { apprentice: 0, technician: 0, master: 0 },
  furthestZone: 0,     // 0-5
  hiddenUnlocked: false,
  trueEndingSeen: false,
  totalRuns: 0,
  lang: 'ko',
  difficulty: 'technician',
  settings: { sfxVol: 0.7, bgmVol: 0.5, speed: 1 }
};
```

### 11.2 Save Timing
- On Workshop upgrade completion
- On zone clear
- On settings change
- **Never save during a run** (roguelite principle)

---

## §12. Sound Design (Web Audio API)

### 12.1 BGM (Procedural Generation)
| Situation | Tone | BPM | Key |
|-----------|------|-----|-----|
| Title | Grand steampunk march | 100 | C minor |
| Deploy Phase | Calm mechanical ambient | 80 | F minor |
| Combat | Tense marching tune | 130 | D minor |
| Boss Fight | Epic orchestral | 150 | E minor |
| Victory | Bright fanfare | 120 | C major |

### 12.2 Sound Effects (8+)
| ID | Situation | Waveform | Freq/Duration |
|----|-----------|----------|---------------|
| sfx_deploy | Unit placement | square→sine | 440→880Hz, 0.2s |
| sfx_attack_melee | Melee attack | noise burst | 0.1s |
| sfx_attack_range | Ranged shot | sawtooth | 660→220Hz, 0.15s |
| sfx_skill | Skill activation | sine sweep | 220→1320Hz, 0.3s |
| sfx_hit | Hit | noise | 0.08s |
| sfx_explosion | Explosion | noise+sine | 110Hz, 0.4s |
| sfx_boss_roar | Boss entrance | low sine | 55→110Hz, 1.0s |
| sfx_gear_pickup | Gear pickup | triangle | 880→1760Hz, 0.1s |
| sfx_blueprint | Blueprint select | sine chord | C+E+G, 0.5s |
| sfx_steam | Steam vent | filtered noise | 0.3s |

---

## §13. Permanent Progression System

### 13.1 Workshop Upgrade Tree

#### Attack Tree (Gear Cost)
| Level | Cost | Effect |
|-------|------|--------|
| 1 | 50 | All unit ATK +5% |
| 2 | 100 | All unit ATK +10% (cumulative 15%) |
| 3 | 200 | ATK +10% (cumulative 25%) + Critical chance 5% |
| 4 | 400 | ATK +15% (cumulative 40%) + Critical damage +50% |
| 5 | 800 | Final: ATK +50%, Critical 10%, Crit damage 200% |

#### Defense Tree
| Level | Cost | Effect |
|-------|------|--------|
| 1 | 50 | Commander max HP +10 |
| 2 | 100 | Commander max HP +20 (cumulative +30) + Unit HP +5% |
| 3 | 200 | Unit HP +15% (cumulative 20%) + Unit DEF +10% |
| 4 | 400 | Unit HP +10% (cumulative 30%) + 15% chance negate damage |
| 5 | 800 | Final: Commander HP +50, Unit HP +40%, DEF +20%, Negate 20% |

#### Production Tree
| Level | Cost | Effect |
|-------|------|--------|
| 1 | 50 | Max Steam +10 |
| 2 | 100 | Steam regen +0.5/sec |
| 3 | 200 | Max Steam +20 (cumulative +30) + Summon cooldown -0.5s |
| 4 | 400 | Gear drop rate +15% + Unit recall refund 70% |
| 5 | 800 | Final: Max Steam +50, Regen +2/sec, Summon CD -1s, Gears +25%, Refund 80% |

### 13.2 Blueprint System

| Tier | Count | Effect Range | Example |
|------|-------|-------------|---------|
| Common | 6 | Single stat minor boost | STR ATK +10%, GUN range +0.5, ENG heal +20% |
| Rare | 5 | Multi-stat + special effect | STR taunt range 2×, GUN pierce 2 targets, ENG barricade HP 2× |
| Epic | 3 | Unit evolution + passive | STR→Ironclad Knight + counter, GUN→Cannon Master + AoE blast, ENG→Inventor + auto-repair drone |

**Cap System (Cycle 26 lesson)**:
- DPS cap: 200% of base DPS
- Synergy cap: 150%
- Blueprints exceeding cap are excluded from choices → `applyBlueprint()` cap verification required (§14.2 checklist)

---

## §14. Code Hygiene & Verification

### 14.1 Numeric Consistency Table (F10)
> All spec values below must have **1:1 correspondence** with R1:CONFIG constants.

| Spec Section | Spec Value | CONFIG Key |
|-------------|-----------|------------|
| §2.3.1 Striker DPS | 15 | CONFIG.UNIT.STRIKER.DPS |
| §2.3.1 Gunner DPS | 22 | CONFIG.UNIT.GUNNER.DPS |
| §2.3.1 Engineer DPS | 8 | CONFIG.UNIT.ENGINEER.DPS |
| §2.3.2 Steam natural regen | 3/sec | CONFIG.STEAM.REGEN |
| §2.3.2 Max Steam | 100 | CONFIG.STEAM.MAX |
| §7.3 Harbor vision reduction | 40% | CONFIG.ENV.HARBOR.VISION |
| §7.3 Furnace lava DPS | 8 | CONFIG.ENV.FURNACE.LAVA_DPS |
| §7.5 Harbormaster HP | 500 | CONFIG.BOSS.HARBOR.HP |
| §7.5 Ferrix HP | 1500 | CONFIG.BOSS.CORE.HP |
| §7.5 Arche HP | 2000 | CONFIG.BOSS.HIDDEN.HP |
| §8.1 Apprentice HP mult | 0.7 | CONFIG.DIFF.APPRENTICE.HP_MULT |
| §8.1 Master HP mult | 1.4 | CONFIG.DIFF.MASTER.HP_MULT |
| §10.1 Boss kill score | 500 | CONFIG.SCORE.BOSS_KILL |
| §13.1 Attack Lv5 ATK bonus | 50% | CONFIG.WORKSHOP.ATK_5 |

### 14.2 Code Hygiene Checklist (Run Frequently During Coding)

#### FAIL (Required — Build blocked if violated)
- [ ] `assets/` directory exists → 0 instances
- [ ] `ASSET_MAP`, `preloadAssets`, `SPRITES` code exists → 0 instances
- [ ] `Math.random` calls → 0 instances (use SeededRNG)
- [ ] `setTimeout`, `setInterval` calls → 0 instances
- [ ] `confirm(`, `alert(`, `prompt(` calls → 0 instances
- [ ] `google`, `cdn`, `font-face` references → 0 instances
- [ ] Parameter name `t` (in draw functions) → 0 instances (use gt)
- [ ] `applyBlueprint()` missing cap verification → must exist

#### WARN (Advisory — Check during review)
- [ ] Direct global variable reference (in draw functions) → minimize
- [ ] Circular references (between REGIONs) → 0 instances
- [ ] Unused variable declarations → 0 instances

### 14.3 Smoke Test Gate (F15)
Required before review submission:
1. index.html file exists and loads successfully
2. TITLE screen displays + start button works
3. DEPLOY → COMBAT transition succeeds
4. Unit placement + basic combat loop works
5. Boss defeat → ZONE_CLEAR transition
6. GAME_OVER → TITLE return
7. Workshop upgrade application confirmed
8. Both keyboard/touch inputs work
9. localStorage save/load normal
10. SeededRNG: same seed = same result

### 14.4 Viewport Test Matrix (F83)

| Viewport | Check Items |
|----------|------------|
| 320px | No touch button overlap, minimap visibility, no text truncation |
| 400px | Bottom button bar layout normal, battlefield scroll works |
| 768px | Overall UI proportions appropriate, camera zoom range normal |
| 1024px+ | Fullscreen ratio maintained, high-res rendering (devicePixelRatio) |

---

## §15. Game Page Metadata

### 15.1 Sidebar Fields
```yaml
game:
  title: "Ironclad Vanguard"
  description: "Command 3 types of clockwork units in a real-time tactical action roguelite to reclaim a steampunk city from a machine army. 5 zones, 16 stages, 6 bosses, 14 blueprint builds."
  genre: ["action", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/Arrows: Camera scroll"
    - "1/2/3: Unit select"
    - "Left click: Place/Select"
    - "Right click: Move command"
    - "Q: Skill, E: Rally/Scatter"
    - "Touch: Drag scroll + bottom buttons"
  tags:
    - "#steampunk"
    - "#tactics"
    - "#roguelite"
    - "#unitcommand"
    - "#bossfight"
    - "#permanentprogression"
  addedAt: "2026-03-23"
  version: "1.0.0"
  featured: true
```

### 15.2 Home Page GameCard
```yaml
thumbnail: "Canvas drawing — 3 unit formation in steam + boss silhouette (4:3)"
title: "Ironclad Vanguard"
description: "Command 3 types of clockwork units in a real-time tactical action roguelite to reclaim a steampunk city from a machine army."
genre_badges: ["action", "strategy"]  # max 2
playCount: "0"  # "1.2k" format if ≥1000
addedAt_new: true  # "NEW" badge if within 7 days
featured: true  # → ⭐ badge
```

### 15.3 Thumbnail SVG Concept (20KB+)
Cinematic composition: foreground with Striker/Gunner/Engineer 3-unit V-formation, midground with steam and gears, background with darkly silhouetted Machine King Ferrix. Copper+brass toned steampunk atmosphere. Generated via Canvas code drawing (not an SVG file).

---

## Appendix A: Extreme Build Verification

### Assumptions
- Player effective DPS = theoretical DPS × 0.6 (accounting for dodging/repositioning)
- Boss effective DPS = Boss ATK × 0.5 (player defense/evasion)

### Extreme Build 1: Gunner All-In (3 Gunners + Attack Tree Lv5 + Epic Gunner Blueprint)
- Gunner DPS: 22 × 1.5(workshop) × 1.5(epic blueprint) = 49.5 → Cap(200%) = 44
- 3 units total DPS: 44 × 3 = 132
- Effective DPS: 132 × 0.6 = 79.2
- Ferrix (HP 1500) est. clear: 1500 / 79.2 ≈ 19s → ✅ Appropriate (15-90s range)

### Extreme Build 2: Engineer Tank (3 Engineers + Defense Tree Lv5)
- Unit DPS: 8 × 3 = 24, Effective: 14.4
- Ferrix clear: 1500 / 14.4 ≈ 104s → ⚠️ Long but survivable with repairs
- DDA Challenge applied (enemy HP +10%): 1650 / 14.4 = 115s → ⚠️ Borderline, DDA Ease fallback

### Extreme Build 3: Mixed Optimal (STR 1 + GUN 1 + ENG 1 + balanced upgrades)
- Total DPS: (15+22+8) × 1.25 = 56.25, Effective: 33.75
- Ferrix clear: 1500 / 33.75 ≈ 44s → ✅ Appropriate

---

_Design document completed: 2026-03-23_
_Cycle #31 / Ironclad Vanguard / action+strategy_
