import {type DemoUser, findDemoUser} from '../data/demoUsers'

export type LoginCredentials = {
    identifier: string
    password: string
    remember: boolean
}

const STORAGE_KEY = 'tms.session.user'

export const authService = {
    login: async ({identifier, password, remember}: LoginCredentials): Promise<DemoUser> => {
        await new Promise((resolve) => window.setTimeout(resolve, 450))
        const user = findDemoUser(identifier, password)
        if (!user) throw new Error('That email and password do not match a demo account.')
        try {
            const store = remember ? window.localStorage : window.sessionStorage
            store.setItem(STORAGE_KEY, JSON.stringify(user))
        } catch {
            /* private mode - the session still works for this tab */
        }
        return user
    },

    /** The signed-in user for this tab, or null. */
    current: (): DemoUser | null => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.sessionStorage.getItem(STORAGE_KEY)
            return raw ? (JSON.parse(raw) as DemoUser) : null
        } catch {
            return null
        }
    },

    signOut: () => {
        try {
            window.localStorage.removeItem(STORAGE_KEY)
            window.sessionStorage.removeItem(STORAGE_KEY)
        } catch {
            /* nothing to clear */
        }
    },
}