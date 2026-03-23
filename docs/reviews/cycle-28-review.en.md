---
game-id: neon-pulse
cycle: 28
round: 4
date: 2026-03-23
verdict: APPROVED
review-type: post-feedback
---

# Cycle #28 Code Review (Round 4 — Post Planner/Designer Feedback Re-review) — Neon Pulse

## Game Overview
- **Genre**: arcade, casual (rhythm arcade roguelite)
- **File**: `public/games/neon-pulse/index.html` (3,288 lines)
- **Assets**: assets/ directory does not exist (fully deleted ✅)

---

## Round 3 Follow-up Verification

| # | Item | Result | Notes |
|---|------|--------|-------|
| 1 | Round 3 APPROVED maintained | ✅ Maintained | 0 new issues |
| 2 | Planner feedback applied | ✅ Confirmed | BPM tween single path (F70), 14-item smoke gate, 10 REGION structure |
| 3 | Designer feedback applied | ✅ Confirmed | Neon glow signature, zone color palettes, pure Canvas rendering |
| 4 | No regression bugs | ✅ Confirmed | Full flow verified via Puppeteer execution test |

---

## 1. Game Start Flow — ✅ PASS

- **BOOT→TITLE transition**: L242 `ACTIVE_SYS[STATE.BOOT] = SYS.TWEEN|SYS.DRAW` → Puppeteer verified: `state=1` reached ✅
- **Title screen**: drawTitle() — glitch effect, subtitle, player character, high score, language toggle ✅
- **Start input**: Space/Enter (L2786) + screen tap (L2923) → `beginTransition(STATE.DIFFICULTY_SELECT)` ✅
- **Difficulty select**: 3 tiers (Beginner/DJ/Maestro) — keyboard ↑↓ + Enter, touch tap both supported ✅
- **Zone map**: Unlocked zones display + upgrade button ✅
- **Initialization**: `startNewRun()` (L2158) — HP, combo, score, chips, crystals, DDA all reset ✅
- **Puppeteer verified**: TITLE(1) → DIFFICULTY_SELECT(2) → ZONE_MAP(3) → PLAYING(5) transition success ✅

## 2. Input System — Desktop — ✅ PASS

- **keydown/keyup**: L2762, L2774 — registered ✅
- **Attack keys**: Space/↑/W → beat attack (L2818-2821), ←/A → dodge left (L2823), →/D → dodge right (L2824) ✅
- **Code flow**: keydown → handleKeyAction → handleBeatAttack → judgeInput → calcDamage → applyDamageToEnemy ✅
- **Pause**: P/Escape (L2825-2829) → `beginTransition(STATE.PAUSE)` ✅
- **Hold beats**: keydown sets `isHolding=true` (L2820), keyup sets `isHolding=false` (L2778) → referenced in updateHoldBeats() ✅
- **Mouse**: L3025 mousedown registered separately ✅
- **Browser default prevention**: L2764 e.preventDefault() applied ✅

## 3. Input System — Mobile — ✅ PASS

- **touchstart/touchmove/touchend**: L2881, L2894, L2898 — registered ✅
- **Touch attack**: screen tap → handleTouchStart → handleBeatAttack ✅
- **Swipe dodge**: touchend with dx ≥ 30px && elapsed ≤ 200ms → handleDodge ✅
- **Pause button**: top-right, uses hitTest (L2957-2958) ✅
- **touch-action: none**: L9 ✅, overflow: hidden ✅
- **Coordinate transform**: `inputToCanvas()` (L2493-2495) — correct ✅
- **Scroll prevention**: all touch events have `e.preventDefault()` + `{ passive: false }` ✅
- **Full keyboard-free operation**: title tap → difficulty tap → zone tap → play (tap+swipe) → pause → chip select → upgrade → gameover tap ✅

## 4. Game Loop & Logic — ✅ PASS

