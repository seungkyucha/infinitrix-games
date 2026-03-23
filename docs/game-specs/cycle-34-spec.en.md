---
game-id: corsair-tides
title: 해적의 조류
genre: casual, strategy
difficulty: medium
---

# Corsair Tides — Cycle #34 Game Design Document

> **One-Page Summary**: A fishing village boy receives the legendary Pirate King's compass and conquers 5 ocean regions through **port management + naval battle strategy roguelite**. Build facilities, trade, and construct ships at port (casual), then deploy fleets, execute cannon tactics, and boarding operations (strategy) to defeat enemy fleets and sea bosses. 5 regions × 3~4 islands = 17 base stages + 5 region bosses + hidden Legendary Island = **23 total stages**. Ship unlock tree (12 types) × crew skills (8 fields) × port facilities (5 levels) permanent progression + procedural route events, weather changes, and randomized enemy compositions for high replay value. **casual+strategy combo achieves 10 consecutive unique genre combinations (#25~#34) — platform's first complete 10-combo cycle!** First pirate theme on the platform, introducing maritime Canvas visuals.

> **MVP Boundary**: Phase 1 (Core loop: port management→departure→naval battle→return, Regions 1~2 + 2 bosses + 4 basic ships + 6 facilities + 4 crew skill fields) → Phase 2 (Regions 3~5 + 3 bosses + Hidden Legendary Island + full narrative + 12 ships + all facilities + 8 crew fields + treasure map collection). **Phase 1 must deliver a complete game experience on its own.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅
> Items below have been verified across 17~33 cycles and are documented in platform-wisdom.md. Only **applicable sections** are listed here.

