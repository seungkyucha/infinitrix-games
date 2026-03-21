---
game-id: mini-survivor-arena
title: Mini Survivor Arena
genre: action, arcade
difficulty: medium
---

# Mini Survivor Arena — Detailed Game Design Document (Cycle 7)

---

## §0. Previous Cycle Feedback Integration Mapping

| # | Source | Issue/Suggestion | Response in This Design |
|---|--------|-----------------|------------------------|
| 1 | Cycle 6 post-mortem | Shared engine module separation suggestion | §12 reuses TweenManager, ObjectPool, TransitionGuard, listen()/destroy(), Web Audio SFX as shared patterns. Modular class structure within single HTML |
| 2 | Cycle 6 post-mortem | Asynchronous competitive system suggestion | §7 designs "Today's Seed" daily challenge system. localStorage-based seed → identical enemy spawns/skill pool |
| 3 | Cycle 6 post-mortem | Simulation/management genre suggestion | Action genre gap takes priority this time. Survivor's "skill build selection" includes management-like decision-making |
| 4 | Cycle 6 shortcomings | speed() global dependency | §10 designs all game logic functions as **pure function pattern**. Direct global state reference banned |
| 5 | Cycle 6 shortcomings | Physics skip during Space acceleration | Not applicable as this game isn't physics-based. Instead §5 applies fixed timestep (16.67ms) |
| 6 | Cycle 6 shortcomings | Lack of level editor | §6 designs wave data as declarative config object-based structure. Minimized hardcoding |
| 7 | Cycle 6 shortcomings | assets/ remnant recurrence | §13 specifies assets/ directory non-creation principle + auto-verification checklist. 100% Canvas code drawing |
| 8 | platform-wisdom | setTimeout ban | §5 game loop: all delayed transitions via tween onComplete only |
| 9 | platform-wisdom | State × system matrix | §5.3 includes full matrix |
| 10 | platform-wisdom | cancelAll/add race condition | clearImmediate() API used. §12 TweenManager specification |
| 11 | platform-wisdom | Guard flag required | §5.2 `isTransitioning` guard for wave clear/level up transitions |
| 12 | platform-wisdom | Ghost variable prevention | §13.4 code review checklist includes "verify usage of all declared variables" |
| 13 | Analysis report | Hard difficulty absent | §6.3 adds Hard mode option (enemy HP ×1.5, 2 skill choices only) |
| 14 | Analysis report | Only 1 action genre game | action + arcade combo fills genre gap |

---

## §1. Game Overview & Core Fun Elements

### Concept
A top-down survivor game where you **survive by movement alone** amid monster hordes rushing from all 360 degrees. Attacks fire automatically, and on level up you choose 1 of 3 skills to complete your build. **Survive 20 waves (approximately 5~8 minutes)** to clear.

### 3 Core Fun Elements
1. **Build crafting**: Choose 1 of 3 skills per level up → different build every game → infinite replays
2. **Growth satisfaction**: Start with a single weak shot → end with screen full of projectiles + explosions → "look how strong I've become" fantasy
3. **Crisis escape**: The tension of finding gaps through enemies closing in from all sides

### References
- **Vampire Survivors**: Auto-attack + level-up skill selection + wave survival
- **Survivor.io**: Mobile touch joystick + concise skill UI

---

## §2. Game Rules & Objectives

### Victory Condition
- Survive all 20 waves for **VICTORY** (bonus score +5000)

### Defeat Condition
- Player HP drops to 0 or below → **GAMEOVER**

### Basic Rules
1. Player moves freely within the arena (1600×1600 world area). Canvas shows 800×800 viewport centered on player (§2.1 camera)
2. Enemies spawn from outside viewport edges and track the player
3. Weapons **auto-fire** — player focuses only on movement
4. Enemy kills drop **XP Gems**
5. When XP reaches level-up threshold, **level-up skill selection** UI appears
6. 3-second rest between waves (WAVE_PREP state)
7. **Boss** appears every 5 waves
8. **0.5s invincibility frame (iFrame)** on contact damage — prevents per-frame damage

### §2.1 Camera/Viewport System
- **World size**: 1600×1600px (logical coordinates)
- **Viewport size**: 800×800px (canvas display area)
- **Camera**: Player-center tracking. Lerp for smooth tracking:
  ```
  camera.x += (player.x - camera.x - viewW/2) * 0.1;
  camera.y += (player.y - camera.y - viewH/2) * 0.1;
  camera.x = clamp(camera.x, 0, worldW - viewW);
  camera.y = clamp(camera.y, 0, worldH - viewH);
  ```
