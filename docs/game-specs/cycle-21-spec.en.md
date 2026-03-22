---
game-id: runeforge-tactics
title: Runeforge Tactics
genre: puzzle, strategy
difficulty: medium
---

# Runeforge Tactics — Detailed Game Design Document

_Cycle #21 | Date: 2026-03-22_

---

## One-Page Summary (Must-Read for Implementer)

**Runeforge Tactics** is a turn-based tactical puzzle game where the **Puzzle Phase** (placing 8 types of runes on a 5×5 grid to complete magic circle patterns) alternates with the **Defense Phase** (using activated spells to repel 3-lane enemy waves). It fills the platform's biggest genre gap (puzzle + strategy = 0→1), delivering premium replay value with 20+ stages, 5 bosses, permanent upgrades, and 120+ magic circle combinations.

**MVP (Phase 1)**: TITLE → STAGE_SELECT → PUZZLE → DEFENSE → RESULT (5 states) + Forest region (3 stages) + 4 basic runes + 10 magic circle patterns. **Complete this first, then expand.**

**Critical Prohibitions**: No assets/ directory, zero setTimeout calls, no state changes in render(), no external fonts/CDN.

---

## §0. Previous Cycle Feedback Mapping

> Cycle 20 post-mortem issues + platform-wisdom cumulative lessons, grouped by category for proactive prevention.

### Assets / File System

| # | Source | Problem | Solution | Section |
|---|--------|---------|----------|---------|
| F1 | Cycle 1~20 (20 consecutive) | assets/ directory recurrence | **Single index.html, 100% Canvas code drawing.** Pre-commit hook must be registered | §11, §14.5 |
| F6 | Cycle 2~4 | SVG filter (feGaussianBlur) recurrence | Canvas shadowBlur only for glow. No inline SVG | §4.2 |
| F33 | Cycle 20 | Google Fonts external dependency | System monospace only. Zero external CDN requests | §4.1 |

### State Machine / Transitions

| # | Source | Problem | Solution | Section |
|---|--------|---------|----------|---------|
| F2 | Cycle 1~2 | setTimeout-based state transitions | tween onComplete only. Zero setTimeout target | §5, §13 |
| F4 | Cycle 2 | Missing state × system matrix | §6.3: Pre-build 12-state × 9-system matrix | §6.3 |
| F5 | Cycle 3/4 | Missing guard flags → repeated callbacks | `isTransitioning`, `isPlacingRune`, `isWaveActive` triple guard | §5.4 |
| F17 | Cycle 3 | State transition priority system | GAMEOVER > RESULT > DEFENSE > PUZZLE. STATE_PRIORITY map | §6.2 |
| F23 | Cycle 5/8 | Direct transitions bypassing beginTransition() | All screen transitions must go through `beginTransition()` | §6.2 |
| F26 | Cycle 17/20 | State changes in render() | State changes in update() only. render() is pure output | §5.2 |
| F31 | Cycle 20 | hitAnim modified in render | All animation timers decrease in update() only | §5.2 |

### Code Quality

| # | Source | Problem | Solution | Section |
|---|--------|---------|----------|---------|
| F3 | Cycle 6~20 | Pure function pattern required | All rune matching, damage calc, collision functions are parameter-based | §15.2 |
| F6b | Cycle 4 | TweenManager cancelAll+add race condition | `clearImmediate()` separate API | §15 |
| F7 | Cycle 7/16 | Spec values ≠ code values mismatch | §14.4 numerical consistency verification table | §14.4 |
| F11 | Cycle 11/14 | let/const TDZ crash | Strict order: declaration → DOM → events → init() | §14.1 |
| F12 | Cycle 10/11 | gameLoop missing try-catch | `try{...}catch(e){console.error(e);}raf(loop)` by default | §5.1 |
| F15 | Cycle 3/7/17 | Ghost variables (declared but unused) | §14.2 variable usage verification table | §14.2 |
| F16 | Cycle 5 | Dual update paths for single value | All key values updated through single function (`modifyStat()`) only | §15.3 |
| F30 | Cycle 18 | Single-file modularization | §A~§L logical section structure | §15.1 |

### Input / Mobile

| # | Source | Problem | Solution | Section |
|---|--------|---------|----------|---------|
| F8 | Cycle 1 | confirm/alert blocked in iframe | Canvas-based modal UI only | §4 |
| F20 | Cycle 13~20 | CONFIG.MIN_TOUCH declaration-implementation gap | Force `touchSafe()` 48px minimum on all UI | §12.3 |
| F21 | Cycle 16 | Incomplete input mode support | Full functionality for keyboard/mouse/touch | §3 |
| F24 | Cycle 12~20 | Touch targets under 44×44px | All interactive UI minimum 48×48px | §12.3 |
| F32 | Cycle 20 | Touch scroll not implemented for upgrade shop | Full touchmove drag scroll with inertia/bounce values | §4.7 |
| F34 | Cycle 20 | No touch area visual guide | Tutorial overlay on first play | §3.4 |

