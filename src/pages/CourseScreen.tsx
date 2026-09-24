import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Check, ChevronRight, Heart, Lock, PenLine, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchField } from '@toss/tds-mobile';
import { toast } from 'sonner';
import { useAppContext } from '../context/AppContext';
import { useHearts } from '../hooks/useHearts';
import { getGrowthStage } from '../constants';
import { logClick } from '../lib/analytics';
import { buildPath, connectorD, nodeOffsetX, ROW, SPAN, type PathNode } from '../lib/path';
import { MAX_HEARTS } from '../lib/hearts';
import { Card } from '../components/ui/Card';

const NODE = 64;

// 노드 원. TDS 리셋이 <button>의 rounded-*를 먹으므로 borderRadius는 인라인 스타일로 준다
// (인라인이 unlayered 리셋을 이긴다). button을 유지해야 포커스/Enter/disabled가 공짜로 따라온다.
const NodeCircle = ({ node, index, isFocus, onTap, nodeRef }: {
  node: PathNode;
  index: number;
  isFocus: boolean;
  onTap: () => void;
  nodeRef?: React.Ref<HTMLButtonElement>;
}) => {
  const locked = node.state === 'locked';
  const done = node.state === 'done';
  const face = done
    ? 'var(--color-brand-500)'
    : locked
      ? 'var(--color-surface)'
      : node.type === 'quiz'
        ? 'var(--color-card)'
        : 'var(--color-brand-500)';
  const shadow = done || (!locked && node.type === 'lesson') ? 'var(--color-brand-600)' : 'var(--color-line)';

  return (
    <button
      ref={nodeRef}
      type="button"
      disabled={locked}
      onClick={onTap}
      aria-label={`${node.type === 'quiz' ? '퀴즈' : '학습'} ${index + 1}`}
      className="absolute flex items-center justify-center active:translate-y-[3px] disabled:opacity-50"
      style={{
        top: (ROW - NODE) / 2,
        left: `calc(50% + ${nodeOffsetX(index)}px)`,
        marginLeft: -NODE / 2,
        width: NODE,
        height: NODE,
        borderRadius: 9999,
        background: face,
        boxShadow: `0 5px 0 ${shadow}${isFocus ? ', 0 0 0 6px var(--color-brand-soft)' : ''}`,
        border: node.type === 'quiz' && !locked ? '2px solid var(--color-brand-500)' : 'none',
      }}
    >
      {locked
        ? <Lock size={22} className="text-[var(--color-ink-4)]" />
        : done
          ? <Check size={26} strokeWidth={3} className="text-white" />
          : node.type === 'quiz'
            ? <PenLine size={22} className="text-brand-500" />
            : <span className="text-xl">📖</span>}
    </button>
  );
};

