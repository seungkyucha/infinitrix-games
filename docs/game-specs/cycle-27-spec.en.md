---
game-id: elemental-cascade
title: Elemental Cascade
genre: puzzle, strategy
difficulty: hard
---

# Elemental Cascade — Cycle #27 Game Design Specification

> **1-Page Summary**: A **match-3 roguelike RPG** where players match 6-element gems (Fire/Water/Earth/Wind/Light/Dark) to generate mana and cast strategic spells to conquer sealed dungeons. On an 8×8 gem grid, chain 3-match→4-match (cross explosion)→5-match (full element explosion)→L/T-match (special effects) combos, then cast 18 spells using accumulated elemental mana to exploit enemy weaknesses. 5 regions (Volcano/Abyss/Forest/Sky/Void) × 3 floors = 15 stages + hidden stage, 5 regional bosses + final boss + hidden boss "Primordial" = 7 bosses. 3-pick roguelike relics between waves (common 6/rare 4/epic 3), permanent upgrade trees ×3 (offense/defense/utility), SeededRNG gem placement, 3 difficulty tiers (Apprentice/Mage/Archmage), DDA dynamic balancing, bilingual (KO/EN). **Strengthens puzzle+strategy combination from 1→2 games.**

> **MVP Boundary**: Phase 1 (Core loop: match-3 combat → spell casting → combo chain → enemy elimination → rewards, Regions 1~2 + 2 bosses + basic upgrade tree + 6 relics) + Phase 2 (Regions 3~5 + 3 bosses + hidden boss + full narrative + challenge mode + 7 relics). Phase 1 must deliver a complete game experience on its own.

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (see platform-wisdom) ✅
> Items below have been verified across 19+ cycles and are detailed in platform-wisdom.md. Only **applicable sections** are noted here.

