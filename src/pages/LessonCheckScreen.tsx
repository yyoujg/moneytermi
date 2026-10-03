import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import type { Word } from '../types';
import { buildCustomQuizItem, lessonChecks } from '../lib/quiz';
import { feedbackCorrect, feedbackWrong } from '../lib/feedback';
import { logClick } from '../lib/analytics';
import { Card } from '../components/ui/Card';
import { Mascot } from '../components/Mascot';

const LessonCheckScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { words?: Word[]; backPath?: string } | null;
  const backPath = state?.backPath ?? '/course';
  const [questions, setQuestions] = useState(() => lessonChecks(state?.words ?? []).map(({ quiz }) => buildCustomQuizItem(quiz)));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<typeof questions>([]);
  const question = questions[index];

  if (questions.length === 0) {
    const hasLesson = Boolean(state?.words?.length);
    return (
      <div className="lesson-check-screen flex h-full flex-col items-center justify-center gap-4 px-5 text-center bg-[var(--color-canvas)]">
        <Mascot name="empty" size={110} />
        <h1 className="mt-1 text-xl font-bold text-[var(--color-ink)]">{hasLesson ? '이번 레슨에는 이해 확인 문제가 없어요' : '단어를 먼저 배워보세요'}</h1>
        <p className="text-[15px] text-[var(--color-ink-2)] break-keep">{hasLesson ? '다음 학습을 선택할 수 있어요.' : '단어를 배우면 이해 확인 문제를 풀 수 있어요.'}</p>
        <button onClick={() => navigate('/course', { replace: true })} className="mt-3 w-full min-h-[52px] rounded-button bg-brand-500 text-base font-bold text-white">
          {hasLesson ? '다음 학습 선택하기' : '학습 시작하기'}
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="lesson-check-screen flex h-full flex-col items-center justify-center gap-5 px-5 bg-[var(--color-canvas)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-success-400">
          <Check size={32} strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--color-ink)]">이해 확인 완료!</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-3)]">{questions.length}문제 중 {questions.length - mistakes.length}개 정답</p>
        </div>
        <div className="w-full flex flex-col gap-2">
          {mistakes.length > 0 && (
            <button
              onClick={() => { setQuestions(mistakes); setMistakes([]); setIndex(0); setSelected(null); }}
              className="w-full py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90"
            >
              틀린 문제 다시 풀기
            </button>
          )}
        <button onClick={() => navigate(backPath)} className="w-full py-4 rounded-button bg-[var(--color-button-secondary)] text-sm font-bold text-[var(--color-ink-2)] active:opacity-90">
            코스로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const answer = question.options.find(option => option.isCorrect)!;
  const isCorrect = selected !== null && question.options[selected].isCorrect;

  const goNext = () => {
    if (index === questions.length - 1) {
      logClick('lesson_check_complete', { total: questions.length, correct: questions.length - mistakes.length });
    }
    setIndex(index + 1);
    setSelected(null);
  };

  return (
    <div className="lesson-check-screen flex h-full flex-col bg-[var(--color-canvas)]">
      <div className="bg-[var(--color-card)] px-5 pb-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-button-secondary)]">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
          </div>
          <p className="text-xs font-semibold tabular-nums text-[var(--color-ink-3)]">{index + 1}/{questions.length}</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 [&::-webkit-scrollbar]:hidden">
        <h1 className="mb-4! text-sm font-bold text-[var(--color-ink-2)]">이해 확인</h1>
        <Card pad="lg" className="mb-5 bg-[var(--color-surface)]" style={{ border: 0 }}>
          <p className="mb-2! text-xs font-bold text-[var(--color-ink-3)]">상황을 읽고 골라보세요</p>
          <h2 className="text-lg font-bold text-[var(--color-ink)] leading-relaxed break-keep">{question.promptMain}</h2>
        </Card>
        <div className="flex flex-col gap-2">
          {question.options.map((option, optionIndex) => {
            const revealed = selected !== null;
            const isSelected = selected === optionIndex;
            const color = revealed && option.isCorrect
              ? 'border-success-500/50 bg-[var(--color-success-soft)] text-success-400'
              : revealed && isSelected
                ? 'border-danger-500/50 bg-[var(--color-danger-soft)] text-danger-400'
                : 'border-[var(--color-line)] bg-[var(--color-card)] text-[var(--color-ink)]';
            return (
              <button
                key={optionIndex}
                type="button"
                data-own-sfx
                disabled={revealed}
                onClick={() => {
                  setSelected(optionIndex);
                  if (option.isCorrect) feedbackCorrect();
                  else { feedbackWrong(); setMistakes(prev => [...prev, question]); }
                }}
                className={`w-full flex items-center gap-3 rounded-card border px-4 py-4 text-left text-sm font-semibold break-keep ${color} active:opacity-80`}
              >
                {revealed && option.isCorrect ? <Check size={16} className="shrink-0" /> : revealed && isSelected ? <X size={16} className="shrink-0" /> : <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-xs text-[var(--color-ink-3)]">{optionIndex + 1}</span>}
                {option.label}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <Card pad="lg" className={`mt-4 border ${isCorrect ? 'border-success-500/30' : 'border-danger-500/30'}`} style={{ backgroundColor: isCorrect ? 'var(--color-success-soft)' : 'var(--color-danger-soft)' }}>
            <p className={`text-sm font-bold mb-2! ${isCorrect ? 'text-success-400' : 'text-danger-400'}`}>{isCorrect ? '맞았어요' : `정답: ${answer.label}`}</p>
            <p className="text-sm leading-relaxed text-[var(--color-ink-2)] break-keep">{question.explanation}</p>
          </Card>
        )}
      </div>
      {selected !== null && (
        <div className="border-t border-[var(--color-line)] bg-[var(--color-card)] px-5 pt-3 pb-8">
          <button onClick={goNext} className="w-full py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90">
            {index === questions.length - 1 ? '결과 보기' : '다음 문제'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonCheckScreen;
