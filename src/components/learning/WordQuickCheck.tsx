import { useEffect, useLayoutEffect, useRef } from 'react';
import type { QuizItem } from '../../lib/quiz';
import { keepShortUnitsTogether } from '../../lib/formatText';

export const WordQuickCheck = ({ question, meaning, selected, revealed, feedbackOnly = false, onSelect }: {
  question: QuizItem;
  meaning: string;
  selected: number | null;
  revealed: boolean;
  feedbackOnly?: boolean;
  onSelect: (index: number) => void;
}) => {
  const feedbackRef = useRef<HTMLHeadingElement>(null);
  const feedbackCardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!feedbackOnly) return;
    feedbackRef.current?.focus({ preventScroll: true });
  }, [feedbackOnly]);
  const answer = question.options.find(option => option.isCorrect)!;
  const correct = selected !== null && question.options[selected].isCorrect;
  useLayoutEffect(() => {
    const card = feedbackCardRef.current;
    if (!feedbackOnly || !card) return;
    const fitToText = () => {
      card.style.width = '';
      const availableWidth = card.getBoundingClientRect().width;
      if (!availableWidth) return;
      const style = getComputedStyle(card);
      let textWidth = 0;
      // 균등 줄바꿈 후 실제로 표시된 가장 긴 줄에 말풍선 폭을 맞춘다.
      for (const child of card.children) {
        const range = document.createRange();
        range.selectNodeContents(child);
        const left = child.getBoundingClientRect().left;
        for (const rect of range.getClientRects()) textWidth = Math.max(textWidth, rect.right - left);
      }
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
      card.style.width = `${Math.min(availableWidth, Math.ceil(textWidth + padding + border))}px`;
    };
    fitToText();
    window.addEventListener('resize', fitToText);
    document.fonts?.addEventListener('loadingdone', fitToText);
    return () => {
      window.removeEventListener('resize', fitToText);
      document.fonts?.removeEventListener('loadingdone', fitToText);
    };
  }, [feedbackOnly, question, meaning, correct]);
  if (feedbackOnly) return <section className="word-feedback-scene" aria-label="정답과 해설">
      <div ref={feedbackCardRef} className="word-check-feedback word-check-feedback-page">
        <h1 ref={feedbackRef} tabIndex={-1} className="type-page-title">{correct ? '정답. 제법인데?' : '오답. 자신감은 정답이었는데.'}</h1>
        {!correct && <p className="type-reading"><strong className="type-emphasis">정답</strong> · {answer.label}</p>}
        <p className="type-reading">{keepShortUnitsTogether(question.explanation ?? meaning)}</p>
      </div>
      <img className="word-feedback-otter" src={`/otter/v5/otter-${correct ? 'cheer' : 'explain'}.svg`} alt="" aria-hidden="true" width={144} height={144} />
    </section>;
  return <section className="word-quick-check" aria-label="단어 확인 문제">
    <header>
      <h1 className="type-section-title">{question.type === 'word_to_meaning' ? `${question.promptMain}의 뜻은?` : keepShortUnitsTogether(question.promptMain)}</h1>
      <p className="type-supporting">{revealed ? '다음에서 해설을 확인해봐.' : '알맞은 답을 하나 골라줘.'}</p>
    </header>
    <div className="word-check-options" role="group" aria-label="답 고르기">
      {question.options.map((option, index) => <button
        key={index}
        type="button"
        aria-label={option.label}
        aria-pressed={selected === index}
        disabled={revealed}
        data-result={revealed ? option.isCorrect ? 'correct' : selected === index ? 'wrong' : undefined : undefined}
        onClick={() => onSelect(index)}
      >
        <span className="word-check-number" aria-hidden="true">{index + 1}</span>
        <span className="word-check-option-label">{keepShortUnitsTogether(option.label)}</span>
        {(selected === index || (revealed && option.isCorrect)) && <span className="word-check-result-label">{revealed ? option.isCorrect ? '정답' : '내 선택' : '선택'}</span>}
      </button>)}
    </div>

  </section>;
};
