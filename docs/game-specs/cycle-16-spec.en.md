---
game-id: neon-hex-drop
title: Neon Hex Drop
genre: puzzle
difficulty: medium
---

# Neon Hex Drop — Detailed Game Design Document

_Cycle #16 | Date: 2026-03-22_

---

## §0. Previous Cycle Feedback Mapping

> Proactive countermeasures for Cycle 15 postmortem "regrets" + platform-wisdom accumulated lessons (F1~F22, 15 cycles) at the design stage.

| # | Source | Problem | Solution in This Spec | Section |
|---|--------|---------|----------------------|---------|
| F1 | Cycle 13~15 | `CONFIG.MIN_TOUCH_TARGET` declaration-implementation gap | All button/cell sizes **directly reference** `CONFIG.MIN_TOUCH_TARGET`. `touchSafe()` utility enforces 48px floor | §4, §12.3 |
| F2 | Cycle 13~15 | SoundManager setTimeout remaining | Web Audio `ctx.currentTime + offset` native scheduling only. setTimeout **0 instance** target | §9, §12.5 |
| F3 | Cycle 1~15 (15 consecutive cycles) | assets/ directory recurrence | **Write from scratch in blank index.html.** assets/ directory absolutely forbidden. 100% Canvas code drawing + only thumbnail.svg allowed | §8, §12.6 |
| F4 | Cycle 12~15 | Touch target height insufficient | Button dimensions **independently** guaranteed at `CONFIG.MIN_TOUCH_TARGET` or above for both width and height. Hex cell minimum circumradius 24px (inradius ~21px → touch 42px+ guaranteed) | §4.7, §12.3 |
| F5 | Cycle 11/14 | let/const TDZ crash + initialization order error | Variable declaration → DOM assignment → Event registration → init() order explicit. §12.1 initialization order checklist | §5, §12.1 |
| F6 | Cycle 2 | Missing state×system matrix | Full state×system matrix pre-written in §6 (4 states × 5 systems) | §6 |
| F7 | Cycle 3/4 | Missing guard flags → repeated callback invocation | `isResolving` guard during block destruction/gravity + TransitionGuard pattern applied | §5.4, §6.2 |
| F8 | Cycle 2/5 | setTimeout state transitions | State transitions only via tween onComplete callbacks. setTimeout completely forbidden | §5, §12.5 |
| F9 | Cycle 5/8 | Direct transitions bypassing beginTransition() | All screen transitions must go through beginTransition(). Only PAUSED exempt (immediate transition) | §6.2 |
| F10 | Cycle 7/8 | Spec values ↔ code values mismatch | §13 numerical consistency verification table mandatory. Per-level speed/score full cross-check | §13 |
| F11 | Cycle 6/7 | Global-referencing functions → untestable | Pure function pattern — all game logic functions receive data via parameters. Signatures defined in §10 | §10 |
| F12 | Cycle 10 | Game loop try-catch not applied | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` applied by default | §5.3, §12.4 |
| F13 | Cycle 14 | 3-stage smoke test automation insufficient | Pre-review submission: (1) index.html exists (2) Page load success (3) 0 console errors | §12.7 |
| F14 | Cycle 10 | Fix regression (render signature change) | Full-flow regression test mandatory after fixes (TITLE→PLAY→PAUSE→GAMEOVER) | §12.8 |
| F15 | Cycle 3/7 | Ghost variables (declared but unused) | §13.2 variable usage verification table included | §13.2 |
| F16 | Cycle 5 | Dual update paths for single value | score/level/combo updated only through single functions (`addScore()`, `setLevel()`) | §7.1 |
| F17 | Cycle 3 | State transition priority system | GAMEOVER > PAUSED > PLAYING priority explicit. STATE_PRIORITY map | §6.2 |
| F18 | Cycle 15 regrets | 5 review cycles (all-time most) | Limited to 4 states + 1 objective type ("survival") for implementation scope. 2~3 cycle target | §1, §6 |
| F19 | Cycle 15 regrets | Stage objective types not initially implemented ("half implementation") | No stage objective type branching — single score+level (speed) system only | §2, §7 |
| F20 | Cycle 15 regrets | drawBackground() regenerating gradient every frame | Background cached on offscreen canvas — rebuild only on resizeCanvas() | §8.3, §12.9 |
| F21 | Cycle 15 regrets | Balance/sound hands-on verification impossible | Level 1~5 manual play test + 5 sound effect feel-check checklist | §9.2, §12.8 |
| F22 | Cycle 12~15 | "Half implementation" pattern recurrence | Feature-level detailed implementation checklist (§13.3) verifying A+B+C individual completion | §13.3 |
| F23 | Cycle 15 regrets | assets/ 15 consecutive cycles — CI hook mandatory | Review FAIL rule explicit if files exist beyond thumbnail.svg. File list verification included in smoke test §12.7 | §12.6, §12.7 |

---

## §1. Game Overview & Core Fun

### Concept
A **falling block puzzle** where you rotate a central hexagon to align colored blocks falling from 6 directions. Inspired by Hextris — when 3+ blocks of the same color are consecutively adjacent on a side, they are destroyed. Block fall speed increases with level, and the game is over when blocks exceed the limit line.

### Core Fun Elements
1. **Tension of rotation**: Blocks descend simultaneously from 6 directions; aligning them by rotating the central hexagon left/right. Split-second judgment of which direction to receive first is key
2. **Chain destruction satisfaction**: When blocks are destroyed, upper blocks fall down, potentially creating new matches — Cascades. The "lucky moment" when unintended chains trigger
3. **Gradual acceleration immersion**: Level 1 (2s/block) → Level 20 (0.4s/block) progressive acceleration. "Just until this level..." addiction loop
4. **1~3 minutes per game**: Beginners 1 min, experts 3 min+ for short sessions. Instant retry available
5. **Intuitive controls**: A single left/right tap for 60-degree rotation. Anyone understands in 5 seconds

### Genre Balance Contribution
- Current platform: puzzle 6 (merge×2, Match-3×1, word×1, golf×1, rhythm×1) — **0 falling block**
- This game: **puzzle + arcade** → Fills the falling block sub-genre complete gap
- Tetris 500M+ sales, Hextris GitHub 2k+ Stars — Market-validated genre

### Cycle 15 Postmortem Reflection Points
- **Review cycle reduction**: 4 states, 1 objective type ("survival"), no stage objective branching → 2~3 cycle target
- **"Half implementation" prevention**: Limiting feature scope to reduce checklist item count itself
- **Offscreen canvas background caching**: Optimization unapplied in Cycle 15 applied from the start

---

## §2. Game Rules & Objectives

### 2.1 Basic Rules
1. A regular hexagon (hereafter "core") is positioned at screen center
2. Colored blocks fall toward the core from the 6 sides (Side 0~5)
3. Blocks landing on a core side stack on that side (max 4 layers)
4. Player controls block alignment by rotating the core left/right by 60 degrees
5. **3+ blocks of the same color adjacent** are destroyed for points
   - "Adjacent" defined as: Consecutive layers on the same side + connected same-layer blocks on neighboring sides
6. After destruction, upper blocks fall one space down; new matches trigger cascades
7. Game over when blocks on **any side exceed the limit line (core center radius × 2.5)**

### 2.2 Block Colors
Total **6 colors** — Active color count increases with level:

| Level | Active Colors | Colors |
|-------|--------------|--------|
| 1~3 | 3 | Red, Blue, Green |
| 4~7 | 4 | + Yellow |
| 8~12 | 5 | + Purple |
| 13+ | 6 | + Orange |

### 2.3 Game Objectives
- **Survival**: Last as long as possible without blocks exceeding the limit line
- **High score**: Record high score in localStorage
- **Highest level**: Record highest level reached

### 2.4 Level System
- Level up every 10 blocks destroyed (Level 1→2: 10, 2→3: 20 cumulative...)
- Max level 20
- Level-up increases fall speed + brief visual celebration (tween-based)

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| ArrowLeft | Core counter-clockwise 60-degree rotation |
| ArrowRight | Core clockwise 60-degree rotation |
| ArrowDown | Current block instant drop (hard drop) |
| Space | Pause toggle |
| P | Pause toggle |
| Enter | Start game from title/game over |

### 3.2 Mouse
| Action | Effect |
|--------|--------|
| Click left half of screen | Counter-clockwise 60-degree rotation |
| Click right half of screen | Clockwise 60-degree rotation |
| Click bottom center button | Pause toggle |

### 3.3 Touch (Mobile)
| Action | Effect |
|--------|--------|
| Tap left half of screen | Counter-clockwise 60-degree rotation |
| Tap right half of screen | Clockwise 60-degree rotation |
| Swipe down (dy > 50px) | Hard drop |
| Tap pause button | Pause toggle |

**Mobile required settings:**
- `touch-action: none` (scroll prevention)
- `{passive: false}` event listeners
- DPR support: `canvas.width = canvas.clientWidth * dpr`
- `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`

---

## §4. Visual Style Guide

### 4.1 Theme
**Neon Dark** — Consistent with InfiniTriX platform visual identity. Cyberpunk atmosphere with neon glow blocks shining on dark backgrounds.

### 4.2 Color Palette

#### Background
| Element | HEX Code | Usage |
|---------|----------|-------|
| Background top | `#0a0a1a` | Gradient top (dark navy) |
| Background bottom | `#1a0a2e` | Gradient bottom (dark purple) |
| Core fill | `#1a1a3e` | Central hexagon interior |
| Core border | `#4a4a8a` | Central hexagon outline |
| Limit line | `#ff2255` | Game over reference line (semi-transparent circle) |
| Grid lines | `#ffffff10` | Side division guides |

