import { Check, X } from '../ui/OtterIcons';
import { ActionButton } from '../ui/ActionButton';
import { keepShortUnitsTogether } from '../../lib/formatText';

export const QuizAnswerFeedback = ({ correct, title, answerLabel, word, meaning, explanation, example,
  pending, submissionMessage, earned, capped, combo, nextLabel, onNext }: {
  correct: boolean; title: string; answerLabel: string; word: string; meaning: string;
  explanation?: string; example?: string; pending: boolean; submissionMessage: string | null;
  earned: number; capped: boolean; combo: number; nextLabel: string; onNext: () => void;
}) => {
  const hypothetical = /^\s*학습용 가정\s*:/.test(example ?? '');
  const exampleText = example?.replace(/^\s*학습용 가정\s*:\s*/, '').trim();
  const copy = explanation?.trim() || (answerLabel === meaning ? '' : meaning);
  return (
    <aside className={`quiz-answer-feedback ${correct ? 'quiz-feedback-sheet' : 'quiz-feedback-inline'}`} data-correct={correct} aria-label="답안 확인">
      <div className="quiz-answer-heading" role="status" aria-live="polite">
        <span className="quiz-answer-mark">{correct ? <Check size={20} /> : <X size={20} />}</span>
        <h2>{title}</h2>
        {correct && (capped || earned > 0 || combo >= 3) && <span className="quiz-answer-reward">
          {capped ? '한도 도달' : earned > 0 ? `+${earned}개` : null}{combo >= 3 && <span>{combo}연속</span>}
        </span>}
      </div>
      <div className="quiz-answer-content">
        <div className="quiz-answer-result"><span>정답</span><strong>{keepShortUnitsTogether(answerLabel)}</strong></div>
        {answerLabel !== word && <p className="quiz-answer-term">확인한 용어 · {word}</p>}
        {copy && <div className="quiz-answer-explanation"><h3>{explanation?.trim() ? '풀이' : '핵심 뜻'}</h3><p>{keepShortUnitsTogether(copy)}</p></div>}
        {exampleText && <details className="quiz-answer-example" onToggle={event => { if (event.currentTarget.open) event.currentTarget.scrollIntoView?.({ block: 'nearest' }); }}><summary>예시로 다시 보기{hypothetical && <span>학습용 가정</span>}</summary><p>{keepShortUnitsTogether(exampleText)}</p></details>}
        {submissionMessage && <p className="quiz-answer-network" role="alert">{submissionMessage}</p>}
      </div>
      <ActionButton fullWidth onClick={onNext} disabled={pending} aria-busy={pending}>{pending ? '답안 확인 중...' : nextLabel}</ActionButton>
    </aside>
  );
};
