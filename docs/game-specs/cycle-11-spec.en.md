---
game-id: mini-platformer
title: Mini Platformer
genre: action, arcade
difficulty: medium
---

# Mini Platformer — Detailed Game Design Document (Cycle 11)

---

## §0. Previous Cycle Feedback Mapping

| # | Source | Problem/Suggestion | Solution in This Spec |
|---|--------|-------------------|----------------------|
| 1 | Cycle 11 Analysis Report | **Platformer mechanics 0% — missing basic genre** | ✅ This game adds the platform's first platformer genre |
| 2 | Cycle 11 Analysis Report | **Casual 60% concentration** | ✅ Pure action+arcade tags. No casual tag |
| 3 | Cycle 11 Analysis Report | **Action at 20% is insufficient** | ✅ Action 2→3 titles reinforced (20%→30%) |
| 4 | Cycle 10 Postmortem | **assets/ directory recurring for 10 cycles** | §12.1 — **assets/ directory creation absolutely forbidden.** All visuals are Canvas API code drawing (fillRect, arc, lineTo, fillText). 0 SVG/image files |
| 5 | Cycle 10 Postmortem | **Abbreviated variable names → CRITICAL bug** | §11 — Variable name abbreviation rule table pre-defined. Ambiguous abbreviations forbidden, consistent prefix rules applied |
| 6 | Cycle 10 Postmortem | **Deckbuilding balance unverified** | This game has no card system. Instead, §6 difficulty curve defined as per-level CONFIG constants for numerical consistency verification |
| 7 | Cycle 10 Postmortem | **Common engine modules still not separated after 10 cycles** | §12.10 — This spec maintains identical interfaces when using TweenManager, ObjectPool, TransitionGuard from previous cycles. Separation is a separate task |
| 8 | Cycle 10 Postmortem Suggestion | **Challenge unexplored genres** | ✅ Platformer = top popularity on itch.io/CrazyGames + genre not yet on platform |
| 9 | Cycle 10 Postmortem Suggestion | **Generalize Seeded RNG** | §6.5 Daily challenge mode uses Seeded RNG (verified in Cycles 7/10) |
| 10 | platform-wisdom [Cycle 1~8] | **SVG feGaussianBlur recurrence** | 0 external SVG files. Canvas drawRect/arc/lineTo only. §12.2 forbidden pattern list |
| 11 | platform-wisdom [Cycle 1~2] | **setTimeout state transition forbidden** | §5 All delayed transitions use tween onComplete. 0 setTimeout usage target |
| 12 | platform-wisdom [Cycle 4] | **cancelAll+add race condition** | §12.4 clearImmediate() immediate cleanup API usage |
| 13 | platform-wisdom [Cycle 2] | **State×system matrix required** | §5.3 full matrix included (5 states × 7 systems) |
| 14 | platform-wisdom [Cycle 6~7] | **Pure function principle violation** | §10 All game logic functions are parameter-based pure functions. 0 global references target |
| 15 | platform-wisdom [Cycle 7] | **Spec-implementation value mismatch** | §6, §7 all balance values mapped 1:1 as CONFIG object constants. §12.5 numerical consistency verification table |
| 16 | platform-wisdom [Cycle 8] | **beginTransition() bypass** | §5.2 All transitions go through `beginTransition()`. Immediate transitions also use `beginTransition(state, {immediate:true})` |
| 17 | platform-wisdom [Cycle 3] | **Missing guard flags** | §5.2 `isTransitioning` guard flag applied to all transitions |
| 18 | platform-wisdom [Cycle 2~3] | **Ghost variable prevention** | §12.3 full verification checklist for all declared variable usage |
| 19 | platform-wisdom [Cycle 5] | **Unified single value update path** | Each value uses either tween OR direct assignment, not both |
| 20 | platform-wisdom [Cycle 1] | **confirm/alert forbidden in iframe** | All confirmation UI uses Canvas-based modal |
| 21 | platform-wisdom [Cycle 8] | **drawTitle dt hardcoding** | All render/update functions receive dt as parameter from gameLoop |
| 22 | platform-wisdom [Cycle 11] | **let/const TDZ crash — variable declaration positioned after first use** | §12.7 — All `let`/`const` variables declared before first reference/call. Initialization block execution order verification checklist added |
| 23 | platform-wisdom [Cycle 11] | **Idle game tab switching causes system halt** | This game has no tab UI, but PAUSE↔PLAY transition physics/particle resume order guaranteed by §5.3 matrix |
| 24 | platform-wisdom [Cycle 10] | **Fix regression — call site propagation missed on signature change** | §12.8 — When changing function signatures, verify propagation to all call sites + downstream functions |
| 25 | Cycle 10 Postmortem Suggestion | **Fix regression prevention automation (Puppeteer)** | Outside this spec's scope (separate infra task). Instead, §12.8 includes manual full-path regression test checklist |
| 26 | platform-wisdom [Cycle 11] | **assets/ non-creation maintained for 11 consecutive cycles** | §12.1 — Same principle maintained. 100% Canvas code drawing |
| 27 | platform-wisdom [Cycle 10] | **Game loop try-catch wrapping required** | §12.9 — `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` pattern applied by default |

---

## §1. Game Overview & Core Fun

### Concept
A **precision platformer** where you break through a crumbling ancient tower using **wall jumps, dashes, and double jumps**. The "die and retry" core loop of Celeste and Super Meat Boy condensed into a single index.html. 5 worlds (Forest→Cave→Sky→Lava→Starlight Tower), 5 stages per world = **25 stages total**. Average stage clear time 20~40 seconds, full clear approximately **15~25 minutes**. Each stage offers 3 collectible gems + a speedrun timer for replay value.

### 3 Core Fun Elements
1. **Achievement through precision controls**: Generous input correction with coyote time, jump buffering, corner correction — a satisfying feel of "it moves exactly as I intended." Overwhelming satisfaction when breaking through difficult sections
2. **Die and retry addiction**: Instant respawn within 0.3 seconds on death. No loading, minimal penalty. Endless attempts of "just one more try"
3. **Collection and mastery**: 3 gems per stage + 1 hidden gem + speedrun records. "Easy to clear but hard to master"

### References
- **Celeste**: The textbook of precision platformers. Input correction techniques like coyote time, jump buffering, variable jump height
- **Super Meat Boy**: Addictive loop of instant death + instant respawn
- **Geometry Dash**: Top-ranked on CrazyGames. Proven mass appeal of one-button rhythm platformer

### Game Page Sidebar Info
```yaml
title: "Mini Platformer"
description: "Conquer the ancient tower with wall jumps, dashes, and double jumps! Precision action platformer."
genre: ["action", "arcade"]
playCount: 0
rating: 0
controls:
  - "Keyboard: Arrow/WASD move, Space jump, Shift dash"
  - "Touch: Virtual D-pad (left) + Jump/Dash buttons (right)"
  - "Mouse: Menu selection only"
tags:
  - "#platformer"
  - "#precisionaction"
  - "#walljump"
  - "#speedrun"
  - "#singleplayer"
addedAt: "2026-03-21"
version: "1.0.0"
featured: true
```

---

## §2. Game Rules & Objectives

### 2.1 Ultimate Goal
Clear 5 worlds × 5 stages = 25 stages in order. Ending upon clearing the final world's (Starlight Tower) last stage.

### 2.2 Stage Rules
- Player starts at the **spawn point** and clears by reaching the **goal flag**
- Touching hazards (spikes, lava, fall) causes **instant death** → Instant respawn at current stage start (or checkpoint)
- No life limit (infinite retries)
- **3 gems** placed per stage — Collection is optional but required for hidden stage unlocks

### 2.3 World Themes & Unlocked Movesets

| World | Theme | Color | New Moveset | New Obstacles |
|-------|-------|-------|-------------|---------------|
| 1 | 🌲 Green Forest | #2d5a27 + #8fbc8f | Basic movement + jump | Spikes, moving platforms |
| 2 | 🪨 Rock Cave | #4a3728 + #d4a574 | **Wall jump** | Crumbling platforms, falling rocks |
| 3 | ☁️ Cloud Sky | #87ceeb + #f0f8ff | **Double jump** | Wind (horizontal push), disappearing cloud platforms |
| 4 | 🔥 Lava Zone | #8b0000 + #ff6347 | **Dash** | Rising lava, flame pillars |
| 5 | ✨ Starlight Tower | #1a0a2e + #e0b0ff | All movesets combined | Gravity inversion zones, lasers |

### 2.4 Progression System
- Clearing World N unlocks World N+1
- Hidden stages unlock based on total gems collected (at 50/75 gems)
- Speedrun records saved to localStorage
- **Daily Challenge**: Seeded RNG generates the same procedural stage each day (§6.5)

---

## §3. Controls

### 3.1 Keyboard (Default)
| Input | Action |
|-------|--------|
| ← → or A D | Horizontal movement |
| ↑ or W | Look up (camera panning) |
| ↓ or S | Look down / crouch |
| Space | Jump (hold for higher jump) |
| Shift or X | Dash (World 4 onwards) |
| R | Instant respawn (voluntary retry) |
| ESC / P | Pause |

