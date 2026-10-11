// Programmatic industry profiles for /ai-receptionist-for-[slug].
//
// One profile per industry. Each is hand-written and unique, Google
// flags templated doorway pages, so every intro / pain point / FAQ
// here describes the real shape of that industry's call traffic.
//
// The 8 industries that have rich MDX content (hvac-companies, dentists,
// real-estate, law-firms, plumbers, med-spas, auto-repair, roofers) are
// NOT included here, the page route renders those from MDX.

export type ProfilePainPoint = { title: string; description: string };
export type ProfileUseCase = { title: string; description: string };
export type ProfileStat = { number: string; label: string };
export type ProfileFaq = { question: string; answer: string };

export type IndustryProfile = {
  slug: string;
  name: string; // plural display name
  nicheSingular: string; // singular noun for sentence use
  metaTitle: string; // ≤ 60 chars
  metaDescription: string; // ≤ 155 chars
  targetKeyword: string;
  relatedKeywords: string[];
  intro: string; // 200+ words unique
  heroStat: string;
  heroStatLabel: string;
  avgWeeklyCalls: number;
  avgClientValue: number;
  painPoints: ProfilePainPoint[]; // 3
  useCases: ProfileUseCase[]; // 3
  stats: ProfileStat[]; // 3
  testimonialQuote: string;
  testimonialAuthor: string;
  faqs: ProfileFaq[]; // 5
  caseStudySlug: string;
  related: string[]; // industry slugs
};

