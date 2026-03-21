---
game-id: beat-crafter
title: Beat Crafter
genre: puzzle, casual
difficulty: medium
---

# Beat Crafter — Detailed Game Design Document

> **Cycle:** 5
> **Date:** 2026-03-20
> **Designer:** Claude (Game Designer)
> **Reference:** Based on `docs/analytics/cycle-5-report.md` analysis report — Top recommendation adopted

---

## 0. Previous Cycle Feedback Integration

> Issues and suggestions from the Cycle 4 "Neon Dash Runner" post-mortem are **explicitly** incorporated.

### 0-1. Cycle 4 Issue Resolution Mapping

| Cycle 4 Issue / Suggestion | Severity | Cycle 5 Response |
|---------------------------|----------|-----------------|
| **[B1] TweenManager cancelAll+add race condition** — Deferred `_pendingCancel` deletes new tweens too, making game unlaunchable | CRITICAL | → **§10.2 TweenManager `clearImmediate()` API separation**. `cancelAll()` remains deferred, `clearImmediate()` executes `_tweens.length = 0` + `_pendingCancel = false` immediately. `resetGame()` calls only `clearImmediate()` |
| **[B2] SVG asset recurrence (3 cycles in a row)** — Cannot be solved by design doc ban alone | MAJOR | → **§4.5 banned list + §13.5 auto-verification script** specified. 100% Canvas drawing + grep auto-verification execution rules confirmed. Puzzle game is geometry-focused so SVG need is inherently absent |
| **Coin combo bonus not implemented** — §7.1's consecutive 5 coins→+20pts mechanic omitted | MINOR | → Due to puzzle game nature, **chain clear bonus promoted to core mechanic**. §7.1 clearly defines chain multiplier formula with variable usage specified |
| **Title glow tween not restored** — pulseTitle() not re-called when returning GAMEOVER→TITLE | MINOR | → **enterState() pattern** introduced. Each state entry unifies tween/audio initialization to prevent omissions |
| TweenManager `clearImmediate()` API separation | Suggestion | → **Implemented in §10.2** — cancelAll (deferred) vs clearImmediate (immediate) dual system |
| Actual asset auto-verification script adoption | Suggestion | → **§13.5 specifies grep commands + expected results** |
| Try rhythm/music genre | Suggestion | → **Beat Crafter rhythm puzzle** selected. Grid puzzle + Web Audio procedural music generation fusion |

### 0-2. Verified Patterns from platform-wisdom.md

| Success Pattern | Application |
|----------------|-------------|
| Single HTML + Canvas + Vanilla JS | Same architecture maintained |
| Game state machine | LOADING → TITLE → PLAYING → PAUSE → CONFIRM_MODAL → GAMEOVER (6 states) |
| DPR support (Canvas internal resolution ≠ CSS) | Same applied |
| localStorage try-catch | Same applied (iframe sandbox support) |
| TweenManager + ObjectPool reuse | **clearImmediate() improved version** adopted (5 easing functions fully implemented) |
| HEX codes/formulas in design doc | All values/formulas/color codes specified (target 95% implementation fidelity) |
| Canvas-based modal (confirm/alert banned) | All confirmation UI via Canvas modals |
| TransitionGuard pattern | STATE_PRIORITY map + beginTransition() helper inherited directly |
| Web Audio API procedural sound | **Promoted to core gameplay mechanic** — Block placement/clear triggers chord playback of corresponding musical scale |
| destroy() pattern standardized | registeredListeners + listen() + destroy() inherited directly |
| State × system matrix | Defined in §8 design doc + dual inclusion in code comments |
| Complete setTimeout ban | All delayed transitions via tween onComplete. AudioContext.currentTime-based timing |
| Check first, save later | Order fixed in §7 scoring system |
| Ghost variable prevention checklist | §13.4 specifies update/usage for all variables |
| enterState() function | **New** — Resolves Cycle 4 title glow non-restoration issue |

### 0-3. Cumulative Technical Improvements

| Unresolved Item | Source | Cycle 5 Response |
|----------------|--------|-----------------|
| TweenManager cancelAll+add race condition | Cycle 4 B1 CRITICAL | → `clearImmediate()` API separation (§10.2) |
| SVG asset recurrence (3 cycles in a row) | Cycle 2~4 recurring | → Auto grep verification script (§13.5) |
| State entry tween initialization omission | Cycle 4 title glow | → `enterState()` pattern introduced (§10.1) |

---

## 1. Game Overview & Core Fun Elements

### Concept
A rhythm puzzle game where you place falling **note blocks** on a **4×4 grid**, and when 3 of the same note are aligned horizontally or vertically, **a chord sounds as the line clears**. Combining Tetris's block placement strategy with match-3's alignment satisfaction and **procedural music generation**, it delivers the unique experience of "solving puzzles creates music." 5 musical scale blocks (Do/Re/Mi/Fa/Sol) each have unique colors and sounds, and each clear triggers the corresponding chord via Web Audio API. As levels rise, BPM increases and block drop speed quickens to heighten tension.

### Core Fun Elements
1. **"Puzzle = Composition"** — The thrill of your block placement creating chords and melodies. Each game produces a different song
2. **Simultaneous visual + audio reward** — Neon explosion effects + chord playback fire simultaneously on line clears for sensory satisfaction
3. **Chain clear satisfaction** — When a single placement cascades into multiple line clears, chords layer upon layer with score explosion
4. **Gradual tension** — Drop speed increase with BPM creates "let me survive a bit longer" survival tension
5. **Grid puzzle strategic depth** — Validated "merge and evolve" satisfaction from C1. Deciding where to place which note

### Genre Diversification Contribution
- **Platform's first music-based game** — Completely different experience from existing 4 games (puzzle/shooting/strategy/runner)
- **puzzle + casual dual tag** — Escapes arcade bias (existing arcade 2, puzzle is 2nd after C1)
- **Reuses C1 Color Merge's grid-based structure** while differentiating with music mechanics
- First case of Web Audio API used as core gameplay (Cycle 3~4 used it for sound effects only)

---

## 2. Game Rules & Objectives

