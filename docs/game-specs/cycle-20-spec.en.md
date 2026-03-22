---
game-id: crystal-pinball
title: Crystal Pinball
genre: arcade
difficulty: medium
---

# Crystal Pinball — Detailed Game Design Document

_Cycle #20 | Date: 2026-03-22_

---

## §0. Previous Cycle Feedback Mapping

> Proactive resolution of Cycle 19 post-mortem issues + platform-wisdom cumulative lessons (F1~F32) at the design stage.

| # | Source | Issue | Resolution in This Spec | Section |
|---|--------|-------|------------------------|---------|
| F1 | Cycle 1~19 (19 consecutive) | assets/ directory recurrence | **Write from scratch in single index.html.** assets/ directory strictly prohibited. 100% Canvas code drawing. Only thumbnail.svg allowed | §8, §14.5 |
| F2 | Cycle 1~19 | setTimeout-based state transitions | tween onComplete callbacks only. **0 setTimeouts** target. Web Audio native scheduling `oscillator.start(ctx.currentTime + delay)` | §5, §13 |
| F3 | Cycle 6~19 | Pure function pattern required | All physics/collision/scoring functions parameter-based. 0 global direct references | §15 |
| F4 | Cycle 2 | Missing state×system matrix | Full state×system matrix in §6.3 | §6.3 |
| F5 | Cycle 3/4 | Missing guard flags → repeated callbacks | `isTransitioning`, `isLaunching`, `isDraining` triple guard system | §5.4 |
| F6 | Cycle 4 | TweenManager cancelAll+add race condition | `clearImmediate()` immediate cleanup API separated | §15 |
| F7 | Cycle 7/16 | Spec values ↔ code values mismatch | §14.4 value consistency verification table. Full cross-check of bumper scores/upgrade costs | §14.4 |
| F8 | Cycle 1 | confirm/alert unusable in iframe | Canvas-based modal UI only. 0 window.open/alert/confirm/prompt calls | §4 |
| F9 | Cycle 3~4 | SVG filter recurrence (feGaussianBlur) | No inline SVG. Canvas glow via shadowBlur | §4.2 |
| F10 | Cycle 15~19 | offscreen canvas background caching | `buildTableCache()` pattern — rebuild only on resizeCanvas() + table switch | §4.3 |
| F11 | Cycle 11/14 | let/const TDZ crash | Strict order: variable declaration → DOM assignment → event registration → init() | §14.1 |
| F12 | Cycle 10/11 | Missing gameLoop try-catch | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` default wrapping | §5.1 |
| F13 | Cycle 13/17 | index.html not existing | **MVP-first strategy**: TITLE→TABLE_SELECT→PLAYING→DRAIN→GAMEOVER 5 states first | §1.3 |
| F14 | Cycle 10 | Regression on fix (render signature change) | Full flow regression test after every fix | §14.7 |
| F15 | Cycle 3/7/17 | Ghost variables (declared but unused) | §14.2 variable usage verification table | §14.2 |
| F16 | Cycle 5 | Dual update paths for single value | Ball speed/score/crystals updated via single function only | §15 |
| F17 | Cycle 3 | State transition priority system | GAMEOVER > DRAIN > TABLE_CLEAR > PLAYING. STATE_PRIORITY map | §6.2 |
| F18 | Cycle 15~19 | Scope reduction strategy | Single core loop (launch→flipper→collision→score) focus. Pinball has clear single mechanic | §1 |
| F19 | Cycle 12/15 | "Half-implementation" pattern | Per-feature implementation checklist (§14.3) | §14.3 |
| F20 | Cycle 13~19 | CONFIG.MIN_TOUCH declaration-implementation gap | All buttons/UI enforced via `touchSafe()` utility with 48px minimum | §12.3 |
| F21 | Cycle 16 | Input mode incomplete support | Keyboard/mouse/touch all support **full functionality** | §3 |
| F22 | Cycle 17 | Spec-stated UI not implemented | All UI in spec **100% implemented**. If not in MVP, don't put it in spec | §1.3 |
| F23 | Cycle 5/8 | Direct transition bypassing beginTransition() | All screen transitions via `beginTransition()`. PAUSED only exception (instant transition mode) | §6.2 |
| F24 | Cycle 12~19 | Touch target below 44×44px | All interactive UI minimum 48×48px | §12.3 |
| F25 | Cycle 17 (critical) | Over-scoped spec → 0% implementation | **MVP-first**: 5 states + 1 table + basic physics first, then expand | §1.3 |
| F26 | Cycle 17 | State changes in render() | All state changes in update() only. render() is pure output function | §5.2 |
| F27 | Cycle 17 | Undefined object interactions | §2.7 Ball × Object interaction matrix included | §2.7 |
| F28 | Cycle 18 | No balance verification | Score/upgrade costs managed as constant tables (TABLE_DATA, UPGRADE_DATA) | §7.2 |
| F29 | Cycle 18 | Sound quality not verified | SFX timing precisely mapped to game events (bumper hit/flipper/drain/bonus). Volume balance table included | §13.3 |
| F30 | Cycle 18 | Single file modularization | Code structured into logical sections (CONFIG/DATA → Physics → Collision → Rendering → States → Init) | §15.1 |
| F31 | Cycle 19 new | Enemy debuff applied to empty object bug | No debuffs in pinball. All effects (bumper hit, target clear) verify target reference before application | §5.5 |
| F32 | Cycle 19 new | Scroll UI not implemented (6+ cards) | Canvas-internal scroll implementation for upgrade shop when items exceed visible area | §4.7 |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
The player launches a glowing ball on a pinball table filled with magic crystals, operating flippers to destroy crystal targets and earn points. Progress through 10 tables sequentially, each with unique bumper/target/obstacle layouts and clear conditions. Use crystals earned from table clears to upgrade flipper power, ball properties, and special abilities to tackle increasingly difficult tables.

**Physics-based pinball + crystal collection + stage progression + upgrades** — a completely absent genre on the platform (physics arcade).

### 1.2 Core Fun Elements
1. **Instant Physical Feedback**: Flipper action → ball reflection → bumper hit → particle explosion + sound in <0.1 second satisfaction loop
2. **Table Mastery**: 10 tables each with different layouts and clear conditions → "How do I beat this table?" exploration joy
3. **Growth System**: Crystals for upgrades → stronger flippers/balls → higher scores → more crystals positive feedback loop
4. **Multiball/Special Balls**: Simultaneous 3-ball, explosive ball, piercing ball — special mode catharsis
5. **Boss Tables**: Tables 5 (mid-boss) and 10 (final boss) feature "living targets" for boss battles

### 1.3 MVP-First Strategy (F13, F25)
**Phase 1 (MVP — Must Complete First)**
- 5 states: TITLE → TABLE_SELECT → PLAYING → DRAIN → GAMEOVER
- 1 table (Tutorial Table)
- Basic physics: gravity, ball-wall collision, ball-flipper collision, ball-bumper collision
- Left/right flipper controls
- Plunger launch
- 3 bumpers + 5 targets
- 3-ball lives
- Basic scoring system

**Phase 2 (Table Expansion)**
- 10 tables + 2 boss tables
- Unique layouts/clear conditions per table
- Crystal collection system
- 5 basic upgrades

**Phase 3 (Advanced Features)**
- 3 special ball types (multiball/explosive/piercing)
- Boss table patterns
- 10 achievements
- Screen shake/slow-motion effects

**Phase 4 (Polish)**
- Multi-particle systems
- BGM branching (normal/boss)
- UI animations (score count-up, combo text)
- Save/load

---

## §2. Game Rules & Objectives

### 2.1 Basic Rules
- Player starts with **3 balls** (lives)
- Launch ball with plunger, operate left/right flippers to keep ball in play
- Hit targets/bumpers/lanes on the table to earn points
- Each table has a **clear condition** (destroy all crystal targets)
- Lose all balls = Game Over

### 2.2 Table Clear Condition
- Destroy **all crystal targets** (red/blue/green/yellow/purple) on the table to clear
- Clearing awards crystal rewards + unlocks next table
- Clearing without losing a ball = **Perfect Bonus** (crystals ×2)

### 2.3 Scoring Elements
| Element | Base Points | Combo Multiplier |
|---------|-------------|-----------------|
| Normal Bumper | 100 | ×combo |
| Power Bumper | 250 | ×combo |
| Crystal Target | 500 | ×combo |
| Drop Target (all) | 1,000 | — |
| Rollover Lane | 150 | ×combo |
| Spinner (per rotation) | 50 | — |
| Kickout Hole | 300 | — |
| All Targets Bonus | 5,000 | — |
| Table Clear | 10,000 × table# | — |

### 2.4 Combo System
- Consecutive bumper/target hits increase **combo counter** (within 1 second re-hit)
- Combo 1~4: ×1, Combo 5~9: ×2, Combo 10~19: ×3, Combo 20+: ×5
- No hit for 1 second resets combo
- Combo 20+ triggers screen shake + "MEGA COMBO" text

### 2.5 Crystal Collection
- Destroying crystal targets earns 1 crystal each
- Crystals are the **upgrade shop** currency
- Crystal targets per table: 5~12 (proportional to difficulty)

### 2.6 Special Modes
| Mode | Trigger | Effect | Duration |
|------|---------|--------|----------|
| Multiball | Pass all 3 MULTIBALL lanes | 2 extra balls launched (3 total) | Until only 1 ball remains |
| Crystal Rush | 5 consecutive crystal target destructions | All scores ×3 | 15 seconds |
| Save Gate | Enter kickout hole 3 times | Drain hole auto-blocked | Saves 1 ball |
| Explosive Ball | After upgrade unlock: 5 power bumper hits | Ball destroys all targets within 80px radius | 1-time use |
| Piercing Ball | After upgrade unlock: 10 spinner rotations | Ball pierces through targets destroying them | 10 seconds |

### 2.7 Ball × Object Interaction Matrix (F27)

| Ball → \ Object ↓ | Normal Ball | Explosive Ball | Piercing Ball |
|---|---|---|---|
| **Normal Bumper** | Reflect+100pt | Reflect+bumper destroyed+300pt | Pierce+100pt |
| **Power Bumper** | Strong reflect+250pt | Reflect+250pt (indestructible) | Pierce+250pt |
| **Crystal Target** | Reflect+destroy+500pt | Radius AoE destroy | Pierce+destroy+500pt |
| **Drop Target** | Reflect+press down | All pressed | Pierce+press down |
| **Spinner** | Spin+50pt/rotation | Spin+50pt/rotation | Pierce (no spin) |
| **Kickout Hole** | Absorb→launch | Absorb→launch | Pierce (no absorb) |
| **Wall** | Reflect | Reflect | Reflect |
| **Flipper** | Reflect (power applied) | Reflect (power applied) | Reflect (power applied) |

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| ← (Left Arrow) / Z | Left flipper |
| → (Right Arrow) / X | Right flipper |
| ↓ (Down Arrow) / Space | Plunger (hold to charge, release to launch) |
| P / Escape | Pause |
| Enter | Menu confirm |

### 3.2 Mouse
| Action | Effect |
|--------|--------|
| Click left half of screen | Left flipper |
| Click right half of screen | Right flipper |
| Drag down on plunger area → release | Plunger launch (drag distance = power) |
| Click UI buttons | Menu navigation |

### 3.3 Touch (Mobile)
| Action | Effect |
|--------|--------|
| Touch bottom-left 1/3 | Left flipper |
| Touch bottom-right 1/3 | Right flipper |
| Swipe up on plunger area | Plunger launch (swipe speed = power) |
| Two-finger simultaneous touch | Both flippers simultaneously |
| Tap UI buttons | Menu navigation |

> ⚠️ Touch areas are limited to bottom 40% of screen height, ensuring table view and flipper control areas don't overlap. All touch targets minimum 48×48px (F20, F24).

### 3.4 Auto Input Mode Detection (F21)
```
inputMode = 'keyboard' | 'mouse' | 'touch'
// Auto-switch based on last input event
// On-screen guide text changes per mode
```

---

## §4. Visual Style Guide

### 4.1 Color Palette

| Purpose | Color | HEX |
|---------|-------|-----|
| Background (space/deep night) | Dark Navy | #0A0E27 |
| Table surface | Dark Indigo | #141852 |
| Table border | Metallic Silver | #8892B0 |
| Flippers | Bright Cyan | #00E5FF |
| Ball | White Glow | #FFFFFF (glow: #00E5FF) |
| Crystal Target - Red | Ruby | #FF1744 |
| Crystal Target - Blue | Sapphire | #2979FF |
| Crystal Target - Green | Emerald | #00E676 |
| Crystal Target - Yellow | Topaz | #FFEA00 |
| Crystal Target - Purple | Amethyst | #D500F9 |
| Normal Bumper | Orange Neon | #FF6D00 |
| Power Bumper | Gold Glow | #FFD600 |
| Combo Text | Hot Pink | #FF4081 |
| UI Background | Semi-transparent Dark | rgba(10, 14, 39, 0.85) |
| UI Text | Bright White | #E8EAED |

### 4.2 Canvas Drawing Style (F9 — No SVG Filters)
- **Glow effects**: `ctx.shadowBlur` + `ctx.shadowColor` for neon glow
- **Crystal targets**: Polygons (6~8 sides) + inner gradient (`createRadialGradient`) + outer glow
- **Bumpers**: Circles + hit-expand animation + brightness flash
- **Flippers**: Rounded trapezoid, rotation animation (0° → 45° swing)
- **Ball**: Circle + movement trail + glow
- **Background**: Multi-layer star field (parallax) + nebula gradients

### 4.3 Offscreen Canvas Caching (F10)
```
buildTableCache(tableId):
  Draw table walls, rails, fixed decorations to offCtx once
  → Store in tableCache[tableId]
  → Reuse via drawImage(tableCache[tableId]) in render()

