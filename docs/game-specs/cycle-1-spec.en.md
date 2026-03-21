---
game-id: color-merge-puzzle
title: Color Merge Puzzle
genre: puzzle
difficulty: easy
---

# Color Merge Puzzle — Detailed Game Design Document

> **Cycle:** 1 (First Cycle)
> **Date:** 2026-03-20
> **Designer:** Claude (Game Designer)
> **Reference:** Based on `docs/analytics/cycle-1-report.md` analysis report

---

## 0. Previous Cycle Feedback Integration

> Cycle 1 is the **first cycle** of the platform, so no previous post-mortem exists.
> Instead, **preemptive risk mitigation strategies** derived from the analysis report are incorporated into the design.

| Analysis Report Finding | Design Response |
|------------------------|-----------------|
| Prevent excessive scope | 5×5 grid, single game mode, self-contained in a single index.html |
| Prevent lack of mobile support | Support all 3 input types: touch swipe + keyboard + mouse drag |
| Prevent slow loading | Zero external assets, Canvas + code-generated graphics only |
| Prevent sound/asset copyright issues | No assets, visual expression through colors and shapes only |
| Prevent genre bias | Puzzle genre chosen as first game (expand to arcade/action later) |
| Differentiation needed (many 2048 clones) | Differentiate with rainbow color evolution + combo system + visual effects |

---

## 1. Game Overview & Core Fun Elements

### Concept
A puzzle game where you merge same-colored blocks to **progress through rainbow color stages**. It combines 2048's slide-merge mechanic with a **color evolution system** and **combo chain bonus** to deliver both visual satisfaction and strategic depth.

### Core Fun Elements
1. **Color evolution satisfaction** — Visual achievement of completing the rainbow from red to violet
2. **Combo chains** — When a single swipe triggers cascading merges, the combo multiplier increases and screen effects explode
3. **"Just one more game" addiction** — The desire to beat your high score drives immediate restarts after game over
4. **Intuitive controls** — Zero entry barrier since all blocks move with a single directional swipe

---

## 2. Game Rules & Objectives

### 2.1 Basic Rules
- Played on a **5×5 grid**
- Each turn, the player **swipes in one of four directions** (up/down/left/right)
- All blocks slide to the edge in that direction
- **Same-colored blocks** that collide in the slide direction **merge into one and evolve to the next color stage**
- Blocks in the same row/column can only merge **once** per swipe (same as 2048)
- After merging, **1 new block spawns in a random empty cell** (90% stage 1 red, 10% stage 2 orange)

### 2.2 Color Stages (7-Stage Rainbow)

| Stage | Color | HEX Code | Merge Score |
|-------|-------|----------|-------------|
| 1 | Red | `#FF6B6B` | 2 |
| 2 | Orange | `#FFA06B` | 6 |
| 3 | Yellow | `#FFD93D` | 18 |
| 4 | Green | `#6BCB77` | 54 |
| 5 | Blue | `#4D96FF` | 162 |
| 6 | Indigo | `#6B5BFF` | 486 |
| 7 | Violet | `#C56BFF` | 1458 |

> **Violet (Stage 7) + Violet = Rainbow Block (special)** → 2916 points + removes 3 lowest-stage blocks on the board (bonus event)

### 2.3 Combo System
- When **2 or more merges** occur in a single swipe, a combo triggers
- Combo multiplier: `number of merges × 1.5` (rounded down)
- Example: 3 merges → 4x bonus, 5 merges → 7x bonus
- When a combo occurs, a "COMBO ×N!" text effect appears on screen

### 2.4 Game Objective
- **Achieve the highest score** (endless play, no definitive ending)
- **Creating a violet block** (or achieving a rainbow block) is the de facto goal

### 2.5 Game Over Condition
- All 25 cells (5×5) are filled AND
- **No adjacent mergeable block pairs exist** in any direction
- On game over: display final score, check for high score update, show restart button

---

## 3. Controls

### 3.1 Keyboard (Desktop)
| Key | Action |
|-----|--------|
| `↑` / `W` | Move blocks up |
| `↓` / `S` | Move blocks down |
| `←` / `A` | Move blocks left |
| `→` / `D` | Move blocks right |
| `R` | Restart game (confirmation popup) |

