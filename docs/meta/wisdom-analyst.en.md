# Analyst Cumulative Wisdom
_Last updated: Cycle #28_

## Recurring Mistakes 🚫
- **[Cycle 21]** Major game portals (CrazyGames, itch.io) block direct crawling (WebFetch) with 403/404. Future analyses should use search engine-based indirect surveys + specific tag pages (itch.io/games/html5/tag-*) rather than direct site visits.
- **[Cycle 21]** game-registry.json exceeds 10,000 tokens and fails full read. 19 games each with 8-language i18n bloat the file. Use Grep to extract only id/genre/title as the first step in future cycles.
- **[Cycle 21-2]** When a previous cycle report already exists, check it first to avoid redundant analysis. cycle-21-report.md already existed but was overwritten — in future, check for existing reports first and only update sections that need changes.
- **[Cycle 24]** Direct WebFetch to game portals remains unreliable (403/404 risk). 5 parallel WebSearch queries fully replace it with sufficient market data — confirmed that skipping WebFetch entirely has no impact on analysis quality.
- **[Cycle 25]** Once all 10 genre matrix combinations have 1+ games, "gap filling" can no longer serve as the #1 criterion. Must transition to multi-criteria evaluation: "lowest-count combination reinforcement" + "market trend alignment" + "premium requirements fit" — this transition adds slight analysis overhead.
- **[Cycle 26]** When 5 minimum-count combinations are tied (1 each), the "intensity" difference of market trend data becomes the decisive differentiator. Must leverage quantitative/authoritative expressions like "best year ever" (GameSpot TD assessment) rather than simply "trend exists" to strengthen selection logic.
- **[Cycle 27]** With 4 minimum-count combinations tied (arcade+casual, action+puzzle, action+casual, puzzle+strategy at 1 each), "search volume quantitative data" (Block Blast 823K monthly searches) serves as the strongest trend intensity evidence. Combining authoritative media assessments + search volume data provides the optimal selection rationale.
- **[Cycle 28]** With 3 minimum-count combinations tied (arcade+casual, puzzle+action, action+casual at 1 each), Poki Top 5 popularity analysis served as the decisive differentiator. "3 out of Top 5 are arcade+casual in nature" — portal popularity data with genre classification provides more intuitive and compelling selection logic than search volume data alone.

