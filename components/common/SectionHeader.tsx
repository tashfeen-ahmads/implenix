import { Badge } from './Badge';
import { Reveal } from '@/components/motion/Reveal';

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  badgeVariant?: 'cyan' | 'purple';
  // Smaller headline for headers that sit in a narrow side column.
  compact?: boolean;
};

// Section header: optional eyebrow, headline, subhead. Use the eyebrow
// sparingly (roughly one per three sections) so it keeps its signal.
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  badgeVariant = 'cyan',
  compact = false,
}: Props) {
  const wrap = align === 'center' ? 'text-center mx-auto' : '';
  return (
    <Reveal>
    <header className={`max-w-3xl ${wrap}`}>
      {eyebrow ? (
        <div className="mb-6">
          <Badge label={eyebrow} variant={badgeVariant} />
        </div>
      ) : null}
      <h2
        className={`font-heading leading-[1.06] tracking-tight text-white ${
          compact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl lg:text-6xl'
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p className={`mt-6 font-body text-white/70 text-lg md:text-xl leading-relaxed max-w-[60ch] ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      ) : null}
    </header>
    </Reveal>
  );
}
