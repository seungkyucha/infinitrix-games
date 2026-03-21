---
game-id: star-guardian
title: Star Guardian
genre: arcade
difficulty: medium
---

# Star Guardian — Detailed Game Design Document

> **Cycle:** 2
> **Date:** 2026-03-20
> **Designer:** Claude (Game Designer)
> **Reference:** Based on `docs/analytics/cycle-2-report.md` analysis report

---

## 0. Previous Cycle Feedback Integration

> Issues and suggestions from the Cycle 1 "Color Merge Puzzle" post-mortem are **explicitly** incorporated.

| Cycle 1 Issue / Suggestion | Severity | Cycle 2 Response |
|---------------------------|----------|-----------------|
| **Block movement animation not implemented [M4]** — Only setTimeout lock with instant position change | MAJOR | → **lerp + easing-based universal Tween class** built into game core from the start. All movement/scale/fade/rotation handled via tweens |
| **3 unnecessary assets preloaded [M2]** — player.svg etc. remaining from generic template | MINOR | → Register **only game-specific assets** in ASSET_MAP. No generic template copying. Post-implementation checklist to verify unused assets |
| **Google Fonts external dependency [M1]** — Violates "zero external assets" principle | MINOR | → **System font stack only** (`'Segoe UI', system-ui, -apple-system, sans-serif`). Complete removal of external CDN dependencies |
| **No confirmation UI for R key restart [M3]** — confirm() not available in iframe | MINOR | → Implement **Canvas-based confirmation modal**. "Are you sure you want to restart?" Yes/No buttons |
| Build universal tween/animation system | Suggestion | → **TweenManager class** design: `tween(target, props, duration, easing)` API. Used for enemy spawn, explosions, power-ups, UI transitions |
| Try arcade/action genre | Suggestion | → **Vertical scrolling shooter (arcade/action)** genre selected. Validates real-time input, collision detection, frame-based loops — a completely different technical domain from puzzle |
| Consider object pooling | Suggestion | → **ObjectPool class** design: Bullets, enemies, particles acquired/released from pool instead of creating new objects each frame |
| Clean up asset template | Suggestion | → Define only shooter-specific assets. Code fallback rendering guarantees 100% operation even without assets |

### Verified Patterns from platform-wisdom.md

| Success Pattern | Application |
|----------------|-------------|
| Single HTML + Canvas + Vanilla JS | Same architecture maintained |
| Game state machine | LOADING → TITLE → PLAYING → PAUSE → GAMEOVER + CONFIRM_MODAL (6 states) |
| Promise.all asset preload + fallback | Same pattern applied |
| DPR support | Same applied |
| localStorage try-catch | Same applied |
| HEX codes/formulas specified in design doc | All values/formulas/color codes specified (target 95% implementation fidelity) |

---

## 1. Game Overview & Core Fun Elements

### Concept
A vertical scrolling shooter set in space where the player **pilots a fighter craft to destroy enemy fleets in wave-based combat**. Simple movement + shooting enhanced with **power-up collection**, **wave-based difficulty scaling**, and **boss battles** provides "just one more game" addiction.

### Core Fun Elements
1. **Immediate impact feedback** — Explosion effects + subtle screen shake on enemy hits for visual satisfaction
2. **Power-up collection thrill** — Power-ups dropped by defeated enemies temporarily boost firepower for a power fantasy
3. **Wave survival** — Achievement of clearing bosses that appear every 5 waves and advancing to the next stage
4. **Short, intense sessions** — 3~7 minutes of focused play per game. Instant restart on death
5. **Gradual tension** — Enemy density and speed increase with each wave; the challenge is "how long can you survive"

---

## 2. Game Rules & Objectives

### 2.1 Basic Rules
- **Vertical scrolling (top→bottom) shooter** — Player at the bottom of screen, enemies appear from the top
- Player fighter can **move freely in all 4 directions** within the screen (cannot leave screen bounds)
- **Auto-fire mode**: Bullets fire automatically during gameplay (for touch environment convenience)
- On keyboard, **Space/Z for manual fire** is also available (auto + manual coexist)
- Collision with enemies or enemy bullets causes **1 HP loss**
- **Game over** when HP reaches 0

### 2.2 Wave System
- Game progresses through **infinite waves**
- Each wave has predefined **enemy formation patterns**; clearing all enemies advances to the next wave
- **Boss battle every 5 waves** (wave 5, 10, 15, ...)
- **2-second rest between waves** — "WAVE N" text effect (tween scaleUp + fadeOut)
- Enemy spawns at intervals: `spawnInterval = max(400, 1800 - wave * 60)` ms

### 2.3 Enemy Types (4 + Boss)

| Enemy Type | Color | HP | Movement Pattern | Attack | Score | First Wave |
|------------|-------|-----|-----------------|--------|-------|------------|
| **Scout** | `#5DADE2` (sky) | 1 | Straight descent (`80px/s`) | None | 100 | 1+ |
| **Fighter** | `#F39C12` (orange) | 2 | Sine wave lateral (`amplitude 40px, period 2s`) + descent (`60px/s`) | Single straight shot (2s interval) | 200 | 3+ |
| **Tank** | `#E74C3C` (red) | 4 | Slow straight descent (`40px/s`) | 3-way spread (-20°, 0°, +20°, 3s interval) | 350 | 6+ |
| **Dart** | `#9B59B6` (purple) | 1 | High-speed diagonal dash (`200px/s`, angle determined at spawn) | None (kamikaze type) | 150 | 8+ |
| **Boss** | `#2C3E50` + `#E74C3C` core | wave×8 | Left-right oscillation (`50px/s`) + fixed at top (`y=70`) | Complex pattern (3 phases) | 1000×stage | 5, 10, 15... |

