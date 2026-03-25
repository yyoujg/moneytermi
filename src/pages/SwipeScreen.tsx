import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Border, Button, Post } from '@toss/tds-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Missions } from '../types';
import { COURSES } from '../constants';
import { useAppContext } from '../context/AppContext';

const SwipeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setKnownWords, setUnknownWords, setMissions } = useAppContext();

  const course = (location.state as { course: (typeof COURSES)[number] } | null)?.course ?? null;
  const swipeQueue = course?.words ?? [];

  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragCurrentX, setDragCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  if (!swipeQueue || swipeQueue.length === 0 || currentSwipeIndex >= swipeQueue.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-white p-6">
        <Post.Paragraph typography="t5">코스 완료!</Post.Paragraph>
        <div className="w-full">
          <Button display="block" onClick={() => navigate('/home')}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const currentWord = swipeQueue[currentSwipeIndex];

  const handleSwipe = (isKnown: boolean) => {
    setSwipeDirection(isKnown ? 'right' : 'left');
    setDragStartX(null);
    setDragCurrentX(null);
    setIsDragging(false);
    setTimeout(() => {
      if (currentSwipeIndex === swipeQueue.length - 1) {
        setMissions((prev: Missions) => ({ ...prev, m2: { ...prev.m2, current: 1 } }));
      }
      if (isKnown) {
        setKnownWords((prev) => (prev.some((w) => w.id === currentWord.id) ? prev : [...prev, currentWord]));
        setUnknownWords((prev) => prev.filter((w) => w.id !== currentWord.id));
      } else {
        setUnknownWords((prev) => (prev.some((w) => w.id === currentWord.id) ? prev : [...prev, currentWord]));
        setKnownWords((prev) => prev.filter((w) => w.id !== currentWord.id));
      }
      setCurrentSwipeIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const getClientX = (e: React.MouseEvent | React.TouchEvent) =>
    'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX;

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = getClientX(e);
    setDragStartX(clientX);
    setDragCurrentX(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    setDragCurrentX(getClientX(e));
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragCurrentX === null || dragStartX === null) return;
    const deltaX = dragCurrentX - dragStartX;
    if (deltaX > 100) handleSwipe(true);
    else if (deltaX < -100) handleSwipe(false);
    else {
      setDragStartX(null);
      setDragCurrentX(null);
    }
  };

  let cardStyle: React.CSSProperties = {};
  if (isDragging && dragStartX !== null && dragCurrentX !== null) {
    cardStyle = { transform: `translate(${dragCurrentX - dragStartX}px, 0) rotate(${(dragCurrentX - dragStartX) * 0.05}deg)`, transition: 'none' };
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="pt-12 px-5 pb-4 flex justify-between items-center">
        <button onClick={() => navigate('/home')}><ChevronLeft size={28} /></button>
        <span>{course?.title}</span>
        <span>{currentSwipeIndex + 1} / {swipeQueue.length}</span>
      </div>
      <div className="flex-1 p-6">
        <div
          key={currentWord.id}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          style={cardStyle}
          className={`w-full bg-white rounded-3xl p-8 border ${swipeDirection === 'left' ? '-translate-x-[150%] opacity-0' : ''} ${swipeDirection === 'right' ? 'translate-x-[150%] opacity-0' : ''}`}
        >
          <h2 className="text-3xl font-bold">{currentWord.word}</h2>
          <Post.Paragraph typography="t5">{currentWord.meaning}</Post.Paragraph>
          <Border className="my-3" />
          <Post.Paragraph typography="t6">{currentWord.detailedMeaning}</Post.Paragraph>
        </div>
      </div>
    </div>
  );
};

export default SwipeScreen;
