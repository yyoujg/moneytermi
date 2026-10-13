import type { HTMLAttributes } from 'react';
import { Sparkles } from 'lucide-react';

export const PraiseNote = ({
  title,
  body,
  className = '',
  ...rest
}: { title: string; body: string } & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-card border border-brand-500/15 bg-brand-500/10 px-4 py-3 ${className}`.replace(/\s+/g, ' ').trim()}
    {...rest}
  >
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-card)] text-brand-500">
        <Sparkles size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-black text-brand-600 break-keep">{title}</p>
        <p className="mt-1! text-xs leading-relaxed text-[var(--color-ink-2)] break-keep">{body}</p>
      </div>
    </div>
  </div>
);
