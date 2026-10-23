import type { HTMLAttributes } from 'react';

export const PraiseNote = ({
  title,
  body,
  className = '',
  ...rest
}: { title: string; body: string } & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`py-3 ${className}`.replace(/\s+/g, ' ').trim()}
    {...rest}
  >
    <div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--color-ink)] break-keep">{title}</p>
        <p className="mt-1! text-xs leading-relaxed text-[var(--color-ink-2)] break-keep">{body}</p>
      </div>
    </div>
  </div>
);
