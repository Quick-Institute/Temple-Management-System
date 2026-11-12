import type {ReactNode} from 'react'
import {useRef} from 'react'
import {
    BarChart3,
    CalendarCheck,
    CalendarDays,
    ChevronRight,
    Clock,
    Heart,
    Image as ImageIcon,
    Landmark,
    LayoutDashboard,
    Megaphone,
    Settings,
    SlidersHorizontal,
    User,
    UserCog,
    UserRound,
    UsersRound,
} from 'lucide-react'
import {Icon} from '@iconify/react'
import {NavLink, useLocation} from 'react-router-dom'
import AdminNavigationScrollbar from './temple-admin/AdminNavigationScrollbar'
import {usePermissions} from '../hooks/usePermissions'
import {useTranslation} from 'react-i18next'
import {LanguageToggle} from './LanguageToggle'
import {type IconKey, NAV_BY_ROLE, type NavItemDef, navLabel, SUBNAV_BY_ROLE} from '../data/navigation'
import {type RoleKey, roleShortLabels} from '../data/permissions'
import {useAuth} from '../context/AuthContext'
import {SUB_ICONS} from './navIcons'

/* Thin line icons, matching the reference sidebar: one glyph per menu row. */
const ICON_SIZE = 20

const ICONS: Record<IconKey, ReactNode> = {
    home: <LayoutDashboard size={ICON_SIZE} strokeWidth={1.7}/>,
    family: <UserRound size={ICON_SIZE} strokeWidth={1.7}/>,
    dana: <CalendarDays size={ICON_SIZE} strokeWidth={1.7}/>,
    bookings: <CalendarCheck size={ICON_SIZE} strokeWidth={1.7}/>,
    events: <ImageIcon size={ICON_SIZE} strokeWidth={1.7}/>,
    profile: <User size={ICON_SIZE} strokeWidth={1.7}/>,
    settings: <Settings size={ICON_SIZE} strokeWidth={1.7}/>,
    temple: <Landmark size={ICON_SIZE} strokeWidth={1.7}/>,
    announcements: <Megaphone size={ICON_SIZE} strokeWidth={1.7}/>,
    donations: <Heart size={ICON_SIZE} strokeWidth={1.7}/>,
    users: <UsersRound size={ICON_SIZE} strokeWidth={1.7}/>,
    reports: <BarChart3 size={ICON_SIZE} strokeWidth={1.7}/>,
    roles: <UserCog size={ICON_SIZE} strokeWidth={1.7}/>,
    audit: <Clock size={ICON_SIZE} strokeWidth={1.7}/>,
    platform: <SlidersHorizontal size={ICON_SIZE} strokeWidth={1.7}/>,
}


/* Shared item look. Height scales with viewport height so the rows always fit. */
const itemShared =
    'group relative flex w-full items-center border text-left font-sans leading-none tracking-[0.005em] ' +
    'transition-[background-color,border-color,color,box-shadow] duration-200 ease-out ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7dd3fc]'

const itemFull = 'h-[clamp(38px,5.8vh,50px)] gap-3 rounded-[10px] px-[clamp(10px,1vw,15px)] text-[clamp(13.5px,1.9vh,15px)] whitespace-nowrap'
const itemCompact = 'h-11 justify-center gap-0 rounded-lg px-0 text-[13px]'

/* Sky theme: an active row is a sage wash with a sky-300 bar on the inner edge. */
const itemInactive = 'border-transparent text-sage-100 hover:border-sky-300/35 hover:bg-white/[0.08] hover:text-white'
const itemActive =
    'border-sky-300/80 bg-linear-to-r from-sage-700 to-sage-800 font-semibold text-white ' +
    'shadow-[inset_0_0_0_1px_rgba(125,211,252,.45),0_2px_10px_rgba(0,0,0,0.25)]'

const PARENT_PREFIXES: Record<string, string[]> = {
    'Temple Information': ['/temple'],
    'Dana Management': ['/dana-management', '/my-bookings'],
    'Family Members': ['/family-members', '/families'],
    'User Management': ['/user-management', '/users-roles', '/users', '/add-user'],
}

type NavItemProps = {
    item: NavItemDef
    compact?: boolean
    onClick?: () => void
    isActive?: boolean
    /** Row opens a sub-menu (shows the chevron). */
    subnavLabel?: boolean
}