- **Render offset**: All world objects use `drawX = obj.x - camera.x`
- **World boundary**: Player movement clamped at world edges
- **Minimap** (optional): 100×100px area in bottom-right showing player + boss positions

---

## §3. Controls

### Keyboard
| Key | Action |
|-----|--------|
| `W` / `↑` | Move up |
| `A` / `←` | Move left |
| `S` / `↓` | Move down |
| `D` / `→` | Move right |
| `1`, `2`, `3` | Skill selection on level up (left/center/right) |
| `P` / `Escape` | Pause |
| `Enter` / `Space` | Start game from title / Restart from GAMEOVER |

### Mouse
| Action | Description |
|--------|-------------|
| Click | Title start, GAMEOVER restart, level-up skill card click |

### Touch (Mobile)
| Action | Description |
|--------|-------------|
| **Virtual joystick** | Touch bottom-left 1/3 of screen → drag direction to move |
| Touch | Skill card tap, start/restart tap |

> **Input mode branching**: First input event type (keydown vs touchstart) determines `inputMode`. Displays UI hints matching the active mode.

---

## §4. Visual Style Guide

### Color Palette

| Usage | HEX | Description |
|-------|-----|-------------|
| Background | `#0A0A1A` | Dark navy (space/dungeon feel) |
| Arena floor | `#12122A` | Slightly brighter navy than background |
| Grid lines | `#1A1A3A` | Subtle grid pattern |
| Player | `#00FFAA` | Bright mint/cyan |
| Player glow | `#00FFAA40` | Semi-transparent outer glow |
| Enemy (normal) | `#FF4444` | Red |
| Enemy (fast) | `#FFAA00` | Orange |
| Enemy (tanker) | `#8844FF` | Purple |
| Enemy (ranged) | `#FF44AA` | Pink |
| Boss | `#FF0044` | Deep red + 2× size |
| XP Gem | `#44FF44` | Green glowing diamond |
| Projectile | `#FFFF44` | Yellow |
| HP bar (background) | `#333333` | Dark gray |
| HP bar (fill) | `#00FF66` → `#FF3333` | Gradient based on remaining HP |
| XP bar | `#6644FF` | Purple |
| Skill card background | `#1A1A3A` | Dark card |
| Skill card border | `#4488FF` | Blue highlight |
| Skill card hover | `#6699FF` | Bright blue |
| UI text | `#FFFFFF` | White |
| Secondary text | `#888899` | Gray |
| Damage text | `#FF4444` | Red floating |
| Heal text | `#44FF44` | Green floating |

### Background
- World area (1600×1600): Grid lines at 32px intervals (`#1A1A3A`) on `#12122A`
- **Offscreen canvas caches grid tile** (256×256 tile repeated as pattern via drawImage, Cycle 5 verified pattern)
- World boundary: 2px `#2A2A4A` border
- Grid outside viewport not rendered (camera offset-based culling)

### Object Shapes (100% Canvas Code Drawing)

| Object | Shape | Size (logical px) |
|--------|-------|------------------|
| Player | Circle + internal triangle (direction) + outer glow | Radius 12px |
| Normal enemy | Circle + 2 eyes (white dots) | Radius 10px |
| Fast enemy | Pointed triangle | Height 16px |
| Tanker enemy | Square + thick border | 20×20px |
| Ranged enemy | Diamond + center dot | 14×14px |
| Boss | Large circle + crown shape + HP bar | Radius 24px |
| Projectile | Small circle + trail | Radius 3px |
| XP Gem | Diamond + rotation animation | 6×6px |
| Damage number | Floating text (rises upward + fades out) | 14px font |

### Font
- System font stack: `'Segoe UI', system-ui, -apple-system, sans-serif`
- **External font loading banned** (Cycle 1 lesson)

---

## §5. Core Game Loop

### §5.1 Game State Machine

```
TITLE → PLAYING → WAVE_PREP → PLAYING → ... → VICTORY
                ↕                                  ↓
             LEVELUP                           GAMEOVER
                ↕                                  ↓
              PAUSE ←──────────────────────────── TITLE
```

**State List (7)**:
1. `TITLE` — Title screen
2. `PLAYING` — Game in progress
3. `WAVE_PREP` — Wave rest (3-second countdown)
4. `LEVELUP` — Skill selection UI (game paused)
5. `PAUSE` — Paused
6. `GAMEOVER` — Dead
7. `VICTORY` — 20 waves cleared

**State transitions must only occur through `enterState(newState)` function.**
**TransitionGuard pattern applied**: `STATE_PRIORITY` map for priority management.

