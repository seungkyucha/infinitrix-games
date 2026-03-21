---
game-id: rune-survivor
title: Rune Survivor
genre: action
difficulty: medium
---

# Rune Survivor — Detailed Game Design Document

_Cycle #18 | Date: 2026-03-22_

---

## §0. Previous Cycle Feedback Mapping

> Proactive countermeasures for Cycle 17 postmortem issues + platform-wisdom accumulated lessons (F1~F24, 17 cycles).

| # | Source | Problem | Solution in This Spec | Section |
|---|--------|---------|----------------------|---------|
| F1 | Cycle 1~17 (17 consecutive) | assets/ directory recurring | **Start from blank index.html.** assets/ directory absolutely forbidden. 100% Canvas code drawing. Only thumbnail.svg allowed | §8, §16.5 |
| F2 | Cycle 1~17 | setTimeout-based state transitions | tween onComplete callbacks only. setTimeout **0 instances** target. Web Audio uses `oscillator.start(ctx.currentTime + delay)` native scheduling | §5, §13, §16.5 |
| F3 | Cycle 6~17 | Pure function pattern required | All game logic functions parameter-based. Zero direct global references. Full function signatures in §18 | §18 |
| F4 | Cycle 2 | Missing state×system matrix | State×system matrix in §6 (7 states × 13 systems) | §6.3 |
| F5 | Cycle 3/4 | Missing guard flags → repeated callbacks | `waveClearing`, `isTransitioning`, `isLevelingUp`, `isDying` quad-guard system | §5.4 |
| F6 | Cycle 4 | TweenManager cancelAll+add race condition | `clearImmediate()` immediate cleanup API separation. Post-cancelAll flush: `_pendingCancel=false` + `_tweens.length=0` | §18 |
| F7 | Cycle 7/16 | Spec values ↔ code values mismatch | §16.4 numerical consistency verification table. Per-wave enemy count/HP/rewards full cross-check | §16.4 |
| F8 | Cycle 1 | confirm/alert unusable in iframe | Canvas-based modal UI only. Zero window.open/alert/confirm/prompt | §4 |
| F9 | Cycle 3~4 | SVG filter recurrence (feGaussianBlur) | No inline SVG. Canvas glow via shadowBlur only. Filters allowed only in thumbnail.svg | §4.2 |
| F10 | Cycle 15~17 | Offscreen canvas background caching | `buildBgCache()` pattern — rebuild only on resizeCanvas(). 3-layer background caching | §4.3 |
| F11 | Cycle 11/14 | let/const TDZ crash + pre-DOM access | Variable declaration → DOM assignment → event listener registration → init() strict order. §16.1 initialization order checklist | §16.1 |
| F12 | Cycle 10/11 | gameLoop try-catch not applied | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` default wrapping | §5.1 |
| F13 | Cycle 13/17 | index.html missing (3 occurrences) | **MVP-first strategy**: TITLE→PLAYING→GAMEOVER 3-state first. Pre-review 3-stage smoke test | §1.3, §16.6 |
| F14 | Cycle 10 | Fix regression (render signature change) | Full-flow regression test after any fix (TITLE→PLAYING→LEVEL_UP→BOSS→GAMEOVER→RESULT) | §16.7 |
| F15 | Cycle 3/7/17 | Ghost variables (declared but unused) | §16.2 variable usage verification table | §16.2 |
| F16 | Cycle 5 | Dual update paths for single value | HP/XP/score via single functions only (`modifyHP()`, `addXP()`, `addScore()`) | §18 |
| F17 | Cycle 3 | State transition priority system | GAMEOVER > BOSS_INTRO > LEVEL_UP > PAUSED > PLAYING. STATE_PRIORITY map | §6.2 |
| F18 | Cycle 15~17 | Scope reduction strategy (Cycle 17: overscoped → 0% implementation) | **Single genre axis (action)** + system combination (roguelike upgrades). 10 waves + 2 bosses = realistic scope | §1 |
| F19 | Cycle 12/15 | "Half-implementation" pattern | Feature-level implementation checklist (§16.3) — individual A+B+C completion verification | §16.3 |
| F20 | Cycle 13~16 | CONFIG.MIN_TOUCH declaration-implementation gap | `touchSafe()` utility enforcing 48px minimum on all buttons/UI | §12.3 |
| F21 | Cycle 16 | Incomplete input method support | Keyboard/mouse/touch all **fully supported**. Input mapping table in §3 | §3 |
| F22 | Cycle 17 | Specified UI features unimplemented | All spec-documented UI **100% implemented**. No "optional" features. If not in MVP, don't spec it | §1.3 |
| F23 | Cycle 5/8 | Direct transitions bypassing beginTransition() | All screen transitions via `beginTransition()`. Only PAUSED exempt (immediate transition) | §6.2 |
| F24 | Cycle 12~16 | Touch target below 44×44px | All interactive UI minimum 48×48px. CONFIG.MIN_TOUCH_TARGET = 48 | §12.3 |
| F25 | Cycle 17 (critical) | Overscoped spec → 0% implementation | **MVP-first**: 3 states (TITLE/PLAYING/GAMEOVER) + 1 enemy type + 1 weapon first. Gradual feature expansion | §1.3 |
| F26 | Cycle 17 | scorePopups life decrement in render | All state changes in update() only. render() is pure output function | §5.2, §5.3 |
| F27 | Cycle 17 | Undefined object interactions | §2.5 weapon × enemy type interaction matrix included | §2.5 |

---

## §1. Game Overview & Core Fun

### 1.1 Concept
The player controls an ancient rune mage, surviving against hordes of monsters swarming from all directions. **Only movement is directly controlled** — weapons (runes) **fire automatically**. Slain enemies drop XP gems; collecting gems to level up triggers a **3-pick-1 roguelike upgrade** selection. Clear all 10 waves to win.

**Vampire Survivors-style** auto-combat survivor-like — the biggest hit genre of 2024~2026.

### 1.2 Core Fun Elements
1. **Survival tension**: 360° enemies closing in. Movement decisions determine life and death
2. **Roguelike growth satisfaction**: 3-pick-1 upgrade per level. Different build every run → infinite replayability
3. **Weapon synergy**: Up to 5 weapons equipped simultaneously. Fire Aura + Ice Lance = area fire damage on slowed enemies
4. **Boss spectacle**: Massive bosses at waves 5 and 10 — special patterns + screen shake + slow motion
5. **Progressive overwhelm**: Wave 1 (5 slimes) → Wave 10 (Lich boss + elite mix)
6. **5~8 minutes per run**: Instant retry. "Just one more run" addiction

### 1.3 Scope Management Strategy (F25 Response)
> ⚠️ Cycle 17 had 0% implementation due to overscoping. This time, **MVP-first strategy** is strictly enforced.

**MVP Implementation Order** (must implement in this exact order):
1. **Phase 1 (Core — playable with this alone)**: TITLE → PLAYING → GAMEOVER 3 states + player movement + 1 enemy (slime) + 1 weapon (Rune Bolt) + gem collection
2. **Phase 2**: Level-up system + LEVEL_UP state + 3-pick-1 upgrade UI
3. **Phase 3**: 5 enemy types + 5 weapons + 10 waves
4. **Phase 4**: 2 bosses + BOSS_INTRO state
5. **Phase 5**: Achievement system + RESULT state + enriched particles/effects
6. **Phase 6**: BGM + SFX + screen shake/slow motion

Phase 1~2 completion = **playable game**. Phase 3+ is gradual expansion.

### 1.4 Genre Balance Contribution
- Direct action genre reinforcement (current 5 → 6 games, platform's least represented genre)
- Differentiation from mini-survivor-arena: roguelike upgrades + boss fights + multi-weapon synergy + Cycle 18-level visuals

---

## §2. Game Rules & Objectives

### 2.1 Victory Condition
- Clear all 10 waves (defeat Wave 10 boss)

### 2.2 Defeat Condition
- Player HP drops to 0 or below

### 2.3 Core Loop
```
Move (WASD/joystick) → Auto-attack (per-weapon cooldown) → Kill enemy → Gem drop
→ Collect gem → XP increase → Level up → 3-pick-1 upgrade selection
→ Wave clear → Next wave → (Waves 5/10: Boss fight)
```

### 2.4 Base Stats
| Stat | Initial | Max | Description |
|------|---------|-----|-------------|
| HP | 100 | 200 | Decreased on hit, restored by healing gems |
| Move Speed | 3.0 px/frame | 6.0 | Increased via upgrades |
| Magnet Range | 60 px | 200 | Gem attraction radius |
| Luck | 0% | 50% | Increases rare upgrade appearance chance |
| Cooldown Reduction | 0% | 40% | Reduces weapon fire interval |
| Damage Multiplier | 1.0 | 2.5 | Multiplicative to all weapon damage |

### 2.5 Weapon × Enemy Type Interaction Matrix (F27 Response)

| Weapon \ Enemy | Slime | Bat | Golem | Mage | Skeleton | Boss |
|----------------|-------|-----|-------|------|----------|------|
| Rune Bolt | 1.0× | 1.0× | 0.5× | 1.0× | 1.0× | 1.0× |
| Fire Aura | 1.5× | 1.0× | 0.5× | 1.0× | 1.5× | 0.8× |
| Ice Lance | 1.0× | 1.5× | 1.0× | 1.0× | 1.0× | 0.8× |
| Lightning Chain | 1.0× | 1.0× | 1.5× | 0.5× | 1.0× | 0.8× |
| Protection Shield | — | — | — | — | — | — |

> Protection Shield is a defensive weapon (knockback + damage reduction on contact), not offensive.

---

## §3. Controls

### 3.1 Input Mapping Table (F21 Response)

| Action | Keyboard | Mouse | Touch |
|--------|----------|-------|-------|
| Move | WASD / Arrow Keys | — | Virtual joystick (bottom-left) |
| Auto-attack | Automatic | Automatic | Automatic |
| Select upgrade | 1/2/3 keys | Click card | Tap card |
| Pause | ESC / P | Pause button click | Pause button tap |
| Restart (game over) | R key | Button click | Button tap |
| Return to title | ESC (while paused) | Button click | Button tap |

### 3.2 Virtual Joystick Specs
- Position: Bottom-left (canvas height 75%, canvas width 20%)
- Size: Outer circle radius 60px, inner circle radius 24px
- Opacity: idle alpha 0.3, touching alpha 0.7
- Dead zone: 10px (no movement within this radius)
- Joystick visible only in touch mode (hidden for mouse/keyboard)

### 3.3 Automatic Input Mode Detection
```
Keyboard input → inputMode = 'keyboard' → hide joystick
Mouse movement → inputMode = 'mouse'    → hide joystick
Touch start    → inputMode = 'touch'    → show joystick
```

---

## §4. Visual Style Guide

### 4.1 Color Palette

| Purpose | HEX | Description |
|---------|-----|-------------|
| Background (dark floor) | `#1a1a2e` | Deep navy |
| Background grid | `#16213e` | Slightly lighter navy |
| Player | `#00d4ff` | Cyan (rune glow) |
| Player robe | `#4a00e0` | Purple |
| Slime | `#39ff14` | Neon green |
| Bat | `#8b00ff` | Purple |
| Golem | `#ff6600` | Orange |
| Enemy Mage | `#ff0066` | Pink red |
| Skeleton Warrior | `#cccccc` | Silver gray |
| Boss (Wave 5) | `#ff3300` | Red |
| Boss (Wave 10) | `#9900ff` | Dark purple |
| XP Gem | `#00ff88` | Mint green |
| HP Recovery Gem | `#ff4444` | Red |
| Rune Bolt | `#00d4ff` | Cyan |
| Fire Aura | `#ff4400` | Orange red |
| Ice Lance | `#66ccff` | Light blue |
| Lightning Chain | `#ffff00` | Yellow |
| Protection Shield | `#00ffaa` | Turquoise |
| UI Text | `#ffffff` | White |
| UI Background | `rgba(0,0,0,0.7)` | Semi-transparent black |
| Upgrade card bg | `#2a2a4a` | Dark purple gray |
| Upgrade card border | `#00d4ff` | Cyan |

