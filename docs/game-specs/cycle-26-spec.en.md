---
game-id: void-architect
title: Void Architect
genre: arcade, strategy
difficulty: hard
---

# Void Architect — Cycle #26 Game Design Document

> **One-Page Summary**: A **roguelike tower defense** where players defend against Void creatures pouring through dimensional rifts by placing tetromino-shaped defensive blocks. Build towers on a 12×8 grid using 7 tetromino types × 5 elements (Fire/Ice/Poison/Lightning/Void), survive 15+1 waves, and defeat 5 dimensional bosses + hidden boss "Dimension Destroyer." Roguelike 3-pick choices between waves (tower upgrade/new block/dimensional ability) ensure every run takes a different strategic path. Features permanent progression (3-branch upgrade tree: Attack/Defense/Utility), SeededRNG procedural maps + BFS path validation, 3 difficulties (Apprentice/Architect/Dimensioneer), and narrative (Dimension Guardian story). **Strengthens the arcade+strategy combination from 1→2 games.**

> **MVP Boundary**: Phase 1 (core loop: tetromino placement→wave defense→roguelike selection→boss fight, Dimensions 1-2 + 2 bosses + basic upgrade tree) + Phase 2 (Dimensions 3-5 + 3 bosses + hidden boss + full narrative + challenge mode). Phase 1 must deliver a complete game experience on its own.

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅
> Items below have been verified across 18+ cycles and are documented in platform-wisdom.md. This spec lists only **applied sections**.

