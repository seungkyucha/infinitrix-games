---
game-id: mini-tower-defense
title: Mini Tower Defense
genre: strategy
difficulty: medium
---

# Mini Tower Defense — Detailed Game Design Document

> **Cycle:** 3
> **Date:** 2026-03-20
> **Designer:** Claude (Game Designer)
> **Reference:** Based on `docs/analytics/cycle-3-report.md` analysis report

---

## 0. Previous Cycle Feedback Integration

> Issues and suggestions from the Cycle 2 "Star Guardian" post-mortem are **explicitly** incorporated.

### 0-1. Cycle 2 Issue Resolution Mapping

| Cycle 2 Issue / Suggestion | Severity | Cycle 3 Response |
|---------------------------|----------|-----------------|
| **[B1/B2] Tween not updated during CONFIRM_MODAL/PAUSE** — Modal stuck at alpha=0 | CRITICAL | → **§8 State × System Matrix** pre-defined in design doc. Explicitly specifies whether tweens update in every state, with dual assurance via code header comments |
| **[B3] setTimeout(600) for game over transition** — Flagged in C1, recurred in C2 | MAJOR | → **Complete setTimeout ban**. All state transitions via tween onComplete callbacks. Every transition in the design doc includes tween specification |
| **[B4] NEW BEST check order error** — Comparing after saveBest() always returns false | MAJOR | → **"Check first, save later"** rule specified in §7 scoring system. Order fixed: `isNewBest = score > getBest()` → `saveBest(score)` |
| **[B5] SVG feGaussianBlur background rectangle visible** | MINOR | → **No SVG filters at all**. All assets created via pure Canvas Path2D drawing |
| Event listener cleanup not implemented (C2 unresolved) | Suggestion | → **game.destroy()** pattern standardized. Every addEventListener gets a corresponding removeEventListener in destroy() |
| easeOutElastic missing (C2 unresolved) | Suggestion | → **Complete implementation of 5 easing functions**: linear, easeOutQuad, easeInQuad, easeOutBack, easeOutElastic |
| Try strategy/simulation genre | Suggestion | → **Tower Defense (strategy)** genre selected. 5 of top 7 strategy games on CrazyGames are TD |
| Experiment with procedural sound (Web Audio API) | Suggestion | → **4 sound effects via Web Audio API** (tower attack, enemy kill, wave start, game over). Maintaining zero external assets principle |

### 0-2. Verified Patterns from platform-wisdom.md

| Success Pattern | Application |
|----------------|-------------|
| Single HTML + Canvas + Vanilla JS | Same architecture maintained |
| Game state machine | LOADING → TITLE → WAVE_PREP → PLAYING → PAUSE → CONFIRM_MODAL → GAMEOVER (7 states) |
| DPR support (Canvas internal resolution ≠ CSS) | Same applied |
| localStorage try-catch | Same applied (iframe sandbox support) |
| TweenManager + ObjectPool reuse | Adopted as core infrastructure (5 easing functions fully implemented) |
| HEX codes/formulas in design doc | All values/formulas/color codes specified (target 95% implementation fidelity) |
| Canvas-based modal (confirm/alert banned) | All confirmation UI implemented as Canvas modals |
| Generous hitboxes | +8px tolerance applied to tower range detection |
| Code fallback rendering | 100% Canvas drawing fallback guaranteed on asset load failure |

---

## 1. Game Overview & Core Fun Elements

### Concept
A classic tower defense game set in a fantasy world where players **strategically place towers on an 8×6 grid to defend against enemy waves traveling along a fixed path**. 3 tower types (Archer, Mage, Cannon) × 3 upgrade levels, wave-based difficulty scaling, and a gold economy system provide strategic choices of "where to invest what and how much."

### Core Fun Elements
1. **Strategic placement satisfaction** — Puzzle-like fun of optimizing tower combinations and positions with limited gold
2. **Gradual power growth** — Growth fantasy of upgrading towers with wave clear rewards and getting stronger
3. **Clutch defense achievement** — The thrill of barely stopping enemies just as they're about to break through
4. **Tower combo synergy** — Complementary strategies with Archer (fast single) / Mage (AoE slow) / Cannon (slow explosion)
5. **Short, focused sessions** — 5~10 minutes per game. Ends at 20-wave clear or lives depleted

---

## 2. Game Rules & Objectives

