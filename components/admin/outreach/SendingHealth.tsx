import { CircleAlert, OctagonPause, ShieldCheck } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LIMITS, accountRates, activeHold, pct } from '@/lib/outreach/health';
import { formatDateTime } from '@/components/admin/ui';
import { ResumeSendingButton } from './ResumeSendingButton';

// Sending health for the last 7 days, and the hold banner when the
// deliverability guard has stopped outreach. `quiet` hides it when all
// is well (for the overview).
export async function SendingHealth({ db, quiet = false }: { db: SupabaseClient; quiet?: boolean }) {
  const [hold, r] = await Promise.all([activeHold(db).catch(() => null), accountRates(db).catch(() => null)]);
  if (hold) {
    return (
      <section role="alert" className="mb-6 flex flex-col gap-3 rounded-md border border-red-400/40 bg-red-500/10 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <OctagonPause size={18} className="mt-0.5 shrink-0 text-red-300" aria-hidden />
          <div className="font-body text-sm">
            <p className="font-medium text-white">Outreach sending is on hold</p>
            <p className="mt-1 text-white/75">
              {hold.reason}. Stopped automatically on {formatDateTime(hold.created_at)} to protect the SES account; booking
              emails still go out.
            </p>
            <p className="mt-1 text-white/60">Pause or fix the campaign it came from (verify its list), then resume.</p>
          </div>
        </div>
        <div className="shrink-0">
          <ResumeSendingButton />
        </div>
      </section>
    );
  }
  if (!r || r.sent === 0) return null;
  const warn = r.bounceRate >= LIMITS.warn.bounce || r.complaintRate >= LIMITS.warn.complaint;
  if (quiet && !warn) return null;
  return (
    <section
      aria-label="Sending health"
      className={`mb-6 flex items-start gap-3 rounded-md border p-4 font-body text-sm ${warn ? 'border-amber-300/40 bg-amber-400/10' : 'border-white/10 bg-white/[0.02]'}`}
    >
      {warn ? (
        <CircleAlert size={18} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />
      ) : (
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden />
      )}
      <div>
        <p className="text-white">
          Last 7 days: <span className="tabular-nums">{r.sent}</span> sent · bounces{' '}
          <span className="tabular-nums">{pct(r.bounceRate)}</span> · spam complaints{' '}
          <span className="tabular-nums">{pct(r.complaintRate, 2)}</span>
        </p>
        <p className="mt-1 text-white/60">
          {warn
            ? `Above the safe level (bounces under ${pct(LIMITS.warn.bounce, 0)}, complaints under ${pct(LIMITS.warn.complaint, 2)}). Verify lists before the next send.`
            : `Sending stops on its own at ${pct(LIMITS.account.bounce, 0)} bounces or ${pct(LIMITS.account.complaint, 1)} complaints; a campaign pauses at ${pct(LIMITS.campaign.bounce, 0)} bounces.`}
        </p>
      </div>
    </section>
  );
}
