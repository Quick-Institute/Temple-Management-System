
import { useEffect, useMemo, useState } from 'react'
import AnnouncementStats from './components/AnnouncementStats'
import AnnouncementTable from './components/AnnouncementTable'
import AnnouncementModal, {
  type Announcement,
} from './components/AnnouncementModal'
import AnnouncementFilters, {
  type AnnouncementFilter,
} from './components/AnnouncementFilters'
import {
  rolePermissions,
  type AnnouncementRole,
} from './announcementPermissions'
import {
  Bell,
  Building2,
  Users,
  CalendarDays,
  Megaphone,
  Settings,
  Tag,
  Plus,
  ChevronRight,
  ChevronLeft,
  FileText,
  Globe,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
} from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

type ToastData = {
  id: number
  type: ToastType
  message: string
}

type Activity = {
  id: number
  title: string
  subtitle: string
  time: string
  templeName: string
  action: 'created' | 'updated' | 'deleted'
}

type TempleAnnouncement = Announcement & { templeId: string }

// Frontend demo temple records. Replace with API data during backend integration.
const demoTemples = [
  { id: 'temple-kandy', name: 'Sri Dalada Maligawa Temple', location: 'Kandy' },
  { id: 'temple-kelaniya', name: 'Kelaniya Raja Maha Viharaya', location: 'Kelaniya' },
  { id: 'temple-anuradhapura', name: 'Ruwanwelisaya Temple', location: 'Anuradhapura' },
]

const initialAnnouncements: TempleAnnouncement[] = [
  {
    id: 1,
    title: 'Poson Poya Day Programme',
    description: 'Join us for the Poson Poya religious programme...',
    category: 'Religious Programme',
    audience: 'Public',
    date: '20 Oct 2026',
    status: 'Published',
    templeId: 'temple-kandy',
  },
  {
    id: 2,
    title: 'Temple Cleaning Campaign',
    description: 'Community cleaning programme...',
    category: 'Community',
    audience: 'All Members',
    date: '18 Oct 2026',
    status: 'Published',
    templeId: 'temple-kandy',
  },
  {
    id: 3,
    title: 'Monthly Administrator Meeting',
    description: 'Monthly discussion on temple activities...',
    category: 'General Notice',
    audience: 'Temple Administrators',
    date: '15 Oct 2026',
    status: 'Draft',
    templeId: 'temple-kelaniya',
  },
  {
    id: 4,
    title: 'Annual Dana Programme',
    description: 'Details about the upcoming annual Dana programme...',
    category: 'Dana',
    audience: 'All Members',
    date: '10 Oct 2026',
    status: 'Published',
    templeId: 'temple-kelaniya',
  },
  {
    id: 5,
    title: 'System Maintenance Notice',
    description: 'Scheduled system maintenance...',
    category: 'System Notice',
    audience: 'Public',
    date: '05 Oct 2026',
    status: 'Expired',
    templeId: 'temple-anuradhapura',
  },
]