### 3.2 Touch (Mobile)
```
┌─────────────────────────────────────────┐
│                 Game Area                │
│                                         │
│  ┌───┐                      ┌───┬───┐  │
│  │ ◀ │  ┌───┐              │ B │ A │  │
│  ├───┤  │ ▼ │              ├───┼───┤  │
│  │ ▶ │  └───┘              │ Y │   │  │
│  └───┘                      └───┴───┘  │
│  D-pad (bottom-left)    A=Jump B=Dash (bottom-right) │
└─────────────────────────────────────────┘
```
- **Virtual D-pad**: Bottom-left semi-transparent control. Left/right movement + down crouch
- **A Button (Jump)**: Bottom-right. Hold for higher jump
- **B Button (Dash)**: Left of A button. Activated from World 4 onwards
- Touch area size: Minimum 48×48px (accessibility standard)
- passive: false setting to prevent scrolling

### 3.3 Mouse
- Used only on menu/world selection screens
- During gameplay, keyboard/touch only

---

## §4. Visual Style Guide

### 4.1 Overall Aesthetic
**Neon Geometric Minimalism** — All objects are geometric shapes of rectangles/circles/triangles. Backgrounds are solid color gradients. Characters and obstacles use bright neon outlines for visibility.

### 4.2 Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Player | `#00ffcc` (mint) | Player rectangle body |
| Player afterimage | `#00ffcc` alpha 0.3 | Afterimage trail during dash |
| Terrain (default) | `#3a3a5c` (dark purple) | Solid tiles |
| Spikes/hazards | `#ff3366` (hot pink) | Danger objects — immediately distinguishable |
| Gems | `#ffd700` (gold) | Collectible items |
| Goal flag | `#00ff66` (bright green) | Destination point |
| Background | Per-world gradient | See §2.3 |
| UI text | `#ffffff` | HUD, menus |
| UI highlight | `#ff6b35` (orange) | Selected menu item |

### 4.3 Object Shapes

| Object | Shape | Size (tile-based) | Rendering |
|--------|-------|--------------------|-----------|
| Player | Rectangle + 2 eyes (small circles) | 0.8 × 1.0 tiles | fillRect + 2× arc (eyes) |
| Terrain tile | Rectangle | 1.0 × 1.0 tiles | fillRect |
| Spikes | Triangle (rotated per direction) | 1.0 × 0.5 tiles | moveTo/lineTo ×3 |
| Moving platform | Rounded rectangle | 2.0 × 0.5 tiles | roundRect |
| Gem | Rotating diamond | 0.5 × 0.5 tiles | rotate + 45° rectangle |
| Goal flag | Flag shape (pole + triangle) | 1.0 × 2.0 tiles | fillRect (pole) + triangle (flag) |
| Particles | Small rectangles/circles | 2~6px | ObjectPool managed |

### 4.4 Screen Layout
```
┌─────────────────────────────────────┐
│ W1-S3  ◆◆◇  00:23.4    ⏸         │  ← HUD (top)
├─────────────────────────────────────┤
│                                     │
│          [Game World]               │  ← Camera tracks player
│          (tilemap-based)            │
│                                     │
└─────────────────────────────────────┘
```
- HUD: World-stage number / Gem collection status / Speedrun timer / Pause button
- Camera: Smooth player-centered tracking (lerp 0.08)

---

## §5. Core Game Loop (Frame-based Logic Flow)

### 5.1 Main Loop (60fps, `requestAnimationFrame`)
```
Each frame (dt = currentTime - previousTime, cap = 33.33ms):
│
├─ 1. Input.update(dt)          — Key/touch input polling, buffer update
├─ 2. TweenManager.update(dt)   — Active tween progression
├─ 3. State-specific update(dt):
│   ├─ TITLE:   Title animation update
│   ├─ PLAY:    Physics.update(dt) → Collision.check() → Camera.follow(dt)
│   ├─ DEAD:    Death animation tween progression → Respawn on complete
│   ├─ CLEAR:   Clear animation tween → Next stage transition on complete
│   └─ PAUSE:   Input only (game logic halted)
├─ 4. Particle.update(dt)       — Particle system update
├─ 5. Renderer.draw(state, dt)  — State-specific rendering
└─ 6. Input.postUpdate()        — Reset this frame's input flags
```

### 5.2 State Transition Rules

**All transitions must go through `beginTransition(targetState, options)`.**

