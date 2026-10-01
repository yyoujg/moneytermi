import { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowRight, Zap, Check, X, Flame, Sparkles } from 'lucide-react';
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
import { DailyAlarmPromptCard } from '../components/DailyAlarmPromptCard';
import { StreakCelebration } from '../components/StreakCelebration';
import { Card } from '../components/ui/Card';
import { buildQuizItem, pickQuizType, type QuizOption } from '../lib/quiz';

const QuizScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { xp, allWords, knownWords, courses, hydrated, contentStatus, retryContent, submitQuizAnswer, refreshWallet } = useAppContext();

  // 단어 id → 코스 카테고리 (오답 보기를 같은 주제로 뽑기 위함)
  const categoryOf = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of courses) for (const w of c.words) map.set(w.id, c.category);
    return (id: number) => map.get(id);
  }, [courses]);

  const navState = location.state as { quizQueue?: Word[]; backPath?: string; nodeId?: string; courseTitle?: string } | null;
  const hasExplicitQueue = navState?.quizQueue !== undefined;
  const passedQueue: Word[] = navState?.quizQueue ?? [];
  const backPath = navState?.backPath ?? '/home';
  // state 없이 진입하면 아는 단어 10개를 한 번만 섞는다. 렌더마다 섞으면 문제가 바뀐다.
  const [randomQueue, setRandomQueue] = useState<Word[]>([]);
  useEffect(() => {
    if (!hasExplicitQueue && randomQueue.length === 0 && knownWords.length > 0) {
      setRandomQueue([...knownWords].sort(() => Math.random() - 0.5).slice(0, 10));
    }
  }, [knownWords, hasExplicitQueue, randomQueue.length]);
  const baseQueue: Word[] = hasExplicitQueue ? passedQueue : randomQueue;
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
    if (finished) {
      // 승급이면 웅장하게, 아니면 정답률에 따라
      if (getGrowthStage(xp).id > getGrowthStage(xpAtStart.current).id) feedbackTierUp();
      else feedbackQuizComplete(correctCount === quizQueue.length);
      logClick('quiz_complete', { mode: 'quiz', total: quizQueue.length, correct: correctCount, node_id: navState?.nodeId });
      if (navState?.nodeId) markNodeDone(navState.nodeId);   // 패스의 퀴즈·복습 노드를 완료 표시
      requestAppReview();
      void refreshWallet();   // m4(퀴즈 N문제)·50XP 보너스는 서버가 올린다 — 세션 끝에 한 번 읽는다
    }
  }, [finished]);

  if (!hasExplicitQueue && contentStatus === 'error') {
    return (
      <div className="quiz-screen flex h-full flex-col items-center justify-center gap-3 bg-[var(--color-canvas)] px-5 text-center">
        <h2 className="text-xl font-bold text-[var(--color-ink)]">문제를 불러오지 못했어요</h2>
        <p className="text-sm text-[var(--color-ink-2)]">연결을 확인하고 다시 시도해 주세요.</p>
        <button type="button" onClick={retryContent} className="mt-3 min-h-12 w-full rounded-button bg-brand-500 px-4 text-sm font-bold">다시 시도</button>
      </div>
    );
  }

  if (!hydrated || (!hasExplicitQueue && contentStatus === 'loading') ||
      (!hasExplicitQueue && knownWords.length > 0 && randomQueue.length === 0)) {
    return <div className="flex h-full items-center justify-center bg-[var(--color-canvas)] text-sm text-[var(--color-ink-2)]">문제를 준비하는 중이에요</div>;
  }

  // 풀 문제가 없을 때(아는 단어 0개로 딥링크 진입 등). 완료 화면으로 보내면 "0문제 완료 🎉"가 뜬다.
  if (quizQueue.length === 0) {
    return (
      <div className="quiz-screen flex h-full flex-col bg-[var(--color-canvas)]">
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-3 text-center">
          <h2 className="text-xl font-bold text-[var(--color-ink)]">{hasExplicitQueue ? '이번 학습에는 확인 문제가 없어요' : '아직 풀 문제가 없어요'}</h2>
          <p className="text-sm text-[var(--color-ink-2)] break-keep">{hasExplicitQueue ? '이번 학습에는 풀 문제가 없어요. 다음 학습을 골라보세요.' : '단어를 먼저 배우면 확인 퀴즈를 풀 수 있어요.'}</p>
        </div>
        <div className="px-5 pb-12">
          <button onClick={() => navigate('/course')} className="w-full py-4 rounded-button text-sm font-bold text-white bg-brand-500 active:opacity-90">
            {hasExplicitQueue ? '다음 학습 선택하기' : '첫 레슨 시작하기'}
          </button>
        </div>
      </div>
    );
  }

  // 완료 화면
  if (currentQuizIndex >= quizQueue.length) {
    const accuracy = quizQueue.length > 0 ? Math.round((correctCount / quizQueue.length) * 100) : 0;
    const stageBefore = getGrowthStage(xpAtStart.current);
    const stageAfter = getGrowthStage(xp);
    const stageUp = stageAfter.id > stageBefore.id;

    return (
      <div className="quiz-screen flex h-full flex-col bg-[var(--color-canvas)]">
        {/* 결과 카드 + 알림 카드 + 축하가 작은 화면에서 넘칠 수 있어 이 영역만 스크롤 */}
        <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col items-center justify-center-safe px-8 py-6 gap-5">
          <div className="text-6xl anim-pop-in">🎉</div>
          <div className="text-center anim-fade-up" style={{ '--i': 1 } as React.CSSProperties}>
            <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-1!">퀴즈 완료!</h2>
            <p className="text-sm text-[var(--color-ink-4)]">{baseQueue.length}문제 완료{retryQueue.length > 0 && ` · 다시 푼 문제 ${retryQueue.length}개`}</p>
          </div>

          {/* 결과 카드 */}
          <Card pad="lg" className="w-full flex flex-col gap-4 anim-fade-up" style={{ '--i': 2, border: 0 } as React.CSSProperties}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-ink-4)]">획득 포인트</span>
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-brand-ink fill-current" />
                <span className="text-xl font-bold text-brand-ink">+{earnedShown}P</span>
              </div>
            </div>
            <div className="h-px bg-[var(--color-line)]" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-ink-4)]">획득 XP</span>
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-ink" />
                <span className="text-xl font-bold text-[var(--color-ink)]">+{Math.max(0, xp - xpAtStart.current)}</span>
              </div>
            </div>
            <div className="h-px bg-[var(--color-line)]" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-ink-4)]">정답률</span>
              <span className="text-xl font-bold text-[var(--color-ink)]">{accuracy}%</span>
            </div>
            <div className="h-px bg-[var(--color-line)]" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-ink-4)]">최고 연속 정답</span>
              <span className="flex items-center gap-1 text-xl font-bold text-[var(--color-ink)]">{maxCombo}연속<Flame size={18} className="text-brand-ink fill-current" /></span>
            </div>
            {stageUp && (
              <>
                <div className="h-px bg-[var(--color-line)]" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--color-ink-4)]">단계 변화</span>
                  <span className="text-sm font-bold text-success-400">🎉 {stageBefore.name} → {stageAfter.name} 승급!</span>
                </div>
              </>
            )}
          </Card>

          <DailyAlarmPromptCard />
          <StreakCelebration />
        </div>

        <div className="px-5 pb-12 flex flex-col gap-3">
          <button
            onClick={() => navigate(backPath)}
            className="w-full py-4 rounded-button text-sm font-bold text-white bg-brand-500 active:opacity-90"
          >
            {backPath.startsWith('/course') ? '코스로' : '홈으로'}
          </button>
        </div>
      </div>
    );
  }

  // 현재 문제의 위치를 보여준다. 다시 풀기는 원래 문제 구간을 마친 뒤 시작한다.
  const progressPercent = Math.min(100, ((currentQuizIndex + 1) / baseQueue.length) * 100);
  const retrying = currentQuizIndex >= baseQueue.length;

  const handleSelect = async (option: QuizOption) => {
    if (status !== 'idle') return;
    setSelected(option.answer);
    // 즉시 피드백은 낙관적 (정답 단어는 클라가 이미 앎). 포인트·콤보는 서버가 채점.
    const isCorrect = option.isCorrect;

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
      setRetryQueue(q => [...q, currentWord]);
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
  const streakMessage = combo >= 5 ? { Icon: Zap, text: `${combo}연속! x2 보너스`, color: 'text-warning-400' }
    : combo >= 3 ? { Icon: Flame, text: `${combo}연속! +5P 보너스`, color: 'text-brand-ink' }
    : null;
  const selectedWord = status === 'wrong' && quizItem?.type !== 'custom'
    ? allWords.find(word => word.word === selected) : null;

  return (
    <div className="quiz-screen flex flex-col h-full bg-[var(--color-card)]">
      {/* 헤더 */}
      <div className="bg-[var(--color-card)] px-5 pt-4 pb-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(backPath, { replace: true })} aria-label="퀴즈 나가기"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-2)]"><X size={21} /></button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-button-secondary)]">
            <div className="h-full rounded-full bg-brand-500 transition-all duration-[var(--dur-slow)] ease-soft" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="shrink-0 text-xs font-bold tabular-nums text-[var(--color-ink-3)]">{retrying ? `${quizQueue.length - currentQuizIndex}문제 남음` : `${currentQuizIndex + 1}/${baseQueue.length}`}</span>
        </div>
        {(navState?.courseTitle || retrying || streakMessage || showPointPop) && (
          <div className="mt-2 flex items-center justify-between gap-2 pl-12 text-2xs">
            <span className="min-w-0 truncate text-[var(--color-ink-3)]">{retrying ? '틀린 문제 다시 풀기' : navState?.courseTitle}</span>
            {streakMessage && <span className={`flex shrink-0 items-center gap-1 font-bold ${streakMessage.color}`}><streakMessage.Icon size={13} />{streakMessage.text}</span>}
            {showPointPop && <span key={totalEarned} className="shrink-0 font-bold text-brand-ink" style={{ animation: 'fadeUp 0.7s ease forwards' }}>+{lastEarned}P</span>}
          </div>
        )}
      </div>

      {/* 애니메이션 */}
      <style>{`
        @keyframes fadeUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-16px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .shake { animation: shake 0.5s ease; }
      `}</style>

      {/* 콘텐츠 — 뜻 보기 4개가 길면 작은 화면에서 넘치므로 이 영역만 스크롤 */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-5 py-5 gap-3 [&::-webkit-scrollbar]:hidden">
        {/* 문제 카드 */}
        <div key={currentQuizIndex} className={`anim-slide-in flex flex-col gap-3 rounded-card bg-[var(--color-brand-soft)] px-5 py-5 text-left ${shake ? 'shake' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--color-ink)] px-2 py-1 text-2xs font-bold text-[var(--color-card)]">{retrying ? '다시 풀기' : `Q${currentQuizIndex + 1}`}</span>
            <span className="text-2xs font-medium text-[var(--color-ink-3)]">{quizItem?.promptLabel}</span>
          </div>

          <p className="text-lg font-bold text-[var(--color-ink)] leading-snug break-keep">{quizItem?.promptMain}</p>

          {quizItem?.promptSub && (
            <div className="rounded-chip bg-[var(--color-card)] px-4 py-3">
              <p className="text-sm text-[var(--color-ink-3)] leading-relaxed break-keep">{quizItem.promptSub}</p>
            </div>
          )}

        </div>

        {/* 객관식 선택지: 유형과 무관하게 한 줄에 하나 */}
        <div className="grid grid-cols-1 gap-2.5">
          {quizItem?.options.map((opt, i) => {
            const isSelected = selected === opt.answer;
            const isCorrectOption = opt.isCorrect;
            let optionStyle = 'border-2 border-[var(--color-line)] bg-[var(--color-card)] text-[var(--color-ink)] active:bg-[var(--color-surface)]';

            if (status !== 'idle') {
              if (isSelected && isCorrectOption) {
                optionStyle = 'border-2 border-[var(--color-ink)] bg-[var(--color-brand-soft)] text-[var(--color-ink)]';
              } else if (isCorrectOption) {
                optionStyle = 'border-2 border-[var(--color-ink)] bg-[var(--color-success-soft)] text-[var(--color-ink)]';
              } else if (isSelected && !isCorrectOption) {
                optionStyle = 'border-2 border-[var(--color-ink)] bg-[var(--color-danger-soft)] text-[var(--color-ink)]';
              } else {
                optionStyle = 'border-2 border-[var(--color-line)] bg-[var(--color-card)] text-[var(--color-ink-4)] opacity-60';
              }
            }

            return (
              <button
                key={`${i}-${opt.answer}`}
                data-own-sfx
                onClick={() => handleSelect(opt)}
                disabled={status !== 'idle'}
                className={`anim-fade-up flex items-center gap-3 rounded-card px-4 py-4 text-left text-sm font-medium break-keep transition-all duration-150 ${status !== 'idle' && (isSelected || isCorrectOption) ? 'quiz-choice-reveal' : ''} ${optionStyle}`}
                style={{ '--i': i + 1 } as React.CSSProperties}
              >
                {status !== 'idle' && isSelected && isCorrectOption ? (
                  <span className="w-5 h-5 shrink-0 flex items-center justify-center bg-brand-500 text-white" style={{ borderRadius: 9999 }}><Check size={12} strokeWidth={3} /></span>
                ) : status !== 'idle' && isCorrectOption ? (
                  <span className="w-5 h-5 shrink-0 flex items-center justify-center bg-success-500 text-[var(--color-success-mark)]" style={{ borderRadius: 9999 }}><Check size={12} strokeWidth={3} /></span>
                ) : status !== 'idle' && isSelected ? (
                  <span className="w-5 h-5 shrink-0 flex items-center justify-center bg-danger-500 text-white" style={{ borderRadius: 9999 }}><X size={12} strokeWidth={3} /></span>
                ) : (
                  <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[var(--color-line-strong)]" />
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 답을 고른 뒤: 결과 + 해설 + 계속하기 */}
      {status !== 'idle' && (
        <div
          key={currentQuizIndex}
          role="status"
          aria-live="polite"
          className="anim-slide-up flex flex-col gap-3 bg-[var(--color-card)] px-5 pb-8 pt-3"
        >
          <div className={`anim-fade-up rounded-card px-4 py-4 ${status === 'correct' ? 'bg-[var(--color-success-soft)]' : 'bg-[var(--color-danger-soft)]'}`} style={{ '--i': 2 } as React.CSSProperties}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-card)] ${status === 'correct' ? 'text-success-500' : 'text-danger-400'}`}>
                {status === 'correct' ? <Check size={18} strokeWidth={2.8} /> : <X size={18} strokeWidth={2.8} />}
              </span>
              <p className={`text-base font-bold ${status === 'correct' ? 'text-success-500' : 'text-danger-400'}`}>
                {status === 'correct' ? '정답이에요!' : '아쉬워요'}
              </p>
              {status === 'correct' && (capped || lastEarned > 0 || combo >= 3) && (
                <span className="ml-auto flex items-center gap-1.5 text-xs font-bold">
                  {capped ? <span className="text-[var(--color-ink-4)]">오늘 보상 한도 도달</span> : lastEarned > 0 ? <span className="text-success-500">+{lastEarned}P</span> : null}
                  {combo >= 3 && <span className="flex items-center gap-0.5 text-brand-ink"><Flame size={12} className="fill-current" />{combo}연속</span>}
                </span>
              )}
            </div>
            <p className={`mt-3! text-xs font-bold ${status === 'correct' ? 'text-success-500' : 'text-danger-400'}`}>
              {status === 'correct' ? (quizItem?.explanation ? '해설' : '의미') : `정답: ${quizItem?.type === 'custom' ? quizItem.options.find(opt => opt.isCorrect)?.label : currentWord.word}`}
            </p>
            <p className="mt-1! text-sm font-medium leading-relaxed text-[var(--color-ink)] break-keep">{quizItem?.explanation ?? currentWord.meaning}</p>
            {selectedWord && (
              <p className="mt-2! border-t border-[var(--color-line-strong)] pt-2 text-sm leading-relaxed text-[var(--color-ink-2)] break-keep">
                {quizItem?.type === 'word_to_meaning'
                  ? `선택한 설명은 ${selectedWord.word}의 뜻이에요.`
                  : `선택한 ${selectedWord.word}: ${selectedWord.meaning}`}
              </p>
            )}
          </div>
          <button
            onClick={goNextQuestion}
            className="anim-fade-up flex w-full items-center justify-center gap-2 rounded-button bg-brand-500 py-4 text-sm font-bold text-white active:opacity-90"
            style={{ '--i': 5 } as React.CSSProperties}
          >
            {currentQuizIndex === quizQueue.length - 1 ? '결과 보기' : '다음 문제'}<ArrowRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;
