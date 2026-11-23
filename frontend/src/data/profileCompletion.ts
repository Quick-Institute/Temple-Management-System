import {useSyncExternalStore} from 'react'

/*
 * Profile completion state for people who registered with Google or Facebook.
 *
 * A social provider hands back a name and an email address - nothing else. The fields this project
 * needs for a temple account (phone, temple code, address, NIC, ...) have to be asked for once, on the
 * completion portal, and the visitor may skip that step and come back to it later.
 *
 * Two rules keep the rest of the app simple:
 *
 *   - no draft at all            -> 'complete'  (email/password accounts are not affected)
 *   - draft with missing fields  -> 'skipped' when the visitor chose to continue anyway, otherwise
 *                                   'incomplete'
 *
 * Everything is local (localStorage) because the API is not wired to the frontend yet. When it is,
 * `saveDraft` becomes a PUT and `draftStatus` reads the response.
 */

export type SocialProvider = 'Google' | 'Facebook'

export type CompletionRole = 'temple-admin' | 'committee-member' | 'family-user'

export type ProfileDraft = {
    /** Which provider created the account - decides the wording on the portal. */
    provider: SocialProvider
    /** Name and address exactly as the provider returned them; read-only on the portal. */
    providerName: string
    providerEmail: string
    /** Everything below is what the provider could not give us. */
    role: CompletionRole | ''
    phone: string
    templeCode: string
    village: string
    district: string
    postalCode: string
    address: string
    nic: string
    committee: string
    designation: string
    agreedToTerms: boolean
    /** True when the visitor pressed "skip for now". */
    skipped: boolean
    updatedAt: string
}

export type CompletionStatus = 'complete' | 'incomplete' | 'skipped'

export type CompletionField =
    | 'role'
    | 'phone'
    | 'templeCode'
    | 'village'
    | 'district'
    | 'postalCode'
    | 'address'
    | 'nic'
    | 'committee'
    | 'designation'
    | 'agreedToTerms'

const STORAGE_KEY = 'tms.profile.completion.draft'

const EMPTY_DRAFT: ProfileDraft = {
    provider: 'Google',
    providerName: '',
    providerEmail: '',
    role: '',
    phone: '',
    templeCode: '',
    village: '',
    district: '',
    postalCode: '',
    address: '',
    nic: '',
    committee: '',
    designation: '',
    agreedToTerms: false,
    skipped: false,
    updatedAt: '',
}

/* ------------------------------------------------------------------ */
/* What each role still needs - mirrors the fields on the register     */
/* forms that a provider cannot supply.                                */
/* ------------------------------------------------------------------ */

export const REQUIRED_BY_ROLE: Record<CompletionRole, CompletionField[]> = {
    'temple-admin': ['role', 'phone', 'designation', 'agreedToTerms'],
    'committee-member': ['role', 'phone', 'templeCode', 'village', 'district', 'committee', 'designation', 'agreedToTerms'],
    'family-user': ['role', 'phone', 'templeCode', 'village', 'district', 'postalCode', 'address', 'nic', 'designation', 'agreedToTerms'],
}

/** Fields every portal asks for, whatever the role. */
export const COMMON_FIELDS: CompletionField[] = ['role', 'phone']

/** i18n keys, so the portal and the reminder banner label fields the same way. */
export const FIELD_LABEL_KEY: Record<CompletionField, string> = {
    role: 'complete.fieldRole',
    phone: 'complete.fieldPhone',
    templeCode: 'complete.fieldTemple',
    village: 'complete.fieldVillage',
    district: 'complete.fieldDistrict',
    postalCode: 'complete.fieldPostalCode',
    address: 'complete.fieldAddress',
    nic: 'complete.fieldNic',
    committee: 'complete.fieldCommittee',
    designation: 'complete.fieldDesignation',
    agreedToTerms: 'complete.fieldTerms',
}

/* ------------------------------------------------------------------ */
/* Store                                                              */
/* ------------------------------------------------------------------ */

const listeners = new Set<() => void>()
let cache: ProfileDraft | null | undefined

const read = (): ProfileDraft | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        return {...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<ProfileDraft>)}
    } catch {
        /* private mode or corrupt value - behave as "no draft" */
        return null
    }
}

