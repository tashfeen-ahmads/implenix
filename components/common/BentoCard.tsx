import type { LucideIcon } from 'lucide-react';

type Props = {
  Icon: LucideIcon;
  title: string;
  description: string;
  span?: 'md' | 'lg' | 'tall';
  accent?: 'cyan' | 'purple';
  children?: React.ReactNode;
};

// Koyeb-style bento card with icon, title, description, and optional visual.
// Span controls the grid footprint inside a 4-col grid.
export function BentoCard({
  Icon,
  title,
  description,
  span = 'md',
  accent = 'cyan',
  children,
}: Props) {
  const spanClass =
    span === 'lg'
      ? 'lg:col-span-2'
      : span === 'tall'
        ? 'lg:row-span-2'
        : '';
  const iconColor = accent === 'cyan' ? 'text-brand-cyan' : 'text-brand-violet';
  return (
    <article
      className={`group relative bg-black border border-brand-purple/20 hover:border-brand-purple/60 transition-colors duration-200 p-6 lg:p-8 flex flex-col gap-4 ${spanClass}`}
    >
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 border border-brand-cyan/30 flex items-center justify-center bg-brand-dark">
          <Icon size={18} className={iconColor} />
        </span>
        <h3 className="font-heading text-lg md:text-xl text-white">{title}</h3>
      </div>
      <p className="font-body text-sm text-white/70 leading-relaxed max-w-prose">
        {description}
      </p>
      {children ? <div className="mt-2">{children}</div> : null}
    </article>
  );
}
