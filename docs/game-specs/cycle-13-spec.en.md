---
game-id: mini-idle-farm
title: Mini Idle Farm
genre: casual
difficulty: easy
---

# Mini Idle Farm — Detailed Game Design Document (Cycle 13)

---

## §0. Previous Cycle Feedback Mapping

| # | Source | Problem/Suggestion | Solution in This Spec |
|---|--------|-------------------|----------------------|
| 1 | Cycle 13 Analysis Report | **Arcade genre 53.8% excessive concentration** | ✅ casual + strategy combination. No arcade tag |
| 2 | Cycle 13 Analysis Report | **Idle/clicker genre 0 — complete gap** | ✅ Platform's first idle farm genre added |
| 3 | Cycle 13 Analysis Report | **0 hard difficulty games** | △ Easy default + prestige for effective difficulty increase. Separate hard mode outside scope |
| 4 | Cycle 12 Postmortem | **"Try simulation genre" direct suggestion** | ✅ Directly reflected as idle farm simulation |
| 5 | Cycle 12 Postmortem | **"Combine idle (Cycle 11) + management (Cycle 8) know-how"** | ✅ Cycle 11 idle production pipeline + Cycle 8 tycoon upgrade economy combined |
| 6 | Cycle 12 Postmortem | **"Common engine module separation" suggestion** | §12.10 — Outside this spec's scope. TweenManager/ObjectPool/SoundManager maintain same interface |
| 7 | Cycle 12 Postmortem | **assets/ directory recurring for 12 cycles** | §12.1 — Canvas API only. assets/ directory **creation itself absolutely forbidden**. All graphics are code drawn |
| 8 | Cycle 12 Postmortem | **Pause button below WCAG 44×44px** | §4.5 — All touch targets minimum 48×48px (WCAG AAA level) |
| 9 | Cycle 12 Postmortem | **Dead code (empty if blocks) remaining** | §12.2 — Temporary code blocks forbidden. All blocks must have executable code or TODO comments |
| 10 | Cycle 12 Postmortem | **2 reviews needed — targeting 1st-round APPROVED** | §12 overall — 30+ item pre-verification checklist for 1st-round pass target |
| 11 | platform-wisdom [Cycle 1~13] | **assets/ directory recurring for 13 cycles** | §12.1 — 100% Canvas code drawing. assets/ creation absolutely forbidden. Template copying forbidden |
| 12 | platform-wisdom [Cycle 13] | **index.html not created — submitted review with 0% implementation** | §12.0 — Smoke test mandatory gate before review submission |
| 13 | platform-wisdom [Cycle 13] | **Boilerplate copy creates genre-irrelevant assets** | §12.1 — Template copying forbidden. Write from scratch in empty index.html |
| 14 | platform-wisdom [Cycle 1] | **confirm()/alert() forbidden in iframe** | All modals/dialogs use Canvas-based custom UI |
| 15 | platform-wisdom [Cycle 2] | **State × system matrix required** | §5.3 — 5 states × 6 systems matrix included |
| 16 | platform-wisdom [Cycle 3] | **tween onComplete guard flag** | §5.2 — `_transitioning` guard flag applied to all state transitions |
| 17 | platform-wisdom [Cycle 4] | **cancelAll+add race condition** | §8.3 — clearImmediate() immediate cleanup API usage |
| 18 | platform-wisdom [Cycle 2] | **setTimeout state transition forbidden** | §5 — All delayed transitions use tween onComplete. 0 setTimeout usage target |
| 19 | platform-wisdom [Cycle 5] | **Unified single value update path** | Each value uses either tween OR direct assignment, not both |
| 20 | platform-wisdom [Cycle 6-7] | **Pure function principle** | §10 — All game logic functions are parameter-based pure functions |
| 21 | platform-wisdom [Cycle 7] | **Spec-implementation value mismatch** | §6, §7 — All values concentrated in CONFIG object. 1:1 cross-reference with spec value table |
| 22 | platform-wisdom [Cycle 8] | **beginTransition() bypass** | §5.2 — All transitions go through `beginTransition()`. Immediate transitions also use `{immediate:true}` |
| 23 | platform-wisdom [Cycle 10] | **Fix regression — call site propagation missed on signature change** | §12.4 — Full verification of all call sites when changing function signatures |
| 24 | platform-wisdom [Cycle 11] | **let/const TDZ crash** | §12.7 — All variables declared before first reference. Explicit initialization order verification |
| 25 | platform-wisdom [Cycle 11] | **Idle game production stops on tab switch** | §5.3 — Background systems (production/auto-harvest) always run regardless of UI tab |
| 26 | platform-wisdom [Cycle 2-3] | **Ghost variable prevention** | §12.2 — Full verification checklist for declared variable usage |
| 27 | platform-wisdom [Cycle 10] | **Game loop try-catch wrapping required** | §12.9 — `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` pattern |
| 28 | platform-wisdom [Cycle 12] | **Per-frame localStorage access forbidden** | §8.2 — saveData uses in-memory object reference. Save only at 30s auto + event triggers |
| 29 | platform-wisdom [Cycle 12] | **"Half-implementation" prevention — detailed checklist** | §12.6 — Each feature's A+B specs separated as individual verification items |
| 30 | platform-wisdom [Cycle 12] | **Touch target minimum 44×44px** | §4.5 — All touch targets 48×48px or larger (WCAG AAA) |

