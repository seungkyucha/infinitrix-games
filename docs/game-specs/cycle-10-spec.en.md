---
game-id: mini-card-battler
title: Mini Card Battler
genre: strategy, casual
difficulty: easy
---

# Mini Card Battler — Detailed Game Design Document (Cycle 10)

---

## §0. Previous Cycle Feedback Mapping

| # | Source | Problem/Suggestion | Solution in This Spec |
|---|--------|-------------------|----------------------|
| 1 | Cycle 10 Analysis Report | **Card/deckbuilding mechanics 0% — largest gap** | ✅ This game is the platform's first turn-based deckbuilding card battler. Fills the card/deckbuilding gap |
| 2 | Cycle 10 Analysis Report | **All games real-time → 0 turn-based** | ✅ Platform's first turn-based game. Diversifies play styles |
| 3 | Cycle 10 Analysis Report | **Strategy genre weakest at 2 titles** | ✅ Strategy 2→3 titles reinforced |
| 4 | Cycle 10 Analysis Report | **Medium difficulty 78% concentration** | ✅ Set to difficulty: easy. Easy 2→3 titles expanded |
| 5 | platform-wisdom [Cycle 1~8] | **assets/ directory recurring for 8 cycles** | §13.1 pre-commit hook **actually registered in `.git/hooks/`** + hook registration itself included as verification item. 100% Canvas code drawing. assets/ directory creation itself forbidden |
| 6 | platform-wisdom [Cycle 2~4] | **SVG feGaussianBlur recurrence** | 0 external SVG files. All visuals are Canvas API code drawing (fillRect, arc, roundRect, fillText) |
| 7 | platform-wisdom [Cycle 1~2] | **setTimeout state transition forbidden** | §5 All delayed transitions use tween onComplete only. **Turn-based structurally reduces setTimeout temptation** |
| 8 | platform-wisdom [Cycle 4] | **cancelAll+add race condition** | clearImmediate() immediate cleanup API usage. §12 TweenManager spec |
| 9 | platform-wisdom [Cycle 2] | **State×system matrix required** | Full matrix included in §5.3 |
| 10 | platform-wisdom [Cycle 6~7] | **Pure function principle violation** | §10 pre-defines parameter signatures for all game logic functions. 0 global references target |
| 11 | platform-wisdom [Cycle 7] | **Spec-implementation value mismatch** | §6, §7 all balance values mapped 1:1 as CONFIG object constants. §13.5 numerical consistency verification table |
| 12 | platform-wisdom [Cycle 8] | **beginTransition() bypass (PAUSED etc.)** | §5.2 `beginTransition(state, {immediate: true})` immediate transition mode. All transitions go through beginTransition without exception |
| 13 | platform-wisdom [Cycle 3] | **Missing guard flags** | Turn-based eliminates per-frame condition re-evaluation. Still applying `isTransitioning` guard flag |
| 14 | platform-wisdom [Cycle 2~3] | **Ghost variable prevention** | §13.4 full verification checklist for all declared variable usage |
| 15 | platform-wisdom [Cycle 5] | **Unified single value update path** | Each value uses either tween OR direct assignment, not both |
| 16 | platform-wisdom [Cycle 1] | **confirm/alert forbidden in iframe** | All confirmation UI uses Canvas-based modal (CONFIRM_MODAL state) |
| 17 | platform-wisdom [Cycle 8] | **drawTitle dt hardcoding** | All render/update functions receive dt as parameter from gameLoop. Hardcoding forbidden |
| 18 | platform-wisdom [Cycle 5] | **beginTransition required but direct transitions occur** | §5.2 pre-defines state transition function list to prevent direct enterState() calls |

---

## §1. Game Overview & Core Fun

### Concept
A hero trapped in the Tower of Darkness uses **cards as weapons in turn-based combat** against monsters while **breaking through a 3-floor mini dungeon** — a roguelike deckbuilding game. A minimal version condensing the core fun of Slay the Spire into a **single index.html**. ~**10-15 minutes** per run. Random card/enemy/event combinations every run provide **infinite replay value**.

### 3 Core Fun Elements
1. **Strategic card selection**: Decision-making to choose the optimal combination within mana limits from 5 cards in hand each turn. "Should I go all-in on attack this turn, or stack defense?"
2. **Deck growth satisfaction**: Battle victory → Choose 1 of 3 reward cards → Deck gets progressively stronger buildup. "Eureka" moment when card synergies come together
3. **Roguelike tension**: HP carries across runs and death means starting over → "just one more run" addiction + permanent unlocks for long-term retention

### References
- **Slay the Spire**: The originator of deckbuilding roguelikes. Turn-based card combat + map node selection
- **Balatro**: Popularized deckbuilding with poker hands + joker synergies (2024 GOTY nominee)
- **Slay the Web**: Open-source HTML5 StS clone. Validated single-webpage card combat

### Game Page Sidebar Info
```yaml
title: "Mini Card Battler"
description: "Wield cards as weapons to conquer the Tower of Darkness! Turn-based deckbuilding roguelike."
genre: ["strategy", "casual"]
playCount: 0
rating: 0
controls:
  - "Mouse: Click cards to play, click enemies to target"
  - "Touch: Tap cards to play, tap enemies to target"
  - "Keyboard: 1~5 card select, E end turn, Space proceed, ESC pause"
tags:
  - "#deckbuilding"
  - "#cardbattle"
  - "#roguelike"
  - "#turnbasedstrategy"
  - "#singleplayer"
addedAt: "2026-03-21"
version: "1.0.0"
featured: true
```

---

## §2. Game Rules & Objectives

### 2.1 Ultimate Goal
Clear the run by **defeating the final boss** after breaking through the 3-floor dungeon. Clear score is based on remaining HP, turns used, and gold earned.

### 2.2 Defeat Condition
Run ends (Game Over) when player HP drops to 0 or below. HP carries between runs, making resource (HP/gold) management the key.

