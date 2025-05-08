import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <div
      className="mx-auto h-screen overflow-auto font-gmarket"
      style={{ width: "450px", aspectRatio: "16/7.4" }}
    >
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
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