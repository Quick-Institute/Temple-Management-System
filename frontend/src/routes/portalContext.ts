import {useLocation} from 'react-router-dom'
import type {AppUser, UserRole} from '../types'
import {useAuth} from '../context/AuthContext'
import type {DemoUser} from '../data/demoUsers'
import type {RoleKey} from '../data/permissions'
import {portalRoutes} from './portalRoutes'

/** These roles share the co-admin portal screens. */
const STAFF_AS_CO_ADMIN: RoleKey[] = ['coAdmin', 'committeeRepresentative', 'religiousRepresentative']

/** Demo user -> the role names the upstream portal screens use. */
export const toAppUser = (user: DemoUser | null): AppUser | undefined =>
    user
        ? {
            id: user.id,
            name: user.name,
            role: STAFF_AS_CO_ADMIN.includes(user.role) ? 'coAdmin' : (user.role as UserRole),
            familyName: user.familyName,
            firstName: user.name.split(' ')[0],
            templeName: user.templeName,
            contactNumber: user.contactNumber,
            avatarSrc: STAFF_AS_CO_ADMIN.includes(user.role) ? '/co-admin-avatar.svg' : undefined,
        }
        : undefined

const isUnder = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`)

/**
 * Role + base path for the portal screens. The signed-in demo account decides the role; the URL
 * still wins inside /temple-admin, /co-admin and /super-admin so those portals stay browsable.
 */
export const usePortalContext = (): { role: UserRole; basePath: string } => {
    const {pathname} = useLocation()
    const {user} = useAuth()
    if (isUnder(pathname, portalRoutes.templeAdmin)) return {role: 'templeAdmin', basePath: portalRoutes.templeAdmin}
    if (isUnder(pathname, portalRoutes.coAdmin)) return {role: 'coAdmin', basePath: portalRoutes.coAdmin}
    if (isUnder(pathname, portalRoutes.superAdmin)) return {role: 'superAdmin', basePath: portalRoutes.superAdmin}
    return {role: toAppUser(user)?.role ?? 'family', basePath: ''}
}

/** The signed-in demo user in the shape the upstream screens expect. */
export const usePortalUser = (): AppUser | undefined => {
    const {user} = useAuth()
    return toAppUser(user)
}