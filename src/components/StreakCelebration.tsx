import { useEffect, useState } from 'react';
import { Check } from './ui/OtterIcons';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { toDateStr } from '../lib/date';
import { calcStreak, streakMessage, streakMilestone, weekDays } from '../lib/streak';
import { feedbackCelebrate, feedbackStreak } from '../lib/feedback';
import { Storage } from '../lib/storage';
import { useModalTurn } from '../lib/modalTurn';
import { CelebrationScreen } from './CelebrationScreen';
import { streakShareCard } from '../lib/achievementImage';

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
  // 마일스톤(7·14·30·50·100일)이면 부제를 마일스톤 라벨로 바꾸고 색종이를 더한다
  const milestone = streakMilestone(streak);

  return (
    <CelebrationScreen
      label="연속 출석"
      title={`${streak}일 연속 출석!`}
      subtitle={milestone ?? '오늘도 출석 완료!'}
      confetti={!!milestone}
      // 퀘스트 완료(만세)와 겹치지 않게 손가락을 든 수달
      art={<img src="/otter/v5/otter-explain.svg" alt="" aria-hidden="true" width={172} height={192} data-otter="explain" />}
      record={(
        <div className="flex gap-2" role="group" aria-label="이번 주 출석">
          {week.map(d => (
            <div key={d.label} className="flex flex-col items-center gap-1" aria-label={`${d.label}요일 ${d.attended ? '출석' : '미출석'}`}>
              <div
                className="w-9 h-9 flex items-center justify-center"
                style={{
                  borderRadius: 9999,
                  background: d.attended ? 'var(--color-progress)' : 'var(--color-card)',
                  border: d.isToday && !d.attended ? '2px solid var(--color-progress)' : 'none',
                  opacity: d.isFuture ? 0.5 : 1,
                }}
              >
                {d.attended && <Check size={20} className="text-[var(--color-card)]" />}
              </div>
              <span aria-hidden="true" className={`text-2xs ${d.isToday ? 'text-[var(--color-ink)] font-bold' : 'text-[var(--color-ink-4)]'}`}>{d.label}</span>
            </div>
          ))}
        </div>
      )}
      description={streakMessage(streak)}
      shareCard={streakShareCard(streak, attendanceDates)}
      onClose={() => { logClick('streak_close', { streak }); setShow(false); }}
    />
  );
};