| Transition | Trigger | Animation | Duration |
|-----------|---------|-----------|----------|
| TITLE → PLAY | Start button | Fade out → Stage load → Fade in | 0.5s |
| PLAY → DEAD | Hazard collision / Fall | Player particle explosion + subtle screen shake | 0.3s |
| DEAD → PLAY | Death animation complete (tween onComplete) | Fade in (respawn at checkpoint) | 0.2s |
| PLAY → CLEAR | Goal flag collision | Gem/timer result popup tween | 1.0s |
| CLEAR → PLAY | Result popup complete + input | Fade out → Next stage load → Fade in | 0.5s |
| PLAY ↔ PAUSE | ESC/P or pause button | `beginTransition(state, {immediate:true})` | Instant |
| CLEAR → TITLE | Final stage clear | Ending sequence → Fade out → Title | 2.0s |

- **Guard flag**: Additional transition requests ignored while `isTransitioning = true`
- **DEAD → PLAY instant transition**: Unified via beginTransition(PLAY, {immediate: true}). Direct enterState() calls forbidden

### 5.3 State × System Matrix

| System \ State | TITLE | PLAY | DEAD | CLEAR | PAUSE |
|---------------|-------|------|------|-------|-------|
| Input.update | ✅ | ✅ | ✅ (R key only) | ✅ (proceed key only) | ✅ (ESC only) |
| TweenManager.update | ✅ | ✅ | ✅ | ✅ | ❌ |
| Physics.update | ❌ | ✅ | ❌ | ❌ | ❌ |
| Collision.check | ❌ | ✅ | ❌ | ❌ | ❌ |
| Camera.follow | ❌ | ✅ | ✅ (fixed) | ✅ (fixed) | ❌ |
| Particle.update | ✅ | ✅ | ✅ | ✅ | ❌ |
| Renderer.draw | ✅ | ✅ | ✅ | ✅ | ✅ (semi-transparent overlay) |

---

## §6. Difficulty System

### 6.1 Per-world Difficulty Curve

All values defined as constants in `CONFIG.WORLDS[n]` objects.

| World | Spike Density | Moving Obstacle Count | Gem Difficulty | Avg Clear Time (Target) |
|-------|--------------|----------------------|----------------|------------------------|
| 1 (Forest) | Low (10~15%) | 1~2 per stage | Easy (near path) | 15~25s |
| 2 (Cave) | Medium (15~25%) | 2~3 | Normal (wall jump required) | 20~35s |
| 3 (Sky) | Medium (20~30%) | 3~4 | Normal (double jump required) | 25~40s |
| 4 (Lava) | High (25~35%) | 4~5 | Hard (dash+timing) | 30~50s |
| 5 (Starlight Tower) | Very High (30~40%) | 5~6 | Very Hard (all movesets combined) | 40~60s |

