import React, { useState } from 'react';
import { CheckCircle, ChevronRight, X, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchField, Menu, Spacing } from '@toss/tds-mobile';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';

const CourseScreen = () => {
  const navigate = useNavigate();
  const { knownWords, courses, allWords } = useAppContext();

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('전체');

  const categories = [...new Set(courses.map(c => c.category))];
  const filteredCourses = activeCategory === '전체'
    ? courses
    : courses.filter(c => c.category === activeCategory);

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

  const totalWords = allWords.length;
  const totalKnown = knownWords.length;
  const allCategories = ['전체', ...categories];

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas)] pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">

      {/* 헤더 */}
      <div className="sticky top-0 z-20 bg-[var(--color-card)]">
        <div className="pt-4 px-5 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-ink)]">학습 코스</h2>
              <p className="text-xs text-[var(--color-ink-3)] mt-0.5">{totalKnown}개 완료 · {totalWords - totalKnown}개 남음</p>
            </div>
            <button
              onClick={() => { setShowSearch(s => !s); }}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors
                ${showSearch ? 'bg-orange-500 text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-3)]'}`}
            >
              {showSearch ? <X size={15} /> : <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>}
            </button>
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
                <div className="absolute top-[52px] left-0 right-0 bg-[var(--color-card)] rounded-2xl z-50 overflow-hidden">
                  {searchResults.length === 0
                    ? <div className="px-5 py-5 text-center text-sm text-[var(--color-ink-3)]">검색 결과가 없어요</div>
                    : <div className="max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                      {searchResults.map((word, idx) => (
                        <button key={word.id} onMouseDown={() => handleResultClick(word.id)}
                          className={`w-full text-left px-5 py-3.5 flex items-center justify-between active:bg-[var(--color-card)] ${idx < searchResults.length - 1 ? 'border-b border-[var(--color-line)]' : ''}`}>
                          <div>
                            <p className="text-sm font-bold text-[var(--color-ink)]">{word.word}</p>
                            <p className="text-xs text-[var(--color-ink-3)] mt-0.5 truncate max-w-[240px]">{word.meaning}</p>
                          </div>
                          <ChevronRight size={14} className="text-[var(--color-ink-4)] shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  }
                </div>
              )}
            </div>
          )}
        </div>

        {/* 전체 진행 세그먼트 바 */}
        <div className="px-5 pb-2 flex gap-[2px]">
          {allWords.map(word => {
            const isKnown = knownWords.some(kw => kw.id === word.id);
            return <div key={word.id} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${isKnown ? 'bg-orange-400' : 'bg-[var(--color-surface)]'}`} />;
          })}
        </div>

        {/* 카테고리 필터 */}
        <div className="px-5 pb-3">
          <Menu.Trigger
            dropdown={
              <Menu.Dropdown header={<Menu.Header>카테고리</Menu.Header>}>
                {allCategories.map(cat => (
                  <Menu.DropdownItem
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    right={activeCategory === cat ? <span className="text-orange-500 text-xs font-bold">✓</span> : undefined}
                  >
                    {cat}
                  </Menu.DropdownItem>
                ))}
              </Menu.Dropdown>
            }
          >
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface)] text-xs font-medium text-[var(--color-ink-3)]">
              {activeCategory}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </Menu.Trigger>
        </div>
      </div>

      {/* 코스 목록 */}
      <div className="px-5 pt-5 flex flex-col gap-3">
        {filteredCourses.map((course) => {
          const courseKnownCount = course.words.filter(w => knownWords.some(kw => kw.id === w.id)).length;
          const progressPct = Math.round((courseKnownCount / course.words.length) * 100);
          const isCompleted = progressPct === 100;
          const hasStarted = courseKnownCount > 0;

          return (
            <div key={course.id} className="bg-[var(--color-card)] rounded-2xl overflow-hidden">

              {/* 카드 헤더 */}
              <div
                onClick={() => navigate('/course/words', { state: { course } })}
                className="px-5 pt-5 pb-4 cursor-pointer active:opacity-80"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full text-[var(--color-ink-3)]"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    {course.level}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-orange-500">
                      <CheckCircle size={12} /> 완료
                    </span>
                  )}
                  {!isCompleted && hasStarted && (
                    <span className="text-[11px] font-bold text-orange-500">{progressPct}%</span>
                  )}
                </div>

                <h3 className="text-[15px] font-bold leading-tight mb-1 text-[var(--color-ink)]">
                  {course.title}
                </h3>
                <p className="text-xs text-[var(--color-ink-4)]">
                  {course.description}
                </p>
              </div>

              {/* 진행 바 + 버튼 */}
              <div className="px-5 pt-4 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-[var(--color-surface)] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-orange-500' : 'bg-orange-300'}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[var(--color-ink-3)] shrink-0 w-8 text-right">
                    {courseKnownCount}/{course.words.length}
                  </span>
                </div>

                <button
                  onClick={() => { logClick('course_start', { course_id: course.id, title: course.title }); navigate('/word-card', { state: { words: [...course.words].sort((a, b) => a.difficulty - b.difficulty), index: 0, backPath: '/course', autoAdvance: true } }); }}
                  className={`w-full flex items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold transition-colors
                    ${isCompleted
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 active:bg-orange-500/20'
                      : hasStarted
                        ? 'bg-orange-500 text-white active:bg-orange-600'
                        : 'bg-[var(--color-line)] text-[var(--color-ink-2)] active:opacity-80'
                    }`}
                >
                  <Play size={14} />
                  {isCompleted ? '다시 복습하기' : hasStarted ? '이어서 학습하기' : '코스 시작하기'}
                </button>
              </div>
            </div>
          );
        })}
        <Spacing size={8} />
      </div>
    </div>
  );
};

export default CourseScreen;
