import React, { useState } from 'react';
import { Post, Paragraph, SegmentedControl } from '@toss/tds-mobile';
import { useAppContext } from '../context/AppContext';

const ReviewScreen = () => {
  const { knownWords, unknownWords } = useAppContext();
  const [activeTab, setActiveTab] = useState('unknown');
  return (
    <div className="flex flex-col h-full bg-white relative pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="pt-12 px-6 bg-white z-10 sticky top-0 border-b border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-900">나의 복습장</h2>
        <SegmentedControl value={activeTab} onChange={(v) => setActiveTab(v)} size="small">
          <SegmentedControl.Item value="unknown">헷갈리는 단어 {unknownWords.length}</SegmentedControl.Item>
          <SegmentedControl.Item value="known">줍줍한 단어 {knownWords.length}</SegmentedControl.Item>
        </SegmentedControl>
      </div>
      <div className="flex-1 p-6 bg-gray-50/50">
        {(activeTab === 'unknown' ? unknownWords : knownWords).map((word, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 mb-4 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{word.word}</h3>
            <Paragraph.Text typography="t7" className="text-orange-500 font-bold mb-2 block">{word.meaning}</Paragraph.Text>
            <Post.Paragraph typography="t6" className="text-gray-600 mb-4">{word.detailedMeaning}</Post.Paragraph>
            <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-500 border border-gray-100 leading-snug break-keep">
              <span className="font-bold text-gray-400 mb-1 block">뉴스 활용 예시</span>
              <Post.Paragraph typography="t7">"{word.newsExample}"</Post.Paragraph>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewScreen;
