import {Navigate, Route, Routes} from 'react-router-dom'
import {ForgotPasswordPage} from '../pages/auth/auth.forgot-password'
import {AuthLoginPage} from '../pages/auth/auth.login'
import {RegisterPage} from '../pages/auth/auth.register'
import {PrivacyPage} from '../pages/legal/legal.privacy'
import {TermsPage} from '../pages/legal/legal.terms'
import {TempleDashboardPage} from '../pages/temple/temple.dashboard'
import {authRoutes} from './authRoutes'

export const AppRoutes = () => (
    <Routes>
        <Route path={authRoutes.login} element={<AuthLoginPage/>}/>
        <Route path={authRoutes.register} element={<RegisterPage/>}/>
        <Route path={authRoutes.forgotPassword} element={<ForgotPasswordPage/>}/>

        {/* Public legal pages, linked from the sign-up consent line. */}
        <Route path={authRoutes.terms} element={<TermsPage/>}/>
        <Route path={authRoutes.privacy} element={<PrivacyPage/>}/>

        {/* Social sign-in is not connected yet - it opens the temple admin dashboard. */}
        <Route path={authRoutes.google} element={<Navigate to={authRoutes.dashboard} replace/>}/>
        <Route path={authRoutes.facebook} element={<Navigate to={authRoutes.dashboard} replace/>}/>

        <Route path={authRoutes.dashboard} element={<TempleDashboardPage/>}/>

        <Route path="/" element={<Navigate to={authRoutes.login} replace/>}/>
        <Route path="*" element={<Navigate to={authRoutes.dashboard} replace/>}/>
    </Routes>
)