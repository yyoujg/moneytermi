import { useEffect, useState } from 'react';
import { Check, Flame } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { toDateStr } from '../lib/date';
import { calcStreak, streakMessage, streakMilestone, weekDays } from '../lib/streak';
import { feedbackCelebrate, feedbackStreak } from '../lib/feedback';
import { Storage } from '../lib/storage';

// 학습을 끝낸 뒤 하루 1회 뜨는 연속학습 축하 화면.
// DailyAlarmPromptCard와 같은 자기완결 패턴 — 완료 화면에 그냥 놓으면 알아서 판단한다.
const KEY = 'streak_celebrated_date';

export const StreakCelebration = () => {
  const { attendanceDates, myEmoji, hydrated } = useAppContext();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const today = toDateStr();
    const streak = calcStreak(attendanceDates);
    if (streak < 1) return; // 오늘 출석이 아직 안 잡혔으면 "0일 연속"을 띄우지 않는다
    Storage.getItem(KEY).catch(() => null).then(seen => {
      if (seen === today) return;
      setShow(true);
      Storage.setItem(KEY, today).catch(() => {});
      const milestone = streakMilestone(streak);
      if (milestone) feedbackCelebrate(); else feedbackStreak();
      logClick('streak_view', { streak, milestone: milestone ?? undefined });
    });
  }, [hydrated, attendanceDates]);

  if (!show) return null;

  const streak = calcStreak(attendanceDates);
  const week = weekDays(attendanceDates);
  const milestone = streakMilestone(streak);
  // 마일스톤(7·14·30·50·100일)이면 브랜드색 배경 + 색종이 + 큰 헤드라인으로 강도를 높인다
  const ink = milestone ? 'text-white' : 'text-[var(--color-ink)]';
  const sub = milestone ? 'text-white/80' : 'text-[var(--color-ink-3)]';
  const CONFETTI = ['#fff', '#fde68a', '#fecaca', '#bfdbfe', '#bbf7d0', '#fff', '#fde68a', '#fecaca', '#bfdbfe', '#bbf7d0', '#fff', '#fde68a', '#c7d2fe', '#fbcfe8'];

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 px-6 overflow-hidden ${milestone ? '' : 'bg-[var(--color-canvas)]'}`}
      style={milestone ? { background: 'linear-gradient(160deg, #f97316 0%, #fb923c 60%, #fdba74 100%)' } : undefined}
    >
      {milestone && CONFETTI.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className="anim-confetti"
          style={{ '--x': `${(i * 7 + 3) % 100}%`, '--d': `${(i % 7) * 0.35}s`, '--r': i % 2 ? 1 : -1, background: c } as React.CSSProperties}
        />
      ))}
      {milestone && (
        <p className="text-2xl font-black text-white anim-pop-in tracking-tight">🎉 {milestone}</p>
      )}

      {/* 불꽃 + 일수 */}
      <div className="flex flex-col items-center">
        <Flame size={milestone ? 88 : 72} className={`${milestone ? 'text-white' : 'text-brand-500'} fill-current anim-pop-in`} />
        <p className={`text-5xl font-black ${ink} mt-1! anim-pop-in`} style={{ '--i': 2 } as React.CSSProperties}>{streak}</p>
        <p className={`text-sm font-medium ${sub} mt-2! anim-fade-up`} style={{ '--i': 3 } as React.CSSProperties}>일 연속 학습 중이에요</p>
      </div>

      {/* 이번 주 */}
      <div className="flex gap-2">
        {week.map((d, i) => (
          <div key={d.label} className="flex flex-col items-center gap-1.5 anim-pop-in" style={{ '--i': 4 + i } as React.CSSProperties}>
            <div
              className="w-9 h-9 flex items-center justify-center"
              style={{
                borderRadius: 9999,
                background: d.attended ? (milestone ? '#fff' : 'var(--color-brand-500)') : (milestone ? 'rgba(255,255,255,0.22)' : 'var(--color-surface)'),
                border: d.isToday && !d.attended ? `2px solid ${milestone ? '#fff' : 'var(--color-brand-500)'}` : 'none',
                opacity: d.isFuture ? 0.5 : 1,
              }}
            >
              {d.attended && <Check size={18} strokeWidth={3} className={milestone ? 'text-brand-500' : 'text-white'} />}
            </div>
            <span className={`text-2xs font-medium ${d.isToday ? (milestone ? 'text-white font-bold' : 'text-brand-500 font-bold') : (milestone ? 'text-white/70' : 'text-[var(--color-ink-4)]')}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>

      {/* 내 아바타 말풍선 */}
      <div className="flex items-center gap-3 anim-fade-up" style={{ '--i': 8 } as React.CSSProperties}>
        <span className="text-4xl shrink-0">{myEmoji}</span>
        <div className={`rounded-card px-4 py-3 max-w-[220px] ${milestone ? 'bg-white/95' : 'bg-[var(--color-card)]'}`}>
          <p className={`text-sm font-medium break-keep leading-relaxed ${milestone ? 'text-[#7c2d12]' : 'text-[var(--color-ink-2)]'}`}>
            {streakMessage(streak)}
          </p>
        </div>
      </div>

      <button
        onClick={() => { logClick('streak_close', { streak }); setShow(false); }}
        className={`w-full max-w-xs py-4 rounded-button text-sm font-bold active:opacity-90 anim-fade-up ${milestone ? 'bg-white text-brand-500' : 'bg-brand-500 text-white'}`}
        style={{ '--i': 9 } as React.CSSProperties}
      >
        {milestone ? '계속 이어가기' : '돌아가기'}
      </button>
    </div>
  );
};
