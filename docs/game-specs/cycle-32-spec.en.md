---
game-id: spectral-sleuth
title: Spectral Sleuth
genre: puzzle, casual
difficulty: medium
---

# Spectral Sleuth — Cycle #32 Game Design Document

> **One-Page Summary**: A murdered detective returns as a ghost, using supernatural abilities (Clairvoyance, Empathy, Time Rewind) to uncover invisible clues and solve crimes through logic puzzles — a **mystery puzzle adventure**. 5 districts × 3 cases = 15 base stages + 1 hidden cold case = **16 total stages**. District bosses (suspect confrontations) × 5 + hidden boss "Shadow Puppeteer" = **6 boss encounters**. Ghost ability tree with 3 branches (Clairvoyance/Empathy/Rewind) × 5 levels, 8 investigation tools, 40+ archive entries. Randomized clue placement + multiple solution paths + suspect behavior variations ensure high replay value. **Strengthens puzzle+casual combo from 2→3 games**, introduces the platform's first detective theme. Achieves 8 consecutive cycles of unique genre combinations (#25~#32).

> **MVP Boundary**: Phase 1 (Core loop: Explore→Collect→Deduce→Confront→Boss, Districts 1-2 + 2 bosses + 3 basic ghost abilities + 4 tools + basic archive) → Phase 2 (Districts 3-5 + 3 bosses + hidden boss + full narrative + ability evolution + 4 additional tools). **Phase 1 must deliver a complete game experience on its own.**

---

## §0. Feedback Mapping (Previous Cycle Lessons)

### Verified Patterns (platform-wisdom reference) ✅
> Items below have been verified across 15-21+ cycles and are detailed in platform-wisdom.md. Only the application section is noted here.

| ID | Lesson Summary | Applied In |
|----|---------------|------------|
| F1 | No assets/ directory — 15 consecutive cycles of success [Cycle 1~31] | §4.1 |
| F2 | Zero external CDN/fonts [Cycle 1] | §4.1 |
| F3 | No confirm()/alert() in iframe → Canvas modals [Cycle 1] | §6.4 |
| F4 | Zero setTimeout → tween onComplete only [Cycle 1~2] — targeting 20 consecutive cycles | §5.2 |
| F5 | Guard flags for single-execution tween callbacks [Cycle 3 B1] | §5.2 |
| F6 | STATE_PRIORITY + beginTransition system [Cycle 3 B2] | §6.1 |
| F7 | State × System matrix required [Cycle 2 B1] | §6.2 |
| F8 | Evaluate first, save later [Cycle 2 B4] | §11.1 |
| F9 | Pure function pattern (ctx, gt, x, y, size, ...state) [Cycle 6~7] | §4.4 |
| F10 | Numerical consistency table (spec = code 1:1) [Cycle 7] | §14.1 |
| F11 | Touch targets min 48×48px + Math.max enforcement [Cycle 12~22] | §3.3 |
| F12 | TDZ prevention: empty object init → fill in init() [Cycle 5~11, Cycle 31 P0] | §5.1 |
| F13 | TweenManager clearImmediate() API separation [Cycle 4 B1] | §5.2 |
| F14 | Single update path per value (tween vs direct assignment) [Cycle 5 B2] | §5.2 |
| F15 | Smoke test gates [Cycle 22~31] | §14.3 |
| F16 | Unified hitTest() function [Cycle 27 F60] | §3.3 |
| F17 | bossRewardGiven flag pattern [Cycle 27] | §7.5 |
| F18 | SeededRNG only (zero Math.random) [Cycle 19~31] | §5.2, §14.3 |
| F19 | `gt` parameter naming (draw function signatures) [Cycle 29 P0] | §4.4 |

### New Feedback (Cycle 31 Post-Mortem) 🆕

| ID | Lesson | Solution | Applied In |
|----|--------|----------|------------|
| F86 | 3 review rounds needed — TDZ empty init delay | **INIT_EMPTY pattern**: all global state objects initialized with empty structure at declaration. Full object table in §5.1 | §5.1 |
| F87 | Shared engine still not extracted after 31 cycles | 10 REGION structure + export function lists per REGION in §5.3 + unidirectional dependency diagram | §5.3 |
| F88 | Combat balance unverified (excessive combination space) | Pivot to puzzle-based game to reduce balance variables. Puzzle difficulty controlled by 3 variables: clue count / time limit / wrong answer tolerance. Formula in §8.1 | §8.1 |
| F89 | Small display (≤400px) deep verification incomplete | 5-tier viewport matrix (320/375/400/768/1024px) in §3.3. Target: zero button overlap at 320px | §3.3, §14.4 |
| F90 | ESCAPE_ALLOWED 12-state full coverage success → same pattern here | Full state transition dictionary in §6.1 | §6.1 |

### Previous Cycle Pain Points → Resolution Mapping

| Cycle 31 Pain Point | Resolution Section | Method | Verification Criteria |
|---------------------|-------------------|--------|----------------------|
| 3 review rounds (TDZ P0) | §5.1 | INIT_EMPTY: all globals with empty initial values | Zero TDZ crashes in 1st review |
| Shared engine not extracted | §5.3 | 10 REGION + export lists + dependency direction | Zero circular refs, zero cross-REGION direct refs |
| Combat balance unverified | §8.1 | Puzzle difficulty reduced to 3 variables | Extreme case validation table in Appendix A |
| Small display incomplete | §3.3 | 5-tier viewport matrix + 320px layout | Zero button overlap at 320px |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
Spectral Sleuth is a **mystery puzzle adventure** where murdered detective "Lucian Grey" returns as a ghost to uncover the truth behind his own death and a chain of supernatural crimes plaguing the city. Players use three ghost abilities — Clairvoyance, Empathy, and Time Rewind — to discover clues invisible to the living, then combine evidence through logic puzzles to identify the culprit.