### 3.2 Touch (Mobile/Tablet)
| Gesture | Action |
|---------|--------|
| Swipe up | Move blocks up |
| Swipe down | Move blocks down |
| Swipe left | Move blocks left |
| Swipe right | Move blocks right |

- **Minimum swipe distance:** 30px (to prevent accidental input)
- **Swipe detection:** Compares horizontal/vertical movement, direction determined by larger axis

### 3.3 Mouse (Desktop Alternative)
| Action | Description |
|--------|-------------|
| Click and drag | Functions identically to touch swipe |

---

## 4. Visual Style Guide

### 4.1 Overall Atmosphere
- **Minimal + Modern** — Clean rounded rectangles, soft shadows
- **Dark background + Vivid blocks** — Makes block colors stand out

### 4.2 Color Palette

| Element | HEX | Usage |
|---------|-----|-------|
| Background | `#1A1A2E` | Main background (deep navy) |
| Grid background | `#16213E` | Grid area background |
| Empty cell | `#0F3460` | Empty cell indicator |
| Text (primary) | `#FFFFFF` | Score, title |
| Text (secondary) | `#A0A0B0` | Description, auxiliary text |
| Combo text | `#FFD93D` | Combo effect (yellow) |
| Block colors | See 2.2 table | 7-stage rainbow |

### 4.3 Object Shapes
- **Blocks:** Rounded rectangles (border-radius: 12px), distinguished by **color only** without internal stage numbers or icons
- **Block size:** 90% of grid cell size, 8px gap between cells
- **Grid:** Rounded rectangle container (border-radius: 16px), slight internal padding
- **Scoreboard:** Above the grid, current score + best score side by side
- **Rainbow block (special):** 7-color gradient border + pulse animation

### 4.4 Animations
| Animation | Duration | Description |
|-----------|----------|-------------|
| Block movement | 150ms | ease-out slide |
| Merge | 200ms | Scale 1.0 → 1.2 → 1.0 (elastic bounce) |
| New block spawn | 200ms | Scale 0 → 1.0 (popup) |
| Combo text | 800ms | Float upward with fade out |
| Game over overlay | 300ms | Fade in |

---

## 5. Core Game Loop (Frame-Based Logic Flow)

```
[Idle State]
    │
    ▼
[Input Detection] ← Keyboard/Touch/Mouse events
    │
    ▼
[Input Validation]
    │  - Ignore if animation is in progress (input lock)
    │  - Check if any block can move in the given direction
    │  - Return to idle state if movement is impossible
    │
    ▼
[Block Movement Calculation] (Pure logic, frame-independent)
    │  1. Determine row/column traversal order based on direction
    │  2. Move each block to the edge in that direction
    │  3. Process merge of adjacent same-color blocks
    │  4. Count merge occurrences (for combo calculation)
    │  5. Finalize new grid state
    │
    ▼
[Animation Playback] (~150ms, requestAnimationFrame)
    │  - Block movement tween animation
    │  - Merge bounce animation
    │  - Combo text display (if applicable)
    │
    ▼
[New Block Generation]
    │  - Random selection from empty cell list
    │  - Place stage 1 (90%) or stage 2 (10%) block
    │  - Play spawn animation (~200ms)
    │
    ▼
[Game State Check]
    │  - If empty cells exist → return to [Idle State]
    │  - If no empty cells → check for adjacent mergeable pairs
    │     - If possible → return to [Idle State]
    │     - If impossible → [Game Over]
    │
    ▼
[Game Over]
    │  - Compare and save best score to localStorage
    │  - Display overlay (final score, best score, restart button)
    │
    ▼
[Restart] → Initialize grid → Place 2 initial blocks → [Idle State]
```

### Rendering Loop (60fps)
```javascript
function gameLoop(timestamp) {
    // 1. Update animations (movement, merge, effects)
    updateAnimations(timestamp);

    // 2. Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. Draw grid background
    drawGridBackground();

    // 4. Draw blocks (current position + animation offset)
    drawBlocks();

    // 5. Draw effects (combo text, particles, etc.)
    drawEffects();

    // 6. Draw UI (score, best score)
    drawUI();

    requestAnimationFrame(gameLoop);
}
```