### 2.4 Boss Attack Patterns (3-Phase Cycle, 4 seconds each)
1. **Phase A — Straight Burst**: 5 straight shots aimed at player at 0.4s intervals
2. **Phase B — Circular Spread**: 12-direction (30° intervals) radial barrage ×1 → 1.5s later ×1 (2 total)
3. **Phase C — Homing Missiles**: 2 slow-tracking guided missiles (turn rate `2rad/s`, self-destruct after 3s)
- **Below 50% HP**: Phase transition speed ×1.5 + bullet speed ×1.2
- Boss health bar: 100px wide bar above boss (`#2ECC71` → `#E74C3C` proportional to HP)

### 2.5 Game Objective
- **Achieve highest score** + **reach highest wave** (both recorded)
- High score and best wave saved to localStorage

### 2.6 Game Over Condition
- Game over when HP reaches 0
- Game over screen: final score, wave reached, best record, restart/title buttons

---

## 3. Controls

### 3.1 Keyboard (Desktop)

| Key | Action |
|-----|--------|
| `←→↑↓` or `WASD` | 8-directional movement |
| `Space` / `Z` | Fire (coexists with auto-fire, hold for rapid fire) |
| `P` / `Esc` | Pause toggle |
| `R` | Restart (**Canvas confirmation modal** shown first) |
| `Enter` | Start/restart from title/game over |

> **Simultaneous input support**: Managed via `keyDown` Set. Diagonal movement speed normalized: `vector = normalize(dx, dy) × speed`. Movement and firing work simultaneously.

### 3.2 Touch (Mobile/Tablet)

| Gesture | Action |
|---------|--------|
| **Touch & drag lower-left area** | Virtual joystick — movement |
| **Touch anywhere on screen** | Auto-fire active (default ON) |
| **Touch pause icon (upper right)** | Pause |

- Virtual joystick: Outer circle radius 50px (`rgba(255,255,255,0.15)`), inner handle radius 20px (`rgba(0,229,255,0.5)`)
- Joystick area: Lower-left `(0, canvasH×0.5)` ~ `(canvasW×0.4, canvasH)`
- Relative movement from touch start point, dead zone 8px
- Auto-fire enabled by default: No separate fire button needed in touch environment

### 3.3 Mouse (Desktop Alternative)

| Action | Description |
|--------|-------------|
| Mouse movement | Fighter **smoothly follows** mouse position (lerp factor `0.12`) |
| Left click hold | Fire |
| Right click | None (`contextmenu` event `preventDefault()`) |

---

## 4. Visual Style Guide

### 4.1 Overall Atmosphere
- **Neon Space** — Neon-glowing objects on a dark space background
- **Geometric spaceships** — Clean silhouettes based on triangles/polygons (all Canvas code-rendered)
- **3-layer parallax star background** — Depth and movement feel

### 4.2 Color Palette

| Element | HEX | Usage |
|---------|-----|-------|
| Background (bottom) | `#0B0E17` | Deep space |
| Background stars layer 1 (far) | `rgba(255,255,255,0.2)` | Small dots, slow scroll |
| Background stars layer 2 (mid) | `rgba(255,255,255,0.5)` | Medium dots, medium scroll |
| Background stars layer 3 (near) | `rgba(255,255,255,0.8)` | Large dots, fast scroll |
| Player body | `#00E5FF` | Cyan neon — protagonist highlight |
| Player engine flame | `#FF6B35` → `#FFD93D` | Orange→yellow gradient, size flickers ±3px per frame |
| Player bullets | `#00E5FF` + `shadowBlur: 8` | Cyan glow |
| Enemy — Scout | `#5DADE2` | Sky blue — weak enemy |
| Enemy — Fighter | `#F39C12` | Orange — medium enemy |
| Enemy — Tank | `#E74C3C` | Red — strong enemy |
| Enemy — Dart | `#9B59B6` | Purple — kamikaze type |
| Enemy — Boss body | `#2C3E50` | Dark gray |
| Enemy — Boss core | `#E74C3C` | Red (pulses below 50% HP) |
| Enemy bullets | `#FF4757` + `shadowBlur: 6` | Red warning glow |
| Homing missiles | `#FF6B35` | Orange + afterimage trail |
| Power-up — Weapon boost | `#FFD93D` | Yellow |
| Power-up — HP recovery | `#2ECC71` | Green |
| Power-up — Shield | `#3498DB` | Blue |
| Explosion particles | `#FF6B35` → `#FFD93D` → `#FFFFFF` | 3-stage color decay |
| UI text (primary) | `#FFFFFF` | Score, wave |
| UI text (secondary) | `#8892A0` | Auxiliary info |
| HP bar high | `#2ECC71` | HP >= 60% |
| HP bar medium | `#F39C12` | 30% <= HP < 60% |
| HP bar low | `#E74C3C` | HP < 30% |
| Wave notification | `#00E5FF` | WAVE N display |
| Boss warning | `#FF4757` | "WARNING" blink |
| Modal background | `#1A1F36` | Confirmation modal |
| Modal border | `#00E5FF` | Cyan accent |

### 4.3 Object Shapes (Code Rendering — Zero External Assets)

All objects are **rendered directly via Canvas code**. Code fallback identical to SVG asset failure is the default.

