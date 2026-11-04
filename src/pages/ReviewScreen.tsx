import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from '../components/ui/ControlIcons';
import { useNavigate } from 'react-router-dom';
import { Spacing } from '@toss/tds-mobile';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { requestAppReview } from '../lib/review';
import { createQuizRequestId, type QuizAnswerResult } from '../lib/quizSubmission';
import { logClick } from '../lib/analytics';
import { maskTerm } from '../lib/quiz';
import { feedbackCorrect, feedbackWrong, feedbackQuizComplete } from '../lib/feedback';
import { useSettings } from '../hooks/useSettings';
import { Card } from '../components/ui/Card';
import { ActionButton } from '../components/ui/ActionButton';
import { shouldScheduleRetry } from '../lib/review';
import { shuffle } from '../lib/random';
import { ReviewCompletionScreen } from '../components/learning/ReviewCompletionScreen';
import { LearningEmptyState } from '../components/learning/LearningEmptyState';
import { QuizProgressHeader } from '../components/learning/QuizProgressHeader';
import { praiseForReview } from '../lib/praise';
import { keepShortUnitsTogether } from '../lib/formatText';

type Status = 'idle' | 'saving' | 'save-error' | 'correct' | 'wrong';

type ReviewAttempt = Readonly<{
  requestId: string;
  wordId: number;
  answer: string;
  hint: boolean;
  sessionStart: boolean;
  receipt?: QuizAnswerResult;
}>;