| ID | Lesson Summary | Applied Section |
|----|---------------|----------------|
| F1 | Never create assets/ directory — 10 cycles consecutive [Cycle 1~26] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] — 15 consecutive | §5.2 |
| F5 | Guard flag ensures tween callback fires once [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system [Cycle 3 B2] | §6.1 |
| F7 | State × System matrix mandatory [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save after [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numerical consistency table (spec=code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target minimum 48×48px + Math.max enforcement [Cycle 22] | §3.3 |
| F12 | TDZ prevention: variable declaration → DOM assignment → event registration order [Cycle 5] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path unification (tween vs direct assignment) [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22] | §14.3 |

### New Feedback (Based on Cycle 26 Post-mortem) 🆕

| ID | Lesson | Solution | Applied Section |
|----|--------|----------|----------------|
| F60 | 2 P1 issues left unresolved — language toggle hit area offset + touch button dual branching (Cycle 26) | **Zero residual target**: Strengthen code hygiene checklist. Unify all touch hit areas via single `hitTest(x, y, rect)` function. Force input branching through ACTIVE_SYSTEMS matrix Input modes | §3.3, §6.2, §14.2 |
| F61 | 8 illegal SVG assets reappeared in round 1 — 10-cycle streak at risk (Cycle 26) | Maximum enforcement of zero-asset principle: `new Image()` 0 instances, zero external file references elevated to smoke test FAIL gate. **Check assets/ directory existence before coding begins** | §4.1, §14.3 #1 |
| F62 | Balance auto-verification gap — 5-element×7-tetromino×12-card×8-enemy×6-boss combinations unverified (Cycle 26) | Transition to match-3 RPG significantly reduces combination space: 6-element×4-match-type×13-relic×5-enemy×7-boss. DPS/EHP formulas in §8.2 + relic cumulative effect caps (DPS cap 200%, synergy cap 150%) | §8.1, §8.2 |
| F63 | Shared engine module extraction delayed 27 cycles (Cycle 26) | Single file again, but **10 REGION structure maintained + dependency directions explicitly stated** for circular-reference-free future extraction. TweenManager/ObjectPool/SoundManager/InputManager isolated in R2 | §5.3 |
| F64 | Math.random() initial contamination — used in bossAttack despite SeededRNG spec (Cycle 26) | `Math.random` string presence = smoke test FAIL. All randomness via `G.rng.next()`. `USE_SEEDED_RNG: true` constant declared in CONFIG as lint guard | §5.2, §14.3 #12 |

### Previous Cycle Pain Points Resolution Summary (Cycle 26 Post-mortem)

| Pain Point | Resolution Section | Resolution Method | Verification Criteria |
|-----------|-------------------|-------------------|---------------------|
| 2 P1 issues unresolved | §3.3, §14.2 | hitTest() single function + code hygiene checklist | P1 residual = 0 |
| 8 illegal SVG assets reappeared | §4.1, §14.3 | FAIL gate #1 top priority verification | Round 1 asset violations = 0 |
| Balance auto-verification gap | §8.1, §8.2 | DPS/EHP formulas + relic caps + DDA fallback | Clearable even with extreme builds |
| Shared engine extraction not started | §5.3 | 10 REGION dependency directions stated | Circular references = 0, extractable structure |
| Math.random() contamination | §14.3 #12 | Smoke test FAIL gate | Math.random string count = 0 |

---

## §1. Game Overview & Core Fun Elements

### 1.1 Concept
Elemental Cascade is a match-3 roguelike RPG where players match 6-element gems to generate mana and cast powerful spells to defeat monsters in sealed dungeons. The triple axis of **puzzle satisfaction** from match-3, **strategic growth** from RPG, and **replay value** from roguelike drives the experience.

### 1.2 Three Pillars of Fun
1. **Cascade Combos**: A single gem swap triggers chain matches (cascades), filling the screen with explosions for visual and strategic satisfaction. 4-match (cross explosion), 5-match (element explosion), L/T-match (row/column clear) — intentionally setting up special match patterns adds puzzle depth.
2. **Elemental Strategy**: 6-element weakness cycle (Fire→Earth→Wind→Water→Fire, Light↔Dark) + boss-specific elemental weaknesses + spell combinations. "Should I save Water+Wind mana for a Tidal Wave spell, or stockpile Light mana for Purify?"
3. **Roguelike Builds**: 3-pick relics between battles (common 6/rare 4/epic 3) create unique builds each run. "Combo-focused build", "single-element concentration build", "spell cooldown build" — multiple strategic paths.

### 1.3 Story/Narrative
- **Setting**: "Cascaders" are a mage guild that harmonizes elemental flows to maintain world balance. Ancient seals have broken, and elements in 5 regions have begun raging out of control. As the last Cascader, the player must seal each region's elemental rift and find the source of the rampage.
- **Regional Stories**: Each region holds records of its guardian. Ignis the Blacksmith (Volcano), Aqua the Sage (Abyss), Terra the Spirit King (Forest), Aero the Wind Lord (Sky), Nox the previous Cascader (Void). Short text dialogues (Canvas-rendered, 3 lines) between battles.
- **Endings**: 5 regions sealed → "Elemental Stability" normal ending. Hidden boss "Primordial" defeated → "Cascader's Legacy" true ending — the elemental rampage was actually the world seeking new equilibrium, and the Cascader's role was harmony, not suppression.
- **Story Delivery**: Guardian records between battles (3-line text + background effects), boss intro/defeat cutscenes (Canvas camera zoom + dialogue 5s), post-hidden-boss epilogue (scroll text 10s).

### 1.4 Genre Strengthening Effect
- **puzzle + strategy = 1→2 games** (minimum frequency combination strengthened)
- puzzle total: 8→9, strategy total: 10→11
- Fully differentiated from existing puzzle+strategy (runeforge-tactics: turn-based rune strategy): match-3 puzzle + RPG combat strategy — completely different core mechanic

---

## §2. Game Rules & Objectives

### 2.1 Core Rules
- **Grid-Based Puzzle**: Swap adjacent gems on an 8×8 grid to match 3+ same-element gems in a line
- **Match → Mana Generation**: Matched gems generate mana of their element (3-match=3 mana, 4-match=5 mana, 5-match=8 mana)
- **Mana → Spell Casting**: Accumulated mana powers attack/defense/utility spells against enemies
- **Combo Multiplier**: Cascade count × 0.5 additional multiplier (2 combos=1.5×, 3 combos=2.0×, ...)
- **Turn-Based Combat**: Match → Spell Cast → Enemy Attack → Next Turn. Enemy attacks reduce player HP
- **Player HP 0 → Game Over**. Earned permanent currency (Elemental Crystals) is preserved

### 2.2 Match System Details

| Match Type | Condition | Effect | Mana Generated |
|-----------|-----------|--------|---------------|
| 3-Match (Basic) | 3 same-element gems in line | Remove matched gems | 3 |
| 4-Match (Cross) | 4 same-element gems in line | Remove + cross-direction row explosion | 5 |
| 5-Match (Element Burst) | 5 same-element gems in line | Remove all gems of that element on grid | 8 |
| L-Match | Same-element L-shape (3+3, shared corner) | Remove + 3×3 area explosion | 6 |
| T-Match | Same-element T-shape (3+3, shared center) | Remove + row+column explosion | 7 |

> Match detection priority: 5-match → T-match → L-match → 4-match → 3-match (larger matches first)

### 2.3 Region Configuration

| Region | Floors | Theme | Environment Effect | Boss |
|--------|--------|-------|--------------------|------|
| 1. Volcanic Wastes | 3+boss | Lava, fire pillars, heat waves | Fire gem matches deal +20% damage | Ignis (Lava Colossus) |
| 2. Abyssal Ruins | 3+boss | Coral, currents, deep-sea light | 1 Water gem randomly spawns each turn | Aqua (Abyssal Kraken) |
| 3. Ancient Forest | 3+boss | Great trees, moss, spores | Earth matches grant +15% defense buff (2 turns) | Terra (Ancient Treant) |
| 4. Storm Skies | 3+boss | Clouds, lightning, aurora | 4+ matches trigger random lightning (50 fixed damage) | Aero (Storm Phoenix) |
| 5. Elemental Abyss | 3+boss | Chaos, distortion, annihilation | 10% chance per turn of random gem element conversion | Nox (Void Sovereign) |
| Hidden. Primordial Chamber | Boss only | All regions mixed | All environment effects cycle randomly (every 3 turns) | Primordial |

### 2.4 Three Difficulty Tiers

| Difficulty | Player HP | Enemy HP Mult. | Enemy ATK Mult. | Relic Selection | Unlock Condition |
|-----------|----------|---------------|-----------------|----------------|-----------------|
| Apprentice (Easy) | 150 | ×0.7 | ×0.7 | 4-pick (1 Rare guaranteed) | None |
| Mage (Normal) | 100 | ×1.0 | ×1.0 | 3-pick | None |
| Archmage (Hard) | 70 | ×1.4 | ×1.3 | 3-pick (Common only) | Clear Region 3+ |

### 2.5 Victory/Defeat Conditions
- **Stage Victory**: Defeat all enemies on the floor
- **Run Victory**: Clear all 5 regions sequentially (15 normal stages + 5 boss battles = 20 battles)
- **Hidden Boss**: Stage 16 "Primordial Chamber" unlocks when 3 conditions are met:
  - Clear with HP remaining ≥ 50%
  - Have cast all 6 elemental spells at least once
  - Permanent upgrade "Elemental Sense" unlocked
- **Defeat**: HP 0 → Game Over screen → Crystal tally → Title

---

## §3. Controls

### 3.1 Keyboard

| Key | Action | Call Path |
|-----|--------|-----------|
| Mouse click+drag | Gem swap (adjacent direction) | `handleSwap()` → `trySwap()` |
| 1~6 | Spell slot selection (6 types) | `handleSpellSelect(n)` → `selectSpell(n)` |
| Space | Cast selected spell | `handleCastSpell()` → `castSpell()` |
| ESC | Pause / Menu | `handlePause()` → `togglePause()` |
| Tab | Relic/Stats panel toggle | `handleTab()` → `toggleStatsPanel()` |
| Q | Element weakness chart display | `handleInfo()` → `toggleElementChart()` |
| E | End turn (no spell cast) | `handleEndTurn()` → `endPlayerTurn()` |
| H | Show hint (highlight possible match, 3s) | `handleHint()` → `showHint()` |

### 3.2 Mouse
- **Match Phase**: Click gem → Drag to adjacent gem (or click) to swap
- **Spell Phase**: Click spell in bottom spell bar → Click enemy (targeting) or auto-cast
- **Relic Selection**: Click one of 3 relic cards to select

### 3.3 Touch (Mobile)

| Touch Action | Function | Minimum Size |
|-------------|----------|-------------|
| Tap+swipe | Gem swap (swipe direction) | Gem cell: `Math.max(48, cellSize)` px |
| Tap (spell bar) | Spell selection | 56×48px each |
| Tap (enemy) | Spell target designation | Enemy hitbox: 48×48px min |
| Double tap | Cast spell | — |
| Relic card tap | Relic selection | Card: 120×160px min |
| Pause (⏸) | Pause | 48×48px |
| Hint (💡) | Show hint | 48×48px |
| End turn (⏩) | End turn | 56×48px |
| Element chart (📊) | Toggle element chart | 48×48px |

> All touch targets enforce minimum 48px via `Math.max(CONFIG.TOUCH_MIN_TARGET, calculatedSize)` pattern (F11).
> **F60 Applied**: All hit area detection unified through single `hitTest(px, py, {x, y, w, h})` function. Input branching determined by §6.2 ACTIVE_SYSTEMS matrix Input modes.

---

## §4. Visual Style Guide

### 4.1 Core Principles
- **Pure Canvas code drawing**: Zero external image files (PNG/SVG) (F1)
- **Zero external resources**: No CDN, Google Fonts, `<link>`, `<script src=>`, `@import url()` (F2)
- **Zero new Image()**: All visuals rendered directly via Canvas 2D API
- **System font stack**: `'Segoe UI', system-ui, -apple-system, sans-serif`
- **assets/ directory**: Only manifest.json + thumbnail.svg allowed. Any other SVG/PNG = build failure (F1, F61)

### 4.2 Color Palette

| Usage | Color | HEX |
|-------|-------|-----|
| Background (default) | Deep Indigo | `#0d0b1e` |
| Grid background | Dark Slate | `#1a1833` |
| Grid lines | Mid Purple | `#2d2755` |
| UI text | Light Lavender | `#e8e0f0` |
| Fire element | Crimson+Orange | `#ff4500` ~ `#ff8c00` |
| Water element | Deep Blue+Cyan | `#1e90ff` ~ `#00cfff` |
| Earth element | Emerald+Lime | `#2ecc71` ~ `#7dcea0` |
| Wind element | Silver+White | `#bdc3c7` ~ `#ecf0f1` |
| Light element | Gold+White | `#ffd700` ~ `#fffacd` |
| Dark element | Deep Purple+Magenta | `#2d1b4e` ~ `#8b008b` |
| Enemy HP bar | Green→Yellow→Red | `#2ecc71` ~ `#e74c3c` |
| Player HP | Crimson Red | `#e74c3c` |
| Mana bar | Per-element colors | Each element HEX |
| Selection highlight | Neon Cyan | `#00ffcc` |
| Combo text | Gold Glow | `#ffd700` |
| Rare relic | Royal Blue | `#4169e1` |
| Epic relic | Purple Glow | `#9b59b6` |

### 4.3 Region-Specific Backgrounds
- **Volcanic Wastes**: Bottom lava flow (sin-wave animation), top fire particles, orange vignetting
- **Abyssal Ruins**: Wave overlay (translucent blue sin-wave), bubble particles (upward), dark blue vignetting + deep-sea point lights
- **Ancient Forest**: Leaf particles (falling), background great-tree silhouettes, green vignetting + floating spores
- **Storm Skies**: Periodic lightning flash (full-screen), cloud layer scroll, purple-yellow vignetting
- **Elemental Abyss**: Screen distortion (sin-wave), 6-element particle vortex, black→purple pulsing gradient
- **Weather/Time Changes**: Background brightness progresses with floor advancement (Floor 1=dawn, 2=noon, 3=dusk, Boss=night)

### 4.4 Drawing Function Signatures (F9 — Pure Function Pattern)

```
drawGem(ctx, x, y, size, element, isSelected, glowAlpha, specialType)
drawGrid(ctx, offsetX, offsetY, cellSize, gridData, highlightCells[], hintCells[])
drawEnemy(ctx, x, y, size, enemyType, hp, maxHp, statusEffects, frame)
drawBoss(ctx, x, y, size, bossId, phase, hp, maxHp, animFrame, shield)
drawSpellEffect(ctx, x, y, w, h, spellId, element, progress, targetPos)
drawUI(ctx, canvasW, canvasH, state, mana[], hp, maxHp, comboCount)
drawRelicCard(ctx, x, y, w, h, relicData, isSelected, hoverAlpha)
drawParticle(ctx, x, y, size, color, alpha, type)
drawComboText(ctx, x, y, comboNum, scale, alpha)
drawCutscene(ctx, canvasW, canvasH, sceneId, progress, textLines[])
drawManaBar(ctx, x, y, w, h, element, current, max)
drawSpellSlot(ctx, x, y, size, spellData, isReady, cooldown, isSelected)
```

### 4.5 Boss Visuals (Large Canvas Drawing)
- **Ignis (Lava Colossus)**: 400×300px, lava-armored giant. 3 phases: armor cracking → lava eruption → core (gem-shaped) exposed
- **Aqua (Abyssal Kraken)**: 500×300px, 8 tentacles + giant eye. Independent HP per tentacle → main body weakness exposed
- **Terra (Ancient Treant)**: 400×350px, intertwined roots and branches. Root attack animation + leaf regeneration
- **Aero (Storm Phoenix)**: 450×350px, wind feathers. Wing flap + tornado effect
- **Nox (Void Sovereign)**: 500×400px, unstable 6-element hybrid form. Periodic element transformation (each phase)
- **Primordial (Hidden)**: 600×400px, glowing elemental crystal entity. Boss intro cutscene: camera zoom + 6-element explosion sequence (5s)

### 4.6 Camera Effects
- **Boss Entrance**: Zoom in (×1.5, 500ms ease-out) → Boss intro animation (1s) → Zoom out (×1.0, 300ms)
- **Region Transition**: Fade out (black, 400ms) → Background swap → Fade in (400ms)
- **Big Combo (5+)**: Camera shake (amplitude 3px, decay 200ms) + screen flash
- **Player Hit**: Red vignette flash (200ms)
- **Run Victory**: Zoom out (×0.7, 2s) + gold particle explosion

### 4.7 Gem Visuals (Canvas Procedural)
Each element gem is an octagonal base shape + element-specific inner pattern:
- **Fire**: Octagon + inner 3-pronged flame (orange→red gradient)
- **Water**: Octagon + inner water droplet (blue→cyan gradient)
- **Earth**: Octagon + inner leaf (green→emerald gradient)
- **Wind**: Octagon + inner spiral (silver→white gradient)
- **Light**: Octagon + inner 4-pointed star (gold→white gradient)
- **Dark**: Octagon + inner eye (purple→magenta gradient)

Special gems:
- **4-match created**: Gem + cross mark (white border blinking)
- **5-match created**: Rainbow gem (6-element color cycling animation)

---

## §5. Core Game Loop

### 5.1 Initialization Order (F12 — TDZ Prevention)
```
1. CONFIG constants declaration
2. Global state object (G) declaration
3. Canvas DOM assignment (canvas, ctx)
4. Utility class initialization (TweenManager, ObjectPool, SoundManager, SeededRNG)
5. Event listener registration (keyboard, mouse, touch, resize)
6. Game loop start (requestAnimationFrame)
```

### 5.2 Main Game Loop (60fps)
```
function gameLoop(timestamp) {
  const dt = Math.min(timestamp - lastTime, 33.33); // max 2-frame skip
  lastTime = timestamp;

  // 1. Input processing (inputManager.process — based on §6.2 Input modes)
  // 2. TweenManager update (F4: zero setTimeout, F13: clearImmediate)
  // 3. State-specific update — see §6.2 ACTIVE_SYSTEMS matrix
  //    - MATCH_IDLE: Awaiting gem swap, hint timer
  //    - MATCH_ANIM: Gem swap animation (tween)
  //    - MATCH_CHECK: Match detection → removal → cascade
  //    - SPELL_SELECT: Awaiting spell selection
  //    - SPELL_ANIM: Spell effect animation
  //    - ENEMY_TURN: Enemy attack animation
  //    - BOSS: Boss battle (special gem patterns + phase transitions)
  // 4. Rendering (background → grid → gems → enemies → boss → spell effects → particles → UI)
  // 5. ObjectPool cleanup (return inactive particles)

  requestAnimationFrame(gameLoop);
}
```

> **Guard Flag Pattern (F5)**: State transition tweens (combo settlement, boss defeat, etc.) must set `isTransitioning = true` guard to ensure callback fires exactly once.

> **Single Update Path (F14)**: All animated values (alpha, scale, position, etc.) are updated only through TweenManager. Never mix direct assignment with tweens.

> **SeededRNG Consistency (F64)**: All randomness (gem generation, relic selection, enemy behavior) goes through `G.rng.next()`. `Math.random` string presence in code = smoke test FAIL.

### 5.3 Code Region Guide (10 REGIONs)

| REGION | Est. Lines | Content | Future Extraction | Dependency Direction |
|--------|-----------|---------|-------------------|---------------------|
| R1: CONFIG | 1~130 | All game constants, balance values, element definitions | — | None (top-level) |
| R2: UTILS | 131~380 | TweenManager, ObjectPool, SeededRNG, SoundManager | ✅ engine.js | R1 only |
| R3: INPUT | 381~530 | InputManager (keyboard/mouse/touch unified, hitTest) | ✅ engine.js | R1, R2 |
| R4: MATCH_ENGINE | 531~830 | Gem grid, match detection, cascade, special matches | — | R1, R2 |
| R5: ENTITIES | 831~1100 | Enemy/boss data, spell definitions, relic data | — | R1 |
| R6: GAME_LOGIC | 1101~1500 | Battle management, spell casting, combo calculation, relic generation, DDA | — | R1~R5 |
| R7: PROGRESSION | 1501~1680 | Permanent upgrades, crystal tallying, localStorage management | — | R1, R2 |
| R8: RENDER | 1681~2200 | All drawing functions (§4.4 signature compliant) | — | R1 (constants only) |
| R9: UI | 2201~2550 | HUD, menus, modals, cutscenes, bilingual text | — | R1, R8 |
| R10: INIT | 2551~2800+ | DOM initialization, event registration, game loop start | — | All |

> **F63 Applied**: Dependency direction: R10→All, R6→R1~R5, R8→R1. Zero circular references. For future engine.js extraction, only R2+R3 need separation for independent operation.

---

## §6. State Machine

### 6.1 Game States (with STATE_PRIORITY) — F6

```
STATE = {
  TITLE:            0,   // Call: Title screen display
  DIFFICULTY_SELECT: 1,  // Call: Difficulty selection UI
  REGION_INTRO:     2,   // Call: Region entry cutscene (path: startRegion() → beginTransition)
  MATCH_IDLE:       3,   // Call: Gem swap idle state (core gameplay)
  MATCH_ANIM:       4,   // Call: Gem movement animation (path: trySwap → tween)
  MATCH_CHECK:      5,   // Call: Match detection + removal + gravity + cascade repeat
  COMBO_DISPLAY:    6,   // Call: Combo result display (mana generation effect)
  SPELL_SELECT:     7,   // Call: Spell selection/casting wait
  SPELL_ANIM:       8,   // Call: Spell effect animation
  ENEMY_TURN:       9,   // Call: Enemy attack turn
  BOSS_INTRO:      10,   // Call: Boss entrance cutscene
  BOSS_BATTLE:     11,   // Call: Boss battle (special mode of match+spell)
  STAGE_CLEAR:     12,   // Call: Stage clear animation
  RELIC_SELECT:    13,   // Call: Relic 3-pick selection
  BOSS_DEFEAT:     14,   // Call: Boss defeat animation
  REGION_CLEAR:    15,   // Call: Region clear rewards
  GAMEOVER:        16,   // Call: HP 0 (path: enemyAttack() when hp <= 0)
  VICTORY:         17,   // Call: Final victory
  HIDDEN_INTRO:    18,   // Call: Hidden boss entry conditions met
  HIDDEN_BOSS:     19,   // Call: Hidden boss battle
  TRUE_ENDING:     20,   // Call: True ending after hidden boss defeat
  PAUSE:           21,   // Call: ESC input (previous state saved)
  CONFIRM_MODAL:   22,   // Call: "Return to title?" confirmation
}

// STATE_PRIORITY: Higher = more priority.
// Call path: Inside beginTransition(targetState)
//   if (STATE_PRIORITY[targetState] < STATE_PRIORITY[G.state]) return;
STATE_PRIORITY = {
  GAMEOVER: 100, VICTORY: 95, TRUE_ENDING: 99,
  BOSS_DEFEAT: 80, STAGE_CLEAR: 60,
  BOSS_INTRO: 50, REGION_INTRO: 40,
  default: 0
}
```

> **F56 Applied**: All STATE_PRIORITY values are referenced in `beginTransition()` (R6: GAME_LOGIC). No unreferenced constants exist.

### 6.2 State × System ACTIVE_SYSTEMS Matrix (F7) — 23 States × 13 Systems

| State | Tween | Input | Grid | Match | Enemy | Boss | Spell | Particle | UI | Sound | Camera | Combo | DDA |
|-------|-------|-------|------|-------|-------|------|-------|----------|-----|-------|--------|-------|-----|
| TITLE | ✅ | menu | — | — | — | — | — | bg | ✅ | bgm | — | — | — |
| DIFFICULTY_SELECT | ✅ | menu | — | — | — | — | — | bg | ✅ | — | — | — | — |
| REGION_INTRO | ✅ | skip | — | — | — | — | — | ✅ | ✅ | bgm | zoom | — | — |
| MATCH_IDLE | ✅ | match | ✅ | idle | info | — | — | bg | ✅ | sfx | — | — | — |
| MATCH_ANIM | ✅ | — | ✅ | anim | info | — | — | bg | ✅ | sfx | — | — | — |
| MATCH_CHECK | ✅ | — | ✅ | check | info | — | — | ✅ | ✅ | sfx | — | count | — |
| COMBO_DISPLAY | ✅ | — | ✅ | — | info | — | — | ✅ | ✅ | sfx | shake | display | — |
| SPELL_SELECT | ✅ | spell | ✅ | — | info | — | select | bg | ✅ | sfx | — | — | — |
| SPELL_ANIM | ✅ | — | — | — | target | — | anim | ✅ | ✅ | sfx | shake | — | — |
| ENEMY_TURN | ✅ | — | — | — | attack | — | — | ✅ | ✅ | sfx | shake | — | check |
| BOSS_INTRO | ✅ | skip | — | — | — | intro | — | ✅ | ✅ | boss | zoom | — | — |
| BOSS_BATTLE | ✅ | match | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | boss | shake | ✅ | ✅ |
| STAGE_CLEAR | ✅ | — | — | — | — | — | — | ✅ | ✅ | sfx | — | — | — |
| RELIC_SELECT | ✅ | relic | — | — | — | — | — | bg | ✅ | sfx | — | — | — |
| BOSS_DEFEAT | ✅ | — | — | — | — | death | — | ✅ | ✅ | boss | zoom | — | — |
| REGION_CLEAR | ✅ | — | — | — | — | — | — | ✅ | ✅ | sfx | — | — | — |
| GAMEOVER | ✅ | menu | — | — | — | — | — | — | ✅ | sfx | — | — | — |
| VICTORY | ✅ | menu | — | — | — | — | — | ✅ | ✅ | bgm | zoom | — | — |
| HIDDEN_INTRO | ✅ | skip | — | — | — | intro | — | ✅ | ✅ | boss | zoom | — | — |
| HIDDEN_BOSS | ✅ | match | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | boss | shake | ✅ | ✅ |
| TRUE_ENDING | ✅ | menu | — | — | — | — | — | ✅ | ✅ | bgm | pan | — | — |
| PAUSE | ✅ | pause | — | — | — | — | — | — | ✅ | — | — | — | — |
| CONFIRM_MODAL | ✅ | modal | — | — | — | — | — | — | ✅ | — | — | — | — |

> **Tween ✅ in CONFIRM_MODAL**: Cycle 2 B1 lesson. Tween update required for modal alpha animation.
> **Input Mode Granularity (F60)**: 7 modes (menu/skip/match/spell/relic/pause/modal) clearly separate inputs per state.

### 6.3 RESTART_ALLOWED Whitelist

```javascript
const RESTART_ALLOWED = {
  [STATE.GAMEOVER]: [STATE.TITLE, STATE.DIFFICULTY_SELECT],
  [STATE.VICTORY]: [STATE.TITLE],
  [STATE.TRUE_ENDING]: [STATE.TITLE],
  [STATE.PAUSE]: [STATE.TITLE], // via CONFIRM_MODAL
  [STATE.TITLE]: [STATE.DIFFICULTY_SELECT],
};
// Call path: Verified inside beginTransition(target)
// if (!RESTART_ALLOWED[G.state]?.includes(target)) return;
```

### 6.4 Canvas Modal (F3)
- No `confirm()`/`alert()` — iframe compatibility
- "Return to title?" → Canvas-based modal (translucent overlay + "Yes/No" buttons)
- Modal buttons also ensure 48px minimum touch target

---

## §7. Core Mechanics Detail

### 7.1 Match-3 Engine

#### 7.1.1 Gem Grid
- 8×8 grid, 6 element gem types + 2 special gem types (4-match created, 5-match created)
- Initial board generation ensures no 3-matches exist via SeededRNG placement
- After gem removal, new gems fall from top with gravity (tween animation)

#### 7.1.2 Match Detection Algorithm
```
1. Execute gem swap
2. Full grid scan:
   - Detect 3+ consecutive same-element gems horizontally/vertically
   - Priority: 5-match → T-match → L-match → 4-match → 3-match
3. Remove matched gems + generate mana + increment combo counter
4. Gravity fall: Gems above empty cells move down (tween)
5. New gem generation (SeededRNG): Random element gems in top empty cells
6. Return to step 2 → If no matches, cascade ends
7. Display combo result + mana settlement
```

#### 7.1.3 Special Gem Creation
- **4-match → Cross Gem**: Creates gem with cross mark of that element. When matched, explodes in cross direction
- **5-match → Rainbow Gem**: Creates rainbow cycling gem. When swapped with any gem, removes all gems of that element
- **L/T-match**: Immediate area explosion (no gem creation)

#### 7.1.4 Hint System
- After 5 seconds of no input, highlight one possible match (gem sparkle for 3s)
- H key or 💡 button for manual hint request
- If no possible matches exist, auto-shuffle board (SeededRNG)

### 7.2 Spell System

6 elements × 3 tiers = 18 spells:

| Element | Basic Spell (3 Mana) | Intermediate Spell (6 Mana) | Advanced Spell (10 Mana) |
|---------|---------------------|---------------------------|-------------------------|
| Fire | Fireball: Single 120 DMG | Firestorm: All 80 DMG | Meteor: All 200 DMG + DoT 3 turns |
| Water | Water Bolt: Single 100 DMG + Heal 30 | Tidal Wave: All 70 DMG + Slow 2 turns | Deluge: All 180 DMG + +3 Water gems on grid |
| Earth | Rock Shield: Defense +50% (2 turns) | Earthquake: All 90 DMG + Stun 1 turn | Earth's Fury: All 220 DMG + Armor Break |
| Wind | Wind Slash: Single 110 DMG + Dodge +20% | Tornado: All 75 DMG + Board Shuffle | Eye of Storm: All 190 DMG + 2-turn Invincibility |
| Light | Holy Ray: Single 130 DMG (Dark ×2) | Purify: Remove all debuffs + Heal 80 | Sacred Light: All 250 DMG (Dark ×2) + Heal 100 |
| Dark | Shadow Strike: Single 140 DMG (Light ×2) | Curse: All DoT 5 turns (30/turn) | Abyssal Embrace: All 200 DMG + Enemy ATK -50% 3 turns |

> Spell Unlocks: Basic spells available from start. Intermediate unlocked at "Spell Research Lv2" upgrade. Advanced at "Spell Research Lv3."

### 7.3 Element Weakness Cycle

```
Fire → Earth (×1.5) → Wind (×1.5) → Water (×1.5) → Fire (cycle)
Light ↔ Dark (mutual ×2.0)
```

- Advantageous: Damage ×1.5
- Disadvantageous: Damage ×0.7
- Neutral: Damage ×1.0
- Light/Dark mutual: Damage ×2.0

### 7.4 Enemy Types

| Enemy Type | HP Mult. | ATK | Trait |
|-----------|----------|-----|-------|
| Grunt | ×1.0 | 10 | None |
| Rusher | ×0.6 | 15 | Attacks twice every 2 turns |
| Tank | ×2.5 | 8 | 50% physical damage reduction |
| Caster | ×0.8 | 20 | Elemental attack (ignores player resistance) |
| Healer | ×1.0 | 5 | Heals allies 10% HP per turn |

### 7.5 Boss Battle Details

#### Ignis (Lava Colossus) — Region 1 Boss
```
Phase 1 (HP 100%~60%): Basic attack 25 DMG + Converts 3 Fire gems to Lava gems (unmatchable, reverts after 3 turns)
Phase 2 (HP 60%~30%): Lava Eruption — All 40 DMG + Bottom 2 rows become Lava gems
Phase 3 (HP 30%~0%): Core Exposed — Weakness: Water spells ×2.0 bonus. Self-heals 20/turn
Weakness Pattern: Water gem 5-match exposes weakness (2 turns of ×3.0 damage taken)
```

#### Aqua (Abyssal Kraken) — Region 2 Boss
```
Phase 1 (Tentacles 4/4): Each tentacle HP 200, 2 tentacles attack per turn (15 DMG each)
Phase 2 (Tentacles 0/4): Main body exposed. Ink — 50% of board darkened (hidden for 5 turns)
Phase 3 (HP 40%~0%): Deep Vortex — Random gem shuffle every turn
Weakness Pattern: Wind gem 4+ match clears ink + exposes weakness
```

#### Terra (Ancient Treant) — Region 3 Boss
```
Phase 1 (HP 100%~50%): Root attack 20 DMG + 4 Root gems on board (obstacles, destructible)
Phase 2 (HP 50%~0%): Regeneration — 5% HP recovery per turn. Obstacles increase to 6
Weakness Pattern: Fire gem matches instantly destroy Root obstacles + bonus damage
```

#### Aero (Storm Phoenix) — Region 4 Boss
```
Phase 1 (HP 100%~60%): Whirlwind — Randomly swaps 3 gem positions (each turn)
Phase 2 (HP 60%~20%): Storm Barrier — 50% damage reduction + 30% reflect
Phase 3 (HP 20%~0%): Rebirth Prep — Must defeat within 3 turns or HP restores 30%
Weakness Pattern: Earth L/T-match disables Storm Barrier (2 turns)
```

#### Nox (Void Sovereign) — Region 5 Boss
```
Phase 1 (HP 100%~70%): Element Shift — Changes own element every 2 turns (weakness keeps changing)
Phase 2 (HP 70%~40%): Void Erosion — 6 edge gems darken each turn
Phase 3 (HP 40%~0%): Dimension Warp — 20% chance matched mana goes to wrong element
Weakness Pattern: Light gem 5-match "Purify" clears all darkened gems + fixes element for 2 turns
```

#### Primordial (Hidden Boss)
```
Phase 1 (HP 100%~75%): 6-Element Cycle — Changes element each turn, removes all gems of that element
Phase 2 (HP 75%~50%): Elemental Rampage — Uses 2 elements simultaneously. Board limited to those elements only
Phase 3 (HP 50%~25%): Primordial Power — Spell mana costs ×2. Only 2+ combos generate mana
Phase 4 (HP 25%~0%): Elemental Harmony — Only rainbow gem (5-match) deals damage
Weakness Pattern: Holding 3+ mana of all 6 elements simultaneously triggers "Harmony Strike" (10% max HP fixed damage)
```

### 7.6 Relic System (Roguelike)

3 relic cards presented after stage clear, pick 1:

| Tier | Probability | Relic List |
|------|------------|-----------|
| Common (White) | 60% | ① Mana Amplifier: +1 mana per match ② Elemental Affinity: +15% damage for specific element ③ Vitality: +20 HP at battle start ④ Combo Bonus: +0.1 combo multiplier ⑤ Gem Luck: +10% specific element gem spawn rate ⑥ Fortification: -10% damage taken |
| Rare (Blue) | 30% | ⑦ Chain Lightning: 3+ combo triggers 50 fixed damage to random enemy ⑧ Transmute: Convert 2 gems to desired element at turn start ⑨ Spell Discount: Spell mana cost -2 ⑩ Regeneration Aura: +8 HP per turn |
| Epic (Purple) | 10% | ⑪ Cascade Master: Cascade-generated gems have +30% match probability ⑫ Elemental Harmony: 3+ simultaneous element matches = total damage ×1.5 ⑬ Sands of Time: Free spell cast every 5 turns |

> **F62 Applied — Relic Caps**: Same relic max 2 stacks. DPS multiplier cap = 200% (vs base). Synergy multiplier cap = 150%. Relics exceeding cap are excluded from selection pool.

---

## §8. Difficulty System / Balance

### 8.1 Stage Balance Tables (3 Segments)

#### Early Game (Regions 1~2, Stages 1~8)

| Stage | Enemy Composition | Enemy HP (Mage) | Enemy ATK | Turn Limit | Crystal Reward |
|-------|------------------|----------------|-----------|------------|---------------|
| 1-1 | Grunt ×3 | 80 | 8 | None | 5 |
| 1-2 | Grunt ×2 + Rusher ×1 | 100 | 10 | None | 7 |
| 1-3 | Grunt ×2 + Tank ×1 | 120 | 10 | None | 10 |
| Boss 1 | Ignis | 800 | 25~40 | 30 turns | 25 |
| 2-1 | Grunt ×3 + Caster ×1 | 140 | 12 | None | 12 |
| 2-2 | Rusher ×2 + Healer ×1 | 160 | 14 | None | 15 |
| 2-3 | Grunt ×2 + Tank ×1 + Caster ×1 | 180 | 15 | None | 18 |
| Boss 2 | Aqua | 1200 (tentacles 200×4 + body 400) | 15~30 | 35 turns | 35 |

#### Mid Game (Regions 3~4, Stages 9~16)

| Stage | Enemy Composition | Enemy HP | Enemy ATK | Turn Limit | Crystal Reward |
|-------|------------------|---------|-----------|------------|---------------|
| 3-1 | Grunt ×3 + Healer ×1 + Caster ×1 | 220 | 16 | None | 20 |
| 3-2 | Tank ×2 + Caster ×2 | 260 | 18 | None | 22 |
| 3-3 | Grunt ×2 + Rusher ×2 + Healer ×1 | 300 | 18 | None | 25 |
| Boss 3 | Terra | 1500 | 20~35 | 35 turns | 45 |
| 4-1 | Caster ×2 + Healer ×1 + Tank ×1 | 350 | 20 | None | 28 |
| 4-2 | Rusher ×3 + Caster ×2 | 400 | 22 | None | 30 |
| 4-3 | All types mixed ×5 | 450 | 22 | None | 35 |
| Boss 4 | Aero | 2000 | 25~45 | 40 turns | 55 |

#### Late Game (Region 5 + Hidden, Stages 17~21)

| Stage | Enemy Composition | Enemy HP | Enemy ATK | Turn Limit | Crystal Reward |
|-------|------------------|---------|-----------|------------|---------------|
| 5-1 | All types mixed ×5 + Special | 550 | 25 | None | 40 |
| 5-2 | All types mixed ×6 | 650 | 28 | None | 45 |
| 5-3 | All types mixed ×6 + Elite | 750 | 30 | None | 50 |
| Boss 5 | Nox | 2500 | 30~55 | 45 turns | 70 |
| Hidden | Primordial | 4000 | 40~70 | 60 turns | 150 |

### 8.2 DPS/EHP Balance Formulas

```
■ Player DPS (expected damage per turn):
  baseDPS = avgMatchDmg × avgComboMultiplier + spellDPS
  avgMatchDmg = avgMatchCount × elementDmg × matchBonus
  - avgMatchCount ≈ 1.8 (based on 3-match average statistics)
  - elementDmg = CONFIG.BASE_MATCH_DMG × elementMultiplier
  - matchBonus = 1.0 (3-match) / 1.5 (4-match) / 2.5 (5-match)
  avgComboMultiplier ≈ 1.3 (average 1.6 combos)
  spellDPS = spellDmg / spellCooldown (cooldown = turns to accumulate mana)

  Apprentice: baseDPS × 1.0 (relic bonus assumption +30% → final ≈ baseDPS × 1.3)
  Mage: baseDPS × 1.0 (relic bonus assumption +20% → final ≈ baseDPS × 1.2)
  Archmage: baseDPS × 1.0 (common relics only → final ≈ baseDPS × 1.1)

■ Enemy EHP (effective health):
  EHP = HP / (1 - damageReduction)
  - damageReduction = defense/armor (Tank 50%, others 0%)
  - Boss EHP = bossHP / (1 - phaseReduction)

■ Clearability Verification:
  expectedTurns = totalEnemyEHP / playerDPS
  expectedTurns < turnLimit × 0.8 → Balance OK
  expectedTurns > turnLimit × 0.9 → DDA triggers

■ DDA Fallback (when assumptions are wrong):
  - 3 consecutive turns with 0 combos → Auto-activate hint + Adjust gem placement favorably
  - HP ≤ 30% AND boss HP ≥ 50% → Boss ATK -20%
  - 5 consecutive turns with no damage dealt → Enemy HP -5% (hidden "elemental erosion" effect)

■ Assumptions:
  - Average match success rate: Apprentice 95%, Mage 80%, Archmage 65%
  - Average combo count: Apprentice 1.8, Mage 1.6, Archmage 1.3
  - Weakness accuracy: 60% (correct element spell usage rate)
  - ⚠️ When assumptions are wrong, DDA fallback corrects in 3 stages
```

> **Relic Caps (F62)**: DPS multiplier cap 200%, synergy cap 150%. Even with 3 consecutive Epic picks, final DPS = baseDPS × 2.0 ceiling.

---

## §9. Boss Phase Diagrams (ASCII)

### 9.1 Ignis (3 Phases)
```
[Phase 1: 100%~60%] ──HP 60%──> [Phase 2: 60%~30%] ──HP 30%──> [Phase 3: 30%~0%]
  │ Basic ATK 25          │ Lava Eruption 40(all)   │ Self-heal 20/turn
  │ Lava gem convert ×3   │ Bottom 2 rows lava      │ Weakness: Water ×2
  └─ Weakness: Water 5-match └─ Weakness: Water 5-match └─ Weakness: Water ×3
     → 2-turn ×3 damage       → 2-turn ×3 damage        (exposed state)
```

### 9.2 Aqua (3 Phases)
```
[Phase 1: 4/4 tentacles] ──0 left──> [Phase 2: Body] ──HP 40%──> [Phase 3: Vortex]
  │ Tentacle ATK 15×2     │ Ink 50% board dark       │ Board shuffle/turn
  │ Tentacle HP 200 each   │ Body HP 400              │ Remaining HP
  └─ Weakness: Wind 4-match └─ Weakness: Wind 4-match  └─ Weakness: Light spell
     → Hit 2 tentacles         → Clear ink + ×2           → Nullify shuffle 2t
```

### 9.3 Terra (2 Phases)
```
[Phase 1: 100%~50%] ──HP 50%──> [Phase 2: Regen]
  │ Root ATK 20                  │ Regen 5%/turn + 6 obstacles
  │ 4 obstacles                  │
  └─ Weakness: Fire → root destroy └─ Weakness: Fire → stop regen 2t
```

### 9.4 Aero (3 Phases)
```
[Phase 1: 100%~60%] ──HP 60%──> [Phase 2: 60%~20%] ──HP 20%──> [Phase 3: Rebirth]
  │ Gem swap ×3 per turn  │ Storm Barrier -50%+reflect │ 3-turn limit! Fail→HP+30%
  └─ Earth L/T-match       └─ Earth L/T-match           └─ Focus attack
     → Nullify swap 2t        → Disable barrier 2t
```

### 9.5 Nox (3 Phases)
```
[Phase 1: 100%~70%] ──HP 70%──> [Phase 2: 70%~40%] ──HP 40%──> [Phase 3: Warp]
  │ Element shift (2t cycle) │ Edge darken ×6/turn     │ Mana error 20%
  └─ Track weakness          └─ Light 5-match→clear all └─ Light 5-match→fix elem
```

### 9.6 Primordial (Hidden, 4 Phases)
```
[P1: 100%~75%] ──> [P2: 75%~50%] ──> [P3: 50%~25%] ──> [P4: 25%~0%]
  │ 6-elem cycle    │ 2 elements        │ Mana cost ×2    │ Rainbow only
  │ Remove gems     │ Board limited     │ 2+ combo needed │ Harmony Strike
  └─ Track element  └─ Multi-strategy   └─ Max efficiency └─ 6-elem reserve
```

---

## §10. Scoring System

### 10.1 Scoring Elements

| Action | Points |
|--------|--------|
| 3-match | 100 |
| 4-match | 300 |
| 5-match | 800 |
| L-match | 500 |
| T-match | 600 |
| Combo bonus | Match points × (combo count × 0.5) |
| Spell cast | Spell tier × 50 (Basic 50, Mid 100, Advanced 150) |
| Enemy defeat | By type (Grunt 200, Tank 500, Boss 5000) |
| Weakness bonus | ×1.3 when using advantageous element |
| Turn bonus | Remaining turns × 100 (boss battles only) |
| No-hit bonus | ×1.5 for flawless stage clear |

### 10.2 Grade System

| Grade | Condition | Reward Multiplier |
|-------|-----------|------------------|
| S | No-hit + Clear within 30 turns | ×2.0 |
| A | No-hit OR within 35 turns | ×1.5 |
| B | HP remaining ≥ 50% | ×1.2 |
| C | Cleared | ×1.0 |

---

## §11. Permanent Progression System

### 11.1 Elemental Crystals (Permanent Currency)
- Earned from stage clears, boss defeats, grade bonuses
- On game over: **Judge first → Save after** (F8): Calculate crystal count before saving

### 11.2 Three Upgrade Trees

#### Offense Tree
| Lv | Name | Cost | Effect |
|----|------|------|--------|
| 1 | Mana Amplification I | 50 | +1 mana per match |
| 2 | Elemental Enhancement I | 100 | +10% all element damage |
| 3 | Combo Master I | 200 | +0.2 combo multiplier |
| 4 | Spell Research Lv2 | 350 | Unlock intermediate spells |
| 5 | Elemental Enhancement II | 500 | +20% all element damage |
| 6 | Spell Research Lv3 | 800 | Unlock advanced spells |

#### Defense Tree
| Lv | Name | Cost | Effect |
|----|------|------|--------|
| 1 | Vitality I | 50 | +20 max HP |
| 2 | Elemental Armor I | 100 | -10% damage taken |
| 3 | Regeneration | 200 | +3 HP per turn |
| 4 | Vitality II | 350 | +30 max HP |
| 5 | Elemental Armor II | 500 | -20% damage taken |
| 6 | Undying Will | 800 | Revive once at 30% HP when HP reaches 0 |

#### Utility Tree
| Lv | Name | Cost | Effect |
|----|------|------|--------|
| 1 | Gem Insight | 50 | -50% hint cooldown |
| 2 | Lucky Eye | 100 | +10% Rare relic probability |
| 3 | Elemental Sense | 200 | Auto-display boss weaknesses + Hidden boss unlock condition |
| 4 | Gem Attunement | 350 | Convert 1 gem to desired element at turn start (touch to select) |
| 5 | Epic Destiny | 500 | +5% Epic relic probability |
| 6 | Time Mastery | 800 | +10 turn limit in boss battles |

### 11.3 localStorage Data Schema

```javascript
const SAVE_KEY = 'elemental-cascade-save';
const SAVE_SCHEMA = {
  version: 1,
  crystals: 0,              // Elemental Crystals (permanent currency)
  upgrades: {
    offense: 0,              // Offense tree level (0~6)
    defense: 0,              // Defense tree level (0~6)
    utility: 0,              // Utility tree level (0~6)
  },
  bestScore: 0,              // High score
  bestRegion: 0,             // Furthest region reached (0~5, 6=hidden)
  totalRuns: 0,              // Total runs
  totalClears: 0,            // Clear count
  hiddenUnlocked: false,     // Hidden boss unlocked
  trueEndingSeen: false,     // True ending seen
  language: 'ko',            // Language setting (ko/en)
  difficulty: 1,             // Last selected difficulty (0/1/2)
  soundEnabled: true,
  musicEnabled: true,
};
// Migration: On version mismatch, initialize to defaults + preserve crystals/upgrades
```

---

## §12. Sound Design (Web Audio API)

### 12.1 BGM (Procedurally Generated)
| Track | Usage | Style |
|-------|-------|-------|
| title_bgm | Title screen | Gentle arpeggio + mystical pad |
| dungeon_bgm | Normal battles | Tense minimal rhythm + element-specific variations |
| boss_bgm | Boss battles | Intense drums + ascending melody |
| victory_bgm | Victory/Clear | Bright fanfare + chord progression |

### 12.2 Sound Effects (8+)
| SFX | Trigger | Description |
|-----|---------|-------------|
| gem_swap | Gem swap | Short crystal click |
| match_3 | 3-match | Soft pop |
| match_4 | 4-match | Sharp crash |
| match_5 | 5-match | Grand explosion |
| combo | Combo chain | Ascending pitch chime (combo × 100Hz) |
| spell_cast | Spell cast | Different timbre per element |
| enemy_hit | Enemy hit | Dull impact |
| boss_phase | Boss phase change | Warning alarm + drum roll |
| player_hit | Player hit | Sharp warning tone |
| relic_pick | Relic selection | Tier-specific fanfare (Common/Rare/Epic) |

---

## §13. Bilingual Support (Korean/English)

```javascript
const LANG = {
  ko: {
    title: '엘리멘탈 캐스케이드',
    subtitle: '원소 매치 전략 RPG',
    start: '게임 시작',
    difficulty: ['수습', '마법사', '대마법사'],
    elements: ['화염', '물결', '대지', '바람', '빛', '암흑'],
    regions: ['화산 지대', '심해 유적', '태고의 숲', '뇌운 하늘', '원소 심연'],
    // ... (full text)
  },
  en: {
    title: 'Elemental Cascade',
    subtitle: 'Elemental Match Strategy RPG',
    start: 'Start Game',
    difficulty: ['Apprentice', 'Mage', 'Archmage'],
    elements: ['Fire', 'Water', 'Earth', 'Wind', 'Light', 'Dark'],
    regions: ['Volcanic Wastes', 'Abyssal Ruins', 'Ancient Forest', 'Storm Skies', 'Elemental Abyss'],
    // ... (full text)
  }
};
```

---

## §14. Verification Checklists

### 14.1 Numerical Consistency Table (F10)

| Spec Item | Section | CONFIG Constant | Value |
|-----------|---------|----------------|-------|
| Grid size | §7.1 | GRID_SIZE | 8 |
| Element count | §2.1 | ELEMENT_COUNT | 6 |
| 3-match mana | §2.2 | MATCH_3_MANA | 3 |
| 4-match mana | §2.2 | MATCH_4_MANA | 5 |
| 5-match mana | §2.2 | MATCH_5_MANA | 8 |
| Combo multiplier step | §2.1 | COMBO_MULTIPLIER_STEP | 0.5 |
| Apprentice HP | §2.4 | DIFFICULTY_HP[0] | 150 |
| Mage HP | §2.4 | DIFFICULTY_HP[1] | 100 |
| Archmage HP | §2.4 | DIFFICULTY_HP[2] | 70 |
| Advantage multiplier | §7.3 | ELEMENT_STRONG | 1.5 |
| Disadvantage multiplier | §7.3 | ELEMENT_WEAK | 0.7 |
| Light/Dark mutual | §7.3 | ELEMENT_DUAL | 2.0 |
| DPS cap | §8.2 | DPS_CAP_MULTIPLIER | 2.0 |
| Synergy cap | §8.2 | SYNERGY_CAP_MULTIPLIER | 1.5 |
| Touch min target | §3.3 | TOUCH_MIN_TARGET | 48 |
| Hint timer | §7.1.4 | HINT_DELAY_MS | 5000 |
| DDA combo fail streak | §8.2 | DDA_COMBO_FAIL_STREAK | 3 |
| DDA HP threshold | §8.2 | DDA_HP_THRESHOLD | 0.3 |

### 14.2 Code Hygiene Checklist (F60)

- [ ] All `hitTest()` calls go through single function `hitTest(px, py, {x, y, w, h})`
- [ ] ACTIVE_SYSTEMS matrix Input modes correspond 1:1 with code input branching
- [ ] All STATE_PRIORITY values are referenced inside `beginTransition()` (zero dead code)
- [ ] All declared CONFIG constants are referenced at least once in code
- [ ] All drawing functions comply with §4.4 signatures (zero direct global variable references)
- [ ] SeededRNG: `Math.random` string count = 0 (F64)
- [ ] Relic cap logic verified in `applyRelic()` function (DPS_CAP, SYNERGY_CAP)

### 14.3 Smoke Test Gate (13 Items) — F15, F61

| # | Verification Item | Type | Criterion |
|---|------------------|------|-----------|
| 1 | assets/ directory contains only manifest.json + thumbnail.svg | FAIL | 0 other files |
| 2 | Single index.html file runs standalone | FAIL | Local double-click launch |
| 3 | Zero external CDN/scripts/fonts | FAIL | 0 `<link>`, `<script src>`, `@import url` |
| 4 | Zero new Image() | FAIL | Code string search |
| 5 | Zero setTimeout / setInterval | FAIL | tween onComplete only |
| 6 | Zero alert() / confirm() / prompt() | FAIL | Canvas modal only |
| 7 | RESTART_ALLOWED whitelist operational | FAIL | GAMEOVER→TITLE transition works |
| 8 | Touch target minimum 48px verified (3+ samples) | FAIL | Math.max pattern |
| 9 | Bilingual toggle works (ko↔en) | WARN | No text corruption |
| 10 | Boss battle entry/defeat possible (Region 1 boss) | FAIL | Defeatable within 30 turns |
| 11 | localStorage save/load functional | WARN | Crystals/upgrades preserved |
| 12 | Zero Math.random strings | FAIL | SeededRNG consistency (F64) |
| 13 | Viewport 320/480/768/1024px no layout breakage | WARN | Grid+UI visibility |

### 14.4 Auto-Verification Two-Tier (FAIL/WARN)

```
■ FAIL (mandatory — submission blocked if any fail):
  #1 assets/ files: find assets/ -not -name 'manifest.json' -not -name 'thumbnail.svg' | wc -l === 0
  #3 External resources: grep -c '<link\|<script src\|@import url' index.html === 0
  #4 new Image: grep -c 'new Image' index.html === 0
  #5 setTimeout: grep -c 'setTimeout\|setInterval' index.html === 0
  #6 alert/confirm: grep -c 'alert(\|confirm(\|prompt(' index.html === 0
  #12 Math.random: grep -c 'Math.random' index.html === 0

■ WARN (advisory — comment residuals, etc.):
  - 'Google Fonts' string: grep -c 'Google Fonts' index.html === 0
  - 'CDN' string: grep -c 'CDN' index.html === 0
  - Unused variables: (manual check post-implementation)
```

---

## §15. Game Page Metadata (Sidebar)

```yaml
game:
  title: "Elemental Cascade"
  description: "A match-3 roguelike RPG where you match 6-element gems and cast spells to conquer sealed dungeons. 5 regions, 7 bosses, 18 spells, 13 relics — forge a unique strategy every run!"
  genre: ["puzzle", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "Mouse drag: Swap gems"
    - "1~6: Select spell slot"
    - "Space: Cast spell"
    - "H: Hint"
    - "ESC: Pause"
    - "Touch: Swipe to swap gems"
  tags:
    - "#match3"
    - "#RPG"
    - "#roguelike"
    - "#puzzlestrategy"
    - "#elementalmagic"
    - "#bossbattle"
    - "#turnbased"
  addedAt: "2026-03-23"
  version: "1.0.0"
  featured: true
```

---

## §16. Thumbnail SVG Guide

- **Composition**: Captures the moment of cascading gems (chain fall) on an 8×8 gem grid. Boss (Ignis) silhouette at top, mage character silhouette at bottom.
- **Colors**: 6 element colors distributed evenly. Background deep indigo (`#0d0b1e`) + gem glow effects.
- **Size**: 400×300px (4:3), 20KB+
- **Text**: "ELEMENTAL CASCADE" in top arc arrangement, gold glow effect

---

## §17. Previous Cycle Pain Points Resolution Detail

| # | Cycle 26 Pain Point | This Spec's Resolution | Resolution Section | Verification Criteria |
|---|--------------------|-----------------------|-------------------|---------------------|
| 1 | 2 P1 issues (hit area offset, dual branching) | hitTest() single function + Input mode granularity | §3.3, §6.2 | P1 residual = 0 |
| 2 | 8 illegal SVG assets reappeared | FAIL gate #1 top priority + pre-coding check | §4.1, §14.3 | Round 1 violations = 0 |
| 3 | Balance verification impossible | DPS/EHP formulas + relic caps 200%/150% + DDA 3-stage | §8.2 | Extreme builds clearable |
| 4 | Shared engine not extracted | 10 REGION + dependency directions (0 circular refs) | §5.3 | R2+R3 independently extractable |
| 5 | Math.random() contamination | Smoke test FAIL gate #12 | §14.3 | String count = 0 |

---

## §18. Estimated Code Volume

| Component | Est. Lines |
|-----------|-----------|
| CONFIG + Constants | ~130 |
| UTILS (Tween/Pool/RNG/Sound) | ~250 |
| INPUT (Keyboard/Mouse/Touch) | ~150 |
| MATCH_ENGINE (Gems/Matching/Cascade) | ~300 |
| ENTITIES (Enemies/Bosses/Spells/Relics) | ~270 |
| GAME_LOGIC (Combat/Combo/Relics/DDA) | ~400 |
| PROGRESSION (Upgrades/Save) | ~180 |
| RENDER (All drawing) | ~520 |
| UI (HUD/Menus/Modals/Cutscenes/i18n) | ~350 |
| INIT (DOM/Events/Loop) | ~250 |
| **Total** | **~2,800 lines** |

> Asset count: 20~25 procedural drawings (6 element gems + 2 special gems + 7 bosses + 5 enemies + 5 region backgrounds = 25). All Canvas code drawings — zero external files.

---

_This document is the detailed design specification for InfiniTriX platform Cycle #27 game "Elemental Cascade."_
_Created: 2026-03-23_
