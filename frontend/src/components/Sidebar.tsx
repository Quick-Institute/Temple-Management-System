import { useRef } from "react";
import AdminNavigationScrollbar from "./temple-admin/AdminNavigationScrollbar";
import { Icon } from "@iconify/react";
import { NavLink } from "react-router-dom";
import { adminNavigationIcons } from "./temple-admin/navigationIcons";
import { superAdminNavigationIcons } from "./super-admin/navigationIcons";
import type { UserRole } from "../types";

/*
 * Icons are Iconify names, matched to the Figma sidebar (filled Material
 * style): https://icon-sets.iconify.design/material-symbols/
 */
const ICONS = {
  dashboard: "ant-design:home-filled",
  family: "material-symbols:group",
  schedule: "material-symbols:calendar-month",
  bookings: "mdi:calendar-month",
  events: "material-symbols:pending-actions",
  notifications: "material-symbols:notifications",
  profile: "material-symbols:person",
  settings: "material-symbols:settings",
  temple: "material-symbols:temple-buddhist",
  announcements: "material-symbols:campaign",
  donations: "material-symbols:favorite",
  reports: "material-symbols:bar-chart",
  programmes: "material-symbols:menu-book",
  system: "material-symbols:verified-user",
};

const navigationByRole = {
  family: [
    { label: "Dashboard", icon: ICONS.dashboard, to: "/dashboard" },
    { label: "My Family", icon: ICONS.family, to: "/my-family" },
    { label: "Dana Schedule", icon: ICONS.schedule, to: "/dana-schedule" },
    { label: "My Bookings", icon: ICONS.bookings, to: "/my-bookings" },
    { label: "Events", icon: ICONS.events, to: "/events" },
    { label: "Notifications", icon: ICONS.notifications, to: "/notifications", badge: 3 },
    { label: "Profile", icon: ICONS.profile, to: "/profile" },
    { label: "Settings", icon: ICONS.settings, to: "/settings" },
  ],

  templeAdmin: [
    { label: "Dashboard", icon: ICONS.dashboard, to: "/dashboard" },
    { label: "Temple Information", icon: ICONS.temple, to: "/temple-information" },
    { label: "Dana Management", icon: ICONS.schedule, to: "/dana-management" },
    { label: "Event Management", icon: ICONS.events, to: "/event-management" },
    { label: "Announcements", icon: ICONS.announcements, to: "/announcements" },
    { label: "Family Members", icon: ICONS.family, to: "/family-members" },
    { label: "Donations", icon: ICONS.donations, to: "/donations" },
    { label: "User Management", icon: ICONS.family, to: "/user-management" },
    { label: "Reports", icon: ICONS.reports, to: "/reports" },
    { label: "Notifications", icon: ICONS.notifications, to: "/notifications", badge: 3 },
    { label: "Settings", icon: ICONS.settings, to: "/settings" },
  ],

  coAdmin: [
    { label: "Dashboard", icon: ICONS.dashboard, to: "/dashboard" },
    { label: "Temple Information", icon: ICONS.temple, to: "/temple-information" },
    { label: "Dana Management", icon: ICONS.schedule, to: "/dana-management" },
    { label: "Event Management", icon: ICONS.events, to: "/event-management" },
    { label: "Announcements", icon: ICONS.announcements, to: "/announcements" },
    { label: "Family Members", icon: ICONS.family, to: "/family-members" },
    { label: "Donations", icon: ICONS.donations, to: "/donations" },
    { label: "Reports", icon: ICONS.reports, to: "/reports" },
    { label: "Notifications", icon: ICONS.notifications, to: "/notifications", badge: 3 },
    { label: "Profile", icon: ICONS.profile, to: "/profile" },
    { label: "Settings", icon: ICONS.settings, to: "/settings" },
  ],

  superAdmin: [
    { label: "Dashboard", icon: ICONS.dashboard, to: "/dashboard" },
    { label: "Temples", icon: ICONS.temple, to: "/temples" },
    { label: "User Management", icon: ICONS.family, to: "/user-management" },
    { label: "Donors", icon: ICONS.donations, to: "/donors" },
    { label: "Dana Schedules", icon: ICONS.schedule, to: "/dana-schedules" },
    { label: "Event Management", icon: ICONS.events, to: "/event-management" },
    { label: "Programmes", icon: ICONS.programmes, to: "/programmes" },
    { label: "Announcements", icon: ICONS.announcements, to: "/announcements" },
    { label: "Reports", icon: ICONS.reports, to: "/reports" },
    { label: "System Settings", icon: ICONS.system, to: "/system-settings" },
  ],
};