#### Block Colors (Neon)
| Color | Fill HEX | Glow HEX | Letter | Shape |
|-------|----------|----------|--------|-------|
| Red | `#ff3366` | `#ff336680` | R | Circle |
| Blue | `#3388ff` | `#3388ff80` | B | Diamond |
| Green | `#33ff88` | `#33ff8880` | G | Triangle |
| Yellow | `#ffdd33` | `#ffdd3380` | Y | Square |
| Purple | `#bb44ff` | `#bb44ff80` | P | Star |
| Orange | `#ff8833` | `#ff883380` | O | Double circle |

> Color vision accessibility: Color + shape + letter **triple distinction** (Cycle 5/14 verified pattern)

### 4.3 Core Hexagon
- Regular hexagon, **pointy-top** orientation (vertices at top/bottom)
- Circumscribed circle radius: `CONFIG.CORE_RADIUS = 60`px
- Border thickness: 2px, color `#4a4a8a`
- Interior fill: `#1a1a3e`
- 60-degree unit snap on rotation (smooth interpolation via tween, 150ms easeOutCubic)

### 4.4 Blocks
- Trapezoid shape: Narrow on the side touching the core, wider on the outside
- Height: `CONFIG.BLOCK_HEIGHT = 20`px
- Color-specific **shape icon** + **letter** displayed inside block (10px size)
- Neon glow: `shadowBlur = 8`, `shadowColor = respective color glow HEX`

