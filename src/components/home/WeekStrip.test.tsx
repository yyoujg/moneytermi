import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WeekStrip } from './WeekStrip';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-14T12:00:00+09:00')); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
const mount = (dates: string[]) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<WeekStrip attendanceDates={dates} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('구분하기 쉬운 주간 출석', () => {
  it('이번 주 실제 출석만 중복 없이 세고 원본 기록을 변경하지 않는다', () => {
    const dates = ['2026-10-11', '2026-10-12', '2026-10-12', '2026-10-14'];
    const before = [...dates];
    const container = mount(dates);
    expect(container.querySelector('[aria-label="이번 주 2일 출석"]')).not.toBeNull();
    expect(container.querySelectorAll('li')).toHaveLength(7);
    expect(container.querySelectorAll('[data-state="done"]')).toHaveLength(2);
    expect(dates).toEqual(before);
  });
  it('오늘 출석 전과 지난 날·예정일을 문구와 서로 다른 표시로 구분한다', () => {
    const container = mount([]);
    expect(container.querySelector('[aria-current="date"]')).toHaveAttribute('data-state', 'today');
    expect(container.querySelector('[aria-current="date"]')).toHaveAttribute('aria-label', '2026-10-14 수요일, 오늘, 출석 전');
    expect(container.querySelector('[aria-current="date"]')).toHaveTextContent('오늘');
    expect(container.querySelectorAll('.week-strip-today-dot')).toHaveLength(1);
    expect(container.querySelectorAll('.week-strip-empty-mark')).toHaveLength(2);
    expect(container.querySelectorAll('[data-state="future"]')).toHaveLength(4);
    expect(container.querySelector('button')).toBeNull();
  });
  it('출석한 오늘에도 오늘 표시를 유지하고 흰 글자색을 따르는 체크를 사용한다', () => {
    const container = mount(['2026-10-14']);
    const today = container.querySelector('[aria-current="date"]')!;
    expect(today).toHaveAttribute('data-state', 'done');
    expect(today).toHaveTextContent('오늘');
    expect(today.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
    expect(today.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(today.querySelector('img')).toBeNull();
  });
  it('일요일도 월요일부터 시작하는 일곱 칸의 마지막 오늘로 표시한다', () => {
    vi.setSystemTime(new Date('2026-10-18T12:00:00+09:00'));
    const container = mount(['2026-10-12', '2026-10-18']);
    expect(container.querySelector('li:last-child')).toHaveAttribute('aria-current', 'date');
    expect(container.querySelector('li:first-child')).toHaveAttribute('aria-label', '2026-10-12 월요일, 출석 완료');
    expect(container.querySelector('[data-state="future"]')).toBeNull();
  });
  it('다음 주 월요일에는 지난 주 출석을 새 주 합계로 가져오지 않는다', () => {
    vi.setSystemTime(new Date('2026-10-19T12:00:00+09:00'));
    const container = mount(['2026-10-12', '2026-10-18']);
    expect(container.querySelector('[aria-label="이번 주 0일 출석"]')).not.toBeNull();
    expect(container.querySelector('li:first-child')).toHaveAttribute('aria-current', 'date');
  });
});
