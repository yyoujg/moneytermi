/// <reference types="node" />
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PointIcon, EnergyIcon, XpIcon, StreakIcon, WordsIcon } from './StatIcons';
import * as OtterIcons from './ui/OtterIcons';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());

describe('수달 컨셉 공통 아이콘', () => {
  it('포인트는 조개, 에너지는 번개를 같은 크기의 장식 이미지로 표시한다', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const root = createRoot(el);
    act(() => root.render(<><PointIcon size={24} className="example-point" /><EnergyIcon size={24} /></>));
    cleanup = () => { act(() => root.unmount()); el.remove(); };
    const images = [...el.querySelectorAll('img')];
    expect(images.map(image => image.getAttribute('src'))).toEqual(['/otter/v3/items/shell.png', '/otter/v3/items/fish.png']);
    for (const image of images) {
      expect(image).toHaveAttribute('width', '24');
      expect(image).toHaveAttribute('height', '24');
      expect(image).toHaveAttribute('alt', '');
      expect(image).toHaveAttribute('aria-hidden', 'true');
      expect(image).toHaveAttribute('draggable', 'false');
      expect(image).not.toHaveClass('bg-white');
    }
    expect(images[0]).toHaveClass('example-point');
  });

  it('경험치·연속 학습·용어는 트로피·달력·책으로 구분한다', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const root = createRoot(el);
    act(() => root.render(<><XpIcon /><StreakIcon /><WordsIcon /></>));
    cleanup = () => { act(() => root.unmount()); el.remove(); };
    const icons = [...el.querySelectorAll('img[data-icon]')];
    expect(icons).toHaveLength(3);
    expect(icons[0]).toHaveAttribute('src', '/otter/v3/icons/trophy.png');
    expect(icons[1]).toHaveAttribute('src', '/otter/v3/icons/calendar.png');
    expect(icons[2]).toHaveAttribute('src', '/otter/v3/icons/book.png');
    icons.forEach(icon => expect(icon).toHaveAttribute('aria-hidden', 'true'));
  });

  it.each(['shell', 'fish'])('%s 재화 원본은 256픽셀 RGBA PNG다', name => {
    const data = readFileSync(resolve('public/otter/v3/items', name + '.png'));
    expect([...data.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(data.readUInt32BE(16)).toBe(256);
    expect(data.readUInt32BE(20)).toBe(256);
    expect(data[25]).toBe(6);
  });
});



