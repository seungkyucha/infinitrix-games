---
verdict: NEEDS_MINOR_FIX
game-id: neon-survivors
cycle: 2
reviewer: QA-agent
date: 2026-04-18
review-round: 3

buttons:
  - name: "START (TITLE — custom)"
    keys: [Space, Enter]
    size: "260x56"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: "Scene.transition('DIFF_SELECT') → difficulty select"
  - name: "Easy/Normal/Hard (DIFF_SELECT)"
    keys: [Digit1, Digit2, Digit3]
    size: "260x52"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: "Set difficulty → transition to PLAY"
  - name: "⏸ (PLAY)"
    keys: [Escape]
    size: "48x48"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: PASS
  - name: "Level-Up Card 1/2/3 (IX.Button)"
    keys: [Digit1, Digit2, Digit3]
    size: "dynamic (max 180xN)"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: "selectUpgrade(idx) → apply upgrade"
  - name: "RESTART (GAMEOVER)"
    keys: [KeyR, Space, Enter]
    size: "280x52"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: PASS
  - name: "TITLE (GAMEOVER)"
    keys: [Escape]
    size: "280x48"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: PASS
  - name: "RESTART (VICTORY)"
    keys: [KeyR, Space, Enter]
    size: "280x52"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: PASS
  - name: "TITLE (VICTORY)"
    keys: [Escape]
    size: "280x48"
    hitTest: PASS
    touch: PASS
    keyboard: PASS
    onClick: PASS

restart-leak-test:
  cycles: 3
  result: PASS
  details: "3 consecutive GAMEOVER→DIFF_SELECT→PLAY cycles — score/kills/wave/hp/level/xp all properly reset"

asset-consistency:
  art-style: "pixel-art-32bit"
  total-loaded: 32
  total-failed: 0
  inconsistencies:
    - "player-idle-sheet.png: Inconsistent with player.png — but NOT used in game code (dead asset)"
    - "player-hurt.svg: Vector silhouette — style differs from pixel-art PNG (displayed briefly on hit)"
    - "thumbnail: Asset missing"
---

# Cycle 2 Review — Neon Survivors (neon-survivors)

> **Verdict: NEEDS_MINOR_FIX**
> Review Round 3 (post-feedback re-review) | 2026-04-18

---

## Previous Feedback Resolution Check

### HIGH Items

| Item | Fixed? | Details |
|------|--------|---------|
| H-NEW-1: `Layout.fontSize` binding loss → HUD not rendering → 45s auto-reset | ✅ **Fixed** | Line 1103: `const fs = (sz, w2, h2) => Layout.fontSize(sz, w2, h2);` — Arrow function wrapper preserves binding. Full HUD rendering verified. 60s+ gameplay with no StateGuard reset. |
| H-1: GameFlow.init overwrites custom TITLE → DIFF_SELECT unreachable | ✅ **Fixed** | Line 1471: `GameFlow.init({ title: Scene._states.TITLE, ... })` — Custom TITLE preserved. TITLE→DIFF_SELECT→PLAY flow works. Neon grid/subtitle/high-score all displayed. |
| H-2: Level-up cards not using IX.Button — custom hit-test | ✅ **Fixed** | Lines 797-818: `showLevelUpChoices()` creates 3 `new Button({...})` instances. Managed via `upgradeButtons` array with `clearUpgradeButtons()` cleanup. Keyboard(Digit1/2/3) + touch + click all work via IX.Button. |
| H-3: player-idle-sheet.png inconsistent with player.png | ⚠️ **Partially resolved** | PNG itself unchanged, but **`playerIdleSheet` is NOT used in game code** (dead asset). `playerHurt` uses SVG fallback. Minimal visual impact → downgraded to LOW. |

### MED Items

| Item | Fixed? | Details |
|------|--------|---------|
| M-1: GAMEOVER data access via `GameFlow._config?._gameoverData` | ✅ **Fixed** | Lines 1351-1354: `let gameoverData = {}; enter: (data) => { gameoverData = data || {}; }` — Module-level variable storage |
| M-2: VICTORY `Scene._states.VICTORY._data` internal access | ✅ **Fixed** | Lines 1398-1401: `let victoryData = {}; enter: (data) => { victoryData = data || {}; }` — Same pattern applied |
| M-3: Thumbnail asset missing | ❌ **Not fixed** | File does not exist, not registered in manifest |

### LOW Items

| Item | Fixed? | Details |
|------|--------|---------|
| L-1: playerHurt SVG style difference | Unchanged | Displayed briefly during hit, minimal gameplay impact |
| L-2: inputDelay negative prevention | ✅ **Fixed** | Line 1287: `gameState.inputDelay = Math.max(0, gameState.inputDelay - dt / 1000);` |

