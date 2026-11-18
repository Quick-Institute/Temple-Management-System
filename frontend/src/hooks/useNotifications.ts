
import {useCallback, useEffect, useMemo, useState} from 'react'
import {type Notification, notifications as demoNotifications} from '../data/demo'
import {useActiveTemple} from './useActiveTemple'
import {useAuth} from '../context/AuthContext'

type StoredAnnouncementNotification = {
    id: string
    title: string
    body: string
    audience: string
    createdAt: string
    to: string
}

type KeyedState<T> = {
    key: string
    value: T
}

const loadList = (key: string): string[] => {
    try {
        const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? '[]')
        return Array.isArray(parsed) ? parsed as string[] : []
    } catch {
        return []
    }
}

const readAnnouncementNotifications = (templeId: string): StoredAnnouncementNotification[] => {
    try {
        const parsed: unknown = JSON.parse(
            window.localStorage.getItem(`tms.announcement.notifications.${templeId}`) ?? '[]'
        )
        return Array.isArray(parsed) ? parsed as StoredAnnouncementNotification[] : []
    } catch {
        return []
    }
}

const audiencesForRole = (role?: string) => {
    switch (role) {
        case 'family':
            return ['All Community', 'Families']
        case 'committeeRepresentative':
            return ['All Community', 'Committee Members']
        case 'religiousRepresentative':
            return ['All Community', 'Monks']
        case 'templeAdmin':
        case 'coAdmin':
        case 'superAdmin':
            return ['All Community', 'Families', 'Committee Members', 'Volunteers', 'Monks']
        default:
            return ['All Community']
    }
}

/**
 * Notification state for the top-bar bell. Demo notifications are retained, while published
 * announcements add persistent, temple-scoped in-app notifications for their selected audience.
 * No external messaging provider is called here.
 */
export const useNotifications = () => {
    const [openId, setOpenId] = useState<string | null>(null)

    const {temple} = useActiveTemple()
    const {user} = useAuth()

    const templeId = temple?.id ?? 'unassigned'
    const userId = user?.id ?? user?.identifier ?? 'anonymous'

    const readStorageKey = `tms.notifications.read.${templeId}.${userId}`
    const clearedStorageKey = `tms.notifications.cleared.${templeId}.${userId}`
    const announcementStorageKey = `tms.announcement.notifications.${templeId}`

    const [readState, setReadState] = useState<KeyedState<string[]>>(() => ({
        key: readStorageKey,
        value: loadList(readStorageKey),
    }))

    const [clearedState, setClearedState] = useState<KeyedState<string[]>>(() => ({
        key: clearedStorageKey,
        value: loadList(clearedStorageKey),
    }))

    const [announcementState, setAnnouncementState] =
        useState<KeyedState<StoredAnnouncementNotification[]>>(() => ({
            key: announcementStorageKey,
            value: readAnnouncementNotifications(templeId),
        }))

    // Use the correct stored data when the active temple or user changes.
    const readIds = readState.key === readStorageKey
        ? readState.value
        : loadList(readStorageKey)

    const clearedIds = clearedState.key === clearedStorageKey
        ? clearedState.value
        : loadList(clearedStorageKey)

    const announcementRecords = announcementState.key === announcementStorageKey
        ? announcementState.value
        : readAnnouncementNotifications(templeId)

    // Listen for announcement updates.
    useEffect(() => {
        const refresh = () => {
            setAnnouncementState({
                key: announcementStorageKey,
                value: readAnnouncementNotifications(templeId),
            })
        }

        const onStorage = (event: StorageEvent) => {
            if (event.key === announcementStorageKey) {
                refresh()
            }
        }

        window.addEventListener('storage', onStorage)
        window.addEventListener('tms:announcement-notification', refresh)

        return () => {
            window.removeEventListener('storage', onStorage)
            window.removeEventListener('tms:announcement-notification', refresh)
        }
    }, [templeId, announcementStorageKey])

    // Save read notification IDs.
    useEffect(() => {
        if (readState.key !== readStorageKey) return

        try {
            window.localStorage.setItem(readStorageKey, JSON.stringify(readState.value))
        } catch {
            // Ignore storage errors.
        }
    }, [readState, readStorageKey])

    // Save cleared notification IDs.
    useEffect(() => {
        if (clearedState.key !== clearedStorageKey) return

        try {
            window.localStorage.setItem(clearedStorageKey, JSON.stringify(clearedState.value))
        } catch {
            // Ignore storage errors.
        }
    }, [clearedState, clearedStorageKey])

    const audienceGroups = useMemo(
        () => audiencesForRole(user?.role),
        [user?.role]
    )

    const announcementItems = useMemo<Notification[]>(
        () => announcementRecords
            .filter(item => audienceGroups.includes(item.audience))
            .map(item => ({
                id: item.id,
                title: item.title,
                body: item.body,
                time: new Date(item.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                }),
                tone: 'info' as const,
                read: false,
                to: item.to,
            })),
        [announcementRecords, audienceGroups]
    )

    const items = useMemo<Notification[]>(
        () => [
            ...announcementItems,
            ...demoNotifications,
        ]
            .filter(item => !clearedIds.includes(item.id))
            .map(item => ({
                ...item,
                read: item.read || readIds.includes(item.id),
            })),
        [announcementItems, readIds, clearedIds]
    )

    const unread = items.filter(item => !item.read).length

    const markRead = useCallback((id: string) => {
        const nextIds = readIds.includes(id)
            ? readIds
            : [...readIds, id]

        setReadState({
            key: readStorageKey,
            value: nextIds,
        })
    }, [readIds, readStorageKey])

    const markUnread = useCallback((id: string) => {
        setReadState({
            key: readStorageKey,
            value: readIds.filter(item => item !== id),
        })
    }, [readIds, readStorageKey])

    const markAllRead = useCallback(() => {
        setReadState({
            key: readStorageKey,
            value: [...new Set([...readIds, ...items.map(item => item.id)])],
        })
    }, [items, readIds, readStorageKey])

    const reset = useCallback(() => {
        setReadState({
            key: readStorageKey,
            value: [],
        })
    }, [readStorageKey])

    const clearAll = useCallback(() => {
        setClearedState({
            key: clearedStorageKey,
            value: [...new Set([...clearedIds, ...items.map(item => item.id)])],
        })
    }, [items, clearedIds, clearedStorageKey])

    return {
        items,
        unread,
        markRead,
        markUnread,
        markAllRead,
        reset,
        clearAll,
        openId,
        setOpenId,
    }
}
