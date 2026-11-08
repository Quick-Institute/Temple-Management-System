import type {ReactNode} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {
    ArrowRight,
    BarChart3,
    CalendarCheck,
    CalendarDays,
    ChevronRight,
    Heart,
    Landmark,
    LayoutDashboard,
    Megaphone,
    PlusCircle,
    Settings,
    Users,
    Users2,
} from 'lucide-react'
import {AppShell} from '../../layouts/AppShell'
import {currentTemple} from '../../data/demo'
import {type AdminModuleKey, adminRoutes} from '../../routes/adminRoutes'

/**
 * Placeholder screen for the rail modules that are not built yet. They are real routes, so every
 * row in the sidebar navigates - the page states what the module will hold and links back to the
 * parts that already work, instead of the row sitting there locked.
 */
type ModuleConfig = {
    title: string
    lead: string
    icon: ReactNode
    tone: string
    capabilities: string[]
    related?: { label: string; to: string }[]
}

const MODULES: Record<AdminModuleKey, ModuleConfig> = {
    dana: {
        title: 'Dana Management',
        lead: 'Open dana sessions, approve family bookings and keep the daily rota for the temple.',
        icon: <CalendarCheck size={22}/>,
        tone: 'bg-accent-green-50 text-accent-green',
        capabilities: [
            'Session calendar with morning, lunch and evening slots',
            'Approve, reject and re-assign family bookings',
            'Guest counts and capacity per session',
            'Printable dana rota for the notice board',
        ],
        related: [{label: 'See today\'s schedule', to: adminRoutes.dashboard}],
    },
    events: {
        title: 'Event Management',
        lead: 'Publish Poya programmes, Daham Pasal terms and committee meetings on one calendar.',
        icon: <CalendarDays size={22}/>,
        tone: 'bg-accent-purple-50 text-accent-purple',
        capabilities: [
            'Create events with venue, time and repeat rules',
            'Publish to the temple calendar and the family app',
            'Approval queue for events proposed by families',
            'Attendance lists for each programme',
        ],
        related: [{label: 'Upcoming events on the dashboard', to: adminRoutes.dashboard}],
    },
    announcements: {
        title: 'Announcements',
        lead: 'Send temple notices to every family, or to one committee at a time.',
        icon: <Megaphone size={22}/>,
        tone: 'bg-lotus-50 text-status-rose',
        capabilities: [
            'Draft and schedule notices',
            'Target by committee, village or all families',
            'Attach a poster or a PDF circular',
            'Delivery log with read counts',
        ],
    },
    families: {
        title: 'Family Members',
        lead: 'The family register for this temple: who belongs where, and who approves a join request.',
        icon: <Users size={22}/>,
        tone: 'bg-accent-blue-50 text-accent-blue',
        capabilities: [
            'Approve new family registrations',
            'Household members, NIC and contact details',
            'Village transfers between temples',
            'QR registration sheet for the notice board',
        ],
        related: [{label: 'Open the family sign-up form', to: '/register/familyuser'}],
    },
    donations: {
        title: 'Donations',
        lead: 'Record offerings, verify bank transfers and issue the monthly statement.',
        icon: <Heart size={22}/>,
        tone: 'bg-accent-gold-50 text-accent-gold',
        capabilities: [
            'Log a donation against a family',
            'Verify pending bank transfers',
            'Purpose tags: dana, maintenance, Daham Pasal',
            'Monthly and annual summaries',
        ],
    },
    users: {
        title: 'User Management',
        lead: 'Committee accounts, their designations and what each one is allowed to see.',
        icon: <Users2 size={22}/>,
        tone: 'bg-accent-green-50 text-accent-green',
        capabilities: [
            'Invite committee members',
            'Roles: admin, treasurer, dana coordinator',
            'Suspend or reset an account',
            'Access log per user',
        ],
        related: [{label: 'Open the committee sign-up form', to: '/register/committeemember'}],
    },
    reports: {
        title: 'Reports',
        lead: 'The numbers the Dayaka Sabha and the Divisional Secretariat ask for each month.',
        icon: <BarChart3 size={22}/>,
        tone: 'bg-accent-blue-50 text-accent-blue',
        capabilities: [
            'Dana bookings by month',
            'Donation register and receipts',
            'Family growth by village',
            'Export as PDF or CSV',
        ],
    },
    settings: {
        title: 'Settings',
        lead: 'Temple-wide preferences: dana rules, notification channels and the account details.',
        icon: <Settings size={22}/>,
        tone: 'bg-cream-deep text-ink-soft',
        capabilities: [
            'Dana session times and capacity defaults',
            'Notification channels for the bell',
            'Treasurer banking details',
            'Temple profile hand-over',
        ],
        related: [{label: 'Edit temple details', to: `${adminRoutes.templeAdd}?mode=edit`}],
    },
}

