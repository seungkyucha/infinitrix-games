---
game-id: dune-chronicle
title: Dune Chronicle
genre: puzzle, casual
difficulty: medium
---

# Dune Chronicle — Cycle #42 Game Design Document

> **One-Page Summary**: A **desert civilization match-3 roguelite** where players explore ruins of the ancient desert kingdom 'Arkhnar', defeat guardians through match-3 puzzle combat, and restore the lost Codex Prophecy. Core loop: Ruin Exploration (map movement, events) → Match-3 Battle (6×6 board, 4 elements) → Rewards (resources/relics/scrolls). Puzzle Quest's match-3 combat + Slay the Spire's roguelite choices + Monument Valley's ancient civilization aesthetic. 5 zones (Oasis Village / Sandstorm Wastes / Ancient Pyramid / Lava Canyon / Mummy Pharaoh's Tomb) × 3 stages = 15 main + 2 hidden = **17 total stages**. 3 bosses (Scorpion Queen / Sand Golem / Mummy Pharaoh) + 3-axis × 5-level upgrades + 13 relics + DDA 4 tiers + 4 weather types. **Resolves puzzle+casual 11-cycle gap + platform-first desert ancient civilization theme.**

> **MVP Boundary**: **Phase 1** (Core loop: exploration→match-3 battle→rewards→upgrades, Zones 1~3 (Oasis/Sandstorm/Pyramid) + 2 bosses (Scorpion Queen/Sand Golem) + Upgrade Lv1~3 + 9 relics (5 common + 4 rare) + DDA 4 tiers + basic narrative + 2 weather types (Sandstorm/Desert Heat) + bilingual (ko/en)) → **Phase 2** (Zones 4~5 (Lava Canyon/Mummy Tomb) + 1 boss (Mummy Pharaoh) + 2 hidden stages + Upgrade Lv4~5 + 4 epic relics + full 4 weather types + camera zoom/pan effects + complete narrative). **Phase 1 must deliver a complete match-3 roguelite experience.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅

