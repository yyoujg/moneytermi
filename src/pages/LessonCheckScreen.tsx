import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import type { Word } from '../types';
import { buildCustomQuizItem, lessonChecks } from '../lib/quiz';
import { feedbackCorrect, feedbackWrong } from '../lib/feedback';
import { logClick } from '../lib/analytics';
import { Card } from '../components/ui/Card';

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
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-5 bg-[var(--color-canvas)]">
        <p className="text-sm text-[var(--color-ink-3)]">확인할 문제가 없어요</p>
        <button onClick={() => navigate(backPath, { replace: true })} className="w-full py-4 rounded-button bg-brand-500 text-sm font-bold text-white">코스로 돌아가기</button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 px-5 bg-[var(--color-canvas)]">
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
          <button onClick={() => navigate(backPath)} className="w-full py-4 rounded-button border border-[var(--color-line)] bg-[var(--color-card)] text-sm font-bold text-[var(--color-ink)] active:opacity-90">
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
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[var(--color-ink)]">레슨 이해 확인</p>
          <p className="text-xs font-semibold text-[var(--color-ink-3)]">{index + 1}/{questions.length}</p>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-[var(--color-surface)]">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 [&::-webkit-scrollbar]:hidden">
        <Card pad="lg" className="mb-4 border border-[var(--color-line)]">
          <p className="mb-2! text-xs font-bold text-brand-ink">상황을 읽고 골라보세요</p>
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
                disabled={revealed}
                onClick={() => {
                  setSelected(optionIndex);
                  if (option.isCorrect) feedbackCorrect();
                  else { feedbackWrong(); setMistakes(prev => [...prev, question]); }
                }}
                className={`w-full flex items-center gap-3 rounded-chip border px-4 py-4 text-left text-sm font-semibold break-keep ${color} active:opacity-80`}
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
        <div className="px-5 pt-3 pb-8 bg-[var(--color-canvas)]">
          <button onClick={goNext} className="w-full py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90">
            {index === questions.length - 1 ? '결과 보기' : '다음 문제'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonCheckScreen;
