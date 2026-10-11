// Ron is the Implenix AI agent visitors can talk to in the browser.
// The conversation runs on an ElevenLabs Conversational AI agent; set
// NEXT_PUBLIC_RON_AGENT_ID to that agent's ID (the agent must allow
// public access). Without it, the Ron panel still opens and offers
// booking a call instead.

export const RON_AGENT_ID = process.env.NEXT_PUBLIC_RON_AGENT_ID || '';

export const HAS_RON = RON_AGENT_ID.length > 0;

export const RON_OPEN_EVENT = 'implenix:open-ron';

export type RonOpenDetail = { ctaLocation: string };

export function openRon(ctaLocation: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<RonOpenDetail>(RON_OPEN_EVENT, {
      detail: { ctaLocation },
    }),
  );
}
