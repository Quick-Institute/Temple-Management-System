import {useAuth} from '../context/AuthContext'
import type {DemoRole} from '../data/demoUsers'
import {
    accessLabels,
    type AccessLevel,
    canEdit,
    isAllowed,
    levelFor,
    type PermissionKey,
    permissionsForRole,
    type RoleKey,
    roleLabels,
    roleShortLabels,
} from '../data/permissions'

export type PermissionsApi = {
    role: RoleKey
    roleLabel: string
    roleShortLabel: string
    /** Raw matrix cell for this role, e.g. "Own temple". */
    level: (permission: PermissionKey) => AccessLevel
    levelLabel: (permission: PermissionKey) => string
    /** Any access above "No access". */
    can: (permission: PermissionKey) => boolean
    /** May change things, not only read them. */
    canEdit: (permission: PermissionKey) => boolean
    /** The matrix rows this role can reach. */
    rows: ReturnType<typeof permissionsForRole>
}

/**
 * Reads the signed-in role and answers permission questions from the matrix in
 * src/data/permissions.ts (proposal section 14, Table 3). Before sign-in the demo falls back to
 * Temple Admin so a direct URL still renders something useful.
 */
export const usePermissions = (): PermissionsApi => {
    const {user} = useAuth()
    const role: RoleKey = (user?.role ?? 'templeAdmin') as DemoRole

    return {
        role,
        roleLabel: roleLabels[role],
        roleShortLabel: roleShortLabels[role],
        level: (permission) => levelFor(role, permission),
        levelLabel: (permission) => accessLabels[levelFor(role, permission)],
        can: (permission) => isAllowed(role, permission),
        canEdit: (permission) => canEdit(role, permission),
        rows: permissionsForRole(role),
    }
}