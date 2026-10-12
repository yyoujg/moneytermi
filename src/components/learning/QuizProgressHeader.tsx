import type { ReactNode } from 'react';
import { Flame } from 'lucide-react';

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
  <div className="px-5 pt-2 pb-3 flex flex-col gap-2">
    <div className="flex items-center gap-1">
      <span className="text-sm font-bold text-[var(--color-ink-2)]">{label}</span>
      {streakText && (
        <span className="ml-2 flex items-center gap-0.5 text-xs font-bold text-brand-500">
          <Flame size={13} className="fill-current" />{streakText}
        </span>
      )}
      {right}
    </div>
    <div className="h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
      <div className={`h-full rounded-full bg-brand-500 transition-all ${durationClass}`} style={{ width: `${progress}%` }} />
    </div>
  </div>
);