---

## 6. Difficulty System

### 6.1 Dynamic Difficulty Curve

This game **naturally increases in difficulty** as the game progresses without explicit difficulty selection.

| Condition | Change | Effect |
|-----------|--------|--------|
| Default state | New block 90% stage 1, 10% stage 2 | Easy start |
| Score 500+ | New block 80% stage 1, 15% stage 2, 5% stage 3 | Slight complexity added |
| Score 2000+ | New block 70% stage 1, 20% stage 2, 10% stage 3 | Intermediate difficulty |
| Score 5000+ | Occasionally 2 new blocks per turn (20% chance) | Increased space pressure |
| Score 10000+ | 35% chance of 2 block generation | Advanced difficulty |

### 6.2 Difficulty Balance Principles
- **First 2 minutes:** Relaxed play while learning rules
- **3~5 minutes:** Space management strategy becomes necessary
- **After 5 minutes:** Each move requires careful thought, maintaining tension
- Achieving a rainbow block (merging two stage 7s) takes **10~15 minutes for skilled players**

---

## 7. Scoring System

### 7.1 Score Calculation

```
Turn Score = Σ(Merge scores of merged blocks) × Combo Multiplier
```

| Item | Calculation |
|------|-------------|
| Base merge score | Fixed per stage (see 2.2 table: 2, 6, 18, 54, ...) |
| Combo multiplier | 1 merge = ×1, 2 merges = ×3, 3 merges = ×4, 4 merges = ×6, 5+ merges = ×7 |
| Rainbow bonus | 2916 points + removes 3 lowest-stage blocks |

### 7.2 Score Milestones (Optional Notifications)

| Score | Milestone |
|-------|-----------|
| 100 | "Great Start!" |
| 500 | "Merge Master!" |
| 2000 | "Color Expert!" |
| 5000 | "Rainbow Hunter!" |
| 10000 | "Legendary Puzzler!" |

### 7.3 Best Score Storage
- Uses `localStorage.setItem('colorMergePuzzle_bestScore', score)`
- Loaded on game start, updated on game over
- Always displayed in the top UI

---

## 8. Technical Implementation Guide

### 8.1 File Structure
```
/games/color-merge-puzzle/index.html   ← Single file, everything included
```

### 8.2 Tech Stack
- **HTML5 Canvas** — Game rendering
- **Vanilla JavaScript** — Game logic (no frameworks)
- **CSS** — Minimal layout (container wrapping canvas)
- **localStorage** — Best score storage

### 8.3 Responsive Design
- Canvas size: `min(screen width - 40px, 500px)` square
- Mobile: Uses full screen width
- Desktop: Limited to 500px max (centered)
- Canvas readjusted on `window.resize` event

### 8.4 Performance Goals
- Maintain 60fps (requestAnimationFrame)
- Initial loading: under 0.5 seconds
- File size: under 30KB (before gzip)

---

## 9. Sidebar / Card Metadata

```yaml
# For game page sidebar
game:
  title: "Color Merge Puzzle"
  description: "Merge same-colored blocks to complete the rainbow! An addictive 2048-style color merge puzzle game."
  genre: ["puzzle"]
  playCount: 0
  rating: 0
  controls:
    - "Arrow Keys/WASD: Move blocks"
    - "Touch Swipe: Move blocks (mobile)"
    - "Mouse Drag: Move blocks"
    - "R Key: Restart"
  tags:
    - "#puzzle"
    - "#merge"
    - "#2048"
    - "#casual"
    - "#rainbow"
    - "#addictive"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

---

## 10. Future Expansion Possibilities (Cycle 2+)

> The following are NOT included in the Cycle 1 MVP and will be decided based on post-mortem results.

1. **Time Attack Mode** — Challenge for highest score within a 3-minute time limit
2. **Daily Challenge** — Same seed for identical initial placement daily, same conditions for all users
3. **Theme Skins** — Color theme changes: pastel, neon, monochrome, etc.
4. **Undo Feature** — Undo last move (rewarded for watching an ad)
5. **Global Leaderboard** — Rankings integrated with Supabase
