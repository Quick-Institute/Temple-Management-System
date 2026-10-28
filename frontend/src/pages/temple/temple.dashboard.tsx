import {useState} from 'react'
import {
    ArrowRight,
    ArrowRightLeft,
    CalendarDays,
    Check,
    ChevronRight,
    CircleAlert,
    Clock,
    Coins,
    HandCoins,
    Lightbulb,
    MapPin,
    QrCode,
    Sparkles,
    Sun,
    Sunset,
    Users2,
    X,
} from 'lucide-react'
import {AppShell} from '../../layouts/AppShell'
import {DanaCalendar} from '../../components/Calendar'
import type {DanaSession} from '../../data/demo'
import {
    attentionItems,
    currentTemple,
    currentUser,
    danaDays,
    danaStats,
    donations,
    donationTotals,
    events,
    lkr,
    longDate,
    notifications,
    prettyDate,
    sessionStatus,
} from '../../data/demo'

const StatCard = ({icon, label, value, foot, tone = 'green'}: {
    icon: React.ReactNode
    label: string
    value: string | number
    foot: string
    tone?: 'green' | 'gold' | 'blue' | 'rose' | 'neutral'
}) => {
    const tones = {
        green: 'bg-sage-50 text-sage-700',
        gold: 'bg-gold-50 text-gold-700',
        blue: 'bg-sky-50 text-status-blue',
        rose: 'bg-lotus-50 text-status-rose',
        neutral: 'bg-cream-deep text-ink-soft',
    }
    return (
        <div className="card p-4">
            <span className={`grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}>{icon}</span>
            <div className="mt-3 text-[0.78rem] font-semibold text-muted">{label}</div>
            <div className="mt-0.5 font-temple text-[1.4rem] leading-tight text-sage-900">{value}</div>
            <div className="mt-0.5 text-[0.74rem] text-muted">{foot}</div>
        </div>
    )
}

const Progress = ({value, tone = 'sage'}: { value: number; tone?: 'sage' | 'gold' }) => (
    <div className="progress-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${tone === 'gold' ? 'bg-gold-500' : 'bg-sage-600'}`}
             style={{width: `${Math.min(100, value)}%`}}/>
    </div>
)

const badgeFor = (status: string) => {
    if (status === 'Full') return 'badge badge-amber'
    if (status === 'Open') return 'badge badge-green'
    return 'badge badge-neutral'
}

const attentionIcon = {
    dana: <HandCoins size={17}/>,
    transfer: <ArrowRightLeft size={17}/>,
    idea: <Lightbulb size={17}/>,
    donation: <Coins size={17}/>,
}

export const TempleDashboardPage = () => {
    const [session, setSession] = useState<{ day: string; session: DanaSession } | null>(null)
    const today = danaDays[0]
    const [calendarDay, setCalendarDay] = useState(today.date)
    const selectedDay = danaDays.find((d) => d.date === calendarDay) ?? today
    const nextEvents = events.slice(0, 3)
    const verified = donations.filter((d) => d.status === 'Verified')

    return (
        <AppShell>
            {/* Greeting */}
            <header className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="eyebrow">{currentTemple.registerCode} · {currentTemple.village}</div>
                    <h1 className="mt-1.5 font-temple text-[1.7rem] leading-tight text-sage-900 sm:text-[2rem]">
                        Ayubowan, {currentUser.shortName}
                    </h1>
                    <p className="mt-1.5 text-[0.92rem] text-muted">
                        {currentTemple.name} · {longDate(today.date)} - here is what needs your attention today.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button className="btn btn-outline btn-sm"><CalendarDays size={16}/> Reports</button>
                    <button className="btn btn-primary btn-sm"><HandCoins size={16}/> Open Dana session</button>
                </div>
            </header>

            {/* Hero */}
            <section className="mb-5 overflow-hidden rounded-2xl border border-line">
                <div className="relative px-5 py-5 text-sage-50 sm:px-7 sm:py-6"
                     style={{
                         backgroundImage: 'linear-gradient(100deg, rgba(58,18,11,.94), rgba(122,42,27,.84)), url(/images/temple-bg.jpg)',
                         backgroundSize: 'cover',
                         backgroundPosition: 'center',
                     }}>
                    <span className="badge badge-gold"><Sparkles size={13}/> Vap Poya in 2 days - 24 October</span>
                    <h2 className="mt-3 max-w-[46ch] font-temple text-[1.4rem] leading-snug text-white sm:text-[1.55rem]">
                        “Appamādo amatapadaṃ - heedfulness is the path to the deathless.”
                    </h2>
                    <p className="mt-2 max-w-[62ch] text-[0.9rem] text-sage-100">
                        240 devotees are expected on Poya day. Both Dana sessions are
                        full, {attentionItems[0].title.split(' ')[0]} bookings
                        await approval, and 2 families have asked to transfer to this temple.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                        <button className="btn btn-gold btn-sm">Review bookings <ArrowRight size={16}/></button>
                        <button
                            className="btn btn-outline btn-sm border-white/40! bg-white/10! text-white! hover:bg-white/20!">
                            Poya programme
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard icon={<Users2 size={18}/>} label="Registered families" value={currentTemple.families}
                          foot="+18 this month"/>
                <StatCard icon={<HandCoins size={18}/>} label="Dana bookings" value={danaStats.bookedThisWeek}
                          foot={`${danaStats.capacityUsed}% capacity used`} tone="gold"/>
                <StatCard icon={<Coins size={18}/>} label="Donations (Oct)" value={lkr(donationTotals.october)}
                          foot="+16% vs September" tone="blue"/>
                <StatCard icon={<CircleAlert size={18}/>} label="Needs attention" value={attentionItems.length}
                          foot="2 approvals · 2 transfers" tone="rose"/>
                <StatCard icon={<CalendarDays size={18}/>} label="Upcoming events" value={nextEvents.length}
                          foot="1 awaiting approval" tone="neutral"/>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
                <div className="flex min-w-0 flex-col gap-5">
                    <section className="card p-5">
                        <div className="mb-1 flex items-baseline justify-between gap-2">
                            <h2 className="font-temple text-[1.05rem] text-sage-900">Dana calendar</h2>
                            <span className="text-[0.72rem] text-muted">Tap a day</span>
                        </div>
                        <DanaCalendar selected={calendarDay} onSelect={setCalendarDay} today={today.date}/>
                        <div className="mt-3 rounded-xl border border-sage-100 bg-sage-50/60 p-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className="text-[0.86rem] font-semibold text-sage-900">{longDate(selectedDay.date)}</span>
                                {selectedDay.note && <span className="badge badge-gold">{selectedDay.note}</span>}
                            </div>
                            <div className="mt-2 grid gap-1.5">
                                {selectedDay.sessions.map((s) => (
                                    <button key={s.key} onClick={() => setSession({day: selectedDay.date, session: s})}
                                            className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-left text-[0.76rem] hover:bg-cream">
                                        {s.key === 'morning' ? <Sun size={13} className="flex-none text-gold-700"/> :
                                            <Sunset size={13} className="flex-none text-status-blue"/>}
                                        <span
                                            className="text-ink-soft">{s.key === 'morning' ? 'Morning' : 'Afternoon'}</span>
                                        <span
                                            className="ml-auto font-bold text-sage-900">{s.families.length}/{s.capacity}</span>
                                        <span
                                            className={`${badgeFor(sessionStatus(s))} px-1.5! py-0! text-[0.62rem]!`}>{sessionStatus(s)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Dana slots */}
                    <section className="card overflow-hidden">
                        <div
                            className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft px-5 py-3.5">
                            <div>
                                <h2 className="font-temple text-[1.1rem] text-sage-900">Dana slots - next 7 days</h2>
                                <p className="text-[0.78rem] text-muted">Morning and afternoon sessions are counted
                                    separately. Tap a session for the names.</p>
                            </div>
                            <button className="btn btn-ghost btn-sm">Manage <ChevronRight size={15}/></button>
                        </div>

                        <div className="flex flex-col divide-y divide-line-soft">
                            {danaDays.map((d) => (
                                <div key={d.date} className="px-5 py-3">
                                    <div className="flex flex-wrap items-baseline gap-2">
                                        <span
                                            className="text-[0.88rem] font-semibold text-sage-900">{longDate(d.date)}</span>
                                        {d.date === today.date && <span className="badge badge-gold">Today</span>}
                                        {d.note && d.date !== today.date &&
                                            <span className="text-[0.74rem] text-gold-700">{d.note}</span>}
                                    </div>
                                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                        {d.sessions.map((s) => {
                                            const booked = s.families.length
                                            const status = sessionStatus(s)
                                            const pct = Math.round((booked / s.capacity) * 100)
                                            return (
                                                <button key={s.key}
                                                        onClick={() => setSession({day: d.date, session: s})}
                                                        className="rounded-xl border border-line bg-white px-3 py-2.5 text-left transition hover:border-sage-400 hover:bg-sage-50/60">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`grid h-7 w-7 flex-none place-items-center rounded-lg ${
                                                                s.key === 'morning' ? 'bg-gold-100 text-gold-700' : 'bg-sky-100 text-status-blue'}`}>
                                                            {s.key === 'morning' ? <Sun size={14}/> :
                                                                <Sunset size={14}/>}
                                                        </span>
                                                        <span
                                                            className="text-[0.84rem] font-semibold text-sage-900">{s.label}</span>
                                                        <span className={`${badgeFor(status)} ml-auto`}>{status}</span>
                                                    </div>
                                                    <div
                                                        className="mt-1.5 text-[0.72rem] text-muted">{s.time} · {booked} of {s.capacity} families
                                                    </div>
                                                    <div className="mt-1.5"><Progress value={pct}
                                                                                      tone={status === 'Full' ? 'gold' : 'sage'}/>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Needs attention */}
                    <section className="card overflow-hidden">
                        <div className="border-b border-line-soft px-5 py-3.5">
                            <h2 className="font-temple text-[1.1rem] text-sage-900">Needs your attention</h2>
                            <p className="text-[0.78rem] text-muted">Actions only the Main Admin can approve</p>
                        </div>
                        <div className="divide-y divide-line-soft">
                            {attentionItems.map((item) => (
                                <div key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                                    <span
                                        className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-sand-50 text-gold-700">
                                        {attentionIcon[item.tone]}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[0.88rem] font-semibold text-sage-900">{item.title}</div>
                                        <div className="truncate text-[0.76rem] text-muted">{item.detail}</div>
                                    </div>
                                    <button className="btn btn-outline btn-sm">{item.action}</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent donations */}
                    <section className="card overflow-hidden">
                        <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
                            <div>
                                <h2 className="font-temple text-[1.1rem] text-sage-900">Recent donations</h2>
                                <p className="text-[0.78rem] text-muted">{verified.length} verified payments this
                                    week</p>
                            </div>
                            <button className="btn btn-ghost btn-sm">All donations</button>
                        </div>
                        <div className="table-wrap">
                            <table className="tbl">
                                <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Donor</th>
                                    <th>Purpose</th>
                                    <th>Method</th>
                                    <th className="text-right">Amount</th>
                                </tr>
                                </thead>
                                <tbody>
                                {donations.map((d) => (
                                    <tr key={d.id}>
                                        <td className="mono text-[0.78rem]">{d.reference}</td>
                                        <td>
                                            <div className="font-semibold">{d.donor}</div>
                                            <div className="mono text-[0.7rem] text-muted">{d.familyId}</div>
                                        </td>
                                        <td className="text-[0.84rem] text-ink-soft">{d.purpose}</td>
                                        <td className="text-[0.82rem]">{d.method}</td>
                                        <td className="mono text-right font-semibold">{lkr(d.amount)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Right column */}
                <div className="flex min-w-0 flex-col gap-5">
                    <section className="card p-5">
                        <h2 className="font-temple text-[1.05rem] text-sage-900">Family registration</h2>
                        <p className="text-[0.78rem] text-muted">QR code for the notice board</p>
                        <div className="mt-3 flex items-start gap-3">
                            <span
                                className="grid h-20 w-20 flex-none place-items-center rounded-xl border border-line bg-white text-sage-800">
                                <QrCode size={44}/>
                            </span>
                            <div>
                                <div
                                    className="mono text-[0.86rem] font-semibold text-sage-900">{currentTemple.registerCode}</div>
                                <p className="mt-1 text-[0.8rem] text-ink-soft">
                                    Families scan to join {currentTemple.name}. Registrations arrive for committee
                                    approval.
                                </p>
                            </div>
                        </div>
                        <button className="btn btn-outline btn-sm mt-3 w-full">Print registration sheet</button>
                    </section>

                    <section className="card overflow-hidden">
                        <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
                            <div>
                                <h2 className="font-temple text-[1.05rem] text-sage-900">Upcoming events</h2>
                                <p className="text-[0.78rem] text-muted">Programme calendar</p>
                            </div>
                            <button className="btn btn-ghost btn-sm">Calendar</button>
                        </div>
                        <div className="flex flex-col gap-3 px-5 py-4">
                            {nextEvents.map((e) => (
                                <div key={e.id} className="flex items-start gap-3">
                                    <div
                                        className="grid h-11 w-11 flex-none place-items-center rounded-lg bg-gold-50 text-center text-gold-700">
                                        <span
                                            className="text-[0.58rem] font-bold uppercase">{prettyDate(e.date).split(' ')[1]}</span>
                                        <span
                                            className="font-temple text-[1rem] leading-none">{prettyDate(e.date).split(' ')[0]}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[0.87rem] font-semibold text-sage-900">{e.title}</div>
                                        <div className="text-[0.74rem] text-muted">{e.time} · {e.venue}</div>
                                    </div>
                                    {e.status === 'Pending' &&
                                        <span className="badge badge-amber ml-auto">Approval</span>}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="card overflow-hidden">
                        <div className="border-b border-line-soft px-5 py-3.5">
                            <h2 className="font-temple text-[1.05rem] text-sage-900">Latest notifications</h2>
                            <p className="text-[0.78rem] text-muted">{notifications.filter((n) => !n.read).length} unread
                                · web notifications</p>
                        </div>
                        <div className="divide-y divide-line-soft">
                            {notifications.slice(0, 3).map((n) => (
                                <div key={n.id} className={`px-5 py-3 ${!n.read ? 'bg-sage-50/50' : ''}`}>
                                    <div className="text-[0.85rem] font-semibold text-sage-900">{n.title}</div>
                                    <div className="text-[0.77rem] text-ink-soft">{n.body}</div>
                                    <div className="mt-0.5 text-[0.7rem] text-muted">{n.time}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="info-note">
                        <MapPin size={16} className="mt-0.5 flex-none text-gold-700"/>
                        <span>{currentTemple.village}, {currentTemple.district} {currentTemple.postalCode} · {currentTemple.phone}</span>
                    </div>
                </div>
            </div>

            {/* Dana names panel */}
            {session && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-sage-950/45 p-4" role="dialog"
                     aria-modal="true"
                     onClick={() => setSession(null)}>
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-paper shadow-2xl"
                         onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
                            <span
                                className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-gold-100 text-gold-700">
                                <HandCoins size={18}/>
                            </span>
                            <div>
                                <div className="font-temple text-[1.05rem] text-sage-900">{session.session.label}</div>
                                <div className="text-[0.76rem] text-muted">
                                    {longDate(session.day)} · {session.session.time} · {session.session.families.length} of {session.session.capacity} families
                                </div>
                            </div>
                            <button className="btn btn-ghost btn-sm ml-auto" onClick={() => setSession(null)}
                                    aria-label="Close">
                                <X size={16}/>
                            </button>
                        </div>
                        <div className="max-h-[55vh] overflow-y-auto">
                            {session.session.families.length === 0 ? (
                                <p className="px-5 py-6 text-center text-[0.86rem] text-muted">No family has booked this
                                    session yet.</p>
                            ) : (
                                <table className="tbl">
                                    <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Familiar name</th>
                                        <th>Family</th>
                                        <th className="text-right">Guests</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {session.session.families.map((f, index) => (
                                        <tr key={`${f.id}-${index}`}>
                                            <td className="mono text-[0.76rem] text-muted">{index + 1}</td>
                                            <td className="font-semibold text-sage-900">{f.familiarName}</td>
                                            <td>
                                                <div className="text-[0.84rem]">{f.familyName}</div>
                                                <div className="mono text-[0.72rem] text-muted">{f.id}</div>
                                            </td>
                                            <td className="text-right font-semibold">{f.guests}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div
                            className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-cream px-5 py-3">
                            <span className="inline-flex items-center gap-1.5 text-[0.74rem] text-muted">
                                <Clock size={13}/> Total guests:
                                <strong
                                    className="text-sage-900">{session.session.families.reduce((sum, f) => sum + f.guests, 0)}</strong>
                            </span>
                            <button className="btn btn-outline btn-sm" onClick={() => setSession(null)}>
                                <Check size={14}/> Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    )
}