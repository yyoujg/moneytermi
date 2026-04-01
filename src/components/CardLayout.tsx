import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, CheckCircle } from 'lucide-react';

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
  // 완료 토글
  isKnown?: boolean;
  onToggleKnown?: () => void;
  cardKey?: string;
  children: React.ReactNode;
};

const SWIPE_THRESHOLD = 40;

const CardLayout = ({
  accentBg,
  headerMeta,
  slideNum,
  slideTotal,
  slideLabel,
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
  isKnown,
  onToggleKnown,
  cardKey,
  children,
}: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      isSwiping.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (dy > 8) {
        isSwiping.current = true;
        e.preventDefault(); // 스와이프 중에만 스크롤 차단
      }
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
      <div className="relative z-10 pt-4 px-5 pb-3">
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

        {/* 단어명 카드 */}
        {headerMeta && (
          <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-[0_4px_16px_rgba(0,0,0,0.06)] px-6 py-4 shrink-0">
            <p className="text-[22px] font-black text-[#111111] break-keep">{headerMeta}</p>
          </div>
        )}

        {/* 콘텐츠 카드 (스와이프 영역) */}
        <div
          ref={cardRef}
          key={cardKey}
          className="flex-1 bg-white rounded-[28px] border border-[#E5E5E5] shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col select-none"
        >
          {/* 레이블 + 슬라이드 번호 */}
          <div className="flex justify-between items-center px-6 pt-5 pb-2 shrink-0">
            <p className="text-[15px] font-bold text-[#444444] break-keep">{slideLabel ?? ''}</p>
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
                size={32}
                className="animate-bounce-down text-[#AAAAAA]"
              />
            )}
          </div>
        </div>

        {/* 완료 버튼 — 마지막 슬라이드에만 표시 */}
        {onToggleKnown && isLast && (
          <button
            onClick={onToggleKnown}
            className={`flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold active:opacity-80 transition-colors shrink-0
              ${isKnown ? 'bg-orange-500 text-white' : 'bg-white border border-[#E5E5E5] text-[#888888]'}`}
          >
            <CheckCircle size={14} strokeWidth={2.5} />
            {isKnown ? '완료' : '완료하기'}
          </button>
        )}

        {/* 단어 이동 버튼 — 좌우 고정 */}
        {showWordNav && (
          <>
            <button
              onClick={onPrevWord}
              disabled={isFirstWord}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-[#AAAAAA] disabled:opacity-20 active:opacity-50 z-20"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={onNextWord}
              disabled={isLastWord}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center disabled:opacity-20 active:opacity-50 z-20"
              style={{ color: isLastWord ? '#CCCCCC' : accentBg }}
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CardLayout;
