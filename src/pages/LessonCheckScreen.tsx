import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Word } from '../types';
import { buildCustomQuizItem, lessonChecks } from '../lib/quiz';
import { feedbackCorrect, feedbackWrong } from '../lib/feedback';
import { logClick } from '../lib/analytics';
import { Card } from '../components/ui/Card';
import { Mascot } from '../components/Mascot';
import { LessonCheckFeedback } from '../components/learning/LessonCheckFeedback';
import { LessonCheckSummary } from '../components/learning/LessonCheckSummary';
import { keepShortUnitsTogether } from '../lib/formatText';

const LessonCheckScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { words?: Word[]; backPath?: string; courseId?: string; nodeId?: string } | null;
  const backPath = state?.backPath ?? '/course';
  const [questions, setQuestions] = useState(() => lessonChecks(state?.words ?? []).map(({ word, quiz }) => ({ ...buildCustomQuizItem(quiz), wordId: word.id })));
  const [attempt, setAttempt] = useState(1);
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current || questions.length === 0) return;
    startedRef.current = true;
    logClick('lesson_check_start', { course_id: state?.courseId, node_id: state?.nodeId, total: questions.length });
  }, [questions.length, state?.courseId, state?.nodeId]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<typeof questions>([]);
  const question = questions[index];

  if (questions.length === 0) {
    const hasLesson = Boolean(state?.words?.length);
    return (
      <div className="lesson-check-screen app-soft-screen flex h-full flex-col items-center justify-center gap-4 px-5 text-center">
        <Mascot name="empty" size={110} />
        <h1 className="mt-1 text-xl font-bold text-[var(--color-ink)]">{hasLesson ? '이번 레슨에는 이해 확인 문제가 없어요' : '자주 마주치는 용어부터 시작해요'}</h1>
        <p className="text-[15px] text-[var(--color-ink-2)] break-keep">{hasLesson ? '다음 학습을 선택할 수 있어요.' : '용어를 하나 익히면 이해 확인 문제를 풀 수 있어요.'}</p>
        <button onClick={() => navigate('/course', { replace: true })} className="mt-3 w-full min-h-[52px] rounded-button bg-brand-500 text-base font-bold text-white">
          {hasLesson ? '다음 학습 선택하기' : '학습 시작하기'}
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <LessonCheckSummary
        correct={questions.length - mistakes.length}
        total={questions.length}
        reviewCount={mistakes.length}
        onRetry={() => { setQuestions(mistakes); setMistakes([]); setIndex(0); setSelected(null); setAttempt(value => value + 1); }}
        onBack={() => navigate(backPath)}
      />
    );
  }

  const goNext = () => {
    if (index === questions.length - 1) {
      logClick('lesson_check_complete', { course_id: state?.courseId, node_id: state?.nodeId, total: questions.length, correct: questions.length - mistakes.length, attempt });
    }
    setIndex(index + 1);
    setSelected(null);
  };

  if (selected !== null) {
    return <LessonCheckFeedback question={question} selected={selected} number={index + 1} total={questions.length} onNext={goNext} />;
  }

  return (
    <div className="lesson-check-screen app-soft-screen flex h-full flex-col">
      <div className="app-soft-header px-5 pb-4 pt-4">
        <div className="flex items-center gap-3">
          <div role="progressbar" aria-label="이해 확인 진행률" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index + 1} className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-button-secondary)]">
            <div className="h-full rounded-full bg-brand-500" style={{ width: ((index + 1) / questions.length * 100) + '%' }} />
          </div>
          <p className="text-xs font-semibold tabular-nums text-[var(--color-ink-3)]">{index + 1}/{questions.length}</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 [&::-webkit-scrollbar]:hidden">
        <h1 className="mb-4! text-sm font-bold text-[var(--color-ink-2)]">이해 확인</h1>
        <Card pad="lg" className="mb-5 bg-[var(--color-surface)]" style={{ border: 0 }}>
          <p className="mb-2! text-xs font-bold text-[var(--color-ink-3)]">상황을 읽고 골라보세요</p>
          <h2 className="quiz-prompt-main text-lg font-bold text-[var(--color-ink)] leading-relaxed break-keep">
            {keepShortUnitsTogether(question.promptMain)}
          </h2>
        </Card>
        <div className="flex flex-col gap-2">
          {question.options.map((option, optionIndex) => (
            <button
              key={optionIndex}
              type="button"
              data-own-sfx
              aria-label={option.label}
              onClick={() => {
                setSelected(optionIndex);
                logClick('lesson_check_answer', { course_id: state?.courseId, node_id: state?.nodeId, word_id: question.wordId, correct: option.isCorrect, attempt });
                if (option.isCorrect) feedbackCorrect();
                else { feedbackWrong(); setMistakes(prev => [...prev, question]); }
              }}
              className="w-full flex items-center gap-3 rounded-card border border-[var(--color-line)] bg-[var(--color-card)] px-4 py-4 text-left text-sm font-semibold text-[var(--color-ink)] break-keep active:opacity-80"
            >
              <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-xs text-[var(--color-ink-3)]">{optionIndex + 1}</span>
              <span data-lesson-check-label className="min-w-0 flex-1">{keepShortUnitsTogether(option.label)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonCheckScreen;
