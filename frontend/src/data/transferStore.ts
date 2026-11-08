/* ------------------------------------------------------------------
   Temporary temple transfer requests.

   Flow, exactly as asked:
     family user asks for a temporary transfer to another temple
        -> that temple's Temple Admin reviews it
        -> the Temple Admin approves (or rejects) it
        -> on approval the transfer becomes permanent and the family's previous temple data is
           dropped, so the account only ever holds one temple's records.

   Frontend only: requests and the resulting assignment live in localStorage until the API exists, so a family request
   survives until the reviewing admin opens their own session.
   ------------------------------------------------------------------ */

import {useSyncExternalStore} from 'react'

export type TransferStatus = 'Pending' | 'Approved' | 'Rejected'

export type TransferRequest = {
    id: string
    /** Who asked - shown on the Temple Admin's review card. */
    memberName: string
    memberEmail: string
    familyName: string
    fromTemple: string
    toTemple: string
    reason: string
    submittedOn: string
    status: TransferStatus
    reviewNote?: string
}

const STORAGE_REQUESTS = 'tms.transferRequests'
/** memberEmail -> the temple that member now belongs to (overrides the demo record). */
const STORAGE_ASSIGNMENT = 'tms.templeAssignment'

const SEED: TransferRequest[] = [
    {
        id: 'TR-1041',
        memberName: 'Kumara Wijesuriya',
        memberEmail: 'kumara.w@gmail.com',
        familyName: 'Kumara Family',
        fromTemple: 'Sri Wijayarama Purana Viharaya',
        toTemple: 'Sri Sambodhi Maha Viharaya',
        reason: 'We moved to Kadolkele last month and would like to attend Dana here.',
        submittedOn: '2026-10-24',
        status: 'Pending',
    },
]

type State = { requests: TransferRequest[]; assignment: Record<string, string> }

const read = (key: string) => {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

let state: State = {
    requests: (read(STORAGE_REQUESTS) as TransferRequest[] | null) ?? SEED,
    assignment: (read(STORAGE_ASSIGNMENT) as Record<string, string> | null) ?? {},
}

const listeners = new Set<() => void>()

const commit = (next: State) => {
    state = next
    try {
        localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(next.requests))
        localStorage.setItem(STORAGE_ASSIGNMENT, JSON.stringify(next.assignment))
    } catch {
        /* best effort */
    }
    listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

let counter = 1042

/** A family user asks to move to another temple. */
export const requestTransfer = (input: Omit<TransferRequest, 'id' | 'submittedOn' | 'status'>) => {
    const request: TransferRequest = {
        ...input,
        id: `TR-${counter++}`,
        submittedOn: new Date().toISOString().slice(0, 10),
        status: 'Pending',
    }
    commit({...state, requests: [request, ...state.requests]})
    return request
}

export const approveTransfer = (id: string, note?: string) => {
    const request = state.requests.find((item) => item.id === id)
    if (!request) return
    commit({
        requests: state.requests.map((item) =>
            item.id === id ? {...item, status: 'Approved', reviewNote: note} : item,
        ),
        /* The move is permanent: the member now belongs to the new temple only. */
        assignment: {...state.assignment, [request.memberEmail]: request.toTemple},
    })
}

export const rejectTransfer = (id: string, note?: string) => {
    commit({
        ...state,
        requests: state.requests.map((item) =>
            item.id === id ? {...item, status: 'Rejected', reviewNote: note} : item,
        ),
    })
}

export const useTransferRequests = () => useSyncExternalStore(subscribe, () => state.requests, () => SEED)

/**
 * The temple a member belongs to right now: the approved transfer wins over the demo record, so a
 * transferred family sees only the new temple's data.
 */
export const useMyTempleName = (email: string | undefined, fallback: string | undefined) =>
    useSyncExternalStore(
        subscribe,
        () => (email && state.assignment[email]) || fallback || '',
        () => fallback || '',
    )