import { useQuery } from '@tanstack/react-query'
import { authService } from '../services/authService'

export function useCurrentUserQuery(enabled: boolean = true) {
    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: () => authService.getCurrentUser(),
        enabled,
        retry: false,
    })
}

