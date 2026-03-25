---
game-id: vine-temple
title: Vine Temple
genre: action, casual
difficulty: medium
---

# Vine Temple — Cycle #40 Game Design Document

> **One-Page Summary**: Archaeologist 'Dr. Ivy' explores ancient vine civilization temples in a **action-casual roguelite**. Swing on vines to traverse, one-touch combat to fight — a Stickman Hook (Poki #3) + Temple Run 2 (Poki #8) synergy. 5 biomes (Jungle/Swamp/Canopy/Underground/Inner Sanctum) × 3 floors = 15 main stages + 3 bosses (MVP) + 2 hidden rooms = **20 total stages**. 3-branch upgrade tree (Combat/Explore/Survival) × 5 levels + SeededRNG procedural maps + BFS reachability validation. **Resolves action+casual's 11-cycle longest gap + bright jungle theme contrasts existing deep-sea(abyss-keeper)/space(celestial-drift).**

> **MVP Boundary**: **Phase 1** (core loop: swing→combat→collect→return, biomes 1~3 + 3 bosses + upgrade Lv1~3 + DDA 4 levels + relic system + basic narrative) → **Phase 2** (biomes 4~5 + 2 hidden stages + upgrade Lv4~5 + weather/time-of-day effects + full narrative + i18n completion). **Phase 1 must deliver a complete jungle swing action roguelite experience.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅

| ID | Lesson Summary | Applied Section |
|----|---------------|----------------|
| F1 | assets/ directory maintained — Gemini API PNG assets + manifest.json dynamic loading [Cycle 39+] | §4.1, §8 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] | §5.2 |
| F5 | Guard flags ensure tween callback single execution [Cycle 3 B1] | §5.2 |
| F6 | TRANSITION_TABLE single definition for state transitions [Cycle 3~39] | §6.1 |
| F7 | State × System matrix mandatory [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save last [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numeric consistency table (spec=code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target minimum 48×48px + Math.max enforcement [Cycle 12~39] | §3.3 |
| F12 | TDZ prevention: INIT_EMPTY pattern + **Engine constructor callback TDZ extended defense** [Cycle 5~39] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single value update path unification [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22~39] | §14.3 |
| F16 | hitTest() single function integration [Cycle 27] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG complete usage (Math.random 0 count) [Cycle 19~39] | §5.2, §14.3 |
| F19 | Procedural SFX + BGM (Web Audio API generated) [Cycle 19~39] | §12 |
| F20 | Multilingual support (ko/en) [Cycle 27~39] | §13 |
| F21 | beginTransition single definition [Cycle 32~39] | §6.1 |
| F22 | Gemini PNG assets manifest.json-based loading [Cycle 39+] | §4.1, §8 |

### New Feedback (Cycle #39 Lessons) 🆕

| ID | Lesson | Applied Section | Solution |
|----|--------|----------------|----------|
| F23 | TDZ crash: Engine constructor's onResize callback references incomplete engine [Cycle 39 P0] | §5.1 | **Absolutely no direct engine reference in onResize(w, h) callbacks**. All callbacks use parameters only. `if (!engine?._ready) return;` guard mandatory |
| F24 | fadeAlpha sync incomplete — tween _t value not reflected in G.fadeAlpha [Cycle 39] | §6.1 | Tween onUpdate callback: `G.fadeAlpha = tw._t;` direct sync. All tween value↔render value 1:1 mapping verified |
| F25 | Mobile touch target 48px deficit — 12th consecutive cycle [Cycle 39] | §3.3 | `Math.max(48, computedSize)` enforcement. Smoke test item added |
| F26 | Runtime verification impossible — P0 blocked all substantive testing [Cycle 39] | §14.3 | Engine initialization success verification as smoke test item #1. `engine._ready === true` + `G.state !== undefined` check |
| F27 | Engine constructor callback TDZ variant pattern — not defensible by INIT_EMPTY [Cycle 39] | §5.1 | **Engine initialization complete flag `_ready = true` set at constructor end**. All callback entry points check `_ready` |

### Previous Cycle "Pain Points" Direct Resolution ⚠️

| Pain Point (cycle-39) | Resolution Section | Solution | Verification |
|-----------------------|-------------------|----------|-------------|
| P0 TDZ unresolved, game completely non-functional | §5.1 | `_ready` flag + all callback guards + parameter passing | `engine._ready === true` after init |
| TDZ variant (constructor callback) | §5.1 | onResize(w,h) → initBgParticles(count,w,h) pattern. 0 engine references | grep `engine\.` in callbacks = 0 |
| Mobile touch target 30px deficit | §3.3 | Math.max(48, G.cellSize) enforcement | Min touch area 48×48px |
| fadeAlpha sync incomplete | §6.1 | Tween value→render value onUpdate sync | fadeAlpha === tween._t always true |
| Runtime verification completely impossible | §14.3 | Engine init success as smoke test #1 | TITLE state entry confirmed |

### Previous Cycle "Next Cycle Suggestions" Resolution

| Suggestion (cycle-39 postmortem) | Resolved | Applied Section |
|--------------------------------|----------|----------------|
| Standardize Engine constructor callback TDZ defense | ✅ | §5.1 — `_ready` flag + callback guard pattern |
| Add "engine init success" to Puppeteer smoke test | ✅ | §14.3 — Added as item #1 |
| Ban direct engine reference in onResize callbacks | ✅ | §5.1 — Parameter passing only |

---

## §1. Game Overview & Core Fun Elements

### Core Concept
"**Grab a vine with a single tap, swing through the jungle on momentum, and unravel the secrets of an ancient temple.**"

The player becomes archaeologist 'Dr. Ivy', swinging on vines to explore jungle temples. Combines Stickman Hook's proven swing physics with roguelite progression (relic collection → permanent upgrades) and one-touch combat — an action+casual hybrid.

### Core Fun Elements (3 Axes)
1. **Physics-based swing exhilaration**: Grab vine → swing in arc → accelerate → release at optimal timing → parabolic flight → catch next vine. Natural acceleration from conservation of kinetic energy.
2. **Roguelite progression addiction**: Randomly generated maps each run + relic choices + permanent upgrades. "I can go deeper this time" growth satisfaction.
3. **Casual accessibility + deep mastery**: Single tap/click for vine grab/release. Anyone can play instantly, but optimal swing angles, combo chains, and boss pattern mastery offer dozens of hours of depth.

### Story/Narrative
The Vine Civilization coexisted with plants to build temples. After a mysterious plague caused their downfall, toxic plants and mutated creatures now inhabit the ruins. Dr. Ivy must collect relics to uncover the cause of the plague, unseal the temple, and revive the Vine Civilization's wisdom.

- **Biome 1 Jungle**: "These vines... they're alive." — Vine Civilization discovered
- **Biome 2 Swamp**: "The plague originated here." — Toxic plant spread
- **Biome 3 Canopy**: "There were temples above the clouds!" — Aerial temple discovered
- **Boss 1 Jungle Guardian**: First seal broken → Vine Civilization journal acquired
- **Boss 2 Swamp Queen**: Second seal → Plague cause clue
- **Boss 3 Canopy Sage**: Third seal → Key to civilization revival

---

## §2. Game Rules & Objectives

### Game Objectives
- **Short-term**: Reach current stage exit (swing to move + avoid enemies/traps + collect items)
- **Mid-term**: Clear 3 biomes (MVP) + defeat 3 bosses
- **Long-term**: Complete relic collection + max upgrade tree + discover hidden rooms

### Core Rules
1. **Health System**: 3 HP (base). -1 per hit. At 0 → run ends → spend collected relics on permanent upgrades → restart
2. **Swing Physics**: Hang from vine anchor points in circular motion. Release timing determines launch angle/speed
3. **Combat**: During swing collision with enemy — bottom-to-top collision = kill, side/top collision = take damage
4. **Relics**: Hidden relics throughout stages → converted to permanent upgrade currency on run end
5. **Combo**: Consecutive enemy kills → combo count increases → score multiplier + temporary invincibility (3+ combo)

### Run Structure (Roguelite)
```
[Title] → [World Map] → [Stage Select] → [Swing Exploration] → [Boss Fight]
                                                ↓ (death)
                                          [Result Screen] → [Upgrade] → [World Map]
```

---

## §3. Controls

### §3.1 Keyboard
| Key | Action |
|-----|--------|
| Space / Z | Grab vine (hold to hang) / Release (key up) |
| X | Dash attack (during swing — rush in current velocity direction, pierces enemies) |
| ↑↓ | Biome selection on world map |
| ←→ | Stage selection on world map |
| Enter | Confirm / Enter stage |
| Escape | Pause menu |
| R | Instant restart (in stage) |

### §3.2 Mouse
| Input | Action |
|-------|--------|
| Left click (hold) | Grab nearest vine anchor (swing while held) |
| Left click (release) | Release vine → parabolic launch |
| Right click | Dash attack |
| Click | UI buttons / World map interaction |

### §3.3 Touch (Mobile)
| Input | Action |
|-------|--------|
| Screen touch (hold) | Grab nearest vine anchor |
| Touch release | Release vine → parabolic launch |
| Two-finger tap | Dash attack |
| Swipe | World map navigation |

**⚠️ Touch Target Rules (F11/F25)**:
- All touch interaction areas: `Math.max(48, computedSize)` px
- Vine anchor hitbox: minimum 48×48px regardless of visual size
- UI buttons: minimum 48×48px, spacing minimum 8px
- Smoke test §14.3 verifies 0 touch targets below 48px

### §3.4 Small Display Layout (≤400px) — [F30 Cycle 30]
```
┌──────────────────────┐
│   [HP♥♥♥] [Score]    │  ← Top HUD (32px)
│                      │
│                      │
│   Game Play Area     │  ← Full screen touch = swing
│                      │
│                      │
│              [DASH]  │  ← Dash button (56×56px, bottom-right)
│         [PAUSE]      │  ← Pause (48×48px, top-right)
└──────────────────────┘
```

### §3.5 Large Display Layout (>768px)
```
┌──────────────────────────────┐
│ [HP♥♥♥]     [Score] [Combo] │  ← Top HUD
│                              │
│                              │
│       Game Play Area         │
│                              │
│                              │
│ [PAUSE]              [DASH]  │
└──────────────────────────────┘
```

---

## §4. Visual Style Guide

### §4.1 Technical Principles
- **Gemini API PNG assets** (F1/F22): stored in assets/ folder, dynamically loaded via manifest.json
- **Zero external CDN/fonts** (F2): all text via system fonts or Canvas drawing
- **Procedural effects**: particle systems generated at runtime via Canvas 2D API
- **Canvas resolution**: fullscreen + `devicePixelRatio` + dynamic resize

### §4.2 Color Palette
| Purpose | Color | HEX |
|---------|-------|-----|
| Jungle Green (primary) | Vivid Emerald | `#2ecc71` |
| Ancient Gold (accent) | Warm Gold | `#f1c40f` |
| Abyss Purple (danger) | Toxic Purple | `#8e44ad` |
| Sky Blue (background) | Tropical Sky | `#3498db` |
| Earth Brown (ground) | Earth Brown | `#8b4513` |
| Bloom Pink (items) | Coral Pink | `#e74c3c` |
| Mist White (UI) | Mist White | `#ecf0f1` |

### §4.3 Biome Backgrounds
| Biome | Far Layer | Mid Layer | Near Layer |
|-------|-----------|-----------|------------|
| Jungle | Misty tropical mountains + waterfall | Giant tree canopy silhouettes | Vine arches + mossy stones |
| Swamp | Purple toxic mist + dead trees | Giant mushroom colonies + rotting vines | Swamp water surface + poison pools |
| Canopy | Sunlight through clouds + rainbow | Aerial root bridges + bird flocks | Giant leaf platforms |

### §4.4 Drawing Function Standard (F9)
All rendering functions use pure function pattern:
```javascript
// ✅ Correct pattern
function drawPlayer(ctx, x, y, size, animFrame, facing) { ... }
function drawVine(ctx, x1, y1, x2, y2, thickness, swayPhase) { ... }
function drawEnemy(ctx, x, y, size, type, hp, maxHp) { ... }

// ❌ Forbidden pattern
function drawPlayer() { ctx.drawImage(player, G.px, G.py); }
```

---

## §4.5 Art Direction

### Art Style Keywords
**"Lush Tropical Hand-Painted Adventure"** — Warm, dense tropical jungle with watercolor-touch hand-painting. Ancient civilization's mystical golden ornaments coexisting with vibrant green life force.

### Style References
1. **Ori and the Blind Forest** (Moon Studios) — Harmony of light and foliage, background depth and layering
2. **Rayman Legends** (Ubisoft) — Bright, energetic colors, organic environment design, playful character silhouettes

### Design Principles
- **Silhouette readability**: All objects identifiable by silhouette alone without background
- **Color role separation**: Green=safe/paths, Gold=collectibles/rewards, Purple=danger/poison, Red=enemies/damage
- **Layer depth**: Far(30% opacity)→Mid(50%)→Near(100%) for depth perception
- **Animation consistency**: All characters 8-direction movement frames (idle 2, run 4, swing 4, attack 2 = 12 frames)

---

## §5. Core Game Loop (Frame-Level Logic Flow)

### §5.1 Engine Initialization Safety Pattern (F12/F23/F27)

**⚠️ CRITICAL — TDZ Defense Mandatory Pattern**

```javascript
// ✅ Engine initialization order (TDZ prevention)
class Engine {
  constructor(canvas) {
    // 1. Internal state initialization (INIT_EMPTY)
    this._ready = false;           // ← initialization complete flag
    this.W = 0; this.H = 0;
    this.G = { state: 'LOADING', fadeAlpha: 0, /* ... */ };
    this.tweens = new TweenManager();
    this.rng = new SeededRNG(Date.now());

    // 2. Canvas setup (no engine reference needed)
    this.ctx = canvas.getContext('2d');

    // 3. Resize (parameter passing only — no engine reference!)
    const w = canvas.width, h = canvas.height;
    this._initLayout(w, h);        // ← 'this' OK (inside constructor)

    // 4. Event listeners (guard mandatory)
    window.addEventListener('resize', () => {
      if (!this._ready) return;    // ← TDZ guard
      this._onResize(canvas.clientWidth, canvas.clientHeight);
    });

    // 5. Mark initialization complete (MUST be last in constructor!)
    this._ready = true;
  }
}

// ❌ Forbidden pattern (Cycle 39 P0 recurrence)
// window.addEventListener('resize', () => { engine.W = ...; }); // engine is still undefined!
```

**Smoke test gate #1**: `engine._ready === true` && `G.state !== 'LOADING'`

### §5.2 Main Game Loop

```
Every frame (requestAnimationFrame):
├── 1. Calculate deltaTime (max 50ms cap)
├── 2. TweenManager.update(dt)
│   ├── clearImmediate() processing (F13: immediate cleanup instead of deferred cancelAll)
│   └── Each tween's onUpdate → G value sync (F24: fadeAlpha etc.)
├── 3. State-specific update branch (§6.2 matrix reference)
│   ├── TITLE: background particles + UI animation
│   ├── MAP: world map scroll + biome transition
│   ├── PLAY: ──────────────────────────────
│   │   ├── 3a. Input processing (touch/mouse/keyboard)
│   │   ├── 3b. Swing physics (§5.3)
│   │   ├── 3c. Player movement
│   │   ├── 3d. Enemy AI movement
│   │   ├── 3e. Collision detection (hitTest single function, F16)
│   │   │   ├── Player↔Enemy: kill or take damage
│   │   │   ├── Player↔Item: collect
│   │   │   ├── Player↔Trap: take damage
│   │   │   └── Player↔Exit: stage clear
│   │   ├── 3f. Combo timer update
│   │   ├── 3g. DDA evaluation (§10)
│   │   └── 3h. Camera tracking
│   └── BOSS: ──────────────────────────────
│       ├── 3a. Boss AI pattern execution
│       ├── 3b. Swing physics + combat
│       ├── 3c. Boss HP bar + weakness exposure
│       └── 3d. Phase transition check
├── 4. Rendering
│   ├── 4a. Background layers (far→mid→near, parallax)
│   ├── 4b. Vine network
│   ├── 4c. Enemies/items/traps
│   ├── 4d. Player (including swing trajectory)
│   ├── 4e. Effects/particles
│   └── 4f. HUD (HP, Score, Combo, minimap)
├── 5. fadeAlpha rendering (F24: tween._t sync verification)
└── 6. Request next frame
```

### §5.3 Swing Physics System

```
Swing state machine:
  FREE_FALL → (touch/click) → ATTACH → SWING → (release) → LAUNCH → FREE_FALL

ATTACH:
  - Find nearest anchor (radius = Math.max(48, G.cellSize * 3))
  - Connect vine to anchor

SWING:
  - Circular motion: angle += angularVelocity * dt
  - angularVelocity += gravity * sin(angle) / ropeLength * dt
  - damping: angularVelocity *= 0.998 (natural decay)

LAUNCH:
  - Launch velocity = tangentialVelocity (tangent direction)
  - vx = -angularVelocity * ropeLength * sin(angle)
  - vy = angularVelocity * ropeLength * cos(angle)

FREE_FALL:
  - vy += GRAVITY * dt (gravity)
  - vx *= AIR_DRAG (air resistance 0.999)
```

**Single value update path (F14)**: `angularVelocity` updated only by physics system. Tween modification forbidden.

---

## §6. State Machine & Transition Management

### §6.1 TRANSITION_TABLE (F6/F21)

```javascript
// 4-state single definition (Cycle 39 success pattern inherited)
const TRANSITION_TABLE = {
  TITLE: { targets: ['MAP'],  transition: 'fade' },
  MAP:   { targets: ['PLAY', 'TITLE'], transition: 'slide' },
  PLAY:  { targets: ['MAP', 'BOSS'],  transition: 'fade' },
  BOSS:  { targets: ['MAP', 'PLAY'],  transition: 'fade' },
};

// GAMEOVER is PLAY sub-state (Cycle 38 lesson)
// PLAY.subState: 'active' | 'gameover' | 'clear' | 'paused'

// All transitions through beginTransition() single entry point
function beginTransition(from, to) {
  if (!TRANSITION_TABLE[from]?.targets.includes(to)) {
    console.warn(`Invalid transition: ${from} → ${to}`);
    return;
  }
  // fadeAlpha sync (F24)
  tweens.clearImmediate(); // F13
  tweens.add({
    target: G, prop: 'fadeAlpha',
    from: 0, to: 1, duration: 300,
    onUpdate: (t) => { G.fadeAlpha = t; }, // ← explicit sync
    onComplete: () => {
      G.state = to;
      G.fadeAlpha = 1;
      tweens.add({
        target: G, prop: 'fadeAlpha',
        from: 1, to: 0, duration: 300,
        onUpdate: (t) => { G.fadeAlpha = t; },
      });
    }
  });
}
```

### §6.2 State × System Matrix (F7) — [Cycle 2 B1 prevention]

| State | Input | Physics | Enemies | Items | Tween | Render | Audio | DDA | Camera |
|-------|-------|---------|---------|-------|-------|--------|-------|-----|--------|
| TITLE | menu | — | — | — | ✅ | bg+ui | bgm | — | fixed |
| MAP | navigate | — | — | — | ✅ | map+ui | bgm | — | scroll |
| PLAY.active | swing | ✅ | ✅ | ✅ | ✅ | full | sfx+bgm | ✅ | follow |
| PLAY.paused | pause-menu | — | — | — | — | dim+ui | mute | — | fixed |
| PLAY.gameover | result | — | — | — | ✅ | dim+ui | jingle | — | fixed |
| PLAY.clear | result | — | — | — | ✅ | full+ui | jingle | — | fixed |
| BOSS | swing+dodge | ✅ | boss-ai | — | ✅ | full | boss-bgm | — | boss-cam |

**Input mode granularity (Cycle 26 lesson)**:
- `menu`: arrow keys/click for menu selection
- `navigate`: world map navigation (swipe/arrow keys)
- `swing`: touch/click = swing, dash = attack
- `pause-menu`: pause menu only
- `result`: result screen (continue/upgrade selection)
- `swing+dodge`: boss fight exclusive (swing + dodge patterns)

### §6.3 Sub-state Transition Rules

```
PLAY.active:
  ├── HP <= 0 → PLAY.gameover (guard: gameoverTriggered = true, F5)
  ├── Exit reached → PLAY.clear (guard: clearTriggered = true)
  ├── ESC/Pause → PLAY.paused
  └── Boss stage entry → BOSS (beginTransition)

PLAY.gameover:
  └── Confirm → MAP (result screen → permanent upgrades → world map)

PLAY.clear:
  └── Next stage or MAP (player choice)

BOSS:
  ├── Boss HP 0 → PLAY.clear (bossRewardGiven guard, F17)
  └── Player HP 0 → PLAY.gameover
```

### §6.4 Modal UI (F3)
- confirm/alert usage forbidden → Canvas-based custom modals
- Tween update continues during modal display (Cycle 2 B1 prevention)

---

## §7. Game Content

### §7.1 Biome Composition (Phase 1 MVP)

#### Biome 1: Jungle Canopy
| Floor | Environment | Enemy Types | Traps | Relics |
|-------|-------------|-------------|-------|--------|
| 1-1 | Tutorial. Safe vine placement | None | None | Golden Leaf |
| 1-2 | Moving vines introduced | Poison Frog (ground) | Thorn Vines | Jade Monkey |
| 1-3 | Complex layout + boss approach | Poison Frog + Vine Snake | Thorns + trap floor | Sun Emblem |

#### Biome 2: Toxic Swamp
| Floor | Environment | Enemy Types | Traps | Relics |
|-------|-------------|-------------|-------|--------|
| 2-1 | Toxic mist (vision limit) | Poison Mushroom (ranged spore) | Poison Pool | Purple Crystal |
| 2-2 | Decaying vines (timed hang) | Poison Mushroom + Swamp Spider | Toxic mist zones | Snake Totem |
| 2-3 | Rising toxic water | All enemies + mini-boss | Rising poison level | Moon Mirror |

#### Biome 3: Canopy Heights
| Floor | Environment | Enemy Types | Traps | Relics |
|-------|-------------|-------------|-------|--------|
| 3-1 | Strong winds (horizontal force) | Eagle (aerial) | Wind zones | Feather Crown |
| 3-2 | Cloud platforms (temporary) | Eagle + Vine Spirit | Lightning zones | Sky Compass |
| 3-3 | Boss arena (circular) | Vine Spirit | Complex | Heart of Wind |

### §7.2 Enemy Types (5 Types)

| Enemy | Movement | HP | Kill Condition | Drop |
|-------|----------|----|----|------|
| Poison Frog | Ground patrol (left/right) | 1 | Swing collision from above | Coin ×1 |
| Vine Snake | Moves along vines | 2 | Above/side collision ×2 | Coin ×2 |
| Poison Mushroom | Fixed position + spore launch (3s interval) | 1 | Dash attack | Coin ×2 + HP Potion 10% |
| Swamp Spider | Wall-attached + web shooting (slow) | 2 | Dash attack | Coin ×3 |
| Eagle | Horizontal flight + dive | 2 | Above collision or dash | Coin ×3 + Relic Shard 20% |

### §7.3 Environmental Hazard Table (Cycle 30 lesson)

| Hazard | Biome | Damage | Duration | Cooldown | Countermeasure |
|--------|-------|--------|----------|----------|----------------|
| Thorn Vines | Jungle | 1 HP | Instant | — | Avoid (swing above/below) |
| Trap Floor | Jungle | 1 HP | Instant | — | Swing to bypass |
| Poison Pool | Swamp | 0.5 HP/sec | While touching | — | Swing to avoid |
| Toxic Mist | Swamp | None | While inside | — | Vision reduced 50% |
| Rising Poison | Swamp | Instant kill | When floor reached | — | Move upward |
| Strong Wind | Canopy | None | While inside | — | Horizontal push (vx ±200) |
| Lightning | Canopy | 2 HP | Instant | 5s warning | Avoid marked zone |

### §7.4 Items

| Item | Effect | Appearance Rate |
|------|--------|----------------|
| Coin | +10 score | 100% (enemy drop) |
| HP Potion | +1 HP (up to max) | 15% (enemy drop) |
| Relic Shard | +1 relic (permanent currency) | 10% (enemy drop) + treasure chest |
| Golden Vine | 30s swing speed ×1.5 | 1 fixed per stage |
| Shield | Nullify next hit | Hidden room exclusive |

### §7.5 Bosses (3 Types)

#### Boss 1: Jungle Guardian — HP 30
```
Phase 1 (HP 100~60%):
  ┌─── Vine Sweep (2s) ──→ Weakness Exposed (head, 1.5s) ───┐
  └──────────────────── Repeat ──────────────────────────────┘
  Pattern: [VINE_SWEEP 2s] → [EXPOSED 1.5s] → [VINE_SWEEP]

Phase 2 (HP 60~30%):
  ┌─── Vine Rain (3s) → Charge (1.5s) → Exposed (1s) ──────┐
  └──────────────────── Repeat ──────────────────────────────┘
  Pattern: [VINE_RAIN 3s] → [CHARGE 1.5s] → [EXPOSED 1s]

Phase 3 (HP 30~0%):
  ┌─── Enrage (speed ×1.5) + Phase 1~2 random alternation ──┐
  └──────────────────── Repeat ──────────────────────────────┘
```
**Weakness**: During exposure, swing collision from above = 3 damage. Dash attack = 5 damage.
**bossRewardGiven guard (F17)**: Reward granted only once when boss HP reaches 0.

#### Boss 2: Swamp Queen — HP 40
```
Phase 1 (HP 100~50%):
  ┌─── Spore Cloud (2s) → Toxic Tentacle (2s) → Exposed (core, 1.5s) ─┐
  └──────────────────── Repeat ────────────────────────────────────────┘

Phase 2 (HP 50~0%):
  ┌─── Split (2 minis) → Main body exposed (1s) → Recombine ──────────┐
  └──────────────────── Repeat ────────────────────────────────────────┘
```
**Weakness**: Damage only when core exposed. During split, minis must be killed (otherwise HP recovery on recombine).

#### Boss 3: Canopy Sage — HP 50
```
Phase 1 (HP 100~60%):
  ┌─── Wind Blades (3s) → Guided Lightning (2s) → Exposed (back, 2s) ─┐
  └──────────────────── Repeat ────────────────────────────────────────┘

Phase 2 (HP 60~30%):
  ┌─── Tornado (pull, 3s) → Lightning Pattern (2s) → Exposed (1.5s) ──┐
  └──────────────────── Repeat ────────────────────────────────────────┘

Phase 3 (HP 30~0%):
  ┌─── Phase 1+2 mixed + Anchor destruction (only 3 safe anchors left) ┐
  └──────────────────── Repeat ────────────────────────────────────────┘
```
**Weakness**: Back crystal — only rear swing collision effective. Phase 3 anchor reduction dramatically increases difficulty.

---

## §8. Asset Requirements

```yaml
# asset-requirements
art-style: "Lush Tropical Hand-Painted Adventure — warm watercolor-touch tropical jungle, Ori and the Blind Forest depth + Rayman Legends vibrancy"
color-palette: "#2ecc71, #f1c40f, #8e44ad, #3498db, #8b4513, #e74c3c, #ecf0f1"
mood: "Bright, vibrant adventure, thrill of unexplored jungle, ancient civilization mystery"
reference: "Ori and the Blind Forest depth + Rayman Legends color vibrancy"

assets:
  - id: player-idle
    desc: "Dr. Ivy idle pose — explorer outfit (khaki vest+hat), holding vine whip in one hand, facing forward. Short brown hair, bright green eyes, confident smile"
    size: "512x512"

  - id: player-swing
    desc: "Dr. Ivy swing pose — one hand gripping vine, body arched like a bow in mid-flight. Vest tails and hair flowing in wind. Dynamic arc feel"
    size: "512x512"

  - id: player-dash
    desc: "Dr. Ivy dash attack pose — vine whip extended forward in charging rush. Green afterimage effect. Intense combat pose"
    size: "512x512"

  - id: enemy-frog
    desc: "Poison frog — bright green frog with purple spots. Exaggerated large eyes, puffed cheeks spitting poison. Cute yet threatening"
    size: "512x512"

  - id: enemy-snake
    desc: "Vine snake — emerald snake coiled around vines. Gold patterns, red eyes, sharp fangs. Camouflaged to blend with vines"
    size: "512x512"

  - id: enemy-mushroom
    desc: "Poison mushroom — large mushroom with purple cap emitting glowing spores. Angry face, root-like legs. Swamp atmosphere"
    size: "512x512"

  - id: enemy-spider
    desc: "Swamp spider — dark purple spider with gold-patterned shell. 8 legs attached to wall, luminous web ready to fire"
    size: "512x512"

  - id: enemy-eagle
    desc: "Eagle — large golden eagle with spread wings. Sharp beak and talons, wind energy swirling around wings"
    size: "512x512"

  - id: boss-guardian
    desc: "Jungle Guardian — massive tree golem covered in living vines and moss. Gold eyes, glowing emerald core in chest (weakness). 1/3 screen height. Imposing stance"
    size: "768x768"

  - id: boss-queen
    desc: "Swamp Queen — half-human half-plant queen on giant toxic lotus. Purple skin, poison flower crown, toxic tentacles extending everywhere. Glowing core in chest (weakness) luminescent in toxic mist"
    size: "768x768"

  - id: boss-sage
    desc: "Canopy Sage — massive bird-like ancient being controlling wind. Sky blue+gold feathers, glowing crystal on back (weakness). Surrounded by storm clouds. Mystical majesty"
    size: "768x768"

  - id: bg-jungle
    desc: "Jungle background — misty tropical mountains, golden sunlight streaming through giant tree canopy, distant waterfall, mossy ancient stone pillars. 3-layer (far/mid/near) parallax"
    size: "1920x1080"

  - id: bg-swamp
    desc: "Swamp background — purple toxic mist, dead giant tree silhouettes, glowing toxic mushroom colonies, moonlight reflected on dark swamp water. Ominous yet beautiful"
    size: "1920x1080"

  - id: bg-canopy
    desc: "Canopy background — sky above clouds, giant aerial root bridges, rainbow bird flocks, sunlit giant leaf platforms. Bright and majestic aerial garden"
    size: "1920x1080"

  - id: item-coin
    desc: "Ancient gold coin — round gold coin engraved with Vine Civilization symbols. Subtle golden glow. Front view for rotation animation"
    size: "128x128"

  - id: item-potion
    desc: "HP potion — heart-shaped red berry in wooden vial. Vine-wrapped stopper, subtle red glow"
    size: "128x128"

  - id: item-relic
    desc: "Relic shard — glowing emerald fragment with ancient rune inscriptions. Green+gold luminescence, mystical aura"
    size: "128x128"

  - id: item-golden-vine
    desc: "Golden vine — special vine icon glowing gold. Vine coiled in star shape, intense golden aura"
    size: "128x128"

  - id: ui-hp
    desc: "Health icon — green heart wrapped in vines. Full/empty variants. Life force and jungle theme harmony"
    size: "128x128"

  - id: thumbnail
    desc: "Game representative image — Dr. Ivy swinging on vine above jungle temple in dynamic scene. Jungle Guardian (boss) silhouette in background, golden sunlight, ancient temple entrance. 'VINE TEMPLE' text in vine-style font. Bright adventurous atmosphere"
    size: "800x600"
```

---

## §9. Permanent Progression System (Upgrade Tree)

### §9.1 Upgrade Tree 3 Branches × 5 Levels

**Currency: Relic Shards**

#### Combat Tree
| Lv | Name | Effect | Cost |
|----|------|--------|------|
| 1 | Sharp Whip | Dash damage +1 | 5 |
| 2 | Chain Strike | Combo timer +1s (3→4s) | 10 |
| 3 | Piercing Rush | Dash attack pierces (up to 2 enemies) | 20 |
| 4 | Poison Resist | Poison damage -50% | 35 |
| 5 | Vine Master | Swing collision damage ×2 | 50 |

#### Explore Tree
| Lv | Name | Effect | Cost |
|----|------|--------|------|
| 1 | Relic Detector | Relic locations shown on minimap | 5 |
| 2 | Swing Boost | Max swing speed +20% | 10 |
| 3 | Double Jump | Extra vine grab in air ×1 | 20 |
| 4 | Treasure Sense | Hidden room entrances highlighted | 35 |
| 5 | Wind Rider | Acceleration instead of deceleration in strong wind | 50 |

#### Survival Tree
| Lv | Name | Effect | Cost |
|----|------|--------|------|
| 1 | Hardy Health | Max HP +1 (3→4) | 5 |
| 2 | Revival | Instant revive 1×/run (HP 1) | 10 |
| 3 | Shield Affinity | Shield duration ×2 | 20 |
| 4 | Life Drain | 5% chance HP +1 on enemy kill | 35 |
| 5 | Undying | 3s invincibility at HP 1 (1×/run) | 50 |

### §9.2 Roguelike Cap (Cycle 26 lesson)
- **DPS Cap**: Max 200% of base
- **Synergy Cap**: Upgrade effect stack max 150%
- **Cap overflow check**: `applyUpgrade()` internal cap check → clamp on overflow
- **Extreme build pre-verification**: See Appendix A

---

## §10. Procedural Map Generation

### §10.1 Generation Algorithm
```
1. Seed-based (SeededRNG) structure generation
   - Stage size: 4~8 screens wide, 2~4 screens tall
   - Anchor point placement: grid-based + SeededRNG offset (±20%)
   - Anchor spacing: min 80px, max 250px (reachable by swing physics)

2. Path generation (entry→exit)
   - BFS to create anchor connection graph
   - Guarantee shortest path (reachability verification)
   - Add 2~3 branch paths (for hidden room access)

3. Enemy/trap/item placement
   - Select from biome-specific enemy type pool via SeededRNG
   - Placement density by difficulty grade (§10.3)
   - Items placed at branch path ends (exploration reward)

4. Reachability verification (BFS) — F27/Cycle 23 lesson
   - Confirm entry→exit path exists
   - Confirm all branch paths reachable
   - On verification failure, regenerate seed (max 10 attempts)
```

### §10.2 BFS Reachability Verification (Cycle 23/39 lesson)
```javascript
function validateStageReachability(anchors, entry, exit) {
  const visited = new Set();
  const queue = [entry];
  visited.add(entry.id);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.id === exit.id) return true;

    for (const neighbor of getReachableAnchors(current, anchors)) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push(neighbor);
      }
    }
  }
  return false; // unreachable → regenerate seed
}

function getReachableAnchors(from, all) {
  // Return only anchors reachable by swing physics
  // Max swing reach = ropeLength * 2 + launchDistance
  return all.filter(a =>
    dist(from, a) <= MAX_SWING_REACH && a.id !== from.id
  );
}
```

### §10.3 Difficulty Grade Placement (Per Segment)

| Grade | Enemy Density | Trap Density | Anchor Density | Items | Distribution |
|-------|---------------|-------------|----------------|-------|-------------|
| E (Easy) | 0~1/screen | 0/screen | High | Coins | 30% |
| M (Medium) | 1~2/screen | 1/screen | Medium | Coins+Potions | 40% |
| H (Hard) | 2~3/screen | 2/screen | Low | Coins+Relics | 25% |
| X (Extreme) | 3+/screen | 3+/screen | Minimum | Relics+Powerups | 5% |

**Segment difficulty distribution formula** (Cycle 38 lesson):
```
Biome 1: E:50% M:40% H:10% X:0%
Biome 2: E:20% M:40% H:30% X:10%
Biome 3: E:10% M:30% H:40% X:20%
```

---

## §11. Score System

### §11.1 Score Calculation (F8: Judge first, save last)

```javascript
const SCORE = {
  ENEMY_KILL: 100,
  COMBO_MULTIPLIER: (combo) => Math.min(combo, 10) * 0.5 + 1, // 1.5x ~ 6x
  COIN_COLLECT: 10,
  RELIC_FIND: 500,
  STAGE_CLEAR: 1000,
  BOSS_KILL: 5000,
  TIME_BONUS: (seconds) => Math.max(0, 300 - seconds) * 10, // max 3000
  NO_HIT_BONUS: 2000,
};

// Judge first, save last (F8)
function onStageComplete() {
  const finalScore = calculateScore();  // 1. Judge
  const isNewBest = finalScore > getBestScore(); // 2. Compare
  saveBestScore(finalScore);            // 3. Save (last!)
  showResult(finalScore, isNewBest);
}
```

### §11.2 Combo System
- Kill enemy within 3s (4s with upgrade) of previous kill → combo +1
- Combo 3+ → temporary invincibility 1s
- Combo 5+ → swing speed +10% boost
- Combo 10+ → max multiplier (6x) + golden aura effect

### §11.3 Score Consistency Table (F10)

| Item | Spec Value | CONFIG Constant |
|------|-----------|----------------|
| Enemy kill base | 100 | SCORE.ENEMY_KILL |
| Coin collect | 10 | SCORE.COIN_COLLECT |
| Relic find | 500 | SCORE.RELIC_FIND |
| Stage clear | 1000 | SCORE.STAGE_CLEAR |
| Boss kill | 5000 | SCORE.BOSS_KILL |
| No-hit bonus | 2000 | SCORE.NO_HIT_BONUS |
| Max combo multiplier | 6x | SCORE.COMBO_MULTIPLIER(10) |
| Max time bonus | 3000 | SCORE.TIME_BONUS(0) |

---

## §12. Sound System (F19 — Web Audio API Procedural)

### §12.1 BGM (4 Types)
| BGM | State | Mood |
|-----|-------|------|
| Title | TITLE | Mystical jungle ambience — birdsong + wind + low pad |
| Jungle | PLAY (biome 1) | Rhythmic marimba + jungle percussion, bright adventurous |
| Swamp | PLAY (biome 2) | Dark, heavy bass + echo drums, tense |
| Canopy | PLAY (biome 3) | Bright, majestic harp + flute + wind pad, liberation |

### §12.2 SFX (8+ Types)
| SFX | Trigger | Implementation |
|-----|---------|---------------|
| vine_grab | Grab vine | Short whistle + string pluck |
| vine_release | Release vine | Elastic snap sound |
| swing_whoosh | During swing (speed proportional) | Wind sound (pitch varies with speed) |
| enemy_hit | Enemy kill | Impact + coin jingle |
| player_hurt | Take damage | Dull impact + fade |
| combo_up | Combo increase | Rising arpeggio (pitch rises with combo count) |
| boss_roar | Boss appearance | Low-frequency rumble + echo |
| stage_clear | Stage clear | Victory fanfare |
| coin_collect | Coin pickup | Short metallic jingle |
| dash_attack | Dash attack | Wind rush + impact |

---

## §13. Multilingual Support (F20)

```javascript
const LANG = {
  ko: {
    title: '바인 템플',
    subtitle: '고대 정글의 비밀을 풀어라',
    play: '탐험 시작',
    upgrade: '업그레이드',
    combat: '전투', explore: '탐험', survival: '생존',
    stage_clear: '스테이지 클리어!',
    game_over: '탐험 종료',
    boss_defeated: '보스 처치!',
    score: '점수', combo: '콤보', time: '시간',
    new_best: '신기록!',
    relics: '유물', coins: '코인',
    pause: '일시정지', resume: '계속하기', quit: '월드맵으로',
    biome_jungle: '밀림', biome_swamp: '늪지', biome_canopy: '수관층',
    controls_hint: '화면을 터치하여 덩굴을 잡으세요',
  },
  en: {
    title: 'Vine Temple',
    subtitle: 'Unravel the secrets of the ancient jungle',
    play: 'Start Exploring',
    upgrade: 'Upgrade',
    combat: 'Combat', explore: 'Explore', survival: 'Survival',
    stage_clear: 'Stage Clear!',
    game_over: 'Exploration Over',
    boss_defeated: 'Boss Defeated!',
    score: 'Score', combo: 'Combo', time: 'Time',
    new_best: 'New Best!',
    relics: 'Relics', coins: 'Coins',
    pause: 'Paused', resume: 'Resume', quit: 'World Map',
    biome_jungle: 'Jungle', biome_swamp: 'Swamp', biome_canopy: 'Canopy',
    controls_hint: 'Touch the screen to grab a vine',
  },
};
```

---

## §14. Code Hygiene & Verification

### §14.1 Numeric Consistency Checklist (F10)
- [ ] Spec §7.2 enemy HP = CONFIG.ENEMY_HP[type]
- [ ] Spec §7.5 boss HP = CONFIG.BOSS_HP[id]
- [ ] Spec §9.1 upgrade costs = CONFIG.UPGRADE_COST[tree][lv]
- [ ] Spec §11.3 score values = SCORE constants
- [ ] Spec §10.3 difficulty distribution = CONFIG.DIFFICULTY_RATIO[biome]

### §14.2 Code Hygiene Checklist
- [ ] `Math.random()` usage: 0 → SeededRNG only (F18)
- [ ] `setTimeout/setInterval` usage: 0 → tween onComplete (F4)
- [ ] `confirm()/alert()` usage: 0 → Canvas modal (F3)
- [ ] Direct global reference: 0 (except G object) → pure functions (F9)
- [ ] `engine.` direct reference in callbacks: 0 → parameter passing (F23)
- [ ] Touch targets below 48px: 0 (F25)
- [ ] `applyUpgrade()` DPS cap 200% / synergy cap 150% verified
- [ ] bossRewardGiven guard flag exists (F17)
- [ ] fadeAlpha === tween._t sync (F24)

### §14.3 Smoke Test Gate (F15/F26) — 14 items (FAIL 9 / WARN 5)

**FAIL (must pass)**:
1. ✅ `engine._ready === true` && `G.state !== 'LOADING'` (F26 — engine init success)
2. ✅ index.html exists + page loads successfully
3. ✅ Console errors: 0 (first 10 seconds)
4. ✅ TITLE → MAP → PLAY state transition normal
5. ✅ `Math.random` grep result: 0 (F18)
6. ✅ `setTimeout` grep result: 0 (F4)
7. ✅ `confirm(` / `alert(` grep result: 0 (F3)
8. ✅ All TRANSITION_TABLE targets are valid state names
9. ✅ Touch targets minimum 48px (F25)

**WARN (recommended)**:
10. ⚠️ External resource loads: 0 (F2)
11. ⚠️ Unreferenced asset files: 0
12. ⚠️ REGION comments: 8+ present
13. ⚠️ Multilingual key match (`Object.keys(LANG.ko)` === `Object.keys(LANG.en)`)
14. ⚠️ manifest.json all assets loaded successfully

### §14.4 Code Region Guide (10 REGIONs)

```
// REGION 1: CONFIG & CONSTANTS (lines 1~200)
// REGION 2: UTILS & SEEDED_RNG (lines 201~400)
// REGION 3: TWEEN_MANAGER (lines 401~550)
// REGION 4: AUDIO_SYSTEM (lines 551~800)
// REGION 5: ASSET_LOADER (lines 801~950)     ← manifest.json loading
// REGION 6: PHYSICS_ENGINE (lines 951~1200)   ← swing physics
// REGION 7: GAME_ENTITIES (lines 1201~1800)   ← player, enemies, bosses, items
// REGION 8: MAP_GENERATOR (lines 1801~2200)   ← procedural + BFS verification
// REGION 9: RENDER_SYSTEM (lines 2201~2800)   ← drawing functions
// REGION 10: ENGINE_CORE (lines 2801~3700+)   ← state machine, input, main loop
```

Dependency direction (Cycle 27 lesson):
```
R1 ← R2 ← R3
R1 ← R4
R1 ← R5
R1,R2 ← R6
R1,R2,R6 ← R7
R1,R2,R6 ← R8
R1,R5,R7 ← R9
R1~R9 ← R10
```

---

## §15. DDA (Dynamic Difficulty Adjustment) — 4 Levels

### §15.1 DDA Evaluation Metrics

| Metric | Measurement | Weight |
|--------|-------------|--------|
| Death Rate | Average deaths per last 3 stages | 40% |
| Clear Time | Actual/expected time ratio | 30% |
| Hit Rate | Average hits taken per stage / enemy count | 30% |

### §15.2 4-Level DDA Curve

| DDA Level | Condition | Enemy HP Mult | Enemy Speed | Extra Anchors | Item Drops |
|-----------|-----------|--------------|-------------|---------------|------------|
| 1 (Easy) | Death rate >2/stage | ×0.7 | ×0.8 | +3/screen | ×1.5 |
| 2 (Normal) | Default | ×1.0 | ×1.0 | 0 | ×1.0 |
| 3 (Hard) | Clear time < 70% expected | ×1.3 | ×1.2 | -1/screen | ×0.8 |
| 4 (Extreme) | No-hit clear ×2 consecutive | ×1.6 | ×1.4 | -2/screen | ×0.6 |

### §15.3 DDA Fallback (Cycle 24 lesson)
- **Assumption**: Player avoids 50% of enemies, utilizes 80% of anchors
- **Assumption error fallback**: 3 consecutive deaths → force DDA 1 + display "ghost path hint" (Cycle 35 lesson: maintain difficulty + provide information)

---

## §16. localStorage Data Schema

```javascript
const SAVE_SCHEMA = {
  version: 1,
  bestScores: { '1-1': 0, '1-2': 0, /* ... */ },
  upgrades: { combat: 0, explore: 0, survival: 0 },
  relicShards: 0,
  totalRelics: 0,
  clearedStages: [],
  bossesDefeated: [],
  hiddenRoomsFound: [],
  ddaLevel: 2,
  language: 'ko',
  settings: { sfxVolume: 0.7, bgmVolume: 0.5 },
};
```

---

## §17. Game Page Sidebar Fields

```yaml
game:
  title: "Vine Temple"
  description: "Swing on vines to explore ancient jungle temples in this action-casual roguelite. 5 biomes, 3 bosses, permanent upgrade tree for endless adventure!"
  genre: ["action", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "Space/Touch: Grab/release vine"
    - "X/Right-click/Two-finger: Dash attack"
    - "Arrow keys/Swipe: Map navigation"
    - "ESC: Pause"
  tags: ["jungle", "swing", "roguelite", "boss-fight", "upgrade", "physics"]
  addedAt: "2026-03-25"
  version: "1.0.0"
  featured: true
```

---

## Appendix A: Extreme Build Balance Verification

### Build 1: Full Combat (Combat Lv5)
- Dash damage: base 3 + upgrade 1 = 4 (×2 Vine Master = 8)
- Combo timer: 4s
- Boss 3 (HP 50) clear estimate: weakness exposure 7× × 8 damage = 56 (56 > 50 ✅)
- Expected time: 7× × (pattern 7s + weakness 2s) = 63s ✅ (within 20~120s range)

### Build 2: Full Survival (Survival Lv5)
- HP: 4 + Undying invincibility = effective 5 hits
- Life Drain: 5% recovery
- Boss 3 (HP 50) clear estimate: base 3 damage × 17 exposures = 51 (51 > 50 ✅)
- Expected time: 17× × 9s = 153s → DDA fallback activates, boss HP ×0.7 = 35 → 12× = 108s ✅

### Build 3: Full Explore (Explore Lv5)
- Swing speed +20%: faster approach, more attack opportunities
- Double Jump: increased boss evasion
- Boss 3 (HP 50) clear estimate: speed bonus allows 2 attacks per exposure → 9× × 6 = 54 (54 > 50 ✅)
- Expected time: 9× × 9s = 81s ✅

**DPS Cap Verification**: Max DPS = 8 damage/9s = 0.89/s. Base DPS = 3/9 = 0.33/s. Ratio = 270% → **Cap at 200% → clamp to 0.66/s**. Clear time = 50/0.66 = 76s ✅

---

## Appendix B: Previous Cycle Lesson Resolution Summary

| # | Lesson Source | Problem | Resolution | Verification |
|---|-------------|---------|-----------|-------------|
| 1 | Cycle 39 P0 | TDZ crash (Engine constructor callback) | §5.1 `_ready` flag + guard | Smoke #1 |
| 2 | Cycle 39 | fadeAlpha sync | §6.1 onUpdate sync | Code hygiene §14.2 |
| 3 | Cycle 39 | Touch 48px deficit | §3.3 Math.max(48) | Smoke #9 |
| 4 | Cycle 39 | Runtime verification impossible | §14.3 engine init gate | Smoke #1 |
| 5 | Cycle 39+ | assets/ policy change | §4.1, §8 Gemini PNG | Smoke #14 |
| 6 | Cycle 38 | 4-state simplification | §6.1 TRANSITION_TABLE 4 states | Smoke #8 |
| 7 | Cycle 35 | Single core loop focus | §1 swing→combat→collect single loop | MVP boundary |
| 8 | Cycle 26 | Roguelike cap | §9.2 DPS 200%/synergy 150% | Appendix A |
| 9 | Cycle 23 | BFS reachability | §10.2 validateStageReachability | Map generation |
| 10 | Cycle 2 | State×System matrix | §6.2 7 states × 9 systems | Spec |
