---
game-id: neon-dash-runner
title: Neon Dash Runner
genre: arcade, casual
difficulty: medium
---

# Neon Dash Runner — Detailed Game Design Document

> **Cycle:** 4
> **Date:** 2026-03-20
> **Designer:** Claude (Game Designer)
> **Reference:** Based on `docs/analytics/cycle-4-report.md` analysis report

---

## 0. Previous Cycle Feedback Integration

> Issues and suggestions from the Cycle 3 "Mini Tower Defense" post-mortem are **explicitly** incorporated.

### 0-1. Cycle 3 Issue Resolution Mapping

| Cycle 3 Issue / Suggestion | Severity | Cycle 4 Response |
|---------------------------|----------|-----------------|
| **[B1] waveComplete() repeated calls** — Duplicate rewards per frame during tween delay transition | CRITICAL | → **§8 Tween state transition guard pattern standardized**. All tween onComplete state transitions immediately set `transitioning` guard flag. Same pattern applied to power-up collection, game over transitions, etc. |
| **[B2] Game over transition race condition** — endGame() and waveComplete() tweens executing simultaneously | CRITICAL | → **State transition priority system introduced**. `STATE_PRIORITY` map defined: GAMEOVER(99) > all states. Transition function entry guard: `if (STATE_PRIORITY[currentState] >= STATE_PRIORITY[targetState]) return;` |
| **[B3] consecutiveCleanWaves non-functional** — Ghost variable | MAJOR | → **"Ghost variable prevention" checklist** specified. §13 code review checklist adds "verify update/usage of all declared variables" item. Variables specified in design doc include usage flow in §5 |
| **[B4] SVG filter recurrence** — feGaussianBlur included in assets | MINOR | → **Complete SVG non-usage**. All visual elements rendered via pure Canvas Path2D + arc + fillRect. §4 specifies "banned list: SVG, feGaussianBlur, external images" |
| Standardize tween state transition guard pattern | Suggestion | → **§10.1 TransitionGuard pattern** designed. `beginTransition(targetState)` helper unifies guard flag + priority check |
| Try runner/racing or rhythm genre | Suggestion | → **Endless Runner** genre selected. Procedural level generation for infinite maps. First casual genre entry |
| Asset pipeline auto-verification | Suggestion | → No assets at all (100% Canvas drawing). Banned pattern grep check list: `setTimeout`, `confirm(`, `alert(`, `feGaussianBlur`, `eval(` |

### 0-2. Verified Patterns from platform-wisdom.md

| Success Pattern | Application |
|----------------|-------------|
| Single HTML + Canvas + Vanilla JS | Same architecture maintained |
| Game state machine | LOADING → TITLE → PLAYING → PAUSE → CONFIRM_MODAL → GAMEOVER (6 states) |
| DPR support (Canvas internal resolution ≠ CSS) | Same applied |
| localStorage try-catch | Same applied (iframe sandbox support) |
| TweenManager + ObjectPool reuse | Adopted as core infrastructure (5 easing functions fully implemented) |
| HEX codes/formulas in design doc | All values/formulas/color codes specified (target 95% implementation fidelity) |
| Canvas-based modal (confirm/alert banned) | All confirmation UI via Canvas modals |
| Generous hitboxes | Player visual size (32×32) with smaller hitbox (20×20) |
| Code fallback rendering | No asset load failure prep needed — 100% Canvas drawing |
| Web Audio API procedural sound | 5 sound effects (jump, coin, collision, power-up, game over) |
| destroy() pattern standardized | registeredListeners + listen() + destroy() inherited directly |
| State × system matrix | Defined in §8 design doc + dual inclusion in code comments |
| Complete setTimeout ban | All delayed transitions via tween onComplete. Coding guideline specified |
| Check first, save later | Order fixed in §7 scoring system |

### 0-3. Cumulative Technical Improvements

| Unresolved Item | Source | Cycle 4 Response |
|----------------|--------|-----------------|
| tween onComplete guard flag | Cycle 3 new | → `beginTransition()` helper standardized (§10.1) |
| State transition priority system | Cycle 3 new | → `STATE_PRIORITY` map introduced (§10.1) |
| Ghost variable prevention | Cycle 2~3 recurring | → Added item to code review checklist (§13.4) |

---

## 1. Game Overview & Core Fun Elements

### Concept
An endless runner game dashing through a neon cyberpunk city. The player switches between **3 lanes (top/mid/bottom)** and **jumps** to avoid obstacles while **collecting coins**. Speed gradually increases with distance, and **procedural level generation** creates different obstacle patterns each run. **Magnet, Shield, x2** — 3 power-up types add strategic elements.

### Core Fun Elements
1. **"Just one more" addiction** — Tension rises as speed increases, and the desire to beat your record drives repeated play
2. **Instant response satisfaction** — Lane switching and jumping are immediate and smooth, making the controls themselves enjoyable
3. **Procedural level freshness** — Different obstacle layouts each game test split-second judgment rather than pattern memorization
4. **Visual rewards** — Neon coin collection effects, shield break animations, and power-up activation effects amplify gameplay satisfaction
5. **Simple controls, high skill ceiling** — Anyone can start with 3 lanes + jump, but optimal path selection at high speed is an expert domain