### 2.3 Turn Structure (During Combat)
```
Turn Start
  ├─ 1. Draw Phase: Draw 5 cards from draw pile (shuffle discard pile when deck is empty)
  ├─ 2. Player Turn: Play cards by spending mana (free order)
  │     ├─ Attack cards → Deal damage to enemies
  │     ├─ Defense cards → Gain block (armor)
  │     └─ Skill cards → Buff/debuff/draw/special effects
  ├─ 3. End Turn declaration (E key or "End Turn" button click)
  ├─ 4. Unused cards → Move to discard pile
  ├─ 5. Block reset (block does not persist between turns)
  └─ 6. Enemy Turn: Act according to pre-displayed intent → Reveal next intent
```

### 2.4 Map Structure (3-Floor Mini Dungeon)
```
[Floor 1 — Forest] 5 nodes: Battle×3, Event×1, Shop×1
        ↓
[Floor 2 — Cave] 5 nodes: Battle×2, Elite×1, Shop×1, Rest×1
        ↓
[Floor 3 — Tower Summit] 4 nodes: Battle×1, Elite×1, Rest×1, Boss×1
```
- Each floor's nodes connect via **2-3 branching paths** (player chooses route)
- Branch structure is fixed per run via seededRng (same seed = same map)

### 2.5 Rules by Node Type

| Node | Description |
|------|-------------|
| ⚔️ Battle | Turn-based combat with 1-2 regular monsters. Victory grants card reward (choose 1 of 3) + gold |
| 💀 Elite | 1 enhanced monster. Victory grants relic (passive) + gold + card reward |
| 🛒 Shop | Spend gold to buy cards (3 displayed) / remove cards (deck thinning) / HP recovery potion |
| ❓ Event | Random event with 2 choices (e.g., "Spend 10 HP → Get rare card" or "Pass safely") |
| 🏕 Rest | Choose between HP 25% recovery or upgrade 1 card (enhanced version) |
| 👑 Boss | Floor-specific unique boss. Defeat advances to next floor / defeating final boss clears the run |

---

## §3. Controls

### 3.1 Mouse (PC)
| Action | Description |
|--------|-------------|
| Card click | Select card from hand → Selected card highlighted (glow) |
| Enemy click | Designate target for selected attack card → Card effect applied immediately |
| Defense/skill card click | Cards not requiring a target are used immediately on click |
| "End Turn" button click | End player turn → Enemy turn begins |
| Map node click | Select next node (only connected nodes clickable) |
| Card hover | Enlarged card preview + detailed description tooltip |

### 3.2 Keyboard (PC)
| Key | Action |
|-----|--------|
| `1`~`5` | Select nth card from left in hand |
| `Q` / `W` | Target enemy 1 / enemy 2 (after selecting attack card) |
| `E` | End turn |
| `Space` | Post-battle "Continue" / Confirm reward / Proceed |
| `Escape` | Pause menu (Canvas modal) |

### 3.3 Touch (Mobile)
| Action | Description |
|--------|-------------|
| Card tap | Card select (first tap=select, second tap=use/instant use for non-targeted cards) |
| Enemy tap | Designate target for selected attack card |
| "End Turn" button tap | End turn |
| Card long press (300ms) | Card detail info popup |
| Map node tap | Node selection |

---

## §4. Visual Style Guide

### 4.1 Overall Tone
**Dark Fantasy + Neon Accents** — Cards/UI stand out in bright colors against a dark background. A blend of Slay the Spire's dark tone + Balatro's neon aesthetic.

### 4.2 Color Palette

| Usage | Color | HEX |
|-------|-------|-----|
| Background (dungeon) | Very dark navy | `#0A0E1A` |
| Card background | Dark slate | `#1A1F2E` |
| Card border (attack) | Crimson red | `#E63946` |
| Card border (defense) | Steel blue | `#457B9D` |
| Card border (skill) | Emerald green | `#2A9D8F` |
| Card border (power) | Amber gold | `#E9C46A` |
| Mana orb | Deep purple | `#7B2CBF` |
| HP bar (player) | Red gradient | `#E63946` → `#C1121F` |
| HP bar (enemy) | Orange red | `#FF6B35` |
| Block (armor) | Sky blue | `#48CAE4` |
| Gold | Bright gold | `#FFD60A` |
| Text (normal) | Light gray | `#E8E8E8` |
| Text (inactive) | Dark gray | `#6B7280` |
| Enemy intent (attack) | Red | `#EF4444` |
| Enemy intent (defense) | Blue | `#3B82F6` |
| Enemy intent (buff) | Purple | `#A855F7` |
| Selected card glow | Bright white | `#FFFFFF` (alpha 0.4) |
| Boss glow | Dark red | `#9B1B30` |

### 4.3 Backgrounds
- **Floor 1 (Forest)**: Dark navy base + dark green tree silhouettes at the bottom (triangle combinations)
- **Floor 2 (Cave)**: Darker background + brown stalactites at top/bottom (inverted triangles)
- **Floor 3 (Tower)**: Deep purple base + starlight particles (20 small white dots randomly flickering)

### 4.4 Object Shapes (100% Canvas Code Drawing)

#### Cards
```
┌─────────────────────┐  Size: 100×140px (hand default)
│ [Mana Cost]  [Type] │  Enlarged: 150×210px
│                     │
│    [Card Icon]      │  Icon: Expressed via shape combinations
│   (Canvas shapes)   │    Attack=Sword (triangle+rectangle)
│                     │    Defense=Shield (circle+rectangle)
│   [Card Name]       │    Skill=Star (5-pointed star path)
│                     │    Power=Crown (3 triangles)
│  [Effect Value Text]│
│                     │  Border: Type-specific color 2px
└─────────────────────┘  Rounded corners: radius 8px
```

