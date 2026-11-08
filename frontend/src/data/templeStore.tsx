import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react'

/* ------------------------------------------------------------------
   Temple records and their lifecycle.

   The workflow follows the proposal: the Temple Admin submits a temple, the record waits as
   "Pending approval", and only the Super Administrator's approval assigns the unique
   registration ID and makes the temple Active. A pending request may be edited or dropped by
   the temple admin; deleting an Active temple needs system administrator approval, so it becomes
   a deletion request that can still be cancelled.

   Frontend only: the store lives in memory, so a reload returns the seeded records. When the API
   exists these four calls become the endpoints.
   ------------------------------------------------------------------ */
import type {CoAdministrator, TempleRecord} from './templeStatus'

/* Re-exported so a page can import its record type next to the hook. */
export type {CapacityField, CommitteeMember, TempleDocument, TempleRecord, TempleStatus} from './templeStatus'

/* --------------------------------- seed ---------------------------------- */

/** The demo Temple Admin controls every seeded temple, so the temple switcher has something to do. */
const TEMPLE_ADMIN_EMAIL = 'templeadmin@temple.lk'

const SEED: TempleRecord[] = [
    {
        id: 't-rec-1',
        registrationId: 'SMB-VIH-0042',
        name: 'Sri Sambodhi Maha Viharaya',
        type: 'Maha Viharaya',
        status: 'Active',
        established: '1892',
        chiefIncumbent: 'Ven. Kamburugamuwa Dhammika Thero',
        description:
            'A village maha viharaya serving the Kadolkele and Biyagama villages for over a century. ' +
            'The temple runs daily dana sessions, a Daham Pasal for 180 children, monthly Poya ' +
            'observance programmes, and a donor council that maintains the bodhiya and the relic chamber.',
        address: 'Temple Road, Kadolkele',
        village: 'Kadolkele',
        gnDivision: 'Kadolkele',
        dsDivision: 'Biyagama',
        district: 'Gampaha',
        province: 'Western',
        postalCode: '11500',
        phone: '+94 31 223 4478',
        phoneAlt: '+94 77 312 6640',
        email: 'office@sambodhiviharaya.lk',
        website: 'sambodhiviharaya.lk',
        landExtent: '2 acres, 1 rood, 12 perches',
        facilities: [
            'Buddha Mandiraya', 'Sri Maha Bodhiya', 'Dana Salawa', 'Daham Pasal hall',
            'Library', 'Bhikkhu residence', 'Pilgrim rest hall', 'Vehicle parking',
            'Wheelchair access', 'Water & electricity',
        ],
        capacity: [
            {id: 'cap-1', label: 'Dana hall', seats: '250'},
            {id: 'cap-2', label: 'Daham Pasal hall', seats: '180'},
            {id: 'cap-3', label: 'Chapter house', seats: '40'},
        ],
        danaSessions: ['Morning Dana', 'Lunch Dana', 'Evening Dana'],
        banking: {
            bank: 'Bank of Ceylon',
            branch: 'Kadolkele',
            accountName: 'Sri Sambodhi Maha Viharaya - Dayaka Sabha',
            accountNumber: '0072456891',
        },
        coAdmins: [
            {
                id: 'co-1',
                role: 'Authorized Religious Representative',
                name: 'Ven. Welivita Saranankara Thero',
                email: 'representative@sambodhiviharaya.lk',
                phone: '+94 71 884 2015',
                reference: 'NIC 782145670V',
                appointedOn: '2024-02-06',
                status: 'Active',
            },
            {
                id: 'co-2',
                role: 'Designated Technical Administrator',
                name: 'Mr. D. A. Chandana Perera',
                email: 'tech@sambodhiviharaya.lk',
                phone: '+94 77 220 6681',
                reference: 'NIC 198512304567',
                appointedOn: '2024-02-06',
                status: 'Active',
            },
        ],
        committee: [
            {role: 'Chief Incumbent', name: 'Ven. Kamburugamuwa Dhammika Thero', phone: '+94 31 223 4478'},
            {role: 'Dayaka Sabha President', name: 'Mr. K. P. Jayasinghe', phone: '+94 77 654 2210'},
            {role: 'Secretary', name: 'Mrs. S. Wijesuriya', phone: '+94 71 908 7712'},
            {role: 'Treasurer', name: 'Mr. R. M. Bandara', phone: '+94 77 452 8890'},
            {role: 'Dana Coordinator', name: 'Mrs. A. Herath', phone: '+94 76 331 4402'},
        ],
        documents: [
            {name: 'Temple registration certificate', kind: 'PDF', updated: '12 Jan 2024'},
            {name: 'Land deed - Temple Road', kind: 'PDF', updated: '03 Aug 2021'},
            {name: 'Dayaka Sabha constitution', kind: 'DOCX', updated: '27 May 2025'},
            {name: 'Bank account authorisation', kind: 'PDF', updated: '19 Feb 2026'},
        ],
        submittedOn: '2024-01-12',
        approvedOn: '2024-01-19',
        deletionRequestedOn: null,
        reviewNote: null,
        ownerEmail: TEMPLE_ADMIN_EMAIL,
    },
    {
        id: 't-rec-2',
        registrationId: null,
        name: 'Sri Wijayarama Purana Viharaya',
        type: 'Purana Viharaya',
        status: 'Pending approval',
        established: '1908',
        chiefIncumbent: 'Ven. Horana Dhammajothi Thero',
        description:
            'A purana viharaya in the Horana area, submitting its registration after the Dayaka Sabha ' +
            'restoration of the preaching hall.',
        address: 'Vihara Mawatha, Horana',
        village: 'Horana',
        gnDivision: 'Horana East',
        dsDivision: 'Horana',
        district: 'Kalutara',
        province: 'Western',
        postalCode: '12400',
        phone: '+94 34 226 1188',
        phoneAlt: '',
        email: 'office@wijayarama.lk',
        website: '',
        landExtent: '1 acre, 22 perches',
        facilities: ['Buddha Mandiraya', 'Dana Salawa', 'Bhikkhu residence', 'Vehicle parking'],
        capacity: [{id: 'cap-1', label: 'Dana hall', seats: '120'}],
        danaSessions: ['Morning Dana', 'Lunch Dana'],
        banking: {
            bank: 'People\'s Bank',
            branch: 'Horana',
            accountName: 'Sri Wijayarama Dayaka Sabha',
            accountNumber: '1180045672',
        },
        coAdmins: [],
        committee: [
            {role: 'Chief Incumbent', name: 'Ven. Horana Dhammajothi Thero', phone: '+94 34 226 1188'},
            {role: 'Secretary', name: 'Mr. A. B. Perera', phone: '+94 71 445 9032'},
        ],
        documents: [{name: 'Temple registration certificate', kind: 'PDF', updated: '02 Oct 2026'}],
        submittedOn: '2026-10-24',
        approvedOn: null,
        deletionRequestedOn: null,
        reviewNote: null,
        ownerEmail: TEMPLE_ADMIN_EMAIL,
    },
    {
        id: 't-rec-3',
        registrationId: 'DMR-VIH-0043',
        name: 'Sri Dharmarama Viharaya',
        type: 'Dharmayathanaya',
        status: 'Active',
        established: '1921',
        chiefIncumbent: 'Ven. Aluthgama Sumanasara Thero',
        description: 'A coastal temple known for its Daham Pasal and its monthly almsgiving for the village.',
        address: 'Galle Road, Aluthgama',
        village: 'Aluthgama',
        gnDivision: 'Aluthgama North',
        dsDivision: 'Beruwala',
        district: 'Kalutara',
        province: 'Western',
        postalCode: '12080',
        phone: '+94 34 227 5510',
        phoneAlt: '',
        email: 'office@dharmarama.lk',
        website: '',
        landExtent: '1 acre, 8 perches',
        facilities: ['Buddha Mandiraya', 'Dana Salawa', 'Daham Pasal hall', 'Library', 'Vehicle parking'],
        capacity: [{id: 'cap-1', label: 'Dana hall', seats: '200'}, {
            id: 'cap-2',
            label: 'Daham Pasal hall',
            seats: '95'
        }],
        danaSessions: ['Morning Dana', 'Lunch Dana'],
        banking: {
            bank: 'Bank of Ceylon',
            branch: 'Aluthgama',
            accountName: 'Sri Dharmarama Dayaka Sabha',
            accountNumber: '0074512233'
        },
        coAdmins: [],
        committee: [{
            role: 'Chief Incumbent',
            name: 'Ven. Aluthgama Sumanasara Thero',
            phone: '+94 34 227 5510'
        }, {role: 'Secretary', name: 'Mr. H. S. Fernando', phone: '+94 77 220 1188'}],
        documents: [{name: 'Temple registration certificate', kind: 'PDF', updated: '09 Jan 2026'}],
        submittedOn: '2025-11-18',
        approvedOn: '2026-01-09',
        deletionRequestedOn: null,
        reviewNote: null,
        ownerEmail: TEMPLE_ADMIN_EMAIL,
    },
    {
        id: 't-rec-4',
        registrationId: 'PRN-VIH-0044',
        name: 'Sri Vijayodaya Pirivena',
        type: 'Pirivena',
        status: 'Changes requested',
        established: '1954',
        chiefIncumbent: 'Ven. Kadawatha Ratanasiri Thero',
        description: 'A pirivena training novice monks, submitting its details for the register.',
        address: 'Pirivena Road, Kadawatha',
        village: 'Kadawatha',
        gnDivision: 'Kadawatha West',
        dsDivision: 'Gampaha',
        district: 'Gampaha',
        province: 'Western',
        postalCode: '11850',
        phone: '+94 33 229 7741',
        phoneAlt: '',
        email: 'office@vijayodaya.lk',
        website: '',
        landExtent: '3 acres',
        facilities: ['Buddha Mandiraya', 'Dana Salawa', 'Bhikkhu residence', 'Library'],
        capacity: [{id: 'cap-1', label: 'Dana hall', seats: '160'}, {id: 'cap-2', label: 'Lecture hall', seats: '120'}],
        danaSessions: ['Morning Dana'],
        banking: {
            bank: "People's Bank",
            branch: 'Kadawatha',
            accountName: 'Vijayodaya Pirivena',
            accountNumber: '1180074451'
        },
        coAdmins: [],
        committee: [{role: 'Chief Incumbent', name: 'Ven. Kadawatha Ratanasiri Thero', phone: '+94 33 229 7741'}],
        documents: [{name: 'Temple registration certificate', kind: 'PDF', updated: '30 Sep 2026'}],
        submittedOn: '2026-09-30',
        approvedOn: null,
        deletionRequestedOn: null,
        reviewNote: 'Please attach the land deed and confirm the Dana hall seating capacity.',
        ownerEmail: TEMPLE_ADMIN_EMAIL,
    },
    {
        id: 't-rec-5',
        registrationId: 'LEN-VIH-0045',
        name: 'Sri Bodhiraja Len Viharaya',
        type: 'Len Viharaya',
        status: 'Deletion requested',
        established: '1789',
        chiefIncumbent: 'Ven. Mawanella Ananda Thero',
        description: 'A cave temple on the Mawanella hillside, cared for by the village Dayaka Sabha.',
        address: 'Cave Temple Road, Mawanella',
        village: 'Mawanella',
        gnDivision: 'Mawanella',
        dsDivision: 'Mawanella',
        district: 'Kegalle',
        province: 'Sabaragamuwa',
        postalCode: '71500',
        phone: '+94 35 224 3311',
        phoneAlt: '',
        email: 'office@bodhiraja.lk',
        website: '',
        landExtent: '40 perches',
        facilities: ['Buddha Mandiraya', 'Bhikkhu residence', 'Water & electricity'],
        capacity: [{id: 'cap-1', label: 'Dana hall', seats: '60'}],
        danaSessions: ['Morning Dana', 'Evening Dana'],
        banking: {
            bank: 'Sampath Bank',
            branch: 'Mawanella',
            accountName: 'Bodhiraja Len Viharaya',
            accountNumber: '0092117744'
        },
        coAdmins: [],
        committee: [{role: 'Chief Incumbent', name: 'Ven. Mawanella Ananda Thero', phone: '+94 35 224 3311'}],
        documents: [],
        submittedOn: '2024-06-11',
        approvedOn: '2024-07-02',
        deletionRequestedOn: '2026-10-20',
        reviewNote: null,
        ownerEmail: TEMPLE_ADMIN_EMAIL,
    },
]