- **requestAnimationFrame**: L3213, L3280 ✅
- **Delta time**: L3089-3090 `rawDt = timestamp - lastTime`, `dt = Math.min(rawDt, 33.33)` (30fps floor) ✅
- **sys() system activation**: L3112-3125 ✅
- **Collision detection**: beat timing judgment (judgeInput L1766) — correct ✅
- **Score calculation**: `calcScore()` → `G.score += scoreGain` ✅
- **Difficulty scaling**: zone BPM ranges + boss phase BPM tween + DDA 3 levels ✅
- **Hold beat sustained damage**: `updateHoldBeats()` (L1812) — holdDur/holdRatio/isHolding fully connected ✅
- **Double beat 2-tap**: `doublePending` state + 400ms timer + auto Miss (L3049-3059) ✅
- **BPM tween single path**: G.bpm updated only via tw.add(), direct assignment 0 (F70) ✅
- **Procedural BGM**: SoundManager.startBGM/updateBGM — audioCtx.currentTime based, setTimeout 0 ✅

## 5. Game Over & Restart — ✅ PASS

- **Game over condition**: `G.player.hp <= 0` → `onGameOver()` (L2372) ✅
- **Game over screen**: `drawGameOver()` (L1357) — Puppeteer screenshot confirmed ✅
- **High score localStorage**: `finishRun()` → `saveSave()` (L2383-2397) ✅
- **Restart**: R/Space/tap → `tw.clearImmediate() + particles.clear() + G._transitioning=false + setState(STATE.TITLE)` ✅
- **REVERSE_ALLOWED**: GAMEOVER(90)→TITLE(1) allowed (L2119) ✅
- **State reset**: startNewRun() (L2158-2185) resets all game state ✅
- **Puppeteer verified**: HP 0 → state=90 (GAMEOVER) transition confirmed ✅

## 6. Screen Rendering — ✅ PASS

- **Canvas sizing**: `resizeCanvas()` (L2478) — uses `window.innerWidth × innerHeight` ✅
- **devicePixelRatio**: L2479 dpr applied, L2482-2483 canvas sizing, L3094 `ctx.setTransform(dpr, ...)` ✅
- **Resize event**: L3033 `window.addEventListener('resize', resizeCanvas)` ✅
- **Rendering**: Background, Player, Enemy, Boss, BeatLane, HUD — all pure Canvas ✅
- **Camera shake**: L3097-3101 SeededRNG-based ✅
- **drawHitEffect**: L1660-1680 pure Canvas radial particles ✅
- **Transition fade**: L3202-3205 `G._transAlpha` overlay ✅
- **Beat pulse overlay**: L3252-3259 BPM-synced screen pulse ✅
- **Puppeteer verified**: 400×600 and 800×600 both render correctly ✅

## 7. External Dependency Safety — ✅ PASS

- **System font fallback**: `"Segoe UI", system-ui, sans-serif` — used throughout ✅
- **External CDN: 0**: No Google Fonts, no external scripts ✅
- **Asset code: 0**: No new Image(), no fetch() file references ✅
- **assets/ directory**: Does not exist (fully deleted) ✅
- **Canvas fallback**: 100% Canvas procedural rendering ✅

---

## Code Quality Checklist