### Genre Diversification Contribution
- **First casual genre entry** — Fills the only gap among the platform's 5 permitted genres (arcade, puzzle, strategy, action, casual)
- Dual arcade + casual tags for both accessibility and replay value

---

## 2. Game Rules & Objectives

### 2.1 Basic Rules
- **Side-scrolling endless runner** — Character fixed on left side, background and obstacles scroll right→left
- Switch between 3 **lanes** (top: y=25%, mid: y=50%, bottom: y=75% — based on game area) to dodge obstacles
- **Jump** to clear ground obstacles (lane switching also possible while jumping)
- Obstacle collision causes **1 life lost** (starting lives: 3, max 3)
- **Game over** when lives reach 0
- **Shield power-up** absorbs 1 collision (shield consumed instead of life)
- Goal: **Run as far as possible and record the highest score**

### 2.2 Lane System

```
Lane 0 (top): y = gameAreaTop + gameAreaHeight × 0.25
Lane 1 (mid): y = gameAreaTop + gameAreaHeight × 0.50  ← Starting position
Lane 2 (bottom): y = gameAreaTop + gameAreaHeight × 0.75
```

- Lane switch: tween animation `150ms, easeOutQuad` (immediate yet smooth)
- Jump: Vertical rise of `jumpHeight = 60px` from current lane then descent, total `500ms`
- Lane switch during jump → parabolic trajectory transfers to new lane (input applied immediately)

### 2.3 Obstacle Types (4 types)

| Obstacle | Shape | Size | Dodge Method | Color | First Distance |
|----------|-------|------|-------------|-------|---------------|
| **Barrier** | Neon rectangular wall | 40×50px | Switch to another lane | `#FF1744` (Red) | 0m+ |
| **Spike** | Ground triangle | 30×20px | Jump | `#FF9100` (Orange) | 0m+ |
| **Laser** | Horizontal laser beam (2 lanes occupied) | 400×8px | Switch to the 1 open lane | `#D500F9` (Purple) | 300m+ |
| **Drone** | Floating triangle | 28×28px | Lane switch (moves up/down) | `#00E5FF` (Cyan) | 600m+ |

- **All obstacle visual size > hitbox**: Detection size = visual size × 0.7 (generous detection, Cycle 2 success pattern)
- Obstacles recycled via ObjectPool (pool size: 20)

### 2.4 Coins

| Type | Score | Visual | Placement Rate |
|------|-------|--------|---------------|
| **Normal Coin** | 10 pts | Small neon circle (∅16px), `#FFD740` | 70% |
| **Super Coin** | 50 pts | Large neon star (∅24px), `#FF4081` | 15% |
| **Coin Trail** | 10 pts × 5~8 | Normal coins in a line | 15% |

- Coin hitbox: Visual size × 1.3 (generous collection detection)
- On coin collection: tween scaleUp(1.5) + fadeOut(200ms) + score popup
- Coins recycled via ObjectPool (pool size: 30)

### 2.5 Power-Ups (3 types)

| Power-Up | Icon Color | Effect | Duration | Spawn Interval |
|----------|-----------|--------|----------|---------------|
| **Magnet** | `#2979FF` (Blue) | Auto-attract coins within 2 lane range | 8s | 15~25s |
| **Shield** | `#00E676` (Green) | Absorb 1 collision (consumed instead of life loss) | 1 use | 20~35s |
| **x2 (Double)** | `#FFAB00` (Amber) | All scores doubled | 10s | 25~40s |

- Power-up capsule: 32×32px, neon glow + icon
- Power-up collection uses **guard flag** (Cycle 3 B1 lesson):
  ```
  if (powerup.collected) continue;  // Guard
  powerup.collected = true;          // Set flag immediately
  activatePowerup(powerup.type);     // Apply effect
  ```
- Magnet active: Coins tween toward player (easeOutQuad, 300ms)
- Shield active: Green glow circle around player
- x2 active: "×2" text blinks next to HUD score

---

## 3. Controls

### 3.1 Keyboard (PC Default)

| Key | Action |
|-----|--------|
| **↑** / **W** | Move lane up (ignored if already at top) |
| **↓** / **S** | Move lane down (ignored if already at bottom) |
| **Space** | Jump (ignored in air — no double jump) |
| **P** / **ESC** | Pause toggle |
| **R** | Restart on game over (Canvas modal confirmation) |
| **Enter** / **Space** | Start game from title screen |

### 3.2 Mouse (PC Secondary)

| Input | Action |
|-------|--------|
| **Click top 1/3 of canvas** | Move lane up |
| **Click bottom 1/3 of canvas** | Move lane down |
| **Click middle 1/3 of canvas** | Jump |
| **Pause button (top-right)** | Pause toggle |

