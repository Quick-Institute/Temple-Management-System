
import { useMemo, useState, type FormEvent } from 'react'
import { useTempleStoredState } from '../../../data/templePersistentStore'
import { usePermissions } from '../../../hooks/usePermissions'
import {
  Bell,
  Mail,
  MessageCircle,
  Smartphone,
  Send,
  Search,
  Plus,
  Eye,
  Trash2,
  X,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Settings,
  FileText,
  Users,
  Filter,
  Sparkles,
  ChevronDown,
  RefreshCw,
} from 'lucide-react'

type Channel = 'Email' | 'WhatsApp' | 'SMS' | 'Mobile Push'
type DeliveryStatus = 'Sent' | 'Pending' | 'Failed'
type Tab = 'All' | 'Sent' | 'Pending' | 'Failed'

type Notification = {
  id: number
  title: string
  message: string
  channel: Channel
  audience: string
  recipientCount: number | null
  createdAt: string
  status: DeliveryStatus
}

type Template = {
  id: number
  name: string
  channel: Channel
  message: string
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: 'Monthly Pirith Programme',
    message: 'You are invited to participate in the monthly Pirith chanting programme.',
    channel: 'WhatsApp',
    audience: 'All Community',
    recipientCount: 120,
    createdAt: '2026-11-10 09:30',
    status: 'Sent',
  },
  {
    id: 2,
    title: 'Dhamma Sermon Reminder',
    message: 'Reminder: Please join the upcoming Dhamma sermon at the temple.',
    channel: 'Email',
    audience: 'Registered Families',
    recipientCount: 85,
    createdAt: '2026-11-10 10:15',
    status: 'Sent',
  },
  {
    id: 3,
    title: 'Dana Programme Announcement',
    message: 'Please remember the upcoming Dana programme at the temple.',
    channel: 'SMS',
    audience: 'All Community',
    recipientCount: 150,
    createdAt: '2026-11-10 11:00',
    status: 'Pending',
  },
  {
    id: 4,
    title: 'Committee Meeting',
    message: 'Monthly committee meeting reminder for all committee members.',
    channel: 'Mobile Push',
    audience: 'Committee Members',
    recipientCount: 15,
    createdAt: '2026-11-09 14:20',
    status: 'Failed',
  },
]

const initialTemplates: Template[] = [
  {
    id: 1,
    name: 'Event Announcement',
    channel: 'WhatsApp',
    message: 'You are invited to join our upcoming temple event. We look forward to seeing you.',
  },
  {
    id: 2,
    name: 'Programme Reminder',
    channel: 'SMS',
    message: 'Reminder: Our temple programme is coming up. Please join us.',
  },
  {
    id: 3,
    name: 'Community Newsletter',
    channel: 'Email',
    message: 'Dear Community Member, here are the latest temple announcements and updates.',
  },
]

const channels: {
  name: Channel
  description: string
  icon: typeof Mail
  color: string
}[] = [
  {
    name: 'Email',
    description: 'Send email notifications',
    icon: Mail,
    color: 'bg-sky-50 text-sky-700',
  },
  {
    name: 'WhatsApp',
    description: 'Send WhatsApp messages',
    icon: MessageCircle,
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    name: 'SMS',
    description: 'Send SMS notifications',
    icon: Smartphone,
    color: 'bg-violet-50 text-violet-700',
  },
  {
    name: 'Mobile Push',
    description: 'Send mobile push alerts',
    icon: Bell,
    color: 'bg-amber-50 text-amber-700',
  },
]

const statusStyles: Record<DeliveryStatus, string> = {
  Sent: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Failed: 'bg-rose-50 text-rose-700 ring-rose-200',
}

const emptyForm = {
  title: '',
  message: '',
  channel: 'Email' as Channel,
  audience: 'All Community',
}

