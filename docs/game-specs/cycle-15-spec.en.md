---
game-id: gem-warriors
title: Gem Warriors
genre: puzzle, action
difficulty: medium
---

# Gem Warriors — Detailed Game Design Document

_Cycle #15 | Date: 2026-03-21_

---

## §0. Previous Cycle Feedback Mapping

> Pre-emptive resolution of Cycle 14 post-mortem "areas for improvement" + platform-wisdom accumulated lessons at the design stage.

| # | Source | Issue | Resolution in This Spec | Section |
|---|--------|-------|------------------------|---------|
| F1 | Cycle 14 Improvement | First attempt (fruits-merge) failure wasted cycle resources | Raise spec completeness for 1st-pass APPROVED. Enhanced smoke test gate in §12 | §12 |
| F2 | Cycle 14 Improvement | Sound system unverified | Sound feel-test as dedicated verification item. 7+ SFX + BGM detailed in §9 | §9, §12.9 |
| F3 | Cycle 14 Improvement | No balance playtesting verification | §7.5 balance verification matrix — expected turns per stage, target clear rates | §7.5 |
| F4 | Cycle 14 Suggestion | Match-3 puzzle genre #1 recommendation | gem-warriors = Match-3 + RPG hybrid genre | §1 |
| F5 | Cycle 14 Suggestion | Equipment synergy sets, achievement system | 3 equipment sets + 20 achievements | §3.6, §7.4 |
| F6 | Cycle 1~14 wisdom | assets/ directory recurrence (recurring issue) | **Start from empty index.html.** No assets/ directory. 100% Canvas + Web Audio procedural | §8, §12.6 |
| F7 | Cycle 2 wisdom | Missing state × system matrix | §6 full state × system matrix (10 states × 6 systems) | §6 |
| F8 | Cycle 3/4 wisdom | Missing guard flags → repeated callbacks | `_transitioning` guard + TransitionGuard pattern on all state transitions | §6.2 |
| F9 | Cycle 2/5 wisdom | setTimeout state transitions | tween onComplete callbacks only. setTimeout completely prohibited | §5, §12.5 |
| F10 | Cycle 5 wisdom | Direct transitions bypassing beginTransition() | All screen transitions must go through beginTransition(). Only PAUSED exempted | §6.2 |
| F11 | Cycle 7/8 wisdom | Spec values ↔ code values mismatch | §13 numeric consistency verification table mandatory | §13 |
| F12 | Cycle 6 wisdom | Global-referencing functions → untestable | Pure function pattern — all game logic functions receive data via parameters | §10 |
| F13 | Cycle 10 wisdom | No try-catch in game loop | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` standard | §5.3 |
| F14 | Cycle 4 wisdom | TweenManager cancelAll/add race condition | Separate clearImmediate() API pattern | §5.2 |
| F15 | Cycle 3/7 wisdom | Ghost variables (declared but unused) | §13.2 variable usage verification table | §13.2 |
| F16 | Cycle 1 wisdom | confirm()/alert() unavailable in iframe | All confirmation UI via Canvas-based modals | §4.7 |
| F17 | Cycle 14 wisdom | Event listeners registered outside init() | **All event listeners registered only inside init()** | §5, §12.1 |
| F18 | Cycle 14 Improvement | No smoke test gate | Pre-review 3 stages: (1) index.html exists (2) load complete (3) 0 console errors | §12.7 |

---

## §1. Game Overview & Core Fun

### Concept
**Match gems to cast spells and conquer 30 dungeons!**

A **Match-3 RPG Battle** game where players charge mana by matching gems on an 8×8 grid, then activate skills to fight enemies. Combines the proven fun formula of Puzzle Quest / Empires & Puzzles with hero progression, equipment, and achievement systems.

### Core Fun Elements
1. **Strategic gem matching decisions**: Which color gems to match determines ATK/DEF/HEAL/SPECIAL mana. "4-match red gems for fire explosion? Or match green to heal first?" Strategic choices every turn
2. **Cascade explosion thrill**: Gem destruction → gravity → auto re-match chain reactions. 4-match = bomb gem, 5-match = line clear, L/T-shape = area blast — screen-filling explosions
3. **RPG growth loop**: Stage clear → XP & gold → stat upgrades + equipment → harder stages. "Just one more run" growth loop
4. **Boss tension**: World bosses disrupt the grid with special patterns (poison spread, gem lock, row destruction). Requires different strategies from normal combat
5. **Equipment set build diversity**: 3 sets (Fire/Ice/Nature) add bonus effects to gem matching → different builds each run

### Market Fit
- Match-3 is the undisputed #1 HTML5 game genre, yet completely absent from InfiniTriX
- Tower Swap (matching+strategy) achieved top rating on CrazyGames, validating hybrid matching
- Applies the proven Puzzle Quest / Empires & Puzzles fun formula

---

## §2. Game Rules & Objectives

### 2.1 Overall Structure
```
6 Worlds × 5 Stages = 30 Stages
  World 1: Forest (Lv 1~5)    — Basic enemies, matching tutorial
  World 2: Cave (Lv 6~10)     — Defensive enemies, bomb gem utilization
  World 3: Volcano (Lv 11~15) — Aggressive enemies, poison/burn debuffs
  World 4: Glacier (Lv 16~20) — Gem locking disruption, freeze mechanic
  World 5: Fortress (Lv 21~25) — Complex patterns, enemy buff mechanics
  World 6: Abyss (Lv 26~30)   — All mechanics combined, final boss