The core differentiator is a 3-axis system: "Ghost Ability Exploration × Evidence Combination Puzzles × Confrontation Boss Battles." Non-combat boss battles where you defeat suspects through **deduction and argumentation** represent a platform-first innovative experience.

### 1.2 Core Fun: 3 Axes
1. **Spectral Investigation**: Use Clairvoyance to detect hidden fingerprints/bloodstains, Empathy to read residual emotions, Time Rewind to replay past scenes. Secret clues accessible only through ability combinations.
2. **Evidence Puzzle**: Connect 3-5 collected clues into a logical "Deduction Chain." Each case has multiple solution paths (minimum 2) for replay value.
3. **Confrontation Boss**: Turn-based argumentation where you find contradictions in suspect testimony and present evidence. Phoenix Wright-style confrontation adapted for casual play. Wrong answers reduce "Credibility" — reaching 0 means case failure.

### 1.3 Story Overview
- **Setting**: "Misthaven" — a 1920s Art Deco port city
- **Prologue**: Master detective Lucian Grey is murdered at home. He awakens as a ghost to track his killer.
- **Development**: Solving cases across 5 districts reveals a massive conspiracy connected to his death.
- **Conclusion**: Hidden boss "Shadow Puppeteer" is behind all the city's crimes. Final confrontation reveals the truth.
- **Environmental Storytelling**: Dialogue kept to 3 lines or fewer + visual storytelling (past afterimages visible only in ghost vision) to minimize text while maintaining depth. [F82]

---

## §2. Game Rules & Objectives

### 2.1 Main Game Loop
```
[Exploration Mode] → Investigate scene with ghost abilities
        ↓
[Clue Collection] → Add to evidence inventory
        ↓
[Evidence Puzzle] → Complete deduction chain with 3-5 clues
        ↓
[Confrontation Boss] → Present evidence against suspect testimony
        ↓
[Case Solved] → Rewards (ability points, tools, archive unlocks)
        ↓
[Upgrade Menu] → Proceed to next case
```

### 2.2 Objectives
- **Immediate**: Identify the culprit and prove it in confrontation
- **District**: Solve all 3 cases → unlock district boss (key suspect) confrontation
- **Final**: Clear all 5 districts + discover hidden case → uncover truth of Lucian's death
- **100% Completion**: Full archive + all alternative solution paths discovered

### 2.3 Core Resources
| Resource | Description | Gained | Spent |
|----------|-------------|--------|-------|
| Ether | Ghost ability cost | Clue found +5, Case solved +20 | Clairvoyance -3, Empathy -5, Rewind -8 |
| Credibility | Confrontation boss HP | 100 at case start | Wrong answer -15~25, Hint use -10 |
| Soul Fragment | Permanent upgrade currency | Boss clear +3, Hidden clue +1 | Ability upgrade 1~5 each |
| Archive Point | Archive unlock helper | New clue found +1 | Auto-consumed |

### 2.4 Ghost Ability System
| Ability | Lv1 Effect | Lv3 Effect | Lv5 (Max) Effect | Ether Cost |
|---------|-----------|-----------|------------------|------------|
| Clairvoyance | Detect hidden fingerprints | See through walls | Decode sealed documents | 3 |
| Empathy | Read residual emotions (joy/anger/fear) | Hear past dialogue fragments | Auto-detect lies | 5 |
| Time Rewind | Replay 3-second scene | 30-second replay + object tracking | Full 1-hour replay | 8 |

---

## §3. Controls

### 3.1 Keyboard
| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move Lucian (8-directional) |
| 1, 2, 3 | Select ghost ability (Clairvoyance/Empathy/Rewind) |
| Space | Use ability / Collect clue / Present evidence |
| E | Interact (open door, talk to NPC, examine object) |
| Tab | Toggle evidence inventory |
| Q | Toggle deduction board |
| Escape | Pause menu (ESCAPE_ALLOWED states only) |

### 3.2 Mouse
| Input | Action |
|-------|--------|
| Left Click | Set movement target / Click to collect clue / Present evidence |
| Right Click | Use ability (target at cursor position) |
| Scroll | Zoom in/out on deduction board |
| Drag | Connect evidence cards on deduction board |

### 3.3 Touch (Mobile)
| Input | Action |
|-------|--------|
| Tap | Move / Collect clue / Present evidence (unified hitTest §F16) |
| Double Tap | Interact (replaces E key) |
| Long Press (500ms) | Use ability |
| Two-finger Pinch | Deduction board zoom |
| Swipe | Evidence inventory scroll |

**Touch Targets**: All interactive elements minimum `Math.max(48, vw * 0.12)`px [F11]

### Viewport Matrix [F83, F89]
| Viewport | Game Area | Control UI | Evidence Panel |
|----------|-----------|------------|---------------|
| 320px | 320×240 | Bottom fixed 36px | Fullscreen overlay |
| 375px | 375×280 | Bottom fixed 40px | Fullscreen overlay |
| 400px | 400×300 | Bottom fixed 44px | Right slide panel |
| 768px | 600×450 | Bottom fixed 48px | Right side panel |
| 1024px+ | 800×600 | Bottom fixed 52px | Right side panel |