#### Enemy Monsters (Canvas Shape Combinations)
| Enemy | Shape | Color |
|-------|-------|-------|
| Slime | Semicircle + 2 small circles (eyes) | `#4ADE80` (green) |
| Goblin | Inverted triangle (body) + circle (head) + 2 triangles (ears) | `#FB923C` (orange) |
| Skeleton Warrior | Circle (skull) + rectangle (body) + 2 lines (sword) | `#D4D4D8` (gray) |
| Gargoyle | Triangle (body) + 2 triangles (wings) + circle (eye, red) | `#6B21A8` (purple) |
| Dark Slime | Semicircle (large) + 2 circles (eyes, red) + spikes (3 triangles) | `#1E3A5F` (dark navy) |
| Orc Chief | Large rectangle (body) + circle (head) + triangle (axe) | `#92400E` (brown) |
| Night Reaper | Triangle (robe) + circle (skull) + line (scythe) | `#4C1D95` (dark purple) |
| Fire Dragon (Boss 1) | Large triangle (body) + circle (head) + 2 triangles (wings) + flame (orange triangle) | `#DC2626` (red) |
| Frost Lich (Boss 2) | Rectangle (robe) + circle (skull) + blue glow (shadowBlur) | `#7C3AED` (purple) |
| Dark Knight (Final Boss) | Large rectangle (armor) + triangle (helm) + line (greatsword) + black glow | `#1F2937` (dark, red eyes) |

#### Player Area (Bottom of Screen)
```
[HP Bar] [Block Display] [Mana Orbs×3]     [End Turn Button]
[───────── 5 Hand Cards (fan layout) ─────────]
```

#### Enemy Area (Top of Screen)
```
[Enemy1: Shape + HP Bar + Intent Icon]  [Enemy2: Shape + HP Bar + Intent Icon]
```

### 4.5 External Asset Policy
- **0 external files**: No images, SVGs, fonts, or audio files whatsoever
- **assets/ directory creation forbidden**: Do not create the directory itself
- **All visuals**: Canvas API (fillRect, arc, roundRect, lineTo, fillText, shadowBlur)
- **All sounds**: Web Audio API procedural synthesis
- **Fonts**: system-ui, -apple-system, sans-serif (system font stack only)
- **❌ Forbidden items**: SVG files, feGaussianBlur, Google Fonts, `<img>` tags, `new Image()`, ASSET_MAP, SPRITES, preloadAssets

---

## §5. Core Game Loop

### 5.1 Full State Machine (FSM)

```
LOADING → TITLE → MAP → PRE_BATTLE → PLAYER_TURN → ENEMY_TURN →
  ├─ REWARD (battle victory)
  │    ├─ MAP (next node selection)
  │    └─ VICTORY (final boss clear)
  ├─ EVENT (event node)
  ├─ SHOP (shop node)
  ├─ REST (rest node)
  ├─ GAMEOVER (HP ≤ 0)
  ├─ PAUSED (ESC)
  └─ CONFIRM_MODAL (when confirmation needed)
```

State transition diagram:
```
LOADING ──→ TITLE ──→ MAP ──→ PRE_BATTLE ──→ PLAYER_TURN ⇄ ENEMY_TURN
                ↑       │          ↑               │              │
                │       │          └── REWARD ←─────┘              │
                │       ├──→ EVENT ──→ MAP                         │
                │       ├──→ SHOP ──→ MAP                          │
                │       ├──→ REST ──→ MAP                          │
                │       └──→ (boss node) PRE_BATTLE → ... → VICTORY│
                │                                                   │
                └────────── GAMEOVER ←──────────────────────────────┘
```

### 5.2 State Transition Rules

**All transitions must go through `beginTransition(targetState, options)`.**

```javascript
// Transition modes
beginTransition('MAP', { immediate: false });  // Fade transition (default)
beginTransition('PAUSED', { immediate: true }); // Immediate transition (PAUSED etc.)

// State priority (STATE_PRIORITY)
const STATE_PRIORITY = {
  GAMEOVER: 100,    // Highest priority
  VICTORY: 90,
  PAUSED: 80,
  CONFIRM_MODAL: 70,
  ENEMY_TURN: 30,
  PLAYER_TURN: 20,
  PRE_BATTLE: 15,
  REWARD: 10,
  EVENT: 10,
  SHOP: 10,
  REST: 10,
  MAP: 5,
  TITLE: 1,
  LOADING: 0,
};
```

**Guard flag**: Set `isTransitioning = true`, then change state + set `isTransitioning = false` in tween onComplete. Prevents duplicate transitions.

### 5.3 State × System Update Matrix

| State | TweenMgr | Render | Input | Audio | Timer |
|-------|----------|--------|-------|-------|-------|
| LOADING | ✅ | ✅ Loading bar | ❌ | ❌ | ❌ |
| TITLE | ✅ | ✅ Title | ✅ Start | ✅ BGM | ❌ |
| MAP | ✅ | ✅ Map | ✅ Node select | ✅ | ❌ |
| PRE_BATTLE | ✅ | ✅ Enemy entrance | ❌ | ✅ SFX | ❌ |
| PLAYER_TURN | ✅ | ✅ Battle | ✅ Card/End turn | ✅ SFX | ❌ |
| ENEMY_TURN | ✅ | ✅ Enemy action | ❌ | ✅ SFX | ✅ Enemy action timer |
| REWARD | ✅ | ✅ Reward UI | ✅ Card select | ✅ SFX | ❌ |
| EVENT | ✅ | ✅ Event UI | ✅ Choices | ✅ | ❌ |
| SHOP | ✅ | ✅ Shop UI | ✅ Buy/Remove | ✅ SFX | ❌ |
| REST | ✅ | ✅ Rest UI | ✅ Heal/Upgrade | ✅ | ❌ |
| VICTORY | ✅ | ✅ Victory sequence | ✅ Restart | ✅ Fanfare | ❌ |
| GAMEOVER | ✅ | ✅ Defeat sequence | ✅ Restart | ✅ SFX | ❌ |
| PAUSED | ✅ | ✅ Pause overlay | ✅ Resume/Quit | ❌ (BGM paused) | ❌ |
| CONFIRM_MODAL | ✅ | ✅ Modal overlay | ✅ Yes/No | ❌ | ❌ |

