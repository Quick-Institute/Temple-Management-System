import {useState} from 'react'
import {Link, Navigate, useLocation, useParams} from 'react-router-dom'
import {
    ArrowLeft,
    Banknote,
    Building2,
    CalendarCheck,
    CircleAlert,
    CircleCheck,
    FileText,
    Landmark,
    Mail,
    MapPin,
    Pause,
    Pencil,
    Phone,
    Play,
    PlusCircle,
    Printer,
    Ruler,
    ShieldCheck,
    Trash2,
    Undo2,
    UserCog,
    UserPlus,
    Users2,
} from 'lucide-react'
import {AppShell} from '../../layouts/AppShell'
import {useTemples} from '../../data/templeStore.tsx'
import {useTranslation} from 'react-i18next'
import type {CoAdministrator} from '../../data/templeStatus'
import {canDrop, coAdminRoleShort, isEditable, prettyDate, statusTone} from '../../data/templeStatus'
import {adminRoutes} from '../../routes/adminRoutes'

/** One label above one value - the only row style on this page. */
const Row = ({label, children}: { label: string; children: React.ReactNode }) => (
    <div className="border-b border-line-soft py-3">
        <div className="text-[0.85rem] font-semibold tracking-[0.06em] text-muted uppercase">{label}</div>
        <div className="mt-0.5 text-[1.12rem] font-medium wrap-break-word text-ink">{children}</div>
    </div>
)

const Card = ({icon, title, action, children}: {
    icon: React.ReactNode
    title: string
    action?: React.ReactNode
    children: React.ReactNode
}) => (
    <section className="section-card">
        <div className="section-card-head">
            <span
                className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-gold-50 text-gold-700">{icon}</span>
            <h2 className="font-temple text-[1.25rem] font-semibold text-sage-900">{title}</h2>
            {action && <span className="ml-auto">{action}</span>}
        </div>
        <div className="px-4 sm:px-5">{children}</div>
    </section>
)

const TABS = [
    {key: 'summary', labelKey: 'details.summary'},
    {key: 'place', labelKey: 'details.whereItIs'},
    {key: 'people', labelKey: 'details.people'},
    {key: 'facilities', labelKey: 'details.facilitiesDana'},
    {key: 'documents', labelKey: 'details.documents'},
] as const

type TabKey = typeof TABS[number]['key']