```javascript
const STATE_PRIORITY = {
  TITLE: 0, PLAYING: 1, WAVE_PREP: 2,
  LEVELUP: 3, PAUSE: 4, GAMEOVER: 5, VICTORY: 6
};
```

GAMEOVER/VICTORY always highest priority — cannot be overwritten by other transitions.

### §5.3 State × System Update Matrix

| System | TITLE | PLAYING | WAVE_PREP | LEVELUP | PAUSE | GAMEOVER | VICTORY |
|--------|:-----:|:-------:|:---------:|:-------:|:-----:|:--------:|:-------:|
| tweenManager.update() | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Input handling | start only | ✅ | ❌ | cards only | resume only | restart only | restart only |
| Player movement | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Weapon fire | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Projectile movement | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Enemy movement/AI | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Enemy spawn | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Collision detection | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Particles | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| HUD render | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Overlay UI | Title | ❌ | Countdown | Skill cards | Pause | Result | Result |

---

## §6. Difficulty System

### §6.1 Wave Scaling (Config Object-Based)

```javascript
// Declarative wave config — minimized hardcoding (Cycle 6 feedback)
function getWaveConfig(wave) {
  return {
    enemyCount:    Math.min(40, 8 + wave * 2),          // 8 → 40
    spawnInterval: Math.max(300, 1500 - wave * 60),     // 1500ms → 300ms
    enemyHpMul:    1 + (wave - 1) * 0.1,                // ×1.0 → ×2.9
    enemySpeedMul: 1 + (wave - 1) * 0.03,               // ×1.0 → ×1.57
    fastRatio:     Math.min(0.4, wave * 0.02),           // 0% → 40%
    tankerRatio:   wave >= 5 ? Math.min(0.2, (wave - 4) * 0.02) : 0,
    rangedRatio:   wave >= 8 ? Math.min(0.15, (wave - 7) * 0.02) : 0,
    isBoss:        wave % 5 === 0
  };
}
```

### §6.2 Enemy Type Details

| Type | HP | Speed | Damage | XP | Special Behavior |
|------|-----|------|--------|-----|-----------------|
| Normal | 3 | 60px/s | 1 | 1 | Linear tracking |
| Fast | 2 | 110px/s | 1 | 2 | Linear tracking + acceleration |
| Tanker | 12 | 40px/s | 2 | 3 | Linear tracking + knockback resistance |
| Ranged | 4 | 50px/s | 1 (bullet) | 3 | Stops within 120px + fires bullet every 2s |
| Boss | 50 + wave×10 | 35px/s | 3 | 20 | 3-phase cycle (see below) |

**Generous hitbox**: Player visual radius 12px, hit detection radius 8px (Cycle 2 verified pattern)
**Invincibility frame (iFrame)**: 0.5s invincibility after hit + blink animation (tween alpha 0.3↔1.0). Enemy contact ignored while `player.iFrameTimer > 0`.

### §6.2.1 Boss 3-Phase AI (Inherited from Cycle 2 Boss Pattern)

Boss is a state machine on top of a state machine with phases transitioning by HP ratio:

| Phase | HP Condition | Behavior | Duration | Visual Effect |
|-------|-------------|----------|----------|--------------|
| **1: Charge** | 100%~60% | Linear charge at player (speed ×2.5), direction reset every 2s | 2s charge → 1s pause loop | 3 afterimage trails during charge |
| **2: Radial Burst** | 60%~30% | Stationary + fires 8-directional bullets every 1.5s (bullet speed 120px/s) | 1.5s interval | Red circular charge effect → burst |
| **3: Summon+Charge** | 30%~0% | Summons 4 normal enemies every 3s + Phase 1 charge (speed ×3.0) | Charge+summon parallel | Body blink + red aura |

- 0.5s invincibility + screen shake on phase transition (tween camera offset ±4px)
- **Pre-check**: `if (player.hp <= 0) return;` — GAMEOVER takes priority over boss phase transition (Cycle 3 lesson)
- Boss HP bar: Displayed separately at screen top (width 200px, height 8px)

### §6.3 Difficulty Modes (Selected on Title Screen)

| Mode | Enemy HP Multiplier | Skill Choices | XP Multiplier | Description |
|------|-------------------|---------------|--------------|-------------|
| Normal | ×1.0 | 3 | ×1.0 | Default |
| Hard | ×1.5 | 2 | ×0.8 | Analysis report: Fills hard difficulty absence |

---

## §7. Scoring System

### Base Scores

| Action | Score |
|--------|-------|
| Normal enemy kill | 10 |
| Fast enemy kill | 20 |
| Tanker kill | 30 |
| Ranged kill | 30 |
| Boss kill | 200 + wave × 20 |
| Wave clear | 100 × wave |
| Level up | 50 |
| VICTORY bonus | 5000 |

