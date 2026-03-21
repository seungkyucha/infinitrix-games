---
game-id: spell-card-dungeon
title: Spell Card Dungeon
genre: strategy
difficulty: medium
---

# Spell Card Dungeon — Detailed Game Design Document

_Cycle #19 | Date: 2026-03-22_

---

## §0. Previous Cycle Feedback Mapping

> Pre-emptive mapping of Cycle 18 post-mortem "areas for improvement" + platform-wisdom accumulated lessons (F1~F27).

| # | Source | Issue | Resolution in This Spec | Section |
|---|--------|-------|------------------------|---------|
| F1 | Cycle 1~18 (18 consecutive) | assets/ directory recurrence | **Write from blank index.html.** No assets/ directory. 100% Canvas code drawing. Only thumbnail.svg allowed | §8, §14.5 |
| F2 | Cycle 1~18 | setTimeout-based state transitions | Tween onComplete callbacks only. **0 setTimeout** target. Web Audio uses native `oscillator.start(ctx.currentTime + delay)` scheduling | §5, §13 |
| F3 | Cycle 6~18 | Pure function pattern required | All game logic functions receive data via parameters. 0 direct global references | §15 |
| F4 | Cycle 2 | Missing state × system matrix | Complete state × system matrix in §6.3 | §6.3 |
| F5 | Cycle 3/4 | Missing guard flags → repeated callbacks | `isTransitioning`, `isAnimating`, `isSelectingCard` triple guard system | §5.4 |
| F6 | Cycle 4 | TweenManager cancelAll+add race condition | Separate `clearImmediate()` instant cleanup API | §15 |
| F7 | Cycle 7/16 | Spec values ↔ code values mismatch | §14.4 value consistency verification table. Full card damage/cost cross-check | §14.4 |
| F8 | Cycle 1 | confirm/alert unavailable in iframe | Canvas-based modal UI only. 0 window.open/alert/confirm/prompt | §4 |
| F9 | Cycle 3~4 | SVG filter recurrence (feGaussianBlur) | No inline SVG. Canvas glow via shadowBlur | §4.2 |
| F10 | Cycle 15~18 | Offscreen canvas background caching | `buildBgCache()` pattern — rebuild only on resizeCanvas() | §4.3 |
| F11 | Cycle 11/14 | let/const TDZ crash | Strict order: variable declaration → DOM assignment → event listeners → init() | §14.1 |
| F12 | Cycle 10/11 | Missing gameLoop try-catch | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` by default | §5.1 |
| F13 | Cycle 13/17 | index.html not created | **MVP-first strategy**: TITLE→MAP→BATTLE→GAMEOVER 4 states first | §1.3 |
| F14 | Cycle 10 | Fix regression (render signature change) | Full flow regression test after any fix | §14.7 |
| F15 | Cycle 3/7/17 | Ghost variables (declared but unused) | §14.2 variable usage verification table | §14.2 |
| F16 | Cycle 5 | Dual update paths for single value | HP/mana/gold modified only through dedicated functions | §15 |
| F17 | Cycle 3 | State transition priority system | GAMEOVER > BOSS_INTRO > REWARD > BATTLE > MAP. STATE_PRIORITY map | §6.2 |
| F18 | Cycle 15~17 | Scope reduction strategy | Single genre axis (strategy) + turn-based structure minimizes real-time bugs | §1 |
| F19 | Cycle 12/15 | "Half-implementation" pattern | Feature-level detailed implementation checklist (§14.3) | §14.3 |
| F20 | Cycle 13~16 | CONFIG.MIN_TOUCH declared but not applied | All buttons/UI enforced to 48px minimum via `touchSafe()` utility | §12.3 |
| F21 | Cycle 16 | Incomplete input mode support | Keyboard/mouse/touch **all fully supported** | §3 |
| F22 | Cycle 17 | Specified UI not implemented | All UI in spec is **100% implemented**. If not in MVP, don't spec it | §1.3 |
| F23 | Cycle 5/8 | Direct transition bypassing beginTransition() | All screen transitions must go through `beginTransition()`. Only PAUSED is exempt | §6.2 |
| F24 | Cycle 12~16 | Touch target below 44×44px | All interactive UI minimum 48×48px | §12.3 |
| F25 | Cycle 17 (critical) | Over-scoped → 0% implementation | **MVP-first**: 4 states (TITLE/MAP/BATTLE/GAMEOVER) + 1 enemy type + 5 cards first | §1.3 |
| F26 | Cycle 17 | State changes in render() | All state changes in update() only. render() is a pure output function | §5.2 |
| F27 | Cycle 17 | Undefined object interactions | §2.5 card element × enemy type interaction matrix included | §2.5 |
| F28 | Cycle 18 new | Lack of balance verification | Card data in constant tables (CARD_DATA, ENEMY_DATA). Damage formula explicit (§7.2) | §7.2 |
| F29 | Cycle 18 new | Sound quality unverified | SFX timing precisely mapped to game events. Volume balance table included | §13.3 |
| F30 | Cycle 18 new | 2,757-line single file modularity | Code structured in logical sections (CONFIG/DATA → Engine → Systems → States → Init) | §15.1 |

---

## §1. Game Overview & Core Fun Factors

### 1.1 Concept
The player takes on the role of a mage exploring a 10-floor magic dungeon. On each floor, they choose a path among **battle/event/shop/rest** nodes, then fight monsters in turn-based card combat. Winning battles grants new cards; shops allow purchasing/removing/upgrading cards to strengthen the deck. **Relics** provide passive effects that last the entire run.

**Slay the Spire-style** roguelike deckbuilder — the hottest strategy genre of 2025-2026.

### 1.2 Core Fun Factors
1. **Deckbuilding Strategy**: Pick 1 of 3 card rewards after each battle. How you build your deck determines victory or defeat
2. **Turn-based Combat Tension**: Limited mana per turn forces meaningful decisions. Enemy intent system shows next action for counter-strategy planning
3. **Relic Synergy**: Up to 3 relics create synergies with your deck, defining your build direction
4. **Boss Spectacle**: Unique pattern bosses on floors 3, 6, and 10. Dedicated cinematics + special rewards
5. **Roguelike Replayability**: Different cards, relics, and enemy combinations each run. Infinite replay value
6. **8-12 Minutes Per Run**: Clear 10 floors or die trying. Instant retry

### 1.3 Scope Management Strategy (F25 Response)
> ⚠️ Cycle 17 had 0% implementation due to over-scoping. Cycle 18 succeeded with MVP-first. This cycle continues that approach.

**MVP Implementation Order** (must implement in this order):
1. **Phase 1 (Core — playable alone)**: TITLE → BATTLE → GAMEOVER 3 states + 5 basic cards (3 attack/2 defense) + 1 enemy type (slime) + turn loop (draw→play→enemy turn→result)
2. **Phase 2**: MAP state + 10-floor map generation + path selection UI + battle rewards (pick 1 of 3 cards)
3. **Phase 3**: 7 enemy types + 20 card types + shop/rest/event nodes
4. **Phase 4**: 3 bosses (floors 3/6/10) + BOSS_INTRO state + relic system (8 relics)
5. **Phase 5**: Achievement system (10 achievements) + RESULT state + particles/effects
6. **Phase 6**: BGM + sound effects (8 types) + screen shake/card animations

Phase 1-2 completion = **playable game**. Phase 3+ is incremental expansion.

### 1.4 Genre Balance Contribution
- **Direct strategy genre reinforcement** (currently only 1 pure strategy game → 2)
- Last 3 cycles were action-heavy (arcane-bastion, rune-survivor) → pivot to strategy
- Complete differentiation from mini-card-battler (simple card combat): deckbuilding + roguelike progression + relic system

---

## §2. Game Rules & Objectives

### 2.1 Victory Condition
- Defeat the final boss (Archmage) on floor 10 to **clear** the dungeon

### 2.2 Defeat Condition
- Player HP reaches 0 → **Game Over**

### 2.3 Turn-based Combat Rules

#### Player Turn
1. Recover **3 mana** at turn start (up to max mana)
2. **Draw 5 cards** from draw pile
3. **Play cards** by spending mana (any order, multiple cards allowed)
4. Click "End Turn" → unplayed cards move to discard pile

#### Enemy Turn
1. Execute action shown by intent (displayed in advance)
2. Perform one of: attack / buff / debuff
3. Enemy turn ends → next player turn begins

#### Draw Pile Exhaustion
- When draw pile is empty, **shuffle** discard pile to form new draw pile

### 2.4 Card System

#### Card Properties
| Property | Description |
|----------|-------------|
| name | Card name |
| type | attack / skill / power |
| cost | Mana cost (0~3) |
| rarity | common / uncommon / rare |
| element | fire / ice / lightning / arcane / neutral |
| effect | Damage, block, buff, debuff, etc. |
| description | Effect description text |
| upgraded | Upgrade status (false/true) |

#### Card Types
- **Attack**: Deal damage to enemies
- **Skill**: Gain block, draw extra cards, apply debuffs, etc.
- **Power**: Grants permanent in-combat effect when played (auto-applies each turn)

#### Card List (20 Types)

**Basic Cards (Starting Deck: 10 cards)**
| ID | Name | Type | Cost | Element | Effect | Upgraded |
|----|------|------|------|---------|--------|----------|
| C01 | Strike | attack | 1 | neutral | 6 damage | 9 damage |
| C02 | Defend | skill | 1 | neutral | 5 block | 8 block |
| C03 | Mana Burst | skill | 0 | arcane | Draw 1 card | Draw 2 cards |

Starting deck: Strike ×4, Defend ×3, Mana Burst ×2, Minor Firebolt ×1 = **10 cards**

**Common Cards**
| ID | Name | Type | Cost | Element | Effect | Upgraded |
|----|------|------|------|---------|--------|----------|
| C04 | Firebolt | attack | 1 | fire | 8 dmg + 2 Burn | 12 dmg + 3 Burn |
| C05 | Frost Shield | skill | 1 | ice | 7 block + 1 Weak | 10 block + 2 Weak |
| C06 | Shock | attack | 1 | lightning | 5 dmg × 2 hits | 7 dmg × 2 hits |
| C07 | Arcane Missile | attack | 2 | arcane | 12 damage | 16 damage |
| C08 | Mana Siphon | skill | 1 | arcane | 3 block + restore 1 mana | 5 block + 1 mana |
| C09 | Flame Armor | skill | 1 | fire | 6 block, 1 Burn to attacker | 8 block, 2 Burn |
| C10 | Frost Arrow | attack | 1 | ice | 7 dmg + 1 Slow | 10 dmg + 2 Slow |

**Uncommon Cards**
| ID | Name | Type | Cost | Element | Effect | Upgraded |
|----|------|------|------|---------|--------|----------|
| C11 | Meteor Strike | attack | 3 | fire | ALL enemies 20 dmg + 3 Burn | 28 dmg + 4 Burn |
| C12 | Blizzard | attack | 2 | ice | ALL enemies 10 dmg + 2 Slow | 14 dmg + 3 Slow |
| C13 | Chain Lightning | attack | 2 | lightning | 8 dmg, chains per enemy (-2 each) | 11 dmg, -1 reduction |
| C14 | Mana Barrier | skill | 2 | arcane | 15 block + draw 1 | 20 block + draw 2 |
| C15 | Life Drain | attack | 2 | arcane | 10 dmg + heal 5 HP | 14 dmg + heal 7 HP |
| C16 | Firestorm | power | 2 | fire | End of turn: 4 dmg to ALL enemies | 6 dmg |
| C17 | Frost Ward | power | 1 | ice | Start of turn: gain 3 block | 5 block |

**Rare Cards**
| ID | Name | Type | Cost | Element | Effect | Upgraded |
|----|------|------|------|---------|--------|----------|
| C18 | Grand Spell: Inferno | attack | 3 | fire | 50 dmg (Exhaust — removed after use) | 70 dmg |
| C19 | Time Stop | skill | 3 | arcane | Unlimited mana this turn + draw 3 | Draw 4 |
| C20 | Elemental Harmony | power | 3 | arcane | +3 bonus damage for matching element cards | +5 bonus |

### 2.5 Card Element × Enemy Type Interaction Matrix (F27 Response)

| | Slime | Skeleton | Goblin Mage | Dark Knight | Banshee | Golem | Imp |
|---|-------|----------|-------------|-------------|---------|-------|-----|
| **fire** | 1.0× | 1.5× | 1.0× | 1.0× | 1.2× | 0.8× | 1.5× |
| **ice** | 1.2× | 1.0× | 1.5× | 0.8× | 1.0× | 1.0× | 1.0× |
| **lightning** | 1.5× | 0.8× | 1.0× | 1.2× | 1.5× | 0.5× | 1.2× |
| **arcane** | 1.0× | 1.0× | 1.2× | 1.0× | 1.0× | 1.5× | 1.0× |
| **neutral** | 1.0× | 1.0× | 1.0× | 1.0× | 1.0× | 1.0× | 1.0× |

### 2.6 Status Effects

| Status | Description | Duration |
|--------|-------------|----------|
| **Burn** | Take damage equal to stacks at turn start, -1 stack per turn | Until stacks depleted |
| **Slow** | -25% attack power | Stack turns |
| **Weak** | -25% attack power | Stack turns |
| **Strength** | +stack count to attack damage | Permanent in combat |
| **Vulnerable** | +50% damage received | Stack turns |

---

## §3. Controls (F21 Response — Full 3-Mode Support)

### 3.1 Mouse Controls
| Action | Function |
|--------|----------|
| Click card | Select/play card |
| Hover card | Show card details |
| Click "End Turn" | End turn |
| Click map node | Select path |
| Click shop item | Buy/upgrade/remove |
| Hover relic | Show relic description |

### 3.2 Keyboard Controls
| Key | Function |
|-----|----------|
| 1~5 | Select/play hand card 1-5 |
| E | End turn |
| Space | Confirm/continue |
| Escape | Pause/back |
| ←→ | Navigate map paths |
| Enter | Confirm selection |
| D | Toggle deck view |

### 3.3 Touch Controls
| Action | Function |
|--------|----------|
| Tap card | Select/play card |
| Long press card (500ms) | Show card details |
| Tap "End Turn" | End turn |
| Tap map node | Select path |
| Swipe left/right | Scroll hand cards (when 6+ cards) |

### 3.4 Auto Input Mode Detection
```
Mouse movement → inputMode = 'mouse' → hover UI enabled
Keyboard input → inputMode = 'keyboard' → focus UI enabled
Touch start → inputMode = 'touch' → long-press UI enabled
```

---

## §4. Visual Style Guide

### 4.1 Color Palette

| Purpose | Color | HEX |
|---------|-------|-----|
| Background (dungeon wall) | Very dark navy | `#0a0e1a` |
| Card background | Dark slate | `#1a1f2e` |
| Card border (common) | Gray | `#4a5568` |
| Card border (uncommon) | Blue | `#3b82f6` |
| Card border (rare) | Gold | `#f59e0b` |
| Fire element | Orange-red | `#ef4444` |
| Ice element | Sky blue | `#38bdf8` |
| Lightning element | Yellow | `#facc15` |
| Arcane element | Purple | `#a855f7` |
| Neutral element | Gray | `#94a3b8` |
| HP bar | Red | `#dc2626` |
| Mana bar | Blue | `#2563eb` |
| Block | Cyan | `#06b6d4` |
| Gold | Gold | `#eab308` |
| UI text | Light gray | `#e2e8f0` |
| Accent | Emerald | `#10b981` |

