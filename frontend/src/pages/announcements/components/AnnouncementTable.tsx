
import { useEffect, useRef, useState } from 'react'
import type { Announcement, Status } from './AnnouncementModal'

import {
  CalendarDays,
  Users,
  Heart,
  FileText,
  Megaphone,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react'

type AnnouncementTableProps = {
  announcements: Announcement[]
  selectedMenu: number | null
  onMenuToggle: (id: number) => void
  onDelete: (id: number) => void
  onView: (announcement: Announcement) => void
  onEdit: (announcement: Announcement) => void
}

const statusStyle: Record<Status, string> = {
  Published: 'bg-emerald-100 text-emerald-800',
  Draft: 'bg-slate-100 text-slate-700 border border-slate-200',
  Scheduled: 'bg-blue-100 text-blue-800',
  Expired: 'bg-orange-100 text-orange-800',
  Cancelled: 'bg-gray-100 text-gray-700',
}

const statusLabel: Record<Status, string> = {
  Published: 'Published',
  Draft: 'Draft',
  Scheduled: 'Scheduled',
  Expired: 'Expired',
  Cancelled: 'Cancelled',
}

const categoryStyle: Record<string, string> = {
  'Religious Programme': 'bg-violet-50 text-violet-700',
  Community: 'bg-sky-50 text-sky-700',
  'General Notice': 'bg-emerald-50 text-emerald-700',
  Dana: 'bg-amber-50 text-amber-800',
  'System Notice': 'bg-rose-50 text-rose-700',
}

export default function AnnouncementTable({
  announcements,
  selectedMenu,
  onMenuToggle,
  onDelete,
  onView,
  onEdit,
}: AnnouncementTableProps) {
  const [deleteTarget, setDeleteTarget] =
    useState<Announcement | null>(null)

  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const closeDeleteModal = () => {
    setDeleteTarget(null)
  }

  const handleDelete = () => {
    if (!deleteTarget) return

    onDelete(deleteTarget.id)
    setDeleteTarget(null)
  }

  // Handle Escape key and prevent background scrolling
  useEffect(() => {
    if (!deleteTarget) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDeleteModal()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    cancelButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [deleteTarget])

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse text-left">
          <thead>
            <tr className="bg-[#f2f6f5] text-xs text-[#263e36]">
              <th className="rounded-l-lg px-3 py-3">Title</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Target Audience</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Status</th>
              <th className="rounded-r-lg px-3 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {announcements.map(item => (
              <tr
                key={item.id}
                className="border-b border-[#edf0ed] text-xs transition hover:bg-[#fbfcfa]"
              >
                {/* Announcement title */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f6eed9] text-[#98701c]">
                      {item.category === 'Religious Programme' ? (
                        <CalendarDays size={19} />
                      ) : item.category === 'Community' ? (
                        <Users size={19} />
                      ) : item.category === 'Dana' ? (
                        <Heart size={19} />
                      ) : (
                        <FileText size={19} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-[#1b3029]">
                        {item.title}
                      </p>

                      <p className="mt-1 max-w-[210px] truncate text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
                      categoryStyle[item.category] ??
                      'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.category}
                  </span>
                </td>

                {/* Target audience */}
                <td className="px-3 py-3 text-slate-600">
                  {item.audience}
                </td>

                {/* Date */}
                <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                  {item.date}
                </td>

                {/* Status */}
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                      statusStyle[item.status]
                    }`}
                  >
                    {statusLabel[item.status]}
                  </span>
                </td>

                {/* Actions */}
                <td className="relative px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onMenuToggle(item.id)}
                    className="rounded-md p-1.5 transition hover:bg-slate-100"
                    aria-label={`Actions for ${item.title}`}
                    aria-expanded={selectedMenu === item.id}
                  >
                    <MoreVertical size={18} />
                  </button>

                  {selectedMenu === item.id && (
                    <div className="absolute right-5 top-10 z-20 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          onView(item)
                          onMenuToggle(item.id)
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs hover:bg-slate-50"
                      >
                        <Eye size={15} />
                        View details
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onEdit(item)
                          onMenuToggle(item.id)
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs hover:bg-slate-50"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(item)
                          onMenuToggle(item.id)
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {announcements.length === 0 && (
          <div className="py-12 text-center">
            <Megaphone
              size={32}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-semibold text-slate-600">
              No announcements found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try another search or filter.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          onClick={closeDeleteModal}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-800">
                Confirm Deletion
              </h2>

              <button
                type="button"
                onClick={closeDeleteModal}
                aria-label="Close confirmation dialog"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-7">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle size={27} />
              </div>

              <div className="mt-5 text-center">
                <h3
                  id="delete-dialog-title"
                  className="text-lg font-bold text-slate-800"
                >
                  Delete Announcement?
                </h3>

                <p
                  id="delete-dialog-description"
                  className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500"
                >
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-slate-700">
                    "{deleteTarget.title}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={closeDeleteModal}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              >
                Delete Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
