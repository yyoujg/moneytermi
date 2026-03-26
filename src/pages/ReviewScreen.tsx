import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Lightbulb, RotateCcw, Zap } from 'lucide-react';
import { Button, TextButton, TextField, Spacing } from '@toss/tds-mobile';
import { useAppContext } from '../context/AppContext';
import { ALL_WORDS } from '../constants';
import type { Missions } from '../types';

type Status = 'idle' | 'correct' | 'wrong';

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const QuizPage = () => {
  const { points, setPoints, setMissions } = useAppContext();

  const [queue] = useState(() => shuffle(ALL_WORDS));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [showHint, setShowHint] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [combo, setCombo] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const word = queue[index];
  const isFinished = index >= queue.length;

  useEffect(() => {
    if (status === 'idle') inputRef.current?.focus();
  }, [index, status]);

  const goNext = () => {
    setIndex((i) => i + 1);
    setInput('');
    setStatus('idle');
    setShowHint(false);
    setShowDetail(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle' || !input.trim()) return;

    const clean = (s: string) => s.replace(/\s+/g, '').toLowerCase();
    const isCorrect = clean(input) === clean(word.word);

    if (isCorrect) {
      const earned = (showHint ? 5 : 10) + (combo >= 2 ? combo * 2 : 0);
      setPoints((p) => p + earned);
      setCombo((c) => c + 1);
      setTotalCorrect((c) => c + 1);
      setStatus('correct');
      setMissions((prev: Missions) => ({
        ...prev,
        m3: { ...prev.m3, current: Math.min(prev.m3.current + 1, prev.m3.target) },
      }));
      setTimeout(goNext, 900);
    } else {
      setCombo(0);
      setStatus('wrong');
      setTimeout(() => { setStatus('idle'); setInput(''); }, 700);
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center justify-center p-6 pb-24">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-4xl mb-4">🏆</div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">퀴즈 완료!</h2>
        <p className="text-sm text-gray-400 mb-6">{queue.length}문제 중 {totalCorrect}개 정답</p>
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 mb-8">
          <Zap size={16} className="text-orange-500 fill-current" />
          <span className="text-sm font-bold text-gray-900">누적 포인트 {points} P</span>
        </div>
        <Button size="large" onClick={() => window.location.reload()}>
          <RotateCcw size={16} className="mr-2" />다시 풀기
        </Button>
      </div>
    );
  }

  const progress = (index / queue.length) * 100;
  const earnedPreview = (showHint ? 5 : 10) + (combo >= 2 ? combo * 2 : 0);

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="bg-white pt-12 px-5 pb-3 border-b border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-900">퀴즈</h2>
          <div className="flex items-center gap-2">
            {combo >= 2 && (
              <div className="bg-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                🔥 {combo}연속
              </div>
            )}
            <div className="flex items-center gap-1 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5">
              <Zap size={13} className="text-orange-500 fill-current" />
              <span className="text-xs font-bold text-gray-800">{points} P</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-orange-400 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-400 shrink-0">{index + 1} / {queue.length}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 py-5">
        {/* 문제 카드 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-5 flex-1">
          <p className="text-[11px] font-bold text-orange-400 mb-4">뜻을 보고 용어를 맞혀보세요</p>

          <p className="text-lg font-bold text-gray-900 leading-relaxed mb-5">{word.meaning}</p>

          {showHint && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 flex items-center gap-2 mb-4">
              <Lightbulb size={14} className="text-orange-400 shrink-0" />
              <span className="text-base font-bold text-orange-600 tracking-widest">{word.hint}</span>
            </div>
          )}

          {showDetail ? (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 mb-1.5">상세 설명</p>
              <p className="text-sm text-gray-500 leading-relaxed break-keep">{word.detailedMeaning}</p>
            </div>
          ) : (
            <TextButton size="small" onClick={() => setShowDetail(true)}>
              상세 설명 보기
            </TextButton>
          )}
        </div>

        {/* 입력 + 제출 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <TextField
              variant="box"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="용어를 입력하세요"
              disabled={status !== 'idle'}
              ref={inputRef}
              autoComplete="off"
            />
            {status === 'correct' && (
              <p className="text-xs font-bold text-green-500 mt-1.5 px-1">정답! +{earnedPreview}P</p>
            )}
            {status === 'wrong' && (
              <p className="text-xs font-bold text-red-400 mt-1.5 px-1">틀렸어요. 다시 시도해보세요!</p>
            )}
          </div>

          <Button
            type="submit"
            size="large"
            disabled={status !== 'idle' || !input.trim()}
            style={{ width: '100%' }}
          >
            제출하기
          </Button>
        </form>

        <Spacing size={12} />

        {/* 하단 보조 버튼 */}
        <div className="flex gap-3">
          {!showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-gray-100 bg-white text-xs font-bold text-gray-500 active:bg-gray-50"
            >
              <Lightbulb size={13} className="text-orange-400" /> 초성 힌트
            </button>
          )}
          <button
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-gray-100 bg-white text-xs font-bold text-gray-400 active:bg-gray-50"
          >
            <ChevronRight size={13} /> 건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