Each World's 5th stage = Boss battle
```

### 2.2 Combat Rules
1. **Turn structure**: Player turn (gem swap) → cascade processing → mana charge → skill auto/manual activation → enemy turn (attack) → repeat
2. **Gem matching**: Swap two adjacent gems to align 3+ of the same color in a row/column
3. **Invalid swap**: If no match results, swap is cancelled (gems return to original position with animation)
4. **Cascade**: Gem destruction → upper gems fall → empty cells filled with new gems → auto-match check → repeat
5. **Turn end**: When all cascades finish, enemy takes their turn
6. **Victory condition**: Reduce enemy HP to 0
7. **Defeat condition**: Hero HP reaches 0 — stage failed (keep 50% gold, return to world map)

### 2.3 Gem Types (5)
| Gem | Color | Mana Type | Effect |
|-----|-------|-----------|--------|
| 🔴 Fire Gem | `#E74C3C` | ATK mana | Direct attack damage |
| 🔵 Ice Gem | `#3498DB` | DEF mana | Shield generation |
| 🟢 Life Gem | `#2ECC71` | HEAL mana | HP recovery |
| 🟡 Lightning Gem | `#F1C40F` | SPECIAL mana | Special skill charge |
| 💜 Abyss Gem | `#9B59B6` | ULTIMATE mana | Ultimate charge (rare, 8% spawn rate) |

### 2.4 Special Match Rewards
| Match Pattern | Result |
|---------------|--------|
| 3 in a row | Basic match — mana +3 |
| 4 in a row | **Bomb Gem** created — destroys 3×3 area on activation, mana +5 |
| 5 in a row | **Line Clear** gem created — destroys entire row or column, mana +8 |
| L-shape / T-shape (3+3) | **Area Blast** gem created — cross(+) pattern destruction, mana +6 |
| Special + Special combination | Combo explosion (bomb+line=5×5, line+line=full cross, etc.) |

---

## §3. Hero System

### 3.1 Base Stats
| Stat | Initial | Per Level | Max (Lv 30) |
|------|---------|-----------|-------------|
| HP | 100 | +8 | 332 |
| ATK | 10 | +2 | 68 |
| DEF | 5 | +1 | 34 |
| SPD | 1.0 | +0.05 | 2.45 (match mana multiplier) |

### 3.2 Skills (4 Slots)

| Skill | Mana Cost | Effect | Unlock |
|-------|-----------|--------|--------|
| 🔥 Fire Strike | ATK 15 | Deal ATK×2.0 damage to enemy | Starting skill |
| 🛡️ Frost Barrier | DEF 12 | 40% damage reduction for 3 turns | Clear World 2 |
| 💚 Nature's Blessing | HEAL 18 | Heal 30% max HP + cleanse poison/burn | Clear World 3 |
| ⚡ Thunder Storm | SPECIAL 20 | Destroy 8 random gems + gain mana from each | Clear World 4 |
| 💎 Abyssal Strike | ULTIMATE 30 | Deal ATK×5.0 damage + shuffle entire grid | Clear World 5 |

> 4 skill slots available; 5th skill (Abyssal Strike) can replace an existing slot

### 3.3 Experience & Leveling
- Stage clear: `Base XP(50) + cascade bonus(cascade count × 10) + no-damage bonus(30)`
- Level-up XP required: `100 + (currentLevel × 50)`
- On level-up: Auto stat increase + 1 skill point

### 3.4 Equipment System
- **3 Slots**: Weapon (ATK↑), Armor (DEF↑ + HP↑), Accessory (SPD↑ + special effect)
- **Acquisition**: Boss kill drops (guaranteed) + normal stage drops (30% chance)
- **Grades**: Common (white) / Rare (blue) / Legendary (purple)

### 3.5 Equipment List (12 Items)

| Equipment | Slot | Grade | Effect | Set |
|-----------|------|-------|--------|-----|
| Wooden Sword | Weapon | Common | ATK +3 | - |
| Flame Sword | Weapon | Rare | ATK +6, Fire gem match damage +20% | Fire |
| Lava Greatsword | Weapon | Legendary | ATK +12, Fire 4-match inflicts burn (3 turns) | Fire |
| Ice Dagger | Weapon | Rare | ATK +5, Ice gem match 10% freeze chance | Ice |
| Leather Armor | Armor | Common | DEF +2, HP +15 | - |
| Flame Robe | Armor | Rare | DEF +4, HP +25, Burn immunity | Fire |
| Glacier Plate | Armor | Legendary | DEF +8, HP +40, Freeze immunity | Ice |
| Living Armor | Armor | Rare | DEF +3, HP +30, HP +2 per turn | Nature |
| Ruby Ring | Accessory | Common | SPD +0.1 | - |
| Flame Pendant | Accessory | Rare | SPD +0.15, Fire skill cost -3 | Fire |
| Nature Talisman | Accessory | Rare | SPD +0.1, HEAL match +30% efficiency | Nature |
| Abyssal Orb | Accessory | Legendary | SPD +0.2, Abyss gem spawn rate +4% | - |

### 3.6 Set Bonuses (F5)

| Set | 2-Piece Bonus | 3-Piece Bonus |
|-----|---------------|---------------|
| 🔥 Fire | Fire gem match deals 15% ATK as extra damage | Fire 4-match splashes to all enemies |
| ❄️ Ice | Ice gem match has 20% chance to freeze enemy 1 turn | Frost Barrier duration +2 turns |
| 🌿 Nature | HP +3 per turn regeneration | Life gem overheal converts to shield |

