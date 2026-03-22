---
game-id: phantom-shift
title: Phantom Shift
genre: puzzle, action
difficulty: hard
---

# Phantom Shift — Cycle #23 Game Design Document

> **One-Page Summary**: A puzzle-action roguelike where players explore procedurally generated dungeons by switching between Light and Shadow dimensions in real time. Pressing Q toggles dimensions — walls vanish and passages appear. Attack timing depends on enemy dimension affinity. 15 floors + 3 bosses + hidden stage + permanent upgrade tree to **fully resolve the puzzle+action genre gap**.

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (see platform-wisdom) ✅
> Items below are verified across 18+ cycles and documented in platform-wisdom.md. Only **target sections** are listed here.

| ID | Lesson Summary | Section |
|----|---------------|---------|
| F1 | Never create assets/ directory | §4.1 |
| F2 | Zero external CDN/fonts | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modals | §6.4 |
| F4 | Zero setTimeout → tween onComplete only | §5.2 |
| F5 | Guard flag for single-execution tween callbacks | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system | §6.1 |
| F7 | State × System matrix required | §6.2 |
| F8 | Evaluate first, save later | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) | §4.4 |
| F10 | Numeric consistency table (spec = code 1:1) | §13.1 |
| F11 | Touch target min 48×48px + Math.max enforcement | §3.3 |
| F12 | TDZ prevention: declare → DOM assign → event bind order | §5.1 |
| F13 | TweenManager clearImmediate() API separation | §5.2 |
| F14 | Single update path per value (tween vs direct assign) | §5.2 |
| F15 | Smoke test gate — 8 items | §13.3 |

### New Feedback (from Cycle 22 Postmortem) 🆕

| ID | Lesson | Solution | Section |
|----|--------|----------|---------|
| F39 | 4-round review — 480px mobile viewport layout untested | menuY lower-bound pattern + viewport test matrix (320/480/768/1024px) | §3.4, §13.2 |
| F40 | Balance verification gap — no automated verification for large combinatorial space | Difficulty 3-segment balance table + core value range specification | §8.1, §13.4 |
| F41 | Single file size keeps growing — module separation delayed 22 cycles | Code region comments + function grouping guide (8 regions) | §5.3 |
| F42 | menuY layout issue persisted until 3rd review round | `Math.min(H*0.72, H-(n*(btnH+gap)+margin))` pattern enforced on all UI | §3.4 |
| F43 | Feedback mapping volume excessive (15% of spec) | Verified patterns in summary table, only new items detailed | §0 (this section) |

---

## §1. Game Overview & Core Fun Factors

### 1.1 Concept
Phantom Shift is a puzzle-action roguelike set in a dungeon where two dimensions — the **Light Realm** and the **Shadow Realm** — overlap. As the "Guardian of Dimensions," the player must stop Phantoms invading from the Shadow Realm and seal the Great Rift at the dungeon's core.

### 1.2 Three Pillars of Fun
1. **Dimension-Shifting Puzzles**: Walls visible in the Light Realm become passages in the Shadow Realm. The player mentally overlays both dimensions to find optimal paths — a spatial puzzle.
2. **Real-Time Combat Action**: Judge dimension-switch timing based on enemy affinity (light/shadow/hybrid), dodge and attack in real time.
3. **Roguelike Replayability**: Procedural dungeon generation + random items/relics ensure every run is unique. A permanent upgrade tree provides long-term motivation.

### 1.3 Story / Narrative
- **Backstory**: In ancient times, light and shadow were one world. The "Great Schism" split them into two dimensions. Cracks along the boundary let Phantoms (shadow beings) invade the Light Realm.
- **Goal**: Clear 15 dungeon floors, collect 3 Seal Stones, and seal the Great Rift.
- **Delivery**: Short cutscenes (Canvas-rendered) after each boss + "Ancient Inscriptions" (TEXT objects) found on each floor.

### 1.4 Genre Gap Resolution
- **puzzle + action = 0 games** → **Fully resolved** by this title
- Differentiated from existing puzzles (color-merge-puzzle, gem-match-blitz): real-time combat + spatial puzzle dual structure

---

## §2. Game Rules & Objectives

### 2.1 Core Rules
- Player explores 15 floors sequentially, finding the exit (stairs) on each floor
- Each floor is a procedural grid map with overlapping **Light Layer** and **Shadow Layer**
- Q key (or on-screen button) toggles **dimension**: terrain/enemies change accordingly
- Dimension shift costs **Dimension Energy** (max 100, -15 per shift, regenerates over time)
- Killing enemies grants XP + Gold; on level-up, choose 1 of 3 random skills

### 2.2 Win/Loss Conditions
- **Victory**: Defeat Floor 15 boss (Shadow Lord) + seal the Great Rift
- **Defeat**: HP reaches 0 → run ends, 30% of earned gold is preserved as permanent currency
- **Hidden Stage**: Floor 16 unlocks when specific conditions are met (all floors no-hit + all inscriptions collected)

