import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Course, Missions } from '../types';
import { useAppContext } from '../context/AppContext';
import { getWordSlides } from '../utils/wordSlides';
import CardLayout from '../components/CardLayout';
import { WordSlideContent } from '../components/WordSlideContent';

const ACCENT = '#f97316';

const SwipeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { knownWords, setKnownWords, toggleKnown, setMissions, courses } = useAppContext();

  const { course, initialIndex: stateInitialIndex } = (location.state as { course: Course; initialIndex?: number } | null) ?? {};
  const swipeQueue = course?.words ?? [];

  const [currentIndex, setCurrentIndex] = useState(stateInitialIndex ?? 0);
  const [slideIndex, setSlideIndex] = useState(0);

  React.useEffect(() => {
    setCurrentIndex(stateInitialIndex ?? 0);
    setSlideIndex(0);
  }, [location.key, stateInitialIndex]);

  // 완료 화면
  if (!swipeQueue.length || currentIndex >= swipeQueue.length) {
    const quizWords = [...swipeQueue].sort(() => Math.random() - 0.5).slice(0, Math.min(5, swipeQueue.length));
    return (
      <div className="flex h-full flex-col bg-[#F7F7F7]">
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl">🎉</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#111111] mb-1">학습 완료!</h2>
            <p className="text-sm text-[#AAAAAA]">{swipeQueue.length}개 단어를 학습했어요</p>
          </div>
          <div className="w-full bg-white rounded-2xl p-4">
            <p className="text-xs text-[#AAAAAA] mb-3">방금 배운 단어, 바로 확인해볼까요?</p>
            <div className="flex flex-wrap gap-1.5">
              {swipeQueue.slice(0, 5).map(w => (
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
          <button onClick={() => navigate('/course')}
            className="w-full py-3 rounded-2xl bg-white text-xs font-medium text-[#888888] active:opacity-70">
            코스로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const currentWord = swipeQueue[currentIndex];
  const slides = getWordSlides(currentWord);
  const totalSlides = slides.length;
  const currentSlide = slides[slideIndex];

  const goNext = () => {
    if (slideIndex < totalSlides - 1) {
      setSlideIndex(s => s + 1);
      return;
    }
    // 마지막 슬라이드 → 다음 단어로
    setKnownWords(prev => prev.some(w => w.id === currentWord.id) ? prev : [...prev, currentWord]);
    if (currentIndex === swipeQueue.length - 1) {
      setMissions((prev: Missions) => ({ ...prev, m2: { ...prev.m2, current: 1 } }));
    }
    setCurrentIndex(i => i + 1);
    setSlideIndex(0);
  };

  const goPrev = () => {
    if (slideIndex > 0) {
      setSlideIndex(s => s - 1);
      return;
    }
    if (currentIndex === 0) return;
    setCurrentIndex(i => i - 1);
    setSlideIndex(0);
  };

  const handleRelatedWordClick = (wordName: string) => {
    const idx = swipeQueue.findIndex(w => w.word === wordName);
    if (idx >= 0) { setCurrentIndex(idx); setSlideIndex(0); return; }
    const targetCourse = courses.find(c => c.words.some(w => w.word === wordName));
    if (targetCourse) {
      const targetIdx = targetCourse.words.findIndex(w => w.word === wordName);
      navigate('/swipe', { state: { course: targetCourse, initialIndex: targetIdx } });
    }
  };

  const isKnown = knownWords.some(w => w.id === currentWord.id);
  const isAbsoluteFirst = currentIndex === 0 && slideIndex === 0;
  const isAbsoluteLast = currentIndex === swipeQueue.length - 1 && slideIndex === totalSlides - 1;

  return (
    <CardLayout
      accentBg={ACCENT}
      headerMeta={currentSlide?.cardType === 'intro' ? '' : currentWord.word}
      slideNum={slideIndex + 1}
      slideTotal={totalSlides}
      slideLabel={currentSlide?.label}
      wordDots={swipeQueue.map((_, i) => ({
        active: i === currentIndex,
        onClick: () => { setCurrentIndex(i); setSlideIndex(0); },
      }))}
      onBack={() => navigate('/course')}
      onPrev={goPrev}
      onNext={goNext}
      isFirst={isAbsoluteFirst}
      isLast={isAbsoluteLast}
      isKnown={isKnown}
      onToggleKnown={() => toggleKnown(currentWord)}
      cardKey={`${currentWord.id}-${slideIndex}`}
    >
      <WordSlideContent
        slide={currentSlide}
        word={currentWord}
        onTagClick={handleRelatedWordClick}
      />
    </CardLayout>
  );
};

export default SwipeScreen;