/* ------------------------------ generation -------------------------------- */

/**
 * Registration IDs follow the code the temple register already uses: three letters taken from
 * the temple name, then VIH, then a serial. Placeholder for the Super Administrator's numbering
 * scheme, which the proposal leaves to be agreed.
 */
const nextRegistrationId = (name: string, existing: TempleRecord[]): string => {
    const letters = (name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'TMP')
    const serials = existing
        .map((record) => record.registrationId?.split('-').pop())
        .filter((serial): serial is string => Boolean(serial && /^\d+$/.test(serial)))
        .map(Number)
    const next = Math.max(41, ...serials) + 1
    return `${letters}-VIH-${String(next).padStart(4, '0')}`
}

const today = () => new Date().toISOString().slice(0, 10)

/* -------------------------------- context --------------------------------- */

type TempleStoreValue = {
    records: TempleRecord[]
    getRecord: (id: string) => TempleRecord | undefined
    /** The temple the dashboard is looking at: the first Active record. */
    activeTemple: TempleRecord | undefined
    createRequest: (draft: Omit<TempleRecord, 'id' | 'registrationId' | 'status' | 'submittedOn' | 'approvedOn' | 'deletionRequestedOn' | 'reviewNote'>) => TempleRecord
    updateRecord: (id: string, patch: Partial<TempleRecord>) => void
    /** Delete a request that has not been approved yet. */
    dropRequest: (id: string) => void
    /** Ask the system administrator to delete an Active temple. */
    requestDeletion: (id: string) => void
    cancelDeletion: (id: string) => void
    /** Co-Administrator management from the details screen. */
    setCoAdminStatus: (recordId: string, coAdminId: string, status: 'Active' | 'Invited' | 'Suspended') => void
    removeCoAdmin: (recordId: string, coAdminId: string) => void
    /**
     * Appoint a Co-Administrator to one temple. A person may serve only one temple, so the call
     * fails when that email is already appointed somewhere else.
     */
    addCoAdmin: (recordId: string, draft: Omit<CoAdministrator, 'id' | 'appointedOn'>) => { ok: true } | {
        ok: false;
        message: string
    }
    /** Change the details of a Co-Administrator already on this temple. */
    updateCoAdmin: (recordId: string, coAdminId: string, draft: Omit<CoAdministrator, 'id' | 'appointedOn'>) => {
        ok: true
    } | { ok: false; message: string }
    /** Where a person is already a Co-Administrator, if anywhere. */
    coAdminAssignment: (email: string) => { templeId: string; templeName: string } | null
    /** System administrator actions - kept here so the demo can actually reach an approved state. */
    approve: (id: string) => string | null
    requestChanges: (id: string, note: string) => void
}

