import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Lightbulb, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Spacing } from '@toss/tds-mobile';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { requestAppReview } from '../lib/review';
import { logClick } from '../lib/analytics';
import { DailyAlarmPromptCard } from '../components/DailyAlarmPromptCard';

type Status = 'idle' | 'correct' | 'wrong';

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const QuizPage = () => {
  const navigate = useNavigate();
  const { points, dueQueue, submitQuizAnswer, recordReview } = useAppContext();

  const [queue, setQueue] = useState<Word[]>([]);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!started && dueQueue.length > 0) {
      setQueue(shuffle(dueQueue));
      setStarted(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueQueue, started]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [showHint, setShowHint] = useState(false);
  const [combo, setCombo] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const graded = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const word = queue[index];
  const isEmpty = !started && dueQueue.length === 0;
  const isFinished = started && index >= queue.length;

  useEffect(() => {
    if (status === 'idle') inputRef.current?.focus();
  }, [index, status]);

  // 퀴즈 완료 시 앱 리뷰 요청 (플랫폼이 노출 제어)
  const completed = started && index >= queue.length;
  useEffect(() => {
    if (completed) {
      logClick('quiz_complete', { mode: 'review', total: queue.length, correct: totalCorrect });
      requestAppReview();
    }
  }, [completed]);

  const goNext = () => {
    setIndex((i) => i + 1);
    setInput('');
    setStatus('idle');
    setShowHint(false);
    graded.current = false;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (status !== 'idle' || !input.trim()) return;

    // 즉시 피드백은 낙관적, 포인트·콤보·m3는 서버가 채점
    const clean = (s: string) => s.replace(/\s+/g, '').toLowerCase();
    const isCorrect = clean(input) === clean(word.word);

    // SRS 일정은 단어별 첫 제출 결과로 한 번만 기록
    if (!graded.current) {
      graded.current = true;
      void recordReview(word.id, isCorrect, showHint);
    }

    if (isCorrect) {
      setTotalCorrect((c) => c + 1);
      setStatus('correct');
      const res = await submitQuizAnswer(word.id, input, 'typed', showHint, index === 0);
      if (res) setCombo(res.combo);
      setTimeout(goNext, 900);
    } else {
      setCombo(0);
      setStatus('wrong');
      void submitQuizAnswer(word.id, input, 'typed', showHint, index === 0);
      setTimeout(() => { setStatus('idle'); setInput(''); }, 700);
    }
  };

  if (isEmpty) {
    return (
      <div className="flex flex-col h-full bg-[var(--color-canvas)] items-center justify-center p-6 pb-32">
        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center text-4xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-[var(--color-ink)] mb-1">오늘 복습 완료</h2>
        <p className="text-sm text-[var(--color-ink-3)] mb-8">지금 복습할 단어가 없어요</p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-4 rounded-2xl text-white text-xs font-bold active:opacity-90"
          style={{ backgroundColor: '#f97316' }}
        >
          홈으로
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col h-full bg-[var(--color-canvas)] items-center justify-center p-6 pb-32">
        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center text-4xl mb-4">🏆</div>
        <h2 className="text-xl font-bold text-[var(--color-ink)] mb-1">오늘 복습 완료!</h2>
        <p className="text-sm text-[var(--color-ink-3)] mb-6">{queue.length}문제 중 {totalCorrect}개 정답</p>
        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-5 py-3 mb-8">
          <Zap size={16} className="text-orange-500 fill-current" />
          <span className="text-sm font-bold text-[var(--color-ink)]">누적 포인트 {points} P</span>
        </div>
        <div className="w-full max-w-sm mb-8">
          <DailyAlarmPromptCard />
        </div>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-4 rounded-2xl text-white text-xs font-bold active:opacity-90"
          style={{ backgroundColor: '#f97316' }}
        >
          홈으로
        </button>
      </div>
    );
  }

  if (!word) return null; // dueQueue 로드~큐 스냅샷 사이 한 프레임 가드

  const progress = (index / queue.length) * 100;
  const earnedPreview = (showHint ? 5 : 10) + (combo >= 2 ? combo * 2 : 0);

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas)] pb-32">
      {/* 헤더 */}
      <div className="bg-[var(--color-card)] pt-4 px-5 pb-4 border-b border-[var(--color-line)]">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-[var(--color-ink)]">퀴즈</h2>
          <div className="flex items-center gap-2">
            {combo >= 2 && (
              <div className="bg-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                🔥 {combo}연속
              </div>
            )}
            <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1.5">
              <Zap size={13} className="text-orange-500 fill-current" />
              <span className="text-xs font-bold text-[var(--color-ink)]">{points} P</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[var(--color-line)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-orange-400 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold text-[var(--color-ink-3)] shrink-0">{index + 1} / {queue.length}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 py-4">
        {/* 문제 카드 */}
        <div className="bg-[var(--color-card)] rounded-2xl p-6 mb-5 flex-1">
          <p className="text-[11px] font-medium text-[var(--color-ink-4)] mb-4 tracking-wide uppercase">뜻을 보고 용어를 맞혀보세요</p>

          <p className="text-lg font-bold text-[var(--color-ink)] leading-relaxed mb-5">{word.meaning}</p>

          {showHint && (
            <div className="bg-[var(--color-surface)] rounded-2xl px-4 py-3 flex items-center gap-2 mb-4">
              <Lightbulb size={14} className="text-[var(--color-ink-3)] shrink-0" />
              <span className="text-base font-bold text-[var(--color-ink)] tracking-widest">{word.hint}</span>
            </div>
          )}

          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <p className="text-xs font-bold text-[var(--color-ink-3)] mb-1.5">상세 설명</p>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed break-keep">{word.detailedMeaning}</p>
          </div>
        </div>

        {/* 입력 + 제출 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="용어를 입력하세요"
              disabled={status !== 'idle'}
              autoComplete="off"
              className={`w-full px-4 py-4 rounded-2xl text-sm font-medium outline-none border transition-colors
                ${status === 'correct' ? 'bg-green-500/10 border-green-500/40 text-green-400' :
                  status === 'wrong' ? 'bg-red-500/10 border-red-500/40 text-red-400' :
                  'bg-[var(--color-card)] border-[var(--color-line)] text-[var(--color-ink)] focus:border-orange-500/50'}
              `}
              style={{ caretColor: '#f97316' }}
            />
            {status === 'correct' && (
              <p className="text-xs font-bold text-green-400 mt-1.5 px-1">정답! +{earnedPreview}P</p>
            )}
            {status === 'wrong' && (
              <p className="text-xs font-bold text-red-400 mt-1.5 px-1">틀렸어요. 다시 시도해보세요!</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={status !== 'idle' || !input.trim()}
            className="w-full py-4 rounded-2xl text-white text-xs font-bold active:opacity-90 disabled:opacity-30"
            style={{ backgroundColor: '#f97316' }}
          >
            제출하기
          </button>
        </form>

        <Spacing size={12} />

        {/* 하단 보조 버튼 */}
        <div className="flex gap-3">
          {!showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[var(--color-card)] text-xs font-bold text-[var(--color-ink-3)] active:opacity-70"
            >
              <Lightbulb size={13} className="text-[var(--color-ink-4)]" /> 초성 힌트
            </button>
          )}
          <button
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[var(--color-card)] text-xs font-bold text-[var(--color-ink-3)] active:opacity-70"
          >
            <ChevronRight size={13} /> 건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
