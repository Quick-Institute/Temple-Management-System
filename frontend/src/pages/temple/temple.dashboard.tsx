import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {
    ArrowRight,
    CalendarCheck,
    CalendarDays,
    CalendarPlus,
    ChevronRight,
    Heart,
    Landmark,
    MapPin,
    Megaphone,
    MoreHorizontal,
    UserPlus,
    Users,
    Users2,
} from 'lucide-react'
import {AppShell} from '../../layouts/AppShell'
import {currentTemple} from '../../data/demo'
import {
    type BookingStatus,
    dashboardNotices,
    type DashboardStat,
    dashboardStats,
    quickActions,
    recentBookings,
    rs,
    todaySchedule,
} from '../../data/adminDashboard'
import {useTemples} from '../../data/templeStore.tsx'
import {useActiveTemple} from '../../hooks/useActiveTemple'
import {useTranslation} from 'react-i18next'
import {useAuth} from '../../context/AuthContext'
import {adminRoutes} from '../../routes/adminRoutes'

/* ------------------------------ building blocks ------------------------------ */

const STAT_ICON: Record<DashboardStat['key'], React.ReactNode> = {
    families: <Users size={26}/>,
    dana: <CalendarCheck size={26}/>,
    donations: <Heart size={26}/>,
    events: <CalendarDays size={26}/>,
}

const TONE_BG: Record<'blue' | 'green' | 'gold' | 'purple', string> = {
    blue: 'bg-accent-blue',
    green: 'bg-accent-green',
    gold: 'bg-accent-gold',
    purple: 'bg-accent-purple',
}

const TONE_DOT: Record<'blue' | 'green' | 'gold' | 'purple', string> = {
    blue: 'bg-accent-blue ring-accent-blue-50',
    green: 'bg-accent-green ring-accent-green-50',
    gold: 'bg-accent-gold ring-accent-gold-50',
    purple: 'bg-accent-purple ring-accent-purple-50',
}

const STATUS_BADGE: Record<BookingStatus, string> = {
    Pending: 'border-accent-gold/40 bg-accent-gold-50 text-status-amber',
    Approved: 'border-accent-green/30 bg-accent-green-50 text-accent-green',
    Rejected: 'border-status-rose/30 bg-lotus-50 text-status-rose',
}

const StatTile = ({stat, label, deltaUnit}: {
    stat: DashboardStat
    label: string
    deltaUnit: string
}) => (
    <button type="button"
            className="stat-card group text-left"
            title={label}>
        <span className={`stat-icon ${TONE_BG[stat.tone]}`}>{STAT_ICON[stat.key]}</span>
        <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.8rem] font-medium text-ink-soft">{label}</span>
            <span className="mt-0.5 block font-temple text-[1.42rem] leading-tight font-semibold text-sage-900">
                {stat.money ? rs(stat.value) : stat.value}
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-[0.73rem] font-medium text-accent-green">
                <ArrowRight size={12} className="-rotate-45"/> {`+${stat.delta} `}<span
                className="font-normal text-muted">{deltaUnit}</span>
            </span>
        </span>
        <ChevronRight size={17} className="flex-none text-muted/60 transition group-hover:text-sage-700"/>
    </button>
)

const Kv = ({label, children}: { label: string; children: React.ReactNode }) => (
    <div className="kv-row border-line-soft last:border-b-0">
        <span className="kv-key">{label}</span>
        <span className="hidden w-2 flex-none text-muted sm:block">:</span>
        <span className="kv-val">{children}</span>
    </div>
)

/* --------------------------------- page ------------------------------------- */

