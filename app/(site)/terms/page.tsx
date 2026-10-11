import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/common/Badge';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { webPageSchema, breadcrumbListSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms & Conditions | Implenix',
  description:
    'Implenix Terms & Conditions, the agreement governing your use of implenix.net and Implenix AI voice agent deployment services.',
  path: '/terms',
});

const EFFECTIVE_DATE = 'January 8, 2026';
const LAST_UPDATED = 'January 8, 2026';

export default function TermsPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          webPageSchema({
            name: 'Terms & Conditions | Implenix',
            description:
              'Implenix Terms & Conditions, the agreement governing your use of implenix.net and Implenix AI voice deployment services.',
            url: '/terms',
            breadcrumb: [
              { label: 'Home', href: '/' },
              { label: 'Terms', href: '/terms' },
            ],
          }),
          breadcrumbListSchema([
            { label: 'Home', href: '/' },
            { label: 'Terms', href: '/terms' },
          ]),
        ]}
      />
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-12 md:pt-24 md:pb-16">
          <Badge label="Legal · Terms" variant="cyan" />
          <h1 className="font-heading text-4xl md:text-5xl mt-5 leading-[1.05]">
            Terms &amp; Conditions
          </h1>
          <p className="mt-5 font-body text-white/70 text-sm">
            Effective date: {EFFECTIVE_DATE} · Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 py-14">
        <div className="prose-implenix">
          <p>
            These Terms &amp; Conditions ("<strong>Terms</strong>") govern
            your access to and use of the website at{' '}
            <a
              href="https://implenix.net"
              target="_blank"
              rel="noopener noreferrer"
            >
              implenix.net
            </a>{' '}
            (the "<strong>Website</strong>") and the AI voice agent
            deployment services provided by Implenix ("
            <strong>Implenix</strong>", "<strong>we</strong>", "
            <strong>our</strong>", or "<strong>us</strong>") (collectively,
            the "<strong>Services</strong>"). By accessing the Website or
            engaging Implenix as a customer, you ("<strong>you</strong>" or
            "<strong>Customer</strong>") agree to be bound by these Terms.
            If you do not agree to these Terms, do not use the Website or
            Services.
          </p>

          <h2>1. Agreement to these Terms</h2>

          <p>
            By using the Website, talking to our AI voice agent, or booking a
            consultation, you accept these Terms. If you are entering into
            these Terms on behalf of a business or other legal entity, you
            represent that you have the authority to bind that entity to
            these Terms.
          </p>

          <h2>2. Description of Services</h2>

          <p>Implenix provides:</p>

          <ul>
            <li>
              <strong>Website content</strong>, educational and marketing
              content, blog posts, case studies, glossary, and industry
              guides.
            </li>
            <li>
              <strong>Free tools</strong>, the missed-call audit tool and
              related calculators, provided for informational purposes.
            </li>
            <li>
              <strong>AI voice agent demonstrations</strong>, an
              in-browser voice conversation with Ron, our AI voice agent,
              for prospective customers to hear a live demonstration.
            </li>
            <li>
              <strong>Booking service</strong>, a calendar widget for
              scheduling human consultation calls with the Implenix team.
            </li>
            <li>
              <strong>Contracted AI voice agent deployment services</strong>{' '}
