# Media needed

What the site needs to look finished and to rank, in priority order.
Today the site has **zero photos, zero video, and one real image file**
(the logo mark). Every visual is built from code. That keeps it fast,
but it reads as "template" and gives Google nothing for image search,
rich results, or E-E-A-T.

Format for everything: WebP or AVIF (PNG only for logos), self-hosted in
`public/images/`, descriptive file names (`hvac-owner-answering-phone.webp`,
not `IMG_2041.webp`), and a real sentence of alt text.

## Tier 1: before launch

| # | Asset | Spec | Where it goes | Why |
|---|---|---|---|---|
| 1 | **Founder headshot** (Tashfeen Ahmad) | 800×800, plus a 1600×1000 candid/working shot | Blog bylines (all 44 posts), `/about` founder section, Person schema `image` | All 44 posts are authored by Tashfeen but show initials. A real face is the single biggest E-E-A-T signal for YMYL-adjacent content. |
| 2 | **Ron character art** | Hero render 1600×1600 (transparent PNG), avatar 512×512, 3–4 poses/expressions | Hero, Ron panel orb, try-it page, OG cards | You're building Ron as a character. Owning one consistent face of the product beats a fake phone mockup. |
| 3 | **60–90s product demo video** | 1920×1080 MP4 (H.264) + a 1080×1920 vertical cut, captions burned in, poster frame | Homepage under hero, `/pricing`, `/try-it`, YouTube | Shows a real call → booking → CRM. Enables `VideoObject` schema and video rich results. YouTube is the #2 search engine and is heavily cited by AI answers. |
| 4 | **Real call recordings** for every case study | MP3, 30–90s, redacted, plus a text transcript | 6 case studies (only 3 have audio today), `/solutions/ai-followup` (player has no file) | Audio proof converts. Transcripts make the content indexable. |
| 5 | **Client logos + owner photos** (with written permission) | Logos as SVG; photos 600×600 | 6 testimonial cards, 6 case studies, a "trusted by" strip under the hero | Testimonials with initials only read as invented. |

## Tier 2: first month after launch

| # | Asset | Spec | Where it goes | Why |
|---|---|---|---|---|
| 6 | **Real product screenshots**: dashboard, call log, CRM record, calendar booking | 2400×1500 PNG/WebP, real UI with redacted data | Hero alternative, How it works (3 steps), comparison pages (replace the code-built `CodeWindow` panels) | The taste skill's hardest rule: no fake div screenshots. Real UI is also image-search fodder. |
| 7 | **Integration logos** (16: GoHighLevel, HubSpot, Salesforce, ServiceTitan, Jobber, Clio…) | Official SVGs from each brand's press kit | Integration marquee (currently text boxes) | Instant credibility. Check each brand's logo-use rules. |
| 8 | **Industry photography**, 1 per industry (25) | 1600×1000, real local-business owners at work (HVAC tech in a van, dental front desk, realtor on a call) | Top of each `/ai-receptionist-for-[industry]` page + industry slider | Those 25 pages are your main SEO surface and currently have icons only. Unique images per page help them rank in image search and stop them looking like duplicate templates. |
| 9 | **Branded blog covers** (44) | 1600×900, one template in brand colors with the post title | Every blog post (now hotlinked, unoptimized Unsplash stock; 8 photos are reused across 21 posts) | Duplicate stock images hurt image SEO and look generic. Self-hosting also lets Next.js optimize them (LCP). |

## Tier 3: nice to have

- **Team / office photos** for `/about` (the page has no people today).
- **Short vertical clips** (15–30s) of Ron handling one objection each, for Reels, TikTok and Shorts, embedded on industry pages.
- **Press / "as seen in" logos** once coverage lands (templates are in `PRESS_HARO_TEMPLATES.md`).
- **Custom illustrations or 3D renders** for the 3 "How it works" steps, in the Ron art style.

## Already fixed in code (no media needed)

- `og-default.png` (social share card) and `logo.png` existed in config
  but not on disk, so every share preview was blank. Both now exist.
- The generated share-card route crashed on every request. Fixed.
- Organization schema now has `logo` and `image`. Add your LinkedIn, X,
  YouTube and Google Business Profile URLs to `sameAs` in
  `lib/schema.ts` once they exist.

## When media arrives, the code work is

- Add `VideoObject` / `AudioObject` schema next to the embeds.
- Add images to the sitemap (`next-sitemap` `transform`).
- Drop `unoptimized` on blog images once they're self-hosted.
- Use `next/image` with `priority` on the hero asset (LCP).