| Item | Result | Notes |
|------|--------|-------|
| Math.random: 0 | ✅ PASS | SeededRNG only |
| setTimeout: 0 (calls) | ✅ PASS | 2 comments only, 0 actual calls |
| alert/confirm/prompt: 0 | ✅ PASS | Canvas UI only |
| eval(): 0 | ✅ PASS | |
| External CDN: 0 | ✅ PASS | System fonts only |
| new Image(): 0 | ✅ PASS | |
| assets/ directory | ✅ PASS | Directory does not exist |
| devicePixelRatio | ✅ PASS | dpr applied |
| resize event | ✅ PASS | resizeCanvas() |
| hitTest single function (F16) | ✅ PASS | 12 call sites |
| Touch target 48px+ (F11) | ✅ PASS | Math.max(CONFIG.MIN_TOUCH, ...) |
| STATE×SYSTEM matrix (F7) | ✅ PASS | 16 states fully defined |
| BPM tween single path (F70) | ✅ PASS | Direct assignment: 0 |
| bossRewardGiven guard (F17) | ✅ PASS | L2177, L2193 |
| transAlpha connection | ✅ PASS | G._transAlpha directly tweened+rendered |
| REVERSE_ALLOWED dictionary | ✅ PASS | 11 state transition paths covered |
| BOOT→TITLE transition | ✅ PASS | SYS.TWEEN included in ACTIVE_SYS[BOOT] |
| Hold beat implementation | ✅ PASS | updateHoldBeats() + holdDur + holdRatio |
| drawHitEffect Canvas fallback | ✅ PASS | Radial particle implementation |
| try-catch game loop protection | ✅ PASS | L3088, L3209-3212 |
| 10 REGION code structure (F66) | ✅ PASS | CONFIG→ENGINE→ENTITY→DRAW→RHYTHM→COMBAT→ROGUE→STATE→SAVE→MAIN |

---

## Mobile Controls Assessment

| Item | Result | Notes |
|------|--------|-------|
| Viewport meta tag | ✅ PASS | width=device-width, user-scalable=no |
| Start without keyboard | ✅ PASS | Title tap → difficulty tap → zone tap |
| Play without keyboard | ✅ PASS | Tap = attack, swipe = dodge, pause button |
| Restart without keyboard | ✅ PASS | Game over screen tap (L3013-3020) |
| Chip selection without keyboard | ✅ PASS | Card area tap (L2982-2985) |
| Upgrade without keyboard | ✅ PASS | Tree tap + back button tap (L2999-3010) |
| Pause escape without keyboard | ✅ PASS | Resume/Quit button tap (L2972-2976) |
| Scroll prevention | ✅ PASS | touch-action:none, overflow:hidden, e.preventDefault() |
| Mouse events registered | ✅ PASS | L3025 mousedown |

---

## Planner Feedback Verification

| Feedback Item | Applied | Code Location |
|--------------|---------|---------------|
| F70: BPM tween single path | ✅ Applied | L1965, L2199 — tw.add() only |
| F66: 10 REGION structure | ✅ Applied | REGION 1~10 clearly separated |
| F67: DPS/EHP formula + chip cap | ✅ Applied | CHIP_DPS_CAP(2.0), CHIP_SYNERGY_CAP(1.5) |
| F68: assets/ zero principle | ✅ Applied | Directory does not exist |
| F69: hitTest single function | ✅ Applied | L1133, 12 call sites |
| F65: 14-item smoke test gate | ✅ Applied | All static+dynamic items PASS |
| F18: SeededRNG complete usage | ✅ Applied | Math.random: 0 |
| F4: setTimeout: 0 | ✅ Applied | 0 calls, 2 comments only |

## Designer Feedback Verification

| Feedback Item | Applied | Code Location |
|--------------|---------|---------------|
| Neon Glow Line signature | ✅ Applied | drawPlayer pink visor + cyan headphones, full glow |
| Synthwave color palette | ✅ Applied | ZONE_COLORS[0] = ['#FF6EC7','#7B68EE','#FF69B4','#1A0033'] |
| Zone-differentiated enemy design | ✅ Applied | drawEnemy 5 types (note/speaker/cassette/drumstick/glitch) |
| Boss turntable design | ✅ Applied | drawBoss — vinyl grooves, tonearm, equalizer bars |
| Boss-specific decorations | ✅ Applied | Crown/speaker/noise/energy ring/glitch (L884-916) |
| Pure Canvas rendering | ✅ Applied | new Image(): 0, 100% procedural |
| Beat type visual differentiation | ✅ Applied | Circle/double/rect-hold/diamond-dodge/star-boss (L976-999) |