Rebuild conditions:
  - On resizeCanvas() call
  - On table switch
  - On devicePixelRatio change (multi-monitor movement)
```

### 4.4 Particle System
```javascript
// ParticlePool — object pooling to minimize GC
const PARTICLE_POOL_SIZE = 200;
// Per-type particle settings
PARTICLE_TYPES = {
  bumperHit:   { count: 8,  life: 0.4, speed: 200, color: '#FF6D00', size: 3 },
  crystalBreak:{ count: 15, life: 0.6, speed: 150, color: 'inherit', size: 4 },
  comboFlash:  { count: 20, life: 0.3, speed: 300, color: '#FF4081', size: 2 },
  ballTrail:   { count: 1,  life: 0.2, speed: 0,   color: '#00E5FF', size: 2 },
  drainWarn:   { count: 5,  life: 1.0, speed: 50,  color: '#FF1744', size: 3 },
  tableComplete:{ count: 50, life: 1.5, speed: 250, color: 'rainbow', size: 5 }
};
```

### 4.5 Screen Shake / Slow Motion
- **Screen shake**: On combo 20+ or boss hit — `shakeIntensity = 8`, `shakeDuration = 0.3s`
  - `ctx.translate(rand(-shake, shake), rand(-shake, shake))` each frame
- **Slow motion**: On boss final hit — `timeScale = 0.3` → 1.0 over 1 second recovery
  - `dt *= timeScale` applied

### 4.6 Background Layers (3-Layer Parallax)
| Layer | Content | Movement Speed |
|-------|---------|---------------|
| far (back) | 200 small stars (1~2px, twinkle) | ball movement × 0.02 |
| mid (middle) | 3~4 nebula gradient blobs | ball movement × 0.05 |
| near (front) | 20 large stars (3~4px, bright glow) | ball movement × 0.1 |

> ⚠️ Parallax is subtle ball-position-based movement. Maximum ±10px range to prevent dizziness.

### 4.7 UI Scroll (F32)
- Canvas-internal scroll when upgrade shop has 6+ items
- Touch: swipe drag to scroll with inertial scrolling
- Mouse: wheel scroll
- Keyboard: ↑↓ arrow keys
- Visual scrollbar indicator (thin bar on right)

---

## §5. Core Game Loop (Per-Frame Logic Flow)

### 5.1 Main Loop (F12)
```
function gameLoop(timestamp):
  try:
    dt = min((timestamp - lastTime) / 1000, 0.05)  // dt cap 50ms
    lastTime = timestamp

    tweenManager.update(dt)

    switch(gameState):
      TITLE:        updateTitle(dt)
      TABLE_SELECT: updateTableSelect(dt)
      PLAYING:      updatePlaying(dt)
      DRAIN:        updateDrain(dt)
      TABLE_CLEAR:  updateTableClear(dt)
      UPGRADE:      updateUpgrade(dt)
      BOSS_INTRO:   updateBossIntro(dt)
      GAMEOVER:     updateGameOver(dt)
      RESULT:       updateResult(dt)
      PAUSED:       // no-op (tween already updated above)

    render(gameState, dt)

  catch(e):
    console.error('GameLoop error:', e)

  requestAnimationFrame(gameLoop)
