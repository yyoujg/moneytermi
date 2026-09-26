import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, ExternalLink, BookOpen, Newspaper, Link2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { termPattern } from '../lib/quiz';

const ACCENT = 'var(--color-brand-500)';

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
// 단어 하나를 4단계로 나눠 본다: 뜻 → 자세히 알아보기 → 뉴스 → 관련 용어 (내용이 없는 단계는 건너뛴다)
type WordStep = 'meaning' | 'detail' | 'news' | 'related';
const STEP_LABEL: Record<WordStep, string> = { meaning: '뜻', detail: '자세히', news: '뉴스', related: '관련 용어' };

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
  step,
  detail,
  validRelated,
  isKnown,
  onToggleKnown,
  onRelatedClick,
  newsItems,
  newsLoading,
  keyword,
}: {
  word: Word;
  step: WordStep;
  detail: string;
  validRelated: string[];
  isKnown: boolean;
  onToggleKnown?: () => void;
  onRelatedClick: (name: string) => void;
  newsItems: NaverNewsItem[];
  newsLoading: boolean;
  keyword: string;
}) => {
  return (
  <div className="flex flex-col gap-3 px-5 pb-6">

    {/* 단어 헤더 — 뜻 단계에서는 뜻까지, 나머지 단계에서는 제목만 작게 */}
    <Card pad={step === 'meaning' ? 'lg' : 'md'}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className={`font-black text-[var(--color-ink)] tracking-[-0.03em] break-keep ${step === 'meaning' ? 'text-[28px] leading-[1.2] mb-2!' : 'text-lg leading-tight'}`}>
            {word.word}
          </h1>
          {step === 'meaning' && (
            <p className="text-sm text-[var(--color-ink-2)] font-medium break-keep leading-[1.7] tracking-[-0.01em]">{word.meaning}</p>
          )}
        </div>
        {onToggleKnown && (
          <button
            onClick={onToggleKnown}
            aria-label={isKnown ? '알고 있어요 해제' : '알고 있어요'}
            aria-pressed={isKnown}
            style={{ borderRadius: 9999 }}
            className={`shrink-0 mt-1 w-8 h-8 flex items-center justify-center transition-colors
              ${isKnown ? 'bg-brand-500 text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-4)]'}`}
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </Card>

    {/* 자세히 알아보기 — 요약은 본문 첫 문장이라 그 부분은 빼고 이어지는 내용만 */}
    {step === 'detail' && detail && (
      <Card pad="none" className="px-5 pt-4 pb-5 flex flex-col gap-2.5">
        <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-4)] tracking-[0.02em]"><BookOpen size={13} />자세히 알아보기</p>
        <div className="flex flex-col gap-3">
          {toParagraphs(detail).map((para, i) => (
            <p key={i} className="text-sm leading-[1.8] text-[var(--color-ink-2)] font-medium break-keep tracking-[-0.01em]">
              <Highlight text={para} keyword={word.word} pattern={termPattern(word.word) ?? undefined} />
            </p>
          ))}
        </div>
      </Card>
    )}

    {/* 실시간 뉴스 */}
    {step === 'news' && (
    <Card pad="none" className="px-5 pt-4 pb-5 flex flex-col gap-2.5">
      <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-4)] tracking-[0.02em]"><Newspaper size={13} />실시간 뉴스 (출처: 네이버 뉴스)</p>
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
            <button
              key={i}
              type="button"
              onClick={() => { logClick('news_link_click', { word: word.word }); openExternalUrl(item.link); }}
              className="flex items-start gap-2 active:opacity-60 text-left w-full"
            >
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
                  {new Date(item.pubDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <ExternalLink size={13} className="text-[var(--color-line)] shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-[var(--color-ink-4)]">관련 뉴스를 찾을 수 없어요</p>
      )}
    </Card>
    )}

    {/* 관련 용어 */}
    {step === 'related' && validRelated.length > 0 && (
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
  const { courses, allWords, knownWords, knownIds, hydrated, toggleKnown, setKnownWords, claimPromotionReward, refreshPoints } = useAppContext();
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

  // 단어 안의 단계 (뜻 → 자세히 → 뉴스 → 관련 용어). 단어가 바뀌면 처음부터.
  const [stepIdx, setStepIdx] = React.useState(0);
  useEffect(() => { setStepIdx(0); }, [wordIndex]);

  // 로딩이 끝났는데도 보여줄 단어가 없으면 돌아간다. 렌더 중 navigate는 안 된다.
  const noWords = words.length === 0 && !(isDeepLink && (courses.length === 0 || !hydrated));
  useEffect(() => { if (noWords) navigate(backPath, { replace: true }); }, [noWords]);

  // 단어 변경 시 스크롤 맨 위로
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [wordIndex, stepIdx]);

  // 뉴스 (현재 단어 로드 + 다음 단어 prefetch)
  const { newsItems, newsLoading } = useNews(words, wordIndex);

  // autoAdvance 완료 토스트 + 잔고 갱신 (새 단어 XP의 50단위 보너스 포인트는 서버에서만 계산된다)
  // 같은 완료에 effect가 다시 돌아도(단어 목록 참조 변경, dev StrictMode) 토스트는 한 번만
  const completedRef = useRef(false);
  useEffect(() => {
    const done = autoAdvance && words.length > 0 && wordIndex >= words.length;
    if (!done) { completedRef.current = false; return; }
    if (completedRef.current) return;
    completedRef.current = true;
    feedbackLessonComplete();
    toast.success('학습 완료!');
    refreshPoints();
  }, [wordIndex, words.length, autoAdvance]);

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
  const isKnown = knownWords.some(w => w.id === word.id);
  const { detail, related } = wordExtras(word, allWords);
  const steps: WordStep[] = (['meaning', detail ? 'detail' : null, 'news', related.length ? 'related' : null] as (WordStep | null)[]).filter((x): x is WordStep => !!x);
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const lastStep = stepIdx >= steps.length - 1;

  const goNext = () => {
    if (stepIdx < steps.length - 1) { setStepIdx(i => i + 1); return; }
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
    if (stepIdx > 0) { setStepIdx(i => i - 1); return; }
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
        {/* 단어 dots */}
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden py-1">
          {words.map((w, i) => {
            const accessible = firstLocked === -1 || i <= firstLocked;
            const known = knownWords.some(kw => kw.id === w.id);
            return (
              <button
                key={w.id}
                disabled={!accessible}
                aria-label={`${i + 1}번째 단어 ${w.word}`}
                onClick={() => accessible && setWordIndex(i)}
                style={{ borderRadius: 9999 }}
                className={`shrink-0 transition-all
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

      {/* 단계 표시: 뜻 · 자세히 · 뉴스 · 관련 용어 */}
      <div className="px-4 pb-2.5 bg-[var(--color-card)] border-b border-[var(--color-line)] flex gap-1.5">
        {steps.map((st, i) => (
          <button
            key={st}
            type="button"
            onClick={() => setStepIdx(i)}
            aria-current={i === stepIdx ? 'step' : undefined}
            className={`flex-1 py-1.5 rounded-chip text-2xs font-bold transition-colors ${i === stepIdx ? 'bg-brand-500 text-white' : i < stepIdx ? 'bg-brand-500/15 text-brand-500' : 'bg-[var(--color-surface)] text-[var(--color-ink-4)]'}`}
          >
            {STEP_LABEL[st]}
          </button>
        ))}
      </div>

      {/* 스크롤 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pt-2">
        <div key={`${word.id}-${step}`} className="anim-slide-in">
        <WordCard
          word={word}
          step={step}
          detail={detail}
          validRelated={related}
          isKnown={isKnown}
          onToggleKnown={autoAdvance ? undefined : () => {
            toggleKnown(word);
            if (!isKnown) {
              feedbackLearned();
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
      </div>

      {/* 하단 네비게이션 */}
      <div className="px-5 pb-8 pt-3 bg-[var(--color-card)] flex gap-3">
        <button
          onClick={goPrev}
          disabled={wordIndex === 0 && stepIdx === 0}
          className="flex-1 py-3.5 rounded-button bg-[var(--color-surface)] text-sm font-bold text-[var(--color-ink-2)] disabled:opacity-30 active:opacity-70 flex items-center justify-center gap-1"
        >
          <ChevronLeft size={16} /> 이전
        </button>
        <button
          onClick={goNext}
          disabled={!autoAdvance && lastStep && wordIndex === words.length - 1}
          className="flex-[2] py-3.5 rounded-button text-sm font-bold text-white active:opacity-80 flex items-center justify-center gap-1 disabled:opacity-30"
          style={{ backgroundColor: ACCENT }}
        >
          {!lastStep
            ? STEP_LABEL[steps[stepIdx + 1]]
            : autoAdvance
              ? wordIndex === words.length - 1 ? '완료 🎉' : '다음 단어'
              : '다음 단어'
          }
          {!lastStep || !autoAdvance || wordIndex < words.length - 1 ? <ChevronRight size={16} /> : null}
        </button>
      </div>
    </div>
  );
};

export default WordCardScreen;