### 2.1 Basic Rules
- **4 columns × 8 rows grid** where blocks stack from the bottom
- **1 note block** falls from the top; player controls left/right movement + fast drop to determine position
- When block lands on the grid, **match check** executes
- **3 or more of the same note** consecutively aligned horizontally or vertically → **Clear** (blocks removed + chord plays)
- After clear, **gravity applied** — blocks above fall down → cascading matches possible (chain)
- **Game over when blocks reach the top (row 8) of the grid**
- Goal: **Achieve the highest score** (chain bonus + level bonus)

### 2.2 Grid System

```
Grid size: 4 columns (col) × 8 rows (row)
Cell size: 48 × 48px
Total grid: 192 × 384px

Grid top-left coordinate:
  gridX = (canvasWidth - 192) / 2 = (480 - 192) / 2 = 144px
  gridY = (canvasHeight - 384) / 2 + 24 = 12px  (24px top HUD margin)

Cell(col, row) screen coordinate:
  x = gridX + col × 48
  y = gridY + (7 - row) × 48   // row 0 is bottom
```

- Internal data: `grid[col][row]` = `null` or `{ note: 0~4, merging: false }`
- row 0 = bottom, row 7 = top (overflow zone)
- Block existence check: `grid[col][row] !== null`

### 2.3 Block Types (5 Musical Scales)

| Index | Scale | Label | Frequency (Hz) | Color (HEX) | Visual Shape |
|-------|-------|-------|----------------|-------------|-------------|
| 0 | **Do (C4)** | C | 261.6 | `#FF1744` Red | Circle |
| 1 | **Re (D4)** | D | 293.7 | `#2979FF` Blue | Diamond |
| 2 | **Mi (E4)** | E | 329.6 | `#00E676` Green | Triangle |
| 3 | **Fa (F4)** | F | 348.8 | `#FFAB00` Amber | Square |
| 4 | **Sol (G4)** | G | 392.0 | `#D500F9` Purple | Star (5-point) |

- Block size: 44×44px (2px margin on each side within 48px cell)
- Each scale has a **unique shape** so color-blind users can also distinguish (accessibility)
- Current block + 1 next block preview

### 2.4 Match & Clear System

```
Match check (immediately after block lands):
  1. Check for 3+ consecutive same notes in all rows (horizontal)
  2. Check for 3+ consecutive same notes in all columns (vertical)
  3. Mark matched cells: matched[][] = true
  4. If matches exist:
     a. Clear effect on matched blocks (tween: scale 1.2→0, 300ms, easeOutQuad)
     b. Play matched scale chord via Web Audio
     c. Remove matched blocks after 300ms
     d. Apply gravity (upper blocks fall, tween: y movement 200ms, easeOutQuad)
     e. After fall complete → match check again (go to step 1, chain count +1)
  5. If no more matches → spawn next block

Chain (cascade):
  - 1st match: Chain 0 (base)
  - Clear → gravity → re-match: Chain 1
  - Can continue: Chain 2, 3, ... (theoretically infinite)
  - Chords layer upon layer with chain count (see §10.5)
```

> **⚠️ Cycle 3 lesson:** During match → clear → gravity → re-check process, **guard flag (`isClearing = true`) blocks new block generation**. Only when chain completes does `isClearing = false` release and allow next block spawn.

### 2.5 Block Drop System

```
Falling block state:
  - fallingBlock = { note: 0~4, col: 1, row: 7, dropTimer: 0 }
  - Auto-drop interval: dropInterval = max(200, 1000 - level × 80) ms
  - Soft drop (↓ key): dropInterval × 0.15 (approximately 6.67× speed)
  - Hard drop (Space): Instant landing at bottom

Landing position:
  - Block falls vertically at col position
  - Landing row = above the highest block in that column (or row 0)
  - Landing preview: Ghost block at 30% alpha shows landing position
```

---

## 3. Controls

### 3.1 Keyboard (PC Default)

| Key | Action |
|-----|--------|
| **←** / **A** | Move block left |
| **→** / **D** | Move block right |
| **↓** / **S** | Soft drop (fast fall) |
| **Space** | Hard drop (instant landing) |
| **P** / **ESC** | Pause toggle |
| **R** | Restart on game over (Canvas modal confirmation) |
| **Enter** | Start game from title screen |

- Left/right movement: Immediate on first input + 100ms interval repeat after 200ms (DAS: Delayed Auto Shift)
- DAS implemented via `keyDown` state tracking (setTimeout banned, dt accumulation method)

### 3.2 Mouse (PC Secondary)

| Input | Action |
|-------|--------|
| **Click grid column** | Move block to that column + hard drop |
| **Pause button (top-right)** | Pause toggle |

### 3.3 Touch (Mobile)

| Input | Action |
|-------|--------|
| **Swipe left/right** | Move block left/right |
| **Swipe down** | Hard drop |
| **Tap grid column** | Move block to that column + hard drop |
| **Pause button (top-right)** | Pause toggle |

> **Auto-detect input mode**: Mode automatically set based on first input (keyboard/mouse/touch). Switches immediately on input change.
>
> **⚠️ Cycle 2~4 lesson**: Usage points for input mode variable (`inputMode`) are clearly specified in §5.3 to prevent ghost code.

---

## 4. Visual Style Guide

### 4.1 Color Palette — Neon Music Palette

| Usage | HEX | Description |
|-------|-----|-------------|
| **Background** | `#0A0A14` | Deep dark blue-black |
| **Background gradient bottom** | `#0F0A1E` | Subtle purple tint |
| **Grid background** | `#12122A` | Grid area (slightly brighter than background) |
| **Grid cell border** | `#2A2A5E` (20% alpha) | Subtle grid lines |
| **Do (C) block** | `#FF1744` | Red neon |
| **Re (D) block** | `#2979FF` | Blue neon |
| **Mi (E) block** | `#00E676` | Green neon |
| **Fa (F) block** | `#FFAB00` | Amber neon |
| **Sol (G) block** | `#D500F9` | Purple neon |
| **Clear effect** | Block color → `#FFFFFF` | Block color explosion → white flash |
| **Chain text** | `#00E5FF` | Cyan ("Chain ×2!") |
| **Score text** | `#E0E0E0` | Light gray |
| **Level text** | `#FFD740` | Gold |
| **Game over warning** | `#FF1744` (20% alpha) | Top 2 rows red vignette |
| **Ghost block** | Block color (30% alpha) | Landing preview |
| **Next block background** | `#1A1A3E` | Preview area |
| **Beat-reactive background** | Last cleared block color | Background pulse on clear |
| **Floating particles** | Random from 5 block colors | Generated to the beat |
| **BPM display** | `#D500F9` | Purple |

