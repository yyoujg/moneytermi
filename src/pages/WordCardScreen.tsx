import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Word, WordSlide } from '../types';
import { COURSES } from '../constants';
import { getWordSlides } from '../utils/wordSlides';
import CardLayout from '../components/CardLayout';

const ACCENT = '#f97316';

// ── 슬라이드 콘텐츠 ───────────────────────────────────────────────
function SlideContent({
  slide, word, accentBg, onTagClick,
}: {
  slide: WordSlide;
  word: Word;
  accentBg: string;
  onTagClick: (name: string) => void;
}) {
  // 공통: 상단 단어명 + 슬라이드 레이블
  const SlideHeader = () => (
    <div className="shrink-0 mb-3">
      <p className="text-[14px] font-semibold text-gray-400 break-keep">{slide.label}</p>
    </div>
  );

  if (slide.cardType === 'intro') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-6">
        <div className="text-5xl">{slide.emoji}</div>
        <div>
          <h1 className="text-[30px] font-black text-gray-900 leading-tight tracking-tight break-keep mb-3">
            {word.word}
          </h1>
          <p className="text-[15px] text-gray-400 font-medium break-keep">{word.meaning}</p>
        </div>
      </div>
    );
  }

  if (slide.cardType === 'summary') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-4 pb-4">
        <SlideHeader />
        <p className="text-[17px] font-semibold leading-[1.8] text-gray-700 break-keep">{slide.body}</p>
      </div>
    );
  }

  if (slide.cardType === 'content') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-4 pb-4">
        <SlideHeader />
        <p className="text-[15px] leading-[1.9] text-gray-600 font-medium break-keep">{slide.body}</p>
      </div>
    );
  }

  if (slide.cardType === 'photo') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-4 pb-4">
        <SlideHeader />
        <div className="flex flex-col gap-4">
          <div className="text-4xl">🎯</div>
          <p className="text-[15px] leading-[1.9] text-gray-600 font-medium break-keep">{slide.body}</p>
        </div>
      </div>
    );
  }

  if (slide.cardType === 'compare') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-4 pb-4">
        <SlideHeader />
        <div className="border-l-2 pl-4 border-gray-300">
          <p className="text-[15px] leading-[1.9] text-gray-600 font-medium break-keep">&ldquo;{slide.body}&rdquo;</p>
        </div>
      </div>
    );
  }

  if (slide.cardType === 'list') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-4 pb-4">
        <SlideHeader />
        <div className="flex flex-col">
          {slide.tags?.map((tag, i) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 active:opacity-60 text-left"
            >
              <span className="text-[12px] font-black w-4 shrink-0 text-gray-400">{i + 1}</span>
              <p className="text-[15px] font-semibold text-gray-800 break-keep flex-1">{tag}</p>
              <ChevronRight size={14} className="text-gray-300 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// ── 메인 ─────────────────────────────────────────────────────────
const WordCardScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { words: Word[]; index: number; backPath?: string; backState?: unknown } | null;
  const words = state?.words ?? [];
  const backPath = state?.backPath ?? '/course';
  const backState = state?.backState;

  const [wordIndex, setWordIndex] = useState(state?.index ?? 0);
  const [slideIndex, setSlideIndex] = useState(0);

  if (!words.length) {
    navigate(backPath, { replace: true });
    return null;
  }

  const word = words[wordIndex];
  const slides = getWordSlides(word);
  const totalSlides = slides.length;
  const currentSlide = slides[slideIndex];
  const accentBg = ACCENT;

  // 슬라이드 이동 (스와이프)
  const goPrev = () => {
    if (slideIndex > 0) setSlideIndex(s => s - 1);
  };
  const goNext = () => {
    if (slideIndex < totalSlides - 1) setSlideIndex(s => s + 1);
  };

  // 단어 이동 (버튼)
  const goPrevWord = () => { setWordIndex(i => i - 1); setSlideIndex(0); };
  const goNextWord = () => { setWordIndex(i => i + 1); setSlideIndex(0); };

  const handleRelatedWordClick = (wordName: string) => {
    const idx = words.findIndex(w => w.word === wordName);
    if (idx >= 0) { setWordIndex(idx); setSlideIndex(0); return; }
    const targetCourse = COURSES.find(c => c.words.some(w => w.word === wordName));
    if (targetCourse) {
      const targetIdx = targetCourse.words.findIndex(w => w.word === wordName);
      navigate('/word-card', { state: { words: targetCourse.words, index: targetIdx, backPath } });
    }
  };

  return (
    <CardLayout
      accentBg={accentBg}
      headerMeta={currentSlide?.cardType === 'intro' ? '' : word.word}
      slideNum={slideIndex + 1}
      slideTotal={totalSlides}
      slideLabel={currentSlide?.label}
      wordDots={words.map((_, i) => ({
        active: i === wordIndex,
        onClick: () => { setWordIndex(i); setSlideIndex(0); },
      }))}
      onBack={() => navigate(backPath, backState ? { state: backState } : undefined)}
      onPrev={goPrev}
      onNext={goNext}
      isFirst={slideIndex === 0}
      isLast={slideIndex === totalSlides - 1}
      onPrevWord={goPrevWord}
      onNextWord={goNextWord}
      isFirstWord={wordIndex === 0}
      isLastWord={wordIndex === words.length - 1}
      cardKey={`${word.id}-${slideIndex}`}
    >
      <SlideContent
        slide={currentSlide}
        word={word}
        accentBg={accentBg}
        onTagClick={handleRelatedWordClick}
      />
    </CardLayout>
  );
};

export default WordCardScreen;
