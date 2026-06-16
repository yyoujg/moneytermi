import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Zap, Check, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { useSettings } from '../hooks/useSettings';
import { calculateRank } from '../utils/league';
import { feedbackCorrect, feedbackWrong } from '../lib/feedback';
import { DailyAlarmPromptCard } from '../components/DailyAlarmPromptCard';

export const getOptions = (correctWord: Word, knownWords: Word[], allWords: Word[]): string[] => {
  const pool = knownWords.length >= 4 ? knownWords : allWords;
  const others = pool.filter(w => w.id !== correctWord.id);
  const shuffled = [...others].sort(() => Math.random() - 0.5);

  const wrong: string[] = [];
  for (const w of shuffled) {
    if (wrong.length >= 3) break;
    wrong.push(w.word);
  }

  if (wrong.length < 3) {
    const fallback = allWords.filter(w => w.id !== correctWord.id).sort(() => Math.random() - 0.5);
    for (const w of fallback) {
      if (wrong.length >= 3) break;
      if (!wrong.includes(w.word)) wrong.push(w.word);
    }
  }

  return [...wrong.slice(0, 3), correctWord.word].sort(() => Math.random() - 0.5);
};

// 콤보 기반 포인트 계산
export const calcEarned = (combo: number): number => {
  if (combo >= 5) return 20;
  if (combo >= 3) return 15;
  return 10;
};

const QuizScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { points, otherLeagueUsers, allWords, knownWords, submitQuizAnswer } = useAppContext();

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

  const options = useMemo(() => {
    if (!currentWord) return [];
    return getOptions(currentWord, knownWords, allWords);
  }, [currentWord?.id, allWords, knownWords]);

  // +P 팝업 트리거
  useEffect(() => {
    if (showPointPop) {
      const t = setTimeout(() => setShowPointPop(false), 700);
      return () => clearTimeout(t);
    }
  }, [showPointPop]);

  // 완료 화면
  if (!quizQueue || quizQueue.length === 0 || currentQuizIndex >= quizQueue.length) {
    const accuracy = quizQueue.length > 0 ? Math.round((correctCount / quizQueue.length) * 100) : 0;
    const myRank = calculateRank(otherLeagueUsers, points);
    const prevRank = calculateRank(otherLeagueUsers, points - totalEarned);
    const rankRose = prevRank > myRank;

    return (
      <div className="flex h-full flex-col bg-[#F7F7F7]">
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5">
          <div className="text-6xl">🎉</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#111111] mb-1">퀴즈 완료!</h2>
            <p className="text-sm text-[#AAAAAA]">{quizQueue.length}문제 완료</p>
          </div>

          {/* 결과 카드 */}
          <div className="w-full bg-white rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#AAAAAA]">획득 포인트</span>
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-orange-500 fill-current" />
                <span className="text-xl font-bold text-orange-500">+{totalEarned}P</span>
              </div>
            </div>
            <div className="h-px bg-[#E5E5E5]" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#AAAAAA]">정답률</span>
              <span className="text-xl font-bold text-[#111111]">{accuracy}%</span>
            </div>
            <div className="h-px bg-[#E5E5E5]" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#AAAAAA]">최고 연속 정답</span>
              <span className="text-xl font-bold text-[#111111]">{maxCombo}연속 🔥</span>
            </div>
            {rankRose && (
              <>
                <div className="h-px bg-[#E5E5E5]" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#AAAAAA]">순위 변화</span>
                  <span className="text-sm font-bold text-green-400">🔥 {prevRank}위 → {myRank}위 상승!</span>
                </div>
              </>
            )}
          </div>

          <DailyAlarmPromptCard />
        </div>

        <div className="px-5 pb-12 flex flex-col gap-3">
          <button
            onClick={() => navigate('/home')}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white bg-orange-500 active:opacity-90"
          >
            홈으로
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = (currentQuizIndex / quizQueue.length) * 100;

  const handleSelect = async (option: string) => {
    if (status !== 'idle') return;
    setSelected(option);
    // 즉시 피드백은 낙관적 (정답 단어는 클라가 이미 앎). 포인트·콤보는 서버가 채점.
    const isCorrect = option === currentWord.word;

    if (isCorrect) {
      feedbackCorrect(soundOn, vibrationOn);
      setStatus('correct');
      setCorrectCount(c => c + 1);

      const res = await submitQuizAnswer(currentWord.id, option, 'mc', false, currentQuizIndex === 0);
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
      void submitQuizAnswer(currentWord.id, option, 'mc', false, currentQuizIndex === 0);
      // 오답: 900ms 후 재시도
      setTimeout(() => {
        setSelected(null);
        setStatus('idle');
      }, 900);
    }
  };

  // 스트릭 메시지
  const streakMessage = combo >= 5 ? { text: `⚡ ${combo}연속! x2 보너스`, color: 'text-yellow-400' }
    : combo >= 3 ? { text: `🔥 ${combo}연속! +5P 보너스`, color: 'text-orange-400' }
    : null;

  return (
    <div className="flex flex-col h-full bg-[#F7F7F7]">
      {/* 헤더 */}
      <div className="pt-4 px-5 pb-3 flex justify-between items-center bg-white">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-[#888888]" />
        </button>
        <span className="text-xs font-medium text-[#AAAAAA]">{currentQuizIndex + 1} / {quizQueue.length}</span>
        {/* 포인트 + 팝업 */}
        <div className="relative flex items-center gap-1">
          {showPointPop && (
            <span
              key={totalEarned}
              className="absolute -top-5 right-0 text-xs font-bold text-green-400 whitespace-nowrap"
              style={{ animation: 'fadeUp 0.7s ease forwards' }}
            >
              +{lastEarned}P
            </span>
          )}
          <Zap size={13} className="text-[#AAAAAA] fill-current" />
          <span className="text-sm font-bold text-[#111111]">{points}</span>
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
          0% { background-color: #FFFFFF; }
          30% { background-color: rgba(34,197,94,0.12); }
          100% { background-color: #FFFFFF; }
        }
        .shake { animation: shake 0.5s ease; }
        .flash-correct { animation: flashGreen 0.4s ease; }
      `}</style>

      {/* 진행 바 */}
      <div className="w-full bg-[#E5E5E5] h-1">
        <div
          className="bg-orange-500 h-1 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 flex flex-col px-5 py-5 gap-4">
        {/* 스트릭 배너 */}
        {streakMessage && status === 'idle' && (
          <div className={`flex items-center justify-center py-2 rounded-xl bg-white ${streakMessage.color} text-xs font-bold`}>
            {streakMessage.text}
          </div>
        )}

        {/* 문제 카드 */}
        <div className={`rounded-2xl p-5 flex-1 flex flex-col justify-center gap-4
          ${status === 'correct' ? 'flash-correct ring-2 ring-green-500/40' : 'bg-white'}
          ${status === 'wrong' ? 'bg-white ring-2 ring-red-500/30' : ''}
          ${shake ? 'shake' : ''}
        `}>
          <span className="text-[11px] font-medium text-[#AAAAAA] tracking-widest uppercase">이 뜻에 맞는 용어는?</span>

          <p className="text-xl font-bold text-[#111111] leading-snug">{currentWord.meaning}</p>

          <div className="bg-[#F7F7F7] rounded-xl px-4 py-3">
            <p className="text-sm text-[#888888] leading-relaxed break-keep">{currentWord.detailedMeaning}</p>
          </div>

          {status === 'correct' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-green-400">정답!</span>
              <span className="text-xs font-bold text-green-400">+{lastEarned}P</span>
              {combo >= 3 && <span className="text-xs font-bold text-orange-400">🔥 {combo}연속</span>}
            </div>
          )}
          {status === 'wrong' && (
            <p className="text-sm font-bold text-red-400">
              정답: <span className="text-[#111111]">{currentWord.word}</span>
            </p>
          )}
        </div>

        {/* 객관식 선택지 */}
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => {
            const isSelected = selected === option;
            const isCorrectOption = option === currentWord.word;
            let optionStyle = 'bg-white text-[#111111] active:bg-[#E8E8E8]';

            if (status !== 'idle') {
              if (isCorrectOption) {
                optionStyle = 'bg-green-500/15 text-green-400 ring-1 ring-green-500/50';
              } else if (isSelected && !isCorrectOption) {
                optionStyle = 'bg-red-500/15 text-red-400 ring-1 ring-red-500/40';
              } else {
                optionStyle = 'bg-white text-[#CCCCCC]';
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`relative py-4 px-4 rounded-2xl text-sm font-bold text-left transition-all duration-150 ${optionStyle}`}
              >
                {option}
                {status !== 'idle' && isCorrectOption && (
                  <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" />
                )}
                {status !== 'idle' && isSelected && !isCorrectOption && (
                  <X size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />
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
