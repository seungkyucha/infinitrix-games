# Analyst Cumulative Wisdom
_Last updated: Cycle #21 (2nd update)_

## Recurring Mistakes 🚫
- **[Cycle 21]** Major game portals (CrazyGames, itch.io) block direct crawling (WebFetch) with 403/404. Future analyses should use search engine-based indirect surveys + specific tag pages (itch.io/games/html5/tag-*) rather than direct site visits.
- **[Cycle 21]** game-registry.json exceeds 10,000 tokens and fails full read. 19 games each with 8-language i18n bloat the file. Use Grep to extract only id/genre/title as the first step in future cycles.
- **[Cycle 21-2]** When a previous cycle report already exists, check it first to avoid redundant analysis. cycle-21-report.md already existed but was overwritten — in future, check for existing reports first and only update sections that need changes.

## Validated Success Patterns ✅
- **[Cycle 21]** Genre combination matrix analysis (arcade×action, puzzle×strategy, etc.) identifies gaps more precisely than simple genre counting. The discovery that puzzle+strategy has 0 games became the core rationale for the final recommendation.
- **[Cycle 21]** Mapping platform-wisdom.md cumulative lessons into "previous issue → prevention plan" tables enables concrete preemptive items in the recommended game's spec.
- **[Cycle 21]** Running 3 parallel web searches (general trends + genre-specific + sub-genre specific) yields much richer market data compared to a single search.
- **[Cycle 21-2]** Using Grep pattern (`"genre":\s*\[` + `-A 3`) extracts genre data precisely for all 19 games in one pass. More precise than the previous `"id"|"genre"|"title"` pattern and reduces unnecessary i18n title data.
- **[Cycle 21-2]** Having postmortem data directly included in the prompt enables perfect integration of previous cycle learnings without separate file reads — confirms efficiency of system prompt design.

## Next Cycle Action Items 🎯
- Use `Grep "genre":\s*\[` + `-A 3` as the standard pattern for game-registry.json analysis (id/title via separate Grep only when needed)
- Use `WebSearch "site:itch.io HTML5 tag-[genre]"` pattern instead of direct portal visits for indirect surveys
- Standardize genre combination matrix as an analysis tool every cycle
- Maintain "genre gap coverage" as the #1 criterion when selecting recommended games (platform diversity is most important for user acquisition)
- Explicitly map previous cycle postmortem "weaknesses" to prevention plans in game recommendations
- Check for existing reports at the first step to prevent redundant work
- If puzzle+strategy gap is filled this cycle, prioritize puzzle+action or arcade+strategy gaps in the next cycle