### 2.1 Basic Rules
- **Fixed-path tower defense** — Enemies travel along a predetermined S-shaped path from the left entrance to the right exit
- Players place **towers on empty tiles** (not on the path) to attack passing enemies
- Each tower **automatically attacks the frontmost enemy** within range (Targeting: First)
- When an enemy reaches the exit, **1 life is lost** (starting lives: 20)
- When lives reach 0, **game over**
- **Complete 20 waves** for victory — Remaining lives × 50 bonus score

### 2.2 Economy System
- **Starting gold:** 100G
- **Enemy kill reward:** Varies by enemy type (see §2.4)
- **Wave clear bonus:** `20 + wave × 5` G
- **Tower sell:** Returns **60%** of total invested cost (purchase + upgrades)
- When gold is insufficient, tower placement/upgrade **disabled** (UI grayed out + shake tween feedback)

### 2.3 Towers (3 Types × 3 Levels)

#### Archer Tower — Fast Single Target
| Level | Cost | Damage | Range | Attack Speed | Color |
|-------|------|--------|-------|-------------|-------|
| Lv.1 | 25G | 8 | 90px | 600ms | `#4CAF50` (green) |
| Lv.2 | 30G | 15 | 100px | 500ms | `#66BB6A` |
| Lv.3 | 50G | 25 | 115px | 400ms | `#81C784` |

- **Projectile:** Fast arrow (`600px/s`), single target
- **Trait:** Cheapest and fastest. Early game staple. Fire rate increases with upgrades

#### Mage Tower — AoE Slow
| Level | Cost | Damage | Range | Attack Speed | Slow Rate | Color |
|-------|------|--------|-------|-------------|-----------|-------|
| Lv.1 | 50G | 12 | 80px | 1000ms | 30% | `#7E57C2` (purple) |
| Lv.2 | 40G | 22 | 90px | 900ms | 40% | `#9575CD` |
| Lv.3 | 65G | 35 | 100px | 800ms | 50% | `#B39DDB` |

- **Projectile:** Magic orb (`400px/s`), on hit **30px radius AoE damage + 1.5s slow**
- **Trait:** Slows enemy groups, buying DPS time for other towers. Key combo tower

#### Cannon Tower — Explosive AoE
| Level | Cost | Damage | Range | Attack Speed | Blast Radius | Color |
|-------|------|--------|-------|-------------|-------------|-------|
| Lv.1 | 75G | 25 | 85px | 1500ms | 35px | `#EF5350` (red) |
| Lv.2 | 55G | 45 | 95px | 1300ms | 40px | `#E57373` |
| Lv.3 | 80G | 70 | 105px | 1100ms | 50px | `#EF9A9A` |

- **Projectile:** Cannonball (`300px/s`), parabolic trajectory (visual), **blast radius AoE damage** on impact
- **Trait:** Most expensive and slowest but maximum efficiency against clustered enemies. Late-game core

### 2.4 Enemy Types (4 types)

| Enemy Type | Color | HP | Speed | Kill Reward | First Wave | Special |
|------------|-------|-----|-------|-------------|------------|---------|
| **Goblin** | `#8BC34A` | 20 | 40px/s | 5G | 1+ | None |
| **Orc** | `#FF9800` | 60 | 30px/s | 12G | 4+ | None |
| **Dark Knight** | `#546E7A` | 120 | 25px/s | 20G | 8+ | Armor 3 (damage = max(1, dmg - 3)) |
| **Speed Runner** | `#E040FB` | 30 | 70px/s | 15G | 6+ | 50% reduced slow effect |

- All enemies **visual size: 24×24px**, **hitbox: 20×20px** (generous detection)
- On kill: **8 burst particles** + **gold popup text** (+5G etc.) tween fadeUp

### 2.5 Wave System (20 Waves)

```
Wave N enemy count: min(20, 5 + N × 1.5) (rounded)
Enemy spawn interval: max(500, 2000 - N × 80) ms
Enemy HP multiplier: 1 + (N - 1) × 0.12
```

| Wave | Enemy Composition | Notes |
|------|-------------------|-------|
| 1~3 | Goblin 100% | Introduction phase, learn archer tower |
| 4~5 | Goblin 70% + Orc 30% | Orc first appears, mage tower needed |
| 6~7 | Goblin 40% + Orc 30% + Runner 30% | Runner first appears, fast enemy response |
| 8~10 | Goblin 20% + Orc 30% + Dark Knight 20% + Runner 30% | Dark Knight appears, cannon needed |
| 11~15 | Goblin 10% + Orc 30% + Dark Knight 30% + Runner 30% | Full mix, upgrades essential |
| 16~19 | Orc 25% + Dark Knight 40% + Runner 35% | High difficulty, optimal placement required |
| 20 | Dark Knight 50% + Runner 50% (HP ×2.0) | **Final wave** — Elite enemies, victory challenge |

