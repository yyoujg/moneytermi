import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Zap, Check, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { useSettings } from '../hooks/useSettings';
import { calculateRank } from '../utils/league';
import { feedbackCorrect, feedbackWrong } from '../lib/feedback';
import { requestAppReview } from '../lib/review';
import { logClick } from '../lib/analytics';
import { DailyAlarmPromptCard } from '../components/DailyAlarmPromptCard';
import { Card } from '../components/ui/Card';
import { buildQuizItem, pickQuizType, type QuizOption } from '../lib/quiz';

const QuizScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { points, otherLeagueUsers, allWords, knownWords, courses, submitQuizAnswer } = useAppContext();

  // 단어 id → 코스 카테고리 (오답 보기를 같은 주제로 뽑기 위함)
  const categoryOf = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of courses) for (const w of c.words) map.set(w.id, c.category);
    return (id: number) => map.get(id);
  }, [courses]);

  const passedQueue: Word[] = (location.state as { quizQueue?: Word[] } | null)?.quizQueue ?? [];
  const quizQueue: Word[] = passedQueue.length > 0
    ? passedQueue
    : [...knownWords].sort(() => Math.random() - 0.5).slice(0, 10);

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
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
      logClick('quiz_complete', { mode: 'quiz', total: quizQueue.length, correct: correctCount });
      requestAppReview();
    }
  }, [finished]);

  // 완료 화면
  if (!quizQueue || quizQueue.length === 0 || currentQuizIndex >= quizQueue.length) {
    const accuracy = quizQueue.length > 0 ? Math.round((correctCount / quizQueue.length) * 100) : 0;
    const myRank = calculateRank(otherLeagueUsers, points);
    const prevRank = calculateRank(otherLeagueUsers, points - totalEarned);
    const rankRose = prevRank > myRank;

    return (
      <div className="flex h-full flex-col bg-[var(--color-canvas)]">
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5">
          <div className="text-6xl">🎉</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-1">퀴즈 완료!</h2>
            <p className="text-sm text-[var(--color-ink-4)]">{quizQueue.length}문제 완료</p>
          </div>

          {/* 결과 카드 */}
          <Card pad="lg" className="w-full flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-ink-4)]">획득 포인트</span>
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-brand-500 fill-current" />
                <span className="text-xl font-bold text-brand-500">+{totalEarned}P</span>
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
              <span className="text-xl font-bold text-[var(--color-ink)]">{maxCombo}연속 🔥</span>
            </div>
            {rankRose && (
              <>
                <div className="h-px bg-[var(--color-line)]" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--color-ink-4)]">순위 변화</span>
                  <span className="text-sm font-bold text-success-400">🔥 {prevRank}위 → {myRank}위 상승!</span>
                </div>
              </>
            )}
          </Card>

          <DailyAlarmPromptCard />
        </div>

        <div className="px-5 pb-12 flex flex-col gap-3">
          <button
            onClick={() => navigate('/home')}
            className="w-full py-4 rounded-button text-sm font-bold text-white bg-brand-500 active:opacity-90"
          >
            홈으로
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
      feedbackCorrect(soundOn, vibrationOn);
      setStatus('correct');
      setCorrectCount(c => c + 1);

      const res = await submitQuizAnswer(currentWord.id, option.answer, 'mc', false, currentQuizIndex === 0);
      if (res) {
        setCombo(res.combo);
        setMaxCombo(m => Math.max(m, res.combo));
        setTotalEarned(t => t + res.earned);
        setLastEarned(res.earned);
        setShowPointPop(true);
      }
      // 정답: 300ms 후 자동 이동
      setTimeout(() => {
        setCurrentQuizIndex(i => i + 1);
        setSelected(null);
        setStatus('idle');
      }, 300);
    } else {
      feedbackWrong(soundOn, vibrationOn);
      setCombo(0);
      setStatus('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      // 서버 콤보도 초기화 (오답 기록)
      void submitQuizAnswer(currentWord.id, option.answer, 'mc', false, currentQuizIndex === 0);
      // 오답: 900ms 후 재시도
      setTimeout(() => {
        setSelected(null);
        setStatus('idle');
      }, 900);
    }
  };

  // 스트릭 메시지
  const streakMessage = combo >= 5 ? { text: `⚡ ${combo}연속! x2 보너스`, color: 'text-warning-400' }
    : combo >= 3 ? { text: `🔥 ${combo}연속! +5P 보너스`, color: 'text-brand-400' }
    : null;

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas)]">
      {/* 헤더 */}
      <div className="pt-4 px-5 pb-3 flex justify-between items-center bg-[var(--color-card)]">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-[var(--color-ink-3)]" />
        </button>
        <span className="text-xs font-medium text-[var(--color-ink-4)]">{currentQuizIndex + 1} / {quizQueue.length}</span>
        {/* 포인트 + 팝업 */}
        <div className="relative flex items-center gap-1">
          {showPointPop && (
            <span
              key={totalEarned}
              className="absolute -top-5 right-0 text-xs font-bold text-success-400 whitespace-nowrap"
              style={{ animation: 'fadeUp 0.7s ease forwards' }}
            >
              +{lastEarned}P
            </span>
          )}
          <Zap size={13} className="text-[var(--color-ink-4)] fill-current" />
          <span className="text-sm font-bold text-[var(--color-ink)]">{points}</span>
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

      {/* 콘텐츠 */}
      <div className="flex-1 flex flex-col px-5 py-5 gap-4">
        {/* 스트릭 배너 */}
        {streakMessage && status === 'idle' && (
          <div className={`flex items-center justify-center py-2 rounded-chip bg-[var(--color-card)] ${streakMessage.color} text-xs font-bold`}>
            {streakMessage.text}
          </div>
        )}

        {/* 문제 카드 */}
        <div className={`rounded-card p-5 flex-1 flex flex-col justify-center gap-4
          ${status === 'correct' ? 'flash-correct ring-2 ring-success-500/40' : 'bg-[var(--color-card)]'}
          ${status === 'wrong' ? 'bg-[var(--color-card)] ring-2 ring-danger-500/30' : ''}
          ${shake ? 'shake' : ''}
        `}>
          <span className="text-2xs font-medium text-[var(--color-ink-4)] tracking-widest uppercase">{quizItem?.promptLabel}</span>

          <p className="text-xl font-bold text-[var(--color-ink)] leading-snug mb-2 break-keep">{quizItem?.promptMain}</p>

          {quizItem?.promptSub && (
            <div className="bg-[var(--color-canvas)] rounded-chip px-4 py-3">
              <p className="text-sm text-[var(--color-ink-3)] leading-relaxed break-keep">{quizItem.promptSub}</p>
            </div>
          )}

          {status === 'correct' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-success-400">정답!</span>
              <span className="text-xs font-bold text-success-400">+{lastEarned}P</span>
              {combo >= 3 && <span className="text-xs font-bold text-brand-400">🔥 {combo}연속</span>}
            </div>
          )}
          {status === 'wrong' && (
            <p className="text-sm font-bold text-danger-400">
              정답: <span className="text-[var(--color-ink)]">{currentWord.word}</span>
            </p>
          )}
        </div>

        {/* 객관식 선택지 (뜻 보기는 길어서 1열) */}
        <div className={`grid gap-2 ${quizItem?.type === 'word_to_meaning' ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
                className={`relative py-4 px-4 pr-9 rounded-card text-sm font-bold text-left break-keep transition-all duration-150 ${optionStyle}`}
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
    </div>
  );
};

export default QuizScreen;
