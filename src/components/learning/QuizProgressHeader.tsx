import type { ReactNode } from 'react';
import { Flame } from '../ui/OtterIcons';

export const QuizProgressHeader = ({
  label,
  progress,
  streakText,
  right,
  durationClass = 'duration-300',
}: {
  label: ReactNode;
  progress: number;
  streakText?: string | null;
  right?: ReactNode;
  durationClass?: string;
}) => (
  <div className="px-5 pt-3 pb-3 flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span className="min-w-0 text-sm font-semibold leading-relaxed text-[var(--color-ink-2)]">{label}</span>
      {streakText && (
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600">
          <Flame size={13} className="fill-current" />{streakText}
        </span>
      )}
      {right}
    </div>
    <div
      role="progressbar"
      aria-label={`${label} 진행률`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.max(0, Math.min(100, Math.round(progress)))}
      className="h-2 rounded-full bg-[var(--color-line)] overflow-hidden"
    >
      <div className={`h-full rounded-full bg-brand-500 transition-all ${durationClass}`} style={{ width: `${progress}%` }} />
    </div>
  </div>
);