---

## 3. Controls

### 3.1 Mouse (PC Default)
| Input | Action |
|-------|--------|
| **Left click empty tile** | Open tower purchase menu (3 tower type icons shown) |
| **Left click tower icon** | Place that tower (gold deducted) |
| **Left click existing tower** | Open tower info panel (upgrade/sell buttons) |
| **Right click / ESC** | Close menu/panel |
| **P key** | Pause toggle |
| **Space** | Early wave start (in WAVE_PREP state) |

### 3.2 Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `1` | Select Archer tower (after clicking empty tile) |
| `2` | Select Mage tower |
| `3` | Select Cannon tower |
| `U` | Upgrade selected tower |
| `S` | Sell selected tower |
| `R` | Restart on game over (Canvas modal confirmation) |
| `P` / `ESC` | Pause toggle |

### 3.3 Touch (Mobile)
| Input | Action |
|-------|--------|
| **Tap empty tile** | Open tower purchase menu |
| **Tap tower icon** | Place that tower |
| **Tap existing tower** | Open tower info panel |
| **Tap empty area** | Close menu/panel |
| **Pause button (top-right)** | Pause toggle |
| **Wave start button** | Early start in WAVE_PREP |

> **Auto-detect input mode**: Input mode (mouse/touch) is automatically set based on first input. Switches immediately on input change. In touch mode, hover preview is hidden and button sizes are 1.5x enlarged.

---

## 4. Visual Style Guide

### 4.1 Color Palette

| Usage | HEX | Description |
|-------|-----|-------------|
| **Background (grass)** | `#2E7D32` | Dark green base tile |
| **Path** | `#5D4037` | Brown dirt road |
| **Path border** | `#795548` | Light brown path edge |
| **Grid lines** | `#388E3C` (20% alpha) | Subtle grid |
| **UI background** | `#1B2631` (85% alpha) | Semi-transparent dark |
| **UI text** | `#ECF0F1` | Light gray |
| **Gold text** | `#FFD700` | Gold highlight |
| **Lives text** | `#E74C3C` | Red heart |
| **Wave text** | `#F39C12` | Orange highlight |
| **Placeable highlight** | `#FFFFFF` (20% alpha) | Brightens on hover |
| **Range indicator** | `#FFFFFF` (15% alpha) | Circle on tower selection |
| **Archer series** | `#4CAF50` → `#81C784` | Green (brightens per level) |
| **Mage series** | `#7E57C2` → `#B39DDB` | Purple (brightens per level) |
| **Cannon series** | `#EF5350` → `#EF9A9A` | Red (brightens per level) |
| **Goblin** | `#8BC34A` | Light green |
| **Orc** | `#FF9800` | Orange |
| **Dark Knight** | `#546E7A` | Blue-gray |
| **Speed Runner** | `#E040FB` | Pink |

### 4.2 Background
- **8 columns × 6 rows grid** (each tile `64×64px`, total game area `512×384px`)
- Top HUD bar: height `40px` (wave, gold, lives display)
- Bottom tower purchase bar: height `48px` (3 tower types + cost display)
- **Total canvas size:** `512 × 472px` (384 + 40 + 48)
- Grass tiles: `#2E7D32` base with random `#388E3C` dots (3~5 per tile) for texture
- Path tiles: `#5D4037` base with `#795548` dashed border

### 4.3 Object Shapes (Pure Canvas Drawing — No SVG Filters)

| Object | Drawing Method |
|--------|---------------|
| **Archer Tower** | Green square base + top triangle roof + bow arc |
| **Mage Tower** | Purple cylinder base + pointed triangle top + glowing orb (translucent circle) |
| **Cannon Tower** | Red square base + barrel (thick line) + wheels (2 small circles) |
| **Goblin** | Light green circle + pointed ears (2 triangles) + eyes (2 white dots) |
| **Orc** | Orange large circle + small eyes (2 white dots) + jaw (arc) |
| **Dark Knight** | Blue-gray square (shield) + top triangle (helmet) + small sword (line) |
| **Speed Runner** | Pink diamond + speed lines (3 short lines behind) |
| **Projectile (arrow)** | 8px line + tip (small triangle) |
| **Projectile (magic)** | 4px radius circle + glow (translucent larger circle) |
| **Projectile (cannonball)** | 5px radius circle + parabolic shadow |
| **Explosion effect** | Expanding + fading circle (tween scaleUp + fadeOut) |
| **Slow effect** | Blue translucent circle shrinking around enemy (tween) |

