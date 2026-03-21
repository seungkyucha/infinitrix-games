---
game-id: spell-card-dungeon
title: Spell Card Dungeon
cycle: 19
review-round: 1
date: 2026-03-22
reviewer: QA Agent (Claude)
verdict: NEEDS_MINOR_FIX
code-review: NEEDS_MINOR_FIX
browser-test: PASS
---

# Cycle 19 Review — Spell Card Dungeon (spell-card-dungeon)

## Summary

**Verdict: NEEDS_MINOR_FIX** — The 2,815-line index.html is well-structured with all 10 game states implemented: TITLE→MAP→BATTLE→BOSS_INTRO→REWARD→SHOP→REST→EVENT→RESULT→GAMEOVER. 20 cards, 7 enemies, 3 bosses, 8 relics, 10 achievements — nearly full Phase 1–5 implementation. **However, two fixes are required**: (1) `assets/` directory exists in violation of F1 (18-cycle recurring lesson), (2) enemy debuffs (weak/vulnerable/slow) are not actually applied to the player — a gameplay bug.

---

## 2. Code Review (Static Analysis)

### ✅ PASS Items

| # | Item | Result | Details |
|---|------|--------|---------|
| 1 | Feature completeness | ✅ PASS | Spec Phase 1–5 nearly fully implemented. 20 cards, 7 enemies, 3 bosses, 8 relics, 4 events, 10 achievements, shop, rest, map system all present |
| 2 | Game loop | ✅ PASS | `requestAnimationFrame` (L2783). `dt = Math.min((timestamp - lastTime) / 1000, 0.1)` delta time. try-catch wrapper (F12) |
| 3 | Memory | ✅ PASS | Particle lifetime management with splice removal (L314). floatingTexts lifetime (L1344). TweenManager clearImmediate() (F6) |
| 4 | Hit detection | ✅ PASS | Turn-based game — no real-time collision needed. `inRect()` for UI hit testing (L564). Map nodes use `Math.hypot` distance (L2469) |
| 5 | State transitions | ✅ PASS | All via `beginTransition()` (F23). STATE_PRIORITY map (F17). Only PAUSED uses direct assignment (allowed exception). Fade overlay animation |
| 6 | Score/high score | ✅ PASS | `calcScore()` with floor×100 + kills×10 + boss×500. `localStorage` save/load (L588–604). Achievements also saved to localStorage |
| 7 | Security | ✅ PASS | `eval()` 0 occurrences, `alert()/confirm()/prompt()` 0, `window.open()` 0. No XSS risk |
| 8 | Performance | ✅ PASS | Offscreen bgCache (F10). `buildBgCache()` only on resizeCanvas() (L214). No per-frame DOM access |
| 9 | setTimeout | ✅ PASS | 0 actual setTimeout calls (1 in comment only). All timing via TweenManager callbacks (F2) |
| 10 | Guard flags | ✅ PASS | `GUARDS.isTransitioning`, `isAnimating`, `isSelectingCard`, `isBossIntro` quadruple guard system (F5) |
| 11 | Single update path | ✅ PASS | `modifyHP()`, `modifyMana()`, `addGold()` dedicated functions (F16). Direct `playerHP =` only during initialization |
| 12 | SVG filters | ✅ PASS | `feGaussianBlur` 0 occurrences. Glow via `shadowBlur` (F9) |
| 13 | DPR support | ✅ PASS | `window.devicePixelRatio` applied. canvas.width = W * dpr (L209–213) |
| 14 | Web Audio | ✅ PASS | SoundManager class. Element-specific card SFX, BGM drone, boss-specific BGM. Native scheduling (`ctx.currentTime + delay`) |
| 15 | update/render separation | ✅ PASS | update() handles state changes only (L1326–1348), render() is pure output (L1354–1392). F26 compliant |

### 🔴 Required Fixes (MAJOR)

#### C1. `assets/` Directory Exists — F1 Violation

**Location**: `public/games/spell-card-dungeon/assets/` (8 SVGs + manifest.json)

**Issue**: Spec §14.5 and F1 explicitly state: "assets/ directory absolutely prohibited. 100% Canvas code drawing. Only thumbnail.svg allowed separately." However, `ASSET_MAP` (L169–178), `preloadAssets()` (L181–192), and `SPRITES` object exist, loading 8 SVG files.

