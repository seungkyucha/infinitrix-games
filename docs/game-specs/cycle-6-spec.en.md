---
game-id: mini-golf-adventure
title: Mini Golf Adventure
genre: puzzle, casual
difficulty: easy
---

# Mini Golf Adventure — Detailed Game Design Document

> **Cycle:** 6
> **Date:** 2026-03-20
> **Designer:** Claude (Game Designer)
> **Reference:** Based on `docs/analytics/cycle-6-report.md` analysis report — Top recommendation adopted

---

## 0. Previous Cycle Feedback Integration

> Issues and suggestions from the Cycle 5 "Beat Rush" post-mortem are **explicitly** incorporated.

### 0-1. Cycle 5 Issue Resolution Mapping

| Cycle 5 Issue / Suggestion | Severity | Cycle 6 Response |
|---------------------------|----------|-----------------|
| **SVG loading code remnants (ASSET_MAP, SPRITES, preloadAssets)** — Remnant patterns found in initial code even after auto-verification script was introduced | MAJOR | → **§13.5 auto-verification script runs frequently from coding start** rule specified. Physics game uses only circle/line/rectangle code drawing, making SVG inherently unnecessary. Banned pattern verification expanded to 3 stages: before/during/after coding |
| **assets/ directory with 8 SVGs + manifest.json remaining** — Not referenced in code but disk hygiene issue | MINOR | → This game **does not create** an assets/ directory. All visual elements via Canvas API code drawing. §4.5 banned list adds "assets/ directory creation banned" |
| **BPM tween dual registration** — Tween update and direct assignment both exist for single variable | MINOR | → **§10.5 Single update path principle**: Physics values (position, velocity, angle, friction) updated only via physics loop single path. Tweens used only for UI/visual transitions, never for physics variables |
| **Procedural music audio quality limitations** — Am minor key fixed, lack of variety | N/A | → Mini golf is physics-based, not music-based. Web Audio API used only for sound effects (strike, reflect, hole-in-one). Short, clear effect sounds for focused audio feedback |
| **Mobile touch latency correction unverified** | MINOR | → Drag aiming has lower latency sensitivity than rhythm judgment. However, touch coordinate correction (getBoundingClientRect-based) implemented accurately. §3 specifies touch coordinate conversion formula |
| **Try physics-based genre** | Suggestion | → **Mini Golf Adventure adopted!** 2D vector physics (no gravity, reflection + friction) implemented on Canvas + TweenManager + ObjectPool infrastructure |
| **Run verification script frequently during coding** | Suggestion | → **§13.5 specifies 3-stage verification timing**: Before coding start (template check) → During coding (at 50% completion) → After code completion (final verification) |

### 0-2. Verified Patterns from platform-wisdom.md

| Success Pattern | Application |
|----------------|-------------|
| Single HTML + Canvas + Vanilla JS | Same architecture maintained |
| Game state machine (6 states) | LOADING → TITLE → PLAYING → LEVEL_CLEAR → PAUSE → CONFIRM_MODAL → GAMEOVER (expanded to 7 states) |
| DPR support (Canvas internal resolution ≠ CSS) | Same applied |
| localStorage try-catch | Same applied (per-level best strokes stored) |
| TweenManager + clearImmediate() | Cycle 5 stable version inherited directly |
| ObjectPool | Applied to trajectory preview dots, particles, reflection effects |
| HEX codes/formulas in design doc | All values/formulas/color codes specified (target 95% implementation fidelity) |
| Canvas-based modal (confirm/alert banned) | All confirmation UI via Canvas modals |
| TransitionGuard + enterState() | STATE_PRIORITY map + beginTransition() + enterState() inherited directly |
| Web Audio API sound effects | Procedural generation for strike, wall reflect, hole-in-one sounds etc. |
| destroy() + listen() pattern | registeredListeners + listen() + destroy() inherited directly |
| State × system matrix | Defined in §8 design doc + dual inclusion in code comments |
| Complete setTimeout ban | All delayed transitions via tween onComplete |
| Check first, save later | Order fixed in §7 scoring system |
| Ghost variable prevention checklist | §13.4 specifies update/usage for all variables |
| Generous detection | Hole entry detection radius set larger than visual size (§5.7) |

