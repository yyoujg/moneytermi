import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Word, Missions } from '../types';
import { useAppContext } from '../context/AppContext';

const ACCENT = '#f97316';

type NaverNewsItem = { title: string; link: string; description: string; pubDate: string };

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '');

const Highlight = ({ text, keyword }: { text: string; keyword: string }) => {
  if (!keyword) return <>{text}</>;
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase()
          ? <mark key={i} style={{ background: '#fff3e0', color: '#f97316', fontWeight: 700, borderRadius: 3, padding: '0 2px' }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
};

// ── 단어 카드 본문 ────────────────────────────────────────────────
const WordCard = ({
  word,
  isKnown,
  onToggleKnown,
  onRelatedClick,
  newsItems,
  newsLoading,
  keyword,
}: {
  word: Word;
  isKnown: boolean;
  onToggleKnown?: () => void;
  onRelatedClick: (name: string) => void;
  newsItems: NaverNewsItem[];
  newsLoading: boolean;
  keyword: string;
}) => (
  <div className="flex flex-col gap-3 px-5 pb-6">

    {/* 단어 헤더 */}
    <div className="bg-white rounded-2xl px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-[26px] font-black text-[#111111] leading-tight tracking-tight break-keep mb-2">
            {word.word}
          </h1>
          <p className="text-[14px] text-[#888888] font-medium break-keep leading-relaxed">{word.meaning}</p>
        </div>
        {onToggleKnown && (
          <button
            onClick={onToggleKnown}
            className={`shrink-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${isKnown ? 'bg-orange-500 text-white' : 'bg-[#F0F0F0] text-[#AAAAAA]'}`}
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>

    {/* 자세히 알아보기 */}
    <div className="bg-white rounded-2xl px-5 py-4">
      <p className="text-[11px] font-bold text-[#AAAAAA] mb-3">📖 자세히 알아보기</p>
      <p className="text-[14px] leading-relaxed text-[#555555] break-keep">{word.detailedMeaning}</p>
    </div>

    {/* 실시간 뉴스 */}
    <div className="bg-white rounded-2xl px-5 py-4">
      <p className="text-[11px] font-bold text-[#AAAAAA] mb-3">🗞 실시간 뉴스</p>
      {newsLoading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : newsItems.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {newsItems.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
              className="active:opacity-60"
            >
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#333333] break-keep leading-snug line-clamp-2">
                  <Highlight text={stripHtml(item.title)} keyword={keyword} />
                </p>
                <p style={{ marginTop: '4px' }} className="text-[11px] text-[#AAAAAA]">
                  {new Date(item.pubDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <ExternalLink size={13} className="text-[#CCCCCC] shrink-0 mt-0.5" />
            </a>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-[#AAAAAA]">관련 뉴스를 찾을 수 없어요</p>
      )}
    </div>

    {/* 관련 용어 */}
    {word.relatedWords && word.relatedWords.length > 0 && (
      <div className="bg-white rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#AAAAAA] mb-3">🔗 관련 용어</p>
        <div className="flex flex-col">
          {word.relatedWords.map((tag, i) => (
            <button
              key={tag}
              onClick={() => onRelatedClick(tag)}
              className="flex items-center gap-3 py-3 border-b border-[#F0F0F0] last:border-0 active:opacity-60 text-left"
            >
              <span className="text-[11px] font-black w-4 shrink-0 text-[#AAAAAA]">{i + 1}</span>
              <p className="text-[14px] font-semibold text-[#555555] break-keep flex-1">{tag}</p>
              <ChevronRight size={14} className="text-[#AAAAAA] shrink-0" />
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

// ── 메인 ─────────────────────────────────────────────────────────
const WordCardScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, allWords, knownWords, toggleKnown, setKnownWords, setMissions } = useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  const state = location.state as {
    words: Word[];
    index: number;
    backPath?: string;
    backState?: unknown;
    autoAdvance?: boolean;
  } | null;

  const words = state?.words ?? [];
  const backPath = state?.backPath ?? '/course';
  const backState = state?.backState;
  const autoAdvance = state?.autoAdvance ?? false;

  const [wordIndex, setWordIndex] = React.useState(state?.index ?? 0);

  // 단어 변경 시 스크롤 맨 위로
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [wordIndex]);

  // 뉴스 fetch
  const [newsItems, setNewsItems] = useState<NaverNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  useEffect(() => {
    if (!words.length) return;
    const currentWord = words[wordIndex];
    if (!currentWord) return;
    let cancelled = false;
    setNewsItems([]);
    setNewsLoading(true);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    fetch(`${supabaseUrl}/functions/v1/naver-news`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: currentWord.word }),
    })
      .then(res => res.json())
      .then(data => { if (!cancelled) setNewsItems(Array.isArray(data) ? data : []); })
      .catch((err) => { console.error('[뉴스 fetch 실패]', err); })
      .finally(() => { if (!cancelled) setNewsLoading(false); });
    return () => { cancelled = true; };
  }, [wordIndex, words]);

  // autoAdvance 완료 화면
  if (autoAdvance && words.length > 0 && wordIndex >= words.length) {
    const quizWords = [...words].sort(() => Math.random() - 0.5).slice(0, Math.min(5, words.length));
    return (
      <div className="flex h-full flex-col bg-[#F7F7F7]">
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl">🎉</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#111111] mb-1">학습 완료!</h2>
            <p className="text-sm text-[#AAAAAA]">{words.length}개 단어를 학습했어요</p>
          </div>
          <div className="w-full bg-white rounded-2xl p-4">
            <p className="text-xs text-[#AAAAAA] mb-3">방금 배운 단어, 바로 확인해볼까요?</p>
            <div className="flex flex-wrap gap-1.5">
              {words.slice(0, 5).map(w => (
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
          <button
            onClick={() => navigate(backPath, backState ? { state: backState } : undefined)}
            className="w-full py-3 rounded-2xl bg-white text-xs font-medium text-[#888888] active:opacity-70"
          >
            코스로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!words.length) {
    navigate(backPath, { replace: true });
    return null;
  }

  const word = words[wordIndex];
  const isKnown = knownWords.some(w => w.id === word.id);

  const goNext = () => {
    if (autoAdvance) {
      setKnownWords(prev => prev.some(w => w.id === word.id) ? prev : [...prev, word]);
      if (wordIndex === words.length - 1) {
        setMissions((prev: Missions) => ({ ...prev, m2: { ...prev.m2, current: 1 } }));
      }
      setWordIndex(i => i + 1);
    } else if (wordIndex < words.length - 1) {
      setWordIndex(i => i + 1);
    }
  };

  const goPrev = () => {
    if (wordIndex > 0) setWordIndex(i => i - 1);
  };

  const handleRelatedWordClick = (rawName: string) => {
    const wordName = rawName.replace(/["""'']/g, '').trim();
    // 현재 코스 내에 있으면 바로 이동
    const idx = words.findIndex(w => w.word === wordName);
    if (idx >= 0) { setWordIndex(idx); return; }

    // 다른 코스에서 검색 (word id 기반으로 매칭)
    const targetWord = allWords.find(w => w.word === wordName);
    if (!targetWord) {
      toast.error('아직 등록되지 않은 용어예요');
      return;
    }

    const targetCourse = courses.find(c => c.words.some(w => w.id === targetWord.id));
    if (targetCourse) {
      const targetIdx = targetCourse.words.findIndex(w => w.id === targetWord.id);
      navigate('/word-card', { state: { words: targetCourse.words, index: targetIdx, backPath, autoAdvance } });
    } else {
      navigate('/word-card', { state: { words: [targetWord], index: 0, backPath, autoAdvance } });
    }
  };

  const firstLocked = words.findIndex(w => !knownWords.some(kw => kw.id === w.id));

  return (
    <div className="flex flex-col h-full bg-[#F7F7F7]">

      {/* 상단 바 */}
      <div className="pt-12 px-4 pb-3 bg-white flex items-center gap-3">
        <button
          onClick={() => navigate(backPath, backState ? { state: backState } : undefined)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0F0F0] shrink-0"
        >
          <ChevronLeft size={20} className="text-[#555555]" />
        </button>

        {/* 단어 dots */}
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden py-1">
          {words.map((w, i) => {
            const accessible = firstLocked === -1 || i <= firstLocked;
            const known = knownWords.some(kw => kw.id === w.id);
            return (
              <button
                key={w.id}
                disabled={!accessible}
                onClick={() => accessible && setWordIndex(i)}
                className={`shrink-0 rounded-full transition-all
                  ${i === wordIndex
                    ? 'w-5 h-2 bg-orange-500'
                    : known
                      ? 'w-2 h-2 bg-orange-300'
                      : accessible
                        ? 'w-2 h-2 bg-[#D0D0D0]'
                        : 'w-2 h-2 bg-[#E5E5E5]'
                  }`}
              />
            );
          })}
        </div>

        <span className="text-xs font-bold text-[#AAAAAA] shrink-0">{wordIndex + 1}/{words.length}</span>
      </div>

      {/* 스크롤 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pt-4">
        <WordCard
          word={word}
          isKnown={isKnown}
          onToggleKnown={autoAdvance ? undefined : () => {
            toggleKnown(word);
            if (!isKnown) {
              toast.success('알고 있어요!');
              if (wordIndex < words.length - 1) setWordIndex(i => i + 1);
            }
          }}
          onRelatedClick={handleRelatedWordClick}
          newsItems={newsItems}
          newsLoading={newsLoading}
          keyword={word.word}
        />
      </div>

      {/* 하단 네비게이션 */}
      <div className="px-5 pb-8 pt-3 bg-white flex gap-3">
        <button
          onClick={goPrev}
          disabled={wordIndex === 0}
          className="flex-1 py-3.5 rounded-2xl bg-[#F0F0F0] text-sm font-bold text-[#555555] disabled:opacity-30 active:opacity-70 flex items-center justify-center gap-1"
        >
          <ChevronLeft size={16} /> 이전
        </button>
        <button
          onClick={goNext}
          disabled={!autoAdvance && wordIndex === words.length - 1}
          className="flex-[2] py-3.5 rounded-2xl text-sm font-bold text-white active:opacity-80 flex items-center justify-center gap-1 disabled:opacity-30"
          style={{ backgroundColor: ACCENT }}
        >
          {autoAdvance
            ? wordIndex === words.length - 1 ? '완료 🎉' : '다음 단어'
            : '다음'
          }
          {!autoAdvance || wordIndex < words.length - 1 ? <ChevronRight size={16} /> : null}
        </button>
      </div>
    </div>
  );
};

export default WordCardScreen;