export const TempleModulePage = ({module}: { module: AdminModuleKey }) => {
    const config = MODULES[module]
    const {pathname} = useLocation()
    const baseLinks: { label: string; to: string; icon: ReactNode }[] = BASE_LINKS

    return (
        <AppShell>
            <div className="mx-auto flex max-w-380 flex-col gap-4">
                <header>
                    <span className="eyebrow">{currentTemple.name}</span>
                    <h1 className="mt-1 font-temple text-[1.6rem] leading-tight font-semibold text-sage-900 sm:text-[1.9rem]">
                        {config.title}
                    </h1>
                    <p className="mt-1 max-w-[70ch] text-[0.9rem] text-ink-soft">{config.lead}</p>
                </header>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                    <section className="section-card">
                        <div className="section-card-head">
                            <span className={`grid h-9 w-9 flex-none place-items-center rounded-lg ${config.tone}`}>
                                {config.icon}
                            </span>
                            <div className="min-w-0">
                                <h2 className="font-temple text-[1.05rem] font-semibold text-sage-900">
                                    What this module will hold
                                </h2>
                                <p className="text-[0.75rem] text-muted">Planned, not wired up yet</p>
                            </div>
                            <span className="badge badge-amber ml-auto">In development</span>
                        </div>
                        <ul className="m-0 grid list-none gap-2 px-4 py-4 sm:grid-cols-2 sm:px-5">
                            {config.capabilities.map((item) => (
                                <li key={item}
                                    className="flex items-start gap-2 rounded-xl border border-line-soft bg-cream/60 px-3 py-2.5 text-[0.84rem] text-ink-soft">
                                    <ChevronRight size={14} className="mt-0.5 flex-none text-gold-700"/>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="section-card">
                        <div className="section-card-head">
                            <span
                                className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-sage-50 text-sage-700">
                                <Landmark size={17}/>
                            </span>
                            <h2 className="font-temple text-[1.05rem] font-semibold text-sage-900">
                                Available today
                            </h2>
                        </div>
                        <div className="flex flex-col gap-2 px-4 py-4 sm:px-5">
                            {baseLinks.map((link) => (
                                <Link key={link.to} to={link.to}
                                      className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-[0.86rem] font-medium text-ink-soft transition hover:border-sage-300 hover:bg-sage-50 hover:text-sage-900">
                                    {link.icon}
                                    {link.label}
                                    <ArrowRight size={15} className="ml-auto text-muted"/>
                                </Link>
                            ))}

                            {config.related
                                ?.filter((link) => !BASE_LINKS.some((base) => base.to === link.to))
                                .map((link) => (
                                    <Link key={link.to} to={link.to}
                                          className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-[0.86rem] font-medium text-ink-soft transition hover:border-sage-300 hover:bg-sage-50 hover:text-sage-900">
                                        <ArrowRight size={15} className="flex-none text-gold-700"/>
                                        {link.label}
                                    </Link>
                                ))}

                            <p className="mt-1 text-[0.74rem] text-muted">
                                Route <span className="mono">{pathname}</span> is ready, so this row in the
                                sidebar can always be reached.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </AppShell>
    )
}

const FileTextIcon = () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/>
        <path d="M14 3v5h5M9 13h6M9 17h4"/>
    </svg>
)

const BASE_LINKS: { label: string; to: string; icon: ReactNode }[] = [
    {
        label: 'Dashboard',
        to: adminRoutes.dashboard,
        icon: <LayoutDashboard size={16} className="flex-none text-sage-700"/>
    },
    {label: 'Temple details', to: adminRoutes.templeInformation, icon: <FileTextIcon/>},
    {label: 'Add temple', to: adminRoutes.templeAdd, icon: <PlusCircle size={16} className="flex-none text-sage-700"/>},
]