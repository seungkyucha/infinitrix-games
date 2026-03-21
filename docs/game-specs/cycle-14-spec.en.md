---
game-id: mini-dungeon-dice
title: Mini Dungeon Dice
genre: action, strategy
difficulty: medium
---

# Mini Dungeon Dice — Detailed Game Design Document

_Cycle #14 | Date: 2026-03-21_

---

## §0. Previous Cycle Feedback Mapping

> Proactive countermeasures for Cycle 13 postmortem "regrets" + platform-wisdom accumulated lessons at the design stage.

| # | Source | Problem | Solution in This Spec | Section |
|---|--------|---------|----------------------|---------|
| F1 | Cycle 13 regrets | 3 review cycles — `CONFIG.MIN_TOUCH_TARGET` declaration-implementation gap | All button rendering **directly references** `btnW = CONFIG.MIN_TOUCH_TARGET`, `btnH = CONFIG.MIN_TOUCH_TARGET`. Math.max utility unnecessary — size specified at declaration | §4, §12.3 |
| F2 | Cycle 13 regrets | SoundManager setTimeout remaining | Web Audio `ctx.currentTime + offset` native scheduling only. 0 setTimeout target | §9, §12.5 |
| F3 | Cycle 14 wisdom | Canvas event listener registered outside init() → TypeError | **All event listeners registered inside init() only.** Pre-DOM assignment DOM access blocked at source | §5, §12.1 |
| F4 | Cycle 14 wisdom | Pause button 48×36px — height insufficient | Button dimensions independently guaranteed at `CONFIG.MIN_TOUCH_TARGET` or above for **both width and height** | §4.7, §12.3 |
| F5 | Cycle 11/14 wisdom | let/const TDZ crash + initialization order error | Variable declaration → DOM assignment → Event registration → init() order explicit. §12.1 initialization order checklist | §5, §12.1 |
| F6 | Cycle 1~14 wisdom | assets/ directory recurrence (13 consecutive cycles) | **Start from blank index.html.** assets/ directory absolutely forbidden. 100% Canvas + Web Audio | §8, §12.6 |
| F7 | Cycle 2 wisdom | Missing state×system matrix | Full state×system matrix pre-written in §6 | §6 |
| F8 | Cycle 3/4 wisdom | Missing guard flags → repeated callback invocation | `transitioning` guard + TransitionGuard pattern applied to all state transitions | §6.2 |
| F9 | Cycle 2/5 wisdom | setTimeout state transitions | State transitions only via tween onComplete callbacks. setTimeout completely forbidden | §5, §12.5 |
| F10 | Cycle 5 wisdom | Direct transitions bypassing beginTransition() | All screen transitions must go through beginTransition(). Only PAUSED exempt | §6.2 |
| F11 | Cycle 7/8 wisdom | Spec values ↔ code values mismatch | §13 numerical consistency verification table mandatory | §13 |
| F12 | Cycle 6 wisdom | Global-referencing functions → untestable | Pure function pattern — all game logic functions receive data via parameters | §10 |
| F13 | Cycle 10 wisdom | Game loop try-catch not applied | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` applied by default | §5.3, §12.4 |
| F14 | Cycle 13 suggestion | Deepen simulation/management genre | action + strategy combination for genre balance improvement (action 18.8% → reinforced) | §1 |
| F15 | Cycle 14 wisdom | 3-stage smoke test not met | Pre-review submission: (1) index.html exists (2) Page loads (3) 0 console errors | §12.7 |
| F16 | Cycle 10 wisdom | Fix regression (render signature change) | Full-flow regression test mandatory after fixes | §12.8 |
| F17 | Cycle 3/7 wisdom | Ghost variables (declared but unused) | §13.2 variable usage verification table included | §13.2 |

---

## §1. Game Overview & Core Fun

### Concept
A **turn-based roguelite** where you roll dice to explore a dungeon. Each battle, roll 3~6 dice and place them in attack/defense/heal slots, upgrading or acquiring new dice as you clear floors. Defeat the Floor 5 boss to win.

### Core Fun Elements
1. **Strategic dice placement decisions**: 3~6 dice → 3 slots (attack/defense/heal). "Go all-in on attack this turn? Stack defense thick?" Every turn is a dilemma
2. **Roguelite replayability**: Random dice combinations + random enemy placement every run → infinite replay value
3. **Dice growth buildup**: Dice face upgrades and new dice acquired as floor clear rewards → "my dice are getting stronger" growth satisfaction
4. **3~5 minutes per run**: Short sessions for "just one more run" addiction

### Genre Balance Contribution
- Current platform: arcade 7 (43.8%), action 3 (18.8%, **lowest**)
- This game: **action + strategy** → addresses action shortage + strategy reinforcement

### Trend Alignment
- itch.io roguelite TOP genre: "Die in the Dungeon", "Dungeons & Degenerate Gamblers" — dice roguelites rapidly growing
- Turn-based so high compatibility with existing platform infrastructure (Cycle 10 card battler)

---

## §2. Game Rules & Objectives

### 2.1 Win Condition
- Defeat the final boss on floor 5

### 2.2 Lose Condition
- Player HP drops to 0 or below

### 2.3 Turn Flow
```
[Roll Dice] → [Place in Slots (drag or tap)] → [Battle Resolution] → [Result Display]
     ↓                                                                    ↓
  3~6 dice                                                          Enemy HP 0? → Next room/floor
  Auto-roll                                                         My HP 0? → Game Over
