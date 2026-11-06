import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLoginPage } from '../pages/auth/auth.login';
import {ForgotPasswordPage} from '../pages/auth/auth.forgot-password';
import {RegisterPage} from '../pages/auth/auth.register';
import {ResetPasswordPage} from '../pages/auth/auth.reset-password';
import {PrivacyPage} from '../pages/legal/legal.privacy';
import {TermsPage} from '../pages/legal/legal.terms';
import { authRoutes } from './authRoutes';
import DonationPage from '../pages/DonationPage';
import DonationSuccessPage from '../pages/DonationSuccessPage';
import SuggestionsPage from '../pages/SuggestionsPage';
import AdminSuggestionsPage from '../pages/admin/AdminSuggestionsPage';
import {DashboardRoute, FamilyOnly, PlaceholderPage, PortalLayout} from './PortalLayout';
import {portalUser} from './portalContext';
import {portalRoutes} from './portalRoutes';
import DanaSchedulePage from '../pages/family/DanaSchedulePage';
import DanaBookingPage from '../pages/family/DanaBookingPage';
import BookingConfirmationPage from '../pages/family/BookingConfirmationPage';
import MyBookingsPage from '../pages/family/MyBookingsPage';
import TempleAdminDashboard from '../pages/temple/TempleAdminDashboard';
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard';

export const AppRoutes = () => (
    <Routes>
        <Route path={authRoutes.login} element={<AuthLoginPage/>}/>
        <Route path={authRoutes.register} element={<RegisterPage/>}/>
        <Route path={authRoutes.forgotPassword} element={<ForgotPasswordPage/>}/>
        <Route path={authRoutes.resetPassword} element={<ResetPasswordPage/>}/>

        {/* Public legal pages, linked from the sign-up consent line. */}
        <Route path={authRoutes.terms} element={<TermsPage/>}/>
        <Route path={authRoutes.privacy} element={<PrivacyPage/>}/>

        {/* Social sign-in is not connected yet - it opens the dashboard. */}
        <Route path={authRoutes.google} element={<Navigate to={authRoutes.dashboard} replace/>}/>
        <Route path={authRoutes.facebook} element={<Navigate to={authRoutes.dashboard} replace/>}/>

        {/* Donation Module */}
        <Route path="/donation" element={<DonationPage />} />
        <Route path="/donation/success" element={<DonationSuccessPage />} />

        {/*Community Suggestions Section*/}
        <Route path="/suggestions" element={<SuggestionsPage />} />
        <Route path="/admin/suggestions" element={<AdminSuggestionsPage />} />

        {/* Portal screens (family / temple admin / co-admin / super admin) inside the shared MainLayout. */}
        <Route element={<PortalLayout/>}>
            <Route path={portalRoutes.dashboard} element={<DashboardRoute/>}/>
            <Route path={portalRoutes.danaSchedule} element={<FamilyOnly><DanaSchedulePage user={portalUser}/></FamilyOnly>}/>
            {/* Nested under /dana-schedule so the sidebar keeps "Dana Schedule" highlighted. */}
            <Route path={portalRoutes.danaBooking} element={<FamilyOnly><DanaBookingPage user={portalUser}/></FamilyOnly>}/>
            <Route path={portalRoutes.danaConfirmation} element={<FamilyOnly><BookingConfirmationPage/></FamilyOnly>}/>
            <Route path={portalRoutes.myBookings} element={<FamilyOnly><MyBookingsPage user={portalUser}/></FamilyOnly>}/>

            <Route path={portalRoutes.templeAdmin} element={<Navigate to={`${portalRoutes.templeAdmin}/dashboard`} replace/>}/>
            <Route path={`${portalRoutes.templeAdmin}/dashboard`} element={<TempleAdminDashboard user={portalUser} basePath={portalRoutes.templeAdmin}/>}/>
            <Route path={`${portalRoutes.templeAdmin}/:page`} element={<PlaceholderPage/>}/>

            <Route path={portalRoutes.coAdmin} element={<Navigate to={`${portalRoutes.coAdmin}/dashboard`} replace/>}/>
            <Route path={`${portalRoutes.coAdmin}/dashboard`} element={<TempleAdminDashboard role="coAdmin" user={portalUser} basePath={portalRoutes.coAdmin}/>}/>
            <Route path={`${portalRoutes.coAdmin}/:page`} element={<PlaceholderPage/>}/>

            <Route path={portalRoutes.superAdmin} element={<Navigate to={`${portalRoutes.superAdmin}/dashboard`} replace/>}/>
            <Route path={`${portalRoutes.superAdmin}/dashboard`} element={<SuperAdminDashboard user={portalUser}/>}/>
            <Route path={`${portalRoutes.superAdmin}/:page`} element={<PlaceholderPage/>}/>

            {/* Sidebar items without a screen yet (/events, /notifications, /profile ...). */}
            <Route path="/:page" element={<PlaceholderPage/>}/>
        </Route>

        <Route path="/" element={<Navigate to={authRoutes.login} replace/>}/>
        <Route path="*" element={<Navigate to={authRoutes.dashboard} replace/>}/>
    </Routes>
);

