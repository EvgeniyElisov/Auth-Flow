'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { toastError, toastSuccess } from '@/shared/ui/toast'
import { AuthProvider } from '@/modules/auth/providers/AuthProvider'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                queryCache: new QueryCache({
                    onError: (error) => {
                        toastError(error)
                    },
                }),
                mutationCache: new MutationCache({
                    onError: (error) => {
                        toastError(error)
                    },
                    onSuccess: (data) => {
                        if (data && typeof data === 'object' && 'message' in data) {
                            toastSuccess((data as { message?: unknown }).message)
                        }
                    },
                }),
                defaultOptions: {
                    queries: {
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    )
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>{children}</AuthProvider>
                <ToastContainer position="top-right" autoClose={4000} newestOnTop />
            </QueryClientProvider>
        </SessionProvider>
    )
}