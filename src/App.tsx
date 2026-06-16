import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Component, type ReactNode, type ErrorInfo } from 'react';
import * as Sentry from '@sentry/react';
import { closeView, graniteEvent, getSchemeUri } from '@apps-in-toss/web-framework';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider } from './hooks/useAuth';
import { parseLandingPath } from './lib/landing';
import { logScreen } from './lib/analytics';
import { useSafeAreaInsets } from './hooks/useSafeAreaInsets';
import NavBar from './components/NavBar';

const HomeScreen = React.lazy(() => import('./pages/HomeScreen'));
const CourseScreen = React.lazy(() => import('./pages/CourseScreen'));
const ReviewScreen = React.lazy(() => import('./pages/ReviewScreen'));
const LeagueScreen = React.lazy(() => import('./pages/LeagueScreen'));
const QuizScreen = React.lazy(() => import('./pages/QuizScreen'));
const CourseWordListScreen = React.lazy(() => import('./pages/CourseWordListScreen'));
const WordCardScreen = React.lazy(() => import('./pages/WordCardScreen'));
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
          <p className="text-sm font-semibold text-[#111111]">앗, 문제가 발생했어요</p>
          <p className="text-xs text-[#888888]">앱을 다시 시작해 주세요.</p>
          <button
            onClick={() => closeView()}
            className="mt-2 px-5 py-2.5 rounded-xl bg-orange-500 text-sm font-bold text-white active:opacity-80"
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
  <div className="flex-1 flex flex-col items-center justify-center" style={{ backgroundColor: '#FA4809' }}>
    <img
      src="/logo.png"
      alt="머니터미"
      style={{ width: '150px', marginBottom: '64px' }}
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

let resolvedLanding: string | null = null;
function resolveLandingTarget(): string {
  if (resolvedLanding) return resolvedLanding;
  let schemeUri = '';
  try {
    schemeUri = getSchemeUri();
  } catch {
    schemeUri = '';
  }
  const target = parseLandingPath(schemeUri);
  // 진단(한시): 기기가 스킴을 pathname으로 주는지 getSchemeUri로 주는지 Sentry로 확정. PROD 빌드에서만 전송됨.
  const loc = globalThis.location;
  Sentry.captureMessage('deep-link', {
    level: 'info',
    extra: { schemeUri, target, href: loc?.href, pathname: loc?.pathname, hash: loc?.hash },
  });
  resolvedLanding = target ?? '/home';
  return resolvedLanding;
}

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

          if (location.pathname !== '/home') {
            navigate('/home', { replace: true });
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

const Layout = () => {
  const { ready } = useAppContext();

  if (!ready) return <LoadingScreen />;

  return (
    <div className="flex-1 w-full h-full relative">
      <React.Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Navigate to={resolveLandingTarget()} replace />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/course" element={<CourseScreen />} />
        <Route path="/league" element={<LeagueScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/my" element={<MyPageScreen />} />
<Route path="/course/words" element={<CourseWordListScreen />} />
        <Route path="/word-card" element={<WordCardScreen />} />
        <Route path="/league/rules" element={<LeagueRulesScreen />} />
        <Route path="/quiz" element={<QuizScreen />} />
      </Routes>
      </React.Suspense>
      <NavBar />
    </div>
  );
};

export default function App() {
  const insets = useSafeAreaInsets();
  return (
    <ErrorBoundary>
      <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <BackEventHandler />
          <ScreenLogger />
          <Toaster position="top-center" duration={1800} richColors />
          <div
            className="w-full max-w-md mx-auto bg-[#F7F7F7] h-[100dvh] overflow-hidden relative font-sans text-[#111111] flex flex-col"
            style={{ paddingTop: insets.top }}
          >
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
