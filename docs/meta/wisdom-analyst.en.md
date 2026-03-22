# Analyst Cumulative Wisdom
_Last updated: Cycle #23_

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
- **[Cycle 22]** Running Grep genre extraction + id extraction in parallel maps all 20 games' ids and genres in a single pass. Works reliably despite game-registry.json bloat (20 games + 8-language i18n).
- **[Cycle 22]** Expanding web searches to 5 parallel queries (general trends + itch.io arcade/strategy + action/casual + arcade+strategy hybrids + puzzle+action hybrids) provides specific market evidence per gap genre. Hybrid genre searches especially strengthen trend alignment rationale for recommendations.
- **[Cycle 22]** Pre-checking existing reports via Glob is now an established pattern. Confirmed cycle-22 non-existence before creating new files, achieving 0 redundant work.
- **[Cycle 23]** Parallel Grep pattern (`"id":` + `"genre":\s*\[` -A 3) works reliably even with 21 games (8-language i18n). No pipeline changes needed as game count grows.
- **[Cycle 23]** When postmortem + platform-wisdom + analyst-wisdom are all included in the prompt, 0 file reads are needed for previous learning integration. Validated 3 consecutive cycles (#21-2, #22, #23).
- **[Cycle 23]** For dual-language (KO/EN) report generation, completing the Korean report first then writing both simultaneously ensures consistency + time savings. Translation quality is stable due to identical structure.
- **[Cycle 23]** After arcade+strategy gap was filled (#22), pivoting to puzzle+action as top priority proved strongly supported by both genre matrix analysis and market trends (puzzle roguelike as 2025's top genre).

## Next Cycle Action Items 🎯
- Use `Grep "genre":\s*\[` + `-A 3` and `Grep "id":` in parallel as the standard for game-registry.json analysis
- Use `WebSearch "site:itch.io HTML5 tag-[genre]"` pattern instead of direct portal visits for indirect surveys
- Standardize genre combination matrix as an analysis tool every cycle
- Maintain "genre gap coverage" as the #1 criterion when selecting recommended games (platform diversity is most important for user acquisition)
- Explicitly map previous cycle postmortem "weaknesses" to prevention plans in game recommendations
- Check for existing reports at the first step via Glob to prevent redundant work
- If arcade+strategy gap is filled this cycle, prioritize **puzzle+action** or **action+casual** gaps in the next cycle
- Add hybrid genre searches (e.g., "HTML5 arcade strategy hybrid games") to strengthen recommendation rationale
- If puzzle+action gap is filled in cycle #23, prioritize **action+casual** (0 games) gap in the next cycle
- Maintain KO-first → simultaneous EN Write as the standard pattern for dual-language reports
- Monitor Grep pattern performance limits when game count exceeds 25 (currently stable at 21)