### 4.2 Background (Beat-Reactive)

| Layer | Content | Beat Reaction |
|-------|---------|--------------|
| **Base background** | Top→bottom gradient (`#0A0A14` → `#0F0A1E`) | Brightness pulse on clear |
| **Grid overlay** | Horizontal/vertical lines at 48px intervals (`#2A2A5E`, 20% alpha) | Subtle brightness oscillation to BPM |
| **Note particles** | ♪-shaped small particles 6~10, slowly rising | Density increases on chain |

- **Canvas base size:** `480 × 360px` (4:3 ratio)
- Game area: Central grid (192×384px) + side panels (HUD, preview)
- Grid overlay cached on offscreen canvas → Beat reaction uses only globalAlpha adjustment

### 4.3 Object Shapes (Pure Canvas Drawing — No SVG/External Images)

| Object | Drawing Method |
|--------|---------------|
| **Do (C) block** | `arc()` circle, 20px radius, red fill + bright 2px border + "C" text inside |
| **Re (D) block** | 45° rotated square (diamond), 30×30px, blue fill + border + "D" |
| **Mi (E) block** | `moveTo/lineTo` triangle, 32px base, green fill + border + "E" |
| **Fa (F) block** | `fillRect` square, 30×30px, amber fill + border + "F" |
| **Sol (G) block** | 5-point star (`moveTo/lineTo` 10 vertices), purple fill + border + "G" |
| **Ghost block** | Same shape as respective block, 30% alpha, dashed border |
| **Grid cell** | `strokeRect` 48×48px, `#2A2A5E` 20% alpha |
| **Clear effect** | Block color circle expansion (0→60px, 300ms) + 8 particles radiate |
| **Chain effect** | Screen center "Chain ×N!" tween scaleUp(1.5→1.0, easeOutBack, 300ms) |
| **Landing effect** | Block color horizontal wave (grid width, 150ms fadeOut) |
| **Level up effect** | Full screen white flash (alpha 0.3→0, 400ms) + "Level Up!" text |
| **Grid border** | 2px solid line (`#4A4A8E`), rounded corners 4px |
| **Next block preview** | 60×60px area, block centered, background `#1A1A3E` |
| **Note particles** | ♪ shape — `arc` (head) + `lineTo` (tail), 10~14px, random block colors |

### 4.4 Font
- **System font stack only** (zero external CDN dependencies):
  ```
  'Segoe UI', system-ui, -apple-system, sans-serif
  ```
- Block internal scale letter: `14px bold`
- Chain text: `28px bold`
- Score: `18px bold`
- Level: `14px bold`
- HUD auxiliary text: `12px`
- Title: `36px bold`
- BPM: `11px`

### 4.5 Banned List (Asset Auto-Verification Targets)
- ❌ SVG files / SVG filters (`feGaussianBlur`, `<filter>`)
- ❌ External image files (`.png`, `.jpg`, `.svg`, `.gif`)
- ❌ External fonts / Google Fonts / CDN
- ❌ External music/sound files (`.mp3`, `.ogg`, `.wav`)
- ❌ `setTimeout` / `setInterval` (game logic — all timing via dt accumulation or tween)
- ❌ `confirm()` / `alert()` / `prompt()`
- ❌ `eval()`
- ❌ ASSET_MAP / SPRITES / preloadAssets (prevent unused asset remnants)

---

## 5. Core Game Loop (Frame-Based Logic Flow)

### 5.1 Main Loop (`requestAnimationFrame`)

```
function loop(timestamp) {
  const dt = min((timestamp - lastTime) / 1000, 0.05);  // Max 50ms cap
  lastTime = timestamp;

  switch (state) {
    case LOADING:       updateLoading();                                          break;
    case TITLE:         tw.update(dt); updateTitleBG(dt); renderTitle();          break;
    case PLAYING:       updateGame(dt); tw.update(dt); renderGame();              break;
    case PAUSE:         tw.update(dt); renderGame(); renderPause();               break;
    case CONFIRM_MODAL: tw.update(dt); renderGame(); renderModal();               break;
    case GAMEOVER:      tw.update(dt); renderGame(); renderGameover();            break;
  }

  rafId = requestAnimationFrame(loop);
}
```

### 5.2 updateGame(dt) Detailed Flow

```
1. if (isClearing) → Block input ignored during clear/chain animation, return early
   (but tween is always updated in main loop)

2. DropManager.update(dt)
   → dropTimer += dt × 1000
   → dropTimer >= dropInterval → move block 1 row down
   → If soft dropping: apply dropInterval × 0.15
   → Landing check: if cell below is occupied or at bottom (row 0), land

3. InputHandler.process()
   → Left/right input: change fallingBlock.col (clamp range 0~3)
   → DAS: keyDownTime += dt, auto-repeat when exceeded
   → Hard drop: instantly move to landing position + land
   → Mouse/touch: column click → col move + hard drop

4. On landing → placeBlock()
   a. grid[col][landRow] = { note: fallingBlock.note }
   b. Landing effect (tween)
   c. Landing sound (Web Audio: short tone of corresponding scale, 50ms)
   d. → checkMatches()

5. checkMatches()
   a. Search horizontal/vertical matches → mark matched[][]
   b. No matches: isClearing = false, spawnNextBlock()
   c. Matches found:
      i.   isClearing = true
      ii.  chainCount++
      iii. Clear effect tween on matched blocks (300ms, easeOutQuad)
      iv.  Web Audio chord playback (matched scales)
      v.   Score calculation: baseScore × chainMultiplier × levelMultiplier
      vi.  tween onComplete → removeMatched() → applyGravity()

6. applyGravity()
   → Move blocks above empty cells downward (tween: 200ms, easeOutQuad)
   → tween onComplete → checkMatches() (cascade)

7. BeatPulse.update(dt)
   → Background brightness decay (clearFlash -= dt × 3)
   → Note particle update
   → BPM-based subtle oscillation (grid cell alpha)

8. GameOverCheck
   → If landing position >= row 7 when spawning new block
   → && !transitioning → beginTransition(GAMEOVER)
```

### 5.3 Input Mode Branching (Ghost Code Prevention — Usage Points Specified)