### Combo System
- Consecutive kills within 2 seconds increase combo counter
- Combo multiplier: `1.0 + combo × 0.1` (max ×3.0)
- No kill for 2 seconds → combo resets
- Combo counter shown in HUD top-right (highlighted at ≥5 combo)

### Daily Challenge System (Cycle 6 Post-mortem Suggestion #2)
- **Today's seed**: Daily fixed seed based on date string hash → identical enemy spawn pattern/skill pool
  ```javascript
  // Date string → integer seed conversion (djb2 hash)
  function dateSeed(dateStr) { // dateStr = "2026-03-20"
    let hash = 5381;
    for (let i = 0; i < dateStr.length; i++)
      hash = ((hash << 5) + hash + dateStr.charCodeAt(i)) & 0xFFFFFFFF;
    return hash >>> 0;
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyRng = seededRng(dateSeed(todayStr));
  ```
- localStorage stores `dailySeed`, `dailyBestScore`, `dailyDate`
- "Today's Challenge" button shown on title screen
- "NEW RECORD" shown when best score beaten on same day
- **Check first, save later** (Cycle 2 lesson): `isNewRecord = score > savedBest` → `save(score)`

### Best Record Storage
- localStorage `miniSurvivorBest` (try-catch wrapped, Cycle 1 pattern)
- `dailyChallenge_YYYYMMDD` — Daily challenge best score

---

## §8. Skill/Weapon System

### Base Weapon (Starting Equipment)
- **Energy Bolt**: Auto-fires toward nearest enemy. 1s interval, damage 1.

### Skill Pool (12 Types) — 3 Random Presented on Level Up

| # | Skill Name | Type | Description | Max Level | Level-Up Effect |
|---|-----------|------|-------------|----------|----------------|
| 1 | Multishot | Attack | +1 bolt per shot | 5 | Lv1: 2 shots → Lv5: 6 shots (fan spread) |
| 2 | Rapid Fire | Attack | Reduced fire interval | 5 | Lv1: 0.9s → Lv5: 0.5s |
| 3 | Piercing | Attack | +1 projectile penetration | 3 | Lv1: 1 pierce → Lv3: 3 pierce |
| 4 | Orbital | Attack | Orbiting spheres around player | 3 | Lv1: 2 orbs → Lv3: 4 orbs, radius 60px |
| 5 | Shockwave | Attack | Circular AoE burst every 5s | 3 | Lv1: radius 80 → Lv3: 160, damage 3→6 |
| 6 | Lightning | Attack | Hits 3 random enemies every 3s | 3 | Lv1: 3 targets → Lv3: 7 targets, damage 2→5 |
| 7 | Speed UP | Utility | +15% move speed | 3 | Lv1: +15% → Lv3: +45% |
| 8 | Magnet | Utility | +50px XP gem pickup radius | 3 | Lv1: +50 → Lv3: +150 (base 40px) |
| 9 | Defense UP | Defense | -1 received damage (min 1) | 2 | Lv1: -1 → Lv2: -2 |
| 10 | HP Regen | Defense | Heal 1 HP every 10s | 3 | Lv1: 10s → Lv3: 5s |
| 11 | Knockback | Utility | Push enemies on projectile hit | 2 | Lv1: 30px → Lv2: 60px |
| 12 | Critical | Attack | 15% chance ×2 damage | 3 | Lv1: 15% → Lv3: 30% |

### Skill Selection Rules
1. Already owned skills below max level presented as "Level Up" options
2. Unowned skills presented as "New Acquisition" options
3. Skills at max level excluded from pool
4. If fewer than 3 available, show as many as remain
5. **Seeded random**: Daily challenge mode fixes choices via seed

### Level-Up XP Table

| Player Level | Required XP | Cumulative XP |
|-------------|------------|--------------|
| 1→2 | 5 | 5 |
| 2→3 | 8 | 13 |
| 3→4 | 12 | 25 |
| 4→5 | 17 | 42 |
| N→N+1 | `floor(5 + (N-1) * 1.5 + (N-1)^1.3)` | — |

---

## §10. Pure Function Design Principle (Cycle 6 Feedback)

**All game logic functions are written as pure functions that receive data via parameters.**

```javascript
// ✅ Correct pattern: Data passed via parameters
function updatePlayer(player, input, dt, bounds) {
  const speed = player.baseSpeed * (1 + player.speedBonus);
  player.x += input.dx * speed * dt;
  player.y += input.dy * speed * dt;
  player.x = clamp(player.x, bounds.left + player.r, bounds.right - player.r);
  player.y = clamp(player.y, bounds.top + player.r, bounds.bottom - player.r);
}

// ❌ Banned pattern: Direct global reference
function updatePlayer() {
  player.x += input.dx * player.speed * deltaTime; // References 3 globals
}
```

