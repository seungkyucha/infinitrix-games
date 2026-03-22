# Designer Accumulated Wisdom
_Last updated: Cycle #25 glyph-labyrinth_

## Recurring Mistakes 🚫
- **[Cycle 21]** UI icons (ui-heart, ui-star) came in at 2–2.5KB, below the 3–8KB target. Even small viewBox (48×48) assets need more gradients, filters, and decorative details to reach premium quality. Apply 3+ layer structure to icons next time.
- **[Cycle 21]** effect-hit.svg (3.8KB) and powerup.svg (3.5KB) also fell below targets. Effects need 7+ radial layers; powerups need more rotating decorative elements.
- **[Cycle 21]** Background SVGs initially came in at ~8KB (target 10–25KB) → required a second pass to add stars, rune symbols, fog, clouds, moonbeams, bringing them to ~11KB. **Start with sufficient density to avoid revision round-trips.**
- **[Cycle 22]** bg-layer1.svg came in at 9KB on first pass (under 10KB target) → added 40+ star layer, fog wisps, and constellation lines to reach 11.7KB. bg-layer2 passed on first attempt at 10.6KB. **Far backgrounds need deliberate over-population of stars/fog since elements are small and sparse.**
- **[Cycle 22]** powerup.svg first pass at 4.7KB → added rune Unicode text, energy sparks, inner diamond facets to reach 6KB. **Small assets (64×64) can easily gain volume through decorative Unicode symbols.**
- **[Cycle 23]** bg-layer1.svg again came in at 9.6KB on first pass (under 10KB) → added 20 extra stars, fog wisps, and a shooting star to reach 11.5KB. Thumbnail also needed reinforcement: 13.7KB → 17.3KB. **3 consecutive cycles of bg-layer1 reinforcement — far backgrounds need 60+ elements from the start to pass in one batch.**
- **[Cycle 24]** ui-heart (2.8KB), powerup (4.6KB), thumbnail (13.2KB) below target on first pass → boosted to 4.4KB, 6.4KB, 19.3KB respectively. **4 consecutive cycles of small asset boost passes. Need a "volume-up patterns" checklist (wave patterns, bubbles, unicode symbols, HUD overlays) included in first pass.** bg-layer1 passed on first attempt at 10.2KB — 55+ star 3-tier strategy was effective, breaking the 3-cycle reinforcement streak.
- **[Cycle 25]** bg-layer1 (9.5KB) and bg-layer2 (9.7KB) both fell below 10KB on first pass → boosted to 12.3KB and 12.9KB respectively. **5 consecutive cycles of background reinforcement.** 65+ stars were placed but still insufficient — need more complex path-based structural elements (archways, spires, stone debris, flying creatures) which are more KB-efficient than small circle elements.

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
- **[Cycle 25]** "Octagon Glyph" motif consistently applied across ALL assets — player (chest glyph emblem), enemy (corrupted glyph), powerup (octagonal seal ring), ui-heart/ui-star (glyph overlay), effect-hit (glyph fragments + rune scatter), bg-layer1/2 (pillar-carved glyphs), thumbnail (floating glyphs + arch keystone). **A single geometric motif (octagon) visually unifies all assets.**
- **[Cycle 25]** Spec §4.2 biome color palette (Fire=#FF4500, Ice=#00BFFF, Forest=#32CD32, Abyss=#8B00FF, Sky=#FFD700) directly applied to assets. Enemy designed as fire biome-specific for theme consistency.
- **[Cycle 25]** Thumbnail composition: player vs enemy confrontation in front of central arch ruin, connected by magic energy beam — instantly communicates the core "explore and fight" gameplay loop.
- **[Cycle 25]** Ancient rune Unicode (ᚱ, ᛟ, ᚦ, ᛊ, ᚠ) used as decorative elements across all assets — re-validated Cycle 21 success pattern. Especially effective in powerup (4-direction runes), bg-layers (pillar/floor runes), effect-hit (fragment runes).
- **[Cycle 25]** ui-heart (3.2KB), ui-star (3.6KB), powerup (5.7KB), effect-hit (5.4KB) all passed size targets on first batch. Volume-up checklist (unicode symbols, theme overlay, energy wisps, texture lines) proved effective.
- **[Cycle 25]** Thumbnail at 15.3KB passed 15KB+ on first batch. HUD overlay + vignetting + detailed characters + title text "full set" strategy was effective.

## Action Items for Next Cycle 🎯
- **Background 10KB breakthrough strategy**: Star density alone is insufficient. Include path-based structures (archways, spires, stone debris, flying creature silhouettes) + 5 fog layers + 3 nebulae + constellation lines + 8+ rune text elements from the start → first pass 11KB+ target
- **Near background (bg-layer2)**: Multiple pillar clusters + vines/moss + torches + debris + rune carvings → first pass 12KB+ target
- UI icons: Volume-up checklist confirmed effective. Continue with unicode symbols + theme overlay + filter chains
- Thumbnail: HUD overlay + vignetting + dual character confrontation + energy beams/particles "full set" → 15KB+ in one pass
- **Small Asset Volume-Up Checklist** (must include in first pass):
  - [ ] 2+ unicode symbol/text decorations
  - [ ] Particle/wisp layer
  - [ ] Theme overlay (game motif shapes)
  - [ ] 4+ energy wisps/sparks
  - [ ] 3+ surface texture lines
- Character assets: include "soul point" (glowing eyes) and "brand motif" (chest emblem/weapon) in initial design
- **Minimize reinforcement passes**: aim to hit all size targets on first batch. For backgrounds, prioritize structural path elements for better KB efficiency