### 4.4 Font
- **System font stack only** (zero external CDN dependencies):
  ```
  'Segoe UI', system-ui, -apple-system, sans-serif
  ```
- HUD text: `14px bold`
- Wave title: `32px bold`
- Gold popup: `12px bold`
- Menu/modal: `16px`

---

## 5. Core Game Loop (Frame-Based Logic Flow)

### 5.1 Main Loop (`requestAnimationFrame`)

```
function loop(timestamp) {
  const dt = min((timestamp - lastTime) / 1000, 0.05);  // Max 50ms cap
  lastTime = timestamp;

  switch (state) {
    case LOADING:     updateLoading();                    break;
    case TITLE:       tw.update(dt); renderTitle();       break;
    case WAVE_PREP:   tw.update(dt); renderGame(); renderWavePrep(); break;
    case PLAYING:     updateGame(dt); tw.update(dt); renderGame(); break;
    case PAUSE:       tw.update(dt); renderGame(); renderPause(); break;
    case CONFIRM_MODAL: tw.update(dt); renderGame(); renderModal(); break;
    case GAMEOVER:    tw.update(dt); renderGame(); renderGameover(); break;
  }

  requestAnimationFrame(loop);
}
```

### 5.2 updateGame(dt) Detailed Flow

```
1. WaveManager.update(dt)
   → Check spawn timer → Create enemies (ObjectPool.acquire)
   → Check wave completion → state = WAVE_PREP transition (tween onComplete)

2. Enemies.forEach(enemy => {
   → enemy.moveAlongPath(dt)          // Move along path waypoints
   → enemy.updateSlowEffect(dt)       // Decrease slow timer
   → if (enemy.reachedExit) { lives--; pool.release(enemy); }
   → if (enemy.hp <= 0) { gold += reward; spawnDeathFX(); pool.release(enemy); }
   })

3. Towers.forEach(tower => {
   → tower.updateCooldown(dt)
   → tower.findTarget(enemies)        // Frontmost enemy within range
   → if (target && ready) tower.fire() // Create projectile (ObjectPool.acquire)
   })

4. Projectiles.forEach(proj => {
   → proj.moveToward(target, dt)
   → if (proj.hitTarget()) { applyDamage(); spawnHitFX(); pool.release(proj); }
   })

5. Particles.update(dt)               // Update visual effects

6. checkGameOver()
   → if (lives <= 0) { state = GAMEOVER; ... }
```

### 5.3 Rendering Order (Z-order)

```
1. Background (grass + path)        — Cached offscreen canvas
2. Grid lines                       — Placeable tile highlights
3. Range indicator                  — Selected tower's circular range
4. Enemies (on path)                — Including HP bars
5. Towers                           — Visual differences per level
6. Projectiles                      — Arrow/magic/cannonball
7. Particles/effects                — Explosions, slow, gold popups
8. HUD (top)                        — Wave, gold, lives
9. Tower purchase bar (bottom)      — 3 tower buttons
10. Tower info panel                — Upgrade/sell (when selected)
11. Overlay (wave text/modal)       — On semi-transparent background
```

---

## 6. Difficulty System

### 6.1 Wave-Based Difficulty Scaling

| Parameter | Formula | Wave 1 | Wave 10 | Wave 20 |
|-----------|---------|--------|---------|---------|
| Enemy count | `min(20, floor(5 + N × 1.5))` | 6 | 20 | 20 |
| Spawn interval | `max(500, 2000 - N × 80)` ms | 1920ms | 1200ms | 500ms |
| Enemy HP multiplier | `1 + (N - 1) × 0.12` | ×1.00 | ×2.08 | ×3.28 |
| Wave bonus | `20 + N × 5` G | 25G | 70G | 120G |

### 6.2 Dynamic Balance Adjustment
- **3 consecutive waves cleared with no life loss** → Next wave enemy HP multiplier `+0.15` (veteran challenge)
- **Lives at 5 or below** → Enemy kill gold reward `×1.3` (rescue mechanic, UI shows "Crisis Bonus!")

