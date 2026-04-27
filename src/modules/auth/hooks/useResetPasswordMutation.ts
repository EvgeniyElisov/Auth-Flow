import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'

export function useResetPasswordMutation() {
    return useMutation({
        mutationFn: async (params: { token: string; password: string }) => {
            const res = await authService.resetPassword(params.token, params.password)
            return { ...res, message: 'Пароль обновлён' }
        },
    })
}