> **Key**: TweenMgr.update() is called in **all states**. Prevents Cycle 2 B1 (modal alpha=0) recurrence.

### 5.4 Main Game Loop (requestAnimationFrame)

```
gameLoop(timestamp):
  dt = (timestamp - lastTime) / 1000   // In seconds
  lastTime = timestamp

  // 1. System update (refer to matrix)
  tweenManager.update(dt)               // In all states
  if (TIMER_STATES[state]) updateTimer(dt)

  // 2. Rendering
  clearCanvas(ctx)
  renderBackground(ctx, state, floor)
  renderState(ctx, state, dt)           // State-specific render branch
  renderTransition(ctx, dt)             // Transition overlay

  // 3. Next frame
  requestAnimationFrame(gameLoop)
```

> **dt passing principle**: All render/update functions receive `dt` as parameter. Hardcoding forbidden (Cycle 8 lesson).

---

## §6. Card System

### 6.1 Card Types (4 Types)

| Type | Color | Description |
|------|-------|-------------|
| Attack (ATK) | `#E63946` Crimson | Deals damage to enemies. Requires target |
| Defense (DEF) | `#457B9D` Steel Blue | Gains block (armor). No target required |
| Skill (SKL) | `#2A9D8F` Emerald | Buff/debuff/draw and other special effects |
| Power (PWR) | `#E9C46A` Amber Gold | Permanent effects lasting the entire battle |

### 6.2 Starting Deck (10 Cards)

| Card Name | Type | Cost | Effect | Quantity |
|-----------|------|------|--------|----------|
| Strike | ATK | 1 | 6 Damage | 5 cards |
| Defend | DEF | 1 | 5 Block | 4 cards |
| Breakthrough | ATK | 2 | 10 Damage | 1 card |

### 6.3 Full Card Pool (30 Cards)

#### Attack Cards (ATK) — 10 Types
| # | Card Name | Cost | Effect | Rarity | Upgrade |
|---|-----------|------|--------|--------|---------|
| A1 | Strike | 1 | 6 Damage | Basic | 9 Damage |
| A2 | Breakthrough | 2 | 10 Damage | Basic | 14 Damage |
| A3 | Flurry | 1 | 3 Damage × 2 hits | Common | 3 × 3 hits |
| A4 | Pierce | 2 | 8 Damage + ignore block | Common | 12 Damage |
| A5 | Bleed | 1 | 4 Damage + Bleed 2 (3 turns) | Common | Bleed 3 (3 turns) |
| A6 | Rage Strike | 3 | 20 Damage | Rare | 28 Damage |
| A7 | Whirlwind | 2 | 8 AoE Damage | Rare | 12 AoE Damage |
| A8 | Exploit Weakness | 1 | 5 Damage, ×2 if Vulnerable | Rare | 7 Damage |
| A9 | Execute | 2 | 12 Damage, instant kill if HP<25% | Legendary | Threshold HP<33% |
| A10 | Blade Storm | 3 | 5 AoE Damage × 3 hits | Legendary | AoE 5 × 4 hits |

#### Defense Cards (DEF) — 8 Types
| # | Card Name | Cost | Effect | Rarity | Upgrade |
|---|-----------|------|--------|--------|---------|
| D1 | Defend | 1 | 5 Block | Basic | 8 Block |
| D2 | Iron Wall | 2 | 12 Block | Common | 16 Block |
| D3 | Counter | 1 | 4 Block + 4 Damage | Common | 6 each |
| D4 | Thorn Armor | 2 | 6 Block + Thorns 2 (2 turns) | Common | Thorns 3 |
| D5 | Restore | 1 | 3 Block + 3 HP Heal | Rare | 5 each |
| D6 | Fortress | 3 | 20 Block | Rare | 28 Block |
| D7 | Absorb | 2 | 8 Block + excess heals HP | Rare | 12 Block |
| D8 | Immortal | 3 | 15 Block + damage immunity this turn | Legendary | 20 Block |

#### Skill Cards (SKL) — 8 Types
| # | Card Name | Cost | Effect | Rarity | Upgrade |
|---|-----------|------|--------|--------|---------|
| S1 | Focus | 0 | Draw 1 card | Common | Draw 2 |
| S2 | Weaken | 1 | Apply Vulnerable 2 turns (target takes +50% damage) | Common | 3 turns |
| S3 | Disarm | 1 | Apply Weak 2 turns (target deals -25% damage) | Common | 3 turns |
| S4 | Battle Stance | 1 | Draw 2 cards + recover 1 mana | Rare | Draw 3 |
| S5 | Preemptive Strike | 0 | Next attack deals ×2 damage | Rare | All attacks +50% this turn |
| S6 | Chaos | 2 | Apply Weak 1 turn + Vulnerable 1 turn to all enemies | Rare | 2 turns each |
| S7 | Pickpocket | 1 | Gain 10~20 gold | Common | 15~30 |
| S8 | Purify | 1 | Remove all debuffs | Rare | + Draw 1 card |

#### Power Cards (PWR) — 4 Types
| # | Card Name | Cost | Effect | Rarity | Upgrade |
|---|-----------|------|--------|--------|---------|
| P1 | Warrior's Spirit | 2 | +2 Attack power at start of each turn (stacks) | Rare | +3 |
| P2 | Defensive Instinct | 2 | Automatically gain 3 Block at start of each turn | Rare | 5 Block |
| P3 | Poison Cloud | 2 | Deal 3 AoE damage at end of each enemy turn | Rare | 5 Damage |
| P4 | Berserker | 3 | Attack cards deal +3 damage, but -1 Block | Legendary | +5 Damage |

### 6.4 Rarity Distribution (Card Reward Probabilities)

| Rarity | Reward Rate | Shop Rate | Shop Price |
|--------|-------------|-----------|------------|
| Basic | Not in rewards | Not sold | — |
| Common | 60% | 60% | 30 gold |
| Rare | 30% | 30% | 60 gold |
| Legendary | 10% | 10% | 120 gold |

