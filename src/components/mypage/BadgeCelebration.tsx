import { CELEBRATION_COLORS } from '../../lib/visualPalette';
import { useEffect, useState } from 'react';
import { buildBadges, type Badge } from '../../lib/badges';
import { useAppContext } from '../../context/AppContext';
import { calcStreak } from '../../lib/streak';
import { Storage } from '../../lib/storage';
import { logClick } from '../../lib/analytics';
import { feedbackBadge } from '../../lib/feedback';
import { BadgeGlyph } from './BadgeGlyph';
import { useModalTurn } from '../../lib/modalTurn';

// 새로 획득한 배지 축하. 배지는 서버 기록 없이 통계에서 파생되므로, "이미 보여준 배지" 목록을 기기에 남겨 차이만 축하한다.
// 여러 개를 한 번에 얻었으면 한 화면에 같이 보여준다. 유실돼도 축하가 한 번 더 뜰 뿐이다.
const KEY = 'badges_seen';
const CONFETTI = Array.from({ length: 5 }, (_, i) => CELEBRATION_COLORS[i % CELEBRATION_COLORS.length]);

// 앱 전역(Layout)에 붙어 있어 어느 화면에서든 달성 즉시 뜬다.
export const BadgeCelebration = () => {
  const { hydrated, knownWords, attendanceDates, xp } = useAppContext();
  const badges = buildBadges({ words: knownWords.length, streak: calcStreak(attendanceDates), xp });
  const [fresh, setFresh] = useState<Badge[] | null>(null);
  const earnedIds = badges.filter(b => b.earned).map(b => b.id).join(',');

  useEffect(() => {
    // 로딩 중 일부 통계만 채워진 상태로 판정하면 나머지 배지가 새로 딴 것처럼 뜬다
    if (!hydrated || !earnedIds) return;
    Storage.getItem(KEY).catch(() => null).then(raw => {
      // 저장값이 깨져 있으면 빈 기록으로 보고 덮어쓴다(안 그러면 이 기기에선 축하가 영영 안 뜬다)
      let seen = new Set<string>();
      try { seen = new Set<string>(raw ? JSON.parse(raw) : []); } catch { /* 깨진 값 */ }
      const earned = badges.filter(b => b.earned);
      const news = earned.filter(b => !seen.has(b.id));
      // 덮어쓰면 단어 목록이 늦게 채워질 때 단어 배지가 기록에서 빠져 앱을 열 때마다 다시 뜬다
      Storage.setItem(KEY, JSON.stringify([...new Set([...seen, ...earned.map(b => b.id)])])).catch(() => {});
      if (news.length === 0) return;
      setFresh(news);
      feedbackBadge();
      logClick('badge_earned_view', { ids: news.map(b => b.id).join(','), count: news.length });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, earnedIds]);

  const myTurn = useModalTurn(!!fresh);
  if (!fresh || !myTurn) return null;

  return (
    <div className="original-modal bg-[var(--color-canvas)] fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 px-6 overflow-hidden">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className="anim-confetti"
          style={{ '--x': `${(i * 8 + 4) % 100}%`, '--d': `${(i % 6) * 0.4}s`, '--r': i % 2 ? 1 : -1, background: c } as React.CSSProperties}
        />
      ))}

      <h2 className="text-xl font-bold text-[var(--color-ink)] anim-pop-in">새 배지 획득!</h2>

      <div className={`flex flex-wrap justify-center gap-5 ${fresh.length === 1 ? '' : 'max-w-xs'}`}>
        {fresh.map((b, i) => (
          <div key={b.id} className="flex flex-col items-center gap-2 anim-pop-in" style={{ '--i': i + 2 } as React.CSSProperties}>
            <BadgeGlyph id={b.id} size={fresh.length === 1 ? 140 : 96} />
            <p className="text-sm font-bold text-[var(--color-ink)]">{b.title}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-[var(--color-ink-3)] text-center break-keep anim-fade-up" style={{ '--i': 4 } as React.CSSProperties}>
        {fresh.length === 1 ? '꾸준함이 만든 배지예요. 마이페이지에서 언제든 볼 수 있어요.' : `${fresh.length}개를 한 번에! 마이페이지에서 언제든 볼 수 있어요.`}
      </p>

      <button
        onClick={() => { logClick('badge_earned_close', { count: fresh.length }); setFresh(null); }}
        className="action-button w-full max-w-xs anim-fade-up"
        style={{ '--i': 5 } as React.CSSProperties}
      >
        확인
      </button>
    </div>
  );
};