### 3.3 Touch (Mobile)

| Input | Action |
|-------|--------|
| **Swipe ↑** | Move lane up |
| **Swipe ↓** | Move lane down |
| **Tap** | Jump |
| **Pause button (top-right)** | Pause toggle |
| **Restart button** | Restart on game over |

> **Auto-detect input mode**: Mode automatically set based on first input (keyboard/mouse/touch). Switches immediately on input change. In touch mode, swipe sensitivity optimized and button sizes 1.5x enlarged.
>
> **⚠️ Cycle 2 lesson**: To prevent the input mode variable (`inputMode`) from becoming "ghost code" where it's declared but never used in actual branching, §5 clearly specifies the usage flow of input mode-specific branching logic.

---

## 4. Visual Style Guide

### 4.1 Color Palette — Neon Cyberpunk

| Usage | HEX | Description |
|-------|-----|-------------|
| **Background (city)** | `#0D0D1A` | Deep navy (night sky) |
| **Background gradient bottom** | `#1A0A2E` | Purple darkness |
| **Road surface** | `#1C1C2E` | Dark navy-purple |
| **Lane dividers** | `#2D2D4E` (40% alpha) | Subtle lane guides |
| **Player** | `#00E5FF` (cyan) | Bright neon cyan |
| **Player glow** | `#00E5FF` (30% alpha) | Player glow aura |
| **Normal coin** | `#FFD740` | Gold neon |
| **Super coin** | `#FF4081` | Pink neon |
| **Barrier** | `#FF1744` | Red neon |
| **Spike** | `#FF9100` | Orange neon |
| **Laser** | `#D500F9` | Purple neon |
| **Drone** | `#00E5FF` | Cyan neon (distinguished from player by blinking) |
| **Power-up Magnet** | `#2979FF` | Blue neon |
| **Power-up Shield** | `#00E676` | Green neon |
| **Power-up x2** | `#FFAB00` | Amber neon |
| **HUD text** | `#E0E0E0` | Light gray |
| **HUD highlight** | `#00E5FF` | Cyan (distance/score) |
| **HUD lives** | `#FF1744` | Red (heart) |
| **HUD combo** | `#FFD740` | Gold (combo counter) |
| **Building silhouettes** | `#14142B` → `#1A1A3E` | Gradient dark (far view) |
| **Building windows** | `#FF1744`, `#D500F9`, `#00E5FF` random | Small neon rectangles |
| **Road center line** | `#FFD740` (50% alpha) | Dash pattern (speed emphasis) |

### 4.2 Background (3-Layer Parallax)

| Layer | Content | Scroll Rate | Height Ratio |
|-------|---------|-------------|-------------|
| **Far (sky)** | Star particles + moon (circle) | ×0.1 | Top 30% |
| **Mid (buildings)** | Procedural rectangular building silhouettes + neon windows | ×0.4 | Top 60% |
| **Near (road)** | 3-lane road + center line dash + neon strips on sides | ×1.0 | Bottom 70% |

- **Canvas base size:** `480 × 360px` (4:3 ratio, including 40px top HUD)
- Game area: `480 × 320px` (below HUD)
- Far/mid layers **cached on offscreen canvas** → Only drawImage offset changes on scroll
- Building silhouettes: Random rectangles 50~150px height, occasional antenna (thin line) on top
- Building windows: 3×3px neon rectangles randomly placed (`#FF1744`/`#D500F9`/`#00E5FF` random)
- Road side neon strips: `#D500F9` 2px line, glow effect (overlapping translucent 8px lines)

### 4.3 Object Shapes (Pure Canvas Drawing — No SVG/External Images)

| Object | Drawing Method |
|--------|---------------|
| **Player** | Cyan triangle (right-pointing) 32×32px + inner bright triangle + 2 rear speed lines + glow (translucent large circle) |
| **Barrier** | Red rectangle 40×50px + bright red border + top/bottom horizontal line decoration |
| **Spike** | Orange triangle 30×20px (upward point) + glow |
| **Laser** | Purple horizontal line 400×4px + top/bottom glow lines + circle emitters on both ends |
| **Drone** | Cyan inverted triangle 28×28px + bottom propeller (rotating line) + red eye (small circle) |
| **Normal coin** | Gold circle ∅16px + inner small circle + glow + rotation tween |
| **Super coin** | Pink star (5-point) ∅24px + glow + rotation + blink tween |
| **Power-up capsule** | Respective color rounded rect 32×32px + internal icon (magnet=U-shape, shield=circle, x2=text) + glow pulse |
| **Collision effect** | 8 red particles radial burst + fadeOut |
| **Coin collect effect** | 4 gold particles + scaleUp + fadeOut |
| **Shield break effect** | 6 green fragments + shockwave circle expansion |
| **Score popup** | "+10" text tween fadeUp + fadeOut (300ms) |