---

## 1. Game Overview & Core Fun Elements

### Concept
A **top-down 2D mini golf** game where you control the ball's direction and power via mouse/touch drag to sink it in the hole with minimum strokes. Progress through 10 levels in order, with each level introducing new elements like wall reflection, moving obstacles, sand zones (increased friction), and warp portals. Ball physics implemented using only **basic 2D vector math (reflection, friction, deceleration)** without external physics libraries.

### Core Fun Elements
1. **Strategic thrill of trajectory prediction** — Dotted line shows predicted trajectory (up to 1st reflection) during drag. Planning "if I hit at this angle, it'll bounce off the wall into the hole" — the billiards/golf brainstorming
2. **Intuitive physics feedback** — Ball bounces off walls via normal reflection, slows on sand — real physics intuitively felt. Delicate control via drag power adjustment
3. **3-star system replay value** — Each level awards 1~3 stars based on strokes vs Par. "How do I get 3 stars on this level?" drives repeated challenges
4. **Gradual obstacle introduction** — Level 1 is open space + hole only; level 10 combines moving walls + sand + portals. One new element per level keeps the learning curve gentle
5. **Dramatic hole-in-one reward** — Sinking in 1 stroke triggers lavish particle explosion + special sound + bonus score. Strong visual/audio reward for rare success

### Genre Diversification Contribution
- **Platform's first physics-based game** — Physics mechanics absent from existing 5 games (puzzle/shooting/strategy/runner/rhythm)
- **puzzle + casual dual tag** — Relieves arcade oversaturation (3/5), puzzle is 2nd after C1
- **Difficulty easy** — Relieves existing medium 4-game bias. Level-based progression makes levels 1~3 easily clearable for beginners
- Market trend (physics puzzle trending) + Cycle 5 post-mortem suggestion perfectly aligned

---

## 2. Game Rules & Objectives

### 2-1. Basic Rules
- Player drags the **Ball** to set direction and power, then releases to launch
- Ball reaching the **Hole** clears the level
- Ball must fully stop (speed < 0.3px/frame) before next shot is available
- Each level has a **Par (standard strokes)** with 1~3 stars awarded based on performance
- Clearing all 10 levels completes the game, showing total score + total stars

### 2-2. Victory/Failure Conditions
- **Level clear**: Ball enters hole detection circle (radius 20px, visual radius 16px) and speed < 2.0px/frame
- **No level failure**: Unlimited strokes (only star count decreases). However, exceeding 10 strokes shows "give up and skip to next level" option
- **Game complete**: All 10 levels cleared → result screen

### 2-3. Physics Rules
- **Friction deceleration**: Every frame `velocity *= friction` (default friction = 0.985)
- **Wall reflection**: Normal vector-based perfect reflection, on reflect `speed *= 0.85` (energy loss)
- **Sand zone**: Friction = 0.95 (3.5× faster deceleration vs default 0.985)
- **Water zone**: Ball entry → +1 stroke penalty then return to previous position
- **Portal**: Enter input → exit at same velocity
- **Minimum speed threshold**: `speed < 0.3` → ball stops

---

## 3. Controls

### 3-1. Mouse Controls
| Action | Input | Description |
|--------|-------|-------------|
| Aiming | Mouse down on ball + drag | Shows launch direction in opposite direction of drag (dotted trajectory) |
| Power adjust | Drag distance | `power = min(dragDist × 0.15, MAX_POWER)`, MAX_POWER = 15 |
| Launch | Mouse up | Launch ball with calculated direction + power |
| Camera movement | None | Entire level auto-scaled to fit screen |

### 3-2. Keyboard Controls
| Key | Action |
|-----|--------|
| `R` | Restart current level |
| `ESC` | Pause / menu |
| `Space` | Skip current shot (ball rolling: 4× speed acceleration, not debug) |

