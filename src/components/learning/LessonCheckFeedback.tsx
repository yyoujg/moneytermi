import { useEffect, useRef } from 'react';
import { ArrowRight } from '../ui/ControlIcons';
import type { QuizItem } from '../../lib/quiz';
import { keepShortUnitsTogether } from '../../lib/formatText';
import { ActionButton } from '../ui/ActionButton';

export const LessonCheckFeedback = ({ question, selected, number, total, onNext }: {
  question: QuizItem;
  selected: number;
  number: number;
  total: number;
  onNext: () => void;
}) => {
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
          <div>
            <h1 ref={headingRef} tabIndex={-1}>{correct ? '정답! 감 잡았네' : '아깝다! 정답을 같이 보자'}</h1>
            <p>{correct ? '왜 맞는지도 알면 더 확실해져.' : '내 답이랑 어디가 다른지 짚어보자.'}</p>
          </div>
        </div>

        <section className="lesson-feedback-card" data-lesson-check-feedback={correct ? 'correct' : 'wrong'} aria-label="정답과 해설">
          <div className="lesson-feedback-situation">
            <p className="lesson-feedback-label">이번 상황</p>
            <h2 className="lesson-feedback-question">{keepShortUnitsTogether(question.promptMain)}</h2>
          </div>

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
            <h3>핵심은 이거야</h3>
            <p>{keepShortUnitsTogether(question.explanation ?? '')}</p>
          </div>
        </section>
      </main>

      <footer className="lesson-result-footer">
        <ActionButton fullWidth onClick={onNext}>{number === total ? '결과 보기' : '다음 문제'}<ArrowRight size={20} aria-hidden="true" /></ActionButton>
      </footer>
    </div>
  );
};
