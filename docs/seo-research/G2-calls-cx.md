# G2 calls-cx: SERP gap research and fixes

Date: 2026-10-12. Owner group: G2-calls-cx. 10 keywords, 8 pages (two pairs of keywords share a page).

## Method and limits (read first)

- WebSearch worked. **WebFetch failed on every domain (DNS `ENOTFOUND`), and direct curl was blocked by the egress proxy.** So I could not open competitor pages to count words, extract H2/H3 outlines or read JSON-LD. Competitor benchmarking below comes from search-result content and summaries, not full-page audits.
- The WebSearch tool does not show SERP features (AI Overview, PAA box, featured snippet). I could not observe them directly. The "PAA-style" questions I added come from the questions that showed up across competitor pages.
- Every new stat or legal claim is linked inline to a primary or authoritative source (FCC, eCFR, Federal Register, Gartner newsroom, NBER, FCA, FinCEN, PMC/APS, FPF, HBR, SAMHSA). I checked the content through search-tool extraction of those pages, not a full read in a browser. **Before launch, someone should click through each citation once.**
- Drip schedule: `lib/blog.ts` hides posts with a future `publishedAt`. I only added internal links to posts that are live (or that go live on or before the linking post's date), so there are no 404s. Several G2 posts are still scheduled: emotions 10-21, lead-gen 10-28, vulnerable 11-18, productivity 12-09.

## Shared changes I did not make (need an owner decision)

1. **FAQPage JSON-LD for blog posts.** Every post has a `## Frequently asked questions` block, but `app/(site)/blog/[slug]/page.tsx` only emits BlogPosting, HowTo and Speakable. An optional `faq` frontmatter field (like `howToSteps`) plus `faqSchema` in `lib/schema.ts` would help AI engines. It would not earn rich results for these pages (FAQ rich results are limited to gov and health sites).
2. **`updatedAt` / dateModified.** The outbound guide was rewritten in substance but keeps `publishedAt: 2026-04-22`. A `updatedAt` field feeding `dateModified` in BlogPosting, plus a visible "Updated" date, would signal freshness on a legal topic that changes.
3. **Legal review.** The outbound guide is now accurate to the primary sources I could reach. Because it is a legal topic, it should get one review by counsel before launch.

---

## 1. can ai agents make outbound calls
## 2. can ai agents make outbound calls illegal

**Our URL:** `/blog/ai-outbound-calling-guide` (both keywords; one page is the right call because the intent overlaps)

**SERP:** Mostly vendor content: Aloware (two "Can AI agents make outbound calls?" pages), Regal glossary, Retell, ElevenLabs TCPA docs, CloudTalk TCPA checklist, Thoughtly, Parloa, JustCall, Voiceflow. Law-firm alerts (Cooley, Akin, Mayer Brown, BHFS) rank for the FCC-ruling angle.

**What competitors do better:**
- Aloware and Regal open with a direct "Yes, here's how" answer and a short list of what the agent does (dial, detect voicemail, book, log).
- ElevenLabs, CloudTalk and Thoughtly cite the **FCC Feb 2024 ruling (FCC 24-17)** and use checklist formats.
- The law firms quote the ruling directly.

**Gaps found (before):**
- No mention of the FCC's 2024 AI-voice ruling. That is the core fact for the "illegal" query.
- Legal errors: it said all AI calls to mobiles need *written* consent (only telemarketing does; informational calls need prior express consent). It said the existing business relationship carries consent for renewals (it does not, for artificial-voice sales calls). It said the TCPA requires disclosing an "artificial voice" (it requires identifying the business plus a callback number, and an opt-out for telemarketing; a disclosure that the caller is AI is only *proposed*, in FCC 24-84). It said DNC "does not apply to businesses" without noting that the artificial-voice rule covers any mobile, business cells included.
- Nothing on ringless voicemail (FCC 2022), the vacated one-to-one consent rule (11th Cir., Jan 2025), revocation within 10 business days, or calling hours.
- No "Can AI make outbound calls?" capability section and no "Is it illegal?" H2.
- No internal links, no outbound citations, no CTA link.

**What I changed:**
- New H1/title "Can AI agents make outbound calls? What is legal and what works". New metaTitle (57 chars) and metaDescription (157 chars). Answer-first description and a rewritten Answer block.
- New H2s: "Can AI agents make outbound calls?" (capabilities), "Is it illegal for AI to make phone calls?" (FCC 24-17, written consent for telemarketing, $500/$1,500 per call, state AG enforcement, the $1M Lingo Telecom settlement), "Consent rules by call type" (ComparisonTable: mobile vs residential, informational vs sales vs emergency vs ringless VM vs existing customer), "What an AI outbound call must say" (64.1200(b) identification, callback number, 2-second automated opt-out, revocation within 10 business days), "Do you have to say it is an AI?" (FCC 24-84 NPRM status, our first-sentence disclosure policy), "Calling hours and Do Not Call", and a compliance checklist.
- Corrected the safe zone. Renewal calls that sell now need written consent, and quote follow-up turns into telemarketing if it pitches.
- Rewrote the gray zone around consent language on lead forms, and fixed the B2B section (artificial-voice rule covers business cells).
- Trimmed state-specific claims I could not verify to a general, accurate paragraph.
- Updated the transcript to show business and AI identification in the first line and a plain-speech opt-out.
- FAQ rewritten and extended: existing customers, cold sales calls, AI disclosure, voicemail.
- Added a framing line: "plain-English summary, not legal advice; have counsel review consent language."
- Internal links: /try-it, /ai-receptionist-for-dentists, /ai-receptionist-for-med-spas, /ai-receptionist-for-hvac-companies, /blog/ai-voice-agent-real-estate, /solutions/ai-followup, /blog/call-center-automation, /contact.
- Citations: FCC announcement of FCC 24-17, eCFR 47 CFR 64.1200, Federal Register FCC 24-84 NPRM.

**What's left:**
- Counsel review.
- Pre-existing unsourced numbers I kept: reminders "15-25%", quote recovery "15-22%", no-show cut "20-35%". These are founder claims. Either source them or reword them as first-hand observations.
- Once lead-gen goes live (10-28), add a link from the gray-zone section to `/blog/how-ai-sales-agents-enhance-lead-generation`.

---

## 3. call center automation
## 4. can ai replace call centre agents

**Our URL:** `/blog/call-center-automation` (both keywords)

**SERP:** "call center automation" is led by guides from GetVoIP, CloudTalk, Enthu.ai, KrispCall, Smallest.ai, Startek and Callin. "can ai replace call centre agents" brings in Sobot, Intervision, Regal, Convoso, Assembled, Language I/O and Ecosmob.

**What competitors do better:**
- The automation guides list the technology types (IVR, ACD, chatbots, RPA, speech analytics, agent assist) and the benefits.
- The "replace" pages answer "no, hybrid" with analyst data (the Gartner 80% by 2029 prediction).

**Gaps found:**
- No definition or taxonomy of automation types.
- No H2 that answers "can AI replace call centre agents" with data.
- The cost model was internally inconsistent ("20-seat" center with 533 hours a month, "9 human seats").
- A build-fee range ($10k-200k) read like Implenix pricing.
- The outbound FAQ restated the old, inaccurate consent rule.
- No internal links.

**What I changed:**
- The Answer block now defines call center automation, then answers the replace question.
- New "Types of call center automation" section with a 6-row ComparisonTable.
- New "Can AI replace call centre agents?" H2 citing Gartner: 80% of common issues by 2029; only 20% of service leaders cut headcount for AI; half that cut will rehire by 2027; 87% of customers want access to a human.
- Fixed the cost math wording, and replaced the build-fee range with "pricing is custom, book a call".
- Fixed the outbound FAQ (FCC 2024 ruling) and added FAQs "What is an example of call center automation?" and "Will AI replace call center jobs?"
- New metaTitle "Call Center Automation: Can AI Replace Agents?" and new metaDescription.
- Links: /ai-receptionist-vs-ivr-system, /blog/how-do-ai-chatbots-compare-to-human-agents, /blog/ai-outbound-calling-guide, /audit, /ai-receptionist-vs-call-center, /blog/can-ai-handle-sensitive-conversations, /contact (x2). The existing "live in 72 hours" copy is kept.

**What's left:**
- Kept founder claims about "five call centers" and the "40-70%" automation range. Confirm both are real.
- Per-minute AI cost figures ($0.10-0.19) are market estimates, not Implenix prices. Confirm the owner is fine with them.

---

## 5. how do ai chatbots compare to human agents

**Our URL:** `/blog/how-do-ai-chatbots-compare-to-human-agents`

**SERP:** Dante AI (2026 benchmark), Certainly (pros/cons), Callin, Maddyness, Sobot, CustomGPT, plus two academic PDFs (University of Maribor, University of Malta).

**What competitors do better:** Pros/cons tables, cited customer-preference data, and academic sources.

**Gaps found:**
- No summary table.
- The "what customers think" section dismissed surveys outright and cited none.
- Missing the PAA-style questions: "are chatbots better", "do customers prefer", "will chatbots replace agents".
- No internal links or CTA.

**What I changed:**
- Added an "at a glance" ComparisonTable with 8 rows.
- Rewrote the customer-sentiment section with Gartner 2024 (64% would prefer no AI in service; top fear is not reaching a person) and Gartner 2026 (87% want human access).
- Added 3 FAQs.
- New metaDescription.
- Links: /blog/call-center-automation, /ai-receptionist-vs-human-receptionist, /blog/can-ai-handle-sensitive-conversations, /try-it, /contact.

**What's left:** The cost model numbers are pre-existing estimates.

---

## 6. how ai enhances agent productivity in customer service

**Our URL:** `/blog/how-ai-enhances-agent-productivity-customer-service` (scheduled for 2026-12-09)

**SERP:** Fin.ai, Freshworks, Responso, Unity Connect, JustCall, Sobot, Cobbai. Mostly "N ways" listicles from vendors.

**What competitors do better:** Fin argues the gains come from removing work, not shortening handle time. The others rely on numbered ways plus tool screenshots.

**Gaps found:**
- No independent evidence. Every number was first-party.
- No definition of "agent assist".
- No FAQ on who benefits most or how to measure.
- No links.

**What I changed:**
- New "What the research says" section citing the NBER field study (Brynjolfsson, Li, Raymond: 5,179 agents, +14% issues resolved per hour, +34% for novices, minimal for experts, better sentiment and retention), with practical lessons.
- 3 new FAQs: what is agent assist, new vs experienced agents, how to measure.
- metaTitle "How AI Enhances Agent Productivity" and new metaDescription.
- Links: /blog/how-ai-agents-improve-data-accuracy (replaced an unlinked "see the data accuracy piece"), /blog/how-ai-agents-recognize-human-emotions, /blog/call-center-automation, /blog/how-do-ai-chatbots-compare-to-human-agents, /audit, /contact.

**What's left:**
- The "productivity numbers I have measured" list and the "30-40% more productive" Pull quote are unsourced first-party claims. Verify them or soften them.
- Screenshots or a diagram of an agent-assist screen would match competitors.

---

## 7. can ai agents handle sensitive customer conversations

**Our URL:** `/blog/can-ai-handle-sensitive-conversations`

**SERP:** Gnani (secure AI for sensitive conversations), Dialpad, SignalWire, CustomerThink, respond.io FAQ, AgentConn.

**What competitors do better:** They treat "sensitive" as sensitive *data* too: privacy, prompt manipulation and social engineering, GDPR/HIPAA/PCI.

**Gaps found:**
- Only the emotional side was covered. No data protection, payments, identity verification or social-engineering section.
- The 988 mention had no source.
- No links.

**What I changed:**
- New H2 "Sensitive data is the other half of the question": PCI-safe payments outside the transcript, HIPAA BAA, identity checks, social engineering, data minimization and retention.
- Linked 988 to SAMHSA (free, 24/7 call/text/chat; 911 for immediate danger).
- Cited Gartner 87% in the disclosure FAQ.
- 2 new FAQs: is it safe to share personal info, can AI detect sensitivity.
- New metaDescription.
- Links: /blog/ai-voice-agents-healthcare-medicine, /blog/call-center-automation, /blog/how-do-ai-chatbots-compare-to-human-agents, /blog/ethical-considerations-ai-agents, /try-it, /contact.

**What's left:** Once they go live, add links to `/blog/can-ai-agents-identify-vulnerable-customers` (11-18) and `/blog/how-ai-agents-recognize-human-emotions` (10-21).

---

## 8. can ai agents identify vulnerable customers

**Our URL:** `/blog/can-ai-agents-identify-vulnerable-customers` (scheduled for 2026-11-18)

**SERP:** Mostly UK contact-centre and fintech content: CX Today (Puzzel), NICE Enlighten AI for vulnerable customers, Oodle/NICE press release, Call Centre Helper, Aveni.ai. FCA Consumer Duty is the framework these pages sell against.

**What competitors do better:** They name vendor tools and the FCA framework explicitly.

**Gaps found:**
- The FCA reference had no definition or source, and the four drivers were listed as one line.
- The US section said "developing" with no concrete authority.
- No examples FAQ.
- No links.

**What I changed:**
- Added the FCA definition with a link to the FG21/1 page and a Consumer Duty mention.
- Added the FinCEN 2022 elder financial exploitation advisory with an example red flag.
- New "The four drivers of vulnerability" table mapping each driver to what it sounds like on a call.
- 2 FAQs: examples, the four drivers.
- New metaDescription.
- Links: /blog/can-ai-handle-sensitive-conversations, /blog/how-ai-agents-recognize-human-emotions, /blog/ai-agents-for-finance, /blog/ethical-considerations-ai-agents, /contact.

**What's left:** I did not name vendor tools (NICE, Aveni). That is an owner call on whether to mention third-party products.

---

## 9. how ai agents recognize human emotions

**Our URL:** `/blog/how-ai-agents-recognize-human-emotions` (scheduled for 2026-10-21)

**SERP:** Dialzara, Tencent Cloud techpedia, Zilliz FAQ, academic pages (Glasgow, Utrecht/Macquarie, Cologne), BetaNews.

**What competitors do better:** Multi-modal coverage (text, voice, face, physiology), plus academic framing of the reliability and manipulation risk.

**Gaps found:**
- The accuracy claims had no scientific counterweight.
- The EU AI Act line was vague, and a claim about "US state legislatures" had no source.
- Missing the "can AI understand emotions" and "what is emotion AI" questions.
- No links.

**What I changed:**
- Added the Barrett et al. 2019 review (four tests: reliability, specificity, generalizability, validity) and why that means emotion labels should be treated as probabilities.
- Replaced the AI Act bullet with the precise Article 5(1)(f) rule: workplace and education ban, medical and safety exceptions, in force since 2 Feb 2025, high-risk classification elsewhere. Cited the FPF analysis. Removed the unsourced US claim.
- 2 FAQs: can AI really understand emotions, what is emotion AI.
- New metaDescription.
- Links: /blog/can-ai-handle-sensitive-conversations, /blog/how-do-ai-chatbots-compare-to-human-agents, /blog/ethical-considerations-ai-agents, /try-it, /contact.

**What's left:**
- The "85-92%" and "60-70%" accuracy figures are unsourced. Source them or reframe them as observations from internal QA.
- Add a link to the vulnerable-customers post after 11-18.

---

## 10. how ai sales agents enhance lead generation

**Our URL:** `/blog/how-ai-sales-agents-enhance-lead-generation` (scheduled for 2026-10-28)

**SERP:** Outreach, Attention, Botpress, Zoho CRM, Flash Intel, Interakt, Skilly. Mostly prospecting, ICP and intent-data angles from vendors.

**What competitors do better:** They cover the prospecting and data side (ICP matching, intent signals). Our angle (speed-to-lead and qualification for service businesses) is narrower but more practical. I kept it deliberately.

**Gaps found:**
- Unsourced "71-minute human median" and "Zillow, Realtor.com, HubSpot studies".
- The cold-list reactivation stage (90+ day leads) conflicted with the outbound guide's consent policy and the FCC AI-voice ruling.
- A "$3,000-$8,000 setup cost" FAQ broke the no-pricing rule.
- The outbound guide was mentioned as a plain-text path, not a link.

**What I changed:**
- Replaced the unsourced claims with HBR 2011 "The Short Life of Online Sales Leads" (about 7x more likely to qualify within an hour; 23% never responded; 42-hour average).
- Stage 4 now requires a consent record that covers AI voice, with email re-permission first.
- TCPA bullet updated with the FCC ruling and lead-form consent language.
- Pricing FAQ now points to custom pricing via a booked call, with live in 72 hours.
- New FAQs: what is an AI SDR, can AI agents generate leads on their own.
- New metaDescription.
- Links: /blog/ai-outbound-calling-guide, /solutions/ai-followup, /ai-receptionist-for-mortgage-brokers, /ai-receptionist-for-real-estate, /blog/how-to-automate-sales-forecasting-with-ai-agents, /try-it, /contact.

**What's left:**
- The mortgage-broker worked example (before/after funded loans, $2,800 commission) and the "60-90%" and "4-7%" figures are unverified client numbers. Under the no-invented-stats rule, the owner should confirm they come from a real deployment, or relabel the example as illustrative.

---

## Files changed

- content/blog/ai-outbound-calling-guide.mdx
- content/blog/call-center-automation.mdx
- content/blog/how-do-ai-chatbots-compare-to-human-agents.mdx
- content/blog/how-ai-enhances-agent-productivity-customer-service.mdx
- content/blog/can-ai-handle-sensitive-conversations.mdx
- content/blog/can-ai-agents-identify-vulnerable-customers.mdx
- content/blog/how-ai-agents-recognize-human-emotions.mdx
- content/blog/how-ai-sales-agents-enhance-lead-generation.mdx

All 8 compile with @mdx-js/mdx. Frontmatter is valid. Every internal link resolves to an existing route or a post that is live by the linking post's date. No em dashes. No slugs changed. I did not run a build or commit.