---

## §7. Combat System

### 7.1 Combat Values

```javascript
const CONFIG = {
  // Player
  PLAYER_MAX_HP: 80,
  PLAYER_START_HP: 80,
  MANA_PER_TURN: 3,
  HAND_SIZE: 5,

  // Block
  BLOCK_RESET_PER_TURN: true,   // Block resets to 0 at start of each turn

  // Debuffs
  VULNERABLE_MULTIPLIER: 1.5,   // Vulnerable: damage taken ×1.5
  WEAK_MULTIPLIER: 0.75,        // Weak: damage dealt ×0.75
  BLEED_DAMAGE_PER_TURN: 1,     // Bleed: bleed stacks × 1 per turn
  THORN_DAMAGE: 1,              // Thorns: thorn stacks × 1 on hit

  // Battle Rewards
  REWARD_CARD_CHOICES: 3,       // Reward card choices
  GOLD_PER_BATTLE: [10, 20],    // Normal battle gold (min, max)
  GOLD_PER_ELITE: [25, 40],     // Elite gold
  GOLD_PER_BOSS: [50, 80],      // Boss gold

  // Shop
  SHOP_CARD_COUNT: 3,
  SHOP_REMOVE_COST: 50,         // Card removal cost
  SHOP_POTION_COST: 30,         // HP potion price
  SHOP_POTION_HEAL: 20,         // HP potion heal amount

  // Rest
  REST_HEAL_PERCENT: 0.25,      // HP 25% recovery

  // Event
  EVENT_HP_COST: 10,            // Risky choice HP cost

  // Score (on run clear)
  SCORE_PER_REMAINING_HP: 2,
  SCORE_PER_GOLD: 1,
  SCORE_FLOOR_CLEAR_BONUS: 100,
  SCORE_BOSS_KILL_BONUS: 200,
  SCORE_PERFECT_BONUS: 500,     // No-damage boss fight
};
```

### 7.2 Enemy Monster Data

#### Regular Monsters (Floor 1~3)

| Name | HP | Action Pattern | Appearance Floor |
|------|-----|----------------|-----------------|
| Slime | 20 | Attack 6 → Defend 4 → Repeat | 1 |
| Goblin | 25 | Attack 8 → Attack 5 → Buff (Strength+2) → Repeat | 1~2 |
| Skeleton Warrior | 30 | Defend 6 → Attack 10 → Attack 10 → Repeat | 2 |
| Gargoyle | 35 | Attack 7 + Vulnerable 1 turn → Defend 8 → Attack 12 → Repeat | 2~3 |
| Dark Slime | 40 | Attack 5 × 2 hits → Buff (Strength+3) → Attack 8 → Repeat | 3 |

#### Elite Monsters

| Name | HP | Action Pattern | Appearance Floor |
|------|-----|----------------|-----------------|
| Orc Chief | 50 | Buff (Strength+3) → Attack 15 → Attack 12 + Weak 1 turn → Repeat | 2 |
| Night Reaper | 55 | Attack 8 × 2 hits → Defend 10 + Bleed 2 → Attack 18 → Repeat | 3 |

#### Bosses

| Name | HP | Action Pattern | Floor |
|------|-----|----------------|-------|
| Fire Dragon | 70 | [P1] Attack 10 → Defend 8 → Breath (AoE 15) → [P2: HP<50%] Buff (Strength+4) → Attack 18 → Breath 20 → Repeat | 1→2 |
| Frost Lich | 80 | [P1] Summon (Slime×1) → Attack 12 + Vulnerable 2 turns → Defend 10 → [P2: HP<40%] AoE Weak 2 turns → Attack 20 → Summon → Repeat | 2→3 |
| Dark Knight | 100 | [P1] Defend 12 → Attack 15 → Attack 10×2 → [P2: HP<50%] Buff (Strength+5, Thorns 2) → Attack 20 → AoE 15 → [P3: HP<25%] Frenzy (Strength+2 each turn) → Attack 25 → Repeat | Final |

### 7.3 Enemy Intent System
- Display the enemy's **next action** as an icon at the start of the turn
- Icon Canvas drawing: Small circle (diameter 24px) above enemy head
  - Attack: Red circle + sword shape (× lines) + damage value text
  - Defense: Blue circle + shield shape (semicircle) + block value
  - Buff: Purple circle + up arrow (△)
  - Debuff: Purple circle + down arrow (▽)

### 7.4 Damage Calculation Formula

```
Final Damage = floor(Base Damage × Strength Modifier × Weak Modifier × Vulnerable Modifier × Preemptive Modifier)

- Strength Modifier: 1 + (Strength stacks × 0.1)    // +10% per Strength
- Weak Modifier: 0.75 if attacker is Weak             // -25%
- Vulnerable Modifier: 1.5 if target is Vulnerable     // +50%
- Preemptive Modifier: 2.0 (one-time only)

Actual Damage = max(0, Final Damage - Target Block)
Target HP -= Actual Damage
Target Block = max(0, Target Block - Final Damage)
```

---

## §8. Map System

### 8.1 Map Generation (seededRng-based)

```
Each floor places nodes on a 3-row × node-count column grid:

Floor 1 example:
  Row 0: [Battle] ──→ [Battle] ──→ [Event] ──→ [Shop] ──→ [Boss Prep]
  Row 1: [Battle] ──↗          ↘ [Battle]  ──↗
  Row 2:          (connection)    (connection)

- 1 start node → 2~3 branches → converges to final node (boss/floor transition)
- Connection rule: Nodes in current column can connect to nodes within ±1 row range in next column
```

### 8.2 Map Rendering
- Nodes: Circle (r=18px) + type-specific icon + type-specific border color
- Connection lines: Gray straight lines (bright color only for traversable paths)
- Current position: Bright glow + player marker (small triangle)
- Visited nodes: Darkened tone + check mark

