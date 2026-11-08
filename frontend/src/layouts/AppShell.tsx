import type {ReactNode} from 'react'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {
    Bell,
    Building2,
    Check,
    ChevronDown,
    Landmark,
    LogOut,
    Menu,
    Search,
    Settings as SettingsGlyph,
    User,
    Users,
    X
} from 'lucide-react'
import {searchContent, type SearchHit} from '../data/searchIndex'
import {useMembers} from '../data/members'
import {useNotifications} from '../hooks/useNotifications'
import {useTemples} from '../data/templeStore.tsx'
import {Icon} from '@iconify/react'
import Sidebar from '../components/Sidebar'
import {NAV_BY_ROLE, navLabel} from '../data/navigation'
import type {RoleKey} from '../data/permissions'
import {usePermissions} from '../hooks/usePermissions'
import {useActiveTemple} from '../hooks/useActiveTemple'
import {LanguageToggle} from '../components/LanguageToggle'
import {useTranslation} from 'react-i18next'
import {useAuth} from '../context/AuthContext'
import {adminRoutes} from '../routes/adminRoutes'
import {authRoutes} from '../routes/authRoutes'

/** Icons for the search dropdown - the same filled set as the sidebar. */
const SEARCH_ICON: Record<string, string> = {
    home: 'fa6-solid:house',
    family: 'fa6-solid:users',
    dana: 'fa6-solid:calendar-days',
    bookings: 'fa6-solid:calendar-check',
    events: 'fa6-solid:image',
    profile: 'fa6-solid:user',
    settings: 'fa6-solid:gear',
    temple: 'fa6-solid:place-of-worship',
    announcements: 'fa6-solid:bullhorn',
    donations: 'fa6-solid:heart',
    users: 'fa6-solid:user-gear',
    reports: 'fa6-solid:chart-simple',
    roles: 'fa6-solid:user-shield',
    audit: 'fa6-solid:clock-rotate-left',
    platform: 'fa6-solid:sliders',
}

