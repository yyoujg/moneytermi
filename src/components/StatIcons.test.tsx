import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { PointIcon, EnergyIcon, XpIcon, StreakIcon, WordsIcon } from './StatIcons';
import * as OtterIcons from './ui/OtterIcons';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (content: React.ReactNode) => {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const root = createRoot(el);
  act(() => root.render(content));
  cleanup = () => { act(() => root.unmount()); el.remove(); };
  return el;
};

describe('재화·학습 정보 듀오톤 아이콘', () => {
  it('코인·에너지·경험치·연속 학습·용어를 각자의 보조색 듀오톤으로 구분한다', () => {
    const el = mount(<><PointIcon size={24} className="example-point" /><EnergyIcon size={24} /><XpIcon /><StreakIcon /><WordsIcon /></>);
    expect(el.querySelector('img')).toBeNull();
    const icons = [...el.querySelectorAll('svg')];
    expect(icons.map(icon => icon.getAttribute('data-icon'))).toEqual(['Coins', 'Lightning', 'Trophy', 'Flame', 'BookOpen']);
    ['points', 'energy', 'xp', 'streak', 'words'].forEach((stat, index) => {
      expect(icons[index]).toHaveClass(`text-[var(--color-stat-${stat})]`);
      expect(icons[index]).toHaveAttribute('fill', 'currentColor');
      expect(icons[index].querySelector('[opacity="0.2"]')).not.toBeNull();
      expect(icons[index]).toHaveAttribute('aria-hidden', 'true');
    });
    expect(icons[0]).toHaveAttribute('width', '24');
    expect(icons[0]).toHaveClass('example-point');
    expect(icons[2]).toHaveAttribute('width', '16');
  });
});

describe('공용 아이콘 export 호환', () => {
  it('기존 이름과 재화 아이콘이 모두 바탕 없는 svg로 그려지고 꺾쇠만 선형이다', () => {
    const names = Object.keys(OtterIcons) as (keyof typeof OtterIcons)[];
    expect(names).toHaveLength(45);
    const el = mount(<>{names.map(name => { const Icon = OtterIcons[name] as React.ComponentType; return <Icon key={name} />; })}</>);
    expect(el.querySelector('img')).toBeNull();
    const icons = [...el.querySelectorAll('svg')];
    expect(icons.map(icon => icon.getAttribute('data-icon'))).toEqual(names);
    for (const icon of icons) {
      expect(icon).toHaveAttribute('fill', 'currentColor');
      // 꺾쇠(Chevron*)만 선형, 나머지는 듀오톤 레이어를 가진다.
      const caret = /^Chevron/.test(icon.getAttribute('data-icon') ?? '');
      expect(icon.querySelector('[opacity="0.2"]') === null).toBe(caret);
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('focusable', 'false');
    }
  });

  it('크기·스타일·이벤트·참조를 보존하고 선 전용 속성은 전달하지 않는다', () => {
    const ref = createRef<SVGSVGElement>();
    let clicked = false;
    const el = mount(<OtterIcons.BookOpen ref={ref} size="1.5rem" className="custom-icon" style={{ transform: 'rotate(180deg)' }} aria-hidden={false} aria-label="학습" onClick={() => { clicked = true; }} strokeWidth={2} absoluteStrokeWidth />);
    const icon = el.querySelector('svg')!;
    expect(ref.current).toBe(icon);
    expect(icon).toHaveClass('custom-icon');
    expect(icon).toHaveAttribute('width', '1.5rem');
    expect(icon).toHaveAttribute('aria-hidden', 'false');
    expect(icon).toHaveAttribute('aria-label', '학습');
    expect(icon).toHaveStyle({ transform: 'rotate(180deg)' });
    for (const attr of ['stroke-width', 'strokeWidth', 'absoluteStrokeWidth']) expect(icon).not.toHaveAttribute(attr);
    act(() => icon.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(clicked).toBe(true);
  });

  it('조작 표시는 기본 18픽셀이고 크기를 바꿀 수 있다', () => {
    const el = mount(<><OtterIcons.ChevronRight /><OtterIcons.ArrowDown size={20} /></>);
    const [chevron, arrow] = el.querySelectorAll('svg');
    expect(chevron).toHaveAttribute('width', '18');
    expect(arrow).toHaveAttribute('width', '20');
  });
});
