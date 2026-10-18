import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WordVisuals, type Terms } from './WordVisuals';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

let cleanup = () => {};
afterEach(() => cleanup());

const mount = (visuals: Parameters<typeof WordVisuals>[0]['visuals'], terms?: Terms) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<WordVisuals visuals={visuals} terms={terms} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('WordVisuals tables and charts', () => {
  it('gives long first-column labels more room in three-column tables', () => {
    const container = mount([{
      type: 'table',
      title: '단리와 복리 비교',
      columns: ['구분', '단리', '복리'],
      rows: [
        ['이자가 붙는 곳', '원금에만', '원금 + 쌓인 이자'],
        ['10년 뒤 (100만 원, 연 10%)', '200만 원', '약 259만 원'],
      ],
    }]);

    expect([...container.querySelectorAll('col')].map(col => (col as HTMLTableColElement).style.width)).toEqual(['34%', '30%', '36%']);
  });

  it('keeps wide tables horizontally scrollable instead of squeezing every column', () => {
    const container = mount([{
      type: 'table',
      title: '자동차로 계산해 보기',
      columns: ['연도', '생산량 × 가격', '명목 GDP', '실질 GDP'],
      rows: [
        ['1년차(기준연도)', '100대 × 1,000만 원', '10억', '10억'],
        ['2년차', '100대 × 1,100만 원', '11억', '10억'],
      ],
    }]);

    expect(container.querySelector('table')).toHaveStyle({ minWidth: '520px' });
  });

  it('ignores broken line series instead of crashing the card', () => {
    expect(() => mount([{
      type: 'line',
      title: '값 변화',
      x: ['1월', '2월'],
      series: [{ name: '불완전', values: [1] }],
    }])).not.toThrow();
  });
});

describe('설명 속 용어 연결', () => {
  const visuals: Parameters<typeof WordVisuals>[0]['visuals'] = [{
    type: 'text', title: '수확체감의 법칙 쉽게 설명', body: '생산요소가 고정돼 있으면 한계생산이 줄어요.',
  }];
  const terms = (): Terms => ({
    names: ['생산요소', '한계생산'],
    meaningOf: name => name === '생산요소' ? '재화와 서비스를 만드는 데 들어가는 것' : '한 명 더 늘었을 때 추가 생산량',
    onClick: vi.fn(),
  });

  it('용어를 열어도 진한 살구색으로 바꾸지 않고 열린 상태를 표시한다', () => {
    const container = mount(visuals, terms());
    const button = container.querySelector<HTMLButtonElement>('.word-term-button')!;
    expect(button).toHaveAttribute('aria-expanded', 'false');
    act(() => button.click());
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button.className).not.toContain('bg-brand-200');
    expect(button.className).not.toContain('active:opacity');
    expect(container.textContent).toContain('재화와 서비스를 만드는 데 들어가는 것');
    act(() => button.click());
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('.word-term-card-link')).toBeNull();
  });

  it('설명창의 보조 버튼으로 선택한 용어 카드에 이동한다', () => {
    const links = terms();
    const container = mount(visuals, links);
    act(() => container.querySelectorAll<HTMLButtonElement>('.word-term-button')[1].click());
    const link = container.querySelector<HTMLButtonElement>('.word-term-card-link')!;
    expect(link).not.toHaveClass('text-brand-300');
    expect(link.className).not.toContain('active:opacity');
    act(() => link.click());
    expect(links.onClick).toHaveBeenCalledWith('한계생산');
    expect(link).toHaveAttribute('data-tone', 'soft');
    expect(link).toHaveTextContent('용어 카드 보기');
  });

  it('용어명·뜻·등록된 예시를 구분하고 예시가 없는 용어는 빈 영역을 만들지 않는다', () => {
    const links = { ...terms(), exampleOf: (name: string) => name === '생산요소' ? '빵집의 제빵사와 오븐을 떠올려보세요.' : undefined };
    const container = mount(visuals, links);
    const triggers = container.querySelectorAll<HTMLButtonElement>('.word-term-button');
    act(() => triggers[0].click());
    const panel = container.querySelector('.word-term-panel')!;
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-label', '생산요소 뜻 설명');
    expect(triggers[0]).toHaveAttribute('aria-controls', panel.id);
    expect(panel.querySelector('[role="heading"]')).toHaveTextContent('생산요소');
    expect(panel.querySelector('.word-term-panel-meaning')).toHaveTextContent('재화와 서비스를 만드는 데 들어가는 것');
    expect(panel.querySelector('.word-term-example')).toHaveTextContent('빵집의 제빵사와 오븐을 떠올려보세요.');
    act(() => triggers[1].click());
    expect(container.querySelectorAll('.word-term-panel')).toHaveLength(1);
    expect(container.querySelector('.word-term-panel')).toHaveAttribute('aria-label', '한계생산 뜻 설명');
    expect(container.querySelector('.word-term-example')).toBeNull();
  });

  it('닫기 버튼으로 설명을 닫고 선택했던 용어로 초점을 돌린다', () => {
    const container = mount(visuals, terms());
    const trigger = container.querySelector<HTMLButtonElement>('.word-term-button')!;
    act(() => trigger.click());
    act(() => container.querySelector<HTMLButtonElement>('.word-term-close')!.click());
    expect(container.querySelector('.word-term-panel')).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(trigger);
  });

  it('이스케이프 키로도 설명을 닫고 카드 이동을 실행하지 않는다', () => {
    const links = terms();
    const container = mount(visuals, links);
    const trigger = container.querySelector<HTMLButtonElement>('.word-term-button')!;
    act(() => trigger.click());
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(container.querySelector('.word-term-panel')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(links.onClick).not.toHaveBeenCalled();
  });

  it('여러 설명 카드의 접근성 연결 이름이 충돌하지 않는다', () => {
    const container = mount([...visuals, { type: 'text', title: '다른 설명', body: '생산요소와 한계생산을 비교해요.' }], terms());
    const triggers = container.querySelectorAll<HTMLButtonElement>('.word-term-button');
    act(() => { triggers[0].click(); triggers[2].click(); });
    const panels = [...container.querySelectorAll('.word-term-panel')];
    expect(panels).toHaveLength(2);
    expect(panels[0].id).not.toBe(panels[1].id);
  });

  it('뜻이 비어 있으면 임의의 설명 대신 준비 중임을 알린다', () => {
    const container = mount(visuals, { ...terms(), meaningOf: () => undefined });
    act(() => container.querySelector<HTMLButtonElement>('.word-term-button')!.click());
    expect(container.querySelector('.word-term-panel-meaning')).toHaveTextContent('뜻 설명을 준비 중이에요.');
    expect(container.querySelector('.word-term-example')).toBeNull();
  });
});
