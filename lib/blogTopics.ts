// Topical hub definitions. Each hub is a cluster of blog posts around
// a theme keyword. Google 2026 rewards topical authority, hub pages
// that link to every post in the cluster and receive backlinks from
// each post in return create the internal-linking web Google uses to
// identify subject-matter expertise.
//
// Adding a new hub: append to TOPICS, add slugs to `postSlugs`. The
// dynamic route at /blog/topics/[hub] and the sitemap pick it up
// automatically.

export type BlogTopic = {
  slug: string;
  name: string;
  heading: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  postSlugs: string[];
};

export const TOPICS: BlogTopic[] = [
  {
    slug: 'agentic-ai',
    name: 'Agentic AI',
    heading: 'Agentic AI: what it is, how it works, where it fits',
    intro:
      'Everything Implenix has published about agentic AI, what the category actually means in 2026, the five classic types of agents, how RAG + LLM + MCP fit together, how agents learn from feedback loops, and the ethical + workplace implications.',
    metaTitle: 'Agentic AI Hub, Explained + Deployed | Implenix',
    metaDescription:
      'Agentic AI explained plainly, types of agents, RAG + LLM + MCP architecture, feedback loops, and workplace impact. Implenix operator notes.',
    primaryKeyword: 'agentic ai',
    postSlugs: [
      'what-is-agentic-ai',
      'rag-llm-mcp-ai-agent-architecture',
      'types-of-ai-agents-explained',
      'agentic-ai-feedback-loops-disruption',
      'multi-agent-systems-crypto-agi',
      'workplace-ai-agents-employee-perspective',
      'ethical-considerations-ai-agents',
      'agentic-reasoning-ai-doctor',
      'how-agentic-ai-improves-operational-efficiency',
      'who-invented-ai-agents',
      'does-google-have-an-ai-agent',
    ],
  },
  {
    slug: 'industry-guides',
    name: 'Industry guides',
    heading: 'AI voice agent guides by industry',
    intro:
      'Vertical-specific playbooks from the Implenix deployment portfolio, HVAC, real estate, dental, law, med spa, finance, healthcare, and retail. Each guide covers the intake script, integration stack, transfer rules, and real ROI math for that industry.',
    metaTitle: 'AI Agent Guides by Industry, Implenix',
    metaDescription:
      'Industry AI voice playbooks, HVAC, real estate, legal, medspa, finance, healthcare, retail. Real numbers, integrations, deployment scope.',
    primaryKeyword: 'ai agent by industry',
    postSlugs: [
      'hvac-ai-agent-guide',
      'ai-voice-agent-real-estate',
      'ai-agents-for-lawyers',
      'ai-agents-for-medspas',
      'ai-agents-for-finance',
      'ai-voice-agents-healthcare-medicine',
      'agentic-ai-retail-personalization',
      'how-ai-agents-will-change-cancer-research-oncology',
    ],
  },
  {
    slug: 'operator-playbooks',
    name: 'Operator playbooks',
    heading: 'Operator playbooks for shipping AI voice',
    intro:
      'Step-by-step deployment playbooks, how to calculate your missed-call cost, how to write prompts for AI voice agents, how to create an agent for your nonprofit, how to automate sales forecasting, and the research on why callers hang up.',
    metaTitle: 'AI Voice Operator Playbooks | Implenix',
    metaDescription:
      'Step-by-step operator playbooks for deploying AI voice, missed-call math, prompt writing, nonprofit deployments, sales forecasting, hang-up research.',
    primaryKeyword: 'ai voice operator playbook',
    postSlugs: [
      'how-to-calculate-your-missed-call-cost',
      'how-to-write-prompts-for-ai-voice-agents',
      'how-to-create-ai-agent-for-nonprofit',
      'how-to-automate-sales-forecasting-with-ai-agents',
      'why-callers-hang-up-before-reaching-anyone',
      'ai-outbound-calling-guide',
      'how-ai-sales-agents-enhance-lead-generation',
    ],
  },
  {
    slug: 'decision-frameworks',
    name: 'Decision frameworks',
    heading: 'Decision frameworks: evaluating AI voice agents',
    intro:
      'For buyers researching AI voice agents, real ROI numbers from the deployment portfolio, pricing tiers with hidden costs called out, comparisons vs human agents and chatbots, sensitive-conversation scope, integration depth, and vendor selection frameworks.',
    metaTitle: 'AI Voice Agent Decision Frameworks | Implenix',
    metaDescription:
      'Decision frameworks for buying AI voice agents, ROI math, pricing tiers, chatbot vs human, integration depth, and sensitive-call scope.',
    primaryKeyword: 'ai voice agent buyer guide',
    postSlugs: [
      'ai-receptionist-roi-real-numbers',
      'how-much-does-ai-agent-cost',
      'best-ai-voice-agent-small-business',
      'how-do-ai-chatbots-compare-to-human-agents',
      'voice-ai-guide-for-local-business',
      'best-ai-agent-security-questionnaires',
      'call-center-automation',
      'can-ai-handle-sensitive-conversations',
      'ai-agent-integration-crm-erp-bi',
      'what-is-a-voice-ai-agent-for-business-phone-systems',
      'how-ai-enhances-agent-productivity-customer-service',
      'how-ai-agents-recognize-human-emotions',
      'can-ai-agents-identify-vulnerable-customers',
    ],
  },
  {
    slug: 'ai-automation',
    name: 'AI automation',
    heading: 'AI agents for business automation',
    intro:
      'How AI agents take over repetitive operations work: connecting to your CRM, ERP and BI stack, keeping data accurate, automating analysis and forecasting, and learning processes without code.',
    metaTitle: 'AI Agents for Business Automation | Implenix',
    metaDescription:
      'How AI agents automate repetitive work, connect to CRM, ERP and BI systems, keep data accurate, and handle analysis and forecasting. Practical guides.',
    primaryKeyword: 'ai agents automation',
    postSlugs: [
      'how-to-automate-repetitive-tasks-using-ai-agents',
      'ai-agent-integration-crm-erp-bi',
      'how-ai-agents-improve-data-accuracy',
      'how-to-use-ai-agents-to-automate-data-analysis',
      'how-to-automate-sales-forecasting-with-ai-agents',
      'how-ai-agents-learn-processes-without-code',
    ],
  },
];

export const TOPIC_SLUGS = TOPICS.map((t) => t.slug);

export function getTopic(slug: string): BlogTopic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

// Reverse lookup: given a blog post slug, return the topics that
// include it. Used by the TopicalLinks component to surface the
// relevant hubs at the bottom of each blog post.
export function getTopicsForPost(postSlug: string): BlogTopic[] {
  return TOPICS.filter((t) => t.postSlugs.includes(postSlug));
}

// Given a blog post slug, return other posts in the same topic
// clusters. Used to auto-generate the internal-linking "Related in
// this topic" block on every blog post.
export function getRelatedPosts(
  postSlug: string,
  limit = 4,
): { slug: string; topicSlug: string }[] {
  const seen = new Set<string>([postSlug]);
  const related: { slug: string; topicSlug: string }[] = [];
  for (const topic of TOPICS) {
    if (!topic.postSlugs.includes(postSlug)) continue;
    for (const s of topic.postSlugs) {
      if (seen.has(s)) continue;
      seen.add(s);
      related.push({ slug: s, topicSlug: topic.slug });
      if (related.length >= limit) return related;
    }
  }
  return related;
}
