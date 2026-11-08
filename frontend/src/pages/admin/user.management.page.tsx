import {useMemo, useState} from 'react'
import {
    BadgeCheck,
    Building2,
    Check,
    Mail,
    Pencil,
    Phone,
    Search,
    ShieldCheck,
    UserCog,
    UserRound,
    Users,
    X,
} from 'lucide-react'
import {AppShell} from '../../layouts/AppShell'
import {usePermissions} from '../../hooks/usePermissions'
import {useAuth} from '../../context/AuthContext'
import {
    MEMBER_CATEGORY_LABELS,
    MEMBER_PERMISSION_CHOICES,
    type MemberCategory,
    setMemberStatus,
    type TempleMember,
    toggleMemberPermission,
    useMembers,
} from '../../data/members'
import {PermissionMatrixPanel} from './roles.permissions'

type Tab = 'members' | 'matrix'

const CATEGORY_ICON: Record<MemberCategory, typeof UserRound> = {
    templeAdmin: ShieldCheck,
    committee: Users,
    family: UserRound,
}

const CATEGORY_TONE: Record<MemberCategory, string> = {
    templeAdmin: 'bg-accent-blue-50 text-accent-blue ring-1 ring-accent-blue/20',
    committee: 'bg-accent-gold-50 text-status-amber ring-1 ring-accent-gold/25',
    family: 'bg-accent-green-50 text-accent-green ring-1 ring-accent-green/20',
}

const STATUS_TONE: Record<TempleMember['status'], string> = {
    Active: 'bg-accent-green-50 text-accent-green border-accent-green/25',
    Invited: 'bg-accent-gold-50 text-status-amber border-accent-gold/30',
    Suspended: 'bg-status-rose/10 text-status-rose border-status-rose/25',
}