```
Variable: inputMode = 'keyboard' | 'mouse' | 'touch'

Usage 1: renderGrid() — Control guide display
  keyboard → Show ← → ↓ Space key icons below grid
  mouse → "Click to place blocks" text
  touch → "Swipe/tap to control" text

Usage 2: InputHandler — Input processing branching
  keyboard → keydown/keyup event processing, DAS applied
  mouse → Grid column click → col move + hard drop
  touch → Swipe detection (left/right/down) + column tap

Usage 3: renderPause() / renderGameover() — Instruction text
  keyboard → "Press P to resume" / "Press R to restart"
  mouse → "Click to resume" / "Click to restart"
  touch → "Tap to resume" / "Tap to restart"

Usage 4: Pause button display
  keyboard → Show ESC/P key hint only
  mouse/touch → Show pause icon button (top-right)
```

### 5.4 Rendering Order (Z-order)

```
1.  Background gradient                     — Brightness pulse on clear
2.  Grid background (offscreen canvas)      — BPM subtle oscillation
3.  Grid area background (#12122A)          — Semi-transparent rectangle
4.  Grid cell borders (grid lines)          — 20% alpha
5.  Placed blocks (grid[][])                — Each scale's shape+color
6.  Ghost block (landing preview)           — 30% alpha
7.  Falling block (fallingBlock)            — Current position
8.  Clear effects (explosion, particles)    — tween scale+fade
9.  Chain text ("Chain ×2!")                — tween scaleUp + fadeOut
10. Landing effect (horizontal wave)        — tween fadeOut
11. Grid border line                        — 2px solid
12. HUD: Score (top-right)                  — Brightens on change
13. HUD: Level (top-left)                   — Glow on level up
14. HUD: Next block preview (right)         — 60×60px area
15. HUD: BPM (bottom-right)                — Small text
16. HUD: Line clear count (left)           — Cumulative display
17. Note particles (floating)               — Drift above background
18. Game over warning (top 2 rows red vignette) — When blocks reach row 5+
19. Overlay (pause/modal/game over)         — On semi-transparent background
```

---

## 6. Difficulty System

### 6.1 Level Curve (Core Difficulty Driver)

| Level | Clears Needed | Drop Interval (ms) | BPM (Background) | Note Types | Feel |
|-------|-------------|-------------------|------------------|-----------|------|
| 1 | 0 | 1000 | 80 | 3 types (C, D, E) | Introduction — relaxed placement |
| 2 | 5 | 920 | 90 | 3 types | Warm-up — rhythm adaptation |
| 3 | 12 | 840 | 100 | 4 types (+F) | Expansion — new note appears |
| 4 | 21 | 760 | 110 | 4 types | Adaptation — strategy needed |
| 5 | 32 | 680 | 120 | 5 types (+G) | Challenge — full scale |
| 6 | 45 | 600 | 125 | 5 types | Tension — getting faster |
| 7 | 60 | 520 | 130 | 5 types | Excitement — quick decisions |
| 8 | 77 | 440 | 135 | 5 types | Extreme — survival |
| 9 | 96 | 360 | 140 | 5 types | Master |
| 10+ | 117+ | 280 (minimum) | 145 (maximum) | 5 types | Infinite — high score challenge |

- **Drop interval formula**: `dropInterval = max(280, 1000 - (level - 1) × 80)` ms
- **BPM formula**: `bpm = min(145, 80 + (level - 1) × 7.2)`
- On level up: Screen flash + "Level Up!" tween + BPM increase tween (500ms, easeOutQuad)
- Level up bonus: `level × 200` points

### 6.2 Block Generation Rules (Note Distribution)

```
Note pool (available notes):
  level 1~2: [C, D, E]     — 3 types
  level 3~4: [C, D, E, F]  — 4 types
  level 5+:  [C, D, E, F, G] — 5 types

Block selection: Weighted random
  Default: Equal distribution
  Adjustment: Notes with 2+ existing on grid get +30% weight
              (increases match opportunities to prevent "impossible situations")

Next block:
  Determined simultaneously when creating current block
  Displayed in preview area
```

### 6.3 Dynamic Balance Adjustment

| Condition | Effect | UI Display |
|-----------|--------|-----------|
| **Grid height 6+ rows** (critical) | Extra weight: +50% for match-likely notes | Top 2 rows red vignette blinking |
| **3 consecutive blocks without match** | Force next block to a note with 2+ existing on grid | (Hidden, internal adjustment) |
| **Chain 3+ achieved** | Background visuals enhanced (particle density 2x, for 1 second) | "Amazing!" text popup |

---

## 7. Scoring System

### 7.1 Base Score + Chain Multiplier

| Action | Base Score | Chain Multiplier | Chain 0 | Chain 1 | Chain 2 | Chain 3 |
|--------|-----------|------------------|---------|---------|---------|---------|
| **3-match clear** | 100 | `× (1 + chain × 0.5)` | 100 | 150 | 200 | 250 |
| **4-match clear** (4 consecutive) | 300 | `× (1 + chain × 0.5)` | 300 | 450 | 600 | 750 |
| **T/L-shape match** (horizontal+vertical simultaneous) | 500 | `× (1 + chain × 0.5)` | 500 | 750 | 1000 | 1250 |
| **Soft drop** | 1 pt per row | ×1 (chain-independent) | — | — | — | — |
| **Hard drop** | 2 pts per row | ×1 (chain-independent) | — | — | — | — |

- **Chain multiplier** = `1 + chain × 0.5` (+50% per chain, no maximum)
- **Level multiplier** = `1 + (level - 1) × 0.1` (+10% per level)
- **Final score** = `base score × chain multiplier × level multiplier`

### 7.2 Bonus Scores

| Action | Bonus | Notes |
|--------|-------|-------|
| Level up | `level × 200` | One-time on level reached |
| All Clear (grid completely empty) | 3000 | "ALL CLEAR!" special effect |
| Chain 3+ | 500 | "Amazing Chain!" popup |
| Chain 5+ | 1500 | "Incredible!" popup |

### 7.3 Variable Usage Specification (Ghost Code Prevention)