describe('부드러운 역할 그림과 선형 조작 아이콘 호환', () => {
  it('기존 43개 이름을 20개 역할 그림과 21개 선형 조작 표시로 연결한다', () => {
    const groups: Record<string, (keyof typeof OtterIcons)[]> = {
      book: ['BookOpen', 'BookOpenText'], library: ['LibraryBig'], checklist: ['ListChecks'],
      chart: ['BarChart3', 'ChartNoAxesColumnIncreasing'], profile: ['UserRound'], trophy: ['Trophy'],
      calendar: ['CalendarDays'], wallet: ['WalletCards'], newspaper: ['Newspaper'], settings: ['Settings'],
      bell: ['Bell'], moon: ['Moon'], speaker: ['Volume2'], music: ['Music2'], vibrate: ['Vibrate'],
      bulb: ['Lightbulb'], target: ['Target'], flame: ['Flame'], tv: ['Tv'], mute: ['VolumeX'],
    };
    const controls: (keyof typeof OtterIcons)[] = ['Pencil','Lock','LockKeyhole','ArrowRight','ArrowDown','ChevronRight','ChevronLeft','ChevronDown','ChevronsUp','RotateCcw','ExternalLink','Link2','Share2','Check','X','TrendingUp','Sparkles','BadgeCheck','Info','AlertCircle','CircleHelp'];
    const el = document.createElement('div');
    const root = createRoot(el);
    cleanup = () => { act(() => root.unmount()); };
    const entries = Object.entries(groups).flatMap(([key, names]) => names.map(name => ({ key, name })));
    act(() => root.render(<>{[...entries.map(({ name }) => name), ...controls].map(name => { const Icon = OtterIcons[name]; return <Icon key={name} />; })}</>));
    expect(Object.keys(groups)).toHaveLength(20);
    expect(Object.keys(OtterIcons)).toHaveLength(43);
    const images = [...el.querySelectorAll('img')];
    expect(images).toHaveLength(22);
    for (const [index, image] of images.entries()) {
      expect(image).toHaveAttribute('data-icon', entries[index].name);
      expect(image).toHaveAttribute('src', '/otter/v3/icons/' + entries[index].key + '.png');
      expect(image).toHaveAttribute('width', '24');
      expect(image).toHaveAttribute('height', '24');
      expect(image).toHaveAttribute('alt', '');
      expect(image).toHaveAttribute('aria-hidden', 'true');
      expect(image).toHaveStyle({ objectFit: 'contain' });
    }
    const lines = [...el.querySelectorAll('svg')];
    expect(lines).toHaveLength(21);
    lines.forEach((line, index) => {
      expect(line).toHaveAttribute('data-icon', controls[index]);
      expect(line).toHaveAttribute('stroke', 'currentColor');
      expect(line).toHaveAttribute('aria-hidden', 'true');
      expect(line).toHaveAttribute('focusable', 'false');
    });
  });

  it('역할 그림의 크기·스타일·이벤트·참조를 보존하고 선 전용 속성은 전달하지 않는다', () => {
    const el = document.createElement('div');
    const root = createRoot(el);
    const ref = createRef<HTMLImageElement>();
    let clicked = false;
    cleanup = () => { act(() => root.unmount()); };
    act(() => root.render(<OtterIcons.BookOpen ref={ref} size="1.5rem" className="custom-icon" style={{ opacity: 0.8, transform: 'rotate(180deg)' }} aria-hidden={false} aria-label="학습" onClick={() => { clicked = true; }} strokeWidth={2} color="red" fill="blue" absoluteStrokeWidth />));
    const image = el.querySelector('img')!;
    expect(ref.current).toBe(image);
    expect(image).toHaveClass('otter-icon', 'custom-icon');
    expect(image).toHaveAttribute('width', '1.5rem');
    expect(image).toHaveAttribute('height', '1.5rem');
    expect(image).toHaveAttribute('aria-hidden', 'false');
    expect(image).toHaveStyle({ width: '1.5rem', height: '1.5rem', opacity: '0.8', transform: 'rotate(180deg)' });
    for (const attr of ['stroke-width', 'strokeWidth', 'color', 'fill', 'absoluteStrokeWidth']) expect(image).not.toHaveAttribute(attr);
    act(() => image.click());
    expect(clicked).toBe(true);
  });

  it('조작 선의 참조·회전·크기·접근성 이름과 클릭을 보존한다', () => {
    const el = document.createElement('div');
    const root = createRoot(el);
    const ref = createRef<SVGSVGElement>();
    let clicked = false;
    cleanup = () => { act(() => root.unmount()); };
    act(() => root.render(<OtterIcons.ArrowDown ref={ref} size={20} className="custom-control" style={{ transform: 'rotate(180deg)' }} aria-hidden={false} aria-label="펼치기" onClick={() => { clicked = true; }} />));
    const line = el.querySelector('svg')!;
    expect(ref.current).toBe(line);
    expect(line).toHaveClass('otter-control', 'custom-control');
    expect(line).toHaveAttribute('width', '20');
    expect(line).toHaveAttribute('aria-label', '펼치기');
    expect(line).toHaveAttribute('aria-hidden', 'false');
    expect(line).toHaveAttribute('stroke', 'currentColor');
    expect(line).toHaveStyle({ transform: 'rotate(180deg)' });
    act(() => line.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(clicked).toBe(true);
  });
});
