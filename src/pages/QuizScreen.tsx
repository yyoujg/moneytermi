import { useState, useMemo, useEffect, useRef } from 'react';
import { Zap, Check, X, Flame, Sparkles } from 'lucide-react';
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
  const { xp, allWords, knownWords, courses, submitQuizAnswer } = useAppContext();

  // 단어 id → 코스 카테고리 (오답 보기를 같은 주제로 뽑기 위함)
  const categoryOf = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of courses) for (const w of c.words) map.set(w.id, c.category);
    return (id: number) => map.get(id);
  }, [courses]);

  const navState = location.state as { quizQueue?: Word[]; backPath?: string; nodeId?: string } | null;
  const passedQueue: Word[] = navState?.quizQueue ?? [];
  const backPath = navState?.backPath ?? '/home';
  // state 없이 진입하면 아는 단어 10개를 한 번만 섞는다. 렌더마다 섞으면 문제가 바뀐다.
  const [randomQueue, setRandomQueue] = useState<Word[]>([]);
  useEffect(() => {
    if (passedQueue.length === 0 && randomQueue.length === 0 && knownWords.length > 0) {
      setRandomQueue([...knownWords].sort(() => Math.random() - 0.5).slice(0, 10));
    }
  }, [knownWords]);
  const quizQueue: Word[] = passedQueue.length > 0 ? passedQueue : randomQueue;

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  // 티어는 XP 기준이다. 부스트로 배수가 붙을 수 있어 클라에서 계산하지 않고 시작 시점 값을 기억한다.
  const xpAtStart = useRef(xp);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [totalEarned, setTotalEarned] = useState(0);
  const [lastEarned, setLastEarned] = useState(0);
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
    }
  }, [finished]);

  // 풀 문제가 없을 때(아는 단어 0개로 딥링크 진입 등). 완료 화면으로 보내면 "0문제 완료 🎉"가 뜬다.
  if (quizQueue.length === 0) {
    return (
      <div className="flex h-full flex-col bg-[var(--color-canvas)]">
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-3 text-center">
          <h2 className="text-xl font-bold text-[var(--color-ink)]">아직 풀 문제가 없어요</h2>
          <p className="text-sm text-[var(--color-ink-4)] break-keep">단어를 먼저 배우면 배운 단어로 퀴즈를 낼 수 있어요.</p>
        </div>
        <div className="px-5 pb-12">
          <button onClick={() => navigate('/course')} className="w-full py-4 rounded-button text-sm font-bold text-white bg-brand-500 active:opacity-90">
            학습하러 가기
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
      <div className="flex h-full flex-col bg-[var(--color-canvas)]">
        {/* 결과 카드 + 알림 카드 + 축하가 작은 화면에서 넘칠 수 있어 이 영역만 스크롤 */}
        <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col items-center justify-center-safe px-8 py-6 gap-5">
          <div className="text-6xl anim-pop-in">🎉</div>
          <div className="text-center anim-fade-up" style={{ '--i': 1 } as React.CSSProperties}>
            <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-1!">퀴즈 완료!</h2>
            <p className="text-sm text-[var(--color-ink-4)]">{quizQueue.length}문제 완료</p>
          </div>

          {/* 결과 카드 */}
          <Card pad="lg" className="w-full flex flex-col gap-4 anim-fade-up" style={{ '--i': 2 } as React.CSSProperties}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-ink-4)]">획득 포인트</span>
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-brand-500 fill-current" />
                <span className="text-xl font-bold text-brand-500">+{earnedShown}P</span>
              </div>
            </div>
            <div className="h-px bg-[var(--color-line)]" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-ink-4)]">획득 XP</span>
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-500" />
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
              <span className="flex items-center gap-1 text-xl font-bold text-[var(--color-ink)]">{maxCombo}연속<Flame size={18} className="text-brand-500 fill-current" /></span>
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
            {backPath === '/course' ? '코스로' : '홈으로'}
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = (currentQuizIndex / quizQueue.length) * 100;

  const handleSelect = async (option: QuizOption) => {
    if (status !== 'idle') return;
    setSelected(option.answer);
    // 즉시 피드백은 낙관적 (정답 단어는 클라가 이미 앎). 포인트·콤보는 서버가 채점.
    const isCorrect = option.isCorrect;

    if (isCorrect) {
      feedbackCorrect(soundOn, vibrationOn, combo + 1);
      setStatus('correct');
      setCorrectCount(c => c + 1);

      const res = await submitQuizAnswer(currentWord.id, option.answer, 'mc', false, currentQuizIndex === 0);
      const nextCombo = res ? res.combo : combo + 1;   // 서버 응답이 없으면(오프라인) 로컬로 센다
      setCombo(nextCombo);
      setMaxCombo(m => Math.max(m, nextCombo));
      if (res) {
        setTotalEarned(t => t + res.earned);
        setLastEarned(res.earned);
        setShowPointPop(true);
      }
      // 다음 문제로는 하단 패널의 계속하기가 넘긴다
    } else {
      feedbackWrong();
      setCombo(0);
      setStatus('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      // 서버 콤보도 초기화 (오답 기록). 정답을 보여주고 계속하기로 다음 문제.
      void submitQuizAnswer(currentWord.id, option.answer, 'mc', false, currentQuizIndex === 0);
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
    : combo >= 3 ? { Icon: Flame, text: `${combo}연속! +5P 보너스`, color: 'text-brand-400' }
    : null;

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas)]">
      {/* 헤더 */}
      <div className="pt-4 px-5 pb-3 flex justify-between items-center bg-[var(--color-card)]">
        <span className="text-xs font-medium text-[var(--color-ink-4)]">{currentQuizIndex + 1} / {quizQueue.length}</span>
        {/* 획득 포인트 팝업 (보유 포인트는 상단바에 있다) */}
        <div className="relative h-5 w-12">
          {showPointPop && (
            <span
              key={totalEarned}
              className="absolute -top-5 right-0 text-xs font-bold text-success-400 whitespace-nowrap"
              style={{ animation: 'fadeUp 0.7s ease forwards' }}
            >
              +{lastEarned}P
            </span>
          )}
        </div>
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
        @keyframes flashGreen {
          0% { background-color: var(--color-card); }
          30% { background-color: rgba(34,197,94,0.12); }
          100% { background-color: var(--color-card); }
        }
        .shake { animation: shake 0.5s ease; }
        .flash-correct { animation: flashGreen 0.4s ease; }
      `}</style>

      {/* 진행 바 */}
      <div className="w-full bg-[var(--color-line)] h-1">
        <div
          className="bg-brand-500 h-1 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 콘텐츠 — 뜻 보기 4개가 길면 작은 화면에서 넘치므로 이 영역만 스크롤 */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-5 py-5 gap-4 [&::-webkit-scrollbar]:hidden">
        {/* 스트릭 배너 */}
        {streakMessage && status === 'idle' && (
          <div className={`flex items-center justify-center gap-1 py-2 rounded-chip bg-[var(--color-card)] ${streakMessage.color} text-xs font-bold`}>
            <streakMessage.Icon size={13} className="fill-current" />{streakMessage.text}
          </div>
        )}

        {/* 문제 카드 */}
        <div key={currentQuizIndex} className={`anim-slide-in rounded-card p-5 flex-1 flex flex-col justify-center gap-4
          ${status === 'correct' ? 'flash-correct ring-2 ring-success-500/40' : 'bg-[var(--color-card)]'}
          ${status === 'wrong' ? 'bg-[var(--color-card)] ring-2 ring-danger-500/30' : ''}
          ${shake ? 'shake' : ''}
        `}>
          <span className="text-2xs font-medium text-[var(--color-ink-4)] tracking-widest uppercase">{quizItem?.promptLabel}</span>

          <p className="text-xl font-bold text-[var(--color-ink)] leading-snug mb-2! break-keep">{quizItem?.promptMain}</p>

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
            let optionStyle = 'bg-[var(--color-card)] text-[var(--color-ink)] active:bg-[var(--color-line)]';

            if (status !== 'idle') {
              if (isCorrectOption) {
                optionStyle = 'bg-success-500/15 text-success-400 ring-1 ring-success-500/50';
              } else if (isSelected && !isCorrectOption) {
                optionStyle = 'bg-danger-500/15 text-danger-400 ring-1 ring-danger-500/40';
              } else {
                optionStyle = 'bg-[var(--color-card)] text-[var(--color-line)]';
              }
            }

            return (
              <button
                key={`${i}-${opt.answer}`}
                onClick={() => handleSelect(opt)}
                className={`anim-fade-up relative py-4 px-4 pr-9 rounded-card text-sm font-bold text-left break-keep transition-all duration-150 ${optionStyle}`}
                style={{ '--i': i + 1 } as React.CSSProperties}
              >
                {opt.label}
                {status !== 'idle' && isCorrectOption && (
                  <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-success-400" />
                )}
                {status !== 'idle' && isSelected && !isCorrectOption && (
                  <X size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-danger-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 답을 고른 뒤: 결과 + 단어 뜻 + 계속하기 (듀오링고식) */}
      {status !== 'idle' && (
        <div
          key={currentQuizIndex}
          className={`anim-slide-up px-5 pt-4 pb-8 flex flex-col gap-3 border-t ${status === 'correct' ? 'bg-success-500/15 border-success-500/20' : 'bg-danger-500/15 border-danger-500/20'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 flex items-center justify-center text-white ${status === 'correct' ? 'bg-success-500' : 'bg-danger-500'}`} style={{ borderRadius: 9999 }}>
                {status === 'correct' ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
              </span>
              <p className={`text-lg font-black ${status === 'correct' ? 'text-success-400' : 'text-danger-400'}`}>
                {status === 'correct' ? '좋아요!' : '아쉬워요'}
              </p>
            </div>
            {status === 'correct' && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-success-400">
                +{lastEarned}P
                {combo >= 3 && <span className="flex items-center gap-0.5 text-brand-400"><Flame size={12} className="fill-current" />{combo}연속</span>}
              </span>
            )}
          </div>
          <div>
            <p className={`text-xs font-bold mb-1! ${status === 'correct' ? 'text-success-400' : 'text-danger-400'}`}>
              {status === 'correct' ? '의미' : `정답: ${currentWord.word}`}
            </p>
            <p className="text-sm font-medium text-[var(--color-ink)] leading-relaxed break-keep">{currentWord.meaning}</p>
          </div>
          <button
            onClick={goNextQuestion}
            className={`w-full py-4 rounded-button text-sm font-bold text-white active:opacity-90 ${status === 'correct' ? 'bg-success-500' : 'bg-danger-500'}`}
          >
            {currentQuizIndex === quizQueue.length - 1 ? '결과 보기' : '계속하기'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;