```
Variable: score (current score)
  Updated: clearMatches() — adds base score × chain multiplier × level multiplier on match
  Used: (1) HUD score rendering, (2) result screen display, (3) best score comparison

Variable: level (current level)
  Updated: Checks level table on clearCount increase
  Used: (1) HUD level display, (2) drop interval calculation, (3) BPM calculation,
        (4) level multiplier calculation, (5) block note type determination, (6) level up bonus score

Variable: clearCount (total clear count)
  Updated: clearMatches() — increases by matched block count (3 or 4)
  Used: (1) Level check, (2) HUD clear count display, (3) result screen

Variable: chainCount (current chain count)
  Updated: checkMatches() — +1 on match found, 0 on chain end
  Used: (1) Chain multiplier calculation, (2) chain text rendering, (3) chain bonus check,
        (4) chord layer count determination (§10.5)

Variable: maxChain (maximum chain)
  Updated: max(maxChain, chainCount) on chainCount increase
  Used: (1) Result screen display, (2) best chain save comparison

Variable: dropInterval (current drop interval)
  Updated: Recalculated on level change: max(280, 1000 - (level-1) × 80)
  Used: (1) DropManager.update() drop timing check

Variable: bpm (background beat speed)
  Updated: Smooth transition via tween on level change (§6.1 formula)
  ⚠️ Note: bpm update path must be tween-only (direct assignment banned — Cycle 5 lesson)
  Used: (1) Background beat oscillation period, (2) BPM text rendering, (3) note particle generation period

Variable: isClearing (chain in progress flag)
  Updated: true when checkMatches() finds match, false when chain ends
  Used: (1) Input blocking (block manipulation banned during chain), (2) new block generation blocking

Variable: inputMode
  Updated: Set on first keyboard/mouse/touch input, switched on input change
  Used: (1) Control guide rendering, (2) input processing branching, (3) instruction text branching, (4) button display

Variable: fallingBlock = { note, col, row, dropTimer }
  Updated: (1) note/col/row initialized on creation, (2) dropTimer accumulated in update,
           (3) col changed on input, (4) row decreased on drop
  Used: (1) Block rendering, (2) landing check, (3) ghost block position calculation
```

### 7.4 Best Score Processing Order (Cycle 2 B4 Lesson Applied)

```javascript
// ⚠️ Must follow this order — "Check first, save later"
const isNewBest = score > getBest();           // 1. Check
const isNewChain = maxChain > getBestChain();  // 1b.
saveBest(score);                                // 2. Save
saveBestChain(maxChain);                        // 2b.
if (isNewBest) showNewBestEffect();             // 3. Effect
```

### 7.5 localStorage Keys
- `bc_bestScore` — Best score
- `bc_bestChain` — Best chain
- `bc_bestLevel` — Best level
- `bc_totalPlays` — Total play count
- `bc_totalClears` — Cumulative clear count (statistics)
- All access wrapped in `try { ... } catch(e) { /* silent */ }`

---

## 8. State × System Update Matrix

> **Root cause fix for Cycle 2 B1/B2. Effectiveness verified in Cycles 3~4.** This matrix should also be copied as a code header comment.

| Game State | TweenMgr | DropMgr | Input | MatchSys | BeatPulse | Particles | Render | Audio |
|-----------|----------|---------|-------|----------|-----------|-----------|--------|-------|
| **LOADING** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | loading screen | ✗ |
| **TITLE** | **✓** | ✗ | start only | ✗ | slow background only | ✗ | title screen | ✗ |
| **PLAYING** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | game | **✓** |
| **PAUSE** | **✓** | ✗ | resume only | ✗ | stopped | ✗ | game+pause overlay | suspend |
| **CONFIRM_MODAL** | **✓** | ✗ | yes/no | ✗ | stopped | ✗ | game+modal overlay | suspend |
| **GAMEOVER** | **✓** | ✗ | restart only | ✗ | slow decay | **✓** | game+result screen | ✗ |

> **Core rules:**
> 1. TweenManager is **always updated in every state**.
> 2. Even during isClearing === true, TweenManager updates (clear/gravity tweens must progress)
> 3. In GAMEOVER, Particles are updated so last effects naturally fade out.
> 4. AudioContext active only in PLAYING, suspended in PAUSE/CONFIRM_MODAL.

---

## 9. State Transition Flow (Complete setTimeout Ban)

```
LOADING ──(Canvas + AudioContext init complete)──→ TITLE

TITLE ──(Enter/Space/click/tap)──→ PLAYING
        (tween: title fadeOut 300ms onComplete)
        (enterState(PLAYING): AudioContext.resume(), spawnFirstBlock())

PLAYING ──(block landing position >= row 7 && !transitioning)──→ GAMEOVER
          (tween: screen red flash 0.5s + grid shake onComplete)
          ※ beginTransition(GAMEOVER) call — guard + priority built-in
          (enterState(GAMEOVER): AudioContext.suspend(), tally results)

PLAYING ──(P key/ESC/pause button)──→ PAUSE
          (immediate, AudioContext.suspend())

PAUSE ──(P key/ESC/resume button)──→ PLAYING
        (immediate, AudioContext.resume())

PAUSE ──(R key)──→ CONFIRM_MODAL
                  (tween: modal fadeIn 200ms)

CONFIRM_MODAL ──(Yes)──→ TITLE (game reset — clearImmediate() call)
CONFIRM_MODAL ──(No/ESC)──→ PAUSE (tween: modal fadeOut 200ms onComplete)

GAMEOVER ──(R key/restart button/click/tap)──→ TITLE (game reset — clearImmediate() call)
```

> **All delayed transitions handled via tween onComplete callbacks.** `setTimeout` / `setInterval` usage banned.
> **`beginTransition()` helper required for all state transitions** (see §10.1).
> **`enterState()` called on state entry** — Unifies tween/audio initialization per state (resolves Cycle 4 glow non-restoration issue).

---

## 10. Core System Design

### 10.1 TransitionGuard + enterState Pattern (Cycle 4 Inherited + New Improvement)