### Summary: HIGH 3/3 fully fixed + 1/1 downgraded (dead asset), MED 2/3 fixed

---

## Category Verification Results

### A. IX Engine Compliance

| Item | Result | Notes |
|------|--------|-------|
| A-1. IX.GameFlow/Scene/Button usage | ✅ PASS | GameFlow.init with custom TITLE, level-up cards use IX.Button |
| A-2. Scene.setTimeout/setInterval/on usage | ✅ PASS | All timers use Scene.setTimeout |
| A-3. art-style applied | ✅ PASS | Background #0d1117, cyan #00d4ff, neon grid wiring |

> **Verdict: PASS**

### B. Button 3-Way Interaction

| Button | Mouse | Touch | Keyboard | 44px+ | Verdict |
|--------|-------|-------|----------|-------|---------|
| START (TITLE) | ✅ | ✅ | ✅ Space/Enter | ✅ 260x56 | PASS |
| Difficulty 3 buttons (DIFF_SELECT) | ✅ | ✅ | ✅ Digit1/2/3 | ✅ 260x52 | PASS |
| ⏸ (PLAY) | ✅ | ✅ | ✅ Escape | ✅ 48x48 | PASS |
| Level-up Card 1/2/3 | ✅ | ✅ | ✅ Digit1/2/3 | ✅ max180xN | **PASS (IX.Button)** |
| RESTART (GAMEOVER) | ✅ | ✅ | ✅ R/Space/Enter | ✅ 280x52 | PASS |
| TITLE (GAMEOVER) | ✅ | ✅ | ✅ Escape | ✅ 280x48 | PASS |
| RESTART (VICTORY) | ✅ | ✅ | ✅ R/Space/Enter | ✅ 280x52 | PASS |
| TITLE (VICTORY) | ✅ | ✅ | ✅ Escape | ✅ 280x48 | PASS |

> **Verdict: PASS**

### C. 3-Consecutive Restart Test

| Item | Cycle 1 | Cycle 2 | Cycle 3 | Verdict |
|------|---------|---------|---------|---------|
| score | 1 | 1 | 1 | ✅ |
| kills | 0 | 0 | 0 | ✅ |
| wave | 0 | 0 | 0 | ✅ |
| hp/maxHp | 100/100 | 100/100 | 100/100 | ✅ |
| level/xp | 1/0 | 1/0 | 1/0 | ✅ |

> **Verdict: PASS**

### D. Steam Indie-Level Play Quality

| Item | Result | Notes |
|------|--------|-------|
| D-1. Core loop delivers fun in 30s | ✅ PASS | Auto-attack + enemy waves + gem collection + combo system functional |
| D-2. Clear win/lose conditions | ✅ PASS | HP 0=game over (Score/Kills/Time/Best shown), boss kill=victory (rank shown) |
| D-3. Score/progress visual feedback | ✅ PASS | Full HUD rendering — HP bar, XP bar, wave, timer, score, kills, combo |
| D-4. Sound effects | ✅ PASS | Web Audio tone synthesis working |
| D-5. Particle/tween effects | ✅ PASS | Enemy death particles, hit sparks, level-up effect |

> **Verdict: PASS**

### E. Screen Transition + Stuck Prevention

| Item | Result | Notes |
|------|--------|-------|
| E-1. Asset load 10s timeout | ✅ PASS | `assets.load(assetMap, { timeoutMs: 10000 })` |
| E-2. StateGuard active | ✅ PASS | `stuckMs: 45000` — no false trigger at 60s+ gameplay |
| E-3. TITLE→DIFF_SELECT→PLAY transition | ✅ PASS | Custom TITLE preserved, DIFF_SELECT reachable |
| E-4. PLAY→GAMEOVER transition | ✅ PASS | `endGame(false) → GameFlow.gameOver(data)` works |
| E-5. GAMEOVER→TITLE→DIFF_SELECT→PLAY restart | ✅ PASS | Keyboard and touch both work |
| E-6. Scene transition 200ms input delay | ✅ PASS | `inputDelay = 0.2`, `Math.max(0, ...)` applied |

> **Verdict: PASS**

### F. Input System

| Item | Result | Notes |
|------|--------|-------|
| F-1. IX.Input usage | ✅ PASS | `held()/jp()/tapped/tapX/tapY/touches` all via IX.Input |
| F-2. Coordinate transform via engine | ✅ PASS | |
| F-3. Virtual joystick | ✅ PASS | Dynamic creation on touch, 10px deadzone, hint area shown |

> **Verdict: PASS**

### G. Asset Consistency

