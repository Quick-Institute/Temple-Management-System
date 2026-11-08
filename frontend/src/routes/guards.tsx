import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {usePermissions} from '../hooks/usePermissions'
import type {PermissionKey} from '../data/permissions'
import {homeFor} from '../data/demoUsers'
import {AppShell} from '../layouts/AppShell'

/** Shown when the signed-in role may not open a screen (proposal 14.4 rule 1). */
export const AccessDenied = ({permission}: { permission?: PermissionKey }) => {
    const {role, roleLabel} = usePermissions()
    return (
        <div className="mx-auto max-w-184 py-6">
            <div className="card p-6 text-center">
                <span
                    className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lotus-50 text-[1.6rem] text-status-rose">
                    🔒
                </span>
                <h1 className="mt-3 font-temple text-[1.5rem] text-sage-900">You do not have access to this screen</h1>
                <p className="mx-auto mt-2 max-w-136 text-[0.95rem] text-ink-soft">
                    The <strong>{roleLabel}</strong> role cannot open this function. If you need it, ask the
                    Temple Admin to grant the permission - every access change is recorded in the audit log.
                </p>
                <Link className="btn btn-primary mt-5" to={homeFor(role)}>Back to my dashboard</Link>
                <p className="mt-3 text-[0.78rem] text-muted">
                    Signed in as {roleLabel}{permission ? ` · required permission: ${permission}` : ''}
                </p>
            </div>
        </div>
    )
}

/** Wraps a screen so the role must hold `permission` to see it (screen already has a shell). */
export const RequirePermission = ({permission, children}: { permission: PermissionKey; children: ReactNode }) => {
    const {can} = usePermissions()
    if (!can(permission)) return <AccessDenied permission={permission}/>
    return <>{children}</>
}

/** Same, for screens that carry their own AppShell (temple admin pages). */
export const RequirePermissionShell = ({permission, children}: { permission: PermissionKey; children: ReactNode }) => {
    const {can} = usePermissions()
    if (!can(permission)) {
        return (
            <AppShell>
                <AccessDenied permission={permission}/>
            </AppShell>
        )
    }
    return <>{children}</>
}

/** Requires the role to be able to change data, not just read it. */
export const RequireEdit = ({permission, children}: { permission: PermissionKey; children: ReactNode }) => {
    const {canEdit} = usePermissions()
    if (!canEdit(permission)) {
        return (
            <AppShell>
                <AccessDenied permission={permission}/>
            </AppShell>
        )
    }
    return <>{children}</>
}

/** Read-only notice for "Limited" cells, so a limited user knows why buttons are missing. */
export const LimitedNotice = ({text}: { text: string }) => (
    <div className="info-note">
        <span aria-hidden="true">ℹ️</span>
        <span>{text}</span>
    </div>
)