const initialsOf = (name: string) =>
    name
        .replace(/^Ven\.\s*/, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('')

/**
 * User Management.
 *
 *   Temple Admin  - every member of their temple, grouped by category, with per-member switches.
 *   Committee     - only the members of their own committee, read-only (no switches to flip).
 *   Super Admin   - every temple, with the same switches.
 *   Family user   - no User Management row at all, and the route is guarded.
 */
export const UserManagementPage = () => {
    const {role, canEdit, roleLabel} = usePermissions()
    const {user} = useAuth()
    const members = useMembers()
    const [tab, setTab] = useState<Tab>('members')
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState<MemberCategory | 'all'>('all')
    const [editingId, setEditingId] = useState<string | null>(null)

    const isSuperAdmin = role === 'superAdmin'
    /** Committee representatives see their committee only, and cannot change anything. */
    const committeeOnly = role === 'committeeRepresentative'
    const mayEdit = canEdit('manageUserRoles') && !committeeOnly

    const scoped = useMemo(() => {
        if (isSuperAdmin) return members
        if (committeeOnly) {
            return members.filter(
                (member) => member.category === 'committee' && member.templeName === user?.templeName,
            )
        }
        return members.filter((member) => member.templeName === (user?.templeName ?? member.templeName))
    }, [members, isSuperAdmin, committeeOnly, user?.templeName])

    const term = query.trim().toLowerCase()
    const visible = scoped.filter((member) => {
        const matchesCategory = category === 'all' || member.category === category
        if (!matchesCategory) return false
        if (!term) return true
        return [member.name, member.email, member.phone, member.designation, member.familyName, member.committee]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(term)
    })

    const counts = useMemo(() => ({
        templeAdmin: scoped.filter((m) => m.category === 'templeAdmin').length,
        committee: scoped.filter((m) => m.category === 'committee').length,
        family: scoped.filter((m) => m.category === 'family').length,
    }), [scoped])

    const editing = editingId ? scoped.find((member) => member.id === editingId) ?? null : null

    const CATEGORY_TABS: { key: MemberCategory | 'all'; label: string; count: number }[] = [
        {key: 'all', label: 'All members', count: scoped.length},
        {key: 'templeAdmin', label: MEMBER_CATEGORY_LABELS.templeAdmin, count: counts.templeAdmin},
        {key: 'committee', label: MEMBER_CATEGORY_LABELS.committee, count: counts.committee},
        {key: 'family', label: MEMBER_CATEGORY_LABELS.family, count: counts.family},
    ]

    return (
        <AppShell>
            <div className="mx-auto flex max-w-352 flex-col gap-4">
                <header className="card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[0.72rem] font-bold tracking-[0.16em] text-gold-600 uppercase">
                                User Management
                            </p>
                            <h1 className="mt-1 font-temple text-[1.7rem] leading-tight text-sage-900">
                                {committeeOnly ? 'My Committee' : 'Temple Members'}
                            </h1>
                            <p className="mt-1.5 max-w-208 text-[0.95rem] leading-relaxed text-ink-soft">
                                {committeeOnly ? (
                                    <>
                                        These are the members of your committee at
                                        <strong> {user?.templeName}</strong>. Your role can view the committee
                                        list; only the {roleLabel === 'Committee Representative'
                                        ? 'Temple Admin'
                                        : 'Temple Admin'} can change what a member may do.
                                    </>
                                ) : isSuperAdmin ? (
                                    <>Every member of every temple on the platform. You hold full access here.</>
                                ) : (
                                    <>Everyone registered under <strong>{user?.templeName}</strong>, grouped by
                                        what they are. Tick a permission to grant it - untick it to take it away.</>
                                )}
                            </p>
                        </div>
                        <span
                            className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-3 py-1.5 text-[0.78rem] font-semibold text-sage-800">
                            <UserCog size={15} strokeWidth={1.9}/> {roleLabel}
                        </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <div className="flex rounded-xl border border-line bg-cream p-1">
                            <button
                                className={`rounded-lg px-3 py-1.5 text-[0.82rem] font-semibold transition ${
                                    tab === 'members' ? 'bg-white text-sage-900 shadow-sm' : 'text-ink-soft hover:text-sage-900'
                                }`}
                                onClick={() => setTab('members')}>
                                Members
                            </button>
                            <button
                                className={`rounded-lg px-3 py-1.5 text-[0.82rem] font-semibold transition ${
                                    tab === 'matrix' ? 'bg-white text-sage-900 shadow-sm' : 'text-ink-soft hover:text-sage-900'
                                }`}
                                onClick={() => setTab('matrix')}>
                                Roles &amp; permissions
                            </button>
                        </div>
                    </div>
                </header>

                {tab === 'matrix' ? (
                    <PermissionMatrixPanel/>
                ) : (
                    <>
                        {/* Search + category filters */}
                        <section className="card p-4">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <div
                                    className="flex min-w-[16rem] flex-1 items-center gap-2 rounded-xl border border-line bg-cream px-3.5 py-2.5">
                                    <Search size={17} className="flex-none text-muted"/>
                                    <input
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder="Search a member by name, email, phone or family..."
                                        aria-label="Search members"
                                        className="w-full bg-transparent text-[0.92rem] placeholder:text-[#8299a8] focus:outline-none"/>
                                    {query && (
                                        <button onClick={() => setQuery('')} aria-label="Clear search"
                                                className="flex-none rounded-full p-1 text-muted hover:bg-white hover:text-sage-800">
                                            <X size={14}/>
                                        </button>
                                    )}
                                </div>
                                <span className="text-[0.82rem] text-muted">
                                    {visible.length} of {scoped.length} shown
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {CATEGORY_TABS.map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => setCategory(item.key)}
                                        aria-pressed={category === item.key}
                                        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.84rem] font-semibold transition ${
                                            category === item.key
                                                ? 'border-sage-700 bg-sage-800 text-white'
                                                : 'border-line bg-white text-ink-soft hover:border-sage-300 hover:text-sage-900'
                                        }`}>
                                        {item.label}
                                        <span className={`rounded-full px-1.5 py-0.5 text-[0.7rem] ${
                                            category === item.key ? 'bg-white/20 text-white' : 'bg-cream text-muted'
                                        }`}>{item.count}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Member cards */}
                        {visible.length === 0 ? (
                            <section className="card p-10 text-center">
                                <UserRound size={30} className="mx-auto text-muted"/>
                                <h2 className="mt-2 font-temple text-[1.15rem] text-sage-900">No member matches</h2>
                                <p className="mt-1 text-[0.9rem] text-ink-soft">
                                    Try another name, or clear the category filter.
                                </p>
                            </section>
                        ) : (
                            <ul className="grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
                                {visible.map((member) => {
                                    const CategoryIcon = CATEGORY_ICON[member.category]
                                    return (
                                        <li key={member.id}
                                            className="card flex flex-col gap-3 p-4 transition hover:border-sage-300">
                                            <div className="flex items-start gap-3">
                                                <span
                                                    className={`grid h-11 w-11 flex-none place-items-center rounded-xl text-[0.86rem] font-bold ${CATEGORY_TONE[member.category]}`}>
                                                    {initialsOf(member.name)}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <h2 className="truncate text-[0.98rem] leading-tight font-bold text-sage-900">
                                                        {member.name}
                                                    </h2>
                                                    <p className="truncate text-[0.8rem] text-ink-soft">
                                                        {member.designation}
                                                        {member.committee ? ` · ${member.committee}` : ''}
                                                        {member.familyName ? ` · ${member.familyName}` : ''}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`flex-none rounded-md border px-2 py-0.5 text-[0.68rem] font-bold ${STATUS_TONE[member.status]}`}>
                                                    {member.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-1 text-[0.78rem] text-ink-soft">
                                                <span className="inline-flex items-center gap-1.5 truncate">
                                                    <Mail size={13} className="flex-none text-muted"/> {member.email}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Phone size={13} className="flex-none text-muted"/> {member.phone}
                                                </span>
                                                {(isSuperAdmin || committeeOnly) && (
                                                    <span className="inline-flex items-center gap-1.5 truncate">
                                                        <Building2 size={13}
                                                                   className="flex-none text-muted"/> {member.templeName}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[0.7rem] font-bold ${CATEGORY_TONE[member.category]}`}>
                                                    <CategoryIcon size={12}/> {MEMBER_CATEGORY_LABELS[member.category]}
                                                </span>
                                                {member.permissions.length > 0 ? (
                                                    <span className="text-[0.72rem] text-muted">
                                                        {member.permissions.length} permission{member.permissions.length === 1 ? '' : 's'}
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="text-[0.72rem] text-muted">No extra permissions</span>
                                                )}
                                            </div>

                                            <div
                                                className="mt-auto flex items-center justify-between gap-2 border-t border-line-soft pt-3">
                                                <span
                                                    className="inline-flex items-center gap-1.5 text-[0.72rem] text-muted">
                                                    <BadgeCheck size={13}/> {member.id}
                                                </span>
                                                {mayEdit ? (
                                                    <button className="btn btn-secondary px-3! py-1.5! text-[0.8rem]"
                                                            onClick={() => setEditingId(member.id)}>
                                                        <Pencil size={14}/> Edit permissions
                                                    </button>
                                                ) : (
                                                    <span className="text-[0.74rem] text-muted">View only</span>
                                                )}
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}

                        {!mayEdit && (
                            <p className="rounded-xl border border-line bg-cream px-4 py-3 text-[0.85rem] text-ink-soft">
                                Your role can look at this list but cannot change permissions. Ask the
                                Temple Admin to make a change - every change is written to the audit log.
                            </p>
                        )}
                    </>
                )}
            </div>

            {editing && (
                <PermissionEditor
                    member={editing}
                    onClose={() => setEditingId(null)}/>
            )}
        </AppShell>
    )
}

