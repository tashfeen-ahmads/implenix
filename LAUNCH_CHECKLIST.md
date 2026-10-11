# Implenix launch checklist

Everything you need to set before the site goes live and starts
ranking on Google.

## 1. Environment variables (set in Vercel)

Open Vercel project → Settings → Environment Variables. Set the
following for **Production**, **Preview**, and **Development** (unless
noted).

### Required to launch

| Variable | Value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CALENDLY_URL` | `https://calendly.com/<your-handle>/15min` | Replaces every form on the site. Without this, the Calendly embeds fall back to a placeholder URL. |
| `NEXT_PUBLIC_RON_AGENT_ID` | ElevenLabs agent ID | Powers every "Test Ron now" button (in-browser voice). The agent must allow public access. Without it the Ron panel offers booking instead. |
| `CRM_WEBHOOK_URL` | Your CRM / automation endpoint | Receives every lead and booking. See `docs/CRM_WEBHOOK.md`. |
| `CRM_WEBHOOK_SECRET` | Long random string | Signs each delivery (HMAC-SHA256) so the CRM can verify it. |
| `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` | Zoom Server-to-Server OAuth app | Bookings get a Zoom meeting on the calendar invite. Unset = Google Meet. |

### Required for SEO indexing

| Variable | Value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Code from Search Console | Verifies the domain in Google Search Console so you can submit the sitemap. |
| `NEXT_PUBLIC_BING_VERIFICATION` | Code from Bing Webmaster | Same for Bing. |
| `INDEXNOW_KEY` | A 32-char hex string | The key in `/public/<KEY>.txt` must match. Bing/Yandex/Naver poll this file to verify domain ownership before accepting indexing pings. |
| `INDEXNOW_PING` | `1` | Enables the postbuild ping. Set to `1` only in Production to avoid pinging during preview deploys. |

### Required for analytics

| Variable | Value | Purpose |
|---|---|---|
| GTM container ID | Replace `GTM-XXXXXXX` in `app/layout.tsx` | Loads GTM. |
| GA4 measurement ID | Replace `G-XXXXXXXXXX` in GTM container | Sends pageviews + the conversion events defined in `lib/analytics.ts`. |
| Google Ads conversion ID | Replace `AW-XXXXXXXXXX` in `app/layout.tsx` | Fires the gtag conversion ping alongside GA4. |

## 2. Google Search Console setup

1. Go to https://search.google.com/search-console
2. Add property → URL prefix → `https://implenix.net`
3. Copy the HTML tag verification code
4. Paste it into the `NEXT_PUBLIC_GOOGLE_VERIFICATION` env var in Vercel
5. Trigger a redeploy
6. Click "Verify" in Search Console
7. Once verified, submit the sitemap at `https://implenix.net/sitemap.xml`

## 3. Bing Webmaster Tools setup

1. Go to https://www.bing.com/webmasters
2. Add site → `https://implenix.net`
3. Copy the meta tag verification code
4. Paste it into `NEXT_PUBLIC_BING_VERIFICATION`
5. Redeploy, verify, submit sitemap

## 4. IndexNow setup

The IndexNow integration is wired into the postbuild step. To
activate:

1. Generate a new random hex key (32 chars). Default key shipped is `fa3c2e8d9b1748a6b4f0c5d2e7a98316`.
2. If you rotate the key:
   - Set `INDEXNOW_KEY` env var to the new value
   - Rename `/public/fa3c2e8d9b1748a6b4f0c5d2e7a98316.txt` to match
   - Make sure the file content is also the same key (single line)
3. Set `INDEXNOW_PING=1` in Vercel **Production** environment only
4. Next production deploy will ping IndexNow with every sitemap URL
5. Verify in Bing Webmaster Tools → URL Inspection that pinged URLs land in the index within 24-72 hours

## 5. Structured data validation

Once the site is live, validate the rich-result eligibility:

1. https://search.google.com/test/rich-results — test the homepage, an industry page, a case study, and a blog post
2. https://validator.schema.org — paste the JSON-LD from each page type
3. Verify these schemas render correctly:
   - Homepage: Organization, WebSite, SoftwareApplication (with AggregateRating 5★ × 6)
   - Industry pages: LocalBusiness, FAQ, Service, AggregateRating, Speakable
   - Comparison pages: Article, FAQ, Service, Speakable
   - Case studies: Article, Review (5★), AggregateRating, Speakable
   - Blog posts: BlogPosting, optional HowTo, Speakable

## 6. Core Web Vitals

After production deploy:

1. Run https://pagespeed.web.dev against `https://implenix.net/`
2. Target: LCP < 2.5s, CLS < 0.1, INP < 200ms
3. Validate on mobile (which is what Google scores)
4. Hero images via Unsplash should hit the WebP cache after first request — verify Network tab shows `image/webp` for the hero image

## 7. Social card preview

After deploy, paste each main URL into:

1. https://www.opengraph.xyz — checks OG meta + image
2. https://cards-dev.twitter.com/validator (or post to a private account)
3. Verify per-page OG images render with the post title for blog and the result headline for case studies (these use Next.js' ImageResponse at `/blog/[slug]/opengraph-image.tsx` and `/case-studies/[slug]/opengraph-image.tsx`).

## 8. Mobile responsiveness sweep

Tested on the components most likely to break on small screens:

- [ ] Hero (`/`) — animated transcript stacks above sidebar
- [ ] LiveCallsSection tabs — wrap to 2 rows on phone
- [ ] LeadMagnetPopup — full-width on phone, 2 stacked buttons
- [ ] AuditTool — single column stack
- [ ] TestimonialCard — 1 col on phone, 2 on tablet, 3 on desktop
- [ ] Industry slider — touch-scroll works smoothly
- [ ] Navbar mega-menu — closes on touch outside

Use Chrome DevTools → Toggle Device Toolbar → iPhone 14 (390×844) and iPad Mini (768×1024).

## 9. Content sign-off

- [ ] Calendly URL set in env
- [ ] Ron agent ID set in env and tested in the browser
- [ ] CRM webhook URL + secret set, test lead received
- [ ] Real Unsplash images load on every blog post (or swap to your own CDN URLs)
- [ ] All 6 case studies link to correct mp3 recordings
- [ ] About / Privacy / Terms content reviewed
- [ ] No "PLACEHOLDER" strings remain anywhere
- [ ] Footer "© 2025" updated to the launch year

## 10. Post-launch (week 1)

- [ ] Submit sitemap in Search Console + Bing
- [ ] Set `INDEXNOW_PING=1` and trigger one redeploy to push initial ping
- [ ] Verify GA4 events firing in real-time view (call agent, audit run, calendar booked)
- [ ] Set up Google Ads conversion import from GA4
- [ ] Run Lighthouse audit, fix any issue scoring under 90 on Performance / SEO
- [ ] Create branded Search Console URL group for the money keywords
- [ ] Pull 30-day Search Console + GA4 report on day 30

## 10. Scheduled blog posts

Blog posts with a future `publishedAt` are hidden everywhere (index, hubs,
related links, RSS, sitemap, and the post URL itself 404s) until a build
runs after that date. 13 posts are scheduled weekly from Oct 14 2026 to
Jan 6 2027, so set up a weekly rebuild:

1. Vercel → Project → Settings → Git → Deploy Hooks → create one for `main`.
2. Call it weekly, e.g. a GitHub Actions cron (`curl -X POST <hook-url>`
   every Wednesday 06:00 UTC) or any scheduler.
