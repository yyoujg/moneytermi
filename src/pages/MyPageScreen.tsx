import React, { useState, useEffect, useRef } from 'react';
import { Storage } from '../lib/storage';
import { BookOpen, Bell, Settings, LogOut, ChevronLeft, ChevronRight, Zap, Trophy, ShieldCheck, ShieldAlert, X, Volume2, VolumeX, Pencil } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import FallbackImage from '../components/FallbackImage';
import { CURRENT_LEAGUE_NAME } from '../constants';
import { List, ListRow, Spacing } from '@toss/tds-mobile';
import { useAuth } from '../hooks/useAuth';
import GuestLinkSheet from '../components/GuestLinkSheet';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];


// ── 출석 달력 ─────────────────────────────────────────────────
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
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white active:bg-[#F0F0F0]"
        >
          <ChevronLeft size={16} className="text-[#888888]" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-[#111111]">{year}년 {month + 1}월</p>
          <p className="text-[11px] text-orange-400 font-semibold mt-0.5">이번 달 {attendCount}일 출석</p>
        </div>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white active:bg-[#F0F0F0]"
        >
          <ChevronLeft size={16} className="text-[#888888] rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-7 px-3 pt-3">
        {DAYS.map((d, i) => (
          <div key={d} className={`text-center text-[11px] font-bold pb-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#888888]'}`}>
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
                ${!isAttended && !isToday ? (dayOfWeek === 0 ? 'text-red-300' : dayOfWeek === 6 ? 'text-blue-300' : 'text-[#888888]') : ''}
              `}>
                {day}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 px-5 pb-4 pt-1 border-t border-[#E5E5E5]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-[11px] text-[#888888] font-medium">출석</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-orange-400" />
          <span className="text-[11px] text-[#888888] font-medium">오늘</span>
        </div>
      </div>
    </div>
  );
};

// ── 공지사항 시트 ──────────────────────────────────────────────
const NoticeSheet = ({ onClose }: { onClose: () => void }) => (
  <>
    <div className="fixed inset-0 z-50 bg-black/70" onClick={onClose} />
    <div className="fixed bottom-0 z-[60] w-full" style={{ maxWidth: '28rem', left: '50%', transform: 'translateX(-50%)' }}>
      <div className="bg-white rounded-t-3xl px-5 pt-6 pb-28 flex flex-col gap-4" style={{ maxHeight: '80dvh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-[#111111]">공지사항</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0F0F0]">
            <X size={15} className="text-[#888888]" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Bell size={32} className="text-[#C0C0C0]" />
          <p className="text-sm text-[#AAAAAA]">아직 공지사항이 없어요</p>
        </div>
      </div>
    </div>
  </>
);

// ── 설정 시트 ─────────────────────────────────────────────────
const SettingsSheet = ({ onClose }: { onClose: () => void }) => {
  const [soundOn, setSoundOn]         = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);

  useEffect(() => {
    Storage.getItem('setting_sound').then(v => { if (v !== null) setSoundOn(v !== 'off'); });
    Storage.getItem('setting_vibration').then(v => { if (v !== null) setVibrationOn(v !== 'off'); });
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    Storage.setItem('setting_sound', next ? 'on' : 'off');
  };

  const toggleVibration = () => {
    const next = !vibrationOn;
    setVibrationOn(next);
    Storage.setItem('setting_vibration', next ? 'on' : 'off');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70" onClick={onClose} />
      <div className="fixed bottom-0 z-[60] w-full" style={{ maxWidth: '28rem', left: '50%', transform: 'translateX(-50%)' }}>
        <div className="bg-white rounded-t-3xl px-5 pt-6 pb-28 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-[#111111]">앱 설정</p>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0F0F0]">
              <X size={15} className="text-[#888888]" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {/* 효과음 */}
            <div className="flex items-center justify-between bg-[#F0F0F0] rounded-2xl px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E5E5E5] flex items-center justify-center">
                  {soundOn
                    ? <Volume2 size={16} className="text-[#555555]" />
                    : <VolumeX size={16} className="text-[#AAAAAA]" />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">효과음</p>
                  <p className="text-xs text-[#AAAAAA]">퀴즈 정답/오답 효과음</p>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative ${soundOn ? 'bg-orange-500' : 'bg-[#D0D0D0]'}`}
              >
                <span className={`absolute left-0 top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${soundOn ? 'translate-x-[26px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

            {/* 진동 */}
            <div className="flex items-center justify-between bg-[#F0F0F0] rounded-2xl px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E5E5E5] flex items-center justify-center">
                  <span className={`text-base ${vibrationOn ? 'text-[#555555]' : 'text-[#AAAAAA]'}`}>📳</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">진동</p>
                  <p className="text-xs text-[#AAAAAA]">햅틱 피드백</p>
                </div>
              </div>
              <button
                onClick={toggleVibration}
                className={`w-12 h-6 rounded-full transition-colors relative ${vibrationOn ? 'bg-orange-500' : 'bg-[#D0D0D0]'}`}
              >
                <span className={`absolute left-0 top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${vibrationOn ? 'translate-x-[26px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── 로그아웃 확인 다이얼로그 ──────────────────────────────────
const LogoutDialog = ({ isGuest, onConfirm, onCancel }: { isGuest: boolean; onConfirm: () => void; onCancel: () => void }) => (
  <>
    <div className="fixed inset-0 z-50 bg-black/70" onClick={onCancel} />
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="bg-[#F0F0F0] rounded-3xl px-6 py-6 w-full flex flex-col gap-5" style={{ maxWidth: '22rem' }}>
        <div className="text-center">
          <p className="text-base font-bold text-[#111111] mb-2">로그아웃</p>
          {isGuest ? (
            <p className="text-sm text-[#555555] leading-relaxed">
              게스트 계정은 로그아웃 시<br />
              <span className="text-red-400 font-semibold">모든 학습 기록이 삭제</span>됩니다.<br />
              계속하시겠습니까?
            </p>
          ) : (
            <p className="text-sm text-[#555555] leading-relaxed">
              로그아웃하시겠습니까?<br />
              학습 기록은 서버에 저장되어 있습니다.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl bg-[#E5E5E5] text-sm font-bold text-[#555555] active:opacity-80"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl bg-red-500/20 text-sm font-bold text-red-400 active:opacity-80"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  </>
);

// ── 닉네임 변경 시트 ──────────────────────────────────────────
const NicknameSheet = ({
  currentNickname,
  onClose,
  onSave,
}: {
  currentNickname: string;
  onClose: () => void;
  onSave: (nickname: string) => Promise<{ error: string | null }>;
}) => {
  const [value, setValue] = useState(currentNickname);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const result = await onSave(value);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70" onClick={onClose} />
      <div className="fixed bottom-0 z-[60] w-full" style={{ maxWidth: '28rem', left: '50%', transform: 'translateX(-50%)' }}>
        <div className="bg-white rounded-t-3xl px-5 pt-6 pb-10 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-[#111111]">닉네임 변경</p>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0F0F0]">
              <X size={15} className="text-[#888888]" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className={`flex items-center gap-3 bg-[#F0F0F0] rounded-2xl px-4 py-3.5 transition-colors ${error ? 'ring-2 ring-red-400/50' : ''}`}>
              <input
                ref={inputRef}
                value={value}
                onChange={e => { setValue(e.target.value); setError(null); }}
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                maxLength={10}
                placeholder="닉네임 입력"
                className="flex-1 bg-transparent text-sm font-semibold text-[#111111] placeholder:text-[#AAAAAA] outline-none"
              />
              <span className="text-xs text-[#AAAAAA] shrink-0">{value.length}/10</span>
              {value.length > 0 && (
                <button onClick={() => { setValue(''); setError(null); }} className="w-5 h-5 flex items-center justify-center rounded-full bg-[#D0D0D0]">
                  <X size={10} className="text-white" />
                </button>
              )}
            </div>
            {error && <p className="text-xs text-red-400 font-medium px-1">{error}</p>}
          </div>

          <button
            onClick={handleSave}
            disabled={loading || value.trim().length === 0}
            className="w-full py-4 rounded-2xl bg-orange-500 text-white text-sm font-bold active:bg-orange-600 disabled:opacity-40 transition-colors"
          >
            {loading ? '확인 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </>
  );
};

// ── 메인 ──────────────────────────────────────────────────────
const MyPageScreen = () => {
  const { points, knownWords, attendanceDates, missions, checkIn } = useAppContext();
  const { user, isGuest, linkAccount, updateNickname, logout } = useAuth();
  const [showLinkSheet, setShowLinkSheet]         = useState(false);
  const [showNotice, setShowNotice]               = useState(false);
  const [showSettings, setShowSettings]           = useState(false);
  const [showLogoutDialog, setShowLogoutDialog]   = useState(false);
  const [showNicknameSheet, setShowNicknameSheet] = useState(false);

  const handleMenuClick = (label: string) => {
    if (label === '공지사항') setShowNotice(true);
    else if (label === '앱 설정') setShowSettings(true);
    else if (label === '로그아웃') setShowLogoutDialog(true);
  };

  const MENU_ITEMS = [
    { icon: Bell,     label: '공지사항', sub: '최신 소식을 확인하세요', danger: false },
    { icon: Settings, label: '앱 설정',  sub: '알림, 테마 등',         danger: false },
    ...(!isGuest ? [{ icon: LogOut, label: '로그아웃', sub: '', danger: true }] : []),
  ];

  return (
    <div className="flex flex-col h-full bg-[#F7F7F7] pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {showLinkSheet && (
        <GuestLinkSheet
          onClose={() => setShowLinkSheet(false)}
          onLink={(email) => { linkAccount(email); setShowLinkSheet(false); }}
        />
      )}
      {showNotice && <NoticeSheet onClose={() => setShowNotice(false)} />}
      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
      {showNicknameSheet && (
        <NicknameSheet
          currentNickname={user?.nickname ?? ''}
          onClose={() => setShowNicknameSheet(false)}
          onSave={updateNickname}
        />
      )}
      {showLogoutDialog && (
        <LogoutDialog
          isGuest={isGuest}
          onConfirm={logout}
          onCancel={() => setShowLogoutDialog(false)}
        />
      )}

      {/* 프로필 헤더 */}
      <div className="bg-white pt-12 px-5 pb-5">
        <h2 className="text-xl font-bold mb-5 text-[#111111]">마이페이지</h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center text-3xl border-2 border-orange-500/20 overflow-hidden shrink-0">
            <FallbackImage src="" alt="프로필" className="w-full h-full object-cover" fallbackNode={<span>🍊</span>} />
          </div>
          <div>
            <button
              onClick={() => setShowNicknameSheet(true)}
              className="flex items-center gap-1.5 group active:opacity-70"
            >
              <p className="font-bold text-[#111111] text-base">{user?.nickname ?? '예비슈퍼개미'}</p>
              <Pencil size={13} className="text-[#AAAAAA] group-active:text-orange-400" />
            </button>
            <div className="flex items-center gap-1.5 mt-1">
              <Trophy size={12} className="text-orange-400" />
              <span className="text-xs text-[#888888] font-medium">{CURRENT_LEAGUE_NAME} 리그</span>
            </div>
            {isGuest && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium text-[#AAAAAA] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F0F0F0' }}>
                <ShieldAlert size={10} className="text-[#AAAAAA]" /> 게스트 계정
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
          <div className="flex-1 bg-[#F0F0F0] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={13} className="text-[#AAAAAA] fill-current" />
              <span className="text-[11px] font-medium text-[#AAAAAA]">누적 포인트</span>
            </div>
            <p className="text-3xl font-bold text-[#111111]">
              {points.toLocaleString()}<span className="text-sm font-medium text-[#AAAAAA] ml-1">P</span>
            </p>
          </div>
          <div className="flex-1 bg-[#F0F0F0] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen size={13} className="text-[#AAAAAA]" />
              <span className="text-[11px] font-medium text-[#AAAAAA]">학습한 단어</span>
            </div>
            <p className="text-3xl font-bold text-[#111111]">
              {knownWords.length}<span className="text-sm font-medium text-[#AAAAAA] ml-1">개</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">
        {/* 출석 달력 */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold text-[#555555]">출석 현황</p>
            {missions.m1.current < missions.m1.target
              ? <button onClick={checkIn} className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold active:opacity-80">✋ 출석하기</button>
              : <span className="text-xs font-bold text-green-500">✅ 출석 완료</span>
            }
          </div>
          <AttendanceCalendar attendanceDates={attendanceDates} />
        </div>

        {/* 계정 연결 */}
        {user !== null && isGuest && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #FF8C42 0%, #F97316 100%)' }}>
            <div className="px-5 py-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert size={14} className="text-white/80" />
                <span className="text-[11px] font-semibold text-white/80">게스트 계정</span>
              </div>
              <p className="text-base font-bold text-white mb-2">학습 기록이 사라질 수 있어요</p>
              <p className="text-xs text-white/70 leading-relaxed" style={{ marginBottom: '1.5rem' }}>앱 삭제 또는 기기 변경 시 지금까지의<br />포인트와 학습 기록이 모두 초기화돼요.</p>
              <button
                onClick={() => setShowLinkSheet(true)}
                className="w-full py-3 rounded-xl bg-white text-orange-500 text-sm font-bold active:opacity-90"
              >
                이메일로 기록 저장하기
              </button>
            </div>
          </div>
        )}

        {/* 메뉴 */}
        <div>
          <div className="bg-white rounded-2xl overflow-hidden">
            <List>
              {MENU_ITEMS.map(({ icon: Icon, label, sub, danger }) => (
                <ListRow
                  key={label}
                  as="button"
                  border="none"
                  onClick={() => handleMenuClick(label)}
                  left={
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? 'bg-red-500/10' : 'bg-[#E5E5E5]'}`}>
                      <Icon size={16} className={danger ? 'text-red-400' : 'text-[#555555]'} />
                    </div>
                  }
                  contents={
                    sub
                      ? <ListRow.Texts type="2RowTypeA" top={<span className={danger ? 'text-red-400' : ''}>{label}</span>} bottom={<span className="text-[11px]">{sub}</span>} />
                      : <ListRow.Texts type="1RowTypeA" top={<span className={danger ? 'text-red-400' : ''}>{label}</span>} />
                  }
                  right={!danger ? <ChevronRight size={16} className="text-[#AAAAAA]" /> : undefined}
                />
              ))}
            </List>
          </div>
        </div>

        <Spacing size={4} />
        <p className="text-center text-[11px] text-[#AAAAAA] font-medium mb-2">머니터미 v1.0.0</p>
      </div>
    </div>
  );
};

export default MyPageScreen;
