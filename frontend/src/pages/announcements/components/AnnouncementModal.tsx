
import { useEffect, useState, type ReactNode } from 'react'
import {
  X,
  Megaphone,
  FileText,
  CalendarDays,
  Users,
  Tag,
  Clock,
  AlertCircle,
  Eye,
  MapPin,
  CalendarClock,
  ShieldCheck,
} from 'lucide-react'

export type Status =
  | 'Published'
  | 'Draft'
  | 'Scheduled'
  | 'Expired'
  | 'Cancelled'

export type Announcement = {
  id: number
  title: string
  description: string
  category: string
  audience: string
  date: string
  status: Status
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent'
  publishAt?: string
  expiresAt?: string
  templeId?: string
  templeName?: string
  templeLocation?: string
  eventDate?: string
  eventTime?: string
  venue?: string
}

type AnnouncementModalProps = {
  mode: 'create' | 'edit' | 'view'
  announcement: Announcement | null
  onClose: () => void
  onCreate: (announcement: Announcement) => void
  onUpdate: (announcement: Announcement) => void
  selectedTemple?: { id: string; name: string }
  isFamilyView?: boolean
}

const categories = [
  'Religious Programme',
  'Community',
  'General Notice',
  'Dana',
  'System Notice',
  'Event',
  'Other',
]

const audiences = [
  'Public',
  'All Members',
  'Family Users',
  'Temple Administrators',
  'Selected Users',
]

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#263d34] outline-none transition focus:border-[#0b6548] focus:ring-2 focus:ring-emerald-100'

const labelClass =
  'mb-1.5 block text-sm font-semibold text-[#253d34]'

function getLocalDateTime() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function formatDate(value?: string) {
  if (!value) return 'Not specified'

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) return value

  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string
  value?: string
  icon?: ReactNode
}) {
  if (!value) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#173c30]">
        {icon}
        {value}
      </p>
    </div>
  )
}