```

### 5.2 Physics Update (Sub-stepping)
```
function updatePlaying(dt):
  if isTransitioning: return  // F5 guard

  // Physics sub-steps (stable collision detection)
  const SUB_STEPS = 4
  const subDt = dt / SUB_STEPS
  for i in 0..SUB_STEPS:
    applyGravity(ball, subDt)       // Apply gravity
    updateBallPosition(ball, subDt) // Update position
    checkWallCollision(ball, table) // Wall collision
    checkFlipperCollision(ball, flippers)  // Flipper collision
    checkBumperCollision(ball, bumpers)    // Bumper collision
    checkTargetCollision(ball, targets)    // Target collision
    checkSpecialCollision(ball, specials)  // Special object collision
    checkDrain(ball)                       // Drain check

  updateCombo(dt)         // Combo timer
  updateParticles(dt)     // Particles
  updateAnimations(dt)    // UI animations
  checkTableClear()       // Clear condition check

  // F26: state changes only in update()
```

### 5.3 Collision Detection — Circle-Line/Circle-Circle
```
// Ball-wall: circle-line segment nearest point → distance < radius → reflect vector
// Ball-bumper: circle-circle distance < r1+r2 → normal vector reflection + restitution
// Ball-flipper: flipper approximated as line segment, extra velocity if swinging
// Ball-target: circle-polygon (simplified → circle-circle approximation)

