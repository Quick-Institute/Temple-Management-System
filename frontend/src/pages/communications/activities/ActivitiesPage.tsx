
import { useMemo, useState, type FormEvent } from 'react'
import { useTempleActivities } from '../../../data/activityStore'
import { usePermissions } from '../../../hooks/usePermissions'
import {
  Activity, Plus, Search, Filter, CalendarDays, Users, Eye, Pencil,
  Trash2, X, Clock3, CheckCircle2, FileText, Sparkles, ChevronDown,
  ChevronLeft, ChevronRight, MapPin, CalendarCheck, UserCheck, Tag,
  List, Download, ArrowUpRight, CalendarClock
} from 'lucide-react'

type ActivityStatus = 'Published' | 'Draft' | 'Scheduled' | 'Cancelled'

type ActivityType =
  | 'Religious Programme'
  | 'Dana & Almsgiving'
  | 'Community'
  | 'Meeting'
  | 'General'

type TempleActivity = {
  id: number
  title: string
  description: string
  category: ActivityType
  audience: string
  date: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  responsiblePerson: string
  status: ActivityStatus
}

const categories: ActivityType[] = [
  'Religious Programme',
  'Dana & Almsgiving',
  'Community',
  'Meeting',
  'General',
]

const audiences = [
  'All Community',
  'Families',
  'Committee Members',
  'Volunteers',
  'Monks',
]

const initialActivities: TempleActivity[] = [
  {
    id: 1,
    title: 'Monthly Pirith Chanting',
    description: 'Monthly religious programme with Pirith chanting and blessings. All devotees are welcome to participate.',
    category: 'Religious Programme',
    audience: 'All Community',
    date: '2026-11-15',
    endDate: '2026-11-15',
    startTime: '18:00',
    endTime: '21:00',
    location: 'Main Shrine Room',
    responsiblePerson: 'Temple Administrator',
    status: 'Published',
  },
  {
    id: 2,
    title: 'Monthly Dhamma Sermon',
    description: 'A special Dhamma sermon conducted for devotees at the main temple hall.',
    category: 'Religious Programme',
    audience: 'All Community',
    date: '2026-11-20',
    endDate: '2026-11-20',
    startTime: '17:00',
    endTime: '19:00',
    location: 'Temple Main Hall',
    responsiblePerson: 'Temple Administrator',
    status: 'Published',
  },
  {
    id: 3,
    title: 'Annual Dana Programme',
    description: 'Annual community Dana programme organized with the support of temple families.',
    category: 'Dana & Almsgiving',
    audience: 'Families',
    date: '2026-11-25',
    endDate: '2026-11-25',
    startTime: '06:00',
    endTime: '10:00',
    location: 'Temple Dining Hall',
    responsiblePerson: 'Community Coordinator',
    status: 'Scheduled',
  },
  {
    id: 4,
    title: 'Temple Cleaning Campaign',
    description: 'Community volunteer programme to clean and maintain the temple premises.',
    category: 'Community',
    audience: 'Volunteers',
    date: '2026-11-28',
    endDate: '2026-11-28',
    startTime: '07:00',
    endTime: '10:00',
    location: 'Temple Premises',
    responsiblePerson: 'Volunteer Coordinator',
    status: 'Draft',
  },
  {
    id: 5,
    title: 'Monthly Committee Meeting',
    description: 'Monthly discussion about temple administration and development activities.',
    category: 'Meeting',
    audience: 'Committee Members',
    date: '2026-11-30',
    endDate: '2026-11-30',
    startTime: '09:00',
    endTime: '11:00',
    location: 'Administration Office',
    responsiblePerson: 'Temple Administrator',
    status: 'Published',
  },
]

const emptyForm = {
  title: '',
  description: '',
  category: 'General' as ActivityType,
  audience: 'All Community',
  date: '',
  endDate: '',
  startTime: '',
  endTime: '',
  location: '',
  responsiblePerson: '',
  status: 'Draft' as ActivityStatus,
}

