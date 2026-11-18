import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { useAnnouncements, createAnnouncementSystemNotification, type Announcement, type AnnouncementStatus } from '../../../data/announcementStore'
import { usePermissions } from '../../../hooks/usePermissions'
import { useAuth } from '../../../context/AuthContext'
import { useActiveTemple } from '../../../hooks/useActiveTemple'
import {
  Megaphone, Plus, Search, CalendarDays, Users, Eye, Pencil, Trash2, X,
  Send, CheckCircle2, FileText, Sparkles, ChevronLeft, ChevronRight,
  MoreHorizontal, ArrowUpRight, ImagePlus, Upload,
  AlertCircle,
} from 'lucide-react'

type AnnouncementForm = {
  title: string
  description: string
  audience: string
  date: string
  image: string
}

const audiences = ['All Community', 'Families', 'Committee Members', 'Volunteers', 'Monks']
const todayISO = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const emptyForm: AnnouncementForm = {
  title: '', description: '', audience: 'All Community', date: todayISO(), image: '',
}
const statusStyles: Record<AnnouncementStatus, string> = {
  Published: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Draft: 'bg-amber-100 text-amber-800 ring-amber-200',
  Cancelled: 'bg-rose-100 text-rose-800 ring-rose-200',
}
const audienceStyles = (audience: string) => {
  if (audience === 'Families') return 'bg-violet-50 text-violet-700 ring-violet-200'
  if (audience === 'Volunteers') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (audience === 'Monks') return 'bg-amber-50 text-amber-800 ring-amber-200'
  if (audience === 'Committee Members') return 'bg-indigo-50 text-indigo-700 ring-indigo-200'
  return 'bg-sky-50 text-sky-700 ring-sky-200'
}
const formatDate = (date: string) => date
  ? new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : 'Not set'