---

## §4. Controls

### 4.1 Keyboard
| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move gem selection cursor |
| Space / Enter | Select gem → use arrow keys for swap direction |
| 1~4 | Activate skill slot 1~4 |
| P / Escape | Pause |

### 4.2 Mouse
| Action | Result |
|--------|--------|
| Click + drag gem | Determines swap direction (mouse movement direction) |
| Click gem → click adjacent gem | Swap the two gems |
| Click skill icon | Activate that skill |
| Click pause button | Toggle pause |

### 4.3 Touch (Mobile)
| Action | Result |
|--------|--------|
| Touch + swipe gem | Determines swap direction (swipe direction) |
| Tap gem → tap adjacent gem | Swap the two gems |
| Tap skill icon | Activate that skill |
| Tap pause button | Toggle pause |

> **Touch minimum size**: All interactive elements guarantee `CONFIG.MIN_TOUCH_TARGET = 48`px minimum. Enforced via `touchSafe()` utility.

### 4.4 Gem Swap Details
- **Drag threshold**: 10px+ movement confirms swap direction (largest axis of 4 directions)
- **Swap animation**: 200ms ease-out tween
- **Invalid swap**: 100ms forward → 100ms return "shake" animation
- **Gem destruction animation**: 150ms scale 1→0 + alpha 1→0
- **Fall animation**: 80ms per cell, easeOutBounce

### 4.5 Skill Activation UI
- When mana sufficient: skill icon pulses to indicate active state
- When mana insufficient: greyed out + lock overlay
- On activation: 0.3s slow motion + screen flash effect

### 4.6 Gem Selection Feedback
- Mouse hover: slight enlarge (1.1x) + brightness increase
- Selected state: gem bounces + surrounding glow
- Swap hint: after 5 seconds of no input, one valid swap highlighted with shimmer

### 4.7 Canvas Modals (F16)
- All confirmation UI (stage clear/fail/level up/equipment drop) via Canvas-based modals
- `confirm()` / `alert()` usage prohibited
- Modal background: dark overlay (alpha 0.7) + center panel scale 0→1 tween

---

## §5. Core Game Loop (Frame-based Logic Flow)

### 5.1 Main Loop
```javascript
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // 50ms cap
    lastTime = timestamp;

    // Determine systems to update based on STATE_MATRIX
    const systems = STATE_MATRIX[currentState];

    if (systems.input)     inputManager.update(dt);
    if (systems.tween)     tweenManager.update(dt);
    if (systems.particles) particleManager.update(dt);
    if (systems.game)      gameLogic.update(dt);
    if (systems.audio)     audioManager.update(dt);
    if (systems.render)    renderer.render(dt);
  } catch (e) {
    console.error('[GameLoop Error]', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 5.2 TweenManager (F14)
- `clearImmediate()`: Immediately clears all tweens (prevents deferred cancelAll issue)
- `add()`: When adding new tween while `_pendingCancel` is active, flush first then add
- `update(dt)`: Update active tweens, call onComplete callbacks for finished tweens
- Deferred deletion pattern: deletion requests during update collected in `_toRemove` array, batch processed at end of update

### 5.3 Error-safe Loop (F13)
- Entire loop wrapped in try-catch
- requestAnimationFrame always re-called even on error
- Error logged to console (not displayed to user)

### 5.4 Combat Turn Flow
```
PLAYER_TURN:
  1. Wait for input (gem select + swap)
  2. Swap validity check
  3. Swap animation (tween 200ms)
  4. Match search (findMatches)
  5. Matched gem destruction animation (150ms)
  6. Mana charge + damage application
  7. Special gem creation (4/5/L/T match)
  8. Gravity + new gem generation (80ms per cell)
  9. → Return to 4 for cascade check (if no cascade, go to 10)
  10. Check skill mana threshold for auto/manual activation
  11. Enemy HP check → 0 means VICTORY

ENEMY_TURN:
  12. Show enemy action preview (0.5s)
  13. Enemy attack animation (tween 300ms)
  14. Damage calculation (enemy ATK - hero DEF, minimum 1)
  15. Apply shield
  16. HP decrease + hit effect
  17. Hero HP check → 0 means DEFEAT
  18. → PLAYER_TURN