```javascript
// State priorities (higher = stronger)
const STATE_PRIORITY = {
  LOADING: 0, TITLE: 10, PLAYING: 20,
  PAUSE: 30, CONFIRM_MODAL: 35, GAMEOVER: 99
};

let transitioning = false;

function beginTransition(targetState, tweenConfig) {
  if (transitioning) return false;
  if (STATE_PRIORITY[state] >= STATE_PRIORITY[targetState]) return false;

  transitioning = true;

  if (tweenConfig) {
    tw.add(tweenConfig.target, tweenConfig.props, tweenConfig.duration,
           tweenConfig.easing, () => {
      state = targetState;
      transitioning = false;
      enterState(targetState);  // ← State entry initialization
      if (tweenConfig.onComplete) tweenConfig.onComplete();
    });
  } else {
    state = targetState;
    transitioning = false;
    enterState(targetState);
  }
  return true;
}

// State entry initialization (resolves Cycle 4 title glow non-restoration)
function enterState(s) {
  switch(s) {
    case TITLE:
      pulseTitle();             // Start title glow tween
      pulseMusicNotes();        // Note icon float tween
      audioCtx?.suspend();
      break;
    case PLAYING:
      audioCtx?.resume();
      spawnNextBlock();
      startBeatPulse();         // Start background beat oscillation
      break;
    case PAUSE:
      audioCtx?.suspend();
      break;
    case GAMEOVER:
      audioCtx?.suspend();
      calculateResults();
      startResultSequence();    // Result sequential fadeIn tween
      break;
  }
}
```

### 10.2 TweenManager (Cycle 4 Inherited + clearImmediate New)

```javascript
class TweenManager {
  constructor() {
    this._tweens = [];
    this._pendingCancel = false;
  }

  add(target, props, duration, easing, onComplete) {
    this._tweens.push({ target, props, duration, easing, onComplete,
                        elapsed: 0, startValues: {} });
    return this;
  }

  update(dt) {
    if (this._pendingCancel) {
      this._tweens.length = 0;
      this._pendingCancel = false;
      return;
    }
    for (let i = this._tweens.length - 1; i >= 0; i--) {
      const tw = this._tweens[i];
      if (!tw._started) {
        tw._started = true;
        for (const k in tw.props) tw.startValues[k] = tw.target[k];
      }
      tw.elapsed += dt * 1000;
      const t = Math.min(1, tw.elapsed / tw.duration);
      const e = EASING[tw.easing || 'linear'](t);
      for (const k in tw.props) {
        tw.target[k] = tw.startValues[k] + (tw.props[k] - tw.startValues[k]) * e;
      }
      if (t >= 1) {
        this._tweens.splice(i, 1);
        if (tw.onComplete) tw.onComplete();
      }
    }
  }

  // Existing: deferred cancel (safe during update)
  cancelAll() {
    this._pendingCancel = true;
  }

  // ⭐ New: Immediate cleanup (Cycle 4 B1 CRITICAL fix)
  // Use when calling outside of update loop, e.g., resetGame()
  clearImmediate() {
    this._tweens.length = 0;
    this._pendingCancel = false;   // Also clear any remaining deferred flag
  }
}

// 5 easing functions fully implemented
const EASING = {
  linear:       t => t,
  easeOutQuad:  t => t * (2 - t),
  easeInQuad:   t => t * t,
  easeOutBack:  t => 1 + (--t) * t * (2.70158 * t + 1.70158),
  easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 :
    Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1
};
```

> **Key change**: `resetGame()` must always call `tw.clearImmediate()`. The scenario of calling `add()` right after `cancelAll()` is fundamentally prevented. `cancelAll()` is maintained as a safe pattern called only inside the update loop.

### 10.3 ObjectPool (Inherited from Cycle 2~4)

```javascript
// Pool targets and sizes
const pools = {
  particle:  new ObjectPool(() => new Particle(), 40),
  wave:      new ObjectPool(() => new Wave(), 8),
  noteIcon:  new ObjectPool(() => new NoteIcon(), 12)  // Floating note particles
};
```

> Grid blocks are directly managed via `grid[col][row]` array (fixed size 4×8, pooling unnecessary).

### 10.4 MatchSystem — Match Detection Engine (Core New System)

```javascript
class MatchSystem {
  // Horizontal/vertical match search — O(cols × rows) = O(32), very lightweight
  findMatches(grid) {
    const matched = Array.from({length: 4}, () => Array(8).fill(false));

    // Horizontal search (3+ consecutive same notes in each row)
    for (let r = 0; r < 8; r++) {
      let count = 1;
      for (let c = 1; c < 4; c++) {
        if (grid[c][r] && grid[c-1][r] &&
            grid[c][r].note === grid[c-1][r].note) {
          count++;
        } else {
          if (count >= 3) markRow(matched, r, c - count, count);
          count = 1;
        }
      }
      if (count >= 3) markRow(matched, r, 4 - count, count);
    }

    // Vertical search (3+ consecutive same notes in each column)
    for (let c = 0; c < 4; c++) {
      let count = 1;
      for (let r = 1; r < 8; r++) {
        if (grid[c][r] && grid[c][r-1] &&
            grid[c][r].note === grid[c][r-1].note) {
          count++;
        } else {
          if (count >= 3) markCol(matched, c, r - count, count);
          count = 1;
        }
      }
      if (count >= 3) markCol(matched, c, 8 - count, count);
    }

    return matched;
  }

  // Match type classification (score differentiation)
  classifyMatch(matched) {
    let hasHorizontal = false, hasVertical = false;
    let maxRun = 0;
    // ... horizontal/vertical simultaneous match (T/L-shape) check, 4-match check ...
    if (hasHorizontal && hasVertical) return 'CROSS';  // T/L-shape, 500pts
    if (maxRun >= 4) return 'FOUR';                    // 4-match, 300pts
    return 'THREE';                                     // 3-match, 100pts
  }
}
```

### 10.5 Web Audio API — Procedural Music Generation