### 6.3 Path Design (S-Shaped Fixed Path)

```
Map coordinates (col, row) — 0-indexed, 8×6 grid

Entrance: (-1, 1) → (0,1) → (1,1) → (2,1) → (3,1) → (4,1) → (5,1)
                                                              ↓
Actual S-shape:
  (0,1)→(5,1)↓(5,2)→(5,3)←(0,3)↓(0,4)→(5,4)↓(5,5)→Exit(8,5)

Detailed waypoints (tile center coordinates):
  START → (0,1) → (5,1) → (5,3) → (0,3) → (0,4) → (5,4) → (7,4) → EXIT

Path tile list:
  Row 1: col 0~5  (moving right)
  Col 5: row 1~3  (moving down)
  Row 3: col 5~0  (moving left)
  Col 0: row 3~4  (moving down)
  Row 4: col 0~7  (moving right → exit)
```

> Path tiles are pre-calculated as a `PATH_TILES[]` array at game start. Marked as non-placeable tiles.
> Enemies follow waypoint array in order, changing direction upon reaching each waypoint.

---

## 7. Scoring System

### 7.1 Score Acquisition

| Action | Score |
|--------|-------|
| Goblin kill | 50 pts |
| Orc kill | 120 pts |
| Dark Knight kill | 200 pts |
| Speed Runner kill | 150 pts |
| Wave clear bonus | `wave × 100` pts |
| Victory bonus (20 waves cleared) | `remaining lives × 500` pts |
| Wave cleared without tower upgrades | `+200` pts (minimalist bonus) |

### 7.2 Best Score Processing Order (B4 Lesson Applied)

```javascript
// ⚠️ Must follow this order — "Check first, save later"
const isNewBest = score > getBest();     // 1. Check
saveBest(score);                          // 2. Save
if (isNewBest) showNewBestEffect();       // 3. Effect
```

### 7.3 localStorage Keys
- `mtd_bestScore` — Best score
- `mtd_bestWave` — Best wave reached
- All access wrapped in `try { ... } catch(e) { /* silent */ }`

---

## 8. State × System Update Matrix ⭐

> **Root cause fix for Cycle 2 B1/B2.** This matrix should also be copied as a code header comment.

| Game State | TweenMgr | WaveMgr | Enemies | Towers | Projectiles | Particles | Input | Render | SFX |
|-----------|----------|---------|---------|--------|-------------|-----------|-------|--------|-----|
| **LOADING** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | loading screen | ✗ |
| **TITLE** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | start only | title screen | ✗ |
| **WAVE_PREP** | **✓** | ✗ | ✗ | ✗ | ✗ | **✓** | place+start | game+prep UI | ✗ |
| **PLAYING** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | place+pause | game | **✓** |
| **PAUSE** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | resume only | game+pause overlay | ✗ |
| **CONFIRM_MODAL** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | yes/no | game+modal overlay | ✗ |
| **GAMEOVER** | **✓** | ✗ | ✗ | ✗ | ✗ | **✓** | restart only | game+result screen | ✗ |

> **Core rule:** TweenManager is **always updated in every state**. This is because UI animations (modal fade-in, text scale, etc.) must function in any state.

---

## 9. State Transition Flow (Complete setTimeout Ban)

```
LOADING ──(asset load complete)──→ TITLE
                              │
TITLE ──(click/tap/Space)──→ WAVE_PREP
                              │
WAVE_PREP ──(Space/tap or 3s tween countdown onComplete)──→ PLAYING
                              │
PLAYING ──(all wave enemies eliminated)──→ WAVE_PREP (tween: "WAVE CLEAR!" 1.5s fadeOut onComplete)
PLAYING ──(P key/pause button)──→ PAUSE
PLAYING ──(lives ≤ 0)──→ GAMEOVER (tween: screen red flash 0.8s onComplete)
                              │
PAUSE ──(P key/resume button)──→ PLAYING
PAUSE ──(R key)──→ CONFIRM_MODAL
                              │
CONFIRM_MODAL ──(Yes)──→ TITLE (game reset)
CONFIRM_MODAL ──(No/ESC)──→ PAUSE
                              │
GAMEOVER ──(R key/restart button)──→ TITLE (game reset)
PLAYING ──(20 waves cleared)──→ GAMEOVER (Victory mode, tween: victory effect)
```

> **All delayed transitions are handled via tween onComplete callbacks.** `setTimeout` usage is banned.

