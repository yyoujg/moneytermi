import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../ui/Card';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const AttendanceCalendar = ({ attendanceDates }: { attendanceDates: string[] }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const attendSet = new Set(attendanceDates);
  const todayStr = today.toISOString().slice(0, 10);

  const toStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const attendCount = Array.from({ length: daysInMonth }, (_, i) =>
    attendSet.has(toStr(year, month, i + 1))
  ).filter(Boolean).length;

  return (
    <Card pad="none" className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-card)] active:bg-[var(--color-surface)]"
        >
          <ChevronLeft size={16} className="text-[var(--color-ink-3)]" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-[var(--color-ink)]">{year}년 {month + 1}월</p>
          <p className="text-2xs text-brand-400 font-semibold mt-0.5">이번 달 {attendCount}일 출석</p>
        </div>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-card)] active:bg-[var(--color-surface)]"
        >
          <ChevronLeft size={16} className="text-[var(--color-ink-3)] rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-7 px-3 pt-3">
        {DAYS.map((d, i) => (
          <div key={d} className={`text-center text-2xs font-bold pb-2 ${i === 0 ? 'text-danger-400' : i === 6 ? 'text-blue-400' : 'text-[var(--color-ink-3)]'}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr = toStr(year, month, day);
          const isAttended = attendSet.has(dateStr);
          const isToday = dateStr === todayStr;
          const dayOfWeek = (firstDay + day - 1) % 7;
          return (
            <div key={day} className="flex items-center justify-center py-0.5">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold
                ${isAttended ? 'bg-brand-500 text-white font-bold' : ''}
                ${isToday && !isAttended ? 'ring-2 ring-brand-400 text-brand-500 font-bold' : ''}
                ${!isAttended && !isToday ? (dayOfWeek === 0 ? 'text-danger-300' : dayOfWeek === 6 ? 'text-blue-300' : 'text-[var(--color-ink-3)]') : ''}
              `}>
                {day}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 px-5 pb-4 pt-1 border-t border-[var(--color-line)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-brand-500" />
          <span className="text-2xs text-[var(--color-ink-3)] font-medium">출석</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-brand-400" />
          <span className="text-2xs text-[var(--color-ink-3)] font-medium">오늘</span>
        </div>
      </div>
    </Card>
  );
};