320px Layout (ASCII):
```
┌──────────────────┐
│   Game Screen     │
│   (320×200)       │
├──────────────────┤
│[Abl1][Abl2][Abl3]│ ← 36px fixed
│[Evid][Dedu][Menu] │
└──────────────────┘
```

1024px+ Layout (ASCII):
```
┌─────────────────────────┬──────────┐
│                         │ Evidence │
│   Game Screen (800×600) │  Panel   │
│                         │ (200px)  │
├─────────────────────────┴──────────┤
│[Abl1][Abl2][Abl3] | [Evid][Dedu][Menu] │ ← 52px fixed
└────────────────────────────────────┘
```

---

## §4. Visual Style Guide

### 4.1 Core Principles
- **100% Canvas Code Drawing**: Absolutely no assets/ directory [F1]
- **Zero External Resources**: No CDN, Google Fonts, or external images [F2]
- **Zero ASSET_MAP / SPRITES / preloadAssets code** [F1]

### 4.2 Color Palette
| Purpose | Color | HEX |
|---------|-------|-----|
| Background (night city) | Deep Navy | #0B1426 |
| Buildings/Environment | Slate Gray | #2D3748 |
| Ghost Lucian | Ethereal Cyan | #00D4FF (alpha 0.7) |
| Ghost Glow | Soft Cyan | #7FEFFF (alpha 0.3) |
| Clue Highlight | Amber Gold | #FFB800 |
| Danger/Wrong | Crimson Red | #FF3366 |
| Correct/Success | Emerald Green | #00FF88 |
| Text Primary | Off White | #E8E8E8 |
| Text Secondary | Mist Gray | #8899AA |
| Art Deco Accents | Bronze Gold | #C4953A |
| Suspect Highlight | Purple Haze | #9B59B6 |
| Credibility Bar | Light Blue | #5DADE2 |

### 4.3 Visual Theme: 1920s Art Deco × Ghost World
- **Buildings**: Geometric Art Deco style — straight lines, triangular ornaments, symmetric patterns
- **Lighting**: Gas lamp circular light sources + ghost vision (cyan glow overlay)
- **Ghost Effect**: Lucian rendered semi-transparent cyan, afterimage trail on movement (5 frames)
- **Clairvoyance Mode**: Full-screen ethereal filter (brightness +20%, saturation -50%, cyan tint)
- **Empathy Mode**: Emotion-colored aura around targets (joy=gold/anger=red/fear=purple/sadness=blue)
- **Time Rewind Mode**: Sepia tone + VHS noise effect + reverse-playback particles
- **Weather Effects**: District-specific — fog (port), rain (alleys), snow (upper district), dust (warehouse), ether particles (hidden)
- **Time of Day**: Per-case — dusk, midnight, dawn (background hue auto-transitions)

### 4.4 Canvas Drawing Pure Function Pattern [F9, F19]
All draw functions follow this signature:
```javascript
function drawLucian(ctx, gt, x, y, dir, mode, alpha) { ... }
function drawClue(ctx, gt, x, y, type, discovered, glow) { ... }
function drawBuilding(ctx, gt, x, y, w, h, style, timeOfDay) { ... }
function drawSuspect(ctx, gt, x, y, emotion, speaking) { ... }
```
- `ctx`: Canvas 2D context (always first parameter)
- `gt`: Game time/tick (always second parameter) [F19]
- Subsequent: Position, size, state parameters — **no direct global variable references** [F9]

### 4.5 Character Assets (Canvas Code)
| Asset | Size | Poses/Variants | Description |
|-------|------|---------------|-------------|
| Lucian (Ghost) | 32×48 | 8-dir movement + 3 ability cast + idle = 12 poses | Semi-transparent cyan, trenchcoat silhouette |
| Suspects A~E | 40×56 | Normal + agitated + angry + confessing = 4 poses | Unique per-district characters |
| Boss Cutscene | 120×80 | Entrance + confrontation + defeat = 3 poses | Large upper-body portrait |
| NPC Citizens | 24×40 | Walking + idle = 2 poses | Background atmosphere |
| Clue Objects | 16×16~24×24 | Undiscovered (transparent) + discovered (glow) | Fingerprint/letter/weapon/photo etc. |

### 4.6 Environment Assets (Canvas Code)
| Asset | Description | Interactive Elements |
|-------|-------------|---------------------|
| Port Dock | Wooden planks, ropes, crane | Crane operation (Time Rewind reveals movement path) |
| Back Alleys | Brick walls, gas lamps, trash bins | Search trash bins (Empathy detects hidden items) |
| Upper District Mansion | Marble columns, chandelier, stairs | Secret safe behind fireplace (Clairvoyance reveals) |
| Warehouse District | Metal shelves, wooden crates, forklift | Crate movement patterns (Time Rewind tracks) |
| Hidden: Underground Shrine | Stone arches, candles, altar | Altar inscription (Clairvoyance Lv5 only) |

---

## §5. Core Game Loop (Frame-Level Logic)

### 5.1 Global State Initialization — INIT_EMPTY Pattern [F12, F86]

**All global objects are initialized with empty structure at declaration.** Actual values filled in init().