### 4.4 Font
- **System font stack only** (zero external CDN dependencies):
  ```
  'Segoe UI', system-ui, -apple-system, sans-serif
  ```
- HUD text: `14px bold`
- Distance/score: `18px bold`
- Title: `36px bold`
- Power-up timer: `11px`
- Score popup: `12px bold`
- Game over score: `28px bold`

### 4.5 Banned List (Asset Auto-Verification Targets)
- ❌ SVG files / SVG filters (`feGaussianBlur`, `<filter>`)
- ❌ External image files (`.png`, `.jpg`, `.svg`, `.gif`)
- ❌ External fonts / Google Fonts / CDN
- ❌ `setTimeout` / `setInterval` (game logic)
- ❌ `confirm()` / `alert()` / `prompt()`
- ❌ `eval()`

---

## 5. Core Game Loop (Frame-Based Logic Flow)

### 5.1 Main Loop (`requestAnimationFrame`)

```
function loop(timestamp) {
  const dt = min((timestamp - lastTime) / 1000, 0.05);  // Max 50ms cap
  lastTime = timestamp;

  switch (state) {
    case LOADING:       updateLoading();                                        break;
    case TITLE:         tw.update(dt); renderTitle();                           break;
    case PLAYING:       updateGame(dt); tw.update(dt); renderGame();            break;
    case PAUSE:         tw.update(dt); renderGame(); renderPause();             break;
    case CONFIRM_MODAL: tw.update(dt); renderGame(); renderModal();             break;
    case GAMEOVER:      tw.update(dt); renderGame(); renderGameover();          break;
  }

  rafId = requestAnimationFrame(loop);
}
```

### 5.2 updateGame(dt) Detailed Flow

```
1. ScrollManager.update(dt)
   → Speed increase calculation: speed = min(maxSpeed, baseSpeed + distance / 1000 * accel)
   → 3-layer parallax offset update
   → Distance accumulation: distance += speed × dt

2. ChunkGenerator.update(dt)
   → Check if next chunk needed based on current scrollX
   → Generate procedurally when needed: spawnObstacles() + spawnCoins() + spawnPowerup()
   → Activate obstacles/coins/power-ups via ObjectPool.acquire

3. Player.update(dt)
   → Lane switch tween progress (inputMode branching: keyboard→instant, touch→swipe sensitivity applied)
   → Jump physics: jumpVelocity -= gravity × dt; y += jumpVelocity × dt
   → Magnet power-up active: nearby coin attraction logic

4. Obstacles.forEach(obstacle => {
   → obstacle.x -= speed × dt         // Scroll left
   → if (obstacle.type === DRONE) obstacle.updatePatrol(dt)  // Up/down patrol
   → if (obstacle.x < -obstacle.width) pool.release(obstacle) // Off-screen reclaim
   → if (collide(player, obstacle)) { handleCollision(obstacle); }
   })
   ※ Reverse iteration + splice pattern

5. Coins.forEach(coin => {
   → coin.x -= speed × dt
   → if (magnetActive) { attractToPlayer(coin); }
   → if (coin.x < -20) pool.release(coin)
   → if (collide(player, coin)) {
       if (coin.collected) continue;    // Guard flag (C3 B1 lesson)
       coin.collected = true;
       addScore(coin.value × scoreMultiplier);
       spawnCoinFX();
       pool.release(coin);
     }
   })

6. Powerups.forEach(pu => {
   → pu.x -= speed × dt
   → if (pu.x < -40) pool.release(pu)
   → if (collide(player, pu)) {
       if (pu.collected) continue;      // Guard flag
       pu.collected = true;
       activatePowerup(pu.type);
       pool.release(pu);
     }
   })

7. ActivePowerups.update(dt)
   → Decrease remaining time for each power-up
   → Deactivate on expiry + HUD update

8. Particles.update(dt)                // Visual effects

9. checkGameOver()
   → if (lives <= 0 && !transitioning) {
       beginTransition(GAMEOVER);       // Guard + priority check built-in
     }
```

### 5.3 Input Mode Branching (Ghost Code Prevention — Usage Points Specified)

```
Variable: inputMode = 'keyboard' | 'mouse' | 'touch'

Usage 1: Player.update(dt) — Lane switch speed
  keyboard/mouse → Instant switch (tween 150ms)
  touch → Swipe sensitivity threshold 30px applied

Usage 2: renderPause() — Button size
  keyboard/mouse → Default size
  touch → Buttons 1.5x enlarged

Usage 3: renderGameover() — Restart instruction text
  keyboard → "Press R to restart"
  mouse → "Click to restart"
  touch → "Tap to restart"

Usage 4: Pause button display
  keyboard → Show P key hint only
  mouse/touch → Show pause icon button (top-right)
```

### 5.4 Rendering Order (Z-order)