```

### 2.4 Battle Resolution Order
1. Player attack slot total → Subtract enemy defense, remaining reduces enemy HP
2. Enemy attack → Mitigated by player defense slot total, then HP reduced (minimum 0)
3. Player heal slot total → HP recovery (cannot exceed max HP)

### 2.5 Dungeon Structure
| Floor | Rooms | Normal | Elite | Boss | Floor Clear Reward |
|-------|-------|--------|-------|------|--------------------|
| 1F | 3 | 2 | 0 | 1 | Dice face +1 upgrade |
| 2F | 3 | 1 | 1 | 1 | New dice acquired (3→4) |
| 3F | 4 | 2 | 1 | 1 | Dice face +2 upgrade |
| 4F | 4 | 2 | 1 | 1 | New dice acquired (4→5) |
| 5F | 3 | 1 | 1 | 1 (final) | — (Victory screen) |

- **Total battles**: 17 (3+3+4+4+3)
- **Est. play time**: 3~5 minutes per run

### 2.6 Dice System

#### Dice Types (4)
| Type | Icon | Color | Face Range (Initial) | Description |
|------|------|-------|---------------------|-------------|
| Attack | Sword shape | `#FF6B6B` (red) | 1~4 | Damage to enemy |
| Defense | Shield shape | `#4ECDC4` (teal) | 1~3 | Mitigate incoming damage |
| Heal | Heart shape | `#45B7D1` (blue) | 1~2 | HP recovery |
| Wild | Star shape | `#F7DC6F` (yellow) | 1~3 | Placeable in any slot, bonus +1 |

#### Initial Dice Set
- Attack ×1, Defense ×1, Heal ×1 (3 total)
- Increases to 3→4→5 via 2F/4F clear rewards (max 6 with wild acquisition)

#### Dice Upgrades
- **Face upgrade**: Selected dice's max value +1 or +2 (varies by floor)
- **New dice acquisition**: 2 random of 4 types presented → Choose 1

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| `1`~`6` | Select dice (up to owned count) |
| `Q` / `W` / `E` | Place selected dice in attack/defense/heal slot |
| `Space` | Resolve battle (when all dice placed) |
| `R` | Reroll (1 per turn, 2 per floor limit) |
| `Esc` / `P` | Pause |

### 3.2 Mouse
| Action | Description |
|--------|-------------|
| Click dice | Select dice (highlight) |
| Click slot | Place selected dice in that slot |
| Drag dice → slot | Direct drag placement |
| Click "Battle" button | Resolve battle |
| Click "Reroll" button | Reroll (when remaining uses > 0) |

### 3.3 Touch (Mobile)
| Action | Description |
|--------|-------------|
| Tap dice | Select |
| Tap slot | Place |
| Drag dice → slot | Direct placement |
| Tap "Battle" button | Resolve battle |
| Tap "Reroll" button | Reroll |

> **All tappable elements**: Guaranteed ≥ `CONFIG.MIN_TOUCH_TARGET` (48px) (F1, F4 applied)
> **Touch settings**: `passive: false` + CSS `touch-action: none` scroll prevention

---

## §4. Visual Style Guide

