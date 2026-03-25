---
game-id: prism-break
title: Prism Break
genre: action, puzzle
difficulty: medium
---

# Prism Break — Cycle #39 Game Design Document

> **One-Page Summary**: An **action puzzle** where you place and rotate crystals to create light paths and banish shadow enemies in the corrupted Prism Kingdom. A hybrid of light-refraction puzzles + real-time shadow combat, directly targeting the Poki March 2026 #1 Level Devil's action+puzzle trend and 4 puzzle-platformers in CrazyGames Top 20. 5 zones × 3 stages = 15 main + 3 bosses (MVP) + 2 hidden = **20 total stages**. Upgrade tree (Light Power / Refraction Range / Crystal Mastery, 3 branches × 5 levels) + SeededRNG crystal placement + BFS path validation. **Resolves the 11-cycle action+puzzle gap and provides stark visual contrast to the 2 existing dark-themed games (phantom-shift, shadow-rift) with bright crystal aesthetics.**

> **MVP Boundary**: **Phase 1** (Core loop: crystal placement → light refraction → shadow elimination → zone purification, Zones 1–3 + 3 bosses + Upgrades Lv1–3 + DDA 4 levels + coin system + basic narrative) → **Phase 2** (Zones 4–5 + 2 hidden stages + Upgrades Lv4–5 + weather/time-of-day effects + full narrative + complete i18n). **Phase 1 alone must deliver a complete light-refraction action puzzle experience.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (see platform-wisdom) ✅

