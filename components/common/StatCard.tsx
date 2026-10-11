type Props = {
  number: string;
  label: string;
  accent?: 'purple' | 'cyan';
};

export function StatCard({ number, label, accent = 'cyan' }: Props) {
  const accentText = accent === 'purple' ? 'text-brand-violet' : 'text-brand-cyan';
  const accentBorder =
    accent === 'purple' ? 'border-l-brand-purple' : 'border-l-brand-cyan';
  return (
    <div
      className={`bg-black border-l-[3px] ${accentBorder} p-8 flex flex-col gap-3`}
    >
      <span className={`font-heading text-5xl md:text-6xl leading-none ${accentText}`}>
        {number}
      </span>
      <span className="text-white/90 font-body text-sm md:text-base">
        {label}
      </span>
    </div>
  );
}
