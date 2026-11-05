import { useState, useMemo, useEffect, useRef } from 'react';
import { Check, X } from '../components/ui/OtterIcons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { markNodeDone } from '../lib/pathProgress';
import { feedbackCorrect, feedbackWrong, feedbackQuizComplete } from '../lib/feedback';
import { logClick } from '../lib/analytics';
import { shareTossLink } from '../lib/share';
import { ActionButton } from '../components/ui/ActionButton';
import { XpIcon } from '../components/StatIcons';
import { buildQuizItem, pickQuizType, type QuizOption } from '../lib/quiz';
import { shouldScheduleRetry } from '../lib/review';
import { takeShuffled } from '../lib/random';
import { LearningCompletionScreen } from '../components/learning/LearningCompletionScreen';
import { LearningEmptyState } from '../components/learning/LearningEmptyState';
import { QuizProgressHeader } from '../components/learning/QuizProgressHeader';
import { praiseForAnswer, praiseForQuiz } from '../lib/praise';
import { keepShortUnitsTogether } from '../lib/formatText';
import { QuizAnswerFeedback } from '../components/learning/QuizAnswerFeedback';
import { createQuizRequestId, type QuizAnswerResult } from '../lib/quizSubmission';

const quizShareMessage = (modeLabel: string, total: number, accuracy: number, maxCombo: number, words: Word[]) => {
  const learned = words.slice(0, 3).map(word => word.word).join(' · ');
  const comboText = maxCombo >= 3 ? ` 최고 ${maxCombo}연속 정답.` : '';
  const learnedText = learned ? ` 오늘 확인한 용어: ${learned}.` : '';
  return `머니터미에서 ${modeLabel} ${total}문제 ${accuracy}% 달성!${comboText}${learnedText} 경제 공부, 쉬운 상황부터 같이 시작해요`;
};

const QuizScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { xp, allWords, knownWords, courses, submitQuizAnswer, recordReview, refreshWallet } = useAppContext();
  const { user } = useAuth();

  // 단어 id → 코스 카테고리 (오답 보기를 같은 주제로 뽑기 위함)
  const categoryOf = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of courses) for (const w of c.words) map.set(w.id, c.category);
    return (id: number) => map.get(id);
  }, [courses]);

  const navState = location.state as {
    quizQueue?: Word[];
    backPath?: string;
    nodeId?: string;
    lessonId?: string;
    courseId?: string;
    reviewMode?: boolean;
    mode?: 'lesson_recall' | 'lesson_warmup' | 'course_review' | 'course_quiz';
    nextRoute?: { pathname: string; state?: unknown; label?: string };
  } | null;
  const passedQueue: Word[] = navState?.quizQueue ?? [];
  const mode = navState?.mode ?? 'quiz';
  const backPath = navState?.backPath ?? '/home';
  const reviewMode = navState?.reviewMode === true || navState?.mode === 'lesson_recall' || navState?.mode === 'lesson_warmup' || navState?.mode === 'course_review';
  const sessionLabel = navState?.mode === 'lesson_warmup'
    ? '가볍게 다시 보기'
    : navState?.mode === 'lesson_recall'
      ? '방금 본 용어'
      : navState?.mode === 'course_review'
        ? '누적 복습'
        : '퀴즈';
  // state 없이 진입하면 아는 단어 10개를 한 번만 섞는다. 렌더마다 섞으면 문제가 바뀐다.
  const [randomQueue, setRandomQueue] = useState<Word[]>([]);
  useEffect(() => {
    if (passedQueue.length > 0 || knownWords.length === 0) return;
    setRandomQueue(current => current.length > 0 ? current : takeShuffled(knownWords, 10));
  }, [passedQueue.length, knownWords]);
  const baseQueue: Word[] = passedQueue.length > 0 ? passedQueue : randomQueue;
  // 오답은 다른 문제 뒤에 재출제한다. 마지막 문제는 무한 반복하지 않는다.
  const [retryQueue, setRetryQueue] = useState<Word[]>([]);
  const quizQueue: Word[] = [...baseQueue, ...retryQueue];

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  // 티어는 XP 기준이다. 부스트로 배수가 붙을 수 있어 클라에서 계산하지 않고 시작 시점 값을 기억한다.
  const xpAtStart = useRef(xp);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [answerPending, setAnswerPending] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const answerLock = useRef(false);
  const attemptRef = useRef<{ requestId: string; wordId: number; answer: string; receipt: QuizAnswerResult | null } | null>(null);
  const [gradingConflict, setGradingConflict] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const questionContentRef = useRef<HTMLDivElement>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [firstCorrect, setFirstCorrect] = useState(0);
  const [shake, setShake] = useState(false);
  const { soundOn, vibrationOn } = useSettings();
  const reviewRecordedIds = useRef<Set<number>>(new Set());
  const completedRef = useRef(false);
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current || baseQueue.length === 0) return;
    startedRef.current = true;
    logClick('quiz_start', { mode, total: baseQueue.length, node_id: navState?.nodeId ?? navState?.lessonId, course_id: navState?.courseId });
  }, [baseQueue.length, mode, navState?.nodeId, navState?.lessonId, navState?.courseId]);

  const currentWord = quizQueue[currentQuizIndex];
  const quizItem = useMemo(() => {
    if (!currentWord) return null;
    return buildQuizItem(pickQuizType(currentWord), currentWord, knownWords, allWords, categoryOf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord?.id, allWords, knownWords, categoryOf]);

  // 퀴즈 완료 시 앱 리뷰 요청 (플랫폼이 노출 제어)
  const finished = quizQueue.length > 0 && currentQuizIndex >= quizQueue.length;
  useEffect(() => {
    if (!finished || completedRef.current) return;
    completedRef.current = true;
    // 등급은 주간 순위로 오르므로(서버 정산) 퀴즈 중에는 승급이 없다. 정답률에 따라서만 피드백한다
    feedbackQuizComplete(correctCount === quizQueue.length);
    logClick('quiz_complete', { mode, total: baseQueue.length, correct: firstCorrect, attempts: quizQueue.length, node_id: navState?.nodeId ?? navState?.lessonId, course_id: navState?.courseId });
    if (navState?.nodeId) markNodeDone(navState.nodeId, user?.id);   // 패스의 퀴즈·복습 노드를 완료 표시
    void refreshWallet();   // m4(퀴즈 N문제)·50XP 보너스는 서버가 올린다 — 세션 끝에 한 번 읽는다
  }, [correctCount, firstCorrect, finished, navState?.nodeId, navState?.lessonId, navState?.courseId, mode, baseQueue.length, quizQueue.length, refreshWallet, xp]);

  useEffect(() => {
    if (finished) return;
    answerLock.current = false;
    if (questionContentRef.current) questionContentRef.current.scrollTop = 0;
    questionHeadingRef.current?.focus({ preventScroll: true });
  }, [currentWord?.id, currentQuizIndex, finished]);

  useEffect(() => {
    if (status !== 'idle' || answerPending || !submissionMessage) return;
    questionContentRef.current?.querySelector<HTMLButtonElement>('.quiz-option[aria-pressed="true"]')?.scrollIntoView?.({ block: 'nearest' });
  }, [status, answerPending, submissionMessage]);

  // 풀 문제가 없을 때(아는 단어 0개로 딥링크 진입 등). 완료 화면으로 보내면 "0문제 완료 🎉"가 뜬다.
  if (quizQueue.length === 0) {
    return (
      <LearningEmptyState
        title="아직 풀 문제가 없어요"
        description="자주 마주치는 용어를 먼저 보면 퀴즈를 풀 수 있어요."
        actionLabel="시작하러 가기"
        onAction={() => navigate('/course', { replace: true })}
      />
    );
  }

  // 완료 화면
  if (currentQuizIndex >= quizQueue.length) {
    const accuracy = baseQueue.length > 0 ? Math.round((firstCorrect / baseQueue.length) * 100) : 0;
    const completionTitle = navState?.mode === 'lesson_warmup'
      ? '준비 완료!'
      : navState?.mode === 'course_review'
        ? '다시 보기 완료!'
        : '확인 완료!';

    return (
      <LearningCompletionScreen
        title={completionTitle}
        subtitle={<>{`${baseQueue.length}문제 완료${retryQueue.length > 0 ? ` · 다시 푼 문제 ${retryQueue.length}개` : ''}`}<br />{praiseForQuiz({ accuracy, maxCombo, total: baseQueue.length })}</>}
        actionLabel={navState?.nextRoute?.label ?? (backPath.startsWith('/course') ? '주제로 돌아가기' : '퀘스트로')}
        onAction={() => navState?.nextRoute
          ? navigate(navState.nextRoute.pathname, { replace: true, state: navState.nextRoute.state })
          : navigate(backPath, { replace: true, state: { openFocus: true } })}
      >
        {/* 끝 화면은 핵심 숫자 하나와 보상 한 줄만 크게 보여준다(피크엔드) */}
        <section className="quiz-result-stats w-full flex flex-col items-center gap-1 text-center anim-fade-up" role="group" aria-label="퀴즈 결과 요약" style={{ '--i': 2 } as React.CSSProperties}>
          <p className="text-xs text-[var(--color-ink-3)]">첫 시도 정답률</p>
          <p className="text-4xl font-bold text-[var(--color-ink)] tabular-nums">{accuracy}%</p>
          <p className="mt-3! flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-base font-bold tabular-nums">
            <span className="inline-flex items-center gap-1 text-[var(--color-ink)]"><XpIcon size={20} className="quiz-result-icon" /><span>획득 XP</span><span>+{Math.max(0, xp - xpAtStart.current)}</span></span>
          </p>
          <p className="mt-1! text-xs text-[var(--color-ink-3)]">최고 {maxCombo}연속</p>
        </section>
        <button
          type="button"
          className="press-fade min-h-11 px-3 text-sm font-semibold text-[var(--color-ink-2)] anim-fade-up"
          style={{ '--i': 3 } as React.CSSProperties}
          onClick={() => {
            logClick('quiz_result_share', { mode: navState?.mode ?? 'quiz', total: baseQueue.length, accuracy, max_combo: maxCombo });
            void shareTossLink('intoss://moneytermi/course', quizShareMessage(sessionLabel, baseQueue.length, accuracy, maxCombo, baseQueue));
          }}
        >
          친구에게 공유
        </button>
      </LearningCompletionScreen>
    );
  }

  // 서버에서 정답으로 확인한 횟수를 기준으로 표시하며 재출제로 분모가 늘어나지 않는다.
  const progressPercent = Math.min(100, (correctCount / baseQueue.length) * 100);
  const retrying = currentQuizIndex >= baseQueue.length;

  const handleSelect = async (option: QuizOption) => {
    if (status !== 'idle' || answerLock.current) return;
    answerLock.current = true;
    setAnswerPending(true);
    setSubmissionMessage(null);
    try {
      const attempt = attemptRef.current ?? {
        requestId: createQuizRequestId(), wordId: currentWord.id, answer: option.answer, receipt: null,
      };
      attemptRef.current = attempt;
      setSelected(attempt.answer);
      const res = attempt.receipt ?? await submitQuizAnswer(attempt.wordId, attempt.answer, 'mc', false, currentQuizIndex === 0, attempt.requestId);
      if (!mountedRef.current) return;
      if (!res) {
        setSubmissionMessage('답안 전송을 확인하지 못했어요. 같은 답안으로 다시 저장해 주세요.');
        return;
      }
      attempt.receipt = res;
      if (reviewMode && !reviewRecordedIds.current.has(attempt.wordId)) {
        const saved = await recordReview(attempt.wordId, res.correct, false);
        if (!mountedRef.current) return;
        if (!saved) {
          setSubmissionMessage('복습 일정 저장을 확인하지 못했어요. 같은 답안으로 다시 저장해 주세요.');
          return;
        }
        reviewRecordedIds.current.add(attempt.wordId);
      }
      const firstAttempt = currentQuizIndex < baseQueue.length;
      logClick('quiz_answer', { mode, word_id: attempt.wordId, correct: res.correct, first_attempt: firstAttempt, node_id: navState?.nodeId ?? navState?.lessonId, course_id: navState?.courseId });
      if (firstAttempt && res.correct) setFirstCorrect(value => value + 1);
      setCombo(res.combo);
      setMaxCombo(value => Math.max(value, res.combo));
      const conflict = res.correct !== option.isCorrect;
      setGradingConflict(conflict);
      if (conflict) setSubmissionMessage('문제 정보와 서버 채점이 달라 정답 표시를 생략했어요. 최신 학습 내용으로 다시 확인해 주세요.');
      setStatus(res.correct ? 'correct' : 'wrong');
      if (res.correct) {
        feedbackCorrect(soundOn, vibrationOn, res.combo);
        setCorrectCount(value => value + 1);
      } else {
        feedbackWrong();
        setShake(true);
        setTimeout(() => { if (mountedRef.current) setShake(false); }, 500);
        if (shouldScheduleRetry(quizQueue, currentQuizIndex, attempt.wordId)) setRetryQueue(queue => [...queue, currentWord]);
      }
    } catch {
      if (mountedRef.current) setSubmissionMessage('답안 전송을 확인하지 못했어요. 같은 답안으로 다시 저장해 주세요.');
    } finally {
      answerLock.current = false;
      if (mountedRef.current) setAnswerPending(false);
    }
  };

  const goNextQuestion = () => {
    if (answerLock.current || answerPending || status === 'idle') return;
    answerLock.current = true;
    attemptRef.current = null;
    setGradingConflict(false);
    setCurrentQuizIndex(i => i + 1);
    setSelected(null);
    setStatus('idle');
    setSubmissionMessage(null);
  };
  const confirmAnswer = () => {
    const option = quizItem?.options.find(candidate => candidate.answer === selected);
    if (option) void handleSelect(option);
  };
  const streakMessage = combo >= 3 ? `${combo}연속!` : null;
  const answeredCorrectly = status === 'correct';
  const correctOption = quizItem?.options.find(option => option.isCorrect);
  const answerLabel = gradingConflict ? '' : quizItem?.type === 'word_to_meaning' ? currentWord.meaning : correctOption?.label ?? currentWord.word;
  const showGrading = status !== 'idle' && !gradingConflict;

  return (
    <div className="quiz-screen app-soft-screen flex flex-col h-full">
      <QuizProgressHeader
        label={retrying ? `다시 풀기 · 남은 ${quizQueue.length - currentQuizIndex}문제` : `${sessionLabel} · ${currentQuizIndex + 1} / ${baseQueue.length}`}
        progress={progressPercent}
        streakText={streakMessage}
        durationClass="duration-500"
      />

      {/* 콘텐츠 — 뜻 보기 4개가 길면 작은 화면에서 넘치므로 이 영역만 스크롤 */}
      <div ref={questionContentRef} className="quiz-question-content flex-1 min-h-0 overflow-y-auto flex flex-col px-5 pt-3 pb-5 gap-4 [&::-webkit-scrollbar]:hidden">
        {/* 문제 카드. 설명하는 수달은 카드 밖 왼쪽에 둔다 */}
        <div className="flex items-start gap-2">
        <img src="/otter/v5/otter-explain.svg" alt="" aria-hidden="true" height={88} className="quiz-question-otter h-[88px] w-auto shrink-0 self-start" data-otter="explain" />
        <div key={currentQuizIndex} className={`quiz-question-card anim-slide-in min-w-0 flex-1 rounded-card bg-[var(--color-card)] px-5 py-5 flex flex-col items-start text-left gap-3
          ${status === 'correct' ? 'anim-answer-wash' : ''}
          ${shake ? 'anim-soft-nudge' : ''}
        `}>
          <span className="text-xs text-[var(--color-ink-3)]">{quizItem?.promptLabel}</span>

          <h2 ref={questionHeadingRef} tabIndex={-1} className="quiz-prompt-main w-full text-xl font-semibold text-[var(--color-ink)] leading-normal break-keep">
            {keepShortUnitsTogether(quizItem?.promptMain ?? '')}
          </h2>

          {quizItem?.promptSub && (
            <div className="w-full border-t border-[var(--color-line)] pt-3">
              <p className="text-sm text-[var(--color-ink-2)] leading-relaxed break-keep">{keepShortUnitsTogether(quizItem.promptSub)}</p>
            </div>
          )}
        </div>
        </div>

        <p className="quiz-selection-guide">{status === 'idle' ? answerPending ? '답안 저장을 확인하고 있어요.' : submissionMessage ? '선택한 답안 그대로 다시 저장할 수 있어요.' : '' : gradingConflict ? '서버 채점 결과로 기록했어요. 문제 정보를 다시 확인해 주세요.' : '내 답과 정답을 비교해 보세요.'}</p>
        {/* 객관식 선택지는 채점 뒤에도 숨기지 않는다. */}
        <div className="grid grid-cols-1 gap-2">
          {(quizItem?.options ?? []).map((opt, i) => {
            const isSelected = selected === opt.answer;
            const isCorrectOption = opt.isCorrect;
            // 보기는 테두리 없는 연한 갈색 면. 고른 보기만 갈색 테두리로 표시한다. 보기 글자는 어떤 상태에서도 진하게 둔다
            let optionStyle = 'bg-[var(--color-choice)] border-transparent text-[var(--color-ink)] active:opacity-80';
            if (!showGrading && isSelected) optionStyle = 'bg-[var(--color-accent-soft)] border-[var(--color-progress)] text-[var(--color-ink)]';
            if (showGrading) {
              optionStyle = isCorrectOption ? 'bg-[var(--color-success-soft)] border-[var(--color-success-foreground)] text-[var(--color-ink)]'
                : isSelected ? 'bg-[var(--color-card)] border-[var(--color-line-strong)] border-dashed text-[var(--color-ink)]'
                : 'bg-[var(--color-choice)] border-transparent text-[var(--color-ink-3)]';
            }
            const tag = !showGrading ? (isSelected ? (status === 'idle' ? '선택' : '내 답') : null) : isCorrectOption ? '정답' : isSelected ? '내 답' : null;
            const feedbackMotion = showGrading && (isCorrectOption || isSelected) ? 'anim-choice-lock' : '';
            const markerClass = !showGrading
              ? isSelected ? 'bg-[var(--color-progress)] text-[var(--color-on-progress)]' : 'border border-[var(--color-line-strong)] bg-[var(--color-card)] text-[var(--color-ink-3)]'
              : isCorrectOption
                ? 'text-[var(--color-success-foreground)]'
                : isSelected
                  ? 'text-[var(--color-ink-3)]'
                  : 'border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-4)]';

            return (
              <button
                key={`${i}-${opt.answer}`}
                onClick={() => { if (status === 'idle' && !answerPending && !submissionMessage) setSelected(opt.answer); }}
                aria-pressed={isSelected}
                disabled={status !== 'idle' || answerPending || submissionMessage !== null}
                className={`quiz-option anim-fade-up ${feedbackMotion} flex items-center gap-3 min-h-[64px] py-4 px-4 border text-base font-normal leading-relaxed text-left break-keep transition-colors duration-150 ${optionStyle}`}
                style={{ '--i': i + 1, borderRadius: 'var(--shape-button)' } as React.CSSProperties}
              >
                {/* 채점 전 번호는 수달 3색 번호 그림(고르면 갈색 채움), 채점 뒤엔 체크·엑스 */}
                {!showGrading && i < 4
                  ? <img src={`/icons/num/num-${i + 1}${isSelected ? '-selected' : ''}.svg`} alt="" aria-hidden="true" width={28} height={28} className="shrink-0" data-num-icon />
                  : <span className={`w-7 h-7 shrink-0 flex items-center justify-center text-xs font-semibold ${markerClass}`} style={{ borderRadius: 9999 }}>
                    {showGrading && isCorrectOption ? <Check size={16} strokeWidth={3} /> : showGrading && isSelected ? <X size={16} strokeWidth={3} /> : i + 1}
                  </span>}
                <span className="min-w-0 flex-1">{keepShortUnitsTogether(opt.label)}</span>
                {tag && (
                  <span className={`shrink-0 text-xs font-bold ${showGrading && isCorrectOption ? 'text-[var(--color-success-foreground)]' : 'text-[var(--color-ink-3)]'}`}>
                    {tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {status === 'idle' ? (
        <footer className="quiz-confirm-footer">
          {submissionMessage && <p className="quiz-answer-network mb-3!" role="alert">{submissionMessage}</p>}
          <ActionButton fullWidth onClick={confirmAnswer} disabled={selected === null || answerPending} aria-busy={answerPending}>{answerPending ? '답안 확인 중...' : submissionMessage ? '다시 저장하기' : '정답 확인'}</ActionButton>
        </footer>
      ) : (
        <QuizAnswerFeedback key={currentQuizIndex}
          correct={answeredCorrectly} title={gradingConflict ? '서버 채점 결과를 반영했어요' : answeredCorrectly ? praiseForAnswer(combo) : '정답을 확인해요'}
          answerLabel={answerLabel} word={currentWord.word} meaning={gradingConflict ? '' : currentWord.meaning}
          explanation={gradingConflict ? undefined : quizItem?.explanation} example={gradingConflict ? undefined : currentWord.learningExample}
          pending={answerPending} submissionMessage={submissionMessage}
          combo={combo}
          nextLabel={currentQuizIndex === quizQueue.length - 1 ? '결과 보기' : '다음 문제'} onNext={goNextQuestion}
        />
      )}
    </div>
  );
};

export default QuizScreen;
