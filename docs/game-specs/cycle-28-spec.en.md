---
game-id: neon-pulse
title: Neon Pulse
genre: arcade, casual
difficulty: medium
---

# Neon Pulse — Cycle #28 Game Design Document

> **One-Page Summary**: A **rhythm arcade roguelite** where you defeat enemies to the beat and conquer neon dungeons. Procedural BPM-synced combat with Perfect/Great/Good/Miss timing judgements to attack enemies, chain consecutive Perfects for explosive score multipliers. 5 music zones (Synthwave/Dubstep/Lo-fi/Drum&Bass/Glitch) × 3 stages = 15 base stages + 2 hidden stages (Remix Zone, True Silence) = **17 total stages**. 5 zone bosses + hidden boss "Void DJ" = **6 bosses**. 3-pick sound chip (relic) selection between waves (common 6/rare 4/epic 3 = 13 types), 3-tree permanent upgrades (Rhythm/Power/Flow), SeededRNG for beat patterns & enemy placement, 3-tier difficulty (Beginner/DJ/Maestro), DDA dynamic balancing, bilingual (KO/EN). **Strengthens arcade+casual combo from 1→2 games**, inheriting the Poki 2026.3 success formula of "one-touch controls + high replayability".

> **MVP Boundary**: Phase 1 (core loop: beat judgement → attack → combo → enemy defeat → reward, zones 1~2 + 2 bosses + basic upgrade tree + 6 sound chips) + Phase 2 (zones 3~5 + 3 bosses + hidden boss + full narrative + challenge mode + 7 more chips). Phase 1 must deliver a complete game experience on its own.

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (see platform-wisdom) ✅
> Items below have been verified across 20+ cycles and are detailed in platform-wisdom.md. Only **applied sections** are noted here.

