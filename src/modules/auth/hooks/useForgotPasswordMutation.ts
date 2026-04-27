import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'

export function useForgotPasswordMutation() {
    return useMutation({
        mutationFn: async (email: string) => {
            const res = await authService.requestPasswordReset(email)
            return { ...res, message: 'Если email существует, мы отправили письмо' }
        },
    })
}