### 6.2 In-stage Difficulty Flow
Each world's 5 stages follow this pattern:
1. **Stage 1**: New moveset introduction (practice in safe environment)
2. **Stage 2**: Basic combinations (new moveset + existing obstacles)
3. **Stage 3**: Advanced (increased timing demands)
4. **Stage 4**: Challenge (complex obstacle combinations)
5. **Stage 5**: Boss section (comprehensive test of entire world's movesets)

### 6.3 Level Data Structure
```javascript
// CONFIG.LEVELS[worldIdx][stageIdx]
{
  width: 40,           // Width in tiles
  height: 22,          // Height in tiles
  spawn: {x: 2, y: 18},
  goal: {x: 37, y: 3},
  checkpoints: [{x: 20, y: 12}],  // Mid-stage checkpoints (World 3+)
  gems: [{x: 10, y: 8}, {x: 25, y: 5}, {x: 33, y: 15}],
  tiles: "...",        // Compressed tilemap string (RLE encoding)
  hazards: [...],      // Dynamic obstacle array
  movingPlatforms: [...] // Moving platform array
}
```

### 6.4 Adaptive Hint System
- After **10+ deaths** on the same stage: Display "Press R to restart from checkpoint" hint
- After **20+ deaths**: Display moveset hint arrows for that section (optional)
- Hints adjustable via CONFIG.HINT_THRESHOLD

### 6.5 Daily Challenge Mode
- **Seeded RNG** (LCG: `seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF`)
- Seed = `YYYYMMDD` integer (e.g., 20260321)
- Generates 1 procedural stage: All movesets available, high difficulty
- Clear time records saved to localStorage
- Leaderboard is local only (compare with previous daily records)

---

## §7. Score System

### 7.1 Stage Clear Score
```javascript
CONFIG.SCORE = {
  STAGE_CLEAR_BASE: 1000,    // Base stage clear score
  GEM_BONUS: 500,            // Per gem collected
  HIDDEN_GEM_BONUS: 2000,    // Hidden gem
  TIME_BONUS_THRESHOLD: 15,  // Time bonus if under this many seconds
  TIME_BONUS_PER_SEC: 100,   // Bonus per second saved
  NO_DEATH_BONUS: 2000,      // No-death clear bonus
  WORLD_CLEAR_BONUS: 5000    // World clear bonus
};
```

### 7.2 Score Calculation Formula
```
Stage Score = BASE
  + (Gems Collected × GEM_BONUS)
  + (Hidden Gem ? HIDDEN_GEM_BONUS : 0)
  + max(0, (TIME_BONUS_THRESHOLD - Clear Time) × TIME_BONUS_PER_SEC)
  + (0 Deaths ? NO_DEATH_BONUS : 0)
```

### 7.3 Persistent Records (localStorage)
```javascript
// Save key: "mini-platformer-save"
{
  unlockedWorld: 3,           // Current max unlocked world
  bestTimes: {                // Per-stage best records
    "1-1": 12.4, "1-2": 18.7, ...
  },
  gems: {                     // Per-stage gem collection status
    "1-1": [true, true, false], ...
  },
  totalGems: 42,              // Total gems collected
  totalScore: 128500,         // Cumulative total score
  dailyBest: {                // Daily challenge records
    "20260321": 34.2, ...
  },
  deaths: {}                  // Per-stage death counts (for hint system)
}
```

**Important**: Comparison (best record check) → Save (localStorage update) order must be followed (Cycle 2 lesson)

---

## §8. Physics Engine Constants

### 8.1 Player Physics (CONFIG.PHYSICS)
```javascript
CONFIG.PHYSICS = {
  GRAVITY: 0.55,              // Gravity acceleration per frame
  MAX_FALL_SPEED: 12,         // Maximum fall speed
  MOVE_SPEED: 4.5,            // Max horizontal movement speed
  ACCELERATION: 0.8,          // Horizontal acceleration (ground)
  AIR_ACCELERATION: 0.5,      // Horizontal acceleration (air)
  FRICTION: 0.85,             // Ground friction coefficient (speed × friction per frame)
  AIR_FRICTION: 0.95,         // Air friction coefficient

  // Jump
  JUMP_FORCE: -11.5,          // Initial jump velocity (negative = up)
  JUMP_CUT_MULTIPLIER: 0.4,   // vy *= this value when jump key released (variable jump height)
  COYOTE_TIME: 6,             // Frames allowed to jump after leaving platform (0.1s)
  JUMP_BUFFER: 6,             // Pre-landing jump input buffer frames (0.1s)

  // Wall Jump (World 2+)
  WALL_SLIDE_SPEED: 2.0,      // Max wall slide speed
  WALL_JUMP_FORCE_X: 7,       // Wall jump horizontal repulsion force
  WALL_JUMP_FORCE_Y: -10.5,   // Wall jump vertical force
  WALL_STICK_TIME: 4,         // Wall cling hold frames

  // Double Jump (World 3+)
  DOUBLE_JUMP_FORCE: -10,     // Double jump force (slightly weaker than base jump)

  // Dash (World 4+)
  DASH_SPEED: 14,             // Dash speed
  DASH_DURATION: 8,           // Dash duration frames
  DASH_COOLDOWN: 0,           // Air dash once → Reset on landing

  // Corner Correction
  CORNER_CORRECTION: 4        // Corner correction pixel count
};
```

### 8.2 Camera (CONFIG.CAMERA)
```javascript
CONFIG.CAMERA = {
  LERP_SPEED: 0.08,          // Camera tracking interpolation speed
  LOOK_AHEAD_X: 40,          // Movement direction look-ahead offset
  LOOK_UP_OFFSET: -80,       // Look up offset
  LOOK_DOWN_OFFSET: 80,      // Look down offset
  DEAD_ZONE_X: 20,           // Camera dead zone horizontal
  DEAD_ZONE_Y: 15,           // Camera dead zone vertical
  SHAKE_DECAY: 0.9           // Screen shake decay
};
```

### 8.3 Physics Update Flow (PLAY State, Each Frame)
```
1. Input processing → Apply acceleration
2. Apply gravity: vy += GRAVITY
3. Wall slide check: Wall contact + falling → vy = min(vy, WALL_SLIDE_SPEED)
4. Speed limit: vy = min(vy, MAX_FALL_SPEED)
5. Apply friction: vx *= (onGround ? FRICTION : AIR_FRICTION)
6. Position update: x += vx, y += vy
7. Tilemap collision detection (AABB)
8. Position correction + ground/wall contact flag update
9. Coyote time counter update
10. Jump buffer counter update
```

---

## §9. Collision Detection System

### 9.1 AABB Collision (Tile-based)
```javascript
// Player hitbox is slightly smaller than visual (generous detection)
CONFIG.HITBOX = {
  PLAYER_WIDTH: 12,    // Based on 16px tile, visual 13px → hitbox 12px
  PLAYER_HEIGHT: 16,
  OFFSET_X: 2,         // Hitbox left offset
  OFFSET_Y: 0
};
```

### 9.2 Collision Response Priority
1. **Solid tiles**: Position correction (push out)
2. **Moving platforms**: Reflect platform velocity when standing on top
3. **Hazards (spikes/lava)**: Instant death → DEAD state transition
4. **Gems**: Collect → Particle effect + sound
5. **Goal flag**: CLEAR state transition
6. **Checkpoint**: Activate (update respawn position)

### 9.3 Corner Correction
When colliding with a ceiling, if the player is caught within CORNER_CORRECTION (4px) of an edge, automatically push left/right to pass through. Without this feature, the frustrating experience of "jumps getting cut short by hitting your head on walls" occurs.

---

## §10. Function Signature Design (Pure Function Principle)

**All game logic functions receive necessary data as parameters. Direct global variable reference forbidden.**

### 10.1 Core Function List

| Function | Parameters | Return | Role |
|----------|-----------|--------|------|
| `updatePlayer(player, input, level, dt)` | Player state, input, level data, dt | Updated player | Physics+movement integration |
| `checkCollision(entity, level)` | Entity AABB, tilemap | Collision result object | AABB collision detection |
| `resolveCollision(player, collision)` | Player, collision result | Corrected position | Position correction |
| `checkHazards(player, hazards)` | Player AABB, hazard array | boolean | Hazard collision check |
| `collectGem(player, gems)` | Player AABB, gem array | Collected gem index | Gem collection check |
| `updateCamera(camera, target, bounds, dt)` | Camera, tracking target, level bounds, dt | Updated camera | Camera tracking |
| `updateMovingPlatform(platform, dt)` | Platform data, dt | Updated position | Moving platform |
| `spawnDeathParticles(pool, x, y, color)` | Particle pool, coordinates, color | void | Death particles |
| `calcStageScore(time, gems, deaths, cfg)` | Clear data, CONFIG | number | Score calculation |
| `generateDailyLevel(seed, cfg)` | Seed, generation CONFIG | Level data | Daily challenge level generation |

### 10.2 State Transition Function
```javascript
// Single transition entry point
function beginTransition(targetState, options = {}) {
  if (isTransitioning) return;  // Guard
  isTransitioning = true;
  if (options.immediate) {
    enterState(targetState);
    isTransitioning = false;
  } else {
    tweenManager.add({
      target: transitionOverlay,
      props: { alpha: { from: 0, to: 1 } },
      duration: options.duration || 300,
      onComplete: () => {
        enterState(targetState);
        tweenManager.add({
          target: transitionOverlay,
          props: { alpha: { from: 1, to: 0 } },
          duration: options.duration || 300,
          onComplete: () => { isTransitioning = false; }
        });
      }
    });
  }
}
```

---

## §11. Variable Naming Rules

In Cycle 10, abbreviated variable names (`shopI` vs `shI`) caused a CRITICAL bug, so this spec pre-defines clear naming rules.

### 11.1 Allowed Abbreviation List (All Other Abbreviations Forbidden)

| Abbreviation | Full Form | Usage |
|-------------|-----------|-------|
| `dt` | deltaTime | Inter-frame time |
| `vx`, `vy` | velocityX/Y | Velocity vector |
| `dx`, `dy` | deltaX/Y | Position delta |
| `tw` | tweenManager | Tween manager reference |
| `pl` | player | Player object |
| `cam` | camera | Camera object |
| `cfg` | config | Config object |
| `ctx` | canvasContext | Canvas 2D context |
| `lvl` | level | Current level data |
| `idx` | index | Loop index |
| `len` | length | Array length |
| `btn` | button | Button element |

### 11.2 Forbidden Patterns
- Using 2+ abbreviations for the same concept forbidden (e.g., mixing `stageIdx` and `stgI`)
- Single character variables only allowed for `i`, `j`, `k` (loops) and `x`, `y` (coordinates)
- Same rules apply to local variables within functions

---

## §12. Implementation Checklist & Forbidden Patterns

### 12.1 assets/ Directory Policy
- **assets/ directory creation absolutely forbidden**
- All visuals rendered via Canvas API (fillRect, arc, lineTo, bezierCurveTo, fillText)
- 0 external image/SVG/font files
- External CDN loading like Google Fonts forbidden
- System fonts only: `"Segoe UI", system-ui, sans-serif`

### 12.2 Code Forbidden Patterns

| Forbidden Pattern | Reason | Alternative |
|-------------------|--------|-------------|
| `setTimeout` / `setInterval` | Unstable state transition timing | tween onComplete |
| `alert()` / `confirm()` / `prompt()` | Unusable in iframe environment | Canvas-based modal |
| `eval()` | Security vulnerability | Direct parsing |
| `feGaussianBlur` / SVG filters | 10-cycle recurrence history | Canvas shadow or direct render |
| `new Image()` / `<img>` | External asset dependency | Canvas code drawing |
| Direct `enterState()` call | Bypasses transition guard | `beginTransition()` |
| Direct global variable reference (in functions) | Pure function principle violation | Pass as parameter |
| Excessive `document.querySelector` | Canvas-only game | Canvas API |

### 12.3 Declared Variable Usage Verification (Ghost Variable Prevention)
After implementation, verify all declared `let`/`const`/`var` variables are actually read:
- Variables only declared but never used → Delete
- Variables used differently from spec intent → Fix

### 12.4 TweenManager Usage Rules
- `clearImmediate()`: Immediate cleanup on state transition (instead of deferred cancelAll)
- `add()` calls must only occur after `clearImmediate()`
- Update path for a single value uses **only one of** tween or direct assignment

### 12.5 Spec-Implementation Numerical Consistency Verification Table

After implementation, verify all values in the table below match the code:

| Section | Constant Name | Spec Value | Code Value (Fill After Verification) |
|---------|--------------|------------|-------------------------------------|
| §8.1 | GRAVITY | 0.55 | |
| §8.1 | JUMP_FORCE | -11.5 | |
| §8.1 | COYOTE_TIME | 6 | |
| §8.1 | JUMP_BUFFER | 6 | |
| §8.1 | WALL_JUMP_FORCE_X | 7 | |
| §8.1 | WALL_JUMP_FORCE_Y | -10.5 | |
| §8.1 | DOUBLE_JUMP_FORCE | -10 | |
| §8.1 | DASH_SPEED | 14 | |
| §8.1 | DASH_DURATION | 8 | |
| §8.1 | CORNER_CORRECTION | 4 | |
| §7.1 | STAGE_CLEAR_BASE | 1000 | |
| §7.1 | GEM_BONUS | 500 | |
| §7.1 | NO_DEATH_BONUS | 2000 | |
| §6.4 | HINT_THRESHOLD (10 deaths) | 10 | |
| §6.4 | HINT_THRESHOLD (20 deaths) | 20 | |

### 12.7 Variable Declaration Order Verification (TDZ Prevention — Cycle 11 Lesson)
In Cycle 11, `let gridCache` declaration positioned after `resizeCanvas()` call caused a game-breaking CRITICAL.

**Rules:**
- All `let`/`const` variables declared **before** first reference (including function calls)
- Explicitly verify initialization code block execution order:
  1. CONFIG constant declarations
  2. Utility class declarations (TweenManager, ObjectPool, etc.)
  3. Game state variable declarations (`let player, camera, level, ...`)
  4. Cache/offscreen Canvas variable declarations
  5. Function declarations (function hoisting exists, but beware functions referencing variables)
  6. `resizeCanvas()` and initialization calls
  7. Event listener registration
  8. `requestAnimationFrame(gameLoop)` start

**Verification Checklist:**
- [ ] Are all `let`/`const` declarations above their first usage line?
- [ ] Are all variables needed by `resizeCanvas()` declared at its call time?
- [ ] Are offscreen Canvas cache variables declared before `resizeCanvas()`?

### 12.8 Fix Regression Prevention (Cycle 10 Lesson)
In Cycle 10, during 1st-round MINOR fixes, changing the `render()` signature without passing `timestamp` caused a new CRITICAL.

**Rules:**
- When changing function signatures, search **all call sites** for that function to verify argument propagation
- Post-fix full-flow regression test: TITLE→PLAY→DEAD→PLAY→CLEAR→(repeat)→PAUSE→PLAY full-path traversal
- Pre-fix impact scope analysis for each fix

**Regression Test Checklist:**
- [ ] Title screen renders normally?
- [ ] Game start → Movement/jump normal?
- [ ] Hazard death → Instant respawn normal?
- [ ] Gem collection → Particle/sound normal?
- [ ] Goal reached → Clear animation → Next stage load normal?
- [ ] Pause → Resume normal?
- [ ] Touch controls normal?

### 12.9 Defensive Coding Pattern (Cycle 10 Standard)
```javascript
// Game loop try-catch wrapping — Prevents single-frame error from halting entire game
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
    lastTime = timestamp;
    update(dt);
    render(ctx, dt, timestamp);
  } catch (e) {
    console.error('Game loop error:', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 12.10 Boilerplate Modules (Same Interface as Previous Cycles)
The following modules use the same verified interfaces from previous cycles:
- **TweenManager**: `add()`, `update(dt)`, `clearImmediate()`, `cancelAll()`
- **ObjectPool**: `get()`, `release(obj)`, `forEach(fn)`
- **TransitionGuard**: `beginTransition(state, options)`
- **Input**: `isDown(key)`, `justPressed(key)`, `update()`, `postUpdate()`
- **SoundManager**: Web Audio API based, `play(name)`, `setVolume(v)`

---

## §13. Sound Design

### 13.1 Sound Effects (Web Audio API — Code Generated)
All sound effects generated via OscillatorNode + GainNode. 0 external audio files.

| Sound Effect | Waveform | Frequency | Duration | Trigger |
|-------------|----------|-----------|----------|---------|
| Jump | sine | 400→600Hz | 0.08s | Jump |
| Double jump | sine | 500→800Hz | 0.1s | Double jump |
| Wall jump | square | 300→500Hz | 0.06s | Wall jump |
| Dash | sawtooth | 200→100Hz | 0.12s | Dash |
| Death | noise | - | 0.2s | Hazard collision |
| Gem collect | sine | 800→1200Hz | 0.15s | Gem collision |
| Clear | sine arpeggio | C5→E5→G5→C6 | 0.4s | Goal reached |
| Checkpoint | triangle | 600→900Hz | 0.2s | Checkpoint activation |

### 13.2 Background Music
- Mutable minimal ambience (low-frequency drone)
- Per-world base frequency change for atmosphere differentiation

---

## §14. Mobile/Responsive Support

### 14.1 Canvas Size
```javascript
CONFIG.CANVAS = {
  BASE_WIDTH: 800,          // Base resolution
  BASE_HEIGHT: 450,         // 16:9
  TILE_SIZE: 16,            // 1 tile = 16px (at base resolution)
  DPR: window.devicePixelRatio || 1  // High-resolution display support
};
```

### 14.2 Responsive Scaling
- Scale Canvas to fit parent container (`canvas.style.width/height`)
- Actual Canvas resolution at `BASE × DPR` for sharpness
- Touch coordinate conversion: `(touchX - canvasRect.left) / scaleX`

### 14.3 Touch Event Handling
```javascript
// 3 event types + passive: false
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', handleTouch, { passive: false });
canvas.addEventListener('touchend', handleTouch, { passive: false });

function handleTouch(e) {
  e.preventDefault();  // Prevent scrolling
  // Virtual D-pad + button area detection
}
```

---

## §15. Performance Optimization

### 15.1 Rendering Optimization
- **Tilemap**: Only render tiles within camera viewport (viewport culling)
- **Particles**: ObjectPool to prevent GC (max 100 simultaneous)
- **Background**: Pre-render to separate offscreen Canvas → drawImage on scroll

### 15.2 Physics Optimization
- Collision detection only checks 3×3 tile range around player
- Moving platforms only update within active range (camera view + margin)

---

## Appendix: Implementation Priority

| Order | Item | Required/Optional |
|-------|------|-------------------|
| 1 | Tilemap rendering + basic movement + jump | Required |
| 2 | AABB collision + spike instant death + respawn | Required |
| 3 | Coyote time + jump buffer + variable jump height | Required |
| 4 | 5-state transitions (via beginTransition) | Required |
| 5 | World 1 (5 stages) handmade levels | Required |
| 6 | Wall jump (World 2) | Required |
| 7 | Double jump (World 3) | Required |
| 8 | Dash + afterimage (World 4) | Required |
| 9 | World 5 + gravity inversion zones | Required |
| 10 | Gem collection + score system | Required |
| 11 | HUD + speedrun timer | Required |
| 12 | localStorage save/load | Required |
| 13 | Camera system (lerp tracking) | Required |
| 14 | Particle system (death/gem/clear) | Required |
| 15 | Sound (code-generated SFX) | Required |
| 16 | Touch controls (virtual D-pad) | Required |
| 17 | Daily challenge (Seeded RNG) | Optional |
| 18 | Adaptive hint system | Optional |
| 19 | Hidden stages | Optional |

---

_End of spec — InfiniTriX Cycle #11, Mini Platformer_
