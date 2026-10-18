import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, ChevronDown } from '../ui/ControlIcons';
import type { QuizItem } from '../../lib/quiz';
import { keepShortUnitsTogether } from '../../lib/formatText';
import { OTTER_FEEDBACK_IMAGES } from '../../lib/otter';
import { ActionButton } from '../ui/ActionButton';

export const LessonCheckFeedback = ({ question, selected, number, total, onNext }: {
  question: QuizItem;
  selected: number;
  number: number;
  total: number;
  onNext: () => void;
}) => {
  const [showChoices, setShowChoices] = useState(false);
  const choicesId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);
  const answer = question.options.find(option => option.isCorrect)!;
  const chosen = question.options[selected];
  const correct = chosen.isCorrect;

  return (
    <div className="lesson-check-screen lesson-feedback-screen app-soft-screen">
      <header className="lesson-feedback-header">
        <div className="lesson-feedback-header-row"><span>이해 확인</span><span>{number}/{total}</span></div>
        <div role="progressbar" aria-label="이해 확인 진행률" aria-valuemin={0} aria-valuemax={total} aria-valuenow={number} className="lesson-feedback-progress">
          <span style={{ width: `${number / total * 100}%` }} />
        </div>
      </header>

      <main className="lesson-feedback-content">
        <div className="lesson-feedback-intro">
          <img
            className="lesson-feedback-character"
            src={correct ? OTTER_FEEDBACK_IMAGES.correct : OTTER_FEEDBACK_IMAGES.wrong}
            alt={correct ? '정답을 알리는 O 포즈 수달' : '오답을 알리는 X 포즈 수달'}
            width={96}
            height={96}
          />
          <div>
            <h1 ref={headingRef} tabIndex={-1}>{correct ? '맞았어요!' : '아쉬워요, 오답이에요'}</h1>
            <p>{correct ? '정답을 고른 이유도 확인해 보세요.' : '내 선택과 정답을 비교해 보세요.'}</p>
          </div>
        </div>

        <section className="lesson-feedback-card" data-lesson-check-feedback={correct ? 'correct' : 'wrong'} aria-label="정답과 해설">
          <p className="lesson-feedback-label">이번 상황</p>
          <h2 className="lesson-feedback-question">{keepShortUnitsTogether(question.promptMain)}</h2>

          <div role="group" aria-label={`${answer.label}, 정답`} data-lesson-check-result="correct" className="lesson-feedback-answer">
            <div className="min-w-0">
              <p className="lesson-feedback-label">정답</p>
              <p className="lesson-feedback-answer-value">{keepShortUnitsTogether(answer.label)}</p>
            </div>
          </div>

          {!correct && (
            <div role="group" aria-label={`${chosen.label}, 내가 고른 답`} data-lesson-check-result="wrong" className="lesson-feedback-my-answer">
              <span>내 선택</span>
              <strong>{keepShortUnitsTogether(chosen.label)}</strong>
            </div>
          )}

          <div className="lesson-feedback-reason">
            <h3>이렇게 이해해요</h3>
            <p>{keepShortUnitsTogether(question.explanation ?? '')}</p>
          </div>

          <div className="lesson-feedback-review">
            <button type="button" className="lesson-feedback-disclosure" aria-expanded={showChoices} aria-controls={showChoices ? choicesId : undefined} onClick={() => setShowChoices(value => !value)}>
              {showChoices ? '다른 보기 접기' : '다른 보기 확인하기'}
              <ChevronDown size={18} className={showChoices ? 'is-open' : ''} aria-hidden="true" />
            </button>
            {showChoices && (
              <ol id={choicesId} className="lesson-feedback-options" aria-label="문제의 모든 보기">
                {question.options.map((option, index) => {
                  const wrongChoice = index === selected && !option.isCorrect;
                  return (
                    <li key={index} data-lesson-option-state={option.isCorrect ? 'correct' : wrongChoice ? 'wrong' : 'neutral'} className={option.isCorrect ? 'is-correct' : wrongChoice ? 'is-wrong' : ''}>
                      <span className="lesson-feedback-option-marker" aria-hidden="true">{index + 1}</span>
                      <span className="min-w-0 flex-1">{keepShortUnitsTogether(option.label)}</span>
                      {(option.isCorrect || wrongChoice) && <span className="lesson-feedback-option-state">{option.isCorrect ? '정답' : '내 선택'}</span>}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </section>
      </main>

      <footer className="lesson-result-footer">
        <ActionButton fullWidth onClick={onNext}>{number === total ? '결과 보기' : '다음 문제'}<ArrowRight size={18} aria-hidden="true" /></ActionButton>
      </footer>
    </div>
  );
};