### 4.5 Limit Line
- Circle at `CONFIG.CORE_RADIUS * 2.5 = 150`px radius from core center
- Color: `#ff2255`, transparency 30% (`globalAlpha = 0.3`)
- 3+ layers stacked: transparency 50% warning, 4 layers: 70% danger display

### 4.6 UI Elements
| Element | Position | Size/Font | Color |
|---------|----------|-----------|-------|
| SCORE label | Top-left (10, 24) | 12px | `#888888` |
| Score value | Top-left (10, 44) | 24px bold | `#ffffff` |
| LEVEL label | Top-left (10, 70) | 12px | `#888888` |
| Level value | Top-left (10, 90) | 20px bold | `#33ff88` |
| HIGH SCORE | Top-right (right-10, 24) | 12px | `#888888` |
| High score value | Top-right (right-10, 44) | 18px bold | `#ffdd33` |
| Pause button | Top-right | 48x48px (F1 compliant) | `#ffffff` |
| COMBO display | Above core | 28px bold | `#ff3366` |
| LEVEL UP! | Center | 32px bold, fade | `#33ff88` |

### 4.7 Minimum Touch Target Size
All interactive elements: **48x48px or larger** (CONFIG.MIN_TOUCH_TARGET = 48)
- Pause button: 48x48px
- Left/right rotation tap area: Screen half (always 48px+)
- Game start/restart button: 160x48px

### 4.8 Background Effects
- Slowly moving star particles: 20 count, 1~2px size, 30% transparency
- **Cached on offscreen canvas** (F20): Gradient rendered in `bgCache`, rebuild only on `resizeCanvas()`
- Only star positions updated each frame (y += 0.2), overlaid on bgCache

---

## §5. Core Game Loop

### 5.1 Initialization Order (F5 Compliant)
```
1. Constants/CONFIG object declaration
2. let variable declarations (including canvas, ctx)
3. Utility class definitions (TweenManager, ObjectPool, SoundManager)
4. Game logic pure function definitions
5. window.addEventListener('load', init)
   init() internals:
      a. canvas = document.getElementById('gameCanvas')
      b. ctx = canvas.getContext('2d')
      c. resizeCanvas()
      d. registerEventListeners()
      e. loadHighScore()
      f. enterState(STATE.TITLE)
      g. requestAnimationFrame(gameLoop)
```

