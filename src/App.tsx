import React, { useEffect, useState } from 'react';
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

import axiosInstance from './lib/axiosInstance';
import Cookies from "js-cookie";
import ForgotEmailPage from './pages/ForgotEmailPage';



function App() {

  return (
    <div
      className="max-w-sm mx-auto h-screen overflow-auto font-gmarket"
      style={{ aspectRatio: "16/7.4" }}
    >
      <Routes>
        <Route path="/" element={
          <PublicOnlyRoute>
            <WelcomePage />
          </PublicOnlyRoute>

        } />
        <Route path="/signup" element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        } />
        <Route path="/login" element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        
        } />
       <Route path="/forgot-password" element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        } />
          <Route path="/forgot-email" element={
          <PublicOnlyRoute>
            <ForgotEmailPage />
          </PublicOnlyRoute>
        } />
        <Route path='/kakao/callback' element={<Redirection />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/coupons" element={<ProfileCouponsPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/attendance" element={<EventsAttendancePage />} />
        <Route path="/events/invite" element={<EventsInvitePage />} />
        <Route path="/events/clover" element={<EventsCloverPage />} />
        <Route path="/events/coupon" element={<EventsCouponPage />} />

      </Routes>
    </div>
  );
}

export default App;

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    axiosInstance.get("/user/me")
      .then(() => setAllowed(true))
      .catch(() => {
        setAllowed(false)
        Cookies.remove("accessToken")
        Cookies.remove("refreshToken")
      })
  }, []);

  if (allowed === null) return null; // 로딩 중엔 아무것도 렌더링하지 않음
  if (!allowed) return <Navigate to="/login" replace />;
  
  return children;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactElement }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    axiosInstance.get("/user/me")
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        setIsAuthenticated(false)
        Cookies.remove("accessToken")
        Cookies.remove("refreshToken")
      });
  }, []);

  if (isAuthenticated === null) return null; 

  if (isAuthenticated) {
    return <Navigate to="/map" replace />; 
  }

  return children; 
};
