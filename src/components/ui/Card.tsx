import type { HTMLAttributes, ReactNode } from 'react';

type Pad = 'none' | 'sm' | 'md' | 'lg';
type Tone = 'plain' | 'card';

// plain은 박스 없이 세로 여백만 둬서 내용이 페이지 거터와 제목에 정렬된다.
const PAD: Record<Tone, Record<Pad, string>> = {
  plain: { none: '', sm: 'py-3', md: 'py-4', lg: 'py-5' },
  card: { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' },
};
const TONE: Record<Tone, string> = {
  plain: '',
  card: 'bg-[var(--color-card)] border border-[var(--color-line)] rounded-card',
};

export const Card = ({
  pad = 'md',
  tone = 'plain',
  className = '',
  children,
  ...rest
}: { pad?: Pad; tone?: Tone } & HTMLAttributes<HTMLDivElement>) => (
  <div data-card-tone={tone} className={`app-card ${TONE[tone]} ${PAD[tone][pad]} ${className}`.replace(/\s+/g, ' ').trim()} {...rest}>
    {children as ReactNode}
  </div>
);
