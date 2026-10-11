// Starting estimates for the Missed Call Audit tool, per industry. They are
// Implenix planning assumptions, not published benchmarks, and the UI says
// so: visitors are asked to enter their own call volume and client value
// for a figure based on their business.

export type IndustryKey =
  | 'hvac'
  | 'plumbing'
  | 'roofing'
  | 'auto-repair'
  | 'dental'
  | 'med-spa'
  | 'real-estate'
  | 'law-firms'
  | 'agency'
  | 'other';

type IndustryProfile = {
  label: string;
  weeklyCalls: number; // typical inbound call volume per week
  missRate: number; // 0-1, fraction of calls that go unanswered
  conversionRate: number; // 0-1, fraction of answered calls that convert
  defaultClientValue: number; // $ value of one converted client
};

export const INDUSTRY_PROFILES: Record<IndustryKey, IndustryProfile> = {
  hvac: {
    label: 'HVAC',
    weeklyCalls: 220,
    missRate: 0.62,
    conversionRate: 0.34,
    defaultClientValue: 480,
  },
  plumbing: {
    label: 'Plumbing',
    weeklyCalls: 195,
    missRate: 0.6,
    conversionRate: 0.36,
    defaultClientValue: 420,
  },
  roofing: {
    label: 'Roofing',
    weeklyCalls: 140,
    missRate: 0.55,
    conversionRate: 0.22,
    defaultClientValue: 6800,
  },
  'auto-repair': {
    label: 'Auto Repair',
    weeklyCalls: 175,
    missRate: 0.58,
    conversionRate: 0.4,
    defaultClientValue: 540,
  },
  dental: {
    label: 'Dental',
    weeklyCalls: 240,
    missRate: 0.45,
    conversionRate: 0.3,
    defaultClientValue: 1100,
  },
  'med-spa': {
    label: 'Med Spa',
    weeklyCalls: 165,
    missRate: 0.52,
    conversionRate: 0.28,
    defaultClientValue: 850,
  },
  'real-estate': {
    label: 'Real Estate',
    weeklyCalls: 120,
    missRate: 0.7,
    conversionRate: 0.18,
    defaultClientValue: 9500,
  },
  'law-firms': {
    label: 'Law Firm',
    weeklyCalls: 95,
    missRate: 0.55,
    conversionRate: 0.22,
    defaultClientValue: 4200,
  },
  agency: {
    label: 'Agency',
    weeklyCalls: 60,
    missRate: 0.5,
    conversionRate: 0.2,
    defaultClientValue: 5500,
  },
  other: {
    label: 'Other / not sure',
    weeklyCalls: 130,
    missRate: 0.55,
    conversionRate: 0.25,
    defaultClientValue: 800,
  },
};

export type AuditInput = {
  industry: IndustryKey;
  averageClientValue?: number;
  weeklyCallVolume?: number;
};

export type AuditResult = {
  industryLabel: string;
  weeklyCalls: number;
  weeklyMissed: number;
  monthlyMissed: number;
  weeklyLostRevenue: number;
  monthlyLostRevenue: number;
  annualLostRevenue: number;
  weeklyRecoverableRevenue: number;
  monthlyRecoverableRevenue: number;
  annualRecoverableRevenue: number;
  effectiveClientValue: number;
};

const RECOVERY_FACTOR = 0.6; // % of missed value Implenix typically recovers

export function runAudit(input: AuditInput): AuditResult {
  const profile = INDUSTRY_PROFILES[input.industry];
  const weeklyCalls = input.weeklyCallVolume ?? profile.weeklyCalls;
  const weeklyMissed = Math.round(weeklyCalls * profile.missRate);
  const monthlyMissed = weeklyMissed * 4;
  const value = input.averageClientValue ?? profile.defaultClientValue;
  const weeklyLost = Math.round(
    weeklyMissed * profile.conversionRate * value,
  );
  const monthlyLost = weeklyLost * 4;
  const annualLost = weeklyLost * 52;
  return {
    industryLabel: profile.label,
    weeklyCalls,
    weeklyMissed,
    monthlyMissed,
    weeklyLostRevenue: weeklyLost,
    monthlyLostRevenue: monthlyLost,
    annualLostRevenue: annualLost,
    weeklyRecoverableRevenue: Math.round(weeklyLost * RECOVERY_FACTOR),
    monthlyRecoverableRevenue: Math.round(monthlyLost * RECOVERY_FACTOR),
    annualRecoverableRevenue: Math.round(annualLost * RECOVERY_FACTOR),
    effectiveClientValue: value,
  };
}

export function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}
