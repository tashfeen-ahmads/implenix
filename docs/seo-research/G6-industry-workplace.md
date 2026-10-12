# G6 industry-workplace: SERP gap research and fixes

Date: 2026-10-12. Files edited (all in `content/blog/`, slugs and URLs unchanged):
`agentic-reasoning-ai-doctor.mdx`, `ai-voice-agents-healthcare-medicine.mdx`,
`how-ai-agents-will-change-cancer-research-oncology.mdx`, `agentic-ai-retail-personalization.mdx`,
`how-to-create-ai-agent-for-nonprofit.mdx`, `workplace-ai-agents-employee-perspective.mdx`,
`best-ai-agent-security-questionnaires.mdx`. No shared components, schema, layouts or config were touched.
All 7 bodies compile with @mdx-js/mdx and the frontmatter parses as YAML. Every internal link target was checked
and exists. No em or en dashes.

## Research limitation (read this first)
WebFetch could not open any page in this environment: DNS fails, and the egress proxy refuses CONNECT with a 403
(pmc.ncbi.nlm.nih.gov, nature.com, wolfia.com and other hosts). Two consequences:
- **Competitor benchmarking is SERP-level only.** I got rankings, titles and summaries from WebSearch, but not
  word counts, H2/H3 outlines, JSON-LD types or CTA placement for competitor pages.
- **Citations were checked through search results, not by opening the page.** Every outbound link added below
  was confirmed by WebSearch results that quote the source (often several results agreeing), and each URL
  appeared in those results. Because the brief requires sources to be opened and these are YMYL topics, **a
  person should click through each link listed under "Citations to verify" before publishing.** I kept new
  numbers to a minimum for this reason. To fix access, an admin can allow these hosts under the environment's
  Network access settings.

## Cross-cutting changes
- Removed every unsourced statistic I found, for example: "30-90 min/day saved", "20-40% of front-office time",
  "800-3,000 calls/provider", "no-show 8-20%", "complications detected 2-4 days earlier", "+15-25 pt adherence",
  "200,000 oncology papers/yr", "trial enrollment 5-10% vs 3-5%", "100+ oncology FDA devices", "reorder conversion
  8-18%", nonprofit call-mix percentages, vendor pricing tiers, and questionnaire hour and cost ranges.
  Where a number helped, I replaced it with a cited source or a "measure your own" method.
- Relabeled invented examples as illustrative. The "real" wine-shop deployment with revenue figures was not
  verifiable, so I replaced it with a run-your-own-numbers method. The healthcare intake transcript is now
  labeled "illustrative, names invented".
- Added an answer-first `<Answer>` block of 53-60 words to every post. Titles are 60 characters or fewer and
  meta descriptions are 152-159 characters.
- Added `<ComparisonTable>` blocks, the existing MDX component. GFM markdown tables are not enabled.
- Added 4-8 verified internal links per post and a /contact, /try-it or /audit CTA. "Live in 72 hours" is the
  only setup-time claim, and no Implenix prices appear.

## Shared changes needed (not made; outside my files)
1. **FAQ schema for blog posts.** `app/(site)/blog/[slug]/page.tsx` emits BlogPosting, HowTo and Speakable, but
   no FAQPage, even though every post has a "Frequently asked questions" section. Extracting **bold-question**
   pairs into FAQPage JSON-LD would help AI engines. It will not earn FAQ rich results, since Google restricts
   those to government and health sites.
2. **`updatedAt` / dateModified field.** BlogPost has no update-date field, so `dateModified` always equals
   `publishedAt`. These posts were materially revised, so a `updatedAt` frontmatter field wired to
   `blogPostingSchema` (and a visible "Updated" date) would show the freshness.
3. **Medical reviewer byline.** For YMYL posts (doctor, healthcare, oncology), add an optional "Medically
   reviewed by" field to BlogPost. This needs owner input: a real clinician reviewer.
4. **Inbound links.** `lib/industryToBlog.ts` does not link to the oncology, nonprofit or security-questionnaire
   posts. Consider linking oncology from `medical-practices`, and nonprofit from a relevant hub.

---

