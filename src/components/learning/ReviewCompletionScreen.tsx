import { useEffect, useRef } from 'react';
import { DailyAlarmPromptCard } from '../DailyAlarmPromptCard';
import { Mascot } from '../Mascot';
import { PointIcon } from '../StatIcons';
import { StreakCelebration } from '../StreakCelebration';
import { ActionButton } from '../ui/ActionButton';
import { BookOpenText, Lightbulb, ListChecks } from '../ui/OtterIcons';

// 복습 결과와 잔액은 전달받은 실제 값을 표시한다. 보상 계산·재출제는 이 화면에서 하지 않는다.
export const ReviewCompletionScreen = ({ initialTotal, firstCorrect, points, note, onAction }: {
  initialTotal: number;
  firstCorrect: number;
  points: number;
  note: string;
  onAction: () => void;
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);

  return (
    <div className="review-complete-screen app-soft-screen">
      <main className="review-complete-content">
        <header className="review-complete-hero">
          <p className="review-complete-overline"><BookOpenText size={26} />오늘의 복습</p>
          <div className="review-complete-mascot"><Mascot name="crown" size={124} /></div>
          <h1 ref={headingRef} tabIndex={-1}>오늘 복습을 마쳤어요</h1>
          <p className="review-complete-subtitle">수달과 함께, 오늘도 한 걸음.</p>
        </header>

        <section className="review-complete-summary" aria-label={`첫 시도 ${initialTotal}문제 중 ${firstCorrect}개 정답`}>
          <div className="review-complete-summary-heading"><h2>이번 복습 기록</h2><ListChecks size={28} /></div>
          <dl className="review-complete-stats">
            <div><dt>다시 본 문제</dt><dd data-review-total><strong>{initialTotal}</strong><span>문제</span></dd></div>
            <div><dt>첫 시도 정답</dt><dd data-review-correct><strong>{firstCorrect}</strong><span>개</span></dd></div>
          </dl>
          <div className="review-complete-note"><Lightbulb size={30} /><p>{note}</p></div>
        </section>

        <section className="review-complete-wallet" aria-label={`보유 조개 ${points}개`}>
          <PointIcon size={36} />
          <div className="review-complete-wallet-label"><h2>보유 조개</h2><p>지금 가지고 있는 조개예요</p></div>
          <p className="review-complete-balance" data-review-balance><strong>{points}</strong><span>개</span></p>
        </section>

        <div className="review-complete-extras"><DailyAlarmPromptCard /><StreakCelebration /></div>
      </main>
      <footer className="review-complete-footer"><ActionButton fullWidth size="lg" onClick={onAction}>학습 홈으로</ActionButton></footer>
    </div>
  );
};
