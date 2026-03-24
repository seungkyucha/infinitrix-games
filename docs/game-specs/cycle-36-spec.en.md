---
game-id: mecha-garrison
title: Mecha Garrison
genre: arcade, strategy
difficulty: hard
---

# Mecha Garrison — Cycle #36 Game Design Document

> **One-Page Summary**: A **tower defense roguelite** where players defend humanity's last mecha base against the alien machine legion "Vortex." 5 zones (City Outskirts → Industrial District → Energy Core → Underground Bunker → Final Command) × 3 waves + 5 zone bosses + 2 hidden stages = **17+ stages total**. 5 mecha unit types + part crafting (3 parts → weapon) + 3-branch × 5-tier permanent upgrade tree + environmental strategy (day/night + acid rain/EMP) + 4-tier DDA. SeededRNG-based enemy wave & part drop randomization for high replay value. **arcade+strategy combo resolves the longest unused gap of 8 games (since #25) + consumes the unused "mecha" theme.** Direct response to 2026 HTML5's top trend: "TD+Roguelite." Easy to learn in 10 seconds, deep enough for 10 hours.

> **MVP Boundary**: Phase 1 (core loop: place → wave defense → reward → upgrade, zones 1–3 + 3 bosses + 3 mecha types + upgrades Lv1–3 + 8 parts + DDA) → Phase 2 (zones 4–5 + 2 bosses + 2 hidden stages + 5 mecha types complete + upgrades Lv4–5 + 15 parts + weather/time-of-day + full narrative). **Phase 1 alone must deliver a complete tower defense roguelite experience.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅
> Items below have been verified over 19–35 cycles and are detailed in platform-wisdom.md. Only the **application section** is noted here.