### 8.3 Node Colors

| Node Type | Icon Color | Icon Shape |
|-----------|------------|------------|
| Battle | `#E63946` | Crossed swords (× lines) |
| Elite | `#FF6B35` | Skull (circle + 2 hollow circles) |
| Shop | `#FFD60A` | Gold pouch (circle + triangle) |
| Event | `#2A9D8F` | Question mark (?) |
| Rest | `#4ADE80` | Campfire (triangle + flickering flame) |
| Boss | `#9B1B30` | Crown (3 triangles) |

---

## §9. Difficulty System

### 9.1 Default Difficulty: Easy
This game's default setting is **easy**, designed so that even strategy game beginners can enjoy it.

| Element | Easy Setting | Rationale |
|---------|-------------|-----------|
| Player starting HP | 80 | Generous HP allows for mistakes |
| Mana per turn | 3 | Sufficient action points |
| Enemy intent | **Always displayed (with values)** | Clear strategic judgment |
| Starting deck | 10 cards (Strike 5 + Defend 4 + Breakthrough 1) | Simple initial deck |
| Card reward choices | 3 cards | Sufficient selection |
| Normal battle enemy count | 1 monster | Minimal pressure |
| Shop card removal cost | 50 gold | Easy access to deck thinning |

### 9.2 Floor-based Difficulty Scaling

| Floor | Enemy HP Modifier | Enemy Damage Modifier | Enemy Count (Normal Battle) | Gold Reward Modifier |
|-------|-------------------|----------------------|----------------------------|---------------------|
| Floor 1 | ×1.0 | ×1.0 | 1 monster | ×1.0 |
| Floor 2 | ×1.2 | ×1.15 | 1~2 monsters | ×1.2 |
| Floor 3 | ×1.4 | ×1.3 | 1~2 monsters | ×1.5 |

### 9.3 Boss Pattern Difficulty
- Bosses undergo **phase transitions** at HP thresholds (attack pattern changes)
- Phase transitions include **1-turn preparation action** (defense only) → Gives player time to prepare
- Since intents are always displayed, learning boss patterns is the core strategy

---

## §10. Pure Function Design — Pre-defined Parameter Signatures

> **Principle**: All game logic functions do not directly access global variables; they receive necessary data as parameters. (Accumulated lesson from Cycles 6~8)

### 10.1 Combat Logic Functions

```javascript
// Damage calculation
calcDamage(baseDmg, attackerBuffs, defenderDebuffs) → number

// Apply card effect
applyCard(card, player, enemies, targetIdx, rng) → { player, enemies, log }

// Execute enemy action
executeEnemyAction(enemy, player, actionIdx) → { enemy, player, log }

// Determine enemy intent
getEnemyIntent(enemy, turnCount) → { type, value, icon }

// Apply block
applyBlock(target, amount) → target

// Apply debuff
applyDebuff(target, debuffType, duration) → target

// Debuff tick (at turn end)
tickDebuffs(target) → target

// Death check
checkDeath(entity) → boolean

// Battle end check
checkBattleEnd(player, enemies) → 'WIN' | 'LOSE' | null
```

### 10.2 Deck/Card Management Functions

```javascript
// Draw
drawCards(deck, discard, hand, count, rng) → { deck, discard, hand }

// Discard after card use
discardCard(hand, cardIdx, discard) → { hand, discard }

// Discard entire hand at turn end
discardHand(hand, discard) → { hand: [], discard }

// Generate reward cards
generateRewardCards(cardPool, count, rng, floor) → Card[]

// Add card to deck
addCardToDeck(deck, card) → deck

// Remove card from deck
removeCardFromDeck(deck, cardIdx) → deck

// Upgrade card
upgradeCard(card) → upgradedCard

// Shuffle
shuffleDeck(deck, rng) → deck
```

### 10.3 Map/Progression Functions

```javascript
// Map generation
generateMap(seed, floorNum) → MapNode[][]

// Determine reachable nodes
getReachableNodes(map, currentNode) → MapNode[]

// Generate event
generateEvent(rng, floor) → { text, choices }

// Generate shop items
generateShopItems(cardPool, rng, floor) → { cards, potionCost, removeCost }

// Calculate score
calcScore(hp, gold, floorsCleared, bossKills, perfectBosses) → number
```

### 10.4 Render Functions (ctx as First Parameter)

```javascript
renderCard(ctx, card, x, y, w, h, isSelected, isPlayable, dt)
renderEnemy(ctx, enemy, x, y, scale, dt)
renderPlayer(ctx, player, x, y, dt)
renderHPBar(ctx, current, max, x, y, w, h, color)
renderMana(ctx, current, max, x, y)
renderIntent(ctx, intent, x, y)
renderMap(ctx, map, currentNode, reachable, dt)
renderHand(ctx, hand, selectedIdx, mana, canvasW, canvasH, dt)
renderReward(ctx, choices, selectedIdx, dt)
renderShop(ctx, items, gold, dt)
renderEvent(ctx, event, selectedChoice, dt)
renderButton(ctx, text, x, y, w, h, isHovered)
```

---

## §11. Score System

### 11.1 Run Clear Score
```
Total Score = Remaining HP × 2 + Gold Held × 1 + Floors Cleared × 100 + Boss Kills × 200 + No-Damage Boss Fights × 500
```

### 11.2 Run Statistics (GAMEOVER / VICTORY Screen)
- Floors cleared (0~3)
- Enemies defeated
- Cards played
- Cards acquired
- Highest single damage
- Remaining HP / Max HP
- Gold held
- Total score

### 11.3 localStorage Save
```javascript
// Wrapped in try-catch for iframe sandbox safety (Cycle 1 pattern)
try {
  const best = JSON.parse(localStorage.getItem('mcb_best') || '{}');
  // Check first, save later (Cycle 2 B4 lesson)
  const isNewBest = score > (best.score || 0);
  if (isNewBest) {
    localStorage.setItem('mcb_best', JSON.stringify({ score, floor, ... }));
  }
} catch(e) { /* iframe sandbox — ignore */ }
```

