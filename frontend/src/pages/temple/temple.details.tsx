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
import TempleFooterWave from '../../components/TempleFooterWave'
import {useTemples} from '../../data/templeStore.tsx'
import {useTranslation} from 'react-i18next'
import type {CoAdministrator} from '../../data/templeStatus'
import {canDrop, coAdminRoleShort, prettyDate, statusTone} from '../../data/templeStatus'
import {DISTRICTS} from '../../data/temples'
import {adminRoutes} from '../../routes/adminRoutes'
import {useAuth} from '../../context/AuthContext'
import {usePermissions} from '../../hooks/usePermissions'
import {
    canAppointCoAdminFor,
    canCreateTemple,
    canDeleteTempleRecord,
    canEditTempleRecord,
} from '../../data/templeAccess'

/** One label above one value - the only row style on this page. */
const Row = ({label, children}: { label: string; children: React.ReactNode }) => (
    <div className="border-b border-line-soft py-3">
        <div className="text-[0.92rem] font-semibold tracking-[0.06em] text-muted uppercase">{label}</div>
        <div className="mt-0.5 text-[1.18rem] font-medium wrap-break-word text-ink">{children}</div>
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
                className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-accent-gold-50 text-status-amber">{icon}</span>
            <h2 className="font-temple text-[1.32rem] font-semibold text-ink">{title}</h2>
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
    const {t, i18n} = useTranslation()
    const {user} = useAuth()
    const {role} = usePermissions()
    const {getRecord, requestDeletion, cancelDeletion, dropRequest, setCoAdminStatus} = useTemples()
    /* Which Co-Administrator is open in the form: a new one (null draft) or one being edited. */
    const [coAdminForm, setCoAdminForm] = useState<{ admin: CoAdministrator | null } | null>(null)
    const location = useLocation()
    const [tab, setTab] = useState<TabKey>('summary')
    const flash = (location.state as { flash?: string } | null)?.flash

    const temple = id ? getRecord(id) : undefined
    /* A record that was dropped while its detail page was open goes back to the list. */
    if (!temple) return <Navigate to={adminRoutes.templeInformation} replace/>

    /* Scoped actions: a Co-Administrator may update / delete only their assigned temple, and
       never appoint Co-Administrators or create a new temple. */
    const mayEdit = canEditTempleRecord(user, temple)
    const mayDelete = canDeleteTempleRecord(user, temple)
    const mayAppoint = canAppointCoAdminFor(user, temple)
    const mayCreate = canCreateTemple(role)

    const seats = temple.capacity.reduce((total, row) => total + (Number(row.seats) || 0), 0)

    /* Records keep their English option values; only what the reader sees is translated. */
    const opt = (group: string, value: string) => t(`temple.opt.${group}.${value}`, {defaultValue: value})
    const district = (value: string) =>
        i18n.language === 'si' ? (DISTRICTS.find((d) => d.en === value)?.si ?? value) : value
    const date = (iso: string | null) => prettyDate(iso, i18n.language)

    return (
        <AppShell footer={<TempleFooterWave/>}>
            <div className="temple-info-scope mx-auto flex max-w-380 flex-col gap-5">

                {/* Header */}
                <header className="flex flex-col gap-3">
                    <Link to={adminRoutes.templeInformation}
                          className="inline-flex w-fit items-center gap-2 text-[1rem] font-semibold text-ink-soft hover:text-ink">
                        <ArrowLeft size={18}/> {t('details.backToAll')}
                    </Link>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <h1 className="font-temple text-[1.85rem] leading-tight font-semibold text-ink sm:text-[2.2rem]">
                                {temple.name}
                            </h1>
                            <div className="mt-2 flex flex-wrap items-center gap-2.5">
                                <span
                                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-[1.02rem] font-semibold ${statusTone[temple.status]}`}>
                                    <span
                                        className="h-2 w-2 rounded-full bg-current"/>{t(`temple.status.${temple.status}`)}
                                </span>
                                <span className="text-[1.08rem] text-ink-soft">
                                    {temple.village}, {district(temple.district)}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {mayEdit && (
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

                {role === 'coAdmin' && (
                    <div
                        className="flex items-start gap-3 rounded-xl border border-line bg-cream/70 px-4 py-3 text-[1.02rem] text-ink-soft">
                        <ShieldCheck size={19} className="mt-0.5 flex-none text-accent-purple"/>
                        <span>
                            {t('details.coAdminBanner')}
                        </span>
                    </div>
                )}

                {flash && (
                    <div role="status"
                         className="flex items-start gap-3 rounded-xl border border-accent-green/30 bg-accent-green-50 px-4 py-3 text-[1rem] text-accent-green">
                        <CircleCheck size={20} className="mt-0.5 flex-none"/>
                        <span>{flash === 'created' ? t('details.flashCreated') : t('details.flashSaved')}</span>
                    </div>
                )}

                {temple.status === 'Pending approval' && (
                    <div
                        className="flex items-start gap-3 rounded-xl border border-accent-blue/30 bg-accent-blue-50 px-4 py-3 text-[1rem] text-status-blue">
                        <CircleAlert size={20} className="mt-0.5 flex-none"/>
                        <span>{t('details.pendingNotice')}</span>
                    </div>
                )}

                {temple.status === 'Changes requested' && (
                    <div
                        className="flex items-start gap-3 rounded-xl border border-accent-purple/30 bg-accent-purple-50 px-4 py-3 text-[1rem] text-accent-purple">
                        <CircleAlert size={20} className="mt-0.5 flex-none"/>
                        <span><strong className="font-semibold">{t('details.changesAsked')}</strong>{' '}
                            {temple.reviewNote ?? t('details.changesDefault')} {t('details.changesTail')}</span>
                    </div>
                )}

                {temple.status === 'Deletion requested' && (
                    <div
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-status-rose/30 bg-lotus-50 px-4 py-3 text-[1rem] text-status-rose">
                        <Trash2 size={20} className="flex-none"/>
                        <span>{t('list.askedDeleteOn', {date: date(temple.deletionRequestedOn)})}</span>
                        {mayDelete && (
                            <button type="button" className="btn btn-outline btn-sm ml-auto"
                                    onClick={() => cancelDeletion(temple.id)}>
                                <Undo2 size={17}/> {t('details.keepTemple')}
                            </button>
                        )}
                    </div>
                )}

                {/* Three big facts */}
                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        {
                            label: t('list.registrationId'), value: temple.registrationId ?? t('list.onApproval'),
                            icon: <ShieldCheck size={22}/>, tone: 'bg-accent-gold-50 text-status-amber'
                        },
                        {
                            label: t('details.seatsForDana'), value: String(seats), icon: <Users2 size={22}/>,
                            tone: 'bg-accent-green-50 text-accent-green'
                        },
                        {
                            label: t('details.coAdminsCount'),
                            value: String(temple.coAdmins.length),
                            icon: <UserCog size={22}/>,
                            tone: 'bg-accent-purple-50 text-accent-purple'
                        },
                    ].map((item) => (
                        <div key={item.label}
                             className="flex items-center gap-3.5 rounded-2xl border border-line bg-paper px-4 py-4">
                            <span className={`grid h-12 w-12 flex-none place-items-center rounded-xl ${item.tone}`}>
                                {item.icon}
                            </span>
                            <div className="min-w-0">
                                <div className="text-[1.42rem] leading-tight font-semibold wrap-break-word text-ink">
                                    {item.value}
                                </div>
                                <div className="text-[1.02rem] text-muted">{item.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sections as big tabs - one thing on screen at a time */}
                <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('details.tabsAria')}>
                    {TABS.map((item) => {
                        const active = tab === item.key
                        return (
                            <button key={item.key} type="button" role="tab" aria-selected={active}
                                    onClick={() => setTab(item.key)}
                                    className={`min-h-12 rounded-full border px-5 text-[1.08rem] font-semibold transition ${
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
                            <Row label={t('temple.form.fName')}>{temple.name}</Row>
                            <Row label={t('temple.form.fType')}>{opt('type', temple.type)}</Row>
                            <Row label={t('temple.form.fEstablished')}>{temple.established || '-'}</Row>
                            <Row label={t('temple.form.fChief')}>{temple.chiefIncumbent || '-'}</Row>
                            <Row label={t('temple.form.fLand')}>{temple.landExtent || '-'}</Row>
                            {temple.description && (
                                <div className="py-4">
                                    <div
                                        className="text-[0.92rem] font-semibold tracking-[0.06em] text-muted uppercase">
                                        {t('details.description')}
                                    </div>
                                    <p className="mt-1 text-[1.05rem] leading-relaxed text-ink-soft">{temple.description}</p>
                                </div>
                            )}
                        </Card>

                        <Card icon={<ShieldCheck size={19}/>} title={t('details.registration')}>
                            <Row label={t('list.registrationId')}>
                                {temple.registrationId
                                    ? <span className="mono font-semibold">{temple.registrationId}</span>
                                    : t('details.regGiven')}
                            </Row>
                            <Row label={t('common.status')}>{t(`temple.status.${temple.status}`)}</Row>
                            <Row label={t('details.sentForApproval')}>{date(temple.submittedOn)}</Row>
                            <Row label={t('details.approved')}>{date(temple.approvedOn)}</Row>
                            <div className="py-4">
                                <p className="text-[1.02rem] leading-relaxed text-muted">
                                    {t('details.regNote')}
                                </p>
                            </div>
                        </Card>
                    </div>
                )}

                {tab === 'place' && (
                    <div className="grid gap-4 xl:grid-cols-2">
                        <Card icon={<MapPin size={19}/>} title={t('details.whereItIs')}>
                            <Row label={t('temple.form.fAddress')}>{temple.address || '-'}</Row>
                            <Row label={t('temple.form.fVillage')}>{temple.village}</Row>
                            <Row label={t('temple.form.fGN')}>{temple.gnDivision || '-'}</Row>
                            <Row label={t('temple.form.fDS')}>{temple.dsDivision || '-'}</Row>
                            <Row label={t('temple.form.fDistrict')}>{district(temple.district)}</Row>
                            <Row label={t('temple.form.fProvince')}>{opt('province', temple.province)}</Row>
                            <Row label={t('temple.form.fPostal')}>{temple.postalCode || '-'}</Row>
                        </Card>

                        <Card icon={<Phone size={19}/>} title={t('details.reach')}>
                            <Row label={t('temple.form.fPhone')}>{temple.phone || '-'}</Row>
                            <Row label={t('temple.form.fPhoneAlt')}>{temple.phoneAlt || '-'}</Row>
                            <Row label={t('temple.form.fEmail')}><span
                                className="break-all">{temple.email || '-'}</span></Row>
                            <Row label={t('temple.form.fWebsite')}>{temple.website || '-'}</Row>
                        </Card>
                    </div>
                )}

                {tab === 'people' && (
                    <div className="flex flex-col gap-4">
                        <Card icon={<UserCog size={19}/>} title={t('details.coAdmins')}
                              action={mayAppoint ? (
                                  <button type="button" className="btn btn-outline btn-sm"
                                          onClick={() => setCoAdminForm({admin: null})}>
                                      <UserPlus size={17}/> {t('details.appoint')}
                                  </button>
                              ) : undefined}>
                            {mayAppoint && coAdminForm && (
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
                                                <span
                                                    className="badge badge-gold">{opt('roleShort', coAdminRoleShort(admin.role))}</span>
                                                <span className={`badge ${
                                                    admin.status === 'Active' ? 'badge-green'
                                                        : admin.status === 'Suspended' ? 'border-status-rose/30 bg-lotus-50 text-status-rose'
                                                            : 'badge-neutral'
                                                }`}>
                                                    {opt('status', admin.status)}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-[1.18rem] font-semibold text-ink">
                                                {admin.name || t('details.nameNotSet')}
                                            </div>
                                            <div className="mt-1.5 flex flex-col gap-1 text-[0.98rem] text-ink-soft">
                                                <span className="inline-flex items-center gap-2">
                                                    <Phone size={15} className="text-muted"/>{admin.phone || '-'}
                                                </span>
                                                <span className="inline-flex items-center gap-2 break-all">
                                                    <Mail size={15} className="text-muted"/>{admin.email || '-'}
                                                </span>
                                                <span className="text-[0.9rem] text-muted">
                                                    {t('details.appointedOn', {
                                                        date: date(admin.appointedOn),
                                                        reference: admin.reference || t('details.noReference'),
                                                    })}
                                                </span>
                                            </div>
                                            {mayAppoint && (
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
                                    <p className="text-[1.08rem] text-ink-soft">
                                        {t('details.noCoAdmins')}
                                    </p>
                                    {mayAppoint && (
                                        <button type="button" className="btn btn-primary btn-sm"
                                                onClick={() => setCoAdminForm({admin: null})}>
                                            <UserPlus size={17}/> {t('details.appointOne')}
                                        </button>
                                    )}
                                </div>
                            )}
                            <div
                                className="flex items-start gap-2 border-t border-line-soft py-3 text-[0.98rem] text-muted">
                                <ShieldCheck size={16} className="mt-0.5 flex-none text-status-amber"/>
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
                                                    className="text-[0.92rem] font-semibold tracking-[0.06em] text-muted uppercase">
                                                    {opt('committee', member.role)}
                                                </div>
                                                <div className="text-[1.14rem] font-medium text-ink">{member.name}</div>
                                            </div>
                                            <span className="mono text-[1rem] text-ink-soft">{member.phone}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-5 text-[1.08rem] text-muted">
                                    {t('details.committeeEmpty')}
                                </p>
                            )}
                        </Card>
                    </div>
                )}

                {tab === 'facilities' && (
                    <div className="grid gap-4 xl:grid-cols-2">
                        <Card icon={<Ruler size={19}/>} title={t('details.seating')}>
                            <div className="divide-y divide-line-soft">
                                {temple.capacity.length > 0 ? temple.capacity.map((row) => (
                                    <div key={row.id} className="flex items-center justify-between gap-3 py-3">
                                        <span
                                            className="text-[1.14rem] font-medium text-ink">{row.label || t('details.unnamedSpace')}</span>
                                        <span
                                            className="text-[1.14rem] font-semibold text-ink">{t('details.seatsValue', {count: row.seats || '-'})}</span>
                                    </div>
                                )) : <p className="py-4 text-[1.08rem] text-muted">{t('details.noSeating')}</p>}
                            </div>
                            <Row label={t('details.totalSeats')}>{seats}</Row>
                        </Card>

                        <Card icon={<Building2 size={19}/>} title={t('details.facilities')}>
                            <div className="flex flex-wrap gap-2 py-4">
                                {temple.facilities.length > 0
                                    ? temple.facilities.map((facility) => (
                                        <span key={facility} className="chip">
                                            <CircleCheck size={15}
                                                         className="text-accent-green"/>{opt('facility', facility)}
                                        </span>
                                    ))
                                    : <p className="text-[1.08rem] text-muted">{t('details.noFacilities')}</p>}
                            </div>
                        </Card>

                        <Card icon={<CalendarCheck size={19}/>} title={t('details.danaSessions')}>
                            <div className="flex flex-wrap gap-2 py-4">
                                {temple.danaSessions.length > 0
                                    ? temple.danaSessions.map((session) => (
                                        <span key={session} className="chip">{opt('dana', session)}</span>
                                    ))
                                    : <p className="text-[1.08rem] text-muted">{t('details.noDana')}</p>}
                            </div>
                        </Card>

                        <Card icon={<Banknote size={19}/>} title={t('details.bankAccount')}>
                            <Row label={t('temple.form.fBank')}>{temple.banking.bank || '-'}</Row>
                            <Row label={t('temple.form.fBranch')}>{temple.banking.branch || '-'}</Row>
                            <Row label={t('temple.form.fAccName')}>{temple.banking.accountName || '-'}</Row>
                            <Row label={t('temple.form.fAccNo')}>
                                {temple.banking.accountNumber
                                    ? <span className="mono">•••• {temple.banking.accountNumber.slice(-4)}</span>
                                    : '-'}
                            </Row>
                        </Card>
                    </div>
                )}

                {tab === 'documents' && (
                    <div className="grid gap-4 xl:grid-cols-2">
                        <Card icon={<FileText size={19}/>} title={t('details.photosDocs')}>
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
                                                <div
                                                    className="text-[0.9rem] text-muted">{t('details.docUpdated', {date: doc.updated})}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="py-5 text-[1.08rem] text-muted">{t('details.noDocs')}</p>
                            )}
                        </Card>

                        <Card icon={<ShieldCheck size={19}/>} title={t('details.otherActions')}>
                            <div className="flex flex-col items-start gap-3 py-4">
                                {mayDelete && canDrop(temple.status) && (
                                    <button type="button" className="btn btn-outline"
                                            onClick={() => {
                                                dropRequest(temple.id)
                                                window.location.assign(adminRoutes.templeInformation)
                                            }}>
                                        <Trash2 size={18}/> {t('details.removeRequest')}
                                    </button>
                                )}
                                {mayDelete && temple.status === 'Active' && (
                                    <button type="button" className="btn btn-outline"
                                            onClick={() => requestDeletion(temple.id)}>
                                        <Trash2 size={18}/> {t('details.askDeleteTemple')}
                                    </button>
                                )}
                                {mayDelete && temple.status === 'Deletion requested' && (
                                    <button type="button" className="btn btn-outline"
                                            onClick={() => cancelDeletion(temple.id)}>
                                        <Undo2 size={18}/> {t('details.keepTemple')}
                                    </button>
                                )}
                                {mayCreate && (
                                    <Link to={adminRoutes.templeAdd} className="btn btn-ghost">
                                        <PlusCircle size={18}/> {t('details.addAnother')}
                                    </Link>
                                )}
                                <p className="text-[1.02rem] text-muted">
                                    {t('details.deleteNote')}
                                </p>
                            </div>
                        </Card>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[1.02rem] text-muted">
                    <Landmark size={17} className="text-muted"/>
                    {t('nav.templeInformation')}
                    <Link to={adminRoutes.templeInformation} className="subtle-link ml-auto text-[1.02rem]">
                        <ArrowLeft size={17}/> {t('details.backToAll')}
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
        <span className="text-[0.98rem] font-semibold text-ink">{label}</span>
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
        if ('messageKey' in result) {
            /* The store hands back a key so the reason appears in the signed-in language. */
            setError(t(result.messageKey, result.params ?? {}))
            return
        }
        onDone()
    }

    return (
        <div className="my-4 rounded-xl border border-sage-200 bg-cream/60 p-4">
            <h3 className="font-temple text-[1.14rem] text-ink">
                {admin ? `${t('details.edit')} ${admin.name}` : t('details.newCoAdmin')}
            </h3>
            <p className="mt-0.5 text-[0.98rem] text-ink-soft">
                {t('details.coAdminFormNote')}
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label={t('temple.form.fDesignation')}>
                    <select value={role} onChange={(event) => setRole(event.target.value)} className={inputClass}>
                        {CO_ADMIN_ROLES.map((option) => (
                            <option key={option}
                                    value={option}>{t(`temple.opt.role.${option}`, {defaultValue: option})}</option>
                        ))}
                    </select>
                </Field>
                <Field label={t('details.fullName')}>
                    <input value={name} onChange={(event) => setName(event.target.value)}
                           placeholder={t('details.phFullName')} className={inputClass}/>
                </Field>
                <Field label={t('temple.form.fEmail')}>
                    <input value={email} onChange={(event) => setEmail(event.target.value)}
                           placeholder="person@example.com" className={inputClass}/>
                </Field>
                <Field label={t('temple.form.fPhone')}>
                    <input value={phone} onChange={(event) => setPhone(event.target.value)}
                           placeholder="07X XXX XXXX" className={inputClass}/>
                </Field>
                <Field label={t('details.reference')}>
                    <input value={reference} onChange={(event) => setReference(event.target.value)}
                           placeholder={t('details.optional')} className={inputClass}/>
                </Field>
                <Field label={t('common.status')}>
                    <select value={status}
                            onChange={(event) => setStatus(event.target.value as CoAdministrator['status'])}
                            className={inputClass}>
                        <option value="Active">{t('temple.opt.status.Active')}</option>
                        <option value="Invited">{t('temple.opt.status.Invited')}</option>
                        <option value="Suspended">{t('temple.opt.status.Suspended')}</option>
                    </select>
                </Field>
            </div>

            {takenElsewhere && (
                <p className="mt-3 flex items-start gap-2 rounded-xl border border-accent-gold/40 bg-accent-gold-50 px-3 py-2 text-[0.9rem] text-status-amber">
                    <CircleAlert size={16} className="mt-0.5 flex-none"/>
                    {t('details.takenElsewhere', {email: email.trim().toLowerCase(), temple: taken?.templeName ?? ''})}
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