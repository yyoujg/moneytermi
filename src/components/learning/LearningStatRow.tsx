import type { ReactNode } from 'react';

export const LearningStatRow = ({
  label,
  icon,
  children,
  withDivider = true,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  withDivider?: boolean;
}) => (
  <>
    {withDivider && <div className="h-px bg-[var(--color-line)]" />}
    <div className="flex justify-between items-center gap-3">
      <span className="flex min-w-0 items-center gap-2 text-sm text-[var(--color-ink-4)]">{icon}<span className="break-keep">{label}</span></span>
      {children}
    </div>
  </>
);
