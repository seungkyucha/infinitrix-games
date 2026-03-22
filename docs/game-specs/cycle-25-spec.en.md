---
game-id: glyph-labyrinth
title: Glyph Labyrinth
genre: arcade, puzzle
difficulty: medium
---

# Glyph Labyrinth — Cycle #25 Game Design Document

> **One-Page Summary**: A puzzle metroidvania where players explore interconnected ancient ruins, collecting and combining glyphs (magic sigils) to unlock new abilities, solving environmental puzzles and defeating bosses. 5 biomes (Flame Sanctum, Frozen Cavern, Ancient Grove, Abyssal Ruins, Celestial Tower) × 4 rooms + 5 boss rooms + hidden biome "Rift of Time" = 26 total rooms. Glyph upgrade tree, secret combination paths, and SeededRNG procedural room layouts ensure every playthrough is unique. **Strengthens the arcade+puzzle combo from 1→2 games**.

> **MVP Boundary**: Phase 1 (core loop: explore→puzzle→ability unlock→boss fight, Biomes 1~2 + 2 bosses) + Phase 2 (Biomes 3~5 + 3 bosses + hidden biome + full narrative). Phase 1 alone must deliver a complete game experience.

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (see platform-wisdom) ✅
> Items below have been verified across 18+ cycles and are documented in platform-wisdom.md. Only the **applied section** is noted here.

