import { CheckCircle2, CircleAlert, CircleDashed } from 'lucide-react';
import { Card, PageHeader } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Setup' };

// Which integrations are connected, in the order email marketing needs
// them. Only shows whether each variable is set, never its value.

type Item = { label: string; env: string[]; anyOf?: boolean; optional?: boolean; note?: string };
type Group = { title: string; doc: string; why: string; items: Item[] };

const GROUPS: Group[] = [
  {
    title: '1. Database and team login',
    doc: 'docs/TEAM_DASHBOARD.md',
    why: 'Everything else stores its data here.',
    items: [
      { label: 'Supabase project', env: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] },
      { label: 'Server key (cron, webhooks, imports)', env: ['SUPABASE_SERVICE_ROLE_KEY'] },
    ],
  },
  {
    title: '2. Finding businesses',
    doc: 'docs/LEAD_FINDER.md',
    why: 'At least one listings provider. DataForSEO is the cheapest per result.',
    items: [
      { label: 'DataForSEO (Google Maps)', env: ['DATAFORSEO_LOGIN', 'DATAFORSEO_PASSWORD'], optional: true },
      { label: 'Apify (Google Maps Scraper)', env: ['APIFY_TOKEN'], optional: true },
      { label: 'Outscraper', env: ['OUTSCRAPER_API_KEY'], optional: true },
    ],
  },
  {
    title: '3. Emails: find and verify',
    doc: 'docs/EMAIL_VERIFIER.md',
    why: 'Website email search and the basic check (syntax and mail servers) run free with no key. A mailbox verifier confirms each address and keeps bounces under 2%; strongly recommended before sending at volume. The built-in one is free apart from a small server with port 25 open.',
    items: [
      { label: 'Built-in mailbox verifier (your verifier server)', env: ['VERIFIER_URL', 'VERIFIER_SECRET'], optional: true, note: 'Free · recommended' },
      { label: 'Paid mailbox verifier (MillionVerifier or ZeroBounce)', env: ['MILLIONVERIFIER_API_KEY', 'ZEROBOUNCE_API_KEY'], anyOf: true, optional: true, note: 'Alternative' },
      { label: 'Email finder fallback (Hunter)', env: ['HUNTER_API_KEY'], optional: true, note: 'For websites that show no email' },
    ],
  },
  {
    title: '4. Sending (Amazon SES)',
    doc: 'docs/OUTREACH.md',
    why: 'Cold email goes out through SES on its own sending domain.',
    items: [
      { label: 'SES credentials and region', env: ['AWS_SES_REGION', 'AWS_SES_ACCESS_KEY_ID', 'AWS_SES_SECRET_ACCESS_KEY'] },
      { label: 'Sending domain', env: ['OUTREACH_FROM_DOMAIN'] },
      { label: 'Postal address (CAN-SPAM)', env: ['OUTREACH_POSTAL_ADDRESS'] },
      { label: 'Unsubscribe link signing secret', env: ['OUTREACH_UNSUBSCRIBE_SECRET'] },
      { label: 'Configuration set (bounce and complaint events)', env: ['SES_CONFIGURATION_SET'] },
      { label: 'Allowed SNS topics (events and replies)', env: ['SES_INBOUND_SNS_TOPIC_ARN'] },
      { label: 'Open/click tracking set', env: ['SES_TRACKING_CONFIGURATION_SET'], optional: true },
      { label: 'Cron secret (sends every 10 minutes)', env: ['CRON_SECRET'] },
    ],
  },
  {
    title: '5. AI replies and alerts',
    doc: 'docs/OUTREACH.md',
    why: 'The AI reads replies, drafts answers and books calls. Alerts reach the team.',
    items: [
      { label: 'OpenAI', env: ['OPENAI_API_KEY'] },
      { label: 'Hot-lead alert recipients', env: ['OUTREACH_ALERT_EMAILS', 'BOOKING_TEAM_EMAILS'], anyOf: true },
      { label: 'Resend (confirmations and alerts)', env: ['RESEND_API_KEY', 'RESEND_FROM'] },
    ],
  },
  {
    title: '6. Booking calls',
    doc: 'docs/TEAM_DASHBOARD.md',
    why: 'The calendar the website and the AI book into.',
    items: [
      { label: 'Google Calendar', env: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'] },
      { label: 'Zoom meetings', env: ['ZOOM_ACCOUNT_ID', 'ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET'], optional: true, note: 'Falls back to Google Meet' },
      { label: 'CRM webhook', env: ['CRM_WEBHOOK_URL'], optional: true },
    ],
  },
];

const isSet = (k: string) => Boolean(process.env[k]?.trim());

function state(i: Item): 'ok' | 'missing' | 'optional' {
  const ok = i.anyOf ? i.env.some(isSet) : i.env.every(isSet);
  if (ok) return 'ok';
  return i.optional ? 'optional' : 'missing';
}

export default function SetupPage() {
  const required = GROUPS.flatMap((g) => g.items).filter((i) => !i.optional);
  const done = required.filter((i) => state(i) === 'ok').length;
  const providers = GROUPS[1].items.filter((i) => state(i) === 'ok').length;
  const verifiers = GROUPS[2].items.slice(0, 2).filter((i) => state(i) === 'ok').length;

  return (
    <>
      <PageHeader
        title="Setup"
        description={`${done} of ${required.length} required connections are set${providers ? '' : ', and no lead provider yet'}. Add missing values in your hosting provider's environment variables, then redeploy.`}
      />
      <div className="grid gap-6 xl:grid-cols-2 items-start">
        {GROUPS.map((g, gi) => (
          <Card key={g.title} title={g.title}>
            <p className="-mt-1 mb-4 font-body text-sm text-white/65 leading-relaxed">{g.why}</p>
            <ul className="flex flex-col gap-3">
              {g.items.map((i, ii) => {
                let st = state(i);
                // Group 2 needs at least one provider.
                if (gi === 1 && st === 'optional' && providers === 0) st = 'missing';
                // Flag the free verifier when no mailbox verifier is set at all.
                if (gi === 2 && ii === 0 && st === 'optional' && verifiers === 0) st = 'missing';
                return (
                  <li key={i.label} className="flex items-start gap-3">
                    {st === 'ok' ? (
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden />
                    ) : st === 'missing' ? (
                      <CircleAlert size={18} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />
                    ) : (
                      <CircleDashed size={18} className="mt-0.5 shrink-0 text-white/40" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <p className="font-body text-sm text-white">
                        {i.label}
                        <span className="sr-only">: {st === 'ok' ? 'connected' : st === 'missing' ? 'missing' : 'not set (optional)'}</span>
                        {i.note ? <span className="ml-2 font-body text-xs text-white/50">{i.note}</span> : null}
                      </p>
                      <p className="font-mono text-[11px] text-white/50 break-all">
                        {i.env.join(i.anyOf ? ' or ' : ', ')}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 font-body text-xs text-white/45">Steps: {g.doc}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