const NavRow = ({item, compact = false, onClick, isActive, subnavLabel = false}: NavItemProps) => {
    const {t} = useTranslation()
    const label = navLabel(item.label, t)
    return (
        <NavLink
            to={item.to}
            end={item.to === '/dashboard'}
            title={label}
            onClick={onClick}
            aria-current={isActive ? 'page' : undefined}
            className={`${itemShared} ${compact ? itemCompact : itemFull} ${isActive ? itemActive : itemInactive}`}>
        <span aria-hidden="true"
              className={`inline-flex shrink-0 items-center justify-center ${compact ? 'size-6' : 'size-5'}`}>
            <span className="transition-transform duration-200 group-hover:scale-110">{ICONS[item.icon]}</span>
        </span>
            {!compact && <span className="min-w-0 flex-1 truncate">{label}</span>}
            {!compact && subnavLabel && (
                <ChevronRight size={15}
                              className={`shrink-0 text-sky-200/70 transition ${isActive ? 'rotate-90' : ''}`}/>
            )}
        </NavLink>
    )
}

export type SidebarProps = {
    /** Which role's menu to draw. Defaults to the signed-in role. */
    role?: RoleKey
    /** Desktop rail folded to icons. */
    collapsed?: boolean
    onToggleCollapse?: () => void
    /** Mobile drawer state. */
    mobileOpen?: boolean
    isMobile?: boolean
    onNavigate?: () => void
    onClose?: () => void
}

