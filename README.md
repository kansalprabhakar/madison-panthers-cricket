# Madison Panthers Cricket Hub 🏏

A responsive cricket scoreboard and **statistics question-answering chat** that runs entirely on GitHub Pages. No hosting bill, API key, backend or build step needed. **All included names and scores are illustrative DEMO data; replace them before publishing for your team.**


## Replace demo stats

- `data/players.json`: player ID, name, team, and playing role.
- `data/matches.json`: match ID, date, opponent, venue, innings totals, outcome. `oversFor` and `oversAgainst` use cricket notation (`19.4` means 19 overs and 4 balls).
- `data/fixtures.json`: upcoming fixture ID, date (`YYYY-MM-DD`), local start time (`HH:MM`), and optional opponent and venue.
- `data/announcements.json`: team announcements with an ID, date, title, and message.
- `data/performances.json`: one record per player **per match**. Record batting runs, balls, boundaries, whether dismissed; bowling overs, conceded runs, wickets; fielding catches, run outs, stumpings.

All records must link to a valid `playerId` and `matchId`. `overs` is cricket notation: `3.4` means 22 legal balls, **not** 3.4 decimal overs. Avoid double-counting run outs as bowler wickets; credited catches refer to fielders. Batting average = runs / dismissals (undefined with zero dismissals); strike rate = runs / balls faced × 100; bowling economy = conceded runs / legal balls × 6. This simple model does not currently record extras, DNB innings separately, live ball-by-ball events, bowling average/strike rate, or partnerships. Player run totals need not match innings totals because extras may exist.

## Current features

- Season match totals, recorded player runs, wickets and wins.
- Leaderboards for runs, wickets, catches, boundaries, batting strike rate, batting average, economy, run outs and stumpings.
- Completed result cards, tabbed upcoming fixtures and team announcements, and player performance summaries.
- Chat answers for player statistics, comparisons, roster listings, upcoming game time and venue, and listed participants.
- Responsive mobile display and zero external JavaScript libraries.

## Important limitations and future upgrade path

- **This is not a general AI model**: the chat recognizes common cricket questions and computes deterministic answers from JSON. It does not support arbitrary player conversations or non-cricket queries.
- Static GitHub Pages content is public and **cannot securely protect an AI API key** or accept private score updates directly.
- For live score entry, editor authentication, private data, and AI-generated answers, add a small backend (e.g. Azure Functions / Container Apps / AKS) with a database (Postgres), authenticated scorekeeper API, and LLM integration that calls validated stat query functions. Never put LLM or database credentials in JavaScript deployed to Pages.
- For a production-ready app add match-score reconciliation, innings and extras handling, scorekeeper audit, player name disambiguation, validation, and tests.
