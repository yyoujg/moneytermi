import React from 'react';
import { HashRouter, Routes, Route, Navigate,  } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import NavBar from './components/NavBar';
import HomeScreen from './pages/HomeScreen';
import CourseScreen from './pages/CourseScreen';
import ReviewScreen from './pages/ReviewScreen';
import LeagueScreen from './pages/LeagueScreen';
import QuizScreen from './pages/QuizScreen';
import SwipeScreen from './pages/SwipeScreen';
import CourseWordListScreen from './pages/CourseWordListScreen';
import WordCardScreen from './pages/WordCardScreen';
import LeagueRulesScreen from './pages/LeagueRulesScreen';
import MyPageScreen from './pages/MyPageScreen';

const Layout = () => {
  return (
    <div className="flex-1 w-full h-full relative">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/course" element={<CourseScreen />} />
        <Route path="/league" element={<LeagueScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/my" element={<MyPageScreen />} />
        <Route path="/swipe" element={<SwipeScreen />} />
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
    <AppProvider>
      <HashRouter>
        <div className="w-full max-w-md mx-auto bg-[#0B0B0B] h-[100dvh] overflow-hidden relative font-sans text-white flex flex-col">
          <Layout />
        </div>
      </HashRouter>
    </AppProvider>
  );
}
