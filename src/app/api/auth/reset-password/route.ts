import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/utils/rateLimit'
import { resetPasswordSchema } from '@/modules/auth/shared/schemas'
import { resetPassword } from '@/modules/auth/server/passwordReset'
import { ZodError } from 'zod'

export async function POST(request: Request) {
    try {
        // Rate limiting
        const headersList = await headers()
        const rateLimitResult = await checkRateLimit(headersList)
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: rateLimitResult.error }, { status: 429 })
        }

        const body = await request.json()
        const { token, password } = resetPasswordSchema.parse(body)
        const ok = await resetPassword(token, password)
        if (!ok) {
            return NextResponse.json({ error: 'Неверный или истёкший токен' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Reset password error:', error)
        if (error instanceof ZodError) {
            const firstError = error.issues[0]?.message || 'Ошибка валидации'
            return NextResponse.json({ error: firstError }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}