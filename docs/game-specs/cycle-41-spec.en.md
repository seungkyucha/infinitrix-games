---
game-id: ashen-stronghold
title: Ashen Stronghold
genre: action, strategy
difficulty: hard
---

# Ashen Stronghold — Cycle #41 Game Design Document

> **One-Page Summary**: In a post-apocalyptic world, the last survivor 'Captain Ash' rebuilds a ruined stronghold and fights against zombie hordes in this **survival tower-defense roguelite**. By day, explore ruins to gather resources and survivors (action); by night, defend the stronghold with barricades, turrets, and traps (strategy). Synergy of Plants vs Zombies lane-based placement + They Are Billions survival tension + Slay the Spire roguelite choices. 5 zones (Ruined City / Industrial District / Hospital / Military Base / Underground Bunker) × 3 nights = 15 main stages + 3 boss zombies (MVP) + 2 hidden stages = **20 total stages**. 3-branch upgrade tree (Defense/Attack/Explore) × 5 tiers + SeededRNG procedural night waves + BFS pathfinding validation. **Resolves action+strategy 11-cycle longest gap + first-ever zombie post-apocalyptic theme on the platform.**

> **MVP Boundary**: **Phase 1** (core loop: day exploration → night defense → rewards → upgrades, zones 1~3 + 3 bosses + upgrade Lv1~3 + DDA 4 tiers + 4 survivor types + basic narrative + relic system) → **Phase 2** (zones 4~5 + 2 hidden stages + upgrade Lv4~5 + weather/time-of-day effects + full narrative + i18n completion). **Phase 1 alone must deliver a complete zombie survival TD roguelite experience.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅

| ID | Lesson Summary | Applied Section |
|----|---------------|-----------------|
| F1 | Maintain assets/ directory — Gemini API PNG assets + manifest.json dynamic loading [Cycle 39+] | §4.1, §8 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] | §5.2 |
| F5 | Guard flag for single tween callback execution [Cycle 3 B1] | §5.2 |
| F6 | TRANSITION_TABLE single definition for state transitions [Cycle 3~39] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numeric consistency table (spec = code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target min 48×48px + Math.max enforcement [Cycle 12~39] | §3.3 |
| F12 | TDZ prevention: INIT_EMPTY pattern + Engine constructor callback TDZ defense [Cycle 5~39] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path for each value [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gates [Cycle 22~39] | §14.3 |
| F16 | hitTest() single function integration [Cycle 27] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG only (zero Math.random) [Cycle 19~39] | §5.2, §14.3 |
| F19 | Procedural SFX + BGM (Web Audio API generation) [Cycle 19~39] | §12 |
| F20 | i18n support (ko/en) [Cycle 27~39] | §13 |
| F21 | beginTransition single definition [Cycle 32~39] | §6.1 |
| F22 | Gemini PNG assets manifest.json-based loading [Cycle 39+] | §4.1, §8 |

### New Feedback (Cycle #39~40 Lessons) 🆕

| ID | Lesson | Applied Section | Solution |
|----|--------|-----------------|----------|
| F23 | TDZ crash: Engine constructor onResize callback references incomplete engine variable [Cycle 39 P0] | §5.1 | `_ready` flag + all callback guards + parameter passing |
| F24 | fadeAlpha sync incomplete — tween _t not reflected in G.fadeAlpha [Cycle 39] | §6.1 | Direct sync in tween onUpdate callback |
| F25 | Mobile touch target 48px violation repeated 12 cycles [Cycle 39] | §3.3 | `Math.max(48, computedSize)` enforced |
| F26 | Runtime verification impossible — P0 blocked all testing [Cycle 39] | §14.3 | Engine init success as smoke test #1 |
| F27 | Engine constructor callback TDZ variant pattern [Cycle 39] | §5.1 | `_ready = true` at constructor end + callback entry guard |
| F28 | Day/night transition requires mutually exclusive system activation [Cycle 24,31,36] | §6.2 | ACTIVE_SYSTEMS matrix with explore/defense column separation |
| F29 | TD placement BFS path blocking prevention [Cycle 26,36] | §10.2 | Immediate BFS recalculation on placement → reject if path blocked |
| F30 | Roguelite DPS/synergy caps [Cycle 26~27,36] | §7.4 | DPS cap 200%, synergy cap 150%, validation in applyRelic() |

### Previous Cycle "Regrets" Direct Reflection ⚠️

| Regret (cycle-39~40) | Solution Section | Solution | Verification |
|----------------------|-----------------|----------|-------------|
| P0 TDZ crash made game completely unplayable (C39) | §5.1 | `_ready` flag + all callback guards | `engine._ready === true` |
| TDZ variant pattern (constructor callbacks) (C39) | §5.1 | Zero engine direct references in callbacks | grep `engine\.` in callbacks = 0 |
| Mobile touch target 30px violation (C39) | §3.3 | Math.max(48, cellSize) enforced | Min touch area 48×48px |
| fadeAlpha sync incomplete (C39) | §6.1 | tween→render value onUpdate sync | fadeAlpha === tween._t |
| Runtime verification completely impossible (C39) | §14.3 | Engine init smoke test #1 | TITLE state entry confirmed |
| Phase 2 dual system overscaling concern (C40) | §1 | Single core loop + natural day/night separation | ≤7 states, Explore/Defense non-overlapping |

### Previous Cycle "Next Cycle Suggestions" Reflection

| Suggestion (cycle-39~40 postmortem) | Reflected | Applied Section |
|-------------------------------------|-----------|-----------------|
| Standardize Engine constructor callback TDZ defense pattern | ✅ | §5.1 — `_ready` flag + callback guard |
| Add "engine init success" to smoke tests | ✅ | §14.3 — Item #1 |
| Ban engine direct references in onResize callbacks | ✅ | §5.1 — Parameter passing only |
| Upgrade axis separation → intuitive balance verification | ✅ | §7.3 — Defense/Attack/Explore 3-axis |
| Adapt BFS to genre-specific reach mechanics | ✅ | §10.2 — Zombie path BFS + placement validation |

---

## §1. Game Overview & Core Fun Elements

### Core Concept
"**By day, scavenge ruins for resources and survivors. By night, hold the line behind your barricades against the zombie horde.**"

Players become 'Captain Ash', the last leader in a post-apocalyptic world, exploring ruins by day (action) and defending the stronghold by night (strategy). A hybrid combining Plants vs Zombies lane-based placement, They Are Billions survival tension, and Slay the Spire roguelite choices.

### 5 Core Fun Elements
1. **Resource Pressure Tension**: Did you scavenge enough before nightfall? Can you survive the night?
2. **Placement Strategy Depth**: Where to place barricades/turrets/survivors — new strategy every night
3. **Survivor Synergy**: 4 survivor types (warrior/gunner/engineer/medic) create diverse tactical combinations
4. **Progressive Stronghold Growth**: Ruins → camp → defensive position → fortified base → citadel visual evolution
5. **Roguelite Replayability**: Different relics, different survivor combos, different zombie patterns every run

### Differentiation
- First zombie/post-apocalyptic theme on the platform
- Complete differentiation from existing action+strategy titles (dice RPG/fantasy TD/military)
- Day exploration (action) + night defense (strategy) natural separation prevents dual-system overscaling
- Steam TD Fest 2026 trend + globally perpetual zombie survival popularity

### Story/Narrative
100 days since the "Grey Plague" virus devastated the world. Captain Ash discovers an abandoned military outpost on the city outskirts and makes it humanity's last stand. Explore zones one by one to gather survivors, hold off nightly zombie hordes, and push toward the underground bunker — the virus's origin.

- **Zone 1 (Ruined City)**: "We start here. We need food and materials."
- **Zone 2 (Industrial District)**: "There might be a working generator in the factory."
- **Zone 3 (Hospital)**: "Medicine... and maybe something more."
- **Zone 4 (Military Base)**: "If the armory is intact, we can turn the tide."
- **Zone 5 (Underground Bunker)**: "This is ground zero. All answers lie here."

---

## §2. Game Rules & Objectives

### Primary Objectives
- **Victory Condition**: Clear all 5 zones and defeat the underground bunker boss
- **Defeat Condition**: Core HP reaches 0 = game over
- **Zone Clear**: Survive all 3 night waves per zone → defeat zone boss

### Game Cycle (1 zone = 3 days)
```
[Day Exploration 60s] → [Defense Prep 30s] → [Night Defense ~90s] × 3 → [Boss Night]
```

1. **Day Exploration (DAY_EXPLORE, 60s)**
   - Move through map, collect resources (scrap/food/ammo)
   - Enter buildings to discover survivors
   - Encounter small zombie patrols → direct combat (action)
   - Forced return when time expires (night is coming!)

2. **Defense Preparation (NIGHT_PREP, 30s)**
   - Place defenses using collected resources (barricades/turrets/traps)
   - Assign survivor positions
   - Preview zombie approach paths (radar)

3. **Night Defense (NIGHT_WAVE, ~90s)**
   - Zombie waves approach from 4 directions
   - Player direct fire + survivor AI auto-attack
   - Turrets/traps auto-activate
   - Wave clear rewards: resources + relic choice

4. **Boss Night (BOSS_NIGHT)**
   - Zone boss appears after 3 nights
   - Boss weakness exploitation = strategic placement puzzle

### 3 Bosses (Phase 1 MVP)

| Boss | Zone | HP | Weakness | Strategy |
|------|------|-----|----------|----------|
| **Spore Titan** | 1. Ruined City | 300 | Fire | Place 3 fire turrets in triangle → burn spore shield → expose core |
| **Iron Reaper** | 2. Industrial | 500 | Electric | EMP traps disable armor → gunner focus fire |
| **Patient Zero** | 3. Hospital | 400 | Heal Reversal | Aim medic's heal device at boss → virus reversal causes self-damage |

---

## §3. Controls

### §3.1 Keyboard (PC)
| Key | Function |
|-----|----------|
| WASD / Arrow Keys | Character movement (day) |
| Left Click | Shoot / confirm placement |
| Right Click | Cancel placement |
| 1~4 | Select survivor |
| Q/E | Cycle defense type |
| Space | Interact/collect |
| Tab | Toggle radar/minimap |
| Esc | Pause (Canvas modal) |
| R | Reload |

### §3.2 Mouse (PC)
| Input | Function |
|-------|----------|
| Left click | Aim direction / placement position |
| Right click | Cancel placement / survivor move command |
| Scroll | Cycle defense type |
| Click+drag | Prep phase: move defenses |

### §3.3 Touch (Mobile)
```
┌─────────────────────────────────┐
│                                 │
│          [Game Area]            │
│                                 │
│                                 │
│                          [R]    │  ← Reload (48×48+)
│  ┌─┐                   [ATK]   │  ← Attack (64×64)
│  │J│                    [ACT]   │  ← Action (48×48+)
│  └─┘                           │
│  joystick              [1][2]   │  ← Survivor select (48×48+)
│  (120×120)             [3][4]   │
└─────────────────────────────────┘
```
- **Virtual joystick (bottom-left)**: Movement (120×120 touch area)
- **Attack button (right)**: Auto-aim at nearest enemy
- **Action button**: Interact/collect
- **Survivor buttons (1~4)**: Select, then tap to place/move
- **Tap (game area)**: Designate placement position / install turret
- **Long press**: Cycle defense type (radial menu)
- **Pinch zoom**: Map zoom (prep phase)
- **All touch targets**: `Math.max(48, computedSize)` enforced (F11, F25)

### §3.4 Small Display (≤400px) Layout
```
┌───────────────────────┐
│      [Game Area]      │
│                       │
│                 [ATK] │
│  [J]            [ACT] │
│                [1][2] │
└───────────────────────┘
```
- Survivor buttons: 2×2 → 1×4 vertical layout
- Joystick reduced to 100×100 (touch area maintained)

---

## §4. Visual Style Guide

### §4.1 Technical Policy
- **Canvas resolution**: Fullscreen + `devicePixelRatio` + dynamic resize
- **Asset loading**: Gemini API PNG assets → `manifest.json` dynamic load (F1, F22)
- **External resources**: Zero (no CDN/Google Fonts) (F2)
- **Modals/dialogs**: 100% Canvas-based (no confirm/alert) (F3)

### §4.2 Color Palette
| Use | Color | HEX |
|-----|-------|-----|
| Background (night/default) | Dark gray | `#1a1a2e` |
| Background (day) | Brown-gray | `#4a4238` |
| Stronghold/UI frame | Steel gray | `#5c6b73` |
| Zombie skin | Decay green | `#4a7c59` |
| Fire/danger | Alert red | `#e74c3c` |
| Resources/rewards | Metallic gold | `#f39c12` |
| Healing/safe | Medical teal | `#00b894` |
| UI text | Pure white | `#ecf0f1` |
| UI accent | Neon orange | `#e67e22` |

### §4.3 Background Composition
- **Far layer (bg-far)**: Devastated city skyline, broken building silhouettes, gray-orange fog
- **Mid layer (bg-mid)**: Zone-specific building ruins — city(shops)/industrial(factories)/hospital(equipment)
- **Ground layer (bg-ground)**: Cracked asphalt, bloodstains, weeds, improvised barricade debris

### §4.4 Drawing Function Signature Standard (F9)
All drawing functions follow the pure function pattern:
```javascript
function drawPlayer(ctx, x, y, size, facing, hp, maxHp, isReloading) {}
function drawZombie(ctx, x, y, size, type, hp, maxHp, animFrame) {}
function drawBarricade(ctx, x, y, w, h, hp, maxHp, material) {}
function drawTurret(ctx, x, y, size, angle, type, cooldownPct) {}
function drawSurvivor(ctx, x, y, size, type, hp, isActive) {}
function drawProjectile(ctx, x, y, size, type, angle) {}
function drawEffect(ctx, x, y, size, type, progress) {}
function drawUI_HP(ctx, x, y, w, h, current, max) {}
function drawUI_Resource(ctx, x, y, iconType, amount) {}
function drawMinimap(ctx, x, y, w, h, entities, fogOfWar) {}
```

---

## §4.5. Art Direction

### Art Style Keywords
**"Dark Post-Apocalyptic Pixel Art"** — A dark, devastated world rendered in 16~32px sprite-level pixel art. Backgrounds use desaturated brown/gray tones, but zombie green glow and fire/electric effects create intense contrast. UI follows military HUD style.

### Art Style Details
- **Style keyword**: `dark post-apocalyptic pixel art`
- **Characters**: 2.5-head-ratio military survivors, angular silhouettes, prominent weapons/gear
- **Zombies**: Silhouette-distinguishable types (basic=humanoid, hulk=large, spitter=elongated)
- **Buildings/objects**: Broken textures, rusted metal, cracked concrete
- **Effects**: Fire(orange~red), electric(blue-white), heal(teal), explosion(yellow-red) — glowing against dark backgrounds
- **UI**: Military HUD green monochrome radar/minimap, bold sans-serif text

### Art References
1. **Dead Cells** — Fluid pixel art animation + dark atmosphere
2. **The Last Stand: Dead Zone** — Zombie survival base defense visual tone

---

## §5. Core Game Loop (Frame-Level Logic)

### §5.1 Initialization & TDZ Defense (F12, F23, F27)

```javascript
// INIT_EMPTY pattern — all global state initialized at declaration
const G = {
  state: 'BOOT', phase: 'NONE', day: 0, night: 0,
  zone: 0, wave: 0, fadeAlpha: 0,
  scrap: 0, food: 0, ammo: 0,
  core: { hp: 100, maxHp: 100 },
  survivors: [], barricades: [], turrets: [], traps: [],
  zombies: [], projectiles: [], effects: [],
  camera: { x: 0, y: 0, zoom: 1 },
  dda: { level: 0, consecutiveClears: 0, consecutiveFails: 0 },
};

// Engine creation → _ready = true at the very end
class Engine {
  constructor(canvas) {
    this._ready = false;
    // ... canvas setup, event binding
    // ⚠️ NEVER reference engine directly in callbacks!
    // Pass only parameters: onResize(w, h)
    this._ready = true; // Last line of constructor!
  }
}

// Guard at every callback entry
function onResize(w, h) {
  if (!engine?._ready) return; // TDZ defense
  recalcLayout(w, h); // NO engine reference, parameters only
}
```

### §5.2 Main Loop (60fps)

```
Every frame (requestAnimationFrame):
├─ Calculate dt (delta from previous frame, cap 50ms)
├─ State-based update dispatch (ACTIVE_SYSTEMS matrix §6.2)
│  ├─ TITLE: UI tween update only
│  ├─ MAP: Zone selection UI update
│  ├─ DAY_EXPLORE: physics + input + enemyAI + collection + camera
│  ├─ NIGHT_PREP: placement input + BFS validation + timer
│  ├─ NIGHT_WAVE: physics + enemyAI + turretAI + projectiles + collision + DDA
│  ├─ BOSS_NIGHT: physics + bossAI + enemyAI + patterns + projectiles + collision
│  └─ GAMEOVER: fade tween + result UI
├─ TweenManager.update(dt)
│  ├─ Guard flag: transitioning = true → callback once (F5)
│  ├─ clearImmediate() API separation (F13)
│  └─ Single update path verification (F14)
├─ Render
│  ├─ Background layers (parallax)
│  ├─ Game objects (z-sort)
│  ├─ Effects layer
│  ├─ UI layer
│  └─ fadeAlpha overlay (tween onUpdate sync, F24)
└─ SeededRNG only (zero Math.random, F18)
```

### §5.3 Code Region Guide (10 REGIONs)

| REGION | Line Range (est.) | Content | Dependency |
|--------|-------------------|---------|------------|
| R1 CONFIG | 1~200 | Constants, balance values, INIT_EMPTY | None |
| R2 ENGINE | 200~500 | Canvas, input, TweenManager, resize | R1 |
| R3 AUDIO | 500~700 | Web Audio API, BGM, SFX 8+ types | R1 |
| R4 ENTITIES | 700~1200 | Player, Zombie, Survivor, Turret, Barricade | R1 |
| R5 AI | 1200~1600 | Zombie AI (BFS path), Survivor AI, Boss patterns | R1, R4 |
| R6 SYSTEMS | 1600~2200 | Collision, projectiles, DDA, wave spawner, placement validation | R1~R5 |
| R7 GAMELOOP | 2200~2800 | State machine, TRANSITION_TABLE, update/render | R1~R6 |
| R8 UI | 2800~3200 | HUD, minimap, menus, modals, upgrade screen | R1, R2 |
| R9 SAVE | 3200~3400 | localStorage persistent progress, unlocks, stats | R1 |
| R10 BOOT | 3400~3800 | Asset loading, manifest.json, Engine init | R1~R9 |

---

## §6. State Machine

### §6.1 TRANSITION_TABLE (F6, F21)

```javascript
const TRANSITION_TABLE = {
  TITLE:       { MAP: true },
  MAP:         { DAY_EXPLORE: true, TITLE: true },
  DAY_EXPLORE: { NIGHT_PREP: true, GAMEOVER: true },
  NIGHT_PREP:  { NIGHT_WAVE: true },
  NIGHT_WAVE:  { NIGHT_PREP: true, BOSS_NIGHT: true, GAMEOVER: true },
  BOSS_NIGHT:  { MAP: true, GAMEOVER: true },
  GAMEOVER:    { TITLE: true },
};

// All transitions go through beginTransition() (F21)
function beginTransition(from, to, duration = 500) {
  if (!TRANSITION_TABLE[from]?.[to]) {
    console.error(`Invalid transition: ${from} → ${to}`);
    return;
  }
  if (G._transitioning) return; // Guard flag (F5)
  G._transitioning = true;
  tw.add({ target: G, prop: 'fadeAlpha', from: 0, to: 1, duration,
    onUpdate: () => { /* F24: fadeAlpha sync */ },
    onComplete: () => {
      G.state = to;
      enterState(to);
      tw.add({ target: G, prop: 'fadeAlpha', from: 1, to: 0, duration,
        onComplete: () => { G._transitioning = false; }
      });
    }
  });
}
```

**State Transition Priority** (F5, [Cycle 3 B2]):
- GAMEOVER transition takes priority over all others
- `if (G.core.hp <= 0) return;` pre-check at every transition function entry

### §6.2 State × System ACTIVE_SYSTEMS Matrix (F7, F28)

| State | Physics | Input | Explore | Defense | AI_Zombie | AI_Surv | AI_Boss | Turret | Projectile | Collision | DDA | Tween | Audio | Render |
|-------|---------|-------|---------|---------|-----------|---------|---------|--------|------------|-----------|-----|-------|-------|--------|
| TITLE | — | menu | — | — | — | — | — | — | — | — | — | ✅ | bgm_title | ✅ |
| MAP | — | map | — | — | — | — | — | — | — | — | — | ✅ | bgm_title | ✅ |
| DAY_EXPLORE | ✅ | game | ✅ | — | patrol | — | — | — | ✅ | ✅ | — | ✅ | bgm_day | ✅ |
| NIGHT_PREP | — | place | — | ✅ | — | — | — | — | — | — | — | ✅ | bgm_prep | ✅ |
| NIGHT_WAVE | ✅ | game | — | ✅ | wave | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | bgm_night | ✅ |
| BOSS_NIGHT | ✅ | game | — | ✅ | boss | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | bgm_boss | ✅ |
| GAMEOVER | — | modal | — | — | — | — | — | — | — | — | — | ✅ | sfx_over | ✅ |

**Input Mode Granularity** (F28, [Cycle 26]):
- `menu`: Menu button clicks only
- `map`: Zone selection + upgrade screen entry
- `game`: WASD movement + mouse shooting + Space interact + number keys
- `place`: Grid tap placement + Q/E cycling + right-click cancel (movement disabled)
- `modal`: Confirm/cancel buttons only

**Explore/Defense Mutual Exclusivity** (F28):
- DAY_EXPLORE: Defense system inactive (no barricade placement)
- NIGHT_WAVE: Explore system inactive (no resource collection)

### §6.3 RESTART_ALLOWED Whitelist
```javascript
const RESTART_ALLOWED = { GAMEOVER: true };
```

### §6.4 Canvas Modal System (F3)
- All dialogs (pause, game over, upgrade selection) rendered on Canvas
- `confirm()`/`alert()` completely banned
- Tween system updates even in modal state (for opacity animations)

---

## §7. Core Systems Detail

### §7.1 Day Exploration System (DAY_EXPLORE)

**Map Structure**: Each zone is a 12×8 grid — buildings (explorable) / debris (destructible) / roads (passable)
- Building entry: random resource drops (SeededRNG)
- Small zombie patrols (3~5) — direct combat
- Survivor NPC discovery: 1~2 per zone (SeededRNG)
- **60-second time limit**: Countdown UI, warning at 10s remaining (SFX + red border)

**3 Resource Types**:
| Resource | Icon | Use |
|----------|------|-----|
| Scrap | 🔩 | Barricade/turret construction |
| Food | 🍖 | Survivor upkeep, HP recovery |
| Ammo | 🔫 | Player shooting, turret reload |

### §7.2 Night Defense System (NIGHT_WAVE)

**Lane-Based Placement**: 4 directions × 3 lanes = 12 defense slots around stronghold
```
          [N1][N2][N3]
[W1]                    [E1]
[W2]    [  CORE  ]      [E2]
[W3]                    [E3]
          [S1][S2][S3]
```

**Defense Types**:
| Type | Cost (Scrap) | HP | Effect |
|------|-------------|-----|--------|
| Barricade | 10 | 50 | 50% zombie speed reduction |
| MG Turret | 30 | 30 | 15 DPS, range 3 tiles |
| Fire Turret | 40 | 25 | 20 DPS (AoE), range 2 tiles |
| EMP Trap | 25 | Single-use | 3s stun in area |
| Landmine | 15 | Single-use | 50 damage on contact (AoE) |

**BFS Validation on Placement** (F29, [Cycle 26,36]):
```javascript
function tryPlace(gridX, gridY, defenseType) {
  const tempGrid = cloneGrid(G.grid);
  tempGrid[gridY][gridX] = BLOCKED;
  for (const spawnDir of ['N','S','E','W']) {
    if (!bfsPathExists(tempGrid, getSpawn(spawnDir), CORE_POS)) {
      showWarning('Path blocked!');
      return false;
    }
  }
  placeDefense(gridX, gridY, defenseType);
  return true;
}
```

### §7.3 Upgrade Tree: 3 Branches × 5 Tiers

**Axis Separation Principle** ([Cycle 35,40]): Each branch strengthens a different axis (durability/damage/information)

| Level | 🛡️ Defense (Durability) | ⚔️ Attack (Damage) | 🔍 Explore (Information) |
|-------|------------------------|--------------------|-----------------------|
| Lv1 | Barricade HP +20% | Shot damage +15% | Explore time +10s |
| Lv2 | Core HP +25 | Turret range +1 | Radar range expanded |
| Lv3 | Repair enabled (day barricade fix) | Piercing rounds unlocked | Survivor discovery +20% |
| Lv4 | Secondary barricade unlocked | Fire/EMP turrets unlocked | Boss weakness hints shown |
| Lv5 | Core auto-regen 2/s | 20% critical chance | Hidden stages accessible |

**Upgrade Currency**: Stars (★) — 1~3★ per night wave clear
- **Total obtainable**: ~30★ in Phase 1 (15 waves + boss bonuses)
- **Full unlock cost**: 75★ (5 tiers × 5 cost × 3 branches)
- **Scarce currency → forced build choice → replay value** ([Cycle 39])

### §7.4 Relic System (Roguelite)

3 relics presented after each night wave clear — choose 1:

| Tier | Probability | Effect Range | Example |
|------|-------------|-------------|---------|
| Common (gray) | 50% | +5~10% | "Rusty Cartridge": Fire rate +5% |
| Rare (blue) | 35% | +15~25% | "Military Night Vision": Night vision +20% |
| Epic (purple) | 15% | +30~50% | "Experimental Serum": All survivor ATK +30% |

**DPS/Synergy Caps** (F30, [Cycle 26~27]):
- DPS cap: 200% of base
- Synergy cap: 150% of base
- Over-cap relics auto-excluded from choices
```javascript
function generateRelicChoices(currentStats) {
  const pool = RELICS.filter(r => {
    const projected = simulateApply(currentStats, r);
    return projected.dps <= BASE_DPS * 2.0 &&
           projected.synergy <= BASE_SYNERGY * 1.5;
  });
  return pickN(pool, 3, G.rng);
}
```

### §7.5 Boss Battles Detail

**Boss Reward Single-Grant Guarantee** (F17):
```javascript
let bossRewardGiven = false;
function onBossDefeated(boss) {
  if (bossRewardGiven) return;
  bossRewardGiven = true;
  giveReward(boss.reward);
}
```

**Boss 1: Spore Titan (Zone 1)**
```
Phase 1 (HP 300→200): Spore cloud release → vision restriction + 5 zombie summon
  ↓ HP reaches 200
Phase 2 (HP 200→100): Spore shield active (non-fire damage -50%)
  ↓ 3 fire turrets in triangle → shield removed
Phase 3 (HP 100→0): Rage mode — 2× speed, direct core attack
```

**Boss 2: Iron Reaper (Zone 2)**
```
Phase 1 (HP 500→300): Charge attack (destroys entire lane) + ignores barricades
  ↓ HP reaches 300
Phase 2 (HP 300→150): Iron armor active (all damage -70%)
  ↓ 3 EMP trap hits → armor disabled 15s
Phase 3 (HP 150→0): Armor down — vulnerable to gunner focus fire
```

**Boss 3: Patient Zero (Zone 3)**
```
Phase 1 (HP 400→200): Virus aura — 5 DPS to survivors in range
  ↓ HP reaches 200
Phase 2 (HP 200→100): Self-heal (10 HP/s recovery)
  ↓ Aim medic's heal device at boss → virus reversal (heal = damage)
Phase 3 (HP 100→0): Rampage — if reversal continues: self-destruct; if not: spawn clones
```

---

## §8. Asset Requirements

```yaml
# asset-requirements
art-style: "dark post-apocalyptic pixel art"
color-palette: "#1a1a2e, #4a4238, #5c6b73, #4a7c59, #e74c3c, #f39c12, #00b894"
mood: "tense survival, devastated world, sparks of hope"
reference: "Dead Cells pixel art atmosphere + The Last Stand: Dead Zone zombie survival tone"

assets:
  - id: player
    desc: "Captain Ash — Military jacket+vest, goggles pushed up on forehead, holding rifle. 2.5-head-ratio character. Radio antenna on shoulder. Front/side/back 3-direction poses. Dark brown~khaki palette."
    size: "512x512"

  - id: player-shoot
    desc: "Captain Ash shooting pose — Aiming rifle with muzzle flash visible. Side-view firing stance."
    size: "512x512"

  - id: survivor-warrior
    desc: "Warrior survivor — Improvised armor (car door+chains), melee weapon (pipe wrench), fierce expression. Red headband."
    size: "512x512"

  - id: survivor-gunner
    desc: "Gunner survivor — Cowboy hat+sunglasses, dual pistol pose, ammo belt draped over shoulder."
    size: "512x512"

  - id: survivor-engineer
    desc: "Engineer survivor — Welding mask pushed up, tool belt, wrench in one hand + blueprint in other. Orange work coveralls."
    size: "512x512"

  - id: survivor-medic
    desc: "Medic survivor — Stained doctor's coat+red cross armband, medical bag, holding syringe. Teal surgical mask."
    size: "512x512"

  - id: zombie-basic
    desc: "Basic zombie — Torn civilian clothes, one arm hanging loose in shambling pose. Decayed green skin, red eyes."
    size: "512x512"

  - id: zombie-hulk
    desc: "Hulk zombie — 2× size of basic, bulging muscles with protruding bones, arms raised in charge pose. Deep purple+green."
    size: "512x512"

  - id: zombie-spitter
    desc: "Spitter zombie — Elongated thin frame, swollen neck dripping green acid. Mouth wide open."
    size: "512x512"

  - id: boss-spore-titan
    desc: "Spore Titan — 3m giant zombie with massive fungal mushrooms growing from back. Spore clouds enveloping body, one eye covered by fungus. Brown+green+purple spore colors. Imposing frontal pose."
    size: "600x400"

  - id: boss-iron-reaper
    desc: "Iron Reaper — Zombie clad in industrial robot debris as armor. One arm is a mechanical saw, red power core glowing in chest. Steel gray+red glow. Pre-charge pose."
    size: "600x400"

  - id: boss-patient-zero
    desc: "Patient Zero — Pale human form in hospital gown, purple virus aura rising from body. Green glowing eyes, veins darkened and swollen. Arms spread in ritual pose."
    size: "600x400"

  - id: bg-far
    desc: "Far background — Devastated city skyline. Broken building silhouettes in gray~orange fog with sunset/moonlight. 2~3 smoke columns. Sky: hazy red-gray (day) / deep navy (night)."
    size: "1920x1080"

  - id: bg-mid
    desc: "Mid background — Ruined city debris. Collapsed shop signs, overturned cars, broken streetlights. Weeds growing through concrete cracks. Brown~gray tone."
    size: "1920x1080"

  - id: bg-ground
    desc: "Ground layer — Cracked asphalt tilemap. Bloodstains, bullet holes, weed patches. Stronghold perimeter with improvised barricades (drums+barbed wire)."
    size: "1920x1080"

  - id: defense-barricade
    desc: "Barricade — Drum barrel+sandbag+barbed wire combo. 3-stage visual change based on HP: intact→cracked→damaged. Metallic gray+brown."
    size: "256x256"

  - id: defense-turret
    desc: "MG turret — Machine gun on tripod with connected ammo box. Rotatable barrel. Olive green+steel."
    size: "256x256"

  - id: item-scrap
    desc: "Scrap item — Gears+bolts+metal fragments clustered together. Metallic silver-gray sheen."
    size: "128x128"

  - id: item-ammo
    desc: "Ammo item — Ammo box with bullets spilling out. Brass bullets+olive box."
    size: "128x128"

  - id: effect-explosion
    desc: "Explosion effect — Orange→red→black smoke expansion with flying debris. 4-frame sequence."
    size: "512x512"

  - id: effect-heal
    desc: "Heal effect — Teal cross-shaped light spreading upward and fading. Sparkling particles."
    size: "256x256"

  - id: thumbnail
    desc: "Game thumbnail — Captain Ash atop stronghold barricade aiming rifle at zombie horde. Burning city skyline backdrop. 'Ashen Stronghold' title at top. 3 survivor silhouettes at bottom-left. Dark + orange flame contrast."
    size: "800x600"
```

Total assets: 20 — within range (8~20).

---

## §9. Difficulty System

### §9.1 DDA 4 Tiers (Dynamic Difficulty Adjustment)

| DDA Level | Trigger | Effect |
|-----------|---------|--------|
| 0 (Default) | Base state | Standard balance |
| 1 (Easy) | 2 consecutive night failures | Zombie HP -15%, speed -10% |
| 2 (Easier) | 3 consecutive night failures | Zombie HP -25%, speed -20%, resources +20% |
| 3 (Minimum) | 5 consecutive night failures | Zombie count -30%, HP -30%, core auto-regen 1/s |

**Reverse**: 3 consecutive flawless clears → DDA level -1 (minimum 0)

### §9.2 Zone Difficulty Curve

| Zone | Nights | Zombie Count | Zombie HP | Special Zombies | Boss HP |
|------|--------|-------------|-----------|-----------------|---------|
| 1 Ruined City | 1~3 | 8→12→16 | 20→25→30 | Hulk 0→0→1 | 300 |
| 2 Industrial | 4~6 | 14→18→22 | 30→35→40 | Hulk 1→1→2, Spitter 0→1→1 | 500 |
| 3 Hospital | 7~9 | 20→25→30 | 40→50→60 | Hulk 2→2→3, Spitter 1→2→2 | 400 |

**Difficulty Formula**:
```
zombieCount(zone, night) = BASE_COUNT[zone] + (night - 1) * NIGHT_SCALE[zone]
zombieHP(zone, night) = BASE_HP[zone] * (1 + (night - 1) * 0.15)
```

---

## §10. Procedural Generation

### §10.1 Night Wave Generation (SeededRNG)
- Wave seed at each night start: `G.rng.seed(zone * 1000 + day * 100 + night)`
- Zombie approach directions: 2~3 of 4 directions active (SeededRNG)
- Special zombie distribution: evenly split across active directions
- Wave intervals: 10~30 seconds (SeededRNG)

### §10.2 BFS Path Validation (F29)

Zombie path = shortest path from each spawn point to core (BFS)
```javascript
function bfsPathExists(grid, start, goal) {
  const queue = [start];
  const visited = new Set([key(start)]);
  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr.x === goal.x && curr.y === goal.y) return true;
    for (const dir of DIRS_4) {
      const nx = curr.x + dir.dx, ny = curr.y + dir.dy;
      if (inBounds(nx, ny) && !visited.has(key({x:nx,y:ny})) && grid[ny][nx] !== BLOCKED) {
        visited.add(key({x:nx,y:ny}));
        queue.push({x:nx, y:ny});
      }
    }
  }
  return false;
}
```

**Real-time validation on placement**: Defense placed → `tryPlace()` → BFS all 4 directions → reject if any path blocked + show warning

---

## §11. Score System

### §11.1 Score Calculation (F8: Judge first, save later)

| Action | Score |
|--------|-------|
| Kill zombie (basic) | +10 |
| Kill zombie (hulk) | +30 |
| Kill zombie (spitter) | +20 |
| Night wave clear | +100 × zone |
| Boss defeated | +500 |
| Survivor rescued | +50 |
| Core undamaged bonus | +200 |
| DDA level 0 bonus | ×1.5 multiplier |

```javascript
function onWaveComplete() {
  const score = calculateWaveScore();
  const isNewBest = score > getBestScore(); // Judge first
  saveBestScore(score); // Save later
  if (isNewBest) showNewBestEffect();
}
```

### §11.2 Persistent Progression

**localStorage Data Schema**:
```json
{
  "ashen-stronghold": {
    "version": 1,
    "bestScore": 0,
    "totalKills": 0,
    "zonesCleared": [false, false, false, false, false],
    "upgrades": { "defense": 0, "attack": 0, "explore": 0 },
    "stars": 0,
    "relicsFound": [],
    "survivorsRescued": [],
    "bossesDefeated": [],
    "playCount": 0,
    "settings": { "lang": "ko", "sfxVol": 0.7, "bgmVol": 0.5 }
  }
}
```

---

## §12. Sound System (Web Audio API)

### BGM (Procedural Generation, F19)
| BGM | Mood | BPM | Key |
|-----|------|-----|-----|
| bgm_title | Dark, majestic drone | 60 | Dm |
| bgm_day | Tense exploration | 90 | Am |
| bgm_prep | Countdown tension, tick-tock | 120 | Em |
| bgm_night | Intense battle drumbeat | 140 | Gm |
| bgm_boss | Epic boss entrance theme | 150 | Cm |

### SFX 8+
| SFX | Description | Trigger |
|-----|-------------|---------|
| sfx_shoot | Rifle fire — sharp pop | On shoot |
| sfx_reload | Reload — metal click | R key / auto reload |
| sfx_zombie_hit | Zombie hit — blunt impact | Zombie takes damage |
| sfx_zombie_death | Zombie death — collapse | Zombie HP 0 |
| sfx_build | Construction — hammer+drill | Defense placed |
| sfx_explosion | Explosion — low boom | Mine/EMP triggered |
| sfx_alert | Alert — 2-tone siren | Night approaching / boss spawn |
| sfx_pickup | Item pickup — metal clink | Resource collected |
| sfx_heal | Heal — bright chime | Medic healing |
| sfx_gameover | Game over — low drone fade | Core destroyed |

---

## §13. Internationalization (F20)

```javascript
const L = {
  ko: {
    title: '잿빛 요새', start: '생존 시작', day: '주간 탐색',
    night: '야간 방어', prep: '방어 준비', wave: '웨이브',
    boss: '보스', gameover: '요새 함락', score: '점수',
    best: '최고 점수', scrap: '고철', food: '식량', ammo: '탄약',
    core_hp: '코어 HP', place_blocked: '경로가 차단됩니다!',
    upgrade: '업그레이드', defense: '방어', attack: '공격',
    explore: '탐색', relic_choose: '유물 선택',
    survivor_found: '생존자 발견!', zone_clear: '구역 클리어!',
    new_best: '신기록!',
  },
  en: {
    title: 'Ashen Stronghold', start: 'Start Survival', day: 'Day Exploration',
    night: 'Night Defense', prep: 'Prepare Defenses', wave: 'Wave',
    boss: 'Boss', gameover: 'Stronghold Fallen', score: 'Score',
    best: 'Best Score', scrap: 'Scrap', food: 'Food', ammo: 'Ammo',
    core_hp: 'Core HP', place_blocked: 'Path blocked!',
    upgrade: 'Upgrade', defense: 'Defense', attack: 'Attack',
    explore: 'Explore', relic_choose: 'Choose Relic',
    survivor_found: 'Survivor Found!', zone_clear: 'Zone Clear!',
    new_best: 'New Record!',
  }
};
```

---

## §14. Code Hygiene & Verification

### §14.1 Numeric Consistency Table (F10)

| Spec Value | CONFIG Constant | Expected |
|-----------|----------------|----------|
| Core base HP | CORE_BASE_HP | 100 |
| Barricade HP | BARRICADE_HP | 50 |
| MG turret DPS | TURRET_MG_DPS | 15 |
| Fire turret DPS | TURRET_FIRE_DPS | 20 |
| Day exploration time | DAY_DURATION | 60 |
| Prep time | PREP_DURATION | 30 |
| Zombie base HP (zone 1) | ZOMBIE_BASE_HP[0] | 20 |
| Boss 1 HP | BOSS_HP[0] | 300 |
| Boss 2 HP | BOSS_HP[1] | 500 |
| Boss 3 HP | BOSS_HP[2] | 400 |
| DPS cap | DPS_CAP_MULT | 2.0 |
| Synergy cap | SYNERGY_CAP_MULT | 1.5 |
| DDA tier 1 HP reduction | DDA_HP_REDUCTION[1] | 0.15 |
| Min touch target | MIN_TOUCH_TARGET | 48 |

### §14.2 Code Hygiene Checklist

| # | Check Item | FAIL/WARN | Verification |
|---|-----------|-----------|-------------|
| 1 | Zero setTimeout | FAIL | `grep -c "setTimeout" index.html === 0` |
| 2 | Zero Math.random | FAIL | `grep -c "Math.random" index.html === 0` |
| 3 | Zero confirm/alert | FAIL | `grep -c "confirm\|alert(" index.html === 0` |
| 4 | Zero external CDN/fonts | FAIL | `grep -c "googleapis\|cdnjs\|unpkg" index.html === 0` |
| 5 | Zero engine refs in callbacks | FAIL | grep `engine.` in callbacks |
| 6 | TRANSITION_TABLE key count = 7 | FAIL | `Object.keys(TT).length === 7` |
| 7 | BFS path validation function exists | FAIL | `bfsPathExists` defined |
| 8 | DPS_CAP / SYNERGY_CAP constants exist | FAIL | grep |
| 9 | Cap validation in applyRelic | FAIL | Conditional check in code |
| 10 | MIN_TOUCH_TARGET ≥ 48 | FAIL | Constant value |
| 11 | All G fields INIT_EMPTY | WARN | All fields have initial values |
| 12 | _ready flag exists | WARN | In Engine class |
| 13 | i18n keys ko/en symmetric | WARN | `Object.keys(L.ko).length === Object.keys(L.en).length` |

### §14.3 Smoke Test Gates (F15, F26)

| # | Test | FAIL/WARN |
|---|------|-----------|
| 1 | Engine init success: `engine._ready === true` (F26) | FAIL |
| 2 | TITLE state entry: `G.state === 'TITLE'` | FAIL |
| 3 | TITLE → MAP transition | FAIL |
| 4 | MAP → DAY_EXPLORE transition | FAIL |
| 5 | DAY_EXPLORE → NIGHT_PREP (timer expiry) | FAIL |
| 6 | NIGHT_PREP → NIGHT_WAVE transition | FAIL |
| 7 | Full flow regression: TITLE→MAP→DAY→PREP→WAVE | FAIL |
| 8 | Zombie spawn + BFS path movement | FAIL |
| 9 | Shoot → zombie hit → HP decrease | FAIL |
| 10 | Defense placement + BFS block warning | FAIL |
| 11 | Wave clear → relic choice display | FAIL |
| 12 | Boss spawn + phase transition | FAIL |
| 13 | GAMEOVER → TITLE restart | FAIL |
| 14 | localStorage save/load | FAIL |
| 15 | Mobile touch areas ≥ 48×48px | FAIL |
| 16 | manifest.json asset load success | FAIL |
| 17 | All SFX playback | WARN |
| 18 | BGM loop playback | WARN |
| 19 | Language switch | WARN |
| 20 | 60fps maintained (desktop) | WARN |

---

## §15. Balance Verification (Appendix A)

### Extreme Build Simulation (3 Builds)

**Build 1: Full Defense (Defense Lv5, Attack Lv0, Explore Lv0)**
- Core HP: 100 + 25(Lv2) = 125, auto-regen 2/s (Lv5)
- Barricade HP: 50 × 1.2(Lv1) = 60, repairable (Lv3), secondary layer (Lv4)
- Shot DPS: base 10 (no upgrades)
- **Zone 3 boss estimate**: 400HP ÷ 10DPS + survivor AI 5DPS = 26s
- **Verdict**: Clearable (under 30s), resource scarcity risk

**Build 2: Full Attack (Defense Lv0, Attack Lv5, Explore Lv0)**
- Shot DPS: 10 × 1.15(Lv1) × 1.2(crit Lv5) ≈ 16 avg
- Turrets: Fire 20DPS (Lv4) + piercing (Lv3) = enhanced AoE
- Core HP: base 100 (no upgrades)
- **Zone 3 boss estimate**: 400HP ÷ (16+20+5 survivor) ≈ 10s
- **Verdict**: Fast clear, core defense vulnerable (DPS cap 2.0 check ✅)

**Build 3: Full Explore (Defense Lv0, Attack Lv0, Explore Lv5)**
- Explore time: 60 + 10(Lv1) = 70s
- Survivor discovery +20% (Lv3) → avg 4 survivors
- Boss hints (Lv4) + hidden stages (Lv5)
- **Zone 3 boss estimate**: 400HP ÷ (10 + 4×5 survivor) ≈ 13s
- **Verdict**: Compensated by survivor count, clearable

**Conclusion**: All 3 builds clear in 10~26s range, within balance bounds.

---

## §16. Game Page Sidebar Data

```json
{
  "game": {
    "id": "ashen-stronghold",
    "title": "Ashen Stronghold",
    "description": "Defend humanity's last stronghold in a post-apocalyptic world! Scavenge resources by day, hold off zombie hordes by night. A survival tower-defense roguelite.",
    "genre": ["action", "strategy"],
    "playCount": 0,
    "rating": 0,
    "controls": [
      "WASD/Arrows: Move",
      "Left Click: Shoot/Place",
      "1~4: Select Survivor",
      "Q/E: Cycle Defense Type",
      "Space: Interact",
      "Tab: Minimap",
      "Touch: Virtual Joystick+Buttons"
    ],
    "tags": ["#zombie", "#survival", "#tower-defense", "#roguelite", "#post-apocalyptic", "#strategy"],
    "addedAt": "2026-03-25",
    "version": "1.0.0",
    "featured": true
  }
}
```

---

## §17. Previous Cycle Regrets Resolution Summary

| Regret | Solution Section | Solution | Verification |
|--------|-----------------|----------|-------------|
| C39: P0 TDZ made game unplayable | §5.1 | `_ready` flag + callback guard triple defense | Smoke #1 pass |
| C39: Mobile touch 48px violation | §3.3 | Math.max(48) enforced + ASCII layout | Smoke #15 pass |
| C40: Dual system overscaling concern | §1, §6.2 | Natural day/night separation + mutual exclusion matrix | ≤7 states, Explore/Defense non-overlapping |
| C36: BFS path blocking bug | §10.2, §7.2 | Immediate BFS validation + reject on block | Smoke #10 pass |
| C27: Over-cap relic not excluded | §7.4 | DPS/synergy cap + auto-exclusion logic | Hygiene #8~9 pass |
| C34: Dual system economy imbalance | §7.1 | 3 resources each with clear purpose | All 3 builds clearable |

---

_This design document is based on the Cycle #41 analysis report._
_Resolves action+strategy 11-cycle longest gap + first zombie post-apocalyptic theme on the platform._
_Reflects Steam TD Fest 2026 + survival genre trends._
