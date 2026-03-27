import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { List, ListRow, Badge, Spacing } from '@toss/tds-mobile';
import type { Course } from '../types';
import { useAppContext } from '../context/AppContext';

const CourseWordListScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { knownWords } = useAppContext();

  const course = (location.state as { course: Course } | null)?.course ?? null;

  if (!course) {
    navigate('/course', { replace: true });
    return null;
  }

  const courseKnownCount = course.words.filter(w => knownWords.some(kw => kw.id === w.id)).length;
  const progressPct = Math.round((courseKnownCount / course.words.length) * 100);
  const isCompleted = progressPct === 100;

  return (
    <div className="flex flex-col h-full bg-[#F7F7F7]">
      {/* 헤더 */}
      <div className="pt-12 px-5 pb-4 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/course')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0F0F0] shrink-0"
          >
            <ChevronLeft size={20} className="text-[#555555]" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#888888] px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F0F0F0' }}>{course.level}</span>
              {isCompleted && <Badge color="green" size="small" variant="fill">완료</Badge>}
            </div>
            <h2 className="text-base font-bold text-[#111111] mt-1 truncate">{course.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#F0F0F0] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-orange-500' : 'bg-orange-300'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#888888] shrink-0">{courseKnownCount}/{course.words.length}</span>
        </div>
      </div>

      {/* 단어 리스트 */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <Spacing size={16} />
        <div className="px-5">
          <p className="text-xs font-bold text-[#888888] mb-2">수록 단어 {course.words.length}개</p>
        </div>

        <div className="px-5">
          <div className="bg-white rounded-2xl overflow-hidden">
            <List>
              {course.words.map((word, idx) => {
                const isKnown = knownWords.some(kw => kw.id === word.id);
                return (
                  <ListRow
                    key={word.id}
                    as="button"
                    onClick={() => navigate('/word-card', {
                      state: { words: course.words, index: idx, backPath: '/course/words', backState: { course } }
                    })}
                    border="none"
                    left={
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                        ${isKnown ? 'bg-orange-500 text-white' : 'bg-[#F0F0F0] text-[#888888]'}`}>
                        {isKnown ? <CheckCircle size={14} strokeWidth={2.5} /> : idx + 1}
                      </div>
                    }
                    contents={
                      <ListRow.Texts
                        type="2RowTypeA"
                        top={word.word}
                        bottom={word.meaning}
                      />
                    }
                    right={<ChevronRight size={16} className="text-[#AAAAAA]" />}
                  />
                );
              })}
            </List>
          </div>
        </div>

        <Spacing size={112} />
      </div>
    </div>
  );
};

export default CourseWordListScreen;
