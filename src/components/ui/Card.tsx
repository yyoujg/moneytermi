import type { HTMLAttributes, ReactNode } from 'react';

type Pad = 'none' | 'sm' | 'md' | 'lg';
type Tone = 'plain' | 'card';

// plain은 박스 없이 세로 여백만 둬서 내용이 페이지 거터와 제목에 정렬된다.
const PAD: Record<Tone, Record<Pad, string>> = {
  plain: { none: '', sm: 'py-3', md: 'py-4', lg: 'py-5' },
  card: { none: '', sm: 'card-padding', md: 'card-padding', lg: 'card-padding' },
};
const TONE: Record<Tone, string> = {
  plain: '',
  card: 'card-surface',
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