function Sidebar({
                     role,
                     collapsed = false,
                     onToggleCollapse,
                     mobileOpen = false,
                     isMobile = false,
                     onNavigate,
                     onClose,
                 }: SidebarProps) {
    const navigationRef = useRef<HTMLElement | null>(null)
    const {pathname} = useLocation()
    const {user} = useAuth()
    const permissions = usePermissions()
    const {t} = useTranslation()
    const activeRole: RoleKey = role ?? permissions.role

    const navItems = NAV_BY_ROLE[activeRole].filter((item) => {
        const roleOk = !item.roles || item.roles.includes(activeRole)
        const permissionOk = !item.permission || permissions.can(item.permission)
        return roleOk && permissionOk
    })
    const subnav = SUBNAV_BY_ROLE[activeRole]

    const isRowActive = (item: NavItemDef) => {
        const prefixes = PARENT_PREFIXES[item.label]
        if (prefixes) return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
        return pathname === item.to || pathname.startsWith(`${item.to}/`)
    }

    const railWidth = collapsed ? 'w-[5.25rem] px-2' : 'w-[clamp(250px,19vw,300px)] px-3'

    return (
        <aside
            id="primary-navigation"
            aria-label={t('nav.primary')}
            aria-hidden={isMobile && !mobileOpen}
            inert={isMobile && !mobileOpen}
            className={isMobile
                ? `fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(84vw,300px)] shrink-0 flex-col overflow-hidden bg-sage-900 px-3 py-4 font-lora text-white shadow-2xl transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
                : `relative z-10 flex h-dvh shrink-0 flex-col overflow-hidden bg-sage-900 py-3 font-lora text-white transition-[width,padding] duration-300 ease-in-out ${railWidth}`}>

            {/* Close (mobile drawer only) */}
            <button
                type="button"
                onClick={onClose}
                aria-label={t('nav.close')}
                className={`absolute top-3 right-3 z-10 h-9 w-9 items-center justify-center rounded-full text-sky-100 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-sage-300 ${isMobile ? 'flex' : 'hidden'}`}>
                <Icon icon="material-symbols:close-rounded" className="h-6 w-6"/>
            </button>

            {/* Branding - the repository's golden temple emblem + wordmark */}
            <div className={`text-center ${collapsed ? 'px-0' : 'px-1'}`}>
                <img
                    src="/SVG/temple-logo.svg"
                    alt={t('nav.brand')}
                    className={`mx-auto w-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,.4)] ${collapsed ? 'h-9' : 'h-[clamp(40px,7.4vh,62px)]'}`}
                />

                {!collapsed && (
                    <div>
                        <h1 className="mt-[clamp(4px,0.9vh,9px)] font-lora text-[clamp(14px,2.3vh,17px)] leading-[1.2] font-semibold tracking-[0.005em] whitespace-nowrap text-white">
                            {t('nav.brand')}
                        </h1>
                        <p className="mt-[clamp(3px,0.7vh,7px)] text-[clamp(9.5px,1.4vh,11.5px)] tracking-[0.03em] text-sky-200">
                            {t('nav.brandLine')}
                        </p>
                        <p className="mt-1 inline-block rounded-full border border-sky-300/40 px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.12em] text-sky-300 uppercase">
                            {user?.roleLabel ?? roleShortLabels[activeRole]}
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav
                aria-label={t('nav.main')}
                ref={navigationRef}
                className={`mt-[clamp(10px,2.6vh,26px)] min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&>a]:shrink-0 ${
                    collapsed ? 'items-stretch px-0' : 'pr-1'
                }`}>
                {navItems.map((item) => {
                    const active = isRowActive(item)
                    const subItems = (subnav[item.label] ?? []).filter(
                        (sub) => !sub.permission || permissions.can(sub.permission),
                    )
                    return (
                        <div key={item.to} className="shrink-0">
                            <NavRow item={item} compact={collapsed} onClick={onNavigate} isActive={active}
                                    subnavLabel={subItems.length > 0}/>

                            {/*
                             * Folded rail: every sub-page is still on screen as its own small icon row,
                             * so collapsing never hides a destination. The label lives in the tooltip.
                             */}
                            {collapsed && subItems.length > 0 && (
                                <ul className="m-0 mt-1 mb-1 flex list-none flex-col gap-0.5 border-l border-white/15 p-0 pl-2">
                                    {subItems.map((sub) => (
                                        <li key={sub.to}>
                                            <NavLink
                                                to={sub.to}
                                                onClick={onNavigate}
                                                title={navLabel(sub.label, t)}
                                                aria-label={navLabel(sub.label, t)}
                                                aria-current={pathname === sub.to ? 'page' : undefined}
                                                className={`mx-auto flex h-9 w-full items-center justify-center rounded-lg transition ${
                                                    pathname === sub.to
                                                        ? 'bg-sage-700 text-white shadow-[inset_0_0_0_1px_rgba(125,211,252,.4)]'
                                                        : 'text-sage-100/70 hover:bg-white/10 hover:text-white'
                                                }`}>
                                                <span className="[&>svg]:size-3.75">{SUB_ICONS[sub.icon]}</span>
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Sub-pages of the open row (expanded rail) */}
                            {!collapsed && subItems.length > 0 && active && (
                                <ul className="m-0 mt-1 mb-1 flex list-none flex-col gap-0.5 border-l border-white/15 p-0 pl-2">
                                    {subItems.map((sub) => (
                                        <li key={sub.to}>
                                            <NavLink
                                                to={sub.to}
                                                onClick={onNavigate}
                                                aria-current={pathname === sub.to ? 'page' : undefined}
                                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[0.82rem] transition ${
                                                    pathname === sub.to
                                                        ? 'bg-sage-800 font-semibold text-white'
                                                        : 'text-sage-100/80 hover:bg-white/8 hover:text-white'
                                                }`}>
                                                {SUB_ICONS[sub.icon]}
                                                {navLabel(sub.label, t)}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )
                })}
            </nav>

            {!collapsed && !isMobile && (
                <div className="hidden xl:block">
                    <AdminNavigationScrollbar navigationRef={navigationRef}/>
                </div>
            )}

            {/* Phones: the top bar has no room for the switch, so the drawer carries it. */}
            {isMobile && !collapsed && (
                <div className="mt-3 flex justify-center border-t border-white/10 pt-3">
                    <LanguageToggle tone="rail"/>
                </div>
            )}

            {/* Collapse / expand - desktop only, remembered per browser */}
            {!isMobile && onToggleCollapse && (
                <div className={`mt-2 border-t border-white/10 pt-2 ${collapsed ? 'px-0' : 'px-1'}`}>
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        aria-expanded={!collapsed}
                        aria-controls="primary-navigation"
                        aria-label={collapsed ? t('nav.expand') : t('nav.collapseAria')}
                        title={collapsed ? t('nav.expand') : t('nav.collapseAria')}
                        className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[0.84rem] font-semibold text-sage-100 transition hover:bg-white/10 hover:text-white ${
                            collapsed ? 'justify-center px-0' : ''
                        }`}>
                        <Icon icon={collapsed ? 'fa6-solid:angles-right' : 'fa6-solid:angles-left'}
                              className="size-4 shrink-0"/>
                        {!collapsed && <span className="truncate">{t('nav.collapse')}</span>}
                    </button>
                </div>
            )}

            {/* Bottom decoration - repository lotus + quotation, as upstream */}
            <div
                className={`mt-auto flex flex-col items-center pt-[clamp(6px,1.6vh,16px)] pb-[clamp(0px,0.8vh,8px)] text-center ${collapsed ? 'hidden' : ''}`}>
                <img
                    src="/SVG/lotus_main.svg"
                    alt=""
                    aria-hidden="true"
                    className="h-[clamp(34px,6.4vh,58px)] w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,.35)]"
                />
                <p className="mt-[clamp(4px,1.1vh,11px)] text-[clamp(12.5px,1.95vh,15.5px)] leading-normal text-sky-100 italic">
                    {[t('nav.blessing1'), t('nav.blessing2'), t('nav.blessing3')].map((line, index) => (
                        <span key={line}>
                            {index > 0 && <br/>}
                            {line}
                        </span>
                    ))}
                </p>
                <img
                    src="/SVG/lotus_divider.svg"
                    alt=""
                    aria-hidden="true"
                    className="mt-[clamp(3px,0.8vh,9px)] w-[clamp(132px,10vw,176px)] object-contain"
                />
            </div>
        </aside>
    )
}

export default Sidebar