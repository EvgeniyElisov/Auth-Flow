import type { HttpMethod } from '@/modules/core/types/common'

export interface ApiOptions<TBody = unknown> {
    method?: HttpMethod
    body?: TBody
    headers?: Record<string, string>
    /**
     * Disable automatic 401 -> refresh -> retry for this request.
     */
    skipAuthRefresh?: boolean
    /**
     * Enable/disable retry-on-401 behavior (default: true).
     * When false, the client will not attempt refresh+retry.
     */
    retryOn401?: boolean
}

export type ApiError = Error & {
    name: 'ApiError'
    status: number
    data?: unknown
}

export function createApiError(message: string, status: number, data?: unknown): ApiError {
    return Object.assign(new Error(message), { name: 'ApiError' as const, status, data })
}

export function isApiError(error: unknown): error is ApiError {
    if (!error || typeof error !== 'object') return false
    const e = error as Record<string, unknown>
    return e.name === 'ApiError' && typeof e.status === 'number'
}

let refreshInFlight: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
    try {
        const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            // важно: чтобы браузер точно отправил/принял cookies
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        })
        return res.ok
    } catch {
        return false
    }
}

async function refreshSessionSingleFlight(): Promise<boolean> {
    if (!refreshInFlight) {
        refreshInFlight = refreshSession().finally(() => {
            refreshInFlight = null
        })
    }
    return refreshInFlight
}

async function parseResponseData(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') || ''
    return contentType.includes('application/json') ? await response.json() : await response.text()
}

function getErrorFromData(data: unknown, status: number): string {
    if (data && typeof data === 'object' && 'error' in data) {
        const errValue = (data as { error?: unknown }).error
        if (typeof errValue === 'string' && errValue.trim().length > 0) return errValue
    }
    return `Ошибка ${status}`
}

const NO_REFRESH_ENDPOINTS = new Set<string>([
    '/auth/refresh',
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/send-verification',
    '/auth/verify-email',
])

export async function apiClient<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    options: ApiOptions<TBody> = {}
): Promise<TResponse> {
    const { method = 'GET', body, headers = {}, skipAuthRefresh = false, retryOn401 = true } = options

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    }

    if (body !== undefined && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(body)
    }

    try {
        const doFetch = async () => fetch(`/api${endpoint}`, { ...config, credentials: 'include' as const })

        let response = await doFetch()

        // 401 -> refresh -> retry once (unless excluded)
        const shouldAttemptRefresh =
            response.status === 401 &&
            retryOn401 &&
            !skipAuthRefresh &&
            !NO_REFRESH_ENDPOINTS.has(endpoint)

        if (shouldAttemptRefresh) {
            const refreshed = await refreshSessionSingleFlight()
            if (refreshed) {
                response = await doFetch()
            }
        }

        const data = await parseResponseData(response)

        if (!response.ok) {
            throw createApiError(getErrorFromData(data, response.status), response.status, data)
        }

        return data as TResponse
    } catch (err: unknown) {
        if (isApiError(err)) throw err
        const message = err instanceof Error ? err.message : 'Ошибка соединения'
        throw createApiError(message, 500)
    }
}