```javascript
// ✅ INIT_EMPTY: Empty structure initialization at declaration
const G = {
  state: 'TITLE',
  lucian: { x: 0, y: 0, dir: 0, mode: 'normal', alpha: 1 },
  evidence: [],
  abilities: { clairvoyance: 1, empathy: 1, rewind: 1 },
  ether: 50,
  credibility: 100,
  soulFragments: 0,
  archivePoints: 0,
  currentZone: 0,
  currentCase: 0,
  upgrades: { clairvoyance: 0, empathy: 0, rewind: 0 },
  discoveredClues: {},
  solvedCases: {},
  settings: { lang: 'en', sfxVol: 0.7, bgmVol: 0.5 }
};

// TweenManager, ObjectPool, SoundManager — all declared empty
const tw = { _tweens: [], _pendingCancel: false };
const pool = { _pools: {} };
const snd = { _ctx: null, _gains: {} };
```

### 5.2 Main Loop (60fps)
```
requestAnimationFrame(loop)
  ├─ dt calculation (cap: 1/30)
  ├─ InputManager.poll()        — collect input
  ├─ tw.update(dt)              — TweenManager update [F4: zero setTimeout]
  │   └─ clearImmediate() API separation [F13]
  │   └─ Single update path per value [F14]
  │   └─ Guard flag single-execution [F5]
  ├─ ACTIVE_SYSTEMS[G.state]-based updates:
  │   ├─ updateExploration(dt)  — movement, collision, ghost abilities
  │   ├─ updatePuzzle(dt)       — evidence combination logic
  │   ├─ updateConfrontation(dt)— confrontation boss logic
  │   └─ updateUI(dt)           — HUD, menus, transition effects
  ├─ render(ctx, gt)
  │   ├─ drawBackground(ctx, gt, zone, timeOfDay, weather)
  │   ├─ drawEntities(ctx, gt)  — pure function calls [F9]
  │   ├─ drawEffects(ctx, gt)   — ghost effects, weather, particles
  │   ├─ drawHUD(ctx, gt)       — ether/credibility bars, minimap
  │   └─ drawTransition(ctx, gt)— fade/wipe transitions
  └─ SeededRNG state update [F18]
```

### 5.3 10 REGION Code Structure [F87]

| # | REGION | Responsibility | Export Functions |
|---|--------|---------------|-----------------|
| 1 | CONFIG | Constants, balance values, i18n text | `C`, `LANG`, `BALANCE` |
| 2 | ENGINE | TweenManager, ObjectPool, SeededRNG, SoundManager | `tw`, `pool`, `rng`, `snd` |
| 3 | ENTITY | Lucian, suspects, NPCs, clue objects | `createLucian()`, `createSuspect()`, `createClue()` |
| 4 | DRAW | All pure drawing functions | `drawLucian()`, `drawClue()`, `drawBuilding()`, `drawSuspect()`, `drawBoss()`, `drawWeather()`, `drawHUD()` |
| 5 | ABILITY | Ghost ability system (Clairvoyance/Empathy/Rewind) | `useClairvoyance()`, `useEmpathy()`, `useRewind()`, `canUseAbility()` |
| 6 | PUZZLE | Evidence combination puzzle logic | `checkChain()`, `getValidChains()`, `evaluateDeduction()` |
| 7 | CONFRONT | Confrontation boss system | `startConfrontation()`, `presentEvidence()`, `checkContradiction()`, `getBossDialogue()` |
| 8 | STATE | State machine, transition guards | `beginTransition()`, `ESCAPE_ALLOWED`, `RESTART_ALLOWED`, `ACTIVE_SYSTEMS` |
| 9 | SAVE | LocalStorage save/load | `saveProgress()`, `loadProgress()`, `resetProgress()` |
| 10 | MAIN | Initialization, main loop, event binding | `init()`, `loop()`, `resize()` |

**Dependency Direction**: CONFIG → ENGINE → ENTITY → DRAW → ABILITY → PUZZLE → CONFRONT → STATE → SAVE → MAIN (unidirectional, zero circular references)

---

## §6. State Machine

### 6.1 Game States & Transitions [F6, F90]

```
TITLE → INTRO_CUTSCENE → ZONE_MAP → CASE_BRIEFING → EXPLORATION
  → EVIDENCE_FOUND → PUZZLE_BOARD → DEDUCTION_RESULT
  → CONFRONTATION_INTRO → CONFRONTATION → BOSS_REWARD
  → CASE_SOLVED → UPGRADE_MENU → ZONE_MAP (repeat)
  → GAME_COMPLETE → CREDITS → TITLE
  (special) → PAUSE → return to previous state
  (special) → SETTINGS → return to PAUSE
```

**ESCAPE_ALLOWED Dictionary** (all states explicit):
```javascript
const ESCAPE_ALLOWED = {
  TITLE: [],
  INTRO_CUTSCENE: ['TITLE'],
  ZONE_MAP: ['PAUSE'],
  CASE_BRIEFING: ['ZONE_MAP'],
  EXPLORATION: ['PAUSE'],
  EVIDENCE_FOUND: [],  // auto-transition — ESC disabled
  PUZZLE_BOARD: ['EXPLORATION'],
  DEDUCTION_RESULT: [], // auto-transition
  CONFRONTATION_INTRO: [], // cutscene — ESC disabled
  CONFRONTATION: ['PAUSE'],
  BOSS_REWARD: [],  // selection required
  CASE_SOLVED: [],  // auto-transition
  UPGRADE_MENU: ['ZONE_MAP'],
  GAME_COMPLETE: ['CREDITS'],
  CREDITS: ['TITLE'],
  PAUSE: ['__PREVIOUS__'],
  SETTINGS: ['PAUSE']
};

const RESTART_ALLOWED = {
  CONFRONTATION: ['CASE_BRIEFING'],  // restart case on confrontation failure
  GAME_COMPLETE: ['TITLE']
};
```