---

## Browser Test (Puppeteer MCP)

| Item | Result | Notes |
|------|--------|-------|
| Page load | ✅ PASS | file:// protocol loaded successfully |
| No console errors | ✅ PASS | errors=0, warnings=0 |
| Canvas rendering | ✅ PASS | 400×600 and 800×600 both verified |
| BOOT→TITLE transition | ✅ PASS | state=1 confirmed |
| Title screen display | ✅ PASS | Glitch title + DJ character + start prompt |
| Language toggle | ✅ PASS | ko→en click transition confirmed |
| Difficulty select screen | ✅ PASS | 3-tier difficulty + descriptions displayed |
| Zone map screen | ✅ PASS | Synthwave zone + upgrade button |
| Gameplay screen | ✅ PASS | Player/enemies/beat lane/HUD/judge display/DDA all rendered |
| Game over screen | ✅ PASS | Score/high score/combo/crystals/restart prompt |
| Touch event code exists | ✅ PASS | touchstart/move/end + { passive: false } |
| Score system | ✅ PASS | calcScore + G.score |
| localStorage high score | ✅ PASS | SAVE_KEY + saveSave |

**Puppeteer test flow**: BOOT → TITLE → (language toggle ko→en) → DIFFICULTY_SELECT → ZONE_MAP → STAGE_INTRO → PLAYING → GAMEOVER — **all state transitions completed without errors** ✅

---

## Final Verdict

### Code Review: APPROVED
### Test: PASS (Puppeteer MCP execution verified)

**Reason**: Round 3 APPROVED status maintained. All planner feedback (F65~F70) fully applied. All designer feedback (neon glow signature, zone colors, boss design) fully applied. Puppeteer MCP verified actual browser execution: BOOT→TITLE→DIFFICULTY→ZONE→PLAYING→GAMEOVER full flow with zero errors. Regression bugs: 0. Ready for immediate deployment.

### Full Review Cycle Summary:

| Round | Verdict | Key Issues |
|-------|---------|------------|
| Round 1 | NEEDS_MAJOR_FIX | P0: STATE_PRIORITY reverse transition block, P1: assets/ active reference, P2: Hold beat unimplemented, P3: drawHitEffect no fallback |
| Round 2 | NEEDS_MAJOR_FIX | Round 1 all 4 fixed ✅, New P0: BOOT→TITLE stuck, P1: assets/ physical files remaining |
| Round 3 | APPROVED | Round 2 all 2 fixed ✅. New issues: 0. |
| **Round 4** | **APPROVED** | Planner/designer feedback verified + Puppeteer execution test. Regression bugs: 0. |

### Positive Assessment:
- Puppeteer MCP execution test verified actual browser operation ✅
- BOOT→TITLE→DIFFICULTY→ZONE→PLAYING→GAMEOVER all state transitions error-free ✅
- Console errors: 0, warnings: 0 ✅
- 400×600 (mobile) and 800×600 (desktop) both render correctly ✅
- Language toggle (ko↔en) real-time switch works ✅
- Planner feedback F65~F70 fully applied ✅
- Designer feedback — neon glow, zone colors, boss turntable, 5 enemy types all applied ✅
- assets/ directory does not exist — F1/F68 fully compliant ✅
- 10 REGION code structure for 3,288-line codebase navigability (F66) ✅
- DPS cap (2.0) + synergy cap (1.5) + DDA 3-level fallback — balance safeguards (F67) ✅
- hitTest single function with 12 call sites (F16/F69) ✅
- SeededRNG complete usage, Math.random: 0 (F18) ✅
- setTimeout: 0, TweenManager + rAF only (F4) ✅
- BPM tween single path (F70) ✅
- Roguelite 13 chips + 3 upgrade trees — high quality implementation ✅
- Procedural sound (SoundManager) — differentiated by judge/combo/boss/zone ✅
