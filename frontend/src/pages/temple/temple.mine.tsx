import {useMemo, useState} from 'react'
import {
    ArrowRightLeft,
    CalendarDays,
    Check,
    CircleAlert,
    Clock,
    Landmark,
    Mail,
    MapPin,
    Phone,
    Send,
    Users,
    X,
} from 'lucide-react'
import {AppShell} from '../../layouts/AppShell'
import {useAuth} from '../../context/AuthContext'
import {usePermissions} from '../../hooks/usePermissions'
import {useTemples} from '../../data/templeStore.tsx'
import {prettyDate} from '../../data/templeStatus'
import {requestTransfer, type TransferStatus, useMyTempleName, useTransferRequests} from '../../data/transferStore'
import {TempleCombobox} from '../../components/TempleCombobox'
import {useTranslation} from 'react-i18next'
import type {Temple} from '../../data/temples'

const STATUS_TONE: Record<TransferStatus, string> = {
    Pending: 'border-accent-gold/40 bg-accent-gold-50 text-status-amber',
    Approved: 'border-accent-green/30 bg-accent-green-50 text-accent-green',
    Rejected: 'border-status-rose/30 bg-lotus-50 text-status-rose',
}

const Row = ({icon: Icon, label, value}: { icon: typeof Landmark; label: string; value: string }) => (
    <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg bg-cream text-sage-800">
            <Icon size={15} strokeWidth={1.9}/>
        </span>
        <div className="min-w-0">
            <dt className="text-[0.72rem] font-bold tracking-widest text-muted uppercase">{label}</dt>
            <dd className="text-[0.95rem] text-ink">{value}</dd>
        </div>
    </div>
)

/**
 * Temple Information for the people who belong to one temple - a committee member, a religious
 * representative or a family user. They see their own temple and nothing else; a family user can
 * also ask for a temporary transfer.
 */
