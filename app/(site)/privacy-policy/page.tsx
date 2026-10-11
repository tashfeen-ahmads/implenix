import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/common/Badge';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { webPageSchema, breadcrumbListSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy | Implenix',
  description:
    'Implenix privacy policy, what data we collect, how we use it, your rights under GDPR and CCPA, and how to contact us about privacy.',
  path: '/privacy-policy',
});

const EFFECTIVE_DATE = 'January 8, 2026';
const LAST_UPDATED = 'October 11, 2026';

export default function PrivacyPolicyPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          webPageSchema({
            name: 'Privacy Policy | Implenix',
            description:
              'Implenix privacy policy, what data we collect, how we use it, GDPR/CCPA rights, and contact for privacy requests.',
            url: '/privacy-policy',
            breadcrumb: [
              { label: 'Home', href: '/' },
              { label: 'Privacy Policy', href: '/privacy-policy' },
            ],
          }),
          breadcrumbListSchema([
            { label: 'Home', href: '/' },
            { label: 'Privacy Policy', href: '/privacy-policy' },
          ]),
        ]}
      />
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-12 md:pt-24 md:pb-16">
          <Badge label="Legal · Privacy" variant="cyan" />
          <h1 className="font-heading text-4xl md:text-5xl mt-5 leading-[1.05]">
            Privacy Policy
          </h1>
          <p className="mt-5 font-body text-white/70 text-sm">
            Effective date: {EFFECTIVE_DATE} · Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 py-14">
        <div className="prose-implenix">
          <p>
            Implenix ("<strong>Implenix</strong>", "<strong>we</strong>", "
            <strong>our</strong>", or "<strong>us</strong>") operates the
            website at{' '}
            <a href="https://implenix.net" target="_blank" rel="noopener noreferrer">
              implenix.net
            </a>{' '}
            and provides AI voice agent deployment services for local
            businesses. This Privacy Policy explains what personal
            information we collect, how we use it, who we share it with,
            and the rights you have under applicable laws including the
            EU General Data Protection Regulation (GDPR), the California
            Consumer Privacy Act (CCPA/CPRA), and other US state privacy
            laws.
          </p>

          <p>
            By using implenix.net or engaging Implenix as a customer or
            prospective customer, you consent to the practices described in
            this Privacy Policy.
          </p>

          <h2>1. Information we collect</h2>

          <h3>1.1 Information you provide directly</h3>

          <p>
            When you book a consultation call through our calendar widget or
            contact us through the website, we collect:
          </p>

          <ul>
            <li>
              <strong>Name</strong> and <strong>email address</strong> so we
              can confirm the meeting and send the Google Meet link and
              calendar invite.
            </li>
            <li>
              <strong>Phone number</strong> (optional) if you provide one on
              the booking form so we can reach you if the Meet link fails or
              you request a phone call instead.
            </li>
            <li>
              <strong>Notes about your business</strong> (optional) that you
              add to the booking form to help us prepare for the call.
            </li>
          </ul>

          <p>
            When you talk to Ron, our AI voice agent, in your browser
            (the “Test Ron now” buttons on this site), we collect:
          </p>

          <ul>
            <li>
              <strong>Your voice input</strong>, captured through your
              browser microphone only after you grant permission and press
              “Start talking”, then converted to text and processed by our
              AI voice provider.
            </li>
            <li>
              <strong>The full conversation recording</strong> and{' '}
              <strong>text transcript</strong> for quality assurance and
              product improvement.
            </li>
            <li>
              Any <strong>business information</strong> you share during the
              conversation (industry, business name, call volume, etc.).
            </li>
          </ul>

          <h3>1.2 Information collected automatically</h3>

          <p>
            When you visit implenix.net, we collect (via Google Analytics 4,
            Google Tag Manager, and Vercel infrastructure):
          </p>

          <ul>
            <li>Browser type, operating system, and device type</li>
            <li>
              IP address (truncated for privacy where required by law) and
              approximate geographic location (city / region / country)
            </li>
            <li>
              Pages visited, time on page, referring URL, and click-through
              paths
            </li>
            <li>
              Interactions with specific elements, for example, clicking
              the “Test Ron now” button, submitting a booking, or opening the
              audit tool
            </li>
          </ul>

          <p>
            We do <strong>not</strong> collect financial information
            (credit card numbers, bank details) directly through the
            website. Any billing is handled through separate written
            agreements with contracted customers.
          </p>

          <h3>1.3 Information from third-party services</h3>

          <p>
            Where you interact with us through Google Calendar (booking a
            consultation), we receive limited information (your name and
            email) from Google as part of the calendar invitation flow.
            This is subject to Google's own privacy policies.
          </p>

          <h2>2. How we use your information</h2>

          <p>We use the information we collect to:</p>

          <ol>
            <li>
              <strong>Deliver the consultation</strong>, send calendar
              invites, Meet links, reminders, and (where you have opted in)
              follow-up communications about our services.
            </li>
            <li>
              <strong>Operate the AI voice agent</strong>, respond to your
              call, capture intake, route escalations to a human, and log
              the interaction for our internal records.
            </li>
            <li>
              <strong>Improve the product</strong>, analyze aggregate
              website usage and (with call recordings) improve the quality
              of the AI voice agent's script and responses.
            </li>
            <li>
              <strong>Provide customer support</strong>, respond to
              questions, troubleshoot issues, and resolve disputes.
            </li>
            <li>
              <strong>Comply with legal obligations</strong>, respond to
              lawful requests from regulators, comply with tax and
              accounting requirements, and enforce our Terms &amp;
              Conditions.
            </li>
            <li>
              <strong>Prevent fraud and abuse</strong>, detect and prevent
              unauthorized access, security threats, and abuse of our
              services.
            </li>
          </ol>

          <h2>3. Legal basis for processing (GDPR)</h2>

          <p>
            If you are located in the European Economic Area (EEA), the
            United Kingdom, or Switzerland, we process your personal data
            under the following legal bases:
          </p>

          <ul>
            <li>
              <strong>Consent</strong>, when you actively book a call,
              talk to Ron, or interact with cookie-enabled tracking.
            </li>
            <li>
              <strong>Contract</strong>, when we need to deliver services
              you have signed up for.
            </li>
            <li>
              <strong>Legitimate interest</strong>, for operating and
              improving our website and services in ways that do not
              override your privacy rights.
            </li>
            <li>
              <strong>Legal obligation</strong>, where we are required to
              retain records for tax or compliance reasons.
            </li>
          </ul>

          <h2>4. Who we share your information with</h2>

          <p>
            We do <strong>not sell</strong> personal information. We share
            information only with the following categories of recipients,
            under contractual privacy safeguards:
          </p>

          <table>
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Google (Analytics 4, Tag Manager, Calendar, Meet)</td>
                <td>
                  Website analytics, booking calendar, video meeting
                  delivery
                </td>
              </tr>
              <tr>
                <td>Vercel Inc.</td>
                <td>
                  Website hosting, edge caching, deployment infrastructure
                </td>
              </tr>
              <tr>
                <td>ElevenLabs Inc.</td>
                <td>
                  In-browser voice conversations with Ron: speech
                  recognition, voice synthesis, conversation recording
                </td>
              </tr>
              <tr>
                <td>Vapi / Twilio (or equivalent voice infrastructure)</td>
                <td>
                  Telephone connectivity, call recording, real-time
                  transcription for the AI voice agent
                </td>
              </tr>
              <tr>
                <td>OpenAI / Anthropic (or equivalent AI providers)</td>
                <td>
                  Language model inference for the AI voice agent
                  conversation
                </td>
              </tr>
              <tr>
                <td>Bing Microsoft (IndexNow) and Yandex</td>
                <td>Search-engine indexing notifications</td>
              </tr>
              <tr>
                <td>
                  Professional advisors (accountants, lawyers)
                </td>
                <td>Legal and financial compliance</td>
              </tr>
              <tr>
                <td>Successors in a business transaction</td>
                <td>
                  In the event of a merger, acquisition, or sale of assets
                </td>
              </tr>
              <tr>
                <td>Law enforcement / regulators</td>
                <td>
                  Where required by lawful court order or valid regulatory
                  demand
                </td>
              </tr>
            </tbody>
          </table>

          <p>
            All third-party service providers are contractually required to
            treat personal information consistently with this Privacy
            Policy and applicable law.
          </p>

          <h2>5. Cookies and tracking technologies</h2>

          <p>
            We use cookies and similar technologies for the following
            purposes:
          </p>

          <ul>
            <li>
              <strong>Strictly necessary cookies</strong> for site security
              and functionality
            </li>
            <li>
              <strong>Analytics cookies</strong> (via Google Analytics 4 /
              Tag Manager) to understand aggregated usage patterns
            </li>
            <li>
              <strong>Advertising cookies</strong> if we activate Google
              Ads or Meta Pixel tracking in the future (currently
              placeholder configuration only)
            </li>
          </ul>

          <p>
            You can control cookies through your browser settings. For
            residents of the EU/UK, we will present a cookie consent
            interface before setting non-essential cookies. For residents
            of California, you may opt out of the "sale" or "sharing" of
            personal information as those terms are defined by CCPA/CPRA
            by contacting us at the address below.
          </p>

          <h2>6. Data retention</h2>

          <p>
            We retain personal information only as long as we need it for
            the purposes described in this Policy, unless a longer
            retention period is required by law:
          </p>

          <ul>
            <li>
              <strong>Booking data</strong> (name, email, phone from
              consultation bookings): retained for the duration of our
              business relationship plus <strong>90 days</strong> for
              record-keeping.
            </li>
            <li>
              <strong>Call and conversation recordings and transcripts</strong>: retained
              for <strong>90 days</strong> for quality assurance, then
              anonymized or deleted.
            </li>
            <li>
              <strong>Website analytics data</strong>: retained as long as
              Google Analytics defaults require (currently up to 14 months
              for user-identifiable data).
            </li>
            <li>
              <strong>Business records</strong> (contracts, invoices,
              tax-relevant documents): retained per applicable financial
              record-keeping laws, typically 7 years.
            </li>
          </ul>

          <h2>7. Your rights</h2>

          <p>
            Depending on where you live, you may have the following rights
            regarding your personal information:
          </p>

          <ul>
            <li>
              <strong>Access</strong>, request a copy of the personal
              information we hold about you.
            </li>
            <li>
              <strong>Correction</strong>, request that we correct
              inaccurate or incomplete information.
            </li>
            <li>
              <strong>Deletion</strong> ("right to be forgotten"), request that we delete your personal information, subject to
              legal retention requirements.
            </li>
            <li>
              <strong>Restriction of processing</strong>, request that we
              stop or limit our use of your data.
            </li>
            <li>
              <strong>Data portability</strong>, request that we provide
              your data in a portable, machine-readable format.
            </li>
            <li>
              <strong>Objection</strong>, object to processing based on
              legitimate interest, including for direct marketing.
            </li>
            <li>
              <strong>Opt-out of "sale" / "sharing"</strong> under CCPA/CPRA
              (we do not sell personal information, but you may still
              formally opt out).
            </li>
            <li>
              <strong>Withdraw consent</strong> for any processing based on
              consent, without affecting the lawfulness of prior processing.
            </li>
            <li>
              <strong>Lodge a complaint</strong> with a data protection
              authority in your jurisdiction (e.g. ICO in the UK, CNIL in
              France, state attorneys general in the US).
            </li>
          </ul>

          <p>
            To exercise these rights, contact us at the address in Section
            13. We will respond within the timeframe required by applicable
            law (typically 30 days for GDPR requests, 45 days for CCPA
            requests).
          </p>

          <h2>8. International data transfers</h2>

          <p>
            Implenix is based in the United States. If you access our
            services from outside the United States, your information will
            be transferred to and processed in the United States. Some of
            our third-party service providers are also based in or process
            data in the United States and other jurisdictions.
          </p>

          <p>
            Where required by law, we rely on European Commission Standard
            Contractual Clauses, adequacy decisions, or other approved
            transfer mechanisms to safeguard cross-border transfers of
            personal data.
          </p>

          <h2>9. Children's privacy</h2>

          <p>
            Implenix services are not directed at children under the age
            of 16 (or 13 in the United States, per COPPA). We do not
            knowingly collect personal information from children. If you
            believe we have collected information from a child, please
            contact us at the address in Section 13 and we will delete it
            promptly.
          </p>

          <h2>10. Security</h2>

          <p>
            We implement commercially reasonable technical and
            organizational measures to protect your personal information, including encryption in transit (TLS), encryption at rest,
            role-based access controls, and audit logging. No security
            measure is perfect, and we cannot guarantee absolute security
            of any information transmitted over the internet.
          </p>

          <h2>11. Automated decision-making and AI processing</h2>

          <p>
            Our AI voice agent uses automated processing to respond to
            callers, capture intake, and route calls. This processing does
            not produce legal or similarly significant effects on you, it is intake and routing infrastructure. Any decisions
            requiring human judgment (accepting your business, quoting
            services, deciding on next steps) are made by our human team,
            not the AI.
          </p>

          <h2>12. Changes to this Privacy Policy</h2>

          <p>
            We may update this Privacy Policy from time to time to reflect
            changes to our practices or applicable law. When we do, we
            will update the "Last updated" date at the top of the page and,
            for material changes, notify affected users through the website
            or via email (if we hold your email address).
          </p>

          <h2>13. Contact us</h2>

          <p>
            For privacy questions, requests, or complaints, contact
            Implenix at:
          </p>

          <address style={{ fontStyle: 'normal', marginTop: '1rem' }}>
            <strong>Implenix, Attn: Privacy</strong>
            <br />
            Website:{' '}
            <a href="https://implenix.net/contact">implenix.net/contact</a>
            <br />
            Or book a call at{' '}
            <Link href="/contact">implenix.net/contact</Link> and mention
            "privacy request" in the notes field.
          </address>

          <p style={{ marginTop: '2rem', fontSize: '0.9em', opacity: 0.7 }}>
            This Privacy Policy is provided for informational purposes and
            does not constitute legal advice. Implenix reserves the right
            to update this Policy at any time.
          </p>
        </div>
      </article>
    </>
  );
}
