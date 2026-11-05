import type { CSSProperties, ReactNode } from 'react';
import { DailyAlarmPromptCard } from '../DailyAlarmPromptCard';
import { StreakCelebration } from '../StreakCelebration';
import { ActionButton } from '../ui/ActionButton';

export const LearningCompletionScreen = ({
  title,
  subtitle,
  children,
  actionLabel,
  onAction,
  actionPlacement = 'bottom',
  secondaryAction,
}: {
  title: string;
  subtitle: ReactNode;
  children?: ReactNode;
  actionLabel: string;
  onAction: () => void;
  actionPlacement?: 'bottom' | 'inline';
  // 주 버튼 왼쪽에 같은 높이로 나란히 두는 보조 버튼(예: 공유)
  secondaryAction?: ReactNode;
}) => {
  const button = (
    <ActionButton fullWidth onClick={onAction} className={`learning-completion-action max-w-sm${secondaryAction ? ' flex-[1.6]' : ''}`}>{actionLabel}</ActionButton>
  );

  return (
    <div className="learning-completion-screen app-soft-screen flex h-full flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col items-center justify-center-safe px-8 py-6 gap-5">
        <section className="learning-completion-card relative w-full max-w-sm flex flex-col items-center gap-5 px-5 py-8">
          <img className="learning-completion-character" src="/otter/v5/otter-cheer.svg" data-otter="cheer" alt="" aria-hidden="true" width={128} height={128} />
          <div className="text-center anim-fade-up" style={{ '--i': 1 } as CSSProperties}>
            <h2 className="type-result-title mb-1!">{title}</h2>
            <p className="type-supporting break-keep">{subtitle}</p>
          </div>
          {children}
          <div className="w-full">
            <DailyAlarmPromptCard />
            <StreakCelebration />
          </div>
        </section>
        {actionPlacement === 'inline' && button}
      </div>
      {actionPlacement === 'bottom' && (
        <div className={`px-5 pb-12 flex gap-3 ${secondaryAction ? 'flex-row' : 'flex-col'}`}>
          {secondaryAction}
          {button}
        </div>
      )}
    </div>
  );
};
