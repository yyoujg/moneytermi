import { useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw } from '../ui/ControlIcons';
import { praiseForQuiz } from '../../lib/praise';
import { ActionButton } from '../ui/ActionButton';

export type LessonCheckRoundResult = { correct: number; total: number };
const accuracyFor = ({ correct, total }: LessonCheckRoundResult) => total > 0 ? Math.round(correct / total * 100) : 0;

export const LessonCheckSummary = ({ results, reviewCount, onRetry, onBack }: {
  results: LessonCheckRoundResult[];
  reviewCount: number;
  onRetry: () => void;
  onBack: () => void;
}) => {
  const firstResult = results[0];
  const currentResult = results[results.length - 1];
  const retryRound = results.length - 1;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);
  if (!firstResult || !currentResult) return null;
  const { correct, total } = currentResult;
  const accuracy = accuracyFor(currentResult);
  const currentLabel = retryRound > 0 ? '다시 풀기' : '첫 풀이';
  const title = reviewCount > 0 ? '틀린 문제를 다시 풀어볼까요?' : accuracy === 100 ? (retryRound > 0 ? '틀린 문제를 모두 맞혔어요!' : '모두 맞혔어요!') : '이해 확인을 마쳤어요';
  return (
    <div data-lesson-check-complete className="lesson-check-screen lesson-complete-screen app-soft-screen">
      <main className="lesson-complete-content">
        <p className="lesson-complete-overline">학습 결과</p>
        <div className="lesson-complete-hero">
          <h1 ref={headingRef} tabIndex={-1}>{title}</h1>
        </div>

        {/* 점수는 큰 숫자 하나로만 보여주고, 다시 풀었을 때 첫 풀이는 한 줄로 남긴다 */}
        <section data-lesson-check-summary className="lesson-complete-summary" aria-label={`${currentLabel} 결과`}>
          <div className="lesson-complete-summary-heading">
            <h2>{currentLabel}</h2>
            {retryRound > 0 && <span data-lesson-check-first-result>첫 풀이 {firstResult.correct}/{firstResult.total}</span>}
          </div>
          <p className="lesson-complete-score"><strong>{correct}</strong><span>/ {total}</span></p>
          <div role="progressbar" aria-label={`${currentLabel} 정답률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={accuracy} className="lesson-complete-score-track">
            <span style={{ width: `${accuracy}%` }} />
          </div>
          <p className="lesson-complete-note">{praiseForQuiz({ accuracy, maxCombo: correct, total })}</p>
        </section>
      </main>

      <footer className="lesson-result-footer">
        {reviewCount > 0 ? <>
          <ActionButton fullWidth onClick={onRetry}><RotateCcw size={20} aria-hidden="true" />틀린 문제 다시 풀기</ActionButton>
          <ActionButton tone="soft" fullWidth onClick={onBack}>코스로 돌아가기<ArrowRight size={20} aria-hidden="true" /></ActionButton>
        </> : <ActionButton fullWidth onClick={onBack}>코스에서 이어 하기<ArrowRight size={20} aria-hidden="true" /></ActionButton>}
      </footer>
    </div>
  );
};