| Object | Shape Description | Size (Game Coords) |
|--------|------------------|-------------------|
| **Player** | Upward-pointing triangle (body) + two small inverted triangles (wings) + bottom engine flame (flickering triangle) | 40×48px |
| **Scout** | Downward-pointing inverted triangle | 28×28px |
| **Fighter** | Diamond + two small triangle wings | 32×32px |
| **Tank** | Large hexagon + center circular core (`#E74C3C`) | 44×40px |
| **Dart** | Elongated vertical arrow | 20×36px |
| **Boss** | Large semicircle (top) + bottom rectangle + left/right triangle turrets | 120×80px |
| **Player bullet** | Vertical rectangle + glow | 3×12px |
| **Enemy bullet** | Circle + glow | 8×8px (radius 4px) |
| **Homing missile** | Small triangle + afterimage trail (alpha decay 3 frames) | 10×10px |
| **Power-up** | Circle (radius 12px) + internal letter (W/H/S) + outer rotating ring + vertical float | 24×24px |
| **Explosion particle** | Circle (shrinking size) | Initial 3~5px → 0px |

### 4.4 Background System — Parallax Star Scroll

```
Layer 1 (far stars):   40 stars, radius 0.5~1px, scroll speed 0.3px/frame
Layer 2 (mid stars):   25 stars, radius 1~2px,   scroll speed 0.8px/frame
Layer 3 (near stars):  10 stars, radius 2~3px,    scroll speed 1.5px/frame
```

- Stars that exit the bottom are repositioned at the top with random x (infinite loop)
- Bright stars in layer 3 twinkle with `alpha` = `0.6 + sin(time×2) × 0.2`
- On boss battle entry, background color: `#0B0E17` → `#1A0A0A` (red tone), 2-second tween transition
- After boss defeat: `#1A0A0A` → `#0B0E17` restore (1-second tween)

### 4.5 Effect Details

| Effect | Implementation |
|--------|---------------|
| **Enemy explosion** | 8~12 particles radiate (`#FF6B35`→`#FFD93D`→`#FFFFFF`), lifespan 400ms, speed `60~120px/s` random direction |
| **Boss explosion** | 30 particles + white circular expansion (scale 0→3, alpha 1→0, 600ms) + screen shake (±6px, 400ms) |
| **Player hit** | Red overlay flash (`rgba(255,0,0,0.25)`, 150ms) + screen shake (±4px, 200ms) |
| **Power-up collected** | White circular expansion (scale 0→2, alpha 0.5→0, 300ms) + score popup text |
| **Shield break** | 8 blue particles radiating (`#3498DB`, 300ms) |
| **Score popup** | "+100" text, y moves up 40px + alpha 1→0, 800ms (tween easeOutQuad) |
| **Muzzle flash** | White circle (r=4px) at player muzzle position, disappears after 2 frames |
| **Wave clear** | "WAVE N CLEAR!" text scale 0→1.2→1 (easeOutBack, 500ms) + 1s hold + fadeOut 500ms |
| **Boss warning** | "WARNING" text red blink (alpha 0↔1, 200ms interval, for 2 seconds) |

---

## 5. Core Game Loop (Frame-Based Logic Flow)

### 5.1 Game State Machine

```
LOADING ──(asset load complete)──→ TITLE
TITLE ──(Enter/touch)──→ PLAYING
PLAYING ──(P/Esc)──→ PAUSE
PAUSE ──(P/Esc/Resume button)──→ PLAYING
PLAYING ──(HP=0)──→ GAMEOVER
GAMEOVER ──(Enter/Retry button)──→ PLAYING (reset)
PLAYING ──(R key)──→ CONFIRM_MODAL
CONFIRM_MODAL ──(Yes)──→ PLAYING (reset)
CONFIRM_MODAL ──(No/Esc)──→ PLAYING (return)
PAUSE ──(Restart button)──→ CONFIRM_MODAL
```

> In CONFIRM_MODAL state, the game loop continues (background rendering) but game logic updates stop. Input is redirected to modal UI only.

### 5.2 Main Loop (requestAnimationFrame, deltaTime-based)

```
function gameLoop(now) {
    requestAnimationFrame(gameLoop);
    const dt = min((now - lastTime) / 16.67, 2.0);  // 60fps normalized, max 2 frame skip
    lastTime = now;

    switch (gameState) {
        case 'LOADING':       updateLoading();                break;
        case 'TITLE':         updateTitle(dt);   drawTitle();  break;
        case 'PLAYING':       updateGame(dt);    drawGame();   break;
        case 'PAUSE':         drawGame(); drawPauseOverlay();  break;
        case 'CONFIRM_MODAL': drawGame(); drawConfirmModal();  break;
        case 'GAMEOVER':      updateGameOver(dt); drawGameOver(); break;
    }
}
```

### 5.3 updateGame(dt) Detailed Flow (Per Frame)

```
 1. processInput(dt)        — keys Set / mouse lerp / touch joystick → calculate player movement vector
 2. updatePlayer(dt)        — Update position, clamp to screen bounds, decrease invincibility timer
 3. updateAutoFire(dt)      — Process fire cooldown, acquire from bullet pool → arrange by pattern
 4. updatePlayerBullets(dt) — Bullet y -= bulletSpeed × dt, off-screen → pool.release
 5. updateWaveManager(dt)   — Check spawn queue, on timer → pool.acquire enemy → set pattern/position
 6. updateEnemies(dt)       — Enemy type-specific movement logic (straight/sine/dash), AI fire
 7. updateEnemyBullets(dt)  — Enemy bullet movement, homing missile rotation, off-screen → pool.release
 8. updatePowerups(dt)      — Fall + float animation, off-screen → pool.release
 9. checkCollisions()       — 4 AABB types: player bullet↔enemy, enemy bullet↔player, enemy↔player, powerup↔player
10. tweenManager.update(dt) — Update active tween progress, fire onComplete callback on completion
11. updateParticles(dt)     — Decrease lifespan, decay size/alpha, on death → pool.release
12. updateFloatingTexts(dt) — Text y↑ + alpha↓ (tween-linked)
13. updateBackground(dt)    — Update 3-layer star y coordinates
14. updateHUD(dt)           — Score display lerp (smooth number increase animation)
15. checkGameOver()         — If HP <= 0, transition to GAMEOVER, start game over tween
16. checkWaveClear()        — If active enemies = 0 + spawn queue empty → wave clear effect → next wave
```

