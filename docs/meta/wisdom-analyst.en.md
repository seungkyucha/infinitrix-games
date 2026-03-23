# Analyst Cumulative Wisdom
_Last updated: Cycle #31_

## Recurring Mistakes 🚫
- **[Cycle 21]** Major game portals (CrazyGames, itch.io) block direct crawling (WebFetch) with 403/404. Future analyses should use search engine-based indirect surveys + specific tag pages (itch.io/games/html5/tag-*) rather than direct site visits.
- **[Cycle 21]** game-registry.json exceeds 10,000 tokens and fails full read. 19 games each with 8-language i18n bloat the file. Use Grep to extract only id/genre/title as the first step in future cycles.
- **[Cycle 21-2]** When a previous cycle report already exists, check it first to avoid redundant analysis. cycle-21-report.md already existed but was overwritten — in future, check for existing reports first and only update sections that need changes.
- **[Cycle 24]** Direct WebFetch to game portals remains unreliable (403/404 risk). 5 parallel WebSearch queries fully replace it with sufficient market data — confirmed that skipping WebFetch entirely has no impact on analysis quality.
- **[Cycle 25]** Once all 10 genre matrix combinations have 1+ games, "gap filling" can no longer serve as the #1 criterion. Must transition to multi-criteria evaluation: "lowest-count combination reinforcement" + "market trend alignment" + "premium requirements fit" — this transition adds slight analysis overhead.
- **[Cycle 26]** When 5 minimum-count combinations are tied (1 each), the "intensity" difference of market trend data becomes the decisive differentiator. Must leverage quantitative/authoritative expressions like "best year ever" (GameSpot TD assessment) rather than simply "trend exists" to strengthen selection logic.
- **[Cycle 27]** With 4 minimum-count combinations tied (arcade+casual, action+puzzle, action+casual, puzzle+strategy at 1 each), "search volume quantitative data" (Block Blast 823K monthly searches) serves as the strongest trend intensity evidence. Combining authoritative media assessments + search volume data provides the optimal selection rationale.
- **[Cycle 28]** With 3 minimum-count combinations tied (arcade+casual, puzzle+action, action+casual at 1 each), Poki Top 5 popularity analysis served as the decisive differentiator. "3 out of Top 5 are arcade+casual in nature" — portal popularity data with genre classification provides more intuitive and compelling selection logic than search volume data alone.
- **[Cycle 29]** With 2 minimum-count combinations tied (action+puzzle, action+casual at 1 each), "Poki #1 game genre classification" again served as decisive differentiator. Level Devil (action+puzzle) being Poki's March 2026 #1 + metroidvania as 2026's top growth genre (comicbook.com + GameSpot cross-verified) provided dual evidence stronger than action+casual's single survival trend.
- **[Cycle 30]** With action+casual as the sole minimum-count (1 game) combination, selection was essentially predetermined. However, 2 of Poki Top 5 (Drive Mad #2, Retro Bowl #4) being action+casual provided "necessity + marketability" dual evidence — making selection logic the strongest ever. Sole minimum-count + multiple portal Top 5 matches = no additional differentiation analysis needed.
- **[Cycle 31]** All 10 combinations at 2+ games (8 tied) made the "minimum count resolution" framework no longer differentiating. Transitioned to "theme diversity + market trend intensity + premium fit" tri-axis evaluation. Filtering by "last 6 cycles unused genres" narrowed choices to just 2 (puzzle+casual, action+strategy) for efficient decision-making. WebFetch 1 attempt (Poki Top 10 detail) — GamerNotify article successfully accessed, supplementing portal data. However, direct portal visits remain site-dependent and unreliable (lesson maintained).

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
- **[Cycle 29]** Parallel Grep pattern works reliably with 27 games (8-language i18n). Validated 9 consecutive cycles (#21-2~#29). Approaching 30-game milestone — still no performance issues.
- **[Cycle 29]** 5 parallel web searches stable for 9 consecutive cycles (#21~#29). "Portal #1 game genre classification" served as decisive differentiator for 2 consecutive cycles (#28~#29) — portal ranking data established as one of three core trend evidence pillars alongside search volume and media assessments.
- **[Cycle 29]** action+puzzle selection achieves 5 consecutive cycles (#25~#29) all with different genre combinations — genre diversity maximization pattern sustained for 5 cycles.
- **[Cycle 29]** With postmortem + platform-wisdom + analyst-wisdom all included in prompt, file reads minimized. Validated 9 consecutive cycles (#21-2~#29). Only wisdom files need reading for updates.
- **[Cycle 30]** Parallel Grep pattern works reliably with 29 games (8-language i18n). Validated 10 consecutive cycles (#21-2~#30). 30-game milestone reached — Grep pattern stability at 30 games confirmed.
- **[Cycle 30]** 5 parallel web searches stable for 10 consecutive cycles (#21~#30). When action+casual is the sole minimum-count combination, "that genre's share within Poki Top 5" serves as the most effective supplementary evidence — necessity (minimum count) + marketability (portal popularity) dual axis.
- **[Cycle 30]** action+casual selection achieves 6 consecutive cycles (#25~#30) all with different genre combinations — genre diversity maximization pattern sustained for 6 cycles.
- **[Cycle 30]** With postmortem + platform-wisdom + analyst-wisdom all included in prompt, file reads minimized. Validated 10 consecutive cycles (#21-2~#30). Only wisdom files need reading for updates.
- **[Cycle 30]** With game #30, all 10 genre combinations now have at minimum 2 games — "minimum-count 1 combination resolution" phase complete. Starting Cycle 31, transition to new analysis framework (theme diversity, mechanic innovation, serialization potential, etc.) is needed.
- **[Cycle 31]** Parallel Grep pattern works reliably with 29 games (8-language i18n). Validated 11 consecutive cycles (#21-2~#31).
- **[Cycle 31]** Successfully introduced "theme diversity + market trend intensity + premium fit" tri-axis evaluation framework. Last 6 cycles unused genre filter → 2 candidates (puzzle+casual, action+strategy) → action+strategy overwhelmingly superior in premium fit. Tri-axis evaluation provides clear differentiation even in 8-way tie situations.
- **[Cycle 31]** First introduction of "unused theme matrix" analysis: Fantasy (6) / Neon (4) concentration → Steampunk new theme selected. Parallel genre + theme matrix analysis strengthens recommendation rationale from 2D to 3D.
- **[Cycle 31]** action+strategy selection achieves 7 consecutive cycles (#25~#31) all with different genre combinations — genre diversity maximization pattern sustained for 7 cycles.
- **[Cycle 31]** WebFetch successfully accessed GamerNotify Poki Top 10 article — direct portal visits remain risky, but game review/list sites are accessible. "Review site WebFetch + portal WebSearch" hybrid strategy validated for future use.
- **[Cycle 31]** With postmortem + platform-wisdom + analyst-wisdom all included in prompt, file reads minimized. Validated 11 consecutive cycles (#21-2~#31). Only wisdom files need reading for updates.

## Next Cycle Action Items 🎯
- Use `Grep "genre":\s*\[` + `-A 3` and `Grep "id":` in parallel as the standard for game-registry.json analysis (11-cycle validation)
- WebSearch 5 parallel + review site WebFetch hybrid strategy (Cycle 31 validated)
- Standardize genre combination matrix + **theme matrix** parallel analysis (introduced Cycle 31)
- Tri-axis evaluation framework (theme diversity + market trend intensity + premium fit) as standard
- "Last N cycles unused genre filter" → narrow candidates → premium fit for final selection pipeline
- Explicitly map previous cycle postmortem "weaknesses" to prevention plans in game recommendations
- Check for existing reports at the first step via Glob to prevent redundant work
- Maintain 4-file generation pattern: dual-language reports + dual-language wisdom updates
- Grep pattern confirmed stable at 29 games — no monitoring needed until ~40 games
- After steampunk theme introduction, update "unused themes" list: prehistoric, pirate, medieval, zombie, detective, desert, jungle, mecha, cooking, garden, samurai, western — 12+ unused themes remaining
- ironclad-vanguard (action+strategy) selection maintains 7-cycle genre diversification streak — apply "last 7 cycles unused genre filter" in Cycle 32
