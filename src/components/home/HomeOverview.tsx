import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { logClick } from '../../lib/analytics';
import { ActionButton } from '../ui/ActionButton';

// 복습할 용어가 있으면 홈의 주 버튼은 복습이다. 없으면 아무것도 그리지 않는다.
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
    <ActionButton
      fullWidth
      aria-label={`오늘 다시 볼 용어 ${dueQueue.length}개 복습 시작`}
      onClick={() => { logClick('review_start', { count: dueQueue.length, source: 'home' }); navigate('/review'); }}
      className="course-home-primary"
    >
      오늘 다시 볼 용어 {dueQueue.length}개 복습하기
    </ActionButton>
  );
};