const CourseScreen = () => {
  const navigate = useNavigate();
  const { hydrated, knownIds, courses, allWords, knownWords, points } = useAppContext();
  const { hearts, loaded: heartsLoaded, trySpend, msUntilNext } = useHearts();

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const sections = useMemo(() => buildPath(courses, knownIds), [courses, knownIds]);

  // current 노드는 코스마다 하나씩 생긴다. 장식(링·"시작" 말풍선)은 패스 순서상 첫 번째에만 붙인다.
  const focusId = useMemo(() => {
    for (const sec of sections) {
      const n = sec.nodes.find(node => node.state === 'current');
      if (n) return n.id;
    }
    return null;
  }, [sections]);

  const focusRef = useRef<HTMLButtonElement>(null);
  const didScroll = useRef(false);
  useLayoutEffect(() => {
    if (didScroll.current || !hydrated || !focusId) return;
    didScroll.current = true;
    focusRef.current?.scrollIntoView({ block: 'center' });
  }, [hydrated, focusId]);

  const trimmed = query.trim();
  const searchResults = trimmed.length > 0
    ? allWords.filter(w => w.word.includes(trimmed) || w.meaning.includes(trimmed) || w.detailedMeaning.includes(trimmed))
    : [];
  const showResults = focused && trimmed.length > 0;

  const handleResultClick = (wordId: number) => {
    const course = courses.find(c => c.words.some(w => w.id === wordId));
    if (!course) return;
    const index = course.words.findIndex(w => w.id === wordId);
    setQuery(''); setFocused(false); setShowSearch(false);
    navigate('/word-card', { state: { words: course.words, index, backPath: '/course' } });
  };

  const handleNodeTap = (node: PathNode, index: number, courseKnown: number) => {
    logClick('path_node_click', { course_id: node.courseId, type: node.type, index, state: node.state });

    if (node.type === 'quiz') {
      navigate('/quiz', { state: { quizQueue: node.words.slice(0, 5), backPath: '/course' } });
      return;
    }

    // 이미 끝낸 레슨 복습은 하트를 쓰지 않는다. 하트가 없어도 복습은 막지 않는다.
    if (node.state !== 'done') {
      if (!trySpend()) {
        logClick('path_heart_empty', { course_id: node.courseId });
        const min = Math.ceil(msUntilNext() / 60000);
        toast.error(`하트가 없어요. ${min}분 뒤에 1개 충전돼요`);
        return;
      }
      if (courseKnown === 0) logClick('course_start', { course_id: node.courseId, title: node.courseId });
    }

    navigate('/word-card', { state: { words: node.words, index: 0, backPath: '/course', autoAdvance: true } });
  };

  const totalKnown = knownWords.length;

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas)] pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">

      {/* 헤더 */}
      <div className="sticky top-0 z-20 bg-[var(--color-card)]">
        <div className="pt-4 px-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-ink)]">학습 코스</h2>
              <p className="text-xs text-[var(--color-ink-3)] mt-0.5!">{totalKnown}개 완료 · {allWords.length - totalKnown}개 남음</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[var(--color-surface)]">
                <Heart size={13} className="text-danger-400 fill-current" />
                <span className="text-xs font-bold text-[var(--color-ink-2)]">
                  {heartsLoaded ? hearts : MAX_HEARTS}
                </span>
              </div>
              <button
                onClick={() => setShowSearch(s => !s)}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors
                  ${showSearch ? 'bg-brand-500 text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-3)]'}`}
              >
                {showSearch ? <X size={15} /> : <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>}
              </button>
            </div>
          </div>

          {/* 검색창 */}
          {showSearch && (
            <div className="mt-3 relative">
              <SearchField
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                onDeleteClick={() => setQuery('')}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder="용어 검색"
              />
              {showResults && (
                <Card pad="none" className="absolute top-[52px] left-0 right-0 z-50 overflow-hidden">
                  {searchResults.length === 0
                    ? <div className="px-5 py-5 text-center text-sm text-[var(--color-ink-3)]">검색 결과가 없어요</div>
                    : <div className="max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                      {searchResults.map((word, idx) => (
                        <button key={word.id} onMouseDown={() => handleResultClick(word.id)}
                          className={`w-full text-left px-5 py-3.5 flex items-center justify-between active:bg-[var(--color-card)] ${idx < searchResults.length - 1 ? 'border-b border-[var(--color-line)]' : ''}`}>
                          <div>
                            <p className="text-sm font-bold text-[var(--color-ink)]">{word.word}</p>
                            <p className="text-xs text-[var(--color-ink-3)] mt-0.5! truncate max-w-[240px]">{word.meaning}</p>
                          </div>
                          <ChevronRight size={14} className="text-[var(--color-ink-4)] shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  }
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 패스 */}
      {sections.map(sec => (
        <section key={sec.course.id}>
          {/* 코스 배너 */}
          <div className="mx-5 mt-5 mb-1 rounded-card bg-brand-500 px-5 py-4">
            <p className="text-2xs font-bold text-white/70">{sec.course.level} · {sec.course.category}</p>
            <h3 className="text-base font-bold text-white mt-1! break-keep">{sec.course.title}</h3>
            <p className="text-2xs text-white/80 mt-1.5!">{sec.knownCount} / {sec.course.words.length} 단어</p>
          </div>

          {sec.nodes.map((node, k) => {
            const isFocus = node.id === focusId;
            return (
              <div key={node.id} className="relative" style={{ height: ROW }}>
                {k > 0 && (
                  <svg
                    aria-hidden
                    width={SPAN * 2}
                    height={ROW}
                    className="absolute pointer-events-none"
                    style={{ left: `calc(50% - ${SPAN}px)`, top: -ROW / 2 }}
                  >
                    <path
                      d={connectorD(nodeOffsetX(k - 1), nodeOffsetX(k))}
                      fill="none"
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeDasharray="1 14"
                      stroke={node.state === 'done' ? 'var(--color-brand-300)' : 'var(--color-ink-4)'}
                    />
                  </svg>
                )}

                {isFocus && (
                  <>
                    <div
                      className="absolute animate-bounce-up rounded-chip bg-[var(--color-card)] px-3 py-1.5 shadow-lg"
                      style={{ top: -14, left: `calc(50% + ${nodeOffsetX(k)}px)`, marginLeft: -26 }}
                    >
                      <span className="text-2xs font-bold text-brand-500">시작</span>
                    </div>
                    <span
                      className="absolute text-4xl pointer-events-none select-none"
                      style={{ top: (ROW - NODE) / 2 + 6, left: `calc(50% + ${nodeOffsetX(k) + 56}px)` }}
                    >
                      {getGrowthStage(points).emoji}
                    </span>
                  </>
                )}

                <NodeCircle
                  node={node}
                  index={k}
                  isFocus={isFocus}
                  nodeRef={isFocus ? focusRef : undefined}
                  onTap={() => handleNodeTap(node, k, sec.knownCount)}
                />
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
};

export default CourseScreen;