function resolveCircleCollision(ball, obj, restitution):
  nx = (ball.x - obj.x) / dist
  ny = (ball.y - obj.y) / dist
  vDotN = ball.vx * nx + ball.vy * ny
  ball.vx -= (1 + restitution) * vDotN * nx
  ball.vy -= (1 + restitution) * vDotN * ny
  // Position correction (prevent tunneling)
  overlap = (ball.r + obj.r) - dist
  ball.x += nx * overlap
  ball.y += ny * overlap
```

### 5.4 Guard Flag System (F5)
```
isTransitioning = false  // During screen transition
isLaunching = false      // During plunger launch
isDraining = false       // During drain animation
isBossIntro = false      // During boss intro

// Check at entry of all state transition functions
function beginDrain():
  if isDraining: return  // Prevent duplicate calls
  isDraining = true
  ...
```

### 5.5 Effect Application Reference Verification (F31)
```
// All game effects verify target validity before application
function applyBumperHit(ball, bumper):
  if !ball || !bumper: return           // null check
  if bumper.destroyed: return            // already destroyed bumper
  addScore(bumper.points * comboMult)    // single path score update (F16)
  bumper.hitAnim = 1.0                   // start hit animation
  spawnParticles('bumperHit', bumper.x, bumper.y)
  playSound('bumperHit')
```

---

## §6. Game State Machine

### 6.1 State List (9 States)

| State | Description |
|-------|-------------|
| TITLE | Title screen — logo + "TAP TO START" |
| TABLE_SELECT | Table selection screen — list of unlocked tables |
| PLAYING | Pinball gameplay in progress |
| DRAIN | Ball drain → remaining balls display → re-launch or GAMEOVER |
| TABLE_CLEAR | Table clear animation → crystal reward |
| UPGRADE | Upgrade shop |
| BOSS_INTRO | Boss table intro sequence (1.5 seconds) |
| GAMEOVER | Game over — final score + retry |
| RESULT | Full clear — stats + achievement review |

### 6.2 State Transition Priority (F17, F23)
```
STATE_PRIORITY = {
  GAMEOVER: 100,
  DRAIN: 90,
  TABLE_CLEAR: 80,
  BOSS_INTRO: 70,
  UPGRADE: 60,
  RESULT: 50,
  PLAYING: 40,
  TABLE_SELECT: 30,
  TITLE: 20
}

function beginTransition(nextState, duration = 0.4):
  if isTransitioning: return
  if STATE_PRIORITY[nextState] < STATE_PRIORITY[gameState]:
    return  // Reject lower priority transition (exception: explicit return to TITLE)
  isTransitioning = true
  tweenManager.add({
    target: transitionAlpha,
    from: 0, to: 1,
    duration: duration / 2,
    onComplete: () => {
      enterState(nextState)
      tweenManager.add({
        target: transitionAlpha,
        from: 1, to: 0,
        duration: duration / 2,
        onComplete: () => { isTransitioning = false }
      })
    }
  })

// PAUSED only exception: instant transition
function togglePause():
  if gameState === 'PAUSED':
    gameState = prevState
  else:
    prevState = gameState
    gameState = 'PAUSED'
