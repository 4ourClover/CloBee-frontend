import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import ProfileCouponsPage from './pages/ProfileCouponsPage';
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import CardsPage from "./pages/CardsPage"

import EventsPage from './pages/Event/EventsPage';
import EventsAttendancePage from './pages/Event/EventsAttendancePage';
import EventsInvitePage from './pages/Event/EventsInvitePage';
import EventsCloverPage from './pages/Event/EventsCloverPage';
import EventsCouponPage from './pages/Event/EventsCouponPage';
import Redirection from './pages/RedirectionPage';

import ForgotEmailPage from './pages/ForgotEmailPage';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

import usePageTracking from './hooks/usePageTracking';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated } = React.useContext(AuthContext);

  // 페이지 추적
  usePageTracking();

  // 로딩 중일 때 표시할 컴포넌트
  if (isAuthenticated === null) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  }

  return ( // style={{ aspectRatio: "16/7.4" }}
    <div className="w-full mx-auto h-[100dvh] overflow-auto font-gmarket">
      <Routes>
        {/* 공개 라우트 - 인증 없이 접근 가능 */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/map" /> : <WelcomePage />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/map" /> : <SignupPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/map" /> : <LoginPage />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/map" /> : <ForgotPasswordPage />} />
        <Route path="/forgot-email" element={isAuthenticated ? <Navigate to="/map" /> : <ForgotEmailPage />} />
        <Route path='/kakao/callback' element={<Redirection />} />

        {/* 보호된 라우트 - 인증 필요 */}
        <Route path="/map" element={isAuthenticated ? <MapPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/profile/coupons" element={isAuthenticated ? <ProfileCouponsPage /> : <Navigate to="/login" />} />
        <Route path="/card" element={isAuthenticated ? <CardsPage /> : <Navigate to="/login" />} />
        <Route path="/event" element={isAuthenticated ? <EventsPage /> : <Navigate to="/login" />} />
        <Route path="/event/attendance" element={isAuthenticated ? <EventsAttendancePage /> : <Navigate to="/login" />} />
        <Route path="/event/invite" element={isAuthenticated ? <EventsInvitePage /> : <Navigate to="/login" />} />
        <Route path="/event/clover" element={isAuthenticated ? <EventsCloverPage /> : <Navigate to="/login" />} />
        <Route path="/event/coupon" element={isAuthenticated ? <EventsCouponPage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}