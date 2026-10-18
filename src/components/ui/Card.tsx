import type { HTMLAttributes, ReactNode } from 'react';

type Pad = 'none' | 'sm' | 'md' | 'lg';

const PAD: Record<Pad, string> = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' };
const TONE = {
  card: 'bg-[var(--color-card)] border border-[var(--color-line)]',
  surface: 'bg-[var(--color-surface)]',
} as const;

export const Card = ({
  pad = 'md',
  tone = 'card',
  className = '',
  children,
  ...rest
}: { pad?: Pad; tone?: keyof typeof TONE } & HTMLAttributes<HTMLDivElement>) => (
  <div data-card-tone={tone} className={`app-card ${TONE[tone]} rounded-card ${PAD[pad]} ${className}`.replace(/\s+/g, ' ').trim()} {...rest}>
    {children as ReactNode}
  </div>
);
