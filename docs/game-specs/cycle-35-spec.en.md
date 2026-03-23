---
game-id: abyss-diver
title: Abyss Diver
genre: arcade, puzzle
difficulty: hard
---

# Abyss Diver — Cycle #35 Game Design Document

> **One-Page Summary**: A deep-sea explorer uncovering the secrets of the ancient underwater civilization "Abyssos" must survive **hostile deep-sea environments** in real-time in this **arcade puzzle platformer**. Inspired by Level Devil (Poki #1)'s "the level itself is the enemy" core mechanic, reimagined for an underwater setting — floors collapse, currents reverse, water pressure distorts controls, and bioluminescent lures hide deadly traps. 5 biomes × 3 stages = 15 base stages + 5 biome bosses + 3 hidden Abyss stages = **23 total stages**. Dive suit upgrade tree (3 branches × 5 levels) + 6 tool unlocks for permanent progression + SeededRNG procedural trap placement for high replay value. **arcade+puzzle combination resolves 10-cycle longest unused gap (since #25) + starts 2nd genre cycle.** Platform-first deep-sea theme introducing bioluminescence and pressure dynamics Canvas visuals.

> **MVP Boundary**: Phase 1 (core loop: dive→puzzle breakthrough→escape/boss, biomes 1~3 + 3 bosses + 3 basic tools + upgrade tree Lv1~3) → Phase 2 (biomes 4~5 + 2 bosses + 3 hidden Abyss stages + full narrative + 6 tools + upgrades Lv4~5 + time-attack ranking). **Phase 1 must deliver a complete game experience on its own.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (see platform-wisdom) ✅
> Items below have been verified across 18~34+ cycles and are detailed in platform-wisdom.md. Only **applied sections** are listed here.

| ID | Lesson Summary | Applied Section |
|----|---------------|----------------|
| F1 | No assets/ directory — 18 consecutive cycles [Cycle 1~34] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] | §5.2 |
| F5 | Guard flags for single-execution tween callbacks [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system [Cycle 3 B2] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save after [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numeric consistency table (spec=code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target min 48×48px + Math.max enforcement [Cycle 12~34] | §3.3 |
| F12 | TDZ prevention: INIT_EMPTY pattern [Cycle 5~34] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path for single values [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gates [Cycle 22~34] | §14.3 |
| F16 | Unified hitTest() function [Cycle 27] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | 100% SeededRNG (zero Math.random) [Cycle 19~34] | §5.2, §14.3 |
| F19 | Procedural SFX + BGM (Web Audio API) [Cycle 19~34] | §12 |
| F20 | i18n support (ko/en) [Cycle 27~34] | §13 |
| F21 | Single beginTransition definition [Cycle 32] | §6.1 |
| F22 | Zero orphaned SVGs [Cycle 32] | §4.1 |

### New Feedback (Cycle #34 Lessons) 🆕

| ID | Lesson | Applied Section | Solution |
|----|--------|----------------|----------|
| F23 | Dual-phase ACTIVE_SYSTEMS matrix separation [Cycle 34/24] | §6.2 | Separate diving/puzzle/boss columns for mutually exclusive management |
| F24 | Separate axes for permanent vs per-run progression [Cycle 34/29] | §9 | Permanent=suit upgrades(survival), Per-run=discovered tools(puzzle access) |
| F25 | DPS/EHP balance formula assumptions + DDA fallback [Cycle 34/24] | §8.2 | "60% player evasion" assumption + 30% trap disable on 3 consecutive deaths |
| F26 | Hybrid procedural generation variation range for replay value [Cycle 33] | §10.2 | Pre-defined base layout + 40~60% randomized traps/items/currents |
| F27 | Boss weakness conditions linked to tool unlock order [Cycle 33] | §10.4 | Tool unlock sequence → biome accessibility map table |
| F28 | Post full-cycle rotation: quality+theme+market 3-axis evaluation [Cycle 34] | §0 | arcade+puzzle longest unused + Level Devil #1 trend + first deep-sea theme |

### Previous Cycle "Regrets" Resolution ⚠️

| Regret (cycle-34) | Resolution Section | Solution | Verification Criteria |
|-------------------|-------------------|----------|----------------------|
| Dual management/combat systems too large (4000+ lines) | §5.3 | Single core loop (dive→breakthrough→escape), no dual system | Code 3300~3800 lines |
| Trade profit vs combat reward balance risk | §8 | Single economy (boss rewards + exploration collection) | Balance variables ≤10 |
| 12-ship unlock combinatorial space too large | §9 | Linear upgrade tree 3 branches × 5 levels | Extreme builds ≤3 |
| Procedural route replay feel concern | §10.2 | 40~60% trap variation + environmental change (current/pressure/light) axes | 0% identical feel across 2 consecutive plays |

---

## §1. Game Overview & Core Fun

### Core Concept
"The deep sea itself is the enemy" — Level Devil's "hostile level" mechanic transplanted to the deep sea, creating an **arcade puzzle platformer where the environment actively sabotages the player**.

### 5 Core Fun Elements
1. **Treacherous Environment**: Safe-looking coral collapses, floors open up, currents suddenly reverse. Constant tension of "Is this floor safe?"
2. **Pressure Dynamics**: Movement speed decreases, jump height changes, and visibility shrinks with depth. Physics itself becomes a puzzle element
3. **Bioluminescence**: Bio-light is the only illumination — lure-lights hide traps while glow patterns hint at safe paths
4. **Tool Puzzles**: Sonar (detect hidden paths), Shock (stun enemies + activate machinery), Flare (illuminate darkness) combinations
5. **Instant Death & Respawn**: Level Devil-style instant death with immediate restart. "One more try" addiction loop

### Reference Analysis (Level Devil → Abyss Diver)

| Level Devil Element | Abyss Diver Adaptation | Differentiation |
|--------------------|----------------------|-----------------|
| Floor collapse | Coral collapse, seafloor fracture | Underwater physics (slow sinking) |
| Wall closing | Cave constriction, giant clam closing | Gap-escape puzzle |
| Control reversal | Pressure control distortion (L/R flip, buoyancy change) | Progressive by depth |
| Jump modification | Buoyancy variation (zero-G → hyper-G) | Linked to oxygen remaining |
| 200 levels | 23 stages (quality density priority) | Boss fights + tool puzzles + narrative |

---

## §2. Game Rules & Objectives

### Ultimate Goal
Reach the core of ancient civilization Abyssos and uncover the secret behind its destruction.

### Stage Goal
Reach the **escape gate (deep-sea gate)** in each stage to clear. Gate position is fixed but trap placement along the route varies via SeededRNG.

### Death Conditions
- Trap contact (instant death): Spike coral, poison jellyfish, hydrothermal vent blast
- Pressure gauge depletion: Depth-dependent pressure deals continuous damage. Upgradeable
- Oxygen depletion: Per-stage time limit (oxygen). Refillable via oxygen bubbles
- Hostile marine life: Anglerfish, electric eels — pattern-based movement

### Stage Structure (5 Biomes × 3 Stages + 5 Bosses + 3 Hidden = 23)

| Biome | Stages | Environment | Key Traps | Boss |
|-------|--------|-------------|-----------|------|
| 1. Coral Garden | 1-1~1-3 | Bright colorful coral, weak currents | Collapsing coral, bubble traps, camouflaged anemone | Anglerfish Monarch |
| 2. Deep Cave | 2-1~2-3 | Darkness + bioluminescence, medium pressure | Cave constriction, stalactite falls, lure-light traps | Giant Octopus Sage |
| 3. Hydrothermal Vents | 3-1~3-3 | High temp, red lighting, strong currents | Hydrothermal geysers, lava flows, rising bubble streams | Volcano Guardian |
| 4. Abyssal Trench | 4-1~4-3 | Near-total darkness, extreme pressure, gravity distortion | Pressure control distortion, black smokers, deep-sea fish attacks | Abyss Jellyfish Queen |
| 5. Abyssos Ruins | 5-1~5-3 | Ancient tech + bioluminescence, puzzle-intensive | Machine traps, rune puzzle locks, gravity reversal | Abyssos Core |
| Hidden: Abyss Fracture | H-1~H-3 | All environmental elements combined | Random compound traps | — |

### Hidden Stage Unlock Conditions
- H-1: Clear all biome 1~3 stages with 50%+ oxygen remaining
- H-2: Clear all biome 4 stages with 0 deaths
- H-3: Collect all 15 civilization clues

---

## §3. Controls

### §3.1 Keyboard
| Key | Action |
|-----|--------|
| ← → (A/D) | Horizontal swim |
| ↑ (W) / Space | Ascend — hold duration proportional to ascent |
| ↓ (S) | Quick dive (rapid descent) |
| Z | Use tool (currently equipped) |
| X | Cycle tool (among unlocked tools) |
| P / Esc | Pause |
| R | Instant restart (stage retry) |

### §3.2 Mouse
| Input | Action |
|-------|--------|
| Click | Move/ascend toward click direction (relative to diver) |
| Right-click | Use tool |
| Scroll up/down | Cycle tool |

### §3.3 Touch (Mobile)
```
Small display (≤480px):
┌──────────────────────────────────────┐
│            Game Area                  │
│                                      │
│                                      │
│  [◀]  [▶]              [Z Tool] [X Swap] │
│      [▼]     [▲ Ascend]              │
└──────────────────────────────────────┘

Large display (>480px):
┌──────────────────────────────────────────────┐
│                 Game Area                      │
│                                              │
│                                              │
│ [◀] [▼] [▶]                   [Z Tool] [X Swap] │
│        [▲ Ascend]                             │
└──────────────────────────────────────────────┘
```

- All touch buttons: `Math.max(48, computedSize)` enforced (F11)
- Unified hitTest() for touch/click processing (F16)
- Virtual D-Pad: thumb-based circular layout, 60% translucent

---

## §4. Visual Style Guide

### §4.1 Asset Principles
- **No assets/ directory** (F1) — all visuals via Canvas procedural drawing + inline SVG data URIs
- **Zero external CDN/fonts** (F2) — system-ui font stack
- **Zero orphaned SVGs** (F22) — unreferenced SVG data removed immediately

### §4.2 Color Palette

| Purpose | Color | HEX | Description |
|---------|-------|-----|-------------|
| Shallow background | Dark teal | `#0A2E4D` | Biome 1 base background |
| Deep background | Abyss navy | `#040D21` | Biome 4~5 base background |
| Bioluminescence | Cyan glow | `#00FFE5` | Safe path hints, UI accent |
| Danger warning | Thermal orange | `#FF6B35` | Traps, danger zones, alerts |
| Creature glow | Purple glow | `#9B59FF` | Hostile creatures, boss aura |
| Coral pink | Coral | `#FF7EB3` | Biome 1 coral decoration |
| Tool UI | Gold | `#FFD700` | Tool icons, collectibles |
| Oxygen gauge | Light blue | `#87CEEB` → `#FF4444` | Gradient by remaining |
| Pressure gauge | Deep purple | `#6A0DAD` → `#FF0000` | Changes with depth |

### §4.3 Background Layers (3-Layer Parallax)
1. **Far**: Seafloor terrain silhouette + floating particles (slow scroll)
2. **Mid**: Coral/cave/vent structures (game speed)
3. **Near**: Bubble particles + dust particles + light scatter effect (fast scroll)

### §4.4 Drawing Function Standard Signatures (F9)
```
drawDiver(ctx, x, y, size, pose, depth, oxygenRatio)
drawTrap(ctx, x, y, type, phase, activated)
drawBoss(ctx, x, y, bossId, hp, phase, animFrame)
drawParticle(ctx, x, y, type, alpha, scale)
drawUI(ctx, state, oxygen, pressure, tools, score, lang)
```
All drawing functions: **zero global variable direct references** — data received via parameters only.

### §4.5 Asset List (Inline SVG Data URI — 25 assets)

| ID | Asset | Size | Purpose |
|----|-------|------|---------|
| A1 | Diver swim (left) | 400×400 | Left movement pose |
| A2 | Diver swim (right) | 400×400 | Right movement pose |
| A3 | Diver ascend | 400×400 | Ascending pose |
| A4 | Diver dive | 400×400 | Quick dive pose |
| A5 | Diver idle | 400×400 | Idle pose |
| A6 | Diver tool use | 400×400 | Tool casting pose |
| A7 | Diver hit | 400×400 | Death sprite |
| A8 | Diver boost | 400×400 | Boost pad contact pose |
| A9 | Boss: Anglerfish Monarch | 600×400 | Biome 1 boss |
| A10 | Boss: Giant Octopus Sage | 600×400 | Biome 2 boss |
| A11 | Boss: Volcano Guardian | 600×400 | Biome 3 boss |
| A12 | Boss: Abyss Jellyfish Queen | 600×400 | Biome 4 boss |
| A13 | Boss: Abyssos Core | 600×400 | Biome 5 final boss |
| A14 | Trap: Spike coral | 400×400 | Instant-death obstacle |
| A15 | Trap: Hydrothermal vent | 400×400 | Geyser |
| A16 | Trap: Lure light | 400×400 | Bioluminescent lure trap |
| A17 | Environment: Collapsing coral | 400×400 | Collapses when stepped on |
| A18 | Environment: Oxygen bubble | 400×400 | Oxygen refill |
| A19 | Environment: Boost pad | 400×400 | Movement acceleration |
| A20 | Tool: Sonar | 400×400 | Reveals hidden paths |
| A21 | Tool: Shock device | 400×400 | Stun enemies / activate machinery |
| A22 | Tool: Flare | 400×400 | Illuminate darkness |
| A23 | UI: Civilization clue | 400×400 | Collectible icon |
| A24 | UI: Deep-sea gate | 400×400 | Stage exit |
| A25 | Thumbnail | 800×600 | Cinematic hero scene: Diver vs Anglerfish standoff |

Each SVG: 10~20KB, compound filter chains (glow+shadow), viewBox 400×400+

---

## §5. Core Game Loop

### §5.1 Initialization Pattern (INIT_EMPTY — F12)
```javascript
// All state variables declared at file top as INIT_EMPTY
let G = null;      // Global game state object
let TW = null;     // TweenManager instance
let SND = null;    // SoundManager instance
let RNG = null;    // SeededRNG instance
let INPUT = null;  // InputManager instance
// ... function calls like resizeCanvas() must come AFTER these declarations
```

### §5.2 Main Loop (60fps requestAnimationFrame)
```
gameLoop(timestamp):
  1. dt = clamp(timestamp - lastTime, 0, 33.33)  // Max 2-frame correction
  2. INPUT.update()                               // Input polling
  3. TW.update(dt)                                // Tween update (clearImmediate F13)
  4. updateState(dt)                              // Per-state logic branching
     ├─ TITLE: Title animation, menu input
     ├─ MAP: Biome selection, stage selection
     ├─ DIVING: Physics+collision+traps+environment+O2/pressure
     ├─ PUZZLE: Puzzle element interaction (tool use)
     ├─ BOSS: Boss patterns + weakness exploitation
     ├─ CUTSCENE: Boss entrance/clear cinematics
     ├─ UPGRADE: Dive suit upgrade tree
     ├─ GAMEOVER: Death animation + instant retry
     ├─ VICTORY: Stage/biome clear animation
     ├─ PAUSE: Pause menu
     └─ MODAL: Canvas-based confirm dialog (F3)
  5. render(ctx, G, timestamp)                    // Rendering
  6. lastTime = timestamp
  7. requestAnimationFrame(gameLoop)
```

**Rules**:
- Zero setTimeout (F4) — all delays via tween onComplete
- Guard flags for single execution (F5): `if (G.stageClearing) return;`
- Single update path per value (F14): pressure/oxygen/depth use tween OR direct update, never both
- 100% SeededRNG (F18): zero `Math.random()`

### §5.3 Code Region Guide (10 REGIONS)
```
REGION 1: Constants & Config (CONFIG object)     L1~L200
REGION 2: Utilities, RNG, Tween, Sound           L201~L500
REGION 3: Asset Data (inline SVG)                L501~L800
REGION 4: Input System (keyboard/mouse/touch)    L801~L1000
REGION 5: Physics & Collision Engine             L1001~L1400
REGION 6: Trap & Environment System              L1401~L1800
REGION 7: Boss AI & Boss Battle Logic            L1801~L2100
REGION 8: Level Generation & Procedural          L2101~L2500
REGION 9: UI, Rendering, HUD                     L2501~L3000
REGION 10: State Machine, Main Loop, Init        L3001~L3500
```

**Dependency direction**: R2→R1 only, R3→R1 only, R4→R1~R2, R5→R1~R2, R6→R1~R5, R7→R1~R6, R8→R1~R5, R9→R1~R3, R10→all. No circular references.

---

## §6. Game State Machine

### §6.1 State List & Transition Rules

```
BOOT → TITLE → MAP → STAGE_INTRO → DIVING ↔ PUZZLE
                                      ↓         ↓
                                   BOSS ← ──────┘
                                      ↓
                               CUTSCENE → VICTORY → MAP
                                      ↓
                                  GAMEOVER → (instant retry → DIVING)
                                      ↓
                                   TITLE

From anywhere: → PAUSE → (return)
From anywhere: → MODAL → (return)
From MAP:      → UPGRADE → MAP
```

**STATE_PRIORITY** (F6): GAMEOVER(100) > BOSS(80) > CUTSCENE(70) > DIVING(50) > PUZZLE(50) > VICTORY(40) > MAP(30) > UPGRADE(20) > TITLE(10) > BOOT(0)

**Single beginTransition definition** (F21): All state transitions go through `beginTransition(fromState, toState, duration)`. Only PAUSE is exempted (instant transition mode: `beginTransition(current, 'PAUSE', 0)`).

### §6.2 State × System Matrix (ACTIVE_SYSTEMS) (F7)

| State | Tween | Physics | Traps | Boss | Puzzle | O2/Pressure | Particles | Input | Sound | Render |
|-------|-------|---------|-------|------|--------|-------------|-----------|-------|-------|--------|
| BOOT | — | — | — | — | — | — | — | — | — | splash |
| TITLE | ✅ | — | — | — | — | — | ✅ bg | menu | ✅ bgm | ✅ |
| MAP | ✅ | — | — | — | — | — | ✅ bg | map | ✅ bgm | ✅ |
| STAGE_INTRO | ✅ | — | — | — | — | — | ✅ | skip | ✅ | ✅ |
| DIVING | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | game | ✅ sfx | ✅ |
| PUZZLE | ✅ | limited | — | — | ✅ | ✅ (slowed) | ✅ | puzzle | ✅ sfx | ✅ |
| BOSS | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | game | ✅ boss | ✅ |
| CUTSCENE | ✅ | — | — | — | — | — | ✅ | skip | ✅ | ✅ |
| GAMEOVER | ✅ | — | — | — | — | — | ✅ death | retry | ✅ | ✅ |
| VICTORY | ✅ | — | — | — | — | — | ✅ celebr | menu | ✅ | ✅ |
| UPGRADE | ✅ | — | — | — | — | — | ✅ bg | upgrade | ✅ | ✅ |
| PAUSE | ✅ | — | — | — | — | — | — | pause | — | ✅ dim |
| MODAL | ✅ | — | — | — | — | — | — | modal | — | ✅ dim |

**Input mode granularity** (F23/Cycle 26):
- `menu`: Arrow key selection + Enter/click confirm
- `map`: Biome/stage selection + scroll
- `game`: Full controls (movement + tools)
- `puzzle`: Limited controls (tools + direction)
- `skip`: Any key to skip
- `retry`: R key instant retry + Enter for menu
- `upgrade`: Upgrade tree navigation + confirm
- `pause`/`modal`: Menu navigation + Enter/Esc

### §6.3 DIVING ↔ PUZZLE Transition
Entering specific environmental puzzle zones (tool-activated locks, etc.) transitions to PUZZLE state. Physics engine runs in `limited` mode (buoyancy only, currents/traps disabled). O2/Pressure updates at 50% speed. Puzzle completion returns to DIVING.

### §6.4 Canvas Modal (F3)
Absolutely no `confirm()`/`alert()` usage. All confirmation dialogs as Canvas overlays:
```
┌────────────────────────────┐
│   Return to title?          │
│                            │
│   [Yes (Enter)]  [No (Esc)] │
└────────────────────────────┘
```

---

## §7. Core Systems Detail

### §7.1 Underwater Physics Engine

#### §7.1.1 Base Physics
```
Horizontal: vx += inputDir * SWIM_ACCEL * depthFactor
Horizontal drag: vx *= WATER_DRAG (0.92)
Vertical (buoyancy): vy += GRAVITY - BUOYANCY * buoyancyMod
Ascend: vy -= SWIM_UP_FORCE * holdDuration (max MAX_UP_FORCE)
Quick dive: vy += DIVE_FORCE
```

**Depth Factor (depthFactor)**: Decreases as depth increases
```
depthFactor = max(0.4, 1.0 - depth * DEPTH_DRAG_COEFF)
```

#### §7.1.2 Current System
Each stage has 0~3 current zones. Currents defined by direction + strength:
```
currentForce = { dx: float, dy: float, strength: 0.0~1.0 }
// When diver position is within current zone:
vx += currentForce.dx * currentForce.strength * dt
vy += currentForce.dy * currentForce.strength * dt
```
- Current direction slowly shifts over time (sinewave-based)
- Biome 3 (vents): strong upward currents; Biome 4 (trench): turbulent (random direction changes)

#### §7.1.3 Collision Detection
AABB-based tilemap collision + circle collision (creatures):
```
tileCollision(entity, tilemap) → { top, bottom, left, right, resolved }
circleCollision(entityA, entityB) → { hit, normal, depth }
```
All collision functions are pure — zero global references (F9).

### §7.2 Trap System

| Trap Type | Visual Hint | Activation | Effect | Biomes |
|-----------|-------------|------------|--------|--------|
| Collapsing coral | Micro-vibration (0.5s warning) | 0.3s after diver contact | Floor vanishes → fall | 1~3 |
| Spike coral | Red glow | Always active | Instant death | All |
| Poison jellyfish | Purple glow + slow drift | Proximity 1.5 tiles | Instant death | 2~5 |
| Giant clam | Slow open/close pattern | Timing miss | Instant death (closes) | 1~2 |
| Hydrothermal geyser | Floor bubbles (2s cycle) | Periodic eruption | Instant death (during blast) / updraft (weak) | 3 |
| Lure light | Beautiful cyan glow | On approach | Activates nearby traps | 2~4 |
| Stalactite | Ceiling crack | Diver passes below | Falls → collision death | 2~3 |
| Pressure distortion zone | Ripple effect | On entry | Control reversal 3s | 4~5 |
| Black smoker | Black smoke | Always active | Vision blocked + contact death | 4 |
| Ancient machine trap | Rune glow | Pattern miss | Laser grid instant death | 5 |

### §7.3 Environment Change System

| Biome | Effect | Gameplay Impact | Values |
|-------|--------|----------------|--------|
| 1. Coral Garden | Tidal change | Water level up/down → accessible area changes | ±2 tiles / 15s cycle |
| 2. Deep Cave | Glow flickering | Periodic visibility change (bright↔dark) | 3s bright / 2s dark |
| 3. Hydrothermal Vents | Temperature rise | O2 consumption 1.5× accelerated | O2 drain ×1.5 |
| 4. Abyssal Trench | Pressure surge | Movement 40% slower + visibility 50% reduced | depthFactor 0.6→0.4 |
| 5. Abyssos Ruins | Gravity reversal | Some zones reverse buoyancy (up=down) | BUOYANCY × -1 |

### §7.4 Tool System

| Tool | Unlock Condition | Effect | Cooldown | Biome Link |
|------|-----------------|--------|----------|------------|
| Sonar | Boss 1 defeated | 2s reveal hidden paths/items (5-tile radius) | 8s | Biome 2 required (hidden passages) |
| Shock device | Boss 2 defeated | 3s stun nearby creatures (2-tile) + activate machinery | 10s | Biome 3 required (machine doors) |
| Flare | Boss 3 defeated | 5s forward illumination (8-tile radius) | 12s | Biome 4 required (dark navigation) |
| Pressure shield | Boss 4 defeated | 4s pressure damage immunity | 15s | Biome 5 required (extreme pressure zones) |
| Gravity anchor | Biome 5 cleared | 3s gravity lock (nullifies reversal zones) | 10s | Useful for hidden stages |
| Time slow | Hidden H-1 cleared | 3s 50% environment slowdown | 20s | Useful for H-2~H-3 |

### §7.5 Boss Battle Details

#### Boss 1: Anglerfish Monarch (Biome 1)
```
Phase 1 (HP 100%~60%): Lure Attack — generates 3 fake exits, 1 real exit
  Weakness: Rush to real exit (observe glow pattern puzzle)
Phase 2 (HP 60%~20%): Charge + Lure — predict charge path, dodge
  Weakness: 3s stun after wall collision → approach attack
Phase 3 (HP 20%~0%): Rage — 5 lure lights + continuous charges
  Weakness: Same wall-stun bait, reduced timing window (1.5s)
```

#### Boss 2: Giant Octopus Sage (Biome 2)
```
Phase 1: Ink Darkness — 50% vision block, 4 tentacles pattern movement
  Weakness: Safe timing between tentacles to approach body
Phase 2: Cave Constriction — arena shrinks + 8 tentacles
  Weakness: Sonar (if unlocked) to detect weak spot → approach
Phase 3: Camouflage — blends with background, only tentacles attack
  Weakness: Identify differently-glowing camouflaged section
```

#### Boss 3: Volcano Guardian (Biome 3)
```
Phase 1: Vent Eruption — 6 random floor geysers
  Weakness: Observe geyser pattern → attack from safe tile post-eruption
Phase 2: Lava Wave — lava flows from left/right
  Weakness: Shock device (if unlocked) to activate cooling system → create path
Phase 3: Explosive Core — central core exposed + lava from all directions
  Weakness: Chain cooling systems to secure core approach path
```

#### Boss 4: Abyss Jellyfish Queen (Biome 4)
```
Phase 1: Electric Curtain — electric tentacle network partitions arena
  Weakness: Pass through intersection flicker timing
Phase 2: Fission — spawns 12 mini-jellyfish, queen moves in darkness
  Weakness: Flare (if unlocked) to expose queen's position → navigate through mini-jellyfish
Phase 3: Current Storm — full arena electric patterns
  Weakness: Observe safe current path (sinewave pattern) → timed approach
```

#### Boss 5: Abyssos Core (Biome 5 — Final Boss)
```
Phase 1: Ancient Machine — rune laser grid + gravity reversal
  Weakness: Pressure shield (if unlocked) for high-pressure path → rune deactivation puzzle
Phase 2: Dimensional Rift — randomly summons traps from previous biomes
  Weakness: Use all tools situationally (compound exploitation)
Phase 3: Heart of Civilization — deactivate 4 cores in sequence
  Weakness: Each core requires specific tool (Sonar→Shock→Flare→Shield)
Phase 4: Final Stand — all 4 cores reactivate simultaneously, 30s time limit
  Weakness: Reverse-order deactivation (Shield→Flare→Shock→Sonar) rapid execution
```

**bossRewardGiven flag pattern** (F17): Boss rewards (tool unlocks) use `bossRewardGiven[bossId] = true` to prevent duplicate grants.

---

## §8. Difficulty System

### §8.1 3-Phase Balance Table

| Phase | Biome | O2 Time | Trap Density | Trap Speed | Pressure Dmg | Current Str |
|-------|-------|---------|-------------|-----------|-------------|------------|
| Early | 1~2 | 90s/60s | 3~5/screen | ×1.0 | 0/low | Weak (0.2) |
| Mid | 3 | 50s | 5~7/screen | ×1.3 | Medium (2/s) | Med (0.5) |
| Late | 4~5 | 40s/35s | 7~10/screen | ×1.6 | High (4/s) | Strong (0.8) |
| Hidden | H-1~3 | 30s | 10+/screen | ×2.0 | Extreme (6/s) | Turbulent |

### §8.2 Balance Formula & Assumptions

**Survival Time Formula**:
```
survivalTime = oxygenTime / (1 + pressureDrain + environmentMod)
requiredClearTime = stageLength / (swimSpeed * depthFactor)
Balance condition: survivalTime > requiredClearTime * 1.3 (30% margin)
```

**Assumptions** (F25):
- Player evasion rate: Early 70%, Mid 55%, Late 40%
- Oxygen bubble collection rate: 60%
- Tool usage efficiency: 50% (unused during cooldown ratio)

**DDA Fallback** (on 3 consecutive deaths):
1. 30% traps disabled (visually dimmed)
2. +20% oxygen bonus
3. On 5 consecutive deaths: Additional 50% pressure damage reduction
4. On 10 consecutive deaths: "Ghost path" hint displayed (safe path dotted line)

### §8.3 Extreme Build Balance Verification (see Appendix A)

| Build | Upgrade Focus | Biome 5-3 Survival | Clearable? |
|-------|-------------|-------------------|------------|
| Pressure-all | Pressure Lv5, Speed Lv1, Detect Lv1 | 52s (pressure immune) | ✅ Needs 45s |
| Speed-all | Pressure Lv1, Speed Lv5, Detect Lv1 | 28s (fast but pressure-weak) | ⚠️ Borderline (needs 25s, evasion-dependent) |
| Detect-all | Pressure Lv1, Speed Lv1, Detect Lv5 | 35s (100% trap awareness) | ✅ Needs 35s (100% trap awareness) |

→ Speed-all build most risky but compensated by DDA fallback. All builds verified clearable.

---

## §9. Permanent Progression System

### §9.1 Dive Suit Upgrade Tree (Permanent — Survival Axis)

Upgrade points: Boss defeat (5pt) + Stage clear (1pt) + Civilization clue (2pt)

```
      [Pressure Resist]        [Propulsion]            [Detection]
  Lv1: Pressure resist +20%   Lv1: Swim speed +10%    Lv1: Trap warning range +1
  Lv2: Pressure resist +40%   Lv2: Swim speed +20%    Lv2: Trap warning range +2
  Lv3: Pressure resist +70%   Lv3: Boost time +1s     Lv3: Show hidden items
  Lv4: Pressure immune 3s CD  Lv4: Dive invuln 0.5s   Lv4: Boss weakness highlight
  Lv5: Pressure zone slow imm Lv5: Wall climb+ceiling  Lv5: Permanent minimap
```

Cost: Lv1(3pt), Lv2(5pt), Lv3(8pt), Lv4(12pt), Lv5(18pt)
Total needed: 46pt × 3 branches = 138pt (full clear yields ~80pt → focus 1~2 branches strategy)

### §9.2 Tool Unlocks (Per-Progression — Puzzle Access Axis) (F24)
Tools are permanently unlocked via boss defeats. No per-run variation — permanent progression (upgrades) and tool unlocks **strengthen different axes (survival vs puzzle accessibility)**, maintaining complementary relationship (F24).

### §9.3 Civilization Clue Codex
15 civilization clues unlock Abyssos story fragments:
- 3 per biome × 5 biomes = 15 total
- Clue positions are fixed but approach route traps vary (SeededRNG)
- Full collection unlocks Hidden H-3 + True Ending

---

## §10. Level Generation System

### §10.1 Hybrid Generation Strategy (F26)
- **Base layout**: Each stage's terrain tilemap is **pre-defined** (15+5+3=23 manually designed)
- **Variation elements** (SeededRNG 40~60% randomized):
  - Trap placement: 40~60% of candidate positions activated
  - Oxygen bubble positions: Random selection from candidates
  - Current direction/strength: Sinewave phase randomized
  - Hostile creature paths: Waypoint-based path variation

### §10.2 Reachability Verification (BFS)
Mandatory BFS verification after level generation:
```
1. Start position → Exit gate path exists
2. Civilization clue positions → Accessible
3. At least 1 oxygen bubble on path (biome 3+ required)
4. On failure → Deactivate 1 trap at a time, re-verify (max 3 attempts)
5. After 3 failures → Use original base layout (0% trap variation)
```

### §10.3 Seed System
```
stageSeed = baseSeed XOR (biome * 1000 + stage * 100 + attemptCount)
```
- `baseSeed`: Generated from `Date.now()` at game start
- `attemptCount`: Attempts on that stage (varies per retry)
- Time-attack mode: Fixed seed for fair competition

### §10.4 Tool Unlock Sequence → Biome Accessibility Map (F27)

| Biome | Required Tool | Unlock Condition | Accessible When |
|-------|-------------|------------------|----------------|
| 1. Coral Garden | None | Game start | Immediately |
| 2. Deep Cave | None (Sonar recommended) | Biome 1 cleared | After Boss 1 defeat |
| 3. Hydrothermal Vents | Sonar (hidden bypass) | Biome 2 cleared | After Boss 2 defeat |
| 4. Abyssal Trench | Shock + Flare | Biome 3 cleared | After Boss 3 defeat |
| 5. Abyssos Ruins | Pressure Shield | Biome 4 cleared | After Boss 4 defeat |
| Hidden H-1~H-3 | All tools + special conditions | See §2 | Conditional |

**Verification**: Each biome boss must be defeatable with tools available at that point.
- Boss 1: Defeatable without tools (pure observation + evasion)
- Boss 2: Defeatable without Sonar (higher observation difficulty)
- Boss 3: Shock device required (cooling system activation)
- Boss 4: Flare required (queen location in darkness)
- Boss 5: All 4 tools required (Phase 3 core deactivation)

---

## §11. Score System

### §11.1 Score Elements

| Item | Points | Notes |
|------|--------|-------|
| Stage clear | 1000 × biome number | Biome 1=1000, 5=5000 |
| Remaining O2 bonus | Remaining seconds × 50 | Fast clear reward |
| Deathless bonus | +2000 | Zero deaths on stage |
| Civilization clue | +500/each | In-stage clue |
| Boss defeat | 5000 × biome number | Boss 5=25000 |
| Boss no-hit | +10000 | Zero hits during boss fight |
| Hidden stage | +15000/each | H-1, H-2, H-3 |
| Time-attack bonus | (target time - clear time) × 100 | 0 if negative |

**Judge first, save after** (F8):
```javascript
const isNewBest = score > getBestScore(stageId);  // Judge
saveBestScore(stageId, score);                     // Save
if (isNewBest) showNewRecord();                    // Display
```

### §11.2 localStorage Schema
```json
{
  "abyss-diver-v1": {
    "upgrades": { "pressure": 0, "speed": 0, "detect": 0 },
    "tools": [false, false, false, false, false, false],
    "clues": [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    "bestScores": { "1-1": 0, "1-2": 0, ... },
    "bossDefeated": [false, false, false, false, false],
    "hiddenUnlocked": [false, false, false],
    "totalPoints": 0,
    "settings": { "lang": "ko", "sfxVol": 0.7, "bgmVol": 0.5 }
  }
}
```

---

## §12. Sound System (Web Audio API Procedural)

### §12.1 BGM (4 Loop Tracks)
| Track | Context | Characteristics |
|-------|---------|----------------|
| BGM-Title | Title/Map | Mysterious ambient, low drone + piano arpeggio |
| BGM-Dive | Exploration (Biomes 1~3) | Underwater ambience, slow pad + bubble rhythm |
| BGM-Deep | Abyss (Biomes 4~5) | Tense minimal, low pulse + uneasy harmonics |
| BGM-Boss | Boss battle | Fast arpeggio + drum beat + tension escalation |

### §12.2 SFX (10 Effects)
| ID | Effect | Generation |
|----|--------|-----------|
| SFX-Swim | Swimming movement | Filtered white noise (low-pass) |
| SFX-Bubble | Bubble | Sine wave pitch down (800→200Hz, 0.2s) |
| SFX-Trap | Trap activation | Sawtooth distortion (200Hz, 0.15s) |
| SFX-Death | Death | Noise burst + low impact |
| SFX-Tool | Tool use | Triangle sweep (400→1200Hz, 0.3s) |
| SFX-Collect | Item collection | Sine 2-note (C5→E5, 0.15s) |
| SFX-BossAppear | Boss entrance | Low drone rise (40→120Hz, 2s) + reverb |
| SFX-Gate | Gate unlock | Triangle 3-note ascending (C4→E4→G4) |
| SFX-Pressure | Pressure warning | Pulse wave repeat (100Hz, 0.1s intervals) |
| SFX-Sonar | Sonar ping | Sine ping (1200Hz→400Hz, 0.5s) + echo |

All sounds: `oscillator.start(ctx.currentTime + delay)` native scheduling (zero setTimeout).

---

## §13. Internationalization (ko/en) (F20)

See Korean spec §13 for full LANG object. Both languages supported with `navigator.language` auto-detection and manual toggle in settings.

---

## §14. Code Hygiene & Verification

### §14.1 Numeric Consistency Table (F10)

| Spec Value | CONFIG Constant | Unit |
|-----------|----------------|------|
| O2 Biome 1: 90s | `CONFIG.O2_TIME[0] = 90` | seconds |
| O2 Biome 5: 35s | `CONFIG.O2_TIME[4] = 35` | seconds |
| Pressure Dmg Biome 3: 2/s | `CONFIG.PRESS_DMG[2] = 2` | HP/s |
| Pressure Dmg Biome 5: 4/s | `CONFIG.PRESS_DMG[4] = 4` | HP/s |
| Current Str Biome 1: 0.2 | `CONFIG.CURRENT_STR[0] = 0.2` | coefficient |
| Current Str Biome 5: 0.8 | `CONFIG.CURRENT_STR[4] = 0.8` | coefficient |
| Collapse warn: 0.5s | `CONFIG.COLLAPSE_WARN = 0.5` | seconds |
| Collapse delay: 0.3s | `CONFIG.COLLAPSE_DELAY = 0.3` | seconds |
| Min depthFactor: 0.4 | `CONFIG.MIN_DEPTH_FACTOR = 0.4` | coefficient |
| Touch target min: 48px | `CONFIG.MIN_TOUCH = 48` | px |
| DDA trigger: 3 consecutive deaths | `CONFIG.DDA_TRIGGER = 3` | count |
| DDA trap disable: 30% | `CONFIG.DDA_TRAP_DISABLE = 0.3` | ratio |

### §14.2 Code Hygiene Checklist

| Item | Verification | FAIL/WARN |
|------|-------------|-----------|
| Zero `Math.random()` | grep `Math.random` | FAIL |
| Zero `setTimeout`/`setInterval` | grep `setTimeout\|setInterval` | FAIL |
| Zero `confirm()`/`alert()`/`prompt()` | grep `confirm\|alert\|prompt` | FAIL |
| No `assets/` directory | ls assets/ | FAIL |
| Zero external CDN/Google Fonts | grep `googleapis\|cdnjs\|unpkg` | FAIL |
| Zero global direct-reference functions | Inspect drawing/physics/collision functions | FAIL |
| Zero unused variables/functions | ESLint no-unused-vars | WARN |
| Zero ASSET_MAP/SPRITES/preloadAssets code | grep `ASSET_MAP\|SPRITES\|preloadAssets` | FAIL |
| Zero orphaned SVG data | Cross-reference SVGs in code | FAIL |
| CONFIG values = Spec values | §14.1 table cross-check | FAIL |
| Touch targets ≥48px | `Math.max(CONFIG.MIN_TOUCH` check | FAIL |
| gameLoop try-catch wrapping | grep `try.*gameLoop\|catch` | WARN |
| Single beginTransition definition | grep `function beginTransition` = 1 | FAIL |
| STATE_PRIORITY defined | grep `STATE_PRIORITY` | FAIL |
| SeededRNG class exists | grep `class SeededRNG` | FAIL |

### §14.3 Smoke Test Gates (F15)

**FAIL (mandatory — cannot submit for review if not passed)**:
1. `index.html` exists + browser load succeeds (no blank screen)
2. BOOT → TITLE transition normal
3. TITLE → MAP → STAGE_INTRO → DIVING full flow works
4. DIVING state: movement/ascend/dive functional
5. Trap contact triggers GAMEOVER + instant retry (R key) works
6. GAMEOVER → TITLE return normal
7. Pause (P/Esc) works + resume
8. Tool use (Z) + swap (X) functional
9. Boss entry + phase transition + defeat functional
10. localStorage save/load normal

**WARN (recommended — warning if not passed)**:
11. Touch buttons ≥ 48×48px
12. Language toggle (ko↔en) functional
13. DDA fallback works (3 consecutive deaths → trap disable)
14. All bosses clearable without tools at entry (except bosses 3~5)
15. Thumbnail SVG ≥ 20KB exists
16. Code ≥ 3300 lines

---

## §15. Camera & Cinematic System

### §15.1 Base Camera
- **Follow camera**: Diver-centered, smooth lerp (0.08)
- **Dead zone**: No camera movement within central 40% area
- **Boundary clamp**: Prevent camera from exceeding level bounds

### §15.2 Camera Zoom/Pan Cinematics
| Situation | Zoom Level | Pan Target | Duration |
|-----------|-----------|------------|----------|
| Boss entrance | 0.7→1.0 (zoom in) | Boss → Diver | 3s |
| Boss defeat | 1.0→0.6 (zoom out) | Full arena | 2s |
| Stage start | 0.5→1.0 | Exit gate → Diver | 2s |
| Clue found | 1.0→1.3 (zoom in) | Clue position | 1.5s |
| Hidden unlock | 1.0→0.5→1.0 | Unlock position | 3s |

### §15.3 Depth-Based Visual Effects
| Depth (Biome) | Background Color | Visibility | Particle Effects |
|--------------|-----------------|-----------|-----------------|
| 1. Coral Garden | `#0A2E4D` bright teal | 100% | Bubbles + light rays |
| 2. Deep Cave | `#071D36` mid navy | 70% | Glow dots + bubbles |
| 3. Hydrothermal Vents | `#1A0A0A` dark red | 60% | Heat bubbles + volcanic ash |
| 4. Abyssal Trench | `#040D21` near black | 40% | Faint bioluminescence only |
| 5. Abyssos Ruins | `#0D0A2E` purple dark | 50% (rune glow) | Ancient energy particles |

---

## §16. Story/Narrative

### §16.1 Background
An advanced civilization called "Abyssos" thrived on the ocean floor tens of thousands of years ago before suddenly vanishing. The player, a marine archaeologist, discovers the entrance to the Abyssos ruins and begins diving to uncover the secret behind the civilization's destruction.

### §16.2 Per-Biome Narrative Clues

| Biome | Clue Theme | Decoded Content (Brief) |
|-------|-----------|----------------------|
| 1. Coral Garden | Daily life | "Abyssians used bioluminescence as an energy source" |
| 2. Deep Cave | Technology | "They developed tech to convert deep-sea pressure into power" |
| 3. Hydrothermal Vents | Crisis | "Excessive geothermal harvesting destabilized the ocean crust" |
| 4. Abyssal Trench | End | "The core energy device went haywire, causing seaquakes" |
| 5. Abyssos Ruins | Legacy | "Shutting down the core will eliminate current deep-sea dangers" |

### §16.3 Environmental Storytelling Mapping
| Visual Effect | Narrative Meaning |
|--------------|-------------------|
| Bioluminescence brightness | Remaining Abyssos energy visualization |
| Current direction | Core energy device pulsation |
| Ancient machinery operation | Remnant automated defense system |
| Pressure increase | Core device haywire radius |
| Boss appearance | Abyssos bio-weapons / guardians |

---

## §17. Game Page Sidebar Data

```yaml
game:
  title: "Abyss Diver"
  description: "A deep-sea arcade puzzle uncovering an ancient underwater civilization. Survive hostile ocean environments and defeat bosses across 5 biomes!"
  genre: ["arcade", "puzzle"]
  playCount: 0
  rating: 0
  controls:
    - "← → / A D: Swim"
    - "↑ / W / Space: Ascend"
    - "↓ / S: Quick Dive"
    - "Z: Use Tool"
    - "X: Swap Tool"
    - "R: Instant Restart"
    - "P / Esc: Pause"
    - "Touch: Virtual D-Pad + Buttons"
  tags:
    - "#DeepSea"
    - "#HostileEnvironment"
    - "#PuzzlePlatformer"
    - "#BossFight"
    - "#Procedural"
    - "#RageGame"
    - "#Bioluminescence"
    - "#AncientCivilization"
  addedAt: "2026-03-24"
  version: "1.0.0"
  featured: true
```

---

## Appendix A: Extreme Build Balance Detailed Verification

### A.1 Pressure-All Build
```
Pressure Lv5: Pressure zone slow immunity
Speed Lv1: +10%
Detect Lv1: Trap warning +1

Biome 5-3 Simulation:
- Oxygen: 35s
- Pressure damage: Immune (Lv5 trait)
- Swim speed: baseSpeed × 1.1 × 0.4(depth) = 0.44 base
  → Lv5 immunity ignores depthFactor = 1.1 base
- Stage length: 45s baseline (at 1.0 speed)
- Actual needed: 45 / 1.1 = 40.9s
- Oxygen 35s < needed 40.9s → ❌?
  → O2 bubbles ×2 (+10s each) = 55s effective
  → 55 - 40.9 = 14.1s margin ✅
```

### A.2 Speed-All Build
```
Pressure Lv1: +20%
Speed Lv5: Wall climb + ceiling movement
Detect Lv1: Trap warning +1

Biome 5-3 Simulation:
- Oxygen: 35s
- Pressure damage: 4/s × 0.8(Lv1 mod) = 3.2/s → Pressure HP 100 → 31.25s survival
- Swim speed: Very fast + wall climb shortcuts
- Stage length: 45s baseline → 30s with wall climb
- 31.25s > 30s → ✅ (borderline)
- With DDA fallback: Pressure 50% = 1.6/s → 62.5s survival → ✅ safe
```

### A.3 Detect-All Build
```
Pressure Lv1: +20%
Speed Lv1: +10%
Detect Lv5: Permanent minimap + all traps/items visible

Biome 5-3 Simulation:
- All traps pre-identified → evasion rate 90%+ (assumption 40% → 90%)
- All O2 bubble locations known → collection rate 95%
- Oxygen: 35s + 3 bubbles × 10s = 65s
- Swim speed: 1.1 × 0.4 = 0.44 base → needs 102s?
  → Minimap optimal pathing → actual ~55s needed
- 65s > 55s → ✅ (18% margin)
```

---

## Appendix B: Boss Phase Transition ASCII Diagrams

```
[Boss 1: Anglerfish Monarch]
HP 100% ──── Phase 1 (Lure)    ────> HP 60%
HP  60% ──── Phase 2 (Charge)  ────> HP 20%
HP  20% ──── Phase 3 (Rage)    ────> HP  0% → VICTORY

[Boss 2: Giant Octopus Sage]
HP 100% ──── Phase 1 (Ink)     ────> HP 60%
HP  60% ──── Phase 2 (Constrict)──> HP 25%
HP  25% ──── Phase 3 (Camouflage)─> HP  0% → VICTORY

[Boss 3: Volcano Guardian]
HP 100% ──── Phase 1 (Erupt)   ────> HP 55%
HP  55% ──── Phase 2 (Lava)    ────> HP 20%
HP  20% ──── Phase 3 (Core)    ────> HP  0% → VICTORY

[Boss 4: Abyss Jellyfish Queen]
HP 100% ──── Phase 1 (Electric)────> HP 60%
HP  60% ──── Phase 2 (Fission) ────> HP 25%
HP  25% ──── Phase 3 (Storm)   ────> HP  0% → VICTORY

[Boss 5: Abyssos Core]
HP 100% ──── Phase 1 (Machine) ────> HP 70%
HP  70% ──── Phase 2 (Rift)    ────> HP 40%
HP  40% ──── Phase 3 (Heart)   ────> HP 15%
HP  15% ──── Phase 4 (Final)   ────> HP  0% → TRUE ENDING
```