export const TempleDetailsPage = () => {
    const {id} = useParams<{ id: string }>()
    const {t} = useTranslation()
    const {getRecord, requestDeletion, cancelDeletion, dropRequest, setCoAdminStatus} = useTemples()
    /* Which Co-Administrator is open in the form: a new one (null draft) or one being edited. */
    const [coAdminForm, setCoAdminForm] = useState<{ admin: CoAdministrator | null } | null>(null)
    const location = useLocation()
    const [tab, setTab] = useState<TabKey>('summary')
    const flash = (location.state as { flash?: string } | null)?.flash

    const temple = id ? getRecord(id) : undefined
    /* A record that was dropped while its detail page was open goes back to the list. */
    if (!temple) return <Navigate to={adminRoutes.templeInformation} replace/>

    const seats = temple.capacity.reduce((total, row) => total + (Number(row.seats) || 0), 0)

    return (
        <AppShell>
            <div className="mx-auto flex max-w-368 flex-col gap-5">

                {/* Header */}
                <header className="flex flex-col gap-3">
                    <Link to={adminRoutes.templeInformation}
                          className="inline-flex w-fit items-center gap-2 text-[1rem] font-semibold text-sage-700 hover:text-sage-900">
                        <ArrowLeft size={18}/> {t('details.backToAll')}
                    </Link>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <h1 className="font-temple text-[1.85rem] leading-tight font-semibold text-sage-900 sm:text-[2.2rem]">
                                {temple.name}
                            </h1>
                            <div className="mt-2 flex flex-wrap items-center gap-2.5">
                                <span
                                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-[0.95rem] font-semibold ${statusTone[temple.status]}`}>
                                    <span className="h-2 w-2 rounded-full bg-current"/>{temple.status}
                                </span>
                                <span className="text-[1.02rem] text-ink-soft">
                                    {temple.village}, {temple.district}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {isEditable(temple.status) && (
                                <Link to={`${adminRoutes.templeAdd}?mode=edit&id=${temple.id}`}
                                      className="btn btn-primary">
                                    <Pencil size={18}/> {t('details.editTemple')}
                                </Link>
                            )}
                            <button type="button" className="btn btn-outline" onClick={() => window.print()}>
                                <Printer size={18}/> {t('common.print')}
                            </button>
                        </div>
                    </div>
                </header>

                {flash && (
                    <div role="status"
                         className="flex items-start gap-3 rounded-xl border border-accent-green/30 bg-accent-green-50 px-4 py-3 text-[1rem] text-accent-green">
                        <CircleCheck size={20} className="mt-0.5 flex-none"/>
                        <span>{flash === 'created'
                            ? 'Temple sent. The office will check it and give the registration ID.'
                            : 'Temple details saved.'}</span>
                    </div>
                )}

                {temple.status === 'Pending approval' && (
                    <div
                        className="flex items-start gap-3 rounded-xl border border-accent-gold/40 bg-accent-gold-50 px-4 py-3 text-[1rem] text-status-amber">
                        <CircleAlert size={20} className="mt-0.5 flex-none"/>
                        <span>Waiting for approval. The registration ID is given on approval. You can still edit or
                            remove this request.</span>
                    </div>
                )}

                {temple.status === 'Changes requested' && (
                    <div
                        className="flex items-start gap-3 rounded-xl border border-accent-blue/30 bg-accent-blue-50 px-4 py-3 text-[1rem] text-accent-blue">
                        <CircleAlert size={20} className="mt-0.5 flex-none"/>
                        <span><strong className="font-semibold">The office asked for a change:</strong>{' '}
                            {temple.reviewNote ?? 'Please check the details.'} Edit the temple and save it to send it
                            again.</span>
                    </div>
                )}

                {temple.status === 'Deletion requested' && (
                    <div
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-status-rose/30 bg-lotus-50 px-4 py-3 text-[1rem] text-status-rose">
                        <Trash2 size={20} className="flex-none"/>
                        <span>Asked to delete on {prettyDate(temple.deletionRequestedOn)} - waiting for the office.</span>
                        <button type="button" className="btn btn-outline btn-sm ml-auto"
                                onClick={() => cancelDeletion(temple.id)}>
                            <Undo2 size={17}/> Keep this temple
                        </button>
                    </div>
                )}

                {/* Three big facts */}
                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        {
                            label: t('list.registrationId'), value: temple.registrationId ?? t('list.onApproval'),
                            icon: <ShieldCheck size={22}/>, tone: 'bg-sage-800 text-white'
                        },
                        {
                            label: t('details.seatsForDana'), value: String(seats), icon: <Users2 size={22}/>,
                            tone: 'bg-accent-green text-white'
                        },
                        {
                            label: t('details.coAdminsCount'),
                            value: String(temple.coAdmins.length),
                            icon: <UserCog size={22}/>,
                            tone: 'bg-accent-blue text-white'
                        },
                    ].map((item) => (
                        <div key={item.label}
                             className="flex items-center gap-3.5 rounded-2xl border border-line bg-paper px-4 py-4">
                            <span className={`grid h-12 w-12 flex-none place-items-center rounded-xl ${item.tone}`}>
                                {item.icon}
                            </span>
                            <div className="min-w-0">
                                <div className="text-[1.35rem] leading-tight font-semibold wrap-break-word text-sage-900">
                                    {item.value}
                                </div>
                                <div className="text-[0.95rem] text-muted">{item.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sections as big tabs - one thing on screen at a time */}
                <div className="flex flex-wrap gap-2" role="tablist" aria-label="Temple details">
                    {TABS.map((item) => {
                        const active = tab === item.key
                        return (
                            <button key={item.key} type="button" role="tab" aria-selected={active}
                                    onClick={() => setTab(item.key)}
                                    className={`min-h-12 rounded-full border px-5 text-[1.02rem] font-semibold transition ${
                                        active
                                            ? 'border-sage-800 bg-sage-800 text-white'
                                            : 'border-line bg-white text-ink-soft hover:border-sage-300 hover:bg-sage-50'
                                    }`}>
                                {t(item.labelKey)}
                            </button>
                        )
                    })}
                </div>

                {tab === 'summary' && (
                    <div className="grid gap-4 xl:grid-cols-2">
                        <Card icon={<FileText size={19}/>} title={t('dash.templeInfo')}>
                            <Row label="Temple name">{temple.name}</Row>
                            <Row label="Temple type">{temple.type}</Row>
                            <Row label="Established">{temple.established || '-'}</Row>
                            <Row label="Chief incumbent">{temple.chiefIncumbent || '-'}</Row>
                            <Row label="Land extent">{temple.landExtent || '-'}</Row>
                            {temple.description && (
                                <div className="py-4">
                                    <div
                                        className="text-[0.85rem] font-semibold tracking-[0.06em] text-muted uppercase">
                                        Description
                                    </div>
                                    <p className="mt-1 text-[1.05rem] leading-relaxed text-ink-soft">{temple.description}</p>
                                </div>
                            )}
                        </Card>

                        <Card icon={<ShieldCheck size={19}/>} title="Registration">
                            <Row label="Registration ID">
                                {temple.registrationId
                                    ? <span className="mono font-semibold">{temple.registrationId}</span>
                                    : 'Given on approval'}
                            </Row>
                            <Row label="Status">{temple.status}</Row>
                            <Row label="Sent for approval">{prettyDate(temple.submittedOn)}</Row>
                            <Row label="Approved">{prettyDate(temple.approvedOn)}</Row>
                            <div className="py-4">
                                <p className="text-[0.95rem] leading-relaxed text-muted">
                                    Registration IDs come from Quick Solutions (PVT) Ltd. You cannot change it here.
                                </p>
                            </div>
                        </Card>
                    </div>
                )}

                {tab === 'place' && (
                    <div className="grid gap-4 xl:grid-cols-2">
                        <Card icon={<MapPin size={19}/>} title="Where it is">
                            <Row label="Address">{temple.address || '-'}</Row>
                            <Row label="Village">{temple.village}</Row>
                            <Row label="Grama Niladhari division">{temple.gnDivision || '-'}</Row>
                            <Row label="Divisional Secretariat">{temple.dsDivision || '-'}</Row>
                            <Row label="District">{temple.district}</Row>
                            <Row label="Province">{temple.province}</Row>
                            <Row label="Postal code">{temple.postalCode || '-'}</Row>
                        </Card>

                        <Card icon={<Phone size={19}/>} title="How to reach the temple">
                            <Row label="Phone">{temple.phone || '-'}</Row>
                            <Row label="Second phone">{temple.phoneAlt || '-'}</Row>
                            <Row label="Email"><span className="break-all">{temple.email || '-'}</span></Row>
                            <Row label="Website">{temple.website || '-'}</Row>
                        </Card>
                    </div>
                )}

                {tab === 'people' && (
                    <div className="flex flex-col gap-4">
                        <Card icon={<UserCog size={19}/>} title={t('details.coAdmins')}
                              action={isEditable(temple.status) ? (
                                  <button type="button" className="btn btn-outline btn-sm"
                                          onClick={() => setCoAdminForm({admin: null})}>
                                      <UserPlus size={17}/> {t('details.appoint')}
                                  </button>
                              ) : undefined}>
                            {isEditable(temple.status) && coAdminForm && (
                                <CoAdminForm templeId={temple.id}
                                             admin={coAdminForm.admin}
                                             onDone={() => setCoAdminForm(null)}/>
                            )}
                            {temple.coAdmins.length > 0 ? (
                                <div className="grid gap-4 py-4 sm:grid-cols-2">
                                    {temple.coAdmins.map((admin) => (
                                        <div key={admin.id}
                                             className="rounded-xl border border-line bg-cream/40 px-4 py-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="badge badge-gold">{coAdminRoleShort(admin.role)}</span>
                                                <span className={`badge ${
                                                    admin.status === 'Active' ? 'badge-green'
                                                        : admin.status === 'Suspended' ? 'border-status-rose/30 bg-lotus-50 text-status-rose'
                                                            : 'badge-neutral'
                                                }`}>
                                                    {admin.status}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-[1.12rem] font-semibold text-sage-900">
                                                {admin.name || 'Name not set'}
                                            </div>
                                            <div className="mt-1.5 flex flex-col gap-1 text-[0.98rem] text-ink-soft">
                                                <span className="inline-flex items-center gap-2">
                                                    <Phone size={15} className="text-sage-600"/>{admin.phone || '-'}
                                                </span>
                                                <span className="inline-flex items-center gap-2 break-all">
                                                    <Mail size={15} className="text-sage-600"/>{admin.email || '-'}
                                                </span>
                                                <span className="text-[0.9rem] text-muted">
                                                    Appointed {prettyDate(admin.appointedOn)} · {admin.reference || 'no reference'}
                                                </span>
                                            </div>
                                            {isEditable(temple.status) && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <button type="button" className="btn btn-outline btn-sm"
                                                            onClick={() => setCoAdminForm({admin})}>
                                                        <Pencil size={16}/> {t('details.edit')}
                                                    </button>
                                                    {admin.status === 'Suspended' ? (
                                                        <button type="button" className="btn btn-outline btn-sm"
                                                                onClick={() => setCoAdminStatus(temple.id, admin.id, 'Active')}>
                                                            <Play size={16}/> {t('details.resume')}
                                                        </button>
                                                    ) : (
                                                        <button type="button" className="btn btn-outline btn-sm"
                                                                onClick={() => setCoAdminStatus(temple.id, admin.id, 'Suspended')}>
                                                            <Pause size={16}/> {t('details.suspend')}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-start gap-3 py-5">
                                    <p className="text-[1.02rem] text-ink-soft">
                                        {t('details.noCoAdmins')}
                                    </p>
                                    <button type="button" className="btn btn-primary btn-sm"
                                            onClick={() => setCoAdminForm({admin: null})}>
                                        <UserPlus size={17}/> {t('details.appointOne')}
                                    </button>
                                </div>
                            )}
                            <div
                                className="flex items-start gap-2 border-t border-line-soft py-3 text-[0.92rem] text-muted">
                                <ShieldCheck size={16} className="mt-0.5 flex-none text-gold-700"/>
                                {t('details.coAdminNote')}
                            </div>
                        </Card>

                        <Card icon={<Users2 size={19}/>} title={t('details.dayakaSabha')}>
                            {temple.committee.length > 0 ? (
                                <div className="divide-y divide-line-soft">
                                    {temple.committee.map((member) => (
                                        <div key={`${member.role}-${member.name}`}
                                             className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                                            <div>
                                                <div
                                                    className="text-[0.85rem] font-semibold tracking-[0.06em] text-muted uppercase">
                                                    {member.role}
                                                </div>
                                                <div className="text-[1.08rem] font-medium text-ink">{member.name}</div>
                                            </div>
                                            <span className="mono text-[1rem] text-ink-soft">{member.phone}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-5 text-[1.02rem] text-muted">
                                    The committee can be added after the temple is approved.
                                </p>
                            )}
                        </Card>
                    </div>
                )}

                {tab === 'facilities' && (
                    <div className="grid gap-4 xl:grid-cols-2">
                        <Card icon={<Ruler size={19}/>} title="Seating">
                            <div className="divide-y divide-line-soft">
                                {temple.capacity.length > 0 ? temple.capacity.map((row) => (
                                    <div key={row.id} className="flex items-center justify-between gap-3 py-3">
                                        <span
                                            className="text-[1.08rem] font-medium text-ink">{row.label || 'Unnamed space'}</span>
                                        <span
                                            className="text-[1.08rem] font-semibold text-sage-800">{row.seats || '-'} seats</span>
                                    </div>
                                )) : <p className="py-4 text-[1.02rem] text-muted">No seating recorded yet.</p>}
                            </div>
                            <Row label="Total seats">{seats}</Row>
                        </Card>

                        <Card icon={<Building2 size={19}/>} title="Facilities">
                            <div className="flex flex-wrap gap-2 py-4">
                                {temple.facilities.length > 0
                                    ? temple.facilities.map((facility) => (
                                        <span key={facility} className="chip">
                                            <CircleCheck size={15} className="text-accent-green"/>{facility}
                                        </span>
                                    ))
                                    : <p className="text-[1.02rem] text-muted">No facilities recorded yet.</p>}
                            </div>
                        </Card>

                        <Card icon={<CalendarCheck size={19}/>} title="Dana sessions">
                            <div className="flex flex-wrap gap-2 py-4">
                                {temple.danaSessions.length > 0
                                    ? temple.danaSessions.map((session) => (
                                        <span key={session} className="chip">{session}</span>
                                    ))
                                    : <p className="text-[1.02rem] text-muted">No Dana sessions recorded.</p>}
                            </div>
                        </Card>

                        <Card icon={<Banknote size={19}/>} title="Bank account">
                            <Row label="Bank">{temple.banking.bank || '-'}</Row>
                            <Row label="Branch">{temple.banking.branch || '-'}</Row>
                            <Row label="Account name">{temple.banking.accountName || '-'}</Row>
                            <Row label="Account number">
                                {temple.banking.accountNumber
                                    ? <span className="mono">•••• {temple.banking.accountNumber.slice(-4)}</span>
                                    : '-'}
                            </Row>
                        </Card>
                    </div>
                )}

                {tab === 'documents' && (
                    <div className="grid gap-4 xl:grid-cols-2">
                        <Card icon={<FileText size={19}/>} title="Photos & documents">
                            {temple.documents.length > 0 ? (
                                <ul className="m-0 list-none divide-y divide-line-soft p-0">
                                    {temple.documents.map((doc) => (
                                        <li key={doc.name} className="flex items-center gap-3 py-3.5">
                                            <span
                                                className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-cream text-[0.72rem] font-bold text-ink-soft">
                                                {doc.kind}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="text-[1.05rem] font-medium text-ink">{doc.name}</div>
                                                <div className="text-[0.9rem] text-muted">Updated {doc.updated}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="py-5 text-[1.02rem] text-muted">No documents uploaded yet.</p>
                            )}
                        </Card>

                        <Card icon={<ShieldCheck size={19}/>} title="Other actions">
                            <div className="flex flex-col items-start gap-3 py-4">
                                {canDrop(temple.status) && (
                                    <button type="button" className="btn btn-outline"
                                            onClick={() => {
                                                dropRequest(temple.id)
                                                window.location.assign(adminRoutes.templeInformation)
                                            }}>
                                        <Trash2 size={18}/> Remove this request
                                    </button>
                                )}
                                {temple.status === 'Active' && (
                                    <button type="button" className="btn btn-outline"
                                            onClick={() => requestDeletion(temple.id)}>
                                        <Trash2 size={18}/> Ask to delete this temple
                                    </button>
                                )}
                                {temple.status === 'Deletion requested' && (
                                    <button type="button" className="btn btn-outline"
                                            onClick={() => cancelDeletion(temple.id)}>
                                        <Undo2 size={18}/> Keep this temple
                                    </button>
                                )}
                                <Link to={adminRoutes.templeAdd} className="btn btn-ghost">
                                    <PlusCircle size={18}/> Add another temple
                                </Link>
                                <p className="text-[0.95rem] text-muted">
                                    Deleting a temple that is already approved needs Quick Solutions (PVT) Ltd. to
                                    agree.
                                </p>
                            </div>
                        </Card>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[0.95rem] text-muted">
                    <Landmark size={17} className="text-sage-700"/>
                    Temple Information
                    <Link to={adminRoutes.templeInformation} className="subtle-link ml-auto text-[0.95rem]">
                        <ArrowLeft size={17}/> Back to all temples
                    </Link>
                </div>
            </div>
        </AppShell>
    )
}

/* ------------------------------------------------------------------
   Appointing, and changing, a Co-Administrator - right on the temple
   page. One person may hold only one temple, so the email is checked
   against every temple before the record is saved.
   ------------------------------------------------------------------ */

const CO_ADMIN_ROLES = [
    'Authorized Religious Representative',
    'Designated Technical Administrator',
    'Assistant Administrator',
    'Treasurer',
    'Secretary',
]

const Field = ({label, children}: { label: string; children: React.ReactNode }) => (
    <label className="flex flex-col gap-1">
        <span className="text-[0.92rem] font-semibold text-ink">{label}</span>
        {children}
    </label>
)

const inputClass = 'rounded-xl border border-line bg-white px-3 py-2.5 text-[1rem] text-ink placeholder:text-muted focus:border-sage-400 focus:outline-none'

const CoAdminForm = ({templeId, admin, onDone}: {
    templeId: string
    admin: CoAdministrator | null
    onDone: () => void
}) => {
    const {t} = useTranslation()
    const {addCoAdmin, updateCoAdmin, coAdminAssignment} = useTemples()
    const [role, setRole] = useState(admin?.role ?? CO_ADMIN_ROLES[0])
    const [name, setName] = useState(admin?.name ?? '')
    const [email, setEmail] = useState(admin?.email ?? '')
    const [phone, setPhone] = useState(admin?.phone ?? '')
    const [reference, setReference] = useState(admin?.reference ?? '')
    const [status, setStatus] = useState<CoAdministrator['status']>(admin?.status ?? 'Active')
    const [error, setError] = useState('')

    /* Tell them early if the email already belongs to another temple. */
    const taken = coAdminAssignment(email)
    const takenElsewhere = taken && taken.templeId !== templeId

    const save = () => {
        const draft = {role, name, email, phone, reference, status}
        const result = admin
            ? updateCoAdmin(templeId, admin.id, draft)
            : addCoAdmin(templeId, draft)
        if ('message' in result) {
            setError(result.message)
            return
        }
        onDone()
    }

    return (
        <div className="my-4 rounded-xl border border-sage-200 bg-cream/60 p-4">
            <h3 className="font-temple text-[1.08rem] text-sage-900">
                {admin ? `${t('details.edit')} ${admin.name}` : t('details.newCoAdmin')}
            </h3>
            <p className="mt-0.5 text-[0.92rem] text-ink-soft">
                {t('details.coAdminFormNote')}
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Designation">
                    <select value={role} onChange={(event) => setRole(event.target.value)} className={inputClass}>
                        {CO_ADMIN_ROLES.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </Field>
                <Field label={t('details.fullName')}>
                    <input value={name} onChange={(event) => setName(event.target.value)}
                           placeholder="For example: W. A. Sumanasiri" className={inputClass}/>
                </Field>
                <Field label="Email">
                    <input value={email} onChange={(event) => setEmail(event.target.value)}
                           placeholder="person@example.com" className={inputClass}/>
                </Field>
                <Field label="Phone">
                    <input value={phone} onChange={(event) => setPhone(event.target.value)}
                           placeholder="07X XXX XXXX" className={inputClass}/>
                </Field>
                <Field label={t('details.reference')}>
                    <input value={reference} onChange={(event) => setReference(event.target.value)}
                           placeholder={t('details.optional')} className={inputClass}/>
                </Field>
                <Field label="Status">
                    <select value={status}
                            onChange={(event) => setStatus(event.target.value as CoAdministrator['status'])}
                            className={inputClass}>
                        <option value="Active">Active</option>
                        <option value="Invited">Invited</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </Field>
            </div>

            {takenElsewhere && (
                <p className="mt-3 flex items-start gap-2 rounded-xl border border-accent-gold/40 bg-accent-gold-50 px-3 py-2 text-[0.9rem] text-status-amber">
                    <CircleAlert size={16} className="mt-0.5 flex-none"/>
                    {email.trim().toLowerCase()} already serves {taken?.templeName}. One Co-Administrator can
                    serve only one temple.
                </p>
            )}

            {error && (
                <p className="mt-3 flex items-start gap-2 rounded-xl border border-status-rose/30 bg-lotus-50 px-3 py-2 text-[0.9rem] text-status-rose">
                    <CircleAlert size={16} className="mt-0.5 flex-none"/>{error}
                </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary btn-sm" onClick={save}>
                    <ShieldCheck size={16}/> {admin ? t('details.saveChanges') : t('details.appoint')}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>{t('common.cancel')}</button>
            </div>
        </div>
    )
}