```

---

## §6. State Machine

### 6.1 State List (10 States)

| State | Description |
|-------|-------------|
| TITLE | Title screen |
| WORLD_MAP | World/stage selection |
| EQUIP | Equipment management screen |
| BATTLE_INTRO | Battle start cinematic (enemy entrance) |
| PLAYER_TURN | Player gem matching turn |
| CASCADE | Cascade processing (input locked) |
| ENEMY_TURN | Enemy attack turn |
| VICTORY | Stage victory (rewards display) |
| DEFEAT | Stage defeat |
| PAUSED | Paused |

### 6.2 State × System Matrix (F7)

| State | Input | Tween | Particles | Game | Audio | Render |
|-------|-------|-------|-----------|------|-------|--------|
| TITLE | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| WORLD_MAP | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| EQUIP | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| BATTLE_INTRO | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| PLAYER_TURN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CASCADE | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ENEMY_TURN | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| VICTORY | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| DEFEAT | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| PAUSED | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |

### 6.3 State Transition Rules

```
TITLE → WORLD_MAP         (Start button)
WORLD_MAP → EQUIP         (Equipment button)
WORLD_MAP → BATTLE_INTRO  (Stage select)
EQUIP → WORLD_MAP         (Back button)
BATTLE_INTRO → PLAYER_TURN (Intro tween complete)
PLAYER_TURN → CASCADE     (After swap, match found)
PLAYER_TURN → PLAYER_TURN (After swap, no match — return animation)
CASCADE → PLAYER_TURN     (Cascade ends + enemy alive + no skill triggered)
CASCADE → ENEMY_TURN      (Cascade ends + enemy alive)
CASCADE → VICTORY         (Enemy HP ≤ 0 during cascade)
ENEMY_TURN → PLAYER_TURN  (Enemy attack complete + hero alive)
ENEMY_TURN → DEFEAT       (Hero HP ≤ 0)
VICTORY → WORLD_MAP       (Continue button)
DEFEAT → WORLD_MAP        (Confirm button)
ANY → PAUSED              (P/Escape, except TITLE)
PAUSED → previous state   (P/Escape)
```

### 6.4 TransitionGuard (F8, F10)
```javascript
const TransitionGuard = {
  _transitioning: false,
  beginTransition(from, to, duration = 0.3) {
    if (this._transitioning) return false; // Block double transitions
    this._transitioning = true;
    // fade-out tween → state change → fade-in tween
    tweenManager.add({
      target: screenAlpha, from: 1, to: 0, duration: duration / 2,
      onComplete: () => {
        currentState = to;
        tweenManager.add({
          target: screenAlpha, from: 0, to: 1, duration: duration / 2,
          onComplete: () => { this._transitioning = false; }
        });
      }
    });
    return true;
  }
};
```

### 6.5 STATE_PRIORITY (Race Condition Prevention)
```javascript
const STATE_PRIORITY = {
  DEFEAT: 100,    // Highest priority
  VICTORY: 90,
  PAUSED: 80,
  ENEMY_TURN: 50,
  CASCADE: 40,
  PLAYER_TURN: 30,
  BATTLE_INTRO: 20,
  WORLD_MAP: 10,
  EQUIP: 10,
  TITLE: 0
};
```

---

## §7. Difficulty System

### 7.1 Enemy Types (7)

| Enemy | First Appears | HP | ATK | Special Ability | Visual |
|-------|--------------|-----|-----|-----------------|--------|
| 🟢 Slime | W1-1 | 40 | 5 | None (tutorial enemy) | Oval jelly shape, 2 eyes |
| 💀 Skeleton | W1-3 | 60 | 8 | ATK +2 buff every 2 turns | Skull + bone shape |
| 🪨 Golem | W2-1 | 120 | 6 | DEF 5, converts 2 gems to stone every 3 turns | Rock mass shape |
| 🧙 Wizard | W3-1 | 70 | 12 | Changes color of 1 random column gem every 2 turns | Robe + staff |
| 🕷️ Venom Spider | W3-3 | 80 | 10 | Poisons each turn (2 turns, HP -5/turn) | Spider silhouette |
| 🛡️ Dark Knight | W5-1 | 150 | 14 | DEF 8, defensive stance every 4 turns (70% dmg reduction 1 turn) | Armored knight |
| 🐉 Dragon King | W6-5 (Final Boss) | 500 | 20 | See §7.3 | Large dragon |

### 7.2 World Enemy Composition

| Stage | Enemy Composition |
|-------|-------------------|
| W1-1 ~ W1-4 | 1~2 Slimes |
| W1-5 (Boss) | **Giant Slime** (HP 200, splits: spawns 2 mini-slimes below 50% HP) |
| W2-1 ~ W2-4 | Skeleton + Golem mix |
| W2-5 (Boss) | **Golem King** (HP 300, converts 1 gem row to stone every 3 turns) |
| W3-1 ~ W3-4 | Wizard + Venom Spider mix |
| W3-5 (Boss) | **Archmage** (HP 350, changes 3 gem colors per turn + screen shake attack every 2 turns) |
| W4-1 ~ W4-4 | Golem + Wizard + Venom Spider mix |
| W4-5 (Boss) | **Frost Giant** (HP 400, freezes 2 gems/turn (3-turn lock) + full freeze attempt every 4 turns) |
| W5-1 ~ W5-4 | Dark Knight + Wizard + Skeleton mix |
| W5-5 (Boss) | **Dark Lord** (HP 450, summons Skeleton every 3 turns, self-heal HP +5/turn) |
| W6-1 ~ W6-4 | All enemy types mixed (2~3 enemies) |
| W6-5 (Final Boss) | **Dragon King** (see §7.3) |

### 7.3 Final Boss: Dragon King

| Phase | HP Range | Pattern |
|-------|----------|---------|
| 1 | 500~350 | Basic attack (20) + fire breath every 2 turns (AoE 15) |
| 2 | 350~150 | ATK +5, converts 2 gems to fire gems each turn (deal 3 dmg to player on destruction) |
| 3 | 150~0 | ATK +10, destroys 1 gem row every 2 turns + ultimate every 3 turns (AoE 40, 1-turn warning) |

> Phase transitions: 0.5s slow motion + screen shake + boss roar sound

### 7.4 Achievement System (20 Achievements, F5)

| # | Achievement | Condition | Reward |
|---|------------|-----------|--------|
| 1 | First Steps | Clear Stage 1 | 50 Gold |
| 2 | Taste of Chains | Achieve 3+ cascade | 100 Gold |
| 3 | Bomb Master | Use bomb gems 10 times | 150 Gold |
| 4 | Perfect Victory | Clear stage with no damage | 200 Gold |
| 5 | Forest Guardian | Complete World 1 | Equipment: Leather Armor |
| 6 | Cave Explorer | Complete World 2 | Equipment: Ice Dagger |
| 7 | Volcano Conqueror | Complete World 3 | Equipment: Flame Robe |
| 8 | Glacier Ruler | Complete World 4 | Equipment: Glacier Plate |
| 9 | Fortress Hero | Complete World 5 | Equipment: Abyssal Orb |
| 10 | Abyssal Legend | Complete World 6 (Kill Dragon King) | Title: "Dragon Slayer" |
| 11 | 5-Chain Storm | Achieve 5+ cascade | 300 Gold |
| 12 | Gem Collector | Match 1000 total gems | 200 Gold |
| 13 | Skill Master | Use skills 50 times | 250 Gold |
| 14 | Equipment Collector | Acquire 6+ equipment pieces | 300 Gold |
| 15 | Set Complete | Activate 1 set bonus | 200 Gold |
| 16 | Line Master | Use line clear gems 5 times | 200 Gold |
| 17 | All Clear | Clear all 30 stages | Title: "Gem Master" |
| 18 | Combo King | Destroy 50+ gems in a single turn | 500 Gold |
| 19 | Survival Expert | Clear stage with HP below 10% | 300 Gold |
| 20 | Speed Runner | Clear stage in 5 turns or less | 400 Gold |

### 7.5 Balance Verification Matrix (F3)

| World | Avg Enemy HP | Expected Hero ATK | Expected Turns | Target Clear Rate |
|-------|-------------|-------------------|----------------|-------------------|
| W1 | 50 | 10~16 | 6~10 turns | 95% |
| W2 | 90 | 16~22 | 8~14 turns | 85% |
| W3 | 100 | 22~30 | 10~16 turns | 75% |
| W4 | 130 | 30~40 | 12~18 turns | 65% |
| W5 | 150 | 40~52 | 14~20 turns | 55% |
| W6 | 180 | 52~68 | 16~24 turns | 45% |
| Boss | 200~500 | World-level ATK | 20~35 turns | 40~60% |

> Balance formula: `Enemy HP / (Hero ATK × average match damage multiplier 1.5) = Expected Turns`
> On defeat, 50% gold retained → equipment/level-up increases clear rate on retry

---

## §8. Visual Style Guide

### 8.1 Color Palette

| Usage | Color | HEX |
|-------|-------|-----|
| Background (base) | Dark navy | `#1A1A2E` |
| Background (gradient) | Deep purple | `#16213E` |
| Fire Gem | Vibrant red | `#E74C3C` |
| Ice Gem | Cool blue | `#3498DB` |
| Life Gem | Fresh green | `#2ECC71` |
| Lightning Gem | Bright yellow | `#F1C40F` |
| Abyss Gem | Mystic purple | `#9B59B6` |
| UI Text | Bright white | `#ECF0F1` |
| UI Accent | Gold | `#F39C12` |
| HP Bar | Red→Green gradient | `#E74C3C` → `#2ECC71` |
| Mana Bar | Gem-matching color | Same as gem colors |
| Grid Background | Semi-transparent dark | `rgba(0,0,0,0.3)` |
| Grid Border | Soft grey | `#34495E` |