| ID | Lesson Summary | Applied Section |
|----|---------------|----------------|
| F1 | Never create assets/ directory — CI build hook enforced [Cycle 1–38] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1–2] | §5.2 |
| F5 | Guard flag for one-time tween callback [Cycle 3 B1] | §5.2 |
| F6 | TRANSITION_TABLE single definition for state transitions [Cycle 3–38] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6–7] | §4.4 |
| F10 | Numeric consistency table (spec = code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target min 48×48px + Math.max enforced [Cycle 12–38] | §3.3 |
| F12 | TDZ prevention: INIT_EMPTY pattern [Cycle 5–38] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path per value [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22–38] | §14.3 |
| F16 | hitTest() single function unification [Cycle 27] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG exclusively (zero Math.random) [Cycle 19–38] | §5.2, §14.3 |
| F19 | Procedural SFX + BGM (Web Audio API generated) [Cycle 19–38] | §12 |
| F20 | i18n support (ko/en) [Cycle 27–38] | §13 |
| F21 | beginTransition single definition [Cycle 32–38] | §6.1 |
| F22 | Delete all orphaned SVGs [Cycle 32] | §4.1 |

### New Feedback (Cycle #38 Lessons) 🆕

| ID | Lesson | Applied Section | Solution |
|----|--------|----------------|----------|
| F23 | 2 consecutive PENDING cycles — MVP scope too large [Cycle 37–38] | §0 MVP boundary | Phase 1 MVP strictly limited to Zones 1–3 + 3 bosses |
| F24 | assets/ directory 38-cycle recurrence risk [Cycle 38] | §4.1 | All assets inline SVG + Canvas procedural. Smoke test FAIL on `assets/` |
| F25 | 4-state TRANSITION_TABLE single definition [Cycle 38 ✅] | §6.1 | This game also uses 4 states (TITLE/MAP/PLAY/BOSS) |
| F26 | Mathematical difficulty curve formulas [Cycle 38 ✅] | §8 | Light path complexity, enemy count, safe zones defined by formula |
| F27 | BFS reachability validation [Cycle 38 ✅] | §10.2 | Light path BFS: verify source→target connectivity |
| F28 | Boss weakness timing window ASCII visualization [Cycle 38 ✅] | §7.5 | ASCII diagrams for each boss's weakness exposure timing |
| F29 | Balance auto-simulator absent for 38 cycles [Cycle 38] | Appendix A | 3 extreme build formula verification + DDA fallback |
| F30 | Shared engine not separated for 38 cycles [Cycle 38] | §4.4 | Strict pure function pattern. All utility functions parameterized |

### Previous Cycle "Pain Points" Direct Resolution ⚠️

| Pain Point (cycle-38) | Resolution Section | Solution | Verification |
|----------------------|-------------------|----------|-------------|
| 2 consecutive PENDING | §0 MVP, §14.3 | Phase 1 MVP strictly limited (Zones 1–3 + 3 bosses). Smoke test gate | TITLE→MAP→PLAY transition verified |
| assets/ 38-cycle recurrence | §4.1, §14.3 | Inline SVG only. CI fails on `assets/` existence | `find . -name "assets" -type d` returns 0 |
| Balance simulator absent | Appendix A | Difficulty formulas + 3 extreme build formula verification | Clear time within 20–120s |
| Shared engine not separated | §4.4 | Pure function pattern + parameterization | Zero direct global refs (except G object) |
| Excessive content volume | §1 MVP boundary | 7 obstacles + 3 bosses (MVP). Phase 2 clearly separated | ≤5 core mechanic functions |

---

## §1. Game Overview & Core Fun

### Core Concept

**"Command the Light, Banish the Shadows"** — A hybrid of puzzle (placing and rotating crystals to design light paths) + action (shadow enemies approaching in real-time).

### Story

The Prism Kingdom once thrived on light energy, but 'Shadow Corruption' consumed the Core Prism, plunging the kingdom into darkness. Citizens transformed into shadow creatures. Lux, the last Light Guardian, must gather crystal fragments, restore light across 5 zones, and reach the Core Prism to defeat the Shadow Lord.

### Core Fun Elements

1. **Spatial Puzzle**: Place crystals on a grid, adjust angles to connect light from source to target (Shadow Core)
2. **Real-time Tension**: Shadow enemies continuously advance toward the light source — destroyed by light contact, but drain energy if they reach the source
3. **Eureka Moments**: Complex reflection paths connecting at once, simultaneously eliminating multiple enemies
4. **Build Diversity**: 3-branch upgrade tree enabling "strong single beam" vs "weak multi-beam" vs "special color beam" strategies
5. **Procedural Replay**: SeededRNG-based crystal placement + enemy spawn pattern variation

### Single Core Loop (Cycle 35 planner lesson applied)

```
Crystal Placement (puzzle) → Light Path Activation → Shadow Elimination (action) → Zone Purification → Upgrade
```

Sub-systems limited to **one upgrade tree**. Core mechanic functions ≤5:
1. `placeCrystal(grid, pos, type)` — Place crystal
2. `rotateCrystal(grid, pos, angle)` — Rotate crystal
3. `traceLight(grid, source, crystals)` — Calculate light path (raycasting)
4. `checkShadowHit(lightPath, enemies)` — Shadow enemy hit detection
5. `updateEnemies(enemies, dt, target)` — Enemy movement/AI update

---

## §2. Game Rules & Objectives

### Primary Objective
- Clear 3 stages in each of 5 zones (Crystal Caverns → Prism Palace → Rainbow Bridge → Shadow Fortress → Core of Light) to purify the Prism Kingdom
- In each stage, refract light from the source using crystals to reach the **Shadow Core** (purification target)

### Basic Rules
1. **Grid System**: Each stage is a 12×8 grid. Some cells blocked by walls/obstacles
2. **Light Source**: Fixed on the left side of the stage. Always emits light rightward
3. **Crystals**: Placeable on empty cells. When light hits, reflects/refracts at set angle
4. **Shadow Core**: Stage target. Light connection purifies it
5. **Shadow Enemies**: Spawn from map edges, move toward light source. Destroyed by light path contact. Energy -1 if they reach the source
6. **Energy**: 5 per stage. Stage fails at 0. Instant retry available (coins retained)
7. **Coins**: Dropped on enemy elimination. Used for upgrades

### Crystal Types (7 types, MVP Phase 1)

| ID | Name | Effect | Unlock Zone |
|----|------|--------|------------|
| C1 | Reflect Crystal | 90° light reflection (4 directions) | Zone 1 start |
| C2 | Split Prism | Splits light into 2 beams (45°/315°) | Zone 1-2 |
| C3 | Focus Lens | Combines 2 beams into 1 enhanced beam | Zone 2-1 |
| C4 | Color Filter (R) | Converts light to red (for red core purification) | Zone 2-3 |
| C5 | Color Filter (B) | Converts light to blue (for blue core purification) | Zone 3-1 |
| C6 | Time Crystal | Light passage slows nearby enemies (2-cell range, 50%) | Zone 3-2 |
| C7 | Blast Crystal | Light passage eliminates enemies in 3×3 range (5s cooldown) | Zone 3-3 |

### Shadow Enemy Types (5 types)

| ID | Name | HP | Speed | Special | Appears |
|----|------|----|-------|---------|---------|
| E1 | Shadow Grunt | 1 | 40px/s | None | Zone 1+ |
| E2 | Shadow Charger | 1 | 80px/s | Straight charge | Zone 1-3+ |
| E3 | Shadow Shielder | 3 | 30px/s | Front light halved (side weakness) | Zone 2+ |
| E4 | Shadow Splitter | 2 | 35px/s | Splits into 2 grunts on death | Zone 3+ |
| E5 | Shadow Corruptor | 4 | 25px/s | 1-cell darkness field (disables crystals) | Zone 3-2+ |

### Win/Lose Conditions
- **Stage Clear**: Correct color light connected to Shadow Core + all wave enemies eliminated (or survival time passed)
- **Stage Fail**: Energy reaches 0
- **Game Clear**: Zone 5 boss defeated (Phase 2) / Zone 3 boss defeated (Phase 1 MVP)

---

## §3. Controls

### §3.1 Keyboard + Mouse (PC)

| Input | Action |
|-------|--------|
| Left Click (empty cell) | Place selected crystal |
| Right Click (crystal cell) | Retrieve crystal (return to inventory) |
| Mouse Wheel / Q, E | Rotate crystal angle before placement (90° increments) |
| Keys 1–7 | Select crystal type (unlocked only) |
| Space | Start wave / Pause |
| R | Restart stage |
| ESC | Return to map |
| Mouse Hover | Light path preview (translucent) |

### §3.2 Touch (Mobile/Tablet)

| Input | Action |
|-------|--------|
| Tap cell | Place selected crystal |
| Tap placed crystal | Rotate 90° |
| Long press crystal (0.5s) | Retrieve crystal |
| Tap bottom crystal bar | Select crystal type |
| Tap start button | Start wave |
| Two-finger tap | Pause |

### §3.3 Mobile UI Layout (small ≤400px / large >400px)

```
[Small Display ≤400px]
┌──────────────────────────┐
│  ♡♡♡♡♡  ⭐1,250  🔮×3  │ ← Top bar (28px)
├──────────────────────────┤
│                          │
│     12×8 Game Grid       │ ← Main area (cell: 30px)
│     (no scroll)          │
│                          │
├──────────────────────────┤
│ [C1][C2][C3] [▶Start][↺]│ ← Bottom bar (52px, touch 48×48)
└──────────────────────────┘

[Large Display >400px]
┌──────────────────────────┐
│  ♡♡♡♡♡  ⭐1,250  🔮×3  │ ← Top bar (36px)
├──────────────────────────┤
│                          │
│     12×8 Game Grid       │ ← Main area (cell: 48px)
│                          │
├──────────────────────────┤
│[C1][C2][C3][C4] [▶][↺]  │ ← Bottom bar (60px, touch 52×52)
└──────────────────────────┘
```

> ⚠️ F11: All touch targets enforce `Math.max(48, computed)`

---

## §4. Visual Style Guide

### §4.1 Code/Asset Principles

- **Never create assets/ directory** (F1, F24): All graphics via inline SVG literals or Canvas procedural rendering
- **Zero external CDN/fonts** (F2): System fonts only (`'Segoe UI', system-ui, sans-serif`)
- **Limited SVG filter usage** (Cycle 3–7 recurrence lesson): Minimize `feGaussianBlur`, use Canvas `ctx.filter` instead. SVG uses shapes + gradients only
- Smoke test: `grep -r "assets/" index.html` must return 0 → FAIL gate

### §4.2 Color Palette

Both existing action+puzzle games use dark themes, so this game uses **bright, vibrant light/crystal theme** for stark differentiation.

| Purpose | Color | HEX |
|---------|-------|-----|
| Background (darkness) | Deep Navy | `#0a0e2a` |
| Light Path (default) | Pure White Glow | `#fffbe6` |
| Light Path (red) | Ruby Red | `#ff4466` |
| Light Path (blue) | Sapphire Blue | `#44aaff` |
| Crystal | Prism Purple | `#a855f7` |
| Purified Area | Emerald Green | `#34d399` |
| Shadow Enemy | Corruption Purple | `#4c1d95` |
| Coins/Rewards | Gold Yellow | `#fbbf24` |
| UI Accent | Cyan | `#22d3ee` |

### §4.3 Background & Zone Visuals

| Zone | Background | Mood | Special Effect |
|------|-----------|------|----------------|
| Crystal Caverns | Dark cave + crystal sparkle | Mysterious beginning | Crystal particles |
| Prism Palace | Marble palace + stained glass | Elegant puzzle | Rainbow light reflections |
| Rainbow Bridge | Aerial transparent bridge + clouds | Tense altitude | Wind particles |
| Shadow Fortress | Corroded walls + purple fog | Threatening darkness | Moving fog effect |
| Core of Light | Giant prism + light explosion | Final battle | Camera zoom/pan |

### §4.4 Pure Function Rendering Pattern (F9, F30)

All render functions use `(ctx, x, y, size, ...state)` signature:

```javascript
// ✅ Correct pattern
function drawCrystal(ctx, x, y, size, type, angle, glowIntensity) { ... }
function drawEnemy(ctx, x, y, size, type, hp, maxHp, facing) { ... }
function drawLightBeam(ctx, x1, y1, x2, y2, color, intensity) { ... }

// 🚫 Forbidden pattern (direct global reference)
function drawCrystal() { ctx.drawImage(G.crystals[sel], G.x, G.y); }
```

---

## §5. Core Game Loop (Per-Frame Logic Flow)

### §5.1 Initialization Pattern (F12: TDZ Prevention)

```javascript
const G = {
  state: 'TITLE',
  grid: null, crystals: [], lightPaths: [], enemies: [],
  energy: 5, coins: 0, score: 0, wave: 0,
  zone: 1, stage: 1,
  upgrades: { light: 0, refract: 0, crystal: 0 },
  selectedCrystal: 'C1', lang: 'ko', seed: Date.now(),
  fadeAlpha: 1, dda: 0, failCount: 0,
  bossRewardGiven: false, waveClearing: false,
};
```

### §5.2 Main Loop (60fps target)

```
Per frame (requestAnimationFrame):
  1. Calculate dt (deltaTime, cap 33ms)
  2. TW.update(dt)
  3. POOL.update(dt)
  4. switch(G.state):
     TITLE → drawTitle(ctx)
     MAP   → drawMap(ctx, G.zone, G.stage, G.upgrades)
     PLAY  → updatePlay(dt) → drawPlay(ctx)
     BOSS  → updateBoss(dt) → drawBoss(ctx)
  5. drawUI(ctx, G)
  6. SND.update()
```

**Tween rules (F4, F5, F13, F14):**
- Zero `setTimeout` → all delays via `TW.add()` + `onComplete`
- Guard flags on all tween callbacks
- `TW.clearImmediate()` for immediate cleanup
- Each value: exactly 1 update path

---

## §6. State Machine

### §6.1 TRANSITION_TABLE Single Definition (F6, F21, F25)

```javascript
const TRANSITION_TABLE = {
  TITLE: ['MAP'],
  MAP:   ['PLAY', 'TITLE'],
  PLAY:  ['MAP', 'BOSS', 'PLAY'],
  BOSS:  ['MAP'],
};
console.assert(Object.keys(TRANSITION_TABLE).length === 4, 'State count mismatch');
```

### §6.2 State × System Matrix (F7)

| System | TITLE | MAP | PLAY | BOSS |
|--------|-------|-----|------|------|
| TweenManager | ✅ | ✅ | ✅ | ✅ |
| ObjectPool | — | — | ✅ | ✅ |
| Enemy AI | — | — | ✅ | ✅(boss) |
| Light Path | — | — | ✅ | ✅ |
| Crystal Input | — | — | placement | limited(rotate) |
| BGM | title | map | play | boss |
| SFX | ui_click | ui_click | all | all |
| DDA | — | — | ✅ | — |
| Camera | static | pan | follow | zoom_out |
| Input Mode | menu | menu | game | game |

### §6.3 Camera System — 4 Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| static | TITLE | Fixed view |
| pan | MAP | Smooth zone pan |
| follow | PLAY | Track light path endpoint |
| zoom_out | BOSS | 1.0→0.7 on entry, 1.0→1.3 on defeat |

### §6.4 Canvas Modal (F3)

All modals (pause, failure, upgrade) are Canvas-based. Zero `confirm()`/`alert()`.

---

## §7. Stage Details

### §7.1 Zone 1: Crystal Caverns

| Stage | Grid | Crystals | Enemies | Difficulty |
|-------|------|----------|---------|-----------|
| 1-1 | 2 walls, straight | C1×2 | E1×5 | ★☆☆☆☆ Tutorial |
| 1-2 | 4 walls, L-shape | C1×3 | E1×8 | ★★☆☆☆ |
| 1-3 | 6 walls, 2 cores | C1×3, C2×1 | E1×10, E2×3 | ★★★☆☆ |
| BOSS: Shadow Sentinel | — | — | — | ★★★☆☆ |

### §7.2 Zone 2: Prism Palace

| Stage | Grid | Crystals | Enemies | Difficulty |
|-------|------|----------|---------|-----------|
| 2-1 | 1 moving wall | C1–C3 | E1×8, E3×2 | ★★★☆☆ |
| 2-2 | 2 moving walls, R core | C1–C4 | E1×10, E3×4 | ★★★★☆ |
| 2-3 | 3 cores (W+R+R) | C1–C4 | E1×12, E2×4, E3×3 | ★★★★☆ |
| BOSS: Prism Tyrant | — | — | — | ★★★★☆ |

### §7.3 Zone 3: Rainbow Bridge

| Stage | Grid | Crystals | Enemies | Difficulty |
|-------|------|----------|---------|-----------|
| 3-1 | Wind (crystal shift 1/turn) | C1–C5 | E1×10, E3×4, E4×2 | ★★★★☆ |
| 3-2 | Wind + darkness | C1–C6 | E1×12, E4×4, E5×2 | ★★★★★ |
| 3-3 | 3-color (W+R+B) | C1–C7 | All mixed | ★★★★★ |
| BOSS: Rainbow Serpent | — | — | — | ★★★★★ |

### §7.4 Zones 4–5 (Phase 2)

Phase 2 scope. Phase 1 MVP: Zone 3 boss defeat = game clear.

### §7.5 Boss Encounters (Phase 1: 3 bosses)

#### Boss 1: Shadow Sentinel (HP 20)
- 3×3 size, repositions every 5s. Weakness: rear only.
- P1 (20–11): 5s move, grunt×2/10s. P2 (10–1): 3s move, shielder×1/8s.

```
0s    5s    10s   15s   20s
[Stop ][Move][Stop ][Move]
 ████         ████
 ↑Weak        ↑Weak
```

#### Boss 2: Prism Tyrant (HP 30)
- Light-absorbing shield. Weakness: red light only. Shield rotates every 8s.
- P1 (30–16): 1-side shield. P2 (15–1): 2-side shield + splitter spawn.

```
0s    8s    16s   24s
[Shield↑][Rotate][Shield→][Rotate]
         ██             ██
         ↑2s exposed    ↑2s exposed
```

#### Boss 3: Rainbow Serpent (HP 40)
- Moves along grid. Weakness: blue on head + red on tail simultaneously.
- P1 (40–21): horizontal, 3 cells. P2 (20–1): S-shape, 5 cells + darkness.

```
0s        4s        8s
[Move→→→  ][Turn    ][Move←←←  ]
           ████████
           ↑4s stopped, both ends targetable
```

---

## §8. Difficulty System

### Mathematical Difficulty Curve (F26)

Stage `n` (1–15):

| Parameter | Formula | n=1 | n=8 | n=15 |
|-----------|---------|-----|-----|------|
| Enemies | `5 + floor(n × 1.5)` | 6 | 17 | 27 |
| Speed | `30 + n × 3` px/s | 33 | 54 | 75 |
| Empty Cells | `max(6, 20 - n)` | 19 | 12 | 6 |
| Waves | `1 + floor(n / 4)` | 1 | 3 | 4 |
| Coin Drop | `floor(n × 0.5) + 1` | 1 | 5 | 8 |
| Target Time | `30 + n × 6` sec | 36 | 78 | 120 |

### DDA — 4 Levels

| Level | Condition | Adjustment |
|-------|-----------|-----------|
| 0 | 0–1 fails | None |
| 1 | 2–3 fails | Speed -15%, Energy +1 |
| 2 | 4–5 fails | Speed -25%, Energy +2, 1 hint |
| 3 | 6+ fails | Speed -40%, Energy +3, 2 hints |

---

## §9. Upgrade System

### 💡 Light Power (5 levels)
Lv1: +1 dmg → Lv2: pierce → Lv3: AoE → Lv4: instant → Lv5: Solar Burst (30s CD)

### 🔮 Refraction Range (5 levels)
Lv1: 45° rotation → Lv2: +1 inventory → Lv3: remote rotate → Lv4: teleport → Lv5: Infinite Reflection (30s CD)

### 💎 Crystal Mastery (5 levels)
Lv1: split angle choice → Lv2: color mix → Lv3: time range +1 → Lv4: blast CD 3s → Lv5: Rainbow Cannon (30s CD)

### Caps (Cycle 26): DPS 200%, Synergy 150%

---

## §10. Procedural Generation

### §10.2 BFS Light Path Validation (F25, F27)

1. BFS from source through empty cells
2. Assume optimal crystal placement
3. Verify all cores reachable
4. Required crystals ≤ inventory
5. Fail → seed+1 (max 10 attempts)

---

## §11. Scoring (F8: Judge First, Save Later)

| Item | Formula |
|------|---------|
| Base | `kills × 100` |
| Time Bonus | `max(0, (target - actual) × 10)` |
| Combo | `consecutive × 50 × count` |
| Perfect | `energy === 5 ? 500 : 0` |
| Boss | `bossHP × 200` |

Star ratings: ★ clear, ★★ time bonus, ★★★ no damage.

---

## §12. Sound (F19: Web Audio Procedural)

4 BGM tracks (title/map/play/boss) + 10 SFX. All generated via OscillatorNode + GainNode + BiquadFilterNode. Zero external audio files.

---

## §13. Internationalization (F20)

Full ko/en i18n dictionary. See Korean spec §13 for complete listing.

---

## §14. Code Hygiene

### §14.1 Numeric Consistency (F10)

| Spec | Constant | Value |
|------|----------|-------|
| Grid | GRID_COLS/ROWS | 12, 8 |
| Energy | INIT_ENERGY | 5 |
| Crystals | CRYSTAL_TYPES.length | 7 |
| Enemies | ENEMY_TYPES.length | 5 |
| Bosses | BOSS_COUNT | 3 |
| Max Upgrade | MAX_UPGRADE_LV | 5 |
| Max DDA | MAX_DDA_LV | 3 |
| Touch Min | MIN_TOUCH_SIZE | 48 |
| DPS Cap | DPS_CAP | 2.0 |
| Synergy Cap | SYNERGY_CAP | 1.5 |

### §14.2 Checklist

**FAIL**: assets/ dir, setTimeout, Math.random, confirm/alert, CDN strings, uncapped DPS
**WARN**: console.log, unused code, TODO comments, feGaussianBlur

### §14.3 Smoke Test

12-step sequence: load → title → map → play → crystal → wave → hit → clear → transition table → state count → no assets/ → no banned functions.

---

## §15. Game Page Sidebar

```yaml
game:
  title: "Prism Break"
  description: "Place crystals to refract light and purify the shadow kingdom. 5 zones, 20 stages, 3-branch upgrade tree."
  genre: ["action", "puzzle"]
  playCount: 0
  rating: 0
  controls:
    - "Click: Place crystal"
    - "Right Click: Retrieve"
    - "Wheel/Q,E: Rotate"
    - "1-7: Select crystal"
    - "Space: Start/Pause"
    - "Touch: Tap/Long press"
  tags: ["#LightPuzzle", "#Crystal", "#ActionPuzzle", "#TowerDefense", "#Upgrades", "#BossFight"]
  addedAt: "2026-03-25"
  version: "1.0.0"
  featured: true
```

---

## 8. Asset Requirements

```yaml
# asset-requirements
art-style: "Light & Crystal Fantasy — brilliant light against darkness. Geometric crystals + organic shadows."
color-palette: "#0a0e2a, #fffbe6, #a855f7, #ff4466, #44aaff, #34d399, #fbbf24"
mood: "Mystical hope in darkness, strategic tension, eureka satisfaction"
reference: "God of Light puzzles + Kingdom Rush placement + Baba Is You depth"

assets:
  - id: player-lux
    desc: "Light Guardian Lux — translucent crystal armor, prism core, silver hair, light staff. 2 poses. SVG gradient glow."
    size: "512x512"
  - id: crystal-reflect
    desc: "Reflect Crystal C1 — octahedron, glass, white core, 4-dir arrows. Purple+white gradient."
    size: "128x128"
  - id: crystal-split
    desc: "Split Prism C2 — triangular prism, rainbow split effect. Purple+cyan."
    size: "128x128"
  - id: crystal-focus
    desc: "Focus Lens C3 — convex lens, 2→1 beam icon. Gold+white."
    size: "128x128"
  - id: crystal-filter-red
    desc: "Red Filter C4 — ruby hexagonal crystal, red glow. Red+purple."
    size: "128x128"
  - id: crystal-filter-blue
    desc: "Blue Filter C5 — sapphire hexagonal crystal, blue glow. Blue+purple."
    size: "128x128"
  - id: enemy-grunt
    desc: "Shadow Grunt E1 — dark purple smoke, 2 red eyes, irregular edges."
    size: "128x128"
  - id: enemy-charger
    desc: "Shadow Charger E2 — pointed triangle, red trail, arrow head."
    size: "128x128"
  - id: enemy-shield
    desc: "Shadow Shielder E3 — shield carrier, metallic front, glowing side gap."
    size: "128x128"
  - id: boss-sentinel
    desc: "Boss 1: Shadow Sentinel — massive knight, purple armor, glowing rear weakness. Large cutscene format."
    size: "600x400"
  - id: boss-tyrant
    desc: "Boss 2: Prism Tyrant — crowned shadow lord, light-absorbing shield, corruption orb."
    size: "600x400"
  - id: boss-serpent
    desc: "Boss 3: Rainbow Serpent — serpentine, rainbow segments, head(blue)+tail(red) weakness."
    size: "600x400"
  - id: bg-cavern
    desc: "Zone 1: Crystal Caverns — dark cave, crystal stalactites, purple+blue glow, water reflection."
    size: "1920x1080"
  - id: bg-palace
    desc: "Zone 2: Prism Palace — marble columns, stained glass, gold frames."
    size: "1920x1080"
  - id: bg-bridge
    desc: "Zone 3: Rainbow Bridge — crystal bridge above clouds, kingdom below, wind particles."
    size: "1920x1080"
  - id: effect-light-beam
    desc: "Light beam — white→gold gradient, glow edges, color variants."
    size: "256x64"
  - id: effect-shadow-death
    desc: "Shadow death — purple smoke dispersing. 4 frames."
    size: "256x256"
  - id: ui-energy
    desc: "Energy icon — prism heart, filled/empty states. Purple+white."
    size: "64x64"
  - id: ui-coin
    desc: "Coin icon — crystal shard, octagonal, gold glow. Spin animation."
    size: "64x64"
  - id: thumbnail
    desc: "Lux firing light beam, shadows approaching, crystals refracting. 'PRISM BREAK' title with rainbow effect."
    size: "800x600"
```

---

## Appendix A: Extreme Build Balance

All 3 extreme builds (Power/Control/Crystal all-in) verified within 20–120s clear time range. DDA Lv3 adds ~30% reduction. See Korean spec for detailed calculations.

## Appendix B: SeededRNG Reference

Standard LCG implementation with `int()`, `pick()`, `shuffle()` methods. See Korean spec for code.
