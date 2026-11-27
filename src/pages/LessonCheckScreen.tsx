import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Word } from '../types';
import { buildCustomQuizItem, lessonChecks } from '../lib/quiz';
import { feedbackCorrect, feedbackWrong } from '../lib/feedback';
import { logClick } from '../lib/analytics';
import { useAppContext } from '../context/AppContext';
import { ENERGY_ACTION_COST, ENERGY_STREAK_TARGET } from '../constants';
import { ActionButton } from '../components/ui/ActionButton';
import { LessonCheckFeedback } from '../components/learning/LessonCheckFeedback';
import { LessonCheckSummary, type LessonCheckRoundResult } from '../components/learning/LessonCheckSummary';
import { keepShortUnitsTogether } from '../lib/formatText';
import { shuffle } from '../lib/random';

const LessonCheckScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { spendEnergy, earnEnergy } = useAppContext();
  const state = location.state as { words?: Word[]; backPath?: string; courseId?: string; nodeId?: string } | null;
  const backPath = state?.backPath ?? '/course';
  const [questions, setQuestions] = useState(() => lessonChecks(state?.words ?? []).map(({ word, quiz }) => ({ ...buildCustomQuizItem(quiz), wordId: word.id })));
  const [attempt, setAttempt] = useState(1);
  const [roundResults, setRoundResults] = useState<LessonCheckRoundResult[]>([]);
  const startedRef = useRef(false);
  const advancedQuestionRef = useRef<string | null>(null);
  const streakRef = useRef(0);   // 연속 정답 수. ENERGY_STREAK_TARGET마다 에너지 +1
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
        <h1 className="mt-1 text-xl font-bold text-[var(--color-ink)]">{hasLesson ? '이번 레슨은 용어까지만!' : '용어부터 가볍게 시작하자'}</h1>
        <p className="text-sm text-[var(--color-ink-2)] break-keep">{hasLesson ? '다음 학습도 만나볼까?' : '용어 하나 배우면 상황 문제도 풀 수 있어.'}</p>
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
        onBack={() => { void spendEnergy(ENERGY_ACTION_COST, 'lesson_check_complete'); navigate(backPath, { replace: true, state: { openFocus: true } }); }}
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
    <div className="lesson-check-screen lesson-question-screen app-soft-screen">
      <header className="lesson-feedback-header">
        <div className="lesson-feedback-header-row"><span>이해 확인</span><span>{index + 1}/{questions.length}</span></div>
        <div role="progressbar" aria-label="이해 확인 진행률" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index} className="lesson-feedback-progress">
          <span style={{ width: `${index / questions.length * 100}%` }} />
        </div>
      </header>
      <main className="lesson-question-content">
        <div className="lesson-question-intro">
          <h1>{attempt === 1 ? '이 상황엔 어떤 답이 딱일까?' : '틀린 문제 다시 풀기'}</h1>
          <img src="/otter/v5/otter-explain.svg" alt="" aria-hidden="true" height={64} data-otter="explain" />
        </div>
        <section className="lesson-feedback-situation" aria-labelledby="lesson-question-prompt">
          <p className="lesson-feedback-label">이번 상황</p>
          <h2 id="lesson-question-prompt" className="lesson-feedback-question">{keepShortUnitsTogether(question.promptMain)}</h2>
        </section>
        <div className="lesson-question-options" role="group" aria-label="답 고르기">
          {question.options.map((option, optionIndex) => (
            <button
              key={optionIndex}
              type="button"
              data-own-sfx
              aria-label={option.label}
              onClick={() => {
                setSelected(optionIndex);
                logClick('lesson_check_answer', { course_id: state?.courseId, node_id: state?.nodeId, word_id: question.wordId, correct: option.isCorrect, attempt });
                if (option.isCorrect) {
                  feedbackCorrect();
                  streakRef.current += 1;
                  if (streakRef.current % ENERGY_STREAK_TARGET === 0) earnEnergy(1, 'lesson_check_streak');
                } else {
                  feedbackWrong();
                  streakRef.current = 0;
                  setMistakes(prev => [...prev, question]);
                }
              }}
              className="lesson-question-option"
            >
              <span aria-hidden="true" className="lesson-question-option-number">{optionIndex + 1}</span>
              <span data-lesson-check-label className="min-w-0 flex-1">{keepShortUnitsTogether(option.label)}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LessonCheckScreen;
