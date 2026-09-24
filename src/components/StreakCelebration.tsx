import { useEffect, useState } from 'react';
import { Check, Flame } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getGrowthStage } from '../constants';
import { logClick } from '../lib/analytics';
import { toDateStr } from '../lib/date';
import { calcStreak, streakMessage, weekDays } from '../lib/streak';
import { Storage } from '../lib/storage';

// 학습을 끝낸 뒤 하루 1회 뜨는 연속학습 축하 화면.
// DailyAlarmPromptCard와 같은 자기완결 패턴 — 완료 화면에 그냥 놓으면 알아서 판단한다.
const KEY = 'streak_celebrated_date';

export const StreakCelebration = () => {
  const { attendanceDates, xp, hydrated } = useAppContext();
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
      logClick('streak_view', { streak });
    });
  }, [hydrated, attendanceDates]);

  if (!show) return null;

  const streak = calcStreak(attendanceDates);
  const week = weekDays(attendanceDates);
  const stage = getGrowthStage(xp);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 px-6 bg-[var(--color-canvas)]">

      {/* 불꽃 + 일수 */}
      <div className="flex flex-col items-center">
        <Flame size={72} className="text-brand-500 fill-current" />
        <p className="text-5xl font-black text-[var(--color-ink)] mt-1!">{streak}</p>
        <p className="text-sm font-medium text-[var(--color-ink-3)] mt-2!">일 연속 학습 중이에요</p>
      </div>

      {/* 이번 주 */}
      <div className="flex gap-2">
        {week.map(d => (
          <div key={d.label} className="flex flex-col items-center gap-1.5">
            <div
              className="w-9 h-9 flex items-center justify-center"
              style={{
                borderRadius: 9999,
                background: d.attended ? 'var(--color-brand-500)' : 'var(--color-surface)',
                border: d.isToday && !d.attended ? '2px solid var(--color-brand-500)' : 'none',
                opacity: d.isFuture ? 0.5 : 1,
              }}
            >
              {d.attended && <Check size={18} strokeWidth={3} className="text-white" />}
            </div>
            <span className={`text-2xs font-medium ${d.isToday ? 'text-brand-500 font-bold' : 'text-[var(--color-ink-4)]'}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>

      {/* 캐릭터 말풍선 */}
      <div className="flex items-center gap-3">
        <span className="text-4xl shrink-0">{stage.emoji}</span>
        <div className="rounded-card bg-[var(--color-card)] px-4 py-3 max-w-[220px]">
          <p className="text-sm font-medium text-[var(--color-ink-2)] break-keep leading-relaxed">
            {streakMessage(streak)}
          </p>
        </div>
      </div>

      <button
        onClick={() => { logClick('streak_close', { streak }); setShow(false); }}
        className="w-full max-w-xs py-4 rounded-button text-sm font-bold text-white bg-brand-500 active:opacity-90"
      >
        돌아가기
      </button>
    </div>
  );
};
