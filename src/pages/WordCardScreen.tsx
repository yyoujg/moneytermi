import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { getWordSlides } from '../utils/wordSlides';
import CardLayout from '../components/CardLayout';
import { WordSlideContent } from '../components/WordSlideContent';

const ACCENT = '#f97316';

// ── 메인 ─────────────────────────────────────────────────────────
const WordCardScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, knownWords, toggleKnown } = useAppContext();

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

  const isKnown = knownWords.some(w => w.id === word.id);

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

      isKnown={isKnown}
      onToggleKnown={() => {
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