export const INDUSTRY_PROFILES: IndustryProfile[] = [
  {
    slug: 'medical-practices',
    name: 'Medical Practices',
    nicheSingular: 'medical practice',
    metaTitle: 'AI Receptionist for Medical Practices | Implenix',
    metaDescription:
      'AI receptionist for medical practices. Book new patients, handle insurance questions, route refill requests, and stop losing intake calls to voicemail.',
    targetKeyword: 'ai receptionist for medical practices',
    relatedKeywords: [
      'medical office answering service',
      'patient intake automation',
      'medical practice phone ai',
      'hipaa ai receptionist',
    ],
    intro:
      "Medical practices live and die by the front desk. New-patient intake calls land while staff is checking in the patient already standing at the counter. Insurance verification calls eat hours. Refill requests pile up on hold. The result is the same every time: high-intent callers hit voicemail, then call the practice down the street that picked up. Implenix takes that pressure off. The AI receptionist for medical practices answers every inbound call within one ring, runs your intake script, verifies insurance against the questions you define, and books the appointment directly into your PMS. It distinguishes between a new patient request, a refill question, an insurance issue, and a true clinical concern, and routes each one according to rules your team approves. Refills go to the queue your nurse already monitors. Clinical questions transfer live. Cold solicitations get screened. Everything else gets booked. After every call, the contact is updated, the recording is archived, and the next-step notification goes out. Practices that switch see new-patient capture rates jump from the typical 45-55% to above 90% inside the first month. Front desk staff stop drowning. Providers stop walking out at 6 PM to a stack of voicemail. And the practice stops losing six-figure pipeline to a phone system that wasn't designed for the volume.",
    heroStat: '+38%',
    heroStatLabel: 'new-patient bookings in 30 days',
    avgWeeklyCalls: 280,
    avgClientValue: 1400,
    painPoints: [
      {
        title: 'New-patient intake collides with in-office check-ins',
        description:
          'When the front desk is checking in a patient, every other caller hits voicemail. New-patient acquisition cost is wasted on a call that never gets answered.',
      },
      {
        title: 'Insurance verification eats half the day',
        description:
          'Insurance is the most-asked question and the most repetitive. Staff spends real labor hours on calls that follow a script.',
      },
      {
        title: 'Refill requests pile up on hold',
        description:
          'Refill calls feel non-urgent to staff but urgent to patients. Without a clean queue, both sides get frustrated and the patient relationship degrades.',
      },
    ],
    useCases: [
      {
        title: 'New-patient intake with insurance pre-screen',
        description:
          'Captures demographic, insurance carrier, member ID, chief complaint. Books only if your accepted-payer rules pass.',
      },
      {
        title: 'Refill request triage routed to your nurse queue',
        description:
          'Logs medication, prescriber, pharmacy, and patient ID directly into your PMS as a refill task, no transcription needed.',
      },
      {
        title: 'After-hours clinical escalation',
        description:
          'Callers who describe symptoms matching your urgent-criteria list are transferred to your on-call nurse line in real time.',
      },
    ],
    stats: [
      { number: '+38%', label: 'new-patient bookings' },
      { number: '<60s', label: 'average pickup time' },
      { number: '-42%', label: 'voicemail abandonment' },
    ],
    testimonialQuote:
      'Our front desk used to answer 6 out of every 10 calls. Now we answer all of them, and our front desk has the bandwidth to actually look up at patients walking in.',
    testimonialAuthor: 'Practice administrator, primary care group',
    faqs: [
      {
        question: 'Is the Implenix AI receptionist HIPAA compliant?',
        answer:
          'Yes. We sign a BAA, encrypt PHI in transit and at rest, restrict access by role, and follow HIPAA minimum-necessary principles. Audit logs are available on request.',
      },
      {
        question: 'Does it integrate with our practice management system?',
        answer:
          'Most major PMS platforms integrate via direct API or a webhook bridge. Confirm during scoping, we have shipped integrations with Athenahealth, Epic, eClinicalWorks, NextGen, and others.',
      },
      {
        question: 'Can it handle prescription refill questions?',
        answer:
          'Yes. The agent captures the medication name, prescriber, pharmacy, and patient ID, then writes the refill task into your PMS or a defined queue. It does not provide clinical advice.',
      },
      {
        question: 'How does it handle insurance verification?',
        answer:
          'It collects carrier, member ID, group number, and the patient\'s reason for visit, then either books or screens out callers based on your accepted-payer rules.',
      },
      {
        question: 'Will patients know they are talking to an AI?',
        answer:
          'We disclose where required by jurisdiction. The voice is natural and warm. Most patients do not realize, and the ones who do find the booking experience faster than a busy front desk.',
      },
    ],
    caseStudySlug: 'ohio-dental',
    related: ['dentists', 'chiropractors', 'veterinarians'],
  },

  {
    slug: 'electricians',
    name: 'Electricians',
    nicheSingular: 'electrical contractor',
    metaTitle: 'AI Receptionist for Electricians | Implenix',
    metaDescription:
      'AI receptionist for electricians. Capture emergency outages, qualify jobs, and dispatch the right tech 24/7, residential and commercial.',
    targetKeyword: 'ai receptionist for electricians',
    relatedKeywords: [
      'electrician answering service',
      'electrical contractor dispatch ai',
      'electrician call automation',
      '24/7 electrician answering',
    ],
    intro:
      "Electricians lose money to two things they cannot control with their hands full: power-out calls at 2 AM and estimate calls during the workday. Both share the same problem, the phone rings while everyone capable of answering is on a roof, in a panel, or driving between sites. Voicemail is an instant lost job for a panel replacement, a generator install, or an emergency outage. Implenix is the AI receptionist for electricians: it picks up inside one ring, triages residential vs commercial, sorts emergencies from estimate requests, and books the right tech to the right window, all written back to your dispatch software before the next call comes in. The agent runs the intake script your team would run if they had time: address, age of panel, scope of work, urgency, accepted payment. For storm-driven outage spikes, it scales without overtime. For routine bid calls, it captures specs in detail your tech can actually act on. And for the calls that should reach a human, a long-time commercial client, a complex bid over a threshold, or a frustrated caller, it transfers live within seconds. Electricians who deploy Implenix typically see emergency-call capture climb from the low 40s to above 90 percent within the first month, and crews report fewer on-site surprises because intake quality is consistent across every call.",
    heroStat: '+92%',
    heroStatLabel: 'after-hours emergency capture rate',
    avgWeeklyCalls: 165,
    avgClientValue: 850,
    painPoints: [
      {
        title: 'Outage calls happen when no one can answer',
        description:
          'A blown panel at 9 PM is a $1,500-$5,000 job. If voicemail picks up, the customer calls the next number on the list and that job is gone for good.',
      },
      {
        title: 'Estimates get scoped poorly over rushed phone calls',
        description:
          'A rushed two-minute call captures half the information. The tech shows up to a different scope, the customer is annoyed, and the close rate drops.',
      },
      {
        title: 'Commercial vs residential routing is ad hoc',
        description:
          'Most shops route every call to the same dispatcher. Commercial accounts with SLAs sit in the same queue as residential bid calls.',
      },
    ],
    useCases: [
      {
        title: 'Triage emergency outage with code-flag rules',
        description:
          'Callers describing burning smells, sparking, or no-power emergencies route to dispatch immediately. Routine fixes get booked into the next available window.',
      },
      {
        title: 'Capture estimate scope your tech can actually use',
        description:
          'Panel age, square footage, EV charger or generator scope, permit history. The data writes back to your CRM with photos collected via SMS.',
      },
      {
        title: 'Live transfer for commercial accounts and VIPs',
        description:
          'A defined allow-list routes long-term clients and accounts on contract straight to your account manager, no script, no hold.',
      },
    ],
    stats: [
      { number: '+92%', label: 'after-hours capture rate' },
      { number: '<45s', label: 'average pickup time' },
      { number: '+27%', label: 'estimate close rate' },
    ],
    testimonialQuote:
      'Storm season used to mean missing 30 calls a week. Last quarter we missed two. The agent dispatched the rest before I picked up the truck.',
    testimonialAuthor: 'Owner, regional electrical contractor',
    faqs: [
      {
        question: 'Does it integrate with ServiceTitan, Housecall Pro, Jobber?',
        answer:
          'Yes. We support direct integrations and webhooks for the major dispatch platforms. Job records, contact updates, and tech notifications flow back automatically.',
      },
      {
        question: 'Can it handle commercial accounts with SLAs separately?',
        answer:
          'Yes. Account-based routing keeps commercial and residential queues distinct. Contracted accounts get priority handling and live transfer to the right account manager.',
      },
      {
        question: 'Will the agent quote pricing?',
        answer:
          'Within ranges your team approves, typical service-call ranges and panel-replacement ballparks. Final quotes always go to a human after the on-site assessment.',
      },
      {
        question: 'How does it handle outage emergencies?',
        answer:
          'Callers describing burning, sparks, or full outages are flagged urgent and dispatched immediately. The agent collects address, panel access, and pet/animal info before the tech rolls.',
      },
      {
        question: 'How fast can we deploy?',
        answer:
          '7 to 14 business days for most shops. We can compress for storm-season prep.',
      },
    ],
    caseStudySlug: 'pa-hvac-experts',
    related: ['plumbers', 'hvac-companies', 'contractors'],
  },

  {
    slug: 'contractors',
    name: 'General Contractors',
    nicheSingular: 'general contractor',
    metaTitle: 'AI Receptionist for Contractors | Implenix',
    metaDescription:
      'AI receptionist for general contractors. Qualify project leads, route subs, and stop losing six-figure bids to voicemail.',
    targetKeyword: 'ai receptionist for contractors',
    relatedKeywords: [
      'general contractor answering service',
      'construction call automation',
      'contractor lead qualification ai',
      'contractor receptionist',
    ],
    intro:
      "A general contractor's pipeline is built from phone calls that arrive at the worst possible time, mid-pour, on a ladder, in a meeting with a sub. Every missed call is a project bid that walks across the street to the GC who picked up. Implenix is the AI receptionist for contractors: it answers every inbound call inside one ring, qualifies the lead by project type, scope, budget range, and timeline, and books the site visit directly into your calendar. The questions match what you would ask if you had time, square footage, design status, permit posture, financing readiness, decision-makers involved. Real estate agents and homeowners get a different intake than commercial property managers. Sub coordination calls, change-order questions, and inspector follow-ups route to the people who can actually answer. The agent screens out tire-kickers (no permit, no decision-maker, no realistic budget) so your project manager only sees calls worth a site visit. After every call, the lead lands in your CRM with full context, photos collected via SMS, and a follow-up scheduled. Contractors deploying Implenix tend to see qualified site-visit volume rise 40-60% in the first quarter while their PMs report fewer wasted truck rolls because the intake quality stays consistent across every call.",
    heroStat: '+54%',
    heroStatLabel: 'qualified site visits booked per quarter',
    avgWeeklyCalls: 95,
    avgClientValue: 18500,
    painPoints: [
      {
        title: 'Bid calls hit voicemail when crews are on site',
        description:
          'Six-figure remodel inquiries die on voicemail because the owner is in a wall pocket. The next contractor on Google answers and wins the job.',
      },
      {
        title: 'Tire-kickers waste truck-roll budget',
        description:
          'Every site visit costs real time and gas. Without intake screening, half end up with no permits, no budget, no decision-makers.',
      },
      {
        title: 'Sub coordination calls collide with sales calls',
        description:
          'Sub schedules, change orders, and inspector calls drown out new-bid calls in the same queue. Sales suffers because operations is loud.',
      },
    ],
    useCases: [
      {
        title: 'Project intake with permit + financing pre-screen',
        description:
          'Captures scope, square footage, permit posture, financing status, decision-makers. Site visits only get booked when your minimum-bar rules pass.',
      },
      {
        title: 'Sub and inspector calls routed to operations',
        description:
          'Defined transfer rules pull sub and inspector calls out of the new-business queue and into the right ops channel.',
      },
      {
        title: 'Photo collection via SMS during the intake call',
        description:
          'Mid-call, the agent texts a link the homeowner can use to send job photos. Files attach to the CRM lead before your PM sees it.',
      },
    ],
    stats: [
      { number: '+54%', label: 'qualified site visits' },
      { number: '-31%', label: 'wasted truck rolls' },
      { number: '<60s', label: 'average pickup time' },
    ],
    testimonialQuote:
      'We used to send our PM on six site visits a week. Now five of those six actually have a budget and a permit, and the sixth just gets a polite no thanks.',
    testimonialAuthor: 'Owner, residential GC',
    faqs: [
      {
        question: 'Does it integrate with Buildertrend, CoConstruct, JobTread?',
        answer:
          'Yes. We integrate with the major construction CRMs and project tools. Leads, photos, and intake notes write back automatically.',
      },
      {
        question: 'Can it qualify leads by project type and budget?',
        answer:
          'Yes. We define your minimum-bar rules, project type, scope range, decision-maker, financing status. Only leads that pass get a site visit booked.',
      },
      {
        question: 'How does it handle change orders and sub coordination?',
        answer:
          'Change orders and sub calls follow custom transfer rules into your ops channel, different from the new-business queue.',
      },
      {
        question: 'What about commercial vs residential?',
        answer:
          'Account-based routing distinguishes commercial property managers from homeowners. Each gets its own intake script and routing rules.',
      },
      {
        question: 'How quickly can we go live?',
        answer:
          '10 to 14 business days for a typical shop. Faster if you already have a CRM with API access.',
      },
    ],
    caseStudySlug: 'columbus-property',
    related: ['electricians', 'plumbers', 'roofers'],
  },

  {
    slug: 'salons',
    name: 'Salons',
    nicheSingular: 'salon',
    metaTitle: 'AI Receptionist for Salons | Implenix',
    metaDescription:
      'AI receptionist for salons. Book appointments, handle stylist requests, and reduce no-shows, without keeping the front desk on the phone all day.',
    targetKeyword: 'ai receptionist for salons',
    relatedKeywords: [
      'salon booking ai',
      'salon answering service',
      'hair salon receptionist',
      'beauty salon call automation',
    ],
    intro:
      "Salons run on appointment density. Every minute the front desk spends on a booking call is a minute they're not handling the client in the chair. The math is brutal: a 6-chair salon with one front-desk staff fields ~180 booking calls a week, and on a busy Saturday at least 30% of them hit voicemail. Each missed call is a $80-$250 service that booked somewhere else. Implenix is the AI receptionist for salons: it answers every inbound inside one ring, books directly into Boulevard, Vagaro, Mindbody, or whatever you run, respects stylist availability and capacity rules, and reduces no-shows with multi-touch reminder calls. Specific stylist requests get matched against the booking calendar, the agent will not book Maria for an appointment when she's already double-booked. New-client intake captures referral source, hair history, and product allergies. Group bookings and bridal parties get routed to your senior coordinator. Reschedules and cancellations happen live without staff involvement. Walk-ins still get the personal touch from your front desk. Salons that ship Implenix typically reclaim 15-20 hours per week per front-desk team member and watch no-show rates drop 25-30% inside the first quarter. The chair stays full. The front desk stays out of phone hell.",
    heroStat: '+19h',
    heroStatLabel: 'reclaimed per week per front-desk team member',
    avgWeeklyCalls: 175,
    avgClientValue: 165,
    painPoints: [
      {
        title: 'Front desk drowning in booking calls during peak hours',
        description:
          'Saturday afternoons mean 40+ calls and a lobby full of clients. Front desk picks one to lose and it is usually the phone.',
      },
      {
        title: 'Stylist availability changes faster than the phone updates',
        description:
          'A stylist runs late, calls out, or shifts. The booking calendar updates but the front desk is behind, so calls quote times that no longer exist.',
      },
      {
        title: 'No-shows break the whole day',
        description:
          'Without consistent confirmation calls, no-show rates run 18-25%. Each one is dead chair time and a stylist losing money.',
      },
    ],
    useCases: [
      {
        title: 'Live booking against your salon software',
        description:
          'Boulevard, Vagaro, Mindbody, GlossGenius, the agent reads real availability and respects capacity rules per chair.',
      },
      {
        title: 'Stylist-specific request handling',
        description:
          'When a client asks for Maria, the agent checks her schedule, offers her next openings, and books only if she is actually available.',
      },
      {
        title: 'Multi-touch confirmation cuts no-show rate',
        description:
          'Outbound confirmation call 24 hours before, plus an SMS reminder. Reschedules happen live, not at the chair.',
      },
    ],
    stats: [
      { number: '+19h', label: 'reclaimed per FTE per week' },
      { number: '-28%', label: 'no-show rate' },
      { number: '+24%', label: 'after-hours bookings' },
    ],
    testimonialQuote:
      'Saturdays used to be chaos. Now the front desk is actually with our clients and the phone still gets answered.',
    testimonialAuthor: 'Owner, multi-chair salon',
    faqs: [
      {
        question: 'Does it integrate with Boulevard, Vagaro, Mindbody?',
        answer:
          'Yes. We support the major salon booking systems via direct API or webhook. Appointments write back live and capacity rules are respected per chair.',
      },
      {
        question: 'Can it handle requests for a specific stylist?',
        answer:
          'Yes. Stylist-aware booking, the agent checks the requested stylist\'s availability and only books real openings.',
      },
      {
        question: 'How does it handle cancellations and reschedules?',
        answer:
          'Live. The agent moves the booking, frees the slot, and writes the change back. No staff involvement needed for routine moves.',
      },
      {
        question: 'Can it handle group bookings or bridal parties?',
        answer:
          'Group bookings route to your senior coordinator via live transfer or callback queue, depending on your rules.',
      },
      {
        question: 'How long is deployment?',
        answer:
          '7 to 10 business days for most salons. Faster if you are already on a supported booking platform.',
      },
    ],
    caseStudySlug: 'ohio-dental',
    related: ['med-spas', 'spas', 'chiropractors'],
  },

  {
    slug: 'accountants',
    name: 'Accountants',
    nicheSingular: 'accounting firm',
    metaTitle: 'AI Receptionist for Accountants | Implenix',
    metaDescription:
      'AI receptionist for accounting firms and CPAs. Handle tax-season spikes, qualify new client intake, and route document requests live.',
    targetKeyword: 'ai receptionist for accountants',
    relatedKeywords: [
      'accounting firm answering service',
      'cpa receptionist ai',
      'tax season call handling',
      'accountant lead intake',
    ],
    intro:
      "Tax season for an accounting firm is a six-week phone tsunami sitting on top of an already-saturated calendar. Document requests, status checks, new-client intake, and a steady stream of \"can you just take a quick look\" calls collide with hard filing deadlines. Every call answered by an associate is billable hours not earned. Every call missed is a prospect filing somewhere else. Implenix is the AI receptionist for accountants: it answers every inbound inside one ring, runs your client intake script, captures business structure, prior preparer, document readiness, and entity complexity, then books the right service tier into the right partner's calendar. Existing clients get fast-path routing, name and SSN last-four lookup pulls them out of the new-client queue and into status-check or document-request handling. Document collection happens via SMS or secure portal links the agent sends mid-call. Engagement-letter status, e-file confirmations, and IRS notice handling each have their own intake script. Cold calls and tax-software solicitations get screened. The result: associates stay billable, partners only see qualified consults, and the firm captures 40-60% more new-business calls during peak season without hiring temporary staff. Off-season, the agent stays warm, handling year-round tax planning and bookkeeping intake without paying for capacity you do not need.",
    heroStat: '+47%',
    heroStatLabel: 'new-client intake during tax season',
    avgWeeklyCalls: 110,
    avgClientValue: 2200,
    painPoints: [
      {
        title: 'Tax season buries the phone line for 6 straight weeks',
        description:
          'March-April call volume runs 4-5x off-season. Without surge capacity, new-client calls die in voicemail and existing clients get frustrated.',
      },
      {
        title: 'Associates burn billable hours on intake and status checks',
        description:
          'Every "did you get my W-2" call answered by a senior associate is real money lost. The labor cost shows up on the P&L every April.',
      },
      {
        title: 'Document collection is a constant friction point',
        description:
          'Clients say they sent it; the firm never received it. Without a clean intake-and-receipt flow, returns stall and deadlines slip.',
      },
    ],
    useCases: [
      {
        title: 'New-client intake with entity-type triage',
        description:
          'Sole prop vs S-corp vs C-corp vs partnership routes to different service tiers and partners. Engagement complexity is captured up front.',
      },
      {
        title: 'Existing-client status-check handling',
        description:
          'Caller verification pulls existing clients out of the new-business queue. Status, document receipts, and e-file confirmations resolve without staff involvement.',
      },
      {
        title: 'Document collection via SMS portal link',
        description:
          'Mid-call the agent texts a secure portal link. Documents are attached to the engagement before the call ends.',
      },
    ],
    stats: [
      { number: '+47%', label: 'new-client intake at peak' },
      { number: '-22 hrs', label: 'partner phone time per week' },
      { number: '100%', label: 'after-hours coverage' },
    ],
    testimonialQuote:
      'Last March we kept up. That has not happened in 12 years. The agent ate the call volume so my partners could actually file returns.',
    testimonialAuthor: 'Managing partner, regional CPA firm',
    faqs: [
      {
        question: 'Does it integrate with our tax software and CRM?',
        answer:
          'Yes. We support direct integrations with the major practice-management systems (Karbon, Canopy, TaxDome) and webhook-based handoff to anything else.',
      },
      {
        question: 'Can it scale for tax-season call spikes?',
        answer:
          'Yes. Concurrent capacity is not capped per agent. The same system handles March 15 and August 15 with no overtime.',
      },
      {
        question: 'How does it handle existing-client status checks?',
        answer:
          'Caller verification (last-four SSN or client number) routes existing clients into a separate flow. Status and document checks resolve without escalation.',
      },
      {
        question: 'Can it handle document collection?',
        answer:
          'Yes. The agent texts a secure portal link mid-call, the client uploads, and the documents attach to the engagement record automatically.',
      },
      {
        question: 'Is it appropriate for sensitive tax information?',
        answer:
          'We follow IRS Publication 4557 guidance on safeguarding client data: encrypted in transit and at rest, role-based access, audit logs.',
      },
    ],
    caseStudySlug: 'columbus-property',
    related: ['law-firms', 'mortgage-brokers', 'marketing-agencies'],
  },

  {
    slug: 'marketing-agencies',
    name: 'Marketing Agencies',
    nicheSingular: 'marketing agency',
    metaTitle: 'AI Receptionist for Marketing Agencies | Implenix',
    metaDescription:
      'AI receptionist for marketing and creative agencies. Qualify RFPs, screen client referrals, and stop dropping six-figure deals to voicemail.',
    targetKeyword: 'ai receptionist for marketing agencies',
    relatedKeywords: [
      'agency lead qualification ai',
      'marketing agency answering service',
      'agency receptionist',
      'rfp intake automation',
    ],
    intro:
      "Marketing agencies have a unique phone problem: most inbound calls are either six-figure RFPs or someone trying to sell you SEO. The cost of mis-routing those is asymmetric. The wrong filter sends a great-fit RFP to voicemail and forwards a cold pitch to your founder. Most agencies handle this by routing everything to a junior account person, which means the RFP either gets a generic response or sits in a queue for two days. By then, the prospect has talked to three other agencies. Implenix is the AI receptionist for marketing agencies: it answers every inbound inside one ring, runs RFP qualification (industry, budget range, timeline, existing-vendor status, decision-maker confirmation), and either books a discovery call directly into your founder or strategy lead's calendar or sends a polite no-thanks to anything below your minimum bar. Cold pitches and vendor solicitations get screened. Existing-client account questions route to the right account team in real time. Press and partnership inquiries route to your comms team. The agent learns your service tiers and minimum project size, so an inquiry for a $5K logo never lands on a calendar built for $250K retainers. After every qualified call, the lead lands in HubSpot or whatever you run with full context, including a recording your business development lead can listen to before the discovery call.",
    heroStat: '+62%',
    heroStatLabel: 'qualified RFP discovery calls booked',
    avgWeeklyCalls: 65,
    avgClientValue: 12000,
    painPoints: [
      {
        title: 'Every cold pitch ends up on the founder\'s desk',
        description:
          'The lazy filter sends every "let me sell you SEO" call straight to leadership. Real RFPs get lost in the same queue.',
      },
      {
        title: 'Six-figure inquiries decay if not answered same-day',
        description:
          'A prospect calling three agencies on Tuesday morning makes a shortlist by Tuesday afternoon. If you call back Wednesday, you are off the list.',
      },
      {
        title: 'Junior account staff cannot qualify high-end retainers',
        description:
          'Routing inbound to a coordinator means good-fit prospects get a generic intake. Bad fit, you waste a discovery slot. Either way, lost.',
      },
    ],
    useCases: [
      {
        title: 'RFP qualification against your minimum-project rules',
        description:
          'Industry, budget range, timeline, decision-makers, captured up front. Below-floor inquiries get a polite no-thanks. Above-floor get booked into discovery.',
      },
      {
        title: 'Existing-client routing to the right account team',
        description:
          'Caller verification pulls clients out of the new-business queue and into their pod\'s account-management line.',
      },
      {
        title: 'Cold-pitch and vendor-solicitation screening',
        description:
          'Pattern-matched solicitations route to a callback queue your ops team reviews weekly, never to a founder.',
      },
    ],
    stats: [
      { number: '+62%', label: 'qualified discovery calls' },
      { number: '<2 min', label: 'response time on inbound' },
      { number: '-89%', label: 'cold-pitch noise to leadership' },
    ],
    testimonialQuote:
      'Our discovery slots used to be 50% tire-kickers. Now they are 90% real RFPs. Our close rate doubled because we stopped wasting strategist time on bad fits.',
    testimonialAuthor: 'Founder, mid-market agency',
    faqs: [
      {
        question: 'Does it integrate with HubSpot, Salesforce, or our CRM?',
        answer:
          'Yes. Direct integrations with the major agency CRMs. Calls, transcripts, and qualified-lead notes write back automatically.',
      },
      {
        question: 'How do we set the minimum-project bar?',
        answer:
          'You define it during scoping, minimum retainer, minimum project size, accepted industries, anti-fit signals (e.g. crypto, MLM). The agent enforces it.',
      },
      {
        question: 'Can it handle press and partnership inquiries differently?',
        answer:
          'Yes. Press and partnership calls follow their own intake path and route to your comms or partnerships lead.',
      },
      {
        question: 'Will it screen out cold pitches without offending callers?',
        answer:
          'The agent gives every caller a respectful response. Cold pitches get a "we evaluate vendor inquiries quarterly, leave details" path.',
      },
      {
        question: 'How long is deployment?',
        answer:
          '7 to 10 business days. Most agencies are live in two weeks with their qualification logic tuned.',
      },
    ],
    caseStudySlug: 'columbus-property',
    related: ['accountants', 'law-firms', 'real-estate'],
  },

  {
    slug: 'cleaning-services',
    name: 'Cleaning Services',
    nicheSingular: 'cleaning service',
    metaTitle: 'AI Receptionist for Cleaning Services | Implenix',
    metaDescription:
      'AI receptionist for residential and commercial cleaning services. Book recurring jobs, handle key handoffs, and stop dropping calls during peak hours.',
    targetKeyword: 'ai receptionist for cleaning services',
    relatedKeywords: [
      'cleaning company answering service',
      'maid service booking ai',
      'commercial cleaning call automation',
      'cleaning business receptionist',
    ],
    intro:
      "A cleaning company runs on recurring revenue and tight scheduling. Your dispatcher is juggling key handoffs, gate codes, parking instructions, and the customer who wants to add a deep clean to next Thursday's appointment, all while the phone rings off the hook with new-customer calls. Most cleaning operators handle this by running their phone through a single dispatcher who picks up when she can. Half the time she cannot. Implenix is the AI receptionist for cleaning services: it answers every inbound inside one ring, books one-time and recurring jobs against your real availability, captures square footage / bathroom count / pet info / access instructions, and handles routine schedule changes without involving your dispatcher. New-customer intake captures the questions that actually matter, frequency, scope, surfaces, allergens, so your crew shows up ready. Recurring customers get fast-path identification: caller ID matches an active account, the agent skips intake and goes straight to schedule changes or add-ons. Commercial accounts with SLAs route to your account manager. Cancellations write back live so the slot reopens. The result: cleaning operators reclaim 12-15 hours per week of dispatcher phone time, capture 30-40% more after-hours bookings, and stop losing recurring customers to operational friction. The crew shows up to clean, not to apologize.",
    heroStat: '+34%',
    heroStatLabel: 'after-hours bookings captured',
    avgWeeklyCalls: 130,
    avgClientValue: 220,
    painPoints: [
      {
        title: 'Dispatcher juggles phone and schedule simultaneously',
        description:
          'One person answering the phone while moving keys, gate codes, and crew assignments. The phone always loses.',
      },
      {
        title: 'Recurring customers churn over scheduling friction',
        description:
          'A customer calls to move next Thursday, hits voicemail, tries the cleaner across town. By the time you call back the relationship is gone.',
      },
      {
        title: 'Commercial SLA calls sit in the same queue as residential bids',
        description:
          'A property manager with a contracted SLA expects priority. They will not get it from a queue that treats them like a new homeowner inquiry.',
      },
    ],
    useCases: [
      {
        title: 'New-customer intake with scope + access capture',
        description:
          'Square footage, bathrooms, pets, access instructions, allergens. The crew arrives knowing exactly what they are walking into.',
      },
      {
        title: 'Recurring customer fast-path with caller ID',
        description:
          'Active accounts skip intake. The agent goes directly to schedule changes, add-ons, or notes for the next visit.',
      },
      {
        title: 'Commercial account routing with SLA priority',
        description:
          'Allow-listed property managers and commercial accounts route to your account manager via live transfer.',
      },
    ],
    stats: [
      { number: '+34%', label: 'after-hours bookings' },
      { number: '-15h', label: 'dispatcher phone time / week' },
      { number: '<60s', label: 'average pickup time' },
    ],
    testimonialQuote:
      'My dispatcher used to spend half the day on the phone. Now she runs the schedule, handles exceptions, and the routine calls just happen.',
    testimonialAuthor: 'Owner, residential cleaning service',
    faqs: [
      {
        question: 'Does it integrate with Jobber, Housecall Pro, ZenMaid?',
        answer:
          'Yes. We support direct integrations with the major cleaning-business CRMs. Bookings, schedule changes, and notes write back automatically.',
      },
      {
        question: 'Can it handle recurring schedule changes?',
        answer:
          'Yes. The agent moves the booking, frees the slot, writes the change back, and sends the customer a confirmation, without dispatcher involvement.',
      },
      {
        question: 'How does it handle key codes and access instructions?',
        answer:
          'Captured during intake and stored on the customer record. The crew sees them on their assignment before arrival.',
      },
      {
        question: 'Can it differentiate residential and commercial?',
        answer:
          'Yes. Account-based routing keeps residential intake separate from commercial SLA calls. Each path has its own script.',
      },
      {
        question: 'How fast is deployment?',
        answer:
          '7 to 10 business days for most cleaning operators.',
      },
    ],
    caseStudySlug: 'pa-hvac-experts',
    related: ['contractors', 'electricians', 'plumbers'],
  },

  {
    slug: 'mortgage-brokers',
    name: 'Mortgage Brokers',
    nicheSingular: 'mortgage brokerage',
    metaTitle: 'AI Receptionist for Mortgage Brokers | Implenix',
    metaDescription:
      'AI receptionist for mortgage brokers and lenders. Capture rate-shoppers, route urgent closings, and stop losing pre-approval calls to voicemail.',
    targetKeyword: 'ai receptionist for mortgage brokers',
    relatedKeywords: [
      'mortgage broker answering service',
      'loan officer call automation',
      'mortgage lead intake ai',
      'lender receptionist',
    ],
    intro:
      "A mortgage broker's pipeline is rate-sensitive and time-bound. Calls come in three flavors: rate-shoppers comparing five lenders in a single hour, existing clients chasing closing-document status, and Realtors needing pre-approval letters before tomorrow's offer deadline. Each one is high-stakes, and each one loses if it sits in voicemail. Implenix is the AI receptionist for mortgage brokers: it answers every inbound within one ring, qualifies rate-shoppers (loan amount, property type, credit posture, timeline) before they reach a loan officer, and routes existing-client questions through caller-verified fast-path. Pre-approval letter requests from Realtors get same-day priority routing. Document collection happens via secure SMS portal links the agent sends mid-call, borrowers stop saying \"I emailed it\" and the LO stops chasing missing pages. Compliance-sensitive intake follows your defined scripts so your team is not freelancing on disclosure language. After every call, the lead lands in your LOS or CRM with full context, including a recording the LO can review before calling back. Brokers who deploy Implenix typically cut LO phone time by 12-18 hours per week while qualified pre-approval volume climbs 40-50%, and Realtor partners stop dropping referrals because the broker is now the fastest call back in the market.",
    heroStat: '+47%',
    heroStatLabel: 'qualified pre-approval requests',
    avgWeeklyCalls: 120,
    avgClientValue: 4200,
    painPoints: [
      {
        title: 'Rate-shoppers do not wait, they call the next number',
        description:
          'Mortgage shoppers call 4-6 lenders in a single hour. If you do not pick up, they are gone before you even know they called.',
      },
      {
        title: 'Loan officers burn an hour daily on document chase',
        description:
          '"I sent it." "I did not receive it." "Let me re-send." Multiplied across every active file, this is real labor cost.',
      },
      {
        title: 'Realtor partners drop you over response time',
        description:
          'A Realtor needs a pre-approval letter by tomorrow morning. If you call back at 4 PM, they used a different lender on the offer.',
      },
    ],
    useCases: [
      {
        title: 'Rate-shopper qualification before LO involvement',
        description:
          'Loan amount, property type, credit posture, employment, timeline. Below-bar inquiries get a friendly no-thanks. Above-bar route to an LO with full context.',
      },
      {
        title: 'Realtor partner fast-path with priority routing',
        description:
          'Allow-listed Realtor partners route to a dedicated callback queue with same-day SLA. Pre-approval letter requests get priority.',
      },
      {
        title: 'Document collection via secure SMS portal link',
        description:
          'Mid-call, the agent texts a link the borrower can use to upload pay stubs, bank statements, or W-2s. Files attach to the loan file before the call ends.',
      },
    ],
    stats: [
      { number: '+47%', label: 'qualified pre-approval requests' },
      { number: '-15h', label: 'LO phone time per week' },
      { number: '<2 min', label: 'Realtor response time' },
    ],
    testimonialQuote:
      'My LOs stopped working until 9 PM chasing documents. The agent collects them during the first call and we close on time.',
    testimonialAuthor: 'Owner, regional mortgage brokerage',
    faqs: [
      {
        question: 'Does it integrate with Encompass, BytePro, LendingPad?',
        answer:
          'Yes. We support the major LOS platforms via direct integration or webhook. Lead, application status, and document tasks flow back automatically.',
      },
      {
        question: 'Can it pre-qualify rate-shoppers?',
        answer:
          'Yes. Loan amount, property type, credit posture, timeline, and decision-maker confirmation are captured up front. Below-bar inquiries get a polite no-thanks.',
      },
      {
        question: 'Is the agent compliant with mortgage disclosure rules?',
        answer:
          'The agent follows your team-approved scripts. We do not freelance on disclosure language. Calls are recorded with consent for compliance review.',
      },
      {
        question: 'Can it handle urgent Realtor partner requests?',
        answer:
          'Yes. Allow-listed Realtor partners route to a dedicated priority queue. Pre-approval letter requests get same-day SLA.',
      },
      {
        question: 'How does document collection work?',
        answer:
          'The agent texts a secure portal link mid-call. Borrowers upload pay stubs, bank statements, W-2s during the call. Files attach to the loan file automatically.',
      },
    ],
    caseStudySlug: 'columbus-property',
    related: ['real-estate', 'insurance-agents', 'accountants'],
  },

  {
    slug: 'insurance-agents',
    name: 'Insurance Agents',
    nicheSingular: 'insurance agency',
    metaTitle: 'AI Receptionist for Insurance Agents | Implenix',
    metaDescription:
      'AI receptionist for insurance agents and agencies. Handle quote requests, claim intake, and policy questions, without burning your producers on the phone.',
    targetKeyword: 'ai receptionist for insurance agents',
    relatedKeywords: [
      'insurance agency answering service',
      'insurance call automation',
      'agent receptionist ai',
      'insurance quote intake',
    ],
    intro:
      "An insurance agency's phone traffic looks deceptively simple from the outside: people call to get a quote, ask a policy question, or report a claim. Inside the agency, those three buckets eat the entire day. Producers should be selling. Instead, they are answering \"is this covered\" calls. CSRs should be handling renewals. Instead, they are intaking auto claims at 7 PM. Implenix is the AI receptionist for insurance agents: it answers every inbound within one ring, runs your quote intake script, routes claim calls into your defined claim-intake path, and handles routine policy questions without producer involvement. Quote intake captures the data your producers actually need, driver count, vehicles, drivers' age, coverage limits, prior carrier, so the producer's first callback is a real conversation, not a fact-finding mission. Existing-policyholders get caller-verified fast-path: name and policy number look up the account, and the agent answers most billing/policy/coverage questions directly from your AMS. Claim intake follows your carrier's required script and routes to the right adjuster path. After-hours claim calls do not hit voicemail, they get full intake. The result: agencies cut producer phone time by 15-20 hours per week, capture 35-45% more after-hours quote requests, and stop losing renewal customers to the agency that picks up faster.",
    heroStat: '+42%',
    heroStatLabel: 'after-hours quote requests captured',
    avgWeeklyCalls: 140,
    avgClientValue: 1850,
    painPoints: [
      {
        title: 'Producers stuck on the phone instead of selling',
        description:
          'Every "is my deductible $500 or $1000" call answered by a producer is real commission lost. The agency feels expensive without being efficient.',
      },
      {
        title: 'Claim intake at 7 PM goes to voicemail',
        description:
          'Auto accidents do not happen 9-5. If your claim line is voicemail after hours, customers feel unsupported and your retention drops.',
      },
      {
        title: 'Quote shoppers comparison-shop in real time',
        description:
          'Auto and home shoppers call 3-5 agents in an hour. The first to answer with a quote becomes the favorite.',
      },
    ],
    useCases: [
      {
        title: 'Quote intake with line-of-business triage',
        description:
          'Auto, home, life, commercial, each path has its own intake. Driver counts, vehicles, coverage history captured cleanly for the producer.',
      },
      {
        title: 'Existing-policyholder self-service',
        description:
          'Name + policy number verifies the account. Routine billing, declarations, and coverage questions answer directly from your AMS.',
      },
      {
        title: '24/7 claim intake with carrier-script compliance',
        description:
          'After-hours claims get full intake. The agent follows your carrier-required script and routes to the right adjuster path.',
      },
    ],
    stats: [
      { number: '+42%', label: 'after-hours quote requests' },
      { number: '-18h', label: 'producer phone time / week' },
      { number: '100%', label: 'claim coverage 24/7' },
    ],
    testimonialQuote:
      'My producers used to lose their first hour every morning to "did you get my email" calls. Now they pick up at 9 and start closing.',
    testimonialAuthor: 'Owner, multi-line independent agency',
    faqs: [
      {
        question: 'Does it integrate with AMS360, Applied Epic, EZLynx?',
        answer:
          'Yes. We integrate with the major AMS platforms via API or webhook. Calls, quote intake, and policyholder updates flow back automatically.',
      },
      {
        question: 'Can it handle different lines of business?',
        answer:
          'Yes. Auto, home, life, and commercial each have their own intake script. The agent triages by line of business at the start of every quote call.',
      },
      {
        question: 'How does claim intake work?',
        answer:
          'After-hours claims get full intake following your carrier-required script. The agent collects all required data and routes to the right adjuster path.',
      },
      {
        question: 'Can it answer policyholder coverage questions?',
        answer:
          'Within scope. Caller-verified policyholders can get billing, declarations, and routine coverage questions answered directly from your AMS. Complex questions transfer to a CSR.',
      },
      {
        question: 'How fast is deployment?',
        answer:
          '10 to 14 business days for most agencies. Faster if you are on a supported AMS.',
      },
    ],
    caseStudySlug: 'columbus-property',
    related: ['mortgage-brokers', 'accountants', 'law-firms'],
  },

  {
    slug: 'veterinarians',
    name: 'Veterinarians',
    nicheSingular: 'veterinary practice',
    metaTitle: 'AI Receptionist for Veterinarians | Implenix',
    metaDescription:
      'AI receptionist for veterinary practices. Triage emergencies, book wellness exams, and handle anxious pet-parent calls, 24/7, with your tone.',
    targetKeyword: 'ai receptionist for veterinarians',
    relatedKeywords: [
      'veterinary clinic answering service',
      'animal hospital phone ai',
      'vet receptionist',
      'pet emergency call routing',
    ],
    intro:
      "A veterinary practice handles three call types in the same queue: anxious pet parents calling about something that might be an emergency, routine wellness/booking calls, and prescription/food refill requests. The mix is brutal because every caller thinks their call is the urgent one, and one of them really is. Voicemail is not an option for a vet. A pet parent who hits voicemail when their dog is bloating drives to the emergency clinic across town and never comes back. Implenix is the AI receptionist for veterinarians: it answers every inbound within one ring, triages emergencies against your defined urgent-criteria list (bloating, seizures, ingestion, breathing trouble, hit-by-car, large-breed limp), and routes them straight to your on-call line or the nearest emergency partner. Routine wellness bookings happen live against your PIMS schedule. Refill requests follow your in-house pharmacy or online formulary path. New-client intake captures species, breed, age, vaccine history, prior vet, and reason for visit before the appointment is booked. After hours, urgent triage stays live; non-urgent goes into a callback queue your tech reviews first thing. The agent's tone is warm, it knows pet parents are scared. Practices that deploy Implenix typically cut tech and front-desk phone time 15-20 hours per week, see no-show rates drop 25-30% with proactive confirmations, and stop losing emergency triage to the urgent-care across the street.",
    heroStat: '+91%',
    heroStatLabel: 'after-hours triage capture rate',
    avgWeeklyCalls: 200,
    avgClientValue: 280,
    painPoints: [
      {
        title: 'Anxious pet parents hitting voicemail at 9 PM',
        description:
          'A panicked owner whose dog is bloating cannot wait. They drive to the emergency clinic across town and never come back.',
      },
      {
        title: 'Front desk drowns in routine refill calls',
        description:
          'Refill requests follow a clean script but eat front-desk time. The receptionist has no bandwidth left for the new puppy walking through the door.',
      },
      {
        title: 'New-client intake is inconsistent',
        description:
          'Different staff capture different intake fields. The DVM sometimes walks into the room without species or vaccine history loaded.',
      },
    ],
    useCases: [
      {
        title: 'Emergency triage against urgent-criteria list',
        description:
          'Bloating, seizures, ingestion, breathing trouble, flagged urgent and routed live to your on-call line or nearest emergency partner.',
      },
      {
        title: 'Wellness booking against PIMS schedule',
        description:
          'Avimark, Cornerstone, ezyVet, Vetspire, the agent reads real availability and books with full intake (species, breed, age, vaccine history).',
      },
      {
        title: 'Refill requests with formulary routing',
        description:
          'In-house vs online pharmacy paths handled distinctly. Records the medication, prescriber, and pet ID into your PIMS as a refill task.',
      },
    ],
    stats: [
      { number: '+91%', label: 'after-hours triage capture' },
      { number: '-29%', label: 'no-show rate' },
      { number: '-17h', label: 'front-desk phone time / week' },
    ],
    testimonialQuote:
      'Our front desk used to be in tears by Friday. Now they actually leave the building at closing. The agent handles the volume.',
    testimonialAuthor: 'Practice manager, two-doctor small animal clinic',
    faqs: [
      {
        question: 'Does it integrate with Avimark, Cornerstone, ezyVet?',
        answer:
          'Yes. We support the major veterinary PIMS via direct integration or webhook. Appointments, refills, and intake notes write back automatically.',
      },
      {
        question: 'How does it triage emergencies?',
        answer:
          'Against your defined urgent-criteria list. Callers describing flagged symptoms (bloat, seizure, ingestion, breathing trouble) route live to your on-call line or emergency partner.',
      },
      {
        question: 'Can it handle large/exotic and small animal differently?',
        answer:
          'Yes. Species-aware routing. Equine, exotic, and large-animal calls follow their own intake and routing rules.',
      },
      {
        question: 'Will the tone be appropriate for anxious pet parents?',
        answer:
          'We tune voice and pacing for warmth. Pet parents calling in distress hear a calm, empathetic voice that triages quickly and routes them correctly.',
      },
      {
        question: 'How fast is deployment?',
        answer:
          '10 to 14 business days for most practices.',
      },
    ],
    caseStudySlug: 'ohio-dental',
    related: ['medical-practices', 'chiropractors', 'dentists'],
  },

  {
    slug: 'chiropractors',
    name: 'Chiropractors',
    nicheSingular: 'chiropractic practice',
    metaTitle: 'AI Receptionist for Chiropractors | Implenix',
    metaDescription:
      'AI receptionist for chiropractic practices. Book new patients, handle insurance auth, and stop losing intake calls during peak adjustment hours.',
    targetKeyword: 'ai receptionist for chiropractors',
    relatedKeywords: [
      'chiropractor answering service',
      'chiropractic clinic ai',
      'chiropractic intake automation',
      'spine clinic receptionist',
    ],
    intro:
      "Chiropractic practices have a particular phone problem: the busy hours on the phone are the same hours the doctor is in adjustments. New-patient calls land at 11 AM when the entire team is mid-treatment. Existing-patient reschedules pile up. Insurance authorization questions follow a script the front desk could handle in their sleep, except they are not at the desk, they are running the table. Implenix is the AI receptionist for chiropractors: it answers every inbound within one ring, books new-patient intake with insurance pre-screening (carrier, member ID, prior auth, treatment history), handles existing-patient reschedules live, and routes anything clinical to the doctor's callback queue. Recurring patients on care plans get fast-path identification, name and DOB lookup pulls them out of the new-patient queue. Insurance auth questions follow your verification script. Treatment-plan upgrades and re-exams route to the appropriate path. The result: chiropractors capture 30-40% more new-patient bookings without hiring a second front-desk staff, no-show rates drop 20-25% with proactive confirmations, and the doctor stops walking into the next adjustment behind because someone needed to take a phone call. Treatment time stays treatment time.",
    heroStat: '+36%',
    heroStatLabel: 'new-patient bookings in 30 days',
    avgWeeklyCalls: 165,
    avgClientValue: 1800,
    painPoints: [
      {
        title: 'Phone rings during the busiest adjustment hours',
        description:
          'Peak treatment hours are also peak inbound. The front desk is on the table, not at the desk. New patients hit voicemail.',
      },
      {
        title: 'Insurance auth eats half the day',
        description:
          'Verifying coverage and prior auth follows a clean script, but it is repetitive, time-consuming, and easy to drop.',
      },
      {
        title: 'No-shows compound across recurring care plans',
        description:
          'A patient on a 24-visit plan who no-shows breaks the entire week. Without proactive reminders, this happens constantly.',
      },
    ],
    useCases: [
      {
        title: 'New-patient intake with insurance pre-screen',
        description:
          'Carrier, member ID, prior auth, treatment history captured. Books only if your accepted-payer rules pass.',
      },
      {
        title: 'Existing-patient reschedule fast-path',
        description:
          'Name + DOB verifies the patient. Reschedules and add-ons move directly into your scheduling system.',
      },
      {
        title: 'Recurring care-plan reminder calls',
        description:
          'Outbound confirmation calls 24 hours before, plus SMS reminder. No-show rates fall sharply.',
      },
    ],
    stats: [
      { number: '+36%', label: 'new-patient bookings' },
      { number: '-23%', label: 'no-show rate' },
      { number: '<60s', label: 'average pickup time' },
    ],
    testimonialQuote:
      'Before Implenix I was running back to the front desk every 20 minutes. Now I run my schedule and the calls just happen.',
    testimonialAuthor: 'DC, two-provider chiropractic clinic',
    faqs: [
      {
        question: 'Does it integrate with ChiroTouch, Genesis, eClinicalWorks?',
        answer:
          'Yes. We support the major chiropractic and EHR platforms via direct integration or webhook. Appointments, insurance verification, and patient updates flow back automatically.',
      },
      {
        question: 'Can it verify insurance?',
        answer:
          'It captures carrier, member ID, group, and prior-auth status. Real-time eligibility checks happen if your clearinghouse supports them; otherwise it queues for the front desk.',
      },
      {
        question: 'Will it route clinical questions to the doctor?',
        answer:
          'Yes. Defined transfer rules pull clinical questions out of the routine queue and into the doctor\'s callback path.',
      },
      {
        question: 'Is it HIPAA compliant?',
        answer:
          'Yes. We sign a BAA, encrypt PHI in transit and at rest, restrict access by role, and follow HIPAA minimum-necessary principles.',
      },
      {
        question: 'How fast is deployment?',
        answer:
          '10 to 14 business days for most chiropractic practices.',
      },
    ],
    caseStudySlug: 'ohio-dental',
    related: ['medical-practices', 'dentists', 'therapists'],
  },

  {
    slug: 'therapists',
    name: 'Therapists',
    nicheSingular: 'therapy practice',
    metaTitle: 'AI Receptionist for Therapists | Implenix',
    metaDescription:
      'AI receptionist for therapy practices. Handle sensitive new-client intake, route crisis calls, and protect your provider hours.',
    targetKeyword: 'ai receptionist for therapists',
    relatedKeywords: [
      'therapy practice answering service',
      'mental health intake automation',
      'counseling receptionist ai',
      'therapist call handling',
    ],
    intro:
      "Therapists have the most sensitive phone problem in any service business. Every new-client call is someone reaching out, often after a long pause. Voicemail can break that thread permanently. Existing clients sometimes call in moments of crisis. Insurance and sliding-scale questions are emotionally loaded. Yet most therapy practices route their phone through the same provider who is in session 25 hours a week. Implenix is the AI receptionist for therapists: it answers every inbound within one ring with a warm, screened voice, runs your new-client intake (presenting concern, insurance / sliding-scale, prior therapy, geographic location, modality preference), and books only when your practice rules allow. Crisis-keyword detection routes self-harm and acute-distress callers directly to your defined crisis path, your warm-line, an on-call clinician, or 988, within seconds, never to voicemail. Existing-client questions about scheduling, copay, or telehealth links resolve without disrupting your session schedule. Sliding-scale conversations follow your stated policy without freelancing. After-hours, urgent triage stays live; non-urgent goes into a callback queue your office manager handles first thing. The tone matches the field. The intake is consistent. And the provider keeps their session hours protected, which is the whole point.",
    heroStat: '+44%',
    heroStatLabel: 'new-client intake conversion',
    avgWeeklyCalls: 90,
    avgClientValue: 4800,
    painPoints: [
      {
        title: 'New-client calls land in provider voicemail',
        description:
          'A first-time call took courage. If it ends in voicemail, that thread often breaks for good.',
      },
      {
        title: 'Crisis calls cannot wait for callback',
        description:
          'A client in acute distress calling at 9 PM needs an answer in seconds, not the next morning.',
      },
      {
        title: 'Insurance and sliding-scale questions burn provider time',
        description:
          'Detailed, emotionally loaded conversations that follow a clear policy, but cost the provider real session hours.',
      },
    ],
    useCases: [
      {
        title: 'Warm new-client intake with modality and insurance pre-screen',
        description:
          'Captures presenting concern, insurance/sliding-scale, prior therapy, geography, modality preference. Books only when practice rules allow.',
      },
      {
        title: 'Crisis-keyword detection with live routing',
        description:
          'Self-harm and acute-distress phrases route immediately to your warm-line, on-call clinician, or 988, never to voicemail.',
      },
      {
        title: 'Existing-client schedule + copay handling',
        description:
          'Schedule changes, telehealth link reissues, and copay questions resolve without involving the provider.',
      },
    ],
    stats: [
      { number: '+44%', label: 'new-client intake conversion' },
      { number: '100%', label: 'crisis call live routing' },
      { number: '-12h', label: 'provider phone time / week' },
    ],
    testimonialQuote:
      'My new clients used to drop off after a missed first call. Now every initial call gets answered, screened, and warmly handed back to me.',
    testimonialAuthor: 'LCSW, solo private practice',
    faqs: [
      {
        question: 'Is it appropriate for sensitive mental health calls?',
        answer:
          'Yes. The voice and pacing are tuned for warmth. Crisis keywords route to a live human or hotline within seconds. We do not provide clinical advice.',
      },
      {
        question: 'How does crisis detection work?',
        answer:
          'A defined keyword + sentiment list flags acute distress in real time. Flagged callers route to your defined crisis path (warm-line, on-call clinician, 988) immediately.',
      },
      {
        question: 'Does it integrate with SimplePractice, TherapyNotes, TheraNest?',
        answer:
          'Yes. We support the major mental-health practice management systems via direct integration or webhook.',
      },
      {
        question: 'Is it HIPAA compliant?',
        answer:
          'Yes. We sign a BAA, encrypt PHI in transit and at rest, restrict access by role, and follow HIPAA minimum-necessary principles.',
      },
      {
        question: 'Can it handle sliding-scale conversations?',
        answer:
          'Yes, within the stated policy you provide. The agent does not freelance fee discussions; it follows your script.',
      },
    ],
    caseStudySlug: 'ohio-dental',
    related: ['chiropractors', 'medical-practices', 'dentists'],
  },

  {
    slug: 'spas',
    name: 'Spas',
    nicheSingular: 'day spa',
    metaTitle: 'AI Receptionist for Spas | Implenix',
    metaDescription:
      'AI receptionist for day spas and wellness studios. Book treatments, handle gift-card and package questions, and capture every after-hours booking call.',
    targetKeyword: 'ai receptionist for spas',
    relatedKeywords: [
      'spa booking ai',
      'day spa answering service',
      'wellness studio receptionist',
      'spa call automation',
    ],
    intro:
      "A day spa lives in a quiet contradiction: the front desk is supposed to be a calm, welcoming presence for the guest checking in, and a hot phone line at the same time. Massage and facial bookings, package and gift-card questions, group bookings for bridal parties, and last-minute cancellations all collide in the same queue, with the same staff person, during the same hour the spa is busiest. Implenix is the AI receptionist for spas: it answers every inbound within one ring, books treatments live against your scheduling system, handles gift-card balance and package-redemption questions directly from your point-of-sale, and routes group bookings (bridal, mother-daughter, corporate) into the right coordinator queue. New-guest intake captures intake-form needs, allergens, mobility considerations, and pregnancy/treatment contraindications so therapists are not surprised. Returning guests get fast-path identification, caller ID matches the account, intake skipped, schedule shown. Cancellations and reschedules write back live so the slot reopens for the next caller. After-hours bookings flow normally; Saturday-morning rushes do not break the front desk. The result: spas reclaim 15-18 hours per week of front-desk phone time, capture 30-40% more after-hours bookings, and the guest in the lobby actually gets a calm welcome instead of being mid-conversation when the next call rings.",
    heroStat: '+38%',
    heroStatLabel: 'after-hours bookings captured',
    avgWeeklyCalls: 155,
    avgClientValue: 220,
    painPoints: [
      {
        title: 'Front desk cannot greet guests and answer calls at once',
        description:
          'The first impression of a spa is the front desk. When the phone rings every two minutes, the in-person guest gets the worse experience.',
      },
      {
        title: 'Gift-card and package questions are repetitive call-killers',
        description:
          '"Can you check my gift-card balance" follows a clean script but eats real time. Multiplied across the day, it is the front desk\'s third job.',
      },
      {
        title: 'Bridal and group bookings get lost in the routine queue',
        description:
          'A six-person bridal package is a real revenue event. If the booking call hits voicemail, that party books somewhere else.',
      },
    ],
    useCases: [
      {
        title: 'Live treatment booking with intake-form pre-flight',
        description:
          'Captures allergens, mobility, contraindications. Therapists see the prep details before the guest arrives.',
      },
      {
        title: 'Gift-card balance and package-redemption from POS',
        description:
          'Caller-verified guests can check balances and book against package redemptions without staff involvement.',
      },
      {
        title: 'Group / bridal booking routed to coordinator',
        description:
          'Multi-guest bookings pull out of the routine queue and route to your senior booking coordinator via live transfer.',
      },
    ],
    stats: [
      { number: '+38%', label: 'after-hours bookings' },
      { number: '-17h', label: 'front-desk phone time / week' },
      { number: '<60s', label: 'average pickup time' },
    ],
    testimonialQuote:
      'Saturday lobbies used to be a circus. Now the front desk is actually with our guests and the phone still gets answered every time.',
    testimonialAuthor: 'Owner, multi-room day spa',
    faqs: [
      {
        question: 'Does it integrate with Mindbody, Boulevard, Booker, Vagaro?',
        answer:
          'Yes. We support the major spa booking and POS systems via direct integration or webhook. Bookings, package redemptions, and gift-card balances flow back live.',
      },
      {
        question: 'Can it handle gift-card balance lookups?',
        answer:
          'Yes. Caller-verified guests can check balances and apply gift cards to bookings without staff involvement.',
      },
      {
        question: 'How does it handle group and bridal bookings?',
        answer:
          'Group bookings route to your senior coordinator via live transfer or callback queue, depending on your rules.',
      },
      {
        question: 'Will it know about contraindications?',
        answer:
          'Intake captures pregnancy, mobility, allergens, and treatment contraindications during the booking call. Therapists see the prep before the guest arrives.',
      },
      {
        question: 'How long is deployment?',
        answer:
          '7 to 10 business days for most spas.',
      },
    ],
    caseStudySlug: 'ohio-dental',
    related: ['med-spas', 'salons', 'chiropractors'],
  },

  {
    slug: 'landscapers',
    name: 'Landscapers',
    nicheSingular: 'landscaping company',
    metaTitle: 'AI Receptionist for Landscapers | Implenix',
    metaDescription:
      'AI receptionist for landscapers. Capture seasonal spikes, qualify bids, and handle recurring service calls without hiring more staff.',
    targetKeyword: 'ai receptionist for landscapers',
    relatedKeywords: [
      'landscaping answering service',
      'lawn care call automation',
      'landscaper receptionist',
      'landscape business phone ai',
    ],
    intro:
      "Landscaping is a seasonal business with a non-seasonal phone problem. Spring brings a six-week deluge of cleanup, mulch, irrigation, and design-build calls. Summer is recurring maintenance plus weather-driven rescheduling chaos. Fall is leaf-removal and hardscape bids. Winter is plowing dispatch when it snows and silence when it does not. Most landscapers handle all of it with the owner's cell phone, which means the moment a crew leaves for the first job at 6:30 AM, every inbound call goes to voicemail until lunch. Implenix is the AI receptionist for landscapers: it answers every inbound within one ring, qualifies design-build bids (property size, scope, decision-makers, budget posture), books recurring maintenance customers against your real route schedule, and handles weather-driven reschedules without involving the owner. Plowing dispatch flips on automatically when storms hit. Commercial accounts route to your account manager. Routine calls, \"can you skip me this week\" or \"add an extra cut\", happen live and write back to your scheduling system. The result: landscapers capture 40-60% more spring-season bid calls without hiring temporary staff, weather reschedules stop breaking the route, and the owner stops missing dinner because the phone never quits.",
    heroStat: '+52%',
    heroStatLabel: 'spring-season bid calls captured',
    avgWeeklyCalls: 145,
    avgClientValue: 1850,
    painPoints: [
      {
        title: 'Spring season buries the owner\'s phone',
        description:
          'March-May call volume is 4x baseline. Without surge capacity, design-build bids die in voicemail and routine maintenance customers churn.',
      },
      {
        title: 'Weather reschedules break the entire route',
        description:
          'Rain pushes today\'s route to tomorrow. Customers call to confirm or move. Without live handling, the route compounds and everyone is angry by Friday.',
      },
      {
        title: 'Crews are unreachable, owner answers everything',
        description:
          'The crew leaves at 6:30 AM. The owner is in a truck with cement gloves on. The phone rings until lunch.',
      },
    ],
    useCases: [
      {
        title: 'Design-build bid qualification with property pre-screen',
        description:
          'Property size, scope, decision-makers, budget posture, irrigation history. Site visits only get booked when your minimum bar passes.',
      },
      {
        title: 'Recurring maintenance schedule changes live',
        description:
          'Skip-this-week, add-a-cut, move-to-Friday handled directly. The route updates without owner involvement.',
      },
      {
        title: 'Storm-mode plow dispatch toggle',
        description:
          'Flip plow dispatch on the night before a storm. Inbound plowing calls follow their own routing rules and SLA.',
      },
    ],
    stats: [
      { number: '+52%', label: 'bid calls captured' },
      { number: '<60s', label: 'average pickup time' },
      { number: '-12h', label: 'owner phone time / week' },
    ],
    testimonialQuote:
      'March used to mean 16-hour days because the phone never stopped. This year I left at 6 PM most nights.',
    testimonialAuthor: 'Owner, residential landscaping company',
    faqs: [
      {
        question: 'Does it integrate with LMN, Aspire, Service Autopilot?',
        answer:
          'Yes. We support the major landscaping CRMs via direct integration or webhook. Routes, schedules, and customer notes flow back automatically.',
      },
      {
        question: 'Can it scale for spring season?',
        answer:
          'Yes. Concurrent capacity is not capped. The same system handles March 15 and August 15 with no overtime.',
      },
      {
        question: 'How does it handle weather-driven reschedules?',
        answer:
          'Customers can move themselves to the next available date or skip a week. The route updates live without owner involvement.',
      },
      {
        question: 'Can it dispatch plowing in winter?',
        answer:
          'Yes. Storm-mode toggle flips the agent into plow-dispatch routing. Plowing customers follow a separate SLA.',
      },
      {
        question: 'How fast is deployment?',
        answer:
          '7 to 14 business days. We can compress for spring-season prep.',
      },
    ],
    caseStudySlug: 'pa-hvac-experts',
    related: ['contractors', 'cleaning-services', 'pest-control'],
  },

  {
    slug: 'pest-control',
    name: 'Pest Control',
    nicheSingular: 'pest control company',
    metaTitle: 'AI Receptionist for Pest Control Companies | Implenix',
    metaDescription:
      'AI receptionist for pest control companies. Capture emergency infestation calls, book recurring service, and qualify commercial accounts, 24/7.',
    targetKeyword: 'ai receptionist for pest control',
    relatedKeywords: [
      'pest control answering service',
      'exterminator call automation',
      'pest company receptionist',
      'commercial pest dispatch',
    ],
    intro:
      "A pest control operator's phone has two modes: routine recurring service and the high-emotion emergency call from a customer who just discovered something they cannot live with. The emergency calls do not wait, a homeowner who sees rodents at 8 PM is calling three companies, and the first to pick up wins. Most operators handle this with a dispatcher who covers business hours and a callback service that does not. Implenix is the AI receptionist for pest control companies: it answers every inbound within one ring, triages emergency infestations against your urgent-pest list (rodents, bedbugs, wasps, termites, hornets), books recurring service against your route schedule, and routes commercial accounts to your account manager. New-customer intake captures pest type, location, square footage, pets/children present, and prior treatment history so the tech rolls with the right product. Recurring customers on a quarterly contract get fast-path identification, name and address lookup pulls them out of the new-business queue. Commercial accounts with SLAs route to dedicated handling. The result: pest control operators capture 40-50% more emergency calls during peak pest season, reduce dispatch friction during summer rushes, and stop losing recurring customers to the company that picked up the phone first.",
    heroStat: '+48%',
    heroStatLabel: 'emergency-call capture rate',
    avgWeeklyCalls: 130,
    avgClientValue: 380,
    painPoints: [
      {
        title: 'Emergency infestation calls hit voicemail at 8 PM',
        description:
          'A homeowner who just found rodents calls three companies in 10 minutes. Voicemail loses the job permanently.',
      },
      {
        title: 'Summer pest season overwhelms dispatch',
        description:
          'Wasp and ant season runs 4-5x baseline call volume. Without surge capacity, recurring customers feel deprioritized.',
      },
      {
        title: 'Commercial SLAs drown in residential queue',
        description:
          'A restaurant with a contracted SLA expects priority. Without account-aware routing, they sit behind a homeowner asking about ant traps.',
      },
    ],
    useCases: [
      {
        title: 'Emergency triage by pest type',
        description:
          'Rodents, bedbugs, wasps, termites, hornets, flagged urgent and dispatched immediately. Routine pests get booked into the next available window.',
      },
      {
        title: 'Recurring contract fast-path with route awareness',
        description:
          'Caller verification pulls quarterly customers into their own flow. Schedule changes and add-ons happen without dispatcher involvement.',
      },
      {
        title: 'Commercial account routing with SLA priority',
        description:
          'Allow-listed restaurants and property managers route directly to your account manager via live transfer.',
      },
    ],
    stats: [
      { number: '+48%', label: 'emergency capture rate' },
      { number: '<60s', label: 'average pickup time' },
      { number: '-15h', label: 'dispatcher phone time / week' },
    ],
    testimonialQuote:
      'Last summer we lost about 20 emergency calls a week to voicemail. This year, every one got picked up and dispatched.',
    testimonialAuthor: 'Owner, regional pest control company',
    faqs: [
      {
        question: 'Does it integrate with PestPac, ServSuite, FieldRoutes?',
        answer:
          'Yes. We support the major pest-control platforms via direct integration or webhook. Routes, jobs, and customer updates flow back automatically.',
      },
      {
        question: 'How does it triage emergencies?',
        answer:
          'Against your defined urgent-pest list. Callers describing rodents, bedbugs, wasps, termites, or hornets route to immediate dispatch.',
      },
      {
        question: 'Can it handle commercial accounts differently?',
        answer:
          'Yes. Account-based routing keeps commercial SLA accounts on a priority path. Restaurants and property managers route to your account manager.',
      },
      {
        question: 'Will the agent quote pricing?',
        answer:
          'Within ranges your team approves. Final quotes go to a tech on-site.',
      },
      {
        question: 'How fast is deployment?',
        answer:
          '7 to 10 business days for most pest-control operators.',
      },
    ],
    caseStudySlug: 'pa-hvac-experts',
    related: ['cleaning-services', 'landscapers', 'plumbers'],
  },

  {
    slug: 'moving-companies',
    name: 'Moving Companies',
    nicheSingular: 'moving company',
    metaTitle: 'AI Receptionist for Moving Companies | Implenix',
    metaDescription:
      'AI receptionist for moving companies. Capture peak-season quotes, qualify residential vs commercial moves, and stop dropping bids.',
    targetKeyword: 'ai receptionist for moving companies',
    relatedKeywords: [
      'moving company answering service',
      'mover quote intake ai',
      'relocation business receptionist',
      'moving call automation',
    ],
    intro:
      "Moving is the most seasonal business in the service economy. Memorial Day through Labor Day, every operator runs at 130% of capacity, the phone never stops, and every call that hits voicemail is a $1,500-$8,000 job that books with whoever answered. Quote intake is the bottleneck because it is detailed: pickup, destination, square footage, stairs, elevators, parking permits, packing scope, specialty items, dates flexible vs hard. The owner can either answer the phone or run the job, not both. Implenix is the AI receptionist for moving companies: it answers every inbound within one ring, runs the quote intake script your estimator would, captures all the pricing-relevant variables, and books site surveys (virtual or in-person) into your real calendar. Local vs long-distance vs commercial each follow their own qualification path. High-touch quotes (executive relocations, fragile/specialty items, multi-day) route to your senior estimator. Same-day or next-day moves get screened against capacity. Off-season the agent handles steady-state volume; peak season it scales without overtime. After-call attribution writes the lead into your CRM with full intake, your estimator's first callback is a real conversation, not a 20-minute fact-finding call.",
    heroStat: '+58%',
    heroStatLabel: 'peak-season quote calls captured',
    avgWeeklyCalls: 175,
    avgClientValue: 2400,
    painPoints: [
      {
        title: 'Memorial Day through Labor Day buries the phone',
        description:
          'Peak season runs 3-4x baseline volume. Without surge capacity, $5K+ jobs die in voicemail every single day.',
      },
      {
        title: 'Quote intake is too detailed for owners on jobs',
        description:
          'A real estimate needs 15+ variables. Owners on a job site cannot capture them on a rushed call. The estimate is wrong, the move is bid badly.',
      },
      {
        title: 'Long-distance and commercial calls mix with local',
        description:
          'A long-distance corporate relocation needs different intake than a local apartment move. Same queue, same script, both lose.',
      },
    ],
    useCases: [
      {
        title: 'Quote intake with pickup/destination + scope capture',
        description:
          'All 15+ pricing variables captured cleanly: stairs, elevators, parking permits, specialty items, packing scope. Estimator gets a complete brief.',
      },
      {
        title: 'Local / long-distance / commercial path triage',
        description:
          'Each move type has its own intake. Long-distance corporate relocations route to the senior estimator from the start.',
      },
      {
        title: 'Site survey booking, virtual or in-person',
        description:
          'Books surveys directly into your calendar with full context. Customer chooses virtual vs in-person based on your rules.',
      },
    ],
    stats: [
      { number: '+58%', label: 'peak-season quote calls' },
      { number: '<60s', label: 'average pickup time' },
      { number: '+24%', label: 'estimator close rate' },
    ],
    testimonialQuote:
      'June used to be chaos. We dropped 20 calls a day. This year we picked them all up and our close rate went up because the intake was actually complete.',
    testimonialAuthor: 'Owner, regional moving company',
    faqs: [
      {
        question: 'Does it integrate with SmartMoving, MoveitPro, Network Movers?',
        answer:
          'Yes. We support the major moving CRMs via direct integration or webhook. Quotes, surveys, and customer updates flow back automatically.',
      },
      {
        question: 'Can it scale for peak season?',
        answer:
          'Yes. Concurrent capacity is not capped. Same system handles May, June, and December with no overtime.',
      },
      {
        question: 'Can it handle long-distance and commercial differently?',
        answer:
          'Yes. Each move type has its own intake script. Long-distance and corporate relocations route to your senior estimator.',
      },
      {
        question: 'Will the agent quote pricing?',
        answer:
          'It can share rate ranges your team approves for typical moves. Specific quotes always go to an estimator after the survey.',
      },
      {
        question: 'How fast is deployment?',
        answer:
          '7 to 14 business days. Faster if you want to be ready before peak season.',
      },
    ],
    caseStudySlug: 'pa-hvac-experts',
    related: ['cleaning-services', 'contractors', 'landscapers'],
  },

  {
    slug: 'personal-trainers',
    name: 'Personal Trainers',
    nicheSingular: 'training studio',
    metaTitle: 'AI Receptionist for Personal Trainers | Implenix',
    metaDescription:
      'AI receptionist for personal trainers and fitness studios. Book consultations, handle package questions, and stop missing new-client calls during sessions.',
    targetKeyword: 'ai receptionist for personal trainers',
    relatedKeywords: [
      'personal trainer answering service',
      'fitness studio booking ai',
      'gym call automation',
      'training receptionist',
    ],
    intro:
      "A personal trainer's most expensive hours, the ones in actual sessions with clients, are also the hours when new-client inquiry calls land. Solo trainers are with a client at the moment a prospect calls; small studios have the same problem multiplied across coaches. The result is a familiar pattern: prospect researches, calls three studios, two pick up, one is yours, you call back two hours later, the prospect already booked. Implenix is the AI receptionist for personal trainers: it answers every inbound within one ring, runs your consultation intake (goals, current activity, injuries, schedule, package preference), and books the discovery session directly into your calendar against your real availability. Existing clients get fast-path identification, they can move sessions, ask package balance questions, or buy add-ons without disrupting your training schedule. Class and group-training inquiries follow their own intake. Cancellations write back live so the slot reopens. Solo trainers can finally hold sessions without watching the phone; small studios capture 30-40% more discovery sessions in the first quarter without hiring a coordinator.",
    heroStat: '+39%',
    heroStatLabel: 'discovery sessions booked',
    avgWeeklyCalls: 85,
    avgClientValue: 1200,
    painPoints: [
      {
        title: 'You\'re in a session when prospects call',
        description:
          'The whole problem in one sentence. The trainer cannot answer because they are training. The prospect books somewhere else.',
      },
      {
        title: 'Returning client questions disrupt the session',
        description:
          'A returning client texting to move tomorrow\'s session interrupts the current session. Multiplied across the day, it is exhausting.',
      },
      {
        title: 'Package and pricing questions follow a clean script, but eat time',
        description:
          '"How much for 10 sessions" is a 90-second call. The trainer should not be the one taking it.',
      },
    ],
    useCases: [
      {
        title: 'Consultation intake with goals + injuries pre-screen',
        description:
          'Captures goals, current activity, injuries, schedule, package preference. The first session starts informed.',
      },
      {
        title: 'Returning-client schedule and package handling',
        description:
          'Caller-verified clients move sessions, check package balances, and buy add-ons without trainer involvement.',
      },
      {
        title: 'Class / group-training routing',
        description:
          'Class and group inquiries follow their own intake script and route to the right schedule.',
      },
    ],
    stats: [
      { number: '+39%', label: 'discovery sessions' },
      { number: '<60s', label: 'average pickup time' },
      { number: '-9h', label: 'trainer phone time / week' },
    ],
    testimonialQuote:
      'Before, every session was punctuated by my phone vibrating. Now I run the session, and the calls just happen.',
    testimonialAuthor: 'Owner, two-coach training studio',
    faqs: [
      {
        question: 'Does it integrate with Mindbody, TrueCoach, Trainerize?',
        answer:
          'Yes. We support the major fitness and training platforms via direct integration or webhook. Bookings, packages, and client updates flow back automatically.',
      },
      {
        question: 'Can it sell packages?',
        answer:
          'Within scope you define. The agent can quote ranges your team approves and accept payment via your POS link sent by SMS during the call. Hard sells go to a human.',
      },
      {
        question: 'How does it handle injury-relevant intake?',
        answer:
          'Captured during the consultation booking call. Trainer sees the prep before the session.',
      },
      {
        question: 'Can it handle group classes?',
        answer:
          'Yes. Class inquiries route to a separate intake script and book against your class schedule.',
      },
      {
        question: 'How fast is deployment?',
        answer:
          '7 to 10 business days for most training studios.',
      },
    ],
    caseStudySlug: 'ohio-dental',
    related: ['chiropractors', 'salons', 'med-spas'],
  },
];

export const INDUSTRY_PROFILE_SLUGS = INDUSTRY_PROFILES.map((p) => p.slug);

export function getIndustryProfile(slug: string): IndustryProfile | undefined {
  return INDUSTRY_PROFILES.find((p) => p.slug === slug);
}