## 1. agentic reasoning ai doctor
- **Our URL:** /blog/agentic-reasoning-ai-doctor
- **SERP:** Mostly vendor and agency blogs: getmagical.com, doctronic.ai, promptlayer, kaopiz, creolestudios,
  ema.ai, plus scraped spam copies. I saw no peer-reviewed or regulator pages in the top results. That is an E-E-A-T
  opening for an evidence-led page.
- **What competitors do better:**
  - doctronic defines agentic reasoning in parts (planning, counterfactuals, uncertainty, memory).
  - ema.ai describes a concrete architecture (LangGraph, knowledge graph, RAG).
  - Competitors claim benefits without evidence, so we could not match them on that.
- **Gaps on our page (before):**
  - The definition did not match the query.
  - Claims had no sources (time savings, accuracy gains).
  - The FDA section was generic and out of date: the CDS guidance was updated in Jan 2026.
  - There was no comparison or table, no internal links, and no CTA.
- **Changes:**
  - New answer block that defines the term.
  - Numbered list of agentic steps.
  - Chatbot vs agentic AI vs physician table.
  - Documentation claim now cites the TPMG ambient-scribe study in NEJM Catalyst, labeled observational.
  - Diagnostic claim now cites the Goh et al. 2024 JAMA Netw Open RCT: GPT-4 access did not significantly
    improve physician diagnostic reasoning.
  - FDA section rewritten around the four non-device CDS criteria, with a link to the guidance.
  - Worked example labeled illustrative.
  - New FAQs: "Can an AI doctor diagnose me?" (points to a clinician / 911) and "Does agentic AI make doctors
    more accurate?"
  - Six internal links and a /contact CTA.
- **Left:** a clinician reviewer, the shared items above, and an optional diagram of the agent loop.

## 2. how generative ai voice agents will transform medicine
- **Our URL:** /blog/ai-voice-agents-healthcare-medicine
- **SERP:** The query is the exact title of Adams, Acosta & Rajpurkar, npj Digital Medicine 8:353 (June 2025).
  The paper holds the top spots (nature.com, PMC, DOAJ, ResearchGate), followed by giant.health,
  healthmanagement.org and many simbo.ai vendor posts.
- **What competitors do better:**
  - They summarize the paper directly: generative vs scripted bots, use cases from scheduling to triage,
    escalation of low-confidence cases, and open outcome questions.
- **Gaps on our page (before):**
  - The page did not mention the paper, so it missed the intent.
  - The title did not contain the keyword.
  - Several unsourced statistics.
  - The intake transcript was presented as real.
  - No IVR/agent/staff comparison.
- **Changes:**
  - Title, H1 and meta now target the keyword.
  - New section summarizing the npj perspective, linked and attributed, with no numbers.
  - IVR vs generative agent vs staff table.
  - Replaced statistics with a measure-your-own call audit.
  - Transcript labeled illustrative.
  - Post-visit section rewritten without outcome claims.
  - TCPA/outbound note and 911 guidance added to the hard stops.
  - "Now / emerging / still research" outlook added.
  - Links to the doctor post, the oncology post, missed-call cost, the outbound guide, and the
    medical-practices and therapists industry pages.
  - CTAs to /contact and /try-it.
- **Left:** a clinician or compliance reviewer, and real (consented) call audio or a demo if one exists.

## 3. how ai agents will change cancer research and oncology
- **Our URL:** /blog/how-ai-agents-will-change-cancer-research-oncology (publishedAt 2026-12-02 is a
  drip-scheduled date per `lib/blog.ts`, so I left it as is)
- **SERP:** The query is the exact title of Lee, Ferber, Rood, Regev & Kather, Nature Cancer 5:1765-1767 (2024).
  Results include the TU Dresden and BIDMC listings, the Nature Reviews Cancer review (Truhn et al.), the PMC
  copy of Ferber et al. 2025, and vendor posts (ampcome, stackai).
- **What competitors do better:**
  - They cite the papers and the early validation study.
- **Gaps on our page (before):**
  - No reference to the source paper.
  - Three unsourced statistics.
  - An overclaim about AI-designed molecules.
  - No evidence section.
