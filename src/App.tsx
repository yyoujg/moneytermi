import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertModal } from './components/AlertModal';
import { Component, type ReactNode, type ErrorInfo } from 'react';
import * as Sentry from '@sentry/react';
import { closeView, graniteEvent, getSchemeUri } from '@apps-in-toss/web-framework';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { isDefaultNickname } from './constants';
import { NicknameSheet } from './components/mypage/NicknameSheet';
import { parseLandingPath, parseReferrer } from './lib/landing';
import { logScreen, logClick } from './lib/analytics';
import { dismissRelatedWordPreview, resolveBackEventAction } from './lib/backEvent';
import NavBar from './components/NavBar';
import { TopBar } from './components/TopBar';
import { BadgeCelebration } from './components/mypage/BadgeCelebration';
import { LeaguePromotionCelebration } from './components/league/LeaguePromotionCelebration';
import { LeagueRankCelebration } from './components/league/LeagueRankCelebration';
import { PointCelebration } from './components/PointCelebration';
import { SplashScreen } from './components/SplashScreen';
import { useTapHaptics } from './hooks/useTapHaptics';
import { ArrowRight } from './components/ui/OtterIcons';
import { Storage } from './lib/storage';

const HomeScreen = React.lazy(() => import('./pages/HomeScreen'));
const CourseScreen = React.lazy(() => import('./pages/CourseScreen'));
const ReviewScreen = React.lazy(() => import('./pages/ReviewScreen'));
const QuizScreen = React.lazy(() => import('./pages/QuizScreen'));
const LessonCheckScreen = React.lazy(() => import('./pages/LessonCheckScreen'));
const LessonIntroScreen = React.lazy(() => import('./pages/LessonIntroScreen'));
const WordCardScreen = React.lazy(() => import('./pages/WordCardScreen'));
const LeagueScreen = React.lazy(() => import('./pages/LeagueScreen'));
const LeagueRulesScreen = React.lazy(() => import('./pages/LeagueRulesScreen'));
const BadgesScreen = React.lazy(() => import('./pages/BadgesScreen'));
const MyPageScreen = React.lazy(() => import('./pages/MyPageScreen'));

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
          <p className="text-lg font-bold text-[var(--color-ink)]">앗, 문제가 생겼어요</p>
          <p className="text-sm text-[var(--color-ink-3)]">앱을 다시 시작해 주세요.</p>
          <button
            onClick={() => closeView()}
            className="mt-2 px-5 py-2 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-80"
          >
            다시 시작
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingScreen = SplashScreen;