```
1. Far background (sky + stars)          — offscreen canvas, ×0.1 scroll
2. Mid background (building silhouettes) — offscreen canvas, ×0.4 scroll
3. Near background (road + lane lines)   — ×1.0 scroll
4. Road center line dashes               — Speed feel effect
5. Coins                                 — Rotation + glow
6. Power-up capsules                     — Glow pulse
7. Obstacles                             — Type-specific drawing
8. Player                                — Triangle + glow + speed lines
9. Particles/effects                     — Collision, coin collect, score popup
10. HUD (top)                            — Distance, score, lives, power-up timer
11. Overlay (pause/modal/game over)      — On semi-transparent background
```

---

## 6. Difficulty System

### 6.1 Speed Curve

| Parameter | Formula | 0m | 500m | 1000m | 2000m | 5000m |
|-----------|---------|-----|------|-------|-------|-------|
| **Game speed** (px/s) | `min(600, 200 + distance × 0.04)` | 200 | 220 | 240 | 280 | 400 |
| **Obstacle density** (per chunk) | `min(4, 1 + floor(distance / 500))` | 1 | 2 | 3 | 3 | 4 |
| **Laser appears** | `distance >= 300` | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Drone appears** | `distance >= 600` | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Multi-obstacle combos** | `distance >= 800` | ✗ | ✗ | ✗ | ✓ | ✓ |

### 6.2 Procedural Level Generation — Chunk System

```
Chunk size: 400px (close to screen width)
Generation trigger: When next chunk start X is within screen right + 200px

Chunk generation algorithm:
  1. Difficulty level = floor(distance / 500) (0~10, capped)
  2. Obstacle count = min(4, 1 + difficulty level)
  3. Pattern selection (weighted random by difficulty):
     - SINGLE_BARRIER: Single lane barrier          (weight: 10 - difficulty)
     - SPIKE_ROW: 2~3 spikes on one lane            (weight: 8 - difficulty × 0.5)
     - DOUBLE_BARRIER: 2-lane simultaneous barrier   (weight: difficulty × 1.5)
     - LASER_GATE: 2-lane laser (300m+)              (weight: difficulty × 1.0)
     - DRONE_PATROL: 1~2 drones (600m+)              (weight: difficulty × 0.8)
     - GAUNTLET: Barrier+spike+drone combo (800m+)   (weight: difficulty × 0.5)
  4. Coin placement: 3~8 coins in safe lane, line or zigzag
  5. Power-up placement: Probabilistic placement if time since last > min interval

Safety rules:
  - Guarantee at least 1 safe lane (dodge possible)
  - No lasers in 2 consecutive chunks (reaction time)
  - Jump+lane switch simultaneous requirement only after 1000m
```

### 6.3 Dynamic Balance Adjustment

| Condition | Effect | UI Display |
|-----------|--------|-----------|
| **1 life** (critical state) | Next 3 chunks obstacle density -1 | Red vignette on screen edges |
| **500m consecutive no-hit** | Bonus coin trail extra placement | "PERFECT RUN!" text popup |
| **Approaching best record (90%)** | Score text glow intensifies | HUD score blinks |

---

## 7. Scoring System

### 7.1 Score Acquisition

| Action | Base Score | Notes |
|--------|-----------|-------|
| Reach 100m | 100 pts | Auto-credited every 100m |
| Normal coin collected | 10 pts | |
| Super coin collected | 50 pts | |
| Near miss (close dodge) | 30 pts | Detection: obstacle distance from player < 15px && no collision |
| 5-coin combo streak | +20 pts bonus | Extra every 5 |
| 500m no-hit bonus | 200 pts | |
| x2 power-up active | All above scores ×2 | |

### 7.2 Near Miss System

```
Detection conditions:
  1. Obstacle's x has passed player x (obstacle.x + obstacle.width < player.x)
  2. At passage moment, player-obstacle y distance < 40px (same lane proximity)
  3. No actual collision occurred

Effects:
  - "NEAR MISS!" text tween (easeOutBack, 500ms, fadeUp)
  - +30 score popup (gold color)
  - Subtle slow-motion effect (gameSpeed × 0.8, restored after 200ms — via tween)
```

### 7.3 Best Score Processing Order (B4 Lesson Applied)

```javascript
// ⚠️ Must follow this order — "Check first, save later"
const isNewBest = score > getBest();     // 1. Check
const isNewDist = distance > getBestDist(); // 1b. Distance too
saveBest(score);                          // 2. Save
saveBestDist(distance);                   // 2b.
if (isNewBest) showNewBestEffect();       // 3. Effect
```

### 7.4 localStorage Keys
- `ndr_bestScore` — Best score
- `ndr_bestDist` — Best distance reached (meters)
- `ndr_totalCoins` — Cumulative coins collected (statistics)
- `ndr_totalRuns` — Total play count (statistics)
- All access wrapped in `try { ... } catch(e) { /* silent */ }`

---

## 8. State × System Update Matrix ⭐

> **Root cause fix for Cycle 2 B1/B2. Effectiveness verified in Cycle 3.** This matrix should also be copied as a code header comment.