### 3-3. Touch Controls
| Action | Input | Description |
|--------|-------|-------------|
| Aiming | Touch ball + drag | Same as mouse. `touch.clientX/Y` → Canvas coordinate conversion via `getBoundingClientRect()` |
| Power adjust | Drag distance | Same formula as mouse |
| Launch | Touch end | Same as mouse up |

### 3-4. Touch Coordinate Conversion Formula
```
canvasX = (touch.clientX - rect.left) / rect.width * CANVAS_W
canvasY = (touch.clientY - rect.top) / rect.height * CANVAS_H
```
Note: With DPR applied, Canvas internal resolution is `CANVAS_W × DPR` but coordinate calculation uses logical resolution (`CANVAS_W`)

### 3-5. Input Mode Branching
```
let inputMode = 'mouse'; // 'mouse' | 'touch'
// On touchstart → inputMode = 'touch', ignore mouse events
// On mousemove (if no touchstart history) → inputMode = 'mouse'
```
**⚠️ platform-wisdom [Cycle 2]**: inputMode variable must be used in actual branching. Declaration-only without usage is banned.

---

## 4. Visual Style Guide

### 4-1. Color Palette

| Role | HEX | Description |
|------|-----|-------------|
| Background (grass) | `#1A4D2E` | Dark green — golf course feel |
| Wall | `#8B9DAF` | Soft blue-gray — clear boundary |
| Wall highlight | `#C8D6E5` | Light gray — 3D top feel |
| Ball | `#FFFFFF` | Pure white — high contrast visibility |
| Ball shadow | `rgba(0,0,0,0.3)` | Small circle below ball for height feel |
| Hole | `#0A0A0A` | Near black — pit feel |
| Hole border | `#4A4A4A` | Dark gray — hole edge depth |
| Trajectory dots | `rgba(255,255,255,0.6)` | Semi-transparent white — aiming guide |
| Power gauge (low) | `#2ECC71` | Green |
| Power gauge (mid) | `#F39C12` | Orange |
| Power gauge (high) | `#E74C3C` | Red |
| Sand zone | `#D4A574` | Light brown — desert/sand |
| Water zone | `#3498DB` | Blue — water hazard |
| Portal A | `#9B59B6` | Purple |
| Portal B | `#E67E22` | Orange |
| Star (earned) | `#F1C40F` | Gold |
| Star (not earned) | `#34495E` | Dark gray |
| UI text | `#ECF0F1` | Light gray |
| UI highlight | `#1ABC9C` | Mint — InfiniTriX brand tone |
| Par text | `#95A5A6` | Medium gray |

### 4-2. Object Shapes

