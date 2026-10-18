import { Check } from 'lucide-react';
import { weekDays } from '../../lib/streak';

// 실제 출석 기록을 월~일로 표시한다. 오늘·완료·지난 날·예정일은 색뿐 아니라 표시로도 구분한다.
export const WeekStrip = ({ attendanceDates }: { attendanceDates: string[] }) => {
  const days = weekDays(attendanceDates);
  const count = days.filter(day => day.attended).length;

  return (
    <section className="week-strip" aria-label="이번 주 출석">
      <div className="week-strip-heading">
        <h3>이번 주 출석</h3>
        <span className="week-strip-count" aria-label={`이번 주 ${count}일 출석`}><strong>{count}</strong><span>/7일</span></span>
      </div>
      <ol className="week-strip-days" aria-label="요일별 출석 현황">
        {days.map(day => {
          const state = day.attended ? 'done' : day.isToday ? 'today' : day.isFuture ? 'future' : 'empty';
          const description = day.attended ? '출석 완료' : day.isFuture ? '예정' : '출석 전';
          return (
            <li key={day.dateStr} className="week-strip-day" data-state={state} data-today={day.isToday || undefined} aria-current={day.isToday ? 'date' : undefined} aria-label={`${day.dateStr} ${day.label}요일${day.isToday ? ', 오늘' : ''}, ${description}`}>
              <span className="week-strip-label" aria-hidden="true">{day.isToday ? '오늘' : day.label}</span>
              <span className="week-strip-circle" aria-hidden="true">
                {day.attended
                  ? <Check size={18} strokeWidth={2.5} absoluteStrokeWidth aria-hidden="true" focusable="false" />
                  : day.isToday
                    ? <span className="week-strip-today-dot" />
                    : !day.isFuture && <span className="week-strip-empty-mark" />}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
