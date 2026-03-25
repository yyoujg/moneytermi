import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@toss/tds-mobile';
import { useNavigate } from 'react-router-dom';
import { COURSES } from '../constants';
import { useAppContext } from '../context/AppContext';

const CourseScreen = () => {
  const navigate = useNavigate();
  const { knownWords } = useAppContext();

  return (
    <div className="flex flex-col h-full bg-white relative pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="pt-12 px-6 pb-4 bg-white z-20 sticky top-0 border-b border-gray-100"><h2 className="text-xl font-bold text-gray-900">학습 코스</h2></div>
      <div className="flex-1 p-6 bg-gray-50/50">
        <div className="flex flex-col gap-5 relative">
          <div className="absolute left-[23px] top-6 bottom-6 w-[1px] bg-gray-200 z-0" />
          {COURSES.map((course) => {
            const courseKnownCount = course.words.filter((w) => knownWords.some((kw) => kw.id === w.id)).length;
            const progressPct = Math.round((courseKnownCount / course.words.length) * 100);
            const isCompleted = progressPct === 100;
            return (
              <div key={course.id} className="relative z-10 flex bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
                <div className="flex flex-col items-center mr-4 mt-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm z-10 ${isCompleted ? 'bg-orange-500 text-white' : progressPct > 0 ? 'bg-white text-orange-500 border-2 border-orange-500' : 'bg-white text-gray-400 border border-gray-200'}`}>
                    {isCompleted ? <CheckCircle size={20} /> : course.level}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-5 break-keep">{course.description}</p>
                  <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold text-gray-400">달성률</span><span className={`text-[11px] font-bold ${isCompleted ? 'text-orange-500' : 'text-gray-500'}`}>{progressPct}%</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5 overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-orange-500' : 'bg-gray-300'}`} style={{ width: `${progressPct}%` }} /></div>
                  <Button display="block" size="small" variant={isCompleted ? 'weak' : 'fill'} onClick={() => navigate('/swipe', { state: { course } })}>
                    {isCompleted ? '다시 복습하기' : progressPct > 0 ? '이어서 줍줍하기' : '코스 시작하기'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseScreen;
