import {useLocation} from 'react-router-dom'
import type {AppUser, UserRole} from '../types'
import {portalRoutes} from './portalRoutes'

// Pass the authenticated user here when the login layer is connected.
export const portalUser: AppUser | undefined = undefined

const isUnder = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`)

/** Role + base path are derived from the URL until real authentication is connected. */
export const usePortalContext = (): { role: UserRole; basePath: string } => {
    const {pathname} = useLocation()
    if (isUnder(pathname, portalRoutes.templeAdmin)) return {role: 'templeAdmin', basePath: portalRoutes.templeAdmin}
    if (isUnder(pathname, portalRoutes.coAdmin)) return {role: 'coAdmin', basePath: portalRoutes.coAdmin}
    if (isUnder(pathname, portalRoutes.superAdmin)) return {role: 'superAdmin', basePath: portalRoutes.superAdmin}
    return {role: portalUser?.role ?? 'family', basePath: ''}
}
