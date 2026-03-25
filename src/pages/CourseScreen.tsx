import React, { useState, useRef } from 'react';
import { CheckCircle, ChevronRight, Search, X, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ALL_WORDS, CATEGORIES, COURSES } from '../constants';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';

// ─── 메인 ─────────────────────────────────────────────────────────────────────
const CourseScreen = () => {
  const navigate = useNavigate();
  const { knownWords } = useAppContext();

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredCourses = activeCategory === '전체'
    ? COURSES
    : COURSES.filter(c => c.category === activeCategory);

  const trimmed = query.trim();
  const searchResults = trimmed.length > 0
    ? ALL_WORDS.filter(w => w.word.includes(trimmed) || w.meaning.includes(trimmed) || w.detailedMeaning.includes(trimmed))
    : [];
  const showResults = focused && trimmed.length > 0;

  const handleResultClick = (wordId: number) => {
    const course = COURSES.find(c => c.words.some(w => w.id === wordId));
    if (!course) return;
    const index = course.words.findIndex(w => w.id === wordId);
    setQuery(''); setFocused(false); setShowSearch(false);
    navigate('/word-card', { state: { words: course.words, index, backPath: '/course' } });
  };

  const totalWords = ALL_WORDS.length;
  const totalKnown = knownWords.length;
  const totalPct = Math.round((totalKnown / totalWords) * 100);

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">

      {/* ── 헤더 ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="pt-12 px-5 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-xl font-bold text-gray-900">학습 코스</h2>
              <p className="text-xs text-gray-400 mt-0.5">{totalKnown}개 완료 · {totalWords - totalKnown}개 남음</p>
            </div>
            <button
              onClick={() => { setShowSearch(s => !s); setTimeout(() => inputRef.current?.focus(), 50); }}
              className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors
                ${showSearch ? 'bg-orange-500 border-orange-500 text-white' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
            >
              {showSearch ? <X size={15} /> : <Search size={15} />}
            </button>
          </div>

          {/* 검색창 */}
          {showSearch && (
            <div className="mt-3 relative">
              <div className={`flex items-center bg-gray-50 rounded-2xl px-4 h-11 border transition-all ${focused ? 'border-orange-400 bg-white shadow-sm' : 'border-gray-100'}`}>
                <Search size={14} className="text-gray-400 shrink-0 mr-2" />
                <input
                  ref={inputRef} type="text" value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  placeholder="용어 검색"
                  className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                />
                {query.length > 0 && (
                  <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="ml-2 text-gray-300">
                    <X size={14} />
                  </button>
                )}
              </div>
              {showResults && (
                <div className="absolute top-[48px] left-0 right-0 bg-white rounded-2xl border border-gray-100 shadow-lg z-50 overflow-hidden">
                  {searchResults.length === 0
                    ? <div className="px-5 py-5 text-center text-sm text-gray-400">검색 결과가 없어요</div>
                    : <div className="max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                      {searchResults.map((word, idx) => (
                        <button key={word.id} onMouseDown={() => handleResultClick(word.id)}
                          className={`w-full text-left px-5 py-3.5 flex items-center justify-between active:bg-gray-50 ${idx < searchResults.length - 1 ? 'border-b border-gray-50' : ''}`}>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{word.word}</p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]">{word.meaning}</p>
                          </div>
                          <ChevronRight size={14} className="text-gray-300 shrink-0 ml-2" />
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
        <div className="px-5 pb-3 flex gap-[2px]">
          {ALL_WORDS.map(word => {
            const isKnown = knownWords.some(kw => kw.id === word.id);
            return <div key={word.id} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${isKnown ? 'bg-orange-400' : 'bg-gray-100'}`} />;
          })}
        </div>

        {/* 카테고리 필터 */}
        <div className="px-5 pb-1">
          <select
            value={activeCategory}
            onChange={e => setActiveCategory(e.target.value)}
            className="w-full h-10 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 outline-none appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
          >
            <option value="전체">전체 카테고리</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 코스 목록 ── */}
      <div className="px-4 pt-4 flex flex-col gap-4">
        {filteredCourses.map((course) => {
          const courseKnownCount = course.words.filter(w => knownWords.some(kw => kw.id === w.id)).length;
          const progressPct = Math.round((courseKnownCount / course.words.length) * 100);
          const isCompleted = progressPct === 100;
          const hasStarted = courseKnownCount > 0;

          return (
            <div key={course.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">

              {/* ── 카드 헤더 영역 ── */}
              <div onClick={() => navigate('/course/words', { state: { course } })} className={`px-5 pt-5 pb-4 relative overflow-hidden cursor-pointer active:opacity-90
                ${isCompleted
                  ? 'bg-gradient-to-br from-orange-400 to-orange-500'
                  : hasStarted
                  ? 'bg-gradient-to-br from-orange-50 to-amber-50'
                  : 'bg-gray-50'
                }`}
              >
                {/* 배경 장식 원 */}
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10
                  ${isCompleted ? 'bg-white' : 'bg-orange-300'}`} />
                <div className={`absolute -right-2 top-6 w-14 h-14 rounded-full opacity-10
                  ${isCompleted ? 'bg-white' : 'bg-orange-200'}`} />

                <div className="relative flex items-start justify-between mb-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full
                    ${isCompleted ? 'bg-white/25 text-white' : 'bg-white text-orange-500 border border-orange-100 shadow-sm'}`}>
                    {course.level}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-white/90">
                      <CheckCircle size={12} /> 완료
                    </span>
                  )}
                  {!isCompleted && hasStarted && (
                    <span className="text-[11px] font-bold text-orange-400">{progressPct}%</span>
                  )}
                </div>

                <h3 className={`text-[15px] font-bold leading-tight mb-1 relative
                  ${isCompleted ? 'text-white' : 'text-gray-900'}`}>
                  {course.title}
                </h3>
                <p className={`text-xs relative ${isCompleted ? 'text-orange-100' : 'text-gray-400'}`}>
                  {course.description}
                </p>
              </div>

              {/* ── 진행 바 + 버튼 ── */}
              <div className="px-5 pt-4 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-orange-500' : 'bg-orange-300'}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 shrink-0 w-8 text-right">
                    {courseKnownCount}/{course.words.length}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/swipe', { state: { course } })}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-colors
                    ${isCompleted
                      ? 'bg-gray-50 text-gray-500 border border-gray-100 active:bg-gray-100'
                      : 'bg-orange-500 text-white active:bg-orange-600 shadow-sm shadow-orange-200'
                    }`}
                >
                  <Play size={14} className={isCompleted ? '' : 'fill-white'} />
                  {isCompleted ? '다시 복습하기' : hasStarted ? '이어서 학습하기' : '코스 시작하기'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default CourseScreen;