```

### 6.3 State × System Matrix (F4)

| System \ State | TITLE | TABLE_SELECT | PLAYING | DRAIN | TABLE_CLEAR | UPGRADE | BOSS_INTRO | GAMEOVER | RESULT | PAUSED |
|---|---|---|---|---|---|---|---|---|---|---|
| **Physics Engine** | ✗ | ✗ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Collision Detection** | ✗ | ✗ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **TweenManager** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Particles** | ✅ | ✗ | ✅ | ✅ | ✅ | ✗ | ✅ | ✅ | ✅ | ✗ |
| **Input Processing** | ✅ | ✅ | ✅ | ✗ | ✗ | ✅ | ✗ | ✅ | ✅ | ✅ |
| **Sound** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✗ |
| **Background Render** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **UI Render** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Combo Timer** | ✗ | ✗ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

> ⚠️ TweenManager updates in **all states** (including PAUSED). Cycle 2 B1 lesson.

---

## §7. Scoring System & Balance

### 7.1 Score Formula
```
hitScore = basePoints × comboMultiplier × (1 + flipperPowerBonus)
// comboMultiplier: see §2.4
// flipperPowerBonus: upgrade level × 0.1 (max +50%)
```

### 7.2 Balance Constants Table (F28)

#### Physics Constants
| Constant | Value | Description |
|----------|-------|-------------|
| GRAVITY | 980 | px/s² (realistic feel) |
| BALL_RADIUS | 10 | px |
| BALL_MAX_SPEED | 1500 | px/s |
| FLIPPER_LENGTH | 80 | px |
| FLIPPER_SWING_SPEED | 8 | rad/s |
| FLIPPER_RESTITUTION | 1.2 | Restitution coefficient (>1 for acceleration) |
| BUMPER_RESTITUTION | 1.5 | Bumper restitution coefficient |
| WALL_RESTITUTION | 0.6 | Wall restitution coefficient |
| PLUNGER_MIN_POWER | 400 | px/s |
| PLUNGER_MAX_POWER | 1200 | px/s |

#### Upgrade Cost Table (UPGRADE_DATA)
| Upgrade | Lv1 | Lv2 | Lv3 | Lv4 | Lv5 | Effect |
|---------|-----|-----|-----|-----|-----|--------|
| Flipper Power | 3💎 | 6💎 | 10💎 | 15💎 | 25💎 | Restitution +0.1/Lv |
| Ball Control | 3💎 | 6💎 | 10💎 | 15💎 | 25💎 | Max speed -5%/Lv (easier control) |
| Combo Duration | 5💎 | 10💎 | 18💎 | — | — | Combo timer +0.3s/Lv |
| Save Gate | 5💎 | 12💎 | 20💎 | — | — | Gate charge hits -2/Lv |
| Multiball | 8💎 | 15💎 | — | — | — | Multiball extra balls +1/Lv |
| Explosive Ball | 10💎 | 20💎 | — | — | — | Explosion radius +20px/Lv |
| Piercing Ball | 10💎 | 20💎 | — | — | — | Pierce duration +5s/Lv |
| Extra Ball | 15💎 | 30💎 | — | — | — | Starting balls +1/Lv |

#### Table Data (TABLE_DATA)
| # | Name | Crystal Targets | Normal Bumpers | Power Bumpers | Special Elements | Clear Reward |
|---|------|----------------|---------------|--------------|-----------------|-------------|
| 1 | Crystal Cavern | 5 | 3 | 0 | — | 5💎 |
| 2 | Sapphire Depths | 6 | 3 | 1 | Spinner ×1 | 7💎 |
| 3 | Emerald Forest | 7 | 4 | 1 | Rollover Lanes ×3 | 9💎 |
| 4 | Topaz Desert | 8 | 4 | 2 | Kickout Hole ×1 | 12💎 |
| 5 | **Ruby Volcano (Mid-Boss)** | 10 | 5 | 2 | Boss Core ×1 | 18💎 |
| 6 | Amethyst Sky | 8 | 4 | 2 | Multiball Lanes ×3 | 14💎 |
| 7 | Opal Labyrinth | 9 | 5 | 3 | Drop Target Set | 16💎 |
| 8 | Diamond Glacier | 10 | 5 | 3 | Spinners ×2, Kickout ×1 | 20💎 |
| 9 | Moonstone Abyss | 11 | 6 | 3 | All included | 24💎 |
| 10 | **Prism Throne (Final Boss)** | 12 | 6 | 4 | Boss Cores ×3, All included | 50💎 |

---

## §8. Asset Strategy — 100% Canvas Code Drawing (F1)

> ⚠️ **assets/ directory strictly prohibited.** This item is emphasized as top priority to prevent 20-cycle consecutive recurrence.

### 8.1 Canvas Drawing Function List

| Function | Subject | Key APIs |
|----------|---------|----------|
| `drawBall(ctx, ball)` | Ball + glow + trail | arc, shadowBlur, globalAlpha |
| `drawFlipper(ctx, flipper)` | Flipper (rotation anim) | save/restore, rotate, roundRect |
| `drawBumper(ctx, bumper)` | Bumper (hit flash) | arc, radialGradient, shadowBlur |
| `drawCrystalTarget(ctx, target)` | Crystal polygon | beginPath, lineTo (6~8 sides), linearGradient |
| `drawDropTarget(ctx, dropTarget)` | Drop target set | fillRect, strokeRect |
| `drawSpinner(ctx, spinner)` | Spinner (rotation) | save/restore, rotate, fillRect |
| `drawRolloverLane(ctx, lane)` | Rollover lane | strokeStyle, lineWidth, lineDash |
| `drawKickoutHole(ctx, hole)` | Kickout hole | arc, radialGradient |
| `drawPlunger(ctx, plunger)` | Plunger (pull anim) | fillRect, radialGradient |
| `drawWalls(ctx, table)` | Table walls/rails | beginPath, lineTo, stroke |
| `drawSaveGate(ctx, gate)` | Save gate | moveTo, lineTo, strokeStyle |
| `drawBoss(ctx, boss)` | Boss core (per-phase) | arc, radialGradient, rotation |
| `drawBackground(ctx)` | Stars + nebula BG | arc, radialGradient, globalAlpha |
| `drawParticle(ctx, p)` | Single particle | arc, globalAlpha |
| `drawUI(ctx, state)` | HUD, score, ball count | fillText, roundRect |

### 8.2 thumbnail.svg
- **Only permitted external file**
- Game highlight scene: 2 flippers + ball + 3 crystal bumpers + glow effects + "CRYSTAL PINBALL" text
- viewBox="0 0 400 300", 15KB+
- SVG filters **prohibited** (F9)

---

## §9. Difficulty System

### 9.1 Per-Table Difficulty Scaling
| Element | T1 | T3 | T5 (Mid-Boss) | T7 | T10 (Final Boss) |
|---------|-----|-----|------|-----|------|
| Crystal targets | 5 | 7 | 10 | 9 | 12 |
| Target durability | 1 | 1 | 2 | 2 | 3 |
| Bumper restitution | 1.5 | 1.6 | 1.8 | 1.7 | 2.0 |
| Drain hole width | 80px | 90px | 100px | 95px | 110px |
| Moving obstacles | none | none | 1 | 2 | 3 |
| Gravity multiplier | 1.0 | 1.05 | 1.1 | 1.1 | 1.2 |

### 9.2 Boss Table Special Rules

#### Table 5 — Ruby Volcano (Mid-Boss)
- **Boss Core**: Top center of table, HP 20
- **Pattern A (0~10 HP lost)**: Spawns 1 "flame bumper" every 2 seconds (reduces ball speed on hit)
- **Pattern B (below 10 HP)**: Spawns 2 flame bumpers every 1.5 seconds + moving obstacle activated
- **Weakness**: Direct ball hit on core = 1 HP damage, crystal target destruction = 2 HP damage

#### Table 10 — Prism Throne (Final Boss)
- **Boss Cores**: 3 (left/center/right), each HP 15
- **Phase 1 (3 cores)**: Each core fires "prism beam" (creates reflect walls, 5s duration)
- **Phase 2 (2 cores)**: Remaining cores activate "gravity distortion" (pulls ball toward core)
- **Phase 3 (1 core)**: Final core activates "prism shield" (3 protective bumpers orbit around)
- **All cores destroyed → Game Clear**

---

## §10. Achievement System

| # | Name | Condition | Reward |
|---|------|-----------|--------|
| 1 | First Launch | Launch first ball | 1💎 |
| 2 | Combo Master | Achieve combo 20+ | 3💎 |
| 3 | Crystal Collector | Collect 50 cumulative crystals | 5💎 |
| 4 | All Clear | Clear tables 1~4 | 5💎 |
| 5 | Mid-Boss Slayer | Clear table 5 (Ruby Volcano) | 8💎 |
| 6 | Perfect Game | Clear a table without losing a ball | 5💎 |
| 7 | Multiball Expert | Hit a bumper with every ball during multiball mode | 3💎 |
| 8 | Art of Explosion | Destroy 3 crystal targets simultaneously with explosive ball | 5💎 |
| 9 | Million Points | Reach 1,000,000 cumulative points | 10💎 |
| 10 | Prism Conqueror | Clear table 10 (Final Boss) | 20💎 |

- Achievements saved to `localStorage`
- Achievement unlocked → toast notification at top of screen (tween slide in/out)
- Full achievement list viewable on RESULT screen

---

## §11. Table Object Details

### 11.1 Normal Bumper
- **Shape**: Circle, radius 20px
- **Behavior**: Reflects ball with restitution 1.5
- **Visual**: Orange neon, 0.15s brightness flash + 1.3× radius expansion on hit
- **Sound**: bumperHit (short "pong" tone)

### 11.2 Power Bumper
- **Shape**: Circle, radius 25px, inner star pattern
- **Behavior**: Restitution 2.0 + 1.3× ball speed boost
- **Visual**: Gold glow, particle emission + star rotation animation on hit
- **Sound**: powerBumperHit (strong "bang" tone)

### 11.3 Crystal Target
- **Shape**: Hexagon, radius 18px, random from 5 colors
- **Behavior**: Durability -1 on hit, destroyed at 0 → crystal earned
- **Visual**: Color-matched glow, 15 particles on destruction + floating crystal icon
- **Sound**: crystalBreak (glass shattering tone)

### 11.4 Drop Target Set
- **Shape**: 4~5 rectangular targets in a row
- **Behavior**: Each hit presses down (deactivates), all pressed = 1000pt bonus + full reset
- **Visual**: Pressed targets darken, flash on full press
- **Sound**: dropTarget (short "click" tone)

### 11.5 Spinner
- **Shape**: Horizontal bar (width 40px, height 5px), center rotation
- **Behavior**: Ball passes through → spins, 50pt per rotation
- **Visual**: Metallic silver, motion blur during spin (globalAlpha afterimage)
- **Sound**: spinner (rapid "tick-tick-tick" repeat)

### 11.6 Rollover Lane
- **Shape**: Vertical linear detection zone (length 60px)
- **Behavior**: 150pt on ball pass, all 3 passed = multiball activation
- **Visual**: Inactive=dim line, Active=bright cyan glow
- **Sound**: rollover (smooth "hum" tone)

### 11.7 Kickout Hole
- **Shape**: Circular hole, radius 15px
- **Behavior**: Absorbs ball → launches in random direction after 1 second + 300pt
- **Visual**: Dark circle + edge glow, pulsing animation during absorption
- **Sound**: kickout (absorption "swoosh" + launch "pow")

### 11.8 Save Gate
- **Shape**: Horizontal bar above drain hole
- **Behavior**: When active, prevents 1 ball drain, deactivates after use
- **Visual**: Inactive=transparent, Active=bright green pulsing glow
- **Charge**: 3 kickout hole entries (reducible via upgrade)

---

## §12. Mobile Support (F20, F21, F24)

### 12.1 Canvas Resolution
```javascript
function resizeCanvas():
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  ctx.scale(dpr, dpr)
  // Recalculate table scale
  tableScale = Math.min(
    window.innerWidth / TABLE_BASE_WIDTH,
    window.innerHeight / TABLE_BASE_HEIGHT
  )
  buildTableCache(currentTable)  // F10: cache rebuild
