import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCircle2, ChevronRight, Megaphone,
  Search, Users, X, AlertTriangle,
} from 'lucide-react'
import { useAnnouncements, type Announcement } from '../../../data/announcementStore'
import { useAuth } from '../../../context/AuthContext'

const formatDate = (date: string) => date
  ? new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  : 'Date not set'

const UserAnnouncementsPage = () => {
  const [announcements] = useAnnouncements()
  const { user } = useAuth()
  const currentUserGroups = useMemo(() => {
    switch (user?.role) {
      case 'family': return ['All Community', 'Families']
      case 'committeeRepresentative': return ['All Community', 'Committee Members']
      case 'religiousRepresentative': return ['All Community', 'Monks']
      case 'templeAdmin':
      case 'coAdmin':
      case 'superAdmin': return ['All Community', 'Families', 'Committee Members', 'Volunteers', 'Monks']
      default: return ['All Community']
    }
  }, [user?.role])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | 'Published' | 'Cancelled'>('All')
  const [selected, setSelected] = useState<Announcement | null>(null)
  const navigate = useNavigate()

  const visibleAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase()
    return announcements
      .filter(item => item.status === 'Published' || item.status === 'Cancelled')
      .filter(item => currentUserGroups.includes(item.audience))
      .filter(item => filter === 'All' || item.status === filter)
      .filter(item => `${item.title} ${item.description} ${item.audience}`.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [announcements, currentUserGroups, filter, search])

  const cancelledCount = visibleAnnouncements.filter(item => item.status === 'Cancelled').length

  return (
    <main className="min-h-screen tms-communications-page space-y-5 p-3 sm:space-y-6 sm:p-5 lg:p-8">

      <style>{`
        .tms-communications-page {
          --tms-navy: #12334b;
          --tms-blue: #0876ad;
          --tms-border: #e2edf5;
          color: var(--tms-navy);
          padding: 16px 20px 24px;
          background: #f7fafd;
        }
        .tms-communications-page h1 { color: var(--tms-navy); letter-spacing: -.025em; }
        .tms-communications-page h2 { color: var(--tms-navy); }
        .tms-communications-page .tms-hero {
          position: relative; overflow: hidden; isolation: isolate;
          min-height: 110px; padding: 26px 30px; border-radius: 19px;
          background: linear-gradient(105deg, #075985 0%, #087db8 52%, #38a9d7 100%);
          box-shadow: 0 12px 28px -14px rgba(2, 100, 160, .48);
        }
        .tms-communications-page .tms-stat-card {
          min-width: 0; border: 1px solid var(--tms-border); border-radius: 17px;
          padding: 18px 20px; background: linear-gradient(135deg, #eff8ff, #fff);
          box-shadow: 0 4px 15px rgba(15, 50, 80, .045);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .tms-communications-page .tms-stat-card:hover {
          transform: translateY(-2px); box-shadow: 0 10px 24px rgba(15, 50, 80, .09);
        }
        .tms-communications-page .tms-stat-card:nth-child(2) { background: linear-gradient(135deg, #effcf4, #fff); }
        .tms-communications-page .tms-stat-card:nth-child(3) { background: linear-gradient(135deg, #fff8eb, #fff); }
        .tms-communications-page .tms-stat-card:nth-child(4) { background: linear-gradient(135deg, #f5f0ff, #fff); }
        .tms-communications-page .tms-panel {
          overflow: hidden; border: 1px solid var(--tms-border); border-radius: 20px;
          background: #fff; box-shadow: 0 7px 25px rgba(15, 50, 80, .045);
        }
        .tms-communications-page input:not([type=checkbox]),
        .tms-communications-page select, .tms-communications-page textarea {
          border-color: #dce8f1; border-radius: 11px;
        }
        .tms-communications-page input:not([type=checkbox]):focus,
        .tms-communications-page select:focus, .tms-communications-page textarea:focus {
          border-color: #38a5d8; box-shadow: 0 0 0 4px rgba(56, 165, 216, .12);
        }
        .tms-communications-page button { transition-duration: 180ms; }
        .tms-communications-page button:focus-visible,
        .tms-communications-page input:focus-visible,
        .tms-communications-page select:focus-visible,
        .tms-communications-page textarea:focus-visible { outline: 2px solid #38a5d8; outline-offset: 2px; }
        .tms-communications-page [role=tablist] { border: 1px solid #e5edf4; background: #f3f7fb; }
        .tms-communications-page table thead { background: #f3f8fc; }
        .tms-communications-page table tbody tr { transition: background .15s ease; }
        .tms-communications-page table tbody tr:hover { background: #f2f9fd; }
        @media (max-width: 640px) {
          .tms-communications-page { padding: 12px 12px 20px; }
          .tms-communications-page .tms-hero { min-height: 0; padding: 22px 20px; border-radius: 16px; }
          .tms-communications-page .tms-stat-card { padding: 15px 16px; }
        }
      `}</style>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
            <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-sky-700">Community</button>
            <ChevronRight size={14} />
            <span className="font-medium text-[#0C4A6E]">Announcements</span>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#0C4A6E] sm:text-3xl">Community Announcements</h1>
          <p className="mt-1 text-sm text-slate-500">Important updates and notices from your temple.</p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-xl border border-[#D8E8F3] bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
          <Bell size={17} className="text-sky-700" /> Community updates
        </div>
      </div>

      <section className="tms-hero relative isolate overflow-hidden rounded-2xl bg-gradient-to-r from-sky-800 via-sky-600 to-cyan-500 p-5 text-white shadow-lg shadow-sky-900/10 sm:p-7 lg:p-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-sky-50"><Megaphone size={14} /> TEMPLE COMMUNITY</span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Stay Connected With Your Temple</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-sky-50">Find the latest temple notices, programme updates and important community information in one place.</p>
        </div>
        <Megaphone size={150} strokeWidth={1} className="absolute right-5 bottom-0 hidden rotate-[-12deg] text-white/15 sm:block" />
        <div className="absolute -right-12 -bottom-16 -z-0 h-64 w-64 rounded-full border-[35px] border-white/10" />
      </section>

      {cancelledCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4" role="status">
          <span className="rounded-lg bg-white p-2 text-rose-600"><AlertTriangle size={18} /></span>
          <div className="min-w-0"><p className="text-sm font-semibold text-rose-800">Important cancellation update</p><p className="mt-1 text-sm leading-5 text-rose-700">One or more announcements have been cancelled. Please check the notices marked “Cancelled” below.</p></div>
        </div>
      )}

      <section className="tms-panel overflow-hidden rounded-2xl border border-[#D8E8F3] bg-white shadow-sm">
        <div className="border-b border-[#D8E8F3] p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-semibold text-[#0C4A6E] sm:text-xl">Latest Notices</h2><p className="mt-1 text-sm text-slate-500">Only announcements shared with your audience are shown.</p></div>
            <span className="text-xs text-slate-500 sm:text-sm">{visibleAnnouncements.length} notices</span>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1"><Search size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" /><input value={search} onChange={event => setSearch(event.target.value)} type="search" placeholder="Search announcements..." className="min-h-11 w-full rounded-xl border border-[#D8E8F3] bg-[#F7FBFE] py-3 pr-4 pl-10 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" /></div>
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-cream p-1" role="tablist" aria-label="Announcement filter">
              {(['All', 'Published', 'Cancelled'] as const).map(value => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={`min-h-9 shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${filter === value ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-500 hover:text-sky-800'}`}>{value === 'Published' ? 'Active' : value}</button>)}
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-3 sm:gap-4 sm:p-5 lg:grid-cols-2">
          {visibleAnnouncements.length === 0 ? (
            <div className="col-span-full flex flex-col items-center px-5 py-14 text-center"><div className="mb-4 rounded-2xl bg-sky-50 p-4 text-sky-700"><Megaphone size={30} /></div><h3 className="text-lg font-semibold text-[#0C4A6E]">No announcements found</h3><p className="mt-1 max-w-sm text-sm text-slate-500">There are no notices matching your search or selected filter.</p>{search && <button type="button" onClick={() => setSearch('')} className="mt-4 rounded-lg border border-[#D8E8F3] px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50">Clear search</button>}</div>
          ) : visibleAnnouncements.map(item => (
            <article key={item.id} className={`overflow-hidden rounded-2xl border bg-white transition hover:shadow-md ${item.status === 'Cancelled' ? 'border-rose-200' : 'border-[#D8E8F3] hover:border-sky-200'}`}>
              {item.image && <img src={item.image} alt={`Announcement: ${item.title}`} className={`max-h-56 w-full object-cover ${item.status === 'Cancelled' ? 'grayscale' : ''}`} />}
              <div className="p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  {item.status === 'Cancelled' ? <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200"><X size={13} /> Cancelled</span> : <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200"><CheckCircle2 size={13} /> Announcement</span>}
                  <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
                </div>
                <h3 className={`text-base font-semibold leading-snug sm:text-lg ${item.status === 'Cancelled' ? 'text-slate-600' : 'text-[#0C4A6E]'}`}>{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{item.description}</p>
                {item.status === 'Cancelled' && <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/80 p-3"><p className="text-xs font-semibold text-rose-800">Cancellation notice</p><p className="mt-1 text-sm leading-5 text-rose-700">{item.cancellationReason || 'This announcement has been cancelled.'}</p></div>}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sky-100 pt-3"><span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><Users size={14} className="text-sky-600" />{item.audience}</span><button type="button" onClick={() => setSelected(item)} className={`inline-flex min-h-9 items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold ${item.status === 'Cancelled' ? 'text-rose-700 hover:bg-rose-50' : 'text-sky-700 hover:bg-sky-50'}`}>View details <ChevronRight size={14} /></button></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null) }}>
        <section className="max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
          <div className={`flex items-center justify-between border-b p-4 sm:p-5 ${selected.status === 'Cancelled' ? 'border-rose-100 bg-rose-50' : 'border-[#D8E8F3] bg-gradient-to-r from-sky-50 to-white'}`}><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Announcement details</p><h2 className="mt-1 font-semibold text-[#0C4A6E]">{selected.status === 'Cancelled' ? 'Cancellation update' : 'Community notice'}</h2></div><button type="button" onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-500 hover:bg-white" aria-label="Close details"><X size={20} /></button></div>
          <div className="space-y-4 p-4 sm:p-6">{selected.image && <img src={selected.image} alt={`Announcement: ${selected.title}`} className={`max-h-80 w-full rounded-xl object-cover ${selected.status === 'Cancelled' ? 'grayscale' : ''}`} />}<div>{selected.status === 'Cancelled' ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">Cancelled</span> : <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">Published</span>}<h3 className="mt-3 text-xl font-semibold leading-snug text-[#0C4A6E] sm:text-2xl">{selected.title}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{selected.description}</p></div>
            {selected.status === 'Cancelled' && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4"><div className="flex items-center gap-2 text-rose-800"><AlertTriangle size={17} /><p className="text-sm font-semibold">This announcement has been cancelled</p></div><p className="mt-2 text-sm leading-6 text-rose-700">{selected.cancellationReason || 'This announcement has been cancelled.'}</p>{selected.cancelledAt && <p className="mt-2 text-xs text-rose-600">Updated {new Date(selected.cancelledAt).toLocaleString()}</p>}</div>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Detail label="Announcement date" value={formatDate(selected.date)} /><Detail label="Audience" value={selected.audience} /><Detail label="Shared by" value={selected.author} /><Detail label="Status" value={selected.status} /></div>
            <div className="flex justify-end border-t border-[#D8E8F3] pt-4"><button type="button" onClick={() => setSelected(null)} className="min-h-11 rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800">Close</button></div>
          </div>
        </section>
      </div>}
    </main>
  )
}

const Detail = ({ label, value }: { label: string; value: string }) => <div className="rounded-xl border border-[#D8E8F3] bg-[#F7FBFE] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-semibold text-[#0C4A6E]">{value}</p></div>

export default UserAnnouncementsPage