| ID | Lesson Summary | Applied Section |
|----|---------------|-----------------|
| F1 | Never create assets/ directory — 8 cycles consecutive success [Cycle 1~17] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm()/alert() in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] — 13 cycles consecutive | §5.2 |
| F5 | Guard flag ensures tween callback fires once [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system [Cycle 3 B2] | §6.1 |
| F7 | State×System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numeric consistency table (spec=code 1:1) [Cycle 7] | §13.1 |
| F11 | Touch target min 48×48px + Math.max enforcement [Cycle 22] | §3.3 |
| F12 | TDZ prevention: declare → DOM assign → event register [Cycle 5] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path per value (tween vs direct) [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22] | §13.3 |

### New Feedback (Based on Cycle 24 Post-Mortem) 🆕

| ID | Lesson | Solution | Applied Section |
|----|--------|----------|-----------------|
| F49 | Google Fonts `<link>` tag residual — found at 2nd review (Cycle 24 B5) | System fonts only. Auto-validate: grep for `<link>`, `<script src=`, `@import url`. Only system font stack allowed | §4.1, §13.2 |
| F50 | ASSET_MAP/SPRITES/preloadAssets code residual — "never create" principle not fully internalized (Cycle 24 B3) | Block asset-related patterns from scaffolding stage. Validate: grep for ASSET_MAP, SPRITES, preloadAssets, new Image | §4.1, §13.2 |
| F51 | Balance auto-verification missing — impossible to verify multi-combination balance by review alone (Cycle 24) | Per-biome difficulty curve numerics in §8.1. Boss HP/ATK/patterns as CONFIG constants 1:1. Clearability formula in §8.2 | §8.1, §8.2 |
| F52 | 2nd review 2 rounds needed (3 total) — initial submission had unresolved P0/P2 (Cycle 24) | Smoke test gate expanded to 12 items. RESTART_ALLOWED + touch 48px + zero external resources + zero asset code as required gates | §13.3 |
| F53 | Comment residual ("Google Fonts with fallback" etc.) — related comments not cleaned after code deletion (Cycle 24 B5) | Delete related comments when removing code. Add "Google Fonts", "CDN", "external" to comment grep validation | §13.2 |
| F54 | Procedural map reachability risk (Cycle 23 lesson) | BFS reachability validation required for SeededRNG room placement. Algorithm specified in §10.2 | §10.2 |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
Glyph Labyrinth is a puzzle metroidvania set in the forgotten ruins of an ancient civilization. Players explore five temples left by the "Arcana" civilization, collecting glyphs and combining them to unlock new abilities, opening previously inaccessible paths. Boss fights combine environmental puzzles with combat, and the hidden biome "Rift of Time" — unlocked through secret glyph combinations — demands mastery of all abilities for the ultimate challenge.

### 1.2 Three Pillars of Fun
1. **Exploration & Discovery**: Traverse 26 interconnected rooms, discovering secret paths in previously visited areas with newly acquired abilities. The signature metroidvania "aha!" moment of backtracking exploration.
2. **Glyph Combination Puzzles**: 5 base glyphs + 15 combination glyphs = 20 total abilities. Same puzzles can be solved with different glyph combinations, enabling multiple solution paths. "What if I use this combination to reach that area?"
3. **Environmental Puzzle Boss Fights**: Each boss requires creative use of biome environment and glyph abilities to expose weaknesses — not just pure combat. Observe pattern → use environment → strike.

### 1.3 Story/Narrative
- **Setting**: The ancient "Arcana" civilization inscribed knowledge and power into glyphs to build their world, but overuse of the forbidden "Chronos" glyph warped time and led to their downfall. The glyphs remaining in the ruins hold Arcana's memories and warnings.
- **Objective**: Overcome the guardians (bosses) of 5 temples, collect core glyphs, and seal the Chronos runaway.
- **Story Delivery**: "Arcana Records" etched on room walls (Canvas text effects) provide fragmented narrative. Short memory flashbacks (screen filter + 3-line text) upon glyph combinations. Post-boss cutscenes (Canvas, 3~5 seconds).
- **Endings**: Normal — escape the labyrinth after sealing. Hidden — "Truth of Arcana": the Chronos glyph was actually the civilization's last hope to reverse time and correct their mistakes.

### 1.4 Genre Strengthening
- **arcade + puzzle = 1→2 games** (strengthening one of 6 minimal combos)
- puzzle overall: 7→8 games
- Differentiated from existing arcade+puzzle (neon-hex-drop): falling puzzle vs metroidvania exploration — entirely different experiences

---

## §2. Game Rules & Objectives

### 2.1 Basic Rules
- Top-down 2D labyrinth exploration. One screen = one room
- Room transitions: tween-based slide (300ms)
- HP decreases on contact with enemies or environmental traps
- HP 0 → Game Over (collected glyphs & unlocked abilities permanently preserved)
- Defeating each biome's boss yields a core glyph + unlocks next biome

### 2.2 Win/Lose Conditions
- **Win**: Collect 5 core glyphs → Complete final sealing puzzle
- **Lose**: HP 0 → Resume from last save point (glyphs/abilities retained, current room reset)
- **Hidden Ending**: Collect all 20 glyphs + find all Arcana Records → Unlock "Rift of Time"

### 2.3 Biome Structure
| Biome | Rooms | Theme | Core Puzzle Element | Boss |
|-------|-------|-------|-------------------|------|
| 1. Flame Sanctum | 4+boss | Lava, fire pillars, heat waves | Flame path timing, lava flow redirection | Ignis (Lava Golem) |
| 2. Frozen Cavern | 4+boss | Ice floor, icicles, cold mist | Sliding physics puzzle, ice reflection | Glacia (Frost Serpent) |
| 3. Ancient Grove | 4+boss | Vines, spores, bioluminescence | Growth/shrink puzzle, vine path activation | Silvanus (Ancient Treant) |
| 4. Abyssal Ruins | 4+boss | Zero-gravity, darkness, echo | Gravity inversion puzzle, sound-based search | Nyx (Shadow Entity) |
| 5. Celestial Tower | 4+boss | Floating stones, lightning, time warp | Time freeze puzzle, platform timing | Chronos (Time Guardian) |
| Hidden. Rift of Time | 1 | All biomes mixed | All-ability comprehensive puzzle | — (puzzle only) |

### 2.4 Three Difficulty Levels
| Difficulty | Player HP | Enemy Scaling | Puzzle Hints | Save Frequency | Lock Condition |
|-----------|----------|--------------|-------------|---------------|---------------|
| Explorer (Easy) | ×1.5 | ×0.6 | Hint glyphs shown | Auto per room | None |
| Adventurer (Normal) | ×1.0 | ×1.0 | None | Biome entrance only | None |
| Legend (Hard) | ×0.7 | ×1.4 | None | Biome entrance only | Clear Biome 3+ |

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| WASD / Arrow Keys | 8-directional movement |
| Space | Activate glyph ability (current selection) |
| E | Interact (read records, save points, open doors) |
| Q | Toggle glyph menu (ability select/combine) |
| 1~5 | Quick-switch glyph slots |
| Shift | Dash (short-range burst, includes i-frames) |
| ESC | Pause / Minimap |
| Tab | Toggle minimap |

### 3.2 Mouse
| Action | Function |
|--------|----------|
| Left click | Aim glyph ability direction + activate |
| Right click | Aim dash direction + execute |
| Wheel | Cycle glyph slots |
| Move | Aim direction (indicator around character) |

### 3.3 Touch (Mobile)
| Action | Function |
|--------|----------|
| Left virtual joystick (radius 60px) | Movement |
| Right area tap | Activate glyph (tap position = direction) |
| Right area swipe | Dash (swipe direction) |
| Top glyph slot buttons (56×56px each, ≥48px) | Switch glyphs |
| Top-right menu button (56×56px) | Pause / Minimap |
| Top-left interact button (56×56px) | E key substitute |

> **Touch Target Rule (F11)**: All touch button hit areas use `Math.max(visualSize, 48)`. Even if visually smaller, touch area must be minimum 48×48px.

---

## §4. Visual Style Guide

### 4.1 Asset Principles
- **Pure Canvas code drawing only** — zero external SVG/PNG/image file loads (F1)
- **Zero external resources** — no CDN, Google Fonts, external scripts (F2, F49)
- **assets/ directory**: Only manifest.json + thumbnail.svg allowed. Target 9 cycles consecutive clean
- **Banned code patterns**: `ASSET_MAP`, `SPRITES`, `preloadAssets`, `new Image()`, `<link>`, `<script src=`, `@import url` (F50)
- **Fonts**: `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif` system font stack only

### 4.2 Color Palette

#### Common
| Purpose | Color | HEX |
|---------|-------|-----|
| Background (labyrinth base) | Deep navy | #0A0E1A |
| Walls | Dark stone | #2A2D3A |
| Player | Bright gold | #FFD700 |
| Glyph glow | Cyan | #00FFCC |
| HP bar | Emerald | #2ECC71 |
| HP bar (danger) | Ruby | #E74C3C |
| UI text | Light gray-white | #E8E8E8 |

#### Biome Accents
| Biome | Primary | Secondary | Ambient Light |
|-------|---------|-----------|--------------|
| Flame Sanctum | #FF4500 (OrangeRed) | #FFD700 (Gold) | Warm amber glow |
| Frozen Cavern | #00BFFF (DeepSkyBlue) | #E0FFFF (LightCyan) | Cold blue reflections |
| Ancient Grove | #32CD32 (LimeGreen) | #8FBC8F (DarkSeaGreen) | Bioluminescent green pulses |
| Abyssal Ruins | #8B00FF (Violet) | #2F0047 (DeepPurple) | Echo wave violet |
| Celestial Tower | #FFD700 (Gold) | #FFFFFF (White) | Lightning flash + time ripples |
| Rift of Time (Hidden) | #FF00FF (Magenta) | All biome mix | Chromatic aberration effect |

### 4.3 Object Shape Guide
| Object | Base Shape | Size (px) | Animation |
|--------|-----------|----------|-----------|
| Player | Robed explorer: round head + body + legs | 32×32 | 8-dir walk(4 frames), dash(3 blur trails), ability cast(glow) |
| Basic Enemy | Biome-variant creatures (flame imp, ice bat, etc.) | 24×24 | Move(4f), attack(2f), hit(flash), death(particles) |
| Boss | Large creature, biome-themed | 96×96~128×128 | Intro cutscene(zoom), phase transition(transform), pattern-specific motion |
| Glyph Item | Octagonal sigil + center symbol + glow particles | 20×20 | Float + rotate + glow pulse |
| Door/Portal | Stone arch frame + energy barrier | 40×48 | Locked(dark barrier), opened(energy wave + particle scatter) |
| Env Trap | Biome-specific (fire pillar, icicle, thorn vine, etc.) | 32×32 | Active/inactive cycle + danger indicator |
| Save Point | Stone stele with glyph engravings | 24×32 | Inactive(dim), active(bright glow + rising particles) |
| Arcana Record | Glowing text etched on walls | 48×32 | Brightens on proximity + floating text |

### 4.4 Drawing Function Signatures (F9)
```
drawPlayer(ctx, x, y, size, direction, frame, glyphActive, dashTrail)
drawEnemy(ctx, x, y, size, type, frame, hitFlash, hp)
drawBoss(ctx, x, y, size, bossId, phase, frame, hitFlash)
drawGlyph(ctx, x, y, size, glyphType, pulseT, collected)
drawDoor(ctx, x, y, w, h, locked, unlockProgress)
drawTrap(ctx, x, y, size, trapType, activeT, biome)
drawSavePoint(ctx, x, y, size, activated, glowT)
drawRecord(ctx, x, y, w, h, proximity, readState)
drawWall(ctx, x, y, w, h, biome, variant)
drawMinimap(ctx, x, y, size, rooms, currentRoom, discovered)
drawHUD(ctx, canvasW, canvasH, hp, maxHp, glyphs, activeGlyph, score, biome)
drawParticle(ctx, x, y, size, color, alpha, shape)
```
> All drawing functions are pure functions — no direct global variable references.

### 4.5 Visual Effects
- **Room transition**: Slide + fade (tween 300ms), slide direction matches movement
- **Glyph acquisition**: Center zoom + ability description text + glow particle burst (tween 2s)
- **Boss entrance**: Screen zoom (1.0→1.3, 1s) + boss name title + biome color flash
- **Boss phase transition**: Screen shake (0.5s) + color shift + transformation particles
- **Hit**: Character red flash (100ms) + slight screen shake (50ms)
- **Dash**: 3 afterimages (alpha 0.6→0.3→0.1) + motion blur lines
- **Ambient light**: Biome-specific particles (flame sparks, snow crystals, spores, echo waves, lightning flashes) as persistent background layer

---

## §5. Code Structure Guide

### 5.1 Initialization Order (F12)
```
1. CONFIG constants (all numeric values)
2. Global state variables
3. Canvas/Context DOM assignment
4. TweenManager instance
5. ObjectPool instance
6. AudioManager instance
7. SeededRNG instance
8. Event listener registration
9. Title screen initialization
10. rAF game loop start
```

### 5.2 TweenManager Rules (F4, F5, F13, F14)
- **setTimeout completely banned** — all delays via tween onComplete callbacks
- **Guard flag pattern**: Set `transitioning = true` on state transition to prevent duplicate calls
- **clearImmediate()**: Use instead of cancelAll() to avoid race conditions
- **Single update path**: A value must not have both tween updates and direct assignment simultaneously

### 5.3 Code Region Guide (10 REGIONS)
```
REGION 1: CONFIG & CONSTANTS       (lines 1~150)     — All game values, colors, biome data
REGION 2: CORE ENGINE              (lines 151~400)    — TweenManager, ObjectPool, SeededRNG, AudioManager
REGION 3: STATE MACHINE            (lines 401~550)    — State definitions, transitions, ACTIVE_SYSTEMS matrix
REGION 4: WORLD & MAP              (lines 551~850)    — Room generation, biome layout, BFS validation, minimap
REGION 5: PLAYER & ABILITIES       (lines 851~1100)   — Player movement, dash, glyph abilities, collision
REGION 6: ENEMIES & BOSSES         (lines 1101~1450)  — Enemy AI, boss AI, phase transitions, spawn system
REGION 7: PUZZLES & ENVIRONMENT    (lines 1451~1700)  — Env puzzles, traps, doors/portals, glyph interactions
REGION 8: DRAWING                  (lines 1701~2200)  — All drawXxx() functions, particles, camera
REGION 9: UI & HUD                 (lines 2201~2500)  — HUD, menus, modals, glyph inventory, dialogue
REGION 10: GAME LOOP & INIT        (lines 2501~2700)  — update(), render(), rAF loop, events
```

---

## §6. State Machine

### 6.1 Game States + STATE_PRIORITY + RESTART_ALLOWED (F6, F44)

```
State List (18 states):
  BOOT           = 0   (Initial loading)
  TITLE          = 1   (Title screen)
  DIFF_SELECT    = 2   (Difficulty selection)
  WORLD_MAP      = 3   (World map / biome selection)
  ROOM_ENTER     = 4   (Room entry transition animation)
  EXPLORE        = 5   (Normal exploration / movement)
  PUZZLE         = 6   (Puzzle active)
  COMBAT         = 7   (Enemy combat)
  BOSS_INTRO     = 8   (Boss entrance cutscene)
  BOSS_FIGHT     = 9   (Boss combat)
  BOSS_DEFEAT    = 10  (Boss defeat sequence)
  GLYPH_GET      = 11  (Glyph acquisition sequence)
  CUTSCENE       = 12  (Story cutscene)
  PAUSE          = 13  (Pause)
  INVENTORY      = 14  (Glyph menu / combination)
  GAMEOVER       = 15  (Game Over)
  ENDING         = 16  (Ending)
  CONFIRM_MODAL  = 17  (Confirmation modal, F3)

STATE_PRIORITY (higher = takes precedence):
  GAMEOVER: 100, ENDING: 95, BOSS_DEFEAT: 90, BOSS_INTRO: 85,
  CUTSCENE: 80, GLYPH_GET: 75, CONFIRM_MODAL: 70,
  BOSS_FIGHT: 60, COMBAT: 50, PUZZLE: 45,
  EXPLORE: 30, ROOM_ENTER: 25,
  INVENTORY: 20, PAUSE: 15,
  WORLD_MAP: 10, DIFF_SELECT: 5, TITLE: 2, BOOT: 1

RESTART_ALLOWED (whitelist of states reachable from GAMEOVER):
  [TITLE, DIFF_SELECT, EXPLORE]
  — GAMEOVER → TITLE: Return to main menu
  — GAMEOVER → DIFF_SELECT: Restart with different difficulty
  — GAMEOVER → EXPLORE: Resume from last save point
```

### 6.2 ACTIVE_SYSTEMS Matrix (F7) — 18×14

| State | tween | physics | input | draw | audio | enemy | boss | puzzle | particle | camera | hud | minimap | save | timer |
|-------|-------|---------|-------|------|-------|-------|------|--------|----------|--------|-----|---------|------|-------|
| BOOT | ✓ | | | ✓ | | | | | | | | | | |
| TITLE | ✓ | | ✓ | ✓ | ✓ | | | | ✓ | | | | | |
| DIFF_SELECT | ✓ | | ✓ | ✓ | ✓ | | | | | | | | | |
| WORLD_MAP | ✓ | | ✓ | ✓ | ✓ | | | | | | | ✓ | | |
| ROOM_ENTER | ✓ | | | ✓ | ✓ | | | | ✓ | ✓ | ✓ | | | |
| EXPLORE | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PUZZLE | ✓ | ✓ | ✓ | ✓ | ✓ | | | ✓ | ✓ | ✓ | ✓ | | | ✓ |
| COMBAT | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | | ✓ | ✓ | ✓ | | | ✓ |
| BOSS_INTRO | ✓ | | | ✓ | ✓ | | ✓ | | ✓ | ✓ | | | | |
| BOSS_FIGHT | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | | ✓ | ✓ | ✓ | | | ✓ |
| BOSS_DEFEAT | ✓ | | | ✓ | ✓ | | ✓ | | ✓ | ✓ | | | | |
| GLYPH_GET | ✓ | | | ✓ | ✓ | | | | ✓ | ✓ | | | ✓ | |
| CUTSCENE | ✓ | | ✓ | ✓ | ✓ | | | | ✓ | ✓ | | | | |
| PAUSE | ✓ | | ✓ | ✓ | | | | | | | ✓ | ✓ | | |
| INVENTORY | ✓ | | ✓ | ✓ | ✓ | | | | | | ✓ | | | |
| GAMEOVER | ✓ | | ✓ | ✓ | ✓ | | | | ✓ | | | | | |
| ENDING | ✓ | | ✓ | ✓ | ✓ | | | | ✓ | ✓ | | | | |
| CONFIRM_MODAL | ✓ | | ✓ | ✓ | | | | | | | | | | |

> **Key Separation**: enemy system active only in EXPLORE/COMBAT; boss system only in BOSS_INTRO/BOSS_FIGHT/BOSS_DEFEAT; puzzle system only in EXPLORE/PUZZLE. Mutually exclusive activation targets zero inter-system interference.

### 6.3 State Transition Diagram (Main Paths)
```
BOOT → TITLE → DIFF_SELECT → WORLD_MAP
                                  ↓
                              ROOM_ENTER → EXPLORE ←→ PUZZLE
                                              ↓           ↑
                                          COMBAT ──→ EXPLORE
                                              ↓
                                        (all enemies cleared)
                                              ↓
                                          EXPLORE
                                              ↓
                                        (enter boss room)
                                              ↓
                              BOSS_INTRO → BOSS_FIGHT → BOSS_DEFEAT
                                                            ↓
                                                      GLYPH_GET → CUTSCENE → WORLD_MAP

EXPLORE/COMBAT/BOSS_FIGHT → (HP 0) → GAMEOVER → {TITLE | EXPLORE(save)}
EXPLORE/COMBAT → (ESC) → PAUSE → EXPLORE/COMBAT
EXPLORE → (Q) → INVENTORY → EXPLORE
All glyphs collected + final seal → ENDING
```

### 6.4 Canvas Modal (F3)
Instead of confirm()/alert(), use CONFIRM_MODAL state to draw modal UI on Canvas.
- Semi-transparent overlay (rgba(0,0,0,0.7))
- Modal box (centered, biome-themed border)
- Yes/No buttons (min 80×48px touch area each)

---

## §7. Core Game Loop (Per-Frame Logic Flow)

### 7.1 Main Loop (60fps, rAF-based)
```
function gameLoop(timestamp) {
    const dt = Math.min(timestamp - lastTime, 50);  // dt cap 50ms
    lastTime = timestamp;

    // 1. Input processing (ACTIVE_SYSTEMS[state].input)
    processInput(dt);

    // 2. Tween update (always)
    tweenManager.update(dt);

    // 3. Physics/movement (ACTIVE_SYSTEMS[state].physics)
    updatePhysics(dt);

    // 4. Enemy/Boss AI (ACTIVE_SYSTEMS[state].enemy/boss)
    updateEnemies(dt);
    updateBoss(dt);

    // 5. Puzzle system (ACTIVE_SYSTEMS[state].puzzle)
    updatePuzzles(dt);

    // 6. Collision detection
    checkCollisions();

    // 7. Camera (ACTIVE_SYSTEMS[state].camera)
    updateCamera(dt);

    // 8. Particles (ACTIVE_SYSTEMS[state].particle)
    updateParticles(dt);

    // 9. Save check (ACTIVE_SYSTEMS[state].save)
    checkSavePoints();

    // 10. Rendering (always)
    render();

    requestAnimationFrame(gameLoop);
}
```

### 7.2 Render Order (back→front)
```
1. Background (biome gradient + ambient particles)
2. Floor tiles (walkable areas)
3. Lower environment objects (traps, doors, glyphs)
4. Enemies + Bosses
5. Player (including dash afterimages)
6. Upper environment objects (vines, icicles, overlays)
7. Glyph ability effects
8. Particle layer
9. Camera shake offset
10. HUD (HP, glyph slots, minimap)
11. UI overlay (modals, menus, dialogue)
```

---

## §8. Difficulty System

### 8.1 Per-Biome Balance Table (3 Tiers) (F51)

#### Early (Biomes 1~2: Flame Sanctum + Frozen Cavern)
| Stat | Explorer | Adventurer | Legend |
|------|----------|-----------|--------|
| Player HP | 150 | 100 | 70 |
| Normal Enemy HP | 18 | 30 | 42 |
| Normal Enemy ATK | 5 | 8 | 12 |
| Enemies/Room | 3 | 4 | 5 |
| Boss HP | 180 | 300 | 420 |
| Boss ATK | 10 | 15 | 22 |
| Boss Phases | 2 | 2 | 3 |
| Puzzle Time Limit (s) | None | 60 | 45 |

#### Mid (Biome 3: Ancient Grove)
| Stat | Explorer | Adventurer | Legend |
|------|----------|-----------|--------|
| Normal Enemy HP | 30 | 50 | 70 |
| Normal Enemy ATK | 8 | 12 | 18 |
| Enemies/Room | 4 | 5 | 7 |
| Boss HP | 300 | 500 | 700 |
| Boss ATK | 15 | 22 | 32 |
| Boss Phases | 2 | 3 | 3 |
| Puzzle Time Limit (s) | None | 50 | 35 |

#### Late (Biomes 4~5: Abyssal Ruins + Celestial Tower)
| Stat | Explorer | Adventurer | Legend |
|------|----------|-----------|--------|
| Normal Enemy HP | 42 | 70 | 98 |
| Normal Enemy ATK | 12 | 18 | 26 |
| Enemies/Room | 5 | 6 | 8 |
| Boss HP | 420 | 700 | 980 |
| Boss ATK | 20 | 30 | 42 |
| Boss Phases | 3 | 3 | 4 |
| Puzzle Time Limit (s) | None | 40 | 25 |

### 8.2 Clearability Formula (F51)

**Player DPS Formula**:
```
baseDPS = playerATK / attackInterval
effectiveDPS = baseDPS × (1 + glyphBonus) × comboMultiplier
```

**Boss Clear Time Formula**:
```
clearTime = bossHP / (effectiveDPS × hitRate)
hitRate assumptions: Explorer 0.7, Adventurer 0.5, Legend 0.4
```

**Survival Time Formula**:
```
survivalTime = playerHP / (bossATK × (1 - dodgeRate) / bossAttackInterval)
dodgeRate assumptions: Explorer 0.3, Adventurer 0.4, Legend 0.5
```

**Balance Condition**: `survivalTime ≥ clearTime × 1.3` (30% safety margin)

> Fallback for wrong assumptions: **Dynamic Difficulty Adjustment (DDA)** — 3 consecutive deaths in same room: enemy HP -10%; 5 consecutive: -20%. Applied only on "Adventurer" (Explorer is already easy, Legend is intentionally hard).

### 8.3 Dynamic Difficulty Adjustment (DDA)
- **3 consecutive deaths** (same room): Enemy HP ×0.9, show 1 hint glyph
- **5 consecutive deaths**: Enemy HP ×0.8, Enemy ATK ×0.9, additional hint glyphs
- **No-damage boss defeat**: Next biome enemy HP ×1.1 (compensatory scaling)
- DDA values are NOT saved to localStorage (reset per run)

---

## §9. Boss Fight Details

### 9.1 Boss Concepts

#### Boss 1: Ignis (Flame Sanctum)
- **Form**: Lava golem with molten cracks seeping lava
- **Phase 1** (HP 100%~50%): Lava chunk throws (3-way), charge attack. Creates floor lava pools
- **Phase 2** (HP 50%~0%): Complex eruption patterns + chain fire pillar explosions. Coolant pipes in walls can be activated
- **Weakness**: Activate coolant pipes via glyph → hit Ignis = 3s stagger + 2× damage

#### Boss 2: Glacia (Frozen Cavern)
- **Form**: Massive frost serpent, body wraps around entire room
- **Phase 1**: Ice-floor sliding charge, icicle rain (random), frost breath (cone)
- **Phase 2**: Splits into 3 mini-serpents → defeat each to expose core weakness
- **Weakness**: Lure serpent to heat source (activated via flame glyph) → ice armor removed, weakness exposed

#### Boss 3: Silvanus (Ancient Grove)
- **Form**: Colossal ancient treant, roots spanning entire room
- **Phase 1**: Root attacks (burst from floor), spore clouds (vision block), vine binds
- **Phase 2**: Begins moving + rotating root attack + healing (spore absorption)
- **Phase 3** (Legend only): Mini-clone summon + room-wide root wave
- **Weakness**: Redirect spore clouds at Silvanus (wind glyph) → poison + heal blocked

#### Boss 4: Nyx (Abyssal Ruins)
- **Form**: Shadow entity, hard to distinguish real from copies
- **Phase 1**: 3 shadow clones + teleport, echo attacks (circular waves)
- **Phase 2**: Room lights out → locate via echo waves only, only real one takes damage
- **Phase 3**: Light/dark alternation → real form visible in light only, clones buffed in dark
- **Weakness**: Echo glyph detects real position + light glyph forces illumination → weakness exposed

#### Boss 5: Chronos (Celestial Tower) — Final Boss
- **Form**: Time Guardian, humanoid composed of massive clock gears
- **Phase 1**: Time slow field (player speed ×0.5), past attack replay (repeats pattern from 2s ago)
- **Phase 2**: Time rewind (forces player position to 3s ago), gear projectiles
- **Phase 3**: Time-stop bombs (specific area freeze, 3s stun on contact) + all previous patterns mixed
- **Weakness**: Time glyph nullifies slow field + use rewind to position advantageously → strike exposed gears

### 9.2 Boss Phase Transition State Diagrams (F22 Verified Pattern)

```
[Ignis]
  INTRO ─→ PHASE1(HP>50%) ─→ PHASE2(HP≤50%) ─→ DEFEAT
                  ↕ (attack/idle loop)     ↕

[Glacia]
  INTRO ─→ PHASE1(HP>50%) ─→ SPLIT(split cutscene 1s) ─→ PHASE2(3 minis) ─→ DEFEAT
                                                              ↓
                                                    (all minis defeated → core exposed)

[Silvanus]
  INTRO ─→ PHASE1(HP>70%) ─→ PHASE2(HP≤70%) ─→ [Legend] PHASE3(HP≤30%) ─→ DEFEAT
                                                      ↓ [Explorer/Adventurer]
                                                    DEFEAT

[Nyx]
  INTRO ─→ PHASE1(HP>60%) ─→ PHASE2(HP≤60%) ─→ PHASE3(HP≤25%) ─→ DEFEAT
                                 (lights out 1.5s)    (light/dark alternation begins)

[Chronos — Final Boss]
  INTRO ─→ PHASE1(HP>65%) ─→ PHASE2(HP≤65%) ─→ PHASE3(HP≤30%) ─→ DEFEAT
              (slow field)       (rewind)          (time bombs+mix)
                              2s cutscene           3s cutscene
```

---

## §10. Map System

### 10.1 Room Structure
Each room is a 16×12 tile grid (tile size: canvasWidth / 16)
- **Wall tiles**: Impassable, biome-specific appearance
- **Floor tiles**: Walkable, biome-specific texture
- **Door tiles**: Connection points to other rooms (max 4: N/S/E/W)
- **Special tiles**: Traps, glyphs, save points, Arcana records

### 10.2 Procedural Room Layout + BFS Reachability Validation (F54)
SeededRNG-based room layout algorithm:
```
1. Randomly select 4 room structures from biome templates
2. Connect rooms (minimum spanning tree + 1~2 extra connections)
3. Place glyphs/items
4. Place enemy spawn points
5. ★ BFS Reachability Validation:
   - Verify path exists from start room to all rooms
   - Validate path feasibility considering glyph ability order
   - On failure: regenerate seed in 3 stages (max 10 attempts)
   - After 10 failures: fallback to fixed layout
6. Place secret passages (1~2 wall tiles become hidden doors)
```

### 10.3 Minimap
- Tab toggle or fixed at HUD top-right (60×45px)
- Visited rooms: bright; unvisited: dark
- Current position: blinking dot
- Boss rooms: special icon (biome-colored star)
- Door connections: thin lines

---

## §11. Score System

### 11.1 Scoring Table (F8: Judge first, save later)
| Action | Points |
|--------|--------|
| Normal enemy defeat | 100 × biome number |
| Boss defeat | 5000 × biome number |
| Puzzle solved | 300 × difficulty multiplier |
| Glyph collected | 1000 |
| Arcana Record found | 500 |
| Secret passage found | 800 |
| No-damage room clear | Current room score ×1.5 |
| No-damage boss defeat | Boss score ×2.0 |
| Full clear | 50000 |
| Hidden biome clear | 100000 |

### 11.2 Combo System
- Consecutive enemy kills within 5 seconds increase combo counter
- Combo multiplier: 1.0 → 1.5(×3) → 2.0(×5) → 3.0(×10)
- Taking damage resets combo

### 11.3 Rankings
- Top 5 records per difficulty stored in localStorage
- Display: Score, clear time, glyphs collected, death count

---

## §12. Glyph System (Core Mechanic)

### 12.1 Base Glyphs (5 — obtained by defeating biome bosses)
| Glyph | Ability | Usage |
|-------|---------|-------|
| 🔥 Ignis Glyph | Fire projectile + melt ice barriers | Frozen Cavern barriers, burn Ancient Grove vines |
| ❄ Glacia Glyph | Frost wave + solidify lava | Flame Sanctum lava paths, freeze Abyssal liquids |
| 🌿 Silva Glyph | Create vine bridges + activate plants | Temporary bridges over gaps, Ancient Grove secrets |
| 👁 Nyx Glyph | Echo detection + reveal hidden doors | Find secret passages, navigate Abyssal darkness |
| ⏳ Chronos Glyph | Time stop (3s) + freeze moving objects | Timing puzzles, Celestial Tower moving platforms |

### 12.2 Combination Glyphs (15 — combine 2 base glyphs)
| Combination | Result Ability | Unlock Path |
|-------------|---------------|-------------|
| 🔥+❄ | **Steam Explosion** — wide AoE knockback + vision block | After defeating both Flame+Frozen bosses |
| 🔥+🌿 | **Flame Vine** — homing fire vine attack | After Flame+Grove bosses |
| 🔥+👁 | **Heat Sense** — reveal enemies/items behind walls | After Flame+Abyssal bosses |
| 🔥+⏳ | **Incinerate** — time acceleration deals rapid HP drain | After Flame+Celestial bosses |
| ❄+🌿 | **Frost Garden** — floor-wide ice trap placement | After Frozen+Grove bosses |
| ❄+👁 | **Cold Echo** — cooled echo slows + detects enemies | After Frozen+Abyssal bosses |
| ❄+⏳ | **Absolute Zero** — 3s room-wide freeze | After Frozen+Celestial bosses |
| 🌿+👁 | **Spore Tracker** — attach spores to enemies, show on minimap | After Grove+Abyssal bosses |
| 🌿+⏳ | **Growth Boost** — vine bridges become permanent + reinforced | After Grove+Celestial bosses |
| 👁+⏳ | **Precognition** — show enemy trajectory 3s ahead | After Abyssal+Celestial bosses |

> Remaining 5 combinations (3-glyph) are special abilities usable only in the hidden biome, auto-combined upon meeting hidden unlock conditions.

### 12.3 Glyph Slots
- Active slots: max 5 (switch with 1~5 keys)
- Glyph energy: per-glyph gauge (max 100). Consumed on use, natural regen (2/sec)
- Combination glyphs consume both component energies simultaneously (consumption ×0.7)

---

## §13. Validation Checklists

### 13.1 Numeric Consistency Table (F10)
> Spec values = CONFIG constants 1:1 mandatory

| Spec Item | CONFIG Key | Value |
|-----------|-----------|-------|
| Player base HP | PLAYER_BASE_HP | 100 |
| Player move speed | PLAYER_SPEED | 150 (px/s) |
| Dash distance | DASH_DISTANCE | 80 (px) |
| Dash cooldown | DASH_COOLDOWN | 1000 (ms) |
| Dash i-frames | DASH_INVINCIBLE | 200 (ms) |
| Glyph max energy | GLYPH_MAX_ENERGY | 100 |
| Glyph regen rate | GLYPH_REGEN | 2 (/sec) |
| Combo window | COMBO_WINDOW | 5000 (ms) |
| Room transition | ROOM_TRANSITION | 300 (ms) |
| Boss intro zoom | BOSS_INTRO_ZOOM | 1.3 (scale) |
| Touch min target | TOUCH_MIN_TARGET | 48 (px) |
| DDA 3-death multiplier | DDA_3DEATH_MULT | 0.9 |
| DDA 5-death multiplier | DDA_5DEATH_MULT | 0.8 |

### 13.2 Auto-Validation Script Items (F49, F50, F53)
Grep-based validation to run frequently during coding:
```
[ FAIL ] <link         — External resource loading banned
[ FAIL ] <script src=  — External script banned
[ FAIL ] @import url   — CSS external import banned
[ FAIL ] ASSET_MAP     — Asset map code banned
[ FAIL ] SPRITES       — Sprite code banned
[ FAIL ] preloadAssets — Asset preload banned
[ FAIL ] new Image()   — Image object creation banned
[ FAIL ] setTimeout    — setTimeout banned (use tween)
[ FAIL ] setInterval   — setInterval banned
[ FAIL ] confirm(      — confirm dialog banned
[ FAIL ] alert(        — alert dialog banned
[ FAIL ] "Google Fonts" — Related comment residual banned
[ FAIL ] "CDN"         — Related comment residual banned
[ FAIL ] "external"    — External resource comment banned
[ WARN ] eval(         — eval usage warning
[ WARN ] innerHTML     — XSS risk warning
```

### 13.3 Smoke Test Gate — 12 Items (F15, F52)
Must pass before review submission:
```
□ 1. index.html exists and loads without errors in browser
□ 2. Title screen displays + game start works
□ 3. Room navigation (min 2 rooms) works correctly
□ 4. At least 1 glyph ability can be activated
□ 5. Enemy defeat + score increase confirmed
□ 6. GAMEOVER → RESTART_ALLOWED path restart works (F44)
□ 7. All touch buttons have ≥48×48px hit area (F11)
□ 8. Zero external resources (§13.2 grep all PASS)
□ 9. Zero asset-related code (no ASSET_MAP/SPRITES/preloadAssets/new Image)
□ 10. ESC → pause → resume works
□ 11. Boss fight entry + at least Phase 1 works
□ 12. localStorage save/load works (save points + rankings)
```

### 13.4 Balance Validation Items (F51)
```
□ 1. Verify §8.1 table values match CONFIG constants 1:1
□ 2. Verify survivalTime ≥ clearTime × 1.3 for each boss
□ 3. Verify DDA activation correctly reduces boss HP
□ 4. Verify combo multiplier accurately reflected in score system
□ 5. Verify glyph energy consumption/regen balance (no depletion in combat)
```

---

## §14. Sound Design (Web Audio API)

### 14.1 BGM
| Context | Style | Loop |
|---------|-------|------|
| Title | Mysterious ambient, glyph motif | Infinite loop |
| Exploration (all biomes) | Calm exploration theme, biome-specific instrument variations | Infinite loop |
| Combat | Tense percussion + biome theme variation | Infinite loop |
| Boss | Grand orchestral feel, per-boss leitmotif | Infinite loop |

### 14.2 Sound Effects (8+)
| SFX | Description | Generation |
|-----|-------------|-----------|
| Glyph activate | Crystal chime + energy release | OscillatorNode (high-freq sweep) |
| Glyph combine | Harmonic chord + power-up rise | Multi-Oscillator harmonics |
| Hit | Short impact + low-freq vibration | noise + lowpass filter |
| Enemy defeat | Burst + glyph shard sound | noise burst + high-freq decay |
| Boss entrance | Deep drum + reverse cymbal | Low-freq Oscillator + reverse envelope |
| Door open | Stone sliding + energy release | filtered noise + ascending sweep |
| Puzzle solved | Ascending arpeggio | Sequential OscillatorNode scale |
| Save | Gentle glow sound | sine wave + fade in/out |
| Dash | Quick wind sound | Short noise burst + highpass |
| Room transition | Warp sweep | Frequency descending sweep |

---

## §15. Permanent Progression + localStorage Schema

### 15.1 Save Data Schema
```javascript
const SAVE_SCHEMA = {
    version: 1,
    key: "glyph-labyrinth-save",
    data: {
        // Permanent data (persists through death)
        glyphsUnlocked: [],       // Unlocked glyph IDs
        abilitiesUnlocked: [],    // Unlocked combination ability IDs
        recordsFound: [],         // Discovered Arcana Record IDs
        secretsFound: [],         // Discovered secret passage list
        bestScores: {             // Top 5 per difficulty
            easy: [], normal: [], hard: []
        },
        totalDeaths: 0,
        totalPlayTime: 0,
        hiddenUnlocked: false,

        // Run data (based on save point)
        currentRun: {
            difficulty: "normal",
            seed: 0,
            currentBiome: 1,
            currentRoom: 0,
            hp: 100,
            glyphEnergy: {},
            activeGlyphs: [],
            score: 0,
            comboCount: 0,
            ddaDeaths: {},        // Deaths per room ID
            discoveredRooms: [],
            savePointId: null
        }
    }
};
```

### 15.2 Save/Load Rules (F8)
- **Judge first, save later**: Glyph acquisition check → UI update → score update → localStorage save
- Auto-save on save point contact (full currentRun)
- On Game Over: save permanent data only (currentRun rolls back to last save)
- Version migration: on version mismatch, initialize to defaults + warning

---

## §16. Viewport Test Matrix
| Viewport | Check Items |
|----------|------------|
| 320px (mobile portrait) | Virtual joystick displayed, glyph slots compact, no HUD overlap |
| 480px (mobile landscape) | Game area ratio maintained, touch button positions appropriate |
| 768px (tablet) | Minimap + HUD simultaneous display, glyph menu layout |
| 1024px+ (desktop) | Full UI, sidebar info displays correctly |

Canvas resolution: `canvas.width = canvas.clientWidth * devicePixelRatio` (dynamic resize)

---

## §17. Previous Cycle Pain Points Resolution Summary

| Cycle 24 Pain Point | Resolution Section | Solution |
|---------------------|-------------------|----------|
| 2nd review 2 rounds (3 total) | §13.3 | Smoke test gate 8→12 items, RESTART_ALLOWED+touch+external resources as mandatory gates |
| Google Fonts `<link>` residual | §4.1, §13.2 | System fonts only + auto grep for `<link>`, "Google Fonts" comments |
| ASSET_MAP/SPRITES code residual | §4.1, §13.2 | Block from scaffolding stage + auto grep 4 patterns |
| Balance auto-verification missing | §8.1, §8.2, §13.4 | 3-tier balance table with numerics + DPS/EHP formulas + 5 balance checks |
| Single file size bloat | §5.3 | 10-REGION code area guide for structural clarity |

---

## §18. Sidebar Info (Game Page Metadata)

```yaml
game:
  title: "Glyph Labyrinth"
  description: "A puzzle metroidvania — explore ancient ruins, collect and combine glyphs to unlock abilities, solve environmental puzzles and defeat bosses"
  genre: ["arcade", "puzzle"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/Arrows: Move"
    - "Space: Activate glyph ability"
    - "E: Interact"
    - "Q: Glyph menu"
    - "Shift: Dash"
    - "Tab: Minimap"
    - "ESC: Pause"
    - "Touch: Virtual joystick + buttons"
  tags:
    - "#metroidvania"
    - "#puzzle"
    - "#exploration"
    - "#bossfight"
    - "#glyphcombination"
    - "#procedural"
    - "#narrative"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## §19. Thumbnail SVG Guide (20KB+)

Cinematic composition: An explorer (back view) standing before a massive stone gate engraved with glowing glyph sigils at the labyrinth entrance.
- Foreground: Explorer silhouette (gold outline)
- Midground: Glyph-engraved great stone gate (cyan glow)
- Background: Dark labyrinth corridor + biome color hints (5 colored light beams)
- Atmosphere: Mysterious and grand — the beginning of an adventure
- SVG viewBox: "0 0 480 360" (4:3 ratio)
- Complex filter chain: glow + shadow combination for depth