/* Footer quote per role; family and temple roles keep the original text. */
const footerQuotes = {
  default: ["“May the blessings", "of the Triple Gem be", "with your family.”"],
  superAdmin: ["“Supporting Temples", "Strengthening", "Communities.”"],
};

/* Shared item look. Height scales with viewport height so 8 items always fit. */
const itemShared =
  "group relative flex w-full items-center border text-left leading-none tracking-[0.01em] " +
  "transition-[background-color,border-color,color,box-shadow] duration-200 ease-out " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E4BC50]";

/* Expanded / desktop / mobile: unchanged from the original item look. */
const itemFull =
  "h-[clamp(32px,5.6vh,48px)] gap-3 rounded-xl px-[clamp(10px,1.1vw,16px)] " +
  "text-[clamp(13px,2vh,15.5px)]";

/* Tablet icon rail only. Uses its own height/padding/gap/radius classes (no
   clashing utilities), with zero horizontal padding so the icon box gets the
   full rail width and is centred without being squeezed or clipped. */
const itemCompact = "h-11 justify-center gap-0 rounded-lg px-0 text-[13px]";

const itemInactive =
  "border-transparent text-white/90 hover:border-[#B99A39]/35 hover:bg-white/[0.08] hover:text-white";

const itemActive =
  "border-[#E4BC50]/70 bg-linear-to-r from-[#B99A39] to-[#A98C35] text-white " +
  "shadow-[inset_-3px_0_0_#E4BC50,0_2px_8px_rgba(0,0,0,0.25)]";

/* Optical vertical correction for icons, in em of the label font size.
   Measured from the rendered sidebar: with plain centring the icons sat
   about 1px below the label's cap-height centre; the house icon (Dashboard)
   sits slightly lower still, so it gets a little more. */
const DEFAULT_ICON_NUDGE_EM = 0.08;
const ICON_NUDGE_EM = {
  [ICONS.dashboard]: 0.2,
};

