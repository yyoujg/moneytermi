import React, { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronRight, Lightbulb, Zap, Flame, BookOpen, CircleCheck, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Spacing } from '@toss/tds-mobile';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { requestAppReview } from '../lib/review';
import { answerMatches } from '../lib/answer';
import { logClick } from '../lib/analytics';
import { maskTerm } from '../lib/quiz';
import { feedbackCorrect, feedbackWrong, feedbackQuizComplete } from '../lib/feedback';
import { useSettings } from '../hooks/useSettings';
import { Card } from '../components/ui/Card';
import { DailyAlarmPromptCard } from '../components/DailyAlarmPromptCard';
import { StreakCelebration } from '../components/StreakCelebration';
import { Storage } from '../lib/storage';
import { toDateStr } from '../lib/date';

type Status = 'idle' | 'correct' | 'wrong';
const REVIEW_COMPLETED_KEY = 'review_completed_date';

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
  const { hydrated, points, dueQueue, nextReviewDate, knownWords, submitQuizAnswer, recordReview, refreshWallet } = useAppContext();
  const { soundOn, vibrationOn } = useSettings();

  const [queue, setQueue] = useState<Word[]>([]);
  const [started, setStarted] = useState(false);
  const [completedToday, setCompletedToday] = useState<boolean | null>(null);
  useEffect(() => {
    Storage.getItem(REVIEW_COMPLETED_KEY)
      .then(date => setCompletedToday(date === toDateStr(new Date())))
      .catch(() => setCompletedToday(false));
  }, []);
  const startReview = () => {
    setQueue(shuffle(dueQueue));
    setStarted(true);
    logClick('review_session_start', { count: dueQueue.length });
  };
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [showHint, setShowHint] = useState(false);
  const [combo, setCombo] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [lastEarned, setLastEarned] = useState(0);   // 서버가 채점한 금액. 응답 전엔 0
  const [capped, setCapped] = useState(false);
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
      void Storage.setItem(REVIEW_COMPLETED_KEY, toDateStr(new Date()));
      feedbackQuizComplete(totalCorrect === queue.length);
      logClick('quiz_complete', { mode: 'review', total: queue.length, correct: totalCorrect });
      requestAppReview();
      void refreshWallet();   // m4·50XP 보너스 반영
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
    // 괄호 약어·슬래시 항목도 정답 인정 (서버 answer_matches와 동일 규칙)
    const isCorrect = answerMatches(input, word.word);

    // SRS 일정은 단어별 첫 제출 결과로 한 번만 기록
    if (!graded.current) {
      graded.current = true;
      void recordReview(word.id, isCorrect, showHint);
    }

    if (isCorrect) {
      feedbackCorrect(soundOn, vibrationOn, combo + 1);
      setTotalCorrect((c) => c + 1);
      setStatus('correct');
      setLastEarned(0);
      setCapped(false);
      const res = await submitQuizAnswer(word.id, input, 'typed', showHint, index === 0);
      if (res) { setCombo(res.combo); setLastEarned(res.earned); setCapped(res.capped); }
      setTimeout(goNext, 900);
    } else {
      feedbackWrong();
      setCombo(0);
      setStatus('wrong');
      setTimeout(() => { setStatus('idle'); setInput(''); }, 1000);
      await submitQuizAnswer(word.id, input, 'typed', showHint, index === 0);   // 다음 정답 응답과 순서 보장
    }
  };

  if (!hydrated || (isEmpty && completedToday === null)) {
    return <div className="flex h-full items-center justify-center bg-[var(--color-canvas)] text-sm text-[var(--color-ink-2)]">복습 내용을 불러오는 중이에요</div>;
  }

  if (!started && dueQueue.length > 0) {
    return (
      <div className="flex h-full flex-col overflow-y-auto bg-[var(--color-canvas)] px-5 pb-nav [&::-webkit-scrollbar]:hidden">
        <h1 className="pt-5 text-xl font-bold text-[var(--color-ink)]">복습</h1>
        <div className="mt-6 rounded-card bg-[var(--color-brand-soft)] p-5">
          <p className="text-sm font-bold text-brand-ink">오늘 복습할 단어</p>
          <p className="mt-2! text-3xl font-bold text-[var(--color-ink)]">{dueQueue.length}개</p>
          <button type="button" onClick={startReview} className="mt-5 w-full min-h-12 rounded-button bg-brand-500 px-4 py-3 text-sm font-bold">복습 시작하기</button>
        </div>
        <div className="mt-6 flex flex-col gap-3 text-sm text-[var(--color-ink-2)]">
          <p className="flex items-center gap-2"><BookOpen size={17} />전체 학습한 단어 {knownWords.length}개</p>
          {nextReviewDate && <p className="flex items-center gap-2"><CalendarDays size={17} />다음 복습 예정 {new Date(`${nextReviewDate}T00:00:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</p>}
        </div>
      </div>
    );
  }

  if (isEmpty) {
    const nothingLearned = knownWords.length === 0;
    const title = nothingLearned ? '단어를 먼저 배워보세요' : completedToday ? '오늘 복습을 마쳤어요' : '지금 복습할 단어가 없어요';
    const description = nothingLearned ? '첫 레슨을 배우면 다음 날부터 복습할 수 있어요.' : completedToday ? '오늘 할 복습을 모두 끝냈어요.' : '복습 예정일이 되면 여기에서 다시 만나요.';
    return (
      <div className="flex h-full flex-col overflow-y-auto bg-[var(--color-canvas)] px-5 pb-nav [&::-webkit-scrollbar]:hidden">
        <h2 className="pt-5 text-xl font-bold text-[var(--color-ink)]">복습</h2>
        <div className="mt-6 flex flex-col items-center text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-brand-500">
            {nothingLearned ? <Sprout size={48} strokeWidth={1.7} /> : <CircleCheck size={48} strokeWidth={1.7} />}
          </span>
          <h3 className="mt-4! text-lg font-bold text-[var(--color-ink)]">{title}</h3>
          <p className="mt-1! text-sm text-[var(--color-ink-2)]">{description}</p>
        </div>
        <div className="mt-6 rounded-card bg-[var(--color-card)] p-5">
          <p className="text-sm font-bold text-[var(--color-ink)]">오늘 복습할 단어 0개</p>
          {nextReviewDate && <p className="mt-2! text-sm text-[var(--color-ink-2)]">다음 복습 예정 {new Date(`${nextReviewDate}T00:00:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</p>}
          <button onClick={() => navigate('/course')}
            className="mt-4 w-full rounded-button bg-brand-500 py-3.5 text-sm font-bold text-white active:opacity-90">
            {nothingLearned ? '첫 레슨 시작하기' : '다음 학습 이어가기'}
          </button>
        </div>
        <p className="mt-5 text-sm text-[var(--color-ink-2)]">전체 학습한 단어 {knownWords.length}개</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col h-full bg-[var(--color-canvas)] items-center justify-center-safe p-6 pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div className="w-20 h-20 bg-[var(--color-brand-soft)] rounded-full flex items-center justify-center text-brand-ink mb-4"><CircleCheck size={38} /></div>
        <h2 className="text-xl font-bold text-[var(--color-ink)] mb-1!">오늘 복습 완료!</h2>
        <p className="text-sm text-[var(--color-ink-3)] mb-6!">{queue.length}문제 중 {totalCorrect}개 정답</p>
        <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-card px-5 py-3 mb-8">
          <Zap size={16} className="text-brand-ink fill-current" />
          <span className="text-sm font-bold text-[var(--color-ink)]">누적 포인트 {points} P</span>
        </div>
        <div className="w-full max-w-sm mb-8">
          <DailyAlarmPromptCard />
          <StreakCelebration />
        </div>
        <button
          onClick={() => navigate('/home')}
          className="w-full max-w-sm py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90"
        >
          퀘스트로
        </button>
      </div>
    );
  }

  // dueQueue 로드~큐 스냅샷 사이 한 프레임 가드 (흰 깜빡임 방지)
  if (!word) return <div className="flex h-full items-center justify-center" style={{ backgroundColor: 'var(--color-canvas)' }} />;

  const progress = (index / queue.length) * 100;

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas)] pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {/* 헤더 */}
      <div className="border-b border-[var(--color-line)] bg-[var(--color-card)] pt-4 px-5 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[var(--color-ink)]">복습</h2>
          <div className="flex items-center gap-2">
            {/* 보유 포인트는 상단바에 있다 */}
            {combo >= 2 && (
              <div className="flex items-center gap-0.5 bg-[var(--color-brand-soft)] text-brand-ink text-2xs font-bold px-2.5 py-1 rounded-full">
                <Flame size={11} className="fill-current" />{combo}연속
              </div>
            )}
            <button type="button" onClick={() => navigate('/home', { replace: true })} className="rounded-chip bg-[var(--color-button-secondary)] px-3 py-2 text-xs font-bold text-[var(--color-ink-2)]">나가기</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 bg-[var(--color-surface)] rounded-full h-2 overflow-hidden">
            <div className="bg-brand-500 h-full rounded-full transition-all duration-[var(--dur-slow)] ease-soft" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold tabular-nums text-[var(--color-ink-3)] shrink-0">{index + 1} / {queue.length}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 py-4">
        {/* 문제 카드 */}
        <Card key={word.id} pad="lg" className="mb-4 flex-1 anim-slide-in">
          <p className="text-sm font-semibold text-[var(--color-ink-3)] mb-3!">뜻을 보고 용어를 맞혀보세요</p>

          <p className="text-lg font-bold text-[var(--color-ink)] leading-relaxed mb-6!">{maskTerm(word.meaning, word.word)}</p>

          {showHint && (
            <Card tone="surface" pad="none" className="px-4 py-3 flex items-center gap-2 mb-4">
              <Lightbulb size={14} className="text-[var(--color-ink-3)] shrink-0" />
              <span className="text-base font-bold text-[var(--color-ink)] tracking-widest">{word.hint}</span>
            </Card>
          )}

          <Card tone="surface" pad="md">
            <p className="text-xs font-bold text-[var(--color-ink-3)] mb-1.5!">상세 설명</p>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed break-keep">{maskTerm(word.detailedMeaning, word.word)}</p>
          </Card>
        </Card>

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
              className={`w-full px-4 py-4 rounded-button text-sm font-medium outline-none border transition-colors
                ${status === 'correct' ? 'bg-success-500/10 border-success-500/40 text-success-400' :
                  status === 'wrong' ? 'bg-danger-500/10 border-danger-500/40 text-danger-400' :
                  'bg-[var(--color-card)] border-[var(--color-line-strong)] text-[var(--color-ink)] focus:border-brand-500'}
              `}
            style={{ caretColor: 'var(--color-brand-ink)' }}
            />
            {status === 'correct' && (
              <p className="text-xs font-bold text-success-400 mt-1.5! px-1">정답!{capped ? ' 오늘 보상 한도에 도달했어요' : lastEarned > 0 ? ` +${lastEarned}P` : ''}</p>
            )}
            {status === 'wrong' && (
              <p className="text-xs font-bold text-danger-400 mt-1.5! px-1">틀렸어요. 다시 시도해보세요!</p>
            )}
          </div>

          <button
            type="button"
            data-own-sfx
            onClick={() => handleSubmit()}
            disabled={status !== 'idle' || !input.trim()}
            className="w-full py-4 rounded-button bg-brand-500 text-xs font-bold active:opacity-90 disabled:opacity-30"
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
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-button bg-[var(--color-button-secondary)] text-xs font-bold text-[var(--color-ink-2)] active:opacity-70"
            >
              <Lightbulb size={13} className="text-[var(--color-ink-4)]" /> 초성 힌트
            </button>
          )}
          <button
            onClick={goNext}
            disabled={status !== 'idle'}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-button bg-[var(--color-button-secondary)] text-xs font-bold text-[var(--color-ink-2)] active:opacity-70 disabled:opacity-40"
          >
            <ChevronRight size={13} /> 건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