### 4.2 Background Composition (Offscreen Canvas Caching — F10 Response)
- **Layer 0 (far)**: Deep dungeon walls — grid pattern + dark gradient
- **Layer 1 (mid)**: Torch light + wall crack details
- **Layer 2 (near)**: Battle area floor — stone tile pattern
- **Layer 3 (foreground)**: Particle effect layer (rendered each frame)

Caching strategy: Layers 0-2 drawn once to offscreen canvas via `buildBgCache()`, rebuilt only on `resizeCanvas()`. Only Layer 3 rendered per frame.

### 4.3 Object Visual Design

#### Player (not directly shown; represented by HP/mana/block bars)
- Left side: Player HP bar (red) + Mana orbs (blue circles) + Block value (cyan shield icon)

#### Card Design (Canvas Code Drawing)
```
┌─────────────┐  Size: 90×130px
│  [Cost]      │  Top-left: Mana cost (blue circle)
│              │
│  [Icon]      │  Center: Element-specific icon (geometric shapes)
│              │    fire: triangle flame
│              │    ice: hexagonal crystal
│  [Name]      │    lightning: zigzag bolt
│  [Effect]    │    arcane: star shape
│              │    neutral: circle
│  [Type Bar]  │  Bottom: Type-colored bar (attack=red, skill=green, power=yellow)
└─────────────┘  Border: Rarity color + glow
```

