import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { setTokenCookies } from '@/modules/auth/server/cookies'
import { loginWithPassword } from '@/modules/auth/server/authSession'
import { checkRateLimit } from '@/lib/utils/rateLimit'

export async function POST(request: Request) {
    try {
        // 1. Rate limiting (правильный IP)
        const headersList = await headers()
        const rateLimitResult = await checkRateLimit(headersList)
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: rateLimitResult.error }, { status: 429 })
        }

        // 2. Парсим тело
        const { email, password } = await request.json()

        const result = await loginWithPassword(email, password)
        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: result.status })
        }

        // 7. Устанавливаем cookies и возвращаем ответ
        const response = NextResponse.json({
            success: true,
            user: result.user,
        })
        setTokenCookies(response, result.tokens)

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Ошибка входа' }, { status: 500 })
    }
}