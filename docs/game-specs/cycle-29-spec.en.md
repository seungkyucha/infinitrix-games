---
game-id: shadow-rift
title: Shadow Rift
genre: action, puzzle
difficulty: hard
---

# Shadow Rift — Cycle #29 Game Design Document

> **One-Page Summary**: A **metroidvania roguelite** where you explore interconnected rooms linked by dimensional rifts, unlock abilities, and defeat bosses. 5 zones (Ruin/Crystal/Abyss/Magma/Void) × 3 rooms = 15 base rooms + 2 hidden rooms = **17 stages total**. 5 zone bosses + hidden boss "Void Weaver" = **6 bosses**. 5-stage ability gating (Dash→Wall Jump→Dimension Shift→Time Stop→Gravity Flip) for nonlinear exploration. 3-pick artifact selection per room clear (common 6/rare 4/epic 3 = 13 types), permanent upgrade trees ×3 (Shadow/Rift/Echo), SeededRNG procedural room variation, 3-tier difficulty (Explorer/Warrior/Legend), DDA dynamic balance, bilingual (KO/EN). **Strengthens action+puzzle from 1→2 games**, following Poki 2026.3 #1 Level Devil (action+puzzle) trend.

> **MVP Boundary**: Phase 1 (core loop: explore→combat→ability unlock→puzzle→boss, zones 1~2 + 2 bosses + 3 abilities (dash/wall jump/dimension shift) + 6 artifacts + basic upgrade tree) → Phase 2 (zones 3~5 + 3 bosses + hidden boss + 2 abilities (time stop/gravity flip) + full narrative + 7 artifacts). Phase 1 alone must deliver a complete game experience.

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅
> Items below have been verified across 20+ cycles and are detailed in platform-wisdom.md. Only the **applicable section** is noted here.