```

### 12.2 Touch Events
```javascript
canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

// touch-action: none (CSS)
// e.preventDefault() called in all handlers
```

### 12.3 Minimum Touch Target Size (F24)
```javascript
const MIN_TOUCH = 48 // px

function touchSafe(x, y, w, h):
  // Expand to 48px if below (maintain center)
  const safeW = Math.max(w, MIN_TOUCH)
  const safeH = Math.max(h, MIN_TOUCH)
  return {
    x: x - (safeW - w) / 2,
    y: y - (safeH - h) / 2,
    w: safeW,
    h: safeH
  }
```

### 12.4 Portrait Mode Optimization
- Pinball tables naturally suit **portrait ratio** (≈ 2:3)
- Optimal display in mobile portrait mode
- In landscape mode, UI placed in side margins

---

## §13. Sound System

### 13.1 Web Audio API Based (F2 — 0 setTimeouts)
```javascript
class SoundManager:
  constructor():
    this.ctx = null  // AudioContext (created after user interaction)

  init():
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()

  // All sounds are oscillator synthesis
  play(name, volume = 1.0):
    if !this.ctx: return
    const now = this.ctx.currentTime
    // Per-sound synthesis logic (see §13.2)
```

### 13.2 Sound Synthesis Design
| Sound | Waveform | Frequency | Envelope | Description |
|-------|----------|-----------|----------|-------------|
| bumperHit | sine+square | 440→880Hz (0.05s) | A:0.01 D:0.05 S:0 R:0.05 | Short "pong" |
| powerBumperHit | square+sawtooth | 660→1320Hz (0.08s) | A:0.01 D:0.08 S:0.3 R:0.1 | Strong "bang" |
| crystalBreak | noise+sine | 2000→200Hz (0.3s) | A:0.01 D:0.1 S:0.5 R:0.2 | Glass shatter |
| flipper | square | 220 (0.03s) | A:0.005 D:0.03 S:0 R:0.01 | Mechanical "click" |
| plunger | sine | 100→400Hz (0.1s) | A:0.01 D:0.1 S:0 R:0.05 | Spring "whoosh" |
| drain | sine | 440→110Hz (0.5s) | A:0.01 D:0.3 S:0.2 R:0.3 | Descending "woom" |
| combo | sine×3 | 523/659/784Hz | A:0.01 D:0.1 S:0.5 R:0.2 | Chord "ding!" |
| tableComplete | chord progression | C-E-G-C5 arpeggio | 0.15s each | Victory fanfare |
| bgmNormal | sine+triangle loop | Low drone + arpeggio | 8-bar loop | Normal BGM |
| bgmBoss | square+sawtooth loop | Tense bass + melody | 8-bar loop | Boss BGM |

### 13.3 Volume Balance Table (F29)
| Sound | Volume | Notes |
|-------|--------|-------|
| bgmNormal | 0.15 | Background — non-intrusive |
| bgmBoss | 0.20 | Emphasizes tension |
| bumperHit | 0.5 | Frequent — moderate volume |
| powerBumperHit | 0.6 | Slightly louder than normal bumper |
| crystalBreak | 0.7 | Core reward — clearly audible |
| flipper | 0.3 | Very frequent — keep low |
| plunger | 0.5 | Launch feedback |
| drain | 0.8 | Warning — loud |
| combo | 0.6 | Reward feedback |
| tableComplete | 0.8 | Clear — loud |

---

## §14. Code Quality Assurance Checklist

### 14.1 Variable Declaration Order (F11)
```
1. 'use strict'
2. const CONFIG = { ... }          // Configuration constants
3. const TABLE_DATA = [ ... ]      // Table data
4. const UPGRADE_DATA = [ ... ]    // Upgrade data
5. let canvas, ctx                 // DOM references
6. let gameState, prevState        // State variables
7. let ball, flippers, bumpers...  // Game objects
8. let tweenManager, soundManager  // Managers
9. let particlePool               // Particle pool
10. // --- Function definitions ---
11. // --- Event registration ---
12. // --- init() call ---
```

### 14.2 Variable Usage Verification Table (F15)
| Variable | Declaration | Update Location | Usage Location |
|----------|------------|-----------------|----------------|
| ball.x/y | initBall() | updateBallPosition() | render(), checkCollision() |
| ball.vx/vy | initBall() | applyGravity(), resolveCollision() | updateBallPosition() |
| comboCount | PLAYING entry | applyBumperHit(), updateCombo() | hitScore calc, drawCombo() |
| comboTimer | PLAYING entry | applyBumperHit(), updateCombo() | updateCombo() reset check |
| score | initGame() | addScore() single path | drawUI(), checkAchievement() |
| crystals | initGame() | addCrystals() single path | drawUI(), canUpgrade() |
| ballsLeft | initGame() | drainBall() single path | drawUI(), checkGameOver() |
| isTransitioning | beginTransition() | beginTransition onComplete | All update function guards |
| isDraining | beginDrain() | beginDrain(), drainComplete() | updatePlaying() guard |
| tableScale | resizeCanvas() | resizeCanvas() | All draw functions |

### 14.3 Per-Feature Implementation Checklist (F19)
- [ ] Left flipper: keyboard(←/Z) + mouse(left click) + touch(bottom-left)
- [ ] Right flipper: keyboard(→/X) + mouse(right click) + touch(bottom-right)
- [ ] Plunger: keyboard(↓/Space hold) + mouse(drag) + touch(swipe)
- [ ] Ball-wall collision: reflect + position correction
- [ ] Ball-bumper collision: reflect + score + particles + sound
- [ ] Ball-target collision: reflect + durability decrease + (on destroy) crystal + particles + sound
- [ ] Ball-flipper collision: extra velocity when swinging
- [ ] Drain detection: ball.y > drainLine → isDraining → ballsLeft - 1
- [ ] Table clear: all crystal targets destroyed → TABLE_CLEAR
- [ ] Combo: re-hit within 1s → counter increase, timeout → reset
- [ ] Multiball: 3 lanes passed → 2 extra balls
- [ ] Save gate: 3 kickout entries → gate active → 1 drain prevented
- [ ] Upgrade shop: after table clear → purchase with crystals
- [ ] Boss patterns: T5 flame bumpers, T10 prism 3-core
- [ ] 10 achievements: condition met → toast notification → localStorage save
- [ ] Pause: P/ESC → overlay + input blocked
- [ ] BGM transition: normal→boss crossfade

### 14.4 Value Consistency Verification Table (F7)
> Cross-check these values against the spec during code review

| Item | Spec Value | Code Constant Verified |
|------|-----------|----------------------|
| GRAVITY | 980 | ☐ |
| BALL_RADIUS | 10 | ☐ |
| FLIPPER_LENGTH | 80 | ☐ |
| FLIPPER_RESTITUTION | 1.2 | ☐ |
| BUMPER_RESTITUTION | 1.5 | ☐ |
| Normal bumper score | 100 | ☐ |
| Power bumper score | 250 | ☐ |
| Crystal target score | 500 | ☐ |
| Combo ×2 range | 5~9 | ☐ |
| Combo ×3 range | 10~19 | ☐ |
| Combo ×5 range | 20+ | ☐ |
| T1 crystal targets | 5 | ☐ |
| T5 boss HP | 20 | ☐ |
| T10 boss core HP | 15 each | ☐ |
| Flipper Power Lv1 cost | 3💎 | ☐ |
| Extra Ball Lv1 cost | 15💎 | ☐ |

### 14.5 assets/ Directory Prohibition (F1 — 20 Cycles Top Priority)
```
⛔ Strictly Prohibited:
1. Creating assets/ directory
2. Referencing external SVG/PNG/JPG files
3. ASSET_MAP, SPRITES, preloadAssets or similar asset loading code
4. new Image(), fetch('assets/...') patterns
5. Google Fonts or other external resource loading

