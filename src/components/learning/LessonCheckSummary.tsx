import { useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw } from '../ui/ControlIcons';
import { praiseForQuiz } from '../../lib/praise';
import { Mascot } from '../Mascot';
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
  const currentLabel = retryRound > 0 ? `틀린 문제 재도전 ${retryRound}차` : '첫 풀이';
  return (
    <div data-lesson-check-complete className="lesson-check-screen lesson-complete-screen app-soft-screen">
      <main className="lesson-complete-content">
        <p className="lesson-complete-overline">학습 결과</p>
        <div className="lesson-complete-hero">
          <Mascot name={reviewCount === 0 ? 'great' : 'empty'} size={128} />
          <h1 ref={headingRef} tabIndex={-1}>{currentLabel} 완료!</h1>
          <p>{reviewCount === 0 ? (retryRound > 0 ? '헷갈렸던 문제를 모두 확인했어요.' : '방금 배운 내용을 한 번 더 확인했어요.') : '헷갈린 문제만 한 번 더 살펴볼까요?'}</p>
        </div>

        {retryRound > 0 && <section data-lesson-check-first-result className="lesson-complete-summary mb-3" aria-label="첫 풀이 결과">
          <div className="lesson-complete-summary-heading">
            <h2>첫 풀이</h2>
            <span>정답률 {accuracyFor(firstResult)}%</span>
          </div>
          <p className="mt-2 text-sm text-[var(--color-ink-2)]">{firstResult.total}문제 중 {firstResult.correct}개 정답</p>
          <p className="mt-1 text-xs text-[var(--color-ink-3)]">재도전 점수와 별도로 보존한 결과예요.</p>
        </section>}

        <section data-lesson-check-summary className="lesson-complete-summary" aria-label={`${currentLabel} 결과`}>
          <div className="lesson-complete-summary-heading">
            <h2>{currentLabel}{retryRound > 0 ? ' · 이번 결과' : ''}</h2>
            <span>정답률 {accuracy}%</span>
          </div>
          <p className="lesson-complete-score"><strong>{correct}</strong><span>/ {total}</span></p>
          <p className="lesson-complete-score-caption">{total}문제 중 {correct}개 정답</p>
          <div role="progressbar" aria-label={`${currentLabel} 정답률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={accuracy} className="lesson-complete-score-track">
            <span style={{ width: `${accuracy}%` }} />
          </div>
          <p className="lesson-complete-note">{praiseForQuiz({ accuracy, maxCombo: correct, total })}</p>
        </section>

        {retryRound > 1 && <section className="lesson-complete-summary mt-3" aria-label="이전 재도전 결과">
          <div className="lesson-complete-summary-heading"><h2>이전 재도전</h2></div>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[var(--color-ink-2)]">
            {results.slice(1, -1).map((result, index) => <li key={index}>
              재도전 {index + 1}차 · {result.total}문제 중 {result.correct}개 정답 · 정답률 {accuracyFor(result)}%
            </li>)}
          </ul>
        </section>}

        {reviewCount > 0 && <p className="lesson-complete-review"><RotateCcw size={16} aria-hidden="true" />다시 확인할 문제 {reviewCount}개</p>}
      </main>

      <footer className="lesson-result-footer">
        {reviewCount > 0 ? <>
          <ActionButton fullWidth onClick={onRetry}><RotateCcw size={18} aria-hidden="true" />틀린 문제 다시 풀기</ActionButton>
          <ActionButton tone="soft" fullWidth onClick={onBack}>코스로 돌아가기<ArrowRight size={18} aria-hidden="true" /></ActionButton>
        </> : <ActionButton fullWidth onClick={onBack}>다음 학습 선택하기<ArrowRight size={18} aria-hidden="true" /></ActionButton>}
      </footer>
    </div>
  );
};