### 2.3 Floor Structure
| Floor | Theme | Features | Boss |
|-------|-------|----------|------|
| 1–5 | Forgotten Sanctuary | Basic dimension puzzle learning | F5: Shadow Guardian |
| 6–10 | Rift Corridor | Timed puzzle rooms + traps | F10: Dimension Weaver |
| 11–15 | Abyssal Core | Dual-dimension simultaneous threats | F15: Shadow Lord |
| 16 | Origin of Light (Hidden) | Puzzle-only (no combat) | — |

### 2.4 Three Difficulty Modes
| Difficulty | HP Mult. | Enemy Mult. | Energy Regen Mult. | Reward Mult. |
|-----------|---------|------------|-------------------|-------------|
| Easy | ×1.5 | ×0.7 | ×1.3 | ×0.8 |
| Normal | ×1.0 | ×1.0 | ×1.0 | ×1.0 |
| Hard | ×0.7 | ×1.5 | ×0.7 | ×1.5 |

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| WASD / Arrow Keys | 8-directional movement |
| Q | Dimension shift (Light ↔ Shadow) |
| Space / Click | Attack (based on current dimension) |
| E | Interact (chests, inscriptions, NPC) |
| 1–3 | Use skill (acquired on level-up) |
| ESC | Pause / Menu |
| Tab | Toggle minimap |

### 3.2 Mouse
- **Left click**: Set move target / Attack
- **Right click**: Dimension shift
- **Scroll wheel**: Minimap zoom

### 3.3 Touch (Mobile)
- **Virtual joystick**: Bottom-left (radius 60px, touch area 120×120px)
- **Attack button**: Bottom-right (60×60px, MIN_TOUCH 48px guaranteed)
- **Dimension shift button**: Right-center (60×60px)
- **Skill buttons 1–3**: Right-bottom vertical stack (52×52px each)
- All touch buttons: `Math.max(CONFIG.MIN_TOUCH, size)` enforced [F11]

```javascript
// Touch target size guarantee pattern
const btnSize = Math.max(CONFIG.MIN_TOUCH, desiredSize);
```

### 3.4 Responsive UI Layout [F39, F42]
```javascript
// menuY lower-bound pattern — applied to all button layouts
const menuY = Math.min(H * 0.72, H - (btnCount * (btnH + gap) + margin));

// Viewport-specific adjustments
// 320px: joystick shrunk (50px), buttons 48px, HUD simplified
// 480px: joystick 60px, buttons 52px, minimap shrunk
// 768px+: full UI, enlarged minimap
// 1024px+: side panel possible
```

**Viewport Test Matrix** (mandatory pre-review verification):
| Viewport | Verification Items |
|----------|-------------------|
| 320×480 | All buttons within screen, no HUD overlap |
| 480×800 | Joystick+buttons visible simultaneously, game area ≥60% |
| 768×1024 | Minimap displays correctly, inventory scroll works |
| 1920×1080 | Fullscreen rendering, devicePixelRatio applied |

---

## §4. Visual Style Guide

### 4.1 Core Principles
- **Never create assets/ directory** [F1] — all graphics via Canvas inline drawing
- **Zero external CDN** [F2] — fonts via system fonts + Canvas fillText
- **No SVG filters** — feGaussianBlur, feDropShadow, etc. forbidden
- thumbnail.svg is the only external file

### 4.2 Color Palette

#### Light Dimension
| Usage | Color | HEX |
|-------|-------|-----|
| Background | Warm ivory | #FFF8E7 |
| Walls | Golden brown | #C4943A |
| Floor | Light beige | #F5E6C8 |
| Player | Glowing gold | #FFD700 |
| Enemy (light type) | Pure white | #FFFFFF (glow) |
| UI accent | Amber | #FF8C00 |

#### Shadow Dimension
| Usage | Color | HEX |
|-------|-------|-----|
| Background | Deep navy | #0A0A2E |
| Walls | Dark purple | #2D1B69 |
| Floor | Dark gray | #1A1A3E |
| Player | Purple silhouette | #9B59B6 |
| Enemy (shadow type) | Crimson | #DC143C (glow) |
| UI accent | Neon purple | #8B5CF6 |

#### Common
| Usage | Color | HEX |
|-------|-------|-----|
| HP bar | Life red | #E74C3C |
| Energy bar | Dimension blue | #3498DB |
| XP bar | Growth green | #2ECC71 |
| Gold | Golden | #F1C40F |
| Critical text | Bright yellow | #FFEB3B |

### 4.3 Dimension Shift Visual Effects
1. **Shift start** (0–200ms): Circular ripple expands from screen center
2. **Mid-shift** (200–400ms): Previous dimension fades out + new dimension fades in (alpha crossfade)
3. **Shift complete** (400–500ms): Full transition to new dimension colors + edge glow effect
4. **Particles**: 20 light/shadow particles radiate during shift