### Pure Function Target List
| Function | Parameters | Return/Side Effect |
|----------|-----------|-------------------|
| `updatePlayer(player, input, dt, bounds)` | Player, input, time, bounds | Update player coordinates |
| `updateEnemies(enemies, target, dt)` | Enemy array, tracking target, time | Update enemy coordinates |
| `updateProjectiles(projectiles, dt, bounds)` | Projectile array, time, bounds | Move projectiles + mark OOB |
| `checkCircleCollision(a, b)` | {x,y,r}, {x,y,r} | boolean |
| `calcDamage(baseDmg, critChance, critMul)` | 3 values | {damage, isCrit} |
| `calcXpNeeded(level)` | Level | Required XP |
| `getWaveConfig(wave)` | Wave number | Config object |
| `pickSkillChoices(pool, owned, count, rng)` | Pool, owned list, count, RNG | Array of 3 skills |
| `updateCamera(camera, target, viewW, viewH, worldW, worldH, smoothing)` | Camera, target, viewport/world size, lerp value | Update camera coordinates |
| `worldToScreen(objX, objY, camera)` | World coordinates, camera | {sx, sy} screen coordinates |
| `isInViewport(objX, objY, camera, viewW, viewH, margin)` | Coordinates, camera, margin | boolean (render/culling check) |
| `spawnPosAroundViewport(playerX, playerY, camera, viewW, viewH, margin, rng)` | Player, camera, margin, RNG | {x, y} spawn coordinates |

---

## §11. Audio System (Web Audio API Procedural Sound)

**Zero external asset principle maintained.** Sound effects generated via OscillatorNode + GainNode.

| Event | Sound | Waveform | Frequency | Duration |
|-------|-------|---------|-----------|----------|
| Projectile fire | Tick | square | 880Hz→440Hz | 50ms |
| Enemy hit | Thwack | sawtooth | 220Hz→110Hz | 80ms |
| Enemy death | Pop | square+triangle | 440Hz→880Hz | 120ms |
| XP gem collected | Ding | sine | 660Hz→880Hz | 100ms |
| Level up | Fanfare | sine chord | C-E-G arpeggio | 400ms |
| Boss appears | Boom | sawtooth | 80Hz→40Hz | 300ms |
| Player hit | Buzz | square | 200Hz→100Hz | 150ms |
| GAMEOVER | Descending | sine | 440Hz→110Hz | 500ms |
| VICTORY | Rising chord | sine | C-E-G-C5 | 600ms |

```javascript
// AudioContext initialization: resume() on user's first interaction
// try-catch wrapping for safe handling in unsupported environments (Cycle 3 pattern)
```

---

## §14. Sidebar & Card Metadata

### Game Page Sidebar

```yaml
game:
  title: "Mini Survivor Arena"
  description: "Survive 360-degree monster waves with auto-attacks and skill builds in this top-down survivor!"
  genre: ["action", "arcade"]
  playCount: 0
  rating: 0
  controls:
    - "WASD / Arrow Keys: Move"
    - "1/2/3: Level-up skill selection"
    - "P / ESC: Pause"
    - "Touch: Virtual joystick movement"
  tags:
    - "#survivor"
    - "#autoattack"
    - "#skillbuild"
    - "#wavesurvival"
    - "#vampiresurvivorslike"
    - "#roguelite"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

---

## §15. Technical Architecture Summary

```
/games/mini-survivor-arena/
  └── index.html          ← Single file, zero external dependencies
```

- **Rendering**: Canvas 2D API, DPR support
- **Game loop**: requestAnimationFrame + fixed timestep (16.67ms cap 50ms)
- **State management**: Finite state machine (7 states) + TransitionGuard
- **World/Camera**: 1600×1600 world + 800×800 viewport + lerp camera tracking
- **Object management**: ObjectPool (enemies 150, projectiles 200, XP gems 200, particles 300)
- **Animation**: TweenManager (clearImmediate API included)
- **Audio**: Web Audio API procedural sound (try-catch)
- **Storage**: localStorage (try-catch, iframe-safe)
- **Input**: Keyboard + mouse + touch virtual joystick, inputMode branching
- **Random**: Normal mode Math.random(), challenge mode seededRng()
- **Function design**: Pure function pattern (§10), direct global reference banned

---

_Design complete: 2026-03-20_
_Next steps: Implementation → Auto verification → Code review → Deployment_
