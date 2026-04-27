import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'

export function useRegisterMutation() {
    return useMutation({
        mutationFn: (params: { email: string; password: string; name?: string }) => authService.register(params),
    })
}

