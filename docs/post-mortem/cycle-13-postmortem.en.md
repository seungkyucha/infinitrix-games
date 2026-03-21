---
cycle: 13
game-id: mini-idle-farm
title: Mini Idle Farm
date: 2026-03-21
verdict: APPROVED
---

# Mini Idle Farm — Postmortem

## One-Line Summary
Built an idle simulation where you grow a farm empire from empty land through crops, livestock, and processing, and after 3 review rounds achieved APPROVED with zero assets + full 48px touch target compliance + 0 console errors.

## What We Built
Mini Idle Farm is an idle simulation where you manage a 6-slot grid farm, starting with wheat and working up through livestock and processed goods across 10 resource types to grow a farm empire. Tapping triggers harvest particles and instant gold, and purchasing automation upgrades generates income even while idle. Resetting via prestige earns permanent growth multipliers, making each playthrough exponentially faster as the long-term goal.

This game combined Cycle 11's idle production pipeline know-how with Cycle 8's tycoon upgrade economy. After the Korean Word Quest failed in the earlier Cycle 13 attempt due to missing index.html, the plan was completely changed to tackle the platform's first farm idle genre. The full spec scope — 3-stage farm expansion (Field→Ranch→Processing), 6 prestige permanent upgrades, offline income, 5 milestone tiers — was faithfully implemented. Through 3 review rounds, completeness was elevated to include full 48px touch target compliance, dead code removal, and mute toggle UI addition.

## What Went Well
- **100% spec value match**: From wheat 3s/2G to sweater 30s/50G across 10 resources, prestige star formula `floor(sqrt(totalEarned/1000))`, offline 4h ×0.5 rate — 30+ CONFIG object values perfectly match the spec
- **Zero asset principle achieved**: Finally overcame the assets/ directory problem recurring for 13 consecutive cycles. 100% Canvas + Web Audio, 0 external files, 0 fetch/Image usage. Final confirmation of the "write from empty index.html" principle's effectiveness
- **Full WCAG AAA touch target compliance**: Round 2's 48px shortfall was fully corrected by referencing `CONFIG.MIN_TOUCH_TARGET` constant across all buttons. Pause, mute, upgrade, prestige, and modal buttons all achieve 48px+
- **Code review 18/18 all PASS + browser test all PASS**: 0 console errors, 0 improvement items. No new issues found in Round 3
- **Successfully combined previous cycle know-how**: Cycle 11 idle pipeline + Cycle 8 tycoon economy + Cycle 4 TweenManager clearImmediate + Cycle 10 try-catch game loop — 13-cycle accumulated infrastructure worked without modification in the idle farm genre

## Areas for Improvement
- **3 review rounds required**: Round 1 NEEDS_MINOR_FIX → Round 2 NEEDS_MINOR_FIX → Round 3 APPROVED. The "declaration-implementation gap" of declaring `CONFIG.MIN_TOUCH_TARGET` but not actually referencing it in buttons created 2 fix cycles. If a utility enforcing `Math.max(MIN_TOUCH, h)` pattern in rendering functions had been standardized, Round 1 pass would have been possible
- **SoundManager setTimeout remained then resolved**: Round 2's setTimeout sound sequencing was replaced in Round 3 with `ctx.currentTime + startOffset` Web Audio native scheduling. This pattern must be applied from the start in the next game
- **Confusion in early Cycle 13**: The pivot from Korean Word Quest failure (index.html not created) → Mini Idle Farm re-planning within the cycle complicated game-id tracking
- **If there had been more time**: Would have added enhanced visual effects for fertilizer, more unique animations per livestock type, and visual differentiation for prestige permanent upgrades

## Technical Highlights
- **CONFIG.MIN_TOUCH_TARGET reference pattern**: Not just declaring the 48px constant but directly referencing it in all button rendering functions as `btnH = CONFIG.MIN_TOUCH_TARGET`. The principle of "not separating declaration from application" was validated in Round 3
- **Dual ObjectPool operation**: Pooling 70 particles + 20 popups ensures stable operation without GC spikes even during mass harvest effects
- **Offscreen Canvas background cache**: Renders sky gradient + clouds + sun + fence once then reuses. Avoids redrawing complex backgrounds every frame for performance
- **Web Audio native scheduling**: `oscillator.start(ctx.currentTime + startOffset)` pattern completely eliminates setTimeout. All SoundManager sequencing is AudioContext timeline-based
- **Save compatibility correction**: Defensively auto-corrects missing fields when loading older saves (line 424-431) to prevent data loss. Save stability is key to player retention in idle genres
- **Long-press continuous purchase + swipe tab switching**: Auto-repeat purchasing at 100ms intervals after 500ms, tab switching on 60px+ left/right swipe — stable reuse of idle mobile UX patterns proven in Cycle 11

## Suggestions for Next Cycle
1. **Standardize touch target enforcement utility**: Define `Math.max(MIN_TOUCH, size)` pattern as a shared utility to structurally prevent declaration-implementation gaps. Apply the lesson from this 3-round review from the start in the next game
2. **Deepen simulation/management genre**: Based on Idle Farm (Cycle 13) + Tycoon (Cycle 8) experience, try more complex resource conversion chains or supply-demand simulation. Or diversify with unexplored genres (word puzzle retry, hard difficulty)
3. **Extract shared engine module**: Extract TweenManager, ObjectPool, TransitionGuard, SoundManager repeated across 13 games into `shared/engine.js`. Structurally resolve recurring issues like try-catch wrapping omission, clearImmediate() non-implementation, MIN_TOUCH non-application

---
_Written: 2026-03-21 | InfiniTriX Postmortem Series #13 (mini-idle-farm) — Round 3 APPROVED Final_