### 8.2 Gem Design
- **Shape**: Octagonal cut gems (diamond cutting style)
- **Size**: Grid cell size `(gridWidth / 8) - 4`px, minimum 40px
- **Effects**: Internal gradient + white highlight reflection + subtle pulse idle animation
- **Special gems**: Base shape + internal symbol (bomb=⚡, line=→, area=✦)
- Procedural Canvas drawing (no SVG files needed)

### 8.3 Character Design
- **Hero**: Canvas procedural — medieval knight silhouette (helmet+sword+shield)
  - idle: subtle breathing animation (2px up/down, 1.5s cycle)
  - attack: sword swing motion (0.3s)
  - hit: red flash + knockback (0.2s)
  - skill: skill-colored glow + effect overlay
- **Enemies**: Type-specific procedural drawing (see §7.1 visual descriptions)
  - Bosses: 2× size of normal enemies + glow aura + dedicated idle animation

### 8.4 Background Layers (3~4 Layer Parallax)
| Layer | Content | Scroll Speed |
|-------|---------|-------------|
| Far (back) | Sky/cave ceiling gradient | Static |
| Mid | Distant mountain/rock/structure silhouettes | 0.1x |
| Near | Foreground trees/pillars/decorations | 0.3x |
| Foreground | Battle platform + grid frame | Static |

> World-specific color shifts:
> - W1 Forest: Green + Brown
> - W2 Cave: Dark Brown + Grey
> - W3 Volcano: Red + Orange
> - W4 Glacier: Sky Blue + White
> - W5 Fortress: Deep Purple + Grey
> - W6 Abyss: Black + Purple + Red

### 8.5 Particle System

| Particle | Trigger | Count | Lifetime | Color |
|----------|---------|-------|----------|-------|
| Gem shards | Match destruction | 8/gem | 0.4s | Gem color |
| Chain lightning | 3+ cascade | 12 | 0.3s | White + Yellow |
| Bomb explosion | Bomb gem activation | 20 | 0.5s | Orange + Red |
| Skill activation | Skill use | 15 | 0.6s | Skill color |
| Hit effect | Enemy/Hero hit | 6 | 0.3s | Red |
| Level up | Level up | 30 | 1.0s | Gold + White |
| Boss entrance | Boss battle start | 25 | 0.8s | Purple + Black |
| Healing | HP recovery | 10 | 0.5s | Green + White |

