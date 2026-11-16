/* ------------------------------------------------------------------
   Frontend-only temple access rules.

   The backend does not exist yet, so these helpers are the single place
   the UI asks "may this signed-in demo account touch this temple record?".
   When the API arrives, the same questions should be answered server-side.
   ------------------------------------------------------------------ */

import type {DemoUser} from './demoUsers'
import type {RoleKey} from './permissions'
import {canEdit, isAllowed} from './permissions'
import {canDrop, isEditable, type TempleRecord} from './templeStatus'

const sameEmail = (a?: string | null, b?: string | null) =>
    Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase())

/**
 * Temples this account is scoped to.
 *
 * - Super Administrator: every temple.
 * - Temple Admin: temples they own (`ownerEmail`).
 * - Co-Administrator: the temple whose Co-Administrator list contains their email.
 *   The demo account also carries `templeName`, so that is used as a frontend
 *   fallback until backend assignments exist.
 * - Family / committee / religious representatives: their own temple by name,
 *   for read-only temple information.
 */
export const assignedTemplesFor = (
    user: DemoUser | null | undefined,
    records: TempleRecord[],
): TempleRecord[] => {
    if (!user) return []
    const role = user.role as RoleKey

    if (role === 'superAdmin') return records

    if (role === 'templeAdmin') {
        const owned = records.filter((record) => sameEmail(record.ownerEmail, user.identifier))
        if (owned.length) return owned
        return records.filter((record) => record.name === user.templeName)
    }

    if (role === 'coAdmin') {
        const appointed = records.filter((record) =>
            record.coAdmins.some((admin) => sameEmail(admin.email, user.identifier) && admin.status !== 'Suspended'),
        )
        if (appointed.length) return appointed
        /* Frontend demo fallback: the account's assigned temple name. */
        return records.filter((record) => record.name === user.templeName)
    }

    return records.filter((record) => record.name === user.templeName)
}

export const assignedTempleFor = (
    user: DemoUser | null | undefined,
    records: TempleRecord[],
): TempleRecord | undefined => assignedTemplesFor(user, records)[0]

/** May this account open the temple record at all? */
export const canAccessTemple = (
    user: DemoUser | null | undefined,
    record: TempleRecord | undefined,
): boolean => {
    if (!user || !record) return false
    return assignedTemplesFor(user, [record]).some((item) => item.id === record.id)
}

/** Creating a new temple is reserved for Super Admin / Temple Admin. */
export const canCreateTemple = (role: RoleKey): boolean =>
    role === 'superAdmin' || role === 'templeAdmin'

/** May this account change temple information for this record? */
export const canManageTempleRecord = (
    user: DemoUser | null | undefined,
    record: TempleRecord | undefined,
): boolean => {
    if (!user || !record) return false
    const role = user.role as RoleKey
    if (!canEdit(role, 'manageTempleInformation')) return false
    return canAccessTemple(user, record)
}

/** Update is allowed only while the record lifecycle is editable. */
export const canEditTempleRecord = (
    user: DemoUser | null | undefined,
    record: TempleRecord | undefined,
): boolean => canManageTempleRecord(user, record) && Boolean(record && isEditable(record.status))

/**
 * Delete follows the existing lifecycle:
 * - pending / changes-requested requests can be dropped outright;
 * - active temples become a deletion request for the Super Administrator;
 * - a deletion request can be cancelled.
 */
export const canDeleteTempleRecord = (
    user: DemoUser | null | undefined,
    record: TempleRecord | undefined,
): boolean =>
    canManageTempleRecord(user, record)
    && Boolean(record && (canDrop(record.status) || record.status === 'Active' || record.status === 'Deletion requested'))

/** Co-Administrator appointments remain a Temple Admin / Super Admin function. */
export const canAppointCoAdminFor = (
    user: DemoUser | null | undefined,
    record: TempleRecord | undefined,
): boolean => {
    if (!user || !record) return false
    const role = user.role as RoleKey
    return canManageTempleRecord(user, record) && isAllowed(role, 'appointCoAdmin') && isEditable(record.status)
}