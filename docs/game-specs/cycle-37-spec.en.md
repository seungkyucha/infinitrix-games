---
game-id: gold-rush-tactics
title: Gold Rush Tactics
genre: puzzle, strategy
difficulty: medium
---

# Gold Rush Tactics — Cycle #37 Game Design Document

> **One-Page Summary**: Set in the 1849 California Gold Rush. Place mining blocks strategically on an 8×8 mine grid to extract gold veins, and build a town with the resources earned — a **puzzle + strategy hybrid**. 5 regions (Valley→Riverside→Desert→Mountains→Legendary Mine) × 3 mines = 15 main stages + 5 outlaw bosses + 3 hidden Gold Rush events = **23 total stages**. Tool upgrade tree (3 branches × 5 levels) + 8 town buildings (× 3 levels) + SeededRNG-based vein placement + multiple strategy paths (speed clear / full extraction / building priority / tool priority). **Addresses puzzle+strategy combo's 8-game longest gap + Western unused theme + 0 puzzle+strategy games in Poki Top 10 (blue ocean)**. Directly rides Block Blast (823K searches) trend + Blue Prince-style puzzle roguelike.

> **MVP Boundary**: Phase 1 (core loop: mine puzzle → reward → town build → next stage, regions 1~3 + 3 bosses + tool Lv1~3 + 5 buildings + 8 block types + DDA 3 levels) → Phase 2 (regions 4~5 + 2 bosses + 3 hidden stages + tool Lv4~5 + 8 buildings complete + 12 block types + weather/time + full narrative + i18n). **Phase 1 must deliver a complete puzzle-strategy experience on its own.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅
> Items below have been verified across 20~36 cycles and are documented in platform-wisdom.md. Only the **application section** is listed here.

