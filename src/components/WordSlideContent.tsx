import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { Word, WordSlide } from '../types';

function SlideHeader({ label }: { label: string }) {
  return (
    <div className="shrink-0 mb-3">
      <p className="text-[14px] font-semibold text-[#888888] break-keep">{label}</p>
    </div>
  );
}

export function WordSlideContent({
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