---

## §1. Game Overview & Core Fun

### Concept
An **idle simulation** where you grow a farming empire from a small empty plot through **crop cultivation → livestock raising → processing → selling**. Tap to harvest for instant rewards; buy automation upgrades and earnings accumulate even while idle. The long-term goal is prestige (farm reset) to gain permanent growth multipliers, experiencing "faster growth every time." 1 session: 1 minute~unlimited, total content consumption ~60-90 minutes (3-4 prestiges).

### 3 Core Fun Elements
1. **Tap→reward instant gratification**: Tap crops/livestock for gold popup + harvest particles bursting with immediate rewards. "Just one more tap" addiction
2. **Automation optimization satisfaction**: Buying auto-harvesters/auto-feeders generates income without player intervention. "Which automation should I buy first for efficiency?" strategic choice
3. **Prestige reset growth loop**: Resetting the farm accumulates permanent multipliers (stars) making the next cycle exponentially faster. "When is the optimal time to reset?" decision-making

### References
- **Cookie Clicker**: The textbook of the idle genre. Click → automate → prestige 3-stage loop
- **AdVenture Capitalist**: Multiple parallel business growth + angel prestige system
- **Idle Miner Tycoon**: Mining→transport→selling pipeline and manager automation
- **Cell to Singularity**: Exponential growth curve and meta-prestige

### Game Page Sidebar Info
```yaml
title: "Mini Idle Farm"
description: "Start from empty land and grow a farming empire through crops, livestock, and processing. Tap to harvest, automate, and prestige for faster growth!"
genre: ["casual", "strategy"]
playCount: 0
rating: 0
controls:
  - "Mouse: Click to harvest/purchase/switch tabs"
  - "Touch: Tap to harvest/purchase, swipe to switch tabs"
  - "Keyboard: 1~3 tab switch / Space manual harvest / P pause"
tags:
  - "#idle"
  - "#farm"
  - "#simulation"
  - "#afk"
  - "#prestige"
addedAt: "2026-03-21"
version: "1.0.0"
featured: true
```

---

## §2. Game Rules & Objectives

### 2.1 Basic Rules
- Player manages a **6-slot farm grid** (2 rows × 3 columns)
- Place **crops** or **livestock** in each slot to produce resources
- **Sell** produced resources for gold (G), buy **upgrades** with gold
- All resources auto-produce; tapping harvests immediately (bonus +50%)

### 2.2 3-Stage Farm Expansion
| Stage | Unlock Condition | New Elements | Slots |
|-------|-----------------|--------------|-------|
| **Stage 1: Field** | At start | 4 crop types (Wheat, Carrot, Tomato, Corn) | 6 slots |
| **Stage 2: Ranch** | Total income 5,000G | 3 livestock types (Chicken, Cow, Sheep) | +4 slots (10 total) |
| **Stage 3: Processing Plant** | Total income 50,000G | 3 processed goods (Bread, Cheese, Sweater) | +2 slots (12 total) |

### 2.3 Resource Production Chain
```
[Wheat] -----------> Sell (2G/ea)
[Wheat] + [Cow->Milk] -> [Bread] -> Sell (25G/ea)
[Carrot] ----------> Sell (3G/ea)
[Tomato] ---------> Sell (5G/ea)
[Corn] -----------> Sell (4G/ea)
[Chicken->Egg] ----> Sell (8G/ea)
[Cow->Milk] -------> Sell (12G/ea)
[Cow->Milk] -> [Cheese] -> Sell (35G/ea)
[Sheep->Wool] -----> Sell (15G/ea)
[Sheep->Wool] ----> [Sweater] -> Sell (50G/ea)
```

### 2.4 Win Condition
- **No explicit win** — Infinite progression as is characteristic of the idle genre
- **Milestone goal**: "Farm Master" title + special particles upon reaching 1M G total income

### 2.5 Prestige System
- Prestige available when total income ≥ 10,000G
- On prestige: all crops/livestock/upgrades/gold reset
- **Stars** earned: `floor(sqrt(totalEarned / 1000))`
- +**10% total production speed** permanent multiplier per star
- Statistics tracked: prestige count, max stars, fastest time, etc.

---

## §3. Controls