**STATE_PRIORITY** (higher number = higher priority):
```javascript
const STATE_PRIORITY = {
  TITLE: 0, ZONE_MAP: 1, CASE_BRIEFING: 2,
  EXPLORATION: 3, EVIDENCE_FOUND: 4, PUZZLE_BOARD: 5,
  DEDUCTION_RESULT: 6, CONFRONTATION_INTRO: 7,
  CONFRONTATION: 8, BOSS_REWARD: 9, CASE_SOLVED: 10,
  UPGRADE_MENU: 3, GAME_COMPLETE: 11, CREDITS: 0,
  PAUSE: 99, SETTINGS: 100
};
```

### 6.2 State × System ACTIVE_SYSTEMS Matrix [F7]

| State | Tween | Input Mode | Explore | Puzzle | Confront | HUD | Sound | Weather |
|-------|-------|-----------|---------|--------|----------|-----|-------|---------|
| TITLE | ✅ | menu | — | — | — | — | bgm_title | — |
| INTRO_CUTSCENE | ✅ | cutscene | — | — | — | — | bgm_intro | — |
| ZONE_MAP | ✅ | menu | — | — | — | mini | bgm_map | — |
| CASE_BRIEFING | ✅ | menu | — | — | — | mini | bgm_zone | — |
| EXPLORATION | ✅ | **game** | ✅ | — | — | ✅ | bgm_zone | ✅ |
| EVIDENCE_FOUND | ✅ | **limited** | — | — | — | ✅ | sfx_found | ✅ |
| PUZZLE_BOARD | ✅ | **puzzle** | — | ✅ | — | ✅ | bgm_puzzle | — |
| DEDUCTION_RESULT | ✅ | cutscene | — | — | — | ✅ | sfx_result | — |
| CONFRONTATION_INTRO | ✅ | cutscene | — | — | — | — | bgm_boss | — |
| CONFRONTATION | ✅ | **confront** | — | — | ✅ | ✅ | bgm_boss | — |
| BOSS_REWARD | ✅ | menu | — | — | — | — | sfx_reward | — |
| CASE_SOLVED | ✅ | cutscene | — | — | — | — | sfx_solved | — |
| UPGRADE_MENU | ✅ | menu | — | — | — | mini | bgm_upgrade | — |
| GAME_COMPLETE | ✅ | cutscene | — | — | — | — | bgm_ending | — |
| CREDITS | ✅ | menu | — | — | — | — | bgm_credits | — |
| PAUSE | ✅ | menu | — | — | — | — | _(mute)_ | — |
| SETTINGS | ✅ | menu | — | — | — | — | _(mute)_ | — |

> **Input Mode Granularity** [Cycle 26 lesson]: game (full movement+abilities), limited (confirm only), puzzle (drag+connect), confront (evidence select+present), menu (click/tap), cutscene (skip only)

### 6.3 Transition Animations
All state transitions must go through `beginTransition(targetState, transitionType)` [F5, F6]:
- **Fade**: TITLE↔ZONE_MAP, CASE_SOLVED→UPGRADE_MENU (0.5s)
- **Wipe**: ZONE_MAP→CASE_BRIEFING, CASE_BRIEFING→EXPLORATION (0.3s)
- **Zoom In**: EXPLORATION→EVIDENCE_FOUND (0.2s)
- **Slide**: EXPLORATION→PUZZLE_BOARD (0.3s)
- **Dramatic Fade**: CONFRONTATION_INTRO→CONFRONTATION (1.0s, blackout + spotlight)

### 6.4 Canvas-Based Modals [F3]
- Confirm/Cancel dialogs: Canvas rendered (absolutely no confirm/alert)
- Settings menu: Canvas-based sliders + toggles
- Evidence detail: Canvas overlay panel

---

## §7. Cases & District Design

### 7.1 District Structure: 5 Districts × 3 Cases + Hidden

| District | Theme | Case 1 | Case 2 | Case 3 | Boss (Suspect) |
|----------|-------|--------|--------|--------|---------------|
| 1. Port | Smuggling | Missing Sailor | Cargo Tampering | Smuggling Ring Deal | "Viper" Victor |
| 2. Back Alleys | Fraud | Counterfeit Bills | Insurance Fraud | Gang Money Laundering | "Mirror" Marian |
| 3. Upper District | Betrayal | Inheritance Dispute | Double Identity | Secret Society Ritual | "Count" Leopold |
| 4. Warehouse | Cover-up | Evidence Destruction | Missing Witness | Police Corruption | "Iron Mask" Inspector |
| 5. City Hall | Conspiracy | Mayor Blackmail | Election Rigging | City Overthrow Plot | "Puppeteer" Councilor |
| Hidden | Truth | Lucian's Murder | — | — | "Shadow Puppeteer" |

### 7.2 Case Structure Details
Each case follows this structure:
1. **Briefing** (CASE_BRIEFING): Case overview, victim/person of interest intro (3 lines max)
2. **Exploration** (EXPLORATION): Discover 3-5 clues using ghost abilities
   - Required clues: 3 (must be in correct deduction chain)
   - Optional clues: 1-2 (for alternate chains or archive points)
3. **Deduction** (PUZZLE_BOARD): Connect clues to complete deduction chain
4. **Confrontation** (CONFRONTATION): Testimony battle with suspect

