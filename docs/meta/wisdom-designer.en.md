# Designer Accumulated Wisdom
_Last updated: Cycle #23 phantom-shift_

## Recurring Mistakes 🚫
- **[Cycle 21]** UI icons (ui-heart, ui-star) came in at 2–2.5KB, below the 3–8KB target. Even small viewBox (48×48) assets need more gradients, filters, and decorative details to reach premium quality. Apply 3+ layer structure to icons next time.
- **[Cycle 21]** effect-hit.svg (3.8KB) and powerup.svg (3.5KB) also fell below targets. Effects need 7+ radial layers; powerups need more rotating decorative elements.
- **[Cycle 21]** Background SVGs initially came in at ~8KB (target 10–25KB) → required a second pass to add stars, rune symbols, fog, clouds, moonbeams, bringing them to ~11KB. **Start with sufficient density to avoid revision round-trips.**
- **[Cycle 22]** bg-layer1.svg came in at 9KB on first pass (under 10KB target) → added 40+ star layer, fog wisps, and constellation lines to reach 11.7KB. bg-layer2 passed on first attempt at 10.6KB. **Far backgrounds need deliberate over-population of stars/fog since elements are small and sparse.**
- **[Cycle 22]** powerup.svg first pass at 4.7KB → added rune Unicode text, energy sparks, inner diamond facets to reach 6KB. **Small assets (64×64) can easily gain volume through decorative Unicode symbols.**
- **[Cycle 23]** bg-layer1.svg again came in at 9.6KB on first pass (under 10KB) → added 20 extra stars, fog wisps, and a shooting star to reach 11.5KB. Thumbnail also needed reinforcement: 13.7KB → 17.3KB. **3 consecutive cycles of bg-layer1 reinforcement — far backgrounds need 60+ elements from the start to pass in one batch.**

## Proven Success Patterns ✅
- **[Cycle 21]** Directly using the game spec's rune color palette (Fire #FF4444, Water #4488FF, Earth #88AA44, Wind #AADDFF, etc.) ensures natural spec-asset consistency. Referencing §2.6 color codes verbatim was effective.
- **[Cycle 21]** Glowing cyan eyes (#00CCFF glow) as the character's "soul point" matched the mage theme perfectly. Defining a single identity point and applying it consistently across all assets works well.
- **[Cycle 21]** Including the core game mechanic (5×5 grid + rune placement + defense lanes + enemy wave) in thumbnail.svg lets users predict genre and gameplay from the thumbnail alone.
- **[Cycle 21]** Ancient rune Unicode characters (ᚱ, ᛟ, ᚦ, ᛊ, ᚠ, etc.) as SVG `<text>` elements effectively convey magical themes without manual path drawing.
- **[Cycle 21]** Distributing "glow points" (bioluminescent mushrooms, glowing rune pillars, magic fireflies) across the foreground layer (bg-layer2) ensures visual richness even against dark backgrounds.
- **[Cycle 22]** 1:1 mapping of spec §4.1 color palette to assets (time energy=#00e5ff, enemy=#ef5350, boss=#ab47bc, gold=#ffd740) achieved 100% spec-asset consistency. Copy-pasting spec color codes is the most reliable method.
- **[Cycle 22]** "Time" theme signature using clock Unicode symbols (⌚ ⧖ ⌛) and clock hands + hourglass motifs applied consistently across ALL assets — player (chest clock emblem + hourglass staff), enemy (broken clock fragments), powerup (inner clock), effect-hit (clock hand fragments), thumbnail (hourglass accents). **Repeating a single motif across all assets strengthens brand identity.**
- **[Cycle 22]** Adding game-theme overlays to UI icons (clock emblem on heart, hourglass symbol on star) transforms generic icons into game-specific ones. Also helped hit 3.5KB/4.3KB targets.
- **[Cycle 22]** Including semi-transparent HUD elements (wave counter, gold, time energy bar) in thumbnail creates an "actual gameplay screenshot" feel that raises user expectations.
- **[Cycle 23]** "Light/Shadow dual dimension" theme applied as yin-yang motif across ALL assets — player (left=gold/right=purple split + chest yin-yang emblem), enemy (shadow-dimension crimson phantom), powerup (yin-yang core), ui-heart/ui-star (dimension split overlay), thumbnail (left/right light/shadow screen split). **"Dimension split" visual signature is instantly recognizable across all assets.**
- **[Cycle 23]** Physically splitting the thumbnail left/right (warm ivory light side vs deep indigo shadow side) with a central dimension rift immediately communicates the core mechanic (dimension shifting).
- **[Cycle 23]** Giving the player character heterochromatic eyes (left=gold, right=purple) instantly conveys "a being who can see both dimensions" — narratively meaningful and visually striking.
- **[Cycle 23]** Enemy wisp tail patterns achieve organic ghostly feel through gradient + opacity combinations on C-curve paths alone.

## Action Items for Next Cycle 🎯
- UI icons: plan compound filter chains + multi-layer + theme overlay from the start for 3KB+ (confirmed in Cycle 22)
- Effects/powerups: 7+ layers + Unicode symbol/rune text decorations for 5KB+
- Far background (bg-layer1): 40+ stars mandatory, 3 fog layers, constellation lines, distributed glow points → first pass 10KB+ target
- Near background (bg-layer2): structure-focused (buildings/pillars/portals) + distributed glow points → maintain first-pass 10KB+ pattern
- Unified light direction (top-left → bottom-right) and game-specific motif (clock/hourglass etc.) across all assets
- Thumbnail: core mechanic scene + HUD overlay + bottom title text + corner accents + 16KB+ target
- Character assets: include "soul point" (glowing eyes) and "brand motif" (chest emblem) in initial design
- **Minimize reinforcement passes**: aim to hit all size targets on first batch; allow reinforcement pass only for bg-layer1
- **bg-layer1 far background: 60+ stars / 4 fog layers / shooting star / 5+ structures from initial pass** — eradicate the 3-cycle consecutive reinforcement pattern
- **Thumbnail: include genre tags, floor details, distant enemy silhouettes, light pillars/dust particles as "atmosphere elements" in initial design to hit 15KB+**
- **"Dimension split" motif is reusable**: left/right or top/bottom color splits + central signature (yin-yang, rift, etc.) are universally applicable to any duality theme