### 5.4 drawGame() Rendering Order (back→front)

```
 1. ctx.save() + apply screen shake offset (ctx.translate)
 2. drawBackground()        — Background color + 3-layer parallax stars
 3. drawPowerups()          — Power-up items (float + rotating ring)
 4. drawEnemyBullets()      — Enemy bullets (glow circles)
 5. drawEnemies()           — Enemies + boss (with HP bar)
 6. drawPlayerBullets()     — Player bullets (glow rectangles)
 7. drawPlayer()            — Player + engine flame + shield effect
 8. drawParticles()         — Explosion/effect particles
 9. drawFloatingTexts()     — Score/milestone popup text
10. ctx.restore()           — Restore shake offset
11. drawHUD()               — Top score/HP/wave bar, mobile virtual joystick
12. drawWaveAnnounce()      — "WAVE N" / "WAVE CLEAR" text (if present)
```

---

## 6. Core System Detailed Design

### 6.1 Tween System (Resolves Cycle 1's Biggest Shortcoming)

> **Cycle 1 issue**: Animation not implemented due to setTimeout(160) lock. This time, universal tweening is built from the start.

```javascript
// TweenManager API
class TweenManager {
    tweens = [];  // Active tween list (ObjectPool applied)

    // Create tween
    add(target, props, duration, easing = 'easeOutQuad', onComplete = null) {
        // target: Object to animate
        // props: { x: 100, y: 200, alpha: 0, scale: 1.5 } etc. target values
        // duration: ms
        // easing: Easing function name
        // Start values automatically captured from target's current properties
    }

    update(dt) { /* Progress all active tweens, execute callback on completion then pool.release */ }
    cancelAll(target) { /* Remove all tweens for a specific target */ }
}
```

#### Easing Functions (5 types)

| Name | Formula | Usage |
|------|---------|-------|
| `linear` | `t` | Background scroll, blinking |
| `easeOutQuad` | `1 - (1-t)^2` | Movement, spawn, fade out |
| `easeInQuad` | `t^2` | Accelerated exit |
| `easeOutBack` | `1 + 2.70158×(t-1)^3 + 1.70158×(t-1)^2` | Power-up collect bounce, wave text |
| `easeOutElastic` | `2^(-10t) × sin((t-0.1)×5π) + 1` | Milestone achievement text |

#### Complete Tween Usage List

| Target | Animation | from→to | Duration | Easing |
|--------|-----------|---------|----------|--------|
| Enemy spawn | y, alpha | -50→startY, 0→1 | 400ms | easeOutQuad |
| Enemy explosion | scale, alpha | 1→2, 1→0 | 300ms | easeOutQuad |
| Boss spawn | y | -100 → 70 | 1500ms | easeOutQuad |
| Boss HP 50% pulse | coreAlpha | 0.5→1→0.5 (repeat) | 500ms | linear |
| Boss explosion | flashScale, flashAlpha | 0→3, 1→0 | 600ms | easeOutQuad |
| Power-up collected | scale, alpha | 1→1.5, 1→0 | 250ms | easeOutBack |
| Score popup | y, alpha | y→y-40, 1→0 | 800ms | easeOutQuad |
| Milestone text | scale | 0→1.2→1 | 1500ms | easeOutElastic |
| Wave text | scale, alpha | 0→1, 1→(1s hold)→0 | 2000ms | easeOutBack |
| Screen shake | shakeX, shakeY | ±random(3~6) | 200ms | linear |
| HP bar decrease | displayHP | previous→current | 300ms | easeOutQuad |
| Hit red flash | redOverlayAlpha | 0.25→0 | 150ms | linear |
| Background boss color | bgR, bgG, bgB | default→red tone | 2000ms | easeOutQuad |
| Game over overlay | overlayAlpha | 0→0.8 | 500ms | easeOutQuad |
| Modal spawn | modalScale, modalAlpha | 0.8→1, 0→1 | 300ms | easeOutBack |
| Shield break | shieldAlpha | 0.3→0 | 300ms | easeOutQuad |

### 6.2 Object Pooling System (Cycle 1 Improvement Suggestion Applied)

> **Cycle 1 issue**: Particles created via push({...}) every frame. This time, pooling applied to all major entities.

```javascript
class ObjectPool {
    pool = [];      // Inactive object list
    active = [];    // Active object list

    constructor(createFn, initialSize) {
        this.createFn = createFn;
        for (let i = 0; i < initialSize; i++) this.pool.push(createFn());
    }

    acquire() {
        const obj = this.pool.length > 0 ? this.pool.pop() : this.createFn();
        obj.active = true;
        this.active.push(obj);
        return obj;
    }

    release(obj) {
        obj.active = false;
        const idx = this.active.indexOf(obj);
        if (idx !== -1) this.active.splice(idx, 1);
        this.pool.push(obj);
    }

    update(dt, fn) { // Iterate active in reverse, execute fn(obj, dt), safe for release during iteration
        for (let i = this.active.length - 1; i >= 0; i--) {
            fn(this.active[i], dt, this);
        }
    }

    draw(ctx, fn) { // Iterate active, execute fn(ctx, obj)
        for (const obj of this.active) fn(ctx, obj);
    }
}
```

