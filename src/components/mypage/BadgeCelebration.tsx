import { useEffect, useState } from 'react';
import { buildBadges, type Badge } from '../../lib/badges';
import { useAppContext } from '../../context/AppContext';
import { calcStreak } from '../../lib/streak';
import { Storage } from '../../lib/storage';
import { logClick } from '../../lib/analytics';
import { feedbackBadge } from '../../lib/feedback';
import { BadgeGlyph } from './BadgeGlyph';
import { useModalTurn } from '../../lib/modalTurn';
import { CelebrationScreen } from '../CelebrationScreen';

// 새로 획득한 배지 축하. 배지는 서버 기록 없이 통계에서 파생되므로, "이미 보여준 배지" 목록을 기기에 남겨 차이만 축하한다.
// 여러 개를 한 번에 얻었으면 한 화면에 같이 보여준다. 유실돼도 축하가 한 번 더 뜰 뿐이다.
const KEY = 'badges_seen';

// 앱 전역(Layout)에 붙어 있어 어느 화면에서든 달성 즉시 뜬다.
export const BadgeCelebration = () => {
  const { hydrated, knownWords, attendanceDates, xp } = useAppContext();
  const badges = buildBadges({ words: knownWords.length, streak: calcStreak(attendanceDates), xp });
  const [fresh, setFresh] = useState<Badge[] | null>(null);
  // 여러 개를 한 번에 얻어도 한 화면에 배지 하나씩, 확인을 누를 때마다 다음 배지로 넘긴다
  const [index, setIndex] = useState(0);
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
      setIndex(0);
      feedbackBadge();
      logClick('badge_earned_view', { ids: news.map(b => b.id).join(','), count: news.length });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, earnedIds]);

  const myTurn = useModalTurn(!!fresh);
  if (!fresh || !myTurn) return null;

  const badge = fresh[index];
  const next = () => {
    if (index + 1 < fresh.length) { setIndex(index + 1); return; }
    logClick('badge_earned_close', { count: fresh.length });
    setFresh(null);
  };
  return (
    <CelebrationScreen
      key={badge.id}
      label="배지 획득"
      title="새 배지 획득!"
      subtitle={fresh.length > 1 ? `컬렉션에 추가! ${index + 1}/${fresh.length}` : '컬렉션에 추가!'}
      confetti
      art={<BadgeGlyph id={badge.id} size={160} />}
      record={<p className="celebration-record">{badge.title}</p>}
      description="꾸준히 쌓은 기록이 배지가 됐어. 마이페이지에서 꺼내 봐!"
      shareCard={{ kind: 'badge', title: '새 배지 획득!', value: '1', unit: '개의 새로운 배지', description: badge.title }}
      onClose={next}
    />
  );
};
