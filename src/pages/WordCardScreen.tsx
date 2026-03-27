import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Word, WordSlide } from '../types';
import { useAppContext } from '../context/AppContext';
import { getWordSlides } from '../utils/wordSlides';
import CardLayout from '../components/CardLayout';

const ACCENT = '#f97316';

// ── SlideHeader (렌더 외부에 선언) ───────────────────────────────
function SlideHeader({ label }: { label: string }) {
  return (
    <div className="shrink-0 mb-3">
      <p className="text-[14px] font-semibold text-[#888888] break-keep">{label}</p>
    </div>
  );
}

// ── 슬라이드 콘텐츠 ───────────────────────────────────────────────
function SlideContent({
  slide, word, onTagClick,
}: {
  slide: WordSlide;
  word: Word;
  onTagClick: (name: string) => void;
}) {
  if (slide.cardType === 'intro') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-6">
        <div className="text-5xl">{slide.emoji}</div>
        <div>
          <h1 className="text-[30px] font-black text-[#111111] leading-tight tracking-tight break-keep mb-3">
            {word.word}
          </h1>
          <p className="text-[15px] text-[#555555] font-medium break-keep">{word.meaning}</p>
        </div>
      </div>
    );
  }

  if (slide.cardType === 'summary') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-4 pb-4">
        <SlideHeader label={slide.label} />
        <p className="text-[17px] font-semibold leading-[1.8] text-[#333333] break-keep">{slide.body}</p>
      </div>
    );
  }

  if (slide.cardType === 'content') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-4 pb-4">
        <SlideHeader label={slide.label} />
        <p className="text-[15px] leading-[1.9] text-[#555555] font-medium break-keep">{slide.body}</p>
      </div>
    );
  }

  if (slide.cardType === 'photo') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-4 pb-4">
        <SlideHeader label={slide.label} />
        <div className="flex flex-col gap-4">
          <div className="text-4xl">🎯</div>
          <p className="text-[15px] leading-[1.9] text-[#555555] font-medium break-keep">{slide.body}</p>
        </div>
      </div>
    );
  }

  if (slide.cardType === 'compare') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-4 pb-4">
        <SlideHeader label={slide.label} />
        <div className="border-l-2 pl-4 border-[#E5E5E5]">
          <p className="text-[15px] leading-[1.9] text-[#555555] font-medium break-keep">&ldquo;{slide.body}&rdquo;</p>
        </div>
      </div>
    );
  }

  if (slide.cardType === 'list') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-4 pb-4">
        <SlideHeader label={slide.label} />
        <div className="flex flex-col">
          {slide.tags?.map((tag, i) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="flex items-center gap-3 py-3 border-b border-[#E5E5E5] last:border-0 active:opacity-60 text-left"
            >
              <span className="text-[12px] font-black w-4 shrink-0 text-[#AAAAAA]">{i + 1}</span>
              <p className="text-[15px] font-semibold text-[#111111] break-keep flex-1">{tag}</p>
              <ChevronRight size={14} className="text-[#AAAAAA] shrink-0" />
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
  const { courses } = useAppContext();

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

  const goPrev = () => { if (slideIndex > 0) setSlideIndex(s => s - 1); };
  const goNext = () => { if (slideIndex < totalSlides - 1) setSlideIndex(s => s + 1); };
  const goPrevWord = () => { setWordIndex(i => i - 1); setSlideIndex(0); };
  const goNextWord = () => { setWordIndex(i => i + 1); setSlideIndex(0); };

  const handleRelatedWordClick = (wordName: string) => {
    const idx = words.findIndex(w => w.word === wordName);
    if (idx >= 0) { setWordIndex(idx); setSlideIndex(0); return; }
    const targetCourse = courses.find(c => c.words.some(w => w.word === wordName));
    if (targetCourse) {
      const targetIdx = targetCourse.words.findIndex(w => w.word === wordName);
      navigate('/word-card', { state: { words: targetCourse.words, index: targetIdx, backPath } });
    }
  };

  return (
    <CardLayout
      accentBg={ACCENT}
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
        onTagClick={handleRelatedWordClick}
      />
    </CardLayout>
  );
};

export default WordCardScreen;