| ID | Lesson Summary | Section |
|----|---------------|---------|
| F1 | Never create assets/ directory — CI build hook forced block [Cycle 1–35] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm/alert in iframe → Canvas modal [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1–2] | §5.2 |
| F5 | Guard flag ensures tween callback fires once [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + single beginTransition [Cycle 3 B2, 32] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Judge first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, x, y, size, ...state) [Cycle 6–7] | §4.4 |
| F10 | Numeric consistency table (spec = code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch target min 48×48px + Math.max forced [Cycle 12–35] | §3.3 |
| F12 | TDZ prevention: INIT_EMPTY pattern [Cycle 5–35] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path per value [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gate [Cycle 22–35] | §14.3 |
| F16 | hitTest() single function integration [Cycle 27] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG full usage (zero Math.random) [Cycle 19–35] | §5.2, §14.3 |
| F19 | Procedural SFX + BGM (Web Audio API) [Cycle 19–35] | §12 |
| F20 | Bilingual support (ko/en) [Cycle 27–35] | §13 |
| F21 | Single beginTransition definition [Cycle 32–35] | §6.1 |
| F22 | Delete all orphaned SVGs [Cycle 32] | §4.1 |

### New Feedback (Cycle #35 Lessons) 🆕

| ID | Lesson | Section | Solution |
|----|--------|---------|----------|
| F23 | assets/ recurrence 35 cycles straight — only CI forced block resolves this [Cycle 35] | §4.1, §14.3 | Smoke test gate #1 FAILs if `assets/` exists. Never create the folder |
| F24 | Shared engine copy-paste 35 cycles — structural limitation accepted, REGION systemization [Cycle 35] | §5.3 | 11 REGIONs with dependency direction. Shared code in REGION 2 |
| F25 | Post-mortem written without code review — review must precede post-mortem [Cycle 35] | §14.3 | Smoke test gate enforces review-before-postmortem order |
| F26 | hitTest integration needs full verification [Cycle 35] | §3.3 | All click/touch inputs verified to route through hitTest() — FAIL in hygiene checklist |
| F27 | Balance unverified — combinatorial space too large [Cycle 35] | §8.2, Appendix A | DPS cap (200%), synergy cap (150%). 3 extreme builds pre-verified by formula |
| F28 | Single-loop focus instead of dual-phase reduces code & balance burden [Cycle 35] | §5.3 | Focus on TD core loop (place → defend → reward). No separate exploration/economy system |

### Previous Cycle "Pain Points" Addressed ⚠️

| Pain Point (cycle-35) | Section | Solution | Verification Criteria |
|-----------------------|---------|----------|-----------------------|
| assets/ 35-cycle recurrence | §4.1 | Never create assets/ + CI FAIL gate | `ls assets/` → "No such file" |
| Shared engine 35-cycle copy-paste | §5.3 | 11 REGION structure + dependency direction | Forward references only between REGIONs |
| Code review not conducted | §14.3 | Review → post-mortem order enforced | cycle-36-review.md must exist |
| Balance unverified (5 biomes × 23 stages) | §8.2, Appendix A | TD wave balance with 3 variables (enemy HP/count/speed) + 4-tier DDA | 3 extreme builds clear time 30–120s |
| Procedural sound feel unconfirmed | §12 | BGM 2 tracks (lobby/battle) + SFX 10+ with detailed parameters | Each SFX 0.1–0.5s playback confirmed |

### Previous Cycle "Next Cycle Suggestions" Addressed

| Suggestion (cycle-35 analysis) | Applied | Section |
|-------------------------------|---------|---------|
| Resolve arcade+strategy longest unused (8 games) | ✅ | §0 genre selection |
| TD+Roguelite = 2026 HTML5 #1 trend | ✅ | §1, §2 core mechanics |
| Mecha theme to consume unused theme | ✅ | §4 visual style |
| Zero pure TD in Poki Top 10 — blue ocean | ✅ | §1 market positioning |

---

## §1. Game Overview & Core Fun

### Core Concept
"Defend the Last Base — Each Sortie Makes You Stronger" — Strategically place and upgrade mecha units to defend against the alien machine legion Vortex in this **tower defense roguelite**.

### Three Pillars of Fun
1. **Strategic Placement**: Consider range, traits, and synergies of 5 mecha types on the grid. "Where to place what?"
2. **Part Crafting Joy**: Choose 1 of 3 random parts after each wave → customize mecha loadout. Different builds every run.
3. **Permanent Growth**: Spend core points on permanent upgrades after each run. "I'll go further next time."

### Market Positioning
- Zero pure tower defense in Poki Top 10 → **Blue ocean**
- itch.io TD+Roguelite is the fastest-growing trend → imminent portal penetration
- Arcade feel (fast waves, intuitive placement) + strategy depth (upgrade tree, part crafting) = broad appeal

### Differentiation (vs. existing arcade+strategy 2 games)
- chrono-siege: time manipulation siege → **Real-time TD + roguelite meta progression** (entirely different mechanics)
- void-architect: building puzzle → **Unit placement + wave survival** (entirely different mechanics)

---

## §2. Game Rules & Objectives

### Victory Condition
- Clear all 5 zones × 3 waves + 5 zone bosses to defend the Final Command
- Clear 2 hidden stages for true ending

### Defeat Condition
- Run ends when base HP (core) reaches 0
- Core points earned during the run are retained for permanent upgrades (roguelite)

### Core Rules
1. **Placement Phase** (PLACEMENT): Spend energy to place/upgrade mecha units on the grid. No time limit.
2. **Wave Phase** (WAVE): Enemies move along BFS path. Mechas auto-attack. Player can only activate skills.
3. **Reward Phase** (REWARD): Choose 1 of 3 parts after wave clear (roguelike choice).
4. **Boss Phase** (BOSS): Zone's final wave — large boss with pattern-based mechanics.
5. **Hub Return** (HUB): After run end (clear/death), spend core points on permanent upgrades.

### BFS Pathfinding System
- Enemies follow BFS shortest path from entrance → base
- BFS recalculated instantly on mecha placement → **Placement rejected if no path exists** (§10.2, Cycle 26 lesson)
- Path routing (mazing) = core strategy

---

## §3. Controls

### §3.1 Keyboard + Mouse (PC)
| Input | Action |
|-------|--------|
| Mouse click | Select grid cell → place/upgrade mecha |
| Right-click | Sell placed mecha |
| 1–5 keys | Select mecha type (Blaster/Missile/Shield/EMP/Railgun) |
| Q | Activate team skill (during combat) |
| Space | Start wave / toggle fast-forward |
| Esc | Pause |
| R | Restart run (confirmation modal) |

### §3.2 Touch (Mobile)
| Input | Action |
|-------|--------|
| Tap | Select cell → show placement panel |
| Double tap | Upgrade mecha |
| Long press (500ms) | Sell confirmation modal |
| Bottom HUD buttons | Unit selection (5 types) |
| Top-right Play button | Start wave |
| Top-right ×2 button | Fast-forward |

### §3.3 Mobile Layout (small ≤400px)
```
┌──────────────────────────┐
│  ♥♥♥ HP    E:120  W:2/3  │  ← Status bar
├──────────────────────────┤
│                          │
│    [ 8×6 Grid Map ]      │  ← Main area
│                          │
├──────────────────────────┤
│ [B1][B2][B3][B4][B5]     │  ← Unit select (48×48px min)
│              [▶][×2][⏸] │  ← Controls
└──────────────────────────┘
```
- All touch targets: `Math.max(48, calcSize)` enforced (F11)
- hitTest() single function for all inputs (F16, F26)

### §3.4 Large Display (≥768px)
```
┌────────────────────────────────────────┐
│  ♥♥♥ HP:500    Energy:120    Wave:2/3  │
├────────────────────────────────────────┤
│                                        │
│        [ 12×8 Grid Map ]               │
│                                        │
├────────────────────────────────────────┤
│ [Blaster][Missile][Shield][EMP][Rail]  [▶ Start][×2][⏸] │
└────────────────────────────────────────┘
```

---

## §4. Visual Style Guide

### §4.1 Asset Principles
- **Never create assets/ directory** (F1, F23 — preventing 36th consecutive recurrence)
- **All visuals are Canvas procedural drawing** — zero SVG files, zero external assets
- Zero external CDN/fonts (F2)
- Zero `ASSET_MAP`, `SPRITES`, `preloadAssets` code

### §4.2 Color Palette (9 colors)
| Role | Color | HEX | Usage |
|------|-------|-----|-------|
| Mecha Blue | Steel blue | `#4A90D9` | Friendly mecha base color |
| Energy Cyan | Neon teal | `#00E5FF` | Energy, shield effects |
| Missile Orange | Explosion orange | `#FF6B35` | Missiles, explosion particles |
| Enemy Red | Vortex red | `#E53935` | Enemy units, danger indicators |
| Boss Purple | Abyss purple | `#9B59B6` | Bosses, special abilities |
| Background Dark | Twilight navy | `#1A1A2E` | Night background, default |
| Background Light | City gray | `#2D3436` | Day background |
| Gold | Reward gold | `#FFD700` | Core points, rewards |
| UI White | Text | `#F0F0F0` | UI text, grid lines |

### §4.3 Zone Visual Identity
| Zone | Background Gradient | Special Effects | Mood |
|------|-------------------|-----------------|------|
| 1. City Outskirts | `#2D3436`→`#1A1A2E` | Burning building silhouettes, smoke particles | Urgent urban combat |
| 2. Industrial District | `#1A1A2E`→`#0D1117` | Gear background objects, steam vents | Steampunk factory |
| 3. Energy Core | `#0D1117`+`#00E5FF` glow | Energy pipeline glow, electric arcs | Sci-fi energy facility |
| 4. Underground Bunker | `#0D0D0D`+warning light blink | Red emergency lights, crack effects | Desperate underground fortress |
| 5. Final Command | `#1A1A2E`+`#FFD700` halo | Holographic tactical map, final defense beam | Humanity's last stand |

### §4.4 Drawing Function Signatures (Pure Functions — F9)
```javascript
drawMecha(ctx, x, y, size, type, level, pose, time)
drawEnemy(ctx, x, y, size, type, hp, maxHp, status, time)
drawBoss(ctx, x, y, size, bossId, phase, hp, maxHp, time)
drawProjectile(ctx, x, y, type, angle, time)
drawExplosion(ctx, x, y, radius, progress, type)
drawGrid(ctx, cols, rows, cellSize, hoveredCell, placeable)
drawHUD(ctx, w, h, hp, maxHp, energy, wave, maxWave, score, time)
drawPartCard(ctx, x, y, w, h, part, selected, time)
drawEnvironment(ctx, w, h, zone, timeOfDay, weather, time)
drawBossEntrance(ctx, w, h, bossId, progress, time)
```

---

## §5. Core Game Loop

### §5.1 Global State Initialization (INIT_EMPTY — F12)
```javascript
const G = {
  state: 'BOOT', prevState: '', transAlpha: 0,
  // Base
  coreHp: 0, coreMaxHp: 0, energy: 0,
  // Map
  grid: [], cols: 0, rows: 0, cellSize: 0,
  mechas: [], enemies: [], projectiles: [], particles: [],
  // Progress
  zone: 0, wave: 0, maxWave: 0, score: 0,
  // Boss
  boss: null, bossPhase: 0, bossRewardGiven: false,
  // Parts
  parts: [], partChoices: [],
  // Permanent progression
  corePoints: 0, upgrades: { firepower: 0, defense: 0, utility: 0 },
  // Environment
  timeOfDay: 'day', weather: 'clear',
  // DDA
  consecutiveDeaths: 0, ddaLevel: 0,
  // Systems
  tween: null, pool: null, sound: null, input: null, rng: null,
  // UI
  selectedMecha: 0, hoveredCell: null, paused: false, speed: 1,
  // Localization
  lang: 'ko'
};
```

### §5.2 Main Loop (60fps)
```
requestAnimationFrame(loop)
  ├─ dt = clamp(elapsed, 0, 50ms)  // Frame spike prevention
  ├─ if (G.paused && state !== PAUSED) → return
  ├─ ACTIVE_SYSTEMS[G.state]-based system updates:
  │   ├─ tween.update(dt)        // F4: tween only, no setTimeout
  │   ├─ input.update()
  │   ├─ physics.update(dt)      // Projectile movement, collision
  │   ├─ ai.update(dt)           // Enemy movement (BFS path)
  │   ├─ combat.update(dt)       // Mecha attacks, damage calc
  │   ├─ spawn.update(dt)        // Enemy spawn timer
  │   ├─ environment.update(dt)  // Weather/time-of-day changes
  │   ├─ particle.update(dt)     // Particle effects
  │   └─ sound.update(dt)        // BGM transition/fade
  ├─ render(ctx, G, dt)          // Full render
  └─ tween callbacks → state transitions (F4, F5)
       └─ beginTransition() single definition (F6, F21)
```

### §5.3 Code Region Guide (11 REGIONs + Dependency Direction)
```
REGION 1:  Constants & Config (CONFIG, LANG, COLORS)         [~300 lines]  ← No deps
REGION 2:  Shared Engine (SeededRNG, TweenManager,            [~600 lines]  ← R1 only
            ObjectPool, SoundManager, InputManager)
REGION 3:  Asset Declaration — Empty (F1: "All visuals Canvas") [~10 lines]  ← Empty
REGION 4:  Drawing Functions (pure functions — F9)             [~800 lines]  ← R1 only
REGION 5:  Game Logic — TD Core                               [~600 lines]  ← R1,R2
            (BFS, placement, spawning, combat, projectiles)
REGION 6:  Game Logic — Boss & Parts                          [~400 lines]  ← R1,R2,R5
            (Boss patterns, part crafting, rewards)
REGION 7:  Game Logic — Meta Progression                      [~250 lines]  ← R1,R2
            (Permanent upgrades, DDA, environment)
REGION 8:  UI & HUD                                           [~300 lines]  ← R1,R2,R4
REGION 9:  State Machine & Transitions                        [~250 lines]  ← R1~R8
REGION 10: Main Loop & Initialization                         [~200 lines]  ← R1~R9
REGION 11: Event Binding & Bootstrap                          [~90 lines]   ← R10
                                                             Total: ~3,800 lines
```
Dependency direction: **R1→R11 unidirectional**. No backward references. (Cycle 27 lesson)

---

## §6. State Machine

### §6.1 Game States (15)
```
BOOT → TITLE → STORY_INTRO → ZONE_INTRO → PLACEMENT →
  ┌─ WAVE → WAVE_CLEAR → REWARD_SELECT ─┐
  │                                      │
  └──── (repeat ×3) ─────────────────────┘
    → BOSS_INTRO → BOSS_FIGHT → BOSS_CLEAR →
    → (next zone or VICTORY) → HUB → (next run)
    → GAMEOVER → HUB
    → PAUSED (from any state)
    → MODAL (confirmation modal)
```

**STATE_PRIORITY** (higher = precedence — F6):
```
GAMEOVER: 100, VICTORY: 90, BOSS_FIGHT: 80, WAVE: 70,
BOSS_INTRO: 60, ZONE_INTRO: 50, STORY_INTRO: 40,
PLACEMENT: 30, REWARD_SELECT: 30, HUB: 20, TITLE: 10, BOOT: 0
```

**RESTART_ALLOWED** whitelist (Cycle 24 lesson):
```
RESTART_ALLOWED = ['PLACEMENT', 'WAVE', 'WAVE_CLEAR', 'REWARD_SELECT', 'GAMEOVER']
```

### §6.2 ACTIVE_SYSTEMS Matrix (15 states × 10 systems)

| State | tween | input | physics | ai | combat | spawn | env | particle | sound | render |
|-------|-------|-------|---------|-----|--------|-------|-----|----------|-------|--------|
| BOOT | ✅ | — | — | — | — | — | — | — | — | ✅ |
| TITLE | ✅ | menu | — | — | — | — | — | ✅ | bgm_title | ✅ |
| STORY_INTRO | ✅ | skip | — | — | — | — | — | ✅ | bgm_title | ✅ |
| ZONE_INTRO | ✅ | skip | — | — | — | — | — | ✅ | bgm_zone | ✅ |
| PLACEMENT | ✅ | place | — | — | — | — | ✅ | ✅ | bgm_calm | ✅ |
| WAVE | ✅ | wave | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | bgm_battle | ✅ |
| WAVE_CLEAR | ✅ | limited | — | — | — | — | ✅ | ✅ | sfx_clear | ✅ |
| REWARD_SELECT | ✅ | card | — | — | — | — | — | ✅ | bgm_calm | ✅ |
| BOSS_INTRO | ✅ | skip | — | — | — | — | — | ✅ | sfx_alarm | ✅ |
| BOSS_FIGHT | ✅ | wave | ✅ | ✅ | ✅ | — | ✅ | ✅ | bgm_boss | ✅ |
| BOSS_CLEAR | ✅ | limited | — | — | — | — | — | ✅ | sfx_victory | ✅ |
| VICTORY | ✅ | menu | — | — | — | — | — | ✅ | bgm_victory | ✅ |
| GAMEOVER | ✅ | menu | — | — | — | — | — | ✅ | bgm_gameover | ✅ |
| PAUSED | ✅ | pause | — | — | — | — | — | — | — | ✅ |
| MODAL | ✅ | modal | — | — | — | — | — | — | — | ✅ |

**Input mode granularity** (Cycle 26 lesson):
- `menu`: Menu buttons only
- `skip`: Any key/tap → skip
- `place`: Grid click placement + unit selection + sell
- `wave`: Skill activation + speed toggle only (no placement)
- `card`: Part card selection only
- `limited`: Next/proceed button only
- `pause`: Resume/settings/quit
- `modal`: Confirm/cancel

### §6.4 Canvas Modal System (F3)
- Never use `confirm()` / `alert()`
- Modals render as semi-transparent overlay + centered panel on Canvas
- Tween updates continue in MODAL state → fade in/out animation

---

## §7. Game Mechanics Detail

### §7.1 Mecha Units (5 types)

| ID | Name | Cost | Range | ATK | Speed | Special | Unlock |
|----|------|------|-------|-----|-------|---------|--------|
| M1 | Blaster | 30E | 3 cells | 10 | 1.0s | Single target | Default |
| M2 | Missile Launcher | 60E | 4 cells | 25 | 2.5s | AoE (1 cell) splash | Default |
| M3 | Shield Generator | 50E | 2 cells | 0 | — | Adjacent mecha defense +30% | Default |
| M4 | EMP Tower | 80E | 3 cells | 5 | 3.0s | 0.5s stun | Zone 2 clear |
| M5 | Railgun | 120E | 6 cells | 80 | 5.0s | Pierce (entire line) | Zone 3 clear |

**Unit Leveling**: Re-place same unit on same cell → Lv2 (50% cost), Lv3 (100% cost). Each level: ATK +40%, cooldown -15%.

### §7.2 Enemy Units
| Type | HP | Speed | Special | Appears |
|------|-----|-------|---------|---------|
| Drone | 30 | 2 cells/s | — | Zone 1+ |
| Tank | 120 | 1 cell/s | 30% defense | Zone 1+ |
| Speeder | 20 | 4 cells/s | Alternative path preference | Zone 2+ |
| Shield Bot | 60 | 1.5 cells/s | Grants shield to adjacent enemies | Zone 3+ |
| Suicide Bot | 40 | 3 cells/s | 3× damage on base contact | Zone 4+ |
| Helix | 80 | 2 cells/s | Flying (passes over mechas) | Zone 4+ |
| Hacker | 50 | 1.5 cells/s | Disables adjacent mecha for 1s | Zone 5+ |

### §7.3 Environmental Strategy System

| Environment | Effect | Values | Counter | Zone |
|------------|--------|--------|---------|------|
| Daytime | Solar charge → energy bonus | +2E/s | — (bonus) | All |
| Nighttime | Reduced visibility (mecha range -1 cell) | Range -1 | EMP Tower night bonus +50% | All |
| Acid Rain | Enemy slowdown + mecha durability loss | Enemy speed -20%, Mecha HP -1/s | Shield Generator protection | 3+ |
| EMP Storm | Friendly mecha 1s stun (3s cycle) | 1s/3s | Shield Generator immunity | 4+ |
| Magnetic Storm | Projectile trajectory warping | Hit rate -30% | Railgun immune (piercing) | 5 |

**Time-of-day transition**: Day → night transition at wave 2 (3s tween). Boss fights always at night.

### §7.4 Part System (Roguelike Choices)

After wave clear, SeededRNG presents 3 parts → choose 1.

| Rarity | Chance | Effect Range | Examples |
|--------|--------|-------------|----------|
| Common (white) | 60% | +10–15% stats | Range +0.5 cell, ATK +10% |
| Rare (blue) | 30% | +20–30% stats | Attack speed +25%, Energy regen +15% |
| Epic (purple) | 10% | Special effect | Pierce added, 0.3s stun added, Chain lightning |

**DPS Cap**: 200%. If a single mecha's DPS exceeds 200% of base, part effects are diminished. (F27, Cycle 26 lesson)
**Synergy Cap**: 150%. 3+ parts of same type have synergy bonus capped at 150%.
**Cap-exceeded part exclusion**: `applyPart()` validates caps → parts of capped category excluded from choices.

### §7.5 Boss Fights (5 types)

| Boss | Zone | HP | Pattern | Weakness | Reward |
|------|------|-----|---------|----------|--------|
| **Crusher** | 1 | 500 | Charge → destroy mecha | Decoy placement on charge path | 1 Epic part |
| **Shield Mother** | 2 | 800 | Summon minions + global shield | Concentrate fire on shield core (back) | EMP Tower unlock |
| **Drill Worm** | 3 | 1200 | Underground movement → AoE on emerge | Predict emerge location → Railgun | Railgun unlock |
| **Overlord** | 4 | 1500 | Global EMP + self-heal | Weak point exposed during 3s heal | 2 Epic parts |
| **Vortex Prime** | 5 | 2500 | 3-phase transformation | Phase-dependent weak points | True ending unlock |

**Boss Phase Diagram (Vortex Prime)**:
```
Phase 1 (HP 100–60%): Ranged laser → 2s cooldown (weakness: core exposed)
    ↓ HP 60%
Phase 2 (HP 60–25%): Charge + summon minions → kill minions to break shield
    ↓ HP 25%
Phase 3 (HP 25–0%): Global EMP + continuous suicide bot spawn → core exposed 3s
```

**bossRewardGiven flag**: Boss rewards given once only (F17). Set `G.bossRewardGiven = true` after reward grant to prevent re-entry.

---

## §8. Difficulty System

### §8.1 Wave Balance Table (3 tiers)

| Tier | Zone | Enemy HP Mult | Count | Speed Mult | Energy Income | Expected Clear Time |
|------|------|--------------|-------|------------|---------------|-------------------|
| Early | 1–2 | ×1.0 | 8–15 | ×1.0 | 5E/kill | 30–45s per wave |
| Mid | 3 | ×1.5 | 15–25 | ×1.2 | 4E/kill | 45–60s per wave |
| Late | 4–5 | ×2.5 | 20–35 | ×1.5 | 3E/kill | 60–90s per wave |

### §8.2 DPS/EHP Balance Formula

**Assumptions** (Cycle 24 lesson — state assumptions explicitly):
- Player mecha placement efficiency: 70% (vs. optimal)
- Average mecha level: Zone 1=Lv1, Zone 3=Lv2, Zone 5=Lv2.5
- Part bonus: Common average 12.5%, cumulative per zone

**Formula**:
```
TeamDPS = Σ(mecha_ATK × levelMult × partMult) / cooldown
WaveEHP = Σ(enemy_HP × hpMult) / enemy_count
ClearTime = WaveEHP / TeamDPS
Target: 30s ≤ ClearTime ≤ 120s
```

**DDA fallback on assumption error** (Cycle 24 lesson):
- If placement efficiency estimated below 50% → DDA level 1 auto-applied

### §8.3 DDA (Dynamic Difficulty Adjustment) 4 Tiers

| Condition | DDA Level | Effect |
|-----------|----------|--------|
| 0 run deaths | 0 | Base difficulty |
| 1–2 consecutive deaths | 1 | Starting energy +20% |
| 3 consecutive deaths | 2 | + Enemy HP -15% |
| 5 consecutive deaths | 3 | + 2 free Blasters pre-placed |
| 10 consecutive deaths | 4 | + BFS optimal placement hints shown |

**DDA Reset**: `consecutiveDeaths = 0` on run clear.

---

## §9. Permanent Progression System (Roguelite Meta)

### Upgrade Tree: 3 branches × 5 tiers

| Branch | Lv1 | Lv2 | Lv3 | Lv4 | Lv5 | Axis |
|--------|-----|-----|-----|-----|-----|------|
| **Firepower** | ATK +10% | Speed +10% | Critical 5% | Range +0.5 cell | Ultimate unlock | Offense |
| **Defense** | Base HP +100 | Mecha HP +20% | Repair drone | Retaliate 10% | Emergency shield unlock | Survival |
| **Utility** | Energy +20 | Part rarity ↑ | Sell refund +20% | Place speed +30% | Time slow unlock | Economy/QoL |

**Core Point Earnings**:
- Wave clear: 10 CP × zone number
- Boss clear: 100 CP × zone number
- On run death: 50% of earned CP retained

**Permanent/Run-based Separation** (Cycle 29 lesson):
- **Permanent**: Upgrade tree (survival + economy) — slow but certain growth
- **Run-based**: Part crafting (offensive traits) — different strategy each run
- Two systems reinforce different axes (permanent=survival/economy, run-based=offense) for complementary design

---

## §10. Level Generation System

### §10.1 Grid Map Structure
- Zone maps: 12×8 (PC) / 8×6 (mobile) grid
- Entrance (left/top) → Exit (bottom-right = base) BFS path
- Obstacle tiles: 20–35% pre-placed per zone

### §10.2 Hybrid Procedural Generation (F26, Cycle 33 lesson)
1. **Base Layout**: 3 pre-defined map templates per zone (fixed obstacle positions)
2. **SeededRNG Variation** (40–60%):
   - Obstacles shifted ±2 tiles
   - Enemy spawn composition varied
   - Part drop table shuffled
   - Environment (time-of-day/weather) randomly assigned
3. **BFS Reachability Verification**: Post-variation BFS run → rollback if no path exists
4. **Real-time BFS on Placement**: Instant BFS recalc on mecha placement → reject if path blocked (Cycle 26 lesson)
5. **Boss Weakness Position**: Guaranteed ≥1 cell away from BFS path (Cycle 26 lesson)

### §10.3 BFS Pathfinding Algorithm
```
function findPath(grid, start, end):
  queue = [start]
  visited = Set(start)
  parent = Map()
  while queue.length > 0:
    cell = queue.shift()
    if cell === end: return reconstructPath(parent, end)
    for neighbor in getNeighbors(cell, grid):
      if !visited.has(neighbor) && !isBlocked(neighbor):
        visited.add(neighbor)
        parent.set(neighbor, cell)
        queue.push(neighbor)
  return null  // No path → reject placement
```

### §10.4 Mecha Unlock → Zone Accessibility Map (Cycle 33 lesson)

| Zone | Required Mechas | Boss Weakness Exploitation | Unlock Reward |
|------|----------------|--------------------------|---------------|
| 1. City Outskirts | Blaster, Missile, Shield (default) | Decoy placement (Blaster) | — |
| 2. Industrial District | Default 3 types | Shield core focus (Missile) | EMP Tower |
| 3. Energy Core | Default 3 + EMP | Predict emergence (EMP stun) | Railgun |
| 4. Underground Bunker | All 5 types | Weakness during EMP immunity (Railgun) | 2 Epic parts |
| 5. Final Command | All 5 types + Lv2+ | 3-phase weakness rotation (all types needed) | True ending |

---

## §11. Scoring System

### §11.1 Score Acquisition (Judge First, Save Later — F8)
| Action | Score |
|--------|-------|
| Enemy kill | 10 × zone number |
| Boss kill | 500 × zone number |
| Wave no-damage clear | 200 |
| Full run clear (all zones) | 10,000 |
| Hidden stage clear | 5,000 |

**Processing Order**:
1. Calculate score (judgment)
2. Compare with best record
3. Save if new best (saveBest)

### §11.2 localStorage Schema (Cycle 21 lesson)
```javascript
{
  "mecha-garrison-v1": {
    bestScore: 0,
    bestZone: 0,
    corePoints: 0,
    upgrades: { firepower: 0, defense: 0, utility: 0 },
    totalRuns: 0,
    consecutiveDeaths: 0,
    unlockedMechas: [true, true, true, false, false],
    lang: 'ko',
    version: 1
  }
}
```

---

## §12. Sound System (Web Audio API — F19)

### BGM (Procedurally Generated)
| Track | BPM | Mood | Used In |
|-------|-----|------|---------|
| bgm_title | 90 | Grand march (C minor) | TITLE, STORY_INTRO |
| bgm_calm | 100 | Tense preparation (A minor) | PLACEMENT, REWARD_SELECT, HUB |
| bgm_battle | 140 | Escalating combat (E minor) | WAVE |
| bgm_boss | 160 | Overwhelming threat (D minor + dissonance) | BOSS_INTRO, BOSS_FIGHT |
| bgm_victory | 120 | Victory fanfare (C major) | VICTORY, BOSS_CLEAR |

### SFX (10+ types)
| ID | Trigger | Waveform | Frequency | Duration | Description |
|----|---------|----------|-----------|----------|-------------|
| sfx_place | Mecha placement | square→sine | 440→880Hz | 0.15s | Metal attachment |
| sfx_shoot | Blaster fire | sawtooth | 660Hz | 0.1s | Laser shot |
| sfx_missile | Missile launch | noise+sine | 220Hz | 0.3s | Rocket ignition |
| sfx_explosion | Explosion | noise | 100→20Hz | 0.4s | Low-freq explosion |
| sfx_shield | Shield activate | sine | 880→1320Hz | 0.2s | Energy charge |
| sfx_emp | EMP discharge | square | 110→55Hz | 0.3s | EM pulse |
| sfx_railgun | Railgun fire | sawtooth+noise | 1760→440Hz | 0.5s | Pierce beam |
| sfx_hit | Enemy hit | noise | 330Hz | 0.08s | Impact |
| sfx_boss_alarm | Boss appear | square | 220Hz (repeat) | 1.0s | Alarm |
| sfx_core_hit | Base hit | sine+noise | 110Hz | 0.3s | Warning vibration |
| sfx_reward | Part acquired | sine | 660→1320Hz | 0.2s | Rising chime |
| sfx_upgrade | Upgrade | sine (arpeggio) | C-E-G-C | 0.4s | Level-up fanfare |

**Single update path**: All BPM changes via `SoundManager.setBPM()` only (F14, Cycle 28 lesson).

---

## §13. Localization (ko/en — F20)

LANG object with 60+ entries. See §13 of Korean spec for full listing.

---

## §14. Code Hygiene & Verification

### §14.1 Numeric Consistency Table (F10)
All spec values → CONFIG constants with 1:1 mapping. Full cross-check during code review.

| Spec Value | CONFIG Key | Value |
|-----------|----------|-------|
| Base HP | CONFIG.CORE_MAX_HP | 500 |
| Blaster ATK | CONFIG.MECHA[0].ATK | 10 |
| Blaster cooldown | CONFIG.MECHA[0].COOLDOWN | 1000 |
| Missile splash | CONFIG.MECHA[1].SPLASH | 1 |
| DPS cap | CONFIG.DPS_CAP | 2.0 |
| Synergy cap | CONFIG.SYNERGY_CAP | 1.5 |
| DDA Lv2 HP reduce | CONFIG.DDA[2].HP_REDUCE | 0.15 |

### §14.2 Code Hygiene Checklist

**FAIL (mandatory — any violation = review rejection)**:
- [ ] Zero `Math.random` calls (F18)
- [ ] Zero `setTimeout` / `setInterval` calls (F4)
- [ ] Zero `confirm()` / `alert()` calls (F3)
- [ ] No `assets/` directory exists (F1, F23)
- [ ] Zero `ASSET_MAP` / `SPRITES` / `preloadAssets`
- [ ] Zero external CDN / Google Fonts (F2)
- [ ] Exactly 1 `beginTransition` definition (F21)
- [ ] `applyPart()` validates DPS cap (200%) / synergy cap (150%) (F27)
- [ ] All click/touch inputs route through `hitTest()` single path (F16, F26)
- [ ] `bossRewardGiven` guard flag used (F17)

**WARN (recommended)**:
- [ ] Zero direct G global reference in functions (pure functions — F9)
- [ ] Zero backward references between REGIONs
- [ ] Zero dead code (declared but unused variables)
- [ ] Zero touch targets below 48px (F11)

### §14.3 Smoke Test Gate (20 items — F15)

**FAIL Gates (12)**:
1. `index.html` exists and loads in browser
2. `assets/` directory does not exist
3. BOOT → TITLE auto-transition (within 3s)
4. TITLE → PLACEMENT transition (click/tap)
5. Mecha placement works (grid click)
6. PLACEMENT → WAVE start (Space/button)
7. Enemies move + mechas attack during WAVE
8. WAVE_CLEAR → REWARD_SELECT transition
9. GAMEOVER → HUB transition + core points display
10. Restart only possible in RESTART_ALLOWED states
11. Boss fight entry + pattern behavior (Zone 1)
12. localStorage save/load correct (F8 order)

**WARN Gates (8)**:
13. Mobile touch basic flow (place → start → clear)
14. Language toggle (ko↔en) works
15. DDA level 1 triggers (after intentional death)
16. Fast-forward (×2) toggle works
17. BGM/SFX playback confirmed
18. Viewport 320/480/768/1024px layout check (Cycle 23 lesson)
19. Zero orphaned SVG/asset code
20. Full flow regression: BOOT→TITLE→PLACEMENT→WAVE→BOSS→VICTORY (Cycle 29 lesson)

---

## §15. Narrative / Story

### Background
Year 2187. The alien machine legion "Vortex" invades Earth. Humanity's military forces are obliterated. Only the last mecha base "Garrison" remains. As the base commander, you must direct the mecha forces to repel Vortex's relentless waves. Parts salvaged from each sortie strengthen your mechas, with the ultimate goal of destroying the Vortex Prime core.

### Zone Story Progression
| Zone | Narrative | ZONE_INTRO Text |
|------|----------|-----------------|
| 1 | Establishing outer defense line | "Hold the first line. Until civilian evacuation is complete." |
| 2 | Securing industrial facilities | "Hold the factories — we can build new weapons." |
| 3 | Protecting energy infrastructure | "If the Energy Core falls, every mecha goes dark." |
| 4 | Sheltering last civilians underground | "If this falls, there's nowhere left to go." |
| 5 | Final stand — counterattack begins | "End the Vortex Prime. For humanity's tomorrow." |

### Hidden Stages (2)
- **Simulator**: Unlocked after full clear. Endless wave mode (high score challenge).
- **Vortex Origin**: True ending stage. Enhanced Vortex Prime (HP ×2, 4 phases).

---

## §16. Camera Direction

| Effect | Trigger | Action | Duration |
|--------|---------|--------|----------|
| Boss entrance zoom | BOSS_INTRO | Pan center→boss + 1.5× zoom in | 2s |
| Boss clear zoom out | BOSS_CLEAR | 1.5×→1.0× zoom out + shake | 1.5s |
| Base hit shake | Core HP decrease | Screen ±3px shake (0.2s) | 0.2s |
| Victory pan | VICTORY | Slow full-map zoom out | 3s |
| Placement zoom | Mecha selected | 1.2× subtle zoom on cell area | While held |

---

## §17. Sidebar Metadata (Game Page)

```yaml
game:
  title: "Mecha Garrison"
  description: "A tower defense roguelite where you deploy and upgrade mecha units against an alien machine legion. Every sortie makes you stronger!"
  genre: ["arcade", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "Mouse click: Place/upgrade mecha"
    - "Right-click: Sell mecha"
    - "1-5 keys: Select unit"
    - "Space: Start wave"
    - "Q: Activate team skill"
    - "Touch: Tap to place, double-tap to upgrade, long-press to sell"
  tags:
    - "#TowerDefense"
    - "#Roguelite"
    - "#Mecha"
    - "#Strategy"
    - "#SciFi"
    - "#PermanentProgression"
    - "#BossFight"
  addedAt: "2026-03-24"
  version: "1.0.0"
  featured: true
```

---

## Appendix A. Extreme Build Balance Verification

### Build 1: Firepower All-In (Blaster ×6 Lv3 + 3 Epic ATK parts)
```
Base DPS = 6 × (10 × 1.96) / 1.0 = 117.6/s
Part bonus = DPS cap 200% → 117.6 × 2.0 = 235.2/s (capped)
Zone 5 wave EHP = 35 × (80 × 2.5) = 7,000
Clear time = 7,000 / 235.2 ≈ 30s ✅ (within range)
```

### Build 2: Tank (Shield ×3 + Defense Lv5 + DDA Lv0)
```
Base HP = 500 + 100(Lv1) + Defense Lv5 bonus = 800
Enemy DPS (Zone 5) = ~15/s (when reaching base)
Survival time = 800 / 15 ≈ 53s
Required ally DPS = 7,000 / 53 ≈ 132/s → Achievable with Blaster Lv2 ×4 ✅
```

### Build 3: Utility Specialist (Utility Lv5 + Railgun ×2 + Energy parts)
```
Energy income = base 5E/kill + Utility Lv3 sell refund 20% → effective 8E/kill
Railgun DPS = 2 × (80 × 1.4) / 5.0 = 44.8/s (pierce hits ×2-3)
Effective DPS = 44.8 × 2.5(avg pierce) = 112/s
Zone 5 clear time = 7,000 / 112 ≈ 63s ✅ (within range)
```

**Conclusion**: All 3 extreme builds fall within 30–120s clear time range. Balance verified.

---

## Appendix B. Viewport Test Matrix (Cycle 23 lesson)

| Viewport | Grid Size | Cell Size | HUD Position | Check Items |
|----------|----------|-----------|-------------|-------------|
| 320px | 8×6 | 36px | Bottom fixed | Touch targets ≥48px, no unit button overlap |
| 480px | 8×6 | 48px | Bottom fixed | Grid+HUD fit within screen |
| 768px | 12×8 | 48px | Bottom fixed | Sidebar display transition |
| 1024px+ | 12×8 | 64px | Bottom fixed | Camera zoom effects normal |

---

_End of design document. This document is the Single Source of Truth for Cycle #36 implementation._
