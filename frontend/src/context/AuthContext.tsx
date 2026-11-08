import {createContext, type ReactNode, useContext, useMemo, useState} from 'react'
import {authService, type LoginCredentials} from '../services/authService'
import type {DemoUser} from '../data/demoUsers'

type AuthContextValue = {
    isSigningIn: boolean
    /** The signed-in demo user, or null before sign-in. */
    user: DemoUser | null
    signIn: (credentials: LoginCredentials) => Promise<DemoUser>
    signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [user, setUser] = useState<DemoUser | null>(() => authService.current())

    const value = useMemo<AuthContextValue>(() => ({
        isSigningIn,
        user,
        signIn: async (credentials) => {
            setIsSigningIn(true)
            try {
                const signedIn = await authService.login(credentials)
                setUser(signedIn)
                return signedIn
            } finally {
                setIsSigningIn(false)
            }
        },
        signOut: () => {
            authService.signOut()
            setUser(null)
        },
    }), [isSigningIn, user])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }

    return context
}