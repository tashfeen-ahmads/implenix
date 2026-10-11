import { Phone } from 'lucide-react';

type Line = {
  speaker?: 'agent' | 'caller' | 'system';
  text: string;
  ts?: string;
};

type Props = {
  title?: string;
  lines: Line[];
  caption?: string;
};

// Chat-thread style call preview. Renders agent/caller turns as
// alternating message bubbles (cyan for the AI agent on the left,
// purple for the caller on the right), with system lines centered
// as subtle status pills. Same props signature as the previous
// terminal-log implementation so every existing call site keeps
// working.
export function CodeWindow({ title, lines, caption }: Props) {
  return (
    <div className="bg-black border border-brand-cyan/25 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-brand-cyan/20 px-5 py-3 bg-brand-dark">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 border border-brand-cyan/40 bg-black flex items-center justify-center rounded-full shrink-0">
            <Phone size={13} className="text-brand-cyan" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-body text-white text-[13px] font-medium">
              Conversation with Ron
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan/80">
              {title ?? 'Real conversation'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-3">
        {lines.map((line, i) => {
          const ts = line.ts ?? `0:${String(i * 3).padStart(2, '0')}`;

          if (line.speaker === 'system' || !line.speaker) {
            return (
              <div key={i} className="flex items-center gap-2 my-1">
                <span className="flex-1 h-px bg-white/10" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/45 text-center">
                  {line.text}
                </span>
                <span className="flex-1 h-px bg-white/10" />
              </div>
            );
          }

          const isAgent = line.speaker === 'agent';
          return (
            <div
              key={i}
              className={`flex flex-col gap-1 max-w-[85%] ${
                isAgent ? 'items-start self-start' : 'items-end self-end'
              }`}
            >
              <div className="flex items-center gap-2 px-1">
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest ${
                    isAgent ? 'text-brand-cyan' : 'text-brand-purple'
                  }`}
                >
                  {isAgent ? 'Ron' : 'Caller'}
                </span>
                <span className="font-mono text-[10px] text-white/40">
                  {ts}
                </span>
              </div>
              <div
                className={`px-4 py-2.5 font-body text-sm leading-relaxed ${
                  isAgent
                    ? 'bg-brand-cyan/10 border border-brand-cyan/30 text-white rounded-r-lg rounded-tl-lg rounded-bl-sm'
                    : 'bg-brand-purple/12 border border-brand-purple/35 text-white rounded-l-lg rounded-tr-lg rounded-br-sm'
                }`}
              >
                {line.text}
              </div>
            </div>
          );
        })}
      </div>

      {caption ? (
        <div className="border-t border-brand-cyan/15 px-5 py-3 bg-brand-dark flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full shrink-0" />
          <span className="font-body text-[12px] text-white/75 leading-snug">
            {caption}
          </span>
        </div>
      ) : null}
    </div>
  );
}
