'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const TABS = ['Guides', 'Playbooks', 'Knowledge Hub'] as const;

const GLOSSARY: Array<{ term: string; definition: string }> = [
  { term: 'AI Receptionist', definition: 'A voice agent that answers, qualifies, and books inbound calls.' },
  { term: 'Call Script', definition: 'The structured dialog the agent follows during a call.' },
  { term: 'Capture Rate', definition: 'Percentage of inbound calls answered before hitting voicemail.' },
  { term: 'CRM Sync', definition: 'Automatic write-back of call data into the customer record.' },
  { term: 'First-call Window', definition: 'The seconds-to-minutes window in which calling a lead back materially changes conversion.' },
  { term: 'Live Transfer', definition: 'A real-time hand-off from the AI agent to a human operator.' },
  { term: 'No-show Rate', definition: 'Percentage of booked appointments that do not happen.' },
  { term: 'Outbound Sequence', definition: 'A defined cadence of automated calls to a prospect or customer.' },
  { term: 'SIP Trunk', definition: 'The session-initiation pipe between your phone numbers and the agent.' },
  { term: 'Speed-to-Lead', definition: 'Time elapsed between a lead arriving and your first contact attempt.' },
  { term: 'Transfer Rule', definition: 'A condition under which the AI hands a call to a human.' },
  { term: 'Voice Agent', definition: 'AI software that handles a phone conversation in real time.' },
];

export type ResourceItem = {
  url: string;
  kind: 'guide' | 'playbook';
  title: string;
  description: string;
};

export function ResourcesClient({
  guides,
  playbooks,
}: {
  guides: ResourceItem[];
  playbooks: ResourceItem[];
}) {
  const [active, setActive] = useState<(typeof TABS)[number]>('Guides');

  return (
    <>
      <div className="max-w-content mx-auto px-6 pt-10">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-4 py-2 text-sm font-body transition-colors rounded-sm ${
                active === t
                  ? 'bg-brand-purple text-white'
                  : 'border border-brand-purple/30 text-white/80 hover:border-brand-purple'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-content mx-auto px-6 py-12">
        {active === 'Guides' && (
          <ResourceGrid items={guides} emptyLabel="guides" />
        )}
        {active === 'Playbooks' && (
          <ResourceGrid items={playbooks} emptyLabel="playbooks" />
        )}
        {active === 'Knowledge Hub' && <Glossary />}
      </div>
    </>
  );
}

function ResourceGrid({
  items,
  emptyLabel,
}: {
  items: ResourceItem[];
  emptyLabel: string;
}) {
  return (
    <>
      {/* CONTENT TO BE ADDED VIA MDX FILES, ASSIGN TO CONTENT TEAM */}
      <h2 className="sr-only">Guides and playbooks</h2>
      {items.length === 0 ? (
        <div className="border border-brand-purple/20 p-10 text-center text-white/70 font-body">
          New {emptyLabel} are being added by the content team.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((r) => (
            <Link
              key={r.url}
              href={r.url}
              data-cta-location="resource-card"
              className="group block bg-black border border-brand-purple/20 hover:border-brand-purple p-6 transition-colors"
            >
              <span className="text-xs uppercase tracking-widest text-brand-cyan font-mono">
                [ {r.kind} ]
              </span>
              <h3 className="mt-3 font-heading text-xl text-white">
                {r.title}
              </h3>
              <p className="mt-2 font-body text-sm text-white/70">
                {r.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-brand-cyan text-sm">
                Read{' '}
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function Glossary() {
  const grouped = GLOSSARY.reduce<Record<string, typeof GLOSSARY>>((acc, entry) => {
    const letter = entry.term.charAt(0).toUpperCase();
    acc[letter] = acc[letter] || [];
    acc[letter].push(entry);
    return acc;
  }, {});
  const letters = Object.keys(grouped).sort();
  return (
    <div className="space-y-10">
      {/* CONTENT TO BE ADDED VIA MDX FILES, ASSIGN TO CONTENT TEAM */}
      {letters.map((letter) => (
        <div key={letter}>
          <h3 className="font-heading text-2xl text-brand-violet mb-3">
            {letter}
          </h3>
          <dl className="divide-y divide-brand-purple/15 border border-brand-purple/15">
            {grouped[letter].map((entry) => (
              <div key={entry.term} className="grid sm:grid-cols-[200px_1fr] gap-4 px-5 py-4">
                <dt className="font-heading text-white">{entry.term}</dt>
                <dd className="font-body text-sm text-white/75">{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