### Other

| # | Source | Problem | Solution | Section |
|---|--------|---------|----------|---------|
| F10 | Cycle 15~20 | Offscreen canvas background caching | `buildGridCache()` — rebuild on resize/stage change only | §4.3 |
| F13 | Cycle 13/17 | index.html doesn't exist (over-planning) | MVP first: 5 states + Chapter 1 | §1.3 |
| F14 | Cycle 10 | Regression from modifications | §14.7 full flow regression testing | §14.7 |
| F19 | Cycle 12/15 | "Half-implemented" pattern | Per-feature detailed implementation checklist | §14.3 |
| F22 | Cycle 17 | Spec-specified UI not implemented | Don't spec it if it's not in MVP | §1.3 |
| F25 | Cycle 17 (critical) | Over-planning → 0% implementation | Phase separation with clear MVP boundary | §1.3 |
| F27 | Cycle 17 | Object interactions undefined | §2.7 rune × magic circle interaction matrix | §2.7 |
| F28 | Cycle 18 | No balance verification | Constant tables (RUNE_DATA, UPGRADE_DATA) | §7.2 |
| F29 | Cycle 18 | Sound quality unverified | SFX precise event mapping + volume balance table | §13.3 |
| F35 | Cycle 20 suggestion | Shared engine module extraction | Single file maintained, §A~§C independent sections | §15.1 |

---

## §1. Game Overview & Core Fun

### 1.1 Concept

**Runeforge Tactics** is a 2-phase tactical puzzle game where the **Puzzle Phase** (strategically placing 8 rune types on a 5×5 grid to complete magic circles) alternates with the **Defense Phase** (using activated spells to repel 3-lane enemy waves).

It fills the platform's **puzzle + strategy combination = 0** — the largest genre gap.

**Core Formula**: Rune placement puzzle + magic circle pattern matching + wave defense strategy + permanent progression

### 1.2 Core Fun Elements

1. **Discovery Joy**: 8 rune types create 120+ magic circle patterns. "What will this combination do?"
2. **2-Phase Tension Shift**: Puzzle (thinking) → Defense (execution) rhythm. Strategic satisfaction when careful placement leads to powerful defense
3. **Growth Through Failure**: Discovered recipes are permanently saved. Even failed runs reward "New Recipe Found!"
4. **Procedural Variety**: Random rune drops each turn → same strategy doesn't always work → adaptive play
5. **Boss Wizard Duels**: Region bosses use magic circles too → "spell duel" with player
6. **Story Immersion**: Collect rune fragments across 5 regions to restore the Magic Tower

### 1.3 MVP Priority Strategy (F13, F25)

> **Phase divisions define MVP boundaries. Complete Phase 1 at 100% before expanding.**

**Phase 1 (MVP — Must Complete First)**
- 5 states: TITLE → STAGE_SELECT → PUZZLE → DEFENSE → RESULT
- Forest region (Chapter 1): 3 stages
- 4 basic runes (Fire/Water/Earth/Wind)
- 5×5 grid placement
- 10 basic magic circle patterns
- 3 enemy types (Slime, Goblin, Orc)
- 3-life system
- Basic scoring + crystals

**Phase 2 (Extended Runes + Chapters 2~3)**
- 4 additional runes (Thunder/Ice/Light/Dark)
- Desert & Ice regions: 6 stages
- Upgrade shop (crystal currency)
- Recipe book UI (with touch scroll)

**Phase 3 (Bosses + Chapters 4~5)**
- 3 region bosses (Treant, Sphinx, Frost Dragon)
- Volcano & Ancient Tower regions: 6 stages
- Final boss (Dark Mage) + Hidden boss (Rune Golem)
- 2 hidden stages

**Phase 4 (Polish)**
- Story narrative (regional rune history fragments)
- Achievement system (10 types)
- Weather/time visual effects
- Camera zoom/pan boss cinematics
- 3 difficulty levels (Apprentice/Mage/Archmage)

---

## §2. Game Rules & Objectives

### 2.1 Overall Structure
- 5 regions × 3 stages = **15 main stages**
- 3 region bosses + 1 final boss + 1 hidden boss = **5 boss fights**
- 2 hidden stages = **22 stages total**

### 2.2 Region Layout

