import { useEffect, useRef, useState } from 'react';
import { Settings, ChevronRight, Pencil, CircleHelp } from 'lucide-react';
import { StreakIcon, XpIcon, PointIcon, WordsIcon } from '../components/StatIcons';
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
  // 배지 기울이기: 격자 위 손가락 위치(또는 기기 기울기)를 -1~1로 바꿔 CSS 변수로만 넘긴다(다시 그리지 않음)
  const [spin, setSpin] = useState<Record<string, number>>({});
  const tiltRef = useRef<HTMLDivElement>(null);
  const setTilt = (tx: number, ty: number, on: boolean) => {
    const el = tiltRef.current; if (!el) return;
    el.style.setProperty('--tx', tx.toFixed(3)); el.style.setProperty('--ty', ty.toFixed(3)); el.style.setProperty('--tilt', on ? '1' : '0');
  };
  const onTiltMove = (e: React.PointerEvent) => {
    const r = tiltRef.current?.getBoundingClientRect(); if (!r) return;
    setTilt(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1, true);
  };
  const onTiltReset = () => setTilt(0, 0, false);
  useEffect(() => {
    // 안드로이드는 권한 없이 기울기 이벤트가 온다. iOS는 권한 창이 필요해 여기선 쓰지 않는다(손가락으로만)
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      setTilt(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30)), true);
    };
    window.addEventListener('deviceorientation', onTilt);
    return () => window.removeEventListener('deviceorientation', onTilt);
  }, []);

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
              <Pencil size={13} className="text-[var(--color-ink-4)] group-active:text-brand-ink" />
            </button>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm">{stage.emoji}</span>
              <span className="text-xs font-bold text-[var(--color-ink-3)]">{stage.name}</span>
            </div>
          </div>
        </div>

        {/* 한눈에 보기 — 연속 학습일 / XP / 포인트 / 학습한 단어 */}
        <Card tone="surface" pad="md" className="anim-fade-up">
          <div className="flex items-stretch">
            {[
              { icon: <StreakIcon size={14} />, label: '연속 학습', value: streak, unit: '일' },
              { icon: <XpIcon size={14} />, label: 'XP', value: xp.toLocaleString(), unit: '' },
              { icon: <PointIcon size={14} />, label: '포인트', value: points.toLocaleString(), unit: 'P' },
              { icon: <WordsIcon size={15} />, label: '학습한 단어', value: knownWords.length, unit: '개' },
            ].map((it, i, arr) => (
              <div key={it.label} className={`flex-1 flex flex-col items-center gap-1 ${i < arr.length - 1 ? 'border-r border-[var(--color-line)]' : ''}`}>
                <div className="flex items-center gap-1">
                  {it.icon}
                  <span className="text-3xs font-medium text-[var(--color-ink-4)] whitespace-nowrap">{it.label}</span>
                </div>
                <p className="text-base font-semibold leading-tight text-[var(--color-ink)]">
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
            {/* 손가락을 대고 움직이거나(또는 기기를 기울이면) 받은 배지들이 그쪽으로 기울고 빛이 흐른다. 받은 배지를 누르면 한 바퀴 돈다 */}
            <div ref={tiltRef} className="grid grid-cols-5 gap-y-4 touch-pan-y" onPointerMove={onTiltMove} onPointerLeave={onTiltReset} onPointerUp={onTiltReset} onPointerCancel={onTiltReset}>
              {badges.map((b, i) => (
                <div key={b.id} className="flex flex-col items-center gap-1 anim-pop-in" style={{ '--i': i } as React.CSSProperties}>
                  <button
                    type="button"
                    disabled={!b.earned}
                    aria-label={b.title}
                    onClick={() => setSpin(s => ({ ...s, [b.id]: (s[b.id] ?? 0) + 1 }))}
                    className="relative w-11 h-11 flex items-center justify-center text-xl overflow-hidden disabled:pointer-events-none"
                    style={{
                      borderRadius: 9999,
                      background: b.earned ? 'var(--color-brand-soft)' : 'var(--color-surface)',
                      filter: b.earned ? 'none' : 'grayscale(1)',
                      opacity: b.earned ? 1 : 0.45,
                      ...(b.earned ? {
                        transform: 'perspective(300px) rotateX(calc(var(--ty, 0) * -18deg)) rotateY(calc(var(--tx, 0) * 18deg))',
                        transition: 'transform var(--dur-base) var(--ease-soft)',
                      } : {}),
                    }}
                  >
                    <span key={spin[b.id] ?? 0} className={spin[b.id] ? 'anim-flip inline-block' : 'inline-block'}>{b.icon}</span>
                    {b.earned && (
                      <>
                        {/* 처음 한 번 훑는 빛 + 기울기를 따라 움직이는 빛 */}
                        <span aria-hidden className="absolute inset-0 anim-shine pointer-events-none" style={{ '--i': i } as React.CSSProperties} />
                        <span aria-hidden className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.55) 50%, transparent 62%)',
                            backgroundSize: '250% 100%',
                            backgroundPosition: 'calc(50% - var(--tx, 0) * 60%) 0',
                            opacity: 'calc(var(--tilt, 0))',
                            transition: 'opacity var(--dur-base) ease-out, background-position var(--dur-base) var(--ease-soft)',
                          }} />
                      </>
                    )}
                  </button>
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
                  contents={<ListRow.Texts type="2RowTypeA" top={<span className="text-sm font-semibold">{label}</span>} bottom={<span className="block mt-1! text-3xs">{sub}</span>} />}
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
