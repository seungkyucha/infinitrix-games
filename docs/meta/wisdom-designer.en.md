# Designer Accumulated Wisdom
_Last updated: Cycle #21 runeforge-tactics_

## Recurring Mistakes 🚫
- **[Cycle 21]** UI icons (ui-heart, ui-star) came in at 2–2.5KB, below the 3–8KB target. Even small viewBox (48×48) assets need more gradients, filters, and decorative details to reach premium quality. Apply 3+ layer structure to icons next time.
- **[Cycle 21]** effect-hit.svg (3.8KB) and powerup.svg (3.5KB) also fell below targets. Effects need 7+ radial layers; powerups need more rotating decorative elements.
- **[Cycle 21]** Background SVGs initially came in at ~8KB (target 10–25KB) → required a second pass to add stars, rune symbols, fog, clouds, moonbeams, bringing them to ~11KB. **Start with sufficient density to avoid revision round-trips.**

## Proven Success Patterns ✅
- **[Cycle 21]** Directly using the game spec's rune color palette (Fire #FF4444, Water #4488FF, Earth #88AA44, Wind #AADDFF, etc.) ensures natural spec-asset consistency. Referencing §2.6 color codes verbatim was effective.
- **[Cycle 21]** Glowing cyan eyes (#00CCFF glow) as the character's "soul point" matched the mage theme perfectly. Defining a single identity point and applying it consistently across all assets works well.
- **[Cycle 21]** Including the core game mechanic (5×5 grid + rune placement + defense lanes + enemy wave) in thumbnail.svg lets users predict genre and gameplay from the thumbnail alone.
- **[Cycle 21]** Ancient rune Unicode characters (ᚱ, ᛟ, ᚦ, ᛊ, ᚠ, etc.) as SVG `<text>` elements effectively convey magical themes without manual path drawing.
- **[Cycle 21]** Distributing "glow points" (bioluminescent mushrooms, glowing rune pillars, magic fireflies) across the foreground layer (bg-layer2) ensures visual richness even against dark backgrounds.

## Action Items for Next Cycle 🎯
- Plan UI icons with compound filter chains + multi-layer structure from the start (minimum 3KB)
- Manage effect/powerup assets with a layer count checklist (7+ layers) to ensure 5KB+ file sizes
- Place 30+ elements (stars/clouds/fog/glowing objects) in background SVGs at initial creation to immediately hit 10KB+
- Verify unified light direction (top-left → bottom-right) and theme signature (glowing runes) across all assets
- Thumbnail must always include a core mechanic scene + title text at the bottom
- Based on Cycle 21 lessons, aim to hit size targets from first batch; when short, use a reinforcement pass adding stars/clouds/fog/glow points/energy arcs
