import {useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Building2,
    CalendarClock,
    Check,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    Eye,
    IdCard,
    Landmark,
    MapPin,
    Pencil,
    PlusCircle,
    Search,
    ShieldCheck,
    Sparkles,
    Trash2,
    Undo2,
    Users2,
    X,
} from 'lucide-react'
import {AppShell} from '../../layouts/AppShell'
import {useTranslation} from 'react-i18next'
import {usePermissions} from '../../hooks/usePermissions'
import {useTemples} from '../../data/templeStore.tsx'
import {
    canDrop,
    isEditable,
    prettyDate,
    statusTone,
    type TempleRecord,
    type TempleStatus
} from '../../data/templeStatus'
import {adminRoutes} from '../../routes/adminRoutes'
import {TempleTransfersCard} from './temple.transfers'
import {useActiveTemple} from '../../hooks/useActiveTemple'

type Filter = 'all' | TempleStatus

const FILTERS: { key: Filter; labelKey: string }[] = [
    {key: 'all', labelKey: 'list.filterAll'},
    {key: 'Active', labelKey: 'list.filterActive'},
    {key: 'Pending approval', labelKey: 'list.filterPending'},
    {key: 'Changes requested', labelKey: 'list.filterChanges'},
    {key: 'Deletion requested', labelKey: 'list.filterDeletion'},
]

/** Four to a page - big rows are easier to read than a long scroll. */
const PER_PAGE = 4

/*
 * One colour story per status, used for the card's top ribbon, its emblem tile and the pill.
 * Keeping them in one map means a new status can never look half-styled.
 */
const ROW_TONE: Record<TempleStatus, { ribbon: string; tile: string; ring: string; glow: string }> = {
    'Active': {
        ribbon: 'from-emerald-400 via-emerald-500 to-teal-500',
        tile: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20',
        ring: 'group-hover:border-emerald-300',
        glow: 'group-hover:shadow-[0_18px_38px_-22px_rgba(5,150,105,.55)]',
    },
    'Pending approval': {
        ribbon: 'from-amber-300 via-amber-400 to-orange-400',
        tile: 'bg-amber-50 text-amber-600 ring-1 ring-amber-500/25',
        ring: 'group-hover:border-amber-300',
        glow: 'group-hover:shadow-[0_18px_38px_-22px_rgba(217,119,6,.55)]',
    },
    'Changes requested': {
        ribbon: 'from-sky-300 via-sky-400 to-blue-500',
        tile: 'bg-sky-50 text-sky-600 ring-1 ring-sky-500/20',
        ring: 'group-hover:border-sky-300',
        glow: 'group-hover:shadow-[0_18px_38px_-22px_rgba(2,132,199,.5)]',
    },
    'Deletion requested': {
        ribbon: 'from-rose-300 via-rose-400 to-pink-500',
        tile: 'bg-rose-50 text-rose-600 ring-1 ring-rose-500/20',
        ring: 'group-hover:border-rose-300',
        glow: 'group-hover:shadow-[0_18px_38px_-22px_rgba(225,29,72,.5)]',
    },
}

const StatusBadge = ({status}: { status: TempleStatus }) => (
    <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.78rem] font-semibold ${statusTone[status]}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current"/>
        {status}
    </span>
)

