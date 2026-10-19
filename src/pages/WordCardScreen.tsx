import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ExternalLink, Newspaper, Link2 } from '../components/ui/OtterIcons';
import { ChevronLeft, ChevronRight } from '../components/ui/ControlIcons';
import { BottomSheet } from '@toss/tds-mobile';
import { showModal } from '../components/AlertModal';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { openExternalUrl } from '../lib/external';
import { claimPromotion } from '../lib/promotion';
import { useNews, type NaverNewsItem } from '../hooks/useNews';
import { DailyAlarmPromptCard } from '../components/DailyAlarmPromptCard';
import { feedbackLearned, feedbackLessonComplete } from '../lib/feedback';
import { StreakCelebration } from '../components/StreakCelebration';
import { Card } from '../components/ui/Card';
import { ActionButton } from '../components/ui/ActionButton';
import { WordMeaningCard } from '../components/learning/WordMeaningCard';
import { additionalMeaning } from '../lib/learningText';
import { WordVisuals, type Terms } from '../components/WordVisuals';
import { lessonChecks, termPattern } from '../lib/quiz';
import { selectLessonQuizWords } from '../lib/lessonQuiz';
import { buildWordLookup, relatedWordNames, type WordLookup } from '../lib/wordLookup';


const SOURCE_NAMES: Record<string, string> = { bok800: '한국은행 경제금융용어 800선', tesat: 'TESAT', sgsg: '한경 생글생글 경제 퀴즈' };
const EMPTY_WORDS: Word[] = [];

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
          ? <mark key={i} style={{ background: 'var(--color-brand-cream)', color: 'var(--color-ink-2)', fontWeight: 700, borderRadius: 3, padding: '0 2px' }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
};

// ── 단어 카드 본문 ────────────────────────────────────────────────
// 한 페이지에 단어+뜻 → 그래프·표 → 뉴스 → 관련 용어를 보여주고, 자세히 알아보기는 시트로 연다

