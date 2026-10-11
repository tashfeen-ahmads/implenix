// Glossary entries, voice AI / receptionist / call infrastructure terms.
//
// Each entry is hand-written to establish topical authority for the entity.
// The buyer searching "what is voice AI" or "what is SIP trunk" should
// land on a definitive, non-fluffy explanation that crosslinks to the
// relevant pillar / comparison / industry page.

export type GlossaryRelatedLink = { href: string; label: string };

export type GlossaryFaq = { question: string; answer: string };

export type GlossaryEntry = {
  slug: string;
  term: string;
  shortDefinition: string; // ~80 chars for list view
  metaTitle: string;
  metaDescription: string;
  intro: string; // 200+ words unique
  keyPoints: string[]; // 4-6 bullets distilling the term
  related: GlossaryRelatedLink[];
  faqs: GlossaryFaq[];
};

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    slug: 'ai-receptionist',
    term: 'AI Receptionist',
    shortDefinition:
      'Voice-AI agent that answers, qualifies, and books inbound business calls 24/7.',
    metaTitle: 'AI Receptionist, Definition | Implenix Glossary',
    metaDescription:
      'AI receptionist defined: voice-AI agent that answers business phones in real time, qualifies callers, books appointments, and syncs with your CRM.',
    intro:
      "An AI receptionist is dedicated phone infrastructure that answers a business's inbound calls in real time, follows a custom script tuned for the business, qualifies callers against defined rules, books appointments against the calendar, and writes the outcome back to the CRM. Where a human receptionist handles one call at a time during their shift, an AI receptionist handles unlimited concurrent calls 24 hours a day at fixed cost. The category emerged because most local businesses, agencies, and professional firms lose meaningful pipeline to missed calls, voicemail loses 75% of callers outright, and hiring is expensive enough that most businesses cover only 40 hours of the week's 168. AI receptionists fill the niche by combining voice AI, telephony, and integrations into a deployed agent that practically replaces the front-desk role for routine work while still routing the calls that need a human to one in real time.",
    keyPoints: [
      'Answers inbound calls within one ring, 24/7',
      'Qualifies callers using your tuned script',
      'Books appointments against your real calendar',
      'Syncs to your CRM in real time during the call',
      'Transfers urgent or complex calls to a human via configurable rules',
      'Fixed monthly cost regardless of call volume',
    ],
    related: [
      { href: '/', label: 'AI Receptionist, main pillar' },
      { href: '/what-is-an-ai-receptionist', label: 'What is an AI receptionist?' },
      { href: '/how-does-an-ai-receptionist-work', label: 'How does an AI receptionist work?' },
    ],
    faqs: [
      {
        question: 'How is an AI receptionist different from a chatbot?',
        answer:
          'A chatbot handles text-based conversations on a website or app. An AI receptionist handles spoken phone calls in real time and integrates with your phone routing.',
      },
      {
        question: 'How is it different from an IVR?',
        answer:
          'An IVR is a phone tree menu (press 1 for sales). An AI receptionist has actual conversations and resolves the request, booking, intake, transfer, without forcing a menu.',
      },
      {
        question: 'How much does an AI receptionist cost?',
        answer:
          'For comparison, a full-time human receptionist runs $3,500-$5,000/month and a per-minute live answering service $300-$1,500. Implenix is a custom build, so pricing depends on your business: a lead specialist reviews your call flow on a short call and recommends the right setup and price.',
      },
    ],
  },
  {
    slug: 'voice-ai',
    term: 'Voice AI',
    shortDefinition:
      'AI systems that produce or understand spoken language in real time.',
    metaTitle: 'Voice AI, Definition | Implenix Glossary',
    metaDescription:
      'Voice AI defined: real-time speech-to-text, text-to-speech, and natural language understanding combined into systems that converse with humans on calls.',
    intro:
      "Voice AI refers to AI systems that produce or understand spoken language in real time. The category combines several distinct technologies: automatic speech recognition (ASR or speech-to-text) converts a caller's spoken audio into text; natural language understanding classifies the text into intents and extracts entities; a language model or dialogue manager picks the appropriate response; text-to-speech synthesis generates the spoken response back. Modern voice AI runs the full loop with sub-800ms turn-taking, fast enough that the conversation feels natural to the caller. The technology underlies AI receptionists, AI voice agents in customer support, and increasingly any business application where a phone call replaces a chat or form. Voice AI is distinct from older speech technology (IVRs, simple speech menus) because it produces flexible conversational output rather than constrained menu navigation, and because it integrates with downstream systems (CRMs, calendars, dispatch tools) to take action during the conversation rather than just collecting information.",
    keyPoints: [
      'Combines ASR (speech-to-text), NLU, dialogue management, and TTS (text-to-speech)',
      'Operates in real time with sub-800ms turn-taking',
      'Distinct from older IVR/menu-based speech tech',
      'Integrates with downstream business systems to take action',
      'Powers AI receptionists, voice agents, and conversational interfaces',
    ],
    related: [
      { href: '/what-is-an-ai-receptionist', label: 'What is an AI receptionist?' },
      { href: '/how-does-an-ai-receptionist-work', label: 'How does it work technically?' },
      { href: '/glossary/natural-language-understanding', label: 'Natural language understanding' },
    ],
    faqs: [
      {
        question: 'Is voice AI the same as a chatbot?',
        answer:
          'No. Chatbots handle text conversations. Voice AI handles spoken conversations in real time, including the underlying ASR and TTS components a chatbot does not need.',
      },
      {
        question: 'What does voice AI sound like to a caller?',
        answer:
          'Modern voice AI is tuned for natural pacing and warmth. Most callers cannot distinguish a well-tuned voice AI from a human operator on routine calls.',
      },
      {
        question: 'How fast does voice AI need to respond?',
        answer:
          'Under 800ms turn-taking is the threshold for conversation to feel natural. Modern voice AI runs streaming ASR and TTS to hit this latency target.',
      },
    ],
  },
  {
    slug: 'call-routing',
    term: 'Call Routing',
    shortDefinition:
      'Logic that directs an inbound call to the right destination based on rules.',
    metaTitle: 'Call Routing, Rules, Patterns, Examples | Implenix Glossary',
    metaDescription:
      'Call routing defined: rule-based logic that directs inbound calls to the right destination based on caller attributes and intent.',
    intro:
      'Call routing is the rule-based logic that directs an inbound phone call to the appropriate destination based on attributes of the caller and the situation. Common routing patterns include geofenced routing (call from a Boston area code routes to the Boston location), service-area routing (zip code lookup determines the right service team), VIP routing (allow-listed numbers route to a senior account manager), urgent-criteria routing (callers describing emergency keywords route to dispatch), and overflow routing (calls during peak hours route to a backup team). Call routing predates AI receptionists, traditional PBXs and IVRs implement basic routing through extension menus, but AI receptionists make routing significantly more powerful because the routing logic can use the full content of the conversation rather than just static caller attributes. An AI receptionist can route based on what the caller said, how they said it, what the caller history shows, and what the live business state is (calendar capacity, on-call rotation) at the moment of the call.',
    keyPoints: [
      'Directs inbound calls to the right destination based on rules',
      'Common patterns: geofenced, service-area, VIP, urgent-criteria, overflow',
      'AI-driven routing uses full conversation content, not just static attributes',
      'Modern routing reads live business state (calendar, on-call) during the call',
      'Reduces friction (no menus) and improves accuracy vs traditional IVR',
    ],
    related: [
      { href: '/', label: 'AI Receptionist, main pillar' },
      {
        href: '/ai-receptionist-vs-ivr-system',
        label: 'AI Receptionist vs IVR System',
      },
      { href: '/glossary/sip-trunk', label: 'SIP trunk' },
    ],
    faqs: [
      {
        question: 'What is the difference between call routing and an IVR?',
        answer:
          'An IVR is one form of call routing, routing via a menu where the caller presses digits to select a destination. Call routing is the broader category and includes attribute-based, content-based, and AI-driven routing that does not require a menu.',
      },
      {
        question: 'How does an AI receptionist route calls?',
        answer:
          'Defined rules check on every conversational turn, VIP allow-list, urgent keywords, sentiment, off-script intent. When a rule triggers, the agent warm-transfers via SIP to the right destination.',
      },
      {
        question: 'Can call routing change in real time?',
        answer:
          'Yes. Storm-mode toggles, after-hours flips, and capacity-aware routing all change behavior dynamically based on time, business state, or operator-set flags.',
      },
    ],
  },
  {
    slug: 'lead-qualification',
    term: 'Lead Qualification',
    shortDefinition:
      'Capturing the data points needed to decide whether a prospect is worth pursuing.',
    metaTitle: 'Lead Qualification, Definition | Implenix Glossary',
    metaDescription:
      'Lead qualification defined: capturing budget, timeline, decision-maker, fit, the attributes that determine sales-worthiness.',
    intro:
      'Lead qualification is the process of capturing the attributes of a prospect that determine whether they are worth pursuing as a sales opportunity. Standard frameworks (BANT, budget, authority, need, timeline; CHAMP, challenges, authority, money, prioritization; or industry-specific variants) define which questions to ask and which answers separate a fit lead from a non-fit lead. Traditionally lead qualification happens in a discovery call run by a salesperson, which means the qualifying questions consume the salespersons time even when the lead turns out to be a poor fit. Front-end lead qualification, capturing the same data on the inbound call before a salesperson is involved, is one of the highest-leverage uses of an AI receptionist. The AI runs the qualifying script, captures the data, and either books the discovery call (if the lead passes) or sends a polite no-thanks (if it does not). For agencies and professional services where discovery time is expensive, this saves significant strategist hours per week.',
    keyPoints: [
      'Captures the attributes that determine sales-fit',
      'Standard frameworks: BANT, CHAMP, MEDDIC, industry-specific variants',
      'Traditionally done by salespeople in discovery calls',
      'Front-end qualification (before discovery) is high-leverage for AI receptionists',
      'Saves strategist hours and tightens discovery-call quality',
    ],
    related: [
      {
        href: '/ai-receptionist-for-marketing-agencies',
        label: 'AI Receptionist for Marketing Agencies (RFP qualification)',
      },
      { href: '/glossary/call-routing', label: 'Call routing' },
    ],
    faqs: [
      {
        question: 'Can an AI receptionist run lead qualification?',
        answer:
          'Yes. The agent runs your defined qualifying questions during the inbound call and either books a discovery (if the lead passes) or politely declines (if it does not). Saves significant salesperson time.',
      },
      {
        question: 'What qualifying frameworks does Implenix support?',
        answer:
          'BANT, CHAMP, MEDDIC, and industry-specific variants are all supported by configuring the script during onboarding.',
      },
      {
        question: 'Will the AI alienate good leads it misclassifies?',
        answer:
          'We tune for false negatives, when in doubt, the agent books the discovery rather than declining. Below-bar leads get a respectful no-thanks; near-bar leads get the discovery.',
      },
    ],
  },
  {
    slug: 'appointment-booking',
    term: 'Appointment Booking',
    shortDefinition:
      'Reserving a time slot for a customer interaction directly during the call.',
    metaTitle: 'Appointment Booking, Definition | Implenix Glossary',
    metaDescription:
      'Appointment booking via AI receptionist: reading live calendar availability and reserving the slot during the conversation, with confirmation by SMS.',
    intro:
      "Appointment booking in the context of an AI receptionist refers to reserving a time slot for a customer interaction directly during the inbound call rather than after the call as a follow-up task. The agent makes a live API call to the business's calendar (Google, Outlook, Calendly, or an industry PMS like Avimark for vets, Open Dental for dental, ServiceTitan for HVAC), reads back the next available openings that match the caller's preferences, books the slot once the caller confirms, and triggers a confirmation SMS or email before the conversation ends. Live booking is a meaningful upgrade over message-taking, when the customer hangs up the appointment is already on the calendar with full intake context, and the customer has the confirmation in hand. For service businesses where speed-to-booking is a key conversion driver, live booking via AI receptionist captures meaningful pipeline that traditional answering services lose to next-day callback friction.",
    keyPoints: [
      'Reserves a calendar slot during the inbound call, not after',
      'Reads live availability from Google, Outlook, Calendly, or PMS systems',
      'Triggers SMS/email confirmation before call ends',
      'Beats message-taking on speed-to-booking',
      'Critical for service-business conversion',
    ],
    related: [
      { href: '/', label: 'AI Receptionist' },
      {
        href: '/ai-receptionist-vs-answering-service',
        label: 'vs Answering Service (booking comparison)',
      },
      { href: '/glossary/call-routing', label: 'Call routing' },
    ],
    faqs: [
      {
        question: 'Which calendars work with AI appointment booking?',
        answer:
          'Google, Outlook, Calendly natively. Industry PMS systems (Avimark, Open Dental, ServiceTitan, Mindbody, Boulevard) integrate via direct API or webhook.',
      },
      {
        question: 'What if the requested time is unavailable?',
        answer:
          'The agent offers the next 2-3 available slots that match the caller\'s preferences and books the one they choose.',
      },
      {
        question: 'How is this different from message-taking?',
        answer:
          'Message-taking ends with the customer waiting for a callback. Live booking ends with the appointment confirmed in their inbox before the call hangs up.',
      },
    ],
  },
  {
    slug: 'after-hours-coverage',
    term: 'After-Hours Coverage',
    shortDefinition:
      'Phone-handling capacity outside standard business hours.',
    metaTitle: 'After-Hours Coverage, Definition + Cost | Implenix Glossary',
    metaDescription:
      'After-hours coverage defined: phone-handling capacity outside business hours. Why it matters, how AI receptionists provide it without premium upcharges.',
    intro:
      'After-hours coverage refers to phone-handling capacity outside standard business hours, typically nights, weekends, and holidays. Most local businesses cover 40-50 hours per week with their staff or owner answering phones, and either send the other 118-128 hours to voicemail or pay a premium rate to a live answering service. The economics of after-hours coverage are surprisingly important. Roughly 30-50% of bookings on a deployed AI receptionist come from outside business hours. After-hours emergencies (HVAC outages, plumbing leaks, vet emergencies, urgent legal matters) cannot wait until morning, the first business to answer wins the job. Voicemail loses 75% of after-hours callers outright. Live answering services charge premium rates (typically 2-3x daytime per-minute) for after-hours coverage. AI receptionists, by contrast, run continuously at the same fixed monthly cost regardless of when calls come in, making after-hours coverage one of the most concrete value props of the category.',
    keyPoints: [
      'Phone-handling outside standard business hours',
      'Most local businesses cover only 40-50 of 168 weekly hours',
      '30-50% of typical SMB bookings happen after hours',
      'Live answering services charge 2-3x premium for after-hours',
      'AI receptionists provide it at the same fixed cost as business hours',
    ],
    related: [
      { href: '/24-7-ai-receptionist', label: '24/7 AI Receptionist' },
      {
        href: '/ai-receptionist-for-hvac-companies',
        label: 'For HVAC: 24/7 emergency dispatch',
      },
      {
        href: '/ai-receptionist-vs-answering-service',
        label: 'vs Answering Service',
      },
    ],
    faqs: [
      {
        question: 'Why is after-hours coverage important?',
        answer:
          '30-50% of typical SMB bookings happen outside business hours, and after-hours emergencies cannot wait until morning. Voicemail loses 75% of those callers outright.',
      },
      {
        question: 'Does Implenix charge a premium for after-hours coverage?',
        answer:
          'No. Coverage is continuous at the same fixed monthly cost. No upcharge for nights, weekends, or holidays.',
      },
      {
        question: 'Can the AI handle emergencies overnight?',
        answer:
          'Yes. Urgent-criteria rules trigger live transfer to your on-call line within seconds, even at 2 AM.',
      },
    ],
  },
  {
    slug: 'missed-call-recovery',
    term: 'Missed Call Recovery',
    shortDefinition:
      'The process of capturing pipeline that would otherwise have been lost to unanswered calls.',
    metaTitle: 'Missed Call Recovery, Definition + Math | Implenix Glossary',
    metaDescription:
      'Missed call recovery defined: capturing inbound pipeline that would have been lost to unanswered calls. Real ROI math and recovery techniques.',
    intro:
      'Missed call recovery is the process of capturing inbound pipeline that would otherwise be lost to unanswered calls. The recoverable opportunity is large, typical local businesses miss 40-60% of inbound calls during business hours and nearly 100% after hours. Missed-call recovery techniques range from primitive (voicemail-to-text + scheduled callbacks) to comprehensive (AI receptionist that picks up every call and converts directly). The economics depend on average client value and conversion rates: at $1,500 average client value and a 20% conversion rate on returned calls, every missed call represents roughly $300 of expected pipeline. For a business missing 60 calls a week, that is roughly $18,000 per week, $936,000 per year, of recoverable pipeline. The recovery rate matters too: voicemail-to-text recovers maybe 25% of those calls (the ones who leave a message), and scheduled callbacks lose conversion rapidly with delay. AI receptionist recovers the full set by picking up every call live, which is why it consistently shows the strongest ROI in the category.',
    keyPoints: [
      'Captures pipeline lost to unanswered calls',
      'Local businesses miss 40-60% of business-hour calls, ~100% after hours',
      'Voicemail-to-text recovers ~25% of misses; AI receptionist recovers nearly all',
      'Recovery value = (missed calls) × (conversion rate) × (avg client value)',
      'Highest-ROI use case for AI receptionists in service industries',
    ],
    related: [
      { href: '/audit', label: 'Run a missed-call audit' },
      { href: '/benefits-of-ai-receptionist', label: 'Benefits of an AI receptionist' },
      {
        href: '/ai-receptionist-vs-voicemail',
        label: 'AI Receptionist vs Voicemail',
      },
    ],
    faqs: [
      {
        question: 'How much pipeline is typically lost to missed calls?',
        answer:
          'For local-services SMBs, typically $5,000-$30,000/month. The exact figure depends on call volume, miss rate, average client value, and conversion rate on returned calls.',
      },
      {
        question: 'Does voicemail-to-text help with missed call recovery?',
        answer:
          'Marginally. It surfaces the message faster but does not solve the underlying problem: 75% of callers do not leave a message at all, and conversion drops with response delay.',
      },
      {
        question: 'How do I calculate my own missed-call cost?',
        answer:
          'Run our 60-second audit at /audit, it computes a directional estimate from your industry, average client value, and call volume profile.',
      },
    ],
  },
  {
    slug: 'natural-language-understanding',
    term: 'Natural Language Understanding (NLU)',
    shortDefinition:
      'AI subsystems that classify intent and extract entities from human speech or text.',
    metaTitle: 'Natural Language Understanding | Implenix Glossary',
    metaDescription:
      'NLU defined: the AI subsystems that classify intent and extract entities from speech or text. Core component of AI receptionists.',
    intro:
      "Natural Language Understanding (NLU) refers to the AI subsystems that interpret human-generated language, typically classifying caller intent (book_appointment, request_quote, ask_pricing, emergency, transfer_to_human, etc.) and extracting entities (address, phone number, scope, urgency, decision-maker). NLU sits between the speech-to-text layer (which produces raw text) and the dialogue management layer (which decides what the agent says next). In a modern AI receptionist, NLU runs on every conversational turn, the model classifies the most recent caller utterance against the defined intent set and pulls out any new entity values. The dialogue manager then uses the classification to branch the script: a book_appointment intent goes to the booking flow, an emergency intent triggers urgent-criteria routing, a transfer-to-human request triggers a warm transfer. NLU quality directly drives agent quality, high-precision intent classification means the agent rarely misroutes a caller; high-recall entity extraction means follow-up doesn't need a fact-finding callback.",
    keyPoints: [
      'Classifies caller intent (book, quote, transfer, emergency, etc.)',
      'Extracts entities (address, phone, scope, urgency)',
      'Sits between speech-to-text and dialogue management',
      'Runs on every conversational turn',
      'Directly drives agent routing accuracy and intake quality',
    ],
    related: [
      {
        href: '/how-does-an-ai-receptionist-work',
        label: 'How an AI receptionist works',
      },
      { href: '/glossary/voice-ai', label: 'Voice AI' },
      { href: '/glossary/call-routing', label: 'Call routing' },
    ],
    faqs: [
      {
        question: 'How is NLU different from large language models?',
        answer:
          'NLU is the task, classifying intent and extracting entities. Modern NLU often uses LLMs as the underlying model, but the task itself is narrower than open-ended generation.',
      },
      {
        question: 'How accurate does NLU need to be for an AI receptionist?',
        answer:
          'High enough that the agent rarely misroutes calls. We tune NLU per industry during onboarding because intent vocabulary varies, "emergency" in HVAC differs from "emergency" in a vet practice.',
      },
      {
        question: 'What happens when NLU misclassifies a caller intent?',
        answer:
          'Defined fallback rules trigger. Common pattern: ask a clarifying question, then if confidence is still low, transfer to a human.',
      },
    ],
  },
  {
    slug: 'sip-trunk',
    term: 'SIP Trunk',
    shortDefinition:
      'A virtual phone connection that carries voice calls over the internet.',
    metaTitle: 'SIP Trunk, Definition | Implenix Glossary',
    metaDescription:
      'SIP trunk defined: virtual phone connection carrying voice calls over IP. How AI receptionists use SIP for inbound and outbound call handling.',
    intro:
      'A SIP trunk is a virtual phone connection that carries voice calls over the internet using the Session Initiation Protocol (SIP). It is the modern equivalent of a traditional analog or digital phone line: instead of physical wiring to a telephone exchange, a SIP trunk routes calls through an IP network to and from a SIP-capable endpoint. SIP trunks are the foundation of modern telephony and the integration layer that makes AI receptionists possible. When a caller dials a business number, the call routes from the caller\'s carrier to the SIP trunk, which delivers it to the AI receptionist endpoint as a streaming audio session. The agent answers, runs the call, and either holds the call to completion or warm-transfers it to a human via another SIP leg. SIP also handles outbound calls (for AI follow-up sequences) and conference bridges (for multi-party calls). Most modern phone providers, Twilio, Telnyx, Bandwidth, and many regional VoIP carriers, support SIP trunking as a standard offering.',
    keyPoints: [
      'Virtual phone connection over the internet using SIP protocol',
      'Replaces traditional analog/digital phone lines',
      'Foundation of modern VoIP and AI voice agents',
      'Carries inbound calls to the AI agent and outbound calls from it',
      'Supported by Twilio, Telnyx, Bandwidth, and most modern carriers',
    ],
    related: [
      {
        href: '/how-does-an-ai-receptionist-work',
        label: 'How an AI receptionist works',
      },
      { href: '/glossary/call-routing', label: 'Call routing' },
      { href: '/virtual-ai-receptionist', label: 'Virtual AI receptionist' },
    ],
    faqs: [
      {
        question: 'Do I need to manage SIP infrastructure myself?',
        answer:
          'No. Implenix handles the SIP trunk on our side. Your existing business number forwards (or ports) to our endpoint via standard call-forwarding configured at your phone provider.',
      },
      {
        question: 'Can SIP trunks handle high call volume?',
        answer:
          'Yes. SIP supports unlimited concurrent calls at the protocol level; carrier-imposed concurrency limits are configurable. The AI agent itself has no concurrency cap.',
      },
      {
        question: 'Is SIP secure?',
        answer:
          'SIP can be encrypted via TLS for signaling and SRTP for media. Implenix uses encrypted SIP for all customer call routing.',
      },
    ],
  },
  {
    slug: 'ivr',
    term: 'IVR (Interactive Voice Response)',
    shortDefinition:
      'Menu-based phone systems that route callers via DTMF digit selection.',
    metaTitle: 'IVR, Definition | Implenix Glossary',
    metaDescription:
      "IVR defined: menu-based phone systems that route callers via 'press 1 for sales.' Why customers hate it and how AI replaces it.",
    intro:
      'IVR (Interactive Voice Response) refers to menu-based phone systems that route callers by DTMF (touch-tone) digit selection or simple speech recognition, the familiar "press 1 for sales, press 2 for support" experience. IVR predates modern voice AI by several decades and remains widespread because it is cheap and predictable. It is also universally hated by callers, multiple studies consistently put IVR among the worst customer-service experiences across industries, with 40-60% of callers hanging up in the menu. IVR exists for one core reason: routing inbound calls to the right human or queue. It does not book appointments, qualify leads, or capture intake, those tasks fall to whoever picks up after the IVR finishes. AI receptionists supersede IVR by replacing the menu with an actual conversation, classifying intent from natural language rather than digit selection, and resolving the request directly (booking, intake, transfer) rather than just routing. For most local businesses, an AI receptionist replaces an IVR plus a receptionist plus voicemail with one system.',
    keyPoints: [
      'Menu-based phone routing via DTMF digit selection',
      'Predates modern voice AI by decades',
      'High hangup rates (40-60% on most studies)',
      'Useful only for routing, not for booking/intake/qualification',
      'AI receptionists replace IVR with conversational interaction',
    ],
    related: [
      {
        href: '/ai-receptionist-vs-ivr-system',
        label: 'AI Receptionist vs IVR',
      },
      { href: '/glossary/call-routing', label: 'Call routing' },
      { href: '/', label: 'AI Receptionist' },
    ],
    faqs: [
      {
        question: 'Is IVR still useful in 2026?',
        answer:
          'For purely routing-oriented use cases (large enterprises with many internal extensions), IVR can still play a role. For most local-business inbound, AI receptionist is a strict upgrade.',
      },
      {
        question: 'Can I replace my IVR with an AI receptionist?',
        answer:
          'Yes. Most Implenix deployments replace the IVR alongside the receptionist and voicemail. The migration is invisible to callers, the same number, faster pickup, real conversation.',
      },
      {
        question: 'Do AI receptionists have any IVR-like features?',
        answer:
          'Yes, for callers who explicitly want a specific extension or department, the agent honors that request directly. The difference is the agent does not require menu navigation by default.',
      },
    ],
  },
];

export const GLOSSARY_SLUGS = GLOSSARY_ENTRIES.map((e) => e.slug);

export function getGlossaryEntry(slug: string): GlossaryEntry | undefined {
  return GLOSSARY_ENTRIES.find((e) => e.slug === slug);
}
