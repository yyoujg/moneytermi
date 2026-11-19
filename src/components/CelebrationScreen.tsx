import { useEffect, useRef, type ReactNode } from 'react';
import { CELEBRATION_COLORS } from '../lib/visualPalette';
import { AchievementShareButton } from './AchievementShareButton';
import type { AchievementCard } from '../lib/achievementImage';
import './CelebrationScreen.css';

// 축하 화면 공통 틀(퀘스트 완료 기준): 제목 · 부제 · 그림 · 기록 한 줄 · 설명 · 확인 · 공유.
// 연속 출석·퀘스트·리그 승급·배지 획득이 같은 배치를 쓴다. 화면 빈 곳을 눌러도 닫힌다
export const CelebrationScreen = ({ label, title, subtitle, art, record, description, shareCard, onClose, confetti = false }: {
  label: string;
  title: ReactNode;
  subtitle: ReactNode;
  art: ReactNode;
  record: ReactNode;
  description: ReactNode;
  shareCard: AchievementCard;
  onClose: () => void;
  confetti?: boolean;
}) => {
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);
  return (
    <div className="original-modal celebration-screen" onClick={onClose} onKeyDown={event => {
      if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
      if (event.key === 'Tab') {
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        event.preventDefault();
        buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
      }
    }}>
      {confetti && Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden className="anim-confetti"
          style={{ '--x': `${(i * 7 + 3) % 100}%`, '--d': `${(i % 7) * 0.35}s`, '--r': i % 2 ? 1 : -1, background: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length] } as React.CSSProperties} />
      ))}
      <div role="dialog" aria-modal="true" aria-label={label} aria-describedby="celebration-description" onClick={e => e.stopPropagation()} className="celebration-content anim-pop-in">
        <h2>{title}</h2>
        <p className="celebration-subtitle">{subtitle}</p>
        <div className="celebration-art">{art}</div>
        {record}
        <p id="celebration-description" className="celebration-description">{description}</p>
        <button ref={confirmRef} type="button" onClick={onClose} className="action-button celebration-confirm w-full">확인</button>
        <AchievementShareButton card={shareCard} />
      </div>
    </div>
  );
};
