import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { requestAppReview } from '../lib/review';
import { useNews, type NaverNewsItem } from '../hooks/useNews';
import { DailyAlarmPromptCard } from '../components/DailyAlarmPromptCard';
import { Card } from '../components/ui/Card';

const ACCENT = 'var(--color-brand-500)';

const stripHtml = (s: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = s.replace(/<[^>]*>/g, '');
  return tmp.textContent ?? '';
};

const Highlight = ({ text, keyword }: { text: string; keyword: string }) => {
  if (!keyword) return <>{text}</>;
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase()
          ? <mark key={i} style={{ background: 'var(--color-brand-cream)', color: 'var(--color-brand-500)', fontWeight: 700, borderRadius: 3, padding: '0 2px' }}>{part}</mark>
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
  allWords,
}: {
  word: Word;
  isKnown: boolean;
  onToggleKnown?: () => void;
  onRelatedClick: (name: string) => void;
  newsItems: NaverNewsItem[];
  newsLoading: boolean;
  keyword: string;
  allWords: Word[];
}) => {
  const validRelated = (word.relatedWords ?? []).filter(
    rw => allWords.some(w => w.word === rw)
  );
  return (
  <div className="flex flex-col gap-3 px-5 pb-6">

    {/* 단어 헤더 */}
    <Card pad="lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-[28px] font-black text-[var(--color-ink)] leading-[1.2] tracking-[-0.03em] break-keep mb-2">
            {word.word}
          </h1>
          <p className="text-sm text-[var(--color-ink-2)] font-medium break-keep leading-[1.7] tracking-[-0.01em]">{word.meaning}</p>
        </div>
        {onToggleKnown && (
          <button
            onClick={onToggleKnown}
            className={`shrink-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${isKnown ? 'bg-brand-500 text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-4)]'}`}
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </Card>

    {/* 자세히 알아보기 */}
    <Card pad="none" className="px-5 pt-4 pb-5 flex flex-col gap-2.5">
      <p className="text-xs font-bold text-[var(--color-ink-4)] tracking-[0.02em]">📖 자세히 알아보기</p>
      <p className="text-sm leading-[1.8] text-[var(--color-ink-2)] font-medium break-keep tracking-[-0.01em]">{word.detailedMeaning}</p>
    </Card>

    {/* 실시간 뉴스 */}
    <Card pad="none" className="px-5 pt-4 pb-5 flex flex-col gap-2.5">
      <p className="text-xs font-bold text-[var(--color-ink-4)] tracking-[0.02em]">🗞 실시간 뉴스</p>
      {newsLoading ? (
        <div className="flex flex-col gap-3.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3.5 bg-[var(--color-surface)] rounded animate-pulse" style={{ width: '90%' }} />
              <div className="h-3.5 bg-[var(--color-surface)] rounded animate-pulse" style={{ width: '70%' }} />
              <div className="h-2.5 bg-[var(--color-surface)] rounded animate-pulse" style={{ width: '30%' }} />
            </div>
          ))}
        </div>
      ) : newsItems.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {newsItems.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 active:opacity-60"
            >
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[var(--color-ink)] break-keep leading-[1.55] tracking-[-0.01em] line-clamp-2">
                  <Highlight text={stripHtml(item.title)} keyword={keyword} />
                </p>
                {item.description && (
                  <p className="text-xs text-[var(--color-ink-3)] break-keep leading-[1.6] tracking-[-0.01em] line-clamp-2 mt-1">
                    <Highlight text={stripHtml(item.description)} keyword={keyword} />
                  </p>
                )}
                <p className="text-2xs text-[var(--color-ink-4)] mt-1">
                  {new Date(item.pubDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <ExternalLink size={13} className="text-[var(--color-line)] shrink-0 mt-0.5" />
            </a>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-[var(--color-ink-4)]">관련 뉴스를 찾을 수 없어요</p>
      )}
    </Card>

    {/* 관련 용어 */}
    {validRelated.length > 0 && (
      <Card pad="none" className="px-5 py-4 flex flex-col gap-2.5">
        <p className="text-xs font-bold text-[var(--color-ink-4)] tracking-[0.02em]">🔗 관련 용어</p>
        <div className="flex flex-col">
          {validRelated.map((tag, i) => (
            <button
              key={tag}
              onClick={() => onRelatedClick(tag)}
              className="flex items-center gap-3 py-3 border-b border-[var(--color-surface)] last:border-0 active:opacity-60 text-left"
            >
              <span className="text-2xs font-black w-4 shrink-0 text-[var(--color-ink-4)]">{i + 1}</span>
              <p className="text-sm font-semibold text-[var(--color-ink)] break-keep flex-1 tracking-[-0.01em]">{tag}</p>
              <ChevronRight size={14} className="text-[var(--color-ink-4)] shrink-0" />
            </button>
          ))}
        </div>
      </Card>
    )}
  </div>
  );
};

// ── 메인 ─────────────────────────────────────────────────────────
const WordCardScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, allWords, knownWords, knownIds, toggleKnown, setKnownWords } = useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  const state = location.state as {
    words: Word[];
    index: number;
    backPath?: string;
    backState?: unknown;
    autoAdvance?: boolean;
    continueWords?: Word[];
  } | null;

  // 콜드 딥링크(state 없음) 진입 시: 미완료 코스 우선으로 기본 단어 로드
  const isDeepLink = !state?.words?.length;
  const words = React.useMemo<Word[]>(() => {
    if (state?.words?.length) return state.words;
    const course = courses.find(c => c.words.some(w => !knownIds.has(w.id))) ?? courses[0];
    return course?.words ?? [];
  }, [state, courses, knownIds]);
  const backPath = state?.backPath ?? (isDeepLink ? '/home' : '/course');
  const backState = state?.backState;
  const autoAdvance = state?.autoAdvance ?? false;

  const [wordIndex, setWordIndex] = React.useState(state?.index ?? 0);

  // 단어 변경 시 스크롤 맨 위로
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [wordIndex]);

  // 뉴스 (현재 단어 로드 + 다음 단어 prefetch)
  const { newsItems, newsLoading } = useNews(words, wordIndex);

  // autoAdvance 완료 토스트
  useEffect(() => {
    if (autoAdvance && words.length > 0 && wordIndex >= words.length) {
      toast.success('학습 완료!');
    }
  }, [wordIndex, words.length, autoAdvance]);

  // autoAdvance 완료 화면
  if (autoAdvance && words.length > 0 && wordIndex >= words.length) {
    const quizWords = knownWords
      .filter(kw => words.some(w => w.id === kw.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(5, knownWords.length));
    return (
      <div className="flex h-full flex-col bg-[var(--color-canvas)]">
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
          <div className="w-20 h-20 bg-[var(--color-card)] rounded-full flex items-center justify-center text-4xl">🎉</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-1">학습 완료!</h2>
            <p className="text-sm text-[var(--color-ink-4)]">{words.length}개 단어를 학습했어요</p>
          </div>
          <Card pad="md" className="w-full">
            <p className="text-xs text-[var(--color-ink-4)] mb-3">방금 배운 단어, 바로 확인해볼까요?</p>
            <div className="flex flex-wrap gap-1.5">
              {words.slice(0, 5).map(w => (
                <span key={w.id} className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface)] text-[var(--color-ink-2)]">{w.word}</span>
              ))}
            </div>
          </Card>
          <DailyAlarmPromptCard />
        </div>
        <div className="px-5 pb-12 flex flex-col gap-2.5">
          {(() => {
            const remaining = state?.continueWords?.filter(w => !knownIds.has(w.id)) ?? [];
            if (remaining.length > 0) {
              return (
                <button
                  onClick={() => {
                    logClick('continue_after_first');
                    const idx = state!.continueWords!.findIndex(w => !knownIds.has(w.id));
                    navigate('/word-card', { state: { words: state!.continueWords, index: idx, backPath, autoAdvance: true } });
                  }}
                  className="w-full py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90"
                >
                  다음 단어 계속 배우기 →
                </button>
              );
            }
            return (
              <button
                onClick={() => navigate('/quiz', { state: { quizQueue: quizWords } })}
                className="w-full py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90"
              >
                바로 퀴즈 풀기 →
              </button>
            );
          })()}
          <button
            onClick={() => navigate(backPath, backState ? { state: backState } : undefined)}
            className="w-full py-3 rounded-button bg-[var(--color-card)] text-xs font-medium text-[var(--color-ink-3)] active:opacity-70"
          >
            코스로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!words.length) {
    // 딥링크 진입 직후 콘텐츠 로딩 대기 — 로딩 끝났는데도 비면 폴백
    if (isDeepLink && courses.length === 0) return null;
    navigate(backPath, { replace: true });
    return null;
  }

  const word = words[wordIndex];
  const isKnown = knownWords.some(w => w.id === word.id);

  const goNext = () => {
    if (autoAdvance) {
      if (knownWords.length === 0) { logClick('activation_first_card'); requestAppReview(); }
      setKnownWords(prev => prev.some(w => w.id === word.id) ? prev : [...prev, word]);
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
    <div className="flex flex-col h-full bg-[var(--color-canvas)]">

      {/* 상단 바 */}
      <div className="pt-4 px-4 pb-2 bg-[var(--color-card)] flex items-center gap-3">
        <button
          onClick={() => navigate(backPath, backState ? { state: backState } : undefined)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-surface)] shrink-0"
        >
          <ChevronLeft size={20} className="text-[var(--color-ink-2)]" />
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
                    ? 'w-5 h-2 bg-brand-500'
                    : known
                      ? 'w-2 h-2 bg-brand-300'
                      : accessible
                        ? 'w-2 h-2 bg-[var(--color-line)]'
                        : 'w-2 h-2 bg-[var(--color-line)]'
                  }`}
              />
            );
          })}
        </div>

        <span className="text-xs font-bold text-[var(--color-ink-4)] shrink-0">{wordIndex + 1}/{words.length}</span>
      </div>

      {/* 스크롤 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pt-2">
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
          allWords={allWords}
        />
      </div>

      {/* 하단 네비게이션 */}
      <div className="px-5 pb-8 pt-3 bg-[var(--color-card)] flex gap-3">
        <button
          onClick={goPrev}
          disabled={wordIndex === 0}
          className="flex-1 py-3.5 rounded-button bg-[var(--color-surface)] text-sm font-bold text-[var(--color-ink-2)] disabled:opacity-30 active:opacity-70 flex items-center justify-center gap-1"
        >
          <ChevronLeft size={16} /> 이전
        </button>
        <button
          onClick={goNext}
          disabled={!autoAdvance && wordIndex === words.length - 1}
          className="flex-[2] py-3.5 rounded-button text-sm font-bold text-white active:opacity-80 flex items-center justify-center gap-1 disabled:opacity-30"
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