### 5.2 Frame Loop (60fps Basis)
```
gameLoop(timestamp):
  try {
    dt = Math.min((timestamp - lastTime) / 1000, 0.033)  // 33ms cap
    lastTime = timestamp

    // State-specific update (refer to §6 matrix)
    update(dt)

    // Rendering
    render()
  } catch(e) {
    console.error(e)
  }
  requestAnimationFrame(gameLoop)
```

### 5.3 update(dt) Flow
```
1. tweenManager.update(dt)          — Runs in all states (matrix)
2. if (state === PLAYING):
   a. dropTimer += dt
   b. if (dropTimer >= dropInterval):
      - Move falling block one space OR land on core side
      - dropTimer = 0
   c. On block landing:
      - findMatches(grid) → List of matching cells
      - if (matches exist): resolveMatches() (isResolving = true)
      - else: spawnNewBlock()
   d. checkGameOver(grid) → Limit line exceeded check
3. particlePool.update(dt)           — Runs in PLAYING + GAMEOVER
```

### 5.4 Core Guard Patterns
- **isResolving**: true during match→destroy→gravity→cascade processing. Blocks new spawns, blocks input
- **isRotating**: true during rotation tween. Blocks additional rotation input
- **_transitioning**: TransitionGuard flag. true during screen transitions

---

## §6. State Machine & State×System Matrix

### 6.1 State Definitions
```
STATE = {
  TITLE: 0,      // Title screen
  PLAYING: 1,    // Game in progress
  PAUSED: 2,     // Paused
  GAMEOVER: 3    // Game over
}
```

### 6.2 State Transition Rules

```
TITLE ---[Enter/tap]---> PLAYING    (beginTransition)
PLAYING ---[Space/P]---> PAUSED    (immediate, exception)
PAUSED ---[Space/P]---> PLAYING    (immediate, exception)
PLAYING ---[limit exceeded]---> GAMEOVER  (beginTransition)
GAMEOVER ---[Enter/tap]---> TITLE   (beginTransition)
```

**STATE_PRIORITY**: `{ GAMEOVER: 3, PAUSED: 2, PLAYING: 1, TITLE: 0 }`
- GAMEOVER transition always highest priority (F17)
- Inside beginTransition(), transition requests with lower priority than current state are ignored

### 6.3 State × System Update Matrix (F6)

| System \ State | TITLE | PLAYING | PAUSED | GAMEOVER |
|---------------|-------|---------|--------|----------|
| TweenManager | O | O | O | O |
| Block falling | X | O | X | X |
| Match detection | X | O | X | X |
| Input handling | Start only | Rotate/drop/pause | Resume only | Restart only |
| ParticlePool | X | O | X | O (remaining) |
| SoundManager | Muted | SFX | Muted | SFX |
| Background stars | O | O | X | O |

### 6.4 enterState(newState) Pattern
Unified initialization on each state entry:
```
enterState(TITLE):    resetGame(), start title tween
enterState(PLAYING):  dropTimer=0, spawnNewBlock()
enterState(PAUSED):   (no additional initialization)
enterState(GAMEOVER): saveHighScore(), start gameover tween, explosion particles
```

---

## §7. Score System

### 7.1 Base Score (F16: addScore() Single Path)
```
addScore(amount):
  score += amount
  // High score check first (check→save order)
  isNewHigh = score > highScore
  if (isNewHigh): highScore = score
```

### 7.2 Score Calculation Formula
| Event | Score | Formula |
|-------|-------|---------|
| 3-block match | 30 | `3 × 10` |
| 4-block match | 50 | `4 × 10 + 10 (bonus)` |
| 5-block match | 80 | `5 × 10 + 30 (bonus)` |
| 6+ block match | `n × 10 + (n-3) × 20` | Excess bonus increases |
| Cascade multiplier | ×(1 + cascade × 0.5) | cascade=0: ×1, cascade=1: ×1.5, cascade=2: ×2, ... |
| Hard drop bonus | 2 × remaining spaces | Fast drop reward |

### 7.3 Combo System
- Tracks consecutive match (cascade) count
- cascade >= 2: Display "COMBO xN" text (above core, fade-out tween)
- cascade >= 3: Subtle screen shake (screenShake tween, 3px, 200ms)
- cascade >= 5: Additional "AMAZING!" text

### 7.4 Level-up Score Bonus
- Level × 100 bonus score on level-up (reaching level 5 gives +500)

---

## §8. Visual Implementation Details

### 8.1 Hexagon Coordinate System
**Pointy-top hexagon** used (vertices at 12 o'clock/6 o'clock):

```
Vertex i (0~5):
  angle = 60deg × i - 30deg  (pointy-top offset)
  x = centerX + radius × cos(angle)
  y = centerY + radius × sin(angle)
```

**Side index**: 0 = upper-right, clockwise 1~5
```
Side 0: Between vertices 0-1
Side 1: Between vertices 1-2
Side 2: Between vertices 2-3
Side 3: Between vertices 3-4
Side 4: Between vertices 4-5
Side 5: Between vertices 5-0
```

### 8.2 Block Rendering
Each block is a trapezoid stacking on a core side:
```
drawBlock(side, layer, color):
  // Calculate two vertex coordinates of the side
  innerR = CORE_RADIUS + layer × BLOCK_HEIGHT
  outerR = innerR + BLOCK_HEIGHT
  // 4 vertices: (side start vertex's innerR, outerR) × 2
  // Trapezoid path -> fill(color) + stroke(borderColor)
  // Display shape+letter at center
```

### 8.3 Background Caching (F20)
```
let bgCache = null;

function buildBgCache():
  bgCache = document.createElement('canvas')
  bgCache.width = canvas.width
  bgCache.height = canvas.height
  const bgCtx = bgCache.getContext('2d')
  // Render gradient background
  const grad = bgCtx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0a0a1a')
  grad.addColorStop(1, '#1a0a2e')
  bgCtx.fillStyle = grad
  bgCtx.fillRect(0, 0, w, h)

function resizeCanvas():
  // ... resize logic ...
  buildBgCache()  // Rebuild only on resize

function render():
  ctx.drawImage(bgCache, 0, 0)  // Draw cached background at once
  // Star particle overlay (position changes only)
  // Game element rendering
```

### 8.4 Rotation Animation
Entire grid rotates with core:
```
rotateCore(direction):  // direction: -1 (counter-clockwise) or +1 (clockwise)
  if (isRotating) return
  isRotating = true
  targetAngle = currentAngle + direction * (Math.PI / 3)  // 60deg
  tweenManager.add({
    obj: coreState,
    prop: 'angle',
    from: currentAngle,
    to: targetAngle,
    duration: 150,
    easing: easeOutCubic,
    onComplete: () => {
      // Rotate grid data (logical)
      rotateGridData(grid, direction)
      currentAngle = targetAngle
      isRotating = false
    }
  })
```

### 8.5 Block Destruction Animation
```
resolveMatches():
  isResolving = true
  matchedCells = findMatches(grid)
  // Destruction tween for matched blocks (150ms, scale 1->0 + alpha 1->0)
  tweenManager.add({
    duration: 150,
    onUpdate: (t) => { /* Interpolate matched block scale/alpha */ },
    onComplete: () => {
      removeMatchedBlocks(grid, matchedCells)
      applyGravity(grid)  // Blocks fall into empty spaces
      // Recursive: Check for new matches
      const newMatches = findMatches(grid)
      if (newMatches.length > 0) {
        cascadeCount++
        resolveMatches()  // Cascade
      } else {
        isResolving = false
        cascadeCount = 0
        spawnNewBlock()
      }
    }
  })
```

---

## §9. Sound System

### 9.1 Web Audio API Procedural Sound (F2: 0 setTimeout)
```
SoundManager:
  ctx: AudioContext (lazy init on first user gesture)
  muted: false

  play(type):
    if (muted || !ctx) return
    const now = ctx.currentTime
    // Per-type oscillator setup (all ctx.currentTime-based scheduling)
```

### 9.2 Sound Effect List (5 Types)
| # | Event | Waveform | Frequency | Duration | Notes |
|---|-------|----------|-----------|----------|-------|
| 1 | Rotation | sine | 440→520Hz | 80ms | Short sweep |
| 2 | Block landing | triangle | 220Hz | 100ms | Dull tone |
| 3 | Match destruction | sine | 523→784Hz | 150ms | Rising tone |
| 4 | Combo (cascade>=2) | sine+square | 659→1047Hz | 200ms | High chord |
| 5 | Game over | sawtooth | 440→110Hz | 500ms | Descending tone |

### 9.3 Sound Feel Checklist (F21)
- [ ] Rotation SFX plays immediately on input
- [ ] Block landing visual+audio feedback are synchronized
- [ ] Cascade combo tone progressively rises for satisfaction
- [ ] Game over SFX conveys sense of defeat
- [ ] All SFX at appropriate volume (gainNode.gain = 0.3 default)

---

## §10. Pure Function Signatures (F11)

> All game logic functions receive data via parameters. Direct global reference forbidden.

