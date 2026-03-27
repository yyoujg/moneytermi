import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Word, Missions } from '../types';
import { useAppContext } from '../context/AppContext';
import { getWordSlides } from '../utils/wordSlides';
import CardLayout from '../components/CardLayout';
import { WordSlideContent } from '../components/WordSlideContent';

const ACCENT = '#f97316';

// ── 메인 ─────────────────────────────────────────────────────────
const WordCardScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, knownWords, toggleKnown, setKnownWords, setMissions } = useAppContext();

  const state = location.state as {
    words: Word[];
    index: number;
    backPath?: string;
    backState?: unknown;
    autoAdvance?: boolean;
  } | null;

  const words = state?.words ?? [];
  const backPath = state?.backPath ?? '/course';
  const backState = state?.backState;
  const autoAdvance = state?.autoAdvance ?? false;

  const [wordIndex, setWordIndex] = useState(state?.index ?? 0);
  const [slideIndex, setSlideIndex] = useState(0);

  // autoAdvance 완료 화면
  if (autoAdvance && words.length > 0 && wordIndex >= words.length) {
    const quizWords = [...words].sort(() => Math.random() - 0.5).slice(0, Math.min(5, words.length));
    return (
      <div className="flex h-full flex-col bg-[#F7F7F7]">
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl">🎉</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#111111] mb-1">학습 완료!</h2>
            <p className="text-sm text-[#AAAAAA]">{words.length}개 단어를 학습했어요</p>
          </div>
          <div className="w-full bg-white rounded-2xl p-4">
            <p className="text-xs text-[#AAAAAA] mb-3">방금 배운 단어, 바로 확인해볼까요?</p>
            <div className="flex flex-wrap gap-1.5">
              {words.slice(0, 5).map(w => (
                <span key={w.id} className="text-xs px-2.5 py-1 rounded-full bg-[#F0F0F0] text-[#555555]">{w.word}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 pb-12 flex flex-col gap-2.5">
          <button
            onClick={() => navigate('/quiz', { state: { quizQueue: quizWords } })}
            className="w-full py-4 rounded-2xl bg-orange-500 text-sm font-bold text-white active:opacity-90"
          >
            바로 퀴즈 풀기 →
          </button>
          <button
            onClick={() => navigate(backPath, backState ? { state: backState } : undefined)}
            className="w-full py-3 rounded-2xl bg-white text-xs font-medium text-[#888888] active:opacity-70"
          >
            코스로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!words.length) {
    navigate(backPath, { replace: true });
    return null;
  }

  const word = words[wordIndex];
  const slides = getWordSlides(word);
  const totalSlides = slides.length;
  const currentSlide = slides[slideIndex];

  const goPrev = () => {
    if (slideIndex > 0) { setSlideIndex(s => s - 1); return; }
    if (autoAdvance && wordIndex > 0) { setWordIndex(i => i - 1); setSlideIndex(0); }
  };

  const goNext = () => {
    if (slideIndex < totalSlides - 1) { setSlideIndex(s => s + 1); return; }
    if (autoAdvance) {
      // 마지막 슬라이드 → 완료 처리 후 다음 단어
      setKnownWords(prev => prev.some(w => w.id === word.id) ? prev : [...prev, word]);
      if (wordIndex === words.length - 1) {
        setMissions((prev: Missions) => ({ ...prev, m2: { ...prev.m2, current: 1 } }));
      }
      setWordIndex(i => i + 1);
      setSlideIndex(0);
    }
  };

  const handleRelatedWordClick = (wordName: string) => {
    const idx = words.findIndex(w => w.word === wordName);
    if (idx >= 0) { setWordIndex(idx); setSlideIndex(0); return; }
    const targetCourse = courses.find(c => c.words.some(w => w.word === wordName));
    if (targetCourse) {
      const targetIdx = targetCourse.words.findIndex(w => w.word === wordName);
      navigate('/word-card', { state: { words: targetCourse.words, index: targetIdx, backPath, autoAdvance } });
    }
  };

  const isKnown = knownWords.some(w => w.id === word.id);
  const isAbsoluteFirst = wordIndex === 0 && slideIndex === 0;
  const isAbsoluteLast = autoAdvance
    ? wordIndex === words.length - 1 && slideIndex === totalSlides - 1
    : slideIndex === totalSlides - 1;

  return (
    <CardLayout
      accentBg={ACCENT}
      headerMeta={currentSlide?.cardType === 'intro' ? '' : word.word}
      slideNum={slideIndex + 1}
      slideTotal={totalSlides}
      slideLabel={currentSlide?.label}
      wordDots={words.map((_, i) => {
        const firstLocked = words.findIndex(w => !knownWords.some(kw => kw.id === w.id));
        const accessible = firstLocked === -1 || i <= firstLocked;
        return {
          active: i === wordIndex,
          onClick: accessible ? () => { setWordIndex(i); setSlideIndex(0); } : () => {},
        };
      })}
      onBack={() => navigate(backPath, backState ? { state: backState } : undefined)}
      onPrev={goPrev}
      onNext={goNext}
      isFirst={autoAdvance ? isAbsoluteFirst : slideIndex === 0}
      isLast={isAbsoluteLast}
      isKnown={isKnown}
      onToggleKnown={autoAdvance ? undefined : () => {
        toggleKnown(word);
        if (!isKnown && wordIndex < words.length - 1) {
          setWordIndex(i => i + 1);
          setSlideIndex(0);
        }
      }}
      cardKey={`${word.id}-${slideIndex}`}
    >
      <WordSlideContent
        slide={currentSlide}
        word={word}
        onTagClick={handleRelatedWordClick}
      />
    </CardLayout>
  );
};

export default WordCardScreen;