### 3.1 Mouse
| Action | Function |
|--------|----------|
| **Left-click - Crop/livestock** | Instant harvest (base harvest + 50% bonus) |
| **Left-click - Empty slot** | Open crop/livestock placement menu |
| **Left-click - Upgrade button** | Purchase upgrade |
| **Left-click - Tab button** | Tab switch (Farm / Upgrades / Prestige) |
| **Hover - Upgrade** | Show tooltip (effect, cost, current level) |

### 3.2 Touch
| Action | Function |
|--------|----------|
| **Tap - Crop/livestock** | Instant harvest (same as mouse left-click) |
| **Tap - Empty slot** | Open placement menu |
| **Tap - Button** | Purchase upgrade / Tab switch |
| **Long press (500ms) - Upgrade** | Continuous purchase (auto-repeat at 100ms interval) |
| **Left/right swipe** | Tab switch (Farm ↔ Upgrades ↔ Prestige) |

### 3.3 Keyboard
| Key | Function |
|-----|----------|
| **1, 2, 3** | Tab switch (1=Farm, 2=Upgrades, 3=Prestige) |
| **Space** | Batch harvest all ready crops/livestock |
| **P** | Pause toggle |
| **S** | Instant save |

---

## §4. Visual Style Guide

### 4.1 Overall Theme
**Pixel-style Pastel Farm** — Soft pastel colors + simple geometric shapes for a cute farm. All graphics are 100% code drawn via Canvas API (drawRect, fillText, arc, beginPath). **0 external assets.**

### 4.2 Color Palette

| Usage | HEX | Description |
|-------|-----|-------------|
| Background - Sky | `#87CEEB` | Light sky blue |
| Background - Ground | `#8B7355` | Warm brown |
| Background - Grass | `#7EC850` | Vivid green |
| Field - Soil | `#6B4226` | Dark brown |
| Field - Crop (Wheat) | `#F5DEB3` | Wheat color |
| Field - Crop (Carrot) | `#FF8C00` | Orange |
| Field - Crop (Tomato) | `#FF4444` | Red |
| Field - Crop (Corn) | `#FFD700` | Gold |
| Ranch - Fence | `#DEB887` | Light wood |
| Ranch - Chicken | `#FFFFFF` | White + red comb |
| Ranch - Cow | `#F5F5F5` | White + black spots |
| Ranch - Sheep | `#FFFAF0` | Cream fluffy ball |
| Factory - Building | `#B0C4DE` | Light steel blue |
| UI - Gold | `#FFD700` | Gold |
| UI - Prestige star | `#FFB347` | Orange star |
| UI - Button default | `#4CAF50` | Green |
| UI - Button disabled | `#9E9E9E` | Gray |
| UI - Text | `#333333` | Dark gray |
| UI - Background panel | `#FAEBD7` | Antique white (alpha 0.9) |

### 4.3 Object Shapes
- **Crops**: 3 growth stages (seed=small circle, sprout=green triangle, harvest=colored circle+leaf). Interpolated based on growth rate 0~1
- **Livestock**: Simple geometry (chicken=triangle+circle, cow=large rect+circle+horns, sheep=circle+wavy outline). 2-frame idle animation (subtle left/right movement)
- **Processing plant**: Rectangle building + chimney (smoke particles) + rotating gear icon
- **Harvest effect**: Gold number popup (+NNG, floats up and fades) + 4~6 small star particles
- **Prestige effect**: Full-screen golden flash + 20 star swirl particles

### 4.4 Layout (Based on Canvas 960x640, DPR-responsive)
```
+---------------------------------------------------+
| [*3] Mini Idle Farm    G 12,345G    [PAUSE 48x48] |  <- Top bar (48px)
+---------------------------------------------------+
|                                                   |
|    +------+ +------+ +------+                     |
|    | Wheat| | Carrt| | Tomat|                     |
|    +------+ +------+ +------+                     |
|    +------+ +------+ +------+                     |  <- Farm grid (main area)
|    | Corn | | Chick| | Cow  |                     |
|    +------+ +------+ +------+                     |
|    +------+ +------+ +------+ +------+            |
|    | Sheep| | Bread| | Chees| | Sweat|            |  <- When expanded
|    +------+ +------+ +------+ +------+            |
|                                                   |
+---------------------------------------------------+
|  [Farm]  [Upgrades]  [Prestige]                   |  <- Bottom tab bar (56px)
+---------------------------------------------------+
```

### 4.5 Touch Target Specifications
| UI Element | Minimum Size | Application |
|------------|-------------|-------------|
| Pause button | 48×48px | WCAG AAA |
| Tab switch buttons | Height 56px, evenly divided width | Touch-friendly |
| Upgrade items | Height 64px | Long press area secured |
| Farm slots | Minimum 80×80px | Tap harvest convenience |
| Placement menu items | Height 56px | Touch selection |

---

## §5. Core Game Loop