| ID | Lesson Summary | Applied Section |
|----|---------------|-----------------|
| F1 | Never create assets/ directory — 9 consecutive cycles clean [Cycle 1~25] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] — 14 cycles consecutive | §5.2 |
| F5 | Guard flag ensures tween callback fires once [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system [Cycle 3 B2] | §6.1 |
| F7 | State × System ACTIVE_SYSTEMS matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numeric consistency table (spec = code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target min 48×48px + Math.max enforcement [Cycle 22] | §3.3 |
| F12 | TDZ prevention: var declaration → DOM assign → event registration order [Cycle 5] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path unification (tween vs direct assignment) [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22] | §14.3 |

### New Feedback (Based on Cycle 25 Post-Mortem) 🆕

| ID | Lesson | Solution | Applied Section |
|----|--------|----------|-----------------|
| F55 | 3-round review required — illegal SVG in assets/ + mobile glyph slot unimplemented as P0 (Cycle 25) | Expand smoke test gate to 13 items. Add mobile touch completeness + assets/ auto-validation as mandatory gates. **Target: APPROVED within 2 rounds** | §14.3 |
| F56 | STATE_PRIORITY dead code — designed in spec but unused in code (Cycle 25) | Mandatory "call path comment" for all declared constants/objects. Specify "where is this code called?" in spec. Dead code detection checklist in code review | §6.1, §14.2 |
| F57 | Balance auto-validation insufficient — 5 biomes × 5 bosses × 20 glyphs impossible to verify by review alone (Cycle 25) | DPS/EHP balance formulas in §8.2. Tower combo DPS matrix + enemy EHP range table. DDA fallback for extreme balance deviations | §8.1, §8.2 |
| F58 | Shared engine module extraction delayed 26 cycles — copy-paste limit exceeded (Cycle 25) | Still single-file implementation, but **separate common patterns into clear REGIONs** and code for future extraction. Isolate TweenManager/ObjectPool/SoundManager in independent REGION | §5.3 |
| F59 | Validation script FAIL/WARN 2-tier separation needed — 15+ items burden during coding (Cycle 25) | Split auto-validation into FAIL (mandatory: assets/, setTimeout, external resources, alert/confirm) + WARN (advisory: comment remnants, dead code) | §14.2 |

### Previous Cycle Pain Points Resolution Summary (Cycle 25 Post-Mortem)

| Pain Point | Resolution Section | Resolution Method |
|-----------|-------------------|-------------------|
| 3-round review required | §14.3 | 13-item smoke test + mobile checklist. Target: ≤2 rounds |
| STATE_PRIORITY dead code | §6.1, §14.2 | "Call path comment" pattern + dead code checklist |
| Balance auto-validation insufficient | §8.1, §8.2 | DPS/EHP formulas + tower combo DPS matrix + DDA fallback |
| Shared engine module not extracted | §5.3 | 10-REGION code structure for future extraction |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
Void Architect is a roguelike tower defense where players strategically place tetromino-shaped defensive blocks to seal dimensional rifts against invading Void creatures. The triple axis of tetromino **spatial puzzles**, tower defense **path strategy**, and roguelike **replay value** form the core experience.

### 1.2 Three Pillars of Fun
1. **Tetromino Spatial Puzzle**: Finding optimal tower placement by rotating/flipping 7 block types on a limited grid. Connecting adjacent same-element blocks triggers synergy AoE attacks — the unique thrill of "Tetris meets Tower Defense."
2. **Roguelike Strategic Branching**: 3-pick choices (new block/tower upgrade/dimensional ability) between waves. Every run takes a different path: "What if I go full ice build this time?"
3. **Dimensional Boss Encounters**: 5 dimensional bosses expose weaknesses only when specific tower patterns are placed in specific locations — spatial puzzle combat. Satisfaction comes from "right tower, right place," not just raw DPS.

### 1.3 Story/Narrative
- **Background**: "Architects" are ancient beings who build and maintain dimensions. The Void — nothingness between dimensions — has awakened and begun consuming reality. As the last Architect, players must build barriers from dimensional debris (tetromino blocks) and seal rifts across 5 dimensions.
- **Per-Dimension Stories**: Each dimension holds records of its fallen civilization. Fire's blacksmith, Ice's scholar, Poison's alchemist, Lightning's engineer, Void's previous Architect. Short text dialogues (Canvas, 3 lines) between waves deliver the narrative.
- **Endings**: 5-dimension seal → "Dimensional Stability" normal ending. Hidden boss "Dimension Destroyer" defeat → "Architect's Legacy" true ending — the Void was actually a natural force recycling old dimensions for new creation, and the Architect's role is reconstruction, not destruction.
- **Story Delivery**: Dimensional records between waves (3-line text + background effects), boss entrance/defeat cutscenes (Canvas camera zoom + dialogue, 5s), post-hidden boss epilogue (scrolling text, 10s).

### 1.4 Genre Impact
- **arcade + strategy = 1→2 games** (strengthens minimum-frequency combination)
- arcade total: 9→10, strategy total: 9→10
- Differentiation from existing arcade+strategy (chrono-siege): traditional siege defense vs tetromino spatial puzzle TD — completely different core mechanics

---

## §2. Game Rules & Objectives

### 2.1 Basic Rules
- **Grid-based strategy**: Place tetromino blocks on a 12×8 grid to build towers
- **Wave defense**: Enemies spawn from the left spawn point and advance toward the right-side core (dimensional gate)
- **Core HP**: 10 (Apprentice) / 7 (Architect) / 5 (Dimensioneer). Each enemy reaching core = -1 HP
- **Core HP 0 → Game Over**. Earned permanent currency (Dimension Stones) is preserved
- **Enemy pathing**: Enemies use BFS shortest path around tower blocks — block placement IS path design

### 2.2 Win/Lose Conditions
- **Stage Win**: Clear all waves (3) + boss wave for a dimension
- **Run Win**: Clear all 5 dimensions sequentially (15 normal waves + 5 boss waves = 20 total)
- **Hidden Boss**: Stage 16 "Abyss of Dimensions" unlocks when:
  - Core HP remaining ≥ 50%
  - All 5 element towers built at least once
  - Permanent upgrade "Dimensional Sense" unlocked
- **Lose**: Core HP 0 → Game Over screen → Dimension Stone tally → Title

### 2.3 Dimension Structure

| Dimension | Waves | Theme | Environmental Effect | Boss |
|-----------|-------|-------|---------------------|------|
| 1. Fire | 3+boss | Lava, flame pillars, heat waves | Fire terrain: DoT to enemies crossing | Ignis (Lava Colossus) |
| 2. Ice | 3+boss | Ice sheets, icicles, frost fog | Ice terrain: -30% enemy speed | Glacia (Ice Hydra) |
| 3. Poison | 3+boss | Toxic fog, spores, corrosive swamp | Poison terrain: -3% enemy HP every 2s | Toxia (Venom Wyvern) |
| 4. Lightning | 3+boss | Electric fields, conductors, discharge | Lightning terrain: random enemy struck every 3s | Volta (Thunder Phoenix) |
| 5. Void | 3+boss | Nothingness, distortion, annihilation | Void: tower ATK -20%, enemy cloaking | Nil (Void Sovereign) |
| Hidden. Abyss | Boss only | All dimensions mixed | Random environment shift (10s cycle) | Dimension Destroyer |

### 2.4 Three Difficulty Levels

| Difficulty | Core HP | Enemy HP × | Enemies/Wave | Roguelike Picks | Lock |
|-----------|---------|-----------|-------------|----------------|------|
| Apprentice (Easy) | 10 | ×0.7 | Base | 4 picks (1 Rare guaranteed) | None |
| Architect (Normal) | 7 | ×1.0 | ×1.2 | 3 picks | None |
| Dimensioneer (Hard) | 5 | ×1.4 | ×1.5 | 3 picks (Common only) | Clear Dimension 3+ |

---

## §3. Controls

### 3.1 Keyboard

| Key | Action | Call Path |
|-----|--------|-----------|
| Mouse Move | Block preview position (grid snap) | `handleMouseMove()` → `updatePreview()` |
| Left Click | Confirm block placement | `handleClick()` → `placeBlock()` |
| Right Click / R | Rotate block 90° CW | `handleRotate()` → `rotateBlock()` |
| F | Flip block horizontally | `handleFlip()` → `flipBlock()` |
| 1~5 | Select block slot | `handleSlotSelect(n)` → `selectBlock(n)` |
| Space | Start wave (during placement) | `handleStartWave()` → `beginWave()` |
| ESC | Pause / Menu | `handlePause()` → `togglePause()` |
| Tab | Minimap / dimension progress | `handleTab()` → `toggleMinimap()` |
| Q | Tower info panel toggle | `handleInfo()` → `toggleInfoPanel()` |
| E | Upgrade selected tower | `handleUpgrade()` → `upgradeTower()` |
| D | Dismantle selected tower (50% refund) | `handleDismantle()` → `dismantleTower()` |

### 3.2 Mouse
- **Placement Phase**: Mouse preview on grid → left-click to place, right-click to rotate
- **Combat Phase**: Click tower for info, mouseover for range display
- **Roguelike Selection**: Click one of 3 cards to select

### 3.3 Touch (Mobile)

| Touch Action | Function | Min Size |
|-------------|----------|----------|
| Tap | Place block / Select card / Select tower | Grid cell: `Math.max(48, cellSize)` px |
| Double Tap | Rotate block | — |
| Two-finger Tap | Flip block | — |
| Drag | Move block preview | — |
| Rotate Button (🔄) | Rotate block | 48×48px |
| Flip Button (↔️) | Flip block | 48×48px |
| Start Button (▶) | Start wave | 56×48px |
| Pause (⏸) | Pause | 48×48px |
| Dismantle (🗑) | Dismantle tower | 48×48px |
| Upgrade (⬆) | Upgrade tower | 48×48px |
| Slots 1~5 | Block slot selection | 48×48px each |

> All touch targets use `Math.max(CONFIG.TOUCH_MIN_TARGET, calculatedSize)` to guarantee minimum 48px (F11).

---

## §4. Visual Style Guide

### 4.1 Core Principles
- **Pure Canvas code drawing**: Zero external image files (PNG/SVG) (F1)
- **Zero external resources**: No CDN, Google Fonts, `<link>`, `<script src=>`, `@import url()` (F2)
- **Zero new Image()**: All visuals rendered directly via Canvas 2D API (F50)
- **System font stack**: `'Segoe UI', system-ui, -apple-system, sans-serif` (F49)
- **assets/ directory**: Only manifest.json + thumbnail.svg allowed. Any other SVG/PNG = build failure (F1)

### 4.2 Color Palette

| Usage | Color | HEX |
|-------|-------|-----|
| Background (default) | Deep Navy | `#0a0e1a` |
| Grid Lines | Dark Cyan | `#1a3040` |
| UI Text | Light Gray | `#e0e6ed` |
| Core | Gold Glow | `#ffd700` |
| Fire Element | Crimson+Orange | `#ff4500` ~ `#ff8c00` |
| Ice Element | DeepSkyBlue+Cyan | `#00bfff` ~ `#00ffff` |
| Poison Element | Lime+Emerald | `#32cd32` ~ `#50c878` |
| Lightning Element | Electric Purple+Yellow | `#9b59b6` ~ `#f1c40f` |
| Void Element | Deep Purple+Magenta | `#2d1b4e` ~ `#8b008b` |
| Enemies (base) | Red-Purple | `#c0392b` |
| HP Bar | Green→Yellow→Red | `#2ecc71` ~ `#e74c3c` |
| Selection Highlight | Neon Cyan | `#00ffcc` |

### 4.3 Dimension Background Effects
- **Fire**: Bottom lava flow (sine wave animation), upper flame particles, orange vignette
- **Ice**: Snow particles (downward), background glacier silhouette, blue vignette + frost overlay
- **Poison**: Toxic fog layer (translucent green + sine movement), spore particles (upward float)
- **Lightning**: Periodic lightning flash (full screen), electric arc particles, purple vignette
- **Void**: Screen distortion effect (sine UV distortion simulation), starlight particle absorption, black→purple gradient
- **Weather/Time Cycle**: Background brightness changes progressively through waves (dawn→noon→dusk→night)

### 4.4 Drawing Function Signatures (F9 — Pure Function Pattern)

```
drawTetromino(ctx, gridX, gridY, cellSize, blockType, element, rotation, alpha)
drawTower(ctx, x, y, size, element, level, isActive, glowAlpha)
drawEnemy(ctx, x, y, size, enemyType, hp, maxHp, statusEffects, frame)
drawBoss(ctx, x, y, size, bossId, phase, hp, maxHp, animFrame)
drawProjectile(ctx, x, y, size, element, trail[])
drawGrid(ctx, offsetX, offsetY, cellSize, gridData, highlightCells[])
drawUI(ctx, canvasW, canvasH, state)
drawWaveCard(ctx, x, y, w, h, cardData, isSelected, hoverAlpha)
drawParticle(ctx, x, y, size, color, alpha, type)
drawCutscene(ctx, canvasW, canvasH, sceneId, progress, textLines[])
```

### 4.5 Boss Visuals (Large Canvas Drawings)
- **Ignis**: 400×300px, lava-forged colossus. 3 phases: body cracks increase → lava eruption → core exposed
- **Glacia**: 500×300px, 3-headed ice hydra. Per-head independent HP bar + ice armor cracking effect
- **Toxia**: 400×350px, venomous wyvern. Flight animation (wing flaps) + toxic fog trail
- **Volta**: 450×350px, lightning-feathered phoenix. Electric arc wings + discharge wave effect
- **Nil (Void Sovereign)**: 500×400px, unstable dark entity. Periodic form shifts (sphere↔polyhedron↔shards)
- **Dimension Destroyer (Hidden)**: 600×400px, 5-element hybrid. Boss entrance cutscene: camera zoom + screen shake + elemental explosion sequence (5s)

### 4.6 Camera Effects
- **Boss Entrance**: Zoom in (×1.5, 500ms ease-out) → boss entrance animation (1s) → zoom out (×1.0, 300ms)
- **Dimension Transition**: Fade out (black, 400ms) → background swap → fade in (400ms)
- **Core Hit**: Camera shake (amplitude 5px, decay 300ms)
- **Run Victory**: Zoom out (×0.7, 2s) + gold particle explosion

### 4.7 Interactive Background Elements
- Fire: Lava geysers (periodic eruption → AoE damage to enemies in range)
- Ice: Icicles (when hit by tower fire, they fall → stun enemies 1s)
- Poison: Toxic mushrooms (when destroyed, release toxic fog → 3s AoE slow)
- Lightning: Lightning rods (adjacent to lightning towers = chain range +50%)
- Void: Dimensional rifts (spawn at random positions; enemies passing through warp, shortening their path)

---

## §5. Core Game Loop

### 5.1 Initialization Order (F12 — TDZ Prevention)
```
1. CONFIG constants declaration
2. Global state object (G) declaration
3. Canvas DOM assignment (canvas, ctx)
4. Utility class initialization (TweenManager, ObjectPool, SoundManager)
5. Event listener registration (keyboard, mouse, touch, resize)
6. Game loop start (requestAnimationFrame)
```

### 5.2 Main Game Loop (60fps)
```
function gameLoop(timestamp) {
  const dt = Math.min(timestamp - lastTime, 33.33); // max 2-frame skip
  lastTime = timestamp;

  // 1. Input processing (inputManager.process)
  // 2. TweenManager update (F4: zero setTimeout, F13: clearImmediate)
  // 3. State-specific update — see §6.2 ACTIVE_SYSTEMS matrix
  //    - PLACEMENT: block preview, grid validity check
  //    - WAVE: enemy movement (BFS), tower attack, projectiles, particles
  //    - BOSS: boss AI + enemy movement + tower attack
  //    - ROGUELIKE_SELECT: card hover/selection animation
  // 4. Rendering (background → grid → towers → enemies → boss → projectiles → particles → UI)
  // 5. ObjectPool cleanup (return inactive objects)

  requestAnimationFrame(gameLoop);
}
```

> **Guard Flag Pattern (F5)**: State transition tweens (wave clear, boss defeat, etc.) MUST set `isTransitioning = true` to ensure callbacks fire only once.

> **Single Update Path (F14)**: All animated values (alpha, scale, position) are updated ONLY through TweenManager. Never mix direct assignment with tween for the same value.

### 5.3 Code Region Guide (10 REGIONs)

| REGION | Line Range (est.) | Contents | Future Extraction |
|--------|-------------------|----------|-------------------|
| R1: CONFIG | 1~120 | All game constants, balance values | — |
| R2: UTILS | 121~350 | TweenManager, ObjectPool, SeededRNG, SoundManager | ✅ engine.js |
| R3: INPUT | 351~500 | InputManager (keyboard/mouse/touch unified) | ✅ engine.js |
| R4: GRID | 501~750 | Grid system, tetromino definitions, BFS path calculation | — |
| R5: ENTITIES | 751~1050 | Enemy/Boss/Tower/Projectile classes | — |
| R6: GAME_LOGIC | 1051~1450 | Wave management, combat calculation, roguelike card generation | — |
| R7: PROGRESSION | 1451~1600 | Permanent upgrades, Dimension Stone tally, localStorage | — |
| R8: RENDER | 1601~2100 | All drawing functions (§4.4 signatures) | — |
| R9: UI | 2101~2400 | HUD, menus, modals, cutscenes, i18n text | — |
| R10: INIT | 2401~2600+ | DOM init, event registration, game loop start | — |

---

## §6. State Machine

### 6.1 Game States (STATE_PRIORITY included) — F6

```
STATE = {
  TITLE:            0,   // Called: title screen display
  DIFFICULTY_SELECT: 1,  // Called: difficulty selection UI
  DIMENSION_INTRO:  2,   // Called: dimension entry cutscene (path: startDimension() → beginTransition)
  PLACEMENT:        3,   // Called: tetromino placement phase
  WAVE:             4,   // Called: enemy wave combat (path: handleStartWave() → beginWave)
  BOSS_INTRO:       5,   // Called: boss entrance cutscene (path: waveComplete() on last wave)
  BOSS:             6,   // Called: boss combat (path: bossIntro onComplete)
  WAVE_CLEAR:       7,   // Called: wave clear effect (path: allEnemiesDead trigger)
  ROGUELIKE_SELECT: 8,   // Called: roguelike 3-pick (path: waveClear onComplete)
  BOSS_DEFEAT:      9,   // Called: boss defeat effect (path: boss.hp <= 0)
  DIMENSION_CLEAR: 10,   // Called: dimension clear reward (path: bossDefeat onComplete)
  GAMEOVER:        11,   // Called: core HP 0 (path: coreHit() when coreHP <= 0)
  VICTORY:         12,   // Called: final victory (path: all 5 dimensions cleared)
  HIDDEN_INTRO:    13,   // Called: hidden boss conditions met
  HIDDEN_BOSS:     14,   // Called: hidden boss combat
  TRUE_ENDING:     15,   // Called: after hidden boss defeat — true ending
  PAUSE:           16,   // Called: ESC input (previous state saved)
  CONFIRM_MODAL:   17,   // Called: "Return to title?" confirmation
}

// STATE_PRIORITY: higher = takes precedence. GAMEOVER > BOSS_DEFEAT > WAVE_CLEAR
// Call path: inside beginTransition(targetState), the check
//   if (STATE_PRIORITY[targetState] < STATE_PRIORITY[G.state]) return;
// rejects lower-priority transitions. (F56: dead code prevention)
STATE_PRIORITY = {
  GAMEOVER: 100, VICTORY: 95, TRUE_ENDING: 99,
  BOSS_DEFEAT: 80, WAVE_CLEAR: 60,
  BOSS_INTRO: 50, DIMENSION_INTRO: 40,
  default: 0
}
```

> **F56 Applied**: All STATE_PRIORITY values are referenced by `beginTransition()`. This function is located in R6: GAME_LOGIC and is the ONLY path for state transitions.

### 6.2 State × System ACTIVE_SYSTEMS Matrix (F7)

| State | Tween | Input | Grid | Enemy | Tower | Boss | Projectile | Particle | UI | Sound | Camera | BFS |
|-------|-------|-------|------|-------|-------|------|-----------|----------|-----|-------|--------|-----|
| TITLE | ✅ | menu | — | — | — | — | — | bg | ✅ | bgm | — | — |
| DIFFICULTY_SELECT | ✅ | menu | — | — | — | — | — | bg | ✅ | — | — | — |
| DIMENSION_INTRO | ✅ | skip | — | — | — | — | — | ✅ | ✅ | bgm | zoom | — |
| PLACEMENT | ✅ | game | ✅ | — | info | — | — | bg | ✅ | sfx | — | preview |
| WAVE | ✅ | limited | — | ✅ | ✅ | — | ✅ | ✅ | ✅ | sfx | shake | path |
| BOSS_INTRO | ✅ | skip | — | — | — | anim | — | ✅ | ✅ | boss | zoom | — |
| BOSS | ✅ | limited | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | boss | shake | path |
| WAVE_CLEAR | ✅ | — | — | — | idle | — | — | ✅ | ✅ | sfx | — | — |
| ROGUELIKE_SELECT | ✅ | card | — | — | idle | — | — | bg | ✅ | sfx | — | — |
| BOSS_DEFEAT | ✅ | — | — | — | idle | death | — | ✅ | ✅ | boss | zoom | — |
| DIMENSION_CLEAR | ✅ | — | — | — | — | — | — | ✅ | ✅ | sfx | — | — |
| GAMEOVER | ✅ | menu | — | — | — | — | — | — | ✅ | sfx | — | — |
| VICTORY | ✅ | menu | — | — | — | — | — | ✅ | ✅ | bgm | zoom | — |
| HIDDEN_INTRO | ✅ | skip | — | — | — | anim | — | ✅ | ✅ | boss | zoom | — |
| HIDDEN_BOSS | ✅ | limited | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | boss | shake | path |
| TRUE_ENDING | ✅ | menu | — | — | — | — | — | ✅ | ✅ | bgm | pan | — |
| PAUSE | ✅ | pause | — | — | — | — | — | — | ✅ | — | — | — |
| CONFIRM_MODAL | ✅ | modal | — | — | — | — | — | — | ✅ | — | — | — |

> **CONFIRM_MODAL Tween ✅**: Cycle 2 B1 lesson. Tween update is required for modal alpha animation.

### 6.3 RESTART_ALLOWED Whitelist

```javascript
const RESTART_ALLOWED = {
  [STATE.GAMEOVER]: [STATE.TITLE, STATE.DIFFICULTY_SELECT],
  [STATE.VICTORY]: [STATE.TITLE],
  [STATE.TRUE_ENDING]: [STATE.TITLE],
  [STATE.PAUSE]: [STATE.TITLE], // via CONFIRM_MODAL
  [STATE.TITLE]: [STATE.DIFFICULTY_SELECT],
};
// Call path: validated inside beginTransition(target)
// if (!RESTART_ALLOWED[G.state]?.includes(target)) return;
```

### 6.4 Canvas Modal (F3)
- `confirm()`/`alert()` forbidden — iframe compatibility
- "Return to title?" → Canvas-based modal (translucent overlay + "Yes/No" buttons)
- Modal buttons also guarantee 48px+ touch targets

---

## §7. Core Mechanics Detail

### 7.1 Tetromino System

7 basic block types (each block = 4-cell tower):

```
I: ████      O: ██     T:  █      S:  ██     Z: ██
                ██        ██         ██          ██

L: █         J:   █
   █            █
   ██           ██
```

- **Rotation**: 0°/90°/180°/270° (simplified SRS rotation system)
- **Flip**: Horizontal mirror (S↔Z, L↔J transformation effect)
- **Element**: Each block has an element (Fire/Ice/Poison/Lightning/Void) — determines tower attack attribute
- **Synergy**: When 2+ adjacent same-element blocks connect:
  - 2-link: Attack range +20%
  - 3-link: AoE attack unlocked (splash)
  - 4-link: Elemental explosion (10s cooldown, screen-wide elemental effect)

### 7.2 Tower Attack System

| Element | Base DPS | Range | Special Effect | Boss Advantage |
|---------|---------|-------|---------------|----------------|
| Fire | 12 | 3 cells | DoT (30% extra over 3s) | Glacia ×1.5 |
| Ice | 8 | 3.5 cells | Slow 40% (2s) | Toxia ×1.5 |
| Poison | 10 | 2.5 cells | Ignores defense + stacking DoT | Volta ×1.5 |
| Lightning | 15 | 4 cells | Chain lightning (3 adjacent enemies) | Nil ×1.5 |
| Void | 6 | 2 cells | Enemy speed -70% + dimensional portal spawn | Ignis ×1.5 |

> Elemental cycle: Fire→Ice→Poison→Lightning→Void→Fire (F10: spec values = CONFIG constants)

### 7.3 Enemy Types

| Type | HP × | Speed | Trait |
|------|------|-------|-------|
| Grunt | ×1.0 | 1.0 | None |
| Rusher | ×0.6 | 1.8 | Fast, low HP |
| Tank | ×2.5 | 0.6 | High HP, slow |
| Flyer | ×0.8 | 1.2 | Ignores tower blocks (air path) |
| Splitter | ×1.5 | 0.8 | Splits into 2 small on death |
| Stealth | ×0.7 | 1.0 | Semi-transparent, only targetable within 3 cells |
| Healer | ×1.0 | 0.7 | Heals nearby allies (5% HP/s) |
| Void | ×1.8 | 0.9 | Tower ATK -30% aura |

### 7.4 Roguelike Card Picks (Between Waves)

Pick 1 of 3 cards:

| Rarity | Chance | Examples |
|--------|--------|----------|
| Common (white) | 60% | New tetromino block, tower DPS +10%, range +0.5 cells |
| Rare (blue) | 30% | Element swap, synergy range +50%, core HP +1 |
| Epic (purple) | 10% | Dimensional ability (slow all 5s), mega block (5-cell), gold tower (all-element) |

### 7.5 BFS Path System (F54 — SeededRNG + Reachability Validation)
```
1. On block placement: add block to temp grid
2. Run BFS(spawnPoint → corePoint)
3. Path exists → confirm placement, recalculate enemy paths
4. No path → reject placement (red preview + warning sound)
5. Flyer enemies use straight-line A* instead of BFS
```

> All block placements must pass BFS path validation. "Path blocking" is fundamentally impossible.

---

## §8. Difficulty System / Balance

### 8.1 Per-Wave Balance Table (3 Tiers)

**Base difficulty (Architect) values**

| Tier | Waves | Enemy Count | Enemy HP | Enemy Speed | Boss HP | Reward (Stones) |
|------|-------|-------------|----------|-------------|---------|----------------|
| Early (Fire+Ice) | W1~W6 | 8→14 | 30→55 | 0.8→1.0 | 200/250 | 5~10 |
| Mid (Poison+Lightning) | W7~W12 | 14→22 | 55→90 | 1.0→1.2 | 350/450 | 10~18 |
| Late (Void+Hidden) | W13~W16 | 22→30 | 90→150 | 1.1→1.3 | 600/1000 | 18~30 |

### 8.2 DPS/EHP Balance Formula (F57)

```
Total Tower DPS = Σ(per tower DPS × element advantage × synergy bonus) × difficulty modifier
Total Enemy EHP = enemy HP × count × (1 + Healer modifier) × difficulty HP multiplier
Expected Clear Time = Total Enemy EHP / Total Tower DPS

Target: Expected Clear Time < Wave Duration (path length / avg enemy speed)
Safety Margin: 1.3× (if Tower DPS ≥ 1.3× required DPS, wave is clearable)

Assumptions:
- Player fills ≥ 60% of grid with towers
- Average 2 synergy 2-links (DPS +20% × 2)
- Path length: 1.5× BFS shortest path (player creates detours)

Assumption Failure Fallback (DDA):
- Core HP decreased 3 consecutive waves → next wave enemy HP -15%
- Core HP undamaged 3 consecutive waves → next wave enemy count +20%
```

### 8.3 Difficulty Modifier Matrix

| Parameter | Apprentice | Architect | Dimensioneer |
|-----------|-----------|-----------|-------------|
| Core HP | 10 | 7 | 5 |
| Enemy HP × | ×0.7 | ×1.0 | ×1.4 |
| Enemy Count × | ×1.0 | ×1.2 | ×1.5 |
| Boss HP × | ×0.8 | ×1.0 | ×1.3 |
| Roguelike Picks | 4 | 3 | 3 |
| Rare Guaranteed | 1 per pick | No | No |
| DDA Active | ✅ | ✅ | ❌ |
| Environment Intensity | ×0.5 | ×1.0 | ×1.5 |

---

## §9. Boss System

### 9.1 Common Boss Mechanics
- Bosses don't follow paths — fixed position at top of map, attack in patterns
- Boss weakness: **vulnerability exposed only when specific element towers placed at specific locations** (spatial puzzle)
- During vulnerability window: 3s of ×3 damage taken
- Boss phase transition: invulnerable at HP threshold + pattern change

### 9.2 Boss Phase Diagrams

**Ignis (Fire Dimension Boss)**
```
[Phase 1: HP 100%~60%]           [Phase 2: HP 60%~30%]           [Phase 3: HP 30%~0%]
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│ Lava Toss (3s CD)    │──60%HP──▶│ Flame Pillar (4 cols)│──30%HP──▶│ Full Screen Eruption │
│ Weak: BL Ice tower   │          │ Weak: Center Ice 3-lk│          │ Weak: 4-side Ice wrap │
└─────────────────────┘          └─────────────────────┘          └─────────────────────┘
```

**Glacia (Ice Dimension Boss)**
```
[Phase 1: HP 100%~50%]           [Phase 2: HP 50%~20%]           [Phase 3: HP 20%~0%]
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│ Ice Breath (cone)    │──50%HP──▶│ Triple Head Attack   │──20%HP──▶│ Absolute Zero (freeze)│
│ Weak: Right Fire twr │          │ Weak: Per-head elem  │          │ Weak: Fire 4-lk burst │
│ Only 1 head active   │          │ All 3 heads active   │          │ 1 head left (enraged) │
└─────────────────────┘          └─────────────────────┘          └─────────────────────┘
```

**Toxia (Poison Dimension Boss)**
```
[Phase 1: HP 100%~55%]           [Phase 2: HP 55%~25%]           [Phase 3: HP 25%~0%]
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│ Poison Breath+Spores │──55%HP──▶│ Dive Charge(twr dest)│──25%HP──▶│ Toxic Storm (full AoE)│
│ Weak: Rear Lightning │          │ Weak: Lightning 3-ch │          │ Weak: Lightning 4-lk  │
└─────────────────────┘          └─────────────────────┘          └─────────────────────┘
```

**Volta (Lightning Dimension Boss)**
```
[Phase 1: HP 100%~50%]           [Phase 2: HP 50%~20%]           [Phase 3: HP 20%~0%]
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│ EMP Field(twr disable)│──50%HP──▶│ Thunder Barrage (3pt)│──20%HP──▶│ Thunder Fusion (chain)│
│ Weak: Void slow range│          │ Weak: Void 3-link    │          │ Weak: Void+Poison mix │
└─────────────────────┘          └─────────────────────┘          └─────────────────────┘
```

**Nil (Void Dimension Boss)**
```
[Phase 1: HP 100%~40%]           [Phase 2: HP 40%~15%]           [Phase 3: HP 15%~0%]
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│ Dimensional Warp(path)│──40%HP──▶│ Void Absorb(twr off) │──15%HP──▶│ Annihilation Wave    │
│ Weak: Fire+center    │          │ Weak: All 5 elements │          │ Weak: 5-elem sim burst│
└─────────────────────┘          └─────────────────────┘          └─────────────────────┘
```

**Dimension Destroyer (Hidden Boss)**
```
[Phase 1: 100%~60%]    [Phase 2: 60%~30%]    [Phase 3: 30%~10%]    [Phase 4: 10%~0%]
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Element Cycle     │─▶│ Dual Element      │─▶│ Random All-Elem   │─▶│ "Annihilation"    │
│ Weak: counter-elem│   │ Weak: both counters│   │ Weak: 3-elem sync │   │ Weak: 5-elem sim  │
│ (10s rotation)    │   │ (5s rotation)      │   │ (3s rotation)     │   │ 20s time limit    │
└──────────────────┘   └──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## §10. Procedural Systems

### 10.1 SeededRNG Map Generation
- Seed generated per run (difficulty + timestamp based)
- Fixed elements on 12×8 grid: spawn point (center-left), core (center-right)
- Random elements: environmental objects (3~5), initial obstacle blocks (2~3), interactive element positions
- Boss weakness positions are also seed-based — only valid in reachable positions

### 10.2 BFS Reachability Validation (F54)
```
1. After map generation: run BFS(spawn → core)
2. No path → remove 1 obstacle, revalidate (max 3 retries)
3. Still no path after 3 retries → regenerate with new seed
4. Boss weakness positions: verify player can place blocks at adjacent cells
   - Weakness position must have ≥ 2 adjacent empty cells (space for block placement)
5. Flyer enemy path: separate straight-line A* validation (ignores obstacles, respects map bounds)
```

### 10.3 Roguelike Card Generation
- 3 cards randomly drawn from card pool per wave (rarity rates per §7.4)
- Dedup: exclude cards identical to previous wave's selection
- Balance correction: if towers are 70%+ single element, other element cards get ×2 weight

---

## §11. Score System

### 11.1 Score Calculation (F8 — Judge First, Save Later)

```
Run Score = (Kill Score + Boss Score + Core HP Bonus + Speed Bonus) × Difficulty Multiplier

Kill scores: Grunt 10, Rusher 8, Tank 20, Flyer 15, Splitter 25, Stealth 12, Healer 18, Void 30
Boss scores: Ignis 500, Glacia 600, Toxia 700, Volta 800, Nil 1000, Dimension Destroyer 2000
Core HP Bonus: remaining HP × 50
Speed Bonus: total playtime < 15min = ×1.2, < 10min = ×1.5
Difficulty Multiplier: Apprentice ×0.7, Architect ×1.0, Dimensioneer ×1.5
```

> **Evaluation order**: Calculate score → compare with best → save to localStorage (F8)

### 11.2 Dimension Stones (Permanent Currency)
- Wave clear: 5~30 (per §8.1)
- Boss defeat: 50~200
- Tallied at run end → permanently preserved
- Spent on upgrade tree

---

## §12. Permanent Progression System

### 12.1 Three-Branch Upgrade Tree

**Attack Tree (Red)**
| Level | Name | Effect | Cost |
|-------|------|--------|------|
| 1 | Reinforced Turret | All tower DPS +5% | 30 |
| 2 | Elemental Essence | Element advantage 1.5→1.7 | 60 |
| 3 | Chain Reaction | Chain lightning +1 target | 100 |
| 4 | Synergy Amplifier | Synergy bonus ×1.5 | 150 |
| 5 | Dimensional Barrage | -10% all enemy HP every 20s (active) | 250 |

**Defense Tree (Blue)**
| Level | Name | Effect | Cost |
|-------|------|--------|------|
| 1 | Reinforced Core | Core HP +1 | 30 |
| 2 | Regen Barrier | Core HP +1 every 3 waves (up to max) | 60 |
| 3 | Reflective Armor | Enemies reaching core take 50 reverse damage | 100 |
| 4 | Dimensional Shield | Boss attack damage -30% | 150 |
| 5 | Immortal Core | Revive once when core HP reaches 0 (HP 3) | 250 |

**Utility Tree (Green)**
| Level | Name | Effect | Cost |
|-------|------|--------|------|
| 1 | Block Stockpile | Initial block slots 3→4 | 30 |
| 2 | Element Fusion | 1 free element swap per wave | 60 |
| 3 | Dimensional Sense | Boss weakness position hints shown | 100 |
| 4 | Tetro Master | Large block (5-cell) appearance +15% | 150 |
| 5 | Architect's Eye | Preview next wave enemy composition | 250 |

### 12.2 Challenge Modes (Permanent Unlocks)
- **Single Element**: Use only 1 element (5 variants)
- **Minimalist**: Clear with ≤ 10 blocks
- **Speedrun**: Clear in under 10 minutes
- Each challenge completion rewards special title + bonus Dimension Stones

### 12.3 localStorage Data Schema

```javascript
const SAVE_SCHEMA = {
  version: 1,                    // Schema version (for migration)
  bestScore: 0,                  // Best score
  totalRuns: 0,                  // Total run count
  dimensionStones: 0,            // Dimension Stone balance
  upgrades: {                    // Upgrade tree levels
    attack: 0, defense: 0, utility: 0
  },
  dimensionsCleared: [false, false, false, false, false],
  hiddenUnlocked: false,         // Hidden boss unlocked
  challenges: {},                // Challenge mode records
  settings: {
    difficulty: 'normal',
    language: 'en',
    sfxVolume: 0.7,
    bgmVolume: 0.5
  }
};
// Save key: 'voidArchitect_v1'
```

---

## §13. Sound System

### 13.1 Web Audio API (BGM + SFX)

| ID | Type | Trigger | Description |
|----|------|---------|-------------|
| bgm_title | BGM | TITLE state | Mysterious + grand main theme (loop) |
| bgm_build | BGM | PLACEMENT | Calm strategic ambience (loop) |
| bgm_wave | BGM | WAVE | Urgent combat music (loop) |
| bgm_boss | BGM | BOSS/BOSS_INTRO | Boss theme (loop) |
| sfx_place | SFX | Block placement | "Clack" |
| sfx_rotate | SFX | Block rotation | "Click" |
| sfx_attack | SFX | Tower attack | Per-element differentiated |
| sfx_enemy_die | SFX | Enemy killed | Explosion |
| sfx_boss_hit | SFX | Boss weakness hit | Heavy impact |
| sfx_core_hit | SFX | Core hit | Warning alarm |
| sfx_select | SFX | Roguelike card pick | "Ding" |
| sfx_upgrade | SFX | Permanent upgrade bought | Ascending chime |
| sfx_victory | SFX | Run cleared | Fanfare |
| sfx_gameover | SFX | Game over | Descending tone |

> Total 14 sounds (4 BGM + 10 SFX). All procedurally generated via Web Audio API OscillatorNode + GainNode.

---

## §14. Auto-Validation & Smoke Tests

### 14.1 Numeric Consistency Table (F10 — Spec = CONFIG 1:1)

| Spec Location | Parameter | Spec Value | CONFIG Key |
|--------------|-----------|-----------|------------|
| §2.1 | Grid size | 12×8 | `GRID_COLS=12, GRID_ROWS=8` |
| §2.4 | Core HP (Architect) | 7 | `CORE_HP_NORMAL=7` |
| §7.2 | Fire DPS | 12 | `TOWER_DPS.fire=12` |
| §7.2 | Ice range | 3.5 cells | `TOWER_RANGE.ice=3.5` |
| §7.4 | Rare chance | 30% | `CARD_RARE_CHANCE=0.3` |
| §8.1 | W1 enemy count | 8 | `WAVE_ENEMY_COUNT[0]=8` |
| §9.2 | Ignis P2 threshold | 60% | `BOSS_PHASE.ignis[1]=0.6` |
| §11.1 | Speed bonus 15min | ×1.2 | `SPEED_BONUS_15M=1.2` |
| §12.1 | Attack Lv1 cost | 30 | `UPGRADE_COST.attack[0]=30` |

### 14.2 Auto-Validation Script (F59 — FAIL/WARN 2-Tier)

**FAIL (mandatory — violations block review submission):**
1. `assets/` directory contains files other than manifest.json, thumbnail.svg
2. `setTimeout` / `setInterval` usage (must be 0)
3. `alert(` / `confirm(` / `prompt(` usage
4. `new Image(` / `ASSET_MAP` / `SPRITES` / `preloadAssets` patterns
5. `<link` / `<script src=` / `@import url` / `googleapis` patterns
6. Block placement code without BFS path validation

**WARN (advisory — warnings shown, review submission allowed):**
7. `"Google Fonts"` / `"CDN"` / `"external"` comment remnants
8. Declared but unreferenced constants/variables (dead code F56)
9. Functions with direct global variable references (pure function violation F9)
10. Touch targets with hardcoded values < 48px

### 14.3 Smoke Test Gate (F15, F55 — 13 Items)

Must pass before first review submission:

| # | Test | Result |
|---|------|--------|
| 1 | index.html standalone shows title screen | PASS/FAIL |
| 2 | Difficulty select → PLACEMENT state entry | PASS/FAIL |
| 3 | Tetromino block placement + rotation + flip works | PASS/FAIL |
| 4 | Space key starts wave → enemies spawn + move | PASS/FAIL |
| 5 | Towers attack enemies, enemy HP decreases | PASS/FAIL |
| 6 | Core HP 0 → GAMEOVER screen → TITLE return | PASS/FAIL |
| 7 | GAMEOVER→TITLE transition in RESTART_ALLOWED | PASS/FAIL |
| 8 | Mobile touch: block placement + rotate button + wave start | PASS/FAIL |
| 9 | All touch targets ≥ 48px (DevTools verification) | PASS/FAIL |
| 10 | Console errors/warnings = 0 | PASS/FAIL |
| 11 | Zero illegal files in assets/ directory | PASS/FAIL |
| 12 | Zero external resource requests (Network tab) | PASS/FAIL |
| 13 | Boss fight entry + weakness exposure + phase transition works | PASS/FAIL |

---

## §15. Sidebar / Card Metadata

### 15.1 Game Page Sidebar

```yaml
game:
  title: "Void Architect"
  description: "Defend against Void creatures from dimensional rifts by placing tetromino defense blocks! A strategic tower defense with roguelike choices and elemental synergies where every run plays differently."
  genre: ["arcade", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "▸ Mouse: Place blocks / Select towers"
    - "▸ Right-click/R: Rotate block"
    - "▸ F: Flip block"
    - "▸ 1~5: Block slot selection"
    - "▸ Space: Start wave"
    - "▸ E: Upgrade tower"
    - "▸ D: Dismantle tower"
    - "▸ ESC: Pause"
    - "▸ Touch: Tap to place / Double-tap to rotate"
  tags:
    - "#TowerDefense"
    - "#Tetromino"
    - "#Roguelike"
    - "#Strategy"
    - "#Dimensional"
    - "#BossFight"
    - "#Procedural"
  addedAt: "March 23, 2026"
  version: "1.0.0"
```

### 15.2 Home Page GameCard

```yaml
thumbnail: "Cinematic composition — 12×8 grid with 5-element tetromino towers glowing, enemies pouring from a void rift. Ignis boss silhouette in foreground. 20KB+ SVG."
title: "Void Architect"
description: "Build towers with tetromino blocks and defend against Void invasions across 5 dimensions in this roguelike tower defense!"
genre: ["arcade", "strategy"]
playCount: 0
featured: true
addedAt: "2026-03-23"
```

---

## §16. Internationalization

### 16.1 Text Key Structure

```javascript
const LANG = {
  ko: {
    title: '보이드 아키텍트',
    subtitle: '차원의 마지막 건축가',
    start: '시작',
    difficulty: { easy: '견습생', normal: '건축가', hard: '차원장인' },
    dimension: { fire: '화염 차원', ice: '빙결 차원', poison: '독 차원',
                 lightning: '번개 차원', void: '보이드 차원', hidden: '차원의 심연' },
    // ... (see Korean spec §16 for full list)
  },
  en: {
    title: 'Void Architect',
    subtitle: 'The Last Architect of Dimensions',
    start: 'Start',
    difficulty: { easy: 'Apprentice', normal: 'Architect', hard: 'Dimensioneer' },
    dimension: { fire: 'Fire Dimension', ice: 'Ice Dimension', poison: 'Poison Dimension',
                 lightning: 'Lightning Dimension', void: 'Void Dimension', hidden: 'Abyss of Dimensions' },
    wave: 'Wave', boss: 'Boss', coreHP: 'Core HP', score: 'Score', stones: 'Dim. Stones',
    place: 'Place', rotate: 'Rotate', flip: 'Flip', startWave: 'Start Wave',
    upgrade: 'Upgrade', dismantle: 'Dismantle', pause: 'Paused', resume: 'Resume',
    toTitle: 'To Title', gameover: 'Game Over', victory: 'Dimensions Sealed!',
    trueEnding: 'Architect\'s Legacy', confirm: 'Return to title?',
    yes: 'Yes', no: 'No', bestScore: 'Best Score', totalRuns: 'Total Runs',
    settings: 'Settings', sfxVol: 'SFX', bgmVol: 'BGM', language: 'Language',
  }
};
```

---

## §17. Previous Cycle Pain Points Resolution

| Cycle 25 Pain Point | Resolution Section | Resolution Method | Verification Criteria |
|---------------------|-------------------|-------------------|----------------------|
| 3-round review | §14.3 | 13-item smoke test gate. 11 mobile touch buttons pre-defined | APPROVED within 2 rounds |
| STATE_PRIORITY dead code | §6.1 | "Call path" comment on all STATE constants. beginTransition() references PRIORITY | Zero unreferenced constants in review |
| Balance validation insufficient | §8.2 | DPS/EHP formula + explicit assumptions + DDA fallback. 3-tier balance table | All waves meet "1.3× safety margin" |
| Shared engine not extracted | §5.3 | 10 REGIONs structuring. R2 (UTILS) isolated for future engine.js extraction | Clear REGION boundaries, minimal cross-refs |
| Validation script burden | §14.2 | FAIL/WARN 2-tier split. Only 6 FAIL items mandatory, 4 WARN advisory | 100% FAIL items pass |

---

## §18. Volume Target Verification

| Item | Target | Notes |
|------|--------|-------|
| Code lines | 2,600+ | 10 REGIONs (§5.3) |
| Canvas asset drawings | 22+ | 7 tetrominos, 8 enemies, 6 bosses, 5 environments, UI |
| Sounds | 14 | 4 BGM + 10 SFX (§13.1) |
| Languages | Korean/English | §16 LANG object |
| Thumbnail SVG | 20KB+ | Cinematic composition (§15.2) |
| Game states | 18 | §6.1 STATE enum |
| Bosses | 6 | 5 dimensions + hidden (§9.2) |
| Waves | 15+1 (hidden) | 5 dimensions × 3 waves + boss (§2.3) |
| Permanent upgrades | 15 | 3 trees × 5 levels (§12.1) |
| Roguelike card types | 15+ | 3 rarities × 5+ types (§7.4) |