| ID | Lesson Summary | Applied Section |
|----|---------------|----------------|
| F1 | assets/ directory preserved — Gemini API PNG assets + manifest.json dynamic loading [Cycle 39+] | §4.1, §8 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas-based modals [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] | §5.2 |
| F5 | Guard flags ensure tween callbacks fire once [Cycle 3 B1] | §5.2 |
| F6 | TRANSITION_TABLE single definition for state transitions [Cycle 3~39] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numeric consistency table (spec = code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch targets minimum 48×48px + Math.max enforcement [Cycle 12~39] | §3.3 |
| F12 | TDZ prevention: `_ready` flag + Engine constructor callback TDZ defense [Cycle 39~41 verified] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path per value [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22~41] | §14.3 |
| F16 | hitTest() single unified function [Cycle 27] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG full coverage (Math.random 0 occurrences) [Cycle 19~41] | §5.2, §14.3 |
| F19 | Procedural SFX + BGM (Web Audio API generated) [Cycle 19~41] | §12 |
| F20 | Bilingual support (ko/en) [Cycle 27~41] | §13 |
| F21 | beginTransition single definition [Cycle 32~41] | §6.1 |
| F22 | Gemini PNG assets manifest.json-based loading [Cycle 39+] | §4.1, §8 |
| F23 | `_ready` flag TDZ defense pattern [Cycle 39~41 field-verified] | §5.1 |
| F24 | Canvas fallback 100% coverage [Cycle 41 verified] | §4.1 |
| F25 | Match-3 detection priority (5→T→L→4→3) [Cycle 27] | §7.1.2 |
| F26 | Initial board no-match validation [Cycle 27] | §7.1.1 |
| F27 | Relic DPS cap 200% / synergy cap 150% [Cycle 26~27, 41] | §7.4, §14.2 |

### New Feedback (Cycle #41 Lessons) 🆕

| ID | Lesson | Applied Section | Solution |
|----|--------|----------------|----------|
| F28 | monkey-patch extension structure → event bus pattern [Cycle 41 INFO-1] | §4.3 | EventBus central event system for inter-system communication |
| F29 | beginTransition guard over-blocking [Cycle 41 INFO-2] | §6.1 | Add `priority` field to TRANSITION_TABLE, GAMEOVER has highest priority |
| F30 | Phase 2 unimplemented — over-scoped MVP [Cycle 41] | §1 | Reduce Phase 1 MVP boundary realistically (3 zones + 2 bosses) |
| F31 | Balance auto-verification absent [Cycle 41] | §14.4 | Match-3 expected value formulas for DPS/heal balance pre-verification |
| F32 | BFS path search success → BFS for board validity verification in match-3 | §7.1.1 | BFS to verify "at least 1 valid swap exists" during initial board generation |

### Previous Cycle "Pain Points" Direct Resolution ⚠️

| Pain Point (cycle-41) | Resolution Section | Solution | Verification |
|-----------------------|-------------------|----------|-------------|
| monkey-patch extension structure (INFO-1) | §4.3 | EventBus pattern: `bus.on('match', handler)` system decoupling | monkey-patch grep 0 hits |
| beginTransition guard over-blocking (INFO-2) | §6.1 | TRANSITION_TABLE `priority` field, GAMEOVER highest priority | GAMEOVER reachable from all states |
| Phase 2 unimplemented | §1 MVP | Phase 1 = 3 zones + 2 bosses + upgrades Lv1~3 | Phase 1 alone = complete game flow |
| Balance auto-verification absent | §14.4 | Match-3 expected value formula + 3 extreme build formula verification | Appendix A extreme build clear turns ±20% |

### Previous Cycle "Next Cycle Suggestions" Addressed

| Suggestion (cycle-41 postmortem) | Applied | Section |
|---------------------------------|---------|---------|
| Balance simulator prototype | ✅ Partial | §14.4 — Match-3 expected value formula-based pre-verification |
| monkey-patch → event bus/middleware pattern | ✅ | §4.3 — EventBus central event system |
| Shared engine module separation | ⚠️ Partial | §4.3 — EventBus, TweenManager, SeededRNG as independent modules (code-level, not file-separated) |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
**Dune Chronicle** is a puzzle roguelite adventure where players explore the ruins of the fallen desert kingdom 'Arkhnar', defeat desert guardians and cursed beings through match-3 puzzle combat, and restore the 5 scattered pieces of the 'Codex Prophecy'.

### 1.2 Core Fun Elements
1. **Intuitive Combat**: Match-3 is universally understood. A single swap triggers attack/defense/heal with immediate feedback.
2. **Strategic Depth**: 4-element (Fire🔥/Water💧/Wind🌪️/Sand⏳) combinations, board management (bomb tile positioning), relic synergy builds.
3. **Roguelite Replayability**: SeededRNG-based ruin layouts, relic drops, enemy compositions change every run. 3-axis upgrades enable multiple strategy paths.
4. **Narrative Immersion**: Desert nomad descendant 'Zara' uncovers the ancient kingdom's secrets. Each zone yields one Codex Prophecy piece.
5. **Casual Accessibility**: Touch/click swap, auto-hint system, turn-based with no time pressure. Retains the core comfort of the casual genre.

### 1.3 References
- **Puzzle Quest** — Pioneer of match-3 + RPG combat. Gem matching generates mana → skill activation.
- **Slay the Spire** — Roguelite choice structure, relic synergy builds.
- **Titanium Court** — 2026's representative match-3 × roguelite title.
- **Monument Valley** — Aesthetic reference for ancient civilization architecture beauty.

---

## §2. Game Rules & Objectives

### 2.1 Ultimate Goal
Explore 5 desert zones, collect 5 Codex Prophecy pieces, defeat the Mummy Pharaoh, and restore the ancient kingdom of Arkhnar.

### 2.2 Zone Structure (MVP Phase 1: Zones 1~3)

| Zone | Name | Theme | Stages | Boss |
|------|------|-------|--------|------|
| 1 | Oasis Village | Tutorial + basics | 3 | — |
| 2 | Sandstorm Wastes | Visibility limit + wind element | 3 | Scorpion Queen |
| 3 | Ancient Pyramid | Traps + puzzle tiles | 3 | Sand Golem |
| 4 | Lava Canyon (Phase 2) | Fire element + destroy tiles | 3 | — |
| 5 | Mummy Pharaoh's Tomb (Phase 2) | Curse + revival | 3 | Mummy Pharaoh |
| H1 | Desert Mirage Labyrinth (Phase 2) | Hidden | 1 | — |
| H2 | Garden in the Sky (Phase 2) | Hidden | 1 | — |

### 2.3 Combat Rules
- **6×6 board**, 4 element tiles + special tiles (bomb, curse, petrify)
- **Turn-based**: Player swap → match processing → cascade → enemy turn (attack/special ability)
- **Match Effects**:
  - 🔥 Fire: Attack (reduce enemy HP)
  - 💧 Water: Defense (generate shield)
  - 🌪️ Wind: Special (board shuffle, tile movement, combo bonus)
  - ⏳ Sand: Heal (restore player HP)
- **Match Tiers**: 3-match = basic (1×), 4-match = area (1.5× + bomb tile), 5-match = full (2× + all targets)
- **Cascade**: Tiles fall after match → additional matches = combo multiplier +0.5× per cascade

### 2.4 Win/Lose Conditions
- **Stage Victory**: Enemy HP ≤ 0
- **Stage Defeat**: Player HP ≤ 0 → 50% resources preserved, retry available
- **Boss Victory**: Boss HP ≤ 0 → Codex piece + epic relic choice
- **Run End**: All zones cleared OR 3 consecutive defeats

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move cursor on board |
| Space / Enter | Select tile / confirm swap |
| E | Use relic (active relic) |
| Tab | Toggle relic list |
| Esc | Pause menu |
| L | Language toggle (ko ↔ en) |
| M | BGM mute toggle |
| 1~3 | Upgrade tab switch (on exploration map) |

### 3.2 Mouse
| Input | Action |
|-------|--------|
| Click + Drag | Tile swap (drag toward adjacent tile) |
| Click | Map node selection / UI buttons |
| Right-click | Tile info tooltip |
| Wheel | Map zoom (exploration screen) |

### 3.3 Touch (Mobile)
| Input | Action |
|-------|--------|
| Tap + Swipe | Tile swap (swap with adjacent tile in swipe direction) |
| Tap | Map node selection / UI buttons |
| Long Press (500ms) | Tile info tooltip |
| Pinch | Map zoom (exploration screen) |

**⚠️ All touch targets minimum 48×48px**: `Math.max(48, cellSize)` enforced (F11)

#### Small Display (≤400px) Layout
```
┌─────────────────────┐
│   HP Bar [■■■■■░░░]  │ ← Top fixed
├─────────────────────┤
│ ┌───┬───┬───┬───┐   │
│ │🔥 │💧 │🌪️│⏳ │   │ ← 6×6 board
│ ├───┼───┼───┼───┤   │    (cells min 48px)
│ │💧 │⏳ │🔥 │🌪️│   │
│ └───┴───┴───┴───┘   │
├─────────────────────┤
│ [Relic][Skill][Info] │ ← Bottom 48px buttons
└─────────────────────┘
```

#### Large Display (>400px) Layout
```
┌───────────────────────────────┐
│  HP Bar      Score     Combo  │
├──────────┬────────────────────┤
│ Relic    │ ┌──┬──┬──┬──┬──┐  │
│ List     │ │  │  │  │  │  │  │
│ (Left    │ ├──┼──┼──┼──┼──┤  │
│  side)   │ │  │  │  │  │  │  │
│          │ └──┴──┴──┴──┴──┘  │
├──────────┴────────────────────┤
│ [Skill1] [Skill2] [Skill3]   │
└───────────────────────────────┘
```

---

## §4. Visual Style Guide

### 4.1 Technical Constraints
- **Canvas resolution**: Fullscreen + `devicePixelRatio` + dynamic resize
- **Assets**: Gemini API PNG assets + manifest.json-based dynamic loading (F1, F22)
- **Canvas fallback**: All render functions include `if (!img) { drawFallback(ctx, ...); }` (F24)
- **External CDN/fonts**: 0 (F2)
- **alert/confirm**: 0 → Canvas-based modals (F3)

### 4.2 Color Palette
| Usage | Color Code | Description |
|-------|-----------|-------------|
| Background (night sky) | `#0a0a2e` | Deep desert night |
| Sand base | `#d4a853` | Warm golden sand |
| Sand light | `#f0d68a` | Bright sand desert |
| Oasis teal | `#00b4a0` | Life-giving oasis |
| Fire element | `#ff6b35` | Hot orange-red |
| Water element | `#0099dd` | Clear water blue |
| Wind element | `#88ddaa` | Fresh mint green |
| Sand element | `#c8a050` | Deep ochre |
| UI accent | `#ffd700` | Gold (score, upgrades) |
| Danger/enemy | `#cc3333` | Warning red |
| Pyramid stone | `#8b7355` | Ancient stone brown |

### 4.3 Architecture Pattern — EventBus (F28 Resolution)

Instead of monkey-patch extensions, use **event bus pattern** for inter-system communication:

```javascript
// EventBus pattern (monkey-patch replacement)
const bus = {
  _handlers: {},
  on(event, fn) { (this._handlers[event] ||= []).push(fn); },
  off(event, fn) { /* remove handler */ },
  emit(event, data) { (this._handlers[event] || []).forEach(fn => fn(data)); }
};

// Usage — zero coupling between systems
bus.on('match', ({ element, count }) => { /* combat system */ });
bus.on('match', ({ element, count }) => { /* sound system */ });
bus.on('match', ({ element, count }) => { /* particle system */ });
```

**Verification**: `grep "origFn\|_orig\|monkey" index.html` → 0 hits

### 4.4 Pure Function Pattern (F9)
All render/logic functions receive data through parameters:
```javascript
function renderTile(ctx, x, y, size, element, isSelected, img) { ... }
function calcMatchDamage(element, count, upgradeLevel, relicBonuses) { ... }
```

---

## §4.5. Art Direction

### Art Style Keywords
**"Ancient Desert Civilization — Warm Watercolor meets Low-Poly Geometry"**

Warm golden tones of the desert combined with geometric patterns (triangles, hexagons, spirals) of ancient civilization. Soft watercolor gradients serve as the base, with geometric patterns used as decorative elements. Overall warm and mystical atmosphere.

### Reference Games
1. **Monument Valley** (ustwo games) — Geometric beauty of ancient architecture, pastel color harmony
2. **Alto's Odyssey** (Snowman) — Warm color gradients of desert environments, silhouette art

### Asset Unified Principles
- All assets follow "warm watercolor + geometric pattern" art direction
- Characters/enemies use slightly stylized proportions (head 1.3× enlarged)
- Backgrounds use layered gradients (far → mid → near)
- UI elements use ancient stone frames + gold decorations

---

## §5. Core Game Loop

### 5.1 Engine Initialization (F12, F23)

```javascript
// _ready flag TDZ defense (verified pattern)
class Engine {
  constructor(canvas) {
    this._ready = false;        // Initially false
    // ... initialization ...
    this.onResize = () => {
      if (!this._ready) return; // Callback guard
      // resize logic
    };
    window.addEventListener('resize', this.onResize);
    this._ready = true;         // Set true at the very end
  }
}
```

### 5.2 Frame Loop (60fps target)

```
Every frame (requestAnimationFrame + delta time):
  1. deltaTime = (now - lastTime) / 1000; lastTime = now;
  2. tweenManager.update(deltaTime);           // Always update
  3. particleManager.update(deltaTime);        // Always update
  4. soundManager.update(deltaTime);           // Always update
  5. switch(state) {
       TITLE:       updateTitle(dt);       break;
       MAP:         updateMap(dt);         break;
       PRE_BATTLE:  updatePreBattle(dt);   break;
       BATTLE:      updateBattle(dt);      break;
       POST_BATTLE: updatePostBattle(dt);  break;
       UPGRADE:     updateUpgrade(dt);     break;
       BOSS:        updateBoss(dt);        break;
       GAMEOVER:    updateGameOver(dt);    break;
       VICTORY:     updateVictory(dt);     break;
       PAUSED:      /* render only */      break;
     }
  6. render(state, dt);
  7. bus.emit('frame', { dt, state });
```

**Core Rules**:
- `setTimeout` 0 occurrences → `tweenManager.add({ onComplete })` only (F4)
- Guard flags ensure tween callbacks fire once: `if (this._transitioning) return;` (F5)
- `clearImmediate()` API prevents cancelAll/add race conditions (F13)
- Single update path per value (score, hp, etc.) (F14)
- `Math.random()` 0 occurrences → `SeededRNG.next()` only (F18)

---

## §6. State Machine

### 6.1 TRANSITION_TABLE (F6, F21)

```javascript
const TRANSITION_TABLE = {
  TITLE:       { targets: ['MAP'],                    priority: 0 },
  MAP:         { targets: ['PRE_BATTLE', 'UPGRADE', 'BOSS', 'TITLE'], priority: 1 },
  PRE_BATTLE:  { targets: ['BATTLE'],                 priority: 2 },
  BATTLE:      { targets: ['POST_BATTLE', 'GAMEOVER'],priority: 3 },
  POST_BATTLE: { targets: ['MAP', 'UPGRADE'],         priority: 2 },
  UPGRADE:     { targets: ['MAP'],                    priority: 1 },
  BOSS:        { targets: ['POST_BATTLE', 'GAMEOVER'],priority: 4 },
  GAMEOVER:    { targets: ['TITLE'],                  priority: 10 }, // Highest priority
  VICTORY:     { targets: ['TITLE'],                  priority: 10 },
  PAUSED:      { targets: ['*_PREV'],                 priority: 5 },
};

// beginTransition compares priority — higher priority never blocked by lower (F29)
function beginTransition(from, to) {
  if (from === to) return false;
  const entry = TRANSITION_TABLE[from];
  if (!entry || !entry.targets.includes(to)) {
    // GAMEOVER reachable from anywhere (priority 10)
    if (to === 'GAMEOVER' || to === 'VICTORY') { /* allowed */ }
    else return false;
  }
  if (_transitioning) return false;
  _transitioning = true;
  // fade-out → enterState(to) → fade-in → _transitioning = false
}
```

### 6.2 State × System Matrix (F7)

| State | Tween | Particle | Sound | Board | AI | Input Mode | Weather | Narrative |
|-------|-------|----------|-------|-------|----|-----------|---------|-----------|
| TITLE | ✅ | ✅ | ✅ bgm | — | — | menu | — | — |
| MAP | ✅ | ✅ | ✅ bgm | — | — | map | ✅ | ✅ dialog |
| PRE_BATTLE | ✅ | ✅ | ✅ bgm+intro | — | — | limited | ✅ | ✅ narration |
| BATTLE | ✅ | ✅ | ✅ battle | ✅ match | ✅ enemy | puzzle | ✅ | — |
| POST_BATTLE | ✅ | ✅ | ✅ victory | — | — | menu | — | ✅ reward |
| UPGRADE | ✅ | ✅ | ✅ bgm | — | — | menu | — | — |
| BOSS | ✅ | ✅ | ✅ boss | ✅ match+special | ✅ boss-AI | puzzle | ✅ boss | ✅ cutscene |
| GAMEOVER | ✅ | ✅ | ✅ defeat | — | — | menu | — | — |
| VICTORY | ✅ | ✅ | ✅ fanfare | — | — | menu | — | ✅ ending |
| PAUSED | ✅ | — | — muted | — | — | pause | — | — |

### 6.3 Input Mode Granularity (Cycle 26 Lesson)

| Input Mode | Allowed Inputs |
|-----------|---------------|
| menu | Click/tap: buttons, Keys: Enter/Esc/L/M |
| map | Click/tap: map nodes, Drag: map scroll, Keys: 1~3/Esc/L/M |
| puzzle | Click+drag/Tap+swipe: tile swap, Keys: Arrows+Space/E/Tab/Esc |
| limited | Click/tap: confirm button only, Keys: Space/Esc |
| pause | Click/tap: menu buttons, Keys: Esc(resume)/L/M |

### 6.4 Canvas-Based Modals (F3)
All confirm/cancel UI rendered as Canvas overlays. `alert()`/`confirm()` usage: 0.

---

## §7. Combat System (Match-3 Engine)

### 7.1 Board System

#### 7.1.1 Initial Board Generation (F26)
```
1. Fill 6×6 board with SeededRNG random 4-element tiles
2. 3-match validation: Scan all rows/columns → if 3+ consecutive same element found, regenerate tile
3. Repeat (max 100 iterations) → Confirm 0 three-matches on board
4. Validity check: BFS to verify "at least 1 valid swap exists" (F32)
   → If 0 valid swaps, regenerate board
5. Special tiles (weather/boss): Place at generation time (petrify, curse, etc.)
```

#### 7.1.2 Match Detection Priority (F25)
```
Detection order (highest priority first):
1. 5-match (5 in a line) → "Desert Storm" full attack
2. T-match (5 tiles in T shape) → Element bomb (remove all of that element)
3. L-match (5 tiles in L shape) → Directional bomb (row + column clear)
4. 4-match (4 in a line) → Bomb tile creation (adjacent 8 cells cleared)
5. 3-match (3 in a line) → Basic effect
```

**Detection Algorithm**:
```
1. Collect all match candidates (row/column scan)
2. Sort candidates by size descending (5→4→3)
3. Identify T/L patterns via intersection detection
4. Skip already-processed tiles (prevent duplicates)
5. Return all matches as array → process in order
```

### 7.2 Battle Flow

```
[Player Turn]
  1. Select tile (click/keyboard)
  2. Swap with adjacent tile
  3. Match detection (§7.1.2 priority)
  4. No match → swap cancelled (reverse animation)
  5. Match found → process:
     a. Remove matched tiles animation (0.3s)
     b. Apply match effects (attack/defense/heal/special)
     c. Gravity fill (0.2s)
     d. Cascade detection → additional matches = combo +1 → return to 5a
     e. Cascade ends → apply combo multiplier → end turn

[Enemy Turn]
  1. Enemy AI: Select attack pattern (basic attack / special ability)
  2. Apply enemy attack effect (HP reduction / board pollution)
  3. Generate special tiles (boss only: petrify/poison/curse)
  4. End turn → player turn

[Battle End]
  - Enemy HP ≤ 0: POST_BATTLE → reward selection
  - Player HP ≤ 0: GAMEOVER (50% resources preserved)
```

### 7.3 Element Affinity & Balance

| Element | Base Effect | 3-match Power | 4-match Power | 5-match Power |
|---------|------------|--------------|--------------|--------------|
| 🔥 Fire | Attack | 15 dmg | 22 dmg + bomb | 30 dmg + all |
| 💧 Water | Defense | 10 shield | 15 shield + bomb | 25 shield + all |
| 🌪️ Wind | Special | Combo +1 | Board shuffle | Skip enemy turn |
| ⏳ Sand | Heal | 12 HP | 18 HP + bomb | 30 HP + all |

**Cascade Combo Multiplier**: 1× (base) → 1.5× (2 combo) → 2× (3 combo) → 2.5× (4 combo) → 3× (5+ combo, cap)

### 7.4 Relic System & Balance Caps (F27)

**13 Relics** (Phase 1: 9, Phase 2: +4):

| Tier | Name | Effect | DPS Contribution |
|------|------|--------|-----------------|
| Common | Desert Rose | Fire match damage +15% | +15% |
| Common | Oasis Flask | Heal effect +20% | — |
| Common | Wind Feather | Combo multiplier +0.2× | +10%~20% |
| Common | Hourglass Shard | Every 3 turns, convert 1 random tile to desired element | +5%~10% |
| Common | Sunstone Ring | Fire+Wind simultaneous match → +5 dmg bonus | +8% |
| Rare | Scorpion Stinger | Fire match → 3-turn poison (3 dmg/turn) | +25% |
| Rare | Tears of the Nile | Water match → shield overflow 30% → HP recovery | — |
| Rare | Sandstorm Core | On 5-match → +10 dmg to all enemies | +15% |
| Rare | Ancient Compass | Optimal match hint at turn start | — |
| Epic (P2) | Pharaoh's Crown | All element damage +25% | +25% |
| Epic (P2) | Mummy's Bandage | On death → revive once at 30% HP | — |
| Epic (P2) | Sphinx's Riddle | 10% chance to trigger match effect twice | +10% avg |
| Epic (P2) | Anubis's Scale | On enemy kill → recover 20% HP | — |

**⚠️ Balance Caps** (F27):
- **DPS Cap**: Maximum 200% of base (relic combined bonus ≤ +100%)
- **Synergy Cap**: 2+ relic synergy effects maximum 150%
- **Verification**: `applyRelic()` enforces `totalBonus = Math.min(totalBonus, DPS_CAP)`
- **Over-cap relics**: Automatically excluded from selection pool for that category

### 7.5 Boss Battles

#### Scorpion Queen (Zone 2 Boss)
- **HP**: 200 (DDA adjusted)
- **Special Ability**: Every 2 turns, convert 2 random tiles to "poison tiles" (matched damage -50%)
- **Weakness**: Water (💧) element purifies poison tiles
- **Reward**: Codex piece #2 + epic relic selection (pick 1 of 3)

#### Sand Golem (Zone 3 Boss)
- **HP**: 300 (DDA adjusted)
- **Special Ability**: Every 3 turns, convert 3 random tiles to "petrified tiles" (cannot swap)
- **Weakness**: Wind (🌪️) element breaks petrification
- **Reward**: Codex piece #3 + epic relic selection

#### Mummy Pharaoh (Zone 5 Boss, Phase 2)
- **HP**: 500 (DDA adjusted)
- **Special Ability**: "Curse" — nullify 1 random element for 3 turns + revive once at 30% HP when below 10% HP
- **Weakness**: All 4 elements matched in a single turn → "Seal" prevents revival
- **Reward**: Codex piece #5 (complete) + final victory

**⚠️ bossRewardGiven flag**: Boss defeat rewards must be granted exactly once (F17)

---

## §8. Asset Requirements

This section is the asset production brief for the designer (art director).

```yaml
# asset-requirements
art-style: "Ancient Desert Civilization — Warm Watercolor meets Low-Poly Geometry"
color-palette: "#0a0a2e, #d4a853, #f0d68a, #00b4a0, #ff6b35, #0099dd, #ffd700"
mood: "Mystical ancient desert, warm golden adventure, wonder of ancient civilization"
reference: "Monument Valley geometric architectural aesthetics + Alto's Odyssey desert gradient atmosphere"

assets:
  - id: player-zara
    desc: "Protagonist Zara — Desert nomad descendant. Turban and sand-colored cloak, ancient compass at waist, glowing aura in hand. Front 3/4 pose. Warm brown skin, golden eyes. Stylized proportions (slightly enlarged head)."
    size: "512x512"

  - id: enemy-scarab
    desc: "Desert scarab warrior — Metallic sheen carapace, red eyes, small pincers. Basic enemy unit. Desert sand base color with bronze luster."
    size: "512x512"

  - id: enemy-sandwraith
    desc: "Sand wraith — Ghost form made of sand. Translucent sand-colored body, glowing golden eyes, scattering sand particles. Mid-tier enemy."
    size: "512x512"

  - id: enemy-guardian
    desc: "Pyramid guardian — Humanoid in ancient stone armor. Egyptian-style helm, gold decorations, stone shield and spear. High-tier enemy."
    size: "512x512"

  - id: boss-scorpion-queen
    desc: "Scorpion Queen — Giant desert scorpion. Purple carapace, poison-dripping tail stinger, golden crown. Imposing pose. Boss-tier large asset."
    size: "640x480"

  - id: boss-sand-golem
    desc: "Sand Golem — Massive sand+stone structure merged into humanoid form. Pyramid stone fragments attached like armor, golden energy glowing from within. Boss-tier large asset."
    size: "640x480"

  - id: tile-fire
    desc: "Fire element tile — Octagonal frame containing orange-red flame motif. Egyptian sun god symbol. Bright warm tone."
    size: "128x128"

  - id: tile-water
    desc: "Water element tile — Octagonal frame containing blue wave motif. Nile river symbol. Clear cool tone."
    size: "128x128"

  - id: tile-wind
    desc: "Wind element tile — Octagonal frame containing mint-green spiral motif. Desert wind symbol. Fresh tone."
    size: "128x128"

  - id: tile-sand
    desc: "Sand element tile — Octagonal frame containing ochre hourglass motif. Sands of time symbol. Warm golden-brown tone."
    size: "128x128"

  - id: bg-desert-far
    desc: "Far background — Desert horizon. Wide sand dunes, distant pyramid silhouettes, orange-purple gradient sky. Watercolor-style soft edges."
    size: "1920x1080"

  - id: bg-desert-mid
    desc: "Mid background — Desert architectural ruins. Fallen obelisks, half-buried statue columns, desert flora (cacti). Warm sand tone."
    size: "1920x1080"

  - id: bg-oasis
    desc: "Oasis village background — Palm tree groves, clear pond, tent market, camels. Teal+gold tones. Zone 1 exclusive."
    size: "1920x1080"

  - id: bg-pyramid
    desc: "Pyramid interior background — Stone walls, hieroglyphics, torch lighting, gold decorations. Dark brown + gold. Zone 3 exclusive."
    size: "1920x1080"

  - id: effect-match
    desc: "Match effect — Gem fragments scattering in all directions. Element-specific color variations possible via bright white base + gold sparkles."
    size: "256x256"

  - id: effect-cascade
    desc: "Cascade/combo effect — Golden wave rippling from screen edges on chain matches. Includes text area for 'COMBO x3' etc."
    size: "512x256"

  - id: ui-hp-frame
    desc: "HP bar frame — Ancient stone border + gold decorations. Horizontal frame where red (enemy) or green (player) gauge fills inside."
    size: "512x64"

  - id: ui-relic-frame
    desc: "Relic icon frame — Octagonal gold border. Relic image placed inside. Border color varies by tier (common/rare/epic)."
    size: "128x128"

  - id: item-scroll
    desc: "Codex Prophecy piece — Aged papyrus scroll, glowing hieroglyphics, gold seal. Collectible item."
    size: "128x128"

  - id: thumbnail
    desc: "Game representative image — Zara standing with pyramids in background, glowing match-3 board in front, 'Dune Chronicle' title text (gold ancient font). Desert sunset atmosphere."
    size: "800x600"
```

**Total Assets: 20** (within range)

---

## §9. Difficulty System

### 9.1 DDA 4 Tiers (Dynamic Difficulty Adjustment)

Player performance metric: **Win rate of last 5 battles**

| DDA Level | Win Rate Condition | Enemy HP Multiplier | Special Tile Frequency | Reward Multiplier |
|-----------|-------------------|--------------------|-----------------------|-------------------|
| Easy | Win rate < 40% | 0.7× | 25% reduced | 1.3× |
| Normal | Win rate 40~70% | 1.0× | Base | 1.0× |
| Hard | Win rate 70~90% | 1.3× | 25% increased | 1.2× |
| Nightmare | Win rate > 90% | 1.6× | 50% increased | 1.5× |

### 9.2 Per-Zone Base Difficulty Scaling

| Zone | Enemy HP Range | Enemy Attack | Turn Limit | Special Tiles |
|------|---------------|-------------|-----------|---------------|
| 1 (Oasis) | 40~60 | 5~8 | None | None |
| 2 (Sandstorm) | 70~100 | 8~12 | None | Poison |
| 3 (Pyramid) | 100~150 | 12~18 | 30 turns | Petrify+Poison |
| 4 (Lava, P2) | 150~200 | 18~25 | 25 turns | Petrify+Poison+Destroy |
| 5 (Tomb, P2) | 200~280 | 25~35 | 20 turns | All types |

---

## §10. Exploration System (Map)

### 10.1 Map Structure
Each zone uses a node-based map (Slay the Spire style):
```
[Start] → [Battle] → [Event/Battle] → [Shop/Battle] → [Boss]
                  ↘ [Event] → [Battle] ↗
```

Node types:
- ⚔️ **Battle**: Normal enemy match-3 combat
- 🎲 **Event**: Random events (treasure discovery, NPC encounter, trap)
- 🏪 **Shop**: Purchase relics / HP recovery (resource cost)
- 🏛️ **Boss**: Zone boss battle

### 10.2 Procedural Map Generation
```
1. SeededRNG generates 3~4 rows × 2~3 columns of nodes
2. Guarantee minimum 2 paths from start to end (BFS verification)
3. Node type distribution: Battle 50%, Event 25%, Shop 15%, Boss 10% (last row fixed)
4. Adjacent node connections (each node connects to at least 1 next-row node)
```

### 10.3 Weather System (Phase 1: 2 types, Phase 2: 4 types)

| Weather | Effect | Applied Zones |
|---------|--------|--------------|
| Sandstorm | Top 2 rows visibility reduced (sand filter) + Wind element +20% | Zones 2, 4 |
| Desert Heat | Fire element +25% + 2 dmg to all every 5 turns | Zones 3, 4 |
| Night Chill (P2) | Water element +25% + shield duration +1 turn | Zone 5 |
| Oasis (P2) | 5 HP recovery to all every 4 turns | Zone 1 (specific nodes) |

---

## §11. Score System

### 11.1 Score Calculation

| Action | Base Score |
|--------|-----------|
| 3-match | 100 |
| 4-match | 250 |
| 5-match | 500 |
| T/L match | 400 |
| Cascade (per combo) | +50% |
| Enemy defeated | 300 |
| Boss defeated | 2000 |
| No-damage battle clear | ×2 bonus |
| Zone completed | 5000 |

### 11.2 Resource System

| Resource | Source | Use |
|----------|-------|-----|
| Gold | Battle rewards + events | Purchase relics at shop |
| Scroll Pieces | Boss defeat + hidden stages | Codex Prophecy restoration (main progression) |
| Element Crystals | Match accumulation | Upgrade currency |

**⚠️ Judge first, save later** (F8):
```javascript
// Correct order
const isNewBest = score > getBest();  // Judge
saveBest(score);                       // Save
if (isNewBest) showNewBestUI();        // UI reflect
```

---

## §12. Sound System (Web Audio API)

### 12.1 BGM (Procedurally Generated)
| BGM | Mood | Scale |
|-----|------|-------|
| Title | Mystical desert, slow tempo | D minor pentatonic |
| Exploration map | Adventurous, medium tempo | A minor |
| Battle | Tense, fast tempo | E Phrygian |
| Boss battle | Imposing, strong beat | C# Locrian |
| Victory | Celebratory, bright fanfare | D major |

### 12.2 Sound Effects (10 types)
| ID | Trigger | Description |
|----|---------|-------------|
| sfx-match3 | 3-match | Clear gem sound |
| sfx-match4 | 4-match | Bomb creation bass |
| sfx-match5 | 5-match | Majestic wave |
| sfx-combo | Cascade | Ascending scale |
| sfx-damage | Hit taken | Dull impact |
| sfx-heal | Heal | Soft water sound |
| sfx-boss-intro | Boss entrance | Imposing resonance |
| sfx-boss-defeat | Boss defeated | Victory fanfare |
| sfx-item | Item acquired | Sparkling metallic |
| sfx-ui | UI click | Light stone click |

---

## §13. Bilingual Support (F20)

```javascript
const L = {
  ko: {
    title: '듄 크로니클',
    subtitle: '고대 사막 왕국의 예언',
    start: '모험 시작',
    continue: '계속하기',
    fire: '불', water: '물', wind: '바람', sand: '모래',
    score: '점수', combo: '콤보', turn: '턴',
    // ... full UI text
  },
  en: {
    title: 'Dune Chronicle',
    subtitle: 'Prophecy of the Ancient Desert Kingdom',
    start: 'Start Adventure',
    continue: 'Continue',
    fire: 'Fire', water: 'Water', wind: 'Wind', sand: 'Sand',
    score: 'Score', combo: 'Combo', turn: 'Turn',
    // ...
  }
};
// L key toggle: lang = lang === 'ko' ? 'en' : 'ko';
```

---

## §14. Code Hygiene & Verification

### 14.1 Numeric Consistency Table (F10)

| Item | Spec Value | Code Constant |
|------|-----------|--------------|
| Board size | 6×6 | BOARD_SIZE = 6 |
| Element types | 4 | ELEMENT_COUNT = 4 |
| 3-match attack (Fire) | 15 dmg | DMG_FIRE_3 = 15 |
| 3-match defense (Water) | 10 shield | SHIELD_WATER_3 = 10 |
| 3-match heal (Sand) | 12 HP | HEAL_SAND_3 = 12 |
| Combo cap | 3× (5+ combo) | COMBO_CAP = 3.0 |
| DPS cap | 200% | DPS_CAP = 2.0 |
| Synergy cap | 150% | SYNERGY_CAP = 1.5 |
| Boss 1 HP | 200 | BOSS_SCORPION_HP = 200 |
| Boss 2 HP | 300 | BOSS_GOLEM_HP = 300 |
| Boss 3 HP | 500 | BOSS_PHARAOH_HP = 500 |
| Min touch target | 48px | MIN_TOUCH = 48 |

### 14.2 Code Hygiene Checklist

| # | Item | Verification | FAIL/WARN |
|---|------|-------------|-----------|
| 1 | `Math.random()` 0 occurrences | grep | FAIL |
| 2 | `alert(`/`confirm(` 0 occurrences | grep | FAIL |
| 3 | `setTimeout(` 0 occurrences | grep | FAIL |
| 4 | External CDN/fonts 0 | grep `http://\|https://\|@import` | FAIL |
| 5 | monkey-patch patterns 0 | grep `origFn\|_orig\|monkey` | FAIL |
| 6 | `engine.` direct reference in callbacks 0 | grep in event handlers | FAIL |
| 7 | All render functions have Canvas fallback | Manual review | FAIL |
| 8 | Touch targets ≥ 48px | grep `Math.max(48` | WARN |
| 9 | applyRelic() DPS_CAP verification | grep `DPS_CAP\|SYNERGY_CAP` | FAIL |
| 10 | `_ready` flag present | grep `_ready` | FAIL |
| 11 | beginTransition single definition | grep `beginTransition` count = 1 | FAIL |
| 12 | bossRewardGiven flag | grep `bossRewardGiven\|RewardGiven` | WARN |
| 13 | All constants match §14.1 | Manual comparison | FAIL |

### 14.3 Smoke Test Gate (F15)

| # | Test | Expected Result |
|---|------|----------------|
| 1 | Page load → TITLE state | 0 errors, title screen displayed |
| 2 | Start click → MAP transition | Map nodes visible, fade transition |
| 3 | Battle node entry → BATTLE | 6×6 board displayed, 4 tile colors |
| 4 | Tile swap → match triggered | Match animation + score increase |
| 5 | Cascade occurs | Combo multiplier displayed + additional matches |
| 6 | Enemy HP ≤ 0 → POST_BATTLE | Reward selection UI |
| 7 | Boss entry → BOSS | Boss entrance scene + special tiles |
| 8 | HP ≤ 0 → GAMEOVER | GAMEOVER screen + TITLE return |
| 9 | L key → language switch | ko ↔ en toggle |
| 10 | Resize → DPR applied | Canvas resolution updated, 0 errors |

### 14.4 Balance Pre-Verification — Match-3 Expected Values (F31)

**Base Battle Formula**:
```
Expected matches/turn ≈ 1.2 (6×6 board, 4 elements, cascades included)
Expected DPS/turn (Fire 3-match base) = 15 × 1.2 = 18 dmg/turn
```

**Extreme Build Verification (Appendix A)**:

| Build | Relic Combination | DPS/Turn | Boss 1 Clear Turns | Boss 2 Clear Turns |
|-------|------------------|----------|--------------------|--------------------|
| Pure Fire | Desert Rose + Sunstone Ring + Scorpion Stinger | 18×1.48=26.6 | 200/26.6≈8 turns | 300/26.6≈12 turns |
| Balanced | Rose + Flask + Feather | 18×1.15+heal=20.7 | 200/20.7≈10 turns | 300/20.7≈15 turns |
| Defensive | Flask + Tears of Nile + Compass | 18×1.0=18 | 200/18≈11 turns | 300/18≈17 turns |

**Acceptable Range**: Boss 1 clear 8~15 turns, Boss 2 clear 12~20 turns (within ±20% ✅)

---

## §15. Upgrade System

### 15.1 3-Axis × 5-Level Upgrade Tree

#### Elemental Mastery (Attack)
| Lv | Effect | Cost (Element Crystals) |
|----|--------|------------------------|
| 1 | Fire match damage +10% | 50 |
| 2 | Water shield +15% | 120 |
| 3 | Wind combo bonus +0.3× | 250 |
| 4 (P2) | Sand heal +20% | 400 |
| 5 (P2) | All 4-element 5-match → "Judgment" (50 dmg to all) | 600 |

#### Explorer's Gear (Exploration)
| Lv | Effect | Cost |
|----|--------|------|
| 1 | Resource collection +15% | 50 |
| 2 | Shop prices -10% | 120 |
| 3 | Event rewards +20% | 250 |
| 4 (P2) | Hidden map node spawn rate +30% | 400 |
| 5 (P2) | Defeat resource preservation 75% (base 50%) | 600 |

#### Ancient Knowledge (Special)
| Lv | Effect | Cost |
|----|--------|------|
| 1 | Hint system enabled | 50 |
| 2 | Free shuffle at battle start (1 per battle) | 120 |
| 3 | Relic selection 4 choices (base 3) | 250 |
| 4 (P2) | Weather effect resistance 50% | 400 |
| 5 (P2) | Shield 30 at boss battle start | 600 |

---

## §16. Narrative

### 16.1 Story Overview
Desert nomad descendant **Zara** learns from her tribe's elder about the fall of the ancient kingdom **Arkhnar** and the Codex Prophecy. The kingdom's guardians went berserk and cursed the desert — only by gathering 5 pieces of the Codex can the curse be lifted.

### 16.2 Per-Zone Narrative Beats (Phase 1)
- **Zone 1 (Oasis)**: Elder's teachings, basic match-3 combat tutorial. "Long ago, this oasis was Arkhnar's garden..."
- **Zone 2 (Sandstorm)**: Discover why the Scorpion Queen raises sandstorms — revenge for the kingdom's poison weapons. Choice between empathy and combat.
- **Zone 3 (Pyramid)**: Ancient knowledge inside the pyramid, truth of the kingdom's fall — the kings' greed caused the guardians' rampage.

---

## Appendix: Game Page Sidebar Data

```yaml
game:
  title: "Dune Chronicle"
  description: "A desert civilization roguelite where you explore ancient ruins through match-3 puzzle combat. Match 4 elements to attack, defend, and heal, build relic synergy builds, and challenge the desert guardians."
  genre: ["puzzle", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "Arrow Keys/WASD: Move cursor"
    - "Space: Select/confirm tile"
    - "Mouse drag: Swap tiles"
    - "Touch swipe: Swap tiles"
    - "E: Use relic"
    - "L: Toggle language"
    - "M: Mute toggle"
    - "Esc: Pause"
  tags:
    - "#match3"
    - "#desert"
    - "#ancientCivilization"
    - "#roguelite"
    - "#puzzleCombat"
    - "#relicBuild"
    - "#turnBased"
  addedAt: "2026-03-25"
  version: "1.0.0"
  featured: true
```
