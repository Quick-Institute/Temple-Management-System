
import { Search, X } from 'lucide-react'

export type AnnouncementFilter =
  | 'All'
  | 'Published'
  | 'Draft'
  | 'Scheduled'
  | 'Expired'
  | 'Cancelled'

interface AnnouncementFiltersProps {
  activeFilter: AnnouncementFilter
  onFilterChange: (filter: AnnouncementFilter) => void
  search: string
  onSearchChange: (value: string) => void
  counts: Record<AnnouncementFilter, number>
}

const filters: AnnouncementFilter[] = [
  'All',
  'Published',
  'Draft',
  'Scheduled',
  'Expired',
  'Cancelled',
]

const filterLabels: Record<AnnouncementFilter, string> = {
  All: 'All',
  Published: 'Published',
  Draft: 'Draft',
  Scheduled: 'Scheduled',
  Expired: 'Expired',
  Cancelled: 'Cancelled',
}

export default function AnnouncementFilters({
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
  counts,
}: AnnouncementFiltersProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search announcements..."
          aria-label="Search announcements"
          className="w-full rounded-lg border border-slate-200 bg-[#f9faf9] py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-[#08734f] focus:ring-2 focus:ring-emerald-100"
        />

        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter announcements"
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter

          return (
            <button
              key={filter}
              type="button"
              onClick={() => onFilterChange(filter)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? 'bg-[#08734f] text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-[#34453f] hover:border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              {filterLabels[filter]}

              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {counts[filter] ?? 0}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