export default function AnnouncementModal({
  mode,
  announcement,
  onClose,
  onCreate,
  onUpdate,
  selectedTemple,
  isFamilyView = false,
}: AnnouncementModalProps) {
  const isViewMode = mode === 'view'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [audience, setAudience] = useState(audiences[0])
  const [priority, setPriority] =
    useState<Announcement['priority']>('Normal')

  const [publishAt, setPublishAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (announcement && mode !== 'create') {
      setTitle(announcement.title)
      setDescription(announcement.description)
      setCategory(announcement.category)
      setAudience(announcement.audience)
      setPriority(announcement.priority ?? 'Normal')
      setPublishAt(announcement.publishAt ?? '')
      setExpiresAt(announcement.expiresAt ?? '')
    } else {
      setTitle('')
      setDescription('')
      setCategory(categories[0])
      setAudience(audiences[0])
      setPriority('Normal')
      setPublishAt('')
      setExpiresAt('')
    }

    setError('')
  }, [announcement, mode, selectedTemple?.id, selectedTemple?.name])

  const validate = () => {
    if (!title.trim()) {
      setError('Please enter an announcement title.')
      return false
    }

    if (!description.trim()) {
      setError('Please enter the announcement description.')
      return false
    }

    if (!category || !audience) {
      setError('Please select a category and target audience.')
      return false
    }

    if (publishAt && expiresAt && expiresAt <= publishAt) {
      setError('Expiry date must be later than the publish date.')
      return false
    }

    return true
  }

  const createRecord = (status: Status) => {
    if (!validate()) return

    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    const record: Announcement = {
      id: announcement?.id ?? Date.now(),
      title: title.trim(),
      description: description.trim(),
      category,
      audience,
      date: currentDate,
      status,
      templeId:
        mode === 'edit'
          ? announcement?.templeId ?? selectedTemple?.id
          : selectedTemple?.id,
      templeName:
        mode === 'edit'
          ? announcement?.templeName ?? selectedTemple?.name
          : selectedTemple?.name,
      priority,
      publishAt: publishAt || undefined,
      expiresAt: expiresAt || undefined,
    }

    if (mode === 'edit' && announcement) {
      onUpdate(record)
    } else {
      onCreate(record)
    }

    onClose()
  }

  const handlePublish = () => {
    createRecord('Published')
  }

  const handleSchedule = () => {
    if (!publishAt) {
      setError('Please select a publishing date and time.')
      return
    }

    createRecord('Scheduled')
  }

  const handleSaveDraft = () => {
    createRecord('Draft')
  }

  const heading =
    mode === 'create'
      ? 'Create Announcement'
      : mode === 'edit'
        ? 'Edit Announcement'
        : 'Announcement Details'

  const subtitle =
    mode === 'create'
      ? 'Create and share important information with your intended audience.'
      : mode === 'edit'
        ? 'Update the announcement information.'
        : 'View the complete announcement information.'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-5"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#eee9df] bg-[#fbfaf6] px-5 py-4 sm:px-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#075039]">
              {isViewMode ? <Eye size={21} /> : <Megaphone size={21} />}
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#123c2d] sm:text-xl">
                {heading}
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 py-5 sm:px-7">

          {/* FAMILY USER DETAILS VIEW */}
          {isViewMode && isFamilyView && announcement ? (
            <article className="space-y-6">

              {/* Announcement heading */}
              <header className="rounded-2xl border border-[#eadfc8] bg-[#fbf8ef] p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#72551a] ring-1 ring-[#e7dcc3]">
                    {announcement.category}
                  </span>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {announcement.status}
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-bold leading-tight text-[#123c2d] sm:text-3xl">
                  {announcement.title}
                </h1>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={16} className="text-[#9a741e]" />
                    Published {announcement.date || 'Date not available'}
                  </span>

                  {announcement.expiresAt && (
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock size={16} className="text-[#9a741e]" />
                      Valid until {formatDate(announcement.expiresAt)}
                    </span>
                  )}
                </div>
              </header>

              {/* Temple information */}
              <section className="rounded-xl border border-[#d9e8df] bg-[#f5f9f6] p-5">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#173c30]">
                  <Megaphone size={18} className="text-[#0b6548]" />
                  Temple Information
                </h2>

                <p className="mt-3 text-base font-semibold text-[#173c30]">
                  {announcement.templeName ||
                    selectedTemple?.name ||
                    'Temple name not available'}
                </p>

                {announcement.templeLocation && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={15} />
                    {announcement.templeLocation}
                  </p>
                )}
              </section>

              {/* Description */}
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[#173c30]">
                  <FileText size={18} className="text-[#0b6548]" />
                  Announcement Details
                </h2>

                <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white px-5 py-5 text-sm leading-7 text-slate-700 sm:text-base">
                  {announcement.description}
                </div>
              </section>

              {/* Programme details */}
              {(announcement.eventDate ||
                announcement.eventTime ||
                announcement.venue) && (
                <section className="rounded-xl border border-[#eadfc8] bg-[#fffdf8] p-5">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#173c30]">
                    <CalendarDays size={18} className="text-[#9a741e]" />
                    Programme Information
                  </h2>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <DetailItem
                      label="Programme Date"
                      value={announcement.eventDate}
                      icon={<CalendarDays size={15} />}
                    />

                    <DetailItem
                      label="Programme Time"
                      value={announcement.eventTime}
                      icon={<Clock size={15} />}
                    />

                    <DetailItem
                      label="Venue"
                      value={announcement.venue}
                      icon={<MapPin size={15} />}
                    />
                  </div>
                </section>
              )}

              {/* Other information */}
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  label="Target Audience"
                  value={announcement.audience}
                  icon={<Users size={16} className="text-[#0b6548]" />}
                />

                <DetailItem
                  label="Announcement Priority"
                  value={announcement.priority || 'Normal'}
                  icon={<Tag size={16} className="text-[#0b6548]" />}
                />
              </section>

              {/* Read-only note */}
              <div className="flex items-start gap-2 rounded-lg bg-[#f5f9f6] p-4 text-sm leading-6 text-[#315b48]">
                <ShieldCheck size={17} className="mt-0.5 shrink-0" />
                You are viewing an announcement shared with your family account. This page is read-only.
              </div>
            </article>
          ) : (

            /* ADMIN CREATE / EDIT / VIEW FORM */
            <div className="space-y-5">

              {/* Selected Temple */}
              <section className="rounded-xl border border-[#d9e8df] bg-[#f2f8f4] p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Megaphone size={17} className="text-[#0b6548]" />
                  <h3 className="text-sm font-bold text-[#173c30]">Temple</h3>
                </div>

                <p className="text-sm font-semibold text-[#173c30]">
                  {announcement?.templeName ||
                    selectedTemple?.name ||
                    'Selected temple'}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  This announcement will be associated with this temple. The temple cannot be changed from this form.
                </p>
              </section>

              {/* Basic Information */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-[#0b6548]" />
                  <h3 className="font-bold text-[#173c30]">
                    Basic Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>
                      Announcement Title <span className="text-red-500">*</span>
                    </label>

                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      disabled={isViewMode}
                      placeholder="Enter announcement title"
                      maxLength={120}
                      className={inputClass}
                    />

                    {!isViewMode && (
                      <p className="mt-1 text-right text-xs text-slate-400">
                        {title.length}/120
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Description <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      disabled={isViewMode}
                      rows={5}
                      maxLength={2000}
                      placeholder="Write the announcement details here..."
                      className={`${inputClass} resize-y`}
                    />

                    {!isViewMode && (
                      <p className="mt-1 text-right text-xs text-slate-400">
                        {description.length}/2000
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Category and Audience */}
              <section className="border-t border-slate-100 pt-5">
                <div className="mb-4 flex items-center gap-2">
                  <Users size={18} className="text-[#0b6548]" />
                  <h3 className="font-bold text-[#173c30]">
                    Category & Target Audience
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      <span className="inline-flex items-center gap-1.5">
                        <Tag size={14} /> Category
                      </span>
                    </label>

                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      disabled={isViewMode}
                      className={inputClass}
                    >
                      {categories.map(item => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={14} /> Target Audience
                      </span>
                    </label>

                    <select
                      value={audience}
                      onChange={e => setAudience(e.target.value)}
                      disabled={isViewMode}
                      className={inputClass}
                    >
                      {audiences.map(item => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Choose who can view this announcement within the selected temple.
                  Actual access restrictions must be enforced by the backend.
                </p>
              </section>

              {/* Priority */}
              <section className="border-t border-slate-100 pt-5">
                <label className={labelClass}>Announcement Priority</label>

                <select
                  value={priority}
                  onChange={e =>
                    setPriority(e.target.value as Announcement['priority'])
                  }
                  disabled={isViewMode}
                  className={inputClass}
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </section>

              {/* Publishing Schedule */}
              <section className="border-t border-slate-100 pt-5">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays size={18} className="text-[#0b6548]" />
                  <h3 className="font-bold text-[#173c30]">
                    Publishing Schedule
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} /> Publish Date & Time
                      </span>
                    </label>

                    <input
                      type="datetime-local"
                      value={publishAt}
                      min={getLocalDateTime()}
                      onChange={e => setPublishAt(e.target.value)}
                      disabled={isViewMode}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} /> Expiry Date & Time
                      </span>
                    </label>

                    <input
                      type="datetime-local"
                      value={expiresAt}
                      min={publishAt || getLocalDateTime()}
                      onChange={e => setExpiresAt(e.target.value)}
                      disabled={isViewMode}
                      className={inputClass}
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Expiry date is optional. An announcement can remain active
                  without a specified expiry date.
                </p>
              </section>

              {/* Existing Status */}
              {isViewMode && announcement && (
                <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-3 font-bold text-[#173c30]">
                    Announcement Status
                  </h3>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      {announcement.status}
                    </span>

                    {announcement.priority && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {announcement.priority} Priority
                      </span>
                    )}
                  </div>
                </section>
              )}

              {/* Validation Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap justify-end gap-2 border-t border-[#eee9df] bg-[#fbfaf6] px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>

          {!isViewMode && (
            <>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="rounded-lg border border-[#0b503b] px-4 py-2.5 text-sm font-semibold text-[#0b503b] transition hover:bg-emerald-50"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={handleSchedule}
                className="rounded-lg border border-[#0b503b] px-4 py-2.5 text-sm font-semibold text-[#0b503b] transition hover:bg-emerald-50"
              >
                Schedule
              </button>

              <button
                type="button"
                onClick={handlePublish}
                className="rounded-lg bg-[#075039] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#063c2c]"
              >
                Publish Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
