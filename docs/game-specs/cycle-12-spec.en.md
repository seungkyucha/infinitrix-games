---
game-id: neon-drift-racer
title: Neon Drift Racer
genre: arcade
difficulty: medium
---

# Neon Drift Racer — Detailed Game Design Document (Cycle 12)

---

## §0. Previous Cycle Feedback Mapping

| # | Source | Problem/Suggestion | Solution in This Spec |
|---|--------|-------------------|----------------------|
| 1 | Cycle 12 Analysis Report | **Racing genre 0% — complete gap** | ✅ This game adds the platform's first racing genre |
| 2 | Cycle 12 Analysis Report | **Casual 55% concentration** | ✅ Pure arcade tag. No casual tag → casual 55%→50% |
| 3 | Cycle 11 Postmortem | **"Let's try racing" direct suggestion** | ✅ Directly reflected as top-down arcade racing |
| 4 | Cycle 11 Postmortem | **Reuse physics engine know-how** | ✅ AABB collision → evolved to vector-based vehicle physics. Camera tracking system reused |
| 5 | Cycle 11 Postmortem | **3 reviews needed — targeting 1st-round pass** | §12.1 — 100% Canvas code drawing from the start. assets/ directory creation absolutely forbidden |
| 6 | Cycle 11 Postmortem | **CI pre-commit hook actually registered** | §12.2 — Actually register assets/ verification script in `.git/hooks/pre-commit` and verify it works |
| 7 | Cycle 11 Postmortem | **Common engine module separation suggestion** | §12.10 — Outside this spec's scope (separate task). TweenManager/ObjectPool/TransitionGuard maintain same interface |
| 8 | Cycle 11 Postmortem | **6 world-specific obstacle types unimplemented** | ✅ This game implements unique obstacles/special sections for each of 3 tracks (§2.4) |
| 9 | Cycle 11 Postmortem | **Daily challenge unimplemented** | Outside this game's scope. Focus on core racing to prevent scope creep |
| 10 | platform-wisdom [Cycle 1~11] | **assets/ directory recurring for 11 cycles** | §12.1 — Canvas API only. assets/ creation forbidden. pre-commit hook actually registered |
| 11 | platform-wisdom [Cycle 1] | **confirm()/alert() forbidden in iframe** | All modals/dialogs use Canvas-based custom UI |
| 12 | platform-wisdom [Cycle 2] | **State×system matrix required** | §5.3 — 6 states × 7 systems matrix included |
| 13 | platform-wisdom [Cycle 3] | **tween onComplete guard flag** | §5.2 — `_transitioning` guard flag applied to all state transitions |
| 14 | platform-wisdom [Cycle 4] | **cancelAll+add race condition** | §12.4 — clearImmediate() immediate cleanup API usage |
| 15 | platform-wisdom [Cycle 2] | **setTimeout state transition forbidden** | §5 — All delayed transitions use tween onComplete. 0 setTimeout usage target |
| 16 | platform-wisdom [Cycle 5] | **Unified single value update path** | Each value uses either tween OR direct assignment, not both |
| 17 | platform-wisdom [Cycle 6-7] | **Pure function principle** | §10 — All physics/collision/AI functions are parameter-based pure functions |
| 18 | platform-wisdom [Cycle 7] | **Spec-implementation value mismatch** | §6, §7 — Physics constants concentrated in CONFIG object. 1:1 cross-reference with spec value table |
| 19 | platform-wisdom [Cycle 8] | **beginTransition() bypass** | §5.2 — All transitions go through `beginTransition()`. Immediate transitions also use `beginTransition(state, {immediate:true})` |
| 20 | platform-wisdom [Cycle 8] | **Immediate transition exceptions like PAUSED** | §5.2 — PAUSED↔RACE transitions unified with `immediate:true` option |
| 21 | platform-wisdom [Cycle 10] | **Fix regression — call site propagation missed on signature change** | §12.8 — Full verification of all call sites when changing function signatures |
| 22 | platform-wisdom [Cycle 11] | **let/const TDZ crash** | §12.7 — All variables declared before first reference |
| 23 | platform-wisdom [Cycle 2-3] | **Ghost variable prevention** | §12.3 — Full verification checklist for declared variable usage |
| 24 | platform-wisdom [Cycle 10] | **Game loop try-catch wrapping required** | §12.9 — `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` pattern |
| 25 | platform-wisdom [Cycle 11] | **dt parameter passing** | All render/update functions receive dt as parameter from gameLoop |

---

## §1. Game Overview & Core Fun

### Concept
A **top-down arcade racer** where you compete against 3 AI vehicles using **drifts** and **boosts** on neon-lit futuristic city tracks. 1 race = 3 laps (~2-3 minutes), short sessions with high replayability. The core loop is "skill expression → reward" where mastering drift controls fills the boost gauge faster. 3 tracks unlock sequentially, full clear ~15-20 minutes. Per-track best times + leaderboard provide mastery motivation.

