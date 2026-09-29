import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ExternalLink, BookOpen, Newspaper, Link2 } from 'lucide-react';
import { BottomSheet } from '@toss/tds-mobile';
import { showModal } from '../components/AlertModal';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { openExternalUrl } from '../lib/external';
import { requestAppReview } from '../lib/review';
import { claimPromotion } from '../lib/promotion';
import { useNews, type NaverNewsItem } from '../hooks/useNews';
import { DailyAlarmPromptCard } from '../components/DailyAlarmPromptCard';
import { feedbackLearned, feedbackLessonComplete } from '../lib/feedback';
import { StreakCelebration } from '../components/StreakCelebration';
import { Card } from '../components/ui/Card';
import { WordVisuals } from '../components/WordVisuals';
import { termPattern } from '../lib/quiz';


const SOURCE_NAMES: Record<string, string> = { bok800: '한국은행 경제금융용어 800선', tesat: 'TESAT', sgsg: '한경 생글생글 경제 퀴즈' };

const stripHtml = (s: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = s.replace(/<[^>]*>/g, '');
  return tmp.textContent ?? '';
};

// 키워드(뉴스) 또는 정규식(자세히 본문의 용어)을 주황 형광으로. 캡처 그룹으로 나누면 홀수 인덱스가 매치다.
const Highlight = ({ text, keyword, pattern }: { text: string; keyword: string; pattern?: RegExp }) => {
  const source = pattern ? pattern.source : keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!source) return <>{text}</>;
  const parts = text.split(new RegExp(`(${source})`, pattern ? 'g' : 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <mark key={i} style={{ background: 'var(--color-brand-cream)', color: 'var(--color-brand-500)', fontWeight: 700, borderRadius: 3, padding: '0 2px' }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
};

// ── 단어 카드 본문 ────────────────────────────────────────────────
// 한 페이지에 단어+뜻 → 그래프·표 → 뉴스 → 관련 용어를 보여주고, 자세히 알아보기는 시트로 연다

// 자세히 알아보기 본문(요약과 겹치는 첫 문장 제외)과 유효한 관련 용어
const wordExtras = (word: Word, allWords: Word[]) => {
  // 연관검색어는 '주가지수' 같은 기본형으로 적혀 있고 단어는 '주가지수선물거래(…)'처럼 긴 경우가 있어 기본형으로도 맞춘다.
  const baseOf = (w: string) => w.split(/[(/;]/)[0].trim();
  const detail = word.detailedMeaning.startsWith(word.meaning)
    ? word.detailedMeaning.slice(word.meaning.length).trim()
    : word.detailedMeaning;
  const related = (word.relatedWords ?? [])
    .map(rw => allWords.find(w => w.word === rw)?.word ?? allWords.find(w => baseOf(w.word) === baseOf(rw))?.word)
    .filter((w, i, arr): w is string => !!w && w !== word.word && arr.indexOf(w) === i);
  return { detail, related };
};

// 본문이 500자 안팎의 한 덩어리라 문장 2개씩 문단으로 나눈다
const toParagraphs = (text: string) => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) out.push(sentences.slice(i, i + 2).join(' '));
  return out;
};

const WordCard = ({
  word,
  onDetail,
  validRelated,
  onRelatedClick,
  newsItems,
  newsLoading,
  keyword,
  termNames,
  meaningOf,
}: {
  word: Word;
  onDetail?: () => void;
  validRelated: string[];
  onRelatedClick: (name: string) => void;
  newsItems: NaverNewsItem[];
  newsLoading: boolean;
  keyword: string;
  termNames: string[];
  meaningOf: (name: string) => string | undefined;
}) => {
  // 뉴스 가로 스와이프 중 손을 떼면 그 자리 카드의 click이 같이 불린다. 8px 넘게 움직였으면 그 click은 버린다
  const newsDrag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  return (
  <div className="flex flex-col gap-3 px-5 pb-6">

    {/* 단어 + 뜻 */}
    <Card pad="lg">
      <h1 className="font-black text-[var(--color-ink)] tracking-[-0.03em] break-keep text-[22px] leading-[1.3]">
        {word.word}
      </h1>

      {/* 뜻 — 단어와 같은 카드 */}
      <div className="mt-3">
        <p className="text-sm text-[var(--color-ink-2)] font-normal break-keep leading-[1.7] tracking-[-0.01em]">{word.meaning}</p>
        {word.sources && word.sources.length > 0 && (
          <p className="mt-2 text-3xs text-[var(--color-ink-4)]">{word.sources.map(s => SOURCE_NAMES[s] ?? s).join(' · ')} 참고</p>
        )}
      </div>
      {onDetail && (
        <button
          type="button"
          onClick={onDetail}
          className="mt-4! w-full py-3 rounded-button bg-brand-500/10 text-sm font-bold text-brand-500 active:opacity-70 flex items-center justify-center gap-1"
        >
          <BookOpen size={15} />자세히 보기
        </button>
      )}
    </Card>

    {/* 순서: 단어+뜻 → 그래프·표 → 뉴스 → 관련 용어. 자세히 알아보기는 단어 카드의 버튼으로 여는 시트 */}
    {/* 그래프·표 — 뜻 바로 아래에서 그림으로 이해시킨다 */}
    {word.visuals && word.visuals.length > 0 && <WordVisuals visuals={word.visuals} terms={{ names: termNames, meaningOf, onClick: onRelatedClick }} />}

    {/* 뉴스 — 기사마다 카드 하나. 불러온 뒤 기사가 없으면 섹션째 숨긴다 */}
    {(newsLoading || newsItems.length > 0) && (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-1.5 px-1 pt-1 text-xs font-bold text-[var(--color-ink-4)] tracking-[0.02em]"><Newspaper size={13} />뉴스 속 {word.word}</p>
      {newsLoading ? (
        <div className="-mx-5 px-5 flex gap-3 overflow-hidden">
        {[1, 2, 3].map(i => (
          <Card key={i} pad="none" className="w-[85%] shrink-0 px-5 py-4 flex flex-col gap-1.5">
            <div className="h-3.5 bg-[var(--color-surface)] rounded animate-pulse" style={{ width: '90%' }} />
            <div className="h-3.5 bg-[var(--color-surface)] rounded animate-pulse" style={{ width: '70%' }} />
            <div className="h-2.5 bg-[var(--color-surface)] rounded animate-pulse" style={{ width: '30%' }} />
          </Card>
        ))}
        </div>
      ) : (
        // 가로로 넘기는 뉴스
        <div
          className="-mx-5 px-5 scroll-px-5 flex gap-3 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ touchAction: 'pan-x pan-y' }}
          onPointerDown={e => { newsDrag.current = { x: e.clientX, y: e.clientY, moved: false }; }}
          onPointerMove={e => { const d = newsDrag.current; if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) d.moved = true; }}
          onScroll={() => { if (newsDrag.current) newsDrag.current.moved = true; }}
          onClickCapture={e => { if (newsDrag.current?.moved) { e.preventDefault(); e.stopPropagation(); } newsDrag.current = null; }}
        >
        {newsItems.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { logClick('news_link_click', { word: word.word }); openExternalUrl(item.link); }}
            className="w-[85%] shrink-0 snap-start rounded-card bg-[var(--color-card)] overflow-hidden flex flex-col active:opacity-60 text-left"
          >
            {item.image && (
              // 카드 폭을 꽉 채운 대표 이미지. 불러오지 못하면 이 자리만 숨긴다
              <img
                src={item.image}
                alt=""
                referrerPolicy="no-referrer"
                onError={e => { e.currentTarget.style.display = 'none'; }}
                className="w-full aspect-video object-cover bg-[var(--color-surface)]"
              />
            )}
            <div className="flex items-start gap-2 w-full px-5 py-4">
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[var(--color-ink)] break-keep leading-[1.55] tracking-[-0.01em] line-clamp-2">
                  <Highlight text={stripHtml(item.title)} keyword={keyword} />
                </p>
                {item.description && (
                  <p className="text-xs text-[var(--color-ink-3)] break-keep leading-[1.6] tracking-[-0.01em] line-clamp-2 mt-1!">
                    <Highlight text={stripHtml(item.description)} keyword={keyword} />
                  </p>
                )}
                <p className="text-2xs text-[var(--color-ink-4)] mt-1!">
                  {new Date(item.pubDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} · 네이버 뉴스
                </p>
              </div>
              {!item.image && <ExternalLink size={13} className="text-[var(--color-line)] shrink-0 mt-0.5" />}
            </div>
          </button>
        ))}
        </div>
      )}
    </div>
    )}

    {/* 관련 용어 */}
    {validRelated.length > 0 && (
      <Card pad="none" className="px-5 py-4 flex flex-col gap-2.5">
        <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-4)] tracking-[0.02em]"><Link2 size={13} />관련 용어</p>
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
  const { courses, allWords, knownWords, knownIds, hydrated, setKnownWords, claimPromotionReward } = useAppContext();
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
  // 딥링크 코스는 한 번 정하면 고정한다. knownIds를 따라가면 마지막 단어를 체크한 순간 코스가 바뀌어 index가 어긋난다.
  const deepWordsRef = useRef<Word[] | null>(null);
  const words = React.useMemo<Word[]>(() => {
    if (state?.words?.length) return state.words;
    if (deepWordsRef.current) return deepWordsRef.current;
    if (!hydrated) return [];
    const course = courses.find(c => c.words.some(w => !knownIds.has(w.id))) ?? courses[0];
    if (course) deepWordsRef.current = course.words;
    return course?.words ?? [];
  }, [state, courses, knownIds, hydrated]);
  const backPath = state?.backPath ?? (isDeepLink ? '/home' : '/course');
  const backState = state?.backState;
  const autoAdvance = state?.autoAdvance ?? false;

  const [wordIndex, setWordIndex] = React.useState(state?.index ?? 0);

  // 자세히 알아보기 시트. 단어가 바뀌면 닫는다.
  const [detailOpen, setDetailOpen] = React.useState(false);
  useEffect(() => { setDetailOpen(false); }, [wordIndex]);


  // 로딩이 끝났는데도 보여줄 단어가 없으면 돌아간다. 렌더 중 navigate는 안 된다.
  const noWords = words.length === 0 && !(isDeepLink && (courses.length === 0 || !hydrated));
  useEffect(() => { if (noWords) navigate(backPath, { replace: true }); }, [noWords]);

  // 단어 변경 시 스크롤 맨 위로
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [wordIndex]);

  // 뉴스 (현재 단어 로드 + 다음 단어 prefetch)
  const { newsItems, newsLoading } = useNews(words, wordIndex);

  // autoAdvance 완료 토스트. 잔고·XP 갱신은 word_progress 저장(2초 디바운스)이 끝난 뒤 AppContext가 한다.
  // 같은 완료에 effect가 다시 돌아도(단어 목록 참조 변경, dev StrictMode) 토스트는 한 번만
  const completedRef = useRef(false);
  // 이전·다음 버튼으로 넘길 때 화면이 옆으로 밀려나고 새 단어가 반대편에서 들어온다(손가락 스와이프는 없음 - 뉴스 가로 스크롤과 겹쳐서)
  const [dragX, setDragX] = React.useState(0);
  const [sliding, setSliding] = React.useState(false);
  useEffect(() => {
    const done = autoAdvance && words.length > 0 && wordIndex >= words.length;
    if (!done) { completedRef.current = false; return; }
    if (completedRef.current) return;
    completedRef.current = true;
    feedbackLessonComplete();
  }, [wordIndex, words.length, autoAdvance]);

  // 설명 글에서 강조할 다른 용어들(지금 단어는 빼고)
  const curName = words[wordIndex]?.word;
  const termNames = React.useMemo(() => allWords.map(w => w.word).filter(n => n !== curName), [allWords, curName]);
  const meaningOf = React.useCallback((name: string) => allWords.find(w => w.word === name)?.meaning, [allWords]);

  // autoAdvance 완료 화면
  if (autoAdvance && words.length > 0 && wordIndex >= words.length) {
    const quizWords = knownWords
      .filter(kw => words.some(w => w.id === kw.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(5, knownWords.length));
    return (
      <div className="flex h-full flex-col bg-[var(--color-canvas)]">
        {/* 카드 + 알림 카드 + 축하가 작은 화면에서 넘칠 수 있어 이 영역만 스크롤 */}
        <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col items-center justify-center-safe gap-5 p-8">
          <div className="w-20 h-20 bg-[var(--color-card)] rounded-full flex items-center justify-center text-4xl anim-pop-in">🎉</div>
          <div className="text-center anim-fade-up" style={{ '--i': 1 } as React.CSSProperties}>
            <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-1!">학습 완료!</h2>
            <p className="text-sm text-[var(--color-ink-4)]">{words.length}개 단어를 학습했어요</p>
          </div>
          <Card pad="md" className="w-full anim-fade-up" style={{ '--i': 2 } as React.CSSProperties}>
            <p className="text-xs text-[var(--color-ink-4)] mb-3!">방금 배운 단어, 바로 확인해볼까요?</p>
            <div className="flex flex-wrap gap-1.5">
              {words.slice(0, 5).map(w => (
                <span key={w.id} className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface)] text-[var(--color-ink-2)]">{w.word}</span>
              ))}
            </div>
          </Card>
          <DailyAlarmPromptCard />
          <StreakCelebration />
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
                onClick={() => navigate('/quiz', { state: { quizQueue: quizWords, backPath } })}
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

  if (!words.length) return null;

  const word = words[wordIndex];
  const { detail, related } = wordExtras(word, allWords);
  const lastWord = wordIndex === words.length - 1;

  const goNext = () => {
    if (autoAdvance) {
      if (knownWords.length === 0) {
        logClick('activation_first_card');
        requestAppReview();
        claimPromotion().then(amount => { if (amount) claimPromotionReward(amount); });
      }
      setKnownWords(prev => prev.some(w => w.id === word.id) ? prev : [...prev, word]);
      feedbackLearned();
      setWordIndex(i => i + 1);
    } else if (wordIndex < words.length - 1) {
      setWordIndex(i => i + 1);
    }
  };

  const goPrev = () => {
    if (wordIndex > 0) setWordIndex(i => i - 1);
  };

  // 넘길 수 없는 쪽이면 제자리.
  const SLIDE_MS = 220;
  const canNext = autoAdvance || !lastWord;
  const canPrev = wordIndex > 0;
  const width = () => scrollRef.current?.offsetWidth ?? 375;
  const settle = (x: number, then?: () => void) => {
    setSliding(true);
    setDragX(x);
    setTimeout(() => { setSliding(false); then?.(); }, SLIDE_MS);
  };
  const slide = (dir: 1 | -1) => {
    if (sliding) return;
    if (dir === 1 ? !canNext : !canPrev) { settle(0); return; }
    const w = width();
    settle(-dir * w, () => {
      setDragX(dir * w);   // 새 단어는 반대편에서 들어온다
      if (dir === 1) goNext(); else goPrev();
      requestAnimationFrame(() => requestAnimationFrame(() => settle(0)));
    });
  };

  const handleRelatedWordClick = (rawName: string) => {
    const wordName = rawName.replace(/["""'']/g, '').trim();
    // 현재 코스 내에 있으면 바로 이동
    const idx = words.findIndex(w => w.word === wordName);
    if (idx >= 0) { setWordIndex(idx); return; }

    // 다른 코스에서 검색 (word id 기반으로 매칭)
    const targetWord = allWords.find(w => w.word === wordName);
    if (!targetWord) {
      showModal('아직 등록되지 않은 용어예요', 'error');
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

  return (
    <>
    <div className="flex flex-col h-full bg-[var(--color-canvas)] overflow-hidden">

      {/* 상단: 레슨 안의 단어 위치 */}
      <div className="px-5 pt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {words.map((w, i) => (
            <span
              key={w.id}
              style={{ borderRadius: 9999 }}
              className={`shrink-0 h-2 transition-all ${i === wordIndex ? 'w-5 bg-brand-500' : 'w-2 bg-[var(--color-line)]'}`}
            />
          ))}
        </div>
        <span className="shrink-0 text-xs font-bold text-[var(--color-ink-4)]">{wordIndex + 1}/{words.length}</span>
      </div>

      {/* 스크롤 영역 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pt-4"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: sliding ? `transform ${SLIDE_MS}ms var(--ease-soft)` : 'none',
        }}
      >
        <div key={word.id}>
        <WordCard
          word={word}
          onDetail={detail ? () => setDetailOpen(true) : undefined}
          validRelated={related}
          onRelatedClick={handleRelatedWordClick}
          newsItems={newsItems}
          newsLoading={newsLoading}
          keyword={word.word}
          termNames={termNames}
          meaningOf={meaningOf}
        />
        </div>
      </div>

      {/* 하단: 이전 · 다음 */}
      <div className="px-5 pb-8 pt-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => slide(-1)}
            disabled={!canPrev}
            className="flex-1 py-3.5 rounded-button bg-[var(--color-surface)] text-sm font-bold text-[var(--color-ink-2)] active:opacity-80 disabled:opacity-30 flex items-center justify-center gap-1"
          >
            <ChevronLeft size={16} />이전
          </button>
          <button
            type="button"
            onClick={() => slide(1)}
            disabled={lastWord && !autoAdvance}
            className="flex-1 py-3.5 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-80 disabled:opacity-30 flex items-center justify-center gap-1"
          >
            {lastWord && autoAdvance ? '완료 🎉' : <>다음 <ChevronRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>

    {/* 자세히 알아보기 바텀시트 */}
    <BottomSheet
      open={detailOpen}
      onDimmerClick={() => setDetailOpen(false)}
      header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>{word.word} 자세히 알아보기</span>}
    >
      <div className="px-5 pb-8 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
        {toParagraphs(detail).map((para, i) => (
          <p key={i} className="text-sm leading-[1.6] text-[var(--color-ink-2)] font-medium break-keep tracking-[-0.01em]">
            <Highlight text={para} keyword={word.word} pattern={termPattern(word.word) ?? undefined} />
          </p>
        ))}
      </div>
    </BottomSheet>
    </>
  );
};

export default WordCardScreen;