### 4.1 Color Palette
| Usage | Color | HEX |
|-------|-------|-----|
| Background (dungeon) | Dark navy | `#1A1A2E` |
| Background gradient | Dark purple | `#16213E` |
| UI panel | Semi-transparent black | `rgba(0,0,0,0.7)` |
| Attack dice/slot | Red | `#FF6B6B` |
| Defense dice/slot | Teal | `#4ECDC4` |
| Heal dice/slot | Blue | `#45B7D1` |
| Wild dice | Yellow | `#F7DC6F` |
| Enemy HP bar | Crimson | `#E74C3C` |
| Player HP bar | Green | `#2ECC71` |
| Text main | White | `#FFFFFF` |
| Text sub | Light gray | `#B0B0B0` |
| Boss highlight | Gold | `#FFD700` |
| Slot empty | Dark purple | `#3D3D5C` |
| Slot filled | Dice color alpha 0.3 | — |

### 4.2 Background Style
- Dungeon brick pattern: Brick texture via repeated Canvas `fillRect`
- Per-floor color tint: 1F gray (`#2C2C3A`) → 2F brown (`#3A2C1A`) → 3F teal (`#1A3A3A`) → 4F purple (`#2E1A3A`) → 5F crimson (`#3A1A1A`)
- **Offscreen Canvas cache**: Render background once, reuse via `drawImage` (Cycle 13 pattern)

### 4.3 Dice Rendering
- **Size**: 64×64px (sufficient touch area)
- **Shape**: Rounded rectangle (cornerRadius 8px) + 3D effect (bottom 4px shadow + top highlight)
- **Pips**: Circular dots showing dice value (standard 1~6 layout)
- **Type indicator**: Distinguished by dice background color + small icon top-left (Canvas drawing)
- **Roll animation**: tween rotation(0→360°×3) + scale(0.5→1.2→1.0), 0.6s, easeOutBack
- **Selected state**: Bright border glow (globalAlpha pulse tween)

### 4.4 Enemy Rendering (Canvas Basic Shapes — 0 Assets)
| Enemy | Canvas Composition | Unique Color |
|-------|--------------------|-------------|
| Slime | Large circle (body) + small circle×2 (eyes) | `#27AE60` green |
| Bat | Triangle×2 (wings) + circle (head) + dot×2 (eyes) | `#8E44AD` purple |
| Skeleton Warrior | Circle (skull) + rect (armor) + line (sword) | `#ECF0F1` white+gray |
| Goblin Thief | Rect (body) + triangle (hat) + dot×2 (eyes) | `#D4AC0D` greenish-brown |
| Dark Mage | Triangle (robe) + circle (face) + small circle (staff gem) | `#6C3483` deep purple |
| Minotaur | Large rect (body) + triangle×2 (horns) + dot×2 (eyes) | `#873600` brown |
| Dragon (boss) | Large triangle (body) + circle (head) + triangle×2 (wings) + triangle (tail) | `#C0392B` crimson |

- On hit: Red flash (`globalAlpha` blink, 0.1s tween) + x-axis shake (±5px, 0.2s)
- Boss: Gold crown (`#FFD700`) additional rendering + 1.5× size

### 4.5 Slot UI
- 3 slots horizontally arranged: Attack (red border) | Defense (teal border) | Heal (blue border)
- When empty: Dashed border (`setLineDash([4,4])`) + center icon (alpha 0.3)
- When placed: Dice rendered at reduced size (48×48) + background color fill (alpha 0.2)
- Multiple dice placement: Horizontal row within slot (max 6, auto-scaling)

### 4.6 Damage/Heal Number Display
- **ObjectPool**-based popup text (pool size: 20)
- Red text `-5` (damage), green text `+3` (heal), teal `Block!` (full defense)
- Floats up and fades: tween `y -= 40`, `alpha 1→0`, 0.8s, easeOutCubic

### 4.7 Button Minimum Size Rules (F1, F4 Applied)
```
All interactive elements:
  width  >= CONFIG.MIN_TOUCH_TARGET (48px)
  height >= CONFIG.MIN_TOUCH_TARGET (48px)
```
| Element | Width | Height | Verified |
|---------|-------|--------|----------|
| Pause button | 48px | 48px | >= 48 ✅ |
| Battle button | 160px | 48px | >= 48 ✅ |
| Reroll button | 120px | 48px | >= 48 ✅ |
| Dice | 64px | 64px | >= 48 ✅ |
| Reward selection card | 120px | 160px | >= 48 ✅ |
| Start button | 200px | 56px | >= 48 ✅ |
| Restart button | 160px | 48px | >= 48 ✅ |
| Mute toggle | 48px | 48px | >= 48 ✅ |

---

## §5. Core Game Loop (Frame-based Logic Flow)

### 5.1 Main Loop Structure (F13 Applied)
```javascript
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.033); // 30fps floor
    lastTime = timestamp;

    update(dt);
    render(ctx, dt, timestamp);

    tweenManager.update(dt);
    particlePool.updateAll(dt);
    popupPool.updateAll(dt);
  } catch (e) {
    console.error('[GameLoop Error]', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 5.2 State Machine (9 States)
```
TITLE → DUNGEON_MAP → DICE_ROLL → DICE_PLACE → BATTLE_RESOLVE
                  ↑       ↓                          ↓
                  └── REWARD ←──── (floor boss clear) ┘
                                          ↓
                                    GAME_OVER / VICTORY
                          ↕
                        PAUSED
```

| State | Description |
|-------|-------------|
| `TITLE` | Title screen. "Start" button, best score display |
| `DUNGEON_MAP` | Current floor/room progress display. "Enter next room" button |
| `DICE_ROLL` | Dice roll animation (0.6s) → Auto-transition to DICE_PLACE |
| `DICE_PLACE` | Core decision-making. Drag/tap dice to place in slots |
| `BATTLE_RESOLVE` | Battle resolution sequence (attack→defense→heal sequential, 1.5s) |
| `REWARD` | Reward selection on floor boss clear (upgrade or new dice) |
| `GAME_OVER` | Defeat. Floor reached + score + "Restart" button |
| `VICTORY` | Floor 5 clear victory. Final score + "Restart" button |
| `PAUSED` | Paused. "Resume" / "To Title" buttons |

### 5.3 Initialization Order (F3, F5 Applied)
```
1. Global constant declarations (CONFIG object)
2. Utility class definitions (TweenManager, ObjectPool, TransitionGuard, SoundManager)
3. Game state variable declarations (let canvas, ctx, state, player, enemy, dice, ...)
4. Pure function definitions (§10 — rollDice, resolveBattle, getEnemyStats, etc.)
5. render/update function definitions
6. init() function definition:
   - canvas = document.getElementById('gameCanvas')
   - ctx = canvas.getContext('2d')
   - resizeCanvas()
   - Event listener registration (mousemove, mousedown, touchstart, touchmove, touchend, keydown)
   - SoundManager.init() (AudioContext creation)
   - enterState(TITLE)
   - requestAnimationFrame(gameLoop)
