import { toast } from 'react-toastify'

export function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error
    if (error && typeof error === 'object') {
        const e = error as Record<string, unknown>
        if (typeof e.message === 'string' && e.message.trim().length > 0) return e.message
        if (typeof e.error === 'string' && e.error.trim().length > 0) return e.error
        return 'Ошибка запроса'
    }
    return 'Ошибка запроса'
}

export function toastError(error: unknown): void {
    toast.error(getErrorMessage(error))
}

export function toastSuccess(message: unknown): void {
    if (typeof message === 'string' && message.trim().length > 0) {
        toast.success(message)
    }
}

