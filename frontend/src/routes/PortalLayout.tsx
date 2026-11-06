import type {ReactElement} from 'react'
import {Navigate, Outlet, useParams} from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import FamilyDashboard from '../pages/family/FamilyDashboard'
import TempleAdminDashboard from '../pages/temple/TempleAdminDashboard'
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard'
import {portalUser as currentUser, usePortalContext} from './portalContext'

/** Shared shell (sidebar + top bar) for every portal route. */
export const PortalLayout = () => {
    const {role, basePath} = usePortalContext()
    return (
        <MainLayout
            role={role}
            basePath={basePath}
            userName={currentUser?.name}
            avatarSrc={role === 'coAdmin' ? currentUser?.avatarSrc || '/co-admin-avatar.svg' : undefined}
        >
            <Outlet/>
        </MainLayout>
    )
}

/** Family-only pages; other roles use their own Dana management routes. */
export const FamilyOnly = ({children}: { children: ReactElement }) => {
    const {role} = usePortalContext()
    return role === 'family' ? children : <Navigate to="/dashboard" replace/>
}

/** Temporary page for portal routes that have no screen yet. */
export const PlaceholderPage = () => {
    const {page} = useParams()
    const title = (page ?? 'Page')
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    return <h1 className="text-3xl font-bold text-[#234936]">{title}</h1>
}


/** /dashboard - shows the dashboard that matches the current role (family by default). */
export const DashboardRoute = () => {
    const {role} = usePortalContext()
    if (role === 'superAdmin') return <SuperAdminDashboard user={currentUser}/>
    if (role === 'templeAdmin' || role === 'coAdmin') return <TempleAdminDashboard role={role} user={currentUser}/>
    return <FamilyDashboard user={currentUser}/>
}