#### Enemy Character Design (Canvas Code Drawing)
- **Slime**: Green semicircle + 2 eyes + bounce animation
- **Skeleton**: White skull + bone cross + sword
- **Goblin Mage**: Purple robe + pointed hat + staff
- **Dark Knight**: Gray armor + red eyes + greatsword
- **Banshee**: Semi-transparent white + flowing hair + swirl
- **Golem**: Brown square block assembly + glowing core
- **Imp**: Small red devil + wings + tail

#### Boss Design (Large, 2× normal enemy size)
- **Floor 3 Guardian Golem**: Giant stone statue + glowing rune patterns + fist slam animation
- **Floor 6 Lich Lord**: Black robe + floating magic circle + skeleton summoning
- **Floor 10 Archmage**: Elaborate magic circle + 4-element aura + multi-attack patterns

### 4.4 Particle System
| Effect | Trigger | Particle Count | Lifetime |
|--------|---------|----------------|----------|
| Card play | When card is played | 15 | 0.5s |
| Fire hit | Fire card hits | 20 (orange/red) | 0.8s |
| Ice hit | Ice card hits | 15 (sky blue/white) | 0.6s |
| Lightning hit | Lightning card hits | 10 (yellow bolts) | 0.3s |
| Arcane hit | Arcane card hits | 12 (purple stars) | 0.7s |
| Enemy death | HP reaches 0 | 30 (enemy color) | 1.0s |
| Card draw | Turn start | 8 (white) | 0.4s |
| Level up | XP threshold met | 40 (gold) | 1.2s |
| Heal | HP recovery | 10 (green) | 0.6s |

