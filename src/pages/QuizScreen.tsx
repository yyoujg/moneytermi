import { useState, useMemo, useEffect, useRef } from 'react';
import { Check, X, Flame } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { useSettings } from '../hooks/useSettings';
import { useCountUp } from '../hooks/useCountUp';
import { markNodeDone } from '../lib/pathProgress';
import { getGrowthStage } from '../constants';
import { feedbackCorrect, feedbackWrong, feedbackQuizComplete, feedbackTierUp } from '../lib/feedback';
import { requestAppReview } from '../lib/review';
import { logClick } from '../lib/analytics';
import { Card } from '../components/ui/Card';
import { PointIcon, XpIcon } from '../components/StatIcons';
import { buildQuizItem, pickQuizType, type QuizOption } from '../lib/quiz';
import { shouldScheduleRetry } from '../lib/review';
import { takeShuffled } from '../lib/random';
import { learningOutcomeFor } from '../lib/learningOutcome';
import { LearningCompletionScreen } from '../components/learning/LearningCompletionScreen';
import { LearningEmptyState } from '../components/learning/LearningEmptyState';
import { LearningStatRow } from '../components/learning/LearningStatRow';
import { QuizProgressHeader } from '../components/learning/QuizProgressHeader';

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
    reviewMode?: boolean;
    mode?: 'lesson_recall' | 'lesson_warmup' | 'course_review';
    nextRoute?: { pathname: string; state?: unknown; label?: string };
  } | null;
  const passedQueue: Word[] = navState?.quizQueue ?? [];
  const backPath = navState?.backPath ?? '/home';
  const reviewMode = navState?.reviewMode === true || navState?.mode === 'lesson_recall' || navState?.mode === 'lesson_warmup' || navState?.mode === 'course_review';
  const sessionLabel = navState?.mode === 'lesson_warmup'
    ? '기억 깨우기'
    : navState?.mode === 'lesson_recall'
      ? '방금 배운 단어'
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
  const [shake, setShake] = useState(false);
  const { soundOn, vibrationOn } = useSettings();
  const reviewRecordedIds = useRef<Set<number>>(new Set());
  const completedRef = useRef(false);

  const currentWord = quizQueue[currentQuizIndex];
  const earnedShown = useCountUp(totalEarned);
  const wordByName = useMemo(() => {
    const map = new Map<string, Word>();
    for (const word of allWords) map.set(word.word, word);
    return map;
  }, [allWords]);

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
    logClick('quiz_complete', { mode: 'quiz', total: quizQueue.length, correct: correctCount, node_id: navState?.nodeId });
    if (navState?.nodeId) markNodeDone(navState.nodeId);   // 패스의 퀴즈·복습 노드를 완료 표시
    requestAppReview();
    void refreshWallet();   // m4(퀴즈 N문제)·50XP 보너스는 서버가 올린다 — 세션 끝에 한 번 읽는다
  }, [correctCount, finished, navState?.nodeId, quizQueue.length, refreshWallet, xp]);

  // 풀 문제가 없을 때(아는 단어 0개로 딥링크 진입 등). 완료 화면으로 보내면 "0문제 완료 🎉"가 뜬다.
  if (quizQueue.length === 0) {
    return (
      <LearningEmptyState
        title="아직 풀 문제가 없어요"
        description="단어를 먼저 배우면 배운 단어로 퀴즈를 낼 수 있어요."
        actionLabel="학습하러 가기"
        onAction={() => navigate('/course')}
      />
    );
  }

  // 완료 화면
  if (currentQuizIndex >= quizQueue.length) {
    const accuracy = quizQueue.length > 0 ? Math.round((correctCount / quizQueue.length) * 100) : 0;
    const stageBefore = getGrowthStage(xpAtStart.current);
    const stageAfter = getGrowthStage(xp);
    const stageUp = stageAfter.id > stageBefore.id;
    const completionTitle = navState?.mode === 'lesson_warmup'
      ? '준비 완료!'
      : navState?.mode === 'course_review'
        ? '복습 완료!'
        : '퀴즈 완료!';
    const outcome = learningOutcomeFor({ words: baseQueue });

    return (
      <LearningCompletionScreen
        mascot="great"
        title={completionTitle}
        subtitle={`${baseQueue.length}문제 완료${retryQueue.length > 0 ? ` · 다시 푼 문제 ${retryQueue.length}개` : ''}`}
        actionLabel={navState?.nextRoute?.label ?? (backPath === '/course' ? '코스로' : '홈으로')}
        onAction={() => navState?.nextRoute
          ? navigate(navState.nextRoute.pathname, navState.nextRoute.state === undefined ? undefined : { state: navState.nextRoute.state })
          : navigate(backPath)}
      >
        <Card pad="lg" className="w-full flex flex-col gap-4 anim-fade-up" style={{ '--i': 2 } as React.CSSProperties}>
          <LearningStatRow label="획득 포인트" withDivider={false}>
            <div className="flex items-center gap-1.5">
              <PointIcon size={16} />
              <span className="text-xl font-bold text-brand-500">+{earnedShown}P</span>
            </div>
          </LearningStatRow>
          <LearningStatRow label="획득 XP">
            <div className="flex items-center gap-1.5">
              <XpIcon size={16} />
              <span className="text-xl font-bold text-[var(--color-ink)]">+{Math.max(0, xp - xpAtStart.current)}</span>
            </div>
          </LearningStatRow>
          <LearningStatRow label="정답률">
            <span className="text-xl font-bold text-[var(--color-ink)]">{accuracy}%</span>
          </LearningStatRow>
          <LearningStatRow label="최고 연속 정답">
            <span className="flex items-center gap-1 text-xl font-bold text-[var(--color-ink)]">{maxCombo}연속<Flame size={18} className="text-brand-500 fill-current" /></span>
          </LearningStatRow>
          {stageUp && (
            <LearningStatRow label="단계 변화">
              <span className="text-sm font-bold text-success-400">🎉 {stageBefore.name} → {stageAfter.name} 승급!</span>
            </LearningStatRow>
          )}
        </Card>
        <Card pad="md" className="w-full anim-fade-up" style={{ '--i': 3 } as React.CSSProperties}>
          <p className="text-xs font-bold text-brand-500 mb-1.5!">다음에 보이면</p>
          <p className="text-sm font-semibold text-[var(--color-ink)] leading-relaxed break-keep">{outcome}</p>
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
  const streakMessage = combo >= 5 ? `${combo}연속! x2 보너스` : combo >= 3 ? `${combo}연속! +5P 보너스` : null;
  // 쉬운 예시(데이터 앞의 '학습용 가정:' 표시는 뺀다). 없으면 뜻
  const example = currentWord?.learningExample?.replace(/^학습용 가정:\s*/, '') || currentWord?.meaning;
  // 오답: 고른 보기가 어떤 용어(의 뜻)인지 한 줄로 짚어 준다. 직접 만든 문제(custom)는 보기가 용어가 아니라 없음
  const picked = status === 'wrong' && selected ? wordByName.get(selected) : undefined;

  return (
    <div className="flex flex-col h-full bg-[var(--color-card)]">
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
                +{lastEarned}P
              </span>
            )}
          </div>
        )}
      />

      {/* 콘텐츠 — 뜻 보기 4개가 길면 작은 화면에서 넘치므로 이 영역만 스크롤 */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-5 py-5 gap-4 [&::-webkit-scrollbar]:hidden">
        {/* 문제 카드 */}
        <div key={currentQuizIndex} className={`anim-slide-in rounded-card px-5 py-4 flex flex-col items-center text-center gap-3
          ${status === 'correct' ? 'anim-answer-wash bg-[var(--color-card)]' : 'bg-[var(--color-card)]'}
          ${shake ? 'anim-soft-nudge' : ''}
        `}>
          <span className="text-sm font-semibold text-[var(--color-ink-3)]">{quizItem?.promptLabel}</span>

          <p className="text-[22px] font-bold text-[var(--color-ink)] leading-snug break-keep">{quizItem?.promptMain}</p>

          {quizItem?.promptSub && (
            <div className="bg-[var(--color-canvas)] rounded-chip px-4 py-3">
              <p className="text-sm text-[var(--color-ink-3)] leading-relaxed break-keep">{quizItem.promptSub}</p>
            </div>
          )}

        </div>

        {/* 객관식 선택지: 유형과 무관하게 한 줄에 하나 */}
        <div className="grid grid-cols-1 gap-2">
          {quizItem?.options.map((opt, i) => {
            const isSelected = selected === opt.answer;
            const isCorrectOption = opt.isCorrect;
            // 색은 배경·테두리·아이콘에만. 보기 글자는 어떤 상태에서도 진하게 둔다
            let optionStyle = 'bg-[var(--color-card)] border-[var(--color-line)] text-[var(--color-ink)] active:bg-[var(--color-surface)]';
            if (status !== 'idle') {
              optionStyle = isCorrectOption ? 'bg-success-500/10 border-success-500 text-[var(--color-ink)]'
                : isSelected ? 'bg-danger-500/10 border-danger-500 text-[var(--color-ink)]'
                : 'bg-[var(--color-card)] border-[var(--color-line)] text-[var(--color-ink-3)]';
            }
            const tag = status === 'idle' ? null : isCorrectOption ? '정답' : isSelected ? '내가 고른 답' : null;
            const feedbackMotion = status !== 'idle' && (isCorrectOption || isSelected) ? 'anim-choice-lock' : '';

            return (
              <button
                key={`${i}-${opt.answer}`}
                onClick={() => handleSelect(opt)}
                className={`anim-fade-up ${feedbackMotion} flex items-center gap-3 min-h-14 py-3.5 px-4 rounded-chip border text-base font-semibold text-left break-keep transition-colors duration-150 ${optionStyle}`}
                style={{ '--i': i + 1 } as React.CSSProperties}
              >
                {status !== 'idle' && isCorrectOption ? (
                  <span className="w-6 h-6 shrink-0 flex items-center justify-center bg-success-500 text-white" style={{ borderRadius: 9999 }}><Check size={14} strokeWidth={3} /></span>
                ) : status !== 'idle' && isSelected ? (
                  <span className="w-6 h-6 shrink-0 flex items-center justify-center bg-danger-500 text-white" style={{ borderRadius: 9999 }}><X size={14} strokeWidth={3} /></span>
                ) : (
                  <span className="w-6 h-6 shrink-0 flex items-center justify-center border border-[var(--color-line-strong)] text-xs font-bold text-[var(--color-ink-3)]" style={{ borderRadius: 9999 }}>{i + 1}</span>
                )}
                <span className="min-w-0 flex-1">{opt.label}</span>
                {tag && <span className={`shrink-0 text-xs font-bold ${isCorrectOption ? 'text-success-500' : 'text-danger-500'}`}>{tag}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 답을 고른 뒤: 판정은 아이콘·제목 색으로만, 공간은 이해(예시·헷갈린 지점)에. 다음 버튼은 판정과 무관하게 같은 모양 */}
      {status !== 'idle' && (
        <div key={currentQuizIndex} className="anim-feedback-panel px-5 pt-4 pb-8 flex flex-col gap-3 border-t border-[var(--color-line)] bg-[var(--color-card)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 flex items-center justify-center text-white ${status === 'correct' ? 'bg-success-500' : 'bg-danger-500'}`} style={{ borderRadius: 9999 }}>
                {status === 'correct' ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
              </span>
              <p className={`text-lg font-black ${status === 'correct' ? 'text-success-500' : 'text-danger-500'}`}>
                {status === 'correct' ? '좋아요!' : `정답은 ${currentWord.word}`}
              </p>
            </div>
            {status === 'correct' && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-500">
                {capped ? <span className="text-[var(--color-ink-3)]">오늘 보상 한도 도달</span> : lastEarned > 0 ? `+${lastEarned}P` : null}
                {combo >= 3 && <span className="flex items-center gap-0.5"><Flame size={12} className="fill-current" />{combo}연속</span>}
              </span>
            )}
          </div>
          {status === 'correct' ? (
            <div>
              <p className="text-xs font-bold text-[var(--color-ink-3)] mb-1!">예를 들면</p>
              <p className="text-[15px] text-[var(--color-ink)] leading-relaxed break-keep">{example}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-[15px] text-[var(--color-ink)] leading-relaxed break-keep"><span className="font-bold">{currentWord.word}</span>: {currentWord.meaning}</p>
              {picked && <p className="text-sm text-[var(--color-ink-3)] leading-relaxed break-keep">고른 답 <span className="font-semibold text-[var(--color-ink-2)]">{picked.word}</span>: {picked.meaning}</p>}
            </div>
          )}
          <button
            onClick={goNextQuestion}
            className="w-full min-h-[52px] rounded-button text-base font-bold text-white bg-brand-500 active:opacity-90"
          >
            {currentQuizIndex === quizQueue.length - 1 ? '결과 보기' : '다음 문제'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;