### 4.4 Drawing Function Signatures (Standard) [F9]
```javascript
// All drawing functions are pure: no global variable references
drawPlayer(ctx, x, y, size, dimension, animFrame, facing)
drawEnemy(ctx, x, y, size, type, dimension, hp, maxHp, animFrame)
drawTile(ctx, x, y, tileSize, tileType, dimension, revealed)
drawProjectile(ctx, x, y, size, dimension, type)
drawBoss(ctx, x, y, size, phase, hp, maxHp, animFrame, dimension)
drawItem(ctx, x, y, size, itemType, rarity)
drawParticle(ctx, x, y, size, alpha, color)
drawHUD(ctx, W, H, playerState, gameState, dimension)
drawMinimap(ctx, x, y, w, h, mapData, playerPos, dimension)
drawButton(ctx, x, y, w, h, text, state, style)
```

### 4.5 Character Design
- **Player**: Hooded guardian. Gold outline in Light, purple silhouette in Shadow
  - 8-directional movement poses (frame-based animation, 3 frames/direction)
  - Attack motion (2 frames)
  - Dimension shift motion (3 frames — outline flash)
  - Hit reaction (1 frame + blink)
- **5 Enemy Types**: Shadow Slime, Light Wisp, Shadow Knight, Dimension Crystal, Phantom Mage
- **3 Bosses**: Each with dedicated large-scale drawing (200×200px base)

### 4.6 Background & Environment
- **Tile-based map**: 32×32px base tile (adjustable with zoom)
- **Background layers**: Off-screen caching to prevent per-frame redraw
  - `buildBgCache(dimension, floor)`: dimension+floor background cache
  - `buildGridCache(mapData, dimension)`: terrain grid cache
  - `buildUICache(W, H)`: HUD frame cache
- **Destructible objects**: Crates (item drops), Crystals (energy recovery), Ancient Inscriptions (story)
- **Interactive background**: Torches (expand light radius), Dimension Cracks (energy regen points), Traps (spikes/arrows)

### 4.7 Camera System
- **Default**: Player-center tracking (smooth follow, lerp 0.08)
- **Boss entry**: Zoom out (1.0x → 0.7x, 600ms tween)
- **Boss entrance cutscene**: Camera pan (player → boss → return, 2 seconds)
- **Hidden stage**: Gradual zoom in (1.0x → 1.3x, atmospheric effect)

---

## §5. Core Game Loop (Per-Frame Logic Flow)

### 5.1 Initialization Order [F12]
```
1. Declare constants/CONFIG
2. Declare let variables (canvas, ctx, game state)
3. Wait for DOM load (DOMContentLoaded)
4. canvas = document.getElementById(...)
5. ctx = canvas.getContext('2d')
6. Register event listeners
7. Initialize SoundManager
8. Initialize TweenManager
9. Call resizeCanvas()
10. Enter title screen
```

### 5.2 Main Loop (60fps target)
```
function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  const dt = Math.min(timestamp - lastTime, 50); // Frame spike cap (50ms)
  lastTime = timestamp;

  // 1. Input processing (inputManager.update())
  // 2. TweenManager.update(dt) — called in ALL states [F7 matrix]
  // 3. State-specific update (switch on gameState)
  //    - GAMEPLAY: physics, AI, collision, dimension logic, particles
  //    - PAUSED: UI animation only
  //    - BOSS_CUTSCENE: camera tween only
  //    - Others: respective state logic
  // 4. Rendering (switch on gameState)
  // 5. Sound update
}
```

**Zero setTimeout Rule** [F4]: All delays via TweenManager
```javascript
// ❌ Forbidden
setTimeout(() => enterState('GAMEPLAY'), 1000);

// ✅ Correct approach
tw.add({ duration: 1000, onComplete: () => {
  if (transitionGuard) return; // Guard flag [F5]
  transitionGuard = true;
  beginTransition('GAMEPLAY');
}});
```

**TweenManager clearImmediate() Pattern** [F13]:
```javascript
TweenManager.clearImmediate = function() {
  this._tweens.length = 0;
  this._pendingCancel = false;
};
// Use clearImmediate() when add() is needed immediately after cancelAll()
```

**Single Value Update Path** [F14]:
- Dimension energy: Only TweenManager-driven regen allowed; direct assign only for consumption
- HP: Decrease only via combat calculation function return value; no direct assignment