### 5.1 Per-frame Logic Flow (60fps Basis)
```
requestAnimationFrame(loop)
|
+-- 1. dt calculation (deltaTime, cap: 100ms)
+-- 2. if (state === PAUSED) -> renderOnly(); return
+-- 3. TweenManager.update(dt)
+-- 4. updateProduction(dt, farmState)        <- Called in all UI tabs (background system)
|     +-- Each slot's growthTimer += dt * speedMult * prestigeMult
|     +-- growthTimer >= growthTime -> readyToHarvest = true
|     +-- If autoHarvest active -> auto harvest + add gold
+-- 5. updateAutoSave(dt)                     <- Auto-save at 30-second intervals
+-- 6. updateParticles(dt)                    <- ObjectPool-based particle system
+-- 7. updateAnimations(dt)                   <- Livestock idle motion, factory gear rotation
+-- 8. render(ctx, farmState, uiState)
|     +-- drawBackground(ctx)
|     +-- drawFarmGrid(ctx, farmState)
|     +-- drawUI(ctx, uiState)                <- Render UI matching current tab
|     +-- drawParticles(ctx, particles)
|     +-- drawPopups(ctx, popups)             <- Gold popup numbers
+-- 9. try-catch wrapping + requestAnimationFrame(loop)
```

### 5.2 State Machine
```
LOADING -> TITLE -> PLAYING -> PAUSED
                     |   ^       |  ^
                     v   |       v  |
                   PRESTIGE_CONFIRM
                     |
                     v
                   PLAYING (after reset)
```

| State | Description | Entry Condition |
|-------|-------------|-----------------|
| `LOADING` | Initialization, load save data | Page load |
| `TITLE` | Title screen, "Start" / "Continue" selection | Initial state / menu navigation |
| `PLAYING` | Main game loop (production, harvest, purchase) | Start from title |
| `PAUSED` | Paused (production stopped, UI overlay) | P key / Pause button |
| `PRESTIGE_CONFIRM` | Prestige confirmation Canvas modal | Click "Reset" on prestige tab |

**State transition rules:**
- All transitions go through `beginTransition(nextState, options)`
- PAUSED ↔ PLAYING uses `{immediate: true}` option
- PRESTIGE_CONFIRM → PLAYING uses fade-out(300ms) → reset → fade-in(300ms)
- `_transitioning = true` guard during transitions to block duplicate transitions

### 5.3 State × System Update Matrix

| System | LOADING | TITLE | PLAYING | PAUSED | PRESTIGE_CONFIRM |
|--------|---------|-------|---------|--------|-----------------|
| **TweenManager** | X | O | O | O | O |
| **Production** | X | X | O | X | X |
| **Particles** | X | O | O | X | O |
| **AutoSave** | X | X | O | X | X |
| **Input** | X | O | O | O | O |
| **Render** | O | O | O | O | O |

**Key: `updateProduction()` is only called in PLAYING state, but always runs regardless of UI tab (Farm/Upgrades/Prestige) switches. [Cycle 11 lesson: Production must not stop on tab switch in idle games]**

---

## §6. Difficulty System

### 6.1 Resource Production Values (CONFIG Object 1:1 Mapping)

| Resource | Base Production Time | Base Yield | Sell Price | Unlock Cost |
|----------|---------------------|-----------|------------|-------------|
| Wheat | 3s | 1 ea | 2G | 0G (start) |
| Carrot | 5s | 1 ea | 3G | 50G |
| Tomato | 8s | 1 ea | 5G | 200G |
| Corn | 6s | 1 ea | 4G | 120G |
| Chicken (Egg) | 10s | 1 ea | 8G | 500G |
| Cow (Milk) | 15s | 1 ea | 12G | 1,500G |
| Sheep (Wool) | 12s | 1 ea | 15G | 2,000G |
| Bread | 20s | 1 ea | 25G | 8,000G |
| Cheese | 25s | 1 ea | 35G | 15,000G |
| Sweater | 30s | 1 ea | 50G | 25,000G |

### 6.2 Upgrade Tree

#### Production Speed Upgrade (Per Resource)
| Level | Cost Formula | Effect |
|-------|-------------|--------|
| 1~5 | `baseCost * 1.5^level` | Production time -10% (cumulative) |
| 6~10 | `baseCost * 1.8^level` | Production time -8% (cumulative) |
| Max level: 10 | -- | Final production time = base × 0.43 |

#### Yield Upgrade (Per Resource)
| Level | Cost Formula | Effect |
|-------|-------------|--------|
| 1~5 | `baseCost * 2.0^level` | Yield +1 ea (cumulative) |
| Max level: 5 | -- | Final yield = base + 5 ea |