---

## 10. Core System Design

### 10.1 TweenManager (Inherited from Cycle 2 + Improvements)

```javascript
// API
tw.add(target, { alpha: 1, scale: 1.2 }, 500, 'easeOutBack', () => { ... });
tw.update(dt);    // Called every frame (in all states!)
tw.cancelAll();   // Safely cancel via deferred pattern

// 5 easing functions fully implemented
const EASING = {
  linear:       t => t,
  easeOutQuad:  t => t * (2 - t),
  easeInQuad:   t => t * t,
  easeOutBack:  t => 1 + (--t) * t * (2.70158 * t + 1.70158),
  easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 :
    Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1
};
```

**Concurrent call protection (Cycle 2 lesson):**
- If `cancelAll()` called during `update()` → `_pendingCancel = true` flag → actual removal after update completes (deferred pattern)
- Reverse iteration ensures splice safety

### 10.2 ObjectPool (Inherited from Cycle 2)

```javascript
// Pool targets: enemies (4 types), projectiles (3 types), particles
const pools = {
  enemy:      new ObjectPool(() => new Enemy(), 30),
  projectile: new ObjectPool(() => new Projectile(), 50),
  particle:   new ObjectPool(() => new Particle(), 80)
};

// acquire/release + reverse iteration pattern
for (let i = activeList.length - 1; i >= 0; i--) {
  if (activeList[i].dead) {
    pools[type].release(activeList.splice(i, 1)[0]);
  }
}
```

### 10.3 Web Audio API — Procedural Sound Effects (New)

> Reflects Cycle 2 suggestion "procedural sound experiment." Generates sound effects with zero external assets.

```javascript
// AudioContext initialization (on first user interaction)
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { /* Sound disabled — no gameplay impact */ }
  }
}

// 4 sound effects
function sfxShoot(type) {
  // Archer: Short high beep (800Hz, 50ms, triangle)
  // Mage: Mid-range sweep (400→600Hz, 150ms, sine)
  // Cannon: Low thud (120Hz, 200ms, sawtooth + lowpass)
}
function sfxKill()    { /* Pop effect: 1200Hz→200Hz 100ms sine decay */ }
function sfxWave()    { /* Short fanfare: 440→880Hz 300ms square */ }
function sfxGameover(){ /* Descending tone: 400→100Hz 500ms sawtooth */ }
```

- All SFX calls wrapped in `try-catch` — ignored on audio failure
- SFX plays only in PLAYING state (see matrix)
- Volume: 0.3 (default), expandable with future options

### 10.4 game.destroy() Pattern (New — Cycle 2 Unresolved Item)

```javascript
function destroy() {
  // 1. Stop game loop
  cancelAnimationFrame(rafId);

  // 2. Remove event listeners
  registeredListeners.forEach(([el, evt, fn]) => el.removeEventListener(evt, fn));
  registeredListeners.length = 0;

  // 3. Release all ObjectPools
  Object.values(pools).forEach(p => p.clear());

  // 4. Cancel all tweens
  tw.cancelAll();

  // 5. Close AudioContext
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
}

// Listener registration helper
function listen(el, evt, fn, opts) {
  el.addEventListener(evt, fn, opts);
  registeredListeners.push([el, evt, fn, opts]);
}
```

---

## 11. UI Layout Details

### 11.1 Top HUD (y: 0~40px)

```
┌─────────────────────────────────────────────────────────┐
│  🏰 WAVE 3/20    ⚔️ 12 enemies    💰 145G    ❤️ 18     │
│  [═══════════30%═══════]                    SCORE: 1250 │
└─────────────────────────────────────────────────────────┘
```

- Wave progress bar: Current kills / total enemies (green bar)
- Gold: `#FFD700`, scale pulse tween on change
- Lives: `#E74C3C`, shake tween on decrease
- Score: Right-aligned, briefly brightens on change

### 11.2 Bottom Tower Bar (y: 424~472px)

```
┌─────────────────────────────────────────────────────────┐
│  [🏹 25G]   [🔮 50G]   [💣 75G]     [⏩ Start Wave]    │
└─────────────────────────────────────────────────────────┘
```

- Each tower button: 48×40px, icon + cost
- When gold insufficient: Grayed out + cost in red
- When selected: Bright border highlight
- Wave start button: Only shown in WAVE_PREP state

### 11.3 Tower Info Panel (Popup on Tower Click)