**Current state**: The game has Canvas fallbacks for all sprites and works without any SVGs (drawEnemy, drawBoss, drawWizard, renderHUD, etc.). However, the assets directory triggers 8 unnecessary network requests.

**Fix**:
1. Delete entire `assets/` directory (move thumbnail.svg to game root)
2. Remove `ASSET_MAP`, `SPRITES`, `preloadAssets()` code
3. Remove all `SPRITES.xxx` conditional branches (keep Canvas fallbacks only)
4. Remove `SPRITES.bgLayer1`, `SPRITES.bgLayer2` branches in `buildBgCache()`
5. Remove `await preloadAssets()` from `init()`

**Affected lines**: L168–192 (ASSET_MAP/preloadAssets), L237–246 (bgCache SVGs), L1413–1417 (title wizard), L1783–1786 (enemy SVG), L1931 (wizard SVG), L1950–1955 (uiHeart), L1981–1988 (uiStar), L2162–2164 (powerup), L2804 (init)

#### C2. Enemy Debuffs Not Applied to Player — Gameplay Bug

**Location**: `executeEnemyAction()` function (L978–1068)

**Issue**: Banshee's 'debuff' (L1005), Guardian's 'crush' (L1026), and Archmage's 'ice' (L1037) actions call `applyStatus({ statuses: {} }, ...)` — applying statuses to a throwaway temporary object that is immediately discarded. Weak, vulnerable, and slow are never actually applied to the player.

**Impact**: Enemy debuffs show visual text but have zero actual effect on the player. The game is easier than intended.

**Fix**:
1. Add player status tracking: `let playerStatuses = {};`
2. In debuff actions, call `applyStatus(playerStatuses, ...)`
3. In `dealDamageToPlayer()`, apply 1.5× damage when vulnerable
4. In `startPlayerTurn()`, apply weak/slow modifiers and decrement turn counters
5. Display player debuff icons in HUD

### 🟡 Recommended Fixes (MINOR)

#### M1. Card Swipe Not Implemented

**Spec §3.3**: "Swipe left/right — hand card scroll (when 6+ cards)" specified. Currently touchmove only tracks coordinates with no scroll logic. Not critical since default hand is 5 cards, but draw effects can exceed 6.

#### M2. Deck View (D key) Not Implemented

**Spec §3.2**: "D — deck view toggle" specified. L2735 has `/* TODO: deck view toggle */` comment only.

#### M3. Keyboard Map Node Selection Not Implemented

**Spec §3.2**: "←→ — map path selection" specified. MAP state keyboard handler has no arrow key processing.

---

## 3. Mobile Controls Inspection

| # | Item | Result | Details |
|---|------|--------|---------|
| 1 | Touch event registration | ✅ PASS | `touchstart` (L2699), `touchmove` (L2709), `touchend` (L2719) all with `{ passive: false }` + `e.preventDefault()` |
| 2 | Virtual joystick/touch buttons | ✅ PASS (N/A) | Turn-based card game — joystick unnecessary. All interactions are tap-based, appropriate for genre |
| 3 | Touch target ≥44px | ✅ PASS | `touchSafe()` utility (L543) enforces minimum 48px. CONFIG.MIN_TOUCH = 48. Cards 90×130px, buttons ≥120×48px |
| 4 | Mobile viewport meta | ✅ PASS | `<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">` |
| 5 | Scroll prevention | ✅ PASS | CSS: `touch-action: none` (canvas), `overflow: hidden` (html, body). Touch event `preventDefault()` |
| 6 | Playable without keyboard | ✅ PASS | All screens have tap interactions: TITLE(start button), MAP(node tap), BATTLE(card tap + end turn), BOSS_INTRO(tap), REWARD(card/skip tap), SHOP(item/leave tap), REST(option tap), EVENT(option tap), GAMEOVER/RESULT(restart tap) |
| 7 | Input mode auto-detection | ✅ PASS | `setInputMode()` function. Auto-switches on mouse/touch/keyboard events (L2434) |

---

## 4. Asset Loading Inspection

| # | Item | Result | Details |
|---|------|--------|---------|
| 1 | `assets/manifest.json` exists | ⚠️ Exists (delete required) | Defines 8 SVG assets. F1 violation |
| 2 | SVG files exist | ⚠️ 8 files exist (delete required) | player, enemy, bg-layer1, bg-layer2, ui-heart, ui-star, powerup, effect-hit |
| 3 | SVG loading success | ✅ All loaded | SPRITES object has all 8 keys |
| 4 | Canvas fallbacks exist | ✅ All present | Every SPRITES branch has else block with Canvas code drawing |
| 5 | thumbnail.svg | ⚠️ Inside assets/ | Should be moved to game root |