### 4.2 Canvas Code Drawing Spec (F1, F9 Response)
> ⚠️ assets/ directory absolutely forbidden. All visuals via Canvas 2D API direct drawing. No inline SVG. Glow effects via shadowBlur only.

#### Player (Rune Mage)
- Body: Triangular robe (purple `#4a00e0`, base width 24px, height 32px)
- Head: Circle (cyan `#00d4ff`, radius 8px, top)
- Rune glow: shadowBlur 15, shadowColor `#00d4ff`
- Idle: Robe subtle sway (sin(time) × 2px)
- Hit state: 0.1s red flash (globalCompositeOperation: 'source-atop')
- Moving: Slight tilt toward movement direction (±5°)

#### 5 Enemy Types
1. **Slime**: Semicircle + wavy bottom (neon green `#39ff14`), bouncing animation (sin(time) y-offset ±3px)
2. **Bat**: V-shaped wings + small circle body (purple `#8b00ff`), wing flapping (sin(time×4) wing angle ±30°)
3. **Golem**: Large rectangle body + small rectangle arms (orange `#ff6600`), slow movement + body wobble
4. **Enemy Mage**: Triangle hat + circle body (pink red `#ff0066`), hand-raising animation on projectile fire
5. **Skeleton Warrior**: Circle head (hollow) + rectangle body + line sword (silver `#cccccc`), sword swing animation on charge

