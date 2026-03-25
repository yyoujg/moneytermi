import React, { useState } from 'react';
import { ChevronLeft, Heart, Zap } from 'lucide-react';
import { Button, TextButton, TextField } from '@toss/tds-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Word, Missions } from '../types';
import { useAppContext } from '../context/AppContext';

const QuizScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { points, setPoints, setMissions } = useAppContext();

  const quizQueue: Word[] = (location.state as { quizQueue?: Word[] } | null)?.quizQueue ?? [];

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizInput, setQuizInput] = useState('');
  const [combo, setCombo] = useState(0);
  const [showHint, setShowHint] = useState(false);

  if (!quizQueue || quizQueue.length === 0 || currentQuizIndex >= quizQueue.length) {
    return <div className="flex h-full items-center justify-center">퀴즈 완료!</div>;
  }

  const currentWord = quizQueue[currentQuizIndex];
  const progressPercent = (currentQuizIndex / quizQueue.length) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizInput.trim()) return;
    const cleanInput = quizInput.replace(/\s+/g, '').toLowerCase();
    const cleanAnswer = currentWord.word.replace(/\s+/g, '').toLowerCase();
    if (cleanInput === cleanAnswer) {
      const earnedPoints = showHint ? 5 : 10;
      const comboBonus = combo > 1 ? combo * 2 : 0;
      setPoints((p) => p + earnedPoints + comboBonus);
      setCombo((c) => c + 1);
      setMissions((prev: Missions) => ({ ...prev, m3: { ...prev.m3, current: Math.min(prev.m3.current + 1, prev.m3.target) } }));
      setTimeout(() => {
        setCurrentQuizIndex((prev) => prev + 1);
        setQuizInput('');
        setShowHint(false);
      }, 1000);
    } else {
      setCombo(0);
      setTimeout(() => setQuizInput(''), 800);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      <div className="pt-12 px-5 pb-3 flex justify-between items-center bg-white z-10 border-b border-gray-100">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2"><ChevronLeft size={28} className="text-gray-700" /></button>
        <div className="flex space-x-1">
          <Heart size={16} className="text-rose-500 fill-current" />
          <Heart size={16} className="text-rose-500 fill-current" />
          <Heart size={16} className="text-gray-200 fill-current" />
        </div>
        <div className="font-bold text-gray-900 flex items-center text-sm"><Zap size={16} className="mr-1 text-orange-500 fill-current" /> {points}</div>
      </div>
      <div className="w-full bg-gray-200 h-1 z-10"><div className="bg-orange-500 h-1 transition-all duration-300" style={{ width: `${progressPercent}%` }} /></div>
      <div className="flex-1 p-6 flex flex-col mt-4">
        <form onSubmit={handleSubmit} className="mt-auto mb-10">
          <div className="mb-4">
            <TextField variant="box" value={quizInput} onChange={(e) => setQuizInput(e.target.value)} placeholder="정답 입력" />
            {!showHint && <TextButton size="small" onClick={() => setShowHint(true)} className="mt-2">초성 보기</TextButton>}
          </div>
          <Button display="block" type="submit">제출하기</Button>
        </form>
      </div>
    </div>
  );
};

export default QuizScreen;
