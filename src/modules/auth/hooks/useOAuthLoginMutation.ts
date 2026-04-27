import { useMutation } from '@tanstack/react-query'
import { signIn } from 'next-auth/react'

export function useOAuthLoginMutation(provider: 'google' | 'github') {
    return useMutation({
        mutationFn: async () => {
            // OAuth flow redirects; if it doesn't, still treat as success
            await signIn(provider, { callbackUrl: '/dashboard' })
            return { message: 'Redirecting…' }
        },
    })
}

