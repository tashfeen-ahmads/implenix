import Link from 'next/link';
import { LogoMark } from './LogoMark';

type Props = {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'wordmark' | 'mark-only';
  markPosition?: 'left' | 'right';
  tone?: 'light' | 'purple';
  className?: string;
};

const SIZE_MAP: Record<NonNullable<Props['size']>, { mark: number; text: string }> = {
  sm: { mark: 22, text: 'text-lg' },
  md: { mark: 26, text: 'text-xl' },
  lg: { mark: 40, text: 'text-3xl md:text-4xl' },
};

// The Implenix lockup: wordmark + mark. Default layout matches the
// supplied brand asset, white "implenix" with a cyan "i", and the cyan
// stair-step mark to the right.
export function LogoLockup({
  href = '/',
  size = 'md',
  variant = 'wordmark',
  markPosition = 'right',
  tone = 'light',
  className = '',
}: Props) {
  const { mark, text } = SIZE_MAP[size];
  const wordColor = tone === 'purple' ? 'text-brand-violet' : 'text-white';

  const wordmark =
    variant === 'wordmark' ? (
      <span
        className={`font-heading ${text} ${wordColor} tracking-tight leading-none`}
      >
        <span aria-hidden="true">
          <span className="text-brand-cyan">i</span>mplenix
        </span>
        <span className="sr-only">Implenix</span>
      </span>
    ) : null;

  const markEl = <LogoMark size={mark} title="Implenix" />;

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {markPosition === 'left' ? markEl : null}
      {wordmark}
      {markPosition === 'right' ? markEl : null}
    </span>
  );

  if (!href) return content;
  return (
    <Link
      href={href}
      data-cta-location="logo"
      data-cta-type="logo"
      className="inline-flex items-center"
    >
      {content}
    </Link>
  );
}
