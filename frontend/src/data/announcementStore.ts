
import { useCallback, useEffect, useState } from 'react'
import { useActiveTemple } from '../hooks/useActiveTemple'

export type AnnouncementStatus = 'Published' | 'Draft' | 'Cancelled'

export type Announcement = {
  id: number
  title: string
  description: string
  audience: string
  date: string
  status: AnnouncementStatus
  author: string
  image?: string
  cancelledAt?: string
  cancellationReason?: string
}

export const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Vesak Full Moon Poya Day Programme',
    description: 'Join us for the Vesak religious programme at the temple.',
    audience: 'All Community',
    date: '2026-11-15',
    status: 'Published',
    author: 'Temple Administrator',
  },
  {
    id: 2,
    title: 'Monthly Dhamma Sermon',
    description: 'Monthly Dhamma sermon conducted by the temple.',
    audience: 'All Community',
    date: '2026-11-20',
    status: 'Published',
    author: 'Temple Administrator',
  },
  {
    id: 3,
    title: 'Annual Dana Programme Registration',
    description: 'Register for the annual Dana programme.',
    audience: 'Families',
    date: '2026-11-25',
    status: 'Published',
    author: 'Co-Administrator',
  },
  {
    id: 4,
    title: 'Temple Cleaning Campaign',
    description: 'Community cleaning campaign at the temple.',
    audience: 'Volunteers',
    date: '2026-11-10',
    status: 'Draft',
    author: 'Temple Administrator',
  },
]

const getStorageKey = (templeId: string) =>
  `tms.announcements.${templeId}`

const readAnnouncements = (templeId: string): Announcement[] => {
  if (typeof window === 'undefined') {
    return initialAnnouncements.map(item => ({ ...item }))
  }

  try {
    const saved = window.localStorage.getItem(getStorageKey(templeId))

    if (!saved) {
      return initialAnnouncements.map(item => ({ ...item }))
    }

    const parsed: unknown = JSON.parse(saved)

    return Array.isArray(parsed)
      ? parsed as Announcement[]
      : initialAnnouncements.map(item => ({ ...item }))
  } catch {
    return initialAnnouncements.map(item => ({ ...item }))
  }
}

export const useAnnouncements = () => {
  const { temple } = useActiveTemple()
  const templeId = temple?.id ?? 'unassigned'

  const [store, setStore] = useState<{
    templeId: string
    items: Announcement[]
  }>(() => ({
    templeId,
    items: readAnnouncements(templeId),
  }))

  // Use data belonging to the currently selected temple.
  const announcements =
    store.templeId === templeId
      ? store.items
      : readAnnouncements(templeId)

  const setAnnouncements = useCallback(
    (
      update:
        | Announcement[]
        | ((previous: Announcement[]) => Announcement[]),
    ) => {
      setStore(current => {
        const previous =
          current.templeId === templeId
            ? current.items
            : readAnnouncements(templeId)

        const nextItems =
          typeof update === 'function'
            ? update(previous)
            : update

        return {
          templeId,
          items: nextItems,
        }
      })
    },
    [templeId],
  )

  // Persist only the current temple's announcement records.
  useEffect(() => {
    if (store.templeId !== templeId || typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(
        getStorageKey(templeId),
        JSON.stringify(store.items),
      )
    } catch {
      // Storage may be unavailable or full.
    }
  }, [store, templeId])

  // Listen for changes made in other browser tabs.
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key !== getStorageKey(templeId)) {
        return
      }

      setStore({
        templeId,
        items: readAnnouncements(templeId),
      })
    }

    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener('storage', refresh)
    }
  }, [templeId])

  return [announcements, setAnnouncements] as const
}

/**
 * Creates a temple-scoped in-app notification when an announcement is first published.
 * The existing top-bar notification hook consumes the same storage key and `to` field.
 * This is browser-local UI behaviour; it does not send email, SMS, WhatsApp or push messages.
 */
export const createAnnouncementSystemNotification = (
  templeId: string,
  announcement: Pick<
    Announcement,
    | 'id'
    | 'title'
    | 'description'
    | 'audience'
    | 'date'
    | 'author'
    | 'image'
  >,
) => {
  if (typeof window === 'undefined') return

  const storageKey = `tms.announcement.notifications.${templeId}`

  const notificationId =
    `announcement-${templeId}-${announcement.id}-${Date.now()}`

  const notification = {
    id: notificationId,
    title: `New announcement: ${announcement.title}`,
    body: announcement.description,
    audience: announcement.audience,
    createdAt: new Date().toISOString(),
    category: 'Announcement' as const,
    sourceId: String(announcement.id),
    sourceDate: announcement.date,
    author: announcement.author,
    image: announcement.image,
    to: `/community/notifications?notificationId=${encodeURIComponent(notificationId)}`,
  }

  try {
    const current: unknown = JSON.parse(
      window.localStorage.getItem(storageKey) ?? '[]',
    )

    const notifications = Array.isArray(current) ? current : []

    window.localStorage.setItem(
      storageKey,
      JSON.stringify([notification, ...notifications].slice(0, 100)),
    )
  } catch {
    // The current tab still receives the event if persistent storage is unavailable.
  }

  window.dispatchEvent(
    new CustomEvent('tms:announcement-notification', {
      detail: notification,
    }),
  )
}
