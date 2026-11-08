import type {ReactNode} from 'react'
import {
    BarChart3,
    BellRing,
    CalendarDays,
    ClipboardList,
    Heart,
    Image as ImageIcon,
    Landmark,
    LayoutDashboard,
    Megaphone,
    Settings,
    SlidersHorizontal,
    User,
    UserRound,
    Users,
} from 'lucide-react'
import type {IconKey} from '../data/navigation'

/* Small glyphs used inside sub-menus and the search dropdown. */
export const SUB_ICONS: Record<IconKey, ReactNode> = {
    home: <LayoutDashboard size={15} strokeWidth={1.8}/>,
    family: <UserRound size={15} strokeWidth={1.8}/>,
    dana: <CalendarDays size={15} strokeWidth={1.8}/>,
    bookings: <ClipboardList size={15} strokeWidth={1.8}/>,
    events: <ImageIcon size={15} strokeWidth={1.8}/>,
    profile: <User size={15} strokeWidth={1.8}/>,
    settings: <Settings size={15} strokeWidth={1.8}/>,
    temple: <Landmark size={15} strokeWidth={1.8}/>,
    announcements: <Megaphone size={15} strokeWidth={1.8}/>,
    donations: <Heart size={15} strokeWidth={1.8}/>,
    users: <Users size={15} strokeWidth={1.8}/>,
    reports: <BarChart3 size={15} strokeWidth={1.8}/>,
    roles: <Users size={15} strokeWidth={1.8}/>,
    audit: <BellRing size={15} strokeWidth={1.8}/>,
    platform: <SlidersHorizontal size={15} strokeWidth={1.8}/>,
}