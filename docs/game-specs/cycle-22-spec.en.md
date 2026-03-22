---
game-id: chrono-siege
title: Chrono Siege
genre: arcade, strategy
difficulty: hard
---

# Chrono Siege — Detailed Game Design Document

_Cycle #22 | Date: 2026-03-22_

---

## One-Page Summary (Must-Read for Implementer)

**Chrono Siege** is a hybrid tower defense where you become a Chronomancer, strategically placing towers (strategy) while **casting real-time time magic (slow/haste/rewind) as arcade actions** to repel enemies pouring from temporal rifts. It fills the arcade + strategy genre gap (0→1, the platform's largest gap), offering premium replayability with 5 eras × 4 stages + 5 bosses + 5 hidden = 30 stages + permanent upgrade tree + random waves + 3 strategy paths.

**MVP (Phase 1)**: TITLE → ERA_SELECT → STAGE_SELECT → GAMEPLAY → RESULT (5 states) + Ancient era 4 stages + 3 basic towers + 1 time-slow magic. **Complete this first, then expand.**

**Core Prohibitions**: No assets/ directory, zero setTimeout, no state changes in render(), no external fonts/CDN, no alert/confirm.

---

## §0. Previous Cycle Feedback Mapping

> Pre-emptive response to Cycle 21 post-mortem "areas for improvement" + platform-wisdom accumulated lessons, grouped by category.

### Assets/File System

| # | Source | Issue | Solution | Section |
|---|--------|-------|----------|---------|
| F1 | Cycle 1~21 (21 cycles) | assets/ directory recurrence | **Single index.html, 100% Canvas code drawing.** Cycle 21 achieved "no-creation settled" — maintain this | §11, §14.5 |
| F6 | Cycle 2~4 | SVG filter (feGaussianBlur) recurrence | Canvas shadowBlur only for glow. No inline SVG | §4.2 |
| F33 | Cycle 20 | Google Fonts external dependency | System monospace only. Zero external CDN requests | §4.1 |

### State Machine/Transitions

| # | Source | Issue | Solution | Section |
|---|--------|-------|----------|---------|
| F2 | Cycle 1~2 | setTimeout-based state transitions | tween onComplete only. Zero setTimeout target (11 cycles running) | §5, §13 |
| F4 | Cycle 2 | Missing state×system matrix | 14-state × 10-system matrix pre-authored in §6.3 | §6.3 |
| F5 | Cycle 3/4 | Missing guard flags → repeated callbacks | `isTransitioning`, `isWaveActive`, `isBossPhase` triple guards | §5.4 |
| F17 | Cycle 3 | State transition priority system | GAMEOVER > BOSS_DEFEATED > RESULT > GAMEPLAY. STATE_PRIORITY map | §6.2 |
| F23 | Cycle 5/8 | Direct transitions bypassing beginTransition() | All screen transitions must go through `beginTransition()`. PAUSED exempt — `enterState()` directly allowed | §6.2 |
| F26 | Cycle 17/20 | State changes in render | State changes in update() only. render() is pure output | §5.2 |

### Code Quality

| # | Source | Issue | Solution | Section |
|---|--------|-------|----------|---------|
| F3 | Cycle 6~21 | Pure function pattern required | All collision/damage/time-energy functions parameter-based | §15.2 |
| F6b | Cycle 4 | TweenManager cancelAll+add race condition | `clearImmediate()` immediate cleanup API separation | §15 |
| F7 | Cycle 7/16 | Spec value ↔ code value mismatch | §14.4 numeric consistency verification table, full cross-check | §14.4 |
| F11 | Cycle 11/14 | let/const TDZ crash | Strict order: variable declaration → DOM → events → init() | §14.1 |
| F12 | Cycle 10/11 | gameLoop try-catch not applied | `try{...}catch(e){console.error(e);}raf(loop)` default | §5.1 |
| F15 | Cycle 3/7/17/21 | Ghost variables (gridCacheCanvas etc.) | §14.2 variable usage verification table. Map usage immediately at declaration | §14.2 |
| F16 | Cycle 5 | Dual update paths for single value | All key values updated only through single function (`modifyStat()`) | §15.3 |
| F30 | Cycle 18/21 | 4,215-line single file bloat | §A~§M region comments for logical section structuring. Drawing function signature standardization | §15.1 |
| F36 | Cycle 21 new | ObjectPool exception safety | updateAll() callback wrapped in try-catch. Pool return guaranteed on exception | §15.4 |
| F37 | Cycle 21 new | drawUpgradeIcon per-frame creation inefficiency | Offscreen caching pattern: buildIconCache() pre-rendering | §4.3 |

### Input/Mobile

| # | Source | Issue | Solution | Section |
|---|--------|-------|----------|---------|
| F8 | Cycle 1 | iframe confirm/alert blocked | Canvas-based modal UI only | §4 |
| F20 | Cycle 13~21 | CONFIG.MIN_TOUCH declaration-implementation gap | `touchSafe()` 48px minimum enforced on all UI. `Math.max(MIN_TOUCH, h)` in render functions | §12.3 |
| F21 | Cycle 16 | Input method full-feature unsupported | Keyboard/mouse/touch all fully supported | §3 |
| F24 | Cycle 12~21 | Touch target below 44×44px | All interactive UI minimum 48×48px | §12.3 |
| F32 | Cycle 20~21 | Touch scroll | ScrollManager (momentum + bounce) fully implemented | §4.7 |

### Other

| # | Source | Issue | Solution | Section |
|---|--------|-------|----------|---------|
| F10 | Cycle 15~21 | Offscreen canvas background caching | `buildBgCache()` pattern — rebuild only on resize/stage transition | §4.3 |
| F13 | Cycle 13/17 | index.html non-existent (over-scoping) | MVP first: 5 states + Ancient era complete first | §1.3 |
| F14 | Cycle 10 | Fix regression | §14.7 full flow regression test | §14.7 |
| F19 | Cycle 12/15 | "Half-implementation" pattern | Feature-level sub-checklist | §14.3 |
| F38 | Cycle 21 new | 5 review cycles required | First-pass approval target: F1~F38 complete pre-emption + smoke test gate | §14.8 |

---

## §1. Game Overview & Core Fun

### §1.1 Concept

A Chronomancer's time-traveling story to seal temporal rifts unleashing Chronobeasts. Strategically place towers and cast real-time time magic to dominate the battlefield.

**Core Fun**:
1. **Strategic Placement** — Grid placement considering range, element, synergy of 7 tower types (strategy)
2. **Real-time Time Manipulation** — Arcade controls for slow/haste/rewind magic at the right moment (arcade)
3. **Time Energy Management** — Tense resource management of magic usage vs remaining energy
4. **Era Exploration** — Ancient→Medieval→Industrial→Future→End of Time, each with unique enemies, environments, bosses
5. **Permanent Growth** — Earn Time Crystals even on failure to permanently upgrade towers/magic

### §1.2 Genre Justification

- **arcade + strategy = 0 games** (fills platform's largest gap)
- Differentiated from existing `mini-tower-defense` (pure strategy): real-time time manipulation arcade mechanic is core
- Aligned with 2025-2026 TD+roguelike trend (Minos, Rogue Tower, Tile Tactics)

### §1.3 MVP / Phase Breakdown

| Phase | Scope | Priority |
|-------|-------|----------|
| **Phase 1 (MVP)** | TITLE, ERA_SELECT, STAGE_SELECT, GAMEPLAY, RESULT 5 states + Ancient era 4 stages + 3 towers + 1 time-slow | **Required** |
| Phase 2 | + Medieval/Desert eras + 2 towers + haste/rewind + 2 bosses | High |
| Phase 3 | + Future/End of Time + upgrade tree + hidden stages + ending | Medium |
| Phase 4 | + Endless mode + achievements + leaderboard | Low |

---

## §2. Game Rules & Objectives

### §2.1 Victory Condition
- Eliminate all enemies in all waves, or prevent enough from reaching the core
- Boss stages: Reduce boss HP to 0

### §2.2 Defeat Condition
- Time Core HP reaches 0
- Core HP: Base 20 (upgradeable to max 35)

### §2.3 Stage Structure
```
[Stage Start]
  → Placement Phase (30s, time frozen)
    → Place/move/sell towers
  → Combat Phase
    → Waves 1~N (enemies move + towers auto-attack)
    → Player: real-time time magic casting
    → Wave clear → bonus gold + placement phase repeats
  → Final wave clear or defeat
[Result Screen]
```

### §2.4 Wave System
- 3~8 waves per stage (increases with era progression)
- 10-second placement phase between waves (add/reposition towers)
- Boss wave: Final wave spawns boss + minion mix

---

## §3. Controls

### §3.1 Keyboard

| Key | Action |
|-----|--------|
| 1~7 | Select tower (each slot) |
| Q/W/E | Select time magic (slow/haste/rewind) |
| Space | Cast selected magic (at mouse position) |
| ESC | Pause / Menu |
| Tab | Toggle tower info panel |
| R | Cancel selection |
| F | Early wave summon (bonus gold) |

### §3.2 Mouse

| Action | Result |
|--------|--------|
| Left-click (empty grid) | Place selected tower |
| Left-click (placed tower) | Select tower (show info) |
| Right-click (placed tower) | Sell tower |
| Left-click+drag (combat) | Designate time magic area and cast |
| Scroll wheel | Cycle tower slots |

### §3.3 Touch

| Action | Result |
|--------|--------|
| Tap (empty grid) | Place selected tower |
| Tap (placed tower) | Tower info popup (upgrade/sell buttons) |
| Long-press 300ms (tower) | Drag to move tower |
| Bottom slot tap | Select tower/magic |
| Two-finger pinch | (unused — single-screen fixed) |
| Swipe (upgrade screen) | ScrollManager inertial scroll |

### §3.4 Touch Guide
- 3-step interactive tutorial overlay on first play:
  1. "Tap a tower to select" (highlight + arrow)
  2. "Tap an empty cell to place" (grid highlight)
  3. "Press the magic button to manipulate time" (magic button pulse)

---

## §4. Visual Style Guide

### §4.1 Color Palette

```
Background base:    #0a0e1a (deep navy)
Grid lines:         #1a2744 (dark blue)
Time energy:        #00e5ff (cyan glow)
Tower base:         #4fc3f7 (light sky)
Tower upgraded:     #ffab40 (orange gold)
Enemy base:         #ef5350 (red)
Boss:               #ab47bc (purple)
Gold:               #ffd740 (gold)
HP bar:             #66bb6a → #ef5350 (green→red gradient)
Time slow:          #4dd0e1 (light cyan)
Time haste:         #ff7043 (orange red)
Time rewind:        #ce93d8 (light purple)
UI text:            #e0e0e0 (light gray)
```

**Era-specific background colors**:
- Ancient: #1a0f0a (warm brown) + sand particles
- Medieval: #0a1a0f (deep green) + fog effect
- Industrial: #1a1410 (smoke gray) + steam particles
- Future: #0a0a1f (neon navy) + hologram glitch
- End of Time: #0f0020 (deep purple) + time distortion waves

**Font**: System monospace only — `'Courier New', 'Consolas', monospace`

### §4.2 Canvas Drawing Style
- **Glow effects**: `ctx.shadowBlur` + `ctx.shadowColor` only (SVG filters prohibited)
- **Gradients**: `createLinearGradient` / `createRadialGradient`
- **Time warp visualization**: sin/cos-based wave distortion (ctx.transform)
- **Particles**: ObjectPool(200)-based Canvas circles/rectangles

### §4.3 Offscreen Caching Strategy

```
buildBgCache()      — Era background (on resize/stage transition)
buildGridCache()    — Grid lines (on resize)
buildIconCache()    — Tower/magic icons (once at start, refresh on upgrade)
buildUICache()      — HUD frame (on resize)
```

**Rule**: No per-frame new Path creation → drawImage() blitting from cache canvases

### §4.4 Drawing Function Signature Standardization

All drawing functions follow this standard signature:

```javascript
function drawTower(ctx, x, y, size, towerType, level, state) { ... }
function drawEnemy(ctx, x, y, size, enemyType, hp, maxHp, statusEffects) { ... }
function drawBoss(ctx, x, y, size, bossType, phase, hp, maxHp) { ... }
function drawProjectile(ctx, x, y, size, projType, angle) { ... }
function drawEffect(ctx, x, y, size, effectType, progress) { ... }
```

**Rule**: No direct global variable references. All state passed via parameters.

### §4.5 Asset List (100% Canvas Code Drawing)

| # | Asset | Size | Description |
|---|-------|------|-------------|
| 1 | Tower: Arrow | 40×40 | 3-level variants (color + decoration) |
| 2 | Tower: Cannon | 40×40 | 3-level variants |
| 3 | Tower: Lightning | 40×40 | Chain lightning effect |
| 4 | Tower: Chrono | 40×40 | Cyan glow + clock motif |
| 5 | Tower: Flame | 40×40 | Fire particles |
| 6 | Tower: Frost | 40×40 | Crystal form |
| 7 | Tower: Ancient Relic | 40×40 | Era-specific special tower |
| 8 | Enemy: Rusher | 24×24 | Fast movement, low HP |
| 9 | Enemy: Tank | 32×32 | Slow movement, high HP, shield |
| 10 | Enemy: Flyer | 24×24 | Ignores path, straight line |
| 11 | Enemy: Splitter | 28×28 | Splits into 2 on death |
| 12 | Enemy: Time Thief | 24×24 | Absorbs time energy |
| 13 | Enemy: Phase Shifter | 24×24 | Teleports |
| 14 | Enemy: Shield Bearer | 28×28 | Protects nearby enemies |
| 15 | Enemy: Healer | 24×24 | Heals nearby enemies |
| 16 | Boss: Pharaoh Anubis | 64×64 | Sandstorm attack, mummy summon |
| 17 | Boss: Black Knight Mordred | 64×64 | Sword pattern, enemy buff aura |
| 18 | Boss: Mech Colossus | 80×80 | Steam laser, part detachment |
| 19 | Boss: AI Core Nemesis | 64×64 | Hologram clones, hacking |
| 20 | Boss: Chronos | 80×80 | Time freeze, time reversal |
| 21 | Projectiles ×6 | 8×8 | Arrow/cannonball/lightning/time orb/flame/frost |
| 22 | Time magic effects ×3 | Variable | Slow(cyan circle)/haste(orange circle)/rewind(purple vortex) |
| 23 | UI icons | 32×32 | Tower slots, magic slots, coins, HP |
| 24 | Environment: destructible | 32×32 | Era-based (pillar/tree/machine/hologram/rift) |
| 25 | Thumbnail | 800×600 | Chronomancer + time warp + tower deployment panorama |

### §4.6 Boss Intro Cutscene Choreography

```
[Camera zoom in: 2s]
  Background darken (overlay alpha 0→0.7)
  Boss silhouette appears (rises from bottom, scale 0.3→1.0)
  Boss name text fade-in (glitch effect)
  Time warp effect (full-screen sin wave distortion)
[Camera zoom out: 1s]
  Combat starts
```

### §4.7 ScrollManager Spec (Upgrade/Codex screens)

```javascript
const SCROLL = {
  MOMENTUM_DECAY: 0.92,
  MAX_MOMENTUM: 30,
  BOUNCE_FACTOR: 0.3,
  SCROLL_THRESHOLD: 5,   // Movement below this = tap
  OVERSCROLL_MAX: 60      // Maximum bounce distance
};
```

---

## §5. Core Game Loop (Frame-based Logic Flow)

### §5.1 Main Loop Structure

```javascript
function gameLoop(timestamp) {
  try {
    const dt = Math.min(timestamp - lastTime, 33.33); // Max 30fps correction
    lastTime = timestamp;

    update(dt);
    render();
  } catch (e) {
    console.error('[ChronoSiege] Loop error:', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### §5.2 Update/Render Separation Principle

- **update(dt)**: State changes, physics, collision, timer decrements, tween updates
- **render()**: Pure output only. **Absolutely no state changes.** Read-only.

```
update(dt):
  1. tweenManager.update(dt)
  2. particlePool.updateAll(dt)        // try-catch wrapped
  3. projectilePool.updateAll(dt)      // try-catch wrapped
  4. if (state === GAMEPLAY) {
       updateEnemies(dt)
       updateTowers(dt)
       updateTimeMagic(dt)
       checkCollisions()
       checkWaveComplete()
     }
  5. scrollManager.update(dt)          // Scroll inertia

render():
  1. clearCanvas()
  2. drawBackground()                  // Offscreen cache blit
  3. drawGrid()                        // Offscreen cache blit
  4. drawTowers()
  5. drawEnemies()
  6. drawProjectiles()
  7. drawEffects()
  8. drawTimeMagicOverlay()
  9. drawHUD()
  10. drawUI()                          // Buttons, slots, info panel
  11. if (showTutorial) drawTutorialOverlay()
```

### §5.3 Time Magic Physics

```
Time Slow (SLOW):
  - Enemies in range: movement speed × 0.3 (70% reduction)
  - Time energy cost: 2/sec
  - Duration: Toggle (until energy depleted)
  - Visual: Cyan circular field + enemies tinted blue

Time Haste (HASTE):
  - Towers in range: attack speed × 2.0 (100% increase)
  - Time energy cost: 3/sec
  - Duration: Toggle
  - Visual: Orange circular field + towers glow orange

Time Rewind (REWIND):
  - Enemies in range return to position 5 seconds ago
  - Time energy cost: 30 (one-time)
  - Cooldown: 15 seconds
  - Visual: Purple vortex + rewind trail afterimages
```

### §5.4 Guard Flags

```javascript
let isTransitioning = false;  // Block input during screen transitions
let isWaveActive = false;     // Wave in progress (prevent duplicate wave start)
let isBossPhase = false;      // Boss cutscene/phase transition in progress
let isWaveClearing = false;   // Wave clear reward processing (ensure once only)
let isPlacingTower = false;   // Tower placement preview active
```

---

## §6. State Machine

### §6.1 State List (14 states)

```
TITLE           — Title screen
ERA_SELECT      — Era selection (5 eras)
STAGE_SELECT    — Stage selection (4+1 stages)
GAMEPLAY        — Combat (placement + combat phases unified)
WAVE_PREP       — Between-wave placement time (10s)
BOSS_INTRO      — Boss entrance cutscene
BOSS_FIGHT      — Boss combat (special patterns)
RESULT          — Stage result (stars/rewards)
GAMEOVER        — Defeat screen
PAUSED          — Pause
UPGRADE         — Permanent upgrade shop
CODEX           — Enemy/tower codex
ENDING          — Ending cutscene
TUTORIAL        — Tutorial overlay (layers over other states)
```

### §6.2 State Transition Rules

```
TITLE → ERA_SELECT → STAGE_SELECT → GAMEPLAY
GAMEPLAY ↔ WAVE_PREP (cycles between waves)
GAMEPLAY → BOSS_INTRO → BOSS_FIGHT → RESULT
GAMEPLAY/BOSS_FIGHT → GAMEOVER
RESULT → STAGE_SELECT (next stage) or ERA_SELECT (era complete)
TITLE ↔ UPGRADE, TITLE ↔ CODEX
any → PAUSED → (return to previous state)    ← enterState() direct allowed (F23 exception)
```

**STATE_PRIORITY** (higher = takes precedence):
```javascript
const STATE_PRIORITY = {
  GAMEOVER: 100,
  BOSS_INTRO: 90,
  RESULT: 80,
  BOSS_FIGHT: 70,
  GAMEPLAY: 60,
  WAVE_PREP: 50,
  PAUSED: 40, // Overlays on all states
  // ... rest below 30
};
```

**ESCAPE_ALLOWED** backward transitions:
```javascript
const ESCAPE_ALLOWED = {
  ERA_SELECT: 'TITLE',
  STAGE_SELECT: 'ERA_SELECT',
  UPGRADE: 'TITLE',
  CODEX: 'TITLE',
  PAUSED: null,       // Return to previous state
  RESULT: 'STAGE_SELECT',
};
```

### §6.3 State × System Matrix

| System \ State | TITLE | ERA_SEL | STG_SEL | GAMEPLAY | WAVE_PREP | BOSS_INTRO | BOSS_FIGHT | RESULT | GAMEOVER | PAUSED | UPGRADE | CODEX | ENDING | TUTORIAL |
|----------------|-------|---------|---------|----------|-----------|------------|------------|--------|----------|--------|---------|-------|--------|----------|
| tween.update | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| particle.update | ✅ | - | - | ✅ | ✅ | ✅ | ✅ | ✅ | - | - | - | - | ✅ | ✅ |
| projectile.update | - | - | - | ✅ | - | - | ✅ | - | - | - | - | - | - | - |
| enemy.update | - | - | - | ✅ | - | - | ✅ | - | - | - | - | - | - | - |
| tower.update | - | - | - | ✅ | - | - | ✅ | - | - | - | - | - | - | - |
| timeMagic.update | - | - | - | ✅ | - | - | ✅ | - | - | - | - | - | - | - |
| collision.check | - | - | - | ✅ | - | - | ✅ | - | - | - | - | - | - | - |
| scroll.update | - | - | - | - | - | - | - | - | - | - | ✅ | ✅ | - | - |
| sound.update | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | - | ✅ | ✅ | ✅ | ✅ |
| input.process | ✅ | ✅ | ✅ | ✅ | ✅ | - | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## §7. Tower System

### §7.1 Tower Types (7)

| # | Name | Cost | Range | Attack Speed | Damage | Special Effect | Unlock Era |
|---|------|------|-------|--------------|--------|----------------|------------|
| 1 | Arrow Tower | 50 | 3 tiles | 1.0/s | 10 | None (basic) | Ancient |
| 2 | Cannon Tower | 100 | 2.5 tiles | 0.5/s | 40 | AoE (1 tile) | Ancient |
| 3 | Lightning Tower | 120 | 3.5 tiles | 0.8/s | 15 | Chain 3 enemies | Ancient |
| 4 | Chrono Tower | 150 | 2 tiles | - | 0 | 20% slow in range | Medieval |
| 5 | Flame Tower | 130 | 2 tiles | 0.6/s | 25 | Burn DoT (5s, 3/s) | Industrial |
| 6 | Frost Tower | 140 | 2.5 tiles | 0.7/s | 20 | 30% chance 1s freeze | Future |
| 7 | Ancient Relic | 200 | 4 tiles | 0.3/s | 80 | +1 time energy/kill | End of Time |

### §7.2 Tower Upgrades (In-game)

Each tower 3 levels:
- **Lv2**: Cost × 0.7, damage +40%, visual change (color enhancement)
- **Lv3**: Cost × 1.0, damage +40%, enhanced special effect, visual change (decoration added)

### §7.3 Tower Placement Rules
- Grid-based (10×8 tiles, each 60×60px base)
- Cannot place on enemy path
- Placement preview: range circle + valid/invalid color indicator
- Tower sell: 70% cost refund

---

## §8. Enemy System

### §8.1 Enemy Types (8)

| # | Name | HP | Speed | Gold | Special | Appears In |
|---|------|----|-------|------|---------|------------|
| 1 | Rusher | 30 | 2.0 | 5 | None | Ancient |
| 2 | Tank | 150 | 0.8 | 15 | 5 armor | Ancient |
| 3 | Flyer | 50 | 1.5 | 10 | Ignores path, flies straight | Medieval |
| 4 | Splitter | 80 | 1.2 | 8 | Splits into 2 minis (HP 20) on death | Medieval |
| 5 | Time Thief | 60 | 1.8 | 12 | Drains 2 time energy on hit | Industrial |
| 6 | Phase Shifter | 70 | 1.0 | 15 | Teleports 3 tiles forward every 5s | Future |
| 7 | Shield Bearer | 100 | 0.9 | 18 | 50% damage reduction for allies within 1 tile | Future |
| 8 | Healer | 45 | 1.0 | 20 | Heals allies within 2 tiles at 5HP/s | End of Time |

### §8.2 Enemy Paths
- Unique path per stage (waypoint array)
- Branching path stages: 2 forks (later eras)
- Paths defined in `STAGE_DATA[era][stage].path` array

---

## §9. Boss System

### §9.1 Boss List (5)

| Era | Boss | HP | Phases | Core Pattern |
|-----|------|----|--------|--------------|
| Ancient | Pharaoh Anubis | 500 | 2 | P1: Sandstorm (all towers 30% slow), P2: Mummy summon (×3) |
| Medieval | Black Knight Mordred | 700 | 2 | P1: Sword pattern (line attack on path), P2: Enemy +50% ATK aura |
| Industrial | Mech Colossus | 1000 | 3 | P1: Steam laser, P2: Part detach (left/right arm independent), P3: Self-destruct countdown |
| Future | AI Core Nemesis | 800 | 2 | P1: Hologram clones (×3, only real takes damage), P2: Tower hack (1 tower becomes enemy for 30s) |
| End of Time | Chronos | 1500 | 3 | P1: Time freeze (5s, towers only), P2: Time reversal (enemy revival), P3: Spacetime collapse (full-screen wave + invulnerability removed) |

### §9.2 Boss Phase Transition State Diagrams (ASCII)

```
Pharaoh Anubis:
  ┌─────────┐    HP≤50%    ┌─────────┐
  │ Phase 1 │ ──────────→ │ Phase 2 │
  │Sandstorm│  (cutscene)  │Mummy Sum│
  └─────────┘    1s        └────┬────┘
                                │ HP=0
                                ▼
                          [BOSS_DEFEATED]

Mech Colossus:
  ┌─────────┐    HP≤60%    ┌─────────┐    HP≤25%    ┌─────────┐
  │ Phase 1 │ ──────────→ │ Phase 2 │ ──────────→ │ Phase 3 │
  │Stm Laser│  (1.5s cut)  │Part Dtch│  (1s cut)   │Self-Dest│
  └─────────┘             └─────────┘             └────┬────┘
                                                        │ HP=0 or timer
                                                        ▼
                                                  [BOSS_DEFEATED]

Chronos:
  ┌─────────┐    HP≤70%    ┌─────────┐    HP≤30%    ┌─────────┐
  │ Phase 1 │ ──────────→ │ Phase 2 │ ──────────→ │ Phase 3 │
  │TimeFreez│  (2s cut)    │TimeRvrsl│  (2s cut)    │SpaceClps│
  └─────────┘             └─────────┘             └────┬────┘
                                                        │ HP=0
                                                        ▼
                                                  [FINAL_ENDING]
```

---

## §10. Difficulty System

### §10.1 Dynamic Difficulty (Era/Stage Progression)

| Era | Enemy HP Mult | Enemy Speed Mult | Enemies/Wave | Max Time Energy |
|-----|--------------|-------------------|-------------|-----------------|
| Ancient | ×1.0 | ×1.0 | 5~10 | 100 |
| Medieval | ×1.3 | ×1.1 | 8~15 | 110 |
| Industrial | ×1.6 | ×1.2 | 10~20 | 120 |
| Future | ×2.0 | ×1.3 | 12~25 | 130 |
| End of Time | ×2.5 | ×1.4 | 15~30 | 150 |

### §10.2 3-Tier Difficulty Selection

| Difficulty | Core HP | Gold Mult | Enemy HP Mult | Time Energy Regen |
|-----------|---------|----------|--------------|-------------------|
| Apprentice (Easy) | 30 | ×1.5 | ×0.7 | +3/s |
| Chronomancer (Medium) | 20 | ×1.0 | ×1.0 | +2/s |
| Chronomaster (Hard) | 15 | ×0.8 | ×1.3 | +1.5/s |

### §10.3 Hidden Stage Conditions

| Era | Condition | Reward |
|-----|-----------|--------|
| Ancient | All 4 stages ★★★ | Hidden: Pyramid Depths |
| Medieval | Beat boss without using rewind | Hidden: Wizard Tower Summit |
| Industrial | Clear with ≤3 towers | Hidden: Secret Factory |
| Future | Clear with 0 Time Thief hits | Hidden: AI Server Room |
| End of Time | Clear all era hidden stages | Hidden: Origin of Time (true ending) |

---

## §11. Score System

### §11.1 Score Calculation

```
Enemy kill: HP × era_mult × combo_mult
Boss kill: base 1000 × era_mult
Wave bonus: remaining core HP × 50
Time bonus: remaining time energy × 10
Stage clear: base 500 × era_mult

Combo: consecutive kills within 3 seconds
  ×2 (2 kills), ×3 (3 kills), ×4 (4 kills), ×5 (5+ kills, max)
```

### §11.2 Star Rating (Stage Result)

| Rating | Condition |
|--------|-----------|
| ★☆☆ | Clear |
| ★★☆ | Core HP ≥ 50% |
| ★★★ | Core HP = 100% (no damage) |

### §11.3 Time Crystals (Permanent Currency)

- Stage clear: 3~10 (proportional to stars)
- Boss kill: +15
- Hidden stage: +25
- Defeat: 1~3 (consolation, proportional to progress)

---

## §12. Permanent Upgrade Tree

### §12.1 Upgrade Categories

```
[Time Mastery]                  [Tower Enhancement]          [Core Fortification]
├ Energy max +10 (5 levels)    ├ Base damage +5% (5 lvls)   ├ Core HP +3 (5 levels)
├ Regen rate +0.5/s (5 lvls)  ├ Range +5% (5 levels)       ├ Core heal 1HP/wave (3 lvls)
├ Slow efficiency +10% (3)    ├ Tower cost -5% (5 levels)  ├ Gold bonus +10% (5 levels)
├ Haste efficiency +10% (3)   ├ Sell refund +5% (3 levels) └ Starting gold +50 (5 levels)
└ Rewind cooldown -2s (3)     └ Lv3 special unlock (7 types)
```

### §12.2 Upgrade Costs (Time Crystals)

```
Level 1: 5, Level 2: 10, Level 3: 20, Level 4: 35, Level 5: 50
```

### §12.3 UI Touch Spec
- All upgrade buttons: minimum 48×48px (`touchSafe()` enforced)
- `Math.max(CONFIG.MIN_TOUCH, buttonHeight)` applied in render functions
- ScrollManager for inertial scrolling (see §4.7 values)

---

## §13. Sound System (Web Audio API)

### §13.1 Sound Effects List (8+)

| # | Sound | Trigger | Waveform | Frequency(Hz) | Duration(ms) |
|---|-------|---------|----------|---------------|---------------|
| 1 | Tower place | Tower built | square | 440→880 | 150 |
| 2 | Arrow fire | Arrow tower attack | sawtooth | 600→300 | 80 |
| 3 | Cannon blast | Cannon tower attack | noise | - | 200 |
| 4 | Lightning | Lightning tower attack | square | 200→2000 random | 100 |
| 5 | Time slow | SLOW magic cast | sine | 220→110 | 500 |
| 6 | Time haste | HASTE magic cast | sine | 220→440 | 300 |
| 7 | Time rewind | REWIND magic cast | triangle+sine | 440→110→440 | 800 |
| 8 | Enemy death | Enemy HP 0 | noise+sine | 300→0 | 120 |
| 9 | Boss appear | BOSS_INTRO | sine chord | C3+E3+G3 | 2000 |
| 10 | Core hit | Enemy reaches core | square | 100→50 | 400 |

### §13.2 BGM Loop

- **Era-specific BGM**: Procedurally generated 4-bar loop (BPM 80~120)
- **Boss battle BGM**: Intense drum pattern (BPM 140)
- `oscillator.start(ctx.currentTime + delay)` native scheduling (zero setTimeout)

---

## §14. Quality Assurance Checklist

### §14.1 Initialization Order

```
1. const/let variable declarations (all globals)
2. CONFIG constants object
3. DOM references (canvas, ctx)
4. TweenManager, ObjectPool, SoundManager, ScrollManager instances
5. Event listener registration
6. init() call → enter TITLE state
```

### §14.2 Variable Usage Verification Table

> Verify all declared major variables are actually used. Prevent ghost variables (F15).

| Variable | Declaration | Update Function | Reference Function | Notes |
|----------|-------------|----------------|-------------------|-------|
| coreHP | global | modifyCoreHP() | drawHUD(), checkGameOver() | Single update path |
| timeEnergy | global | modifyTimeEnergy() | drawHUD(), canCastMagic() | Single update path |
| gold | global | modifyGold() | drawHUD(), canBuildTower() | Single update path |
| score | global | addScore() | drawHUD(), drawResult() | Single update path |
| currentWave | global | startNextWave() | spawnWave(), drawHUD() | |
| towers[] | global | placeTower(), sellTower() | updateTowers(), drawTowers() | |
| enemies[] | global | spawnEnemy(), removeEnemy() | updateEnemies(), drawEnemies() | ObjectPool |
| projectiles[] | global | fireProjectile() | updateProjectiles() | ObjectPool |
| timeMagicFields[] | global | castTimeMagic() | updateTimeMagic(), drawTimeMagicOverlay() | |

### §14.3 Feature Sub-Implementation Checklist

> Prevent "half-implementation" pattern (F19). Verify both A + B for each feature.

```
[ ] Time Slow: speed reduction ✅ + cyan visual ✅ + energy drain ✅
[ ] Time Haste: attack speed boost ✅ + orange visual ✅ + energy drain ✅
[ ] Time Rewind: position rollback ✅ + purple vortex ✅ + cooldown ✅ + afterimage ✅
[ ] Boss P1→P2: HP condition ✅ + cutscene ✅ + pattern switch ✅
[ ] Tower sell: refund ✅ + tower removal ✅ + range circle removal ✅
[ ] Enemy split: death event ✅ + 2 mini spawn ✅ + individual rewards ✅
[ ] Touch scroll: drag ✅ + inertia ✅ + bounce ✅ + tap detection ✅
```

### §14.4 Numeric Consistency Verification Table

> 1:1 correspondence between spec values and CONFIG constants (F7).

| Spec Item | Spec Value | CONFIG Key | Verified |
|-----------|-----------|-----------|----------|
| Core HP (base) | 20 | CONFIG.CORE_HP_BASE | [ ] |
| Max time energy (Ancient) | 100 | CONFIG.TIME_ENERGY_MAX[0] | [ ] |
| Arrow tower cost | 50 | CONFIG.TOWERS[0].cost | [ ] |
| Arrow tower damage | 10 | CONFIG.TOWERS[0].damage | [ ] |
| Slow speed multiplier | 0.3 | CONFIG.SLOW_SPEED_MULT | [ ] |
| Haste attack multiplier | 2.0 | CONFIG.HASTE_ATTACK_MULT | [ ] |
| Rewind energy cost | 30 | CONFIG.REWIND_COST | [ ] |
| Rewind cooldown | 15s | CONFIG.REWIND_COOLDOWN | [ ] |
| Tower sell refund rate | 70% | CONFIG.SELL_REFUND_RATE | [ ] |
| Rusher HP | 30 | CONFIG.ENEMIES[0].hp | [ ] |
| Rusher speed | 2.0 | CONFIG.ENEMIES[0].speed | [ ] |
| Combo window | 3s | CONFIG.COMBO_WINDOW | [ ] |

### §14.5 Prohibited Pattern Auto-Verification

```bash
# assets/ directory existence check
[ -d "games/chrono-siege/assets" ] && echo "FAIL: assets/ exists" && exit 1

# setTimeout usage check
grep -n "setTimeout" games/chrono-siege/index.html && echo "FAIL: setTimeout found" && exit 1

# alert/confirm usage check
grep -n "alert\|confirm(" games/chrono-siege/index.html && echo "FAIL: alert/confirm found" && exit 1

# External resource references
grep -n "googleapis\|cdn\|fonts.google\|<link.*href.*http" games/chrono-siege/index.html && echo "FAIL: external resource" && exit 1

# SVG filters
grep -n "feGaussianBlur\|<filter" games/chrono-siege/index.html && echo "FAIL: SVG filter" && exit 1

# ASSET_MAP/SPRITES/preloadAssets code remnants
grep -n "ASSET_MAP\|SPRITES\|preloadAssets\|new Image()" games/chrono-siege/index.html && echo "FAIL: asset code remnant" && exit 1
```

### §14.6 Drawing Function List (Global Reference Prohibition Verification)

| Function | Parameters | Global Refs | Verified |
|----------|-----------|-------------|----------|
| drawTower | ctx, x, y, size, type, level, state | None | [ ] |
| drawEnemy | ctx, x, y, size, type, hp, maxHp, effects | None | [ ] |
| drawBoss | ctx, x, y, size, type, phase, hp, maxHp | None | [ ] |
| drawProjectile | ctx, x, y, size, type, angle | None | [ ] |
| drawEffect | ctx, x, y, size, type, progress | None | [ ] |
| drawTimeMagicField | ctx, cx, cy, radius, type, alpha | None | [ ] |

### §14.7 Regression Test Flow

```
TITLE → ERA_SELECT → (select Ancient) → STAGE_SELECT → (select 1-1)
→ GAMEPLAY (placement → combat → WAVE_PREP → combat cycle)
→ RESULT (★★★) → STAGE_SELECT
→ (select 1-4 boss) → BOSS_INTRO → BOSS_FIGHT
→ (victory) RESULT → ERA_SELECT
→ (defeat test) GAMEOVER → TITLE
→ UPGRADE → (purchase) → TITLE
→ CODEX → (scroll) → TITLE
→ (repeat full flow on mobile touch)
```

### §14.8 Smoke Test Gate (Required Before Review Submission)

```
1. Does index.html exist?
2. Does it load in browser without errors?
3. Is the TITLE screen displayed?
4. Can you enter stage 1?
5. Does tower placement work?
6. Do enemies move?
7. Can you reach game over?
8. Does §14.5 prohibited pattern verification pass?
```

---

## §15. Code Architecture

### §15.1 File Structure (Region Comments)

```javascript
// ═══════════════════════════════════════
// §A — CONFIG & CONSTANTS
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §B — UTILITY CLASSES (TweenManager, ObjectPool, SoundManager, ScrollManager)
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §C — GAME STATE & DATA
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §D — STAGE & WAVE DATA
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §E — DRAWING FUNCTIONS (Standard Signatures)
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §F — TOWER LOGIC
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §G — ENEMY LOGIC
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §H — TIME MAGIC SYSTEM
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §I — COLLISION & COMBAT
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §J — UI & HUD
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §K — INPUT HANDLING
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §L — STATE MACHINE & TRANSITIONS
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// §M — MAIN LOOP & INIT
// ═══════════════════════════════════════
```

### §15.2 Pure Function Pattern

```javascript
// ✅ Correct
function calcDamage(baseDmg, towerLevel, enemyArmor, hasteMultiplier) {
  return Math.max(1, baseDmg * (1 + 0.4 * (towerLevel - 1)) * hasteMultiplier - enemyArmor);
}

function checkCollision(proj, enemy) {
  const dx = proj.x - enemy.x;
  const dy = proj.y - enemy.y;
  return dx * dx + dy * dy < (proj.r + enemy.r) * (proj.r + enemy.r);
}

// ❌ Forbidden
function calcDamage() {
  return selectedTower.damage - currentEnemy.armor; // Direct global reference
}
```

### §15.3 Single Update Path

```javascript
function modifyCoreHP(delta) { coreHP = Math.max(0, Math.min(maxCoreHP, coreHP + delta)); }
function modifyTimeEnergy(delta) { timeEnergy = Math.max(0, Math.min(maxTimeEnergy, timeEnergy + delta)); }
function modifyGold(delta) { gold = Math.max(0, gold + delta); }
function addScore(points) { score += points; }
```

### §15.4 ObjectPool Exception Safety (F36)

```javascript
class ObjectPool {
  updateAll(dt) {
    for (let i = this._active.length - 1; i >= 0; i--) {
      try {
        if (!this._updateFn(this._active[i], dt)) {
          this._pool.push(this._active.splice(i, 1)[0]);
        }
      } catch (e) {
        console.error('[ObjectPool] Update error:', e);
        this._pool.push(this._active.splice(i, 1)[0]); // Return to pool even on exception
      }
    }
  }
}
```

### §15.5 TweenManager clearImmediate()

```javascript
class TweenManager {
  clearImmediate() {
    this._tweens.length = 0;
    this._pendingCancel = false;
  }
  // cancelAll() is deferred, clearImmediate() is immediate
}
```

---

## §16. Internationalization

### §16.1 Text Table

```javascript
const TEXT = {
  ko: {
    title: '크로노 시즈',
    subtitle: '시간을 지배하라',
    start: '게임 시작',
    continue: '이어하기',
    upgrade: '업그레이드',
    codex: '도감',
    era_ancient: '고대',
    era_medieval: '중세',
    era_industrial: '산업혁명',
    era_future: '미래',
    era_timeend: '시간의 끝',
    wave: '웨이브',
    boss: '보스',
    victory: '승리!',
    defeat: '시간이 무너졌다...',
    paused: '일시정지',
    // ... all UI text
  },
  en: {
    title: 'Chrono Siege',
    subtitle: 'Master Time',
    start: 'Start Game',
    continue: 'Continue',
    upgrade: 'Upgrades',
    codex: 'Codex',
    era_ancient: 'Ancient',
    era_medieval: 'Medieval',
    era_industrial: 'Industrial',
    era_future: 'Future',
    era_timeend: 'End of Time',
    wave: 'Wave',
    boss: 'Boss',
    victory: 'Victory!',
    defeat: 'Time has fallen...',
    paused: 'Paused',
    // ...
  }
};
```

### §16.2 Language Detection

```javascript
const LANG = (navigator.language || 'ko').startsWith('ko') ? 'ko' : 'en';
function t(key) { return TEXT[LANG][key] || TEXT.en[key] || key; }
```

---

## §17. localStorage Data Schema

```javascript
const SAVE_KEY = 'chrono-siege-v1';
const SAVE_SCHEMA = {
  version: 1,
  lang: 'ko',                        // Language setting
  difficulty: 'medium',               // Difficulty
  eraProgress: [4, 0, 0, 0, 0],     // Cleared stages per era
  stageStars: {},                     // { "0-0": 3, "0-1": 2, ... }
  upgrades: {                         // Permanent upgrade levels
    timeMax: 0, timeRegen: 0, slowEff: 0, hasteEff: 0, rewindCd: 0,
    towerDmg: 0, towerRange: 0, towerCost: 0, sellRefund: 0, towerLv3: [],
    coreHp: 0, coreRegen: 0, goldBonus: 0, startGold: 0
  },
  timeCrystals: 0,                    // Permanent currency
  totalScore: 0,                      // Cumulative score
  codexUnlocked: [],                  // Discovered enemies/bosses/towers
  hiddenStagesUnlocked: [],           // Unlocked hidden stages
  playCount: 0,                       // Total play count
  bestScorePerStage: {},              // Best score per stage
  tutorialComplete: false,            // Tutorial completion flag
};
```

**Save/Load Order (F2/B4 prevention)**:
```
Judge first → save second
1. isNewBest = score > getBestScore(stageId)
2. saveProgress(stageId, stars, score)
3. if (isNewBest) showNewBestAnimation()
```

---

## §18. Game Page Sidebar Data

```yaml
game:
  title: "Chrono Siege"
  description: "A strategic arcade tower defense where you place towers and cast time magic to repel enemies from temporal rifts"
  genre: ["arcade", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "1~7: Select tower"
    - "Q/W/E: Time magic (slow/haste/rewind)"
    - "Space: Cast magic"
    - "Click: Place/select tower"
    - "Right-click: Sell tower"
    - "Touch: Tap to place, long-press to move"
  tags:
    - "#TowerDefense"
    - "#TimeManipulation"
    - "#Strategy"
    - "#Arcade"
    - "#Roguelike"
    - "#BossFight"
  addedAt: "March 22, 2026"
  version: "1.0.0"
  featured: true
```

---

## §19. Story/Narrative

### §19.1 Background Story

> Temporal rifts have opened across five eras of history.
> Chronobeasts pour through, devouring the flow of time itself.
> Only you, the last Chronomancer, can stop this crisis with your power to manipulate time.

### §19.2 Era Intro Text

- **Ancient**: "Ancient civilizations sleeping beneath the sands... The rift has awakened the Pharaoh's curse."
- **Medieval**: "Beyond the fog-shrouded castle, the Black Knight's army rises against time."
- **Industrial**: "The age of steam and gears. Machines have begun to consume time itself."
- **Future**: "Beneath neon lights, an AI attempts to hack time itself."
- **End of Time**: "Where all eras converge. Chronos awaits."

### §19.3 Endings

- **Normal Ending**: Defeat Chronos → "The rifts are sealed. Time flows once more."
- **True Ending**: Clear hidden stage "Origin of Time" → "You have witnessed the origin of time. Now you are the new Chronos."

---

## §20. Improvements Over Cycle 21

| Area | Cycle 21 (runeforge-tactics) | Cycle 22 (chrono-siege) |
|------|------------------------------|------------------------|
| Genre | puzzle+strategy | **arcade+strategy** (new largest gap filled) |
| Core loop | Turn-based placement → auto defense | **Real-time placement + real-time time manipulation** (higher APM) |
| Time mechanic | None | **3-axis time control: slow/haste/rewind** |
| Stage count | 20+ | **30** (5 eras×4 + 5 bosses + 5 hidden) |
| Replayability | Magic circle recipe collection | **Random waves + 3 strategy paths + time challenges** |
| State count | 12 | **14** |
| ObjectPool | No exception handling | **try-catch wrapping (F36)** |
| Icon caching | Per-frame creation | **Offscreen pre-rendering (F37)** |
| Drawing signatures | Non-standard | **(ctx, x, y, size, ...state) standardized** |
| Boss behavior | Text description only | **ASCII state diagrams included** |
| Spec length | ~1000 lines | **Core-focused, repeated patterns via reference links** |
| Review target | 5 rounds | **≤3 rounds (F38 smoke test gate)** |
