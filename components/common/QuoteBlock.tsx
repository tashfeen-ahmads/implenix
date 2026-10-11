import { Quote } from 'lucide-react';

type Props = {
  quote: string;
  author: string;
  role?: string;
  variant?: 'dark' | 'light';
};

// Koyeb-style large pull quote with an iconic mark and author block.
export function QuoteBlock({
  quote,
  author,
  role,
  variant = 'dark',
}: Props) {
  const isLight = variant === 'light';
  return (
    <figure
      className={`p-8 md:p-12 lg:p-14 border ${
        isLight
          ? 'bg-white border-brand-purple/20 text-black'
          : 'bg-black border-brand-purple/20 text-white'
      }`}
    >
      <Quote
        size={24}
        className={isLight ? 'text-brand-purple' : 'text-brand-cyan'}
      />
      <blockquote
        className={`mt-8 font-heading text-2xl md:text-3xl leading-snug ${
          isLight ? 'text-black' : 'text-white'
        }`}
      >
        “{quote}”
      </blockquote>
      <figcaption
        className={`mt-10 flex items-center gap-4 text-sm font-body ${
          isLight ? 'text-black/70' : 'text-white/70'
        }`}
      >
        <span
          className={`w-9 h-9 flex items-center justify-center font-heading text-sm ${
            isLight ? 'bg-brand-purple text-white' : 'bg-brand-purple text-white'
          }`}
        >
          {author
            .split(' ')
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </span>
        <span>
          <span
            className={`block font-medium ${isLight ? 'text-black' : 'text-white'}`}
          >
            {author}
          </span>
          {role ? <span className="block">{role}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}
