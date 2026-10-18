import { useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw } from '../ui/ControlIcons';
import { praiseForQuiz } from '../../lib/praise';
import { Mascot } from '../Mascot';
import { ActionButton } from '../ui/ActionButton';

export const LessonCheckSummary = ({ correct, total, reviewCount, onRetry, onBack }: {
  correct: number;
  total: number;
  reviewCount: number;
  onRetry: () => void;
  onBack: () => void;
}) => {
  const accuracy = total > 0 ? Math.round(correct / total * 100) : 0;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);
  return (
    <div data-lesson-check-complete className="lesson-check-screen lesson-complete-screen app-soft-screen">
      <main className="lesson-complete-content">
        <p className="lesson-complete-overline">학습 결과</p>
        <div className="lesson-complete-hero">
          <Mascot name={reviewCount === 0 ? 'great' : 'empty'} size={128} />
          <h1 ref={headingRef} tabIndex={-1}>이해 확인 완료!</h1>
          <p>{reviewCount === 0 ? '방금 배운 내용을 한 번 더 확인했어요.' : '헷갈린 문제만 한 번 더 살펴볼까요?'}</p>
        </div>

        <section data-lesson-check-summary className="lesson-complete-summary" aria-label="이번 이해 확인 결과">
          <div className="lesson-complete-summary-heading">
            <h2>이번 이해 확인</h2>
            <span>정답률 {accuracy}%</span>
          </div>
          <p className="lesson-complete-score"><strong>{correct}</strong><span>/ {total}</span></p>
          <p className="lesson-complete-score-caption">{total}문제 중 {correct}개 정답</p>
          <div role="progressbar" aria-label="이해 확인 정답률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={accuracy} className="lesson-complete-score-track">
            <span style={{ width: `${accuracy}%` }} />
          </div>
          <p className="lesson-complete-note">{praiseForQuiz({ accuracy, maxCombo: correct, total })}</p>
        </section>

        {reviewCount > 0 && <p className="lesson-complete-review"><RotateCcw size={16} aria-hidden="true" />다시 확인할 문제 {reviewCount}개</p>}
      </main>

      <footer className="lesson-result-footer">
        {reviewCount > 0 ? <>
          <ActionButton fullWidth onClick={onRetry}><RotateCcw size={18} aria-hidden="true" />틀린 문제 다시 풀기</ActionButton>
          <ActionButton tone="soft" fullWidth onClick={onBack}>코스로 돌아가기<ArrowRight size={18} aria-hidden="true" /></ActionButton>
        </> : <ActionButton fullWidth onClick={onBack}>코스로 돌아가기<ArrowRight size={18} aria-hidden="true" /></ActionButton>}
      </footer>
    </div>
  );
};