### 3 Core Fun Elements
1. **Drift mastery**: Auto-drift entry when braking+steering at high speed. Boost gauge charges proportional to drift angle and duration. The more "perfect drifts" you chain, the faster your lap time
2. **Boost rush**: Explosive momentary acceleration with Space when gauge is 50%+. Boost timing (straightaway vs. before curve entry) is a strategic choice
3. **AI competition and unlocks**: Rank competition against 3 AI vehicles. City top 3→Canyon, Canyon top 3→Star Ring unlock. Hard mode (AI +20% speed) for mastery extension

### References
- **Micro Machines**: Classic of top-down racing. Miniature vehicles + household item tracks
- **Drift King (CrazyGames)**: Validated popularity of browser drift racing
- **Moto X3M**: "Instant retry" addiction of physics-based racing
- **Initial D Arcade**: Originator of drift gauge→boost mechanic

### Game Page Sidebar Info
```yaml
title: "Neon Drift Racer"
description: "Use drifts and boosts to overtake the AI and claim 1st place in the neon-lit future city! Top-down arcade racing."
genre: ["arcade"]
playCount: 0
rating: 0
controls:
  - "Keyboard: ←→ steer / ↑ accelerate / ↓ brake / Space boost"
  - "Touch: Virtual steering (left) + Accel/Brake/Boost buttons (right)"
  - "Mouse: Menu selection only"
tags:
  - "#racing"
  - "#drift"
  - "#neon"
  - "#arcade"
  - "#singleplayer"
addedAt: "2026-03-21"
version: "1.0.0"
featured: true
```

---

## §2. Game Rules & Objectives

### 2.1 Ultimate Goal
Sequentially unlock 3 tracks (City Circuit→Canyon Run→Star Ring) and clear all with top 3 finish. Achieving 1st place on Star Ring unlocks Hard Mode.

### 2.2 Race Rules
- 4 vehicles (1 player + 3 AI) start simultaneously
- Rankings confirmed upon completing 3 laps
- Track boundary (wall) collision: 70% speed reduction + 0.3s stun
- Wrong-way driving shows "WRONG WAY" warning (reset to nearest checkpoint after 3+ seconds of wrong-way driving)
- Off-road (off-track) driving: 40% max speed reduction

### 2.3 Track Configuration

| Track | Theme | Difficulty | Color Palette | Features |
|-------|-------|-----------|---------------|----------|
| City Circuit | Neon City | Beginner | #0ff(cyan) + #333(road) + #111(background) | Wide road (120px), 4 gentle curves, many straight sections |
| Canyon Run | Desert Canyon | Intermediate | #f80(orange) + #543(road) + #221(background) | Narrow road (90px), 2 hairpins, consecutive S-curves, sand sections (slowdown) |
| Star Ring | Space Orbit | Advanced | #f0f(magenta) + #224(road) + #000(background) | Ultra-narrow road (70px), 5 sharp curves, 3 boost pads, meteor obstacles |

### 2.4 Track-specific Unique Elements (Cycle 11 "World-specific Obstacles Unimplemented" Improvement)

| Track | Unique Obstacles/Special Sections | Description |
|-------|----------------------------------|-------------|
| City Circuit | Construction barricades (2) | Fixed obstacles narrowing part of the road. Provides avoidance practice for beginners |
| Canyon Run | Sand sections (3) | Max speed limited to 50% + steering limited to 60% on entry. Drifting disabled |
| Star Ring | Meteors (4, reciprocating movement) | Move back and forth across the track. 2-second spinout on collision |

### 2.5 Unlock Conditions

| Condition | Result |
|-----------|--------|
| City Circuit top 3 | Canyon Run unlocked |
| Canyon Run top 3 | Star Ring unlocked |
| Star Ring 1st place | Hard Mode unlocked (AI speed +20%) |

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| ↑ or W | Accelerate |
| ↓ or S | Brake (drift entry when high speed+steering) |
| ← or A | Turn left |
| → or D | Turn right |
| Space | Use boost (gauge 50%+) |
| P or Esc | Pause |

### 3.2 Mobile Touch
- **Bottom-left**: Virtual steering wheel (circular area, touch drag for left/right steering)
- **Bottom-right**: 3 buttons vertically arranged
  - Accelerate (hold)
  - Brake (hold, drift when high speed+steering)
  - Boost (tap, active when gauge 50%+)
- **Top-right**: Pause button
- Mobile detection: `'ontouchstart' in window` → Touch UI automatically displayed

### 3.3 Mouse
- Click only on menu/track selection/result screens
- Not used for in-game controls

---

## §4. Visual Style Guide

### 4.1 Overall Tone
**Cyberpunk Neon** — Bright neon lines and glow effects on dark backgrounds. Tron Legacy + Outrun aesthetic.

### 4.2 Color Palette

| Usage | Color | HEX |
|-------|-------|-----|
| Background | Deep black | `#0a0a0a` |
| Track road | Dark gray | `#2a2a2a` |
| Track border | Neon cyan | `#00ffff` |
| Player vehicle | Neon cyan | `#00ffff` |
| AI vehicle 1 | Neon magenta | `#ff00ff` |
| AI vehicle 2 | Neon green | `#00ff66` |
| AI vehicle 3 | Neon orange | `#ff8800` |
| Boost gauge | Cyan→Yellow gradient | `#00ffff` → `#ffff00` |
| Drift afterimage | Semi-transparent player color | `rgba(0,255,255,0.3)` |
| UI text | Bright white | `#ffffff` |
| Warning text | Neon red | `#ff3333` |
| Checkpoint | Neon yellow | `#ffff00` |
| Minimap background | Semi-transparent black | `rgba(0,0,0,0.7)` |

