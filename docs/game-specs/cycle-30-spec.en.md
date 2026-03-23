---
game-id: celestial-drift
title: Celestial Drift
genre: action, casual
difficulty: medium
---

# Celestial Drift — Cycle #30 Game Design Document

> **One-Page Summary**: Starting from a shipwrecked vessel in space, drift through 5 sectors (Asteroid Belt/Nebula/Black Hole/Frozen/Void), collecting resources, upgrading your ship, and defeating sector bosses in this **space survival action roguelite**. 5 zones × 3 areas = 15 base sectors + 1 hidden zone = **16 total stages**. 5 zone bosses + hidden boss "Void Sentinel" = **6 bosses**. Ship upgrade 3-tree system (Attack/Defense/Exploration), 14 artifacts (6 common/5 rare/3 epic) for build diversity, SeededRNG procedural sector variation, 3-tier difficulty (Explorer/Fighter/Legend) + 3-level DDA dynamic balancing, bilingual (KR/EN). **Strengthens action+casual combo from 1→2 games** and introduces the platform's first space/sci-fi theme.

> **MVP Boundary**: Phase 1 (Core loop: Explore→Combat→Resource collection→Upgrade→Boss, Zones 1~2 + 2 bosses + 3 weapons + 7 artifacts + basic upgrade tree) → Phase 2 (Zones 3~5 + 3 bosses + hidden boss + full narrative + 7 additional artifacts). **Phase 1 must deliver a complete game experience on its own.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (See platform-wisdom) ✅
> Items below have been verified over 20+ cycles and are detailed in platform-wisdom.md. Only **applicable sections** are listed here.

