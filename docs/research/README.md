# Research summary

Six research agents ran on 2026-11-13. Each report labels its claims as verified (read at a primary source), reported (secondary or vendor), or the agent's own inference or proposal. This page gives the conclusions, what was re-checked afterwards, and the known gaps.

## The reports

| File | Covers |
|---|---|
| `01-competitors.md` | 28 builders, how each one works, who is closest to this idea |
| `02-users-and-market.md` | What users complain about, who would buy, costs and margins |
| `03-libraries-and-stack.md` | json-render in depth, alternatives, block licences, recommended stack |
| `04-decision-engine.md` | Decision models, fast LLMs, the text problem, a speed and cost budget |
| `05-design-quality.md` | How to make every result look designed, with variety |
| `06-long-tail-and-bets.md` | How a library gets past "marketing sites only", ten ranked bets |

## Main conclusions

- **Nobody sells this yet.** No commercial product was found that builds sites with a decision model. Only three tiny open-source demos exist.
- **Relume is the closest competitor.** Its site says the AI does not write raw code and selects from designer-built components. It uses an LLM, takes minutes and targets designers.
- **Vercel could ship it.** It has json-render, an experimental Jev composer, and v0's users.
- **Decision models are a category now.** TypeSafe (Jev), Google, OpenAI and Cloudflare each sell one, at $0.04 to $0.10 per million input tokens. No single vendor is a dependency risk, and access to one is not an advantage.
- **The strongest evidence against the idea.** Glide and Softr both moved toward generated code in 2026, and Wix retired its rule-based builder in 2024. Softr reported that builders used its AI-coded block for almost everything, including standard tables.
- **The answer to that evidence.** Make the instant library path the default, and when a request misses, have a coding agent write a new block once, check it, and add it to the library for everyone. No product was found that shares generated blocks across users.
- **Speed and cost (estimated, not measured).** A complete-looking page in under 0.5 seconds, tailored text by about 0.9 seconds, $0.002 to $0.005 per site, edits in about 0.3 seconds.
- **Taste.** Variety should come from a small set of style families multiplied by a few axes (type pairing, palette strategy, imagery, hero layout, grid, density), not from more block types.
- **Licences.** Most paid block kits forbid use inside a website builder. The usable free sources are listed in report 03, section 3.
- **Users' top pains with code-writing builders.** Paying credits for the AI's own mistakes, security incidents, and edits that break unrelated parts.
- **Best customers.** Agencies and platforms that need many sites, then marketers at startups and small businesses.

## Re-checked at the source on 2026-11-14

| Claim | Result |
|---|---|
| Relume's page says "The AI does not write raw code. It selects from components our designers built and maintain" | Confirmed |
| Glide said agents "struggled to reliably produce good applications" through its JSON layer, and quality "improved substantially" with code access (post dated 4 Aug 2026) | Confirmed |
| Softr's 9 Nov 2026 post: custom AI frontends on its own backend; "We vibe code your frontend. We don't vibe code your backend." | Confirmed. The report's phrase "only come in predefined shapes" is not on the page; the real wording is "a brick only comes in the shapes someone designed" |
| Softr builders used the AI-coded block "for almost everything, including the standard tables, forms and lists" | Confirmed |
| Google announced Gemini Decision 1 on 11 Nov 2026 at $0.10 per million input tokens, 150 to 250 ms | Confirmed |
| OpenAI has a Decisions API with up to 400 questions per request and free output | Confirmed |
| Cloudflare offers the decision model clef-flash at $0.038 per million input tokens, up to 64 questions | Confirmed |
| TypeSafe raised $870M at a $7.5B valuation, led by Andreessen Horowitz | Confirmed. The page shows 9 Oct 2026; its metadata shows 12 Nov 2026 |
| Lovable exposed public projects' chats and code from 3 Feb to 20 Apr 2026 | Partly. Lovable's wording is that they "could potentially be accessed by any Lovable user provided they had a project link" |
| Vision models agree with designers at most 0.55 (the TASTE paper) | Partly. The figure is an average over nine criteria for graphic design, and covers image scorers as well as vision models |
| ChatGPT hosts sites for Plus and Pro users since July 2026 | Not verified. The page refused to load |
| json-render's composer limits | Both reports are right about different things: the library defaults to 32 steps, 32 elements and depth 8; the public playground caps at 14 |
| Tambo's hosted service shut down on 31 Oct 2026 | Confirmed in its README |

Also checked directly: json-render v0.22.0 contains `experimental_composeSpec`, and its documentation describes the Jev composer. Vercel's UI SDK (`vercel-labs/ui`, beta since 12 Nov 2026) is a library of headless behaviors such as focus, popups and keyboard navigation. It generates nothing.

## Gaps

- The agents ran out of web-search budget partway through. Later sections of several reports rely on pages fetched directly and on older knowledge.
- Reddit could not be reached, so the user complaints come from Trustpilot, vendor forums and press.
- Not covered: Shopify, GoDaddy Airo, Elementor and WordPress.com, Jimdo, B12 and several newer builders. A direct competitor could be among them.
- No speed figure was measured. No paid model call was made.
- "A few dozen capability blocks cover 80 to 90 percent of small-business sites" is one agent's guess. No primary data was found.
- Most competitor revenue figures come from a single source.
- No trademark search was done for any name.

## Looked up after the reports (2026-11-14)

- **Polar.** Its documentation says an individual without a company can be paid out, and lists Armenia as a supported payout country. Payouts go through Stripe to a bank account in the seller's country. Fees were reported as 5% plus $0.50 per sale on the free plan; check the live pricing page.
- **Paddle.** Individuals are not excluded, but onboarding is reported as stricter. Armenia's status was not confirmed.
- **Monet.Design.** Calls itself open source, but its repository has no licence file, so there is no permission to reuse its components.