### 11.4 Permanent Unlocks (Cross-run Progression)
| Unlock Condition | Reward |
|-----------------|--------|
| First run clear | Add "Flurry (A3)" to card pool |
| First time reaching Floor 2 | Add "Battle Stance (S4)" to card pool |
| First time reaching Floor 3 | Add "Warrior's Spirit (P1)" to card pool |
| First final boss kill | Add "Execute (A9)" to card pool |
| 3 clears | Add "Blade Storm (A10)" to card pool |
| 5 clears | Add "Immortal (D8)" to card pool |

> Initially the card pool is limited (basic + common focused) → More powerful cards appear as unlocks accumulate → Long-term retention.

---

## §12. Technical Architecture

### 12.1 Single HTML Structure
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>미니 카드 배틀러</title>
  <style>
    /* Inline CSS — System fonts, Canvas centering, background color */
  </style>
</head>
<body>
  <canvas id="gc"></canvas>
  <script>
    // Entire game code — Single <script> block
  </script>
</body>
</html>
```

### 12.2 Core Modules (Class/Function Groups Within Single File)

```
[Reusable Infrastructure]
├── TweenManager      — lerp+easing, clearImmediate() (Cycle 5 finalized version)
├── ObjectPool        — Card/enemy/particle object pooling (reverse iteration+splice)
├── TransitionGuard   — STATE_PRIORITY + beginTransition() + immediate mode
├── enterState()      — Unified state entry initialization (Cycle 5 finalized)
├── seededRng()       — LCG seed-based random (map/enemy/card reward generation)
├── WebAudioSFX       — Procedural sound effects (card play/attack/defense/victory/defeat)
└── DPR Canvas        — High-resolution support (Cycle 1 verified)

[New Modules]
├── CardSystem        — Card data, effect application, deck/hand/discard pile management
├── BattleSystem      — Turn progression, intent, damage calculation, debuff ticks
├── MapSystem         — Map generation, node connections, reachability checks
├── EnemyAI           — Enemy action patterns (index cycling), boss phase transitions
├── RewardSystem      — Card reward generation, shop items, event generation
├── UnlockSystem      — Permanent unlock condition checks, localStorage save
└── InputHandler      — Mouse/touch/keyboard unified input (state-specific branching)
```

### 12.3 TweenManager Usage Pattern (Turn-based Specific)

Since this is a turn-based game, tweens are used **for presentation only**:
- Card draw animation: Deck position → Hand position (0.3s, easeOutBack)
- Card play animation: Hand → Move to enemy position then disappear (0.2s)
- Enemy attack animation: Enemy dashes slightly forward (0.15s) → Returns (0.15s)
- Damage number popup: Floats upward from hit position then fades (0.5s)
- HP bar decrease: Current value → New value lerp (0.3s)
- Battle start/end: Fade transition (0.4s)
- **Max simultaneous tweens**: ~10 (very safe compared to dozens in real-time games)

### 12.4 Web Audio SFX Design

| Sound Effect | Frequency | Waveform | Duration | Trigger |
|-------------|-----------|----------|----------|---------|
| Card draw | 800→1200 Hz | sine | 0.08s | Draw animation |
| Attack hit | 200→100 Hz | sawtooth | 0.12s | Damage applied |
| Block gained | 600→800 Hz | triangle | 0.1s | Block added |
| Enemy death | 400→50 Hz | square→sine | 0.3s | HP ≤ 0 |
| Turn start | 500, 700 Hz (chord) | sine | 0.15s | Draw phase |
| Victory | C4→E4→G4→C5 | sine+triangle | 0.6s | Battle victory |
| Defeat | A3→F3→D3 | triangle | 0.5s | HP ≤ 0 (player) |
| Card select | 1000 Hz | sine | 0.05s | Card click |
| Gold gained | 1200→1500 Hz | sine | 0.1s | Gold added |
| Boss entrance | 80→120→80 Hz | sawtooth | 0.5s | Boss PRE_BATTLE |

---

## §13. Verification Checklist

### 13.1 pre-commit Hook (assets/ Directory Block)

```bash
#!/bin/sh
# .git/hooks/pre-commit — Must be actually registered!
if [ -d "games/mini-card-battler/assets" ]; then
  echo "❌ ERROR: assets/ directory exists! Remove before committing."
  exit 1
