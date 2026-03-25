import React from 'react';
import { BookOpen, ChevronRight, Play, Zap } from 'lucide-react';
import { Badge, Button, ProgressBar, SearchField, TextButton } from '@toss/tds-mobile';
import { useNavigate } from 'react-router-dom';
import type { Mission, Missions } from '../types';
import { ALL_WORDS, COURSES, CURRENT_LEAGUE_NAME } from '../constants';
import FallbackImage from '../components/FallbackImage';
import { useAppContext } from '../context/AppContext';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { points, knownWords, missions, claimReward } = useAppContext();
  const totalWords = ALL_WORDS.length;
  const percent = totalWords > 0 ? Math.round((knownWords.length / totalWords) * 100) : 0;

  const handleStartCourse = (course: (typeof COURSES)[number]) => {
    navigate('/swipe', { state: { course } });
  };

  return (
    <div className="flex flex-col h-full pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ backgroundColor: '#f4f4f4' }}>
      <div className="pt-12 px-6 pb-2">
        <div className="mb-4">
          <SearchField placeholder="용어 검색" />
        </div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="inline-flex items-center bg-gray-200/60 px-2.5 py-1 rounded-md mb-3"><span className="text-[10px] font-bold text-gray-600">이번 주: {CURRENT_LEAGUE_NAME} 리그</span></div>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">예비슈퍼개미님,<br />오늘도 줍줍해볼까요?</h1>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
            <FallbackImage src="" alt="프로필" className="w-full h-full object-cover scale-110" fallbackNode={<span className="text-xl">🍊</span>} />
          </div>
        </div>
        <div className="flex gap-3 mb-8">
          <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-200/80 flex flex-col justify-center">
            <span className="text-xs text-gray-500 font-medium mb-1.5 flex items-center"><Zap size={14} className="mr-1" /> 내 포인트</span>
            <span className="text-xl font-bold text-gray-900">{points} <span className="text-sm font-medium text-gray-500">P</span></span>
          </div>
          <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-200/80 flex flex-col justify-center">
            <span className="text-xs text-gray-500 font-medium mb-1.5 flex items-center"><BookOpen size={14} className="mr-1" /> 줍줍한 단어</span>
            <div className="flex items-end mb-2"><span className="text-xl font-bold text-gray-900">{knownWords.length}</span><span className="text-xs font-medium text-gray-400 mb-0.5 ml-1">/ {totalWords}</span></div>
            <ProgressBar progress={percent} size="normal" />
          </div>
        </div>
      </div>
      <div className="px-6 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shrink-0">
          <div className="flex justify-between items-center mb-4"><h2 className="text-base font-bold text-gray-900">오늘의 미션</h2><span className="text-[10px] font-medium text-gray-400">자정 초기화</span></div>
          <div className="flex flex-col gap-0">
            {Object.values(missions as Record<string, Mission>).map((mission, idx) => {
              const isCompleted = mission.current >= mission.target;
              const isLast = idx === Object.values(missions).length - 1;
              return (
                <div key={mission.id} className={`flex justify-between items-center py-3.5 ${!isLast ? 'border-b border-gray-100' : ''}`}>
                  <div><span className={`text-sm font-medium block ${mission.isRewarded ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{mission.title}</span><span className="text-xs text-orange-500 font-semibold mt-0.5 inline-block">+{mission.reward} P</span></div>
                  {mission.isRewarded ? <Badge color="elephant" size="small" variant="fill">완료</Badge> : isCompleted ? <Button size="small" onClick={() => claimReward(mission.id as keyof Missions)}>보상 받기</Button> : <span className="text-xs font-medium text-gray-400 px-2 py-1">{mission.current} / {mission.target}</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="shrink-0 pb-6">
          <div className="flex justify-between items-end mb-4 px-1"><h2 className="text-base font-bold text-gray-900">단계별 용어 줍줍</h2><TextButton size="small" onClick={() => navigate('/course')}>전체보기 <ChevronRight size={14} /></TextButton></div>
          <div className="flex flex-col gap-3">
            {COURSES.slice(0, 2).map((course) => {
              const courseKnownCount = course.words.filter((w) => knownWords.some((kw) => kw.id === w.id)).length;
              const progressPct = Math.round((courseKnownCount / course.words.length) * 100);
              return (
                <div key={course.id} className="bg-white rounded-2xl p-4 border border-gray-200/80 flex items-center justify-between active:bg-gray-50 transition">
                  <div className="flex-1 pr-4 min-w-0">
                    <div className="flex items-center space-x-2 mb-1"><span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">{course.level}</span><h3 className="font-bold text-gray-900 text-[14px] truncate">{course.title}</h3></div>
                    <div className="mt-2.5 flex items-center"><div className="flex-1 bg-gray-100 rounded-full h-1 mr-3 overflow-hidden"><div className="bg-orange-500 h-full rounded-full" style={{ width: `${progressPct}%` }} /></div><span className="text-xs font-semibold text-orange-500 w-8 text-right shrink-0">{progressPct}%</span></div>
                  </div>
                  <Button size="small" onClick={() => handleStartCourse(course)} className="shrink-0"><Play size={16} className="mr-1" />시작</Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
