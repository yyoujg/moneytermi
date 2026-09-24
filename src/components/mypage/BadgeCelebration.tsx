import { useEffect, useState } from 'react';
import type { Badge } from '../../lib/badges';
import { Storage } from '../../lib/storage';
import { logClick } from '../../lib/analytics';
import { feedbackBadge } from '../../lib/feedback';

// 새로 획득한 배지 축하. 배지는 서버 기록 없이 통계에서 파생되므로, "이미 보여준 배지" 목록을 기기에 남겨 차이만 축하한다.
// 여러 개를 한 번에 얻었으면 한 화면에 같이 보여준다. 유실돼도 축하가 한 번 더 뜰 뿐이다.
const KEY = 'badges_seen';
const CONFETTI = ['#f97316', '#fde68a', '#fecaca', '#bfdbfe', '#bbf7d0', '#c7d2fe', '#fbcfe8', '#f97316', '#fde68a', '#bfdbfe', '#bbf7d0', '#fecaca'];

export const BadgeCelebration = ({ badges }: { badges: Badge[] }) => {
  const [fresh, setFresh] = useState<Badge[] | null>(null);
  const earnedIds = badges.filter(b => b.earned).map(b => b.id).join(',');

  useEffect(() => {
    if (!earnedIds) return;
    Storage.getItem(KEY).catch(() => null).then(raw => {
      const seen = new Set<string>(raw ? JSON.parse(raw) : []);
      const earned = badges.filter(b => b.earned);
      const news = earned.filter(b => !seen.has(b.id));
      Storage.setItem(KEY, JSON.stringify(earned.map(b => b.id))).catch(() => {});
      if (news.length === 0) return;
      setFresh(news);
      feedbackBadge();
      logClick('badge_earned_view', { ids: news.map(b => b.id).join(','), count: news.length });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earnedIds]);

  if (!fresh) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 px-6 overflow-hidden bg-[var(--color-canvas)]">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className="anim-confetti"
          style={{ '--x': `${(i * 8 + 4) % 100}%`, '--d': `${(i % 6) * 0.4}s`, '--r': i % 2 ? 1 : -1, background: c } as React.CSSProperties}
        />
      ))}

      <p className="text-2xl font-black text-[var(--color-ink)] anim-pop-in">🎉 새 배지 획득!</p>

      <div className={`flex flex-wrap justify-center gap-5 ${fresh.length === 1 ? '' : 'max-w-xs'}`}>
        {fresh.map((b, i) => (
          <div key={b.id} className="flex flex-col items-center gap-2 anim-pop-in" style={{ '--i': i + 2 } as React.CSSProperties}>
            <div
              className={`${fresh.length === 1 ? 'w-28 h-28 text-6xl' : 'w-20 h-20 text-4xl'} flex items-center justify-center shadow-lg`}
              style={{ borderRadius: 9999, background: 'var(--color-brand-soft)', boxShadow: '0 0 0 6px rgba(249,115,22,0.18)' }}
            >
              {b.icon}
            </div>
            <p className="text-sm font-bold text-[var(--color-ink)]">{b.title}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-[var(--color-ink-3)] text-center break-keep anim-fade-up" style={{ '--i': 4 } as React.CSSProperties}>
        {fresh.length === 1 ? '꾸준함이 만든 배지예요. 마이페이지에서 언제든 볼 수 있어요.' : `${fresh.length}개를 한 번에! 마이페이지에서 언제든 볼 수 있어요.`}
      </p>

      <button
        onClick={() => { logClick('badge_earned_close', { count: fresh.length }); setFresh(null); }}
        className="w-full max-w-xs py-4 rounded-button text-sm font-bold text-white bg-brand-500 active:opacity-90 anim-fade-up"
        style={{ '--i': 5 } as React.CSSProperties}
      >
        확인
      </button>
    </div>
  );
};