| Region | Stages | Environment | Special Element | Boss |
|--------|--------|-------------|----------------|------|
| Forest | 1-1 ~ 1-3 | Green, trees, moss | None (tutorial) | Treant (HP 30) |
| Desert | 2-1 ~ 2-3 | Gold, sand, oasis | Sandstorm (vision limit) | Sphinx (HP 45) |
| Ice | 3-1 ~ 3-3 | Blue, crystals, snow | Freeze (1 cell frozen) | Frost Dragon (HP 55) |
| Volcano | 4-1 ~ 4-3 | Red, lava, rocks | Lava flow (1 row destroyed) | — |
| Ancient Tower | 5-1 ~ 5-3 | Purple, circles, stars | Chaos (random rune effect) | Dark Mage (HP 80, 3 phases) |

### 2.3 Puzzle Phase Rules
1. **3 random runes** given at turn start (inventory max: 5)
2. Player freely places runes on 5×5 grid (empty cells only)
3. Press "Activate" → grid scans for **magic circle pattern matches**
4. Matched circles become **spells for Defense Phase**
5. Unmatched runes become **0.5× weakened basic attacks**
6. Time limit: 30 seconds per stage (adjusted by difficulty)

### 2.4 Defense Phase Rules
1. Enemies advance right→left across 3 lanes
2. Spells **auto-fire** (1-second intervals)
3. Higher-grade circles = stronger effects
4. All enemies defeated = **Stage Clear**
5. Enemy reaches left = **Life -1**
6. Life 0 = Game Over

### 2.5 Victory Conditions
- Clear all 5 regions + bosses = **Ending**
- Clear both hidden stages = **True Ending**

### 2.6 Rune System

| Rune | Color | Base Dmg | Effect | Circle Bonus |
|------|-------|---------|--------|-------------|
| Fire | #FF4444 | 15 | — | AoE explosion |
| Water | #4488FF | 12 | 30% slow | Pierce + slow |
| Earth | #88AA44 | 8 | Shield 20 | Wall creation |
| Wind | #AADDFF | 8 | Knockback 2 | Full knockback |
| Thunder | #FFDD00 | 10 | Chain 3 | Instant kill chance |
| Ice | #88EEFF | 10 | Freeze 2s | AoE freeze |
| Light | #FFFFAA | 10 | Heal 15 | Full heal |
| Dark | #8844AA | 18 | 5/s DoT | Instant kill + self-dmg |

### 2.7 Rune × Magic Circle Interaction Matrix (F27)

**10 Basic Patterns**:

| Pattern | Shape | Runes | Multiplier | Description |
|---------|-------|-------|-----------|-------------|
| Line-3 | ─/│ | Same ×3 | 2.0× | Basic |
| L-Shape | ┘ ×4 rot | 2 types ×3 | 1.8× | Main + secondary |
| T-Shape | ┴ ×4 rot | 2 types ×4 | 2.5× | Enhanced + range |
| Cross | ✚ | 1 center +4 | 3.0× | Maximized |
| Square | ■ | Same ×4 | 2.8× | Explosive AoE |
| Diagonal-3 | ╲/╱ | Same ×3 | 2.2× | Piercing |
| X-Shape | ╳ | Same ×5 | 3.5× | Omni-directional |
| Double Line | ═ | Same ×6 | 4.0× | Ultra-powerful |
| Mixed Cross | ✚ all diff | 5 types ×5 | 3.8× | Full screen |
| Secret | Special | Special | 5.0× | From recipe book |

**Compound Bonuses** (2+ simultaneous):
- Same element ×2 = **Elemental Surge** (1.5× damage)
- Opposing elements = **Elemental Clash** (2× range)
- 3+ simultaneous = **Magic Storm** (full-screen AoE)

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| Arrows/WASD | Grid cursor |
| Space/Enter | Place/Confirm |
| 1~5 | Select rune |
| R | Undo placement |
| Q | Activate circles |
| Tab | Recipe book |
| Esc/P | Pause |
| M | Mute |

### 3.2 Mouse
| Action | Description |
|--------|-------------|
| Click inventory | Select rune |
| Click grid | Place rune |
| Right-click | Retrieve rune |
| Wheel | Scroll lists |
| Click activate | Activate circles |

### 3.3 Touch
| Action | Description |
|--------|-------------|
| Tap inventory | Select |
| Tap grid | Place |
| Long press | Retrieve (300ms) |
| Drag inv→grid | Drag & drop |
| Swipe lists | Touch scroll (F32) |
| Tap activate | Activate |
| Two-finger tap | Pause |