#### Pool Size Configuration

| Entity | Initial Pool Size | Max Concurrent Active (Est.) |
|--------|------------------|------------------------------|
| Player bullets | 30 | ~20 |
| Enemy bullets | 50 | ~35 |
| Enemies (normal) | 20 | ~12 |
| Power-ups | 5 | ~3 |
| Explosion particles | 80 | ~50 |
| Floating text | 10 | ~5 |
| Tween objects | 40 | ~25 |

### 6.3 Collision Detection (AABB)

```javascript
function checkAABB(a, b) {
    return a.x - a.hw < b.x + b.hw &&
           a.x + a.hw > b.x - b.hw &&
           a.y - a.hh < b.y + b.hh &&
           a.y + a.hh > b.y - b.hh;
}
// hw = halfWidth, hh = halfHeight (center-based AABB)
```

**Collision Matrix**:

| A | B | Result |
|---|---|--------|
| Player bullet | Enemy | Enemy `hp -= 1`, bullet `pool.release`, hit effect (enemy flashAlpha tween) |
| Player bullet | Enemy (HP→0) | Enemy explosion particles, score added, power-up drop chance check |
| Player bullet | Boss | Boss `hp -= 1`, bullet release, HP bar update tween |
| Enemy bullet | Player | If not invincible: HP-1, 1.5s invincibility, hit effects (if shielded, shield breaks) |
| Enemy body | Player | If not invincible: HP-1, enemy instant death+explosion, 1.5s invincibility |
| Power-up | Player | Apply power-up effect, power-up pool.release, collection effect |

- Hitbox size (player): Visual size 40×48 → detection size **24×24** (center-based, generous detection)
- Enemy hitbox: Same as visual size (precise detection)

### 6.4 Canvas-Based Confirmation Modal (Resolves Cycle 1 M3)

> **Cycle 1 issue**: confirm() unusable in iframe. Completely replaced with Canvas modal.

```
┌───────────────────────────────┐
│  Background: rgba(0,0,0,0.7) overlay │
│                               │
│  ┌─────────────────────────┐  │
│  │  #1A1F36 bg, #00E5FF 1px│  │
│  │                         │  │
│  │  Are you sure you want  │  │  16px, #FFFFFF
│  │  to restart?            │  │
│  │                         │  │
│  │  [ Yes ]  [   No   ]   │  │  buttons
│  │                         │  │
│  └─────────────────────────┘  │
│                               │
└───────────────────────────────┘
```

- "Yes" button: `#E74C3C` bg, white text, hover `#FF6B6B`
- "No" button: `#2C3E50` bg, white text, hover `#3D566E`
- Keyboard: `←→` to select (selected button shows glow), `Enter` to confirm, `Esc` = No
- Mouse/touch: Direct click via button area hitTest
- Spawn: tween(modalScale 0.8→1, modalAlpha 0→1, 300ms, easeOutBack)

---

## 7. Power-Up System

### 7.1 Power-Up Types (3 types)

| Power-Up | Internal Letter | Color | Effect | Duration |
|----------|----------------|-------|--------|----------|
| **Weapon Boost** | "W" | `#FFD93D` yellow | Upgrade fire pattern by 1 stage | 8s (resets on consecutive pickup) |
| **HP Recovery** | "+" | `#2ECC71` green | Recover 1 HP (cannot exceed max 5) | Instant |
| **Shield** | "S" | `#3498DB` blue | Nullify 1 hit | Consumed on hit or 10s |

### 7.2 Power-Up Drop Rates

| Enemy Type | Drop Rate | Distribution (W : H : S) |
|------------|-----------|--------------------------|
| Scout | 8% | 50 : 30 : 20 |
| Fighter | 15% | 40 : 35 : 25 |
| Tank | 25% | 35 : 35 : 30 |
| Dart | 5% | 60 : 20 : 20 |
| Boss | 100% | 3 simultaneous: W×1 + H×1 + S×1 |

### 7.3 Weapon Boost Stages

| Stage | Fire Pattern | Fire Interval | Acquisition |
|-------|-------------|---------------|-------------|
| 0 (default) | Single center (1 shot) | 200ms | Initial |
| 1 | Double (symmetrical L/R, 10px apart) | 180ms | W ×1 |
| 2 | Triple (center + L/R ±15° spread, 3 shots) | 160ms | W ×2 consecutive |
| 3 (MAX) | Triple + 1 rear shot (180°) | 150ms | W ×3 consecutive |

- Bullet speed: `600px/s` (same for all stages)
- Additional W pickup within 8s: stage↑ + timer reset
- No pickup for 8s: returns to stage 0 (tween fadeOut effect)

### 7.4 Power-Up Physics

- Fall speed: `60px/s` (constant)
- Lateral float: `x += sin(time × 3) × 0.5`
- Outer rotating ring: Dashed circle rotates at `2rad/s`
- pool.release when exiting bottom of screen

---

## 8. Difficulty System

### 8.1 Wave Difficulty Table

| Wave | Enemy Composition | Enemy Speed Multiplier | Enemy Fire Interval Multiplier | Max Concurrent Enemies |
|------|-------------------|:---------------------:|:----------------------------:|:--------------------:|
| 1~2 | Scout only | ×1.0 | — | 4 |
| 3~4 | Scout + Fighter | ×1.0 | ×1.0 | 6 |
| 5 (Boss) | Boss (HP 40) + 2 Scouts | — | — | 3 |
| 6~7 | Scout + Fighter + Tank | ×1.1 | ×0.95 | 7 |
| 8~9 | All types (Dart appears) | ×1.2 | ×0.9 | 8 |
| 10 (Boss) | Boss (HP 80) + 2 Fighters | — | — | 3 |
| 11~14 | All types | ×1.3 | ×0.85 | 10 |
| 15 (Boss) | Boss (HP 120) + 2 Tanks + 3 Darts | — | — | 6 |
| 16+ | **Formula applied** | **Formula** | **Formula** | 12 (cap) |

