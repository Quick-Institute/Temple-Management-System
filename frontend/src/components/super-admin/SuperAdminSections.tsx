import type {CSSProperties, ReactNode} from 'react';
import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Icon} from '@iconify/react';
import {ArrowUp, ChevronDown, MoreHorizontal} from 'lucide-react';
import {icons} from '../dashboard/icons';
import {adminNavigationIcons} from '../temple-admin/navigationIcons';
import {activities, quickActions, registrations, roles, summary, trendRanges, trends, workflow} from './data';
import './superAdminFonts.css';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#248fb6]';

// Local icon data where available, otherwise an Iconify name (fa6-solid).
const localIcons = {...icons, heart: adminNavigationIcons['/donations']};

function Glyph({name, className = 'h-5 w-5'}) {
    return <Icon icon={localIcons[name] ?? name} className={`block shrink-0 ${className}`} aria-hidden="true"/>;
}

const tones = {
    blue: {
        surface: 'bg-[#F4FAFF] border-[#DEEDF9]',
        soft: 'bg-[#E5F2FF]',
        ink: 'text-[#1684EF]',
        solid: 'bg-linear-to-br from-[#45ABFF] to-[#087AFF]'
    },
    green: {
        surface: 'bg-[#f7fafc] border-[#e1eaee]',
        soft: 'bg-[#e4f0f6]',
        ink: 'text-[#1271a1]',
        solid: 'bg-linear-to-br from-[#2b90c3] to-[#0e6b9a]'
    },
    gold: {
        surface: 'bg-[#f6fdff] border-[#d8edf4]',
        soft: 'bg-[#d9f5ff]',
        ink: 'text-[#0ba9e3]',
        solid: 'bg-linear-to-br from-[#2ec7ff] to-[#00b4f5]'
    },
    amber: {
        surface: 'bg-[#ecfaff] border-[#ccecf8]',
        soft: 'bg-[#d6f4ff]',
        ink: 'text-[#0ba9e3]',
        solid: 'bg-[#1cbbf5]'
    },
    purple: {
        surface: 'bg-[#F9F7FF] border-[#EAE5F7]',
        soft: 'bg-[#EFE8FF]',
        ink: 'text-[#8A3FEE]',
        solid: 'bg-linear-to-br from-[#A64CFF] to-[#7125E5]'
    },
    red: {surface: 'bg-[#FFF3F3] border-[#FBE0E0]', soft: 'bg-[#FFE7E7]', ink: 'text-[#EF4444]', solid: 'bg-[#EF4444]'},
};

interface PanelProps {
    title: string;
    icon: string;
    to?: string;
    linkLabel?: string;
    subtitle?: string;
    aside?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

function Panel({
                   title,
                   icon,
                   to,
                   linkLabel = 'View All',
                   subtitle,
                   aside,
                   action,
                   children,
                   className = ''
               }: PanelProps) {
    return (
        <section aria-label={title}
                 className={`min-w-0 rounded-xl border border-[#dce5e9] bg-white p-3 sm:p-4 ${className}`}>
            <header className="mb-1 flex min-h-7 flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2.5 text-lg leading-7 font-bold text-[#17273C]">
                    <Glyph name={icon} className="h-6 w-6 text-[#1aa6d9]"/>
                    {title}
                </h2>
                {to && (
                    <Link to={to}
                          className={`flex items-center gap-1.5 text-xs text-[#073952] hover:underline ${focus}`}>
                        {linkLabel}
                        <Glyph name="arrow-right" className="h-3 w-3"/>
                    </Link>
                )}
                {action}
            </header>
            {subtitle && aside && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <p className="text-xs leading-5 text-[#1F5FA8]">{subtitle}</p>
                    {aside}
                </div>
            )}
            {subtitle && !aside && <p className="mb-3 text-xs leading-5 text-[#1F5FA8]">{subtitle}</p>}
            {!subtitle && <div className="mb-2"/>}
            {children}
        </section>
    );
}

function Badge({children}) {
    const color = children === 'Pending' ? 'bg-[#d2f3ff] text-[#0882ae]' : children === 'Rejected' ? 'bg-[#FFE3E4] text-[#C82731]' : 'bg-[#ddedf5] text-[#0b4b6b]';
    return <span
        className={`inline-block min-w-16.5 rounded-md px-2.5 py-1 text-center text-[11px] leading-4 font-semibold whitespace-nowrap ${color}`}>{children}</span>;
}

