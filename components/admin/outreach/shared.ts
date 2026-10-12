// Shared constants and helpers for the outreach screens. Plain module (no
// 'use client') so both server pages and client components can import it.

import type { Campaign, Contact, ContactStatus, Message } from '@/lib/db/types';

export type Tone = 'neutral' | 'purple' | 'cyan' | 'green' | 'amber' | 'red';

export const CONTACT_STATUSES: ContactStatus[] = [
  'active',
  'replied',
  'interested',
  'booked',
  'not_interested',
  'unsubscribed',
  'bounced',
  'complained',
];

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  active: 'Active',
  replied: 'Replied',
  interested: 'Interested',
  booked: 'Booked',
  not_interested: 'Not interested',
  unsubscribed: 'Unsubscribed',
  bounced: 'Bounced',
  complained: 'Complained',
};

export const CONTACT_STATUS_TONES: Record<ContactStatus, Tone> = {
  active: 'neutral',
  replied: 'cyan',
  interested: 'purple',
  booked: 'green',
  not_interested: 'neutral',
  unsubscribed: 'amber',
  bounced: 'red',
  complained: 'red',
};

export const CAMPAIGN_STATUS_TONES: Record<Campaign['status'], Tone> = {
  draft: 'neutral',
  active: 'green',
  paused: 'amber',
  completed: 'cyan',
};

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (New York)' },
  { value: 'America/Chicago', label: 'Central (Chicago)' },
  { value: 'America/Denver', label: 'Mountain (Denver)' },
  { value: 'America/Phoenix', label: 'Arizona (Phoenix, no DST)' },
  { value: 'America/Los_Angeles', label: 'Pacific (Los Angeles)' },
  { value: 'America/Anchorage', label: 'Alaska (Anchorage)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (Honolulu)' },
] as const;

// ISO weekday numbers as stored in campaigns.send_days (1 = Monday ... 7 = Sunday).
export const WEEKDAYS = [
  { value: 1, short: 'Mon', label: 'Monday' },
  { value: 2, short: 'Tue', label: 'Tuesday' },
  { value: 3, short: 'Wed', label: 'Wednesday' },
  { value: 4, short: 'Thu', label: 'Thursday' },
  { value: 5, short: 'Fri', label: 'Friday' },
  { value: 6, short: 'Sat', label: 'Saturday' },
  { value: 7, short: 'Sun', label: 'Sunday' },
] as const;

export function hourLabel(h: number) {
  if (h === 0 || h === 24) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

// Variables offered as insert chips in the sequence builder.
export const TEMPLATE_VARIABLES = [
  { token: '{{first_name|there}}', label: 'first_name' },
  { token: '{{company}}', label: 'company' },
  { token: '{{website}}', label: 'website' },
  { token: '{{city}}', label: 'city' },
  { token: '{{industry}}', label: 'industry' },
] as const;

export type PreviewContact = Pick<
  Contact,
  'first_name' | 'last_name' | 'company' | 'website' | 'city' | 'industry' | 'email' | 'custom'
>;

export const SAMPLE_CONTACT: PreviewContact = {
  first_name: 'Jordan',
  last_name: 'Lee',
  company: 'Lee Family Dental',
  website: 'leefamilydental.com',
  city: 'Austin',
  industry: 'Dental',
  email: 'jordan@leefamilydental.com',
  custom: {},
};

// Client-side preview of the template syntax: {{var}} and {{var|fallback}},
// plus {{custom.key}}. The engine does the real rendering at send time.
export function renderPreview(template: string, contact: PreviewContact | null): string {
  return template.replace(/\{\{\s*([a-z_.0-9-]+)\s*(?:\|([^}]*))?\}\}/gi, (_m, rawKey: string, fallback?: string) => {
    const key = rawKey.toLowerCase();
    let value: string | null | undefined;
    if (contact) {
      if (key.startsWith('custom.')) {
        value = contact.custom?.[rawKey.slice(7)];
      } else {
        value = (contact as Record<string, unknown>)[key] as string | null | undefined;
      }
    }
    const v = typeof value === 'string' ? value.trim() : '';
    return v || (fallback ?? '').trim();
  });
}

export function contactName(c: Pick<Contact, 'first_name' | 'last_name' | 'email'>) {
  const n = [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
  return n || c.email;
}

// Messages that count as "sent" for stats.
export const SENT_STATUSES: Message['status'][] = ['sent', 'delivered', 'bounced', 'complained'];

export function percent(part: number, whole: number) {
  if (!whole) return '0%';
  const p = (part / whole) * 100;
  return `${p < 10 && p > 0 ? p.toFixed(1) : Math.round(p)}%`;
}

// POST JSON to an engine endpoint; throws with the server's error text.
export async function postJson<T = Record<string, unknown>>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response.
  }
  if (!res.ok) {
    const msg =
      data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data ?? {}) as T;
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong';
}