> ObjectPool: 60 particles + 10 popup texts pre-allocated

### 8.6 Screen Effects
- **Screen Shake**: On hit (intensity: 3px, duration: 0.15s), Boss attack (intensity: 6px, duration: 0.3s)
- **Slow Motion**: Skill activation (rate: 0.3x, duration: 0.3s), Phase transition (rate: 0.2x, duration: 0.5s)
- **Flash**: Critical hit white overlay (alpha 0.3, 0.1s)
- **Glow**: Gem match bloom in matching color (radius 8px), special gems constant glow

### 8.7 UI Animations
- **Damage numbers**: Popup text rising and fading out (0.8s)
- **HP bar**: Value change tween (0.3s ease-out)
- **Mana bar**: Fill-up tween on charge (0.2s) + pulse when full
- **Gold/XP**: Count-up animation (0.5s)
- **Buttons**: Hover scale 1.05 + brightness increase, Click scale 0.95

### 8.8 Canvas Resolution
- `canvas.width = window.innerWidth * devicePixelRatio`
- `canvas.height = window.innerHeight * devicePixelRatio`
- `ctx.scale(devicePixelRatio, devicePixelRatio)`
- Recalculate on resize event

---

## §9. Sound System (F2)

### 9.1 Implementation
- **Web Audio API** native scheduling only (`ctx.currentTime + offset`)
- **setTimeout completely prohibited** (F9)
- Mobile Audio Context resume handling (on first touch)
- `SoundManager` singleton: 1 BGM channel + 4 SFX simultaneous channels

### 9.2 BGM (Procedurally Generated)
| Track | Context | Characteristics |
|-------|---------|-----------------|
| Title | TITLE screen | Calm arpeggio, C major |
| Battle | PLAYER_TURN/ENEMY_TURN | Tense rhythm, A minor, BPM 120 |
| Boss | Boss stages | Battle BGM variation, BPM 140, enhanced bass |
| Victory | VICTORY | Bright fanfare, C major |
| Defeat | DEFEAT | Slow descending melody, D minor |

### 9.3 Sound Effects (7+ Types, F2)

| # | SFX | Trigger | Implementation |
|---|-----|---------|---------------|
| 1 | Gem Swap | Successful gem swap | Short "ding" (sine 800Hz, 0.1s) |
| 2 | Match Destroy | 3-gem match | "Pop" (square 400Hz→200Hz, 0.15s) |
| 3 | Cascade | Cascade occurs (rising pitch) | Pitch +100Hz per cascade level |
| 4 | Special Gem | 4/5/L/T match | "Bang!" (noise burst + sine sweep, 0.3s) |
| 5 | Enemy Hit | Damage to enemy | "Thud" (noise 0.1s + sine 200Hz) |
| 6 | Hero Hit | Hero takes damage | Low "Boom" (sine 100Hz, 0.2s) |
| 7 | Skill Cast | Skill activation | Skill-specific timbre (sweep + reverb, 0.5s) |
| 8 | Level Up | Level up | Rising arpeggio (C-E-G-C, 0.6s) |

### 9.4 Sound Feel-Test Checklist (F2)
- [ ] BGM plays/transitions correctly on each screen
- [ ] Boss battle BGM distinguishable from normal combat
- [ ] Cascade pitch escalation is perceptible
- [ ] Skill activation sound syncs with visual effect
- [ ] Sound plays correctly on mobile after first touch
- [ ] No clipping when multiple SFX play simultaneously
- [ ] Mute toggle responds immediately

---

## §10. Pure Function Design (F12)

### Core Game Logic Functions — No Global Dependencies

| Function | Parameters | Return Value | Description |
|----------|-----------|--------------|-------------|
| `findMatches(grid)` | 8×8 gem array | Match array [{cells, type}] | Find all valid matches |
| `isValidSwap(grid, r1, c1, r2, c2)` | Grid, 2 coordinate pairs | boolean | Swap validity check |
| `applyGravity(grid)` | 8×8 gem array | {newGrid, movements[]} | Apply gravity + return movement list |
| `fillEmptyCells(grid)` | 8×8 gem array | {newGrid, newGems[]} | Fill empty cells with new gems |
| `calcDamage(atk, def, multiplier)` | 3 numbers | number | Damage calculation (minimum 1) |
| `calcManaGain(matches, spdMultiplier)` | Match array, SPD | {atk, def, heal, special, ult} | Calculate mana gain |
| `checkSpecialGem(matchType, count)` | Match type, count | 'bomb'\|'line'\|'cross'\|null | Determine special gem |
| `getEnemyAction(enemy, turnCount)` | Enemy object, turn count | {type, value, description} | Determine enemy action |
| `calcXPReward(stage, cascades, noDamage)` | Stage, cascade count, no-damage | number | Calculate XP reward |
| `canLevelUp(currentXP, level)` | Current XP, level | boolean | Check level-up eligibility |
| `applyEquipStats(baseStats, equipment)` | Base stats, equipment array | {hp, atk, def, spd} | Apply equipment stats |
| `checkSetBonus(equipment)` | Equipment array | {setName, level} | Check set bonus |
| `getHintMove(grid)` | 8×8 gem array | {r1,c1,r2,c2}\|null | Find valid swap hint |

---

## §11. Scoring System

### 11.1 Score Earnings

