import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Course, Missions } from '../types';
import { useAppContext } from '../context/AppContext';
import { getWordSlides } from '../utils/wordSlides';

const SwipeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setKnownWords, setMissions, allWords, courses } = useAppContext();

  const { course, initialIndex: stateInitialIndex } = (location.state as { course: Course; initialIndex?: number } | null) ?? {};
  const swipeQueue = course?.words ?? [];

  const [currentIndex, setCurrentIndex] = useState(stateInitialIndex ?? 0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null);

  React.useEffect(() => {
    setCurrentIndex(stateInitialIndex ?? 0);
    setSlideIndex(0);
  }, [location.key, stateInitialIndex]);

  if (!swipeQueue.length || currentIndex >= swipeQueue.length) {
    const quizWords = [...swipeQueue].sort(() => Math.random() - 0.5).slice(0, Math.min(5, swipeQueue.length));
    return (
      <div className="flex h-full flex-col bg-[#0B0B0B]">
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
          <div className="w-20 h-20 bg-[#161616] rounded-full flex items-center justify-center text-4xl">🎉</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">학습 완료!</h2>
            <p className="text-sm text-[#555555]">{swipeQueue.length}개 단어를 학습했어요</p>
          </div>
          <div className="w-full bg-[#161616] rounded-2xl p-4">
            <p className="text-xs text-[#555555] mb-3">방금 배운 단어, 바로 확인해볼까요?</p>
            <div className="flex flex-wrap gap-1.5">
              {swipeQueue.slice(0, 5).map(w => (
                <span key={w.id} className="text-xs px-2.5 py-1 rounded-full bg-[#1E1E1E] text-[#ABABAB]">{w.word}</span>
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
            className="w-full py-3 rounded-2xl bg-[#161616] text-xs font-medium text-[#777777] active:opacity-70">
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
      setSlideIndex((s) => s + 1);
      return;
    }
    setExitDir('left');
    setTimeout(() => {
      if (currentIndex === swipeQueue.length - 1) {
        setMissions((prev: Missions) => ({ ...prev, m2: { ...prev.m2, current: 1 } }));
      }
      setKnownWords((prev) => prev.some((w) => w.id === currentWord.id) ? prev : [...prev, currentWord]);
      setCurrentIndex((i) => i + 1);
      setSlideIndex(0);
      setExitDir(null);
    }, 250);
  };

  const goPrev = () => {
    if (slideIndex > 0) {
      setSlideIndex((s) => s - 1);
      return;
    }
    if (currentIndex === 0) return;
    setExitDir('right');
    setTimeout(() => {
      setCurrentIndex((i) => i - 1);
      setSlideIndex(0);
      setExitDir(null);
    }, 250);
  };

  const isFirstSlideOfFirstWord = currentIndex === 0 && slideIndex === 0;
  const isLastSlide = slideIndex === totalSlides - 1;

  return (
    <div className="flex flex-col h-full bg-[#0B0B0B] select-none">

      {/* 상단 세그먼트 진행바 + X 버튼 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-3">
        <div className="flex flex-1 gap-1">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-[3px] rounded-full transition-all duration-300 ${i <= slideIndex ? 'bg-orange-500' : 'bg-[#1E1E1E]'}`}
            />
          ))}
        </div>
        <button
          onClick={() => navigate('/course')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#161616] shrink-0"
        >
          <X size={15} className="text-[#ABABAB]" />
        </button>
      </div>

      {/* 콘텐츠 */}
      <div
        key={`${currentWord.id}-${slideIndex}`}
        className={`flex-1 flex flex-col px-5 pt-2 pb-4 overflow-y-auto [&::-webkit-scrollbar]:hidden transition-all duration-250
          ${exitDir === 'left' ? '-translate-x-[120%] opacity-0' : ''}
          ${exitDir === 'right' ? 'translate-x-[120%] opacity-0' : ''}
        `}
      >
        {/* 레벨 뱃지 + 단어 */}
        <div className="mb-5">
          <span className="text-[11px] font-medium text-[#777777] px-2.5 py-1 rounded-full" style={{ backgroundColor: '#1E1E1E' }}>
            {course?.level}
          </span>
          <h2 className="text-3xl font-bold text-white mt-4 mb-2 leading-tight">{currentWord.word}</h2>
          <p className="text-base font-semibold text-orange-500">{currentWord.meaning}</p>
        </div>

        <div className="w-8 h-[2px] bg-[#1E1E1E] mb-5" />

        {/* 슬라이드 카테고리 라벨 */}
        <p className="text-xs font-bold text-[#777777] tracking-widest uppercase mb-3">{currentSlide?.label}</p>

        {/* 슬라이드 이모지 */}
        <div className="text-5xl mb-4">{currentSlide?.emoji}</div>

        {/* 슬라이드 본문 */}
        {currentSlide?.tags ? (
          <div className="flex flex-wrap gap-2">
            {currentSlide.tags.map((rw) => (
              <button
                key={rw}
                onClick={() => {
                  const targetWord = allWords.find((w) => w.word === rw);
                  if (!targetWord) return;
                  const targetCourse = courses.find((c) => c.words.some((w) => w.id === targetWord.id));
                  if (!targetCourse) return;
                  const idx = targetCourse.words.findIndex((w) => w.id === targetWord.id);
                  navigate('/swipe', { state: { course: targetCourse, initialIndex: idx } });
                }}
                className="text-sm font-medium text-[#ABABAB] bg-[#1E1E1E] px-4 py-2 rounded-full active:bg-[#2A2A2A]"
              >
                {rw}
              </button>
            ))}
          </div>
        ) : currentSlide?.cardType === 'compare' ? (
          <div className="bg-[#1E1E1E] rounded-2xl p-4">
            <p className="text-sm text-[#ABABAB] leading-relaxed break-keep">"{currentSlide.body}"</p>
          </div>
        ) : (
          <p className="text-base text-[#D1D1D6] leading-relaxed break-keep">{currentSlide?.body}</p>
        )}
      </div>

      {/* 하단 버튼: 뒤로 (작게) + 다음 (크게 오렌지) */}
      <div className="flex gap-3 px-5 pb-8 pt-3">
        <button
          onClick={goPrev}
          disabled={isFirstSlideOfFirstWord}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#161616] text-[#777777] disabled:opacity-30 active:opacity-70 transition-colors shrink-0"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={goNext}
          className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl font-bold text-sm transition-colors
            ${isLastSlide
              ? 'bg-orange-500 text-white active:bg-orange-600'
              : 'bg-orange-500 text-white active:bg-orange-600'
            }`}
        >
          다음 <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
};

export default SwipeScreen;
