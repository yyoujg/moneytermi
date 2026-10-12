import type { ReactNode } from 'react';

export const LearningStatRow = ({
  label,
  children,
  withDivider = true,
}: {
  label: string;
  children: ReactNode;
  withDivider?: boolean;
}) => (
  <>
    {withDivider && <div className="h-px bg-[var(--color-line)]" />}
    <div className="flex justify-between items-center">
      <span className="text-sm text-[var(--color-ink-4)]">{label}</span>
      {children}
    </div>
  </>
);
