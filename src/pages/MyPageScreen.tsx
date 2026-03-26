import React, { useState } from 'react';
import { BookOpen, Bell, Settings, LogOut, ChevronLeft, ChevronRight, Zap, Trophy, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import FallbackImage from '../components/FallbackImage';
import { CURRENT_LEAGUE_NAME } from '../constants';
import { List, ListRow, Spacing } from '@toss/tds-mobile';
import { useAuth } from '../hooks/useAuth';
import GuestLinkSheet from '../components/GuestLinkSheet';

const MENU_ITEMS = [
  { icon: Bell, label: '공지사항', sub: '최신 소식을 확인하세요', danger: false },
  { icon: Settings, label: '앱 설정', sub: '알림, 테마 등', danger: false },
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
    <div className="bg-[#161616] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#161616] active:bg-[#1E1E1E]"
        >
          <ChevronLeft size={16} className="text-[#777777]" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-white">{year}년 {month + 1}월</p>
          <p className="text-[11px] text-orange-400 font-semibold mt-0.5">이번 달 {attendCount}일 출석</p>
        </div>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#161616] active:bg-[#1E1E1E]"
        >
          <ChevronLeft size={16} className="text-[#777777] rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-7 px-3 pt-3">
        {DAYS.map((d, i) => (
          <div key={d} className={`text-center text-[11px] font-bold pb-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#777777]'}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr = toStr(year, month, day);
          const isAttended = attendSet.has(dateStr);
          const isToday = dateStr === todayStr;
          const dayOfWeek = (firstDay + day - 1) % 7;
          return (
            <div key={day} className="flex items-center justify-center py-0.5">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold
                ${isAttended ? 'bg-orange-500 text-white font-bold' : ''}
                ${isToday && !isAttended ? 'ring-2 ring-orange-400 text-orange-500 font-bold' : ''}
                ${!isAttended && !isToday ? (dayOfWeek === 0 ? 'text-red-300' : dayOfWeek === 6 ? 'text-blue-300' : 'text-[#777777]') : ''}
              `}>
                {day}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 px-5 pb-4 pt-1 border-t border-[#1E1E1E]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-[11px] text-[#777777] font-medium">출석</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-orange-400" />
          <span className="text-[11px] text-[#777777] font-medium">오늘</span>
        </div>
      </div>
    </div>
  );
};

const MyPageScreen = () => {
  const { points, knownWords, attendanceDates } = useAppContext();
  const { user, isGuest, linkAccount } = useAuth();
  const [showLinkSheet, setShowLinkSheet] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#0B0B0B] pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {showLinkSheet && (
        <GuestLinkSheet
          onClose={() => setShowLinkSheet(false)}
          onLink={(email) => { linkAccount(email); setShowLinkSheet(false); }}
        />
      )}
      {/* 프로필 헤더 */}
      <div className="bg-[#161616] pt-12 px-5 pb-5">
        <h2 className="text-xl font-bold mb-5 text-white">마이페이지</h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center text-3xl border-2 border-orange-500/20 overflow-hidden shrink-0">
            <FallbackImage src="" alt="프로필" className="w-full h-full object-cover" fallbackNode={<span>🍊</span>} />
          </div>
          <div>
            <p className="font-bold text-white text-base">{user?.nickname ?? '예비슈퍼개미'}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Trophy size={12} className="text-orange-400" />
              <span className="text-xs text-[#777777] font-medium">{CURRENT_LEAGUE_NAME} 리그</span>
            </div>
            {isGuest && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium text-[#555555] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1E1E1E' }}>
                <ShieldAlert size={10} className="text-[#555555]" /> 게스트 계정
              </span>
            )}
            {!isGuest && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium text-green-500 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.08)' }}>
                <ShieldCheck size={10} /> {user?.email ?? '계정 연결됨'}
              </span>
            )}
          </div>
        </div>

        {/* 통계 */}
        <div className="flex gap-3">
          <div className="flex-1 bg-[#1E1E1E] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={13} className="text-[#555555] fill-current" />
              <span className="text-[11px] font-medium text-[#555555]">누적 포인트</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {points.toLocaleString()}<span className="text-sm font-medium text-[#555555] ml-1">P</span>
            </p>
          </div>
          <div className="flex-1 bg-[#1E1E1E] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen size={13} className="text-[#555555]" />
              <span className="text-[11px] font-medium text-[#555555]">학습한 단어</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {knownWords.length}<span className="text-sm font-medium text-[#555555] ml-1">개</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">
        {/* 출석 달력 */}
        <div>
          <p className="text-sm font-bold text-[#ABABAB] mb-5">출석 현황</p>
          <AttendanceCalendar attendanceDates={attendanceDates} />
        </div>

        {/* 계정 연결 */}
        {isGuest && (
          <div className="bg-[#161616] rounded-2xl px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">기록 안전하게 보관하기</p>
              <p className="text-xs text-[#777777]">⚠️ 앱 삭제 시 데이터가 사라질 수 있어요</p>
            </div>
            <button
              onClick={() => setShowLinkSheet(true)}
              className="px-3.5 py-2 rounded-xl bg-orange-500 text-xs font-bold text-white active:opacity-90 shrink-0 ml-3 whitespace-nowrap"
            >
              기록 저장하기
            </button>
          </div>
        )}

        {/* 메뉴 */}
        <div>
          <div className="bg-[#161616] rounded-2xl overflow-hidden">
            <List>
              {MENU_ITEMS.map(({ icon: Icon, label, sub, danger }) => (
                <ListRow
                  key={label}
                  as="button"
                  border="none"
                  left={
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? 'bg-red-500/10' : 'bg-[#2A2A2A]'}`}>
                      <Icon size={16} className={danger ? 'text-red-400' : 'text-[#ABABAB]'} />
                    </div>
                  }
                  contents={
                    sub
                      ? <ListRow.Texts type="2RowTypeA" top={<span className={danger ? 'text-red-400' : ''}>{label}</span>} bottom={<span className="text-[11px]">{sub}</span>} />
                      : <ListRow.Texts type="1RowTypeA" top={<span className={danger ? 'text-red-400' : ''}>{label}</span>} />
                  }
                  right={!danger ? <ChevronRight size={16} className="text-[#555555]" /> : undefined}
                />
              ))}
            </List>
          </div>
        </div>

        <Spacing size={4} />
        <p className="text-center text-[11px] text-[#555555] font-medium mb-2">머니터미 v1.0.0</p>
      </div>
    </div>
  );
};

export default MyPageScreen;