#### Bosses
1. **Wave 5 — Crimson Warden (Giant Golem)**: 3× normal golem size (64px), orange→red gradient (createLinearGradient), HP bar displayed above, ground shockwave ripple effect
2. **Wave 10 — Elder Lich**: 2.5× mage size (56px), dark purple `#9900ff` + purple aura (shadowBlur 25), aura color shifts per phase, 3-frame afterimage on teleport

### 4.3 Background (Offscreen Canvas Caching — F10)
- **Layer 1 (far)**: `#1a1a2e` solid + 40 small star particles (white, alpha 0.3~0.7, sin(time + offset) twinkle)
- **Layer 2 (mid)**: Grid pattern (16px spacing, `#16213e`, line width 1px). Parallax scroll on player movement (0.3× speed)
- **Layer 3 (near)**: Game objects (player, enemies, projectiles, gems) — real-time rendering
- **Layer 4 (foreground)**: UI (HP bar, XP bar, wave display, minimap, particle effects)

`buildBgCache()`: Pre-render layers 1+2 to offscreen canvas. Rebuild only on `resizeCanvas()`.

### 4.4 Particle System (ObjectPool-based)
1. **Enemy death particles**: 8~12 circle fragments in enemy color, 0.5s radial spread + alpha fade
2. **Gem collection particles**: 4 small mint green circles, converging toward player
3. **Level-up particles**: Expanding cyan ring + 8 white stars rotating upward, 1s
4. **Hit particles**: 4 red circle fragments, spreading away from hit direction
5. **Boss entrance particles**: 20 energy lines converging from screen edges to center, 1.5s
6. **Weapon trail particles**: Afterimage in each weapon's color (3~5 frame trail, decreasing alpha)

### 4.5 Effects
- **Screen shake**: Boss entrance (8px, 0.5s), boss attack (5px, 0.2s), player hit (3px, 0.15s)
- **Slow motion**: On boss defeat, 0.3s at timeScale = 0.3 → tween back to 1.0
- **Glow effects**: Player (shadowBlur 15), weapon projectiles (shadowBlur 8~12), XP gems (shadowBlur 6)
- **UI animations**: Score count-up (tween), level-up text bounce (easeOutBack), upgrade card slide-in (easeOutBack, 0.3s), wave announcement scale up→down (0.5s)

---

## §5. Core Game Loop (Frame-by-Frame Logic Flow)

### 5.1 Main Loop Structure (F12)
```javascript
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // max 50ms cap
    lastTime = timestamp;
    const scaledDt = dt * timeScale; // slow motion support

    update(scaledDt, gameState);
    render(ctx, gameState);
  } catch (e) {
    console.error('GameLoop error:', e);
  }
  requestAnimationFrame(gameLoop); // outside try-catch
}
```

### 5.2 update(dt, state) Flow (F26: All state changes in update only)
```
1. tweenManager.update(dt)                         — runs in ALL states
2. updateScreenShake(shake, dt)                     — runs in ALL states
3. updateScorePopups(popups, dt)                    — runs in ALL states

4. if (state === PLAYING || state === BOSS):
   a. updatePlayerMovement(player, input, dt, config)
   b. updateWeapons(weapons, enemies, player, dt, dmgTable, pools)
   c. updateProjectiles(projectiles, dt)
   d. updateEnemies(enemies, player, dt)
   e. checkProjectileHits(projectiles, enemies, dmgTable, pools)
   f. checkEnemyPlayerHits(enemies, player, dt, shield)
   g. updateGems(gems, player, dt, magnetRange)
   h. updateParticles(particles, dt)
   i. updateWaveTimer(wave, dt)
   j. checkLevelUp(player, xpTable)    — guard: isLevelingUp
   k. checkWaveComplete(wave, enemies)  — guard: waveClearing
   l. checkGameOver(player)             — guard: isDying

5. if (state === LEVEL_UP):
   a. (tween animations only — awaiting input)

6. if (state === BOSS_INTRO):
   a. updateBossIntro(boss, dt)
```

### 5.3 render(ctx, state) Flow (Pure Output — Zero State Changes — F26)
```
1. ctx.save()
2. applyScreenShake(ctx, shake)
3. drawBackground(ctx, bgCache, cameraOffset)
4. drawGems(ctx, gems, time)
5. drawEnemies(ctx, enemies, time)
6. drawProjectiles(ctx, projectiles, time)
7. drawPlayer(ctx, player, time)
8. drawParticles(ctx, particles)
9. drawScorePopups(ctx, popups)
10. ctx.restore()

11. drawUI(ctx, state, player, wave, score)
12. if (state === TITLE): drawTitleScreen(ctx, time)
13. if (state === LEVEL_UP): drawUpgradeCards(ctx, cards, selectedIndex)
14. if (state === BOSS_INTRO): drawBossIntro(ctx, boss)
15. if (state === PAUSED): drawPauseOverlay(ctx)
16. if (state === GAMEOVER): drawGameOverScreen(ctx, result)
17. if (state === RESULT): drawResultScreen(ctx, result, achievements)
18. if (inputMode === 'touch'): drawJoystick(ctx, joystick)
```

### 5.4 Guard Flags (F5)
| Flag | Purpose | Set When | Clear When |
|------|---------|----------|------------|
| `waveClearing` | Prevent duplicate wave-complete → next-wave transition | true in checkWaveComplete() | false on enterState(PLAYING) |
| `isTransitioning` | Ignore input during screen transitions | true on beginTransition() | false in transition tween onComplete |
| `isLevelingUp` | Prevent duplicate level-up processing | true in checkLevelUp() | false after upgrade selection |
| `isDying` | Ignore additional hits during death animation | true when HP ≤ 0 | after entering GAMEOVER state |

