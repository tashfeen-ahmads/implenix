import { defineDocumentType, makeSource } from 'contentlayer2/source-files';

export const Industry = defineDocumentType(() => ({
  name: 'Industry',
  filePathPattern: `industries/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    industry: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    metaTitle: { type: 'string', required: true },
    metaDescription: { type: 'string', required: true },
    targetKeyword: { type: 'string', required: true },
    relatedKeywords: { type: 'list', of: { type: 'string' }, required: true },
    heroStat: { type: 'string', required: true },
    heroStatLabel: { type: 'string', required: true },
    painPoints: { type: 'json', required: true },
    solutions: { type: 'json', required: true },
    stats: { type: 'json', required: true },
    caseStudySlug: { type: 'string', required: true },
    testimonialQuote: { type: 'string', required: true },
    testimonialAuthor: { type: 'string', required: true },
    faq: { type: 'json', required: true },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/ai-receptionist-for-${doc.slug}`,
    },
  },
}));

export const CaseStudy = defineDocumentType(() => ({
  name: 'CaseStudy',
  filePathPattern: `case-studies/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    industry: { type: 'string', required: true },
    metaTitle: { type: 'string', required: true },
    metaDescription: { type: 'string', required: true },
    resultHeadline: { type: 'string', required: true },
    summary: { type: 'string', required: true },
    clientOverview: { type: 'json', required: true },
    painPoints: { type: 'list', of: { type: 'string' }, required: true },
    solutionSummary: { type: 'string', required: true },
    integrations: { type: 'list', of: { type: 'string' }, required: true },
    primaryMetric: { type: 'json', required: true },
    secondaryMetric: { type: 'json', required: true },
    timeToResults: { type: 'json', required: true },
    publishedAt: { type: 'date', required: true },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/case-studies/${doc.slug}`,
    },
  },
}));

export const Doc = defineDocumentType(() => ({
  name: 'Doc',
  filePathPattern: `docs/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    section: { type: 'string', required: true },
    order: { type: 'number', required: true },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace(/^docs\//, ''),
    },
    url: {
      type: 'string',
      resolve: (doc) => `/docs/${doc._raw.flattenedPath.replace(/^docs\//, '')}`,
    },
  },
}));

function plain(md: string): string {
  return md
    .replace(/<[^>]+>/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFaqs(raw: string): { question: string; answer: string }[] {
  const start = raw.search(/^## (FAQ|Frequently asked questions)/im);
  if (start < 0) return [];
  const rest = raw.slice(start).split('\n').slice(1);
  const out: { question: string; answer: string }[] = [];
  let q: string | null = null;
  let a: string[] = [];
  const flush = () => {
    if (q && a.join(' ').trim()) out.push({ question: plain(q), answer: plain(a.join(' ')) });
    q = null;
    a = [];
  };
  for (const line of rest) {
    if (/^## /.test(line)) break;
    const h3 = /^### (.+)$/.exec(line);
    const bold = /^\*\*(.+\?)\*\*\s*$/.exec(line.trim());
    if (h3 || bold) {
      flush();
      q = (h3 ?? bold)![1];
    } else if (q) {
      a.push(line);
    }
  }
  flush();
  return out;
}

export const BlogPost = defineDocumentType(() => ({
  name: 'BlogPost',
  filePathPattern: `blog/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    category: { type: 'string', required: true },
    publishedAt: { type: 'date', required: true },
    // Set when a post is materially revised; emitted as dateModified.
    updatedAt: { type: 'date', required: false },
    author: { type: 'string', required: true },
    authorRole: { type: 'string', required: true },
    authorBio: { type: 'string', required: false },
    metaTitle: { type: 'string', required: true },
    metaDescription: { type: 'string', required: true },
    heroImage: { type: 'string', required: false },
    heroImageAlt: { type: 'string', required: false },
    howToSteps: { type: 'json', required: false },
    howToTotalTime: { type: 'string', required: false },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace(/^blog\//, ''),
    },
    url: {
      type: 'string',
      resolve: (doc) => `/blog/${doc._raw.flattenedPath.replace(/^blog\//, '')}`,
    },
    // Question/answer pairs from the post's "## Frequently asked
    // questions" section (### or **bold?** questions), for FAQPage JSON-LD.
    faqs: {
      type: 'json',
      resolve: (doc) => extractFaqs(doc.body.raw),
    },
    readTime: {
      type: 'string',
      resolve: (doc) => {
        const words = doc.body.raw.split(/\s+/).length;
        const minutes = Math.max(1, Math.round(words / 200));
        return `${minutes} min read`;
      },
    },
  },
}));

export const Resource = defineDocumentType(() => ({
  name: 'Resource',
  filePathPattern: `resources/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    kind: { type: 'enum', options: ['guide', 'playbook'], required: true },
    publishedAt: { type: 'date', required: true },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace(/^resources\//, ''),
    },
    url: {
      type: 'string',
      resolve: (doc) => `/resources/${doc._raw.flattenedPath.replace(/^resources\//, '')}`,
    },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Industry, CaseStudy, Doc, BlogPost, Resource],
  disableImportAliasWarning: true,
});