const WELCOME_KEY = 'welcome_seen_v1';
// 소개 문구 대신 첫 화면에서 바로 한 문제를 풀어 본다. 기록·XP와 무관한 체험용 문제다
const WELCOME_QUIZ = {
  question: '월급명세서에서 세금과 4대 보험료를 빼고 실제로 통장에 들어오는 돈을 뭐라고 할까요?',
  options: ['연봉', '실수령액', '통상임금'],
  answer: '실수령액',
  explain: '연봉은 세금을 빼기 전 1년 치 금액이에요. 실제로 받는 돈은 실수령액이라고 해요.',
};

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [picked, setPicked] = React.useState<string | null>(null);
  const start = async () => {
    await Storage.setItem(WELCOME_KEY, '1').catch(() => {});
    logClick('welcome_start', { answered: picked ? 1 : 0, correct: picked === WELCOME_QUIZ.answer ? 1 : 0 });
    navigate('/course', { replace: true });
  };
  const correct = picked === WELCOME_QUIZ.answer;

  return (
    <div className="app-soft-screen flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-8 pb-4 [&::-webkit-scrollbar]:hidden">
        <img src="/otter/v5/otter-idle.svg" data-otter="idle" alt="" aria-hidden="true" width={96} height={96} className="shrink-0" />
        <p className="mt-4 text-sm text-[var(--color-ink-3)]">달리와 먼저 한 문제 풀어 볼까요?</p>
        <h1 className="mt-2 text-xl font-bold leading-snug text-[var(--color-ink)] break-keep">{WELCOME_QUIZ.question}</h1>

        <div className="mt-6 flex flex-col gap-3">
          {WELCOME_QUIZ.options.map(opt => {
            const graded = picked !== null;
            const isAnswer = opt === WELCOME_QUIZ.answer;
            const style = !graded ? 'bg-[var(--color-card)] border-transparent text-[var(--color-ink)] active:bg-[var(--color-surface)]'
              : isAnswer ? 'bg-[var(--color-success-soft)] border-[var(--color-success-foreground)] text-[var(--color-ink)]'
              : opt === picked ? 'bg-[var(--color-card)] border-[var(--color-danger-line)] text-[var(--color-ink)]'
              : 'bg-[var(--color-card)] border-transparent text-[var(--color-ink-3)]';
            return (
              <button key={opt} type="button" disabled={graded} aria-pressed={opt === picked} onClick={() => setPicked(opt)}
                className={`quiz-option rounded-button flex min-h-[56px] items-center justify-between gap-3 border px-4 py-3 text-left text-base font-semibold ${style}`}>
                {opt}
                {graded && isAnswer && <span className="shrink-0 text-xs font-bold text-[var(--color-success-foreground)]">정답</span>}
                {graded && !isAnswer && opt === picked && <span className="shrink-0 text-xs font-bold text-[var(--color-danger-foreground)]">내 답</span>}
              </button>
            );
          })}
        </div>

        {picked && (
          <p role="status" className="mt-5 text-sm leading-relaxed text-[var(--color-ink-2)] break-keep">
            <strong className="text-[var(--color-ink)]">{correct ? '맞아요! ' : '아쉬워요. '}</strong>{WELCOME_QUIZ.explain}
          </p>
        )}
      </div>

      <div className="shrink-0 px-5 pb-8 pt-3 text-center">
        {/* 답하기 전에는 문제가 주행동이라 건너뛰기는 글자 버튼으로 약하게 둔다 */}
        {picked ? (
          <button type="button" onClick={start}
            className="flex w-full items-center justify-center gap-2 rounded-button bg-brand-500 py-4 text-base font-bold active:opacity-90">
            이런 용어부터 배워 볼게요<ArrowRight size={20} />
          </button>
        ) : (
          <button type="button" onClick={start} className="min-h-[44px] w-full text-sm font-semibold text-[var(--color-ink-3)] active:opacity-60">
            건너뛰고 시작하기
          </button>
        )}
        <p className="mt-3! text-xs text-[var(--color-ink-4)]">별도 가입 없이 시작할 수 있어요</p>
      </div>
    </div>
  );
};

let resolvedLanding: string | null = null;
let resolvedLandingIsDirect = false;
function resolveLandingTarget(): string {
  if (resolvedLanding) return resolvedLanding;
  let schemeUri = '';
  try {
    schemeUri = getSchemeUri();
  } catch {
    schemeUri = '';
  }
  const target = parseLandingPath(schemeUri);
  resolvedLandingIsDirect = target !== null;
  logClick('entry', { referrer: parseReferrer(schemeUri), target: target ?? '' });
  resolvedLanding = target ?? '/course';
  return resolvedLanding;
}

const LandingRoute = () => {
  const target = resolveLandingTarget();
  const { knownWords, xp } = useAppContext();
  const [seenWelcome, setSeenWelcome] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (target !== '/course' || resolvedLandingIsDirect) return;
    if (knownWords.length > 0 || xp > 0) {
      setSeenWelcome(true);
      return;
    }
    let active = true;
    Storage.getItem(WELCOME_KEY)
      .then(value => { if (active) setSeenWelcome(value === '1'); })
      .catch(() => { if (active) setSeenWelcome(true); });
    return () => { active = false; };
  }, [target, knownWords.length, xp]);

  if (target !== '/course' || resolvedLandingIsDirect) return <Navigate to={target} replace />;
  if (seenWelcome === null) return <LoadingScreen />;
  return <Navigate to={seenWelcome ? '/course' : '/welcome'} replace />;
};