---

## §6. State Machine & State × System Matrix

### 6.1 State Transition Diagram
```
TITLE ──(start)──→ PLAYING ──(level up)──→ LEVEL_UP ──(select)──→ PLAYING
                     │                                              │
                     ├──(wave 5/10)──→ BOSS_INTRO ──(done)──→ PLAYING (boss fight)
                     │
                     ├──(ESC)──→ PAUSED ──(ESC)──→ PLAYING
                     │
                     └──(HP≤0)──→ GAMEOVER ──(result)──→ RESULT ──(restart)──→ TITLE
```

### 6.2 State Transition Priority (F17, F23)
```javascript
const STATE_PRIORITY = {
  GAMEOVER: 100,    // highest — HP≤0 overrides all transitions
  BOSS_INTRO: 80,
  LEVEL_UP: 60,
  PAUSED: 40,
  RESULT: 30,
  PLAYING: 20,
  TITLE: 10         // lowest
};
```
- All transitions must go through `beginTransition(targetState, options)` (F23)
- Only PAUSED uses `beginTransition(PAUSED, { immediate: true })` for instant transition
- Pre-check at transition function entry: `if (player.hp <= 0 && target !== GAMEOVER) return;` (Cycle 3 lesson)

### 6.3 State × System Update Matrix (F4)

| System \ State | TITLE | PLAYING | LEVEL_UP | BOSS_INTRO | PAUSED | GAMEOVER | RESULT |
|----------------|-------|---------|----------|------------|--------|----------|--------|
| TweenManager | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Player Movement | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Enemy AI/Movement | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Weapon System | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Projectile Physics | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Collision Detection | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gem System | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Particles | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Screen Shake | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Score Popups | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Input Handling | Start only | Full | 1/2/3+click | ❌ | ESC only | R/button | R/button |
| Audio BGM | Title track | Battle track | Battle (vol↓) | Boss track | Muted | ❌ | Result track |
| Rendering | Title | Full | Full+cards | Full+cutscene | Full+overlay | Full+overlay | Result screen |

---

## §7. Enemy System

### 7.1 Enemy Type Details

| Enemy | HP | Speed | Damage | XP | Special Ability | Hitbox (px) |
|-------|-----|-------|--------|-----|----------------|-------------|
| Slime | 15 | 1.2 | 8 | 5 | None (basic enemy) | Radius 10 |
| Bat | 10 | 3.0 | 5 | 8 | Fast movement + zigzag (sin(time×3) × 30px) | Radius 8 |
| Golem | 60 | 0.6 | 20 | 15 | High HP, 50% knockback resistance | Radius 16 |
| Enemy Mage | 25 | 1.0 | 12 | 20 | Ranged projectile (3s interval, bullet speed 4.0) | Radius 11 |
| Skeleton Warrior | 35 | 1.5 | 15 | 12 | Charge within 150px (speed ×3, 1.5s, 4s cooldown) | Radius 12 |

### 7.2 Elite Enemies (Waves 9~10)
- 1.5× HP, 1.2× damage, 2× XP of normal variants
- Visual distinction: Gold outline around body (strokeStyle `#ffd700`, lineWidth 2)

### 7.3 Boss Details

#### Wave 5 Boss: Crimson Warden (Giant Golem)
| Attribute | Value |
|-----------|-------|
| HP | 500 |
| Hitbox | Radius 32 |
| Speed | 0.8 |
| Contact Damage | 30 |
| XP | 100 |
| Phase 1 (HP 100~50%) | Slow pursuit + ground shockwave every 5s (8-directional circular bullets, speed 2.5, 15 damage each) |
| Phase 2 (HP 50~0%) | Speed ×1.5 + shockwave every 3s + spawn 2 slimes every 10s |

#### Wave 10 Boss: Elder Lich
| Attribute | Value |
|-----------|-------|
| HP | 1000 |
| Hitbox | Radius 28 |
| Speed | 1.2 |
| Contact Damage | 25 |
| XP | 200 |
| Phase 1 (HP 100~66%) | Teleport every 3s + spiral barrage every 2s (12 bullets, 10 damage each) |
| Phase 2 (HP 66~33%) | Teleport every 2s + spawn 2 skeleton warriors every 8s |
| Phase 3 (HP 33~0%) | Continuous spiral barrage (every 1s) + play area shrinks to 80% (darkened edges) |

---

## §8. Weapon System

### 8.1 Weapon Details

| Weapon | Type | Base Damage | Cooldown | Range | Description |
|--------|------|------------|----------|-------|-------------|
| Rune Bolt | Projectile | 10 | 0.8s | 400px line | Fires toward nearest enemy. No pierce. Bullet speed 6.0 |
| Fire Aura | Area | 5/tick | 1.5s (tick 0.3s) | 80px radius | Circular area around player. 0.3s damage ticks |
| Ice Lance | Projectile | 18 | 1.2s | 350px line | 1.5s slow (50%) on hit. Pierce 1. Bullet speed 5.0 |
| Lightning Chain | Chain | 8 | 2.0s | 120px chain | Nearest enemy → chains to 3 nearby. Damage ×0.8 per chain |
| Protection Shield | Defense | 3 | Always | 40px radius | 3 orbiting spheres (2s period). Knockback 50px + damage on contact. -15% damage taken |

### 8.2 Weapon Upgrades (Per Level)

Each weapon has max level 5. Level +1 via upgrade selection:

| Weapon | Lv2 | Lv3 | Lv4 | Lv5 |
|--------|-----|-----|-----|-----|
| Rune Bolt | Damage 15 | 2 projectiles | Cooldown 0.64s | Pierce 1 |
| Fire Aura | Range 100px | Damage 8/tick | Range 120px | Damage 13/tick |
| Ice Lance | Slow 70% | Pierce +1 (total 2) | Cooldown 0.9s | 2× damage to slowed |
| Lightning Chain | Chain 5 targets | Damage 12 | Cooldown 1.4s | Chain decay 0% (equal damage) |
| Protection Shield | 4 orbs | Knockback 80px | Damage reduction 25% | 6 orbs, 2× rotation speed |

---

## §9. Upgrade System (Roguelike)

### 9.1 3-Pick-1 on Level Up
On level up, game pauses (LEVEL_UP state) → 3 upgrade cards displayed → player picks 1.