```javascript
// AudioContext initialization (on first user interaction)
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { /* Sound disabled — gameplay functions via visual feedback only */ }
  }
}

// Master volume
let masterGain;
function setupAudio() {
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(audioCtx.destination);
}

// Scale frequency map
const NOTE_FREQ = [261.6, 293.7, 329.6, 349.2, 392.0]; // C4, D4, E4, F4, G4

// === Block landing sound (short single note) ===
function sfxPlace(noteIndex) {
  try {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTE_FREQ[noteIndex], audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.08);
  } catch(e) { /* silent */ }
}

// === Match clear chord (core — puzzle-solving creates music) ===
function sfxClearChord(matchedNotes, chainCount) {
  try {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const uniqueNotes = [...new Set(matchedNotes)];

    // Base chord: Play matched scales simultaneously
    uniqueNotes.forEach((noteIdx, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(NOTE_FREQ[noteIdx], now);
      const vol = 0.15 / uniqueNotes.length;  // Distribute volume by note count
      gain.gain.setValueAtTime(vol, now);
      gain.gain.linearRampToValueAtTime(vol * 0.8, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(now + i * 0.02);  // Subtle delay for arpeggio feel
      osc.stop(now + 0.4);
    });

    // Chain bonus: Add octave-up chord based on chain count
    if (chainCount >= 1) {
      uniqueNotes.forEach((noteIdx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(NOTE_FREQ[noteIdx] * 2, now);  // 1 octave up
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain); gain.connect(masterGain);
        osc.start(now + 0.05); osc.stop(now + 0.3);
      });
    }

    // Chain 2+: Add bass
    if (chainCount >= 2) {
      const bassFreq = NOTE_FREQ[uniqueNotes[0]] / 2;  // 1 octave down
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassFreq, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(now); osc.stop(now + 0.35);
    }
  } catch(e) { /* silent */ }
}

// === Background beat (BPM-based metronome — provides rhythm feel) ===
let beatTimer = 0;
function updateBeatPulse(dt) {
  beatTimer += dt;
  const beatInterval = 60 / bpm;
  if (beatTimer >= beatInterval) {
    beatTimer -= beatInterval;
    // Visual beat pulse (background alpha pulse)
    beatFlash = 0.15;
    // Audio metronome (very low volume)
    try {
      if (!audioCtx || audioCtx.state !== 'running') return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.03);
    } catch(e) { /* silent */ }
  }
}

// === Other sound effects ===
function sfxLevelUp() { /* Rising arpeggio: C→E→G→C5, each 60ms, volume 0.1 */ }
function sfxGameOver() { /* Descending minor: G→E→C→A3, each 100ms, sawtooth, volume 0.08 */ }
function sfxAllClear() { /* Full major chord: C+E+G simultaneous, 800ms, volume 0.15 */ }
```

- All SFX/music calls wrapped in `try-catch` — game functions normally via visual feedback alone on audio failure
- Music plays only in PLAYING state (see matrix)
- PAUSE: `audioCtx.suspend()`, resume: `audioCtx.resume()`
- **⚠️ bpm updates allowed only via tween single path** (Cycle 5 platform-wisdom lesson: prevent dual registration)

### 10.6 game.destroy() Pattern (Inherited from Cycle 3~4 Standard)

```javascript
const registeredListeners = [];

function listen(el, evt, fn, opts) {
  el.addEventListener(evt, fn, opts);
  registeredListeners.push([el, evt, fn, opts]);
}

function destroy() {
  cancelAnimationFrame(rafId);
  registeredListeners.forEach(([el, evt, fn, opts]) =>
    el.removeEventListener(evt, fn, opts));
  registeredListeners.length = 0;
  Object.values(pools).forEach(p => p.clear());
  tw.clearImmediate();  // ← Use clearImmediate (not cancelAll)
  if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
}
```

---

## 11. UI Layout Details

### 11.1 In-Game HUD

```
┌────────────────────────────────────────────────────┐
│ Lv.5    ⭐ 12,450                             [⏸] │
│ Lines: 32                                          │
│         ┌───┬───┬───┬───┐                          │
│         │   │ ▼ │   │   │  ← Falling block        │
│         ├───┼───┼───┼───┤         ┌─────┐          │
│         │ ● │ ● │ ● │   │         │NEXT │          │
│         ├───┼───┼───┼───┤         │  ◆  │          │
│         │ ◆ │ ▲ │ ■ │ ● │         └─────┘          │
│         ├───┼───┼───┼───┤                          │
│         │ ★ │ ■ │ ▲ │ ◆ │                          │
│         ├───┼───┼───┼───┤     Chain ×2!            │
│         │ ▲ │ ★ │ ● │ ■ │                          │
│         ├───┼───┼───┼───┤                          │
│         │ ■ │ ● │ ★ │ ▲ │                          │
│         ├───┼───┼───┼───┤                          │
│         │ ● │ ◆ │ ■ │ ★ │                          │
│         └───┴───┴───┴───┘                          │
│         ← → ↓ Space              ♪ 120 BPM        │
└────────────────────────────────────────────────────┘
```

### 11.2 Title Screen

```
┌────────────────────────────────────────────────────┐
│                                                    │
│           ╔══════════════════════════╗              │
│           ║  BEAT CRAFTER           ║              │
│           ╚══════════════════════════╝              │
│                  ♪ ♫ ♪ ♫                           │
│                                                    │
│            BEST: 24,800pts  |  Lv.7                │
│            BEST CHAIN: ×5                          │
│                                                    │
│          [ENTER / Tap to Start]                    │
│                                                    │
│     ← → : Move   ↓ : Drop   Space : Hard Drop     │
│                                                    │
│      ● Do  ◆ Re  ▲ Mi  ■ Fa  ★ Sol                │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 11.3 Game Over / Result Screen

```
┌────────────────────────────────────────────────────┐
│                                                    │
│           ╔══════════════════════╗                  │
│           ║    GAME  OVER       ║                  │
│           ╚══════════════════════╝                  │
│                                                    │
│            Score:     24,800                        │
│            Level:     7                             │
│            Clears:    60 lines                      │
│            Max Chain: ×5                            │
│            Play Time: 4:12                          │
│                                                    │
│            🏆 NEW BEST! (Previous: 18,200)         │
│                                                    │
│          [R Key / Tap to Restart]                   │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 12. Sidebar Metadata (For Game Page)

