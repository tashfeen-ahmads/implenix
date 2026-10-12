// Lead score for outreach prospects, 0-100: fit (up to 40) plus
// engagement (up to 60). Deliberately simple and explainable: every point
// has a reason shown in the card tooltip. Fit data comes from the lead
// finder (Google Maps rating and review count, stored in contacts.custom).

export type ScoreInput = {
  stage: string;
  status: string;
  reply_label: string | null;
  website: string | null;
  first_name: string | null;
  phone?: string | null;
  custom?: Record<string, string> | null;
  opens?: number;
  clicks?: number;
};

export type LeadScore = { score: number; band: 'hot' | 'warm' | 'cold'; reasons: string[] };

const POSITIVE = new Set(['interested', 'wants_times', 'pricing', 'booked']);
const DEAD = new Set(['not_interested', 'unsubscribed', 'bounced']);

export function leadScore(c: ScoreInput): LeadScore {
  if (DEAD.has(c.stage) || ['unsubscribed', 'bounced', 'complained', 'not_interested'].includes(c.status)) {
    return { score: 0, band: 'cold', reasons: ['Opted out, bounced or not interested'] };
  }
  const reasons: string[] = [];
  let fit = 0;
  const add = (n: number, why: string) => {
    fit += n;
    reasons.push(`+${n} ${why}`);
  };
  const reviews = Number(c.custom?.reviews ?? c.custom?.reviews_count ?? NaN);
  const rating = Number(c.custom?.rating ?? NaN);
  if (c.website) add(10, 'has a website');
  if (c.phone) add(5, 'has a phone number');
  if (reviews >= 100) add(15, `${reviews} Google reviews (busy business)`);
  else if (reviews >= 30) add(10, `${reviews} Google reviews`);
  else if (reviews >= 5) add(5, `${reviews} Google reviews`);
  if (rating >= 4) add(5, `rated ${rating}`);
  if (c.first_name) add(5, 'named contact');
  fit = Math.min(40, fit);

  let eng = 0;
  const addE = (n: number, why: string) => {
    eng += n;
    reasons.push(`+${n} ${why}`);
  };
  if (c.reply_label && POSITIVE.has(c.reply_label)) addE(40, 'positive reply');
  else if (c.stage === 'interested') addE(40, 'marked interested');
  else if (c.reply_label === 'question') addE(25, 'asked a question');
  else if (c.reply_label === 'not_now') addE(10, 'said not now');
  else if (c.stage === 'replied') addE(15, 'replied');
  if ((c.clicks ?? 0) > 0) addE(10, 'clicked a link');
  if ((c.opens ?? 0) > 0) addE(5, 'opened an email');
  eng = Math.min(60, eng);

  const score = Math.max(0, Math.min(100, fit + eng));
  return { score, band: score >= 60 ? 'hot' : score >= 30 ? 'warm' : 'cold', reasons };
}