#### Automation Upgrades (Global)
| Upgrade | Cost | Effect |
|---------|------|--------|
| Auto Harvester Lv1 | 500G | Auto-harvest field crops (no manual bonus) |
| Auto Harvester Lv2 | 5,000G | Auto-harvest ranch livestock |
| Auto Harvester Lv3 | 30,000G | Auto-harvest processing plant |
| Auto Seller | 2,000G | Auto-sell harvested goods instantly (manual: sell button click required) |
| Fertilizer | 10,000G | Total production speed ×1.5 |
| Golden Fertilizer | 100,000G | Total production speed ×2.0 (stacks with Fertilizer) |

### 6.3 Prestige Upgrades (Star Currency)

| Upgrade | Star Cost | Effect | Max Level |
|---------|----------|--------|-----------|
| Fertile Soil | 1 | Crop production time -15% | 5 |
| Quality Feed | 2 | Livestock production time -15% | 5 |
| Artisan Skills | 3 | Processed goods sell price +20% | 5 |
| Lucky Harvest | 2 | 10% chance for ×2 on manual harvest | 5 |
| Larger Farm | 5 | +1 additional slot at start | 3 |
| Quick Start | 3 | +500G starting gold after prestige | 5 |

### 6.4 Difficulty Curve Over Time
- **0~5 min**: Build basic economy with field crops. Manual tapping is main income source
- **5~15 min**: Ranch unlock. Auto-harvester purchase begins idle transition
- **15~30 min**: Processing plant unlock. Processed goods become main income. First prestige available
- **30 min+**: Prestige repetition. 2×+ faster growth each cycle. Strategic specialization via prestige upgrades

### 6.5 Offline Income Calculation
- On reconnection: `elapsed time (max 4 hours) × auto production rate × 0.5` offline income granted
- 0.5 offline multiplier is intentional design to maintain online play motivation
- On connect: "Offline income: +N,NNNG!" popup + gold shower particles

---

## §7. Score System

### 7.1 Score = Total Income (totalEarned)
- For the idle genre, **total income (G)** serves as the progress indicator rather than a separate "score"
- Recorded in localStorage: `totalEarned`, `maxPrestigeStars`, `prestigeCount`, `fastestPrestige`

### 7.2 Milestone Display
| Total Income | Title | Reward |
|-------------|-------|--------|
| 1,000G | Novice Farmer | -- |
| 10,000G | Skilled Farmer | Prestige unlocked |
| 100,000G | Farm Owner | -- |
| 1,000,000G | Farm Master | Special particles (golden rain) |
| 10,000,000G | Agricultural Emperor | Special background (golden sky) |

### 7.3 Number Display Format
- 1,000+: `1.2K`
- 1,000,000+: `1.5M`
- 1,000,000,000+: `2.1B`
- One decimal place (e.g., `12.3K`)

### 7.4 Save Data Structure
```javascript
const SAVE_KEY = 'miniIdleFarm_v1';
const defaultSaveData = {
  gold: 0,
  totalEarned: 0,
  plots: [], // [{type, level, growthTimer, speedLevel, yieldLevel}]
  upgrades: { autoHarvest: 0, autoSell: false, fertilizer: 0 },
  prestige: { stars: 0, totalStars: 0, count: 0, upgrades: {} },
  stats: { fastestPrestige: Infinity, totalClicks: 0, startTime: 0 },
  lastSaveTime: Date.now()
};
```

---

## §8. Technical Specifications

### 8.1 CONFIG Object (1:1 Correspondence with Spec §6 Values)
```javascript
const CONFIG = {
  // §6.1 Resource values
  CROPS: {
    wheat:   { growTime: 3, baseYield: 1, sellPrice: 2,  unlockCost: 0 },
    carrot:  { growTime: 5, baseYield: 1, sellPrice: 3,  unlockCost: 50 },
    tomato:  { growTime: 8, baseYield: 1, sellPrice: 5,  unlockCost: 200 },
    corn:    { growTime: 6, baseYield: 1, sellPrice: 4,  unlockCost: 120 },
  },
  ANIMALS: {
    chicken: { growTime: 10, baseYield: 1, sellPrice: 8,  unlockCost: 500 },
    cow:     { growTime: 15, baseYield: 1, sellPrice: 12, unlockCost: 1500 },
    sheep:   { growTime: 12, baseYield: 1, sellPrice: 15, unlockCost: 2000 },
  },
  FACTORY: {
    bread:   { growTime: 20, baseYield: 1, sellPrice: 25, unlockCost: 8000 },
    cheese:  { growTime: 25, baseYield: 1, sellPrice: 35, unlockCost: 15000 },
    sweater: { growTime: 30, baseYield: 1, sellPrice: 50, unlockCost: 25000 },
  },

  // §6.2 Upgrade values
  SPEED_UPGRADE: {
    baseMult: 1.5,
    maxLevel: 10,
    reductionPerLevel: [0.10, 0.10, 0.10, 0.10, 0.10, 0.08, 0.08, 0.08, 0.08, 0.08]
  },
  YIELD_UPGRADE: { baseMult: 2.0, maxLevel: 5 },
  AUTO_HARVEST_COST: [500, 5000, 30000],
  AUTO_SELL_COST: 2000,
  FERTILIZER_COST: [10000, 100000],
  FERTILIZER_MULT: [1.5, 2.0],

  // §6.3 Prestige values
  PRESTIGE_THRESHOLD: 10000,
  PRESTIGE_STAR_FORMULA: function(totalEarned) {
    return Math.floor(Math.sqrt(totalEarned / 1000));
  },
  PRESTIGE_SPEED_BONUS: 0.10,   // +10% per star

  // §6.5 Offline
  OFFLINE_MAX_HOURS: 4,
  OFFLINE_MULT: 0.5,

  // §8.2 Save
  AUTO_SAVE_INTERVAL: 30,  // seconds

  // §4.5 UI
  MIN_TOUCH_TARGET: 48,    // px
  MANUAL_HARVEST_BONUS: 1.5,

  // §2.2 Expansion conditions
  RANCH_UNLOCK: 5000,
  FACTORY_UNLOCK: 50000,

  // §7.2 Milestones
  MILESTONES: [
    { threshold: 1000,     title: 'Novice Farmer' },
    { threshold: 10000,    title: 'Skilled Farmer' },
    { threshold: 100000,   title: 'Farm Owner' },
    { threshold: 1000000,  title: 'Farm Master' },
    { threshold: 10000000, title: 'Agricultural Emperor' },
  ],
};
```