### 4.3 Object Drawing (Canvas API Only, 0 assets/)

All visuals implemented via **Canvas 2D API** (fillRect, arc, lineTo, fillText, strokeStyle + lineWidth + globalAlpha). No external image/SVG files.

| Object | Drawing Method |
|--------|---------------|
| Vehicle | Rectangle (20x12px) + triangle front. Using `ctx.rotate(angle)` |
| Track | Polyline based on segment array. Road width via `ctx.lineWidth` |
| Track border | Normal direction offset from track polyline + neon glow (`shadowBlur`) |
| Checkpoint | Dashed line crossing track (`setLineDash`) |
| Boost pad | Triangle arrow pattern on track (neon yellow) |
| Drift afterimage | Semi-transparent vehicle shape at previous positions (alpha decay) |
| Boost effect | Particles behind vehicle (ObjectPool, circles 3~5px, alpha decay) |
| Tire marks | Semi-transparent lines on track during drift (`rgba(255,255,255,0.1)`) |
| Wall collision sparks | 3~5 particles radiating from collision point |
| Background stars | Small circles (1~2px) randomly placed (Star Ring only) |
| Minimap | Top-right 150x150px box. Scaled track + 4 vehicle dots |
| Barricade | Red-white striped rectangle (repeated fillRect) |
| Sand section | Yellow semi-transparent area (fillStyle + globalAlpha 0.3) |
| Meteor | Irregular circle (arc + 4~6 short lineTo protrusions) + orange glow |

### 4.4 Glow Effect Rules
- `ctx.shadowBlur = 8~15` + `ctx.shadowColor` = object color
- Performance protection: Glow applied only to **vehicles (4) + track borders + UI text**
- No glow on particles/tire marks (shadowBlur = 0)
- **feGaussianBlur and SVG filters absolutely never used**

---

## §5. Core Game Loop

### 5.1 Main Loop (60fps Basis)

```
requestAnimationFrame(loop)
+-- dt = clamp(now - lastTime, 0, 50) / 1000   // Max 50ms (20fps) cap
+-- try {
|   +-- switch(gameState) {
|   |   case TITLE:        updateTitle(dt)        -> renderTitle(ctx, dt)
|   |   case TRACK_SELECT: updateTrackSelect(dt)  -> renderTrackSelect(ctx, dt)
|   |   case COUNTDOWN:    updateCountdown(dt)    -> renderCountdown(ctx, dt)
|   |   case RACE:         updateRace(dt)         -> renderRace(ctx, dt)
|   |   case PAUSED:       /* no update */        -> renderPaused(ctx, dt)
|   |   case RESULT:       updateResult(dt)       -> renderResult(ctx, dt)
|   |   }
|   +-- tweenManager.update(dt)
|   +-- inputManager.resetFrame()
|   } catch(e) { console.error(e); }
+-- lastTime = now
```

### 5.2 State Transition Rules

All state transitions **must go through `beginTransition(targetState, options)`**. Direct `gameState = X` forbidden.

```javascript
function beginTransition(target, opts = {}) {
  if (_transitioning) return;       // Guard flag
  _transitioning = true;
  if (opts.immediate) {
    gameState = target;
    _transitioning = false;
    return;
  }
  tweenManager.clearImmediate();    // Immediate flush instead of cancelAll
  tweenManager.add({
    from: 1, to: 0, duration: 300,
    onUpdate: v => fadeAlpha = v,
    onComplete: () => {
      gameState = target;
      tweenManager.add({
        from: 0, to: 1, duration: 300,
        onUpdate: v => fadeAlpha = v,
        onComplete: () => { _transitioning = false; }
      });
    }
  });
}
```

Transition paths:
```
TITLE -> TRACK_SELECT -> COUNTDOWN -> RACE <-> PAUSED
                                       |
                                     RESULT -> TRACK_SELECT (or TITLE)
```

- `RACE <-> PAUSED`: `beginTransition(state, {immediate: true})` (instant transition)
- All others: Fade transition (300ms)

### 5.3 State × System Matrix

| System \ State | TITLE | TRACK_SELECT | COUNTDOWN | RACE | PAUSED | RESULT |
|---------------|-------|-------------|-----------|------|--------|--------|
| **Physics** | - | - | - | O | - | - |
| **AI** | - | - | - | O | - | - |
| **Render** | O | O | O | O | O | O |
| **Input** | O (menu) | O (menu) | - | O (controls) | O (P key only) | O (menu) |
| **Tween** | O | O | O | O | O | O |
| **Sound** | O (BGM) | O (BGM) | O (SFX) | O (all) | - | O (SFX) |
| **Particles** | - | - | - | O | - | - |

> **Tweens update even in PAUSED** (Cycle 2 B1 lesson: tween not updating in CONFIRM_MODAL causes modal alpha=0 freeze)