### 8.2 Wave 16+ Scaling Formulas

```
Enemy speed multiplier = min(1.0 + (wave - 1) × 0.05, 2.5)
Enemy fire interval multiplier = max(1.0 - (wave - 1) × 0.02, 0.5)
Enemies per wave = min(4 + floor(wave × 0.8), 12)
Boss HP = wave × 8
Enemy bullet speed = 120 + min(wave × 3, 80) px/s
```

### 8.3 Balance Timeline

```
Time     Wave     Description
0:00     1~2      Tutorial. Scouts only. Learn controls
0:30     3~4      Dodge+attack simultaneously. Fighter single shots appear
1:30     5        ★ First boss! Peak achievement moment
2:00     6~7      Tank appears. Learn spread shot evasion
3:00     8~9      Dart (kamikaze) appears. Reflex test
4:00     10       ★ Second boss (enhanced). Fighter escorts
5:00+    11~14    Expert zone. Power-up route optimization
7:00+    15       ★ Third boss (Tank+Dart escorts). Peak difficulty
8:00+    16+      Infinite scaling. High score challenge
```

- **Target play time**: Average 3~5 minutes (waves 5~8), skilled 7~10 minutes (wave 15+)

### 8.4 Perceived Difficulty Curve

```
Difficulty ▲
       │                          ┌────── Scaling maintained (wave 20+)
       │                     ┌────┘
       │                ┌────┘
       │           ★────┘  ← Spike at each boss then slight relaxation
       │      ★────┘
       │ ★────┘
       │─┘  ← Easy first 30s~1min
       └──────────────────────────────── Wave →
         1   5   10   15   20
```

---

## 9. Scoring System

### 9.1 Base Score Table

| Item | Score |
|------|------:|
| Scout destroyed | 100 |
| Fighter destroyed | 200 |
| Tank destroyed | 350 |
| Dart destroyed | 150 |
| Boss destroyed | 1000 × stage number |
| Wave clear bonus | wave × 50 |
| No-hit wave bonus | +500 |
| Power-up collected | +50 |

### 9.2 Combo System

```
Consecutive kills within 1 second → combo count increases
Combo multiplier = 1.0 + floor(combo / 5) × 0.5   (max ×3.0)
No kill for 1 second → combo resets
```

- Combo HUD display: "COMBO ×{n}!" (`#FFD93D`, 14px bold)
- At combo 5: text scaleX pulse tween (1→1.3→1, 200ms)
- Score = base score × combo multiplier (rounded down)

### 9.3 Score Milestone Notifications

| Score | Message | Color |
|-------|---------|-------|
| 1,000 | "Space Recruit!" | `#5DADE2` |
| 5,000 | "Pilot Promoted!" | `#2ECC71` |
| 15,000 | "Ace Pilot!" | `#F39C12` |
| 30,000 | "Star Guardian!" | `#FFD93D` |
| 50,000 | "Legend of the Galaxy!" | `#E74C3C` |

- On milestone: Text at screen center (tween scale 0→1.2→1, easeOutElastic, displayed 1.5s then fadeOut)

### 9.4 Best Record Storage

```javascript
const STORAGE_KEY_SCORE = 'starGuardian_bestScore';
const STORAGE_KEY_WAVE  = 'starGuardian_bestWave';

function saveHighScore(score, wave) {
    try {
        const bestScore = parseInt(localStorage.getItem(STORAGE_KEY_SCORE) || '0');
        const bestWave  = parseInt(localStorage.getItem(STORAGE_KEY_WAVE)  || '0');
        if (score > bestScore) localStorage.setItem(STORAGE_KEY_SCORE, score);
        if (wave  > bestWave)  localStorage.setItem(STORAGE_KEY_WAVE,  wave);
    } catch(e) { /* iframe sandbox fallback — silently ignore */ }
}
```

- Title screen: "BEST: 12,500 / WAVE 8" (if exists)
- Game over screen: Final score vs best record comparison + "NEW BEST!" effect

---

## 10. HUD Layout

### 10.1 Desktop Layout

```
┌─────────────────────────────────────────┐
│ ♥♥♥♡♡  SCORE: 12,450   WAVE: 7  ⏸    │  ← Top HUD (height 36px, bg rgba(0,0,0,0.5))
│ [■■■□] W2    COMBO ×2.0!               │  ← Weapon level+shield+combo (height 20px)
├─────────────────────────────────────────┤
│                                         │
│              (Game Area)                │
│                                         │
│                                         │
│                                         │
│                                         │
│                        HI: 25,000       │  ← Bottom-right translucent
└─────────────────────────────────────────┘
```

### 10.2 Mobile Layout

```
┌─────────────────────────────────────────┐
│ ♥♥♥  SCORE: 12,450   WAVE: 7    [⏸]  │
│ W2  COMBO ×2.0!                        │
├─────────────────────────────────────────┤
│                                         │
│              (Game Area)                │
│                                         │
│                                         │
│  ◎───╮                                  │  ← Virtual joystick (bottom-left)
│      │                     HI: 25,000   │
└─────────────────────────────────────────┘
```

### 10.3 HUD Text Styles

