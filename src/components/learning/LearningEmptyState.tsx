import type { ComponentProps } from 'react';
import { Mascot } from '../Mascot';

type MascotName = ComponentProps<typeof Mascot>['name'];

export const LearningEmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  mascot,
  mascotSize = 110,
  actionPlacement = 'bottom',
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  mascot?: MascotName;
  mascotSize?: number;
  actionPlacement?: 'bottom' | 'inline';
}) => {
  const button = (
    <button
      onClick={onAction}
      className="w-full max-w-sm py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90"
    >
      {actionLabel}
    </button>
  );

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-3 text-center">
        {mascot && <div className="mb-2"><Mascot name={mascot} size={mascotSize} /></div>}
        <h2 className="text-xl font-bold text-[var(--color-ink)]">{title}</h2>
        <p className={`text-sm text-[var(--color-ink-4)] break-keep ${actionPlacement === 'inline' ? 'mb-16!' : ''}`}>
          {description}
        </p>
        {actionPlacement === 'inline' && button}
      </div>
      {actionPlacement === 'bottom' && (
        <div className="px-5 pb-12">
          {button}
        </div>
      )}
    </div>
  );
};