| # | Function Name | Parameters | Return Value | Usage |
|---|--------------|-----------|-------------|-------|
| 1 | `hexVertex(cx, cy, r, i)` | Center coords, radius, index | `{x, y}` | Hexagon vertex coordinate |
| 2 | `sideVertices(cx, cy, r, side)` | Center, radius, side index | `[{x,y},{x,y}]` | Two endpoints of a side |
| 3 | `blockVertices(cx, cy, r, side, layer, bh)` | Center, radius, side, layer, block height | `[4 {x,y}]` | Block trapezoid vertices |
| 4 | `findMatches(grid)` | 6×4 grid array | `[{side, layer}]` | Find 3+ adjacent matches |
| 5 | `rotateGridData(grid, dir)` | Grid, direction (+/-1) | New grid | Logical rotation |
| 6 | `applyGravity(grid)` | Grid | Modified grid | Fill empty spaces (gravity) |
| 7 | `checkGameOver(grid, maxLayer)` | Grid, limit layer count | boolean | Game over check |
| 8 | `calcScore(matchCount, cascadeCount)` | Match count, cascade count | number | Score calculation |
| 9 | `getDropInterval(level)` | Level | number (seconds) | Drop speed |
| 10 | `getActiveColors(level)` | Level | number | Active color count |
| 11 | `randomBlock(colorCount, rng)` | Color count, random function | `{color, side}` | New block generation |
| 12 | `isAdjacent(s1, l1, s2, l2)` | Side1, layer1, side2, layer2 | boolean | Adjacency check |

---

## §11. Difficulty System

### 11.1 Drop Speed (Per Level)
```
getDropInterval(level):
  return Math.max(0.4, 2.0 - (level - 1) * 0.085)
```

| Level | Drop Interval (s) | Feel |
|-------|-------------------|------|
| 1 | 2.000 | Relaxed |
| 3 | 1.830 | Relaxed |
| 5 | 1.660 | Normal |
| 8 | 1.405 | Somewhat fast |
| 10 | 1.235 | Fast |
| 13 | 0.980 | Quite fast |
| 15 | 0.810 | Busy |
| 18 | 0.555 | Very busy |
| 20 | 0.400 | Extreme (minimum) |

### 11.2 Color Count Increase (§2.2 Reconfirmation)
4 colors at level 4, 5 colors at level 8, 6 colors at level 13 — More colors reduce match probability, naturally increasing difficulty.

### 11.3 Block Spawn Pattern
- Level 1~5: 1 block drops at a time
- Level 6~10: Occasionally 2 simultaneous drops (30% chance)
- Level 11+: 2 simultaneous drops (50% chance)
- Simultaneous drops must spawn on **different sides** (same side forbidden)

### 11.4 "Rescue" Mechanic
- If all sides have 2+ layers stacked for 5 seconds, next block spawns on the least-stacked side (survival chance)
- cascade >= 4: 0.5s temporary slowdown (serves as both visual effect and reward)

---

## §12. Implementation Guidelines & Checklist

### 12.1 Initialization Order Checklist (F5)
- [ ] All `let`/`const` variables declared before first use
- [ ] `canvas` and `ctx` assigned only inside `init()`
- [ ] All event listeners inside `registerEventListeners()` (called from init())
- [ ] `window.addEventListener('load', init)` — Only top-level event

### 12.2 Forbidden Patterns
- [ ] `setTimeout` / `setInterval` usage 0 instances
- [ ] `eval()` / `Function()` usage 0 instances
- [ ] `alert()` / `confirm()` / `prompt()` usage 0 instances
- [ ] `innerHTML` / `outerHTML` usage 0 instances
- [ ] `fetch()` / `XMLHttpRequest` / `new Image()` usage 0 instances
- [ ] External CDN loads 0 instances (including Google Fonts)
- [ ] `feGaussianBlur` / SVG filter usage 0 instances
- [ ] Game logic functions with direct global variable reference 0 instances

### 12.3 Touch Target Checklist (F1/F4)
- [ ] Pause button: 48x48px or larger
- [ ] Start button: 160x48px or larger
- [ ] Restart button: 160x48px or larger
- [ ] All button sizes directly reference `CONFIG.MIN_TOUCH_TARGET`

### 12.4 Defensive Coding Patterns
- [ ] Game loop `try-catch` wrapping (F12)
- [ ] `localStorage` access `try-catch` wrapping
- [ ] AudioContext creation `try-catch` wrapping
- [ ] Delta time 33ms cap (`Math.min(dt, 0.033)`)

