import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Word } from '../types';
import { logClick } from '../lib/analytics';
import { LoadingScreen } from '../components/LoadingScreen';

// 처음 여는 레슨은 미리보기 화면 대신 수달 로딩을 잠깐 보여주고 바로 학습으로 넘어간다
export const LESSON_INTRO_MS = 1400;

const LessonIntroScreen = () => {
  const navigate = useNavigate();
  const state = useLocation().state as {
    words?: Word[];
    nodeId?: string;
    courseId?: string;
    next?: { pathname: string; state: unknown };
  } | null;
  const next = state?.next;
  const total = state?.words?.length ?? 0;

  useEffect(() => {
    if (!next) { navigate('/course', { replace: true }); return; }
    const t = setTimeout(() => {
      logClick('lesson_intro_start', { course_id: state?.courseId, node_id: state?.nodeId, total });
      navigate(next.pathname, { state: next.state, replace: true });
    }, LESSON_INTRO_MS);
    return () => clearTimeout(t);
  }, [navigate, next, state?.courseId, state?.nodeId, total]);

  if (!next) return null;
  return <LoadingScreen delayMs={0} message={total > 0 ? `새 용어 ${total}개 준비 중` : undefined} />;
};

export default LessonIntroScreen;
