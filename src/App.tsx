import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import SignupPage from './pages/SignupPage';

//import LoginPage from './pages/LoginPage';
// import CardsPage from './pages/CardsPage';
// import EventsAttendancePage from './pages/EventsAttendancePage';
// import EventsCloverPage from './pages/EventsCloverPage';
// import EventsCouponPage from './pages/EventsCouponPage';
// import EventsInvitePage from './pages/EventsInvitePage';
// 
// import MapPage from './pages/MapPage';
// import ProfilePage from './pages/ProfilePage';
// import ProfileCouponsPage from './pages/ProfileCouponsPage';
// 
// import StoresPage from './pages/StoresPage';
// 

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* 
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/events/attendance" element={<EventsAttendancePage />} />
        <Route path="/events/clover" element={<EventsCloverPage />} />
        <Route path="/events/coupon" element={<EventsCouponPage />} />
        <Route path="/events/invite" element={<EventsInvitePage />} />

        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/coupons" element={<ProfileCouponsPage />} />

        <Route path="/stores" element={<StoresPage />} />
        */}
      </Routes>
    </div>
  );
}

export default App;