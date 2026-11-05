import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Word } from '../types';
import { buildCustomQuizItem, lessonChecks } from '../lib/quiz';
import { feedbackCorrect, feedbackWrong } from '../lib/feedback';
import { logClick } from '../lib/analytics';
import { Card } from '../components/ui/Card';
import { ActionButton } from '../components/ui/ActionButton';
import { LessonCheckFeedback } from '../components/learning/LessonCheckFeedback';
import { LessonCheckSummary, type LessonCheckRoundResult } from '../components/learning/LessonCheckSummary';
import { keepShortUnitsTogether } from '../lib/formatText';
import { shuffle } from '../lib/random';

const LessonCheckScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { words?: Word[]; backPath?: string; courseId?: string; nodeId?: string } | null;
  const backPath = state?.backPath ?? '/course';
  const [questions, setQuestions] = useState(() => lessonChecks(state?.words ?? []).map(({ word, quiz }) => ({ ...buildCustomQuizItem(quiz), wordId: word.id })));
  const [attempt, setAttempt] = useState(1);
  const [roundResults, setRoundResults] = useState<LessonCheckRoundResult[]>([]);
  const startedRef = useRef(false);
  const advancedQuestionRef = useRef<string | null>(null);
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
        <h1 className="mt-1 text-xl font-bold text-[var(--color-ink)]">{hasLesson ? '이번 레슨에는 이해 확인 문제가 없어요' : '자주 마주치는 용어부터 시작해요'}</h1>
        <p className="text-sm text-[var(--color-ink-2)] break-keep">{hasLesson ? '다음 학습을 선택할 수 있어요.' : '용어를 하나 익히면 이해 확인 문제를 풀 수 있어요.'}</p>
        <ActionButton fullWidth onClick={() => navigate(backPath, { replace: true })} className="mt-3">
          {hasLesson ? '다음 학습 선택하기' : '학습 시작하기'}
        </ActionButton>
      </div>
    );
  }

  if (!question) {
    return (
      <LessonCheckSummary
        results={roundResults}
        reviewCount={mistakes.length}
        onRetry={() => { setQuestions(mistakes.map(item => ({ ...item, options: shuffle(item.options) }))); setMistakes([]); setIndex(0); setSelected(null); setAttempt(value => value + 1); }}
        onBack={() => navigate(backPath, { replace: true, state: { openFocus: true } })}
      />
    );
  }

  const goNext = () => {
    const questionKey = `${attempt}:${index}`;
    if (advancedQuestionRef.current === questionKey) return;
    advancedQuestionRef.current = questionKey;
    if (index === questions.length - 1) {
      setRoundResults(previous => [...previous, { correct: questions.length - mistakes.length, total: questions.length }]);
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
          <div role="progressbar" aria-label="이해 확인 진행률" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index} className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-button-secondary)]">
            <div className="h-full rounded-full bg-[var(--color-progress)]" style={{ width: (index / questions.length * 100) + '%' }} />
          </div>
          <p className="text-xs tabular-nums text-[var(--color-ink-3)]">{index + 1}/{questions.length}</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 [&::-webkit-scrollbar]:hidden">
        <h1 className="mb-4! text-xs text-[var(--color-ink-3)]">{attempt === 1 ? '상황을 읽고 골라보세요' : '틀린 문제 다시 풀기'}</h1>
        {/* 문제는 카드 밖 왼쪽 아래 수달이 말하는 말풍선 */}
        <div className="mb-5 flex items-start gap-2">
          <img src="/otter/v5/otter-explain.svg" alt="" aria-hidden="true" height={88} className="quiz-question-otter h-[88px] w-auto shrink-0 self-end" data-otter="explain" />
          <Card pad="sm" className="quiz-bubble min-w-0 flex-1">
            <h2 className="quiz-prompt-main text-lg font-bold text-[var(--color-ink)] leading-relaxed break-keep">
              {keepShortUnitsTogether(question.promptMain)}
            </h2>
          </Card>
        </div>
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
              className="quiz-option w-full flex items-center gap-3 min-h-[64px] border border-transparent bg-[var(--color-choice)] active:opacity-80 px-4 py-4 text-left text-base font-normal leading-relaxed text-[var(--color-ink)] break-keep"
              style={{ borderRadius: 'var(--shape-button)' }}
            >
              {optionIndex < 4
                ? <img src={`/icons/num/num-${optionIndex + 1}.svg`} alt="" aria-hidden="true" width={28} height={28} className="shrink-0" data-num-icon />
                : <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[var(--color-card)] text-xs font-semibold text-[var(--color-ink-3)]">{optionIndex + 1}</span>}
              <span data-lesson-check-label className="min-w-0 flex-1">{keepShortUnitsTogether(option.label)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonCheckScreen;