const QuizPage = () => {
  const navigate = useNavigate();
  const { dueQueue, knownWords, submitQuizAnswer, recordReview, refreshWallet } = useAppContext();
  const { soundOn, vibrationOn } = useSettings();

  const [queue, setQueue] = useState<Word[]>([]);
  const [started, setStarted] = useState(false);
  const [initialTotal, setInitialTotal] = useState(0);
  useEffect(() => {
    if (!started && dueQueue.length > 0) {
      setQueue(shuffle(dueQueue));
      setInitialTotal(dueQueue.length);
      logClick('quiz_start', { mode: 'review', total: dueQueue.length });
      setStarted(true);
    }
  }, [dueQueue, started]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [showHint, setShowHint] = useState(false);
  const [combo, setCombo] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [firstCorrect, setFirstCorrect] = useState(0);
  const reviewRecordedIds = useRef<Set<number>>(new Set());
  const completedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const attemptRef = useRef<ReviewAttempt | null>(null);
  const submittingRef = useRef(false);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (nextTimerRef.current !== null) clearTimeout(nextTimerRef.current);
    };
  }, []);

  const word = queue[index];
  const isEmpty = !started && dueQueue.length === 0;
  const isFinished = started && index >= queue.length;

  useEffect(() => {
    if (status === 'idle') inputRef.current?.focus();
    if (status === 'save-error') retryRef.current?.focus();
  }, [index, status]);

  // 퀴즈 완료 시 앱 리뷰 요청 (플랫폼이 노출 제어)
  const completed = started && index >= queue.length;
  useEffect(() => {
    if (!completed || completedRef.current) return;
    completedRef.current = true;
    feedbackQuizComplete(totalCorrect === queue.length);
    logClick('quiz_complete', { mode: 'review', total: initialTotal, correct: firstCorrect, attempts: queue.length });
    if (firstCorrect > 0) requestAppReview();
    void refreshWallet();   // m4·50XP 보너스 반영
  }, [completed, queue.length, refreshWallet, totalCorrect, firstCorrect, initialTotal]);

  const goNext = () => {
    nextTimerRef.current = null;
    attemptRef.current = null;
    setIndex((i) => i + 1);
    setInput('');
    setStatus('idle');
    setShowHint(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // 상태 갱신 전 연속 클릭·엔터까지 같은 잠금으로 막는다.
    if (submittingRef.current || !word || (status !== 'idle' && status !== 'save-error')) return;
    if (!attemptRef.current) {
      if (!input.trim()) return;
      attemptRef.current = Object.freeze({
        requestId: createQuizRequestId(),
        wordId: word.id,
        answer: input,
        hint: showHint,
        sessionStart: index === 0,
      });
    }
    submittingRef.current = true;
    setStatus('saving');

    try {
      let attempt = attemptRef.current;
      if (!attempt.receipt) {
        const receipt = await submitQuizAnswer(
          attempt.wordId, attempt.answer, 'typed', attempt.hint, attempt.sessionStart, attempt.requestId,
        );
        if (!mountedRef.current) return;
        if (!receipt) throw new Error('답안 저장 미확인');
        attempt = Object.freeze({ ...attempt, receipt });
        attemptRef.current = attempt;
      }
      const receipt = attempt.receipt!;
      const firstAttempt = !reviewRecordedIds.current.has(attempt.wordId);
      // 서버 영수증을 보관하므로 SRS만 실패하면 채점·보상 없이 저장만 재시도한다.
      if (firstAttempt) {
        const saved = await recordReview(attempt.wordId, receipt.correct, attempt.hint);
        if (!mountedRef.current) return;
        if (saved !== true) throw new Error('복습 저장 미확인');
        reviewRecordedIds.current.add(attempt.wordId);
        if (receipt.correct) setFirstCorrect(value => value + 1);
      }

      logClick('quiz_answer', { mode: 'review', word_id: attempt.wordId, correct: receipt.correct, first_attempt: firstAttempt, used_hint: attempt.hint });
      setCombo(receipt.combo);
      if (receipt.correct) {
        feedbackCorrect(soundOn, vibrationOn, receipt.combo);
        setTotalCorrect(value => value + 1);
        setStatus('correct');
      } else {
        feedbackWrong();
        setStatus('wrong');
        if (shouldScheduleRetry(queue, index, attempt.wordId)) setQueue(q => [...q, word]);
      }
      // 모든 저장이 확인된 시점부터 기존 피드백 시간을 보장한다.
      nextTimerRef.current = setTimeout(goNext, receipt.correct ? 900 : 1000);
    } catch {
      if (mountedRef.current) setStatus('save-error');
    } finally {
      submittingRef.current = false;
    }
  };

  if (isEmpty) {
    // 아직 배운 단어가 없으면 '완료'가 아니라 '시작 전'이다
    const nothingLearned = knownWords.length === 0;
    return (
      <LearningEmptyState
        title={nothingLearned ? '다시 볼 용어가 아직 없어요' : '오늘 다시 보기 완료'}
        description={nothingLearned ? '자주 마주치는 용어를 배우면 다음 날부터 다시 보기가 열려요' : '지금 다시 볼 용어가 없어요'}
        actionLabel={nothingLearned ? '시작하러 가기' : '퀘스트로'}
        onAction={() => navigate(nothingLearned ? '/course' : '/home')}
        actionPlacement="inline"
      />
    );
  }

  if (isFinished) {
    return (
      <ReviewCompletionScreen
        initialTotal={initialTotal}
        firstCorrect={firstCorrect}
        note={praiseForReview(totalCorrect, queue.length)}
        onAction={() => navigate('/course')}
      />
    );
  }

  // dueQueue 로드~큐 스냅샷 사이 한 프레임 가드 (흰 깜빡임 방지)
  if (!word) return <div className="app-soft-screen flex h-full items-center justify-center" />;

  const progress = (index / queue.length) * 100;

  return (
    <div className="app-soft-screen flex flex-col h-full overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <QuizProgressHeader
        label={`복습 ${index + 1} / ${queue.length}`}
        progress={progress}
        streakText={combo >= 2 ? `${combo}연속` : null}
      />

      <div className="flex-1 flex flex-col px-5 py-4">
        {/* 문제 카드 */}
        <Card key={word.id} tone="card" pad="lg" className="mb-4 anim-slide-in">
          <p id="review-prompt-guide" className="text-xs text-[var(--color-ink-3)] mb-3!">뜻을 보고 어떤 용어인지 맞혀보세요</p>

          <p className="quiz-prompt-main text-lg font-bold text-[var(--color-ink)] leading-relaxed">{keepShortUnitsTogether(maskTerm(word.meaning, word.word))}</p>

          {showHint && (
            <p className="flex items-center gap-2 mt-4!">
              <span className="text-xs text-[var(--color-ink-3)]">초성</span>
              <span className="text-base font-bold text-[var(--color-ink)] tracking-wide">{word.hint}</span>
            </p>
          )}

          {/* 사전 원문(detailedMeaning)은 길고 문어체라 답을 흘리기 쉬워 문제에는 뜻 한 줄과 초성 힌트만 둔다 */}
        </Card>

        {/* 입력 + 제출 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => { if (!attemptRef.current && !submittingRef.current) setInput(e.target.value); }}
              aria-labelledby="review-prompt-guide"
              placeholder="용어를 입력하세요"
              disabled={status !== 'idle'}
              autoComplete="off"
              className={`w-full px-4 py-4 rounded-button text-sm font-normal outline-none border transition-colors
                ${status === 'correct' ? 'bg-[var(--color-card)] border-[var(--color-success-foreground)] text-[var(--color-ink)]' :
                  status === 'wrong' ? 'bg-[var(--color-card)] border-dashed border-[var(--color-line-strong)] text-[var(--color-ink)]' :
                  'bg-[var(--color-card)] border-[var(--color-line)] text-[var(--color-ink)] focus:border-[var(--color-ink-3)]'}
              `}
              style={{ caretColor: 'var(--color-ink)' }}
            />
            {status === 'correct' && (
              <p className="text-xs font-bold text-[var(--color-success-foreground)] mt-1! px-1">✓ 정답! 바로 맞혔어요</p>
            )}
            {status === 'wrong' && (
              <p className="text-xs font-bold text-[var(--color-ink-2)] mt-1! px-1">✕ 틀렸어요. 정답: {word.word}</p>
            )}
          </div>

          <p role="status" aria-live="polite" aria-atomic="true" className={status === 'save-error' || status === 'saving' ? 'text-xs text-[var(--color-ink-2)]' : 'sr-only'}>
            {status === 'save-error' ? '답안 저장을 확인하지 못했어요. 같은 답안으로 다시 저장해 주세요.' : status === 'saving' ? '답안을 저장하고 있어요.' : ''}
          </p>
          <ActionButton
            ref={retryRef}
            fullWidth
            onClick={() => handleSubmit()}
            disabled={(status !== 'idle' && status !== 'save-error') || !input.trim()}
          >
            {status === 'save-error' ? '다시 저장하기' : status === 'saving' ? '저장 중' : '정답 확인'}
          </ActionButton>
        </form>

        <Spacing size={12} />

        {/* 하단 보조 버튼 */}
        <div className="flex gap-3">
          {!showHint && (
            <button
              onClick={() => { if (status === 'idle' && !attemptRef.current && !submittingRef.current) setShowHint(true); }}
              disabled={status !== 'idle'}
              className="review-aux-button flex-1 flex items-center justify-center gap-1 active:opacity-70"
            >
              초성 힌트
            </button>
          )}
          <button
            onClick={() => { if (status === 'idle' && !attemptRef.current && !submittingRef.current) goNext(); }}
            disabled={status !== 'idle'}
            className="review-aux-button flex-1 flex items-center justify-center gap-1 active:opacity-70"
          >
            건너뛰기<ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
