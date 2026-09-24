import { useState } from 'react';
import { BookOpen, Settings, ChevronRight, Zap, Flame, Sparkles, Pencil, CircleHelp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { DEFAULT_NICKNAME, getGrowthStage } from '../constants';
import { calcStreak } from '../lib/streak';
import { buildBadges } from '../lib/badges';
import { List, ListRow } from '@toss/tds-mobile';
import { useAuth } from '../hooks/useAuth';
import { GuideSheet } from '../components/mypage/GuideSheet';
import { EmojiPickerSheet } from '../components/mypage/EmojiPickerSheet';
import { SettingsSheet } from '../components/mypage/SettingsSheet';
import { NicknameSheet } from '../components/mypage/NicknameSheet';
import { Card } from '../components/ui/Card';
import { IconBox } from '../components/ui/IconBox';

const MyPageScreen = () => {
  const { points, xp, knownWords, attendanceDates, myEmoji, updateMyEmoji } = useAppContext();
  const stage = getGrowthStage(xp);
  const streak = calcStreak(attendanceDates);
  const badges = buildBadges({ words: knownWords.length, streak, xp });

  const earned = badges.filter(b => b.earned).length;
  const { user, updateNickname } = useAuth();
  const [showGuide, setShowGuide]                 = useState(false);
  const [showSettings, setShowSettings]           = useState(false);
  const [showNicknameSheet, setShowNicknameSheet] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker]     = useState(false);

  const handleMenuClick = (label: string) => {
    if (label === '앱 사용법') setShowGuide(true);
    else if (label === '앱 설정') setShowSettings(true);
  };

  const MENU_ITEMS = [
    { icon: CircleHelp, label: '앱 사용법', sub: '사용법 및 자주 묻는 질문' },
    { icon: Settings,   label: '앱 설정',  sub: '알림, 테마 등' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas)] pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
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

      {/* 프로필 헤더 */}
      <div className="bg-[var(--color-card)] pt-4 px-5 pb-5">
        <h2 className="text-xl font-bold mb-4! text-[var(--color-ink)]">마이페이지</h2>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setShowEmojiPicker(true)}
            aria-label="아바타 변경"
            className="relative w-16 h-16 bg-[var(--color-surface)] flex items-center justify-center text-3xl shrink-0 active:opacity-70"
            style={{ borderRadius: 9999 }}
          >
            <span>{myEmoji}</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
              <Pencil size={9} className="text-white" />
            </div>
          </button>
          <div>
            <button
              onClick={() => setShowNicknameSheet(true)}
              aria-label="닉네임 변경"
              className="flex items-center gap-1.5 group active:opacity-70"
            >
              <p className="font-bold text-[var(--color-ink)] text-base">{user?.nickname ?? DEFAULT_NICKNAME}</p>
              <Pencil size={13} className="text-[var(--color-ink-4)] group-active:text-brand-400" />
            </button>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm">{stage.emoji}</span>
              <span className="text-xs font-bold text-[var(--color-ink-3)]">{stage.name}</span>
            </div>
          </div>
        </div>

        {/* 한눈에 보기 — 연속 학습일 / XP / 포인트 / 학습한 단어 */}
        <Card tone="surface" pad="md">
          <div className="flex items-stretch">
            {[
              { icon: <Flame size={14} className="text-brand-500 fill-current" />, label: '연속 학습', value: streak, unit: '일' },
              { icon: <Sparkles size={14} className="text-brand-500" />, label: 'XP', value: xp.toLocaleString(), unit: '' },
              { icon: <Zap size={14} className="text-brand-500 fill-current" />, label: '포인트', value: points.toLocaleString(), unit: 'P' },
              { icon: <BookOpen size={14} className="text-brand-500" />, label: '학습한 단어', value: knownWords.length, unit: '개' },
            ].map((it, i, arr) => (
              <div key={it.label} className={`flex-1 flex flex-col items-center gap-1 ${i < arr.length - 1 ? 'border-r border-[var(--color-line)]' : ''}`}>
                <div className="flex items-center gap-1">
                  {it.icon}
                  <span className="text-3xs font-medium text-[var(--color-ink-4)] whitespace-nowrap">{it.label}</span>
                </div>
                <p className="text-base font-bold text-[var(--color-ink)] leading-tight">
                  {it.value}<span className="text-2xs font-medium text-[var(--color-ink-4)] ml-0.5">{it.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </Card>

      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">
        {/* 배지 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[var(--color-ink-2)]">배지</p>
            <span className="text-2xs font-medium text-[var(--color-ink-4)]">{earned} / {badges.length}</span>
          </div>
          <Card pad="md">
            <div className="grid grid-cols-5 gap-y-4">
              {badges.map(b => (
                <div key={b.id} className="flex flex-col items-center gap-1">
                  <div
                    className="w-11 h-11 flex items-center justify-center text-xl"
                    style={{
                      borderRadius: 9999,
                      background: b.earned ? 'var(--color-brand-soft)' : 'var(--color-surface)',
                      filter: b.earned ? 'none' : 'grayscale(1)',
                      opacity: b.earned ? 1 : 0.45,
                    }}
                  >
                    {b.icon}
                  </div>
                  <span className={`text-3xs text-center leading-tight ${b.earned ? 'font-bold text-[var(--color-ink-2)]' : 'text-[var(--color-ink-4)]'}`}>
                    {b.title}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 메뉴 */}
        <div>
          <Card pad="none" className="overflow-hidden">
            <List>
              {MENU_ITEMS.map(({ icon: Icon, label, sub }) => (
                <ListRow
                  key={label}
                  as="button"
                  border="none"
                  onClick={() => handleMenuClick(label)}
                  left={
                    <IconBox className="rounded-chip bg-[var(--color-line)]">
                      <Icon size={16} className="text-[var(--color-ink-2)]" />
                    </IconBox>
                  }
                  contents={<ListRow.Texts type="2RowTypeA" top={label} bottom={<span className="text-2xs">{sub}</span>} />}
                  right={<ChevronRight size={16} className="text-[var(--color-ink-4)]" />}
                />
              ))}
            </List>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyPageScreen;