function SummaryCards() {
    return (
        <section aria-label="Platform summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map(item => (
                <Link key={item.title} to={item.to}
                      className={`flex min-h-26 min-w-0 items-center gap-3.5 rounded-xl border p-4 hover:shadow-sm ${tones[item.tone].surface} ${focus}`}>
          <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white ${tones[item.tone].solid}`}>
            <Glyph name={item.icon} className="h-6 w-6"/>
          </span>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-[13px] leading-5 font-semibold text-[#17273C]">{item.title}</h2>
                        <p className="mt-0.5 text-2xl leading-8 font-bold whitespace-nowrap text-[#17273C]">{item.value}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs leading-4 text-[#073952]">
                            <ArrowUp size={13} className="shrink-0 text-[#2287b9]" aria-hidden="true"/>
                            {item.change}
                        </p>
                    </div>
                    <Glyph name="chevron-right" className={`h-3.5 w-2.5 ${tones[item.tone].ink}`}/>
                </Link>
            ))}
        </section>
    );
}

function RegistrationWorkflow() {
    return (
        <Panel title="Temple Registration Workflow" icon="landmark-dome" to="/temples"
               subtitle="Review and manage new temple registration requests.">
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {workflow.map(item => (
                    <li key={item.label}>
                        <Link to={`/temples?status=${item.status}`}
                              className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-3 text-center ${tones[item.tone].surface} ${focus}`}>
                            <Glyph name={item.icon} className={`h-7 w-7 ${tones[item.tone].ink}`}/>
                            <span className="text-[13px] leading-5 font-semibold text-[#17273C]">{item.label}</span>
                            <span className="text-2xl leading-7 font-bold text-[#17273C]">{item.value}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

function QuickActions() {
    return (
        <Panel title="Quick Actions" icon="gear" className="@container">
            <div className="grid grid-cols-1 gap-2.5 min-[480px]:@min-[20.5rem]:grid-cols-2">
                {quickActions.map(item => (
                    <Link key={item.title} to={`${item.to}${item.query ?? ''}`}
                          className={`flex min-h-16 min-w-0 items-center gap-2.5 rounded-lg border px-3 py-2 min-[480px]:@max-[23rem]:px-2 ${tones[item.tone].surface} ${focus}`}>
                        <Glyph name={item.icon} className={`h-7 w-7 ${tones[item.tone].ink}`}/>
                        <span
                            className="min-w-0 flex-1 text-[13px] leading-4.5 font-semibold text-[#17273C]">{item.title}</span>
                        <Glyph name="chevron-right" className={`h-3.5 w-2 ${tones[item.tone].ink}`}/>
                    </Link>
                ))}
            </div>
        </Panel>
    );
}

function RegistrationTrends() {
    const [months, setMonths] = useState(6);
    const data = trends.slice(-months);
    const peak = Math.max(...data.map(d => Math.max(d.registered, d.approved)));
    const top = Math.ceil((peak + 10) / 10) * 10;
    const ticks = Array.from({length: top / 10 + 1}, (_, i) => i * 10);
    const plot = 'h-[190px]';
    // Crowded (12-month) charts on narrow panels keep a readable bar width and scroll sideways inside the chart box; the y-axis stays pinned.
    const crowded = months > 6;

    const range = (
        <label className="relative inline-flex items-center">
            <span className="sr-only">Time range</span>
            <select
                value={months}
                onChange={event => setMonths(Number(event.target.value))}
                /* Inline font styles: index.css has an unlayered `select { font: inherit }` that overrides Tailwind's layered text/font utilities. */
                style={{
                    fontFamily: '"SuperAdmin Lora", Lora, Georgia, serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    lineHeight: '20px'
                }}
                className={`h-7 w-auto cursor-pointer appearance-none rounded-md border border-[#d0dde3] bg-white py-0 pl-2.5 pr-6 whitespace-nowrap text-[#17273C] ${focus}`}
            >
                {trendRanges.map(r => <option key={r.months} value={r.months}>{r.label}</option>)}
            </select>
            <ChevronDown size={13} strokeWidth={2.5}
                         className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[#17273C]"
                         aria-hidden="true"/>
        </label>
    );

    return (
        <Panel
            title="Temple Registration Trends"
            icon="fa6-solid:chart-column"
            subtitle="Number of temple registrations over time."
            action={range}
            className="flex flex-col @container"
            aside={
                <div className="flex gap-4 text-[11px] leading-5 text-[#17273C]">
                    <span className="flex items-center gap-1.5"><span
                        className="h-2.5 w-2.5 rounded-full bg-[#1583F2]"/>Registered</span>
                    <span className="flex items-center gap-1.5"><span
                        className="h-2.5 w-2.5 rounded-full bg-[#1f83b5]"/>Approved</span>
                </div>
            }
        >
            <div
                role="img"
                aria-label={`Bar chart of temple registrations and approvals for the last ${months} months. ${data.map(d => `${d.month}: ${d.registered} registered, ${d.approved} approved`).join('; ')}.`}
                className={`flex-1 rounded-lg border border-[#eaf0f3] px-2 pt-4 pb-2 ${crowded ? '@max-[34.5rem]:overflow-x-auto @max-[34.5rem]:px-0' : ''}`}
            >
                <div className={`flex ${crowded ? '@max-[34.5rem]:min-w-(--chart-min)' : ''}`}
                     style={crowded ? ({'--chart-min': `${months * 48 + 36}px`} as CSSProperties) : undefined}>
                    {/* Y axis */}
                    <div
                        className={`relative w-7 shrink-0 ${plot} ${crowded ? '@max-[34.5rem]:sticky @max-[34.5rem]:left-0 @max-[34.5rem]:z-10 @max-[34.5rem]:w-9 @max-[34.5rem]:bg-white @max-[34.5rem]:pl-2' : ''}`}
                        aria-hidden="true">
                        {ticks.map(t => (
                            <span key={t}
                                  className="absolute right-2 translate-y-1/2 text-[10px] leading-none text-[#4A5A66]"
                                  style={{bottom: `${(t / top) * 100}%`}}>{t}</span>
                        ))}
                    </div>
                    <div className="relative min-w-0 flex-1" aria-hidden="true">
                        {/* Grid */}
                        <div className={`absolute inset-x-0 top-0 border-l border-[#8C9892] ${plot}`}>
                            {ticks.map(t => (
                                <span key={t}
                                      className={`absolute inset-x-0 border-t ${t === 0 ? 'border-[#8C9892]' : 'border-[#e0e8ec]'}`}
                                      style={{bottom: `${(t / top) * 100}%`}}/>
                            ))}
                        </div>
                        {/* Bars */}
                        <div className="relative flex justify-around">
                            {data.map(d => (
                                <div key={d.month} className="flex min-w-0 flex-1 flex-col items-center">
                                    <div className={`flex w-full items-end justify-center gap-0.75 ${plot}`}>
                                        {[['registered', '#1583F2'], ['approved', '#1f83b5']].map(([key, color]) => (
                                            <div key={key}
                                                 className={`flex h-full flex-col justify-end items-center ${months > 6 ? 'w-[26%]' : 'w-[30%] max-w-6.5'}`}>
                                                <span
                                                    className="mb-0.5 text-[10px] leading-3 font-semibold text-[#17273C]">{d[key]}</span>
                                                <div className="w-full shrink-0 rounded-t-[3px]" style={{
                                                    height: `${(d[key] / top) * 100}%`,
                                                    backgroundColor: color
                                                }}/>
                                            </div>
                                        ))}
                                    </div>
                                    <span
                                        className="mt-1.5 max-w-full truncate text-[10px] leading-4 text-[#17273C] @max-[20rem]:overflow-visible @max-[20rem]:text-center @max-[20rem]:leading-3 @max-[20rem]:whitespace-normal">{d.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    );
}

const number = new Intl.NumberFormat('en-US');

function UsersByRole() {
    const total = roles.reduce((sum, r) => sum + r.count, 0);
    const radius = 46;
    const circumference = 2 * Math.PI * radius;
    const overlap = 0.5; // hidden under the next segment, removes anti-aliasing seams
    const segments = roles.map((r, i) => {
        const length = (r.count / total) * circumference;
        // Each segment starts where the previous ones end (computed from the preceding counts, no reassignment).
        const offset = roles.slice(0, i).reduce((sum, prev) => sum + (prev.count / total) * circumference, 0);
        return {...r, dash: length + (i < roles.length - 1 ? overlap : 0), offset};
    });

    return (
        <Panel title="System Users by Role" icon="fa6-solid:users"
               subtitle="Distribution of all registered users on the platform." className="flex flex-col @container">
            <div
                className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-[#eaf0f3] p-3 min-[480px]:@min-[23rem]:flex-row min-[480px]:@min-[23rem]:items-center min-[480px]:@min-[23rem]:justify-between min-[480px]:@min-[23rem]:gap-3 min-[480px]:@min-[23rem]:px-2.5">
                <div role="img" aria-label={`Doughnut chart of ${number.format(total)} users by role`}
                     className="relative size-37.5 shrink-0">
                    <svg viewBox="0 0 120 120" className="size-full -rotate-90" shapeRendering="geometricPrecision"
                         aria-hidden="true">
                        {segments.map(s => (
                            <circle key={s.label} cx="60" cy="60" r={radius} fill="none" stroke={s.color}
                                    strokeWidth="14" strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                                    strokeDashoffset={-s.offset}/>
                        ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl leading-6 font-bold text-[#17273C]">{number.format(total)}</span>
                        <span className="text-xs leading-4 text-[#17273C]">Users</span>
                    </div>
                </div>
                <ul className="grid w-full min-w-0 grid-cols-[10px_minmax(0,1fr)_42px_42px] items-center gap-x-1 gap-y-4 text-[10px] leading-4 text-[#17273C] min-[480px]:@min-[23rem]:w-auto min-[480px]:@min-[23rem]:flex-1">
                    {roles.map(r => (
                        <li key={r.label} className="contents">
                            <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: r.color}}
                                  aria-hidden="true"/>
                            <span className="min-w-0 whitespace-nowrap">{r.label}</span>
                            <span
                                className="text-right font-semibold whitespace-nowrap tabular-nums">{number.format(r.count)}</span>
                            <span
                                className="w-11.5 text-right whitespace-nowrap tabular-nums">({((r.count / total) * 100).toFixed(1)}%)</span>
                        </li>
                    ))}
                </ul>
            </div>
        </Panel>
    );
}

function RecentRegistrations() {
    const cell = 'px-3 py-2.5 align-middle @max-[29rem]:px-2';
    const compactHidden = '@max-[29rem]:hidden';
    return (
        <Panel title="Recent Temple Registrations" icon="landmark-dome" to="/temples" className="@container">
            <div className="relative overflow-x-auto rounded-lg border border-[#eaf0f3]" tabIndex={0}
                 aria-label="Recent temple registrations table">
                <table
                    className="w-full min-w-115 border-collapse @max-[29rem]:min-w-0 text-left text-xs leading-4 text-[#17273C]">
                    <thead className="bg-[#F3F7FC]">
                    <tr>
                        {['Date', 'Temple Name', 'Location', 'Status'].map(t => <th key={t} scope="col"
                                                                                    className={`px-3 py-2.5 font-semibold whitespace-nowrap @max-[29rem]:px-2 ${t === 'Date' || t === 'Location' ? compactHidden : ''}`}>{t}</th>)}
                        <th scope="col" className="px-3 py-2.5 @max-[29rem]:px-2"><span
                            className="sr-only">Actions</span></th>
                    </tr>
                    </thead>
                    <tbody>
                    {registrations.map(row => (
                        <tr key={row.id} className="border-t border-[#EEF0F3]">
                            <td className={`${cell} whitespace-nowrap ${compactHidden}`}>{row.date}</td>
                            <td className={cell}>
                  <span className="flex items-center gap-2.5 font-semibold">
                    <img src="/temple-register.png" alt="" className="size-7 shrink-0 rounded-[5px] object-cover"/>
                    <span className="min-w-0">
                      {row.temple}
                        <span
                            className="hidden text-[11px] leading-4 font-normal text-[#1F5FA8] @max-[29rem]:block">{row.location} · <span
                            className="whitespace-nowrap">{row.date}</span></span>
                    </span>
                  </span>
                            </td>
                            <td className={`${cell} ${compactHidden}`}>{row.location}</td>
                            <td className={cell}><Badge>{row.status}</Badge></td>
                            <td className={`${cell} text-center`}>
                                <Link to={`/temples?registration=${row.id}`}
                                      aria-label={`View registration for ${row.temple}`}
                                      className={`inline-flex rounded p-0.5 hover:bg-[#eef3f5] @max-[29rem]:p-1.5 ${focus}`}><MoreHorizontal
                                    size={16}/></Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </Panel>
    );
}

function PlatformActivities() {
    return (
        <Panel title="Latest Platform Activities" icon="bell" to="/notifications" linkLabel="View all">
            <ul className="divide-y rounded-lg border border-[#eaf0f3] px-3">
                {activities.map(item => (
                    <li key={item.id} className="flex items-center gap-3 py-2.5">
            <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tones[item.tone].soft} ${tones[item.tone].ink}`}>
              <Glyph name={item.icon} className="h-4.5 w-4.5"/>
            </span>
                        <span className="min-w-0 flex-1">
              <span className="block text-xs leading-4.5 font-bold text-[#17273C]">{item.title}</span>
              <span className="block text-[11px] leading-4 text-[#1F5FA8]">{item.detail}</span>
            </span>
                        <span
                            className="self-start pt-1 text-[11px] whitespace-nowrap text-[#4A5A66]">{item.time}</span>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

export default function SuperAdminSections() {
    return (
        <div className="-mt-2 grid gap-3 font-lora text-[#17273C]"
             style={{fontFamily: '"SuperAdmin Lora", Lora, Georgia, serif'}}>
            <SummaryCards/>
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
                <RegistrationWorkflow/>
                <QuickActions/>
            </div>
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
                <RegistrationTrends/>
                <UsersByRole/>
            </div>
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
                <RecentRegistrations/>
                <PlatformActivities/>
            </div>
        </div>
    );
}