### 12.5 setTimeout Zero Policy (F2/F8)
- State transitions: Only tween `onComplete` callbacks
- Sound sequencing: `ctx.currentTime + offset` native scheduling
- Timer-based events: dt accumulation-based counters (within game loop)

### 12.6 Zero Asset Policy (F3/F23)
- **assets/ directory absolutely forbidden**
- Allowed files: `index.html` + `thumbnail.svg` only
- 100% Canvas code drawing (hexVertex(), drawBlock() etc. §10 functions)
- 100% Web Audio API procedural sound
- Fonts: `monospace`, `sans-serif` system fonts only

### 12.7 Smoke Test Gate (F13/F23)
Mandatory pre-review submission checks:
1. [ ] `index.html` file exists
2. [ ] `thumbnail.svg` file exists
3. [ ] assets/ directory does not exist
4. [ ] No HTML files other than `index.html`
5. [ ] Browser load succeeds
6. [ ] 0 console errors
7. [ ] Title screen displays normally
8. [ ] Game can start (Enter key / tap)
9. [ ] Block falling + core rotation works

### 12.8 Regression Test Checklist (F14)
Full-flow verification after fixes:
1. [ ] TITLE screen displays
2. [ ] TITLE -> PLAYING transition (beginTransition)
3. [ ] PLAYING: Block falling + rotation + matching
4. [ ] PLAYING -> PAUSED -> PLAYING toggle
5. [ ] PLAYING -> GAMEOVER transition (beginTransition)
6. [ ] GAMEOVER -> TITLE transition (beginTransition)
7. [ ] High score save/load

### 12.9 Performance Optimization Checklist (F20)
- [ ] Background gradient: offscreen canvas caching (`bgCache`)
- [ ] `buildBgCache()` rebuild only on resize
- [ ] ObjectPool: 50 particles + 10 popup texts
- [ ] Block rendering: Skip rendering blocks outside viewport

---

## §13. Numerical Consistency Verification

### 13.1 CONFIG Value Table (F10)
| Constant Name | Spec Value | Code Verified |
|--------------|-----------|--------------|
| `CORE_RADIUS` | 60 | [ ] |
| `BLOCK_HEIGHT` | 20 | [ ] |
| `MAX_LAYERS` | 4 | [ ] |
| `GAMEOVER_RADIUS_MULT` | 2.5 | [ ] |
| `MIN_TOUCH_TARGET` | 48 | [ ] |
| `ROTATION_DURATION` | 150 (ms) | [ ] |
| `DROP_INTERVAL_BASE` | 2.0 (s) | [ ] |
| `DROP_INTERVAL_MIN` | 0.4 (s) | [ ] |
| `DROP_INTERVAL_STEP` | 0.085 | [ ] |
| `BLOCKS_PER_LEVEL` | 10 | [ ] |
| `MAX_LEVEL` | 20 | [ ] |
| `SCORE_PER_BLOCK` | 10 | [ ] |
| `COMBO_MULTIPLIER` | 0.5 | [ ] |
| `HARD_DROP_BONUS` | 2 | [ ] |
| `LEVEL_BONUS_MULT` | 100 | [ ] |
| `PARTICLE_POOL_SIZE` | 50 | [ ] |
| `POPUP_POOL_SIZE` | 10 | [ ] |
| `STAR_COUNT` | 20 | [ ] |
| `SCREEN_SHAKE_PX` | 3 | [ ] |
| `SCREEN_SHAKE_MS` | 200 | [ ] |
| `DT_CAP` | 0.033 | [ ] |
| `DUAL_SPAWN_LEVEL` | 6 | [ ] |
| `DUAL_SPAWN_PROB_LOW` | 0.3 | [ ] |
| `DUAL_SPAWN_PROB_HIGH` | 0.5 | [ ] |
| `DUAL_SPAWN_LEVEL_HIGH` | 11 | [ ] |
| `RESCUE_THRESHOLD_SEC` | 5 | [ ] |
| `CASCADE_SLOWDOWN_SEC` | 0.5 | [ ] |
| `CASCADE_SLOWDOWN_MIN` | 4 | [ ] |
| `ACTIVE_COLORS_LV4` | 4 | [ ] |
| `ACTIVE_COLORS_LV8` | 5 | [ ] |
| `ACTIVE_COLORS_LV13` | 6 | [ ] |