/** The dashboard body without the shell, so any layout (portal or standalone) can host it. */
export const TempleDashboardContent = () => {
    const {t} = useTranslation()
    const [openRow, setOpenRow] = useState<string | null>(null)

    useEffect(() => {
        if (!openRow) return
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpenRow(null)
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [openRow])

    const statLabel: Record<DashboardStat['key'], string> = {
        families: t('dash.registeredFamilies'),
        dana: t('dash.totalDana'),
        donations: t('dash.totalDonations'),
        events: t('dash.upcomingEvents'),
    }

    const quickLabel = {
        dana: {
            label: 'Add Dana Slot',
            icon: <CalendarCheck size={18}/>,
            tile: 'border-accent-green/25 bg-accent-green-50/60 text-accent-green'
        },
        event: {
            label: 'Create Event',
            icon: <CalendarPlus size={18}/>,
            tile: 'border-accent-purple/25 bg-accent-purple-50/60 text-accent-purple'
        },
        announcement: {
            label: 'Send Announcement',
            icon: <Megaphone size={18}/>,
            tile: 'border-status-rose/25 bg-lotus-50 text-status-rose'
        },
        users: {
            label: 'Manage Users',
            icon: <Users2 size={18}/>,
            tile: 'border-accent-blue/25 bg-accent-blue-50/60 text-accent-blue'
        },
    } as const

    /* "View Details" opens the temple chosen in the top-bar switcher, not the latest record. */
    const {temple: switchedTemple} = useActiveTemple()
    const {activeTemple: storeTemple} = useTemples()
    const activeTemple = switchedTemple ?? storeTemple
    const {user} = useAuth()
    const detailsHref = activeTemple ? `${adminRoutes.templeInformation}/${activeTemple.id}` : adminRoutes.templeInformation

    /*
     * The hero and the Temple Information card follow the temple chosen in the top-bar switcher.
     * A chief incumbent who holds several temples gets to look at whichever one they picked.
     */
    const templeInfo = {
        name: activeTemple?.name ?? currentTemple.name,
        village: activeTemple?.village ?? currentTemple.village,
        district: activeTemple?.district ?? currentTemple.district,
        registerCode: activeTemple?.registrationId ?? currentTemple.registerCode,
        status: activeTemple?.status ?? 'Active',
        chiefIncumbent: activeTemple?.chiefIncumbent ?? currentTemple.chiefIncumbent,
        phone: activeTemple?.phone ?? currentTemple.phone,
    }

    const noticeIcon = {
        booking: {icon: <CalendarCheck size={16}/>, tone: 'bg-accent-gold-50 text-accent-gold'},
        event: {icon: <CalendarDays size={16}/>, tone: 'bg-accent-purple-50 text-accent-purple'},
        family: {icon: <UserPlus size={16}/>, tone: 'bg-accent-green-50 text-accent-green'},
        donation: {icon: <Heart size={16}/>, tone: 'bg-lotus-50 text-status-rose'},
    } as const

    return (
        <div className="mx-auto flex max-w-[105rem] flex-col gap-4">

            {/* ---------------------------- Hero ---------------------------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-[#eff9ff]">
                <div
                    className="absolute inset-0 bg-[linear-gradient(105deg,#f0f9ff_0%,#e0f2fe_46%,#bae6fd_100%)]"/>
                {/* leaf watermark */}
                <svg viewBox="0 0 200 260" aria-hidden="true"
                     className="pointer-events-none absolute -top-6 -left-8 h-64 w-52 text-gold-600/12"
                     fill="currentColor">
                    <path d="M40 10c46 52 58 128 24 188-48-40-55-120-24-188Z"/>
                    <path d="M20 120c40 16 62 60 56 124-50-12-68-68-56-124Z"/>
                </svg>

                <div className="relative flex flex-col md:flex-row">
                    <div className="relative z-10 flex-1 px-5 py-6 sm:px-8 sm:py-7">
                        <p className="text-[0.95rem] text-ink-soft">{t('dash.welcome')}</p>
                        <h1 className="mt-0.5 font-temple text-[1.7rem] leading-tight font-semibold text-sage-900 sm:text-[2rem] xl:text-[2.15rem]">
                            {templeInfo.name}!
                        </h1>
                        <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                                <span className="inline-flex items-center gap-1.5 text-[0.85rem] text-ink-soft">
                                    <MapPin size={15} className="flex-none text-sage-700"/>
                                    {templeInfo.village}, {templeInfo.district}
                                </span>
                            <span
                                className="inline-flex items-center rounded-full border border-gold-300 bg-white/70 px-2.5 py-0.5 text-[0.74rem] font-semibold text-gold-800">
                                    {user?.roleLabel ?? 'Temple Admin'}
                                </span>
                        </div>
                        <p className="mt-3 max-w-[32ch] text-[0.92rem] leading-relaxed text-ink-soft">
                            {t('dash.intro')}
                        </p>
                    </div>

                    <div className="relative z-10 hidden items-center px-1 lg:flex">
                        <div className="w-52 text-center">
                            <svg viewBox="0 0 112 72" fill="none" stroke="currentColor" strokeWidth={4}
                                 strokeLinejoin="round" aria-hidden="true"
                                 className="mx-auto h-10 w-16 text-gold-600">
                                <path d="M56 67C35 66.8 20.5 54.2 18 31.7c18.4.4 31.8 11.7 38 35.3Z"/>
                                <path d="M56 67c20.9-.2 35.4-12.8 38-35.3C75.5 32.1 62.1 43.4 56 67Z"/>
                                <path d="M56 67C40.7 52.8 39.8 31.9 56 10c16.2 21.9 15.3 42.8 0 57Z"/>
                                <path d="M56 65.5C53.2 40.2 61.4 22.2 76.7 16c6.8 21.6-.8 39.7-20.7 49.5Z"/>
                                <path d="M56 65.5C58.8 40.2 50.6 22.2 35.3 16c-6.8 21.6.8 39.7 20.7 49.5Z"/>
                            </svg>
                            <p className="mt-1.5 font-temple text-[0.95rem] leading-snug text-gold-800 italic">
                                “{'May all beings be happy, healthy and at peace.'}”
                            </p>
                        </div>
                    </div>

                    <div className="relative min-h-34 md:w-[36%] md:max-w-108">
                        <img src="/images/temple-bg-768.jpg" alt={templeInfo.name}
                             className="h-full w-full object-cover"/>
                        <div
                            className="absolute inset-0 bg-[linear-gradient(90deg,#e0f2fe_0%,rgba(253,244,222,0.35)_22%,rgba(253,244,222,0)_55%)]"/>
                    </div>
                </div>
            </section>

            {/* ---------------------------- Stats --------------------------- */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {dashboardStats.map((stat) => (
                    <StatTile
                        key={stat.key}
                        stat={stat}
                        label={statLabel[stat.key]}
                        deltaUnit={stat.key === 'events' ? t('dash.thisWeek') : t('dash.thisMonth')}
                    />
                ))}
            </div>

            {/* ------------------- Temple info + schedule ------------------- */}
            <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
                <section className="rounded-xl border border-line bg-paper">
                    <div className="panel-head">
                        <h2 className="panel-title">
                            <Landmark size={18} className="flex-none text-gold-600"/>
                            {t('dash.templeInfo')}
                        </h2>
                        <Link to={detailsHref} className="subtle-link">
                            {t('common.viewDetails')} <ArrowRight size={15}/>
                        </Link>
                    </div>
                    <div className="flex flex-col gap-4 p-4 sm:flex-row">
                        <img src="/images/temple-bg-480.jpg" alt={templeInfo.name}
                             className="h-44 w-full flex-none rounded-xl border border-line-soft object-cover sm:h-auto sm:w-38"/>
                        <div className="min-w-0 flex-1">
                            <Kv label={'Temple Name'}>{templeInfo.name}</Kv>
                            <Kv label={'Location'}>{templeInfo.village}, {templeInfo.district}</Kv>
                            <Kv label={'Registration ID'}><span
                                className="mono">{templeInfo.registerCode}</span></Kv>
                            <Kv label={t('common.status')}>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[0.78rem] font-semibold ${
                                            templeInfo.status === 'Active'
                                                ? 'bg-accent-green-50 text-accent-green'
                                                : 'bg-accent-gold-50 text-status-amber'
                                        }`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                            templeInfo.status === 'Active' ? 'bg-accent-green' : 'bg-accent-gold'
                                        }`}/>
                                        {templeInfo.status}
                                    </span>
                            </Kv>
                            <Kv label={'Chief Incumbent'}>{templeInfo.chiefIncumbent}</Kv>
                            <Kv label={'Contact'}>{templeInfo.phone}</Kv>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-line bg-paper">
                    <div className="panel-head">
                        <h2 className="panel-title">
                            <CalendarDays size={18} className="flex-none text-gold-600"/>
                            {t('dash.todaySchedule')}
                        </h2>
                        <button type="button" className="subtle-link">{t('common.viewAll')} <ArrowRight size={15}/>
                        </button>
                    </div>
                    <ol className="m-0 list-none p-4">
                        {todaySchedule.map((entry, index) => (
                            <li key={entry.id} className="relative flex items-start gap-3 pb-6">
                                    <span
                                        className="w-[4.3rem] flex-none pt-0.5 text-[0.78rem] font-semibold text-sage-800">
                                        {entry.time}
                                    </span>
                                <span className="relative flex flex-none flex-col items-center pt-1">
                                        <span
                                            className={`h-3 w-3 rounded-full ring-4 ${TONE_DOT[entry.dot]}`}/>
                                    {index < todaySchedule.length - 1 && (
                                        <span
                                            className="absolute top-4 left-1/2 h-[calc(100%+0.75rem)] w-px -translate-x-1/2 bg-line"/>
                                    )}
                                    </span>
                                <div className="min-w-0 flex-1 pt-0.5">
                                    <div className="text-[0.9rem] leading-tight font-semibold text-sage-900">
                                        {entry.title}
                                    </div>
                                    <div className="mt-0.5 text-[0.75rem] text-muted">{entry.venue}</div>
                                </div>
                                <span
                                    className={`flex-none rounded-md px-2 py-1 text-[0.72rem] font-semibold ${
                                        entry.marker.kind === 'bookings'
                                            ? 'bg-accent-green-50 text-accent-green'
                                            : 'bg-accent-purple-50 text-accent-purple'
                                    }`}>
                                        {entry.marker.kind === 'bookings'
                                            ? `${entry.marker.count} ${t('dash.bookings')}`
                                            : 'Event'}
                                    </span>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>

            {/* ------------- Bookings + quick actions + notices ------------ */}
            <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr_1fr]">
                <section className="overflow-hidden rounded-xl border border-line bg-paper">
                    <div className="panel-head">
                        <h2 className="panel-title">
                                <span className="grid h-6 w-6 place-items-center text-gold-600">
                                    <svg viewBox="0 0 112 72" fill="none" stroke="currentColor" strokeWidth={6}
                                         strokeLinejoin="round" aria-hidden="true" className="h-5 w-7">
                                        <path d="M56 67C35 66.8 20.5 54.2 18 31.7c18.4.4 31.8 11.7 38 35.3Z"/>
                                        <path d="M56 67c20.9-.2 35.4-12.8 38-35.3C75.5 32.1 62.1 43.4 56 67Z"/>
                                        <path d="M56 67C40.7 52.8 39.8 31.9 56 10c16.2 21.9 15.3 42.8 0 57Z"/>
                                    </svg>
                                </span>
                            {t('dash.recentDana')}
                        </h2>
                        <button type="button" className="subtle-link">{t('common.viewAll')} <ArrowRight size={15}/>
                        </button>
                    </div>
                    <div className="table-wrap">
                        <table className="tbl">
                            <thead>
                            <tr>
                                <th className="px-1.5 text-[0.66rem]">{t('dash.date')}</th>
                                <th className="px-1.5 text-[0.66rem]">{t('dash.familyName')}</th>
                                <th className="px-1.5 text-[0.66rem]">{t('dash.danaType')}</th>
                                <th className="hidden px-1.5 text-[0.66rem] sm:table-cell">{t('dash.time')}</th>
                                <th className="px-1.5 text-[0.66rem]">{t('common.status')}</th>
                                <th className="w-9 px-1 text-right">
                                    <span className="sr-only">{'Actions'}</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {recentBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="px-1.5 text-[0.76rem] whitespace-nowrap text-ink-soft">{booking.date}</td>
                                    <td className="px-1.5 text-[0.8rem] font-semibold text-sage-900">
                                        <div className="max-w-30 truncate"
                                             title={booking.family}>{booking.family}</div>
                                    </td>
                                    <td className="px-1.5 text-[0.76rem] whitespace-nowrap text-ink-soft">{booking.danaType}</td>
                                    <td className="mono hidden px-1.5 text-[0.74rem] whitespace-nowrap text-ink-soft sm:table-cell">{booking.time}</td>
                                    <td className="px-1.5">
                                            <span
                                                className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[0.7rem] font-semibold ${STATUS_BADGE[booking.status]}`}>
                                                {booking.status === 'Pending' ? 'Pending'
                                                    : booking.status === 'Approved' ? 'Approved' : 'Rejected'}
                                            </span>
                                    </td>
                                    <td className="relative w-9 px-1 text-right">
                                        <button type="button"
                                                className="rounded-lg p-1.5 text-muted hover:bg-cream hover:text-sage-800"
                                                aria-label={'Row actions'} aria-expanded={openRow === booking.id}
                                                onClick={() => setOpenRow((v) => (v === booking.id ? null : booking.id))}>
                                            <MoreHorizontal size={16}/>
                                        </button>
                                        {openRow === booking.id && (
                                            <div role="menu"
                                                 className="absolute top-full right-0 z-20 mt-1 w-36 overflow-hidden rounded-lg border border-line bg-paper py-1 text-left shadow-lg">
                                                {['View Details', 'Approved', 'Rejected'].map((action) => (
                                                    <button key={action} type="button" role="menuitem"
                                                            onClick={() => setOpenRow(null)}
                                                            className="block w-full px-3 py-2 text-left text-[0.82rem] text-ink-soft hover:bg-cream">
                                                        {action}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-xl border border-line bg-paper">
                    <div className="panel-head">
                        <h2 className="panel-title">
                            <Megaphone size={18} className="flex-none text-gold-600"/>
                            {t('dash.quickActions')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 p-4">
                        {quickActions.map((action) => (
                            <button key={action.key} type="button"
                                    className={`quick-tile ${quickLabel[action.key].tile}`}>
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="grid h-7 w-7 place-items-center rounded-lg bg-white/80">{quickLabel[action.key].icon}</span>
                                        <ChevronRight size={15} className="ml-auto opacity-60"/>
                                    </span>
                                <span className="text-[0.82rem] leading-snug font-semibold text-ink">
                                        {quickLabel[action.key].label}
                                    </span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-line bg-paper">
                    <div className="panel-head">
                        <h2 className="panel-title">
                                <span
                                    className="grid h-6 w-6 place-items-center rounded-md bg-accent-gold-50 text-accent-gold">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
                                         strokeLinecap="round" aria-hidden="true" className="h-4 w-4">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                        <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
                                    </svg>
                                </span>
                            {t('dash.latestNotifications')}
                        </h2>
                        <button type="button" className="subtle-link">{t('common.viewAll')} <ArrowRight size={15}/>
                        </button>
                    </div>
                    <ul className="m-0 list-none divide-y divide-line-soft">
                        {dashboardNotices.map((notice) => (
                            <li key={notice.id} className="flex items-start gap-2.5 px-4 py-3">
                                    <span
                                        className={`mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg ${noticeIcon[notice.icon].tone}`}>
                                        {noticeIcon[notice.icon].icon}
                                    </span>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[0.83rem] leading-snug font-semibold text-sage-900">
                                        {notice.title}
                                    </div>
                                    <div className="mt-0.5 text-[0.74rem] text-muted">{notice.detail}</div>
                                </div>
                                <span className="flex-none pt-0.5 text-[0.68rem] whitespace-nowrap text-muted">
                                        {notice.time}
                                    </span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    )
}

/** Standalone route wrapper: the dashboard plus our rail. */
export const TempleDashboardPage = () => (
    <AppShell>
        <TempleDashboardContent/>
    </AppShell>
)