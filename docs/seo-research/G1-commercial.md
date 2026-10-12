# G1-commercial: SERP gap research and fixes

Date: 2026-10-12. Agent group: G1-commercial.

## Method and limits (read first)
- SERP research used WebSearch (standard plus extended). **WebFetch and direct HTTP were blocked in this environment** (DNS failure / egress proxy 403 on every competitor domain, including developers.google.com). So competitor word counts, H2 outlines, and JSON-LD could not be read directly. Competitor notes below come from search-result summaries, not from opening the pages.
- The search tool does not show SERP features (AI Overview, PAA box, featured snippet). They are listed as "not observable" below. PAA-style questions were inferred from the questions competitors answer and added as H2s or FAQ entries.
- **Outbound links added (5): ABA (2), NAR (2), FINRA (1), Cambridge (1), Zenoti (1).** These are authoritative or primary pages that showed up in search results. **None was opened**, so the owner should click each one before launch. No new statistics were added anywhere. The only number added is the owner-approved IVR hang-up range of 40-60%.
- No build was run. All 8 edited MDX files compile with @mdx-js/mdx, and their frontmatter parses as YAML. The homepage TSX transpiles cleanly.

## Cross-cutting issues for the owner (shared files, not edited)
1. **Homepage aggregateRating**: `softwareApplicationSchema({ ratingValue: 5, ratingCount: 6 })` in app/(site)/page.tsx outputs a 5.0 rating that nobody actually gave. It is built from 6 testimonials that carry no star ratings. This conflicts with the "never invent ratings" rule and with Google's review-snippet policies, which treat this as self-serving review markup and can bring a manual action. Recommendation: call `softwareApplicationSchema()` with no rating. This is a schema change, not copy, so it was left alone.
2. **Blog posts emit no FAQPage schema.** The blog template (app/(site)/blog/[slug]/page.tsx) only emits BlogPosting, HowTo and Speakable. All 8 posts have FAQ sections. Suggestion: an optional `faq` frontmatter field, or parse `**Q**` blocks, and feed it to `faqSchema`. That helps AI engines; FAQ rich results are restricted, so don't expect them.
3. **No heading IDs.** There is no rehype-slug, so in-page anchors (#section) don't work. Adding it in contentlayer.config would allow "jump to" links and a table of contents.
4. **No `updatedAt` / dateModified field.** Several posts were substantially refreshed today, but the schema still shows only datePublished. Suggestion: add `updatedAt` to BlogPost and pass it to `blogPostingSchema`.
5. **The billing message is inconsistent across posts.** The homepage says "no per-minute billing that punishes growth". The voice-agent explainer says "fixed monthly beats per-minute". best-ai-voice-agent and the cost post call per-minute "the most transparent model". Pick one position. The one market-billing line in the HVAC FAQ was neutralized.
6. **Unsourced first-party stats already in these posts were kept and need owner confirmation.** I didn't add them, and they need either a source or "in our deployments" framing:
   - HVAC: answer rates 58-71%, 47-minute callback, 15-22% quote recovery, 8-14 day payback
   - Real estate: "Zillow's own data shows conversion drops sharply past five minutes" (attributed to Zillow, no link), 60-70% missed-call recovery
   - Lawyers: legal answering service $600-1,400/mo, 2-5 conflicts per 100 intakes
   - Medspa: 12-22 point renewal lift
   - Finance: P&C break-even 60-90 days
   - Cost: 60% per-minute drop. I removed an unsourced forecast of a further 40-50% drop.
   - Homepage FAQ: 20-30% of callers notice it's AI, 70-90% / 10-30% split, transfer "within 30 seconds"
   - Best voice agent: "a hundred small businesses"
7. **Market price ranges.** The best-voice-agent, cost and explainer posts give *market* tier ranges ($50-2,500+/mo). I added explicit "market ranges, not an Implenix price list / not a quote" framing wherever a figure could be read as ours. Owner: confirm you're comfortable publishing market ranges at all.
8. The explainer (what-is-a-voice-ai-agent...) is scheduled for 2027-01-06, and can-ai-agents-identify-vulnerable-customers for 2026-11-18. Links to both would 404 until they publish, so I didn't link to them from live posts.

---

## 1. ai receptionist
- **Our URL:** `/` (app/(site)/page.tsx)
- **SERP features:** not observable. The SERP is heavy on definitions and guides (glossaries, "what is" guides, vendor product pages), so there is a strong definitional or AI Overview intent.
- **Competitors:**
  - flick.social glossary, myaifrontdesk "what is": short definitions with benefits lists.
  - bluehost.com "What is an AI receptionist + best tools 2026": definition, how it works and a tool list in one page.
  - loman.ai "Understanding AI receptionist": applications and future.
  - dev.to architecture piece: the STT, NLP, TTS technical stack.
  - Small-business variants (getnextphone, lifeinside, upfirst): cost models (flat, per-call, per-minute), "is it worth it", and a missed-inquiries rule of thumb.
- **Gaps:**
  - The homepage already has an answer-first "What is an AI receptionist?" block, FAQ schema, a comparison section and ROI calculator, so it's strong.
  - Missing PAA-style answers: whether it's worth it, call transfer, and honest limitations/downsides. Competitors cover these; the limitations answer is also an E-E-A-T signal.
- **Changed:** Added 3 HOME_FAQS entries (worth it for a small business, transferring calls to the team, limitations). They also flow into the existing FAQPage schema. Title and meta were already fine (45 / 156 chars), so they're unchanged.
- **Left:** The aggregateRating issue (cross-cutting #1). The "/ai-receptionist-vs-answering-service" reference inside FAQ text is plain text, not a link, because the FAQ renders as plain text. A video or real call recording near the top would match competitors' demos; recordings already exist in TestimonialsSection.

## 2. hvac ai agent
- **Our URL:** `/blog/hvac-ai-agent-guide`
- **SERP features:** not observable. The SERP is mixed: voice/intake agents (Voiceflow, Hyperleap), ops platforms (FieldCamp), Jotform tech-checklist agents, a building-control research PDF, and ACHR News.
- **Competitors:**
  - voiceflow.com/ai/hvac-technicians: 24/7 booking and emergency-scheduling landing page.
  - hyperleap.ai: after-hours emergency triage producing a structured job ticket.
  - fieldcamp.ai: frames the "full ops" agent (CS + dispatch + tech support) and notes that most HVAC AI covers only one slice.
  - agentzap / getaira / myaifrontdesk: ServiceTitan integration specifics and answering-service comparisons.
- **Gaps:**
  - No comparison against an answering service or voicemail.
  - Didn't address the other kinds of "HVAC AI agent" searchers find (dispatch, technician tools, building control).
  - Missing FAQs: ServiceTitan, answering service, setup time, heat-wave surge.
  - Weak internal links (only /try-it and /contact).
  - Two broken sentences.
- **Changed:**
  - Fixed the list item and run-on sentence.
  - Added an H2 "HVAC AI agent vs answering service vs voicemail" with a ComparisonTable.
  - Added an H2 "HVAC AI agents beyond the phone" (4 categories, honest scope, citing the Cambridge HVAC-control study).
  - Added 4 FAQs and neutralized the billing FAQ (custom pricing plus a link to the cost post).
  - Added internal links: /ai-receptionist-vs-answering-service, /blog/how-much-does-ai-agent-cost, /blog/how-to-calculate-your-missed-call-cost, /case-studies/pa-hvac-experts, /ai-receptionist-for-hvac-companies, /contact.
- **Left:** Owner stats (cross-cutting #6). A real recorded HVAC emergency call (already exists for PA HVAC Experts) embedded in the post would beat every competitor.

## 3. ai voice agent for real estate
- **Our URL:** `/blog/ai-voice-agent-real-estate`
- **SERP features:** not observable. The SERP is mostly vendor guides and listicles (groovyweb, callin.io, smallest.ai, cloudtalk, videosdk, myaifrontdesk "best of 2026", retellai "9 best").
- **Competitors:**
  - groovyweb: speed-to-lead callback on portal leads, with Fair Housing/TCPA mentions.
  - cloudtalk: digital front desk positioning.
  - videosdk: how it works (ASR/NLU) and CRM/MLS integrations, plus property-management use cases.
  - retellai / ainora / lumay: named-vendor comparison lists with Follow Up Boss, kvCORE and Sierra integrations.
- **Gaps:**
  - "Speed to lead" wording was missing.
  - No comparison of AI agent vs ISA vs agent answering.
  - No cost FAQ and no TCPA FAQ for AI calls.
  - Few internal links. A compliance list said "three" but listed four.
- **Changed:**
  - Retitled the H1 and meta to cover both keywords.
  - Added "speed to lead" framing.
  - Added the H2 "AI voice agent vs ISA vs answering your own phone" with a table.
  - Added FAQs: legality of AI calls (links the outbound guide), cost (custom, links the cost post), and "does it replace my ISA".
  - Fixed "three" to "four".
  - Added internal links: /blog/ai-outbound-calling-guide, /blog/how-much-does-ai-agent-cost, /blog/how-to-calculate-your-missed-call-cost, /case-studies/columbus-property, /ai-receptionist-for-real-estate, /contact.
- **Left:** A named-vendor comparison, if the owner wants to compete with listicles. The Zillow claim needs a source.

## 4. will ai replace real estate agents
- **Our URL:** same page, `/blog/ai-voice-agent-real-estate` (lib/industryToBlog.ts already labels it this way)
- **SERP features:** not observable. The intent is informational/opinion. Results: Inman (2023), Washingtonian, impactmybiz, adaface, brokermint, heygen (updated Sept 2026), NAR news ("Could AI put your job at risk", "AI becomes early step in homebuying journey"), and an Inman Sept 2026 article on the NAR tech report.
- **What competitors do better:**
  - Dedicated, task-by-task answers.
  - Data from NAR on buyer agent usage and agent AI adoption.
  - A "who is at risk" angle (less productive agents).
  - The point that buyers start research in AI tools.
- **Gaps:** Our page answered this only in a 4-line FAQ. There was no answer-first block, no task breakdown, no "who is at risk" section and no authoritative source.
- **Changed:**
  - New H2 "Will AI replace real estate agents?" with an answer-first `<Answer>` block of about 60 words.
  - A ComparisonTable of AI-handled vs licensed-agent tasks.
  - Three shifts: buyers starting with AI, ISA exposure, low-touch agents most exposed. Two NAR links support them.
  - The FAQ now points to that section.
- **Left:**
  - The cleanest win is a dedicated post for this keyword, with NAR data that someone has actually opened: buyer agent usage and the NAR 2026 Technology Report adoption figures. Search summaries reported 88% of buyers used an agent and 23% of agents use AI daily, but **these weren't verified, so they weren't added**.
  - Creating a new post was out of scope.

## 5. ai agents for medspas
- **Our URL:** `/blog/ai-agents-for-medspas`
- **SERP features:** not observable. The SERP is dominated by Zenoti's April 2026 "AI workforce" press release (and syndications), keragon.com/med-spa, schedulingkit voice and booking agent pages, plus guides like "10 best AI receptionists for med spas" (keragon, egma, futurocorp).
- **Competitors:**
  - Zenoti: a suite of agents across workflows (receptionist, lead response, scribe, disputes).
  - Keragon: BAA comparison table across vendors.
  - SchedulingKit: contraindication screening, which we deliberately don't do (a stronger compliance position).
- **Gaps:**
  - Plural "agents" intent: no landscape of agent types, and no advice on native PMS agents vs a dedicated voice agent.
  - No BAA-scope buying questions.
  - No FAQ on ad and Instagram lead response, AI disclosure or setup time.
  - Weak CTA ("call the number in the header") and two typos.
- **Changed:**
  - New H2 "The medspa AI agent landscape, and where voice fits" with a ComparisonTable, an honest note to test the native PMS receptionist first, and 2 vendor questions (BAA covers *this product*; native vs connector). Cites the Zenoti press release.
  - Added 3 FAQs and fixed the typos.
  - The CTA now goes to /try-it.
  - Added internal links: /blog/ai-voice-agents-healthcare-medicine, /blog/can-ai-handle-sensitive-conversations, /blog/how-to-calculate-your-missed-call-cost, /ai-receptionist-for-med-spas, /contact.
- **Left:** The renewal-lift stat needs owner confirmation. There's no medspa case study yet, which competitors also lack; a real one would be a differentiator.

## 6. ai agents for lawyers
- **Our URL:** `/blog/ai-agents-for-lawyers`
- **SERP features:** not observable. The SERP is about **legal-work agents**: mindstudio, the ABA Law Practice Magazine "Introduction to agentic AI for lawyers" (Mar-Apr 2026), eve.legal, aline, harvey.ai, 8am "best AI agents for law firms", morsoftware. Intake shows up only as one use case among many.
- **Competitors:**
  - The ABA piece: authority, and the "augment, not replace" framing.
  - harvey / eve: research, drafting and contract review depth.
  - 8am / morsoftware: named-platform lists (CoCounsel, Lexis+ Protégé, Spellbook, Clio).
  - cloudtalk "best AI voice agents for law firms" and counsel.marketing: intake-specific rules and limits.
- **Gaps:**
  - Intent mismatch: our page only covered intake.
  - No reference to ABA Formal Opinion 512 or Model Rule 1.18.
  - An overclaim ("every state bar that has weighed in has accepted this scope").
  - No "replace lawyers" FAQ and no answering-service comparison.
- **Changed:**
  - New H2 "The kinds of AI agents lawyers actually use", with a ComparisonTable of 5 agent types and where each one's risk sits. Cites the ABA agentic AI article and positions Implenix as intake-only.
  - The compliance item now cites ABA Formal Opinion 512 (July 2024) and notes that no bar rulebook exists for voice intake. Added Model Rule 1.18 for prospective clients.
  - Replaced the overclaim with accurate wording.
  - Added 2 FAQs.
  - New meta description.
  - The CTA now goes to /try-it.
  - Added internal links: /ai-receptionist-vs-answering-service, /blog/ethical-considerations-ai-agents, /blog/can-ai-handle-sensitive-conversations, /ai-receptionist-for-law-firms, /contact.
- **Left:** The legal-answering-service price range and the conflict-rate stat need confirmation. A lawyer or ethics reviewer quote would strengthen E-E-A-T.

## 7. ai agents finance
- **Our URL:** `/blog/ai-agents-for-finance`
- **SERP features:** not observable. The SERP is about **back-office finance agents**: hebbia, textcortex, arya.ai, zeni, bardeen, the Hackett Group glossary, monday.com, investglass. Topics are AP, reconciliation, close, forecasting, fraud/KYC and credit memos.
- **What competitors do better:** Definition-first content, back-office use-case breadth, and benefit framing.
- **Gaps:**
  - Intent mismatch: our page covered only client-facing intake for mortgage, RIA and insurance.
  - No recordkeeping specifics.
  - No "replace advisors" FAQ.
  - A comma-splice CTA.
- **Changed:**
  - New H2 "AI agents in finance: back office vs the front door", with a ComparisonTable of tasks, users, risk and controls, and what Implenix builds.
  - The data-retention item now names FINRA Rule 4511 (linked), SEC 17a-4 and SEC 204-2, and tells readers to confirm with their CCO.
  - Added 3 FAQs (replacing advisors, recording and retention, vulnerable callers, which links the sensitive-conversations post).
  - New meta description.
  - Added internal links: /ai-receptionist-for-mortgage-brokers, /ai-receptionist-for-insurance-agents, /ai-receptionist-for-accountants, /blog/ai-outbound-calling-guide, /blog/can-ai-handle-sensitive-conversations, /contact.
- **Left:**
  - We'll never fully match back-office intent with a voice page. Consider whether "ai agents finance" is worth targeting with this URL, or whether to accept the long-tail variants ("ai agents for financial advisors", "ai voice agent mortgage") as the real targets.
  - Once vulnerable-customers publishes (2026-11-18), the FAQ can link to it.

## 8. which ai voice agent is best for small businesses
- **Our URL:** `/blog/best-ai-voice-agent-small-business`
- **SERP features:** not observable. The SERP is all listicles: sobot, close.com, plivo, oncehub (exact-match title "Which AI Voice Agent Is Best for Small Businesses?"), myaifrontdesk, bigvu, therankmasters, cloudtalk "14 best", brilo, leadlock.
- **What competitors do better:** They name products (Synthflow, Goodcall, Dialpad, Aircall, Retell, Vapi, Bland, Lindy, Twilio), use comparison tables, and give each product a best-for label. OnceHub's angle is "judge it on booking".
- **Gaps:**
  - Our framework was tiers-only with no named vendors.
  - No table, and no links to our existing Goodcall, Smith.ai and Ruby alternative pages.
  - The title wasn't the question form.
- **Changed:**
  - metaTitle is now "Which AI Voice Agent Is Best for Small Business? | Implenix", and the meta description is new.
  - New H2 "The shortlist by vendor type": a ComparisonTable of 6 vendor types with example names, best fit and who builds it. No prices or ratings. It includes a note on per-minute vs flat billing.
  - Added FAQs on free tiers and voice agent vs AI receptionist.
  - Fixed a comma splice.
  - Added internal links: /goodcall-alternative, /smith-ai-alternative, /ruby-receptionists-alternative, /ai-receptionist-cost-comparison, /what-is-an-ai-receptionist, /blog/how-much-does-ai-agent-cost, /ai-receptionist-for-small-business, /contact.
- **Left:** The "100+ businesses" claim needs confirmation. Vendor examples should be re-checked before publish because positioning changes fast.

## 9. what is a voice ai agent for business phone systems
- **Our URL:** `/blog/what-is-a-voice-ai-agent-for-business-phone-systems` (scheduled 2027-01-06)
- **SERP features:** not observable. The top of the SERP is Retell AI's "8 best AI voice agent solutions for business phone systems" (many language variants), then aircall.io. RingCentral's own AI Receptionist and ElevenLabs' SIP trunking docs show up on related queries.
- **What competitors do better:** The STT, LLM and TTS loop explained, IVR contrast, CRM caller recognition, and a vendor list.
- **Gaps:**
  - The Answer block was about 95 words (target 40-60).
  - No "how a call moves through the stack" section and no IVR comparison table.
  - No forwarding vs SIP explanation.
  - No FAQ on phone-provider built-in AI.
  - The metaTitle was 63 chars.
  - Market prices had no "not Implenix pricing" framing, plus the per-minute messaging conflict.
- **Changed:**
  - Rewrote the Answer block to about 60 words.
  - New H2 "How a call moves through a voice AI agent" (4 steps).
  - New H2 "Voice AI agent vs IVR vs auto attendant" with a ComparisonTable and the owner-approved 40-60% IVR hang-up figure.
  - New H3 "Call forwarding vs SIP trunking".
  - Pricing is now framed as market ranges plus custom Implenix pricing plus a CTA.
  - Added 2 FAQs.
  - metaTitle is now 52 chars, and the meta description is new.
  - Added internal links: /blog/why-callers-hang-up-before-reaching-anyone, /ai-receptionist-vs-ivr-system, /blog/how-much-does-ai-agent-cost, /how-does-an-ai-receptionist-work, /blog/best-ai-voice-agent-small-business, /ai-phone-answering-service, /contact.
- **Left:** A simple call-flow diagram (needs media). The vendor-checklist line "fixed monthly beats per-minute" is part of the messaging conflict (cross-cutting #5).

## 10. how much ai agent cost
- **Our URL:** `/blog/how-much-does-ai-agent-cost`
- **SERP features:** not observable. The SERP is about **AI agent development cost**: itrexgroup, gigabit, riseuplabs, greenice, f22labs, spaceo, solguruz, ultimo-bots. They quote custom builds from five to six figures and hosted agents at roughly tens to low hundreds of dollars a month. One cites Gartner's projection on canceled agentic projects.
- **What competitors do better:** Breadth across agent types (chat, workflow, custom enterprise), cost-driver breakdowns, and summary tables.
- **Gaps:**
  - The page was voice-only with no acknowledgement of other agent types.
  - The Answer block's question didn't match the keyword ("AI voice agent").
  - No summary table.
  - Almost no internal links (only /contact).
  - A $1,400/mo example read like a quote.
  - An unsourced forecast of a further 40-50% price drop.
  - No "AI vs human cost" or "what does Implenix cost" FAQ.
- **Changed:**
  - The Answer block now asks "How much does an AI agent cost?" in about 60 words.
  - New H2 "AI agent cost at a glance" with a ComparisonTable of the 3 tiers by build fee, monthly, tuning, volume and integrations, plus a short qualitative paragraph on non-voice agent costs.
  - The $1,400 is now labelled "a market example, not a quote".
  - Softened the forecast.
  - Added FAQs: "Is an AI agent cheaper than a human receptionist?" and "What does Implenix cost?" (custom, book a call, live in 72 hours).
  - Added internal links: /ai-receptionist-vs-human-receptionist, /ai-receptionist-cost-comparison, /blog/how-to-calculate-your-missed-call-cost, /blog/ai-receptionist-roi-real-numbers, /blog/best-ai-voice-agent-small-business, /contact.
- **Left:**
  - Development-cost figures for non-voice agents need a source someone actually opened before any numbers go in.
  - The 60% historical drop needs confirmation.
  - Owner decision on publishing market ranges (cross-cutting #7).

## Files edited
- app/(site)/page.tsx: 3 new HOME_FAQS entries. Copy only; schema and structure untouched.
- content/blog/hvac-ai-agent-guide.mdx
- content/blog/ai-voice-agent-real-estate.mdx
- content/blog/ai-agents-for-medspas.mdx
- content/blog/ai-agents-for-lawyers.mdx
- content/blog/ai-agents-for-finance.mdx
- content/blog/best-ai-voice-agent-small-business.mdx
- content/blog/what-is-a-voice-ai-agent-for-business-phone-systems.mdx
- content/blog/how-much-does-ai-agent-cost.mdx

No slugs, URLs, components, lib/schema.ts, layouts or config were changed.

All internal link targets were checked against routes (app/(site)/*, /i/[slug] industry slugs, /v/[slug] comparison slugs, case-study MDX) and against publish dates.
