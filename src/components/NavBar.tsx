import { useLayoutEffect, useRef } from 'react';
import { PenLine, Compass, ListChecks, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSafeAreaInsets } from '../hooks/useSafeAreaInsets';

// 코스(패스)가 메인. /home은 경로를 그대로 두고 라벨만 퀘스트로 바꾼다 —
// 딥링크 allowlist와 푸시 랜딩이 /home을 쓰고 있어 경로를 바꾸면 같이 깨진다.
const NAV_ITEMS = [
  { path: '/course', icon: Compass, label: '코스' },
  { path: '/home', icon: ListChecks, label: '퀘스트' },
  { path: '/review', icon: PenLine, label: '퀴즈' },
  { path: '/my', icon: User, label: '마이' },
];

const NavBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const insets = useSafeAreaInsets();
  const wrapRef = useRef<HTMLDivElement>(null);

  const HIDDEN_PATHS = ['/quiz', '/word-card', '/league/rules'];
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
      <div className="flex items-center gap-1 bg-[var(--color-card)] backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-[var(--color-line)] pointer-events-auto"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center px-2 py-2 transition-all duration-200"
            >
              <div className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${isActive ? 'bg-brand-500 text-white' : 'text-[var(--color-ink-4)]'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-3xs mt-1 transition-colors ${isActive ? 'font-bold text-brand-500' : 'font-medium text-[var(--color-ink-4)]'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