✅ Permitted:
1. thumbnail.svg (game directory root, for card display)
2. 100% Canvas code drawing
3. Web Audio oscillator synthesis
4. localStorage read/write
```

### 14.6 Code Review 15-Item Checklist
1. ☐ No assets/ directory exists
2. ☐ 0 setTimeouts (Web Audio native scheduling)
3. ☐ 0 confirm/alert/prompt calls
4. ☐ 0 global direct references (pure function pattern)
5. ☐ beginTransition() routing principle (PAUSED exception)
6. ☐ 0 state changes in render()
7. ☐ try-catch gameLoop wrapping
8. ☐ dt cap (0.05s)
9. ☐ devicePixelRatio applied
10. ☐ touch-action: none + passive: false
11. ☐ Touch targets 48×48px or larger
12. ☐ All spec values match code (§14.4)
13. ☐ 0 ghost variables (§14.2)
14. ☐ TweenManager clearImmediate() implemented
15. ☐ Offscreen canvas caching implemented

### 14.7 Regression Test Flow (F14)
```
Post-fix full flow regression test:
TITLE → TABLE_SELECT (select T1)
  → PLAYING (launch→flipper→bumper hit→target destroy→combo)
  → DRAIN (ball drain→remaining balls display)
  → PLAYING (re-launch)
  → TABLE_CLEAR (clear animation→reward)
  → UPGRADE (purchase→cancel)
  → TABLE_SELECT (select T2)
  → PLAYING
  → GAMEOVER (all balls lost)
  → TITLE (restart)
