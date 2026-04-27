import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Функция получения реального IP клиента
function getClientIp(headers: Headers): string {
    // 1. Cloudflare
    const cfIp = headers.get('cf-connecting-ip')
    if (cfIp) return cfIp

    // 2. Vercel
    const vercelIp = headers.get('x-vercel-forwarded-for')
    if (vercelIp) {
        const ips = vercelIp.split(',').map(ip => ip.trim())
        return ips[0]
    }

    // 3. X-Real-IP (nginx/common)
    const realIp = headers.get('x-real-ip')
    if (realIp) return realIp

    // 4. X-Forwarded-For — берём ПЕРВЫЙ IP (реальный клиент)
    const forwarded = headers.get('x-forwarded-for')
    if (forwarded) {
        const ips = forwarded.split(',').map(ip => ip.trim())
        return ips[0]
    }

    // 5. Fallback
    return 'unknown'
}

// Инициализация Redis с проверкой env
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const isRateLimitEnabled = !!(redisUrl && redisToken)

let redis: Redis | null = null
let rateLimiter: Ratelimit | null = null

if (isRateLimitEnabled) {
    redis = Redis.fromEnv()
    rateLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        analytics: true,
    })
} else if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Rate limiting is disabled in production. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN')
}

export async function checkRateLimit(headers: Headers): Promise<{ success: boolean; error?: string }> {
    // Если rate limiting отключён
    if (!rateLimiter) {
        return { success: true }
    }

    const ip = getClientIp(headers)

    // Пропускаем неизвестные IP (в проде такого быть не должно)
    if (ip === 'unknown') {
        return { success: true }
    }

    const { success } = await rateLimiter.limit(ip)

    if (!success) {
        return { success: false, error: 'Слишком много попыток. Попробуйте позже.' }
    }

    return { success: true }
}