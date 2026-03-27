import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Zap, Check, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Storage } from '@apps-in-toss/web-framework';
import type { Word, Missions } from '../types';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import GuestLinkSheet from '../components/GuestLinkSheet';
import { feedbackCorrect, feedbackWrong } from '../lib/feedback';

const getOptions = (correctWord: Word, allWords: Word[]): string[] => {
  const others = allWords.filter(w => w.id !== correctWord.id);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  const wrong = shuffled.slice(0, 3).map(w => w.word);
  return [...wrong, correctWord.word].sort(() => Math.random() - 0.5);
};

// 콤보 기반 포인트 계산
const calcEarned = (combo: number): number => {
  if (combo >= 5) return 20;
  if (combo >= 3) return 15;
  return 10;
};

const QuizScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { points, setPoints, setMissions, otherLeagueUsers, allWords } = useAppContext();

  const quizQueue: Word[] = (location.state as { quizQueue?: Word[] } | null)?.quizQueue ?? [];

  const { isGuest, linkAccount } = useAuth();
  const [showLinkSheet, setShowLinkSheet] = useState(false);

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
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);

  useEffect(() => {
    Storage.getItem('setting_sound').then(v => { if (v !== null) setSoundOn(v !== 'off'); }).catch(() => {});
    Storage.getItem('setting_vibration').then(v => { if (v !== null) setVibrationOn(v !== 'off'); }).catch(() => {});
  }, []);

  const currentWord = quizQueue[currentQuizIndex];

  const options = useMemo(() => {
    if (!currentWord) return [];
    return getOptions(currentWord, allWords);
  }, [currentWord?.id, allWords]);

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
    const rankEstimate = Math.max(1, Math.floor(totalEarned / 5));
    const myRank = (() => {
      const league = [...otherLeagueUsers, { id: 'me', points }].sort((a, b) => b.points - a.points);
      return league.findIndex(u => u.id === 'me') + 1;
    })();
    const prevRank = (() => {
      const league = [...otherLeagueUsers, { id: 'me', points: points - totalEarned }].sort((a, b) => b.points - a.points);
      return league.findIndex(u => u.id === 'me') + 1;
    })();
    const rankRose = prevRank > myRank;

    return (
      <div className="flex h-full flex-col bg-[#F7F7F7]">
        {showLinkSheet && (
          <GuestLinkSheet
            onClose={() => setShowLinkSheet(false)}
            onLink={(email) => { linkAccount(email); setShowLinkSheet(false); }}
          />
        )}
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
        </div>

        <div className="px-5 pb-12 flex flex-col gap-3">
          {isGuest && totalEarned > 0 && (
            <div className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ backgroundColor: '#110C04' }}>
              <div>
                {rankRose
                  ? <p className="text-sm font-bold text-orange-400">🔥 {prevRank}위 → {myRank}위 상승!</p>
                  : <p className="text-sm font-bold text-orange-400">+{totalEarned}P 획득!</p>
                }
                <p className="text-xs text-[#AAAAAA] mt-0.5">지금 저장하면 {points}P + {myRank}위 유지됩니다</p>
              </div>
              <button
                onClick={() => setShowLinkSheet(true)}
                className="w-full py-3 rounded-xl bg-orange-500 text-sm font-bold text-white active:opacity-90"
              >
                🔥 지금 저장하기
              </button>
            </div>
          )}
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

  const handleSelect = (option: string) => {
    if (status !== 'idle') return;
    setSelected(option);
    const isCorrect = option === currentWord.word;

    if (isCorrect) {
      const newCombo = combo + 1;
      const earned = calcEarned(newCombo);

      feedbackCorrect(soundOn, vibrationOn);
      setPoints(p => p + earned);
      setTotalEarned(t => t + earned);
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      setCorrectCount(c => c + 1);
      setLastEarned(earned);
      setShowPointPop(true);
      setStatus('correct');
      setMissions((prev: Missions) => ({
        ...prev,
        m3: { ...prev.m3, current: Math.min(prev.m3.current + 1, prev.m3.target) },
      }));
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
      <div className="pt-12 px-5 pb-3 flex justify-between items-center bg-white">
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

          <div className="w-8 h-[2px] bg-[#E5E5E5]" />

          <p className="text-sm text-[#888888] leading-relaxed break-keep">{currentWord.detailedMeaning}</p>

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