---

## 5. Browser Test

| # | Item | Result | Notes |
|---|------|--------|-------|
| 1 | Page load | ✅ PASS | Loaded without errors |
| 2 | No console errors | ✅ PASS | console.error / console.warn: 0 |
| 3 | Canvas rendering | ✅ PASS | 400×700 with DPR. Background gradient + grid + torch glow normal |
| 4 | Title screen | ✅ PASS | Title "스펠 카드 던전", subtitle "로그라이크 덱빌딩 RPG", start button, achievements, high score |
| 5 | MAP state | ✅ PASS | 10-floor map nodes displayed. Battle/boss/shop/rest/event icons distinguished. HUD (HP/mana/gold/floor) normal |
| 6 | BATTLE state | ✅ PASS | Enemy (slime) Canvas drawn. 5-card hand. Mana cost/element icon/name/effect shown. End turn button |
| 7 | Card play | ✅ PASS | Fire Bolt used → Slime HP 20→12 (8 damage correct). Mana 3→2. Particle effects |
| 8 | GAMEOVER state | ✅ PASS | "게임 오버" + floor + score + stats + "다시 도전 [R]" button |
| 9 | Score persistence | ✅ PASS | bestScore=100 saved to localStorage confirmed |
| 10 | State transitions | ✅ PASS | TITLE→MAP→BATTLE→GAMEOVER transition overlay animation normal |

---

## 6. Spec–Code Numeric Verification

| Item | Spec | Code | Match |
|------|------|------|-------|
| Starting HP | 80 | CONFIG.STARTING_HP = 80 | ✅ |
| Starting mana | 3 | CONFIG.STARTING_MANA = 3 | ✅ |
| Draw per turn | 5 | CONFIG.DRAW_PER_TURN = 5 | ✅ |
| Starting deck | 10 cards (Strike×4, Guard×3, Mana Burst×2, Fire Bolt×1) | STARTING_DECK array matches | ✅ |
| Card C01 Strike | 6 dmg / upgrade 9 | damage:6, upgDmg:9 | ✅ |
| Card C18 Inferno | 50 dmg, exhaust | damage:50, exhaust:true | ✅ |
| Slime HP/ATK | 20/5 | hp:20, atk:5 | ✅ |
| Guardian Golem HP/ATK | 80/10 | hp:80, atk:10 | ✅ |
| Archmage HP/ATK | 150/12 | hp:150, atk:12 | ✅ |
| Element mult (fire→skeleton) | 1.5× | ELEM_MULT.fire.skeleton = 1.5 | ✅ |
| Min touch size | 48px | CONFIG.MIN_TOUCH = 48 | ✅ |

---

## 7. Fix Summary

### 🔴 Required (Pre-deployment)

| # | Description | Impact |
|---|-------------|--------|
| **C1** | Delete `assets/` directory + remove asset loading code + remove SPRITES branches | High — F1 violation |
| **C2** | Implement player debuff system (actually apply weak/vulnerable/slow) | Medium — gameplay bug |

### 🟡 Recommended (Deployable but improvement advised)

| # | Description | Impact |
|---|-------------|--------|
| **M1** | Implement card swipe scroll (6+ cards) | Low |
| **M2** | Implement deck view (D key) | Low |
| **M3** | Implement keyboard map node selection | Low |

---

## 8. Overall Assessment

**Code Quality: 9/10** — Accurately reflects most of the 18-cycle lessons (F1–F30). Well-structured section separation, guard flags, single update paths, beginTransition pattern, offscreen caching — exemplary. Only the assets/ directory issue and debuff non-application need fixing for immediate APPROVED status.

**Gameplay: 9/10** — A Slay the Spire-style roguelike deckbuilder fully implemented in 2,815 lines of single HTML. 20 cards, 7 enemies, 3 bosses, 8 relics, elemental affinities, intent system, shop/rest/events — high completion level.

**Mobile Support: 10/10** — Perfectly suited tap-based UI for a turn-based card game. touchSafe 48px, touch-action:none, viewport configuration, input mode auto-detection all thorough.
