// Starting points for new campaigns. Every template is meant to be edited
// before launch. Copy rules: short plain text, one question per email, no
// prices, no statistics we can't back up, follow-ups threaded (blank
// subject = "Re:" in the same thread), last email is a polite close.
//
// Variables: {{first_name|there}}, {{company}}, {{city}}, {{industry}},
// {{sender_first_name}} (first word of the campaign's from name).

export type CampaignTemplate = {
  id: string;
  name: string;
  kind: 'sequence' | 'nurture';
  audience: string;
  description: string;
  ai_instructions: string;
  steps: { delay_days: number; subject: string; body: string; subject_b?: string; body_b?: string }[];
};

const SIGN = '\n\n{{sender_first_name}}';

const AI_BASE = [
  'Goal: book a 20-30 minute call with a lead specialist.',
  'Tone: friendly, brief, plain. Match their tone. No hype.',
  'We set up AI receptionists (voice agents that answer calls 24/7, book appointments and capture leads). Setup goes live in 72 hours.',
  'Pricing is custom and set on the call. Never quote or hint at a number.',
];

const closeStep = (topic: string) => ({
  delay_days: 7,
  subject: '',
  body: `Hi {{first_name|there}},\n\nI'll stop here so I'm not cluttering your inbox. If ${topic} ever becomes a priority at {{company}}, just reply to this email and I'll pick it up.${SIGN}`,
});

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'home-services',
    name: 'Home services: after-hours calls',
    kind: 'sequence',
    audience: 'HVAC, plumbers, electricians, roofers',
    description: 'Missed evening and weekend emergency calls going to the next company on Google.',
    ai_instructions: [
      ...AI_BASE,
      'Qualify: how do they handle calls after hours and on weekends today (voicemail, answering service, owner cell)? Which field software do they use (ServiceTitan, Jobber, Housecall Pro)?',
      'Sign off as the sender. If they say not interested, thank them and stop.',
    ].join('\n'),
    steps: [
      {
        delay_days: 0,
        subject: 'After-hours calls at {{company}}',
        body: `Hi {{first_name|there}},\n\nQuick question: when someone calls {{company}} at 8pm with no heat or a burst pipe, who picks up?\n\nWe set up AI receptionists for home service companies. It answers every call, books the job into your calendar and texts you the details. Live in 72 hours.\n\nWorth a short look?${SIGN}`,
        subject_b: 'Who answers {{company}} calls after 6pm?',
        body_b: `Hi {{first_name|there}},\n\nEmergency callers rarely leave a voicemail; they call the next company on the list.\n\nWe give home service businesses an AI receptionist that answers nights and weekends, books the job and sends you a summary. Setup takes 72 hours.\n\nOpen to seeing how it would sound for {{company}}?${SIGN}`,
      },
      {
        delay_days: 3,
        subject: '',
        body: `Hi {{first_name|there}}, following up in case this got buried. I can send a recording of a real after-hours call so you can hear how it handles a booking. Want me to?${SIGN}`,
      },
      {
        delay_days: 4,
        subject: '',
        body: `Hi {{first_name|there}},\n\nOne more thought: it can also take the overflow during the day when your office is on another line, and it follows your rules for what counts as an emergency.\n\nIf it helps, I can set up a 20-minute call to walk through it.${SIGN}`,
      },
      closeStep('after-hours coverage'),
    ],
  },
  {
    id: 'dental',
    name: 'Dental: front desk overflow',
    kind: 'sequence',
    audience: 'Dental practices',
    description: 'Front desk overwhelmed by reschedules, confirmations and new-patient calls.',
    ai_instructions: [
      ...AI_BASE,
      'Qualify: how many locations, which practice software (Dentrix, Eaglesoft, Open Dental), and when the phones are hardest to cover.',
      'Do not discuss clinical or medical questions; hand off to a person.',
    ].join('\n'),
    steps: [
      {
        delay_days: 0,
        subject: 'Phones at {{company}}',
        body: `Hi {{first_name|there}},\n\nA lot of a dental front desk's day goes to reschedules, confirmations and insurance questions, and the phone tends to ring right when patients are checking in.\n\nWe set up AI receptionists that handle those calls and book new patients 24/7, so your team can focus on the people in front of them. Live in 72 hours.\n\nWorth a quick look for {{company}}?${SIGN}`,
      },
      {
        delay_days: 3,
        subject: '',
        body: `Hi {{first_name|there}}, following up. Happy to show how it would book straight into your schedule and what it says when a caller asks something only your team should answer.${SIGN}`,
      },
      {
        delay_days: 4,
        subject: '',
        body: `Hi {{first_name|there}},\n\nOne thing practices usually ask: it can call or text patients to confirm appointments, which takes that job off the front desk entirely.\n\nWould a 20-minute walkthrough be useful?${SIGN}`,
      },
      closeStep('phone coverage'),
    ],
  },
  {
    id: 'law',
    name: 'Law firms: first-touch intake',
    kind: 'sequence',
    audience: 'PI, family and criminal defense firms',
    description: 'New-matter callers who hire whichever firm answers first.',
    ai_instructions: [
      ...AI_BASE,
      'Qualify: practice areas, how after-hours and weekend calls are handled now, which case management system they use.',
      'Never give or discuss legal advice. Anything about a specific case: hand off to a person.',
    ].join('\n'),
    steps: [
      {
        delay_days: 0,
        subject: 'New-matter calls at {{company}}',
        body: `Hi {{first_name|there}},\n\nPeople looking for a lawyer often call several firms and go with the first one that picks up. How are calls handled at {{company}} after hours and over the weekend?\n\nWe set up AI intake that answers every call, collects the matter details, flags conflicts for review and books the consult. It never gives legal advice. Live in 72 hours.\n\nWorth a look?${SIGN}`,
      },
      {
        delay_days: 3,
        subject: '',
        body: `Hi {{first_name|there}}, following up. I can share a sample intake call so you can hear exactly what it asks and where it hands off to your team.${SIGN}`,
      },
      {
        delay_days: 5,
        subject: '',
        body: `Hi {{first_name|there}},\n\nIf a call makes sense, I'd keep it to 20 minutes and focus on your intake questions and where calls are slipping today.${SIGN}`,
      },
      closeStep('intake coverage'),
    ],
  },
  {
    id: 'med-spa',
    name: 'Med spas: evening booking calls',
    kind: 'sequence',
    audience: 'Med spas and aesthetic clinics',
    description: 'Clients who call to book in the evening and reach voicemail.',
    ai_instructions: [
      ...AI_BASE,
      'Qualify: booking software (Boulevard, Zenoti, Aesthetic Record, Mangomint), busiest call times, top services.',
      'No medical advice or treatment recommendations; hand off to a person.',
    ].join('\n'),
    steps: [
      {
        delay_days: 0,
        subject: 'Evening calls at {{company}}',
        body: `Hi {{first_name|there}},\n\nMany aesthetic clients call to book in the evening, after they've done their research. Who answers at {{company}} after hours?\n\nWe set up AI receptionists that answer those calls, explain your services and book straight into your calendar. Live in 72 hours.\n\nWorth a quick look?${SIGN}`,
      },
      {
        delay_days: 3,
        subject: '',
        body: `Hi {{first_name|there}}, following up. Happy to send a short recording of a booking call so you can hear the tone before anything else.${SIGN}`,
      },
      closeStep('after-hours booking'),
    ],
  },
  {
    id: 'auto-repair',
    name: 'Auto repair: estimate calls on hold',
    kind: 'sequence',
    audience: 'Independent auto repair shops',
    description: 'Shopping callers who hang up on hold while the service writer is busy.',
    ai_instructions: [
      ...AI_BASE,
      'Qualify: shop software (Tekmetric, Shopmonkey, Mitchell1), how many service writers, busiest hours.',
    ].join('\n'),
    steps: [
      {
        delay_days: 0,
        subject: 'Calls at {{company}} while the counter is busy',
        body: `Hi {{first_name|there}},\n\nWhen your service writer is with a customer and the phone rings, what happens to that call?\n\nWe set up AI receptionists for repair shops that answer every call, take the vehicle and the problem, and book the appointment. Live in 72 hours.\n\nWorth a short look?${SIGN}`,
      },
      {
        delay_days: 3,
        subject: '',
        body: `Hi {{first_name|there}}, following up. I can show how it books into your shop software and what it tells a caller who wants a price over the phone.${SIGN}`,
      },
      closeStep('phone coverage'),
    ],
  },
  {
    id: 'real-estate',
    name: 'Real estate: speed to lead',
    kind: 'sequence',
    audience: 'Real estate teams and brokerages',
    description: 'Portal and website leads that go cold before an agent calls back.',
    ai_instructions: [
      ...AI_BASE,
      'Qualify: lead sources (Zillow, IDX site, referrals), team size, CRM (Follow Up Boss, kvCORE, Lofty).',
    ].join('\n'),
    steps: [
      {
        delay_days: 0,
        subject: 'New leads at {{company}}',
        body: `Hi {{first_name|there}},\n\nHow quickly does a new portal or website lead at {{company}} get a call back today?\n\nWe set up AI agents that call new leads within a minute, qualify them and book showings or consults onto your agents' calendars. Live in 72 hours.\n\nWorth a look?${SIGN}`,
      },
      {
        delay_days: 3,
        subject: '',
        body: `Hi {{first_name|there}}, following up. It can also work through older leads in your CRM that never got a second call. Want a short walkthrough?${SIGN}`,
      },
      closeStep('lead response'),
    ],
  },
  {
    id: 'nurture-quarterly',
    name: 'Nurture: check back every few weeks',
    kind: 'nurture',
    audience: 'Leads who said "not now" or never replied',
    description: 'Three light check-ins spread over about four months. No hard sell.',
    ai_instructions: [
      ...AI_BASE,
      'These people said "not now" or did not reply before. Be low-pressure. If they are ready, offer times; if not, thank them and leave it.',
    ].join('\n'),
    steps: [
      {
        delay_days: 30,
        subject: 'Checking back, {{first_name|there}}',
        body: `Hi {{first_name|there}},\n\nChecking back as promised. Is covering missed calls at {{company}} any more of a priority than when we last spoke?\n\nIf the timing still isn't right, no reply needed.${SIGN}`,
      },
      {
        delay_days: 45,
        subject: 'A quick idea for {{company}}',
        body: `Hi {{first_name|there}},\n\nOne idea that costs nothing to try: call {{company}} yourself after hours this week and listen to what a new customer hears.\n\nIf you'd like a second opinion on it, I'm happy to listen in with you.${SIGN}`,
      },
      {
        delay_days: 45,
        subject: 'Still on your list?',
        body: `Hi {{first_name|there}},\n\nLast check-in from me for now. If an AI receptionist ever makes sense for {{company}}, reply here and we can have it live in 72 hours.${SIGN}`,
      },
    ],
  },
];
