import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { DailyAlarmPromptCard } from '../DailyAlarmPromptCard';
import { Mascot } from '../Mascot';
import { StreakCelebration } from '../StreakCelebration';

type MascotName = ComponentProps<typeof Mascot>['name'];

export const LearningCompletionScreen = ({
  mascot,
  mascotSize = 130,
  title,
  subtitle,
  children,
  actionLabel,
  onAction,
  actionPlacement = 'bottom',
  titleSize = '2xl',
}: {
  mascot: MascotName;
  mascotSize?: number;
  title: string;
  subtitle: ReactNode;
  children?: ReactNode;
  actionLabel: string;
  onAction: () => void;
  actionPlacement?: 'bottom' | 'inline';
  titleSize?: 'xl' | '2xl';
}) => {
  const button = (
    <button
      onClick={onAction}
      className="w-full max-w-sm py-4 rounded-button text-sm font-bold text-white bg-brand-500 active:opacity-90"
    >
      {actionLabel}
    </button>
  );

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col items-center justify-center-safe px-8 py-6 gap-5">
        <div className="anim-reward-pop">
          <Mascot name={mascot} size={mascotSize} />
        </div>
        <div className="text-center anim-fade-up" style={{ '--i': 1 } as CSSProperties}>
          <h2 className={`${titleSize === '2xl' ? 'text-2xl' : 'text-xl'} font-bold text-[var(--color-ink)] mb-1!`}>{title}</h2>
          <p className="text-sm text-[var(--color-ink-4)]">{subtitle}</p>
        </div>
        {children}
        <div className={`w-full ${actionPlacement === 'inline' ? 'max-w-sm mb-3' : ''}`}>
          <DailyAlarmPromptCard />
          <StreakCelebration />
        </div>
        {actionPlacement === 'inline' && button}
      </div>
      {actionPlacement === 'bottom' && (
        <div className="px-5 pb-12 flex flex-col gap-3">
          {button}
        </div>
      )}
    </div>
  );
};
