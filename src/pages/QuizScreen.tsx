import { useState, useMemo, useEffect, useRef } from 'react';
import { Check, X, Flame, Share2, Target, TrendingUp } from '../components/ui/OtterIcons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { useSettings } from '../hooks/useSettings';
import { useCountUp } from '../hooks/useCountUp';
import { markNodeDone } from '../lib/pathProgress';
import { getGrowthStage } from '../constants';
import { feedbackCorrect, feedbackWrong, feedbackQuizComplete, feedbackTierUp } from '../lib/feedback';
import { logClick } from '../lib/analytics';
import { shareTossLink } from '../lib/share';
import { Card } from '../components/ui/Card';
import { ActionButton } from '../components/ui/ActionButton';
import { PointIcon, XpIcon } from '../components/StatIcons';
import { buildQuizItem, pickQuizType, type QuizOption } from '../lib/quiz';
import { shouldScheduleRetry } from '../lib/review';
import { takeShuffled } from '../lib/random';
import { LearningCompletionScreen } from '../components/learning/LearningCompletionScreen';
import { LearningEmptyState } from '../components/learning/LearningEmptyState';
import { LearningStatRow } from '../components/learning/LearningStatRow';
import { QuizProgressHeader } from '../components/learning/QuizProgressHeader';
import { PraiseNote } from '../components/PraiseNote';
import { praiseForAnswer, praiseForQuiz } from '../lib/praise';
import { keepShortUnitsTogether } from '../lib/formatText';

