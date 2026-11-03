import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { logClick } from '../../lib/analytics';
import { ChevronRight } from '../ui/ControlIcons';
import { RotateCcw } from '../ui/OtterIcons';

// 주간 순위는 리그 화면에서 보여준다. 홈에는 오늘 할 복습 진입만 남긴다.
export const HomeOverview = () => {
  const navigate = useNavigate();
  const { hydrated, dueQueue } = useAppContext();
  const reviewPromptLoggedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || dueQueue.length === 0 || reviewPromptLoggedRef.current) return;
    reviewPromptLoggedRef.current = true;
    logClick('review_prompt_view', { count: dueQueue.length });
  }, [hydrated, dueQueue.length]);

  if (!hydrated || dueQueue.length === 0) return null;

  return (
    <div className="course-home-overview mx-5">
      <button
        type="button"
        aria-label={`오늘 다시 볼 용어 ${dueQueue.length}개 복습 시작`}
        onClick={() => { logClick('review_start', { count: dueQueue.length, source: 'home' }); navigate('/review'); }}
        className="home-review-entry flex w-full items-center gap-3 text-left active:opacity-70"
      >
        <span className="home-review-icon"><RotateCcw size={24} /></span>
        <span className="flex-1 min-w-0 text-sm font-semibold text-[var(--color-ink)]">오늘 다시 볼 용어 {dueQueue.length}개</span>
        <ChevronRight size={16} className="shrink-0 text-[var(--color-ink-3)]" />
      </button>
    </div>
  );
};
