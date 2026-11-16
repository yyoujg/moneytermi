import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StudyText } from './StudyText';

const render = (text: string, word: string) => {
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(<StudyText text={text} word={word} />);
  return container;
};

describe('학습 문장 강조', () => {
  it('금액·소수 비율·기간을 단위까지 표시하고 원문과 계산식을 보존한다', () => {
    const text = '100만\u00a0원을 연 3.5% 단리로 2년 맡겨요. 1만 7천 원 + 1만 1,000원 = 28,000원이에요.';
    const container = render(text, '단리');
    expect(container.textContent).toBe(text);
    expect([...container.querySelectorAll('.study-figure')].map(node => node.textContent))
      .toEqual(['100만\u00a0원', '3.5%', '2년', '1만 7천 원', '1만 1,000원', '28,000원']);
    expect(container.querySelector('mark')).toHaveTextContent('단리');
  });

  it('현재 용어의 약어도 찾되 같은 문장에서 하이라이트를 반복하지 않는다', () => {
    const text = 'GDP는 국내총생산을 뜻해요. GDP를 비교해요.';
    const container = render(text, '국내총생산(GDP)');
    expect(container.textContent).toBe(text);
    expect(container.querySelectorAll('mark')).toHaveLength(1);
    expect(container.querySelector('mark')).toHaveTextContent('GDP');
  });

  it('일반 문장과 HTML처럼 보이는 원문은 그대로 읽을 수 있게 출력한다', () => {
    const text = '<b>비교</b>할 때 조건을 확인해요. 72 ÷ 6 = 12';
    const container = render(text, '단리');
    expect(container.textContent).toBe(text);
    expect(container.querySelector('b, mark, strong')).toBeNull();
  });
});
