import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'

export function useSendVerificationMutation() {
    return useMutation({
        mutationFn: async () => {
            const res = await authService.sendVerificationEmail()
            return { ...res, message: 'Письмо для подтверждения отправлено' }
        },
    })
}

