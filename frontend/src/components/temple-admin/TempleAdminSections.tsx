import type { AppUser, TempleDashboardProps } from '../../types';
import { adminRoutes } from '../../routes/adminRoutes';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ArrowUp, Heart, Megaphone, MoreHorizontal } from 'lucide-react';
import { icons } from '../dashboard/icons';
import '../dashboard/dashboard-fonts.css';
import { summary, temple, schedule, bookings, actions, notifications } from './data';
import { coAdminSchedule, coAdminActions } from './coAdminData';
import './coAdminFonts.css';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#248fb6]';
const tones = {
  blue: { surface: 'bg-[#F4FAFF] border-[#DEEDF9]', soft: 'bg-[#E5F2FF]', ink: 'text-[#1684EF]', solid: 'bg-linear-to-br from-[#45ABFF] to-[#087AFF]' },
  green: { surface: 'bg-[#f7fafc] border-[#e1eaee]', soft: 'bg-[#e4f0f6]', ink: 'text-[#1271a1]', solid: 'bg-linear-to-br from-[#2b90c3] to-[#0e6b9a]' },
  gold: { surface: 'bg-[#f6fdff] border-[#d8edf4]', soft: 'bg-[#d9f5ff]', ink: 'text-[#0ba9e3]', solid: 'bg-linear-to-br from-[#2ec7ff] to-[#00b4f5]' },
  purple: { surface: 'bg-[#F9F7FF] border-[#EAE5F7]', soft: 'bg-[#F2ECFF]', ink: 'text-[#8735ED]', solid: 'bg-linear-to-br from-[#A64CFF] to-[#7125E5]' },
  red: { surface: 'bg-[#FFF3F3] border-[#FBE5E5]', soft: 'bg-[#FFEAEA]', ink: 'text-[#F04446]', solid: 'bg-[#F04446]' },
};

function dashboardLink(basePath: string, path: string): string {
  if (path === '/temple-information') return adminRoutes.templeInformation;
  if ([adminRoutes.families, adminRoutes.dana, adminRoutes.donations, adminRoutes.events,
       adminRoutes.announcements, adminRoutes.users].some(route => route === path)) return path;
  return `${basePath}${path}`;
}

