import React from 'react';
import { ChevronRight, Play, Zap, Flame } from 'lucide-react';
import { Badge, Button, TextButton } from '@toss/tds-mobile';
import { useNavigate } from 'react-router-dom';
import type { Mission, Missions } from '../types';
import { ALL_WORDS, COURSES, CURRENT_LEAGUE_NAME } from '../constants';
import FallbackImage from '../components/FallbackImage';
import { useAppContext } from '../context/AppContext';

// 원형 진행률 차트
const RadialProgress = ({ percent, size = 100, stroke = 8 }: { percent: number; size?: number; stroke?: number }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const cx = size / 2;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke="#f97316" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
};

// 주간 학습 바 차트 (더미 데이터)
const WeeklyBarChart = ({ attendanceDates }: { attendanceDates: string[] }) => {
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const today = new Date();
  const todayDay = today.getDay(); // 0=일,1=월...
  const mondayOffset = (todayDay === 0 ? -6 : 1 - todayDay);
  const attendSet = new Set(attendanceDates);

  const week = days.map((label, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    const dateStr = d.toISOString().slice(0, 10);
    const isAttended = attendSet.has(dateStr);
    const isFuture = d > today;
    const isToday = i === (todayDay === 0 ? 6 : todayDay - 1);
    // 더미 학습량 (출석일 기준 랜덤하지만 일관성 있게)
    const count = isAttended ? [4, 6, 3, 7, 5, 8, 2][i] : 0;
    const max = 8;
    return { label, count, max, isToday, isFuture, isAttended };
  });

  const maxVal = Math.max(...week.map(d => d.count), 1);

  return (
    <div>
      <div className="flex items-end justify-between gap-1.5 h-20 mb-2">
        {week.map(({ label, count, isToday, isFuture }) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ${
                  isToday ? 'bg-orange-500' : count > 0 ? 'bg-orange-200' : 'bg-gray-100'
                } ${isFuture ? 'opacity-30' : ''}`}
                style={{ height: count > 0 ? `${(count / maxVal) * 64}px` : '6px' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-1.5">
        {week.map(({ label, isToday }) => (
          <div key={label} className={`flex-1 text-center text-[10px] font-bold ${isToday ? 'text-orange-500' : 'text-gray-300'}`}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

const HomeScreen = () => {
  const navigate = useNavigate();
  const { points, knownWords, missions, claimReward, attendanceDates } = useAppContext();
  const totalWords = ALL_WORDS.length;
  const percent = totalWords > 0 ? Math.round((knownWords.length / totalWords) * 100) : 0;

  // 연속 출석일 계산
  const streak = (() => {
    const today = new Date();
    let count = 0;
    const s = new Set(attendanceDates);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (s.has(d.toISOString().slice(0, 10))) count++;
      else break;
    }
    return count;
  })();

  const handleStartCourse = (course: (typeof COURSES)[number]) => {
    navigate('/swipe', { state: { course } });
  };

  return (
    <div className="flex flex-col h-full pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ backgroundColor: '#f4f4f4' }}>
      {/* 헤더 */}
      <div className="pt-12 px-6 pb-5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="inline-flex items-center bg-gray-200/60 px-2.5 py-1 rounded-md mb-3">
              <span className="text-[10px] font-bold text-gray-600">이번 주: {CURRENT_LEAGUE_NAME} 리그</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">예비슈퍼개미님,<br />오늘도 학습해볼까요?</h1>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
            <FallbackImage src="" alt="프로필" className="w-full h-full object-cover scale-110" fallbackNode={<span className="text-xl">🍊</span>} />
          </div>
        </div>

        {/* 통계 카드 - 원형 차트 포함 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-center gap-5">
            {/* 원형 진행률 */}
            <div className="relative shrink-0">
              <RadialProgress percent={percent} size={96} stroke={9} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{percent}%</span>
                <span className="text-[9px] text-gray-400 font-medium">달성</span>
              </div>
            </div>
            {/* 수치 */}
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium mb-0.5">전체 학습 진행률</p>
              <p className="text-2xl font-bold text-gray-900 mb-3">
                {knownWords.length}<span className="text-sm font-medium text-gray-400 ml-1">/ {totalWords} 단어</span>
              </p>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5">
                  <Zap size={13} className="text-orange-500 fill-current" />
                  <span className="text-xs font-bold text-gray-700">{points} P</span>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="flex items-center gap-1.5">
                  <Flame size={13} className="text-orange-400" />
                  <span className="text-xs font-bold text-gray-700">{streak}일 연속</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 주간 학습 바 차트 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-5 pt-4 pb-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-bold text-gray-900">이번 주 학습</p>
            <span className="text-[11px] font-medium text-gray-400">단어 수 기준</span>
          </div>
          <WeeklyBarChart attendanceDates={attendanceDates} />
        </div>
      </div>

      {/* 코스 + 미션 */}
      <div className="px-6 flex flex-col gap-6">
        <div className="shrink-0">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-base font-bold text-gray-900">단계별 용어 학습</h2>
            <TextButton size="small" onClick={() => navigate('/course')}>
              <span className="whitespace-nowrap flex items-center">전체보기 <ChevronRight size={14} /></span>
            </TextButton>
          </div>
          <div className="flex flex-col gap-3">
            {COURSES.slice(0, 2).map((course) => {
              const courseKnownCount = course.words.filter((w) => knownWords.some((kw) => kw.id === w.id)).length;
              const progressPct = Math.round((courseKnownCount / course.words.length) * 100);
              return (
                <div key={course.id} className="bg-white rounded-2xl p-4 border border-gray-200/80 flex items-center justify-between active:bg-gray-50 transition">
                  <div className="flex-1 pr-4 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">{course.level}</span>
                      <h3 className="font-bold text-gray-900 text-[14px] truncate">{course.title}</h3>
                    </div>
                    <div className="mt-2.5 flex items-center">
                      <div className="flex-1 bg-gray-100 rounded-full h-1 mr-3 overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full" style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-orange-500 w-8 text-right shrink-0">{progressPct}%</span>
                    </div>
                  </div>
                  <Button size="small" onClick={() => handleStartCourse(course)} className="shrink-0">
                    <Play size={16} className="mr-1" />시작
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shrink-0 mb-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-900">오늘의 미션</h2>
            <span className="text-[10px] font-medium text-gray-400">자정 초기화</span>
          </div>
          <div className="flex flex-col gap-0">
            {Object.values(missions as Record<string, Mission>).map((mission, idx) => {
              const isCompleted = mission.current >= mission.target;
              const isLast = idx === Object.values(missions).length - 1;
              return (
                <div key={mission.id} className={`flex justify-between items-center py-3.5 ${!isLast ? 'border-b border-gray-100' : ''}`}>
                  <div>
                    <span className={`text-sm font-medium block ${mission.isRewarded ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{mission.title}</span>
                    <span className="text-xs text-orange-500 font-semibold mt-0.5 inline-block">+{mission.reward} P</span>
                  </div>
                  {mission.isRewarded
                    ? <Badge color="elephant" size="small" variant="fill">완료</Badge>
                    : isCompleted
                    ? <Button size="small" onClick={() => claimReward(mission.id as keyof Missions)}>보상 받기</Button>
                    : <span className="text-xs font-medium text-gray-400 px-2 py-1">{mission.current} / {mission.target}</span>
                  }
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
