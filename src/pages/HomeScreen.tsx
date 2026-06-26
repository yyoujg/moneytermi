import { ChevronRight, Zap, Flame, BookOpen, PenLine, RotateCcw } from 'lucide-react';
import { Badge, TextButton } from '@toss/tds-mobile';
import { useNavigate } from 'react-router-dom';
import type { Mission, Missions } from '../types';
import { CURRENT_LEAGUE_NAME } from '../constants';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { useAuth } from '../hooks/useAuth';
import { calculateRank } from '../utils/league';
import { WeeklyBarChart } from '../components/home/WeeklyBarChart';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { points, knownWords, knownIds, missions, claimReward, attendanceDates, otherLeagueUsers, courses, allWords, dueQueue, myEmoji } = useAppContext();
  const { user } = useAuth();
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

  // 오늘 목표 (m3: 퀴즈)
  const m3 = missions.m3;
  const todayDone = m3.current >= m3.target ? 1 : 0;
  const todayTotal = 1;

  // 리그 순위 계산
  const myRank = calculateRank(otherLeagueUsers, points);

  // 이어서 시작할 코스 (가장 진행중인 것)
  const nextCourse = courses.find(c => {
    const known = c.words.filter(w => knownIds.has(w.id)).length;
    return known < c.words.length;
  }) ?? courses[0];

  // 퀴즈 대상 단어
  const quizWords = knownWords.length > 0
    ? [...knownWords].sort(() => Math.random() - 0.5).slice(0, 5)
    : [];

  return (
    <div className="flex flex-col h-full pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ backgroundColor: 'var(--color-canvas)' }}>

      {/* 헤더 */}
      <div className="pt-4 px-5 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="inline-flex items-center px-2 py-1 rounded mb-2" style={{ backgroundColor: 'var(--color-surface)' }}>
              <span className="text-[11px] font-medium text-[var(--color-ink-4)]">{CURRENT_LEAGUE_NAME} 리그</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--color-ink)]">안녕하세요, {user?.nickname ?? '예비슈퍼개미'}님</h1>
          </div>
          <div className="w-10 h-10 bg-[var(--color-surface)] rounded-full flex items-center justify-center overflow-hidden shrink-0">
            <span className="text-lg">{myEmoji}</span>
          </div>
        </div>

        {/* 오늘 목표 카드 (핵심 CTA) */}
        <div className="bg-[var(--color-card)] rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[var(--color-ink-4)]">오늘 목표</p>
            <span className="text-xs font-bold text-orange-500">{todayDone}/{todayTotal} 완료</span>
          </div>

          <div className="flex gap-3 mb-4">
            {/* 퀴즈 목표 */}
            <div className={`flex-1 rounded-xl p-3 ${m3.current >= m3.target ? 'bg-orange-500/10' : 'bg-[var(--color-surface)]'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <PenLine size={13} className={m3.current >= m3.target ? 'text-orange-500' : 'text-[var(--color-ink-4)]'} />
                <span className="text-[11px] font-medium text-[var(--color-ink-4)]">퀴즈 정답</span>
              </div>
              <p className="text-lg font-bold text-[var(--color-ink)]">
                {m3.current}
                <span className="text-xs text-[var(--color-ink-4)] ml-1">/{m3.target}회</span>
              </p>
            </div>
          </div>

          {/* 압박 텍스트 */}
          {todayDone < todayTotal && (() => {
            const remainP = Object.values(missions).filter(m => !m.isRewarded && m.current < m.target).reduce((s, m) => s + m.reward, 0);
            const estimatedRank = calculateRank(otherLeagueUsers, points + remainP);
            return (
              <div className="rounded-xl px-3 py-3 mb-3 flex flex-col gap-1.5" style={{ backgroundColor: 'var(--color-brand-soft)' }}>
                <p className="text-xs font-bold text-orange-400">
                  🔥 지금 하면 +{remainP}P (현재 {myRank}위 → {estimatedRank}위)
                </p>
                <p className="text-[11px] text-[var(--color-ink-3)]">
                  ⏰ 자정에 초기화 — 오늘 안 하면 기회 사라짐
                </p>
              </div>
            );
          })()}

          {/* 단일 CTA */}
          <div className="flex flex-col" style={{ gap: 12 }}>
            <button
              onClick={() => { logClick('course_start', { course_id: nextCourse.id, title: nextCourse.title }); navigate('/word-card', { state: { words: nextCourse.words, index: 0, backPath: '/home', autoAdvance: true } }); }}
              className="w-full py-4 rounded-2xl bg-orange-500 text-white text-sm font-bold active:opacity-90 flex items-center justify-center gap-2"
            >
              오늘 학습 시작하기
              <ChevronRight size={16} />
            </button>

            {quizWords.length > 0 && (
              <button
                onClick={() => navigate('/quiz', { state: { quizQueue: quizWords } })}
                className="w-full py-3 rounded-xl bg-[var(--color-surface)] text-xs font-medium text-[var(--color-ink-3)] active:opacity-70"
              >
                퀴즈 풀기 →
              </button>
            )}
          </div>
        </div>

        {/* 오늘 복습 카드 */}
        {dueQueue.length > 0 && (
          <button
            onClick={() => { logClick('review_start', { count: dueQueue.length }); navigate('/review'); }}
            className="w-full bg-[var(--color-card)] rounded-2xl p-4 mb-4 flex items-center justify-between active:opacity-80"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <RotateCcw size={16} className="text-orange-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[var(--color-ink)]">오늘 복습할 단어 {dueQueue.length}개</p>
                <p className="text-[11px] text-[var(--color-ink-4)]">기억이 흐려지기 전에 복습해요</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--color-ink-4)]" />
          </button>
        )}

        {/* 빠른 통계 */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-[var(--color-card)] rounded-2xl px-4 py-3 flex items-center gap-3">
            <Zap size={14} className="text-[var(--color-ink-4)] fill-current shrink-0" />
            <div>
              <p className="text-[10px] text-[var(--color-ink-4)]">포인트</p>
              <p className="text-base font-bold text-[var(--color-ink)] whitespace-nowrap">{points.toLocaleString()}<span className="text-xs text-[var(--color-ink-4)] ml-0.5">P</span></p>
            </div>
          </div>
          <div className="flex-1 bg-[var(--color-card)] rounded-2xl px-4 py-3 flex items-center gap-3">
            <Flame size={14} className="text-[var(--color-ink-4)] shrink-0" />
            <div>
              <p className="text-[10px] text-[var(--color-ink-4)]">연속 출석</p>
              <p className="text-base font-bold text-[var(--color-ink)] whitespace-nowrap">{streak}<span className="text-xs text-[var(--color-ink-4)] ml-0.5">일</span></p>
            </div>
          </div>
          <div className="flex-1 bg-[var(--color-card)] rounded-2xl px-4 py-3 flex items-center gap-3">
            <BookOpen size={14} className="text-[var(--color-ink-4)] shrink-0" />
            <div>
              <p className="text-[10px] text-[var(--color-ink-4)]">학습 단어</p>
              <p className="text-base font-bold text-[var(--color-ink)] whitespace-nowrap">{knownWords.length}<span className="text-xs text-[var(--color-ink-4)] ml-0.5">/{totalWords}</span></p>
            </div>
          </div>
        </div>

        {/* 주간 바 차트 */}
        <div className="bg-[var(--color-card)] rounded-2xl px-5 pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[var(--color-ink)]">이번 주</p>
          </div>
          <WeeklyBarChart attendanceDates={attendanceDates} />
        </div>
      </div>

      {/* 코스 + 미션 */}
      <div className="px-5 flex flex-col gap-4">
        {/* 코스 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-[var(--color-ink-2)]">코스</h2>
            <TextButton size="small" onClick={() => navigate('/course')}>
              <span className="whitespace-nowrap flex items-center text-[var(--color-ink-4)]">전체보기 <ChevronRight size={13} /></span>
            </TextButton>
          </div>
          <div className="flex flex-col gap-2.5">
            {courses.slice(0, 2).map((course) => {
              const courseKnownCount = course.words.filter((w) => knownIds.has(w.id)).length;
              const progressPct = Math.round((courseKnownCount / course.words.length) * 100);
              return (
                <div
                  key={course.id}
                  onClick={() => navigate('/word-card', { state: { words: course.words, index: 0, backPath: '/home', autoAdvance: true } })}
                  className="bg-[var(--color-card)] rounded-2xl px-4 py-3.5 flex items-center gap-4 active:opacity-80 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded text-[var(--color-ink-4)]" style={{ backgroundColor: 'var(--color-surface)' }}>{course.level}</span>
                      <h3 className="text-sm font-bold text-[var(--color-ink)] truncate">{course.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[var(--color-surface)] rounded-full h-1 overflow-hidden">
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
        <div className="bg-[var(--color-card)] rounded-2xl p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-[var(--color-ink-2)]">오늘의 미션</h2>
            <span className="text-[11px] font-medium text-[var(--color-ink-4)]">자정 초기화</span>
          </div>

          {/* 핵심 미션: 퀴즈 3문제 */}
          <div className={`rounded-2xl p-4 mb-3 ${m3.isRewarded ? 'bg-[var(--color-surface)]' : m3.current >= m3.target ? 'bg-orange-500/10' : 'bg-[var(--color-surface)]'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className={`text-sm font-bold ${m3.isRewarded ? 'text-[var(--color-ink-4)] line-through' : 'text-[var(--color-ink)]'}`}>
                  {m3.title}
                </p>
                <p className="text-xs text-[var(--color-ink-4)] mt-0.5">+{m3.reward}P</p>
              </div>
              {m3.isRewarded
                ? <Badge color="elephant" size="small" variant="fill">완료</Badge>
                : m3.current >= m3.target
                ? <button onClick={() => claimReward('m3')} className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold active:bg-orange-600">받기</button>
                : <span className="text-lg font-bold text-[var(--color-ink)]">{m3.current}<span className="text-sm text-[var(--color-ink-4)]">/{m3.target}</span></span>
              }
            </div>
            {/* 진행 바 */}
            <div className="flex gap-1">
              {Array.from({ length: m3.target }).map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < m3.current ? 'bg-orange-500' : 'bg-[var(--color-line)]'}`} />
              ))}
            </div>
          </div>

          {/* 보조 미션 */}
          <div className="flex flex-col gap-0">
            {([missions.m1] as Mission[]).map((mission, idx) => {
              const isCompleted = mission.current >= mission.target;
              return (
                <div key={mission.id} className={`flex justify-between items-center py-3 ${idx === 0 ? '' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                      mission.isRewarded ? 'bg-orange-500 text-white' : isCompleted ? 'bg-orange-500/20 text-orange-500' : 'bg-[var(--color-surface)] text-[var(--color-ink-4)]'
                    }`}>
                      {(mission.isRewarded || isCompleted) ? '✓' : ''}
                    </div>
                    <span className={`text-xs font-medium ${mission.isRewarded ? 'text-[var(--color-ink-4)] line-through' : 'text-[var(--color-ink-2)]'}`}>
                      {mission.title}
                    </span>
                  </div>
                  {mission.isRewarded
                    ? <span className="text-[11px] text-[var(--color-ink-4)]">+{mission.reward}P</span>
                    : isCompleted
                    ? <button onClick={() => claimReward(mission.id as keyof Missions)} className="px-2.5 py-1 rounded-lg bg-orange-500 text-white text-[11px] font-bold active:bg-orange-600">받기</button>
                    : <span className="text-[11px] text-[var(--color-ink-4)]">+{mission.reward}P</span>
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
