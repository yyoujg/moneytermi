import { useState } from 'react';
import { BookOpen, Settings, LogOut, ChevronRight, Zap, ShieldAlert, Pencil } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';
import { getGrowthStage } from '../constants';
import { List, ListRow, Spacing, ConfirmDialog } from '@toss/tds-mobile';
import { useAuth } from '../hooks/useAuth';
import { AttendanceCalendar } from '../components/mypage/AttendanceCalendar';
import { GuideSheet } from '../components/mypage/GuideSheet';
import { EmojiPickerSheet } from '../components/mypage/EmojiPickerSheet';
import { SettingsSheet } from '../components/mypage/SettingsSheet';
import { NicknameSheet } from '../components/mypage/NicknameSheet';
import { Card } from '../components/ui/Card';
import { IconBox } from '../components/ui/IconBox';

const MyPageScreen = () => {
  const { points, knownWords, attendanceDates, missions, checkIn, myEmoji, updateMyEmoji } = useAppContext();
  const stage = getGrowthStage(points);
  const { user, isGuest, updateNickname, logout } = useAuth();
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
    <div className="flex flex-col h-full bg-[var(--color-canvas)] pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
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
      <ConfirmDialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        title={<ConfirmDialog.Title>로그아웃</ConfirmDialog.Title>}
        description={
          <ConfirmDialog.Description>
            {isGuest ? (
              <>
                게스트 계정은 로그아웃하면<br />
                <span className="text-danger-400 font-semibold">모든 학습 기록이 삭제</span>돼요.<br />
                계속할까요?
              </>
            ) : (
              <>로그아웃할까요?<br />학습 기록은 서버에 저장돼 있어요.</>
            )}
          </ConfirmDialog.Description>
        }
        cancelButton={<ConfirmDialog.CancelButton onClick={() => setShowLogoutDialog(false)}>취소</ConfirmDialog.CancelButton>}
        confirmButton={<ConfirmDialog.ConfirmButton onClick={() => { logout(); setShowLogoutDialog(false); }} color="danger">로그아웃</ConfirmDialog.ConfirmButton>}
      />

      {/* 프로필 헤더 */}
      <div className="bg-[var(--color-card)] pt-4 px-5 pb-5">
        <h2 className="text-xl font-bold mb-4 text-[var(--color-ink)]">마이페이지</h2>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="relative w-16 h-16 bg-[var(--color-surface)] rounded-full flex items-center justify-center text-3xl shrink-0 active:opacity-70"
          >
            <span>{myEmoji}</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
              <Pencil size={9} className="text-white" />
            </div>
          </button>
          <div>
            <button
              onClick={() => setShowNicknameSheet(true)}
              className="flex items-center gap-1.5 group active:opacity-70"
            >
              <p className="font-bold text-[var(--color-ink)] text-base">{user?.nickname ?? '예비슈퍼개미'}</p>
              <Pencil size={13} className="text-[var(--color-ink-4)] group-active:text-brand-400" />
            </button>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs">{stage.emoji}</span>
              <span className="text-xs text-[var(--color-ink-3)] font-medium">{stage.name} 단계</span>
            </div>
            {isGuest && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-3xs font-medium text-[var(--color-ink-4)] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface)' }}>
                <ShieldAlert size={10} className="text-[var(--color-ink-4)]" /> 게스트 계정
              </span>
            )}
          </div>
        </div>

        {/* 통계 */}
        <div className="flex gap-3">
          <Card tone="surface" pad="md" className="flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={13} className="text-[var(--color-ink-4)] fill-current" />
              <span className="text-2xs font-medium text-[var(--color-ink-4)]">누적 포인트</span>
            </div>
            <p className="text-3xl font-bold text-[var(--color-ink)]">
              {points.toLocaleString()}<span className="text-sm font-medium text-[var(--color-ink-4)] ml-1">P</span>
            </p>
          </Card>
          <Card tone="surface" pad="md" className="flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen size={13} className="text-[var(--color-ink-4)]" />
              <span className="text-2xs font-medium text-[var(--color-ink-4)]">학습한 단어</span>
            </div>
            <p className="text-3xl font-bold text-[var(--color-ink)]">
              {knownWords.length}<span className="text-sm font-medium text-[var(--color-ink-4)] ml-1">개</span>
            </p>
          </Card>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">
        {/* 출석 달력 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[var(--color-ink-2)]">출석 현황</p>
            {missions.m1.current < missions.m1.target
              ? <button onClick={handleCheckIn} className="flex items-center gap-1 px-3.5 py-1.5 rounded-button bg-brand-500 text-white text-xs font-bold active:opacity-80">✋ 출석하기</button>
              : <span className="text-xs font-bold text-success-500">✅ 출석 완료</span>
            }
          </div>
          <AttendanceCalendar attendanceDates={attendanceDates} />
        </div>

        {/* 메뉴 */}
        <div>
          <Card pad="none" className="overflow-hidden">
            <List>
              {MENU_ITEMS.map(({ icon: Icon, label, sub, danger }) => (
                <ListRow
                  key={label}
                  as="button"
                  border="none"
                  onClick={() => handleMenuClick(label)}
                  left={
                    <IconBox className={`rounded-chip ${danger ? 'bg-danger-500/10' : 'bg-[var(--color-line)]'}`}>
                      <Icon size={16} className={danger ? 'text-danger-400' : 'text-[var(--color-ink-2)]'} />
                    </IconBox>
                  }
                  contents={
                    sub
                      ? <ListRow.Texts type="2RowTypeA" top={<span className={danger ? 'text-danger-400' : ''}>{label}</span>} bottom={<span className="text-2xs">{sub}</span>} />
                      : <ListRow.Texts type="1RowTypeA" top={<span className={danger ? 'text-danger-400' : ''}>{label}</span>} />
                  }
                  right={!danger ? <ChevronRight size={16} className="text-[var(--color-ink-4)]" /> : undefined}
                />
              ))}
            </List>
          </Card>
        </div>

        <Spacing size={4} />
        <p className="text-center text-2xs text-[var(--color-ink-4)] font-medium mb-2">머니터미 v1.0.0</p>
      </div>
    </div>
  );
};

export default MyPageScreen;