| Game State | TweenMgr | Scroll | ChunkGen | Player | Obstacles | Coins | Powerups | Particles | Input | Render | SFX |
|-----------|----------|--------|----------|--------|-----------|-------|----------|-----------|-------|--------|-----|
| **LOADING** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | loading screen | ✗ |
| **TITLE** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | start only | title screen | ✗ |
| **PLAYING** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | move+jump+pause | game | **✓** |
| **PAUSE** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | resume only | game+pause overlay | ✗ |
| **CONFIRM_MODAL** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | yes/no | game+modal overlay | ✗ |
| **GAMEOVER** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** | restart only | game+result screen | ✗ |

> **Core rule:** TweenManager is **always updated in every state**. This is because UI animations (modal fade-in, text scale, etc.) must function in any state.

---

## 9. State Transition Flow (Complete setTimeout Ban)

```
LOADING ──(Canvas init complete)──→ TITLE

TITLE ──(Enter/Space/click/tap)──→ PLAYING (tween: title fadeOut 300ms onComplete)

PLAYING ──(lives ≤ 0 && !transitioning)──→ GAMEOVER
          (tween: screen red flash 0.5s + slow-mo deceleration onComplete)
          ※ beginTransition(GAMEOVER) call — guard + priority built-in

PLAYING ──(P key/ESC/pause button)──→ PAUSE (immediate, no tween needed)

PAUSE ──(P key/ESC/resume button)──→ PLAYING (immediate)

PAUSE ──(R key)──→ CONFIRM_MODAL
                  (tween: modal fadeIn 200ms)

CONFIRM_MODAL ──(Yes)──→ TITLE (game reset)
CONFIRM_MODAL ──(No/ESC)──→ PAUSE (tween: modal fadeOut 200ms onComplete)

GAMEOVER ──(R key/restart button/click/tap)──→ TITLE (game reset)
```

> **All delayed transitions handled via tween onComplete callbacks.** `setTimeout` / `setInterval` usage banned.
> **`beginTransition()` helper required for all state transitions** (see §10.1).

---

## 10. Core System Design

### 10.1 TransitionGuard Pattern (Cycle 3 B1/B2 Lesson → New Standard)

```javascript
// State priorities (higher = stronger)
const STATE_PRIORITY = {
  LOADING: 0, TITLE: 10, PLAYING: 20,
  PAUSE: 30, CONFIRM_MODAL: 35, GAMEOVER: 99
};

let transitioning = false;

function beginTransition(targetState, tweenConfig) {
  // Guard 1: Already transitioning — ignore
  if (transitioning) return false;

  // Guard 2: Current state priority >= target — ignore
  //         (e.g., block other transitions from GAMEOVER state)
  if (STATE_PRIORITY[state] >= STATE_PRIORITY[targetState]) return false;

  // Guards passed — begin transition
  transitioning = true;

  if (tweenConfig) {
    tw.add(tweenConfig.target, tweenConfig.props, tweenConfig.duration,
           tweenConfig.easing, () => {
      state = targetState;
      transitioning = false;     // Transition complete
      if (tweenConfig.onComplete) tweenConfig.onComplete();
    });
  } else {
    // Immediate transition (e.g., PAUSE)
    state = targetState;
    transitioning = false;
  }
  return true;
}
```

### 10.2 TweenManager (Inherited from Cycle 2~3)

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

### 10.3 ObjectPool (Inherited from Cycle 2~3)

```javascript
// Pool targets and sizes
const pools = {
  obstacle:   new ObjectPool(() => new Obstacle(), 20),
  coin:       new ObjectPool(() => new Coin(), 30),
  powerup:    new ObjectPool(() => new Powerup(), 5),
  particle:   new ObjectPool(() => new Particle(), 60)
};

// acquire/release + reverse iteration pattern
for (let i = activeList.length - 1; i >= 0; i--) {
  if (activeList[i].dead || activeList[i].x < -50) {
    pools[type].release(activeList.splice(i, 1)[0]);
  }
}
```

### 10.4 ChunkGenerator — Procedural Level Generation

```javascript
const CHUNK_WIDTH = 400;   // Chunk width (px)
let nextChunkX = 600;      // Next chunk generation position

function generateChunk() {
  const difficulty = Math.min(10, Math.floor(distance / 500));

  // 1. Pattern selection (weighted random)
  const pattern = weightedRandom(getPatterns(difficulty));

  // 2. Obstacle placement — guarantee at least 1 safe lane
  const obstacles = pattern.generate(nextChunkX, difficulty);
  const safeLanes = getSafeLanes(obstacles);
  if (safeLanes.length === 0) {
    // Safety rule violation → remove weakest obstacle
    obstacles.pop();
  }

  // 3. Coin placement — guide toward safe lanes
  const coins = generateCoins(nextChunkX, safeLanes, difficulty);

  // 4. Power-up placement — if time condition met
  if (timeSinceLastPowerup > minPowerupInterval) {
    if (Math.random() < 0.3) {
      spawnPowerup(nextChunkX + CHUNK_WIDTH / 2, randomLane(safeLanes));
    }
  }

  // 5. Update next chunk position
  nextChunkX += CHUNK_WIDTH;
}
```

