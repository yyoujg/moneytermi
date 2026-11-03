import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Word } from '../types';
import { lessonChecks } from '../lib/quiz';
import { logClick } from '../lib/analytics';
import { Card } from '../components/ui/Card';
import { ActionButton } from '../components/ui/ActionButton';
import { Check } from '../components/ui/OtterIcons';

// 레슨을 시작하기 전에 배울 용어와 진행 순서를 먼저 보여준다.
const LessonIntroScreen = () => {
  const navigate = useNavigate();
  const state = useLocation().state as {
    courseTitle?: string;
    words?: Word[];
    warmupCount?: number;
    nodeId?: string;
    courseId?: string;
    next?: { pathname: string; state: unknown };
  } | null;
  const next = state?.next;
  useEffect(() => { if (!next) navigate('/course', { replace: true }); }, [navigate, next]);
  if (!next) return null;

  const words = state?.words ?? [];
  const warmupCount = state?.warmupCount ?? 0;
  const steps = [
    ...(warmupCount > 0 ? [{ title: '가볍게 다시 보기', detail: `지난 용어 ${warmupCount}개` }] : []),
    { title: '용어 살펴보기', detail: `새 용어 ${words.length}개` },
    { title: lessonChecks(words).length > 0 ? '상황 문제로 이해 확인' : '용어 퀴즈로 확인', detail: '틀린 문제는 한 번 더 풀어요' },
  ];

  return (
    <div className="lesson-intro-screen app-soft-screen flex h-full flex-col">
      <main className="lesson-complete-content">
        {state?.courseTitle && <p className="lesson-complete-overline">{state.courseTitle}</p>}
        <h1 className="type-result-title mt-1!">새 용어 {words.length}개를 배워요</h1>

        <Card className="mt-6 border-b border-[var(--color-line)]">
          <h2 className="type-section-title">배울 용어</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {words.map(word => (
              <li key={word.id} className="flex items-center gap-3 type-item-title">
                <span aria-hidden="true" className="lesson-intro-check"><Check size={16} strokeWidth={3} /></span>
                <span className="min-w-0 break-keep">{word.word}</span>
              </li>
            ))}
          </ul>
        </Card>

        <section className="mt-8" aria-labelledby="lesson-intro-steps">
          <h2 id="lesson-intro-steps" className="type-section-title">진행 순서</h2>
          <ol className="mt-3 flex flex-col gap-2">
            {steps.map((step, index) => (
              <li key={step.title} className="lesson-intro-step">
                <span className="lesson-intro-step-number">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block type-item-title">{step.title}</span>
                  <span className="block type-supporting">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="lesson-result-footer">
        <ActionButton fullWidth onClick={() => {
          logClick('lesson_intro_start', { course_id: state?.courseId, node_id: state?.nodeId, total: words.length });
          navigate(next.pathname, { state: next.state, replace: true });
        }}>
          시작하기
        </ActionButton>
      </footer>
    </div>
  );
};

export default LessonIntroScreen;