// 자세히 알아보기 본문(요약과 겹치는 첫 문장 제외)과 유효한 관련 용어
const wordExtras = (word: Word, lookup: WordLookup) => {
  const detail = additionalMeaning(word.meaning, word.detailedMeaning);
  const related = relatedWordNames(word, lookup);
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
  visualTerms,
  detailContent,
}: {
  word: Word;
  onDetail?: () => void;
  validRelated: string[];
  onRelatedClick: (name: string) => void;
  newsItems: NaverNewsItem[];
  newsLoading: boolean;
  keyword: string;
  visualTerms: Terms;
  detailContent?: React.ReactNode;
}) => {
  return (
  <div className="flex flex-col gap-3 px-5 pb-6">

    <WordMeaningCard word={word} sources={(word.sources ?? []).map(source => SOURCE_NAMES[source] ?? source)} onDetail={onDetail} />

    {detailContent}

    {/* 순서: 단어+뜻 → 그래프·표 → 뉴스 → 관련 용어. 자세히 알아보기는 단어 카드의 버튼으로 여는 시트 */}
    {/* 그래프·표 — 뜻 바로 아래에서 그림으로 이해시킨다 */}
    {word.visuals && word.visuals.length > 0 && <WordVisuals visuals={word.visuals} terms={visualTerms} />}

    {/* 뉴스 — 사진보다 '이 용어가 기사에서 어떻게 쓰였는지'가 보이게 작은 썸네일 목록. 불러온 뒤 기사가 없으면 섹션째 숨긴다 */}
    {(newsLoading || newsItems.length > 0) && (
    <Card pad="none" className="px-5 py-4 flex flex-col">
      <p className="flex items-center gap-1.5 pb-1 text-xs font-bold text-[var(--color-ink-3)] tracking-[0.02em]"><Newspaper size={13} />실제 뉴스에서는 이렇게 나와요</p>
      {newsLoading ? (
        [1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 py-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3.5 bg-[var(--color-surface)] rounded animate-pulse" style={{ width: '90%' }} />
              <div className="h-3.5 bg-[var(--color-surface)] rounded animate-pulse" style={{ width: '60%' }} />
            </div>
            <div className="h-[72px] w-[72px] shrink-0 rounded-chip bg-[var(--color-surface)] animate-pulse" />
          </div>
        ))
      ) : newsItems.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => { logClick('news_link_click', { word: word.word }); openExternalUrl(item.link); }}
          className="flex items-start gap-3 py-3 border-b border-[var(--color-line)] last:border-0 active:opacity-60 text-left"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-[var(--color-ink)] break-keep leading-[1.5] tracking-[-0.01em] line-clamp-2">
              <Highlight text={stripHtml(item.title)} keyword={keyword} />
            </p>
            {item.description && (
              <p className="text-[13px] text-[var(--color-ink-3)] break-keep leading-[1.6] line-clamp-2 mt-1!">
                <Highlight text={stripHtml(item.description)} keyword={keyword} />
              </p>
            )}
            <p className="text-xs text-[var(--color-ink-3)] mt-1!">
              {new Date(item.pubDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} · 네이버 뉴스
            </p>
          </div>
          {item.image ? (
            // 불러오지 못하면 썸네일 자리만 숨긴다
            <img
              src={item.image}
              alt=""
              referrerPolicy="no-referrer"
              onError={e => { e.currentTarget.style.display = 'none'; }}
              className="h-[72px] w-[72px] shrink-0 rounded-chip object-cover bg-[var(--color-surface)]"
            />
          ) : <ExternalLink size={14} className="text-[var(--color-ink-3)] shrink-0 mt-1" />}
        </button>
      ))}
    </Card>
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

// 학습 화면은 유지하고 용어만 읽는다. 경로·진도·보상은 변경하지 않는다.
const RelatedWordPreviewContent = ({ word, lookup, onRelatedClick }: {
  word: Word;
  lookup: WordLookup;
  onRelatedClick: (name: string) => void;
}) => {
  const previewWords = React.useMemo(() => [word], [word]);
  const { newsItems, newsStatus } = useNews(previewWords, 0);
  const { detail, related } = wordExtras(word, lookup);
  const visualTerms = React.useMemo(() => ({
    names: [...lookup.byName.keys()].filter(name => name !== word.word),
    meaningOf: (name: string) => lookup.byName.get(name)?.meaning,
    exampleOf: (name: string) => lookup.byName.get(name)?.learningExample?.replace(/^학습용 가정:\s*/, ''),
    onClick: onRelatedClick,
  }), [lookup, onRelatedClick, word.word]);
  return <WordCard
    word={word}
    validRelated={related}
    onRelatedClick={onRelatedClick}
    newsItems={newsItems}
    newsLoading={newsStatus === 'loading'}
    keyword={word.word}
    visualTerms={visualTerms}
    detailContent={detail ? <details className="rounded-card bg-[var(--color-card)] p-5">
      <summary className="cursor-pointer font-semibold text-[var(--color-ink)]">자세히 보기</summary>
      <div className="mt-3 flex flex-col gap-4">
        {toParagraphs(detail).map((para, i) => <p key={i} className="text-base leading-[1.75] break-keep text-[var(--color-ink-2)]">
          <Highlight text={para} keyword={word.word} pattern={termPattern(word.word) ?? undefined} />
        </p>)}
      </div>
    </details> : undefined}
  />;
};

const RelatedWordPreview = ({ initialWord, lookup, onClose }: {
  initialWord: Word;
  lookup: WordLookup;
  onClose: () => void;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previousStackRef = useRef<Word[] | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const [stack, setStack] = React.useState([initialWord]);
  const word = stack[stack.length - 1];
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    dialog?.querySelector<HTMLElement>('button')?.focus();
    return () => {
      dialog?.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);
  useEffect(() => {
    if (dialogRef.current) dialogRef.current.scrollTop = 0;
    if (previousStackRef.current && previousStackRef.current !== stack) titleRef.current?.focus();
    previousStackRef.current = stack;
  }, [stack]);
  const openRelated = React.useCallback((name: string) => {
    const target = lookup.byName.get(name);
    if (target) setStack(previous => [...previous, target]);
  }, [lookup]);
  return <dialog
    role="dialog"
    data-related-word-preview
    ref={dialogRef}
    aria-labelledby={titleId}
    aria-describedby={descriptionId}
    aria-modal="true"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const items = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), summary, a[href], [tabindex="0"]')]
        .filter(element => element.getClientRects().length > 0);
      const first = items[0], last = items[items.length - 1];
      if (!first || !last) return;
      const active = event.currentTarget.ownerDocument.activeElement;
      if (event.shiftKey && (active === first || active === titleRef.current)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault(); first.focus();
      }
    }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    className="m-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-card border-0 bg-[var(--color-canvas)] p-0 text-[var(--color-ink)] backdrop:bg-black/40"
  >
    <div>
      <header className="sticky top-0 z-10 flex flex-col gap-2 bg-[var(--color-card)] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} ref={titleRef} tabIndex={-1} className="text-base font-bold">{word.word} 미리보기</h2>
          <button type="button" onClick={onClose} className="action-secondary rounded-button px-4 py-3 text-sm font-semibold">미리보기 닫기</button>
        </div>
        <p id={descriptionId} className="text-xs text-[var(--color-ink-3)]">읽기 전용이에요. 닫으면 학습하던 위치로 돌아가요.</p>
        {stack.length > 1 && <button type="button" onClick={() => setStack(previous => previous.slice(0, -1))} className="self-start py-2 text-sm font-semibold">이전 미리보기</button>}
      </header>
      <div key={stack.length + ':' + word.id} className="pt-4">
        <RelatedWordPreviewContent word={word} lookup={lookup} onRelatedClick={openRelated} />
      </div>
    </div>
  </dialog>;
};

