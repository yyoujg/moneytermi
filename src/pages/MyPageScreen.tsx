import { useState } from 'react';
import { StreakIcon, WordsIcon, XpIcon, STAT_COLOR } from '../components/StatIcons';
import { ChevronRight, CircleHelp, Settings } from '../components/ui/OtterIcons';
import { useAppContext } from '../context/AppContext';
import { DEFAULT_NICKNAME } from '../constants';
import { calcStreak } from '../lib/streak';
import { buildBadges } from '../lib/badges';
import { BadgeGlyph } from '../components/mypage/BadgeGlyph';
import { List, ListRow } from '@toss/tds-mobile';
import { useAuth } from '../hooks/useAuth';
import { GuideSheet } from '../components/mypage/GuideSheet';
import { SettingsSheet } from '../components/mypage/SettingsSheet';
import { NicknameSheet } from '../components/mypage/NicknameSheet';
import { ProfileHeader } from '../components/mypage/ProfileHeader';
import { Card } from '../components/ui/Card';
import { IconBox } from '../components/ui/IconBox';

const MENU_ITEMS = [
  { icon: CircleHelp, label: '앱 사용법' },
  { icon: Settings, label: '앱 설정' },
];

const MyPageScreen = () => {
  const { xp, knownWords, viewedIds, attendanceDates } = useAppContext();
  const streak = calcStreak(attendanceDates);
  const badges = buildBadges({ words: knownWords.length, streak, xp });

  const earned = badges.filter(b => b.earned).length;
  const { user, updateNickname } = useAuth();
  const [showGuide, setShowGuide]                 = useState(false);
  const [showSettings, setShowSettings]           = useState(false);
  const [showNicknameSheet, setShowNicknameSheet] = useState(false);

  const handleMenuClick = (label: string) => {
    if (label === '앱 사용법') setShowGuide(true);
    else if (label === '앱 설정') setShowSettings(true);
  };

  return (
    <div className="my-page-screen flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <GuideSheet open={showGuide} onClose={() => setShowGuide(false)} />
      <SettingsSheet open={showSettings} onClose={() => setShowSettings(false)} />
      <NicknameSheet
        open={showNicknameSheet}
        currentNickname={user?.nickname ?? ''}
        onClose={() => setShowNicknameSheet(false)}
        onSave={updateNickname}
      />

      {/* 프로필 헤더 */}
      <div className="my-page-hero shrink-0 pt-4 px-5 pb-5">
        <h2 className="type-page-title mb-4!">마이페이지</h2>
        <ProfileHeader
          nickname={user?.nickname ?? DEFAULT_NICKNAME}
          xp={xp}
          onEditNickname={() => setShowNicknameSheet(true)}
        />

        <Card pad="lg" className="my-page-stats anim-fade-up">
          <div className="my-page-stats-grid">
            {[
              { icon: <WordsIcon size={24} />, color: STAT_COLOR.words, label: '살펴본 용어', value: viewedIds.size.toLocaleString(), unit: '개' },
              { icon: <StreakIcon size={24} />, color: STAT_COLOR.streak, label: '연속 학습', value: streak.toLocaleString(), unit: '일' },
              { icon: <XpIcon size={24} />, color: STAT_COLOR.xp, label: '경험치', value: xp.toLocaleString(), unit: 'XP' },
            ].map(it => (
              // 긴 값은 열 전체를 사용한다. 숫자를 줄이거나 반올림하지 않는다.
              <div key={it.label} className={`my-page-stat${it.value.length > 7 ? ' is-wide' : ''}`}>
                {it.icon}
                <span className="my-page-stat-label">{it.label}</span>
                <span className="my-page-stat-value" style={{ color: it.color }}><span data-stat-number>{it.value}</span><span className="my-page-stat-unit">{it.unit}</span></span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      <div className="my-page-sections shrink-0 px-5">
        {/* 배지 */}
        <section aria-labelledby="my-badges-title" className="my-page-panel">
          <div className="flex items-center justify-between mb-3">
            <h3 id="my-badges-title" className="type-section-title">배지</h3>
            <span className="text-xs text-[var(--color-ink-3)]">획득 {earned} / {badges.length}</span>
          </div>
          <ul aria-label="배지 목록" className="my-page-badges grid grid-cols-5 gap-x-1 gap-y-4">
            {badges.map(b => (
              <li key={b.id} className="flex min-w-0 flex-col items-center gap-1">
                <BadgeGlyph id={b.id} size={44} earned={b.earned} />
                <span className={`text-2xs text-center leading-snug break-keep ${b.earned ? 'text-[var(--color-ink-2)]' : 'text-[var(--color-ink-3)]'}`}>
                  {b.title}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* 메뉴 */}
        <div className="my-page-panel my-page-menu">
            <List>
              {MENU_ITEMS.map(({ icon: Icon, label }) => (
                <ListRow
                  key={label}
                  as="button"
                  border="none"
                  className="w-full"
                  onClick={() => handleMenuClick(label)}
                  left={
                    <IconBox className="text-[var(--color-ink-2)]">
                      <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                    </IconBox>
                  }
                  contents={<span className="text-sm font-semibold">{label}</span>}
                  right={<ChevronRight size={16} className="text-[var(--color-ink-4)]" />}
                />
              ))}
            </List>
        </div>
      </div>
    </div>
  );
};

export default MyPageScreen;