export const AppShell = ({children}: { children: ReactNode }) => {
    const {pathname} = useLocation()
    const navigate = useNavigate()
    const {t} = useTranslation()
    const {user, signOut} = useAuth()
    const {can, roleLabel: roleLabelFromMatrix} = usePermissions()
    const [drawer, setDrawer] = useState(false)
    const [templeMenu, setTempleMenu] = useState(false)
    const templeRef = useRef<HTMLDivElement>(null)
    /* A chief incumbent may hold several temples - this is the one being looked at. */
    const {temples: myTemples, temple: workingTemple, setTempleId, canSwitch} = useActiveTemple()
    /* The desktop rail folds to an icon strip; the choice survives a reload. */
    const [railCollapsed, setRailCollapsed] = useState(() => {
        try {
            return localStorage.getItem('tms.rail.collapsed') === '1'
        } catch {
            return false
        }
    })

    const toggleRail = () => {
        setRailCollapsed((current) => {
            const next = !current
            try {
                localStorage.setItem('tms.rail.collapsed', next ? '1' : '0')
            } catch {
                /* private mode - collapsing still works for this session */
            }
            return next
        })
    }
    const [menu, setMenu] = useState(false)
    const [bell, setBell] = useState(false)
    const bellRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    /* Notifications: the bell owns the read state (saved per browser). */
    const {items: notificationItems, unread, markRead, markUnread, markAllRead, clearAll} = useNotifications()

    /* Search: the records the role may see - temples, members, Dana bookings, events, donations. */
    const {records} = useTemples()
    const members = useMembers()
    const [query, setQuery] = useState('')
    const [searchOpen, setSearchOpen] = useState(false)
    const [activeHit, setActiveHit] = useState(0)
    const searchRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const hits: SearchHit[] = useMemo(
        () =>
            query.trim()
                ? searchContent(query, (user?.role ?? 'templeAdmin') as RoleKey, can, {
                    temples: records,
                    members,
                })
                : [],
        [query, user?.role, records, members, can],
    )

    /* Clicking anywhere else closes the temple switcher. */
    useEffect(() => {
        if (!templeMenu) return
        const onPointerDown = (event: PointerEvent) => {
            if (!templeRef.current?.contains(event.target as Node)) setTempleMenu(false)
        }
        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [templeMenu])

    /* Cmd/Ctrl + K focuses the search box, like the rest of the web. */
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault()
                searchInputRef.current?.focus()
                setSearchOpen(true)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    const openHit = (hit?: SearchHit) => {
        if (!hit) return
        setQuery('')
        setSearchOpen(false)
        navigate(hit.to)
        searchInputRef.current?.blur()
    }

    const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            setSearchOpen(false)
            setQuery('')
            return
        }
        if (!hits.length) return
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveHit((current) => (current + 1) % hits.length)
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveHit((current) => (current - 1 + hits.length) % hits.length)
        }
        if (event.key === 'Enter') {
            event.preventDefault()
            openHit(hits[activeHit])
        }
    }

    /* Close the notification panel and the account menu on an outside tap or Escape, so they
       behave like menus rather than sticky overlays - and never sit on top of each other. */
    useEffect(() => {
        if (!bell && !menu) return
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node
            if (bell && !bellRef.current?.contains(target)) setBell(false)
            if (menu && !menuRef.current?.contains(target)) setMenu(false)
            if (searchOpen && !searchRef.current?.contains(target)) setSearchOpen(false)
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
    }, [bell, menu, searchOpen])

    /* The small page title under the top bar on phones follows the rail, so a module page
       always says where it is. */
    const pageTitle = pathname === adminRoutes.templeAdd
        ? t('nav.addTemple')
        : pathname.startsWith('/temple')
            ? t('nav.templeInformation')
            : navLabel((NAV_BY_ROLE[(user?.role ?? 'templeAdmin') as RoleKey]).find(
                (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
            )?.label ?? 'Dashboard', t)

    return (
        <div className="flex min-h-svh w-full bg-cream">
            <div className="sticky top-0 hidden h-dvh shrink-0 self-start lg:block">
                <Sidebar collapsed={railCollapsed} onToggleCollapse={toggleRail}/>
            </div>

            {/* Side navigation - mobile drawer */}
            {drawer && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-sage-950/50" onClick={() => setDrawer(false)}/>
                    <Sidebar isMobile mobileOpen onNavigate={() => setDrawer(false)} onClose={() => setDrawer(false)}/>
                </div>
            )}

            <div className="min-w-0 flex-1">
                {/* Top bar */}
                <header className="sticky top-0 z-30 border-b border-line bg-paper/97 backdrop-blur">
                    <div className="flex items-center gap-2.5 px-3 py-2.5 sm:px-5">
                        <button
                            className="flex-none rounded-xl border border-line bg-white p-2.5 text-sage-800 hover:bg-cream lg:hidden"
                            onClick={() => setDrawer(true)} aria-label={t('shell.openMenu')}>
                            <Menu size={18}/>
                        </button>

                        {/* Search - typing lists the screens and temple records the role can open. */}
                        <div className="relative mx-auto min-w-0 max-w-xl flex-1" ref={searchRef}>
                            <div
                                className="flex items-center gap-2 rounded-full border border-line bg-cream px-4 py-2.5">
                                <Search size={17} className="flex-none text-muted"/>
                                <input
                                    ref={searchInputRef}
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value)
                                        setActiveHit(0)
                                        setSearchOpen(true)
                                    }}
                                    onFocus={() => setSearchOpen(true)}
                                    onKeyDown={onSearchKeyDown}
                                    className="w-full border-0 bg-transparent text-[0.86rem] outline-none placeholder:text-muted/90"
                                    placeholder={t('shell.searchPlaceholder')}
                                    aria-label={t('shell.searchAria')}
                                    role="combobox"
                                    aria-expanded={searchOpen && !!hits.length}
                                    aria-controls="search-results"
                                    aria-autocomplete="list"/>
                                {query ? (
                                    <button
                                        className="flex-none rounded-full p-1 text-muted hover:bg-cream hover:text-sage-800"
                                        onClick={() => {
                                            setQuery('');
                                            searchInputRef.current?.focus()
                                        }}
                                        aria-label={t('shell.clearSearch')}>
                                        <X size={15}/>
                                    </button>
                                ) : (
                                    <kbd
                                        className="hidden flex-none rounded border border-line bg-paper px-1.5 py-0.5 text-[0.66rem] font-semibold text-muted sm:block">
                                        ⌘K
                                    </kbd>
                                )}
                            </div>

                            {searchOpen && query.trim() && (
                                <div id="search-results" role="listbox" aria-label={t('shell.searchResults')}
                                     className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-line bg-paper shadow-xl">
                                    {hits.length === 0 ? (
                                        <p className="px-4 py-3 text-[0.85rem] text-muted">
                                            {t('shell.noResults')}
                                        </p>
                                    ) : (
                                        <ul className="max-h-[60vh] divide-y divide-line-soft overflow-y-auto">
                                            {hits.map((hit, index) => (
                                                <li key={hit.id}>
                                                    <button
                                                        role="option"
                                                        aria-selected={index === activeHit}
                                                        onMouseEnter={() => setActiveHit(index)}
                                                        onClick={() => openHit(hit)}
                                                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                                                            index === activeHit ? 'bg-sage-50' : 'bg-paper'
                                                        }`}>
                                                        <span
                                                            className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-cream text-sage-800">
                                                            <Icon icon={SEARCH_ICON[hit.icon]} className="size-4"/>
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span
                                                                className="block truncate text-[0.88rem] font-semibold text-ink">{hit.label}</span>
                                                            <span
                                                                className="block truncate text-[0.74rem] text-muted">{hit.hint}</span>
                                                        </span>
                                                        <span
                                                            className="badge badge-muted flex-none text-[0.68rem]">{hit.group}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <p className="border-t border-line-soft bg-cream/60 px-4 py-1.5 text-[0.7rem] text-muted">
                                        ↑↓ to move · Enter to open · Esc to close
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="ml-auto flex flex-none items-center gap-2 sm:gap-3">
                            {/* The same two-button switch sits here on every signed-in page. */}
                            <LanguageToggle tone="bar" label={false} className="hidden sm:flex"/>

                            {/* Temple switcher - only when the account holds more than one temple */}
                            {canSwitch && (
                                <div className="relative hidden md:block" ref={templeRef}>
                                    <button
                                        onClick={() => {
                                            setTempleMenu((open) => !open)
                                            setBell(false)
                                            setMenu(false)
                                        }}
                                        aria-haspopup="menu"
                                        aria-expanded={templeMenu}
                                        aria-label={t('shell.switchTemple')}
                                        title={t('shell.switchTemple')}
                                        className="flex max-w-60 items-center gap-2 rounded-full border border-line bg-white py-1.5 pr-2.5 pl-2 text-left transition hover:border-sage-300 hover:bg-cream">
                                        <span
                                            className="grid h-7 w-7 flex-none place-items-center rounded-full bg-sage-800 text-white">
                                            <Building2 size={14} strokeWidth={2}/>
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-[0.82rem] font-semibold text-sage-900">
                                                {workingTemple?.name ?? t('shell.switchTemple')}
                                            </span>
                                            <span className="block text-[0.66rem] text-muted">
                                                {myTemples.length} {t('shell.templesCount')}
                                            </span>
                                        </span>
                                        <ChevronDown size={14}
                                                     className={`flex-none text-muted transition ${templeMenu ? 'rotate-180' : ''}`}/>
                                    </button>

                                    {templeMenu && (
                                        <div role="menu" aria-label={t('shell.yourTemples')}
                                             className="absolute top-full right-0 z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-line bg-paper shadow-xl">
                                            <p className="border-b border-line-soft bg-cream/60 px-4 py-2 text-[0.7rem] font-bold tracking-[0.12em] text-muted uppercase">
                                                {t('shell.yourTemples')}
                                            </p>
                                            <ul className="max-h-[60vh] list-none overflow-y-auto p-1.5">
                                                {myTemples.map((record) => {
                                                    const current = record.id === workingTemple?.id
                                                    return (
                                                        <li key={record.id}>
                                                            <button role="menuitemradio" aria-checked={current}
                                                                    onClick={() => {
                                                                        setTempleId(record.id)
                                                                        setTempleMenu(false)
                                                                    }}
                                                                    className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                                                                        current ? 'bg-sage-50' : 'hover:bg-cream'
                                                                    }`}>
                                                                <span
                                                                    className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-md ${
                                                                        current ? 'bg-sage-800 text-white' : 'bg-cream text-sage-700'
                                                                    }`}>
                                                                    {current ? <Check size={13} strokeWidth={3}/> :
                                                                        <Building2 size={13}/>}
                                                                </span>
                                                                <span className="min-w-0 flex-1">
                                                                    <span
                                                                        className="block truncate text-[0.86rem] font-semibold text-sage-900">
                                                                        {record.name}
                                                                    </span>
                                                                    <span
                                                                        className="block truncate text-[0.72rem] text-muted">
                                                                        {record.village}, {record.district} · {record.status}
                                                                    </span>
                                                                </span>
                                                            </button>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="relative" ref={bellRef}>
                                <button
                                    className="relative grid h-10 w-10 place-items-center rounded-full text-sage-800 hover:bg-cream"
                                    onClick={() => {
                                        setBell((v) => !v)
                                        setMenu(false)
                                    }} aria-expanded={bell} aria-haspopup="dialog"
                                    aria-label={`${t('shell.notifications')}${unread ? ` - ${unread} ${t('shell.unread')}` : ''}`}>
                                    <Bell size={19} strokeWidth={1.8}/>
                                    {unread > 0 && (
                                        <span
                                            className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-status-rose px-1 text-[0.64rem] font-bold text-white ring-2 ring-white">
                                            {unread}
                                        </span>
                                    )}
                                </button>

                                {bell && (
                                    <div role="dialog" aria-label={t('shell.notifications')}
                                         className="fixed inset-x-3 top-[4.4rem] z-50 overflow-hidden rounded-xl border border-line bg-paper shadow-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[min(92vw,24rem)]">
                                        <div
                                            className="flex items-center justify-between gap-2 border-b border-line-soft px-4 py-3">
                                            <div>
                                                <div
                                                    className="font-temple text-[1rem] text-sage-900">{t('shell.notifications')}</div>
                                                <div className="text-[0.72rem] text-muted">
                                                    {!notificationItems.length
                                                        ? t('shell.noNotifications')
                                                        : unread ? `${unread} unread` : 'You are all caught up'}
                                                </div>
                                            </div>
                                            <div className="flex flex-none items-center gap-1">
                                                <button
                                                    className="rounded-lg px-2 py-1 text-[0.74rem] font-semibold text-sage-800 hover:bg-cream disabled:opacity-40"
                                                    onClick={markAllRead} disabled={!unread}>
                                                    Mark all read
                                                </button>
                                                <button
                                                    className="rounded-lg px-2 py-1 text-[0.74rem] font-semibold text-status-rose hover:bg-lotus-50 disabled:opacity-40"
                                                    onClick={clearAll} disabled={!notificationItems.length}>
                                                    Clear all
                                                </button>
                                                <button
                                                    className="rounded-lg p-1.5 text-muted hover:bg-cream hover:text-sage-800"
                                                    onClick={() => setBell(false)}
                                                    aria-label={t('shell.notifications')}>
                                                    <X size={15}/>
                                                </button>
                                            </div>
                                        </div>

                                        {notificationItems.length === 0 && (
                                            <p className="px-4 py-6 text-center text-[0.86rem] text-muted">
                                                Nothing here. New temple activity will appear in this list.
                                            </p>
                                        )}

                                        <ul className="max-h-[60vh] divide-y divide-line-soft overflow-y-auto">
                                            {notificationItems.map((item) => (
                                                <li key={item.id} className={!item.read ? 'bg-sage-50/70' : 'bg-paper'}>
                                                    <button
                                                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-cream/70"
                                                        onClick={() => {
                                                            markRead(item.id)
                                                            setBell(false)
                                                            navigate(item.to)
                                                        }}>
                                                        <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${
                                                            item.read ? 'bg-line' : 'bg-status-rose'
                                                        }`} aria-hidden="true"/>
                                                        <span className="min-w-0 flex-1">
                                                            <span
                                                                className="block text-[0.86rem] font-semibold text-sage-900">{item.title}</span>
                                                            <span
                                                                className="block text-[0.78rem] text-ink-soft">{item.body}</span>
                                                            <span
                                                                className="mt-0.5 block text-[0.7rem] text-muted">{item.time}</span>
                                                        </span>
                                                    </button>
                                                    <div className="flex justify-end gap-1 px-4 pb-2">
                                                        {item.read ? (
                                                            <button
                                                                className="text-[0.72rem] font-semibold text-muted hover:underline"
                                                                onClick={() => markUnread(item.id)}>
                                                                Mark as unread
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="text-[0.72rem] font-semibold text-sage-800 hover:underline"
                                                                onClick={() => markRead(item.id)}>
                                                                Mark as read
                                                            </button>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            className="w-full border-t border-line-soft bg-cream/60 px-4 py-2 text-left text-[0.78rem] font-semibold text-sage-800 hover:bg-cream"
                                            onClick={() => {
                                                setBell(false);
                                                navigate(adminRoutes.settings)
                                            }}>
                                            Notification settings
                                        </button>
                                    </div>
                                )}
                            </div>

                            <span className="hidden h-7 w-px bg-line sm:block"/>

                            <div className="relative" ref={menuRef}>
                                <button
                                    className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-cream"
                                    onClick={() => {
                                        setMenu((v) => !v)
                                        setBell(false)
                                    }} aria-haspopup="menu" aria-expanded={menu}>
                                    <span
                                        className="grid h-9 w-9 place-items-center rounded-full bg-gold-500 text-[0.78rem] font-bold text-sage-950 ring-2 ring-gold-200">
                                        {user?.initials ?? 'TA'}
                                    </span>
                                    <span className="hidden text-left md:block">
                                        <span
                                            className="block text-[0.82rem] leading-tight font-semibold text-ink">{user?.shortName ?? 'Temple Admin'}</span>
                                        <span
                                            className="block text-[0.68rem] leading-tight text-muted">{user?.roleLabel ?? 'Temple Admin'}</span>
                                    </span>
                                    <ChevronDown size={15} className="hidden text-muted md:block"/>
                                </button>

                                {menu && (
                                    <div role="menu" aria-label="Account"
                                         className="absolute top-full right-0 z-50 mt-2 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-line bg-paper shadow-xl">
                                        <div className="border-b border-line-soft px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <span
                                                    className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gold-500 text-[0.78rem] font-bold text-sage-950 ring-2 ring-gold-200">
                                                    {user?.initials ?? 'TA'}
                                                </span>
                                                <span className="min-w-0">
                                                    <span
                                                        className="block truncate text-[0.86rem] font-semibold text-sage-900">{user?.name ?? 'Temple Admin'}</span>
                                                    <span
                                                        className="block truncate text-[0.72rem] text-muted">{user?.identifier ?? '-'}</span>
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-1.5 text-[0.72rem] text-muted">
                                                <Landmark size={13}
                                                          strokeWidth={1.8}/> {user?.templeName ?? 'Sri Sambodhi Maha Viharaya'}
                                            </div>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                <span
                                                    className="badge badge-muted text-[0.68rem]">{roleLabelFromMatrix}</span>
                                                <span
                                                    className="badge badge-muted text-[0.68rem]">{can('manageUserRoles') ? 'Can manage users' : 'Own temple only'}</span>
                                            </div>
                                        </div>

                                        {[
                                            {
                                                label: 'My profile',
                                                to: adminRoutes.profile,
                                                icon: <User size={16} strokeWidth={1.8}/>
                                            },
                                            ...(can('manageUserRoles')
                                                ? [{
                                                    label: 'User management',
                                                    to: adminRoutes.users,
                                                    icon: <Users size={16} strokeWidth={1.8}/>
                                                }]
                                                : []),
                                            ...(can('manageOptionalModules')
                                                ? [{
                                                    label: 'Settings',
                                                    to: adminRoutes.settings,
                                                    icon: <SettingsGlyph size={16} strokeWidth={1.8}/>
                                                }]
                                                : []),
                                        ].map((entry) => (
                                            <button key={entry.to} role="menuitem"
                                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[0.86rem] text-ink-soft hover:bg-cream"
                                                    onClick={() => {
                                                        setMenu(false);
                                                        navigate(entry.to)
                                                    }}>
                                                {entry.icon} {entry.label}
                                            </button>
                                        ))}

                                        <button role="menuitem"
                                                className="flex w-full items-center gap-2 border-t border-line-soft px-4 py-2.5 text-left text-[0.86rem] text-status-rose hover:bg-lotus-50"
                                                onClick={() => {
                                                    setMenu(false)
                                                    signOut()
                                                    navigate(authRoutes.login)
                                                }}>
                                            <LogOut size={16} strokeWidth={1.8}/> Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile page title - the top bar has no room for it on small screens */}
                <div className="border-b border-line-soft bg-cream px-4 py-2 sm:hidden">
                    <span className="text-[0.7rem] text-muted">{'Temple Admin'}</span>
                    <span className="block font-temple text-[1rem] text-sage-900">{pageTitle}</span>
                </div>

                <main className="px-3 py-5 sm:px-5 sm:py-6 xl:px-7">{children}</main>
            </div>
        </div>
    )
}