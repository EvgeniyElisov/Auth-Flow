'use client'

import { createContext, useContext, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useCurrentUserQuery } from '@/modules/auth/hooks/useCurrentUserQuery'
import type { User } from '@/modules/auth/types'

type AuthSource = 'oauth' | 'jwt' | null

type AuthState = {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    source: AuthSource
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const meQuery = useCurrentUserQuery(status !== 'loading' && !session)

    const value = useMemo<AuthState>(() => {
        const user = (session?.user as User | undefined) ?? meQuery.data?.user ?? null
        const isLoading = status === 'loading' || meQuery.isLoading
        const source: AuthSource = session?.user ? 'oauth' : meQuery.data?.user ? 'jwt' : null
        return { user, isAuthenticated: !!user, isLoading, source }
    }, [meQuery.data?.user, meQuery.isLoading, session?.user, status])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthState(): AuthState {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuthState must be used within <AuthProvider />')
    }
    return ctx
}