const ITEMS_PER_PAGE = 5

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] =
    useState<TempleAnnouncement[]>(initialAnnouncements)

  // Temporary role preview for frontend development.
  // Backend login will provide the real role.
  const [currentRole, setCurrentRole] = useState<AnnouncementRole>('Temple Admin')

  const assignedTempleId = demoTemples[0].id
  const [selectedTempleId, setSelectedTempleId] =
    useState(demoTemples[0].id)

    const effectiveSelectedTempleId =
    currentRole === 'Super Admin'
      ? selectedTempleId
      : assignedTempleId
  
  const selectedTemple = demoTemples.find(
    (temple) => temple.id === effectiveSelectedTempleId
  )

  const permissions = rolePermissions[currentRole]

  const [activeFilter, setActiveFilter] =
    useState<AnnouncementFilter>('All')

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const [modalMode, setModalMode] =
    useState<'create' | 'edit' | 'view'>('create')

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null)

  const [selectedMenu, setSelectedMenu] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])

  // Toast notification
  const showToast = (type: ToastType, message: string) => {
    setToast({
      id: Date.now(),
      type,
      message,
    })
  }

  // Add recent activity
  const addActivity = (
    action: Activity['action'],
    announcement: Announcement
  ) => {
    const activityTitles = {
      created: 'New announcement created',
      updated: 'Announcement updated',
      deleted: 'Announcement deleted',
    }

    const activity: Activity = {
      id: Date.now(),
      title: activityTitles[action],
      subtitle: announcement.title,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      templeName: selectedTemple?.name ?? 'Selected Temple',
      action,
    }

    setActivities(current => [activity, ...current].slice(0, 5))
  }

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [toast])

  // Family User sees only published public/member-facing announcements.
  // Super Admin sees all announcements belonging to the selected temple.
  const roleVisibleAnnouncements = useMemo(() => {
    const templeAnnouncements = announcements.filter(
      item => item.templeId === effectiveSelectedTempleId
    )

    if (currentRole === 'Family User') {
      return templeAnnouncements.filter(item =>
        item.status === 'Published' &&
        ['Public', 'All Members', 'Family Users'].includes(item.audience)
      )
    }

    return templeAnnouncements
  }, [announcements, currentRole, effectiveSelectedTempleId])

  // Announcement counts
  const counts = useMemo(() => {
    const statuses: AnnouncementFilter[] = [
      'Published',
      'Draft',
      'Scheduled',
      'Expired',
      'Cancelled',
    ]

    const statusCounts = Object.fromEntries(
      statuses.map(status => [
        status,
        roleVisibleAnnouncements.filter(
          item => String(item.status) === status
        ).length,
      ])
    ) as Record<AnnouncementFilter, number>

    return {
      ...statusCounts,
      All: roleVisibleAnnouncements.length,
    }
  }, [roleVisibleAnnouncements])

  // Platform-wide overview for the Super Admin dashboard.
  const platformOverview = useMemo(() => ({
    total: announcements.length,
    published: announcements.filter(
      item => item.status === 'Published'
    ).length,
    scheduled: announcements.filter(
      item => item.status === 'Scheduled'
    ).length,
    templesWithAnnouncements: demoTemples.filter(temple =>
      announcements.some(item => item.templeId === temple.id)
    ).length,
  }), [announcements])

  const templeOverview = useMemo(() => demoTemples.map(temple => {
    const templeItems = announcements.filter(
      item => item.templeId === temple.id
    )

    return {
      ...temple,
      total: templeItems.length,
      published: templeItems.filter(
        item => item.status === 'Published'
      ).length,
      scheduled: templeItems.filter(
        item => item.status === 'Scheduled'
      ).length,
    }
  }), [announcements])

  // Search and filter announcements
  const filtered = useMemo(() => {
    return roleVisibleAnnouncements.filter(item => {
      const matchesFilter =
        activeFilter === 'All' ||
        String(item.status) === activeFilter

      const searchText = search.trim().toLowerCase()

      const searchableContent = [
        item.title,
        item.description,
        item.category,
        item.audience,
        item.status,
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !searchText || searchableContent.includes(searchText)

      return matchesFilter && matchesSearch
    })
  }, [roleVisibleAnnouncements, activeFilter, search])

  // Pagination calculations
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / ITEMS_PER_PAGE)
  )

  const paginatedAnnouncements = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE

    return filtered.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    )
  }, [filtered, page])

  // Create announcement
  const createAnnouncement = (item: Announcement) => {
    if (!permissions.canCreate) return

    const templeAnnouncement: TempleAnnouncement = {
      ...item,
      templeId: effectiveSelectedTempleId,
    }

    setAnnouncements(current => [templeAnnouncement, ...current])
    addActivity('created', templeAnnouncement)

    setActiveFilter('All')
    setSearch('')
    setPage(1)

    showToast(
      'success',
      'Announcement added to the local demo list.'
    )
  }

  // Update announcement
  const updateAnnouncement = (item: Announcement) => {
    if (!permissions.canEdit) return

    const updatedAnnouncement: TempleAnnouncement = {
      ...item,
      templeId: effectiveSelectedTempleId,
    }

    setAnnouncements(current =>
      current.map(existing =>
        existing.id === item.id ? updatedAnnouncement : existing
      )
    )
    addActivity('updated', updatedAnnouncement)
    setShowModal(false)
    setSelectedAnnouncement(null)
    showToast('success', 'Announcement updated in the local demo list.')
  }

  // Delete announcement
  const removeAnnouncement = (id: number) => {
    if (!permissions.canDelete) {
      showToast(
        'error',
        'Your selected role does not have permission to delete announcements.'
      )
      return
    }

    const deletedAnnouncement = announcements.find(
      item => item.id === id
    )

    if (deletedAnnouncement) {
      addActivity('deleted', deletedAnnouncement)
    }

    setAnnouncements(current =>
      current.filter(item => item.id !== id)
    )

    setSelectedMenu(null)

    showToast(
      'success',
      'Announcement removed from the local demo list.'
    )
  }

  // Open create modal
  const openCreateModal = () => {
    if (!permissions.canCreate) {
      showToast('error', 'Your selected role cannot create announcements.')
      return
    }

    setSelectedAnnouncement(null)
    setModalMode('create')
    setShowModal(true)
  }

  // Open view modal
  const openViewModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setModalMode('view')
    setShowModal(true)
    setSelectedMenu(null)
  }

  // Open edit modal
  const openEditModal = (announcement: Announcement) => {
    if (!permissions.canEdit) {
      showToast(
        'error',
        'Your selected role does not have permission to edit announcements.'
      )
      return
    }

    setSelectedAnnouncement(announcement)
    setModalMode('edit')
    setShowModal(true)
    setSelectedMenu(null)
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    setSelectedAnnouncement(null)
  }

  // Quick action handlers
  const handleManageCategories = () => {
    showToast(
      'info',
      'Category management will be available in a future update.'
    )
  }

  const handleNotificationSettings = () => {
    showToast(
      'info',
      'Notification settings will be available in a future update.'
    )
  }

  const quickActions: {
    title: string
    icon: typeof Megaphone
    color: string
    action: () => void
  }[] = []
  
  if (permissions.canCreate) {
    quickActions.push({
      title: 'Create Announcement',
      icon: Megaphone,
      color: 'bg-emerald-50 text-emerald-700',
      action: openCreateModal,
    })
  }
  
  if (currentRole !== 'Family User') {
    quickActions.push(
      {
        title: 'Manage Categories',
        icon: Tag,
        color: 'bg-sky-50 text-sky-700',
        action: handleManageCategories,
      },
      {
        title: 'Notification Settings',
        icon: Bell,
        color: 'bg-violet-50 text-violet-700',
        action: handleNotificationSettings,
      }
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f7f2] font-temple text-[#172e27]">
      <main className="space-y-4 p-4 sm:p-5 lg:p-6">

        {/* Banner */}
        <section
          className={`relative flex ${currentRole === 'Family User' ? 'min-h-[135px] sm:min-h-[150px]' : 'min-h-[205px]'} items-center overflow-hidden rounded-xl border border-[#eee2c6] bg-[#f8edcf] bg-cover bg-center px-6 py-6 sm:px-10`}
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,246,222,.98) 0%, rgba(255,246,222,.88) 43%, rgba(255,246,222,.08) 100%), url('/images/temple-bg.jpg')",
          }}
        >
          <div className="relative z-10 max-w-[570px]">
            <p className="mb-1 text-sm text-[#7e672c]">
              Temple Management System
            </p>

            <h1 className={`font-temple font-bold text-[#073c2d] ${currentRole === 'Family User' ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-5xl'}`}>
              {currentRole === 'Family User' ? 'Temple Announcements' : 'Announcements'}
            </h1>

            <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#394238] sm:text-lg">
              {currentRole === 'Family User'
                ? 'Stay connected with your temple community.'
                : currentRole === 'Super Admin'
                  ? 'View announcements published by registered temples.'
                  : 'Manage announcements for the selected temple.'}
            </p>

            <div className="mt-4 h-[3px] w-16 rounded-full bg-[#c18d22]" />
          </div>

          {/* Super Admin temple selector */}
          {currentRole === 'Super Admin' && (
            <div className="absolute right-4 top-4 z-20 w-56 rounded-xl border border-[#e8d9b8] bg-white/95 p-3 shadow-sm sm:right-6 sm:top-6">
              <label
                htmlFor="announcement-temple-select"
                className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[#173d30]"
              >
                <Building2 size={14} className="text-[#a77b1d]" />
                Select Temple
              </label>

              <select
                id="announcement-temple-select"
                value={selectedTempleId}
                onChange={event => {
                  setSelectedTempleId(event.target.value)
                  setActiveFilter('All')
                  setSearch('')
                  setPage(1)
                  setSelectedMenu(null)
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-[#173d30] outline-none focus:border-[#08734f]"
              >
                {demoTemples.map(temple => (
                  <option key={temple.id} value={temple.id}>
                    {temple.name} — {temple.location}
                  </option>
                ))}
              </select>

              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                Frontend demo temple selection
              </p>
            </div>
          )}

          <div className="absolute right-[28%] top-8 hidden text-center text-[#a77b1d] xl:block">
            <div className="text-5xl">♧</div>

            <p className="mt-1 font-temple text-sm italic text-[#173d30]">
              “Spread the Dhamma,
              <br />
              Build a Stronger Community.”
            </p>
          </div>
        </section>

        

        {currentRole === 'Super Admin' && (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800">
            Super Admin has read-only access to temple announcements.
            Select a temple to view its announcements.
          </div>
        )}

        {/* Temporary role preview: replaced by authenticated role after backend integration */}
        <section className="flex flex-col gap-3 rounded-xl border border-[#e9e2d2] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#173d30]">
              Preview announcement UI as
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Temporary frontend preview only. Real access will come from the logged-in account.
            </p>
          </div>

          <select
            value={currentRole}
            onChange={event => {
              setCurrentRole(event.target.value as AnnouncementRole)
              setActiveFilter('All')
              setSearch('')
              setPage(1)
              setSelectedMenu(null)
              setShowModal(false)
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#173d30] outline-none focus:border-[#08734f] sm:max-w-[230px]"
            aria-label="Preview role"
          >
            <option value="Super Admin">Super Admin</option>
            <option value="Temple Admin">Temple Admin</option>
            <option value="Co-Administrator">Co-Administrator</option>
            <option value="Family User">Family User</option>
          </select>
        </section>

        {/* Super Admin platform overview */}
        {currentRole === 'Super Admin' && (
          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {[
                {
                  label: 'Registered Temples',
                  value: demoTemples.length,
                  icon: Building2,
                },
                {
                  label: 'Temples with Announcements',
                  value: platformOverview.templesWithAnnouncements,
                  icon: Globe,
                },
                {
                  label: 'Total Announcements',
                  value: platformOverview.total,
                  icon: Megaphone,
                },
                {
                  label: 'Scheduled Announcements',
                  value: platformOverview.scheduled,
                  icon: CalendarDays,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-xl border border-[#e9e2d2] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">{label}</p>
                    <Icon size={19} className="text-[#a77b1d]" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[#173d30]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#e9e2d2] bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-temple text-lg font-bold text-[#173d30]">
                    Temple Overview
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select a temple to view its announcements.
                  </p>
                </div>

                <span className="rounded-full bg-[#f5f0e4] px-3 py-1 text-[11px] font-semibold text-[#80621d]">
                  Platform overview
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {templeOverview.map(temple => (
                  <button
                    type="button"
                    key={temple.id}
                    onClick={() => {
                      setSelectedTempleId(temple.id)
                      setActiveFilter('All')
                      setSearch('')
                      setPage(1)
                      setSelectedMenu(null)
                    }}
                    className={`rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                      selectedTempleId === temple.id
                        ? 'border-[#08734f] bg-[#f1f8f3] ring-1 ring-[#08734f]'
                        : 'border-slate-200 bg-white hover:border-[#c9b47d]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5f0e4] text-[#9a741e]">
                        <Building2 size={20} />
                      </div>

                      {selectedTempleId === temple.id && (
                        <span className="rounded-full bg-[#dcefe2] px-2 py-1 text-[10px] font-semibold text-[#075039]">
                          Selected
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-[#173d30]">
                      {temple.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {temple.location}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-[10px] text-slate-500">Total</p>
                        <p className="text-base font-bold text-[#173d30]">
                          {temple.total}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Published</p>
                        <p className="text-base font-bold text-emerald-700">
                          {temple.published}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Scheduled</p>
                        <p className="text-base font-bold text-sky-700">
                          {temple.scheduled}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#08734f]">
                      View announcements <ChevronRight size={14} />
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {currentRole !== 'Super Admin' && currentRole !== 'Family User' && (
          <div className="flex flex-col gap-1 rounded-lg border border-[#d9e8df] bg-[#f2f8f4] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-[#173d30]">
              {currentRole === 'Temple Admin'
                ? 'Temple Administrator'
                : currentRole === 'Co-Administrator'
                  ? 'Co-Administrator'
                  : 'Family User'} view
            </p>

            <p className="text-xs text-slate-600">
              Assigned temple: {selectedTemple?.name ?? 'Your temple'} · Temple selection is restricted.
            </p>
          </div>
        )}

        {currentRole === 'Co-Administrator' && (
          <div className="rounded-lg border border-[#d9e8df] bg-[#f2f8f4] px-4 py-3 text-xs leading-relaxed text-[#173d30]">
            As a Co-Administrator, you have the same announcement
            management permissions as the Temple Administrator
            for your assigned temple.
          </div>
        )}

        {/* Summary cards are kept for management roles. Family users get a focused announcement feed. */}
        {currentRole !== 'Family User' && <AnnouncementStats counts={counts} />}

        {/* Main Content */}
        <section className={`grid grid-cols-1 items-start gap-4 ${currentRole === 'Family User' ? '' : '2xl:grid-cols-[minmax(0,1fr)_345px]'}`}>

          {/* Announcement Management */}
          <div className="min-w-0 rounded-xl border border-[#e9e7df] bg-white p-4 shadow-sm sm:p-5">

            {/* Temple identity */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f8f7f2] px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Building2 size={16} className="text-[#a77b1d]" />
                <strong className="text-[#173d30]">
                  {selectedTemple?.name ?? 'Selected Temple'}
                </strong>
              </div>
              <span className="text-[10px] font-medium text-slate-500">
                {selectedTemple?.location}
              </span>
            </div>

            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div className="flex items-center gap-3">
                <Megaphone
                  size={30}
                  className="shrink-0 text-[#c28d1f]"
                />

                <div>
                  <h2 className="font-temple text-xl font-bold text-[#122f27]">
                    {currentRole === 'Family User' ? 'Latest Announcements' : 'All Announcements'}
                  </h2>

                  <p className="text-xs text-slate-500">
                    {currentRole === 'Family User'
                      ? 'The latest news and updates from your temple'
                      : currentRole === 'Super Admin'
                        ? 'View announcements for the selected temple'
                        : currentRole === 'Co-Administrator'
                          ? 'Create, publish and manage announcements for your assigned temple'
                          : 'Create, publish and manage announcements for your temple'}
                  </p>
                </div>
              </div>

              {/* Only roles with create permission see this button. */}
              {permissions.canCreate && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#075039] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#063c2c]"
                >
                  <Plus size={18} />
                  Create Announcement
                </button>
              )}
            </div>

            {/* Family users need a simple search; management roles retain status filters. */}
            {currentRole === 'Family User' ? (
              <div className="mt-5 max-w-xl">
                <label htmlFor="family-announcement-search" className="sr-only">
                  Search temple announcements
                </label>
                <div className="relative">
                  <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="family-announcement-search"
                    type="search"
                    value={search}
                    onChange={event => {
                      setPage(1)
                      setSearch(event.target.value)
                    }}
                    placeholder="Search announcements..."
                    className="w-full rounded-lg border border-slate-200 bg-[#fbfcfa] py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#08734f] focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            ) : (
              <AnnouncementFilters
                activeFilter={activeFilter}
                onFilterChange={filter => {
                  setPage(1)
                  setActiveFilter(filter)
                }}
                search={search}
                onSearchChange={value => {
                  setPage(1)
                  setSearch(value)
                }}
                counts={counts}
              />
            )}

            {/* Super Admin and Family User receive read-only announcement feeds. */}
            {currentRole === 'Family User' || currentRole === 'Super Admin' ? (
              <div className="mt-4 space-y-3">
                {paginatedAnnouncements.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                    <Bell size={28} className="mx-auto text-slate-400" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No announcements available
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      There are no published announcements to show right now. Please check again later.
                    </p>
                  </div>
                ) : (
                  paginatedAnnouncements.map(item => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-[#e8e1d3] bg-white p-4 sm:p-5 transition hover:border-[#c9b47d] hover:shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center rounded-full bg-[#f5f0e4] px-2.5 py-1 text-[10px] font-semibold text-[#80621d]">
                          {item.category}
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <CalendarDays size={14} className="text-[#a77b1d]" />
                          {item.date}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold leading-snug text-[#173d30]">
                        {item.title}
                      </h3>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <Users size={14} />
                          {item.audience}
                        </span>

                        <button
                          type="button"
                          onClick={() => openViewModal(item)}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#075039] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#063c2c]"
                        >
                          Read announcement <ChevronRight size={14} />
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            ) : (
              <AnnouncementTable
                announcements={paginatedAnnouncements}
                selectedMenu={selectedMenu}
                onMenuToggle={id =>
                  setSelectedMenu(current => current === id ? null : id)
                }
                onDelete={removeAnnouncement}
                onView={openViewModal}
                onEdit={permissions.canEdit ? openEditModal : openViewModal}
              />
            )}

            {/* Pagination */}
            {filtered.length > ITEMS_PER_PAGE && <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
              <p className="text-xs text-slate-500">
                Showing{' '}
                {filtered.length === 0
                  ? 0
                  : (page - 1) * ITEMS_PER_PAGE + 1}
                {' - '}
                {Math.min(
                  page * ITEMS_PER_PAGE,
                  filtered.length
                )}
                {' of '}
                {filtered.length} announcements
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage(current => Math.max(1, current - 1))
                  }
                  disabled={page === 1}
                  aria-label="Previous page"
                  className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="px-2 text-xs text-slate-600">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage(current =>
                      Math.min(totalPages, current + 1)
                    )
                  }
                  disabled={page >= totalPages}
                  aria-label="Next page"
                  className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>}
          </div>

          {/* Management side panels are not shown in the Family User feed. */}
          {currentRole !== 'Family User' && <div className="space-y-4">
            <>
                {/* Latest Notifications */}
                <div className="rounded-xl border border-[#e9e7df] bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-temple text-lg font-bold">
                      <Bell size={21} className="text-[#c28d1f]" />
                      Latest Notifications
                    </h2>

                    <span className="text-xs font-semibold text-[#08734f]">
                      Recent Activity
                    </span>
                  </div>

                  {activities.length === 0 ? (
                    <div className="py-6 text-center">
                      <Bell size={25} className="mx-auto text-slate-300" />

                      <p className="mt-2 text-xs font-medium text-slate-500">
                        No recent activity
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Announcement activities will appear here.
                      </p>
                    </div>
                  ) : (
                    activities.map(activity => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          {activity.action === 'created' ? (
                            <Plus size={18} />
                          ) : activity.action === 'updated' ? (
                            <FileText size={18} />
                          ) : (
                            <X size={18} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#26372f]">
                            {activity.title}
                          </p>

                          <p className="mt-1 truncate text-[11px] text-slate-500">
                            {activity.subtitle}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {activity.templeName}
                          </p>
                        </div>

                        <span className="whitespace-nowrap text-[10px] text-slate-500">
                          {activity.time}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Actions are available only to temple management roles. */}
                {currentRole !== 'Super Admin' && (
                  <div className="rounded-xl border border-[#e9e7df] bg-white p-4 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-temple text-lg font-bold">
                      <Settings size={21} className="text-[#c28d1f]" />
                      Quick Actions
                    </h2>

                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map(({ title, icon: Icon, color, action }) => (
                        <button
                          type="button"
                          key={title}
                          onClick={action}
                          className={`flex min-h-[78px] items-center gap-2 rounded-xl p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${color}`}
                        >
                          <Icon size={23} className="shrink-0" />

                          <span className="text-xs font-semibold leading-snug">
                            {title}
                          </span>

                          <ChevronRight size={15} className="ml-auto shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Communication Channels */}
                <div className="rounded-xl border border-[#e9e7df] bg-white p-4 shadow-sm">
                  <h2 className="mb-3 flex items-center gap-2 font-temple text-lg font-bold">
                    <Globe size={20} className="text-[#c28d1f]" />
                    Communication Channels
                  </h2>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span>Email notifications</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                        Demo only
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span>WhatsApp / SMS</span>
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">
                        Not connected
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span>Mobile push</span>
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">
                        Not connected
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                    Communication integrations will be connected during backend development.
                  </p>
                </div>
            </>
          </div>}
        </section>
      </main>

      {/* Announcement Modal */}
      {showModal && (
        <AnnouncementModal
          mode={modalMode}
          announcement={selectedAnnouncement}
          selectedTemple={
            selectedTemple
              ? { id: selectedTemple.id, name: selectedTemple.name }
              : undefined
          }
          onClose={closeModal}
          onCreate={createAnnouncement}
          onUpdate={updateAnnouncement}
          isFamilyView={
            currentRole === 'Family User' ||
            currentRole === 'Super Admin'
          }
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
          className="fixed bottom-5 right-5 z-[100] w-[calc(100%-40px)] max-w-sm"
        >
          <div
            className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${
              toast.type === 'success'
                ? 'border-emerald-200'
                : toast.type === 'error'
                  ? 'border-red-200'
                  : 'border-sky-200'
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                toast.type === 'success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : toast.type === 'error'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-sky-100 text-sky-600'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 size={21} />
              ) : toast.type === 'error' ? (
                <AlertCircle size={21} />
              ) : (
                <Bell size={21} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">
                {toast.type === 'success'
                  ? 'Success'
                  : toast.type === 'error'
                    ? 'Error'
                    : 'Information'}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
