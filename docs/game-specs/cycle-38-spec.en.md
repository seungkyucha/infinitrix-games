---
game-id: gravity-flip
title: Gravity Flip
genre: arcade, casual
difficulty: medium
---

# Gravity Flip — Cycle #38 Game Design Document

> **One-Page Summary**: A **one-touch gravity-flip rage platformer** where the player escapes a collapsing gravity research lab. A single tap/click inverts gravity, allowing the player to dodge obstacles by switching between floor and ceiling in a hostile environment (disappearing floors, falling ceilings, protruding spikes). 5 zones (Lab Wing → Corridor → Reactor → Gravity Chamber → Core) × 3 stages = 15 main + 5 gravity bosses + 3 hidden zero-gravity stages = **23 total stages**. Upgrade tree (Gravity Control/Dash/Time Slow, 3 branches × 5 levels) + procedural obstacle pattern mixing + instant-death/instant-respawn loop. **Fills the arcade+casual gap (10 games since last use) + directly targets the Level Devil (Poki March 2026 #1) rage platformer trend.**

> **MVP Boundary**: **Phase 1** (Core loop: one-touch gravity flip → obstacle breakthrough → exit reached, Zones 1–3 + 3 bosses + Upgrades Lv1–3 + DDA 3 levels + coin system + basic narrative) → **Phase 2** (Zones 4–5 + 2 bosses + 3 hidden stages + Upgrades Lv4–5 + weather/time-of-day effects + full narrative + complete i18n). **Phase 1 alone must deliver a complete rage platformer experience.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (see platform-wisdom) ✅
> Items below have been verified across 1–37 cycles and are documented in detail in platform-wisdom.md. Only the **applicable section** is listed here.

| ID | Lesson Summary | Applied Section |
|----|---------------|----------------|
| F1 | assets/ directory absolutely prohibited — CI build hook forced block [Cycle 1–37] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal only [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1–2] | §5.2 |
| F5 | Guard flags ensure tween callback fires exactly once [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition single definition [Cycle 3–37] | §6.1 |
| F7 | State × System matrix mandatory [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6–7] | §4.4 |
| F10 | Numeric consistency table (spec = code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target minimum 48×48px + Math.max forced [Cycle 12–37] | §3.3 |
| F12 | TDZ prevention: INIT_EMPTY pattern [Cycle 5–37] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path per value [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22–37] | §14.3 |
| F16 | Unified hitTest() function [Cycle 27] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG exclusive (zero Math.random) [Cycle 19–37] | §5.2, §14.3 |
| F19 | Procedural SFX + BGM (Web Audio API) [Cycle 19–37] | §12 |
| F20 | i18n support (ko/en) [Cycle 27–37] | §13 |
| F21 | beginTransition single definition [Cycle 32–37] | §6.1 |
| F22 | Orphaned SVG full deletion [Cycle 32] | §4.1 |

### New Feedback (Cycle #37 Lessons) 🆕

| ID | Lesson | Applied Section | Solution |
|----|--------|----------------|----------|
| F23 | STATE_PRIORITY simplified to 5 states + TRANSITION_TABLE single definition [Cycle 37 ✅] | §6.1 | Maintain minimal states (TITLE/MAP/PLAY/BOSS). All transitions defined in single TRANSITION_TABLE object |
| F24 | assets/ directory recurrence 37 consecutive cycles [Cycle 37] | §4.1 | All assets as inline SVG literals + Canvas procedural rendering. Smoke test FAIL on existence |
| F25 | BFS path validation technique [Cycle 37 ✅] | §10.2 | BFS verification of exit reachability during procedural stage generation |
| F26 | Mathematical difficulty curve formula [Cycle 37 ✅] | §8 | Obstacle density/speed defined by math formula for pre-validation |
| F27 | TRANSITION_TABLE static verification [Cycle 37 ✅] | §14.3 | Smoke test verifies all transition pairs are callable |
| F28 | Boss weakness pattern completability verification [Cycle 37 planner] | §7.5 | Boss weakness timing windows documented with ASCII visualization |

### Previous Cycle "Regrets" Direct Resolution ⚠️

| Regret (cycle-37) | Resolution Section | Solution | Verification |
|-------------------|-------------------|----------|-------------|
| PENDING status — full review incomplete | §14.3 | Smoke test gate requires TITLE→MAP→PLAY transition success | Tap/spacebar → map screen → stage entry confirmed |
| STATE_PRIORITY complexity (5 states managing boss/map/shop) | §6.1 | Further simplified to **4 states**: TITLE/MAP/PLAY/BOSS (MAP includes shop) | `Object.keys(TRANSITION_TABLE).length === 4` |
| No puzzle balance simulator | Appendix A | Math difficulty curve + extreme upgrade build formula verification | Stage clear time 15–90s range |
| Dual system (puzzle+construction) overscope | §1 | **Single core loop** (flip→break through→escape) focus. Only sub-system is upgrade tree [Cycle 35 planner lesson] | Core mechanic functions ≤ 5 |

---

## §1. Game Overview & Core Fun Elements

### Core Concept

**"One tap of tension, one death of addiction"** — Level Devil's "hostile environment" philosophy + gravity inversion as a physics-based core mechanic.

### Core Fun Elements (5)

1. **One-Touch Gravity Flip**: A single tap/click inverts gravity 180°. Character alternates between ceiling and floor to dodge obstacles. Simple controls = intuitive understanding + deep mastery
2. **Hostile Environment**: Level Devil style — floors disappear, ceilings collapse, spikes protrude from walls. "What looks safe is a trap" — expectation subversion
3. **Instant-Death + Instant-Respawn Loop**: Death → restart from stage beginning in 0.3s. Zero loading instant retry = anger → retry → achievement cycle
4. **Procedural Obstacle Patterns**: SeededRNG-based slight timing variations each play. "I memorized it" complacency meets pattern variants
5. **Lab Escape Narrative**: Zone-by-zone lab collapse progression → environment becomes increasingly hostile. Visual storytelling syncs with difficulty escalation

### Genre Analysis

| Item | Value |
|------|-------|
| Primary Genre | arcade (fast reactions, score pursuit, pattern breaking) |
| Secondary Genre | casual (one-touch controls, short sessions, high accessibility) |
| Sub-genre | rage platformer (Level Devil-style hostile environment) |
| Play Session | 15–90 seconds per stage (including deaths) |
| Target Users | Casual browser gamers + rage game enthusiasts |

### Differentiation from Existing Games

| Existing Game | Difference |
|--------------|-----------|
| neon-dash-runner (#4, arcade+casual) | Horizontal auto-runner vs **vertical gravity-switching stage clear** |
| neon-pulse (#27, arcade+casual) | Rhythm-based vs **physics-based environment reaction** |
| mini-platformer (#10, arcade+action) | Traditional left/right+jump vs **one-touch gravity flip only** |

---

## §2. Game Rules & Objectives

### Basic Rules

1. **Character auto-moves rightward** (horizontal speed 120px/s base)
2. **Tap/click to flip gravity**: Gravity switches from down→up or up→down
3. **Instant death on obstacle contact**: Spikes, falls, crushers, lasers, etc.
4. **Reach the exit portal to clear the stage**
5. **Collect coins**: Gather coins within stages to purchase upgrades
6. **Star rating**: ★1–3 based on clear time + death count + coin collection rate

### Stage Objectives

- **Main Goal**: Reach exit portal to clear stage
- **Sub Goals**: 100% coin collection, time-limited clear (★3), deathless clear
- **Hidden Goals**: Discover hidden paths in specific stages → unlock hidden stages

### Boss Rules

- Boss is challenged after clearing the 3rd stage of each zone
- Boss transforms environment with specific patterns → player evades using gravity flip timing
- Reaching specific position during boss vulnerability window = 1 hit
- 3 hits to defeat boss

---

## §3. Controls

### §3.1 Keyboard

| Key | Action | State |
|-----|--------|-------|
| Space / W / ↑ | Gravity flip | PLAY, BOSS |
| A / ← | Decelerate (60px/s) | PLAY, BOSS |
| D / → | Accelerate (180px/s) | PLAY, BOSS |
| Enter / Space | Confirm selection | TITLE, MAP |
| ← / → | Navigate stage selection | MAP |
| Escape / P | Toggle pause | PLAY, BOSS |
| R | Instant restart | PLAY, BOSS |

### §3.2 Mouse

| Input | Action | State |
|-------|--------|-------|
| Left click (game area) | Gravity flip | PLAY, BOSS |
| Left click (UI button) | Button action | ALL |
| Right click | None (preventDefault) | ALL |

### §3.3 Touch (Mobile)

| Input | Action | State |
|-------|--------|-------|
| Tap anywhere | Gravity flip | PLAY, BOSS |
| Tap UI button | Button action | ALL |
| Long press left 1/3 | Decelerate | PLAY, BOSS |
| Long press right 1/3 | Accelerate | PLAY, BOSS |

**Touch Targets**: All UI buttons minimum **48×48px** (`Math.max(48, buttonSize)` enforced) [F11]

**Mobile Layout (≤400px)**:
```
┌──────────────────────────┐
│  [⏸]              [🔄]  │  ← Top 48×48 buttons
│                          │
│                          │
│  ◀ Slow  │  Game  │ Fast ▶│  ← Left/Right 1/3 zones
│  (hold)  │(tap=flip)│(hold) │
│                          │
│  💰 120    ⭐⭐☆   💀 3  │  ← Bottom HUD
└──────────────────────────┘
```

---

## §4. Visual Style Guide

### §4.1 Asset Policy (★★★ CRITICAL ★★★)

- **assets/ directory absolutely prohibited** [F1, F24] — Smoke test FAIL
- **Zero external CDN/fonts/images** [F2] — All assets as **inline SVG literals** + **Canvas procedural rendering**
- All SVGs defined as JavaScript string constants in code
- `fetch()`, `Image()`, `new Audio()` usage: 0 occurrences

### §4.2 Color Palette

| Zone | Background Primary | Background Secondary | Obstacles | Safe Zones | Portal |
|------|-------------------|---------------------|-----------|-----------|--------|
| 1. Lab Wing | `#0a0e17` (deep navy) | `#141e30` | `#ff3333` (red) | `#33ff88` (green) | `#00ccff` (cyan) |
| 2. Corridor | `#0d1117` (dark gray) | `#1a2332` | `#ff6633` (orange) | `#33ff88` | `#00ccff` |
| 3. Reactor | `#170a0a` (dark red) | `#2d1414` | `#ff3366` (pink) | `#33ffcc` | `#00ccff` |
| 4. Gravity Chamber | `#0a0a17` (dark purple) | `#1a1a2d` | `#cc33ff` (purple) | `#33ff88` | `#ffcc00` (gold) |
| 5. Core | `#000000` (pure black) | `#0d0d0d` | `#ffffff` (white) | `#33ff88` | `#ffcc00` |

**Character Color**: `#00eeff` (cyan neon) — High visibility across all zones

### §4.3 Object Shapes

| Object | Shape | Size (px) | SVG Complexity |
|--------|-------|-----------|---------------|
| Player | Rounded square + 2 eyes + gravity direction arrow | 24×24 | Base + flipped + dash + death (4 poses) |
| Spikes | Repeating triangle pattern | 24×24 (unit) | 4 directions (up/down/left/right) |
| Crusher | Rectangle + warning stripes | 48×48~96×48 | Idle + falling (2 variants) |
| Moving platform | Rounded rectangle + dotted path | 72×12 | 1 variant |
| Portal (exit) | Circle + rotating rings + particles | 32×32 | 4-frame animation |
| Coin | Circle + sparkle | 16×16 | 3-frame animation |
| Boss | Zone-specific large object | 64×64~96×96 | 3 phases each (5×3=15 variants) |
| Background particles | Circle/line | 2~6 | Procedurally generated |
| Warning indicator | Exclamation triangle + blink | 20×20 | 1 variant |

### §4.4 Pure Function Rendering Pattern [F9]

All render functions are pure functions:
```
drawPlayer(ctx, x, y, size, gravityDir, pose, alpha)
drawSpike(ctx, x, y, dir, color)
drawBoss(ctx, x, y, bossType, phase, frame, alpha)
drawParticle(ctx, x, y, radius, color, alpha)
drawUI(ctx, state, score, coins, lives, lang)
```

### §4.5 Camera System

- **Default**: Horizontal scroll centered on player (player fixed at left 1/3 of screen)
- **Boss battle**: Zoom out (1.0→0.7) on boss entrance, then return
- **On death**: 0.1s screen shake + 0.2s slow motion
- **Stage clear**: Zoom in to portal (1.0→1.3) + brightness increase

---

## §5. Core Game Loop (60fps)

### §5.1 Initialization Order [F12]

```
// INIT_EMPTY pattern: all let/const declared at top
let G = null;              // Game state object
let TW = null;             // TweenManager
let SND = null;            // SoundManager
let RNG = null;            // SeededRNG
let CAM = null;            // Camera
let INPUT = null;          // Input state
// ... all variable declarations complete before init() call
```

### §5.2 Frame Loop (gameLoop)

```
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // 50ms cap
    lastTime = timestamp;

    // 1. Input processing
    processInput(G.state, INPUT);

    // 2. Tween update (runs in ALL states) [F7]
    TW.update(dt);

    // 3. State-specific update
    switch (G.state) {
      case 'TITLE': updateTitle(dt); break;
      case 'MAP':   updateMap(dt); break;
      case 'PLAY':  updatePlay(dt); break;
      case 'BOSS':  updateBoss(dt); break;
    }

    // 4. Particle update (runs in ALL states)
    updateParticles(dt);

    // 5. Camera update
    CAM.update(dt);

    // 6. Rendering
    render(ctx, G, CAM);

    // 7. Sound update
    SND.update(dt);

    requestAnimationFrame(gameLoop);
  } catch(e) {
    console.error('GameLoop Error:', e);
    requestAnimationFrame(gameLoop); // Crash recovery
  }
}
```

**Core Principles**:
- Zero setTimeout [F4] — All delays via `TW.add()` onComplete
- Guard flags [F5] — `G.transitioning = true` ensures single execution
- clearImmediate() [F13] — `TW.clearImmediate()` then `TW.add()` is immediately safe
- Single update path [F14] — e.g., `G.speed` updated only via tween, zero direct assignment
- SeededRNG [F18] — Zero `Math.random()`, all randomness via `RNG.next()`

### §5.3 Code Structure (REGION System)

```
// ===== REGION 1: CONSTANTS =====
// Game constants, color palettes, difficulty values

// ===== REGION 2: UTILITY =====
// SeededRNG, TweenManager, SoundManager, hitTest, lerp

// ===== REGION 3: ASSETS (INLINE SVG) =====
// All SVG string constants

// ===== REGION 4: STATE MACHINE =====
// TRANSITION_TABLE, beginTransition(), enterState()

// ===== REGION 5: LEVEL GENERATOR =====
// Procedural stage generation + BFS validation

// ===== REGION 6: PHYSICS =====
// Gravity, collision, movement

// ===== REGION 7: PLAYER =====
// Player logic

// ===== REGION 8: ENEMIES & TRAPS =====
// Obstacles, traps, environmental modifications

// ===== REGION 9: BOSS =====
// 5 boss types AI + weakness patterns

// ===== REGION 10: UI & HUD =====
// Canvas-based UI, modals, menus [F3]

// ===== REGION 11: RENDERING =====
// Pure function rendering

// ===== REGION 12: AUDIO =====
// Web Audio API procedural sound

// ===== REGION 13: I18N =====
// Korean/English text

// ===== REGION 14: SAVE/LOAD =====
// localStorage progress saving

// ===== REGION 15: INIT & GAME LOOP =====
// Initialization + main loop
```

Dependency direction: **Lower REGIONs reference only higher REGIONs**. Reverse references prohibited.

---

## §6. State Machine

### §6.1 State Definition (4 States) [F6, F21, F23]

```javascript
const STATES = ['TITLE', 'MAP', 'PLAY', 'BOSS'];

const TRANSITION_TABLE = {
  TITLE: ['MAP'],
  MAP:   ['PLAY', 'BOSS', 'TITLE'],
  PLAY:  ['MAP', 'BOSS'],
  BOSS:  ['MAP']
};
// ★ beginTransition() references ONLY this table. Transitions not in table are rejected.
```

**Transition Rules**:
- `beginTransition(from, to)` — If to is not in TRANSITION_TABLE[from], `console.warn` + return
- On transition: `G.transitioning = true` → fade out (0.3s) → `enterState(to)` → fade in (0.3s) → `G.transitioning = false`
- **GAMEOVER is NOT a separate state but a PLAY sub-state**: `G.playState = 'DEAD'|'ALIVE'|'CLEAR'`

### §6.2 State × System Matrix [F7]

| System | TITLE | MAP | PLAY | BOSS |
|--------|-------|-----|------|------|
| Tween | ✅ | ✅ | ✅ | ✅ |
| Physics | — | — | ✅ | ✅ |
| Input (mode) | **menu** | **menu** | **game** | **game** |
| Particles | ✅ (bg) | ✅ (bg) | ✅ (game+bg) | ✅ (game+bg) |
| Camera | — | — | ✅ | ✅ (zoom) |
| Sound BGM | title_bgm | map_bgm | play_bgm | boss_bgm |
| Sound SFX | ui | ui | all | all |
| Save/Load | — | ✅ (autosave) | — | — |
| HUD | — | Stage info | Coins/Deaths/Time | BossHP/Coins/Time |
| Trap Update | — | — | ✅ | ✅ |
| Boss AI | — | — | — | ✅ |

### §6.3 Screen Transition (transAlpha) [F28]

```javascript
// Proxy pattern for automatic transition effect sync
G._transProxy = { alpha: 0 };
// In beginTransition:
TW.add(G._transProxy, 'alpha', 0, 1, 0.3, () => {
  enterState(to);
  TW.add(G._transProxy, 'alpha', 1, 0, 0.3, () => {
    G.transitioning = false;
  });
});
```

### §6.4 Canvas-Based Modals [F3]

Pause, stage clear, and game over modals are all rendered directly on Canvas:
```
drawModal(ctx, title, options[], selectedIndex, alpha)
```
- Zero confirm()/alert()/prompt() usage
- TW.update() continues during modal display (for modal fade/slide animations)

---

## §7. Stage Design

### §7.1 Zone Structure (5 Zones × 3 Stages + Boss)

| Zone | Name | Theme | New Obstacles | Environmental Effect |
|------|------|-------|--------------|---------------------|
| 1 | Lab Wing | Clean lab | Fixed spikes, moving platforms | Stable lighting |
| 2 | Corridor | Alert activated | Vanishing floors, crushers | Red alert light flashing |
| 3 | Reactor | High-temp zone | Laser beams, flame jets | Heat wave distortion |
| 4 | Gravity Chamber | Gravity anomaly | Gravity reversal zones, magnetic fields | Background objects floating |
| 5 | Core | Total collapse | All traps mixed + chain collapse | Screen shake, debris |

### §7.2 Obstacle Types (10)

| ID | Obstacle | Intro Zone | Behavior | Warning |
|----|----------|-----------|----------|---------|
| T1 | Fixed spikes | 1 | Fixed to walls/floor/ceiling | None (always visible) |
| T2 | Moving platform | 1 | Horizontal/vertical oscillation | Dotted path display |
| T3 | Vanishing floor | 2 | Disappears 1s after contact (restores after 3s) | Crack marks → blinking |
| T4 | Crusher | 2 | Periodic up/down movement | ⚠️ shown 1s before |
| T5 | Laser beam | 3 | ON/OFF cycle (2s/1s) | Red dotted line while charging |
| T6 | Flame jet | 3 | Directional short burst | Nozzle glow 0.5s before |
| T7 | Gravity reversal zone | 4 | Auto-flips gravity on entry | Purple zone display |
| T8 | Magnetic field | 4 | Alters character movement speed | Blue wave display |
| T9 | Chain collapse | 5 | Destruction wall chasing from behind | Screen shake |
| T10 | Composite trap | 5 | T1–T9 combinations | Complex |

### §7.3 Stage Generation Rules

Each stage is composed of **segment combinations**:
- Stage length: base 2400px (8 segments × 300px)
- Segments: 20 pre-defined patterns + SeededRNG variants (±2 tiles, 30% active variation)
- Segment difficulty: E(easy) / M(medium) / H(hard) / X(extreme)
- Per-stage segment composition: `[E, E, M, M, M, H, H, E]` (last is safe zone before exit)

### §7.4 Stage Clear Evaluation

| Rating | Condition |
|--------|-----------|
| ★★★ | 0 deaths + 100% coins + within time (base × 0.8) |
| ★★ | ≤3 deaths + ≥60% coins + within time (base × 1.2) |
| ★ | Clear only |

### §7.5 Boss Design (5 Types)

| Boss | Zone | Pattern | Vulnerability Window | Hits Required |
|------|------|---------|---------------------|--------------|
| DR-01 (Surveillance Drone) | 1 | Horizontal laser sweep → stop → resume | Top position during stop (2s window) | 3 |
| CR-02 (Crusher Robot) | 2 | Full floor crush → full ceiling crush alternating | 0.5s during alternation (side core exposed) | 3 |
| RX-03 (Reactor Core) | 3 | Laser grid pattern (cross→X alternating) | Contact core in safe zone during grid swap (1.5s window) | 3 |
| GV-04 (Gravity Master) | 4 | Random gravity direction changes + magnetic push | Approach center during 3s gravity stabilization | 4 |
| NX-05 (Core AI) | 5 | All traps simultaneously + chain collapse pursuit | 0.8s pause between 3 collapse waves | 5 |

**Boss Weakness Timing Verification** [F28]:
```
DR-01: Laser sweep(3s) → Stop(2s) → Repeat
       └─ Player can reach top with 2 gravity flips during stop (sufficient window)
CR-02: Floor crush(2s) → Transition(0.5s) → Ceiling crush(2s) → Transition(0.5s)
       └─ 1 gravity flip + horizontal movement to reach side core during transition
...
```
**bossRewardGiven flag** [F17]: Boss defeat reward issued only once after `G.bossRewardGiven = true`.

---

## §8. Difficulty System

### §8.1 Mathematical Difficulty Curve [F26]

```
Stage number n (1–15):
  Obstacle density = 0.3 + 0.05 × n              (0.35 – 1.05)
  Obstacle speed   = 80 + 8 × n                   (88 – 200 px/s)
  Safe interval    = max(1.0, 3.0 - 0.13 × n)     (2.87 – 1.05 seconds)
  Coin count       = 5 + floor(n × 0.8)            (5 – 17)
  Base time        = 30 + n × 4                     (34 – 90 seconds)
```

### §8.2 DDA (Dynamic Difficulty Adjustment) — 4 Levels

| Level | Condition (consecutive deaths) | Effect | Visual |
|-------|-------------------------------|--------|--------|
| 0 (Default) | — | Base difficulty | — |
| 1 (Easy) | 5 consecutive deaths | Obstacle speed -15%, safe interval +20% | — (no indicator) |
| 2 (Very Easy) | 10 consecutive deaths | Added: Ghost path hint display [Cycle 35 planner] | Translucent dotted path |
| 3 (Guided) | 20 consecutive deaths | Added: Enhanced red glow on dangerous obstacles | Red glow effect |

> DDA uses **"additional information"** approach, NOT "trap deactivation" — preserves rage game challenge [Cycle 35 planner lesson]

### §8.3 Upgrade Effect & Difficulty Compensation

```
Adjusted difficulty = Base difficulty × (1 + 0.02 × total upgrade level)
```
More upgrades → slightly harder late stages → maintains challenge.

---

## §9. Upgrade System (Permanent Progression)

### §9.1 Upgrade Tree (3 Branches × 5 Levels)

| Branch | Lv1 | Lv2 | Lv3 | Lv4 | Lv5 |
|--------|-----|-----|-----|-----|-----|
| **Gravity Control** | Flip speed +15% | Air hover 0.3s | Double flip enabled | Invincible 0.2s on flip | 360° fine gravity adjustment |
| **Dash Power** | Dash distance +20% | Dash cooldown -20% | Invincible during dash | Afterimage explosion (disables nearby obstacles 1s) | Triple consecutive dash |
| **Time Slow** | Slow duration 1s | Slow charge speed +30% | Double coins during slow | Speed boost on slow end | Obstacle pattern preview during slow |

### §9.2 Upgrade Costs

```
Cost(level) = 50 × level^1.5
  Lv1: 50 coins
  Lv2: 141 coins
  Lv3: 259 coins
  Lv4: 400 coins
  Lv5: 559 coins
```

### §9.3 Balance Caps [Cycle 26 planner]

- Gravity flip speed: max 200% (2× base)
- Dash distance: max 250%
- Slow duration: max 3 seconds
- **No DPS cap** (this game is evasion-based, not damage-based)
- Instead: **Clear time floor**: Any upgrade combination requires minimum 10s to clear a stage

---

## §10. Procedural Generation System

### §10.1 SeededRNG [F18]

```javascript
class SeededRNG {
  constructor(seed) { this.s = seed; }
  next() { this.s = (this.s * 1664525 + 1013904223) & 0xFFFFFFFF; return (this.s >>> 0) / 0xFFFFFFFF; }
  range(min, max) { return min + this.next() * (max - min); }
  int(min, max) { return Math.floor(this.range(min, max + 1)); }
}
```

### §10.2 Stage Generation + BFS Validation [F25, F27]

```
generateStage(zoneId, stageId, seed):
  1. Initialize RNG: new SeededRNG(seed)
  2. Generate segment array: E/M/H/X distribution per difficulty formula
  3. Select from 20 pre-defined patterns for each segment
  4. Randomize variation elements within patterns (±2 tiles, 30% variation)
  5. Place coins (quantity per difficulty formula)
  6. ★★★ BFS REACHABILITY VALIDATION ★★★
     - BFS from start → exit (simulating gravity flip movement)
     - On validation failure: regenerate with seed + 1 (max 10 attempts)
  7. Place hidden paths (if applicable for this stage)
```

### §10.3 Hidden Stages (3)

| Hidden | Unlock Condition | Theme |
|--------|-----------------|-------|
| H1: Zero Gravity | Pass through hidden gap in Zone 2 Stage 2 ceiling | Zero-G — tap changes thrust direction only |
| H2: Mirror World | Deathless clear of Zone 4 boss | Left-right flip + gravity flip simultaneously |
| H3: Time Reverse | ★3 on all stages | Obstacles move in reverse direction |

---

## §11. Score System

### §11.1 Score Calculation [F8]

```
Stage score = base + coinBonus + timeBonus + deathlessBonus

Base score = 100 × zone number
Coin bonus = collected coins × 10
Time bonus = max(0, (baseTime - clearTime)) × 5
Deathless bonus = (deaths == 0) ? 500 : 0
```

**Judgment Order** [F8]:
1. Calculate score (current run)
2. Compare with best record → determine if new record
3. Save to localStorage (after judgment complete)

### §11.2 Total Score

- Overall score = Sum of all cleared stage scores
- Total stars = Progress indicator (max 69: 23 stages × ★3)

---

## §12. Sound System [F19]

### §12.1 Web Audio API Procedural Generation

All sounds generated via `AudioContext` + `OscillatorNode` + `GainNode`. Zero `new Audio()`, `<audio>` tags, or external files.

### §12.2 BGM (4 Loops)

| BGM | State | BPM | Character |
|-----|-------|-----|-----------|
| title_bgm | TITLE | 90 | Smooth synth pad, mysterious atmosphere |
| map_bgm | MAP | 100 | Bright arpeggio, exploration feel |
| play_bgm | PLAY | 130 | Tense bassline + synth lead |
| boss_bgm | BOSS | 150 | Intense drums + distortion bass |

### §12.3 SFX (10 Types)

| SFX | Trigger | Waveform |
|-----|---------|----------|
| flip | Gravity flip | Short ascending/descending sweep (sawtooth, 0.1s) |
| land | Landing | Low pulse (square, 0.05s) |
| die | Death | Noise burst + descend (0.3s) |
| coin | Coin collection | Bright triangle 2-note (triangle, 0.15s) |
| clear | Stage clear | Ascending arpeggio (sine, 0.5s) |
| boss_hit | Boss hit | Deep impact (square + noise, 0.2s) |
| boss_die | Boss defeat | Explosion noise + victory fanfare (0.8s) |
| ui_select | UI selection | Short click (sine, 0.05s) |
| dash | Dash use | Wind sweep (sawtooth, 0.2s) |
| warning | Danger warning | Alarm 2-note repeat (square, 0.4s) |

### §12.4 Sound Scheduling [Cycle 28 planner]

All sound timing based on `audioCtx.currentTime`. Zero `setTimeout` usage:
```javascript
SND.play = function(name) {
  const osc = audioCtx.createOscillator();
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
};
```

---

## §13. Internationalization [F20]

```javascript
const I18N = {
  ko: {
    title: '그래비티 플립',
    subtitle: '중력 연구소를 탈출하라',
    // ... (Korean strings)
  },
  en: {
    title: 'Gravity Flip',
    subtitle: 'Escape the Gravity Lab',
    // ... (English strings)
  }
};
```

Language detection: `navigator.language.startsWith('ko') ? 'ko' : 'en'`

---

## §14. Code Hygiene & Validation

### §14.1 Numeric Consistency Table [F10]

| Spec Value | Code Constant | Value |
|-----------|--------------|-------|
| Player size | PLAYER_SIZE | 24 |
| Base horizontal speed | BASE_SPEED | 120 |
| Gravity acceleration | GRAVITY | 600 |
| Flip transition time | FLIP_DURATION | 0.15 |
| Respawn delay | RESPAWN_DELAY | 0.3 |
| DDA Lv1 death threshold | DDA_THRESHOLD_1 | 5 |
| DDA Lv2 death threshold | DDA_THRESHOLD_2 | 10 |
| DDA Lv3 death threshold | DDA_THRESHOLD_3 | 20 |
| Minimum touch target | MIN_TOUCH | 48 |
| Boss DR-01 stop window | BOSS1_WINDOW | 2.0 |
| Boss CR-02 transition window | BOSS2_WINDOW | 0.5 |
| Upgrade Lv1 cost | UPGRADE_COST_1 | 50 |

### §14.2 Code Hygiene Checklist

| Category | Item | FAIL/WARN |
|----------|------|-----------|
| Assets | `assets/` directory exists | FAIL |
| Assets | `fetch(`, `Image(`, `new Audio(` exists | FAIL |
| Assets | `feGaussianBlur` SVG filter exists | FAIL |
| State | State transition not in TRANSITION_TABLE | FAIL |
| State | Direct enterState call bypassing beginTransition | FAIL |
| Random | `Math.random()` call | FAIL |
| Delay | `setTimeout`, `setInterval` call | FAIL |
| Modal | `confirm(`, `alert(`, `prompt(` call | FAIL |
| Functions | Pure function violation (direct G/TW/SND global reference) | WARN |
| UI | Button size < 48px | WARN |
| Code | Empty if/else block exists | WARN |
| Code | TODO/FIXME comment remains | WARN |
| External | Google Fonts, CDN URL exists | FAIL |

### §14.3 Smoke Test Gates [F15]

```
Gate 1: assets/ directory does not exist
Gate 2: index.html file exists + loads successfully
Gate 3: TITLE screen renders correctly
Gate 4: TITLE → MAP transition success (tap/spacebar)
Gate 5: MAP → PLAY transition success (stage select)
Gate 6: Gravity flip works (tap)
Gate 7: Obstacle collision → instant death → instant respawn confirmed
Gate 8: Stage clear → MAP return confirmed
Gate 9: All TRANSITION_TABLE from→to pairs are callable in code [F27]
Gate 10: Zero Math.random, setTimeout, confirm, alert, fetch, Image [§14.2]
```

---

## §15. Game Page Sidebar Information

```yaml
game:
  title: "Gravity Flip"
  description: "Gravity lab collapse! Flip gravity with a single tap to break through hostile environments and escape. 23 stages + 5 bosses + upgrade tree. Level Devil-style rage platformer."
  genre: ["arcade", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "Tap/Click: Flip gravity"
    - "←/→ or A/D: Slow down/Speed up"
    - "Space/W/↑: Flip gravity (keyboard)"
    - "R: Instant restart"
    - "ESC/P: Pause"
  tags:
    - "#rage"
    - "#platformer"
    - "#gravity"
    - "#onetouch"
    - "#labescape"
    - "#premium"
  addedAt: "2026-03-25"
  version: "1.0.0"
  featured: true
```

### Home Page GameCard

```yaml
thumbnail: "Inline SVG — Character mid-gravity-flip + spikes + portal in cinematic composition (4:3)"
title: "Gravity Flip"
description: "Gravity lab collapse! Flip gravity with a single tap to break through hostile environments and escape."
genre: ["arcade", "casual"]
playCount: 0
addedAt: "2026-03-25"  # Within 7 days → NEW badge
featured: true          # ⭐ badge
```

---

## Appendix A: Extreme Build Verification

### Build 1: Gravity Max
- Gravity Control Lv5 + rest Lv1
- Flip speed 200%, 360° fine adjustment, 0.2s invincibility on flip
- **Expected**: Maximized obstacle evasion, minimized clear time
- **Verification**: Stage 15 baseline 90s → Gravity Max ~45s (50% reduction)
- **10s floor**: Guaranteed by obstacle density and stage length

### Build 2: Dash Max
- Dash Power Lv5 + rest Lv1
- Triple consecutive dash, invincible during dash, afterimage explosion
- **Expected**: Breakthrough obstacles, but lower coin collection
- **Verification**: Stage 15 — Dash cooldown (3s) limits continuous invincibility, ~50s clear

### Build 3: Slow Max
- Time Slow Lv5 + rest Lv1
- 3s slow, fast charging, 2× coins, pattern preview
- **Expected**: Maximized information for safe play, optimal coin collection
- **Verification**: Stage 15 — Including slow usage time, ~70s (increased time)

**Conclusion**: All three builds clear within 15–90s range. No balance-breaking extreme builds.

---

## Appendix B: Thumbnail SVG Specification

```
Size: 480×360 (4:3)
Composition: Center character (mid-gravity-flip, up/down arrows), left spike wall, right portal glow
Colors: #0a0e17 background + #00eeff character + #ff3333 spikes + #00ccff portal
Effects: Gravity flip trajectory dotted line + speed lines + portal glow
File size: 20KB+
```

---

## Appendix C: Story Overview

### Background
Year 2087. During an artificial gravity control experiment at the Graviton Research Lab, an accident occurs. Gravity throughout the entire facility becomes unstable and the structure begins to collapse. Researcher "Flip" grabs an experimental gravity inversion device and begins the escape.

### Zone Narratives

| Zone | Narrative | Briefing (1 line on stage entry) |
|------|-----------|--------------------------------|
| 1. Lab Wing | Immediately after accident. Facility relatively intact but gravity unstable | "Found the gravity device. I need to get out of here." |
| 2. Corridor | Alert activated. Auto-defense system identifies as intruder | "Security system is blocking me. I need to dodge the alarms." |
| 3. Reactor | Reactor overheating. High-temperature environment + energy discharge | "The reactor is melting down. I need to pass through fast!" |
| 4. Gravity Chamber | Core gravity control room. Gravity itself is chaotic | "This is where it all started. Gravity has... gone mad." |
| 5. Core | Lab AI enters self-defense mode. The final gate | "The AI is trying to trap me. This is my last chance." |

---

_End of design document. Estimated code: 3,540+ lines. Assets: 20–25 inline SVGs. Audio: 4 BGM + 10 SFX._