### 13.2 Variable Usage Verification Table (F15)
| Variable Name | Declaration | Update Location | Read Location |
|--------------|------------|-----------------|---------------|
| `score` | Global | `addScore()` single | render(), enterState(GAMEOVER) |
| `highScore` | Global | `addScore()`, `loadHighScore()` | render() |
| `level` | Global | `setLevel()` single | getDropInterval(), getActiveColors(), render() |
| `cascadeCount` | Global | resolveMatches() | calcScore(), render (combo UI) |
| `dropTimer` | Global | update() | update() |
| `isResolving` | Global | resolveMatches() start/end | update(), input handler |
| `isRotating` | Global | rotateCore() start/complete | Input handler |
| `grid` | Global (6×4 array) | rotateGridData(), removeMatchedBlocks(), applyGravity() | findMatches(), render(), checkGameOver() |
| `currentAngle` | Global | rotateCore() onComplete | render() |
| `state` | Global | enterState() | update(), render(), input handler |
| `bgCache` | Global | buildBgCache() | render() |

### 13.3 Feature-level Detailed Implementation Checklist (F22)
| # | Feature | Detail Item | Verified |
|---|---------|------------|----------|
| 1 | Core rendering | a. Regular hexagon drawing | [ ] |
| | | b. Pointy-top orientation | [ ] |
| | | c. Border + fill | [ ] |
| 2 | Block rendering | a. Trapezoid shape | [ ] |
| | | b. Per-color neon glow | [ ] |
| | | c. Shape+letter icon | [ ] |
| 3 | Block falling | a. Move toward designated side | [ ] |
| | | b. Land on core side | [ ] |
| | | c. Layer stacking | [ ] |
| 4 | Core rotation | a. Left/right 60-degree tween | [ ] |
| | | b. isRotating guard | [ ] |
| | | c. Grid data logical rotation | [ ] |
| 5 | Match detection | a. Same side consecutive 3+ | [ ] |
| | | b. Neighboring side same layer connection | [ ] |
| | | c. BFS/DFS search | [ ] |
| 6 | Destruction+cascade | a. Destruction tween (150ms) | [ ] |
| | | b. Gravity fall | [ ] |
| | | c. Re-match → cascade loop | [ ] |
| | | d. cascadeCount accurate tracking | [ ] |
| 7 | Level system | a. Level up per 10 blocks | [ ] |
| | | b. Drop speed increase | [ ] |
| | | c. Color count increase | [ ] |
| | | d. Level-up visual effect | [ ] |
| 8 | Hard drop | a. Instant landing | [ ] |
| | | b. Bonus score | [ ] |
| 9 | Game over | a. Limit line exceeded detection | [ ] |
| | | b. Game over animation | [ ] |
| | | c. High score save | [ ] |
| 10 | Touch controls | a. Left/right tap rotation | [ ] |
| | | b. Swipe hard drop | [ ] |
| | | c. touch-action: none | [ ] |
| | | d. passive: false | [ ] |
| 11 | 5 sound types | a. Rotation | [ ] |
| | | b. Landing | [ ] |
| | | c. Destruction | [ ] |
| | | d. Combo | [ ] |
| | | e. Game over | [ ] |
| 12 | Background caching | a. bgCache offscreen | [ ] |
| | | b. Rebuild only on resizeCanvas | [ ] |
| 13 | Limit line display | a. Default 30% transparency | [ ] |
| | | b. 3-layer 50% warning | [ ] |
| | | c. 4-layer 70% danger | [ ] |
| 14 | Dual spawn | a. Level 6+ 30% | [ ] |
| | | b. Level 11+ 50% | [ ] |
| | | c. Different sides | [ ] |

---

## §14. Game Page Sidebar Data

```yaml
game:
  title: "Neon Hex Drop"
  description: "Rotate the central hexagon to align neon blocks falling from 6 directions! Match 3 of the same color to destroy them, aim for high scores with chain combos."
  genre: ["puzzle", "arcade"]
  playCount: 0
  rating: 0
  controls:
    - "← → : Core rotation"
    - "↓ : Hard drop"
    - "Space/P : Pause"
    - "Touch: Left/right tap to rotate, swipe down to drop"
  tags:
    - "#fallingblock"
    - "#hexagon"
    - "#puzzle"
    - "#neon"
    - "#Hextris"
    - "#chaincombo"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## §15. thumbnail.svg Guide

4:3 ratio (400x300px), contents:
- Central neon glow regular hexagon (pointy-top)
- 2~3 layers of colored blocks stacked on 3 sides
- 1 block falling (motion lines)
- "NEON HEX DROP" text at top (neon glow)
- Background: `#0a0a1a` → `#1a0a2e` gradient
- SVG filters **forbidden** (feGaussianBlur etc.) — Glow expressed with pure shapes only (transparency layers)
