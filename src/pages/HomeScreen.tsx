import React, { useState, useEffect } from 'react';
import { closeView } from '@apps-in-toss/web-framework';
import { ChevronRight, Zap, Flame, BookOpen, PenLine, X } from 'lucide-react';
import { Badge, TextButton } from '@toss/tds-mobile';
import { useNavigate } from 'react-router-dom';
import type { Mission, Missions } from '../types';
import { CURRENT_LEAGUE_NAME } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import GuestLinkSheet from '../components/GuestLinkSheet';

// 주간 학습 바 차트
const WeeklyBarChart = ({ attendanceDates }: { attendanceDates: string[] }) => {
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const today = new Date();
  const todayDay = today.getDay();
  const mondayOffset = (todayDay === 0 ? -6 : 1 - todayDay);
  const attendSet = new Set(attendanceDates);

  const week = days.map((label, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    const dateStr = d.toISOString().slice(0, 10);
    const isAttended = attendSet.has(dateStr);
    const isFuture = d > today;
    const isToday = i === (todayDay === 0 ? 6 : todayDay - 1);
    const count = isAttended ? [4, 6, 3, 7, 5, 8, 2][i] : 0;
    return { label, count, isToday, isFuture, isAttended };
  });

  const maxVal = Math.max(...week.map(d => d.count), 1);

  return (
    <div>
      <div className="flex items-end justify-between gap-1.5 mb-2" style={{ height: 56 }}>
        {week.map(({ label, count, isToday, isFuture }) => (
          <div key={label} className="flex-1 flex flex-col items-center">
            <div className="w-full flex items-end justify-center" style={{ height: 48 }}>
              <div
                className={`w-full rounded-t transition-all duration-700 ${
                  isToday ? 'bg-orange-500' : count > 0 ? 'bg-[#E5E5E5]' : 'bg-[#F0F0F0]'
                } ${isFuture ? 'opacity-30' : ''}`}
                style={{ height: count > 0 ? `${(count / maxVal) * 48}px` : '4px' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-1.5">
        {week.map(({ label, isToday }) => (
          <div key={label} className={`flex-1 text-center text-[10px] font-medium ${isToday ? 'text-orange-500' : 'text-[#AAAAAA]'}`}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

const HomeScreen = () => {
  const navigate = useNavigate();

  // 홈 화면에서 뒤로가기 → 미니앱 종료
  useEffect(() => {
    const handlePopState = () => { closeView(); };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const { points, knownWords, missions, claimReward, attendanceDates, otherLeagueUsers, courses, allWords, myEmoji } = useAppContext();
  const { isGuest, linkAccount, user } = useAuth();
  const [showLinkSheet, setShowLinkSheet] = useState(false);
  const [linkDismissed, setLinkDismissed] = useState(false);
  const totalWords = allWords.length;

  // 연속 출석일
  const streak = (() => {
    const today = new Date();
    let count = 0;
    const s = new Set(attendanceDates);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (s.has(d.toISOString().slice(0, 10))) count++;
      else break;
    }
    return count;
  })();

  // 오늘 목표 (m2: 학습, m3: 퀴즈)
  const m2 = missions.m2;
  const m3 = missions.m3;
  const todayDone = (m2.current >= m2.target ? 1 : 0) + (m3.current >= m3.target ? 1 : 0);
  const todayTotal = 2;

  // 리그 순위 계산
  const myRank = (() => {
    const league = [...otherLeagueUsers, { id: 'me', points }].sort((a, b) => b.points - a.points);
    return league.findIndex(u => u.id === 'me') + 1;
  })();

  // 이어서 시작할 코스 (가장 진행중인 것)
  const nextCourse = courses.find(c => {
    const known = c.words.filter(w => knownWords.some(kw => kw.id === w.id)).length;
    return known < c.words.length;
  }) ?? courses[0];

  // 퀴즈 대상 단어
  const quizWords = knownWords.length > 0
    ? [...knownWords].sort(() => Math.random() - 0.5).slice(0, 5)
    : [];

  // 게스트 유도 트리거: 3일 연속 출석 OR 포인트 100P 달성
  const showGuestNudge = isGuest && !linkDismissed && (streak >= 3 || points >= 100);

  return (
    <div className="flex flex-col h-full pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ backgroundColor: '#F7F7F7' }}>
      {showLinkSheet && (
        <GuestLinkSheet
          onClose={() => { setShowLinkSheet(false); setLinkDismissed(true); }}
          onLink={(email) => { linkAccount(email); setLinkDismissed(true); }}
        />
      )}

      {/* 헤더 */}
      <div className="pt-12 px-5 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="inline-flex items-center px-2 py-1 rounded mb-2" style={{ backgroundColor: '#F0F0F0' }}>
              <span className="text-[11px] font-medium text-[#AAAAAA]">{CURRENT_LEAGUE_NAME} 리그</span>
            </div>
            <h1 className="text-xl font-bold text-[#111111]">안녕하세요, {user?.nickname ?? '예비슈퍼개미'}님</h1>
          </div>
          <div className="w-10 h-10 bg-[#F0F0F0] rounded-full flex items-center justify-center overflow-hidden shrink-0">
            <span className="text-lg">{myEmoji}</span>
          </div>
        </div>

        {/* 게스트 계정 연결 유도 */}
        {showGuestNudge && (
          <div className="relative rounded-2xl px-4 pt-3 pb-4 mb-3" style={{ backgroundColor: 'rgba(249,115,22,0.08)' }}>
            <button
              onClick={() => setLinkDismissed(true)}
              className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full bg-[#E5E5E5] active:opacity-70 opacity-40"
            >
              <X size={12} className="text-[#AAAAAA]" />
            </button>
            <p className="text-base font-bold text-orange-400 pr-8 mb-0.5">🔥 {points}P + {myRank}위 유지</p>
            <p className="text-xs text-[#AAAAAA]">⚠️ 삭제하면 전부 사라져요</p>
            <div className="h-5" />
            <button
              onClick={() => setShowLinkSheet(true)}
              className="w-full py-2.5 rounded-xl bg-orange-500 text-xs font-bold text-white active:opacity-90"
            >
              🔥 지금 저장하기
            </button>
          </div>
        )}

        {/* 오늘 목표 카드 (핵심 CTA) */}
        <div className="bg-white rounded-2xl p-5 mb-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-[#AAAAAA]">오늘 목표</p>
            <span className="text-xs font-bold text-orange-500">{todayDone}/{todayTotal} 완료</span>
          </div>

          <div className="flex gap-3 mb-5">
            {/* 학습 목표 */}
            <div className={`flex-1 rounded-xl p-3 ${m2.current >= m2.target ? 'bg-orange-500/10' : 'bg-[#F0F0F0]'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen size={13} className={m2.current >= m2.target ? 'text-orange-500' : 'text-[#AAAAAA]'} />
                <span className="text-[11px] font-medium text-[#AAAAAA]">단어 학습</span>
              </div>
              <p className="text-lg font-bold text-[#111111]">
                {m2.current >= m2.target ? '완료' : '0'}
                <span className="text-xs text-[#AAAAAA] ml-1">/{m2.target}회</span>
              </p>
            </div>
            {/* 퀴즈 목표 */}
            <div className={`flex-1 rounded-xl p-3 ${m3.current >= m3.target ? 'bg-orange-500/10' : 'bg-[#F0F0F0]'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <PenLine size={13} className={m3.current >= m3.target ? 'text-orange-500' : 'text-[#AAAAAA]'} />
                <span className="text-[11px] font-medium text-[#AAAAAA]">퀴즈 정답</span>
              </div>
              <p className="text-lg font-bold text-[#111111]">
                {m3.current}
                <span className="text-xs text-[#AAAAAA] ml-1">/{m3.target}회</span>
              </p>
            </div>
          </div>

          {/* 압박 텍스트 */}
          {todayDone < todayTotal && (() => {
            const remainP = Object.values(missions).filter(m => !m.isRewarded && m.current < m.target).reduce((s, m) => s + m.reward, 0);
            const estimatedRank = (() => {
              const league = [...otherLeagueUsers, { id: 'me', points: points + remainP }].sort((a, b) => b.points - a.points);
              return league.findIndex(u => u.id === 'me') + 1;
            })();
            return (
              <div className="rounded-xl px-3 py-3 mb-3 flex flex-col gap-1.5" style={{ backgroundColor: 'rgba(249,115,22,0.08)' }}>
                <p className="text-xs font-bold text-orange-400">
                  🔥 지금 하면 +{remainP}P (현재 {myRank}위 → {estimatedRank}위)
                </p>
                <p className="text-[11px] text-[#888888]">
                  ⏰ 자정에 초기화 — 오늘 안 하면 기회 사라짐
                </p>
              </div>
            );
          })()}

          {/* 단일 CTA */}
          <div className="flex flex-col" style={{ gap: 12 }}>
            <button
              onClick={() => navigate('/word-card', { state: { words: nextCourse.words, index: 0, backPath: '/home', autoAdvance: true } })}
              className="w-full py-4 rounded-2xl bg-orange-500 text-white text-sm font-bold active:opacity-90 flex items-center justify-center gap-2"
            >
              오늘 학습 시작하기
              <ChevronRight size={16} />
            </button>

            {quizWords.length > 0 && (
              <button
                onClick={() => navigate('/quiz', { state: { quizQueue: quizWords } })}
                className="w-full py-3 rounded-xl bg-[#F0F0F0] text-xs font-medium text-[#888888] active:opacity-70"
              >
                퀴즈 풀기 →
              </button>
            )}
          </div>
        </div>

        {/* 빠른 통계 */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
            <Zap size={14} className="text-[#AAAAAA] fill-current shrink-0" />
            <div>
              <p className="text-[10px] text-[#AAAAAA]">포인트</p>
              <p className="text-base font-bold text-[#111111] whitespace-nowrap">{points.toLocaleString()}<span className="text-xs text-[#AAAAAA] ml-0.5">P</span></p>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
            <Flame size={14} className="text-[#AAAAAA] shrink-0" />
            <div>
              <p className="text-[10px] text-[#AAAAAA]">연속 출석</p>
              <p className="text-base font-bold text-[#111111] whitespace-nowrap">{streak}<span className="text-xs text-[#AAAAAA] ml-0.5">일</span></p>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
            <BookOpen size={14} className="text-[#AAAAAA] shrink-0" />
            <div>
              <p className="text-[10px] text-[#AAAAAA]">학습 단어</p>
              <p className="text-base font-bold text-[#111111] whitespace-nowrap">{knownWords.length}<span className="text-xs text-[#AAAAAA] ml-0.5">/{totalWords}</span></p>
            </div>
          </div>
        </div>

        {/* 주간 바 차트 */}
        <div className="bg-white rounded-2xl px-5 pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[#111111]">이번 주</p>
          </div>
          <WeeklyBarChart attendanceDates={attendanceDates} />
        </div>
      </div>

      {/* 코스 + 미션 */}
      <div className="px-5 flex flex-col gap-5">
        {/* 코스 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-[#555555]">코스</h2>
            <TextButton size="small" onClick={() => navigate('/course')}>
              <span className="whitespace-nowrap flex items-center text-[#AAAAAA]">전체보기 <ChevronRight size={13} /></span>
            </TextButton>
          </div>
          <div className="flex flex-col gap-2.5">
            {courses.slice(0, 2).map((course) => {
              const courseKnownCount = course.words.filter((w) => knownWords.some((kw) => kw.id === w.id)).length;
              const progressPct = Math.round((courseKnownCount / course.words.length) * 100);
              return (
                <div
                  key={course.id}
                  onClick={() => navigate('/word-card', { state: { words: course.words, index: 0, backPath: '/home', autoAdvance: true } })}
                  className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-4 active:opacity-80 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded text-[#AAAAAA]" style={{ backgroundColor: '#F0F0F0' }}>{course.level}</span>
                      <h3 className="text-sm font-bold text-[#111111] truncate">{course.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#F0F0F0] rounded-full h-1 overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full" style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-orange-500 shrink-0 whitespace-nowrap">{progressPct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 미션 */}
        <div className="bg-white rounded-2xl p-5 mb-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-[#555555]">오늘의 미션</h2>
            <span className="text-[11px] font-medium text-[#AAAAAA]">자정 초기화</span>
          </div>

          {/* 핵심 미션: 퀴즈 3문제 */}
          <div className={`rounded-2xl p-4 mb-3 ${m3.isRewarded ? 'bg-[#F0F0F0]' : m3.current >= m3.target ? 'bg-orange-500/10' : 'bg-[#F0F0F0]'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className={`text-sm font-bold ${m3.isRewarded ? 'text-[#AAAAAA] line-through' : 'text-[#111111]'}`}>
                  {m3.title}
                </p>
                <p className="text-xs text-[#AAAAAA] mt-0.5">+{m3.reward}P</p>
              </div>
              {m3.isRewarded
                ? <Badge color="elephant" size="small" variant="fill">완료</Badge>
                : m3.current >= m3.target
                ? <button onClick={() => claimReward('m3')} className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold active:bg-orange-600">받기</button>
                : <span className="text-lg font-bold text-[#111111]">{m3.current}<span className="text-sm text-[#AAAAAA]">/{m3.target}</span></span>
              }
            </div>
            {/* 진행 바 */}
            <div className="flex gap-1">
              {Array.from({ length: m3.target }).map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < m3.current ? 'bg-orange-500' : 'bg-[#E5E5E5]'}`} />
              ))}
            </div>
          </div>

          {/* 보조 미션 */}
          <div className="flex flex-col gap-0">
            {([missions.m1, missions.m2] as Mission[]).map((mission, idx) => {
              const isCompleted = mission.current >= mission.target;
              return (
                <div key={mission.id} className={`flex justify-between items-center py-3 ${idx === 0 ? 'border-b border-[#E5E5E5]' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                      mission.isRewarded ? 'bg-orange-500 text-white' : isCompleted ? 'bg-orange-500/20 text-orange-500' : 'bg-[#F0F0F0] text-[#AAAAAA]'
                    }`}>
                      {(mission.isRewarded || isCompleted) ? '✓' : ''}
                    </div>
                    <span className={`text-xs font-medium ${mission.isRewarded ? 'text-[#AAAAAA] line-through' : 'text-[#555555]'}`}>
                      {mission.title}
                    </span>
                  </div>
                  {mission.isRewarded
                    ? <span className="text-[11px] text-[#AAAAAA]">+{mission.reward}P</span>
                    : isCompleted
                    ? <button onClick={() => claimReward(mission.id as keyof Missions)} className="px-2.5 py-1 rounded-lg bg-orange-500 text-white text-[11px] font-bold active:bg-orange-600">받기</button>
                    : <span className="text-[11px] text-[#AAAAAA]">+{mission.reward}P</span>
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
