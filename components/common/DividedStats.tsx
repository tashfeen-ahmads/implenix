type Stat = {
  number: string;
  label: string;
};

type Props = {
  stats: Stat[];
};

// Horizontal stat row, large numerals with thin vertical dividers
// between cells. Stacks on mobile.
export function DividedStats({ stats }: Props) {
  return (
    <div className="grid sm:grid-cols-3 border-y border-brand-purple/20">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`min-w-0 p-6 sm:p-6 lg:p-10 ${i > 0 ? 'sm:border-l border-brand-purple/20' : ''} ${i > 0 ? 'border-t sm:border-t-0' : ''}`}
        >
          <p
            className={`font-heading text-brand-cyan leading-none [overflow-wrap:anywhere] ${
              // The display face is very wide: word-length "numbers"
              // (e.g. "eClinicalWorks") get a smaller size so they fit.
              s.number.length > 7
                ? 'text-3xl md:text-4xl'
                : 'text-5xl md:text-6xl'
            }`}
          >
            {s.number}
          </p>
          <p className="mt-3 font-body text-white/75 text-sm md:text-base">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
