import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STAT_COLOR } from '../components/StatIcons';
import { ChevronRight } from '../components/ui/OtterIcons';
import { useAppContext } from '../context/AppContext';
import { DEFAULT_NICKNAME, getGrowthStage } from '../constants';
import { StageIcon } from '../components/StageGlyph';
import { calcStreak } from '../lib/streak';
import { buildBadges } from '../lib/badges';
import { BadgeGlyph } from '../components/mypage/BadgeGlyph';
import { List, ListRow } from '@toss/tds-mobile';
import { useAuth } from '../hooks/useAuth';
import { GuideSheet } from '../components/mypage/GuideSheet';
import { SettingsSheet } from '../components/mypage/SettingsSheet';
import { NicknameSheet } from '../components/mypage/NicknameSheet';
import { ProfileHeader } from '../components/mypage/ProfileHeader';
import { ProfileAvatarSheet } from '../components/mypage/ProfileAvatarSheet';
import { WeekStrip } from '../components/home/WeekStrip';
import { Card } from '../components/ui/Card';

const MENU_ITEMS = ['앱 사용법', '앱 설정'];

const MyPageScreen = () => {
  const { xp, leagueStage, knownWords, viewedIds, attendanceDates, myEmoji, updateMyEmoji } = useAppContext();
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const navigate = useNavigate();
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
      <ProfileAvatarSheet open={showAvatarSheet} nickname={user?.nickname ?? DEFAULT_NICKNAME} current={myEmoji}
        onClose={() => setShowAvatarSheet(false)} onSelect={value => { void updateMyEmoji(value); }} />
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
          avatar={myEmoji}
          onEditAvatar={() => setShowAvatarSheet(true)}
          onEditNickname={() => setShowNicknameSheet(true)}
        />

        <Card pad="lg" className="my-page-stats anim-fade-up" aria-labelledby="my-stats-title">
          <h3 id="my-stats-title" className="type-section-title mb-3">학습 기록</h3>
          <div className="my-page-stats-grid">
            {/* 통계 아이콘은 수달 3색 그림(public/icons/stat) */}
            {[
              { icon: <img src="/icons/stat/icon-terms.svg" alt="" width={24} height={24} data-stat-icon="terms" />, color: STAT_COLOR.words, label: '살펴본 용어', value: viewedIds.size.toLocaleString(), unit: '개' },
              { icon: <img src="/icons/stat/icon-streak.svg" alt="" width={24} height={24} data-stat-icon="streak" />, color: STAT_COLOR.streak, label: '연속 학습', value: streak.toLocaleString(), unit: '일' },
              { icon: <img src="/icons/stat/icon-xp.svg" alt="" width={24} height={24} data-stat-icon="xp" />, color: STAT_COLOR.xp, label: '경험치', value: xp.toLocaleString(), unit: 'XP' },
              // 리그 등급도 같은 통계 줄에 둔다(그림 + 이름). 승급 조건은 리그 안내 시트에만 쓴다
              { icon: <StageIcon id={leagueStage ?? 1} />, color: undefined, label: '리그 등급', value: getGrowthStage(leagueStage ?? 1).name, unit: '리그' },
            ].map(it => (
              // 긴 값은 열 전체를 사용한다. 숫자를 줄이거나 반올림하지 않는다.
              <div key={it.label} className={`my-page-stat${it.value.length > 7 ? ' is-wide' : ''}`}>
                {it.icon}
                {/* 이름은 아이콘으로 알 수 있어 화면에서 숨기고 스크린리더용으로만 둔다 */}
                <span className="my-page-stat-label sr-only">{it.label}</span>
                <span className="my-page-stat-value" style={{ color: it.color }}><span data-stat-number>{it.value}</span><span className="my-page-stat-unit">{it.unit}</span></span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      <div className="my-page-sections shrink-0 px-5">
        {/* 이번 주 학습 칸(홈에서 옮겨 왔다). 연속 일수는 위 통계에 있어 제목에서 반복하지 않는다 */}
        <section aria-labelledby="my-streak-title" className="my-page-panel my-streak">
          <h3 id="my-streak-title" className="type-section-title mb-3">이번 주 학습</h3>
          <WeekStrip attendanceDates={attendanceDates} />
        </section>

        {/* 배지 */}
        <section aria-labelledby="my-badges-title" className="my-page-panel">
          <div className="flex items-center justify-between mb-3">
            <h3 id="my-badges-title" className="type-section-title">배지 <span className="text-xs font-normal text-[var(--color-ink-3)]">{earned} / {badges.length}</span></h3>
            <button type="button" onClick={() => navigate('/my/badges')} className="inline-flex min-h-11 items-center gap-1 text-xs text-[var(--color-ink-3)] active:opacity-70" aria-label="배지 전체 보기">더보기<ChevronRight size={16} aria-hidden="true" /></button>
          </div>
          {/* 마이에는 받은 배지(높은 단계부터)를 먼저, 그다음 가까운 목표 순으로 한 줄(5개)만. 전체는 더보기 */}
          <ul aria-label="배지 목록" className="my-page-badges grid grid-cols-5 gap-x-1 gap-y-4">
            {[...badges.filter(b => b.earned).reverse(), ...badges.filter(b => !b.earned).sort((a, b) => b.progress - a.progress)].slice(0, 5).map(b => (
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
              {MENU_ITEMS.map(label => (
                <ListRow
                  key={label}
                  as="button"
                  border="none"
                  className="w-full"
                  onClick={() => handleMenuClick(label)}
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