const write = (draft: ProfileDraft | null) => {
    cache = draft
    try {
        if (draft) localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
        else localStorage.removeItem(STORAGE_KEY)
    } catch {
        /* private mode: the value still lives in `cache` for this session */
    }
    listeners.forEach((listener) => listener())
}

/** Snapshot for useSyncExternalStore - stable between writes. */
export const draftSnapshot = (): ProfileDraft | null => {
    if (cache === undefined) cache = read()
    return cache
}

const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

/* ------------------------------------------------------------------ */
/* Reads                                                              */
/* ------------------------------------------------------------------ */

export const requiredFields = (draft: ProfileDraft): CompletionField[] =>
    draft.role ? REQUIRED_BY_ROLE[draft.role] : COMMON_FIELDS

const isFilled = (draft: ProfileDraft, field: CompletionField): boolean => {
    if (field === 'agreedToTerms') return draft.agreedToTerms === true
    return String(draft[field] ?? '').trim().length > 0
}

export const missingFields = (draft: ProfileDraft | null): CompletionField[] => {
    if (!draft) return []
    return requiredFields(draft).filter((field) => !isFilled(draft, field))
}

export const draftStatus = (draft: ProfileDraft | null): CompletionStatus => {
    if (!draft) return 'complete'
    if (missingFields(draft).length > 0) return draft.skipped ? 'skipped' : 'incomplete'
    return 'complete'
}

export const isProfileReady = (draft: ProfileDraft | null): boolean => draftStatus(draft) === 'complete'

/* ------------------------------------------------------------------ */
/* Writes                                                             */
/* ------------------------------------------------------------------ */

/** Called by the Google / Facebook placeholder once the provider "returns" a profile. */
export const startSocialProfile = (
    provider: SocialProvider,
    profile: { name: string; email: string },
): ProfileDraft => {
    const draft: ProfileDraft = {
        ...EMPTY_DRAFT,
        provider,
        providerName: profile.name,
        providerEmail: profile.email,
        updatedAt: new Date().toISOString(),
    }
    write(draft)
    return draft
}

export const patchDraft = (patch: Partial<ProfileDraft>): ProfileDraft | null => {
    const current = draftSnapshot() ?? {...EMPTY_DRAFT}
    /* Editing any field means the visitor is working on it again - drop the "skipped" flag. */
    const next: ProfileDraft = {...current, ...patch, updatedAt: new Date().toISOString()}
    write(next)
    return next
}

export const markSkipped = (): void => {
    const current = draftSnapshot()
    if (!current) return
    write({...current, skipped: true, updatedAt: new Date().toISOString()})
}

/** Save from the portal: only clears "skipped" when nothing is missing any more. */
export const saveDraft = (patch: Partial<ProfileDraft>): { status: CompletionStatus; missing: CompletionField[] } => {
    const current = draftSnapshot() ?? {...EMPTY_DRAFT}
    const next: ProfileDraft = {...current, ...patch, updatedAt: new Date().toISOString()}
    const missing = missingFields(next)
    write({...next, skipped: missing.length > 0 ? false : next.skipped && false})
    return {status: draftStatus(draftSnapshot()), missing}
}

export const clearDraft = (): void => write(null)

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */

export type ProfileCompletion = {
    draft: ProfileDraft | null
    status: CompletionStatus
    /** True when the account came from a provider and still has gaps. */
    needsAttention: boolean
    missing: CompletionField[]
    /** Fields this role still has to fill, filled or not. */
    required: CompletionField[]
    patch: (patch: Partial<ProfileDraft>) => void
    skip: () => void
    save: (patch?: Partial<ProfileDraft>) => { status: CompletionStatus; missing: CompletionField[] }
    reset: () => void
}

export const useProfileCompletion = (): ProfileCompletion => {
    /*
     * The same snapshot on the server and the client: `read()` swallows a missing localStorage, so
     * server rendering (if it is ever added) and the first client render agree.
     */
    const draft = useSyncExternalStore(subscribe, draftSnapshot, draftSnapshot)
    const status = draftStatus(draft)

    return {
        draft,
        status,
        needsAttention: status !== 'complete',
        missing: missingFields(draft),
        required: draft ? requiredFields(draft) : [],
        patch: (patch) => {
            patchDraft(patch)
        },
        skip: markSkipped,
        save: saveDraft,
        reset: clearDraft,
    }
}