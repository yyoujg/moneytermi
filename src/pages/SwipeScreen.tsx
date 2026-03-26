import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Missions } from '../types';
import { ALL_WORDS, COURSES } from '../constants';
import { useAppContext } from '../context/AppContext';
import { getWordSlides } from '../utils/wordSlides';

const SwipeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setKnownWords, setMissions } = useAppContext();

  const { course, initialIndex: stateInitialIndex } = (location.state as { course: (typeof COURSES)[number]; initialIndex?: number } | null) ?? {};
  const swipeQueue = course?.words ?? [];

  const [currentIndex, setCurrentIndex] = useState(stateInitialIndex ?? 0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null);

  React.useEffect(() => {
    setCurrentIndex(stateInitialIndex ?? 0);
    setSlideIndex(0);
  }, [location.key, stateInitialIndex]);

  if (!swipeQueue.length || currentIndex >= swipeQueue.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-gray-50 p-8">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-5xl">🎉</div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">코스 완료!</h2>
          <p className="text-sm text-gray-400">모든 단어를 학습했어요</p>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <button onClick={() => navigate('/course')}
            className="flex-1 py-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-600 active:bg-gray-50">
            코스로 돌아가기
          </button>
          <button onClick={() => navigate('/home')}
            className="flex-1 py-4 rounded-2xl bg-orange-500 text-sm font-bold text-white active:bg-orange-600">
            홈으로
          </button>
        </div>
      </div>
    );
  }

  const currentWord = swipeQueue[currentIndex];
  const slides = getWordSlides(currentWord);
  const totalSlides = slides.length;
  const currentSlide = slides[slideIndex];
  const progress = (currentIndex / swipeQueue.length) * 100;

  const goNext = () => {
    if (slideIndex < totalSlides - 1) {
      setSlideIndex((s) => s + 1);
      return;
    }
    // last slide → next word
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* 헤더 */}
      <div className="pt-12 px-5 pb-4 bg-white border-b border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <button onClick={() => navigate('/course')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-500">{course?.title}</p>
            <p className="text-[11px] text-gray-300 mt-0.5">{course?.level}</p>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5">
            <span className="text-xs font-bold text-orange-500">
              {currentIndex + 1}<span className="text-orange-300 mx-0.5">/</span>{swipeQueue.length}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-orange-400 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* 카드 */}
      <div className="flex-1 flex flex-col px-5 py-4 select-none overflow-hidden">
        <div
          key={currentWord.id}
          className={`flex-1 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col transition-all duration-250
            ${exitDir === 'left' ? '-translate-x-[120%] opacity-0' : ''}
            ${exitDir === 'right' ? 'translate-x-[120%] opacity-0' : ''}
          `}
        >
          {/* 상단 슬라이드 진행 바 (5칸) */}
          <div className="flex gap-1 px-5 pt-5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= slideIndex ? 'bg-orange-400' : 'bg-gray-100'}`}
              />
            ))}
          </div>

          {/* 슬라이드 콘텐츠 */}
          <div
            key={`${currentWord.id}-${slideIndex}`}
            className="flex-1 flex flex-col p-6 gap-4"
          >
            {/* 레벨 뱃지 + 단어 */}
            <div>
              <span className="text-[11px] font-bold text-orange-400 bg-orange-50 px-2.5 py-1 rounded-full">
                {course?.level}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-3 mb-1">{currentWord.word}</h2>
              <p className="text-sm font-semibold text-orange-500">{currentWord.meaning}</p>
            </div>

            <div className="w-8 h-[2px] bg-gray-100" />

            {/* 슬라이드 카테고리 라벨 */}
            <p className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">{currentSlide?.label}</p>

            {/* 슬라이드 이모지 */}
            <div className="text-5xl">{currentSlide?.emoji}</div>

            {/* 슬라이드 본문 */}
            {currentSlide?.tags ? (
              <div className="flex flex-wrap gap-2">
                {currentSlide.tags.map((rw) => (
                  <button
                    key={rw}
                    onClick={() => {
                      const targetWord = ALL_WORDS.find((w) => w.word === rw);
                      if (!targetWord) return;
                      const targetCourse = COURSES.find((c) => c.words.some((w) => w.id === targetWord.id));
                      if (!targetCourse) return;
                      const idx = targetCourse.words.findIndex((w) => w.id === targetWord.id);
                      navigate('/swipe', { state: { course: targetCourse, initialIndex: idx } });
                    }}
                    className="text-sm font-semibold text-orange-500 bg-orange-50 border border-orange-100 px-4 py-2 rounded-full active:bg-orange-100"
                  >
                    {rw}
                  </button>
                ))}
              </div>
            ) : currentSlide?.isQuote ? (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed break-keep">"{currentSlide.body}"</p>
              </div>
            ) : (
              <p className="text-base text-gray-700 leading-relaxed break-keep">{currentSlide?.body}</p>
            )}
          </div>

          {/* 슬라이드 번호 */}
          <div className="px-6 pb-4 text-center">
            <span className="text-xs text-gray-300 font-medium">{slideIndex + 1} / {totalSlides}</span>
          </div>
        </div>

        {/* 이전 / 다음 버튼 */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={goPrev}
            disabled={isFirstSlideOfFirstWord}
            className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-white border border-gray-100 shadow-sm text-gray-400 disabled:opacity-30 active:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={26} />
          </button>
          <button
            onClick={goNext}
            className={`flex-1 flex items-center justify-center h-14 rounded-2xl shadow-sm transition-colors
              ${isLastSlide ? 'bg-orange-500 text-white active:bg-orange-600' : 'bg-white border border-gray-100 text-gray-500 active:bg-gray-50'}`}
          >
            <ChevronRight size={26} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwipeScreen;
