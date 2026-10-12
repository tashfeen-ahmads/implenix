# G4-fundamentals: SERP gap research and fixes

Date: 2026-10-12. Group keywords: what is a rag ai agent | what is mcp ai agent | what is llm ai agent | what are the different types of ai agents | what are four core characteristics of an ai agent | who invented ai agents | does google have an ai agent | can ai agents talk to each other | what are ai agents crypto | how agentic ai and agi are connected | what are the ethical considerations when using ai agents

## Research limits (read first)

- **WebFetch was blocked.** The environment's egress proxy refused CONNECT to every competitor host I tried (ibm.com, cloudflare.com, hostinger.com, hellotars.com). So I could not open competitor pages to measure word counts, read full H2/H3 outlines, or inspect JSON-LD. The competitor notes below come from WebSearch result summaries (titles, URLs, quoted passages). To enable fetching, add the hosts under Allowed domains in the environment's Network access settings, or switch to a broader access level.
- **No SERP features.** The search tool does not show AI Overviews, People Also Ask, or featured snippets. In the PAA-style coverage below, the questions are the related questions the competitor pages answer, not live PAA boxes.
- **Citations.** Every outbound link I added points to a primary or authoritative source that I confirmed through search results (URL, title, and the quoted claim). I could not load the pages in full, so the owner should spot-check each link before launch. I added **no numeric statistics**. I saw usage and market-cap figures in results (MCP downloads, Invoca's call surge, token market caps) and left them out because I could not open their sources.

## Decision: one post for "what is mcp / llm / rag ai agent"

**One post, `/blog/rag-llm-mcp-ai-agent-architecture`, serves all three intents. Each keyword gets its own H2, written as the exact question, with its own `<Answer>` block of about 55-65 words directly under it.**

Why:
- The SERP shows definitional intent for all three. The ranking pages for each are single-concept explainers, but the concepts depend on each other. A RAG agent and an MCP agent are both LLM agents, and buyers search all three together. One strong page with three answer-first sections is more helpful than three thin pages that repeat each other, and the spam guidance on scaled thin content points the same way.
- Each section is deep enough to stand alone: components, how it works, versus-comparisons, and when it fits. AI engines can pull out each `<Answer>` block on its own, since they carry `data-answer` and `data-speakable`.
- If Search Console later shows "what is mcp ai agent" stuck below page 1 while the others rank, MCP is the one most likely to deserve its own post. Its SERP is dominated by protocol explainers (Cloudflare, vendor docs) with their own sub-intents: MCP vs API, MCP servers, and security. If it comes to that, spin it out and keep a summary plus a link here.

The other two multi-keyword pages follow the same pattern:
- `multi-agent-systems-crypto-agi` (talk to each other / crypto / AGI): one post, three H2s, each with its own `<Answer>` block. The three intents are unrelated, so this page is weaker than the RAG/LLM/MCP one. If any of them matters commercially, "can ai agents talk to each other" is the best candidate for its own post, because it ties to AI calling AI receptionists.
- "Four core characteristics" lives in `types-of-ai-agents-explained` as its own H2 with an answer paragraph. It is too narrow for its own post, and it is a natural follow-on to the types question.

---

## 1. what is llm ai agent / what is a rag ai agent / what is mcp ai agent

**Our URL:** /blog/rag-llm-mcp-ai-agent-architecture

**SERP:** Definitional explainers. RAG: hellotars.com, gigaspaces.com, IBM (agentic RAG), Coursera, hireinsouth.com. MCP: cloudflare.com/learning, atricore.com (MCP vs agent), aftership docs, vectorize docs, railpush. LLM: hostinger.com (many locale copies), mindstudio.ai, designveloper.com.
- IBM and Coursera cover agentic RAG vs traditional RAG; we did not.
- Cloudflare and the vendor docs cover host/client/server, tools/resources/prompts, and who created MCP and when; we did not.
- Hostinger covers LLM-agent components (planning, memory, tools, reflection) and LLM vs agent; we were thin here.

**Gaps found:** no question-phrased H2 per keyword; no answer block per keyword; no MCP origin (Anthropic, Nov 2024; Linux Foundation, Dec 2025); no MCP architecture; no MCP vs API or MCP vs A2A; no MCP security; no RAG pipeline steps (chunk, embed, vector DB, retrieve); no agentic RAG; no RAG vs fine-tuning; no LLM agent components; no LLM vs LLM agent. Zero internal links, zero citations, and an unsourced "prompt engineering is 80 percent" claim.

**Changed:** Rewrote the post.
- Title, meta title (48 chars), and meta description (145 chars) now name all three terms.
- Three question H2s, each with an `<Answer>` block.
- New subsections: LLM agent parts, LLM vs LLM agent, RAG step by step, traditional vs agentic RAG, RAG vs fine-tuning, RAG failure mode, MCP host/client/server and tools/resources/prompts, MCP vs API, MCP vs A2A, and MCP security.
- Side-by-side ComparisonTable.
- 4 citations: ReAct (arXiv 2210.03629), Lewis et al. RAG (arXiv 2005.11401), Anthropic's MCP launch post, and Anthropic's MCP donation post.
- 8 internal links: prompts post, multi-agent post, CRM/ERP/BI integration post, types post, /how-does-an-ai-receptionist-work, /glossary/voice-ai, /try-it, /contact.
- Removed the 80 percent claim. CTA with "live in 72 hours".

**Left:** An architecture diagram image would help. It needs a designer or an SVG.

## 2. what are the different types of ai agents

**Our URL:** /blog/types-of-ai-agents-explained

**SERP:** domo.com, lenovo.com, wscubetech.com ("7 types"), prakashinfotech, pickl.ai, and IBM. Competitors win by giving each classic type a definition plus an everyday example. Some (Domo) add reactive, deliberative, hybrid, and autonomous types.

**Gaps found:** Our page said Russell and Norvig list seven types. That is a factual error: the textbook has five, and multi-agent and hierarchical are later additions. The classic types had no examples. A ChatGPT FAQ still referred to plugins, which are outdated. There were no internal links, and the answer block was 90+ words.

**Changed:**
- Fixed the taxonomy (five textbook types plus two common additions) and gave each type an everyday example.
- New 47-word answer block.
- New title, meta title, and meta description.
- FAQs: "how many types", "what type is an AI receptionist", and an updated ChatGPT agent answer (July 2025).
- Links to /ai-receptionist-for-dentists, /ai-receptionist-for-hvac-companies, /what-is-an-ai-receptionist, the RAG/LLM/MCP post, /blog/what-is-agentic-ai, /try-it, and /contact.

## 3. what are four core characteristics of an ai agent

**Our URL:** /blog/types-of-ai-agents-explained, new H2 "What are the four core characteristics of an AI agent?"

**SERP:** educative.io owns the snippet-style answer: autonomy, perception, reasoning, action. tencentcloud gives the academic list: autonomy, reactivity, proactiveness, social ability. unity-connect has a "10 characteristics" list, and akamai has a glossary entry.

**Gaps found:** Intent mismatch. Our "four characteristics" section was our own operator checklist (goal, tools, escalation, observability), which is not what searchers want.

**Changed:**
- Added a question H2 that answers with autonomy, perception, reasoning, and action.
- Gave the academic source: Wooldridge and Jennings 1995 (autonomy, social ability, reactivity, pro-activeness), cited to the Cambridge journal page.
- Mapped the two lists onto each other and added a table showing each characteristic on a business phone line.
- Renamed the old section "Four properties of a well-scoped production agent" so it no longer competes with the new one.

## 4. who invented ai agents

**Our URL:** /blog/who-invented-ai-agents (drip-scheduled for 2026-11-04, not live yet)

**SERP:** IBM "evolution of AI agents", ema.ai, techademy, gaas.it.com, projectwet.org, and two arXiv papers. IBM-style pages credit Turing, Selfridge's Pandemonium, Wiener's cybernetics, and the Logic Theorist, and they use a timeline format.

**Gaps found:**
- No timeline.
- Missing Turing 1950, Shakey (SRI, 1966-1972, the usual "first agent" answer), Hewitt's actor model, Wooldridge and Jennings 1995, and BDI.
- The A2A date was wrong ("2024-2025"; it launched April 2025).
- The Roomba wording implied an MIT robot.
- The link to /blog/what-is-agentic-ai was plain text, not a link.
- No citations.

**Changed:**
- New 60-word answer block, a dated timeline list, and Turing, Shakey (cited to SRI), the actor model, the Wooldridge-Jennings definition (cited), BDI, and 2025-2026 agent products.
- Fixed the A2A and MCP dates and the Roomba wording.
- Cited ReAct and Lewis et al.
- New FAQs: "What was the first AI agent?" and "Who invented agentic AI?". Removed the patent FAQ, which could not be supported.
- Links to the types, RAG/LLM/MCP, and what-is-agentic-ai posts, plus /try-it.
- I did not link to the Google post, which publishes a week later. That link would 404 until then.

## 5. does google have an ai agent

**Our URL:** /blog/does-google-have-an-ai-agent (drip-scheduled for 2026-11-11)

**SERP:** Very fresh, news-led results. On 2026-10-08 Google Cloud announced the "Gemini agent" for work, covered by thestar, 9to5google, siliconangle, and blog.google. Older results include TechCrunch on Project Mariner and MIT Tech Review on Astra.

**Gaps found:** The post was stale.
- It was missing the Gemini agent for work (Oct 2026).
- It was missing Gemini Agent, which absorbed Project Mariner after the May 2026 shutdown.
- It still used the Vertex AI Agent Builder name. That product became the Gemini Enterprise Agent Platform at Cloud Next in April 2026.
- It was missing the Customer Engagement Suite, Google's real contact-center voice/chat agents. That contradicted the "Google does not do this at all" framing.
- Biggest gap for our audience: it was missing Google Search's AI that phones local businesses for pricing (US, from 2025).
- The "Google Business Profile Call History" section could not be verified as current.

**Changed:**
- Rewrote the post: new answer block, title, meta title (52 chars), and meta description (156 chars).
- Lineup table, plus sections for each product above.
- A Duplex-to-AI-calling section that ties to answering every call: Google's AI may be calling your front desk.
- Removed the Call History section.
- 2 citations: the blog.google Gemini at Work post and the Search Engine Journal story on AI calling.
- New FAQs: name of Google's AI agent, free agent, what happened to Vertex AI Agent Builder, opting out of AI calls.
- Links to /, the HVAC, dentists, and law-firms industry pages, the hang-up post, the best-voice-agent post, the RAG/LLM/MCP post, the multi-agent post, /try-it, and /contact.

**Left:**
- The Gemini Enterprise Agent Platform rename and the Customer Engagement Suite details come from secondary coverage. Verify them against Google Cloud release notes before 2026-11-11.
- Re-check the Gemini agent's availability and pricing just before publish, because this topic changes monthly.

## 6. can ai agents talk to each other

**Our URL:** /blog/multi-agent-systems-crypto-agi (first H2)

**SERP:** towardsdatascience (Google A2A explainer), gaas.it.com, dev.to, softude (interoperability), nexscope (A2A guide), and blog.sista.ai. Competitors cover the A2A details: April 2025 launch, Linux Foundation, agent cards and tasks, how A2A differs from MCP, the communication patterns, and the hard parts (identity, context, failure).

**Gaps found:** We only had a two-sentence answer on interoperability. Missing: how agents communicate, A2A details and backers, the A2A vs MCP difference, the risks, and our own angle (AI calling AI receptionists).

**Changed:**
- New per-section `<Answer>` block.
- Subsections: how agents communicate, A2A and MCP (cited to SD Times on the Linux Foundation move), what goes wrong, and "When an AI agent calls your AI receptionist".
- FAQ: "Can two AI voice agents have a phone conversation?"
- Retitled the post and its meta so this question leads.

## 7. what are ai agents crypto

**Our URL:** same post, second H2

**SERP:** decrypt.co, chain.link, newton.co, kucoin, onekey, itiger. These are mostly exchange and crypto-media pages. They name specific projects and list AI coins.

**Gaps found:** We did not separate AI agents that use crypto from "AI agent tokens", which is the main source of confusion. We named no real projects and gave no infrastructure examples.

**Changed:**
- New `<Answer>` block.
- Explained agent vs token.
- Named Truth Terminal, ElizaOS (formerly ai16z), and Virtuals Protocol, with no price or market-cap figures.
- Covered Coinbase x402 (May 2025), cited to The Block.
- Not-financial-advice FAQ.

**Left:** I chose not to add a token list or market data. That fits the brand, and the figures could not be verified.

## 8. how agentic ai and agi are connected

**Our URL:** same post, third H2

**SERP:** educative.io has an exact-match title. Also vegavid (two pages), retellai.com "agentic AI vs AGI" in many locales (a voice-AI competitor), and arXiv 2504.18875.

**Gaps found:** No AGI definition framework, and nothing explaining why autonomy is the link.

**Changed:**
- New `<Answer>` block.
- Added Google DeepMind's "Levels of AGI" (arXiv 2311.02462), which treats autonomy as its own axis separate from performance and generality. That is used as the explanation of the connection.
- Link to /blog/what-is-agentic-ai (G3's page, linked only, not edited).
- FAQ: "Is ChatGPT AGI?"

## 9. what are the ethical considerations when using ai agents

**Our URL:** /blog/ethical-considerations-ai-agents

**SERP:** arXiv 2503.12687, Infosys BPM (bias, accountability, transparency), gaas.it.com, forwardfuture, an FAU/AI and Ethics 2026 paper, agentx.so, and KodeKloud. Competitors frame the topic with general principles: privacy, bias and fairness, autonomy and oversight, accountability and transparency, and non-maleficence. Our page was phone-specific and missed accountability and the risks that come from agents taking actions.

**Gaps found:**
- No principles framing and no accountability section.
- No agent-specific risks (excessive agency, prompt injection, irreversible actions).
- No regulation specifics: the EU AI Act Art. 50 date and the FCC AI-voice TCPA ruling.
- The sensitive-conversations post was mentioned but not linked. Few internal links overall.

**Changed:**
- New 59-word answer block and new title and meta.
- New H2 "Why AI agents raise different ethical questions than chatbots", with a principle-to-practice table, citing Hahn, Tretter and Dabrock 2026.
- New H2 "Risks specific to agents that take actions", naming OWASP LLM Top 10 risks without a link. It cites the FCC ruling via Cooley, and the disclosure section cites the EU AI Act Art. 50 (2 Aug 2026) via Cooley.
- Checklist grew from 8 to 10 items.
- New FAQs: who is responsible for mistakes, and is replacing a receptionist ethical.
- Links to the sensitive-conversations post, the workplace post, the outbound-calling post, /ai-receptionist-vs-human-receptionist, /contact, and /try-it.

**Left:** The owner should confirm the claims about Implenix practice: disclosure in every greeting, transfer on request, and a written escalation protocol in every deployment. The post already said this before my edit.

---

## Shared-file changes I did not make (recommendations)

1. **`lib/blogTopics.ts`:** add `who-invented-ai-agents` and `does-google-have-an-ai-agent` to the `agentic-ai` hub's `postSlugs`. Neither is in any hub today, so neither gets hub backlinks or breadcrumbs.
2. **Freshness signal:** `contentlayer.config` has no `updatedAt` field, and `blogPostingSchema` takes no `dateModified`. Four live posts were substantially rewritten today but will still show their July-September dates. Suggest an optional `updatedAt` frontmatter field, passed through as `dateModified` and shown on the page.
3. **FAQ schema for blog posts:** posts have FAQ sections but emit no `FAQPage` JSON-LD. That is optional; it won't produce rich results for us, but AI engines can still use it.
4. **Bylines:** every post's `authorBio` says "six years shipping AI voice agents". The owner should confirm this is accurate, since it is the main E-E-A-T claim.

## Files edited

- content/blog/rag-llm-mcp-ai-agent-architecture.mdx
- content/blog/types-of-ai-agents-explained.mdx
- content/blog/who-invented-ai-agents.mdx
- content/blog/does-google-have-an-ai-agent.mdx
- content/blog/multi-agent-systems-crypto-agi.mdx
- content/blog/ethical-considerations-ai-agents.mdx

Checks run:
- All 6 files compile with @mdx-js/mdx and the YAML frontmatter parses.
- Every internal link resolves to an existing route or a post that is already published.
- No em dashes, no prices, no new statistics.
- Meta titles are 44-56 characters and meta descriptions 145-157 characters.
