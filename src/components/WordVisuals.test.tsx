import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WordVisuals, type Terms } from './WordVisuals';
import content from '../content/content.json';
import type { WordVisual } from '../types';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

let cleanup = () => {};
afterEach(() => cleanup());

const mount = (visuals: Parameters<typeof WordVisuals>[0]['visuals'], terms?: Terms, emphasisWord?: string) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<WordVisuals visuals={visuals} terms={terms} emphasisWord={emphasisWord} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('WordVisuals tables and charts', () => {
  it('keeps comparison criteria in the first column even in narrow tables', () => {
    const container = mount([{
      type: 'table',
      title: '단리와 복리 비교',
      columns: ['구분', '단리', '복리'],
      rows: [
        ['이자가 붙는 곳', '원금에만', '원금 + 쌓인 이자'],
        ['10년 뒤 (100만 원, 연 10%)', '200만 원', '약 259만 원'],
      ],
    }]);

    expect(container.querySelector('table')).toHaveAccessibleName('단리와 복리 비교');
    expect([...container.querySelectorAll('thead th')].map(cell => cell.textContent)).toEqual(['구분', '단리', '복리']);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelector('th[scope="row"]')).toHaveTextContent('이자가 붙는 곳');
    expect([...rows[0].querySelectorAll('td')].map(cell => cell.textContent)).toEqual(['원금에만', '원금 + 쌓인 이자']);
  });

  it('뜻과 예를 첫 열로 옮겨 개념끼리 비교하고 원본 자료는 유지한다', () => {
    const visual: WordVisual = {
      type: 'table', title: '비슷한 개념', columns: ['개념', '뜻', '예'],
      rows: [
        ['범위의 경제', '여러 제품을 같이 만들면 따로 만들 때보다 쌈', '도축장의 고기·가죽'],
        ['수확체감', '단기에 노동만 늘리면 한계생산이 줄어듦', '좁은 주방의 요리사'],
      ],
    };
    const original = JSON.stringify(visual);
    const container = mount([visual]);
    expect([...container.querySelectorAll('thead th')].map(cell => cell.textContent)).toEqual(['개념', '범위의 경제', '수확체감']);
    const rows = container.querySelectorAll('tbody tr');
    expect([...rows[0].querySelectorAll('th, td')].map(cell => cell.textContent)).toEqual(['뜻', '여러 제품을 같이 만들면 따로 만들 때보다 쌈', '단기에 노동만 늘리면 한계생산이 줄어듦']);
    expect([...rows[1].querySelectorAll('th, td')].map(cell => cell.textContent)).toEqual(['예', '도축장의 고기·가죽', '좁은 주방의 요리사']);
    expect(JSON.stringify(visual)).toBe(original);
  });

  it('전체 단어의 표를 같은 구조로 보여주고 모든 제목과 셀 값을 보존한다', () => {
    const visuals = content.words.flatMap(word => (word.visuals ?? []) as WordVisual[])
      .filter((visual): visual is Extract<WordVisual, { type: 'table' }> => visual.type === 'table' && visual.title !== '햄버거 수요는 어떻게 움직일까');
    const container = mount(visuals);
    const tables = container.querySelectorAll('table');
    expect(tables).toHaveLength(visuals.length);
    tables.forEach((table, i) => {
      expect(table).toHaveAccessibleName(visuals[i].title);
      expect([...table.querySelectorAll('th, td')].map(cell => cell.textContent).sort()).toEqual([...visuals[i].columns, ...visuals[i].rows.flat()].sort());
      expect(table.querySelectorAll('tbody th[scope="row"]')).toHaveLength(table.querySelectorAll('tbody tr').length);
    });
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

  it('그래프 지점을 선택하면 해당 시점의 원본 값을 함께 보여준다', () => {
    const container = mount([{
      type: 'line', title: '이자 비교', unit: '만 원', x: ['0년', '1년', '2년'],
      series: [{ name: '단리', values: [100, 110, 120] }, { name: '복리', values: [100, 110, 121.5] }],
    }]);
    const slider = container.querySelector('input')!;
    expect(slider).toHaveAccessibleName('지점을 움직여 비교해 봐');
    expect(container.querySelector('.word-chart-values')).toHaveTextContent('2년단리120만 원복리121.5만 원');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(slider, '0');
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(slider).toHaveAttribute('aria-valuetext', '0년');
    expect(container.querySelector('.word-chart-values')).toHaveTextContent('0년단리100만 원복리100만 원');
  });

  it('여러 흐름도의 모든 단계와 조건을 클릭 없이 순서대로 읽을 수 있다', () => {
    const flows: WordVisual[] = [
      { type: 'flow', title: '금리 변화', steps: ['기준금리 ↑', '이자 부담 ↑', '소비 ↓'], caption: '다른 조건이 같을 때의 흐름이에요.' },
      { type: 'flow', title: '다른 경로', steps: ['채권 매입', '시중에 돈이 풀림'] },
    ];
    const container = mount(flows);
    expect([...container.querySelectorAll('.word-flow-step p')].map(p => p.textContent)).toEqual(['기준금리 ↑', '이자 부담 ↑', '소비 ↓', '채권 매입', '시중에 돈이 풀림']);
    expect(container.querySelectorAll('ol')).toHaveLength(2);
    expect(container).toHaveTextContent('다른 조건이 같을 때의 흐름이에요.');
    expect(container.querySelector('button')).toBeNull();
  });

  it('긴 설명의 문단 경계를 보존하고 문장을 생략하지 않는다', () => {
    const container = mount([{ type: 'text', title: '설명', body: '첫 번째 조건이에요.\n\n두 번째 결과예요.\n주의할 점도 있어요.' }]);
    expect([...container.querySelectorAll('.word-visual-paragraphs > p')].map(p => p.textContent)).toEqual(['첫 번째 조건이에요.', '두 번째 결과예요.', '주의할 점도 있어요.']);
  });
});

describe('보완재·대체재 수요 비교', () => {
  const visuals = (content.words.find(word => word.id === 241)!.visuals as WordVisual[])
    .filter(visual => visual.type === 'table');

  it('원본 순서를 바꾸지 않고 개념 비교를 사례보다 먼저 보여준다', () => {
    const original = JSON.stringify(visuals);
    const container = mount(visuals);
    expect([...container.querySelectorAll('h3')].map(heading => heading.textContent)).toEqual([
      '보완재와 대체재', '햄버거 수요는 어떻게 움직일까',
    ]);
    expect(JSON.stringify(visuals)).toBe(original);
  });

  it('가격을 바꾸면 두 상품의 수요·곡선 방향이 함께 바뀌고 선택을 되돌릴 수 있다', () => {
    const container = mount(visuals);
    const buttons = [...container.querySelectorAll<HTMLButtonElement>('.word-demand-price button')];
    const visibleResults = () => {
      const panels = [...container.querySelectorAll<HTMLElement>('.word-demand-results')].filter(panel => !panel.hidden);
      expect(panels).toHaveLength(1);
      expect(panels[0]).toBeVisible();
      return [...panels[0].querySelectorAll('.word-demand-result')].map(result => ({
        scenario: result.querySelector('h4')?.textContent,
        values: [...result.querySelectorAll('dd')].map(cell => cell.textContent),
      }));
    };
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'false');
    expect(visibleResults()).toEqual([
      { scenario: '콜라(보완재) 값 상승', values: ['↓ 감소', '왼쪽 이동'] },
      { scenario: '샌드위치(대체재) 값 상승', values: ['↑ 증가', '오른쪽 이동'] },
    ]);
    act(() => buttons[1].click());
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
    expect(visibleResults()).toEqual([
      { scenario: '콜라(보완재) 값 하락', values: ['↑ 증가', '오른쪽 이동'] },
      { scenario: '샌드위치(대체재) 값 하락', values: ['↓ 감소', '왼쪽 이동'] },
    ]);
    act(() => buttons[0].click());
    expect(visibleResults().map(result => result.scenario)).toEqual(['콜라(보완재) 값 상승', '샌드위치(대체재) 값 상승']);
  });

  it('가격 선택에 따라 수요곡선을 같은 기울기로 왼쪽·오른쪽 이동시킨다', () => {
    const container = mount(visuals);
    const assertShifts = (directions: number[]) => {
      const charts = container.querySelectorAll('.word-demand-results:not([hidden]) .word-demand-chart');
      expect(charts).toHaveLength(2);
      charts.forEach((chart, i) => {
        const before = chart.querySelector('.word-demand-curve-before')!;
        const after = chart.querySelector('.word-demand-curve-after')!;
        const leftShift = Number(after.getAttribute('x1')) - Number(before.getAttribute('x1'));
        const rightShift = Number(after.getAttribute('x2')) - Number(before.getAttribute('x2'));
        expect(Math.sign(leftShift)).toBe(directions[i]);
        expect(leftShift).toBe(rightShift);
        expect(after.getAttribute('y1')).toBe(before.getAttribute('y1'));
        expect(after.getAttribute('y2')).toBe(before.getAttribute('y2'));
        expect(chart).toHaveAccessibleName(/세로축은 햄버거 가격, 가로축은 햄버거 수량/);
      });
    };
    assertShifts([-1, 1]);
    act(() => container.querySelectorAll<HTMLButtonElement>('.word-demand-price button')[1].click());
    assertShifts([1, -1]);
  });
});