```

---

## §15. Code Architecture

### 15.1 Logical Section Structure (F30)
```
// ═══════════════════════════════════════════
// §A. CONFIG & DATA (constants, tables, upgrades)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §B. ENGINE (TweenManager, SoundManager, ParticlePool)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §C. PHYSICS (gravity, collision detection/resolution, sub-stepping)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §D. GAME OBJECTS (Ball, Flipper, Bumper, Target...)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §E. RENDERING (draw functions, offscreen cache)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §F. GAME STATES (enter/update/exit per state)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §G. INPUT (keyboard/mouse/touch handlers)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §H. SAVE/LOAD (localStorage)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// §I. INIT (DOM setup, event registration, game start)
// ═══════════════════════════════════════════
```

### 15.2 Pure Function Pattern (F3)
```javascript
// ❌ Prohibited: global direct reference
function checkDrain() {
  if (ball.y > drainLine) { ... }
}

// ✅ Required: parameter passing
function checkDrain(ball, drainLineY) {
  if (ball.y > drainLineY) { ... }
}
```

### 15.3 Single Update Path (F16)
```javascript
// Score update: use addScore() only
function addScore(amount) { score += amount; }

// Crystal update: use addCrystals() only
function addCrystals(amount) { crystals += amount; }

// Ball decrease: use drainBall() only
function drainBall() { ballsLeft--; }

// ❌ Prohibited: score += 100 direct assignment
// ❌ Prohibited: ballsLeft-- direct assignment
```

### 15.4 TweenManager (F6)
```javascript
class TweenManager {
  _tweens = []
  _pendingAdd = []
  _isUpdating = false

  add(tween) {
    if (this._isUpdating) {
      this._pendingAdd.push(tween)
    } else {
      this._tweens.push(tween)
    }
    return tween
  }

  clearImmediate() {
    // Immediate cleanup — resolves cancelAll() deferred issue
    this._tweens.length = 0
    this._pendingAdd.length = 0
    this._isUpdating = false
  }

  update(dt) {
    this._isUpdating = true
    // ... update logic ...
    this._isUpdating = false
    // Apply pending
    if (this._pendingAdd.length > 0) {
      this._tweens.push(...this._pendingAdd)
      this._pendingAdd.length = 0
    }
  }
}
```

---

## §16. Save/Load

### 16.1 Save Data Structure
```javascript
const SAVE_KEY = 'crystal-pinball-save'

saveData = {
  version: 1,
  unlockedTable: 4,      // Highest unlocked table number
  crystals: 25,           // Current crystals
  upgrades: {             // Upgrade levels
    flipperPower: 2,
    ballControl: 1,
    comboDuration: 0,
    saveGate: 1,
    multiball: 0,
    explosiveBall: 0,
    piercingBall: 0,
    extraBall: 0
  },
  highScore: 150000,      // High score
  achievements: [1, 2, 5], // Achieved achievement IDs
  totalCrystals: 48,      // Cumulative collected crystals
  totalScore: 580000       // Cumulative score
}
```

### 16.2 Judgment Order (Cycle 2 B4 Lesson)
```
// Always "judge first, save second"
const isNewHighScore = (score > loadHighScore())
saveHighScore(score)
if (isNewHighScore) showNewRecord()
```

---

## Sidebar Metadata (Game Page Display)

```yaml
game:
  title: "Crystal Pinball"
  description: "Control a glowing ball on a pinball table filled with magic crystals! Master 10 tables, upgrade your flippers with crystals, and defeat the final boss."
  genre: ["arcade", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "←/→ or Z/X: Left/Right Flipper"
    - "↓/Space: Plunger (hold to charge power)"
    - "P/ESC: Pause"
    - "Touch: Tap left/right screen = Flipper, Swipe = Launch"
  tags:
    - "#pinball"
    - "#physics"
    - "#crystal"
    - "#arcade"
    - "#upgrade"
    - "#boss-battle"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## Home Page GameCard Display Info

```yaml
thumbnail: "games/crystal-pinball/thumbnail.svg"  # 4:3 ratio crop
title: "Crystal Pinball"  # 1-line truncate
description: "Control a glowing ball on a pinball table filled with magic crystals! Master 10 tables and defeat the final boss."  # 2-line truncate
genre: ["arcade", "casual"]  # Max 2 badges
playCount: 0  # 1000+ displays as "1.2k" format
addedAt: "2026-03-22"  # Within 7 days → "NEW" badge
featured: true  # ⭐ badge displayed
```