function Glyph({ name, className = 'h-5 w-5' }) {
  const props = { className: `shrink-0 ${className}`, 'aria-hidden': true };
  if (name === 'heart') return <Heart {...props} fill="currentColor" strokeWidth={0} />;
  if (name === 'megaphone') return <Megaphone {...props} fill="currentColor" strokeWidth={1.5} />;
  return <Icon icon={icons[name] ?? name} {...props} />;
}
function Panel({ title, icon, to, linkLabel = 'View All', children, className = '', iconClassName = 'h-6 w-6' }: { title: string; icon: string; to?: string; linkLabel?: string; children: ReactNode; className?: string; iconClassName?: string }) {
  return <section aria-label={title} className={`min-w-0 rounded-xl border border-[#dce5e9] bg-white p-3 ${className}`}>
    <header className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-lg leading-6 font-bold text-[#17273C]"><Glyph name={icon} className={`${iconClassName} text-[#1aa6d9]`} />{title}</h2>
      {to && <Link to={to ?? "#"} className={`flex items-center gap-2 text-xs text-[#285d78] hover:underline ${focus}`}>{linkLabel}<Glyph name="arrow-right" className="h-3 w-3" /></Link>}
    </header>{children}
  </section>;
}
function Badge({ children, className = 'min-w-[58px] px-2' }: { children: ReactNode; className?: string }) {
  const color = children === 'Pending' ? 'bg-[#d9f5ff] text-[#168ab4]' : children === 'Rejected' ? 'bg-[#FFE3E4] text-[#C82731]' : children === 'Event' ? 'bg-[#EEE6FF] text-[#792ADD]' : 'bg-[#E0F7E5] text-[#086431]';
  return <span className={`inline-block max-w-full rounded-md py-1 text-center text-[10px] leading-4 font-semibold whitespace-nowrap ${className} ${color}`}>{children}</span>;
}
function Summary({ basePath }) {
  return <section aria-label="Temple administration summary" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{summary.map(item => <Link key={item.title} to={dashboardLink(basePath, item.to)} className={`flex min-h-[104px] min-w-0 items-center gap-3 rounded-lg border p-3 ${tones[item.tone].surface} ${focus}`}>
    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white ${tones[item.tone].solid}`}><Glyph name={item.icon} className="h-6 w-6" /></span>
    <div className="min-w-0 flex-1"><h2 className="text-xs leading-4 font-semibold">{item.title}</h2><p className="mt-0.5 text-2xl leading-8 font-bold whitespace-nowrap">{item.value}</p><p className="mt-0.5 flex items-center gap-1 text-xs leading-4 text-[#285d78]"><ArrowUp size={13} className="shrink-0 text-[#22B935]" aria-hidden="true" />{item.change}</p></div><Glyph name="chevron-right" className={`h-3 w-2 ${tones[item.tone].ink}`} />
  </Link>)}</section>;
}
function TempleInformation({ basePath, user, role }: { basePath: string; user?: AppUser; role: 'templeAdmin' | 'coAdmin' }) {
  const details: [string, ReactNode][] = [['Temple Name', typeof user?.templeName === 'string' ? user.templeName : temple.name], ['Location', temple.location], ['Registration ID', temple.registrationId], ['Status', <Badge key="status">{temple.status}</Badge>], ['Chief Incumbent', temple.chiefIncumbent], ...(role === 'coAdmin' ? [['Co-Administrator', user?.name || 'Nimal Perera'] as [string, ReactNode]] : []), ['Contact', temple.contact]];
  return <Panel title="Temple Information" className="flex flex-col" icon="landmark-dome" to={dashboardLink(basePath, '/temple-information')} linkLabel="View Details">
    <div className="flex min-h-[170px] flex-1 flex-col gap-4 rounded-lg border border-[#dae4e7] p-2 sm:flex-row sm:items-center">
      <img src="/temple-info.png" alt="Stupa at Kataragama Temple" className={`aspect-square h-auto w-full max-w-[170px] shrink-0 self-center rounded-lg object-contain sm:w-[28%] sm:max-w-none ${role === 'coAdmin' ? 'lg:relative lg:left-2 lg:scale-[1.08] min-[1700px]:scale-100' : ''}`} />
      <dl className={`grid min-w-0 flex-1 grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] content-center gap-x-3 gap-y-1.5 py-1 text-xs leading-[17px] ${role === 'coAdmin' ? 'lg:relative lg:left-2 lg:gap-y-[9px]' : ''}`}>{details.map(([label,value]) => <div key={label} className="contents"><dt className="flex justify-between gap-3 font-semibold">{label}<span aria-hidden="true">:</span></dt><dd className="min-w-0 break-words">{value}</dd></div>)}</dl>
    </div>
  </Panel>;
}
function Schedule({ basePath, items = schedule }) {
  return <Panel title="Today’s Schedule" icon="calendar-check" to={dashboardLink(basePath, '/dana-management')}>
    <ol className="rounded-lg border border-[#dae4e7] px-2 py-1">{items.map((item,index) => <li key={item.time} className="grid grid-cols-[66px_12px_minmax(0,1fr)] gap-x-2 sm:grid-cols-[60px_12px_minmax(0,1fr)_76px]">
      <time className="pt-2 text-xs leading-4 font-medium">{item.time}</time>
      <span className="relative flex justify-center">
        <span className={`relative z-10 mt-[11px] h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`} />
        {index < items.length - 1 && <span className={`absolute top-[16px] bottom-[-16px] w-[1.25px] bg-[#CCD2D5] sm:bottom-[-12px] ${index === 0 ? 'sm:top-[-4px]' : 'sm:top-3'}`} />}
      </span>
      <div className={`min-w-0 py-2 text-xs leading-4 ${index < items.length - 1 ? 'border-b border-[#e9f3fa]' : ''}`}>
        <h3 className="font-bold">{item.title}</h3>
        <p>{item.location}</p>
        <div className="mt-1 sm:hidden"><Badge>{item.badge}</Badge></div>
      </div>
      <div className="hidden sm:col-auto sm:flex sm:items-center sm:justify-end"><Badge>{item.badge}</Badge></div>
    </li>)}</ol>
  </Panel>;
}
function Bookings({ basePath }) {
  const cell = 'px-1 py-1.5 align-middle';
  return <Panel title="Recent Dana Bookings" iconClassName="h-6 w-6 scale-[1.1667]" icon="ph:flower-lotus-light" to={dashboardLink(basePath, '/dana-management')}>
    <div className="overflow-x-auto rounded-lg border border-[#dae4e7]" tabIndex={0} aria-label="Recent dana bookings table"><table className="w-full table-fixed border-collapse text-left text-[10px] leading-4"><colgroup>{[17, 23, 17, 13, 18, 12].map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup><thead className="bg-[#F5F8FC]"><tr>{['Date','Family Name','Dana Type','Time','Status','Actions'].map(t=><th key={t} scope="col" className={`px-1 py-2 align-middle font-semibold whitespace-nowrap text-[#17273C] ${t === 'Actions' ? 'text-center' : ''}`}>{t}</th>)}</tr></thead><tbody>{bookings.map(row=><tr key={row.id} className="border-t border-[#F0F1F4]"><td className={`${cell} whitespace-nowrap`}>{row.date}</td><td className={`${cell} font-semibold text-balance`}>{row.family}</td><td className={`${cell} text-balance`}>{row.type}</td><td className={`${cell} whitespace-nowrap`}>{row.time}</td><td className={cell}><Badge className="min-w-[56px] px-1">{row.status}</Badge></td><td className={`${cell} text-center`}><Link to={`${dashboardLink(basePath, '/dana-management')}?booking=${row.id}`} aria-label={`View booking for ${row.family} on ${row.date}`} className={`inline-flex rounded p-0.5 hover:bg-[#e8f1f5] ${focus}`}><MoreHorizontal size={16} /></Link></td></tr>)}</tbody></table></div>
  </Panel>;
}
function QuickActions({ basePath, items = actions }) {
  return <Panel title="Quick Actions" icon="gear"><div className="grid grid-cols-2 gap-1.5">{items.map(item=><Link key={item.title} to={`${dashboardLink(basePath, item.to)}${item.action ? `?action=${item.action}` : ''}`} className={`flex min-h-[88px] flex-col justify-center gap-1.5 rounded-lg border p-2 ${tones[item.tone].surface} ${focus}`}><span className={`flex items-center justify-between ${tones[item.tone].ink}`}><Glyph name={item.icon} className="h-6 w-6" /><Glyph name="chevron-right" className="h-3 w-2" /></span><span className="text-[11px] leading-4 font-semibold">{item.title}</span></Link>)}</div></Panel>;
}
function Notifications({ basePath }) {
  return <Panel title="Latest Notifications" icon="bell" to={`${basePath}/notifications`}><ul className="divide-y divide-[#e9f3fa] rounded-lg border border-[#dae4e7] px-2">{notifications.map(item=><li key={item.id}><Link to={`${basePath}/notifications?notification=${item.id}`} className={`flex items-center gap-2 py-2 ${focus}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tones[item.tone].soft} ${tones[item.tone].ink}`}><Glyph name={item.icon} className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-[11px] leading-[17px] font-bold">{item.title}</span><span className="block text-[10px] leading-[16px]">{item.detail}</span></span><span className="self-start pt-1 text-[9px] whitespace-nowrap">{item.time}</span></Link></li>)}</ul></Panel>;
}
export default function TempleAdminSections({ basePath = '', user, role = 'templeAdmin' }: TempleDashboardProps) {
  return <div className="-mt-2 grid gap-2.5 font-lora text-[#17273C]" style={role === 'coAdmin' ? { fontFamily: '"CoAdmin Lora", Georgia, serif' } : undefined}><Summary basePath={basePath} /><div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.32fr)_minmax(0,1fr)]"><TempleInformation basePath={basePath} user={user} role={role} /><Schedule basePath={basePath} items={role === 'coAdmin' ? coAdminSchedule : schedule} /></div><div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1.38fr)]"><div className="min-w-0 md:col-span-2 xl:col-span-1 [&>section]:h-full"><Bookings basePath={basePath} /></div><QuickActions basePath={basePath} items={role === 'coAdmin' ? coAdminActions : actions} /><Notifications basePath={basePath} /></div></div>;
}