```
┌───────────────┐
│ Archer Tower Lv.2 │
│ ATK: 15  SPD: 500ms │
│ Range: 100px         │
│ ───────────── │
│ [⬆ Upgrade 50G] │
│ [💰 Sell 33G]      │
└───────────────┘
```

- Displayed with tween fadeIn above tower
- Upgrade button hidden at Lv.3, shows "MAX"
- Sell amount = 60% of total investment

---

## 12. Sidebar Metadata (For Game Page)

```yaml
game:
  title: "Mini Tower Defense"
  description: "Strategically place 3 types of towers on an 8×6 grid to defend against 20 waves of enemy invasion! The combination of Archer, Mage, and Cannon towers and upgrade timing determine victory or defeat."
  genre: ["strategy"]
  playCount: 0
  rating: 0
  controls:
    - "Mouse Click: Place/select/upgrade towers"
    - "1/2/3 Keys: Select tower type"
    - "U Key: Upgrade, S Key: Sell"
    - "P Key: Pause"
    - "Space: Early wave start"
    - "Touch: Tap for all actions"
  tags:
    - "#towerdefense"
    - "#strategy"
    - "#wavesurvival"
    - "#upgrade"
    - "#fantasy"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

---

## 13. Implementation Checklist

### 13.1 Core Features (Required)
- [ ] 8×6 grid + S-shaped fixed path rendering
- [ ] 3 tower types: placement/upgrade/sell
- [ ] 4 enemy types: path movement + HP system
- [ ] Tower auto-attack + 3 projectile types
- [ ] 20-wave spawn system (formula-based scaling)
- [ ] Gold economy (income/spending/sell returns)
- [ ] Life system (20HP, -1 per enemy pass)
- [ ] Scoring system + localStorage best record
- [ ] 7-state game state machine
- [ ] TweenManager (5 easing functions fully implemented)
- [ ] ObjectPool (enemies, projectiles, particles)
- [ ] Canvas-based modal (confirm replacement)
- [ ] State × system matrix included as code comments
- [ ] game.destroy() + listener cleanup
- [ ] Mouse/touch input auto-detection

### 13.2 Visual/Effects (Required)
- [ ] Pure Canvas drawing assets (no SVG filters)
- [ ] Tower attack effects (arrow/magic/cannonball projectiles)
- [ ] Enemy kill explosion particles + gold popup
- [ ] Wave start/clear text tween effects
- [ ] Gold change pulse / life decrease shake
- [ ] Tower range circle display
- [ ] Placeable tile hover highlight
- [ ] Cached offscreen canvas background

### 13.3 Sound (Challenge)
- [ ] Web Audio API procedural sound effects (4 types)
- [ ] try-catch wrapping (silently ignore failures)
- [ ] Play only in PLAYING state

### 13.4 Design Doc Verification Checklist (For Code Review)
- [ ] Confirm tw.update(dt) called in all states
- [ ] Confirm zero setTimeout usage
- [ ] Confirm score check→save order
- [ ] Confirm zero unused assets / external CDN
- [ ] Confirm destroy() pattern cleans up all listeners
- [ ] Confirm all 5 easing functions implemented
- [ ] Confirm only Canvas modals used (zero confirm/alert)

---

## 14. Estimated Code Size

```
Estimated lines: ~1,000~1,200 (Cycle 2 level)

Structure breakdown:
  - Constants/config:       ~80 lines   (colors, tower stats, enemy stats, path data)
  - TweenManager:           ~60 lines   (inherited from Cycle 2 + easeOutElastic added)
  - ObjectPool:             ~30 lines   (inherited from Cycle 2)
  - WaveManager:            ~80 lines   (spawn logic + wave composition)
  - Tower system:           ~150 lines  (placement, attack, upgrade, sell)
  - Enemy system:           ~120 lines  (movement, HP, slow, armor)
  - Projectile:             ~80 lines   (movement, collision, AoE damage)
  - Economy system:         ~40 lines   (gold management)
  - Input handling:         ~100 lines  (mouse/touch/keyboard)
  - UI/HUD:                 ~120 lines  (top HUD, bottom bar, info panel)
  - Rendering:              ~150 lines  (grid, towers, enemies, projectiles, particles)
  - State machine/loop:     ~60 lines   (7 states + main loop)
  - Web Audio SFX:          ~50 lines   (procedural sound effects, 4 types)
  - destroy/init:           ~30 lines   (lifecycle management)
```
