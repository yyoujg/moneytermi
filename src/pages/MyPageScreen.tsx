import React from 'react';
import { Border, TextButton } from '@toss/tds-mobile';
import { useAppContext } from '../context/AppContext';

const MyPageScreen = () => {
  const { points, knownWords } = useAppContext();
  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="bg-white pt-12 px-6 pb-8 border-b border-gray-100 z-10">
        <h2 className="text-xl font-bold mb-6 text-gray-900">마이페이지</h2>
        <div className="flex space-x-3">
          <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
            <p className="text-[11px] text-gray-400 font-bold mb-1">누적 포인트</p>
            <p className="text-lg font-bold text-gray-900">{points}</p>
          </div>
          <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
            <p className="text-[11px] text-gray-400 font-bold mb-1">줍줍한 단어</p>
            <p className="text-lg font-bold text-gray-900">{knownWords.length}개</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <TextButton size="small">공지사항</TextButton>
        <Border className="my-2" />
        <TextButton size="small">앱 설정</TextButton>
        <Border className="my-2" />
        <TextButton size="small">로그아웃</TextButton>
      </div>
    </div>
  );
};

export default MyPageScreen;
