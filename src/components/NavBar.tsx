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

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex justify-around pt-3 pb-safe-bottom z-50">
      <div className="flex w-full justify-around pb-6 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
              <span className={`text-[10px] mt-1.5 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