### 10.5 Web Audio API — Procedural Sound Effects (Cycle 3 Success Pattern Extended)

```javascript
// AudioContext initialization (on first user interaction)
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { /* Sound disabled — no gameplay impact */ }
  }
}

// 5 sound effects
function sfxJump()     { /* Rising sweep: 300→600Hz, 150ms, sine */ }
function sfxCoin()     { /* High pop: 1200Hz→800Hz, 80ms, triangle */ }
function sfxHit()      { /* Low impact: 150Hz, 200ms, sawtooth + fast decay */ }
function sfxPowerup()  { /* Chord arpeggio: 440→660→880Hz, 300ms, sine triple */ }
function sfxGameover() { /* Descending: 400→100Hz, 600ms, sawtooth */ }
```

- All SFX calls wrapped in `try-catch` — ignored on audio failure
- SFX plays only in PLAYING state (see matrix)
- Volume: 0.25 (default)

### 10.6 game.destroy() Pattern (Inherited from Cycle 3 Standard)

```javascript
const registeredListeners = [];

function listen(el, evt, fn, opts) {
  el.addEventListener(evt, fn, opts);
  registeredListeners.push([el, evt, fn, opts]);
}

function destroy() {
  // 1. Stop game loop
  cancelAnimationFrame(rafId);

  // 2. Remove event listeners
  registeredListeners.forEach(([el, evt, fn, opts]) =>
    el.removeEventListener(evt, fn, opts));
  registeredListeners.length = 0;

  // 3. Release all ObjectPools
  Object.values(pools).forEach(p => p.clear());

  // 4. Cancel all tweens
  tw.cancelAll();

  // 5. Close AudioContext
  if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
}
```

---

## 11. UI Layout Details

### 11.1 Top HUD (y: 0~40px)

```
┌──────────────────────────────────────────────────────┐
│  🏃 1,250m     ⭐ 8,430     ❤️❤️❤️     🧲 5.2s      │
│                              [⏸]                     │
└──────────────────────────────────────────────────────┘
```

- Distance: `#00E5FF` (cyan), `18px bold`, scale pulse tween at 100m intervals
- Score: `#FFD740` (gold), `18px bold`, briefly brightens on change
- Lives: `#FF1744` (red), 3 heart icons, shake tween on decrease + red vignette flash
- Power-up timer: Active power-up icon + remaining seconds (power-up color)
- Pause button: Top-right 20×20px (shown only in mouse/touch mode)
- x2 active: `"×2"` text next to score (amber, blink tween)

### 11.2 Title Screen

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│            ╔═══════════════════════╗                  │
│            ║  Neon Dash Runner    ║                  │
│            ╚═══════════════════════╝                  │
│                                                      │
│         BEST: 12,450pts  |  2,350m                   │
│                                                      │
│         [SPACE / Tap to Start]                       │
│                                                      │
│    ↑↓: Lane Switch  SPACE: Jump  P: Pause            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Title text: tween glow pulse (alpha 0.7 → 1.0 repeat)
- Background: Slowly scrolling city silhouettes (atmosphere)
- Best record: Hidden if 0

### 11.3 Game Over Screen

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              ╔══════════════════╗                     │
│              ║   GAME OVER     ║                     │
│              ╚══════════════════╝                     │
│                                                      │
│           Distance: 1,250m                           │
│           Score: 8,430                               │
│           Coins: 47                                  │
│                                                      │
│           🏆 NEW BEST! (Previous: 7,200)             │
│                                                      │
│          [R Key / Tap to Restart]                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Result text: Sequential tween fadeIn (distance → score → coins, each 200ms delay)
- NEW BEST: easeOutElastic scale effect (0 → 1.2 → 1.0)
- Background: Semi-transparent black overlay on last game screen (`#000000` 70% alpha)

---

## 12. Sidebar Metadata (For Game Page)

