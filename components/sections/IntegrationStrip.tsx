import { LogoMarquee } from '@/components/common/LogoMarquee';

const INTEGRATIONS = [
  'GoHighLevel',
  'HubSpot',
  'Salesforce',
  'Zoho',
  'Google Calendar',
  'Google Meet',
  'Twilio',
  'ServiceTitan',
  'Housecall Pro',
  'Jobber',
  'Open Dental',
  'Follow Up Boss',
  'Clio',
  'Boulevard',
  'Zapier',
  'Make',
];

export function IntegrationStrip() {
  return (
    <section className="bg-black border-y border-brand-purple/20">
      <div className="max-w-content mx-auto px-6 py-20 md:px-10 md:py-24 flex flex-col gap-10 items-center">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-white/55 font-mono">
            ▸ Connects to the stack you already run on
          </p>
          <p className="mt-4 font-body text-white/75 text-base md:text-lg">
            CRMs, calendars, dispatch software, and industry PMS, deep
            two-way sync, not one-way email summaries.
          </p>
        </div>
        <div className="w-full">
          <LogoMarquee names={INTEGRATIONS} />
        </div>
      </div>
    </section>
  );
}
