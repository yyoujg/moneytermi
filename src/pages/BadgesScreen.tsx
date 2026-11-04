import { useAppContext } from '../context/AppContext';
import { calcStreak } from '../lib/streak';
import { BADGE_GROUPS, buildBadges } from '../lib/badges';
import { BadgeGlyph } from '../components/mypage/BadgeGlyph';

// 배지 더보기(/my/badges): 계열(용어·연속 학습·경험치)별로 전부 보여주고, 못 받은 배지는 지금 값/목표를 적는다.
// 뒤로가기는 토스 내비게이션 바가 맡는다(자체 뒤로가기 버튼은 검수 반려 사유).
const BadgesScreen = () => {
  const { xp, knownWords, attendanceDates } = useAppContext();
  const stats = { words: knownWords.length, streak: calcStreak(attendanceDates), xp };
  const badges = buildBadges(stats);
  const earned = badges.filter(b => b.earned).length;

  return (
    <div className="my-page-screen flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="pt-4 px-5">
        <h2 className="type-page-title">배지</h2>
        <p className="type-supporting mt-1!">획득 {earned} / {badges.length}</p>
      </div>
      <div className="my-page-sections px-5">
        {BADGE_GROUPS.map(group => (
          <section key={group.stat} aria-labelledby={`badges-${group.stat}`} className="my-page-panel">
            <h3 id={`badges-${group.stat}`} className="type-section-title mb-3">{group.title}</h3>
            <ul aria-label={`${group.title} 배지`} className="grid grid-cols-3 gap-x-2 gap-y-5">
              {badges.filter(b => b.stat === group.stat).map(b => (
                <li key={b.id} className="flex min-w-0 flex-col items-center gap-1 text-center">
                  <BadgeGlyph id={b.id} size={64} earned={b.earned} />
                  <span className={`text-xs font-semibold break-keep ${b.earned ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-3)]'}`}>{b.title}</span>
                  <span className="text-2xs text-[var(--color-ink-3)] tabular-nums">
                    {b.earned ? '획득' : `${Math.min(stats[b.stat], b.need).toLocaleString()} / ${b.need.toLocaleString()}${group.unit}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default BadgesScreen;
