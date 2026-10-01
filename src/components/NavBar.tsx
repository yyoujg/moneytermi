import { useLayoutEffect, useRef } from 'react';
import { Route, ListChecks, Trophy, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSafeAreaInsets } from '../hooks/useSafeAreaInsets';

// 코스(패스)가 메인. /home은 경로를 그대로 두고 라벨만 퀘스트로 바꾼다 —
// 딥링크 allowlist와 푸시 랜딩이 /home을 쓰고 있어 경로를 바꾸면 같이 깨진다.
const NAV_ITEMS = [
  { path: '/course', icon: Route, label: '학습' },
  { path: '/home', icon: ListChecks, label: '퀘스트' },
  { path: '/league', icon: Trophy, label: '리그' },
  { path: '/my', icon: User, label: '마이' },
];

const NavBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const insets = useSafeAreaInsets();
  const wrapRef = useRef<HTMLDivElement>(null);

  const HIDDEN_PATHS = ['/quiz', '/lesson-check', '/word-card', '/league/rules', '/welcome'];
  const hidden = HIDDEN_PATHS.some(p => pathname.startsWith(p));

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
      <div className="flex w-[calc(100%_-_32px)] max-w-[360px] items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-card)] px-3 py-2 pointer-events-auto"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (pathname === '/review' && item.path === '/home');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1.5 py-0.5 transition-all duration-[var(--dur-fast)] ease-soft"
            >
              <div className={`w-12 h-8 flex items-center justify-center rounded-full transition-all duration-[var(--dur-fast)] ease-soft ${isActive ? 'bg-brand-500 text-white' : 'text-[var(--color-ink-4)]'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-2xs leading-none font-bold ${isActive ? 'text-brand-ink' : 'text-[var(--color-ink-4)]'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