describe('설명 속 용어 연결', () => {
  it('본문 강조를 적용해도 관련 용어 설명과 카드 이동을 유지한다', () => {
    const onClick = vi.fn();
    const body = '단리는 복리와 달리 100만 원의 원금에만 이자가 붙어요.';
    const container = mount([{ type: 'text', title: '이자 계산', body }], {
      names: ['복리'], meaningOf: () => '이자에도 이자가 붙는 방식', onClick,
    }, '단리');
    expect(container.querySelector('p')?.textContent).toBe(body);
    expect(container.querySelector('.study-keyword')).toHaveTextContent('단리');
    expect(container.querySelector('.study-figure')).toHaveTextContent('100만 원');
    act(() => container.querySelector<HTMLButtonElement>('.word-term-button')!.click());
    expect(container.querySelector('.word-term-panel-meaning')).toHaveTextContent('이자에도 이자가 붙는 방식');
    act(() => container.querySelector<HTMLButtonElement>('.word-term-card-link')!.click());
    expect(onClick).toHaveBeenCalledWith('복리');
  });

  it('연결할 용어가 없는 상세 본문과 그래프 설명에도 강조를 적용한다', () => {
    const container = mount([
      { type: 'text', title: '', body: '단리로 2년간 600만 원을 받아요.' },
      { type: 'line', title: '증가', x: ['1년'], series: [{ name: '단리', values: [100] }], caption: '단리는 매년 10만 원씩 늘어요.' },
    ], undefined, '단리');
    expect(container.querySelectorAll('.study-keyword')).toHaveLength(2);
    expect([...container.querySelectorAll('.study-figure')].map(node => node.textContent)).toEqual(['2년', '600만 원', '10만 원']);
  });

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
    expect(container.querySelector('.word-term-panel-meaning')).toHaveTextContent('이 용어 설명은 준비 중이야.');
    expect(container.querySelector('.word-term-example')).toBeNull();
  });
});
