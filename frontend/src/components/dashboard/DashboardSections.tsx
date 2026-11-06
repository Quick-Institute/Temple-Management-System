import type { ReactNode } from 'react';
import './dashboard-fonts.css';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { icons } from './icons';
import { actions, booking, events, notifications, summaryCards } from './data';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B68B24]';
const tones = {
  mint: 'bg-[#DDF3EB] text-[#28785E]',
  green: 'bg-[#E4F3CB] text-[#2C6423]',
  purple: 'bg-[#E5DCFF] text-[#6126BB]',
  blue: 'bg-[#D9EAFF] text-[#1687DF]',
  orange: 'bg-[#FFE6C6] text-[#DC6015]',
  gold: 'bg-[#FFF1D6] text-[#BA8720]',
};
const actionTones = {
  green: 'bg-[#EFF8EF] text-[#28533F]',
  blue: 'bg-[#EEF5FF] text-[#233149]',
  orange: 'bg-[#FFF7EC] text-[#28533F]',
  purple: 'bg-[#F5F0FF] text-[#28533F]',
};
const actionChevronColors = {
  green: 'text-[#2C6423]',
  blue: 'text-[#1687DF]',
  orange: 'text-[#DC6015]',
  purple: 'text-[#6126BB]',
};
function Glyph({ name, className = 'h-[18px] w-[18px]' }) {
  return <Icon icon={icons[name]} className={`block shrink-0 ${className}`} aria-hidden="true" />;
}
function IconCircle({ icon, tone, small = false, compact = false }) {
  return <span className={`flex shrink-0 items-center justify-center rounded-full ${tones[tone]} ${small ? 'h-8 w-8' : compact ? 'h-9 w-9' : 'h-[50px] w-[50px]'}`}>
    <Glyph name={icon} className={small ? 'h-[17px] w-[17px]' : compact ? 'h-5 w-5' : 'h-[23px] w-[23px]'} />
  </span>;
}
function Meta({ icon, children, className = '', iconClassName = '' }) {
  return <span className={`flex items-start gap-1.5 text-[#707D74] ${className}`}><Glyph name={icon} className={`mt-0.5 h-[13px] w-[13px] ${icon === 'akar-icons:clock' ? 'text-[#647067] [&_circle]:[vector-effect:non-scaling-stroke] [&_path]:[vector-effect:non-scaling-stroke]' : 'text-[#657469]'} ${iconClassName}`} /><span>{children}</span></span>;
}
function DateBlock({ day, month, year }: { day: string; month: string; year?: string }) {
  return <div className={`flex shrink-0 flex-col items-center justify-center rounded-[9px] font-semibold ${year ? 'min-h-[76px] w-[62px] bg-[#E9F6EF] text-[11px] leading-4 max-[22.5rem]:w-[45px]' : 'min-h-[52px] w-11 bg-[#E0F3FA] text-[10px] leading-[15px]'}`}>
    <strong className={`font-semibold ${year ? 'text-[28px] leading-[30px]' : 'text-xl leading-6 text-[#293344]'}`}>{day}</strong><span>{month}</span>{year && <span>{year}</span>}
  </div>;
}
function Panel({ title, icon, lotus = false, to, children }: { title: string; icon?: string; lotus?: boolean; to?: string; children: ReactNode }) {
  return <section className="min-w-0 rounded-[14px] border border-[#E8E5DB] bg-white p-3 sm:p-3.5" aria-label={title}>
    <header className="mb-3.5 flex min-h-[28px] items-center justify-between gap-2.5 max-[22.5rem]:flex-wrap min-[87.5rem]:mx-2.5">
      <h2 className="flex items-center gap-2 text-base leading-[26px] font-bold text-[#202E45] sm:text-[17px] min-[87.5rem]:gap-3 min-[87.5rem]:text-lg">
        {lotus ? <Glyph name="ph:flower-lotus-light" className="h-8 w-8 text-[#B88C25]" /> : <Glyph name={icon} className="h-6 w-[22px] text-[#B88C25]" />}{title}
      </h2>
      {to && <Link to={to} className={`shrink-0 whitespace-nowrap text-[10px] hover:underline sm:text-xs ${focus}`} aria-label={`View all ${title.toLowerCase()}`}>View All <span aria-hidden="true">→</span></Link>}
    </header>{children}
  </section>;
}
function SummaryCards() {
  return <section className="grid auto-rows-fr grid-cols-1 gap-3.5 sm:grid-cols-2 min-[75rem]:grid-cols-4" aria-label="Dashboard summary">{summaryCards.map(card =>
    <Link key={card.title} to={card.to} className={`family-summary-card flex min-h-[104px] min-w-0 items-center gap-2.5 rounded-[14px] border border-[#E8E5DB] bg-white px-2.5 py-3 hover:border-[#C4D4C8] ${focus}`}>
      <IconCircle icon={card.icon} tone={card.tone} />
      <div className="min-w-0 flex-1"><h3 className="text-[13px] leading-5 font-semibold">{card.title}</h3>
        <p className="mt-[5px] text-sm leading-[21px] font-bold text-[#293344]">{card.value}</p>
        <div className="mt-1.5 text-[11px] leading-[17px] text-[#707D74]">{card.location ? <Meta icon="location-dot" className="gap-1! [&>svg]:w-[11px]">{card.detail}</Meta> : card.detail}</div>
      </div><Glyph name="chevron-right" className="h-[13px] w-2 text-[#293344]" />
    </Link>)}</section>;
}
function DanaBooking() {
  return <Panel title="Upcoming Dana Booking" lotus to="/my-bookings">
    <div className="rounded-xl border border-[#E7E4DA] px-3 pt-2.5 pb-4 max-[22.5rem]:px-2">
      <div className="grid grid-cols-[62px_minmax(0,1fr)] items-center gap-3 max-[22.5rem]:grid-cols-[45px_minmax(0,1fr)] max-[22.5rem]:gap-2 sm:flex min-[87.5rem]:gap-3.5">
        <DateBlock {...booking} />
        <div className="min-w-0 flex-1"><h3 className="mb-[5px] text-[13px] leading-[22px] font-semibold text-[#202E45] sm:text-[15px]">{booking.title}</h3>
          <Meta icon="location-dot" iconClassName="overflow-visible" className="text-[10px] leading-[18px] sm:text-xs">{booking.temple}</Meta>
          <Meta icon="akar-icons:clock" className="mt-[5px] text-[10px] leading-[18px] sm:text-xs">{booking.time}</Meta>
        </div>
        <span className="inline-flex items-center justify-center gap-[7px] rounded-xl bg-[#FFF3D9] px-2.5 py-[7px] text-[10px] leading-[18px] whitespace-nowrap text-[#B47A16] max-[22.5rem]:col-span-2 max-[22.5rem]:justify-self-start sm:text-xs min-[87.5rem]:px-3.5"><Glyph name="akar-icons:clock" className="h-[13px] w-[13px]" />{booking.status}</span>
        <div className="flex items-center max-[22.5rem]:col-span-2 sm:min-h-[55px] sm:border-l sm:border-[#E7E4DA] sm:pl-3 min-[87.5rem]:pl-4">
          <Link to="/my-bookings" className={`rounded-[9px] bg-[#234C39] px-3 py-2.5 text-xs whitespace-nowrap text-white hover:bg-[#193E2C] min-[87.5rem]:px-5 min-[87.5rem]:py-[11px] ${focus}`}>View booking <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-2.5 rounded-[10px] bg-[#E8F5EE] p-3 text-[11px] leading-[17px] text-[#3B6855]"><Glyph name="circle-info" className="h-4 w-4 text-[#488E73]" />{booking.message}</p>
    </div>
  </Panel>;
}
function QuickActions() {
  return <Panel title="Quick Actions" icon="gear"><div className="family-quick-actions-grid grid grid-cols-1 gap-2.5 px-1 sm:grid-cols-2">{actions.map(action =>
    <Link key={action.title} to={action.to} className={`family-quick-action flex min-h-[70px] min-w-0 items-center gap-1.5 rounded-xl px-2 py-3 hover:shadow-[inset_0_0_0_1px_#CDD8CF] ${actionTones[action.tone]} ${focus}`}>
      <IconCircle {...action} compact /><div className="min-w-0 flex-1"><h3 className="text-xs leading-[19px] font-semibold min-[87.5rem]:text-[13px]">{action.title}</h3><p className="mt-1 text-[10px] leading-[14px]">{action.detail}</p></div>
      <Glyph name="chevron-right" className={`h-[13px] w-2 ${actionChevronColors[action.tone]}`} />
    </Link>)}</div></Panel>;
}
function UpcomingEvents() {
  return <Panel title="Upcoming Events" icon="calendar-days" to="/events"><div className="grid gap-1.5">{events.map(event =>
    <Link key={event.id} to="/events" className={`grid min-h-[75px] min-w-0 grid-cols-[44px_55px_minmax(0,1fr)] items-center gap-2 rounded-xl border border-[#E7E4DA] px-2.5 py-2 hover:border-[#C4D4C8] sm:flex sm:gap-2.5 min-[87.5rem]:gap-3 ${focus}`} aria-label={`View ${event.title}`}>
      <DateBlock {...event} /><img src={event.image} alt={event.alt} className="h-[53px] w-[55px] shrink-0 rounded-[7px] object-cover sm:h-[57px] sm:w-[68px] min-[87.5rem]:w-[78px]" />
      <div className="col-span-full row-start-2 min-w-0 flex-1"><h3 className="mb-[3px] text-[15px] leading-5 font-semibold">{event.title}</h3><Meta icon="location-dot" className="text-[11px] leading-[17px]">{event.temple}</Meta><Meta icon="akar-icons:clock" className="text-[11px] leading-[17px]">{event.time}</Meta></div>
      <span className="justify-self-end rounded-full bg-[#E4F3FF] px-[7px] py-[5px] text-[9px] leading-[18px] whitespace-nowrap text-[#1976DF] sm:px-[11px] sm:py-1.5 sm:text-[11px]">{event.status}</span><Glyph name="chevron-right" className="hidden h-[13px] w-2 text-[#1976DF] sm:block" />
    </Link>)}</div></Panel>;
}
function LatestNotifications() {
  return <Panel title="Latest Notifications" icon="bell" to="/notifications"><ul className="divide-y divide-[#E7E4DA] rounded-xl border border-[#E7E4DA] px-2 min-[87.5rem]:px-3">{notifications.map(item =>
    <li key={item.id} className="family-notification-row flex min-h-[52px] flex-wrap items-center gap-[7px] py-2.5 sm:flex-nowrap min-[87.5rem]:gap-2.5">
      <IconCircle {...item} small /><div className="family-notification-copy min-w-0 flex-1 basis-[calc(100%-42px)] sm:basis-auto"><h3 className="text-xs leading-4 font-bold min-[75rem]:text-[11px]">{item.title}</h3><p className="mt-0.5 text-[10px] leading-[15px] text-[#78877D]">{item.detail}</p></div>
      <span className="family-notification-time ml-[39px] self-start text-[9px] whitespace-nowrap text-[#78877D] sm:ml-0 sm:pt-1">{item.time}</span>
    </li>)}</ul></Panel>;
}
export default function DashboardSections() {
  return <div className="family-dashboard-sections -mt-2 grid gap-3 font-lora text-[#28533F]"><SummaryCards /><div className="grid grid-cols-1 gap-3 min-[75rem]:grid-cols-[minmax(0,57fr)_minmax(0,43fr)]"><DanaBooking /><QuickActions /><UpcomingEvents /><LatestNotifications /></div></div>;
}
