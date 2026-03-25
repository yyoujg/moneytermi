import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { COURSES } from '../constants';
import { useAppContext } from '../context/AppContext';

const CourseWordListScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { knownWords } = useAppContext();

  const course = (location.state as { course: typeof COURSES[number] } | null)?.course ?? null;

  if (!course) {
    navigate('/course', { replace: true });
    return null;
  }

  const courseKnownCount = course.words.filter(w => knownWords.some(kw => kw.id === w.id)).length;
  const progressPct = Math.round((courseKnownCount / course.words.length) * 100);
  const isCompleted = progressPct === 100;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 헤더 */}
      <div className="pt-12 px-5 pb-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/course')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 shrink-0">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full shrink-0">{course.level}</span>
              {isCompleted && <span className="text-[10px] font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full shrink-0">완료</span>}
            </div>
            <h2 className="text-base font-bold text-gray-900 mt-1 truncate">{course.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-orange-500' : 'bg-orange-300'}`}
              style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-400 shrink-0">{courseKnownCount}/{course.words.length}</span>
        </div>
      </div>

      {/* 단어 리스트 */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-bold text-gray-400">수록 단어 {course.words.length}개</p>
        </div>
        <div className="bg-white mx-4 rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {course.words.map((word, idx) => {
            const isKnown = knownWords.some(kw => kw.id === word.id);
            return (
              <button
                key={word.id}
                onClick={() => navigate('/word-card', { state: { words: course.words, index: idx, backPath: '/course/words', backState: { course } } })}
                className="w-full flex items-center gap-3.5 px-4 py-4 border-b border-gray-50 last:border-0 active:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${isKnown ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {isKnown ? <CheckCircle size={14} strokeWidth={2.5} /> : idx + 1}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{word.word}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{word.meaning}</p>
                </div>
                <ChevronRight size={15} className="text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="pb-28" />
      </div>
    </div>
  );
};

export default CourseWordListScreen;
