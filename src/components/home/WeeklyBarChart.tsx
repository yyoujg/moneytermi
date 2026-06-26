// 주간 학습 바 차트
export const WeeklyBarChart = ({ attendanceDates }: { attendanceDates: string[] }) => {
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const today = new Date();
  const todayDay = today.getDay();
  const mondayOffset = (todayDay === 0 ? -6 : 1 - todayDay);
  const attendSet = new Set(attendanceDates);

  const week = days.map((label, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    const dateStr = d.toISOString().slice(0, 10);
    const isAttended = attendSet.has(dateStr);
    const isFuture = d > today;
    const isToday = i === (todayDay === 0 ? 6 : todayDay - 1);
    const count = isAttended ? [4, 6, 3, 7, 5, 8, 2][i] : 0;
    return { label, count, isToday, isFuture, isAttended };
  });

  const maxVal = Math.max(...week.map(d => d.count), 1);

  return (
    <div>
      <div className="flex items-end justify-between gap-1.5 mb-2" style={{ height: 56 }}>
        {week.map(({ label, count, isToday, isFuture }) => (
          <div key={label} className="flex-1 flex flex-col items-center">
            <div className="w-full flex items-end justify-center" style={{ height: 48 }}>
              <div
                className={`w-full rounded-t transition-all duration-700 ${
                  isToday ? 'bg-brand-500' : count > 0 ? 'bg-[var(--color-line)]' : 'bg-[var(--color-surface)]'
                } ${isFuture ? 'opacity-30' : ''}`}
                style={{ height: count > 0 ? `${(count / maxVal) * 48}px` : '4px' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-1.5">
        {week.map(({ label, isToday }) => (
          <div key={label} className={`flex-1 text-center text-3xs font-medium ${isToday ? 'text-brand-500' : 'text-[var(--color-ink-4)]'}`}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};