const getDateParts = (date: string) => {
  const parsed = date ? new Date(`${date}T00:00:00`) : new Date()
  return { day: parsed.getDate(), month: parsed.toLocaleDateString('en-US', { month: 'short' }), year: parsed.getFullYear() }
}

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useAnnouncements()
  const { can, canEdit } = usePermissions()
  const { user } = useAuth()
  const { temple } = useActiveTemple()
  const canManageAnnouncements = canEdit('manageAnnouncements')
  // The agreed project rule allows Temple Admin and Co-Admin to create announcements.
  const canCreateAnnouncements = can('manageAnnouncements') &&
    (user?.role === 'templeAdmin' || user?.role === 'coAdmin' || user?.role === 'superAdmin')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'All' | AnnouncementStatus>('All')
  const [audienceFilter, setAudienceFilter] = useState('All Audiences')
  const [dateFilter, setDateFilter] = useState<'All Dates' | 'Upcoming' | 'Past'>('All Dates')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [viewing, setViewing] = useState<Announcement | null>(null)
  const [menuId, setMenuId] = useState<number | null>(null)
  const [form, setForm] = useState<AnnouncementForm>(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitStatus, setSubmitStatus] = useState<AnnouncementStatus>('Published')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [showPreview, setShowPreview] = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [initialForm, setInitialForm] = useState<AnnouncementForm>(emptyForm)

  const publishedCount = announcements.filter(item => item.status === 'Published').length
  const draftCount = announcements.filter(item => item.status === 'Draft').length
  const cancelledCount = announcements.filter(item => item.status === 'Cancelled').length
  const filteredAnnouncements = useMemo(() => {
    const query = search.toLowerCase().trim()
    return announcements.filter(item => {
      const matchesSearch = `${item.title} ${item.description} ${item.audience} ${item.author}`.toLowerCase().includes(query)
      const matchesAudience = audienceFilter === 'All Audiences' || item.audience === audienceFilter
      const matchesDate = dateFilter === 'All Dates' || (dateFilter === 'Upcoming' ? item.date >= todayISO() : item.date < todayISO())
      return matchesSearch && matchesAudience && matchesDate && (activeTab === 'All' || item.status === activeTab)
    })
  }, [announcements, search, activeTab, audienceFilter, dateFilter])
  const tabs = ['All', 'Published', 'Draft', 'Cancelled'] as const
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm)

  const openCreateModal = () => {
    if (!canCreateAnnouncements) return
    const nextForm = { ...emptyForm, date: todayISO() }; setInitialForm(nextForm)
    setEditingId(null); setForm(nextForm); setSubmitStatus('Published')
    setFormError(''); setCalendarOpen(false); setShowPreview(false); setConfirmPublish(false); setIsModalOpen(true)
  }
  const openEditModal = (item: Announcement) => {
    if (!canManageAnnouncements) return
    setEditingId(item.id)
    const nextForm = { title: item.title, description: item.description, audience: item.audience, date: item.date, image: item.image ?? '' }; setInitialForm(nextForm)
    setForm(nextForm)
    setSubmitStatus(item.status); setFormError(''); setCalendarOpen(false); setShowPreview(false); setConfirmPublish(false); setIsModalOpen(true); setMenuId(null)
  }
  const closeModal = (force = false) => {
    if (!force && isDirty && !window.confirm('Discard your unsaved announcement changes?')) return
    setIsModalOpen(false); setEditingId(null); setForm(emptyForm); setInitialForm(emptyForm); setFormError(''); setCalendarOpen(false); setShowPreview(false); setConfirmPublish(false)
  }
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFormError('Please choose a JPG, PNG or WEBP image.')
      event.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size must be 5 MB or less.')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setForm(previous => ({ ...previous, image: String(reader.result ?? '') }))
      setFormError('')
    }
    reader.onerror = () => setFormError('Unable to read this image. Please try another file.')
    reader.readAsDataURL(file)
    event.target.value = ''
  }
  const saveAnnouncement = (status: AnnouncementStatus) => {
    if (editingId !== null ? !canManageAnnouncements : !canCreateAnnouncements) return
    if (!form.title.trim() || !form.description.trim() || !form.date) {
      setFormError('Please complete the title, message and announcement date.')
      setConfirmPublish(false)
      return
    }
    const cleanForm = { ...form, title: form.title.trim(), description: form.description.trim() }
    const existingAnnouncement = editingId !== null
      ? announcements.find(item => item.id === editingId)
      : undefined
    const savedAnnouncement: Announcement = {
      id: editingId ?? Date.now(),
      ...cleanForm,
      status,
      author: existingAnnouncement?.author ?? user?.name ?? 'Temple Administrator',
    }
    if (editingId !== null) {
      setAnnouncements(previous => previous.map(item => item.id === editingId ? { ...item, ...cleanForm, status, cancelledAt: undefined, cancellationReason: undefined } : item))
    } else {
      setAnnouncements(previous => [savedAnnouncement, ...previous])
    }
    if (status === 'Published' && existingAnnouncement?.status !== 'Published') {
      createAnnouncementSystemNotification(temple?.id ?? 'unassigned', savedAnnouncement)
    }
    closeModal(true)
  }
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (!form.title.trim() || !form.description.trim() || !form.date) {
      setFormError('Please complete the title, message and announcement date.')
      return
    }
    setSubmitStatus('Published')
    setConfirmPublish(true)
  }
  const togglePublish = (item: Announcement) => {
    if (!canCreateAnnouncements) return
    if (item.status === 'Draft') {
      if (!window.confirm('Publish this announcement now? It will become visible to its selected audience.')) return
      setAnnouncements(previous => previous.map(announcement => announcement.id === item.id ? { ...announcement, status: 'Published', cancelledAt: undefined, cancellationReason: undefined } : announcement))
      createAnnouncementSystemNotification(temple?.id ?? 'unassigned', item)
    } else if (item.status === 'Cancelled') {
      if (!window.confirm('Restore this cancelled announcement as a draft?')) return
      setAnnouncements(previous => previous.map(announcement => announcement.id === item.id ? { ...announcement, status: 'Draft', cancelledAt: undefined, cancellationReason: undefined } : announcement))
    }
    setMenuId(null)
  }

  const cancelAnnouncement = (item: Announcement) => {
    if (!canManageAnnouncements) return
    const reason = window.prompt('Why is this announcement being cancelled? This reason will be shown to community users.', 'This announcement has been cancelled.')
    if (reason === null) return
    if (!window.confirm('Cancel this published announcement? Community users will see the cancellation notice.')) return
    setAnnouncements(previous => previous.map(announcement => announcement.id === item.id ? {
      ...announcement,
      status: 'Cancelled',
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason.trim() || 'This announcement has been cancelled.',
    } : announcement))
    setMenuId(null)
    if (viewing?.id === item.id) setViewing({ ...item, status: 'Cancelled', cancellationReason: reason.trim() || 'This announcement has been cancelled.' })
  }
  const deleteAnnouncement = (id: number) => {
    if (!canManageAnnouncements) return
    if (!window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) return
    setAnnouncements(previous => previous.filter(item => item.id !== id))
    setMenuId(null)
    if (viewing?.id === id) setViewing(null)
  }
  const selectDate = (day: number, month = calendarMonth) => {
    const selected = new Date(month.getFullYear(), month.getMonth(), day)
    const year = selected.getFullYear()
    const monthText = String(selected.getMonth() + 1).padStart(2, '0')
    const date = String(selected.getDate()).padStart(2, '0')
    setForm(previous => ({ ...previous, date: `${year}-${monthText}-${date}` }))
    setCalendarOpen(false)
  }
  const monthYear = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay()
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const calendarCells = [...Array.from({ length: firstDay }, () => null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)]

  return (
    <div className="min-h-screen tms-communications-page space-y-5 p-3 sm:space-y-6 sm:p-5 lg:p-8" onClick={() => menuId !== null && setMenuId(null)}>

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
        .tms-communications-page .tms-hero h2 { color: #ffffff; }
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
        .tms-communications-page .tms-stat-card:nth-child(4) { background: linear-gradient(135deg, #fff1f2, #fff); border-color: #ffe0e6; }
        .tms-communications-page .tms-stat-card:nth-child(1) { border-color: #cfe8fb; }
        .tms-communications-page .tms-stat-card:nth-child(2) { border-color: #ccefdc; }
        .tms-communications-page .tms-stat-card:nth-child(3) { border-color: #f8e5bd; }
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
        .tms-communications-page [role=tablist] { border: 1px solid #dceaf5; background: #f1f7fc; }
        .tms-communications-page .tms-announcement-card { border-top-width: 3px; }
        .tms-communications-page .tms-announcement-card[data-status='Published'] { border-top-color: #10b981; }
        .tms-communications-page .tms-announcement-card[data-status='Draft'] { border-top-color: #f59e0b; }
        .tms-communications-page .tms-announcement-card[data-status='Cancelled'] { border-top-color: #f43f5e; }
        .tms-communications-page table thead { background: #f3f8fc; }
        .tms-communications-page table tbody tr { transition: background .15s ease; }
        .tms-communications-page table tbody tr:hover { background: #f2f9fd; }
        @media (max-width: 640px) {
          .tms-communications-page { padding: 12px 12px 20px; }
          .tms-communications-page .tms-hero { min-height: 0; padding: 22px 20px; border-radius: 16px; }
          .tms-communications-page .tms-stat-card { padding: 15px 16px; }
        }
      `}</style>

      {/* Welcome banner */}
      <section className="tms-hero relative isolate overflow-hidden rounded-2xl bg-gradient-to-r from-sky-800 via-sky-600 to-cyan-500 p-5 text-white shadow-lg shadow-sky-900/10 sm:p-7 lg:p-8">
        <div className="relative z-10 max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-sky-50 backdrop-blur"><Sparkles size={14} /> TEMPLE COMMUNITY</div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Keep Your Community Informed</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-sky-50">Publish important notices, share updates and keep everyone connected with temple activities.</p>
          {canCreateAnnouncements && <button type="button" onClick={openCreateModal} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-sky-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md"><Plus size={17} /> Create Announcement</button>}
        </div>
        <div className="absolute -right-12 -bottom-16 -z-0 h-64 w-64 rounded-full border-[35px] border-white/10" />
        <div className="absolute top-4 right-16 -z-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <Megaphone size={145} strokeWidth={1} className="absolute right-5 bottom-1 hidden rotate-[-12deg] text-white/15 sm:block" />
      </section>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
        <StatCard title="Total Announcements" value={announcements.length} subtitle="All notices" icon={<Megaphone size={21} />} color="blue" />
        <StatCard title="Published" value={publishedCount} subtitle="Visible to the audience" icon={<CheckCircle2 size={21} />} color="green" />
        <StatCard title="Drafts" value={draftCount} subtitle="Saved for later" icon={<FileText size={21} />} color="amber" />
        <StatCard title="Cancelled" value={cancelledCount} subtitle="Cancellation notices" icon={<X size={21} />} color="rose" />
      </div>

      {/* Announcement list */}
      <section className="tms-panel overflow-visible rounded-2xl border border-[#D8E8F3] bg-white shadow-sm">
        <div className="border-b border-[#D8E8F3] p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div><div className="flex items-center gap-3"><span className="rounded-xl bg-gradient-to-br from-sky-100 to-cyan-50 p-2.5 text-sky-700 ring-1 ring-sky-100"><Megaphone size={22} /></span><div><h2 className="text-lg font-bold text-[#0C4A6E] sm:text-xl">Announcement Centre</h2><p className="mt-1 text-sm text-slate-500">Manage and organize all temple announcements.</p></div></div></div>
            <span className="text-xs text-slate-500 sm:text-sm">Showing <strong className="text-[#0C4A6E]">{filteredAnnouncements.length}</strong> of {announcements.length}</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_190px_160px]">
            <div className="relative min-w-0">
              <Search size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
              <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search title, message or audience..." className="min-h-10 w-full rounded-xl border border-[#D8E8F3] bg-[#F7FBFE] py-2.5 pr-10 pl-10 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"><X size={15} /></button>}
            </div>
            <select aria-label="Filter by audience" value={audienceFilter} onChange={event => setAudienceFilter(event.target.value)} className="min-h-10 w-full rounded-xl border border-[#D8E8F3] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
              <option>All Audiences</option>{audiences.map(audience => <option key={audience}>{audience}</option>)}
            </select>
            <select aria-label="Filter by date" value={dateFilter} onChange={event => setDateFilter(event.target.value as typeof dateFilter)} className="min-h-10 w-full rounded-xl border border-[#D8E8F3] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
              <option>All Dates</option><option>Upcoming</option><option>Past</option>
            </select>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-[#F1F7FC] p-1" role="tablist" aria-label="Announcement status filter">
              {tabs.map(tab => {
                const count = tab === 'All' ? announcements.length : announcements.filter(item => item.status === tab).length
                return <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`min-h-9 shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${activeTab === tab ? 'bg-gradient-to-r from-sky-700 to-cyan-600 text-white shadow-md shadow-sky-900/15' : 'border border-transparent bg-white/70 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800'}`}>{tab} ({count})</button>
              })}
            </div>
            {(search || audienceFilter !== 'All Audiences' || dateFilter !== 'All Dates' || activeTab !== 'All') && <button type="button" onClick={() => { setSearch(''); setAudienceFilter('All Audiences'); setDateFilter('All Dates'); setActiveTab('All') }} className="rounded-lg px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50">Clear filters</button>}
          </div>
        </div>

        <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <div className="mb-4 rounded-2xl bg-sky-50 p-4 text-sky-700"><Megaphone size={30} /></div>
              <h3 className="text-lg font-semibold text-[#0C4A6E]">No announcements found</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">{search ? 'Try a different search term or clear your search.' : 'There are no announcements in this section yet.'}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {search && <button type="button" onClick={() => { setSearch(''); setActiveTab('All') }} className="rounded-lg border border-[#D8E8F3] px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-sky-50">Clear filters</button>}
                {canCreateAnnouncements && <button type="button" onClick={openCreateModal} className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800">Create announcement</button>}
              </div>
            </div>
          ) : filteredAnnouncements.map(item => {
            const dateParts = getDateParts(item.date)
            return (
              <article key={item.id} data-status={item.status} onClick={event => event.stopPropagation()} className="tms-announcement-card group relative flex min-w-0 flex-col gap-3 rounded-xl border border-[#D8E8F3] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,50,80,.035)] transition hover:border-sky-200 hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3">
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                  <div className={`flex h-14 w-12 flex-none flex-col items-center justify-center rounded-lg ring-1 ${item.status === 'Published' ? 'bg-emerald-50 text-emerald-800 ring-emerald-100' : item.status === 'Draft' ? 'bg-amber-50 text-amber-800 ring-amber-100' : 'bg-rose-50 text-rose-800 ring-rose-100'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wide">{dateParts.month}</span><span className="text-xl font-bold leading-tight">{dateParts.day}</span><span className="text-[9px] font-medium">{dateParts.year}</span>
                  </div>
                  {item.image && <img src={item.image} alt={`Image for ${item.title}`} className="hidden h-12 w-14 flex-none rounded-lg object-cover sm:block" />}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="min-w-0 truncate text-sm font-semibold text-[#0C4A6E] transition group-hover:text-sky-800 sm:text-[15px]">{item.title}</h3>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${statusStyles[item.status]}`}>{item.status}</span>
                    </div>
                    <p className="line-clamp-1 text-xs text-slate-500">{item.description}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ring-1 ${audienceStyles(item.audience)}`}><Users size={11} />{item.audience}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays size={12} className="text-sky-600" />{formatDate(item.date)}</span>
                      <span className="hidden md:inline">By {item.author}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-none items-center justify-between border-t border-slate-100 pt-2 sm:justify-end sm:gap-1 sm:border-0 sm:pt-0">
                  <span className="text-[11px] text-slate-400 sm:hidden">By {item.author}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setViewing(item)} className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"><Eye size={14} />View</button>
                    {canManageAnnouncements && <button type="button" onClick={() => openEditModal(item)} className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0C4A6E] transition hover:bg-sky-50"><Pencil size={14} />Edit</button>}
                    {(canManageAnnouncements || canCreateAnnouncements) && <div className="relative">
                      <button type="button" onClick={() => setMenuId(menuId === item.id ? null : item.id)} className="rounded-lg p-2 text-slate-500 transition hover:bg-sky-50 hover:text-[#0C4A6E]" aria-label="More announcement actions" aria-expanded={menuId === item.id}><MoreHorizontal size={18} /></button>
                      {menuId === item.id && <div className="absolute top-full right-0 z-30 mt-1 w-48 rounded-xl border border-[#D8E8F3] bg-white p-1.5 shadow-xl">
                        {canManageAnnouncements && item.status === 'Published' && <button type="button" onClick={() => cancelAnnouncement(item)} className="flex min-h-9 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-700 hover:bg-rose-50"><X size={14} />Cancel announcement</button>}
                        {canCreateAnnouncements && item.status !== 'Published' && <button type="button" onClick={() => togglePublish(item)} className="flex min-h-9 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-600 hover:bg-sky-50 hover:text-sky-800"><Send size={14} />{item.status === 'Draft' ? 'Publish' : 'Restore as Draft'}</button>}
                        {canManageAnnouncements && <button type="button" onClick={() => deleteAnnouncement(item.id)} className="flex min-h-9 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50"><Trash2 size={14} />Delete</button>}
                      </div>}
                    </div>}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Create / Edit modal */}
      {isModalOpen && (canManageAnnouncements || canCreateAnnouncements) && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={event => { if (event.target === event.currentTarget) closeModal() }}>
        <div className="flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
          <div className="flex items-center justify-between border-b border-[#D8E8F3] px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3"><div className="rounded-xl bg-sky-50 p-2.5 text-sky-700"><Megaphone size={21} /></div><div className="min-w-0"><h2 className="font-semibold text-[#0C4A6E] sm:text-lg">{editingId !== null ? 'Edit Announcement' : 'Create Announcement'}</h2><p className="mt-0.5 text-xs text-slate-500">Share an important notice with your community.</p></div></div>
            <button type="button" onClick={() => closeModal()} className="rounded-lg p-2 text-slate-500 transition hover:bg-sky-50 hover:text-ink" aria-label="Close modal"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            {formError && <div role="alert" className="sm:col-span-2 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle size={17} className="mt-0.5 shrink-0" />{formError}</div>}
            <div className="sm:col-span-2"><label htmlFor="announcement-title" className="mb-2 block text-sm font-semibold text-[#0C4A6E]">Announcement Title <span className="text-rose-500">*</span></label><input id="announcement-title" required maxLength={120} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Enter a clear announcement title" className="min-h-11 w-full rounded-xl border border-[#D8E8F3] bg-cream/30 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500/70 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" /></div>
            <div className="sm:col-span-2"><div className="mb-2 flex items-center justify-between gap-2"><label htmlFor="announcement-message" className="block text-sm font-semibold text-[#0C4A6E]">Message <span className="text-rose-500">*</span></label><span className="text-xs text-slate-500">{form.description.length}/2000</span></div><textarea id="announcement-message" required rows={5} maxLength={2000} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Write your announcement message here..." className="w-full resize-y rounded-xl border border-[#D8E8F3] bg-cream/30 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-500/70 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" /></div>
            <div><label htmlFor="announcement-audience" className="mb-2 block text-sm font-semibold text-[#0C4A6E]">Target Audience <span className="text-rose-500">*</span></label><div className="relative"><Users size={17} className="absolute top-1/2 left-3 -translate-y-1/2 text-sky-600" /><select id="announcement-audience" value={form.audience} onChange={event => setForm({ ...form, audience: event.target.value })} className="min-h-11 w-full appearance-none rounded-xl border border-[#D8E8F3] bg-cream/30 py-3 pr-3 pl-10 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100">{audiences.map(audience => <option key={audience}>{audience}</option>)}</select></div></div>
            <div className="relative"><label className="mb-2 block text-sm font-semibold text-[#0C4A6E]">Announcement Date <span className="text-rose-500">*</span></label><button type="button" onClick={() => { const nextOpen = !calendarOpen; setCalendarOpen(nextOpen); if (nextOpen && form.date) { const selected = new Date(`${form.date}T00:00:00`); setCalendarMonth(new Date(selected.getFullYear(), selected.getMonth(), 1)) } }} className="flex min-h-14 w-full items-center justify-between rounded-xl border border-[#D8E8F3] bg-cream/30 px-4 py-2 text-left transition hover:border-sky-300 focus:border-sky-400 focus:bg-white"><span className="flex items-center gap-3"><span className="rounded-lg bg-sky-50 p-2 text-sky-700"><CalendarDays size={18} /></span><span><span className="block text-sm font-semibold text-[#0C4A6E]">{form.date ? formatDate(form.date) : 'Select a date'}</span><span className="block text-xs text-slate-500">Choose the date for this notice</span></span></span><ChevronRight size={18} className={`text-slate-500 transition ${calendarOpen ? 'rotate-90' : ''}`} /></button>
              {calendarOpen && <div className="absolute top-full right-0 left-0 z-40 mt-2 rounded-2xl border border-[#D8E8F3] bg-white p-3 shadow-2xl sm:left-auto sm:w-[340px] sm:p-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-[11px] font-medium tracking-wide text-slate-500">SELECT DATE</p><h3 className="mt-0.5 text-lg font-semibold text-[#0C4A6E]">{monthYear}</h3></div><div className="flex gap-1"><button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="rounded-lg border border-[#D8E8F3] p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-700" aria-label="Previous month"><ChevronLeft size={17} /></button><button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="rounded-lg border border-[#D8E8F3] p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-700" aria-label="Next month"><ChevronRight size={17} /></button></div></div>
                <div className="mb-1 grid grid-cols-7 text-center">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <span key={day} className="py-2 text-xs font-semibold text-slate-500">{day}</span>)}</div><div className="grid grid-cols-7 gap-1">{calendarCells.map((day, index) => { if (!day) return <div key={`empty-${index}`} />; const iso = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const isSelected = form.date === iso; const now = new Date(); const isToday = day === now.getDate() && calendarMonth.getMonth() === now.getMonth() && calendarMonth.getFullYear() === now.getFullYear(); return <button key={day} type="button" onClick={() => selectDate(day)} className={`relative flex h-10 items-center justify-center rounded-lg text-sm font-medium transition ${isSelected ? 'bg-sky-700 text-white shadow-md shadow-sky-700/20' : isToday ? 'bg-sky-50 font-bold text-sky-800 ring-1 ring-sky-200' : 'text-[#0C4A6E] hover:bg-sky-50 hover:text-sky-800'}`}>{day}{isToday && !isSelected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-sky-600" />}</button> })}</div><div className="mt-3 flex items-center justify-between border-t border-[#D8E8F3] pt-3"><button type="button" onClick={() => { const now = new Date(); const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1); setCalendarMonth(currentMonth); selectDate(now.getDate(), currentMonth) }} className="text-xs font-semibold text-sky-700 hover:text-sky-900">Today</button><button type="button" onClick={() => setCalendarOpen(false)} className="rounded-lg bg-cream px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-sky-50">Close calendar</button></div></div>}
            </div>
            {/* Optional image upload */}
            <div><div className="mb-2 flex items-center justify-between"><label className="block text-sm font-semibold text-[#0C4A6E]">Announcement Image <span className="font-normal text-slate-500">(Optional)</span></label>{form.image && <button type="button" onClick={() => setForm(previous => ({ ...previous, image: '' }))} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Remove image</button>}</div>
              {form.image ? <div className="relative overflow-hidden rounded-xl border border-[#D8E8F3] bg-slate-50"><img src={form.image} alt="Announcement upload preview" className="max-h-64 w-full object-contain" /><button type="button" onClick={() => fileInputRef.current?.click()} className="absolute right-2 bottom-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-sky-800 shadow hover:bg-white"><Upload size={14} />Replace image</button></div> : <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed border-sky-300 bg-sky-50/50 px-4 py-5 text-center transition hover:border-sky-500 hover:bg-sky-50"><span className="mb-2 rounded-xl bg-white p-2.5 text-sky-700 shadow-sm"><ImagePlus size={21} /></span><span className="text-sm font-semibold text-sky-800">Upload an image</span><span className="mt-1 text-xs text-slate-500">JPG, PNG or WEBP · Maximum 5 MB</span></button>}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2.5 text-xs leading-5 text-sky-800">
              <AlertCircle size={16} className="shrink-0" /> Drafts stay private. Publishing creates an in-system notification for the selected audience.
            </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-[#D8E8F3] pt-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => setShowPreview(true)} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#D8E8F3] px-4 py-3 text-sm font-semibold text-sky-700 transition hover:border-sky-200 hover:bg-sky-50"><Eye size={16} />Preview</button>
              <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-row sm:items-center">
                <button type="button" onClick={() => closeModal()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D8E8F3] bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"> <X size={16} />Cancel</button>
                <button type="button" onClick={() => { setSubmitStatus('Draft'); saveAnnouncement('Draft') }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-semibold text-sky-800 transition hover:border-sky-300 hover:bg-sky-100"><FileText size={16} />Save Draft</button>
                <button type="submit" onClick={() => setSubmitStatus('Published')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-sky-900/10 transition hover:-translate-y-0.5 hover:bg-sky-800 hover:shadow-lg"><Send size={16} />{editingId !== null ? 'Save & Publish' : 'Publish'}</button>
              </div>
            </div>
          </form>
        </div>
      </div>}

      {/* Preview modal */}
      {showPreview && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget) setShowPreview(false) }}><div className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#D8E8F3] p-4 sm:px-5"><div><h2 className="font-semibold text-[#0C4A6E]">Announcement Preview</h2><p className="text-xs text-slate-500">Preview how the notice will appear.</p></div><button type="button" onClick={() => setShowPreview(false)} className="rounded-lg p-2 text-slate-500 hover:bg-sky-50" aria-label="Close preview"><X size={19} /></button></div><div className="p-4 sm:p-6">{form.image && <img src={form.image} alt="Announcement preview" className="mb-4 max-h-64 w-full rounded-xl object-cover" />}<div className="mb-3 flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[submitStatus]}`}>{submitStatus}</span></div><h3 className="text-xl font-semibold leading-snug text-[#0C4A6E] sm:text-2xl">{form.title || 'Announcement title'}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{form.description || 'Your announcement message will appear here.'}</p><div className="mt-5 grid grid-cols-2 gap-3"><DetailItem label="Announcement Date" value={formatDate(form.date)} /><DetailItem label="Target Audience" value={form.audience} /></div></div><div className="border-t border-[#D8E8F3] p-4 text-right"><button type="button" onClick={() => setShowPreview(false)} className="min-h-10 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800">Back to editing</button></div></div></div>}

      {/* Publish confirmation */}
      {confirmPublish && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Send size={22} /></div><h2 className="text-lg font-semibold text-[#0C4A6E]">Publish this announcement?</h2><p className="mt-2 text-sm leading-6 text-slate-500">This will mark the announcement as published for <strong className="text-slate-600">{form.audience}</strong>. A system notification will appear in the TMS notification bell for the selected audience. External email, SMS, WhatsApp and push delivery are not enabled in this UI update.</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setConfirmPublish(false)} className="min-h-10 rounded-xl border border-[#D8E8F3] px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-sky-50">Go back</button><button type="button" onClick={() => saveAnnouncement('Published')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"><CheckCircle2 size={16} />Confirm Publish</button></div></div></div>}

      {/* Details modal */}
      {viewing && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={event => { if (event.target === event.currentTarget) setViewing(null) }}><div className="max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"><div className="flex items-center justify-between border-b border-[#D8E8F3] bg-gradient-to-r from-sky-50 to-white p-4 sm:p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-white p-2.5 text-sky-700 shadow-sm"><Megaphone size={20} /></div><div><h2 className="font-semibold text-[#0C4A6E]">Announcement Details</h2><p className="text-xs text-slate-500">Community notice</p></div></div><button type="button" onClick={() => setViewing(null)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-ink" aria-label="Close details"><X size={19} /></button></div><div className="space-y-5 p-4 sm:p-6">{viewing.image && <img src={viewing.image} alt={`Image for ${viewing.title}`} className="max-h-72 w-full rounded-xl object-cover" />}<div><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[viewing.status]}`}>{viewing.status}</span></div><h2 className="mt-4 text-xl font-semibold leading-snug text-[#0C4A6E] sm:text-2xl">{viewing.title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{viewing.description}</p>{viewing.status === 'Cancelled' && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3"><p className="text-sm font-semibold text-rose-800">Announcement cancelled</p><p className="mt-1 text-sm text-rose-700">{viewing.cancellationReason || 'This announcement has been cancelled.'}</p></div>}</div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><DetailItem label="Announcement Date" value={formatDate(viewing.date)} /><DetailItem label="Target Audience" value={viewing.audience} /><DetailItem label="Created By" value={viewing.author} /><DetailItem label="Status" value={viewing.status} /></div><div className="flex flex-col-reverse gap-2 border-t border-[#D8E8F3] pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={() => setViewing(null)} className="min-h-11 rounded-xl border border-[#D8E8F3] px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-sky-50">Close</button>{canManageAnnouncements && <button type="button" onClick={() => { const selected = viewing; setViewing(null); openEditModal(selected) }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0369A1]"><Pencil size={16} />Edit Announcement</button>}</div></div></div></div>}
    </div>
  )
}

type StatCardProps = { title: string; value: number; subtitle: string; icon: ReactNode; color: 'blue' | 'green' | 'amber' | 'rose' }
const StatCard = ({ title, value, subtitle, icon, color }: StatCardProps) => {
  const colors = { blue: 'bg-sky-100 text-sky-700 ring-sky-200', green: 'bg-emerald-100 text-emerald-700 ring-emerald-200', amber: 'bg-amber-100 text-amber-700 ring-amber-200', rose: 'bg-rose-100 text-rose-700 ring-rose-200' }
  return <div className="tms-stat-card group rounded-2xl border border-[#D8E8F3] bg-white p-4 shadow-sm transition duration-200 hover:shadow-lg sm:p-5"><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-slate-500">{title}</span><span className={`rounded-xl p-2.5 ring-1 ${colors[color]}`}>{icon}</span></div><div className="mt-3 flex items-end justify-between sm:mt-4"><div><div className={`text-3xl font-bold tracking-tight ${color === 'green' ? 'text-emerald-800' : color === 'amber' ? 'text-amber-800' : color === 'rose' ? 'text-rose-800' : 'text-sky-900'}`}>{value}</div><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div><ArrowUpRight size={18} className={`mb-1 transition group-hover:-translate-y-1 group-hover:translate-x-1 ${color === 'green' ? 'text-emerald-600' : color === 'amber' ? 'text-amber-600' : color === 'rose' ? 'text-rose-600' : 'text-sky-600'}`} /></div></div>
}
const DetailItem = ({ label, value }: { label: string; value: string }) => <div className="rounded-xl border border-[#D8E8F3] bg-[#F7FBFE] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-semibold text-[#0C4A6E]">{value}</p></div>

export default AnnouncementsPage