### 4.5 Screen Shake + Cinematics
- **Boss entrance**: 1s screen shake (amplitude 8px) + vignette effect
- **Boss death**: 0.5s slow motion (timeScale=0.3) + explosion particles
- **Damage numbers**: Floating numbers from hit position (damage=red, block=cyan, heal=green)
- **Card play animation**: Hand → center field move → scale up → fade out (0.3s tween)

---

## §5. Core Game Loop

### 5.1 Main Loop (F12 Response)
```javascript
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1); // 100ms cap
    lastTime = timestamp;

    update(dt);   // State changes here only (F26)
    render();     // Pure output function (F26)
  } catch(e) {
    console.error('GameLoop error:', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 5.2 update(dt) Flow
```
update(dt):
  tweenManager.update(dt)
  particleManager.update(dt)

  switch(state):
    TITLE:      updateTitle(dt)
    MAP:        updateMap(dt)
    BATTLE:     updateBattle(dt)
    BOSS_INTRO: updateBossIntro(dt)
    REWARD:     updateReward(dt)
    SHOP:       updateShop(dt)
    REST:       updateRest(dt)
    EVENT:      updateEvent(dt)
    RESULT:     updateResult(dt)
    GAMEOVER:   updateGameover(dt)
    PAUSED:     // no-op (tweens paused)
```

### 5.3 render() Flow
```
render():
  drawBackground(state)     // offscreen cache

  switch(state):
    TITLE:      renderTitle()
    MAP:        renderMap()
    BATTLE:     renderBattle()
    BOSS_INTRO: renderBossIntro()
    REWARD:     renderReward()
    SHOP:       renderShop()
    REST:       renderRest()
    EVENT:      renderEvent()
    RESULT:     renderResult()
    GAMEOVER:   renderGameover()
    PAUSED:     renderPaused()  // overlay

  particleManager.render(ctx)
  renderTransition()          // transition overlay
