import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'

import Splash          from './pages/Splash'
import PrivacyNotice   from './pages/PrivacyNotice'
import Onboarding      from './pages/Onboarding'
import Login           from './pages/Login'
import Home            from './pages/Home'
import Explore         from './pages/Explore'
import PackageDetails  from './pages/PackageDetails'
import Assistant       from './pages/Assistant'
import AIResults       from './pages/AIResults'
import TravelerDetails from './pages/TravelerDetails'
import ReviewDetails   from './pages/ReviewDetails'
import Payment         from './pages/Payment'
import Confirmation    from './pages/Confirmation'
import Bookings        from './pages/Bookings'
import BookingDetails  from './pages/BookingDetails'
import Profile         from './pages/Profile'
import Wishlist        from './pages/Wishlist'
import HelpSupport     from './pages/HelpSupport'

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"                      element={<Splash />} />
            <Route path="/privacy"               element={<PrivacyNotice />} />
            <Route path="/onboarding"            element={<Onboarding />} />
            <Route path="/login"                 element={<Login />} />
            <Route path="/home"                  element={<Home />} />
            <Route path="/explore"               element={<Explore />} />
            <Route path="/package/:id"           element={<PackageDetails />} />
            <Route path="/assistant"             element={<Assistant />} />
            <Route path="/ai-results"            element={<AIResults />} />
            <Route path="/reserve/:id/travelers" element={<TravelerDetails />} />
            <Route path="/reserve/:id/review"    element={<ReviewDetails />} />
            <Route path="/reserve/:id/payment"   element={<Payment />} />
            <Route path="/reserve/:id/confirmed" element={<Confirmation />} />
            <Route path="/bookings"              element={<Bookings />} />
            <Route path="/bookings/:id"          element={<BookingDetails />} />
            <Route path="/profile"               element={<Profile />} />
            <Route path="/wishlist"              element={<Wishlist />} />
            <Route path="/help"                  element={<HelpSupport />} />
            <Route path="/contact"               element={<HelpSupport />} />
            <Route path="/about"                 element={<Navigate to="/home" replace />} />
            <Route path="*"                      element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </AuthProvider>
  )
}
