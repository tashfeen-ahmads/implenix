// Deterministic mapping from industry-page slug to relevant blog
// posts. Used to inject high-value contextual internal links into
// industry pages, Google 2026 rewards the internal-linking depth
// that identifies topical clusters.

export const INDUSTRY_TO_BLOG_POSTS: Record<
  string,
  { slug: string; label: string }[]
> = {
  'hvac-companies': [
    { slug: 'hvac-ai-agent-guide', label: 'HVAC AI agent buyer\'s guide (2026)' },
    { slug: 'why-callers-hang-up-before-reaching-anyone', label: 'Why callers hang up before reaching anyone' },
    { slug: 'ai-outbound-calling-guide', label: 'AI outbound calling: compliance + ROI' },
    { slug: 'how-ai-sales-agents-enhance-lead-generation', label: 'How AI sales agents improve lead follow-up' },
  ],
  dentists: [
    { slug: 'ai-voice-agents-healthcare-medicine', label: 'AI voice agents in healthcare, the honest scope' },
    { slug: 'can-ai-handle-sensitive-conversations', label: 'Can AI handle sensitive conversations?' },
    { slug: 'how-to-calculate-your-missed-call-cost', label: 'How to calculate your missed-call cost' },
    { slug: 'how-ai-agents-recognize-human-emotions', label: 'How AI agents read caller emotion' },
  ],
  'medical-practices': [
    { slug: 'ai-voice-agents-healthcare-medicine', label: 'AI voice agents in healthcare' },
    { slug: 'agentic-reasoning-ai-doctor', label: 'Agentic reasoning and the AI doctor' },
    { slug: 'can-ai-handle-sensitive-conversations', label: 'Sensitive-conversation escalation rules' },
    { slug: 'how-ai-agents-will-change-cancer-research-oncology', label: 'AI agents in cancer research and oncology' },
    { slug: 'can-ai-agents-identify-vulnerable-customers', label: 'Can AI agents identify vulnerable callers?' },
  ],
  'real-estate': [
    { slug: 'ai-voice-agent-real-estate', label: 'Will AI replace real estate agents? (2026)' },
    { slug: 'how-to-calculate-your-missed-call-cost', label: 'The missed-call cost formula' },
    { slug: 'ai-outbound-calling-guide', label: 'AI outbound: compliance + follow-up' },
  ],
  'law-firms': [
    { slug: 'ai-agents-for-lawyers', label: 'AI agents for law firms, intake playbook' },
    { slug: 'can-ai-handle-sensitive-conversations', label: 'Sensitive-conversation guardrails' },
    { slug: 'ethical-considerations-ai-agents', label: 'Ethical considerations of AI agents' },
  ],
  plumbers: [
    { slug: 'hvac-ai-agent-guide', label: 'Trades AI agent framework (uses HVAC as example)' },
    { slug: 'why-callers-hang-up-before-reaching-anyone', label: 'Ring-time research' },
    { slug: 'ai-outbound-calling-guide', label: 'Follow-up compliance + ROI' },
  ],
  'med-spas': [
    { slug: 'ai-agents-for-medspas', label: 'AI agents for med spas, booking playbook' },
    { slug: 'ai-voice-agents-healthcare-medicine', label: 'Healthcare AI compliance framework' },
    { slug: 'how-to-calculate-your-missed-call-cost', label: 'Med-spa missed-call cost math' },
  ],
  'auto-repair': [
    { slug: 'hvac-ai-agent-guide', label: 'Trades operator playbook' },
    { slug: 'why-callers-hang-up-before-reaching-anyone', label: 'The ring-time problem' },
    { slug: 'ai-outbound-calling-guide', label: 'Service-reminder outbound' },
  ],
  roofers: [
    { slug: 'hvac-ai-agent-guide', label: 'Trades AI operator playbook' },
    { slug: 'ai-outbound-calling-guide', label: 'Storm-season outbound + compliance' },
    { slug: 'why-callers-hang-up-before-reaching-anyone', label: 'Ring-time research' },
  ],
  electricians: [
    { slug: 'hvac-ai-agent-guide', label: 'Trades operator playbook' },
    { slug: 'why-callers-hang-up-before-reaching-anyone', label: 'The ring-time problem' },
    { slug: 'ai-outbound-calling-guide', label: 'Follow-up compliance' },
  ],
  contractors: [
    { slug: 'hvac-ai-agent-guide', label: 'Trades operator playbook' },
    { slug: 'how-to-calculate-your-missed-call-cost', label: 'Missed-call cost math' },
    { slug: 'ai-outbound-calling-guide', label: 'Bid follow-up compliance' },
    { slug: 'how-to-automate-repetitive-tasks-using-ai-agents', label: 'Automating repetitive office tasks with AI' },
  ],
  'mortgage-brokers': [
    { slug: 'ai-agents-for-finance', label: 'AI agents for finance, mortgage playbook' },
    { slug: 'how-to-automate-sales-forecasting-with-ai-agents', label: 'Automating sales forecasting' },
    { slug: 'ethical-considerations-ai-agents', label: 'Ethical framework' },
    { slug: 'can-ai-agents-identify-vulnerable-customers', label: 'Spotting vulnerable customers on the phone' },
  ],
  'insurance-agents': [
    { slug: 'ai-agents-for-finance', label: 'AI agents for finance, insurance playbook' },
    { slug: 'ai-outbound-calling-guide', label: 'Consent + outbound compliance' },
    { slug: 'can-ai-handle-sensitive-conversations', label: 'Sensitive-caller handling' },
    { slug: 'can-ai-agents-identify-vulnerable-customers', label: 'Spotting vulnerable customers on the phone' },
    { slug: 'ai-agent-integration-crm-erp-bi', label: 'Connecting AI agents to your CRM and systems' },
  ],
  accountants: [
    { slug: 'ai-agents-for-finance', label: 'AI agents for finance, CPA playbook' },
    { slug: 'how-to-automate-sales-forecasting-with-ai-agents', label: 'Automate revenue forecasting' },
    { slug: 'ai-agent-integration-crm-erp-bi', label: 'AI + CRM/ERP integration' },
    { slug: 'how-to-automate-repetitive-tasks-using-ai-agents', label: 'Automating repetitive tasks with AI agents' },
  ],
  'marketing-agencies': [
    { slug: 'ai-outbound-calling-guide', label: 'AI outbound compliance + ROI' },
    { slug: 'workplace-ai-agents-employee-perspective', label: 'Workplace AI: employee POV' },
    { slug: 'how-do-ai-chatbots-compare-to-human-agents', label: 'Chatbots vs humans in service' },
    { slug: 'how-ai-sales-agents-enhance-lead-generation', label: 'AI sales agents and lead generation' },
    { slug: 'how-to-automate-sales-forecasting-with-ai-agents', label: 'Automating sales forecasting with AI agents' },
  ],
  'cleaning-services': [
    { slug: 'why-callers-hang-up-before-reaching-anyone', label: 'The ring-time problem' },
    { slug: 'hvac-ai-agent-guide', label: 'Trades operator playbook' },
    { slug: 'ai-outbound-calling-guide', label: 'Reminder outbound' },
  ],
  landscapers: [
    { slug: 'hvac-ai-agent-guide', label: 'Trades AI framework' },
    { slug: 'ai-outbound-calling-guide', label: 'Seasonal outbound + compliance' },
    { slug: 'why-callers-hang-up-before-reaching-anyone', label: 'Ring-time research' },
  ],
  veterinarians: [
    { slug: 'ai-voice-agents-healthcare-medicine', label: 'Healthcare AI framework' },
    { slug: 'can-ai-handle-sensitive-conversations', label: 'Sensitive conversations (bereavement)' },
    { slug: 'how-to-calculate-your-missed-call-cost', label: 'Missed-call cost math' },
  ],
  chiropractors: [
    { slug: 'ai-voice-agents-healthcare-medicine', label: 'Healthcare AI framework' },
    { slug: 'how-to-calculate-your-missed-call-cost', label: 'Missed-call cost math' },
    { slug: 'ai-agents-for-medspas', label: 'Booking-density playbook' },
  ],
  therapists: [
    { slug: 'can-ai-handle-sensitive-conversations', label: 'Sensitive conversations, critical framework' },
    { slug: 'ethical-considerations-ai-agents', label: 'Ethical considerations' },
    { slug: 'ai-voice-agents-healthcare-medicine', label: 'Healthcare AI scope' },
    { slug: 'how-ai-agents-recognize-human-emotions', label: 'How AI agents read caller emotion' },
  ],
  spas: [
    { slug: 'ai-agents-for-medspas', label: 'Med spa + spa booking playbook' },
    { slug: 'how-to-calculate-your-missed-call-cost', label: 'Missed-call cost math' },
    { slug: 'agentic-ai-retail-personalization', label: 'Retail personalization playbook' },
  ],
  'pest-control': [
    { slug: 'hvac-ai-agent-guide', label: 'Trades operator playbook' },
    { slug: 'ai-outbound-calling-guide', label: 'Reminder + follow-up outbound' },
    { slug: 'why-callers-hang-up-before-reaching-anyone', label: 'Ring-time research' },
  ],
  'moving-companies': [
    { slug: 'hvac-ai-agent-guide', label: 'Service operator playbook' },
    { slug: 'ai-outbound-calling-guide', label: 'Peak-season outbound compliance' },
    { slug: 'how-to-calculate-your-missed-call-cost', label: 'Missed-call cost math' },
  ],
  'personal-trainers': [
    { slug: 'ai-agents-for-medspas', label: 'Booking-density playbook' },
    { slug: 'agentic-ai-retail-personalization', label: 'Personalization at retail' },
    { slug: 'how-to-calculate-your-missed-call-cost', label: 'Missed-call cost math' },
  ],
  salons: [
    { slug: 'ai-agents-for-medspas', label: 'Booking-density playbook' },
    { slug: 'agentic-ai-retail-personalization', label: 'Retail AI personalization' },
    { slug: 'why-callers-hang-up-before-reaching-anyone', label: 'Ring-time research' },
  ],
};

export function getBlogLinksForIndustry(
  industrySlug: string,
): { slug: string; label: string }[] {
  return INDUSTRY_TO_BLOG_POSTS[industrySlug] ?? [];
}