/** The checkbox panel for one member. Writes straight into the member store. */
const PermissionEditor = ({member, onClose}: { member: TempleMember; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-sage-950/45 p-0 sm:items-center sm:p-4"
         role="dialog" aria-modal="true" aria-label={`Permissions for ${member.name}`}>
        <div
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-paper p-5 shadow-2xl sm:max-w-136 sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[0.7rem] font-bold tracking-[0.16em] text-gold-600 uppercase">
                        Edit permissions
                    </p>
                    <h2 className="mt-0.5 truncate font-temple text-[1.3rem] text-sage-900">{member.name}</h2>
                    <p className="text-[0.84rem] text-ink-soft">
                        {MEMBER_CATEGORY_LABELS[member.category]} · {member.designation}
                    </p>
                </div>
                <button className="rounded-lg p-1.5 text-muted hover:bg-cream hover:text-sage-900"
                        onClick={onClose} aria-label="Close">
                    <X size={17}/>
                </button>
            </div>

            <ul className="mt-4 flex list-none flex-col gap-2 p-0">
                {MEMBER_PERMISSION_CHOICES.map((choice) => {
                    const checked = member.permissions.includes(choice.key)
                    return (
                        <li key={choice.key}>
                            <label
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition ${
                                    checked ? 'border-sage-400 bg-sage-50' : 'border-line bg-white hover:border-sage-300'
                                }`}>
                                <span
                                    className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-[5px] border-2 transition ${
                                        checked ? 'border-sage-700 bg-sage-700 text-white' : 'border-line bg-white'
                                    }`}>
                                    {checked && <Check size={13} strokeWidth={3}/>}
                                </span>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={checked}
                                    onChange={() => toggleMemberPermission(member.id, choice.key)}/>
                                <span className="min-w-0">
                                    <span
                                        className="block text-[0.92rem] font-semibold text-sage-900">{choice.label}</span>
                                    <span className="block text-[0.78rem] text-ink-soft">{choice.hint}</span>
                                </span>
                            </label>
                        </li>
                    )
                })}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line-soft pt-4">
                <div className="flex gap-2">
                    {(['Active', 'Suspended'] as const).map((status) => (
                        <button key={status}
                                className={`btn ${member.status === status ? 'btn-primary' : 'btn-secondary'} px-3! py-1.5! text-[0.8rem]`}
                                onClick={() => setMemberStatus(member.id, status)}>
                            {status === 'Active' ? 'Set active' : 'Suspend'}
                        </button>
                    ))}
                </div>
                <button className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
        </div>
    </div>
)