for customers who enter into a separate written services
              agreement, deployment and operation of a customized AI voice
              agent for their business.
            </li>
          </ul>

          <h2>3. Nature of the Website content</h2>

          <p>
            Content on the Website, including blog posts, case studies,
            calculators, industry guides, and audit tools, is provided for
            informational purposes only. It does not constitute legal,
            financial, medical, or professional advice. Numbers cited in
            case studies and audit calculators are drawn from actual
            deployments but should not be relied upon as guarantees for
            your specific situation.
          </p>

          <p>
            Any deployment engagement is subject to a separate written
            services agreement between Implenix and Customer that
            supersedes any indicative pricing or scope described on the
            Website.
          </p>

          <h2>4. Your obligations</h2>

          <p>You agree to:</p>

          <ul>
            <li>
              Provide accurate information when booking a consultation or
              interacting with the AI voice agent.
            </li>
            <li>
              Use the Website and Services in compliance with all
              applicable laws.
            </li>
            <li>
              Not access the Website or Services through automated means
              (bots, scrapers, or crawlers) except for search-engine
              crawlers respecting our robots.txt.
            </li>
            <li>
              Not use the AI voice agent line for testing security
              vulnerabilities, denial-of-service, or any purpose other than
              evaluating our services.
            </li>
            <li>
              Not attempt to reverse-engineer, decompile, or extract the
              underlying models, prompts, or intellectual property of our
              AI voice agents.
            </li>
          </ul>

          <h2>5. Prohibited uses</h2>

          <p>You may not use the Website or Services to:</p>

          <ul>
            <li>Violate any local, state, national, or international law</li>
            <li>Infringe the intellectual property rights of others</li>
            <li>Distribute malware, viruses, or other harmful code</li>
            <li>Harass, defame, or defraud any person</li>
            <li>
              Impersonate another person or entity, or misrepresent your
              affiliation with any person or entity
            </li>
            <li>
              Send unsolicited messages ("spam") via any channel enabled by
              the Services
            </li>
            <li>
              Use the AI voice agent line for illegal recording of a call
              in a jurisdiction where such recording is prohibited
            </li>
            <li>
              Take any action that could damage, disable, or overburden the
              Website or Services
            </li>
          </ul>

          <h2>6. Intellectual property</h2>

          <p>
            The Website and its original content, features, and
            functionality, including logos, trademarks, copy, blog posts,
            case study numbers, diagrams, and AI voice agent scripts, are
            owned by Implenix and are protected by copyright, trademark,
            trade secret, and other intellectual property laws. You may not
            reproduce, redistribute, or create derivative works from this
            content without Implenix's prior written consent, except as
            expressly permitted by fair use or fair dealing under
            applicable law.
          </p>

          <p>
            You retain ownership of any information you provide to us
            (business details, call recordings on your side of any
            deployment, your customer data). Under a separate written
            services agreement, you grant Implenix a limited license to
            process your data solely for delivering the contracted
            Services.
          </p>

          <h2>7. Third-party services</h2>

          <p>
            The Website integrates with third-party services including
            Google Analytics, Google Tag Manager, Google Calendar, Google
            Meet, Vercel, Vapi/Twilio, and (where applicable) AI language
            model providers. These services are subject to their own terms
            and privacy policies. Implenix is not responsible for the
            practices of these third parties.
          </p>

          <h2>8. Fees and payment</h2>

          <p>
            Access to the Website and use of the AI voice agent
            consultation line is provided free of charge. Contracted
            deployment services are provided under a separate written
            services agreement that specifies fees, payment terms, and
            delivery obligations. This Terms document does not constitute
            an offer to enter into any paid engagement.
          </p>

          <h2>9. Warranties and disclaimers</h2>

          <p>
            The Website and free-tier Services are provided "
            <strong>AS IS</strong>" and "<strong>AS AVAILABLE</strong>"
            with no warranties of any kind, express or implied. Implenix
            disclaims all warranties including, but not limited to,
            warranties of merchantability, fitness for a particular
            purpose, and non-infringement.
          </p>

          <p>
            Implenix does not warrant that the Website will be
            uninterrupted, error-free, secure, or that defects will be
            corrected. Implenix does not warrant the accuracy,
            completeness, or reliability of any content on the Website, including case study numbers, industry averages, or audit
            calculator outputs.
          </p>

          <p>
            The AI voice agent consultation line is provided as a
            demonstration only. Implenix makes no representation that the
            agent will produce any specific outcome for your business.
          </p>

          <h2>10. Limitation of liability</h2>

          <p>
            To the fullest extent permitted by applicable law, Implenix
            and its affiliates, officers, employees, contractors, and
            agents will not be liable for any indirect, incidental,
            special, consequential, or punitive damages, including without
            limitation loss of profits, data, use, goodwill, or other
            intangible losses, resulting from:
          </p>

          <ul>
            <li>Your access to or use of the Website or Services;</li>
            <li>Your inability to access or use the Website or Services;</li>
            <li>
              Any content obtained from the Website or produced by the AI
              voice agent;
            </li>
            <li>
              Unauthorized access, use, or alteration of your transmissions
              or content;
            </li>
            <li>
              Any bug, virus, or malicious software transmitted via the
              Website or Services.
            </li>
          </ul>

          <p>
            In no event will Implenix's total aggregate liability arising
            out of or relating to these Terms or the Website exceed the
            greater of (a) the total fees paid by you to Implenix in the
            twelve months preceding the event giving rise to the claim, or
            (b) one hundred US dollars (<strong>US$100</strong>).
          </p>

          <p>
            Some jurisdictions do not allow the exclusion or limitation of
            certain warranties or liabilities, so some of the above
            limitations may not apply to you.
          </p>

          <h2>11. Indemnification</h2>

          <p>
            You agree to indemnify, defend, and hold harmless Implenix and
            its affiliates, officers, employees, contractors, and agents
            from and against any claims, damages, obligations, losses,
            liabilities, costs, or expenses (including attorney's fees)
            arising from: (a) your use of and access to the Services;
            (b) your violation of these Terms; (c) your violation of any
            third-party right, including without limitation any copyright,
            property, or privacy right.
          </p>

          <h2>12. Termination</h2>

          <p>
            We may terminate or suspend your access to the Website or
            Services immediately, without prior notice or liability, for
            any reason, including without limitation if you breach these
            Terms. Upon termination, your right to use the Website and
            Services will immediately cease.
          </p>

          <p>
            Sections that by their nature should survive termination, including Intellectual Property, Warranties and Disclaimers,
            Limitation of Liability, Indemnification, and Governing Law, will survive termination.
          </p>

          <h2>13. Governing law and dispute resolution</h2>

          <p>
            These Terms are governed by the laws of the State of Delaware,
            United States, without regard to conflict-of-law principles.
            Any dispute arising out of or relating to these Terms or the
            Services will be resolved through binding arbitration
            administered by a mutually agreed arbitration provider in the
            State of Delaware, except that either party may seek
            injunctive relief in a court of competent jurisdiction for
            infringement of intellectual property rights.
          </p>

          <p>
            You agree to resolve any dispute on an individual basis and
            not as a class or representative action, to the extent
            permitted by applicable law.
          </p>

          <h2>14. Modifications to these Terms</h2>

          <p>
            We reserve the right to modify these Terms at any time. When we
            do, we will update the "Last updated" date at the top of the
            page. For material changes, we will post a prominent notice on
            the Website. Your continued use of the Website or Services
            after such modifications constitutes your acceptance of the
            revised Terms.
          </p>

          <h2>15. Miscellaneous</h2>

          <ul>
            <li>
              <strong>Entire agreement.</strong> These Terms, together with
              our <Link href="/privacy-policy">Privacy Policy</Link> and
              any separate written services agreement, constitute the
              entire agreement between you and Implenix regarding the
              Website and Services.
            </li>
            <li>
              <strong>Severability.</strong> If any provision of these
              Terms is held unenforceable, the remaining provisions will
              remain in full force and effect.
            </li>
            <li>
              <strong>No waiver.</strong> Our failure to enforce any right
              or provision of these Terms is not a waiver of that right or
              provision.
            </li>
            <li>
              <strong>Assignment.</strong> You may not assign or transfer
              these Terms without our prior written consent. Implenix may
              assign these Terms without restriction.
            </li>
            <li>
              <strong>Notices.</strong> Any notice required by these Terms
              may be sent to the address in Section 16.
            </li>
          </ul>

          <h2>16. Contact</h2>

          <p>For questions about these Terms, contact Implenix at:</p>

          <address style={{ fontStyle: 'normal', marginTop: '1rem' }}>
            <strong>Implenix, Attn: Legal</strong>
            <br />
            Website:{' '}
            <a href="https://implenix.net/contact">implenix.net/contact</a>
            <br />
            Or book a call at{' '}
            <Link href="/contact">implenix.net/contact</Link> and mention
            "legal inquiry" in the notes field.
          </address>

          <p style={{ marginTop: '2rem', fontSize: '0.9em', opacity: 0.7 }}>
            These Terms &amp; Conditions are provided for informational
            purposes and do not constitute legal advice. Implenix reserves
            the right to update these Terms at any time.
          </p>
        </div>
      </article>
    </>
  );
}
