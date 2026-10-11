import { allBlogPosts } from 'contentlayer/generated';

// Posts are drip-scheduled: a future `publishedAt` means "not live yet".
// Everything public (index, hubs, related links, RSS, sitemap, the post
// route itself) reads from this list, so a scheduled post appears on the
// first deploy after its date. Pages are static, so publishing a
// scheduled post needs a rebuild (see LAUNCH_CHECKLIST.md: weekly deploy
// hook).
export const publishedBlogPosts = allBlogPosts.filter(
  (p) => new Date(p.publishedAt).getTime() <= Date.now(),
);

export type BlogPost = (typeof allBlogPosts)[number];
