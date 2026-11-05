import { CELEBRATION_COLORS } from '../lib/visualPalette';
import { useEffect, useState } from 'react';
import { Check } from './ui/OtterIcons';
import { StreakIcon } from './StatIcons';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { toDateStr } from '../lib/date';
import { calcStreak, streakMessage, streakMilestone, weekDays } from '../lib/streak';
import { feedbackCelebrate, feedbackStreak } from '../lib/feedback';
import { Storage } from '../lib/storage';
import { useModalTurn } from '../lib/modalTurn';

// 학습을 끝낸 뒤 하루 1회 뜨는 연속 출석 축하 모달.
// DailyAlarmPromptCard와 같은 자기완결 패턴 — 완료 화면에 그냥 놓으면 알아서 판단한다.
const KEY = 'streak_celebrated_date';

export const StreakCelebration = () => {
  const { attendanceDates, hydrated } = useAppContext();
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

  const myTurn = useModalTurn(show);
  if (!show || !myTurn) return null;

  const streak = calcStreak(attendanceDates);
  const week = weekDays(attendanceDates);
  const milestone = streakMilestone(streak);
  // 마일스톤(7·14·30·50·100일)이면 브랜드색 배경 + 색종이 + 큰 헤드라인으로 강도를 높인다
  const ink = milestone ? 'text-[var(--color-hero-ink)]' : 'text-[var(--color-ink)]';
  const sub = milestone ? 'text-[var(--color-hero-ink)] opacity-80' : 'text-[var(--color-ink-3)]';
  const CONFETTI = Array.from({ length: 5 }, (_, i) => CELEBRATION_COLORS[i % CELEBRATION_COLORS.length]);

  return (
    <div
      className={`original-modal fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 px-6 overflow-hidden ${milestone ? '' : 'app-soft-screen'}`}
      style={milestone ? { background: 'var(--color-canvas)' } : undefined}
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
        <p className="text-xl font-bold text-[var(--color-hero-ink)] anim-pop-in">{milestone}</p>
      )}

      {/* 학습 달력 + 실제 연속 일수 */}
      <div className="flex flex-col items-center">
        <StreakIcon size={milestone ? 88 : 72} className="anim-pop-in" />
        <p className={`text-4xl font-bold ${ink} mt-1! anim-pop-in`} style={{ '--i': 2 } as React.CSSProperties}>{streak}</p>
        <p className={`text-sm font-normal ${sub} mt-2! anim-fade-up`} style={{ '--i': 3 } as React.CSSProperties}>일 연속 출석 성공</p>
      </div>

      {/* 이번 주 */}
      <div className="flex gap-2">
        {week.map((d, i) => (
          <div key={d.label} className="flex flex-col items-center gap-1 anim-pop-in" style={{ '--i': 4 + i } as React.CSSProperties}>
            <div
              className="w-9 h-9 flex items-center justify-center"
              style={{
                borderRadius: 9999,
                background: d.attended ? 'var(--color-progress)' : 'var(--color-surface)',
                border: d.isToday && !d.attended ? '2px solid var(--color-progress)' : 'none',
                opacity: d.isFuture ? 0.5 : 1,
              }}
            >
              {d.attended && <Check size={20} className="text-[var(--color-card)]" />}
            </div>
            <span className={`text-2xs font-normal ${d.isToday ? (milestone ? 'text-[var(--color-hero-ink)] font-bold' : 'text-[var(--color-ink)] font-bold') : (milestone ? 'text-[var(--color-hero-ink)]' : 'text-[var(--color-ink-4)]')}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 anim-fade-up" style={{ '--i': 8 } as React.CSSProperties}>
        <p className="max-w-[240px] text-center text-sm font-normal break-keep leading-relaxed text-[var(--color-ink-2)]">
          {streak === 1 ? '오늘 출석이 기록됐어요.' : streakMessage(streak)}
        </p>
      </div>

      <button
        onClick={() => { logClick('streak_close', { streak }); setShow(false); }}
        className="action-button w-full max-w-xs anim-fade-up"
        style={{ '--i': 9 } as React.CSSProperties}
      >
        확인
      </button>
    </div>
  );
};