| Element | Font | Size | Color | Alignment |
|---------|------|------|-------|-----------|
| SCORE | bold | 16px | `#FFFFFF` | Center |
| WAVE | normal | 14px | `#00E5FF` | Right |
| HP heart (filled) | — | 14px | `#E74C3C` | Left |
| HP heart (empty) | — | 14px | `#3D1F1F` | Left |
| Weapon level | bold | 12px | `#FFD93D` | Left |
| Combo | bold | 14px | `#FFD93D` | Left |
| HI-SCORE | normal | 12px | `rgba(255,255,255,0.3)` | Bottom-right |
| Pause icon | — | 20px | `#FFFFFF` | Top-right |

- Font stack: `'Segoe UI', system-ui, -apple-system, sans-serif` (**zero external fonts**)
- HP heart: Heart shape drawn with Canvas `beginPath` + `bezierCurveTo`

---

## 11. Title / Game Over / Pause Screens

### 11.1 Title Screen

```
┌───────────────────────────────────┐
│           (Star background animation) │
│                                   │
│        ★ STAR GUARDIAN ★          │  28px bold, #00E5FF, glow
│                                   │
│       BEST: 12,500 / WAVE 8      │  14px, #FFD93D (when record exists)
│                                   │
│      [ ▶ PRESS ENTER TO START ]   │  16px, alpha blink (sin-based)
│                                   │
│   🎮 Arrow/WASD Move | SPACE Fire │  12px, #8892A0
│   📱 Touch to Move | Auto-fire    │  12px, #8892A0
│                                   │
└───────────────────────────────────┘
```

### 11.2 Game Over Screen (Canvas Modal)

```
┌───────────────────────────────────┐
│  bg: rgba(0,0,0,0.7) overlay      │
│                                   │
│        GAME OVER                  │  32px bold, #FF4757, tween scaleUp
│                                   │
│    SCORE:  12,450                 │  22px, #FFFFFF
│    WAVE:   7                      │  18px, #00E5FF
│    BEST:   25,000                 │  18px, #FFD93D
│                                   │
│    (NEW BEST! — on new record)    │  16px, #FFD93D, blink
│                                   │
│      [ ▶ RETRY ]                  │  Canvas button, #00E5FF bg
│      [   TITLE  ]                 │  Canvas button, #2C3E50 bg
│                                   │
└───────────────────────────────────┘
```

- Spawn: tween(overlayAlpha 0→0.7, 500ms) + tween(textScale 0→1, 400ms, easeOutBack)
- Buttons: Canvas rect + text, brightness +20% on mouse hover, click/touch hitTest

### 11.3 Pause Screen

```
┌───────────────────────────────────┐
│  bg: rgba(0,0,0,0.6) overlay      │
│                                   │
│         ⏸ PAUSED                  │  24px bold, #FFFFFF
│                                   │
│       [ ▶ RESUME ]                │
│       [ ↺ RESTART ]               │  → Enters CONFIRM_MODAL
│       [   TITLE   ]               │
│                                   │
└───────────────────────────────────┘
```

### 11.4 Restart Confirmation Modal (Complete Resolution of Cycle 1 M3)

```
┌───────────────────────────────┐
│  bg: rgba(0,0,0,0.7)          │
│  ┌─────────────────────────┐  │
│  │  #1A1F36 bg, #00E5FF 1px│  │
│  │                         │  │
│  │  Are you sure you want  │  │  16px, #FFFFFF
│  │  to restart?            │  │
│  │                         │  │
│  │  [ Yes ]  [   No   ]   │  │
│  │  #E74C3C    #2C3E50     │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

- Keyboard: `←→` to select, `Enter` to confirm, `Esc` = No
- Selected button: Glow effect shown (`shadowBlur: 8`)
- Enter/exit: tween(scale 0.8→1, alpha 0→1, 300ms, easeOutBack)

---

## 12. Player Details

### 12.1 Base Stats

| Item | Value |
|------|-------|
| Initial HP | 3 |
| Max HP | 5 |
| Movement speed | `300px/s` (normalized on diagonal movement) |
| Hit invincibility time | 1.5 seconds |
| Hitbox | Center-based `24×24px` (smaller than visual 40×48 = generous detection) |
| Visual size | `40×48px` |

### 12.2 Hit Sequence
1. If shield exists → Shield break effect (8 blue particles) + no HP loss
2. If no shield:
   - HP -= 1
   - Red overlay flash (`rgba(255,0,0,0.25)`, tween 150ms)
   - Screen shake (±4px, tween 200ms)
   - 1.5s invincibility (player alpha `sin(time×20) × 0.5 + 0.5` blink)
   - Weapon stage drops 1 level (minimum 0)
3. HP <= 0 → GAMEOVER transition

### 12.3 Shield Effect
- When active: Translucent circle around player (`#3498DB`, alpha 0.3, radius 28px)
- Under 3 seconds remaining: alpha blink (warning)
- On break: tween(shieldAlpha 0.3→0, 300ms) + 8 blue particles radiate

---

## 13. Technical Implementation Guide

### 13.1 File Structure
```
/games/star-guardian/index.html   ← Single file, everything included (~1,200 lines estimated)
```

> **No asset folder** — All graphics are Canvas code-rendered. Thumbnails generated separately.

### 13.2 Tech Stack
- **HTML5 Canvas** — Single canvas, game rendering
- **Vanilla JavaScript** — Game logic (zero frameworks/libraries)
- **System fonts only** — `'Segoe UI', system-ui, -apple-system, sans-serif`
- **localStorage** — Best record storage (try-catch required)
- **Zero external CDN/asset dependencies** — Fully self-contained single HTML