- **Changes:**
  - New "What the researchers actually argued" section citing the Nature Cancer comment and the NRC review.
  - New "early evidence" section on Ferber et al. 2025 (GPT-4 agent with oncology tools, 20 simulated cases).
    Numbers are deliberately left out; it is described as small and simulated.
  - Imaging section now cites the FDA AI-enabled device list (most authorizations are radiology).
  - Removed the unsupported statistics and softened the drug-discovery claims.
  - Added a patient-facing safety line and a "What is an AI agent in oncology?" FAQ.
  - Seven internal links and a /contact CTA.
- **Left:** a clinician reviewer. Consider adding the Ferber et al. figures once someone has opened the paper.

## 4. how retail businesses use agentic ai for personalisation
- **Our URL:** /blog/agentic-ai-retail-personalization
- **SERP:** Enterprise and consultancy content: latentview, mytotalretail, Publicis Sapient, TCS, Ciklum,
  vktr (Salesforce Agentforce), iankhan. The angle is omnichannel: real-time shopper profiling, in-session
  adaptation, inventory- and margin-aware offers, and shopping agents that buy for customers.
- **What competitors do better:**
  - Broad coverage of the enterprise patterns.
  - Covers the British spelling.
- **Gaps on our page (before):**
  - The page was phone-only, so intent matched only in part.
  - Fabricated-looking deployment numbers and an unsourced conversion rate.
  - No TCPA warning on AI-voice reorder calls.
- **Changes:**
  - Title and H2 use "personalisation".
  - New section "What agentic adds to retail personalisation", covering the five enterprise patterns,
    then a bridge to the phone channel for independents.
  - Wine-shop case replaced with a run-your-numbers method linked to /blog/how-to-calculate-your-missed-call-cost
    and /audit.
  - TCPA consent note citing the FCC Feb 2024 AI-voice ruling, via Orrick's summary.
  - Example names labeled invented, privacy section updated (GDPR/UK), new FAQ "What is agentic AI
    personalisation".
  - Links to what-is-agentic-ai, salons, the outbound guide and the prompts post. CTAs to /contact, /try-it
    and /audit.
- **Left:** a real, consented retail case study if one exists. I deliberately did not cite the McKinsey "40%"
  figure because the secondary sources word it inconsistently.

## 5. how to create an ai agent for my nonprofit organization
- **Our URL:** /blog/how-to-create-ai-agent-for-nonprofit
- **SERP:** Build-it-yourself intent: MindStudio, 2tolead playbook, cloud4good, a Maven course, Jotform, Glide,
  Emergent, formuspro. They cover no-code builders, Copilot Studio, chat agents, and use cases like donor FAQs,
  thank-yous, volunteer scheduling and grant research.
- **What competitors do better:**
  - They help the reader choose between agent types and builders.
- **Gaps on our page (before):**
  - The page was voice-only.
  - Unsourced vendor price tiers, discounts, setup fees and call-mix percentages. These were not Implenix
    prices, but they had no source.
  - "4-6 weeks" sat awkwardly next to "live in 72 hours".
- **Changes:**
  - New "which kind of agent" section with a table (chat/website, internal staff assistant, voice), plus a
    build vs done-for-you step that replaces the price-tier step.
  - Removed all unsourced figures and the HowTo step that contained prices.
  - The pilot now reads "agent live in 72 hours, then 2-4 week parallel pilot".
  - Added NIST AI RMF governance (link), TCPA, and AI disclosure.
  - Dropped Kindful and added Little Green Light to the CRM list.
  - New FAQ "Can a nonprofit build an AI agent without coding?"
  - Eight internal links and a /contact CTA. The howToSteps frontmatter was updated to match.
- **Left:** none needed. Optionally, verified nonprofit-pricing facts for specific tools.

## 6 + 7. how workplace ai agents support daily tasks / how should employees think about ai agent enhanced workplace
- **Our URL:** /blog/workplace-ai-agents-employee-perspective (one page covers both keywords)
- **SERP (daily tasks):** Vendor pages: ClickUp, TextCortex, MindStudio, Atomicwork, Slack, Glean (CMSWire),
  a Coggno course.