export const MyTemplePage = () => {
    const {t} = useTranslation()
    const {user} = useAuth()
    const {role} = usePermissions()
    const {records, activeTemple} = useTemples()
    const requests = useTransferRequests()

    const templeName = useMyTempleName(user?.identifier, user?.templeName)
    const temple =
        records.find((record) => record.name === templeName) ??
        activeTemple ??
        records[0]

    const isFamily = role === 'family'

    const myRequests = useMemo(
        () => requests.filter((request) => request.memberEmail === user?.identifier),
        [requests, user?.identifier],
    )

    /* Only the temples that finished registration - a pending or rejected record cannot take a family in. */
    const options: Temple[] = records
        .filter((record) => record.status === 'Active' && record.name !== temple?.name)
        .map((record) => ({
            code: record.registrationId ?? record.id.toUpperCase(),
            name: {si: '', en: record.name},
            village: {si: '', en: record.village},
            district: {si: '', en: record.district},
            postalCode: record.postalCode,
        }))

    if (!temple) {
        return (
            <AppShell>
                <div className="card mx-auto max-w-160 p-8 text-center">
                    <CircleAlert className="mx-auto text-status-amber"/>
                    <h1 className="mt-2 font-temple text-[1.3rem] text-sage-900">{t('temple.noTempleLinked')}</h1>
                    <p className="mt-1 text-[0.92rem] text-ink-soft">
                        {t('temple.noTempleHelp')}
                    </p>
                </div>
            </AppShell>
        )
    }

    return (
        <AppShell>
            <div className="mx-auto flex max-w-7xl flex-col gap-4">
                {/* Temple header */}
                <header className="card overflow-hidden p-0">
                    <div className="relative h-36 w-full overflow-hidden sm:h-44">
                        <img src="/images/temple-bg-1024.jpg" alt={temple.name}
                             className="h-full w-full object-cover"/>
                        <div
                            className="absolute inset-0 bg-linear-to-r from-sage-950/80 via-sage-950/45 to-transparent"/>
                        <div className="absolute inset-x-0 bottom-0 p-5">
                            <p className="text-[0.7rem] font-bold tracking-[0.18em] text-sky-200 uppercase">
                                {t('temple.myTemple')}
                            </p>
                            <h1 className="mt-0.5 font-temple text-[1.7rem] leading-tight text-white drop-shadow">
                                {temple.name}
                            </h1>
                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.86rem] text-sky-100">
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin size={14}/> {temple.village}, {temple.district}
                                </span>
                                <span className="mono rounded bg-white/15 px-2 py-0.5 text-[0.78rem]">
                                    {temple.registrationId ?? 'Not registered yet'}
                                </span>
                                <span className="rounded-full border border-white/40 px-2 py-0.5 text-[0.74rem]">
                                    {temple.status}
                                </span>
                            </p>
                        </div>
                    </div>

                    <dl className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                        <Row icon={Landmark} label={t('temple.templeType')} value={temple.type}/>
                        <Row icon={MapPin} label={t('temple.address')} value={`${temple.address}, ${temple.village}`}/>
                        <Row icon={Users} label={t('dash.chiefIncumbent')} value={temple.chiefIncumbent}/>
                        <Row icon={Phone} label={t('temple.phone')} value={temple.phone}/>
                        <Row icon={Mail} label={t('temple.email')} value={temple.email}/>
                        <Row icon={CalendarDays} label={t('temple.established')} value={temple.established}/>
                    </dl>
                </header>

                {/* Everything on this page is for reading only - the Temple Admin keeps the records. */}
                <p className="flex items-start gap-2 rounded-xl border border-line bg-cream/70 px-4 py-3 text-[0.92rem] text-ink-soft">
                    <CircleAlert size={17} className="mt-0.5 flex-none text-sage-600"/>
                    {t('temple.readOnlyNote')}
                </p>

                <div className="grid gap-4 lg:grid-cols-2">
                    <section className="card p-5">
                        <h2 className="font-temple text-[1.1rem] text-sage-900">{t('temple.danaSessions')}</h2>
                        <ul className="mt-2 flex list-none flex-wrap gap-2 p-0">
                            {temple.danaSessions.map((session) => (
                                <li key={session}
                                    className="rounded-lg border border-line bg-cream px-3 py-1.5 text-[0.86rem] text-ink">
                                    {session}
                                </li>
                            ))}
                        </ul>
                        <h3 className="mt-4 font-temple text-[1rem] text-sage-900">{t('temple.hallsCapacity')}</h3>
                        <ul className="mt-1.5 flex list-none flex-col gap-1 p-0 text-[0.9rem] text-ink-soft">
                            {temple.capacity.map((hall) => (
                                <li key={hall.id} className="flex justify-between gap-3 border-b border-line-soft pb-1">
                                    <span>{hall.label}</span>
                                    <span className="font-semibold text-ink">{hall.seats} {t('temple.seats')}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="card p-5">
                        <h2 className="font-temple text-[1.1rem] text-sage-900">{t('temple.facilities')}</h2>
                        <ul className="mt-2 flex list-none flex-wrap gap-1.5 p-0">
                            {temple.facilities.map((facility) => (
                                <li key={facility}
                                    className="rounded-md border border-line bg-white px-2.5 py-1 text-[0.82rem] text-ink-soft">
                                    {facility}
                                </li>
                            ))}
                        </ul>
                        <h3 className="mt-4 font-temple text-[1rem] text-sage-900">{t('temple.committee')}</h3>
                        <ul className="mt-1.5 flex list-none flex-col gap-1 p-0 text-[0.88rem] text-ink-soft">
                            {temple.committee.slice(0, 4).map((member) => (
                                <li key={member.name}
                                    className="flex flex-wrap justify-between gap-2 border-b border-line-soft pb-1">
                                    <span className="font-semibold text-ink">{member.name}</span>
                                    <span>{member.role}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Temporary transfer - family users only */}
                {isFamily && (
                    <TransferPanel
                        currentTemple={temple.name}
                        options={options}
                        requests={myRequests}/>
                )}
            </div>
        </AppShell>
    )
}

/** Ask for a temporary transfer, then watch the request until the temple admin decides. */
const TransferPanel = ({
                           currentTemple,
                           options,
                           requests,
                       }: {
    currentTemple: string
    options: Temple[]
    requests: ReturnType<typeof useTransferRequests>
}) => {
    const {t} = useTranslation()
    const {user} = useAuth()
    const [target, setTarget] = useState('')
    const [reason, setReason] = useState('')
    const [sent, setSent] = useState(false)

    const pending = requests.some((request) => request.status === 'Pending')

    const submit = () => {
        if (!target || !reason.trim()) return
        requestTransfer({
            memberName: user?.name ?? 'Family user',
            memberEmail: user?.identifier ?? '',
            familyName: user?.familyName ?? '-',
            fromTemple: currentTemple,
            toTemple: target,
            reason: reason.trim(),
        })
        setTarget('')
        setReason('')
        setSent(true)
    }

    return (
        <section className="card p-5">
            <div className="flex items-start gap-3">
                <span
                    className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-accent-blue-50 text-accent-blue ring-1 ring-accent-blue/20">
                    <ArrowRightLeft size={18} strokeWidth={1.9}/>
                </span>
                <div>
                    <h2 className="font-temple text-[1.15rem] text-sage-900">{t('temple.transferTitle')}</h2>
                    <p className="mt-0.5 text-[0.9rem] leading-relaxed text-ink-soft">
                        {t('temple.transferIntro')}
                    </p>
                </div>
            </div>

            {pending ? (
                <p className="mt-4 flex items-start gap-2 rounded-xl border border-accent-gold/30 bg-accent-gold-50 px-4 py-3 text-[0.9rem] text-status-amber">
                    <Clock size={16} className="mt-0.5 flex-none"/>
                    {t('temple.requestPending')}
                </p>
            ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr_1.3fr_auto] sm:items-end">
                    <TempleCombobox
                        id="transfer-temple"
                        label={t('temple.moveTo')}
                        icon={<Landmark size={17}/>}
                        placeholder={t('temple.moveToPlaceholder')}
                        value={target}
                        onChange={setTarget}
                        onPick={(picked) => setTarget(picked.name.en)}
                        onCommit={(chosen) => setTarget(chosen)}
                        options={options}
                        language="en"/>
                    <label className="flex flex-col gap-1">
                        <span className="text-[0.8rem] font-semibold text-ink">{t('temple.whyMoving')}</span>
                        <input
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder={t('temple.whyMovingPlaceholder')}
                            className="rounded-xl border border-line bg-white px-3 py-2.5 text-[0.92rem] placeholder:text-[#8299a8] focus:outline-none"/>
                    </label>
                    <button className="btn btn-primary" onClick={submit} disabled={!target || !reason.trim()}>
                        <Send size={15}/> {t('temple.sendRequest')}
                    </button>
                </div>
            )}

            {sent && (
                <p className="mt-3 flex items-center gap-2 text-[0.85rem] font-semibold text-accent-green">
                    <Check size={15}/> {t('temple.requestSent')}
                </p>
            )}

            {requests.length > 0 && (
                <ul className="mt-4 flex list-none flex-col gap-2 border-t border-line-soft pt-4 p-0">
                    {requests.map((request) => (
                        <li key={request.id} className="rounded-xl border border-line bg-white px-4 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[0.92rem] font-semibold text-sage-900">
                                    {request.fromTemple} → {request.toTemple}
                                </span>
                                <span
                                    className={`rounded-md border px-2 py-0.5 text-[0.7rem] font-bold ${STATUS_TONE[request.status]}`}>
                                    {request.status}
                                </span>
                            </div>
                            <p className="mt-1 text-[0.82rem] text-ink-soft">{request.reason}</p>
                            <p className="mt-0.5 text-[0.74rem] text-muted">
                                {request.id} · sent {prettyDate(request.submittedOn)}
                                {request.reviewNote ? ` · note: ${request.reviewNote}` : ''}
                            </p>
                            {request.status === 'Rejected' && (
                                <p className="mt-1 inline-flex items-center gap-1.5 text-[0.78rem] text-status-rose">
                                    <X size={13}/> Not approved. You can send a new request.
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}