import React, { useState } from 'react';
import { BookOpen, Bell, Settings, LogOut, ChevronRight, ChevronLeft, Zap, Trophy } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import FallbackImage from '../components/FallbackImage';
import { CURRENT_LEAGUE_NAME } from '../constants';

const MENU_ITEMS = [
  { icon: Bell, label: '공지사항', sub: '최신 소식을 확인하세요' },
  { icon: Settings, label: '앱 설정', sub: '알림, 테마 등' },
  { icon: LogOut, label: '로그아웃', sub: '', danger: true },
];

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const AttendanceCalendar = ({ attendanceDates }: { attendanceDates: string[] }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const attendSet = new Set(attendanceDates);
  const todayStr = today.toISOString().slice(0, 10);

  const toStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const attendCount = Array.from({ length: daysInMonth }, (_, i) =>
    attendSet.has(toStr(year, month, i + 1))
  ).filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 active:bg-gray-100"
        >
          <ChevronLeft size={16} className="text-gray-500" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900">{year}년 {month + 1}월</p>
          <p className="text-[11px] text-orange-400 font-semibold mt-0.5">이번 달 {attendCount}일 출석</p>
        </div>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 active:bg-gray-100"
        >
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {DAYS.map((d, i) => (
          <div key={d} className={`text-center text-[11px] font-bold pb-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr = toStr(year, month, day);
          const isAttended = attendSet.has(dateStr);
          const isToday = dateStr === todayStr;
          const dayOfWeek = (firstDay + day - 1) % 7;

          return (
            <div key={day} className="flex items-center justify-center py-0.5">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold transition-all
                ${isAttended ? 'bg-orange-500 text-white font-bold' : ''}
                ${isToday && !isAttended ? 'ring-2 ring-orange-400 text-orange-500 font-bold' : ''}
                ${!isAttended && !isToday ? (dayOfWeek === 0 ? 'text-red-300' : dayOfWeek === 6 ? 'text-blue-300' : 'text-gray-400') : ''}
              `}>
                {day}
              </div>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 px-5 pb-4 pt-1 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-[11px] text-gray-400 font-medium">출석</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-orange-400" />
          <span className="text-[11px] text-gray-400 font-medium">오늘</span>
        </div>
      </div>
    </div>
  );
};

const MyPageScreen = () => {
  const { points, knownWords, attendanceDates } = useAppContext();

  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {/* Profile Header */}
      <div className="bg-white pt-12 px-6 pb-6 border-b border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-900">마이페이지</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-3xl border-2 border-orange-100 overflow-hidden shrink-0">
            <FallbackImage src="" alt="프로필" className="w-full h-full object-cover" fallbackNode={<span>🍊</span>} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base">예비슈퍼개미</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Trophy size={12} className="text-orange-400" />
              <span className="text-xs text-gray-400 font-medium">{CURRENT_LEAGUE_NAME} 리그</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-orange-50 rounded-2xl p-4 border border-orange-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap size={14} className="text-orange-500 fill-current" />
              <span className="text-[11px] font-bold text-orange-400">누적 포인트</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{points.toLocaleString()}<span className="text-sm font-semibold text-gray-400 ml-1">P</span></p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <BookOpen size={14} className="text-gray-400" />
              <span className="text-[11px] font-bold text-gray-400">학습한 단어</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{knownWords.length}<span className="text-sm font-semibold text-gray-400 ml-1">개</span></p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">
        {/* 출석 달력 */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3 px-1">출석 현황</p>
          <AttendanceCalendar attendanceDates={attendanceDates} />
        </div>

        {/* Menu */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {MENU_ITEMS.map(({ icon: Icon, label, sub, danger }, idx) => (
              <button
                key={label}
                className={`w-full flex items-center justify-between px-5 py-4 active:bg-gray-50 transition-colors ${idx < MENU_ITEMS.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? 'bg-red-50' : 'bg-gray-100'}`}>
                    <Icon size={16} className={danger ? 'text-red-400' : 'text-gray-500'} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${danger ? 'text-red-400' : 'text-gray-800'}`}>{label}</p>
                    {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
                  </div>
                </div>
                {!danger && <ChevronRight size={16} className="text-gray-300" />}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-300 font-medium mt-1 mb-2">머니터미 v1.0.0</p>
      </div>
    </div>
  );
};

export default MyPageScreen;