### 8.2 Save Policy
- **Auto-save**: At 30-second intervals (`AUTO_SAVE_INTERVAL`)
- **Event save**: On upgrade purchase, prestige execution, slot placement change
- **In-memory object reference**: `saveData` object maintained in memory, localStorage access only at save points [Cycle 12 lesson]
- **try-catch wrapping**: Game continues even if localStorage access fails
- **Check first, save later**: Milestone achievement check → Popup display → Save order [Cycle 2 lesson]

### 8.3 Shared Engine Modules (Same Interface)
- **TweenManager**: UI transitions, gold popups, prestige effects. Includes `clearImmediate()` API [Cycle 4-5]
- **ObjectPool**: Particles (50 harvest stars, 20 gold numbers) pre-allocated
- **SoundManager**: Web Audio procedural sounds (harvest pop, purchase chime, level-up fanfare, prestige sound)
- **TransitionGuard**: `beginTransition()` + `STATE_PRIORITY` + `_transitioning` guard

### 8.4 Sound Design (Web Audio Procedural)
| Event | Sound | Implementation |
|-------|-------|---------------|
| Manual harvest | Bright "pop" | Sine 880Hz, 0.05s decay |
| Auto harvest | Soft "tick" | Sine 440Hz, 0.03s decay, vol 0.3 |
| Upgrade purchase | Rising chime | Sine C5→E5→G5, 0.08s each |
| Slot unlock | Fanfare | Sine C4→E4→G4→C5, 0.1s each |
| Prestige | Majestic rising tone | Sine C4→G4→C5→E5→G5, 0.12s each + reverb |
| Milestone reached | Celebration SFX | Sine chord (C+E+G) 0.3s + Triangle bass |

---

## §9. UI Details

### 9.1 Tab Configuration

#### Tab 1: Farm (Default)
- Top: Gold display + Pause button (48×48) + Prestige star count
- Center: 2×3 (3×4 when expanded) farm grid
  - Each slot: Crop/livestock icon + growth progress bar (bottom) + sparkle when ready
  - Empty slot: "+" icon (tap to open placement menu)
- Bottom: Tab switch bar (height 56px)

#### Tab 2: Upgrades
- Scrollable upgrade list (each item height 64px)
- Each item: Icon | Name | Current level/max | Effect description | Cost button
- Grayed button + red cost when unaffordable
- Categories: Production speed / Yield / Automation / Special

#### Tab 3: Prestige
- Current total income display
- Preview of stars earned on reset: "Reset to earn N stars!"
- Current stars held + prestige upgrade list
- "Reset Farm" button (disabled if totalEarned < PRESTIGE_THRESHOLD)
- Statistics: Prestige count, max stars, fastest prestige time

### 9.2 Canvas Modal (Replaces confirm/alert)
- Prestige confirmation: "Are you sure you want to reset the farm?\nYou will earn N stars." + [Confirm] [Cancel]
- Semi-transparent black overlay (alpha 0.7) + center panel (400×200px) + tween fade-in
- TweenManager.update() called even during modal [Cycle 2 lesson]

### 9.3 Placement Menu
- Popup menu displayed above the slot when empty slot is clicked
- List of currently unlocked crops/livestock/processed goods
- Each item: Icon + Name + Placement cost (first placement free, 50% cost for change)
- Close on click outside menu

### 9.4 Offline Income Popup
- Popup at screen center on reconnection: "Welcome back! Offline income: +N,NNNG"
- Gold-colored text + 10 coin particles flying upward from below
- Auto-close after 3 seconds or tap to instantly close

---

## §10. Pure Function Design Principle

All game logic functions are written as **pure functions that receive data through parameters**. Direct global state reference forbidden. [Cycle 6-7 lesson]

### Function Signature List
```javascript
// Production system
function updateProduction(dt, plots, config, prestigeMult) // -> updatedPlots
function calculateYield(plot, config, prestigeUpgrades) // -> number
function calculateGrowthTime(plot, config, prestigeUpgrades, fertilizerMult) // -> number

// Economy system
function canAfford(gold, cost) // -> boolean
function purchaseUpgrade(gold, upgrade, level, config) // -> {newGold, newLevel}
function calculateUpgradeCost(baseCost, level, multiplier) // -> number
function sellResource(resource, amount, config, prestigeUpgrades) // -> goldEarned

// Prestige system
function calculatePrestigeStars(totalEarned, config) // -> number
function applyPrestigeReset(saveData, newStars) // -> newSaveData
function calculatePrestigeMult(stars, config) // -> number

// Offline income
function calculateOfflineEarnings(lastSaveTime, plots, config, prestigeMult) // -> gold

// Number formatting
function formatNumber(n) // -> string  (1234 -> "1.2K")
function formatTime(seconds) // -> string  (125 -> "2:05")

// Rendering (pure functions - ctx is only side-effect)
function drawPlot(ctx, x, y, w, h, plot, config) // -> void
function drawUpgradeItem(ctx, x, y, w, h, upgrade, canBuy) // -> void
function drawProgressBar(ctx, x, y, w, h, progress, color) // -> void
```

---

## §11. Performance Optimization

### 11.1 Rendering Optimization
- **Change-detection rendering**: Only re-render farm grid when farmDirty flag is true. Avoids full redraw every frame
- **Offscreen canvas cache**: Background (sky+grass+ground) regenerated only on resize and cached [Cycle 5 pattern]
- **Particle ObjectPool**: 50 harvest particles + 20 gold popups pre-allocated. Prevents GC spikes

### 11.2 Computation Optimization
- **In-memory saveData**: localStorage access only at save points (30-second intervals + events)
- **Production calculation batch**: Iterates individual plots each frame but cost is O(N) (N=max 12 slots, lightweight)
- **Timer-based**: No physics engine/collision detection. Only delta-time based timers for minimal CPU load

### 11.3 Memory Optimization
- Total object count ceiling: 12 plots + 70 particles + 20 popups + 10 tweens = ~112 objects
- No large arrays/maps. Lightweight memory footprint

---

## §12. Implementation Checklist & Quality Gates

### §12.0 Pre-review Smoke Test (MANDATORY) [Cycle 13 CRITICAL Lesson]
- [ ] Confirm `index.html` file exists (`test -f index.html`)
- [ ] Page loads successfully in browser (not blank screen)
- [ ] 0 console errors, 0 warnings
- [ ] Title screen displays → Click → Game starts confirmed
- [ ] At least 1 harvest → Gold increases confirmed

### §12.1 Zero Asset Policy (Addressing 13-cycle Recurrence)
- [ ] Confirm `assets/` directory **does not exist**
- [ ] Confirm `manifest.json` file **does not exist**
- [ ] 0 instances of `fetch(`, `Image(`, `new Image`, `.svg`, `.png`, `.jpg` strings in code
- [ ] 0 instances of `ASSET_MAP`, `SPRITES`, `preloadAssets` strings in code
- [ ] 0 external resource loads (Google Fonts, CDN, etc.)
- [ ] **Template/boilerplate copying forbidden** - Write from scratch in empty file

### §12.2 Code Quality
- [ ] `'use strict'` declared at top
- [ ] All variables declared with `let`/`const` before first reference [Cycle 11 TDZ]
- [ ] Full verification of declared variable usage - 0 ghost variables [Cycle 2-3]
- [ ] 0 empty if/else blocks - Dead code forbidden [Cycle 12]
- [ ] 0 instances of `setTimeout` for state transitions [Cycle 2]
- [ ] 0 instances of `confirm()`, `alert()`, `prompt()` usage [Cycle 1]
- [ ] Game loop `try-catch` wrapping [Cycle 10]

### §12.3 Architecture Verification
- [ ] All state transitions go through `beginTransition()` [Cycle 5, 8]
- [ ] `clearImmediate()` API - Used instead of cancelAll [Cycle 4]
- [ ] State×system matrix (§5.3) double-included as code comments
- [ ] Confirmed `updateProduction()` called in all UI tabs during PLAYING state [Cycle 11]
- [ ] Single update path per value (tween OR direct assignment) [Cycle 5]

