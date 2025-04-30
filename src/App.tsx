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

//
// 
// import EventsAttendancePage from './pages/EventsAttendancePage';
// import EventsCloverPage from './pages/EventsCloverPage';
// import EventsCouponPage from './pages/EventsCouponPage';
// import EventsInvitePage from './pages/EventsInvitePage';
// 
// 
// 
// 
// 
// import StoresPage from './pages/StoresPage';
// 

function App() {
  return (
    <div
      className="max-w-sm mx-auto h-screen overflow-auto font-gmarket"
      style={{ aspectRatio: "16/7.4" }}
    >
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/coupons" element={<ProfileCouponsPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/cards" element={<CardsPage />} />
        {/* 
        
        
        <Route path="/events/attendance" element={<EventsAttendancePage />} />
        <Route path="/events/clover" element={<EventsCloverPage />} />
        <Route path="/events/coupon" element={<EventsCouponPage />} />
        <Route path="/events/invite" element={<EventsInvitePage />} />

        
        
        

        <Route path="/stores" element={<StoresPage />} />
        */}
      </Routes>
    </div>
  );
}

export default App;