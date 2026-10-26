import type {ReactNode} from 'react'
import {useEffect, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import {
    ArrowRightLeft,
    Bell,
    Building2,
    CalendarDays,
    ChevronDown,
    Coins,
    FileBarChart,
    GraduationCap,
    HandCoins,
    LayoutDashboard,
    Lightbulb,
    LogOut,
    Menu,
    QrCode,
    Search,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    Users2,
    X,
} from 'lucide-react'
import {currentTemple, currentUser, nextPoya, notifications} from '../data/demo'
import {authRoutes} from '../routes/authRoutes'

type NavItem = { label: string; icon: ReactNode; active?: boolean }

const NAV: { title: string; items: NavItem[] }[] = [
    {
        title: 'Overview',
        items: [
            {label: 'Dashboard', icon: <LayoutDashboard size={18}/>, active: true},
            {label: 'Temple Profile', icon: <Building2 size={18}/>},
        ],
    },
    {
        title: 'People',
        items: [
            {label: 'Families', icon: <Users2 size={18}/>},
            {label: 'Users & Roles', icon: <ShieldCheck size={18}/>},
            {label: 'Village Transfers', icon: <ArrowRightLeft size={18}/>},
        ],
    },
    {
        title: 'Activities',
        items: [
            {label: 'Dana & Bookings', icon: <HandCoins size={18}/>},
            {label: 'Events & Programmes', icon: <CalendarDays size={18}/>},
            {label: 'Dhamma School', icon: <GraduationCap size={18}/>},
            {label: 'Donations', icon: <Coins size={18}/>},
        ],
    },
    {
        title: 'Community',
        items: [
            {label: 'Announcements', icon: <Bell size={18}/>},
            {label: 'Ideas & Suggestions', icon: <Lightbulb size={18}/>},
            {label: 'QR Registration', icon: <QrCode size={18}/>},
        ],
    },
    {
        title: 'System',
        items: [
            {label: 'Reports', icon: <FileBarChart size={18}/>},
            {label: 'Modules', icon: <SlidersHorizontal size={18}/>},
            {label: 'Settings', icon: <Settings size={18}/>},
        ],
    },
]

const LotusMark = () => (
    <svg width="30" height="30" viewBox="0 0 112 72" fill="none" stroke="currentColor" strokeWidth={4.2}
         strokeLinejoin="round" aria-hidden="true" className="flex-none text-gold-500">
        <path d="M56 67C35 66.8 20.5 54.2 18 31.7c18.4.4 31.8 11.7 38 35.3Z"/>
        <path d="M56 67c20.9-.2 35.4-12.8 38-35.3C75.5 32.1 62.1 43.4 56 67Z"/>
        <path d="M56 67C40.7 52.8 39.8 31.9 56 10c16.2 21.9 15.3 42.8 0 57Z"/>
        <path d="M56 65.5C53.2 40.2 61.4 22.2 76.7 16c6.8 21.6-.8 39.7-20.7 49.5Z"/>
        <path d="M56 65.5C58.8 40.2 50.6 22.2 35.3 16c-6.8 21.6.8 39.7 20.7 49.5Z"/>
    </svg>
)

const Sidebar = ({onNavigate}: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col">
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-4">
            <LotusMark/>
            <div>
                <div className="font-temple text-[1.02rem] leading-tight font-semibold text-sage-900">Temple
                    Management
                </div>
                <div className="text-[0.68rem] font-bold tracking-[0.16em] text-gold-700 uppercase">Temple Admin</div>
            </div>
        </div>

        <div className="border-b border-line px-4 py-3">
            <div className="rounded-xl border border-sage-100 bg-sage-50 px-3 py-2.5">
                <div
                    className="font-temple text-[0.95rem] leading-snug font-semibold text-sage-900">{currentTemple.name}</div>
                <div className="mono mt-0.5 text-[0.72rem] text-muted">{currentTemple.id}</div>
            </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3" aria-label="Temple administration">
            {NAV.map((group) => (
                <div key={group.title} className="mb-4">
                    <div
                        className="px-3 pb-1.5 text-[0.66rem] font-bold tracking-[0.14em] text-muted uppercase">{group.title}</div>
                    <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                        {group.items.map((item) => (
                            <li key={item.label}>
                                {item.active ? (
                                    <span className="side-link side-link-active" aria-current="page"
                                          onClick={onNavigate}>
                                        {item.icon} {item.label}
                                    </span>
                                ) : (
                                    <button type="button" className="side-link" title="Available in a later step"
                                            onClick={onNavigate}>
                                        {item.icon} {item.label}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>

        <div className="border-t border-line px-4 py-3">
            <div className="rounded-xl bg-sand-50 px-3 py-2 text-[0.74rem] text-ink-soft">
                {nextPoya.short}
            </div>
        </div>
    </div>
)

export const AppShell = ({children}: { children: ReactNode }) => {
    const [drawer, setDrawer] = useState(false)
    const [menu, setMenu] = useState(false)
    const [bell, setBell] = useState(false)
    const bellRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const unread = notifications.filter((n) => !n.read).length

    /* Close the notification panel and the account menu on an outside tap or Escape, so they
       behave like menus rather than sticky overlays - and never sit on top of each other. */
    useEffect(() => {
        if (!bell && !menu) return
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node
            if (bell && !bellRef.current?.contains(target)) setBell(false)
            if (menu && !menuRef.current?.contains(target)) setMenu(false)
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return
            setBell(false)
            setMenu(false)
        }
        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('pointerdown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [bell, menu])

    return (
        <div className="min-h-svh bg-cream">
            {/* Sidebar - desktop */}
            <aside className="fixed inset-y-0 left-0 hidden w-65.5 border-r border-line bg-paper lg:block">
                <div className="h-svh max-h-svh">
                    <Sidebar/>
                </div>
            </aside>

            {/* Sidebar - drawer */}
            {drawer && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-sage-950/45" onClick={() => setDrawer(false)}/>
                    <div className="absolute inset-y-0 left-0 w-[86%] max-w-75 bg-paper shadow-2xl">
                        <button className="absolute top-3 right-3 z-10 rounded-lg p-2 text-ink-soft hover:bg-cream"
                                onClick={() => setDrawer(false)}
                                aria-label="Close menu">
                            <X size={18}/>
                        </button>
                        <Sidebar onNavigate={() => setDrawer(false)}/>
                    </div>
                </div>
            )}

            <div className="lg:pl-65.5">
                {/* Top bar */}
                <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
                    <div className="flex items-center gap-2 px-3 py-2.5 sm:px-5">
                        <button
                            className="rounded-xl border border-line bg-white p-2.5 text-sage-800 hover:bg-cream lg:hidden"
                            onClick={() => setDrawer(true)} aria-label="Open menu">
                            <Menu size={18}/>
                        </button>

                        <div className="hidden min-w-0 sm:block">
                            <div className="text-[0.72rem] text-muted">Temple Admin</div>
                            <div className="font-temple text-[1.05rem] leading-tight text-sage-900">Dashboard</div>
                        </div>

                        <div
                            className="mx-auto hidden max-w-105 flex-1 items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2 md:flex">
                            <Search size={16} className="flex-none text-muted"/>
                            <input
                                className="w-full border-0 bg-transparent text-[0.88rem] outline-none placeholder:text-muted"
                                placeholder="Search families, bookings, events" aria-label="Search"/>
                        </div>

                        <div className="ml-auto flex flex-none items-center gap-2">
                            <div className="relative" ref={bellRef}>
                                <button
                                    className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-sage-700 hover:bg-cream"
                                    onClick={() => {
                                        setBell((v) => !v)
                                        setMenu(false)
                                    }} aria-expanded={bell} aria-haspopup="dialog"
                                    aria-label={`Notifications${unread ? ` - ${unread} unread` : ''}`}>
                                    <Bell size={18}/>
                                    {unread > 0 && (
                                        <span
                                            className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-status-rose px-1 text-[0.65rem] font-bold text-white">
                                            {unread}
                                        </span>
                                    )}
                                </button>

                                {bell && (
                                    <div role="dialog" aria-label="Notifications"
                                         className="fixed inset-x-3 top-18 z-50 max-h-[calc(100svh-6rem)] overflow-hidden rounded-xl border border-line bg-paper shadow-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:max-h-none sm:w-[min(92vw,21rem)]">
                                        <div className="border-b border-line-soft px-4 py-3">
                                            <div className="font-temple text-[1rem] text-sage-900">Notifications</div>
                                            <div className="text-[0.72rem] text-muted">Browser notifications
                                                · {unread} unread
                                            </div>
                                        </div>
                                        <div className="max-h-[60vh] divide-y divide-line-soft overflow-y-auto">
                                            {notifications.map((item) => (
                                                <div key={item.id}
                                                     className={`px-4 py-3 ${!item.read ? 'bg-sage-50/60' : ''}`}>
                                                    <div
                                                        className="text-[0.86rem] font-semibold text-sage-900">{item.title}</div>
                                                    <div className="text-[0.78rem] text-ink-soft">{item.body}</div>
                                                    <div className="mt-0.5 text-[0.7rem] text-muted">{item.time}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative" ref={menuRef}>
                                <button
                                    className="flex items-center gap-2 rounded-xl border border-line bg-white py-1 pr-2 pl-1 hover:bg-cream"
                                    onClick={() => {
                                        setMenu((v) => !v)
                                        setBell(false)
                                    }} aria-haspopup="menu" aria-expanded={menu}>
                                    <span
                                        className="grid h-8 w-8 place-items-center rounded-lg bg-sage-100 text-[0.75rem] font-bold text-sage-800">
                                        {currentUser.initials}
                                    </span>
                                    <span className="hidden text-left lg:block">
                                        <span
                                            className="block text-[0.82rem] leading-tight font-semibold text-ink">{currentUser.shortName}</span>
                                        <span
                                            className="block text-[0.66rem] leading-tight text-muted uppercase">{currentUser.role}</span>
                                    </span>
                                    <ChevronDown size={15} className="text-muted"/>
                                </button>

                                {menu && (
                                    <div role="menu"
                                         className="absolute top-full right-0 z-50 mt-2 w-[min(15rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-line bg-paper shadow-xl">
                                        <div className="border-b border-line-soft px-4 py-3">
                                            <div
                                                className="text-[0.86rem] font-semibold text-sage-900">{currentUser.name}</div>
                                            <div className="text-[0.72rem] text-muted">{currentUser.designation}</div>
                                        </div>
                                        <Link to={authRoutes.login}
                                              className="flex items-center gap-2 px-4 py-2.5 text-[0.86rem] text-ink-soft hover:bg-cream">
                                            <LogOut size={16}/> Sign out
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="px-3 py-5 sm:px-5 sm:py-6 xl:px-7">{children}</main>
            </div>
        </div>
    )
}