### 7.3 District Environmental Hazards [F84]
| District | Hazard | Effect | Values | Counter |
|----------|--------|--------|--------|---------|
| 1. Port | Dense Fog | Reduced vision range | Vision radius 60% → 100% with Clairvoyance | Clairvoyance Lv2+ |
| 2. Back Alleys | Spirit Residue | Natural ether drain | -1/3sec | Empathy Lv2+ (nullifies) |
| 3. Upper District | Magic Barrier | Increased ability cooldown | Cooldown ×1.5 | Rewind Lv3+ (cooldown reduction) |
| 4. Warehouse | Sealed Zones | Certain areas inaccessible | Requires Clairvoyance Lv3+ | Clairvoyance Lv3+ |
| 5. City Hall | Ether Distortion | Empathy accuracy reduced | 30% false emotions mixed in | Empathy Lv4+ (filtering) |
| Hidden | Time Warp | Rewind range limited | Max 10-second replay | Rewind Lv5 (removes limit) |

### 7.4 Clue System
- **Clue Types**: Physical (fingerprint/weapon/letter), Emotional (residual feelings/fear traces), Temporal (past scenes/movement paths)
- **Discovery Conditions**: Ghost ability type + level requirements
- **Randomization**: SeededRNG for clue placement variation (random selection from 3~5 positions) [F18]
- **Multiple Solution Paths**: Each case has minimum 2 valid deduction chains (required 3 + optional clue combos)

### 7.5 Confrontation Boss Details
- **Structure**: 3-5 round turn-based. Each round: Suspect testimony → Find contradiction → Present evidence.
- **Contradiction Types**: Time inconsistency, alibi conflict, evidence-testimony mismatch, motive contradiction
- **Correct Answer**: Suspect agitated → new testimony → next round
- **Wrong Answer**: Credibility -15 (normal) / -25 (wrong key evidence). Credibility 0 = case failed → RESTART_ALLOWED
- **Boss Reward**: 3 Soul Fragments + 1 tool + archive unlock (bossRewardGiven flag ensures single delivery) [F17]
- **Hidden Boss "Shadow Puppeteer"**: 7-round confrontation. Requires evidence from all 5 previous bosses for integrated deduction.

---

## §8. Difficulty System

### 8.1 3-Tier Base Difficulty
| Difficulty | Credibility | Ether Regen | Wrong Penalty | Hints | Clue Display |
|-----------|-------------|-------------|--------------|-------|-------------|
| Apprentice (Easy) | 150 | +2/sec | -10 | Unlimited (-5 cred) | Sparkle when near |
| Detective (Medium) | 100 | +1/sec | -15~25 | 3 per case (-10) | Only with ability use |
| Legend (Hard) | 75 | +0.5/sec | -20~30 | 1 per case (-15) | Exact ability+position |

### 8.2 DDA Dynamic Difficulty Adjustment [F88]
3-variable formula:
```
Difficulty Score = (required_clues × 3) + (time_limit_modifier) + (wrong_tolerance_inverse × 5)
```

| DDA Condition | Adjustment |
|--------------|------------|
| 2 consecutive S-rank cases | Env hazard values ×1.2, optional clues -1 |
| 2 consecutive failures | Hints +1, wrong penalty ×0.8 |
| 1st-round correct in confrontation | Next boss rounds +1 |
| Credibility below 30% | Bonus hint provided |

Formula assumption: Players use hints 50% of the time [Cycle 24 lesson]. If assumption wrong, DDA applies ±1 additional tier correction.

### 8.3 Extreme Case Validation [F88]
| Scenario | Expected Result | Fallback |
|----------|----------------|----------|
| All hints used + credibility 30% | DDA bonus hint triggers | Case restart allowed |
| All optional clues collected | Alternate chain immediately solvable | Bonus +1 soul fragment |
| Entering district 4 without upgrades | Env hazard blocks progress | Zone select shows "recommended ability level" warning |

---

## §9. Narrative System

### 9.1 Text Management [F82]
- All narrative text in CONFIG REGION's `LANG` constant object as JSON-like structure
- Dialogue: **3 lines maximum** (name: "text" format)
- Environmental storytelling: Visual effects (past afterimages visible only in ghost vision, emotion auras) supplement text
- Bilingual support: Korean default, English switchable

### 9.2 District Atmosphere
| District | Time | Weather | Ambient Sound | Emotional Tone |
|----------|------|---------|--------------|---------------|
| Port | Dusk | Dense fog | Waves+seagulls+ship horn | Anxiety (deep teal) |
| Back Alleys | Midnight | Light rain | Rain+cats+distant jazz | Fear (purple+red) |
| Upper District | Evening | Clear | Classic piano+clock ticking | Tension (gold+black) |
| Warehouse | Dawn | Dusty wind | Machinery+rats+wind | Suspicion (gray+brown) |
| City Hall | Afternoon | Snow(winter) | Fountain pen+bells+murmur | Betrayal (purple+gold) |

---

## §10. Evidence Combination Puzzle Design

### 10.1 Deduction Board UI
- Collected evidence cards listed on the left
- "Deduction Chain" slots (3-5) on the right
- Drag and drop cards into slots
- Connection lines auto-generated between cards (showing logical relationships)
- "Verify" button to evaluate chain