| ID | Lesson Summary | Section |
|----|---------------|---------|
| F1 | Never create assets/ directory — 12 cycles consecutive success [Cycle 1~28] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] — target 18 cycles consecutive | §5.2 |
| F5 | Guard flag for single tween callback execution [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system [Cycle 3 B2] | §6.1 |
| F7 | State × System matrix mandatory [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save after [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numerical consistency table (spec=code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target min 48×48px + Math.max enforcement [Cycle 12~22] | §3.3 |
| F12 | TDZ prevention: variable declaration → DOM assignment → event registration order [Cycle 5~11] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path for single values (tween vs direct assignment) [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate 14 items [Cycle 22~28] | §14.3 |
| F16 | hitTest() single function integration [Cycle 27 F60] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG complete usage (Math.random 0 occurrences) [Cycle 19~28] | §5.2, §14.3 |

### New Feedback (Based on Cycle 28 Post-mortem) 🆕

| ID | Lesson | Solution | Section |
|----|--------|----------|---------|
| F71 | 4-round review cycle — reverse transition block + assets/ reference + hold beat unimplemented + hitEffect fallback missing found simultaneously (Cycle 28) | Strengthen smoke test gate to 16 items: automate full-flow regression test (BOOT→TITLE→ZONE_SELECT→EXPLORE→COMBAT→BOSS→VICTORY). Target: APPROVED within 2 rounds | §14.3 |
| F72 | BOOT→TITLE transition regression — SYS.TWEEN missing from ACTIVE_SYS[BOOT] during fix (Cycle 28) | **Auto-verify state×system matrix**: smoke test enforces SYS.TWEEN active in all states. Full-flow regression test mandatory after fixes | §6.2, §14.3 |
| F73 | Shared engine extraction not started for 28 cycles — 3,288 lines maintenance limit (Cycle 28) | Maintain 10 REGION structure + explicit dependency direction. Isolate TweenManager/ObjectPool/SoundManager/InputManager in R2 for future extraction | §5.3 |
| F74 | No balance verification mechanism — BPM×enemy density×chip effect combinations unverified (Cycle 28) | For metroidvania: ability×artifact×boss combinations. Pre-design DPS/EHP simulation table + artifact cap (DPS 200%, synergy 150%) + DDA 3-stage fallback | §8.1, §8.2 |
| F75 | Hold/double beat balance unverified — implementation complete but frequency/difficulty curve unverified (Cycle 28) | In this game, specify puzzle difficulty curve per zone. Pre-design table of puzzle complexity (gate count, dimension shift frequency) per zone | §10.2 |

### Previous Cycle Shortcomings Resolution Summary (Cycle 28 Post-mortem)

| Shortcoming | Solution Section | Solution Method | Verification Criteria |
|-------------|-----------------|----------------|----------------------|
| 4-round review cycle | §14.3 | 16-item smoke test gate + full-flow regression | APPROVED within 2 rounds |
| BOOT→TITLE transition regression | §6.2 | ACTIVE_SYS matrix auto-verification | Zero state transition regressions |
| Shared engine not extracted | §5.3 | 10 REGION + dependency direction + line guide | Zero circular references |
| No balance verification | §8.1, §8.2 | DPS/EHP simulation + caps + DDA | Clearable even with extreme builds |
| Hold/double beat balance unverified | §10.2 | Per-zone puzzle difficulty table | Monotonically increasing puzzle complexity |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
Shadow Rift is a **metroidvania roguelite** where you explore interconnected rooms linked by dimensional rifts, unlock abilities, and defeat bosses. You explore 5 zones' interconnected rooms nonlinearly, with each new ability opening previously inaccessible paths. The triple axis of fun: **discovery through exploration**, **combat tension**, **puzzle satisfaction**.

### 1.2 Three Axes of Fun
1. **Ability-Gated Exploration (Explore & Unlock)**: Unlock 5 abilities (Dash→Wall Jump→Dimension Shift→Time Stop→Gravity Flip) to progressively open the map. "Oh, I need Wall Jump to go there!" → The core metroidvania pleasure of returning with new abilities.
2. **Action Combat + Environmental Puzzles**: Melee/ranged attacks + ability combos to defeat enemies. Solve environmental puzzles (switches, moving platforms, dimension gates) in each room using abilities.
3. **Roguelite Build Diversity**: 3-pick artifact selection per room clear for different builds each run. "Dash specialist", "Time Stop specialist", "Gravity manipulation" — multiple strategy paths.

### 1.3 Story/Narrative
- **Background**: Rift Walker "Echo" detects the spread of sudden dimensional rifts ("Shadow Rifts"). Shadow beings pouring from the rifts are corrupting 5 dimensions, and at the center of the rifts, the ancient weaver "Void Weaver" is awakening.
- **Zone Stories**: Each zone contains records from a previous Rift Walker:
  - **Ruin Zone**: First Walker "Ash" — origin of the rift
  - **Crystal Zone**: Second Walker "Lumina" — discovery of dimensional reflection
  - **Abyss Zone**: Third Walker "Prism" — the time rift
  - **Magma Zone**: Fourth Walker "Core" — gravity anomalies
  - **Void Zone**: Fifth Walker "Silhouette" — encounter with Void Weaver
- **Inter-stage Text Dialogue**: Canvas-rendered 3 lines + portrait (15 total + 2 hidden)
- **Ending Branches**:
  - Clear 5 zones → **"Rift Sealed"** Normal Ending: Seal the Shadow Rift and restore peace.
  - Defeat hidden boss "Void Weaver" → **"Dimension Unity"** True Ending: Void Weaver was actually the first Rift Walker trying to merge all dimensions. Echo creates new harmony through dialogue.

---

## §2. Rules & Objectives

### 2.1 Victory Conditions
- **Normal Clear**: Defeat all 5 zone bosses and seal the rift at the central portal
- **True Clear**: After 5 bosses, defeat Void Weaver in the unlocked hidden zone

### 2.2 Defeat Conditions
- HP reaches 0 → current run ends → permanent upgrades retained, artifacts reset
- Run starts with HP 100 + upgrade bonus

### 2.3 Core Rules
1. **Room-based Progression**: Map consists of 17 rooms (15 base + 2 hidden). Each room has enemies/puzzles/bosses
2. **Ability Gating**: Specific abilities required for specific room entry (see §10.2 path map)
3. **Artifact Selection**: 3-pick from 1 after room clear (common/rare/epic weighted)
4. **Permanent Upgrades**: Purchase 3 upgrade trees with "Echo Points" earned per run
5. **Save**: Auto-save on zone boss defeat. No per-room checkpoints (roguelite tension)

---

## §3. Controls

### 3.1 Keyboard
| Key | Function |
|-----|----------|
| ←→ / A,D | Move left/right |
| ↑ / W / Space | Jump (with Wall Jump unlocked: jump while touching wall = wall jump) |
| Shift | Dash (after unlock) |
| Z / J | Melee attack |
| X / K | Ranged attack (1.5s cooldown) |
| C / L | Special ability (Dimension Shift/Time Stop/Gravity Flip — toggle) |
| ESC / P | Pause |
| E | Interact (NPC dialogue, portal entry, switch activation) |

### 3.2 Mouse
| Input | Function |
|-------|----------|
| Left click | Melee attack (in character direction) |
| Right click | Ranged attack |
| Wheel | Cycle special ability (when multiple unlocked) |

### 3.3 Touch (Mobile)
| Input | Function |
|-------|----------|
| Left virtual joystick (radius 60px) | Move + direction |
| Bottom-right A button (56×56px) | Melee attack |
| Bottom-right B button (56×56px) | Jump |
| Bottom-right C button (48×48px) | Dash |
| Bottom-right S button (48×48px) | Special ability |
| Top-right ⏸ button (48×48px) | Pause |
| Double-tap | Ranged attack |
| Swipe up (dy≥30px, ≤200ms) | Jump (when joystick inactive) |

> **Touch targets**: All buttons minimum 48×48px. `Math.max(CFG.MIN_TOUCH, size)` enforced (F11). touch-action:none + passive:false to prevent scrolling.

> **hitTest**: All click/touch detection uses single `hitTest(px, py, rect)` function (F16). Drawing coordinates and hit areas share the same `{x, y, w, h}` object.

---

## §4. Visual Style Guide

### 4.1 Asset Principles
- **Never create assets/ directory** (F1, 13 consecutive cycles success pattern maintained)
- **100% Canvas procedural drawing** — `new Image()` 0 occurrences, `fetch()` file references 0
- **Zero external resources** — Google Fonts, CDN etc. prohibited (F2)
- All visuals generated procedurally via Canvas 2D API (`arc`, `rect`, `lineTo`, `bezierCurveTo`, `createLinearGradient`, `createRadialGradient`, `shadowBlur/shadowColor`)

### 4.2 Color Palette (Per Zone)

| Zone | Primary | Secondary | Background | Enemy Hue |
|------|---------|-----------|------------|-----------|
| Ruin | #8B7355 (brown) | #D4A574 (sand) | #2A1F14 (dark brown) | #6B4226 |
| Crystal | #00E5FF (cyan) | #B388FF (purple) | #0A1628 (dark blue) | #4FC3F7 |
| Abyss | #1A237E (navy) | #7C4DFF (deep purple) | #050510 (pitch black) | #311B92 |
| Magma | #FF6D00 (orange) | #FFAB00 (amber) | #1A0A00 (dark red) | #D84315 |
| Void | #E040FB (magenta) | #00E676 (neon green) | #0D0015 (dark purple) | #AA00FF |
| Hidden | #FFFFFF (white) | #000000 (black) | Zone-inverted | Zone-inverted |

**Character "Echo"**: Cyan (#00E5FF) cloak + white mask + purple (#B388FF) energy glow

### 4.3 Character Visual Detail
- **Echo (Player)**: 8-directional poses (front/back/left/right × idle/moving)
  - Size: 32×48px (in-game) / 400×600px (SVG-grade detail Canvas drawing)
  - Cloak: bezierCurveTo wind-blown effect (sways opposite to movement)
  - Mask: Cyan glow from eye slit (shadowBlur=8)
  - Dash afterimage: 3 translucent afterimages for 0.3s (alpha: 0.6→0.3→0.1)
  - Wall jump: 5 spark particles from wall surface
  - Dimension shift: Full-body silhouette purple↔cyan alternating glow
- **Enemy Design (Zone-differentiated)**:
  - Ruin: Stone golems from rifts (rectangle-based, joint-separated animation)
  - Crystal: Floating crystal sprites (triangular crystal rotation)
  - Abyss: Tentacle shadows (bezierCurveTo wave animation)
  - Magma: Magma slimes (circle + boiling surface pattern)
  - Void: Glitch phantoms (noise effect + flickering)
- **Boss Design** (600×400px+ large-scale):
  - Ruin Boss "Petrification King": Giant golem, 3 core segments (red→yellow→blue)
  - Crystal Boss "Prism Witch": 4 pairs crystal wings, reflection barrier
  - Abyss Boss "Deep Sea Lord": 8 giant tentacles + central eye
  - Magma Boss "Lava Titan": Lava armor + floor eruptions
  - Void Boss "Dimension Shatterer": Space distortion areas + clones
  - Hidden Boss "Void Weaver": 4-phase transformation (absorbs each zone theme)

### 4.4 Drawing Function Signatures (F9)
All drawing functions follow pure function pattern:
```
drawPlayer(ctx, x, y, w, h, dir, pose, abilityState, t)
drawEnemy(ctx, x, y, w, h, type, hp, maxHp, animT)
drawBoss(ctx, x, y, w, h, phase, hp, maxHp, animT, zone)
drawRoom(ctx, cam, roomData, zone, dimState, t)
drawUI(ctx, W, H, player, room, lang)
drawParticle(ctx, x, y, size, color, alpha, t)
drawAbilityFX(ctx, x, y, type, progress, t)
drawPortal(ctx, x, y, size, zone, active, t)
drawSwitch(ctx, x, y, size, activated, t)
drawPlatform(ctx, x, y, w, h, type, state, t)
```
> No direct global variable reference. All data passed via parameters (F9).

### 4.5 Camera System
- **Default**: Player-centered tracking (smooth lerp, factor=0.08)
- **Boss battle**: Zoom out on boss appearance (1.0→0.75, 2s tween) + pan toward boss
- **Ability unlock**: Zoom in (1.0→1.3) + slow motion (0.3s) + zoom out restore
- **Room transition**: Directional slide transition (0.5s tween)
- Implementation: `cam = {x, y, zoom, shakeX, shakeY}` — all drawing applies `cam` offset

### 4.6 Interactive Background Elements
- **Destructible objects**: Wooden crate (HP 2), crystal cluster (HP 4), lava rock (HP 6)
  - Destruction: particle dispersion + random drops (health/echo points)
- **Moving platforms**: Horizontal/vertical oscillation (tween-based, 1~3s period)
- **Switches**: Step to activate → connected door/platform activates
- **Dimension gates**: Activate with Dimension Shift ability → hidden path opens

### 4.7 Weather/Time-of-Day Effects
- **Ruin**: Sandstorm particles (horizontal movement, 20 particles)
- **Crystal**: Sparkling crystal particles (random positions, 15 particles)
- **Abyss**: Floating bubble particles (rising, 12 particles)
- **Magma**: Flame particles + bottom lava waves (sin wave)
- **Void**: Glitch scanlines + noise strips

---

## §5. Core Game Loop (Frame-by-Frame Logic Flow)

### 5.1 Initialization Order (TDZ Prevention — F12)
```
1. CONFIG constants declaration
2. Global variable declaration (G, P, CAM, ROOMS, etc.)
3. SeededRNG initialization
4. Canvas/ctx assignment
5. TweenManager creation
6. ObjectPool creation
7. SoundManager creation (AudioContext: await user gesture)
8. InputManager creation
9. Event listener registration
10. resizeCanvas() call
11. gameLoop start (requestAnimationFrame)
```

### 5.2 Main Loop (60fps)
```
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // frame cap
  lastTime = timestamp;

  // 1. Input processing (InputManager.poll)
  // 2. System updates (per ACTIVE_SYS[state])
  //    - TWEEN: tw.update(dt)
  //    - PHYSICS: updatePhysics(dt, player, room, cam)
  //    - ENEMY: updateEnemies(dt, enemies, player, room)
  //    - ABILITY: updateAbilities(dt, player, abilityState)
  //    - PUZZLE: updatePuzzles(dt, room, switches, platforms)
  //    - COMBAT: updateCombat(dt, player, enemies, projectiles)
  //    - CAMERA: updateCamera(dt, cam, player, room)
  //    - PARTICLE: pool.update(dt)
  //    - DDA: updateDDA(stats)
  //    - SAVE: autoSave check
  // 3. Collision detection
  // 4. State transition check
  // 5. Rendering
  //    - Background (zone-specific + weather effects)
  //    - Room tiles/platforms/switches
  //    - Enemies/bosses
  //    - Player
  //    - Particles
  //    - UI overlay
  // 6. requestAnimationFrame(gameLoop)
}
```

**Core Principles**:
- `setTimeout` 0 occurrences (F4, 18 consecutive cycles). All delays via `tw.add()` + `onComplete`
- `Math.random` 0 occurrences (F18). All randomness via `SeededRNG.next()`
- Guard flag for single tween callback execution (F5): `if (guard.transitioning) return;`
- Single value update path (F14): HP, score etc. core variables through setter functions

### 5.3 Code Region Guide (10 REGION — F66/F73)

| REGION | Name | Est. Line Range | Content | Dependency Direction |
|--------|------|-----------------|---------|---------------------|
| R1 | CONFIG | 1~180 | Constants, colors, zone data, balance values | None (top-level) |
| R2 | ENGINE | 181~550 | TweenManager, ObjectPool, SoundManager, InputManager, SeededRNG, Camera | R1 only |
| R3 | MAP | 551~850 | Room data, interconnection graph, ability gating matrix, BFS validation | R1, R2 |
| R4 | ENTITY | 851~1200 | Player, Enemy, Boss, Projectile, Pickup data/logic | R1, R2 |
| R5 | DRAW | 1201~1700 | All drawing functions (§4.4 signatures) | R1 (pure functions) |
| R6 | ABILITY | 1701~1950 | 5 ability logic + environment interactions | R1, R2, R4 |
| R7 | COMBAT | 1951~2200 | Combat system + collision detection + damage calculation | R1, R2, R4 |
| R8 | ROGUE | 2201~2450 | Artifact system + permanent upgrades + rewards | R1, R2, R4 |
| R9 | STATE | 2451~2750 | State machine + transition logic + save/load | R1~R8 |
| R10 | MAIN | 2751~2900+ | Initialization + events + gameLoop + resize | R1~R9 |

> **Dependency direction**: R(N) may only reference R(1)~R(N-1). Target zero circular references. R5(DRAW) is a pure function set referencing only R1.

---

## §6. State Machine

### 6.1 Game States + Transition Priority (F6)

```
BOOT → TITLE → DIFFICULTY → ZONE_MAP → EXPLORE → COMBAT → PUZZLE →
BOSS_INTRO → BOSS → BOSS_CLEAR → ARTIFACT_SELECT → UPGRADE →
ROOM_TRANSITION → CUTSCENE → VICTORY → GAMEOVER → PAUSE → MODAL
```

**STATE_PRIORITY** (higher = higher priority):
```
GAMEOVER: 100
VICTORY: 90
BOSS_CLEAR: 80
BOSS: 70
COMBAT: 60
BOSS_INTRO: 55
PUZZLE: 50
EXPLORE: 40
ARTIFACT_SELECT: 35
UPGRADE: 30
ROOM_TRANSITION: 25
CUTSCENE: 20
ZONE_MAP: 15
DIFFICULTY: 10
TITLE: 5
BOOT: 1
PAUSE: 200 (overlay)
MODAL: 250 (overlay)
```

**Transition Rule**: Must go through `beginTransition(fromState, toState)`. Direct `enterState()` prohibited.
- Exception: PAUSE allows immediate transition (`beginTransition` with `immediate: true` option)
- GAMEOVER transition overrides all other transitions (F6): `if (P.hp <= 0) return;` pre-check

**RESTART_ALLOWED whitelist**: `[GAMEOVER, VICTORY, PAUSE]` — title return only allowed from these states.

### 6.2 State × System Matrix (F7, F72)

| State | Tween | Physics | Enemy | Ability | Puzzle | Combat | Camera | Particle | DDA | Save | Input |
|-------|-------|---------|-------|---------|--------|--------|--------|----------|-----|------|-------|
| BOOT | ✅ | — | — | — | — | — | — | — | — | — | — |
| TITLE | ✅ | — | — | — | — | — | — | ✅ | — | — | menu |
| DIFFICULTY | ✅ | — | — | — | — | — | — | — | — | — | menu |
| ZONE_MAP | ✅ | — | — | — | — | — | ✅ | ✅ | — | — | map |
| EXPLORE | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | — | game |
| COMBAT | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | game |
| PUZZLE | ✅ | ✅ | — | ✅ | ✅ | — | ✅ | ✅ | — | — | game |
| BOSS_INTRO | ✅ | — | — | — | — | — | ✅ | ✅ | — | — | skip |
| BOSS | ✅ | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | game |
| BOSS_CLEAR | ✅ | — | — | — | — | — | ✅ | ✅ | — | ✅ | skip |
| ARTIFACT_SELECT | ✅ | — | — | — | — | — | — | ✅ | — | — | card |
| UPGRADE | ✅ | — | — | — | — | — | — | — | — | ✅ | menu |
| ROOM_TRANSITION | ✅ | — | — | — | — | — | ✅ | — | — | — | — |
| CUTSCENE | ✅ | — | — | — | — | — | ✅ | ✅ | — | — | skip |
| VICTORY | ✅ | — | — | — | — | — | — | ✅ | — | ✅ | menu |
| GAMEOVER | ✅ | — | — | — | — | — | — | ✅ | — | ✅ | menu |
| PAUSE | ✅ | — | — | — | — | — | — | — | — | — | pause |
| MODAL | ✅ | — | — | — | — | — | — | — | — | — | modal |

> ⚠️ **SYS.TWEEN is active in ALL states** (F72: prevents Cycle 28 BOOT→TITLE regression). Auto-verified in smoke test gate.

> **Input modes** (F26): menu/map/game/card/skip/pause/modal — per-state input modes specified to prevent input malfunction.

### 6.3 Full-Flow Regression Test Path (F71, F72)
```
BOOT → TITLE → DIFFICULTY → ZONE_MAP → EXPLORE → COMBAT → EXPLORE →
PUZZLE → EXPLORE → BOSS_INTRO → BOSS → BOSS_CLEAR → ARTIFACT_SELECT →
ZONE_MAP → ... → VICTORY

Branches:
  COMBAT with HP=0 → GAMEOVER → TITLE (RESTART_ALLOWED)
  Any state → PAUSE → resume
  BOSS_INTRO → skip → BOSS
  CUTSCENE → skip → next state
```

### 6.4 Canvas Modal (F3)
- `confirm()`/`alert()` absolutely prohibited
- Canvas-based modal: semi-transparent overlay(rgba(0,0,0,0.7)) + center box + text + 2 buttons
- Usage: exit confirmation, ability description, artifact details, language change

---

## §7. Combat System

### 7.1 Basic Combat
- **Melee attack**: Forward fan (60°) range, damage = baseDMG × abilityMul × artifactMul
  - Attack motion: 0.25s, 3-frame animation
  - Cooldown: 0.4s
- **Ranged attack**: Straight projectile, range 300px, damage = baseDMG × 0.6
  - Projectile speed: 400px/s
  - Cooldown: 1.5s
- **Ability combos**:
  - Dash + Melee = "Dash Slash" (1.5× damage + knockback)
  - Time Stop + Ranged = "Arrow of Time" (piercing + 2× damage)
  - Gravity Flip + Melee = "Gravity Hammer" (AoE damage + 1s stun)

### 7.2 Enemy AI Patterns
| Enemy Type | HP | Damage | Movement Pattern | Attack Pattern |
|-----------|-----|--------|-----------------|----------------|
| Patrol | 30 | 10 | Left-right patrol | Contact damage |
| Chaser | 50 | 15 | Player tracking | Rush (3s cooldown) |
| Shooter | 40 | 12 | Stationary | Projectile fire (2s cooldown) |
| Defender | 80 | 8 | Slow approach | Front shield (attack reflect) |
| Summoner | 60 | 5 | Flee | Summon (10s cooldown, 2 Patrols) |

### 7.3 Damage Formula
```
finalDMG = baseDMG × abilityMultiplier × artifactMultiplier × comboDMG × ddaFactor
Defense = max(0, finalDMG - enemyDEF × 0.3)
Critical = baseCritRate(10%) + artifactBonus, crit multiplier 1.5×
```

### 7.4 Collision Detection
- AABB (Axis-Aligned Bounding Box) based
- `hitTest(ax, ay, aw, ah, bx, by, bw, bh)` single function (F16)
- Melee attack: fan detection → angle check + distance check
- Projectile: AABB updated every frame

### 7.5 Boss Battle Details

**Phase Transition Diagrams:**

#### Ruin Boss "Petrification King" (HP: 500/700/900 by difficulty)
```
Phase 1 (HP 100%~60%)     Phase 2 (HP 60%~30%)     Phase 3 (HP 30%~0%)
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Charge (3s CD)   │      │ Charge + Debris(2.5s)│   │ Quake+Charge+Debris│
│ Slam (4s CD)     │  ──→ │ Earthquake (5s CD)│  ──→ │ Core Exposed (10s)│
│ Boulder Throw    │      │ Triple Boulder    │      │ Enrage Mode      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
Weakness: Core (back), requires Dash to flank
```

#### Crystal Boss "Prism Witch" (HP: 450/650/850)
```
Phase 1 (100%~50%)        Phase 2 (50%~0%)
┌─────────────────┐      ┌─────────────────┐
│ Crystal Barrier   │      │ 3 Clones (10s)    │
│ Laser Beam (L/R) │  ──→ │ Omni-Laser        │
│ Crystal Rain(3sCD)│      │ Barrier + Rain    │
└─────────────────┘      └─────────────────┘
Weakness: Core when barrier down, reflect ranged to trigger self-damage
```

#### Abyss Boss "Deep Sea Lord" (HP: 600/800/1000)
```
Phase 1 (100%~70%)        Phase 2 (70%~35%)        Phase 3 (35%~0%)
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Tentacle Sweep   │      │ Ink Pool(vision↓) │      │ 8-Tentacle Assault│
│ Tentacle Slam    │  ──→ │ Pull (attraction) │  ──→ │ Time Stop weakness│
│ Float Movement   │      │ Circular Sweep    │      │ Final Pull(DPS chk)│
└─────────────────┘      └─────────────────┘      └─────────────────┘
Weakness: Central eye (between tentacles), exposed during Time Stop
```

#### Magma Boss "Lava Titan" (HP: 700/900/1100)
```
Phase 1 (100%~50%)        Phase 2 (50%~0%)
┌─────────────────┐      ┌─────────────────┐
│ Lava Punch (AoE)  │      │ Eruption (full map)│
│ Floor Eruption(3) │  ──→ │ Charge+Lava Trail │
│ Body Slam        │      │ Gravity Flip weak↑│
└─────────────────┘      └─────────────────┘
Weakness: Cooling core on back (exposed when ceiling accessed via Gravity Flip)
```

#### Void Boss "Dimension Shatterer" (HP: 800/1000/1200)
```
Phase 1 (100%~60%)        Phase 2 (60%~30%)        Phase 3 (30%~0%)
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Rift Summon      │      │ 5 Clones          │      │ Dimension Collapse│
│ Warp Attack      │  ──→ │ Dimension Invert  │  ──→ │ All abilities req │
│ Void Laser       │      │ Gravity Zones     │      │ DPS+Puzzle hybrid │
└─────────────────┘      └─────────────────┘      └─────────────────┘
Weakness: 0.5s stagger after warp, Dimension Shift to distinguish clones
```

#### Hidden Boss "Void Weaver" (HP: 1200/1500/1800)
```
Phase 1 (100%~75%)  Phase 2 (75%~50%)  Phase 3 (50%~25%)  Phase 4 (25%~0%)
┌───────────┐      ┌───────────┐      ┌───────────┐      ┌───────────┐
│ Ruin Pattern│  ──→ │Crystal Pattern│──→ │Abyss+Magma │  ──→ │ All Zones + │
│(Charge+Debris)│   │(Reflect+Laser)│   │(Tent.+Erupt)│     │ Unique Moves│
└───────────┘      └───────────┘      └───────────┘      └───────────┘
Weakness: Each phase requires corresponding zone's weakness strategy → Phase 4 uses all 5 abilities
```

> **bossRewardGiven flag** (F17): Boss clear reward given only once. `if (boss.rewardGiven) return;` guard.

---

## §8. Difficulty System

### 8.1 3-Segment Balance Table

#### Difficulty: Explorer (Easy)
| Segment | Zone | Enemy HP Mul | Enemy DMG Mul | Enemies/Room | Player HP | Boss HP Mul |
|---------|------|-------------|--------------|-------------|-----------|------------|
| Early | Ruin | 0.8× | 0.7× | 3~4 | 120 | 0.7× |
| Mid | Crystal/Abyss | 0.9× | 0.8× | 4~5 | 120 | 0.8× |
| Late | Magma/Void | 1.0× | 0.9× | 5~6 | 120 | 0.9× |

#### Difficulty: Warrior (Medium)
| Segment | Zone | Enemy HP Mul | Enemy DMG Mul | Enemies/Room | Player HP | Boss HP Mul |
|---------|------|-------------|--------------|-------------|-----------|------------|
| Early | Ruin | 1.0× | 1.0× | 4~5 | 100 | 1.0× |
| Mid | Crystal/Abyss | 1.1× | 1.1× | 5~6 | 100 | 1.0× |
| Late | Magma/Void | 1.2× | 1.2× | 6~7 | 100 | 1.0× |

#### Difficulty: Legend (Hard)
| Segment | Zone | Enemy HP Mul | Enemy DMG Mul | Enemies/Room | Player HP | Boss HP Mul |
|---------|------|-------------|--------------|-------------|-----------|------------|
| Early | Ruin | 1.2× | 1.3× | 5~6 | 80 | 1.3× |
| Mid | Crystal/Abyss | 1.4× | 1.4× | 6~8 | 80 | 1.3× |
| Late | Magma/Void | 1.6× | 1.5× | 7~9 | 80 | 1.3× |

### 8.2 DPS/EHP Balance Formula (F74)

```
Player DPS = baseDMG × atkSpeed × hitRate × comboMul × artifactMul
  - hitRate assumption: Explorer 80%, Warrior 65%, Legend 50%
  - comboMul assumption: average 1.2 (20% ability combo hit rate)
  - artifactMul cap: max 2.0× (DPS 200% ceiling — F74)

Enemy EHP = HP × (1 + DEF×0.003)
  - Room clear target time: 20~40s (early), 30~60s (late)

Boss EHP = HP × (1 + DEF×0.005) × phaseCount
  - Boss clear target time: 60~120s (zone boss), 180~300s (hidden boss)

DDA Fallback (3 stages):
  1. 3 consecutive deaths → enemy HP/DMG -10%
  2. 5 consecutive deaths → enemy HP/DMG -20% + health potion drop rate 2×
  3. 7 consecutive deaths → enemy HP/DMG -30% + "Shadow Shield" granted (1-hit immunity)
  Reset DDA on clear
```

> **Assumptions stated**: hitRate/comboMul differentiated by difficulty. DDA 3-stage auto-corrects if assumptions are wrong (F24 Cycle 24 lesson).

### 8.3 Artifact Cap (F74)
- **DPS cap**: Max 200% increase (cannot exceed 3× baseDMG)
- **Synergy cap**: Max 150% increase (diminishing returns at 3+ same-type artifacts)
- **Over-cap artifact exclusion**: `applyArtifact()` validates cap, excludes from selection if exceeded (F27 Cycle 27)

---

## §9. Score System

### 9.1 Score Calculation
| Action | Base Score | Multiplier |
|--------|-----------|------------|
| Normal enemy kill | 100 | × combo multiplier |
| Elite enemy kill | 300 | × combo multiplier |
| Boss kill | 2000 | × remaining HP% |
| Room puzzle solved | 500 | × time bonus (faster = higher) |
| Ability unlock | 1000 | Fixed |
| No-damage room clear | ×1.5 | Applied to room score |
| Hidden room discovered | 3000 | Fixed |

### 9.2 Combo System
- Next kill within 5s of previous → combo maintained
- Combo multiplier: 1→5 = 1.0×, 6→10 = 1.2×, 11→20 = 1.5×, 21+ = 2.0×
- Combo display: top-right screen, number + multiplier + tween scale animation

### 9.3 Echo Points (Permanent Currency)
- 10% of score → Echo Points at run end
- Boss defeat bonus: Zone boss +200, Hidden boss +1000
- Used for permanent upgrade purchases (§12)

---

## §10. Map System

### 10.1 Room Connection Graph
```
                    ┌─[Hidden1]─┐
                    │            │
        ┌──[Ruin3]──┤   [Crystal1]──[Crystal2]──[Crystal3]──[CrystalBOSS]
        │           │     │
[Ruin1]──[Ruin2]──[RuinBOSS]──[Central Hub]──[Abyss1]──[Abyss2]──[Abyss3]──[AbyssBOSS]
                              │     │
        ┌──[Magma3]──[MagmaBOSS] │   [Void1]──[Void2]──[Void3]──[VoidBOSS]
        │                     │         │
      [Magma2]──[Magma1]──────┘       [Hidden2]
```

### 10.2 Ability-Gating Path Map (F25 Cycle 25 — Ability Dependency Order)

| Room | Required Ability | Unlock Content |
|------|-----------------|----------------|
| Ruin1 | None | Starting point |
| Ruin2 | None | Basic combat tutorial |
| Ruin3 | None | Environmental puzzle tutorial |
| RuinBOSS | None | **Dash ability unlock** |
| Crystal1 | **Dash** | Dash through rifts |
| Crystal2 | Dash | Crystal reflection puzzle |
| Crystal3 | Dash | Dash + platforms |
| CrystalBOSS | Dash | **Wall Jump ability unlock** |
| Abyss1 | **Wall Jump** | Vertical passage navigation |
| Abyss2 | Wall Jump | Underwater puzzle (limited vision) |
| Abyss3 | Wall Jump | Wall jump + enemy combat |
| AbyssBOSS | Wall Jump | **Dimension Shift ability unlock** |
| Magma1 | **Dimension Shift** | Dimension gate puzzle |
| Magma2 | Dimension Shift | Cross-dimension lava traversal |
| Magma3 | Dimension Shift | Complex dimension puzzle |
| MagmaBOSS | Dimension Shift | **Gravity Flip ability unlock** (Legend: **Time Stop also unlocked**) |
| Void1 | **Gravity Flip** | Ceiling/floor toggle |
| Void2 | Gravity Flip | Gravity puzzle |
| Void3 | Gravity Flip + Dimension Shift | Multi-ability puzzle |
| VoidBOSS | Gravity Flip | **Time Stop ability unlock** (Legend: already unlocked) |
| Hidden1 | Dash + Wall Jump + Dimension Shift | Crystal↔Ruin shortcut (hard puzzle) |
| Hidden2 | All 5 abilities | Void Weaver boss room |

> **Reachability validation (F23 Cycle 23)**: BFS updates "rooms reachable with currently unlocked abilities" on map generation. Auto-recalculates after ability unlock. Hidden rooms shown on map only after ability combination verified.

### 10.3 Procedural Room Variation (SeededRNG — F18)
- **Fixed elements**: Room size, entry/exit positions, ability gate positions, boss spawn positions
- **Variable elements**: Enemy placement (position/type weights), destructible object positions, item drops, environment particle seeds
- Per-run seed: `Date.now()` based → replay with same seed reproduces identical map

---

## §11. Ability System

### 11.1 Five Abilities Detail

| Ability | Unlock Order | Key | Effect | Cooldown | Energy Cost |
|---------|-------------|-----|--------|----------|-------------|
| Dash | 1 (Ruin Boss) | Shift | 150px instant teleport + 0.2s invincible | 1.5s | 10 |
| Wall Jump | 2 (Crystal Boss) | Wall+Jump | Wall cling + opposite direction leap | 0s (auto) | 0 |
| Dimension Shift | 3 (Abyss Boss) | C | Reality↔Shadow dimension toggle (hidden paths/enemies visible) | 3s | 20 |
| Time Stop | 4 (Void/Magma Boss) | C (toggle) | 3s enemy/projectile freeze + weakness exposure | 8s | 30 |
| Gravity Flip | 5 (Magma/Void Boss) | C (toggle) | Reverse gravity direction (ceiling walking) | 5s | 25 |

> **Energy**: Max 100, auto-regen 5/s, enemy kill +10, puzzle solve +20
> **Judge first, save after** (F8): On ability unlock, judge unlock first → display UI → then save

### 11.2 Dimension Shift Detail (Puzzle Core)
- **Reality dimension**: Normal enemies/objects visible, shadow paths/switches transparent
- **Shadow dimension**: Shadow enemies visible, hidden paths materialize, reality objects translucent
- Visual effect: Full-screen purple→cyan color inversion on dimension shift (0.3s tween)
- **Dual-dimension reachability validation (F23)**: BFS confirms exit reachable in both reality/shadow

---

## §12. Permanent Upgrade Trees

### 12.1 Shadow Tree (Combat-focused)
| Level | Name | Cost | Effect |
|-------|------|------|--------|
| 1 | Shadow Blade | 100 | Melee damage +10% |
| 2 | Shadow Armor | 200 | Damage taken -10% |
| 3 | Critical Shadow | 400 | Critical chance +5% |
| 4 | Shadow Flurry | 700 | Attack speed +15% |
| 5 | Shadow Burst | 1200 | Enemy kill triggers explosion (50 dmg, 80px radius) |

### 12.2 Rift Tree (Ability-focused)
| Level | Name | Cost | Effect |
|-------|------|------|--------|
| 1 | Rift Absorb | 100 | Max energy +20 |
| 2 | Quick Charge | 200 | Energy regen +30% |
| 3 | Extended Dash | 400 | Dash distance +30% |
| 4 | Time Extend | 700 | Time Stop duration +1s |
| 5 | Dimension Master | 1200 | Dimension Shift cooldown -50% |

### 12.3 Echo Tree (Exploration-focused)
| Level | Name | Cost | Effect |
|-------|------|------|--------|
| 1 | Echo Sense | 100 | Treasure shown on map |
| 2 | Vitality | 200 | Max HP +20 |
| 3 | Float | 400 | Jump height +20% |
| 4 | Echo Bonus | 700 | Echo Points gained +25% |
| 5 | Undying | 1200 | 1 revival per run (HP 30%) |

---

## §13. Artifact System (Roguelite)

### 13.1 Artifact List (13 Types)

#### Common (6) — Appearance weight 60%
| ID | Name | Effect |
|----|------|--------|
| A1 | Rift Shard | Melee damage +15% |
| A2 | Shadow Thread | Movement speed +10% |
| A3 | Echo Crystal | Energy regen +20% |
| A4 | Dimension Fragment | Dash cooldown -20% |
| A5 | Time Shard | Time Stop duration +0.5s |
| A6 | Gravity Core | Jump height +15% |

#### Rare (4) — Appearance weight 30%
| ID | Name | Effect |
|----|------|--------|
| A7 | Rift Blade | Melee range +30% + damage +10% |
| A8 | Dimension Shield | 10% chance of 0.5s invincibility on hit |
| A9 | Echo Amplifier | Ability damage +25% |
| A10 | Shadow Clone | 50% chance of clone simultaneous attack (50% damage) |

#### Epic (3) — Appearance weight 10%
| ID | Name | Effect |
|----|------|--------|
| A11 | Void Heart | HP 5% recovery on enemy kill |
| A12 | Time Rift | 2× movement speed + attacks enabled during Time Stop |
| A13 | Dimension Storm | 100 damage to nearby enemies on Dimension Shift (120px radius) |

### 13.2 Selection UI
- 3 cards centered on screen after room clear
- Cards: 200×280px, tier-colored borders (Common: gray, Rare: blue, Epic: purple)
- Flip animation (0.5s tween)
- Selection: glow + scale up → absorption animation into inventory

---

## §14. Code Hygiene & Smoke Tests

### 14.1 Numerical Consistency Table (F10)
> Spec values = CONFIG constants 1:1 correspondence. Cross-reference this table during review.

| Spec Item | CONFIG Constant | Value |
|-----------|----------------|-------|
| Player base HP | CFG.PLAYER_HP | 100 |
| Melee base damage | CFG.MELEE_DMG | 25 |
| Ranged base damage | CFG.RANGE_DMG | 15 |
| Critical rate | CFG.CRIT_RATE | 0.10 |
| Critical multiplier | CFG.CRIT_MUL | 1.5 |
| Dash distance | CFG.DASH_DIST | 150 |
| Dash cooldown | CFG.DASH_CD | 1.5 |
| Time Stop duration | CFG.TIMESTOP_DUR | 3.0 |
| Max energy | CFG.MAX_ENERGY | 100 |
| Energy regen/s | CFG.ENERGY_REGEN | 5 |
| DDA reduction stage 1 | CFG.DDA_1 | 0.10 |
| DDA reduction stage 2 | CFG.DDA_2 | 0.20 |
| DDA reduction stage 3 | CFG.DDA_3 | 0.30 |
| Touch min size | CFG.MIN_TOUCH | 48 |
| Combo hold time | CFG.COMBO_TIME | 5.0 |
| Artifact DPS cap | CFG.ART_DPS_CAP | 2.0 |
| Artifact synergy cap | CFG.ART_SYN_CAP | 1.5 |

### 14.2 Code Hygiene Checklist

- [ ] `setTimeout` / `setInterval` 0 occurrences
- [ ] `Math.random` 0 occurrences (SeededRNG complete)
- [ ] `new Image()` / `fetch()` file references 0
- [ ] `confirm()` / `alert()` 0 occurrences
- [ ] `assets/` directory does not exist
- [ ] All drawing functions: `(ctx, x, y, ...)` signature (0 global references)
- [ ] Zero state transitions not via `beginTransition()` (except PAUSE immediate)
- [ ] ACTIVE_SYS matrix has SYS.TWEEN = true for ALL states
- [ ] bossRewardGiven guard flag exists
- [ ] hitTest() single function for all collision detection
- [ ] Zero unused variables/functions (no ghost code)
- [ ] `applyArtifact()` includes DPS cap/synergy cap validation
- [ ] Spec values = CONFIG constants (full cross-reference of §14.1 table)
- [ ] All button sizes ≥ 48×48px (`Math.max(CFG.MIN_TOUCH, size)`)

### 14.3 Smoke Test Gate (16 items — F71)

#### FAIL (must pass, REJECTED if failed) — 10 items
| # | Item | Verification |
|---|------|-------------|
| 1 | index.html exists + browser load succeeds | File exists + console errors 0 |
| 2 | assets/ directory does not exist | `ls assets/` fails |
| 3 | `new Image()` / `fetch()` file references 0 | grep verification |
| 4 | `setTimeout` / `setInterval` 0 | grep verification |
| 5 | `Math.random` 0 | grep verification |
| 6 | `confirm()` / `alert()` 0 | grep verification |
| 7 | BOOT→TITLE→DIFFICULTY→ZONE_MAP transition succeeds | Manual flow test |
| 8 | EXPLORE→COMBAT→EXPLORE transition succeeds | Manual flow test |
| 9 | BOSS_INTRO→BOSS→BOSS_CLEAR transition succeeds | Manual flow test |
| 10 | GAMEOVER→TITLE transition succeeds (RESTART_ALLOWED) | Manual flow test |

#### WARN (recommended, MINOR if failed) — 6 items
| # | Item | Verification |
|---|------|-------------|
| 11 | Mobile touch full flow works | Touch event test |
| 12 | KO/EN language toggle works | UI text change confirmation |
| 13 | Sound playback (BGM + min 1 SFX) | Web Audio API init confirmation |
| 14 | All buttons ≥ 48×48px | UI element size check |
| 15 | ACTIVE_SYS matrix all states SYS.TWEEN=true | Code verification |
| 16 | No circular references in REGION dependency direction | Code structure check |

---

## §15. Sound System

### 15.1 Web Audio API Procedural Sound

| # | Sound | Type | Generation Method |
|---|-------|------|-------------------|
| 1 | Zone BGM (5 types) | Background | OscillatorNode(sine/square/sawtooth) + GainNode loop |
| 2 | Melee attack | SFX | High-freq burst (800Hz→200Hz, 0.1s) |
| 3 | Ranged attack | SFX | Mid-freq waveform (400Hz, 0.15s) + echo |
| 4 | Dash | SFX | Wind noise (noise + bandpass filter, 0.2s) |
| 5 | Wall Jump | SFX | Short tap (1200Hz, 0.05s) |
| 6 | Dimension Shift | SFX | Reverse reverb (low→high, 0.4s) |
| 7 | Time Stop | SFX | Deep drone (80Hz, 0.5s) + fade |
| 8 | Gravity Flip | SFX | Rising/falling glissando (200→800Hz→200Hz, 0.3s) |
| 9 | Enemy Hit | SFX | Short noise burst (0.08s) |
| 10 | Boss Entrance | SFX | Low-freq drum roll (50Hz, 1.5s crescendo) |
| 11 | Boss Defeat | SFX | Chord dispersion (C-E-G, 0.8s) + reverb |
| 12 | Artifact Acquired | SFX | Sparkle arpeggio (C5→E5→G5→C6, 0.6s) |
| 13 | Ability Unlock | SFX | Fanfare (3-note ascend, 1.0s) |

> **BGM**: `SoundManager.startBGM(zone)` on zone entry, `stopBGM()` on exit. audioCtx.currentTime-based loop — setTimeout 0 occurrences.
> **SFX**: `SoundManager.playSFX(type)` — all scheduling via Web Audio native.

---

## §16. Bilingual Support

### 16.1 Structure
```javascript
const LANG = {
  ko: { title: '섀도우 리프트', start: '게임 시작', ... },
  en: { title: 'Shadow Rift', start: 'Start Game', ... }
};
let currentLang = 'ko';
function t(key) { return LANG[currentLang][key] || LANG.ko[key]; }
```

### 16.2 Language Toggle
- 🌐 button at top-right of title screen (48×48px)
- Changeable in PAUSE menu during gameplay
- Applied to all UI text, story dialogue, artifact descriptions, ability descriptions

---

## §17. Save/Load System

### 17.1 localStorage Data Schema
```javascript
{
  version: 1,
  lang: 'ko',
  bestScore: 0,
  totalRuns: 0,
  echoPoints: 0,
  upgrades: { shadow: 0, rift: 0, echo: 0 },
  unlockedAbilities: [],
  bossesDefeated: [],
  hiddenFound: [],
  difficulty: 'medium',
  seed: null,           // current run seed (null = new run)
  currentRoom: null,    // checkpoint (on boss clear)
  artifacts: [],        // current run artifacts
  settings: { sfxVol: 0.7, bgmVol: 0.5 }
}
```

### 17.2 Save Timing
- **Auto-save**: On zone boss defeat + permanent upgrade purchase + settings change
- **Judge first, save after** (F8): `if (score > bestScore)` judge then `save()`

---

## §18. Game Page Metadata

### Sidebar Information
```yaml
game:
  title: "Shadow Rift"
  description: "A metroidvania roguelite where you explore dimensional rifts, unlock abilities, and defeat bosses. 5 zones, 6 bosses, 13 artifacts, 3 permanent upgrade trees."
  genre: ["action", "puzzle"]
  playCount: 0
  rating: 0
  controls:
    - "←→/AD: Move"
    - "↑/W/Space: Jump"
    - "Shift: Dash"
    - "Z/J: Melee Attack"
    - "X/K: Ranged Attack"
    - "C/L: Special Ability"
    - "E: Interact"
    - "ESC: Pause"
    - "Touch: Virtual Joystick + Buttons"
  tags:
    - "#metroidvania"
    - "#roguelite"
    - "#dimension-exploration"
    - "#boss-battle"
    - "#puzzle"
    - "#action"
  addedAt: "2026-03-23"
  version: "1.0.0"
  featured: true
```

### Home Page GameCard
- **thumbnail**: Cinematic scene of Echo standing before a dimensional rift (Canvas procedural, 4:3 ratio)
- **title**: "Shadow Rift" (1-line truncation)
- **description**: "A metroidvania roguelite where you explore dimensional rifts, unlock abilities, and defeat bosses" (2-line truncation)
- **genre**: `action` `puzzle` (2 badges)
- **playCount**: 0 (initial)
- **addedAt**: 2026-03-23 (within 7 days → "NEW" badge shown)
- **featured**: true (⭐ badge shown)

### Thumbnail SVG (20KB+)
Cinematic composition: Echo centered (cyan cloak + purple glow), background with 5 zone silhouettes converging into dimensional rift portal. Generated via Canvas `toDataURL()` or procedural SVG string.

---

## §19. Previous Cycle Shortcomings Resolution Final Check

| Cycle 28 Shortcoming | Resolution Location | Verification |
|----------------------|--------------------|--------------|
| 4-round review cycle | §14.3 (16-item smoke test) | Achieve APPROVED within 2 rounds |
| BOOT→TITLE transition regression | §6.2 (ACTIVE_SYS all states TWEEN=true) | Auto-verified at §14.3 #15 |
| Shared engine not extracted | §5.3 (10 REGION + dependency direction) | Zero circular refs, per-REGION line guide |
| No balance verification | §8.1~8.3 (DPS/EHP + caps + DDA) | Extreme build DPS cap 200% cannot exceed |
| Hold/double beat balance unverified | §10.2 (per-zone puzzle difficulty table) | Monotonically increasing puzzle complexity |