---

## §6. Vehicle Physics System

### 6.1 Physics Model (Vector-based)

```javascript
const CONFIG = {
  // --- Vehicle physics constants (1:1 mapped to spec §6 values) ---
  MAX_SPEED:          300,    // px/s max speed
  ACCELERATION:       180,    // px/s^2 acceleration
  BRAKE_FORCE:        250,    // px/s^2 brake deceleration
  COAST_FRICTION:     60,     // px/s^2 no-input friction
  STEER_SPEED:        3.2,    // rad/s steering speed
  STEER_SPEED_FACTOR: 0.4,    // High-speed steering reduction ratio
  DRIFT_THRESHOLD:    0.7,    // Drift entry at 70%+ speed ratio + brake + steering
  DRIFT_FRICTION:     0.92,   // Lateral friction coefficient during drift
  DRIFT_STEER_MULT:   1.4,    // Steering multiplier during drift
  BOOST_GAUGE_MAX:    100,    // Max boost gauge value
  BOOST_MIN_USE:      50,     // Minimum gauge for boost use
  BOOST_DRAIN:        40,     // Gauge drain per second during boost
  BOOST_SPEED_MULT:   1.6,    // Speed multiplier during boost
  BOOST_DURATION:     1.5,    // Boost duration (seconds)
  DRIFT_CHARGE_RATE:  25,     // Gauge charge per second during drift
  WALL_SPEED_MULT:    0.3,    // Remaining speed ratio on wall collision
  WALL_STUN:          0.3,    // Wall collision stun time (seconds)
  OFFROAD_SPEED_MULT: 0.6,    // Off-road max speed ratio
  SAND_SPEED_MULT:    0.5,    // Sand section max speed ratio
  SAND_STEER_MULT:    0.6,    // Sand section steering ratio
  SPINOUT_DURATION:   2.0,    // Meteor collision spinout (seconds)

  // --- AI constants ---
  AI_WAYPOINT_RADIUS: 40,     // AI waypoint reach detection radius
  AI_SPEED_EASY:      0.78,   // AI City Circuit speed multiplier
  AI_SPEED_MED:       0.85,   // AI Canyon speed multiplier
  AI_SPEED_HARD:      0.92,   // AI Star Ring speed multiplier
  AI_HARD_MODE_MULT:  1.20,   // Hard mode AI additional multiplier

  // --- Camera ---
  CAM_LERP:           0.08,   // Camera tracking interpolation coefficient
  CAM_LOOKAHEAD:      80,     // Movement direction look-ahead distance (px)
  CAM_SHAKE_WALL:     6,      // Wall collision shake intensity (px)
  CAM_SHAKE_BOOST:    3,      // Boost shake intensity (px)
};
```

### 6.2 Physics Update (Each Frame)

```
updateCarPhysics(car, input, dt, trackData):
  1. Stun timer check -> If stunned, apply deceleration only then return
  2. Steering calculation:
     effectiveSteer = input.steer * STEER_SPEED * (1 - speed/MAX_SPEED * STEER_SPEED_FACTOR)
     if (isDrifting) effectiveSteer *= DRIFT_STEER_MULT
     car.angle += effectiveSteer * dt
  3. Acceleration/deceleration:
     if (input.gas)   car.speed += ACCELERATION * dt
     if (input.brake) car.speed -= BRAKE_FORCE * dt
     else             car.speed -= COAST_FRICTION * dt
  4. Drift detection:
     if (input.brake && input.steer != 0 && car.speed/MAX_SPEED > DRIFT_THRESHOLD)
       -> isDrifting = true, apply DRIFT_FRICTION to lateral velocity, charge boost gauge
     else -> isDrifting = false
  5. Boost application:
     if (input.boost && boostGauge >= BOOST_MIN_USE)
       -> car.speed *= BOOST_SPEED_MULT (cap: MAX_SPEED * BOOST_SPEED_MULT)
       -> boostGauge -= BOOST_DRAIN * dt
  6. Speed limit:
     maxSpd = MAX_SPEED
     if (onOffroad) maxSpd *= OFFROAD_SPEED_MULT
     if (onSand)    maxSpd *= SAND_SPEED_MULT
     car.speed = clamp(car.speed, 0, maxSpd)
  7. Position update:
     car.x += cos(car.angle) * car.speed * dt
     car.y += sin(car.angle) * car.speed * dt
  8. Collision detection (track boundary):
     if (wall collision) -> speed *= WALL_SPEED_MULT, stunTimer = WALL_STUN, position correction
  9. Checkpoint/lap detection
```

### 6.3 Drift Detailed Mechanics

Drift entry conditions:
1. Speed >= MAX_SPEED × DRIFT_THRESHOLD (70%)
2. Brake input held
3. Left/right steering input held

During drift:
- **Slip angle** develops between movement direction and vehicle heading (max 35 degrees)
- Steering sensitivity ×1.4 → Sharper cornering
- Boost gauge +25 per second charge
- Drift afterimage effect + tire mark effect
- Sound effect: Tire skid

Drift end: Brake release OR speed < 50% OR steering release

---

## §7. Score System