### 5.3 Code Region Guide [F41]
Eight clearly separated regions within the single file (index.html):
```
// ═══════════════════════════════════════════
// REGION 1: CONFIG & CONSTANTS (L1~L150)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 2: UTILITY CLASSES (L151~L400)
//   - TweenManager, ObjectPool, SoundManager
//   - ScrollManager, InputManager
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 3: DRAWING FUNCTIONS (L401~L800)
//   - drawPlayer, drawEnemy, drawTile, drawBoss
//   - drawHUD, drawMinimap, drawButton
//   - buildBgCache, buildGridCache, buildUICache
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 4: PROCEDURAL GENERATION (L801~L1050)
//   - generateFloor, placeDoors, placeEnemies
//   - placeItems, placeTraps, generateBossRoom
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 5: GAME SYSTEMS (L1051~L1500)
//   - DimensionSystem, CombatSystem
//   - LevelUpSystem, ItemSystem, UpgradeTree
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 6: STATE MACHINE & TRANSITIONS (L1501~L1800)
//   - enterState, beginTransition, STATE_PRIORITY
//   - Per-state update/render functions
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 7: INPUT & EVENT HANDLERS (L1801~L2000)
//   - Keyboard, mouse, touch events
//   - Virtual joystick logic
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// REGION 8: INITIALIZATION & MAIN LOOP (L2001~end)
//   - DOMContentLoaded, resizeCanvas
//   - gameLoop, localization
// ═══════════════════════════════════════════
```

---

## §6. State Machine

### 6.1 State List & Priority [F6]
```
STATE_PRIORITY = {
  LOADING:        0,
  TITLE:          1,
  DIFFICULTY:     2,
  TUTORIAL:       3,
  FLOOR_INTRO:    4,
  GAMEPLAY:       5,
  DIMENSION_SHIFT: 6,  // Dimension shift animation (short 0.5s)
  PAUSED:         7,
  LEVEL_UP:       8,
  SHOP:           9,
  INVENTORY:     10,
  BOSS_CUTSCENE: 11,
  BOSS_FIGHT:    12,
  VICTORY:       13,
  GAMEOVER:      14,  // Highest priority
};

ESCAPE_ALLOWED = {
  PAUSED: 'GAMEPLAY',
  SHOP: 'GAMEPLAY',
  INVENTORY: 'GAMEPLAY',
  LEVEL_UP: null,  // ESC disabled — must choose
};
```

### 6.2 State × System Matrix [F7]

| State | Tween | Physics | AI | Combat | Particle | Sound | Camera | Input | Render |
|-------|:-----:|:-------:|:--:|:------:|:--------:|:-----:|:------:|:-----:|:------:|
| LOADING | ✅ | — | — | — | — | — | — | — | ✅ |
| TITLE | ✅ | — | — | — | ✅ | ✅ | — | ✅ | ✅ |
| DIFFICULTY | ✅ | — | — | — | ✅ | ✅ | — | ✅ | ✅ |
| TUTORIAL | ✅ | ✅ | — | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| FLOOR_INTRO | ✅ | — | — | — | ✅ | ✅ | ✅ | — | ✅ |
| GAMEPLAY | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DIMENSION_SHIFT | ✅ | — | — | — | ✅ | ✅ | ✅ | — | ✅ |
| PAUSED | ✅ | — | — | — | — | 🔇 | — | ✅ | ✅ |
| LEVEL_UP | ✅ | — | — | — | ✅ | ✅ | — | ✅ | ✅ |
| SHOP | ✅ | — | — | — | — | ✅ | — | ✅ | ✅ |
| INVENTORY | ✅ | — | — | — | — | ✅ | — | ✅ | ✅ |
| BOSS_CUTSCENE | ✅ | — | — | — | ✅ | ✅ | ✅ | — | ✅ |
| BOSS_FIGHT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| VICTORY | ✅ | — | — | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| GAMEOVER | ✅ | — | — | — | ✅ | ✅ | — | ✅ | ✅ |

> 🔇 = Volume reduced (BGM 30%), ✅ = Active, — = Inactive

### 6.3 State Transition Rules
```
beginTransition(targetState) {
  if (STATE_PRIORITY[targetState] < STATE_PRIORITY[currentState]) {
    if (currentState === 'GAMEOVER') return; // GAMEOVER is top priority [Cycle 3 B2]
  }
  if (transitionGuard) return; // Prevent double transition [F5]
  transitionGuard = true;

  tw.add({
    target: screenAlpha, from: 1, to: 0,
    duration: 300,
    onComplete: () => {
      enterState(targetState);
      tw.add({
        target: screenAlpha, from: 0, to: 1,
        duration: 300,
        onComplete: () => { transitionGuard = false; }
      });
    }
  });
}

// Exception: PAUSED is immediate transition (bypasses beginTransition)
// PAUSED → GAMEPLAY: direct enterState('GAMEPLAY') call
// DIMENSION_SHIFT: 0.5s animation then auto-return
```

### 6.4 Canvas-Based Modals [F3]
```javascript
// confirm()/alert() absolutely forbidden — use Canvas modals
function showModal(title, message, buttons) {
  modalState = { title, message, buttons, alpha: 0 };
  tw.add({ target: modalState, prop: 'alpha', to: 1, duration: 200 });
  // Button clicks execute callbacks
}
```

---

## §7. Dimension System (Core Mechanic)

