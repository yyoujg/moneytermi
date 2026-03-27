import React from 'react';
import { PenLine, Compass, Home, Trophy, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/home', icon: Home, label: '홈' },
  { path: '/course', icon: Compass, label: '코스' },
  { path: '/league', icon: Trophy, label: '리그' },
  { path: '/review', icon: PenLine, label: '퀴즈' },
  { path: '/my', icon: User, label: 'MY' },
];

const NavBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const HIDDEN_PATHS = ['/swipe', '/quiz', '/course/words', '/word-card', '/league/rules'];
  if (HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null;

  return (
    <div className="absolute bottom-0 w-full flex justify-center pb-6 z-50 pointer-events-none">
      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-lg pointer-events-auto"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center px-4 py-2 rounded-full transition-colors ${isActive ? 'bg-[#EEEEEE] text-[#111111]' : 'text-[#999999]'}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