## Validated Success Patterns ✅
- **[Cycle 21]** Genre combination matrix analysis (arcade×action, puzzle×strategy, etc.) identifies gaps more precisely than simple genre counting. The discovery that puzzle+strategy has 0 games became the core rationale for the final recommendation.
- **[Cycle 21]** Mapping platform-wisdom.md cumulative lessons into "previous issue → prevention plan" tables enables concrete preemptive items in the recommended game's spec.
- **[Cycle 21]** Running 3 parallel web searches (general trends + genre-specific + sub-genre specific) yields much richer market data compared to a single search.
- **[Cycle 21-2]** Using Grep pattern (`"genre":\s*\[` + `-A 3`) extracts genre data precisely for all 19 games in one pass. More precise than the previous `"id"|"genre"|"title"` pattern and reduces unnecessary i18n title data.
- **[Cycle 21-2]** Having postmortem data directly included in the prompt enables perfect integration of previous cycle learnings without separate file reads — confirms efficiency of system prompt design.
- **[Cycle 22]** Running Grep genre extraction + id extraction in parallel maps all 20 games' ids and genres in a single pass. Works reliably despite game-registry.json bloat (20 games + 8-language i18n).
- **[Cycle 22]** Expanding web searches to 5 parallel queries (general trends + itch.io arcade/strategy + action/casual + arcade+strategy hybrids + puzzle+action hybrids) provides specific market evidence per gap genre. Hybrid genre searches especially strengthen trend alignment rationale for recommendations.
- **[Cycle 22]** Pre-checking existing reports via Glob is now an established pattern. Confirmed cycle-22 non-existence before creating new files, achieving 0 redundant work.
- **[Cycle 23]** Parallel Grep pattern (`"id":` + `"genre":\s*\[` -A 3) works reliably even with 21 games (8-language i18n). No pipeline changes needed as game count grows.
- **[Cycle 23]** When postmortem + platform-wisdom + analyst-wisdom are all included in the prompt, 0 file reads are needed for previous learning integration. Validated 3 consecutive cycles (#21-2, #22, #23).
- **[Cycle 23]** For dual-language (KO/EN) report generation, completing the Korean report first then writing both simultaneously ensures consistency + time savings. Translation quality is stable due to identical structure.
- **[Cycle 23]** After arcade+strategy gap was filled (#22), pivoting to puzzle+action as top priority proved strongly supported by both genre matrix analysis and market trends (puzzle roguelike as 2025's top genre).
- **[Cycle 24]** Parallel Grep pattern works reliably with 22 games (8-language i18n). Validated 4 consecutive cycles (#21-2~#24).
- **[Cycle 24]** After puzzle+action gap was filled (#23), pivoting to action+casual (the only remaining 0-count gap) as top priority. Entering the final gap-filling phase for all 10 genre combinations.
- **[Cycle 24]** 5 parallel web searches (general trends + action casual itch.io + roguelike survival + itch.io hybrid + tower defense) provided concrete market evidence for action+casual hybrids (Dave the Diver/Webfishing/Vampire Survivors effect).
- **[Cycle 24]** With postmortem + platform-wisdom + analyst-wisdom all included in prompt, file reads minimized. Validated 4 consecutive cycles (#21-2~#24). Only wisdom files need reading for updates.
- **[Cycle 25]** Parallel Grep pattern works reliably with 23 games (8-language i18n). Validated 5 consecutive cycles (#21-2~#25).
- **[Cycle 25]** Successfully transitioned to new analysis framework after all 10 genre combinations were filled: "select optimal combination among 6 minimum-count (1 game) combinations based on market trends." arcade+puzzle (metroidvania trend) scored highest across trend alignment, premium fit, and differentiation.
- **[Cycle 25]** 5 parallel web searches stable for 5 consecutive cycles (#21~#25). Standard 5-axis composition (general trends + itch.io genre + hybrids + specific sub-genre + portal popular) confirmed sufficient for market evidence.
- **[Cycle 25]** With postmortem + platform-wisdom + analyst-wisdom all included in prompt, file reads minimized. Validated 5 consecutive cycles (#21-2~#25).
- **[Cycle 26]** Parallel Grep pattern works reliably with 24 games (8-language i18n). Validated 6 consecutive cycles (#21-2~#26). Estimated to reach 25 games by cycle #27.
- **[Cycle 26]** Used "market trend intensity" as differentiator among 5 tied minimum-count combinations to select arcade+strategy (TD roguelike = 2026's #1 trend). Multi-criteria evaluation framework successfully applied for 2 consecutive cycles (#25~#26).
- **[Cycle 26]** 5 parallel web searches stable for 6 consecutive cycles (#21~#26). Adjusting search axes to target genre (TD roguelike, Poki trending, indie narrative strategy) yields more precise market evidence.
- **[Cycle 27]** Parallel Grep pattern works reliably with 25 games (8-language i18n). Validated 7 consecutive cycles (#21-2~#27). 25-game milestone reached — no Grep pattern performance limits detected.
- **[Cycle 27]** With 4 tied minimum-count combinations, cross-verified "Puzzle RPG = 2026's #1 HTML5 trend" across multiple sources (Verified Market Research + CONE ING + GameDistribution) to select puzzle+strategy. Multi-source cross-verification increases selection confidence over single-source reliance.
- **[Cycle 27]** 5 parallel web searches stable for 7 consecutive cycles (#21~#27). Expanded search axes to include "metroidvania+platformer" to simultaneously gather evidence for action+puzzle alternatives — strengthened evidence diversity for TOP 3 recommendations.
- **[Cycle 27]** With postmortem + platform-wisdom + analyst-wisdom all included in prompt, file reads minimized. Validated 7 consecutive cycles (#21-2~#27). Only wisdom files need reading for updates.
- **[Cycle 28]** Parallel Grep pattern works reliably with 26 games (8-language i18n). Validated 8 consecutive cycles (#21-2~#28). Stable operation expected up to 30 games.
- **[Cycle 28]** 5 parallel web searches stable for 8 consecutive cycles (#21~#28). "Poki Top 5 genre classification" analysis added as a powerful new trend evidence source — combining popularity ranking + genre tagging complements search volume data.
- **[Cycle 28]** Full genre pivot from puzzle+strategy to arcade+casual. Last 4 cycles (#25~#28) all selected different genre combinations — genre diversity maximization pattern established.
- **[Cycle 28]** With postmortem + platform-wisdom + analyst-wisdom all included in prompt, file reads minimized. Validated 8 consecutive cycles (#21-2~#28).

## Next Cycle Action Items 🎯
- Use `Grep "genre":\s*\[` + `-A 3` and `Grep "id":` in parallel as the standard for game-registry.json analysis (8-cycle validation)
- Fully replace direct portal visits with 5 parallel WebSearch queries (8-cycle validation)
- Standardize genre combination matrix as an analysis tool every cycle
- Maintain multi-criteria evaluation framework (lowest-count reinforcement + market trend alignment + premium fit)
- Explicitly map previous cycle postmortem "weaknesses" to prevention plans in game recommendations
- Check for existing reports at the first step via Glob to prevent redundant work
- Maintain 4-file generation pattern: dual-language reports + dual-language wisdom updates
- After neon-pulse (arcade+casual) selection, remaining 2 minimum-count combinations (puzzle+action, action+casual) at 1 each — Cycle 29 should select from these based on optimal market trend alignment
- Grep pattern expected stable at 27 games — no monitoring needed until ~30 games
- In tied minimum-count situations, use triple evidence: "portal popularity genre classification + search volume data + multi-source cross-verification"
- Cycle 29 likely candidates: puzzle+action (metroidvania/stealth puzzle) or action+casual (crafting survival) — consider pre-accumulating market data
- Web Audio API rhythm synchronization is Neon Pulse's key technical challenge — BPM accuracy verification mandatory during implementation