const TempleStoreContext = createContext<TempleStoreValue | undefined>(undefined)

/* The demo keeps its records in sessionStorage so a refresh does not throw away a request that was
   just submitted. Cleared when the tab closes - nothing leaves the browser. */
const STORAGE_KEY = 'tms.templeRecords'

const loadRecords = (): TempleRecord[] => {
    try {
        const saved = sessionStorage.getItem(STORAGE_KEY)
        if (saved) return JSON.parse(saved) as TempleRecord[]
    } catch {
        /* A blocked or corrupt store just falls back to the seed. */
    }
    return SEED
}

export const TempleStoreProvider = ({children}: { children: ReactNode }) => {
    const [records, setRecords] = useState<TempleRecord[]>(loadRecords)

    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records))
        } catch {
            /* Storage is best-effort: the screens still work without it. */
        }
    }, [records])

    const getRecord = useCallback((id: string) => records.find((record) => record.id === id), [records])

    const createRequest = useCallback<TempleStoreValue['createRequest']>((draft) => {
        const record: TempleRecord = {
            ...draft,
            id: `t-rec-${Date.now()}`,
            registrationId: null,
            status: 'Pending approval',
            submittedOn: today(),
            approvedOn: null,
            deletionRequestedOn: null,
            reviewNote: null,
        }
        setRecords((current) => [record, ...current])
        return record
    }, [])

    const updateRecord = useCallback<TempleStoreValue['updateRecord']>((id, patch) => {
        setRecords((current) => current.map((record) => (
            record.id === id
                /* A correction clears the note the system administrator left, and sends the record
                   back into the approval queue if it was returned for changes. */
                ? {
                    ...record,
                    ...patch,
                    status: record.status === 'Changes requested' ? 'Pending approval' : record.status,
                    reviewNote: record.status === 'Changes requested' ? null : record.reviewNote,
                }
                : record
        )))
    }, [])

    const dropRequest = useCallback<TempleStoreValue['dropRequest']>((id) => {
        setRecords((current) => current.filter((record) => (
            /* Only a record that has not been approved may be dropped outright. */
            record.id !== id || !(record.status === 'Pending approval' || record.status === 'Changes requested')
        )))
    }, [])

    const requestDeletion = useCallback<TempleStoreValue['requestDeletion']>((id) => {
        setRecords((current) => current.map((record) => (
            record.id === id && record.status === 'Active'
                ? {...record, status: 'Deletion requested', deletionRequestedOn: today()}
                : record
        )))
    }, [])

    const cancelDeletion = useCallback<TempleStoreValue['cancelDeletion']>((id) => {
        setRecords((current) => current.map((record) => (
            record.id === id && record.status === 'Deletion requested'
                ? {...record, status: 'Active', deletionRequestedOn: null}
                : record
        )))
    }, [])

    const setCoAdminStatus = useCallback<TempleStoreValue['setCoAdminStatus']>((recordId, coAdminId, status) => {
        setRecords((current) => current.map((record) => (
            record.id === recordId
                ? {
                    ...record,
                    coAdmins: record.coAdmins.map((admin) => (
                        admin.id === coAdminId ? {...admin, status} : admin
                    )),
                }
                : record
        )))
    }, [])

    const removeCoAdmin = useCallback<TempleStoreValue['removeCoAdmin']>((recordId, coAdminId) => {
        setRecords((current) => current.map((record) => (
            record.id === recordId
                ? {...record, coAdmins: record.coAdmins.filter((admin) => admin.id !== coAdminId)}
                : record
        )))
    }, [])

    /*
     * A Co-Administrator belongs to exactly one temple. `records` is read here (not inside the state
     * update) so the duplicate check sees the current appointments before anything changes.
     */
    const coAdminAssignment = useCallback<TempleStoreValue['coAdminAssignment']>((email) => {
        const needle = email.trim().toLowerCase()
        if (!needle) return null
        for (const record of records) {
            if (record.coAdmins.some((admin) => admin.email.trim().toLowerCase() === needle)) {
                return {templeId: record.id, templeName: record.name}
            }
        }
        return null
    }, [records])

    const addCoAdmin = useCallback<TempleStoreValue['addCoAdmin']>((recordId, draft) => {
        const email = draft.email.trim().toLowerCase()
        if (!draft.name.trim()) return {ok: false, message: 'Enter the name of the person.'}
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return {ok: false, message: 'Enter a valid email address.'}

        const taken = coAdminAssignment(email)
        const target = records.find((record) => record.id === recordId)
        if (taken && taken.templeId !== recordId) {
            return {
                ok: false,
                message: `${email} is already a Co-Administrator of ${taken.templeName}. One Co-Administrator can serve only one temple.`
            }
        }
        if (taken && taken.templeId === recordId) {
            return {ok: false, message: `${email} is already a Co-Administrator of this temple.`}
        }
        if (!target) return {ok: false, message: 'That temple no longer exists.'}

        const admin: CoAdministrator = {
            ...draft,
            email,
            id: `co-${Date.now()}`,
            appointedOn: today(),
        }
        setRecords((current) => current.map((record) => (
            record.id === recordId ? {...record, coAdmins: [...record.coAdmins, admin]} : record
        )))
        return {ok: true}
    }, [records, coAdminAssignment])

    const updateCoAdmin = useCallback<TempleStoreValue['updateCoAdmin']>((recordId, coAdminId, draft) => {
        const email = draft.email.trim().toLowerCase()
        if (!draft.name.trim()) return {ok: false, message: 'Enter the name of the person.'}
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return {ok: false, message: 'Enter a valid email address.'}

        const target = records.find((record) => record.id === recordId)
        if (!target) return {ok: false, message: 'That temple no longer exists.'}

        /* Someone else may already hold this email - here or at another temple. */
        for (const record of records) {
            const clash = record.coAdmins.find((admin) => (
                admin.id !== coAdminId && admin.email.trim().toLowerCase() === email
            ))
            if (!clash) continue
            return {
                ok: false,
                message: record.id === recordId
                    ? `${email} is already a Co-Administrator of this temple.`
                    : `${email} is already a Co-Administrator of ${record.name}. One Co-Administrator can serve only one temple.`,
            }
        }

        setRecords((current) => current.map((record) => (
            record.id === recordId
                ? {
                    ...record,
                    coAdmins: record.coAdmins.map((admin) => (
                        admin.id === coAdminId ? {...admin, ...draft, email} : admin
                    )),
                }
                : record
        )))
        return {ok: true}
    }, [records])

    /*
     * The registration ID is worked out before the state update, not inside it: the callback below
     * runs on React's schedule, so reading a value it assigned would always see the old one.
     */
    const approve = useCallback<TempleStoreValue['approve']>((id) => {
        const target = records.find((record) => record.id === id)
        if (!target) return null

        /* Approving a deletion request removes the temple. */
        if (target.status === 'Deletion requested') {
            setRecords((current) => current.filter((record) => record.id !== id))
            return null
        }

        const registrationId = target.registrationId ?? nextRegistrationId(target.name, records)
        setRecords((current) => current.map((record) => (
            record.id === id
                ? {...record, registrationId, status: 'Active', approvedOn: today(), reviewNote: null}
                : record
        )))
        return registrationId
    }, [records])

    const requestChanges = useCallback<TempleStoreValue['requestChanges']>((id, note) => {
        setRecords((current) => current.map((record) => (
            record.id === id
                ? {...record, status: 'Changes requested', reviewNote: note}
                : record
        )))
    }, [])

    /* Opening a detail route for a dropped record must not crash - fall back to the first record. */
    const activeTemple = records.find((record) => record.status === 'Active')

    const value = useMemo<TempleStoreValue>(() => ({
        records,
        getRecord,
        activeTemple,
        createRequest,
        updateRecord,
        dropRequest,
        requestDeletion,
        cancelDeletion,
        setCoAdminStatus,
        removeCoAdmin,
        addCoAdmin,
        updateCoAdmin,
        coAdminAssignment,
        approve,
        requestChanges,
    }), [records, getRecord, activeTemple, createRequest, updateRecord, dropRequest, requestDeletion, cancelDeletion, setCoAdminStatus, removeCoAdmin, addCoAdmin, updateCoAdmin, coAdminAssignment, approve, requestChanges])

    return <TempleStoreContext.Provider value={value}>{children}</TempleStoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTemples = () => {
    const context = useContext(TempleStoreContext)
    if (!context) throw new Error('useTemples must be used within TempleStoreProvider')
    return context
}