// ── 메인 ─────────────────────────────────────────────────────────
const WordCardScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, allWords, knownWords, knownIds, hydrated, setKnownWords, claimPromotionReward } = useAppContext();
  const wordLookup = React.useMemo(() => buildWordLookup(allWords, courses), [allWords, courses]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const state = location.state as {
    words: Word[];
    index: number;
    backPath?: string;
    backState?: unknown;
    autoAdvance?: boolean;
    continueWords?: Word[];
    courseTitle?: string;
    courseId?: string;
    nodeId?: string;
  } | null;

  // 콜드 딥링크(state 없음) 진입 시: 미완료 코스 우선으로 기본 단어 로드
  const isDeepLink = !state?.words?.length;
  // 딥링크 코스는 한 번 정하면 고정한다. knownIds를 따라가면 마지막 단어를 체크한 순간 코스가 바뀌어 index가 어긋난다.
  const [deepWords, setDeepWords] = React.useState<Word[] | null>(null);
  useEffect(() => {
    if (state?.words?.length || deepWords || !hydrated) return;
    const course = courses.find(c => c.words.some(w => !knownIds.has(w.id))) ?? courses[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (course) setDeepWords(course.words);
  }, [state?.words?.length, deepWords, hydrated, courses, knownIds]);
  const words = state?.words?.length ? state.words : deepWords ?? EMPTY_WORDS;
  const backPath = state?.backPath ?? (isDeepLink ? '/home' : '/course');
  const backState = state?.backState;
  const autoAdvance = state?.autoAdvance ?? false;

  const [wordIndex, setWordIndex] = React.useState(state?.index ?? 0);
  const [previewWord, setPreviewWord] = React.useState<Word | null>(null);

  // 자세히 알아보기 시트. 단어가 바뀌면 닫는다.
  const [detailOpen, setDetailOpen] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setDetailOpen(false); }, [wordIndex]);


  // 로딩이 끝났는데도 보여줄 단어가 없으면 돌아간다. 렌더 중 navigate는 안 된다.
  const noWords = words.length === 0 && !(isDeepLink && (courses.length === 0 || !hydrated));
  useEffect(() => { if (noWords) navigate(backPath, { replace: true }); }, [backPath, navigate, noWords]);

  // 단어 변경 시 스크롤 맨 위로
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [wordIndex]);

  // 뉴스 (현재 단어 로드 + 다음 단어 prefetch)
  const { newsItems, newsStatus } = useNews(words, wordIndex);
  const newsLoading = newsStatus === 'loading';

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
    logClick('lesson_view_complete', { course_id: state?.courseId, node_id: state?.nodeId, total: words.length });
    feedbackLessonComplete();
  }, [wordIndex, words.length, autoAdvance, state?.courseId, state?.nodeId]);

  // 설명 글에서 강조할 다른 용어들(지금 단어는 빼고)
  const curName = words[wordIndex]?.word;
  const allTermNames = React.useMemo(() => allWords.map(w => w.word), [allWords]);
  const termNames = React.useMemo(() => allTermNames.filter(n => n !== curName), [allTermNames, curName]);
  const meaningOf = React.useCallback((name: string) => wordLookup.byName.get(name)?.meaning, [wordLookup]);
  const exampleOf = React.useCallback((name: string) => wordLookup.byName.get(name)?.learningExample?.replace(/^학습용 가정:\s*/, ''), [wordLookup]);
  const lessonQuizWords = React.useMemo(() => selectLessonQuizWords(words, knownIds), [knownIds, words]);
  const handleRelatedWordClick = React.useCallback((rawName: string) => {
    const wordName = rawName.replace(/["""'']/g, '').trim();
    const targetWord = words.find(word => word.word === wordName) ?? wordLookup.byName.get(wordName);
    if (!targetWord) {
      showModal('아직 등록되지 않은 용어예요', 'error');
      return;
    }
    setPreviewWord(targetWord);
  }, [words, wordLookup]);
  const visualTerms = React.useMemo(
    () => ({ names: termNames, meaningOf, exampleOf, onClick: handleRelatedWordClick }),
    [handleRelatedWordClick, meaningOf, exampleOf, termNames],
  );

  // autoAdvance 완료 화면
  if (autoAdvance && words.length > 0 && wordIndex >= words.length) {
    return (
      <div className="app-soft-screen flex h-full flex-col">
        {/* 카드 + 알림 카드 + 축하가 작은 화면에서 넘칠 수 있어 이 영역만 스크롤 */}
        <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col items-center justify-center-safe gap-5 p-8">
          <div className="w-20 h-20 bg-[var(--color-card)] rounded-full flex items-center justify-center text-4xl anim-pop-in">🎉</div>
          <div className="text-center anim-fade-up" style={{ '--i': 1 } as React.CSSProperties}>
            <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-1!">용어를 살펴봤어요</h2>
            <p className="text-sm text-[var(--color-ink-4)]">{words.length}개 용어의 설명을 확인했어요</p>
          </div>
          <Card pad="md" className="w-full anim-fade-up" style={{ '--i': 2 } as React.CSSProperties}>
            <p className="text-xs font-bold text-[var(--color-info)] mb-1.5!">이해했는지 확인해볼까요?</p>
            <p className="text-sm font-semibold text-[var(--color-ink)] leading-relaxed break-keep">{lessonChecks(words).length > 0 ? '상황 문제를 풀며 어떤 변화가 생기는지 확인해요.' : '이번에는 용어의 뜻을 확인해요. 상황 적용 문제는 아직 준비 중이에요.'}</p>
          </Card>
          <Card pad="md" className="w-full anim-fade-up" style={{ '--i': 3 } as React.CSSProperties}>
            <p className="text-xs text-[var(--color-ink-4)] mb-3!">방금 본 용어, 바로 확인해볼까요?</p>
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
                  다음 용어 계속 보기 →
                </button>
              );
            }
            return (
              <button
                onClick={() => lessonChecks(words).length > 0
                  ? navigate('/lesson-check', { state: { words, backPath, courseId: state?.courseId, nodeId: state?.nodeId } })
                  : navigate('/quiz', { state: { quizQueue: lessonQuizWords, backPath, reviewMode: true, mode: 'lesson_recall', courseId: state?.courseId, lessonId: state?.nodeId } })}
                className="w-full py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90"
              >
                {lessonChecks(words).length > 0 ? '상황 문제로 이해 확인하기' : '용어 퀴즈로 확인하기'}
              </button>
            );
          })()}
          <button
            onClick={() => navigate(backPath, backState ? { state: backState } : undefined)}
            className="action-secondary w-full py-3 rounded-button text-sm font-semibold active:opacity-70"
          >
            코스로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!words.length) return null;

  const word = words[wordIndex];
  const { detail, related } = wordExtras(word, wordLookup);
  const lastWord = wordIndex === words.length - 1;

  const goNext = () => {
    if (autoAdvance) {
      if (knownWords.length === 0) {
        logClick('activation_first_card');
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

  return (
    <>
    <div className="word-study-screen app-soft-screen flex flex-col h-full overflow-hidden">

      {/* 상단: 레슨 안의 단어 위치 */}
      <div className="px-5 pt-4 flex items-center justify-between gap-3">
        <div role="progressbar" aria-label="레슨 용어 진행률" aria-valuemin={0} aria-valuemax={words.length} aria-valuenow={wordIndex + 1} className="flex flex-1 items-center gap-1.5 overflow-hidden">
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
          transition: sliding ? `transform ${SLIDE_MS}ms cubic-bezier(0.25, 0.8, 0.25, 1)` : 'none',
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
            visualTerms={visualTerms}
          />
        </div>
      </div>

      {/* 하단: 이전 · 다음 */}
      <div className="study-action-footer px-5 pb-8 pt-3">
        <div className="flex gap-3">
          <ActionButton tone="soft" onClick={() => slide(-1)} disabled={!canPrev} className="flex-1">
            <ChevronLeft size={18} />이전
          </ActionButton>
          <ActionButton onClick={() => slide(1)} disabled={lastWord && !autoAdvance} className="flex-[2]">
            {lastWord && autoAdvance ? '살펴보기 완료' : <>다음 <ChevronRight size={18} /></>}
          </ActionButton>
        </div>
      </div>
    </div>

    {previewWord && <RelatedWordPreview initialWord={previewWord} lookup={wordLookup} onClose={() => setPreviewWord(null)} />}

    {/* 자세히 알아보기 바텀시트 */}
    <BottomSheet
      open={detailOpen}
      onDimmerClick={() => setDetailOpen(false)}
      header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>{word.word} 자세히 알아보기</span>}
    >
      <div className="px-5 pb-8 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
        {/* 첫 문단이 핵심이라 진하게, 나머지는 본문 */}
        {toParagraphs(detail).map((para, i) => (
          <p key={i} className={`text-base leading-[1.75] break-keep tracking-[-0.01em] ${i === 0 ? 'font-semibold text-[var(--color-ink)]' : 'text-[var(--color-ink-2)]'}`}>
            <Highlight text={para} keyword={word.word} pattern={termPattern(word.word) ?? undefined} />
          </p>
        ))}
        {word.sources && word.sources.length > 0 && (
          <p className="mt-2 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-ink-3)]">출처: {word.sources.map(s => SOURCE_NAMES[s] ?? s).join(' · ')}</p>
        )}
      </div>
    </BottomSheet>
    </>
  );
};

export default WordCardScreen;