| Action | Base Score | Multiplier |
|--------|-----------|-----------|
| 3-match | 30 | ×1 |
| 4-match (bomb) | 80 | ×1.5 |
| 5-match (line) | 150 | ×2 |
| L/T-match (area) | 120 | ×1.8 |
| Cascade bonus | +cascade count × 50 | Cumulative |
| Skill kill | +100 | ×1 |
| No-damage clear | +500 | ×1 |
| Boss kill | +1000 | ×1 |
| Stage clear | Turn bonus (under target turns: +300) | ×1 |

### 11.2 Gold
- Stage clear: `50 + (world × 20)` gold
- Boss clear: `200 + (world × 50)` gold
- On defeat: Keep 50% of held gold
- Usage: Equipment purchase (shop possible in future — currently drop-only)

### 11.3 Display Format
- Score: Comma-separated (e.g., 12,500)
- Gold: Gold icon + number (e.g., 💰 350)
- Experience: Bar format + percentage

---

## §12. Code Quality Checklist

### 12.1 Initialization Order (F5, F17)
```
1. Global constants / CONFIG declarations
2. Pure function definitions
3. Class definitions (TweenManager, ParticleManager, SoundManager, etc.)
4. State machine + STATE_MATRIX + STATE_PRIORITY definitions
5. DOM assignments (canvas = document.getElementById)
6. Event listener registration (inside init() only!)
7. init() call → Game start
```

### 12.2 Prohibited
- ❌ `setTimeout` / `setInterval` (replace with tween/Web Audio)
- ❌ `confirm()` / `alert()` / `prompt()` (replace with Canvas modals)
- ❌ `eval()` / `new Function()`
- ❌ Game logic functions with direct global variable references
- ❌ Creating `assets/` directory
- ❌ External CDN / Google Fonts
- ❌ SVG `<feGaussianBlur>` / `<filter>` (performance issues)
- ❌ `.innerHTML` usage (XSS risk)

### 12.3 Touch Accessibility
- All buttons: `Math.max(width, CONFIG.MIN_TOUCH_TARGET)` × `Math.max(height, CONFIG.MIN_TOUCH_TARGET)`
- `touchSafe(x, y, w, h)` utility enforcing minimum 48px
- `touch-action: none` + `passive: false` settings

### 12.4 Error Safety
- Game loop wrapped in try-catch (F13)
- requestAnimationFrame always re-called

### 12.5 State Transitions
- All state transitions through `beginTransition()` (F10)
- `_transitioning` guard prevents double transitions (F8)
- setTimeout usage: 0 target (F9)

### 12.6 Asset Policy (F6)
- **Start from empty index.html**
- `assets/` directory creation absolutely prohibited
- All graphics: Canvas procedural drawing
- All sounds: Web Audio API procedural generation
- SVG inline strings: defined as JS constants, no external files

### 12.7 Smoke Test Gate (F1, F18)
```
[Gate 1] File Structure Verification
  - [ ] index.html exists
  - [ ] assets/ directory absent
  - [ ] 0 external resource references

[Gate 2] Load Verification
  - [ ] Open index.html in browser
  - [ ] 0 console errors
  - [ ] Canvas rendering confirmed

[Gate 3] Functional Verification
  - [ ] Title screen displays
  - [ ] Gem grid displays
  - [ ] Gem swap works
  - [ ] Match destruction works
  - [ ] Enemy HP decreases
  - [ ] Sound playback confirmed
```

### 12.8 Regression Prevention
- When changing function signatures, verify all call sites
- When adding/changing state transitions, re-review STATE_MATRIX

### 12.9 Sound Testing (F2)
- BGM transition test (each screen)
- SFX simultaneous playback test (4 channels)
- Mobile Audio Context resume test
- Mute toggle test

---

## §13. Numeric Consistency Verification (F11)

### 13.1 Core Values Table

| Item | Spec Value | Code Constant | Verified |
|------|-----------|---------------|----------|
| Grid size | 8×8 | `CONFIG.GRID_SIZE = 8` | |
| Gem types | 5 | `CONFIG.GEM_TYPES = 5` | |
| Abyss gem spawn rate | 8% | `CONFIG.PURPLE_RATE = 0.08` | |
| Hero initial HP | 100 | `CONFIG.HERO_BASE_HP = 100` | |
| Hero initial ATK | 10 | `CONFIG.HERO_BASE_ATK = 10` | |
| Hero initial DEF | 5 | `CONFIG.HERO_BASE_DEF = 5` | |
| HP per level | +8 | `CONFIG.HP_PER_LEVEL = 8` | |
| ATK per level | +2 | `CONFIG.ATK_PER_LEVEL = 2` | |
| DEF per level | +1 | `CONFIG.DEF_PER_LEVEL = 1` | |
| Level-up XP formula | 100 + Lv×50 | `CONFIG.XP_FORMULA(lv)` | |
| Fire Strike mana cost | 15 | `SKILLS.FIRE_STRIKE.cost = 15` | |
| Death gold retention | 50% | `CONFIG.DEATH_GOLD_KEEP = 0.5` | |
| Touch minimum size | 48px | `CONFIG.MIN_TOUCH_TARGET = 48` | |
| Swap animation | 200ms | `CONFIG.SWAP_DURATION = 0.2` | |
| Destroy animation | 150ms | `CONFIG.DESTROY_DURATION = 0.15` | |
| Fall speed | 80ms/cell | `CONFIG.FALL_SPEED = 0.08` | |
| dt maximum | 50ms | `CONFIG.MAX_DT = 0.05` | |
| Dragon King HP | 500 | `ENEMIES.DRAGON_KING.hp = 500` | |
| Dragon King ATK | 20 | `ENEMIES.DRAGON_KING.atk = 20` | |

