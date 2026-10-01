import { Check } from 'lucide-react';
import { toDateStr } from '../../lib/date';

// 이번 주 월~일 출석 스트립. 출석은 있음/없음뿐이라 막대 높이 대신 체크 원으로 보여준다.
export const WeekStrip = ({ attendanceDates }: { attendanceDates: string[] }) => {
  const labels = ['월', '화', '수', '목', '금', '토', '일'];
  const today = new Date();
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const attended = new Set(attendanceDates);

  return (
    <div className="flex justify-between gap-1">
      {labels.map((label, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + mondayOffset + i);
        const isToday = i === (dow === 0 ? 6 : dow - 1);
        const isFuture = d > today && !isToday;
        const done = attended.has(toDateStr(d));
        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-1.5 anim-pop-in" style={{ '--i': i } as React.CSSProperties}>
            <span className="text-3xs font-bold text-white">{label}</span>
            <div
              className={`w-7 h-7 flex items-center justify-center ${isToday && !done ? 'anim-attn' : ''}`}
              style={{
                borderRadius: 9999,
                background: done ? '#fff' : 'rgba(255,255,255,0.22)',
                border: isToday && !done ? '2px solid var(--color-on-brand)' : '2px solid transparent',
                opacity: isFuture ? 0.4 : 1,
              }}
            >
              {done && <Check size={14} strokeWidth={3} className="text-brand-500" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
