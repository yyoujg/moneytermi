import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import NavBar from './components/NavBar';
import HomeScreen from './pages/HomeScreen';
import CourseScreen from './pages/CourseScreen';
import ReviewScreen from './pages/ReviewScreen';
import LeagueScreen from './pages/LeagueScreen';
import QuizScreen from './pages/QuizScreen';
import SwipeScreen from './pages/SwipeScreen';
import MyPageScreen from './pages/MyPageScreen';

const NAV_PATHS = ['/home', '/course', '/league', '/review', '/my'];

const Layout = () => {
  const { pathname } = useLocation();
  return (
    <div className="flex-1 w-full h-full relative">
      <Routes>
        <Route path="/" element={<Navigate to="/league" replace />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/course" element={<CourseScreen />} />
        <Route path="/league" element={<LeagueScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/my" element={<MyPageScreen />} />
        <Route path="/swipe" element={<SwipeScreen />} />
        <Route path="/quiz" element={<QuizScreen />} />
      </Routes>
      {NAV_PATHS.includes(pathname) && <NavBar />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="w-full max-w-md mx-auto bg-white h-screen overflow-hidden relative font-sans text-gray-900 sm:rounded-3xl sm:h-[850px] sm:my-10 sm:border sm:border-gray-200 flex flex-col sm:shadow-xl selection:bg-orange-100 selection:text-orange-900">
          <Layout />
        </div>
      </HashRouter>
    </AppProvider>
  );
}
