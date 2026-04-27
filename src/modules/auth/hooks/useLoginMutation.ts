import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '../services/authService'

export function useLoginMutation() {
    const router = useRouter()

    return useMutation({
        mutationFn: async (params: { email: string; password: string }) => {
            await authService.login(params.email, params.password)
            return { message: 'Успешный вход' }
        },
        onSuccess: () => {
            router.push('/dashboard')
            router.refresh()
        },
    })
}

