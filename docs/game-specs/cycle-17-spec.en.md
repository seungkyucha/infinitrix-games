---
game-id: arcane-bastion
title: Arcane Bastion
genre: action, strategy
difficulty: hard
---

# Arcane Bastion — Detailed Game Design Document

_Cycle #17 | Date: 2026-03-22_

---

## §0. Previous Cycle Feedback Resolution Map

> Pre-emptive mapping of Cycle 16 post-mortem "areas for improvement" + accumulated platform-wisdom lessons (F1–F23, 16 cycles).

| # | Source | Issue | Resolution in This Spec | Section |
|---|--------|-------|------------------------|---------|
| F1 | Cycle 1–16 (16 consecutive) | assets/ directory recurring | **Start from blank index.html.** No assets/ directory creation. 100% Canvas code drawing + thumbnail.svg only | §8, §13.6 |
| F2 | Cycle 1–16 | setTimeout-based state transitions | tween onComplete callbacks only. Target: **0 setTimeout calls** | §5, §13.5 |
| F3 | Cycle 6–16 | Pure function pattern required | All game logic functions receive data via parameters. 0 global direct references. Full signatures in §10 | §10 |
| F4 | Cycle 2 | Missing state×system matrix | Full state×system matrix in §6 (5 states × 6 systems) | §6 |
| F5 | Cycle 3/4 | Missing guard flags → repeated callbacks | `waveClearing`, `isTransitioning`, `isBossActive` triple-guard system | §5.4, §6.2 |
| F6 | Cycle 4 | TweenManager cancelAll+add race condition | Separate `clearImmediate()` API. Flush after cancelAll: `_pendingCancel=false` + `_tweens.length=0` | §10.1 |
| F7 | Cycle 7/16 | Spec values ↔ code values mismatch | §13 mandatory value consistency verification table. Full cross-check of wave enemies/HP/rewards | §13 |
| F8 | Cycle 1 | iframe confirm/alert unavailable | Canvas-based modal UI only. 0 uses of window.open/alert/confirm/prompt | §4, §8 |
| F9 | Cycle 3–4 | SVG filter recurrence (feGaussianBlur) | Complete ban on filter tags in inline SVG. Only gradient/pattern allowed. Canvas glow via shadowBlur | §8.2 |
| F10 | Cycle 15–16 | offscreen canvas background caching | `buildBgCache()` pattern — rebuild only on resizeCanvas(). 3 biome backgrounds cached | §8.3 |
| F11 | Cycle 11 | let/const TDZ crash | Strict order: variable declaration → DOM assignment → event registration → init(). §13.1 initialization checklist | §13.1 |
| F12 | Cycle 10/11 | gameLoop try-catch not applied | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` as default | §5.3, §13.4 |
| F13 | Cycle 13–16 | index.html missing | Pre-review smoke test: (1) index.html exists (2) page loads (3) 0 console errors | §13.7 |
| F14 | Cycle 10 | Fix regression (render signature change) | Full-flow regression test after any fix (TITLE→PLAY→UPGRADE→BOSS→GAMEOVER) | §13.8 |
| F15 | Cycle 3/7 | Ghost variables (declared but unused) | §13.2 variable usage verification table | §13.2 |
| F16 | Cycle 5 | Dual update paths for single value | HP/mana/score modified only via single functions (`modifyHP()`, `modifyMana()`, `addScore()`) | §7.1 |
| F17 | Cycle 3 | State transition priority system | GAMEOVER > BOSS > UPGRADE_SELECT > PAUSED > PLAYING. STATE_PRIORITY map | §6.2 |
| F18 | Cycle 15–16 | Scope reduction strategy | Limited to 5 states, 3 core mechanics (direct combat + tower placement + roguelike upgrades). No "later" | §1 |
| F19 | Cycle 15 | "Half-implemented" pattern | Feature-level sub-item checklist (§13.3) — verify A+B+C individually | §13.3 |
| F20 | Cycle 13 | CONFIG.MIN_TOUCH declaration-implementation gap | All buttons/UI enforce 48px minimum via `touchSafe()` utility | §4, §12.3 |
| F21 | Cycle 16 issue | Mouse hard-drop unsupported | Keyboard/mouse/touch all support **full functionality**. Per-device mapping table in §3 | §3 |
| F22 | Cycle 16 issue | NEXT preview unimplemented | All UI specified in spec **100% implemented**. No "optional" features | §4 |
| F23 | Cycle 5/8 | Direct transition bypassing beginTransition() | All screen transitions must go through `beginTransition()`. Only PAUSED exempt (immediate: `beginTransition(target, {immediate:true})`) | §6.2 |
| F24 | Cycle 12 | Touch target < 44×44px | All interactive UI minimum 48×48px. CONFIG.MIN_TOUCH_TARGET = 48 | §4, §12.3 |

---

## §1. Game Overview & Core Fun Factors

### Concept
A **Roguelike Forge Defense** where a wizard defends a central Bastion (fortress) by **directly casting spells** to eliminate enemies from all directions, **placing magic towers** for automated defense, and **choosing 1-of-3 roguelike upgrades** between waves.

### Core Fun Factors
1. **Dual Combat Tension**: Wizard fires spells directly + towers auto-attack. The constant decision: "Where do I focus, and where do I leave to towers?"
2. **Roguelike Growth Satisfaction**: Pick 1 of 3 upgrades after each wave. Different builds every run → infinite replayability
3. **Resource Dilemma**: Spend mana on spells or tower construction? Attack vs. investment — a constant choice
4. **Boss Spectacles**: Bosses at waves 5/10/15 — unique patterns + screen shake + slow-motion effects
5. **Gradual Overwhelm**: Wave 1 (5 slimes) → Wave 15 (Dragon boss + elite mix). Comfortable at first, then increasingly intense
6. **5–10 Min Sessions**: Beginners 3 min (5 waves), skilled 10 min (15-wave clear). Instant retry

### Genre Balance Contribution
- Current platform: action 21.1% (lowest), strategy 26.3% (second lowest)
- This game: **action + strategy** → simultaneously reinforces the two most underrepresented genres
- Differentiation from mini-tower-defense: direct combat + roguelike upgrades + boss fights

### Cycle 16 Post-mortem Integration
- **Scope reduction maintained**: 5 states, 3 core mechanics only
- **Full mouse support**: All input devices have identical functionality (Cycle 16 hard-drop lesson)
- **100% spec UI implementation**: Every UI element mentioned in spec must be built. No "later"
- **Offscreen canvas caching**: Applied from the start

---

## §2. Game Rules & Objectives

### 2.1 Basic Rules
1. A **Bastion (fortress)** sits at screen center (HP 100)
2. Enemies spawn from 4 screen edges (top/bottom/left/right) and move toward the Bastion
3. The player (wizard) moves freely around the Bastion, casting spells
4. **Mana** is consumed to place magic towers (max 8)
5. Game over when Bastion HP reaches 0
6. Victory upon clearing 15 waves

### 2.2 Wave System
| Wave | Enemy Types | Count | Boss | Biome |
|------|-------------|-------|------|-------|
| 1 | Slime | 5 | - | Forest |
| 2 | Slime | 8 | - | Forest |
| 3 | Slime+Skeleton | 10 | - | Forest |
| 4 | Skeleton+Spider | 12 | - | Forest |
| 5 | Slime+Skeleton+Spider | 15 | 🔴 Golem Boss | Forest |
| 6 | Wraith+Spider | 14 | - | Cave |
| 7 | Wraith+Golem | 16 | - | Cave |
| 8 | Skeleton+Wraith+Golem | 18 | - | Cave |
| 9 | All types mixed | 20 | - | Cave |
| 10 | All types+Elite | 22 | 🔴 Wraith King Boss | Cave |
| 11 | All+Elite×2 | 20 | - | Volcano |
| 12 | All+Elite×3 | 22 | - | Volcano |
| 13 | Elite focus | 18 | - | Volcano |
| 14 | All+Elite×4 | 25 | - | Volcano |
| 15 | All Elite | 20 | 🔴 Ancient Dragon Boss | Volcano |

### 2.3 Enemy Types (7 + 3 Bosses)
| Enemy | HP | Speed | Attack | Special Ability | Color |
|-------|----|-------|--------|-----------------|-------|
| Slime | 20 | 1.0 | 5 | None | #44ff44 (green) |
| Skeleton | 35 | 1.5 | 8 | Fast movement | #dddddd (white) |
| Spider | 25 | 2.0 | 6 | Fastest, swarm | #884488 (purple) |
| Golem | 80 | 0.5 | 15 | High HP, slow | #aa7744 (brown) |
| Wraith | 40 | 1.2 | 10 | Chance to phase (ignore hit) | #6666ff (blue) |
| Dark Knight | 60 | 1.0 | 12 | Defense up when close | #333333 (black) |
| Dragonkin | 50 | 0.8 | 10 | Ranged fire attack | #ff4444 (red) |
| **[Boss] Golem King** | 300 | 0.3 | 20 | Ground shockwave (AoE) | #cc8833 |
| **[Boss] Wraith King** | 250 | 0.8 | 25 | Summon (2 wraiths) + teleport | #4444ff |
| **[Boss] Ancient Dragon** | 500 | 0.4 | 30 | Fire breath (60° cone) + flight | #ff2222 |

### 2.4 Magic Towers (5 Types)
| Tower | Mana Cost | Range | Damage | Attack Speed | Special |
|-------|-----------|-------|--------|-------------|---------|
| Arcane Tower | 30 | 120 | 10 | 1.0s | Basic single target |
| Flame Tower | 50 | 100 | 15 | 1.5s | AoE (radius 40) |
| Frost Tower | 40 | 130 | 8 | 1.2s | Slow 30%, 2s |
| Lightning Tower | 60 | 150 | 20 | 2.0s | Chain 3 targets |
| Healing Tower | 45 | 80 | 0 | 3.0s | Restore Bastion HP 5 |

### 2.5 Wizard Spells
| Spell | Mana Cost | Range | Damage | Cooldown | Special |
|-------|-----------|-------|--------|----------|---------|
| Arcane Bolt | 0 | 200 | 8 | 0.3s | Basic attack (free) |
| Fireball | 15 | 180 | 25 | 1.5s | AoE explosion (radius 50) |
| Frost Nova | 20 | Self-centered | 10 | 3.0s | Slow all nearby enemies 50%, 3s |

---

## §3. Controls

### 3.1 Keyboard
| Key | Function |
|-----|----------|
| W/A/S/D or Arrow Keys | Wizard movement (8-directional) |
| Mouse Left Click | Fire Arcane Bolt (toward mouse) |
| Q | Cast Fireball (toward mouse) |
| E | Cast Frost Nova (self-centered) |
| 1–5 | Select tower (enter placement mode) |
| Mouse Left Click (placement mode) | Place tower |
| ESC / Right Click | Cancel placement / Pause |
| Space | Start wave early (during prep) |

### 3.2 Mouse Only
| Input | Function |
|-------|----------|
| Left Click (game field) | Fire Arcane Bolt toward click |
| Right Click | Cast Fireball toward click |
| Middle Click | Frost Nova |
| Drag wizard | Move wizard |
| Bottom UI tower icons | Select tower → placement mode |
| ESC | Pause |

### 3.3 Touch (Mobile)
| Input | Function |
|-------|----------|
| Left virtual joystick | Wizard movement |
| Right area tap | Fire Arcane Bolt (tap direction) |
| Skill buttons (bottom-right) | Fireball / Frost Nova |
| Bottom tower bar tap | Select tower → placement mode |
| Tap in placement mode | Place tower |
| Pause button (top-right, 48×48px) | Pause |

### 3.4 Input Device Feature Coverage Matrix
| Feature | Keyboard+Mouse | Mouse Only | Touch |
|---------|---------------|------------|-------|
| Movement | ✅ WASD/Arrows | ✅ Drag | ✅ Joystick |
| Basic Attack | ✅ Left Click | ✅ Left Click | ✅ Right Tap |
| Fireball | ✅ Q Key | ✅ Right Click | ✅ Skill Button |
| Frost Nova | ✅ E Key | ✅ Middle Click | ✅ Skill Button |
| Tower Select | ✅ 1–5 Keys | ✅ UI Click | ✅ UI Tap |
| Tower Place | ✅ Left Click | ✅ Left Click | ✅ Tap |
| Pause | ✅ ESC | ✅ ESC | ✅ Button |

> ⚠️ **Cycle 16 Lesson**: All input devices must support all features. No functionality gaps in mouse-only play.

---

## §4. Visual Style Guide

### 4.1 Overall Theme
**Dark Fantasy Neon** — Dark backgrounds with glowing magic effects. Maintains InfiniTriX platform's neon visual identity.

### 4.2 Color Palette
| Purpose | Color | Hex |
|---------|-------|-----|
| Background (Forest) | Deep green | #0a1a0a → #1a3a1a gradient |
| Background (Cave) | Deep blue | #0a0a1a → #1a1a3a gradient |
| Background (Volcano) | Deep red | #1a0a0a → #3a1a0a gradient |
| Bastion | Gold glow | #ffd700, shadow #ffaa00 |
| Wizard | Purple robe | #9944ff, #bb66ff |
| Arcane Effects | Cyan | #00ffff |
| Fire Effects | Orange-red | #ff6600, #ff2200 |
| Frost Effects | Sky blue | #88ddff, #44aaff |
| Lightning Effects | Yellow | #ffff44, #ffdd00 |
| UI Text | White | #ffffff |
| UI Background | Semi-transparent black | rgba(0,0,0,0.7) |
| HP Bar | Red→Green gradient | #ff4444 → #44ff44 |
| Mana Bar | Blue | #4488ff |

### 4.3 Bastion Visual Design
- Central circular fortress, gold border + inner purple magic circle
- Gold brightness decreases with HP ratio (100%: bright gold → 20%: dark brown)
- Red flash for 0.1s on hit

### 4.4 Wizard Visual Design (Multi-frame)
| State | Description |
|-------|-------------|
| idle | Robe hem gentle sway (sine wave), staff tip glowing |
| walk | 4-frame walk animation, robe flutter |
| attack | Staff swing + magic circle appearance |
| hit | Red flash 0.1s + knockback |
| cast | Both arms raised + magic circle expand (Fireball/Nova) |

### 4.5 Enemy Visual Design (Type-specific)
| Enemy | Shape | Features |
|-------|-------|----------|
| Slime | Translucent jelly circle | Elastic bounce movement, 2 eyes |
| Skeleton | Skull warrior | Sword swing, bone joint separation |
| Spider | 8-legged spider | Leg animation, fast movement |
| Golem | Rock mass | Heavy steps, debris particles |
| Wraith | Transparent ghost | Semi-transparent flicker, trail afterimage |
| Dark Knight | Armored warrior | Shield glow (defense active when close) |
| Dragonkin | Small dragon | Wing flap, fire particles |

### 4.6 Boss Visual Design
- **Golem King**: 2.5× normal golem size, crown, concentric ring effect on ground shockwave
- **Wraith King**: 2× normal wraith size, crown, 3 afterimages on teleport
- **Ancient Dragon**: 40% screen width, wing spread animation, cone fire breath effect

### 4.7 Background Layers (3–4 Layer Parallax)
| Layer | Forest | Cave | Volcano |
|-------|--------|------|---------|
| far (0.1×) | Distant mountain silhouette | Stalactite ceiling | Lava flow distance |
| mid (0.3×) | Tree silhouettes | Rock pillars | Crater rim |
| near (0.6×) | Grass/bushes | Crystal shards | Lava cracks |
| foreground (1.0×) | Falling leaf particles | Water drop particles | Ember particles |

> All backgrounds cached via offscreen canvas `buildBgCache(biome)`. Rebuild only on resizeCanvas().

### 4.8 UI Element Size Specifications
- All interactive UI minimum 48×48px (`CONFIG.MIN_TOUCH_TARGET = 48`)
- Pause button: 48×48px (top-right)
- Tower selection bar: each icon 56×56px (bottom-center)
- Skill buttons: 56×56px (bottom-right, touch only)
- Virtual joystick base: 120×120px (bottom-left, touch only)

---

## §5. Core Game Loop (Per-frame Logic Flow)

### 5.1 Main Loop Structure
```
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // Max 50ms cap
    lastTime = timestamp;

    tweenManager.update(dt);

    switch (state) {
      case STATE.TITLE:      updateTitle(dt);    break;
      case STATE.PLAYING:    updatePlaying(dt);  break;
      case STATE.UPGRADE:    updateUpgrade(dt);  break;
      case STATE.PAUSED:     /* no-op */         break;
      case STATE.GAMEOVER:   updateGameOver(dt); break;
    }

    render(state, dt);
  } catch (e) {
    console.error('[GameLoop Error]', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 5.2 PLAYING State Frame Flow
```
updatePlaying(dt):
  1. updateInput(dt)          — Process keyboard/mouse/touch input
  2. updateWizard(wizard, dt)  — Wizard movement + cooldown update
  3. updateProjectiles(projectiles, enemies, dt) — Projectile movement + collision
  4. updateTowers(towers, enemies, dt)           — Tower auto-attack
  5. updateEnemies(enemies, bastion, dt)          — Enemy movement + bastion attack
  6. checkWaveComplete(enemies, waveData)         — Wave completion check
  7. checkGameOver(bastion)                       — Bastion HP ≤ 0 check
  8. updateParticles(particles, dt)               — Particle update
  9. updateScreenEffects(dt)                      — Screen shake/slow-motion
```

### 5.3 Defensive Game Loop
- `try-catch` wrapping entire loop (F12)
- `dt` max 50ms cap (prevents runaway after tab switch)
- `requestAnimationFrame` called outside catch block

### 5.4 Guard Flag System
| Flag | Purpose | Set When | Cleared When |
|------|---------|----------|--------------|
| `_waveClearing` | Prevent duplicate wave completion | checkWaveComplete() entry | After upgrade selection complete |
| `_isTransitioning` | Prevent duplicate state transition | beginTransition() entry | Transition complete callback |
| `_isBossActive` | Boss active status | Boss spawn | Boss defeated |
| `_isPlacingTower` | Tower placement mode | Tower icon click | Placement complete/cancel |

---

## §6. State Machine & State×System Matrix

### 6.1 Game States (5)
```
STATE = {
  TITLE: 0,        // Title screen
  PLAYING: 1,      // Main gameplay
  UPGRADE: 2,      // Between-wave upgrade selection (1 of 3)
  PAUSED: 3,       // Paused
  GAMEOVER: 4      // Game over (defeat or victory)
}
```

### 6.2 State Transition Priority (STATE_PRIORITY)
```
STATE_PRIORITY = {
  GAMEOVER: 100,   // Highest priority
  PAUSED: 80,
  UPGRADE: 60,
  PLAYING: 40,
  TITLE: 20        // Lowest priority
}
```

All state transitions must go through `beginTransition(targetState, options)`:
```
function beginTransition(target, opts = {}) {
  if (_isTransitioning) return;
  if (STATE_PRIORITY[target] < STATE_PRIORITY[state] && !opts.force) return;
  if (bastion.hp <= 0 && target !== 'GAMEOVER') return; // GAMEOVER takes priority
  _isTransitioning = true;

  if (opts.immediate) {
    state = target;
    _isTransitioning = false;
    return;
  }

  tweenManager.add({
    target: screenFade, prop: 'alpha',
    from: 0, to: 1, duration: 300,
    onComplete: () => {
      state = target;
      tweenManager.add({
        target: screenFade, prop: 'alpha',
        from: 1, to: 0, duration: 300,
        onComplete: () => { _isTransitioning = false; }
      });
    }
  });
}
```

### 6.3 State × System Matrix

| System | TITLE | PLAYING | UPGRADE | PAUSED | GAMEOVER |
|--------|-------|---------|---------|--------|----------|
| **tween** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **input** | ✅ start | ✅ full | ✅ select | ✅ unpause | ✅ restart |
| **physics** (movement/collision) | ❌ | ✅ | ❌ | ❌ | ❌ |
| **enemies** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **towers** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **particles** | ✅ title fx | ✅ | ✅ residual | ❌ | ✅ residual |
| **render** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **audio** | ✅ BGM | ✅ BGM+SFX | ✅ BGM | ❌ muted | ✅ BGM |
| **screenFX** | ❌ | ✅ | ❌ | ❌ | ✅ |

---

## §7. Score System & Resource Management

### 7.1 Score
| Action | Score |
|--------|-------|
| Slime kill | 10 |
| Skeleton kill | 20 |
| Spider kill | 15 |
| Golem kill | 40 |
| Wraith kill | 25 |
| Dark Knight kill | 35 |
| Dragonkin kill | 30 |
| Golem King boss kill | 200 |
| Wraith King boss kill | 300 |
| Ancient Dragon boss kill | 500 |
| Wave clear bonus | wave number × 50 |
| Remaining Bastion HP bonus (victory) | HP × 10 |

> Score updates must use `addScore(amount, source)` single function only (F16).

### 7.2 Mana System
- Initial mana: 100 / Max mana: 100 (upgradeable)
- Mana auto-regen: 3/sec (upgradeable)
- Enemy kill mana drop: 20% of enemy score value (floor)
- Mana updates must use `modifyMana(amount, source)` single function only

### 7.3 Bastion HP
- Initial HP: 100 / Max HP: 100 (upgradeable)
- Damage via `modifyHP(amount, source)` single function only
- HP ≤ 0 triggers immediate GAMEOVER transition (highest STATE_PRIORITY)
- Healing: Healing Tower, certain upgrades

### 7.4 High Score Storage
- localStorage key: `arcaneBastion_hi`
- Format: `JSON.stringify({ score, wave, time })`
- **Judge first, save second** (F: Cycle 2 lesson)
```
const isNewBest = score > getBest().score; // Judge first
saveBest({ score, wave, time });            // Save second
```

---

## §8. Difficulty System

### 8.1 Wave-based Difficulty Curve

| Wave | Enemy HP Mult | Enemy Speed Mult | Enemy Count Mult | Spawn Interval (ms) |
|------|--------------|------------------|-------------------|---------------------|
| 1-3 | 1.0× | 1.0× | 1.0× | 1500 |
| 4-5 | 1.2× | 1.1× | 1.2× | 1200 |
| 6-8 | 1.4× | 1.2× | 1.3× | 1000 |
| 9-10 | 1.6× | 1.3× | 1.4× | 800 |
| 11-13 | 1.8× | 1.4× | 1.5× | 700 |
| 14-15 | 2.0× | 1.5× | 1.6× | 600 |

### 8.2 Elite Enemies
- Appear from wave 10+
- 2× HP, 1.3× speed of normal enemies
- Gold border glow (shadowBlur, **no SVG filters** F9)
- 2× score + 2× mana on kill

### 8.3 Boss Mechanics
| Boss | Wave | Pattern 1 | Pattern 2 | Pattern 3 |
|------|------|-----------|-----------|-----------|
| Golem King | 5 | Straight charge | Ground shockwave (3s CD) | Rock throw |
| Wraith King | 10 | Teleport (5s CD) | Summon 2 wraiths (10s CD) | Soul drain (HP heal) |
| Ancient Dragon | 15 | Fire breath (60° cone) | Flight (3s invincible+move) | Carpet bombing (3 lines) |

---

## §9. Roguelike Upgrade System

### 9.1 Upgrade Pool (18 Types)
3 random upgrades presented after wave clear; player picks 1.

| # | Category | Name | Effect | Max Stack |
|---|----------|------|--------|-----------|
| 1 | Attack | Bolt Enhancement | Arcane Bolt damage +25% | 3 |
| 2 | Attack | Multi-shot | Arcane Bolt fires 2 simultaneously | 1 |
| 3 | Attack | Fire Mastery | Fireball radius +30%, cooldown -20% | 2 |
| 4 | Attack | Chain Lightning | Arcane Bolt chains +1 | 2 |
| 5 | Defense | Bastion Fortify | Bastion max HP +20 | 3 |
| 6 | Defense | Thorn Shield | Reflect 5 damage to melee attackers | 2 |
| 7 | Defense | Protection Ward | 30% chance to negate Bastion damage | 2 |
| 8 | Resource | Mana Spring | Mana regen +2/sec | 3 |
| 9 | Resource | Mana Plunder | Enemy kill mana reward +50% | 2 |
| 10 | Resource | Expanded Mana Pool | Max mana +30 | 2 |
| 11 | Tower | Tower Enhancement | All tower damage +20% | 3 |
| 12 | Tower | Quick Reload | All tower attack speed +15% | 3 |
| 13 | Tower | Extra Slots | Max tower count +2 | 2 |
| 14 | Movement | Swiftness | Wizard move speed +20% | 3 |
| 15 | Movement | Blink | Space (or double-tap) short teleport | 1 |
| 16 | Special | Frost Mastery | Frost Nova radius +40%, slow duration +1s | 2 |
| 17 | Special | Critical | All attacks 20% chance for 2× damage | 2 |
| 18 | Special | Regeneration | Bastion HP +10 at wave start | 3 |

### 9.2 Upgrade Selection UI
- 3 cards displayed horizontally at screen center (160×220px each)
- Card layout: Icon (top), Name (middle), Effect description (bottom), category color border
- Hover/touch: card scale 1.1× + glow
- Selection: card zoom → fade out → next wave starts
- Category colors: Attack=#ff4444, Defense=#44ff44, Resource=#4488ff, Tower=#ffaa00, Movement=#44ffff, Special=#ff44ff

---

## §10. Function Signatures (Pure Function Principle)

> **F3 Principle**: All game logic functions receive data via parameters. 0 global direct references.

### 10.1 Core Utilities
```javascript
// TweenManager — clearImmediate() separated (F6)
class TweenManager {
  add(opts)           // { target, prop, from, to, duration, ease, onComplete }
  update(dt)          // Called every frame
  cancelAll()         // Deferred cancel
  clearImmediate()    // Immediate cleanup — safe to add() after cancelAll
}

// ObjectPool — Reuse particles/projectiles
class ObjectPool {
  constructor(createFn, resetFn, size)
  acquire()
  release(obj)
}

// SoundManager — Web Audio API
class SoundManager {
  playBGM(type)       // 'forest' | 'cave' | 'volcano' | 'boss'
  playSFX(type)       // 'shoot' | 'hit' | 'kill' | 'boss_spawn' | 'level_up' | 'tower_place' | 'game_over'
  stopAll()
  setVolume(v)
}
```

### 10.2 Game Logic Function Signatures (0 Global References)
```javascript
// Wizard
function updateWizard(wizard, input, dt, bounds) → wizard
function fireArcaneBeam(wizard, targetPos, projectiles, upgrades) → projectile
function castFireball(wizard, targetPos, mana, projectiles, upgrades) → { projectile, manaUsed }
function castFrostNova(wizard, enemies, mana, upgrades) → { affected[], manaUsed }

// Enemies
function spawnEnemy(type, waveNum, spawnSide, bounds) → enemy
function updateEnemy(enemy, bastion, dt) → enemy
function damageEnemy(enemy, damage, isCrit) → { enemy, killed, score, mana }
function checkEnemyAttack(enemy, bastion, dt) → damage

// Towers
function placeTower(type, pos, towers, mana, maxTowers) → { tower, manaUsed, success }
function updateTower(tower, enemies, projectiles, dt, upgrades) → void
function findTarget(tower, enemies) → enemy|null

// Waves
function getWaveData(waveNum) → { enemies[], spawnInterval, isBoss }
function checkWaveComplete(enemies, waveClearing) → boolean
function startNextWave(waveNum, bounds) → waveState

// Boss
function updateBoss(boss, wizard, bastion, enemies, dt) → void
function bossPattern(boss, patternId, targets) → effects[]

// Collision
function checkCollision(a, b) → boolean  // Circle collision
function findEnemiesInRadius(pos, radius, enemies) → enemy[]

// Upgrades
function generateUpgradeChoices(pool, currentUpgrades, count) → choice[3]
function applyUpgrade(upgradeId, gameState) → gameState

// Score/Resources (single update path F16)
function addScore(state, amount, source) → state
function modifyMana(state, amount, source) → state
function modifyHP(bastion, amount, source) → bastion

// Render
function render(state, gameData, ctx, dt) → void
function drawWizard(ctx, wizard, frame, dt) → void
function drawEnemy(ctx, enemy, dt) → void
function drawTower(ctx, tower, dt) → void
function drawBastion(ctx, bastion, dt) → void
function drawUI(ctx, gameData, state) → void
function drawParticles(ctx, particles, dt) → void
function drawBackground(ctx, bgCache, biome) → void
```

---

## §11. Achievement System

| # | Achievement | Condition | Icon |
|---|-------------|-----------|------|
| 1 | First Defense | Clear wave 1 | 🛡️ |
| 2 | Tower Master | Place all 5 tower types | 🏰 |
| 3 | Century Kill | 100 kills in a single run | 💀 |
| 4 | Golem Slayer | Defeat Golem King boss | ⚔️ |
| 5 | Wraith Vanquisher | Defeat Wraith King boss | 👻 |
| 6 | Dragon Slayer | Defeat Ancient Dragon final boss (game clear) | 🐉 |
| 7 | No-Tower Clear | Clear wave 5 with 0 towers | 🧙 |
| 8 | Untouched Wave | Clear a wave with 0 Bastion damage | ✨ |
| 9 | Mana Rich | Hold 300+ mana | 💎 |
| 10 | Bastion Guardian | Clear 15 waves with 100% Bastion HP | 👑 |

- localStorage key: `arcaneBastion_achievements`
- Toast notification on achievement (tween slide in/out, 2 seconds)
- Achievement list displayed on GAMEOVER screen

---

## §12. Sound System

### 12.1 Web Audio API Based (0 setTimeout)
- `AudioContext` with `ctx.currentTime` native scheduling only
- BGM: OscillatorNode chain for 8-bit style loops
- SFX: Single-shot oscillator + gainNode envelope

### 12.2 BGM (4 Types)
| BGM | Biome | Mood | Frequency Range |
|-----|-------|------|-----------------|
| Forest Theme | Waves 1-5 | Peaceful fantasy | C4–G5 |
| Cave Theme | Waves 6-10 | Tense, echo | A3–E5 |
| Volcano Theme | Waves 11-15 | Epic, threatening | E3–B5 |
| Boss Theme | Boss fights | Intense, fast beat | G3–C6 |

### 12.3 SFX (7 Types)
| SFX | Trigger | Waveform | Duration |
|-----|---------|----------|----------|
| Arcane Bolt | Basic attack | sine→square | 0.1s |
| Fireball | Explosion | sawtooth | 0.3s |
| Frost Nova | Cast | triangle | 0.4s |
| Tower Build | Placement confirm | sine | 0.2s |
| Enemy Kill | On kill | square→noise | 0.15s |
| Boss Appear | Boss spawn | low sine sweep | 1.0s |
| Game Over | Bastion destroyed | descending saw | 0.8s |

### 12.4 Touch Target Minimum Size
- `CONFIG.MIN_TOUCH_TARGET = 48`
- All button rendering uses `touchSafe(w, h)` utility:
```javascript
function touchSafe(w, h) {
  return { w: Math.max(CONFIG.MIN_TOUCH_TARGET, w), h: Math.max(CONFIG.MIN_TOUCH_TARGET, h) };
}
```

---

## §13. Verification Checklists

### 13.1 Initialization Order Checklist (F11)
```
1. const/let variable declarations (CONFIG, STATE, STATE_PRIORITY)
2. Canvas element reference (document.getElementById)
3. Canvas size setup (resizeCanvas)
4. Class definitions (TweenManager, ObjectPool, SoundManager)
5. Game state variable initialization
6. Event listener registration
7. init() call
8. requestAnimationFrame(gameLoop) start
```

### 13.2 Variable Usage Verification Table (F15)
| Variable | Declared | Updated In | Referenced In |
|----------|----------|------------|---------------|
| wizard.x/y | init() | updateWizard() | drawWizard(), fireArcaneBeam() |
| bastion.hp | init() | modifyHP() | drawBastion(), drawUI(), checkGameOver() |
| mana | init() | modifyMana() | castFireball(), castFrostNova(), placeTower(), drawUI() |
| score | init() | addScore() | drawUI(), GAMEOVER screen |
| waveNum | init() | startNextWave() | getWaveData(), drawUI() |
| towers[] | init() | placeTower() | updateTower(), drawTower(), render() |
| enemies[] | init() | spawnEnemy(), damageEnemy() | updateEnemy(), checkCollision(), findTarget() |
| projectiles[] | init() | fire*(), ObjectPool | updateProjectiles(), drawProjectiles() |
| upgrades{} | init() | applyUpgrade() | combat functions for multiplier reference |
| _waveClearing | init() | checkWaveComplete() | updatePlaying() |
| _isTransitioning | init() | beginTransition() | beginTransition() |
| _isBossActive | init() | boss spawn/defeat | updatePlaying() |

### 13.3 Feature Sub-item Implementation Checklist (F19 Anti-"half-implemented")
| Feature | Sub-item | Done |
|---------|----------|------|
| Wizard Movement | A: WASD input | ☐ |
| | B: Screen boundary clamping | ☐ |
| | C: Walk animation | ☐ |
| Arcane Bolt | A: Fire logic | ☐ |
| | B: Collision detection | ☐ |
| | C: Particle effect | ☐ |
| Fireball | A: Mana consumption | ☐ |
| | B: AoE explosion | ☐ |
| | C: Explosion particles | ☐ |
| Frost Nova | A: Mana consumption | ☐ |
| | B: AoE slow application | ☐ |
| | C: Frost particles | ☐ |
| Tower Placement | A: Mana consumption | ☐ |
| | B: Valid position check | ☐ |
| | C: Placement preview display | ☐ |
| | D: Max count limit | ☐ |
| Tower Attack | A: Target finding | ☐ |
| | B: Projectile creation | ☐ |
| | C: Special effects (AoE/slow/chain/heal) | ☐ |
| Enemy Movement | A: Move toward Bastion | ☐ |
| | B: Attack on Bastion contact | ☐ |
| | C: Type-specific abilities | ☐ |
| Boss Fight | A: Boss spawn sequence | ☐ |
| | B: 3 boss patterns | ☐ |
| | C: Boss HP bar at top | ☐ |
| Upgrade Selection | A: Generate 3 cards | ☐ |
| | B: Card hover/select UI | ☐ |
| | C: Apply effect | ☐ |
| | D: Stack limit enforcement | ☐ |
| Achievements | A: Condition check | ☐ |
| | B: Toast notification | ☐ |
| | C: GAMEOVER list display | ☐ |
| | D: localStorage save | ☐ |

### 13.4 Defensive Coding Checklist
- [ ] gameLoop wrapped in try-catch
- [ ] dt capped at 0.05 max
- [ ] 0 uses of setTimeout/setInterval
- [ ] 0 uses of alert/confirm/prompt/window.open
- [ ] 0 SVG filter tags (feGaussianBlur etc.)
- [ ] Canvas glow via shadowBlur only
- [ ] 0 functions with global direct references

### 13.5 setTimeout Zero Verification (F2)
- `grep -c "setTimeout\|setInterval" index.html` → must be **0**
- Web Audio scheduling: `oscillator.start(ctx.currentTime + delay)` only

### 13.6 assets/ Directory Ban (F1)
- Allowed files in game directory: `index.html`, `thumbnail.svg`
- `assets/` directory existence = immediate FAIL
- All SVG replaced with Canvas code drawing
- Only thumbnail.svg as separate file

### 13.7 Smoke Test Gate (F13)
Mandatory pre-review checks:
1. ✅ `index.html` file exists
2. ✅ Page loads in browser
3. ✅ 0 console errors/warnings
4. ✅ TITLE screen renders correctly
5. ✅ Game start transitions to PLAYING state
6. ✅ `assets/` directory does not exist

### 13.8 Regression Test Flow (F14)
After any fix, verify full flow:
```
TITLE → (start) → PLAYING → (pause) → PAUSED → (unpause) → PLAYING
→ (wave clear) → UPGRADE → (select) → PLAYING → (bastion HP 0) → GAMEOVER
→ (restart) → TITLE
```

### 13.9 Value Consistency Verification Table (F7)
| Item | Spec Value | Code Check |
|------|-----------|------------|
| Slime HP | 20 | ☐ |
| Skeleton HP | 35 | ☐ |
| Spider HP | 25 | ☐ |
| Golem HP | 80 | ☐ |
| Wraith HP | 40 | ☐ |
| Dark Knight HP | 60 | ☐ |
| Dragonkin HP | 50 | ☐ |
| Golem King Boss HP | 300 | ☐ |
| Wraith King Boss HP | 250 | ☐ |
| Ancient Dragon Boss HP | 500 | ☐ |
| Arcane Bolt damage | 8 | ☐ |
| Fireball damage | 25 | ☐ |
| Frost Nova damage | 10 | ☐ |
| Initial mana | 100 | ☐ |
| Mana auto-regen | 3/sec | ☐ |
| Bastion initial HP | 100 | ☐ |
| Max tower placement | 8 | ☐ |
| Arcane Tower mana cost | 30 | ☐ |
| Flame Tower mana cost | 50 | ☐ |
| Frost Tower mana cost | 40 | ☐ |
| Lightning Tower mana cost | 60 | ☐ |
| Healing Tower mana cost | 45 | ☐ |
| Upgrade "Bolt Enhancement" effect | +25% | ☐ |
| Upgrade "Critical" chance | 20% | ☐ |
| Elite HP multiplier | 2× | ☐ |
| Elite speed multiplier | 1.3× | ☐ |

---

## §14. Screen Effect System

### 14.1 Screen Shake
- Trigger: Boss attack, Bastion hit, boss defeat
- Implementation: `shakeOffset = { x: Math.random()*intensity - intensity/2, y: ... }`
- Decay: intensity decreases over 0.3s (tween)
- `ctx.translate(shakeOffset.x, shakeOffset.y)` applied before render, then restored

### 14.2 Slow Motion
- Trigger: Boss appear, boss defeat
- Implementation: `timeScale` variable (1.0 → 0.3 → 1.0, 1.5s tween)
- `dt *= timeScale` applied

### 14.3 Particle System (ObjectPool-based)
| Particle Type | Trigger | Count | Lifetime | Features |
|--------------|---------|-------|----------|----------|
| Arcane Spark | Bolt fire | 3 | 0.3s | Cyan, shrinking |
| Flame Debris | Fireball explosion | 12 | 0.5s | Orange-red, gravity |
| Frost Crystal | Frost Nova | 8 | 0.4s | Sky blue, rotating |
| Enemy Burst | Enemy kill | 6 | 0.3s | Enemy color, radial |
| Boss Explosion | Boss kill | 20 | 0.8s | Gold+red, full screen |
| Tower Build | Tower placement | 5 | 0.4s | Gold sparkle |
| Mana Collect | Mana drop pickup | 4 | 0.3s | Blue, rising |

- ObjectPool sizes: Particles 80, Projectiles 30

### 14.4 UI Animation
- Score change: Number count-up (tween, 0.3s)
- HP change: Smooth HP bar decrease (tween, 0.2s) + red flash
- Mana change: Smooth mana bar change (tween, 0.2s)
- Wave start: "WAVE X" text bounce-in (tween, 0.5s)
- Boss appear: "⚠ BOSS ⚠" text flicker + slow motion

---

## §15. Sidebar Metadata (Game Page Display)

```yaml
game:
  title: "Arcane Bastion"
  description: "Become a wizard and defend the Bastion! Cast spells, build magic towers, and survive 15 waves in this roguelike forge defense."
  genre: ["action", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/Arrow Keys: Move wizard"
    - "Left Click: Fire Arcane Bolt"
    - "Q: Fireball / E: Frost Nova"
    - "1-5: Select tower, click to place"
    - "ESC: Pause"
    - "Touch: Virtual joystick + skill buttons"
  tags:
    - "#roguelike"
    - "#tower-defense"
    - "#magic"
    - "#boss-fight"
    - "#upgrades"
    - "#fantasy"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

### Home Page GameCard Display
- **thumbnail**: Wizard facing Dragon boss in front of Bastion (4:3)
- **title**: Arcane Bastion (1 line)
- **description**: Become a wizard and defend the Bastion! Cast spells & build towers to survive 15 waves (2 lines)
- **genre badges**: `action` `strategy` (max 2)
- **playCount**: 0 (initial)
- **addedAt**: 2026-03-22 → "NEW" badge (within 7 days)
- **featured**: true → ⭐ badge

---

## §16. Technical Specifications Summary

| Item | Specification |
|------|---------------|
| File structure | `index.html` (single file) + `thumbnail.svg` |
| Estimated LOC | 1,900–2,200 lines |
| Canvas resolution | `window.innerWidth × window.innerHeight`, `devicePixelRatio` support |
| Frame rate | requestAnimationFrame (60fps target) |
| State count | 5 (TITLE, PLAYING, UPGRADE, PAUSED, GAMEOVER) |
| Enemy types | 7 + 3 bosses = 10 types |
| Tower types | 5 |
| Upgrade pool | 18 types |
| Achievements | 10 |
| Particle pool | 80 |
| Projectile pool | 30 |
| BGM | 4 (3 biomes + 1 boss) |
| SFX | 7 |
| External dependencies | 0 (no fonts/images/libraries) |
| localStorage keys | `arcaneBastion_hi`, `arcaneBastion_achievements` |
| Browser APIs | Canvas 2D, Web Audio API, localStorage, requestAnimationFrame |