function NavItem({ item, basePath = "", onNavigate, compact = false }) {
  return (
    <NavLink
      to={`${basePath}${item.to}`}
      end={item.to === "/dashboard"}
      title={item.label}
      onClick={onNavigate}
      className={({ isActive }) =>
        `${itemShared} ${compact ? itemCompact : itemFull} ${isActive ? itemActive : itemInactive}`
      }
    >
      {/* Fixed icon box: every icon sits in the same square, centred on the
          same axis, so labels always start at the same x. The small upward
          nudge lines the icon up with the optical centre (cap height) of the
          serif label instead of the full line box. */}
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 items-center justify-center ${compact ? "size-6" : "size-[clamp(18px,3vh,23px)]"}`}
        style={{ translate: `0 -${ICON_NUDGE_EM[item.icon] ?? DEFAULT_ICON_NUDGE_EM}em` }}
      >
        <Icon
          icon={item.iconData ?? item.icon}
          className="size-full transition-transform duration-200 group-hover:scale-110"
        />
      </span>
      {!compact && <span className="min-w-0 flex-1 truncate">{item.label}</span>}

      {item.badge ? (
        <span
          aria-label={`${item.badge} unread`}
          className={`flex shrink-0 items-center justify-center rounded-full bg-[#DC3B3B] font-sans font-bold leading-none text-white ${compact ? "absolute right-0.5 top-0.5 h-4 min-w-4 px-0.5 text-[9px]" : "h-5 min-w-5 px-1 text-[11px]"}`}
        >
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  );
}

interface SidebarProps {
  role?: UserRole;
  basePath?: string;
  mobileOpen?: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
  tabletExpanded?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
  onCollapseTablet?: () => void;
}
function Sidebar({ role = "family", basePath = "", mobileOpen = false, isMobile = false, isTablet = false, tabletExpanded = false, onNavigate, onClose, onCollapseTablet }: SidebarProps) {
  const navigationRef = useRef<HTMLElement | null>(null);
  const superAdmin = role === "superAdmin";
  const templeRole = role === "templeAdmin" || role === "coAdmin" || superAdmin;
  const iconMap = superAdmin ? superAdminNavigationIcons : adminNavigationIcons;
  const quote = footerQuotes[role] ?? footerQuotes.default;
  const navigation = templeRole
    ? navigationByRole[role].map(item => ({ ...item, iconData: iconMap[item.to] }))
    : navigationByRole[role] ?? navigationByRole.family;

  return (
    <aside
      id="primary-navigation"
      aria-label="Primary navigation"
      aria-hidden={isMobile && !mobileOpen}
      inert={isMobile && !mobileOpen}
      className={
        isMobile
          ? `fixed inset-y-0 left-0 z-40 flex h-dvh w-[min(84vw,280px)] shrink-0 flex-col overflow-hidden bg-[#063F32] px-3 py-4 font-georgia text-white shadow-2xl transition-transform duration-300 ease-out [@media(max-height:480px)]:overflow-y-auto ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
          : isTablet
            ? `relative z-10 flex h-dvh shrink-0 flex-col overflow-hidden bg-[#063F32] py-3 font-georgia text-white transition-[width,padding] duration-300 ease-in-out ${tabletExpanded ? "w-[220px] px-3" : "w-[64px] items-center px-2"}`
            : "sticky top-0 z-auto flex h-dvh w-[clamp(210px,17vw,240px)] shrink-0 flex-col overflow-hidden bg-[#063F32] px-[clamp(10px,1.1vw,14px)] py-[clamp(10px,2.2vh,22px)] font-georgia text-white"
      }
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close navigation menu"
        className={`absolute right-3 top-3 z-10 h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#E4BC50] ${isMobile ? "flex" : "hidden"}`}
      >
        <Icon icon="material-symbols:close-rounded" className="h-6 w-6" />
      </button>
      {/* Tablet close (X): only while the tablet sidebar is expanded. When collapsed,
          the Topbar hamburger is the single toggle. */}
      {isTablet && tabletExpanded && (
        <button
          type="button"
          onClick={onCollapseTablet}
          autoFocus
          aria-label="Close navigation menu"
          aria-expanded={true}
          aria-controls="primary-navigation"
          className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full text-white/90 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[#E4BC50]"
        >
          <Icon icon="material-symbols:close-rounded" className="size-6" aria-hidden="true" />
        </button>
      )}
      {/* Branding */}
      <div className={`text-center ${isTablet && !tabletExpanded ? "w-full" : ""}`}>
        <img
          src="/SVG/temple-logo.svg"
          alt="Temple Management System logo"
          className={`mx-auto aspect-[3/2] w-auto object-contain ${isTablet && !tabletExpanded ? "h-8" : "h-[clamp(46px,9vh,72px)]"}`}
        />

        <div className={isTablet && !tabletExpanded ? "hidden" : ""}>
          <h1 className="mt-[clamp(4px,0.9vh,9px)] whitespace-nowrap font-lora text-[clamp(14px,2.3vh,17px)] font-semibold leading-[1.2] tracking-[0.005em]">
            Temple Management
            <br />
            System
          </h1>

          <p className="mt-[clamp(3px,0.7vh,7px)] text-[clamp(9.5px,1.4vh,11.5px)] tracking-[0.03em] text-[#F3E7C3]">
            Faith · Community · Together
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        ref={navigationRef}
        id={templeRole ? "temple-admin-navigation" : undefined}
        className={`${templeRole ? "mt-[clamp(10px,2.6vh,26px)] flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&>a]:shrink-0 [&>a]:text-[13px] [&>a]:gap-2" : "mt-[clamp(10px,2.6vh,26px)] flex min-h-0 flex-1 flex-col gap-[clamp(2px,calc(2.2vh-8px),14px)] overflow-x-hidden overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&>a]:shrink-0"} ${isTablet && !tabletExpanded ? "w-full px-0 [&>a]:gap-0" : "pr-1"}`}
      >
        {navigation.map((item) => (
          <NavItem key={item.to} item={item} basePath={basePath} onNavigate={onNavigate} compact={isTablet && !tabletExpanded} />
        ))}
      </nav>

      {templeRole && !isTablet && <div className="hidden xl:block"><AdminNavigationScrollbar navigationRef={navigationRef} /></div>}

      {/* Bottom decoration */}
      <div className={`mt-auto flex flex-col items-center pt-[clamp(6px,1.6vh,16px)] pb-[clamp(0px,0.8vh,8px)] text-center ${isTablet && !tabletExpanded ? "hidden" : ""}`}>
        <img
          src="/SVG/lotus_main.svg"
          alt=""
          aria-hidden="true"
          className="aspect-[2/1] h-[clamp(24px,5.2vh,46px)] w-auto object-contain [@media(max-height:520px)]:hidden"
        />

        <p className="mt-[clamp(2px,0.9vh,9px)] text-[clamp(10.5px,1.6vh,13px)] italic leading-[1.5] text-[#F3E7C3] [@media(max-height:440px)]:hidden">
          {quote.map((line, index) => (
            <span key={line}>
              {index > 0 && <br />}
              {line}
            </span>
          ))}
        </p>

        <img
          src="/SVG/lotus_divider.svg"
          alt=""
          aria-hidden="true"
          className="mt-[clamp(1px,0.5vh,6px)] aspect-[3/1] w-[clamp(88px,6.6vw,112px)] object-contain"
        />
      </div>
    </aside>
  );
}

export default Sidebar;