```yaml
game:
  title: "Neon Dash Runner"
  description: "Dash through a neon cyberpunk city! An endless runner where you switch between 3 lanes and jump to dodge obstacles while collecting coins. Procedurally generated levels make every run fresh, and your heart races as speed increases."
  genre: ["arcade", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "↑↓ / W/S: Lane Switch"
    - "Space: Jump"
    - "P / ESC: Pause"
    - "Touch: Swipe (lane) / Tap (jump)"
    - "Mouse: Area click (lane/jump)"
  tags:
    - "#endlessrunner"
    - "#neon"
    - "#cyberpunk"
    - "#casual"
    - "#arcade"
    - "#procedural"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

---

## 13. Implementation Checklist

### 13.1 Core Features (Required)
- [ ] 3-lane system + lane switch tween animation
- [ ] Jump physics (parabola + simultaneous lane switch possible)
- [ ] 4 obstacle types (barrier, spike, laser, drone)
- [ ] 2 coin types (normal, super) + coin trails
- [ ] 3 power-up types (magnet, shield, x2)
- [ ] Procedural level generation (chunk-based, safe lane guarantee)
- [ ] Speed curve (distance-based gradual increase, capped)
- [ ] Collision detection (generous hitbox — visual × 0.7)
- [ ] Near Miss system
- [ ] Scoring system + localStorage best record
- [ ] 6-state game state machine
- [ ] TweenManager (5 easing functions fully implemented)
- [ ] ObjectPool (obstacles, coins, power-ups, particles)
- [ ] TransitionGuard pattern (guard flag + state priority)
- [ ] Canvas-based modal (confirm replacement)
- [ ] State × system matrix included as code comments
- [ ] game.destroy() + listener cleanup
- [ ] Keyboard/mouse/touch input auto-detection with branching behavior

### 13.2 Visual/Effects (Required)
- [ ] Neon cyberpunk visuals (pure Canvas drawing)
- [ ] 3-layer parallax background (far/mid/near)
- [ ] Offscreen canvas background cache
- [ ] Player glow + speed line rendering
- [ ] Coin collect effect (scaleUp + fadeOut + score popup)
- [ ] Collision effect (red particle burst)
- [ ] Shield break effect (green fragments + shockwave)
- [ ] Power-up activation effects (magnet glow, shield circle, x2 text)
- [ ] HUD feedback (distance pulse, life shake, score brighten)
- [ ] Near Miss text popup + slow-mo effect
- [ ] Game over sequential fadeIn effect
- [ ] NEW BEST easeOutElastic effect

### 13.3 Sound (Challenge)
- [ ] Web Audio API procedural sound effects (5 types)
- [ ] try-catch wrapping (silently ignore failures)
- [ ] Play only in PLAYING state
- [ ] AudioContext initialization on first interaction

### 13.4 Design Doc Verification Checklist (For Code Review) ⭐
- [ ] Confirm `tw.update(dt)` called in all states (matrix cross-check)
- [ ] Confirm zero `setTimeout` / `setInterval` usage
- [ ] Confirm zero `confirm()` / `alert()` usage
- [ ] Confirm zero SVG / external images / external fonts usage
- [ ] Confirm score check→save order (`isNewBest` first)
- [ ] Confirm `beginTransition()` helper used for all state transitions
- [ ] Confirm `transitioning` guard flag applied to all tween transitions
- [ ] Confirm `STATE_PRIORITY` map defined and priority check functioning
- [ ] Confirm destroy() pattern cleans up all listeners (`registeredListeners` used)
- [ ] Confirm all 5 easing functions implemented
- [ ] **Verify update/usage of all declared variables** (ghost variable prevention — C2~C3 recurring issue)
  - `inputMode`: Verify all 4 usage points from §5.3 implemented
  - `nearMissCount`: Verify increment/reset in Near Miss system
  - `timeSinceLastPowerup`: Verify update/comparison in chunk generation
  - `consecutiveSafeDist`: Verify update/reset in dynamic balance adjustment
- [ ] Confirm generous hitbox applied (obstacles ×0.7, coins ×1.3)
- [ ] Confirm safe lane guarantee rule works (at least 1 lane per pattern)
- [ ] Confirm only Canvas-based modals used
- [ ] Banned pattern grep check passes:
  ```bash
  grep -n "setTimeout\|setInterval\|confirm(\|alert(\|eval(\|feGaussianBlur" index.html
  # Result must be 0 matches to PASS
  ```

---

## 14. Estimated Code Size

```
Estimated lines: ~900~1,100

Structure breakdown:
  - Constants/config:         ~70 lines   (colors, speed formulas, obstacle stats, pattern definitions)
  - TweenManager:             ~60 lines   (inherited from Cycle 3, easeOutElastic included)
  - ObjectPool:               ~30 lines   (inherited from Cycle 3)
  - TransitionGuard:          ~25 lines   (new — beginTransition + STATE_PRIORITY)
  - ScrollManager:            ~40 lines   (speed curve + parallax)
  - ChunkGenerator:           ~120 lines  (procedural generation + patterns + safety rules)
  - Player:                   ~80 lines   (lane switch + jump physics + magnet)
  - Obstacles:                ~60 lines   (4 types movement + drone patrol)
  - Coins/Powerups:           ~60 lines   (collection + effects + timers)
  - Collision detection:      ~50 lines   (AABB + Near Miss)
  - Input handling:           ~80 lines   (keyboard/mouse/touch + mode branching)
  - UI/HUD:                   ~100 lines  (top HUD, title, game over)
  - Rendering:                ~130 lines  (3-layer background, entities, particles)
  - State machine/loop:       ~40 lines   (6 states + main loop)
  - Web Audio SFX:            ~45 lines   (procedural sound effects, 5 types)
  - destroy/init:             ~30 lines   (lifecycle management)
```
