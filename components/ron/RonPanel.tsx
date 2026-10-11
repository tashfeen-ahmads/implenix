'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { AudioLines, CalendarCheck, Mic, MicOff, PhoneOff, X } from 'lucide-react';
import { RON_AGENT_ID, HAS_RON } from '@/lib/ron';
import { trackConversion, GA4_EVENTS } from '@/lib/analytics';

type Props = {
  ctaLocation: string;
  onClose: () => void;
};

export function RonPanel(props: Props) {
  return (
    <ConversationProvider>
      <RonDialog {...props} />
    </ConversationProvider>
  );
}

function RonDialog({ ctaLocation, onClose }: Props) {
  const conversation = useConversation();
  const { status, isSpeaking, isMuted, setMuted } = conversation;
  const [micBlocked, setMicBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const live = status === 'connected';
  const connecting = status === 'connecting';

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status === 'error') setFailed(true);
  }, [status]);

  const close = () => {
    if (live || connecting) conversation.endSession();
    onClose();
  };

  // Esc closes; the latest `close` is read through a ref so the listener
  // never ends a stale session.
  const closeLatest = useRef(close);
  closeLatest.current = close;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLatest.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const start = async () => {
    setFailed(false);
    setMicBlocked(false);
    try {
      // Ask for the mic up front so a denial gets a clear message.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setMicBlocked(true);
      return;
    }
    conversation.startSession({ agentId: RON_AGENT_ID });
    trackConversion(GA4_EVENTS.ronConversationStarted, {
      cta_location: ctaLocation,
    });
  };

  const statusLine = live
    ? isSpeaking
      ? 'Ron is speaking'
      : 'Listening, go ahead'
    : connecting
      ? 'Connecting to Ron…'
      : 'Ready when you are';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ron-title"
        className="relative w-full max-w-md bg-brand-dark border border-brand-purple/50 shadow-[0_30px_120px_-30px_rgba(187,0,255,0.6)] overscroll-contain"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <X size={18} aria-hidden />
        </button>

        <div className="px-7 pt-10 pb-8 sm:px-10 flex flex-col items-center text-center">
          <RonOrb live={live} speaking={isSpeaking} connecting={connecting} />

          <h2 id="ron-title" className="mt-8 font-heading text-3xl text-white">
            Meet Ron
          </h2>
          <p
            className="mt-2 font-mono text-xs uppercase tracking-widest text-brand-cyan"
            aria-live="polite"
          >
            {HAS_RON ? statusLine : 'Coming online soon'}
          </p>

          {!HAS_RON ? (
            <p className="mt-6 font-body text-white/70 leading-relaxed">
              Ron, our AI receptionist, is getting ready for live demos.
              Book a call and we will run him for you, live.
            </p>
          ) : live ? (
            <p className="mt-6 font-body text-white/70 leading-relaxed">
              Talk the way your customers would: an emergency, a quote, a
              reschedule. Ron will qualify you and offer a time.
            </p>
          ) : (
            <p className="mt-6 font-body text-white/70 leading-relaxed">
              Ron is the AI receptionist behind Implenix. Talk to him right
              here in your browser. No phone, no signup.
            </p>
          )}

          {micBlocked ? (
            <p role="alert" className="mt-4 text-sm font-body text-brand-cyan">
              Microphone access is blocked. Allow it in your browser’s site
              settings, then try again.
            </p>
          ) : null}
          {failed && !micBlocked ? (
            <p role="alert" className="mt-4 text-sm font-body text-brand-cyan">
              Could not reach Ron. Check your connection and try again.
            </p>
          ) : null}

          <div className="mt-8 w-full flex flex-col gap-3">
            {!HAS_RON ? (
              <BookLink onNavigate={onClose} primary />
            ) : live ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMuted(!isMuted)}
                  aria-pressed={isMuted}
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan/70 text-brand-cyan font-medium px-5 py-3.5 rounded-sm transition hover:bg-brand-cyan/10"
                >
                  {isMuted ? <MicOff size={16} aria-hidden /> : <Mic size={16} aria-hidden />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  type="button"
                  onClick={() => conversation.endSession()}
                  className="inline-flex items-center justify-center gap-2 bg-white text-brand-dark font-medium px-5 py-3.5 rounded-sm transition hover:bg-white/90"
                >
                  <PhoneOff size={16} aria-hidden /> End
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={start}
                disabled={connecting}
                className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium text-base px-7 py-4 rounded-sm shadow-[0_10px_40px_-10px_rgba(187,0,255,0.6)] transition hover:opacity-90 active:translate-y-px disabled:opacity-60"
              >
                <AudioLines size={18} aria-hidden />
                {connecting ? 'Connecting…' : 'Start talking'}
              </button>
            )}
            {HAS_RON ? <BookLink onNavigate={close} /> : null}
          </div>

          {HAS_RON ? (
            <p className="mt-6 text-xs font-body text-white/45 leading-relaxed">
              Uses your microphone. Conversations are recorded to improve
              Ron. See our{' '}
              <Link href="/privacy-policy" className="underline hover:text-white/70">
                privacy policy
              </Link>
              .
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BookLink({
  onNavigate,
  primary = false,
}: {
  onNavigate: () => void;
  primary?: boolean;
}) {
  return (
    <Link
      href="/contact"
      onClick={onNavigate}
      className={
        primary
          ? 'inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-7 py-4 rounded-sm transition hover:opacity-90'
          : 'inline-flex items-center justify-center gap-2 text-white/70 text-sm font-medium py-2 transition hover:text-white'
      }
    >
      <CalendarCheck size={16} aria-hidden /> Book a call instead
    </Link>
  );
}

// Brand orb: rings pulse while Ron speaks, breathe while listening.
function RonOrb({
  live,
  speaking,
  connecting,
}: {
  live: boolean;
  speaking: boolean;
  connecting: boolean;
}) {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center" aria-hidden>
      <span
        className={`absolute inset-0 rounded-full bg-brand-purple/25 blur-xl transition-transform duration-500 ${
          speaking ? 'scale-125' : live ? 'scale-100' : 'scale-90'
        }`}
      />
      <span
        className={`absolute inset-2 rounded-full border border-brand-cyan/40 ${
          speaking ? 'motion-safe:animate-ping' : connecting ? 'motion-safe:animate-pulse' : ''
        }`}
      />
      <span className="relative w-24 h-24 rounded-full bg-gradient-to-br from-brand-purple to-brand-dark border border-brand-purple flex items-center justify-center">
        <span className="font-heading text-4xl text-white">R</span>
      </span>
    </div>
  );
}
