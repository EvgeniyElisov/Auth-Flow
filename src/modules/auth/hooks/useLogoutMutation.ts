import { useMutation } from '@tanstack/react-query'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { authService } from '../services/authService'

export function useLogoutMutation() {
    const router = useRouter()

    return useMutation({
        mutationFn: async () => {
            // Invalidate server cookies (JWT refresh/access) if present
            await authService.logout()
            await signOut({ redirect: false })
            return { message: 'Вы вышли из аккаунта' }
        },
        onSuccess: () => {
            router.push('/login')
            router.refresh()
        },
    })
}