### 13.2 Variable Usage Verification (F15)

| Variable | Declaration | Update Location | Read Location | Purpose |
|----------|------------|-----------------|---------------|---------|
| `currentState` | Global | beginTransition() | gameLoop, renderer | Current state |
| `heroStats` | Global | levelUp(), applyEquip() | calcDamage(), render | Hero stats |
| `grid` | Global | swap(), applyGravity(), fill() | findMatches(), render | Gem grid |
| `mana` | Global | calcManaGain() result applied | Skill activation check | 5 mana types |
| `cascadeCount` | Turn-local | CASCADE state | Score calc, SFX pitch | Current cascade count |
| `_transitioning` | TransitionGuard | beginTransition() | beginTransition() | Double transition prevention |

---

## §14. Sidebar & Card Metadata

### Game Page Sidebar Data

```yaml
game:
  title: "Gem Warriors"
  description: "Match gems to cast spells and conquer 30 dungeons! A Match-3 RPG puzzle battle with hero progression and equipment systems."
  genre: ["puzzle", "action"]
  playCount: 0
  rating: 0
  controls:
    - "Mouse: Click+drag gems to swap"
    - "Keyboard: Arrow keys to move cursor, Space to select"
    - "Touch: Touch+swipe gems to swap"
    - "1~4: Activate skills"
    - "P/Esc: Pause"
  tags:
    - "#match3"
    - "#RPG"
    - "#puzzle"
    - "#gems"
    - "#battle"
    - "#dungeon"
    - "#progression"
    - "#boss"
  addedAt: "2026-03-21"
  version: "1.0.0"
  featured: true
```

### Home Page GameCard Data

```yaml
thumbnail: "Game highlight — 8×8 gem grid + hero vs dragon boss battle + skill activation effects + HUD"
title: "Gem Warriors"
description: "Match gems to cast spells and conquer 30 dungeons! Match-3 RPG puzzle battle."
genre: ["puzzle", "action"]
playCount: 0
addedAt: "2026-03-21"  # Within 7 days → "NEW" badge shown
featured: true           # ⭐ badge shown
```

---

## §15. Expected Asset List (Procedural)

> All assets implemented as **Canvas procedural drawing**. 0 external SVG files.

| # | Asset | Implementation | Est. Drawing Function Size |
|---|-------|---------------|---------------------------|
| 1 | 5 Gem types (Fire/Ice/Life/Lightning/Abyss) | drawGem(ctx, type, x, y, size) | ~30 lines each |
| 2 | 3 Special gem types (Bomb/Line/Area) | drawSpecialGem(ctx, type, x, y, size) | ~20 lines each |
| 3 | Hero 4 poses (idle/attack/hit/skill) | drawHero(ctx, pose, x, y) | ~40 lines each |
| 4 | Slime | drawSlime(ctx, x, y, hp) | ~25 lines |
| 5 | Skeleton | drawSkeleton(ctx, x, y, hp) | ~30 lines |
| 6 | Golem | drawGolem(ctx, x, y, hp) | ~35 lines |
| 7 | Wizard | drawWizard(ctx, x, y, hp) | ~30 lines |
| 8 | Venom Spider | drawSpider(ctx, x, y, hp) | ~30 lines |
| 9 | Dark Knight | drawDarkKnight(ctx, x, y, hp) | ~35 lines |
| 10 | Dragon King (large) | drawDragonKing(ctx, x, y, phase) | ~60 lines |
| 11 | Boss: Giant Slime | drawGiantSlime(ctx, x, y) | ~30 lines |
| 12 | Boss: Golem King | drawGolemKing(ctx, x, y) | ~35 lines |
| 13 | Boss: Archmage | drawArchMage(ctx, x, y) | ~35 lines |
| 14 | Boss: Frost Giant | drawFrostGiant(ctx, x, y) | ~35 lines |
| 15 | Boss: Dark Lord | drawDarkLord(ctx, x, y) | ~40 lines |
| 16 | Backgrounds 4 layers × 6 worlds | drawBackground(ctx, world, layer) | ~40 lines/world |
| 17 | HUD (HP/Mana/Skill bar) | drawHUD(ctx, state) | ~80 lines |
| 18 | 8 Particle types | drawParticle(ctx, type) | ~10 lines each |
| 19 | Thumbnail (game highlight scene) | drawThumbnail(ctx) | ~50 lines |

**Estimated code size**: 2000~2200 lines

---

## §16. Implementation Priority

```
Phase 1 — Core (Essential)
  ✅ 8×8 grid + gem swap + match algorithm + gravity
  ✅ Basic combat (hero vs 1 enemy)
  ✅ State machine (TITLE, BATTLE, VICTORY, DEFEAT)
  ✅ 5 gem types procedural drawing
  ✅ Basic HUD (HP, mana, score)

Phase 2 — Systems
  ✅ Special gems (bomb, line, area)
  ✅ Skill system 4 slots
  ✅ XP + leveling
  ✅ 7 enemy types procedural drawing
  ✅ World map (30 stages)

Phase 3 — Depth
  ✅ Equipment system 12 items + set bonuses
  ✅ 5 boss battles + final boss 3 phases
  ✅ 20 achievements
  ✅ Background parallax + particle system

Phase 4 — Polish
  ✅ Sound system (5 BGM tracks + 8 SFX)
  ✅ Screen shake + slow motion
  ✅ Hint system
  ✅ Keyboard/mouse/touch triple input
  ✅ Smoke test pass
```
