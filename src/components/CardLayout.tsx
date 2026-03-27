import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

type WordDot = { active: boolean; onClick: () => void };

type Props = {
  accentBg: string;
  headerMeta: string;
  slideNum: number;
  slideTotal: number;
  slideLabel?: string;
  wordDots?: WordDot[];
  onBack: () => void;
  // 슬라이드 이동 (스와이프)
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  // 단어 이동 (버튼)
  onPrevWord?: () => void;
  onNextWord?: () => void;
  isFirstWord?: boolean;
  isLastWord?: boolean;
  cardKey?: string;
  children: React.ReactNode;
};

const SWIPE_THRESHOLD = 40;

const CardLayout = ({
  accentBg,
  headerMeta,
  slideNum,
  slideTotal,
  wordDots,
  onBack,
  onPrev,
  onNext,
  isFirst,
  isLast,
  onPrevWord,
  onNextWord,
  isFirstWord,
  isLastWord,
  cardKey,
  children,
}: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // 브라우저 스크롤 차단
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      touchStartY.current = null;
      if (dy > SWIPE_THRESHOLD && !isLast) onNext();
      else if (dy < -SWIPE_THRESHOLD && !isFirst) onPrev();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [isFirst, isLast, onPrev, onNext]);

  const showWordNav = onPrevWord || onNextWord;

  return (
    <div className="flex flex-col h-full bg-[#F7F7F7] relative overflow-hidden">


      {/* 상단 내비 */}
      <div className="relative z-10 pt-12 px-5 pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0F0F0]/80 border border-[#AAAAAA]"
          >
            <ChevronLeft size={20} className="text-[#555555]" />
          </button>

          {wordDots && wordDots.length > 0 && (
            <div className="flex items-center gap-1.5">
              {wordDots.map((dot, i) => (
                <button
                  key={i}
                  onClick={dot.onClick}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: dot.active ? 20 : 6,
                    backgroundColor: dot.active ? accentBg : '#AAAAAA',
                  }}
                />
              ))}
            </div>
          )}

          <div className="w-9" />
        </div>
      </div>

      {/* 카드 + 단어 버튼 */}
      <div className="relative z-10 flex-1 mx-4 mb-6 flex flex-col gap-3">

        {/* 카드 (스와이프 영역) */}
        <div
          ref={cardRef}
          key={cardKey}
          className="flex-1 bg-white rounded-[28px] border border-[#E5E5E5] shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col select-none"
        >
          {/* 카드 헤더 */}
          <div className="flex justify-between items-center px-6 pt-5 pb-2 shrink-0">
            <p className="text-[16px] font-black text-[#111111] break-keep">{headerMeta}</p>
            <div className="px-3 py-1 rounded-lg text-[11px] font-black text-[#888888] bg-[#F0F0F0] shrink-0 ml-2">
              {String(slideNum).padStart(2, '0')} / {String(slideTotal).padStart(2, '0')}
            </div>
          </div>

          {/* 슬라이드 콘텐츠 */}
          {children}


          {/* 스와이프 힌트 */}
          <div className="pb-3 flex justify-center shrink-0">
            {!isLast && (
              <ChevronDown
                size={22}
                className="animate-bounce-down text-[#AAAAAA]"
              />
            )}
          </div>
        </div>

        {/* 단어 이동 버튼 */}
        {showWordNav && (
          <div className="flex gap-2 shrink-0 justify-center">
            <button
              onClick={onPrevWord}
              disabled={isFirstWord}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E5E5E5] text-[#888888] disabled:opacity-30 active:bg-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={onNextWord}
              disabled={isLastWord}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white active:opacity-80 disabled:opacity-30"
              style={{ backgroundColor: isLastWord ? '#CCCCCC' : accentBg }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardLayout;