### 7.1 Dimension Shift Rules
- **Energy cost**: 15 per shift (max 100)
- **Energy regen**: 1.5/sec (Easy: 2.0, Hard: 1.0)
- **Cooldown**: 0.5 seconds (spam prevention)
- **Shift disabled when**: Energy < 15, cooldown active, BOSS_CUTSCENE state

### 7.2 Dimension-Specific Terrain Rules
```
Light Realm Map:        Shadow Realm Map:
█ █ █ █ █              █ · █ · █
█ · · · █              · · · · ·
█ · █ · █      →       █ · · · █
█ · · · █              · · █ · ·
█ █ █ █ █              █ · █ · █

█ = Wall, · = Passage
```
- ~40% of Light Realm walls become passages in Shadow Realm
- Shadow Realm has unique walls (~20% additional)
- **Core puzzle**: Mentally overlay both dimension terrains to find path to exit

### 7.3 Enemy Dimension Affinity
| Enemy Type | Dimension | In Light | In Shadow |
|------------|----------|----------|-----------|
| Shadow Slime | Shadow-only | Transparent (harmless) | Active (attacks) |
| Light Wisp | Light-only | Active (attacks) | Transparent (harmless) |
| Shadow Knight | Shadow-dominant | Weakened (50% damage) | Empowered (150% damage) |
| Dimension Crystal | Hybrid | Active | Active (pattern change) |
| Phantom Mage | Adaptive | Auto-shifts to player's opposite dimension |

### 7.4 Energy Management Strategy
- **Aggressive shifting**: Frequently switch to enemy weakness → risk energy depletion
- **Defensive shifting**: Only shift in emergencies → can dodge enemies but delays puzzle solving
- **Relic-enhanced efficiency**: "Dimension Compass" (shift cost -3), "Shadow Lens" (2x shadow regen)

---

## §8. Difficulty System

### 8.1 Floor-by-Floor Balance Curve [F40]

#### Early Game (Floors 1–5) — Learning Phase
| Parameter | Value | Description |
|-----------|-------|-------------|
| Enemies/room | 2–4 | Basic combat learning |
| Enemy HP | 20–40 | 2–4 hits to kill |
| Enemy ATK | 5–10 | Generous vs player HP (100) |
| Puzzle complexity | 1–2 shifts | Simple path blocking |
| Item drop rate | 40% | Generous supplies |
| Est. clear time/floor | 2–3 min | |

#### Mid Game (Floors 6–10) — Challenge Phase
| Parameter | Value | Description |
|-----------|-------|-------------|
| Enemies/room | 4–7 | Crowd control needed |
| Enemy HP | 40–80 | Efficient dimension shifting required |
| Enemy ATK | 10–20 | Dodging essential |
| Puzzle complexity | 3–5 shifts | Multi-shift routes |
| Timed puzzle rooms | Appear (30s limit) | |
| Item drop rate | 25% | Selective combat |
| Est. clear time/floor | 3–5 min | |

#### Late Game (Floors 11–15) — Extreme Phase
| Parameter | Value | Description |
|-----------|-------|-------------|
| Enemies/room | 6–10 | Both-dimension enemies simultaneously |
| Enemy HP | 80–150 | Skill+item combos required |
| Enemy ATK | 20–35 | 2–3 hit deaths possible |
| Puzzle complexity | 5–8 shifts | Dual-dimension simultaneous threats |
| Traps | Spikes, dimension-reversal traps | |
| Item drop rate | 15% | Resource management critical |
| Est. clear time/floor | 5–8 min | |

### 8.2 Adaptive Difficulty Assist (Optional)
- 3+ deaths on same room: "A secret passage appears" hint displayed
- 5 consecutive deaths: +30% energy regen buff for current run

---

## §9. Boss System

### 9.1 Three Boss Specifications

#### Floor 5 Boss: Shadow Guardian
- **HP**: 500 (Easy 350, Hard 750)
- **Phase 1** (HP 100–50%): Only attackable in Shadow dimension. Invincible in Light.
  - Pattern: Straight charge → wall collision stun 2s → attack window
- **Phase 2** (HP 50–0%): Rapid dimension switching. Changes dimension every 3s.
  - Pattern: 6 radial projectiles + charge
- **Drop**: Seal Stone #1, "Shadow Cloak" (relic)

#### Floor 10 Boss: Dimension Weaver
- **HP**: 1000 (Easy 700, Hard 1500)
- **Phase 1** (HP 100–60%): Real-time map tile alteration (puzzle element)
  - Pattern: 3×3 area dimension inversion → path recalculation needed
- **Phase 2** (HP 60–30%): Summons 2 clones (weak clones in opposite dimension)
  - Pattern: Simultaneous attack with clones → identify real body puzzle
- **Phase 3** (HP 30–0%): Full map dimension instability (auto-shift every 2s)
  - Pattern: Large laser → dodge via dimension shift
- **Drop**: Seal Stone #2, "Dimension Compass" (relic)