### 7.1 Race Result Score

| Item | Score |
|------|-------|
| 1st place finish | 1000 |
| 2nd place finish | 700 |
| 3rd place finish | 400 |
| 4th place finish | 200 |
| Lap bonus (fastest lap) | +300 |
| Drift bonus (cumulative 3s+) | +50 × drift count |
| Clean lap (0 wall collisions) | +200 / lap |
| Boost usage count | +30 × count |

### 7.2 Record Saving (localStorage)

```javascript
// Key structure: ndr_{trackId}_{item}
// Example: ndr_city_bestLap, ndr_city_bestRace, ndr_city_bestScore

// Check first, save later (Cycle 2 B4 lesson)
const isNewRecord = (currentLap < getBestLap(trackId));
saveBestLap(trackId, currentLap);
if (isNewRecord) showNewRecordEffect();
```

Saved items:
- `ndr_{trackId}_bestLap`: Fastest single lap time
- `ndr_{trackId}_bestRace`: Fastest total race time
- `ndr_{trackId}_bestScore`: Best score
- `ndr_{trackId}_bestRank`: Best rank
- `ndr_unlocked`: Unlocked tracks array ("city" default)
- `ndr_hardMode`: Hard mode unlock status

---

## §8. AI System

### 8.1 Waypoint Tracking AI

Each track has a pre-defined **waypoint array** (20~30 coordinates). AI vehicles steer toward the next waypoint.

```
updateAI(aiCar, waypoints, dt, trackData, aiSpeedMult):
  1. Calculate angle to next waypoint
  2. Difference from current heading -> Determine steering input
  3. Detect obstacles (other vehicles, meteors) -> Avoidance steering correction
  4. Speed control: Decelerate before curves, accelerate on straights
     targetSpeed = MAX_SPEED * aiSpeedMult * (sharp curve ? 0.7 : 1.0)
  5. Waypoint reach detection -> Move to next waypoint
```

### 8.2 AI Personalities