- **SERP (employees):** Business Insider (PwC "digital colleague"), HR Executive ("fallacy of treating agents
  as employees"), Workday research and blog, Computerworld, an AMCIS 2026 paper, askfilo Q&A pages.
- **What competitors do better:**
  - Task-by-task lists.
  - Survey data on attitudes (Workday).
  - The "agent boss" framing (Microsoft WTI).
- **Gaps on our page (before):**
  - Unsourced time figures (20-40% of the day, 30-60 min, 60-90 min email, 3-5h and 8-20h training).
  - No H2 matching the second keyword.
  - No data on employee attitudes.
  - No internal links.
- **Changes:**
  - Title and meta now cover both keywords.
  - Task table (what the agent does vs what you still own).
  - New H2 "How should employees think about an AI agent-enhanced workplace?" with an answer-first paragraph,
    citing Workday 2025 (75% comfortable teaming with agents vs 30% being managed by one, 24% comfortable
    with background agents; the sample caveat is noted) and Microsoft's 2025 Work Trend Index "agent boss".
  - Removed every unsourced time figure.
  - Added a "front-line phone calls" task, a manager item on transparency, and an FAQ "Should I treat an AI
    agent like a coworker?"
  - Nine internal links and /try-it and /contact CTAs.
- **Left:** optional original data from Implenix deployments, such as front-desk interruption time, if real
  measurements exist.

## 8. who has the best ai agent for security questionnaires
- **Our URL:** /blog/best-ai-agent-security-questionnaires
- **SERP:** Vendor-written "best of" lists, each ranking itself first: inventive.ai (two posts), autorfp.ai,
  wolfia.com (exact-match title), conveyor.com, flowforma, securitypalhq, sprinto.
- **What competitors do better:**
  - Broader vendor coverage: Conveyor, SecurityPal, Wolfia, Inventive, AutoRFP, Skypher, Sprinto.
  - Wolfia gives a practical test: check citations and what happens when the docs lack an answer.
- **Gaps on our page (before):**
  - Stale facts: it treated SafeBase as independent, but Drata announced the acquisition in Feb 2025.
  - Missing vendors.
  - Unsourced price and hour ranges.
  - No evaluation checklist or comparison table.
- **Changes:**
  - Exact-match question title and H1.
  - Answer block, plus a vendor-side comparison table.
  - Drata + SafeBase section linked to Drata's announcement.
  - Added Conveyor, SecurityPal and the newer AI-native tools.
  - Five-point "how to test" checklist.
  - Formats section (SIG, CAIQ, VSA).
  - Prices replaced with a quote-based ROI method.
  - Five internal links.
- **Left:**
  - **Topical relevance:** this post is far from Implenix's core (AI receptionists). It can rank only on
    neutrality, and it may dilute topical focus. The owner should decide whether to keep it indexed.
  - There is no natural Implenix CTA. A security/trust page for Implenix would give it one.

## Citations to verify (click-check before publish)
- NEJM Catalyst, TPMG ambient AI scribes: https://catalyst.nejm.org/doi/full/10.1056/CAT.25.0040
- Goh et al., JAMA Netw Open 2024 RCT: https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2825395
- FDA CDS Software guidance: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
- Adams, Acosta, Rajpurkar, npj Digit Med 2025: https://www.nature.com/articles/s41746-025-01776-y
- Lee et al., Nature Cancer 2024: https://www.nature.com/articles/s43018-024-00861-7
- Truhn et al., Nature Reviews Cancer: https://www.nature.com/articles/s41568-025-00900-0
- Ferber et al., Nature Cancer 2025: https://www.nature.com/articles/s43018-025-00991-6
- FDA AI-enabled device list: https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-enabled-medical-devices
- Orrick on the FCC AI-voice TCPA ruling: https://www.orrick.com/en/Insights/2024/02/Did-the-FCC-Really-Ban-AI-Generated-Voice-Calls-No-But-Restrictions-Apply
- NIST AI RMF: https://www.nist.gov/itl/AI-risk-management-framework
- Workday 2025 research: https://newsroom.workday.com/2025-08-12-New-Workday-Global-Research-AI-Agents-Are-Here-But-Dont-Call-Them-Boss
- Microsoft 2025 Work Trend Index: https://blogs.microsoft.com/blog/2025/04/23/the-2025-annual-work-trend-index-the-frontier-firm-is-born/
- Drata acquiring SafeBase: https://drata.com/blog/acquiring-safebase

Pre-existing, unchanged claim worth checking: every post's authorBio says "six years shipping AI voice agents".
Confirm this is accurate, because it is an E-E-A-T signal.