fi
```

**⚠️ Verification item**: Confirm `.git/hooks/pre-commit` file actually exists and has execute permission (Cycle 8 lesson: writing in spec ≠ actually registered)

### 13.2 Forbidden Pattern Automated Verification (grep)

| # | Forbidden Pattern | grep Command | On Violation |
|---|-------------------|-------------|--------------|
| 1 | External SVG reference | `grep -r "\.svg" games/mini-card-battler/` | FAIL |
| 2 | feGaussianBlur | `grep -r "feGaussianBlur" games/mini-card-battler/` | FAIL |
| 3 | Google Fonts | `grep -r "fonts.googleapis" games/mini-card-battler/` | FAIL |
| 4 | new Image() | `grep -r "new Image" games/mini-card-battler/` | FAIL |
| 5 | ASSET_MAP | `grep -r "ASSET_MAP\|SPRITES\|preloadAssets" games/mini-card-battler/` | FAIL |
| 6 | confirm()/alert() | `grep -r "confirm(\|alert(" games/mini-card-battler/` | FAIL |
| 7 | setTimeout state transition | `grep -r "setTimeout.*state\|setTimeout.*State" games/mini-card-battler/` | FAIL |
| 8 | assets/ directory | `ls games/mini-card-battler/assets/ 2>/dev/null` | FAIL |

### 13.3 Required Pattern Verification

| # | Required Pattern | Verification Method |
|---|-----------------|---------------------|
| 1 | beginTransition() routing | All state changes go through beginTransition (0 direct enterState calls) |
| 2 | STATE_PRIORITY map | Declared + all 14 states included |
| 3 | clearImmediate() usage | clearImmediate called in resetGame/goToTitle |
| 4 | isTransitioning guard | Guard check at beginTransition entry |
| 5 | try-catch localStorage | All localStorage access wrapped in try-catch |
| 6 | DPR Canvas | devicePixelRatio applied |
| 7 | system-ui font | font-family includes system-ui, 0 external fonts |

### 13.4 Spec Cross-reference Checklist

| # | Spec Item | Code Verification |
|---|-----------|-------------------|
| 1 | §2.3 Turn structure (6 stages) | Draw→Play→End Turn→Discard→Block Reset→Enemy Turn order |
| 2 | §3 All 3 control methods | Mouse/keyboard/touch all functional |
| 3 | §5.3 State×system matrix | TweenMgr always updated across 14 states |
| 4 | §6.2 Starting deck 10 cards | Strike 5 + Defend 4 + Breakthrough 1 = 10 cards |
| 5 | §6.3 Card pool 30 types | ATK 10 + DEF 8 + SKL 8 + PWR 4 = 30 types |
| 6 | §7.1 CONFIG values | All values match 1:1 (see §13.5) |
| 7 | §7.2 5 regular + 2 elite + 3 boss enemies | 10 total enemy types |
| 8 | §7.4 Damage formula | calcDamage function logic matches |
| 9 | §8.1 3-floor map | Floor 1~3 node composition matches |
| 10 | §9 Easy difficulty | Intent always displayed, HP 80, Mana 3 |
| 11 | §10 Pure functions | 0 global references (except rng, by design) |
| 12 | §11.4 6 permanent unlocks | Unlock conditions/rewards match |
| 13 | §12.4 10 SFX types | 10 Web Audio sound effects |
| 14 | 0 ghost variables | All declared variables verified for update/usage |

### 13.5 CONFIG Numerical Consistency Verification Table

| # | Spec Location | Value Name | Spec Value | Code Verified |
|---|--------------|------------|------------|---------------|
| 1 | §7.1 | PLAYER_MAX_HP | 80 | ☐ |
| 2 | §7.1 | MANA_PER_TURN | 3 | ☐ |
| 3 | §7.1 | HAND_SIZE | 5 | ☐ |
| 4 | §7.1 | VULNERABLE_MULTIPLIER | 1.5 | ☐ |
| 5 | §7.1 | WEAK_MULTIPLIER | 0.75 | ☐ |
| 6 | §7.1 | REWARD_CARD_CHOICES | 3 | ☐ |
| 7 | §7.1 | GOLD_PER_BATTLE | [10,20] | ☐ |
| 8 | §7.1 | GOLD_PER_ELITE | [25,40] | ☐ |
| 9 | §7.1 | GOLD_PER_BOSS | [50,80] | ☐ |
| 10 | §7.1 | SHOP_REMOVE_COST | 50 | ☐ |
| 11 | §7.1 | SHOP_POTION_COST | 30 | ☐ |
| 12 | §7.1 | SHOP_POTION_HEAL | 20 | ☐ |
| 13 | §7.1 | REST_HEAL_PERCENT | 0.25 | ☐ |
| 14 | §7.1 | SCORE_PER_REMAINING_HP | 2 | ☐ |
| 15 | §7.1 | SCORE_FLOOR_CLEAR_BONUS | 100 | ☐ |
| 16 | §7.1 | SCORE_BOSS_KILL_BONUS | 200 | ☐ |
| 17 | §7.1 | SCORE_PERFECT_BONUS | 500 | ☐ |
| 18 | §6.2 | Starting deck Strike count | 5 | ☐ |
| 19 | §6.2 | Starting deck Defend count | 4 | ☐ |
| 20 | §6.2 | Starting deck Breakthrough count | 1 | ☐ |
| 21 | §6.4 | Common drop rate | 60% | ☐ |
| 22 | §6.4 | Rare drop rate | 30% | ☐ |
| 23 | §6.4 | Legendary drop rate | 10% | ☐ |
| 24 | §7.2 | Slime HP | 20 | ☐ |
| 25 | §7.2 | Goblin HP | 25 | ☐ |
| 26 | §7.2 | Skeleton Warrior HP | 30 | ☐ |
| 27 | §7.2 | Gargoyle HP | 35 | ☐ |
| 28 | §7.2 | Dark Slime HP | 40 | ☐ |
| 29 | §7.2 | Orc Chief HP | 50 | ☐ |
| 30 | §7.2 | Night Reaper HP | 55 | ☐ |
| 31 | §7.2 | Fire Dragon HP | 70 | ☐ |
| 32 | §7.2 | Frost Lich HP | 80 | ☐ |
| 33 | §7.2 | Dark Knight HP | 100 | ☐ |
| 34 | §9.2 | Floor 2 HP modifier | ×1.2 | ☐ |
| 35 | §9.2 | Floor 3 HP modifier | ×1.4 | ☐ |

---

## §14. Structural Safety Summary of Turn-based Genre

| platform-wisdom Issue | Real-time Risk | Turn-based Risk | Reason |
|----------------------|---------------|----------------|--------|
| tween cancelAll+add race (Cycle 4) | 🔴 High | 🟢 Very Low | No simultaneous state transition scenario |
| Missing guard flags (Cycle 3) | 🔴 High | 🟢 Very Low | Events occur sequentially per turn |
| setTimeout abuse (Cycle 1~2) | 🟡 Medium | 🟢 Very Low | Waiting for player input = natural sync |
| State transition priority (Cycle 3) | 🔴 High | 🟢 Low | Clear sequence: turn end → reward → next turn |
| Physics/collision complexity | 🟡 Medium | 🟢 None | No physics engine required |
| bpm tween double-registration (Cycle 5) | 🟡 Medium | 🟢 None | No real-time value changes |

> **Turn-based card game = the safest game architecture.** Most problems accumulated over 9 cycles originated from real-time processing, and turn-based structurally avoids them.

---
