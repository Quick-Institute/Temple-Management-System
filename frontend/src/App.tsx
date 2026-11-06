import { Navigate, Route, Routes, useParams, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import type { AppUser, UserRole } from "./types";
import TempleAdminDashboard from "./pages/temple/TempleAdminDashboard";
import FamilyDashboard from "./pages/family/FamilyDashboard";
import DanaSchedulePage from "./pages/family/DanaSchedulePage";
import DanaBookingPage from "./pages/family/DanaBookingPage";
import BookingConfirmationPage from "./pages/family/BookingConfirmationPage";
import MyBookingsPage from "./pages/family/MyBookingsPage";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";


/* Temporary page for routes that have no screen yet. */
function PlaceholderPage() {
  const { page } = useParams();

  const title = (page ?? "Page")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return <h1 className="text-3xl font-bold text-[#234936]">{title}</h1>;
}

// Pass the authenticated user here when the login layer is connected.
interface AppProps { currentUser?: AppUser; }

function App({ currentUser }: AppProps) {
  const { pathname } = useLocation();
  const adminRoute = pathname === '/temple-admin' || pathname.startsWith('/temple-admin/');
  const coAdminRoute = pathname === '/co-admin' || pathname.startsWith('/co-admin/');
  const superAdminRoute = pathname === '/super-admin' || pathname.startsWith('/super-admin/');
  const role: UserRole = adminRoute ? 'templeAdmin' : coAdminRoute ? 'coAdmin' : superAdminRoute ? 'superAdmin' : currentUser?.role ?? 'family';
  const basePath = adminRoute ? '/temple-admin' : coAdminRoute ? '/co-admin' : superAdminRoute ? '/super-admin' : '';
  return (
    <MainLayout role={role} basePath={basePath} userName={currentUser?.name} avatarSrc={role === 'coAdmin' ? currentUser?.avatarSrc || '/co-admin-avatar.svg' : undefined}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={role === 'superAdmin' ? <SuperAdminDashboard user={currentUser} /> : (role === 'templeAdmin' || role === 'coAdmin') ? <TempleAdminDashboard role={role} user={currentUser} /> : <FamilyDashboard user={currentUser} />} />
        <Route path="/temple-admin" element={<Navigate to="/temple-admin/dashboard" replace />} />
        <Route path="/temple-admin/dashboard" element={<TempleAdminDashboard user={currentUser} basePath="/temple-admin" />} />
        <Route path="/temple-admin/:page" element={<PlaceholderPage />} />

        <Route path="/co-admin" element={<Navigate to="/co-admin/dashboard" replace />} />
        <Route path="/co-admin/dashboard" element={<TempleAdminDashboard role="coAdmin" user={currentUser} basePath="/co-admin" />} />
        <Route path="/co-admin/:page" element={<PlaceholderPage />} />

        <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboard user={currentUser} />} />
        <Route path="/super-admin/:page" element={<PlaceholderPage />} />

        {/* Family-only page; other roles use their own Dana management routes. */}
        <Route path="/dana-schedule" element={role === 'family' ? <DanaSchedulePage user={currentUser} /> : <Navigate to="/dashboard" replace />} />

        {/* Nested under /dana-schedule so the sidebar keeps "Dana Schedule" highlighted. */}
        <Route path="/dana-schedule/booking" element={role === 'family' ? <DanaBookingPage user={currentUser} /> : <Navigate to="/dashboard" replace />} />

        <Route path="/dana-schedule/confirmation" element={role === 'family' ? <BookingConfirmationPage /> : <Navigate to="/dashboard" replace />} />

        {/* Family-only page; the sidebar's "My Bookings" item links here. */}
        <Route path="/my-bookings" element={role === 'family' ? <MyBookingsPage user={currentUser} /> : <Navigate to="/dashboard" replace />} />

        <Route path="/:page" element={<PlaceholderPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
