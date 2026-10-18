import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WordMeaningCard } from './WordMeaningCard';
import { QuizAnswerFeedback } from './QuizAnswerFeedback';
import type { Word } from '../../types';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = async (element: React.ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => { root.render(element); });
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};
const word: Word = { id: 1, word: '기회비용', meaning: '선택하면서 포기한 것 중 가장 큰 가치', detailedMeaning: '자세한 설명', learningExample: '학습용 가정: 영화 대신 일하면 10,000 원을 벌 수 있어요.', newsExample: '', hint: '', difficulty: 1 };

describe('뜻과 생활 예시', () => {
  it('핵심 뜻과 가상 예시를 구분하고 출처와 상세 보기 기능을 보존한다', async () => {
    const onDetail = vi.fn();
    const original = JSON.stringify(word);
    const container = await mount(<WordMeaningCard word={word} sources={['한국은행 경제금융용어 800선']} onDetail={onDetail} />);
    expect(container.querySelector('h1')).toHaveTextContent('기회비용');
    expect(container.querySelector('.word-meaning-definition')).toHaveTextContent(word.meaning);
    expect(container.querySelector('.word-meaning-example-heading')).toHaveTextContent('학습용 가정');
    expect(container.querySelector('.word-meaning-example > p')).not.toHaveTextContent('학습용 가정:');
    expect(container.querySelector('.word-meaning-example > p')).toHaveTextContent('10,000 원');
    expect(container).toHaveTextContent('한국은행 경제금융용어 800선 참고');
    await act(async () => { container.querySelector<HTMLButtonElement>('button')!.click(); });
    expect(onDetail).toHaveBeenCalledOnce();
    expect(JSON.stringify(word)).toBe(original);
  });
  it('자료가 없을 때 예시·출처·상세 버튼을 임의로 만들지 않는다', async () => {
    const container = await mount(<WordMeaningCard word={{ ...word, learningExample: undefined }} />);
    expect(container.querySelector('.word-meaning-example')).toBeNull();
    expect(container.querySelector('.word-meaning-source')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
  });
});

describe('정답과 풀이', () => {
  const props = { correct: false, title: '정답을 확인해요', answerLabel: '포기한 것 중 가장 큰 가치', word: '기회비용', meaning: word.meaning, explanation: '선택 때문에 포기한 가치 중 가장 큰 것을 비교해요.', example: word.learningExample, pending: false, submissionMessage: null, earned: 0, capped: false, combo: 0, nextLabel: '다음 문제', onNext: vi.fn() };
  it('직접 작성 문제의 정답 보기와 기존 풀이를 보여준다', async () => {
    const container = await mount(<QuizAnswerFeedback {...props} />);
    expect(container.querySelector('.quiz-answer-result')).toHaveTextContent(`정답${props.answerLabel}`);
    expect(container.querySelector('.quiz-answer-explanation')).toHaveTextContent(`풀이${props.explanation}`);
    expect(container.querySelector('summary')).toHaveTextContent('예시로 다시 보기학습용 가정');
    expect(container.querySelector('.quiz-answer-reward')).toBeNull();
  });
  it('정답 보기가 뜻 그 자체면 같은 뜻을 반복하지 않는다', async () => {
    const container = await mount(<QuizAnswerFeedback {...props} answerLabel={word.meaning} explanation={undefined} />);
    expect(container.querySelector('.quiz-answer-explanation')).toBeNull();
    expect(container).toHaveTextContent('확인한 용어 · 기회비용');
  });
  it('예시를 펼치면 내용이 내부 스크롤 아래에 숨지 않도록 읽기 위치를 옮긴다', async () => {
    const container = await mount(<QuizAnswerFeedback {...props} />);
    const details = container.querySelector('details')!;
    const scrollIntoView = vi.fn();
    details.scrollIntoView = scrollIntoView;
    await act(async () => { details.open = true; details.dispatchEvent(new Event('toggle')); });
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  });
  it('응답 대기에는 이동을 막고 서버에서 받은 조개만 표시한다', async () => {
    const container = await mount(<QuizAnswerFeedback {...props} correct earned={15} combo={3} pending />);
    expect(container.querySelector('.quiz-answer-reward')).toHaveTextContent('+15개3연속');
    expect(container.querySelector('button')).toBeDisabled();
    expect(container.querySelector('button')).toHaveTextContent('답안 확인 중...');
  });
});