| Item | Result | Notes |
|------|--------|-------|
| G-1. Art-style unity | ⚠️ PARTIAL | player-idle-sheet.png inconsistent but unused in code. Thumbnail missing. |
| G-2. Character variant consistency | ⚠️ PARTIAL | playerHurt SVG fallback (style differs but functionally fine) |

> **Verdict: PARTIAL PASS** (no gameplay impact)

---

## Browser Test Results (Puppeteer)

| Test | Result | Notes |
|------|--------|-------|
| A: Load + Title | ✅ PASS | 32 assets loaded, 0 errors. Custom TITLE renders (neon grid/subtitle/high-score) |
| B: Space Start → DIFF_SELECT → PLAY | ✅ PASS | Full TITLE→DIFF_SELECT→PLAY flow works. Difficulty selection (HP change) verified. |
| C: Movement Controls | ✅ PASS | WASD movement, auto-attack, enemy kills, gem collection, combo ×1.5 working |
| D: Game Over + 3x Restart | ✅ PASS | All 3 cycles perfectly reset. GAMEOVER screen shows Score/Kills/Time/Best |
| D-2: Level-Up Cards (IX.Button) | ✅ PASS | 3 IX.Button instances created, Digit2 keyboard selection → upgradeActive=false |
| E: Touch Interaction | ✅ PASS | Touch START→DIFF_SELECT→PLAY full flow completed (Easy HP 150 verified) |

**JavaScript Errors: 0**

---

## Round 2 vs Round 3 Comparison

| Category | Round 2 | Round 3 | Change |
|----------|---------|---------|--------|
| A. IX Engine Compliance | ⚠️ PARTIAL | ✅ PASS | ⬆ Improved (level-up cards → IX.Button) |
| B. Button 3-Way | ❌ FAIL | ✅ PASS | ⬆ Improved (all buttons IX.Button + 3-way) |
| C. 3x Restart | ✅ PASS | ✅ PASS | Same |
| D. Play Quality | ❌ FAIL | ✅ PASS | ⬆ Improved (HUD rendering fixed) |
| E. Screen Transition | ⚠️ PARTIAL | ✅ PASS | ⬆ Improved (DIFF_SELECT reachable) |
| F. Input System | ✅ PASS | ✅ PASS | Same |
| G. Asset Consistency | ❌ FAIL | ⚠️ PARTIAL | ⬆ Partial improvement (dead asset confirmed) |

---

## Remaining Issues (MINOR)

### M-3. Thumbnail Asset Missing
- **Location**: `assets/` directory, `manifest.json`
- **Issue**: Game representative image (800x600) does not exist
- **Impact**: Default image shown in game list. No gameplay impact.
- **Fix**: Generate thumbnail per spec asset requirements and register in manifest

### L-3. player-idle-sheet.png Inconsistency (Dead Asset)
- **Issue**: Different character than player.png, but not used in game code
- **Impact**: None (will need replacement if idle animation is added later)

### L-1. playerHurt SVG Style Difference
- **Issue**: player-hurt.svg is vector silhouette, differs from pixel-art PNG style
- **Impact**: Displayed for only 0.5s on hit, minimal gameplay impact

---

## Code Quality Notes

### Positive
- Object pooling (bullet 200, enemy 100, gem 300)
- Spatial hashing 64px grid cell collision optimization
- deltaTime-based frame-independent logic
- Camera system (lerp 0.1 smooth tracking)
- 4-tier combo multiplier system
- Boss AI with 2 phases
- Full IX Engine API usage (GameFlow/Scene/Button/Input/Sound/Save)
- Scene transition 200ms input delay with Math.max guard
- enter(data) pattern for inter-scene data passing

### Needs Improvement (MINOR — deployable)
1. **[MED]** Generate thumbnail asset and register in manifest
2. **[LOW]** Replace player-idle-sheet.png or remove unused reference from manifest
3. **[LOW]** Replace playerHurt SVG with pixel-art PNG (optional)

---

## Final Verdict

> **NEEDS_MINOR_FIX**
>
> | Category | Verdict |
> |----------|---------|
> | A. IX Engine Compliance | ✅ PASS |
> | B. Button 3-Way | ✅ PASS |
> | C. 3x Restart | ✅ PASS |
> | D. Play Quality | ✅ PASS |
> | E. Screen Transition | ✅ PASS |
> | F. Input System | ✅ PASS |
> | G. Asset Consistency | ⚠️ PARTIAL |
>
> **All previous HIGH items (3/3) fully fixed + critical new bug (H-NEW-1) fixed**
> **Remaining: thumbnail missing (MED) + dead asset cleanup (LOW)**
>
> Game core loop fully functional — deployable, thumbnail addition recommended