#### Floor 15 Boss: Shadow Lord
- **HP**: 2000 (Easy 1400, Hard 3000)
- **Phase 1** (HP 100–70%): Summons + AoE attacks
- **Phase 2** (HP 70–40%): Exists in both dimensions simultaneously (deals damage in both)
- **Phase 3** (HP 40–10%): Dimension collapse → map shrinks (edge damage)
- **Phase 4** (HP 10–0%): Enrage mode → all patterns at increased speed
- **Drop**: Seal Stone #3, Game Clear

### 9.2 Boss Phase Transition Diagrams [Cycle 22 Pattern]
```
[Shadow Guardian]
  ENTER → CUTSCENE(2s) → PHASE1(HP>50%)
    │                       │ HP≤50%
    │                       ▼
    │                    PHASE2(HP>0%)
    │                       │ HP≤0%
    │                       ▼
    └──────────────────── DEFEAT → DROP → FLOOR_CLEAR

[Dimension Weaver]
  ENTER → CUTSCENE(3s) → PHASE1(HP>60%)
    │                       │ HP≤60%
    │                       ▼
    │                    PHASE2(HP>30%)
    │                       │ HP≤30%
    │                       ▼
    │                    PHASE3(HP>0%)
    │                       │ HP≤0%
    │                       ▼
    └──────────────────── DEFEAT → DROP → FLOOR_CLEAR

[Shadow Lord]
  ENTER → CUTSCENE(4s) → PHASE1(HP>70%)
    │                       │ HP≤70%
    │                       ▼
    │                    PHASE2(HP>40%)
    │                       │ HP≤40%
    │                       ▼
    │                    PHASE3(HP>10%)
    │                       │ HP≤10%
    │                       ▼
    │                    PHASE4(HP>0%)
    │                       │ HP≤0%
    │                       ▼
    └──────────────────── DEFEAT → ENDING_CUTSCENE → VICTORY
```

### 9.3 Boss Entry Cutscene Sequence
1. BGM fade-out (500ms)
2. Camera pan: player → boss position (800ms)
3. Boss entrance animation: rises from shadow (600ms)
4. Boss name + HP bar display (400ms)
5. Boss-specific BGM starts
6. Camera zoom out (0.7x, 400ms)
7. Combat begins (input enabled)

---

## §10. Procedural Dungeon Generation

### 10.1 Generation Algorithm
- **Room-based**: BSP (Binary Space Partitioning) tree for room placement
- Per floor: 8–15 rooms (more rooms on deeper floors)
- Room size: 5×5 to 12×12 tiles
- Corridors: 2-tile width connections between rooms

### 10.2 Dual-Dimension Terrain Generation
```
1. Generate Light Realm map (BSP)
2. Shadow Realm map = Light Realm copy
3. Convert 40% of Light walls to Shadow passages (random)
4. Add 20% Shadow-unique walls
5. Verify exit reachability from both dimensions (BFS)
6. If unreachable → add passages or regenerate
```

### 10.3 Seed-Based Generation
- Automatic seed generation at run start (displayable)
- Same seed → same dungeon (reproducible)
- Seed input feature (title screen)

---

## §11. Score & Progression System

### 11.1 Score Calculation [F8]
```javascript
// Evaluate first, save later
const newScore = calculateScore(kills, time, dimension_shifts, items);
const isNewBest = newScore > getBestScore(); // Evaluate first
saveBestScore(newScore);                      // Save later
if (isNewBest) showNewBestEffect();
```

| Action | Score |
|--------|-------|
| Enemy kill | 10 × enemy level |
| Boss kill | 500 / 1000 / 2000 |
| Floor clear bonus | 100 × floor number |
| No-hit clear bonus | +50% |
| Dimension shift count bonus | Under 50: +20%, Over 100: -10% |
| Inscription collection | 50 / piece |
| Hidden stage clear | +5000 |

### 11.2 Permanent Upgrade Tree
Purchased with gold (30% preserved per run):

| Category | Upgrade | Max Level | Cost (per Lv) |
|----------|---------|-----------|---------------|
| Health | Max HP +10 | 10 | 50/100/150... |
| Attack | Base ATK +2 | 8 | 80/160/240... |
| Dimension | Max energy +10 | 8 | 100/200/300... |
| Dimension | Energy regen +0.2/sec | 5 | 150/300/450... |
| Exploration | Minimap range +1 | 5 | 60/120/180... |
| Exploration | Item drop rate +5% | 5 | 120/240/360... |
| Skill | Skill slot +1 | 2 | 500/1000 |
| Hidden | ??? (unlocked when all upgrades MAX) | 1 | 5000 |

### 11.3 In-Run Level-Up System
- Kill enemies → gain XP
- On level-up, choose 1 of 3 random skills:
  - **Spear of Light** (Light ATK enhanced): Piercing attack
  - **Shadow Daggers** (Shadow ATK enhanced): Chain attack
  - **Dimension Shield**: 1s invincibility after shift
  - **Energy Drain**: +5 energy on kill
  - **Clairvoyance**: Semi-transparent view of opposite dimension terrain
  - **Haste**: +15% movement speed
  - **Fortune**: +20% item drop rate
  - **Regeneration**: 0.5 HP/sec natural recovery