| ID | Lesson Summary | Applied §§ |
|----|---------------|-----------|
| F1 | No assets/ directory — 11 consecutive cycles clean [Cycle 1~27] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm()/alert() in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] — 17 consecutive target | §5.2 |
| F5 | Guard flag for single-fire tween callbacks [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system [Cycle 3 B2] | §6.1 |
| F7 | State × System matrix mandatory [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numeric parity table (spec=code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target min 48×48px + Math.max enforce [Cycle 22] | §3.3 |
| F12 | TDZ prevention: declare → DOM assign → events order [Cycle 5] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path per value (tween vs direct assign) [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22] | §14.3 |
| F16 | hitTest() single function integration [Cycle 27 F60] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG full usage (0 Math.random) [Cycle 27] | §5.2, §14.3 |

### New Feedback (from Cycle 27 Post-mortem) 🆕

| ID | Lesson | Solution | Applied §§ |
|----|--------|----------|-----------|
| F65 | 4-round review cycle — assets/ illegal SVGs + dead code + swipe defect + touch height all found simultaneously (Cycle 27) | **14-item smoke test gate**: asset check + dead code check + input mode check + UI size check run immediately after coding. Target: APPROVED within 2 rounds | §14.3 |
| F66 | Common engine extraction unstarted for 27 cycles — 4,238-line single HTML maintenance limit (Cycle 27) | **10 REGION structure + dependency direction + estimated line ranges**. TweenManager/ObjectPool/SoundManager/InputManager isolated in R2 for future extraction | §5.3 |
| F67 | No automated balance verification — vast combination space unverified (Cycle 27) | Rhythm game has simpler combo space than match-3 RPG: BPM×density×chipEffect. DPS/EHP formula + chip cumulative cap (DPS 200%, synergy 150%) + DDA 3-level fallback | §8.1, §8.2 |
| F68 | assets/ 1st-round recurrence — recurring after 10 consecutive clean cycles (Cycle 27) | Max-strength zero-asset policy: `new Image()` 0, `fetch()` file ref 0, external URL 0 as FAIL gate #1 | §4.1, §14.3 #1 |
| F69 | Hit area/drawing coordinate separation legacy incomplete (Cycle 27) | hitTest(x, y, rect) single function for all click/touch judgements. Drawing coords and hit areas share same rect object | §3.3, §14.2 |
| F70 | BPM sync combat: dual update path risk for tween + BPM (new) | Apply Cycle 5 B2 lesson: BPM managed via `G.bpm` single variable, tween-only updates. Zero direct assignment | §5.2, §7.1 |

### Previous Cycle Pain Points Resolution Summary (Cycle 27 Post-mortem)

| Pain Point | Resolution §§ | Solution | Verification |
|-----------|--------------|----------|-------------|
| 4-round review cycle | §14.3 | 14-item smoke test gate | APPROVED within 2 rounds |
| Common engine unstarted | §5.3 | 10 REGION dependency direction | Zero circular refs, extractable |
| No balance verification | §8.1, §8.2 | DPS/EHP formula + chip caps + DDA | Extreme builds still clearable |
| assets/ 1st-round recurrence | §4.1, §14.3 | FAIL gate #1 highest priority | Zero asset violations in 1st review |
| Hit area separation incomplete | §3.3, §14.2 | hitTest() + shared rect management | Zero hit area offset bugs |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
Neon Pulse is a **rhythm arcade roguelite** where players defeat enemies to the beat and conquer neon dungeons. Using Web Audio API procedurally generated BPM-synced beats, attacking/dodging on beat earns bonus damage and combo multipliers. The three pillars of fun: **rhythm timing satisfaction**, **arcade instant feedback**, and **roguelite build diversity**.

### 1.2 Three Pillars of Fun
1. **Beat Combat (Feel the Beat)**: Beat markers flow along a lane at the bottom → timing input yields Perfect(±50ms)/Great(±100ms)/Good(±150ms)/Miss 4-tier judgement. Consecutive Perfects = combo multiplier surge + full-screen neon glow pulse effect.
2. **One-Touch Action**: Single key (Space/↑) or screen tap to attack. Left/right (←→/swipe) to dodge. Intuitive controls with deep timing strategy.
3. **Roguelite Build**: 3-pick sound chip (relic) selection after zone clear for different builds each run. "Combo specialist", "dodge specialist", "power specialist" — multiple strategy paths.

### 1.3 Story/Narrative
- **Setting**: The digital audio dimension "Pulse Nexus" has been infected by the virus "Silence", distorting all beats. The last DJ "Neon" must purify 5 music zones with the power of beats to save the dimension.
- **Zone Stories**: Each zone has records from pre-infection guardian DJs. Synthwave's "Retro", Dubstep's "Wobble", Lo-fi's "Chill", D&B's "Break", Glitch's "Error". Short text dialogues between stages (Canvas-rendered, 3 lines).
- **Ending Branches**:
  - 5 zones purified → **"Beat Revival"** Normal Ending: Silence defeated, music returns to Pulse Nexus.
  - Hidden boss "Void DJ" defeated → **"Eternal Beat"** True Ending: Silence was actually a system process trying to clean overloaded beats; Neon creates new harmony for true balance.
- **Story Delivery**: Guardian DJ records between stages (3 lines + background effects), boss entrance/defeat cutscenes (Canvas camera zoom + dialogue 5s), hidden boss epilogue (scrolling text 10s).

### 1.4 Genre Enhancement
- **arcade + casual = 1→2 games** (minimum frequency combo strengthened)
- arcade total: 10→11, casual total: 7→8
- Fully differentiated from existing arcade+casual (neon-dash-runner: simple endless runner): rhythm combat + roguelite progression — entirely different core mechanics

---

## §2. Game Rules & Objectives

### 2.1 Core Rules
- **Beat Lane Combat**: Beat markers flow left→right along lane at screen bottom. Attack input when marker reaches judgement line
- **Timing Judgement**: Perfect(±50ms) = 150% damage + combo maintained, Great(±100ms) = 120% damage + combo maintained, Good(±150ms) = 100% damage + combo reset, Miss = 0% damage + combo reset + enemy attacks
- **Combo Multiplier**: Consecutive Perfect/Great → combo counter++ → 1 + (combo × 0.1) multiplier (max ×3.0 = 20 combo)
- **Player HP**: Initial 100. Miss = enemy attack reduces HP. HP 0 → Game Over
- **Enemy HP**: Each enemy has HP, reduced by judgement damage × combo multiplier
- **Permanent Progression**: Beat Crystals earned on game over are preserved → invest in permanent upgrades

### 2.2 Beat Types

| Beat Type | Visual | Input | Effect |
|----------|--------|-------|--------|
| Basic | ● (solid) | Space/tap | Basic attack |
| Double | ●● (consecutive) | Double tap | 2-hit attack, both Perfect = bonus |
| Hold | ●━━ (long) | Hold press | Sustained damage, duration-proportional multiplier |
| Dodge | ◆ (diamond) | ←/→ or swipe | Dodge enemy attack, success = counter chance |
| Boss | ★ (star) | Varies | Boss-exclusive, requires pattern memorization |

### 2.3 Zone Structure

| Zone | Theme | BPM Range | Stages | Boss |
|------|-------|-----------|--------|------|
| 1. Synthwave | 80s Retro | 100~120 | 3 | DJ Retro (hold specialist) |
| 2. Dubstep | Bass Drop | 120~140 | 3 | DJ Wobble (double + bass drop phases) |
| 3. Lo-fi | Chill Hip-hop | 80~100 | 3 | DJ Chill (slow BPM + irregular timing) |
| 4. Drum & Bass | High-speed Drums | 150~174 | 3 | DJ Break (ultra-fast combos + break sections) |
| 5. Glitch | Glitch Art | 100~160 (variable) | 3 | DJ Error (real-time BPM shift + reversed patterns) |
| H1. Remix Zone | Mixed | Variable | 1 | — (Survival) |
| H2. True Silence | Silent | 0→200 gradual | 1 | Void DJ (all patterns combined + silent sections) |

### 2.4 Win/Lose Conditions
- **Victory**: Defeat all enemies in current stage (reduce HP to 0)
- **Defeat**: Player HP 0 → Game Over, earned Beat Crystals preserved
- **Zone Clear**: 3 stages + boss clear → next zone unlocked
- **True Ending**: Clear 5 zones → unlock 2 hidden zones → defeat Void DJ

---

## §3. Controls

### 3.1 Keyboard Controls
| Key | Action |
|-----|--------|
| Space / ↑ / W | Beat attack (basic/double/boss beat) |
| Space (hold) | Hold beat sustain |
| ← / A | Dodge left |
| → / D | Dodge right |
| P / Escape | Pause |
| Enter | Confirm (menu/selection) |
| 1/2/3 | Sound chip selection (3-pick screen) |

### 3.2 Touch/Mouse Controls
| Input | Action |
|-------|--------|
| Screen tap | Beat attack |
| Screen long press | Hold beat sustain |
| Swipe left | Dodge left |
| Swipe right | Dodge right |
| Pause button tap | Pause |
| Chip card tap | Sound chip selection |

### 3.3 UI Size & Hit Area Rules
- All touch buttons: `Math.max(CONFIG.MIN_TOUCH, computedH)` applied (CONFIG.MIN_TOUCH = 48px)
- Hit area judgement: **hitTest(x, y, rect)** single function (F16, F60, F69)
- Drawing coordinates and hit areas share the same rect object `{ x, y, w, h }`
- Pause button: minimum 48×48px, fixed top-right
- Beat judgement area: bottom 20% of screen (wide touch zone)
- Swipe recognition: 30px+ horizontal movement within 200ms

---

## §4. Visual Style Guide

### 4.1 Asset Policy (F1, F2, F61, F68)
- **No assets/ directory** — 12 consecutive clean cycles target
- **100% Canvas procedural rendering** — all characters, enemies, backgrounds, UI generated in code
- `new Image()` = 0, `fetch()` file references = 0, external URLs = 0
- No Google Fonts or external CDN — system fonts + Canvas fillText only

### 4.2 Color Palette

| Zone | Main Color | Sub Color | Glow | Background |
|------|-----------|-----------|------|------------|
| Synthwave | #FF6EC7 (Pink) | #7B68EE (Purple) | #FF69B4 | #1A0033 (Deep Purple) |
| Dubstep | #00FFFF (Cyan) | #0066FF (Blue) | #00BFFF | #000D1A (Deep Navy) |
| Lo-fi | #90EE90 (Mint) | #FFD700 (Gold) | #98FB98 | #0D1A0D (Deep Green) |
| Drum & Bass | #FF4500 (Orange) | #FFD700 (Gold) | #FF6347 | #1A0D00 (Deep Amber) |
| Glitch | #FF0000 (Red) | #00FF00 (Green) | #FFFFFF | #0A0A0A (Glitch Dark) |
| Common UI | #FFFFFF (White) | #888888 (Gray) | — | — |

### 4.3 Character Visuals (Procedural Canvas)

#### Player "Neon"
- **Base Form**: Human silhouette with headphones (60×80px base)
- **8 Poses**: Idle (2-frame breathing), Attack (3-frame punch), Dodge Left (2-frame slide), Dodge Right (2-frame slide), Hold (charge effect), Perfect Reaction (glow burst), Hit, Defeat
- **Neon Glow**: Double strokeStyle outline + globalAlpha 0.5 glow layer
- **Combo State**: At combo 5+ glow color changes to zone main color + particle emission

#### Regular Enemies (5 types)
1. **Beat Slime (Synthwave)**: Musical note shape + pulse animation
2. **Bass Bot (Dubstep)**: Speaker shape + low-frequency vibration effect
3. **Noise Sprite (Lo-fi)**: Cassette tape shape + noise grain
4. **Drum Drone (D&B)**: Drumstick cross shape + high-speed rotation
5. **Glitch Unit (Glitch)**: Broken pixel shape + random position jitter

#### Bosses (6)
- **Common**: 2.5× larger than regular enemies (150×200px), dedicated entrance cutscene (zoom-in)
- Boss-specific unique forms: DJ turntable/speaker stack/record player music equipment motifs
- **Void DJ (Hidden Boss)**: 4× size (240×320px), all zone colors alternating flash effect

### 4.4 Drawing Function Standard Signatures (F9)
All drawing functions follow pure function pattern with no global variable references:
```
drawPlayer(ctx, x, y, size, pose, glowColor, comboLevel)
drawEnemy(ctx, x, y, size, type, hp, maxHp, animFrame)
drawBoss(ctx, x, y, size, bossId, phase, hp, maxHp, animFrame)
drawBeatLane(ctx, x, y, w, h, beats, currentTime, bpm)
drawJudgement(ctx, x, y, type, alpha)
drawComboCounter(ctx, x, y, combo, multiplier)
drawBackground(ctx, w, h, zone, scrollOffset, time)
drawParticle(ctx, x, y, size, color, alpha, rotation)
drawUI(ctx, w, h, hp, maxHp, score, combo, zone, stage)
drawChipCard(ctx, x, y, w, h, chip, selected, alpha)
```

### 4.5 Background Visuals
- **3-Layer Parallax**: Stars/neon lines (slow) → City silhouette/waveforms (medium) → Beat particles (fast)
- **Zone-specific Environment Effects**:
  - Synthwave: Retro grid floor + sunset gradient
  - Dubstep: Waveform ripples + speaker cone vibration
  - Lo-fi: Rain on window + VHS noise overlay
  - D&B: Spinning record plate + energy waves
  - Glitch: Screen split/invert/distortion glitch art
- **Beat-synced Pulse**: Background brightness ±15% pulse on each beat
- **Camera Effects**: Boss entrance zoom-in (1.0→1.5 scale, 0.5s), boss defeat zoom-out (1.5→1.0, 1s)

### 4.6 Canvas Resolution
- `devicePixelRatio` applied: actual render resolution = CSS size × dpr
- Dynamic resize: `window.resize` event + `resizeCanvas()` call
- Minimum resolution: 320×480, maximum: unlimited (dynamic scaling)
- Rendering coordinates: logical coords (800×600 base) → actual pixel conversion

---

## §5. Code Structure & Core Systems

### 5.1 Initialization Order (F12)
TDZ prevention — must follow this order:
```
1. Global constants/CONFIG declaration
2. Utility class definitions (SeededRNG, TweenManager, ObjectPool, SoundManager, InputManager)
3. Game state variable declaration (let G = { ... })
4. DOM element assignment (canvas, ctx)
5. Event listener registration (resize, input)
6. Game loop start (requestAnimationFrame)
```

### 5.2 Core Engine Systems

#### SeededRNG (F18)
- `G.rng = new SeededRNG(seed)` — all randomness via `G.rng.next()`
- **Zero Math.random strings** — smoke test FAIL gate

#### TweenManager (F4, F5, F13, F14)
- Zero setTimeout — 17 consecutive cycles target
- `clearImmediate()` API: prevents cancelAll/add race condition
- Guard flag pattern: `if (G._transitioning) return;` for single-fire guarantee
- **BPM managed via `G.bpm` single variable only** (F70): tween-only updates, zero direct assignment

#### ObjectPool
- 3 pools: particles, beat markers, judgement effects
- `acquire()` / `release()` pattern, try-catch wrapped

#### SoundManager (Web Audio API)
- **Procedural BGM**: Zone-specific BPM + scale patterns
- **8+ Sound Effects**: Beat hit (Perfect/Great/Good), Combo (5/10/20), dodge success, boss entrance, level up, chip acquired, hit, game over
- **BPM Sync**: `audioCtx.currentTime`-based beat scheduling
- Native scheduling via `oscillator.start(ctx.currentTime + delay)` instead of setTimeout

#### InputManager
- hitTest(x, y, rect) single function (F16, F69)
- Keyboard/mouse/touch unified
- Swipe recognition: `{ startX, startY, startTime }` → judgement on end

### 5.3 Code Region Guide (10 REGIONs)

| REGION | Content | Est. Lines | Dependencies |
|--------|---------|-----------|-------------|
| R1 — CONFIG | Constants, numeric tables, i18n strings | 1~250 | None |
| R2 — ENGINE | SeededRNG, TweenManager, ObjectPool, SoundManager, InputManager | 251~700 | R1 |
| R3 — ENTITY | Player, enemies, bosses, beat markers, particles | 701~1000 | R1 |
| R4 — DRAW | All drawing functions (§4.4 signatures) | 1001~1500 | R1 |
| R5 — RHYTHM | Beat generation, BPM sync, timing judgement logic | 1501~1800 | R1, R2 |
| R6 — COMBAT | Combat logic, damage calculation, combo system | 1801~2050 | R1~R5 |
| R7 — ROGUELITE | Sound chip system, upgrade tree, progression | 2051~2300 | R1~R3 |
| R8 — STATE | Game state machine, transitions, UI | 2301~2550 | R1~R7 |
| R9 — SAVE | localStorage persistence, language switching | 2551~2650 | R1 |
| R10 — MAIN | Game loop, initialization, event binding | 2651~2800+ | R1~R9 |

**Dependency Direction Rule** (F66): R(n) may only reference R(1~n-1). Zero circular references.

---

## §6. Game State Machine

### 6.1 State Definitions & Priority (F6)

| State | Priority | Description | RESTART_ALLOWED |
|-------|---------|-------------|-----------------|
| BOOT | 0 | Initial loading | — |
| TITLE | 1 | Title screen | — |
| DIFFICULTY_SELECT | 2 | Difficulty selection | — |
| ZONE_MAP | 3 | Zone map selection | — |
| STAGE_INTRO | 4 | Stage entry animation | — |
| PLAYING | 5 | Beat combat active | — |
| BOSS_INTRO | 6 | Boss entrance cutscene | — |
| BOSS_FIGHT | 7 | Boss combat | — |
| BOSS_DEFEAT | 8 | Boss defeat animation | — |
| CHIP_SELECT | 9 | Sound chip 3-pick | — |
| STAGE_CLEAR | 10 | Stage clear results | — |
| ZONE_CLEAR | 11 | Zone clear + story | — |
| UPGRADE | 12 | Permanent upgrade screen | — |
| NARRATIVE | 13 | Story text display | — |
| PAUSE | 50 | Paused | ✅ (from PLAYING, BOSS_FIGHT) |
| GAMEOVER | 90 | Game Over | ✅ (→ TITLE) |
| VICTORY | 91 | Full clear | ✅ (→ TITLE) |
| HIDDEN_ENDING | 92 | True ending | ✅ (→ TITLE) |

### 6.2 State × System Matrix (F7)

| State | Tween | Input | Sound | Rhythm | Combat | Roguelite | DDA | Draw | Particle |
|-------|-------|-------|-------|--------|--------|-----------|-----|------|----------|
| BOOT | — | — | — | — | — | — | — | ✅ | — |
| TITLE | ✅ | menu | ✅ bgm | — | — | — | — | ✅ | ✅ |
| DIFFICULTY_SELECT | ✅ | menu | ✅ | — | — | — | — | ✅ | ✅ |
| ZONE_MAP | ✅ | menu | ✅ | — | — | — | — | ✅ | ✅ |
| STAGE_INTRO | ✅ | skip | ✅ | — | — | — | — | ✅ | ✅ |
| PLAYING | ✅ | game | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| BOSS_INTRO | ✅ | skip | ✅ sfx | — | — | — | — | ✅ | ✅ |
| BOSS_FIGHT | ✅ | game | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| BOSS_DEFEAT | ✅ | skip | ✅ sfx | — | — | — | — | ✅ | ✅ |
| CHIP_SELECT | ✅ | card | ✅ | — | — | ✅ | — | ✅ | ✅ |
| STAGE_CLEAR | ✅ | menu | ✅ | — | — | ✅ | — | ✅ | ✅ |
| ZONE_CLEAR | ✅ | skip | ✅ | — | — | ✅ | — | ✅ | ✅ |
| UPGRADE | ✅ | menu | ✅ | — | — | ✅ | — | ✅ | — |
| NARRATIVE | ✅ | skip | ✅ | — | — | — | — | ✅ | — |
| PAUSE | ✅ | pause | — | — | — | — | — | ✅ | — |
| GAMEOVER | ✅ | modal | ✅ sfx | — | — | — | — | ✅ | ✅ |
| VICTORY | ✅ | modal | ✅ bgm | — | — | — | — | ✅ | ✅ |
| HIDDEN_ENDING | ✅ | skip | ✅ bgm | — | — | — | — | ✅ | ✅ |

**Input Mode Granularity** (Cycle 26 lesson):
- `menu`: Arrow keys/click for menu item selection
- `game`: Beat attack + dodge inputs active
- `card`: Sound chip card 3-pick tap/click
- `skip`: Tap/Enter to skip cutscene
- `pause`: Resume/Quit selection
- `modal`: Confirm button only

---

## §7. Core Game Loop

### 7.1 Beat System (F70)

#### 7.1.1 BPM Sync Engine
```
beatInterval = 60000 / G.bpm (milliseconds)
beatTimestamp[n] = stageStartTime + n × beatInterval
currentBeatIndex = floor((currentTime - stageStartTime) / beatInterval)
```

- BPM managed via **G.bpm single variable** only (F14, F70)
- Zone transition BPM change: `tw.add({ target: G, prop: 'bpm', from: oldBpm, to: newBpm, dur: 2000 })`
- Zero direct `G.bpm = xxx` assignments (smoke test check)

#### 7.1.2 Beat Pattern Generation (SeededRNG)
- Each stage's beat pattern is procedurally generated via `G.rng`
- **Beat Density** (beats per second): per-zone/stage CONFIG table reference
- **Beat Type Ratio**: Basic 60%, Double 15%, Hold 15%, Dodge 10% (zone variations)
- Boss fights: fixed pattern sequences + seeded random variations

#### 7.1.3 Timing Judgement Algorithm
```
inputTime = user input timestamp
nearestBeat = closest beat timestamp
delta = abs(inputTime - nearestBeat)

if delta <= 50:  PERFECT (150% dmg, combo++)
elif delta <= 100: GREAT (120% dmg, combo++)
elif delta <= 150: GOOD (100% dmg, combo=0)
else: MISS (0% dmg, combo=0, player.hp -= enemy.atk)
```

### 7.2 Frame Loop (60fps target)
```
gameLoop(timestamp):
  1. rawDt = timestamp - lastTimestamp
  2. dt = Math.min(rawDt, 33.33)  // 2-frame skip cap
  3. lastTimestamp = timestamp
  4. InputManager.poll()
  5. TweenManager.update(dt)
  6. switch(G.state):
     PLAYING / BOSS_FIGHT:
       a. SoundManager.updateBGM(dt)
       b. RhythmEngine.update(dt)
       c. CombatSystem.update(dt)
       d. DDA.update(dt)
       e. ParticlePool.update(dt)
     Other states: per matrix (§6.2)
  7. Renderer.draw(ctx, G, dt)
  8. requestAnimationFrame(gameLoop)
```

### 7.3 Combat Loop (per beat)
```
Each beat arrival:
  1. Judgement window opens (beat time ± 150ms)
  2. Wait for player input
  3. Input received → judge (§7.1.3)
     - Perfect/Great: damage enemy, combo++, show effect
     - Good: damage enemy, reset combo
     - Miss (no input/out of range): enemy attacks player
  4. Enemy HP ≤ 0 → death + reward (Beat Crystals + score)
  5. All enemies dead → Stage Clear
  6. Player HP ≤ 0 → Game Over (guard flag check: F5)
```

### 7.4 Boss Fight Patterns

#### Common Boss Structure
- **2~4 Phases**: Phase transition at HP thresholds (75%/50%/25%)
- **bossRewardGiven flag** (F17): Reward via `checkBossDefeat()` single function only
- **Boss Beat Patterns**: Phase-specific fixed sequences + SeededRNG variations

#### Per-Boss Phase Diagrams

**DJ Retro (Zone 1 Boss)**
```
Phase 1 (100%~75% HP)          Phase 2 (75%~0% HP)
┌─────────────────────┐        ┌─────────────────────┐
│ Basic + Hold beats   │──HP75%→│ Double beats added  │
│ BPM 110 fixed        │        │ BPM 110→120 accel   │
│ Pattern: A-A-H       │        │ Pattern: A-D-H-H    │
└─────────────────────┘        └─────────────────────┘
```

**DJ Wobble (Zone 2 Boss)**
```
Phase 1 (100%~75%)      Phase 2 (75%~25%)        Phase 3 (25%~0%)
┌──────────────┐        ┌──────────────────┐      ┌──────────────────┐
│ Basic+Double │──75%→  │ Bass Drop section│─25%→ │ All patterns mix │
│ BPM 125      │        │ BPM 125→140 drop │      │ BPM 140 fixed    │
│ A-A-D        │        │ D-D-H-E          │      │ D-D-H-E-B        │
└──────────────┘        └──────────────────┘      └──────────────────┘
```

**DJ Chill (Zone 3 Boss)**
```
Phase 1 (100%~50%)             Phase 2 (50%~0%)
┌─────────────────────┐        ┌─────────────────────────┐
│ Slow BPM 85          │──50%→ │ Irregular timing (swing) │
│ Long hold focus      │        │ BPM 85→95, offbeats     │
│ Pattern: H-H-A-H     │        │ Pattern: A-.-A-H-.-E    │
└─────────────────────┘        └─────────────────────────┘
```

**DJ Break (Zone 4 Boss)**
```
Phase 1 (100%~75%)    Phase 2 (75%~50%)      Phase 3 (50%~25%)    Phase 4 (25%~0%)
┌────────────┐        ┌────────────────┐      ┌────────────────┐   ┌────────────────┐
│ Fast basic │─75%→   │ Rapid combos   │─50%→ │ Break sections │─25%→│ Pattern storm │
│ BPM 155    │        │ BPM 160        │      │ BPM 170, pauses│   │ BPM 174 MAX   │
│ A-A-A-A    │        │ A-D-D-A-D      │      │ A-A-.-.-A-D-D  │   │ D-D-D-E-H-A-A │
└────────────┘        └────────────────┘      └────────────────┘   └────────────────┘
```

**DJ Error (Zone 5 Boss)**
```
Phase 1 (100%~75%)    Phase 2 (75%~50%)       Phase 3 (50%~25%)     Phase 4 (25%~0%)
┌────────────┐        ┌─────────────────┐     ┌─────────────────┐   ┌───────────────────┐
│ Variable   │─75%→   │ BPM reversal    │─50%→│ Glitch noise    │─25%→│ All beats inverted│
│ BPM 100↔140│        │ Beat dir reverse│     │ Beat display warp│   │ BPM 160, full glitch│
│ A-E-A-H    │        │ E-A-H-A (rev)   │     │ ?-?-A-E-?-H     │   │ Max visual distort │
└────────────┘        └─────────────────┘     └─────────────────┘   └───────────────────┘
```

**Void DJ (Hidden Boss)**
```
Phase 1 (100%~75%)   Phase 2 (75%~50%)      Phase 3 (50%~25%)     Phase 4 (25%~0%)
┌─────────────┐      ┌─────────────────┐    ┌──────────────────┐  ┌──────────────────┐
│ Silent phase │─75%→│ 5-zone rotation  │─50%→│ Dual zone mix   │─25%→│ Final: BPM 200 │
│ No beat visual│     │ Zone switch/10   │    │ 2 zones at once  │  │ All patterns+silent│
│ Audio-only   │     │ BPM 120~174 var  │    │ BPM 160 fixed    │  │ Max visual distort │
└─────────────┘      └─────────────────┘    └──────────────────┘  └──────────────────┘
```

### 7.5 Boss Reward System (F17)
```
function checkBossDefeat(boss):
  if boss.hp <= 0 AND NOT G.bossRewardGiven:
    G.bossRewardGiven = true    // Guard flag: prevent double reward
    grantReward(boss.reward)
    beginTransition(BOSS_DEFEAT)
```

---

## §8. Difficulty System

### 8.1 3-Tier Difficulty

| Setting | Beginner | DJ | Maestro |
|---------|---------|-----|---------|
| Player HP | 150 | 100 | 75 |
| Judgement Window | ±60/±120/±180ms | ±50/±100/±150ms | ±40/±80/±120ms |
| Enemy ATK Multiplier | 0.7× | 1.0× | 1.3× |
| Enemy HP Multiplier | 0.8× | 1.0× | 1.2× |
| Combo Maintenance | Up to Great | Up to Great | Perfect only |
| Beat Density | 0.8× | 1.0× | 1.2× |
| Chip Price | 0.8× | 1.0× | 1.2× |
| DDA Active | ✅ Strong | ✅ Normal | ❌ Disabled |

### 8.2 Balance Formulas

#### DPS (Damage Per Second)
```
baseDmg = CONFIG.PLAYER_BASE_DMG × difficultyMul
judgeMul = (perfectRate × 1.5 + greatRate × 1.2 + goodRate × 1.0)
comboMul = 1 + avgCombo × 0.1  // cap: 3.0
chipMul = 1 + chipBonusDmg      // cap: 2.0 (DPS cap)
DPS = baseDmg × judgeMul × comboMul × chipMul × (bpm / 60)
```

**Balance Assumptions (per difficulty)**:
| Assumption | Beginner | DJ | Maestro |
|-----------|---------|-----|---------|
| Perfect Rate | 30% | 50% | 70% |
| Great Rate | 40% | 30% | 20% |
| Good Rate | 20% | 15% | 8% |
| Miss Rate | 10% | 5% | 2% |
| Avg Combo | 3 | 8 | 15 |

#### Sound Chip Cumulative Caps (F67)
- **DPS Cap**: Chip damage bonus total ≤ 200%
- **Synergy Cap**: Inter-chip synergy bonus total ≤ 150%
- **Cap Exclusion**: Chips that would exceed cap are excluded from 3-pick selection pool

### 8.3 DDA Dynamic Difficulty (Beginner/DJ only)

| Trigger | Condition | Adjustment |
|---------|-----------|-----------|
| Easier | 3 stages with 0 Misses | Enemy HP +10%, Beat density +5% |
| Harder Lv1 | HP below 50% | Beat density -10% |
| Harder Lv2 | HP below 30% | Judgement window +20ms |
| Harder Lv3 | 5 consecutive Misses | Enemy ATK -15%, hint beats shown |

### 8.4 Stage Balance Table

| Zone | Stage | Enemy HP | Enemy ATK | Beat Density | Reward (Crystals) |
|------|-------|---------|-----------|-------------|------------------|
| 1 | 1-1 | 50 | 8 | 0.8/s | 5 |
| 1 | 1-2 | 65 | 10 | 1.0/s | 7 |
| 1 | 1-3 | 80 | 12 | 1.0/s | 9 |
| 1 | Boss | 400 | 15 | 1.2/s | 30 + chip |
| 2 | 2-1 | 90 | 14 | 1.2/s | 10 |
| 2 | 2-2 | 110 | 16 | 1.3/s | 12 |
| 2 | 2-3 | 130 | 18 | 1.4/s | 15 |
| 2 | Boss | 650 | 22 | 1.5/s | 45 + chip |
| 3 | 3-1 | 100 | 15 | 0.9/s | 12 |
| 3 | 3-2 | 120 | 17 | 1.0/s | 14 |
| 3 | 3-3 | 140 | 20 | 1.1/s | 17 |
| 3 | Boss | 500 | 18 | 1.0/s | 40 + chip |
| 4 | 4-1 | 150 | 22 | 1.6/s | 18 |
| 4 | 4-2 | 180 | 25 | 1.8/s | 22 |
| 4 | 4-3 | 210 | 28 | 2.0/s | 25 |
| 4 | Boss | 900 | 32 | 2.2/s | 60 + chip |
| 5 | 5-1 | 200 | 26 | 1.4/s | 22 |
| 5 | 5-2 | 240 | 30 | 1.6/s | 28 |
| 5 | 5-3 | 280 | 34 | 1.8/s | 32 |
| 5 | Boss | 1200 | 38 | 2.0/s | 80 + chip |
| H1 | Remix | Variable | Variable | Variable | 50 |
| H2 | Void DJ | 2000 | 45 | 2.5/s | 150 + true ending |

---

## §9. Sound Chip System (Roguelite Relics)

### 9.1 Sound Chip List (13 types)

#### Common (6)
| Chip Name | Effect | Value |
|-----------|--------|-------|
| Amp Boost | Base damage increase | +20% |
| Reverb Shield | Damage taken reduction | -15% |
| Metronome | Perfect window expansion | +10ms |
| Loop Station | Hold beat damage increase | +30% |
| Equalizer | Combo multiplier bonus | +0.05/combo |
| Volume Up | Beat Crystal gain increase | +15% |

#### Rare (4)
| Chip Name | Effect | Value |
|-----------|--------|-------|
| Harmonics | Extra hit on Perfect (2-hit) | +100% Perfect damage |
| Subwoofer | AoE damage on dodge success | 30 fixed damage |
| Crossfader | Auto-heal at combo 10+ | HP +3/beat |
| Beatdrop | AoE damage at combo 20 | 5% enemy max HP |

#### Epic (3)
| Chip Name | Effect | Value |
|-----------|--------|-------|
| Mastering | All damage + synergy bonus | +50% DMG, synergy cap +30% |
| Remixer | Beat type specialization | Target beat +80%, others -20% |
| Drop the Bass | Counter chance on Miss (next beat 2× DMG) | 1/stage |

### 9.2 Chip Synergies
- **Amp + Harmonics**: Perfect 2-hit × 1.2 = effective +140% (DPS cap applies)
- **Equalizer + Crossfader**: Maximize combo maintenance rewards
- **Subwoofer + Beatdrop**: Dodge + combo AoE damage
- **Synergy Cap**: All synergy total ≤ 150%

---

## §10. Permanent Upgrade Tree

### 10.1 Tree Structure (3 trees × 5 levels)

#### Rhythm Tree (Timing)
| Lv | Name | Effect | Cost (Crystals) |
|----|------|--------|-----------------|
| 1 | Beat Sense | Perfect window +5ms | 20 |
| 2 | Rhythm Master | Great damage → 130% | 50 |
| 3 | Combo Pro | Combo max multiplier 3.5× | 100 |
| 4 | Timing King | Good maintains combo | 200 |
| 5 | Perfect Aura | HP +1 on Perfect | 400 |

#### Power Tree (Damage)
| Lv | Name | Effect | Cost |
|----|------|--------|------|
| 1 | Power Amp | Base damage +10% | 20 |
| 2 | Critical Beat | 20% chance 2× on Perfect | 50 |
| 3 | Double Strike | Double beat damage +40% | 100 |
| 4 | Hold Master | Hold beat duration damage +50% | 200 |
| 5 | Overdrive | All damage +25% at combo 15+ | 400 |

#### Flow Tree (Survival)
| Lv | Name | Effect | Cost |
|----|------|--------|------|
| 1 | Safeguard | Max HP +15 | 20 |
| 2 | Fade Out | Miss damage -20% | 50 |
| 3 | Recovery | HP +20 on stage clear | 100 |
| 4 | Second Chance | Survive lethal hit 1×/run (HP 1) | 200 |
| 5 | Endure | Prevent 3rd consecutive Miss (→ Good) | 400 |

---

## §11. Score System

### 11.1 Score Calculation (F8: Judge first, save later)
```
beatScore = baseScore × judgeMul × comboMul
  baseScore = 100
  judgeMul: Perfect=1.5, Great=1.2, Good=1.0, Miss=0
  comboMul: 1 + combo × 0.1 (cap 3.0)

stageScore = sum(beatScore) + clearBonus
  clearBonus = 500 × stageNumber

bossScore = sum(beatScore) + bossDefeatBonus
  bossDefeatBonus = 2000 × zoneNumber

totalScore = sum(stageScore + bossScore) + crystalBonus
```

---

## §12. Localization

### 12.1 Supported Languages
- Korean (default)
- English

### 12.2 Language Toggle
- "한/EN" toggle button at bottom-right of title screen
- hitTest() single function for hit area management (F69)
- `G.lang` variable, CONFIG.STRINGS[G.lang] reference

---

## §13. localStorage Data Schema

```javascript
const SAVE_KEY = 'neonPulse_v1';
const SAVE_SCHEMA = {
  version: 1,
  lang: 'ko',
  difficulty: 'dj',
  highScores: { beginner: 0, dj: 0, maestro: 0 },
  bestCombo: 0,
  bestZone: 0,
  bestStage: 0,
  crystals: 0,
  upgrades: { rhythm: 0, power: 0, flow: 0 },
  unlockedZones: [true, false, false, false, false, false, false],
  hiddenBossDefeated: false,
  totalPlayCount: 0,
  totalBeats: 0,
  totalPerfects: 0,
  seed: null
};
```

---

## §14. Code Hygiene & Verification

### 14.1 Numeric Parity Table (F10)

| Spec Item | CONFIG Constant | Value |
|-----------|----------------|-------|
| Perfect Window (DJ) | JUDGE_PERFECT_MS | 50 |
| Great Window (DJ) | JUDGE_GREAT_MS | 100 |
| Good Window (DJ) | JUDGE_GOOD_MS | 150 |
| Player Base HP (DJ) | PLAYER_BASE_HP | 100 |
| Player Base DMG | PLAYER_BASE_DMG | 20 |
| Combo Max Multiplier | COMBO_MAX_MUL | 3.0 |
| Chip DPS Cap | CHIP_DPS_CAP | 2.0 |
| Chip Synergy Cap | CHIP_SYNERGY_CAP | 1.5 |
| Zone 1 BPM Range | ZONE_BPM[0] | [100, 120] |
| Boss 1 HP | BOSS_HP[0] | 400 |
| Min Touch Size | MIN_TOUCH | 48 |
| Swipe Min Distance | SWIPE_MIN_DIST | 30 |

### 14.2 Code Hygiene Checklist

| # | Item | Verification |
|---|------|-------------|
| 1 | All drawing functions follow §4.4 signatures | Full function audit |
| 2 | hitTest() used for all click/touch judgements | grep hitTest count |
| 3 | Zero direct G.bpm assignment (tween only) | grep "G.bpm =" |
| 4 | All declared variables used (zero ghost code) | Full audit |
| 5 | bossRewardGiven used only in checkBossDefeat | grep bossRewardGiven |
| 6 | State×System matrix (§6.2) matches code | switch branch audit |
| 7 | RESTART_ALLOWED whitelist (§6.1) reflected | State transition audit |
| 8 | Combo multiplier cap (3.0) applied in all judgements | Damage calc audit |
| 9 | Chip selection excludes DPS cap exceeding chips | Chip selection audit |
| 10 | REGION dependency directions (§5.3) maintained | Reference audit |

### 14.3 Smoke Test Gate (14 items) (F15, F65)

| # | Gate | Type | Check |
|---|------|------|-------|
| 1 | No assets/ directory | FAIL | `ls assets/` → error |
| 2 | index.html exists | FAIL | `ls index.html` → success |
| 3 | index.html loads in browser | FAIL | puppeteer console errors = 0 |
| 4 | Zero new Image() | FAIL | grep "new Image" → 0 |
| 5 | Zero fetch() file refs | FAIL | grep "fetch(" → 0 |
| 6 | Zero external URLs | FAIL | grep "http://" + "https://" → 0 |
| 7 | Zero setTimeout | FAIL | grep "setTimeout" → 0 |
| 8 | Zero Math.random | FAIL | grep "Math.random" → 0 |
| 9 | Zero confirm()/alert() | FAIL | grep "confirm\|alert(" → 0 |
| 10 | Touch targets min 48px | WARN | MIN_TOUCH constant usage |
| 11 | gameLoop try-catch wrapped | WARN | try-catch in gameLoop |
| 12 | hitTest single function | WARN | hitTest calls in input handlers |
| 13 | CONFIG numeric parity | WARN | §14.1 table sample check |
| 14 | Boss reward single path | WARN | bossRewardGiven + checkBossDefeat |

---

## §15. Viewport Test Matrix

| Viewport | Check Items |
|----------|------------|
| 320×480 (small mobile) | Beat lane visibility, touch areas ≥48px, no UI overlap |
| 480×800 (medium mobile) | All UI elements properly placed, sufficient swipe area |
| 768×1024 (tablet) | Play area ratio maintained, sidebar compatible |
| 1024×768 (landscape) | Landscape layout normal |
| 1920×1080 (desktop) | Full-screen rendering, devicePixelRatio applied |

---

## §16. Game Page Sidebar Metadata

```yaml
game:
  title: "Neon Pulse"
  description: "A rhythm arcade roguelite where you defeat enemies to the beat and conquer neon dungeons. Defeat DJ bosses across 5 music zones and purify the Pulse Nexus!"
  genre: ["arcade", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "Space/↑: Beat attack"
    - "←→: Dodge"
    - "Long press: Hold beat"
    - "Tap: Beat attack (touch)"
    - "Swipe: Dodge (touch)"
    - "P/Esc: Pause"
  tags:
    - "#rhythm"
    - "#arcade"
    - "#roguelite"
    - "#beat-action"
    - "#neon"
    - "#DJ"
  addedAt: "2026-03-23"
  version: "1.0.0"
  featured: true
```

---

## §17. Previous Cycle Pain Points Final Check

| # | Cycle 27 Pain Point | Resolution §§ | Solution | Verification |
|---|---------------------|--------------|----------|-------------|
| 1 | 4-round review cycle | §14.3 | 14-item smoke test gate (9 FAIL + 5 WARN) | APPROVED within 2 rounds |
| 2 | Common engine unstarted | §5.3 | 10 REGION + dependency direction, zero circular refs | R(n)→R(1~n-1) only |
| 3 | No balance verification | §8.1~8.4 | DPS/EHP formula + chip caps (200%/150%) + DDA 3-level + stage table | Extreme builds clearable |
| 4 | assets/ 1st-round recurrence | §4.1, §14.3 #1 | FAIL gate highest priority + zero-asset policy max | Zero asset violations 1st review |
| 5 | Hit area separation incomplete | §3.3, §14.2 #2 | hitTest(x,y,rect) + shared rect management | Zero hit area offset bugs |

---

## §18. Thumbnail SVG Specification

- **Size**: 800×600px (4:3 ratio)
- **Composition**: Cinematic — Player "Neon" in Perfect pose on beat lane, neon city silhouette and waveforms in background
- **Colors**: Main background #1A0033 (Deep Purple) + neon pink/cyan glow
- **Elements**: Player silhouette + headphones + beat markers (●) + "PERFECT!" text + combo counter + Zone 1 background
- **File Size Target**: 20KB+ (composite filter chain: glow + shadow)
- **100% Procedural**: Canvas toDataURL() or inline SVG (no external files)
