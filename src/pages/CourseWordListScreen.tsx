import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { List, ListRow, Badge, Spacing } from '@toss/tds-mobile';
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
          <button
            onClick={() => navigate('/course')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 shrink-0"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge color="orange" size="small" variant="fill">{course.level}</Badge>
              {isCompleted && <Badge color="orange" size="small" variant="fill">완료</Badge>}
            </div>
            <h2 className="text-base font-bold text-gray-900 mt-1 truncate">{course.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-orange-500' : 'bg-orange-300'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-400 shrink-0">{courseKnownCount}/{course.words.length}</span>
        </div>
      </div>

      {/* 단어 리스트 */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <Spacing size={16} />
        <div className="px-4">
          <p className="text-xs font-bold text-gray-400 px-1 mb-2">수록 단어 {course.words.length}개</p>
        </div>

        <div className="px-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
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
                        ${isKnown ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
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
                    right={<ListRow.IconButton name="chevron-right-small" alt="이동" />}
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