// 결과의 장식 아이콘은 숫자와 분리하고 항목명 왼쪽에 같은 규격으로 둔다.
const resultIconProps = { size: 18, strokeWidth: 1.8, className: 'quiz-result-icon', 'aria-hidden': true } as const;

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
  // 틀린 문제는 끝에 다시 붙인다 — 전부 맞힐 때까지 끝나지 않고, 그 전엔 노드도 완료되지 않는다
  const [retryQueue, setRetryQueue] = useState<Word[]>([]);
  const quizQueue: Word[] = [...baseQueue, ...retryQueue];

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  // 티어는 XP 기준이다. 부스트로 배수가 붙을 수 있어 클라에서 계산하지 않고 시작 시점 값을 기억한다.
  const xpAtStart = useRef(xp);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [totalEarned, setTotalEarned] = useState(0);
  const [lastEarned, setLastEarned] = useState(0);
  const [capped, setCapped] = useState(false);   // 하루 보상 한도(서버) 도달
  const [showPointPop, setShowPointPop] = useState(false);
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
  const earnedShown = useCountUp(totalEarned);
  const quizItem = useMemo(() => {
    if (!currentWord) return null;
    return buildQuizItem(pickQuizType(currentWord), currentWord, knownWords, allWords, categoryOf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord?.id, allWords, knownWords, categoryOf]);

  // +P 팝업 트리거
  useEffect(() => {
    if (showPointPop) {
      const t = setTimeout(() => setShowPointPop(false), 700);
      return () => clearTimeout(t);
    }
  }, [showPointPop]);

  // 퀴즈 완료 시 앱 리뷰 요청 (플랫폼이 노출 제어)
  const finished = quizQueue.length > 0 && currentQuizIndex >= quizQueue.length;
  useEffect(() => {
    if (!finished || completedRef.current) return;
    completedRef.current = true;
    // 승급이면 웅장하게, 아니면 정답률에 따라
    if (getGrowthStage(xp).id > getGrowthStage(xpAtStart.current).id) feedbackTierUp();
    else feedbackQuizComplete(correctCount === quizQueue.length);
    logClick('quiz_complete', { mode, total: baseQueue.length, correct: firstCorrect, attempts: quizQueue.length, node_id: navState?.nodeId ?? navState?.lessonId, course_id: navState?.courseId });
    if (navState?.nodeId) markNodeDone(navState.nodeId);   // 패스의 퀴즈·복습 노드를 완료 표시
    void refreshWallet();   // m4(퀴즈 N문제)·50XP 보너스는 서버가 올린다 — 세션 끝에 한 번 읽는다
  }, [correctCount, firstCorrect, finished, navState?.nodeId, navState?.lessonId, navState?.courseId, mode, baseQueue.length, quizQueue.length, refreshWallet, xp]);

  // 풀 문제가 없을 때(아는 단어 0개로 딥링크 진입 등). 완료 화면으로 보내면 "0문제 완료 🎉"가 뜬다.
  if (quizQueue.length === 0) {
    return (
      <LearningEmptyState
        title="아직 풀 문제가 없어요"
        description="자주 마주치는 용어를 먼저 보면 퀴즈를 풀 수 있어요."
        actionLabel="시작하러 가기"
        onAction={() => navigate('/course')}
      />
    );
  }

  // 완료 화면
  if (currentQuizIndex >= quizQueue.length) {
    const accuracy = baseQueue.length > 0 ? Math.round((firstCorrect / baseQueue.length) * 100) : 0;
    const stageBefore = getGrowthStage(xpAtStart.current);
    const stageAfter = getGrowthStage(xp);
    const stageUp = stageAfter.id > stageBefore.id;
    const completionTitle = navState?.mode === 'lesson_warmup'
      ? '준비 완료!'
      : navState?.mode === 'course_review'
        ? '다시 보기 완료!'
        : '확인 완료!';

    return (
      <LearningCompletionScreen
        mascot="great"
        title={completionTitle}
        subtitle={`${baseQueue.length}문제 완료${retryQueue.length > 0 ? ` · 다시 푼 문제 ${retryQueue.length}개` : ''}`}
        actionLabel={navState?.nextRoute?.label ?? (backPath.startsWith('/course') ? '주제로 돌아가기' : '퀘스트로')}
        onAction={() => navState?.nextRoute
          ? navigate(navState.nextRoute.pathname, navState.nextRoute.state === undefined ? undefined : { state: navState.nextRoute.state })
          : navigate(backPath)}
      >
        <Card pad="lg" className="quiz-result-stats w-full flex flex-col gap-4 anim-fade-up" role="group" aria-label="퀴즈 결과 요약" style={{ '--i': 2 } as React.CSSProperties}>
          <LearningStatRow label="모은 조개" icon={<PointIcon size={18} className="quiz-result-icon" />} withDivider={false}>
            <span className="shrink-0 text-xl font-bold text-brand-500">+{earnedShown}개</span>
          </LearningStatRow>
          <LearningStatRow label="획득 XP" icon={<XpIcon size={18} className="quiz-result-icon" />}>
            <span className="shrink-0 text-xl font-bold text-[var(--color-ink)]">+{Math.max(0, xp - xpAtStart.current)}</span>
          </LearningStatRow>
          <LearningStatRow label="첫 시도 정답률" icon={<Target {...resultIconProps} />}>
            <span className="text-xl font-bold text-[var(--color-ink)]">{accuracy}%</span>
          </LearningStatRow>
          <LearningStatRow label="최고 연속 정답" icon={<Flame {...resultIconProps} />}>
            <span className="shrink-0 text-xl font-bold text-[var(--color-ink)]">{maxCombo}연속</span>
          </LearningStatRow>
          {stageUp && (
            <LearningStatRow label="단계 변화" icon={<TrendingUp {...resultIconProps} />}>
              <span className="text-sm font-bold text-[var(--color-ink)]">{stageBefore.name} → {stageAfter.name} 승급!</span>
            </LearningStatRow>
          )}
        </Card>
        <PraiseNote
          title="오늘 확인한 내용"
          body={praiseForQuiz({ accuracy, maxCombo, total: baseQueue.length })}
          className="w-full anim-fade-up"
          style={{ '--i': 3 } as React.CSSProperties}
        />
        <Card pad="md" className="w-full anim-fade-up" style={{ '--i': 4 } as React.CSSProperties}>
          <p className="text-xs font-bold text-[var(--color-info)] mb-1.5!">이번에 확인한 내용</p>
          <p className="text-sm font-semibold text-[var(--color-ink)] leading-relaxed break-keep">처음 푼 {baseQueue.length}문제 중 {firstCorrect}개에 정답을 골랐어요. 나중에 다시 보며 기억을 확인해요.</p>
        </Card>
        <Card tone="surface" pad="md" className="w-full flex flex-col gap-3 anim-fade-up" style={{ '--i': 5 } as React.CSSProperties}>
          <div className="flex items-start gap-3">
            <Share2 {...resultIconProps} className="quiz-result-icon mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--color-ink)]">오늘의 성과 공유하기</p>
              <p className="mt-1! text-xs text-[var(--color-ink-3)] leading-relaxed break-keep">
                정답률과 오늘 확인한 용어가 담긴 토스 링크를 보낼 수 있어요.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logClick('quiz_result_share', { mode: navState?.mode ?? 'quiz', total: baseQueue.length, accuracy, max_combo: maxCombo });
              void shareTossLink('intoss://moneytermi/course', quizShareMessage(sessionLabel, baseQueue.length, accuracy, maxCombo, baseQueue));
            }}
            className="action-secondary w-full min-h-[46px] rounded-button text-sm font-bold active:opacity-90"
          >
            친구에게 공유
          </button>
        </Card>
      </LearningCompletionScreen>
    );
  }

  // 진행률 = 맞힌 문제 / 원래 문제 수. 틀린 문제가 뒤에 붙어도 줄지 않는다(단어마다 정답은 한 번뿐이라 correctCount가 곧 끝낸 수)
  const progressPercent = Math.min(100, (correctCount / baseQueue.length) * 100);
  const retrying = currentQuizIndex >= baseQueue.length;

  const handleSelect = async (option: QuizOption) => {
    if (status !== 'idle') return;
    setSelected(option.answer);
    // 즉시 피드백은 낙관적 (정답 단어는 클라가 이미 앎). 포인트·콤보는 서버가 채점.
    const isCorrect = option.isCorrect;
    const firstAttempt = currentQuizIndex < baseQueue.length;
    logClick('quiz_answer', { mode, word_id: currentWord.id, correct: isCorrect, first_attempt: firstAttempt, node_id: navState?.nodeId ?? navState?.lessonId, course_id: navState?.courseId });
    if (firstAttempt && isCorrect) setFirstCorrect(value => value + 1);
    if (reviewMode && !reviewRecordedIds.current.has(currentWord.id)) {
      reviewRecordedIds.current.add(currentWord.id);
      void recordReview(currentWord.id, isCorrect, false);
    }

    if (isCorrect) {
      feedbackCorrect(soundOn, vibrationOn, combo + 1);
      setStatus('correct');
      setCorrectCount(c => c + 1);
      setLastEarned(0);   // 응답 전엔 이전 문제 금액이 남지 않게
      setCapped(false);

      const res = await submitQuizAnswer(currentWord.id, option.answer, 'mc', false, currentQuizIndex === 0);
      const nextCombo = res ? res.combo : combo + 1;   // 서버 응답이 없으면(오프라인) 로컬로 센다
      setCombo(nextCombo);
      setMaxCombo(m => Math.max(m, nextCombo));
      if (res) {
        setTotalEarned(t => t + res.earned);
        setLastEarned(res.earned);
        setCapped(res.capped);
        if (res.earned > 0) setShowPointPop(true);
      }
      // 다음 문제로는 하단 패널의 계속하기가 넘긴다
    } else {
      feedbackWrong();
      setCombo(0);
      setStatus('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (shouldScheduleRetry(quizQueue, currentQuizIndex, currentWord.id)) {
        setRetryQueue(q => [...q, currentWord]);
      }
      // 서버 콤보도 초기화 (오답 기록). 다음 정답 응답과 순서가 뒤바뀌지 않게 기다린다. 정답을 보여주고 계속하기로 다음 문제.
      await submitQuizAnswer(currentWord.id, option.answer, 'mc', false, currentQuizIndex === 0);
    }
  };

  // 패널의 계속하기: 다음 문제
  const goNextQuestion = () => {
    setCurrentQuizIndex(i => i + 1);
    setSelected(null);
    setStatus('idle');
  };

  // 스트릭 메시지
  const streakMessage = combo >= 5 ? `${combo}연속! x2 보너스` : combo >= 3 ? `${combo}연속! 조개 5개 보너스` : null;
  // 쉬운 예시(데이터 앞의 '학습용 가정:' 표시는 뺀다). 없으면 뜻
  const example = currentWord?.learningExample?.replace(/^학습용 가정:\s*/, '') || currentWord?.meaning;
  const answeredCorrectly = status === 'correct';
  const feedbackTone = answeredCorrectly
    ? {
        icon: <Check size={16} strokeWidth={3} />,
        title: praiseForAnswer(combo),
        helper: '예시로 한 번 더 연결해요',
        accentText: 'text-success-500',
        accentBg: 'bg-[var(--color-success-soft)]',
        accentBorder: 'border-success-500/30',
      }
    : {
        icon: <X size={16} strokeWidth={3} />,
        title: '정답을 확인했어요',
        helper: '위의 내 답과 비교해요',
        accentText: 'text-[var(--color-ink)]',
        accentBg: 'bg-[var(--color-surface)]',
        accentBorder: 'border-[var(--color-line)]',
      };
  const visibleOptions = (quizItem?.options ?? [])
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => status === 'idle' || selected === null || selected === option.answer);

  return (
    <div className="quiz-screen app-soft-screen flex flex-col h-full">
      <QuizProgressHeader
        label={retrying ? `다시 풀기 · 남은 ${quizQueue.length - currentQuizIndex}문제` : `${sessionLabel} · ${currentQuizIndex + 1} / ${baseQueue.length}`}
        progress={progressPercent}
        streakText={streakMessage}
        durationClass="duration-500"
        right={(
          <div className="relative ml-auto h-5 w-12">
            {showPointPop && (
              <span
                key={totalEarned}
                className="anim-reward-rise absolute -top-1 right-0 text-xs font-bold text-brand-500 whitespace-nowrap"
              >
                +{lastEarned}개
              </span>
            )}
          </div>
        )}
      />

      {/* 콘텐츠 — 뜻 보기 4개가 길면 작은 화면에서 넘치므로 이 영역만 스크롤 */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-5 pt-3 pb-5 gap-4 [&::-webkit-scrollbar]:hidden">
        {/* 문제 카드 */}
        <div key={currentQuizIndex} className={`quiz-question-card anim-slide-in rounded-card bg-[var(--color-card)] px-5 py-5 flex flex-col items-start text-left gap-3
          ${status === 'correct' ? 'anim-answer-wash' : ''}
          ${shake ? 'anim-soft-nudge' : ''}
        `}>
          <span className="text-xs font-bold text-brand-600">{quizItem?.promptLabel}</span>

          <h2 className="quiz-prompt-main w-full text-[22px] font-bold text-[var(--color-ink)] leading-[1.5] break-keep">
            {keepShortUnitsTogether(quizItem?.promptMain ?? '')}
          </h2>

          {quizItem?.promptSub && (
            <div className="w-full border-t border-[var(--color-line)] pt-3">
              <p className="text-sm text-[var(--color-ink-2)] leading-relaxed break-keep">{keepShortUnitsTogether(quizItem.promptSub)}</p>
            </div>
          )}

        </div>

        {/* 객관식 선택지: 유형과 무관하게 한 줄에 하나 */}
        <div className="grid grid-cols-1 gap-2.5">
          {visibleOptions.map(({ option: opt, index: i }, rowIndex) => {
            const isSelected = selected === opt.answer;
            const isCorrectOption = opt.isCorrect;
            // 색은 배경·테두리·아이콘에만. 보기 글자는 어떤 상태에서도 진하게 둔다
            let optionStyle = 'bg-[var(--color-card)] border-[var(--color-line)] text-[var(--color-ink)] active:border-brand-300 active:bg-[var(--color-brand-soft)]';
            if (status !== 'idle') {
              optionStyle = isCorrectOption ? 'bg-[var(--color-success-soft)] border-success-500/55 text-[var(--color-ink)]'
                : isSelected ? 'bg-[var(--color-card)] border-danger-300/50 text-[var(--color-ink)]'
                : 'bg-[var(--color-card)] border-[var(--color-line)] text-[var(--color-ink-3)]';
            }
            const tag = status === 'idle' ? null : isCorrectOption ? '정답' : isSelected ? '내 답' : null;
            const feedbackMotion = status !== 'idle' && (isCorrectOption || isSelected) ? 'anim-choice-lock' : '';
            const markerClass = status === 'idle'
              ? 'border border-[var(--color-line-strong)] bg-[var(--color-card)] text-[var(--color-ink-3)]'
              : isCorrectOption
                ? 'bg-success-500 text-white'
                : isSelected
                  ? 'border border-danger-300/70 bg-[var(--color-danger-soft)] text-danger-500'
                  : 'border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-4)]';

            return (
              <button
                key={`${i}-${opt.answer}`}
                onClick={() => handleSelect(opt)}
                className={`quiz-option anim-fade-up ${feedbackMotion} flex items-center gap-3 min-h-[64px] py-4 px-4 border text-base font-semibold leading-relaxed text-left break-keep transition-colors duration-150 ${optionStyle}`}
                style={{ '--i': rowIndex + 1, borderRadius: 'var(--shape-button)' } as React.CSSProperties}
              >
                <span className={`w-7 h-7 shrink-0 flex items-center justify-center text-xs font-semibold ${markerClass}`} style={{ borderRadius: 9999 }}>
                  {status !== 'idle' && isCorrectOption ? <Check size={14} strokeWidth={3} /> : status !== 'idle' && isSelected ? <X size={14} strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">{keepShortUnitsTogether(opt.label)}</span>
                {tag && (
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-2xs font-black ${isCorrectOption ? 'bg-[var(--color-card)] text-success-500' : 'bg-[var(--color-surface)] text-[var(--color-ink-4)]'}`}>
                    {tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {status === 'wrong' && (
          <div key={`wrong-${currentQuizIndex}`} className="quiz-feedback-inline anim-feedback-panel rounded-card border border-[var(--color-line)] bg-[var(--color-card)] px-4 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${feedbackTone.accentBg} ${feedbackTone.accentBorder} ${feedbackTone.accentText}`}>
                  {feedbackTone.icon}
                </span>
                <div className="min-w-0">
                  <p className={`text-lg font-bold leading-snug ${feedbackTone.accentText}`}>
                    {feedbackTone.title}
                  </p>
                  <p className="mt-0.5! text-xs font-semibold text-[var(--color-ink-4)]">{feedbackTone.helper}</p>
                </div>
              </div>
              <div className="rounded-card border border-[var(--color-line)] bg-[var(--color-card)] px-4 py-3.5">
                <p className="mb-1! text-2xs font-black text-[var(--color-ink-4)]">정답</p>
                <p className="text-base font-black text-[var(--color-ink)]">{currentWord.word}</p>
                <p className="mt-1! text-sm font-medium text-[var(--color-ink-2)] leading-relaxed break-keep">{keepShortUnitsTogether(currentWord.meaning)}</p>
              </div>
              <ActionButton
                onClick={goNextQuestion}
                fullWidth
                tone="primary"
              >
                {currentQuizIndex === quizQueue.length - 1 ? '결과 보기' : '다음 문제'}
              </ActionButton>
            </div>
          </div>
        )}
      </div>

      {/* 답을 고른 뒤: 선택지는 채점 표시, 하단은 다음 행동과 해설에 집중한다. */}
      {answeredCorrectly && (
        <div key={currentQuizIndex} className="quiz-feedback-sheet anim-feedback-panel rounded-t-[var(--shape-card)] border-t border-[var(--color-line)] bg-[var(--color-card)] px-5 pt-3 pb-8">
          <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--color-line)]" />
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${feedbackTone.accentBg} ${feedbackTone.accentBorder} ${feedbackTone.accentText}`}>
                  {feedbackTone.icon}
                </span>
                <div className="min-w-0">
                  <p className={`text-lg font-bold leading-snug ${feedbackTone.accentText}`}>
                    {feedbackTone.title}
                  </p>
                  <p className="mt-0.5! text-xs font-semibold text-[var(--color-ink-4)]">{feedbackTone.helper}</p>
                </div>
              </div>
              {answeredCorrectly && (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--color-brand-soft)] px-2.5 py-1 text-2xs font-black text-brand-600">
                  {capped ? <span className="text-[var(--color-ink-3)]">한도 도달</span> : lastEarned > 0 ? `+${lastEarned}개` : null}
                  {combo >= 3 && <span className="flex items-center gap-0.5"><Flame size={12} className="fill-current" />{combo}연속</span>}
                </span>
              )}
            </div>

            {answeredCorrectly ? (
              <div className="rounded-card border border-[var(--color-line)] bg-[var(--color-card)] px-4 py-3.5">
                <p className="text-2xs font-black text-[var(--color-ink-4)] mb-1.5!">이렇게 쓰여요</p>
                <p className="text-sm font-medium text-[var(--color-ink)] leading-relaxed break-keep">{keepShortUnitsTogether(example)}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="rounded-card border border-success-500/25 bg-[var(--color-success-soft)] px-4 py-3.5">
                  <p className="mb-1! text-2xs font-black text-success-500">정답</p>
                  <p className="text-base font-black text-[var(--color-ink)]">{currentWord.word}</p>
                  <p className="mt-1! text-sm font-medium text-[var(--color-ink-2)] leading-relaxed break-keep">{keepShortUnitsTogether(currentWord.meaning)}</p>
                </div>
              </div>
            )}

            <ActionButton
              onClick={goNextQuestion}
              fullWidth
              tone="primary"
            >
              {currentQuizIndex === quizQueue.length - 1 ? '결과 보기' : '다음 문제'}
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;
