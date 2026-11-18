import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ExternalLink } from '../components/ui/OtterIcons';
import { ChevronLeft, ChevronRight } from '../components/ui/ControlIcons';
import { showModal } from '../components/AlertModal';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import { topicOfWord } from '../lib/topicImages';
import { TopicThumb } from '../components/TopicThumb';
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
import { StudyText } from '../components/learning/StudyText';
import { WordQuickCheck } from '../components/learning/WordQuickCheck';
import { WordResourcesDialog, type WordResource } from '../components/learning/WordResourcesDialog';
import { additionalMeaning } from '../lib/learningText';
import { buildWordLessonCheck, wordLessonVisuals } from '../lib/wordLesson';
import { WordVisuals, type Terms } from '../components/WordVisuals';
import { lessonChecks, termPattern } from '../lib/quiz';
import { selectLessonQuizWords } from '../lib/lessonQuiz';
import { buildWordLookup, relatedWordNames, type WordLookup } from '../lib/wordLookup';
import './WordCardScreen.css';


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
          ? <mark key={i} className="study-keyword type-emphasis">{part}</mark>
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
  section,
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
  section?: 'definition' | 'example' | 'references';
}) => {
  // 기사 원문 사진은 언론사 저작물이라 쓰지 않고, 용어가 속한 주제의 Unsplash 사진을 둔다
  const { courses } = useAppContext();
  const newsTopic = topicOfWord(word.id, courses);
  const visuals = section === 'references' ? [] : (word.visuals ?? []).filter(visual => visual.type !== 'text');
  if (section === 'definition' || section === 'example') return (
    <div className="word-study-dialogue px-5">
      <img src="/otter/v5/otter-explain.svg" alt="" aria-hidden="true" width={144} height={144} className="quiz-question-otter w-auto shrink-0 self-end" data-otter="explain" />
      <WordMeaningCard word={word} section={section} onDetail={onDetail} className="quiz-bubble min-w-0 flex-1" />
    </div>
  );
  return (
  <div className={`flex flex-col gap-3${section === 'references' ? '' : ' px-5 pb-6'}`}>

    {!section && <WordMeaningCard word={word} sources={(word.sources ?? []).map(source => SOURCE_NAMES[source] ?? source)} onDetail={onDetail} />}

    {detailContent}

    {/* 비슷한 개념 목록에서만 현재 단어를 빼고, 두 개념을 비교하는 표는 제목과 내용을 유지한다. */}
    {visuals.length > 0 && <WordVisuals visuals={visuals.map(v => v.type !== 'table' || !v.title.endsWith('비슷한 개념') ? v : {
      ...v,
      title: [`${word.word}와 `, `${word.word}과 `].reduce((t, p) => t.startsWith(p) ? t.slice(p.length) : t, v.title),
      rows: v.rows.filter(row => row[0] !== word.word),
    })} terms={visualTerms} />}

    {/* 뉴스 — '이 용어가 기사에서 어떻게 쓰였는지'가 보이게 제목·요약 목록. 불러온 뒤 기사가 없으면 섹션째 숨긴다 */}
    {(newsLoading || newsItems.length > 0) && (
    <Card pad="md" className="flex flex-col">
      {section !== 'references' && <h3 className="type-section-title pb-1 break-keep">뉴스에선 이렇게 쓰여</h3>}
      {newsLoading ? (
        [1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 py-3">
            <div className="flex-1 flex flex-col gap-1">
              <div className="h-3.5 bg-[var(--color-surface)] rounded-chip animate-pulse" style={{ width: '90%' }} />
              <div className="h-3.5 bg-[var(--color-surface)] rounded-chip animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        ))
      ) : newsItems.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => { logClick('news_link_click', { word: word.word }); openExternalUrl(item.link); }}
          className="flex items-start gap-3 py-3 border-b border-[var(--color-line)] last:border-0 active:opacity-60 text-left"
        >
          {newsTopic && <TopicThumb category={newsTopic} />}
          <div className="min-w-0 flex-1">
            <p className="type-item-title break-keep line-clamp-2">
              <Highlight text={stripHtml(item.title)} keyword={keyword} />
            </p>
            {/* 기사 본문 발췌는 원문 그대로라 싣지 않고 헤드라인과 링크만 둔다 */}
            <p className="type-supporting mt-1!">
              {new Date(item.pubDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} · 네이버 뉴스
            </p>
          </div>
          <ExternalLink size={16} className="text-[var(--color-ink-3)] shrink-0 mt-1" />
        </button>
      ))}
    </Card>
    )}

    {/* 관련 용어 */}
    {validRelated.length > 0 && (
      <Card pad="md" className="word-related-terms flex flex-col gap-2">
        {section !== 'references' && <h3 className="type-section-title">관련 용어</h3>}
        <div className="flex flex-col">
          {validRelated.map(tag => (
            <button
              key={tag}
              onClick={() => onRelatedClick(tag)}
              className="flex items-center gap-3 py-3 border-b border-[var(--color-surface)] last:border-0 active:opacity-60 text-left"
            >
              <p className="type-item-title break-keep flex-1">{tag}</p>
              <ChevronRight size={16} className="text-[var(--color-ink-4)] shrink-0" />
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
      <summary className="type-item-title cursor-pointer">자세히 보기</summary>
      <div className="mt-3 flex flex-col gap-4">
        {toParagraphs(detail).map((para, i) => <p key={i} className="type-body break-keep">
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
    className="m-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-card border-0 bg-[var(--color-card)] p-0 text-[var(--color-ink)] backdrop:bg-black/40"
  >
    <div>
      <header className="sticky top-0 z-10 flex flex-col gap-2 bg-[var(--color-card)] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} ref={titleRef} tabIndex={-1} className="type-section-title">{word.word} 미리보기</h2>
          <button type="button" onClick={onClose} className="action-secondary rounded-button px-4 py-3 text-sm font-semibold">미리보기 닫기</button>
        </div>
        <p id={descriptionId} className="type-supporting">잠깐 구경하는 용어야. 닫으면 보던 곳으로 돌아가!</p>
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
  const [pageIndex, setPageIndex] = React.useState(0);
  const [completedWord, setCompletedWord] = React.useState<Word | null>(null);
  const [previewWord, setPreviewWord] = React.useState<Word | null>(null);
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
  const [answerRevealed, setAnswerRevealed] = React.useState(false);
  const [resourcesOpen, setResourcesOpen] = React.useState(false);


  // 로딩이 끝났는데도 보여줄 단어가 없으면 돌아간다. 렌더 중 navigate는 안 된다.
  const noWords = words.length === 0 && !(isDeepLink && (courses.length === 0 || !hydrated));
  useEffect(() => { if (noWords) navigate(backPath, { replace: true }); }, [backPath, navigate, noWords]);

  // 단어나 페이지가 바뀌면 새 내용의 처음부터 읽는다.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [wordIndex, pageIndex]);

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
      showModal('아직 등록되지 않은 용어야', 'error');
      return;
    }
    setPreviewWord(targetWord);
  }, [words, wordLookup]);
  const visualTerms = React.useMemo(
    () => ({ names: termNames, meaningOf, exampleOf, onClick: handleRelatedWordClick }),
    [handleRelatedWordClick, meaningOf, exampleOf, termNames],
  );
  const currentWord = words[wordIndex];
  const question = React.useMemo(() => currentWord
    ? buildWordLessonCheck(currentWord, knownWords, [...words, ...allWords])
    : null, [currentWord, knownWords, words, allWords]);

  // autoAdvance 완료 화면
  if (autoAdvance && words.length > 0 && wordIndex >= words.length) {
    return (
      <div className="app-soft-screen flex h-full flex-col">
        {/* 카드 + 알림 카드 + 축하가 작은 화면에서 넘칠 수 있어 이 영역만 스크롤 */}
        <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col items-center justify-center-safe gap-5 p-8">
          <div className="text-center anim-fade-up" style={{ '--i': 1 } as React.CSSProperties}>
            <h2 className="text-xl font-bold text-[var(--color-ink)] mb-1!">오늘 용어 접수. 뉴스에서 만나면 아는 척해.</h2>
            {/* 끝 화면의 핵심 숫자 하나를 크게(피크엔드) */}
            <p className="mt-3! text-4xl font-bold text-[var(--color-ink)] tabular-nums">{words.length}<span className="ml-1 text-base font-semibold text-[var(--color-ink-3)]">개 용어</span></p>
          </div>
          <div className="w-full text-center anim-fade-up" style={{ '--i': 2 } as React.CSSProperties}>
            <div className="flex flex-wrap justify-center gap-1">
              {words.slice(0, 5).map(w => (
                <span key={w.id} className="text-xs px-2 py-1 rounded-chip border border-[var(--color-line)] text-[var(--color-ink-2)]">{w.word}</span>
              ))}
            </div>
          </div>
          <DailyAlarmPromptCard />
          <StreakCelebration />
        </div>
        <div className="px-5 pb-12 flex flex-col gap-2">
          {(() => {
            const remaining = state?.continueWords?.filter(w => !knownIds.has(w.id)) ?? [];
            if (remaining.length > 0) {
              return (
                <ActionButton
                  fullWidth
                  onClick={() => {
                    logClick('continue_after_first');
                    const idx = state!.continueWords!.findIndex(w => !knownIds.has(w.id));
                    setWordIndex(idx);
                    setPageIndex(0);
                    setSelectedAnswer(null);
                    setAnswerRevealed(false);
                    navigate('/word-card', { replace: true, state: { words: state!.continueWords, index: idx, backPath, autoAdvance: true } });
                  }}
                >
                  다음 용어 계속 보기 <ChevronRight size={20} />
                </ActionButton>
              );
            }
            return (
              <ActionButton
                fullWidth
                onClick={() => navigate(backPath, { replace: true, state: { ...(backState as object | undefined), openFocus: true } })}
              >
                코스로 돌아가기
              </ActionButton>
            );
          })()}
          <ActionButton tone="soft" fullWidth onClick={() => lessonChecks(words).length > 0
            ? navigate('/lesson-check', { replace: true, state: { words, backPath, courseId: state?.courseId, nodeId: state?.nodeId } })
            : navigate('/quiz', { replace: true, state: { quizQueue: lessonQuizWords, backPath, reviewMode: true, mode: 'lesson_recall', courseId: state?.courseId, lessonId: state?.nodeId } })}>
            더 연습하기
          </ActionButton>
        </div>
      </div>
    );
  }

  if (!words.length) return null;

  const word = words[wordIndex];
  const { detail, related } = wordExtras(word, wordLookup);
  const textVisuals = word.visuals?.filter(v => v.type === 'text') ?? [];
  const { primary, more } = wordLessonVisuals(word);
  const hasCheck = question !== null && question.options.length > 1;
  const lastWord = wordIndex === words.length - 1;
  const example = word.learningExample?.replace(/^\s*학습용 가정\s*:\s*/, '').trim();
  const pages = [
    { id: 'meaning', label: '뜻', shortLabel: '뜻' },
    ...(example ? [{ id: 'example', label: '생활 속 예시', shortLabel: '예시' }] : []),
    ...(primary ? [{ id: 'concept', label: '한눈에 이해', shortLabel: '핵심' }] : []),
    ...(hasCheck ? [{ id: 'check', label: '확인 문제', shortLabel: '문제' }, { id: 'feedback', label: '해설', shortLabel: '해설' }] : []),
  ];
  const resources: WordResource[] = [
    ...textVisuals.map((visual, index) => ({ id: `text-${index}`, label: visual.title, content: <WordVisuals visuals={[visual]} terms={visualTerms} emphasisWord={word.word} showTitle={false} /> })),
    ...(!textVisuals.length && detail.trim() ? [{
      id: 'detail', label: '자세히 보기', content: <div className="word-resource-explanation">{toParagraphs(detail).filter(Boolean).map((paragraph, index) => <p key={index} className="type-reading"><StudyText text={paragraph} word={word.word} /></p>)}</div>,
    }] : []),
    ...more.map((visual, index) => ({ id: `visual-${index}`, label: visual.title, content: <WordVisuals visuals={[visual]} terms={visualTerms} emphasisWord={word.word} showTitle={false} /> })),
    ...(related.length ? [{ id: 'related', label: '관련 용어', content: <WordCard word={word} section="references" validRelated={related} onRelatedClick={handleRelatedWordClick} newsItems={[]} newsLoading={false} keyword={word.word} visualTerms={visualTerms} /> }] : []),
    ...(newsItems.length ? [{ id: 'news', label: '뉴스', content: <WordCard word={word} section="references" validRelated={[]} onRelatedClick={handleRelatedWordClick} newsItems={newsItems} newsLoading={false} keyword={word.word} visualTerms={visualTerms} /> }] : []),
    ...(word.sources?.length ? [{ id: 'sources', label: '출처', content: <p className="word-resource-sources">{[...new Set(word.sources)].map(source => SOURCE_NAMES[source] ?? source).join(' · ')}</p> }] : []),
  ];
  const page = pages[pageIndex];
  const lastPage = pageIndex === pages.length - 1;

  const goNext = () => {
    if (page.id === 'check') {
      if (selectedAnswer === null) return;
      setAnswerRevealed(true);
    }
    if (!lastPage) { setPageIndex(i => i + 1); return; }
    if (hasCheck && !answerRevealed) return;
    if (autoAdvance) {
      if (knownWords.length === 0) {
        logClick('activation_first_card');
        claimPromotion().then(amount => { if (amount) claimPromotionReward(amount); });
      }
      setKnownWords(prev => prev.some(w => w.id === word.id) ? prev : [...prev, word]);
      feedbackLearned();
    }
    setCompletedWord(word);
  };

  const goPrev = () => {
    if (pageIndex > 0) setPageIndex(i => i - 1);
  };

  // 넘길 수 없는 쪽이면 제자리.
  const SLIDE_MS = 220;
  const canPrev = pageIndex > 0;
  const width = () => scrollRef.current?.offsetWidth ?? 375;
  const settle = (x: number, then?: () => void) => {
    setSliding(true);
    setDragX(x);
    setTimeout(() => { setSliding(false); then?.(); }, SLIDE_MS);
  };
  const slide = (dir: 1 | -1) => {
    if (sliding) return;
    if (dir === -1 && !canPrev) { settle(0); return; }
    const w = width();
    settle(-dir * w, () => {
      setDragX(dir * w);   // 새 단어는 반대편에서 들어온다
      if (dir === 1) goNext(); else goPrev();
      requestAnimationFrame(() => requestAnimationFrame(() => settle(0)));
    });
  };

  if (completedWord) return (
    <>
    <div className="word-complete-screen app-soft-screen flex h-full flex-col">
      <div className="word-complete-progress">
        <div className="type-supporting"><span>{autoAdvance ? '단어 학습' : '단어 살펴보기'}</span><span>{wordIndex + 1} / {words.length}</span></div>
        <div className="word-complete-progress-track" role="progressbar" aria-label="단어 학습 진행" aria-valuemin={0} aria-valuemax={words.length} aria-valuenow={wordIndex + 1}>
          <span style={{ width: `${(wordIndex + 1) / words.length * 100}%` }} />
        </div>
      </div>
      <div className="word-complete-content">
        <header className="word-complete-summary">
          <div className="word-complete-artwork">
            <img src="/otter/v5/otter-cheer.svg" alt="" aria-hidden="true" width={144} height={144} />
          </div>
          <div className="word-complete-copy">
            <p className="type-supporting type-emphasis">{autoAdvance ? '한 단어 접수. 아는 척 적립.' : '또 봤네. 이제 모르는 척은 어렵겠는데?'}</p>
            <h1 className="type-page-title">{completedWord.word}</h1>
          </div>
        </header>
      </div>
      <div className="study-action-footer word-complete-footer">
        {!lastWord && <p className="type-supporting word-complete-next-label">다음 단어 · {words[wordIndex + 1].word}</p>}
        {(!lastWord || autoAdvance) && <ActionButton className="word-complete-next" onClick={() => { setCompletedWord(null); setPageIndex(0); setSelectedAnswer(null); setAnswerRevealed(false); setWordIndex(i => i + 1); }}>
          {lastWord ? '학습 마무리' : '다음 단어'}<ChevronRight size={20} />
        </ActionButton>}
        <button type="button" className="word-complete-back" onClick={() => navigate(backPath, { replace: true, state: { ...(backState as object | undefined), openFocus: true } })}>코스로 돌아가기</button>
      </div>
    </div>
    {previewWord && <RelatedWordPreview initialWord={previewWord} lookup={wordLookup} onClose={() => setPreviewWord(null)} />}
    </>
  );

  return (
    <>
    <div className="word-study-screen app-soft-screen flex flex-col h-full overflow-hidden">

      <div className="word-study-header px-5 pt-4">
        <div role="progressbar" aria-label={`${word.word} 페이지 진행률`} aria-valuemin={0} aria-valuemax={pages.length} aria-valuenow={pageIndex + 1} aria-valuetext={`${pageIndex + 1}/${pages.length} ${page.label}`}>
            <span className="sr-only" aria-hidden="true" data-study-page-count>{pageIndex + 1}/{pages.length}</span>
            <ol className="word-study-stepper" aria-hidden="true">
              {pages.map((step, i) => <li key={step.id} data-state={i < pageIndex ? 'done' : i === pageIndex ? 'current' : 'upcoming'}>
                <span className="word-study-step-dot">{i < pageIndex ? <Check size={16} /> : i + 1}</span>
                <span className="word-study-step-name">{step.shortLabel}</span>
              </li>)}
            </ol>
        </div>
      </div>

      <div className="word-study-layout">
      {/* 진행바 아래에서 시작하고, 긴 내용만 스크롤한다. */}
      <div
        ref={scrollRef}
        className="word-study-content [&::-webkit-scrollbar]:hidden"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: sliding ? `transform ${SLIDE_MS}ms cubic-bezier(0.25, 0.8, 0.25, 1)` : 'none',
        }}
      >
        <div key={`${word.id}:${page.id}`} data-study-unit={page.id}>
            {(page.id === 'meaning' || page.id === 'example') && <WordCard
              word={word}
              section={page.id === 'meaning' ? 'definition' : 'example'}
              onDetail={resources.length ? () => setResourcesOpen(true) : undefined}
              validRelated={related}
              onRelatedClick={handleRelatedWordClick}
              newsItems={newsItems}
              newsLoading={newsLoading}
              keyword={word.word}
              visualTerms={visualTerms}
            />}
            {page.id === 'concept' && primary && <div className="word-concept-content px-5">
              <h1 className="sr-only">{word.word}, 한눈에 이해하기</h1>
              <WordVisuals visuals={[primary]} terms={visualTerms} emphasisWord={word.word} />
              {resources.length > 0 && <button type="button" className="word-resource-entry" aria-label="더 알아보기" aria-haspopup="dialog" onClick={() => setResourcesOpen(true)}>더 알아보기<ChevronRight size={16} aria-hidden="true" /></button>}
            </div>}
            {(page.id === 'check' || page.id === 'feedback') && question && <WordQuickCheck
              question={question}
              meaning={word.meaning}
              selected={selectedAnswer}
              revealed={answerRevealed}
              feedbackOnly={page.id === 'feedback'}
              onSelect={setSelectedAnswer}
            />}

        </div>
      </div>

      {/* 하단: 이전 · 다음 */}
      <div className="word-study-controls">
        <div className="flex gap-3">
          {canPrev && <ActionButton tone="soft" onClick={() => slide(-1)} disabled={sliding} className="flex-1">
            <ChevronLeft size={20} />이전
          </ActionButton>}
          <ActionButton
            data-word-next
            onClick={() => slide(1)}
            disabled={sliding || (page.id === 'check' && selectedAnswer === null)}
            className="flex-[2]"
          >
            다음
          </ActionButton>
        </div>
      </div>
      </div>
    </div>

    {resourcesOpen && <WordResourcesDialog resources={resources} onClose={() => setResourcesOpen(false)} />}
    {previewWord && <RelatedWordPreview initialWord={previewWord} lookup={wordLookup} onClose={() => setPreviewWord(null)} />}

    </>
  );
};

export default WordCardScreen;