| ID | Lesson Summary | Section |
|----|----------------|---------|
| F1 | Never create assets/ directory — 13 consecutive cycles success [Cycle 1~29] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] — targeting 19 consecutive cycles | §5.2 |
| F5 | Guard flag ensures tween callback fires once [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system [Cycle 3 B2] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numeric consistency table (spec=code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target minimum 48×48px + Math.max enforce [Cycle 12~22] | §3.3 |
| F12 | TDZ prevention: variable declaration → DOM assignment → event registration order [Cycle 5~11] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path for values (tween vs direct assignment) [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22~29] | §14.3 |
| F16 | hitTest() single function unification [Cycle 27 F60] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG full adoption (Math.random 0 count) [Cycle 19~29] | §5.2, §14.3 |
| F19 | `gt` parameter naming (draw function signatures) [Cycle 29 P0] | §4.4 |

### New Feedback (Based on Cycle 29 Post-Mortem) 🆕

| ID | Lesson | Solution | Section |
|----|--------|----------|---------|
| F76 | No dedicated mobile ranged attack button — double-tap not intuitive (Cycle 29 P3) | **Confirm mobile button set in Phase 1**: virtual joystick (movement) + attack button + skill button + shield button = 4-button layout. Each button minimum 56×56px, fixed at screen bottom | §3.3 |
| F77 | Required 2nd review — assets/ reference code (ASSET_MAP/preloadAssets/SPRITES) "inertial inclusion" (Cycle 29) | 3-stage auto grep verification before/during/after coding + CI build hook fails if assets/ exists. **Exclude ASSET_MAP/preloadAssets/SPRITES from initial code template** | §14.2, §14.3 |
| F78 | No balance verification — 5 zones × 6 bosses × 13 artifacts combination untested (Cycle 29) | **Pre-design DPS/EHP matrix per sector** + artifact cap (DPS 200%, synergy 150%) + DDA 3-level fallback. Pre-verify extreme builds via formulas | §8.1, §8.2 |
| F79 | Shared engine not extracted for 29 cycles (Cycle 29) | Maintain 10 REGION code structure + unidirectional dependency. Isolate TweenManager/ObjectPool/SoundManager/InputManager in R2 for future shared/engine.js extraction | §5.3 |
| F80 | Ability switch UI not designed, risking key binding conflicts (Cycle 29) | Weapon switch: 1/2/3 keys (keyboard) + left weapon slot tap (touch). Skill use: Space (keyboard) + dedicated button (touch). Full definition per input method in §3 | §3.1, §3.2, §3.3 |

### Previous Cycle Pain Points Resolution Summary (Cycle 29 Post-Mortem)

| Pain Point | Resolution Section | Solution | Verification Criteria |
|-----------|-------------------|----------|----------------------|
| No mobile ranged attack button | §3.3 | Virtual joystick + attack/skill/shield 4-button set, each 56×56px | Touch-only playthrough completable |
| Required 2nd review (assets/ refs) | §14.2, §14.3 | Exclude ASSET_MAP from initial template + 3-stage grep | Target 1st round APPROVED |
| No balance verification | §8.1, §8.2 | DPS/EHP matrix per sector + artifact cap + DDA | Extreme build clearable verified |
| Shared engine not extracted | §5.3 | 10 REGION + dependency direction + line number guide | Zero circular references |
| Variable shadowing P0 (`t`→`gt`) | §4.4 | Standardize draw function signatures to `gt` + grep verification | Zero parameter shadowing |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
Celestial Drift is a **space survival action roguelite** where you start from a shipwrecked vessel, drift through dangerous space collecting resources, upgrading your ship, and defeating sector bosses. Explore 5 distinct zones — Asteroid Belt, Nebula, Black Hole, Frozen, and Void — each with unique environments that directly modify gameplay. Controls use a 1-stick (movement) + 3-button (attack/skill/shield) **casual-friendly design** that's easy to learn but difficult to master.

### 1.2 Core Fun Triangle
1. **Explore & Discover**: Explore procedurally generated sectors finding resources, artifacts, and hidden paths. "What's in the next sector?" exploration drive.
2. **Fight & Survive**: Laser/Missile/Plasma 3-weapon switching + dash evasion + energy shield = fast judgment and reflex combat. The thrill of survival with scarce resources.
3. **Build & Grow**: Choose from 3 artifacts per sector clear, permanent upgrade 3-tree (Attack/Defense/Exploration), different strategy paths each run. "Should I go shield-focused or all-in on firepower?"

### 1.3 Story/Narrative
- **Background**: The pilot of exploration vessel "Astra" is swept into an unknown region by an interstellar storm. This place is a testing ground left by the ancient space civilization "Stellar Architects" — each of the 5 sectors is a trial. Pass all trials to inherit the Architects' legacy: dimensional navigation technology.
- **Per-Sector Story**: Each sector contains flight logs from previous challengers.
  - **Asteroid Belt**: First challenger "Nova" — Discovery of the testing ground
  - **Nebula**: Second challenger "Stella" — Surviving electromagnetic interference
  - **Black Hole**: Third challenger "Graviton" — Distortion of spacetime
  - **Frozen**: Fourth challenger "Cryo" — Trial of absolute zero
  - **Void**: Fifth challenger "Eclipse" — Encounter with the Stellar Architects
- **Inter-stage text dialogue**: Canvas-rendered 3 lines + ship portrait (15 total + 2 hidden)
- **Ending branches**:
  - Clear all 5 zones → **"Escape Success"** Normal Ending: Return home with dimensional navigation tech.
  - Defeat hidden boss "Void Sentinel" → **"Architect's Succession"** True Ending: Void Sentinel was the final trial's judge; the pilot becomes the new Stellar Architect.

---

## §2. Game Rules & Objectives

### 2.1 Victory Conditions
- **Normal Clear**: Defeat all 5 zone bosses and enter the final escape portal
- **True Clear**: Defeat Void Sentinel in the hidden zone unlocked after defeating all 5 bosses

### 2.2 Defeat Conditions
- HP reaches 0 → current run ends → permanent upgrades retained, artifacts/resources reset
- Run starts with HP 100 + upgrade bonus

### 2.3 Core Rules
1. **Sector-based progression**: Map consists of 16 sectors (15 base + 1 hidden). Each sector has enemy waves/environmental hazards/bosses
2. **Resource system**: Energy (ammo), Crystal (upgrade material), Data (story unlock) — 3 resource types
3. **Weapon switching**: Laser (rapid/low DMG), Missile (single/high DMG), Plasma (penetrating/mid DMG) — 3 types + energy cost
4. **Energy Shield**: Absorbs 3 hits → 8s cooldown → recharge. Upgradeable charges/cooldown
5. **Dash**: Direction + Shift for short invincible dash (2s cooldown)
6. **Artifacts**: Choose 1 of 3 per sector clear, max 5 equipped per run
7. **Permanent Upgrades**: 3-tree (Attack/Defense/Exploration) upgrades with crystals, persists across runs

### 2.4 Game Flow
```
BOOT → TITLE → HANGAR(upgrade) → SECTOR_SELECT → EXPLORE → COMBAT → BOSS
                    ↑                                              ↓
                    ← ← ← ← GAME_OVER(run end) ← ← ← ← ← HP=0 ←
                    ↑                                              ↓
                    ← ← ← ← SECTOR_CLEAR(artifact select) → next sector
                                                                   ↓
                                                           VICTORY(ending)
```

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Ship movement (8-directional) |
| Mouse Left Click / Z | Fire current weapon |
| 1 / 2 / 3 | Weapon switch (Laser/Missile/Plasma) |
| Space | Activate skill (equipped artifact active skill) |
| Shift / X | Dash (invincible dash in movement direction) |
| E | Toggle energy shield |
| Tab | Toggle minimap zoom |
| Esc / P | Pause |
| M | Toggle BGM mute |

### 3.2 Mouse
| Input | Action |
|-------|--------|
| Click | Fire weapon (toward mouse direction) |
| Right Click | Dash (toward mouse direction) |
| Scroll Up/Down | Weapon switch |
| Click (UI element) | UI button interaction |

### 3.3 Touch (Mobile) — ⚠️ Resolves Cycle 29 P3
| Input | Action |
|-------|--------|
| **Left virtual joystick** | Ship movement (analog 8-dir) — 60px radius from thumb |
| **Bottom-right attack button** (red, 56×56px) | Fire current weapon (auto-aim: nearest enemy) |
| **Mid-right skill button** (blue, 56×56px) | Activate skill (cooldown overlay display) |
| **Top-right shield button** (green, 56×56px) | Toggle energy shield (remaining charges number) |
| **Top-left weapon slots** (3 icons, 48×48px each) | Weapon switch tap |
| **Left screen swipe** | Dash (in swipe direction) |

> **Mobile button layout** (≤400px small display support):
> ```
> [Wpn1][Wpn2][Wpn3]         [Pause]
> [HP Bar]                    [Minimap]
>
>
>     (Joystick)         [Shield]
>                        [Skill]
>                        [Attack]
> ```
> All touch targets: `Math.max(size, 48)` enforced (F11)

---

## §4. Visual Style Guide

### 4.1 Core Principles
- **100% Canvas code drawing**: Zero external assets, zero CDN, zero Google Fonts (F1, F2)
- **Never create assets/ directory** — exclude ASSET_MAP, preloadAssets, SPRITES code entirely (F77)
- All visual elements rendered in real-time via Canvas 2D API (arc, rect, lineTo, bezierCurveTo, gradient, shadowBlur)

### 4.2 Color Palette

| Zone | Primary (pri) | Secondary (sec) | Background (bg) | Enemy |
|------|---------------|-----------------|-----------------|-------|
| Asteroid Belt | #E8A04C (amber) | #8B6914 (dark gold) | #0A0A1A (deep space) | #CC4444 (red) |
| Nebula | #7B68EE (purple) | #FF69B4 (pink) | #0D0620 (deep purple) | #44CC88 (green) |
| Black Hole | #00CED1 (cyan) | #FF4500 (orange) | #050510 (pitch black) | #FF6644 (vermillion) |
| Frozen | #87CEEB (sky blue) | #E0FFFF (light cyan) | #0A1628 (deep navy) | #4488FF (blue) |
| Void | #C0C0C0 (silver) | #FFD700 (gold) | #000000 (pure black) | #FF00FF (magenta) |

| UI Element | Color |
|-----------|-------|
| HP Bar | #44FF44 (bright green) |
| Energy Bar | #4488FF (blue) |
| Shield | #00FFCC (cyan) |
| Crystal | #FF44FF (magenta) |
| Text | #FFFFFF (white) |
| Inactive | #666666 (gray) |

### 4.3 Background & Environment
- **Multi-layer scrolling star field**: 3-layer (near/mid/far stars) parallax effect
- **Per-zone environmental objects**:
  - Asteroid Belt: Rotating asteroids (4~6 size variants, random rotation), collision debris
  - Nebula: Translucent gas clouds (gradient + alpha pulse), lightning discharge effects
  - Black Hole: Distortion lens effect (radial gradient), accretion disk particle orbits
  - Frozen: Ice crystals (hexagonal snowflake patterns), floating ice (movement obstacles)
  - Void: Dimensional rifts (inheriting Cycle 29 drawDimensionalRift), geometric structures
- **Weather/Environment change effects**: Environment dynamically changes during sector progression
  - Asteroid storm (particle density increase + screen shake)
  - Nebula electromagnetic interference (UI glitch effect)
  - Gravity distortion (movement vector bias)
  - Ice spread (frost effect at screen edges)
  - Void erosion (color saturation decrease)

### 4.4 Drawing Function Signature Standard (F9, F19)
All drawing functions follow this pattern:
```javascript
// ✅ Correct: state passed via parameters, using gt (game time)
function drawShip(ctx, x, y, size, angle, thrustLevel, gt) { ... }
function drawBoss(ctx, x, y, phase, hp, maxHp, gt) { ... }
function drawSector(ctx, scrollX, scrollY, sectorData, gt) { ... }

// 🚫 Forbidden: direct global variable reference, t parameter
function drawShip() { ctx.fillRect(ship.x, ship.y, ...); } // no globals
function drawBoss(ctx, x, y, t) { ... } // t shadowing risk → use gt
```

### 4.5 Asset List (Canvas drawing, each function ~10~20KB complexity)

| # | Asset ID | Description | Complexity |
|---|----------|-------------|------------|
| 1 | ship-idle | Ship base state | Polygon + gradient + glow |
| 2 | ship-thrust | Ship thrust (engine flame particles) | idle + particle system |
| 3 | ship-dash | Ship dash (afterimage + invincibility effect) | trail effect + alpha |
| 4 | ship-shield | Ship shield active (hexagonal energy barrier) | repeating hexagon + pulse |
| 5 | ship-damaged | Ship hit (sparks + smoke) | particles + shake |
| 6 | boss-asteroid | Asteroid Belt boss "Rock Titan" | Giant asteroid + core glow |
| 7 | boss-nebula | Nebula boss "Storm Weaver" | Gas tentacles + lightning |
| 8 | boss-blackhole | Black Hole boss "Gravity Maw" | Accretion disk + event horizon |
| 9 | boss-frozen | Frozen boss "Crystal Warden" | Ice crystal armor + laser eyes |
| 10 | boss-void | Void boss "Null Entity" | Geometric shape shifting |
| 11 | boss-hidden | Hidden boss "Void Sentinel" | Large (600×400 equivalent) |
| 12 | enemy-drone | Basic enemy drone | Triangle + glow |
| 13 | enemy-cruiser | Medium enemy cruiser | Polygon + turrets |
| 14 | enemy-mine | Mine (proximity-detect explosion) | Circle + spikes + warning light |
| 15 | asteroid-sm | Small asteroid | Irregular polygon |
| 16 | asteroid-lg | Large asteroid (destructible) | Irregular polygon + cracks |
| 17 | nebula-cloud | Nebula gas cloud | radialGradient + alpha |
| 18 | ice-crystal | Ice crystal | Hexagon + reflections |
| 19 | portal | Dimensional portal (sector transition) | Vortex + gradient |
| 20 | artifact-glow | Artifact drop effect | Tier-color + particles |
| 21 | explosion | Explosion effect (4 stages) | Particle spread + fadeOut |
| 22 | ui-joystick | Touch joystick | Double circle + transparency |
| 23 | ui-buttons | Attack/skill/shield buttons | Circle + icon + cooldown |
| 24 | thumbnail | Thumbnail (cinematic composition) | Ship+nebula+boss standoff (20KB+) |

---

## §5. Core Engine Systems

### 5.1 Initialization Order (F12: TDZ Prevention)
```
1. CONFIG constant declaration
2. Canvas/ctx DOM assignment
3. Global state object initialization (G = { ... })
4. Engine system creation (TweenManager, ObjectPool, SoundManager, InputManager)
5. Event listener registration
6. Game loop start (requestAnimationFrame)
```

### 5.2 Core Engine Rules
- **Zero setTimeout** (F4): All delayed transitions use TweenManager.onComplete()
- **Guard flags** (F5): `sectorClearing = true` etc. to ensure tween callback fires once
- **clearImmediate()** (F13): Immediate cleanup after cancelAll() + flush _pendingCancel
- **Single update path** (F14): Core variables (shipSpeed, fireRate, etc.) use either tween OR direct assignment, never both
- **SeededRNG** (F18): `Math.random` 0 count, all random elements use SeededRNG
- **beginTransition()** (F6): All state transitions go through this function only, respecting STATE_PRIORITY

### 5.3 Code Region Guide (10 REGION)

| REGION | Name | Est. Lines | Dependencies |
|--------|------|-----------|--------------|
| R1 | CONFIG | 1~200 | None |
| R2 | ENGINE (Tween/Pool/Sound/Input) | 201~600 | R1 |
| R3 | ENTITY (Ship/Enemy/Boss/Projectile) | 601~1000 | R1, R2 |
| R4 | DRAW (all drawing functions) | 1001~1600 | R1 |
| R5 | COMBAT (weapons/collision/damage) | 1601~1900 | R1, R2, R3 |
| R6 | SECTOR (procedural generation/environment) | 1901~2200 | R1, R2, R3 |
| R7 | ROGUE (artifacts/upgrades) | 2201~2500 | R1, R2, R3 |
| R8 | STATE (state machine/transitions) | 2501~2800 | R1~R7 |
| R9 | SAVE (localStorage/progress) | 2801~2950 | R1, R8 |
| R10 | MAIN (loop/resize/entry point) | 2951~3200+ | R1~R9 |

> **Dependency direction**: R1→R10 unidirectional. Zero reverse references target. (F79)

---

## §6. State Machine

### 6.1 Game States + STATE_PRIORITY

| State | Priority | Description |
|-------|----------|-------------|
| BOOT | 0 | Initial loading |
| TITLE | 1 | Title screen |
| HANGAR | 2 | Upgrade/ship management |
| SECTOR_SELECT | 3 | Sector selection map |
| SECTOR_INTRO | 4 | Sector entry cutscene |
| EXPLORE | 5 | Sector exploration (move+collect) |
| COMBAT | 6 | Combat (enemy waves) |
| BOSS_INTRO | 7 | Boss entrance cutscene |
| BOSS | 8 | Boss battle |
| BOSS_VICTORY | 9 | Boss defeat sequence |
| SECTOR_CLEAR | 10 | Sector clear + artifact selection |
| NARRATIVE | 11 | Narrative dialogue |
| GAME_OVER | 99 | Game over (highest priority) |
| VICTORY | 98 | Final victory |
| PAUSE | 50 | Pause |
| CONFIRM_MODAL | 51 | Confirm modal (Canvas-based, F3) |
| SETTINGS | 52 | Settings |

> **RESTART_ALLOWED whitelist**: `[GAME_OVER, VICTORY, TITLE]` — only these states can transition to TITLE/HANGAR. Reverse transitions blocked from other states.

### 6.2 State × System Matrix (F7)

| State | Tween | Physics | Input | Draw | Sound | Combat | Sector | Rogue | Save |
|-------|-------|---------|-------|------|-------|--------|--------|-------|------|
| BOOT | ✅ | — | — | ✅ | — | — | — | — | ✅ |
| TITLE | ✅ | — | menu | ✅ | ✅ | — | — | — | — |
| HANGAR | ✅ | — | menu | ✅ | ✅ | — | — | ✅ | ✅ |
| SECTOR_SELECT | ✅ | — | menu | ✅ | ✅ | — | — | — | — |
| SECTOR_INTRO | ✅ | — | skip | ✅ | ✅ | — | — | — | — |
| EXPLORE | ✅ | ✅ | game | ✅ | ✅ | — | ✅ | — | — |
| COMBAT | ✅ | ✅ | game | ✅ | ✅ | ✅ | ✅ | — | — |
| BOSS_INTRO | ✅ | — | skip | ✅ | ✅ | — | — | — | — |
| BOSS | ✅ | ✅ | game | ✅ | ✅ | ✅ | — | — | — |
| BOSS_VICTORY | ✅ | — | — | ✅ | ✅ | — | — | — | — |
| SECTOR_CLEAR | ✅ | — | select | ✅ | ✅ | — | — | ✅ | ✅ |
| NARRATIVE | ✅ | — | skip | ✅ | ✅ | — | — | — | — |
| GAME_OVER | ✅ | — | menu | ✅ | ✅ | — | — | — | ✅ |
| VICTORY | ✅ | — | menu | ✅ | ✅ | — | — | — | ✅ |
| PAUSE | ✅ | — | pause | ✅ | — | — | — | — | — |
| CONFIRM_MODAL | ✅ | — | modal | ✅ | — | — | — | — | — |
| SETTINGS | ✅ | — | menu | ✅ | ✅ | — | — | — | — |

> ⚠️ **Tween active in ALL states** (F72 resolution: prevent BOOT→TITLE transition regression)
> ⚠️ Input column: specified by mode name (menu/game/skip/select/pause/modal) per Cycle 26 lesson

---

## §7. Core Game Loop

### 7.1 Main Loop (60fps target)
```
requestAnimationFrame(loop)
├── dt = (now - lastTime) / 1000, cap at 0.05 (20fps minimum)
├── IF state === PAUSE/CONFIRM_MODAL → tweenMgr.update(dt) + draw() only
├── tweenMgr.update(dt)
├── inputMgr.process()
├── IF ACTIVE_SYSTEMS[state].Physics → updatePhysics(dt)
│   ├── updateShip(dt)
│   ├── updateProjectiles(dt)
│   ├── updateEnemies(dt)
│   └── updateEnvironment(dt)
├── IF ACTIVE_SYSTEMS[state].Combat → updateCombat(dt)
│   ├── checkCollisions()     // hitTest(a, b) single function (F16)
│   ├── applyDamage()         // judge first, save later (F8)
│   └── checkWaveComplete()   // guard flag protected (F5)
├── IF ACTIVE_SYSTEMS[state].Sector → updateSector(dt)
│   ├── spawnEnemyWave()      // SeededRNG based (F18)
│   └── updateEnvironmentHazards(dt)
├── IF ACTIVE_SYSTEMS[state].Rogue → updateRogue()
│   └── processArtifactSelection()
├── IF ACTIVE_SYSTEMS[state].Save → autoSave()
├── draw(dt)
│   ├── drawBackground(ctx, scrollX, scrollY, zone, gt)
│   ├── drawEnvironment(ctx, sectorData, gt)
│   ├── drawEntities(ctx, entities, gt)
│   ├── drawEffects(ctx, particles, gt)
│   ├── drawUI(ctx, state, hp, energy, shield, gt)
│   └── drawMobileControls(ctx, inputState, gt) // touch only
└── lastTime = now
```

### 7.2 Physics System
- **Movement**: Inertia-based (acceleration/deceleration), max speed cap
- **Collision detection**: AABB + circular hitTest() (F16)
  ```javascript
  function hitTest(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    return dist < a.radius + b.radius;
  }
  ```
- **ObjectPool**: Pool pattern for projectiles/particles/enemies, zero per-frame GC target

### 7.3 Environmental Hazard System
| Zone | Hazard | Effect | Counter |
|------|--------|--------|---------|
| Asteroid Belt | Asteroid collision | HP -10, knockback | Evade or destroy |
| Nebula | EM interference | 3s UI glitch + aim wobble | Exit nebula area |
| Black Hole | Gravity distortion | Movement vector bias (toward center) | Thrust to resist |
| Frozen | Floating ice | 50% slowdown + turn delay | Melt with laser |
| Void | Dimensional instability | Random teleport every 5s | Stay in stable zones |

### 7.4 Combat Wave System
- Each sector: 3~5 waves (increases with zone progression)
- Wave composition: Enemy types/counts/placement determined by SeededRNG
- Wave clear condition: All enemies defeated or timeout (60s → reduced bonus)
- Between waves: Resource drops + short breathing time (3s)

### 7.5 Boss System (F17: bossRewardGiven flag)
- Boss defeat reward given once only: `if (boss.dead && !bossRewardGiven) { ... bossRewardGiven = true; }`
- 3-phase transition per boss (HP 66%→33%→0%)

---

## §8. Balance System (F78 Resolution)

### 8.1 Per-Sector DPS/EHP Matrix

| Zone | Enemy HP | Enemy ATK | Enemies/Wave | Player Expected DPS | Expected Clear Time |
|------|----------|-----------|-------------|--------------------|--------------------|
| Asteroid Belt | 20~40 | 5~8 | 4~6 | 25~35 | 45s/wave |
| Nebula | 40~70 | 8~12 | 5~8 | 40~55 | 50s/wave |
| Black Hole | 70~120 | 12~18 | 6~10 | 60~80 | 55s/wave |
| Frozen | 100~160 | 15~22 | 7~12 | 80~110 | 60s/wave |
| Void | 140~220 | 20~30 | 8~14 | 100~140 | 65s/wave |

### 8.2 Balance Formulas
```
Player DPS = baseDMG × (1 + upgradeBonus) × (1 + artifactBonus) × fireRate
  - Artifact cap: artifactBonus ≤ 2.0 (200%)
  - Synergy cap: same-category artifact cumulative bonus ≤ 1.5 (150%)

Player EHP = baseHP × (1 + armorBonus) + shieldHP
  - Assumption: hit rate 40% (Explorer) / 55% (Fighter) / 70% (Legend)

Boss clearable condition: Player DPS × 120s > Boss HP
  - If assumption fails: DDA fallback (§8.3)
```

### 8.3 DDA 3-Level Dynamic Balance
| Condition | DDA Level | Effect |
|-----------|-----------|--------|
| 3 consecutive hits (within 5s) | Level 1 | Enemy ATK -15%, drop rate +20% |
| Wave timeout 2 times | Level 2 | Enemy HP -20%, enemy count -2 |
| Same sector failed 3 times | Level 3 | Enemy HP -30%, ATK -25%, resource drops ×2 |

> DDA operates internally, invisible to player. Independent from difficulty selection (Explorer/Fighter/Legend).

### 8.4 3-Tier Difficulty Presets

| Attribute | Explorer | Fighter | Legend |
|-----------|----------|---------|--------|
| Enemy HP multiplier | ×0.7 | ×1.0 | ×1.4 |
| Enemy ATK multiplier | ×0.6 | ×1.0 | ×1.3 |
| Resource drops | ×1.5 | ×1.0 | ×0.7 |
| Shield charges | 5 | 3 | 2 |
| Dash cooldown | 1.5s | 2.0s | 3.0s |
| DDA | Active | Active | Disabled |
| Boss phases | 2 | 3 | 4 |

---

## §9. Boss Design (6 Bosses)

### 9.1 Boss Phase Transition Diagrams

**Rock Titan (Asteroid Belt)**
```
[P1: HP 100%~66%] → [P2: HP 66%~33%] → [P3: HP 33%~0%]
    Split attack          Spinning charge       Core exposed + asteroid storm
```

**Storm Weaver (Nebula)**
```
[P1: HP 100%~66%] → [P2: HP 66%~33%] → [P3: HP 33%~0%]
    Tentacle sweep        Lightning net         EM storm + clones
```

**Gravity Maw (Black Hole)**
```
[P1: HP 100%~66%] → [P2: HP 66%~33%] → [P3: HP 33%~0%]
    Gravitational pull    Spacetime warp attack  Event horizon (screen shrink)
```

**Crystal Warden (Frozen)**
```
[P1: HP 100%~66%] → [P2: HP 66%~33%] → [P3: HP 33%~0%]
    Freeze laser          Crystal reflection     Absolute zero field + ice summon
```

**Null Entity (Void)**
```
[P1: HP 100%~66%] → [P2: HP 66%~33%] → [P3: HP 33%~0%]
    Shape shift (tri→hex) Dimensional split      Reality collapse (screen glitch)
```

**Void Sentinel (Hidden) — 4 Phases**
```
[P1: HP 100%~75%] → [P2: HP 75%~50%] → [P3: HP 50%~25%] → [P4: HP 25%~0%]
    Mimic prev bosses     Multi-weapon usage     Trial judgment (quiz)     True form + all patterns
```

### 9.2 Boss Entrance Cutscene
- **Camera zoom out** (1.0× → 0.7×, 1.5s)
- **Boss name + title text** (e.g., "ROCK TITAN — Guardian of the Asteroid Belt")
- **BGM transition**: Exploration BGM → Boss BGM (crossfade 0.5s)
- **Screen shake** + warning siren SFX

---

## §10. Procedural Sector Generation

### 10.1 SeededRNG-Based Generation
```javascript
const seed = runCount * 1000 + sectorIndex;
const rng = new SeededRNG(seed);

function generateSector(rng, zone, difficulty) {
  return {
    enemies: generateEnemyWaves(rng, zone, difficulty),
    hazards: generateHazards(rng, zone),
    resources: generateResources(rng, zone),
    layout: generateLayout(rng, zone),
  };
}
```

### 10.2 Reachability Verification (Cycle 23 Lesson)
- After sector generation, **BFS verifies path exists from start → exit portal**
- If no path: regenerate with seed+1 (max 5 attempts)
- Ensure environmental hazards (asteroids, ice) never fully block the path

### 10.3 Sector Connection Map
```
Asteroid Belt (1-1 → 1-2 → 1-3[Boss])
    ↓
Nebula (2-1 → 2-2 → 2-3[Boss])
    ↓
Black Hole (3-1 → 3-2 → 3-3[Boss])
    ↓
Frozen (4-1 → 4-2 → 4-3[Boss])
    ↓
Void (5-1 → 5-2 → 5-3[Boss])
    ↓
Hidden (H-1[Void Sentinel]) ← unlocked after defeating all 5 bosses
```

---

## §11. Scoring System & Save

### 11.1 Score Calculation (F8: Judge First, Save Later)
```
Score = Enemy kill points + Boss kill bonus + Sector clear time bonus + Resource collection bonus

Enemy kill: drone=50, cruiser=150, mine=100
Boss: zone1=1000, zone2=2000, zone3=3000, zone4=4000, zone5=5000, hidden=10000
Time bonus: max(0, (60 - clearTime) × 10) per wave
Resource bonus: crystal ×5, data ×10
```

> **Order**: ① Calculate score ② Compare/judge high score ③ Save to localStorage

### 11.2 localStorage Schema
```javascript
{
  "celestial-drift-save": {
    version: 2,
    highScore: 0,
    totalRuns: 0,
    bestSector: 0,
    upgrades: {
      attack: [0,0,0,0,0],
      defense: [0,0,0,0,0],
      explore: [0,0,0,0,0]
    },
    crystals: 0,
    bossesDefeated: [false,false,false,false,false,false],
    endings: { normal: false, true: false },
    settings: { difficulty: 1, bgm: true, sfx: true, lang: 'en' }
  }
}
```

---

## §12. Roguelite System

### 12.1 Artifact List (14 Types)

| Tier | ID | Name | Effect | Cap Applied |
|------|----|------|--------|-------------|
| Common | C1 | Energy Amplifier | Energy max +20% | — |
| Common | C2 | Alloy Armor | Damage taken -10% | Defense cap 50% |
| Common | C3 | Collection Drone | Resource pickup range +50% | — |
| Common | C4 | Thrust Booster | Move speed +15% | Speed cap 200% |
| Common | C5 | Aim Assist | Projectile speed +20% | — |
| Common | C6 | Repair Nanobots | HP +5 recovery on wave clear | — |
| Rare | R1 | Plasma Core | Weapon damage +30% | DPS cap 200% |
| Rare | R2 | Phase Shifter | Dash cooldown -40% | — |
| Rare | R3 | Energy Reflector | Shield break deals 50 DMG to nearby enemies | — |
| Rare | R4 | Time Decelerator | Enemy move/attack speed -20% | — |
| Rare | R5 | Lucky Coin | Artifact tier upgrade chance +25% | — |
| Epic | E1 | Quantum Splitter | Projectiles penetrate + split (3-way) | DPS cap 200% |
| Epic | E2 | Dimensional Anchor | 50% chance to negate damage on hit | — |
| Epic | E3 | Stellar Blueprint | All upgrade effects +50% | Synergy cap 150% |

> **Cap overflow prevention**: `applyArtifact()` verifies cap before applying. Artifacts exceeding cap are **not excluded from 3-choice selection**, but display (MAX) in UI when effect reaches cap. (Cycle 27 lesson)

### 12.2 Permanent Upgrade 3-Tree

**Attack Tree (Crystal cost)**
| Lv | Name | Effect | Cost |
|----|------|--------|------|
| 1 | Basic Firepower | Weapon DMG +10% | 50 |
| 2 | Rapid Fire | Fire rate +15% | 120 |
| 3 | Critical | Critical chance +15% | 250 |
| 4 | Piercing Round | Projectile penetration +1 | 500 |
| 5 | Overdrive | Boss battle DMG +25% | 1000 |

**Defense Tree**
| Lv | Name | Effect | Cost |
|----|------|--------|------|
| 1 | Reinforced Hull | Max HP +15 | 50 |
| 2 | Shield Enhancement | Shield charges +1 | 120 |
| 3 | Evasive Maneuver | 20% dodge chance on hit | 250 |
| 4 | Auto Repair | HP +3 every 10s | 500 |
| 5 | Immortal | Survive lethal hit once (per run) | 1000 |

**Exploration Tree**
| Lv | Name | Effect | Cost |
|----|------|--------|------|
| 1 | Sensor Expansion | Minimap range +30% | 50 |
| 2 | Resource Detection | Show resource locations on minimap | 120 |
| 3 | Hyper Drive | Dash distance +30% | 250 |
| 4 | Scavenger | Resource drop amount +40% | 500 |
| 5 | Dimensional Key | Hidden zone access (even without defeating all 5 bosses) | 1000 |

---

## §13. Sound System (Web Audio API)

### 13.1 BGM
| State | BGM | Implementation |
|-------|-----|----------------|
| TITLE | Space ambient (slow pad) | OscillatorNode + GainNode fade |
| EXPLORE | Exploration theme (mid-tempo arpeggio) | 3 Osc layers |
| COMBAT | Combat theme (fast pulse) | 4 Osc + filter sweep |
| BOSS | Boss theme (intense bass) | 5 Osc + distortion |
| VICTORY | Victory fanfare | Short melody sequence |

### 13.2 Sound Effects (8+)
| ID | Situation | Implementation |
|----|-----------|----------------|
| sfx-laser | Laser fire | High-freq sine decay |
| sfx-missile | Missile launch | Low-freq noise + sine |
| sfx-plasma | Plasma fire | Mid-freq triangle + vibrato |
| sfx-explosion | Explosion | Noise burst + LP filter |
| sfx-shield | Shield activate/hit | Highpass ping |
| sfx-dash | Dash | Frequency sweep down |
| sfx-pickup | Resource collect | Ascending 3-note scale |
| sfx-boss-alert | Boss entrance warning | Low-freq siren loop |
| sfx-artifact | Artifact selection | Crystal bell |
| sfx-hit | Hit taken | Low-freq pulse |

---

## §14. Code Hygiene & Verification

### 14.1 Numeric Consistency Table (F10)

| Spec Value | CONFIG Key | Value |
|-----------|-----------|-------|
| Player base HP | CFG.PLAYER_HP | 100 |
| Dash cooldown | CFG.DASH_CD | 2.0 |
| Shield charges | CFG.SHIELD_CHARGES | 3 |
| Shield cooldown | CFG.SHIELD_CD | 8.0 |
| Artifact DPS cap | CFG.ART_DPS_CAP | 2.0 |
| Synergy cap | CFG.ART_SYN_CAP | 1.5 |
| DDA L1 enemy ATK reduction | CFG.DDA_L1_ATK | 0.85 |
| DDA L2 enemy HP reduction | CFG.DDA_L2_HP | 0.80 |
| DDA L3 enemy HP reduction | CFG.DDA_L3_HP | 0.70 |
| Touch minimum size | CFG.TOUCH_MIN | 48 |
| Critical Lv3 chance | CFG.CRIT_L3 | 0.15 |

### 14.2 Code Hygiene Checklist
- [ ] `assets/` directory does not exist
- [ ] `ASSET_MAP`, `preloadAssets`, `SPRITES` code: 0 count
- [ ] `setTimeout`: 0 count
- [ ] `Math.random`: 0 count
- [ ] `confirm()`, `alert()`, `prompt()`: 0 count
- [ ] External URL/CDN/Google Fonts: 0 count
- [ ] Drawing functions with direct global variable reference: 0 count
- [ ] Parameter name `t` usage: 0 count (→ `gt` or `dt`)
- [ ] All touch targets ≥ 48px
- [ ] `applyArtifact()` has cap verification
- [ ] `bossRewardGiven` flag exists
- [ ] RESTART_ALLOWED whitelist exists
- [ ] ACTIVE_SYSTEMS matrix has Tween=true for all rows

### 14.3 Smoke Test Gate (18 Items)
1. `index.html` exists + opens in browser
2. Canvas rendering normal (not black screen)
3. BOOT → TITLE transition (within 2s)
4. TITLE → HANGAR → SECTOR_SELECT → EXPLORE full flow
5. EXPLORE → COMBAT → BOSS combat flow
6. BOSS defeat → SECTOR_CLEAR → artifact selection
7. GAME_OVER → TITLE/HANGAR return
8. VICTORY → TITLE return
9. Keyboard input works (WASD + attack + weapon switch)
10. Touch input works (joystick + 4 buttons)
11. BGM playback + mute toggle
12. localStorage save/load
13. `assets/` directory does not exist
14. `setTimeout` grep: 0 count
15. `Math.random` grep: 0 count
16. `ASSET_MAP`/`preloadAssets`/`SPRITES` grep: 0 count
17. Parameter name `t` grep: 0 count (within draw functions)
18. Full flow regression test (BOOT→TITLE→HANGAR→SECTOR_SELECT→EXPLORE→COMBAT→BOSS→VICTORY)

---

## §15. Localization

### 15.1 Language Switching
- Default: Korean (`ko`)
- English UI: `en`
- Switchable in settings screen
- Managed via `G.lang` variable, text lookup via `L(key)` function

---

## §16. Game Page Sidebar Information

```yaml
game:
  title: "Celestial Drift"
  description: "A space survival action roguelite where you drift through 5 sectors from a shipwrecked vessel, collecting resources, upgrading your ship, and defeating bosses. Features procedural sectors, 14 artifacts, 3-tree permanent upgrades, and 6 boss battles."
  genre: ["action", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/Arrow Keys: Ship movement"
    - "Mouse Click/Z: Fire weapon"
    - "1/2/3: Weapon switch (Laser/Missile/Plasma)"
    - "Shift/X: Dash (invincible evasion)"
    - "E: Energy shield"
    - "Space: Activate skill"
    - "Touch: Virtual joystick + attack/skill/shield buttons"
  tags:
    - "#space"
    - "#survival"
    - "#roguelite"
    - "#action"
    - "#casual"
    - "#bossfight"
    - "#upgrade"
    - "#procedural"
  addedAt: "2026-03-23"
  version: "1.0.0"
  featured: true
```

---

## §17. Thumbnail Design

**Composition**: Ship "Astra" in center facing giant boss "Void Sentinel" against a nebula backdrop.
- Foreground: Ship (thrust active, shield glowing)
- Midground: Boss silhouette (geometric form, glowing eyes)
- Background: Purple+cyan nebula gradient + star field
- Bottom: Title "CELESTIAL DRIFT" with glow text
- Target complexity: 20KB+ SVG-equivalent Canvas drawing

---

## §18. Camera System

### 18.1 Camera Modes
| Mode | Zoom Level | Used In |
|------|-----------|---------|
| Default | 1.0× | EXPLORE, COMBAT |
| Zoom Out | 0.7× | BOSS_INTRO (show full boss) |
| Zoom In | 1.3× | NARRATIVE (dialogue portrait) |
| Shake | ±5px | Hit, explosion, boss entrance |
| Pan | Smooth movement | SECTOR_INTRO (sector landscape scan) |

### 18.2 Implementation
```javascript
function applyCamera(ctx, camera) {
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x + camera.shakeX, -camera.y + camera.shakeY);
}
```

---

## Appendix A: Extreme Build Balance Verification

### A.1 "Firepower All-In" Build
- Attack tree Lv5 + E1 (Quantum Splitter) + R1 (Plasma Core)
- Expected DPS: base 25 × 1.5 (upgrade) × 1.3 (R1) × split effect = ~73 (under cap)
- Void boss HP 8000 / DPS 73 = 110s → within 120s limit ✅

### A.2 "Tank" Build
- Defense tree Lv5 + C2 (Alloy Armor) + E2 (Dimensional Anchor)
- Expected EHP: (100+15) × 1.1 / (0.5 × 0.5) = 504
- Void zone per-wave damage: 30 × 0.4 (hit rate) × 14 (enemies) × 0.9 (armor) = 151
- Survival waves: 504/151 = 3.3 waves → 5-wave zone needs healing → C6 needed ✅

### A.3 "Exploration Focused" Build
- Exploration tree Lv5 + C3 (Collection Drone) + R5 (Lucky Coin)
- Resource collection: ×1.4 (Lv4) × 1.5 (C3) = ×2.1
- DPS insufficient for late bosses → DDA Lv2 compensation ✅
