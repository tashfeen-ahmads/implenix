// Centralized lead-capture config. The Calendly URL uses
// NEXT_PUBLIC_CALENDLY_URL when set and falls back to the production
// default. The live demo agent is Ron, see lib/ron.ts.

export const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ||
  'https://calendly.com/implenix/consultation-call';
