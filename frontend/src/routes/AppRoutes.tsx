import {Navigate, Route, Routes} from 'react-router-dom'
import {AuthLoginPage} from '../pages/auth/auth.login'
import {authRoutes} from './authRoutes'
import DonationPage from '../pages/DonationPage'

export const AppRoutes = () => (
    <Routes>
        <Route path={authRoutes.login} element={<AuthLoginPage/>} />
        <Route path="/donation" element={<DonationPage />} />
        <Route path="*" element={<Navigate to={authRoutes.login} replace/>} />
    </Routes>
)