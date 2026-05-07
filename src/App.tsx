import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Component, type ReactNode, type ErrorInfo } from 'react';
import * as Sentry from '@sentry/react';
import { closeView, graniteEvent, getSchemeUri } from '@apps-in-toss/web-framework';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider } from './hooks/useAuth';
import NavBar from './components/NavBar';
import HomeScreen from './pages/HomeScreen';
import CourseScreen from './pages/CourseScreen';
import ReviewScreen from './pages/ReviewScreen';
import LeagueScreen from './pages/LeagueScreen';
import QuizScreen from './pages/QuizScreen';
import CourseWordListScreen from './pages/CourseWordListScreen';
import WordCardScreen from './pages/WordCardScreen';
import LeagueRulesScreen from './pages/LeagueRulesScreen';
import MyPageScreen from './pages/MyPageScreen';

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

const ALLOWED_PATHS = new Set([
  '/home',
  '/course',
  '/league',
  '/review',
  '/my',
  '/course/words',
  '/word-card',
  '/league/rules',
  '/quiz',
]);

function parseLandingPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!s) return null;

  const pick = (v: string | null): string | null => {
    if (!v) return null;
    const decoded = (() => {
      try { return decodeURIComponent(v); } catch { return v; }
    })();
    const value = decoded.trim();

    const fromHash = value.includes('#/') ? value.slice(value.indexOf('#') + 1) : value;
    const candidate = fromHash.startsWith('/') ? fromHash : (fromHash.startsWith('#') ? fromHash.slice(1) : null);
    if (!candidate) return null;

    const pathOnly = candidate.split('?')[0] ?? candidate;
    return ALLOWED_PATHS.has(pathOnly) ? pathOnly : null;
  };

  const direct = pick(s);
  if (direct) return direct;

  try {
    const u = new URL(s);
    const hashPath = pick(u.hash);
    if (hashPath) return hashPath;

    const params = u.searchParams;
    for (const key of ['path', 'landing', 'url', 'redirect', 'target']) {
      const v = params.get(key);
      const chosen = pick(v);
      if (chosen) return chosen;
    }
  } catch {
    // ignore
  }

  return null;
}

const LandingRouter = () => {
  const { ready } = useAppContext();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!ready) return;

    let schemeUri = '';
    try {
      schemeUri = getSchemeUri();
    } catch {
      schemeUri = '';
    }

    const target = parseLandingPath(schemeUri) ?? parseLandingPath(globalThis.location?.href ?? '');
    if (target && globalThis.location?.hash !== `#${target}`) {
      navigate(target, { replace: true });
    }
  }, [ready, navigate]);

  return null;
};

const BackEventHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const unsubscription = graniteEvent.addEventListener('backEvent', {
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

        closeView();
      },
    });

    return unsubscription;
  }, [navigate, location.pathname]);

  return null;
};

const Layout = () => {
  const { ready } = useAppContext();

  if (!ready) return <LoadingScreen />;

  return (
    <div className="flex-1 w-full h-full relative">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
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
      <NavBar />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
      <AppProvider>
        <HashRouter>
          <LandingRouter />
          <BackEventHandler />
          <Toaster position="top-center" duration={1800} richColors />
          <div className="w-full max-w-md mx-auto bg-[#F7F7F7] h-[100dvh] overflow-hidden relative font-sans text-[#111111] flex flex-col">
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </div>
        </HashRouter>
      </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
