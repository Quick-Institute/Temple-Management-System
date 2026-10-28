
import {
  Megaphone,
  CheckCircle2,
  Clock3,
  FileText,
  CalendarClock,
} from 'lucide-react'

type AnnouncementStatsProps = {
  counts: Record<string, number>
}

type StatCardProps = {
  title: string
  value: number
  description: string
  icon: React.ElementType
  iconColor: string
  iconBackground: string
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBackground,
}: StatCardProps) {
  return (
    <div className="group min-w-0 rounded-xl border border-[#e9e7df] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-[#173c30] sm:text-3xl">
            {value}
          </h3>

          <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBackground}`}
        >
          <Icon size={20} className={iconColor} />
        </div>
      </div>
    </div>
  )
}

export default function AnnouncementStats({
  counts,
}: AnnouncementStatsProps) {
  const stats: StatCardProps[] = [
    {
      title: 'Total Announcements',
      value: counts.All ?? 0,
      description: 'All announcements',
      icon: Megaphone,
      iconColor: 'text-[#08734f]',
      iconBackground: 'bg-emerald-50',
    },
    {
      title: 'Published',
      value: counts.Published ?? 0,
      description: 'Currently published',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBackground: 'bg-emerald-50',
    },
    {
      title: 'Pending Approval',
      value: counts.Pending ?? 0,
      description: 'Waiting for approval',
      icon: Clock3,
      iconColor: 'text-amber-600',
      iconBackground: 'bg-amber-50',
    },
    {
      title: 'Drafts',
      value: counts.Draft ?? 0,
      description: 'Saved as drafts',
      icon: FileText,
      iconColor: 'text-slate-600',
      iconBackground: 'bg-slate-100',
    },
    {
      title: 'Scheduled',
      value: counts.Scheduled ?? 0,
      description: 'Scheduled for publishing',
      icon: CalendarClock,
      iconColor: 'text-blue-600',
      iconBackground: 'bg-blue-50',
    },
  ]

  return (
    <section
      aria-label="Announcement statistics"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5"
    >
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </section>
  )
}
