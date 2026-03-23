---
game-id: shadow-shinobi
title: Shadow Shinobi
genre: arcade, action
difficulty: hard
---

# Shadow Shinobi — Cycle #33 Game Design Document

> **One-Page Summary**: The sole survivor of Kagemura ninja village, destroyed by the Yokai Lord Onimaru, masters shadow jutsu to reclaim 5 castles in this **roguelike action platformer**. 5 castles × 3 floors = 15 base stages + 5 boss fights + 3 hidden stages = **23 total stages**. Wall-running, dashing, shuriken throwing, and 4 shadow jutsu for combat + trap evasion + boss pattern mastery. Jutsu skill tree (4 branches × 5 levels), 12 ninja tools, codex collection (40+ entries). SeededRNG-based enemy/trap randomization + 3 ninja school build paths for high replay value. **arcade+action genre combo achieves 9 consecutive unique genre combinations (#25~#33)**. Platform's first ninja/samurai theme with ink-wash Canvas visuals.

> **MVP Boundary**: Phase 1 (core loop: move→fight→boss, castles 1~2 + 2 bosses + 4 basic jutsu + 6 tools + skill tree Lv1~3) → Phase 2 (castles 3~5 + 3 bosses + 3 hidden + full narrative + jutsu evolution + 6 more tools + codex). **Phase 1 must deliver a complete game experience on its own.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅
> Items below have been verified across 16~32 cycles and are detailed in platform-wisdom.md. Only **application sections** are listed here.

| ID | Lesson Summary | Applied Section |
|----|---------------|----------------|
| F1 | Never create assets/ directory — 16 consecutive cycles [Cycle 1~32] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] | §5.2 |
| F5 | Guard flags for single tween callback execution [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system [Cycle 3 B2] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save after [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numeric consistency table (spec = code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target minimum 48×48px + Math.max enforcement [Cycle 12~32] | §3.3 |
| F12 | TDZ prevention: INIT_EMPTY pattern [Cycle 5~32] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path for each value [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22~32] | §14.3 |
| F16 | Unified hitTest() function [Cycle 27] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | Full SeededRNG usage (zero Math.random) [Cycle 19~32] | §5.2, §14.3 |
| F19 | `gt` parameter naming for draw functions [Cycle 29] | §4.4 |
| F20 | Single beginTransition definition + transProxy pattern [Cycle 32] | §6.1 |

### New Feedback (Based on Cycle 32 Postmortem) 🆕

| ID | Lesson | Solution | Applied Section |
|----|--------|----------|----------------|
| F91 | 3rd review required — 8 orphaned SVGs + duplicate beginTransition + dead RESTART_ALLOWED | Add **orphaned asset detection + dead code detection** to pre-review gate | §14.3 |
| F92 | Balance unverified — combinatorial space too large | Reduce combat balance to **ATK/DEF/SPD 3-axis + boss HP scaling**. Pre-verify 3 extreme builds (Appendix A) | §8, Appendix A |
| F93 | Shared engine unextracted for 32 cycles | Maintain 10 REGION structure + list export functions per REGION in §5.3 | §5.3 |
| F94 | Small display (320px) verification incomplete | 5-tier viewport matrix (320/375/400/768/1024px) + 320px dedicated mobile layout ASCII | §3.3, §14.4 |

### Previous Cycle Pain Points → Resolution Mapping

| Cycle 32 Pain Point | Resolution Section | Method | Verification Criteria |
|---------------------|-------------------|--------|----------------------|
| 3rd review (orphaned SVG) | §14.3 | 19-item smoke test gate + auto orphan detection | APPROVED within 2 rounds |
| Balance unverified | §8, Appendix A | 3-axis combat (ATK/DEF/SPD) + 3 extreme build pre-verification | Boss clear time 30~120s range |
| Shared engine unextracted | §5.3 | 10 REGION + export function list + dependency diagram | Zero circular refs |
| Small display incomplete | §3.3, §14.4 | 5-tier viewport matrix + 320px dedicated ASCII layout | Zero button overlap at 320px |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
Shadow Shinobi is a **roguelike action platformer** where **Kage (影)**, the sole survivor of the Kagemura ninja village destroyed by the Yokai Lord Onimaru, trains in shadow jutsu and reclaims 5 castles one by one. Players use wall-running, dashing, shurikens, and jutsu to navigate traps, defeat yokai, and master boss attack patterns.

The core differentiator is the **"Ninja Mobility × Shadow Jutsu × Roguelike Build"** tri-axis system. It combines Level Devil-style trap platforming tension with ninja-themed wall-running, stealth, and clone mechanics, maximizing replay value through randomized enemy placement, traps, and rewards each run.

### 1.2 Core Fun — 3 Axes
1. **Ninja Mobility**: Wall Run, Ceiling Hang, Shadow Dash, Double Jump for fluid traversal of complex terrain. Speed and precision satisfaction.
2. **Shadow Jutsu**: Shadow Clone, Shadow Leap, Shadow Blade, Shadow Veil — 4 abilities for both combat and exploration.
3. **Roguelike Build**: 3 ninja school paths (Wind/Forest/Fire). Random reward choices each run create different strategic routes.

### 1.3 Story
> _In the darkness of the Warring States era, the Kagemura ninja village is annihilated overnight by the Yokai Lord Onimaru's forces. Sole survivor Kage receives the secrets of shadow jutsu from legendary master Genryu (幻龍) and sets out to reclaim the 5 castles occupied by Onimaru's lieutenants. Kage fights not for revenge but for peace — and in the hidden route, can reach the true ending of human-yokai coexistence._

---

## §2. Game Rules & Objectives

### 2.1 Main Objectives
- Clear 5 castles (3 floors each) in sequence to defeat Yokai Lord Onimaru
- Clear 3 floors per castle to enter the castle boss fight
- Collect codex entries in 3 hidden stages to unlock the Peace Ending

### 2.2 Sub-Objectives
- Collect 40 codex entries (complete codex)
- Master all 4 jutsu skill tree branches
- Unlock all 12 ninja tools
- Clear with each of 3 schools (replay)

### 2.3 Life System
- HP 100 (base) + armor bonus
- Post-hit invincibility: 1.5 seconds (10-frame blink)
- HP 0 → Death → Run ends (50% of earned XP preserved)
- Revival item "Secret Scroll" — usable once per run

### 2.4 Base Combat Stats
| Parameter | Base Value | Scaling |
|-----------|-----------|---------|
| Kage ATK | 10 | +2/castle (skill tree bonus separate) |
| Kage DEF | 5 | +1/castle |
| Kage SPD | 1.0 | ±0.2 by school |
| Shuriken DMG | 8 | ATK × 0.8 |
| Dash invuln | 0.3s | +0.1s per skill level |
| Jutsu cooldown | 5s base | -0.5s per skill level |

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| ← → | Move left/right |
| ↑ / Space | Jump (1 extra in air = double jump) |
| ↓ | Drop through platform / Crouch |
| Z | Throw shuriken (facing direction) |
| X | Dash (facing direction, 0.3s invuln) |
| C | Use jutsu (currently equipped) |
| A / S | Cycle jutsu (left/right) |
| Shift | Wall run (hold while touching wall) |
| Enter | Interact / Confirm dialogue |
| Esc | Pause menu |

### 3.2 Mouse
| Input | Action |
|-------|--------|
| Left click | Throw shuriken (toward click) |
| Right click | Dash (toward click) |
| Mouse wheel | Cycle jutsu |

### 3.3 Touch/Mobile Controls
```
┌─────────────────────────────────┐
│          Game Screen             │
│                                 │
│ [PAUSE]                 [JUTSU] │
│                                 │
│                                 │
│                                 │
│ ┌───┐                  [SHUR]  │
│ │JOY│                  [DASH]  │
│ │STK│                  [JUMP]  │
│ └───┘                          │
└─────────────────────────────────┘
```

| Touch Input | Action |
|-------------|--------|
| Virtual joystick (lower left) | Movement (8-direction) |
| JUMP button (lower right) | Jump / Double jump |
| DASH button (mid right) | Dash |
| SHUR button (upper right) | Throw shuriken |
| JUTSU button (top right) | Use jutsu |
| Swipe top of screen | Cycle jutsu |
| PAUSE button (top left) | Pause |
| Double-tap (near NPC) | Interact |

**Touch target spec**: All buttons minimum 48×48px, `Math.max(48, computedSize)` enforced.

#### 320px Small Display Layout
```
┌───────────────────┐
│ [P]         [JUT] │
│                   │
│                   │
│ ┌──┐       [SH]  │
│ │JS│       [DA]  │
│ └──┘       [JU]  │
└───────────────────┘
Buttons: 48×48px, gap 4px
Joystick: 80×80px
```

---

## §4. Visual Style Guide

### 4.1 Asset Policy
- **Never create assets/ directory** (F1, targeting 17 consecutive cycles)
- **Zero external CDN/fonts** (F2)
- All graphics = pure Canvas drawing (procedural)
- Only thumbnail.svg + manifest.json allowed

### 4.2 Color Palette (Ink-Wash Style)
| Name | HEX | Usage |
|------|-----|-------|
| Sumi Black | `#1A1A2E` | Background, outlines |
| Light Ink | `#2D2D4A` | Background layer 2 |
| Vermillion | `#E74C3C` | Kage's scarf, hit effects, enemy attacks |
| Indigo | `#2E4057` | Shadow jutsu base color |
| Gold | `#F1C40F` | UI highlights, rewards, codex |
| Sakura | `#FFB7C5` | Healing, hidden stages |
| Ether Blue | `#00B4D8` | Shadow clones, mana |
| Yokai Purple | `#7B2D8E` | Yokai energy, boss aura |
| Snow White | `#F0F0F0` | Snow, text, highlights |
| Moss Green | `#2D5016` | Forest backgrounds, nature elements |
| Flame Orange | `#FF6B35` | Fire attacks, volcano castle |

### 4.3 Background Style
- Ink-wash multi-layer parallax (3~4 layers)
- Castle themes: ① Wind (cliffs/clouds) ② Forest (bamboo/mist) ③ Fire (volcano/lava) ④ Ice (waterfall/glacier) ⑤ Shadow (void/purple)
- Weather effects: Rain (castle 1), Fog (castle 2), Volcanic ash (castle 3), Snow (castle 4), Ether particles (castle 5)
- Time of day: Dawn→Day→Night per floor within each castle

### 4.4 Drawing Function Standard Signatures
```javascript
// Pure function pattern: zero direct global references
function drawKage(ctx, x, y, size, facing, frame, state, gt) { ... }
function drawEnemy(ctx, x, y, type, hp, frame, gt) { ... }
function drawBoss(ctx, x, y, bossId, phase, hp, frame, gt) { ... }
function drawTerrain(ctx, x, y, w, h, type, gt) { ... }
function drawParticle(ctx, x, y, type, alpha, gt) { ... }
function drawUI(ctx, uiState, gt) { ... }
```

### 4.5 Character Sprite Specs
- **Kage**: 8-direction movement (4 dirs × mirroring) × 4 frames = 32 poses
  - IDLE(2f), RUN(4f), JUMP(2f), FALL(1f), WALL(2f), DASH(3f), ATTACK(3f), JUTSU(4f), HIT(2f), DEATH(4f)
- **Minion yokai (6 types)**: 4 frames each (IDLE/MOVE/ATTACK/DEATH)
- **Boss yokai (5 types)**: 12+ frames each (IDLE/MOVE/ATTACK×3/PHASE_SHIFT/DEATH)

### 4.6 SVG Asset Specs (Implemented as Canvas Drawing)
| Asset | Purpose | Complexity |
|-------|---------|------------|
| Kage 8 poses | Protagonist | 400×400, 8~12 paths |
| Minion yokai ×6 | Regular enemies | 300×300, 6~8 paths |
| Boss ×5 | Castle bosses | 600×400+, 15~20 paths |
| Environment objects ×4 | Destructible/interactive | 200×200, 4~6 paths |
| UI icons ×5 | HP bar/jutsu/tools/minimap/codex | 100×100, 3~5 paths |
| **Total: 28** | Target 20~25+ | No filter chains |

---

## §5. Core Game Loop (Per-Frame Logic Flow)

### 5.1 INIT_EMPTY Pattern — Global Object Initial Values

```javascript
// Initialize empty structure at declaration (TDZ prevention — F12)
const G = {
  state: 'BOOT', phase: 0, lang: 'ko',
  player: { x: 0, y: 0, vx: 0, vy: 0, hp: 100, maxHp: 100, atk: 10, def: 5, spd: 1.0,
            facing: 1, frame: 0, animState: 'IDLE', jutsu: 0, jCool: [0,0,0,0],
            onGround: false, onWall: false, dashTimer: 0, invTimer: 0 },
  camera: { x: 0, y: 0, zoom: 1, shakeX: 0, shakeY: 0 },
  level: { castle: 0, floor: 0, tiles: [], enemies: [], items: [], traps: [], spawn: {x:0,y:0} },
  boss: { id: -1, hp: 0, maxHp: 0, phase: 0, pattern: 0, timer: 0 },
  run: { score: 0, time: 0, kills: 0, collected: [], school: -1 },
  persist: { xp: 0, skills: {}, tools: [], codex: [], bestScore: 0 },
  ui: { modal: null, toast: [], shake: 0, transition: null },
  input: { keys: {}, touch: null, mouse: null },
  rng: null, tw: null, pool: null, snd: null, scroll: null
};
```

### 5.2 Main Game Loop (60fps)

```
Per frame (16.67ms):
  1. Calculate dt (cap: 33.3ms for low-spec protection)
  2. Update G.input (unified keyboard/touch/mouse)
  3. if (ACTIVE_SYSTEMS[G.state].tween) → G.tw.update(dt)
  4. if (ACTIVE_SYSTEMS[G.state].physics) → updatePhysics(G, dt)
  5. if (ACTIVE_SYSTEMS[G.state].ai) → updateEnemies(G, dt)
  6. if (ACTIVE_SYSTEMS[G.state].combat) → updateCombat(G, dt)
  7. if (ACTIVE_SYSTEMS[G.state].trap) → updateTraps(G, dt)
  8. if (ACTIVE_SYSTEMS[G.state].particle) → G.pool.update(dt)
  9. if (ACTIVE_SYSTEMS[G.state].camera) → updateCamera(G, dt)
  10. if (ACTIVE_SYSTEMS[G.state].dda) → updateDDA(G, dt)
  11. render(ctx, G, timestamp)  // always runs
  12. Clean expired G.ui.toast entries
```

**Key Rules**:
- Zero setTimeout → all delayed transitions via tween onComplete (F4)
- Guard flags mandatory on tween callbacks (F5): `if (guard) return; guard = true;`
- Single update path per value (F14): no coexisting tween + direct assignment
- Full SeededRNG usage (F18): `G.rng = new SeededRNG(seed)`, zero Math.random
- TweenManager includes clearImmediate() API (F13)

### 5.3 10 REGION Code Structure + Export Function List

```
// ─── Dependency Direction (unidirectional, zero circular refs) ───
// R1(Config/Util) ← R2(Engine) ← R3(State)
// R1 ← R4(Entity) ← R5(Level)
// R2 ← R6(Render) ← R7(UI)
// R3 + R6 ← R8(Game)
// R1 ← R9(Sound)
// R8 + R9 ← R10(Main/Init)

R1: CONFIG/UTIL — SeededRNG, clamp, lerp, hitTest, PALETTE, GAME_CONFIG
R2: ENGINE — TweenManager, ObjectPool, InputManager, ScrollManager
R3: STATE — State machine, ACTIVE_SYSTEMS, beginTransition, STATE_PRIORITY
R4: ENTITY — Player(Kage), Enemy(Yokai), Boss, Projectile, Trap
R5: LEVEL — LevelGenerator, TileMap, CastleConfig, BFS reachability verification
R6: RENDER — drawKage, drawEnemy, drawBoss, drawTerrain, drawParticle, drawWeather
R7: UI — drawHUD, drawModal, drawMenu, drawSkillTree, drawCodex, drawMinimap
R8: GAME — gameLoop, updatePhysics, updateCombat, updateAI, updateDDA
R9: SOUND — SoundManager (procedural SFX + BGM)
R10: MAIN — init(), resizeCanvas(), event bindings, language settings
```

---

## §6. State Machine

### 6.1 Complete State List (20 states)

```
BOOT → TITLE → SCHOOL_SELECT → CASTLE_MAP → FLOOR_INTRO → PLAYING →
BOSS_INTRO → BOSS_FIGHT → BOSS_VICTORY → FLOOR_CLEAR →
CASTLE_CLEAR → SKILL_TREE → SHOP → CODEX → CUTSCENE →
PAUSE → CONFIRM_MODAL → GAME_OVER → ENDING → HIDDEN_STAGE
```

**STATE_PRIORITY** (higher = takes precedence):
```javascript
const STATE_PRIORITY = {
  GAME_OVER: 100, ENDING: 90, BOSS_VICTORY: 80, CONFIRM_MODAL: 70,
  CUTSCENE: 60, BOSS_INTRO: 55, FLOOR_INTRO: 50, PAUSE: 40,
  BOSS_FIGHT: 30, HIDDEN_STAGE: 25, PLAYING: 20,
  SKILL_TREE: 15, SHOP: 15, CODEX: 15,
  FLOOR_CLEAR: 10, CASTLE_CLEAR: 10, CASTLE_MAP: 5,
  SCHOOL_SELECT: 3, TITLE: 2, BOOT: 1
};
```

**Single beginTransition definition** (F6, F20):
```javascript
function beginTransition(fromState, toState, effect = 'fade', duration = 500) {
  if (STATE_PRIORITY[toState] < STATE_PRIORITY[G.state] && G.state !== fromState) return;
  if (G.ui.transition) return; // prevent duplicate transitions
  G.ui.transition = { from: fromState, to: toState, effect, progress: 0 };
  G.tw.add(G.ui.transition, 'progress', 0, 1, duration, () => {
    enterState(toState);
    G.ui.transition = null;
  });
}
```

### 6.2 State × System Matrix (20×12)

| State | Tween | Physics | AI | Combat | Trap | Particle | Camera | DDA | Input | Sound | Render | Save |
|-------|-------|---------|-----|--------|------|----------|--------|-----|-------|-------|--------|------|
| BOOT | — | — | — | — | — | — | — | — | — | — | ✅ | — |
| TITLE | ✅ | — | — | — | — | ✅ | — | — | menu | ✅ | ✅ | — |
| SCHOOL_SELECT | ✅ | — | — | — | — | ✅ | — | — | menu | ✅ | ✅ | — |
| CASTLE_MAP | ✅ | — | — | — | — | ✅ | — | — | menu | ✅ | ✅ | ✅ |
| FLOOR_INTRO | ✅ | — | — | — | — | ✅ | ✅ | — | skip | ✅ | ✅ | — |
| PLAYING | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | game | ✅ | ✅ | — |
| BOSS_INTRO | ✅ | — | — | — | — | ✅ | ✅ | — | skip | ✅ | ✅ | — |
| BOSS_FIGHT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | game | ✅ | ✅ | — |
| BOSS_VICTORY | ✅ | — | — | — | — | ✅ | ✅ | — | skip | ✅ | ✅ | ✅ |
| FLOOR_CLEAR | ✅ | — | — | — | — | ✅ | — | — | menu | ✅ | ✅ | ✅ |
| CASTLE_CLEAR | ✅ | — | — | — | — | ✅ | ✅ | — | skip | ✅ | ✅ | ✅ |
| SKILL_TREE | ✅ | — | — | — | — | ✅ | — | — | menu | ✅ | ✅ | ✅ |
| SHOP | ✅ | — | — | — | — | ✅ | — | — | menu | ✅ | ✅ | ✅ |
| CODEX | ✅ | — | — | — | — | — | — | — | menu | ✅ | ✅ | — |
| CUTSCENE | ✅ | — | — | — | — | ✅ | ✅ | — | skip | ✅ | ✅ | — |
| PAUSE | ✅ | — | — | — | — | — | — | — | pause | ✅ | ✅ | — |
| CONFIRM_MODAL | ✅ | — | — | — | — | — | — | — | modal | ✅ | ✅ | — |
| GAME_OVER | ✅ | — | — | — | — | ✅ | ✅ | — | menu | ✅ | ✅ | ✅ |
| ENDING | ✅ | — | — | — | — | ✅ | ✅ | — | skip | ✅ | ✅ | ✅ |
| HIDDEN_STAGE | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | game | ✅ | ✅ | — |

**Input mode detail**:
- `menu`: arrows+confirm+cancel (UI navigation)
- `game`: move+jump+attack+dash+jutsu+interact (full controls)
- `skip`: confirm key to skip (cutscenes/intros)
- `pause`: confirm+cancel+arrows (menu navigation)
- `modal`: confirm+cancel only (modal response)

### 6.4 Canvas-Based Modals (F3)
- Absolutely no `confirm()` / `alert()` usage
- All confirmation/warning UI → Canvas rendered modals
- CONFIRM_MODAL state has Tween ✅ (modal appear/dismiss animation)

---

## §7. Stage Design

### 7.1 Castle Structure

| Castle | Theme | Environmental Hazards | Weather | Boss |
|--------|-------|----------------------|---------|------|
| 1. Wind Castle | Cliffs/clouds | Gust (pushback), Lightning (AoE DMG) | Rain+wind | Tengu |
| 2. Forest Castle | Bamboo/moss | Poison fog (DoT), Swamp (slow) | Fog | Kappa |
| 3. Fire Castle | Volcano/lava | Lava (instant death), Volcanic bomb (AoE DMG) | Volcanic ash | Oni |
| 4. Ice Castle | Waterfall/glacier | Ice floor (slide), Icicle (fall DMG) | Snow | Yuki-onna |
| 5. Shadow Castle | Void/dimensional | Void hole (teleport), Shadow tentacle (root) | Ether particles | Onimaru |

### 7.2 Floor Structure (3 Floors per Castle)
- **Floor 1**: Exploration-focused, few enemies, introductory traps. 1 hidden codex entry.
- **Floor 2**: Combat-heavy, many enemies, complex traps. Ninja tool discovery.
- **Floor 3**: Mixed, mini-puzzle + combat. Boss room entry requirement: collect 3 key items.
- **Boss Room**: Single boss fight (see §9)

### 7.3 Environmental Hazard Detail Table

| Hazard | Effect | Damage | Duration | Cooldown | Counter |
|--------|--------|--------|----------|----------|---------|
| Gust | Push Kage | 0 (fall risk) | 2s | 5s | Wall run to hold |
| Lightning | AoE on impact | 20 | Instant | 8s | Dodge after warning |
| Poison fog | DoT | 3/s | While inside | Persistent | Dash through |
| Swamp | SPD -50% | 0 | While inside | Persistent | Jump out |
| Lava | Instant death | 999 | Instant | Persistent | Never touch |
| Volcanic bomb | AoE | 15 | Instant | 6s | Move to dodge |
| Ice floor | Zero friction (slide) | 0 | While on | Persistent | Wall run/jump |
| Icicle | Fall damage | 12 | Instant | 10s | Wobble warning on approach |
| Void hole | Random teleport | 0 | Instant | 15s | Stealth to pass |
| Shadow tentacle | 2s root | 5/s | 2s | 12s | Dash to escape |

### 7.4 Procedural Level Generation
- SeededRNG-based enemy placement, trap positioning, item placement variation
- **Core**: Base tilemaps are predefined (5 castles × 3 floors = 15 base layouts)
- Variation elements: Enemy type/position (±2 tiles), trap active/inactive (30% variation), item position shuffle
- **BFS reachability verification** (F, Cycle 23 lesson): Post-generation spawn→exit BFS verification mandatory. Re-generate seed on failure.

### 7.5 Boss Reward System
- `bossRewardGiven` flag pattern (F17): Boss kill rewards granted exactly once
- Rewards: XP × 5 + 1 jutsu point + unique ninja tool

---

## §8. Difficulty System

### 8.1 3-Axis Balance Model (ATK/DEF/SPD)

| Castle | Enemy HP | Enemy ATK | Enemy SPD | Boss HP | Boss ATK |
|--------|----------|-----------|-----------|---------|----------|
| 1 | 20 | 8 | 0.6 | 300 | 15 |
| 2 | 30 | 12 | 0.7 | 500 | 20 |
| 3 | 45 | 16 | 0.8 | 750 | 25 |
| 4 | 60 | 20 | 0.9 | 1000 | 30 |
| 5 | 80 | 25 | 1.0 | 1500 | 40 |

### 8.2 DDA (Dynamic Difficulty Adjustment)
- **3 consecutive deaths** → Enemy HP/ATK -10% (max -30%)
- **No-hit floor clear** → Enemy HP/ATK +5% (max +15%)
- DDA coefficients reset on castle transition

### 8.3 Roguelike Choice Caps
- **DPS cap**: Cannot exceed 200% of base ATK (skills+tools+school combined)
- **Synergy cap**: Single branch bonus cannot exceed 150%
- Choices exceeding caps are automatically excluded from selection pool

---

## §9. Boss Design

### 9.1 Common Boss Rules
- 3 phases (HP 100%→66%→33%→0%)
- Phase transition: 1.5s cutscene + pattern change
- Hit detection: unified hitTest() function (F16)
- Auto-save before boss room entry

### 9.2 Boss Phase Diagrams

#### Tengu — Wind Castle Boss
```
[IDLE] ──┬── Phase 1 (HP>66%): Charge → Whirlwind shot ×3 → IDLE
         │   Cooldown: 2s
         ├── Phase 2 (HP>33%): + Lightning summon (1s warning) + Flight pattern
         │   Cooldown: 1.5s
         └── Phase 3 (HP≤33%): + 2 clones (clone HP=50)
             AoE whirlwind + chain lightning
             Weakness: 2s stun after killing clones
```

#### Kappa — Forest Castle Boss
```
[IDLE] ──┬── Phase 1: Water jet → Swamp creation (slow) → IDLE
         ├── Phase 2: + Water shield (frontal invuln) + Jump attack (landing shockwave)
         └── Phase 3: + Half-arena flood (only above water is safe)
             Weakness: Back plate — ×2 DMG from behind
```

#### Oni — Fire Castle Boss
```
[IDLE] ──┬── Phase 1: 3-hit club combo → Fire breath (cone) → IDLE
         ├── Phase 2: + Ground lava spread (safe zone shrinks) + Charge
         └── Phase 3: + Berserk (SPD ×1.5, ATK ×1.3)
             Weakness: 1.5s stun after charge — 3s if hits wall
```

#### Yuki-onna — Ice Castle Boss
```
[IDLE] ──┬── Phase 1: Freeze beam (line) → Ice pillar creation (obstacle) → IDLE
         ├── Phase 2: + Absorb (HP recovery from ice pillars) + Teleport
         └── Phase 3: + Blizzard (50% visibility) + Freeze trap grid
             Weakness: 2s stun + recovery block on pillar destruction
```

#### Onimaru — Shadow Castle Final Boss
```
[IDLE] ──┬── Phase 1: Shadow blade ×5 → Dimension rift (teleport) → IDLE
         ├── Phase 2: + Summon 1 random previous boss pattern + 4 shadow clones
         └── Phase 3: + Arena darkness (only 3 tiles around Kage visible) + AoE void explosion
             Weakness: 3s core exposure after all clones killed — only Shadow Blade damages
             Hidden: At HP <10%, dialogue choice → Peace Ending route
```

---

## §10. Jutsu & Skill Tree

### 10.1 Shadow Jutsu — 4 Types

| Jutsu | Effect | Cooldown | Mana Cost | Combat Use | Exploration Use |
|-------|--------|----------|-----------|------------|-----------------|
| Shadow Clone | Spawn decoy (3s) | 8s | 20 | Distribute enemy aggro | Activate pressure plates |
| Shadow Leap | Teleport 5 tiles forward | 6s | 15 | Dodge behind boss | Pass through walls/obstacles |
| Shadow Blade | Cone AoE attack (ATK×2) | 10s | 30 | Powerful melee | Destroy breakable walls |
| Shadow Veil | 4s invisibility (enemies ignore) | 12s | 25 | Dodge boss AoE | Pass sentries |

### 10.2 Ninja Schools — 3 Build Paths

| School | Focus | ATK Bonus | DEF Bonus | SPD Bonus | Special Effect |
|--------|-------|-----------|-----------|-----------|----------------|
| Wind | SPD-focused | +0% | -10% | +30% | Dash distance ×1.5, Double→Triple jump |
| Forest | Balanced | +10% | +10% | +10% | Poison/DoT immune, Natural regen 2HP/10s |
| Fire | ATK-focused | +30% | +0% | -10% | Piercing shuriken, Jutsu DMG ×1.3 |

### 10.3 Skill Tree (4 Branches × 5 Levels)

| Branch | Lv1 | Lv2 | Lv3 | Lv4 | Lv5 |
|--------|-----|-----|-----|-----|-----|
| Clone | Duration +1s | HP 50 clone | Clone explosion on kill | 2 clones | Permanent clone (0 CD) |
| Leap | Range +2 tiles | Invuln during leap | Chain leap (2×) | Landing shockwave | Spacetime leap (fixed behind boss) |
| Blade | Range +30% | Bleed DoT added | 30% critical | 360° spin blade | Shadow Greatsword (range ×3) |
| Veil | Duration +2s | Full speed while stealth | Ambush on exit (DMG ×3) | Mana regen while stealth | Perfect stealth (ignore traps) |

### 10.4 Jutsu Unlock Order → Path Accessibility Map

| Castle | Required Jutsu | Unlocked Jutsu/Tools | Accessible Areas |
|--------|---------------|---------------------|-----------------|
| Castle 1 (Wind) | Basic movement only | Shadow Clone + Shadow Leap | Castles 1~2 main paths |
| Castle 2 (Forest) | Clone (switches), Leap (obstacles) | Shadow Blade | Castle 3 main + Hidden 1 |
| Castle 3 (Fire) | Blade (breakable walls) | Shadow Veil | Castle 4 main + Hidden 2 |
| Castle 4 (Ice) | Veil (pass sentries) | Jutsu evolution | Castle 5 main + Hidden 3 |
| Castle 5 (Shadow) | All jutsu combinations | — | Final boss + Peace route |

---

## §11. Score System

### 11.1 Score Components
- **Enemy kills**: Minion 100pts, Elite 300pts, Boss 2000pts
- **Floor clear bonus**: Remaining HP% × 500
- **Time bonus**: Per floor base time(120s) - actual time × 10 (if under)
- **Combo bonus**: Consecutive kills × 50 (max ×20 = 1000)
- **Codex discovery**: 500pts each
- **Hidden stage clear**: 5000pts

### 11.2 Save Rules (F8)
```javascript
// Judge first, save after
const isNewBest = G.run.score > G.persist.bestScore;
if (isNewBest) G.persist.bestScore = G.run.score;
saveToLocalStorage(G.persist);
```

### 11.3 Persistent Progression (localStorage)
```javascript
const SAVE_SCHEMA = {
  version: 1,
  xp: 0,
  skills: { clone: 0, leap: 0, blade: 0, veil: 0 }, // 0~5
  tools: [],       // unlocked tool ID array
  codex: [],       // discovered codex entry ID array
  bestScore: 0,
  bestCastle: 0,   // highest castle reached
  school: -1,      // selected school (-1=unselected)
  settings: { lang: 'ko', sfx: true, bgm: true },
  dda: { deathStreak: 0, noHitStreak: 0 }
};
```

---

## §12. Sound Design (Web Audio API)

### 12.1 BGM (Procedural Generation, 4 Types)
| BGM | States | Mood | BPM | Key |
|-----|--------|------|-----|-----|
| Village/Menu | TITLE, CASTLE_MAP, SKILL_TREE | Gentle Japanese-style | 80 | Am |
| Exploration | PLAYING, HIDDEN_STAGE | Tense ink-wash | 110 | Dm |
| Boss Battle | BOSS_FIGHT | Intense taiko drums | 140 | Em |
| Ending/Cutscene | ENDING, CUTSCENE | Lyrical koto-style | 70 | CM |

### 12.2 SFX (Procedural Synthesis, 10 Types)
| SFX | Trigger | Synthesis Method |
|-----|---------|-----------------|
| Shuriken throw | Z key/SHUR | High-freq sweep down (800→200Hz, 150ms) |
| Shuriken hit | Enemy hit | Metal collision noise (50ms) |
| Dash | X key/DASH | Wind noise + low-freq whoosh (200ms) |
| Jump | Space/JUMP | Short ascending tone (300→500Hz, 100ms) |
| Take hit | Kage HP decrease | Blunt impact (100Hz, 150ms) + noise |
| Jutsu activate | C key/JUTSU | Reverse cymbal (300ms) + echo |
| Boss appear | BOSS_INTRO | Taiko drum roll (1s) |
| Item pickup | Item touch | Ascending arpeggio (C→E→G, 200ms) |
| Level up/Unlock | Skill/tool unlock | Fanfare chord (500ms) |
| Death | HP 0 | Descending tone + reverb (800ms) |

**Zero setTimeout**: All sound scheduling via `audioCtx.currentTime + delay` (F4, Cycle 13 lesson)

---

## §13. Camera System

### 13.1 Basic Tracking
- Fix Kage slightly above center (lead 2 tiles in facing direction)
- Smooth tracking: `lerp(camera, target, 0.08)`

### 13.2 Cinematic Zoom/Pan
| Situation | Zoom Level | Effect |
|-----------|-----------|--------|
| Boss appear | 0.7→1.0 (zoom out→in) | Reveal full boss then start fight |
| Boss defeat | 0.5 zoom out | Victory sequence, slow motion |
| Hidden discovery | 1.2→1.0 | Zoom in then return |
| Take hit | shake ±3px, 3 frames | Screen shake |
| Boss heavy attack | shake ±8px, 6 frames | Strong screen shake |

---

## §14. Verification & Code Hygiene

### 14.1 Numeric Consistency Table (F10)
> Spec values = code CONFIG constants must match 1:1

| Spec Value | CONFIG Constant | Value |
|-----------|----------------|-------|
| Kage base HP | `CONFIG.PLAYER_HP` | 100 |
| Kage base ATK | `CONFIG.PLAYER_ATK` | 10 |
| Dash invuln time | `CONFIG.DASH_INVULN` | 0.3s |
| Jutsu base cooldowns | `CONFIG.JUTSU_CD` | [8, 6, 10, 12] |
| DDA death reduction | `CONFIG.DDA_DEATH_REDUCE` | 0.10 |
| DPS cap | `CONFIG.DPS_CAP` | 2.0 (×base ATK) |
| Synergy cap | `CONFIG.SYNERGY_CAP` | 1.5 |
| Touch min size | `CONFIG.MIN_TOUCH` | 48 |

### 14.2 Code Hygiene Checklist (FAIL/WARN 2-tier)
**FAIL (build blocking)**:
1. `assets/` directory exists
2. `ASSET_MAP`, `SPRITES`, `preloadAssets` code exists
3. `Math.random` calls (outside SeededRNG)
4. `setTimeout` / `setInterval` calls
5. `alert()` / `confirm()` / `prompt()` calls
6. `eval()` calls
7. External CDN/font references
8. TDZ risk (G object uninitialized)
9. Multiple beginTransition definitions
10. Multiple hitTest definitions

**WARN (review flag)**:
11. Declared but unused variables
12. Empty if/else blocks
13. Functions with direct global references (pure function violation)
14. Touch targets < 48px
15. CONFIG constant mismatch (spec vs code)
16. Orphaned SVG files

### 14.3 Smoke Test Gate (19 Items)

**Tier 1: Existence Verification**
1. index.html exists + browser load success
2. thumbnail.svg exists
3. manifest.json exists
4. assets/ directory absence confirmed

**Tier 2: Basic Flow**
5. BOOT → TITLE transition success
6. TITLE → SCHOOL_SELECT → CASTLE_MAP transition success
7. CASTLE_MAP → FLOOR_INTRO → PLAYING transition success
8. Movement/jump/attack work in PLAYING
9. PLAYING → PAUSE → PLAYING resume success
10. Enemy kill → score increase confirmed
11. HP 0 → GAME_OVER transition success

**Tier 3: Core Systems**
12. Boss room entry + BOSS_INTRO + boss fight start confirmed
13. Boss kill + BOSS_VICTORY + reward granted once confirmed
14. All 4 jutsu individually activate confirmed
15. Skill tree investment + effect application confirmed
16. localStorage save/load confirmed

**Tier 4: Non-functional**
17. Mobile touch input works (virtual joystick + buttons)
18. Language toggle (ko↔en) works
19. Zero orphaned files confirmed (unreferenced by code)

### 14.4 Viewport Matrix (5 Tiers)

| Viewport | Canvas Size | Joystick | Button Size | Font | Minimap |
|----------|------------|----------|-------------|------|---------|
| 320px | 320×480 | 80×80 | 48×48 | 12px | Hidden |
| 375px | 375×560 | 90×90 | 48×48 | 13px | 60×60 |
| 400px | 400×600 | 100×100 | 52×52 | 14px | 70×70 |
| 768px | 768×576 | — (keyboard) | 56×56 | 16px | 120×90 |
| 1024px+ | Dynamic | — (keyboard) | 60×60 | 18px | 160×120 |

---

## §15. Internationalization

```javascript
const I18N = {
  ko: {
    title: '그림자 닌자',
    subtitle: '카게무라의 마지막 닌자',
    start: '시작',
    school: { wind: '풍 유파', forest: '림 유파', fire: '화 유파' },
    castle: ['풍뢰성', '심림성', '염화성', '빙설성', '명암성'],
    boss: ['텐구', '카파', '오니', '유키온나', '오니마루'],
    jutsu: ['그림자 분신', '그림자 도약', '그림자 칼날', '그림자 은신'],
    // ...
  },
  en: {
    title: 'Shadow Shinobi',
    subtitle: 'Last Ninja of Kagemura',
    start: 'Start',
    school: { wind: 'Wind School', forest: 'Forest School', fire: 'Fire School' },
    castle: ['Wind Castle', 'Forest Castle', 'Fire Castle', 'Ice Castle', 'Shadow Castle'],
    boss: ['Tengu', 'Kappa', 'Oni', 'Yuki-onna', 'Onimaru'],
    jutsu: ['Shadow Clone', 'Shadow Leap', 'Shadow Blade', 'Shadow Veil'],
    // ...
  }
};
```

---

## §16. Sidebar & GameCard Metadata

### Sidebar (Game Page)
```yaml
game:
  title: "Shadow Shinobi"
  description: "A roguelike action platformer where the sole ninja survivor masters shadow jutsu to reclaim 5 castles from the Yokai Lord. Wall-run, dash, throw shurikens, and use 4 shadow jutsu to defeat yokai and conquer bosses!"
  genre: ["arcade", "action"]
  playCount: 0
  rating: 0
  controls:
    - "← → Move"
    - "Space Jump / Double Jump"
    - "Z Throw Shuriken"
    - "X Dash (invuln)"
    - "C Use Jutsu"
    - "A/S Cycle Jutsu"
    - "Shift Wall Run"
    - "Touch: Virtual Joystick + Buttons"
  tags: ["#ninja", "#roguelike", "#platformer", "#yokai", "#ink-wash", "#action", "#boss-fight"]
  addedAt: "2026-03-23"
  version: "1.0.0"
  featured: true
```

### GameCard (Home Page)
```yaml
thumbnail: "games/shadow-shinobi/thumbnail.svg"  # 4:3, cinematic composition
title: "Shadow Shinobi"                           # 1-line truncation
description: "Sole ninja survivor masters shadow jutsu to reclaim 5 castles in this roguelike action platformer"  # 2-line truncation
genre: ["arcade", "action"]                       # 2 badges
playCount: 0                                      # initial value
addedAt: "2026-03-23"                             # → "NEW" badge (within 7 days)
featured: true                                    # → ⭐ badge
```

---

## Appendix A: Extreme Build Pre-Verification

### A.1 Wind School Max (SPD-focused)
```
SPD: 1.0 + 0.3(school) + 0.1(skill Lv5) = 1.4
ATK: 10 + 0(school) = 10 → DPS = 10 × 1.4(SPD scaling) = 14
Boss5 HP: 1500 → Clear time: 1500/14 ≈ 107s (in range ✅)
Defense: DEF 5 - 10%(school) = 4.5 → Boss5 net damage = 40-4.5 = 35.5
HP 100 → Survival hits = 2.8 → Hard but compensated by dash evasion
```

### A.2 Fire School Max (ATK-focused)
```
ATK: 10 + 3(school 30%) + 6(skill Lv5 blade crit 30%) = 19 base
Shadow Blade: 19 × 2 × 1.3(school) = 49.4 → CD 10s
DPS: (19 × 1.0 + 49.4/10) ≈ 24 (SPD 0.9)
Boss5 HP: 1500 → Clear time: 1500/24 ≈ 63s (in range ✅)
DPS cap check: 24 / 10(base ATK) = 2.4 → cap 200% = 20 exceeded → cap applied → DPS=20
Post-cap: 1500/20 = 75s (in range ✅)
```

### A.3 Forest School Balanced (Regen-focused)
```
ATK: 10 + 1(school 10%) = 11 → DPS = 11 × 1.1(SPD) ≈ 12
Boss5 HP: 1500 → Clear time: 1500/12 = 125s (near upper limit, DDA adjustment → within 120s ✅)
DEF: 5 + 0.5(school 10%) = 5.5 → Net damage = 34.5
HP 100 + natural regen 2HP/10s → Effective HP ≈ 125 (over 125s)
Survival hits = 3.6 → Stable survival
```

---

## Appendix B: thumbnail.svg Spec
- **Size**: 800×600 (4:3 ratio)
- **Composition**: Kage on a cliff edge with ink-wash landscape background (wall-run or dash pose)
- **Elements**: Sumi black background + vermillion scarf + full moon (gold) + sakura particles + yokai silhouettes
- **File size**: 20KB+ (complex paths, gradients)

---

_This design document was created by synthesizing the Cycle #32 "Spectral Sleuth" postmortem, platform-wisdom.md with 32 cycles of accumulated lessons, and cycle-33-report.md market analysis data. Targets 9 consecutive unique genre combinations (#25~#33), platform's first ninja theme, and arcade+action genre occupying 60% of Poki Top 10._