/** A small, quiet figure shown in the header band. */
const Stat = ({icon: Icon, label, value, tone}: {
    icon: typeof Landmark
    label: string
    value: number
    tone: string
}) => (
    <div
        className="flex items-center gap-3 rounded-2xl bg-white/12 px-3.5 py-2.5 ring-1 ring-white/15 backdrop-blur-sm">
        <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl ${tone}`}>
            <Icon size={17} strokeWidth={1.9}/>
        </span>
        <div className="min-w-0">
            <div className="font-temple text-[1.45rem] leading-none font-semibold text-white">{value}</div>
            <div className="mt-0.5 text-[0.76rem] font-medium text-sky-100/90">{label}</div>
        </div>
    </div>
)

/** One temple, drawn as a card: ribbon, emblem, facts, registration ID and actions. */
const TempleCard = ({
                        record,
                        canManage,
                        confirmDrop,
                        onDropRequest,
                        onDropCancel,
                        onDropConfirm,
                        onRequestDeletion,
                        onCancelDeletion,
                        onFlash,
                    }: {
    record: TempleRecord
    canManage: boolean
    confirmDrop: string | null
    onDropRequest: (id: string) => void
    onDropCancel: () => void
    onDropConfirm: (id: string) => void
    onRequestDeletion: (id: string) => void
    onCancelDeletion: (id: string) => void
    onFlash: (message: string) => void
}) => {
    const {t} = useTranslation()
    const seats = record.capacity.reduce((total, row) => total + (Number(row.seats) || 0), 0)
    const details = `${adminRoutes.templeInformation}/${record.id}`
    const tone = ROW_TONE[record.status]

    return (
        <article
            className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition duration-200 hover:-translate-y-0.5 ${tone.ring} ${tone.glow}`}>

            {/* Status ribbon along the top edge */}
            <span className={`h-1.5 w-full bg-linear-to-r ${tone.ribbon}`} aria-hidden="true"/>

            <div className="flex flex-1 flex-col gap-4 px-4 pt-4 pb-4 sm:px-5">
                {/* Emblem + name + place */}
                <div className="flex items-start gap-3.5">
                    <span className={`grid h-13 w-13 flex-none place-items-center rounded-2xl ${tone.tile}`}>
                        <Landmark size={24} strokeWidth={1.8}/>
                    </span>
                    <div className="min-w-0 flex-1">
                        <Link to={details}
                              className="block font-temple text-[1.22rem] leading-tight font-semibold text-sage-900 hover:text-sage-700 hover:underline">
                            {record.name}
                        </Link>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.88rem] text-ink-soft">
                            <span className="inline-flex items-center gap-1.5">
                                <MapPin size={14} className="flex-none text-sage-600"/>
                                {record.village}, {record.district}
                            </span>
                            <span className="text-line">|</span>
                            <span className="inline-flex items-center gap-1.5">
                                <Building2 size={14} className="flex-none text-sage-600"/>
                                {record.type}
                            </span>
                        </p>
                    </div>
                    <StatusBadge status={record.status}/>
                </div>

                {/* Facts */}
                <dl className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-cream/70 px-3 py-2">
                        <dt className="flex items-center gap-1.5 text-[0.68rem] font-bold tracking-[0.08em] text-muted uppercase">
                            <Users2 size={12}/> {t('list.seats')}
                        </dt>
                        <dd className="mt-0.5 text-[0.95rem] font-semibold text-sage-900">{seats}</dd>
                    </div>
                    <div className="rounded-xl bg-cream/70 px-3 py-2">
                        <dt className="flex items-center gap-1.5 text-[0.68rem] font-bold tracking-[0.08em] text-muted uppercase">
                            <CalendarClock size={12}/> {t('list.submitted')}
                        </dt>
                        <dd className="mt-0.5 text-[0.95rem] font-semibold text-sage-900">
                            {prettyDate(record.submittedOn)}
                        </dd>
                    </div>
                    <div className="col-span-2 rounded-xl bg-cream/70 px-3 py-2">
                        <dt className="flex items-center gap-1.5 text-[0.68rem] font-bold tracking-[0.08em] text-muted uppercase">
                            <IdCard size={12}/> {t('list.registrationId')}
                        </dt>
                        <dd className="mt-0.5">
                            {record.registrationId ? (
                                <span
                                    className="mono inline-block rounded-md bg-white px-2 py-0.5 text-[0.92rem] font-semibold text-sage-800 ring-1 ring-line">
                                    {record.registrationId}
                                </span>
                            ) : (
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 text-[0.82rem] font-semibold text-status-amber ring-1 ring-amber-300/50">
                                    <ShieldCheck size={12}/> Given on approval
                                </span>
                            )}
                        </dd>
                    </div>
                </dl>

                {/* Actions */}
                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line-soft pt-3">
                    <Link to={details}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-sage-800 px-3 text-[0.86rem] font-semibold text-white transition hover:bg-sage-700">
                        <Eye size={15}/> View
                    </Link>

                    {isEditable(record.status) && canManage && (
                        <Link to={`${adminRoutes.templeAdd}?mode=edit&id=${record.id}`}
                              title="Edit temple"
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[0.86rem] font-semibold text-ink-soft transition hover:border-sage-300 hover:text-sage-900">
                            <Pencil size={14}/> Edit
                        </Link>
                    )}

                    {canDrop(record.status) && (
                        confirmDrop === record.id ? (
                            <span className="flex flex-wrap items-center gap-2">
                                <button type="button"
                                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-status-rose px-3 text-[0.86rem] font-semibold text-white transition hover:brightness-95"
                                        onClick={() => onDropConfirm(record.id)}>
                                    Yes, remove
                                </button>
                                <button type="button"
                                        className="inline-flex min-h-9 items-center rounded-lg border border-line bg-white px-3 text-[0.86rem] font-semibold text-ink-soft transition hover:border-sage-300"
                                        onClick={onDropCancel}>
                                    Keep it
                                </button>
                            </span>
                        ) : (
                            <button type="button"
                                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[0.86rem] font-semibold text-ink-soft transition hover:border-status-rose/40 hover:text-status-rose"
                                    onClick={() => onDropRequest(record.id)}>
                                <Trash2 size={14}/> Remove
                            </button>
                        )
                    )}

                    {record.status === 'Active' && (
                        <button type="button"
                                className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[0.86rem] font-semibold text-ink-soft transition hover:border-status-rose/40 hover:text-status-rose"
                                onClick={() => {
                                    onRequestDeletion(record.id)
                                    onFlash('Deletion request sent to Quick Solutions (PVT) Ltd.')
                                }}>
                            <Trash2 size={14}/> Ask to delete
                        </button>
                    )}
                    {record.status === 'Deletion requested' && (
                        <button type="button"
                                className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[0.86rem] font-semibold text-ink-soft transition hover:border-sage-300 hover:text-sage-900"
                                onClick={() => {
                                    onCancelDeletion(record.id)
                                    onFlash('Deletion cancelled - the temple stays Active.')
                                }}>
                            <Undo2 size={14}/> Keep it
                        </button>
                    )}
                </div>
            </div>

            {record.reviewNote && (
                <div
                    className="flex items-start gap-2 border-t border-line-soft bg-sky-50/80 px-4 py-2.5 text-[0.84rem] text-sky-800 sm:px-5">
                    <CircleAlert size={15} className="mt-0.5 flex-none"/>
                    <span><strong
                        className="font-semibold">Quick Solutions (PVT) Ltd.</strong> {record.reviewNote}</span>
                </div>
            )}
            {record.status === 'Deletion requested' && (
                <div
                    className="flex items-center gap-2 border-t border-line-soft bg-rose-50/80 px-4 py-2.5 text-[0.84rem] text-rose-700 sm:px-5">
                    <Trash2 size={15} className="flex-none"/>
                    Asked to delete on {prettyDate(record.deletionRequestedOn)} - waiting for the office.
                </div>
            )}
        </article>
    )
}