| AI | Color | Trait | Base Speed Multiplier |
|----|-------|-------|----------------------|
| AI-1 "Blaze" | Magenta (#ff00ff) | Aggressive. Fast on straights, slow on curves | ×1.02 |
| AI-2 "Phantom" | Green (#00ff66) | Balanced. Stable driving | ×1.00 |
| AI-3 "Shadow" | Orange (#ff8800) | Defensive. Fast on curves, slow on straights | ×0.98 |

> Above multipliers are multiplied by per-track AI_SPEED_xxx. Example: Blaze on City = 0.78 × 1.02 = 0.796×

### 8.3 Rubber Banding (Simple)

- If player is half a lap ahead of AI: AI speed ×1.05
- If player is half a lap behind AI: AI speed ×0.95
- Minimal correction for fun. Excessive rubber banding forbidden.

---

## §9. Difficulty System

### 9.1 Per-track Difficulty Design

| Element | City Circuit (Beginner) | Canyon Run (Intermediate) | Star Ring (Advanced) |
|---------|------------------------|--------------------------|---------------------|
| Road width | 120px | 90px | 70px |
| Curve count | 4 (gentle) | 6 (2 hairpins) | 8 (5 sharp curves) |
| Special sections | 2 barricades | 3 sand areas | 4 meteors + 3 boost pads |
| AI speed ratio | 0.78 | 0.85 | 0.92 |
| Drift necessity | Low | Medium | High |
| Est. time per lap | 35~45s | 40~55s | 45~65s |

### 9.2 Hard Mode (Unlocked After Star Ring 1st Place)

- All tracks: AI speed ×1.20 additional multiplier
- AI rubber banding disabled
- Wall collision stun 0.3s→0.5s
- "HARD" badge on result screen

### 9.3 Adaptive Hints (Following AI Adaptive Difficulty Trend)

- 3 consecutive 4th place on City Circuit: "TIP: Brake while turning to drift!" tip display
- 2 consecutive races without boost use: "TIP: Fill gauge with drifts and boost with Space!" tip display
- Tips display as Canvas text for 2 seconds then fade out (alpha decay via tween)

---

## §10. Pure Function Design Principle

### 10.1 Rules
- **All game logic functions** receive necessary data as **parameters**
- Direct global variable/object reference forbidden (CONFIG constant object excepted: read-only)
- When changing function signatures, **full verification of all call sites** (§12.8)

### 10.2 Function Signature List

| Function Name | Parameters | Return |
|--------------|-----------|--------|
| `updateCarPhysics` | (car, input, dt, trackData) | void (modifies car directly) |
| `updateAI` | (aiCar, waypoints, dt, trackData, speedMult) | {steer, gas, brake, boost} |
| `checkTrackCollision` | (car, trackSegments, roadWidth) | {hit, normal, point} |
| `checkCheckpoint` | (car, checkpoints, currentCP) | nextCP index or -1 |
| `checkLapComplete` | (car, checkpoints, currentCP, totalCPs) | bool |
| `calculateScore` | (rank, fastestLap, driftCount, cleanLaps, boostCount) | number |
| `isOnOffroad` | (pos, trackSegments, roadWidth) | bool |
| `isOnSand` | (pos, sandZones) | bool |
| `checkMeteorCollision` | (car, meteors) | bool |
| `renderCar` | (ctx, car, color, isDrifting, glowEnabled) | void |
| `renderTrack` | (ctx, trackData, camera) | void |
| `renderMinimap` | (ctx, trackData, cars, camera) | void |
| `renderHUD` | (ctx, lap, totalLaps, time, rank, boostGauge, speed) | void |

---

## §11. Track Data Structure

### 11.1 Format

Tracks are defined as **centerline coordinate arrays** + **metadata**. Declared as in-code constants.

```javascript
const TRACKS = {
  city: {
    name: "City Circuit",
    roadWidth: 120,
    // Centerline coordinates (closed loop, 10~15 control points)
    centerLine: [
      {x: 400, y: 600}, {x: 600, y: 600}, {x: 750, y: 550},
      {x: 800, y: 400}, {x: 750, y: 250}, {x: 600, y: 200},
      {x: 400, y: 200}, {x: 250, y: 250}, {x: 200, y: 400},
      {x: 250, y: 550}  // -> connects to first point (closed loop)
    ],
    startPos: {x: 400, y: 620, angle: 0},
    checkpoints: [0, 3, 6],  // centerLine indices
    laps: 3,
    obstacles: [
      {type: 'barricade', seg: 2, offset: 30, width: 40},
      {type: 'barricade', seg: 7, offset: -25, width: 40}
    ],
    aiWaypoints: [ /* 20~30 coordinates - denser than track centerline */ ],
    aiSpeedMult: 0.78,
    bgColor: '#0a0a0a',
    roadColor: '#2a2a2a',
    borderColor: '#00ffff'
  },
  canyon: {
    name: "Canyon Run",
    roadWidth: 90,
    centerLine: [ /* 12~15 control points */ ],
    startPos: {x: 300, y: 650, angle: -0.3},
    checkpoints: [0, 4, 8],
    laps: 3,
    obstacles: [
      {type: 'sand', seg: 3, length: 80},
      {type: 'sand', seg: 7, length: 60},
      {type: 'sand', seg: 11, length: 70}
    ],
    aiSpeedMult: 0.85,
    bgColor: '#221100',
    roadColor: '#554433',
    borderColor: '#ff8800'
  },
  star: {
    name: "Star Ring",
    roadWidth: 70,
    centerLine: [ /* 15~18 control points */ ],
    startPos: {x: 500, y: 700, angle: -0.5},
    checkpoints: [0, 5, 10],
    laps: 3,
    obstacles: [
      {type: 'meteor', x: 600, y: 300, moveRange: 120, speed: 80},
      {type: 'meteor', x: 350, y: 450, moveRange: 100, speed: 60},
      {type: 'meteor', x: 700, y: 500, moveRange: 90, speed: 70},
      {type: 'meteor', x: 250, y: 250, moveRange: 110, speed: 65}
    ],
    boostPads: [
      {seg: 4, offset: 0},
      {seg: 9, offset: 0},
      {seg: 14, offset: 0}
    ],
    aiSpeedMult: 0.92,
    bgColor: '#000000',
    roadColor: '#222244',
    borderColor: '#ff00ff'
  }
};
```

### 11.2 Track Rendering Principle

1. Generate smooth curves from centerLine coordinate array via **Catmull-Rom interpolation**
2. Calculate **normal vectors** at each curve point → Generate road boundaries at ±roadWidth/2 offset
3. Road: `ctx.fillStyle = roadColor` + polygon `ctx.fill()`
4. Border: `ctx.strokeStyle = borderColor` + `ctx.shadowBlur = 10` (neon glow)
5. Viewport culling: Skip rendering segments outside camera view

---

## §12. Implementation Guidelines & Verification Checklist

### 12.1 assets/ Directory Absolutely Forbidden (11-cycle Lesson)

**Rules:**
- `assets/` directory creation forbidden
- 0 external image files (SVG, PNG, JPG, etc.)
- External CDN loading like Google Fonts forbidden
- All visuals implemented via Canvas API (`fillRect`, `arc`, `lineTo`, `fillText`, `strokeStyle`, `shadowBlur`)
- All sounds via Web Audio API `OscillatorNode`/`GainNode` code synthesis

**Forbidden pattern list:**
- `new Image()`, `<img>`, `background-image: url()`
- `ASSET_MAP`, `SPRITES`, `preloadAssets`
- `feGaussianBlur`, `<filter>`, all SVG files
- `@import url()`, `link rel="stylesheet" href="externalURL"`

### 12.2 pre-commit Hook Actually Registered

```bash
#!/bin/sh
# .git/hooks/pre-commit - assets/ directory block
if find public/games/*/assets -type f 2>/dev/null | head -1 | grep -q .; then
  echo "BLOCKED: Files exist in assets/ directory. Only Canvas code drawing allowed."
  exit 1
fi
```

**Key:** Not just writing it in the spec but actually registering in `.git/hooks/pre-commit` **and running `chmod +x`** must be verified (Cycle 8 lesson).

### 12.3 Ghost Variable Prevention Checklist

Verify all declared variables are used as intended by the spec:
- [ ] `isDrifting` — Set in updateCarPhysics, used in render for afterimage display
- [ ] `boostGauge` — Charged during drift, consumed during boost, displayed on HUD
- [ ] `stunTimer` — Set on wall collision, decremented each frame, input allowed when ≤0
- [ ] `currentCheckpoint` — Incremented on checkpoint pass, used for lap detection
- [ ] `lapTimes[]` — Recorded on lap complete, displayed on result screen
- [ ] `driftCount` — +1 on drift end, used in result screen score calculation
- [ ] `boostCount` — +1 on boost activation, used in result screen score calculation
- [ ] `wallHitCount` — +1 on wall collision, used for clean lap detection
- [ ] `wrongWayTimer` — Incremented during wrong-way, triggers reset after 3 seconds

### 12.4 TweenManager Safety Rules

- Use `clearImmediate()` instead of `cancelAll()` (immediate cleanup)
- Flush immediately after `clearImmediate()`: `_pendingCancel = false` + `_tweens.length = 0`
- Update path for a single value uses **only one of** tween or direct assignment

### 12.5 Spec-Implementation Numerical Consistency Verification Table

| Spec Item | CONFIG Key | Spec Value | Impl Value | Match |
|-----------|-----------|------------|------------|-------|
| §6.1 Max speed | MAX_SPEED | 300 | — | [ ] |
| §6.1 Acceleration | ACCELERATION | 180 | — | [ ] |
| §6.1 Brake deceleration | BRAKE_FORCE | 250 | — | [ ] |
| §6.1 Drift threshold | DRIFT_THRESHOLD | 0.7 | — | [ ] |
| §6.1 Drift charge | DRIFT_CHARGE_RATE | 25 | — | [ ] |
| §6.1 Boost minimum | BOOST_MIN_USE | 50 | — | [ ] |
| §6.1 Boost speed | BOOST_SPEED_MULT | 1.6 | — | [ ] |
| §6.1 Wall collision speed | WALL_SPEED_MULT | 0.3 | — | [ ] |
| §6.1 Wall stun | WALL_STUN | 0.3 | — | [ ] |
| §8.2 AI City speed | AI_SPEED_EASY | 0.78 | — | [ ] |
| §8.2 AI Canyon speed | AI_SPEED_MED | 0.85 | — | [ ] |
| §8.2 AI Star Ring speed | AI_SPEED_HARD | 0.92 | — | [ ] |
| §8.2 Hard mode multiplier | AI_HARD_MODE_MULT | 1.20 | — | [ ] |
| §9.1 City road width | city.roadWidth | 120 | — | [ ] |
| §9.1 Canyon road width | canyon.roadWidth | 90 | — | [ ] |
| §9.1 Star Ring road width | star.roadWidth | 70 | — | [ ] |

### 12.6 Variable Naming Rules

| Prefix/Suffix | Usage | Example |
|--------------|-------|---------|
| `_` prefix | Internal state flag | `_transitioning`, `_pendingCancel` |
| `Timer` suffix | Time counter (seconds) | `stunTimer`, `countdownTimer` |
| `Count` suffix | Frequency counter | `driftCount`, `boostCount` |
| `is` prefix | Boolean | `isDrifting`, `isBoosting` |
| `current` prefix | Current tracking index/value | `currentCheckpoint`, `currentLap` |
| `best` prefix | Best record | `bestLap`, `bestScore` |

### 12.7 TDZ Prevention

- All `let`/`const` variables declared **above first reference/call**
- Initialization order: CONFIG → Utility functions → Classes (TweenManager etc.) → Game state variables → Event listeners → Game loop start

### 12.8 Function Signature Change Propagation Rules

When changing function signatures:
1. Search **all locations** calling that function (Ctrl+F)
2. Update argument order/types at each call site
3. If downstream functions use the changed parameter, propagate downstream
4. Manual full-path test after changes

### 12.9 Game Loop Safety Mechanism

```javascript
function gameLoop(now) {
  try {
    const dt = Math.min((now - lastTime) / 1000, 0.05); // 50ms cap
    lastTime = now;
    update(dt);
    render(ctx, dt);
  } catch (e) {
    console.error('[GameLoop Error]', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 12.10 Common Infrastructure Interfaces (Copy-based, Not Separated)

Common patterns used in this game (maintaining same interface as previous cycles):
- **TweenManager**: `add({from, to, duration, onUpdate, onComplete})`, `clearImmediate()`, `update(dt)`
- **ObjectPool**: `get()`, `release(obj)`, `forEach(fn)` — Particle management (max 100)
- **TransitionGuard**: `beginTransition(target, opts)` — Built-in guard flag
- **SoundManager**: Web Audio API based code synthesis. `play(soundId)`, `setVolume(v)`
- **createGameLoop**: Built-in try-catch + dt cap + RAF

---

## §13. Sound Design (Web Audio API Code Synthesis)

| Sound Effect ID | Trigger | Synthesis Method |
|----------------|---------|-----------------|
| `engine` | Continuous while accelerating | Low-frequency sine wave (80Hz) + speed-proportional pitch modulation |
| `drift` | Continuous while drifting | White noise + bandpass filter (800Hz) |
| `boost` | Boost activation | Pitch-rising sine wave (200→600Hz, 0.3s) |
| `wallHit` | Wall collision | Short noise burst (0.1s) + low-frequency pulse |
| `checkpoint` | Checkpoint pass | High sine wave 2-note (C5→E5, 0.1s each) |
| `lapComplete` | Lap complete | Rising arpeggio (C5→E5→G5, 0.3s) |
| `countdown` | Countdown number | Single sine wave beep (440Hz, 0.15s) |
| `raceStart` | GO! display | High beep (880Hz, 0.3s) |
| `result` | Result screen entry | Rank-specific melody (1st: victory fanfare, 4th: descending disappointment) |

---

## §14. UI Layout

### 14.1 In-game HUD

```
+----------------------------------------------+
| LAP 2/3          00:42.35           RANK: 2  |  <- Top bar
|                                  +--------+  |
|                                  | MINIMAP|  |  <- Top-right minimap (150x150)
|                                  +--------+  |
|           [Game View - Top-down Racing]       |
|                                              |
| +----------------------+                     |
| | SPD: 245 km/h        |                     |  <- Bottom-left speedometer
| | BOOST ########.. 78% |                     |  <- Boost gauge bar
| +----------------------+                     |
|                          [Touch Control Area] |  <- Mobile only
+----------------------------------------------+
```

### 14.2 Title Screen

```
+----------------------------------------------+
|                                              |
|           NEON DRIFT RACER                   |  <- Neon glow title
|                                              |
|              > START RACE                    |
|              > OPTIONS                       |  <- Canvas text menu
|                                              |
|         Best: City 01:42.35                  |  <- Best record display
|                                              |
|        [TAP TO START] (mobile)               |
+----------------------------------------------+
```

### 14.3 Track Selection Screen

```
+----------------------------------------------+
|            SELECT TRACK                      |
|                                              |
|   +------+    +------+    +------+          |
|   | CITY |    |CANYON|    | STAR |          |
|   |      |    |      |    | LOCK |          |  <- Locked tracks show padlock
|   |Best: |    |Best: |    |      |          |
|   |1:42  |    | --   |    |      |          |
|   +------+    +------+    +------+          |
|                                              |
|   <-> Select    Enter/Tap Confirm    Esc Back |
+----------------------------------------------+
```

### 14.4 Result Screen (Canvas Modal — confirm/alert Forbidden)

```
+----------------------------------------------+
|           +---------------------+            |
|           |   RACE RESULT       |            |
|           |                     |            |
|           |  RANK: #1           |            |
|           |  Time: 02:15.42     |            |
|           |  Best Lap: 00:41.23 |            |
|           |  Score: 1580        |            |
|           |  NEW RECORD!        |            |
|           |                     |            |
|           |  [RETRY]  [MENU]   |            |  <- Canvas buttons
|           +---------------------+            |
+----------------------------------------------+
```

---

## §15. Camera System

Camera system from Cycle 11 mini-platformer adapted for racing:

- **Tracking target**: Player vehicle
- **lerp interpolation**: `camera.x += (target.x - camera.x) * CAM_LERP` (smooth tracking)
- **Look-ahead**: `CAM_LOOKAHEAD` (80px) ahead in vehicle movement direction. Secures forward visibility
- **Screen shake**: 6px on wall collision / 3px during boost (decaying)
- **Zoom**: Default 1.0 (speed-proportional zoom out 0.9~1.0 considered for v1.1)
- **Render coordinate transform**: `ctx.translate(-camera.x + canvas.width/2, -camera.y + canvas.height/2)`

---

## §16. Implementation Scope & Priority

### P0 — Must Implement (Core)
- [ ] Vehicle physics (acceleration/deceleration/steering/friction)
- [ ] Drift mechanics + boost system
- [ ] 3 tracks (centerline data + rendering)
- [ ] Wall collision detection + response
- [ ] Checkpoint/lap detection
- [ ] 3 AI vehicles (waypoint tracking)
- [ ] State machine (TITLE→TRACK_SELECT→COUNTDOWN→RACE→RESULT)
- [ ] HUD (lap, time, rank, speed, boost gauge)
- [ ] Minimap
- [ ] Result screen + score calculation
- [ ] localStorage record save/load
- [ ] Track unlock system
- [ ] Mobile touch controls
- [ ] beginTransition() unified transitions

### P1 — Recommended (Immersion)
- [ ] Drift afterimage + tire marks
- [ ] Boost particle effects
- [ ] Wall collision sparks
- [ ] Countdown animation (3-2-1-GO!)
- [ ] Sound effects (Web Audio API)
- [ ] Camera shake
- [ ] Adaptive hints

### P2 — Optional (Extension)
- [ ] Hard mode
- [ ] AI rubber banding
- [ ] Track-specific unique obstacles (barricades/sand/meteors)
- [ ] NEW RECORD effect
- [ ] Wrong-way detection + reset

### Out of Scope (Not Implemented This Cycle)
- Multiplayer
- Vehicle customization
- Track editor
- Daily challenge
- Common engine module separation (separate task)
