import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ExternalLink, BookOpen, Newspaper, Link2, X } from 'lucide-react';
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
import { lessonChecks, termPattern } from '../lib/quiz';


const SOURCE_NAMES: Record<string, string> = { bok800: '한국은행 경제금융용어 800선', tesat: 'TESAT', sgsg: '한경 생글생글 경제 퀴즈' };
const BOK_SOURCE_URL = 'https://www.bok.or.kr/portal/bbs/B0000249/view.do?menuNo=200765&nttId=10096081';
const FIRST_LESSON_EXAMPLES: Record<number, { word: string; text: string }> = {
  94: { word: '규모의 경제', text: '학습용 가정: 공장 운영비가 100만 원, 제품 한 개의 재료비가 1,000원이라면 100개를 만들 때 개당 비용은 1만 1,000원이에요. 1,000개를 만들면 개당 2,000원으로 낮아져요.' },
  149: { word: '기회비용', text: '한 시간 동안 수학 또는 영어를 공부할 수 있다고 해볼게요. 수학을 선택했다면 그 시간에 할 수 있었던 영어 공부의 가치가 기회비용이에요.' },
  167: { word: '단리', text: '학습용 가정: 100만 원을 연 10% 단리로 맡기면 이자는 매년 원금의 10%인 10만 원이에요. 2년 뒤 원금과 이자를 합하면 120만 원이에요.' },
  205: { word: '매몰비용', text: '환불할 수 없는 영화표에 1만 원을 썼다면 그 돈은 이미 되돌릴 수 없어요. 영화를 볼지 결정할 때는 앞으로 얻을 즐거움과 시간을 생각해요.' },
};

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
          ? <mark key={i} style={{ background: 'var(--color-brand-cream)', color: 'var(--color-brand-ink)', fontWeight: 700, borderRadius: 3, padding: '0 2px' }}>{part}</mark>
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
  newsStatus,
  retryNews,
  keyword,
  termNames,
  meaningOf,
}: {
  word: Word;
  onDetail?: () => void;
  validRelated: string[];
  onRelatedClick: (name: string) => void;
  newsItems: NaverNewsItem[];
  newsStatus: 'loading' | 'empty' | 'error' | 'success';
  retryNews: () => void;
  keyword: string;
  termNames: string[];
  meaningOf: (name: string) => string | undefined;
}) => {
  // 뉴스 가로 스와이프 중 손을 떼면 그 자리 카드의 click이 같이 불린다. 8px 넘게 움직였으면 그 click은 버린다
  const newsDrag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  return (
  <div className="flex flex-col gap-3 px-5 pb-6">

    {/* 단어 + 뜻 */}
    <Card pad="lg" style={{ border: 0 }}>
      <h1 className="font-black text-[var(--color-ink)] tracking-[-0.03em] break-keep text-[22px] leading-[1.3]">
        {word.word}
      </h1>

      {/* 뜻 — 단어와 같은 카드 */}
      <div className="mt-4 rounded-xl bg-[var(--color-brand-soft)] px-4 py-4">
        <p className="mb-1! text-2xs font-bold text-brand-ink">간단히 말하면</p>
        <p className="text-sm text-[var(--color-ink-2)] font-medium break-keep leading-[1.7] tracking-[-0.01em]">{word.meaning}</p>
      </div>
      {(word.learningExample || FIRST_LESSON_EXAMPLES[word.id]?.word === word.word) && (
        <div className="mt-4 border-t border-[var(--color-line)] pt-4">
          <h2 className="text-sm font-bold text-[var(--color-ink)]">예시로 이해하기</h2>
          <p className="mt-2! text-sm leading-relaxed text-[var(--color-ink-2)] break-keep">{word.learningExample ?? FIRST_LESSON_EXAMPLES[word.id].text}</p>
        </div>
      )}
      {!onDetail && word.sources && word.sources.length > 0 && (
        <p className="mt-3 text-xs text-[var(--color-ink-2)]">참고 자료: {word.sources.map(s => SOURCE_NAMES[s] ?? s).join(' · ')}</p>
      )}
      {onDetail && (
        <button
          type="button"
          onClick={onDetail}
          className="mt-4! w-full py-3 rounded-button bg-[var(--color-button-secondary)] text-sm font-bold text-[var(--color-ink-2)] active:opacity-70 flex items-center justify-center gap-1"
        >
          <BookOpen size={15} />더 자세히 알아보기
        </button>
      )}
    </Card>

    {/* 순서: 단어+뜻 → 그래프·표 → 뉴스 → 관련 용어. 자세히 알아보기는 단어 카드의 버튼으로 여는 시트 */}
    {/* 그래프·표 — 뜻 바로 아래에서 그림으로 이해시킨다 */}
    {word.visuals && word.visuals.length > 0 && <WordVisuals visuals={word.visuals} terms={{ names: termNames, meaningOf, onClick: onRelatedClick }} />}

    {/* 뉴스 — 기사가 없거나 조회에 실패해도 학습은 계속할 수 있다 */}
    <div className="flex flex-col gap-3">
      <p className="m-0! flex items-center gap-1.5 px-1 text-xs font-bold leading-5 text-[var(--color-ink-4)] tracking-[0.02em]"><Newspaper size={13} />뉴스 속 {word.word}</p>
      {newsStatus === 'loading' ? (
        <div className="-mx-5 px-5 flex gap-3 overflow-hidden">
        {[1, 2, 3].map(i => (
          <Card key={i} pad="none" className="w-[85%] shrink-0 px-5 py-4 flex flex-col gap-1.5" style={{ border: 0, borderRadius: 12 }}>
            <div className="h-3.5 bg-[var(--color-surface)] rounded animate-pulse" style={{ width: '90%' }} />
            <div className="h-3.5 bg-[var(--color-surface)] rounded animate-pulse" style={{ width: '70%' }} />
            <div className="h-2.5 bg-[var(--color-surface)] rounded animate-pulse" style={{ width: '30%' }} />
          </Card>
        ))}
        </div>
      ) : newsStatus === 'empty' ? (
        <p className="rounded-card bg-[var(--color-card)] px-4 py-4 text-sm text-[var(--color-ink-2)]">연결된 뉴스가 아직 준비되지 않았어요.</p>
      ) : newsStatus === 'error' ? (
        <div className="rounded-card bg-[var(--color-card)] px-4 py-4">
          <p className="text-sm text-[var(--color-ink-2)]">뉴스를 불러오지 못했어요. 학습은 계속할 수 있어요.</p>
          <button type="button" onClick={retryNews} className="mt-3 min-h-11 rounded-button bg-[var(--color-button-secondary)] px-4 text-sm font-bold text-[var(--color-ink)]">다시 시도</button>
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
            style={{ borderRadius: 12, overflow: 'hidden' }}
          >
            <div className="relative w-full aspect-video overflow-hidden bg-[var(--color-surface)]">
              <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-brand-ink">
                <Newspaper size={28} strokeWidth={1.8} />
                <span className="max-w-[85%] truncate text-xs font-bold">뉴스 속 {word.word}</span>
              </div>
              {item.image && (
                <img
                  key={item.image}
                  src={item.image}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ borderTopLeftRadius: 'calc(var(--radius-card) - 1px)', borderTopRightRadius: 'calc(var(--radius-card) - 1px)' }}
                />
              )}
            </div>
            <div className="flex items-start gap-2 w-full px-5 py-4">
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[var(--color-ink)] break-keep leading-[1.55] tracking-[-0.01em] line-clamp-2">
                  <Highlight text={stripHtml(item.title)} keyword={keyword} />
                </p>
                {item.description && (
                  <p className="text-xs text-[var(--color-ink-2)] break-keep leading-[1.6] tracking-[-0.01em] line-clamp-2 mt-1!">
                    <span className="font-bold">기사 속 연결: </span>
                    <Highlight text={stripHtml(item.description)} keyword={keyword} />
                  </p>
                )}
                <p className="text-2xs text-[var(--color-ink-4)] mt-1!">
                  {new Date(item.pubDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} · {item.source || new URL(item.link).hostname.replace(/^www\./, '')}
                </p>
              </div>
              <ExternalLink size={14} className="text-[var(--color-ink-4)] shrink-0 mt-0.5" />
            </div>
          </button>
        ))}
        </div>
      )}
    </div>

    {/* 관련 용어 */}
    {validRelated.length > 0 && (
      <Card pad="none" className="px-5 py-4 flex flex-col gap-2.5" style={{ border: 0 }}>
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
    courseTitle?: string;
  } | null;

  // 콜드 딥링크(state 없음) 진입 시: 미완료 코스 우선으로 기본 단어 로드
  const isDeepLink = !state?.words?.length;
  // 딥링크 코스는 한 번 정하면 고정한다. knownIds를 따라가면 마지막 단어를 체크한 순간 코스가 바뀌어 index가 어긋난다.
  const [deepWords, setDeepWords] = React.useState<Word[] | null>(null);
  useEffect(() => {
    if (!isDeepLink || !hydrated || deepWords !== null) return;
    const course = courses.find(c => c.words.some(w => !knownIds.has(w.id))) ?? courses[0];
    const frame = requestAnimationFrame(() => setDeepWords(course?.words ?? []));
    return () => cancelAnimationFrame(frame);
  }, [isDeepLink, hydrated, deepWords, courses, knownIds]);
  const words = state?.words?.length ? state.words : deepWords ?? [];
  const backPath = state?.backPath ?? (isDeepLink ? '/home' : '/course');
  const backState = state?.backState;
  const autoAdvance = state?.autoAdvance ?? false;

  const [wordIndex, setWordIndex] = React.useState(state?.index ?? 0);

  // 자세히 알아보기 시트. 단어가 바뀌면 닫는다.
  const [detailWordId, setDetailWordId] = React.useState<number | null>(null);


  // 로딩이 끝났는데도 보여줄 단어가 없으면 돌아간다. 렌더 중 navigate는 안 된다.
  const noWords = words.length === 0 && (!isDeepLink || deepWords !== null);
  useEffect(() => { if (noWords) navigate(backPath, { replace: true }); }, [noWords, navigate, backPath]);

  // 단어 변경 시 스크롤 맨 위로
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [wordIndex]);

  // 뉴스 (현재 단어 로드 + 다음 단어 prefetch)
  const { newsItems, newsStatus, retryNews } = useNews(words, wordIndex);

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
    const checks = lessonChecks(words);
    const quizWords = knownWords
      .filter(kw => words.some(w => w.id === kw.id))
      .slice(0, Math.min(5, knownWords.length));
    return (
      <div className="lesson-screen flex h-full flex-col bg-[var(--color-canvas)]">
        {/* 카드 + 알림 카드 + 축하가 작은 화면에서 넘칠 수 있어 이 영역만 스크롤 */}
        <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col items-center justify-center-safe gap-5 p-8">
          <div className="w-20 h-20 bg-[var(--color-card)] rounded-full flex items-center justify-center text-4xl anim-pop-in">🎉</div>
          <div className="text-center anim-fade-up" style={{ '--i': 1 } as React.CSSProperties}>
            <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-1!">학습 완료!</h2>
            <p className="text-sm text-[var(--color-ink-4)]">{words.length}개 단어를 학습했어요</p>
          </div>
          <Card pad="md" className="w-full anim-fade-up" style={{ '--i': 2, border: 0 } as React.CSSProperties}>
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
                    navigate('/word-card', { state: { words: state!.continueWords, index: idx, backPath, autoAdvance: true, courseTitle: state?.courseTitle } });
                  }}
                  className="w-full py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90"
                >
                  다음 단어 계속 배우기 →
                </button>
              );
            }
            if (checks.length > 0) return (
              <button
                onClick={() => navigate('/lesson-check', { state: { words, backPath } })}
                className="w-full py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90"
              >
                이해 확인하기 →
              </button>
            );
            return (
              <button
                onClick={() => navigate('/quiz', { state: { quizQueue: quizWords, backPath, courseTitle: state?.courseTitle } })}
                className="w-full py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90"
              >
                바로 퀴즈 풀기 →
              </button>
            );
          })()}
          <button
            onClick={() => navigate(backPath, backState ? { state: backState } : undefined)}
            className="w-full py-3 rounded-button bg-[var(--color-button-secondary)] text-xs font-medium text-[var(--color-ink-2)] active:opacity-70"
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
      if (!lastWord) feedbackLearned();
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
      navigate('/word-card', { state: { words: targetCourse.words, index: targetIdx, backPath, autoAdvance, courseTitle: targetCourse.title } });
    } else {
      navigate('/word-card', { state: { words: [targetWord], index: 0, backPath, autoAdvance } });
    }
  };

  return (
    <>
    <div className="lesson-screen flex flex-col h-full bg-[var(--color-canvas)] overflow-hidden">

      {/* 상단: 레슨 안의 단어 위치 */}
      <div className="bg-[var(--color-card)] px-5 pt-3 pb-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(backPath, { replace: true, state: backState })} aria-label="학습 나가기"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-2)]"><X size={21} /></button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--color-ink)]">학습</p>
            {state?.courseTitle && <p className="mt-0.5! truncate text-2xs text-[var(--color-ink-3)]">{state.courseTitle}</p>}
          </div>
          <span className="shrink-0 text-xs font-bold tabular-nums text-[var(--color-ink-3)]">{wordIndex + 1}/{words.length}</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-button-secondary)]">
          <div className="h-full rounded-full bg-brand-500 transition-all duration-[var(--dur-base)] ease-soft" style={{ width: `${((wordIndex + 1) / words.length) * 100}%` }} />
        </div>
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
          onDetail={detail ? () => setDetailWordId(word.id) : undefined}
          validRelated={related}
          onRelatedClick={handleRelatedWordClick}
          newsItems={newsItems}
          newsStatus={newsStatus}
          retryNews={retryNews}
          keyword={word.word}
          termNames={termNames}
          meaningOf={meaningOf}
        />
        </div>
      </div>

      {/* 하단: 이전 · 다음 */}
      <div className="px-5 pb-8 pt-5">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => slide(-1)}
            disabled={!canPrev}
            className="flex-1 py-3.5 rounded-button bg-[var(--color-button-secondary)] text-sm font-bold text-[var(--color-ink-2)] active:opacity-80 disabled:opacity-30 flex items-center justify-center gap-1"
          >
            <ChevronLeft size={16} />이전
          </button>
          <button
            type="button"
            data-own-sfx={autoAdvance ? '' : undefined}
            onClick={() => slide(1)}
            disabled={lastWord && !autoAdvance}
            className="flex-1 py-3.5 rounded-button bg-brand-500 text-sm font-bold active:opacity-80 disabled:opacity-30 flex items-center justify-center gap-1"
          >
            {lastWord && autoAdvance ? '학습 결과 보기' : <>다음 용어 <ChevronRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>

    {/* 자세히 알아보기 바텀시트 */}
    <BottomSheet
      open={detailWordId === word.id}
      className="original-modal"
      onDimmerClick={() => setDetailWordId(null)}
      header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>{word.word} 자세히 알아보기</span>}
    >
      <div className="px-5 pb-8 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
        <section>
          <h2 className="mb-1! text-sm font-bold text-[var(--color-ink)]">어떤 뜻인가요?</h2>
          <p className="text-sm leading-[1.6] text-[var(--color-ink-2)] break-keep">{word.meaning}</p>
        </section>
        {detail && (
          <section>
            <h2 className="mb-1! text-sm font-bold text-[var(--color-ink)]">자세히 이해하기</h2>
            <div className="flex flex-col gap-3">
              {toParagraphs(detail).map((para, i) => (
                <p key={i} className="text-sm leading-[1.6] text-[var(--color-ink-2)] font-medium break-keep tracking-[-0.01em]">
                  <Highlight text={para} keyword={word.word} pattern={termPattern(word.word) ?? undefined} />
                </p>
              ))}
            </div>
          </section>
        )}
        {word.sources && word.sources.length > 0 && (
          <div className="border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-ink-2)]">
            <p className="font-bold">참고 자료</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {word.sources.map(source => source === 'bok800'
                ? <button key={source} type="button" onClick={() => openExternalUrl(BOK_SOURCE_URL)} className="min-h-11 rounded-button bg-[var(--color-button-secondary)] px-3 text-left font-semibold text-[var(--color-ink)]">{SOURCE_NAMES[source]} 원문 보기 <ExternalLink size={12} className="inline" /></button>
                : <span key={source} className="inline-flex min-h-11 items-center">{SOURCE_NAMES[source] ?? source}</span>)}
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
    </>
  );
};

export default WordCardScreen;
