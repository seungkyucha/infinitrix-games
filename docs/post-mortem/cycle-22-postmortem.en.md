---
cycle: 22
game-id: chrono-siege
title: Chrono Siege
date: 2026-03-22
verdict: APPROVED
---

# Chrono Siege — Post-mortem

## One-line Summary
Built a hybrid tower defense with real-time time magic (slow/haste/reverse) and strategic tower placement, filling the platform's arcade + strategy genre gap.

## What We Built
Chrono Siege is a tower defense game about a Chronomancer defending against Chronobeasts pouring from time rifts. Players simultaneously operate two mechanics: strategic tower placement on a grid (strategy) using 7 tower types, and real-time casting of 3 time spells — slow, haste, and reverse — via Q/W/E keys (arcade). The game spans 5 eras: Ancient → Medieval → Industrial → Future → End of Time, each with unique enemies and bosses.

The core tension comes from time energy management. Spells are powerful but energy is limited — "Should I cast slow now, or save it for the boss?" This moment-to-moment decision determines each wave's outcome. With 5 eras × 4 stages + 5 bosses + hidden stages, plus a permanent upgrade tree and 3 difficulty presets (easy/medium/hard), replay value is substantial.

## What Went Well ✅
- **First arcade + strategy genre gap filled**: Successfully addressed the platform's largest genre gap (0 games → 1), clearly differentiating from the existing mini-tower-defense (pure strategy).
- **14-state machine — platform all-time record**: From TITLE to TUTORIAL, 14 states managed flawlessly with STATE_PRIORITY + ESCAPE_ALLOWED + beginTransition. Guard flag pattern confirmed stable for 15 consecutive cycles (Cycle 4–22).
- **F1–F38 record 38 feedback mappings**: All 22 cycles' accumulated lessons were mapped in spec §0, achieving 7/7 core gameplay items PASS.
- **Zero-issue final deployment**: P1/P2/P3 issues at 0 — ready for immediate deployment. Started with P1 ×2 in round 1, but resolved all issues across 4 review rounds.
- **assets/ non-creation 5 consecutive cycles**: The zero-asset principle starting from Cycle 18 is fully established. Only thumbnail.svg remains, with 0 external CDN requests and 0 setTimeouts (11 consecutive cycles).
- **Ko/En dual language support**: TEXT.ko + TEXT.en object-based full localization applied for 2 consecutive cycles following Cycle 21.

## What Could Be Better ⚠️
- **4 review rounds required**: Round 1 had P1 ×2 (CRITICAL-level) + P2 ×2. P3 advisories persisted through rounds 2–3, requiring 4 total rounds (2nd review, 3rd sub-round). Failing to achieve first-round APPROVED is disappointing.
- **menuY layout issue persisted until round 3**: Title menu buttons clipping on 480px mobile viewport was classified as P3-ADV and only fully fixed in round 3. UI layout testing across diverse viewport sizes should be more systematically included at the planning stage.
- **Balance verification gap**: No automated balance verification exists for the vast combination space of 5 eras × 4 stages × 3 difficulties × 7 towers × 3 spells. Code review alone cannot determine if certain time magic combos are overpowered or late eras are impossible.
- **Single file size continues growing**: While exact line count is unconfirmed, the complexity of 14 states + 5 eras + 7 towers + boss system likely exceeds Cycle 21's 4,215 lines. Shared engine module extraction has been delayed for 22 cycles.
- **Multi-stakeholder feedback process**: The pattern of planner/designer feedback extending review rounds recurred from Cycle 21. A process to consolidate feedback before reviews is still not established.

## Technical Highlights 🛠️
- **Time magic system**: 3-axis spells (slow/haste/reverse) implemented via timeScale separation. The architecture modulates only game time while keeping UI and sound in real-time, successfully extending the survivor-like (Cycle 18) slow-motion pattern to tower defense.
- **14-state machine stability**: STATE_PRIORITY + ESCAPE_ALLOWED (reverse transition paths) + beginTransition + direct enterState(PAUSED exception) combination works flawlessly at the record state count. PAUSED→GAMEPLAY instant transition and GAMEOVER priority handling feel natural.
- **Quad-layer offscreen caching**: buildBgCache (era backgrounds) + buildGridCache (grid lines) + buildIconCache (tower/spell icons) + buildUICache (HUD frames) dramatically reduce per-frame redrawing cost, rebuilding only on resize/stage transitions.
- **menuY lower bound**: `Math.min(H * 0.72, H - (3 * (btnH + 12) + 40))` ensures UI elements fit within viewport even on small screens — a responsive layout pattern.
- **ScrollManager reuse**: The momentum + bounce physics scroll introduced in Cycle 21 provides native-app-quality touch UX in upgrade and codex screens.

## Next Cycle Suggestions 🚀
1. **Begin shared engine module extraction**: Extract TweenManager, ObjectPool, TransitionGuard, SoundManager, touchSafe(), ScrollManager into shared/engine.js. This task, delayed 22 cycles, has crossed the critical threshold.
2. **Tower defense balance simulator**: Build a tool to auto-play Chrono Siege's 5 eras × 3 difficulties, collecting per-stage clear rate / tower preference / spell usage frequency statistics.
3. **Pre-review multi-stakeholder feedback consolidation**: Formalize a process to integrate planner/designer feedback in a single pass before code review begins, targeting ≤3 review rounds.