### 10.2 Deduction Chain Validation Algorithm
```
1. Check evidence card count in slots (minimum 3)
2. Validate logical connection between each card pair:
   - Chronological order (event occurrence time sequence)
   - Person relevance (same person or related parties)
   - Location consistency (same district or reachable distance)
3. Match completed chain against predefined valid chain list
4. Match: Deduction success → DEDUCTION_RESULT → CONFRONTATION_INTRO
5. No match: "Deduction incomplete" feedback + highlight incorrect connections
```

**Multiple Solution Path Guarantee**: Each case defines minimum 2 valid chains. Chains including optional clues grant bonus rewards.

### 10.3 BFS/DFS Reachability Verification [Cycle 23 lesson]
- On exploration map generation, **BFS verifies movement paths exist to all required clue locations**
- Compare ability level requirements vs current ability levels → inaccessible clues show "locked" indicator
- Pre-verify that all required clues for valid chain composition are accessible

---

## §11. Scoring System

### 11.1 Per-Case Scoring [F8: Evaluate first, save later]
```
Case Score = Base + Time Bonus + Accuracy Bonus + Exploration Bonus

Base Score: 1000 × district_number
Time Bonus: max(0, (time_limit - elapsed_time) × 10)
Accuracy Bonus: (remaining_credibility / max_credibility) × 500
Exploration Bonus: (clues_found / total_clues) × 300
```

**Evaluation Order**: Calculate score → Determine rank → Compare with best → Save [F8]

### 11.2 Rank System
| Rank | Condition | Reward Multiplier |
|------|-----------|------------------|
| S | 0 wrong answers + all clues found + under 50% time | ×2.0 |
| A | 1 or fewer wrong + all required clues found | ×1.5 |
| B | Case solved + credibility above 50% | ×1.0 |
| C | Case solved | ×0.7 |

### 11.3 Cumulative Score
- Total = Σ(case_score × rank_multiplier)
- LocalStorage persistence (best total + per-case best rank)

---

## §12. Permanent Progression System

### 12.1 Ghost Ability Upgrade Tree
3 branches × 5 levels = 15 nodes. Unlocked with Soul Fragments.

| Branch | Lv1 (1 frag) | Lv2 (2 frag) | Lv3 (3 frag) | Lv4 (4 frag) | Lv5 (5 frag) |
|--------|-------------|-------------|-------------|-------------|-------------|
| Clairvoyance | Fingerprint detect | Wall vision | Seal decoding | Dual vision (2 locations) | Full transparent sight |
| Empathy | Basic emotions | Dialogue fragments | Lie detection | Manipulation detection | Full mind reading |
| Rewind | 3-sec replay | 30-sec replay | Cooldown -30% | Object tracking | 1-hour full replay |

### 12.2 Investigation Tools (8 types)
| Tool | Unlock Condition | Effect |
|------|-----------------|--------|
| Magnifying Glass | Default | Detailed clue examination |
| Fingerprint Kit | District 1 Clear | Fingerprint matching |
| Handwriting Analyzer | District 2 Clear | Document forgery detection |
| Timeline Board | District 2 Clear | Auto-sort events chronologically |
| Relationship Map | District 3 Clear | Auto-connect character relationships |
| Chemistry Kit | District 3 Clear | Material composition analysis |
| Psych Profiler | District 4 Clear | Suspect behavior pattern analysis |
| Ether Scanner | Hidden District Unlock | Supernatural energy trace tracking |

### 12.3 Archive System (40+ entries)
- **Character Archive**: 5 suspects + 10 NPCs + 3 hidden characters
- **Clue Archive**: Full collection tracking per case (required + optional)
- **Location Archive**: 5 districts + hidden district detailed descriptions
- **Case Archive**: Solved case summaries + alternate path unlock status

---

## §13. Sound Design (Web Audio API)

### 13.1 BGM (Procedural Audio)
| Track | Mood | Instruments |
|-------|------|------------|
| bgm_title | Mystery | Minor piano + string tremolo |
| bgm_zone_1~5 | District-specific | See §9.2 |
| bgm_puzzle | Focus | Minimal piano + clock ticking |
| bgm_boss | Tension | String staccato + taiko drums |
| bgm_upgrade | Achievement | Harp arpeggios + bells |
| bgm_ending | Liberation | Full orchestra major key transition |

### 13.2 Sound Effects (8+)
| SFX | Trigger | Implementation |
|-----|---------|---------------|
| sfx_clue_found | Clue discovered | Ascending chime 3-note |
| sfx_ability_use | Ability activated | Ethereal hum + wind |
| sfx_correct | Correct answer | 3rd harmony ascending |
| sfx_wrong | Wrong answer | Dissonant descending + glass shatter |
| sfx_transition | State transition | Wipe swoosh |
| sfx_boss_appear | Boss entrance | Dramatic bass + heartbeat |
| sfx_chain_complete | Deduction chain done | Sequential chimes (per card count) |
| sfx_ghost_mode | Ghost mode toggle | Echo reverb transition |

---

## §14. Verification Checklist