7. window.addEventListener('load', init)  ← Only immediately-executed code in file
```

> **Event listeners must only be registered inside init()** (F3)
> **let/const variables declared before first use** (F5)
> **canvas.addEventListener called only after canvas assignment** (F3)

---

## §6. State × System Matrix (F7 Applied)

### 6.1 Matrix

| State | TweenMgr | Particles | Popups | Input (dice) | Input (UI) | Audio | Render |
|-------|----------|-----------|--------|--------------|-----------|-------|--------|
| TITLE | ✅ | ❌ | ❌ | ❌ | ✅ (start) | ✅ | ✅ |
| DUNGEON_MAP | ✅ | ❌ | ❌ | ❌ | ✅ (next room) | ✅ | ✅ |
| DICE_ROLL | ✅ | ✅ (roll) | ❌ | ❌ | ❌ | ✅ (SFX) | ✅ |
| DICE_PLACE | ✅ | ❌ | ❌ | ✅ (drag/tap) | ✅ (battle/reroll) | ✅ | ✅ |
| BATTLE_RESOLVE | ✅ | ✅ (hit) | ✅ (damage) | ❌ | ❌ | ✅ (SFX) | ✅ |
| REWARD | ✅ | ✅ (reward) | ❌ | ❌ | ✅ (select) | ✅ | ✅ |
| GAME_OVER | ✅ | ❌ | ❌ | ❌ | ✅ (restart) | ✅ | ✅ |
| VICTORY | ✅ | ✅ (celebration) | ❌ | ❌ | ✅ (restart) | ✅ | ✅ |
| PAUSED | ✅ | ❌ | ❌ | ❌ | ✅ (resume/title) | ❌ | ✅ |

> **TweenMgr.update(dt) called in all states including PAUSED** (Cycle 2 B1 prevention)
> **Input system branches based on current state** — Matrix reference mandatory

### 6.2 State Transition Rules (F8, F9, F10 Applied)

#### TransitionGuard Priority
```javascript
const STATE_PRIORITY = {
  GAME_OVER: 100,    // Highest — Takes precedence over all transitions on HP 0 detection
  VICTORY: 90,
  PAUSED: 80,        // Exception: Immediate transition allowed (bypasses beginTransition)
  REWARD: 50,
  BATTLE_RESOLVE: 40,
  DICE_ROLL: 30,
  DICE_PLACE: 20,
  DUNGEON_MAP: 10,
  TITLE: 0
};
```

#### Transition Rules
1. **All state transitions go through `beginTransition(targetState)`** — Only PAUSED exempt (F10)
2. **`transitioning = true` guard during transitions** — Blocks duplicate transitions (F8)
3. **`enterState(targetState)` called on transition completion** — Unified state entry initialization
4. **Transitions triggered only via tween onComplete** — setTimeout absolutely forbidden (F9)
5. **GAME_OVER transition takes precedence over all** — `if (player.hp <= 0) return;` pre-check
6. **Transition animation**: Fade out (0.3s) → enterState → Fade in (0.3s)

---

## §7. Difficulty System

### 7.1 Enemy Stat Scaling (Pure Function)
```javascript
function getEnemyStats(floor, roomIndex, isElite, isBoss) {
  const baseHp  = 8 + floor * 4;            // 1F:12, 3F:20, 5F:28
  const baseAtk = 2 + Math.floor(floor * 1.5); // 1F:3, 3F:6, 5F:9
  const baseDef = Math.floor(floor * 0.5);   // 1F:0, 3F:1, 5F:2

  const eliteMul = isElite ? 1.5 : 1.0;
  const bossMul  = isBoss  ? 2.5 : 1.0;
  const roomMul  = 1 + roomIndex * 0.1;

  return {
    hp:  Math.floor(baseHp  * eliteMul * bossMul * roomMul),
    atk: Math.floor(baseAtk * eliteMul * bossMul * roomMul),
    def: Math.floor(baseDef * eliteMul * bossMul)
  };
}
```

### 7.2 Enemy Types (7)

| Enemy | Appearance Floor | Trait | HP/ATK/DEF Example (at respective floor) |
|-------|-----------------|-------|------------------------------------------|
| Slime | 1~2 | Basic. No special abilities | 12/3/0 |
| Bat | 1~3 | High attack, low HP | 8/5/0 |
| Skeleton Warrior | 2~4 | High defense | 16/4/2 |
| Goblin Thief | 2~4 | 2-hit attack (half attack power each) | 14/3×2/0 |
| Dark Mage | 3~5 | Reduces 1 player die value by -1 each turn | 16/5/1 |
| Minotaur | 3~5 (elite) | High HP and attack | 30/9/1 |
| Dragon | 5 (final boss) | 3-phase transitions | 70/9/2 |

### 7.3 Dragon Boss 3 Phases (Cycle 2 Pattern Reused)
| Phase | HP Range | Behavior |
|-------|----------|----------|
| Phase 1 | 100%~66% | Basic attack (ATK 9) |
| Phase 2 | 66%~33% | Attack ×1.5 + Nullifies 1 player defense slot |
| Phase 3 | 33%~0% | Attack ×2.0 + Self-heals 2HP per turn |

### 7.4 Reroll System
- **1 per turn**, **2 per floor** rerolls available
- Remaining uses shown on reroll button (e.g., "Reroll (1/2)")
- Reroll re-rolls all unplaced dice

---

## §8. Visual Rendering Principles (F6 Applied)

### 100% Canvas Code Drawing — Zero Assets
- **assets/ directory absolutely forbidden**
- **0 external file loads**: `fetch`, `new Image()`, `XMLHttpRequest` usage forbidden
- **0 external resources like Google Fonts**
- All visual elements: Canvas API (`fillRect`, `arc`, `lineTo`, `fillText`, etc.)
- Background texture: Offscreen Canvas one-time render → `drawImage` cache reuse

### Forbidden Pattern Automated grep Verification
```
❌ fetch(            ❌ new Image(         ❌ XMLHttpRequest
❌ assets/           ❌ .svg              ❌ .png
❌ feGaussianBlur    ❌ Google Fonts       ❌ @import url
❌ innerHTML         ❌ eval(              ❌ confirm(
❌ alert(            ❌ setTimeout(  (when used for state transitions/sound)
```

---

## §9. Sound System (F2 Applied)

### Web Audio API Only — 0 setTimeout
```javascript
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  init() {
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { console.warn('Web Audio unavailable'); }
  }
  play(type, startOffset = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + startOffset;
    // oscillator.start(t) / oscillator.stop(t + duration) ← native scheduling
  }
}
```

### Sound List
| Event | Waveform | Frequency | Duration | Scheduling |
|-------|----------|-----------|----------|-----------|
| Dice roll | noise (filtered) | 200~800Hz sweep | 0.3s | `t + 0` |
| Dice place | sine | C4 (261Hz) | 0.1s | `t + 0` |
| Attack hit | sawtooth | E3→C3 sweep down | 0.15s | `t + 0` |
| Defense block | triangle | G4 (392Hz) | 0.1s | `t + 0` |
| Heal | sine | C4→E4→G4 | 0.3s | `t + 0 / +0.1 / +0.2` |
| Boss entrance | sawtooth | C2 (65Hz) vibrato | 0.5s | `t + 0` |
| Floor clear | sine | C4-E4-G4-C5 arpeggio | 0.6s | `t + 0 / +0.15 / +0.3 / +0.45` |
| Game over | triangle | C3→A2 descending | 0.5s | `t + 0` |
| Victory fanfare | sine+triangle | C4-E4-G4-C5 chord | 1.0s | `t + 0` (simultaneous) |
| Button click | sine | A4 (440Hz) | 0.05s | `t + 0` |

---

## §10. Pure Function Design (F12 Applied)

> All game logic functions receive data via parameters. Direct global state reference forbidden.

| # | Function Name | Parameters | Return Value | Description |
|---|--------------|-----------|-------------|-------------|
| 1 | `rollDice(dice)` | `{type, minVal, maxVal}` | `number` | Single die roll |
| 2 | `rollAllDice(diceArray)` | `Dice[]` | `number[]` | Roll all dice |
| 3 | `resolveBattle(slots, enemy, player)` | Slot placement info, enemy, player | `{enemyDmg, playerDmg, healAmt, enemyDead, playerDead}` | Battle resolution |
| 4 | `getEnemyStats(floor, roomIdx, isElite, isBoss)` | Numeric args | `{hp, atk, def}` | Enemy stats |
| 5 | `getEnemyAction(enemy, floor, bossPhase)` | Enemy, floor, boss phase | `{atk, special}` | Enemy action determination |
| 6 | `upgradeDice(dice, amount)` | Dice, increment | `Dice` (new object) | Dice upgrade |
| 7 | `generateFloor(floorNum)` | Floor number | `Room[]` | Floor data generation |
| 8 | `calcScore(stats)` | `{floors, kills, damage, bosses}` | `number` | Score calculation |
| 9 | `hitTest(x, y, rect)` | Coordinates, `{x,y,w,h}` | `boolean` | Touch/click collision |
| 10 | `getBossPhase(hp, maxHp)` | HP values | `1\|2\|3` | Boss phase |
| 11 | `canPlaceDice(diceType, slotType)` | 2 types | `boolean` | Placement eligibility |
| 12 | `calcRerollsLeft(used, maxPerFloor)` | Used/max | `number` | Remaining rerolls |

---

## §11. Score System

### 11.1 Score Calculation
```javascript
function calcScore(stats) {
  return stats.floors * 200     // Floor clear
       + stats.kills * 50       // Enemy kill
       + stats.damage * 2       // Total damage
       + stats.bosses * 500     // Boss kill bonus
       + (stats.floors >= 5 ? 3000 : 0); // Completion bonus
}
```

| Element | Score |
|---------|-------|
| Floor clear | +200 / floor |
| Enemy kill | +50 / enemy |
| Boss kill | +500 / boss (separate bonus) |
| Total damage | +2 / damage |
| 5-floor completion bonus | +3000 |

### 11.2 Record Saving
- Best score + highest floor reached + total play count saved in `localStorage`
- try-catch wrapping (iframe sandbox support)
- **Check first, save later** (Cycle 2 B4 lesson)

---

## §12. Implementation Guidelines (platform-wisdom Applied)

### 12.1 Initialization Order Checklist (F3, F5)
- [ ] `CONFIG` constants declared at file top
- [ ] `let canvas, ctx` declaration before all function definitions
- [ ] `canvas = document.getElementById(...)` executed only inside `init()`
- [ ] All `addEventListener` called only inside `init()`
- [ ] `window.addEventListener('load', init)` is the only immediately-executed code

### 12.2 TweenManager Safety Rules
- `clearImmediate()` usage: When immediate cleanup needed in `resetGame()`, `goToTitle()`, etc.
- `cancelAll()` usage: On normal state transitions (deferred)
- **No add immediately after cancelAll** — Replace with clearImmediate then add (Cycle 4 B1 prevention)

### 12.3 Touch Target Enforcement (F1, F4)
```javascript
// Direct reference in all button rendering:
const btnH = CONFIG.MIN_TOUCH_TARGET; // 48px — Declaration-implementation gap blocked at source
```

### 12.4 Game Loop try-catch (F13)
```javascript
function gameLoop(ts) {
  try { /* update + render */ }
  catch(e) { console.error('[GameLoop]', e); }
  requestAnimationFrame(gameLoop);
}
```

### 12.5 setTimeout Prohibition Rule (F2, F9)
- State transitions: Only via tween onComplete callbacks
- Sound sequencing: Only via `ctx.currentTime + offset` native scheduling
- **0 setTimeout instances in code is the review PASS condition**

### 12.6 Zero Asset Principle (F6)
- assets/ directory creation forbidden. Start from blank index.html
- All visuals: Canvas API. All sounds: Web Audio API procedural generation

### 12.7 Smoke Test Gate (F15)
3 mandatory stages before review submission:
1. `index.html` file exists
2. Screen renders successfully on browser load (title screen displayed)
3. 0 console errors

### 12.8 Fix Regression Prevention (F16)
Full-flow regression test after fixes:
```
TITLE → DUNGEON_MAP → DICE_ROLL → DICE_PLACE → BATTLE_RESOLVE
  → (after room clear) DUNGEON_MAP → ... → REWARD → DUNGEON_MAP
  → GAME_OVER (HP 0)
  → VICTORY (5F clear)
  → PAUSED → Resume / To Title
```

---

## §13. Numerical Consistency Verification Table (F11)

### 13.1 CONFIG Values (30+)

| Constant Name | Spec Value | Usage |
|--------------|-----------|-------|
| `MIN_TOUCH_TARGET` | `48` | Minimum touch area px |
| `PLAYER_MAX_HP` | `30` | Player max HP |
| `INITIAL_DICE_COUNT` | `3` | Initial dice count |
| `MAX_DICE_COUNT` | `6` | Maximum dice count |
| `REROLLS_PER_FLOOR` | `2` | Rerolls per floor |
| `REROLLS_PER_TURN` | `1` | Max rerolls per turn |
| `TOTAL_FLOORS` | `5` | Total dungeon floors |
| `ROLL_ANIM_DURATION` | `0.6` | Roll animation seconds |
| `BATTLE_ANIM_DURATION` | `1.5` | Battle sequence seconds |
| `TRANSITION_DURATION` | `0.3` | Screen transition fade seconds |
| `DICE_SIZE` | `64` | Dice rendering px |
| `ATK_DICE_MIN` | `1` | Attack dice initial min |
| `ATK_DICE_MAX` | `4` | Attack dice initial max |
| `DEF_DICE_MIN` | `1` | Defense dice initial min |
| `DEF_DICE_MAX` | `3` | Defense dice initial max |
| `HEAL_DICE_MIN` | `1` | Heal dice initial min |
| `HEAL_DICE_MAX` | `2` | Heal dice initial max |
| `WILD_DICE_MIN` | `1` | Wild dice initial min |
| `WILD_DICE_MAX` | `3` | Wild dice initial max |
| `WILD_BONUS` | `1` | Wild bonus |
| `UPGRADE_SMALL` | `1` | Small face upgrade |
| `UPGRADE_BIG` | `2` | Large face upgrade |
| `SCORE_FLOOR` | `200` | Floor clear score |
| `SCORE_ENEMY` | `50` | Enemy kill score |
| `SCORE_BOSS` | `500` | Boss kill bonus |
| `SCORE_DAMAGE` | `2` | Score per damage |
| `SCORE_CLEAR_BONUS` | `3000` | Completion bonus |
| `BOSS_PHASE2_HP` | `0.66` | Phase 2 transition HP ratio |
| `BOSS_PHASE3_HP` | `0.33` | Phase 3 transition HP ratio |
| `BOSS_P2_ATK_MUL` | `1.5` | Phase 2 attack multiplier |
| `BOSS_P3_ATK_MUL` | `2.0` | Phase 3 attack multiplier |
| `BOSS_P3_HEAL` | `2` | Phase 3 self-heal |
| `POPUP_POOL_SIZE` | `20` | Popup text pool size |
| `PARTICLE_POOL_SIZE` | `50` | Particle pool size |

### 13.2 Variable Usage Verification (F17)

| Variable Name | Declaration | Update Location | Reference Location |
|--------------|------------|-----------------|-------------------|
| `transitioning` | Top-level | beginTransition(), enterState() | beginTransition() guard |
| `currentFloor` | init() | enterState(DUNGEON_MAP), nextFloor() | getEnemyStats(), generateFloor(), render |
| `currentRoom` | init() | nextRoom(), enterState(DUNGEON_MAP) | getEnemyStats(), render, room progression check |
| `rerollsUsedFloor` | enterState(DUNGEON_MAP) | reroll() | calcRerollsLeft(), reroll button render |
| `rerollsUsedTurn` | enterState(DICE_ROLL) | reroll() | Reroll availability check |
| `placedSlots` | enterState(DICE_PLACE) | placeDice(), removeDice() | canResolve(), render, resolveBattle() |
| `player.hp` | init(), resetGame() | resolveBattle() result apply | render, GAME_OVER check |
| `enemy` | enterState(DICE_ROLL) | resolveBattle() result apply | render, enemy death check |
| `score` | init(), resetGame() | Post-battle calcScore() | render, saveBest() |
| `selectedDice` | DICE_PLACE input | Dice click/tap | Referenced during slot placement |
| `diceResults` | enterState(DICE_ROLL) | rollAllDice() | render, value reference during placement |

---

## §14. Game Page Sidebar Metadata

```json
{
  "id": "mini-dungeon-dice",
  "title": "Mini Dungeon Dice",
  "description": "Roll dice to explore dungeons in this turn-based roguelite! Place dice in attack, defense, and heal slots to defeat the Floor 5 boss.",
  "genre": ["action", "strategy"],
  "playCount": 0,
  "rating": 0,
  "controls": [
    "1~6: Select dice",
    "Q/W/E: Place in attack/defense/heal slot",
    "Space: Resolve battle",
    "R: Reroll (2 per floor)",
    "P/Esc: Pause",
    "Mouse: Click/drag to place dice",
    "Touch: Tap/drag to place dice"
  ],
  "tags": ["#roguelite", "#dice", "#turnbased", "#dungeon", "#strategy"],
  "addedAt": "2026-03-21",
  "version": "1.0.0",
  "featured": true
}
```

---

## §15. Code Review Checklist (Self-verification After Implementation)

### 15.1 Forbidden Patterns (0 Instance Target)
- [ ] `assets/` directory exists → Must not exist
- [ ] `fetch(`, `new Image(`, `XMLHttpRequest` → 0 instances
- [ ] `.svg`, `.png`, `@import url` → 0 instances
- [ ] `feGaussianBlur` → 0 instances
- [ ] `setTimeout(` (state transition/sound) → 0 instances
- [ ] `alert(`, `confirm(`, `innerHTML`, `eval(` → 0 instances

### 15.2 Required Patterns (All PASS Target)
- [ ] `try-catch` game loop wrapping
- [ ] `CONFIG.MIN_TOUCH_TARGET` declared + directly referenced in all buttons
- [ ] State transitions via `beginTransition()` (PAUSED exempt)
- [ ] `transitioning` guard flag
- [ ] `enterState()` unified
- [ ] `clearImmediate()` usage (resetGame/goToTitle)
- [ ] `ctx.currentTime + offset` sound scheduling
- [ ] `passive: false` + `touch-action: none` touch settings
- [ ] DPR support (`canvas.width = w * dpr`)
- [ ] localStorage try-catch wrapping
- [ ] Check first, save later (saveBest)

### 15.3 Numerical Consistency (§13.1 Full Match)
- [ ] CONFIG constants 34 items cross-checked with spec

### 15.4 Pure Function Full Verification (§10, 12 functions)
- [ ] 0 direct global variable references

### 15.5 Initialization Order (§12.1)
- [ ] Event listeners registered inside init()
- [ ] let/const declarations → positioned before first use
- [ ] canvas.addEventListener called only after canvas assignment

### 15.6 Smoke Test (§12.7)
- [ ] index.html exists
- [ ] Page load successful (title screen renders)
- [ ] 0 console errors