---

## §12. Sound Design

### 12.1 BGM Loops (Web Audio API)
| State | Music Style | Loop Length |
|-------|-------------|-------------|
| Title | Mystical ambient | 16 bars |
| Exploration (Light) | Bright piano arpeggio | 8 bars |
| Exploration (Shadow) | Dark synth drone | 8 bars |
| Boss fight | Tense percussive rhythm | 16 bars |
| Shop/Upgrades | Peaceful bell sounds | 8 bars |

### 12.2 Sound Effects (8+)
| SFX | Trigger | Generation Method |
|-----|---------|-------------------|
| Dimension shift | Q key / right-click | Pitch slide (Light→high, Shadow→low) |
| Attack (Light) | Space / left-click | Short metallic hit |
| Attack (Shadow) | Space / left-click | Soft swoosh |
| Hit received | Damage taken | Impact + pitch down |
| Enemy killed | Enemy HP 0 | Burst + coin sound |
| Level up | XP threshold met | Rising arpeggio |
| Item pickup | Item touch | Bright bell |
| Boss entrance | Boss fight entry | Deep drum roll |
| Puzzle solved | Hidden room found | Mystical chord |
| UI click | Button touch | Short click |

### 12.3 Sound Scheduling
```javascript
// No setTimeout — use Web Audio native scheduling
const osc = audioCtx.createOscillator();
osc.start(audioCtx.currentTime);
osc.stop(audioCtx.currentTime + duration);

// Sequences: schedule via currentTime + delay
notes.forEach((note, i) => {
  const osc = audioCtx.createOscillator();
  osc.frequency.value = note.freq;
  osc.start(audioCtx.currentTime + i * 0.15);
  osc.stop(audioCtx.currentTime + i * 0.15 + note.dur);
});
```

---

## §13. Verification Checklists

### 13.1 Numeric Consistency Table [F10]
> Spec value = Code CONFIG constant. Mismatch = CRITICAL.

| Spec Item | CONFIG Constant | Value |
|-----------|----------------|-------|
| Dimension energy max | `CONFIG.DIM_ENERGY_MAX` | 100 |
| Shift cost | `CONFIG.DIM_SHIFT_COST` | 15 |
| Energy regen/sec | `CONFIG.DIM_ENERGY_REGEN` | 1.5 |
| Shift cooldown | `CONFIG.DIM_SHIFT_COOLDOWN` | 500 (ms) |
| Player HP | `CONFIG.PLAYER_HP` | 100 |
| Player ATK | `CONFIG.PLAYER_ATK` | 10 |
| Player speed | `CONFIG.PLAYER_SPEED` | 120 (px/s) |
| Touch target min | `CONFIG.MIN_TOUCH` | 48 (px) |
| Boss 1 HP | `CONFIG.BOSS1_HP` | 500 |
| Boss 2 HP | `CONFIG.BOSS2_HP` | 1000 |
| Boss 3 HP | `CONFIG.BOSS3_HP` | 2000 |
| Gold retain rate | `CONFIG.GOLD_RETAIN_RATE` | 0.3 |
| Camera lerp | `CONFIG.CAM_LERP` | 0.08 |
| Boss zoom | `CONFIG.BOSS_ZOOM` | 0.7 |
| Frame spike cap | `CONFIG.MAX_DT` | 50 (ms) |

### 13.2 Viewport Test Items [F39]
- [ ] 320×480: Title menu buttons all within screen
- [ ] 320×480: Joystick + attack button no overlap
- [ ] 480×800: HUD (HP/energy/minimap) no overlap
- [ ] 480×800: Level-up 3 choices all within screen
- [ ] 768×1024: Upgrade tree scroll works
- [ ] 1920×1080: devicePixelRatio applied
- [ ] Fullscreen toggle: UI repositions correctly

### 13.3 Smoke Test Gate [F15]
Mandatory pre-review checks (8 items):
1. [ ] `index.html` file exists
2. [ ] Zero console errors on browser load
3. [ ] Title screen displays
4. [ ] Game start → Floor 1 entry works
5. [ ] Dimension shift (Q key) works
6. [ ] Attack + kill enemy works
7. [ ] ESC → pause → resume works
8. [ ] Death → GAMEOVER screen displays

### 13.4 Balance Verification Items [F40]
- [ ] Floors 1–5: Clearable without level-ups? (beginner accessibility)
- [ ] Floors 6–10: Clearable with appropriate level-ups + items?
- [ ] Floors 11–15: Clearable without permanent upgrades by hardcore players?
- [ ] Boss 1: ~50% first-attempt clear rate?
- [ ] Boss 3: Requires sufficient upgrades + skill combos?
- [ ] Energy management: Clear penalty (depletion) for reckless dimension shifting?
- [ ] 30% gold retention: Meaningful permanent upgrades possible within 10 runs?