**Card Pool:**
| Category | Name | Effect | Max | Rarity |
|----------|------|--------|-----|--------|
| Weapon Acquire | Fire Aura | Add Fire Aura weapon | 1 | Rare |
| Weapon Acquire | Ice Lance | Add Ice Lance weapon | 1 | Rare |
| Weapon Acquire | Lightning Chain | Add Lightning Chain weapon | 1 | Rare |
| Weapon Acquire | Protection Shield | Add Protection Shield weapon | 1 | Legendary |
| Weapon Upgrade | [Owned Weapon] Upgrade | Owned weapon level +1 | Lv5 | Common |
| Stat | HP Recovery | HP +30 heal | ∞ | Common |
| Stat | Max HP Increase | Max HP +20 | 5 | Common |
| Stat | Move Speed Increase | Speed +0.5 | 6 | Common |
| Stat | Magnet Range Increase | Magnet +30px | 5 | Common |
| Stat | Cooldown Reduction | Cooldown -8% | 5 | Rare |
| Stat | Damage Multiplier | Damage ×1.15 | 5 | Rare |
| Special | Lucky Spell | Luck +10% | 5 | Rare |
| Special | XP Boost | XP gain +20% | 3 | Legendary |

### 9.2 Card Draw Rules
1. Draw 3 random cards from pool (no duplicates)
2. Remove "acquire" cards for already-owned weapons
3. Remove "upgrade" cards for max-level weapons (Lv5)
4. Remove stat cards at max stacks
5. **Luck** increases rare/legendary appearance chance:
   - Base: Common 70%, Rare 25%, Legendary 5%
   - Max luck (50%): Common 45%, Rare 40%, Legendary 15%
6. If fewer than 3 valid cards, fill remaining with "HP Recovery"

### 9.3 Upgrade Card UI
- 3 cards horizontal layout (card size: 160px wide, 220px tall)
- Card spacing: 20px
- Background: `#2a2a4a`, border: rarity-colored (Common `#888888`, Rare `#00d4ff`, Legendary `#ffd700`)
- Top: Icon (Canvas-drawn weapon/stat icon, 48×48px area)
- Center: Name (16px bold, white)
- Bottom: Effect description (12px, `#aaaaaa`)
- Card slide-in animation: y: -300 → center, 0.3s, easeOutBack
- On selection: Selected card scale 1.1 + glow → others alpha 0 → 0.5s then return to PLAYING
- Keyboard: 1/2/3 keys, Mouse: click, Touch: tap (F21: all inputs supported)
- Card minimum touch area: 160×220px (F24: exceeds 48px, OK)

---

## §10. Difficulty System

### 10.1 Wave Spawn Table

| Wave | Duration(s) | Spawn Interval(s) | Enemy Composition | Max Simultaneous | Notes |
|------|------------|-------------------|-------------------|------------------|-------|
| 1 | 30 | 2.0 | Slime 100% | 15 | Tutorial |
| 2 | 35 | 1.8 | Slime 80%, Bat 20% | 20 | |
| 3 | 40 | 1.5 | Slime 50%, Bat 30%, Skeleton 20% | 25 | |
| 4 | 45 | 1.3 | Slime 30%, Bat 20%, Golem 20%, Skeleton 30% | 30 | |
| 5 | 60 | 1.0 | **Boss: Crimson Warden** + Slime 50%, Bat 50% | 35 | Boss wave |
| 6 | 45 | 1.2 | Bat 30%, Golem 30%, Mage 20%, Skeleton 20% | 35 | Mage debut |
| 7 | 50 | 1.0 | All types equal (20% × 5) | 40 | |
| 8 | 50 | 0.8 | Golem 30%, Mage 30%, Skeleton 40% | 45 | Strong enemies↑ |
| 9 | 55 | 0.7 | All types + 20% Elite | 50 | Elite mix |
| 10 | 90 | 0.8 | **Boss: Elder Lich** + All types mixed | 50 | Final boss |

