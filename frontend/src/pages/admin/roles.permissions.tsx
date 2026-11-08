import {useState} from 'react'
import {AppShell} from '../../layouts/AppShell'
import {usePermissions} from '../../hooks/usePermissions'
import {
    accessLabels,
    type AccessLevel,
    permissionMatrix,
    type RoleKey,
    roleLabels,
    roleShortLabels,
} from '../../data/permissions'

/*
 * Columns of the matrix. The platform administrator is deliberately left out - their access is the
 * whole system, so a column of "Full" tells nobody anything. Their own view still highlights nothing
 * and the row count is unchanged.
 */
const ROLE_ORDER: RoleKey[] = [
    'templeAdmin',
    'coAdmin',
    'religiousRepresentative',
    'committeeRepresentative',
    'family',
]

/* Colour per access level, so the matrix reads at a glance. */
const LEVEL_STYLE: Record<AccessLevel, string> = {
    full: 'bg-accent-green-50 text-accent-green border-accent-green/30',
    ownTemple: 'bg-sage-50 text-sage-800 border-sage-200',
    limited: 'bg-accent-gold-50 text-accent-gold border-accent-gold/30',
    none: 'bg-cream text-muted border-line',
}

const LevelPill = ({level}: { level: AccessLevel }) => (
    <span className={`inline-block rounded-md border px-2 py-0.5 text-[0.72rem] font-semibold ${LEVEL_STYLE[level]}`}>
        {accessLabels[level]}
    </span>
)

/**
 * Roles & Permissions - the initial matrix from section 14.3 of the development proposal.
 * The signed-in role's column is highlighted, and a Limited/No-access user only sees the rows
 * their own role can reach.
 */
export const PermissionMatrixPanel = () => {
    const {role, canEdit, roleLabel} = usePermissions()
    const [onlyMine, setOnlyMine] = useState(!canEdit('manageUserRoles'))

    const rows = onlyMine ? permissionMatrix.filter((row) => row.levels[role] !== 'none') : permissionMatrix

    return (
        <div className="flex flex-col gap-4">
            <header className="card p-5">
                <p className="text-[0.72rem] font-bold tracking-[0.16em] text-gold-600 uppercase">User Management</p>
                <h1 className="mt-1 font-temple text-[1.7rem] text-sage-900">Roles &amp; Permissions</h1>
                <p className="mt-1.5 max-w-240 text-[0.95rem] leading-relaxed text-ink-soft">
                    Who may do what, from section 14 of the development proposal. Your role,
                    <strong> {roleLabel}</strong>, is highlighted in the table. Temple-level users only ever
                    act on their own temple, and every protected action is authorised on the server and
                    written to the audit log.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                        className={`btn ${onlyMine ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setOnlyMine(true)}>
                        My permissions ({permissionMatrix.filter((r) => r.levels[role] !== 'none').length})
                    </button>
                    {canEdit('manageUserRoles') && (
                        <button
                            className={`btn ${onlyMine ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => setOnlyMine(false)}>
                            All roles ({permissionMatrix.length} functions)
                        </button>
                    )}
                    <span className="ml-auto flex flex-wrap items-center gap-2 text-[0.74rem] text-muted">
                    {(['full', 'ownTemple', 'limited', 'none'] as AccessLevel[]).map((level) => (
                        <LevelPill key={level} level={level}/>
                    ))}
                </span>
                </div>
            </header>

            <section className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-216 border-collapse text-left">
                        <thead>
                        <tr className="bg-cream-deep/70">
                            <th className="sticky left-0 z-10 bg-cream-deep/70 px-3 py-2.5 text-[0.8rem] font-bold text-ink">
                                Function
                            </th>
                            {ROLE_ORDER.map((key) => (
                                <th key={key}
                                    className={`px-2 py-2.5 text-center text-[0.76rem] font-bold ${
                                        key === role ? 'bg-sage-100 text-sage-900' : 'text-ink-soft'
                                    }`}>
                                    {roleShortLabels[key]}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((row) => (
                            <tr key={row.key} className="border-t border-line-soft align-top">
                                <th scope="row" className="sticky left-0 z-10 bg-paper px-3 py-2.5 text-left">
                                    <span className="block text-[0.86rem] font-semibold text-ink">{row.label}</span>
                                    <span className="block text-[0.72rem] text-muted">{row.area}</span>
                                </th>
                                {ROLE_ORDER.map((key) => (
                                    <td key={key}
                                        className={`px-2 py-2.5 text-center ${key === role ? 'bg-sage-50/70' : ''}`}>
                                        <LevelPill level={row.levels[key]}/>
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="card p-5">
                <h2 className="font-temple text-[1.15rem] text-sage-900">How access works here</h2>
                <ul className="mt-2 grid gap-1.5 text-[0.9rem] text-ink-soft sm:grid-cols-2">
                    <li>• The side menu only shows the rows your role is allowed to open.</li>
                    <li>• Opening a screen by URL without the permission shows an access-denied card.</li>
                    <li>• {roleLabels.templeAdmin} is the only role that can appoint or remove a Co-Administrator.</li>
                    <li>• {roleLabels.superAdmin} handles temple registration and platform settings, never daily temple
                        work.
                    </li>
                    <li>• A family keeps its account when it changes temple - no approval needed, and no duplicate
                        account.
                    </li>
                    <li>• Every role above “No access” is still limited to its own temple's data.</li>
                </ul>
            </section>
        </div>
    )
}

/** The matrix as a standalone screen (super admin keeps a direct route to it). */
export const RolesPermissionsPage = () => (
    <AppShell>
        <div className="mx-auto max-w-[105rem]">
            <PermissionMatrixPanel/>
        </div>
    </AppShell>
)