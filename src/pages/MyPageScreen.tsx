import React, { useState, useEffect, useRef } from 'react';
import { Storage } from '../lib/storage';
import { BookOpen, Settings, LogOut, ChevronLeft, ChevronRight, Zap, Trophy, ShieldCheck, ShieldAlert, X, Volume2, VolumeX, Pencil } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';
import { CURRENT_LEAGUE_NAME } from '../constants';
import { List, ListRow, Spacing, Switch, BottomSheet, ConfirmDialog } from '@toss/tds-mobile';
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

// ── 앱 사용법 / FAQ 시트 ───────────────────────────────────────
const FAQ_ITEMS = [
  { q: '포인트는 어떻게 얻나요?', a: '퀴즈에서 정답을 맞히면 10~20P를 획득해요. 연속 정답 시 보너스 포인트가 붙어요!' },
  { q: '단어를 "알고 있어요" 표시하면?', a: '학습 완료로 기록되고 복습 리스트에 추가돼요. 체크 해제도 언제든지 가능해요.' },
  { q: '리그 순위는 어떻게 결정되나요?', a: '보유 포인트 순으로 순위가 정해져요. 매주 초기화되니 꾸준히 퀴즈를 풀어보세요.' },
  { q: '코스는 어떻게 구성돼 있나요?', a: '경제 카테고리별(거시경제, 금융, 주식/기업 등)로 묶인 단어 묶음이에요. 난이도순으로 학습해요.' },
  { q: '게스트 계정은 안전한가요?', a: '게스트 계정의 학습 기록은 이 기기에만 저장돼요. 이메일로 연결하면 어디서든 이어서 학습할 수 있어요.' },
  { q: '앱 사용법이 궁금해요', a: '홈 → 오늘 학습 시작 → 단어 카드 → 퀴즈 순서로 사용해보세요. 매일 출석하면 포인트도 받아요!' },
];

const GuideSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700 }}>앱 사용법 & FAQ</span>}>
    <div className="px-5 pb-6 flex flex-col gap-3">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="bg-[#F7F7F7] rounded-2xl px-4 py-4">
          <p className="text-sm font-bold text-[#111111] mb-1.5">Q. {item.q}</p>
          <p className="text-xs text-[#666666] leading-relaxed">{item.a}</p>
        </div>
      ))}
    </div>
  </BottomSheet>
);

// ── 이모지 피커 시트 ───────────────────────────────────────────
const EMOJI_OPTIONS = ['😊','🥰','😎','🤓','🧠','🦁','🐼','🐻','🦊','🐯','🌟','🎯','🎮','🚀','💎','🔥','🍀','🎸','🏆','⚡'];

const EmojiPickerSheet = ({ open, current, onSelect, onClose }: { open: boolean; current: string; onSelect: (e: string) => void; onClose: () => void }) => (
  <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700 }}>프로필 이모지 선택</span>}>
    <div className="px-5 pb-6">
      <div className="grid grid-cols-5 gap-3">
        {EMOJI_OPTIONS.map(emoji => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            className={`w-full aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all
              ${current === emoji ? 'bg-orange-500/15 ring-2 ring-orange-500' : 'bg-[#F0F0F0] active:bg-[#E5E5E5]'}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  </BottomSheet>
);

// ── 설정 시트 ─────────────────────────────────────────────────
const SettingsSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
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
    <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700 }}>앱 설정</span>}>
      <div className="px-5 pb-6 flex flex-col gap-2">
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
          <Switch checked={soundOn} onChange={toggleSound} />
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
          <Switch checked={vibrationOn} onChange={toggleVibration} />
        </div>
      </div>
    </BottomSheet>
  );
};


// ── 닉네임 변경 시트 ──────────────────────────────────────────
const NicknameSheet = ({
  open,
  currentNickname,
  onClose,
  onSave,
}: {
  open: boolean;
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
    <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700 }}>닉네임 변경</span>} hasTextField>
      <div className="px-5 pb-6 flex flex-col gap-5">
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
    </BottomSheet>
  );
};

// ── 메인 ──────────────────────────────────────────────────────
const MyPageScreen = () => {
  const { points, knownWords, attendanceDates, missions, checkIn, myEmoji, updateMyEmoji } = useAppContext();
  const { user, isGuest, linkAccount, updateNickname, logout } = useAuth();
  const [showLinkSheet, setShowLinkSheet]         = useState(false);
  const [showGuide, setShowGuide]                 = useState(false);
  const [showSettings, setShowSettings]           = useState(false);
  const [showLogoutDialog, setShowLogoutDialog]   = useState(false);
  const [showNicknameSheet, setShowNicknameSheet] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker]     = useState(false);

  const handleMenuClick = (label: string) => {
    if (label === '앱 사용법') setShowGuide(true);
    else if (label === '앱 설정') setShowSettings(true);
    else if (label === '로그아웃') setShowLogoutDialog(true);
  };

  const handleCheckIn = async () => {
    await checkIn();
    toast.success('📅 오늘 출석 완료! +10P');
  };

  const MENU_ITEMS = [
    { icon: BookOpen, label: '앱 사용법', sub: '사용법 및 자주 묻는 질문', danger: false },
    { icon: Settings, label: '앱 설정',  sub: '알림, 테마 등',            danger: false },
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
      <GuideSheet open={showGuide} onClose={() => setShowGuide(false)} />
      <EmojiPickerSheet
        open={showEmojiPicker}
        current={myEmoji}
        onSelect={updateMyEmoji}
        onClose={() => setShowEmojiPicker(false)}
      />
      <SettingsSheet open={showSettings} onClose={() => setShowSettings(false)} />
      <NicknameSheet
        open={showNicknameSheet}
        currentNickname={user?.nickname ?? ''}
        onClose={() => setShowNicknameSheet(false)}
        onSave={updateNickname}
      />
      <ConfirmDialog open={showLogoutDialog}>
        <ConfirmDialog.Title>로그아웃</ConfirmDialog.Title>
        <ConfirmDialog.Description>
          {isGuest ? (
            <>
              게스트 계정은 로그아웃하면<br />
              <span className="text-red-400 font-semibold">모든 학습 기록이 삭제</span>돼요.<br />
              계속할까요?
            </>
          ) : (
            <>로그아웃할까요?<br />학습 기록은 서버에 저장돼 있어요.</>
          )}
        </ConfirmDialog.Description>
        <ConfirmDialog.CancelButton onClick={() => setShowLogoutDialog(false)}>취소</ConfirmDialog.CancelButton>
        <ConfirmDialog.ConfirmButton onClick={() => { logout(); setShowLogoutDialog(false); }} color="danger">로그아웃</ConfirmDialog.ConfirmButton>
      </ConfirmDialog>

      {/* 프로필 헤더 */}
      <div className="bg-white pt-4 px-5 pb-5">
        <h2 className="text-xl font-bold mb-5 text-[#111111]">마이페이지</h2>
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="relative w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center text-3xl border-2 border-orange-500/20 shrink-0 active:opacity-70"
          >
            <span>{myEmoji}</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <Pencil size={9} className="text-white" />
            </div>
          </button>
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
              ? <button onClick={handleCheckIn} className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold active:opacity-80">✋ 출석하기</button>
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