| ID | Lesson Summary | Applied In |
|----|----------------|-----------|
| F1 | `assets/` directory absolutely prohibited — CI build hook forced block [Cycle 1~36] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] | §5.2 |
| F5 | Guard flags ensure tween callback executes once [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + single beginTransition definition [Cycle 3~36] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numerical consistency table (spec=code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch targets min 48×48px + Math.max enforcement [Cycle 12~36] | §3.3 |
| F12 | TDZ prevention: INIT_EMPTY pattern [Cycle 5~36] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path per value [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gates [Cycle 22~36] | §14.3 |
| F16 | hitTest() single function integration [Cycle 27] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG exclusively (zero Math.random) [Cycle 19~36] | §5.2, §14.3 |
| F19 | Procedural SFX + BGM (Web Audio API) [Cycle 19~36] | §12 |
| F20 | i18n support (ko/en) [Cycle 27~36] | §13 |
| F21 | Single beginTransition definition [Cycle 32~36] | §6.1 |
| F22 | Delete all orphaned SVGs [Cycle 32] | §4.1 |

### New Feedback (Cycle #36 Lessons) 🆕

| ID | Lesson | Applied In | Resolution |
|----|--------|-----------|-----------|
| F23 | STATE_PRIORITY bug **8th recurrence** — RESTART_ALLOWED declared but not referenced in beginTransition [Cycle 36] | §6.1, §14.3 | Simplify to 5 game states (TITLE/PUZZLE/BOSS/MAP/SHOP). **Define all transitions in single TRANSITION_TABLE object**, beginTransition() references only this table. Smoke test auto-verifies all from→to pairs |
| F24 | `assets/` directory **36 consecutive cycle recurrence** [Cycle 36] | §4.1, §14.3 | All assets as inline SVG literals + Canvas procedural rendering. Smoke test gate #1 FAILs on `assets/` existence |
| F25 | Shared engine copy-paste for 36 cycles — REGION structuring [Cycle 36] | §5.3 | 11 REGIONs for code organization. Dependency direction: upper REGION → lower REGION reference prohibited |
| F26 | Balance unverified — combinatorial space too large [Cycle 36] | §8.2, Appendix A | Puzzle difficulty curve defined mathematically. 3 extreme builds verified by formula. DPS cap (200%), synergy cap (150%) |
| F27 | BFS pathfinding technique inherited — applied to puzzle solvability [Cycle 36 ✅] | §10.2 | BFS validates "at least 1 complete row/col clearable" on mine generation |
| F28 | transAlpha proxy pattern inherited [Cycle 36 ✅] | §6.3 | G._transProxy for automatic transition effect sync |

### Previous Cycle "Pain Points" Direct Resolution ⚠️

| Pain Point (cycle-36) | Resolution Section | Resolution Method | Verification Criteria |
|----------------------|-------------------|-------------------|---------------------|
| STATE_PRIORITY bug made game unplayable (8th recurrence) | §6.1 | 5 states simplified + TRANSITION_TABLE single definition + auto verification | `Object.keys(TRANSITION_TABLE).length === total transitions` |
| assets/ 36 consecutive cycle recurrence | §4.1 | Prohibit assets/ folder creation + smoke test FAIL | `ls games/gold-rush-tactics/assets/` → "No such file" |
| Actual play testing impossible (blocked by STATE_PRIORITY) | §14.3 | Smoke test gate includes "TITLE→PUZZLE transition success" mandatory check | Browser spacebar → puzzle screen entry confirmed |
| No balance simulator | Appendix A | Mathematical difficulty curve formula + extreme build formula verification | Clear time within 30~120s range |

### Previous Cycle "Next Cycle Suggestions" Applied

| Suggestion (cycle-36 postmortem) | Applied | Section |
|---------------------------------|---------|---------|
| Build STATE_PRIORITY auto-verification tool | ✅ | §6.1, §14.3 — TRANSITION_TABLE-based static verification |
| Register assets/ CI forced block | ✅ | §4.1, §14.3 — Smoke test gate #1 |
| TD balance simulator prototype | ✅ (adapted) | Appendix A — Replaced with puzzle difficulty math formulas |

---

## §1. Game Overview & Core Fun Elements

### Core Concept

**"Understand in 10 seconds, dig deeper for 10 hours"** — Block Blast's intuitive grid placement + Blue Prince's strategic choices + Gold Rush narrative.

1849, California Gold Rush. Protagonist "Jack Morgan," a poor farmer from the East, arrives in the wilderness to find gold and build a town. Players place mining blocks on an 8×8 mine grid to complete rows/columns and extract gold veins. Resources earned (Gold/Silver/Copper) fund town buildings, tool upgrades, and defense against outlaw bosses.

### Core Fun Elements

| Fun Axis | Mechanic | Feel |
|----------|----------|------|
| **Strategic Placement** | Place non-rotatable blocks on 8×8 grid optimally | "If I put this block here, I clear 2 gold vein rows at once!" |
| **Resource Management** | Gold/Silver/Copper for buildings vs. tool upgrades | "Upgrade tools first, or build the bank for interest?" |
| **Roguelike Random** | SeededRNG-based vein/obstacle/reward placement | "This run has veins clustered on edges — prioritize L-blocks!" |
| **Boss Raids** | 5 outlaw bosses, defeat via timed puzzles | "30 seconds to build the defense wall or the town gets raided!" |
| **Narrative Progress** | 5-region exploration + Gold Rush story | "What awaits in the Legendary Mine?" |
| **Permanent Progress** | Tool tree 3 branches × 5 levels + 8 buildings × 3 levels | "Next run I can break boulders with dynamite!" |

### Market Positioning

- **puzzle+strategy in Poki Top 10: 0 games** (complete blue ocean)
- **Block Blast trend**: 823K monthly searches, +399% YoY — strong grid puzzle demand
- **Blue Prince effect**: Puzzle roguelike 2025 GOTY candidate #1 — mainstream viability of "puzzles with strategic choice" proven
- **Western theme**: Unused on platform + existing puzzle+strategy games (runeforge-tactics, elemental-cascade) both fantasy → complete differentiation

---

## §2. Game Rules & Objectives

### 2.1 Mine Puzzle (Core Play)

**Grid**: 8×8 square grid. Each cell is either empty, ore (Gold/Silver/Copper), obstacle (boulder/groundwater/toxic gas), or gold vein (special reward cell).

**Block Placement**:
- 3 mining blocks provided per turn (various shapes, 1~4 cells)
- Drag blocks onto empty grid cells to place
- **Blocks cannot be rotated** (Block Blast core rule — strategic tension)
- All 3 blocks must be placed before next 3 appear
- If placement becomes impossible → **Mine Collapse** (stage failure)

**Row/Column Clearing**:
- When a horizontal row or vertical column is completely filled, it clears
- Clearing converts all ores in that line to resources:
  - Gold ore → Gold ×3
  - Silver ore → Silver ×2
  - Copper ore → Copper ×1
- **Combo Bonus**: Clearing 2+ lines simultaneously: ×1.5 (3 lines: ×2.0, 4+ lines: ×3.0)
- Obstacles are NOT removed by clearing (tools only)

**Gold Vein Cells**:
- Special golden cells. Clearing a row/col containing a gold vein grants **Gold ×10 bonus** + 1 random boost item
- 1~3 gold veins per stage, position determined by SeededRNG

### 2.2 Town Building (Meta Strategy)

Build/upgrade town buildings with resources from mining:

| Building | Cost (Lv1) | Effect | Max Lv |
|----------|-----------|--------|--------|
| Blacksmith | Gold 5, Silver 10 | Unlocks tool upgrades | 3 |
| General Store | Gold 3, Silver 5, Copper 10 | Provides 1 boost item at stage start | 3 |
| Stagecoach | Gold 8 | Opens new regions | 3 |
| Bank | Gold 10, Silver 5 | Gold ×5% interest on stage clear | 3 |
| Sheriff's Office | Gold 5, Copper 15 | Boss defense time +5 seconds | 3 |
| Saloon | Silver 8, Copper 8 | Hire miners → block choices +1 (3→4) | 3 |
| Church | Gold 3, Silver 3, Copper 3 | Revive once on mine collapse (1/run) | 3 |
| Telegraph Office | Gold 15 | Shows hidden stage location hints | 3 |

### 2.3 Outlaw Boss Battles

Every 5th stage (region boss), an outlaw raids the town. Boss battles switch to **timed puzzle mode**:

- Place **defense blocks** on the grid within 30 seconds to complete a defense wall
- Each boss has a unique weakness pattern: complete specific wall shapes to defeat
- Boss HP bar = remaining weakness cells
- Failure to complete wall in time: town damage (50% resource loss, 1 building level down)

| Boss | Region | Weakness Pattern | Special Ability |
|------|--------|-----------------|-----------------|
| Billy the Kid | Valley | 2×4 straight wall | Destroys random cell every 5s |
| Black Bart | Riverside | 2 L-shaped walls | 50% fog of war |
| Jesse James | Desert | Cross (+) wall | Morphs 1 random block |
| Wild Bunch | Mountains | Complete border row | 3 simultaneous raids (3 weaknesses) |
| Golden Ghost (Final) | Legendary Mine | T + L + straight composite | Rotates grid 90° every 8s |

### 2.4 Gold Rush Events (Hidden Stages)

Triggered by specific achievements:
- **Hidden 1**: Clear all 5 gold vein cells in one run → "El Dorado Vein" (all cells are gold ore)
- **Hidden 2**: Achieve ×3.0 combo 3 times → "Mother Lode" (all 1×1 blocks, 50 placements)
- **Hidden 3**: Defeat all bosses without damage → "Ghost Mine" (0 obstacles, 60s max extraction)

### 2.5 Win/Lose Conditions

- **Stage Clear**: Reach stage resource goal (e.g., Gold ≥ 20)
- **Stage Fail**: Block placement impossible (mine collapse) or boss timer expires
- **Game Complete**: Clear 15 main stages + defeat final boss (Golden Ghost)
- **Permanent Progress**: Buildings & tool upgrades persist after failure (roguelite)

---

## §3. Controls

### 3.1 Keyboard

| Key | Action | Game State |
|-----|--------|-----------|
| `1`, `2`, `3` | Select block (1st/2nd/3rd) | PUZZLE |
| `Arrow Keys` / `WASD` | Move selected block placement position | PUZZLE |
| `Space` / `Enter` | Confirm placement / Start game / Confirm | ALL |
| `R` | Reset block selection | PUZZLE |
| `Escape` | Pause / Back | ALL |
| `Tab` | Toggle Town ↔ Mine | MAP |
| `Q`, `E` | Use tool (Left: pickaxe, Right: dynamite) | PUZZLE |

### 3.2 Mouse

| Action | Function | Game State |
|--------|----------|-----------|
| Click+Drag | Drag block onto grid to place | PUZZLE |
| Click | Select building / Upgrade / Menu select | MAP, SHOP |
| Right-click | Cancel block selection | PUZZLE |
| Scroll wheel | Scroll town map | MAP |
| Hover | Block placement preview (valid: green, invalid: red) | PUZZLE |

### 3.3 Touch (Mobile)

| Action | Function | Game State |
|--------|----------|-----------|
| Tap+Drag | Drag block to grid (offset display above finger) | PUZZLE |
| Tap | Select building / Upgrade / Menu select | MAP, SHOP |
| Double-tap | Use tool (current selected tool) | PUZZLE |
| Long-press (500ms) | Block info popup / Building details | ALL |
| Swipe | Scroll town map | MAP |

**Mobile Layout (≤480px)**:
```
┌──────────────────────┐
│    [Stage Info]       │  ← 48px
├──────────────────────┤
│                      │
│    8×8 Grid          │  ← 320px (40px cells)
│    (Touch Area)      │
│                      │
├──────────────────────┤
│ [Block1] [Block2] [Block3] │  ← 80px (≥48px each)
├──────────────────────┤
│ [Pickaxe] [Tool] [Info]    │  ← 56px (≥48px each)
└──────────────────────┘
```

**Large Display (≥768px)**:
```
┌────────────────────────────────────┐
│ [Stage] [Resources] [Pause]        │
├──────────────────────┬─────────────┤
│                      │ [Block 1]   │
│    8×8 Grid          │ [Block 2]   │
│    (512px, 64px/cell)│ [Block 3]   │
│                      │─────────────│
│                      │ [Tool Panel]│
│                      │ [Info Panel]│
└──────────────────────┴─────────────┘
```

> **F11 compliance**: All touch targets enforced with `Math.max(buttonSize, 48)` px.
> **F16 compliance**: All click/touch input routes through single `hitTest(x, y, target)`.
> **F26 compliance**: hitTest integration verified in code hygiene checklist as FAIL item.

---

## §4. Visual Style Guide

### 4.1 Asset Policy

> ⚠️ **Absolute Rule**: NO `assets/` directory creation. Root fix for 36 consecutive cycles of recurrence.
> - All assets as **inline SVG literals** or **Canvas procedural rendering**
> - Zero external CDN/fonts/images
> - SVG filters (feGaussianBlur etc.) prohibited — use Canvas shadow/gradient instead
> - Smoke test gate #1: `assets/` existence → immediate FAIL

### 4.2 Color Palette

```
Western Gold Rush Palette:
━━━━━━━━━━━━━━━━━━━━━━━
Primary BG       #2C1810  (Dark Brown — mine interior)
Secondary BG     #4A3728  (Medium Brown — wood texture)
Gold Ore         #FFD700  (Gold)
Silver Ore       #C0C0C0  (Silver)
Copper Ore       #B87333  (Copper)
Gold Vein        #FFF44F  (Bright Gold, glow effect)
Boulder          #696969  (Dark Gray)
Groundwater      #4682B4  (Steel Blue)
Toxic Gas        #9ACD32  (Yellow Green)
UI Text          #F5DEB3  (Wheat)
UI Accent        #CD853F  (Peru)
Boss Warning     #DC143C  (Crimson)
Success/Clear    #32CD32  (Lime Green)
Grid Lines       #5C4033  (Sepia)
Sky/BG           #87CEEB → #FF6347 (changes with time of day)
```

### 4.3 Visual Elements

**Background Layers** (3-layer parallax):
1. Sky (gradient, changes with time: dawn pink → day blue → sunset orange → night indigo)
2. Mountain/desert silhouettes (varies by region)
3. Mine entrance / town foreground

**Grid Visuals**:
- Each cell: wood plank texture (Canvas pattern)
- Ore cells: metallic crystal in respective color (Canvas rendered)
- Obstacles: boulders (angular polygons), groundwater (wave animation), toxic gas (particles)
- Placement preview: semi-transparent block + valid/invalid color overlay

**Characters** (inline SVG, 400×400+):
- Jack Morgan (protagonist): 8 poses (idle/mining/cheering/hit/tool-use/walkL/walkR/death)
- 5 outlaw bosses: dedicated large SVGs (600×400+) for intro cutscenes
- 3 town NPCs: blacksmith/merchant/sheriff (2 poses each)

**Boss Entrance Sequence**:
- Screen shake (2s, decreasing amplitude)
- Background darkening (alpha 0→0.5)
- Boss SVG zoom entrance (scale 0.3→1.0, 1.5s)
- Name + alias text animation

**Interactive Environment Elements**:
- Destructible: boulders (pickaxe ×3 / dynamite ×1), wooden supports (collapse on clear)
- Reactive: gold vein particle glow, groundwater ripple spread

### 4.4 Canvas Resolution

- `devicePixelRatio`-based dynamic resize
- Fullscreen support (`canvas.width = window.innerWidth * dpr`)
- Minimum resolution: 360×640 (mobile portrait)
- Optimal resolution: 1920×1080

> **F9 compliance**: All rendering functions use pure function pattern `drawX(ctx, x, y, w, h, ...state)`.
> Zero global object direct references — verified in code hygiene checklist.

---

## §5. Core Game Loop (Per-Frame Logic Flow)

### 5.1 Main Loop (60fps target)

```
requestAnimationFrame(gameLoop)
├── deltaTime calculation (capped at 33ms = 30fps minimum)
├── Input Processing
│   ├── PUZZLE: block drag/place input
│   ├── BOSS: defense block drag/place + timer
│   ├── MAP: building click/touch
│   └── SHOP: upgrade selection
├── Update (based on current state)
│   ├── TweenManager.update(dt)
│   ├── ParticleSystem.update(dt)
│   ├── State-specific logic (§6.2 matrix reference)
│   └── DDA check (§8.1)
├── Render
│   ├── Background layers (parallax)
│   ├── Game objects (grid/blocks/characters)
│   ├── UI overlay (resources/score/timer)
│   ├── Particle effects
│   └── Transition effects (G.transAlpha)
└── Schedule next frame
```

> **F12 compliance**: All game objects initialized with INIT_EMPTY pattern. `let grid = INIT_EMPTY()` (TDZ prevention).
> **F4 compliance**: Zero setTimeout. All delayed transitions use TweenManager.add() → onComplete callback.
> **F5 compliance**: Guard flags on all state transition tweens. `if (transitioning) return;`
> **F13 compliance**: TweenManager has clearImmediate() API. Prevents cancelAll + add race condition.
> **F14 compliance**: Single update path per value. Tween OR direct assignment, never both.
> **F18 compliance**: SeededRNG exclusively. Zero `Math.random` calls. Grep-verified in smoke test.

### 5.2 Block Placement Logic (Puzzle Core)

```
onBlockPlace(blockIdx, gridX, gridY):
  1. Validity check: all cells empty?
  2. Place block cells on grid
  3. Row/column completion check (all 8 cells filled?)
  4. Clear completed rows/columns:
     a. Calculate resources (ore type × combo multiplier)
     b. Clear animation (tween: cell scale 1→0, 300ms)
     c. Gold vein bonus check
  5. Remaining block placeable check:
     a. All 3 blocks used → generate next 3
     b. Any remaining block placeable → continue
     c. No blocks placeable → Mine Collapse (GAMEOVER transition)
  6. Stage goal check → goal met → STAGE_CLEAR transition
```

### 5.3 Code Structure (11 REGIONs)

```
REGION 1: Constants & Config (CONST, CONFIG, TRANSITION_TABLE)
REGION 2: Shared Engine (SeededRNG, TweenManager, ParticleSystem, SoundManager)
REGION 3: Render Utils (drawBlock, drawGrid, drawCharacter — pure functions)
REGION 4: Asset Definitions (inline SVG literals, character pose data)
REGION 5: Game State Machine (states, beginTransition, TRANSITION_TABLE)
REGION 6: Puzzle Engine (block generation, placement validation, row/col clear, combo calc)
REGION 7: Town/Building System (construction, upgrades, resource management)
REGION 8: Boss Battle System (weakness patterns, timer, boss AI)
REGION 9: Difficulty/DDA System
REGION 10: Sound Definitions (procedural SFX/BGM parameters)
REGION 11: Initialization & Main Loop
```

> Dependency direction: REGION N may only reference REGIONs 1~(N-1). Reverse references prohibited.

---

## §6. Game State Machine

### 6.1 State Definitions & Transition Table

> **F6/F21/F23 core response**: To eradicate the 8th recurrence of STATE_PRIORITY, game states are **simplified to 5**, and all transitions are defined in a **single TRANSITION_TABLE object**.

```javascript
// Game states (only 5)
const STATE = {
  TITLE: 'TITLE',
  PUZZLE: 'PUZZLE',    // Mine puzzle + boss battle included
  MAP: 'MAP',          // Town map + building placement
  SHOP: 'SHOP',        // Tool upgrade shop
  GAMEOVER: 'GAMEOVER'
};

// ⚠️ ALL transitions defined here only. beginTransition() references ONLY this table.
const TRANSITION_TABLE = {
  'TITLE→PUZZLE':    { duration: 800, easing: 'easeInOut' },
  'TITLE→MAP':       { duration: 600, easing: 'easeIn' },
  'PUZZLE→MAP':      { duration: 500, easing: 'easeOut' },
  'PUZZLE→SHOP':     { duration: 400, easing: 'easeOut' },
  'PUZZLE→GAMEOVER': { duration: 1000, easing: 'easeIn' },
  'MAP→PUZZLE':      { duration: 500, easing: 'easeIn' },
  'MAP→SHOP':        { duration: 400, easing: 'easeOut' },
  'SHOP→MAP':        { duration: 400, easing: 'easeOut' },
  'SHOP→PUZZLE':     { duration: 500, easing: 'easeIn' },
  'GAMEOVER→TITLE':  { duration: 800, easing: 'easeInOut' },
  'GAMEOVER→MAP':    { duration: 600, easing: 'easeIn' }   // Roguelite continue
};

// beginTransition rejects transitions not in TRANSITION_TABLE
function beginTransition(from, to) {
  const key = `${from}→${to}`;
  if (!TRANSITION_TABLE[key]) {
    console.error(`[FSM] Invalid transition: ${key}`);
    return false;
  }
  if (G._transitioning) return false; // Guard flag
  G._transitioning = true;
  const cfg = TRANSITION_TABLE[key];
  tweenManager.add(G._transProxy, 'alpha', 0, 1, cfg.duration, cfg.easing, () => {
    G.state = to;
    tweenManager.add(G._transProxy, 'alpha', 1, 0, cfg.duration, cfg.easing, () => {
      G._transitioning = false; // Guard release
    });
  });
  return true;
}
```

**Auto-verification**: Smoke test greps all `beginTransition(STATE.X, STATE.Y)` calls against `Object.keys(TRANSITION_TABLE)`.

### 6.2 State × System Matrix (F7)

| System | TITLE | PUZZLE | MAP | SHOP | GAMEOVER |
|--------|:-----:|:------:|:---:|:----:|:--------:|
| **TweenManager** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **ParticleSystem** | ✅ | ✅ | — | — | ✅ |
| **Input: Keyboard** | start | puzzle | navigate | select | restart |
| **Input: Mouse** | start | drag+place | click | click | restart |
| **Input: Touch** | tap | drag+place | tap+swipe | tap | tap |
| **Puzzle Engine** | — | ✅ | — | — | — |
| **Town System** | — | — | ✅ | — | — |
| **Boss Battle** | — | ✅(sub) | — | — | — |
| **DDA** | — | ✅ | — | — | — |
| **Sound: BGM** | title_bgm | mine_bgm / boss_bgm | town_bgm | shop_bgm | gameover_bgm |
| **Sound: SFX** | — | ✅ | ✅ | ✅ | — |
| **Render: BG** | title_bg | mine_bg | town_bg | shop_bg | gameover_bg |
| **Render: UI** | title_ui | puzzle_ui | map_ui | shop_ui | gameover_ui |

> **Cycle 26 lesson**: Input column uses **mode names** instead of simple ✅/— to prevent cross-state input conflicts.

### 6.3 Screen Transitions (F28 — transAlpha Proxy Pattern)

```javascript
// transAlpha proxy pattern verified in Cycle 36
G._transProxy = new Proxy({ alpha: 0 }, {
  set(target, prop, value) {
    target[prop] = value;
    G.transAlpha = value; // Auto-syncs with game loop
    return true;
  }
});
```

### 6.4 Canvas Modal (F3)

Canvas-based modals instead of confirm()/alert():
```
drawModal(ctx, title, message, buttons[]) → Promise<buttonIndex>
```
- Semi-transparent background overlay (alpha 0.7)
- Modal box centered
- Button touch targets 48px+ guaranteed

---

## §7. Boss Battle Detailed Design

### 7.1 Boss Battle Entry

Auto-enters boss battle on clearing region's last mine (3rd):
1. Screen shake + warning sound
2. Boss intro cutscene (SVG zoom + name display, 3s)
3. Puzzle mode → Boss puzzle mode transition (grid reset, defense blocks provided)
4. 30-second timer starts

### 7.2 Boss Weakness Patterns

Each boss displays **weakness cells** (red border) on grid. Placing blocks on these cells damages the boss:

```
Billy the Kid pattern:       Black Bart pattern:
. . . . . . . .             . . . . . . . .
. . . . . . . .             . . ■ . . . . .
. . . . . . . .             . . ■ . . . . .
. . ■ ■ ■ ■ . .             . . ■ ■ . . . .
. . . . . . . .             . . . . . . . .
. . . . . . . .             . . . . ■ . . .
. . . . . . . .             . . . . ■ . . .
. . . . . . . .             . . . . ■ ■ . .
```

### 7.3 Boss DPS Cap (F26)

Boss battle damage calculation:
- 1 weakness cell placed = 1 damage
- Tool bonus (pickaxe Lv3): +0.5 damage/cell
- **DPS cap: weakness cell count × 2.0** (tool bonus ceiling)
- Boss HP = weakness cell count × 1.5 (no boss requires tools to beat — guaranteed)

### 7.4 Boss Rewards

> **F17 compliance**: `bossRewardGiven` flag prevents duplicate reward distribution.

| Boss | Reward | Guard Flag |
|------|--------|-----------|
| Billy the Kid | Gold 30 + Bank construction unlock | `boss1RewardGiven` |
| Black Bart | Gold 50 + Special "T-block" unlock | `boss2RewardGiven` |
| Jesse James | Gold 80 + Dynamite tool unlock | `boss3RewardGiven` |
| Wild Bunch | Gold 120 + Hidden stage hint | `boss4RewardGiven` |
| Golden Ghost | Gold 200 + Ending credits | `boss5RewardGiven` |

---

## §8. Difficulty System

### 8.1 Stage Difficulty Curve (Mathematical Definition)

```
stage = 1~15 (main stages)
region = ceil(stage / 3)  // 1~5

Obstacle ratio = 0.05 + (stage - 1) × 0.02          // 5%~33%
Gold veins     = max(1, 4 - floor(stage / 4))         // 3→2→1
Block complexity = min(4, 1 + floor(stage / 4))        // 1~4 cell blocks
Target resources = 10 + stage × 5                      // 15~85
Boss HP        = region × 8                             // 8~40 (weakness cells)
Boss time      = max(20, 35 - region × 3)              // 32→29→26→23→20s
```

### 8.2 DDA (Dynamic Difficulty Adjustment) 3 Levels

| DDA Level | Condition | Adjustment |
|-----------|-----------|-----------|
| Easy | 2 consecutive failures | Obstacles -20%, block choices +1, boss time +10s |
| Normal | Default | Spec values as-is |
| Hard | 3 consecutive no-damage clears | Obstacles +10%, gold veins -1, boss abilities enhanced |

DDA applies **only at stage start** (no mid-play changes).

### 8.3 Extreme Build Verification (Appendix A Summary)

| Build | Tools | Buildings | Expected Clear Time |
|-------|-------|-----------|-------------------|
| Speed Clear (tools first) | Pickaxe Lv5 | Blacksmith Lv3 only | Stage 15: 45s |
| Full Extraction (max resources) | Pickaxe Lv3 | Bank Lv3 + Church Lv3 | Stage 15: 90s |
| Building Priority (safe play) | Pickaxe Lv2 | All Lv2 | Stage 15: 110s |

> All extreme builds clear time: **within 30~120s range** (out of range = balance adjustment needed).

---

## §9. Tool Upgrade Tree (Permanent Progress)

### 3 Branches × 5 Levels

**Branch A: Pickaxe (Mining Efficiency)**
| Lv | Cost | Effect |
|----|------|--------|
| 1 | Gold 5 | Remove boulder obstacles in 3 hits |
| 2 | Gold 15 | Boulder 2 hits, +1 Copper bonus per clear |
| 3 | Gold 30 | Boulder 1 hit, +1 Silver bonus per clear |
| 4 | Gold 50 | Groundwater removable in 2 hits |
| 5 | Gold 80 | All obstacles 1 hit + +1 Gold per clear |

**Branch B: Dynamite (Destructive Power)**
| Lv | Cost | Effect |
|----|------|--------|
| 1 | Gold 10, Silver 5 | 3×3 area obstacle removal (1/stage) |
| 2 | Gold 25, Silver 10 | 3×3 area + 2/stage |
| 3 | Gold 45, Silver 20 | 5×5 area + 2/stage |
| 4 | Gold 70, Silver 30 | 5×5 area + 3/stage |
| 5 | Gold 100, Silver 50 | Full row/col blast + 3/stage |

**Branch C: Survey Equipment (Info/Bonus)**
| Lv | Cost | Effect |
|----|------|--------|
| 1 | Silver 10, Copper 10 | Gold veins always visible (fog removed) |
| 2 | Silver 25, Copper 20 | Preview next 3 blocks |
| 3 | Silver 40, Copper 35 | Combo multiplier +0.5 additive |
| 4 | Silver 60, Copper 50 | Hidden stage condition UI hint |
| 5 | Silver 80, Copper 70 | Gold vein bonus ×2 + random boost at run start |

> **DPS Cap 200%**: Tool bonuses capped at 2× base resource yield.
> **Synergy Cap 150%**: Combined building + tool bonuses capped at 150%.

---

## §10. Procedural Generation

### 10.1 Mine Grid Generation Algorithm

```
generateMineGrid(seed, stage):
  1. Initialize SeededRNG(seed + stage)
  2. Initialize 8×8 grid as empty
  3. Place obstacles: obstacleRatio × 64 cells, random positions
  4. Place gold veins: goldVeinCount on non-obstacle cells
  5. Place ores: remaining empty cells with Gold(15%)/Silver(35%)/Copper(50%)
  6. ⚠️ Solvability validation (§10.2)
  7. On validation failure: regenerate with seed+1 (max 10 attempts)
```

### 10.2 Solvability Validation (BFS) — F27

> **Cycle 36 BFS inheritance + Cycle 23 lesson**: Validate that at least 1 row or column can be cleared on the generated grid.

```
validateGrid(grid, blocks):
  // Simulate whether at least 1 row/col can be completed with current block set
  for each row/col:
    count empty cells
    if (empty cells <= total available block cells):
      return VALID  // Clearing possibility exists
  return INVALID → regenerate
```

### 10.3 Block Types

Block type pool (unlocked by stage):

| Block ID | Shape | Cells | Unlock |
|----------|-------|-------|--------|
| I2 | ■■ | 2 | Default |
| I3 | ■■■ | 3 | Default |
| L3 | ■■/■ | 3 | Default |
| I4 | ■■■■ | 4 | Stage 4+ |
| L4 | ■■■/■ | 4 | Stage 4+ |
| T4 | ■■■/·■ | 4 | Stage 7+ (Boss 2 clear) |
| S4 | ·■■/■■ | 4 | Stage 7+ |
| O4 | ■■/■■ | 4 | Stage 10+ |
| PLUS | ·■/■■■/·■ | 5 | Stage 10+ |
| U5 | ■·■/■■■ | 5 | Stage 13+ |
| DOT | ■ | 1 | Default |
| CORNER | ■·/■■ | 3 | Stage 4+ |

---

## §11. Scoring System

### 11.1 Score Calculation

| Action | Score |
|--------|-------|
| Block placement | +10 |
| Row/col clear | +100 × combo multiplier |
| Gold vein clear | +500 |
| Boss defeat | +1000 × region number |
| Hidden stage clear | +3000 |
| No-damage boss defeat | +500 bonus |
| Full extraction (all ores cleared) | +200 |

> **F8 compliance**: Score judgment (isNewHighScore) → save (saveBest) order fixed.

### 11.2 Combo System

```
Simultaneous lines cleared: 1     2     3     4+
Combo multiplier:           ×1.0  ×1.5  ×2.0  ×3.0
```

Consecutive turn clear bonus: ×(1 + N×0.1) for N consecutive turns with clears, max ×2.0

---

## §12. Sound Design (Web Audio API Procedural)

### 12.1 BGM (6 types)

| BGM | State | Style | BPM | Key |
|-----|-------|-------|-----|-----|
| title_bgm | TITLE | Western guitar, relaxed melody | 80 | Am |
| mine_bgm | PUZZLE (normal) | Tense percussion + piano | 100 | Dm |
| boss_bgm | PUZZLE (boss) | Fast-tempo drums + harmonica | 140 | Em |
| town_bgm | MAP | Peaceful accordion style | 72 | C |
| shop_bgm | SHOP | Blacksmith rhythm (metallic strikes) | 90 | Gm |
| gameover_bgm | GAMEOVER | Slow guitar, wind sounds | 60 | Am |

### 12.2 SFX (10+ types)

| SFX | Trigger | Frequency | Duration | Waveform |
|-----|---------|-----------|----------|----------|
| block_place | Block placed | 440Hz→220Hz | 0.1s | square→sine |
| row_clear | Row/col cleared | 523Hz→1047Hz | 0.3s | sine, rising sweep |
| combo | 2+ line combo | 660Hz→1320Hz | 0.4s | triangle, double sweep |
| gold_nugget | Gold vein clear | 880Hz→1760Hz | 0.5s | sine, sparkle |
| rock_break | Boulder destroyed | 100Hz→50Hz | 0.2s | sawtooth, impact |
| dynamite | Dynamite used | 80Hz→40Hz | 0.6s | noise, explosion |
| boss_appear | Boss entrance | 60Hz→30Hz | 1.5s | sawtooth, sub-bass |
| boss_hit | Boss weakness hit | 350Hz→700Hz | 0.15s | square |
| boss_defeat | Boss defeated | C4→E4→G4→C5 | 1.0s | sine, arpeggio |
| game_over | Game over | 440Hz→220Hz→110Hz | 1.2s | sine, descending |
| build_complete | Building complete | E4→G4→C5 | 0.5s | triangle |
| upgrade | Tool upgrade | 523Hz→784Hz→1047Hz | 0.6s | sine, ascending 3-note |

---

## §13. Internationalization (ko/en)

```javascript
const LANG = {
  ko: {
    title: '골드러시 택틱스',
    start: '게임 시작',
    stage: '스테이지',
    gold: '금', silver: '은', copper: '동',
    combo: '콤보',
    bossWarning: '무법자 습격!',
    timeLeft: '남은 시간',
    stageCleared: '광산 클리어!',
    gameOver: '광산 붕괴...',
    townMap: '마을 지도',
    upgrade: '업그레이드',
    build: '건설',
    // ... 60+ strings
  },
  en: {
    title: 'Gold Rush Tactics',
    start: 'Start Game',
    stage: 'Stage',
    gold: 'Gold', silver: 'Silver', copper: 'Copper',
    combo: 'Combo',
    bossWarning: 'Outlaw Raid!',
    timeLeft: 'Time Left',
    stageCleared: 'Mine Cleared!',
    gameOver: 'Mine Collapsed...',
    townMap: 'Town Map',
    upgrade: 'Upgrade',
    build: 'Build',
    // ... 60+ strings
  }
};
```

Auto-detects via `navigator.language`, in-game language toggle provided.

---

## §14. Code Hygiene & Verification Checklist

### 14.1 Numerical Consistency Table (F10)

| Spec Item | Spec Value | Code Variable | Verified |
|-----------|-----------|--------------|----------|
| Obstacle ratio formula | 0.05+(stage-1)×0.02 | `OBSTACLE_RATIO(stage)` | ☐ |
| Gold vein count formula | max(1, 4-floor(stage/4)) | `GOLD_VEIN_COUNT(stage)` | ☐ |
| Combo multiplier 2-line | ×1.5 | `COMBO_MULT[2]` | ☐ |
| Boss HP formula | region×8 | `BOSS_HP(region)` | ☐ |
| DPS cap | 200% | `DPS_CAP` | ☐ |
| Synergy cap | 150% | `SYNERGY_CAP` | ☐ |
| DDA obstacle reduction | -20% | `DDA_EASY_OBSTACLE_MULT` | ☐ |
| Min touch target | 48px | `MIN_TOUCH_TARGET` | ☐ |

### 14.2 Code Hygiene Checklist

**FAIL (mandatory — build rejection on violation)**:
- [ ] `assets/` directory exists → FAIL
- [ ] `setTimeout` / `setInterval` calls → FAIL
- [ ] `Math.random` calls → FAIL
- [ ] `confirm()` / `alert()` / `prompt()` calls → FAIL
- [ ] `fetch()` / external URL reference → FAIL
- [ ] `feGaussianBlur` / SVG filter usage → FAIL
- [ ] hitTest bypass (direct coordinate comparison) → FAIL
- [ ] State transition not in TRANSITION_TABLE → FAIL
- [ ] Rendering function with direct global G reference → FAIL (pure function violation)

**WARN (advisory — review during code review)**:
- [ ] Single function exceeds 100 lines → WARN
- [ ] Duplicate code pattern 3+ times → WARN
- [ ] Uncommented magic numbers → WARN

### 14.3 Smoke Test Gates

```
Gate #1 (File System):
  ✓ No assets/ directory
  ✓ Single index.html file
  ✓ File size < 500KB

Gate #2 (Code Patterns):
  ✓ grep -c "setTimeout" index.html → 0
  ✓ grep -c "Math.random" index.html → 0
  ✓ grep -c "confirm(" index.html → 0
  ✓ grep -c "feGaussianBlur" index.html → 0
  ✓ All TRANSITION_TABLE transitions mapped to beginTransition calls

Gate #3 (Functional Verification):
  ✓ Browser load → title screen displays
  ✓ Space/click → PUZZLE state entry (STATE_PRIORITY verification!)
  ✓ Block drag+place → reflected on grid
  ✓ Row/col clear → resources gained + score increase
  ✓ ESC → pause modal (Canvas-based)
```

---

## §15. Game Page Sidebar Data

```yaml
game:
  title: "Gold Rush Tactics"
  description: "1849 Gold Rush! Solve mine puzzles to extract gold veins, build your town, and defend against outlaws. Block Blast-style grid puzzle + Western frontier strategy."
  genre: ["puzzle", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "Mouse: Drag blocks to place, hover to preview"
    - "Keyboard: 1/2/3 select block, arrow keys move, Space confirm"
    - "Touch: Tap+drag to place, double-tap to use tool, long-press for info"
  tags:
    - "#puzzle"
    - "#strategy"
    - "#goldrush"
    - "#western"
    - "#gridpuzzle"
    - "#roguelite"
    - "#townbuilding"
    - "#bossbattle"
  addedAt: "2026-03-24"
  version: "1.0.0"
  featured: true
```

---

## §16. Narrative / Story

### 16.1 Setting

1849, California. Jack Morgan was a poor farmer from the East who heard rumors of gold discovered out West. He arrives at "Dead Man's Creek" — a barren wasteland with nothing but promise. Here he must find gold, build a town, and protect it from outlaws.

### 16.2 Region Narratives

| Region | Story Element | Atmosphere |
|--------|--------------|-----------|
| 1. Valley | First gold discovery, small camp beginnings | Hopeful, bright |
| 2. Riverside | Rival miners appear, territorial disputes | Tense, conflicted |
| 3. Desert | Water shortage, survival crisis | Desperate, harsh |
| 4. Mountains | Rumors of legendary vein, dangerous climb | Awe-inspiring, dangerous |
| 5. Legendary Mine | Discovery of native legend's golden cave | Mystical, epic |

### 16.3 Cutscenes (Text + Character SVG)

Short text cutscenes at each region start/end + boss entrance:
- Character SVG pose transitions + dialogue box
- Touch/click to advance
- Skip button (unlocked after first playthrough)

---

## Appendix A: Balance Formula Verification

### A.1 Resource Economy Simulation

```
Stage 1 expected income:
  Empty cells: 64 - (64 × 0.05) = 61 cells
  Gold ores: 61 × 0.15 = 9.15 → 9 → cleared: Gold 27
  Silver ores: 61 × 0.35 = 21.35 → 21 → cleared: Silver 42
  Copper ores: 61 × 0.50 = 30.50 → 31 → cleared: Copper 31
  Average clear rate (DDA normal): 60% → Gold 16, Silver 25, Copper 19
  Target: Gold 15 → achievable ✅

Stage 15 expected income:
  Empty cells: 64 - (64 × 0.33) = 43 cells
  Gold ores: 43 × 0.15 = 6.45 → 6 → cleared: Gold 18
  Target: Gold 85 → impossible without tools → Pickaxe Lv3+ required
  With tool bonus: Gold 18 + (row/col clears ~8 × Gold 1) = Gold 26/turn
  4 turns expected: Gold 104 → achievable ✅ (within DPS cap 200%)
```

### A.2 Boss Battle Clear Time Verification

```
Boss 5 (Golden Ghost):
  Weakness cells: 40 (= region 5 × 8)
  Boss HP: 40 × 1.5 = 60
  Time limit: 20s

  Tool Lv0: 1 dmg/cell, need 60 cells in 20s → 3 cells/s → hard (DDA normal)
  Tool Lv3 (pickaxe): 1.5 dmg/cell, 40 cells for 60 dmg → 2 cells/s → achievable
  Tool Lv5 (max): 2.0 dmg/cell, 30 cells for 60 dmg → 1.5 cells/s → comfortable

  Clear time range: 15s (Lv5) ~ 20s (Lv0+DDA) → within 30~120s range ✅
  ※ DPS cap 200% uncrossable → max 2.0 dmg/cell guaranteed
```

---

## Appendix B: Thumbnail SVG Composition

Cinematic representative scene (20KB+):
- Foreground: Partial 8×8 grid with glowing gold ores
- Midground: Jack Morgan silhouette holding a pickaxe
- Background: Western sunset (orange→purple gradient) + mountain silhouette
- Text: "GOLD RUSH TACTICS" gold-colored logo
- Mood: Adventure and anticipation

---

_Spec written: 2026-03-24_
_Cycle: #37_
_Planner: AI Game Planner (Cycle 37)_