const statusStyles: Record<ActivityStatus, string> = {
  Published: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Draft: 'bg-slate-100 text-slate-600 border border-slate-200',
  Scheduled: 'bg-sky-50 text-sky-700 border border-sky-200',
  Cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
}

const categoryStyles: Record<ActivityType, string> = {
  'Religious Programme': 'bg-sky-50 text-sky-700',
  'Dana & Almsgiving': 'bg-amber-50 text-amber-700',
  Community: 'bg-emerald-50 text-emerald-700',
  Meeting: 'bg-violet-50 text-violet-700',
  General: 'bg-slate-100 text-slate-600',
}

const formatDate = (date: string) => {
  if (!date) return 'Not set'
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatTime = (time: string) => {
  if (!time) return 'Not set'
  const [hour, minute] = time.split(':').map(Number)
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100'

const fieldLabel =
  'mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500'

const ActivitiesPage = () => {
  const [activities, setActivities] =
    useTempleActivities<TempleActivity>(initialActivities)

  const { canEdit } = usePermissions()
  const canManageActivities = canEdit('manageAnnouncements')

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [audienceFilter, setAudienceFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [viewing, setViewing] = useState<TempleActivity | null>(null)

  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const [calendarDate, setCalendarDate] = useState(() => new Date())
  const [calendarView, setCalendarView] = useState(false)

  const publishedCount = activities.filter(
    item => item.status === 'Published',
  ).length

  const draftCount = activities.filter(
    item => item.status === 'Draft',
  ).length

  const scheduledCount = activities.filter(
    item => item.status === 'Scheduled',
  ).length

  const cancelledCount = activities.filter(
    item => item.status === 'Cancelled',
  ).length

  const today = new Date()
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const currentMonth = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
  ].join('-')

  const filteredActivities = useMemo(() => {
    return activities.filter(item => {
      const searchValue = search.toLowerCase()

      const matchesSearch =
        item.title.toLowerCase().includes(searchValue) ||
        item.description.toLowerCase().includes(searchValue) ||
        item.location.toLowerCase().includes(searchValue) ||
        item.responsiblePerson.toLowerCase().includes(searchValue)

      const matchesTab =
        activeTab === 'All' || item.status === activeTab

      const matchesCategory =
        categoryFilter === 'All' || item.category === categoryFilter

      const matchesAudience =
        audienceFilter === 'All' || item.audience === audienceFilter

      let matchesDate = true

      if (dateFilter === 'Today') {
        matchesDate = item.date === todayString
      } else if (dateFilter === 'This Month') {
        matchesDate = item.date.startsWith(currentMonth)
      }

      return (
        matchesSearch &&
        matchesTab &&
        matchesCategory &&
        matchesAudience &&
        matchesDate
      )
    })
  }, [
    activities,
    search,
    activeTab,
    categoryFilter,
    audienceFilter,
    dateFilter,
    todayString,
    currentMonth,
  ])

  const tabs = ['All', 'Published', 'Draft', 'Scheduled', 'Cancelled']

  const getTabCount = (tab: string) => {
    if (tab === 'All') return activities.length
    if (tab === 'Published') return publishedCount
    if (tab === 'Draft') return draftCount
    if (tab === 'Scheduled') return scheduledCount
    return cancelledCount
  }

  const openCreateModal = () => {
    if (!canManageActivities) return
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (item: TempleActivity) => {
    if (!canManageActivities) return

    setEditingId(item.id)
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      audience: item.audience,
      date: item.date,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      responsiblePerson: item.responsiblePerson,
      status: item.status,
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canManageActivities) return

    setFormError('')

    if (form.endDate < form.date) {
      setFormError('End date cannot be earlier than the start date.')
      return
    }

    if (
      form.endDate === form.date &&
      form.endTime <= form.startTime
    ) {
      setFormError('End time must be later than start time.')
      return
    }

    if (!form.responsiblePerson.trim() || !form.location.trim()) {
      setFormError('Please complete all required fields.')
      return
    }

    if (editingId !== null) {
      setActivities(previous =>
        previous.map(item =>
          item.id === editingId ? { ...item, ...form } : item,
        ),
      )
    } else {
      const newActivity: TempleActivity = {
        id: Date.now(),
        ...form,
      }
      setActivities(previous => [newActivity, ...previous])
    }

    closeModal()
  }

  const deleteActivity = (id: number) => {
    if (!canManageActivities) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this activity?',
    )

    if (!confirmed) return

    setActivities(previous => previous.filter(item => item.id !== id))
  }

  const exportActivities = () => {
    const headers = [
      'ID', 'Title', 'Category', 'Audience', 'Start Date', 'End Date',
      'Start Time', 'End Time', 'Location', 'Responsible Person', 'Status',
    ]

    const rows = filteredActivities.map(item => [
      item.id,
      item.title,
      item.category,
      item.audience,
      item.date,
      item.endDate,
      item.startTime,
      item.endTime,
      item.location,
      item.responsiblePerson,
      item.status,
    ])

    const csv = [headers, ...rows]
      .map(row =>
        row.map(value =>
          `"${String(value).replace(/"/g, '""')}"`,
        ).join(','),
      )
      .join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'temple-activities.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  const monthYear = calendarDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const firstDay = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth(),
    1,
  ).getDay()

  const daysInMonth = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth() + 1,
    0,
  ).getDate()

  const calendarCells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  const getActivitiesForDay = (day: number) => {
    const date = [
      calendarDate.getFullYear(),
      String(calendarDate.getMonth() + 1).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-')

    return filteredActivities.filter(item => item.date === date)
  }

  return (
    <div className="activities-page space-y-5 pb-6">
      <style>{`
        .activities-page {
          color: #12334b;
        }

        .activities-page .activities-hero {
          background:
            linear-gradient(105deg, rgba(2, 73, 126, .97) 0%, rgba(3, 112, 176, .92) 48%, rgba(14, 165, 233, .55) 100%),
            linear-gradient(135deg, #075985, #0284c7);
          box-shadow: 0 12px 28px -12px rgba(2, 100, 160, .45);
        }

        .activities-page .activities-stat {
          border: 1px solid #e5edf5;
          border-radius: 17px;
          box-shadow: 0 4px 15px rgba(15, 50, 80, .045);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .activities-page .activities-stat:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(15, 50, 80, .09);
        }

        .activities-page .activities-panel {
          border: 1px solid #e3edf5;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 7px 25px rgba(15, 50, 80, .045);
        }

        .activities-page .activities-stat-blue {
          background: linear-gradient(135deg, #eff8ff, #fff);
        }

        .activities-page .activities-stat-green {
          background: linear-gradient(135deg, #effcf4, #fff);
        }

        .activities-page .activities-stat-amber {
          background: linear-gradient(135deg, #fff8eb, #fff);
        }

        .activities-page .activities-stat-purple {
          background: linear-gradient(135deg, #f5f0ff, #fff);
        }

        .activities-page button:focus-visible,
        .activities-page input:focus-visible,
        .activities-page select:focus-visible,
        .activities-page textarea:focus-visible {
          outline: 2px solid #38bdf8;
          outline-offset: 2px;
        }
      `}</style>

      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Community</span>
            <span>/</span>
            <span className="font-semibold text-sky-700">
              Activities & Events
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-600/20">
              <CalendarDays size={22} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#12334b] sm:text-3xl">
                Activities & Events
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Plan, manage and organize temple activities and community events.
              </p>
            </div>
          </div>
        </div>

        {canManageActivities && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-700 to-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-700/20 transition hover:-translate-y-0.5 hover:from-sky-800 hover:to-sky-700"
          >
            <Plus size={18} />
            Create Activity
          </button>
        )}
      </div>

      {/* Hero banner */}
      <section className="activities-hero relative isolate overflow-hidden rounded-[20px] px-6 py-7 text-white sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute -right-3 -top-10 h-48 w-48 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute bottom-0 right-24 h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <CalendarCheck size={14} />
            Activities & Events Centre
          </div>

          <h2 className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">
            Organize Your Temple Activities
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-sky-50/90">
            Manage religious programmes, Dana arrangements, meetings and
            community events with an organized schedule.
          </p>
        </div>

        <CalendarDays
          size={150}
          strokeWidth={0.8}
          className="pointer-events-none absolute -bottom-9 right-5 hidden rotate-[-12deg] text-white/15 sm:block"
        />

        <Sparkles
          size={25}
          className="pointer-events-none absolute right-8 top-7 text-white/30"
        />
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="activities-stat activities-stat-blue p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-900/70">
              Total Activities
            </span>
            <div className="rounded-xl bg-sky-100 p-2.5 text-sky-700">
              <CalendarDays size={21} />
            </div>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <span className="font-serif text-3xl font-bold text-[#12334b]">
              {activities.length}
            </span>
            <span className="mb-1 flex items-center gap-1 text-xs font-medium text-sky-700">
              <ArrowUpRight size={14} />
              Activities
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Total registered activities
          </p>
        </div>

        <div className="activities-stat activities-stat-green p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900/70">
              Published
            </span>
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <CheckCircle2 size={21} />
            </div>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <span className="font-serif text-3xl font-bold text-[#12334b]">
              {publishedCount}
            </span>
            <span className="mb-1 text-xs font-medium text-emerald-700">
              Live activities
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Published to the community
          </p>
        </div>

        <div className="activities-stat activities-stat-amber p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900/70">
              Drafts
            </span>
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
              <FileText size={21} />
            </div>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <span className="font-serif text-3xl font-bold text-[#12334b]">
              {draftCount}
            </span>
            <span className="mb-1 text-xs font-medium text-amber-700">
              Not published
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Activities saved as drafts
          </p>
        </div>

        <div className="activities-stat activities-stat-purple p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-900/70">
              Scheduled
            </span>
            <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700">
              <Clock3 size={21} />
            </div>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <span className="font-serif text-3xl font-bold text-[#12334b]">
              {scheduledCount}
            </span>
            <span className="mb-1 text-xs font-medium text-violet-700">
              Upcoming
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Planned upcoming activities
          </p>
        </div>
      </section>

      {/* Activities management */}
      <section className="activities-panel overflow-hidden">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Activity size={19} />
                </div>
                <h2 className="text-lg font-bold text-[#12334b]">
                  All Activities
                </h2>
              </div>
              <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                Manage your temple programmes, events and schedules.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCalendarView(false)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  !calendarView
                    ? 'bg-sky-700 text-white shadow-md shadow-sky-700/20'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <List size={15} />
                List View
              </button>

              <button
                type="button"
                onClick={() => setCalendarView(true)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  calendarView
                    ? 'bg-sky-700 text-white shadow-md shadow-sky-700/20'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CalendarDays size={15} />
                Calendar View
              </button>

              <button
                type="button"
                onClick={exportActivities}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <Download size={15} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Status tabs */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeTab === tab
                    ? 'bg-sky-700 text-white shadow-md shadow-sky-700/15'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50'
                }`}
              >
                {tab} ({getTabCount(tab)})
              </button>
            ))}
          </div>

          {/* Search and filters */}
          <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search activities by title, location or person..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={categoryFilter}
                onChange={event => setCategoryFilter(event.target.value)}
                className={`${inputClass} appearance-none pl-10 pr-9`}
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <Users
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={audienceFilter}
                onChange={event => setAudienceFilter(event.target.value)}
                className={`${inputClass} appearance-none pl-10 pr-9`}
              >
                <option value="All">All Audiences</option>
                {audiences.map(audience => (
                  <option key={audience} value={audience}>
                    {audience}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <CalendarDays
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={dateFilter}
                onChange={event => setDateFilter(event.target.value)}
                className={`${inputClass} appearance-none pl-10 pr-9`}
              >
                <option value="All">All Dates</option>
                <option value="Today">Today</option>
                <option value="This Month">This Month</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* List view */}
        {!calendarView ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Activity</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Date & Time</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <CalendarDays size={22} />
                      </div>
                      <p className="mt-3 font-semibold text-slate-600">
                        No activities found
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map(item => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-sky-50/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-[190px] items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                            {item.category === 'Dana & Almsgiving' ? (
                              <Users size={19} />
                            ) : item.category === 'Meeting' ? (
                              <UserCheck size={19} />
                            ) : (
                              <Activity size={19} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#12334b]">
                              {item.title}
                            </p>
                            <p className="mt-0.5 max-w-[230px] truncate text-xs text-slate-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${categoryStyles[item.category]}`}>
                          {item.category}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                          <CalendarDays size={13} className="text-slate-400" />
                          {formatDate(item.date)}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock3 size={13} className="text-slate-400" />
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex max-w-[150px] items-center gap-1.5 text-xs text-slate-600">
                          <MapPin size={13} className="shrink-0 text-slate-400" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[item.status]}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewing(item)}
                            title="View activity"
                            aria-label={`View ${item.title}`}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                          >
                            <Eye size={15} />
                          </button>

                          {canManageActivities && (
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              title="Edit activity"
                              aria-label={`Edit ${item.title}`}
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                            >
                              <Pencil size={15} />
                            </button>
                          )}

                          {canManageActivities && (
                            <button
                              type="button"
                              onClick={() => deleteActivity(item.id)}
                              title="Delete activity"
                              aria-label={`Delete ${item.title}`}
                              className="rounded-lg border border-rose-100 bg-white p-2 text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center">
              <span>
                Showing {filteredActivities.length} of {activities.length} activities
              </span>
              <span>Temple Activities Management</span>
            </div>
          </div>
        ) : (
          /* Calendar view */
          <div className="p-4 sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-[#12334b]">
                  {monthYear}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  View temple activities by date.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarDate(
                    new Date(
                      calendarDate.getFullYear(),
                      calendarDate.getMonth() - 1,
                      1,
                    ),
                  )}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setCalendarDate(new Date())}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={() => setCalendarDate(
                    new Date(
                      calendarDate.getFullYear(),
                      calendarDate.getMonth() + 1,
                      1,
                    ),
                  )}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                  aria-label="Next month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-100 pb-3 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarCells.map((day, index) => {
                const dayActivities = day ? getActivitiesForDay(day) : []

                const isToday =
                  day !== null &&
                  new Date().toDateString() ===
                    new Date(
                      calendarDate.getFullYear(),
                      calendarDate.getMonth(),
                      day,
                    ).toDateString()

                return (
                  <div
                    key={index}
                    className="min-h-[90px] border-b border-r border-slate-100 p-1.5 sm:min-h-[120px] sm:p-2"
                  >
                    {day && (
                      <>
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday
                            ? 'bg-sky-700 text-white shadow-md shadow-sky-700/20'
                            : 'text-slate-700'
                        }`}>
                          {day}
                        </span>

                        <div className="mt-2 space-y-1">
                          {dayActivities.slice(0, 2).map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setViewing(item)}
                              className="w-full truncate rounded-md bg-sky-50 px-1.5 py-1 text-left text-[9px] font-semibold text-sky-700 transition hover:bg-sky-100 sm:text-[11px]"
                              title={item.title}
                            >
                              {item.title}
                            </button>
                          ))}

                          {dayActivities.length > 2 && (
                            <span className="block px-1 text-[9px] font-semibold text-slate-400">
                              +{dayActivities.length - 2} more
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* Create / Edit activity modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={event => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-7">
              <div>
                <h3 className="text-lg font-bold text-[#12334b]">
                  {editingId !== null ? 'Edit Activity' : 'Create New Activity'}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the details of your temple activity.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
              {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label className={fieldLabel}>
                  Activity Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Activity
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={event => setForm({
                      ...form,
                      title: event.target.value,
                    })}
                    placeholder="e.g. Monthly Dhamma Sermon"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel}>Category *</label>
                  <div className="relative">
                    <Tag
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      required
                      value={form.category}
                      onChange={event => setForm({
                        ...form,
                        category: event.target.value as ActivityType,
                      })}
                      className={`${inputClass} appearance-none pl-10`}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={fieldLabel}>Target Audience *</label>
                  <div className="relative">
                    <Users
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      required
                      value={form.audience}
                      onChange={event => setForm({
                        ...form,
                        audience: event.target.value,
                      })}
                      className={`${inputClass} appearance-none pl-10`}
                    >
                      {audiences.map(audience => (
                        <option key={audience} value={audience}>
                          {audience}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel}>Start Date *</label>
                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={event => setForm({
                        ...form,
                        date: event.target.value,
                      })}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={fieldLabel}>End Date *</label>
                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      required
                      min={form.date || undefined}
                      value={form.endDate}
                      onChange={event => setForm({
                        ...form,
                        endDate: event.target.value,
                      })}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel}>Start Time *</label>
                  <div className="relative">
                    <Clock3
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="time"
                      required
                      value={form.startTime}
                      onChange={event => setForm({
                        ...form,
                        startTime: event.target.value,
                      })}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={fieldLabel}>End Time *</label>
                  <div className="relative">
                    <Clock3
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="time"
                      required
                      value={form.endTime}
                      onChange={event => setForm({
                        ...form,
                        endTime: event.target.value,
                      })}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel}>Location *</label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      required
                      value={form.location}
                      onChange={event => setForm({
                        ...form,
                        location: event.target.value,
                      })}
                      placeholder="e.g. Main Shrine Room"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={fieldLabel}>Responsible Person *</label>
                  <div className="relative">
                    <UserCheck
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      required
                      value={form.responsiblePerson}
                      onChange={event => setForm({
                        ...form,
                        responsiblePerson: event.target.value,
                      })}
                      placeholder="e.g. Temple Administrator"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={fieldLabel}>Description</label>
                <div className="relative">
                  <FileText
                    size={16}
                    className="absolute left-3.5 top-3.5 text-slate-400"
                  />
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={event => setForm({
                      ...form,
                      description: event.target.value,
                    })}
                    placeholder="Provide details about the activity..."
                    className={`${inputClass} resize-y pl-10`}
                  />
                </div>
              </div>

              <div>
                <label className={fieldLabel}>Activity Status</label>
                <select
                  value={form.status}
                  onChange={event => setForm({
                    ...form,
                    status: event.target.value as ActivityStatus,
                  })}
                  className={inputClass}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-sky-700/20 transition hover:bg-sky-800"
                >
                  <CheckCircle2 size={16} />
                  {editingId !== null ? 'Save Changes' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View activity modal */}
      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setViewing(null)
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-7">
              <div>
                <p className="text-sm font-bold text-[#12334b]">
                  Activity Details
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Complete information about this activity.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[viewing.status]}`}>
                  {viewing.status}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[viewing.category]}`}>
                  {viewing.category}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-[#12334b]">
                  {viewing.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {viewing.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-xl border border-sky-100 bg-sky-50/60 p-4 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CalendarDays size={17} className="shrink-0 text-sky-700" />
                  <span>{formatDate(viewing.date)}</span>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CalendarClock size={17} className="shrink-0 text-sky-700" />
                  <span>{formatDate(viewing.endDate)}</span>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Clock3 size={17} className="shrink-0 text-sky-700" />
                  <span>
                    {formatTime(viewing.startTime)} - {formatTime(viewing.endTime)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <MapPin size={17} className="shrink-0 text-sky-700" />
                  <span>{viewing.location}</span>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Users size={17} className="shrink-0 text-sky-700" />
                  <span>{viewing.audience}</span>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <UserCheck size={17} className="shrink-0 text-sky-700" />
                  <span>{viewing.responsiblePerson}</span>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivitiesPage
