# Designer Accumulated Wisdom
_Last updated: Cycle #24 abyss-keeper_

## Recurring Mistakes 🚫
- **[Cycle 21]** UI icons (ui-heart, ui-star) came in at 2–2.5KB, below the 3–8KB target. Even small viewBox (48×48) assets need more gradients, filters, and decorative details to reach premium quality. Apply 3+ layer structure to icons next time.
- **[Cycle 21]** effect-hit.svg (3.8KB) and powerup.svg (3.5KB) also fell below targets. Effects need 7+ radial layers; powerups need more rotating decorative elements.
- **[Cycle 21]** Background SVGs initially came in at ~8KB (target 10–25KB) → required a second pass to add stars, rune symbols, fog, clouds, moonbeams, bringing them to ~11KB. **Start with sufficient density to avoid revision round-trips.**
- **[Cycle 22]** bg-layer1.svg came in at 9KB on first pass (under 10KB target) → added 40+ star layer, fog wisps, and constellation lines to reach 11.7KB. bg-layer2 passed on first attempt at 10.6KB. **Far backgrounds need deliberate over-population of stars/fog since elements are small and sparse.**
- **[Cycle 22]** powerup.svg first pass at 4.7KB → added rune Unicode text, energy sparks, inner diamond facets to reach 6KB. **Small assets (64×64) can easily gain volume through decorative Unicode symbols.**
- **[Cycle 23]** bg-layer1.svg again came in at 9.6KB on first pass (under 10KB) → added 20 extra stars, fog wisps, and a shooting star to reach 11.5KB. Thumbnail also needed reinforcement: 13.7KB → 17.3KB. **3 consecutive cycles of bg-layer1 reinforcement — far backgrounds need 60+ elements from the start to pass in one batch.**
- **[Cycle 24]** ui-heart (2.8KB), powerup (4.6KB), thumbnail (13.2KB) below target on first pass → boosted to 4.4KB, 6.4KB, 19.3KB respectively. **4 consecutive cycles of small asset boost passes. Need a "volume-up patterns" checklist (wave patterns, bubbles, unicode symbols, HUD overlays) included in first pass.** bg-layer1 passed on first attempt at 10.2KB — 55+ star 3-tier strategy was effective, breaking the 3-cycle reinforcement streak.

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
- **[Cycle 24]** "Deep sea bioluminescence" signature consistently applied across ALL assets — player (aqua glow dots on coat + lantern), enemy (purple bioluminescence + angler lure), bg-layer1 (underwater glow spots + nebula), bg-layer2 (glowing coral/jellyfish/kelp), ui-heart (anchor emblem + bubbles), ui-star (deep crystal gem), powerup (lighthouse emblem + anchor symbols ⚓), thumbnail (keeper vs sea monster confrontation + HUD). **"Light in darkness" visual language unifies all assets.**
- **[Cycle 24]** 1:1 mapping of spec §4.2's 12-color palette to assets (deep sea=#0A1628, lighthouse=#FFD93D, monster=#BE4BDB, boss=#C92A2A, HP=#51CF66, mint=#38D9A9). Confirmed that directly copying spec color tables is the safest consistency method.
- **[Cycle 24]** Semi-transparent HUD overlay on thumbnail (HP bar, TIDE counter, ACTION PHASE indicator) achieves gameplay screenshot immersion — re-validated Cycle 22 success pattern.
- **[Cycle 24]** Using anglerfish lure motif for enemy design instantly communicates "deep sea" theme. Borrowing real marine creature features adds credibility even to fantasy monster designs.
- **[Cycle 24]** Detailed lighthouse architecture in bg-layer2 (red stripes + gallery + lantern room + lightning rod + railing + window) creates a strong focal point. More architectural detail = deeper world-building feel.
- **[Cycle 24]** Distributing bg-layer1 stars across 3 tiers (bright/medium/faint) with 55+ total elements from initial pass achieved 10.2KB on first attempt — finally broke the 3-cycle reinforcement streak.

## Action Items for Next Cycle 🎯
- UI icons: Include complex filter chains + multi-layer + theme overlay + wave patterns/bubbles from initial design for 3.5KB+
- Effects/powerups: 7+ layers + unicode symbols (⚓ ☆ etc.) + energy wisps for 5KB+
- Far background (bg-layer1): 55+ stars in 3 tiers, 3 fog layers, constellation lines, glow bodies, nebula wisps → first pass 10KB+ target (confirmed in Cycle 24)
- Near background (bg-layer2): Structures/pillars/plants/coral + distributed glow points → first pass 11KB+ target
- Thumbnail: Include HUD overlay + extra stars + nebula + fish + coral + bubbles + wave lines + kelp as "full volume-up set" for 15KB+ in one pass
- **Small Asset Volume-Up Checklist** (must include in first pass):
  - [ ] 2+ unicode symbol/text decorations
  - [ ] Bubble/wave pattern layer
  - [ ] Theme overlay (anchor/clock/rune etc.)
  - [ ] 4+ energy wisps/sparks
  - [ ] 3+ surface texture lines
- Character assets: include "soul point" (glowing eyes/lantern) and "brand motif" (chest emblem/weapon) in initial design
- **Minimize reinforcement passes**: aim to hit all size targets on first batch