export const TempleListPage = () => {
    const {t} = useTranslation()
    const {canEdit, levelLabel} = usePermissions()
    /* "Limited" roles may read the register but not add temples (proposal 14.3). */
    const canManage = canEdit('manageTempleInformation')
    const store = useTemples()
    /* A chief incumbent works on their own temples; the platform administrator sees the register. */
    const {temples: myTemples} = useActiveTemple()
    const records = myTemples.length ? myTemples : store.records
    const {dropRequest, requestDeletion, cancelDeletion} = store
    const [filter, setFilter] = useState<Filter>('all')
    const [query, setQuery] = useState('')
    const [page, setPage] = useState(1)
    const [confirmDrop, setConfirmDrop] = useState<string | null>(null)
    const [flash, setFlash] = useState<string | null>(null)

    const counts = useMemo(() => ({
        all: records.length,
        Active: records.filter((r) => r.status === 'Active').length,
        'Pending approval': records.filter((r) => r.status === 'Pending approval').length,
        'Changes requested': records.filter((r) => r.status === 'Changes requested').length,
        'Deletion requested': records.filter((r) => r.status === 'Deletion requested').length,
    }), [records])

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase()
        return records
            .filter((record) => filter === 'all' || record.status === filter)
            .filter((record) => !needle
                || record.name.toLowerCase().includes(needle)
                || record.village.toLowerCase().includes(needle)
                || record.district.toLowerCase().includes(needle)
                || (record.registrationId ?? '').toLowerCase().includes(needle))
    }, [records, filter, query])

    /* A filter or search that shortens the list must not leave you on an empty page. */
    const pageCount = Math.max(1, Math.ceil(visible.length / PER_PAGE))
    const currentPage = Math.min(page, pageCount)
    const pageRows = visible.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
    const first = visible.length ? (currentPage - 1) * PER_PAGE + 1 : 0
    const last = Math.min(currentPage * PER_PAGE, visible.length)

    const awaiting = counts['Pending approval'] + counts['Changes requested']

    return (
        <AppShell>
            <div className="mx-auto flex max-w-352 flex-col gap-4">

                {/* ---------------------------------------------------------------- header */}
                <header
                    className="relative overflow-hidden rounded-3xl bg-linear-to-br from-sage-900 via-sage-800 to-sky-900 px-5 py-6 shadow-[0_18px_44px_-24px_rgba(8,47,73,.75)] sm:px-7 sm:py-7">
                    {/* soft light behind the crest */}
                    <span aria-hidden="true"
                          className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl"/>
                    <span aria-hidden="true"
                          className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl"/>

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <span
                                className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[0.7rem] font-bold tracking-[0.14em] text-sky-200 uppercase ring-1 ring-white/15">
                                <Landmark size={13}/> {t('nav.templeInformation')}
                            </span>
                            <h1 className="mt-3 font-temple text-[2rem] leading-tight font-semibold text-white sm:text-[2.3rem]">
                                {t('temple.allTemplesHead')}
                            </h1>
                            <p className="mt-1.5 max-w-[58ch] text-[0.98rem] leading-relaxed text-sky-100/90">
                                {t('temple.listIntro')}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-2.5">
                                {canManage ? (
                                    <Link to={adminRoutes.templeAdd}
                                          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-[0.92rem] font-bold text-sage-900 shadow-sm transition hover:-translate-y-px hover:bg-sky-50">
                                        <PlusCircle size={17}/> {t('temple.addNew')}
                                    </Link>
                                ) : (
                                    <span
                                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/12 px-3.5 text-[0.86rem] font-semibold text-sky-100 ring-1 ring-white/15">
                                        <Eye size={15}/> Read-only · {levelLabel('manageTempleInformation')} access
                                    </span>
                                )}
                                <Link to={adminRoutes.dashboard}
                                      className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-[0.9rem] font-semibold text-sky-200 transition hover:text-white">
                                    <ArrowLeft size={15}/> {t('nav.dashboard')}
                                </Link>
                            </div>
                        </div>

                        <div className="grid flex-none grid-cols-1 gap-2.5 sm:grid-cols-3 lg:w-108">
                            <Stat icon={Landmark} label={t('temple.temples')} value={counts.all}
                                  tone="bg-sky-400/25 text-sky-100"/>
                            <Stat icon={BadgeCheck} label={t('list.filterActive')} value={counts.Active}
                                  tone="bg-emerald-400/25 text-emerald-100"/>
                            <Stat icon={Sparkles} label={t('list.awaitingShort')} value={awaiting}
                                  tone="bg-amber-400/25 text-amber-100"/>
                        </div>
                    </div>
                </header>

                {/* Family transfer requests waiting on this temple's decision */}
                <TempleTransfersCard/>

                {flash && (
                    <div role="status"
                         className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-2.5 text-[0.92rem] text-emerald-700">
                        <Check size={17} className="mt-0.5 flex-none"/>
                        <span className="flex-1">{flash}</span>
                        <button onClick={() => setFlash(null)} aria-label="Dismiss"
                                className="rounded p-0.5 text-emerald-700/70 hover:bg-emerald-100 hover:text-emerald-800">
                            <X size={14}/>
                        </button>
                    </div>
                )}

                {/* ------------------------------------------------------- toolbar */}
                <div
                    className="rounded-2xl border border-line bg-paper px-4 py-3.5 shadow-[0_2px_10px_-8px_rgba(8,47,73,.4)]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t('common.status')}>
                            {FILTERS.map((item) => {
                                const count = counts[item.key as keyof typeof counts]
                                const active = filter === item.key
                                return (
                                    <button key={item.key} type="button" role="tab" aria-selected={active}
                                            onClick={() => {
                                                setFilter(item.key)
                                                setPage(1)
                                            }}
                                            className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-[0.88rem] font-semibold transition ${
                                                active
                                                    ? 'border-sage-800 bg-sage-800 text-white shadow-sm'
                                                    : 'border-transparent bg-cream/70 text-ink-soft hover:border-line hover:bg-cream hover:text-sage-900'
                                            }`}>
                                        {t(item.labelKey)}
                                        <span className={`rounded-md px-1.5 py-0.5 text-[0.72rem] ${
                                            active ? 'bg-white/20 text-white' : 'bg-white text-muted ring-1 ring-line'
                                        }`}>{count}</span>
                                    </button>
                                )
                            })}
                        </div>

                        <div
                            className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2 transition lg:w-88">
                            <Search size={16} className="flex-none text-muted"/>
                            <input
                                className="w-full min-w-0 border-0 bg-transparent text-[0.92rem] text-ink outline-none"
                                placeholder={t('temple.searchTemples')}
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value)
                                    setPage(1)
                                }} aria-label="Search temples"/>
                            {query && (
                                <button onClick={() => {
                                    setQuery('')
                                    setPage(1)
                                }} aria-label="Clear search"
                                        className="flex-none rounded-full p-1 text-muted hover:bg-white hover:text-sage-800">
                                    <X size={13}/>
                                </button>
                            )}
                        </div>
                    </div>

                    {awaiting > 0 && (
                        <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[0.86rem] text-amber-700">
                            <CircleAlert size={15} className="mt-0.5 flex-none"/>
                            <span>
                                {t('list.awaitingBanner', {count: awaiting})}
                            </span>
                        </p>
                    )}
                </div>

                {/* ---------------------------------------------------------- cards */}
                {pageRows.length > 0 ? (
                    <ul className="grid list-none grid-cols-1 gap-3.5 p-0 xl:grid-cols-2">
                        {pageRows.map((record) => (
                            <li key={record.id}>
                                <TempleCard
                                    record={record}
                                    canManage={canManage}
                                    confirmDrop={confirmDrop}
                                    onDropRequest={setConfirmDrop}
                                    onDropCancel={() => setConfirmDrop(null)}
                                    onDropConfirm={(id) => {
                                        dropRequest(id)
                                        setConfirmDrop(null)
                                        setFlash('Request dropped. Nothing was sent for approval.')
                                    }}
                                    onRequestDeletion={requestDeletion}
                                    onCancelDeletion={cancelDeletion}
                                    onFlash={setFlash}/>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="rounded-2xl border border-dashed border-line bg-paper px-6 py-14 text-center">
                        <BadgeCheck size={30} className="mx-auto text-muted/50"/>
                        <p className="mt-3 text-[1.1rem] font-semibold text-sage-900">
                            {records.length ? 'Nothing here for this choice' : 'No temples yet'}
                        </p>
                        <p className="mt-1 text-[0.95rem] text-muted">
                            {records.length
                                ? 'Choose "All temples", or clear the search box.'
                                : 'Add the first temple to start.'}
                        </p>
                        {!records.length && canManage && (
                            <Link to={adminRoutes.templeAdd} className="btn btn-primary mt-4">
                                <PlusCircle size={17}/> Add New Temple
                            </Link>
                        )}
                    </div>
                )}

                {/* ----------------------------------------------------- pagination */}
                {visible.length > 0 && (
                    <nav
                        className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-2.5 sm:flex-row sm:justify-between"
                        aria-label="Temple pages">
                        <p className="text-[0.9rem] text-ink-soft">
                            Showing <strong className="font-semibold text-sage-900">{first}-{last}</strong> of{' '}
                            <strong className="font-semibold text-sage-900">{visible.length}</strong> temples
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button type="button"
                                    className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-line bg-white px-2.5 text-[0.86rem] font-semibold text-ink-soft transition hover:border-sage-300 disabled:opacity-40"
                                    disabled={currentPage === 1}
                                    onClick={() => setPage(currentPage - 1)}>
                                <ChevronLeft size={15}/> Back
                            </button>
                            {Array.from({length: pageCount}, (_, index) => index + 1).map((number) => (
                                <button key={number} type="button"
                                        aria-current={number === currentPage ? 'page' : undefined}
                                        onClick={() => setPage(number)}
                                        className={`grid h-9 min-w-9 place-items-center rounded-lg border text-[0.88rem] font-semibold transition ${
                                            number === currentPage
                                                ? 'border-sage-800 bg-sage-800 text-white'
                                                : 'border-line bg-white text-ink-soft hover:border-sage-300 hover:bg-sage-50'
                                        }`}>
                                    {number}
                                </button>
                            ))}
                            <button type="button"
                                    className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-line bg-white px-2.5 text-[0.86rem] font-semibold text-ink-soft transition hover:border-sage-300 disabled:opacity-40"
                                    disabled={currentPage === pageCount}
                                    onClick={() => setPage(currentPage + 1)}>
                                Next <ChevronRight size={15}/>
                            </button>
                        </div>
                    </nav>
                )}

                {/* -------------------------------------------- how approval works */}
                <section className="rounded-2xl border border-line bg-paper">
                    <div className="flex items-center gap-2 border-b border-line-soft px-5 py-3">
                        <ShieldCheck size={17} className="flex-none text-gold-600"/>
                        <h2 className="font-temple text-[1.05rem] text-sage-900">How approval works</h2>
                    </div>
                    <ol className="m-0 grid list-none gap-2.5 px-4 py-4 sm:grid-cols-3 sm:px-5">
                        {[
                            {
                                step: '1',
                                title: 'You send it',
                                body: 'The temple is saved and waits for approval.',
                                tone: 'bg-amber-400'
                            },
                            {
                                step: '2',
                                title: 'The company checks it',
                                body: 'Quick Solutions (PVT) Ltd. reviews the details, then approves or asks for changes.',
                                tone: 'bg-sky-500'
                            },
                            {
                                step: '3',
                                title: 'The ID is given',
                                body: 'The registration ID is issued and the temple becomes Active.',
                                tone: 'bg-emerald-500'
                            },
                        ].map((item) => (
                            <li key={item.step} className="rounded-xl border border-line-soft bg-cream/50 px-3.5 py-3">
                                <span
                                    className={`grid h-7 w-7 place-items-center rounded-full text-[0.82rem] font-bold text-white ${item.tone}`}>
                                    {item.step}
                                </span>
                                <div className="mt-2 text-[0.95rem] font-semibold text-sage-900">{item.title}</div>
                                <p className="mt-0.5 text-[0.86rem] leading-snug text-muted">{item.body}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <div className="flex flex-wrap items-center gap-2 pb-2 text-[0.88rem] text-muted">
                    <Users2 size={16} className="text-sage-700"/>
                    Committee and family accounts are managed under
                    {canEdit('manageUserRoles')
                        ? <Link to={adminRoutes.users} className="font-semibold text-sage-800 hover:underline">User
                            Management</Link>
                        : <span className="font-semibold text-ink-soft">User Management (Temple Admin only)</span>}.
                    {canManage && (
                        <Link to={adminRoutes.templeAdd}
                              className="ml-auto inline-flex items-center gap-1 font-semibold text-sage-800 hover:underline">
                            Add a temple <ArrowRight size={15}/>
                        </Link>
                    )}
                </div>
            </div>
        </AppShell>
    )
}