const defaultChannelSettings: Record<Channel, boolean> = {
  Email: true,
  WhatsApp: true,
  SMS: true,
  'Mobile Push': true,
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useTempleStoredState<Notification[]>('notifications', initialNotifications)

  const [templates, setTemplates] = useTempleStoredState<Template[]>('notification-templates', initialTemplates)

  const [enabledChannels, setEnabledChannels] = useTempleStoredState<Record<Channel, boolean>>('notification-channels', defaultChannelSettings)
  const { canEdit } = usePermissions()
  const canManageNotifications = canEdit('manageAnnouncements')

  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [activeSection, setActiveSection] =
    useState<'history' | 'templates' | 'settings'>('history')

  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState('All')

  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)
  const [viewing, setViewing] = useState<Notification | null>(null)

  const [form, setForm] = useState(emptyForm)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    channel: 'Email' as Channel,
    message: '',
  })

  const [formError, setFormError] = useState('')
  const [templateError, setTemplateError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const sentCount = notifications.filter(
    item => item.status === 'Sent',
  ).length

  const pendingCount = notifications.filter(
    item => item.status === 'Pending',
  ).length

  const failedCount = notifications.filter(
    item => item.status === 'Failed',
  ).length

  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      const searchValue = search.toLowerCase()

      const matchesSearch =
        item.title.toLowerCase().includes(searchValue) ||
        item.message.toLowerCase().includes(searchValue) ||
        item.audience.toLowerCase().includes(searchValue)

      const matchesTab =
        activeTab === 'All' || item.status === activeTab

      const matchesChannel =
        channelFilter === 'All' || item.channel === channelFilter

      return matchesSearch && matchesTab && matchesChannel
    })
  }, [notifications, search, activeTab, channelFilter])

  const openComposer = () => {
    if (!canManageNotifications) return
    setForm(emptyForm)
    setFormError('')
    setSuccessMessage('')
    setIsComposerOpen(true)
  }

  const closeComposer = () => {
    setIsComposerOpen(false)
    setForm(emptyForm)
    setFormError('')
  }

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canManageNotifications) return
    setFormError('')
    setSuccessMessage('')

    if (!enabledChannels[form.channel]) {
      setFormError('This notification channel is currently disabled.')
      return
    }

    if (!form.title.trim() || !form.message.trim()) {
      setFormError('Please complete all required fields.')
      return
    }

    const newNotification: Notification = {
      id: Date.now(),
      title: form.title.trim(),
      message: form.message.trim(),
      channel: form.channel,
      audience: form.audience,
      recipientCount: null, // Calculated by the backend when a real audience directory is connected.
      createdAt: new Date().toLocaleString('en-US'),
      status: 'Pending',
    }

    setNotifications(previous => [newNotification, ...previous])
    closeComposer()
    setActiveSection('history')
    setActiveTab('All')
    setSuccessMessage(
      'Notification created successfully. It is now in the pending queue.',
    )
  }

  const toggleChannel = (channel: Channel) => {
    if (!canManageNotifications) return
    setEnabledChannels(previous => ({
      ...previous,
      [channel]: !previous[channel],
    }))
  }

  const deleteNotification = (id: number) => {
    if (!canManageNotifications) return
    if (!window.confirm('Delete this notification record?')) return

    setNotifications(previous =>
      previous.filter(item => item.id !== id),
    )
  }

  const retryNotification = (id: number) => {
    if (!canManageNotifications) return
    setNotifications(previous =>
      previous.map(item =>
        item.id === id
          ? { ...item, status: 'Pending' }
          : item,
      ),
    )
  }

  const createTemplate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canManageNotifications) return
    setTemplateError('')

    if (
      !templateForm.name.trim() ||
      !templateForm.message.trim()
    ) {
      setTemplateError('Please complete all template fields.')
      return
    }

    const newTemplate: Template = {
      id: Date.now(),
      ...templateForm,
    }

    setTemplates(previous => [newTemplate, ...previous])
    setTemplateForm({
      name: '',
      channel: 'Email',
      message: '',
    })
    setIsTemplateOpen(false)
    setSuccessMessage('Template created successfully.')
  }

  const handleUseTemplate = (template: Template) => {
    setForm({
      ...emptyForm,
      title: template.name,
      message: template.message,
      channel: template.channel,
    })
  
    setActiveSection('history')
    setFormError('')
    setSuccessMessage('')
    setIsComposerOpen(true)
  }

  const deleteTemplate = (id: number) => {
    if (!window.confirm('Delete this template?')) return

    setTemplates(previous =>
      previous.filter(item => item.id !== id),
    )
  }

  return (
    <div className="min-h-screen tms-communications-page space-y-6 p-4 sm:p-6 lg:p-8">

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


      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Community</span>
            <span>/</span>
            <span className="font-medium text-[#0C4A6E]">
              Notifications
            </span>
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0C4A6E]">
            Notification Management
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Manage communication channels, messages and delivery records.
          </p>
        </div>

        <button
          type="button"
          onClick={openComposer}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-5 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-[#0369A1]"
        >
          <Plus size={18} />
          Create Notification
        </button>
      </div>

      {/* Welcome Banner */}
      <div className="tms-hero relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-500 p-6 text-white shadow-sm sm:p-7">
        <div className="relative z-10 max-w-xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-sky-100">
            <Sparkles size={17} />
            Communication Centre
          </div>

          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Stay Connected With Your Community
          </h2>

          <p className="mt-2 text-sm leading-6 text-sky-50">
            Manage temple communications through Email, WhatsApp, SMS and
            Mobile Push notifications.
          </p>
        </div>

        <Bell
          size={130}
          className="absolute -right-3 -bottom-7 rotate-[-12deg] text-white/15"
        />
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900" role="status">
        <strong>Delivery integration is not connected yet.</strong> This frontend saves messages in a temple-specific pending queue. It does not send real Email, WhatsApp, SMS or Mobile Push messages. Provider APIs, backend endpoints, recipient records and delivery callbacks must be configured before a message can be marked as sent.
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Notifications"
          value={notifications.length}
          icon={<Bell size={21} />}
          color="blue"
          subtitle="All notification records"
        />

        <StatCard
          title="Sent Successfully"
          value={sentCount}
          icon={<CheckCircle2 size={21} />}
          color="green"
          subtitle="Successfully marked as sent"
        />

        <StatCard
          title="Pending"
          value={pendingCount}
          icon={<Clock3 size={21} />}
          color="amber"
          subtitle="Waiting for processing"
        />

        <StatCard
          title="Failed"
          value={failedCount}
          icon={<AlertCircle size={21} />}
          color="rose"
          subtitle="Require attention"
        />
      </div>

      {/* Notification Channels */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[#0C4A6E]">
            Notification Channels
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage the communication channels available to the temple.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {channels.map(channel => {
            const Icon = channel.icon
            const enabled = enabledChannels[channel.name]

            return (
              <div
                key={channel.name}
                className="rounded-2xl border border-[#D8E8F3] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl p-3 ${channel.color}`}>
                    <Icon size={22} />
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      enabled
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <h3 className="mt-4 font-semibold text-[#0C4A6E]">
                  {channel.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {channel.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-sky-100 pt-4">
                  <span className="text-xs font-medium text-slate-500">
                    Channel status
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`Toggle ${channel.name}`}
                    onClick={() => toggleChannel(channel.name)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      enabled ? 'bg-[#0284C7]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        enabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Management Section */}
      <section className="tms-panel overflow-hidden rounded-2xl border border-[#D8E8F3] bg-white shadow-sm">

        <div className="border-b border-[#D8E8F3] p-5 sm:p-6">
          <div>
            <h2 className="text-xl font-semibold text-[#0C4A6E]">
              Communication Management
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage delivery history, templates and notification settings.
            </p>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'history', label: 'Delivery History', icon: Clock3 },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      tab.id as 'history' | 'templates' | 'settings',
                    )
                  }
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                    activeSection === tab.id
                      ? 'bg-sage-100 text-[#0C4A6E]'
                      : 'text-slate-500 hover:bg-sky-50 hover:text-[#0C4A6E]'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Delivery History */}
        {activeSection === 'history' && (
          <>
            <div className="flex flex-col gap-3 border-b border-[#D8E8F3] p-5 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="search"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search notifications..."
                  className="w-full rounded-xl border border-[#D8E8F3] bg-[#F7FBFE] py-2.5 pr-3 pl-10 text-sm outline-none focus:border-sky-400 focus:bg-white"
                />
              </div>

              <div className="relative sm:w-56">
                <Filter
                  size={16}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500"
                />

                <select
                  value={channelFilter}
                  onChange={event => setChannelFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#D8E8F3] bg-white py-2.5 pr-9 pl-9 text-sm outline-none focus:border-sky-400"
                >
                  <option value="All">All Channels</option>
                  {channels.map(channel => (
                    <option key={channel.name} value={channel.name}>
                      {channel.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto border-b border-[#D8E8F3] px-5 py-3">
              {(['All', 'Sent', 'Pending', 'Failed'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? 'bg-sage-100 text-[#0C4A6E]'
                      : 'text-slate-500 hover:bg-sky-50'
                  }`}
                >
                  {tab}
                  {tab === 'All' && (
                    <span className="ml-1.5 text-xs">
                      ({notifications.length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="divide-y divide-line-soft">
              {filteredNotifications.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <Bell size={32} className="mx-auto mb-3 text-slate-300" />
                  <h3 className="font-semibold text-[#0C4A6E]">
                    No notifications found
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or filters.
                  </p>
                </div>
              ) : (
                filteredNotifications.map(item => {
                  const channel = channels.find(
                    option => option.name === item.channel,
                  )

                  const Icon = channel?.icon ?? Bell

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-4 p-5 transition hover:bg-sky-50/30 lg:flex-row lg:items-center"
                    >
                      <div className="flex min-w-0 flex-1 gap-4">
                        <div
                          className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl ${
                            channel?.color ?? 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon size={21} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[item.status]}`}
                            >
                              {item.status}
                            </span>

                            <span className="text-xs text-slate-500">
                              {item.channel}
                            </span>
                          </div>

                          <h3 className="font-semibold text-[#0C4A6E]">
                            {item.title}
                          </h3>

                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {item.message}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Users size={14} />
                              {item.audience}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <Send size={14} />
                              {item.recipientCount === null ? 'Recipients not calculated' : `${item.recipientCount} recipients`}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <Clock3 size={14} />
                              {item.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 border-t border-sky-100 pt-3 lg:border-0 lg:pt-0">
                        <button
                          type="button"
                          onClick={() => setViewing(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8E8F3] px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                        >
                          <Eye size={15} />
                          View
                        </button>

                        {item.status === 'Failed' && (
                          <button
                            type="button"
                            onClick={() => retryNotification(item.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                          >
                            <RefreshCw size={14} />
                            Retry
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteNotification(item.id)}
                          className="rounded-lg border border-[#D8E8F3] p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete notification"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="border-t border-[#D8E8F3] px-5 py-4 text-sm text-slate-500">
              Showing{' '}
              <span className="font-semibold text-[#0C4A6E]">
                {filteredNotifications.length}
              </span>{' '}
              of {notifications.length} notifications
            </div>
          </>
        )}

        {/* Templates */}
        {activeSection === 'templates' && (
          <div className="p-5 sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold text-[#0C4A6E]">
                  Message Templates
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create and reuse frequently used messages.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTemplateForm({
                    name: '',
                    channel: 'Email',
                    message: '',
                  })
                  setTemplateError('')
                  setIsTemplateOpen(true)
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0369A1]"
              >
                <Plus size={17} />
                Add Template
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {templates.map(template => {
                const channel = channels.find(
                  item => item.name === template.channel,
                )
                const Icon = channel?.icon ?? FileText

                return (
                  <div
                    key={template.id}
                    className="rounded-xl border border-[#D8E8F3] p-5 transition hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2.5 ${channel?.color}`}>
                          <Icon size={20} />
                        </div>

                        <div>
                          <h4 className="font-semibold text-[#0C4A6E]">
                            {template.name}
                          </h4>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {template.channel}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteTemplate(template.id)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Delete template"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                      {template.message}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleUseTemplate(template)}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#D8E8F3] px-3 py-2 text-sm font-semibold text-[#0C4A6E] hover:bg-sky-50"
                    >
                      Use Template
                      <Send size={14} />
                    </button>
                  </div>
                )
              })}
            </div>

            {templates.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-500">
                No templates available. Create your first template.
              </p>
            )}
          </div>
        )}

        {/* Settings */}
        {activeSection === 'settings' && (
          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <h3 className="font-semibold text-[#0C4A6E]">
                Channel Preferences
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Enable or disable communication channels.
              </p>
            </div>

            {channels.map(channel => {
              const Icon = channel.icon
              const enabled = enabledChannels[channel.name]

              return (
                <div
                  key={channel.name}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-[#D8E8F3] p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-3 ${channel.color}`}>
                      <Icon size={21} />
                    </div>

                    <div>
                      <h4 className="font-semibold text-[#0C4A6E]">
                        {channel.name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        {channel.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => toggleChannel(channel.name)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      enabled ? 'bg-[#0284C7]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        enabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              )
            })}

            <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
              <div className="flex gap-3">
                <AlertCircle size={20} className="flex-none text-sky-700" />
                <div>
                  <h4 className="text-sm font-semibold text-sky-900">
                    Channel Integration
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-sky-800">
                    These settings currently control the frontend demo interface.
                    Actual Email, WhatsApp, SMS and Push delivery requires
                    backend services and provider configuration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed right-5 bottom-5 z-[70] flex max-w-sm items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-xl">
          <CheckCircle2 size={20} className="flex-none text-emerald-600" />
          <p className="flex-1 text-sm text-[#0C4A6E]">
            {successMessage}
          </p>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-slate-500 hover:text-ink"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Create Notification Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D8E8F3] px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-semibold text-[#0C4A6E]">
                  Create Notification
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Compose a message for your community.
                </p>
              </div>

              <button
                type="button"
                onClick={closeComposer}
                className="rounded-lg p-2 text-slate-500 hover:bg-sky-50"
                aria-label="Close composer"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSend}
              className="space-y-4 overflow-y-auto p-5 sm:p-6"
            >
              {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Notification Title *
                </label>
                <input
                  required
                  maxLength={120}
                  value={form.title}
                  onChange={event =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="Enter notification title"
                  className="w-full rounded-xl border border-[#D8E8F3] px-4 py-3 text-sm outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Message *
                </label>
                <textarea
                  required
                  maxLength={2000}
                  rows={5}
                  value={form.message}
                  onChange={event =>
                    setForm({ ...form, message: event.target.value })
                  }
                  placeholder="Write your notification message..."
                  className="w-full resize-y rounded-xl border border-[#D8E8F3] px-4 py-3 text-sm outline-none focus:border-sky-400"
                />
                <p className="mt-1 text-right text-xs text-slate-500">
                  {form.message.length}/2000
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Notification Channel *
                </label>
                <select
                  value={form.channel}
                  onChange={event =>
                    setForm({
                      ...form,
                      channel: event.target.value as Channel,
                    })
                  }
                  className="w-full rounded-xl border border-[#D8E8F3] bg-white px-3 py-3 text-sm outline-none focus:border-sky-400"
                >
                  {channels.map(channel => (
                    <option
                      key={channel.name}
                      value={channel.name}
                      disabled={!enabledChannels[channel.name]}
                    >
                      {channel.name}
                      {!enabledChannels[channel.name] ? ' (Disabled)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Target Audience *
                </label>
                <select
                  value={form.audience}
                  onChange={event =>
                    setForm({ ...form, audience: event.target.value })
                  }
                  className="w-full rounded-xl border border-[#D8E8F3] bg-white px-3 py-3 text-sm outline-none focus:border-sky-400"
                >
                  <option>All Community</option>
                  <option>Registered Families</option>
                  <option>Committee Members</option>
                  <option>Volunteers</option>
                  <option>Monks</option>
                </select>
              </div>

              <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#D8E8F3] pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={closeComposer}
                  className="rounded-xl border border-[#D8E8F3] px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sky-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0369A1]"
                >
                  <Send size={16} />
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {isTemplateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D8E8F3] p-5">
              <h2 className="text-lg font-semibold text-[#0C4A6E]">
                Create Message Template
              </h2>

              <button
                type="button"
                onClick={() => setIsTemplateOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-sky-50"
                aria-label="Close template modal"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={createTemplate} className="space-y-4 p-5">
              {templateError && (
                <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                  {templateError}
                </p>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Template Name *
                </label>
                <input
                  required
                  value={templateForm.name}
                  onChange={event =>
                    setTemplateForm({
                      ...templateForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter template name"
                  className="w-full rounded-xl border border-[#D8E8F3] px-4 py-3 text-sm outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Channel *
                </label>
                <select
                  value={templateForm.channel}
                  onChange={event =>
                    setTemplateForm({
                      ...templateForm,
                      channel: event.target.value as Channel,
                    })
                  }
                  className="w-full rounded-xl border border-[#D8E8F3] bg-white px-3 py-3 text-sm outline-none focus:border-sky-400"
                >
                  {channels.map(channel => (
                    <option key={channel.name} value={channel.name}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={templateForm.message}
                  onChange={event =>
                    setTemplateForm({
                      ...templateForm,
                      message: event.target.value,
                    })
                  }
                  placeholder="Enter reusable message..."
                  className="w-full resize-y rounded-xl border border-[#D8E8F3] px-4 py-3 text-sm outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#D8E8F3] pt-4">
                <button
                  type="button"
                  onClick={() => setIsTemplateOpen(false)}
                  className="rounded-xl border border-[#D8E8F3] px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sky-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#0284C7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0369A1]"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Details */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D8E8F3] p-5">
              <h2 className="text-lg font-semibold text-[#0C4A6E]">
                Notification Details
              </h2>

              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-sky-50"
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[viewing.status]}`}
                >
                  {viewing.status}
                </span>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  {viewing.channel}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0C4A6E]">
                  {viewing.title}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {viewing.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Audience" value={viewing.audience} />
                <DetailItem
                  label="Recipients"
                  value={viewing.recipientCount === null ? 'Not calculated (backend required)' : String(viewing.recipientCount)}
                />
                <DetailItem label="Channel" value={viewing.channel} />
                <DetailItem label="Created At" value={viewing.createdAt} />
              </div>

              <button
                type="button"
                onClick={() => setViewing(null)}
                className="w-full rounded-xl bg-[#0284C7] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0369A1]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type StatCardProps = {
  title: string
  value: number
  subtitle: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'amber' | 'rose'
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
}: StatCardProps) => {
  const colors = {
    blue: 'bg-sky-50 text-sky-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  }

  return (
    <div className="tms-stat-card rounded-2xl border border-[#D8E8F3] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className={`rounded-xl p-2.5 ${colors[color]}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <p className="font-serif text-3xl font-bold tracking-tight text-[#0C4A6E]">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

const DetailItem = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <div className="rounded-xl bg-cream p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 break-words text-sm font-semibold text-[#0C4A6E]">
      {value}
    </p>
  </div>
)

export default NotificationsPage