| ID | Lesson Summary | Section |
|----|---------------|---------|
| F1 | Never create assets/ directory — 17 consecutive cycles [Cycle 1~33] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm()/alert() in iframe → Canvas modals [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] | §5.2 |
| F5 | Guard flags for one-time tween callback execution [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system [Cycle 3 B2] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numeric consistency table (spec=code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target min 48×48px + Math.max enforcement [Cycle 12~33] | §3.3 |
| F12 | TDZ prevention: INIT_EMPTY pattern [Cycle 5~33] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path per value [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22~33] | §14.3 |
| F16 | Unified hitTest() function [Cycle 27] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG 100% usage (zero Math.random) [Cycle 19~33] | §5.2, §14.3 |
| F19 | Procedural SFX + BGM (Web Audio API) [Cycle 19~33] | §12 |
| F20 | Multilingual support (ko/en) [Cycle 27~33] | §13 |
| F21 | Single beginTransition definition [Cycle 32] | §6.1 |
| F22 | Delete all orphaned SVGs [Cycle 32] | §4.1 |

### New Feedback (Cycle #33 Lessons) 🆕

| ID | Lesson | Section | Solution |
|----|--------|---------|----------|
| F23 | Boss weakness conditions must align with ability unlock order [Cycle 33] | §10.4 | Ship unlock → region accessibility map table |
| F24 | Extreme build DPS validation required for roguelite combinations [Cycle 33] | Appendix A | 3 extreme builds verified with formulas + auto-exclude on cap overflow |
| F25 | Hybrid procedural generation variation range needs replay verification [Cycle 33] | §10.2 | Pre-defined base routes + 30~50% randomized elements |
| F26 | Dual-phase games need ACTIVE_SYSTEMS matrix split by phase [Cycle 24] | §6.2 | port/battle columns separately managed, mutually exclusive |
| F27 | DPS/EHP balance formula assumptions must be explicit + DDA fallback [Cycle 24] | §8.2 | "Player evasion 40%" assumption + -15% enemy HP after 3 consecutive losses |
| F28 | Permanent vs. per-run progression must strengthen different axes [Cycle 29] | §9 | Permanent=ships/facilities(combat power), Per-run=crew buffs/supplies(tactical flexibility) |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
A fishing village boy named 'Tide' obtains the legendary Pirate King's compass and builds the mightiest pirate fleet while conquering 5 ocean regions. Dual satisfaction: **management growth** (visual pleasure of port development) + **tactical naval battles** (fleet positioning and cannon timing).

### 1.2 Core Fun Elements
1. **Visual growth satisfaction**: Humble fishing village → thriving pirate fortress
2. **Tactical naval battles**: Read wind/currents, position fleet, destroy enemies
3. **Exploration & discovery**: Procedural route events, treasure map piece collection
4. **Permanent progression fulfillment**: Ship unlock tree, crew skills, facility upgrades
5. **Roguelite replayability**: Different enemies, events, and weather each route

### 1.3 Narrative Arc
- **Prologue**: Pirate King's compass washes ashore at a fishing village
- **Region 1 (Caribbean)**: First voyage, learning pirate basics
- **Region 2 (Mediterranean)**: Trading with merchant guilds, navy appears
- **Region 3 (Indian Ocean)**: Storm waters, Kraken emergence
- **Region 4 (South China Sea)**: Ghost fleet confrontation
- **Region 5 (North Atlantic)**: Final battle with the Admiral
- **Hidden**: 7 treasure map pieces → Legendary Island (Pirate King's legacy)

---

## §2. Game Rules & Objectives

### 2.1 Victory Conditions
- Defeat all 5 region bosses to earn the Pirate King title
- (Optional) Collect 7 treasure map pieces → Clear the Legendary Island

### 2.2 Defeat Conditions
- Flagship HP reaches 0 in naval battle → Return to port (50% supplies lost)
- Port gold falls to 0 or below → Game Over (permanent progress preserved)

### 2.3 Core Loop
```
[Port Phase] → [Departure Prep] → [Route Travel] → [Battle/Event] → [Rewards] → [Return] → [Port Phase]
     ↓              ↓                  ↓                 ↓              ↓           ↓
  Build facilities  Fleet setup     Random events    Tactical combat  Loot       Upgrade
  Trade/income     Buy supplies    Weather changes   Boss battles    Experience  Unlock ships
  Hire crew        Choose route    Current effects   Boarding ops    Map pieces  Skill upgrades
```

---

## §3. Controls

### 3.1 Keyboard
| Key | Port Phase | Battle Phase |
|-----|-----------|-------------|
| Mouse click | Select/build/upgrade facility | Select ship/issue move order |
| 1~4 | Quick facility tab switch | Cannon type selection (Standard/Chain/Explosive/Grapeshot) |
| Space | Confirm trade | Broadside (selected ship) |
| E | Depart on expedition | Boarding action (when adjacent) |
| Tab | Cycle facility tabs | Select next ship |
| Esc | Game menu | Retreat confirmation modal |
| R | — | Change formation (Attack↔Defense↔Wedge) |

### 3.2 Mouse
- **Port**: Click to select facility, drag to scroll map, wheel to zoom
- **Battle**: Click to select ship → right-click for move/attack order, drag for area selection

### 3.3 Touch (Mobile)
- **Port**: Tap to select facility, swipe to scroll, pinch to zoom
- **Battle**: Tap to select ship → tap for move order, long-press for attack order
- All buttons minimum 48×48px (`Math.max(CONFIG.MIN_TOUCH, size)` enforced) — [F11]
- Unified hitTest() for touch/mouse — [F16]

**Mobile button layout (≤400px):**
```
┌────────────────────────────┐
│  [≡]                 [⚓]  │  ≡=menu, ⚓=return to port
│                            │
│        Game Area           │
│                            │
│  [🔄]  [💰]         [⚔️]  │  🔄=formation, 💰=trade, ⚔️=attack
│  [1][2][3][4]       [📦]  │  1~4=cannon type, 📦=supplies
└────────────────────────────┘
```

**Mobile button layout (>400px):**
```
┌──────────────────────────────────┐
│  [≡]              [🗺️]    [⚓]  │
│                                  │
│           Game Area              │
│                                  │
│  [🔄][💰]              [⚔️][📦] │
│     [1] [2] [3] [4]             │
└──────────────────────────────────┘
```

---

## §4. Visual Style Guide

### 4.1 Asset Principles
- **Never create assets/ directory** — Target 18 consecutive compliance cycles [F1]
- **Zero external CDN/fonts** — All assets generated via Canvas/SVG inline [F2]
- **INIT_EMPTY pattern**: Empty object initialization → populate in `init()` via Canvas drawing [F12]
- SVG filters (feGaussianBlur, feDropShadow) **absolutely forbidden** — use Canvas shadow/glow instead

### 4.2 Color Palette
```
Ocean Theme:
  --ocean-deep:    #0a2463   (Deep sea)
  --ocean-mid:     #1e6091   (Mid-depth)
  --ocean-surface: #3da5d9   (Surface)
  --ocean-foam:    #d4f1f9   (Foam)

Port Theme:
  --port-wood:     #8b5e3c   (Wood)
  --port-stone:    #6b7b8d   (Stone)
  --port-gold:     #f0c040   (Gold coins)
  --port-rope:     #c4a35a   (Rope)

Battle Theme:
  --fire-cannon:   #ff6b35   (Cannon fire)
  --fire-explosion:#ff2e00   (Explosion)
  --smoke-light:   #b0b0b0   (Smoke)
  --boarding-steel:#c0c0c0   (Melee)

UI:
  --ui-parchment:  #f5e6c8   (Parchment background)
  --ui-ink:        #2a1810   (Ink text)
  --ui-accent:     #c9302c   (Accent red)
  --ui-gold:       #ffd700   (Accent gold)
```

### 4.3 Background & Environment
- **Port**: Dock + buildings + sea 3-layer parallax
- **Battle**: Ocean wave animation + sky (time-of-day changes) + distant island silhouettes
- **Weather**: Clear (default), Cloudy (slight visibility reduction), Storm (enhanced waves + major visibility reduction), Fog (extreme visibility reduction)
- **Time of day**: Dawn (orange), Day (blue), Sunset (red), Night (indigo) — default per region + elapsed time

### 4.4 Drawing Function Standard Signatures [F9]
```javascript
// All drawing functions are pure — no direct global state reference
drawShip(ctx, x, y, size, shipType, rotation, dmgRatio, flags)
drawBuilding(ctx, x, y, w, h, buildingType, level, isSelected)
drawWave(ctx, x, y, w, h, time, weatherType)
drawCannon(ctx, x, y, angle, firingState, cannonType)
drawUI_Button(ctx, x, y, w, h, label, isHovered, isPressed)
drawUI_ResourceBar(ctx, x, y, w, resource, maxResource, color)
drawBoss(ctx, x, y, size, bossType, phase, hpRatio, animFrame)
```

### 4.5 Inline SVG Asset List (20~25 items, each 400×400+ viewBox)

| # | Asset Name | Purpose | Size Target |
|---|-----------|---------|-------------|
| 1 | ship-sloop | Small sailing ship (starter) | 400×400, 12KB |
| 2 | ship-brigantine | Medium sailing ship | 400×400, 14KB |
| 3 | ship-galleon | Large sailing ship | 400×400, 16KB |
| 4 | ship-warship | Warship | 400×400, 16KB |
| 5 | ship-flagship | Flagship (final) | 400×400, 18KB |
| 6 | boss-pirate-king | Boss 1: Pirate King | 600×400, 20KB |
| 7 | boss-kraken | Boss 2: Kraken | 600×400, 22KB |
| 8 | boss-ghost-ship | Boss 3: Ghost Ship | 600×400, 20KB |
| 9 | boss-admiral | Boss 4: Naval Admiral | 600×400, 20KB |
| 10 | boss-leviathan | Boss 5: Leviathan (final) | 600×400, 22KB |
| 11 | building-dock | Port shipyard | 400×400, 10KB |
| 12 | building-warehouse | Warehouse | 400×400, 10KB |
| 13 | building-tavern | Tavern (crew hiring) | 400×400, 12KB |
| 14 | building-market | Trading post | 400×400, 10KB |
| 15 | building-fort | Defense fortress | 400×400, 12KB |
| 16 | building-lighthouse | Lighthouse | 400×400, 10KB |
| 17 | env-island-tropical | Tropical island | 400×300, 10KB |
| 18 | env-island-rocky | Rocky reef island | 400×300, 10KB |
| 19 | env-storm-clouds | Storm clouds | 400×200, 8KB |
| 20 | env-sea-monster | Sea creature | 400×300, 12KB |
| 21 | ui-compass | Compass UI | 400×400, 10KB |
| 22 | ui-treasure-map | Treasure map | 400×400, 12KB |
| 23 | ui-anchor | Anchor icon | 200×200, 6KB |
| 24 | ui-skull-flag | Pirate flag | 300×300, 8KB |
| 25 | thumbnail | Thumbnail (cinematic) | 800×600, 22KB |

---

## §5. Core Game Loop (Frame-Based Logic Flow)

### 5.1 Initialization Order [F12 — INIT_EMPTY Pattern]
```javascript
// Step 1: Empty object declarations (TDZ prevention)
const G = {
  state: 'INIT', phase: 'PORT', ships: [], buildings: [],
  crew: [], gold: 0, supplies: 0, fame: 0,
  currentSea: 0, currentIsland: 0, weather: 'clear',
  wind: { dir: 0, force: 1 }, tide: { level: 0, rising: true },
  boss: null, treasureMap: [false,false,false,false,false,false,false],
  lang: 'ko', save: null, rng: null, tw: null, sfx: null,
  // Per-run variables
  runBuffs: [], runSupplies: 100, runMorale: 100
};

// Step 2: Canvas/context initialization
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Step 3: init() call — asset generation, sound init, save loading
function init() { /* ... */ }
```

### 5.2 Main Loop [F4, F5, F13, F14, F18]
```javascript
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // 50ms cap
    lastTime = timestamp;

    // System updates (per State×System matrix §6.2)
    if (ACTIVE_SYSTEMS[G.state].tween) G.tw.update(dt);
    if (ACTIVE_SYSTEMS[G.state].physics) updatePhysics(G, dt);
    if (ACTIVE_SYSTEMS[G.state].weather) updateWeather(G, dt);
    if (ACTIVE_SYSTEMS[G.state].economy) updateEconomy(G, dt);
    if (ACTIVE_SYSTEMS[G.state].ai) updateEnemyAI(G, dt);
    if (ACTIVE_SYSTEMS[G.state].particles) updateParticles(G, dt);
    if (ACTIVE_SYSTEMS[G.state].idle) updateIdleProduction(G, dt);

    // Rendering
    render(ctx, G, timestamp);

    requestAnimationFrame(gameLoop);
  } catch(e) {
    console.error('gameLoop error:', e);
    renderError(ctx, e);
  }
}
```

- **Zero setTimeout** — All delayed transitions via `G.tw.add()` + `onComplete` callback [F4]
- **Guard flags**: `if (G._transitioning) return; G._transitioning = true;` in onComplete [F5]
- **clearImmediate()**: Use instead of `cancelAll()` to prevent race conditions [F13]
- **Single update path**: Core variables like `G.wind.force` use either tween OR direct assignment, never both [F14]
- **SeededRNG**: `G.rng = new SeededRNG(seed)` — zero Math.random [F18]

---

## §6. State Machine

### 6.1 Game States [F6, F21]

```
INIT → TITLE → CUTSCENE → PORT → PORT_BUILD → PORT_TRADE → PORT_CREW
  → VOYAGE_PREP → VOYAGE_MAP → VOYAGE_EVENT → BATTLE_SETUP
  → BATTLE → BATTLE_BOSS → BOARDING → BATTLE_RESULT
  → UPGRADE → GAMEOVER → VICTORY → CONFIRM_MODAL → PAUSED → SETTINGS
```

**STATE_PRIORITY** (higher = more priority):
```javascript
const STATE_PRIORITY = {
  GAMEOVER: 100, VICTORY: 90, CONFIRM_MODAL: 80,
  BATTLE_BOSS: 70, BATTLE: 60, BOARDING: 55,
  BATTLE_SETUP: 50, BATTLE_RESULT: 45,
  VOYAGE_EVENT: 40, VOYAGE_MAP: 35, VOYAGE_PREP: 30,
  PORT: 20, PORT_BUILD: 20, PORT_TRADE: 20, PORT_CREW: 20,
  UPGRADE: 15, CUTSCENE: 10, TITLE: 5, SETTINGS: 3, PAUSED: 2, INIT: 0
};
```

**Single beginTransition() definition** — all state changes go through this [F21]:
```javascript
function beginTransition(fromState, toState, duration = 0.4) {
  if (STATE_PRIORITY[toState] < STATE_PRIORITY[G.state] && G.state !== fromState) return;
  if (G._transitioning) return;
  G._transitioning = true;
  G.tw.add({ target: G, props: { _transAlpha: 0 }, duration,
    onComplete: () => { enterState(toState); G._transAlpha = 1; G._transitioning = false; }
  });
}
```

**Exception**: PAUSED ↔ previous state uses `beginTransition(_, _, 0)` instant transition mode

**RESTART_ALLOWED whitelist** [Cycle 24]:
```javascript
const RESTART_ALLOWED = ['GAMEOVER', 'VICTORY', 'TITLE'];
```

### 6.2 State × System Matrix [F7, F26]

| State | Tween | Physics | Weather | Economy | AI | Particles | Idle | Input Mode | Render |
|-------|-------|---------|---------|---------|-----|-----------|------|-----------|--------|
| INIT | — | — | — | — | — | — | — | — | splash |
| TITLE | ✅ | — | ✅(bg) | — | — | ✅ | — | menu | title |
| CUTSCENE | ✅ | — | — | — | — | ✅ | — | skip | cutscene |
| PORT | ✅ | — | ✅ | ✅ | — | ✅ | ✅ | port | port |
| PORT_BUILD | ✅ | — | ✅ | ✅ | — | ✅ | ✅ | build | port+UI |
| PORT_TRADE | ✅ | — | ✅ | ✅ | — | ✅ | ✅ | trade | port+UI |
| PORT_CREW | ✅ | — | ✅ | ✅ | — | ✅ | ✅ | crew | port+UI |
| VOYAGE_PREP | ✅ | — | ✅ | — | — | ✅ | — | prep | prep |
| VOYAGE_MAP | ✅ | ✅(move) | ✅ | — | — | ✅ | — | navigate | map |
| VOYAGE_EVENT | ✅ | — | ✅ | — | — | ✅ | — | event | event |
| BATTLE_SETUP | ✅ | — | ✅ | — | — | ✅ | — | deploy | battle |
| BATTLE | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | combat | battle |
| BATTLE_BOSS | ✅ | ✅ | ✅ | — | ✅(boss) | ✅ | — | combat | battle |
| BOARDING | ✅ | — | ✅ | — | ✅(board) | ✅ | — | boarding | boarding |
| BATTLE_RESULT | ✅ | — | ✅ | — | — | ✅ | — | limited | result |
| UPGRADE | ✅ | — | — | — | — | ✅ | — | upgrade | upgrade |
| GAMEOVER | ✅ | — | — | — | — | ✅ | — | limited | gameover |
| VICTORY | ✅ | — | — | — | — | ✅ | — | limited | victory |
| CONFIRM_MODAL | ✅ | — | — | — | — | — | — | modal | prev+modal |
| PAUSED | ✅ | — | — | — | — | — | ✅(bg) | menu | prev+pause |
| SETTINGS | ✅ | — | — | — | — | — | — | settings | settings |

> **Key [F26]**: PORT-series and BATTLE-series activate mutually exclusive systems (Economy vs AI). Idle system runs in PORT-series + PAUSED to guarantee idle income [Cycle 11].

### 6.3 Input Mode Details [Cycle 26]

| Mode | Allowed Inputs |
|------|---------------|
| menu | Click/tap (menu buttons only) |
| port | Facility click, tab switch, scroll/zoom |
| build | Build location selection, building type, cancel |
| trade | Trade goods selection, quantity adjustment, confirm/cancel |
| crew | Crew selection, assignment, skill allocation |
| prep | Fleet composition, supply purchase, route selection, depart |
| navigate | Fleet movement direction, speed control |
| event | Choice click (2~3 options) |
| deploy | Ship placement, formation selection, start battle |
| combat | Ship select, move/attack orders, cannon type, boarding |
| boarding | Attack/defend timing clicks |
| limited | Confirm/next buttons only |
| upgrade | Upgrade selection, confirm/cancel |
| modal | Confirm/cancel |
| skip | Any key/tap → skip |
| settings | Setting toggles, volume control, language switch |

### 6.4 Canvas-Based Modals [F3]
- **Never** use `confirm()`/`alert()`
- All confirmation UIs (retreat, purchase, game over) rendered on Canvas
- Modal display: background dim (alpha 0.6) + animation (scale 0→1 tween)

---

## §7. Core System Details

### 7.1 Port Management System (casual)

#### 7.1.1 Facility List

| Facility | Lv1 Effect | Lv2 | Lv3 | Lv4 | Lv5 | Build Cost |
|----------|-----------|-----|-----|-----|-----|-----------|
| Shipyard | Build small ships | Medium | Large | Warship | Flagship | 100/300/600/1200/2500 |
| Warehouse | Resource cap +50 | +100 | +200 | +400 | +800 | 80/200/400/800/1600 |
| Tavern | Recruit 2 crew | 3 | 4 | 5 | 6 | 60/150/350/700/1400 |
| Trading Post | 2 trade goods | 3 | 4 | 5 | 6 | 120/250/500/1000/2000 |
| Fortress | Port defense +10 | +20 | +35 | +55 | +80 | 150/350/700/1400/2800 |
| Lighthouse | Vision +1 | +2 | +3 | +4 | +5 | 50/120/250/500/1000 |

#### 7.1.2 Trading System
- Goods: Spices, Silk, Gunpowder, Rum, Gems, Rare Timber (6 types)
- Each region has specialties (buy cheap) ↔ rarities (sell expensive)
- Trade profit = `(sell price - buy price) × quantity × trading post level bonus`
- **Auto-trade**: Unlocked at Lighthouse Lv3, periodic small automatic income (idle element)

#### 7.1.3 Crew Hiring & Assignment
- 8 crew fields: Navigation, Gunnery, Melee, Repair, Scouting, Trading, Cooking, Medicine
- Each field Lv1~5, each crew member has 1 primary + 1 secondary specialty
- Ship crew slots: Small 2, Medium 4, Large 6, Warship 8, Flagship 10

### 7.2 Naval Battle System (strategy)

#### 7.2.1 Fleet Deployment
- Position ships in BATTLE_SETUP phase (grid-based, left-side placement)
- Formations: Attack (▶), Defense (■), Wedge (▲) — each with bonuses/penalties

| Formation | Attack | Defense | Move Speed |
|-----------|--------|---------|-----------|
| Attack | +20% | -10% | +10% |
| Defense | -10% | +25% | -15% |
| Wedge | +10% | +10% | -5% |

#### 7.2.2 Cannon Types
| Type | Damage | Range | Cooldown | Special Effect |
|------|--------|-------|----------|---------------|
| Standard (Ball) | 100% | Single | 2s | — |
| Chain (Chain Shot) | 60% | Single | 3s | Move speed -30%, 3s |
| Explosive (Bomb) | 80% | AoE 2 cells | 4s | Fire (5 dmg/s, 5s) |
| Grapeshot | 40%×3 | Fan 3 cells | 3s | Increased crew damage |

#### 7.2.3 Wind/Current System
- **Wind**: 8 directions, strength 1~3 — tailwind +speed, headwind -speed, crosswind drift
- **Currents**: Auto-movement in specific direction — fixed pattern per region + weather variation
- **Wind change**: Every 3~5 turns, SeededRNG prediction (shown in UI)

#### 7.2.4 Boarding Action (Close Combat)
- Initiate when ships are adjacent via E key/tap
- Mini-game: Timing clicks (3 rounds) — click within attack window (0.8s) for damage
- Higher melee skill expands the window

### 7.3 Route Event System

Events occur via SeededRNG during route travel (30~50% randomization) [F25]:

| Event | Chance | Effect | Response Options |
|-------|--------|--------|-----------------|
| Drifting Merchant | 15% | Discounted trade | Buy/Ignore |
| Pirate Raid | 20% | Enter battle | Fight/Negotiate(pay gold)/Flee(50%) |
| Storm | 15% | Ship damage 10~30% | Push through(damage)/Detour(time+2) |
| Sea Creature | 10% | Kraken/whale etc. | Fight/Observe(info reward) |
| Treasure Island | 10% | Supplies/gold/map piece | Search(30% trap)/Ignore |
| Stranded Crew | 10% | Free crew gained | Rescue/Ignore |
| Fog | 10% | Vision -3, 3 turns | Scout skill avoids |
| Friendly Fleet | 10% | Info/supplies | Trade/Accompany(next battle support) |

### 7.4 Weather System

| Weather | Vision | Move Speed | Hit Rate | Special |
|---------|--------|-----------|----------|---------|
| Clear | 100% | 100% | 100% | — |
| Cloudy | 80% | 100% | 90% | — |
| Rain | 60% | 90% | 75% | Fire duration -50% |
| Storm | 30% | 70% | 50% | 5 ship damage per turn |
| Fog | 20% | 80% | 40% | Scout skill negated |

### 7.5 Boss Battles [F17]

5 region bosses + hidden boss:

| Boss | Region | HP | Phases | Core Mechanic | Required Ship |
|------|--------|-----|--------|--------------|--------------|
| Blackbeard (Pirate King) | Caribbean | 500 | 2 | Charge+cannon alternation | Small+ |
| Kraken | Indian Ocean | 800 | 3 | Tentacle dodge+weak spot | Medium+ |
| Ghost Fleet | South China Sea | 600×3 | 2 | Multi-ship in fog | Large+ |
| Naval Admiral | North Atlantic | 1000 | 3 | Formation break+flagship focus | Warship+ |
| Leviathan | Legendary Island | 1500 | 4 | Current shift+omnidirectional | Flagship |

**Boss Phase Transition Diagram (Kraken example)**:
```
[Phase 1: HP 100%~60%]
  3 tentacles active → destroy tentacles to expose body (3s)
  ↓ HP 60%
[Phase 2: HP 60%~25%]
  5 tentacles + ink spray (vision 0, 2s) → destroy all to expose body (2s)
  ↓ HP 25%
[Phase 3: HP 25%~0%]
  Full body exposed + whirlpool current → fire at center (avoid no-move zone)
```

**bossRewardGiven flag** [F17]:
```javascript
if (boss.hp <= 0 && !G._bossRewardGiven) {
  G._bossRewardGiven = true;
  giveReward(boss.rewards);
  beginTransition(G.state, 'BATTLE_RESULT');
}
```

---

## §8. Difficulty System

### 8.1 Region Balance Table

| Region | Enemy HP Range | Enemy ATK | Enemy Ships | Event Danger | Boss Difficulty |
|--------|---------------|----------|-------------|-------------|----------------|
| Caribbean | 50~120 | 10~20 | 1~2 | Low | ★☆☆☆☆ |
| Mediterranean | 100~250 | 20~40 | 2~3 | Med-Low | ★★☆☆☆ |
| Indian Ocean | 200~400 | 35~60 | 3~4 | Medium | ★★★☆☆ |
| South China Sea | 350~600 | 50~80 | 3~5 | Med-High | ★★★★☆ |
| North Atlantic | 500~900 | 70~110 | 4~6 | High | ★★★★★ |

### 8.2 Balance Formulas [F27]

**Player DPS**:
```
Base DPS = (cannon damage × gun ports) / cooldown
Effective DPS = base DPS × hit rate(weather) × formation bonus × crew gunnery bonus
```

**Enemy EHP**:
```
EHP = HP / (1 - defense rate)
Assumption: Player evasion rate 40% (formation defense + movement evasion)
Enemy effective DPS = enemy DPS × (1 - player evasion 0.4)
```

**Expected clear time**: `total enemy EHP / player effective DPS = 20~45s (per battle)`

**DDA Fallback** [F27]: 3 consecutive losses → enemy HP -15%, 5 losses → -25%

**DPS Cap** [Cycle 26, 33]: Max DPS = base DPS × 200%, synergy cap 150%
```javascript
function applyBuff(ship, buff) {
  const newDps = ship.baseDps * (1 + buff.dpsBonus);
  ship.dps = Math.min(newDps, ship.baseDps * CONFIG.DPS_CAP); // 200%
}
```

---

## §9. Permanent Progression System [F28]

### 9.1 Permanent Progression (Combat Power Axis) — Port Facilities + Ship Unlocks
| Category | Items | Effect Axis |
|---------|-------|------------|
| Shipyard upgrade | 12 ships sequential unlock | Firepower/Durability |
| Warehouse expansion | Resource cap increase | Economic scale |
| Fortress | Port defense | Survivability |
| Lighthouse | Vision range + auto-trade | Intel/Income |

### 9.2 Per-Run Progression (Tactical Flexibility Axis) — Route Event Rewards
| Category | Items | Effect Axis |
|---------|-------|------------|
| Crew buffs | Hired crew random abilities | Tactical options |
| Supplies | Repair kits, smoke bombs, grappling hooks etc. | Immediate combat options |
| Route intel | Preview next events | Strategic choices |
| Alliances | Friendly fleet accompaniment | Temporary power |

> **Permanent/Per-run Separation Principle** [F28]: Permanent = "what can you do" (ship types, facility scale), Per-run = "how do you do it" (crew composition, supply choices). The two axes never strengthen the same capability.

### 9.3 Ship Unlock Order → Region Accessibility Map [F23]

| Order | Ship | Unlock Condition | Accessible Regions |
|-------|------|-----------------|-------------------|
| 1 | Sloop | Starting ship | Caribbean |
| 2 | Catboat | Shipyard Lv1 + 100 gold | Caribbean |
| 3 | Brigantine | Caribbean boss defeated + Shipyard Lv2 | Caribbean, Mediterranean |
| 4 | Schooner | 500 gold + Shipyard Lv2 | Caribbean, Mediterranean |
| 5 | Galleon | Mediterranean boss defeated + Shipyard Lv3 | Caribbean~Indian Ocean |
| 6 | Caravel | 1200 gold + Shipyard Lv3 | Caribbean~Indian Ocean |
| 7 | Frigate | Indian Ocean boss defeated + Shipyard Lv4 | Caribbean~South China Sea |
| 8 | Corvette | 2000 gold + Shipyard Lv4 | Caribbean~South China Sea |
| 9 | Man-o-War | South China Sea boss defeated + Shipyard Lv5 | All regions |
| 10 | Ghost Ship (Special) | Collect 3 hidden treasures | All regions |
| 11 | Krakenship (Special) | Defeat Kraken 3 times | All regions |
| 12 | Pirate King Ship (Legend) | Clear Legendary Island | All regions + hidden |

> **BFS Reachability Verification**: Boss defeat → ship unlock → next region access chain is logically consistent. No region requires ships that can only be obtained from that region.

---

## §10. Procedural Generation [F25]

### 10.1 Base Route Structure (Pre-defined)
- Each region: 3~4 fixed islands + inter-island route graph pre-defined
- Route length and base event slot counts pre-defined

### 10.2 Variation Elements (SeededRNG Randomized)
- **Enemy composition**: Base ship types fixed + count ±1, placement random
- **Events**: §7.3 event pool probability selection per slot
- **Weather**: Base weather per route + 30% chance of variation
- **Treasure locations**: 7 map pieces placed differently each run
- **Variation range**: 30~50% of total content changes per run (ensuring replay variety)

### 10.3 Reachability Verification
```javascript
function validateRoute(seaMap, startIsland, bossIsland) {
  const visited = new Set();
  const queue = [startIsland];
  visited.add(startIsland);
  while (queue.length > 0) {
    const island = queue.shift();
    if (island === bossIsland) return true;
    for (const neighbor of seaMap.connections[island]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false; // Unreachable → regenerate route
}
```

---

## §11. Score System [F8]

### 11.1 Score Elements

| Element | Points | Notes |
|---------|--------|-------|
| Enemy ship sunk | HP proportional (10~90) | — |
| Boss defeated | 500/800/1000/1500/2000 | Per region |
| Trade profit | 10% of profit | — |
| Event success | 50~200 | Per event |
| Treasure map piece | 300/piece | — |
| Port facility built | Level × 100 | — |
| No-damage battle | Base × 1.5 | Bonus |
| Legendary Island clear | 5000 | Hidden |

**Judge first, save later** [F8]:
```javascript
function onBattleEnd(result) {
  const newScore = calculateScore(result);  // Judge first
  const isNewBest = newScore > loadBest();  // Compare
  saveBest(Math.max(newScore, loadBest())); // Save later
  return { newScore, isNewBest };
}
```

### 11.2 Fame System
- Earn fame from battle victories, trading, event completion
- Fame levels: Unknown(0) → Novice(100) → Pirate(500) → Captain(1500) → Admiral(3000) → Pirate King(5000)
- Higher fame unlocks crew hiring pool expansion, trade discounts, special events

---

## §12. Sound System [F19]

### 12.1 BGM (Web Audio API Procedural, 4+ tracks)

| BGM | Used States | Mood | BPM |
|-----|------------|------|-----|
| port_theme | PORT series | Peaceful harbor, accordion feel | 90 |
| voyage_theme | VOYAGE series | Adventurous, wind and waves | 110 |
| battle_theme | BATTLE, BOARDING | Tense, battle drums | 140 |
| boss_theme | BATTLE_BOSS | Grand, ominous | 160 |

### 12.2 SFX (Procedural, 8+ types)

| SFX | Trigger | Waveform |
|-----|---------|----------|
| cannon_fire | Cannon fired | noise burst + low freq |
| cannon_hit | Hit landed | noise + sine decay |
| explosion | Explosive hit | noise + distortion |
| wave_splash | Wave effect | filtered noise |
| coin_collect | Gold earned | sine sweep up |
| build_complete | Construction done | chord arpeggio |
| boarding_clash | Melee combat | noise burst short |
| boss_roar | Boss entrance | low sine + tremolo |
| level_up | Level up | ascending tones |
| horn_blow | Departure | sawtooth + reverb |

> **Web Audio scheduling**: Use `oscillator.start(ctx.currentTime + delay)` native scheduling, never setTimeout [Cycle 13]

---

## §13. Multilingual Support [F20]

```javascript
const I18N = {
  ko: {
    title: '해적의 조류', start: '게임 시작', port: '항구',
    voyage: '출항', battle: '전투', build: '건설',
    trade: '교역', crew: '선원', gold: '금화',
    supplies: '보급품', fame: '명성',
    // ... full UI text
  },
  en: {
    title: 'Corsair Tides', start: 'Start Game', port: 'Port',
    voyage: 'Set Sail', battle: 'Battle', build: 'Build',
    trade: 'Trade', crew: 'Crew', gold: 'Gold',
    supplies: 'Supplies', fame: 'Fame',
    // ...
  }
};
```

---

## §14. Code Hygiene & Verification

### 14.1 Numeric Consistency Table [F10]

| Spec Value | CONFIG Constant | Value |
|-----------|----------------|-------|
| Sloop HP | CONFIG.SHIP_HP[0] | 100 |
| Brigantine HP | CONFIG.SHIP_HP[1] | 200 |
| Galleon HP | CONFIG.SHIP_HP[2] | 350 |
| Warship HP | CONFIG.SHIP_HP[3] | 500 |
| Flagship HP | CONFIG.SHIP_HP[4] | 700 |
| Standard cannon dmg | CONFIG.CANNON_DMG[0] | 50 |
| Chain cannon dmg | CONFIG.CANNON_DMG[1] | 30 |
| Explosive cannon dmg | CONFIG.CANNON_DMG[2] | 40 |
| Grapeshot cannon dmg | CONFIG.CANNON_DMG[3] | 20×3 |
| DPS cap | CONFIG.DPS_CAP | 2.0 |
| Synergy cap | CONFIG.SYNERGY_CAP | 1.5 |
| DDA 3-loss adjustment | CONFIG.DDA_3LOSS | -0.15 |
| DDA 5-loss adjustment | CONFIG.DDA_5LOSS | -0.25 |
| Min touch size | CONFIG.MIN_TOUCH | 48 |
| Frame dt cap | CONFIG.MAX_DT | 0.05 |
| Boarding window | CONFIG.BOARD_WINDOW | 0.8 |

### 14.2 Code Hygiene Checklist (FAIL/WARN 2-tier) [Cycle 25]

**FAIL (Build failure)**:
1. `assets/` directory exists
2. `Math.random` call exists (not SeededRNG)
3. `setTimeout`/`setInterval` call exists
4. `confirm(`/`alert(` call exists
5. `feGaussianBlur`/`feDropShadow` SVG filter exists
6. External URL (http/https + external domain) exists
7. `Google Fonts`/CDN reference exists
8. Undeclared variable reference (let/const TDZ)
9. Missing DPS_CAP check in `applyBuff()`

**WARN (Advisory)**:
1. Drawing/logic functions referencing globals directly
2. Empty if/else blocks
3. Remaining TODO comments
4. Functions exceeding 50 lines
5. Code duplication 3+ times

### 14.3 Smoke Test Gate [F15]

Must pass before review submission:
1. ☐ index.html exists + browser load succeeds
2. ☐ Zero console errors
3. ☐ TITLE → PORT → VOYAGE_PREP → BATTLE → PORT full cycle complete
4. ☐ Boss battle entry + phase transition works
5. ☐ GAMEOVER → TITLE return normal
6. ☐ Save/load normal (localStorage)
7. ☐ Mobile touch controls normal (≤400px viewport)
8. ☐ Language switch (ko↔en)
9. ☐ Zero Math.random (grep verification)
10. ☐ Zero setTimeout (grep verification)
11. ☐ No assets/ directory (ls verification)

---

## §15. Code Region Guide (8 REGIONS)

```javascript
// ─── REGION 1: CONFIG & CONSTANTS (lines 1~150) ───
// ─── REGION 2: UTILS (SeededRNG, TweenManager, SoundManager) (lines 151~450) ───
// ─── REGION 3: I18N & ASSETS (inline SVG generation) (lines 451~900) ───
// ─── REGION 4: GAME STATE & INIT (lines 901~1100) ───
// ─── REGION 5: PORT SYSTEMS (management/trade/crew) (lines 1101~1600) ───
// ─── REGION 6: BATTLE SYSTEMS (naval/AI/boss) (lines 1601~2200) ───
// ─── REGION 7: RENDER (all Canvas drawing) (lines 2201~2800) ───
// ─── REGION 8: INPUT & MAIN LOOP (lines 2801~3220+) ───
```

---

## §16. localStorage Data Schema

```javascript
const SAVE_SCHEMA = {
  version: 3,
  key: 'corsair-tides-save',
  data: {
    gold: 0, fame: 0, totalScore: 0, bestScore: 0,
    buildings: { dock: 0, warehouse: 0, tavern: 0, market: 0, fort: 0, lighthouse: 0 },
    ships: ['sloop'],
    crewSkills: { nav: 0, gun: 0, melee: 0, repair: 0, scout: 0, trade: 0, cook: 0, medic: 0 },
    bossDefeated: [false, false, false, false, false],
    treasureMap: [false, false, false, false, false, false, false],
    legendIsland: false,
    settings: { lang: 'ko', sfxVol: 0.7, bgmVol: 0.5, dda: true },
    stats: { battlesWon: 0, battlesLost: 0, tradesCompleted: 0, eventsCleared: 0 }
  }
};
```

---

## §17. Previous Cycle Regret Resolution Summary

| Previous Issue | Cause | Resolution in This Spec | Section |
|---------------|-------|------------------------|---------|
| Boss weakness-ability unlock mismatch [C33] | Jutsu unlock↔boss linkage unspecified | Ship unlock→region access complete table | §9.3 |
| Extreme build balance breakdown [C33] | DPS cap verification missing | applyBuff() forced cap + Appendix A | §8.2, App.A |
| Procedural variation insufficient feel [C33] | Variation range unspecified | 30~50% variation range explicit | §10.2 |
| Dual-phase system mixing [C24] | ACTIVE_SYSTEMS not split | port/battle mutually exclusive columns | §6.2 |
| DDA assumptions unspecified [C24] | Evasion rate assumption missing | 40% assumption + 3/5-loss fallback | §8.2 |
| Permanent/per-run progression overlap [C29] | Same axis strengthened | Combat power/tactical flexibility split | §9 |

---

## §18. Game Page Metadata

```yaml
game:
  id: corsair-tides
  title: 해적의 조류
  description: A fishing village boy conquers 5 ocean regions through port management + naval strategy roguelite. Build facilities, lead your fleet, and find the legendary treasure!
  genre: [casual, strategy]
  playCount: 0
  rating: 0
  controls:
    - "Mouse: Select facility, ship move/attack orders"
    - "1~4: Cannon type selection"
    - "Space: Broadside"
    - "E: Boarding action"
    - "R: Change formation"
    - "Tab: Select next ship"
    - "Touch: Tap to select, long-press to attack"
  tags:
    - "#pirate"
    - "#port-management"
    - "#naval-battle"
    - "#strategy"
    - "#roguelite"
    - "#casual"
  addedAt: "2026-03-24"
  version: "1.0.0"
  featured: true
```

---

## Appendix A: Extreme Build Verification [F24]

### Build 1: Max Firepower (Flagship + Gunnery-spec crew)
```
Flagship base DPS = (50 × 10 ports) / 2s = 250 DPS
Gunnery Lv5 bonus = +50%
Attack formation bonus = +20%
Total DPS = 250 × 1.5 × 1.2 = 450 DPS
DPS cap = 250 × 2.0 = 500 DPS → 450 < 500 ✅ Under cap
North Atlantic boss HP 1000 → Clear time = 1000 / 450 ≈ 2.2s → ⚠️ Too fast
→ Boss defense 50%: 1000 / (450 × 0.5) = 4.4s → With phase transitions: actual 15~25s
```

### Build 2: Max Durability (Flagship + Repair/Medicine spec)
```
Flagship HP 700 + Defense formation +25% = Effective HP 875
Repair Lv5 = 20 HP/s recovery
Medicine Lv5 = crew death rate -50%
Enemy DPS 110 × (1 - defense 0.25) = 82.5 DPS
Net incoming DPS = 82.5 - 20(repair) = 62.5 DPS
Survival time = 875 / 62.5 = 14s → Enemy HP 500~900 / own DPS(low) → Clear 30~60s
→ Boss fights viable through sustained healing, but long clear times prevent 3-star rating
```

### Build 3: Multi-ship Fleet (5 Sloops + Wedge formation)
```
5 Sloops DPS = (50 × 2 ports) / 2s × 5 = 250 DPS
Wedge +10% = 275 DPS
Dispersed crew, lower spec bonus (+20% avg) = 330 DPS
DPS cap not exceeded (330 < 500)
Total HP = 100 × 5 = 500 → Losing 1 ship means -20% DPS
→ Quick elimination strategy, boss advantage but vulnerable to AoE
```

> All 3 builds: DPS cap not exceeded, boss clear time 15~60s range — balance acceptable ✅

---

## Appendix B: Viewport Test Matrix

| Viewport | Check Items |
|----------|------------|
| 320px | No mobile button overlap, min touch 48px, text readable |
| 480px | Port facility tab switch normal, battle ship selection normal |
| 768px | Sidebar display normal, full battle map visible |
| 1024px+ | Full-screen layout, devicePixelRatio applied |

---

_This design document was created by the InfiniTriX Platform Cycle #34 Planning Agent._
_Created: 2026-03-24_