const BackEventHandler = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    let unsubscription: (() => void) | undefined;
    try {
      unsubscription = graniteEvent.addEventListener('backEvent', {
        onEvent: () => {
          if (dismissRelatedWordPreview()) return;
          const action = resolveBackEventAction(typeof window !== 'undefined' ? window.history.state?.idx : 0);
          if (action === 'back') {
            navigate(-1);
            return;
          }

          try { closeView(); } catch { /* AIT 브리지 없는 브라우저 환경 */ }
        },
      });
    } catch {
      // AIT 브리지가 없는 브라우저 dev 환경: 백 이벤트 등록 생략
    }

    return () => unsubscription?.();
  }, [navigate]);

  return null;
};

const ScreenLogger = () => {
  const location = useLocation();
  React.useEffect(() => {
    logScreen('screen_view', { path: location.pathname });
  }, [location.pathname]);
  return null;
};

// 기본 닉네임이면 앱을 쓰기 전에 직접 정하게 한다.
const NicknameGate = () => {
  const { pathname } = useLocation();
  const { user, updateNickname } = useAuth();
  if (pathname === '/' || pathname === '/welcome' || !user || !isDefaultNickname(user.nickname)) return null;
  return (
    <NicknameSheet
      open
      required
      currentNickname={user.nickname}
      onClose={() => {}}
      onSave={updateNickname}
    />
  );
};

const Layout = () => {
  const location = useLocation();
  const { pathname } = location;
  const { ready, missionRewards, dismissMissionReward } = useAppContext();
  // 문제를 풀거나 읽는 중엔 미션 축하로 흐름을 끊지 않는다. 학습 화면을 나가면 대기열을 보여준다
  const learning = ['/quiz', '/word-card', '/review', '/lesson-check', '/lesson-intro'].some(p => pathname.startsWith(p));

  if (!ready) return <LoadingScreen />;

  return (
    <div className="flex-1 w-full h-full flex flex-col relative">
      <NicknameGate />
      <BadgeCelebration />
      <LeaguePromotionCelebration />
      <LeagueRankCelebration />
      <TopBar />
      <React.Suspense fallback={<LoadingScreen />}>
      {/* 경로가 바뀌면 래퍼가 다시 마운트되며 페이드인. (transform 전환은 기기에서 무거워 opacity만) */}
      <div key={pathname} className="flex-1 min-h-0 flex flex-col anim-fade">
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/course" element={<CourseScreen />} />
        <Route path="/course/topics" element={<CourseScreen />} />
        <Route path="/league" element={<LeagueScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/my" element={<MyPageScreen />} />
        <Route path="/my/badges" element={<BadgesScreen />} />
        {/* 관련 용어 클릭처럼 같은 라우트로 다시 navigate해도 새로 마운트 — 이전 index/단계가 새 단어 목록에 남지 않게 */}
        <Route path="/word-card" element={<WordCardScreen key={location.key} />} />
        <Route path="/league/rules" element={<LeagueRulesScreen />} />
        <Route path="/quiz" element={<QuizScreen />} />
        <Route path="/lesson-check" element={<LessonCheckScreen />} />
        <Route path="/lesson-intro" element={<LessonIntroScreen />} />
      </Routes>
      </div>
      </React.Suspense>
      <NavBar />
      {!learning && missionRewards[0] && (
        <PointCelebration key={missionRewards.length} reward={missionRewards[0]} onClose={dismissMissionReward} />
      )}
    </div>
  );
};

export default function App() {
  useTapHaptics();   // 모든 버튼 누름에 짧은 진동
  return (
    <ErrorBoundary>
      <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <BackEventHandler />
          <ScreenLogger />
          <AlertModal />
          {/* 상단 인셋은 더하지 않는다 — 토스 웹뷰는 네이티브 내비게이션 바 아래에서 시작해 상태바와 겹치지 않는다.
              하단 인셋은 NavBar가 직접 처리한다. */}
          <div data-app-shell className="w-full max-w-md mx-auto bg-[var(--color-card)] h-[100dvh] overflow-hidden relative font-sans text-[var(--color-ink)] flex flex-col">
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </div>
        </BrowserRouter>
      </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
