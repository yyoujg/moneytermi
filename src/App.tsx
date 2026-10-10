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
import { resolveBackEventAction } from './lib/backEvent';
import NavBar from './components/NavBar';
import { TopBar } from './components/TopBar';
import { BadgeCelebration } from './components/mypage/BadgeCelebration';
import { PointCelebration } from './components/PointCelebration';
import { useTapHaptics } from './hooks/useTapHaptics';
import { ArrowRight, BookOpen, CircleHelp, Trophy } from 'lucide-react';
import { Mascot } from './components/Mascot';
import { Storage } from './lib/storage';

const HomeScreen = React.lazy(() => import('./pages/HomeScreen'));
const CourseScreen = React.lazy(() => import('./pages/CourseScreen'));
const ReviewScreen = React.lazy(() => import('./pages/ReviewScreen'));
const QuizScreen = React.lazy(() => import('./pages/QuizScreen'));
const LessonCheckScreen = React.lazy(() => import('./pages/LessonCheckScreen'));
const WordCardScreen = React.lazy(() => import('./pages/WordCardScreen'));
const LeagueScreen = React.lazy(() => import('./pages/LeagueScreen'));
const LeagueRulesScreen = React.lazy(() => import('./pages/LeagueRulesScreen'));
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
          <Mascot name="error" size={120} />
          <p className="text-lg font-bold text-[var(--color-ink)]">앗, 문제가 생겼어요</p>
          <p className="text-sm text-[var(--color-ink-3)]">앱을 다시 시작해 주세요.</p>
          <button
            onClick={() => closeView()}
            className="mt-2 px-5 py-2.5 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-80"
          >
            다시 시작
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingScreen = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-white">
    <img
      src="/logo.png"
      alt="머니터미"
      style={{ width: 'min(72vw, 300px)', marginBottom: '24px' }}
    />
    <div style={{ width: '140px', height: '3px', borderRadius: '999px', backgroundColor: 'var(--color-brand-200)', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        borderRadius: '999px',
        backgroundColor: 'var(--color-brand-500)',
        animation: 'splash-gauge 1.4s ease-in-out infinite',
      }} />
    </div>
    <style>{`
      @keyframes splash-gauge {
        0% { width: 0%; }
        60% { width: 100%; }
        100% { width: 100%; opacity: 0; }
      }
    `}</style>
  </div>
);

const WELCOME_KEY = 'welcome_seen_v1';
const WELCOME_STEPS = [
  { icon: BookOpen, title: '쉬운 설명으로 배워요', desc: '뉴스에 자주 나오는 용어를 한 줄 뜻과 예시로 익혀요' },
  { icon: CircleHelp, title: '짧은 퀴즈로 확인해요', desc: '배운 단어를 바로 퀴즈로 풀며 기억에 남겨요' },
  { icon: Trophy, title: '복습하고 리그에 도전해요', desc: '잊을 때쯤 다시 복습하고, 매주 리그 순위를 겨뤄요' },
];

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const start = async () => {
    await Storage.setItem(WELCOME_KEY, '1').catch(() => {});
    logClick('welcome_start');
    navigate('/course', { replace: true });
  };

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      <div className="flex flex-1 flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div className="flex shrink-0 flex-col items-center rounded-b-[32px] bg-[var(--color-card)] px-6 pb-8 pt-8 text-center">
          <Mascot name="hello" size={150} />
          <h1 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-[var(--color-ink)] break-keep">
            뉴스 속 낯선 경제 용어,<br />이제 어렵지 않아요!
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-3)] break-keep">하루 몇 분이면 경제 뉴스가 읽혀요</p>
        </div>

        {/* 남는 높이의 가운데에 단계 카드를 둔다. 화면이 작으면 그대로 스크롤된다 */}
        <div className="flex flex-1 flex-col justify-center px-5 pt-7 pb-4">
          <p className="mb-3 px-1 text-sm font-bold text-[var(--color-ink-2)]">이렇게 배워요</p>
          <ol className="flex flex-col gap-3">
            {WELCOME_STEPS.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-center gap-4 rounded-card bg-[var(--color-card)] px-4 py-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-brand-500">
                  <Icon size={21} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold text-[var(--color-ink)]">{title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-[var(--color-ink-3)] break-keep">{desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="shrink-0 px-5 pb-8 pt-3 text-center">
        <button type="button" onClick={start}
          className="flex w-full items-center justify-center gap-2 rounded-button bg-brand-500 py-4 text-base font-bold active:opacity-90">
          첫 레슨 시작하기<ArrowRight size={18} />
        </button>
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
  const learning = ['/quiz', '/word-card', '/review', '/lesson-check'].some(p => pathname.startsWith(p));

  if (!ready) return <LoadingScreen />;

  return (
    <div className="flex-1 w-full h-full flex flex-col relative">
      <NicknameGate />
      <BadgeCelebration />
      <TopBar />
      <React.Suspense fallback={<LoadingScreen />}>
      {/* 경로가 바뀌면 래퍼가 다시 마운트되며 페이드인. (transform 전환은 기기에서 무거워 opacity만) */}
      <div key={pathname} className="flex-1 min-h-0 flex flex-col anim-fade">
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/course" element={<CourseScreen />} />
        <Route path="/league" element={<LeagueScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/my" element={<MyPageScreen />} />
        {/* 관련 용어 클릭처럼 같은 라우트로 다시 navigate해도 새로 마운트 — 이전 index/단계가 새 단어 목록에 남지 않게 */}
        <Route path="/word-card" element={<WordCardScreen key={location.key} />} />
        <Route path="/league/rules" element={<LeagueRulesScreen />} />
        <Route path="/quiz" element={<QuizScreen />} />
        <Route path="/lesson-check" element={<LessonCheckScreen />} />
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
          <div data-app-shell className="w-full max-w-md mx-auto bg-[var(--color-canvas)] h-[100dvh] overflow-hidden relative font-sans text-[var(--color-ink)] flex flex-col">
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
