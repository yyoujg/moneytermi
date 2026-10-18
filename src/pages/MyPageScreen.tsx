import { useState } from 'react';
import { PointIcon, StreakIcon, WordsIcon, XpIcon } from '../components/StatIcons';
import { ChevronRight, CircleHelp, Settings } from '../components/ui/OtterIcons';
import { useAppContext } from '../context/AppContext';
import { DEFAULT_NICKNAME } from '../constants';
import { calcStreak } from '../lib/streak';
import { buildBadges } from '../lib/badges';
import { BadgeGlyph } from '../components/mypage/BadgeGlyph';
import { List, ListRow } from '@toss/tds-mobile';
import { useAuth } from '../hooks/useAuth';
import { GuideSheet } from '../components/mypage/GuideSheet';
import { EmojiPickerSheet } from '../components/mypage/EmojiPickerSheet';
import { SettingsSheet } from '../components/mypage/SettingsSheet';
import { NicknameSheet } from '../components/mypage/NicknameSheet';
import { ProfileHeader } from '../components/mypage/ProfileHeader';
import { Card } from '../components/ui/Card';
import { IconBox } from '../components/ui/IconBox';

const MENU_ITEMS = [
  { icon: CircleHelp, label: '앱 사용법', sub: '사용법 및 자주 묻는 질문' },
  { icon: Settings, label: '앱 설정', sub: '알림, 테마 등' },
];

const MyPageScreen = () => {
  const { points, xp, knownWords, viewedIds, attendanceDates, myEmoji, updateMyEmoji } = useAppContext();
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

  return (
    <div className="my-page-screen flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
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
      <div className="my-page-hero shrink-0 pt-4 px-5 pb-5">
        <h2 className="text-xl font-bold mb-4! text-[var(--color-ink)]">마이페이지</h2>
        <ProfileHeader
          nickname={user?.nickname ?? DEFAULT_NICKNAME}
          emoji={myEmoji}
          xp={xp}
          onEditAvatar={() => setShowEmojiPicker(true)}
          onEditNickname={() => setShowNicknameSheet(true)}
        />

        <Card pad="lg" className="my-page-stats anim-fade-up">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {[
              { label: '살펴본 용어', value: viewedIds.size.toLocaleString(), unit: '개', icon: <WordsIcon size={16} /> },
              { label: '연속 학습', value: streak.toLocaleString(), unit: '일', icon: <StreakIcon size={16} /> },
              { label: '경험치', value: xp.toLocaleString(), unit: 'XP', icon: <XpIcon size={16} /> },
              { label: '조개', value: points.toLocaleString(), unit: '개', icon: <PointIcon size={18} /> },
            ].map(it => (
              <div key={it.label} className="min-w-0">
                <p className="flex min-h-[18px] items-center gap-1.5 text-xs font-medium text-[var(--color-ink-3)]">{it.icon}{it.label}</p>
                <p className="mt-1.5! text-2xl font-semibold leading-tight tabular-nums text-[var(--color-ink)]">
                  {it.value}<span className="ml-1 text-xs font-medium text-[var(--color-ink-3)]">{it.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </Card>

      </div>

      <div className="shrink-0 px-5 pt-5 flex flex-col gap-4">
        {/* 배지 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[var(--color-ink-2)]">배지</p>
            <span className="text-2xs font-medium text-[var(--color-ink-4)]">{earned} / {badges.length}</span>
          </div>
          <Card pad="md">
            <div className="grid grid-cols-5 gap-y-4">
              {badges.map((b, i) => (
                <div key={b.id} className="flex flex-col items-center gap-1 anim-pop-in" style={{ '--i': i } as React.CSSProperties}>
                  <BadgeGlyph id={b.id} size={52} earned={b.earned} />
                  <span className={`min-h-7 text-2xs text-center leading-snug break-keep ${b.earned ? 'font-semibold text-[var(--color-ink-2)]' : 'text-[var(--color-ink-3)]'}`}>
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
                  className="w-full"
                  onClick={() => handleMenuClick(label)}
                  left={
                    <IconBox className="text-[var(--color-ink-3)]">
                      <Icon size={21} strokeWidth={1.7} aria-hidden="true" />
                    </IconBox>
                  }
                  contents={<ListRow.Texts type="2RowTypeA" top={<span className="text-sm font-semibold">{label}</span>} bottom={<span className="block mt-1! text-2xs text-[var(--color-ink-3)]">{sub}</span>} />}
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