### 13.5 Feature-Level Checklist
> Prevent "half-implementation" via A+B+C split verification [Cycle 12, 15 lessons]

- Dimension shift: [ ] Visual transition [ ] Terrain change [ ] Enemy affinity change [ ] Energy cost [ ] Cooldown
- Boss fight: [ ] Cutscene [ ] Phase transition [ ] Unique patterns [ ] Drops [ ] BGM switch
- Level-up: [ ] 3-choice display [ ] Selection applied [ ] No duplicates [ ] UI feedback
- Permanent upgrades: [ ] Save [ ] Load [ ] Applied [ ] UI display [ ] Max level cap

---

## §14. Localization

### 14.1 Text Structure
```javascript
const TEXT = {
  ko: {
    title: '팬텀 시프트',
    subtitle: '차원의 수호자',
    start: '게임 시작',
    continue: '이어하기',
    upgrade: '업그레이드',
    settings: '설정',
    difficulty: { easy: '쉬움', normal: '보통', hard: '어려움' },
    dimension: { light: '빛의 차원', shadow: '그림자 차원' },
    boss: { guardian: '그림자 파수꾼', weaver: '차원 직조자', lord: '그림자 군주' },
    floor: '층',
    energy: '차원 에너지',
    // ... full UI text
  },
  en: {
    title: 'Phantom Shift',
    subtitle: 'Guardian of Dimensions',
    start: 'Start Game',
    continue: 'Continue',
    upgrade: 'Upgrades',
    settings: 'Settings',
    difficulty: { easy: 'Easy', normal: 'Normal', hard: 'Hard' },
    dimension: { light: 'Light Realm', shadow: 'Shadow Realm' },
    boss: { guardian: 'Shadow Guardian', weaver: 'Dimension Weaver', lord: 'Shadow Lord' },
    floor: 'Floor',
    energy: 'Dimension Energy',
    // ... full UI text
  }
};
```

---

## §15. localStorage Data Schema

```javascript
const SAVE_KEY = 'phantom-shift-save';
const SAVE_VERSION = 1;

// Save structure
{
  version: 1,
  lang: 'ko',                    // Selected language
  bestScore: 0,                   // Best score
  bestFloor: 0,                   // Best floor reached
  totalRuns: 0,                   // Total run count
  totalKills: 0,                  // Total kills
  gold: 0,                        // Permanent currency
  upgrades: {                     // Permanent upgrade levels
    hp: 0, atk: 0, energy: 0, regen: 0,
    minimap: 0, dropRate: 0, skillSlot: 0, hidden: 0
  },
  unlockedLore: [],               // Collected inscription IDs
  hiddenUnlocked: false,          // Hidden stage unlocked
  settings: {
    sfxVolume: 0.7,
    bgmVolume: 0.5,
    difficulty: 'normal',
    showDamageNumbers: true
  }
}

// Migration
function loadSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return DEFAULT_SAVE;
  const data = JSON.parse(raw);
  if (data.version < SAVE_VERSION) return migrate(data);
  return data;
}
```

---

## §16. Sidebar Metadata (Game Page)

```yaml
game:
  title: "Phantom Shift"
  description: "A puzzle-action roguelike where you explore procedural dungeons by switching between Light and Shadow dimensions in real time. Become the Guardian of Dimensions and seal the Great Rift across 15 dungeon floors."
  genre: ["puzzle", "action"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/Arrows: 8-directional movement"
    - "Q: Dimension shift (Light ↔ Shadow)"
    - "Space/Click: Attack"
    - "E: Interact"
    - "1-3: Use skills"
    - "ESC: Pause"
    - "Touch: Virtual joystick + buttons"
  tags:
    - "#roguelike"
    - "#puzzle-action"
    - "#dimension-shift"
    - "#procedural"
    - "#dungeon-crawler"
    - "#boss-fight"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## §17. Thumbnail (thumbnail.svg)

### Composition
- **Cinematic framing**: Light/shadow boundary line at screen center, player silhouette standing on the boundary
- Left: Light Realm (golden sanctuary, warm tones)
- Right: Shadow Realm (purple rifts, cool tones)
- Bottom: Game title text
- **Size**: Minimum 20KB, SVG viewBox 400×300

---

## §18. Implementation Summary

| Item | Target |
|------|--------|
| Code lines | 2,400+ |
| State count | 15 |
| Canvas drawing functions | 22–25 |
| Enemy types | 5 + 3 bosses |
| Floor count | 15 + 1 hidden |
| Permanent upgrades | 8 types |
| In-run skills | 8 types |
| Sound effects | 10+ |
| BGM loops | 5 types |
| Languages | Korean + English |
| assets/ directory | ❌ Absolutely never create |
| setTimeout | ❌ Zero |
| External CDN | ❌ Zero |

---

_End of Design Document | InfiniTriX Cycle #23 — Phantom Shift_
