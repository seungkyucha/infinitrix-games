---
game-id: abyss-keeper
title: Abyss Keeper
genre: action, casual
difficulty: medium
---

# Abyss Keeper — Cycle #24 Game Design Document

> **One-Page Summary**: Become a deep-sea lighthouse keeper, alternating between peaceful fishing & resource gathering (casual) and defending against abyssal monsters (action) in a dual-phase survival game. 15 Tide stages + 3 Abyss bosses + hidden stage "Mariana Trench". Lighthouse upgrade tree, weapon crafting, and weather/time-of-day changes add strategic depth. SeededRNG procedural wave patterns + random catches make every run unique. **Fills the action+casual genre gap completely.**

> **MVP Boundary**: Phase 1 (core loop: fishing→combat→upgrade, Tides 1~5 + Boss 1) + Phase 2 (Tides 6~15 + Boss 2,3 + weather + hidden) implemented sequentially. Phase 1 alone must deliver a complete game experience.

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅
> Items below have been verified over 18+ cycles and are detailed in platform-wisdom.md. Only the **application section** is noted here.

| ID | Lesson Summary | Applied In |
|----|---------------|------------|
| F1 | Never create assets/ directory — 7 cycles consecutive success [Cycle 1~17] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] — 12 cycles consecutive | §5.2 |
| F5 | Guard flag for single tween callback execution [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system [Cycle 3 B2] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numeric consistency table (spec=code 1:1) [Cycle 7] | §13.1 |
| F11 | Touch target min 48×48px + Math.max enforcement [Cycle 22] | §3.3 |
| F12 | TDZ prevention: var declaration → DOM assignment → event registration order [Cycle 5] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path per value (tween vs direct assignment) [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate 8 items [Cycle 22] | §13.3 |

### New Feedback (Based on Cycle 23 Post-mortem) 🆕

| ID | Lesson | Solution | Applied In |
|----|--------|----------|------------|
| F44 | P0 GAMEOVER→TITLE blocked for 5 rounds — RESTART_ALLOWED pattern not declared at spec stage | Explicitly declare RESTART_ALLOWED whitelist in §6.1 for first-pass approval | §6.1 |
| F45 | Single file bloat continues at 2,400+ lines — only REGION comments as mitigation | 10 REGION code area guide with line number ranges in §5.3. Target ≤2,500 lines through pattern reuse | §5.3 |
| F46 | Balance auto-verification missing — cannot verify 15 tides × 3 difficulties × many combinations via code review alone | 3-segment balance tables (early/mid/late) in §8.1 with CONFIG constant 1:1 mapping. DPS/EHP formulas | §8.1, §13.4 |
| F47 | 2nd review required 2 rounds — P0/P2 submitted unresolved initially | Expanded smoke test gate (10 items). RESTART_ALLOWED + 48px touch target as mandatory gate items | §13.3 |
| F48 | Verified pattern summaries too terse in 2-layer split — missing platform-wisdom back-references | Added [Cycle N BN] format references in verified table (applied in this §0) | §0 |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
Abyss Keeper is the story of the last guardian of the deepest lighthouse in the ocean. During the day, fish in the deep sea and collect drifting salvage to strengthen the lighthouse (casual phase). At night, defend the lighthouse against monsters surging from the abyss (action phase). The two phases naturally cycle, allowing casual players to enjoy fishing and building while action players focus on combat.

### 1.2 Three Pillars of Fun
1. **Casual Fishing & Gathering Satisfaction**: Timing-based fishing minigame, random catch collection log, salvage exploration. The anticipation of "what will I catch next?"
2. **Real-time Combat Action**: Differentiated attacks per weapon — harpoon throwing, sonic cannon firing, net casting. Read monster patterns, dodge, and defend the lighthouse.
3. **Lighthouse Growth System**: Permanent upgrade tree — expand light range, increase durability, boost sonar detection. The ownership feel of "growing my lighthouse" and strategic investment decisions.

### 1.3 Story/Narrative
- **Background**: The ancient oceanic civilization "Atlas" sealed the "Abyssal Rift" deep in the ocean. As the seal weakens, monsters begin rising from the depths. The player is the last heir of the Keeper lineage that has guarded the lighthouse for generations.
- **Goal**: Survive 15 Tides, collect 3 seal fragments, and re-seal the Abyssal Rift.
- **Story Delivery**: Short cutscenes (Canvas-rendered) after each boss defeat + "Sea Records" discovered each tide (as salvage) gradually reveal Atlas civilization secrets.
- **Endings**: Peaceful ending watching the horizon from the lighthouse after sealing. Hidden stage clear unlocks "Truth of Atlas" additional ending.

### 1.4 Genre Gap Resolution
- **action + casual = 0 games** → **Completely filled** by this game
- Differentiated from existing casual games (neon-dash-runner, mini-idle-farm): dual-phase structure with real-time combat action
- Differentiated from existing action games (rune-survivor, mini-survivor-arena): casual relaxation phases with fishing and building

---

## §2. Game Rules & Objectives

### 2.1 Basic Rules
- The game progresses in Tide cycles alternating between **Casual Phase** (day) and **Action Phase** (night)
- Each Tide = Casual Phase (60s) + Action Phase (90s) ≈ 2.5 minutes
- Casual Phase: fishing, salvage collection, lighthouse upgrades, equipment crafting
- Action Phase: repel deep-sea monsters arriving with waves, defend lighthouse
- Game over when lighthouse HP reaches 0 (30% of earned resources preserved as permanent currency)

### 2.2 Win/Lose Conditions
- **Win**: Defeat Tide 15 boss (Lord of the Abyss) + complete sealing
- **Lose**: Lighthouse HP 0 → run ends. 30% of earned coral (permanent currency) preserved
- **Hidden Stage**: Complete all Tides 1~15 with zero lighthouse damage + collect all Sea Records → "Mariana Trench" unlocked

### 2.3 Tide Composition
| Tide | Theme | Features | Boss |
|------|-------|----------|------|
| 1~5 | Shallow Sea | Basic fishing & combat tutorial, weak monsters | Tide 5: Abyssal Angler |
| 6~10 | Mid-Deep Sea | Weather changes begin, mid-tier monsters + current traps | Tide 10: Kraken Larva |
| 11~15 | The Abyss | Storms + fog + powerful monsters simultaneously | Tide 15: Lord of the Abyss |
| 16 | Mariana Trench (Hidden) | Pure exploration + puzzle (no combat) | — |

### 2.4 Three Difficulty Levels
| Difficulty | Lighthouse HP Mult | Enemy Scaling | Fishing Rewards | Combat Rewards | Unlock |
|------------|-------------------|---------------|-----------------|----------------|--------|
| Easy | ×1.5 | ×0.7 | ×1.3 | ×0.8 | None |
| Normal | ×1.0 | ×1.0 | ×1.0 | ×1.0 | None |
| Hard | ×0.7 | ×1.5 | ×0.7 | ×1.5 | Clear Tide 10+ |

---

## §3. Controls

### 3.1 Keyboard
| Key | Casual Phase | Action Phase |
|-----|-------------|-------------|
| WASD / Arrow Keys | Move around lighthouse (find fishing spots) | Move character (defend lighthouse perimeter) |
| Space | Cast/reel fishing line (timing) | Primary weapon attack |
| E | Collect salvage / shop interaction | Secondary weapon use |
| Q | Toggle upgrade menu | Fire sonar pulse (AoE attack) |
| 1~3 | Switch weapon slot | Switch weapon slot |
| ESC | Pause menu | Pause menu |

### 3.2 Mouse
| Action | Casual Phase | Action Phase |
|--------|-------------|-------------|
| Left Click | Cast fishing line / UI buttons | Aim direction + fire |
| Right Click | Collect salvage | Secondary weapon |
| Scroll Wheel | Switch weapon slot | Switch weapon slot |
| Move | Show aim direction | Show aim direction |

### 3.3 Touch (Mobile)
| Action | Casual Phase | Action Phase |
|--------|-------------|-------------|
| Virtual Joystick (left) | Move | Move |
| Tap (right) | Fish/Collect | Attack |
| Double-tap (right) | — | Sonar pulse |
| Top slot buttons | Weapon switch / Upgrade | Weapon switch |

> ⚠️ **F11 compliance**: All touch buttons ≥ `Math.max(48, computed)` px. Virtual joystick area minimum 120×120px.

### 3.4 Viewport Adaptation
| Viewport | Layout Adjustments |
|----------|-------------------|
| 320px | Joystick 80px, buttons 48px, UI scale 0.7 |
| 480px | Joystick 100px, buttons 52px, UI scale 0.8 |
| 768px | Standard layout |
| 1024px+ | Side info panel displayed |

> ⚠️ **F42 compliance**: All UI element Y-coordinates use `Math.min(H*0.72, H-(n*(btnH+gap)+margin))` pattern.

---

## §4. Visual Style Guide

### 4.1 Asset Principles
- **Never create assets/ directory** (F1 — 7 cycles consecutive success, targeting 8th)
- **Zero external CDN/fonts** (F2)
- All visuals rendered via **Canvas 2D API** (inline SVG generation functions)
- SVG filters (feGaussianBlur etc.) **prohibited** — use Canvas shadow/gradient instead

### 4.2 Color Palette

| Usage | Color | HEX |
|-------|-------|-----|
| Deep sea background (deep) | Midnight Blue | #0A1628 |
| Deep sea background (mid) | Deep Ocean | #0D2847 |
| Shallow water | Ocean Blue | #1A4B7A |
| Lighthouse light | Warm Gold | #FFD93D |
| Light diffusion | Soft Amber | #FFA94D |
| Casual UI accent | Aqua Mint | #38D9A9 |
| Action UI accent | Coral Red | #FF6B6B |
| Monster eyes / danger | Neon Purple | #BE4BDB |
| Boss aura | Deep Crimson | #C92A2A |
| HP bar | Emerald | #51CF66 |
| Primary text | Light Gray | #E9ECEF |
| Secondary text | Medium Gray | #ADB5BD |

### 4.3 Background / Environment

- **Casual Phase**: Gentle wave animation (3-layer sin curves), lighthouse light spreading golden over the surface, starry sky, fish silhouettes faintly visible below the surface
- **Action Phase**: Sky turns reddish-purple, waves intensify, lighthouse light becomes the only safe zone, green/purple bioluminescent effects from the deep
- **Weather Effects**: Rain (particle system), fog (semi-transparent overlay), storm (screen shake + lightning), moonlit (enhanced lighthouse light effect)
- **Time Change**: Sky gradient naturally shifts during casual→action transition (tween-based, 3 seconds)

### 4.4 Drawing Function Signatures (F9 Pure Functions)

```
drawLighthouse(ctx, x, y, scale, hp, maxHp, lightAngle, lightRange)
drawKeeper(ctx, x, y, dir, frame, weapon, isAttacking)
drawMonster(ctx, x, y, type, hp, maxHp, frame, isHurt)
drawBoss(ctx, x, y, phase, hp, maxHp, frame, effects)
drawWave(ctx, waveOffset, amplitude, color, alpha)
drawWeather(ctx, type, intensity, particles)
drawFishingLine(ctx, startX, startY, endX, endY, tension, bobberFrame)
drawUI(ctx, W, H, state, resources, tideNum, phase)
drawUpgradeMenu(ctx, W, H, upgrades, selected, resources)
drawMinigame(ctx, W, H, type, progress, target)
```

> ⚠️ All drawing functions must never access global variables directly. Data received only through parameters.

### 4.5 Asset List (Canvas Inline Rendering)

| # | Asset | Usage | Size (logical) | Frames |
|---|-------|-------|----------------|--------|
| 1~8 | Keeper 8-direction | Movement animation | 64×64 | 8 |
| 9~11 | Keeper attack (harpoon/net/sonic) | Attack motion | 64×64 | 3 |
| 12 | Lighthouse | Main structure | 128×256 | 1 (light rotation separate) |
| 13~15 | Regular monsters ×3 | Jellyfish/Shark/Crustacean | 48×48 | 4 (movement frames) |
| 16 | Boss: Abyssal Angler | Tide 5 boss | 96×96 | 6 |
| 17 | Boss: Kraken Larva | Tide 10 boss | 120×120 | 6 |
| 18 | Boss: Lord of the Abyss | Tide 15 boss | 160×160 | 8 |
| 19~21 | Weapon icons ×3 | Harpoon/Net/Sonic Cannon | 32×32 | 1 |
| 22 | Fishing rod + bobber | Fishing minigame | 24×48 | 3 (cast/wait/catch) |
| 23 | Fish silhouettes ×5 | Underwater background | 16~32 | 2 |
| 24 | Salvage items ×3 | Collection objects | 24×24 | 1 |
| 25 | Thumbnail | Home GameCard | 400×300 | 1 |

---

## §5. Core Game Loop (Frame-Level Logic)

### 5.1 Initialization Order (F12 TDZ Prevention)

```
1. CONFIG constants declaration
2. Global state variable declaration (let with initial values)
3. Canvas DOM assignment (document.getElementById)
4. TweenManager, ObjectPool, SoundManager instance creation
5. Event listener registration (keyboard, mouse, touch, resize)
6. Game loop start (requestAnimationFrame)
```

### 5.2 Main Loop (60fps basis)

```
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // 50ms cap
  lastTime = timestamp;

  // 1. Input processing
  processInput(inputState);

  // 2. Update systems per ACTIVE_SYSTEMS[currentState]
  if (ACTIVE_SYSTEMS[state].tween) tweenMgr.update(dt);
  if (ACTIVE_SYSTEMS[state].physics) updatePhysics(dt);
  if (ACTIVE_SYSTEMS[state].ai) updateAI(dt);
  if (ACTIVE_SYSTEMS[state].weather) updateWeather(dt);
  if (ACTIVE_SYSTEMS[state].wave) updateWaves(dt);
  if (ACTIVE_SYSTEMS[state].timer) updateTimer(dt);
  if (ACTIVE_SYSTEMS[state].particles) particlePool.update(dt);
  if (ACTIVE_SYSTEMS[state].fishing) updateFishing(dt);
  if (ACTIVE_SYSTEMS[state].combat) updateCombat(dt);
  if (ACTIVE_SYSTEMS[state].camera) updateCamera(dt);

  // 3. Rendering
  render(ctx, W, H, state, gameData);

  // 4. Next frame
  requestAnimationFrame(gameLoop);
}
```

> ⚠️ **F4**: Zero setTimeout/setInterval. All delays handled via TweenManager onComplete.
> ⚠️ **F5**: All tween callbacks use guard flags. `if (tideClearing) return; tideClearing = true;`
> ⚠️ **F13**: TweenManager has separate `clearImmediate()` API to prevent cancelAll+add race conditions.
> ⚠️ **F14**: Each value (lighthouse HP, keeper position, etc.) uses either tween OR direct assignment, never both.

### 5.3 Code Region Guide (REGION Comments)

| # | REGION | Content | Est. Lines |
|---|--------|---------|------------|
| 1 | CONFIG & CONSTANTS | Game constants, balance values, color palette | 1~200 |
| 2 | ENGINE (Tween/Pool/Sound) | TweenManager, ObjectPool, SoundManager, SeededRNG | 201~500 |
| 3 | STATE MACHINE | State definitions, transitions, ACTIVE_SYSTEMS, RESTART_ALLOWED | 501~650 |
| 4 | GAME LOGIC - CASUAL | Fishing system, gathering, upgrades, crafting | 651~1000 |
| 5 | GAME LOGIC - ACTION | Combat, AI, collision, weapons, boss patterns | 1001~1450 |
| 6 | PROCEDURAL GENERATION | SeededRNG, wave patterns, catch tables, weather | 1451~1650 |
| 7 | RENDERING | Drawing functions, particles, camera, UI | 1651~2150 |
| 8 | AUDIO | Web Audio API, BGM, SFX | 2151~2300 |
| 9 | INPUT & EVENTS | Keyboard/mouse/touch, resize | 2301~2400 |
| 10 | INIT & LOOP | Initialization, main loop, localStorage | 2401~2500 |

> Total estimate: **~2,500 lines** (within F45 target)

---

## §6. State Machine

### 6.1 State Definitions & Transitions

```
State List:
  BOOT → TITLE → DIFFICULTY_SELECT → CASUAL_PHASE → ACTION_PHASE →
  BOSS_INTRO → BOSS_FIGHT → BOSS_VICTORY → TIDE_RESULT →
  UPGRADE_MENU → GAMEOVER → VICTORY → HIDDEN_STAGE → PAUSE → CONFIRM_MODAL

State Priority (higher = takes precedence):
  BOOT=0, TITLE=1, DIFFICULTY_SELECT=2,
  CASUAL_PHASE=5, FISHING_MINIGAME=5, ACTION_PHASE=5,
  BOSS_INTRO=6, BOSS_FIGHT=6, BOSS_VICTORY=7,
  TIDE_RESULT=7, UPGRADE_MENU=5,
  PAUSE=8, CONFIRM_MODAL=9,
  GAMEOVER=10, VICTORY=10, HIDDEN_STAGE=5
```

**RESTART_ALLOWED Whitelist** (F44):
```javascript
const RESTART_ALLOWED = ['GAMEOVER', 'VICTORY', 'HIDDEN_STAGE'];
// In beginTransition() for reverse-priority transitions:
// if (RESTART_ALLOWED.includes(currentState)) → allow transition
// else → block transition + console.warn
```

> ⚠️ Transitions from GAMEOVER and VICTORY to TITLE are reverse-priority but **always allowed** via the RESTART_ALLOWED whitelist. This pattern is the definitive solution for the P0 bug that persisted for 5 rounds across Cycles 21~23.

**Phase Transition Flow (ASCII Diagram)**:
```
TITLE ──select──→ DIFFICULTY_SELECT ──start──→ CASUAL_PHASE
                                                  │
                           ┌──────────────────────┘
                           ▼
                      CASUAL_PHASE ──timer(60s)──→ ACTION_PHASE
                           ▲                          │
                           │                    ┌─────┴──────┐
                      TIDE_RESULT          tide<boss    tide==boss
                           ▲                │            │
                           │           ACTION end    BOSS_INTRO
                      UPGRADE_MENU         │            │
                           ▲          TIDE_RESULT   BOSS_FIGHT
                           │                         │    │
                           └─────────────────────────┘  lose
                                    win                   │
                                                     GAMEOVER
                                                        │
                           Tide15 boss win ──→ VICTORY  │
                                    │              │    │
                                    ▼              ▼    ▼
                              HIDDEN_STAGE ──→ TITLE ◄──┘
                              (if qualified)  (RESTART_ALLOWED)
```

### 6.2 State × System Matrix (F7)

| State | tween | physics | ai | weather | wave | timer | particles | fishing | combat | camera | audio |
|-------|-------|---------|-----|---------|------|-------|-----------|---------|--------|--------|-------|
| BOOT | ✓ | | | | | | | | | | |
| TITLE | ✓ | | | | ✓ | | ✓ | | | | ✓ |
| DIFFICULTY_SELECT | ✓ | | | | ✓ | | ✓ | | | | ✓ |
| CASUAL_PHASE | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ |
| FISHING_MINIGAME | ✓ | | | ✓ | ✓ | ✓ | ✓ | ✓ | | | ✓ |
| ACTION_PHASE | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ |
| BOSS_INTRO | ✓ | | | ✓ | ✓ | | ✓ | | | ✓ | ✓ |
| BOSS_FIGHT | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ |
| BOSS_VICTORY | ✓ | | | ✓ | ✓ | | ✓ | | | ✓ | ✓ |
| TIDE_RESULT | ✓ | | | | ✓ | | ✓ | | | | ✓ |
| UPGRADE_MENU | ✓ | | | | ✓ | | ✓ | | | | ✓ |
| GAMEOVER | ✓ | | | | ✓ | | ✓ | | | | ✓ |
| VICTORY | ✓ | | | | ✓ | | ✓ | | | ✓ | ✓ |
| HIDDEN_STAGE | ✓ | ✓ | | | ✓ | | ✓ | ✓ | | ✓ | ✓ |
| PAUSE | ✓ | | | | | | | | | | |
| CONFIRM_MODAL | ✓ | | | | | | | | | | |

### 6.3 Phase Transition Animations
- CASUAL → ACTION: Sky gradient darkens over 3 seconds, warning siren + "Monster Raid!" text tween
- ACTION → TIDE_RESULT: Last monster killed triggers 1.5s slow-motion + explosion particles → result screen fade-in
- BOSS_INTRO: Screen zoom-in + boss title card text + dedicated BGM transition (2s)
- All transitions require `beginTransition()` (F6)

### 6.4 Canvas Modals (F3)
- All dialogs (pause, confirm, quit) rendered as semi-transparent Canvas overlay + buttons
- `confirm()` / `alert()` usage absolutely prohibited

---

## §7. Core Systems Detail

### 7.1 Fishing System (Casual Phase)

**Fishing Minigame Flow**:
1. Space/click to cast → bobber arcs through the air
2. Wait time (SeededRNG-based 2~8 seconds) → bobber wobbles (fish approach signal)
3. Timing bar appears → press Space when moving cursor is in "hit zone" for success
4. Success: fish type + size determined (SeededRNG + fishing gear bonus)
5. Failure: bait consumed + wait time increases

**Catch Grades**:
| Grade | Probability | Sale Price | Special Effect |
|-------|------------|------------|----------------|
| Common (white) | 60% | 5~15 | — |
| Rare (blue) | 25% | 20~50 | Small lighthouse HP recovery |
| Legendary (gold) | 12% | 80~150 | Weapon enhancement material |
| Abyssal (purple) | 3% | 200~500 | Permanent upgrade material |

### 7.2 Combat System (Action Phase)

**Three Weapons**:
| Weapon | Attack Style | DPS | Range | Trait |
|--------|-------------|-----|-------|-------|
| Harpoon | Linear projectile | High | Narrow | Piercing (max 2 targets) |
| Net | Area throw | Medium | Wide | 2s slow effect |
| Sonic Cannon | Circular wave | Low | Maximum | Knockback + lighthouse safe zone |

**Three Monster Types**:
| Monster | HP | ATK | Speed | Pattern |
|---------|-----|-----|-------|---------|
| Deep-sea Jellyfish | Low | Low | Slow | Linear movement, contact poison (lighthouse DoT) |
| Deep-sea Shark | Medium | High | Fast | Rush pattern, brief pause then re-rush |
| Deep-sea Crustacean | High | Medium | Slow | High defense, immune to nets |

### 7.3 Boss Battles

**Boss 1: Abyssal Angler (Tide 5)**
```
Phase 1 (HP 100%~60%): Lure light pulls keeper → dodge required
Phase 2 (HP 60%~30%): Darkness blast reduces lighthouse range → sonic cannon to clear
Phase 3 (HP 30%~0%): Splits into 3 mini-copies → defeat each
         ┌─HP>60%──→ Phase1 (Lure)
  IDLE ──┤
         ├─HP>30%──→ Phase2 (Darkness)
         │
         └─HP≤30%──→ Phase3 (Split) ──→ DEFEATED
```

**Boss 2: Kraken Larva (Tide 10)**
```
Phase 1 (HP 100%~50%): 4 tentacles attack from all sides → individual tentacle HP
Phase 2 (HP 50%~20%): Ink spray blocks vision + tentacle regeneration
Phase 3 (HP 20%~0%): Core exposed → focused attack window (10s limit)
         ┌─HP>50%──→ Phase1 (Tentacles)
  IDLE ──┤
         ├─HP>20%──→ Phase2 (Ink+Regen)
         │
         └─HP≤20%──→ Phase3 (Core Exposed) ──→ DEFEATED
```

**Boss 3: Lord of the Abyss (Tide 15)**
```
Phase 1 (HP 100%~70%): Abyssal Wave (omnidirectional bullet pattern) + summons
Phase 2 (HP 70%~40%): Dimension Warp (partial screen inversion + controls reversed 5s)
Phase 3 (HP 40%~15%): Rage Mode (2× speed, 1.5× ATK, mixed patterns)
Phase 4 (HP 15%~0%): Last Stand (charges lighthouse directly → 2 successful dodges trigger defeat QTE)
         ┌─HP>70%──→ Phase1 (Wave+Summon)
  IDLE ──┤
         ├─HP>40%──→ Phase2 (DimensionWarp)
         ├─HP>15%──→ Phase3 (Rage)
         └─HP≤15%──→ Phase4 (LastStand→QTE) ──→ DEFEATED
```

### 7.4 Weather System

| Weather | Appears | Casual Effect | Action Effect |
|---------|---------|--------------|---------------|
| Clear | 1~15 | Default | Default |
| Rain | 4~15 | Rare fish chance +10% | Slightly reduced visibility, light diffusion |
| Fog | 6~15 | Salvage spawn +20% | Greatly reduced visibility, sonar detection essential |
| Storm | 9~15 | Fishing timing bar acceleration | Screen shake, monster speed +20%, lightning (random AoE damage) |
| Moonlit | 3~15 | Abyssal grade fish chance +5% | Lighthouse light range +30%, monster HP -10% |

### 7.5 Lighthouse Upgrade Tree (Permanent Progression)

| Category | Upgrade | Max Level | Effect | Coral Cost (Lv1→Max) |
|----------|---------|-----------|--------|----------------------|
| Light | Light Range | 5 | +10%/Lv | 50→250 |
| Light | Light Intensity | 5 | Monster approach speed -5%/Lv | 80→400 |
| Durability | Lighthouse HP | 5 | +50/Lv (base 500) | 60→300 |
| Durability | Auto Repair | 3 | +2HP/5s/Lv | 100→300 |
| Weapons | Harpoon Enhancement | 5 | ATK +10%/Lv | 40→200 |
| Weapons | Net Enhancement | 5 | Range +8%/Lv, duration +0.3s/Lv | 40→200 |
| Weapons | Sonic Cannon Enhancement | 5 | Range +10%/Lv, knockback +15%/Lv | 40→200 |
| Fishing | Fishing Gear | 5 | Rare chance +3%/Lv | 30→150 |
| Fishing | Bait Efficiency | 3 | Bait consumption -20%/Lv | 50→150 |
| Sonar | Detection Range | 3 | +15%/Lv | 70→210 |
| Sonar | Cooldown Reduction | 3 | -2s/Lv (base 12s) | 80→240 |

---

## §8. Difficulty System

### 8.1 Three-Segment Balance Tables (F46)

**Early (Tide 1~5)**:
| Item | Value |
|------|-------|
| Monsters per wave | 3→8 |
| Monster HP | 30→60 |
| Monster ATK | 5→10 |
| Monster Speed | 1.0→1.3 |
| Fishing timing bar speed | 1.0 |
| Fish sale price multiplier | 1.0 |
| Boss HP | 500 (Abyssal Angler) |

**Mid (Tide 6~10)**:
| Item | Value |
|------|-------|
| Monsters per wave | 8→15 |
| Monster HP | 60→120 |
| Monster ATK | 10→20 |
| Monster Speed | 1.3→1.6 |
| Fishing timing bar speed | 1.2 |
| Fish sale price multiplier | 1.5 |
| Boss HP | 1200 (Kraken Larva) |

**Late (Tide 11~15)**:
| Item | Value |
|------|-------|
| Monsters per wave | 15→25 |
| Monster HP | 120→200 |
| Monster ATK | 20→35 |
| Monster Speed | 1.6→2.0 |
| Fishing timing bar speed | 1.5 |
| Fish sale price multiplier | 2.0 |
| Boss HP | 2500 (Lord of the Abyss) |

### 8.2 DPS/EHP Balance Formulas

```
Player DPS = BaseWeaponATK × (1 + UpgradeLv × 0.1) × AttackSpeed
Monster EHP = HP × (1 + DifficultyModifier)
Clear condition: PlayerDPS × 90s > TotalMonsterEHP × 1.2 (20% margin)

Lighthouse survival condition:
  LighthouseEHP = (500 + UpgradeLv × 50) × DifficultyMultiplier
  TotalMonsterDPS = Σ(MonsterATK × MonsterCount / HitInterval)
  LighthouseEHP > TotalMonsterDPS × 90s × 0.5 (assume player defends 50%)
```

### 8.3 Dynamic Difficulty Adjustment
- 3 consecutive Tides cleared without damage → next Tide monster count +10%
- 3 consecutive Tides with lighthouse HP below 30% → next Tide monster count -10%, fishing rewards +20%
- Died to boss 3 times → "Lighthouse Blessing" buff offered (lighthouse auto-heal +5/s)

---

## §9. Score System

### 9.1 Score Composition

| Item | Score |
|------|-------|
| Regular monster kill | 10 × Tide number |
| Boss kill | 500 / 1500 / 5000 |
| Fish caught (by grade) | 5 / 15 / 50 / 200 |
| Salvage collected | 10 |
| Tide cleared without lighthouse damage | 200 × Tide number |
| Hidden stage clear | 10000 |

### 9.2 Coral (Permanent Currency)

| Source | Coral Amount |
|--------|-------------|
| Tide clear | 10 × Tide number |
| Boss defeat | 50 / 150 / 500 |
| Fish sale | Sale price × 0.1 (floored) |
| Game over preservation | Earned coral × 0.3 |
| Victory preservation | Earned coral × 1.0 |

### 9.3 Leaderboard (localStorage)
- Top 10 records saved
- Display: rank, score, tide reached, difficulty, date

---

## §10. Procedural Generation

### 10.1 SeededRNG
```javascript
class SeededRNG {
  constructor(seed) { this.state = seed; }
  next() {
    this.state = (this.state * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (this.state >>> 0) / 0xFFFFFFFF;
  }
  range(min, max) { return min + this.next() * (max - min); }
  intRange(min, max) { return Math.floor(this.range(min, max + 1)); }
}
```

### 10.2 Wave Pattern Generation
- Each Tide's seed = baseSeed + tideNumber × 7919
- Wave pattern: monster spawn timing, type, position determined by seed
- **Verification**: Generated pattern's total DPS must not exceed lighthouse EHP × 2 (F46 balance)

### 10.3 Catch Tables
- Seed-based catch determination: grade → type → size (sequential random consumption)
- Fishing gear level probability adjustment: `rareChance = baseChance + gearLv × 0.03`

---

## §11. Data Persistence (localStorage)

### 11.1 Data Schema

```javascript
const SAVE_SCHEMA = {
  version: 1,
  // Permanent progression
  coral: 0,
  upgrades: {
    lightRange: 0,
    lightIntensity: 0,
    lighthouseHp: 0,
    autoRepair: 0,
    harpoon: 0,
    net: 0,
    sonicCannon: 0,
    fishingGear: 0,
    baitEfficiency: 0,
    sonarRange: 0,
    sonarCooldown: 0,
  },
  // Records
  bestScore: 0,
  bestTide: 0,
  totalRuns: 0,
  totalFishCaught: 0,
  bossesDefeated: [false, false, false],
  hiddenUnlocked: false,
  hiddenCleared: false,
  // Leaderboard
  leaderboard: [],
  // Settings
  settings: {
    difficulty: 'normal',
    lang: 'ko',
    sfxVolume: 0.7,
    bgmVolume: 0.5,
  }
};
```

> ⚠️ **F8**: "Judge first, save later" — evaluate new record before saving. `if (score > save.bestScore)` evaluated first, then `save.bestScore = score`.

### 11.2 Migration
```javascript
function migrateSave(data) {
  if (!data.version) data = { ...SAVE_SCHEMA, ...data, version: 1 };
  // Future version 2 migration added here
  return data;
}
```

---

## §12. Audio (Web Audio API)

### 12.1 BGM
| Track | State | Style |
|-------|-------|-------|
| Title | TITLE | Calm sea ambience + melody |
| Casual | CASUAL_PHASE | Peaceful acoustic loop |
| Action | ACTION_PHASE | Tense drums + bass |
| Boss | BOSS_FIGHT | Epic orchestral style |
| Victory | VICTORY | Grand fanfare |

### 12.2 Sound Effects (8+)
| # | SFX | Trigger |
|---|-----|---------|
| 1 | Wave sound | Wave animation cycle |
| 2 | Fishing cast | Space key (casual) |
| 3 | Fish caught | Fishing success |
| 4 | Harpoon fire | Primary attack (harpoon) |
| 5 | Net throw | Primary attack (net) |
| 6 | Sonic blast | Primary attack (sonic cannon) |
| 7 | Monster hit | Damage dealt to monster |
| 8 | Monster death | Monster HP 0 |
| 9 | Boss entrance | BOSS_INTRO transition |
| 10 | Lighthouse hit | Damage to lighthouse |
| 11 | Upgrade purchase | Upgrade menu |
| 12 | UI click | Button interaction |

---

## §13. Verification Checklists

### 13.1 Numeric Consistency Table (F10)

> Spec values = CONFIG constants 1:1 mapping required.

| Spec Location | Value Name | Value | CONFIG Constant |
|--------------|------------|-------|-----------------|
| §2.1 | Casual phase duration | 60s | CASUAL_DURATION |
| §2.1 | Action phase duration | 90s | ACTION_DURATION |
| §2.4 | Easy lighthouse HP mult | 1.5 | DIFF_HP_MULT.easy |
| §2.4 | Hard enemy scaling | 1.5 | DIFF_ENEMY_MULT.hard |
| §7.1 | Abyssal fish probability | 3% | FISH_PROB.abyssal |
| §7.5 | Base lighthouse HP | 500 | BASE_LIGHTHOUSE_HP |
| §7.5 | HP upgrade per level | +50 | UPGRADE_HP_PER_LV |
| §8.1 | Boss 1 HP | 500 | BOSS_HP[0] |
| §8.1 | Boss 2 HP | 1200 | BOSS_HP[1] |
| §8.1 | Boss 3 HP | 2500 | BOSS_HP[2] |

### 13.2 Viewport Test Matrix

| Viewport | Verification Items |
|----------|-------------------|
| 320px | Virtual joystick position, UI buttons ≥48px, fishing timing bar visibility |
| 480px | Upgrade menu scroll, boss HP bar visibility, touch target spacing |
| 768px | Standard layout, no side info panel |
| 1024px+ | Side info panel, all UI correctly positioned |

### 13.3 Smoke Test Gate (F15 + F47 Expanded)

| # | Test Item | PASS Criteria |
|---|-----------|--------------|
| 1 | index.html exists and loads | 0 console errors |
| 2 | Title screen displays | TITLE state entered |
| 3 | Game can start | CASUAL_PHASE entered |
| 4 | Fishing minigame works | At least 1 fish caught |
| 5 | Action phase transition | ACTION_PHASE entered after 60s |
| 6 | Monster spawn and kill | At least 1 monster killed |
| 7 | GAMEOVER→TITLE transition | RESTART_ALLOWED pattern works |
| 8 | Touch buttons ≥48px | All touch targets verified |
| 9 | localStorage save/load | Upgrades persist |
| 10 | No assets/ directory | Directory absence confirmed |

### 13.4 Balance Verification (F46)

| Verification Item | Expected Range | Measurement |
|-------------------|---------------|-------------|
| Tide 1 clear time | 120~150s | Timer log |
| Tide 5 boss fight duration | 30~60s | No upgrades baseline |
| Tide 10 reachability (Normal) | After 1~2 upgrade cycles | 100~200 coral spent |
| Tide 15 clear (Normal) | 5~8 runs | Upgrades at 70%+ |
| Harpoon DPS (Lv0) | 50/s | Attack speed × ATK |
| Lighthouse survival (Tide 15, Normal) | HP 20%+ remaining | Max upgrades |

---

## §14. Sidebar Metadata (Game Page)

```yaml
game:
  title: "Abyss Keeper"
  description: "Become a deep-sea lighthouse keeper! Fish by day, fight abyssal monsters by night! An action-casual survival across 15 tides."
  genre: ["action", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/Arrows: Move"
    - "Space: Fish / Attack"
    - "E: Collect / Secondary"
    - "Q: Upgrade / Sonar"
    - "1~3: Switch weapon"
    - "ESC: Pause"
    - "Touch: Virtual joystick + buttons"
  tags:
    - "#deep-sea"
    - "#lighthouse"
    - "#fishing"
    - "#monster-combat"
    - "#survival"
    - "#upgrades"
    - "#procedural"
    - "#weather"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## §15. Thumbnail Composition

**Cinematic Composition (400×300)**:
- Center-bottom: Lighthouse (golden light spreading in a fan shape)
- Left: Keeper in harpoon-throwing action pose
- Upper-right: Abyssal Angler's lure light glowing in the darkness
- Background: Midnight blue gradient + starlight + waves
- Bottom: "Abyss Keeper" title text (Warm Gold)
- Overall atmosphere: contrast between the lighthouse's warm light and the deep sea's cold darkness

---

## §16. Localization

### 16.1 Text Key Structure
```javascript
const TEXT = {
  ko: {
    title: '어비스 키퍼',
    subtitle: '심연의 등대를 지켜라',
    start: '시작',
    continue: '이어하기',
    difficulty: { easy: '쉬움', normal: '보통', hard: '어려움' },
    phase: { casual: '낮 — 낚시 & 채집', action: '밤 — 괴수 습격!' },
    boss: { angler: '심해 앵글러', kraken: '크라켄 유생', lord: '심연의 군주' },
    weather: { clear: '맑음', rain: '비', fog: '안개', storm: '폭풍', moonlit: '달밤' },
    gameover: '등대가 무너졌습니다...',
    victory: '심연의 균열이 봉인되었습니다!',
    hidden: '마리아나 해구가 열렸습니다...',
    // ...
  },
  en: {
    title: 'Abyss Keeper',
    subtitle: 'Defend the Lighthouse of the Abyss',
    start: 'Start',
    continue: 'Continue',
    difficulty: { easy: 'Easy', normal: 'Normal', hard: 'Hard' },
    phase: { casual: 'Day — Fish & Gather', action: 'Night — Monster Raid!' },
    boss: { angler: 'Abyssal Angler', kraken: 'Kraken Larva', lord: 'Lord of the Abyss' },
    weather: { clear: 'Clear', rain: 'Rain', fog: 'Fog', storm: 'Storm', moonlit: 'Moonlit' },
    gameover: 'The lighthouse has fallen...',
    victory: 'The Abyssal Rift has been sealed!',
    hidden: 'The Mariana Trench has opened...',
    // ...
  }
};
```

---

## §17. Previous Cycle Issues Resolution Summary

| Issue (Cycle 23) | Resolution Section | Solution |
|-------------------|-------------------|----------|
| P0 GAMEOVER→TITLE blocked for 5 rounds | §6.1 | RESTART_ALLOWED whitelist explicitly declared at spec stage |
| 2nd review required 2 rounds | §13.3 | Smoke test gate expanded to 10 items (incl. RESTART_ALLOWED + 48px) |
| Single file size keeps growing | §5.3 | 10 REGION code area guide + ≤2,500 line target |
| Balance auto-verification missing | §8.1, §8.2, §13.4 | 3-segment balance tables + DPS/EHP formulas + verification checklist |
| Multi-stakeholder feedback process recurring 3 cycles | §13.3 | Smoke test gate as mandatory pre-submission requirement |

---

_This document is the detailed design specification for "Abyss Keeper", the Cycle #24 game of the InfiniTriX platform._
_Created: 2026-03-22 | Planning Agent: planner_
