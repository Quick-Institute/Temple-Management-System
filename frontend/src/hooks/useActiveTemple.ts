import {useCallback, useSyncExternalStore} from 'react'
import {useAuth} from '../context/AuthContext'
import {useTemples} from '../data/templeStore.tsx'
import {assignedTemplesFor} from '../data/templeAccess'
import type {TempleRecord} from '../data/templeStatus'

const STORAGE_KEY = 'tms.activeTemple'

/*
 * The chosen temple id lives in a tiny module-level store so every screen that reads it - the top
 * bar switcher, the dashboard, Temple Information - updates the moment it changes. It is also
 * written to localStorage, so the choice survives a reload.
 */
let selectedId: string | null = readStored()
const listeners = new Set<() => void>()

function readStored(): string | null {
    try {
        return window.localStorage.getItem(STORAGE_KEY)
    } catch {
        return null
    }
}

const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

const selectTemple = (id: string) => {
    selectedId = id
    try {
        window.localStorage.setItem(STORAGE_KEY, id)
    } catch {
        /* private mode - the choice still applies for this session */
    }
    listeners.forEach((listener) => listener())
}

/**
 * Which temple the signed-in Temple Admin is working on.
 *
 * A chief incumbent can hold more than one temple, so the top bar offers a switcher and this hook
 * is the single source of truth for the choice. The platform administrator controls every temple;
 * a temple is "owned" through `TempleRecord.ownerEmail`.
 */
export const useActiveTemple = (): {
    /** Temples this account may work on, in seed order. */
    temples: TempleRecord[]
    /** The chosen temple (falls back to the first Active one). */
    temple: TempleRecord | undefined
    /** Choose another temple; the choice survives a reload. */
    setTempleId: (id: string) => void
    /** Truthy when there is something to switch between. */
    canSwitch: boolean
} => {
    const {user} = useAuth()
    const {records, activeTemple} = useTemples()
    const stored = useSyncExternalStore(subscribe, () => selectedId, () => null)

    /*
     * Scope the switcher to the temples this account may work on. A Co-Administrator is limited
     * to the temple they are appointed to; a Temple Admin to the temples they own; the platform
     * administrator to every temple. The rules live in data/templeAccess.ts.
     */
    const owned = assignedTemplesFor(user, records)

    /* Nothing marked as owned yet? Fall back to the store's active temple so old records still work. */
    const temples = owned.length ? owned : records.filter((record) => record.id === activeTemple?.id)

    const temple = temples.find((record) => record.id === stored)
        ?? temples.find((record) => record.status === 'Active')
        ?? temples[0]

    const setTempleId = useCallback((id: string) => selectTemple(id), [])

    return {temples, temple, setTempleId, canSwitch: temples.length > 1}
}