### 10.2 Enemy Spawn Location
- Spawn at 500~600px radius from player position, random 360° direction
- Minimum 50px outside screen guaranteed
- If max simultaneous enemies exceeded, spawn timer pauses (don't pool-release, just wait)

### 10.3 Level-Up XP Table
| Level | Required XP | Cumulative XP |
|-------|-------------|---------------|
| 1→2 | 20 | 20 |
| 2→3 | 35 | 55 |
| 3→4 | 55 | 110 |
| 4→5 | 80 | 190 |
| 5→6 | 110 | 300 |
| 6→7 | 150 | 450 |
| 7→8 | 200 | 650 |
| 8→9 | 260 | 910 |
| 9→10 | 330 | 1240 |
| 10+ | 330 + (level-10)×50 | — |

---

## §11. Score System

### 11.1 Score Composition
| Action | Points |
|--------|--------|
| Slime kill | 10 |
| Bat kill | 15 |
| Skeleton kill | 20 |
| Golem kill | 30 |
| Enemy Mage kill | 35 |
| Elite kill | Base score ×2 |
| Crimson Warden kill | 500 |
| Elder Lich kill | 1000 |
| Wave clear bonus | Wave number × 50 |
| No-damage wave bonus | +200 |
| Survival bonus (on clear) | Remaining HP × 10 |

### 11.2 Score Display
- Always shown top-right (24px bold, white, shadowBlur 4)
- Kill score popup at enemy position (0.8s: y -30px movement + alpha 1→0 tween)
- Game over/result screen: Final score + high score comparison
- High score saved to localStorage (try-catch wrapped — F8)
  - **Save order (Cycle 2 lesson)**: `isNewBest = score > getBest()` check first → `saveBest(score)` save second

---

## §12. Achievement System

### 12.1 Achievement List (8 total)

| ID | Name | Condition | Canvas Icon |
|----|------|-----------|-------------|
| ACH_FIRST_CLEAR | First Clear | Clear all 10 waves | Trophy (gold cup) |
| ACH_NO_DAMAGE | Invincible Wave | Clear a wave with 0 hits taken | Shield (cyan circle+cross) |
| ACH_100_KILLS | Slayer | 100 kills in one run | Skull (circle+empty eyes) |
| ACH_ALL_WEAPONS | Rune Master | Acquire all 5 weapons | Crossed swords |
| ACH_BOSS_FAST | Swift Execution | Defeat a boss in under 30 seconds | Lightning bolt (zigzag line) |
| ACH_LEVEL_10 | Transcendent | Reach level 10 | Star (pentagram) |
| ACH_5000_SCORE | Score King | Achieve 5000+ points | Crown (triangle+circle decorations) |
| ACH_SURVIVE_5MIN | Tenacious Survivor | Survive 5+ minutes | Clock (circle+hands) |

### 12.2 Achievement Notification UI
- On unlock: slide in from top (y: -60 → 10, 0.3s, easeOutBack)
- Size: 300×50px
- Background: `rgba(0,0,0,0.85)`, border: `#ffd700` (lineWidth 2)
- Left: Icon (32×32), Right: Achievement name + "Unlocked!" (14px bold)
- Slide out after 3s (y → -60, tween)
- Achievement data permanently saved to localStorage (try-catch wrapped)

### 12.3 UI Touch Targets (F20, F24)
All interactive UI elements minimum touch area: **48×48px**
```javascript
const CONFIG = { MIN_TOUCH_TARGET: 48 };
function touchSafe(w, h) {
  return { w: Math.max(CONFIG.MIN_TOUCH_TARGET, w), h: Math.max(CONFIG.MIN_TOUCH_TARGET, h) };
}
```
Applied to: Pause button (48×48), upgrade cards (160×220), restart button (200×48), title start button (240×56), virtual joystick (radius 60)

---

## §13. Audio System

### 13.1 Web Audio API Procedural Sound

> Zero setTimeout. All scheduling via `oscillator.start(ctx.currentTime + delay)` (F2).
> SoundManager initialization on first user interaction (click/tap) for browser autoplay policy compliance.

#### BGM (3 tracks)
1. **Title BGM**: C major arpeggio (C4-E4-G4-C5 loop), 80 BPM, triangle + sine wave, gain 0.15
2. **Battle BGM**: Am progression (A3-C4-E4-A4), 140 BPM, square bass + triangle melody, gain 0.12
3. **Boss BGM**: Dm progression (D3-F3-A3-D4), 160 BPM, sawtooth bass + square lead, gain 0.15

#### Sound Effects (7 types)
| Name | Waveform | Frequency | Duration | Trigger |
|------|----------|-----------|----------|---------|
| Rune Bolt fire | Sine | 800→400Hz slide | 0.1s | fireRuneBolt() |
| Fire tick | Noise (buffer) + Sine 200Hz | — | 0.15s | updateFireAura() tick |
| Ice Lance fire | Triangle | 1200→1800Hz | 0.12s | fireIceLance() |
| Lightning active | Square + Noise | 100→2000Hz rapid rise | 0.08s | fireLightningChain() |
| Player hit | Noise (buffer) | Bandpass 150Hz | 0.2s | checkEnemyPlayerHits() on hit |
| Level up | Triangle | C5→E5→G5 sequential (0.1s each) | 0.4s | checkLevelUp() |
| Gem collect | Sine | 1000→1500Hz | 0.05s | updateGems() on collect |

---

## §14. Game Page Sidebar Metadata

```yaml
game:
  title: "Rune Survivor"
  description: "Become an ancient rune mage and survive against monster hordes! Collect auto-attack weapons and experience roguelike upgrades for a different build every run."
  genre: ["action"]
  playCount: 0
  rating: 0
  controls:
    - "WASD / Arrow Keys: Move"
    - "1/2/3: Select upgrade"
    - "ESC: Pause"
    - "Touch: Virtual joystick movement"
  tags:
    - "#survivor-like"
    - "#roguelike"
    - "#auto-combat"
    - "#boss-fight"
    - "#upgrades"
    - "#action"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

---

## §15. Home Page GameCard Data

```yaml
thumbnail: "games/rune-survivor/thumbnail.svg"  # 4:3 ratio, game highlight scene
title: "Rune Survivor"
description: "Survive monster hordes with roguelike upgrades in this auto-combat survivor-like action game"
genre: ["action"]
playCount: 0
addedAt: "2026-03-22"
featured: true
```

---

## §16. Implementation Verification Checklists

### 16.1 Initialization Order Checklist (F11)
```
1. ✅ Global constants/config declaration (CONFIG, COLORS, WAVE_TABLE, XP_TABLE, ENEMY_TYPES, WEAPON_TYPES, ...)
2. ✅ Global variable declaration (let canvas, ctx, gameState, player, enemies, ...)
3. ✅ Utility class definitions (TweenManager, ObjectPool, SoundManager)
4. ✅ Game logic function definitions (update*, draw*, check*, fire*, ...)
5. ✅ DOM assignment (canvas = document.getElementById('gameCanvas'))
6. ✅ Canvas setup (resizeCanvas(), DPR application, buildBgCache())
7. ✅ Event listener registration (keydown, keyup, mousedown, mousemove, touchstart, touchmove, touchend, resize)
8. ✅ init() call (gameState = TITLE, initial object creation)
9. ✅ requestAnimationFrame(gameLoop) start
```

### 16.2 Variable Usage Verification Table (F15)

| Variable | Declaration | Updated In | Referenced In | Purpose |
|----------|------------|-----------|--------------|---------|
| waveClearing | Global let | checkWaveComplete() | update(), checkWaveComplete() | Guard flag |
| isTransitioning | Global let | beginTransition() | handleInput() | Block input during transition |
| isLevelingUp | Global let | checkLevelUp() | checkLevelUp(), selectUpgrade() | Prevent duplicate level-up |
| isDying | Global let | checkGameOver() | checkEnemyPlayerHits() | Ignore hits during death |
| inputMode | Global let | keydown/mousemove/touchstart handlers | render (joystick display branch) | Input mode branching |
| timeScale | Global let | bossDefeated tween, enterState() | gameLoop (dt multiplication) | Slow motion |
| screenShake | Global obj | triggerShake() | updateScreenShake(), applyScreenShake() | Screen shake |

### 16.3 Feature Implementation Checklist (F19)

| Feature | Sub-item | Status |
|---------|----------|--------|
| Player Movement | WASD input | ☐ |
| | Arrow key input | ☐ |
| | Touch joystick | ☐ |
| | Diagonal normalization | ☐ |
| | Map boundary clamping | ☐ |
| | Movement direction tilt (±5°) | ☐ |
| Weapon: Rune Bolt | Auto-fire (0.8s cooldown) | ☐ |
| | Nearest enemy targeting | ☐ |
| | Hit damage application | ☐ |
| | Hit particle effect | ☐ |
| | Lv2~5 upgrade effects | ☐ |
| Weapon: Fire Aura | Circular range display around player | ☐ |
| | 0.3s tick damage to enemies in range | ☐ |
| | Fire particle effect | ☐ |
| | Lv2~5 upgrade effects | ☐ |
| Weapon: Ice Lance | Fire + 50% slow on hit | ☐ |
| | Pierce logic (Lv1: 0 pierce) | ☐ |
| | Ice particle effect | ☐ |
| | Lv2~5 upgrade effects | ☐ |
| Weapon: Lightning Chain | Nearest enemy → 3-target chain damage | ☐ |
| | Lightning visual effect (zigzag line) | ☐ |
| | Lv2~5 upgrade effects | ☐ |
| Weapon: Protection Shield | 3 rotating orb rendering | ☐ |
| | Contact knockback + damage | ☐ |
| | -15% damage reduction | ☐ |
| | Lv2~5 upgrade effects | ☐ |
| Gem System | XP gem drop on enemy death | ☐ |
| | 5% chance HP recovery gem (HP +15) | ☐ |
| | Auto-collect within magnet range | ☐ |
| | XP accumulation | ☐ |
| | Collection particle effect | ☐ |
| Level Up | XP threshold → LEVEL_UP transition | ☐ |
| | 3 cards generated (pool-based) | ☐ |
| | Card slide-in animation | ☐ |
| | Card selection (1/2/3 + click + tap) | ☐ |
| | Effect application → return to PLAYING | ☐ |
| | Level-up particle effect | ☐ |
| Waves | 10 sequential waves | ☐ |
| | 3s rest between waves + announcement UI | ☐ |
| | Wave number top-left display | ☐ |
| | Wave timer progress bar (top) | ☐ |
| Boss: Crimson Warden | 2-phase AI transition | ☐ |
| | Shockwave attack (8-directional) | ☐ |
| | Slime summoning (phase 2) | ☐ |
| | HP bar display | ☐ |
| Boss: Elder Lich | 3-phase AI transition | ☐ |
| | Teleport + afterimage effect | ☐ |
| | Spiral barrage | ☐ |
| | Skeleton summoning (phase 2) | ☐ |
| | Screen shrink effect (phase 3) | ☐ |
| | HP bar display | ☐ |
| Achievements | 8 achievement condition checks | ☐ |
| | Unlock slide notification UI | ☐ |
| | localStorage permanent save | ☐ |
| Audio | 3 BGM tracks (title/battle/boss) | ☐ |
| | 7 sound effects | ☐ |
| | AudioContext on first interaction | ☐ |
| UI | HP bar (top-left, red→green gradient) | ☐ |
| | XP bar (below HP bar, cyan) | ☐ |
| | Score display (top-right) | ☐ |
| | Wave number (top-center) | ☐ |
| | Minimap (bottom-right, 100×100) | ☐ |
| | Owned weapon icons (bottom-left) | ☐ |
| | Pause button (top-right, 48×48) | ☐ |
| | Pause overlay | ☐ |
| | Game over screen (score + stats) | ☐ |
| | Result screen (achievements + high score) | ☐ |
| | Title screen (logo + start button) | ☐ |

### 16.4 Numerical Consistency Verification Table (F7)

> Cross-check all spec values against code constants 1:1.

| Item | Spec Value | Code Constant | Verified |
|------|-----------|---------------|----------|
| Slime HP | 15 | ENEMY_TYPES.slime.hp | ☐ |
| Slime Speed | 1.2 | ENEMY_TYPES.slime.speed | ☐ |
| Slime Damage | 8 | ENEMY_TYPES.slime.damage | ☐ |
| Slime XP | 5 | ENEMY_TYPES.slime.xp | ☐ |
| Bat HP | 10 | ENEMY_TYPES.bat.hp | ☐ |
| Bat Speed | 3.0 | ENEMY_TYPES.bat.speed | ☐ |
| Golem HP | 60 | ENEMY_TYPES.golem.hp | ☐ |
| Enemy Mage HP | 25 | ENEMY_TYPES.mage.hp | ☐ |
| Skeleton HP | 35 | ENEMY_TYPES.skeleton.hp | ☐ |
| Crimson Warden HP | 500 | BOSS_TYPES.crimsonWarden.hp | ☐ |
| Elder Lich HP | 1000 | BOSS_TYPES.elderLich.hp | ☐ |
| Rune Bolt Damage | 10 | WEAPON_TYPES.runeBolt.damage | ☐ |
| Rune Bolt Cooldown | 0.8 | WEAPON_TYPES.runeBolt.cooldown | ☐ |
| Fire Aura Damage | 5/tick | WEAPON_TYPES.fireAura.damage | ☐ |
| Ice Lance Damage | 18 | WEAPON_TYPES.iceLance.damage | ☐ |
| Lightning Chain Damage | 8 | WEAPON_TYPES.lightningChain.damage | ☐ |
| Shield Damage | 3 | WEAPON_TYPES.shield.damage | ☐ |
| Initial Move Speed | 3.0 | CONFIG.PLAYER_SPEED | ☐ |
| Initial Magnet Range | 60 | CONFIG.MAGNET_RANGE | ☐ |
| Initial HP | 100 | CONFIG.PLAYER_HP | ☐ |
| Max HP | 200 | CONFIG.PLAYER_MAX_HP | ☐ |
| MIN_TOUCH_TARGET | 48 | CONFIG.MIN_TOUCH_TARGET | ☐ |
| Level 1→2 XP | 20 | XP_TABLE[1] | ☐ |
| Wave 1 Duration | 30s | WAVE_TABLE[0].duration | ☐ |
| Wave 1 Spawn Interval | 2.0s | WAVE_TABLE[0].spawnInterval | ☐ |
| Wave 1 Max Enemies | 15 | WAVE_TABLE[0].maxEnemies | ☐ |
| Common Rarity Rate | 70% | CARD_RARITY.common | ☐ |
| Rare Rarity Rate | 25% | CARD_RARITY.rare | ☐ |
| Legendary Rarity Rate | 5% | CARD_RARITY.legendary | ☐ |

### 16.5 Forbidden Pattern Auto-Verification (F1, F2, F8, F9)

After implementation, verify **0 instances** of these patterns in code:
```
❌ assets/            — Directory must not exist
❌ .svg"              — No SVG file references (except thumbnail.svg)
❌ setTimeout         — 0 instances target
❌ setInterval        — 0 instances target
❌ alert(             — Forbidden
❌ confirm(           — Forbidden
❌ prompt(            — Forbidden
❌ google fonts       — No external resources
❌ feGaussianBlur     — No SVG filters
❌ ASSET_MAP          — No asset maps
❌ SPRITES            — No sprites
❌ preloadAssets      — No asset preloading
❌ new Image()        — No image loading
```

### 16.6 Smoke Test Gate (F13 — Required Before Review Submission)
1. ✅ `index.html` file exists
2. ✅ Page loads successfully in browser (not blank screen)
3. ✅ Zero console errors
4. ✅ Title screen displays correctly
5. ✅ Start game → player moves (WASD) → enemies appear → auto-attack works
6. ✅ Kill enemy → gem drops → collection works
7. ✅ Game over → restart possible
8. ✅ Confirm assets/ directory does not exist

### 16.7 Regression Test Path (F14)
After any fix, verify the complete flow:
```
TITLE → (start) → PLAYING → (level up) → LEVEL_UP → (select) → PLAYING
→ (wave 5) → BOSS_INTRO → PLAYING (boss fight) → (boss defeat) → PLAYING
→ (ESC) → PAUSED → (ESC) → PLAYING
→ (HP 0) → GAMEOVER → RESULT → (restart) → TITLE
```

---

## §17. Object Pooling

> Enemies, projectiles, particles, and gems have high-frequency creation/destruction — ObjectPool pattern required (Cycle 2 lesson).

```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 50) { ... }
  acquire() { /* Take from pool or createFn() new */ }
  release(obj) { /* resetFn(obj) then return to pool */ }
}
// Release during iteration: reverse iteration + splice pattern
```

| Object | Initial Pool Size | Expected Max Active |
|--------|-------------------|-------------------|
| Enemy | 60 | 50 |
| Projectile | 30 | 20 |
| Particle | 200 | 150 |
| Gem | 100 | 80 |
| Score Popup | 20 | 10 |
| Boss Bullet | 30 | 20 |

---

## §18. Core Function Signatures (F3 — Pure Functions, Zero Global References)

```javascript
// === Movement ===
function updatePlayerMovement(player, input, dt, config) → void
function normalizeDirection(dx, dy) → {x, y}

// === Weapons ===
function updateWeapons(weapons, enemies, player, dt, dmgTable, pools) → void
function fireRuneBolt(player, target, weaponLevel, pool) → projectile
function updateFireAura(player, enemies, weapon, dt, dmgTable, particles) → void
function fireIceLance(player, target, weaponLevel, pool) → projectile
function fireLightningChain(player, enemies, weapon, dmgTable, particles) → chainTargets[]
function updateShield(player, enemies, shield, dt, particles) → void

// === Enemies ===
function spawnEnemy(waveConfig, player, pool, time) → enemy
function updateEnemyAI(enemy, player, dt) → void
function updateBossAI(boss, player, dt, phase, pools) → void
function getBossPhase(boss) → number

// === Collision ===
function checkProjectileHits(projectiles, enemies, dmgTable, pools, scoreState) → {kills, newGems}
function checkEnemyPlayerHits(enemies, player, dt, shield, isDying) → {damage, knockbacks}
function circleCollision(ax, ay, ar, bx, by, br) → boolean

// === Gems ===
function updateGems(gems, player, dt, magnetRange, xpBoost) → {collected, xpGained, hpGained}

// === Level/Wave ===
function checkLevelUp(player, xpTable, isLevelingUp) → boolean
function generateUpgradeCards(player, weapons, cardPool, luck) → cards[3]
function applyUpgrade(player, weapons, card) → void
function checkWaveComplete(wave, enemies, waveClearing) → boolean
function advanceWave(wave, waveTable) → nextWaveConfig

// === Score/Stats (F16: Single Update Path) ===
function addScore(scoreState, amount) → void
function modifyHP(player, amount) → void
function addXP(player, amount, xpBoost) → void

// === Particles ===
function spawnDeathParticles(x, y, color, pool, count) → void
function spawnCollectParticles(x, y, targetX, targetY, pool) → void
function spawnLevelUpParticles(x, y, pool) → void
function updateParticles(particles, dt) → void

// === State Transitions (F23) ===
function beginTransition(target, options, tweenMgr, priority, currentState) → boolean
function enterState(state, gameData) → void

// === Rendering (Pure Output) ===
function drawPlayer(ctx, player, time) → void
function drawEnemy(ctx, enemy, time) → void
function drawBoss(ctx, boss, time, phase) → void
function drawProjectile(ctx, proj, time) → void
function drawGem(ctx, gem, time) → void
function drawParticles(ctx, particles) → void
function drawUI(ctx, state, player, wave, score, weapons) → void
function drawUpgradeCards(ctx, cards, selectedIndex, time) → void
function drawTitleScreen(ctx, time) → void
function drawGameOverScreen(ctx, result) → void
function drawResultScreen(ctx, result, achievements) → void
function drawPauseOverlay(ctx) → void
function drawJoystick(ctx, joystick) → void
function drawMinimap(ctx, player, enemies, mapSize) → void

// === Utilities ===
function touchSafe(w, h, minTouch) → {w, h}
function buildBgCache(offCanvas, offCtx, w, h, stars) → void
function applyScreenShake(ctx, shake) → void
function triggerShake(shake, intensity, duration) → void
```

---

## §19. thumbnail.svg Specification

Game highlight scene: Rune Mage (center) surrounded by cyan glow, simultaneously firing 5 weapons, with monsters swarming from all sides and XP gems scattered about.

- Size: 640×480 (4:3 ratio)
- Background: Dark navy `#1a1a2e` + grid pattern
- Center: Rune Mage (purple robe `#4a00e0` + cyan glow aura `#00d4ff`)
- Surrounding: Visual effects for each weapon (fire circle, ice lance, lightning, shield orbs, rune bolt trail)
- Enemies: 3~4 slimes (neon green) + boss silhouette (upper background, semi-transparent)
- Gems: 5~6 mint green `#00ff88` diamond shapes scattered
- Text: "Rune Survivor" title (top center, bold, cyan glow)
- Minimum size: 15KB+
- filter/gradient actively used (thumbnail.svg is the only exception for SVG filters)
