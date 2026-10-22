import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LibraryBig, ListChecks, ChartNoAxesColumnIncreasing, UserRound } from './ui/OtterIcons';
import { useSafeAreaInsets } from '../hooks/useSafeAreaInsets';
import { useAppContext } from '../context/AppContext';
import { Storage } from '../lib/storage';
import { earnedCount } from '../lib/badges';
import { calcStreak } from '../lib/streak';
import { weekStart } from '../lib/league';

// 코스(패스)가 메인. /home은 경로를 그대로 두고 라벨만 퀘스트로 바꾼다 —
// 딥링크 allowlist와 푸시 랜딩이 /home을 쓰고 있어 경로를 바꾸면 같이 깨진다.
const NAV_ITEMS = [
  { path: '/course', icon: LibraryBig, label: '홈' },
  { path: '/home', icon: ListChecks, label: '퀘스트' },
  { path: '/league', icon: ChartNoAxesColumnIncreasing, label: '리그' },
  { path: '/my', icon: UserRound, label: '마이' },
];

const SEEN_LEAGUE_WEEK_KEY = 'moneytermi_nav_seen_league_week_v1';
const SEEN_BADGE_COUNT_KEY = 'moneytermi_nav_seen_badge_count_v1';

const NavBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const insets = useSafeAreaInsets();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { hydrated, missions, xp, knownWords, attendanceDates } = useAppContext();
  const [seenLeagueWeek, setSeenLeagueWeek] = useState<string | null>(null);
  const [seenBadgeCount, setSeenBadgeCount] = useState<number | null>(null);

  const HIDDEN_PATHS = ['/quiz', '/lesson-check', '/word-card', '/review', '/league/rules', '/welcome'];
  const hidden = HIDDEN_PATHS.some(p => pathname.startsWith(p));
  const currentLeagueWeek = String(weekStart());
  const earnedBadgeCount = useMemo(
    () => earnedCount({ words: knownWords.length, streak: calcStreak(attendanceDates), xp }),
    [attendanceDates, knownWords.length, xp],
  );
  const hasQuestUpdate = hydrated && Object.values(missions).some(m => !m.isRewarded && m.current >= m.target);
  const hasLeagueUpdate = hydrated && seenLeagueWeek !== null && xp > 0 && seenLeagueWeek !== currentLeagueWeek && !pathname.startsWith('/league');
  const hasMyUpdate = hydrated && seenBadgeCount !== null && earnedBadgeCount > seenBadgeCount && !pathname.startsWith('/my');
  const newByPath: Record<string, boolean> = {
    '/home': hasQuestUpdate && !pathname.startsWith('/home'),
    '/league': hasLeagueUpdate,
    '/my': hasMyUpdate,
  };

  useEffect(() => {
    let cancelled = false;
    const loadSeenState = async () => {
      try {
        const [leagueWeek, badgeCount] = await Promise.all([
          Storage.getItem(SEEN_LEAGUE_WEEK_KEY),
          Storage.getItem(SEEN_BADGE_COUNT_KEY),
        ]);
        if (cancelled) return;
        setSeenLeagueWeek(leagueWeek ?? '');
        setSeenBadgeCount(Math.max(0, Number(badgeCount ?? '0') || 0));
      } catch {
        if (cancelled) return;
        setSeenLeagueWeek('');
        setSeenBadgeCount(0);
      }
    };
    void loadSeenState();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (seenLeagueWeek === null || !pathname.startsWith('/league') || seenLeagueWeek === currentLeagueWeek) return;
    let cancelled = false;
    const markSeen = async () => {
      await Storage.setItem(SEEN_LEAGUE_WEEK_KEY, currentLeagueWeek).catch(() => undefined);
      if (!cancelled) setSeenLeagueWeek(currentLeagueWeek);
    };
    void markSeen();
    return () => { cancelled = true; };
  }, [currentLeagueWeek, pathname, seenLeagueWeek]);

  useEffect(() => {
    if (seenBadgeCount === null || !pathname.startsWith('/my') || earnedBadgeCount <= seenBadgeCount) return;
    let cancelled = false;
    const markSeen = async () => {
      await Storage.setItem(SEEN_BADGE_COUNT_KEY, String(earnedBadgeCount)).catch(() => undefined);
      if (!cancelled) setSeenBadgeCount(earnedBadgeCount);
    };
    void markSeen();
    return () => { cancelled = true; };
  }, [earnedBadgeCount, pathname, seenBadgeCount]);

  // NavBar가 화면 하단에서 차지하는 높이(알약 + 하단 여백 + safe area)를 --nav-height로 공개.
  // 화면들은 pb-nav(index.css)로 이 값만큼 하단 패딩을 확보한다.
  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    document.documentElement.style.setProperty('--nav-height', `${wrapRef.current.offsetHeight}px`);
  }, [hidden, insets.bottom]);

  if (hidden) return null;

  return (
    <div
      ref={wrapRef}
      className="app-nav-tray absolute bottom-0 w-full flex z-50 border-t border-[var(--color-line)]"
      style={{ paddingBottom: insets.bottom }}
    >
      <div className="flex w-full items-stretch">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const hasNew = newByPath[item.path] ?? false;
          const Icon = item.icon;
          const colorClass = isActive ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-3)]';
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={hasNew ? `${item.label}, 새 내용 있음` : item.label}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1 pt-2 pb-2"
            >
              <div className="relative w-12 h-8 flex items-center justify-center">
                <Icon size={24} aria-hidden="true" className={colorClass} />
                {hasNew && (
                  <span aria-hidden="true" className="absolute right-2 top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--accent-rose)]" />
                )}
              </div>
              <span className={`text-xs leading-none ${isActive ? 'font-bold' : 'font-medium'} ${colorClass}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