### 13.3 Responsive Design
- Game coordinate system: **480×720** fixed (optimal 2:3 ratio for vertical scrollers)
- Canvas CSS size: `min(viewportW - 20, 480)` × `min(viewportH - 20, 720)`
- DPR support: `canvas.width = cssWidth × dpr`, `canvas.height = cssHeight × dpr`, `ctx.scale(dpr, dpr)`
- Readjusted on `window.resize` + `orientationchange` events
- All game logic operates in 480×720 coordinate system, scaling automatically applied during rendering

### 13.4 Performance Goals
| Item | Target |
|------|--------|
| FPS | Stable 60fps |
| Initial loading | Under 0.3 seconds (zero external assets) |
| File size | Under 40KB (before gzip) |
| GC pressure | Minimized via object pooling |

### 13.5 Estimated Code Size

| Module | Est. Lines |
|--------|----------:|
| HTML/CSS shell | ~30 |
| Constants/settings/colors | ~100 |
| TweenManager + easing functions | ~70 |
| ObjectPool | ~45 |
| Input handling (keyboard/mouse/touch/joystick) | ~120 |
| Player logic + fire patterns | ~90 |
| Enemy AI + boss patterns + wave manager | ~180 |
| Collision detection | ~50 |
| Power-up system | ~60 |
| Rendering (background/objects/effects/HUD) | ~270 |
| UI screens (title/game over/pause/modal) | ~100 |
| Game loop + state machine | ~60 |
| Utilities (lerp, clamp, normalize, etc.) | ~25 |
| **Total** | **~1,200 lines** |

---

## 14. Sidebar / Card Metadata

### 14.1 game-registry.json Entry

```json
{
  "id": "star-guardian",
  "title": "Star Guardian",
  "description": "Become a space fighter pilot defending the universe against endless enemy waves! Collect power-ups to boost your firepower and take on massive bosses in this neon shooting game.",
  "genre": ["arcade", "action"],
  "thumbnail": "/games/star-guardian/thumbnail.png",
  "path": "/games/star-guardian/index.html",
  "addedAt": "2026-03-20T09:00:00Z",
  "featured": true,
  "playCount": 0,
  "rating": 0,
  "tags": ["shooting", "arcade", "space", "boss battle", "power-up", "neon"],
  "controls": [
    "Arrow Keys/WASD: Move",
    "Space/Z: Fire",
    "P/Esc: Pause",
    "Mouse: Move + Left Click Fire",
    "Touch: Virtual Joystick + Auto-fire",
    "R: Restart (with confirmation)"
  ],
  "difficulty": "medium",
  "version": "1.0.0"
}
```

### 14.2 Game Page Sidebar Fields

```yaml
game:
  title: "Star Guardian"
  description: "Become a space fighter pilot defending the universe against endless enemy waves! Collect power-ups to boost your firepower and take on massive bosses in this neon shooting game."
  genre: ["arcade", "action"]
  playCount: 0
  rating: 0
  controls:
    - "Arrow Keys/WASD: Move"
    - "Space/Z: Fire"
    - "P/Esc: Pause"
    - "Mouse: Move + Left Click Fire"
    - "Touch: Virtual Joystick + Auto-fire"
    - "R: Restart (with confirmation)"
  tags:
    - "#shooting"
    - "#arcade"
    - "#space"
    - "#bossbattle"
    - "#powerup"
    - "#neon"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

---

## 15. Post-Implementation Verification Checklist

### Cycle 1 Mistake Prevention (Required Verification)

- [ ] **[M1]** Zero external CDN calls (including Google Fonts)?
- [ ] **[M2]** No unused assets in ASSET_MAP/preload list?
- [ ] **[M3]** Zero confirm()/alert()/prompt() calls?
- [ ] **[M3]** Canvas confirmation modal implemented for R key restart?
- [ ] **[M4]** No use of setTimeout/setInterval as animation substitute?
- [ ] **[M4]** All visual transitions handled through TweenManager?

### New Technology Verification

- [ ] TweenManager operates independently and is used in at least 10 animations?
- [ ] ObjectPool applied to 6 entity types: bullets/enemies/particles/text/tween?
- [ ] AABB collision detection covers all 4 collision matrix types?
- [ ] Keyboard simultaneous input (diagonal movement + fire) works correctly?
- [ ] Touch virtual joystick works correctly with auto-fire enabled?
- [ ] 3-layer parallax background renders without glitches at 60fps?
- [ ] Boss 3-phase attack pattern cycles correctly?
- [ ] DPR support applied for sharp rendering on high-resolution devices?
- [ ] localStorage try-catch applied for iframe sandbox safety?
- [ ] Game state machine 6-state (LOADING/TITLE/PLAYING/PAUSE/CONFIRM_MODAL/GAMEOVER) transitions work correctly?

---

## 16. Cycle 1 → Cycle 2 Improvement Summary

| # | Cycle 1 Issue | Cycle 2 Resolution | Design Doc Section |
|---|---------------|-------------------|-------------------|
| M1 | Google Fonts external dependency | System fonts only, zero external CDN | §13.2 |
| M2 | 3 unused assets remaining | Game-specific assets only + code rendering default + checklist | §15 |
| M3 | R key confirm() unavailable | Canvas confirmation modal (CONFIRM_MODAL state) | §6.4, §11.4 |
| M4 | Movement animation not implemented | TweenManager built-in from start, 16+ usage points specified | §6.1 |
| Suggestion 1 | Universal tween system | lerp + 5 easing types, TweenManager class | §6.1 |
| Suggestion 2 | Arcade/action challenge | Vertical shooter — real-time input/collision/frame loop | Entire doc |
| Suggestion 3 | Object pooling | ObjectPool class, 7 entity types pooled | §6.2 |
| Suggestion 4 | Asset template cleanup | Asset folder itself unnecessary (100% code rendering) | §13.1 |
