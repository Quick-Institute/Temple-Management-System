import {useState} from 'react'
import {ArrowRight, Check, Clock, Eye, Inbox, Mail, MapPin, Phone, ShieldCheck, UserRound, Users, X} from 'lucide-react'
import {usePermissions} from '../../hooks/usePermissions'
import {useAuth} from '../../context/AuthContext'
import {
    approveTransfer,
    rejectTransfer,
    type TransferRequest,
    useMyTempleName,
    useTransferRequests,
} from '../../data/transferStore'
import {prettyDate} from '../../data/templeStatus'
import {MEMBER_CATEGORY_LABELS, useMembers} from '../../data/members'
import {useTranslation} from 'react-i18next'

/**
 * Incoming temple transfer requests, for the Temple Admin of the temple being asked.
 * Approving makes the move permanent: the family's previous temple data is replaced by this one.
 */
export const TempleTransfersCard = () => {
    const {t} = useTranslation()
    const {role, can} = usePermissions()
    const {user} = useAuth()
    const requests = useTransferRequests()
    const myTemple = useMyTempleName(user?.identifier, user?.templeName)
    const [note, setNote] = useState<Record<string, string>>({})
    /* Which request's profile is open. The panel shows a deliberately limited set of fields. */
    const [profileId, setProfileId] = useState<string | null>(null)

    if (!can('validateFamilyTempleChanges')) return null

    /* The Temple Admin of the temple being asked reviews it; the platform administrator sees all. */
    const incoming = requests.filter((request) =>
        role === 'superAdmin' ? true : request.toTemple === myTemple,
    )
    const waiting = incoming.filter((request) => request.status === 'Pending')

    return (
        <section className="card p-0">
            <header className="flex flex-wrap items-center gap-2.5 border-b border-line-soft px-5 py-4">
                <span
                    className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-accent-blue-50 text-accent-blue ring-1 ring-accent-blue/20">
                    <Inbox size={17} strokeWidth={1.9}/>
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="font-temple text-[1.15rem] text-sage-900">{t('transfer.heading')}</h2>
                    <p className="text-[0.82rem] text-ink-soft">
                        {t('transfer.subtitle', {temple: role === 'superAdmin' ? t('nav.temples') : myTemple ?? ''})}
                    </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[0.74rem] font-bold ${
                    waiting.length
                        ? 'bg-accent-gold-50 text-status-amber ring-1 ring-accent-gold/30'
                        : 'bg-cream text-muted'
                }`}>
                    {waiting.length ? t('transfer.waiting', {count: waiting.length}) : t('transfer.nothingWaiting')}
                </span>
            </header>

            {incoming.length === 0 ? (
                <p className="px-5 py-6 text-center text-[0.9rem] text-muted">
                    {t('transfer.empty')}
                </p>
            ) : (
                <ul className="flex list-none flex-col divide-y divide-line-soft p-0">
                    {incoming.map((request) => (
                        <RequestRow
                            key={request.id}
                            request={request}
                            note={note[request.id] ?? ''}
                            onNote={(value) => setNote((current) => ({...current, [request.id]: value}))}
                            onViewProfile={() => setProfileId(request.id)}/>
                    ))}
                </ul>
            )}

            {profileId && (() => {
                const open = incoming.find((request) => request.id === profileId)
                return open ? <LimitedProfilePanel request={open} onClose={() => setProfileId(null)}/> : null
            })()}
        </section>
    )
}

/**
 * Limited profile of the family asking to move.
 *
 * A Temple Admin may look at enough to decide - who they are, which household, how to reach them and
 * where they are moving from - but not at the family's full account: no NIC, no address, no booking
 * or donation history. Those stay with the family, and with the platform administrator.
 */
const LimitedProfilePanel = ({request, onClose}: { request: TransferRequest; onClose: () => void }) => {
    const members = useMembers()
    const member = members.find((item) => item.email.toLowerCase() === request.memberEmail.toLowerCase())

    const initials = request.memberName
        .replace(/^Ven\.\s*/, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('')

    const rows = [
        {icon: UserRound, label: 'Name', value: request.memberName},
        {icon: Users, label: 'Household', value: request.familyName},
        {icon: Mail, label: 'Email', value: member?.email ?? request.memberEmail},
        {icon: Phone, label: 'Phone', value: member?.phone ?? 'Not on file'},
        {icon: MapPin, label: 'Moving from', value: request.fromTemple},
        {icon: MapPin, label: 'Moving to', value: request.toTemple},
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-sage-950/45 p-0 sm:items-center sm:p-4"
             role="dialog" aria-modal="true" aria-label={`Limited profile of ${request.memberName}`}
             onClick={onClose}>
            <div
                className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-paper p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl"
                onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start gap-3">
                    <span
                        className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-sky-100 text-[1.05rem] font-bold text-sage-900 ring-1 ring-sky-300/60">
                        {initials}
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 className="truncate font-temple text-[1.3rem] leading-tight text-sage-900">
                            {request.memberName}
                        </h2>
                        <p className="text-[0.86rem] text-ink-soft">
                            {request.familyName}
                            {member ? ` · ${MEMBER_CATEGORY_LABELS[member.category]}` : ''}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-cream px-2 py-0.5 text-[0.7rem] font-semibold text-muted">
                            <ShieldCheck size={12}/> Limited view
                        </p>
                    </div>
                    <button className="rounded-lg p-1.5 text-muted hover:bg-cream hover:text-sage-900"
                            onClick={onClose} aria-label="Close profile">
                        <X size={17}/>
                    </button>
                </div>

                <dl className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {rows.map((row) => (
                        <div key={row.label}
                             className="flex items-start gap-2.5 rounded-xl border border-line-soft bg-white px-3 py-2.5">
                            <span
                                className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-lg bg-cream text-sage-800">
                                <row.icon size={14} strokeWidth={1.9}/>
                            </span>
                            <div className="min-w-0">
                                <dt className="text-[0.68rem] font-bold tracking-widest text-muted uppercase">
                                    {row.label}
                                </dt>
                                <dd className="truncate text-[0.9rem] text-ink">{row.value}</dd>
                            </div>
                        </div>
                    ))}
                </dl>

                <div className="mt-3 rounded-xl border border-line-soft bg-cream/70 px-3 py-2.5">
                    <p className="text-[0.68rem] font-bold tracking-widest text-muted uppercase">Reason given</p>
                    <p className="mt-0.5 text-[0.9rem] leading-relaxed text-ink-soft italic">"{request.reason}"</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.76rem] text-muted">
                    <span>{request.id}</span>
                    <span>·</span>
                    <span>sent {prettyDate(request.submittedOn)}</span>
                    <span>·</span>
                    <span>{request.status}</span>
                </div>

                <p className="mt-3 rounded-xl border border-accent-blue/25 bg-accent-blue-50 px-3 py-2 text-[0.8rem] leading-relaxed text-accent-blue">
                    Only the details needed to decide the transfer are shown. The family's address,
                    identity number, bookings and donations are not visible to the temple.
                </p>

                <div className="mt-4 flex justify-end">
                    <button className="btn btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}

const RequestRow = ({
                        request,
                        note,
                        onNote,
                        onViewProfile,
                    }: {
    request: TransferRequest
    note: string
    onNote: (value: string) => void
    onViewProfile: () => void
}) => {
    const {t} = useTranslation()
    const pending = request.status === 'Pending'

    return (
        <li className="flex flex-col gap-3 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[0.98rem] font-bold text-sage-900">
                        {request.familyName}
                        <span className="ml-2 text-[0.84rem] font-normal text-ink-soft">
                            {request.memberName}
                        </span>
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.86rem] text-ink-soft">
                        <span>{request.fromTemple}</span>
                        <ArrowRight size={13} className="text-muted"/>
                        <strong className="font-semibold text-sage-900">{request.toTemple}</strong>
                    </p>
                </div>
                <span className={`rounded-md border px-2 py-0.5 text-[0.7rem] font-bold ${
                    pending
                        ? 'border-accent-gold/40 bg-accent-gold-50 text-status-amber'
                        : request.status === 'Approved'
                            ? 'border-accent-green/30 bg-accent-green-50 text-accent-green'
                            : 'border-status-rose/30 bg-lotus-50 text-status-rose'
                }`}>
                    {request.status}
                </span>
            </div>

            <p className="rounded-lg bg-cream px-3 py-2 text-[0.86rem] text-ink-soft italic">
                "{request.reason}"
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <p className="flex items-center gap-1.5 text-[0.74rem] text-muted">
                    <Clock size={12}/> {request.id} · sent {prettyDate(request.submittedOn)}
                    {request.reviewNote ? ` · note: ${request.reviewNote}` : ''}
                </p>
                <button type="button" onClick={onViewProfile}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1 text-[0.78rem] font-semibold text-sage-800 transition hover:border-sage-300 hover:bg-sage-50">
                    <Eye size={14}/> {t('transfer.viewProfile')}
                </button>
            </div>

            {pending && (
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        value={note}
                        onChange={(event) => onNote(event.target.value)}
                        placeholder={t('transfer.notePlaceholder')}
                        className="min-w-56 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-[0.86rem] text-ink focus:outline-none"/>
                    <button className="btn btn-primary px-3! py-1.5! text-[0.84rem]"
                            onClick={() => approveTransfer(request.id, note || undefined)}>
                        <Check size={15}/> {t('transfer.approve')}
                    </button>
                    <button className="btn btn-secondary px-3! py-1.5! text-[0.84rem]"
                            onClick={() => rejectTransfer(request.id, note || undefined)}>
                        <X size={15}/> {t('transfer.reject')}
                    </button>
                </div>
            )}
        </li>
    )
}