```yaml
game:
  title: "Beat Crafter"
  description: "Solving puzzles creates music! Place falling note blocks on a 4×4 grid — align 3 of the same note to trigger chords in this rhythm puzzle. Create rich melodies through cascading clears!"
  genre: ["puzzle", "casual"]
  playCount: 0
  rating: 0
  controls:
    - "← → : Move block left/right"
    - "↓ : Soft drop"
    - "Space : Hard drop (instant landing)"
    - "P / ESC : Pause"
    - "Touch : Swipe to move / Column tap"
    - "Mouse : Click column to place"
  tags:
    - "#rhythmpuzzle"
    - "#music"
    - "#puzzle"
    - "#blocks"
    - "#casual"
    - "#proceduralmusic"
    - "#WebAudio"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

---

## 13. Implementation Checklist

### 13.1 Core Features (Required)
- [ ] 4-column × 8-row grid system
- [ ] 5 note block types (C/D/E/F/G, each with unique shape+color)
- [ ] Block drop + left/right movement + soft drop + hard drop
- [ ] DAS (Delayed Auto Shift) — dt accumulation method (setTimeout banned)
- [ ] Ghost block (landing preview display)
- [ ] Next block preview (1 block)
- [ ] Match detection (3+ consecutive same notes horizontal/vertical)
- [ ] 3-match / 4-match / T/L-shape match differentiated scoring
- [ ] Clear → gravity → cascading matches (chain system)
- [ ] isClearing guard flag (input/block generation blocked during chain)
- [ ] Level system (clear count-based, 10 stages)
- [ ] Drop speed increase (level-based dropInterval decrease)
- [ ] Note pool expansion (3→5 types by level)
- [ ] Dynamic balance adjustment (match-favorable block generation in critical state)
- [ ] Scoring system (chain multiplier × level multiplier) + localStorage best record
- [ ] 6-state game state machine
- [ ] TweenManager (**clearImmediate() included** — Cycle 4 B1 fix)
- [ ] ObjectPool (particles, waves, note icons)
- [ ] TransitionGuard pattern (guard flag + state priority)
- [ ] enterState() pattern (state entry initialization unified — Cycle 4 glow fix)
- [ ] Canvas-based modal (confirm replacement)
- [ ] State × system matrix included as code comments
- [ ] game.destroy() + listener cleanup
- [ ] Keyboard/mouse/touch input auto-detection with branching behavior

### 13.2 Visual/Effects (Required)
- [ ] Neon music visuals (pure Canvas drawing)
- [ ] 5 block types with unique shapes (circle/diamond/triangle/square/star)
- [ ] Scale letter display inside blocks (C/D/E/F/G)
- [ ] Ghost block (30% alpha, dashed border)
- [ ] Clear effect (scale expand→disappear + particle burst)
- [ ] Chain text scaleUp + fadeOut tween
- [ ] Landing effect (horizontal wave)
- [ ] Level up effect (screen flash + text)
- [ ] Beat-reactive background (brightness pulse on clear, BPM oscillation)
- [ ] Floating note particles (♪ shape)
- [ ] Offscreen canvas grid cache
- [ ] Game over sequential fadeIn result effect
- [ ] NEW BEST easeOutElastic effect
- [ ] Game over warning (top 2 rows red vignette)

### 13.3 Sound (Core — Essential for "Puzzle = Composition" Experience)
- [ ] Web Audio API block landing single note (corresponding scale, 50ms)
- [ ] Web Audio API match clear chord (matched scales played simultaneously)
- [ ] Web Audio API chain bonus chord (octave up + bass added)
- [ ] Web Audio API background beat metronome (BPM-based, very low volume)
- [ ] Level up arpeggio sound effect
- [ ] Game over descending sound effect
- [ ] All clear full major chord
- [ ] AudioContext.currentTime-based timing (setTimeout absolutely banned)
- [ ] audioCtx.suspend() on PAUSE / audioCtx.resume() on resume
- [ ] try-catch wrapping (all audio calls)
- [ ] AudioContext initialization on first interaction
- [ ] Game functions normally via visual only on audio failure

### 13.4 Design Doc Verification Checklist (For Code Review)
- [ ] Confirm `tw.update(dt)` called in all states (matrix cross-check)
- [ ] Confirm zero `setTimeout` / `setInterval` usage
- [ ] Confirm zero `confirm()` / `alert()` usage
- [ ] Confirm zero SVG / external images / external fonts / external sounds usage
- [ ] Confirm zero ASSET_MAP / SPRITES / preloadAssets remnants
- [ ] Confirm score check→save order (`isNewBest` first)
- [ ] Confirm `beginTransition()` helper used for all state transitions
- [ ] Confirm `enterState()` function handles all state initialization logic
- [ ] Confirm `transitioning` guard flag applied to all tween transitions
- [ ] Confirm `isClearing` guard flag blocks input/block generation during chain
- [ ] Confirm `STATE_PRIORITY` map defined and priority check functioning
- [ ] Confirm `clearImmediate()` used in resetGame() (**not cancelAll!**)
- [ ] Confirm destroy() pattern cleans up all listeners (`registeredListeners` used)
- [ ] Confirm all 5 easing functions implemented
- [ ] Confirm bpm update path is tween-only (no direct assignment)
- [ ] **Verify update/usage of all declared variables** (ghost variable prevention — §7.3 cross-reference)
- [ ] Confirm only Canvas-based modals used
- [ ] Confirm audioCtx.suspend() in PAUSE/CONFIRM_MODAL

### 13.5 Auto-Verification Script (Cycle 4 Suggestion — Actually Adopted)

> Three consecutive cycles of SVG recurrence confirmed "design doc specification alone is insufficient." Run periodically during coding and once before final code review.

```bash
# Banned pattern check (all must be 0 matches to PASS)
echo "=== Banned Pattern Auto-Verification ==="
echo "--- setTimeout/setInterval ---"
grep -cn "setTimeout\|setInterval" games/beat-crafter/index.html
echo "--- confirm/alert/prompt ---"
grep -cn "confirm(\|alert(\|prompt(" games/beat-crafter/index.html
echo "--- SVG / external images ---"
grep -cn "\.svg\|\.png\|\.jpg\|\.gif\|feGaussianBlur\|<filter" games/beat-crafter/index.html
echo "--- external fonts/CDN ---"
grep -cn "fonts.googleapis\|cdn\.\|<link.*stylesheet" games/beat-crafter/index.html
echo "--- external sound files ---"
grep -cn "\.mp3\|\.ogg\|\.wav\|Audio(" games/beat-crafter/index.html
echo "--- eval ---"
grep -cn "eval(" games/beat-crafter/index.html
echo "--- unused asset remnants ---"
grep -cn "ASSET_MAP\|SPRITES\|preloadAssets" games/beat-crafter/index.html
echo "=== ALL items 0 = PASS ==="
```

> **⚠️ Cycle 5 platform-wisdom additional lesson:** A single verification after code completion is insufficient. Run periodically during coding to catch remnant patterns early.
