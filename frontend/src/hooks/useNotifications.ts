import {useCallback, useEffect, useMemo, useState} from 'react'
import {type Notification, notifications as demoNotifications} from '../data/demo'

const STORAGE_KEY = 'tms.notifications.read'
const CLEARED_KEY = 'tms.notifications.cleared'

const loadList = (key: string): string[] => {
    try {
        const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]')
        return Array.isArray(parsed) ? (parsed as string[]) : []
    } catch {
        return []
    }
}

const loadRead = (): string[] => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        return Array.isArray(parsed) ? (parsed as string[]) : []
    } catch {
        return []
    }
}

/**
 * Notification state for the bell in the top bar. The demo list comes from src/data/demo.ts and the
 * "read" flags are remembered per browser, so marking something as read survives a reload.
 */
export const useNotifications = () => {
    const [readIds, setReadIds] = useState<string[]>(loadRead)
    /* "Clear all" hides the notifications without losing the demo data underneath. */
    const [clearedIds, setClearedIds] = useState<string[]>(() => loadList(CLEARED_KEY))
    const [openId, setOpenId] = useState<string | null>(null)

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds))
        } catch {
            /* private mode - the panel still works for this session */
        }
    }, [readIds])

    useEffect(() => {
        try {
            window.localStorage.setItem(CLEARED_KEY, JSON.stringify(clearedIds))
        } catch {
            /* private mode */
        }
    }, [clearedIds])

    const items = useMemo<Notification[]>(
        () =>
            demoNotifications
                .filter((item) => !clearedIds.includes(item.id))
                .map((item) => ({...item, read: item.read || readIds.includes(item.id)})),
        [readIds, clearedIds],
    )

    const unread = items.filter((item) => !item.read).length

    const markRead = useCallback((id: string) => {
        setReadIds((current) => (current.includes(id) ? current : [...current, id]))
    }, [])

    const markUnread = useCallback((id: string) => {
        setReadIds((current) => current.filter((item) => item !== id))
    }, [])

    const markAllRead = useCallback(() => {
        setReadIds(demoNotifications.map((item) => item.id))
    }, [])

    const reset = useCallback(() => setReadIds([]), [])

    /** Empty the bell. The list comes back on the next full reload, so the demo keeps its data. */
    const clearAll = useCallback(() => {
        setClearedIds(demoNotifications.map((item) => item.id))
    }, [])

    return {items, unread, markRead, markUnread, markAllRead, reset, clearAll, openId, setOpenId}
}