### §12.4 Pure Function Verification
- [ ] 0 direct global state references in all §10 functions
- [ ] All function parameter → return value traceable
- [ ] Full verification of all call sites when changing function signatures [Cycle 10]

### §12.5 Spec-Implementation Consistency (Per-item Detail)
- [ ] CONFIG object values ↔ §6 value table 1:1 cross-check [Cycle 7]
  - [ ] 4 crop types growTime/sellPrice match
  - [ ] 3 livestock types growTime/sellPrice match
  - [ ] 3 processed goods growTime/sellPrice match
  - [ ] Upgrade cost formulas match
  - [ ] Prestige formula match
  - [ ] Offline multiplier 0.5 match
- [ ] 5 milestone thresholds match
- [ ] All UI elements touch target 48px+ [Cycle 12]

### §12.6 Feature Completeness (A+B Separated Verification) [Cycle 12 Lesson]
- [ ] Manual harvest: (A) Instant harvest on tap + (B) 50% bonus applied
- [ ] Auto harvest: (A) Auto harvest works + (B) Manual bonus not applied
- [ ] Prestige: (A) Gold/upgrades reset + (B) Star calculation accurate + (C) Permanent multiplier applied
- [ ] Offline income: (A) Elapsed time calculation + (B) 0.5 multiplier applied + (C) Max 4 hours cap
- [ ] Long press continuous purchase: (A) Starts after 500ms + (B) 100ms interval repeat
- [ ] Farm expansion: (A) Ranch unlock at 5,000G + (B) Factory unlock at 50,000G

### §12.7 Initialization Order Verification
```
1. CONFIG object declaration
2. Utility function declarations (formatNumber, etc.)
3. TweenManager, ObjectPool, SoundManager, TransitionGuard declarations
4. Game state variable declarations (saveData, uiState, etc.)
5. Canvas/ctx initialization + resizeCanvas()
6. Input event listener registration
7. loadSaveData() - localStorage -> saveData
8. enterState(TITLE)
9. requestAnimationFrame(loop)
```
**All let/const variables declared before step 4. Variables referenced by resizeCanvas() declared before step 3. [Cycle 11 TDZ lesson]**

### §12.8 Browser Compatibility
- [ ] Chrome 90+ works correctly
- [ ] Firefox 90+ works correctly
- [ ] Safari 15+ works correctly
- [ ] Mobile Chrome/Safari touch works correctly
- [ ] Works inside iframe (localStorage try-catch)

### §12.9 Game Loop Defense Pattern
```javascript
function loop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    // ... update & render ...
  } catch (e) {
    console.error('[MiniIdleFarm] Loop error:', e);
  }
  requestAnimationFrame(loop);
}
```

### §12.10 Out of Scope Items (Explicitly Excluded)
- Common engine module separation (`shared/engine.js`) - Separate task
- CI pre-commit hook registration - Separate infra task
- Multiplayer / Leaderboard - Requires server
- Daily challenge - Scope creep prevention, focus on core loop

---

## §13. Forbidden Pattern Automated Verification Script

### §13.1 Verification Items (Run After Implementation Complete)
```bash
#!/bin/bash
echo "=== Mini Idle Farm Forbidden Pattern Verification ==="
FAIL=0

# 1. Check assets/ directory existence
if [ -d "assets" ]; then echo "FAIL: assets/ directory exists"; FAIL=1; fi

# 2. Check manifest.json existence
if [ -f "manifest.json" ]; then echo "FAIL: manifest.json exists"; FAIL=1; fi

# 3. External asset references
if grep -qiE '(fetch\(|new Image|\.svg|\.png|\.jpg|\.gif|\.mp3|\.wav)' index.html; then
  echo "FAIL: External asset reference found"; FAIL=1; fi

# 4. Forbidden patterns
if grep -qE '(ASSET_MAP|SPRITES|preloadAssets)' index.html; then
  echo "FAIL: Asset-related code remains"; FAIL=1; fi

# 5. confirm/alert/prompt
if grep -qE '\b(confirm|alert|prompt)\s*\(' index.html; then
  echo "FAIL: confirm/alert/prompt usage"; FAIL=1; fi

# 6. setTimeout state transitions
if grep -qE 'setTimeout.*state\s*=' index.html; then
  echo "FAIL: setTimeout state transition"; FAIL=1; fi

# 7. Google Fonts / CDN
if grep -qiE '(fonts\.googleapis|cdn\.)' index.html; then
  echo "FAIL: External CDN reference"; FAIL=1; fi

# 8. Empty blocks
if grep -qE '\{\s*\}' index.html; then
  echo "WARN: Empty block found (manual check needed)"; fi

if [ $FAIL -eq 0 ]; then echo "ALL PASS"; else echo "VERIFICATION FAILED"; exit 1; fi
```

---

_InfiniTriX Game Design / Cycle #13 / 2026-03-21_
_Designer: Claude Agent_
