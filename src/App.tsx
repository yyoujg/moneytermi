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
import NavBar from './components/NavBar';
import { TopBar } from './components/TopBar';
import { BadgeCelebration } from './components/mypage/BadgeCelebration';
import { useTapHaptics } from './hooks/useTapHaptics';
import { ArrowRight } from 'lucide-react';
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
          <p className="text-2xl">⚠️</p>
          <p className="text-sm font-semibold text-[var(--color-ink)]">앗, 문제가 발생했어요</p>
          <p className="text-xs text-[var(--color-ink-3)]">앱을 다시 시작해 주세요.</p>
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
  <div className="flex-1 flex flex-col items-center justify-center" style={{ backgroundColor: '#c4511a' }}>
    <img
      src="/logo.png"
      alt="머니터미"
      style={{ width: 'min(72vw, 300px)', marginBottom: '24px' }}
    />
    <div style={{ width: '140px', height: '3px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        borderRadius: '999px',
        backgroundColor: 'white',
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
const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [previewAnswer, setPreviewAnswer] = React.useState<number | null>(null);
  const start = async () => {
    await Storage.setItem(WELCOME_KEY, '1').catch(() => {});
    logClick('welcome_start');
    navigate('/course', { replace: true });
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[var(--color-card)] px-6 pb-10 pt-12 text-center [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto max-w-xs">
        <h1 className="text-2xl font-extrabold leading-snug tracking-tight text-[var(--color-ink)] break-keep">
          뉴스 속 낯선 경제 용어,<br />이제 어렵지 않아요!
        </h1>
        <p className="mt-4! text-sm leading-relaxed text-[var(--color-ink-2)] break-keep">
          쉬운 설명으로 배우고<br />짧은 퀴즈로 확인해요.
        </p>
      </div>

      <div className="relative mx-auto my-5 flex h-36 w-36 shrink-0 items-center justify-center">
        <span aria-hidden="true" className="absolute inset-3 rounded-full bg-[var(--color-brand-soft)]" />
        <div className="relative h-32 w-32 overflow-hidden rounded-full bg-brand-500">
          <img src="/logo.png" alt="머니터미 캐릭터" className="absolute -left-4 -top-[58px] w-[160px] max-w-none" />
        </div>
      </div>

      <div className="rounded-card bg-[var(--color-surface)] px-5 py-4 text-left">
        <p className="text-xs font-bold text-[var(--color-ink-2)]">이렇게 배워요</p>
        <p className="mt-2 text-lg font-bold text-[var(--color-ink)]">규모의 경제</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-2)]">많이 만들수록 제품 하나당 평균 비용이 낮아지는 현상이에요.</p>
        <p className="mt-3 text-xs font-bold text-brand-ink">짧은 퀴즈로 확인해요</p>
        <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">많이 만들면 개당 비용은 어떻게 될까요?</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {['낮아져요', '높아져요'].map((answer, index) => (
            <button key={answer} type="button" onClick={() => setPreviewAnswer(index)}
              aria-pressed={previewAnswer === index}
              className={`min-h-11 rounded-button px-2 text-sm font-bold ${previewAnswer === index ? 'bg-brand-500' : 'bg-[var(--color-button-secondary)] text-[var(--color-ink)]'}`}>
              {answer}
            </button>
          ))}
        </div>
        {previewAnswer !== null && <p role="status" className="mt-2 text-xs font-semibold text-[var(--color-ink-2)]">{previewAnswer === 0 ? '맞았어요! 개당 평균 비용이 낮아져요.' : '다시 생각해 보세요. 비용을 더 많은 제품에 나눠요.'}</p>}
      </div>

      <div className="mt-auto pt-8">
        <button type="button" onClick={start}
          className="flex w-full items-center justify-center gap-2 rounded-button bg-brand-500 py-4 text-sm font-bold active:opacity-90">
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
  const location = useLocation();

  React.useEffect(() => {
    let unsubscription: (() => void) | undefined;
    try {
      unsubscription = graniteEvent.addEventListener('backEvent', {
        onEvent: () => {
          const idx = typeof window !== 'undefined' ? (window.history.state?.idx ?? 0) : 0;

          if (idx > 0) {
            navigate(-1);
            return;
          }

          if (location.pathname !== '/course') {
            navigate('/course', { replace: true });
            return;
          }

          try { closeView(); } catch { /* AIT 브리지 없는 브라우저 환경 */ }
        },
      });
    } catch {
      // AIT 브리지가 없는 브라우저 dev 환경: 백 이벤트 등록 생략
    }

    return () => unsubscription?.();
  }, [navigate, location.pathname]);

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
  const { ready } = useAppContext();

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
