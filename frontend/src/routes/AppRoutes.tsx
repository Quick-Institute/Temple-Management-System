
import {Navigate, Route, Routes} from 'react-router-dom'
import {AuthLoginPage} from '../pages/auth/auth.login'
import AnnouncementsPage from '../pages/announcements/AnnouncementsPage'
import {TempleDashboardPage} from '../pages/temple/temple.dashboard'
import {AppShell} from '../layouts/AppShell'
import {authRoutes} from './authRoutes'

export const AppRoutes = () => (
    <Routes>
        <Route path={authRoutes.login} element={<AuthLoginPage/>}/>
        <Route path="/dashboard" element={<TempleDashboardPage/>}/>
        <Route
            path="/announcements"
            element={
                <AppShell>
                    <AnnouncementsPage/>
                </AppShell>
            }
        />
        <Route path="*" element={<Navigate to={authRoutes.login} replace/>}/>
    </Routes>
)