```

### 5.4 Guard Flag System (F5 Response)
```javascript
const GUARDS = {
  isTransitioning: false,   // Screen transition in progress
  isAnimating: false,       // Card play/enemy action animation
  isSelectingCard: false,   // Card selection UI active
  isBossIntro: false,       // Boss entrance cinematic
};
```
All state transition functions check guards at entry:
```javascript
function changeState(newState) {
  if (GUARDS.isTransitioning) return;
  if (STATE_PRIORITY[newState] < STATE_PRIORITY[currentState]) return;
  GUARDS.isTransitioning = true;
  beginTransition(newState); // F23
}
```

---

## §6. Game State Machine

### 6.1 State List (11 states)
| State | Description |
|-------|-------------|
| TITLE | Title screen — start/achievements/settings |
| MAP | Dungeon map — path selection |
| BATTLE | Turn-based card combat |
| BOSS_INTRO | Boss entrance cinematic |
| REWARD | Post-battle reward (pick 1 of 3 cards) |
| SHOP | Buy/upgrade/remove cards |
| REST | Heal HP or upgrade a card |
| EVENT | Random event (2-3 choices) |
| RESULT | Victory result screen |
| GAMEOVER | Defeat screen |
| PAUSED | Pause overlay |

### 6.2 State Transition Priority (F17 Response)
```javascript
const STATE_PRIORITY = {
  GAMEOVER: 100,
  BOSS_INTRO: 90,
  RESULT: 85,
  PAUSED: 80,     // PAUSED only: immediate transition allowed (F23)
  REWARD: 60,
  SHOP: 50,
  REST: 50,
  EVENT: 50,
  BATTLE: 40,
  MAP: 30,
  TITLE: 10,
};
```

### 6.3 State × System Matrix (F4 Response)

| System \ State | TITLE | MAP | BATTLE | BOSS_INTRO | REWARD | SHOP | REST | EVENT | RESULT | GAMEOVER | PAUSED |
|----------------|-------|-----|--------|------------|--------|------|------|-------|--------|----------|--------|
| tweenManager | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| particleManager | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| inputHandler | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| soundManager | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| cardAnimator | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| enemyAI | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| bgRenderer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## §7. Difficulty System

### 7.1 Floor-by-Floor Difficulty Curve

| Floor | Enemy Count | Enemy Types | Special |
|-------|-------------|-------------|---------|
| 1 | 1~2 | Slime | — |
| 2 | 2 | Slime, Imp | — |
| 3 | 1 | **Guardian Golem (Boss)** | Boss fight |
| 4 | 2~3 | Skeleton, Goblin Mage | — |
| 5 | 3 | Dark Knight, Banshee | — |
| 6 | 1 | **Lich Lord (Boss)** | Boss fight |
| 7 | 3 | Golem, Imp, Banshee | 30% Elite chance |
| 8 | 3~4 | Mixed | 50% Elite chance |
| 9 | 4 | Mixed (no bosses) | 70% Elite chance |
| 10 | 1 | **Archmage (Final Boss)** | Final boss fight |

### 7.2 Damage Formula (F28 Response)
```
Final Damage = (Base Damage + Strength Stacks) × Element Multiplier × (Vulnerable ? 1.5 : 1.0)
After Block = max(0, Final Damage - Target Block)
Enemy Attack = Base Attack × (Slowed ? 0.75 : 1.0) × (Weakened ? 0.75 : 1.0)
```

### 7.3 Enemy Data Table

| Enemy Type | HP | Attack | Behavior Pattern | Special Ability |
|------------|-----|--------|-------------------|-----------------|
| Slime | 20 | 5 | Attack-Attack-Defend cycle | None |
| Skeleton | 25 | 7 | Attack-Attack-Buff | Strength (+2 damage) |
| Goblin Mage | 18 | 4 | Buff-Attack-Attack | Ally Strength (+3) |
| Dark Knight | 35 | 9 | Defend-Attack-Heavy Attack | Heavy Attack (1.5×) |
| Banshee | 22 | 6 | Debuff-Attack-Attack | Apply Weak (2 turns) |
| Golem | 50 | 8 | Defend-Defend-Heavy Attack | High Block (12) |
| Imp | 12 | 8 | Attack-Attack-Flee | Disappears after 3 turns |

### 7.4 Boss Data Table

| Boss | HP | Attack | Pattern | Special Ability |
|------|-----|--------|---------|-----------------|
| Guardian Golem (3F) | 80 | 10 | Defend(15)-Slam(15)-Crush(8+Vulnerable 2) | Below 50% HP: Rage (+3 permanent Strength) |
| Lich Lord (6F) | 100 | 8 | Summon(Skeleton×1)-Magic(12)-Debuff(Weak 2+Burn 3) | Killing summoned skeleton heals Lich 10 HP |
| Archmage (10F) | 150 | 12 | 4-element cycle: Fire(15)-Ice(10+Slow 3)-Lightning(8×3)-Arcane(20) | Every 4 turns: Elemental Storm (ALL 20 dmg) |

### 7.5 Elite Enemy Variant
When a normal enemy becomes Elite:
- HP ×1.5, Attack ×1.2
- Extra reward: 1 relic or rare card option added

---

## §8. Relic System

### 8.1 Relic List (8 Types)

| ID | Name | Effect | Source |
|----|------|--------|--------|
| R01 | Mana Crystal | Max mana +1 | Boss reward |
| R02 | Ring of Fire | Fire card damage +3 | Elite reward |
| R03 | Frost Amulet | Gain 5 block at combat start | Event |
| R04 | Lightning Pendant | Draw 1 card when playing lightning card | Boss reward |
| R05 | Healing Stone | Heal 3 HP after winning combat | Shop (100 gold) |
| R06 | Enhancement Stone | 1 free upgrade at next shop | Event |
| R07 | Explorer's Map | Reveal all node types on map | Elite reward |
| R08 | Mage's Robe | Draw 1 extra card at turn start | Boss reward |

---

## §9. Shop System

### 9.1 Shop Price Table
| Item | Price |
|------|-------|
| Common card | 50 gold |
| Uncommon card | 80 gold |
| Rare card | 150 gold |
| Remove card | 75 gold |
| Upgrade card | 60 gold |
| Relic (R05) | 100 gold |
| HP Potion (+20 HP) | 40 gold |

### 9.2 Gold Acquisition
| Source | Gold |
|--------|------|
| Normal battle win | 15~25 |
| Elite battle win | 30~45 |
| Boss battle win | 50~75 |
| Event reward | 10~30 |

---

## §10. Event System (4 Types)

| ID | Name | Description | Choices |
|----|------|-------------|---------|
| E01 | Mysterious Altar | An ancient magical altar | A: Lose 10 HP, gain 1 rare card / B: Ignore and pass |
| E02 | Wandering Merchant | Meeting a traveling merchant | A: Buy relic for 50 gold / B: Remove 1 card (free) |
| E03 | Magic Spring | A glowing spring discovered | A: Full HP recovery / B: Upgrade 1 random card |
| E04 | Cursed Chest | A mysterious chest | A: Open (1 rare card + 1 curse card added to deck) / B: Ignore |

---

## §11. Achievement System (10 Types)

| ID | Name | Condition | Badge |
|----|------|-----------|-------|
| A01 | First Steps | Win first battle | ⭐ |
| A02 | Dungeon Master | Clear floor 10 | 🏆 |
| A03 | Untouchable Boss | Defeat a boss taking 0 damage | 🛡️ |
| A04 | Minimalist | Clear with 15 or fewer cards in deck | 📦 |
| A05 | Collector | Clear with 30+ cards in deck | 📚 |
| A06 | Pyromancer | Defeat a boss using only fire cards | 🔥 |
| A07 | Relic Hunter | Hold 3 relics simultaneously | 💎 |
| A08 | Rich | Hold 200+ gold | 💰 |
| A09 | No Shop Clear | Clear without visiting any shop | 🚫 |
| A10 | Speed Run | Clear in under 5 minutes | ⚡ |

---

## §12. UI Layout

### 12.1 Battle Screen Layout
```
┌──────────────────────────────────────────────────┐
│ [HP: ████████ 50/80]  [Mana: ●●●○]  [Block: 🛡5]│  Top: Player status
│ [Gold: 💰120]  [Floor: 3F]  [Relics: R01 R03] [⏸]│
├──────────────────────────────────────────────────┤
│                                                  │
│          [Enemy1: 💀 HP bar]  [Enemy2: 🟢 HP bar]│  Upper center: Enemies
│          [Intent: ⚔️12]     [Intent: 🛡️8]      │  (Intent icons)
│                                                  │
│                                                  │  Center: Battle area
│           ✨ Card effect area ✨                  │  (Particles/damage)
│                                                  │
├──────────────────────────────────────────────────┤
│  [Card1] [Card2] [Card3] [Card4] [Card5]        │  Bottom: Hand
│                                                  │
│  [Draw:12] [End Turn]                [Discard:5] │  Bottom bar: Deck info
└──────────────────────────────────────────────────┘
```

### 12.2 Map Screen Layout
```
┌──────────────────────────────────────────────────┐
│  [HP: ████ 50/80]  [Gold: 💰120]  [Floor: 3/10]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  10F ─── [👑 Boss]                               │
│  9F  ─── [⚔️] ─── [⚔️] ─── [?]                │
│  8F  ─── [🏪] ─── [⚔️] ─── [⚔️]              │
│  7F  ─── [⚔️] ─── [💤] ─── [⚔️]              │
│  6F  ─── [👑 Boss]                               │
│  5F  ─── [?] ─── [⚔️] ─── [🏪]                │
│  4F  ─── [⚔️] ─── [⚔️]                        │
│  3F  ─── [👑 Boss]                               │
│  2F  ─── [⚔️] ─── [?]                          │
│  1F  ─── [⚔️] ─── [⚔️] ─── [⚔️]   ← Current │
│                                                  │
│  [View Deck]  [Achievements]          [Settings] │
└──────────────────────────────────────────────────┘
```

### 12.3 Touch Target Specifications (F20/F24 Response)
- All interactive UI minimum **48×48px** (CONFIG.MIN_TOUCH_TARGET = 48)
- `touchSafe(w, h)` utility: `return { w: Math.max(48, w), h: Math.max(48, h) }`
- Card area: minimum 90×130px (sufficient for touch)
- End Turn button: 120×48px
- Map nodes: 48×48px

---

## §13. Sound System (Web Audio API)

### 13.1 BGM (Procedurally Generated)
- **Dungeon BGM**: Low drone + mysterious arpeggio. C-minor based, BPM 70
- Boss fight: Accelerate to BPM 110 + add bass drum
- Volume: 0.15 (default), 0.20 during boss fight

### 13.2 Sound Effects (8 Types — F29 Response)
| SFX | Trigger | Generation Method | Volume |
|-----|---------|-------------------|--------|
| Card draw | Card drawn | Short "swoosh" (high-freq white noise 0.1s) | 0.2 |
| Card play | Card played | Element-specific tone (fire=warm sine, ice=cold sawtooth) | 0.25 |
| Enemy hit | Damage dealt | "Thud" (noise + low-freq 0.15s) | 0.3 |
| Enemy death | Enemy HP 0 | Descending glissando (0.3s) | 0.3 |
| Player hit | Player takes damage | "Thump" (low-freq sine 0.2s) | 0.35 |
| Boss entrance | Boss fight starts | Dramatic rising chord (0.8s) | 0.4 |
| Gold gain | Gold acquired | "Cha-ching" (high sine 3-note sequence 0.2s) | 0.2 |
| Level up/Reward | Card reward selected | Rising arpeggio (0.4s) | 0.25 |

### 13.3 SFX Timing Map (F29 Response)
```
Card play: Trigger immediately on card animation start frame
Enemy hit: Trigger at damage calculation complete + hit effect start (200ms after card play)
Enemy death: Trigger at death particle start
Boss entrance: Trigger immediately on BOSS_INTRO state entry
```

---

## §14. Implementation Verification Checklists

### 14.1 Initialization Order Checklist (F11 Response)
```
1. const/let global variable declarations
2. CONFIG object definition
3. CARD_DATA, ENEMY_DATA, BOSS_DATA, RELIC_DATA constant tables
4. canvas/ctx DOM assignment
5. Utility class definitions (TweenManager, ParticleManager, SoundManager)
6. Game state variable initialization
7. Event listener registration
8. resizeCanvas() → buildBgCache()
9. init() → gameLoop start
```

### 14.2 Variable Usage Verification Table (F15 Response)
| Variable | Declared | Updated | Referenced |
|----------|----------|---------|------------|
| playerHP | init() | modifyHP() | renderBattle(), checkDeath() |
| playerMana | init() | modifyMana() | renderBattle(), canPlayCard() |
| playerBlock | startTurn() | addBlock() | renderBattle(), takeDamage() |
| gold | init() | addGold() | renderMap(), renderShop() |
| currentFloor | init() | advanceFloor() | renderMap(), generateEnemies() |
| deck[] | init() | addCard(), removeCard() | renderDeck(), drawCards() |
| hand[] | drawCards() | playCard(), endTurn() | renderHand() |
| drawPile[] | startBattle() | drawCards(), reshuffleDeck() | renderBattle() |
| discardPile[] | endTurn() | reshuffleDeck() | renderBattle() |
| enemies[] | startBattle() | damageEnemy(), killEnemy() | renderBattle(), enemyTurn() |
| relics[] | init() | addRelic() | applyRelicEffects(), renderRelics() |
| achievements{} | init() | unlockAchievement() | renderAchievements() |

### 14.3 Feature Implementation Checklist (F19 Response)
- [ ] Card system: draw + play + discard + shuffle
- [ ] Turn structure: player turn → enemy turn → turn end
- [ ] Intent system: enemy next action display
- [ ] Map generation: 10 floors + branching paths
- [ ] Shop: buy + remove + upgrade
- [ ] Relics: passive effect application
- [ ] Bosses: 3 bosses with unique patterns
- [ ] Events: choice UI + outcome application
- [ ] Achievements: condition checking + unlock saving
- [ ] Sound: 1 BGM + 8 SFX types

### 14.4 Value Consistency Verification Table (F7 Response)
| Item | Spec Value | Code Constant Reference |
|------|-----------|------------------------|
| Starting HP | 80 | CONFIG.STARTING_HP |
| Max Mana | 3 | CONFIG.STARTING_MANA |
| Draw Per Turn | 5 | CONFIG.DRAW_PER_TURN |
| Starting Deck Size | 10 | STARTING_DECK.length |
| Strike Damage | 6 | CARD_DATA.C01.damage |
| Defend Block | 5 | CARD_DATA.C02.block |
| Slime HP | 20 | ENEMY_DATA.slime.hp |
| Guardian Golem HP | 80 | BOSS_DATA.guardian.hp |
| Lich Lord HP | 100 | BOSS_DATA.lich.hp |
| Archmage HP | 150 | BOSS_DATA.archmage.hp |
| Shop Common Card Price | 50 | SHOP_PRICES.common |
| Card Remove Price | 75 | SHOP_PRICES.remove |
| Elite HP Multiplier | 1.5 | CONFIG.ELITE_HP_MULT |

### 14.5 assets/ Prohibition Checklist (F1 Response)
- [ ] `assets/` directory does not exist
- [ ] 0 occurrences of `fetch(`, `Image(`, `new Audio(` in code
- [ ] 0 occurrences of `ASSET_MAP`, `SPRITES`, `preloadAssets` in code
- [ ] All graphics rendered via Canvas API (fillRect, arc, beginPath, etc.)
- [ ] Sound generated via Web Audio API (`AudioContext`, `OscillatorNode`)
- [ ] 0 external font loads (Google Fonts, etc.)
- [ ] Only thumbnail.svg allowed as separate file

### 14.6 setTimeout Zero Checklist (F2 Response)
- [ ] 0 occurrences of `setTimeout` in code
- [ ] All delayed transitions use tween onComplete callbacks
- [ ] Web Audio scheduling uses `oscillator.start(ctx.currentTime + delay)`

### 14.7 Regression Test Flow (F14 Response)
After any fix, test the full path:
```
TITLE → MAP → BATTLE(normal) → REWARD → MAP → BATTLE(boss) →
BOSS_INTRO → BATTLE → REWARD → SHOP → REST → EVENT →
MAP → ... → RESULT(clear) / GAMEOVER(defeat)
```

---

## §15. Code Structure Guide (F3/F30 Response)

### 15.1 Logical Section Structure
```
// ═══════════════════════════════════════
// SECTION 1: CONFIG & DATA TABLES (~300 lines)
// ═══════════════════════════════════════
const CONFIG = { ... };
const CARD_DATA = { ... };
const ENEMY_DATA = { ... };
const BOSS_DATA = { ... };
const RELIC_DATA = { ... };

// ═══════════════════════════════════════
// SECTION 2: ENGINE (TweenManager, Particle, Sound) (~300 lines)
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// SECTION 3: GAME SYSTEMS (~500 lines)
//   - CardSystem (drawCards, playCard, shuffleDeck)
//   - BattleSystem (playerTurn, enemyTurn, applyDamage)
//   - MapSystem (generateMap, advanceFloor)
//   - ShopSystem (buy, remove, upgrade)
//   - RelicSystem (applyEffects)
//   - AchievementSystem (check, unlock)
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// SECTION 4: RENDERERS (~500 lines)
//   - renderTitle(), renderMap(), renderBattle()
//   - renderCard(), renderEnemy(), renderBoss()
//   - renderUI(), renderParticles()
//   - drawCardArt(), drawEnemyArt() (Canvas code drawing)
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// SECTION 5: STATE HANDLERS (~300 lines)
//   - updateTitle(), updateMap(), updateBattle() ...
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// SECTION 6: INPUT & INIT (~200 lines)
// ═══════════════════════════════════════
```

### 15.2 Pure Function Principle (F3 Response)
All game logic functions receive needed data **via parameters**:
```javascript
// ✅ Correct pattern
function applyDamage(target, baseDmg, element, relics) { ... }
function canPlayCard(card, currentMana) { ... }
function generateEnemies(floor, enemyData) { ... }

// ❌ Forbidden pattern
function applyDamage() { enemies[0].hp -= player.atk; } // direct global ref
```

### 15.3 Single Update Path Principle (F16 Response)
```javascript
// HP modified only through modifyHP()
function modifyHP(amount) { playerHP = Math.max(0, Math.min(CONFIG.MAX_HP, playerHP + amount)); }

// Mana modified only through modifyMana()
function modifyMana(amount) { playerMana = Math.max(0, Math.min(maxMana, playerMana + amount)); }

// Gold modified only through addGold()
function addGold(amount) { gold = Math.max(0, gold + amount); }
```

---

## §16. Score System

### 16.1 Score Calculation
```
Final Score = (Floor Reached × 100) + (Kills × 10) + (Remaining HP × 2) + (Gold Held) + (Achievement Bonus)
```

| Item | Score |
|------|-------|
| Floor reached | Floor × 100 |
| Enemy kills | Kills × 10 |
| Boss kills | 500 per boss |
| Remaining HP | HP × 2 |
| Gold held | 1:1 |
| Clear bonus | 1000 |
| Achievements | 200 per unlock |

### 16.2 High Score Saving (localStorage)
```javascript
// F2 Response: judge first, save after
const prev = getBestScore();
const isNew = score > prev;
if (isNew) saveBestScore(score);
// Display isNew in UI
```

---

## §17. Map Generation Algorithm

### 17.1 Procedural Map Generation
```
Floor 1: 2~3 battle nodes (first battle always Slime)
Floor 2: 2 battles + 1 event
Floor 3: 1 boss (fixed)
Floor 4: 2 battles + 1 shop
Floor 5: 2 battles + 1 rest
Floor 6: 1 boss (fixed)
Floor 7: 2 battles + 1 event
Floor 8: 2 battles + 1 shop
Floor 9: 3 battles (high elite chance)
Floor 10: 1 boss (fixed)
```

### 17.2 Path Connection Rules
- Each floor has 2~3 nodes
- Node connections: each node on a floor connects to 1~2 adjacent nodes on the next floor
- Boss floors (3/6/10) have a single node; all previous nodes connect to it
- Player can only select connected paths

---

## §18. Game Page Sidebar Data

```yaml
game:
  title: "Spell Card Dungeon"
  description: "A Slay the Spire-style roguelike deckbuilder. Collect cards, build your deck, and conquer the 10-floor dungeon!"
  genre: ["strategy"]
  playCount: 0
  rating: 0
  controls:
    - "Mouse: Click cards to play, hover for details"
    - "Keyboard: 1-5 select cards, E end turn, Space confirm"
    - "Touch: Tap to play cards, long press for details"
  tags:
    - "#deckbuilder"
    - "#roguelike"
    - "#cardgame"
    - "#turnbased"
    - "#dungeon"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## §19. Thumbnail Design (thumbnail.svg)

### Components
- **Background**: Dark dungeon atmosphere (navy gradient)
- **Center**: 3 cards fanned out (fire/ice/lightning, one each)
- **Top**: Game title "Spell Card Dungeon" text
- **Bottom**: Boss silhouette (Archmage)
- **Effects**: Glowing magic particles around cards
- **Aspect ratio**: 4:3 (800×600 viewBox)
- **Size**: 15KB+

---

_This design document was created by InfiniTriX AI Game Planner based on the Cycle #19 analysis report._
