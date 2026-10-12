// Who gets team alerts (hot leads from outreach, website leads).
// OUTREACH_ALERT_EMAILS wins; otherwise the booking alert list is used.
export function teamAlertRecipients(): string[] {
  return (process.env.OUTREACH_ALERT_EMAILS || process.env.BOOKING_TEAM_EMAILS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
