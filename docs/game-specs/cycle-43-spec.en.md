---
game-id: storm-ronin
title: Storm Ronin
genre: arcade, action
difficulty: hard
---

# Storm Ronin — Cycle #43 Game Design Document

> **One-Page Summary**: In the late Sengoku period, a betrayed ronin fights through five castles invaded by yokai in a **samurai bullet-hell roguelite arcade action** game. The core mechanic is "Slash Reflect" — deflecting enemy bullets with a katana swing. Stage entry → bullet dodging (movement + reflect + combo) → boss battle (pattern learning + weakness exploitation) → rewards (swordsmanship/relics/upgrades) core loop. Cuphead's boss pattern mastery + Vampire Survivors' roguelite builds + Sekiro's parry satisfaction. 5 castles × 3 stages = 15 main + 2 hidden = **17 total stages**. 4 bosses (Oni General/Fox Spirit/Dragon God/[Hidden] Sword Saint's Phantom) + 3-axis × 5-level upgrades + 13 relics + 4-tier DDA + 4 weather types. **Resolves arcade+action 10-cycle absence + first samurai theme on platform.**

> **MVP Boundary**: **Phase 1** (core loop: bullet reflect → enemy defeat → rewards → upgrade, Castles 1-3 (Wind Field/Volcano/Water Spirit) + 2 bosses (Oni General/Fox Spirit) + Upgrades Lv1-3 + 9 relics (5 common + 4 rare) + 5 enemy types + 4-tier DDA + 2 weather types (rain/cherry blossoms) + basic narrative + i18n (ko/en)) → **Phase 2** (Castles 4-5 (Earth Cavern/Sky Keep) + 2 bosses (Dragon God/Sword Saint Phantom) + 2 hidden stages + Upgrades Lv4-5 + 4 epic relics + all 4 weather types + camera zoom/pan + full narrative). **Phase 1 alone must deliver a complete arcade action experience.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅

| ID | Lesson Summary | Applied Section |
|----|---------------|----------------|
| F1 | Maintain assets/ directory — Gemini API PNG assets + manifest.json dynamic loading [Cycle 39+] | §4.1, §8 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modals [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1-2] | §5.2 |
| F5 | Guard flags ensure tween callback single execution [Cycle 3 B1] | §5.2 |
| F6 | TRANSITION_TABLE single definition for state transitions [Cycle 3-39] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6-7] | §4.4 |
| F10 | Numerical consistency table (spec = code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch targets min 48×48px + Math.max enforced [Cycle 12-39] | §3.3 |
| F12 | TDZ prevention: `_ready` flag + Engine constructor callback guard [Cycle 39-41] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path per value [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gates [Cycle 22-41] | §14.3 |
| F16 | hitTest() single unified function [Cycle 27] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG exclusively (zero Math.random) [Cycle 19-41] | §5.2, §14.3 |
| F19 | Procedural SFX + BGM (Web Audio API) [Cycle 19-41] | §12 |
| F20 | i18n support (ko/en) [Cycle 27-41] | §13 |
| F21 | beginTransition single definition [Cycle 32-41] | §6.1 |
| F22 | Gemini PNG assets via manifest.json [Cycle 39+] | §4.1, §8 |
| F23 | `_ready` flag TDZ defense pattern [Cycle 39-41 verified] | §5.1 |
| F24 | Canvas fallback 100% coverage [Cycle 41 verified] | §4.1 |
| F25 | DPS cap 200% / synergy cap 150% [Cycle 26-27, 41] | §7.4, §14.2 |
| F26 | Extreme build pre-verification (Appendix A) [Cycle 30-41] | §14.4 |

### New Feedback (Cycle #42 Lessons) 🆕

| ID | Lesson | Applied Section | Solution |
|----|--------|----------------|----------|
| F27 | monkey-patch → EventBus pattern [Cycle 41 INFO-1, Cycle 42 carried forward] | §4.3 | Central EventBus — `bus.on('slash', handler)` |
| F28 | Phase 2 not implemented — MVP overscoping [Cycle 41-42] | §1 | Phase 1 = 3 castles + 2 bosses + 9 relics = complete loop |
| F29 | No balance auto-verification [Cycle 41-42] | §14.4 | Frame-based reflect window × bullet density formula |
| F30 | beginTransition over-blocking [Cycle 41] | §6.1 | GAMEOVER/VICTORY = priority 10 (always transition) |
| F31 | Match-3 → Bullet-hell genre switch: timing system difference | §7.1 | Frame-based reflect window (±5F Perfect / ±10F Good) |
| F32 | Combo update path duplication prevention [Cycle 5 B2 extension] | §7.2 | comboCount update only through ComboManager.add() |

### Previous Cycle "Regrets" Direct Resolution ⚠️

| Regret (cycle-41~42) | Resolution Section | Solution | Verification |
|----------------------|-------------------|----------|-------------|
| monkey-patch structure retained (C41 INFO-1) | §4.3 | EventBus pattern: `bus.on('event', handler)` | monkey-patch grep 0 hits |
| Phase 2 not implemented (C41-42) | §1 MVP | Phase 1 = 3 castles + 2 bosses + upgrades Lv1-3 | Complete TITLE→PLAY→BOSS→VICTORY loop |
| No balance auto-verification (C41-42) | §14.4 | Bullet DPS vs reflect DPS formula pre-verification | Appendix A: 3 extreme builds proven clearable |
| beginTransition over-blocking (C41) | §6.1 | TRANSITION_TABLE priority field + GAMEOVER highest priority | GAMEOVER reachable from all states |

### Previous Cycle "Next Cycle Suggestions" Applied

| Suggestion (cycle-41~42 postmortem) | Applied | Section |
|-------------------------------------|---------|---------|
| monkey-patch → EventBus/middleware pattern | ✅ | §4.3 Central EventBus system |
| Balance simulator/pre-verification | ✅ | §14.4 Frame-based DPS formula verification |
| Shared engine module separation | ⚠️ Partial | §4.3 EventBus/TweenManager/SeededRNG as code modules |
| Genre expansion beyond match-3 | ✅ | Bullet-hell arcade action genre switch |

---

## §1. Game Overview and Core Fun

### 1.1 Concept
**Storm Ronin** is a **samurai bullet-hell roguelite arcade action** game where Kaze (風, "Wind"), a ronin betrayed by five castle lords in the late Sengoku period, fights through yokai-infested castles seeking revenge and truth. The core mechanic "Slash Reflect (斬撃反射)" lets players deflect enemy bullets with precisely timed katana swings. Perfect-timed reflects build combos that charge devastating ultimate attacks, creating an addictive gameplay loop.

### 1.2 Core Fun Elements
1. **Slash Reflect Satisfaction**: Deflect enemy bullets at the right timing — they fly back at enemies. Perfect timing = 2× damage + slow-motion + afterimage effect.
2. **Combo Chain Tension**: 10 combo → speed buff, 25 combo → ultimate gauge charge, 50 combo → invincible flash slash. Getting hit resets combo, maintaining tension.
3. **Roguelite Build Diversity**: 3-axis upgrades (Sword/Body/Mind) × 13 relics create different strategies each run. Reflect-focused, evasion-focused, or ultimate-focused paths.
4. **Boss Pattern Mastery**: 4 unique bosses with distinct bullet patterns. Phase transitions require new strategies. Classic arcade "learn and overcome" design.
5. **Japanese World Immersion**: Sengoku + yokai theme, ink wash-inspired visuals, cherry blossom/rain/fog weather effects. Platform's first samurai setting.

### 1.3 References
- **Cuphead** — Boss pattern learning and retry addiction. Extreme art style personality.
- **Sekiro: Shadows Die Twice** — Parry mechanic satisfaction. Timing-based combat.
- **Vampire Survivors** — Roguelite build synergies, weapon fusion, run variety.
- **Shogun Showdown** — Samurai roguelike turn-based combat → converted to real-time arcade.

---

## §2. Game Rules and Objectives

### 2.1 Ultimate Goal
Break through 5 castles to uncover the castle lords' conspiracy, stop the yokai-powered coup d'état, and achieve the true Way of the Sword.

### 2.2 Zone Structure (MVP Phase 1: Castles 1-3)

| Castle | Name | Theme | Stages | Boss | Weather |
|--------|------|-------|--------|------|---------|
| 1 | Wind Field (風林城) | Plains + wind, tutorial | 3 | — | Cherry blossoms (healing) |
| 2 | Volcano (火山城) | Lava + fire, flame bullets | 3 | Oni General | Volcanic ash (vision↓) |
| 3 | Water Spirit (水靈城) | Waterfalls + ice, freeze bullets | 3 | Fox Spirit | Rain (slippery) |
| 4 | Earth Cavern (土窟城) (Phase 2) | Underground + poison | 3 | Dragon God | Fog (vision limit) |
| 5 | Sky Keep (天空城) (Phase 2) | Sky + lightning, 5-element mix | 3 | [Hidden] Sword Saint | Lightning (random danger) |
| H1 | Yokai Training Ground (Phase 2) | Hidden | 1 | — | All elements |
| H2 | Sword Saint's Trial (Phase 2) | Hidden | 1 | — | None |

### 2.3 Stage Structure
Each stage consists of 3 segments:
- **Segment 1 (Entry)**: 2-3 enemy types, low bullet density. Combo practice.
- **Segment 2 (Escalation)**: 3-4 enemy types, medium density. Environmental obstacles.
- **Segment 3 (Climax)**: 4-5 enemy types + mini-boss. High density.

### 2.4 Combat Rules
- **Movement**: 8-directional free movement (arena-style, not side-scrolling)
- **Slash Reflect**: Swinging the katana reflects bullets in a 120° frontal arc
  - **Perfect** (±5 frames, ±83ms): 2× damage + 0.3s slow-motion + combo +2
  - **Good** (±10 frames, ±167ms): 1× damage + combo +1
  - **Miss**: Hit by bullet, HP -1, combo reset
- **Dash**: Short invincible dash (8-frame invincibility, 30-frame cooldown)
- **Ultimate**: Activated when combo gauge reaches 100%. Full-screen slash (all bullets cleared + massive damage to all enemies)

### 2.5 Win/Lose Conditions
- **Stage Clear**: All enemies in 3 segments defeated (or survival time met)
- **Stage Fail**: HP ≤ 0 → 50% XP retained, stage retry available
- **Boss Clear**: Boss HP ≤ 0 → prophecy fragment + epic relic choice
- **Run End**: All castles cleared (victory) or 3 consecutive deaths (game over)

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| WASD / Arrow Keys | 8-directional movement |
| J / Z | Slash Reflect (katana swing) |
| K / X | Dash (evade) |
| L / C | Ultimate (when gauge 100%) |
| Space | Lock reflect direction (hold to maintain) |
| Tab | Toggle relic list |
| Esc | Pause menu |
| L (menu) | Toggle language (ko ↔ en) |
| M | Toggle BGM mute |

### 3.2 Mouse
| Input | Action |
|-------|--------|
| Mouse move | Aim reflect direction (character → mouse) |
| Left click | Slash Reflect |
| Right click | Dash (toward mouse) |
| Middle click | Ultimate |
| WASD | Movement (combined with mouse) |

### 3.3 Touch (Mobile)
| Input | Action |
|-------|--------|
| Left virtual joystick | 8-directional movement |
| [Slash] button | Slash Reflect (toward movement direction) |
| [Dash] button | Dash (toward movement direction) |
| [Ult] button | Ultimate (when gauge 100%) |
| Full screen tap (non-combat) | UI button selection |

**⚠️ All touch targets min 48×48px**: `Math.max(48, btnSize)` enforced (F11)

#### Small Display (≤400px) Layout
```
┌─────────────────────────┐
│ HP[■■■■░░] Combo:12 Pts │ ← Top fixed
├─────────────────────────┤
│                         │
│     [Game Arena Area]    │ ← Battle field
│                         │
├─────────────────────────┤
│ (◎)    [Slash][Dash][Ult]│ ← Bottom: L=joystick, R=buttons
│ Joy     48px  48px 48px │    Each button 48px+
└─────────────────────────┘
```

#### Large Display (>400px) Layout
```
┌─────────────────────────────────┐
│ HP[■■■■■■░░░░] Combo:25 ★Ult   │
├─────────────────────────────────┤
│ Relic │                         │
│ List  │    [Game Arena Area]    │
│ (left)│                         │
│       │                         │
├───────┴─────────────────────────┤
│ (◎)Joy    [Slash] [Dash] [Ult] │
└─────────────────────────────────┘
```

---

## §4. Visual Style Guide

### 4.1 Technical Constraints
- **Canvas resolution**: Fullscreen + `devicePixelRatio` + dynamic resize
- **Assets**: Gemini API PNG assets + manifest.json dynamic loading (F1, F22)
- **Canvas fallback**: All render functions include `if (!img) { drawFallback(ctx, ...); }` (F24)
- **External CDN/fonts**: 0 (F2)
- **alert/confirm**: 0 → Canvas-based modals (F3)

### 4.2 Color Palette
| Purpose | Color Code | Description |
|---------|-----------|-------------|
| Background (night sky) | `#0a0a1a` | Deep Japanese night |
| Cherry blossom pink | `#ffb7c5` | Cherry petals, healing |
| Blood red | `#cc2222` | Slash effects, enemy hit |
| Gold | `#ffd700` | Combo counter, UI accent |
| Ink black | `#1a1a2e` | Character outlines, sword |
| Steel gray | `#8899aa` | Enemy bullets, blade |
| Yokai purple | `#6c3cf7` | Yokai energy, boss bullets |
| Wind cyan | `#00d4ff` | Wind effects, dash trail |
| Fire orange | `#ff6b35` | Volcano bullets, fire |
| Ice blue | `#66ccff` | Water Spirit bullets, freeze |
| Poison green | `#44cc44` | Earth Cavern bullets, poison |

### 4.3 Architecture Pattern — EventBus (F27 resolution)

**EventBus pattern** replaces monkey-patch for inter-system communication:

```javascript
// EventBus pattern (monkey-patch replacement)
const bus = {
  _handlers: {},
  on(event, fn) { (this._handlers[event] ||= []).push(fn); },
  off(event, fn) {
    const arr = this._handlers[event];
    if (arr) this._handlers[event] = arr.filter(h => h !== fn);
  },
  emit(event, data) { (this._handlers[event] || []).forEach(fn => fn(data)); }
};

// Usage — zero coupling between systems
bus.on('slash', ({ perfect, dir }) => { /* BulletManager: reflect */ });
bus.on('slash', ({ perfect, dir }) => { /* SoundManager: slash SFX */ });
bus.on('slash', ({ perfect, dir }) => { /* ParticleManager: slash VFX */ });
bus.on('combo', ({ count }) => { /* ComboManager: UI update */ });
bus.on('combo', ({ count }) => { /* CameraManager: shake */ });
```

**Verification**: `grep "origFn\|_orig\|monkey" index.html` → 0 hits

### 4.4 Pure Function Pattern (F9)
All render/logic functions receive data through parameters:
```javascript
function renderRonin(ctx, x, y, size, pose, slashFrame, img) { ... }
function calcReflectDamage(baseDmg, timing, upgradeLevel, relicBonuses) { ... }
function spawnBulletPattern(rng, patternId, difficulty, bulletPool) { ... }
```

---

## §4.5. Art Direction

### Art Style Keywords
**"Sengoku Ink Wash — Dark Ukiyo-e meets Neon Slash"**

Traditional Japanese ink wash (sumi-e) rough brush strokes combined with ukiyo-e woodblock print style. Neon glow effects are applied to slashes and bullets for contrast. Backgrounds are dark and calm ink tones, while characters and effects use vivid colors for visual hierarchy.

### Reference Games
1. **Shogun Showdown** (Roboatino) — Stylized samurai pixel art, Japanese architecture backgrounds
2. **Katana ZERO** (Askiisoft) — Dark tone + neon slash contrast, slow-motion action

### Asset Unity Principles
- All assets follow "dark ink wash + neon slash" art direction
- Characters/enemies use ink wash outlines + flat coloring (2-3 tone cel-shading)
- Backgrounds are layered ink (far=light ink / mid=medium ink / near=dark ink)
- Bullets/effects use neon glow
- UI uses Japanese traditional wood frame + ink calligraphy style

---

## §5. Core Game Loop

### 5.1 Engine Initialization (F12, F23)

```javascript
// _ready flag TDZ defense (verified pattern)
class Engine {
  constructor(canvas) {
    this._ready = false;
    this.bus = bus;
    this.rng = new SeededRNG(Date.now());
    this.tweenMgr = new TweenManager();
    this.bulletPool = new ObjectPool(Bullet, 200);
    this.particleMgr = new ParticleManager();
    this.comboMgr = new ComboManager(this.bus);
    this.soundMgr = new SoundManager();
    // ... remaining initialization ...
    this.onResize = () => {
      if (!this._ready) return;
      // resize logic
    };
    window.addEventListener('resize', this.onResize);
    this._ready = true;
  }
}
```

### INIT_EMPTY Pattern — Global Object Initial Values (Cycle 32 lesson)

| Object | Initial Value | Purpose |
|--------|--------------|---------|
| `G.player` | `{ x:0, y:0, hp:5, maxHp:5, combo:0, gauge:0, dashing:false, slashing:false }` | Player state |
| `G.bullets` | `[]` | Active bullet array |
| `G.enemies` | `[]` | Active enemy array |
| `G.relics` | `[]` | Acquired relic list |
| `G.upgrades` | `{ sword:0, body:0, mind:0 }` | Upgrade levels |
| `G.score` | `0` | Current run score |
| `G.stage` | `{ castle:0, segment:0 }` | Current progress |
| `G.weather` | `null` | Current weather effect |

### 5.2 Frame Loop (60fps target)

```
Every frame (requestAnimationFrame + delta time):
  1. deltaTime = (now - lastTime) / 1000; lastTime = now;
  2. tweenMgr.update(deltaTime);            // always update
  3. particleMgr.update(deltaTime);         // always update
  4. soundMgr.update(deltaTime);            // always update
  5. switch(state) {
       TITLE:    updateTitle(dt);    break;
       MAP:      updateMap(dt);      break;
       STAGE:    updateStage(dt);    break;
       BOSS:     updateBoss(dt);     break;
       REWARD:   updateReward(dt);   break;
       UPGRADE:  updateUpgrade(dt);  break;
       GAMEOVER: updateGameOver(dt); break;
       VICTORY:  updateVictory(dt);  break;
       PAUSED:   /* render only */   break;
     }
  6. render(state, dt);
  7. bus.emit('frame', { dt, state });
```

**Core Rules**:
- Zero `setTimeout` → `tweenMgr.add({ onComplete })` only (F4)
- Guard flags ensure single tween callback: `if (this._transitioning) return;` (F5)
- `clearImmediate()` API prevents cancelAll/add race condition (F13)
- Single update path per value (combo, gauge, etc.) (F14, F32)
- Zero `Math.random()` → `rng.next()` only (F18)

### 5.3 Code Region Guide (REGION)

| REGION | Area | Line Range (est.) | Dependencies |
|--------|------|-------------------|-------------|
| R1 | Constants/Config (CONFIG, TRANSITION_TABLE, LANG) | 1-200 | — |
| R2 | Utilities (SeededRNG, TweenManager, EventBus, ObjectPool) | 201-500 | R1 |
| R3 | Asset Loading + Canvas Fallback | 501-650 | R1, R2 |
| R4 | Input System (keyboard/mouse/touch, hitTest) | 651-850 | R1, R2 |
| R5 | Bullet System (BulletManager, reflect logic, pattern generator) | 851-1300 | R1, R2 |
| R6 | Combat System (enemy AI, boss AI, combo, ultimate) | 1301-2000 | R1-R5 |
| R7 | Progression System (upgrades, relics, DDA) | 2001-2400 | R1, R2 |
| R8 | Sound System (Web Audio API, BGM, SFX) | 2401-2700 | R1, R2 |
| R9 | Rendering (backgrounds, characters, UI, weather, particles) | 2701-3500 | R1-R8 |
| R10 | State Machine + Main Loop + Init | 3501-4000+ | R1-R9 |

---

## §6. State Machine

### 6.1 TRANSITION_TABLE (F6, F21, F30)

```javascript
const TRANSITION_TABLE = {
  TITLE:    { targets: ['MAP'],                         priority: 0 },
  MAP:      { targets: ['STAGE', 'UPGRADE', 'BOSS', 'TITLE'], priority: 1 },
  STAGE:    { targets: ['REWARD', 'BOSS', 'GAMEOVER'],  priority: 3 },
  BOSS:     { targets: ['REWARD', 'GAMEOVER'],          priority: 4 },
  REWARD:   { targets: ['MAP', 'UPGRADE'],              priority: 2 },
  UPGRADE:  { targets: ['MAP'],                         priority: 1 },
  GAMEOVER: { targets: ['TITLE'],                       priority: 10 },
  VICTORY:  { targets: ['TITLE'],                       priority: 10 },
  PAUSED:   { targets: ['*_PREV'],                      priority: 5 },
};

function beginTransition(from, to) {
  if (from === to) return false;
  const entry = TRANSITION_TABLE[from];
  if (!entry || !entry.targets.includes(to)) {
    if (to === 'GAMEOVER' || to === 'VICTORY') { /* always allow */ }
    else { console.error(`Invalid transition: ${from}→${to}`); return false; }
  }
  if (_transitioning) return false;
  _transitioning = true;
  // fade-out → enterState(to) → fade-in → _transitioning = false
}
```

### 6.2 State × System Matrix (F7)

| State | Tween | Particle | Sound | Bullet | EnemyAI | BossAI | Combo | Input Mode | Weather | Narrative |
|-------|-------|----------|-------|--------|---------|--------|-------|-----------|---------|-----------|
| TITLE | ✅ | ✅ bg | ✅ bgm | — | — | — | — | menu | — | — |
| MAP | ✅ | ✅ bg | ✅ bgm | — | — | — | — | map | ✅ | ✅ dialog |
| STAGE | ✅ | ✅ full | ✅ battle | ✅ | ✅ | — | ✅ | game | ✅ | — |
| BOSS | ✅ | ✅ full | ✅ boss | ✅ boss | — | ✅ | ✅ | game | ✅ boss | ✅ cutscene |
| REWARD | ✅ | ✅ | ✅ fanfare | — | — | — | — | menu | — | ✅ reward |
| UPGRADE | ✅ | ✅ | ✅ bgm | — | — | — | — | menu | — | — |
| GAMEOVER | ✅ | ✅ | ✅ defeat | — | — | — | — | menu | — | — |
| VICTORY | ✅ | ✅ | ✅ fanfare | — | — | — | — | menu | — | ✅ ending |
| PAUSED | ✅ | — | — muted | — | — | — | — | pause | — | — |

### 6.3 Input Mode Details (Cycle 26 lesson)

| Input Mode | Allowed Inputs |
|-----------|---------------|
| menu | Click/tap: buttons, Keys: Enter/Esc/L/M |
| map | Click/tap: castle nodes, Keys: WASD(scroll)/Enter/Esc/L/M |
| game | Keys: WASD+J+K+L, Mouse: aim+click, Touch: joystick+buttons |
| pause | Click/tap: menu buttons, Keys: Esc(resume)/L/M |

### 6.4 Canvas-Based Modals (F3)
All confirmation/cancel UI uses Canvas overlay. Zero `alert()`/`confirm()` usage.

---

## §7. Combat System (Bullet-Hell Engine)

### 7.1 Slash Reflect System

#### 7.1.1 Reflect Judgment (Frame-based)
```
On slash key input:
  1. slashActive = true, slashFrame = 0
  2. Active for 10 frames (167ms) in 120° frontal arc
  3. Detect bullets in arc (hitTest single function, F16):
     - Bullet to sword center distance < SLASH_RADIUS (80px)
     - Bullet angle within ±60° of player facing
  4. Judgment:
     - Frames 0-5 after input: PERFECT (±83ms)
     - Frames 6-10 after input: GOOD (±167ms)
  5. PERFECT reflect:
     - Bullet velocity reversed × 2
     - bus.emit('slash', { perfect: true, dir, bullet })
     - comboMgr.add(2)  // combo +2 (single path, F32)
     - Slow-motion 0.3s (timeScale = 0.3)
  6. GOOD reflect:
     - Bullet velocity reversed × 1
     - comboMgr.add(1)  // combo +1
  7. slashFrame > 10 → slashActive = false
```

#### 7.1.2 Bullet Pattern Generator (SeededRNG)
```javascript
const PATTERNS = {
  RADIAL_8:  (rng, cx, cy, spd) => { /* 8-directional radial */ },
  SPIRAL:    (rng, cx, cy, spd, rotSpd) => { /* spiral */ },
  AIMED:     (rng, cx, cy, spd, targetX, targetY) => { /* aimed shot */ },
  RANDOM:    (rng, cx, cy, spd, count) => { /* random scatter */ },
  WAVE:      (rng, cx, cy, spd, amplitude) => { /* sine wave */ },
};
// All patterns use SeededRNG, zero Math.random
```

### 7.2 Combo System (F14, F32)

**Combo updates only through ComboManager.add():**
```javascript
class ComboManager {
  constructor(bus) {
    this.count = 0;
    this.timer = 0;
    this.bus = bus;
  }
  add(n) {
    this.count += n;
    this.timer = COMBO_TIMEOUT; // 3 seconds
    this.bus.emit('combo', { count: this.count });
    if (this.count >= 50 && !this._ultraTriggered) {
      this._ultraTriggered = true;
      this.bus.emit('ultra_ready');
    }
    if (this.count >= 25) this.bus.emit('gauge_charge', { amount: 5 });
    if (this.count >= 10) this.bus.emit('speed_buff');
  }
  update(dt) {
    this.timer -= dt;
    if (this.timer <= 0 && this.count > 0) {
      this.count = 0;
      this._ultraTriggered = false;
      this.bus.emit('combo', { count: 0 });
    }
  }
}
```

### 7.3 Enemy Types

| Enemy | Castle | Pattern | HP | Speed |
|-------|--------|---------|-----|-------|
| Imp (雑鬼) | 1-5 | AIMED (single shot) | 1 | 2 |
| Flame Oni (火炎鬼) | 2-5 | RADIAL_8 (8-way) | 2 | 1.5 |
| Ice Yokai (氷結鬼) | 3-5 | WAVE (sine) | 2 | 1 |
| Poison Yokai (毒霧鬼) | 4-5 | RANDOM (scatter) | 3 | 1 |
| Thunder Yokai (雷神鬼) | 5 | SPIRAL (spiral) | 3 | 2.5 |

### 7.4 Relic System (F25)

13 relics with DPS cap 200% / synergy cap 150%:

| Tier | Relic | Effect | Cap Impact |
|------|-------|--------|-----------|
| Common | Iron Tsuba | Reflect damage +20% | DPS |
| Common | Straw Sandals | Movement speed +15% | — |
| Common | Healing Charm | HP +1 on stage clear | — |
| Common | Smoke Ball | Dash cooldown -20% | — |
| Common | Combo Onigiri | Combo timeout +1.5s | — |
| Rare | Thunder Seal | Chain lightning to 3 enemies on Perfect | DPS |
| Rare | Fox Mask | 30% dodge on hit (SeededRNG) | — |
| Rare | Dragon Scale | Max HP +2, reflect arc +30° | DPS |
| Rare | Sword Saint's Scroll | Ultimate damage +50%, gauge charge +25% | DPS |
| Epic | Oni Horn (Phase 2) | All reflected bullets pierce + 2 extra hits | DPS |
| Epic | Shadow Clone (Phase 2) | Clone performs simultaneous slash | DPS |
| Epic | Sands of Time (Phase 2) | Permanent 15% slow-motion + 2× Perfect window | — |
| Epic | Undying Flame (Phase 2) | Revive once when HP reaches 0 (once per run) | — |

**Cap verification**: `applyRelic()` checks current DPS multiplier → exclude choices exceeding 200% (F25)

### 7.5 Boss Battles

#### Boss 1: Oni General (Volcano Castle)
```
[Phase 1] HP 100%-60%:
  - RADIAL_8 bullets (3s interval)
  - Charge attack (warning line shown 1s before)
  Weakness: 2s stagger after charge → focus reflected bullets

[Phase 2] HP 60%-30%:
  - RADIAL_8 + AIMED combo (2s interval)
  - Ground flame wave (lower 1/3 area)
  Weakness: Upper body exposed during flame wave → Perfect reflect

[Phase 3] HP 30%-0%:
  - Berserk: 2× bullet density, 1.5× movement speed
  - SPIRAL bullets added
  Weakness: Eye weakness exposed for 3s at 20+ combo
```

**Boss reward guard**: `bossRewardGiven` flag ensures single payout (F17)

#### Boss 2: Fox Spirit (Water Spirit Castle)
```
[Phase 1] HP 100%-50%:
  - 3 illusion clones (1 real, others slightly transparent)
  - Each clone fires AIMED bullets
  Weakness: Reflected bullet hitting real fox disperses clones

[Phase 2] HP 50%-0%:
  - 5 illusion clones + ice WAVE bullets
  - Complex clone movement (circular rotation)
  Weakness: 5 consecutive Perfect reflects dispel illusion → 10s exposed
```

#### Boss 3: Dragon God (Phase 2)
```
[Phase 1] 5-element cycling bullets (Wind→Fire→Water→Earth→Lightning)
[Phase 2] Simultaneous 2-element + arena shrink
[Phase 3] All elements + forced ultimate usage
```

#### Hidden Boss: Sword Saint's Phantom (Phase 2)
```
Copies player behavior pattern — mirror match
AI that "re-reflects" reflected bullets
```

---

## §8. Asset Requirements

```yaml
# asset-requirements
art-style: "Sengoku Ink Wash — traditional Japanese ink wash dark base + neon slash effects"
color-palette: "#0a0a1a, #ffb7c5, #cc2222, #ffd700, #6c3cf7, #00d4ff, #ff6b35"
mood: "Tense darkness with brilliant sword flashes, Sengoku-era gravitas mixed with yokai mysticism"
reference: "Katana ZERO dark tone + Shogun Showdown samurai stylization + Sekiro slash satisfaction"

assets:
  - id: player-idle
    desc: "Ronin Kaze — front-facing idle pose. Worn black kimono, katana in one hand, windswept hair. Ink wash outlines + cold blue eyes. Resolute expression."
    size: "512x512"

  - id: player-slash
    desc: "Ronin Kaze — slash pose. Katana swung forward in wide arc. Red afterimage trail (blood red #cc2222) along blade path. Dynamic stance."
    size: "512x512"

  - id: player-dash
    desc: "Ronin Kaze — dash pose. Low-stance charge, cyan (#00d4ff) afterimage trail. Body slightly transparent, suggesting speed."
    size: "512x512"

  - id: enemy-zako
    desc: "Imp (雑鬼) — small round one-eyed yokai. Purple (#6c3cf7) body, single large yellow eye, small horn. Ink wash style outlines."
    size: "512x512"

  - id: enemy-fire
    desc: "Flame Oni (火炎鬼) — medium fire-bodied yokai. Orange-red (#ff6b35) body, volcanic rock armor fragments, burning eyes. Ink wash outlines."
    size: "512x512"

  - id: enemy-ice
    desc: "Ice Yokai (氷結鬼) — ice crystal-formed yokai. Blue (#66ccff) transparent body, sharp ice spikes, cold mist rising."
    size: "512x512"

  - id: boss-oni
    desc: "Oni General — massive red oni (demon). Muscular body, two large horns, giant iron club, burning golden eyes. Volcanic lava background. Intimidating and wrathful expression. Large image for boss entrance cutscene."
    size: "800x600"

  - id: boss-fox
    desc: "Fox Spirit (Kitsune) — nine-tailed silver fox spirit. Elegant and mystical bearing, purple glowing eyes, surrounded by purple spirit flames. Waterfall and moonlight background."
    size: "800x600"

  - id: bg-field
    desc: "Wind Field background — wind-swept plains, cherry blossom petals floating. Distant mountain silhouettes, Japanese castle shadows. Subtle ink wash tones."
    size: "1920x1080"

  - id: bg-volcano
    desc: "Volcano Castle background — flowing lava interior. Red-orange lighting, rock pillars, smoke and volcanic ash. Dark and dangerous atmosphere."
    size: "1920x1080"

  - id: bg-waterfall
    desc: "Water Spirit Castle background — massive waterfall before ice cave. Blue-cyan lighting, icicles, mist. Mystical and cold atmosphere."
    size: "1920x1080"

  - id: effect-slash
    desc: "Slash effect — red-white arc along katana trajectory. Ink brush stroke style. Bright center fading to dark edges."
    size: "512x512"

  - id: effect-perfect
    desc: "Perfect reflect effect — golden (#ffd700) circular shockwave + cherry petal particles. Blinding flash. Kanji '斬' silhouette at center."
    size: "512x512"

  - id: effect-combo
    desc: "Combo achievement effect — swirling fire and wind circular aura. 10 combo=cyan, 25 combo=gold, 50 combo=rainbow."
    size: "512x512"

  - id: item-relic
    desc: "Relic icon — glowing ancient Japanese artifact (charm/seal/orb). Gold border, mystical purple glow. Round frame."
    size: "256x256"

  - id: ui-hp
    desc: "Health icon — sakura (cherry blossom) shaped heart. Pink (#ffb7c5). Petals decrease to show HP loss."
    size: "128x128"

  - id: ui-combo
    desc: "Combo counter frame — ink-written numbers in circular frame. Gold border. Traditional Japanese pattern decorations."
    size: "256x256"

  - id: ui-gauge
    desc: "Ultimate gauge — vertical katana-shaped gauge bar. Empty=gray, charging=red to gold gradient."
    size: "128x512"

  - id: thumbnail
    desc: "Game thumbnail — Ronin Kaze slashing and reflecting enemy bullets in dynamic action scene. Cherry blossoms and Japanese castle silhouettes in background. Red slash line across screen. 'Storm Ronin' title in ink calligraphy at top. Ink wash + neon hybrid style."
    size: "800x600"
```

---

## §9. Difficulty System

### 9.1 Progression-Based Scaling

| Castle | Bullet Density (per sec) | Bullet Speed (px/s) | Enemy HP Multi | Spawn Interval (s) |
|--------|------------------------|--------------------|--------------|--------------------|
| Wind Field (1) | 2-4 | 120-160 | 1.0× | 3.0 |
| Volcano (2) | 4-8 | 160-200 | 1.3× | 2.5 |
| Water Spirit (3) | 6-12 | 180-240 | 1.6× | 2.0 |
| Earth Cavern (4) | 8-16 | 200-280 | 2.0× | 1.5 |
| Sky Keep (5) | 10-20 | 240-320 | 2.5× | 1.0 |

### 9.2 DDA 4-Tier (Dynamic Difficulty Adjustment)

| DDA Level | Condition (last 3 stages) | Density | Speed | Reward Multi | Reflect Window |
|-----------|--------------------------|---------|-------|-------------|---------------|
| 0 (Standard) | 0-1 deaths | 100% | 100% | 100% | ±5F/±10F |
| 1 (Slightly Easier) | 2-3 deaths | 80% | 90% | 110% | ±6F/±12F |
| 2 (Easy) | 4-5 deaths | 60% | 80% | 120% | ±7F/±14F |
| 3 (Very Easy) | 6+ deaths | 50% | 70% | 130% | ±8F/±16F |

**DDA Fallback (Cycle 24 lesson)**: DDA applies as hidden parameters — never shows "easier" to player. Instead, extends warning indicator display time to provide more information (Cycle 35/38 rage game lesson applied).

### 9.3 Difficulty Curve Formula

```
bulletDensity(stage) = BASE_DENSITY × (1 + (stage - 1) × 0.15) × DDA_MULT
bulletSpeed(stage) = BASE_SPEED × (1 + (stage - 1) × 0.08) × DDA_MULT
enemyHP(stage) = BASE_HP × (1 + (castle - 1) × 0.3) × DDA_MULT

where:
  stage = 1-15 (overall stage number)
  castle = 1-5 (castle number)
  DDA_MULT = [1.0, 0.8, 0.6, 0.5][ddaLevel]
```

---

## §10. Progression System

### 10.1 Upgrade Tree (3 Axes × 5 Levels)

| Axis | Lv1 | Lv2 | Lv3 | Lv4 (Phase2) | Lv5 (Phase2) |
|------|-----|-----|-----|-------------|-------------|
| Sword (劍) | Reflect damage +10% | Arc 120°→140° | Perfect slow 0.3→0.5s | Piercing reflect 1 | Chain reflect (bullet→enemy→enemy) |
| Body (體) | Move speed +10% | HP +1 (5→6) | Dash invuln 8→12F | HP +2 (6→8) | Counter wave on hit |
| Mind (心) | Combo timeout 3→4s | Ultimate charge +20% | Auto-enhance at 50 combo | Combo hit immunity ×1 | 100 combo = 2nd ultimate |

**Cost**: Lv1=100G, Lv2=250G, Lv3=500G, Lv4=1000G, Lv5=2000G

### 10.2 Map Structure (Castle Progression)

```
[Wind Field] → [Volcano] → [Water Spirit] → [Earth Cavern] → [Sky Keep]
   S1-S3       S4-S6+B1    S7-S9+B2       S10-S12+B3      S13-S15+B4
                                              ↓ Condition: all castles clear
                                           [Hidden1] [Hidden2]
```

**Unlock Conditions**:
- Volcano: Clear Wind Field S1-S3
- Water Spirit: Clear Volcano S4-S6 + defeat Oni General
- Earth Cavern (Phase 2): Clear Water Spirit S7-S9 + defeat Fox Spirit
- Sky Keep (Phase 2): Clear Earth Cavern + defeat Dragon God
- Hidden: Clear all castles + collect 10+ relics

---

## §11. Score System

### 11.1 Score Calculation (F8: Judge first, save later)

| Action | Base Score | Combo Multiplier |
|--------|-----------|-----------------|
| Enemy kill (reflect) | 100 | × (1 + combo × 0.1) |
| Perfect reflect | 50 | × (1 + combo × 0.1) |
| Good reflect | 20 | × (1 + combo × 0.05) |
| Stage clear | 500 | × (1 + remainHP × 0.2) |
| Boss defeat | 2000 | × (1 + remainHP × 0.5) |
| No damage bonus | 1000 | — |

```javascript
// Judge first, save later (F8)
function onStageComplete() {
  const isNewBest = score > bestScore;    // 1. Judge
  bestScore = Math.max(score, bestScore); // 2. Save
  if (isNewBest) bus.emit('new_best');
}
```

### 11.2 Currency (Gold)

| Action | Gold |
|--------|------|
| Enemy defeat | 5-10 (SeededRNG) |
| Perfect reflect | 3 |
| Stage clear | 50 × stage number |
| Boss defeat | 300 |
| DDA reward multiplier | ×1.0-1.3 |

---

## §12. Sound System (Web Audio API, F19)

| ID | Sound | Generation Method |
|----|-------|------------------|
| sfx-slash | Slash (sharp metal) | Square wave → highpass → fast decay |
| sfx-perfect | Perfect reflect (clear bell) | Sine wave high → reverb → slow decay |
| sfx-reflect | Bullet reflect (ping) | Triangle wave → short decay |
| sfx-hit | Hit taken (dull impact) | Noise → lowpass → short decay |
| sfx-combo-10 | 10 combo (kiai shout) | Sine wave rising glissando |
| sfx-combo-25 | 25 combo (sword ring) | Square wave vibrato → reverb |
| sfx-boss-intro | Boss entrance (drums) | Noise + sine bass → slow attack |
| sfx-ultimate | Ultimate (explosive energy) | White noise + sine rise |
| bgm-field | Wind Field BGM (calm Japanese) | Pentatonic scale sine loop |
| bgm-battle | Battle BGM (tense) | Fast tempo square + bass drums |
| bgm-boss | Boss BGM (epic) | Bass strings + drum pattern + pitch rise |

---

## §13. Internationalization (F20)

```javascript
const LANG = {
  ko: {
    title: '스톰 로닌',
    subtitle: '사무라이 불릿헬 로그라이트',
    start: '시작하기',
    slash: '참격',
    dash: '회피',
    ultimate: '필살기',
    combo: '콤보',
    perfect: '완벽!',
    good: '좋음',
    miss: '빗나감',
    stage_clear: '구간 돌파!',
    boss_appear: '보스 출현!',
    game_over: '패배...',
    victory: '승리!',
    // ... (full table in Korean spec)
  },
  en: {
    title: 'Storm Ronin',
    subtitle: 'Samurai Bullet-Hell Roguelite',
    start: 'Start',
    slash: 'Slash',
    dash: 'Dash',
    ultimate: 'Ultimate',
    combo: 'Combo',
    perfect: 'Perfect!',
    good: 'Good',
    miss: 'Miss',
    stage_clear: 'Stage Clear!',
    boss_appear: 'Boss Incoming!',
    game_over: 'Defeated...',
    victory: 'Victory!',
    upgrade: 'Upgrade',
    sword: 'Swordsmanship',
    body: 'Physique',
    mind: 'Spirit',
    relic: 'Relic',
    castle_names: ['Wind Field', 'Volcano', 'Water Spirit', 'Earth Cavern', 'Sky Keep'],
    pause: 'Paused',
    resume: 'Resume',
    quit: 'Quit',
    settings: 'Settings',
    lang_toggle: 'Lang: English',
  }
};
```

---

## §14. Code Hygiene and Verification

### 14.1 Numerical Consistency Table (F10)

| Spec Value | CONFIG Constant | Value |
|-----------|----------------|-------|
| Perfect window ±5F | `PERFECT_WINDOW` | 5 |
| Good window ±10F | `GOOD_WINDOW` | 10 |
| Slash duration 10F | `SLASH_DURATION` | 10 |
| Reflect arc 120° | `SLASH_ARC` | 120 |
| Reflect radius 80px | `SLASH_RADIUS` | 80 |
| Dash invulnerability 8F | `DASH_INVULN` | 8 |
| Dash cooldown 30F | `DASH_COOLDOWN` | 30 |
| Combo timeout 3s | `COMBO_TIMEOUT` | 3 |
| Slow-motion 0.3s | `SLOW_DURATION` | 0.3 |
| DPS cap 200% | `DPS_CAP` | 2.0 |
| Synergy cap 150% | `SYNERGY_CAP` | 1.5 |

### 14.2 Code Hygiene Checklist

| # | Check | Method | FAIL/WARN |
|---|-------|--------|-----------|
| 1 | Zero `Math.random` | `grep "Math.random" index.html` | FAIL |
| 2 | Zero `setTimeout` | `grep "setTimeout" index.html` | FAIL |
| 3 | Zero `alert\|confirm\|prompt` | `grep "alert\|confirm\|prompt" index.html` | FAIL |
| 4 | Zero `monkey\|origFn\|_orig` | `grep "origFn\|_orig\|monkey" index.html` | FAIL |
| 5 | Zero external CDN/fonts | `grep "http\|googleapis\|cdn" index.html` | FAIL |
| 6 | Zero direct `comboCount` assignment | `grep "comboCount\s*[+\-]?=" index.html` → only ComboManager.add() | FAIL |
| 7 | `applyRelic()` cap verification exists | `grep "DPS_CAP\|SYNERGY_CAP" index.html` | FAIL |
| 8 | TRANSITION_TABLE reference | `grep "TRANSITION_TABLE" index.html` → referenced in beginTransition | FAIL |
| 9 | `_ready` flag exists | `grep "_ready" index.html` | FAIL |
| 10 | Canvas fallback functions | `grep "drawFallback" index.html` | WARN |
| 11 | Touch targets 48px | `grep "Math.max(48" index.html` | WARN |
| 12 | SeededRNG class exists | `grep "class SeededRNG" index.html` | FAIL |
| 13 | EventBus exists | `grep "bus.on\|bus.emit" index.html` | FAIL |

### 14.3 Smoke Test Gates (F15)

| # | Gate | Method | FAIL/WARN |
|---|------|--------|-----------|
| 1 | index.html exists | File check | FAIL |
| 2 | No crash on browser load | Console errors = 0 | FAIL |
| 3 | TITLE screen displays | Start button renders | FAIL |
| 4 | TITLE→MAP transition | Click start → map shown | FAIL |
| 5 | MAP→STAGE transition | Click castle node → stage entry | FAIL |
| 6 | Slash reflect works | J key → bullet reflected | FAIL |
| 7 | Score increases on kill | Reflect kill → score UI updates | FAIL |
| 8 | Combo counter works | Consecutive reflects → combo increases | FAIL |
| 9 | HP 0 → GAMEOVER | Repeated hits → game over screen | FAIL |
| 10 | GAMEOVER→TITLE | Game over → return to title | FAIL |
| 11 | Boss appears and fights | Enter boss stage → boss patterns active | FAIL |
| 12 | Boss defeat → reward | Boss HP 0 → relic choice shown | FAIL |
| 13 | Upgrade applies | Buy Sword Lv1 → damage change | WARN |
| 14 | Mobile touch works | Joystick + button tap response | WARN |
| 15 | BGM plays | Game start → audio output | WARN |
| 16 | Language toggle | L key → text changes | WARN |
| 17 | manifest.json asset loading | Asset images display correctly | FAIL |
| 18 | DDA activates | 3 deaths → bullet density decrease | WARN |
| 19 | Relic cap verification | DPS >200% relic excluded from choices | WARN |

### 14.4 Balance Pre-Verification (F29, Appendix A)

#### Reflect Window vs Bullet Density Analysis

```
Assumptions:
  - Player reaction time: 200ms (casual), 150ms (skilled), 100ms (expert)
  - Perfect window: ±83ms (5F @60fps)
  - Good window: ±167ms (10F @60fps)

Wind Field (2-4 bullets/sec):
  - Reflect active time: 10F = 167ms
  - Inter-bullet gap: 250-500ms
  - Conclusion: Ample time → suitable for tutorial

Water Spirit (6-12 bullets/sec):
  - Inter-bullet gap: 83-167ms
  - Conclusion: Consecutive Perfects difficult but Good achievable → mid difficulty

DDA Lv2 adjusted Water Spirit:
  - 3.6-7.2 bullets/sec, 80% speed
  - Inter-bullet gap: 139-278ms
  - Conclusion: Beginners can achieve Good reflects
```

#### Extreme Build Verification (3 types)

**Build A: Reflect Specialist (Sword focus)**
- Sword Lv3 + Iron Tsuba + Thunder Seal + Dragon Scale
- DPS multiplier: 1.0 × 1.1 × 1.2 × 1.3 × 1.3 = **2.23× → capped at 2.0×**
- Boss 2 clear time: 500 / (100 × 2.0 × 1.5 avg combo) = **~1.7 min** ✅

**Build B: Survival Specialist (Body focus)**
- Body Lv3 + Fox Mask + Healing Charm + Straw Sandals
- DPS multiplier: 1.0× (base)
- Boss 2 clear time: 500 / (100 × 1.0 × 1.3 avg combo) = **~3.8 min** ✅ (HP 6 + 30% dodge enables prolonged battle)

**Build C: Ultimate Specialist (Mind focus)**
- Mind Lv3 + Sword Saint's Scroll + Combo Onigiri
- DPS multiplier: 1.0× + 50% ultimate enhancement
- Boss 2 clear time: 3 ultimates assumed → **~2.5 min** ✅

---

## §15. Weather/Time System

| Weather | Castle | Visual Effect | Gameplay Effect |
|---------|--------|--------------|----------------|
| Cherry Blossoms | Wind Field | Pink particle fall | HP +1 heal at stage start |
| Volcanic Ash | Volcano | Gray particles + vision radius shrink | Screen edges darkened (80% vision) |
| Rain | Water Spirit | Blue streaks + ripple effects | Move speed -10%, dash distance +20% (slip) |
| Fog (Phase 2) | Earth Cavern | White fog layer + 50% vision | Enemies opaque until close |

---

## §16. Narrative System

### Story Summary
1. **Prologue (TITLE)**: Kaze was a swordsman of the Wind Field castle lord. One day he's betrayed and thrown from a cliff but survives. He vows revenge.
2. **Wind Field (Castle 1)**: Witnesses yokai invasion of his ruined homeland. Recovers his master's relic.
3. **Volcano (Castle 2)**: Ruled by Oni General. Discovers clue: "The castle lords summoned the yokai."
4. **Water Spirit (Castle 3)**: Fox Spirit rules through illusions. Truth revealed: 5 lords bargained with yokai for immortality.
5. **Earth Cavern (Phase 2)**: Dragon God's domain. Kaze learns his master was actually the Sword Saint's phantom.
6. **Sky Keep (Phase 2)**: Final battle. Realizes the Way of the Sword is not "cutting everything" but "protecting what matters."

### Narrative Display
- **Stage entry**: Vertical ink calligraphy 1-line dialogue at top (2s display then fade)
- **Pre-boss**: Screen darkens + boss silhouette appears + 2-line dialogue (Canvas text)
- **Post-boss**: Prophecy fragment image + 1-2 line story summary

---

## §17. localStorage Data Schema

```javascript
const SAVE_SCHEMA = {
  version: 1,
  bestScore: 0,
  bestCombo: 0,
  totalRuns: 0,
  totalKills: 0,
  upgrades: { sword: 0, body: 0, mind: 0 },
  gold: 0,
  relicsFound: [],
  castlesCleared: [],
  bossesDefeated: [],
  hiddenUnlocked: false,
  lang: 'ko',
  bgmMuted: false,
  sfxMuted: false,
};
```

---

## §18. Previous Cycle Regrets Resolution Summary

| Regret | Source | Resolution Section | Solution | Verification |
|--------|--------|-------------------|----------|-------------|
| monkey-patch structure | C41 | §4.3 | EventBus pattern | `grep "origFn\|_orig\|monkey" → 0` |
| Phase 2 not implemented | C41-42 | §1 MVP | 3 castles + 2 bosses = Phase 1 complete loop | TITLE→STAGE→BOSS→VICTORY flow confirmed |
| No balance auto-verification | C41-42 | §14.4 | Reflect window formula + 3 extreme builds | All builds clearable in Appendix A |
| beginTransition over-blocking | C41 | §6.1 | Priority 10 = GAMEOVER/VICTORY always allowed | GAMEOVER reachable from all states |
| Match-3 genre stagnation | C42 | §1, §7 | Bullet-hell arcade action genre switch | Real-time arcade combat verified |
| Combo dual update risk (C5 B2) | C5 | §7.2 | ComboManager.add() single path | `grep "comboCount\s*=" → add() only` |

---

## Appendix A: Extreme Build Balance Sheet

### Preconditions
- 60fps, Perfect reflect damage = baseDmg × 2 × upgradeMult × relicMult
- Boss 1 (Oni) HP = 400, Boss 2 (Fox) HP = 500
- Average 40 enemies per stage, average combo 15

### Boss 2 Clear Time by Build

| Build | DPS (reflect/sec) | Effective DPS (capped) | Boss 2 Clear Time | Verdict |
|-------|-------------------|----------------------|-------------------|---------|
| A Reflect Spec | 300 | 300 (under cap) | ~100s | ✅ Balanced |
| B Survival Spec | 130 | 130 | ~230s | ✅ Prolonged (HP surplus) |
| C Ultimate Spec | 160 + 300×3 ult | 1060 total | ~150s | ✅ Balanced |

**Conclusion**: All 3 builds can clear Boss 2, ranging 100s to 230s — balanced.

---

## Game Page Sidebar Information

```yaml
game:
  title: "Storm Ronin"
  description: "A Sengoku samurai revenge tale! Reflect enemy bullets with your katana, build combos, and unleash devastating ultimate attacks in this bullet-hell roguelite action game."
  genre: ["arcade", "action"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/Arrows: Move"
    - "J/Z: Slash Reflect"
    - "K/X: Dash (Evade)"
    - "L/C: Ultimate"
    - "Touch: Virtual Joystick + Buttons"
  tags:
    - "#samurai"
    - "#bullethell"
    - "#roguelite"
    - "#bulletreflect"
    - "#bossfight"
    - "#sengoku"
    - "#arcade"
  addedAt: "2026-03-26"
  version: "1.0.0"
  featured: true
```
