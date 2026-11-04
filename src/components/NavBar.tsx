import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSafeAreaInsets } from '../hooks/useSafeAreaInsets';
import { useAppContext } from '../context/AppContext';
import { Storage } from '../lib/storage';
import { weekStart } from '../lib/league';
import { House, ClipboardText, Trophy, User, type Icon } from '@phosphor-icons/react';

// 코스(패스)가 메인. /home은 경로를 그대로 두고 라벨만 퀘스트로 바꾼다 —
// 딥링크 allowlist와 푸시 랜딩이 /home을 쓰고 있어 경로를 바꾸면 같이 깨진다.
const NAV_ITEMS = [
  { path: '/course', icon: House, label: '홈' },
  { path: '/home', icon: ClipboardText, label: '퀘스트' },
  { path: '/league', icon: Trophy, label: '리그' },
  { path: '/my', icon: User, label: '마이' },
] satisfies { path: string; icon: Icon; label: string }[];

const SEEN_LEAGUE_WEEK_KEY = 'moneytermi_nav_seen_league_week_v1';

const NavBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const insets = useSafeAreaInsets();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { hydrated, missions, xp } = useAppContext();
  const [seenLeagueWeek, setSeenLeagueWeek] = useState<string | null>(null);

  const HIDDEN_PATHS = ['/quiz', '/lesson-check', '/lesson-intro', '/word-card', '/review', '/league/rules', '/welcome'];
  const hidden = HIDDEN_PATHS.some(p => pathname.startsWith(p));
  const currentLeagueWeek = String(weekStart());
  const hasQuestUpdate = hydrated && Object.values(missions).some(m => !m.isRewarded && m.current >= m.target);
  const hasLeagueUpdate = hydrated && seenLeagueWeek !== null && xp > 0 && seenLeagueWeek !== currentLeagueWeek && !pathname.startsWith('/league');
  const newByPath: Record<string, boolean> = {
    '/home': hasQuestUpdate && !pathname.startsWith('/home'),
    '/league': hasLeagueUpdate,
    // 마이 점은 뺐다. 새 배지는 획득 축하 창이 바로 알려준다
  };

  useEffect(() => {
    let cancelled = false;
    const loadSeenState = async () => {
      try {
        const leagueWeek = await Storage.getItem(SEEN_LEAGUE_WEEK_KEY);
        if (cancelled) return;
        setSeenLeagueWeek(leagueWeek ?? '');
      } catch {
        if (cancelled) return;
        setSeenLeagueWeek('');
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
      className="absolute bottom-0 w-full flex justify-center z-50 pointer-events-none"
      style={{ paddingBottom: 24 + insets.bottom }}
    >
      <div className="app-nav-tray flex w-[90%] max-w-[400px] items-stretch rounded-full px-4 py-2 border border-[var(--color-line)] pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          const hasNew = newByPath[item.path] ?? false;
          // 활성 탭은 진한 세이지(primary-strong) 채움 아이콘과 메뉴명, 나머지는 연한 회색 선형이다.
          const colorClass = isActive ? 'text-[var(--color-accent-foreground)]' : 'text-[var(--color-icon-inactive)]';
          const TabIcon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={hasNew ? `${item.label}, 새 내용 있음` : item.label}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1 pt-2 pb-2"
            >
              <div className={`relative w-12 h-8 flex items-center justify-center ${colorClass}`}>
                <TabIcon weight={isActive ? 'fill' : 'regular'} size={24} color="currentColor" aria-hidden="true" focusable="false" data-nav-icon={item.label} />
                {hasNew && (
                  <span aria-hidden="true" className="absolute right-2 top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--accent-brand)]" />
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