### 3.4 Tutorial Overlay (F34)
- First-play 3-step overlay: Select → Place → Activate
- Touch area dotted guides
- `localStorage.setItem('rft_tutorial', '1')` — once only

---

## §4. Visual Style Guide

### 4.1 Color Palette (F33 — No external fonts/CDN)
```
Background: #1A1A2E → #16213E gradient
Grid empty: #2A2A4A (border #3A3A6A)
Grid active: #3A3A6A (highlight #5050AA)
Grid preview: #4A3A6A (gold border #FFD700)
UI text: #E0E0FF | UI accent: #FFD700
HP: #FF4444→#44FF44 | Mana: #4488FF→#88CCFF
Crystal: #00FFCC
```

Region colors: Forest (#2D5A27), Desert (#C4A035), Ice (#1A3A5A), Volcano (#4A1A0A), Tower (#2E1A4A)

Font: System monospace (`'Courier New', Courier, monospace`)

### 4.2 Objects (F6 — No SVG filters, Canvas shadowBlur only)
- **8 Runes** (60×60px): Canvas API direct drawing with gradients
- **8 Enemies** (40×40px): Geometric shapes with HP bars
- **5 Bosses** (120×120px+): Large-scale animated forms

### 4.3 Background (F10 — Offscreen caching)
`buildGridCache()` renders static elements once. Rebuild on resize/stage change only.

### 4.4 Camera Effects
- Boss entrance: 0.5s zoom-out(0.8×) → silhouette → 1s zoom-in(1.0×)
- Circle activation: 0.3s zoom-in(1.2×) → effect → 0.3s zoom-out(1.0×)
- Stage clear: 0.5s slow-motion(0.3× timeScale)

### 4.5 Weather Effects
Forest: falling leaves | Desert: sandstorm | Ice: snow | Volcano: embers | Tower: magic particles

### 4.6 Destructible Objects
Forest: bushes (20% rune drop) | Desert: jars (crystal) | Ice: pillars (AoE freeze) | Volcano: magma (DoT) | Tower: barriers (buff)

### 4.7 Touch Scroll (F32 — with numerical specs)
```
MOMENTUM_DECAY: 0.92 | MAX_MOMENTUM: 30px/frame
BOUNCE_FACTOR: 0.3 | SCROLL_THRESHOLD: 5px
Full touchstart→touchmove→touchend path
```

---

## §5–§18: (Same structure as Korean version)

Please refer to the Korean spec (cycle-21-spec.md) for the complete detailed content of sections §5 through §18, which cover:

- §5. Core Game Loop (per-frame logic)
- §6. State Machine (12 states, priority map, state×system matrix)
- §7. Difficulty System (region scaling, 3 modes, boss specs)
- §8. Scoring System (points, crystals, upgrade tree)
- §9. Story/Narrative (5-region journey, hidden stages)
- §10. Replay System (random generation, strategy paths, achievements)
- §11. Asset List (24 Canvas drawing functions, thumbnail SVG)
- §12. Mobile Support (responsive canvas, input detection, touch targets)
- §13. Sound System (BGM, 10 SFX, volume table, zero setTimeout)
- §14. Verification Checklists (init order, variables, features, numerics, file system, prohibited patterns, regression flow)
- §15. Code Structure (§A~§L sections, pure functions, single update paths)
- §16. Internationalization (ko/en text table)
- §17. Persistent Progression (localStorage schema, save/load rules)
- §18. Sidebar/GameCard Metadata

### §18. Sidebar / GameCard Metadata

```yaml
game:
  title: "Runeforge Tactics"
  description: "Place ancient runes to complete magic circles and repel enemy waves with spells. Discover 120+ combinations across 22 stages in 5 regions!"
  genre: ["puzzle", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "Arrow/WASD: Move grid cursor"
    - "Space: Place rune"
    - "1~5: Select rune"
    - "Q: Activate magic circles"
    - "R: Undo placement"
    - "Tab: Recipe book"
    - "Touch: Tap to select & place, drag & drop"
  tags: ["#puzzle", "#strategy", "#magic", "#runes", "#tower-defense", "#roguelite", "#procedural", "#progression"]
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

```yaml
# GameCard
thumbnail: "games/runeforge-tactics/thumbnail.svg"
title: "Runeforge Tactics"
description: "Complete magic circles with ancient runes and repel enemy waves"
genre: ["puzzle", "strategy"]
playCount: 0
addedAt: "2026-03-22"  # Within 7 days → "NEW" badge
featured: true          # ⭐ badge
```

---

_InfiniTriX Game Spec — Cycle #21 — Runeforge Tactics_
_https://infinitrix-games.vercel.app_