| Object | Rendering | Size (logical px) |
|--------|----------|------------------|
| Ball | `arc()` circle + radialGradient (white→light gray) + shadow circle | Radius 8px |
| Hole | `arc()` circle (2-tier: outer #4A4A4A r=18, inner #0A0A0A r=14) + flag pole (line + triangle) | Detection radius 20px |
| Wall | `fillRect()` + 3px top highlight (3D feel) | Variable (10px thickness default) |
| Moving wall | Same as wall + `rgba(255,255,100,0.3)` glow | Variable |
| Sand zone | `fillRect()` + dot pattern (3×3px grid of dark dots) | Variable |
| Water zone | `fillRect()` + wave lines (sin wave, phase shifts each frame) | Variable |
| Portal | `arc()` circle + 4 rotating particles (angle += 0.05 each frame) | Radius 14px |
| Trajectory preview | 5px interval circles (r=2), alpha decreasing with distance | Max 20 dots |
| Flag | `lineTo()` vertical line (30px) + `fillRect()` triangle (red #E74C3C) | See above |
| Power bar | 40×6px bar above ball, green→orange→red gradient based on power ratio | 40×6px |

### 4-3. Background
- **Grass texture**: Cached on offscreen canvas. `#1A4D2E` solid + random 200 bright dots (`#1F5C36`) for grass feel
- **Level border**: Entire area wrapped with 8px dark border `#0F3D20`
- Level number + Par display: Top-left, font `"16px monospace"`, `#ECF0F1`

### 4-4. Effects

| Effect | Trigger | Implementation |
|--------|---------|---------------|
| Wall reflect sparks | Ball reflects off wall | 6 particles burst from collision point (lifespan 0.3s, color #C8D6E5) |
| Hole-in particles | Ball enters hole | 20 particles circular burst from hole center (lifespan 0.8s, star color #F1C40F) |
| Hole-in-one special | Hole in 1 stroke | Hole-in particles × 3 density + gold flash on screen edges tween (0.5s) |
| Water splash | Ball enters water zone | 10 blue particles burst upward from water position + ball fadeOut tween |
| Portal movement | Ball enters portal | Entry shrink tween (0.2s) → exit expand tween (0.2s) |
| Level transition | Level cleared | Full screen fade out/in tween (0.4s each) |
| Star earned | Stars shown on level clear | 1~3 stars sequentially scale 0→1.2→1.0 tween + rotation |

### 4-5. Banned List (Auto-Verification Targets)

| # | Banned Pattern | Reason |
|---|---------------|--------|
| 1 | `<svg`, `.svg`, `SVG` | External SVG asset ban (Cycle 2~5 recurrence prevention) |
| 2 | `new Image()`, `img.src` | External image loading ban |
| 3 | `ASSET_MAP`, `SPRITES`, `preloadAssets` | SVG preload remnant code ban (Cycle 5 remnant recurrence prevention) |
| 4 | `feGaussianBlur`, `filter:` | SVG filter ban |
| 5 | `setTimeout` (state transition context) | Replace with tween onComplete |
| 6 | `confirm(`, `alert(` | iframe incompatible, replace with Canvas modal |
| 7 | `Google Fonts`, `@import url` | External font loading ban |
| 8 | `assets/` directory creation | All visual elements via Canvas code drawing |

---

## 5. Core Game Loop

### 5-1. Main Loop (requestAnimationFrame, 60fps target)

```
function gameLoop(timestamp) {
  const dt = min((timestamp - lastTime) / 1000, 0.05); // Max 50ms cap
  lastTime = timestamp;

  switch (state) {
    case LOADING:  updateLoading(dt);  break;
    case TITLE:    updateTitle(dt);    break;
    case PLAYING:  updatePlaying(dt);  break;
    case LEVEL_CLEAR: updateLevelClear(dt); break;
    case PAUSE:    updatePause(dt);    break;
    case CONFIRM_MODAL: updateConfirmModal(dt); break;
    case GAMEOVER: updateGameOver(dt); break;
  }

  render(state);
  requestAnimationFrame(gameLoop);
}
```

### 5-2. updatePlaying(dt) Detailed Flow

```
1. tw.update(dt)                    // TweenManager update
2. if (ball.moving) {
     a. ball.vx *= friction          // Friction deceleration
        ball.vy *= friction
     b. checkWallCollisions()        // Wall reflection (normal vector)
     c. checkZoneEffects()           // Sand/water/portal special zones
     d. ball.x += ball.vx            // Position update
        ball.y += ball.vy
     e. if (speed < 0.3) stopBall()  // Stop check
     f. checkHoleCollision()         // Hole entry check
   }
3. updateMovingWalls(dt)             // Moving wall position update
4. updatePortalAnim(dt)              // Portal rotation animation
5. updateWaterAnim(dt)               // Water wave phase shift
6. updateParticles(dt)               // Particle lifespan management
```

### 5-3. Core Physics Functions

#### Wall Reflection (Normal Reflection)
```
// wall: {x1, y1, x2, y2}
// Wall normal vector N = normalize(perpendicular(wall direction))
// Reflection: V' = V - 2 * dot(V, N) * N
// Energy loss: V' *= 0.85
function reflectBall(ball, wall) {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const len = Math.sqrt(dx*dx + dy*dy);
  const nx = -dy / len;  // Normal x
  const ny = dx / len;   // Normal y
  const dot = ball.vx * nx + ball.vy * ny;
  ball.vx = (ball.vx - 2 * dot * nx) * 0.85;
  ball.vy = (ball.vy - 2 * dot * ny) * 0.85;
}
```

#### Ball-Wall Collision Detection (Point-Segment Distance)
```
// Collision if minimum distance from ball center to wall segment < ball.radius
function pointToSegmentDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = clamp(((px-x1)*dx + (py-y1)*dy) / (dx*dx + dy*dy), 0, 1);
  const cx = x1 + t*dx, cy = y1 + t*dy;
  return Math.sqrt((px-cx)**2 + (py-cy)**2);
}
```

#### Hole Entry Detection
```
// Generous detection: Detection radius 20px > visual radius 16px
const dist = Math.sqrt((ball.x-hole.x)**2 + (ball.y-hole.y)**2);
const speed = Math.sqrt(ball.vx**2 + ball.vy**2);
if (dist < 20 && speed < 2.0) {
  // Hole in! → Process level clear
}
// Ball passing over hole at high speed does not enter (realistic)
```

### 5-4. Aiming System

```
// Mouse down start point: aimStart = {x, y}
// Mouse move current point: aimCurrent = {x, y}
// Launch vector: direction = normalize(aimStart - aimCurrent)
// Launch power: power = min(dist(aimStart, aimCurrent) * 0.15, 15)

// Trajectory preview: Simulate from ball position in direction * power
// Show dotted line up to 1 reflection max (infinite reflection display causes visual confusion)
function drawTrajectory(ctx) {
  let simX = ball.x, simY = ball.y;
  let simVx = direction.x * power;
  let simVy = direction.y * power;
  let bounced = false;

  for (let i = 0; i < 20; i++) {
    simX += simVx * 3;  // Dots placed at 3-frame intervals
    simY += simVy * 3;
    simVx *= 0.985;      // Friction applied
    simVy *= 0.985;

    // Wall collision check → simulate reflection (1 time only)
    if (!bounced && checkSimWallHit(simX, simY)) {
      reflectSim(); bounced = true;
    }

    ctx.globalAlpha = 0.6 - i * 0.025;
    ctx.beginPath();
    ctx.arc(simX, simY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

### 5-7. Generous Hole Detection
- Hole visual radius: 16px (drawn size)
- Hole detection radius: **20px** (4px wider than visual)
- Speed threshold: `speed < 2.0` required for hole entry (too fast passes through)
- **[platform-wisdom ✅]**: Generous detection provides satisfaction of "barely making it in"

---

## 6. Difficulty System

### 6-1. Level Design (10 Levels)

| Level | Par | Introduced Element | Difficulty Feel |
|-------|-----|-------------------|----------------|
| 1 | 2 | Open space, short ball→hole distance | Tutorial: Learn drag controls |
| 2 | 2 | 1 L-shaped wall (1 reflection needed) | Reflection concept introduced |
| 3 | 3 | 2 walls + obstacle between ball and hole | Reflection path planning |
| 4 | 3 | Sand zone introduced (center sand patch) | Power control learning |
| 5 | 3 | Water zone introduced (water beside narrow passage) | Precision aiming |
| 6 | 4 | 1 moving wall (left-right oscillation) | Timing introduced |
| 7 | 4 | 1 portal pair (entry→exit warp) | Spatial teleportation concept |
| 8 | 4 | 2 moving walls + sand combination | Complex obstacles |
| 9 | 5 | Portal + moving wall + water | High difficulty complex |
| 10 | 5 | All elements combined, minimum path requires 2 reflections | Final challenge |

### 6-4. Star System

| Condition | Stars |
|-----------|-------|
| Strokes ≤ Par - 1 | ★★★ (3) |
| Strokes = Par | ★★☆ (2) |
| Strokes = Par + 1 | ★☆☆ (1) |
| Strokes ≥ Par + 2 | ☆☆☆ (0, still cleared) |

---

## 7. Scoring System

### 7-1. Per-Level Score
```
levelScore = max(0, (par - strokes + 3)) × 100
// Par 2, 1-stroke clear: (2 - 1 + 3) × 100 = 400 pts
// Par 2, 2-stroke clear: (2 - 2 + 3) × 100 = 300 pts
// Par 2, 5-stroke clear: (2 - 5 + 3) × 100 = 0 pts (minimum 0)
```

### 7-2. Bonus Scores
| Bonus | Condition | Score |
|-------|-----------|-------|
| Hole-in-one | Clear in 1 stroke | +500 |
| Perfect reflection | Direct hole-in after 1 reflection | +200 |
| Speed bonus | Clear within 10s of level start | +150 |

### 7-3. Total Score
```
totalScore = sum(levelScores) + sum(bonuses)
```

### 7-4. Best Record Storage (localStorage)
```javascript
// ⚠️ Check first, save later (platform-wisdom [Cycle 2])
const prevBest = getBest();        // 1. Check: Get previous record
const isNewBest = totalScore > prevBest;  // 2. Compare
saveBest(totalScore);              // 3. Save
// Reflect isNewBest in UI
```

---

## 8. State × System Update Matrix

| State \ System | TweenMgr | Physics | MovingWalls | Particles | Anim(Portal/Water) | Input | Render |
|---------------|----------|---------|-------------|-----------|-------------------|-------|--------|
| LOADING | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (loading bar) |
| TITLE | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ (click=start) | ✅ |
| PLAYING | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (drag aiming) | ✅ |
| LEVEL_CLEAR | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ (click=next) | ✅ |
| PAUSE | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (ESC=resume) | ✅ (semi-transparent overlay) |
| CONFIRM_MODAL | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (yes/no) | ✅ |
| GAMEOVER | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ (click=title) | ✅ |

**Core**: TweenManager is **always** updated in every state. Cycle 2 B1 recurrence prevention.

---

## 9. Sound Design (Web Audio API Procedural Generation)

| Sound | Trigger | Generation |
|-------|---------|-----------|
| Strike (thud) | Ball launched | 100Hz sine → 50Hz, 0.1s decay. gain 0.4→0 |
| Wall reflect (tap) | Ball wall collision | 800Hz triangle, 0.05s decay. gain 0.3→0 |
| Sand friction | Ball enters sand | White noise (random buffer), 0.2s, gain 0.15 |
| Water splash | Ball enters water | White noise + 300Hz sine mix, 0.3s |
| Hole-in (ding!) | Ball enters hole | 523Hz(C5) sine → 659Hz(E5) → 784Hz(G5) sequential (each 0.1s), gain 0.5 |
| Hole-in-one (fanfare!) | 1-stroke hole-in | Hole-in sound + 1047Hz(C6) added, total 0.6s |
| Portal warp | Ball enters portal | 200Hz→800Hz sine sweep 0.3s, gain 0.3 |
| Star earned | Star display | 1000Hz sine, 0.05s, gain 0.2 (pitch rises +100Hz per star) |
| UI click | Button click | 600Hz square, 0.03s, gain 0.2 |

---

## 10. Core System Design

### 10-1. Vector2 Class
```javascript
class Vector2 {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  add(v)    { return new Vector2(this.x + v.x, this.y + v.y); }
  sub(v)    { return new Vector2(this.x - v.x, this.y - v.y); }
  scale(s)  { return new Vector2(this.x * s, this.y * s); }
  dot(v)    { return this.x * v.x + this.y * v.y; }
  len()     { return Math.sqrt(this.x**2 + this.y**2); }
  normalize() {
    const l = this.len();
    return l > 0 ? this.scale(1/l) : new Vector2(0, 0);
  }
  reflect(normal) {
    const d = 2 * this.dot(normal);
    return new Vector2(this.x - d * normal.x, this.y - d * normal.y);
  }
}
```

### 10-5. Single Update Path Principle

> **[Cycle 5 B2 prevention]**: Update path for any single value must be unified to exactly one

| Variable | Update Path | Banned |
|----------|-----------|-------|
| `ball.x`, `ball.y` | Physics loop (`ball.x += ball.vx`) | Tween position movement banned (except hole-in effect) |
| `ball.vx`, `ball.vy` | Physics loop (friction, reflection) | Direct assignment only once on launch |
| `movingWall.x/y` | `updateMovingWalls()` (sin/cos-based oscillation) | Tween banned |
| UI alpha, scale | TweenManager | Direct assignment banned |

---

## 11. Level Detailed Design

> Coordinate system: Game area 480×420px, origin (0, 60) — 60px top UI offset

### Level 1 — "First Putt"
```
Par: 2 | New element: None (tutorial)
Ball: (80, 280) | Hole: (400, 280)
Walls: Outer only
Hint: "Drag the ball to set launch direction and power!"
```

### Level 2 — "First Reflection"
```
Par: 2 | New element: L-shaped wall
Ball: (80, 400) | Hole: (400, 150)
Walls: Outer + (200,100)→(200,350) vertical wall
Design intent: Must bounce once off wall to reach hole
```

### Level 3 — "Zigzag"
```
Par: 3 | 2 obstacles
Ball: (60, 400) | Hole: (420, 120)
Walls: Outer + (160,60)→(160,300) + (320,180)→(320,420)
Design intent: Zigzag through 2 walls
```

### Level 4 — "Sand Trap"
```
Par: 3 | New element: Sand zone
Ball: (80, 400) | Hole: (400, 120)
Walls: Outer + (240,200)→(240,350) center wall
Sand: (150,200, 140,120) — Left-center rectangle sand
Design intent: Avoid sand or hit hard enough to power through
```

### Level 5 — "Water Hazard"
```
Par: 3 | New element: Water zone
Ball: (80, 280) | Hole: (420, 280)
Walls: Outer + (200,180)→(200,380) + (300,180)→(300,380)
Water: (210,180, 80,200) — Water between the two walls
Design intent: Precision aim through narrow passage safe zone above water
```

### Level 6 — "Moving Gate"
```
Par: 4 | New element: Moving wall
Ball: (80, 400) | Hole: (420, 120)
Walls: Outer + fixed wall (240,60)→(240,250)
MovingWall: (240,300)→(240,380), left-right oscillation ±60px, period 3s
Design intent: Time your shot through the moving wall
```

### Level 7 — "Portal Jump"
```
Par: 4 | New element: Portal
Ball: (80, 400) | Hole: (420, 120)
Walls: Outer + (240,60)→(240,420) full dividing wall
Portal A: (180, 200) purple | Portal B: (320, 300) orange
Design intent: Enter right-side area via portal from left side
```

### Level 8 — "Desert Path"
```
Par: 4 | Combo: 2 moving walls + sand
Ball: (60, 400) | Hole: (420, 100)
Walls: Multiple fixed walls forming narrow passages
MovingWalls: 2 (oscillating at passage entrance/exit)
Sand: Entire passage floor
Design intent: Sand slowdown + timing combo
```

### Level 9 — "Chaos Course"
```
Par: 5 | Combo: Portal + moving wall + water
Ball: (60, 420) | Hole: (420, 100)
Walls: Maze-style multiple walls
Portal: 1 pair (for bypassing water hazard)
MovingWall: 1 (left-right oscillation near hole)
Water: 2 zones (mistake penalty)
Design intent: Test understanding of all elements
```

### Level 10 — "Master Hole"
```
Par: 5 | All elements combined
Ball: (60, 420) | Hole: (420, 80)
Walls: Complex maze (minimum path requires 2 reflections)
MovingWalls: 2
Sand: 2 zones
Water: 1 zone
Portal: 1 pair
Design intent: Final challenge, hole-in-one impossible by design (Par 5 needed)
```

---

## 12. Game Page Sidebar Data

```yaml
game:
  title: "Mini Golf Adventure"
  description: "Drag to hit the ball and aim for hole-in-one with minimum strokes! A physics puzzle golf with wall reflections, sand traps, moving obstacles, and portals across 10 levels."
  genre: ["puzzle", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "Mouse Drag: Aiming + Power Control"
    - "Mouse Release: Launch Ball"
    - "Touch Drag: Mobile Aiming"
    - "R: Restart Level"
    - "ESC: Pause"
    - "Space: Ball Movement Acceleration"
  tags:
    - "#minigolf"
    - "#physicspuzzle"
    - "#dragaiming"
    - "#levelbased"
    - "#wallreflection"
    - "#3stars"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

---

## 13. Implementation Checklist & Verification

### 13-1. Design Doc Verification Checklist

| # | Item | Design Doc Location | Check |
|---|------|-------------------|-------|
| 1 | Drag aiming + trajectory preview (up to 1st reflection) | §5.4 | ☐ |
| 2 | Power bar (green→orange→red) | §5.5 | ☐ |
| 3 | Wall reflection (normal-based) + energy loss 0.85 | §5.3 | ☐ |
| 4 | Friction deceleration 0.985, sand 0.95 | §2.3 | ☐ |
| 5 | Water zone +1 stroke penalty + previous position return | §2.3 | ☐ |
| 6 | Portal entry→exit same velocity ejection | §2.3 | ☐ |
| 7 | Moving walls (sin-based oscillation) | §6.1 (Level 6~) | ☐ |
| 8 | Hole detection: radius 20px + speed < 2.0 | §5.7 | ☐ |
| 9 | 3-star system (Par-1/Par/Par+1) | §6.4 | ☐ |
| 10 | Score formula: max(0, (par-strokes+3))×100 | §7.1 | ☐ |
| 11 | Hole-in-one bonus +500 | §7.2 | ☐ |
| 12 | All 10 levels fully implemented | §11 | ☐ |
| 13 | Web Audio sound effects (9 types) | §9.1 | ☐ |
| 14 | localStorage best record + per-level best strokes | §7.4, §7.5 | ☐ |
| 15 | Canvas modal (confirm/alert not used) | §4.5 | ☐ |
| 16 | DPR support | §4 | ☐ |
| 17 | State × system matrix compliance | §8 | ☐ |
| 18 | enterState() pattern applied | §10.6 | ☐ |
| 19 | inputMode variable actually used in branching | §3.5 | ☐ |
| 20 | Power gauge 3-stage colors | §5.5 | ☐ |

### 13-5. Auto-Verification Script (3-Stage Execution)

> **[Cycle 5 lesson]**: Not just once after completion, but 3-stage execution: before/during/after coding

**Execution timing:**
1. **Before coding start** — Template/boilerplate verification (confirm SVG remnant code removed)
2. **At 50% completion** — Mid-point check (early detection of banned pattern infiltration)
3. **After code completion** — Final verification (confirm zero banned patterns overall)

---

## 14. Technical Implementation Summary

| Item | Implementation |
|------|---------------|
| Architecture | Single index.html, Canvas 2D API, Vanilla JS |
| Physics | Vector2 class, normal reflection, friction deceleration, energy loss |
| State management | 7-state FSM + TransitionGuard + enterState() |
| Animation | TweenManager (clearImmediate included) + 5 easing types |
| Object management | ObjectPool (particles 40, trajectory dots 25) |
| Sound | Web Audio API procedural sound effects (9 types) |
| Storage | localStorage (try-catch), total score + per-level best strokes |
| Level data | JS array literals (10 levels, no external JSON needed) |
| Input | mouse + touch dual support, inputMode branching |
| Rendering | Offscreen canvas background cache + real-time object drawing |
| Events | listen() helper + destroy() pattern |
| Verification | Auto grep script, 3-stage execution |
