import {createContext, type ReactNode, useContext, useMemo, useState} from 'react'
import {authService, type LoginCredentials} from '../services/authService'

type AuthContextValue = {
    isSigningIn: boolean
    signIn: (credentials: LoginCredentials) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [isSigningIn, setIsSigningIn] = useState(false)

    const value = useMemo<AuthContextValue>(() => ({
        isSigningIn,
        signIn: async (credentials) => {
            setIsSigningIn(true)
            try {
                await authService.login(credentials)
            } finally {
                setIsSigningIn(false)
            }
        },
    }), [isSigningIn])

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