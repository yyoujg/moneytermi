import React from 'react';
import { HashRouter, Routes, Route, Navigate,  } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Component, type ReactNode, type ErrorInfo } from 'react';
import * as Sentry from '@sentry/react';
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
            onClick={() => window.location.reload()}
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
  <div className="flex-1 flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-2xl animate-pulse">
      🍊
    </div>
    <p className="text-sm font-semibold text-[#AAAAAA]">불러오는 중...</p>
  </div>
);

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