### 14.1 Numerical Consistency Table [F10]
| Spec Location | Item | Design Value | Code Variable |
|--------------|------|-------------|---------------|
| §2.3 | Ether initial | 50 | `G.ether` |
| §2.3 | Clairvoyance cost | 3 | `C.ABILITY_COST.clairvoyance` |
| §2.3 | Empathy cost | 5 | `C.ABILITY_COST.empathy` |
| §2.3 | Rewind cost | 8 | `C.ABILITY_COST.rewind` |
| §2.3 | Credibility initial | 100 (Easy:150, Hard:75) | `C.CREDIBILITY[difficulty]` |
| §2.3 | Wrong penalty (normal) | -15 | `C.WRONG_PENALTY.normal` |
| §2.3 | Wrong penalty (critical) | -25 | `C.WRONG_PENALTY.critical` |
| §7.3 | Port vision reduction | 60% | `C.ENV_HAZARD.port.vision` |
| §7.3 | Alley ether drain | -1/3sec | `C.ENV_HAZARD.alley.etherDrain` |
| §8.1 | Easy ether regen | +2/sec | `C.ETHER_REGEN.easy` |
| §8.1 | Medium ether regen | +1/sec | `C.ETHER_REGEN.medium` |
| §8.1 | Hard ether regen | +0.5/sec | `C.ETHER_REGEN.hard` |
| §12.1 | Rewind Lv3 cooldown reduction | -30% | `C.UPGRADE.rewind[2].cooldownReduction` |

### 14.2 Automated Verification Items (FAIL/WARN tiers) [Cycle 25 lesson]
**FAIL (build blocker)**:
- [ ] assets/ directory exists
- [ ] ASSET_MAP / SPRITES / preloadAssets code present
- [ ] setTimeout / setInterval calls
- [ ] Math.random() calls (only SeededRNG allowed)
- [ ] confirm() / alert() calls
- [ ] External CDN / Google Fonts references

**WARN (advisory)**:
- [ ] Draw functions with direct global variable references
- [ ] Direct state transitions without beginTransition
- [ ] Touch targets under 48px
- [ ] "TODO" / "FIXME" comments remaining

### 14.3 Smoke Test Gates [F15]
| Gate | Test | Pass Criteria |
|------|------|--------------|
| Gate 1 | Title load | Enter TITLE state without crash |
| Gate 2 | District 1 Case 1 complete | Full loop: explore→clue→deduce→confront |
| Gate 3 | Boss confrontation clear | Correct evidence → reward → CASE_SOLVED |
| Gate 4 | Upgrade applied | Ability level up → effect reflected |
| Gate 5 | Save/Load | Progress state persists |
| Gate 6 | 320px viewport | Zero button overlap + 48px+ touch targets |

### 14.4 Viewport Test Matrix [F83, F89]
| Viewport | Layout | Button Size | Text Size | Evidence Panel |
|----------|--------|-------------|-----------|---------------|
| 320px | Single column | 36×36 + Math.max(48, touch) | 12px | Fullscreen overlay |
| 375px | Single column | 40×40 | 13px | Fullscreen overlay |
| 400px | Single column | 44×44 | 14px | Right slide |
| 768px | 2-column | 48×48 | 15px | Right side |
| 1024px+ | Game+sidebar | 52×52 | 16px | Right side |

---

## §15. Sidebar Metadata (Game Page)

```yaml
game:
  title: "Spectral Sleuth"
  description: "A murdered detective returns as a ghost to solve crimes using supernatural abilities. 5 districts, 16 cases, 6 suspects to confront."
  genre: ["puzzle", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/Arrows: Move"
    - "1/2/3: Select ghost ability"
    - "Space: Use ability / Present evidence"
    - "E: Interact"
    - "Tab: Evidence inventory"
    - "Q: Deduction board"
    - "Touch: Tap to move, double-tap interact, long-press ability"
  tags:
    - "#mystery"
    - "#detective"
    - "#puzzle"
    - "#deduction"
    - "#ghost"
    - "#artdeco"
    - "#story"
    - "#logicpuzzle"
  addedAt: "2026-03-23"
  version: "1.0.0"
  featured: true
```

---

## §16. Thumbnail Design

**Cinematic Composition** (800×600, 4:3):
- **Foreground**: Semi-transparent cyan Lucian silhouette (trenchcoat, magnifying glass), left 1/3
- **Midground**: Dark alley between Art Deco buildings, 2 gas lamps (warm amber light)
- **Background**: Misthaven city skyline (moonlight + fog)
- **Effects**: Ghost glow (cyan aura), clue highlights (gold sparkles × 3), fog particles
- **Text**: None (title shown by card component)
- **Canvas Code Drawing**: 20KB+ equivalent complex rendering

---

## Appendix A: Balance Verification Matrix

### Ability Upgrade ROI
| Upgrade | Cost (fragments) | Unlocked Clues | ROI (clues/fragment) |
|---------|-----------------|---------------|---------------------|
| Clairvoyance Lv2 | 2 | +3 (wall vision clues) | 1.5 |
| Clairvoyance Lv3 | 3 | +4 (sealed documents) | 1.33 |
| Empathy Lv2 | 2 | +2 (dialogue fragments) | 1.0 |
| Empathy Lv3 | 3 | +3 (lie detection) | 1.0 |
| Rewind Lv2 | 2 | +2 (30-sec scenes) | 1.0 |
| Rewind Lv3 | 3 | +2 (tracking+cooldown) | 0.67 |

> **Balance Conclusion**: Clairvoyance-first upgrade is slightly advantageous, but district-specific environmental hazards (§7.3) force specific abilities, preventing dominant strategy. District 2 requires Empathy, District 4 requires Clairvoyance.

### Estimated Clear Times by Difficulty
| Difficulty | Per Case | Per Boss | Full 16 Cases |
|-----------|---------|---------|--------------|
| Easy | 3-5 min | 2-3 min | 60-90 min |
| Medium | 5-8 min | 3-5 min | 90-130 min |
| Hard | 8-12 min | 5-8 min | 130-200 min |
